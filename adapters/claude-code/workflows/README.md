# Workflows globais (local-only, nunca versionar)

Grafos de execucao salvos, re-runnaveis. Rode via `/ggraph <nome>` (sessao nova) ou
`Workflow {scriptPath: "...", args: {...}}` (mesma sessao). Pareia com loop engineering
(`/gloop`). Conhecimento do craft: skill `graph-global`.

## Biblioteca global (`~/.claude/workflows/`)

| Workflow | Faz | args principais |
|---|---|---|
| `adversarial-review` | Review de diff: roteia por tamanho, 4 lentes (correctness/security/perf/simplicity), ceticos matam findings (3 votos em high) | `{range?, focus?}` |
| `discovery-until-dry` | Descoberta de tamanho desconhecido: finders por angulos distintos, dedupe vs TUDO visto, 2 rodadas secas param | `{objective!, angles?, maxRounds?}` |
| `kg-ingestion` | Knowledge graph SEMANTICO de documentos (pipeline do PDF: extract Haiku -> resolve Sonnet -> assemble -> amostra). Escreve 1 JSON | `{paths[] OU glob!, outFile?, maxDocs?}` |
| `memory-consolidation` | Dreaming auditavel da memoria: acha duplicata/stale/conflito, verifica vs fonte, PROPOE (nunca muta) | `{memoryDir?}` |
| `dependency-waves` | PLANEJADOR de ondas de tickets (valida DAG, ciclos, deps faltantes, ordem topologica). NAO executa | `{tickets[] OU ticketsFile!}` |

## Gotchas de runtime (pagos em 2026-07-24)
- `Workflow {name: "x"}` so acha workflows em sessao NOVA (registry monta no session start). Mesma sessao -> `{scriptPath}`.
- `args` pode chegar como STRING JSON, nao objeto. Todo script normaliza no topo:
  `const A = (typeof args === 'string') ? JSON.parse(args) : (args || {})`.
- `export const meta` = literal PURO (sem variavel/template). Sem `Date.now`/`Math.random` (quebram resume).
- Resultado vazio "misterioso" -> ler `journal.jsonl` do run ANTES de teorizar.
- **Agente final SEM schema (report/synthesize de texto livre) TRAVA o runtime** (2026-07-24: 5 runs travaram todas no passo final sem schema; agentes COM schema completaram). Fix aplicado: relatorio final = montado em CODIGO a partir dos dados ja estruturados (que e o certo tambem pela regra "agent so para julgamento, edge/plumbing = codigo"). Se precisar de agente sem schema, suspeite deste hang.

## Reducer entre o fan-out e o estagio caro (aplicado em 2026-08-13)
Todo workflow com fan-out SOBREPOSTO (lentes/angulos que podem achar o mesmo item) reduz em
CODIGO antes do estagio caro: dedupe cross-worker, `agreement: N` no output, votos do verify
preservados (`2/3`), `log()` de toda fusao e log de tokens bruto -> reduzido. Nos reviews isso
custa uma barreira nas lentes (`parallel` em vez de `pipeline`), que e o caso legitimo de
barreira. Fan-out DISJUNTO (auth-sweep: 1 controller por lote) nao deduplica, so mede.
Funcao de referencia: `tokens`/`jaccard`/`reduceFindings` no topo de `adversarial-review.js`.
Copie e cole ao criar workflow novo (script de workflow nao importa modulo). Testes em
`tests/`, rodam sem dependencia: `node tests/reducer.test.mjs` (19 casos da funcao pura) e
`node tests/workflow.harness.mjs` (compila os 8 scripts e roda 4 deles com agentes falsos).
Rode os dois ao mexer em qualquer workflow.

## Regras (herdadas de graph-global / loop-global)
Cap SEMPRE (rounds/spawn/token); verifier tenta MATAR (maker != judge); pipeline() default,
barrier so com dependencia cross-item real; merge/commit/deploy/irreversivel = SEMPRE humano.
Zona proibida (auth/migration/snapshot write-once/prod) = para e pergunta.

Projetos podem ter overlay proprio em `<projeto>/.claude/workflows/` (workflows do dominio).
Distribuicao: LOCAL-ONLY (decisao 2026-07-24), worktree herda por copia de `.claude/`.
