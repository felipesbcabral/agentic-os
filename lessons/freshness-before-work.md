# Arvore stale: local, branch-alvo e producao sao ate 3 versoes diferentes

Reincidente 7x. Sessao abre numa branch ja mergeada, centenas de commits atras da
default: o codigo lido NAO e o codigo real, o fix pode nem compilar la, e afirmacoes
"X existe / e usado / e orfao" saem erradas.

**Why:** a arvore local e um snapshot; a branch default anda; producao roda um terceiro
artefato (a imagem/tag deployada). Cada afirmacao pertence a UMA dessas versoes.

**How to apply:** (1) ANTES de diagnosticar/corrigir/abrir PR: `git fetch` +
`git log HEAD..origin/<default>` — nao-vazio = arvore stale; (2) afirmacao sobre a
default se prova com `git grep <termo> origin/<default>`, nunca com busca na arvore;
(3) pra afirmar o que PRODUCAO faz, cheque o artefato deployado, nao o codigo;
(4) repo com varias branches long-lived: a base do PR nao e necessariamente a default —
confirme o alvo antes de investigar; (5) branch que nasce de etapa anterior em hotfix:
a proxima nasce da base certa, nao da branch da etapa.
