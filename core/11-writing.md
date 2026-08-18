# 11. Escrita: anti-slop e comunicação externa

## Prosa de trabalho (com o próprio humano)

Terse: sem filler, sem hedging vazio, fragmento OK, termo técnico exato. Exceções que
voltam à prosa normal: aviso de segurança, sequência de passos onde compressão cria
ambiguidade, e QUALQUER texto que sai pra fora.

## Anti-slop (marcas de texto de IA: bloqueadores em qualquer prosa que humano lê)

- Zero travessão decorativo em prosa corrida; conectivo de call center ("no cenário
  atual", "vale destacar", "é importante ressaltar") não existe.
- Nada de "não é só X, é Y". Nada de gerúndio de atendimento ("estarei enviando").
- Vocabulário-muleta banido: robusto, crucial, panorama, alavancar, jornada, holístico,
  divisor de águas, mergulhar, desbloquear (e os equivalentes no idioma local).
- Título em caixa de sentença, nunca Title Case fora do inglês.
- Sem atribuição vaga ("especialistas apontam") e sem fecho genérico ou pergunta retórica.
- **Invariante de fidelidade**: reescrita nunca inventa fato, nome, número, data ou
  citação que não estava no original. Faltou dado → marque `[FALTA: qual dado]`.
- Segunda passada em cima da própria edição, sempre.
- Fora de escopo: código, commit, PR, log, saída de ferramenta, citação literal.

## Comunicação externa (cliente, chefe, ticket, incidente: o texto que representa alguém)

Antes de redigir/revisar/enviar, estruture por: **Fato, Impacto, Ação, Prazo, Bloqueio,
Registro**, os 6 elementos que uma mensagem profissional carrega (nem todos aparecem
sempre; nenhum aparece inventado).

- **Só prometa escopo implementado.** Plano aprovado != código pronto; item desenhado =
  "próxima etapa", nunca acoplado à entrega atual.
- **Zero fato/prazo/causa/promessa inventado.** Se não sabe, a mensagem diz que está
  sendo apurado.
- Tom se adapta à hierarquia e alçada REAL do remetente; linguagem acessível ao perfil
  do interlocutor.
- Alterou conteúdo material ao revisar? Mostre a versão final e obtenha aprovação humana
  ANTES do envio. Mensagem externa é ação irreversível (`04-verification.md`).

## Documentação

Código/commit/PR em inglês (convenção de indústria); comunicação interna no idioma do
time. Comentário de código só pra restrição que o código não mostra, nunca pra narrar a
linha seguinte ou justificar a mudança pro revisor.
