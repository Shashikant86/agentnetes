import { VrlmEvent } from './types';

type EventHandler = (event: VrlmEvent) => void;

export class VrlmEventEmitter {
  private handlers: EventHandler[] = [];
  private queue: VrlmEvent[] = [];
  private closed = false;

  on(handler: EventHandler) {
    this.handlers.push(handler);
    // replay queued events for late subscribers
    for (const event of this.queue) {
      handler(event);
    }
  }

  emit(event: VrlmEvent) {
    this.queue.push(event);
    for (const handler of this.handlers) {
      handler(event);
    }
  }

  close() {
    this.closed = true;
  }

  isClosed() {
    return this.closed;
  }
}
