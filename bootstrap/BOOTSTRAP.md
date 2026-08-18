# BOOTSTRAP. Converta o agentic-os para ESTE projeto

Você (IA) recebeu este documento dentro de um projeto novo. Sua tarefa: instanciar o
sistema agentic-os calibrado pra ESTE repo/estudo/domínio. O resultado é um conjunto
pequeno de arquivos no projeto, não uma cópia do repo inteiro (regra de ouro: aponta,
não contém).

Tempo esperado: 1 sessão. Pergunte pouco e em lote; proponha defaults com recomendação.

## Fase 0. Reconhecimento (read-only, sem perguntar nada ainda)

1. Detecte a stack (arquivos-marcador: package.json, pyproject.toml, Cargo.toml, go.mod,
   *.csproj, Makefile...) e o comando de teste/build/lint mais ESTREITO que reprova
   trabalho ruim. Rode 1x pra confirmar baseline (verde ou documente o vermelho atual).
2. Leia o que já existe de instrução (`AGENTS.md`, `CLAUDE.md`, `README`, docs/):
   NÃO sobrescreva trabalho humano; o bootstrap COMPLEMENTA.
3. Liste as zonas de risco do domínio: o que aqui é irreversível? o que é dado de
   produção? o que toca dinheiro/auth/terceiros? (vira zona proibida local)
4. Identifique o tipo de projeto: código de produção / estudo-aprendizado / escrita /
   pesquisa / dados. Isso calibra QUAIS peças instalar (tabela na Fase 2).

## Fase 1. Entrevista mínima (UMA rodada de perguntas)

Pergunte apenas o que o reconhecimento não respondeu, com recomendação por item:
- Objetivo do projeto em 1 frase (vira o norte anti goal-drift).
- Invariantes inegociáveis do domínio (ex.: "nunca tocar tabela X", "dados de cliente
  não saem daqui", "regra fiscal Y é lei").
- Onde mora a verdade do negócio hoje (tickets? planilha? cabeça de alguém?). Alimenta
  o corpus.
- Gate preferido se houver mais de um candidato.

## Fase 2. Instanciar (o que criar, por tipo de projeto)

| Peça | Código produção | Estudo | Escrita/pesquisa |
|---|---|---|---|
| `AGENTS.md` (índice + invariantes) | SIM | SIM | SIM |
| Gate fixado (comando absoluto) | SIM | SIM (exercícios/teste) | adaptado (checklist/rubrica) |
| `knowledge/rules/` (corpus) | SIM (nasce vazio) | opcional | opcional |
| `.loop/` (state files) | SIM | SIM | SIM |
| Memória (índice + arquivos) | SIM | SIM | SIM |
| Lessons semeadas | SIM | SIM | SIM |

Passos:

1. **Crie `AGENTS.md`** do template (`templates/AGENTS.template.md`): índice curto com
   objetivo, stack, gate exato, invariantes/zonas proibidas locais, ponteiros pro
   agentic-os. Máximo ~60 linhas; detalhe mora em arquivo apontado.
2. **Fixe o gate** validado na Fase 0 dentro do `AGENTS.md` (comando literal, caminho
   absoluto). Sem gate possível → declare isso explicitamente e defina o substituto
   humano (review manual). Não finja verificação.
3. **Semeie o corpus** (`knowledge/` conforme `../core/09-context-engineering.md`):
   `START-HERE.md` + `rules/` vazio + `areas.json` com as áreas óbvias. Cada regra de
   negócio descoberta daqui pra frente vira `BR-*.json/.md` no mesmo diff que a tocou.
4. **Semeie as lessons**: copie `../lessons/` pra memória do projeto (ou referencie o
   repo). São erros já pagos; não os pague de novo.
5. **Crie a memória**: índice vazio + primeira memória (`project`: objetivo, decisões da
   Fase 1, data absoluta).
6. **Registre os protocolos disponíveis** no `AGENTS.md`: loop (`core/05`), plan-loop
   (`core/06`), grafo (`core/07`), por referência, não por cópia.

## Fase 3. Prova de vida (não encerre sem isto)

1. Rode o gate e COLE o resultado.
2. Execute 1 micro-tarefa real de ponta a ponta usando o loop (`core/05`): find → act →
   gate → record. Pode ser trivial (um teste novo, uma correção pequena).
3. Mostre ao humano: arquivos criados, gate provado, micro-tarefa entregue, e as
   3 primeiras tarefas sugeridas.

## Regras do bootstrap

- NUNCA sobrescreva `AGENTS.md`/`CLAUDE.md`/README existente. Proponha merge.
- NUNCA commit/push sem pedido explícito.
- Projeto de outra pessoa/empresa: respeite as regras DELE; o agentic-os é o seu método,
  não uma imposição ao repo (os arquivos podem ficar gitignored/locais se o time não opta).
- Harness com tooling (Claude Code/Codex): após o bootstrap, sugira também o adapter
  (`../adapters/<harness>/INSTALL.md`). Harness texto-puro: o sistema já funciona só com
  os arquivos criados + `../adapters/any-llm/PROTOCOL.md` na conversa.
