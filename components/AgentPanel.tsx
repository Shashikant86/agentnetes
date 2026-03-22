'use client';

import { useState, useEffect, useRef } from 'react';
import { AgentTask, VrlmEvent, Artifact } from '@/lib/vrlm/types';
import { buildA2ACard } from '@/lib/a2a';
import { ChevronDown, ChevronRight, Terminal, FileCode, Share2, Hexagon } from 'lucide-react';

// ── Typewriter hook ──────────────────────────────────────────
function useTypewriter(text: string, speed = 18) {
  const [displayed, setDisplayed] = useState(text);
  const prev = useRef(text);

  useEffect(() => {
    if (text === prev.current) return;
    prev.current = text;
    setDisplayed('');
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);

  return displayed;
}

// ── Status dot ───────────────────────────────────────────────
function StatusDot({ status }: { status: AgentTask['status'] }) {
  const cls: Record<AgentTask['status'], string> = {
    pending: 'bg-white/20',
    running: 'bg-yellow-400 animate-pulse shadow-[0_0_6px_rgba(250,204,21,0.6)]',
    completed: 'bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.5)]',
    failed: 'bg-red-400',
  };
  return <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${cls[status]}`} />;
}

// ── Artifact viewer ──────────────────────────────────────────
function ArtifactChip({ artifact, onClick }: { artifact: Artifact; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-xs font-mono bg-[#0d1117] border border-[#30363d] text-[#7dd3fc] px-2.5 py-1.5 rounded-md hover:border-[#58a6ff] hover:bg-[#161b22] transition-colors"
    >
      <FileCode size={12} />
      {artifact.filename.split('/').pop()}
    </button>
  );
}

function CodeModal({ artifact, onClose }: { artifact: Artifact; onClose: () => void }) {
  const lines = artifact.content.split('\n');
  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-[80vh] flex flex-col bg-[#0d1117] border border-[#30363d] rounded-xl overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#21262d] shrink-0">
          <div className="flex items-center gap-2">
            <FileCode size={14} className="text-[#7dd3fc]" />
            <span className="text-sm font-mono text-[#e6edf3]">{artifact.filename}</span>
            <span className="text-xs text-[#555] bg-[#161b22] border border-[#21262d] px-1.5 py-0.5 rounded">{artifact.language}</span>
          </div>
          <button onClick={onClose} className="text-[#555] hover:text-white text-lg leading-none">×</button>
        </div>
        <div className="overflow-auto flex-1 p-4">
          <div className="font-mono text-sm leading-5">
            {lines.map((line, i) => (
              <div key={i} className="flex gap-4 hover:bg-[#161b22] px-2 rounded">
                <span className="text-[#555] w-6 shrink-0 select-none text-right">{i + 1}</span>
                <span className="text-[#e6edf3] whitespace-pre">{line}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── A2A Card modal ────────────────────────────────────────────
function A2ACardModal({ task, onClose }: { task: AgentTask; onClose: () => void }) {
  const card = buildA2ACard(task);
  const json = JSON.stringify(card, null, 2);
  const [showJson, setShowJson] = useState(false);

  function highlight(line: string) {
    line = line.replace(/"([^"]+)":/g, '<span class="text-[#79c0ff]">"$1"</span>:');
    line = line.replace(/: "([^"]*)"(,?)/g, ': <span class="text-[#a5d6ff]">"$1"</span>$2');
    line = line.replace(/: (true|false)(,?)/g, ': <span class="text-[#ff7b72]">$1</span>$2');
    return line;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 backdrop-blur-md"
      style={{ background: 'rgba(0,0,0,0.85)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-purple-500/20"
        style={{ background: 'var(--bg-base)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/[0.08] shrink-0"
          style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.08), rgba(236,72,153,0.05))' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(236,72,153,0.15))', border: '1px solid rgba(168,85,247,0.3)' }}>
                {task.icon}
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">{task.role}</h2>
                <p className="text-white/50 text-sm font-mono mt-0.5">{card.url}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors text-xl leading-none p-1">✕</button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2.5 py-1 rounded-full font-semibold"
              style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(236,72,153,0.15))', border: '1px solid rgba(168,85,247,0.3)', color: '#c084fc' }}>
              A2A Agent Card
            </span>
            <span className="text-xs font-mono text-white/30">v{card.version}</span>
            <span className="text-xs font-mono text-white/30">·</span>
            <span className="text-xs font-mono text-emerald-400/70">streaming</span>
            <span className="text-xs font-mono text-white/30">·</span>
            <span className="text-xs font-mono text-white/30">{card.authentication.schemes[0]} auth</span>
          </div>
        </div>

        {/* Content — scrollable */}
        <div className="flex-1 overflow-y-auto">

          {/* Description */}
          <div className="px-6 py-4 border-b border-white/[0.06]">
            <p className="text-xs font-mono text-white/40 uppercase tracking-widest mb-2">Description</p>
            <p className="text-white/80 text-sm leading-relaxed">{card.description}</p>
          </div>

          {/* Capabilities */}
          <div className="px-6 py-4 border-b border-white/[0.06]">
            <p className="text-xs font-mono text-white/40 uppercase tracking-widest mb-3">Capabilities</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Streaming', value: card.capabilities.streaming, color: 'emerald' },
                { label: 'Push Notifications', value: card.capabilities.pushNotifications, color: 'yellow' },
                { label: 'State History', value: card.capabilities.stateTransitionHistory, color: 'blue' },
              ].map(cap => (
                <div key={cap.label} className="rounded-xl border border-white/[0.08] px-3 py-2.5 text-center" style={{ background: 'var(--bg-card)' }}>
                  <div className={`text-sm font-mono font-semibold ${cap.value ? `text-${cap.color}-400` : 'text-white/20'}`}>
                    {cap.value ? '✓' : '✗'}
                  </div>
                  <div className="text-xs text-white/50 mt-1">{cap.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div className="px-6 py-4 border-b border-white/[0.06]">
            <p className="text-xs font-mono text-white/40 uppercase tracking-widest mb-3">Skills</p>
            <div className="space-y-3">
              {card.skills.map(skill => (
                <div key={skill.id} className="rounded-xl border border-white/[0.08] p-4" style={{ background: 'var(--bg-card)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-violet-400 font-semibold text-sm">{skill.name}</span>
                    <span className="text-xs font-mono text-white/25">{skill.id}</span>
                  </div>
                  <p className="text-sm text-white/60 leading-relaxed mb-3">{skill.description}</p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {skill.tags.map(tag => (
                      <span key={tag} className="text-xs font-mono text-emerald-400/70 border border-emerald-500/20 bg-emerald-500/5 px-2 py-0.5 rounded-md">
                        {tag}
                      </span>
                    ))}
                  </div>
                  {skill.examples.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs text-white/30 font-mono">Examples:</p>
                      {skill.examples.map((ex, i) => (
                        <div key={i} className="text-sm text-white/50 pl-3 border-l-2 border-white/[0.06]">{ex}</div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* I/O Modes */}
          <div className="px-6 py-4 border-b border-white/[0.06]">
            <p className="text-xs font-mono text-white/40 uppercase tracking-widest mb-3">Input / Output</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-white/30 mb-1.5">Input Modes</p>
                <div className="flex flex-wrap gap-1.5">
                  {card.defaultInputModes.map(m => (
                    <span key={m} className="text-xs font-mono text-blue-400/70 border border-blue-500/20 bg-blue-500/5 px-2 py-0.5 rounded-md">{m}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-white/30 mb-1.5">Output Modes</p>
                <div className="flex flex-wrap gap-1.5">
                  {card.defaultOutputModes.map(m => (
                    <span key={m} className="text-xs font-mono text-orange-400/70 border border-orange-500/20 bg-orange-500/5 px-2 py-0.5 rounded-md">{m}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* JSON toggle */}
          <div className="px-6 py-4">
            <button
              onClick={() => setShowJson(v => !v)}
              className="flex items-center gap-2 text-sm font-mono text-white/40 hover:text-white/70 transition-colors mb-3"
            >
              <FileCode size={14} />
              <span>{showJson ? 'Hide' : 'Show'} agent-card.json</span>
              {showJson ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            {showJson && (
              <div className="rounded-xl border border-white/[0.08] overflow-hidden" style={{ background: 'var(--bg-panel)' }}>
                <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06]">
                  <span className="text-xs text-white/30 font-mono">agent-card.json</span>
                  <span className="text-xs text-white/20 font-mono">A2A v1.0</span>
                </div>
                <div className="p-4 font-mono text-sm leading-6 overflow-x-auto">
                  {json.split('\n').map((line, i) => (
                    <div key={i} className="flex gap-4 hover:bg-white/[0.02] px-2 rounded">
                      <span className="text-white/20 w-5 shrink-0 select-none text-right">{i + 1}</span>
                      <span dangerouslySetInnerHTML={{ __html: highlight(line) }} className="whitespace-pre" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/[0.08] flex items-center justify-between shrink-0" style={{ background: 'var(--bg-card)' }}>
          <div className="flex items-center gap-2">
            <Share2 size={14} className="text-purple-400/50" />
            <span className="text-sm text-white/40">
              {card.skills.length} skill{card.skills.length > 1 ? 's' : ''} · Google A2A Protocol
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-sm font-semibold px-5 py-2 rounded-xl transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', color: '#fff' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Terminal log ─────────────────────────────────────────────
function TerminalLog({ lines }: { lines: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: 'smooth' });
  }, [lines]);

  if (lines.length === 0) return null;
  return (
    <div className="mt-2 border border-white/[0.06] rounded-lg overflow-hidden" style={{ background: 'var(--bg-panel)' }}>
      <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-white/[0.06]">
        <Terminal size={12} className="text-white/30" />
        <span className="text-xs text-white/35 font-mono uppercase tracking-wider">sandbox</span>
      </div>
      <div ref={ref} className="max-h-32 overflow-y-auto p-3 space-y-0.5">
        {lines.map((line, i) => (
          <div key={i} className={`text-sm font-mono leading-5 whitespace-pre-wrap ${line.startsWith('$') ? 'text-[#7dd3fc]' : line.includes('error') || line.includes('FAIL') ? 'text-red-400' : line.includes('✓') || line.includes('passed') ? 'text-green-400' : 'text-white/50'}`}>
            {line}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Task card ─────────────────────────────────────────────────
function TaskCard({
  task,
  terminalLines,
  isCollabTarget,
  isCollabSource,
}: {
  task: AgentTask;
  terminalLines: string[];
  isCollabTarget: boolean;
  isCollabSource: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null);
  const [showA2A, setShowA2A] = useState(false);
  const statusText = useTypewriter(task.statusText, 20);

  const borderClass =
    isCollabTarget ? 'border-purple-500/60 shadow-[0_0_12px_rgba(168,85,247,0.25)]' :
    isCollabSource ? 'border-purple-400/40' :
    task.status === 'running' ? 'border-yellow-500/40 shadow-[0_0_8px_rgba(234,179,8,0.1)]' :
    task.status === 'completed' ? 'border-green-500/25' :
    task.status === 'failed' ? 'border-red-500/25' :
    'border-white/[0.06]';

  const bgClass =
    task.status === 'running' ? 'bg-yellow-500/[0.04]' :
    task.status === 'completed' ? 'bg-green-500/[0.04]' :
    task.status === 'failed' ? 'bg-red-500/[0.04]' :
    '';

  return (
    <>
      <div className={`rounded-xl border transition-all duration-500 ${borderClass} ${bgClass} overflow-hidden`} style={{ background: bgClass ? undefined : 'var(--bg-card)' }}>
        {/* Header row */}
        <div
          className="flex items-center gap-2 px-4 py-3 cursor-pointer select-none"
          onClick={() => setExpanded(v => !v)}
        >
          <span className="text-base shrink-0">{task.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-violet-400 font-semibold text-base">{task.role}</span>
              <StatusDot status={task.status} />
              {task.status === 'completed' && (
                <span className="text-xs text-green-400 font-mono">✓ done</span>
              )}
            </div>
            <p className="text-sm text-white/45 font-mono mt-0.5 truncate">{statusText}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {task.artifacts.length > 0 && (
              <span className="text-xs text-white/35 font-mono">{task.artifacts.length} file{task.artifacts.length > 1 ? 's' : ''}</span>
            )}
            <button
              onClick={e => { e.stopPropagation(); setShowA2A(true); }}
              title="View A2A Agent Card"
              className="flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-lg transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(236,72,153,0.15))', border: '1px solid rgba(168,85,247,0.3)' }}
            >
              <Share2 size={11} className="text-purple-400" />
              <span className="text-purple-300 font-semibold">A2A</span>
            </button>
            {expanded ? <ChevronDown size={14} className="text-white/30" /> : <ChevronRight size={14} className="text-white/30" />}
          </div>
        </div>

        {/* Expanded body */}
        {expanded && (
          <div className="px-4 pb-3 border-t border-white/[0.07] pt-3 space-y-3">
            {/* Goal */}
            <p className="text-sm text-white/45 italic">{task.goal}</p>

            {/* Terminal */}
            <TerminalLog lines={terminalLines} />

            {/* Findings */}
            {task.findings.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs text-white/35 uppercase tracking-wider font-mono">Findings</p>
                {task.findings.map((f, i) => (
                  <div key={i} className="flex gap-2 text-sm text-white/70">
                    <span className="text-green-400 shrink-0">✓</span>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Artifacts */}
            {task.artifacts.length > 0 && (
              <div>
                <p className="text-xs text-white/35 uppercase tracking-wider font-mono mb-2">Files</p>
                <div className="flex flex-wrap gap-1.5">
                  {task.artifacts.map((a, i) => (
                    <ArtifactChip key={i} artifact={a} onClick={() => setSelectedArtifact(a)} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedArtifact && (
        <CodeModal artifact={selectedArtifact} onClose={() => setSelectedArtifact(null)} />
      )}

      {showA2A && (
        <A2ACardModal task={task} onClose={() => setShowA2A(false)} />
      )}
    </>
  );
}

// ── Collaboration toast ───────────────────────────────────────
function CollabToast({ event, tasks }: { event: VrlmEvent; tasks: Record<string, AgentTask> }) {
  const from = event.fromTaskId ? tasks[event.fromTaskId]?.role : '?';
  const to = event.toTaskId ? tasks[event.toTaskId]?.role : '?';
  return (
    <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-purple-500/8 border border-purple-500/20 animate-pulse-once">
      <span className="text-base shrink-0">🔗</span>
      <div>
        <div className="text-sm text-purple-300 font-medium">
          {from} → {to}
        </div>
        <div className="text-sm text-purple-400/80 font-mono mt-0.5">{String(event.data.message ?? '')}</div>
      </div>
    </div>
  );
}

// ── Progress bar ──────────────────────────────────────────────
function ProgressBar({ tasks, rootId }: { tasks: Record<string, AgentTask>; rootId: string | null }) {
  const workers = Object.values(tasks).filter(t => t.id !== rootId);
  if (workers.length === 0) return null;
  const done = workers.filter(t => t.status === 'completed').length;
  const pct = Math.round((done / workers.length) * 100);

  return (
    <div className="px-4 py-2.5 border-b border-white/[0.07]">
      <div className="flex items-center justify-between text-xs text-white/40 font-mono mb-1.5">
        <span>{done}/{workers.length} agents complete</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ── Main panel ────────────────────────────────────────────────
interface Props {
  tasks: Record<string, AgentTask>;
  rootId: string | null;
  events: VrlmEvent[];
}

export function AgentPanel({ tasks, rootId, events }: Props) {
  const allTasks = Object.values(tasks);
  const rootTask = rootId ? tasks[rootId] : null;
  const workerTasks = allTasks.filter(t => t.id !== rootId);
  const collabEvents = events.filter(e => e.type === 'collaboration');
  const [visibleIds, setVisibleIds] = useState<Set<string>>(new Set());

  // stagger card appearance
  useEffect(() => {
    allTasks.forEach((t, i) => {
      setTimeout(() => setVisibleIds(prev => new Set([...prev, t.id])), i * 120);
    });
  }, [allTasks.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // terminal lines per task
  const terminalByTask: Record<string, string[]> = {};
  for (const e of events) {
    if (e.type === 'terminal' && e.taskId) {
      if (!terminalByTask[e.taskId]) terminalByTask[e.taskId] = [];
      const output = String(e.data.output ?? '');
      terminalByTask[e.taskId].push(...output.split('\n').filter(Boolean));
    }
  }

  // which tasks are in active collaboration
  const collabTargets = new Set(collabEvents.map(e => e.toTaskId).filter(Boolean) as string[]);
  const collabSources = new Set(collabEvents.map(e => e.fromTaskId).filter(Boolean) as string[]);

  if (allTasks.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-center p-8">
        <div>
          <Hexagon size={48} className="text-white/15 mx-auto mb-4" />
          <p className="text-white/30 text-base">Agent activity appears here</p>
          <p className="text-white/20 text-sm mt-1">Tasks and agent progress will show when a run starts</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <ProgressBar tasks={tasks} rootId={rootId} />

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Root orchestrator */}
        {rootTask && visibleIds.has(rootTask.id) && (
          <div className="transition-all duration-300 animate-slide-in">
            <div className="text-xs text-white/30 uppercase tracking-widest font-mono mb-2">Orchestrator</div>
            <TaskCard
              task={rootTask}
              terminalLines={terminalByTask[rootTask.id] ?? []}
              isCollabTarget={false}
              isCollabSource={false}
            />
          </div>
        )}

        {/* Worker agents */}
        {workerTasks.length > 0 && (
          <div>
            <div className="text-xs text-white/30 uppercase tracking-widest font-mono mb-2">
              Agent Team · {workerTasks.length} specialists
            </div>
            <div className="space-y-2">
              {workerTasks.map(task => (
                visibleIds.has(task.id) ? (
                  <div key={task.id} className="transition-all duration-300 animate-slide-in">
                    <TaskCard
                      task={task}
                      terminalLines={terminalByTask[task.id] ?? []}
                      isCollabTarget={collabTargets.has(task.id)}
                      isCollabSource={collabSources.has(task.id)}
                    />
                  </div>
                ) : null
              ))}
            </div>
          </div>
        )}

        {/* Collaboration events */}
        {collabEvents.length > 0 && (
          <div>
            <div className="text-xs text-white/30 uppercase tracking-widest font-mono mb-2">Collaborations</div>
            <div className="space-y-2">
              {collabEvents.map((e, i) => (
                <CollabToast key={i} event={e} tasks={tasks} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
