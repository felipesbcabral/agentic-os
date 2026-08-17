# 10 — Model routing: qual modelo pra qual trabalho

Principio validado em benchmark publico e em uso real: **o pensamento mora no
PLANO/orquestrador, nao no worker**. Modelo capaz no topo + workers baratos entrega
~92-96% do resultado por ~46-63% do custo.

Os numeros de referencia (benchmarks publicos da Anthropic, 2026): advisor pattern
(executor barato consulta o caro ~1x/tarefa) = 92% do score a 63% do preco; orchestrator
pattern (caro planeja, baratos executam) = 96% da performance a 46% do preco. Os modelos
especificos mudam a cada 6 meses; o PADRAO nao.

## Os 3 papeis (independentes de fornecedor)

| Papel | Que modelo usar | Uso |
|---|---|---|
| **Orquestrador/Advisor** | O melhor que voce tem acesso continuo | Sessao principal, planejar, arquitetura, root cause dificil, review de seguranca, criar ativo permanente |
| **Executor** | Tier medio, bom custo/qualidade | Implementacao planejada, refactor guiado, testes, destilacao de docs |
| **Scout** | O mais barato | Varreduras paralelas, grep semantico, classificacao, inventario |

## Regras de roteamento (decide em 5 segundos)

1. **Tarefa mecanica com documento bom** → executor. Documento ruim? Melhore o documento,
   nao suba o modelo.
2. **Fan-out de leitura/busca** (N arquivos, N fontes) → scouts em paralelo; sintese no
   orquestrador.
3. **Decisao de arquitetura / root cause cabeludo / seguranca** → o melhor modelo.
4. **Melhor modelo patinou 2x na mesma area** → pare (regra dos 2 fixes); o problema
   costuma ser informacao faltando, nao capacidade.
5. **Criar ativo permanente** (skill, protocolo, plano de migracao) → o melhor modelo —
   o custo amortiza a cada reuso.
6. **Sessao executando plano pronto** → rode no executor e consulte o advisor no maximo
   ~1x por tarefa. Advisor consultado a cada passo = o documento esta ruim.

## Esforco/reasoning (a outra metade)

Lookup simples → esforco baixo. Tarefa media → medio/alto. So o trabalho mais dificil
(verify critico, decomposicao) merece o teto — esforco maximo e mais caro, mais lento e
pode PIORAR por overthinking. Workers/scouts: esforco baixo explicito.

## Gotchas

- Roteamento nao e regra dura: worker barato devolvendo lixo 2x na mesma peca = suba UM
  degrau, nao dois.
- Custo por mudanca ACEITA e a metrica — barato com 40% de aceite sai mais caro que
  decente com 90%.
- Ao trocar de fornecedor/geracao: re-benchmarque tokenizer e qualidade em uso REAL antes
  de migrar o papel de executor (ja aconteceu de modelo mais novo custar +30% em tokens
  pro mesmo texto e render menos).
