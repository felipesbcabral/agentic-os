# Maker != checker, e o drive-by fix

Modelos nao pegam a maioria dos proprios erros — e sao otimos em aprovar o proprio
trabalho. Alem disso, checker que acha problema PRE-EXISTENTE e "conserta de passagem"
mistura escopo, esconde risco e transforma um diff pequeno num diff inauditavel.

**Why:** self-preferential bias e real; e conserto fora de escopo nao passou por
root-cause nem por decisao de prioridade — e chute com boa intencao.

**How to apply:** (1) todo diff/artefato passa por checker em contexto SEPARADO (subagente
read-only, turno proprio com artefato congelado, ou outro modelo); (2) cada alerta e
classificado: INTRODUZIDO pela mudanca → conserta e re-verifica; PRE-EXISTENTE → flaga e
escala, NUNCA conserta junto; (3) achado de alto risco: 3 verificadores adversariais com
lentes DISTINTAS, maioria refuta = mata.
