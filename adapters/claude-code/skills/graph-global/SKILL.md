---
name: graph-global
description: Graph engineering (fan-out, waves, diamond, workflow salvo). Conhecimento por trás do /ggraph. Irmã da loop-global.
---

# Graph engineering global (qualquer projeto)

Grafo = a FORMA do trabalho: nodes fazem o pensar, edges carregam os resultados.
Um prompt e uma frase; um loop e um ciclo; um grafo e o desenho de o-que-roda-antes-
do-que, o-que-roda-junto, o-que-espera. A alavanca: parar de pedir mais passos a UM
agente e comecar a desenhar onde o trabalho DIVIDE.

Divisao de forcas:
- **Workflow tool nativa** = o RUNTIME (agent/parallel/pipeline/phase/log, caps,
  journal, resume). E quem executa o grafo.
- **/ggraph** = o PROTOCOLO (classificar -> desenhar -> rodar -> verificar -> salvar).
- **esta skill** = o conhecimento do dominio "grafo", lida antes de desenhar.
- **`.claude/workflows/`** = grafos salvos, re-runnaveis por nome (global e projeto).

## Vocabulario (6 palavras -- todo grafo se explica com elas)
1. **box (job)**: unidade de trabalho de 1 agente. 1 input, 1 output, 1 responsabilidade.
2. **arrow (hand-off)**: dependencia REAL -- o output de A entra no prompt de B.
3. **running notes**: o estado que viaja com o trabalho (variaveis do script, state file).
4. **fake edge**: "e depois" onde NENHUM dado atravessa. Espera desperdicada. Delete.
5. **diamond**: split -> workers paralelos -> verify -> merge. A topologia que paga.
6. **gate (the last yes)**: aprovacao humana onde o erro e caro de desfazer.

## Stop rule -- teste das 4 condicoes (falhou 1 = NAO faca grafo)
1. **Divide?** O trabalho quebra em pecas que NAO leem o resultado umas das outras?
   Sequencial (cada passo precisa do quadro inteiro) = 1 agente, sempre.
2. **Verificavel?** Da pra por um cetico em cima de cada achado? Sem verify, fan-out
   so multiplica slop.
3. **Budget?** Multi-agente custa 10-15x tokens de um chat. O ganho (90.2% em tarefa
   paralelizavel, benchmark Anthropic) so paga em trabalho que divide de verdade.
4. **Merge cabe?** O julgamento final (sintese) precisa caber num contexto. Se nem
   reduzido cabe, redesenhe as pecas.
Honestidade: grafo compra LARGURA, nao julgamento. A pergunta que decide a conta:
"onde o meu trabalho divide?" Se nao divide, um bom prompt e mais barato.

## Fake edges primeiro (custo zero, remove mais espera que qualquer ferramenta)
Para cada "e depois" no fluxo atual: o proximo job LE o output do anterior?
Nao -> a edge e falsa, os dois rodam juntos. Desenhe o sistema atual como boxes e
arrows; toda cadeia linear tem 2-3 arrows que sao so a ordem em que foram digitadas.

## Diamond canonico: split -> work -> verify -> merge
- **Split**: decompoe em pecas independentes (angulos DISTINTOS, nao N copias).
- **Work**: 1 agente por peca, em paralelo, cada um com contrato (schema validado).
- **Verify (nao-negociavel)**: agente separado cujo UNICO trabalho e MATAR o achado.
  Modelos nao pegam a maioria dos proprios erros -- maker nunca e judge.
- **Merge**: so os sobreviventes; dedupe/rank/sintese. Forma canonica:
  fan out -> reduce (codigo) -> synthesize (1 agente).

## Contratos (o que torna um node paralelizavel)
- Node: input explicito no prompt (nunca "assuma do contexto"), output com `schema`
  (JSON Schema no agent()) -- validacao na camada de tool-call, retry automatico.
- Edge: CODIGO PURO. flatten/dedupe/filter/sort = `flatMap` + `Set`, 0 tokens.
  Agente para "combinar resultados" mecanicos = pagar aluguel pela propria fiacao.
  Agente so onde ha JULGAMENTO.

