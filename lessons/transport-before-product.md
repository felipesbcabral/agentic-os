# Transporte é suspeito ANTES do produto

Casos reais: pipe que corrompe UTF-8 fabricando "Invalid control character" que PARECIA
bug do produto; grep com locale falhando em padrão não-ASCII; ferramenta proxy retornando
vazio silencioso pra padrão com aspas; escapes `\uXXXX` corrompidos por transporte de
edição virando no-op silencioso; números de linha divergindo entre ferramentas.

**Why:** entre você e o dado há camadas (shell, encoding, proxy, pager, editor) e cada
uma pode alterar ou engolir o conteúdo. O produto leva a culpa porque é onde se olha.

**How to apply:** resultado estranho envolvendo acento/emoji/caractere especial ou
truncamento: valide o TRANSPORTE primeiro (baixe pra arquivo e leia o arquivo; use a
linguagem de script em vez do pipe; compare com ferramenta canônica). Pra escrever
conteúdo com escapes/controle: gere via script (heredoc quotado / chr()) e feche com
scan de bytes no arquivo tocado. `old_string` de edição vem de LEITURA do arquivo, nunca
de resultado de busca (whitespace diverge).
