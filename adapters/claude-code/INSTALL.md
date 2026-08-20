# Instalação. Claude Code

```bash
# a partir da raiz deste repo
REPO="$(cd ../.. && pwd)"   # raiz do repo agentic-os
cp commands/*.md   ~/.claude/commands/
# /gsync referencia o repo por caminho: substituir o placeholder é obrigatório
sed -i "s|<caminho-do-repo-agentic-os>|$REPO|g" ~/.claude/commands/gsync.md
grep -l "caminho-do-repo" ~/.claude/commands/gsync.md   # smoke: precisa voltar vazio
cp -r skills/*     ~/.claude/skills/
mkdir -p ~/.claude/loop-templates && cp loop-state.md ~/.claude/loop-templates/state.md
# workflows-experimental/ NÃO entra na instalação padrão: ver a nota abaixo
```

Depois, no `~/.claude/CLAUDE.md`, adicione o kernel (2 linhas):

```markdown
Método: agentic-os (<caminho-do-repo>/core/00-manifesto.md), carregar sob demanda.
Learning law: solve não-trivial fecha com extract-approach + self-review.
```

## O que cada peça dá

- `/gloop <tarefa>`: loop gate-stop em qualquer projeto (protocolo completo; a skill
  `loop-global` é o conhecimento).
- `/ggraph <objetivo>`: desenhar/rodar grafos pela Workflow tool (skill `graph-global`).
- `workflows-experimental/`: desenhos de referência (`adversarial-review` review
  multi-lente + céticos, `discovery-until-dry` varredura até secar, `dependency-waves`
  ondas de tickets, `kg-ingestion` docs → knowledge graph, `memory-consolidation`
  dreaming). EXPERIMENTAL e fora da instalação padrão: nenhum tem execução registrada
  (a auditoria de 2026-08 achou 38 rodadas reais de Workflow, todas com script escrito na
  hora). Copie pra `~/.claude/workflows/` o que for usar; depois de 1 execução com journal
  completo e resultado aceito, o workflow é promovido. `/gloop` e a skill `graph-global`
  apontam pra este mesmo caminho, então a referência continua resolvível sem a cópia.
- `/gsync [adapter]`: sincroniza adapters de PROJETO (loops de domínio como o bee-loop)
  com o core atual (`../../bootstrap/UPGRADE.md`). Regra herdada atualiza, domínio
  preserva, e o stamp `herdado de core@<versão>` detecta drift. Rode a cada evolução
  do core.
- `extract-approach` + `self-review`: a learning law executável.

## Gotchas de runtime (pagos, não teorizados)

- Skill/command novo só aparece no menu em SESSÃO NOVA (lista monta no start).
- `Workflow {name}` só resolve workflow salvo em sessão nova; na MESMA sessão use
  `{scriptPath}`.
- `args` do Workflow pode chegar como STRING JSON; normalize no topo do script:
  `const A = typeof args==='string' ? JSON.parse(args) : (args||{})`.
- `Date.now()`/`Math.random()` em script de workflow QUEBRAM o resume; timestamp via args.
- Resultado vazio "misterioso" de workflow: leia o `journal.jsonl` do run antes de teorizar.
- Repo com `.claude/` gitignored: worktrees nascem cegos; copie `.claude/` do checkout
  principal ao criar worktree.
