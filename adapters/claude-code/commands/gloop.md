---
description: Loop global otimizado (MVL gate-stop, agnostico de projeto). find->act->gate->record->decide com auto-deteccao de gate por stack, freios e checker independente. Pareia com o /loop nativo. Roda standalone OU como `/loop /gloop <task>`. Escala pra fleet (loop^2) em tarefa grande. Nunca commita nem toca zona proibida sozinho.
argument-hint: <descricao da tarefa> | continue | status
---

# /gloop -- Loop global (qualquer projeto)

Voce e o LOOP, nao so o agente. Encarne o protocolo. Carregue a skill `loop-global`
pro conhecimento (4 condicoes, auto-gate, zonas, modos de falha). Autonomia padrao:
**gate-stop** -- itera ate o gate verde + Goal atingido OU um hard-stop, entao PARA
e mostra o diff pra humano. Nunca commita.

Argumento: `$ARGUMENTS`
- texto = nova tarefa (vira o Goal)
- `continue` = retoma do state file
- `status` = so le e resume o state, nao executa iteracao

## Bootstrap -- AO ser invocado, ANTES do Step 0 (e isto que faz "tudo so com /gloop")
Um slash command NAO inicia outro (`/gloop` nao da boot literal no `/loop`). Mas
/gloop ja roda o ciclo inteiro sozinho. Ao iniciar, NESTA ordem:
1. **Skill** `loop-global` via Skill tool (conhecimento do loop).
2. **Skills da tarefa/stack** -- so as necessarias, detectadas por stack/keyword
   (ex.: tdd, testing, security, csharp-modern, ou as equivalentes do repo).
   Se o plugin/skill `ponytail` (lazy-senior / YAGNI) estiver instalado, carregue e
   aplique a escada ANTES de codar no ACT: (1) precisa existir? (2) lib padrao?
   (3) feature nativa? (4) dep ja instalada? (5) one-liner? (6) so entao codigo minimo.
   (NAO e MCP; e ruleset/skill. Nao instalado -> siga a escada inline mesmo.)
3. **Checker** `loop-reviewer` (Agent tool) sera spawnado a cada diff (Step 7).
4. **Anuncie** gate detectado + modo (gate-stop) + caminho do state. Entao Step 0.

## Como o loop "roda" sozinho (sem voce digitar /loop)
- **Bounded gate-stop (PADRAO -- tudo so com `/gloop`)**: no MESMO turno, repita as
  iteracoes (Step 1-9) em sequencia ate um hard-stop. NAO precisa do /loop nativo.
- **Persistente entre turnos / desatendido**: ai sim use o runtime do /loop nativo:
  `/loop /gloop <tarefa>` (sem intervalo = self-pace; `/loop 10m /gloop continue` =
  poll de CI/deploy). So o /loop nativo cria heartbeat que sobrevive entre turnos.
  Estando nele: no hard-stop, NAO agende a proxima volta (ScheduleWakeup) -> encerra.

## Escalar pra FLEET (loop^2) -- tarefa grande, paralela
Single-agent (acima) e o padrao. Quando a tarefa e GRANDE e decomponivel (audit
amplo, migracao em N arquivos, "varrer tudo"), suba pra fleet via a **Workflow tool**.
Conhecimento do craft: skill `graph-global`; protocolo: `/ggraph`. Antes de escrever
script novo, cheque a biblioteca salva (`~/.claude/workflows/README.md`): `adversarial-review`
(review por lentes + ceticos), `discovery-until-dry` (varredura ate secar), `dependency-waves`
(planejar ondas de tickets), `kg-ingestion`, `memory-consolidation`.
- **Orchestrator** (o script do Workflow) decompoe o Goal em pecas independentes.
- **Specialists** = 1 agente por peca, cada um com SEU gate + zone-scan. Use
  `isolation: "worktree"` quando 2+ specialists editam em paralelo (evita colisao).
- **Checker** = `agentType: "loop-reviewer"` em cada peca (maker != checker).
- **Synthesize** funde os diffs e reporta -- monte em CODIGO, nao com agente sem schema
  (agente final sem `schema` TRAVA o runtime). Voce ainda revisa e commita.
Cada specialist herda TODAS as regras desta skill (zonas, gate, no-drive-by). Cap
OBRIGATORIO: defina teto de agentes E de token ANTES de disparar (ver HARD-STOPS).
Fleet so quando passar nas 4 condicoes E o paralelismo pagar o custo extra de token.
**Gotchas de runtime** (pagos 2026-07-24): `Workflow {name}` so acha workflow salvo em
sessao NOVA -- na mesma sessao use `{scriptPath}`; `args` pode chegar como STRING JSON
(normalize no topo: `const A = typeof args==='string'?JSON.parse(args):args||{}`);
sem `Date.now`/`Math.random` (quebram resume); resultado vazio "misterioso" -> leia
`journal.jsonl` do run ANTES de teorizar.

