'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Github, ChevronRight, Terminal, Box, Zap, Settings, BookOpen, Code2, Layers, ArrowRight } from 'lucide-react';

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

// ── Theme toggle ─────────────────────────────────────────────────
function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-9 h-9" />;
  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/10 text-white/60 hover:text-white/80 transition-colors">
      {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}

// ── Sidebar sections ─────────────────────────────────────────────
const SECTIONS = [
  { id: 'quickstart',   label: 'Quick Start',         icon: Zap },
  { id: 'how-it-works', label: 'How it Works',        icon: Layers },
  { id: 'cli',          label: 'CLI Reference',        icon: Terminal },
  { id: 'sandboxes',    label: 'Sandbox Providers',    icon: Box },
  { id: 'config',       label: 'Configuration',        icon: Settings },
  { id: 'examples',     label: 'Examples',             icon: Code2 },
  { id: 'architecture',   label: 'Architecture',       icon: BookOpen },
  { id: 'troubleshoot',   label: 'Troubleshooting',    icon: Terminal },
];

// ── Code block ───────────────────────────────────────────────────
function Code({ children, lang = 'bash' }: { children: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(children.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <div className="relative rounded-xl border border-white/10 overflow-hidden my-4" style={{ background: 'var(--bg-subtle)' }}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06]">
        <span className="text-[11px] font-mono text-white/30 uppercase">{lang}</span>
        <button onClick={copy} className="text-[11px] font-mono text-white/40 hover:text-white/70 transition-colors px-2 py-0.5 rounded border border-white/10">
          {copied ? 'copied!' : 'copy'}
        </button>
      </div>
      <pre className="px-5 py-4 text-sm font-mono text-white/80 overflow-x-auto leading-relaxed whitespace-pre">{children.trim()}</pre>
    </div>
  );
}

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="text-2xl font-bold text-white mt-14 mb-4 scroll-mt-20 flex items-center gap-3">
      <span className="w-1 h-6 rounded-full inline-block shrink-0" style={{ background: 'linear-gradient(180deg, #a855f7, #ec4899)' }} />
      {children}
    </h2>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="text-base font-semibold text-white mt-8 mb-3">{children}</h3>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-white/70 leading-relaxed mb-4 text-base">{children}</p>;
}

