# HISTORY. Como este sistema foi construído (linha do tempo real)

Registro honesto: o sistema não nasceu desenhado; foi destilado de trabalho de produção,
uma dor por vez. Datas de 2026.

## Fev-Jun. Fundação

- Regras de projeto (root cause obrigatório, TDD, zonas write-once) nascem de bugs
  reais e viram texto versionado.
- Vault de conhecimento (Obsidian) + memória por projeto com índice, a primeira vez
  que uma sessão herdou o método da anterior.
- Skills de domínio e workflow universal de task.

## 06-07/jul. A grande auditoria (a virada de "coleção" pra "sistema")

- Meta-auditoria completa do stack de instruções: 9 conflitos entre camadas achados e
  RESOLVIDOS em tabela de precedência (`core/03` é o neto disso).
- JUDGMENT destilado como prótese de julgamento pra modelo menor operar como o maior.
- Kernel enxugado ~49% (token economy): nasce a regra "índice aponta, não contém".
- Validado: executor menor + documento brilhante >= executor brilhante sem documento.
- MODEL-ROUTING v2 com benchmarks públicos (advisor 92%@63%, orchestrator 96%@46%).

## 23-24/jul. Graph engineering em 48h

- Estudo completo da onda: playbook KG (12 pág.), série de artigos no X, palestra Lance
  Martin, engineering blog da Anthropic (fontes e flags em `SOURCES.md`).
- P0 executado: skill de grafo + protocolo + 5 workflows salvos (adversarial-review,
  discovery-until-dry, dependency-waves, kg-ingestion, memory-consolidation).
- Loops e grafos integrados: BRIDGE loop→grafo (etapa que divide vira grafo e volta).
- Auto-observabilidade: auditoria de uso de 30 sessões + "dreaming" mensal agendado.

## 31/jul-08/ago. Loop engineering em produção

- Loop gate-stop (find→act→gate→record→decide) roda tarefas reais; hard-stops e state
  files calibrados por falha real (5 iterações, 2 sem progresso, teto de custo).
- Corpus de regras do projeto: pack/packet/gate/verify/lint, regra de negócio roteada
  por trigger, teste marcado por regra, gate machine-readable (`core/09`).

## 17/ago. Plan-loop e a lição do G5

- Loop de PLANEJAMENTO criado (brainstorm → plano → gates → checker) e testado em tarefa
  real no MESMO dia. Primeira execução entregou plano violando 2 invariantes escritos em
  prosa → nasce o G5 (assertions mecânicas no próprio plano) e a lição mais importante
  do sistema: **invariante em prosa não segura o modelo** (`lessons/gate-design.md`).
- Segunda execução: honesta até no vermelho (gate de contrato reprovou a si mesmo por
  falta do packet, comportamento desejado).
- Mesmo dia: auditoria do sistema contra o artigo "Graph Engineering" (a fonte didática
  da série): ~90% já implementado, lacunas mapeadas.
- Este repo nasce: o sistema extraído do projeto-origem e generalizado.

## O padrão que a linha do tempo mostra

Cada peça entrou DEPOIS de uma dor real, foi testada em produção no mesmo ciclo, e a
lição virou artefato versionado (regra, gate, lesson). É o próprio método aplicado a si
mesmo: loop com gate, learning law, poda por auditoria de uso.

## 18/ago. Primeira volta do circuito de evolução

- Bootstrap do agentic-os num segundo projeto real (agente desktop .NET + backend).
  Primeira tarefa de produção: ticket de suporte com 39 falsos "firewall desabilitado".
- O loop segurou: checker reprovou a 1ª implementação, TDD com RED provado, duas pausas
  em zona proibida (produção read-only e regra temporária com cleanup verificado).
- Auditoria externa do relato de processo gerou 5 melhorias no protocolo (gate provisório
  pra área não mapeada, checker auditável, acesso temporário em passos separados,
  evidência de baseline em arquivo, fechamento de ticket com rascunho de resposta),
  aplicadas primeiro na instância do projeto e portadas pra cá no mesmo dia. É o circuito
  desenhado em `core/08`: a lição nasce no projeto, vira changelog na instância e sobe
  pro canônico quando provada.
