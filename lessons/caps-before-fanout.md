# Cap ANTES do fan-out (fleet/loop sem teto queima 5-10x)

Caso real: um workflow de review multi-agente disparado sem teto de tokens queimou
~500k tokens sem autorização. O resultado não valia o custo, e o revisor padrão (1
agente) teria bastado.

**Why:** fan-out multiplica TUDO: cada peça relê contexto, retenta, verifica. Sem teto
explícito, loop ambicioso gasta 5-10x o esperado, e o custo só aparece no fim.

**How to apply:** antes de disparar loop/grafo: teto de iterações, teto de agentes, teto
de tokens (ESCRITOS). Estourou = hard-stop. Fan-out grande só com pedido explícito do
humano ou cap acordado. Métrica de saúde = custo por mudança ACEITA (abaixo de ~50% de
aceite, o sistema está perdendo). Cap silencioso também é bug: top-N/sampling/no-retry
devem logar o que foi dropado.
