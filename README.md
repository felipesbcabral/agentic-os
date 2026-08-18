# agentic-os

Sistema operacional agêntico portátil: o método completo de trabalhar com IA (julgamento,
execução, loops com gate, grafos de agentes, memória, verificação e escrita), destilado de
meses de uso real em produção, **sem nenhuma dependência de projeto, empresa ou modelo**.

Funciona em qualquer IA que leia markdown: Claude Code, Codex, Gemini, Grok, Kimi, Qwen,
ou a próxima que aparecer. O núcleo é texto puro; adapters dão tooling extra onde o
harness suporta.

## Regra de ouro

**Índice aponta, não contém.** Cada camada mora no próprio arquivo e carrega sob demanda.
Nenhuma IA deve engolir este repo inteiro no contexto: ela carrega o `core/00-manifesto.md`
e navega a partir dele.

## Como usar (3 modos)

1. **Projeto novo**: abra a IA no projeto e mande:
   `Leia bootstrap/BOOTSTRAP.md deste repo e converta o agentic-os para este projeto.`
   Ela instancia regras, gates, loops e memória calibrados pra stack e domínio locais.
2. **IA com tooling (Claude Code / Codex)**: siga `adapters/<harness>/INSTALL.md`.
   Copia skills, comandos e workflows prontos.
3. **Qualquer outra IA (Gemini, Grok, Kimi, Qwen...)**: cole `adapters/any-llm/PROTOCOL.md`
   na conversa (ou no system prompt). É o sistema inteiro num documento encarnável.

## Mapa do repo

| Pasta | O que tem | Quando ler |
|---|---|---|
| `core/` | O método, em 12 documentos numerados (julgamento, execução, verificação, loop, plan-loop, grafo, memória, contexto, roteamento de modelo, escrita) | A IA carrega sob demanda; humano lê 1x |
| `bootstrap/` | O protocolo de conversão pra projeto novo + templates (regras, state file, packet, AGENTS.md) | Ao chegar num projeto/estudo novo |
| `adapters/` | Instalação por harness: claude-code (skills+commands+workflows), codex (skills+prompts), any-llm (documento único) | 1x por ferramenta |
| `lessons/` | Memórias de feedback genéricas: erros já pagos, com correção gravada. Semente do self-improvement em qualquer projeto | O bootstrap semeia; a IA consulta |
| `docs/` | Fontes de TUDO (artigos, playbooks, palestras, com flags de credibilidade), história da construção e diagramas | Quando alguém perguntar "de onde saiu isso?" |

## A escada (o modelo mental do repo inteiro)

```
PROMPT  ->  CONTEXT  ->  HARNESS  ->  LOOP  ->  GRAPH
mensagem    memória      máquina      corrida   coordenação
```

Prompt engineering melhora a instrução. Context engineering controla o que o modelo vê.
Harness engineering constrói o ambiente em volta. Loop engineering faz uma unidade de
trabalho melhorar por feedback. Graph engineering coordena o trabalho inteiro.
O modelo é só um nó; o produto é o sistema em volta dele. Detalhe: `core/00-manifesto.md`.

## Princípios inegociáveis (valem em qualquer harness)

- **Gate que pode REPROVAR** ou não há loop: verificação objetiva, prova colada, nunca prometida.
- **Maker != checker**: quem escreveu não se auto-aprova.
- **Invariante em prosa não segura o modelo**: regra crítica vira assertion mecânica (grep/teste).
- **Ação irreversível é do humano**: commit, push, deploy, delete, mensagem externa.
- **Cap antes de rodar**: iterações, agentes e tokens com teto explícito.
- **Learning law**: solve não-trivial fecha com nota de aprendizado gravada, senão repete.

## Origem

Construído entre 2026-02 e 2026-08 num projeto de produção real (ERP de engenharia,
.NET + MongoDB + Azure DevOps) e generalizado. Fontes primárias e estudos completos em
`docs/SOURCES.md`: nada aqui é opinião sem lastro.
