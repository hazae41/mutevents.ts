export type EventPriority = "high" | "normal" | "low";

export type EventResult = "cancelled" | any[] | void;
export type AsyncEventResult = Promise<EventResult>;

export type EventListener = (...args: any[]) => EventResult | AsyncEventResult;

export type OpenEventEmitter<T> = EventEmitter<T> | EventEmitter<any>;

export function emitter<T>(): OpenEventEmitter<T> {
  return new EventEmitter<T>();
}

function merge(a: any[], b: any[]): any[] {
  const c = [...a];
  for (const [i, x] of b.entries()) {
    c[i] = x;
  }
  return c;
}

export class EventEmitter<T> {
  highs = new Map<T, Set<EventListener>>();
  normals = new Map<T, Set<EventListener>>();
  lows = new Map<T, Set<EventListener>>();

  listeners(p: EventPriority): Map<T, Set<EventListener>> | undefined {
    if (p === "high") return this.highs;
    if (p === "normal") return this.normals;
    if (p === "low") return this.lows;
  }

  on([type, p = "normal"]: [T, EventPriority?], listener: EventListener) {
    const listeners = this.listeners(p);
    if (!listeners) return;
    const set = listeners.get(type) ?? new Set();
    if (!set.size) listeners.set(type, set);
    set.add(listener);
  }

  off([type, p = "normal"]: [T, EventPriority?], listener: EventListener) {
    const listeners = this.listeners(p);
    if (!listeners) return;
    const set = listeners.get(type);
    if (set) set.delete(listener);
  }

  async emit(type: T, ...args: any[]): Promise<"cancelled" | any[]> {
    const all = [];

    const highs = this.highs.get(type);
    if (highs) all.push(...Array.from(highs));

    const normals = this.normals.get(type);
    if (normals) all.push(...Array.from(normals));

    const lows = this.lows.get(type);
    if (lows) all.push(...Array.from(lows));

    let values = args;

    for (const listener of all) {
      const result = await listener(...values);
      if (result === "cancelled") return result;
      if (!Array.isArray(result)) continue;
      values = merge(values, result);
    }

    return values;
  }
}
