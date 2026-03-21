# Agentnetes

**Zero to a Self-Organizing AI Agency. On Demand.**

Zero to Agent? We are taking it further.

Type a goal. Agentnetes assembles a team of specialist AI agents, each running in its own Firecracker microVM sandbox, that explore, implement, test, and deliver together. No hardcoded roles. No sequential bottlenecks. No files stuffed into prompts.

> Built for **Zero to Agent London** :: Google DeepMind x Vercel Hackathon 2026
> by **Superagentic AI**

---

## What is it

Agentnetes is a self-organizing, recursive agent system. Think Kubernetes for AI agents.

You give it a single natural-language goal and a codebase. The system:

1. Spawns a root orchestrator (the Tech Lead) with a Firecracker sandbox pre-warmed from a repo snapshot
2. The root agent explores the codebase using shell commands (grep, find, cat) and invents a specialist team
3. Specialist agents run concurrently, each in their own isolated sandbox
4. Agents collaborate at runtime when findings from one affect another
5. All artifacts are collected, verified, and streamed back to you

Roles are fully emergent. Nothing is hardcoded. A provider implementation task gets a Scout, Engineer, Tester, and Packager. A security audit gets a completely different team.

---

## The Four Foundations

### 1. RLM Pattern (MIT CSAIL)

Context lives in sandboxes, not prompts. Agents do not receive hundreds of files in their context window. Instead they write small shell scripts to explore the codebase:

```bash
grep -r "LanguageModelV1" packages/ --include="*.ts" -l
find packages -name "package.json" -maxdepth 2
cat packages/provider-utils/src/types.ts
```

This keeps token footprints tiny regardless of codebase size and has been shown to outperform naive context-stuffing by 2x on software engineering benchmarks.

### 2. AutoResearch Loop (Karpathy)

Agents do not write code and hope. They write code, run tests, measure results, and loop:

```
write code -> run vitest -> check failures -> patch -> repeat
```

The Test Engineer runs the test suite after every change. Type errors trigger re-implementation by the Provider Engineer. The loop runs until everything passes or the agent escalates to the root.

### 3. Two-Tool MCP Strategy

Each agent has exactly two tools exposed via MCP:

- `search(query)` -- find things in the codebase
- `execute(command)` -- run shell commands in the agent's sandbox

This keeps the tool surface to roughly 1,000 tokens regardless of task complexity. Agents write arbitrary code against these two primitives. No tool proliferation. Two tools that compose into anything.

### 4. A2A Protocol

Every agent Agentnetes spawns generates a standard A2A Agent Card:

```json
{
  "name": "Provider Engineer",
  "description": "Implements LanguageModelV1 interface for a new AI SDK provider",
  "url": "https://agentnetes.vercel.app/agents/provider-engineer",
  "capabilities": { "streaming": true },
  "skills": [{ "id": "implement-provider", "tags": ["typescript", "ai-sdk"] }]
}
```

Today these cards are internal. Tomorrow any specialist agent can be published as an independent, discoverable service.

---

## Architecture

```
You type a goal
       |
       v
  [Root Agent / Tech Lead]          Gemini 2.5 Pro via AI Gateway
  Firecracker sandbox               vRLM orchestrator
  explores repo with grep/find
  invents team
       |
  _____|_______________________________________________
  |           |                |                     |
  v           v                v                     v
[Scout]   [Engineer]       [Tester]           [Packager]
Gemini    Gemini 2.5 Flash  Gemini 2.5 Flash   Gemini 2.5 Flash
own VM    own VM            own VM             own VM
search()  execute()         execute()          execute()
```

Each agent runs in its own Firecracker microVM. Pre-warmed from a snapshot so startup is near-instant. Failed experiments are completely contained. Agents communicate through the vRLM runtime, not through prompts.

---

## Tech Stack

| Layer | Package | Version |
|-------|---------|---------|
| AI Runtime | `ai` (Vercel AI SDK) | `7.0.0-beta.33` |
| Agent primitive | `ToolLoopAgent` | AI SDK v7 beta |
| AI Gateway | `@ai-sdk/gateway` | `4.0.0-beta.18` |
| Sandbox | `@vercel/sandbox` | `1.9.0` |
| Isolation | Firecracker microVMs | hardware-level |
| Framework | Next.js App Router | latest |
| Planner model | Gemini 2.5 Pro | via AI Gateway |
| Worker model | Gemini 2.5 Flash | via AI Gateway |
| Streaming | Server-Sent Events | native ReadableStream |

