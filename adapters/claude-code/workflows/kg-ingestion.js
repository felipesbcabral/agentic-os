export const meta = {
  name: 'kg-ingestion',
  description: 'Pipeline do PDF: extrai entidades+relacoes SPO de documentos (Haiku), resolve aliases por tipo (Sonnet), monta grafo com proveniencia, amostra humana. Escreve UM artefato JSON.',
  whenToUse: 'Construir um knowledge graph SEMANTICO a partir de documentos de texto (notas, specs, docs) - distinto do graphify (grafo de codigo). args: { paths: ["arquivo1", ...] OU glob: "padrao", outFile: "destino .json", incremental?: bool }',
  phases: [
    { title: 'Extract', detail: 'entidades+SPO por doc (barato)' },
    { title: 'Resolve', detail: 'clusteriza aliases por tipo' },
    { title: 'Assemble', detail: 'grafo + proveniencia + diagnostico' },
    { title: 'Sample', detail: 'amostra humana nodo-vs-fonte' },
  ],
}

// runtime pode entregar args como string JSON - normaliza antes de usar
const A = (typeof args === 'string') ? JSON.parse(args) : (args || {})
if (!A.paths && !A.glob) throw new Error('args.paths (lista) ou args.glob obrigatorio: quais documentos ingerir')
const OUT = A.outFile || 'kg-out.json'
const CAP_DOCS = A.maxDocs || 60

// medir a entrada do merge: sem numero, "o reducer ajudou" e opiniao
const estTokens = (o) => Math.ceil(JSON.stringify(o == null ? '' : o).length / 4)

const DOCLIST = {
  type: 'object', additionalProperties: false,
  properties: { files: { type: 'array', items: { type: 'string' } } },
  required: ['files'],
}

const EXTRACTED = {
  type: 'object', additionalProperties: false,
  properties: {
    entities: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        properties: {
          name: { type: 'string' },
          type: { type: 'string' },
          description: { type: 'string' },
        },
        required: ['name', 'type', 'description'],
      },
    },
    relations: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        properties: {
          source: { type: 'string' },
          predicate: { type: 'string' },
          target: { type: 'string' },
          excerpt: { type: 'string' },
        },
        required: ['source', 'predicate', 'target', 'excerpt'],
      },
    },
  },
  required: ['entities', 'relations'],
}

const CLUSTERS = {
  type: 'object', additionalProperties: false,
  properties: {
    clusters: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        properties: {
          canonical: { type: 'string' },
          aliases: { type: 'array', items: { type: 'string' } },
        },
        required: ['canonical', 'aliases'],
      },
    },
  },
  required: ['clusters'],
}

const AUDIT = {
  type: 'object', additionalProperties: false,
  properties: {
    node: { type: 'string' },
    supportedBySource: { type: 'boolean' },
    note: { type: 'string' },
  },
  required: ['node', 'supportedBySource', 'note'],
}

// --- Scope: descobrir documentos ---
phase('Extract')
let files = A.paths || null
if (!files) {
  const listed = await agent(
    'Liste os arquivos que casam com o glob "' + A.glob + '" a partir da raiz do repo (use Glob). Retorne caminhos relativos.',
    { label: 'scope:docs', phase: 'Extract', schema: DOCLIST },
  )
  files = listed ? listed.files : []
}
if (files.length === 0) return { report: 'Nenhum documento encontrado.' }
if (files.length > CAP_DOCS) { log('DROPADOS ' + (files.length - CAP_DOCS) + ' docs pelo cap de ' + CAP_DOCS); files = files.slice(0, CAP_DOCS) }
log('Ingerindo ' + files.length + ' documentos')

