'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState, useRef } from 'react';
import {
  ArrowRight, Github, Zap, Shield, GitBranch, Layers,
  Terminal, ExternalLink, CheckCircle2, ChevronRight,
  Box, Network, Code2, RefreshCw, Sun, Moon,
} from 'lucide-react';
import { useTheme } from 'next-themes';

// ── Brand colors (from logo: purple -> pink -> orange) ───────────
// Primary gradient: #c084fc -> #f472b6 -> #fb923c
// Use these for accents, CTAs, glows

// ── Terminal animation ───────────────────────────────────────────
interface TerminalLine {
  delay: number;
  type: 'cmd' | 'info' | 'dim' | 'root' | 'exec' | 'agent' | 'collab' | 'success';
  text: string;
}

const TERMINAL_LINES: TerminalLine[] = [
  { delay: 0,    type: 'cmd',     text: '$ agentnetes run "Add @ai-sdk/deepseek with streaming support"' },
  { delay: 700,  type: 'info',    text: 'Initializing vRLM runtime...' },
  { delay: 1100, type: 'info',    text: 'Warming sandbox snapshot  [vercel-ai-monorepo @ a3f7bc2]' },
  { delay: 1600, type: 'dim',     text: '' },
  { delay: 1800, type: 'root',    text: '[root]  Tech Lead          spawned   analyzing goal + monorepo' },
  { delay: 2200, type: 'exec',    text: '  > grep -r "LanguageModelV1" packages/ --include="*.ts" -l' },
  { delay: 2500, type: 'exec',    text: '  > find packages -name "package.json" -maxdepth 2' },
  { delay: 2900, type: 'exec',    text: '  > Spawning 4 specialist agents' },
  { delay: 3200, type: 'dim',     text: '' },
  { delay: 3400, type: 'agent',   text: '[0.3s]  Architecture Scout   running   mapping provider interfaces' },
  { delay: 3800, type: 'agent',   text: '[0.8s]  Provider Engineer    running   implementing LanguageModelV1' },
  { delay: 4200, type: 'agent',   text: '[1.4s]  Test Engineer        running   vitest coverage + types' },
  { delay: 4600, type: 'agent',   text: '[1.9s]  Package Engineer     running   ESM + CJS exports' },
  { delay: 5000, type: 'dim',     text: '' },
  { delay: 5100, type: 'collab',  text: '[2.1s]  Collaboration: Test Engineer -> Provider Engineer' },
  { delay: 5300, type: 'exec',    text: '  > Type error in DeepSeekChatModel.doStream() -- patching' },
  { delay: 5700, type: 'exec',    text: '  > Re-running test suite...' },
  { delay: 6100, type: 'dim',     text: '' },
  { delay: 6300, type: 'success', text: 'Done in 47s' },
  { delay: 6500, type: 'success', text: '  8/8 tests passing   0 TypeScript errors   4 files generated' },
];

function AnimatedTerminal() {
  const [visibleCount, setVisibleCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visibleCount >= TERMINAL_LINES.length) {
      const t = setTimeout(() => setVisibleCount(0), 4000);
      return () => clearTimeout(t);
    }
    const line = TERMINAL_LINES[visibleCount];
    const prev = visibleCount > 0 ? TERMINAL_LINES[visibleCount - 1].delay : 0;
    const wait = visibleCount === 0 ? 0 : line.delay - prev;
    const t = setTimeout(() => setVisibleCount(v => v + 1), wait);
    return () => clearTimeout(t);
  }, [visibleCount]);

  useEffect(() => {
    containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' });
  }, [visibleCount]);

  function lineClass(type: TerminalLine['type']) {
    switch (type) {
      case 'cmd':     return 'text-white font-semibold';
      case 'info':    return 'text-white/75';
      case 'dim':     return 'opacity-0 select-none';
      case 'root':    return 'text-yellow-400 font-medium';
      case 'exec':    return 'text-violet-400';
      case 'agent':   return 'text-purple-300';
      case 'collab':  return 'text-orange-400 font-medium';
      case 'success': return 'text-emerald-400 font-semibold';
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-purple-500/10" style={{ background: 'var(--bg-panel)' }}>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
        <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
        <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
        <span className="w-3 h-3 rounded-full bg-[#28c840]" />
        <span className="ml-3 text-[11px] text-white/65 font-mono flex-1">agentnetes -- vRLM runtime</span>
        {visibleCount >= TERMINAL_LINES.length && (
          <button onClick={() => setVisibleCount(0)} className="text-white/65 hover:text-white/70 transition-colors">
            <RefreshCw size={11} />
          </button>
        )}
      </div>
      <div ref={containerRef} className="p-5 font-mono text-[12px] leading-6 space-y-0.5 overflow-y-auto" style={{ height: '290px', background: 'var(--bg-panel)' }}>
        {TERMINAL_LINES.slice(0, visibleCount).map((line, i) => (
          <div key={i} className={`whitespace-pre ${lineClass(line.type)}`}>{line.text || '\u00a0'}</div>
        ))}
        {visibleCount < TERMINAL_LINES.length && (
          <span className="inline-block w-2 h-3.5 bg-violet-400 animate-pulse align-middle" />
        )}
      </div>
    </div>
  );
}

