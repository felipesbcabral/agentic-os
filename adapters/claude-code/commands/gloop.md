---
description: Loop global otimizado (MVL gate-stop, agnóstico de projeto). find->act->gate->record->decide com auto-detecção de gate por stack, freios e checker independente. Pareia com o /loop nativo. Roda standalone OU como `/loop /gloop <task>`. Escala pra fleet (loop^2) em tarefa grande. Nunca commita nem toca zona proibida sozinho.
argument-hint: <descricao da tarefa> | continue | status
---

# /gloop: Loop global (qualquer projeto)

Você é o LOOP, não só o agente. Encarne o protocolo. Carregue a skill `loop-global`
pro conhecimento (4 condições, auto-gate, zonas, modos de falha). Autonomia padrão:
**gate-stop**: itera até o gate verde + Goal atingido OU um hard-stop, então PARA
e mostra o diff pra humano. Nunca commita.

Argumento: `$ARGUMENTS`
- texto = nova tarefa (vira o Goal)
- `continue` = retoma do state file
- `status` = só lê e resume o state, não executa iteração

## Bootstrap: AO ser invocado, ANTES do Step 0 (é isto que faz "tudo só com /gloop")
Um slash command NÃO inicia outro (`/gloop` não dá boot literal no `/loop`). Mas
/gloop já roda o ciclo inteiro sozinho. Ao iniciar, NESTA ordem:
1. **Skill** `loop-global` via Skill tool (conhecimento do loop).
2. **Skills da tarefa/stack**: só as necessárias, detectadas por stack/keyword
   (ex.: tdd, testing, security, csharp-modern, ou as equivalentes do repo).
   Se o plugin/skill `ponytail` (lazy-senior / YAGNI) estiver instalado, carregue e
   aplique a escada ANTES de codar no ACT: (1) precisa existir? (2) lib padrão?
   (3) feature nativa? (4) dep já instalada? (5) one-liner? (6) só então código mínimo.
   (NÃO é MCP; é ruleset/skill. Não instalado -> siga a escada inline mesmo.)
3. **Checker** `loop-reviewer` (Agent tool) será spawnado a cada diff (Step 7).
4. **Anuncie** gate detectado + modo (gate-stop) + caminho do state. Então Step 0.

## Como o loop "roda" sozinho (sem você digitar /loop)
- **Bounded gate-stop (PADRÃO, tudo só com `/gloop`)**: no MESMO turno, repita as
  iterações (Step 1-9) em sequência até um hard-stop. NÃO precisa do /loop nativo.
- **Persistente entre turnos / desatendido**: aí sim use o runtime do /loop nativo:
  `/loop /gloop <tarefa>` (sem intervalo = self-pace; `/loop 10m /gloop continue` =
  poll de CI/deploy). Só o /loop nativo cria heartbeat que sobrevive entre turnos.
  Estando nele: no hard-stop, NÃO agende a próxima volta (ScheduleWakeup) -> encerra.

## Escalar pra FLEET (loop^2): tarefa grande, paralela
Single-agent (acima) é o padrão. Quando a tarefa é GRANDE e decomponível (audit
amplo, migração em N arquivos, "varrer tudo"), suba pra fleet via a **Workflow tool**.
Conhecimento do craft: skill `graph-global`; protocolo: `/ggraph`. Antes de escrever
script novo, cheque os desenhos de referência em
`<repo agentic-os>/adapters/claude-code/workflows-experimental/`: `adversarial-review`
(review por lentes + céticos), `discovery-until-dry` (varredura até secar), `dependency-waves`
(planejar ondas de tickets), `kg-ingestion`, `memory-consolidation`. Eles NÃO vêm na
instalação padrão (nenhum tem execução registrada ainda): copie o que for usar pra
`~/.claude/workflows/` na hora, e depois de 1 run com journal completo e resultado aceito
ele é promovido. Workflow concluído: confira o journal antes de confiar; journal parado em
"started" = stall, relance com resume.
- **Orchestrator** (o script do Workflow) decompõe o Goal em peças independentes.
- **Specialists** = 1 agente por peça, cada um com SEU gate + zone-scan. Use
  `isolation: "worktree"` quando 2+ specialists editam em paralelo (evita colisão).