// --- Extract: 1 agente barato por doc (fan-out), proveniencia = arquivo ---
const perDoc = (await parallel(files.map((f, i) => () =>
  agent(
    'Extraia um knowledge graph do documento em "' + f + '" (leia o arquivo).\n' +
    'Regras (do playbook): (1) so entidades CENTRAIS ao documento, pule mencoes incidentais; (2) cada entidade com ' +
    'descricao de 1 frase ANCORADA neste doc (e o sinal de desambiguacao); (3) predicados = verbo curto ' +
    '("comanda", "depende de", "parte de"); (4) toda relacao conecta duas entidades extraidas; (5) excerpt = trecho ' +
    'curto do doc que suporta a relacao (proveniencia).',
    { label: 'extract:' + (i + 1), phase: 'Extract', schema: EXTRACTED, model: 'haiku', effort: 'low' },
  ).then((r) => (r ? { file: f, ...r } : null))))).filter(Boolean)

// edge = codigo: agrupa entidades por tipo, cada uma carrega origem
const byType = {}
const rawRelations = []
for (const doc of perDoc) {
  for (const e of doc.entities) {
    (byType[e.type] = byType[e.type] || []).push({ name: e.name, description: e.description, file: doc.file })
  }
  for (const r of doc.relations) rawRelations.push({ ...r, file: doc.file })
}
const totalRawEntities = Object.values(byType).reduce((a, l) => a + l.length, 0)
log('Extraidos ' + totalRawEntities + ' entidades brutas, ' + rawRelations.length + ' relacoes, ' + Object.keys(byType).length + ' tipos')

// --- Resolve: 1 agente por TIPO (blocking barato por tipo), aliases -> canonical ---
phase('Resolve')
const types = Object.keys(byType)
const resolvedByType = await parallel(types.map((t) => () => {
  const list = byType[t]
  // dedup exato por nome antes de mandar ao modelo (edge = codigo)
  const uniq = {}
  for (const e of list) { (uniq[e.name] = uniq[e.name] || { name: e.name, descriptions: [], files: [] }); uniq[e.name].descriptions.push(e.description); uniq[e.name].files.push(e.file) }
  const names = Object.values(uniq)
  if (names.length <= 1) return Promise.resolve({ type: t, clusters: names.map((n) => ({ canonical: n.name, aliases: [n.name] })) })
  return agent(
    'Entidades do tipo "' + t + '" extraidas de varios documentos. Algumas sao formas de superficie DIFERENTES da ' +
    'MESMA entidade real. Agrupe. Cada nome de entrada aparece em EXATAMENTE um cluster (aliases). Entidades ' +
    'genuinamente distintas viram cluster de 1 elemento (fallback singleton - nao perca nome). Use as descricoes ' +
    'para NAO fundir entidades que so compartilham nome. canonical = forma mais completa e inequivoca.\n' +
    'Entradas (nome + descricoes):\n' + JSON.stringify(names.map((n) => ({ name: n.name, desc: n.descriptions.slice(0, 3) }))),
    { label: 'resolve:' + t, phase: 'Resolve', schema: CLUSTERS },
  ).then((c) => ({ type: t, clusters: c ? c.clusters : names.map((n) => ({ canonical: n.name, aliases: [n.name] })) }))
}))

// alias map + fallback singleton (nome nao clusterizado nao some)
const aliasMap = {}
const canonicalSet = new Set()
for (const rt of resolvedByType.filter(Boolean)) {
  for (const c of rt.clusters) { canonicalSet.add(c.canonical); for (const a of c.aliases) aliasMap[a] = c.canonical }
  for (const e of byType[rt.type]) if (!(e.name in aliasMap)) { aliasMap[e.name] = e.name; canonicalSet.add(e.name); log('Singleton fallback: ' + e.name) }
}
const compression = totalRawEntities > 0 ? (Object.keys(aliasMap).length / canonicalSet.size).toFixed(2) : '0'
log('Resolvido: ' + Object.keys(aliasMap).length + ' formas -> ' + canonicalSet.size + ' canonicos (compressao ' + compression + 'x)')