// ── Typing prompt ────────────────────────────────────────────────
const PROMPTS = [
  'Add a @ai-sdk/deepseek provider with streaming',
  'Find security vulnerabilities in the auth flow',
  'Add a /research command with source citations',
  'Refactor the rate-limiter following existing patterns',
];

function Cursor() {
  const [on, setOn] = useState(true);
  useEffect(() => {
    const id = setInterval(() => setOn(v => !v), 500);
    return () => clearInterval(id);
  }, []);
  return <span className={`inline-block w-0.5 h-4 bg-violet-400 ml-px align-middle transition-opacity ${on ? 'opacity-100' : 'opacity-0'}`} />;
}

function TypingPrompt() {
  const [idx, setIdx] = useState(0);
  const [chars, setChars] = useState(0);
  const [del, setDel] = useState(false);

  useEffect(() => {
    const cur = PROMPTS[idx];
    if (!del && chars < cur.length) { const t = setTimeout(() => setChars(c => c + 1), 36); return () => clearTimeout(t); }
    if (!del && chars === cur.length) { const t = setTimeout(() => setDel(true), 2200); return () => clearTimeout(t); }
    if (del && chars > 0) { const t = setTimeout(() => setChars(c => c - 1), 15); return () => clearTimeout(t); }
    if (del && chars === 0) { setDel(false); setIdx(i => (i + 1) % PROMPTS.length); }
  }, [chars, del, idx]);

  return <span className="text-violet-300">{PROMPTS[idx].slice(0, chars)}<Cursor /></span>;
}

// ── Animated counter ─────────────────────────────────────────────
function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let n = 0;
    const step = Math.max(1, Math.ceil(to / 50));
    const id = setInterval(() => { n = Math.min(n + step, to); setVal(n); if (n >= to) clearInterval(id); }, 28);
    return () => clearInterval(id);
  }, [to]);
  return <>{val}{suffix}</>;
}

