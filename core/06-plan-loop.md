# 06. Plan-loop: planejamento com gate-stop

Irmão do loop de código (`05`), mas o ENTREGÁVEL é um PLANO, nunca código de produção.
Resolve o problema de "plano bonito que alucina arquivo, ignora regra e promete o que não
foi decidido". O mecanismo do loop funciona porque o gate de plano também pode REPROVAR.

## O que produz / o que nunca faz

Produz: `PLAN-<slug>.md` (fases pequenas; cada tarefa com arquivos exatos, verificação
executável, critério de sucesso observável, teste antes da implementação) + state file.
NUNCA: escreve código de produção, roda migration, commita. Spike read-only é permitido.

## Step 0: brainstorm antes de plano

Extraia o spec da conversa ANTES de desenhar (o que, pra quem, critério de pronto).
Levante TODAS as decisões que dependem do humano e pergunte em UMA rodada com
recomendação por item. Decisão de PRODUTO que pende de terceiro: o plano marca a
hipótese como **PENDENTE VALIDACAO <nome>**, nunca a promove a decisão firme.

## Gate do plano (G1-G5: objetivo, com evidência colada)

- **G1 Grounding**: TODO `arquivo:linha`/símbolo citado no plano existe. Verifique cada
  citação (grep/exists) e cole a tabela citação → prova. 1 citação inventada = VERMELHO.
- **G2 Cobertura de regras**: cada regra do corpus roteada pra tarefa tem tratamento
  explícito no plano (casos de teste exigidos, zonas proibidas listadas, escopo negativo
  declarado). Sem corpus ainda: o plano inclui tarefa de REGISTRAR a regra descoberta.
- **G3 Conformidade de formato**: checklist binário por tarefa: (a) arquivos exatos,
  (b) verificação executável (comando de gate por alvo estreito, nunca o monorepo),
  (c) critério de sucesso observável, (d) teste antes de implementação.
- **G4 Contrato**: se existe artefato de contrato da tarefa (ticket/packet), as seções
  planejáveis estão preenchidas. Contrato ausente e o loop for read-only: G4 fica
  VERDE-CONDICIONAL se o plano contém tarefa Gate-0 explícita que gera e preenche o
  contrato ANTES da primeira tarefa de implementação.
- **G5 Invariantes mecânicos (auto-grep do PLANO: rode de verdade, cole o output)**:
  checklist auto-avaliado mente; estes são greps binários no arquivo do plano:
  (a) comando proibido pelo projeto dentro de bloco de código = VERMELHO;
  (b) menção a migration/schema/permissão/zona sensível sem a string literal
      `APROVACAO HUMANA OBRIGATORIA` na mesma tarefa = VERMELHO;
  (c) marcas `PENDENTE VALIDACAO` não podem sumir do plano final (decisão humana
      promovida silenciosamente = VERMELHO).

## Checker adversarial (só roda com G1-G5 verde)

Contexto separado, rubric goal-backward: "execute este plano mentalmente como um junior
entusiasmado sem contexto do projeto, sem julgamento e avesso a teste: cada critério de
sucesso é alcançado por alguma tarefa? Há decisão escondida? Passo que depende de
informação que o plano não dá? Zona proibida tocada sem flag? E confira o plano contra os
invariantes DESTE protocolo, item a item." >=1 furo confirmado = nova iteração.

## HARD-STOPS

Sucesso = G1-G5 verde + checker sem furo → apresente plano + evidências NA MESMA mensagem
(plano sem evidência = entrega incompleta). Demais: 5 iterações; 2 sem progresso; decisão
humana pendente; brainstorm revelou que a tarefa não deveria ser feita (pare e reporte,
não planeje por inércia).

## Depois do plano

Humano aprova → o loop de código (`05`) executa fase a fase com o gate de build+teste.
Estimativa do plano é referência interna de capacidade, nunca prazo prometido a terceiros.
