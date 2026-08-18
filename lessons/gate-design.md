# Invariante em prosa vira assertion mecânica

Primeira execução real de um loop de planejamento entregou plano violando DOIS
invariantes que estavam ESCRITOS no protocolo (comando proibido no gate; tarefa sensível
sem flag de aprovação humana). O checklist era auto-avaliado: o maker se aprovou. O
checker adversarial também não pegou: o rubric olhava furos de lógica, não conformidade.

**Why:** prosa normativa vira "contexto" pro modelo, não restrição. Checklist avaliado
por quem escreveu o artefato é o mesmo false-green de sempre: certifica sem testar.

**How to apply:** ao desenhar gate/protocolo, todo invariante expressável como busca
literal no artefato VIRA grep obrigatório com output colado (ex.: comando proibido em
bloco de código = vermelho; menção a zona sensível sem a string literal de aprovação =
vermelho; marcas de "pendente validação" não podem sumir). No rubric do checker, inclua
"confira contra os invariantes do protocolo, item a item". Entrega final = artefato +
evidência na MESMA mensagem.
