import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import pc from 'picocolors';
import { VrlmRuntime } from '../../../../lib/vrlm/runtime.js';
import { VrlmEventEmitter } from '../../../../lib/vrlm/events.js';
import { DEFAULT_CONFIG } from '../../../../lib/vrlm/types.js';
import { TerminalRenderer } from '../renderer.js';

interface RunOptions {
  goal: string;
  repoUrl: string;
}

// Load snapshot ID from .agentnetes/snapshot.json if it matches the current repo
function loadSnapshotId(repoUrl: string): string | undefined {
  const snapshotFile = join(process.cwd(), '.agentnetes', 'snapshot.json');
  if (!existsSync(snapshotFile)) return undefined;
  try {
    const data = JSON.parse(readFileSync(snapshotFile, 'utf-8')) as { repoUrl?: string; snapshotId?: string };
    if (data.repoUrl === repoUrl) return data.snapshotId;
  } catch {
    // ignore
  }
  return undefined;
}

export async function run({ goal, repoUrl }: RunOptions): Promise<void> {
  const snapshotId = loadSnapshotId(repoUrl);

  console.log('');
  console.log(pc.bold(pc.white('Agentnetes')));
  console.log(pc.dim('Zero to a self-organizing AI agency. On demand.'));
  console.log('');
  console.log(pc.dim('Repo:    ') + repoUrl);
  console.log(pc.dim('Goal:    ') + pc.white(goal));
  if (snapshotId) {
    console.log(pc.dim('Snapshot:') + pc.green(' pre-warmed (fast start)'));
  } else {
    console.log(pc.dim('Sandbox: ') + pc.yellow('cloning from git (run "agentnetes snapshot create" to speed this up)'));
  }
  console.log('');

  const emitter = new VrlmEventEmitter();
  const renderer = new TerminalRenderer();

  const config = {
    ...DEFAULT_CONFIG,
    repoUrl,
    repoSnapshotId: snapshotId,
    plannerModel: process.env.PLANNER_MODEL ?? DEFAULT_CONFIG.plannerModel,
    workerModel: process.env.WORKER_MODEL ?? DEFAULT_CONFIG.workerModel,
  };

  emitter.on(event => renderer.render(event));

  const runtime = new VrlmRuntime(emitter, config);
  await runtime.run(goal);
}
