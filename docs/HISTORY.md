# HISTORY — como este sistema foi construido (linha do tempo real)

Registro honesto: o sistema nao nasceu desenhado; foi destilado de trabalho de producao,
uma dor por vez. Datas de 2026.

## Fev-Jun — fundacao

- Regras de projeto (root cause obrigatorio, TDD, zonas write-once) nascem de bugs
  reais e viram texto versionado.
- Vault de conhecimento (Obsidian) + memoria por projeto com indice — a primeira vez
  que uma sessao herdou o metodo da anterior.
- Skills de dominio e workflow universal de task.

## 06-07/jul — a grande auditoria (a virada de "colecao" pra "sistema")

- Meta-auditoria completa do stack de instrucoes: 9 conflitos entre camadas achados e
  RESOLVIDOS em tabela de precedencia (`core/03` e o neto disso).
- JUDGMENT destilado como protese de julgamento pra modelo menor operar como o maior.
- Kernel enxugado ~49% (token economy): nasce a regra "indice aponta, nao contem".
- Validado: executor menor + documento brilhante >= executor brilhante sem documento.
- MODEL-ROUTING v2 com benchmarks publicos (advisor 92%@63%, orchestrator 96%@46%).

## 23-24/jul — graph engineering em 48h

- Estudo completo da onda: playbook KG (12 pag.), serie de artigos no X, palestra Lance
  Martin, engineering blog da Anthropic (fontes e flags em `SOURCES.md`).
- P0 executado: skill de grafo + protocolo + 5 workflows salvos (adversarial-review,
  discovery-until-dry, dependency-waves, kg-ingestion, memory-consolidation).
- Loops e grafos integrados: BRIDGE loop→grafo (etapa que divide vira grafo e volta).
- Auto-observabilidade: auditoria de uso de 30 sessoes + "dreaming" mensal agendado.

## 31/jul-08/ago — loop engineering em producao

- Loop gate-stop (find→act→gate→record→decide) roda tarefas reais; hard-stops e state
  files calibrados por falha real (5 iteracoes, 2 sem progresso, teto de custo).
- Corpus de regras do projeto: pack/packet/gate/verify/lint — regra de negocio roteada
  por trigger, teste marcado por regra, gate machine-readable (`core/09`).

## 17/ago — plan-loop e a licao do G5

- Loop de PLANEJAMENTO criado (brainstorm → plano → gates → checker) e testado em tarefa
  real no MESMO dia. Primeira execucao entregou plano violando 2 invariantes escritos em
  prosa → nasce o G5 (assertions mecanicas no proprio plano) e a licao mais importante
  do sistema: **invariante em prosa nao segura o modelo** (`lessons/gate-design.md`).
- Segunda execucao: honesta ate no vermelho (gate de contrato reprovou a si mesmo por
  falta do packet — comportamento desejado).
- Mesmo dia: auditoria do sistema contra o artigo "Graph Engineering" (a fonte didatica
  da serie) — ~90% ja implementado, lacunas mapeadas.
- Este repo nasce: o sistema extraido do projeto-origem e generalizado.

## O padrao que a linha do tempo mostra

Cada peca entrou DEPOIS de uma dor real, foi testada em producao no mesmo ciclo, e a
licao virou artefato versionado (regra, gate, lesson). E o proprio metodo aplicado a si
mesmo: loop com gate, learning law, poda por auditoria de uso.
