---
name: graph-global
description: Graph engineering (fan-out, waves, diamond, workflow salvo). Conhecimento por trás do /ggraph. Irmã da loop-global.
---

# Graph engineering global (qualquer projeto)

Grafo = a FORMA do trabalho: nodes fazem o pensar, edges carregam os resultados.
Um prompt é uma frase; um loop é um ciclo; um grafo é o desenho de o-que-roda-antes-
do-que, o-que-roda-junto, o-que-espera. A alavanca: parar de pedir mais passos a UM
agente e começar a desenhar onde o trabalho DIVIDE.

Divisão de forças:
- **Workflow tool nativa** = o RUNTIME (agent/parallel/pipeline/phase/log, caps,
  journal, resume). É quem executa o grafo.
- **/ggraph** = o PROTOCOLO (classificar -> desenhar -> rodar -> verificar -> salvar).
- **esta skill** = o conhecimento do domínio "grafo", lida antes de desenhar.
- **`.claude/workflows/`** = grafos salvos, re-runnáveis por nome (global e projeto).

## Vocabulário (6 palavras, todo grafo se explica com elas)
1. **box (job)**: unidade de trabalho de 1 agente. 1 input, 1 output, 1 responsabilidade.
2. **arrow (hand-off)**: dependência REAL: o output de A entra no prompt de B.
3. **running notes**: o estado que viaja com o trabalho (variáveis do script, state file).
4. **fake edge**: "e depois" onde NENHUM dado atravessa. Espera desperdiçada. Delete.
5. **diamond**: split -> workers paralelos -> verify -> merge. A topologia que paga.
6. **gate (the last yes)**: aprovação humana onde o erro é caro de desfazer.

## Stop rule: teste das 4 condições (falhou 1 = NÃO faça grafo)
1. **Divide?** O trabalho quebra em peças que NÃO leem o resultado umas das outras?
   Sequencial (cada passo precisa do quadro inteiro) = 1 agente, sempre.
2. **Verificável?** Dá pra pôr um cético em cima de cada achado? Sem verify, fan-out
   só multiplica slop.
3. **Budget?** Multi-agente custa 10-15x tokens de um chat. O ganho (90.2% em tarefa
   paralelizável, benchmark Anthropic) só paga em trabalho que divide de verdade.
4. **Merge cabe?** O julgamento final (síntese) precisa caber num contexto. Se nem
   reduzido cabe, redesenhe as peças.
Honestidade: grafo compra LARGURA, não julgamento. A pergunta que decide a conta:
"onde o meu trabalho divide?" Se não divide, um bom prompt é mais barato.

## Fake edges primeiro (custo zero, remove mais espera que qualquer ferramenta)
Para cada "e depois" no fluxo atual: o próximo job LÊ o output do anterior?
Não -> a edge é falsa, os dois rodam juntos. Desenhe o sistema atual como boxes e
arrows; toda cadeia linear tem 2-3 arrows que são só a ordem em que foram digitadas.

## Diamond canônico: split -> work -> verify -> merge
- **Split**: decompõe em peças independentes (ângulos DISTINTOS, não N cópias).
- **Work**: 1 agente por peça, em paralelo, cada um com contrato (schema validado).
- **Verify (não-negociável)**: agente separado cujo ÚNICO trabalho é MATAR o achado.
  Modelos não pegam a maioria dos próprios erros: maker nunca é judge.
- **Merge**: só os sobreviventes; dedupe/rank/síntese. Forma canônica:
  fan out -> reduce (código) -> synthesize (1 agente).

## Contratos (o que torna um node paralelizável)
- Node: input explícito no prompt (nunca "assuma do contexto"), output com `schema`
  (JSON Schema no agent()), validação na camada de tool-call, retry automático.
- Edge: CÓDIGO PURO. flatten/dedupe/filter/sort = `flatMap` + `Set`, 0 tokens.
  Agente para "combinar resultados" mecânicos = pagar aluguel pela própria fiação.
  Agente só onde há JULGAMENTO.