function Callout({ type = 'info', children }: { type?: 'info' | 'tip' | 'warn'; children: React.ReactNode }) {
  const styles = {
    info: { border: 'border-purple-500/30', bg: 'rgba(168,85,247,0.06)', dot: '#a855f7', label: 'Note' },
    tip:  { border: 'border-green-500/30',  bg: 'rgba(34,197,94,0.06)',   dot: '#22c55e', label: 'Tip' },
    warn: { border: 'border-orange-500/30', bg: 'rgba(249,115,22,0.06)',  dot: '#f97316', label: 'Warning' },
  }[type];
  return (
    <div className={`rounded-xl border ${styles.border} px-5 py-4 my-4 text-sm text-white/70 leading-relaxed`} style={{ background: styles.bg }}>
      <span className="font-semibold text-white/90 mr-2" style={{ color: styles.dot }}>{styles.label}:</span>
      {children}
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────
export default function Docs() {
  const [active, setActive] = useState('quickstart');

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id);
        }
      },
      { rootMargin: '-20% 0% -70% 0%' }
    );
    SECTIONS.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: 'var(--bg-base)', color: 'rgb(var(--fg))' }}>

      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/[0.06] backdrop-blur-xl" style={{ background: 'color-mix(in srgb, var(--bg-base) 90%, transparent)' }}>
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2.5">
              <Image src={`${BASE}/favicon.png`} alt="Agentnetes" width={22} height={22} className="rounded-md" />
              <span className="font-bold tracking-tight text-white">Agentnetes</span>
            </Link>
            <span className="text-white/20 hidden sm:inline">/</span>
            <span className="text-white/60 text-sm hidden sm:inline">Docs</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <a href="https://github.com/Shashikant86/agentnetes" target="_blank" rel="noreferrer"
              className="text-white/50 hover:text-white/80 transition-colors hidden sm:block">
              <Github size={16} />
            </a>
            <Link href="/demo"
              className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg transition-all"
              style={{ background: 'linear-gradient(135deg, #c084fc, #f472b6, #fb923c)', color: '#000' }}>
              Try demo <ArrowRight size={11} />
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto flex pt-14">

        {/* Sidebar */}
        <aside className="w-56 shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto py-8 px-4 border-r border-white/[0.06] hidden md:block">
          <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-4 px-3">Documentation</div>
          <nav className="space-y-0.5">
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <a key={id} href={`#${id}`}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                  active === id
                    ? 'text-white font-medium'
                    : 'text-white/50 hover:text-white/80'
                }`}
                style={active === id ? { background: 'var(--bg-card)' } : {}}>
                <Icon size={13} className={active === id ? 'text-purple-400' : ''} />
                {label}
              </a>
            ))}
          </nav>

          <div className="mt-8 mx-3 pt-6 border-t border-white/[0.06]">
            <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-3">Links</div>
            <a href="https://www.npmjs.com/package/agentnetes" target="_blank" rel="noreferrer"
              className="flex items-center gap-2 text-xs text-white/50 hover:text-white/80 transition-colors py-1.5">
              <span className="w-3 h-3 rounded-sm bg-red-500/70 inline-block" /> npm package
            </a>
            <a href="https://github.com/Shashikant86/agentnetes" target="_blank" rel="noreferrer"
              className="flex items-center gap-2 text-xs text-white/50 hover:text-white/80 transition-colors py-1.5">
              <Github size={12} /> GitHub repo
            </a>
            <a href="https://arxiv.org/abs/2512.24601" target="_blank" rel="noreferrer"
              className="flex items-center gap-2 text-xs text-white/50 hover:text-white/80 transition-colors py-1.5">
              <BookOpen size={12} /> RLM paper
            </a>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0 px-8 py-10 max-w-3xl">

          {/* Header */}
          <div className="mb-10">
            <div className="text-xs font-mono text-white/40 uppercase tracking-widest mb-3">Developer Docs</div>
            <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">Getting Started</h1>
            <p className="text-white/65 text-lg leading-relaxed">
              Everything you need to run Agentnetes on your codebase · from a first{' '}
              <code className="text-purple-400 bg-purple-400/10 px-1.5 py-0.5 rounded text-sm">npx</code> command
              to production agent swarms.
            </p>
          </div>

          {/* 3-step hero */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
            {[
              { step: '1', label: 'Get API key', detail: 'Free at aistudio.google.com', href: 'https://aistudio.google.com', color: '#a855f7' },
              { step: '2', label: 'Pull Docker image', detail: 'docker pull node:20-alpine', href: null, color: '#ec4899' },
              { step: '3', label: 'Run on your repo', detail: 'npx agentnetes run "goal"', href: null, color: '#f97316' },
            ].map(({ step, label, detail, href, color }) => (
              <div key={step} className="rounded-xl border border-white/10 px-5 py-4" style={{ background: 'var(--bg-subtle)' }}>
                <div className="text-xs font-mono mb-2" style={{ color }}>Step {step}</div>
                <div className="text-white font-semibold text-sm mb-1">{label}</div>
                {href
                  ? <a href={href} target="_blank" rel="noreferrer" className="text-xs font-mono underline underline-offset-2" style={{ color }}>{detail}</a>
                  : <code className="text-xs font-mono text-white/50">{detail}</code>
                }
              </div>
            ))}
          </div>

          {/* ── Quick Start ─────────────────────────────────────── */}
          <H2 id="quickstart">Quick Start</H2>
          <P>No installation required. Point Agentnetes at any git repo in under 2 minutes.</P>

          <H3>1. Get a Google API key</H3>
          <P>
            Agentnetes uses Gemini 2.5 Pro (planner) and Gemini 2.5 Flash (workers) by default.
            Get a free API key from{' '}
            <a href="https://aistudio.google.com" target="_blank" rel="noreferrer" className="text-purple-400 hover:text-purple-300 underline underline-offset-2">
              aistudio.google.com
            </a>. The free tier is sufficient for most tasks.
          </P>

          <H3>2. Pull the Docker base image</H3>
          <Code>{`docker pull node:20-alpine`}</Code>
          <P>This is a one-time step. Each agent gets its own container · pulling it now means the first run starts immediately.</P>

          <H3>3. Run on your repo</H3>
          <Code>{`# From inside any git repository
