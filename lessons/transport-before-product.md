# Transporte e suspeito ANTES do produto

Casos reais: pipe que corrompe UTF-8 fabricando "Invalid control character" que PARECIA
bug do produto; grep com locale falhando em padrao nao-ASCII; ferramenta proxy retornando
vazio silencioso pra padrao com aspas; escapes `\uXXXX` corrompidos por transporte de
edicao virando no-op silencioso; numeros de linha divergindo entre ferramentas.

**Why:** entre voce e o dado ha camadas (shell, encoding, proxy, pager, editor) — cada
uma pode alterar ou engolir o conteudo. O produto leva a culpa porque e onde se olha.

**How to apply:** resultado estranho envolvendo acento/emoji/caractere especial ou
truncamento: valide o TRANSPORTE primeiro (baixe pra arquivo e leia o arquivo; use a
linguagem de script em vez do pipe; compare com ferramenta canonica). Pra escrever
conteudo com escapes/controle: gere via script (heredoc quotado / chr()) e feche com
scan de bytes no arquivo tocado. `old_string` de edicao vem de LEITURA do arquivo, nunca
de resultado de busca (whitespace diverge).
