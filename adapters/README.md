# Adapters — o mesmo sistema em cada harness

O nucleo (`../core/`) e markdown puro e funciona em QUALQUER IA. Os adapters adicionam o
tooling que cada harness suporta.

| Capacidade | claude-code | codex | any-llm (Gemini/Grok/Kimi/Qwen/...) |
|---|---|---|---|
| Protocolos por slash command | SIM (`commands/`) | SIM (skills + prompts) | via texto ("execute o protocolo X") |
| Skills carregadas sob demanda | SIM (`skills/`) | SIM (`~/.codex/skills/`) | colar a secao relevante |
| Subagente checker (maker!=checker) | SIM (Agent tool) | passe adversarial em turno separado | 2a conversa/2o modelo como checker |
| Grafos executaveis | SIM (Workflow tool, `workflows/*.js`) | manual (voce orquestra N sessoes) | manual |
| Hooks/automacao de harness | SIM | parcial | NAO |
| State files / memoria em arquivo | SIM | SIM | SIM (qualquer FS) — ou colado na conversa |

Regra: o DESENHO (loop, gate, verify, caps) nunca depende do harness — so a EXECUCAO
muda de automatica pra manual. Perder o tooling degrada conforto, nao o metodo.

- `claude-code/INSTALL.md` — copia skills, commands e workflows pro `~/.claude/`.
- `codex/INSTALL.md` — skills e prompts pro `~/.codex/`.
- `any-llm/PROTOCOL.md` — o sistema inteiro num documento colavel (system prompt ou
  primeira mensagem).
