# Saida vazia de CLI nao prova ausencia

Reincidente 3x: afirmar "nao existe / nao ha dados / nunca rodou" com base em comando que
voltou vazio — quando o vazio era erro suprimido (`2>/dev/null` escondendo a falha),
filtro proxy engolindo o padrao, API que so expoe subconjunto dos dados, ou glob com
falso negativo em Windows.

**Why:** vazio e ambiguo — significa "nao ha" OU "a pergunta falhou". Sem separar os dois,
a conclusao herda o pior caso.

**How to apply:** saida vazia = REVERIFICAR por caminho independente antes de qualquer
afirmacao negativa (outra ferramenta de busca, a fonte bruta, listagem direta do FS).
Nunca esconda stderr em comando de diagnostico. Pra afirmar "e o unico / nao existe",
use a ferramenta de busca canonica do ambiente, nao a atalhada.
