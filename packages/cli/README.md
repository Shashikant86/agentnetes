<div align="center">

<img src="https://shashikant86.github.io/agentnetes/logo.png" alt="Agentnetes" width="80" height="80" />

# agentnetes

**Zero to a Self-Organizing AI Agency. On Demand.**

*Self-Organizing AI Agent Swarms. On Demand. · Kubernetes-inspired orchestration for AI agents.*

[![npm version](https://img.shields.io/npm/v/agentnetes?style=for-the-badge&logo=npm&color=fb923c)](https://www.npmjs.com/package/agentnetes)
[![npm downloads](https://img.shields.io/npm/dm/agentnetes?style=for-the-badge&color=22c55e)](https://www.npmjs.com/package/agentnetes)
[![License: MIT](https://img.shields.io/badge/License-MIT-white?style=for-the-badge)](https://github.com/Shashikant86/agentnetes/blob/main/LICENSE)

[Live Demo](https://shashikant86.github.io/agentnetes/) · [Full Docs](https://shashikant86.github.io/agentnetes/docs) · [GitHub](https://github.com/Shashikant86/agentnetes)

</div>

---

## Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js | 18+ | Required |
| Docker | any recent | Required for default sandbox |
| Google API key | free tier | Get at [aistudio.google.com](https://aistudio.google.com) |
| Git | any | Repo must have a remote `origin` |

---

## Quick start

```bash
# 1. Pull the Docker base image (one-time)
docker pull node:20-alpine

# 2. Run on any git repo
cd your-project
GOOGLE_API_KEY=your_key npx agentnetes run "add comprehensive test coverage"
```

No global install needed. Works on any git repository.

---

## How it works

1. You type a goal inside any git repo
2. A root agent (Tech Lead) explores your codebase and invents a specialist team
3. Specialists run in parallel · each in their own isolated Docker container with the repo cloned inside
4. They use two tools: `search()` (grep) and `execute()` (bash) · no file contents stuffed into prompts
5. Agents write code, run tests, fix failures, and deliver together
6. A final synthesis summarises everything found and built

Roles are fully emergent · nothing is hardcoded. A feature task spawns a Scout, Engineer, and Tester. A security audit spawns a completely different team.

---

## Usage

```bash
# Run agents on the current git repo
GOOGLE_API_KEY=your_key npx agentnetes run "your goal here"

# Install globally to skip npx
npm install -g agentnetes
GOOGLE_API_KEY=your_key agentnetes run "your goal here"

# Pre-warm a sandbox snapshot for faster runs (requires Vercel token)
VERCEL_TOKEN=your_token agentnetes snapshot create

# List available snapshots
VERCEL_TOKEN=your_token agentnetes snapshot list

# Start the web UI on localhost:3000
npx agentnetes serve
npx agentnetes serve --port 8080
```

---

## Environment variables

```bash
# Required · get a free key at aistudio.google.com
GOOGLE_API_KEY=

# Sandbox provider (default: docker)
SANDBOX_PROVIDER=docker        # docker | local | vercel | e2b | daytona

# Optional · override default models
PLANNER_MODEL=google/gemini-2.5-pro
WORKER_MODEL=google/gemini-2.5-flash

# Optional · Vercel sandbox only
VERCEL_TOKEN=
```

---

## Sandbox providers

| Provider | Requirement | Speed | Notes |
|----------|-------------|-------|-------|
| `docker` | Docker running | Fast | Default. One `node:20-alpine` container per agent. |
| `local` | Nothing | Fastest | Runs on host machine. No isolation. |
| `vercel` | `VERCEL_TOKEN` | Fastest | Firecracker microVMs with snapshot support. |
| `e2b` | `E2B_API_KEY` | Fast | E2B cloud sandboxes. |
| `daytona` | `DAYTONA_API_KEY` | Fast | Daytona workspaces. |

### Docker setup

Pull the base image once to avoid download delay on first run:

```bash
docker pull node:20-alpine
```

Each agent gets its own container with `bash` and `git` installed, and the target repo cloned to `/workspace`. Containers are removed automatically when agents finish.

To watch containers spin up in real time:

```bash
# In a separate terminal
watch -n 1 docker ps
```

### Local sandbox (no Docker)

If you don't have Docker, use the local provider · agents run directly on your machine in a temp directory:

```bash
SANDBOX_PROVIDER=local GOOGLE_API_KEY=your_key agentnetes run "your goal"
```

---

## Tips

- Use **Gemini 2.5 Flash** as the worker model for faster runs · Flash completes tasks in seconds vs minutes for Pro
- Be specific in your goals: `"add vitest tests for all functions in src/utils/"` works better than `"add tests"`
- For large repos, agents focus on the most relevant files via `search()` · you don't need to pre-filter

---

## License

MIT · [github.com/Shashikant86/agentnetes](https://github.com/Shashikant86/agentnetes)