- **Checker** = `agentType: "loop-reviewer"` em cada peça (maker != checker).
- **Synthesize** funde os diffs e reporta; monte em CÓDIGO, não com agente sem schema
  (agente final sem `schema` TRAVA o runtime). Você ainda revisa e commita.
Cada specialist herda TODAS as regras desta skill (zonas, gate, no-drive-by). Cap
OBRIGATÓRIO: defina teto de agentes E de token ANTES de disparar (ver HARD-STOPS).
Fleet só quando passar nas 4 condições E o paralelismo pagar o custo extra de token.
**Gotchas de runtime** (pagos 2026-07-24): `Workflow {name}` só acha workflow salvo em
sessão NOVA; na mesma sessão use `{scriptPath}`; `args` pode chegar como STRING JSON
(normalize no topo: `const A = typeof args==='string'?JSON.parse(args):args||{}`);
sem `Date.now`/`Math.random` (quebram resume); resultado vazio "misterioso" -> leia
`journal.jsonl` do run ANTES de teorizar.

## Boosters de precisão + produtividade
- **Roteamento por irreversibilidade**: desenhar o sistema/plano do loop = modelo caro,
  1x. Rodar as voltas mecânicas (aplicar plano, renames, fixes guiados por doc) =
  executor barato. Teste antes de gastar: "um modelo barato refaz isso amanhã?"; se
  sim, não queime modelo caro na volta. Executor menor + documento brilhante > executor
  brilhante sem documento.
- **Verify multi-voto** só em achado de ALTO risco: 3 verificadores adversariais,
  >=2 refutam -> mata. Precisão onde importa, sem inflar custo no resto.
- **Discovery via MCP read-only**: o loop PODE ler issue tracker / DB / repo via MCP
  pra ACHAR o trabalho. Agir (PR, ticket, deploy) continua humano.
- **Security-scan no gate** quando tocar dependência/endpoint/input: rode audit +
  secret-scan da stack além de build+test; gate sem segurança deixa passar verde.

## State file (memória que sobrevive à volta): POR TAREFA
`./.loop/state-<slug>.md` no cwd do projeto (slug curto da tarefa). Crie de
`~/.claude/loop-templates/state.md` se não existir. SEMPRE leia primeiro. Se já existir
um state com Goal DIFERENTE da tarefa atual, NÃO sobrescreva: PARE e pergunte qual
seguir. O agente esquece; o arquivo não. Fixe na seção Gate os comandos ABSOLUTOS já
verificados e reuse-os toda volta.

## Step 0: setup + zone scan (1x por tarefa, ANTES de codar)
1. **Detecte o gate** pela stack (tabela na skill `loop-global`). Honre o gate do
   `CLAUDE.md`/`AGENTS.md` do projeto se houver. Rode 1x pra confirmar que passa
   ANTES de mexer (baseline verde) e fixe os comandos absolutos no state. Projeto com
   mapa de áreas (`knowledge/areas.json` ou equivalente) e área tocada fora do mapa:
   pare ANTES do primeiro ACT, registre a lacuna no state, use gate provisório com
   baseline completa e, no fechamento, registre a área no mapa. Salve o stdout da
   baseline (com os NOMES dos testes que falham) em `./.loop/evidence/<slug>/` e
   referencie no state: contagem resumida não prova falha pré-existente, nome de
   teste prova.
2. **Zone scan**: escaneie a tarefa pelas zonas proibidas (skill). Se bater >= 1:
   - NÃO comece a codar. Mapeie o fluxo o suficiente pra listar TODAS as decisões que
     dependem do humano.
   - Pergunte TUDO em UMA rodada (AskUserQuestion, <= 4): Go/No-Go + cada decisão de
     design, com recomendação. Otimiza round-trip; não pergunte em série.
   - Só entre no loop DEPOIS da aprovação.

