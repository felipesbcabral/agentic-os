---
description: Sincroniza os adapters do PROJETO ATUAL (loops de dominio, overlays, templates) com o core do agentic-os. Regra herdada atualiza; conteudo de dominio preserva; conflito com invariante escala pro humano. Termina gravando o stamp "herdado de core@<versao>".
argument-hint: [caminho do adapter especifico | vazio = detectar todos]
---

# /gsync: atualizar adapters do projeto com o core do agentic-os

Leia `<caminho-do-repo-agentic-os>/bootstrap/UPGRADE.md` INTEIRO e execute o protocolo
no projeto atual. Argumento: `$ARGUMENTS` (adapter específico; vazio = localizar todos).

Regras que não podem ser puladas:
1. Conteúdo de DOMÍNIO do adapter (gotchas, zonas proibidas, gates do projeto) NÃO se
   reescreve. Conflito core × invariante do projeto = o projeto vence e o humano decide.
2. Migração de state pro canônico `./.loop/` deixa ponteiro no local antigo por 1 ciclo.
3. Fecha com: diff do adapter, smoke/gate colado, stamp novo gravado, nota no vault.
4. Nunca commita.