### Key implementation detail

```typescript
// lib/vrlm/agent-factory.ts
const agent = new ToolLoopAgent({
  model: gateway('google/gemini-2.5-flash'),
  tools: { search, execute },
  stopCondition: stepCountIs(40),
  system: buildWorkerPrompt(task),
});

for await (const event of agent.stream()) {
  // stream findings, artifacts, terminal output back to orchestrator
}
```

---

## Running locally

```bash
# Install
npm install

# Set environment variables
cp .env.example .env.local
# GOOGLE_API_KEY=...
# VERCEL_OIDC_TOKEN=...  (for sandbox)
# REPO_SNAPSHOT_ID=...   (pre-warmed repo snapshot)

# Dev server
npm run dev
```

Visit `http://localhost:3000` for the landing page and `http://localhost:3000/demo` for the agent interface.

### Running in simulation mode

The demo ships with a full simulated runtime (`lib/vrlm/simulated-runtime.ts`) that produces realistic agent events without requiring sandbox or API credentials. This is the demo backup.

To force simulation mode, visit `/demo?mode=simulation` or set `SIMULATION_MODE=true` in your environment.

---

## Project structure

```
agentnetes/
  app/
    page.tsx              Landing page
    demo/page.tsx         Agent demo UI
    api/chat/route.ts     SSE streaming endpoint
    globals.css
    layout.tsx
  components/
    AgentPanel.tsx        Agent activity panel (task cards, terminal, A2A cards)
    ChatPanel.tsx         Chat input and message history
    ModelSelector.tsx     Model switcher
  lib/
    vrlm/
      types.ts            AgentTask, VrlmEvent, Artifact types
      events.ts           VrlmEventEmitter
      simulated-runtime.ts  Phase 1: full simulation for demo
      runtime.ts          Phase 2: real execution (in progress)
      sandbox-manager.ts  Sandbox lifecycle management
      agent-factory.ts    ToolLoopAgent construction
      prompts.ts          Root planner + worker system prompts
    a2a.ts               A2A Agent Card generation
  scripts/
    create-snapshot.ts   One-time: snapshot vercel/ai monorepo for pre-warming
```

---

## The vRLM Runtime

vRLM (Vercel-native Recursive Language Model runtime) is the internal orchestration engine. It:

- Manages the task tree (root + worker tasks)
- Emits typed SSE events to the UI
- Routes collaboration messages between agents
- Handles sandbox lifecycle (create from snapshot, cleanup)
- Builds A2A cards for each spawned agent
- Collects and verifies artifacts at completion

Event types: `task-created`, `task-updated`, `task-completed`, `task-failed`, `finding`, `artifact`, `collaboration`, `terminal`, `synthesis`, `done`, `error`

---

## Demo scenarios

The simulated runtime branches on goal keywords:

| Goal contains | Team assembled |
|---------------|----------------|
| provider, sdk, deepseek | Scout + Provider Engineer + Test Engineer + Package Engineer |
| security, vulnerability, auth | Security Scanner + Auth Auditor + CVE Analyst + Risk Reporter |
| research, command, cli | Codebase Explorer + Feature Engineer + Integration Tester + Doc Writer |
| anything else | Tech Lead + Implementation Engineer + Verification Agent |

---

## Environment variables

```bash
GOOGLE_API_KEY=          # Google AI API key (for Gemini via AI Gateway)
VERCEL_OIDC_TOKEN=       # Vercel OIDC token (for sandbox creation)
REPO_SNAPSHOT_ID=        # Snapshot ID of pre-warmed vercel/ai monorepo
SIMULATION_MODE=         # Set to "true" to force simulation (no sandbox needed)
```

---

## Hackathon context

This project was built for the **Zero to Agent London** hackathon, hosted by Cerebral Valley in partnership with Google DeepMind and Vercel.

The prompt is "Zero to Agent." We built a system that takes you from zero to a full self-organizing agent team in a single sentence.

Built by **Superagentic AI**.

---

## License

MIT
