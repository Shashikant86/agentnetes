'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChatPanel } from '@/components/ChatPanel';
import { AgentPanel } from '@/components/AgentPanel';
import { ModelSelector } from '@/components/ModelSelector';
import { AgentTask, VrlmEvent } from '@/lib/vrlm/types';
import { PanelRightOpen, PanelRightClose, ArrowLeft, Settings, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import { SimulatedVrlmRuntime } from '@/lib/vrlm/simulated-runtime';

const STORAGE_KEY = 'agentnetes-settings';
const IS_STATIC = process.env.NEXT_PUBLIC_STATIC_MODE === 'true';

type Mode = 'real' | 'simulation';

interface DemoSettings {
  sandboxProvider: 'docker' | 'local';
  repoUrl: string;
  plannerModel: string;
  workerModel: string;
}

const DEFAULT_SETTINGS: DemoSettings = {
  sandboxProvider: 'docker',
  repoUrl: 'https://github.com/expressjs/express',
  plannerModel: 'google/gemini-2.5-flash',
  workerModel: 'google/gemini-2.5-flash',
};

function loadSettings(): DemoSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : { ...DEFAULT_SETTINGS };
  } catch { return { ...DEFAULT_SETTINGS }; }
}

function saveSettings(s: DemoSettings) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch { /* ignore */ }
}

