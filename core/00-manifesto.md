# 00 — Manifesto: a escada e a regra de ouro

## A escada de alavanca

```
L0 Chat  ->  L1 Chat+tools  ->  L2 Harness/loop  ->  L3 Grafo (loop de loops)
```

E, ortogonal a ela, as cinco disciplinas:

```
PROMPT  ->  CONTEXT  ->  HARNESS  ->  LOOP  ->  GRAPH
mensagem    memoria      maquina      corrida   coordenacao
```

- **Prompt**: melhora a instrucao de UMA mensagem.
- **Context**: controla o que o modelo VE (regras, memoria, corpus — `07-context-engineering.md`).
- **Harness**: o ambiente em volta (hooks, gates, permissoes, proxies de economia).
- **Loop**: uma unidade de trabalho que melhora por feedback ate um gate objetivo passar
  (`05-loop-engineering.md`).
- **Graph**: coordenacao de muitos loops — o que roda antes, o que roda junto, o que espera
  (`07-graph-engineering.md`).

A alavanca sai de "digitar prompt melhor" para "desenhar o sistema que prompta".
Um prompter pede mais ao agente; um arquiteto redesenha o grafo pra que o SISTEMA
entregue mais com seguranca. O modelo e um no; o produto e o sistema em volta.

## Regra de ouro: indice aponta, nao contem

Todo documento deste sistema APONTA para o proximo nivel de detalhe em vez de conte-lo.
Contexto de IA e caro e finito; o que nao esta em uso nao deve estar carregado.
Consequencias praticas:

- Arquivo de entrada do projeto (`CLAUDE.md`/`AGENTS.md`) = indice curto + invariantes.
  Regra detalhada mora em arquivo proprio, carrega sob demanda.
- Memoria = indice de 1 linha por item; corpo em arquivo separado.
- Skill/protocolo relido INTEIRO a cada volta de loop so quando e curto de proposito
  (mais barato que re-derivar a regra).

## Ordem de leitura para uma IA encarnando este sistema

1. Este manifesto.
2. `01-judgment.md` + `02-execution.md` — como decidir e como entregar (o kernel).
3. `03-precedence.md` — quem vence quando camadas conflitam.
4. `04-verification.md` — a disciplina que sustenta todo o resto.
5. Os demais sob demanda, pelo tipo de trabalho: loop (05/06), grafo (07),
   memoria (08), contexto/corpus (09), roteamento de modelo (10), escrita (11).

## O teste de honestidade

A maioria das tarefas NAO precisa de loop, e a maioria dos loops NAO precisa de grafo.
Comece com um bom prompt; suba um degrau da escada apenas quando a condicao do degrau
atual falhar de forma comprovada (as 4 condicoes de loop em `05`, a stop rule de grafo
em `07`). Subir degrau por status e a forma mais cara de nao resolver o problema.
