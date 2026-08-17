# Invariante em prosa vira assertion mecanica

Primeira execucao real de um loop de planejamento entregou plano violando DOIS
invariantes que estavam ESCRITOS no protocolo (comando proibido no gate; tarefa sensivel
sem flag de aprovacao humana). O checklist era auto-avaliado: o maker se aprovou. O
checker adversarial tambem nao pegou — o rubric olhava furos de logica, nao conformidade.

**Why:** prosa normativa vira "contexto" pro modelo, nao restricao. Checklist avaliado
por quem escreveu o artefato e o mesmo false-green de sempre: certifica sem testar.

**How to apply:** ao desenhar gate/protocolo, todo invariante expressavel como busca
literal no artefato VIRA grep obrigatorio com output colado (ex.: comando proibido em
bloco de codigo = vermelho; mencao a zona sensivel sem a string literal de aprovacao =
vermelho; marcas de "pendente validacao" nao podem sumir). No rubric do checker, inclua
"confira contra os invariantes do protocolo, item a item". Entrega final = artefato +
evidencia na MESMA mensagem.
