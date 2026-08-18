# SOURCES. De onde cada peça saiu

Todo estudo usado na construção deste sistema, com flag de credibilidade. Nada aqui é
opinião sem lastro; e nada aqui foi engolido sem verificação (ver as flags).

## Fontes primárias (engenharia publicada)

| Fonte | O que deu ao sistema |
|---|---|
| Anthropic: "Building Effective Agents" (Schluntz & Zhang, 2024) | Os 5 padrões de agente (augmented LLM, prompt chaining, routing, orchestrator-workers, evaluator-optimizer) que fundamentam `core/07` |
| Anthropic: "Scaling Managed Agents" (L. Martin et al., 2026, anthropic.com/engineering) | Brain/hands/session desacoplados; log append-only durável; verifier em contexto INDEPENDENTE; memória dual (escrita in-band + consolidação offline "dreaming"); credencial nunca no sandbox → `core/04`, `core/08` |
| Anthropic: cookbook "Knowledge Graph Construction with Claude" | Pipeline KG 4 estágios (extraction/resolution/assembly/querying) → `core/09` e workflow `kg-ingestion` |
| Anthropic: benchmarks advisor/orchestrator (2026-07) | Advisor: 92% do score a 63% do custo; Orchestrator: 96% a 46% → `core/10` inteiro |
| Anthropic: multi-agent research system (engineering blog) | Lead agent + subagents paralelos + citation stage; ~90% de ganho em tarefa paralelizável a 10-15x tokens → stop rule de `core/07` |
| Palestra Lance Martin (Anthropic), "Towards asynchronous agents" (AI Engineer World's Fair, ~19min) | Trajetória autonomia 10-20min (2024) → 12h+ (2026). Quote "80% dos engenheiros usam self-improving loops" NÃO verificada em fonte escrita, tratada como marketing |

## Série "rari" (@0xwhrrari, X/Substack). A espinha didática

| Artigo | O que deu ao sistema |
|---|---|
| "Loop Engineering: The AI skill every builder needs" (2026) | MVL (4 peças), 4 condições, gate-stop, state file, custo por mudança aceita → `core/05` |
| "Graph Engineering: How to Build AI Agent Systems That Don't Break at Scale" (2026-08, x.com/0xwhrrari/status/2086784668003598356) | 4 shapes (chain/diamond/router/controlled cycle), fake edges, contratos por node, verificação na aresta, estado durável, topologia=custo, escada PROMPT→CONTEXT→HARNESS→LOOP→GRAPH → `core/00` e `core/07`; diagramas em `diagrams/` |
| "The Three Layers Behind Reliable AI Agents: Harness vs Loop vs Graph" | A separação de camadas do manifesto |
| Flag | Content creator com funil (Substack/newsletter). Conteúdo técnico sólido e alinhado ao cookbook real da Anthropic; números de marketing ("80%", "4-6 meses") sem fonte primária, descontados |

## Outros estudos da onda graph-engineering (2026-07)

| Fonte | O que deu / flag |
|---|---|
| PDF "Knowledge Graph Engineering for Multi-Agentic Systems: The Anthropic Playbook" (12 pág., jul/2026) | Checklist de produção KG (10 itens: gold set, alias map, proveniência, monitor de conectividade, amostra humana...); guidance de escala. FLAG: síntese INDEPENDENTE. O próprio PDF declara que NÃO é da Anthropic, apesar dos tweets dizerem o contrário |
| Machina (@EXM7777): "How to master graph engineering (Full Course)" | Vocabulário de 6 palavras (box, arrow, running notes, fake edge, diamond, gate); wiring anti-acidente → `core/07`. FLAG: creator com funil |
| @0xCodez: "Graph Engineering with Claude: 14-Step roadmap" | Manual prático do runtime de workflows (agent/parallel/pipeline). FLAG: creator com funil |
| Gabriel Packer (@gkpacker): workflow solo founder (2 partes, mar+jul/2026) | Tickets → DAG → waves → 1 agente/worktree → PR → merge humano; "ticket = prompt autocontido, PR < 400 linhas" → workflow `dependency-waves` e `core/07` estado durável |

## Metodologia e craft

| Fonte | O que deu |
|---|---|
| obra/superpowers (github.com/obra/superpowers) | Brainstorm antes de plano; plano executável por "junior entusiasmado sem contexto"; TDD red/green como disciplina de execução; subagent-driven development → `core/06` |
| akitaonrails/ai-memory (estudo 2026-08-17) | Lifecycle de memória (pinned / expires_at com TTL vencendo pin / supersession), checklist negativa de admissão, handoff cross-harness tipado (summary/open_questions/files_touched/next_steps, manual vence automático), rejection buffer + caps no passe de consolidação, eval gate determinístico pra memória de regra, "memória nunca sobrepõe build/teste" → `core/08` e `bootstrap/templates/handoff.template.md`. Prior-art notes do repo documentam falhas de agentmemory/basic-memory/cognee/mempalace |
| Matt Pocock: "writing great skills" (mattpocock/skills) | Qualidade de skill: predictability, information hierarchy, progressive disclosure, failure modes (premature-completion, duplication, sediment, sprawl) |
| Paweł Huryn / Bilal Bakr: regras de execução (2026-08) | "Feito significa feito", "pergunta é pergunta", "aja, não peça permissão" → `core/02` |
| Karpathy: surface assumptions | Premissas explícitas antes de executar pedido ambíguo → `core/01` |

## Validação própria (não publicada: a parte que só a prática dá)

- Meses de operação em projeto de produção real (ERP de engenharia, .NET+MongoDB):
  toda lição em `../lessons/` foi PAGA, não lida.
- Validação executor-barato-com-documento-brilhante vs executor-caro-sem-documento
  (2026-07): o documento venceu.
- Primeira execução real do plan-loop (2026-08-17) expôs que invariante em prosa não
  segura o modelo → G5 mecânico (`lessons/gate-design.md`).
- Auditoria de uso de 30 sessões (2026-07): 117/135 artefatos sem invocação → regra de
  poda e o princípio "aponta, não contém".
