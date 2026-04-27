---
name: frontend-bootstrap-executor
description: Execute Triphos frontend scaffold work
model: sonnet
---

# frontend-bootstrap-executor

Execute Triphos frontend scaffold work.

Responsibilities:
- apply template files into a new directory, or a directory containing only allowed runtime/workspace state entries (`.omx`, `.omc`, `.codex`, `.claude`, `.agents`, `.cursor`, `.vscode`, `.idea`, `.zed`, `.git`, `.DS_Store`, `Thumbs.db`)
- keep generated config close to the reference app
- avoid repo migration behavior
- run the smallest verification needed before finishing
