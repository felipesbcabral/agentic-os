export const meta = {
  name: 'discovery-until-dry',
  description: 'Descoberta de tamanho desconhecido: finders em paralelo por ângulos distintos, dedupe contra tudo visto, verify diverso, para após 2 rodadas secas',
  whenToUse: 'Varreduras onde não se sabe quantos itens existem (bugs, casos não cobertos, inconsistências). args OBRIGATÓRIO: { objective: "o que procurar" , angles?: ["angulo1", ...], maxRounds?: 5 }',
  phases: [
    { title: 'Plan', detail: 'definir ângulos distintos' },
    { title: 'Find', detail: 'finders em paralelo por rodada' },
    { title: 'Verify', detail: '3 lentes por achado fresco' },
  ],
}

// runtime pode entregar args como string JSON - normaliza antes de usar
const A = (typeof args === 'string') ? JSON.parse(args) : (args || {})
if (!A.objective) throw new Error('args.objective obrigatório: o que procurar')
const OBJECTIVE = A.objective
const MAX_ROUNDS = A.maxRounds || 5
const DRY_TARGET = 2
const BUDGET_FLOOR = 40000

const ANGLES_SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: { angles: { type: 'array', items: { type: 'string' }, minItems: 3, maxItems: 5 } },
  required: ['angles'],
}

const ITEMS = {
  type: 'object', additionalProperties: false,
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        properties: {
          key: { type: 'string' },
          file: { type: 'string' },
          line: { type: 'integer' },
          desc: { type: 'string' },
        },
        required: ['key', 'file', 'line', 'desc'],
      },
    },
  },
  required: ['items'],
}

const VERDICT = {
  type: 'object', additionalProperties: false,
  properties: { real: { type: 'boolean' }, reasoning: { type: 'string' } },
  required: ['real', 'reasoning'],
}

phase('Plan')
let angles = A.angles || null
if (!angles) {
  const plan = await agent(
    'Objetivo de descoberta: "' + OBJECTIVE + '" neste repo. Proponha 4 ângulos de busca ' +
    'DISTINTOS entre si (por estrutura, por conteúdo, por convenção, por histórico - o que fizer sentido aqui), ' +
    'cada um em 1 frase acionável. Não execute a busca.',
    { label: 'plan:angles', phase: 'Plan', schema: ANGLES_SCHEMA },
  )
  angles = plan ? plan.angles : ['busca direta pelo objetivo']
}
log('Ângulos: ' + angles.join(' | '))

// medir o que entra no merge e o que volta ao contexto: sem número não há o que otimizar
const estTokens = (o) => Math.ceil(JSON.stringify(o == null ? '' : o).length / 4)

const seen = new Set()
const confirmed = []
let dry = 0
let round = 0

while (dry < DRY_TARGET && round < MAX_ROUNDS) {
  if (budget.total && budget.remaining() < BUDGET_FLOOR) { log('Budget floor atingido, parando'); break }
  round += 1
  const hint = round === 1 ? '' :
    '\nJá encontrados (NÃO repita, ache o que falta): ' + Array.from(seen).slice(0, 80).join(', ')

  const found = (await parallel(angles.map((a, i) => () =>
    agent(
      'Rodada ' + round + '. Procure no repo atual: "' + OBJECTIVE + '".\n' +
      'Seu ângulo EXCLUSIVO: ' + a + '\n' +
      'Cada item: key estável (arquivo:linha ou identificador único), file, line, desc de 1 frase com evidência.' + hint,
      { label: 'find:r' + round + ':a' + (i + 1), phase: 'Find', schema: ITEMS, effort: 'low' },
    )))).filter(Boolean).flatMap((r) => r.items)

  // --- Reduce (código, 0 token): dedupe DENTRO da rodada também, não só contra o já visto.
  // Sem isto, 3 ângulos que acham a mesma key nova pagam 3 x 3 lentes = 9 verifies pelo mesmo item.
  // Quantos ângulos independentes acharam o item é SINAL (vai no output), não ruído a descartar.
  const byKey = new Map()
  let dupInRound = 0
  let alreadySeen = 0
  for (const b of found) {
    if (!b || !b.key) continue
    if (seen.has(b.key)) { alreadySeen += 1; continue }
    const hit = byKey.get(b.key)
    if (hit) { hit.agreement += 1; dupInRound += 1; continue }
    byKey.set(b.key, { ...b, agreement: 1 })
  }
  const fresh = Array.from(byKey.values())
  const rawTok = estTokens(found)
  log('Rodada ' + round + ': ' + found.length + ' brutos (~' + rawTok + ' tok) -> ' + fresh.length + ' frescos (~' +
    estTokens(fresh) + ' tok) | ' + dupInRound + ' duplicatas entre ângulos, ' + alreadySeen + ' já vistos')
  if (!fresh.length) { dry += 1; continue }
  dry = 0
  fresh.forEach((b) => seen.add(b.key))

  const judged = await parallel(fresh.map((b) => () =>
    parallel(['correto (o item existe mesmo, na linha citada)', 'novo (não é duplicata disfarçada de item já visto)', 'no escopo do objetivo'].map((lens) => () =>
      agent(
        'Julgue pela lente "' + lens + '" - responda real=true só se passar nela.\nItem: ' + JSON.stringify(b) +
        '\nObjetivo: ' + OBJECTIVE + '\nLeia o arquivo citado antes de responder. Em dúvida, real=false.',
        { label: 'verify:' + b.key, phase: 'Verify', schema: VERDICT, effort: 'low' },
      )))
      // votos preservados: "2/3 lentes" distingue achado sólido de achado no limite
      .then((vs) => {
        const cast = vs.filter(Boolean)
        const yes = cast.filter((v) => v.real).length
        return { b: { ...b, verifyVotes: yes + '/' + cast.length, round }, real: yes >= 2 }
      })))

  confirmed.push(...judged.filter(Boolean).filter((v) => v.real).map((v) => v.b))
}

if (round >= MAX_ROUNDS && dry < DRY_TARGET) log('Parou por cap de ' + MAX_ROUNDS + ' rodadas SEM secar - pode haver mais itens')
log('Retorno ao contexto: ' + confirmed.length + ' itens (~' + estTokens(confirmed) + ' tok) de ' + seen.size + ' únicos vistos')
return { confirmed, totalSeen: seen.size, rounds: round, driedOut: dry >= DRY_TARGET }