## Reducer: a camada entre o fan-out e o estágio caro
Fan-out barato alimentando estágio caro (verify, síntese, o SEU contexto) sem reducer no
meio faz o estágio caro pagar limpeza de dados. Três regras, todas em código, 0 token:
- **Dedupe entre WORKERS, antes do estágio caro.** N lentes/ângulos acham o MESMO item e
  cada cópia paga um verify inteiro. Dedupe DENTRO da rodada também, não só contra o já
  visto: 3 ângulos que acham a mesma key nova x 3 lentes de julgamento = 9 verifies por 1 item.
- **Acordo e discordância são dados a emitir.** `agreement: N` (quantos workers independentes
  acharam), votos do verify (`2/3`), divergência de severidade entre lentes. Concatenar obriga
  o leitor a redescobrir isso lendo tudo; agrupar expõe de graça.
- **Meça a entrada do merge.** `const estTokens = (o) => Math.ceil(JSON.stringify(o).length / 4)`,
  logue bruto -> reduzido. Sem número, "o reducer ajudou" é opinião.

Fusão por similaridade traz false-merge (dois itens distintos virando um). Contenção:
chave ESTRUTURAL (`file:line`, key estável) como pré-condição, semente de tokens FIXA no
grupo (sem merge em cadeia) e `log()` de TODA fusão, para a fusão errada aparecer no run
em vez de sumir. Implementação de referência com teste: `adversarial-review.js`
(`tokens`/`jaccard`/`reduceFindings`). Fan-out com lotes DISJUNTOS (1 arquivo por agente)
não precisa de dedupe: só dá medição.

## pipeline() default; barrier é exceção
- `pipeline(items, s1, s2, ...)`: item A na fase 3 enquanto B ainda na 1. DEFAULT.
- `parallel()` é barreira: TUDO espera o mais lento. Só quando o estágio precisa do
  conjunto INTEIRO: dedup cross-set, early-exit no total, prompt que compara "os
  outros achados".
- Smell test: escreveu `parallel -> transform -> parallel` e o transform não tem
  dependência cross-item? Devia ser pipeline com o transform dentro do estágio.
  "Fica mais limpo" e "são fases conceituais" NÃO justificam barreira.

## Ciclos que convergem: loop-until-dry
Descoberta de tamanho desconhecido (bugs, edge cases): rode finders até K rodadas
seguidas (K=2) não trazerem nada NOVO. O detalhe que quebra todo mundo na 1a vez:
**dedupe contra TUDO que já foi visto, nunca só contra os confirmados**, senão
achado rejeitado pelo verify reaparece toda rodada e o ciclo nunca seca.

## Fiação anti-acidente (o que separa grafo de acidente caro)
- **Cap em todo ciclo** (max rounds) + **cap de spawn** (N de agentes) + teto de
  token ANTES de rodar. `budget.remaining()` como guarda em loop dinâmico.
- **1 writer por arquivo**. 2+ agentes editando em paralelo = `isolation: "worktree"`
  (caro: ~200-500ms + disco por agente; cinto de segurança da topologia que escreve
  em paralelo, não imposto default de toda run).
- **Código dono das edges, modelo preenche os nodes**: roteamento em if/switch sobre
  output validado. Julgamento do modelo NO node, confiabilidade do script NA edge:
  "o agente decidiu pular a auditoria" não existe se o pulo não está escrito no grafo.
- **Sem cap silencioso**: top-N/sampling/no-retry -> `log()` o que foi dropado.
- **Fan-in tolera faltante**: thunk que falha vira `null`; `.filter(Boolean)` sempre;
  merge nunca assume conjunto completo.

## Tiering de modelos (a alavanca de custo sem mudar a forma)
Node repetitivo/bounded (extrair, classificar, varrer) = modelo barato + effort low.
Node de julgamento (verify difícil, judge, síntese) = caro. Default: omitir `model`
(herda a sessão); override consciente só com confiança alta. Consulte
`~/.claude/MODEL-ROUTING.md` antes de run grande.

## Padrões de verify (escolha pelo risco)
- **Adversarial**: N céticos independentes prompted a REFUTAR; maioria refuta = mata.
  Default 3 votos em achado de alto risco; 1 voto no resto (não infle custo).
- **Perspective-diverse**: cada verificador com lente DISTINTA (correto? atual?
  reproduz? seguro?): diversidade pega o que N checks idênticos nunca pegam.
