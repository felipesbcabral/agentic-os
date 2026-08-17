# agentic-os

Sistema operacional agentico portatil: o metodo completo de trabalhar com IA — julgamento,
execucao, loops com gate, grafos de agentes, memoria, verificacao e escrita — destilado de
meses de uso real em producao, **sem nenhuma dependencia de projeto, empresa ou modelo**.

Funciona em qualquer IA que leia markdown: Claude Code, Codex, Gemini, Grok, Kimi, Qwen,
ou a proxima que aparecer. O nucleo e texto puro; adapters dao tooling extra onde o
harness suporta.

## Regra de ouro

**Indice aponta, nao contem.** Cada camada mora no proprio arquivo e carrega sob demanda.
Nenhuma IA deve engolir este repo inteiro no contexto — ela carrega o `core/00-manifesto.md`
e navega a partir dele.

## Como usar (3 modos)

1. **Projeto novo** — abra a IA no projeto e mande:
   `Leia bootstrap/BOOTSTRAP.md deste repo e converta o agentic-os para este projeto.`
   Ela instancia regras, gates, loops e memoria calibrados pra stack e dominio locais.
2. **IA com tooling (Claude Code / Codex)** — siga `adapters/<harness>/INSTALL.md`:
   copia skills, comandos e workflows prontos.
3. **Qualquer outra IA (Gemini, Grok, Kimi, Qwen...)** — cole `adapters/any-llm/PROTOCOL.md`
   na conversa (ou no system prompt). E o sistema inteiro num documento encarnavel.

## Mapa do repo

| Pasta | O que tem | Quando ler |
|---|---|---|
| `core/` | O metodo, em 12 documentos numerados (julgamento, execucao, verificacao, loop, plan-loop, grafo, memoria, contexto, roteamento de modelo, escrita) | A IA carrega sob demanda; humano le 1x |
| `bootstrap/` | O protocolo de conversao pra projeto novo + templates (regras, state file, packet, AGENTS.md) | Ao chegar num projeto/estudo novo |
| `adapters/` | Instalacao por harness: claude-code (skills+commands+workflows), codex (skills+prompts), any-llm (documento unico) | 1x por ferramenta |
| `lessons/` | Memorias de feedback genericas — erros ja pagos, com correcao gravada. Semente do self-improvement em qualquer projeto | O bootstrap semeia; a IA consulta |
| `docs/` | Fontes de TUDO (artigos, playbooks, palestras — com flags de credibilidade), historia da construcao e diagramas | Quando alguem perguntar "de onde saiu isso?" |

## A escada (o modelo mental do repo inteiro)

```
PROMPT  ->  CONTEXT  ->  HARNESS  ->  LOOP  ->  GRAPH
mensagem    memoria      maquina      corrida   coordenacao
```

Prompt engineering melhora a instrucao. Context engineering controla o que o modelo ve.
Harness engineering constroi o ambiente em volta. Loop engineering faz uma unidade de
trabalho melhorar por feedback. Graph engineering coordena o trabalho inteiro.
O modelo e so um no; o produto e o sistema em volta dele. Detalhe: `core/00-manifesto.md`.

## Principios inegociaveis (valem em qualquer harness)

- **Gate que pode REPROVAR** ou nao ha loop — verificacao objetiva, prova colada, nunca prometida.
- **Maker != checker** — quem escreveu nao se auto-aprova.
- **Invariante em prosa nao segura o modelo** — regra critica vira assertion mecanica (grep/teste).
- **Acao irreversivel e do humano** — commit, push, deploy, delete, mensagem externa.
- **Cap antes de rodar** — iteracoes, agentes e tokens com teto explicito.
- **Learning law** — solve nao-trivial fecha com nota de aprendizado gravada, senao repete.

## Origem

Construido entre 2026-02 e 2026-08 num projeto de producao real (ERP de engenharia,
.NET + MongoDB + Azure DevOps) e generalizado. Fontes primarias e estudos completos em
`docs/SOURCES.md` — nada aqui e opiniao sem lastro.
