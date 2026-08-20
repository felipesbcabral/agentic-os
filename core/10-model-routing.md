# 10. Model routing: qual modelo pra qual trabalho

Default: **um modelo forte num fluxo simples.** Roteamento por papel (advisor, executor,
scout) é HIPÓTESE a medir no SEU domínio, não regra universal: os números públicos vêm de
domínios distintos e não se transferem sozinhos.

Referências (benchmarks públicos da Anthropic, 2026), cada uma válida SÓ no seu domínio:
advisor pattern = 92% do score a 63% do preço (SWE-bench Pro); orchestrator pattern = 96%
a 46% (BrowseComp, busca paralelizável). A mesma fonte mede multi-agente a ~15x os tokens
de um chat e avisa: a maioria das tarefas de CÓDIGO divide pouco. Antes de adotar um papel
como default, registre a série local (modelo, harness, % cache, qualidade, custo, aceite)
e compare com o modelo forte sozinho. Sem série, fique no default.

## Os 3 papéis (independentes de fornecedor)

| Papel | Que modelo usar | Uso |
|---|---|---|
| **Orquestrador/Advisor** | O melhor que você tem acesso contínuo | Sessão principal, planejar, arquitetura, root cause difícil, review de segurança, criar ativo permanente |
| **Executor** | Tier médio, bom custo/qualidade | Implementação planejada, refactor guiado, testes, destilação de docs |
| **Scout** | O mais barato | Varreduras paralelas, grep semântico, classificação, inventário |

## Regras de roteamento (decide em 5 segundos)

1. **Tarefa mecânica com documento bom** → executor. Documento ruim? Melhore o documento,
   não suba o modelo.
2. **Fan-out de leitura/busca** (N arquivos, N fontes) → scouts em paralelo; síntese no
   orquestrador.
3. **Decisão de arquitetura / root cause cabeludo / segurança** → o melhor modelo.
4. **Melhor modelo patinou 2x na mesma área** → pare (regra dos 2 fixes); o problema
   costuma ser informação faltando, não capacidade.
5. **Criar ativo permanente** (skill, protocolo, plano de migração) → o melhor modelo:
   o custo amortiza a cada reuso.
6. **Sessão executando plano pronto** → rode no executor e consulte o advisor no máximo
   ~1x por tarefa. Advisor consultado a cada passo = o documento está ruim.

## Esforço/reasoning (a outra metade)

Lookup simples → esforço baixo. Tarefa média → médio/alto. Só o trabalho mais difícil
(verify crítico, decomposição) merece o teto: esforço máximo é mais caro, mais lento e
pode PIORAR por overthinking. Workers/scouts: esforço baixo explícito.

## Gotchas

- Roteamento não é regra dura: worker barato devolvendo lixo 2x na mesma peça = suba UM
  degrau, não dois.
- Custo por mudança ACEITA é a métrica: barato com 40% de aceite sai mais caro que
  decente com 90%.
- Ao trocar de fornecedor/geração: re-benchmarque tokenizer e qualidade em uso REAL antes
  de migrar o papel de executor (já aconteceu de modelo mais novo custar +30% em tokens
  pro mesmo texto e render menos).
