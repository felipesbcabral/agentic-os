# 07. Graph engineering: coordenar muitos loops

Grafo = a FORMA do trabalho: nodes fazem o pensar, edges carregam os resultados.
Loop = cadência no TEMPO; grafo = forma no ESPAÇO. Quando o próximo passo de um loop
DIVIDE em peças que não leem o resultado umas das outras, a etapa vira grafo.

## Vocabulário (6 palavras)

1. **box (job)**: unidade de trabalho de 1 agente (1 input, 1 output, 1 responsabilidade).
2. **arrow (hand-off)**: dependência REAL, o output de A entra no prompt de B.
3. **running notes**: o estado que viaja com o trabalho.
4. **fake edge**: "e depois" onde NENHUM dado atravessa. Espera desperdiçada: delete.
5. **diamond**: split → workers paralelos → verify → merge. A topologia que paga.
6. **gate (the last yes)**: aprovação humana onde o erro é caro de desfazer.

## Stop rule (falhou 1 = NÃO faça grafo)

1. **Divide?** Peças que não leem o resultado umas das outras? Sequencial = 1 agente.
2. **Verificável?** Dá pra pôr um cético em cima de cada achado? Sem verify, fan-out
   multiplica slop.
3. **Budget?** Multi-agente custa 10-15x tokens de um chat, só paga em trabalho que
   divide de verdade (~90% de ganho em tarefa paralelizável, benchmark público).
4. **Merge cabe?** A síntese final precisa caber num contexto; senão redesenhe as peças.

Grafo compra LARGURA, não julgamento.

## As 4 formas (quase todo grafo de produção é combinação delas)

- **Chain** `A→B→C`: cada passo exige o anterior. Simples e frequentemente lento demais.
- **Diamond** `A→{B1,B2,B3}→C`: split em ângulos DISTINTOS, paralelo, verify, merge.
  Workhorse de pesquisa, review, auditoria.
- **Router** `CLASSIFY→{caminho curto | auditoria completa}`: inspeciona estado e escolhe
  só o caminho que a tarefa precisa. Trabalho pequeno fica barato.
- **Controlled cycle** `WORK→VERIFY→(pass? exit : feedback→WORK)`: repete só quando a
  evidência diz que falta. Todo ciclo com hard-stop, budget e regra de convergência.

## Regras de fiação (anti-acidente)

- **Fake edges primeiro**: pra cada "e depois", o próximo job LÊ o output do anterior?
  Não → rodam juntos. Custo zero, remove mais espera que qualquer ferramenta.
- **Contrato por node**: input explícito no prompt (nunca "assuma do contexto"), output
  com schema validado. É o que torna um node paralelizável e substituível.
- **Edge é CÓDIGO**: flatten/dedupe/filter/sort/join = código puro, 0 tokens. Agente para
  plumbing = pagar aluguel pela própria fiação. Modelo preenche NODES; código é dono das
  EDGES (roteamento em if/switch sobre output validado; "o agente decidiu pular a
  auditoria" não existe se o pulo não está escrito no grafo).
- **Streaming default; barreira é exceção**: item A pode estar na fase 3 enquanto B está
  na 1. Barreira só quando o estágio precisa do conjunto INTEIRO (dedupe cross-set,
  ranking global, early-exit no total).
- **Reducer antes do estágio caro**: dedupe entre workers ANTES do verify/síntese (o mesmo
  item achado por 3 lentes contrata 3 verifies); acordo/discordância são dados a emitir
  (`agreement: N`, votos); meça a entrada do merge (tokens bruto → reduzido).
- **1 writer por arquivo**: 2+ agentes editando em paralelo = workspace isolado por agente.
- **Cap em tudo**: max rounds por ciclo, cap de spawn, teto de token ANTES de rodar.
  Sem cap silencioso: top-N/sampling/no-retry → logue o que foi dropado.
- **Fan-in tolera faltante**: branch que falha vira null; merge nunca assume conjunto
  completo; uma branch quebrada não derruba as outras.

## Ciclos que convergem (loop-until-dry)

Descoberta de tamanho desconhecido: rode finders até K rodadas seguidas (K=2) sem nada
NOVO. O detalhe que quebra todo mundo: **dedupe contra TUDO que já foi visto, nunca só
contra os confirmados**, senão achado rejeitado pelo verify reaparece toda rodada e o
ciclo nunca seca. Todo ciclo: teste de completude + max rounds + budget + registro de
tentativas + rota de escalação.

## Estado durável (o que os diagramas escondem)

O grafo responde a 3 perguntas a qualquer momento: o que já aconteceu? por que esta rota?
onde retoma com segurança? Isso exige estado fora do contexto: task id, node atual,
artefatos, decisões, budgets, aprovações. Mova REFERÊNCIAS a artefatos entre nodes, nunca
transcripts gigantes: o revisor lê o artefato direto, não um reconto comprimido por 3
agentes. Checkpoint depois de node caro; escrita idempotente (retry não duplica efeito).

## Verify e human gate

Padrões de verify por risco: `04-verification.md`. Human gate fica onde o erro é caro de
desfazer: gate em tudo = você é o gargalo; gate em nada = ninguém olhando. Merge/commit/
publicação: sempre humano.

## Custo = topologia

Modelo barato em node repetitivo/bounded (extrair, classificar, varrer); modelo caro em
decomposição, síntese e verify difícil. Rota curta pra tarefa simples; grafo completo só
pra trabalho que o merece. Detalhe: `10-model-routing.md`.

## Biblioteca

Grafo que rodou bem = ativo reusável: salve com nome (global se agnóstico, no projeto se
específico). Implementações de referência (runtime Claude Code) em
`../adapters/claude-code/workflows/`. O DESENHO (fases, contratos, verify, caps) é
portável pra qualquer runtime, inclusive "manual": você mesmo orquestrando N conversas.
