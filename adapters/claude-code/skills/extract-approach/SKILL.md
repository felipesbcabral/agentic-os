---
name: extract-approach
description: "Use após resolver problema não-trivial: grava a abordagem como nota curta reusável (learning law)."
---

# extract-approach

Depois de resolver um problema difícil, grava UMA nota curta (sob 1 página) com o raciocínio, pra qualquer modelo futuro seguir o mesmo caminho. É o "gravador": converte cada solve difícil em ativo permanente.

## Quando dispara
- Bug que exigiu investigação real (não fix óbvio de 1 linha)
- Decisão de arquitetura / trade-off
- Build/refactor com raciocínio não-trivial
- NÃO dispara: fix trivial, rename mecânico, edição óbvia, MODO RAPIDO

## Onde grava (segue o projeto, não inventa pasta)
- **Projeto com `.vault/` (se houver):** obedece a regra de vault do projeto, se declarada. Grava na categoria certa do vault existente — `.vault/Bugs/` (lição de bug), `.vault/Decisoes/` (decisão), `.vault/Arquitetura/` (padrão), `.vault/Sessoes/` (log de sessão) — com `[[wikilinks]]` e metadata YAML no padrão do vault. NÃO edita `_INDEX.md` na mão (o script `_maint/` regenera).
- **Projeto sem vault:** grava em `<cwd>/learnings/<AAAA-MM-DD>-<slug>.md`.

## As 4 seções (escreve como se um modelo MAIS FRACO fosse ler frio e seguir o mesmo caminho)
1. **Problema** (1 linha) — o sintoma/pergunta exata.
2. **Abordagem** — como o problema foi decomposto, em passos numerados.
3. **Judgment calls** — o que foi deliberadamente NÃO feito, e por quê (os becos evitados).
4. **Regra reusável** (1 linha) — o princípio que um modelo futuro deve aplicar quando "cheirar" um problema parecido.

## Regras
- 1 nota por problema; atualiza a existente em vez de duplicar.
- Cita `arquivo:linha` do caminho crítico quando relevante.
- Lição de família já documentada (EF8 Include, sync Simova, apontamento-macro...) → adiciona à nota/dossiê existente, não cria solta.
- Nota sem "regra reusável" está incompleta.
