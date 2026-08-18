# 03. Precedência: quem vence quando camadas conflitam

Um sistema com muitas camadas de instrução (global, projeto, pessoal, skills, plugins,
modos de estilo) VAI gerar conflito. Modelo forte navega por inferência; modelo menor
trava ou oscila. A tabela abaixo resolve de uma vez.

## Ordem de precedência (maior vence)

1. **Pedido explícito do humano na conversa.**
2. **Invariantes do projeto** (regras marcadas como invariante no `AGENTS.md`/`CLAUDE.md`:
   write-once, TDD obrigatório, SQL read-only, comunicação externa, segurança).
3. **Modos pessoais** (ex.: um "modo rápido" pode desligar camadas 4-6, nunca as invariantes).
4. **Regras e workflow do projeto.**
5. **Skills/plugins** (executores dos fluxos; se divergirem da regra do projeto, a regra vence).
6. **Estilos de conversa** (prosa curta, código mínimo): governam FORMA, nunca substância.
7. **Defaults do harness.**

## Regras duras que caem dessa tabela

- **Estilo nunca vence substância.** Modo de prosa comprimida não encurta aviso de
  segurança nem mensagem externa; modo de código mínimo não corta disciplina de teste.
- **TDD/teste do projeto vence YAGNI.** "É simples demais pra testar" não é exceção válida
  onde a regra do projeto exige teste.
- **Mensagem externa vence qualquer modo**: passa por revisão de comunicação + idioma, e
  alteração material exige aprovação humana antes do envio.
- **Autorização durável do usuário** (regra pessoal gravada) prevalece sobre default do
  harness, mas nunca sobre invariante de projeto.

## Sistemas concorrentes (quando há 2+ jeitos de fazer a mesma coisa)

Defina hierarquia ÚNICA e grave-a. Exemplo real (busca de informação):
1. Memória da sessão (grátis) →
2. Pergunta de histórico → busca na memória/vault →
3. Pergunta arquitetural ("quem usa X?") → grafo de código →
4. String exata → grep direto.
Sem precedência definida, o agente roda todos ou escolhe aleatório: desperdício nos dois
casos. O mesmo vale pra sistemas de pergunta-antes, TDD declarado em N lugares, etc.:
eleja UM canônico, os demais viram reforço.

## Auditoria periódica

Toda vez que adicionar camada nova (plugin, skill, modo), procure o conflito com as
existentes ANTES que ele apareça em produção. Conflito achado = resolução ESCRITA aqui,
não arbitrada caso a caso.
