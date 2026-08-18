# Loop state: <projeto> / <slug da tarefa>

> Memória que sobrevive entre voltas do /gloop. O agente esquece, o arquivo não.
> Copia este template pra ./.loop/state-<slug>.md. Atualiza ao fim de CADA iteração.

## Goal / Spec
<!-- Onde o loop quer chegar. Setado por `/gloop <tarefa>`. Reler toda volta. -->
(vazio; rode `/gloop <descricao da tarefa>`)

## Gate (comandos ABSOLUTOS já verificados: baseline verde antes de mexer)
<!-- Auto-detectado por stack (ver skill loop-global). Caminho absoluto do repo. -->
- build: `<comando build absoluto>`
- test:  `<comando test absoluto, alvo estreito>`
- lint:  `<comando lint/type, se houver>`

## Classificação
- TYPE: (bug | feature | refactor | chore)
- RISCO DE ZONA: (nenhum | ALTO: auth/payments/migration/secrets/snapshot/CFG)

## Step 0 (1x)
- [ ] gate detectado e baseline verde confirmado
- [ ] zone scan feito; decisões de humano resolvidas (se houver)

## Last run
(nenhuma ainda)

## In progress
- (nada)

## Completed
- (nada)

## Escalated to human (zona proibida / judgment-call)
- (nada)

## Lessons learned (escreve aqui, não no chat)
- (nada)

## Stop conditions atingidas
- (nada)
