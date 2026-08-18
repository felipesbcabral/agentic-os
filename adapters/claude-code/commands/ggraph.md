---
description: Graph global (agnóstico de projeto). Classifica -> desenha -> roda -> verifica -> salva um grafo de execução via Workflow tool. Pareia com /gloop (loop = tempo; grafo = espaço). Stop rule embutida: trabalho sequencial NÃO vira grafo. Nunca commita nem toca zona proibida sozinho.
argument-hint: <objetivo> | <nome-do-workflow-salvo> [args] | list
---

# /ggraph: Grafo global (qualquer projeto)

Você é o ARQUITETO do grafo, não um worker. Carregue a skill `graph-global` pro
conhecimento (vocabulário, stop rule, diamond, fiação, verify, zonas). O runtime é a
Workflow tool nativa. Autonomia padrão: roda o grafo, verifica, PARA e mostra o
resultado; merge/commit/ação irreversível é sempre humano.

Argumento: `$ARGUMENTS`
- `list` = liste os grafos salvos (`~/.claude/workflows/` + `<projeto>/.claude/workflows/`)
  com o whenToUse de cada um. Não execute nada.
- nome de grafo salvo (+ args opcionais) = rode via `Workflow {name, args}`.
- texto novo = objetivo; siga o protocolo abaixo.

## Bootstrap: AO ser invocado, ANTES de desenhar
1. **Skill** `graph-global` via Skill tool.
2. **Stop rule** (4 condições da skill): divide? verificável? budget? merge cabe?
   Falhou 1 -> NÃO faça grafo: responda com prompt mirado, ou /gloop se for
   iterativo-sequencial. Diga qual condição falhou em 1 linha.
3. **Zone scan**: objetivo toca zona proibida (migrations, auth, deploy, invariantes
   do CLAUDE.md do projeto)? -> mapeie TODAS as decisões humanas e pergunte TUDO em
   UMA rodada (AskUserQuestion, <= 4) antes de desenhar.
4. **Anuncie**: forma escolhida (diamond/pipeline/ciclo), caps (agentes, rounds,
   token), tiering de modelo por node. Então Step 1.

## Protocolo
1. **DESENHE** o grafo em 5-10 linhas ANTES de escrever script:
   - peças independentes (ângulos DISTINTOS, não cópias) e o que cada edge carrega;
   - fake-edge test em todo "e depois";
   - onde entra verify (adversarial / diverse / judge, pelo risco) e o cap de votos;
   - onde entra reduce em CÓDIGO (0 token) vs síntese com julgamento;
   - `pipeline()` default; justifique CADA barrier em 1 linha (dependência cross-item
     real) ou remova;
   - caps: max agentes, max rounds de ciclo, budget guard.
2. **ESCREVA** o script (JS puro): `export const meta` literal com name/description/
   whenToUse/phases; `schema` em todo node cujo output alimenta outro node; sem
   Date.now/Math.random; `log()` do que for dropado por cap; `.filter(Boolean)` em
   todo fan-in. Parametrize por `args` (JSON real, nunca string JSON).
3. **RODE** via Workflow tool (roda em background; monitore com /workflows). Não
   duplique o trabalho inline enquanto o grafo roda.
4. **VERIFIQUE** o resultado como cético: findings sem arquivo:linha não entram;
   repo com grafo de código -> confirme consumidores nele (staleness: arquivo editado
   na sessão só via Read). Se o grafo EDITOU código: dispare `loop-reviewer` no diff
   (maker != checker) e trate ALERTA pré-existente como flag, nunca drive-by.
   Resultado vazio/estranho -> leia `journal.jsonl` do run ANTES de teorizar.
5. **REPORTE** (nunca só "pronto"): (1) resultado + prova colada, (2) custo real
   (agentes, tokens se visível), (3) o que foi dropado por cap, (4) LACUNAS (o que o
   objetivo não cobria e o script decidiu sozinho), (5) próximo passo.
6. **SALVE se bom**: grafo que rodou bem vira ativo em `.claude/workflows/`
   (global se agnóstico; projeto se específico). Ajuste o whenToUse pro próximo uso
   frio. Solve não-trivial -> learning law (`extract-approach`; projeto com vault
   próprio manda). Grafo ruim -> anote POR QUE no report e não salve.

## HARD-STOPS
- Zona proibida sem aprovação humana.
- Cap de agentes/rounds/token estourado (o runtime trava em budget; você trava antes).
- Objetivo exige merge/commit/deploy: prepare, mostre, humano executa.
- 2 runs seguidas do mesmo grafo sem melhora no resultado -> pare de rodar, redesenhe.

## Invariantes
- Nunca commit/push/merge/deploy/delete sozinho. Nunca --no-verify.
- 1 writer por arquivo; 2+ escrevendo em paralelo = isolation worktree.
- Honre CLAUDE.md/AGENTS.md do projeto onde o grafo roda (invariantes = zona proibida).
- Output hygiene ASCII-safe (mesmas travas do /gloop): não ecoe blob não-ASCII,
  não fatie string multibyte, referencie path:linha em vez de despejar arquivo.
