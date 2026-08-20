# Instalação. Codex

O menu `/` do app Codex lista SKILLS (`~/.codex/skills/`); prompts (`~/.codex/prompts/`)
são a via alternativa por CLI. Instale como skill para aparecer no picker.

**Passo obrigatório: substituir o placeholder.** Wrapper instalado com
`<caminho-do-repo-agentic-os>` intacto NÃO funciona (a auditoria de 2026-08 achou
instalação nesse estado).

```bash
# a partir da raiz deste repo
REPO="$(pwd)"
for s in agentic-loop agentic-plan-loop agentic-sync; do
  mkdir -p ~/.codex/skills/$s
  sed "s|<caminho-do-repo-agentic-os>|$REPO|g" adapters/codex/prompts/$s.SKILL.md > ~/.codex/skills/$s/SKILL.md
done
# smoke test: as 3 skills existem E nenhuma tem placeholder sobrando
ls ~/.codex/skills/agentic-loop/SKILL.md ~/.codex/skills/agentic-plan-loop/SKILL.md ~/.codex/skills/agentic-sync/SKILL.md
grep -l "caminho-do-repo" ~/.codex/skills/*/SKILL.md   # precisa voltar vazio
```

PowerShell (Windows):

```powershell
$repo = (Get-Location).Path
foreach ($s in 'agentic-loop','agentic-plan-loop','agentic-sync') {
  New-Item -ItemType Directory -Force "$HOME/.codex/skills/$s" | Out-Null
  (Get-Content "adapters/codex/prompts/$s.SKILL.md" -Raw) -replace '<caminho-do-repo-agentic-os>', $repo |
    Set-Content "$HOME/.codex/skills/$s/SKILL.md"
}
# smoke test: as 3 precisam existir e nenhuma pode ter placeholder
@('agentic-loop','agentic-plan-loop','agentic-sync') |
  ForEach-Object { "$_ = " + (Test-Path "$HOME/.codex/skills/$_/SKILL.md") }
Select-String -Path "$HOME/.codex/skills/*/SKILL.md" -Pattern 'caminho-do-repo'   # vazio = ok
```

O smoke test checa PRESENÇA antes de placeholder: skill que não foi instalada não tem
placeholder nenhum e passaria calada num grep sozinho.

E no `~/.codex/AGENTS.md`, o kernel:

```markdown
Método: agentic-os (<substitua pelo caminho real do repo>): core/00-manifesto.md sob demanda.
Checker: DETECTE a capacidade antes de assumir. Com spawn de agente (`spawn_agent`),
checker em agente separado com contexto NOVO (sem fork do histórico do maker). Sem spawn:
passe adversarial próprio em turno separado, diff CONGELADO, e o veredito carrega
CHECKER_INDEPENDENTE_INDISPONIVEL (core/04).
Learning law: solve não-trivial fecha com nota extract-approach.
```

## Padrão de wrapper (skill fina apontando pro canônico)

A skill NÃO duplica o protocolo: lê o arquivo canônico do repo e executa. Um só lugar
pra manter; Claude e Codex herdam juntos a mesma correção. Ver os três wrappers em
`prompts/`.

## Capacidades: detecte, não assuma

A auditoria de 2026-08 pegou este arquivo afirmando "Codex não tem subagentes" enquanto o
Codex Desktop real tinha `spawn_agent` e rodava checker em agente filho. Regra: a cada
instalação, teste o que o harness oferece (spawn de agente? threads? hooks?) e escreva
fallback só pro que falta DE VERDADE.

- Sem spawn de agente → checker vira passe próprio em turno separado (nunca no mesmo
  turno que escreveu) e o state registra `CHECKER_INDEPENDENTE_INDISPONIVEL`.
- Sem Workflow tool → grafos executam "manualmente": N sessões/threads pelas peças
  independentes + merge; o DESENHO continua o de `core/07`.
- Perguntas ao humano em texto plano, todas numa rodada.
