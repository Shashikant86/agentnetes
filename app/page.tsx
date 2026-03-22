'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState, useRef } from 'react';
import {
  ArrowRight, Github, Zap, Shield, GitBranch, Layers,
  Terminal, ExternalLink, CheckCircle2, ChevronRight,
  Box, Network, Code2, RefreshCw, Sun, Moon,
  Target, Split, Users, MessageSquare, CheckCheck,
  ChevronDown,
} from 'lucide-react';
import { useTheme } from 'next-themes';

// ── Scroll-triggered fade-in ────────────────────────────────────
function useFadeIn() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    document.querySelectorAll('.fade-in-section, .stagger-children').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

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

const CYCLING_WORDS = [
  'Self-Organizing',
  'On Demand',
  'Self-Replicating',
  'Self-Learning',
  'Self-Resilient',
];

function CyclingWord() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex(i => (i + 1) % CYCLING_WORDS.length);
        setVisible(true);
      }, 400);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <span
      className="inline-block transition-all duration-300 gradient-text"
      style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(-8px)' }}>
      {CYCLING_WORDS[index]}
    </span>
  );
}

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
    <div className="rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-black/20" style={{ background: 'var(--bg-panel)' }}>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
        <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
        <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
        <span className="w-3 h-3 rounded-full bg-[#28c840]" />
        <span className="ml-3 text-sm text-white/80 font-mono flex-1">agentnetes -- vRLM runtime</span>
        {visibleCount >= TERMINAL_LINES.length && (
          <button onClick={() => setVisibleCount(0)} className="text-white/80 hover:text-white transition-colors">
            <RefreshCw size={11} />
          </button>
        )}
      </div>
      <div ref={containerRef} className="p-5 font-mono text-sm leading-6 space-y-0.5 overflow-y-auto" style={{ height: '290px', background: 'var(--bg-panel)' }}>
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
    if (del && chars === 0) {
      const t = setTimeout(() => {
        setDel(false);
        setIdx(i => (i + 1) % PROMPTS.length);
      }, 0);
      return () => clearTimeout(t);
    }
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

