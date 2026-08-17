# 06 — Plan-loop: planejamento com gate-stop

Irmao do loop de codigo (`05`), mas o ENTREGAVEL e um PLANO — nunca codigo de producao.
Resolve o problema de "plano bonito que alucina arquivo, ignora regra e promete o que nao
foi decidido". O mecanismo do loop funciona porque o gate de plano tambem pode REPROVAR.

## O que produz / o que nunca faz

Produz: `PLAN-<slug>.md` (fases pequenas; cada tarefa com arquivos exatos, verificacao
executavel, criterio de sucesso observavel, teste antes da implementacao) + state file.
NUNCA: escreve codigo de producao, roda migration, commita. Spike read-only e permitido.

## Step 0 — brainstorm antes de plano

Extraia o spec da conversa ANTES de desenhar (o que, pra quem, criterio de pronto).
Levante TODAS as decisoes que dependem do humano e pergunte em UMA rodada com
recomendacao por item. Decisao de PRODUTO que pende de terceiro: o plano marca a
hipotese como **PENDENTE VALIDACAO <nome>** — nunca a promove a decisao firme.

## Gate do plano (G1-G5 — objetivo, com evidencia colada)

- **G1 Grounding**: TODO `arquivo:linha`/simbolo citado no plano existe — verifique cada
  citacao (grep/exists) e cole a tabela citacao → prova. 1 citacao inventada = VERMELHO.
- **G2 Cobertura de regras**: cada regra do corpus roteada pra tarefa tem tratamento
  explicito no plano (casos de teste exigidos, zonas proibidas listadas, escopo negativo
  declarado). Sem corpus ainda: o plano inclui tarefa de REGISTRAR a regra descoberta.
- **G3 Conformidade de formato**: checklist binario por tarefa — (a) arquivos exatos,
  (b) verificacao executavel (comando de gate por alvo estreito, nunca o monorepo),
  (c) criterio de sucesso observavel, (d) teste antes de implementacao.
- **G4 Contrato**: se existe artefato de contrato da tarefa (ticket/packet), as secoes
  planejaveis estao preenchidas. Contrato ausente e o loop for read-only: G4 fica
  VERDE-CONDICIONAL se o plano contem tarefa Gate-0 explicita que gera e preenche o
  contrato ANTES da primeira tarefa de implementacao.
- **G5 Invariantes mecanicos (auto-grep do PLANO — rode de verdade, cole o output)**:
  checklist auto-avaliado mente; estes sao greps binarios no arquivo do plano:
  (a) comando proibido pelo projeto dentro de bloco de codigo = VERMELHO;
  (b) mencao a migration/schema/permissao/zona sensivel sem a string literal
      `APROVACAO HUMANA OBRIGATORIA` na mesma tarefa = VERMELHO;
  (c) marcas `PENDENTE VALIDACAO` nao podem sumir do plano final (decisao humana
      promovida silenciosamente = VERMELHO).

## Checker adversarial (so roda com G1-G5 verde)

Contexto separado, rubric goal-backward: "execute este plano mentalmente como um junior
entusiasmado sem contexto do projeto, sem julgamento e avesso a teste — cada criterio de
sucesso e alcancado por alguma tarefa? Ha decisao escondida? Passo que depende de
informacao que o plano nao da? Zona proibida tocada sem flag? E confira o plano contra os
invariantes DESTE protocolo, item a item." >=1 furo confirmado = nova iteracao.

## HARD-STOPS

Sucesso = G1-G5 verde + checker sem furo → apresente plano + evidencias NA MESMA mensagem
(plano sem evidencia = entrega incompleta). Demais: 5 iteracoes; 2 sem progresso; decisao
humana pendente; brainstorm revelou que a tarefa nao deveria ser feita (pare e reporte —
nao planeje por inercia).

## Depois do plano

Humano aprova → o loop de codigo (`05`) executa fase a fase com o gate de build+teste.
Estimativa do plano e referencia interna de capacidade, nunca prazo prometido a terceiros.
