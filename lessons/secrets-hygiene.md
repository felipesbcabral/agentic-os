# Higiene de segredos e de hooks

Casos reais: secret vazado num log porque o mascaramento era por PADRÃO de string (regex
de formato) e o valor não casou com o padrão; e o reflexo de pular verificação de commit
(`--no-verify`) "só dessa vez" pra destravar.

**Why:** mascarar por padrão é blocklist: falha aberto no formato que você não previu.
E hook de verificação existe exatamente pros momentos de pressa; pulá-lo na pressa é
remover o freio na descida.

**How to apply:** (1) mascaramento por NOME de chave (ClientSecret, ApiKey, Token,
Password...): qualquer valor dessas chaves é mascarado, independente do formato; valor
vazado = rotacionar, não só apagar o log; (2) `--no-verify`/pulo de hook NUNCA por
iniciativa própria, só com pedido explícito do humano; hook falhou = investigue a causa;
(3) credencial nunca entra em prompt/contexto de IA de forma identificável; (4) delete/
overwrite de dado que você não criou exige análise de domínio antes. E restauração
manual NUNCA é seguida de re-sync automático.
