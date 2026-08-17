# BOOTSTRAP — converta o agentic-os para ESTE projeto

Voce (IA) recebeu este documento dentro de um projeto novo. Sua tarefa: instanciar o
sistema agentic-os calibrado pra ESTE repo/estudo/dominio. O resultado e um conjunto
pequeno de arquivos no projeto — nao uma copia do repo inteiro (regra de ouro: aponta,
nao contem).

Tempo esperado: 1 sessao. Pergunte pouco e em lote; proponha defaults com recomendacao.

## Fase 0 — Reconhecimento (read-only, sem perguntar nada ainda)

1. Detecte a stack (arquivos-marcador: package.json, pyproject.toml, Cargo.toml, go.mod,
   *.csproj, Makefile...) e o comando de teste/build/lint mais ESTREITO que reprova
   trabalho ruim. Rode 1x pra confirmar baseline (verde ou documente o vermelho atual).
2. Leia o que ja existe de instrucao (`AGENTS.md`, `CLAUDE.md`, `README`, docs/) —
   NAO sobrescreva trabalho humano; o bootstrap COMPLEMENTA.
3. Liste as zonas de risco do dominio: o que aqui e irreversivel? o que e dado de
   producao? o que toca dinheiro/auth/terceiros? (vira zona proibida local)
4. Identifique o tipo de projeto: codigo de producao / estudo-aprendizado / escrita /
   pesquisa / dados. Isso calibra QUAIS pecas instalar (tabela na Fase 2).

## Fase 1 — Entrevista minima (UMA rodada de perguntas)

Pergunte apenas o que o reconhecimento nao respondeu, com recomendacao por item:
- Objetivo do projeto em 1 frase (vira o norte anti goal-drift).
- Invariantes inegociaveis do dominio (ex.: "nunca tocar tabela X", "dados de cliente
  nao saem daqui", "regra fiscal Y e lei").
- Onde mora a verdade do negocio hoje (tickets? planilha? cabeca de alguem?) — alimenta
  o corpus.
- Gate preferido se houver mais de um candidato.

## Fase 2 — Instanciar (o que criar, por tipo de projeto)

| Peca | Codigo producao | Estudo | Escrita/pesquisa |
|---|---|---|---|
| `AGENTS.md` (indice + invariantes) | SIM | SIM | SIM |
| Gate fixado (comando absoluto) | SIM | SIM (exercicios/teste) | adaptado (checklist/rubrica) |
| `knowledge/rules/` (corpus) | SIM (nasce vazio) | opcional | opcional |
| `.loop/` (state files) | SIM | SIM | SIM |
| Memoria (indice + arquivos) | SIM | SIM | SIM |
| Lessons semeadas | SIM | SIM | SIM |

Passos:

1. **Crie `AGENTS.md`** do template (`templates/AGENTS.template.md`): indice curto —
   objetivo, stack, gate exato, invariantes/zonas proibidas locais, ponteiros pro
   agentic-os. Maximo ~60 linhas; detalhe mora em arquivo apontado.
2. **Fixe o gate** validado na Fase 0 dentro do `AGENTS.md` (comando literal, caminho
   absoluto). Sem gate possivel → declare isso explicitamente e defina o substituto
   humano (review manual) — nao finja verificacao.
3. **Semeie o corpus** (`knowledge/` conforme `../core/09-context-engineering.md`):
   `START-HERE.md` + `rules/` vazio + `areas.json` com as areas obvias. Cada regra de
   negocio descoberta daqui pra frente vira `BR-*.json/.md` no mesmo diff que a tocou.
4. **Semeie as lessons**: copie `../lessons/` pra memoria do projeto (ou referencie o
   repo) — sao erros ja pagos; nao os pague de novo.
5. **Crie a memoria**: indice vazio + primeira memoria (`project`: objetivo, decisoes da
   Fase 1, data absoluta).
6. **Registre os protocolos disponiveis** no `AGENTS.md`: loop (`core/05`), plan-loop
   (`core/06`), grafo (`core/07`) — por referencia, nao por copia.

## Fase 3 — Prova de vida (nao encerre sem isto)

1. Rode o gate e COLE o resultado.
2. Execute 1 micro-tarefa real de ponta a ponta usando o loop (`core/05`): find → act →
   gate → record. Pode ser trivial (um teste novo, uma correcao pequena).
3. Mostre ao humano: arquivos criados, gate provado, micro-tarefa entregue, e as
   3 primeiras tarefas sugeridas.

## Regras do bootstrap

- NUNCA sobrescreva `AGENTS.md`/`CLAUDE.md`/README existente — proponha merge.
- NUNCA commit/push sem pedido explicito.
- Projeto de outra pessoa/empresa: respeite as regras DELE; o agentic-os e o seu metodo,
  nao uma imposicao ao repo (os arquivos podem ficar gitignored/locais se o time nao opta).
- Harness com tooling (Claude Code/Codex): apos o bootstrap, sugira tambem o adapter
  (`../adapters/<harness>/INSTALL.md`). Harness texto-puro: o sistema ja funciona so com
  os arquivos criados + `../adapters/any-llm/PROTOCOL.md` na conversa.
