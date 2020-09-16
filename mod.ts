type Awaitable<T> = T | Promise<T>

export type EventListener<V extends any[]> =
  (...x: V) => Awaitable<unknown>

export type EventPriority =
  "before" | "normal" | "after";

export type EventListeners<T> = {
  [K in keyof T]?: EventListener<T[K] & any[]>[]
}

export class Cancelled extends Error {
  constructor() {
    super("Event cancelled")
    this.name = "Cancelled"
  }
}

export class EventEmitter<T extends {}> {
  _listeners: {
    [P in EventPriority]: EventListeners<T>
  } = {
      "before": {},
      "normal": {},
      "after": {}
    }

  private _listenersOf<K extends keyof T>(
    type: K, priority: EventPriority = "normal"
  ) {
    const { _listeners } = this;
    let listeners = _listeners[priority][type]
    if (!listeners) listeners = _listeners[priority][type] = []
    return listeners!!;
  }

  on<K extends keyof T>(
    [type, priority = "normal"]: [K, EventPriority?],
    listener: EventListener<T[K] & any[]>
  ) {
    this._listenersOf(type, priority).push(listener)
    return () => this.off([type, priority], listener)
  }

  off<K extends keyof T>(
    [type, priority = "normal"]: [K, EventPriority?],
    listener: EventListener<T[K] & any[]>
  ) {
    const { _listeners } = this;

    const listeners = _listeners[priority]

    listeners[type] = listeners[type]!!
      .filter(it => it !== listener)

    return () => this.on([type, priority], listener)
  }

  once<K extends keyof T>(
    [type, priority = "normal"]: [K, EventPriority?],
    listener: EventListener<T[K] & any[]>
  ) {
    const off = this.on([type, priority], (...data) => {
      off();
      return listener(...data)
    })

    return off
  }

  async emit<K extends keyof T>(type: K, ...data: T[K] & any[]) {
    try {
      const all = [
        ...this._listenersOf(type, "before"),
        ...this._listenersOf(type, "normal"),
        ...this._listenersOf(type, "after")
      ]

      for (const listener of all)
        await listener(...data)
    } catch (e: unknown) {
      if (e instanceof Cancelled)
        return e

      throw e
    }
  }

}