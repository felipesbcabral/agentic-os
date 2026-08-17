---
name: loop-global
description: "Loop engineering (MVL gate-stop): 4 condições, gate por stack, zonas proibidas. Conhecimento por trás do /gloop."
---

# Loop engineering global (qualquer projeto)

Loop = sistema pequeno que ACHA o trabalho, ENTREGA ao agente, CHECA, REGISTRA e
DECIDE o proximo passo. Voce desenha 1 vez; o loop prompta dali pra frente. Alavanca
saiu de digitar prompt -> desenhar o sistema que prompta.

Divisao de forcas:
- **/loop nativo** = a CADENCIA (heartbeat). Sem intervalo -> self-pace; com intervalo
  -> poll. E o "automation" da MVL.
- **/gloop** = o PROTOCOLO de uma iteracao (find->act->gate->record->decide + freios).
- **esta skill** = o conhecimento do dominio "loop", lido toda volta.
- **state file** = a memoria que sobrevive a volta.

## Teste das 4 condicoes (falhou 1 = NAO faca loop, use um bom prompt)
1. **Repete** (>= semanal). Tarefa unica -> prompt mirado e mais barato.
2. **Verificacao automatizada** existe (teste/build/lint/type que REPROVA sozinho).
3. **Budget** aguenta o desperdicio (loop re-le contexto, retenta, explora).
4. Agente tem **ferramenta de senior** (logs, repro, roda o codigo que escreve).
Honestidade: a maioria das tarefas NAO precisa de loop ainda.

## A MVL -- 4 pecas (construa a menor que funciona, sem swarm)
1 automation (/loop ou /gloop manual) + 1 skill (esta) + 1 state file + 1 gate.
Ordem: 1 run manual confiavel -> vira skill -> embrulha em loop -> agenda. Pular
etapa e como loops falham em producao. Metrica = custo por mudanca ACEITA, nao
tokens gastos. Abaixo de ~50% de aceite, o loop esta perdendo.

## Escada de abstracao (onde voce esta)
L0 Chat -> L1 Chat+tools -> L2 Harness/loop -> L3 loop^2 (loop de loops / fleet).
`/gloop` single-agent = L2. `/gloop` fleet = L3 (orchestrator -> specialists ->
subagents) via Workflow tool. Cada agente da arvore roda o MESMO ciclo
discovery -> planning -> execution -> verification -> iteration.

## Single vs Fleet
- **Single-agent**: um agente roda o ciclo inteiro sozinho. Padrao. Barato.
- **Fleet (loop^2)**: orchestrator dono do Goal -> specialists (1 por peca, gate
  proprio, worktree se paralelo) -> subagents na parte estreita -> checker em cada.
  Mais poder e precisao, MAIS token. So em tarefa grande/decomponivel + com cap.

## Open vs Closed (qual da pra rodar)
- **Closed** (PADRAO): humano desenha o caminho, goal claro, eval em cada passo,
  budget normal, melhora a cada run. O standard e o que mantem honesto.
- **Open**: espaco amplo, explora, descobre -- queima token insano, so com budget
  ilimitado; standard frouxo = maquina de slop. Nao use sem orcamento ilimitado.

## Freios de custo (o que evita o money pit)
- **Teto de token/custo** explicito ANTES de rodar (orcamento de sessao, N de iters,
  N de agents no fleet). Hard-stop ao estourar. Sem teto = 5-10x o esperado.
- Metrica = custo por mudanca ACEITA. <50% aceite -> o loop esta perdendo.
- **Roteamento por irreversibilidade**: modelo caro DESENHA o loop (1x, vira ativo);
  executor barato RODA as voltas mecanicas. Teste: "um modelo barato refaz isso
  amanha?" -- se sim, nao gaste caro na volta. Executor menor + documento brilhante
  supera executor brilhante sem documento (validado com executor real, 2026-07).

## Gate -- auto-deteccao por stack (escopo estreito e rapido; nunca o monorepo todo)
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

Prefira o alvo MAIS ESTREITO que ainda reprova trabalho ruim (pacote/projeto/area,
nao a arvore inteira). Sem gate que possa REPROVAR -> nao ha loop; pare e peca um.

## Zonas proibidas universais (HARD-STOP -- precisa humano)
- Credenciais / secrets / .env / chaves / tokens.
- auth / login / payments / billing / cobranca.
- Migrations / schema de banco / dados de producao.
- Infra / deploy / CI config / IaC.
- Conteudo publico (posts, releases, docs publicadas).
- Arquitetura / decisao de design / qualquer "done" que e julgamento.
- Acao irreversivel: commit, push, merge, deploy, delete, sobrescrever.
- **Invariantes do projeto**: leia o `CLAUDE.md`/`AGENTS.md` do repo e trate as
  regras dele (ex.: write-once, catalogos globais) como zona proibida tambem.

