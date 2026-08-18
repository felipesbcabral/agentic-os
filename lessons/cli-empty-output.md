# Saída vazia de CLI não prova ausência

Reincidente 3x: afirmar "não existe / não há dados / nunca rodou" com base em comando que
voltou vazio, quando o vazio era erro suprimido (`2>/dev/null` escondendo a falha),
filtro proxy engolindo o padrão, API que só expõe subconjunto dos dados, ou glob com
falso negativo em Windows.

**Why:** vazio é ambíguo: significa "não há" OU "a pergunta falhou". Sem separar os dois,
a conclusão herda o pior caso.

**How to apply:** saída vazia = REVERIFICAR por caminho independente antes de qualquer
afirmação negativa (outra ferramenta de busca, a fonte bruta, listagem direta do FS).
Nunca esconda stderr em comando de diagnóstico. Pra afirmar "é o único / não existe",
use a ferramenta de busca canônica do ambiente, não a atalhada.
