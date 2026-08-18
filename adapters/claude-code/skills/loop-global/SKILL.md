---
name: loop-global
description: "Loop engineering (MVL gate-stop): 4 condições, gate por stack, zonas proibidas. Conhecimento por trás do /gloop."
---

# Loop engineering global (qualquer projeto)

Loop = sistema pequeno que ACHA o trabalho, ENTREGA ao agente, CHECA, REGISTRA e
DECIDE o próximo passo. Você desenha 1 vez; o loop prompta dali pra frente. Alavanca
saiu de digitar prompt -> desenhar o sistema que prompta.

Divisão de forças:
- **/loop nativo** = a CADÊNCIA (heartbeat). Sem intervalo -> self-pace; com intervalo
  -> poll. É o "automation" da MVL.
- **/gloop** = o PROTOCOLO de uma iteração (find->act->gate->record->decide + freios).
- **esta skill** = o conhecimento do domínio "loop", lido toda volta.
- **state file** = a memória que sobrevive à volta.

## Teste das 4 condições (falhou 1 = NÃO faça loop, use um bom prompt)
1. **Repete** (>= semanal). Tarefa única -> prompt mirado é mais barato.
2. **Verificação automatizada** existe (teste/build/lint/type que REPROVA sozinho).
3. **Budget** aguenta o desperdício (loop relê contexto, retenta, explora).
4. Agente tem **ferramenta de sênior** (logs, repro, roda o código que escreve).
Honestidade: a maioria das tarefas NÃO precisa de loop ainda.

## A MVL: 4 peças (construa a menor que funciona, sem swarm)
1 automation (/loop ou /gloop manual) + 1 skill (esta) + 1 state file + 1 gate.
Ordem: 1 run manual confiável -> vira skill -> embrulha em loop -> agenda. Pular
etapa é como loops falham em produção. Métrica = custo por mudança ACEITA, não
tokens gastos. Abaixo de ~50% de aceite, o loop está perdendo.

## Escada de abstração (onde você está)
L0 Chat -> L1 Chat+tools -> L2 Harness/loop -> L3 loop^2 (loop de loops / fleet).
`/gloop` single-agent = L2. `/gloop` fleet = L3 (orchestrator -> specialists ->
subagents) via Workflow tool. Cada agente da árvore roda o MESMO ciclo
discovery -> planning -> execution -> verification -> iteration.

## Single vs Fleet
- **Single-agent**: um agente roda o ciclo inteiro sozinho. Padrão. Barato.
- **Fleet (loop^2)**: orchestrator dono do Goal -> specialists (1 por peça, gate
  próprio, worktree se paralelo) -> subagents na parte estreita -> checker em cada.
  Mais poder e precisão, MAIS token. Só em tarefa grande/decomponível + com cap.

## Open vs Closed (qual dá pra rodar)
- **Closed** (PADRÃO): humano desenha o caminho, goal claro, eval em cada passo,
  budget normal, melhora a cada run. O standard é o que mantém honesto.
- **Open**: espaço amplo, explora, descobre; queima token insano, só com budget
  ilimitado; standard frouxo = máquina de slop. Não use sem orçamento ilimitado.

## Freios de custo (o que evita o money pit)
- **Teto de token/custo** explícito ANTES de rodar (orçamento de sessão, N de iters,
  N de agents no fleet). Hard-stop ao estourar. Sem teto = 5-10x o esperado.
- Métrica = custo por mudança ACEITA. <50% aceite -> o loop está perdendo.
- **Roteamento por irreversibilidade**: modelo caro DESENHA o loop (1x, vira ativo);
  executor barato RODA as voltas mecânicas. Teste: "um modelo barato refaz isso
  amanhã?" Se sim, não gaste caro na volta. Executor menor + documento brilhante
  supera executor brilhante sem documento (validado com executor real, 2026-07).

## Gate: auto-detecção por stack (escopo estreito e rápido; nunca o monorepo todo)
Detecte pelos arquivos do repo. Honre primeiro o gate declarado no `CLAUDE.md`/
`AGENTS.md` do projeto, se houver.

| Marcador | build | test | lint/type |
|---|---|---|---|
| package.json (+lock pnpm/yarn/bun/npm) | `<pm> run build` | `<pm> test` | `<pm> run lint` |
| pyproject.toml / pytest.ini / setup.py | -- | `pytest -q` | `ruff check` / `mypy` |
| Cargo.toml | `cargo build` | `cargo test` | `cargo clippy -- -D warnings` |
| go.mod | `go build ./...` | `go test ./...` | `go vet ./...` |
| *.sln / *.csproj | `dotnet build <proj> --no-restore` | `dotnet test <proj> --no-restore --filter <area>` | -- |
| pom.xml / build.gradle | -- | `mvn -q test` / `gradle test` | -- |
| Gemfile | -- | `bundle exec rspec` | `rubocop` |
| Makefile (fallback) | `make build` | `make test` | `make lint` |

Prefira o alvo MAIS ESTREITO que ainda reprova trabalho ruim (pacote/projeto/área,
não a árvore inteira). Sem gate que possa REPROVAR -> não há loop; pare e peça um.

