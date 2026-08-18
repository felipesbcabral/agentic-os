# Maker != checker, e o drive-by fix

Modelos não pegam a maioria dos próprios erros, e são ótimos em aprovar o próprio
trabalho. Além disso, checker que acha problema PRÉ-EXISTENTE e "conserta de passagem"
mistura escopo, esconde risco e transforma um diff pequeno num diff inauditável.

**Why:** self-preferential bias é real; e conserto fora de escopo não passou por
root-cause nem por decisão de prioridade, é chute com boa intenção.

**How to apply:** (1) todo diff/artefato passa por checker em contexto SEPARADO (subagente
read-only, turno próprio com artefato congelado, ou outro modelo); (2) cada alerta é
classificado: INTRODUZIDO pela mudança → conserta e reverifica; PRÉ-EXISTENTE → flaga e
escala, NUNCA conserta junto; (3) achado de alto risco: 3 verificadores adversariais com
lentes DISTINTAS, maioria refuta = mata.
