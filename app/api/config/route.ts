export const dynamic = 'force-static';

export async function GET() {
  return Response.json({
    googleApiKeySet: !!(process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY),
    sandboxProvider: process.env.SANDBOX_PROVIDER ?? 'docker',
    simulationMode: process.env.SIMULATION_MODE === 'true',
  });
}
