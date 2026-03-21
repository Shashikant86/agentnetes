import { generateText, stepCountIs, ToolLoopAgent } from 'ai';
import { z } from 'zod';
import { gateway } from '../gateway';
import { createAgentTools } from './tools';
import {
  createWorkerSandbox,
  collectNewFiles,
  stopSandbox,
} from './sandbox-manager';
import {
  PLANNER_SYSTEM_PROMPT,
  buildPlannerPrompt,
  buildWorkerPrompt,
  buildSynthesisPrompt,
} from './prompts';
import { VrlmEventEmitter } from './events';
import { buildA2ACard } from '../a2a';
import type { AgentTask, Artifact, VrlmConfig } from './types';

// ── Planner schema ────────────────────────────────────────────────────────────

const WorkerPlanSchema = z.object({
  workers: z.array(
    z.object({
      role: z.string(),
      goal: z.string(),
      icon: z.string().default('🤖'),
    }),
  ),
});

type WorkerPlan = z.infer<typeof WorkerPlanSchema>;

// ── ID helpers ────────────────────────────────────────────────────────────────

function uid(): string {
  return crypto.randomUUID();
}

function detectLanguage(filename: string): string {
  const ext = filename.split('.').pop() ?? '';
  const map: Record<string, string> = {
    ts: 'typescript', tsx: 'tsx', js: 'javascript', jsx: 'jsx',
    json: 'json', md: 'markdown', sh: 'bash', py: 'python',
  };
  return map[ext] ?? 'text';
}

// ── Real VrlmRuntime ──────────────────────────────────────────────────────────

export class VrlmRuntime {
  private emitter: VrlmEventEmitter;
  private config: VrlmConfig;

  constructor(emitter: VrlmEventEmitter, config: VrlmConfig) {
    this.emitter = emitter;
    this.config = config;
  }

  async run(goal: string): Promise<void> {
    const snapshotId = this.config.repoSnapshotId;
    const repoUrl = this.config.repoUrl;

    try {
      // ── Step 1: Root planner ────────────────────────────────────────────────
      const rootTask = this.makeTask({
        role: 'Tech Lead',
        goal: `Plan and coordinate: ${goal}`,
        icon: '🧠',
        depth: 0,
        parentId: null,
      });

      this.emitTaskCreated(rootTask);
      this.emitTaskUpdate(rootTask.id, 'running', 'Planning agent team...');

      const plan = await this.runPlanner(goal);

      this.emitTaskUpdate(rootTask.id, 'running', `Spawning ${plan.workers.length} agents`);

      // ── Step 2: Create worker tasks ─────────────────────────────────────────
      const workerTasks: AgentTask[] = plan.workers
        .slice(0, this.config.maxWorkers)
        .map(w =>
          this.makeTask({
            role: w.role,
            goal: w.goal,
            icon: w.icon,
            depth: 1,
            parentId: rootTask.id,
          }),
        );

      for (const task of workerTasks) {
        rootTask.children.push(task.id);
        this.emitTaskCreated(task);
      }

      // ── Step 3: Run workers in parallel ────────────────────────────────────
      const workerResults = await Promise.allSettled(
        workerTasks.map(task => this.runWorker(task, repoUrl, snapshotId)),
      );

      // ── Step 4: Collect summaries and synthesize ────────────────────────────
      const summaries: string[] = [];
      for (let i = 0; i < workerResults.length; i++) {
        const result = workerResults[i];
        if (result.status === 'fulfilled') {
          summaries.push(`${workerTasks[i].role}: ${result.value}`);
        } else {
          summaries.push(`${workerTasks[i].role}: FAILED - ${result.reason}`);
        }
      }

      // ── Step 5: Root synthesis ──────────────────────────────────────────────
      this.emitTaskUpdate(rootTask.id, 'running', 'Synthesizing results...');

      const synthesis = await this.runSynthesis(goal, summaries);

      this.emitter.emit({
        type: 'synthesis',
        taskId: rootTask.id,
        data: { content: synthesis },
      });

      this.emitTaskCompleted(rootTask.id, [], []);

      this.emitter.emit({
        type: 'done',
        data: { content: synthesis },
      });
    } catch (err) {
      this.emitter.emit({
        type: 'error',
        data: { message: String(err) },
      });
    } finally {
      this.emitter.close();
    }
  }

  // ── Planner ─────────────────────────────────────────────────────────────────

  private async runPlanner(goal: string): Promise<WorkerPlan> {
    const { text } = await generateText({
      model: gateway(this.config.plannerModel),
      system: PLANNER_SYSTEM_PROMPT,
      prompt: buildPlannerPrompt(goal),
      maxOutputTokens: 2000,
    });

    // Strip markdown code fences if model wrapped in ```json ... ```
    const clean = text.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();
    const raw = JSON.parse(clean);
    return WorkerPlanSchema.parse(raw);
  }

  // ── Worker ──────────────────────────────────────────────────────────────────