## Modos de falha a vigiar (battle-tested)
- **Gate fantasma (false green)**: cwd e um worktree / build stale / .dll-binario de
  outro bin -> gate passa verde testando a arvore ERRADA. Pior modo: certifica
  trabalho quebrado. Fix = caminho ABSOLUTO do repo nos comandos; se um RED recem-
  escrito passa de primeira, suspeite do AMBIENTE antes do teste.
- **State clobber**: loop paralelo sobrescreve o state. Fix = state POR TAREFA
  (`state-<slug>.md`) + guard: Goal divergente -> pare e pergunte, nao adote nem
  sobrescreva em silencio.
- **ALERTA pre-existente como novo**: checker acha problema que JA estava no repo;
  "consertar" vira drive-by. Fix = git-blame todo ALERTA; pre-existente -> flag/
  escala, nunca conserta no mesmo PR.
- **Ralph Wiggum loop**: emite "pronto" cedo, sai pela metade. Fix = gate objetivo,
  nao um 2o agente "revisando" sem teste.
- **Goal drift**: em sessao longa some o "nao faca X". Fix = reler o Goal toda volta.
- **Self-preferential bias**: maker e bom demais corrigindo a propria licao. Fix =
  checker separado (subagent `loop-reviewer`, read-only).
- **Comprehension debt**: quanto mais rapido o loop entrega, maior a distancia entre
  o que o repo tem e o que voce entende. Fix = ler os diffs, sempre.
- **Lacuna silenciosa**: doc/spec nao cobre um caso e o executor decide sozinho SEM
  reportar -- a decisao invisivel vira bug de julgamento depois. Fix = secao LACUNAS
  obrigatoria em toda parada (caso real 2026-07: executor seguindo docs reportou
  lacunas de politica de cache e de cobertura que os docs nao previam -- isso e
  comportamento DESEJADO, nao falha).
- **Prova prometida**: "os testes passam" sem o output colado no chat. O juiz do loop
  (e o humano) so le o chat -- resultado nao colado nao existe. Fix = gate exige
  output literal, toda volta.
- **Crash de surrogate / payload (API 400 `invalid high surrogate`)**: par UTF-16
  (emoji/char nao-BMP) cortado por slice/truncacao, ou blob nao-ASCII gigante ecoado,
  vira lone high surrogate num request enorme -> 400 mata a volta inteira. Fix =
  saida ASCII-safe; nao fatiar string multibyte em fronteira arbitraria; nao despejar
  arquivo grande (referencie `path:linha`); strip nao-ASCII/lone-surrogate de conteudo
  externo antes de ecoar.

## Seguranca (loop sem supervisao = superficie de ataque sem supervisao)
Skills/MCP da comunidade auto-instalados herdam injection na descricao -- audite a
fonte. Sanitize log (segredo nao vaza em log de loop longo). Re-audite a permissao
do loop a cada 30 dias (scope creep).
Gate de seguranca: quando o loop toca dependencia/endpoint/input, rode SAST +
secret-scan + audit de dependencia alem de build/test -- senao codigo inseguro
faz merge verde.

## Fechamento com aprendizado (learning law)
Loop que fecha um solve nao-trivial sem nota de aprendizado e trabalho incompleto.
No hard-stop de sucesso: rode `extract-approach` (problema / abordagem / judgment
calls / regra reusavel; <1 pagina; escrita pra um modelo mais fraco ler frio e seguir
o mesmo caminho). Projeto com vault proprio -> a regra de vault do projeto define o
destino. E assim que o metodo de uma volta vira ativo da proxima -- o loop aprende
entre execucoes, nao so dentro de uma.

## Irma: graph engineering
Loop = cadencia no TEMPO (passos que dependem do anterior, iteracao ate o gate).
Grafo = forma no ESPACO (pecas independentes em paralelo). Quando o FIND do loop
descobre que a etapa DIVIDE em pecas que nao leem o resultado umas das outras,
entregue-a a um grafo (skill `graph-global`, protocolo `/ggraph`, workflows salvos em
`~/.claude/workflows/`) e volte ao loop com o consolidado. A escala L3 (fleet) do loop
JA e um grafo rodado pela Workflow tool -- a `graph-global` e o conhecimento desse craft.

Ver tambem: `/gloop` (protocolo), `graph-global` + `/ggraph` (a irma: largura/fan-out),
`extract-approach` (gravador), template de state em `~/.claude/loop-templates/`.
