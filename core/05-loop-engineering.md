# 05. Loop engineering: MVL gate-stop

Loop = sistema pequeno que ACHA o trabalho, ENTREGA ao agente, CHECA, REGISTRA e DECIDE o
próximo passo. Você desenha 1 vez; o loop prompta dali pra frente.

## Teste das 4 condições (falhou 1 = NÃO faça loop, use um bom prompt)

1. **Repete** (>= semanal). Tarefa única → prompt mirado é mais barato.
2. **Verificação automatizada existe** (teste/build/lint que REPROVA sozinho).
3. **Budget aguenta o desperdício** (loop re-lê contexto, retenta, explora).
4. **Agente tem ferramenta de senior** (logs, repro, roda o código que escreve).

## A MVL: 4 peças (construa a menor que funciona)

1 automação (manual ou agendada) + 1 protocolo (este) + 1 state file + 1 gate.
Ordem de construção: 1 run manual confiável → vira protocolo → embrulha em loop → agenda.
Pular etapa é como loops falham em produção. Métrica = custo por mudança ACEITA;
abaixo de ~50% de aceite o loop está perdendo.

## State file (a memória que sobrevive à volta): POR TAREFA

`./.loop/state-<slug>.md` (template em `../bootstrap/templates/loop-state.template.md`).
SEMPRE leia primeiro. State existente com Goal DIFERENTE: não sobrescreva, pare e
pergunte. Fixe na seção Gate os comandos ABSOLUTOS já verificados e reuse toda volta.
Toda iteração atualiza: feito / falta / lições / stop conditions.

## Step 0: setup + zone scan (1x por tarefa, ANTES de codar)

1. **Detecte o gate** pela stack (package.json → `<pm> test`; pyproject → `pytest -q`;
   Cargo.toml → `cargo test`; go.mod → `go test ./...`; .csproj → `dotnet test <proj>
   --no-restore --filter <area>`; Makefile → `make test`). Honre o gate declarado no
   `AGENTS.md`/`CLAUDE.md` do projeto se houver. Rode 1x pra confirmar baseline verde.
   Projeto com mapa de áreas (`knowledge/areas.json` ou equivalente): área tocada sem
   entrada no mapa = pare ANTES do primeiro ACT, registre a lacuna no state e defina um
   gate provisório com baseline completa; no fechamento, registre a área no mapa (quem
   descobre a lacuna também a registra).
2. **Zone scan**: a tarefa toca zona proibida (`04-verification.md`)? Se sim: NÃO comece.
   Liste TODAS as decisões humanas pendentes e pergunte em UMA rodada, com recomendação.
3. **Evidência em arquivo**: crie `./.loop/evidence/<slug>/` e salve lá o stdout da
   baseline (e depois o do gate final), incluindo os NOMES dos testes que falham; o state
   referencia o caminho. Contagem resumida (ex.: 502/505) não prova que uma falha é
   pré-existente; nome de teste prova.

## Uma iteração (find → act → gate → record → decide)

1. **READ** state + spec permanente (`AGENTS.md`/Goal: anti goal-drift) + classifique
   tipo/risco numa linha.
2. **FIND** o MENOR próximo passo que avança o Goal. Um por iteração. Projeto com grafo de
   código pré-construído: consulte-o antes de explorar arquivos (ordens de magnitude mais
   barato). Mas grafo reflete o último commit; arquivo que o loop JÁ editou releia direto.
   **BRIDGE loop→grafo**: passo que DIVIDE em peças independentes vai pra um grafo
   (`07-graph-engineering.md`) e volta consolidado.
3. **ROOT CAUSE** se bug: causa provada com arquivo:linha ANTES de codar.
4. **TEST FIRST** se código: teste que falha pelo motivo certo (RED) antes da
   implementação. RED que passa de primeira = suspeite do ambiente.
5. **ACT** implementação mínima pra verde. Match style. Sem refactor oportunista
   (refactor declarado exige baseline verde capturado antes).
6. **GATE** rode build+test com caminho absoluto; cole comando + resultado.
7. **CHECKER** (maker != checker) no diff da iteração; classifique cada alerta
   (introduzido × pré-existente). Diff de alto risco: escale pra verify adversarial.
   O checker precisa ser AUDITÁVEL depois: registre no state a identidade/contexto dele,
   o prompt usado, o hash do diff congelado, os achados e o veredito literal (texto longo
   vai pra `./.loop/evidence/<slug>/` e o state referencia).
8. **RECORD** atualize o state file.
9. **DECIDE** gate verde + Goal atingido → HARD-STOP (sucesso). Senão próxima iteração.
   Tarefa nascida de ticket/chamado de suporte só encerra com um rascunho de resposta ao
   solicitante no state (SEM enviar): o que foi confirmado, o que não dá pra afirmar e o
   que ele deve ou não fazer agora. O ciclo termina no suporte respondido, não no diff.

## HARD-STOPS (pare e mostre o diff pro humano)

- Gate VERDE e Goal atingido (sucesso).
- **5 iterações** sem fechar (backstop anti-runaway).
- **Teto de token/custo estourado** (defina ANTES; sem teto = 5-10x o esperado).
- **2 iterações seguidas sem progresso** no gate (loop falhando quieto, não insista).
- Zona proibida sem aprovação; mudança fora de escopo; ação irreversível.

## Acesso temporário autorizado (regra de firewall, credencial, porta, permissão)

Quando o humano autorizar um acesso temporário a ambiente sensível: criar, usar e remover
são passos SEPARADOS, cada um com output próprio colado. O cleanup é obrigatório e a
pós-condição que prova a remoção (ex.: consulta devolvendo zero regras temporárias) entra
no state. Agrupar criar-usar-remover numa chamada só esconde o cleanup do registro; foi
assim que um loop real quase deixou uma regra de firewall órfã em produção.

## Modos de falha (battle-tested, vigie todos)

false green (árvore errada) · state clobber (loop paralelo: state POR tarefa) ·
alerta pré-existente "consertado" (drive-by) · "pronto" prematuro sem gate ·
goal drift (reler o Goal toda volta) · self-preferential bias (checker separado) ·
comprehension debt (leia os diffs) · lacuna silenciosa (seção LACUNAS obrigatória) ·
prova prometida (output colado ou não aconteceu).

## Fechamento com aprendizado (learning law)

Solve não-trivial fecha com nota de aprendizado (`08-memory-learning.md`): problema /
abordagem / judgment calls / regra reusável. E auto-retro: 1-3 erros do SEU processo,
cada um com correção GRAVADA. Erro sem gravação = próxima execução repete.
