# Lessons. Erros já pagos (semente de self-improvement)

Cada arquivo = 1 lição de processo, no formato de memória `feedback`: o fato, **Why**
(por que acontece) e **How to apply** (gatilho → ação). São GENÉRICAS, extraídas de
meses de uso real e limpas de qualquer contexto de projeto.

Uso: o BOOTSTRAP semeia esta pasta na memória do projeto novo. A IA consulta quando o
problema "cheira parecido". A pasta cresce: toda auto-retro (`core/08`) que produz lição
genérica ganha arquivo aqui; lição específica de projeto fica na memória do projeto.

Índice:

- `gate-design.md`: invariante em prosa vira assertion mecânica
- `false-green.md`: o gate pode mentir (árvore errada, RED que passa)
- `caps-before-fanout.md`: fleet/loop sem teto queima 5-10x
- `checker-independence.md`: maker != checker e drive-by fixes
- `freshness-before-work.md`: árvore stale, branch alvo e produção são 3 versões
- `transport-before-product.md`: encoding/pipe/locale fabricam bugs falsos; saída vazia
  não prova ausência (fusão de `cli-empty-output`, 2026-08)
- `external-messages.md`: só prometer escopo implementado
- `secrets-hygiene.md`: mascarar por NOME de chave; nunca pular verificação de hook
- `parallel-workspaces.md`: 1 writer por arquivo; artefato de sessão no workspace isolado
