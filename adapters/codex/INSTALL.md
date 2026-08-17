# Instalacao — Codex

O menu `/` do app Codex lista SKILLS (`~/.codex/skills/`); prompts (`~/.codex/prompts/`)
sao a via alternativa por CLI. Instale como skill para aparecer no picker.

```bash
# a partir da raiz deste repo
mkdir -p ~/.codex/skills/agentic-loop ~/.codex/skills/agentic-plan-loop
cp prompts/agentic-loop.SKILL.md      ~/.codex/skills/agentic-loop/SKILL.md
cp prompts/agentic-plan-loop.SKILL.md ~/.codex/skills/agentic-plan-loop/SKILL.md
```

E no `~/.codex/AGENTS.md`, o kernel:

```markdown
Metodo: agentic-os (<caminho-do-repo>) — core/00-manifesto.md sob demanda.
Checker: como o Codex nao tem subagentes, maker != checker = passe adversarial proprio
em turno separado, com o plano/diff CONGELADO durante a revisao.
Learning law: solve nao-trivial fecha com nota extract-approach.
```

## Padrao de wrapper (skill fina apontando pro canonico)

A skill NAO duplica o protocolo — le o arquivo canonico do repo e executa. Um so lugar
pra manter; Claude e Codex herdam juntos a mesma correcao. Ver os dois wrappers em
`prompts/`.

## Diferencas operacionais vs Claude Code

- Sem Agent tool → checker vira passe proprio em turno separado (nunca no mesmo turno
  que escreveu).
- Sem Workflow tool → grafos executam "manualmente": voce abre N sessoes/threads pelas
  pecas independentes e faz o merge; o DESENHO continua o de `core/07`.
- Perguntas ao humano em texto plano, todas numa rodada.
