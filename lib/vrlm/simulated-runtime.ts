import { VrlmEventEmitter } from './events';
import { AgentTask, Artifact, VrlmConfig, DEFAULT_CONFIG, VrlmEventType } from './types';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

function makeTask(overrides: Partial<AgentTask> & { id: string; role: string; goal: string }): AgentTask {
  return {
    parentId: null,
    status: 'pending',
    statusText: 'Waiting to start...',
    findings: [],
    artifacts: [],
    children: [],
    sandboxId: null,
    model: 'google/gemini-2.5-flash',
    createdAt: Date.now(),
    completedAt: null,
    depth: 1,
    icon: '⚙️',
    ...overrides,
  };
}

function iconForRole(role: string): string {
  const r = role.toLowerCase();
  if (r.includes('scout') || r.includes('architect') || r.includes('analysis') || r.includes('explorer')) return '🔍';
  if (r.includes('lead') || r.includes('planner') || r.includes('tech')) return '🧠';
  if (r.includes('test') || r.includes('qa') || r.includes('verif')) return '🧪';
  if (r.includes('package') || r.includes('config') || r.includes('infra')) return '📦';
  if (r.includes('doc')) return '📝';
  if (r.includes('front') || r.includes('ui') || r.includes('design')) return '🎨';
  if (r.includes('security') || r.includes('auth') || r.includes('risk')) return '🔐';
  if (r.includes('scanner') || r.includes('scan')) return '🔎';
  return '⚙️';
}

export class SimulatedVrlmRuntime {
  private emitter: VrlmEventEmitter;
  private config: VrlmConfig;

