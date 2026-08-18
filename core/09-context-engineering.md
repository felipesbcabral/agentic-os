# 09. Context engineering: o corpus de regras do projeto

A peça que transforma "a IA leu o código" em "a IA conhece as REGRAS do negócio".
É a resposta ao problema real: regra de negócio que só existe na cabeça de alguém (ou
espalhada em tickets) é re-derivada a cada sessão, caro e sujeito a erro.

## A estrutura (canônica, versionada JUNTO do código)

```
knowledge/
  START-HERE.md          # índice raiz (aponta, não contém)
  rules/                 # 1 regra de negócio = 1 par .json (máquina) + .md (humano)
    BR-<AREA>-<TOPICO>-<NNN>.json
    BR-<AREA>-<TOPICO>-<NNN>.md
  areas.json             # mapa area -> projetos/paths/comandos de gate
  modules/               # documentacao por modulo
  task-packets/          # contrato por tarefa/ticket (US-<n>.md)
  generated/             # packs compilados (saida de ferramenta, nao fonte)
```

## Anatomia de uma regra (o .json que a máquina roteia)

- `id`, `title`, `severity` (critical/N2/...), `triggers` (palavras-chave que roteiam a
  regra pra uma tarefa), `mustNot` (proibições: viram zonas proibidas do loop),
  `doesNotApplyWhen` (escopo NEGATIVO: o limite que impede goal-drift),
  `requiredCases` (casos de teste mínimos, inclusive o caso negativo: provar que o
  vizinho NÃO mudou), selo `[PROPOSED]` quando é spec acordada ainda não implementada.
- O `.md` irmão conta a história: motivo, exemplos, incidentes ligados.
- **Regra liga ao teste por marcador** (ex.: trait/tag `BusinessRule=<ID>` na classe de
  teste): é o que permite gate POR REGRA e verificação de cobertura no diff.

## O ciclo de ferramentas (o padrão; a implementação é por projeto)

- **pack**: dado o enunciado da tarefa, roteia as regras aplicáveis por trigger e compila
  um L0 (< 2k tokens): invariantes, proibições, escopo negativo, testes obrigatórios,
  comando de gate exato. O loop RELÊ o L0 toda volta, mais barato que re-derivar.
- **packet**: dado um ticket, gera o CONTRATO da tarefa: regras aplicáveis (e o motivo do
  roteamento), escopo proibido, casos de teste, comandos de gate, seções TODO que exigem
  evidência. Não sobrescreve packet preenchido à mão.
- **gate**: resolve a área pelos arquivos alterados e roda NA ORDEM certa: restore se
  falta, build do projeto correto (nunca o monorepo), teste focado, regressão por
  marcador de regra; imprime bloco de resumo machine-readable pra colar como prova.
- **verify**: mapeia o diff → regras exigidas → prova disponível; ERRO se a mudança toca
  regra severa sem teste marcado.
- **lint**: valida o próprio corpus (formato, ids, áreas, links).

Implementação de referência: um CLI próprio no repo (qualquer linguagem). O BOOTSTRAP
começa com versões-protocolo (a IA executa os passos manualmente) e a ferramenta nasce
quando o volume justificar.

## Como o corpus cresce (quem descobre, registra)

Pack vazio ("nenhuma regra roteada") = área não mapeada. Siga o trabalho e, no
fechamento, REGISTRE a regra descoberta no mesmo diff da tarefa. Lacuna que é regra
permanente NÃO fica só na memória local (morre na máquina de quem descobriu): promova
pra `knowledge/rules/` + teste marcado. Regra roteada por palavra ambígua: conserte o
trigger na hora.

## Precedência quando fontes discordam

Teste marcado com a regra > `knowledge/rules/` > `knowledge/modules/` > decisão
registrada > incidente > memória de sessão (SEM autoridade normativa).
