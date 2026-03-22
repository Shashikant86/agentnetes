# Contributing to Agentnetes

Thanks for your interest in contributing! Here's how to get started.

## Development Setup

```bash
# Clone the repo
git clone https://github.com/Shashikant86/agentnetes.git
cd agentnetes

# Install dependencies
npm install

# Create your environment file
cp .env.example .env.local
# Edit .env.local and add your GOOGLE_API_KEY

# Pull the Docker base image (one-time)
docker pull node:20-alpine

# Start the dev server
npm run dev
```

Open http://localhost:3000/demo to see the web UI.

## Project Structure

```
app/            Next.js pages and API routes
components/     React components (ChatPanel, AgentPanel, etc.)
lib/vrlm/       Core runtime (sandbox manager, tools, events)
packages/cli/   npm CLI package (agentnetes run, serve, snapshot)
scripts/        Build and deploy scripts
```

## Running Tests

```bash
npm test            # run once
npm run test:watch  # watch mode
```

## Code Style

The project uses ESLint and Prettier. Format before committing:

```bash
npm run lint:fix
npm run format
```

## Submitting Changes

1. Fork the repo and create a branch from `main`.
2. Make your changes. Add tests if you're touching `lib/vrlm/`.
3. Run `npm test` and `npm run build` to verify nothing is broken.
4. Open a pull request with a clear description of what changed and why.

## Reporting Issues

Open an issue at https://github.com/Shashikant86/agentnetes/issues with:

- What you expected to happen
- What actually happened
- Steps to reproduce
- Your sandbox provider (`docker`, `local`, `vercel`, etc.)
- Node.js version (`node -v`)

## License

By contributing, you agree that your contributions will be licensed under the project's AGPL-3.0 license.
