# Higiene de segredos e de hooks

Casos reais: secret vazado num log porque o mascaramento era por PADRAO de string (regex
de formato) e o valor nao casou com o padrao; e o reflexo de pular verificacao de commit
(`--no-verify`) "so dessa vez" pra destravar.

**Why:** mascarar por padrao e blocklist — falha aberto no formato que voce nao previu.
E hook de verificacao existe exatamente pros momentos de pressa; pula-lo na pressa e
remover o freio na descida.

**How to apply:** (1) mascaramento por NOME de chave (ClientSecret, ApiKey, Token,
Password...) — qualquer valor dessas chaves e mascarado, independente do formato; valor
vazado = rotacionar, nao so apagar o log; (2) `--no-verify`/pulo de hook NUNCA por
iniciativa propria — so com pedido explicito do humano; hook falhou = investigue a causa;
(3) credencial nunca entra em prompt/contexto de IA de forma identificavel; (4) delete/
overwrite de dado que voce nao criou exige analise de dominio antes — e restauracao
manual NUNCA e seguida de re-sync automatico.
