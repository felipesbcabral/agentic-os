# 04. Verification: a disciplina que sustenta todo o resto

## Os 4 pilares

1. **Gate objetivo**: verificação que pode REPROVAR sozinha (teste, build, lint, assertion).
   Sem gate que reprova, não há loop nem confiança: pare e construa um.
2. **Prova colada, nunca prometida**: "passou" sem o output literal no chat NÃO aconteceu.
   O juiz (humano ou próximo agente) só lê o que foi colado.
3. **Maker != checker**: quem escreveu não se auto-aprova. O checker NASCE SEM o histórico
   do maker: recebe só a cápsula (Goal, diff CONGELADO + hash, comandos e outputs do gate,
   regras aplicáveis). Fork do contexto do maker é separado por identidade, não por
   contexto, e NÃO conta como independente. Registre no state: id/modelo do checker,
   política de contexto (novo | fork | indisponível), hash do diff. Runtime sem contexto
   novo → o veredito carrega `CHECKER_INDEPENDENTE_INDISPONIVEL` e o diff vai pra revisão
   humana ou segunda conversa; self-review nunca aprova.
4. **Invariante em prosa não segura o modelo**: regra crítica escrita como texto vira
   "contexto", não restrição. Converta em assertion mecânica: grep no artefato, teste com
   trait, hook que nega a ação. Checklist auto-avaliado é o mesmo false-green de sempre.

## False green (o pior modo de falha: certificar trabalho quebrado)

- **Árvore errada**: cwd num worktree/cópia, build stale, binário de outro output. O gate
  passa verde testando código que não é o seu. Fix: caminho ABSOLUTO nos comandos de gate,
  fixados no state file e reusados toda volta.
- **RED que passa de primeira**: teste novo que deveria falhar e passa = suspeite do
  AMBIENTE (árvore/build/binário) antes do teste.
- **Escopo largo demais**: gate no monorepo inteiro é lento e mascara; prefira o alvo mais
  estreito que ainda reprova trabalho ruim.
- **Verificação "por cheiro"**: um segundo agente "dando uma olhada" sem gate objetivo é
  opinião, não verificação.

## Padrões de verify (escolha pelo risco)

- **1 voto** (default): checker único read-only no diff/artefato.
- **Adversarial N votos** (alto risco): N céticos independentes prompted a REFUTAR;
  maioria refuta = mata o achado. 3 votos é o default de alto risco.
- **Perspective-diverse**: cada verificador com lente DISTINTA (correto? seguro? reproduz?
  performa?): diversidade pega o que N checks idênticos nunca pegam.
- **Grounded**: verificador cita `arquivo:linha`/fonte e consulta o grafo de código antes
  de confirmar. Sem citação = achado não entra no merge.

## Classificação de achados do checker

Para cada ALERTA: foi INTRODUZIDO pela mudança atual (blame/diff prova) → conserte e
re-gate. PRÉ-EXISTENTE → flague e escale, NUNCA conserte junto (drive-by fix mistura
escopo e esconde risco).

E registre a ATRIBUIÇÃO de cada achado, senão o recibo vira contagem de marketing:
`checker_unique` (o gate atual não pegaria) · `gate_redundant` (a suíte pegaria na próxima
volta) · `human_seed_checker_confirmed` (hipótese semeada no prompt; o checker confirmou e
gerou teste novo) · `unknown`. Dedupe por CAUSA RAIZ, nunca por número de testes ou rodadas.

## Zonas proibidas universais (hard-stop: precisa de humano)

- Credenciais/secrets/chaves/tokens.
- Auth/login/payments/billing.
- Migrations/schema/dados de produção.
- Infra/deploy/CI/IaC.
- Conteúdo público (post, release, doc publicada, mensagem externa).
- Arquitetura/decisão de design/qualquer "done" que é julgamento.
- Ação irreversível: commit, push, merge, deploy, delete, overwrite.
- **Invariantes do projeto** (declaradas no `AGENTS.md`/`CLAUDE.md`): o bootstrap as
  mapeia; trate como zona proibida igual.

## Fechamento honesto

Ao parar, mostre sempre: (1) diff/artefato, (2) comando de gate exato + resultado colado,
(3) achados do checker e destino de cada um, (4) LACUNAS (o que spec/docs não cobriram e
você decidiu sozinho), em lista explícita. Decisão invisível do executor é false-green de
julgamento.
