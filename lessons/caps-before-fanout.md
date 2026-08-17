# Cap ANTES do fan-out (fleet/loop sem teto queima 5-10x)

Caso real: um workflow de review multi-agente disparado sem teto de tokens queimou
~500k tokens sem autorizacao — o resultado nao valia o custo, e o revisor padrao (1
agente) teria bastado.

**Why:** fan-out multiplica TUDO: cada peca re-le contexto, retenta, verifica. Sem teto
explicito, loop ambicioso gasta 5-10x o esperado — e o custo so aparece no fim.

**How to apply:** antes de disparar loop/grafo: teto de iteracoes, teto de agentes, teto
de tokens — ESCRITOS. Estourou = hard-stop. Fan-out grande so com pedido explicito do
humano ou cap acordado. Metrica de saude = custo por mudanca ACEITA (abaixo de ~50% de
aceite, o sistema esta perdendo). Cap silencioso tambem e bug: top-N/sampling/no-retry
devem logar o que foi dropado.
