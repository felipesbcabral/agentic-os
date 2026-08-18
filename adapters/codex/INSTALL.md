# Instalação. Codex

O menu `/` do app Codex lista SKILLS (`~/.codex/skills/`); prompts (`~/.codex/prompts/`)
são a via alternativa por CLI. Instale como skill para aparecer no picker.

```bash
# a partir da raiz deste repo
mkdir -p ~/.codex/skills/agentic-loop ~/.codex/skills/agentic-plan-loop
cp prompts/agentic-loop.SKILL.md      ~/.codex/skills/agentic-loop/SKILL.md
cp prompts/agentic-plan-loop.SKILL.md ~/.codex/skills/agentic-plan-loop/SKILL.md
```

E no `~/.codex/AGENTS.md`, o kernel:

```markdown
Método: agentic-os (<caminho-do-repo>): core/00-manifesto.md sob demanda.
Checker: como o Codex não tem subagentes, maker != checker = passe adversarial próprio
em turno separado, com o plano/diff CONGELADO durante a revisão.
Learning law: solve não-trivial fecha com nota extract-approach.
```

## Padrão de wrapper (skill fina apontando pro canônico)

A skill NÃO duplica o protocolo: lê o arquivo canônico do repo e executa. Um só lugar
pra manter; Claude e Codex herdam juntos a mesma correção. Ver os dois wrappers em
`prompts/`.

## Diferenças operacionais vs Claude Code

- Sem Agent tool → checker vira passe próprio em turno separado (nunca no mesmo turno
  que escreveu).
- Sem Workflow tool → grafos executam "manualmente": você abre N sessões/threads pelas
  peças independentes e faz o merge; o DESENHO continua o de `core/07`.
- Perguntas ao humano em texto plano, todas numa rodada.