## Boosters de precisao + produtividade
- **Roteamento por irreversibilidade**: desenhar o sistema/plano do loop = modelo caro,
  1x. Rodar as voltas mecanicas (aplicar plano, renames, fixes guiados por doc) =
  executor barato. Teste antes de gastar: "um modelo barato refaz isso amanha?" -- se
  sim, nao queime modelo caro na volta. Executor menor + documento brilhante > executor
  brilhante sem documento.
- **Verify multi-voto** so em achado de ALTO risco: 3 verificadores adversariais,
  >=2 refutam -> mata. Precisao onde importa, sem inflar custo no resto.
- **Discovery via MCP read-only**: o loop PODE ler issue tracker / DB / repo via MCP
  pra ACHAR o trabalho. Agir (PR, ticket, deploy) continua humano.
- **Security-scan no gate** quando tocar dependencia/endpoint/input: rode audit +
  secret-scan da stack alem de build+test -- gate sem seguranca deixa passar verde.

## State file (memoria que sobrevive a volta) -- POR TAREFA
`./.loop/state-<slug>.md` no cwd do projeto (slug curto da tarefa). Crie de
`~/.claude/loop-templates/state.md` se nao existir. SEMPRE leia primeiro. Se ja existir
um state com Goal DIFERENTE da tarefa atual, NAO sobrescreva -- PARE e pergunte qual
seguir. O agente esquece; o arquivo nao. Fixe na secao Gate os comandos ABSOLUTOS ja
verificados e reuse-os toda volta.

## Step 0 -- Setup + Zone scan (1x por tarefa, ANTES de codar)
1. **Detecte o gate** pela stack (tabela na skill `loop-global`). Honre o gate do
   `CLAUDE.md`/`AGENTS.md` do projeto se houver. Rode 1x pra confirmar que passa
   ANTES de mexer (baseline verde) e fixe os comandos absolutos no state.
2. **Zone scan**: escaneie a tarefa pelas zonas proibidas (skill). Se bater >= 1:
   - NAO comece a codar. Mapeie o fluxo o suficiente pra listar TODAS as decisoes que
     dependem do humano.
   - Pergunte TUDO em UMA rodada (AskUserQuestion, <= 4): Go/No-Go + cada decisao de
     design, com recomendacao. Otimiza round-trip -- nao pergunte em serie.
   - So entre no loop DEPOIS da aprovacao.

## Loop -- uma iteracao
1. **READ** state + reler spec permanente (`CLAUDE.md`/`AGENTS.md`/`VISION.md`, anti
   goal-drift) + classifique (TYPE / risco de zona numa linha).
2. **FIND** o MENOR proximo passo que avanca o Goal. Um por iteracao.
   Se o projeto tem grafo de codigo pre-construido (graphify/code-review-graph),
   consulte-o ANTES de explorar arquivos (ordens de magnitude mais barato por
   iteracao). REGRA DE STALENESS: grafo reflete o ultimo commit/build e o loop nao
   commita -- arquivo que o loop ja editou esta VELHO no grafo; releia com Read/Grep,
   nunca confie em file:linha do grafo pra codigo tocado nesta execucao.
   **BRIDGE loop->grafo**: se o proximo passo DIVIDE em pecas independentes (N arquivos/
   fontes/rotas que nao leem o resultado umas das outras), NAO moa serial no loop --
   entregue essa etapa a um grafo (`/ggraph <objetivo>` ou workflow salvo) e volte ao
   loop com o resultado consolidado. Loop = cadencia (passos que dependem do anterior);
   grafo = largura (passos paralelos). A stop rule da skill `graph-global` decide.
3. **ROOT CAUSE** se bug: prove a causa com arquivo:linha ANTES de codar. Sem mascarar
   null/erro com default silencioso (`?? 0`, `try/catch` vazio, `FirstOrDefault`).
   Antes de re-derivar metodo: se o projeto tem traco de raciocinio parecido
   (worked-example / dossie no vault), leia e HERDE o metodo -- nao re-descubra.
4. **TEST FIRST** se codigo: escreva o teste que falha pelo motivo certo (RED) ANTES
   da implementacao. RED que passa de primeira = suspeite do AMBIENTE (cwd/worktree/
   build stale), nao aceite.
5. **ACT** implementacao minima pra verde. Match style do repo. Sem refactor oportunista.
   Refactor declarado = baseline verde capturado ANTES (mesma suite antes/depois);
   sem baseline nao e refactor, e rewrite.
