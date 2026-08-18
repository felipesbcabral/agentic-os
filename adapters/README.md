# Adapters. O mesmo sistema em cada harness

O núcleo (`../core/`) é markdown puro e funciona em QUALQUER IA. Os adapters adicionam o
tooling que cada harness suporta.

| Capacidade | claude-code | codex | any-llm (Gemini/Grok/Kimi/Qwen/...) |
|---|---|---|---|
| Protocolos por slash command | SIM (`commands/`) | SIM (skills + prompts) | via texto ("execute o protocolo X") |
| Skills carregadas sob demanda | SIM (`skills/`) | SIM (`~/.codex/skills/`) | colar a seção relevante |
| Subagente checker (maker!=checker) | SIM (Agent tool) | passe adversarial em turno separado | 2a conversa/2o modelo como checker |
| Grafos executáveis | SIM (Workflow tool, `workflows/*.js`) | manual (você orquestra N sessões) | manual |
| Hooks/automação de harness | SIM | parcial | NÃO |
| State files / memória em arquivo | SIM | SIM | SIM (qualquer FS), ou colado na conversa |

Regra: o DESENHO (loop, gate, verify, caps) nunca depende do harness; só a EXECUÇÃO
muda de automática pra manual. Perder o tooling degrada conforto, não o método.

- `claude-code/INSTALL.md`: copia skills, commands e workflows pro `~/.claude/`.
- `codex/INSTALL.md`: skills e prompts pro `~/.codex/`.
- `any-llm/PROTOCOL.md`: o sistema inteiro num documento colável (system prompt ou
  primeira mensagem).
