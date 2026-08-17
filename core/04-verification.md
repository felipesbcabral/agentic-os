# 04 — Verification: a disciplina que sustenta todo o resto

## Os 4 pilares

1. **Gate objetivo**: verificacao que pode REPROVAR sozinha (teste, build, lint, assertion).
   Sem gate que reprova, nao ha loop nem confianca — pare e construa um.
2. **Prova colada, nunca prometida**: "passou" sem o output literal no chat NAO aconteceu.
   O juiz (humano ou proximo agente) so le o que foi colado.
3. **Maker != checker**: quem escreveu nao se auto-aprova. Checker e um contexto SEPARADO
   (subagente read-only, passe adversarial em turno proprio, ou outro modelo).
4. **Invariante em prosa nao segura o modelo**: regra critica escrita como texto vira
   "contexto", nao restricao. Converta em assertion mecanica — grep no artefato, teste com
   trait, hook que nega a acao. Checklist auto-avaliado e o mesmo false-green de sempre.

## False green (o pior modo de falha: certificar trabalho quebrado)

- **Arvore errada**: cwd num worktree/copia, build stale, binario de outro output — o gate
  passa verde testando codigo que nao e o seu. Fix: caminho ABSOLUTO nos comandos de gate,
  fixados no state file e reusados toda volta.
- **RED que passa de primeira**: teste novo que deveria falhar e passa = suspeite do
  AMBIENTE (arvore/build/binario) antes do teste.
- **Escopo largo demais**: gate no monorepo inteiro e lento e mascara; prefira o alvo mais
  estreito que ainda reprova trabalho ruim.
- **Verificacao "por cheiro"**: um segundo agente "dando uma olhada" sem gate objetivo nao
  e verificacao, e opiniao.

## Padroes de verify (escolha pelo risco)

- **1 voto** (default): checker unico read-only no diff/artefato.
- **Adversarial N votos** (alto risco): N ceticos independentes prompted a REFUTAR;
  maioria refuta = mata o achado. 3 votos e o default de alto risco.
- **Perspective-diverse**: cada verificador com lente DISTINTA (correto? seguro? reproduz?
  performa?) — diversidade pega o que N checks identicos nunca pegam.
- **Grounded**: verificador cita `arquivo:linha`/fonte e consulta o grafo de codigo antes
  de confirmar. Sem citacao = achado nao entra no merge.

## Classificacao de achados do checker

Para cada ALERTA: foi INTRODUZIDO pela mudanca atual (blame/diff prova) → conserte e
re-gate. PRE-EXISTENTE → flague e escale, NUNCA conserte junto (drive-by fix mistura
escopo e esconde risco).

## Zonas proibidas universais (hard-stop: precisa de humano)

- Credenciais/secrets/chaves/tokens.
- Auth/login/payments/billing.
- Migrations/schema/dados de producao.
- Infra/deploy/CI/IaC.
- Conteudo publico (post, release, doc publicada, mensagem externa).
- Arquitetura/decisao de design/qualquer "done" que e julgamento.
- Acao irreversivel: commit, push, merge, deploy, delete, overwrite.
- **Invariantes do projeto** (declaradas no `AGENTS.md`/`CLAUDE.md`) — o bootstrap as
  mapeia; trate como zona proibida igual.

## Fechamento honesto

Ao parar, mostre sempre: (1) diff/artefato, (2) comando de gate exato + resultado colado,
(3) achados do checker e destino de cada um, (4) LACUNAS — o que spec/docs nao cobriram e
voce decidiu sozinho, em lista explicita. Decisao invisivel do executor e false-green de
julgamento.