cd your-project
GOOGLE_API_KEY=your_key npx agentnetes run "add comprehensive test coverage"`}</Code>

          <H3>What you will see</H3>
          <div className="rounded-xl border border-white/10 overflow-hidden my-4" style={{ background: 'var(--bg-subtle)' }}>
            <div className="flex items-center gap-2 px-4 py-2 border-b border-white/[0.06]">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/50" /><span className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" /><span className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
            </div>
            <pre className="px-5 py-4 text-sm font-mono text-white/70 leading-relaxed">{`
  Agentnetes
  Zero to a self-organizing AI agency. On demand.

  Repo:     https://github.com/your-org/your-repo
  Goal:     add comprehensive test coverage
  Sandbox:  cloning from git

  🧠 Tech Lead
    analyzing goal + repo structure

    > find . -name "*.test.ts" -maxdepth 4
    > grep -r "describe\\|it(" src/ -l

  + 🔍 Scout          exploring test coverage gaps
  + 🛠  Engineer       implementing missing tests
  + ✅ Tester         verifying test suite passes

  [Scout]    found 12 files with no test coverage
  [Engineer] writing vitest tests for auth module
  + src/auth/auth.test.ts  (typescript)
  [Tester]   all 47 tests passing

  Summary
  ------
  Added 3 test files covering auth, middleware, and utils...

  Done.
`.trim()}</pre>
          </div>

          <Callout type="tip">
            Run <code className="text-purple-400">npx agentnetes</code> with no arguments to see all available commands.
          </Callout>

          <H3>3. Install globally (optional)</H3>
          <P>Skip the <code className="text-white/80 bg-white/5 px-1.5 py-0.5 rounded text-sm">npx</code> prefix by installing once:</P>
          <Code>{`npm install -g agentnetes

# Then use anywhere
GOOGLE_API_KEY=your_key agentnetes run "refactor auth module to use JWT"`}</Code>

          <H3>Prerequisites</H3>
          <div className="rounded-xl border border-white/10 overflow-hidden my-4" style={{ background: 'var(--bg-subtle)' }}>
            {[
              ['Node.js', '18+', 'Required'],
              ['Docker', 'any recent version', 'Required for docker sandbox (default)'],
              ['Google API key', 'free tier works', 'Required · or use AI Gateway'],
              ['Git', 'repo must have origin remote', 'Required'],
            ].map(([name, detail, note]) => (
              <div key={name} className="flex items-center gap-4 px-5 py-3 border-b border-white/[0.05] last:border-0">
                <span className="text-white font-medium text-sm w-32 shrink-0">{name}</span>
                <span className="text-white/50 text-sm font-mono">{detail}</span>
                <span className="text-white/35 text-xs ml-auto">{note}</span>
              </div>
            ))}
          </div>

          <Callout type="info">
            Pull the Docker base image once to speed up first runs:{' '}
            <code className="text-white/80 bg-white/5 px-1.5 py-0.5 rounded text-sm">docker pull node:20-alpine</code>
          </Callout>

          {/* ── How it Works ────────────────────────────────────── */}
          <H2 id="how-it-works">How it Works</H2>
          <P>
            Agentnetes implements the <a href="https://arxiv.org/abs/2512.24601" target="_blank" rel="noreferrer" className="text-purple-400 hover:text-purple-300 underline underline-offset-2">RLM pattern (MIT CSAIL)</a> · context lives in sandboxes, not prompts.
          </P>

          {[
            ['1. You type a goal', 'A natural-language description of what you want done. No special syntax required.'],
            ['2. Root agent plans', 'A Tech Lead agent explores your repo structure and invents a specialist team tailored to the goal. Roles are fully emergent · nothing is hardcoded.'],
            ['3. Specialists run in parallel', 'Each specialist gets its own isolated sandbox with the repo cloned inside. They use two tools: search() and execute(). No file contents stuffed into prompts.'],
            ['4. AutoResearch loop', 'Agents write code, run tests, observe failures, patch, and repeat · following the write → test → fix loop until the task is done or the step budget is reached.'],
            ['5. Synthesis', 'The root agent collects all findings and delivers a final markdown summary of everything built.'],
          ].map(([title, desc]) => (
            <div key={title} className="flex gap-4 mb-5" style={{}}>
              <div className="w-1.5 shrink-0 rounded-full mt-1" style={{ background: 'linear-gradient(180deg, #a855f7 0%, #f97316 100%)', minHeight: '2rem' }} />
              <div>
                <div className="text-white font-semibold text-sm mb-1">{title}</div>
                <div className="text-white/60 text-sm leading-relaxed">{desc}</div>
              </div>
            </div>
          ))}

          <H3>The two-tool strategy</H3>
          <P>Every agent has exactly two tools · keeping the token footprint under ~1,000 tokens regardless of codebase size:</P>
          <Code lang="typescript">{`search(pattern, path?, fileGlob?)  // grep -r across the repo
