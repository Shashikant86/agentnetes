# Agentnetes

**Zero to a Self-Organizing AI Agency. On Demand.**

Type a goal. Agentnetes assembles a team of specialist AI agents, each running in an isolated sandbox, that explore your codebase, write code, run tests, fix failures, and deliver together. No hardcoded roles. No sequential bottlenecks. No files stuffed into prompts.

---

## What is it

Agentnetes is a self-organizing, recursive agent system. Think Kubernetes for AI agents.

You give it a single natural-language goal and a codebase. The system:

1. Spawns a root orchestrator (the Tech Lead) that explores the repo and invents a specialist team
2. Specialist agents run concurrently, each in their own isolated sandbox
3. Agents collaborate at runtime when findings from one affect another
4. All artifacts are collected, verified, and streamed back to you

Roles are fully emergent. Nothing is hardcoded. A provider implementation task gets a Scout, Engineer, Tester, and Packager. A security audit gets a completely different team.

---

## The Four Foundations

### 1. RLM Pattern ([MIT CSAIL](https://arxiv.org/abs/2512.24601))

Context lives in sandboxes, not prompts. Agents do not receive hundreds of files in their context window. Instead they write small shell commands to explore the codebase:

```bash
grep -r "LanguageModelV1" packages/ --include="*.ts" -l
find packages -name "package.json" -maxdepth 2
cat packages/provider-utils/src/types.ts
```

This keeps token footprints tiny regardless of codebase size.

### 2. AutoResearch Loop ([Karpathy](https://github.com/karpathy/autoresearch))

Agents do not write code and hope. They write code, run tests, measure results, and loop:

```
write code -> run vitest -> check failures -> patch -> repeat
```

### 3. Two-Tool MCP Strategy

Each agent has exactly two tools:

- `search(pattern)` — grep the codebase for patterns
- `execute(command)` — run any shell command in the sandbox

~1,000 token footprint regardless of task complexity.

### 4. A2A Protocol

Every agent Agentnetes spawns generates a standard A2A Agent Card:

```json
{
  "name": "Provider Engineer",
  "description": "Implements LanguageModelV1 interface for a new AI SDK provider",
  "capabilities": { "streaming": true },
  "skills": [{ "id": "implement-provider", "tags": ["typescript", "ai-sdk"] }]
}
```

---

## Architecture

```
You type a goal
       |
       v
  [Root Agent / Tech Lead]          Gemini 2.5 Pro
  Explores repo with grep/find
  Invents team
       |
  _____|_______________________________________________
  |           |                |                     |
  v           v                v                     v
[Scout]   [Engineer]       [Tester]           [Packager]
own sandbox  own sandbox   own sandbox        own sandbox
search()     execute()     execute()          execute()
```

---

## Tech Stack

| Layer | Package | Version |
|-------|---------|---------|
| AI Runtime | `ai` (Vercel AI SDK) | `7.0.0-beta.33` |
| Agent primitive | `ToolLoopAgent` | AI SDK v7 beta |
| AI Gateway | `@ai-sdk/gateway` | `4.0.0-beta.18` |
| Sandbox (cloud) | `@vercel/sandbox` | `1.9.0` |
| Sandbox (local) | Docker (`node:20-alpine`) | — |
| Framework | Next.js App Router | latest |
| Planner model | Gemini 2.5 Pro | direct or via gateway |
| Worker model | Gemini 2.5 Flash | direct or via gateway |
| Streaming | Server-Sent Events | native ReadableStream |

---

## Sandbox Providers

Agentnetes supports multiple sandbox providers. Set `SANDBOX_PROVIDER` in your environment:

| Provider | Env var | Notes |
|----------|---------|-------|
| `docker` | — | Local Docker containers. Default for local dev. |
| `vercel` | `VERCEL_TOKEN` | Vercel Firecracker microVMs. Auto-detected on Vercel. |
| `e2b` | `E2B_API_KEY` | E2B sandboxes. Install `e2b` package. |
| `daytona` | `DAYTONA_API_KEY` | Daytona workspaces. Install `@daytonaio/sdk`. |
| `local` | — | Runs directly on host machine in a temp dir. |

Auto-detection order: Vercel -> E2B -> Daytona -> Docker -> Local.

---

## Running locally

### Simulation mode (no API keys needed)

```bash
npm install
npm run dev
```

Set `SIMULATION_MODE=true` in `.env.local`. Visit `http://localhost:3000`.

### Real execution with Docker + Gemini

```bash
# 1. Pre-pull the Docker image
docker pull node:20-alpine

# 2. Get a free Google API key from aistudio.google.com

# 3. Create .env.local
SANDBOX_PROVIDER=docker
SIMULATION_MODE=false
GOOGLE_API_KEY=your_key_here
DEMO_REPO_URL=https://github.com/vercel/ai

# 4. Run
npm run dev
```

Each agent gets its own Docker container with the repo cloned inside. Containers are destroyed when the agent completes.

---

## Project structure

```
agentnetes/
  app/
    page.tsx              Landing page
    demo/page.tsx         Agent demo UI
    api/chat/route.ts     SSE streaming endpoint
  components/
    AgentPanel.tsx        Agent activity panel
    ChatPanel.tsx         Chat input
    ThemeProvider.tsx     Light/dark mode
  lib/
    gateway.ts            AI Gateway or direct Gemini
    vrlm/
      types.ts            AgentTask, VrlmEvent, Artifact types
      events.ts           VrlmEventEmitter
      runtime.ts          Real execution engine
      simulated-runtime.ts  Simulation fallback
      sandbox-manager.ts  Multi-provider sandbox lifecycle
      docker-sandbox.ts   Docker sandbox implementation
      local-sandbox.ts    Local shell sandbox implementation
      tools.ts            search() + execute() MCP tools
      prompts.ts          Planner + worker system prompts
    a2a.ts                A2A Agent Card generation
```

---

## Environment variables

```bash
# Sandbox
SANDBOX_PROVIDER=docker        # docker | vercel | e2b | daytona | local

# LLM (one of these)
GOOGLE_API_KEY=                # Direct Gemini (aistudio.google.com)
AI_GATEWAY_BASE_URL=           # Vercel AI Gateway endpoint
AI_GATEWAY_API_KEY=            # Gateway API key

# Vercel sandbox (auto on Vercel via OIDC)
VERCEL_TOKEN=

# Demo
SIMULATION_MODE=false          # true = always use simulation
DEMO_REPO_URL=https://github.com/vercel/ai
```

---

## License

MIT
