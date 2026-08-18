# Árvore stale: local, branch-alvo e produção são até 3 versões diferentes

Reincidente 7x. Sessão abre numa branch já mergeada, centenas de commits atrás da
default: o código lido NÃO é o código real, o fix pode nem compilar lá, e afirmações
"X existe / é usado / é órfão" saem erradas.

**Why:** a árvore local é um snapshot; a branch default anda; produção roda um terceiro
artefato (a imagem/tag deployada). Cada afirmação pertence a UMA dessas versões.

**How to apply:** (1) ANTES de diagnosticar/corrigir/abrir PR: `git fetch` +
`git log HEAD..origin/<default>` (não-vazio = árvore stale); (2) afirmação sobre a
default se prova com `git grep <termo> origin/<default>`, nunca com busca na árvore;
(3) pra afirmar o que PRODUÇÃO faz, cheque o artefato deployado, não o código;
(4) repo com várias branches long-lived: a base do PR não é necessariamente a default.
Confirme o alvo antes de investigar; (5) branch que nasce de etapa anterior em hotfix:
a próxima nasce da base certa, não da branch da etapa.
