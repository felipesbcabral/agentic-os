# 09 — Context engineering: o corpus de regras do projeto

A peca que transforma "a IA leu o codigo" em "a IA conhece as REGRAS do negocio".
E a resposta ao problema real: regra de negocio que so existe na cabeca de alguem (ou
espalhada em tickets) e re-derivada a cada sessao — caro e sujeito a erro.

## A estrutura (canonica, versionada JUNTO do codigo)

```
knowledge/
  START-HERE.md          # indice raiz (aponta, nao contem)
  rules/                 # 1 regra de negocio = 1 par .json (maquina) + .md (humano)
    BR-<AREA>-<TOPICO>-<NNN>.json
    BR-<AREA>-<TOPICO>-<NNN>.md
  areas.json             # mapa area -> projetos/paths/comandos de gate
  modules/               # documentacao por modulo
  task-packets/          # contrato por tarefa/ticket (US-<n>.md)
  generated/             # packs compilados (saida de ferramenta, nao fonte)
```

## Anatomia de uma regra (o .json que a maquina roteia)

- `id`, `title`, `severity` (critical/N2/...), `triggers` (palavras-chave que roteiam a
  regra pra uma tarefa), `mustNot` (proibicoes — viram zonas proibidas do loop),
  `doesNotApplyWhen` (escopo NEGATIVO — o limite que impede goal-drift),
  `requiredCases` (casos de teste minimos, inclusive o caso negativo: provar que o
  vizinho NAO mudou), selo `[PROPOSED]` quando e spec acordada ainda nao implementada.
- O `.md` irmao conta a historia: motivo, exemplos, incidentes ligados.
- **Regra liga ao teste por marcador** (ex.: trait/tag `BusinessRule=<ID>` na classe de
  teste) — e o que permite gate POR REGRA e verificacao de cobertura no diff.

## O ciclo de ferramentas (o padrao; a implementacao e por projeto)

- **pack** — dado o enunciado da tarefa, roteia as regras aplicaveis por trigger e compila
  um L0 (< 2k tokens): invariantes, proibicoes, escopo negativo, testes obrigatorios,
  comando de gate exato. O loop RELE o L0 toda volta — mais barato que re-derivar.
- **packet** — dado um ticket, gera o CONTRATO da tarefa: regras aplicaveis (e o motivo do
  roteamento), escopo proibido, casos de teste, comandos de gate, secoes TODO que exigem
  evidencia. Nao sobrescreve packet preenchido a mao.
- **gate** — resolve a area pelos arquivos alterados e roda NA ORDEM certa: restore se
  falta, build do projeto correto (nunca o monorepo), teste focado, regressao por
  marcador de regra; imprime bloco de resumo machine-readable pra colar como prova.
- **verify** — mapeia o diff → regras exigidas → prova disponivel; ERRO se a mudanca toca
  regra severa sem teste marcado.
- **lint** — valida o proprio corpus (formato, ids, areas, links).

Implementacao de referencia: um CLI proprio no repo (qualquer linguagem) — o BOOTSTRAP
comeca com versoes-protocolo (a IA executa os passos manualmente) e a ferramenta nasce
quando o volume justificar.

## Como o corpus cresce (quem descobre, registra)

Pack vazio ("nenhuma regra roteada") = area nao mapeada — siga o trabalho e, no
fechamento, REGISTRE a regra descoberta no mesmo diff da tarefa. Lacuna que e regra
permanente NAO fica so na memoria local (morre na maquina de quem descobriu): promova
pra `knowledge/rules/` + teste marcado. Regra roteada por palavra ambigua: conserte o
trigger na hora.

## Precedencia quando fontes discordam

Teste marcado com a regra > `knowledge/rules/` > `knowledge/modules/` > decisao
registrada > incidente > memoria de sessao (SEM autoridade normativa).
