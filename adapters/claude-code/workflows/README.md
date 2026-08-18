# Workflows globais (local-only, nunca versionar)

Grafos de execução salvos, re-runnáveis. Rode via `/ggraph <nome>` (sessão nova) ou
`Workflow {scriptPath: "...", args: {...}}` (mesma sessão). Pareia com loop engineering
(`/gloop`). Conhecimento do craft: skill `graph-global`.

## Biblioteca global (`~/.claude/workflows/`)

| Workflow | Faz | args principais |
|---|---|---|
| `adversarial-review` | Review de diff: roteia por tamanho, 4 lentes (correctness/security/perf/simplicity), céticos matam findings (3 votos em high) | `{range?, focus?}` |
| `discovery-until-dry` | Descoberta de tamanho desconhecido: finders por ângulos distintos, dedupe vs TUDO visto, 2 rodadas secas param | `{objective!, angles?, maxRounds?}` |
| `kg-ingestion` | Knowledge graph SEMÂNTICO de documentos (pipeline do PDF: extract Haiku -> resolve Sonnet -> assemble -> amostra). Escreve 1 JSON | `{paths[] OU glob!, outFile?, maxDocs?}` |
| `memory-consolidation` | Dreaming auditável da memória: acha duplicata/stale/conflito, verifica vs fonte, PROPÕE (nunca muta) | `{memoryDir?}` |
| `dependency-waves` | PLANEJADOR de ondas de tickets (valida DAG, ciclos, deps faltantes, ordem topológica). NÃO executa | `{tickets[] OU ticketsFile!}` |

## Gotchas de runtime (pagos em 2026-07-24)
- `Workflow {name: "x"}` só acha workflows em sessão NOVA (registry monta no session start). Mesma sessão -> `{scriptPath}`.
- `args` pode chegar como STRING JSON, não objeto. Todo script normaliza no topo:
  `const A = (typeof args === 'string') ? JSON.parse(args) : (args || {})`.
- `export const meta` = literal PURO (sem variável/template). Sem `Date.now`/`Math.random` (quebram resume).
- Resultado vazio "misterioso" -> ler `journal.jsonl` do run ANTES de teorizar.
- **Agente final SEM schema (report/synthesize de texto livre) TRAVA o runtime** (2026-07-24: 5 runs travaram todas no passo final sem schema; agentes COM schema completaram). Fix aplicado: relatório final = montado em CÓDIGO a partir dos dados já estruturados (que é o certo também pela regra "agent só para julgamento, edge/plumbing = código"). Se precisar de agente sem schema, suspeite deste hang.

## Reducer entre o fan-out e o estágio caro (aplicado em 2026-08-13)
Todo workflow com fan-out SOBREPOSTO (lentes/ângulos que podem achar o mesmo item) reduz em
CÓDIGO antes do estágio caro: dedupe cross-worker, `agreement: N` no output, votos do verify
preservados (`2/3`), `log()` de toda fusão e log de tokens bruto -> reduzido. Nos reviews isso
custa uma barreira nas lentes (`parallel` em vez de `pipeline`), que é o caso legítimo de
barreira. Fan-out DISJUNTO (auth-sweep: 1 controller por lote) não deduplica, só mede.
Função de referência: `tokens`/`jaccard`/`reduceFindings` no topo de `adversarial-review.js`.
Copie e cole ao criar workflow novo (script de workflow não importa módulo). Testes em
`tests/`, rodam sem dependência: `node tests/reducer.test.mjs` (19 casos da função pura) e
`node tests/workflow.harness.mjs` (compila os 8 scripts e roda 4 deles com agentes falsos).
Rode os dois ao mexer em qualquer workflow.

## Regras (herdadas de graph-global / loop-global)
Cap SEMPRE (rounds/spawn/token); verifier tenta MATAR (maker != judge); pipeline() default,
barrier só com dependência cross-item real; merge/commit/deploy/irreversível = SEMPRE humano.
Zona proibida (auth/migration/snapshot write-once/prod) = para e pergunta.

Projetos podem ter overlay próprio em `<projeto>/.claude/workflows/` (workflows do domínio).
Distribuição: LOCAL-ONLY (decisão 2026-07-24), worktree herda por cópia de `.claude/`.
