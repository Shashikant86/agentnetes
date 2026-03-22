'use client';

import { useState, useEffect, useRef } from 'react';
import { AgentTask, VrlmEvent, Artifact } from '@/lib/vrlm/types';
import { buildA2ACard } from '@/lib/a2a';
import { ChevronDown, ChevronRight, Terminal, FileCode, Share2 } from 'lucide-react';

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
      className="flex items-center gap-1.5 text-[10px] font-mono bg-[#0d1117] border border-[#30363d] text-[#7dd3fc] px-2 py-1 rounded hover:border-[#58a6ff] hover:bg-[#161b22] transition-colors"
    >
      <FileCode size={10} />
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
            <span className="text-[10px] text-[#555] bg-[#161b22] border border-[#21262d] px-1.5 py-0.5 rounded">{artifact.language}</span>
          </div>
          <button onClick={onClose} className="text-[#555] hover:text-white text-lg leading-none">×</button>
        </div>
        <div className="overflow-auto flex-1 p-4">
          <div className="font-mono text-xs leading-5">
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
  const lines = json.split('\n');

  function highlight(line: string) {
    // keys
    line = line.replace(/"([^"]+)":/g, '<span class="text-[#79c0ff]">"$1"</span>:');
    // string values
    line = line.replace(/: "([^"]*)"(,?)/g, ': <span class="text-[#a5d6ff]">"$1"</span>$2');
    // booleans
    line = line.replace(/: (true|false)(,?)/g, ': <span class="text-[#ff7b72]">$1</span>$2');
    return line;
  }

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[85vh] flex flex-col bg-[#0d1117] border border-[#30363d] rounded-xl overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#21262d] shrink-0 bg-[#161b22]">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <span className="text-base">{task.icon}</span>
              <span className="text-sm font-semibold text-white">{task.role}</span>
            </div>
            <span className="text-[10px] font-mono bg-purple-500/15 border border-purple-500/30 text-purple-300 px-2 py-0.5 rounded-full">
              A2A Agent Card
            </span>
          </div>
          <button onClick={onClose} className="text-[#555] hover:text-white text-lg leading-none">×</button>
        </div>

        {/* A2A info banner */}
        <div className="px-4 py-2.5 border-b border-[#21262d] bg-purple-500/5 flex items-start gap-2.5 shrink-0">
          <Share2 size={13} className="text-purple-400 mt-0.5 shrink-0" />
          <p className="text-[11px] text-purple-300/80 leading-relaxed">
            This agent can be published as an independent A2A service. Other swarms can discover and delegate tasks to it via the A2A protocol.
            <span className="text-purple-400 ml-1 font-mono">POST {card.url}</span>
          </p>
        </div>

        {/* Skills summary */}
        <div className="px-4 py-3 border-b border-[#21262d] shrink-0">
          <p className="text-[10px] text-[#555] uppercase tracking-widest font-mono mb-2">Skills</p>
          <div className="flex flex-wrap gap-2">
            {card.skills.map(skill => (
              <div key={skill.id} className="bg-[#161b22] border border-[#21262d] rounded-lg px-3 py-2">
                <p className="text-[11px] text-white font-medium">{skill.name}</p>
                <p className="text-[10px] text-[#666] mt-0.5">{skill.description}</p>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {skill.tags.map(tag => (
                    <span key={tag} className="text-[9px] font-mono bg-[#0d1117] border border-[#30363d] text-[#7dd3fc] px-1.5 py-0.5 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* JSON */}
        <div className="flex-1 overflow-auto">
          <div className="flex items-center gap-1.5 px-4 py-2 border-b border-[#21262d] sticky top-0 bg-[#0d1117]">
            <FileCode size={11} className="text-[#555]" />
            <span className="text-[10px] text-[#555] font-mono">agent-card.json</span>
            <span className="ml-auto text-[10px] text-[#555] font-mono">A2A v1.0</span>
          </div>
          <div className="p-4 font-mono text-xs leading-5">
            {lines.map((line, i) => (
              <div key={i} className="flex gap-4 hover:bg-[#161b22] px-2 rounded">
                <span className="text-[#555] w-5 shrink-0 select-none text-right">{i + 1}</span>
                <span dangerouslySetInnerHTML={{ __html: highlight(line) }} className="whitespace-pre text-[#e6edf3]" />
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-[#21262d] flex items-center justify-between bg-[#161b22] shrink-0">
          <span className="text-[10px] text-[#555] font-mono">
            {card.skills.length} skill{card.skills.length > 1 ? 's' : ''} · streaming: {String(card.capabilities.streaming)} · auth: {card.authentication.schemes[0]}
          </span>
          <button
            onClick={onClose}
            className="text-[10px] font-mono text-[#555] border border-[#333] rounded px-3 py-1 hover:text-white hover:border-[#555] transition-colors"
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
        <Terminal size={10} className="text-white/30" />
        <span className="text-[9px] text-white/30 font-mono uppercase tracking-wider">sandbox</span>
      </div>
      <div ref={ref} className="max-h-28 overflow-y-auto p-3 space-y-0.5">
        {lines.map((line, i) => (
          <div key={i} className={`text-[10px] font-mono leading-4 whitespace-pre-wrap ${line.startsWith('$') ? 'text-[#7dd3fc]' : line.includes('error') || line.includes('FAIL') ? 'text-red-400' : line.includes('✓') || line.includes('passed') ? 'text-green-400' : 'text-white/50'}`}>
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
              <span className="text-white font-medium text-sm">{task.role}</span>
              <StatusDot status={task.status} />
              {task.status === 'completed' && (
                <span className="text-[10px] text-green-400 font-mono">✓ done</span>
              )}
            </div>
            <p className="text-[11px] text-white/40 font-mono mt-0.5 truncate">{statusText}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {task.artifacts.length > 0 && (
              <span className="text-[10px] text-white/30 font-mono">{task.artifacts.length} file{task.artifacts.length > 1 ? 's' : ''}</span>
            )}
            <button
              onClick={e => { e.stopPropagation(); setShowA2A(true); }}
              title="View A2A Agent Card"
              className="text-[9px] font-mono text-purple-500/60 border border-purple-500/20 rounded px-1.5 py-0.5 hover:text-purple-300 hover:border-purple-400/50 transition-colors"
            >
              A2A
            </button>
            {expanded ? <ChevronDown size={12} className="text-white/30" /> : <ChevronRight size={12} className="text-white/30" />}
          </div>
        </div>

        {/* Expanded body */}
        {expanded && (
          <div className="px-4 pb-3 border-t border-white/[0.07] pt-3 space-y-3">
            {/* Goal */}
            <p className="text-[11px] text-white/40 italic">{task.goal}</p>

            {/* Terminal */}
            <TerminalLog lines={terminalLines} />

            {/* Findings */}
            {task.findings.length > 0 && (
              <div className="space-y-1">
                <p className="text-[10px] text-white/30 uppercase tracking-wider font-mono">Findings</p>
                {task.findings.map((f, i) => (
                  <div key={i} className="flex gap-2 text-[11px] text-white/65">
                    <span className="text-green-400 shrink-0">✓</span>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Artifacts */}
            {task.artifacts.length > 0 && (
              <div>
                <p className="text-[10px] text-white/30 uppercase tracking-wider font-mono mb-2">Files</p>
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
        <div className="text-[11px] text-purple-300 font-medium">
          {from} → {to}
        </div>
        <div className="text-[10px] text-purple-400/80 font-mono mt-0.5">{String(event.data.message ?? '')}</div>
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
    <div className="px-4 py-2 border-b border-white/[0.07]">
      <div className="flex items-center justify-between text-[10px] text-white/30 font-mono mb-1.5">
        <span>{done}/{workers.length} agents complete</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-yellow-500 to-green-400 rounded-full transition-all duration-700 ease-out"
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
          <div className="text-5xl mb-3 opacity-20">⬡</div>
          <p className="text-white/25 text-sm">Agent activity appears here</p>
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
            <div className="text-[10px] text-white/25 uppercase tracking-widest font-mono mb-2">Orchestrator</div>
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
            <div className="text-[10px] text-white/25 uppercase tracking-widest font-mono mb-2">
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
            <div className="text-[10px] text-white/25 uppercase tracking-widest font-mono mb-2">Collaborations</div>
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
