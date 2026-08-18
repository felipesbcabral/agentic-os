---
name: self-review
description: "Auto-retrospectiva: erros do MEU processo na sessão, cada um com correção gravada. Roda com extract-approach na learning law."
---

# self-review

Ao fechar tarefa não-trivial, releia a própria sessão e responda 4 perguntas. Premissa dura: erro sem correção gravada VAI se repetir. A memória da sessão morre; só o que vai pra memória persistente/gotcha sobrevive.

## As 4 perguntas
1. **Onde errei?** Hipóteses falsas, afirmação sem verificar, fix errado, alarme falso. E QUE EVIDÊNCIA eu ignorei que teria encurtado o caminho.
2. **O que me atrasou?** Ferramenta errada pro job, exploração cara onde havia grafo/nota/memória, gate que mentiu, retrabalho por não ler o método inteiro.
3. **Qual regra JÁ EXISTENTE eu violei?** JUDGMENT / REGRAS do projeto / skill: cite a regra. Se a regra existia e eu violei, o problema é DISPARO (a regra não chegou na hora certa), não falta de conhecimento. Considerar promover a gatilho mais duro (hook, checklist, zona proibida).
4. **Que mudança PERSISTENTE previne a repetição?** Escolha o destino certo:
   - Padrão de comportamento meu, específico do PROJETO → memória `feedback_*` no auto-memory (com **Why** e **How to apply**) + linha no MEMORY.md. Carrega em toda sessão DESTE projeto.
   - Padrão de comportamento meu, válido em QUALQUER projeto → 1 linha (gatilho → ação) na seção "Lições operacionais" do `~/.claude/JUDGMENT.md`. Carrega em toda sessão de TODO projeto. CAP de 10 linhas: cheio → comprimir/fundir antes de adicionar; nunca estourar (JUDGMENT é pago em toda sessão).
   - Pegadinha de projeto/ferramenta → seção Gotchas da skill/dossiê correspondente (arquivo de gotchas do projeto ou nota do vault).
   - Heurística de decisão profunda (mudaria uma seção inteira) → PROPOR ao usuário, não auto-inflar.

## Formato do achado (cada um, 3 linhas)
- **Erro:** o que fiz de errado, com o momento concreto da sessão.
- **Custo:** o que atrasou/quebrou (iterações, retrabalho, alarme falso).
- **Correção gravada em:** caminho do arquivo + o gatilho→ação ("ANTES de X, faça Y").

## Regras
- Máx 3 achados por sessão: sinal, não confissão. Sem auto-flagelo genérico ("fui lento", "podia ter sido melhor"): só padrão ACIONÁVEL com exemplo concreto.
- Erro que já tem memória/gotcha → NÃO duplicar: atualize a existente e marque REINCIDÊNCIA. Reincidência = disparo quebrado → escale (regra-texto virou candidata a hook).
- 0 erros dignos de gravação = diga isso e siga. Inventar achado polui o índice.
- NÃO dispara: tarefa trivial, MODO RAPIDO.

## Gotchas
- O desperdício maior está em errar, corrigir DENTRO da sessão e não gravar: a próxima sessão paga o mesmo pedágio.
- Correção escrita como aviso vago ("cuidado com X") não muda comportamento. Escreva gatilho + ação: "ANTES de afirmar que arquivo não existe via Glob, confirme com ls/Test-Path".
- Não confundir com extract-approach: um solve pode gerar OS DOIS (nota do método + correção do processo). Destinos diferentes, sem fusão.
