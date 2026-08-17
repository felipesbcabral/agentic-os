export const meta = {
  name: 'adversarial-review',
  description: 'Review adversarial de um diff: roteia por tamanho, lentes paralelas distintas, ceticos tentam matar cada finding antes do relatorio',
  whenToUse: 'Revisar diff/branch/PR com mais confianca que uma passada unica, em qualquer repo. args: { range?: "git range (default HEAD nao commitado + staged)", focus?: "atencao extra" }',
  phases: [
    { title: 'Scope', detail: 'medir o diff e rotear' },
    { title: 'Review', detail: 'lentes paralelas' },
    { title: 'Verify', detail: 'ceticos por finding' },
    { title: 'Synthesize', detail: 'rankear sobreviventes' },
  ],
}

// runtime pode entregar args como string JSON - normaliza antes de usar
const A = (typeof args === 'string') ? JSON.parse(args) : (args || {})
const RANGE = A.range || ''
const FOCUS = A.focus ? '\nAtencao extra pedida pelo usuario: ' + A.focus : ''
const DIFF_CMD = RANGE ? 'git diff ' + RANGE : 'git diff HEAD'
const MAX_VERIFIED = 20

const SCOPE = {
  type: 'object', additionalProperties: false,
  properties: {
    addedLines: { type: 'integer' },
    files: { type: 'array', items: { type: 'string' } },
    summary: { type: 'string' },
  },
  required: ['addedLines', 'files', 'summary'],
}

const FINDINGS = {
  type: 'object', additionalProperties: false,
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        properties: {
          file: { type: 'string' },
          line: { type: 'integer' },
          severity: { type: 'string', enum: ['high', 'medium', 'low'] },
          title: { type: 'string' },
          evidence: { type: 'string' },
        },
        required: ['file', 'line', 'severity', 'title', 'evidence'],
      },
    },
  },
  required: ['findings'],
}

const VERDICT = {
  type: 'object', additionalProperties: false,
  properties: {
    refuted: { type: 'boolean' },
    reasoning: { type: 'string' },
  },
  required: ['refuted', 'reasoning'],
}

// --- REDUCER (edge = codigo puro, 0 token) -------------------------------------
// Lentes independentes acham o MESMO defeito. Sem reducer, cada duplicata paga um
// verify inteiro (ate 3 ceticos) e o relatorio faz o leitor redescobrir o acordo.
// Testado em ~/.claude/workflows/tests/ (reducer.test.mjs: 19 casos, inclui false-merge
// e acento; workflow.harness.mjs: roda este script com agentes falsos). `node <arquivo>`.
const RANK = { high: 0, alto: 0, medium: 1, medio: 1, low: 2, baixo: 2 }
const STOP = new Set(['de', 'da', 'do', 'em', 'no', 'na', 'com', 'sem', 'para', 'por', 'que', 'uma', 'the', 'and', 'for', 'with', 'not', 'of', 'in', 'to', 'is'])

const tokens = (s) => {
  const nfd = String(s == null ? '' : s).toLowerCase().normalize('NFD')
  let out = ''
  for (let i = 0; i < nfd.length; i++) {
    const c = nfd.charCodeAt(i)
    if ((c >= 97 && c <= 122) || (c >= 48 && c <= 57)) out += nfd[i]
    else if (c < 128) out += ' '
    // c >= 128 = marca de acento decomposta pelo NFD: some sem quebrar a palavra
  }
  return new Set(out.split(' ').filter((w) => w.length > 2 && !STOP.has(w)))
}

const jaccard = (a, b) => {
  if (a.size === 0 || b.size === 0) return 0
  let inter = 0
  for (const t of a) if (b.has(t)) inter += 1
  return inter / (a.size + b.size - inter)
}

const estTokens = (o) => Math.ceil(JSON.stringify(o == null ? '' : o).length / 4)