// How It Works, interactive pipeline
const HOW_STEPS = [
  {
    id: 'goal',
    shortLabel: 'Define Goal',
    icon: Target,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    border: 'border-blue-400/30',
    glow: 'shadow-blue-400/20',
    title: 'User defines the goal',
    desc: 'A single goal starts the run. The system treats it as the source of truth for the team that will be created.',
    detail: (
      <div className="space-y-3">
        <div className="rounded-xl border border-white/10 overflow-hidden" style={{ background: 'var(--bg-panel)' }}>
          <div className="flex items-center gap-2 px-4 py-2 border-b border-white/[0.06]">
            <span className="w-2 h-2 rounded-full bg-blue-400/60" />
            <span className="text-xs font-mono text-white/40">goal input</span>
          </div>
          <div className="px-4 py-3 font-mono text-sm">
            <span className="text-white/40">$ </span>
            <span className="text-emerald-400">agentnetes run</span>
            <span className="text-violet-300"> &quot;Ship a production ready billing portal&quot;</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Goal', value: 'defined' },
            { label: 'Priority', value: 'high' },
            { label: 'Scope', value: 'multi-agent' },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-white/[0.06] px-3 py-3" style={{ background: 'var(--bg-subtle)' }}>
              <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-white/30">{item.label}</div>
              <div className="mt-1 text-sm font-semibold text-white/80">{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'root',
    shortLabel: 'Decompose Tasks',
    icon: Split,
    color: 'text-violet-400',
    bg: 'bg-violet-400/10',
    border: 'border-violet-400/30',
    glow: 'shadow-violet-400/20',
    title: 'Root agent decomposes the task',
    desc: 'The root agent reads the goal, frames the work, and breaks it into clear task units with ownership.',
    detail: (
      <div className="space-y-3">
        <div className="rounded-xl border border-white/[0.08] px-4 py-4" style={{ background: 'var(--bg-panel)' }}>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Split size={14} className="text-white/70" />
              <span className="text-sm font-mono font-semibold text-white/80">root agent planner</span>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-white/30">analysis pass</span>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
            {[
              'read goal',
              'analyze constraints',
              'decompose work',
              'assign ownership',
            ].map((label) => (
              <div key={label} className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-2 py-3 text-white/65">
                {label}
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          {[
            'Map surfaces: UI, backend, tests, rollout',
            'Identify blockers, dependencies, and validation',
            'Create work packets for specialists',
          ].map((item) => (
            <div key={item} className="flex items-center gap-3 rounded-lg border border-white/[0.06] px-4 py-2.5" style={{ background: 'var(--bg-panel)' }}>
              <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
              <span className="text-sm text-white/65">{item}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'team',
    shortLabel: 'Spawn Agent Teams',
    icon: Users,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    border: 'border-emerald-400/30',
    glow: 'shadow-emerald-400/20',
    title: 'Root agent spawns agent teams on demand',
    desc: 'Agent teams are created only when needed. The root agent spawns the exact specialists required for the goal.',
    detail: (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {[
            { name: 'Planner', status: 'active', note: 'holds the goal and plan' },
            { name: 'Frontend', status: 'spawned', note: 'owns product UI work' },
            { name: 'Runtime', status: 'spawned', note: 'owns APIs and state' },
            { name: 'Verifier', status: 'spawned', note: 'owns tests and checks' },
          ].map(({ name, status, note }) => (
            <div key={name} className="rounded-xl border border-white/[0.06] p-3" style={{ background: 'var(--bg-panel)' }}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-white/80">{name}</span>
                <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.14em] text-white/35">{status}</span>
              </div>
              <div className="mt-2 text-xs text-white/45">{note}</div>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-white/[0.06] px-4 py-3" style={{ background: 'var(--bg-subtle)' }}>
          <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-white/30">team behavior</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {['self organizing', 'elastic team size', 'spawned on demand'].map((item) => (
              <span key={item} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-white/55">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'sandbox',
    shortLabel: 'Sandbox + RLM',
    icon: Box,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    border: 'border-emerald-400/30',
    glow: 'shadow-emerald-400/20',
    title: 'Each agent gets sandbox and enters the RLM loop',
    desc: 'Every agent gets its own sandbox, coding agent, context, and a live RLM loop for execution and verification.',
    detail: (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {[
            { name: 'Frontend', context: 'design tokens, routes, UI constraints' },
            { name: 'Runtime', context: 'schemas, APIs, repo state' },
            { name: 'Verifier', context: 'test plan, acceptance checks' },
            { name: 'Researcher', context: 'docs, patterns, prior findings' },
          ].map(({ name, context }) => (
            <div key={name} className="rounded-xl border border-white/[0.06] overflow-hidden" style={{ background: 'var(--bg-panel)' }}>
              <div className="flex items-center gap-2 border-b border-white/[0.04] px-3 py-2">
                <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
                <span className="text-xs font-mono font-semibold text-white/65">{name}</span>
              </div>
              <div className="space-y-1.5 px-3 py-3 text-[11px] font-mono text-white/45">
                <div>firecracker sandbox</div>
                <div>coding agent attached</div>
                <div>external vars mounted</div>
                <div className="text-white/35">{context}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] px-4 py-2.5" style={{ background: 'var(--bg-subtle)' }}>
          <Shield size={14} className="text-white/60 shrink-0" />
          <span className="text-xs text-white/55">
            Isolated sandboxes keep work clean. The team shares findings, not a shared filesystem or a stuffed context window.
          </span>
        </div>
      </div>
    ),
  },
  {
    id: 'research',
    shortLabel: 'Auto Research',
    icon: RefreshCw,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    border: 'border-blue-400/30',
    glow: 'shadow-blue-400/20',
    title: 'Auto research technique kicks in',
    desc: 'Agents search, read, execute, and verify repeatedly so each task can improve as new information arrives.',
    detail: (
      <div className="space-y-3">
        <div className="rounded-xl border border-white/[0.06] overflow-hidden" style={{ background: 'var(--bg-panel)' }}>
          <div className="flex items-center gap-2 px-4 py-2 border-b border-white/[0.04]">
            <span className="w-1.5 h-1.5 rounded-full bg-white/50 animate-pulse" />
            <span className="text-xs font-mono font-semibold text-white/70">runtime specialist</span>
            <span className="text-[10px] font-mono text-white/25 ml-auto">rlm iteration 3 of 5</span>
          </div>
          <div className="px-4 py-3 space-y-2 font-mono text-sm">
            {[
              ['search', 'scan handlers, routes, and existing billing code'],
              ['read', 'load the relevant files and prior findings'],
              ['think', 'pick the safest pattern for this repo'],
              ['execute', 'write code, run checks, capture output'],
              ['verify', 'confirm the result before reporting back'],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center gap-3">
                <span className="w-14 shrink-0 text-xs uppercase tracking-[0.14em] text-white/40">{label}</span>
                <span className="text-white/55">{value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-white/[0.06] px-3 py-3 text-center" style={{ background: 'var(--bg-subtle)' }}>
            <div className="text-sm font-mono font-semibold text-white/75">Auto research</div>
            <div className="mt-1 text-[11px] text-white/40">repo search, docs, prior outputs</div>
          </div>
          <div className="rounded-lg border border-white/[0.06] px-3 py-3 text-center" style={{ background: 'var(--bg-subtle)' }}>
            <div className="text-sm font-mono font-semibold text-white/75">Closed loop</div>
            <div className="mt-1 text-[11px] text-white/40">plan, act, verify, refine</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'collaborate',
    shortLabel: 'Collaborate + A2A',
    icon: MessageSquare,
    color: 'text-orange-400',
    bg: 'bg-orange-400/10',
    border: 'border-orange-400/30',
    glow: 'shadow-orange-400/20',
    title: 'Agents collaborate, learn, and expose A2A',
    desc: 'Agents share findings, learn from each other, and coordinate through collaboration patterns with A2A shown as work in progress.',
    detail: (
      <div className="space-y-3">
        <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-xl border border-white/[0.06] overflow-hidden" style={{ background: 'var(--bg-panel)' }}>
            <div className="flex items-center gap-2 px-4 py-2 border-b border-white/[0.04]">
              <MessageSquare size={12} className="text-white/65" />
              <span className="text-xs font-mono text-white/65 font-semibold">team collaboration stream</span>
            </div>
            <div className="px-4 py-3 space-y-2 text-sm font-mono">
              {[
                'Researcher found an existing auth pattern and shared it with Runtime',
                'Verifier reported a failing edge case and Frontend patched the flow',
                'Root agent updated the plan after the new findings landed',
              ].map((item) => (
                <div key={item} className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-white/60">
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-white/[0.06] p-4" style={{ background: 'var(--bg-subtle)' }}>
            <div className="flex items-center gap-2">
              <Network size={14} className="text-white/60" />
              <span className="text-sm font-mono font-semibold text-white/75">A2A card</span>
            </div>
            <div className="mt-3 rounded-xl border border-dashed border-white/12 px-3 py-4 text-center">
              <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-white/30">status</div>
              <div className="mt-2 text-sm font-semibold text-white/70">work in progress</div>
              <div className="mt-2 text-xs text-white/45">Agent to agent coordination is visible in the system design and still evolving.</div>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {['self healing', 'shared learning', 'resilient coordination'].map((item) => (
            <span key={item} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-white/55">
              {item}
            </span>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'deliver',
    shortLabel: 'Deliver',
    icon: CheckCheck,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    border: 'border-emerald-400/30',
    glow: 'shadow-emerald-400/20',
    title: 'One goal achieved, results come back to the user',
    desc: 'The root agent gathers the outputs, validates the work, and returns a complete result back to the user.',
    detail: (
      <div className="space-y-3">
        <div className="rounded-xl border border-white/[0.08] overflow-hidden" style={{ background: 'var(--bg-panel)' }}>
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.03]">
            <CheckCheck size={14} className="text-white/75" />
            <span className="text-sm font-semibold text-white/80 font-mono">result package</span>
            <span className="text-xs text-white/35 ml-auto font-mono">47s, 4 agents, verified</span>
          </div>
          <div className="px-4 py-3 space-y-2 text-sm">
            {[
              'Working code and updated files',
              'Checks, tests, and validation summary',
              'Open issues or follow ups if any remain',
              'A clean result returned to the user',
            ].map((item) => (
              <div key={item} className="flex items-start gap-2">
                <span className="text-white/60 mt-0.5">✓</span>
                <span className="text-white/65">{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            'self organizing',
            'self healing',
            'self resilient',
          ].map((item) => (
            <div key={item} className="rounded-xl border border-white/[0.06] px-3 py-3 text-center" style={{ background: 'var(--bg-subtle)' }}>
              <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-white/30">team</div>
              <div className="mt-1 text-sm font-semibold text-white/75">{item}</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

const HOW_STEP_TAGS: Record<string, string[]> = {
  goal: ['one goal', 'clear intent', 'user input'],
  root: ['analyze', 'decompose', 'plan'],
  team: ['on demand', 'specialists', 'elastic'],
  sandbox: ['isolated', 'coder attached', 'external context'],
  research: ['auto research', 'RLM loop', 'verify'],
  collaborate: ['shared findings', 'A2A WIP', 'learn together'],
  deliver: ['verified output', 'results back', 'complete'],
};

function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const progress = ((activeStep + 1) / HOW_STEPS.length) * 100;

  // Start autoplay when section comes into view
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasBeenVisible) {
          setHasBeenVisible(true);
          setIsAutoPlaying(true);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasBeenVisible]);

  // Autoplay timer
  useEffect(() => {
    if (!isAutoPlaying) return;
    const t = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % HOW_STEPS.length);
    }, 2200);
    return () => clearInterval(t);
  }, [isAutoPlaying]);

  function handleStepClick(i: number) {
    setActiveStep(i);
    setIsAutoPlaying(true);
  }

  function getStageClass(index: number) {
    if (index === activeStep) {
      return 'text-white shadow-[0_20px_60px_rgba(0,0,0,0.22)] scale-[1.02]';
    }
    if (index < activeStep) {
      return 'border-white/10 bg-white/[0.04] text-white/75';
    }
    return 'border-white/[0.06] bg-white/[0.02] text-white/40';
  }

  return (
    <section ref={sectionRef} className="py-24 px-6 relative overflow-hidden">
      <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-40 pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(var(--fg), 0.035), transparent)' }} />
      <div className="max-w-5xl mx-auto mb-0"><hr className="gradient-divider" /></div>
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="text-sm font-mono text-white/65 uppercase tracking-[0.24em] mb-3">How It Works</div>
          <h2 className="text-4xl font-bold mb-4 text-white">From one goal to a working team.</h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto leading-relaxed mb-4">
            An animated infographic that keeps moving. Click any stage to jump in.
          </p>
          <div className="inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[11px] font-mono uppercase tracking-[0.18em] text-white/45">
            {['Goal', 'Decompose', 'Teams', 'Sandbox + RLM', 'Auto Research', 'Collaborate + A2A', 'Deliver'].map((label, index) => (
              <span key={label} className="inline-flex items-center gap-2">
                <span>{label}</span>
                {index < 6 && <span className="text-white/20">/</span>}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] border border-white/[0.08] p-5 md:p-7" style={{ background: 'linear-gradient(180deg, rgba(var(--fg), 0.04), rgba(var(--fg), 0.02))' }}>
          <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-2xl font-semibold text-white">{HOW_STEPS[activeStep].title}</div>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/50">{HOW_STEPS[activeStep].desc}</p>
            </div>
            <div className="min-w-[220px]">
              <div className="mb-2 flex items-center justify-end text-[10px] font-mono uppercase tracking-[0.18em] text-white/35">
                <span>{String(activeStep + 1).padStart(2, '0')} / {String(HOW_STEPS.length).padStart(2, '0')}</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${progress}%`,
                    background: activeStep <= 1
                      ? 'linear-gradient(90deg, rgba(96,165,250,0.9), rgba(168,85,247,0.75))'
                      : activeStep <= 3
                        ? 'linear-gradient(90deg, rgba(16,185,129,0.9), rgba(96,165,250,0.7))'
                        : 'linear-gradient(90deg, rgba(168,85,247,0.75), rgba(251,146,60,0.7))',
                  }}
                />
              </div>
            </div>
          </div>

          <div className="hidden xl:flex xl:items-center xl:gap-3">
            {HOW_STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === activeStep;
              const isDone = index < activeStep;
              return (
                <div key={step.id} className="flex min-w-0 flex-1 items-center gap-3">
                  <button
                    onClick={() => handleStepClick(index)}
                    className={`min-w-[126px] flex-1 rounded-2xl border p-4 text-left transition-all duration-500 ${getStageClass(index)} ${
                      isActive ? `${step.border} ${step.bg}` : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-2xl border transition-all duration-500 ${
                        isActive ? `${step.border} ${step.bg}` : 'border-white/10 bg-white/[0.03]'
                      }`}>
                        <Icon size={16} className={isActive ? step.color : 'text-white/55'} />
                      </div>
                      <div className={`h-2.5 w-2.5 rounded-full ${isActive ? 'bg-white animate-pulse' : isDone ? 'bg-white/55' : 'bg-white/15'}`} />
                    </div>
                    <div className="mt-4 text-sm font-semibold">{step.shortLabel}</div>
                  </button>
                  {index < HOW_STEPS.length - 1 && (
                    <div className={`process-flow ${index < activeStep ? 'is-active' : ''}`} aria-hidden="true">
                      <span className="process-flow-dot" style={{ animationDelay: `${index * 0.12}s` }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="grid gap-3 xl:hidden">
            {HOW_STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === activeStep;
              const isDone = index < activeStep;
              return (
                <div key={step.id}>
                  <button
                    onClick={() => handleStepClick(index)}
                    className={`w-full rounded-2xl border p-4 text-left transition-all duration-500 ${getStageClass(index)} ${
                      isActive ? `${step.border} ${step.bg}` : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${
                          isActive ? `${step.border} ${step.bg}` : 'border-white/10 bg-white/[0.03]'
                        }`}>
                          <Icon size={16} className={isActive ? step.color : 'text-white/55'} />
                        </div>
                        <div className="text-sm font-semibold text-white/80">{step.title}</div>
                      </div>
                      <div className={`h-2.5 w-2.5 rounded-full ${isActive ? 'bg-white animate-pulse' : isDone ? 'bg-white/55' : 'bg-white/15'}`} />
                    </div>
                  </button>
                  {index < HOW_STEPS.length - 1 && (
                    <div className={`process-flow-vertical ${index < activeStep ? 'is-active' : ''}`} aria-hidden="true">
                      <span className="process-flow-dot-vertical" style={{ animationDelay: `${index * 0.12}s` }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_220px]">
            <div className="rounded-[28px] border border-white/[0.08] p-5" style={{ background: 'var(--bg-panel)' }}>
              <div className="flex items-center gap-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${HOW_STEPS[activeStep].border} ${HOW_STEPS[activeStep].bg}`}>
                  {(() => {
                    const Icon = HOW_STEPS[activeStep].icon;
                    return <Icon size={18} className={HOW_STEPS[activeStep].color} />;
                  })()}
                </div>
                <div>
                  <div className="text-lg font-semibold text-white">{HOW_STEPS[activeStep].title}</div>
                </div>
              </div>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/55">
                {HOW_STEPS[activeStep].desc}
              </p>
            </div>

            <div className="rounded-[28px] border border-white/[0.08] p-5" style={{ background: 'var(--bg-panel)' }}>
              <div className="mt-3 flex flex-wrap gap-2">
                {HOW_STEP_TAGS[HOW_STEPS[activeStep].id].map((item) => (
                  <span key={item} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-white/55">
                    {item}
                  </span>
                ))}
              </div>
              <div className="mt-4 rounded-2xl border border-white/[0.06] px-3 py-3 text-xs text-white/45" style={{ background: 'var(--bg-subtle)' }}>
                self organizing
                <br />
                self healing
                <br />
                self resilient
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Architecture diagram ─────────────────────────────────────────
function ArchDiagram() {
  return (
    <div className="rounded-2xl border border-white/10 p-7 glass-card">
      <div className="flex justify-center mb-5">
        <div className="flex items-center gap-2 border border-white/10 rounded-xl px-5 py-2.5 bg-white/5">
          <span className="text-emerald-400 text-sm font-mono">goal:</span>
          <span className="text-violet-400 text-sm font-mono">&quot;Add @ai-sdk/deepseek provider&quot;</span>
        </div>
      </div>
      <div className="flex justify-center mb-3">
        <div className="w-px h-5 bg-white/10" />
      </div>
      <div className="flex justify-center mb-3">
        <div className="border border-white/15 bg-white/[0.03] rounded-xl px-5 py-3 text-center">
          <div className="text-violet-400 text-sm font-mono font-semibold">Root Agent / Tech Lead</div>
          <div className="text-white/75 text-sm mt-0.5 font-mono"><span className="text-blue-400">Gemini 2.5 Pro</span> via AI Gateway</div>
          <div className="flex items-center justify-center gap-1.5 mt-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
            <span className="text-orange-400 text-sm font-mono">vRLM orchestrator</span>
          </div>
        </div>
      </div>
      <div className="flex justify-center gap-14 mb-3">
        {[0,1,2,3].map(i => <div key={i} className="w-px h-5 bg-white/10" />)}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { icon: '🔍', label: 'Architecture Scout',  tool: 'search()', toolColor: 'text-emerald-400' },
          { icon: '⚙️', label: 'Provider Engineer',   tool: 'execute()', toolColor: 'text-emerald-400' },
          { icon: '🧪', label: 'Test Engineer',        tool: 'execute()', toolColor: 'text-emerald-400' },
          { icon: '📦', label: 'Package Engineer',     tool: 'execute()', toolColor: 'text-emerald-400' },
        ].map(a => (
          <div key={a.label} className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-center">
            <div className="text-lg mb-1">{a.icon}</div>
            <div className="text-violet-400 text-sm font-medium leading-tight">{a.label}</div>
            <div className="text-blue-400/60 text-sm font-mono mt-1">Gemini 2.5 Flash</div>
            <div className="mt-2 flex items-center justify-center gap-1">
              <span className="w-1 h-1 rounded-full bg-emerald-400/50" />
              <span className={`${a.toolColor} text-sm font-mono`}>{a.tool}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-white/5 pt-4 flex flex-wrap justify-center gap-5">
        <span className="text-sm font-mono text-white/65"><span className="text-orange-400">Firecracker</span> microVM per agent</span>
        <span className="text-sm font-mono text-white/65"><span className="text-emerald-400">search()</span> + <span className="text-emerald-400">execute()</span> MCP only</span>
        <span className="text-sm font-mono text-white/65"><span className="text-violet-400">SSE</span> event stream to UI</span>
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
    <div className="group rounded-2xl border border-white/10 p-6 hover:border-white/20 flex flex-col gap-4 card-hover" style={{ background: 'var(--bg-card)' }}>
      <div className="flex items-start justify-between">
        <div className="text-sm font-mono px-2 py-0.5 rounded border border-white/15 text-white/60">{badge}</div>
        <div className="text-white/80 group-hover:text-white transition-colors">{icon}</div>
      </div>
      <div>
        <h3 className="text-white font-semibold text-base mb-2">{title}</h3>
        <p className="text-white/85 text-lg leading-relaxed mb-3">{description}</p>
        <p className="text-white/80 text-lg leading-relaxed">{detail}</p>
      </div>
      {code && (
        <div className="rounded-lg bg-black/40 border border-white/[0.06] px-3 py-2.5 font-mono text-sm text-violet-300 overflow-x-auto">
          {code}
        </div>
      )}
      {cite && (
        <div className="text-sm text-white/75 font-mono border-t border-white/5 pt-3">{cite}</div>
      )}
    </div>
  );
}

// ── Stack badge ──────────────────────────────────────────────────
function StackBadge({ name, version, highlight }: { name: string; version: string; highlight?: boolean }) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 border rounded-xl px-4 py-3 ${highlight ? 'border-white/15 bg-white/[0.03]' : 'border-white/[0.08]'}`} style={highlight ? {} : { background: 'var(--bg-subtle)' }}>
      <div className="text-white font-semibold text-sm">{name}</div>
      <div className="text-violet-400/70 text-sm font-mono">{version}</div>
    </div>
  );
}

// ── Step ─────────────────────────────────────────────────────────
function Step({ n, title, body, accent }: { n: string; title: string; body: string; accent: string }) {
  return (
    <div className="flex gap-4">
      <div className={`shrink-0 w-8 h-8 rounded-full border flex items-center justify-center text-sm font-mono mt-0.5 ${accent}`}>{n}</div>
      <div className="pt-0.5">
        <h4 className="text-white font-semibold text-base mb-1.5">{title}</h4>
        <p className="text-white/90 text-lg leading-relaxed">{body}</p>
      </div>
    </div>
  );
}

// ── Theme toggle ─────────────────────────────────────────────────
function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);
  if (!mounted) return <div className="w-9 h-9" />;
  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-lg border border-white/15 text-white/80 hover:text-white hover:border-white/30 transition-all"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}

// ── Logo ─────────────────────────────────────────────────────────
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

function Logo({ size = 28 }: { size?: number }) {
  return (
    <Image
      src={`${BASE}/favicon.png`}
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
  useFadeIn();
  return (
    <div className="overflow-x-hidden" style={{ fontFamily: "'Inter', sans-serif", background: 'var(--bg-base)', color: 'rgb(var(--fg))' }}>

      {/* ── Nav ─────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/[0.06] backdrop-blur-xl" style={{ background: 'color-mix(in srgb, var(--bg-base) 90%, transparent)' }}>
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Logo size={36} />
            <span className="font-bold tracking-tight text-white">Agentnetes</span>
            <span className="text-sm font-mono text-white/80 border border-white/15 rounded px-2 py-0.5 uppercase tracking-wider hidden sm:inline">
              Kubernetes-inspired Agent Orchestration
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/docs" className="text-white/80 hover:text-white transition-colors text-sm hidden sm:block">
              Docs
            </Link>
            <a href="https://github.com/Shashikant86/agentnetes" target="_blank" rel="noreferrer"
              className="text-white/80 hover:text-white transition-colors p-1">
              <Github size={16} />
            </a>
            <Link href="/demo"
              className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg transition-all bg-white text-black hover:bg-white/90">
              Try Demo <ArrowRight size={11} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="pt-28 pb-20 px-6 relative overflow-hidden ambient-orb orb-purple noise-overlay" style={{ backgroundColor: '#000000' }}>

        <div className="max-w-4xl mx-auto text-center relative z-10">

          {/* Kicker */}
          <div className="flex flex-col items-center gap-2 mb-6">
            <div className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-mono border border-white/10"
              style={{ background: 'var(--bg-subtle)' }}>
              <span className="text-white/90 font-semibold">Self-Organizing AI Agent Swarms. On Demand.</span>
            </div>
            <div className="text-sm font-mono text-white/60">
              <span className="text-emerald-400 font-semibold">k8s</span> orchestrates containers.{' '}
              <span className="text-violet-400 font-semibold">a8s</span> orchestrates AI agents.
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-5 leading-[1.05] text-glow">
            <span className="text-white">Zero to a</span>
            <br />
            <span className="text-white"><CyclingWord /></span>
            <br />
            <span className="text-white">AI Agency.</span>
          </h1>

          <p className="text-white/75 text-lg mb-4 max-w-2xl mx-auto leading-relaxed font-medium">
            Type a goal. Agentnetes forms a dynamic team of specialist agents, roles invented on the fly, each running in its own isolated sandbox with the repo pre-cloned.
          </p>
          <p className="text-white/80 text-base mb-4 max-w-xl mx-auto leading-relaxed">
            No static agent configs. No stuffed context windows. The team assembles itself, works in parallel, and delivers together.
          </p>

          {/* Motivation pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {[
              { label: 'RLM Pattern', sub: 'MIT CSAIL', color: 'text-blue-400' },
              { label: 'AutoResearch Loop', sub: 'Karpathy', color: 'text-violet-400' },
              { label: 'Two-Tool MCP', sub: 'search() + execute()', color: 'text-emerald-400' },
              { label: 'A2A Protocol', sub: 'Google Agent-to-Agent', color: 'text-orange-400' },
            ].map(({ label, sub, color }) => (
              <div key={label} className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-mono"
                style={{ background: 'var(--bg-subtle)' }}>
                <span className={`font-semibold ${color}`}>{label}</span>
                <span className="text-white/50">{sub}</span>
              </div>
            ))}
          </div>

          {/* Typing prompt */}
          <div className="inline-flex items-center gap-3 rounded-2xl px-5 py-3.5 mb-10 text-base font-mono max-w-full overflow-hidden border border-white/10"
            style={{ background: 'var(--bg-subtle)', boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)' }}>
            <span className="text-white/75 shrink-0">$</span>
            <span className="text-white/75 shrink-0">agentnetes run</span>
            <TypingPrompt />
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
            <Link href="/demo"
              className="flex items-center gap-2 font-semibold px-7 py-3 rounded-xl text-base transition-all hover:opacity-90 hover:scale-[1.02] animate-glow-pulse bg-white text-black">
              <Zap size={14} />
              Try Demo
            </Link>
            <Link href="/docs"
              className="flex items-center gap-2 border border-white/15 text-white/70 px-7 py-3 rounded-xl hover:border-white/30 hover:text-white transition-all text-base">
              Read the docs <ChevronRight size={13} />
            </Link>
          </div>

          {/* npm install */}
          <div className="max-w-xl mx-auto w-full mb-10">
            <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: 'var(--bg-subtle)' }}>
              <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
                <span className="text-white/30 text-sm font-mono">terminal</span>
                <a href="https://www.npmjs.com/package/agentnetes" target="_blank" rel="noreferrer"
                  className="text-sm font-mono text-white/50 hover:text-white/70 transition-colors">
                  npmjs.com/package/agentnetes →
                </a>
              </div>
              <div className="px-5 py-4 space-y-2 text-base font-mono text-left overflow-x-auto">
                <div>
                  <span className="text-white/30">$ </span>
                  <span className="text-green-400">npm</span>
                  <span className="text-white/80"> install -g agentnetes</span>
                </div>
                <div className="text-white/30 text-sm pt-1 border-t border-white/[0.05]">then run on any git repo</div>
                <div>
                  <span className="text-white/30">$ </span>
                  <span className="text-green-400">agentnetes</span>
                  <span className="text-white/80"> run </span>
                  <span className="text-purple-400">&quot;add dark mode to this app&quot;</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px rounded-2xl overflow-hidden glass-card shimmer-border">
            {[
              { n: 6,   s: '+',      label: 'parallel agents' },
              { n: 2,   s: ' tools', label: 'per agent (MCP)' },
              { n: 100, s: 'K+',     label: 'lines explored' },
              { n: 1,   s: ' goal',  label: 'to a full team' },
            ].map(({ n, s, label }) => (
              <div key={label} className="py-5 px-4 text-center" style={{ background: 'var(--bg-subtle)' }}>
                <div className="text-3xl font-bold mb-0.5 font-mono text-white">
                  <Counter to={n} suffix={s} />
                </div>
                <div className="text-sm text-white/70 font-mono">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────────── */}
      <HowItWorks />

      {/* ── Problem ──────────────────────────────────────────── */}
      <section className="py-24 px-6 relative overflow-hidden ambient-orb orb-blue fade-in-section">
        <div className="max-w-5xl mx-auto mb-0"><hr className="gradient-divider" /></div>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-sm font-mono text-white/80 uppercase tracking-widest mb-3">The Problem</div>
            <h2 className="text-4xl font-bold mb-4 text-white">Single agents break on real codebases.</h2>
            <p className="text-white/85 text-lg max-w-2xl mx-auto leading-relaxed">
              Teams have tried everything: single coding agents, prompt-stuffed RAG pipelines, hand-wired MCP tools, elaborate harnesses. They all hit the same wall. Real codebases are too large for one context window, too complex for one agent, and too dynamic for static tool configs. Nobody stopped to ask: what if the agents invented their own team?
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4 mb-12">
            {[
              {
                label: 'Single agent + tools',
                problem: true,
                sub: 'Cursor, Copilot, custom harnesses',
                points: [
                  'Entire codebase stuffed into context',
                  'Context rot beyond ~50K tokens',
                  'Sequential: one task at a time',
                  'One failure halts everything',
                  'Static tool lists, no emergent roles',
                ],
              },
              {
                label: 'Agentnetes',
                problem: false,
                sub: 'vRLM runtime · RLM pattern',
                points: [
                  'Context lives in sandboxes, not prompts',
                  'Agents explore via grep, find, cat',
                  'Specialists run in parallel',
                  'Agents catch and fix each other\'s errors',
                  'Roles invented per goal, never hardcoded',
                ],
              },
              {
                label: 'Teams using AI tools',
                problem: null,
                sub: 'Copilot, Cursor, RAG, MCP harnesses',
                points: [
                  'Try different coding agent harnesses',
                  'Hand-wire MCP tools and hope they compose',
                  'Build RAG pipelines to stuff context',
                  'Tune prompts and pray context holds',
                  'Never break the problem down RLM-style',
                ],
              },
            ].map(({ label, problem, sub, points }) => (
              <div key={label} className={`rounded-2xl border p-6 card-hover ${problem === false ? 'border-white/20 shimmer-border' : 'border-white/10'}`}
                style={{ background: problem === false ? 'rgba(255,255,255,0.03)' : 'var(--bg-subtle)' }}>
                <div className={`text-sm font-semibold mb-0.5 ${problem === false ? 'text-white' : 'text-white/80'}`}>{label}</div>
                <div className={`text-sm font-mono mb-4 ${problem === false ? 'text-white/70' : 'text-white/50'}`}>{sub}</div>
                <ul className="space-y-2">
                  {points.map(p => (
                    <li key={p} className="flex items-start gap-2 text-sm">
                      <span className={`mt-1 shrink-0 text-sm ${problem === false ? 'text-white/70' : 'text-white/20'}`}>
                        {problem === false ? '✓' : '✗'}
                      </span>
                      <span className={problem === false ? 'text-white/75' : 'text-white/70'}>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Who is this for ───────────────────────────────────── */}
      <section className="py-20 px-6 dot-grid fade-in-section">
        <div className="max-w-5xl mx-auto mb-0"><hr className="gradient-divider" /></div>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-sm font-mono text-white/80 uppercase tracking-widest mb-3">Who Is This For</div>
            <h2 className="text-4xl font-bold mb-4 text-white">Built for developers who move fast.</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
            {[
              { icon: '🧑‍💻', title: 'Solo developers', body: 'Get the leverage of a full engineering team on your personal projects. Ship faster without hiring.' },
              { icon: '🏗️', title: 'Monorepo teams', body: 'Point the swarm at your large codebase. Agents explore only what they need · no context limits.' },
              { icon: '🔐', title: 'Security engineers', body: 'Spin up a dedicated audit swarm to scan, analyse, and fix vulnerabilities across the entire codebase.' },
              { icon: '⚙️', title: 'Platform engineers', body: 'Automate cross-cutting concerns · test coverage, observability, migrations · across all services.' },
            ].map(({ icon, title, body }) => (
              <div key={title} className="rounded-2xl border border-white/10 p-6 card-hover" style={{ background: 'var(--bg-card)' }}>
                <div className="text-2xl mb-3">{icon}</div>
                <div className="text-white font-semibold text-base mb-2">{title}</div>
                <div className="text-white/80 text-lg leading-relaxed">{body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What makes it different ───────────────────────────── */}
      <section className="py-20 px-6 mesh-gradient fade-in-section">
        <div className="max-w-5xl mx-auto mb-0"><hr className="gradient-divider" /></div>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-sm font-mono text-white/80 uppercase tracking-widest mb-3">Differentiation</div>
            <h2 className="text-4xl font-bold mb-4 text-white">Not another AI coding assistant.</h2>
            <p className="text-white/85 text-lg max-w-lg mx-auto">Agentnetes is not autocomplete. It is not a chatbot. It is a swarm that investigates, builds, tests, and delivers.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
            {[
              { n: '01', title: 'Self-organizing teams', body: 'The model invents the roles it needs. A provider task spawns a Scout, Engineer, Tester. A security audit spawns an entirely different team. Nothing is hardcoded.' },
              { n: '02', title: 'Real code execution', body: 'Agents run real shell commands in real sandboxes. Tests actually execute. Build failures get fixed. This is not a simulation of engineering · it is engineering.' },
              { n: '03', title: 'Any model, same swarm', body: 'Swap Gemini for Claude or GPT by changing one env var. The swarm architecture is model-agnostic. Route through Vercel AI Gateway or call Google directly.' },
              { n: '04', title: 'Two-tool MCP strategy', body: 'Each agent has exactly two tools: search() and execute(). ~1,000 token footprint regardless of codebase size. No tool bloat, no context waste.' },
              { n: '05', title: 'Context stays external', body: 'Files never enter the prompt. Agents write code to explore the codebase · grep, find, cat. Proven by the MIT CSAIL RLM paper to outperform context-stuffing 2×.' },
              { n: '06', title: 'Agents fix each other', body: 'When the Tester finds a bug, it routes back to the Engineer automatically. The swarm has a built-in try → test → fix loop that runs until tests pass.' },
            ].map(({ n, title, body }) => (
              <div key={n} className="rounded-2xl border border-white/[0.08] p-6 hover:border-white/20 group card-hover"
                style={{ background: 'var(--bg-card)' }}>
                <div className="text-sm font-mono mb-3 text-white/30">{n}</div>
                <div className="text-white font-semibold text-base mb-2">{title}</div>
                <div className="text-white/80 text-lg leading-relaxed">{body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Architecture ─────────────────────────────────────── */}
      <section className="py-24 px-6 relative overflow-hidden ambient-orb orb-purple fade-in-section">
        <div className="max-w-5xl mx-auto mb-0"><hr className="gradient-divider" /></div>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-sm font-mono text-white/80 uppercase tracking-widest mb-3">Architecture</div>
            <h2 className="text-4xl font-bold mb-4 text-white">One goal. A recursive agent swarm.</h2>
            <p className="text-white/90 text-lg max-w-xl mx-auto leading-relaxed">
              The root agent decomposes your goal, invents the right team of specialists,
              and orchestrates them across isolated sandboxes. Roles are fully emergent. Nothing is hardcoded.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <ArchDiagram />
            <div className="space-y-3">
              {[
                { icon: <Network size={14} />, title: 'Emergent team formation',
                  body: <>The root agent reads the codebase, understands the task, and invents the right specialist roles. A provider task gets a <span className="text-violet-400 font-mono">Scout</span>, <span className="text-violet-400 font-mono">Engineer</span>, <span className="text-violet-400 font-mono">Tester</span>, and <span className="text-violet-400 font-mono">Packager</span>. A security audit gets an entirely different team.</> },
                { icon: <Box size={14} />, title: 'Isolated Firecracker sandboxes',
                  body: <>Each agent runs in its own <span className="text-emerald-400 font-mono">Vercel Sandbox</span> (Firecracker microVM). Pre-warmed from a repo snapshot for near-instant startup. Agents cannot interfere with each other.</> },
                { icon: <Code2 size={14} />, title: 'Context externalized, not stuffed',
                  body: <>Agents do not receive hundreds of files in their prompts. They write code to explore context: <span className="text-emerald-400 font-mono">grep</span>, <span className="text-emerald-400 font-mono">find</span>, <span className="text-emerald-400 font-mono">cat</span>. This is the <span className="text-blue-400 font-mono">RLM Pattern</span> from MIT CSAIL, proven 2x more effective.</> },
                { icon: <RefreshCw size={14} />, title: 'Agents collaborate at runtime',
                  body: <>When the <span className="text-violet-400 font-mono">Test Engineer</span> finds a type error, that finding routes back to the <span className="text-violet-400 font-mono">Provider Engineer</span> automatically. The <span className="text-orange-400 font-mono">vRLM</span> runtime handles inter-agent communication.</> },
              ].map(item => (
                <div key={item.title} className="flex gap-3 p-4 rounded-xl border border-white/[0.07] hover:border-white/15 card-hover" style={{ background: 'var(--bg-card)' }}>
                  <div className="text-white/80 mt-0.5 shrink-0">{item.icon}</div>
                  <div>
                    <div className="text-white text-base font-semibold mb-1">{item.title}</div>
                    <div className="text-white/85 text-lg leading-relaxed">{item.body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Live terminal ─────────────────────────────────────── */}
      <section className="py-24 px-6 relative noise-overlay fade-in-section" style={{ background: 'var(--bg-base)' }}>
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-10">
            <div className="text-sm font-mono text-white/80 uppercase tracking-widest mb-3">Live Preview</div>
            <h2 className="text-4xl font-bold mb-3 text-white">Watch the swarm execute</h2>
            <p className="text-white/90 text-lg max-w-md mx-auto">
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
                <span className="text-sm text-white/80 font-mono">{x.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Four foundations ──────────────────────────────────── */}
      <section className="py-24 px-6 dot-grid fade-in-section">
        <div className="max-w-6xl mx-auto mb-0"><hr className="gradient-divider" /></div>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-sm font-mono text-white/80 uppercase tracking-widest mb-3">Research Foundations</div>
            <h2 className="text-4xl font-bold mb-4 text-white">Five ideas. One system.</h2>
            <p className="text-white/90 text-lg max-w-lg mx-auto">
              Agentnetes combines five research-backed patterns that individually improve agent performance
              and together create something qualitatively different.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
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
            <FeatureCard
              badge="Kubernetes-inspired"
              badgeColor="border-cyan-500/40 text-cyan-400"
              icon={<Network size={15} />}
              title="Load Balancing: Work distributed across the swarm"
              description="All specialist agents run concurrently via Promise.allSettled. Work is load-balanced across the agent pool automatically. One agent failing never blocks the others."
              detail="maxWorkers caps concurrency like Kubernetes resource limits on a node. Promise.allSettled provides fault-tolerant dispatch: a failing Engineer never kills the Scout or Tester. The swarm delivers what it can regardless of individual failures."
              code="Promise.allSettled(workers.map(task => runWorker(task)))"
              cite="Kubernetes-inspired: parallel execution + fault-tolerant dispatch"
            />
          </div>
        </div>
      </section>

      {/* ── Tech stack ────────────────────────────────────────── */}
      <section className="py-24 px-6 mesh-gradient fade-in-section" style={{ background: 'var(--bg-base)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-sm font-mono text-white/80 uppercase tracking-widest mb-3">Stack</div>
            <h2 className="text-4xl font-bold mb-4 text-white">Built on the bleeding edge</h2>
            <p className="text-white/90 text-lg max-w-lg mx-auto">
              Every layer is the latest available. No legacy versions. No compatibility shims.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 stagger-children">
            {[
              {
                label: 'AI Runtime',
                items: [
                  { name: 'ai (Vercel AI SDK)', version: 'v7.0.0-beta.33', highlight: true },
                  { name: 'ToolLoopAgent', version: 'beta agent primitive', highlight: true },
                  { name: '@ai-sdk/google', version: 'v3.0.52', highlight: false },
                ],
                note: <><span className="text-pink-400">ToolLoopAgent</span> is the core primitive in AI SDK v7 beta. Each worker runs two MCP tools: <span className="text-emerald-400">search()</span> and <span className="text-emerald-400">execute()</span>.</>,
              },
              {
                label: 'Sandbox',
                items: [
                  { name: 'Docker', version: 'node:20-alpine · local default', highlight: true },
                  { name: '@vercel/sandbox', version: 'Firecracker microVMs', highlight: false },
                  { name: 'Local shell', version: 'no-install fallback', highlight: false },
                ],
                note: <><span className="text-emerald-400">Docker</span> is the default sandbox for local runs. <span className="text-orange-400">Vercel Firecracker</span> available for cloud self-hosting.</>,
              },
              {
                label: 'Models',
                items: [
                  { name: 'Gemini 3.1 Pro', version: 'planner · latest', highlight: true },
                  { name: 'Gemini 2.5 Flash', version: 'planner + worker · default', highlight: true },
                  { name: 'Gemini 3.1 Flash-Lite', version: 'worker · fastest', highlight: false },
                ],
                note: <>Full <span className="text-blue-400">Gemini 2.0 · 2.5 · 3.x</span> lineup supported. Separate <span className="text-violet-400">planner</span> and <span className="text-violet-400">worker</span> models configurable in the UI.</>,
              },
            ].map(group => (
              <div key={group.label} className="rounded-2xl border border-white/10 p-5 glass-card card-hover">
                <div className="text-sm font-mono text-white/65 uppercase tracking-wider mb-4">{group.label}</div>
                <div className="space-y-2">
                  {group.items.map(item => <StackBadge key={item.name} {...item} />)}
                </div>
                <div className="text-sm text-white/80 font-mono mt-4 leading-relaxed">{group.note}</div>
              </div>
            ))}
          </div>

          {/* Code snippet */}
          <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: 'var(--bg-panel)' }}>
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
              <span className="text-sm font-mono text-white/65">lib/vrlm/runtime.ts</span>
            </div>
            <div className="p-5 font-mono text-sm leading-7 overflow-x-auto">
              <div><span className="text-white/65">{'// Each worker: two tools, one sandbox, emergent role'}</span></div>
              <div className="mt-1.5">
                <span className="text-violet-400">const</span>
                <span className="text-white"> agent </span>
                <span className="text-white/75">=</span>
                <span className="text-white"> new </span>
                <span className="text-pink-400">ToolLoopAgent</span>
                <span className="text-white">{'({'}</span>
              </div>
              <div className="pl-6"><span className="text-white/70">model: </span><span className="text-orange-400">google</span><span className="text-white">(&apos;gemini-2.5-flash&apos;),</span></div>
              <div className="pl-6"><span className="text-white/70">tools: </span><span className="text-white">{'{ '}</span><span className="text-emerald-400">search</span><span className="text-white">, </span><span className="text-emerald-400">execute</span><span className="text-white"> {'}'},</span></div>
              <div className="pl-6"><span className="text-white/70">stopWhen: </span><span className="text-orange-400">stepCountIs</span><span className="text-white">(40),</span></div>
              <div className="pl-6"><span className="text-white/70">instructions: </span><span className="text-white">buildWorkerPrompt(task),</span></div>
              <div><span className="text-white">{'});'}</span></div>
              <div className="mt-2"><span className="text-white/65">{'// Drive the tool loop; events stream to the UI via SSE'}</span></div>
              <div>
                <span className="text-violet-400">for await </span>
                <span className="text-white">(</span>
                <span className="text-violet-400">const </span>
                <span className="text-white">_ </span>
                <span className="text-violet-400">of </span>
                <span className="text-white">result.</span>
                <span className="text-pink-400">fullStream</span>
                <span className="text-white">) {'{ ... }'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Workflow ──────────────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-white/[0.05] fade-in-section">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-sm font-mono text-white/80 uppercase tracking-widest mb-3">Workflow</div>
            <h2 className="text-4xl font-bold mb-4 text-white">One sentence. Dynamic team. Real results.</h2>
            <p className="text-white/90 text-lg max-w-md mx-auto">
              From goal to dynamic team formation to delivered artifacts in isolated sandboxes.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-7 stagger-children">
            <Step n="01" accent="border-white/15 text-white/50"
              title="You give a goal"
              body="Type what you want built. Not instructions on how. Just what. Agentnetes figures out the rest. The goal can reference a GitHub repo or an uploaded codebase." />
            <Step n="02" accent="border-white/15 text-white/50"
              title="Root agent explores"
              body="The Tech Lead spawns a Firecracker sandbox pre-warmed with the target repo. It uses grep, find, and cat to map the architecture. Context lives in the filesystem, not the prompt." />
            <Step n="03" accent="border-white/15 text-white/50"
              title="Team self-assembles"
              body="Based on what it finds, the root agent invents the team. Roles, goals, and dependencies are all emergent. A provider task gets different specialists than a security audit." />
            <Step n="04" accent="border-white/15 text-white/50"
              title="Agents work in parallel"
              body="Each specialist runs concurrently in its own Firecracker microVM. They explore, write code, run tests, and fix failures. No sequential bottlenecks." />
            <Step n="05" accent="border-white/15 text-white/50"
              title="Agents collaborate"
              body="Test failures and findings route back to the right specialist automatically. The vRLM runtime handles inter-agent communication. No human needed to relay." />
            <Step n="06" accent="border-white/15 text-white/50"
              title="Synthesis and delivery"
              body="The root agent collects all artifacts, verifies completeness, and streams a structured summary to the UI with every generated file. Each agent publishes an A2A card." />
          </div>
        </div>
      </section>

      {/* ── vRLM ──────────────────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-white/[0.05] relative overflow-hidden ambient-orb orb-pink fade-in-section" style={{ background: 'var(--bg-base)' }}>
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-14">
            <div className="text-sm font-mono text-white/80 uppercase tracking-widest mb-3">Runtime</div>
            <h2 className="text-4xl font-bold mb-4 text-white">vRLM: The Orchestration Runtime</h2>
            <p className="text-white/85 text-lg max-w-xl mx-auto">
              Virtual Recursive Language Model Runtime. The engine between your goal and the agents.
              Inspired by the <a href="https://arxiv.org/abs/2512.24601" target="_blank" rel="noreferrer" className="text-white/80 underline underline-offset-2 hover:text-white transition-colors">RLM pattern from MIT CSAIL</a>.
            </p>
          </div>

          {/* Three phases */}
          <div className="grid md:grid-cols-3 gap-4 mb-10">
            {[
              {
                n: '01',
                phase: 'Plan',
                color: 'border-white/10 bg-white/[0.02]',
                badge: 'text-white/80',
                body: 'Root agent explores the repo with grep and find, then calls the Gemini planner to invent a specialist team. Roles are fully emergent. Nothing is hardcoded.',
              },
              {
                n: '02',
                phase: 'Execute',
                color: 'border-white/10 bg-white/[0.02]',
                badge: 'text-white/80',
                body: 'Workers run in parallel. Each gets an isolated Docker container with the repo pre-cloned, and two tools: search() to grep the codebase and execute() to run any shell command.',
              },
              {
                n: '03',
                phase: 'Synthesize',
                color: 'border-white/10 bg-white/[0.02]',
                badge: 'text-white/80',
                body: 'When all workers complete, the root agent reads their findings and artifacts, then produces a structured summary. Every generated file is collected and streamed to the UI.',
              },
            ].map(p => (
              <div key={p.n} className={`rounded-2xl border p-5 ${p.color} card-hover`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-mono text-white/25">{p.n}</span>
                  <span className={`text-sm font-bold ${p.badge}`}>{p.phase}</span>
                </div>
                <p className="text-white/80 text-lg leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>

          {/* Event types */}
          <div className="grid md:grid-cols-2 gap-5 items-start">
            <div>
              <div className="text-sm font-mono text-violet-400/50 uppercase tracking-widest mb-3">Event Stream · SSE</div>
              <p className="text-white/80 text-lg leading-relaxed mb-4">
                Every phase emits typed events over Server-Sent Events. The UI subscribes and renders agent activity in real time with no polling.
              </p>
              <div className="space-y-1.5">
                {[
                  { type: 'task-created',   desc: 'new agent spawned',              color: 'text-white/60' },
                  { type: 'task-updated',   desc: 'status or progress change',      color: 'text-white/40' },
                  { type: 'task-completed', desc: 'agent finished with artifacts',  color: 'text-white/60' },
                  { type: 'task-failed',    desc: 'agent error',                    color: 'text-white/40' },
                  { type: 'finding',        desc: 'agent discovered something',     color: 'text-white/60' },
                  { type: 'terminal',       desc: 'shell command + output',         color: 'text-white/60' },
                  { type: 'artifact',       desc: 'file produced by an agent',      color: 'text-white/50' },
                  { type: 'collaboration',  desc: 'inter-agent finding shared',     color: 'text-white/60' },
                  { type: 'synthesis',      desc: 'root agent final summary',       color: 'text-white/60' },
                  { type: 'done',           desc: 'run complete',                   color: 'text-white/40' },
                  { type: 'error',          desc: 'runtime error',                  color: 'text-white/40' },
                ].map(e => (
                  <div key={e.type} className="flex items-center gap-3 font-mono text-sm">
                    <span className={`w-32 shrink-0 ${e.color}`}>{e.type}</span>
                    <span className="text-white/30">{e.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: 'var(--bg-panel)' }}>
              <div className="px-4 py-2.5 border-b border-white/[0.06] text-sm font-mono text-white/35">lib/vrlm/types.ts</div>
              <div className="p-4 font-mono text-sm leading-6 space-y-0.5 overflow-x-auto">
                <div><span className="text-violet-400">interface </span><span className="text-white">VrlmConfig {'{'}</span></div>
                <div className="pl-4"><span className="text-white/50">maxWorkers:        </span><span className="text-blue-400">number</span><span className="text-white/30">; // default 6</span></div>
                <div className="pl-4"><span className="text-white/50">maxStepsPerAgent:  </span><span className="text-blue-400">number</span><span className="text-white/30">; // default 20</span></div>
                <div className="pl-4"><span className="text-white/50">plannerModel:      </span><span className="text-blue-400">string</span><span className="text-white/30">; // orchestrator</span></div>
                <div className="pl-4"><span className="text-white/50">workerModel:       </span><span className="text-blue-400">string</span><span className="text-white/30">; // specialists</span></div>
                <div className="pl-4"><span className="text-white/50">repoUrl:           </span><span className="text-blue-400">string</span><span className="text-white/30">; // cloned per agent</span></div>
                <div className="pl-4"><span className="text-white/50">sandboxProvider:   </span><span className="text-emerald-400">&apos;docker&apos; | &apos;vercel&apos; | &apos;e2b&apos; | &apos;daytona&apos; | &apos;local&apos;</span><span className="text-white/30">;</span></div>
                <div className="pl-4"><span className="text-white/50">googleApiKey?:     </span><span className="text-blue-400">string</span><span className="text-white/30">; // UI override</span></div>
                <div><span className="text-white">{'}'}</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Get Started ───────────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-white/[0.05] fade-in-section">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-sm font-mono text-white/80 uppercase tracking-widest mb-3">Get Started</div>
            <h2 className="text-4xl font-bold mb-4 text-white">Three ways to run</h2>
            <p className="text-white/90 text-lg max-w-md mx-auto">
              From instant browser demo to full local execution with Docker sandboxes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {/* Tier 1 — Simulation */}
            <div className="rounded-2xl border border-white/10 p-6 card-hover" style={{ background: 'var(--bg-card)' }}>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm font-mono px-2 py-0.5 rounded-full border border-white/15 text-white/60">no setup</span>
              </div>
              <div className="text-xl font-semibold text-white mb-2">Simulation</div>
              <p className="text-white/80 text-lg leading-relaxed mb-5">
                Watch the full agent lifecycle in your browser. No API key, no Docker, no install.
                Pre-scripted scenarios replay real event sequences.
              </p>
              <div className="rounded-xl border border-white/[0.06] px-3 py-2 font-mono text-sm mb-5 overflow-x-auto" style={{ background: 'var(--bg-panel)' }}>
                <span className="text-white/80">Open </span><span className="text-violet-400">/demo</span><span className="text-white/80"> → toggle </span><span className="text-emerald-400">Simulation</span><span className="text-white/80"> → watch</span>
              </div>
              <Link href="/demo"
                className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg transition-all hover:opacity-90 w-full justify-center bg-white text-black">
                Try Demo <ArrowRight size={12} />
              </Link>
            </div>

            {/* Tier 2 — Self-host local */}
            <div className="rounded-2xl border border-white/20 p-6 relative card-hover shimmer-border" style={{ background: 'var(--bg-card)' }}>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm font-mono px-2 py-0.5 rounded-full border border-white/20 text-white/70">recommended</span>
              </div>
              <div className="text-xl font-semibold text-white mb-2">Self-host · Local</div>
              <p className="text-white/80 text-lg leading-relaxed mb-5">
                Clone the repo and run locally. Both simulation and real agent execution available.
                Configure your Google API key and target repo directly in the UI. No <code className="text-white/50 text-sm">.env</code> file needed.
              </p>
              <div className="rounded-xl border border-white/[0.06] px-3 py-2 font-mono text-sm mb-5 space-y-1 overflow-x-auto" style={{ background: 'var(--bg-panel)' }}>
                <div><span className="text-white/40">$ </span><span className="text-emerald-400">git clone</span><span className="text-white/80"> · </span><span className="text-emerald-400">npm install</span></div>
                <div><span className="text-white/40">$ </span><span className="text-emerald-400">docker pull</span><span className="text-white/80"> node:20-alpine</span></div>
                <div><span className="text-white/40">$ </span><span className="text-emerald-400">npm run dev</span><span className="text-white/80"> → open </span><span className="text-violet-400">/demo</span></div>
              </div>
              <Link href="/docs"
                className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg border border-white/15 text-white/65 hover:border-white/30 hover:text-white transition-all w-full justify-center">
                Read the docs <ChevronRight size={12} />
              </Link>
            </div>

            {/* Tier 3 — CLI */}
            <div className="rounded-2xl border border-white/10 p-6 card-hover" style={{ background: 'var(--bg-card)' }}>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm font-mono px-2 py-0.5 rounded-full border border-white/15 text-white/60">CLI</span>
              </div>
              <div className="text-xl font-semibold text-white mb-2">CLI · Any Repo</div>
              <p className="text-white/80 text-lg leading-relaxed mb-5">
                Install the npm package globally and run against any local git repo.
                Requires Docker running locally and a Google API key.
              </p>
              <div className="rounded-xl border border-white/[0.06] px-3 py-2 font-mono text-sm mb-5 space-y-1 overflow-x-auto" style={{ background: 'var(--bg-panel)' }}>
                <div><span className="text-white/40">$ </span><span className="text-emerald-400">npm install</span><span className="text-white/80"> -g agentnetes</span></div>
                <div><span className="text-white/40">$ </span><span className="text-emerald-400">export</span><span className="text-white/80"> GOOGLE_API_KEY=</span><span className="text-violet-400">...</span></div>
                <div><span className="text-white/40">$ </span><span className="text-emerald-400">agentnetes</span><span className="text-white/80"> run </span><span className="text-violet-400">&quot;your goal&quot;</span></div>
              </div>
              <a href="https://www.npmjs.com/package/agentnetes" target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg border border-white/10 text-white/55 hover:border-white/20 hover:text-white/75 transition-all w-full justify-center">
                npm package <ExternalLink size={11} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Model section ─────────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-white/[0.05] dot-grid fade-in-section" style={{ background: 'var(--bg-base)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-sm font-mono text-white/80 uppercase tracking-widest mb-3">Models</div>
              <h2 className="text-4xl font-bold mb-4 text-white">Any model. Same swarm.</h2>
              <p className="text-white/85 text-lg leading-relaxed mb-6">
                Bring your own Google API key and swap models from the UI. No config file needed.
                Separate planner and worker models let you balance quality vs cost.
              </p>
              <div className="space-y-3">
                {[
                  { label: 'Gemini 3.x, 2.5, 2.0 all supported', done: true },
                  { label: 'Separate planner and worker models', done: true },
                  { label: 'BYOK: paste API key directly in the UI', done: true },
                  { label: 'Claude / GPT-4o support', done: false },
                ].map(x => (
                  <div key={x.label} className="flex items-center gap-2.5">
                    {x.done
                      ? <CheckCircle2 size={14} className="text-white/60 shrink-0" />
                      : <div className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0" />}
                    <span className={`text-base ${x.done ? 'text-white/80' : 'text-white/65'}`}>{x.label}</span>
                    {!x.done && <span className="text-sm font-mono text-white/50 border border-white/20 rounded px-1">soon</span>}
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Gemini 3.1 Pro',    role: 'Planner · latest',      color: 'border-white/15 bg-white/[0.03]',  badge: 'new' },
                { label: 'Gemini 2.5 Flash',  role: 'Planner + Worker · default', color: 'border-white/15 bg-white/[0.03]', badge: 'recommended' },
                { label: 'Gemini 3.1 Flash-Lite', role: 'Worker · fastest',  color: 'border-white/10 bg-white/[0.02]', badge: 'fast' },
                { label: 'Gemini 2.0 Flash',  role: 'Worker · budget',       color: 'border-white/10 bg-white/[0.02]',       badge: '' },
              ].map(m => (
                <div key={m.label} className={`flex items-center gap-3 border rounded-xl px-4 py-3 ${m.color}`}>
                  <div className="flex-1">
                    <div className="text-white text-base font-medium">{m.label}</div>
                    <div className="text-white/80 text-sm font-mono mt-0.5">{m.role}</div>
                  </div>
                  {m.badge && (
                    <span className="text-sm font-mono text-white/65 border border-white/10 rounded px-1.5 py-0.5">{m.badge}</span>
                  )}
                </div>
              ))}
              <div className="rounded-xl border border-white/10 px-4 py-3 font-mono text-sm overflow-x-auto" style={{ background: 'var(--bg-panel)' }}>
                <span className="text-white/65">createGoogleGenerativeAI{'({'}</span><br />
                <span className="text-white/65">{'  '}apiKey: </span><span className="text-violet-400">process.env.GOOGLE_API_KEY</span><br />
                <span className="text-white/65">{'}'});</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-white/[0.05] relative overflow-hidden ambient-orb orb-pink fade-in-section">
        <div className="max-w-2xl mx-auto relative z-10">
          <div className="rounded-2xl border border-white/10 p-12 text-center relative overflow-hidden noise-overlay" style={{
            background: 'var(--bg-card)',
          }}>
            <div className="flex justify-center mb-5 relative z-10">
              <Image src={`${BASE}/favicon.png`} alt="Agentnetes" width={48} height={48} className="rounded-xl" />
            </div>
            <div className="text-sm font-mono text-white/80 uppercase tracking-widest mb-4 relative z-10">Try it now</div>
            <h2 className="text-3xl font-bold mb-3 gradient-text relative z-10">See the swarm execute</h2>
            <p className="text-white/90 text-base mb-8 max-w-sm mx-auto leading-relaxed relative z-10">
              Give it a goal. Watch specialist agents spawn, explore, implement, test,
              and deliver inside isolated sandboxes. Under 90 seconds.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 relative z-10">
              <Link href="/demo"
                className="flex items-center gap-2 font-semibold px-8 py-3 rounded-xl text-base transition-all hover:opacity-90 hover:scale-[1.02] bg-white text-black">
                Try Demo <ArrowRight size={14} />
              </Link>
              <Link href="/docs"
                className="flex items-center gap-2 border border-white/15 text-white/70 px-8 py-3 rounded-xl hover:border-white/30 hover:text-white transition-all text-base">
                Read the docs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.05] py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <Logo size={30} />
            <div>
              <div className="font-bold text-base text-white">Agentnetes</div>
              <div className="text-white/80 text-sm font-mono">Zero to Agent London 2026</div>
            </div>
          </div>
          <div className="text-white/80 text-sm font-mono text-center">
            Zero to Agent London · Google DeepMind x Vercel · 2026
          </div>
          <div className="flex items-center gap-5">
            <Link href="/demo" className="text-white/80 hover:text-white transition-colors text-sm">Simulation</Link>
            <a href="https://cerebralvalley.ai/e/zero-to-agent-london" target="_blank" rel="noreferrer"
              className="flex items-center gap-1 text-white/80 hover:text-white transition-colors text-sm">
              Hackathon <ExternalLink size={10} />
            </a>
            <a href="https://github.com/Shashikant86/agentnetes" target="_blank" rel="noreferrer"
              className="text-white/80 hover:text-white transition-colors">
              <Github size={14} />
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}
