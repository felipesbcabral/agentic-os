# SOURCES — de onde cada peca saiu

Todo estudo usado na construcao deste sistema, com flag de credibilidade. Nada aqui e
opiniao sem lastro; e nada aqui foi engolido sem verificacao (ver as flags).

## Fontes primarias (engenharia publicada)

| Fonte | O que deu ao sistema |
|---|---|
| Anthropic — "Building Effective Agents" (Schluntz & Zhang, 2024) | Os 5 padroes de agente (augmented LLM, prompt chaining, routing, orchestrator-workers, evaluator-optimizer) que fundamentam `core/07` |
| Anthropic — "Scaling Managed Agents" (L. Martin et al., 2026, anthropic.com/engineering) | Brain/hands/session desacoplados; log append-only duravel; verifier em contexto INDEPENDENTE; memoria dual (escrita in-band + consolidacao offline "dreaming"); credencial nunca no sandbox → `core/04`, `core/08` |
| Anthropic — cookbook "Knowledge Graph Construction with Claude" | Pipeline KG 4 estagios (extraction/resolution/assembly/querying) → `core/09` e workflow `kg-ingestion` |
| Anthropic — benchmarks advisor/orchestrator (2026-07) | Advisor: 92% do score a 63% do custo; Orchestrator: 96% a 46% → `core/10` inteiro |
| Anthropic — multi-agent research system (engineering blog) | Lead agent + subagents paralelos + citation stage; ~90% de ganho em tarefa paralelizavel a 10-15x tokens → stop rule de `core/07` |
| Palestra Lance Martin (Anthropic), "Towards asynchronous agents" (AI Engineer World's Fair, ~19min) | Trajetoria autonomia 10-20min (2024) → 12h+ (2026). Quote "80% dos engenheiros usam self-improving loops" NAO verificada em fonte escrita — tratada como marketing |

## Serie "rari" (@0xwhrrari, X/Substack) — a espinha didatica

| Artigo | O que deu ao sistema |
|---|---|
| "Loop Engineering: The AI skill every builder needs" (2026) | MVL (4 pecas), 4 condicoes, gate-stop, state file, custo por mudanca aceita → `core/05` |
| "Graph Engineering: How to Build AI Agent Systems That Don't Break at Scale" (2026-08, x.com/0xwhrrari/status/2086784668003598356) | 4 shapes (chain/diamond/router/controlled cycle), fake edges, contratos por node, verificacao na aresta, estado durvel, topologia=custo, escada PROMPT→CONTEXT→HARNESS→LOOP→GRAPH → `core/00` e `core/07`; diagramas em `diagrams/` |
| "The Three Layers Behind Reliable AI Agents: Harness vs Loop vs Graph" | A separacao de camadas do manifesto |
| Flag | Content creator com funil (Substack/newsletter). Conteudo tecnico solido e alinhado ao cookbook real da Anthropic; numeros de marketing ("80%", "4-6 meses") sem fonte primaria — descontados |

## Outros estudos da onda graph-engineering (2026-07)

| Fonte | O que deu / flag |
|---|---|
| PDF "Knowledge Graph Engineering for Multi-Agentic Systems: The Anthropic Playbook" (12 pag., jul/2026) | Checklist de producao KG (10 itens: gold set, alias map, proveniencia, monitor de conectividade, amostra humana...); guidance de escala. FLAG: sintese INDEPENDENTE — o proprio PDF declara que NAO e da Anthropic, apesar dos tweets dizerem o contrario |
| Machina (@EXM7777) — "How to master graph engineering (Full Course)" | Vocabulario de 6 palavras (box, arrow, running notes, fake edge, diamond, gate); wiring anti-acidente → `core/07`. FLAG: creator com funil |
| @0xCodez — "Graph Engineering with Claude: 14-Step roadmap" | Manual pratico do runtime de workflows (agent/parallel/pipeline). FLAG: creator com funil |
| Gabriel Packer (@gkpacker) — workflow solo founder (2 partes, mar+jul/2026) | Tickets → DAG → waves → 1 agente/worktree → PR → merge humano; "ticket = prompt autocontido, PR < 400 linhas" → workflow `dependency-waves` e `core/07` estado durvel |

## Metodologia e craft

| Fonte | O que deu |
|---|---|
| obra/superpowers (github.com/obra/superpowers) | Brainstorm antes de plano; plano executavel por "junior entusiasmado sem contexto"; TDD red/green como disciplina de execucao; subagent-driven development → `core/06` |
| Matt Pocock — "writing great skills" (mattpocock/skills) | Qualidade de skill: predictability, information hierarchy, progressive disclosure, failure modes (premature-completion, duplication, sediment, sprawl) |
| Paweł Huryn / Bilal Bakr — regras de execucao (2026-08) | "Feito significa feito", "pergunta e pergunta", "aja, nao peca permissao" → `core/02` |
| Karpathy — surface assumptions | Premissas explicitas antes de executar pedido ambiguo → `core/01` |

## Validacao propria (nao publicada — a parte que so a pratica da)

- Meses de operacao em projeto de producao real (ERP de engenharia, .NET+MongoDB):
  toda licao em `../lessons/` foi PAGA, nao lida.
- Validacao executor-barato-com-documento-brilhante vs executor-caro-sem-documento
  (2026-07): o documento venceu.
- Primeira execucao real do plan-loop (2026-08-17) expos que invariante em prosa nao
  segura o modelo → G5 mecanico (`lessons/gate-design.md`).
- Auditoria de uso de 30 sessoes (2026-07): 117/135 artefatos sem invocacao → regra de
  poda e o principio "aponta, nao contem".
