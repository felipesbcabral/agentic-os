---
name: agentic-sync
description: Sincroniza os adapters do projeto atual (loops de dominio, overlays, templates) com o core do agentic-os. Regra herdada atualiza; conteudo de dominio preserva; conflito com invariante escala pro humano. Nunca commita.
version: 1.0.0
compatibility: claude-code codex
---

# agentic-sync (wrapper: o canônico mora no repo agentic-os)

<!-- O instalador (INSTALL.md) SUBSTITUI o placeholder abaixo pelo caminho real.
     Se você está lendo <caminho-do-repo-agentic-os> em tempo de execução, a
     instalação está quebrada: pare e reinstale. -->

Leia `<caminho-do-repo-agentic-os>/bootstrap/UPGRADE.md` INTEIRO e execute o protocolo
no projeto atual, com o adapter passado pelo usuário (vazio = localizar todos).

Regras que não podem ser puladas:
1. Conteúdo de DOMÍNIO do adapter NÃO se reescreve; conflito core × invariante do projeto
   = o projeto vence e o humano decide.
2. Migração de state pro canônico `./.loop/` deixa ponteiro no local antigo por 1 ciclo.
3. Fecha com: diff do adapter, smoke/gate colado, stamp novo gravado, nota no vault.
4. Nunca commita.
