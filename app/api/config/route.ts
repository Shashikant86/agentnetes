// force-static is required for static export (GitHub Pages) compatibility.
// In server mode (npm run dev / agentnetes serve), env vars are read at build
// time. Restart the server after changing env vars like GOOGLE_API_KEY.
export const dynamic = 'force-static';

export async function GET() {
  return Response.json({
    googleApiKeySet: !!(process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY),
    sandboxProvider: process.env.SANDBOX_PROVIDER ?? 'docker',
    simulationMode: process.env.SIMULATION_MODE === 'true',
  });
}
