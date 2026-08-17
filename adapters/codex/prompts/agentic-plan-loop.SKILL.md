---
name: agentic-plan-loop
description: Loop de PLANEJAMENTO gate-stop (agentic-os). Itera brainstorm -> plano -> gates G1-G5 -> checker adversarial ate o PLAN passar ou bater hard-stop. Nunca escreve codigo de producao, nunca commita.
version: 1.0.0
compatibility: claude-code codex
---

# agentic-plan-loop (wrapper — o canonico mora no repo agentic-os)

Leia `<caminho-do-repo-agentic-os>/core/06-plan-loop.md` INTEIRO e execute o protocolo
com a tarefa passada pelo usuario.

Regras que nao podem ser puladas:
1. Entregavel e PLANO (`PLAN-<slug>.md`). Nenhuma linha de codigo de producao.
2. Gates G1-G5 com evidencia COLADA (grounding de cada citacao, cobertura de regras,
   checklist de formato, contrato, auto-grep de invariantes no proprio plano).
3. Decisao de produto pendente de terceiro = marca PENDENTE VALIDACAO <nome> — nunca
   promovida a decisao firme. As marcas nao podem sumir do plano final.
4. Plano e evidencias chegam na MESMA mensagem final.
5. Harness CODEX: checker adversarial = passe proprio em turno separado, plano congelado.
