# O gate pode mentir (false green)

O pior modo de falha de qualquer loop: certificar trabalho quebrado. Casos reais:
cwd num worktree/cópia fazendo o gate compilar a árvore ERRADA; build stale servindo
binário antigo; teste focado concorrendo com a suíte no mesmo diretório de saída;
teste RED recém-escrito passando de primeira porque o binário testado não era o editado.

**Why:** o comando de gate confia no ambiente (cwd, cache de build, output dir), e o
ambiente mente com facilidade em worktrees, sessões paralelas e monorepos.

**How to apply:** (1) caminho ABSOLUTO do repo/projeto em todo comando de gate, fixado no
state file e reusado toda volta; (2) teste RED que passa de primeira = investigue o
AMBIENTE antes do teste; (3) alvo do gate = o mais estreito que ainda reprova; (4) build
falhando em arquivo que você NÃO tocou e está limpo no git, em diretório compartilhado =
suspeite de build concorrente antes de investigar o código (re-run limpo confirma).
