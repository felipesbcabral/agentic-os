# Trabalho paralelo: 1 writer por arquivo, artefato no workspace isolado

Casos reais: `git stash` engolindo trabalho uncommitted de OUTRA sessão no mesmo
diretório; `git checkout -b` falhando por arquivo sujo alheio; artefato de sessão criado
untracked na árvore compartilhada e sumindo; dois agentes editando o mesmo arquivo em
paralelo.

**Why:** diretório compartilhado é estado compartilhado: toda operação "minha" pode
atropelar o trabalho invisível do vizinho (outra sessão, outro agente, outro humano).

**How to apply:** (1) 2+ executores nunca tocam os mesmos arquivos, divida por fronteira
sem sobreposição; edição paralela de verdade = workspace isolado por executor (git
worktree); (2) não force nem stashe por cima de sujeira alheia: `git worktree add <path>
-b <branch> origin/<base>` dá checkout limpo sem tocar a árvore do outro; (3) artefato de
sessão (state, notas, saída) mora no workspace da sessão, nunca untracked na árvore
compartilhada; (4) pós-compactação de contexto: arquivo uncommitted que você "não lembra"
pode ser SEU. Cheque timestamp/histórico antes de rotular como alheio ou descartar.
