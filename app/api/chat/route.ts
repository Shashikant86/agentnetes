import { SimulatedVrlmRuntime } from '@/lib/vrlm/simulated-runtime';
import { VrlmEventEmitter } from '@/lib/vrlm/events';
import { VrlmRuntime } from '@/lib/vrlm/runtime';
import { DEFAULT_CONFIG, VrlmConfig } from '@/lib/vrlm/types';

export const maxDuration = 300;

export async function POST(req: Request) {
  const {
    message,
    plannerModel,
    workerModel,
    // UI-provided settings (override env vars)
    googleApiKey,
    sandboxProvider,
    repoUrl,
  } = await req.json();

  const resolvedApiKey = googleApiKey || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const useReal = !!resolvedApiKey && process.env.SIMULATION_MODE !== 'true';

  const config: VrlmConfig = {
    ...DEFAULT_CONFIG,
    plannerModel: plannerModel ?? DEFAULT_CONFIG.plannerModel,
    workerModel: workerModel ?? DEFAULT_CONFIG.workerModel,
    repoUrl: repoUrl || process.env.DEMO_REPO_URL || 'https://github.com/expressjs/express',
    repoSnapshotId: process.env.DEMO_REPO_SNAPSHOT_ID,
    googleApiKey: resolvedApiKey,
    sandboxProvider: sandboxProvider ?? (process.env.SANDBOX_PROVIDER as VrlmConfig['sandboxProvider']) ?? 'docker',
  };

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      function send(event: unknown) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      }

      if (useReal) {
        const emitter = new VrlmEventEmitter();
        const runtime = new VrlmRuntime(emitter, config);

        emitter.on((event) => send(event));

        runtime.run(message).catch((err) => {
          send({ type: 'error', data: { message: String(err) } });
        }).finally(() => {
          controller.close();
        });
      } else {
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
