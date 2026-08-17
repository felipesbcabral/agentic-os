export const meta = {
  name: 'dependency-waves',
  description: 'PLANEJADOR de ondas a partir de tickets com blockedBy: valida o DAG (ciclos, deps faltantes), produz ordem topologica em ondas. NAO executa, NAO toca git, NAO cria PR - so o plano para aprovacao humana.',
  whenToUse: 'Transformar tickets com dependencias explicitas (blockedBy) em ondas de execucao paralela. args: { tickets: [{id, title, blockedBy:[], points?}], OU ticketsFile: "path .json" }. A EXECUCAO de cada onda (worktree/agente/PR/merge) e disparada por humano depois, nunca por este grafo.',
  phases: [
    { title: 'Load', detail: 'ler tickets' },
    { title: 'Validate', detail: 'ciclos + deps faltantes + qualidade' },
    { title: 'Plan', detail: 'ondas topologicas + prompts' },
  ],
}

// runtime pode entregar args como string JSON - normaliza antes de usar
const A = (typeof args === 'string') ? JSON.parse(args) : (args || {})

const TICKETS = {
  type: 'object', additionalProperties: false,
  properties: {
    tickets: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          blockedBy: { type: 'array', items: { type: 'string' } },
          points: { type: 'integer' },
        },
        required: ['id', 'title', 'blockedBy'],
      },
    },
  },
  required: ['tickets'],
}

const QUALITY = {
  type: 'object', additionalProperties: false,
  properties: {
    ticketId: { type: 'string' },
    executableAsPrompt: { type: 'boolean' },
    missing: { type: 'array', items: { type: 'string' } },
  },
  required: ['ticketId', 'executableAsPrompt', 'missing'],
}

// --- Load ---
phase('Load')
let tickets = A.tickets || null
if (!tickets && A.ticketsFile) {
  const loaded = await agent(
    'Leia o arquivo "' + A.ticketsFile + '" e retorne os tickets como JSON estruturado (id, title, blockedBy lista, points se houver).',
    { label: 'load', phase: 'Load', schema: TICKETS },
  )
  tickets = loaded ? loaded.tickets : null
}
if (!tickets || tickets.length === 0) throw new Error('args.tickets ou args.ticketsFile obrigatorio (lista de tickets com blockedBy)')
log(tickets.length + ' tickets carregados')

// --- Validate: DAG em codigo (deteccao de ciclo + deps faltantes = deterministico) ---
phase('Validate')
const ids = new Set(tickets.map((t) => t.id))
const missingDeps = []
for (const t of tickets) for (const b of (t.blockedBy || [])) if (!ids.has(b)) missingDeps.push({ ticket: t.id, missing: b })

// Kahn: se sobrar node com grau de entrada > 0, ha ciclo
const indeg = {}, adj = {}
for (const t of tickets) { indeg[t.id] = 0; adj[t.id] = [] }
for (const t of tickets) for (const b of (t.blockedBy || [])) if (ids.has(b)) { adj[b].push(t.id); indeg[t.id]++ }

const waves = []
let frontier = tickets.filter((t) => indeg[t.id] === 0).map((t) => t.id)
const placed = new Set()
const localIndeg = { ...indeg }
while (frontier.length > 0) {
  waves.push(frontier.slice().sort())
  frontier.forEach((id) => placed.add(id))
  const next = []
  for (const id of frontier) for (const child of adj[id]) { if (--localIndeg[child] === 0) next.push(child) }
  frontier = next
}
const cyclic = tickets.filter((t) => !placed.has(t.id)).map((t) => t.id)

log('Validacao: ' + missingDeps.length + ' deps faltantes, ' + (cyclic.length ? 'CICLO envolvendo ' + cyclic.join(',') : 'sem ciclo') + ', ' + waves.length + ' ondas')

// Se DAG invalido, PARA - nao produz plano de execucao sobre grafo quebrado
if (cyclic.length > 0 || missingDeps.length > 0) {
  return {
    valid: false,
    cyclicTickets: cyclic,
    missingDeps,
    report: 'DAG INVALIDO - corrija antes de planejar ondas. ' +
      (cyclic.length ? 'Ciclo entre: ' + cyclic.join(', ') + '. ' : '') +
      (missingDeps.length ? 'Deps inexistentes: ' + JSON.stringify(missingDeps) : ''),
  }
}

// qualidade dos tickets como prompt (a parte de julgamento - fan-out barato)
const quality = (await parallel(tickets.map((t) => () =>
  agent(
    'Avalie se este ticket serve como PROMPT AUTOCONTIDO executavel por um agente sem contexto implicito:\n' +
    JSON.stringify(t) + '\n' +
    'Um ticket executavel tem: titulo imperativo, problema+porque, escopo E fora-de-escopo, comportamento esperado, ' +
    'arquivos/modulos afetados, acceptance criteria, cenarios de teste, blockedBy, rollout/rollback se arriscado. ' +
    'executableAsPrompt=true so se der pra implementar sem perguntar nada. missing = campos ausentes.',
    { label: 'quality:' + t.id, phase: 'Validate', schema: QUALITY, effort: 'low' },
  )))).filter(Boolean)
const notReady = quality.filter((q) => !q.executableAsPrompt)

// --- Plan ---
phase('Plan')
const waveDetail = waves.map((w, i) => ({
  wave: i + 1,
  tickets: w.map((id) => { const t = tickets.find((x) => x.id === id); return { id, title: t.title, points: t.points } }),
  parallelism: w.length,
}))

// plano = plumbing -> codigo (sem agente final sem schema; ondas ja calculadas em codigo)
const waveLines = waveDetail.map((w) => 'Onda ' + w.wave + ' (' + w.parallelism + ' em paralelo): ' +
  w.tickets.map((t) => t.id + ' ' + t.title + (t.points ? ' [' + t.points + 'pt]' : '')).join(' | '))
const notReadyLine = notReady.length
  ? '\nATENCAO - ' + notReady.length + ' tickets NAO-prontos como prompt (melhore antes de executar):\n' +
    notReady.map((q) => '- ' + q.ticketId + ' falta: ' + q.missing.join(', ')).join('\n')
  : '\nTodos os tickets estao prontos como prompt executavel.'
const report = 'PLANO DE ONDAS (' + waves.length + ' ondas) para aprovacao humana:\n' + waveLines.join('\n') + notReadyLine +
  '\n\nRegras de execucao: cada onda comeca de origin/main atualizada; 1 worktree + 1 PR por ticket; ' +
  'CI + review + MERGE HUMANO obrigatorios; recalcular prontos apos cada merge.\n' +
  'AVISO: a execucao de cada onda e disparada MANUALMENTE pelo humano - este grafo so planeja, nao toca git.'
return { valid: true, waves: waveDetail, waveCount: waves.length, ticketsNotReady: notReady, report }
