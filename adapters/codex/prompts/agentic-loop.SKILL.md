---
name: agentic-loop
description: Loop de trabalho gate-stop (agentic-os). Itera find -> act -> gate -> record -> decide até o gate objetivo passar ou bater hard-stop, então para pra review humano. Nunca commita nem toca zona proibida sozinho.
version: 1.0.0
compatibility: claude-code codex
---

# agentic-loop (wrapper: o canônico mora no repo agentic-os)

Leia `<caminho-do-repo-agentic-os>/core/05-loop-engineering.md` INTEIRO e execute o
protocolo com a tarefa passada pelo usuário.

Regras que não podem ser puladas:
1. Harness CODEX: checker = passe adversarial próprio em turno separado (diff congelado);
   perguntas em texto plano, todas numa rodada.
2. Gate com caminho ABSOLUTO, prova COLADA toda volta ("passou" sem output = não aconteceu).
3. Hard-stops: 5 iterações, 2 sem progresso, teto de custo, zona proibida, escopo.
4. State file por tarefa em `./.loop/state-<slug>.md`.
5. Solve não-trivial fecha com nota de aprendizado (core/08).
