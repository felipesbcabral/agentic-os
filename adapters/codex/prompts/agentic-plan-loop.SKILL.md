---
name: agentic-plan-loop
description: Loop de PLANEJAMENTO gate-stop (agentic-os). Itera brainstorm -> plano -> gates G1-G5 -> checker adversarial até o PLAN passar ou bater hard-stop. Nunca escreve código de produção, nunca commita.
version: 1.0.0
compatibility: claude-code codex
---

# agentic-plan-loop (wrapper: o canônico mora no repo agentic-os)

Leia `<caminho-do-repo-agentic-os>/core/06-plan-loop.md` INTEIRO e execute o protocolo
com a tarefa passada pelo usuário.

Regras que não podem ser puladas:
1. Entregável é PLANO (`PLAN-<slug>.md`). Nenhuma linha de código de produção.
2. Gates G1-G5 com evidência COLADA (grounding de cada citação, cobertura de regras,
   checklist de formato, contrato, auto-grep de invariantes no próprio plano).
3. Decisão de produto pendente de terceiro = marca PENDENTE VALIDACAO <nome>, nunca
   promovida a decisão firme. As marcas não podem sumir do plano final.
4. Plano e evidências chegam na MESMA mensagem final.
5. Harness CODEX: checker adversarial = passe próprio em turno separado, plano congelado.