// --- Assemble: reescreve endpoints, dedup de edges, diagnostico (tudo codigo) ---
phase('Assemble')
const canon = (n) => aliasMap[n] || n
const edgeSet = new Map()
for (const r of rawRelations) {
  const s = canon(r.source), t = canon(r.target)
  if (!canonicalSet.has(s) || !canonicalSet.has(t)) continue // sem orfao
  const key = s + '|' + r.predicate + '|' + t
  if (!edgeSet.has(key)) edgeSet.set(key, { source: s, predicate: r.predicate, target: t, sources: [] })
  edgeSet.get(key).sources.push({ file: r.file, excerpt: r.excerpt })
}
const edges = Array.from(edgeSet.values())
const degree = {}
for (const e of edges) { degree[e.source] = (degree[e.source] || 0) + 1; degree[e.target] = (degree[e.target] || 0) + 1 }
const nodes = Array.from(canonicalSet).map((c) => ({ id: c, degree: degree[c] || 0 }))
const hubs = nodes.slice().sort((a, b) => b.degree - a.degree).slice(0, 10)
const density = nodes.length > 0 ? (edges.length / nodes.length).toFixed(2) : '0'
log('Grafo: ' + nodes.length + ' nodes, ' + edges.length + ' edges, densidade ' + density)
const rawTok = estTokens(perDoc)
const kgTok = estTokens({ nodes, edges })
log('Reducer: ~' + rawTok + ' tok brutos dos ' + perDoc.length + ' extratores -> ~' + kgTok + ' tok no grafo' +
  (rawTok > 0 ? ' (-' + Math.round((1 - kgTok / rawTok) * 100) + '%)' : '') +
  '; ' + rawRelations.length + ' relacoes brutas -> ' + edges.length + ' edges unicas')

// escreve o artefato UNICO (via agente com Write - runtime nao da fs direto)
const kg = { schema_version: 1, generated_from: files.length + ' docs', nodes, edges, aliasMap, hubs, metrics: { rawEntities: totalRawEntities, canonicalEntities: canonicalSet.size, edges: edges.length, compression, density } }
await agent(
  'Escreva EXATAMENTE este conteudo JSON no arquivo "' + OUT + '" (use Write, sem alterar nada):\n' +
  JSON.stringify(kg, null, 2).slice(0, 100000),
  { label: 'persist', phase: 'Assemble' },
)

// --- Sample: amostra humana determinsitica (top hubs) ---
phase('Sample')
const toAudit = hubs.slice(0, 5)
const audits = (await parallel(toAudit.map((h, i) => () =>
  agent(
    'Auditoria nodo-vs-fonte do KG recem-construido. Node canonico: "' + h.id + '" (grau ' + h.degree + ').\n' +
    'As edges deste node e suas proveniencias:\n' +
    JSON.stringify(edges.filter((e) => e.source === h.id || e.target === h.id).slice(0, 8)) + '\n' +
    'Abra 1-2 dos arquivos de proveniencia e confirme se as relacoes sao suportadas pelo texto. ' +
    'supportedBySource + note (o que bate / o que nao bate).',
    { label: 'sample:' + (i + 1), phase: 'Sample', schema: AUDIT, effort: 'low' },
  )))).filter(Boolean)
const unsupported = audits.filter((a) => !a.supportedBySource)

// relatorio = plumbing -> codigo (sem agente final sem schema)
const health = unsupported.length === 0 ? 'amostra 100% suportada pela fonte' : unsupported.length + ' de ' + audits.length + ' nodes amostrados SEM suporte na fonte'
const report = 'KG ingerido -> ' + OUT + '\n' +
  'metricas: ' + kg.metrics.canonicalEntities + ' entidades canonicas, ' + kg.metrics.edges + ' edges, ' +
  'compressao ' + kg.metrics.compression + 'x, densidade ' + kg.metrics.density + '\n' +
  'top hubs: ' + hubs.map((h) => h.id + '(' + h.degree + ')').join(', ') + '\n' +
  'amostra humana: ' + health
return { outFile: OUT, metrics: kg.metrics, hubs, audits, unsupportedSample: unsupported.length, report }
