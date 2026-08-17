# Trabalho paralelo: 1 writer por arquivo, artefato no workspace isolado

Casos reais: `git stash` engolindo trabalho uncommitted de OUTRA sessao no mesmo
diretorio; `git checkout -b` falhando por arquivo sujo alheio; artefato de sessao criado
untracked na arvore compartilhada e sumindo; dois agentes editando o mesmo arquivo em
paralelo.

**Why:** diretorio compartilhado e estado compartilhado — toda operacao "minha" pode
atropelar o trabalho invisivel do vizinho (outra sessao, outro agente, outro humano).

**How to apply:** (1) 2+ executores nunca tocam os mesmos arquivos — divida por fronteira
sem sobreposicao; edicao paralela de verdade = workspace isolado por executor (git
worktree); (2) nao force nem stashe por cima de sujeira alheia: `git worktree add <path>
-b <branch> origin/<base>` da checkout limpo sem tocar a arvore do outro; (3) artefato de
sessao (state, notas, saida) mora no workspace da sessao, nunca untracked na arvore
compartilhada; (4) pos-compactacao de contexto: arquivo uncommitted que voce "nao lembra"
pode ser SEU — cheque timestamp/historico antes de rotular como alheio ou descartar.
