# 08. Memória e aprendizado: o sistema que melhora entre sessões

O agente esquece; o arquivo não. Sem memória estruturada, cada sessão re-paga os mesmos
erros. Com ela, o método de uma volta vira ativo da próxima.

## As 3 camadas (da mais quente pra mais fria)

1. **Auto-memory por projeto**: `MEMORY.md` = ÍNDICE (1 linha por memória, com gancho);
   corpo em arquivos `.md` individuais com frontmatter (`name`, `description`, `type`).
   Tipos: `user` (quem é o humano), `feedback` (correção de processo, com **Why** e
   **How to apply**), `project` (estado de trabalho em andamento, datas ABSOLUTAS),
   `reference` (ponteiros externos). Resolvidos vão pra um arquivo de archive.
2. **Vault/base de conhecimento do projeto** (se existir): notas interligadas por tema
   (bugs investigados com o traço de raciocínio, decisões, arquitetura, sessões).
   Worked examples de investigação valem ouro: a próxima investigação HERDA o método.
3. **Rascunho local** (gitignored): dossiês, planos de fase, intel. Morre com a máquina.

Regra de escrita: identidade/preferência → auto-memory; conhecimento do domínio →
vault/base do projeto; estado de execução → state files.

## Learning law (a regra que faz o sistema melhorar sozinho)

**Problema não-trivial resolvido → nota de aprendizado ANTES de seguir.** Formato
extract-approach, 4 seções, < 1 página, escrita pra um modelo MAIS FRACO ler frio e
seguir o mesmo caminho:

1. **Problema**: o sintoma e o contexto mínimo.
2. **Abordagem**: o caminho que funcionou, em passos.
3. **Judgment calls**: as decisões não-óbvias e por quê.
4. **Regra reusável**: 1-3 linhas de "gatilho → ação".

Exceções: fix trivial/rename, modo rápido explícito.

## Self-review (auto-retro por sessão de trabalho)

Junto do fechamento: 1-3 erros do MEU processo nesta sessão (hipótese falsa, iteração
desperdiçada, regra violada), cada um com correção GRAVADA: memória de feedback ou
proposta de regra. **Erro corrigido sem gravação = vai repetir.** A pasta `../lessons/`
deste repo é o resultado disso ao longo de meses: erros já pagos, prontos pra semear
qualquer projeto novo.

## Anti-cargo-cult (o que NÃO gravar)

Não salve o que o repo já registra (estrutura de código, histórico git, regra versionada).
Não salve o que só importa pra conversa atual. Memória recall é observação datada, não
estado vivo: se cita arquivo/flag, verifique que ainda existe antes de recomendar.
Duplicata: atualize o arquivo existente em vez de criar outro; memória errada se deleta.

Checklist negativa (do ai-memory/Akita: cada item endurece em erro futuro se gravado):
- Falha transitória já resolvida → grave o PADRÃO de diagnóstico, nunca a falha.
- Claim negativo amplo ("ferramenta X quebrada") → vira recusa permanente; grave a
  condição exata que falhou.
- Narrativa one-off sem regra reusável.
- Status de trabalho em andamento → é state file/handoff, não memória.
- Setup transitório (binário faltando, env quebrado) → vira constraint falsa e stale.

## Ciclo de vida (a memória que não apodrece)

Frontmatter opcional que transforma poda em decisão mecânica:
- `pinned: true`: imune a poda (identidade, invariante). Só é questionável sob
  contradição DIRETA citada.
- `expires_at: YYYY-MM-DD`: TTL explícito; vence ATÉ pinned. Use em toda memória de
  estado cujo valor morre com o evento (followup com prazo, "aguardando resposta").
- `superseded_by: <name>`: memória que mudou de verdade não se edita destrutivamente;
  a nova nasce e a velha guarda o rastro.

Tiers: estado de trabalho = episódico (decai, TTL bem-vindo); feedback/procedimento =
procedural (não decai, só supersede); identidade = pinned. Precedência dura: memória
recuperada é evidência histórica; build/teste rodando agora é a palavra final. Página
de memória nunca sobrepõe output operacional.

## Handoff entre harnesses (Claude → Codex → qualquer)

Fim de sessão com trabalho aberto: escreva um handoff single-use (template em
`../bootstrap/templates/handoff.template.md`): resumo, questões abertas, arquivos
tocados, próximos passos. Regras: handoff manual VENCE o automático; aceitar consome
(o próximo não vive de handoff velho); escopo por diretório. É o substituto barato de
memória compartilhada entre IAs: qualquer harness lê markdown.

## Consolidação ("dreaming")

Periodicamente (mensal funciona), um passe read-only revisa a memória inteira: funde
duplicatas, arquiva resolvido, detecta contradição entre notas, PROPÕE poda; humano
aprova. Memória que só cresce vira ruído; memória consolidada vira compressão real de
experiência. Auditoria de uso (quantos artefatos foram de fato invocados nas últimas N
sessões) é o instrumento de poda do resto do sistema.

Disciplina do passe (aprendida do ai-memory/Akita):
- **Lint mecânico primeiro**: frontmatter válido, TTL vencido, órfã sem linha no índice.
  O que é mecânico não gasta julgamento.
- **Toda proposta com evidência citável** (quote da memória + fonte verificada) e cap
  por rodada (ex.: 15 ranqueadas; o resto é fila). Confiança baixa não propõe.
- **Rejection buffer**: proposta rejeitada pelo humano fica registrada (1 linha: data,
  proposta, motivo) e não volta sem evidência NOVA. Sem isso o passe re-propõe a mesma
  coisa toda rodada e queima a paciência do aprovador.
- **História nunca some sem rastro**: fusão/archive/superseded, nunca deleção cega.
