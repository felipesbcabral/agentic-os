# <NOME DO PROJETO> — instrucoes para agentes

> Indice: aponta, nao contem. Detalhe mora nos arquivos apontados.
> Metodo completo: agentic-os (<caminho-ou-url-do-repo>).

## Objetivo

<1 frase. E o norte anti goal-drift — o loop rele isto toda volta.>

## Stack e gate (verificacao objetiva)

- Stack: <linguagens/frameworks>
- **Gate (comando literal, caminho absoluto, validado em <data>):**

```
<comando de build>
<comando de teste focado — alvo estreito, nunca o monorepo>
```

Verde = pode seguir. Vermelho = itera. Prova e COLADA no chat, nunca prometida.

## Invariantes (zona proibida — hard-stop, precisa de humano)

- <invariante de dominio 1 — ex.: dados write-once, tabela X intocavel>
- <invariante 2>
- Universais: credenciais, auth/payments, migrations/schema, infra/deploy, conteudo
  publico, acao irreversivel (commit/push/delete) — sempre humano.

## Protocolos (por referencia)

- Tarefa iterativa com gate → loop gate-stop (agentic-os `core/05-loop-engineering.md`)
- Planejar antes de implementar → plan-loop G1-G5 (`core/06-plan-loop.md`)
- Trabalho que divide em pecas independentes → grafo (`core/07-graph-engineering.md`)
- Solve nao-trivial fecha com nota de aprendizado (`core/08-memory-learning.md`)

## Corpus de regras

`knowledge/START-HERE.md`. Regra de negocio descoberta = registrada no MESMO diff
(`core/09-context-engineering.md`). Pack vazio = area nao mapeada, nao "sem regras".

## Memoria

`<caminho da memoria>` — indice 1-linha; corpo em arquivos. Lessons semeadas do
agentic-os em `<caminho>`.
