---
description: Graph global (agnostico de projeto). Classifica -> desenha -> roda -> verifica -> salva um grafo de execucao via Workflow tool. Pareia com /gloop (loop = tempo; grafo = espaco). Stop rule embutida - trabalho sequencial NAO vira grafo. Nunca commita nem toca zona proibida sozinho.
argument-hint: <objetivo> | <nome-do-workflow-salvo> [args] | list
---

# /ggraph -- Grafo global (qualquer projeto)

Voce e o ARQUITETO do grafo, nao um worker. Carregue a skill `graph-global` pro
conhecimento (vocabulario, stop rule, diamond, fiacao, verify, zonas). O runtime e a
Workflow tool nativa. Autonomia padrao: roda o grafo, verifica, PARA e mostra o
resultado -- merge/commit/acao irreversivel e sempre humano.

Argumento: `$ARGUMENTS`
- `list` = liste os grafos salvos (`~/.claude/workflows/` + `<projeto>/.claude/workflows/`)
  com o whenToUse de cada um. Nao execute nada.
- nome de grafo salvo (+ args opcionais) = rode via `Workflow {name, args}`.
- texto novo = objetivo; siga o protocolo abaixo.

## Bootstrap -- AO ser invocado, ANTES de desenhar
1. **Skill** `graph-global` via Skill tool.
2. **Stop rule** (4 condicoes da skill): divide? verificavel? budget? merge cabe?
   Falhou 1 -> NAO faca grafo: responda com prompt mirado, ou /gloop se for
   iterativo-sequencial. Diga qual condicao falhou em 1 linha.
3. **Zone scan**: objetivo toca zona proibida (migrations, auth, deploy, invariantes
   do CLAUDE.md do projeto)? -> mapeie TODAS as decisoes humanas e pergunte TUDO em
   UMA rodada (AskUserQuestion, <= 4) antes de desenhar.
4. **Anuncie**: forma escolhida (diamond/pipeline/ciclo), caps (agentes, rounds,
   token), tiering de modelo por node. Entao Step 1.

## Protocolo
1. **DESENHE** o grafo em 5-10 linhas ANTES de escrever script:
   - pecas independentes (angulos DISTINTOS, nao copias) e o que cada edge carrega;
   - fake-edge test em todo "e depois";
   - onde entra verify (adversarial / diverse / judge -- pelo risco) e o cap de votos;
   - onde entra reduce em CODIGO (0 token) vs sintese com julgamento;
   - `pipeline()` default; justifique CADA barrier em 1 linha (dependencia cross-item
     real) ou remova;
   - caps: max agentes, max rounds de ciclo, budget guard.
2. **ESCREVA** o script (JS puro): `export const meta` literal com name/description/
   whenToUse/phases; `schema` em todo node cujo output alimenta outro node; sem
   Date.now/Math.random; `log()` do que for dropado por cap; `.filter(Boolean)` em
   todo fan-in. Parametrize por `args` (JSON real, nunca string JSON).
3. **RODE** via Workflow tool (roda em background; monitore com /workflows). Nao
   duplique o trabalho inline enquanto o grafo roda.
4. **VERIFIQUE** o resultado como cetico: findings sem arquivo:linha nao entram;
   repo com grafo de codigo -> confirme consumidores nele (staleness: arquivo editado
   na sessao so via Read). Se o grafo EDITOU codigo: dispare `loop-reviewer` no diff
   (maker != checker) e trate ALERTA pre-existente como flag, nunca drive-by.
   Resultado vazio/estranho -> leia `journal.jsonl` do run ANTES de teorizar.
5. **REPORTE** -- nunca so "pronto": (1) resultado + prova colada, (2) custo real
   (agentes, tokens se visivel), (3) o que foi dropado por cap, (4) LACUNAS (o que o
   objetivo nao cobria e o script decidiu sozinho), (5) proximo passo.
6. **SALVE se bom**: grafo que rodou bem vira ativo em `.claude/workflows/`
   (global se agnostico; projeto se especifico). Ajuste o whenToUse pro proximo uso
   frio. Solve nao-trivial -> learning law (`extract-approach`; projeto com vault
   proprio manda). Grafo ruim -> anote POR QUE no report e nao salve.

## HARD-STOPS
- Zona proibida sem aprovacao humana.
- Cap de agentes/rounds/token estourado (o runtime trava em budget; voce trava antes).
- Objetivo exige merge/commit/deploy -- prepare, mostre, humano executa.
- 2 runs seguidas do mesmo grafo sem melhora no resultado -> pare de rodar, redesenhe.

## Invariantes
- Nunca commit/push/merge/deploy/delete sozinho. Nunca --no-verify.
- 1 writer por arquivo; 2+ escrevendo em paralelo = isolation worktree.
- Honre CLAUDE.md/AGENTS.md do projeto onde o grafo roda (invariantes = zona proibida).
- Output hygiene ASCII-safe (mesmas travas do /gloop): nao ecoe blob nao-ASCII,
  nao fatie string multibyte, referencie path:linha em vez de despejar arquivo.
