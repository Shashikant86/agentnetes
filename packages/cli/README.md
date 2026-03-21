<div align="center">

<img src="https://shashikant86.github.io/agentnetes/logo.png" alt="Agentnetes" width="80" height="80" />

# agentnetes

**Zero to a Self-Organizing AI Agency. On Demand.**

*Kubernetes for AI On Demand Agents · type a goal, watch a swarm of specialist agents deliver.*

[![npm version](https://img.shields.io/npm/v/agentnetes?style=for-the-badge&logo=npm&color=fb923c)](https://www.npmjs.com/package/agentnetes)
[![npm downloads](https://img.shields.io/npm/dm/agentnetes?style=for-the-badge&color=22c55e)](https://www.npmjs.com/package/agentnetes)
[![License: MIT](https://img.shields.io/badge/License-MIT-white?style=for-the-badge)](https://github.com/Shashikant86/agentnetes/blob/main/LICENSE)

[Live Demo](https://shashikant86.github.io/agentnetes/) · [GitHub](https://github.com/Shashikant86/agentnetes)

</div>

---

## Quick start

```bash
# Get a free Google API key at aistudio.google.com, then:
GOOGLE_API_KEY=your_key npx agentnetes run "add comprehensive test coverage"
```

No install needed. Works on any git repository.

---

## How it works

1. You type a goal inside any git repo
2. A root agent (Tech Lead) explores your codebase and invents a specialist team
3. Specialists run in parallel, each in their own isolated sandbox
4. They explore, write code, run tests, fix failures, and deliver together
5. A final synthesis summarises everything they found and built

Roles are fully emergent · nothing is hardcoded. A provider task spawns a Scout, Engineer, Tester, and Packager. A security audit spawns a completely different team.

---

## Usage

```bash
# Run agents on the current git repo
GOOGLE_API_KEY=your_key npx agentnetes run "your goal here"

# Pre-warm a sandbox snapshot for faster runs (requires Vercel token)
npx agentnetes snapshot create

# List available snapshots
npx agentnetes snapshot list
```

---

## Environment variables

```bash
# Required · get a free key at aistudio.google.com
GOOGLE_API_KEY=

# Sandbox provider (default: docker)
SANDBOX_PROVIDER=docker        # docker | local | vercel | e2b | daytona

# Optional · Vercel AI Gateway instead of direct Gemini
AI_GATEWAY_BASE_URL=
AI_GATEWAY_API_KEY=

# Optional · override default models
PLANNER_MODEL=google/gemini-2.5-pro
WORKER_MODEL=google/gemini-2.5-flash
```

---

## Sandbox providers

| Provider | Requirement | Notes |
|----------|-------------|-------|
| `docker` | Docker installed | Default. One container per agent. |
| `local` | Nothing | Clones repo to temp dir, runs on host. |
| `vercel` | `VERCEL_TOKEN` | Vercel Firecracker microVMs. |
| `e2b` | `E2B_API_KEY` | E2B cloud sandboxes. |

For the Docker provider, pull the base image once:

```bash
docker pull node:20-alpine
```

---

## License

MIT · [github.com/Shashikant86/agentnetes](https://github.com/Shashikant86/agentnetes)
