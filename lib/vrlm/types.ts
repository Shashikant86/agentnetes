export type AgentStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface Artifact {
  filename: string;
  content: string;
  language: string;
}

export interface AgentTask {
  id: string;
  parentId: string | null;
  role: string;
  goal: string;
  status: AgentStatus;
  statusText: string;
  findings: string[];
  artifacts: Artifact[];
  children: string[];
  sandboxId: string | null;
  model: string;
  createdAt: number;
  completedAt: number | null;
  depth: number;
  icon: string;
}

export interface TaskTree {
  rootId: string;
  tasks: Record<string, AgentTask>;
}

export type VrlmEventType =
  | 'task-created'
  | 'task-updated'
  | 'task-completed'
  | 'task-failed'
  | 'finding'
  | 'artifact'
  | 'collaboration'
  | 'terminal'
  | 'synthesis'
  | 'done'
  | 'error';

export interface VrlmEvent {
  type: VrlmEventType;
  taskId?: string;
  fromTaskId?: string;
  toTaskId?: string;
  data: Record<string, unknown>;
}

export interface VrlmConfig {
  maxDepth: number;
  maxWorkers: number;
  maxTotalTasks: number;
  maxStepsPerAgent: number;
  plannerModel: string;
  workerModel: string;
  repoSnapshotId?: string;
  repoUrl: string;
  // UI-provided overrides (from settings panel)
  googleApiKey?: string;
  sandboxProvider?: 'docker' | 'local' | 'vercel' | 'e2b' | 'daytona';
}

export const DEFAULT_CONFIG: VrlmConfig = {
  maxDepth: 3,
  maxWorkers: 6,
  maxTotalTasks: 15,
  maxStepsPerAgent: 20,
  plannerModel: 'google/gemini-2.5-pro',
  workerModel: 'google/gemini-2.5-flash',
  repoUrl: '',
};