## Zonas proibidas universais (HARD-STOP, precisa humano)
- Credenciais / secrets / .env / chaves / tokens.
- auth / login / payments / billing / cobrança.
- Migrations / schema de banco / dados de produção.
- Infra / deploy / CI config / IaC.
- Conteúdo público (posts, releases, docs publicadas).
- Arquitetura / decisão de design / qualquer "done" que é julgamento.
- Ação irreversível: commit, push, merge, deploy, delete, sobrescrever.
- **Invariantes do projeto**: leia o `CLAUDE.md`/`AGENTS.md` do repo e trate as
  regras dele (ex.: write-once, catálogos globais) como zona proibida também.

## Modos de falha a vigiar (battle-tested)
- **Gate fantasma (false green)**: cwd é um worktree / build stale / .dll-binário de
  outro bin -> gate passa verde testando a árvore ERRADA. Pior modo: certifica
  trabalho quebrado. Fix = caminho ABSOLUTO do repo nos comandos; se um RED recém-
  escrito passa de primeira, suspeite do AMBIENTE antes do teste.
- **State clobber**: loop paralelo sobrescreve o state. Fix = state POR TAREFA
  (`state-<slug>.md`) + guard: Goal divergente -> pare e pergunte, não adote nem
  sobrescreva em silêncio.
- **ALERTA pré-existente como novo**: checker acha problema que JÁ estava no repo;
  "consertar" vira drive-by. Fix = git-blame todo ALERTA; pré-existente -> flag/
  escala, nunca conserta no mesmo PR.
- **Ralph Wiggum loop**: emite "pronto" cedo, sai pela metade. Fix = gate objetivo,
  não um 2o agente "revisando" sem teste.
- **Goal drift**: em sessão longa some o "não faça X". Fix = reler o Goal toda volta.
- **Self-preferential bias**: maker é bom demais corrigindo a própria lição. Fix =
  checker separado (subagent `loop-reviewer`, read-only).
- **Comprehension debt**: quanto mais rápido o loop entrega, maior a distância entre
  o que o repo tem e o que você entende. Fix = ler os diffs, sempre.
- **Lacuna silenciosa**: doc/spec não cobre um caso e o executor decide sozinho SEM
  reportar: a decisão invisível vira bug de julgamento depois. Fix = seção LACUNAS
  obrigatória em toda parada (caso real 2026-07: executor seguindo docs reportou
  lacunas de política de cache e de cobertura que os docs não previam, e isso é
  comportamento DESEJADO, não falha).
- **Prova prometida**: "os testes passam" sem o output colado no chat. O juiz do loop
  (e o humano) só lê o chat: resultado não colado não existe. Fix = gate exige
  output literal, toda volta.
- **Crash de surrogate / payload (API 400 `invalid high surrogate`)**: par UTF-16
  (emoji/char não-BMP) cortado por slice/truncação, ou blob não-ASCII gigante ecoado,
  vira lone high surrogate num request enorme -> 400 mata a volta inteira. Fix =
  saída ASCII-safe; não fatiar string multibyte em fronteira arbitrária; não despejar
  arquivo grande (referencie `path:linha`); strip não-ASCII/lone-surrogate de conteúdo
  externo antes de ecoar.

## Segurança (loop sem supervisão = superfície de ataque sem supervisão)
Skills/MCP da comunidade auto-instalados herdam injection na descrição: audite a
fonte. Sanitize log (segredo não vaza em log de loop longo). Re-audite a permissão
do loop a cada 30 dias (scope creep).
Gate de segurança: quando o loop toca dependência/endpoint/input, rode SAST +
secret-scan + audit de dependência além de build/test, senão código inseguro
faz merge verde.

## Fechamento com aprendizado (learning law)
Loop que fecha um solve não-trivial sem nota de aprendizado é trabalho incompleto.
No hard-stop de sucesso: rode `extract-approach` (problema / abordagem / judgment
calls / regra reusável; <1 página; escrita pra um modelo mais fraco ler frio e seguir
o mesmo caminho). Projeto com vault próprio -> a regra de vault do projeto define o
destino. É assim que o método de uma volta vira ativo da próxima: o loop aprende
entre execuções, não só dentro de uma.

## Irmã: graph engineering
Loop = cadência no TEMPO (passos que dependem do anterior, iteração até o gate).
Grafo = forma no ESPAÇO (peças independentes em paralelo). Quando o FIND do loop
descobre que a etapa DIVIDE em peças que não leem o resultado umas das outras,
entregue-a a um grafo (skill `graph-global`, protocolo `/ggraph`, workflows salvos em
`~/.claude/workflows/`) e volte ao loop com o consolidado. A escala L3 (fleet) do loop
JÁ é um grafo rodado pela Workflow tool; a `graph-global` é o conhecimento desse craft.

Ver também: `/gloop` (protocolo), `graph-global` + `/ggraph` (a irmã: largura/fan-out),
`extract-approach` (gravador), template de state em `~/.claude/loop-templates/`.