// Funde so o MESMO file:line com titulos que concordam. O false-merge (dois defeitos
// distintos na mesma linha virando um) e contido por: semente de tokens FIXA (sem merge
// em cadeia) + log de TODA fusao, para a fusao errada aparecer no run em vez de sumir.
const SIM = 0.5
const reduceFindings = (findings, onMerge) => {
  const groups = []
  for (const f of (findings || [])) {
    if (!f || !f.file) continue
    const tk = tokens(f.title + ' ' + (f.evidence || ''))
    const hit = groups.find((g) => g.file === f.file && g.line === f.line && jaccard(g.seed, tk) >= SIM)
    if (hit) hit.members.push(f)
    else groups.push({ file: f.file, line: f.line, seed: tk, members: [f] })
  }
  return groups.map((g) => {
    const best = g.members.slice().sort((a, b) => (RANK[a.severity] ?? 3) - (RANK[b.severity] ?? 3))[0]
    const lenses = Array.from(new Set(g.members.map((m) => m.lens).filter(Boolean)))
    const severities = Array.from(new Set(g.members.map((m) => m.severity)))
    if (g.members.length > 1 && onMerge) onMerge(g)
    return {
      ...best,
      agreement: g.members.length,
      lenses,
      disagreement: severities.length > 1 ? severities.join(' vs ') : '',
    }
  })
}
// -------------------------------------------------------------------------------

phase('Scope')
const scope = await agent(
  'Rode `' + DIFF_CMD + ' --stat` no repo atual e reporte: total de linhas adicionadas, ' +
  'lista de arquivos tocados, resumo de 1 linha do que a mudanca faz. Nao revise nada ainda.',
  { label: 'scope:diff', phase: 'Scope', schema: SCOPE },
)
if (!scope || scope.files.length === 0) return { confirmed: [], report: 'Diff vazio para ' + DIFF_CMD }
log('Diff: ' + scope.addedLines + ' linhas em ' + scope.files.length + ' arquivos')

const LENS_DEFS = [
  { key: 'correctness', prompt: 'logica errada, edge case quebrado, null mascarado com default silencioso, off-by-one, condicao invertida' },
  { key: 'security', prompt: 'authz faltando em rota/endpoint novo, input de fronteira sem validacao, SQL raw concatenado, segredo em codigo' },
  { key: 'performance', prompt: 'query/IO dentro de loop, N+1, trabalho repetido, estrutura de dados errada pro acesso' },
  { key: 'simplicity', prompt: 'abstracao desnecessaria, codigo que nao precisava existir, complexidade que esconde a intencao (YAGNI)' },
]

const reviewLens = (lens) => agent(
  'Voce revisa um diff SOMENTE pela lente "' + lens.key + '" (' + lens.prompt + ').\n' +
  'Rode `' + DIFF_CMD + '` no repo atual, leia o contexto dos arquivos quando precisar.\n' +
  'Reporte no maximo 8 findings REAIS (nao estilo), cada um com file, line (1-indexed no arquivo atual), ' +
  'severity, title curto e evidence concreta (por que quebra, com que input).' + FOCUS,
  { label: 'review:' + lens.key, phase: 'Review', schema: FINDINGS },
)

const verifyFinding = async (f) => {
  const votes = (f.severity === 'high') ? 3 : 1
  const verdicts = await parallel(Array.from({ length: votes }, (_, i) => () =>
    agent(
      'Voce e um cetico independente (voto ' + (i + 1) + '). Tente REFUTAR este finding de code review:\n' +
      JSON.stringify(f) + '\n' +
      'Leia o arquivo citado na linha citada (Read/Grep). Refute se: a linha nao existe, o cenario de falha ' +
      'nao e alcancavel, ja existe guard, ou e pre-existente e nao foi tocado pelo diff (`' + DIFF_CMD + '`). ' +
      'Em duvida, refuted=true.',
      { label: 'verify:' + f.file, phase: 'Verify', schema: VERDICT, effort: 'low' },
    )))
  const alive = verdicts.filter(Boolean).filter((v) => !v.refuted).length
  const cast = verdicts.filter(Boolean).length
  const needed = votes === 3 ? 2 : 1
  // votos preservados: "sobreviveu 2/3" e informacao para quem le, nao ruido a descartar
  return { ...f, survived: alive >= needed, votesAlive: alive, votesCast: cast }
}

