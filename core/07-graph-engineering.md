# 07 — Graph engineering: coordenar muitos loops

Grafo = a FORMA do trabalho: nodes fazem o pensar, edges carregam os resultados.
Loop = cadencia no TEMPO; grafo = forma no ESPACO. Quando o proximo passo de um loop
DIVIDE em pecas que nao leem o resultado umas das outras, a etapa vira grafo.

## Vocabulario (6 palavras)

1. **box (job)**: unidade de trabalho de 1 agente — 1 input, 1 output, 1 responsabilidade.
2. **arrow (hand-off)**: dependencia REAL — o output de A entra no prompt de B.
3. **running notes**: o estado que viaja com o trabalho.
4. **fake edge**: "e depois" onde NENHUM dado atravessa. Espera desperdicada — delete.
5. **diamond**: split → workers paralelos → verify → merge. A topologia que paga.
6. **gate (the last yes)**: aprovacao humana onde o erro e caro de desfazer.

## Stop rule (falhou 1 = NAO faca grafo)

1. **Divide?** Pecas que nao leem o resultado umas das outras? Sequencial = 1 agente.
2. **Verificavel?** Da pra por um cetico em cima de cada achado? Sem verify, fan-out
   multiplica slop.
3. **Budget?** Multi-agente custa 10-15x tokens de um chat — so paga em trabalho que
   divide de verdade (~90% de ganho em tarefa paralelizavel, benchmark publico).
4. **Merge cabe?** A sintese final precisa caber num contexto; senao redesenhe as pecas.

Grafo compra LARGURA, nao julgamento.

## As 4 formas (quase todo grafo de producao e combinacao delas)

- **Chain** `A→B→C`: cada passo exige o anterior. Simples e frequentemente lento demais.
- **Diamond** `A→{B1,B2,B3}→C`: split em angulos DISTINTOS, paralelo, verify, merge.
  Workhorse de pesquisa, review, auditoria.
- **Router** `CLASSIFY→{caminho curto | auditoria completa}`: inspeciona estado e escolhe
  so o caminho que a tarefa precisa. Trabalho pequeno fica barato.
- **Controlled cycle** `WORK→VERIFY→(pass? exit : feedback→WORK)`: repete so quando a
  evidencia diz que falta. Todo ciclo com hard-stop, budget e regra de convergencia.

## Regras de fiacao (anti-acidente)

- **Fake edges primeiro**: pra cada "e depois", o proximo job LE o output do anterior?
  Nao → rodam juntos. Custo zero, remove mais espera que qualquer ferramenta.
- **Contrato por node**: input explicito no prompt (nunca "assuma do contexto"), output
  com schema validado. E o que torna um node paralelizavel e substituivel.
- **Edge e CODIGO**: flatten/dedupe/filter/sort/join = codigo puro, 0 tokens. Agente para
  plumbing = pagar aluguel pela propria fiacao. Modelo preenche NODES; codigo e dono das
  EDGES (roteamento em if/switch sobre output validado — "o agente decidiu pular a
  auditoria" nao existe se o pulo nao esta escrito no grafo).
- **Streaming default; barreira e excecao**: item A pode estar na fase 3 enquanto B esta
  na 1. Barreira so quando o estagio precisa do conjunto INTEIRO (dedupe cross-set,
  ranking global, early-exit no total).
- **Reducer antes do estagio caro**: dedupe entre workers ANTES do verify/sintese (o mesmo
  item achado por 3 lentes contrata 3 verifies); acordo/discordancia sao dados a emitir
  (`agreement: N`, votos); meca a entrada do merge (tokens bruto → reduzido).
- **1 writer por arquivo**: 2+ agentes editando em paralelo = workspace isolado por agente.
- **Cap em tudo**: max rounds por ciclo, cap de spawn, teto de token ANTES de rodar.
  Sem cap silencioso: top-N/sampling/no-retry → logue o que foi dropado.
- **Fan-in tolera faltante**: branch que falha vira null; merge nunca assume conjunto
  completo; uma branch quebrada nao derruba as outras.

## Ciclos que convergem (loop-until-dry)

Descoberta de tamanho desconhecido: rode finders ate K rodadas seguidas (K=2) sem nada
NOVO. O detalhe que quebra todo mundo: **dedupe contra TUDO que ja foi visto, nunca so
contra os confirmados** — senao achado rejeitado pelo verify reaparece toda rodada e o
ciclo nunca seca. Todo ciclo: teste de completude + max rounds + budget + registro de
tentativas + rota de escalacao.

## Estado durvel (o que os diagramas escondem)

O grafo responde a 3 perguntas a qualquer momento: o que ja aconteceu? por que esta rota?
onde retoma com seguranca? Isso exige estado fora do contexto: task id, node atual,
artefatos, decisoes, budgets, aprovacoes. Mova REFERENCIAS a artefatos entre nodes, nunca
transcripts gigantes — o revisor le o artefato direto, nao um reconto comprimido por 3
agentes. Checkpoint depois de node caro; escrita idempotente (retry nao duplica efeito).

## Verify e human gate

Padroes de verify por risco: `04-verification.md`. Human gate fica onde o erro e caro de
desfazer — gate em tudo = voce e o gargalo; gate em nada = ninguem olhando. Merge/commit/
publicacao: sempre humano.

## Custo = topologia

Modelo barato em node repetitivo/bounded (extrair, classificar, varrer); modelo caro em
decomposicao, sintese e verify dificil. Rota curta pra tarefa simples; grafo completo so
pra trabalho que o merece. Detalhe: `10-model-routing.md`.

## Biblioteca

Grafo que rodou bem = ativo reusavel: salve com nome (global se agnostico, no projeto se
especifico). Implementacoes de referencia (runtime Claude Code) em
`../adapters/claude-code/workflows/`. O DESENHO (fases, contratos, verify, caps) e
portavel pra qualquer runtime — inclusive "manual": voce mesmo orquestrando N conversas.