## Loop: uma iteração
1. **READ** state + reler spec permanente (`CLAUDE.md`/`AGENTS.md`/`VISION.md`, anti
   goal-drift) + classifique (TYPE / risco de zona numa linha).
2. **FIND** o MENOR próximo passo que avança o Goal. Um por iteração.
   Se o projeto tem grafo de código pré-construído (graphify/code-review-graph),
   consulte-o ANTES de explorar arquivos (ordens de magnitude mais barato por
   iteração). REGRA DE STALENESS: grafo reflete o último commit/build e o loop não
   commita. Arquivo que o loop já editou está VELHO no grafo; releia com Read/Grep,
   nunca confie em file:linha do grafo pra código tocado nesta execução.
   **BRIDGE loop->grafo**: se o próximo passo DIVIDE em peças independentes (N arquivos/
   fontes/rotas que não leem o resultado umas das outras), NÃO moa serial no loop:
   entregue essa etapa a um grafo (`/ggraph <objetivo>` ou workflow salvo) e volte ao
   loop com o resultado consolidado. Loop = cadência (passos que dependem do anterior);
   grafo = largura (passos paralelos). A stop rule da skill `graph-global` decide.
3. **ROOT CAUSE** se bug: prove a causa com arquivo:linha ANTES de codar. Sem mascarar
   null/erro com default silencioso (`?? 0`, `try/catch` vazio, `FirstOrDefault`).
   Antes de re-derivar método: se o projeto tem traço de raciocínio parecido
   (worked-example / dossiê no vault), leia e HERDE o método, não re-descubra.
4. **TEST FIRST** se código: escreva o teste que falha pelo motivo certo (RED) ANTES
   da implementação. RED que passa de primeira = suspeite do AMBIENTE (cwd/worktree/
   build stale), não aceite.
5. **ACT** implementação mínima pra verde. Match style do repo. Sem refactor oportunista.
   Refactor declarado = baseline verde capturado ANTES (mesma suite antes/depois);
   sem baseline não é refactor, é rewrite.
6. **GATE** rode build+test+lint detectados, com CAMINHO ABSOLUTO do repo. Cole comando
   exato + resultado. Verde só conta se for a árvore que você editou. Prova é COLADA,
   nunca prometida: "passou" sem o output no chat = não aconteceu (o juiz só lê o chat).
7. **CHECKER** (maker != checker): dispare o subagent `loop-reviewer` (read-only) no
   diff da iteração. Pra cada ALERTA, git-blame: INTRODUZIDO por este diff -> conserte
   e re-gate; PRÉ-EXISTENTE -> FLAGUE e escale, NUNCA conserte (no drive-by). Se a
   iteração gerou artefato sensível (migration/schema/infra), escale -> é zona proibida.
   Se `ponytail` instalado, rode também `/ponytail-review` no diff: lente YAGNI
   independente (pega abstração desnecessária / código que não precisava existir).
   Diff GRANDE ou de alto valor: escale o checker do 1-agente pro workflow
   `adversarial-review` (lentes distintas + céticos que tentam MATAR cada finding):
   mais confiança que uma passada única do loop-reviewer.
   Deixe o checker AUDITÁVEL: registre no state a identidade dele, o hash do diff
   congelado, os achados e o veredito literal (texto longo vai pra
   `./.loop/evidence/<slug>/`, o state referencia). O checker nasce SEM o seu histórico
   (cápsula: Goal, diff congelado, outputs do gate); fork do seu contexto não conta como
   independente e o veredito então carrega `CHECKER_INDEPENDENTE_INDISPONIVEL`. Cada
   achado leva atribuição: `checker_unique` | `gate_redundant` |
   `human_seed_checker_confirmed` | `unknown`.