// ── Architecture diagram ─────────────────────────────────────────
function ArchDiagram() {
  return (
    <div className="rounded-2xl border border-white/10 p-7" style={{ background: 'var(--bg-panel)' }}>
      <div className="flex justify-center mb-5">
        <div className="flex items-center gap-2 border border-white/10 rounded-xl px-5 py-2.5 bg-white/5">
          <span className="text-white/70 text-xs font-mono">goal:</span>
          <span className="text-white text-xs font-mono">"Add @ai-sdk/deepseek provider"</span>
        </div>
      </div>
      <div className="flex justify-center mb-3">
        <div className="w-px h-5 bg-white/10" />
      </div>
      <div className="flex justify-center mb-3">
        <div className="border border-yellow-400/40 bg-yellow-400/5 rounded-xl px-5 py-3 text-center">
          <div className="text-yellow-300 text-xs font-mono font-semibold">Root Agent / Tech Lead</div>
          <div className="text-white/75 text-[10px] mt-0.5 font-mono">Gemini 2.5 Pro via AI Gateway</div>
          <div className="flex items-center justify-center gap-1.5 mt-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
            <span className="text-yellow-500/70 text-[10px] font-mono">vRLM orchestrator</span>
          </div>
        </div>
      </div>
      <div className="flex justify-center gap-14 mb-3">
        {[0,1,2,3].map(i => <div key={i} className="w-px h-5 bg-white/10" />)}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { icon: '🔍', label: 'Architecture Scout',  color: 'border-blue-400/30 bg-blue-400/5',   dot: 'bg-blue-400',   tool: 'search()' },
          { icon: '⚙️', label: 'Provider Engineer',   color: 'border-violet-400/30 bg-violet-400/5', dot: 'bg-violet-400', tool: 'execute()' },
          { icon: '🧪', label: 'Test Engineer',        color: 'border-emerald-400/30 bg-emerald-400/5', dot: 'bg-emerald-400', tool: 'execute()' },
          { icon: '📦', label: 'Package Engineer',     color: 'border-orange-400/30 bg-orange-400/5', dot: 'bg-orange-400', tool: 'execute()' },
        ].map(a => (
          <div key={a.label} className={`rounded-xl border ${a.color} p-3 text-center`}>
            <div className="text-lg mb-1">{a.icon}</div>
            <div className="text-white/90 text-[10px] font-medium leading-tight">{a.label}</div>
            <div className="text-white/65 text-[9px] font-mono mt-1">Gemini 2.5 Flash</div>
            <div className="mt-2 flex items-center justify-center gap-1">
              <span className={`w-1 h-1 rounded-full ${a.dot}`} />
              <span className="text-white/65 text-[9px] font-mono">{a.tool}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-white/5 pt-4 flex flex-wrap justify-center gap-5">
        {['Firecracker microVM per agent', 'search() + execute() MCP only', 'SSE event stream to UI'].map(x => (
          <span key={x} className="text-[10px] font-mono text-white/65">{x}</span>
        ))}
      </div>
    </div>
  );
}

// ── Feature card ─────────────────────────────────────────────────
interface FeatureCardProps {
  badge: string;
  badgeColor: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  detail: string;
  cite?: string;
  code?: string;
}

function FeatureCard({ badge, badgeColor, icon, title, description, detail, cite, code }: FeatureCardProps) {
  return (
    <div className="group rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-all duration-300 flex flex-col gap-4" style={{ background: 'var(--bg-card)' }}>
      <div className="flex items-start justify-between">
        <div className={`text-[10px] font-mono px-2 py-0.5 rounded border ${badgeColor}`}>{badge}</div>
        <div className="text-white/65 group-hover:text-white/70 transition-colors">{icon}</div>
      </div>
      <div>
        <h3 className="text-white font-semibold text-base mb-2">{title}</h3>
        <p className="text-white/70 text-base leading-relaxed mb-3">{description}</p>
        <p className="text-white/65 text-sm leading-relaxed">{detail}</p>
      </div>
      {code && (
        <div className="rounded-lg bg-black/40 border border-white/[0.06] px-3 py-2.5 font-mono text-[11px] text-violet-300">
          {code}
        </div>
      )}
      {cite && (
        <div className="text-[10px] text-white/50 font-mono border-t border-white/5 pt-3">{cite}</div>
      )}
    </div>
  );
}

// ── Stack badge ──────────────────────────────────────────────────
function StackBadge({ name, version, highlight }: { name: string; version: string; highlight?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-2 border rounded-xl px-4 py-2.5 ${highlight ? 'border-violet-500/30 bg-violet-500/5' : 'border-white/[0.08]'}`} style={highlight ? {} : { background: 'var(--bg-subtle)' }}>
      <div className="text-white/90 text-sm font-medium">{name}</div>
      <div className="text-white/75 text-[10px] font-mono shrink-0">{version}</div>
    </div>
  );
}

// ── Step ─────────────────────────────────────────────────────────
function Step({ n, title, body, accent }: { n: string; title: string; body: string; accent: string }) {
  return (
    <div className="flex gap-4">
      <div className={`shrink-0 w-8 h-8 rounded-full border flex items-center justify-center text-[11px] font-mono mt-0.5 ${accent}`}>{n}</div>
      <div className="pt-0.5">
        <h4 className="text-white font-semibold text-base mb-1.5">{title}</h4>
        <p className="text-white/75 text-base leading-relaxed">{body}</p>
      </div>
    </div>
  );
}

// ── Theme toggle ─────────────────────────────────────────────────
function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-9 h-9" />;
  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-lg border border-white/15 text-white/65 hover:text-white/80 hover:border-white/30 transition-all"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}

// ── Logo ─────────────────────────────────────────────────────────
function Logo({ size = 28 }: { size?: number }) {
  return (
    <Image
      src="/favicon.png"
      alt="Agentnetes"
      width={size}
      height={size}
      className="rounded-lg"
      priority
    />
  );
}

// ── Main page ────────────────────────────────────────────────────
export default function Landing() {
  return (
    <div className="overflow-x-hidden" style={{ fontFamily: "'Inter', sans-serif", background: 'var(--bg-base)', color: 'rgb(var(--fg))' }}>

      {/* ── Nav ─────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/[0.06] backdrop-blur-xl" style={{ background: 'color-mix(in srgb, var(--bg-base) 90%, transparent)' }}>
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Logo size={26} />
            <span className="font-bold tracking-tight text-white">Agentnetes</span>
            <span className="text-xs font-mono text-white/80 border border-white/20 rounded px-2 py-0.5 uppercase tracking-wider hidden sm:inline">
              Kubernetes for AI agents
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <a href="https://github.com/Shashikant86/agentnetes" target="_blank" rel="noreferrer"
              className="text-white/65 hover:text-white/80 transition-colors p-1">
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

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="pt-28 pb-20 px-6 relative" style={{
        backgroundImage: `
          radial-gradient(ellipse 70% 50% at 50% -10%, rgba(168,85,247,0.18) 0%, transparent 65%),
          radial-gradient(ellipse 40% 30% at 80% 20%, rgba(251,146,60,0.08) 0%, transparent 60%),
          linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
        `,
        backgroundSize: 'auto, auto, 52px 52px, 52px 52px',
      }}>
        <div className="max-w-4xl mx-auto text-center">

          {/* Logo mark */}
          <div className="flex justify-center mb-6">
            <Image src="/logo.png" alt="Agentnetes" width={90} height={90} priority className="rounded-2xl" />
          </div>

          {/* Hackathon badge */}
          <div className="inline-flex items-center gap-2 border border-white/10 rounded-full px-4 py-1.5 text-[11px] font-mono mb-8 bg-white/[0.03]">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-white/70">Zero to Agent London</span>
            <span className="text-white/50 mx-1">|</span>
            <span className="text-white/65">Google DeepMind x Vercel</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-5 leading-[1.05]">
            <span className="text-white">Zero to a</span>
            <br />
            <span className="text-transparent bg-clip-text" style={{
              backgroundImage: 'linear-gradient(135deg, #c084fc 0%, #f472b6 50%, #fb923c 100%)',
            }}>
              Self-Organizing
            </span>
            <br />
            <span className="text-white">AI Agency.</span>
            <span className="text-white/65"> On Demand.</span>
          </h1>

          <p className="text-white/70 text-lg mb-3 max-w-2xl mx-auto leading-relaxed font-medium">
            Zero to Agent? We are taking it further.
          </p>
          <p className="text-white/65 text-base mb-12 max-w-xl mx-auto leading-relaxed">
            Type a goal. Agentnetes assembles a team of specialist AI agents,
            each running in its own Firecracker microVM, that explore,
            implement, test, and deliver together.
          </p>

          {/* Typing prompt */}
          <div className="inline-flex items-center gap-3 border border-white/10 rounded-2xl px-5 py-3.5 mb-10 text-sm font-mono max-w-full shadow-xl shadow-black/50" style={{ background: 'var(--bg-subtle)' }}>
            <span className="text-white/50 shrink-0">$</span>
            <span className="text-white/75 shrink-0">agentnetes run</span>
            <TypingPrompt />
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
            <Link href="/demo"
              className="flex items-center gap-2 font-semibold px-7 py-3 rounded-xl text-base shadow-lg transition-all hover:opacity-90 hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899, #f97316)', color: '#fff' }}>
              <Zap size={14} />
              Launch demo
            </Link>
            <Link href="/demo?mode=simulation"
              className="flex items-center gap-2 border border-white/15 text-white/70 px-7 py-3 rounded-xl hover:border-white/30 hover:text-white transition-all text-base">
              View simulation <ChevronRight size={13} />
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px rounded-2xl overflow-hidden border border-white/[0.08]">
            {[
              { n: 6,   s: '+',      label: 'parallel agents' },
              { n: 2,   s: ' tools', label: 'per agent (MCP)' },
              { n: 100, s: 'K+',     label: 'lines explored' },
              { n: 1,   s: ' goal',  label: 'to a full team' },
            ].map(({ n, s, label }) => (
              <div key={label} className="py-5 px-4 text-center" style={{ background: 'var(--bg-subtle)' }}>
                <div className="text-2xl font-bold text-white mb-0.5 font-mono">
                  <Counter to={n} suffix={s} />
                </div>
                <div className="text-[11px] text-white/65 font-mono">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Architecture ─────────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-white/[0.05]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-xs font-mono text-white/65 uppercase tracking-widest mb-3">Architecture</div>
            <h2 className="text-3xl font-bold mb-4 text-white">One goal. A recursive agent swarm.</h2>
            <p className="text-white/75 text-base max-w-xl mx-auto leading-relaxed">
              The root agent decomposes your goal, invents the right team of specialists,
              and orchestrates them across isolated sandboxes. Roles are fully emergent. Nothing is hardcoded.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <ArchDiagram />
            <div className="space-y-3">
              {[
                { icon: <Network size={14} />, title: 'Emergent team formation',
                  body: 'The root agent reads the codebase, understands the task, and invents the right specialist roles. A provider task gets a Scout, Engineer, Tester, and Packager. A security audit gets an entirely different team.' },
                { icon: <Box size={14} />, title: 'Isolated Firecracker sandboxes',
                  body: 'Each agent runs in its own Vercel Sandbox (Firecracker microVM). Pre-warmed from a repo snapshot for near-instant startup. Agents cannot interfere with each other.' },
                { icon: <Code2 size={14} />, title: 'Context externalized, not stuffed',
                  body: 'Agents do not receive hundreds of files in their prompts. They write code to explore context: grep, find, cat. This is the RLM Pattern from MIT CSAIL, proven 2x more effective.' },
                { icon: <RefreshCw size={14} />, title: 'Agents collaborate at runtime',
                  body: 'When the Test Engineer finds a type error, that finding routes back to the Provider Engineer automatically. The vRLM runtime handles inter-agent communication.' },
              ].map(item => (
                <div key={item.title} className="flex gap-3 p-4 rounded-xl border border-white/[0.07] hover:border-white/15 transition-colors" style={{ background: 'var(--bg-card)' }}>
                  <div className="text-white/65 mt-0.5 shrink-0">{item.icon}</div>
                  <div>
                    <div className="text-white text-base font-semibold mb-1">{item.title}</div>
                    <div className="text-white/75 text-sm leading-relaxed">{item.body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Live terminal ─────────────────────────────────────── */}
      <section className="py-24 px-6" style={{ background: 'var(--bg-base)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <div className="text-xs font-mono text-white/65 uppercase tracking-widest mb-3">Live Preview</div>
            <h2 className="text-3xl font-bold mb-3 text-white">Watch the swarm execute</h2>
            <p className="text-white/75 text-base max-w-md mx-auto">
              Real output from a simulated run. The actual runtime produces identical event streams.
            </p>
          </div>
          <AnimatedTerminal />
          <div className="flex flex-wrap justify-center gap-5 mt-6">
            {[
              { dot: 'bg-yellow-400',  label: 'Root orchestrator' },
              { dot: 'bg-violet-400',  label: 'Shell execution' },
              { dot: 'bg-purple-300',  label: 'Worker agent' },
              { dot: 'bg-orange-400',  label: 'Inter-agent collaboration' },
              { dot: 'bg-emerald-400', label: 'Completion' },
            ].map(x => (
              <div key={x.label} className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${x.dot}`} />
                <span className="text-[11px] text-white/65 font-mono">{x.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Four foundations ──────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-white/[0.05]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-xs font-mono text-white/65 uppercase tracking-widest mb-3">Research Foundations</div>
            <h2 className="text-3xl font-bold mb-4 text-white">Four ideas. One system.</h2>
            <p className="text-white/75 text-base max-w-lg mx-auto">
              Agentnetes combines four research-backed patterns that individually improve agent performance
              and together create something qualitatively different.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <FeatureCard
              badge="MIT CSAIL"
              badgeColor="border-blue-500/40 text-blue-400"
              icon={<Layers size={15} />}
              title="RLM Pattern: Context lives in sandboxes"
              description="Recursive Language Model runtime. Instead of stuffing files into an agent's context window, context is externalized into a filesystem that agents explore programmatically."
              detail="Agents write small shell scripts to grep, find, and read exactly what they need. This keeps token footprints tiny regardless of codebase size and has been shown to outperform naive context-stuffing by 2x on software engineering benchmarks."
              code="agent.execute('grep -r LanguageModelV1 packages/ -l')"
              cite="Based on: RLM paper, MIT CSAIL -- externalized context via code execution"
            />
            <FeatureCard
              badge="Karpathy"
              badgeColor="border-purple-500/40 text-purple-400"
              icon={<RefreshCw size={15} />}
              title="AutoResearch Loop: Try, measure, keep"
              description="Agents do not write code and hope for the best. They write code, run tests, measure the result, and either keep the change or discard it and try again."
              detail="The Test Engineer runs vitest after every change. Type errors trigger re-implementation. Test failures trigger targeted patches. The loop runs until everything passes or the agent escalates to root."
              code="run tests -> check failures -> patch -> repeat"
              cite="Based on: AutoResearch pattern -- Andrej Karpathy"
            />
            <FeatureCard
              badge="MCP v2"
              badgeColor="border-emerald-500/40 text-emerald-400"
              icon={<Terminal size={15} />}
              title="Two-Tool MCP: search() and execute()"
              description="Each agent has exactly two tools exposed via MCP: search() for finding things in the codebase, and execute() for running shell commands in its sandbox."
              detail="This keeps the agent's tool surface to roughly 1,000 tokens regardless of task complexity. The agent writes arbitrary code against these two primitives. No tool proliferation. Just two powerful primitives that compose into anything."
              code="tools: [search(), execute()]  // ~1000 token footprint"
              cite="MCP protocol -- two-tool minimal surface strategy"
            />
            <FeatureCard
              badge="A2A Protocol"
              badgeColor="border-orange-500/40 text-orange-400"
              icon={<Shield size={15} />}
              title="A2A-Ready: Every agent is a publishable service"
              description="Every agent Agentnetes spawns generates a standard A2A Agent Card describing its capabilities, skills, and endpoints."
              detail="Today these cards are internal. Tomorrow any specialist agent can be published as an independent, discoverable service. A Provider Engineer becomes a reusable service any other system can call."
              code='GET /agents/provider-engineer/.well-known/agent.json'
              cite="A2A Protocol v1.0 -- Google Agent-to-Agent standard"
            />
          </div>
        </div>
      </section>

      {/* ── Tech stack ────────────────────────────────────────── */}
      <section className="py-24 px-6" style={{ background: 'var(--bg-base)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-xs font-mono text-white/65 uppercase tracking-widest mb-3">Stack</div>
            <h2 className="text-3xl font-bold mb-4 text-white">Built on the bleeding edge</h2>
            <p className="text-white/75 text-base max-w-lg mx-auto">
              Every layer is the latest available. No legacy versions. No compatibility shims.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {[
              {
                label: 'AI Runtime',
                items: [
                  { name: 'ai (Vercel AI SDK)', version: 'v7.0.0-beta.33', highlight: true },
                  { name: 'ToolLoopAgent', version: 'beta agent primitive', highlight: true },
                  { name: '@ai-sdk/gateway', version: 'v4.0.0-beta.18', highlight: false },
                ],
                note: 'ToolLoopAgent is the core primitive in AI SDK v7 beta. Each worker runs with search() + execute() MCP tools.',
              },
              {
                label: 'Sandbox',
                items: [
                  { name: '@vercel/sandbox', version: 'v1.9.0', highlight: false },
                  { name: 'Firecracker microVMs', version: 'hardware isolation', highlight: false },
                  { name: 'Snapshot pre-warming', version: 'sub-second startup', highlight: false },
                ],
                note: 'Each agent gets its own Firecracker VM from a pre-warmed snapshot of the target repo.',
              },
              {
                label: 'Models',
                items: [
                  { name: 'Gemini 2.5 Pro', version: 'planner -- deep reasoning', highlight: true },
                  { name: 'Gemini 2.5 Flash', version: 'workers -- fast + cheap', highlight: true },
                  { name: 'Claude Opus / GPT-4o', version: 'switchable via Gateway', highlight: false },
                ],
                note: 'Model speciation: planner uses a more capable model, workers use a faster model.',
              },
            ].map(group => (
              <div key={group.label} className="rounded-2xl border border-white/10 p-5" style={{ background: 'var(--bg-card)' }}>
                <div className="text-[10px] font-mono text-white/65 uppercase tracking-wider mb-4">{group.label}</div>
                <div className="space-y-2">
                  {group.items.map(item => <StackBadge key={item.name} {...item} />)}
                </div>
                <div className="text-[11px] text-white/65 font-mono mt-4 leading-relaxed">{group.note}</div>
              </div>
            ))}
          </div>

          {/* Code snippet */}
          <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: 'var(--bg-panel)' }}>
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
              <span className="text-[10px] font-mono text-white/65">lib/vrlm/agent-factory.ts</span>
            </div>
            <div className="p-5 font-mono text-[12px] leading-7 overflow-x-auto">
              <div><span className="text-white/65">// Each worker: two tools, one sandbox, emergent role</span></div>
              <div className="mt-1.5">
                <span className="text-violet-400">const</span>
                <span className="text-white"> agent </span>
                <span className="text-white/75">=</span>
                <span className="text-white"> new </span>
                <span className="text-pink-400">ToolLoopAgent</span>
                <span className="text-white">{'({'}</span>
              </div>
              <div className="pl-6"><span className="text-white/70">model: </span><span className="text-orange-400">gateway</span><span className="text-white">('google/gemini-2.5-flash'),</span></div>
              <div className="pl-6"><span className="text-white/70">tools: </span><span className="text-white">{'{ '}</span><span className="text-emerald-400">search</span><span className="text-white">, </span><span className="text-emerald-400">execute</span><span className="text-white"> {'}'},</span></div>
              <div className="pl-6"><span className="text-white/70">stopCondition: </span><span className="text-orange-400">stepCountIs</span><span className="text-white">(40),</span></div>
              <div className="pl-6"><span className="text-white/70">system: </span><span className="text-white">buildWorkerPrompt(task),</span></div>
              <div><span className="text-white">{'});'}</span></div>
              <div className="mt-2"><span className="text-white/65">// Stream events back to the vRLM orchestrator</span></div>
              <div>
                <span className="text-violet-400">for await </span>
                <span className="text-white">(</span>
                <span className="text-violet-400">const </span>
                <span className="text-white">event </span>
                <span className="text-violet-400">of </span>
                <span className="text-white">agent.</span>
                <span className="text-pink-400">stream</span>
                <span className="text-white">()) {'{ ... }'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-white/[0.05]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-xs font-mono text-white/65 uppercase tracking-widest mb-3">How It Works</div>
            <h2 className="text-3xl font-bold mb-4 text-white">From one sentence to working code</h2>
            <p className="text-white/75 text-base max-w-md mx-auto">
              The full pipeline from goal input to delivered artifacts
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-7">
            <Step n="01" accent="border-gray-700 text-white/65"
              title="You give a goal"
              body="Type what you want built. Not instructions on how. Just what. Agentnetes figures out the rest. The goal can reference a GitHub repo or an uploaded codebase." />
            <Step n="02" accent="border-yellow-500/40 text-yellow-500/80"
              title="Root agent explores"
              body="The Tech Lead spawns a Firecracker sandbox pre-warmed with the target repo. It uses grep, find, and cat to map the architecture. Context lives in the filesystem, not the prompt." />
            <Step n="03" accent="border-blue-500/40 text-blue-400/80"
              title="Team self-assembles"
              body="Based on what it finds, the root agent invents the team. Roles, goals, and dependencies are all emergent. A provider task gets different specialists than a security audit." />
            <Step n="04" accent="border-violet-500/40 text-violet-400/80"
              title="Agents work in parallel"
              body="Each specialist runs concurrently in its own Firecracker microVM. They explore, write code, run tests, and fix failures. No sequential bottlenecks." />
            <Step n="05" accent="border-orange-500/40 text-orange-400/80"
              title="Agents collaborate"
              body="Test failures and findings route back to the right specialist automatically. The vRLM runtime handles inter-agent communication. No human needed to relay." />
            <Step n="06" accent="border-emerald-500/40 text-emerald-400/80"
              title="Synthesis and delivery"
              body="The root agent collects all artifacts, verifies completeness, and streams a structured summary to the UI with every generated file. Each agent publishes an A2A card." />
          </div>
        </div>
      </section>

      {/* ── Model section ─────────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-white/[0.05]" style={{ background: 'var(--bg-base)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-xs font-mono text-white/65 uppercase tracking-widest mb-3">AI Gateway</div>
              <h2 className="text-3xl font-bold mb-4 text-white">Any model. Same swarm.</h2>
              <p className="text-white/70 text-lg leading-relaxed mb-6">
                Agentnetes routes all model calls through Vercel AI Gateway.
                Switch the planner or worker model from the UI without changing a line of code.
              </p>
              <div className="space-y-3">
                {[
                  { label: 'Single endpoint for all providers', done: true },
                  { label: 'Model speciation (planner vs workers)', done: true },
                  { label: 'BYOK via gateway providerOptions', done: true },
                  { label: 'Fallback chain on rate limit', done: false },
                ].map(x => (
                  <div key={x.label} className="flex items-center gap-2.5">
                    {x.done
                      ? <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                      : <div className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0" />}
                    <span className={`text-base ${x.done ? 'text-white/80' : 'text-white/65'}`}>{x.label}</span>
                    {!x.done && <span className="text-[9px] font-mono text-white/50 border border-white/20 rounded px-1">soon</span>}
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Gemini 2.5 Pro',   role: 'Planner (default)',     color: 'border-violet-500/30 bg-violet-500/5', badge: 'recommended' },
                { label: 'Gemini 2.5 Flash',  role: 'Workers (default)',     color: 'border-blue-400/20 bg-blue-400/5',     badge: 'fast' },
                { label: 'Claude Opus 4.5',   role: 'Planner alternative',   color: 'border-orange-500/20 bg-orange-500/5', badge: '' },
                { label: 'GPT-4o',            role: 'Planner alternative',   color: 'border-emerald-500/20 bg-emerald-500/5', badge: '' },
              ].map(m => (
                <div key={m.label} className={`flex items-center gap-3 border rounded-xl px-4 py-3 ${m.color}`}>
                  <div className="flex-1">
                    <div className="text-white text-base font-medium">{m.label}</div>
                    <div className="text-white/65 text-xs font-mono mt-0.5">{m.role}</div>
                  </div>
                  {m.badge && (
                    <span className="text-[9px] font-mono text-white/65 border border-white/10 rounded px-1.5 py-0.5">{m.badge}</span>
                  )}
                </div>
              ))}
              <div className="rounded-xl border border-white/10 px-4 py-3 font-mono text-[11px]" style={{ background: 'var(--bg-panel)' }}>
                <span className="text-white/65">createGatewayProvider{'({'}</span><br />
                <span className="text-white/65">{'  '}apiKey: </span><span className="text-violet-400">process.env.GATEWAY_API_KEY</span><br />
                <span className="text-white/65">{'}'});</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-white/[0.05]">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-2xl border border-white/10 p-12 text-center relative overflow-hidden" style={{
            background: 'linear-gradient(135deg, rgba(168,85,247,0.06) 0%, rgba(236,72,153,0.04) 50%, rgba(249,115,22,0.06) 100%)',
          }}>
            <div className="flex justify-center mb-5">
              <Image src="/favicon.png" alt="Agentnetes" width={48} height={48} className="rounded-xl" />
            </div>
            <div className="text-xs font-mono text-white/65 uppercase tracking-widest mb-4">Try it now</div>
            <h2 className="text-2xl font-bold mb-3 text-white">See the swarm execute</h2>
            <p className="text-white/75 text-base mb-8 max-w-sm mx-auto leading-relaxed">
              Give it a goal. Watch specialist agents spawn, explore, implement, test,
              and deliver inside isolated sandboxes. Under 90 seconds.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/demo"
                className="flex items-center gap-2 font-semibold px-8 py-3 rounded-xl text-base transition-all hover:opacity-90 hover:scale-[1.02]"
                style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899, #f97316)', color: '#fff' }}>
                Launch demo <ArrowRight size={14} />
              </Link>
              <Link href="/demo?mode=simulation"
                className="flex items-center gap-2 border border-white/15 text-white/70 px-8 py-3 rounded-xl hover:border-white/30 hover:text-white transition-all text-base">
                Simulation mode
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.05] py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <Logo size={22} />
            <div>
              <div className="font-bold text-base text-white">Agentnetes</div>
              <div className="text-white/65 text-xs font-mono">Zero to Agent London 2026</div>
            </div>
          </div>
          <div className="text-white/50 text-sm font-mono text-center">
            Zero to Agent London · Google DeepMind x Vercel · 2026
          </div>
          <div className="flex items-center gap-5">
            <Link href="/demo" className="text-white/65 hover:text-white/80 transition-colors text-sm">Demo</Link>
            <a href="https://cerebralvalley.ai/e/zero-to-agent-london" target="_blank" rel="noreferrer"
              className="flex items-center gap-1 text-white/65 hover:text-white/80 transition-colors text-sm">
              Hackathon <ExternalLink size={10} />
            </a>
            <a href="https://github.com/Shashikant86/agentnetes" target="_blank" rel="noreferrer"
              className="text-white/65 hover:text-white/80 transition-colors">
              <Github size={14} />
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}
