# 05 — Loop engineering: MVL gate-stop

Loop = sistema pequeno que ACHA o trabalho, ENTREGA ao agente, CHECA, REGISTRA e DECIDE o
proximo passo. Voce desenha 1 vez; o loop prompta dali pra frente.

## Teste das 4 condicoes (falhou 1 = NAO faca loop, use um bom prompt)

1. **Repete** (>= semanal). Tarefa unica → prompt mirado e mais barato.
2. **Verificacao automatizada existe** (teste/build/lint que REPROVA sozinho).
3. **Budget aguenta o desperdicio** (loop re-le contexto, retenta, explora).
4. **Agente tem ferramenta de senior** (logs, repro, roda o codigo que escreve).

## A MVL — 4 pecas (construa a menor que funciona)

1 automacao (manual ou agendada) + 1 protocolo (este) + 1 state file + 1 gate.
Ordem de construcao: 1 run manual confiavel → vira protocolo → embrulha em loop → agenda.
Pular etapa e como loops falham em producao. Metrica = custo por mudanca ACEITA;
abaixo de ~50% de aceite o loop esta perdendo.

## State file (a memoria que sobrevive a volta) — POR TAREFA

`./.loop/state-<slug>.md` (template em `../bootstrap/templates/loop-state.template.md`).
SEMPRE leia primeiro. State existente com Goal DIFERENTE: nao sobrescreva — pare e
pergunte. Fixe na secao Gate os comandos ABSOLUTOS ja verificados e reuse toda volta.
Toda iteracao atualiza: feito / falta / licoes / stop conditions.

## Step 0 — Setup + zone scan (1x por tarefa, ANTES de codar)

1. **Detecte o gate** pela stack (package.json → `<pm> test`; pyproject → `pytest -q`;
   Cargo.toml → `cargo test`; go.mod → `go test ./...`; .csproj → `dotnet test <proj>
   --no-restore --filter <area>`; Makefile → `make test`). Honre o gate declarado no
   `AGENTS.md`/`CLAUDE.md` do projeto se houver. Rode 1x pra confirmar baseline verde.
2. **Zone scan**: a tarefa toca zona proibida (`04-verification.md`)? Se sim: NAO comece.
   Liste TODAS as decisoes humanas pendentes e pergunte em UMA rodada, com recomendacao.

## Uma iteracao (find → act → gate → record → decide)

1. **READ** state + spec permanente (`AGENTS.md`/Goal — anti goal-drift) + classifique
   tipo/risco numa linha.
2. **FIND** o MENOR proximo passo que avanca o Goal. Um por iteracao. Projeto com grafo de
   codigo pre-construido: consulte-o antes de explorar arquivos (ordens de magnitude mais
   barato) — mas grafo reflete o ultimo commit; arquivo que o loop JA editou releia direto.
   **BRIDGE loop→grafo**: passo que DIVIDE em pecas independentes vai pra um grafo
   (`07-graph-engineering.md`) e volta consolidado.
3. **ROOT CAUSE** se bug: causa provada com arquivo:linha ANTES de codar.
4. **TEST FIRST** se codigo: teste que falha pelo motivo certo (RED) antes da
   implementacao. RED que passa de primeira = suspeite do ambiente.
5. **ACT** implementacao minima pra verde. Match style. Sem refactor oportunista
   (refactor declarado exige baseline verde capturado antes).
6. **GATE** rode build+test com caminho absoluto; cole comando + resultado.
7. **CHECKER** (maker != checker) no diff da iteracao; classifique cada alerta
   (introduzido × pre-existente). Diff de alto risco: escale pra verify adversarial.
8. **RECORD** atualize o state file.
9. **DECIDE** gate verde + Goal atingido → HARD-STOP (sucesso). Senao proxima iteracao.

## HARD-STOPS (pare e mostre o diff pro humano)

- Gate VERDE e Goal atingido (sucesso).
- **5 iteracoes** sem fechar (backstop anti-runaway).
- **Teto de token/custo estourado** (defina ANTES; sem teto = 5-10x o esperado).
- **2 iteracoes seguidas sem progresso** no gate (loop falhando quieto — nao insista).
- Zona proibida sem aprovacao; mudanca fora de escopo; acao irreversivel.

## Modos de falha (battle-tested — vigie todos)

false green (arvore errada) · state clobber (loop paralelo: state POR tarefa) ·
alerta pre-existente "consertado" (drive-by) · "pronto" prematuro sem gate ·
goal drift (reler o Goal toda volta) · self-preferential bias (checker separado) ·
comprehension debt (leia os diffs) · lacuna silenciosa (secao LACUNAS obrigatoria) ·
prova prometida (output colado ou nao aconteceu).

## Fechamento com aprendizado (learning law)

Solve nao-trivial fecha com nota de aprendizado (`08-memory-learning.md`): problema /
abordagem / judgment calls / regra reusavel. E auto-retro: 1-3 erros do SEU processo,
cada um com correcao GRAVADA. Erro sem gravacao = proxima execucao repete.
