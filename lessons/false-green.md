# O gate pode mentir (false green)

O pior modo de falha de qualquer loop: certificar trabalho quebrado. Casos reais:
cwd num worktree/copia fazendo o gate compilar a arvore ERRADA; build stale servindo
binario antigo; teste focado concorrendo com a suite no mesmo diretorio de saida;
teste RED recem-escrito passando de primeira porque o binario testado nao era o editado.

**Why:** o comando de gate confia no ambiente (cwd, cache de build, output dir), e o
ambiente mente com facilidade em worktrees, sessoes paralelas e monorepos.

**How to apply:** (1) caminho ABSOLUTO do repo/projeto em todo comando de gate, fixado no
state file e reusado toda volta; (2) teste RED que passa de primeira = investigue o
AMBIENTE antes do teste; (3) alvo do gate = o mais estreito que ainda reprova; (4) build
falhando em arquivo que voce NAO tocou e esta limpo no git, em diretorio compartilhado =
suspeite de build concorrente antes de investigar o codigo (re-run limpo confirma).
