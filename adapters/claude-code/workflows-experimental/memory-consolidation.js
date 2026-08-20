export const meta = {
  name: 'memory-consolidation',
  description: 'Dreaming auditável da memória persistente: acha duplicatas/conflitos/stale, verifica contra fontes, PROPÕE mudanças - nunca muta nada sozinho',
  whenToUse: 'Consolidação periódica (mensal) da memória de um projeto. args: { memoryDir?: "path do dir de memória (default: memória do projeto atual)" }',
  phases: [
    { title: 'Inventory', detail: 'ler índice + achar candidatos' },
    { title: 'Verify', detail: 'checar candidato contra fontes' },
    { title: 'Proposals', detail: 'relatório para aprovação humana' },
  ],
}

// runtime pode entregar args como string JSON - normaliza antes de usar
const A = (typeof args === 'string') ? JSON.parse(args) : (args || {})
const MEM_HINT = A.memoryDir ? 'Diretório de memória: ' + A.memoryDir : 'Use o diretório de memória do projeto atual (MEMORY.md + arquivos .md irmãos).'
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
  'Inventário READ-ONLY da memória persistente. ' + MEM_HINT + '\n' +
  'Leia o MEMORY.md (índice) e liste os arquivos de memória. Ache candidatos a consolidação:\n' +
  '- duplicata: 2+ memórias cobrindo o mesmo fato/lição (nomes ou descrições muito próximos);\n' +
  '- stale: memória sobre trabalho já concluído/mergeado há muito tempo, sem valor futuro, ou que referencia ' +
  'arquivo/flag/PR que não existe mais (verifique 1-2 referências antes de acusar);\n' +
  '- conflito: 2 memórias que se contradizem;\n' +
  '- promover: lição de projeto repetida que merece virar regra global (raro - só com evidência repetida).\n' +
  'NÃO modifique nenhum arquivo. Liste no máximo ' + (CAP_CANDIDATES + 5) + ' candidatos, mais fortes primeiro.',
  { label: 'inventory', phase: 'Inventory', schema: CANDIDATES },
)
if (!inv || inv.candidates.length === 0) return { proposals: [], report: 'Nenhum candidato a consolidação encontrado em ' + (inv ? inv.totalMemories : 0) + ' memórias.' }
const cands = inv.candidates.slice(0, CAP_CANDIDATES)
if (inv.candidates.length > CAP_CANDIDATES) log('DROPADOS ' + (inv.candidates.length - CAP_CANDIDATES) + ' candidatos pelo cap de ' + CAP_CANDIDATES)
log(inv.totalMemories + ' memórias, ' + cands.length + ' candidatos a verificar')

phase('Verify')
const verified = (await parallel(cands.map((c, i) => () =>
  agent(
    'Verifique READ-ONLY este candidato a consolidação de memória:\n' + JSON.stringify(c) + '\n' +
    'Leia os arquivos de memória citados INTEIROS e cheque a alegação contra as fontes (código, git log, arquivos ' +
    'referenciados). confirmed=true só com evidência concreta. proposedAction = ação específica e reversível ' +
    '(ex: "fundir B dentro de A e apagar B", "marcar como resolvido e mover para archive", "atualizar linha X"). ' +
    'História NUNCA é deletada sem rastro - toda proposta preserva o conteúdo em archive ou merge. NÃO execute nada.',
    { label: 'verify:' + (i + 1), phase: 'Verify', schema: VERDICT, effort: 'low' },
  ).then((v) => (v ? { ...c, ...v } : null))))).filter(Boolean)

const confirmed = verified.filter((v) => v.confirmed)
log(confirmed.length + ' de ' + verified.length + ' candidatos confirmados')

// relatório = plumbing -> código (sem agente final sem schema; propostas já estruturadas)
phase('Proposals')
const byKind = {}
for (const p of confirmed) (byKind[p.kind] = byKind[p.kind] || []).push(p)
const sections = Object.keys(byKind).map((k) => k.toUpperCase() + ':\n' +
  byKind[k].map((p) => '- ' + p.files.join(', ') + '\n  motivo: ' + p.reason + '\n  ação proposta: ' + p.proposedAction + '\n  evidência: ' + p.evidence).join('\n'))
const report = 'Consolidação de memória (dreaming) - ' + confirmed.length + ' propostas para APROVAÇÃO HUMANA (nada modificado).\n' +
  (confirmed.length ? sections.join('\n\n') : 'Nenhuma proposta confirmada.') +
  '\n\nToda ação é reversível (fusão/archive, nunca deleção sem rastro). Aprove em bloco ou item a item.'
return { totalMemories: inv.totalMemories, proposals: confirmed, report }
