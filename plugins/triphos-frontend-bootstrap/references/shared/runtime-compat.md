# Runtime Compatibility

As of 2026-04-22, this repository assumes the following official runtime behavior:

- Codex hooks require `[features] codex_hooks = true` in `.codex/config.toml`.
- Codex discovers hooks from `~/.codex/hooks.json` and `<repo>/.codex/hooks.json`.
- Claude project settings use `.claude/settings.json`.
- Claude local overrides use `.claude/settings.local.json` and take precedence over shared project settings.
- Stop hooks receive `stop_hook_active` and should guard against infinite retry loops.
- Policy files existing in the repository and runtime activation being effective are different concerns and must both be validated.

Official references:

- https://developers.openai.com/codex/hooks
- https://developers.openai.com/codex/config-reference
- https://developers.openai.com/codex/config-advanced
- https://code.claude.com/docs/en/hooks
- https://code.claude.com/docs/en/hooks-guide
- https://code.claude.com/docs/en/settings
