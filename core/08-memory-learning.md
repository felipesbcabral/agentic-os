# 08 — Memoria e aprendizado: o sistema que melhora entre sessoes

O agente esquece; o arquivo nao. Sem memoria estruturada, cada sessao re-paga os mesmos
erros. Com ela, o metodo de uma volta vira ativo da proxima.

## As 3 camadas (da mais quente pra mais fria)

1. **Auto-memory por projeto** — `MEMORY.md` = INDICE (1 linha por memoria, com gancho);
   corpo em arquivos `.md` individuais com frontmatter (`name`, `description`, `type`).
   Tipos: `user` (quem e o humano), `feedback` (correcao de processo, com **Why** e
   **How to apply**), `project` (estado de trabalho em andamento, datas ABSOLUTAS),
   `reference` (ponteiros externos). Resolvidos vao pra um arquivo de archive.
2. **Vault/base de conhecimento do projeto** (se existir) — notas interligadas por tema
   (bugs investigados com o traco de raciocinio, decisoes, arquitetura, sessoes).
   Worked examples de investigacao valem ouro: a proxima investigacao HERDA o metodo.
3. **Rascunho local** (gitignored) — dossies, planos de fase, intel. Morre com a maquina.

Regra de escrita: identidade/preferencia → auto-memory; conhecimento do dominio →
vault/base do projeto; estado de execucao → state files.

## Learning law (a regra que faz o sistema melhorar sozinho)

**Problema nao-trivial resolvido → nota de aprendizado ANTES de seguir.** Formato
extract-approach, 4 secoes, < 1 pagina, escrita pra um modelo MAIS FRACO ler frio e
seguir o mesmo caminho:

1. **Problema** — o sintoma e o contexto minimo.
2. **Abordagem** — o caminho que funcionou, em passos.
3. **Judgment calls** — as decisoes nao-obvias e por que.
4. **Regra reusavel** — 1-3 linhas de "gatilho → acao".

Excecoes: fix trivial/rename, modo rapido explicito.

## Self-review (auto-retro por sessao de trabalho)

Junto do fechamento: 1-3 erros do MEU processo nesta sessao (hipotese falsa, iteracao
desperdicada, regra violada), cada um com correcao GRAVADA — memoria de feedback ou
proposta de regra. **Erro corrigido sem gravacao = vai repetir.** A pasta `../lessons/`
deste repo e o resultado disso ao longo de meses: erros ja pagos, prontos pra semear
qualquer projeto novo.

## Anti-cargo-cult (o que NAO gravar)

Nao salve o que o repo ja registra (estrutura de codigo, historico git, regra versionada).
Nao salve o que so importa pra conversa atual. Memoria recall e observacao datada, nao
estado vivo: se cita arquivo/flag, verifique que ainda existe antes de recomendar.
Duplicata: atualize o arquivo existente em vez de criar outro; memoria errada se deleta.

## Consolidacao ("dreaming")

Periodicamente (mensal funciona), um passe read-only revisa a memoria inteira: funde
duplicatas, arquiva resolvido, detecta contradicao entre notas, PROPOE poda — humano
aprova. Memoria que so cresce vira ruido; memoria consolidada vira compressao real de
experiencia. Auditoria de uso (quantos artefatos foram de fato invocados nas ultimas N
sessoes) e o instrumento de poda do resto do sistema.