  constructor(config: Partial<VrlmConfig> = {}) {
    this.emitter = new VrlmEventEmitter();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  onEvent(handler: (event: import('./types').VrlmEvent) => void) {
    this.emitter.on(handler);
  }

  async run(goal: string) {
    const rootTask = makeTask({
      id: 'root',
      parentId: null,
      role: 'Tech Lead',
      goal,
      depth: 0,
      model: this.config.plannerModel,
      icon: '🧠',
      status: 'running',
      statusText: 'Spinning up sandbox...',
    });

    this.emitter.emit({ type: 'task-created', taskId: 'root', data: { task: rootTask } });

    // Root agent explores
    const rootSteps: [number, string, string?][] = [
      [400, 'Spinning up sandbox...'],
      [500, 'Analyzing goal...'],
      [300, 'Exploring monorepo structure...', '$ ls packages/ | wc -l\n47'],
      [600, 'Scanning provider packages...', '$ find packages -name "*-provider.ts" | head -8\npackages/openai/src/openai-provider.ts\npackages/anthropic/src/anthropic-provider.ts\npackages/google/src/google-provider.ts\npackages/mistral/src/mistral-provider.ts'],
      [700, 'Reading interface contracts...', '$ grep -r "implements LanguageModelV1" packages/ --include="*.ts" -l\npackages/openai/src/openai-chat-model.ts\npackages/anthropic/src/anthropic-messages-language-model.ts'],
      [500, 'Understanding test patterns...', '$ ls packages/openai/src/__tests__/\nopenai-chat-model.test.ts\nopenai-completion-model.test.ts\nopenai-provider.test.ts'],
      [400, 'Assembling the team...'],
    ];

    for (const [ms, text, cmd] of rootSteps) {
      await delay(ms);
      this.emitter.emit({ type: 'task-updated', taskId: 'root', data: { statusText: text } });
      if (cmd) {
        this.emitter.emit({ type: 'terminal', taskId: 'root', data: { output: cmd } });
        await delay(200);
      }
    }

    // Build and spawn workers
    const workers = this.buildWorkerPlan(goal);
    for (const w of workers) {
      w.icon = iconForRole(w.role);
    }

    for (const w of workers) {
      this.emitter.emit({ type: 'task-created', taskId: w.id, data: { task: w } });
      await delay(280);
    }

    this.emit('task-completed', 'root', 'Team assembled — workers running in parallel');

    // Run workers in parallel
    await Promise.all(workers.map((w, i) => this.runWorker(w, i * 150)));

    // Synthesis
    await delay(500);
    const allArtifacts = workers.flatMap(w => w.artifacts);
    this.emitter.emit({ type: 'task-updated', taskId: 'root', data: { statusText: 'Synthesizing results...' } });
    await delay(600);

    const summary = this.buildSummary(goal, workers, allArtifacts);

    this.emitter.emit({ type: 'synthesis', taskId: 'root', data: { content: summary, artifacts: allArtifacts } });
    await delay(300);
    this.emitter.emit({ type: 'done', data: { content: summary, artifacts: allArtifacts } });
    this.emitter.close();
  }

  private emit(type: VrlmEventType, taskId: string, statusText: string) {
    this.emitter.emit({ type, taskId, data: { statusText } });
  }

  private buildWorkerPlan(goal: string): AgentTask[] {
    const g = goal.toLowerCase();

    if (g.includes('provider') || g.includes('sdk') || g.includes('package') || g.includes('deepseek')) {
      return [
        makeTask({ id: 'scout', role: 'Architecture Scout', goal: 'Explore existing provider packages and document interface contracts, file patterns, and test conventions', icon: '🔍' }),
        makeTask({ id: 'engineer', role: 'Provider Engineer', goal: 'Implement the new provider package — provider class, chat model, streaming, reasoning tokens', icon: '⚙️' }),
        makeTask({ id: 'tester', role: 'Test Engineer', goal: 'Write comprehensive tests matching existing monorepo test patterns', icon: '🧪' }),
        makeTask({ id: 'packager', role: 'Package Engineer', goal: 'Set up package.json, tsconfig.json, exports, and wire into the monorepo build system', icon: '📦' }),
      ];
    }

    if (g.includes('security') || g.includes('vulnerabilit') || g.includes('audit')) {
      return [
        makeTask({ id: 'dep-scanner', role: 'Dependency Scanner', goal: 'Audit all dependencies for known vulnerabilities', icon: '🔎' }),
        makeTask({ id: 'auth-analyzer', role: 'Auth Flow Analyzer', goal: 'Trace authentication flows and identify weaknesses', icon: '🔐' }),
        makeTask({ id: 'input-checker', role: 'Input Validator', goal: 'Check all user input handling for injection attack surfaces', icon: '⚙️' }),
        makeTask({ id: 'risk-report', role: 'Risk Prioritizer', goal: 'Combine all findings into a prioritized security report', icon: '📝' }),
      ];
    }

    if (g.includes('research') || g.includes('command') || g.includes('cli') || g.includes('feature')) {
      return [
        makeTask({ id: 'explorer', role: 'Codebase Explorer', goal: 'Map the existing command structure and extension patterns', icon: '🔍' }),
        makeTask({ id: 'implementer', role: 'Feature Engineer', goal: 'Implement the new feature following existing patterns', icon: '⚙️' }),
        makeTask({ id: 'integrator', role: 'Integration Engineer', goal: 'Wire the feature into the CLI entry point and config', icon: '📦' }),
        makeTask({ id: 'tester', role: 'Test Engineer', goal: 'Write integration tests covering the new command end-to-end', icon: '🧪' }),
      ];
    }

    return [
      makeTask({ id: 'explorer', role: 'Codebase Explorer', goal: 'Map the repository structure and identify relevant files', icon: '🔍' }),
      makeTask({ id: 'implementer', role: 'Implementation Engineer', goal: 'Implement the requested changes following existing patterns', icon: '⚙️' }),
      makeTask({ id: 'verifier', role: 'Verification Engineer', goal: 'Verify the implementation is correct and consistent', icon: '🧪' }),
    ];
  }

  private async runWorker(task: AgentTask, startDelay: number) {
    await delay(startDelay);
    this.emitter.emit({ type: 'task-updated', taskId: task.id, data: { status: 'running', statusText: 'Starting sandbox...' } });
    await delay(300);

    const steps = this.stepsForRole(task.role);

    for (const step of steps) {
      await delay(step.delay);
      this.emitter.emit({ type: 'task-updated', taskId: task.id, data: { statusText: step.text } });
      if (step.cmd) {
        this.emitter.emit({ type: 'terminal', taskId: task.id, data: { output: step.cmd } });
        await delay(180);
      }
    }

    // Collaboration: tester finds a bug, engineer fixes it
    if (task.id === 'engineer') {
      await delay(600);
      this.emitter.emit({
        type: 'collaboration',
        fromTaskId: 'tester',
        toTaskId: 'engineer',
        data: { message: 'Type error: doStream() must return AsyncIterable<LanguageModelV1StreamPart>' },
      });
      await delay(300);
      this.emitter.emit({ type: 'task-updated', taskId: task.id, data: { statusText: 'Fixing streaming return type...' } });
      this.emitter.emit({ type: 'terminal', taskId: task.id, data: { output: '$ npx tsc --noEmit\nsrc/deepseek-chat-model.ts:47:5 - error TS2322: Type mismatch on doStream return\n\nFixing...' } });
      await delay(700);
      this.emitter.emit({ type: 'task-updated', taskId: task.id, data: { statusText: 'Type check passing ✓' } });
      this.emitter.emit({ type: 'terminal', taskId: task.id, data: { output: '$ npx tsc --noEmit\n✓ No errors found' } });
      await delay(300);
    }

    const artifacts = this.artifactsForRole(task.role);
    const findings = this.findingsForRole(task.role);

    for (const artifact of artifacts) {
      await delay(150);
      this.emitter.emit({ type: 'artifact', taskId: task.id, data: { artifact } });
    }
    for (const finding of findings) {
      this.emitter.emit({ type: 'finding', taskId: task.id, data: { content: finding } });
    }

    await delay(200);
    this.emitter.emit({
      type: 'task-completed',
      taskId: task.id,
      data: { statusText: 'Done', artifacts, findings },
    });

    task.status = 'completed';
    task.artifacts = artifacts;
    task.findings = findings;
  }

  private stepsForRole(role: string): { text: string; delay: number; cmd?: string }[] {
    const r = role.toLowerCase();

    if (r.includes('scout') || r.includes('explorer') || r.includes('codebase')) {
      return [
        { text: 'Scanning packages directory...', delay: 400, cmd: '$ ls packages/ | head -12\nai  anthropic  azure  cohere  deepseek\ngoogle  groq  mistral  openai  perplexity' },
        { text: 'Reading openai provider structure...', delay: 700, cmd: '$ find packages/openai/src -name "*.ts" | head -6\npackages/openai/src/index.ts\npackages/openai/src/openai-provider.ts\npackages/openai/src/openai-chat-model.ts\npackages/openai/src/convert-to-openai-messages.ts' },
        { text: 'Extracting interface contracts...', delay: 800, cmd: '$ head -30 packages/openai/src/openai-chat-model.ts\nexport class OpenAIChatModel implements LanguageModelV1 {\n  readonly specificationVersion = "v1";\n  readonly provider: string;\n  readonly modelId: string;\n  ...' },
        { text: 'Checking test patterns...', delay: 600, cmd: '$ head -20 packages/openai/src/__tests__/openai-chat-model.test.ts\nimport { describe, it, expect, vi } from "vitest";\nimport { createOpenAI } from "../openai-provider";\n\nconst server = createTestServer({...})' },
        { text: 'Documenting findings...', delay: 500 },
      ];
    }

    if (r.includes('provider') || r.includes('feature') || r.includes('implement')) {
      return [
        { text: 'Reading Architecture Scout findings...', delay: 400 },
        { text: 'Creating package directory...', delay: 300, cmd: '$ mkdir -p packages/deepseek/src/__tests__' },
        { text: 'Writing deepseek-provider.ts...', delay: 900, cmd: '$ cat > packages/deepseek/src/deepseek-provider.ts\nexport function createDeepSeek(options) {\n  const baseURL = options.baseURL ?? "https://api.deepseek.com/v1";\n  return { chat: (modelId) => new DeepSeekChatModel(modelId, ...) }\n}' },
        { text: 'Implementing chat model...', delay: 1100, cmd: '$ cat > packages/deepseek/src/deepseek-chat-model.ts\nexport class DeepSeekChatModel implements LanguageModelV1 {\n  async doGenerate(options) { ... }\n  async doStream(options) { ... }\n}' },
        { text: 'Adding streaming support...', delay: 800, cmd: '$ wc -l packages/deepseek/src/deepseek-chat-model.ts\n      187 packages/deepseek/src/deepseek-chat-model.ts' },
        { text: 'Running type check...', delay: 600, cmd: '$ npx tsc --noEmit\n...(checking)' },
      ];
    }

    if (r.includes('test') || r.includes('verif')) {
      return [
        { text: 'Studying existing test patterns...', delay: 500, cmd: '$ grep -r "createTestServer\\|mockFetch" packages/openai --include="*.ts" -l\npackages/openai/src/__tests__/openai-chat-model.test.ts' },
        { text: 'Writing provider tests...', delay: 700, cmd: '$ cat > packages/deepseek/src/__tests__/deepseek-provider.test.ts\ndescribe("createDeepSeek", () => {\n  it("creates provider with default URL", () => {...})\n  it("passes apiKey to model", () => {...})\n})' },
        { text: 'Writing streaming tests...', delay: 800, cmd: '$ cat >> packages/deepseek/src/__tests__/deepseek-chat-model.test.ts\nit("streams text chunks correctly", async () => {\n  const chunks = [];\n  for await (const chunk of stream) { chunks.push(chunk); }\n  expect(chunks[0].type).toBe("text-delta");\n})' },
        { text: 'Running vitest...', delay: 900, cmd: '$ npx vitest run packages/deepseek --reporter=verbose\n✓ deepseek-provider.test.ts (3)\n✓ deepseek-chat-model.test.ts (4)\n✗ deepseek-chat-model.test.ts > streaming type (1)\n\nFAIL: expected AsyncIterable<StreamPart>, got ReadableStream' },
        { text: 'Reporting type error to Provider Engineer...', delay: 400 },
        { text: 'Waiting for fix...', delay: 1200 },
        { text: 'Re-running vitest...', delay: 400, cmd: '$ npx vitest run packages/deepseek --reporter=verbose\n✓ deepseek-provider.test.ts (3)\n✓ deepseek-chat-model.test.ts (5)\n\nTest Files  1 passed\nTests       8 passed\nDuration    1.24s' },
      ];
    }

    if (r.includes('package') || r.includes('config') || r.includes('integrat')) {
      return [
        { text: 'Checking workspace config...', delay: 400, cmd: '$ cat pnpm-workspace.yaml\npackages:\n  - "packages/*"\n  - "packages/provider-utils"' },
        { text: 'Writing package.json...', delay: 500, cmd: '$ cat > packages/deepseek/package.json\n{\n  "name": "@ai-sdk/deepseek",\n  "version": "1.0.0",\n  "dependencies": {\n    "@ai-sdk/provider": "workspace:*"\n  }\n}' },
        { text: 'Writing tsconfig.json...', delay: 400, cmd: '$ cat > packages/deepseek/tsconfig.json\n{\n  "extends": "../../tsconfig.json",\n  "compilerOptions": { "outDir": "dist" },\n  "include": ["src"]\n}' },
        { text: 'Wiring into monorepo...', delay: 500, cmd: '$ cat >> tsconfig.json\n{ "path": "packages/deepseek/tsconfig.json" }' },
        { text: 'Verifying workspace links...', delay: 400, cmd: '$ pnpm list @ai-sdk/deepseek\n@ai-sdk/deepseek 1.0.0 packages/deepseek' },
      ];
    }

    if (r.includes('auth') || r.includes('input') || r.includes('risk') || r.includes('dep')) {
      return [
        { text: 'Scanning codebase...', delay: 500, cmd: '$ find . -name "*.ts" | xargs grep -l "password\\|token\\|secret" | head -8' },
        { text: 'Analyzing patterns...', delay: 800 },
        { text: 'Running checks...', delay: 700, cmd: '$ npx audit-ci --moderate' },
        { text: 'Compiling findings...', delay: 500 },
      ];
    }

    return [
      { text: 'Analyzing task...', delay: 500 },
      { text: 'Working...', delay: 1000 },
      { text: 'Finalizing...', delay: 600 },
    ];
  }

  private artifactsForRole(role: string): Artifact[] {
    const r = role.toLowerCase();

    if (r.includes('scout') || r.includes('codebase')) {
      return [{
        filename: 'architecture-findings.md',
        language: 'markdown',
        content: `# Architecture Findings\n\n## Provider Pattern\nAll providers implement \`LanguageModelV1\` from \`@ai-sdk/provider\`.\n\n## Standard File Structure\n\`\`\`\npackages/<provider>/\n  src/\n    index.ts              — public exports\n    <name>-provider.ts    — factory function\n    <name>-chat-model.ts  — core model class\n  package.json\n  tsconfig.json\n\`\`\`\n\n## Key Interfaces\n- \`LanguageModelV1\` — must implement \`doGenerate()\` and \`doStream()\`\n- \`LanguageModelV1StreamPart\` — union type for stream chunks\n- \`createJsonErrorResponseHandler\` — shared error utility\n\n## Test Conventions\n- Vitest with \`createTestServer\` mock helper\n- One test file per source file\n- Snapshot tests for API request shapes`,
      }];
    }

    if (r.includes('provider') || r.includes('feature') || r.includes('implement')) {
      return [
        {
          filename: 'src/deepseek-provider.ts',
          language: 'typescript',
          content: `import { withoutTrailingSlash } from '@ai-sdk/provider-utils';\nimport { DeepSeekChatModel } from './deepseek-chat-model';\n\nexport interface DeepSeekProvider {\n  (modelId: DeepSeekChatModelId): DeepSeekChatModel;\n  chat(modelId: DeepSeekChatModelId): DeepSeekChatModel;\n}\n\nexport interface DeepSeekProviderSettings {\n  baseURL?: string;\n  apiKey?: string;\n}\n\nexport function createDeepSeek(\n  options: DeepSeekProviderSettings = {},\n): DeepSeekProvider {\n  const baseURL = withoutTrailingSlash(\n    options.baseURL ?? 'https://api.deepseek.com/v1',\n  );\n  const apiKey = options.apiKey ?? process.env.DEEPSEEK_API_KEY ?? '';\n\n  const createModel = (modelId: DeepSeekChatModelId) =>\n    new DeepSeekChatModel(modelId, { baseURL, apiKey });\n\n  const provider = (modelId: DeepSeekChatModelId) => createModel(modelId);\n  provider.chat = createModel;\n  return provider as DeepSeekProvider;\n}\n\nexport const deepseek = createDeepSeek();\n\nexport type DeepSeekChatModelId =\n  | 'deepseek-chat'\n  | 'deepseek-reasoner'\n  | (string & {});`,
        },
        {
          filename: 'src/deepseek-chat-model.ts',
          language: 'typescript',
          content: `import {\n  LanguageModelV1,\n  LanguageModelV1StreamPart,\n} from '@ai-sdk/provider';\nimport {\n  createJsonResponseHandler,\n  createEventSourceResponseHandler,\n  postJsonToApi,\n} from '@ai-sdk/provider-utils';\n\nexport class DeepSeekChatModel implements LanguageModelV1 {\n  readonly specificationVersion = 'v1';\n  readonly provider = 'deepseek';\n  readonly defaultObjectGenerationMode = 'json' as const;\n\n  constructor(\n    readonly modelId: string,\n    private readonly config: { baseURL: string; apiKey: string },\n  ) {}\n\n  async doGenerate(\n    options: Parameters<LanguageModelV1['doGenerate']>[0],\n  ) {\n    const response = await postJsonToApi({\n      url: \`\${this.config.baseURL}/chat/completions\`,\n      headers: { Authorization: \`Bearer \${this.config.apiKey}\` },\n      body: { model: this.modelId, messages: options.prompt },\n      successfulResponseHandler: createJsonResponseHandler(),\n      failedResponseHandler: createJsonErrorResponseHandler(),\n      abortSignal: options.abortSignal,\n    });\n    // ... map response\n    return { text: response.choices[0].message.content, finishReason: 'stop', usage: { promptTokens: 0, completionTokens: 0 } };\n  }\n\n  async doStream(\n    options: Parameters<LanguageModelV1['doStream']>[0],\n  ): Promise<{ stream: AsyncIterable<LanguageModelV1StreamPart>; rawCall: unknown }> {\n    const response = await postJsonToApi({\n      url: \`\${this.config.baseURL}/chat/completions\`,\n      headers: { Authorization: \`Bearer \${this.config.apiKey}\` },\n      body: { model: this.modelId, messages: options.prompt, stream: true },\n      successfulResponseHandler: createEventSourceResponseHandler(),\n      failedResponseHandler: createJsonErrorResponseHandler(),\n      abortSignal: options.abortSignal,\n    });\n    return { stream: response, rawCall: { rawPrompt: options.prompt, rawSettings: {} } };\n  }\n}`,
        },
      ];
    }

    if (r.includes('test') || r.includes('verif')) {
      return [{
        filename: 'src/__tests__/deepseek-chat-model.test.ts',
        language: 'typescript',
        content: `import { describe, it, expect, vi, beforeEach } from 'vitest';\nimport { createDeepSeek } from '../deepseek-provider';\nimport { createTestServer } from '@ai-sdk/provider-utils/test';\n\nconst server = createTestServer({\n  'https://api.deepseek.com/v1/chat/completions': {},\n});\n\ndescribe('DeepSeekChatModel', () => {\n  it('has correct provider name', () => {\n    const model = createDeepSeek({ apiKey: 'test' }).chat('deepseek-chat');\n    expect(model.provider).toBe('deepseek');\n  });\n\n  it('has correct model id', () => {\n    const model = createDeepSeek({ apiKey: 'test' }).chat('deepseek-chat');\n    expect(model.modelId).toBe('deepseek-chat');\n  });\n\n  it('sends correct Authorization header', async () => {\n    server.urls['https://api.deepseek.com/v1/chat/completions']\n      .response = { body: { choices: [{ message: { content: 'hi' } }] } };\n    const model = createDeepSeek({ apiKey: 'sk-test' }).chat('deepseek-chat');\n    await model.doGenerate({ prompt: [], mode: { type: 'regular' }, ... });\n    expect(server.calls[0].requestHeaders['authorization']).toBe('Bearer sk-test');\n  });\n\n  it('streams text-delta chunks', async () => {\n    // ... streaming test\n    const chunks: unknown[] = [];\n    for await (const chunk of stream) chunks.push(chunk);\n    expect(chunks[0]).toMatchObject({ type: 'text-delta' });\n  });\n\n  // 4 more tests...\n});\n\n// 8 tests total — all passing ✓`,
      }];
    }

    if (r.includes('package') || r.includes('integrat')) {
      return [{
        filename: 'package.json',
        language: 'json',
        content: JSON.stringify({
          name: '@ai-sdk/deepseek',
          version: '1.0.0',
          license: 'Apache-2.0',
          sideEffects: false,
          main: './dist/index.js',
          module: './dist/index.mjs',
          types: './dist/index.d.ts',
          exports: {
            '.': {
              import: './dist/index.mjs',
              require: './dist/index.js',
              types: './dist/index.d.ts',
            },
          },
          dependencies: {
            '@ai-sdk/provider': 'workspace:*',
            '@ai-sdk/provider-utils': 'workspace:*',
          },
          devDependencies: { vitest: 'workspace:*', typescript: 'workspace:*' },
        }, null, 2),
      }];
    }

    return [];
  }

  private findingsForRole(role: string): string[] {
    const r = role.toLowerCase();
    if (r.includes('scout') || r.includes('codebase')) return [
      '47 packages in the monorepo, 12 are provider implementations',
      'All providers implement LanguageModelV1 with doGenerate() + doStream()',
      'OpenAI-compatible APIs share postJsonToApi() + createEventSourceResponseHandler()',
      'Tests use createTestServer() mock with snapshot assertions',
    ];
    if (r.includes('provider') || r.includes('implement')) return [
      'DeepSeekProvider factory function implemented',
      'DeepSeekChatModel with doGenerate() and doStream() — 187 lines',
      'Supports deepseek-chat and deepseek-reasoner model IDs',
      'TypeScript compilation: 0 errors',
    ];
    if (r.includes('test')) return [
      '8 tests written: provider creation, model config, auth headers, streaming',
      'All 8 passing after streaming type fix',
      'Test duration: 1.24s',
    ];
    if (r.includes('package') || r.includes('integrat')) return [
      'package.json with ESM + CJS dual exports configured',
      'tsconfig.json referencing workspace dependencies',
      'Wired into root tsconfig.json references array',
      'pnpm workspace linking verified',
    ];
    if (r.includes('auth')) return ['3 auth flows analyzed', '1 missing token expiry check found', 'Session fixation risk in OAuth callback'];
    if (r.includes('dep')) return ['47 dependencies scanned', '2 moderate vulnerabilities found', 'Recommended: upgrade axios to 1.6.8+'];
    if (r.includes('input')) return ['12 input handlers analyzed', 'No SQL injection vectors found', '2 XSS risks in markdown renderer'];
    if (r.includes('risk')) return ['4 findings prioritized', 'High: missing token expiry', 'Medium: XSS in markdown renderer'];
    return ['Task completed'];
  }

  private buildSummary(goal: string, workers: AgentTask[], artifacts: Artifact[]): string {
    const fileList = artifacts.map(a => `- \`${a.filename}\``).join('\n');
    const g = goal.toLowerCase();
    const isProvider = g.includes('provider') || g.includes('sdk') || g.includes('deepseek');
    const isSecurity = g.includes('security') || g.includes('vulnerabilit');

    if (isProvider) {
      return `## ✅ Task Complete\n\n**Goal:** ${goal}\n\n### Files Created\n${fileList}\n\n### Results\n- ✅ TypeScript: 0 errors\n- ✅ Tests: 8/8 passing (1.24s)\n- ✅ Package wired into monorepo\n- ✅ ESM + CJS dual exports configured\n\n### Agent Team (${workers.length} agents)\n${workers.map(w => `- **${w.role}**: ${w.findings[0] ?? 'Completed'}`).join('\n')}\n\n### Key Decisions\n- Followed OpenAI-compatible provider pattern (same base utilities)\n- Streaming uses \`createEventSourceResponseHandler\` from provider-utils\n- Supports \`deepseek-chat\` and \`deepseek-reasoner\` model IDs`;
    }

    if (isSecurity) {
      return `## ✅ Security Audit Complete\n\n**Goal:** ${goal}\n\n### Findings\n${fileList}\n\n### Summary\n- 🔴 **High:** Missing token expiry check in session handler\n- 🟡 **Medium:** XSS risk in markdown renderer (2 locations)\n- 🟡 **Medium:** Outdated axios dependency (CVE-2024-28849)\n- 🟢 **Low:** No SQL injection vectors found\n\n### Agent Team (${workers.length} agents)\n${workers.map(w => `- **${w.role}**: ${w.findings[0] ?? 'Completed'}`).join('\n')}`;
    }

    return `## ✅ Task Complete\n\n**Goal:** ${goal}\n\n### Files Created\n${fileList}\n\n### Agent Team (${workers.length} agents)\n${workers.map(w => `- **${w.role}**: ${w.findings[0] ?? 'Completed'}`).join('\n')}`;
  }
}
