import { AgentTask } from './vrlm/types';

export interface A2ASkill {
  id: string;
  name: string;
  description: string;
  tags: string[];
  examples: string[];
}

export interface A2AAgentCard {
  name: string;
  description: string;
  url: string;
  version: string;
  provider: { organization: string };
  capabilities: {
    streaming: boolean;
    pushNotifications: boolean;
    stateTransitionHistory: boolean;
  };
  authentication: { schemes: string[] };
  defaultInputModes: string[];
  defaultOutputModes: string[];
  skills: A2ASkill[];
}

function slugify(role: string) {
  return role.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function skillsForRole(role: string): A2ASkill[] {
  const r = role.toLowerCase();

  if (r.includes('scout') || r.includes('explorer') || r.includes('architect')) {
    return [
      {
        id: 'explore-codebase',
        name: 'Explore Codebase',
        description: 'Scans a repository and documents architecture patterns, interface contracts, and file conventions',
        tags: ['codebase', 'architecture', 'typescript', 'monorepo'],
        examples: [
          'Explore the provider package structure in vercel/ai',
          'Document interface contracts for LanguageModelV1',
          'Find all test patterns across packages',
        ],
      },
      {
        id: 'map-dependencies',
        name: 'Map Dependencies',
        description: 'Traces dependency graphs across a monorepo and identifies shared utilities',
        tags: ['dependencies', 'monorepo', 'pnpm'],
        examples: ['Map all workspace dependencies in vercel/ai', 'Find all packages that depend on @ai-sdk/provider'],
      },
    ];
  }

  if (r.includes('provider') || r.includes('implement') || r.includes('engineer')) {
    return [
      {
        id: 'implement-provider',
        name: 'Implement Provider',
        description: 'Creates a new AI SDK provider package following existing patterns — provider class, chat model, streaming',
        tags: ['typescript', 'ai-sdk', 'provider', 'streaming'],
        examples: [
          'Add @ai-sdk/deepseek with streaming and reasoning tokens',
          'Implement a new OpenAI-compatible provider',
          'Add tool-calling support to an existing provider',
        ],
      },
      {
        id: 'implement-feature',
        name: 'Implement Feature',
        description: 'Builds a software feature in an existing codebase following discovered conventions',
        tags: ['typescript', 'implementation', 'feature'],
        examples: ['Add a /research command to a CLI tool', 'Implement a new API endpoint following existing patterns'],
      },
    ];
  }

  if (r.includes('test') || r.includes('verif') || r.includes('qa')) {
    return [
      {
        id: 'write-tests',
        name: 'Write Tests',
        description: 'Writes comprehensive tests following the codebase test conventions — unit, integration, streaming',
        tags: ['vitest', 'testing', 'typescript', 'coverage'],
        examples: [
          'Write tests for a new provider package',
          'Add streaming tests for a chat model',
          'Write integration tests for a new API endpoint',
        ],
      },
      {
        id: 'run-verification',
        name: 'Run Verification',
        description: 'Runs tests, type checks, and linting to verify correctness. Reports failures with context.',
        tags: ['typescript', 'vitest', 'tsc', 'verification'],
        examples: ['Verify TypeScript compilation passes', 'Run all tests and report failures'],
      },
    ];
  }

  if (r.includes('package') || r.includes('config') || r.includes('integrat')) {
    return [
      {
        id: 'setup-package',
        name: 'Setup Package',
        description: 'Configures package.json, tsconfig.json, exports, and monorepo wiring for a new package',
        tags: ['monorepo', 'pnpm', 'typescript', 'package'],
        examples: [
          'Set up a new @ai-sdk/* package from scratch',
          'Configure ESM + CJS dual exports',
          'Wire a new package into pnpm workspace',
        ],
      },
    ];
  }

  if (r.includes('security') || r.includes('scanner') || r.includes('auth') || r.includes('risk')) {
    return [
      {
        id: 'security-audit',
        name: 'Security Audit',
        description: 'Analyzes code for security vulnerabilities — auth flows, input validation, dependency CVEs',
        tags: ['security', 'audit', 'vulnerabilities', 'owasp'],
        examples: [
          'Audit authentication flows for session fixation',
          'Scan dependencies for known CVEs',
          'Find XSS vulnerabilities in user input handling',
        ],
      },
    ];
  }

  return [
    {
      id: 'general-task',
      name: 'General Engineering Task',
      description: 'Performs software engineering tasks — exploration, implementation, verification',
      tags: ['typescript', 'engineering'],
      examples: ['Implement a requested feature following existing patterns'],
    },
  ];
}

export function buildA2ACard(task: AgentTask): A2AAgentCard {
  const slug = slugify(task.role);
  return {
    name: task.role,
    description: task.goal,
    url: `https://agentnetes.vercel.app/agents/${slug}`,
    version: '1.0.0',
    provider: { organization: 'Superagentic AI / Agentnetes' },
    capabilities: {
      streaming: true,
      pushNotifications: false,
      stateTransitionHistory: true,
    },
    authentication: { schemes: ['bearer'] },
    defaultInputModes: ['text/plain', 'application/json'],
    defaultOutputModes: ['text/plain', 'application/json'],
    skills: skillsForRole(task.role),
  };
}