execute(command)                   // run any shell command in the sandbox`}</Code>

          {/* ── CLI Reference ───────────────────────────────────── */}
          <H2 id="cli">CLI Reference</H2>

          <H3>agentnetes run</H3>
          <P>Run a swarm of agents against the current git repository.</P>
          <Code>{`agentnetes run "<goal>"

# Examples
agentnetes run "add TypeScript strict mode and fix all type errors"
agentnetes run "write unit tests for the auth module"
agentnetes run "implement rate limiting on all API routes"
agentnetes run "add OpenTelemetry tracing throughout the app"`}</Code>
          <Callout type="info">
            Must be run from inside a git repository with a remote <code className="text-white/80 bg-white/5 px-1 py-0.5 rounded text-sm">origin</code>. Agentnetes auto-detects the repo URL.
          </Callout>

          <H3>agentnetes snapshot create</H3>
          <P>Pre-warm a Vercel sandbox snapshot of your repo so future runs start in seconds instead of cloning from scratch.</P>
          <Code>{`VERCEL_TOKEN=your_token agentnetes snapshot create`}</Code>

          <H3>agentnetes snapshot list</H3>
          <P>List all available snapshots in your Vercel account.</P>
          <Code>{`VERCEL_TOKEN=your_token agentnetes snapshot list`}</Code>

          {/* ── Sandbox Providers ───────────────────────────────── */}
          <H2 id="sandboxes">Sandbox Providers</H2>
          <P>
            Each agent runs in its own isolated sandbox with the repo cloned inside. Choose the provider that fits your setup:
          </P>

          <div className="rounded-xl border border-white/10 overflow-hidden my-4">
            <div className="grid grid-cols-4 px-5 py-2.5 border-b border-white/[0.06] text-[11px] font-mono text-white/40 uppercase tracking-wider" style={{ background: 'var(--bg-card)' }}>
              <span>Provider</span><span>Env var</span><span>Speed</span><span>Notes</span>
            </div>
            {[
              ['docker',  '-',                    'Fast',     'Default. node:20-alpine per agent.'],
              ['local',   '-',                    'Fastest',  'Runs on host machine. No isolation.'],
              ['vercel',  'VERCEL_TOKEN',          'Fastest*', 'Firecracker microVMs. Snapshot support.'],
              ['e2b',     'E2B_API_KEY',           'Fast',     'Install e2b package separately.'],
              ['daytona', 'DAYTONA_API_KEY',       'Fast',     'Install @daytonaio/sdk separately.'],
            ].map(([provider, env, speed, notes]) => (
              <div key={provider} className="grid grid-cols-4 px-5 py-3 border-b border-white/[0.05] last:border-0 text-sm" style={{ background: 'var(--bg-subtle)' }}>
                <code className="text-purple-400">{provider}</code>
                <code className="text-white/50 text-xs">{env}</code>
                <span className="text-white/60">{speed}</span>
                <span className="text-white/45 text-xs">{notes}</span>
              </div>
            ))}
          </div>

          <H3>Setting the provider</H3>
          <Code>{`# Use Docker (default for local dev)
SANDBOX_PROVIDER=docker GOOGLE_API_KEY=xxx agentnetes run "goal"

# Use local (fastest, no isolation)
SANDBOX_PROVIDER=local GOOGLE_API_KEY=xxx agentnetes run "goal"

# Use Vercel (requires VERCEL_TOKEN)
SANDBOX_PROVIDER=vercel VERCEL_TOKEN=xxx GOOGLE_API_KEY=xxx agentnetes run "goal"`}</Code>

          <Callout type="tip">
            For local development, <code className="text-white/80 bg-white/5 px-1 py-0.5 rounded text-sm">docker</code> is recommended over <code className="text-white/80 bg-white/5 px-1 py-0.5 rounded text-sm">local</code> · it prevents agents from writing to your actual working directory.
          </Callout>

          {/* ── Configuration ───────────────────────────────────── */}
          <H2 id="config">Configuration</H2>
          <P>All configuration is done via environment variables. No config file needed.</P>

          <H3>Full reference</H3>
          <Code>{`# ── LLM Provider (one of these) ──────────────────────────────────
GOOGLE_API_KEY=                  # Direct Gemini · get free at aistudio.google.com
AI_GATEWAY_BASE_URL=             # Vercel AI Gateway endpoint
AI_GATEWAY_API_KEY=              # Vercel AI Gateway API key

# ── Sandbox ───────────────────────────────────────────────────────
SANDBOX_PROVIDER=docker          # docker | local | vercel | e2b | daytona
VERCEL_TOKEN=                    # Required for vercel sandbox

# ── Models (optional overrides) ───────────────────────────────────
PLANNER_MODEL=google/gemini-2.5-pro    # Root Tech Lead model
WORKER_MODEL=google/gemini-2.5-flash   # Specialist agent model

# ── Demo web app only ─────────────────────────────────────────────
SIMULATION_MODE=false            # true = skip real runtime, use simulation
DEMO_REPO_URL=https://github.com/vercel/ai`}</Code>

          <H3>Using Vercel AI Gateway</H3>
          <P>
            Instead of calling Google directly, you can route all model calls through{' '}
            <a href="https://vercel.com/docs/ai-gateway" target="_blank" rel="noreferrer" className="text-purple-400 hover:text-purple-300 underline underline-offset-2">
              Vercel AI Gateway
            </a>{' '}
            for unified logging, caching, and fallbacks:
          </P>
          <Code>{`AI_GATEWAY_BASE_URL=https://ai-gateway.vercel.sh/v1/xxx
AI_GATEWAY_API_KEY=your_gateway_key
agentnetes run "your goal"`}</Code>

          {/* ── Examples ────────────────────────────────────────── */}
          <H2 id="examples">Examples</H2>

          <H3>Add test coverage</H3>
          <Code>{`cd your-node-project
GOOGLE_API_KEY=xxx npx agentnetes run "add vitest unit tests for all utility functions"`}</Code>

          <H3>Fix TypeScript errors</H3>
          <Code>{`GOOGLE_API_KEY=xxx npx agentnetes run "enable strict TypeScript and fix all type errors"`}</Code>

          <H3>Implement a feature</H3>
          <Code>{`GOOGLE_API_KEY=xxx npx agentnetes run "add rate limiting middleware to all Express routes using express-rate-limit"`}</Code>

          <H3>Security audit</H3>
          <Code>{`GOOGLE_API_KEY=xxx npx agentnetes run "audit the codebase for security vulnerabilities and fix them"`}</Code>

          <H3>Add observability</H3>
          <Code>{`GOOGLE_API_KEY=xxx npx agentnetes run "add OpenTelemetry tracing to all API routes and database queries"`}</Code>

          <Callout type="tip">
            Be specific in your goals. Instead of <em>&quot;improve the code&quot;</em>, try <em>&quot;add error handling to all async functions in the API layer and log errors with structured JSON&quot;</em>.
          </Callout>

          {/* ── Architecture ────────────────────────────────────── */}
          <H2 id="architecture">Architecture</H2>

          <P>The core runtime is in <code className="text-white/80 bg-white/5 px-1.5 py-0.5 rounded text-sm">lib/vrlm/</code> and is completely independent of Next.js · you can embed it in any Node.js application.</P>

          <H3>Embedding the runtime</H3>
          <Code lang="typescript">{`import { VrlmRuntime } from 'agentnetes/runtime';
import { VrlmEventEmitter } from 'agentnetes/events';

const emitter = new VrlmEventEmitter();
emitter.on(event => {
  if (event.type === 'finding') console.log(event.data.text);
  if (event.type === 'artifact') console.log('File:', event.data.artifact.filename);
  if (event.type === 'done') console.log('Complete.');
});

const runtime = new VrlmRuntime(emitter, {
  repoUrl: 'https://github.com/your-org/your-repo',
  plannerModel: 'google/gemini-2.5-pro',
  workerModel: 'google/gemini-2.5-flash',
  maxWorkers: 4,
  maxStepsPerAgent: 20,
});

await runtime.run('add comprehensive test coverage');`}</Code>

          <H3>Event types</H3>
          <div className="rounded-xl border border-white/10 overflow-hidden my-4" style={{ background: 'var(--bg-subtle)' }}>
            {[
              ['task-created',   'A new agent task was spawned'],
              ['task-updated',   'Agent status text changed'],
              ['task-completed', 'Agent finished successfully'],
              ['task-failed',    'Agent encountered an error'],
              ['finding',        'Agent produced a text observation'],
              ['terminal',       'Agent ran a shell command (tool call)'],
              ['artifact',       'Agent created or modified a file'],
              ['collaboration',  'Agent requested input from another agent'],
              ['synthesis',      'Root agent produced the final summary'],
              ['done',           'All agents finished · run is complete'],
              ['error',          'Fatal runtime error'],
            ].map(([type, desc]) => (
              <div key={type} className="flex items-center gap-4 px-5 py-2.5 border-b border-white/[0.05] last:border-0">
                <code className="text-purple-400 text-xs w-36 shrink-0">{type}</code>
                <span className="text-white/55 text-sm">{desc}</span>
              </div>
            ))}
          </div>

          {/* ── Troubleshooting ─────────────────────────────────── */}
          <H2 id="troubleshoot">Troubleshooting</H2>

          {[
            {
              error: 'Error: not inside a git repository or no remote "origin" found',
              cause: 'You must run agentnetes from inside a git repo that has a remote named origin.',
              fix: 'cd into your project root and ensure git remote get-url origin returns a URL.',
            },
            {
              error: 'GOOGLE_API_KEY is not set / no LLM provider configured',
              cause: 'No API key was provided and no AI Gateway is configured.',
              fix: 'Set GOOGLE_API_KEY=your_key before the command, or add it to a .env file and use dotenv.',
            },
            {
              error: 'Docker daemon is not running',
              cause: 'The Docker sandbox (default) requires Docker Desktop or Docker Engine to be running.',
              fix: 'Start Docker Desktop, or switch to local sandbox: SANDBOX_PROVIDER=local',
            },
            {
              error: 'docker: Cannot connect to the Docker daemon',
              cause: 'Same as above · Docker is not running or the socket is not accessible.',
              fix: 'Run: open -a Docker (macOS) or sudo systemctl start docker (Linux)',
            },
            {
              error: 'Fatal: model returned empty response',
              cause: 'The Gemini API returned nothing · usually a quota or region issue.',
              fix: 'Check your quota at aistudio.google.com. Try WORKER_MODEL=google/gemini-2.0-flash as a fallback.',
            },
            {
              error: 'Agent exceeded step budget with no result',
              cause: 'The agent hit the maxStepsPerAgent limit (default: 20) without completing.',
              fix: 'Break the goal into smaller tasks, or increase the budget with WORKER_MAX_STEPS=40.',
            },
          ].map(({ error, cause, fix }) => (
            <div key={error} className="rounded-xl border border-white/10 px-5 py-4 mb-4" style={{ background: 'var(--bg-subtle)' }}>
              <code className="text-red-400 text-xs font-mono block mb-3 leading-relaxed">{error}</code>
              <div className="text-sm text-white/60 mb-1"><span className="text-white/40 mr-2">Cause:</span>{cause}</div>
              <div className="text-sm text-white/70"><span className="text-green-400 mr-2">Fix:</span>{fix}</div>
            </div>
          ))}

          <Callout type="tip">
            Still stuck? Open an issue at{' '}
            <a href="https://github.com/Shashikant86/agentnetes/issues" target="_blank" rel="noreferrer" className="text-purple-400 hover:text-purple-300 underline underline-offset-2">
              github.com/Shashikant86/agentnetes/issues
            </a>{' '}
            with the error output and your sandbox provider.
          </Callout>

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Image src={`${BASE}/favicon.png`} alt="Agentnetes" width={18} height={18} className="rounded-sm opacity-60" />
              <span className="text-white/40 text-sm font-mono">Agentnetes · MIT License</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <Link href="/" className="text-white/40 hover:text-white/70 transition-colors">Home</Link>
              <Link href="/demo" className="text-white/40 hover:text-white/70 transition-colors">Demo</Link>
              <a href="https://github.com/Shashikant86/agentnetes" target="_blank" rel="noreferrer" className="text-white/40 hover:text-white/70 transition-colors">GitHub</a>
              <a href="https://www.npmjs.com/package/agentnetes" target="_blank" rel="noreferrer" className="text-white/40 hover:text-white/70 transition-colors">npm</a>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
