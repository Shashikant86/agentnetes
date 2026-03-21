import pc from 'picocolors';
import type { VrlmEvent } from '../../../lib/vrlm/types.js';

// Note: for the published CLI this would be a proper import.
// For now we use a relative path since it is in the monorepo.

export class TerminalRenderer {
  private taskRoles = new Map<string, string>(); // taskId -> role

  render(event: VrlmEvent): void {
    switch (event.type) {
      case 'task-created': {
        const task = event.data.task as { id: string; role: string; goal: string; depth: number; icon?: string };
        this.taskRoles.set(task.id, task.role);
        if (task.depth === 0) {
          console.log('');
          console.log(pc.bold(pc.white(`  ${task.icon ?? '🧠'} ${task.role}`)));
          console.log(pc.dim(`  ${task.goal}`));
        } else {
          console.log(pc.dim(`  + `) + pc.cyan(`${task.icon ?? '🤖'} ${task.role}`));
        }
        break;
      }
      case 'task-updated': {
        const role = this.taskRoles.get(event.taskId ?? '') ?? '';
        const status = event.data.statusText as string;
        if (status && role) {
          console.log(pc.dim(`  [${role}] `) + pc.white(status));
        }
        break;
      }
      case 'terminal': {
        const line = event.data.line as string;
        const dim = event.data.dim as boolean;
        if (dim) {
          console.log(pc.dim(`    ${line}`));
        } else {
          console.log(pc.blue(`    ${line}`));
        }
        break;
      }
      case 'finding': {
        const text = event.data.text as string;
        const role = this.taskRoles.get(event.taskId ?? '') ?? '';
        console.log(pc.yellow(`  [${role}] `) + text);
        break;
      }
      case 'artifact': {
        const artifact = event.data.artifact as { filename: string; language: string };
        console.log(pc.green(`  + ${artifact.filename}`) + pc.dim(` (${artifact.language})`));
        break;
      }
      case 'collaboration': {
        console.log(pc.magenta(`  ~ Collaboration: `) + ((event.data.message as string) ?? ''));
        break;
      }
      case 'task-completed': {
        const role = this.taskRoles.get(event.taskId ?? '') ?? '';
        console.log(pc.green(`  ok `) + role);
        break;
      }
      case 'synthesis': {
        console.log('');
        console.log(pc.bold(pc.white('Summary')));
        console.log(pc.dim('------'));
        console.log(event.data.content as string);
        break;
      }
      case 'done': {
        console.log('');
        console.log(pc.bold(pc.green('Done.')));
        break;
      }
      case 'error': {
        console.error(pc.red('Error: ') + (event.data.message as string));
        break;
      }
    }
  }
}