## Reducer: a camada entre o fan-out e o estagio caro
Fan-out barato alimentando estagio caro (verify, sintese, o SEU contexto) sem reducer no
meio faz o estagio caro pagar limpeza de dados. Tres regras, todas em codigo, 0 token:
- **Dedupe entre WORKERS, antes do estagio caro.** N lentes/angulos acham o MESMO item e
  cada copia paga um verify inteiro. Dedupe DENTRO da rodada tambem, nao so contra o ja
  visto: 3 angulos que acham a mesma key nova x 3 lentes de julgamento = 9 verifies por 1 item.
- **Acordo e discordancia sao dados a emitir.** `agreement: N` (quantos workers independentes
  acharam), votos do verify (`2/3`), divergencia de severidade entre lentes. Concatenar obriga
  o leitor a redescobrir isso lendo tudo; agrupar expoe de graca.
- **Meca a entrada do merge.** `const estTokens = (o) => Math.ceil(JSON.stringify(o).length / 4)`,
  logue bruto -> reduzido. Sem numero, "o reducer ajudou" e opiniao.

Fusao por similaridade traz false-merge (dois itens distintos virando um). Contencao:
chave ESTRUTURAL (`file:line`, key estavel) como pre-condicao, semente de tokens FIXA no
grupo (sem merge em cadeia) e `log()` de TODA fusao, para a fusao errada aparecer no run
em vez de sumir. Implementacao de referencia com teste: `adversarial-review.js`
(`tokens`/`jaccard`/`reduceFindings`). Fan-out com lotes DISJUNTOS (1 arquivo por agente)
nao precisa de dedupe: so da medicao.

## pipeline() default; barrier e excecao
- `pipeline(items, s1, s2, ...)`: item A na fase 3 enquanto B ainda na 1. DEFAULT.
- `parallel()` e barreira: TUDO espera o mais lento. So quando o estagio precisa do
  conjunto INTEIRO: dedup cross-set, early-exit no total, prompt que compara "os
  outros achados".
- Smell test: escreveu `parallel -> transform -> parallel` e o transform nao tem
  dependencia cross-item? Devia ser pipeline com o transform dentro do estagio.
  "Fica mais limpo" e "sao fases conceituais" NAO justificam barreira.

## Ciclos que convergem: loop-until-dry
Descoberta de tamanho desconhecido (bugs, edge cases): rode finders ate K rodadas
seguidas (K=2) nao trazerem nada NOVO. O detalhe que quebra todo mundo na 1a vez:
**dedupe contra TUDO que ja foi visto, nunca so contra os confirmados** -- senao
achado rejeitado pelo verify reaparece toda rodada e o ciclo nunca seca.

## Fiacao anti-acidente (o que separa grafo de acidente caro)
- **Cap em todo ciclo** (max rounds) + **cap de spawn** (N de agentes) + teto de
  token ANTES de rodar. `budget.remaining()` como guarda em loop dinamico.
- **1 writer por arquivo**. 2+ agentes editando em paralelo = `isolation: "worktree"`
  (caro: ~200-500ms + disco por agente -- cinto de seguranca da topologia que escreve
  em paralelo, nao imposto default de toda run).
- **Codigo dono das edges, modelo preenche os nodes**: roteamento em if/switch sobre
  output validado. Julgamento do modelo NO node, confiabilidade do script NA edge --
  "o agente decidiu pular a auditoria" nao existe se o pulo nao esta escrito no grafo.
- **Sem cap silencioso**: top-N/sampling/no-retry -> `log()` o que foi dropado.
- **Fan-in tolera faltante**: thunk que falha vira `null`; `.filter(Boolean)` sempre;
  merge nunca assume conjunto completo.

## Tiering de modelos (a alavanca de custo sem mudar a forma)
Node repetitivo/bounded (extrair, classificar, varrer) = modelo barato + effort low.
Node de julgamento (verify dificil, judge, sintese) = caro. Default: omitir `model`
(herda a sessao); override consciente so com confianca alta. Consulte
`~/.claude/MODEL-ROUTING.md` antes de run grande.

## Padroes de verify (escolha pelo risco)
- **Adversarial**: N ceticos independentes prompted a REFUTAR; maioria refuta = mata.
  Default 3 votos em achado de alto risco; 1 voto no resto (nao infle custo).
- **Perspective-diverse**: cada verificador com lente DISTINTA (correto? atual?
  reproduz? seguro?) -- diversidade pega o que N checks identicos nunca pegam.