  private async runWorker(task: AgentTask, repoUrl: string, snapshotId?: string): Promise<string> {
    let sandbox = await createWorkerSandbox(repoUrl, snapshotId);
    task.sandboxId = (sandbox as any).id ?? 'sandbox';

    this.emitTaskUpdate(task.id, 'running', 'Sandbox ready');

    // Emit the A2A card
    this.emitter.emit({
      type: 'task-updated',
      taskId: task.id,
      data: {
        a2aCard: buildA2ACard(task),
        status: 'running',
        statusText: 'Sandbox ready',
      },
    });

    const tools = createAgentTools(sandbox);
    const findings: string[] = [];
    const terminalLines: string[] = [];

    const agent = new ToolLoopAgent({
      model: gateway(this.config.workerModel),
      tools,
      stopWhen: stepCountIs(this.config.maxStepsPerAgent),
      instructions: buildWorkerPrompt(task, findings),

      onStepFinish: async ({ text, toolCalls, toolResults }) => {
        // Emit text as findings
        if (text?.trim()) {
          const lines = text.trim().split('\n').filter(Boolean);
          for (const line of lines.slice(0, 3)) {
            findings.push(line);
            this.emitter.emit({
              type: 'finding',
              taskId: task.id,
              data: { text: line },
            });
          }
        }

        // Emit tool calls as terminal output
        for (let i = 0; i < (toolCalls?.length ?? 0); i++) {
          const call = toolCalls![i];
          const result = toolResults?.[i] as { result?: unknown } | undefined;
          const input = ((call as any).input ?? {}) as Record<string, string>;

          let cmdLine = '';
          if (call.toolName === 'search') {
            cmdLine = `$ grep -r "${input.pattern}" ${input.path ?? '.'} ${input.fileGlob ? `--include="${input.fileGlob}"` : ''}`;
          } else {
            cmdLine = `$ ${input.command ?? ''}`;
          }

          terminalLines.push(cmdLine);
          this.emitter.emit({
            type: 'terminal',
            taskId: task.id,
            data: { line: cmdLine },
          });

          if (result?.result) {
            const output = typeof result.result === 'string'
              ? result.result
              : (result.result as any).output ?? JSON.stringify(result.result);
            const preview = String(output).split('\n').slice(0, 8).join('\n');
            if (preview.trim()) {
              this.emitter.emit({
                type: 'terminal',
                taskId: task.id,
                data: { line: preview, dim: true },
              });
            }
          }
        }

        this.emitTaskUpdate(task.id, 'running', `Step ${terminalLines.length} done`);
      },
    });

    // Stream the agent — MUST consume fullStream to drive the tool loop
    const result = await agent.stream({ prompt: task.goal });
    for await (const _ of result.fullStream) { /* drives the loop */ }
    const finalText = await result.text;

    // Collect artifacts: scan the sandbox output directory
    const artifacts: Artifact[] = [];
    try {
      const newFiles = await collectNewFiles(sandbox, '/vercel/sandbox', ['ts', 'tsx', 'js', 'json', 'md']);
      for (const file of newFiles) {
        const filename = file.path.split('/').pop() ?? file.path;
        const artifact: Artifact = {
          filename,
          content: file.content,
          language: detectLanguage(filename),
        };
        artifacts.push(artifact);
        this.emitter.emit({
          type: 'artifact',
          taskId: task.id,
          data: { artifact },
        });
      }
    } catch {
      // artifact collection is best-effort
    }

    this.emitTaskCompleted(task.id, findings, artifacts);
    await stopSandbox(sandbox);

    return finalText || findings.join('\n') || 'No output';
  }

  // ── Synthesis ────────────────────────────────────────────────────────────────

  private async runSynthesis(goal: string, summaries: string[]): Promise<string> {
    const { text } = await generateText({
      model: gateway(this.config.plannerModel),
      prompt: buildSynthesisPrompt(goal, summaries),
      maxOutputTokens: 1500,
    });
    return text;
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  private makeTask(params: {
    role: string;
    goal: string;
    icon: string;
    depth: number;
    parentId: string | null;
  }): AgentTask {
    return {
      id: uid(),
      parentId: params.parentId,
      role: params.role,
      goal: params.goal,
      icon: params.icon,
      status: 'pending',
      statusText: 'Waiting',
      findings: [],
      artifacts: [],
      children: [],
      sandboxId: null,
      model: params.depth === 0 ? this.config.plannerModel : this.config.workerModel,
      createdAt: Date.now(),
      completedAt: null,
      depth: params.depth,
    };
  }

  private emitTaskCreated(task: AgentTask) {
    this.emitter.emit({ type: 'task-created', taskId: task.id, data: { task } });
  }

  private emitTaskUpdate(id: string, status: AgentTask['status'], statusText: string) {
    this.emitter.emit({ type: 'task-updated', taskId: id, data: { status, statusText } });
  }

  private emitTaskCompleted(id: string, findings: string[], artifacts: Artifact[]) {
    this.emitter.emit({
      type: 'task-completed',
      taskId: id,
      data: { findings, artifacts },
    });
  }
}
