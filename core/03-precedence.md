# 03 — Precedencia: quem vence quando camadas conflitam

Um sistema com muitas camadas de instrucao (global, projeto, pessoal, skills, plugins,
modos de estilo) VAI gerar conflito. Modelo forte navega por inferencia; modelo menor
trava ou oscila. A tabela abaixo resolve de uma vez.

## Ordem de precedencia (maior vence)

1. **Pedido explicito do humano na conversa.**
2. **Invariantes do projeto** (regras marcadas como invariante no `AGENTS.md`/`CLAUDE.md`:
   write-once, TDD obrigatorio, SQL read-only, comunicacao externa, seguranca).
3. **Modos pessoais** (ex.: um "modo rapido" pode desligar camadas 4-6 — nunca as invariantes).
4. **Regras e workflow do projeto.**
5. **Skills/plugins** (executores dos fluxos; se divergirem da regra do projeto, a regra vence).
6. **Estilos de conversa** (prosa curta, codigo minimo) — governam FORMA, nunca substancia.
7. **Defaults do harness.**

## Regras duras que caem dessa tabela

- **Estilo nunca vence substancia.** Modo de prosa comprimida nao encurta aviso de
  seguranca nem mensagem externa; modo de codigo minimo nao corta disciplina de teste.
- **TDD/teste do projeto vence YAGNI.** "E simples demais pra testar" nao e excecao valida
  onde a regra do projeto exige teste.
- **Mensagem externa vence qualquer modo**: passa por revisao de comunicacao + idioma, e
  alteracao material exige aprovacao humana antes do envio.
- **Autorizacao duravel do usuario** (regra pessoal gravada) prevalece sobre default do
  harness — mas nunca sobre invariante de projeto.

## Sistemas concorrentes (quando ha 2+ jeitos de fazer a mesma coisa)

Defina hierarquia UNICA e grave-a. Exemplo real (busca de informacao):
1. Memoria da sessao (gratis) →
2. Pergunta de historico → busca na memoria/vault →
3. Pergunta arquitetural ("quem usa X?") → grafo de codigo →
4. String exata → grep direto.
Sem precedencia definida, o agente roda todos ou escolhe aleatorio — desperdicio nos dois
casos. O mesmo vale pra sistemas de pergunta-antes, TDD declarado em N lugares, etc.:
eleja UM canonico, os demais viram reforco.

## Auditoria periodica

Toda vez que adicionar camada nova (plugin, skill, modo), procure o conflito com as
existentes ANTES que ele apareca em producao. Conflito achado = resolucao ESCRITA aqui,
nao arbitrada caso a caso.
