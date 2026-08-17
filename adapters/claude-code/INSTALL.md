# Instalacao — Claude Code

```bash
# a partir da raiz deste repo
cp commands/*.md   ~/.claude/commands/
cp -r skills/*     ~/.claude/skills/
mkdir -p ~/.claude/workflows && cp workflows/*   ~/.claude/workflows/
mkdir -p ~/.claude/loop-templates && cp loop-state.md ~/.claude/loop-templates/state.md
```

Depois, no `~/.claude/CLAUDE.md`, adicione o kernel (2 linhas):

```markdown
Metodo: agentic-os (<caminho-do-repo>/core/00-manifesto.md) — carregar sob demanda.
Learning law: solve nao-trivial fecha com extract-approach + self-review.
```

## O que cada peca da

- `/gloop <tarefa>` — loop gate-stop em qualquer projeto (protocolo completo; skill
  `loop-global` e o conhecimento).
- `/ggraph <objetivo>` — desenhar/rodar grafos pela Workflow tool (skill `graph-global`).
- `workflows/` — grafos salvos re-runnaveis: `adversarial-review` (review multi-lente +
  ceticos), `discovery-until-dry` (varredura ate secar), `dependency-waves` (ondas de
  tickets), `kg-ingestion` (docs → knowledge graph), `memory-consolidation` (dreaming).
- `extract-approach` + `self-review` — a learning law executavel.

## Gotchas de runtime (pagos, nao teorizados)

- Skill/command novo so aparece no menu em SESSAO NOVA (lista monta no start).
- `Workflow {name}` so resolve workflow salvo em sessao nova — na MESMA sessao use
  `{scriptPath}`.
- `args` do Workflow pode chegar como STRING JSON — normalize no topo do script:
  `const A = typeof args==='string' ? JSON.parse(args) : (args||{})`.
- `Date.now()`/`Math.random()` em script de workflow QUEBRAM o resume — timestamp via args.
- Resultado vazio "misterioso" de workflow: leia o `journal.jsonl` do run antes de teorizar.
- Repo com `.claude/` gitignored: worktrees nascem cegos — copie `.claude/` do checkout
  principal ao criar worktree.
