export const meta = {
  name: 'memory-consolidation',
  description: 'Dreaming auditavel da memoria persistente: acha duplicatas/conflitos/stale, verifica contra fontes, PROPOE mudancas - nunca muta nada sozinho',
  whenToUse: 'Consolidacao periodica (mensal) da memoria de um projeto. args: { memoryDir?: "path do dir de memoria (default: memoria do projeto atual)" }',
  phases: [
    { title: 'Inventory', detail: 'ler indice + achar candidatos' },
    { title: 'Verify', detail: 'checar candidato contra fontes' },
    { title: 'Proposals', detail: 'relatorio para aprovacao humana' },
  ],
}

// runtime pode entregar args como string JSON - normaliza antes de usar
const A = (typeof args === 'string') ? JSON.parse(args) : (args || {})
const MEM_HINT = A.memoryDir ? 'Diretorio de memoria: ' + A.memoryDir : 'Use o diretorio de memoria do projeto atual (MEMORY.md + arquivos .md irmaos).'
const CAP_CANDIDATES = 15

const CANDIDATES = {
  type: 'object', additionalProperties: false,
  properties: {
    totalMemories: { type: 'integer' },
    candidates: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        properties: {
          kind: { type: 'string', enum: ['duplicata', 'stale', 'conflito', 'promover'] },
          files: { type: 'array', items: { type: 'string' } },
          reason: { type: 'string' },
        },
        required: ['kind', 'files', 'reason'],
      },
    },
  },
  required: ['totalMemories', 'candidates'],
}

const VERDICT = {
  type: 'object', additionalProperties: false,
  properties: {
    confirmed: { type: 'boolean' },
    evidence: { type: 'string' },
    proposedAction: { type: 'string' },
  },
  required: ['confirmed', 'evidence', 'proposedAction'],
}

phase('Inventory')
const inv = await agent(
  'Inventario READ-ONLY da memoria persistente. ' + MEM_HINT + '\n' +
  'Leia o MEMORY.md (indice) e liste os arquivos de memoria. Ache candidatos a consolidacao:\n' +
  '- duplicata: 2+ memorias cobrindo o mesmo fato/licao (nomes ou descricoes muito proximos);\n' +
  '- stale: memoria sobre trabalho ja concluido/mergeado ha muito tempo, sem valor futuro, ou que referencia ' +
  'arquivo/flag/PR que nao existe mais (verifique 1-2 referencias antes de acusar);\n' +
  '- conflito: 2 memorias que se contradizem;\n' +
  '- promover: licao de projeto repetida que merece virar regra global (raro - so com evidencia repetida).\n' +
  'NAO modifique nenhum arquivo. Liste no maximo ' + (CAP_CANDIDATES + 5) + ' candidatos, mais fortes primeiro.',
  { label: 'inventory', phase: 'Inventory', schema: CANDIDATES },
)
if (!inv || inv.candidates.length === 0) return { proposals: [], report: 'Nenhum candidato a consolidacao encontrado em ' + (inv ? inv.totalMemories : 0) + ' memorias.' }
const cands = inv.candidates.slice(0, CAP_CANDIDATES)
if (inv.candidates.length > CAP_CANDIDATES) log('DROPADOS ' + (inv.candidates.length - CAP_CANDIDATES) + ' candidatos pelo cap de ' + CAP_CANDIDATES)
log(inv.totalMemories + ' memorias, ' + cands.length + ' candidatos a verificar')

phase('Verify')
const verified = (await parallel(cands.map((c, i) => () =>
  agent(
    'Verifique READ-ONLY este candidato a consolidacao de memoria:\n' + JSON.stringify(c) + '\n' +
    'Leia os arquivos de memoria citados INTEIROS e cheque a alegacao contra as fontes (codigo, git log, arquivos ' +
    'referenciados). confirmed=true so com evidencia concreta. proposedAction = acao especifica e reversivel ' +
    '(ex: "fundir B dentro de A e apagar B", "marcar como resolvido e mover para archive", "atualizar linha X"). ' +
    'Historia NUNCA e deletada sem rastro - toda proposta preserva o conteudo em archive ou merge. NAO execute nada.',
    { label: 'verify:' + (i + 1), phase: 'Verify', schema: VERDICT, effort: 'low' },
  ).then((v) => (v ? { ...c, ...v } : null))))).filter(Boolean)

const confirmed = verified.filter((v) => v.confirmed)
log(confirmed.length + ' de ' + verified.length + ' candidatos confirmados')

// relatorio = plumbing -> codigo (sem agente final sem schema; propostas ja estruturadas)
phase('Proposals')
const byKind = {}
for (const p of confirmed) (byKind[p.kind] = byKind[p.kind] || []).push(p)
const sections = Object.keys(byKind).map((k) => k.toUpperCase() + ':\n' +
  byKind[k].map((p) => '- ' + p.files.join(', ') + '\n  motivo: ' + p.reason + '\n  acao proposta: ' + p.proposedAction + '\n  evidencia: ' + p.evidence).join('\n'))
const report = 'Consolidacao de memoria (dreaming) - ' + confirmed.length + ' propostas para APROVACAO HUMANA (nada modificado).\n' +
  (confirmed.length ? sections.join('\n\n') : 'Nenhuma proposta confirmada.') +
  '\n\nToda acao e reversivel (fusao/archive, nunca delecao sem rastro). Aprove em bloco ou item a item.'
return { totalMemories: inv.totalMemories, proposals: confirmed, report }