// Barreira DELIBERADA nas lentes: o reducer precisa do conjunto completo antes do verify.
// E o caso que o runtime lista como barreira legitima (dedupe antes de estagio caro): perde-se
// o inicio antecipado do verify da lente mais rapida, evita-se pagar 2-4 verifies pelo mesmo defeito.
let raw = []
if (scope.addedLines < 150) {
  log('Diff pequeno (<150 linhas): passada unica + verify')
  const single = await agent(
    'Revise o diff (`' + DIFF_CMD + '`) por correcao, seguranca, performance e simplicidade. ' +
    'No maximo 10 findings reais com file/line/severity/title/evidence.' + FOCUS,
    { label: 'review:single', phase: 'Review', schema: FINDINGS },
  )
  raw = (single ? single.findings : [])
} else {
  log('Diff grande: 4 lentes em paralelo, reducer entre elas e o verify')
  const perLens = await parallel(LENS_DEFS.map((lens) => () => reviewLens(lens).then((r) => ({ lens, r }))))
  const done = perLens.filter((p) => p && p.r)
  if (done.length < LENS_DEFS.length) log('FALTARAM ' + (LENS_DEFS.length - done.length) + ' de ' + LENS_DEFS.length + ' lentes; resultado PARCIAL')
  raw = done.flatMap((p) => {
    const found = p.r.findings || []
    if (found.length > 10) log('Lente ' + p.lens.key + ' dropou ' + (found.length - 10) + ' findings por cap de 10')
    return found.slice(0, 10).map((f) => ({ ...f, lens: p.lens.key }))
  })
}

// --- Reduce: dedupe + acordo, tudo em codigo, ANTES de gastar cetico ---
const reduced = reduceFindings(raw, (g) => log('dedupe ' + g.file + ':' + g.line + ' - ' + g.members.length +
  ' achados -> 1 [' + g.members.map((m) => (m.lens || '?') + ': ' + m.title).join(' | ') + ']'))
const rawTok = estTokens(raw)
const redTok = estTokens(reduced)
log('Reducer: ' + raw.length + ' achados brutos (~' + rawTok + ' tok) -> ' + reduced.length + ' unicos (~' + redTok + ' tok)' +
  (rawTok > 0 ? ', -' + Math.round((1 - redTok / rawTok) * 100) + '%' : ''))
if (reduced.length === 0) return { confirmed: [], killed: 0, report: 'Nenhum finding para verificar. Diff: ' + scope.summary }
const toVerify = reduced.slice(0, MAX_VERIFIED)
if (reduced.length > MAX_VERIFIED) log('DROPADOS ' + (reduced.length - MAX_VERIFIED) + ' achados unicos pelo cap de ' + MAX_VERIFIED)

phase('Verify')
const results = (await parallel(toVerify.map((f) => () => verifyFinding(f)))).filter(Boolean)
const confirmed = results.filter((r) => r.survived)
const killed = results.length - confirmed.length
log(confirmed.length + ' findings confirmados, ' + killed + ' mortos pelos ceticos')

// relatorio = plumbing (formatar findings ja estruturados) -> codigo, nao agente.
// agente sem schema no passo final trava o runtime; alem disso viola "agent so para julgamento".
phase('Synthesize')
if (confirmed.length === 0) return { confirmed: [], killed, report: 'Nenhum finding sobreviveu ao verify. Diff: ' + scope.summary }
const sorted = confirmed.slice().sort((a, b) =>
  ((RANK[a.severity] ?? 3) - (RANK[b.severity] ?? 3)) || ((b.agreement || 1) - (a.agreement || 1)))
const lines = sorted.map((f) => {
  const lens = (f.lenses && f.lenses.length) ? ' (' + f.lenses.join('+') + ')' : ''
  const agree = (f.agreement > 1) ? '\n  acordo: ' + f.agreement + ' lentes independentes acharam o mesmo defeito' : ''
  const disc = f.disagreement ? '\n  DISCORDANCIA de severidade entre lentes: ' + f.disagreement : ''
  const votes = (f.votesCast > 1) ? '\n  ceticos: sobreviveu ' + f.votesAlive + '/' + f.votesCast : ''
  return '- [' + f.severity + ']' + lens + ' ' + f.file + ':' + f.line + ' - ' + f.title + '\n  ' + f.evidence + agree + disc + votes
})
const report = 'Code review: ' + confirmed.length + ' confirmados, ' + killed + ' mortos pelo verify' +
  ' (reducer: ' + raw.length + ' brutos -> ' + reduced.length + ' unicos).\n' + lines.join('\n')
log('Retorno ao contexto: ~' + estTokens({ confirmed: sorted, report }) + ' tok')
return { confirmed: sorted, killed, rawFindings: raw.length, uniqueFindings: reduced.length, report }