- **Judge panel**: N tentativas de ângulos diferentes -> juízes paralelos pontuam ->
  síntese do vencedor + enxertos dos runners-up. Para espaço de solução amplo.

## Grounding do verifier (evaluator = fact-checker, não "parece certo")
- Todo finding cita arquivo:linha (proveniência). Sem citação = não entra no merge.
- Repo com grafo de código (graphify / code-review-graph): o verifier CONSULTA o
  grafo (impact radius, callers_of, tests_for) antes de confirmar: feedback vira
  "consumidor X em file:linha quebra" em vez de "parece arriscado".
- **STALENESS**: grafo reflete o último commit/build. Arquivo editado NESTA sessão
  está velho no grafo: linha atual só via Read/Grep, nunca file:linha do grafo.
- Estado que precisa sobreviver ao run (mundo compartilhado entre execuções) mora em
  memória durável (vault/notas/state file), não no contexto do orquestrador. O agente
  esquece; o grafo/arquivo não.

## Zonas proibidas (idênticas à loop-global; grafo herda TODAS)
Credenciais/secrets; auth/payments; migrations/schema/dados de prod; infra/deploy/CI;
conteúdo público; decisão de arquitetura; ação irreversível (commit/push/merge/
deploy/delete); invariantes do projeto (CLAUDE.md/AGENTS.md, ex.: write-once).
**Human gate**: a aprovação fica onde o erro é caro de desfazer, não em todo passo.
Gate em tudo = você é o gargalo; gate em nada = ninguém olhando.

## Modos de falha (battle-tested + espec da Workflow tool)
- **Barrier desnecessária**: latência real desperdiçada, ver smell test acima.
- **Dedupe vs confirmados**: ciclo nunca seca (o erro clássico do item 11).
- **Agente-plumbing**: agent() para flatten/dedupe; edge é código, 0 token.
- **Duplicata pagando estágio caro**: sem dedupe cross-worker ANTES do verify, o mesmo
  defeito achado por 3 lentes contrata 3 painéis de céticos. Barreira nas lentes é o caso
  legítimo de `parallel()` (dedupe antes de estágio caro), não violação do smell test.
- **Acordo descartado**: colapsar os votos em boolean (`survived`) apaga "sobreviveu 2/3"
  e "3 lentes independentes concordam" do relatório.
- **Merge não medido**: sem `estTokens` bruto -> reduzido, não há como saber se o reducer
  cortou alguma coisa.
- **Spawn sem cap**: protótipo real spawnou ~50 subagents pra query simples.
- **`Date.now()`/`Math.random()`/`new Date()` no script**: THROW (quebram resume).
  Timestamp vem por `args`; aleatoriedade = variar prompt/label por índice.
- **`args` stringificado**: passe arrays/objetos como JSON REAL na tool call;
  string JSON vira 1 string só e `args.map` explode.
- **Resultado vazio "misterioso"**: antes de teorizar, leia `journal.jsonl` no
  transcriptDir do run, que registra o retorno REAL de cada agente (cache pode ser vazio).
- **Meta computado**: `export const meta` é literal PURO, sem variável/spread/template.
- **Workflow só com opt-in explícito** do usuário (palavra "workflow", ultracode,
  skill que mande, pedido direto). Tarefa que "se beneficiaria" NÃO basta: descreva
  custo e pergunte.

## Biblioteca (grafos salvos, re-runnáveis; LOCAL-ONLY, nunca versionar)
Globais (`~/.claude/workflows/`): `adversarial-review`, `discovery-until-dry`,
`kg-ingestion` (KG semântico de docs), `memory-consolidation` (dreaming), `dependency-waves`
(planejador de ondas). Projetos podem ter overlay próprio em `<projeto>/.claude/workflows/`.
Índice completo: `~/.claude/workflows/README.md`.
Ticket como prompt executável: comando `/ticket`.

## Fechamento (learning law)
Grafo que rodou bem = ativo: salve em `.claude/workflows/` (global se agnóstico, projeto se
específico). Solve não-trivial fecha com `extract-approach` (projeto com vault próprio: regra do
projeto define o destino).

Ver também: `/ggraph` (protocolo), `loop-global` (a irmã: cadência, gates, state),
fontes completas em `docs/SOURCES.md` do repo agentic-os.