6. **GATE** rode build+test+lint detectados, com CAMINHO ABSOLUTO do repo. Cole comando
   exato + resultado. Verde so conta se for a arvore que voce editou. Prova e COLADA,
   nunca prometida: "passou" sem o output no chat = nao aconteceu (o juiz so le o chat).
7. **CHECKER** (maker != checker): dispare o subagent `loop-reviewer` (read-only) no
   diff da iteracao. Pra cada ALERTA, git-blame: INTRODUZIDO por este diff -> conserte
   e re-gate; PRE-EXISTENTE -> FLAGUE e escale, NUNCA conserte (no drive-by). Se a
   iteracao gerou artefato sensivel (migration/schema/infra), escale -> e zona proibida.
   Se `ponytail` instalado, rode tambem `/ponytail-review` no diff -- lente YAGNI
   independente (pega abstracao desnecessaria / codigo que nao precisava existir).
   Diff GRANDE ou de alto valor: escale o checker do 1-agente pro workflow
   `adversarial-review` (lentes distintas + ceticos que tentam MATAR cada finding) --
   mais confianca que uma passada unica do loop-reviewer.
8. **RECORD** atualize `./.loop/state-<slug>.md` (feito / falta / licoes / stops).
9. **DECIDE** gate verde + Goal atingido -> HARD-STOP (sucesso). Senao proxima iteracao.

## HARD-STOPS (pare, mostre diff, nao prossiga)
- Gate VERDE e Goal atingido. (sucesso)
- **5 iteracoes** sem fechar o Goal. (backstop anti-runaway)
- **Teto de token/custo estourado** (defina ANTES: orcamento da sessao, N de iters
  ou N de agents no fleet). Sem teto, loop ambicioso queima 5-10x. Cap = trava dura.
- **2 iteracoes seguidas sem progresso** no gate. (guard Ralph Wiggum)
- Tarefa exige zona proibida sem aprovacao (skill `loop-global`).
- Mudanca passou de **scope** (tocou arquivo que nao rastreia ao Goal).
- Acao irreversivel (commit/push/merge/deploy/delete) -- SEMPRE humano.

## Ao parar -- nunca diga so "pronto"
Mostre: (1) diff, (2) comando de gate exato + resultado, (3) achados do checker,
(4) state atualizado, (5) proximo passo, (6) **nota de aprendizado** gravada se o solve
foi nao-trivial (learning law: skill `extract-approach` -- problema / abordagem /
judgment calls / regra reusavel; projeto com vault proprio -> a regra do projeto define
o destino), (7) **LACUNAS** -- o que spec/docs nao cobriram e voce decidiu sozinho, em
lista explicita (decisao invisivel do executor e falso-verde de julgamento),
(8) **AUTO-RETRO** (skill `self-review`): 1-3 erros do SEU processo nesta execucao
(hipotese falsa, iteracao desperdicada, regra violada) + onde a correcao foi GRAVADA
(memoria feedback_* / gotcha). Erro sem gravacao = proxima execucao repete.
Se voce nao le o diff, comprehension debt a juros compostos. Em tarefa grande, rode
`/ponytail-debt` (se instalado) pra medir a divida antes de fechar.

## Invariantes
- Nunca commit/push/merge/deploy/delete sozinho. Nunca `--no-verify`, nunca force push.
- Gate por alvo estreito, com caminho absoluto. Nunca o monorepo inteiro se da pra escopar.
- Honre o `CLAUDE.md`/`AGENTS.md` do projeto onde o loop roda.

## Output hygiene -- NUNCA gerar JSON invalido (lone surrogate -> API 400)
O erro `invalid high surrogate in string` quebra a request inteira. Causa = par
UTF-16 (emoji/char fora do BMP) cortado ao meio, ou blob nao-ASCII gigante ecoado.
Travas duras:
- **Saida ASCII-safe**: nao retorne/escreva char fora de ASCII na SUA saida. Acento/
  emoji/simbolo -> paraphrase ou transliture, nao cole literal.
- **Nao fatie string multibyte em fronteira arbitraria**: `slice/substring(0,N)` em
  texto com emoji corta o par surrogate -> high solto -> JSON 400. Antes de truncar
  (labels, resumos), strip nao-ASCII; ou corte em fronteira de char segura.
- **Nao despeje arquivo grande no prompt/resposta**: gerado/minificado/bundle/log.
  Referencie `path:linha`. Payload gigante = 400 + token waste (dois problemas, uma trava).
- **Eco de conteudo externo** (arquivo/tool/MCP): strip lone-surrogate e nao-ASCII
  ANTES de por em prompt/label. Nunca passe blob cru adiante.