// ── Settings modal ────────────────────────────────────────────────────────────
function SettingsModal({
  current,
  apiKeySet,
  onClose,
}: {
  current: DemoSettings;
  apiKeySet: boolean;
  onClose: (s: DemoSettings) => void;
}) {
  const [s, setS] = useState<DemoSettings>(current);
  const set = (patch: Partial<DemoSettings>) => setS(prev => ({ ...prev, ...patch }));

  function save() {
    saveSettings(s);
    onClose(s);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={e => e.target === e.currentTarget && onClose(current)}
    >
      <div className="w-full max-w-md rounded-2xl border border-white/[0.12] overflow-hidden shadow-2xl" style={{ background: 'var(--bg-card)' }}>

        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-white/[0.07] flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold text-base">Runtime Settings</h2>
            <p className="text-sm text-white/40 font-mono mt-0.5">Saved in your browser</p>
          </div>
          <button onClick={() => onClose(current)} className="text-white/30 hover:text-white/60 transition-colors text-xl leading-none">✕</button>
        </div>

        <div className="px-6 py-5 space-y-5">

          {/* API Key status */}
          <div className={`flex items-start gap-3 rounded-xl px-4 py-3 border ${apiKeySet ? 'border-green-500/20 bg-green-500/5' : 'border-yellow-500/20 bg-yellow-500/5'}`}>
            {apiKeySet
              ? <CheckCircle size={15} className="text-green-400 mt-0.5 shrink-0" />
              : <AlertTriangle size={15} className="text-yellow-400 mt-0.5 shrink-0" />}
            <div>
              <p className="text-sm font-mono font-medium" style={{ color: apiKeySet ? 'rgb(134 239 172)' : 'rgb(253 224 71)' }}>
                GOOGLE_API_KEY {apiKeySet ? 'is set' : 'not set'}
              </p>
              {!apiKeySet && (
                <div className="mt-1.5 space-y-1.5">
                  <p className="text-sm text-white/45">
                    Option 1: export in your shell, then restart:
                  </p>
                  <div className="rounded-lg px-3 py-2 font-mono text-sm text-green-300/80 border border-white/10" style={{ background: 'var(--bg-subtle)' }}>
                    export GOOGLE_API_KEY=your_key_here
                  </div>
                  <p className="text-sm text-white/45">
                    Option 2: add to <span className="font-mono text-white/60">.env.local</span> and restart:
                  </p>
                  <div className="rounded-lg px-3 py-2 font-mono text-sm text-green-300/80 border border-white/10" style={{ background: 'var(--bg-subtle)' }}>
                    GOOGLE_API_KEY=your_key_here
                  </div>
                  <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-0.5 text-purple-400/70 hover:text-purple-400 transition-colors text-sm">
                    Get a free key at aistudio.google.com <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Repo URL */}
          <div>
            <label className="text-xs font-mono text-white/40 uppercase tracking-widest block mb-1.5">
              Target Repo URL <span className="text-red-400/80">*</span>
            </label>
            <input
              type="text"
              value={s.repoUrl}
              onChange={e => set({ repoUrl: e.target.value })}
              placeholder="https://github.com/owner/repo"
              autoFocus
              className="w-full rounded-lg border border-white/15 px-3 py-2 text-sm font-mono outline-none focus:border-purple-500/50 transition-colors"
              style={{ background: 'var(--bg-subtle)', color: 'rgb(var(--fg))' }}
            />
            <p className="text-sm text-white/35 mt-1">Agents clone this into each sandbox. Use a small repo for faster runs.</p>
          </div>

          {/* Sandbox */}
          <div>
            <label className="text-xs font-mono text-white/40 uppercase tracking-widest block mb-1.5">Sandbox Provider</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => set({ sandboxProvider: 'docker' })}
                className={`rounded-lg border px-4 py-3 text-left transition-all ${s.sandboxProvider === 'docker' ? 'border-purple-500/50 bg-purple-500/10' : 'border-white/10 hover:border-white/20'}`}>
                <div className="text-white text-sm font-mono font-medium">docker</div>
                <div className="text-white/40 text-xs mt-0.5">Isolated containers · recommended</div>
              </button>
              <button
                onClick={() => set({ sandboxProvider: 'local' })}
                className={`rounded-lg border px-4 py-3 text-left transition-all ${s.sandboxProvider === 'local' ? 'border-yellow-500/40 bg-yellow-500/5' : 'border-white/10 hover:border-white/20'}`}>
                <div className="flex items-center gap-1.5 text-sm font-mono font-medium text-white/70">
                  <AlertTriangle size={11} className="text-yellow-500/70" /> local
                </div>
                <div className="text-white/35 text-xs mt-0.5">No isolation · not recommended</div>
              </button>
            </div>
            {s.sandboxProvider === 'docker' && (
              <p className="text-sm text-white/35 mt-1.5 font-mono">Make sure Docker is running: <span className="text-white/50">docker pull node:20-alpine</span></p>
            )}
          </div>

          {/* Models */}
          <div>
            <label className="text-xs font-mono text-white/40 uppercase tracking-widest block mb-2">Models</label>
            <div className="space-y-2.5">
              <div className="flex items-center gap-3">
                <span className="text-xs text-white/35 w-14 shrink-0">Planner</span>
                <ModelSelector value={s.plannerModel} onChange={v => set({ plannerModel: v })} />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-white/35 w-14 shrink-0">Worker</span>
                <ModelSelector value={s.workerModel} onChange={v => set({ workerModel: v })} />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex justify-end gap-3 border-t border-white/[0.05] pt-4">
          <button onClick={() => onClose(current)} className="px-4 py-2 rounded-lg text-sm text-white/40 hover:text-white/65 transition-colors">
            Cancel
          </button>
          <button
            onClick={save}
            disabled={!s.repoUrl.trim().startsWith('http')}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', color: '#fff' }}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
interface Message { role: 'user' | 'assistant'; content: string; }

export default function DemoPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [tasks, setTasks] = useState<Record<string, AgentTask>>({});
  const [rootId, setRootId] = useState<string | null>(null);
  const [events, setEvents] = useState<VrlmEvent[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showAgents, setShowAgents] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [mode, setMode] = useState<Mode>(IS_STATIC ? 'simulation' : 'real');
  const [settings, setSettings] = useState<DemoSettings>(DEFAULT_SETTINGS);
  const [apiKeySet, setApiKeySet] = useState(false);
  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;
    setSettings(loadSettings());
    fetch('/api/config')
      .then(r => r.json())
      .then(d => setApiKeySet(!!d.googleApiKeySet))
      .catch(() => {/* ignore */});
  }, []);

  const processEvent = useCallback((event: VrlmEvent, finalRef: { content: string }) => {
    setEvents(prev => [...prev, event]);
    if (event.type === 'task-created') {
      const task = event.data.task as AgentTask;
      setTasks(prev => ({ ...prev, [task.id]: task }));
      if (task.depth === 0) setRootId(task.id);
    }
    if (event.type === 'task-updated' && event.taskId) {
      setTasks(prev => {
        const existing = prev[event.taskId!];
        if (!existing) return prev;
        return { ...prev, [event.taskId!]: { ...existing, status: (event.data.status as AgentTask['status']) ?? existing.status, statusText: (event.data.statusText as string) ?? existing.statusText } };
      });
    }
    if (event.type === 'task-completed' && event.taskId) {
      setTasks(prev => {
        const existing = prev[event.taskId!];
        if (!existing) return prev;
        return { ...prev, [event.taskId!]: { ...existing, status: 'completed', statusText: 'Done', completedAt: Date.now(), artifacts: (event.data.artifacts as AgentTask['artifacts']) ?? existing.artifacts, findings: (event.data.findings as string[]) ?? existing.findings } };
      });
    }
    if (event.type === 'artifact' && event.taskId) {
      setTasks(prev => {
        const existing = prev[event.taskId!];
        if (!existing) return prev;
        const artifact = event.data.artifact as AgentTask['artifacts'][0];
        if (existing.artifacts.some(a => a.filename === artifact.filename)) return prev;
        return { ...prev, [event.taskId!]: { ...existing, artifacts: [...existing.artifacts, artifact] } };
      });
    }
    if (event.type === 'done') finalRef.content = String(event.data.content ?? '');
    if (event.type === 'error') finalRef.content = `Error: ${String(event.data.message ?? event.data)}`;
  }, []);

  const handleSubmit = useCallback(async (message: string) => {
    setMessages(prev => [...prev, { role: 'user', content: message }]);
    setTasks({});
    setRootId(null);
    setEvents([]);
    setIsRunning(true);

    const finalRef = { content: '' };

    try {
      if (mode === 'simulation') {
        const runtime = new SimulatedVrlmRuntime({});
        runtime.onEvent((event: VrlmEvent) => processEvent(event, finalRef));
        await runtime.run(message);
      } else {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message,
            sandboxProvider: settings.sandboxProvider,
            repoUrl: settings.repoUrl,
            plannerModel: settings.plannerModel,
            workerModel: settings.workerModel,
          }),
        });

        if (!res.body) throw new Error('No response body');
        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          for (const line of chunk.split('\n')) {
            if (!line.startsWith('data: ')) continue;
            try { processEvent(JSON.parse(line.slice(6)), finalRef); } catch { /* skip */ }
          }
        }
      }
      if (finalRef.content) setMessages(prev => [...prev, { role: 'assistant', content: finalRef.content }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${String(err)}` }]);
    } finally {
      setIsRunning(false);
    }
  }, [mode, settings, processEvent]);

  return (
    <div className="h-screen overflow-hidden flex flex-col" style={{ background: 'var(--bg-base)', color: 'rgb(var(--fg))' }}>

      {/* Settings modal */}
      {showSettings && (
        <SettingsModal current={settings} apiKeySet={apiKeySet} onClose={s => { setSettings(s); setShowSettings(false); }} />
      )}

      {/* Header */}
      <header className="flex items-center justify-between px-5 py-2.5 border-b border-white/[0.07] shrink-0" style={{ background: 'var(--bg-base)' }}>
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-1.5 text-white/50 hover:text-white/80 transition-colors text-sm font-mono">
            <ArrowLeft size={15} /> Home
          </Link>
          <span className="text-white/20">|</span>
          <Image src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/logo.png`} alt="Agentnetes" width={28} height={28} className="rounded-lg" />
          <span className="text-lg font-extrabold tracking-tight">Agentnetes</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Mode toggle */}
          <div className="flex items-center gap-1 rounded-full p-1 border border-white/[0.10]" style={{ background: 'var(--bg-subtle)' }}>
            {IS_STATIC ? (
              <span
                className="px-4 py-1.5 rounded-full text-sm font-mono text-white/20 cursor-not-allowed"
                title="Real mode requires agentnetes serve or self-hosting">
                Real
              </span>
            ) : (
              <button
                onClick={() => setMode('real')}
                className={`px-4 py-1.5 rounded-full text-sm font-mono font-medium transition-all ${mode === 'real' ? 'text-white' : 'text-white/35 hover:text-white/55'}`}
                style={mode === 'real' ? { background: 'linear-gradient(135deg, #a855f7, #ec4899)', color: '#fff' } : {}}>
                Real
              </button>
            )}
            <button
              onClick={() => setMode('simulation')}
              className={`px-4 py-1.5 rounded-full text-sm font-mono font-medium transition-all ${mode === 'simulation' ? 'bg-white/10 text-white' : 'text-white/35 hover:text-white/55'}`}>
              Simulation
            </button>
          </div>

          {/* Settings button (Real mode only, non-static) */}
          {!IS_STATIC && mode === 'real' && (
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-1.5 text-sm font-mono border border-white/10 rounded-xl px-3 py-1.5 transition-all"
              style={{ background: 'var(--bg-subtle)' }}
              title="Runtime settings">
              <Settings size={14} className="text-white/50" />
              <span className="text-white/45">
                {settings.sandboxProvider} · {settings.repoUrl.replace('https://github.com/', '')}
              </span>
              {!apiKeySet && (
                <span className="text-yellow-400/70 text-xs font-mono">· no key</span>
              )}
            </button>
          )}

          {/* Panel toggle */}
          <button
            onClick={() => setShowAgents(v => !v)}
            className="text-white/50 hover:text-white/75 transition-colors p-1"
            title={showAgents ? 'Hide agent panel' : 'Show agent panel'}>
            {showAgents ? <PanelRightClose size={19} /> : <PanelRightOpen size={19} />}
          </button>
        </div>
      </header>

      {/* Notice strip */}
      {IS_STATIC ? (
        <div className="px-4 py-2 border-b border-white/[0.07] flex items-center justify-between shrink-0" style={{ background: 'var(--bg-subtle)' }}>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-green-400/80 border border-green-500/20 bg-green-500/5 rounded px-2.5 py-1">simulation only</span>
            <span className="text-sm text-white/45">This is a preview. Real agents require a server.</span>
          </div>
          <div className="flex items-center gap-3 text-sm font-mono">
            <span className="text-white/40">Run real agents:</span>
            <code className="text-purple-400/80 bg-purple-500/10 border border-purple-500/20 rounded px-2 py-0.5">npx agentnetes serve</code>
            <a href="https://github.com/Shashikant86/agentnetes#running-locally" target="_blank" rel="noreferrer"
              className="text-white/30 hover:text-white/60 transition-colors">self-host</a>
          </div>
        </div>
      ) : mode === 'simulation' && (
        <div className="px-4 py-2 border-b border-white/[0.07] flex items-center gap-2 shrink-0" style={{ background: 'var(--bg-subtle)' }}>
          <span className="text-xs font-mono text-green-400/80 border border-green-500/20 bg-green-500/5 rounded px-2.5 py-1">simulation</span>
          <span className="text-sm text-white/45">Pre-scripted scenarios · no API key or Docker required · switch to Real for live execution</span>
        </div>
      )}

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
        <div className={`flex flex-col border-r border-white/[0.07] overflow-hidden transition-all duration-300 ${showAgents ? 'w-1/2' : 'w-full'}`}>
          <ChatPanel messages={messages} onSubmit={handleSubmit} isRunning={isRunning} mode={mode} />
        </div>
        {showAgents && (
          <div className="w-1/2 flex flex-col overflow-hidden">
            <div className="px-4 py-2.5 border-b border-white/[0.07] flex items-center justify-between shrink-0">
              <span className="text-sm text-white/70 font-mono uppercase tracking-wider">Agent Activity</span>
              {Object.keys(tasks).length > 0 && (
                <span className="text-sm text-white/60 font-mono">
                  {Object.values(tasks).filter(t => t.status === 'completed').length}/{Object.keys(tasks).length} done
                </span>
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <AgentPanel tasks={tasks} rootId={rootId} events={events} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
