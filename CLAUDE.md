# Triphos Bootstrap Repo Guidance For Claude

This repository exists to give Claude Code and Codex a stable frontend bootstrap baseline.

Use these defaults when modifying the repo:

- generated app guidance must live in template root files, not only plugin docs
- TypeScript constraints should fail unsafe AI edits early
- starter UI is a constrained starter kit, not a full library clone
- theme work must flow through `shared/theme`
- inline `style` is the default styling surface
- verify with `doctor`, `validate-plugin-structure`, and `smoke-init`