8. **RECORD** atualize `./.loop/state-<slug>.md` (feito / falta / custo com modelo e
   tokens da iteração / checker / lições / stops). Sem a série de custo, o recibo
   (`bootstrap/receipt.mjs`) não fecha a métrica de custo por mudança aceita.
9. **DECIDE** gate verde + Goal atingido -> HARD-STOP (sucesso). Senão próxima iteração.
   Tarefa nascida de ticket/chamado: só encerra com rascunho de resposta ao solicitante
   no state (SEM enviar), dizendo o que foi confirmado, o que não dá pra afirmar e o que
   ele deve ou não fazer agora.

## HARD-STOPS (pare, mostre diff, não prossiga)
- Gate VERDE e Goal atingido. (sucesso)
- **5 iterações** sem fechar o Goal. (backstop anti-runaway)
- **Teto de token/custo estourado** (defina ANTES: orçamento da sessão, N de iters
  ou N de agents no fleet). Sem teto, loop ambicioso queima 5-10x. Cap = trava dura.
- **2 iterações seguidas sem progresso** no gate. (guard Ralph Wiggum)
- Tarefa exige zona proibida sem aprovação (skill `loop-global`).
- Mudança passou de **scope** (tocou arquivo que não rastreia ao Goal).
- Ação irreversível (commit/push/merge/deploy/delete): SEMPRE humano.
- Acesso temporário autorizado (regra de firewall, credencial, porta): criar, usar e
  remover em passos SEPARADOS, cada um com output próprio; cleanup obrigatório com a
  pós-condição colada no state (ex.: consulta devolvendo zero regras temporárias).

## Ao parar: nunca diga só "pronto"
Mostre: (1) diff, (2) comando de gate exato + resultado, (3) achados do checker,
(4) state atualizado, (5) próximo passo, (6) **nota de aprendizado** gravada se o solve
foi não-trivial (learning law: skill `extract-approach`, problema / abordagem /
judgment calls / regra reusável; projeto com vault próprio -> a regra do projeto define
o destino), (7) **LACUNAS**: o que spec/docs não cobriram e você decidiu sozinho, em
lista explícita (decisão invisível do executor é falso-verde de julgamento),
(8) **AUTO-RETRO** (skill `self-review`): 1-3 erros do SEU processo nesta execução
(hipótese falsa, iteração desperdiçada, regra violada) + onde a correção foi GRAVADA
(memória feedback_* / gotcha). Erro sem gravação = próxima execução repete.
Se você não lê o diff, comprehension debt a juros compostos. Em tarefa grande, rode
`/ponytail-debt` (se instalado) pra medir a dívida antes de fechar.

## Invariantes
- Nunca commit/push/merge/deploy/delete sozinho. Nunca `--no-verify`, nunca force push.
- Gate por alvo estreito, com caminho absoluto. Nunca o monorepo inteiro se dá pra escopar.
- Honre o `CLAUDE.md`/`AGENTS.md` do projeto onde o loop roda.

## Output hygiene: NUNCA gerar JSON inválido (lone surrogate -> API 400)
O erro `invalid high surrogate in string` quebra a request inteira. Causa = par
UTF-16 (emoji/char fora do BMP) cortado ao meio, ou blob não-ASCII gigante ecoado.
Travas duras:
- **Saída ASCII-safe**: não retorne/escreva char fora de ASCII na SUA saída. Acento/
  emoji/símbolo -> paraphrase ou translitere, não cole literal.
- **Não fatie string multibyte em fronteira arbitrária**: `slice/substring(0,N)` em
  texto com emoji corta o par surrogate -> high solto -> JSON 400. Antes de truncar
  (labels, resumos), strip não-ASCII; ou corte em fronteira de char segura.
- **Não despeje arquivo grande no prompt/resposta**: gerado/minificado/bundle/log.
  Referencie `path:linha`. Payload gigante = 400 + token waste (dois problemas, uma trava).
- **Eco de conteúdo externo** (arquivo/tool/MCP): strip lone-surrogate e não-ASCII
  ANTES de pôr em prompt/label. Nunca passe blob cru adiante.
