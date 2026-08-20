# Loop state. <slug da tarefa>

## Goal
<o objetivo, em 1-3 linhas. Se um state existente tiver Goal diferente: PARE e pergunte.>

## Gate (comandos ABSOLUTOS, validados: reuse toda volta, não re-derive)
```
<comando 1>
<comando 2>
```

## Evidência (arquivos em ./.loop/evidence/<slug>/)
- baseline: <caminho do stdout, com nomes dos testes que falham>
- checker: <identidade + hash do diff congelado + veredito literal (ou caminho)>

## Feito
- <iteração N: o que fechou, com prova>

## Custo (por iteração; sem esta série a métrica "custo por mudança aceita" não fecha)
- iter <N>: modelo <nome> · tokens in/out <a>/<b> (cache <c>%) · <min> min

## Checker (rastreabilidade: ver core/04)
- id/modelo: <...> · contexto: <novo | fork, NÃO conta como independente | CHECKER_INDEPENDENTE_INDISPONIVEL>
- hash do diff congelado: <...>
- achados: <cada um com INTRODUZIDO|PRÉ-EXISTENTE + atribuição
  checker_unique | gate_redundant | human_seed_checker_confirmed | unknown>

## Em progresso / falta
- <próximo menor passo>

## Perguntas abertas (humano)
- <decisão pendente + recomendação>

## Lições desta tarefa
- <gatilho -> ação>

## Rascunho de resposta ao solicitante (só se a tarefa nasceu de ticket; NÃO enviar)
- <o que foi confirmado / o que não dá pra afirmar / o que fazer ou não fazer agora>

## Stop conditions já definidas
- Máx iterações: 5 · Sem progresso: 2 seguidas · Teto de custo: <definir ANTES>
