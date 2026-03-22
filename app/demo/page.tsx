'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { ChatPanel } from '@/components/ChatPanel';
import { AgentPanel } from '@/components/AgentPanel';
import { ModelSelector } from '@/components/ModelSelector';
import { AgentTask, VrlmEvent } from '@/lib/vrlm/types';
import { PanelRightOpen, PanelRightClose, ArrowLeft } from 'lucide-react';
import { SimulatedVrlmRuntime } from '@/lib/vrlm/simulated-runtime';

const IS_STATIC = process.env.NEXT_PUBLIC_STATIC_MODE === 'true';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [tasks, setTasks] = useState<Record<string, AgentTask>>({});
  const [rootId, setRootId] = useState<string | null>(null);
  const [events, setEvents] = useState<VrlmEvent[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [plannerModel, setPlannerModel] = useState('google/gemini-2.5-pro');
  const [showAgents, setShowAgents] = useState(true);

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
    if (event.type === 'done') {
      finalRef.content = String(event.data.content ?? '');
    }
  }, []);

  const handleSubmit = useCallback(async (message: string) => {
    setMessages(prev => [...prev, { role: 'user', content: message }]);
    setTasks({});
    setRootId(null);
    setEvents([]);
    setIsRunning(true);

    try {
      if (IS_STATIC) {
        // ── Client-side simulation (GitHub Pages / static export) ────────────
        const finalRef = { content: '' };
        const runtime = new SimulatedVrlmRuntime({ plannerModel, workerModel: plannerModel });
        runtime.onEvent((event: VrlmEvent) => processEvent(event, finalRef));
        await runtime.run(message);
        if (finalRef.content) setMessages(prev => [...prev, { role: 'assistant', content: finalRef.content }]);
        setIsRunning(false);
        return;
      }

      // ── Server-side execution via API route ──────────────────────────────
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, plannerModel }),
      });

      if (!res.body) throw new Error('No response body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      const finalRef = { content: '' };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue;
          try { processEvent(JSON.parse(line.slice(6)), finalRef); } catch { /* skip */ }
        }
      }

      if (finalRef.content) {
        setMessages(prev => [...prev, { role: 'assistant', content: finalRef.content }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${String(err)}` }]);
    } finally {
      setIsRunning(false);
    }
  }, [plannerModel, processEvent]);

  return (
    <div className="h-screen overflow-hidden flex flex-col" style={{ background: 'var(--bg-base)', color: 'rgb(var(--fg))' }}>
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-3 border-b border-white/[0.07] shrink-0" style={{ background: 'var(--bg-base)' }}>
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-1.5 text-white/40 hover:text-white/70 transition-colors text-sm">
            <ArrowLeft size={13} /> Home
          </Link>
          <span className="text-white/20">|</span>
          <span className="text-base font-bold tracking-tight">Agentnetes</span>
          <span className="text-[10px] text-white/55 border border-white/10 rounded px-1.5 py-0.5 font-mono uppercase tracking-wider hidden sm:inline">
            Simulation
          </span>
        </div>
        <div className="flex items-center gap-3">
          <ModelSelector value={plannerModel} onChange={setPlannerModel} />
          <button
            onClick={() => setShowAgents(v => !v)}
            className="text-white/65 hover:text-white transition-colors p-1"
            title={showAgents ? 'Hide agent panel' : 'Show agent panel'}
          >
            {showAgents ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat */}
        <div className={`flex flex-col border-r border-white/[0.07] overflow-hidden transition-all duration-300 ${showAgents ? 'w-1/2' : 'w-full'}`}>
          <ChatPanel
            messages={messages}
            onSubmit={handleSubmit}
            isRunning={isRunning}
          />
        </div>

        {/* Agents */}
        {showAgents && (
          <div className="w-1/2 flex flex-col overflow-hidden">
            <div className="px-4 py-2.5 border-b border-white/[0.07] flex items-center justify-between shrink-0">
              <span className="text-xs text-white/65 font-mono uppercase tracking-wider">Agent Activity</span>
              {Object.keys(tasks).length > 0 && (
                <span className="text-xs text-white/55 font-mono">
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
