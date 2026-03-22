import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';
import pc from 'picocolors';

export async function serve(port: number): Promise<void> {
  // When installed via npm, the CLI binary is at dist/index.js and web/ is a sibling of dist/
  const webDir = join(__dirname, '..', 'web');
  const serverJs = join(webDir, 'server.js');

  if (!existsSync(serverJs)) {
    console.error(pc.red('Error: web UI not found.'));
    console.error('');
    console.error('The standalone web UI is not bundled in this installation.');
    console.error('Build it from the repo root with:');
    console.error('');
    console.error(pc.cyan('  bash scripts/build-serve.sh'));
    console.error('  cd packages/cli && npm run build && npm publish');
    console.error('');
    process.exit(1);
  }

  console.log('');
  console.log(pc.bold(pc.white('Agentnetes')));
  console.log(pc.dim('Zero to a self-organizing AI agency. On demand.'));
  console.log('');
  console.log(pc.dim('Starting web UI...'));
  console.log('');

  const env = {
    ...process.env,
    PORT: String(port),
    HOSTNAME: '0.0.0.0',
  };

  const child = spawn('node', [serverJs], {
    cwd: webDir,
    env,
    stdio: 'pipe',
  });

  let started = false;

  child.stdout.on('data', (data: Buffer) => {
    const line = data.toString().trim();
    if (!started && (line.includes('ready') || line.includes('started') || line.includes('listening') || line.includes(String(port)))) {
      started = true;
      console.log(pc.green('Ready') + ' ' + pc.bold(`http://localhost:${port}`));
      console.log('');
      console.log(pc.dim('Set GOOGLE_API_KEY in your environment to run real agents.'));
      console.log(pc.dim('Press Ctrl+C to stop.'));
      console.log('');
    } else {
      process.stdout.write(data);
    }
  });

  child.stderr.on('data', (data: Buffer) => {
    process.stderr.write(data);
  });

  child.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.error(pc.red(`Server exited with code ${code}`));
      process.exit(code);
    }
  });

  // Wait until the child exits (or Ctrl+C)
  await new Promise<void>((resolve) => {
    child.on('exit', () => resolve());
    process.on('SIGINT', () => {
      child.kill('SIGTERM');
      resolve();
    });
    process.on('SIGTERM', () => {
      child.kill('SIGTERM');
      resolve();
    });
  });
}
