# Loop state -- <projeto> / <slug da tarefa>

> Memoria que sobrevive entre voltas do /gloop. O agente esquece, o arquivo nao.
> Copia este template pra ./.loop/state-<slug>.md. Atualiza ao fim de CADA iteracao.

## Goal / Spec
<!-- Onde o loop quer chegar. Setado por `/gloop <tarefa>`. Reler toda volta. -->
(vazio -- rode `/gloop <descricao da tarefa>`)

## Gate (comandos ABSOLUTOS ja verificados -- baseline verde antes de mexer)
<!-- Auto-detectado por stack (ver skill loop-global). Caminho absoluto do repo. -->
- build: `<comando build absoluto>`
- test:  `<comando test absoluto, alvo estreito>`
- lint:  `<comando lint/type, se houver>`

## Classificacao
- TYPE: (bug | feature | refactor | chore)
- RISCO DE ZONA: (nenhum | ALTO -- auth/payments/migration/secrets/snapshot/CFG)

## Step 0 (1x)
- [ ] gate detectado e baseline verde confirmado
- [ ] zone scan feito; decisoes de humano resolvidas (se houver)

## Last run
(nenhuma ainda)

## In progress
- (nada)

## Completed
- (nada)

## Escalated to human (zona proibida / judgment-call)
- (nada)

## Lessons learned (escreve aqui, nao no chat)
- (nada)

## Stop conditions atingidas
- (nada)