- **Judge panel**: N tentativas de angulos diferentes -> juizes paralelos pontuam ->
  sintese do vencedor + enxertos dos runners-up. Para espaco de solucao amplo.

## Grounding do verifier (evaluator = fact-checker, nao "parece certo")
- Todo finding cita arquivo:linha (proveniencia). Sem citacao = nao entra no merge.
- Repo com grafo de codigo (graphify / code-review-graph): o verifier CONSULTA o
  grafo (impact radius, callers_of, tests_for) antes de confirmar -- feedback vira
  "consumidor X em file:linha quebra" em vez de "parece arriscado".
- **STALENESS**: grafo reflete o ultimo commit/build. Arquivo editado NESTA sessao
  esta velho no grafo -- linha atual so via Read/Grep, nunca file:linha do grafo.
- Estado que precisa sobreviver ao run (mundo compartilhado entre execucoes) mora em
  memoria duravel (vault/notas/state file), nao no contexto do orquestrador. O agente
  esquece; o grafo/arquivo nao.

## Zonas proibidas (identicas a loop-global -- grafo herda TODAS)
Credenciais/secrets; auth/payments; migrations/schema/dados de prod; infra/deploy/CI;
conteudo publico; decisao de arquitetura; acao irreversivel (commit/push/merge/
deploy/delete); invariantes do projeto (CLAUDE.md/AGENTS.md -- ex.: write-once).
**Human gate**: a aprovacao fica onde o erro e caro de desfazer, nao em todo passo.
Gate em tudo = voce e o gargalo; gate em nada = ninguem olhando.

## Modos de falha (battle-tested + espec da Workflow tool)
- **Barrier desnecessaria**: latencia real desperdicada -- ver smell test acima.
- **Dedupe vs confirmados**: ciclo nunca seca (o erro classico do item 11).
- **Agente-plumbing**: agent() para flatten/dedupe -- edge e codigo, 0 token.
- **Duplicata pagando estagio caro**: sem dedupe cross-worker ANTES do verify, o mesmo
  defeito achado por 3 lentes contrata 3 painels de ceticos. Barreira nas lentes e o caso
  legitimo de `parallel()` (dedupe antes de estagio caro), nao violacao do smell test.
- **Acordo descartado**: colapsar os votos em boolean (`survived`) apaga "sobreviveu 2/3"
  e "3 lentes independentes concordam" do relatorio.
- **Merge nao medido**: sem `estTokens` bruto -> reduzido, nao ha como saber se o reducer
  cortou alguma coisa.
- **Spawn sem cap**: prototipo real spawnou ~50 subagents pra query simples.
- **`Date.now()`/`Math.random()`/`new Date()` no script**: THROW (quebram resume).
  Timestamp vem por `args`; aleatoriedade = variar prompt/label por indice.
- **`args` stringificado**: passe arrays/objetos como JSON REAL na tool call --
  string JSON vira 1 string so e `args.map` explode.
- **Resultado vazio "misterioso"**: antes de teorizar, leia `journal.jsonl` no
  transcriptDir do run -- registra o retorno REAL de cada agente (cache pode ser vazio).
- **Meta computado**: `export const meta` e literal PURO -- sem variavel/spread/template.
- **Workflow so com opt-in explicito** do usuario (palavra "workflow", ultracode,
  skill que mande, pedido direto). Tarefa que "se beneficiaria" NAO basta -- descreva
  custo e pergunte.

## Biblioteca (grafos salvos, re-runnaveis; LOCAL-ONLY, nunca versionar)
Globais (`~/.claude/workflows/`): `adversarial-review`, `discovery-until-dry`,
`kg-ingestion` (KG semantico de docs), `memory-consolidation` (dreaming), `dependency-waves`
(planejador de ondas). Projetos podem ter overlay proprio em `<projeto>/.claude/workflows/`.
Indice completo: `~/.claude/workflows/README.md`.
Ticket como prompt executavel: comando `/ticket`.

## Fechamento (learning law)
Grafo que rodou bem = ativo: salve em `.claude/workflows/` (global se agnostico, projeto se
especifico). Solve nao-trivial fecha com `extract-approach` (projeto com vault proprio: regra do
projeto define o destino).

Ver tambem: `/ggraph` (protocolo), `loop-global` (a irma: cadencia, gates, state),
fontes completas em `docs/SOURCES.md` do repo agentic-os.
