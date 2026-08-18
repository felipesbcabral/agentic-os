# <NOME DO PROJETO>. Instruções para agentes

> Índice: aponta, não contém. Detalhe mora nos arquivos apontados.
> Método completo: agentic-os (<caminho-ou-url-do-repo>).

## Objetivo

<1 frase. É o norte anti goal-drift; o loop relê isto toda volta.>

## Stack e gate (verificação objetiva)

- Stack: <linguagens/frameworks>
- **Gate (comando literal, caminho absoluto, validado em <data>):**

```
<comando de build>
<comando de teste focado: alvo estreito, nunca o monorepo>
```

Verde = pode seguir. Vermelho = itera. Prova é COLADA no chat, nunca prometida.

## Invariantes (zona proibida: hard-stop, precisa de humano)

- <invariante de domínio 1, ex.: dados write-once, tabela X intocável>
- <invariante 2>
- Universais: credenciais, auth/payments, migrations/schema, infra/deploy, conteúdo
  público, ação irreversível (commit/push/delete): sempre humano.

## Protocolos (por referência)

- Tarefa iterativa com gate → loop gate-stop (agentic-os `core/05-loop-engineering.md`)
- Planejar antes de implementar → plan-loop G1-G5 (`core/06-plan-loop.md`)
- Trabalho que divide em peças independentes → grafo (`core/07-graph-engineering.md`)
- Solve não-trivial fecha com nota de aprendizado (`core/08-memory-learning.md`)

## Corpus de regras

`knowledge/START-HERE.md`. Regra de negócio descoberta = registrada no MESMO diff
(`core/09-context-engineering.md`). Pack vazio = área não mapeada, não "sem regras".

## Memória

`<caminho da memoria>`: índice 1-linha; corpo em arquivos. Lessons semeadas do
agentic-os em `<caminho>`.
