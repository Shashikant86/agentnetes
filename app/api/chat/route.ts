import { SimulatedVrlmRuntime } from '@/lib/vrlm/simulated-runtime';
import { VrlmEventEmitter } from '@/lib/vrlm/events';
import { VrlmRuntime } from '@/lib/vrlm/runtime';
import { DEFAULT_CONFIG, VrlmConfig } from '@/lib/vrlm/types';

export const maxDuration = 300;

/**
 * Use real execution when GATEWAY_API_KEY (or AI_GATEWAY_BASE_URL) is set
 * AND SIMULATION_MODE is not "true".
 * Falls back to simulation so the demo always works.
 */
function useRealRuntime(): boolean {
  if (process.env.SIMULATION_MODE === 'true') return false;
  return !!(process.env.AI_GATEWAY_BASE_URL ?? process.env.GATEWAY_API_KEY);
}

export async function POST(req: Request) {
  const { message, plannerModel, workerModel } = await req.json();

  const config: VrlmConfig = {
    ...DEFAULT_CONFIG,
    plannerModel: plannerModel ?? DEFAULT_CONFIG.plannerModel,
    workerModel: workerModel ?? DEFAULT_CONFIG.workerModel,
    repoUrl: process.env.DEMO_REPO_URL ?? 'https://github.com/vercel/ai',
    repoSnapshotId: process.env.DEMO_REPO_SNAPSHOT_ID,
  };

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      function send(event: unknown) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      }

      if (useRealRuntime()) {
        // ── Real execution ────────────────────────────────────────────────────
        const emitter = new VrlmEventEmitter();
        const runtime = new VrlmRuntime(emitter, config);

        emitter.on((event) => send(event));

        runtime.run(message).catch((err) => {
          send({ type: 'error', data: { message: String(err) } });
        }).finally(() => {
          controller.close();
        });
      } else {
        // ── Simulation (always works, demo backup) ────────────────────────────
        const runtime = new SimulatedVrlmRuntime(config);

        runtime.onEvent((event) => send(event));

        runtime.run(message).then(() => {
          controller.close();
        }).catch((err) => {
          send({ type: 'error', data: { message: String(err) } });
          controller.close();
        });
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
