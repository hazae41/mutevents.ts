import { Abortable } from "./deps/abortable.ts"

export type EventPriority =
  "before" | "normal" | "after";

export type EventListener<V> =
  (x: V) => unknown | Promise<unknown>

export type EventListeners<T> = {
  [K in keyof T]?: (EventListener<T[K]> | undefined)[]
}

export class Cancelled {
  constructor(readonly reason?: string) { }
}

export class EventEmitter<T> {
  listeners: {
    [P in EventPriority]: EventListeners<T>
  } = {
      "before": {},
      "normal": {},
      "after": {}
    }

  /**
   * Get the listeners of the given event type and priority
   * @param type Event type
   * @param priority Event priority
   * @returns Listeners of the given event type and priority
   */
  listenersOf<K extends keyof T>(
    type: K, priority: EventPriority = "normal"
  ) {
    const listeners = this.listeners[priority][type]
    if (!listeners) this.listeners[priority][type] = []
    return this.listeners[priority][type]!;
  }

  /**
   * Execute the given listeners each time the given event type is emitted
   * @param [type, priority] Event type and priority
   * @param listeners Listeners
   * @returns Cleanup function
   */
  on<K extends keyof T>(
    [type, priority = "normal"]: [K, EventPriority?],
    ...listeners: EventListener<T[K]>[]
  ) {
    const _listeners = this.listenersOf(type, priority)

    const indexes = new Array<number>()
    for (const listener of listeners) {
      const i = _listeners.push(listener) - 1
      indexes.push(i)
    }

    return () => {
      for (const i of indexes)
        delete _listeners[i]
    }
  }

  /**
   * Execute the given listeners once the given event type is emitted
   * (self-cancelling event listener)
   * @param [type, priority] Event type and priority
   * @param listeners Listeners
   * @returns Cleanup function
   */
  once<K extends keyof T>(
    [type, priority = "normal"]: [K, EventPriority?],
    ...listeners: EventListener<T[K]>[]
  ) {
    const off = this.on([type, priority],
      () => { off() }, ...listeners)
    return off
  }

  /**
   * Abortable promise that resolves (with the result) when the given event type is emitted
   * @param [type, priority] Event type and priority
   * @param filter Only resolve if it returns true
   * @returns Abortable promise
   */
  wait<K extends keyof T>(
    [type, priority = "normal"]: [K, EventPriority?]
  ) {
    return Abortable.create<T[K]>((ok) =>
      this.on([type, priority], ok))
  }

  /**
   * Promise that rejects (with the result) when the given event type is emitted
   * @param [type, priority] Event type and priority
   * @param filter Only reject if it returns true
   * @returns Abortable promise
   */
  error<K extends keyof T>(
    [type, priority = "normal"]: [K, EventPriority?]
  ) {
    return Abortable.create<never>((_, err) =>
      this.on([type, priority], err))
  }

  /**
   * Asynchronously emits the given data on the given event type
   * @param type Event type
   * @param data Event data
   * @returns Cancelled if any listener threw Cancelled; nothing else
   * @throws An unknown if any listener threw something (except Cancelled); nothing else
   */
  async emit<K extends keyof T>(type: K, data: T[K]): Promise<Cancelled | undefined> {
    try {
      for (const listener of [
        ...this.listenersOf(type, "before"),
        ...this.listenersOf(type, "normal"),
        ...this.listenersOf(type, "after")
      ]) await listener?.(data)
    } catch (e: unknown) {
      if (e instanceof Cancelled)
        return e
      throw e
    }
  }

  /**
   * Synchronously emits the given data on the given event type
   * @param type Event type
   * @param data Event data
   * @returns Cancelled if any listener (synchronously) threw Cancelled; nothing else
   * @throws An unknown if any listener (synchronously) threw something (except Cancelled); nothing else
   */
  emitSync<K extends keyof T>(type: K, data: T[K]) {
    try {
      for (const listener of [
        ...this.listenersOf(type, "before"),
        ...this.listenersOf(type, "normal"),
        ...this.listenersOf(type, "after")
      ]) listener?.(data)
    } catch (e: unknown) {
      if (e instanceof Cancelled)
        return e
      throw e
    }
  }

  /**
   * Shortcut for creating an event listener
   * that reemits the data on the given event type
   * @param type Event type you want to reemit to
   * @example sub.on(["close"], this.reemit("close"))
   */
  reemit<K extends keyof T>(type: K) {
    return (data: T[K]) => this.emit(type, data)
  }

  /**
   * Shortcut for creating an event listener that
   * synchronously reemits the data on the given event type
   * @param type Event type you want to reemit to
   * @example this.on(["close"], this.reemitSync("close"))
   */
  reemitSync<K extends keyof T>(type: K) {
    return (data: T[K]) => this.emitSync(type, data)
  }
}