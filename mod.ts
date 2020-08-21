type Awaitable<T> = Promise<T> | T;

export type EventResult = any[] | "cancelled" | void;
export type EventListener = (...args: any[]) => Awaitable<EventResult>;
export type EventPriority = "before" | "normal" | "after";

function merge(a: any[], b: any[]): any[] {
  const c = [...a];
  for (const [i, x] of b.entries()) {
    c[i] = x;
  }
  return c;
}

export class EventEmitter<T> {
  listeners = {
    before: new Map<T, Set<EventListener>>(),
    normal: new Map<T, Set<EventListener>>(),
    after: new Map<T, Set<EventListener>>(),
  }

  on([type, p = "normal"]: [T, EventPriority?], listener: EventListener) {
    const listeners = this.listeners[p]
    if (!listeners) return;

    let set = listeners.get(type);

    if (!set) {
      set = new Set<EventListener>()
      listeners.set(type, set)
    }

    set.add(listener);
  }

  off([type, p = "normal"]: [T, EventPriority?], listener: EventListener) {
    const listeners = this.listeners[p];
    if (!listeners) return;

    const set = listeners.get(type);
    if (set) set.delete(listener);
  }

  once([type, p = "normal"]: [T, EventPriority?], listener: EventListener): EventListener {
    const slistener = (...args: any[]) => {
      this.off([type, p], slistener)
      listener(...args)
    }

    this.on([type, p], slistener)
    return slistener
  }

  async wait([type, p = "normal"]: [T, EventPriority?]): Promise<any> {
    return new Promise(resolve => this.once([type, p], resolve))
  }

  async emit(type: T, ...args: any[]): Promise<any[] | never> {
    const all = new Array<EventListener>();
    const listeners = this.listeners

    const befores = listeners.before.get(type);
    if (befores) all.push(...befores);

    const normals = listeners.normal.get(type);
    if (normals) all.push(...normals);

    const afters = listeners.after.get(type);
    if (afters) all.push(...afters);

    for (const listener of all) {
      const result = await listener(...args);
      if (result === "cancelled") throw result;
      if (!Array.isArray(result)) continue;
      args = merge(args, result);
    }

    return args;
  }
}
