---
name: agentic-loop
description: Loop de trabalho gate-stop (agentic-os). Itera find -> act -> gate -> record -> decide até o gate objetivo passar ou bater hard-stop, então para pra review humano. Nunca commita nem toca zona proibida sozinho.
version: 1.1.0
compatibility: claude-code codex
---

# agentic-loop (wrapper: o canônico mora no repo agentic-os)

Leia `<caminho-do-repo-agentic-os>/core/05-loop-engineering.md` INTEIRO e execute o
protocolo com a tarefa passada pelo usuário.

Regras que não podem ser puladas:
1. Harness CODEX: checker = passe adversarial próprio em turno separado (diff congelado);
   perguntas em texto plano, todas numa rodada. Registre no state a identidade do
   checker, o hash do diff congelado e o veredito literal (texto longo vai pra
   `./.loop/evidence/<slug>/`).
2. Gate com caminho ABSOLUTO, prova COLADA toda volta ("passou" sem output = não aconteceu).
   Área tocada sem gate mapeado: pare antes do primeiro ACT, registre a lacuna e use gate
   provisório com baseline completa; salve o stdout da baseline (com os NOMES dos testes
   que falham) em `./.loop/evidence/<slug>/`.
3. Hard-stops: 5 iterações, 2 sem progresso, teto de custo, zona proibida, escopo.
   Acesso temporário autorizado: criar, usar e remover em passos separados, cleanup
   obrigatório com pós-condição colada.
4. State file por tarefa em `./.loop/state-<slug>.md`. Tarefa nascida de ticket só
   encerra com rascunho de resposta ao solicitante no state (sem enviar).
5. Solve não-trivial fecha com nota de aprendizado (core/08). Self-review que propuser
   mudança neste protocolo entra no state como proposta (trecho atual / novo / por quê);
   só vira edição com aprovação humana, e cada edição ganha linha datada de changelog.
