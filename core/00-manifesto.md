# 00. Manifesto: a escada e a regra de ouro

## A escada de alavanca

```
L0 Chat  ->  L1 Chat+tools  ->  L2 Harness/loop  ->  L3 Grafo (loop de loops)
```

E, ortogonal a ela, as cinco disciplinas:

```
PROMPT  ->  CONTEXT  ->  HARNESS  ->  LOOP  ->  GRAPH
mensagem    memória      máquina      corrida   coordenação
```

- **Prompt**: melhora a instrução de UMA mensagem.
- **Context**: controla o que o modelo VÊ (regras, memória, corpus: `09-context-engineering.md`).
- **Harness**: o ambiente em volta (hooks, gates, permissões, proxies de economia).
- **Loop**: uma unidade de trabalho que melhora por feedback até um gate objetivo passar
  (`05-loop-engineering.md`).
- **Graph**: coordenação de muitos loops: o que roda antes, o que roda junto, o que espera
  (`07-graph-engineering.md`).

A alavanca sai de "digitar prompt melhor" para "desenhar o sistema que prompta".
Um prompter pede mais ao agente; um arquiteto redesenha o grafo pra que o SISTEMA
entregue mais com segurança. O modelo é um nó; o produto é o sistema em volta.

## Regra de ouro: índice aponta, não contém

Todo documento deste sistema APONTA para o próximo nível de detalhe em vez de contê-lo.
Contexto de IA é caro e finito; o que não está em uso não deve estar carregado.
Consequências práticas:

- Arquivo de entrada do projeto (`CLAUDE.md`/`AGENTS.md`) = índice curto + invariantes.
  Regra detalhada mora em arquivo próprio, carrega sob demanda.
- Memória = índice de 1 linha por item; corpo em arquivo separado.
- Skill/protocolo relido INTEIRO a cada volta de loop só quando é curto de propósito
  (mais barato que re-derivar a regra).

## Ordem de leitura para uma IA encarnando este sistema

1. Este manifesto.
2. `01-judgment.md` + `02-execution.md`: como decidir e como entregar (o kernel).
3. `03-precedence.md`: quem vence quando camadas conflitam.
4. `04-verification.md`: a disciplina que sustenta todo o resto.
5. Os demais sob demanda, pelo tipo de trabalho: loop (05/06), grafo (07),
   memória (08), contexto/corpus (09), roteamento de modelo (10), escrita (11).

## O teste de honestidade

A maioria das tarefas NÃO precisa de loop, e a maioria dos loops NÃO precisa de grafo.
Comece com um bom prompt; suba um degrau da escada apenas quando a condição do degrau
atual falhar de forma comprovada (as 4 condições de loop em `05`, a stop rule de grafo
em `07`). Subir degrau por status é a forma mais cara de não resolver o problema.
