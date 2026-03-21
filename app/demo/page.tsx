'use client';

import { useState, useCallback } from 'react';
import { ChatPanel } from '@/components/ChatPanel';
import { AgentPanel } from '@/components/AgentPanel';
import { ModelSelector } from '@/components/ModelSelector';
import { AgentTask, VrlmEvent } from '@/lib/vrlm/types';
import { PanelRightOpen, PanelRightClose } from 'lucide-react';

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

  const handleSubmit = useCallback(async (message: string) => {
    setMessages(prev => [...prev, { role: 'user', content: message }]);
    setTasks({});
    setRootId(null);
    setEvents([]);
    setIsRunning(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, plannerModel }),
      });

      if (!res.body) throw new Error('No response body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let finalContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const event: VrlmEvent = JSON.parse(line.slice(6));
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
                return {
                  ...prev,
                  [event.taskId!]: {
                    ...existing,
                    status: (event.data.status as AgentTask['status']) ?? (existing.status === 'pending' ? 'running' : existing.status),
                    statusText: (event.data.statusText as string) ?? existing.statusText,
                  },
                };
              });
            }

            if (event.type === 'task-completed' && event.taskId) {
              setTasks(prev => {
                const existing = prev[event.taskId!];
                if (!existing) return prev;
                return {
                  ...prev,
                  [event.taskId!]: {
                    ...existing,
                    status: 'completed',
                    statusText: 'Done',
                    completedAt: Date.now(),
                    artifacts: (event.data.artifacts as AgentTask['artifacts']) ?? existing.artifacts,
                    findings: (event.data.findings as string[]) ?? existing.findings,
                  },
                };
              });
            }

            // accumulate artifacts as they arrive
            if (event.type === 'artifact' && event.taskId) {
              setTasks(prev => {
                const existing = prev[event.taskId!];
                if (!existing) return prev;
                const artifact = event.data.artifact as AgentTask['artifacts'][0];
                const already = existing.artifacts.some(a => a.filename === artifact.filename);
                if (already) return prev;
                return { ...prev, [event.taskId!]: { ...existing, artifacts: [...existing.artifacts, artifact] } };
              });
            }

            if (event.type === 'done') {
              finalContent = String(event.data.content ?? '');
            }
          } catch {
            // malformed line, skip
          }
        }
      }

      if (finalContent) {
        setMessages(prev => [...prev, { role: 'assistant', content: finalContent }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${String(err)}` }]);
    } finally {
      setIsRunning(false);
    }
  }, [plannerModel]);

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-3 border-b border-[#1a1a1a] shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold tracking-tight">Agentnetes</span>
          <span className="text-[10px] text-white/55 border border-white/10 rounded px-1.5 py-0.5 font-mono uppercase tracking-wider hidden sm:inline">
            Kubernetes for AI agents
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
        <div className={`flex flex-col border-r border-[#1a1a1a] overflow-hidden transition-all duration-300 ${showAgents ? 'w-1/2' : 'w-full'}`}>
          <ChatPanel
            messages={messages}
            onSubmit={handleSubmit}
            isRunning={isRunning}
          />
        </div>

        {/* Agents */}
        {showAgents && (
          <div className="w-1/2 flex flex-col overflow-hidden">
            <div className="px-4 py-2.5 border-b border-[#1a1a1a] flex items-center justify-between shrink-0">
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
