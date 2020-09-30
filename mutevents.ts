export type EventPriority =
  "before" | "normal" | "after";

export type EventListener<V> =
  (x: V) => unknown | Promise<unknown>

export type EventListeners<T> = {
  [K in keyof T]?: EventListener<T[K]>[]
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
    let listeners = this.listeners[priority][type]
    if (!listeners) this.listeners[priority][type] = []
    return this.listeners[priority][type]!;
  }

  /**
   * Execute the given listener each time the given event type is emitted
   * @param [type, priority] Event type and priority
   * @param listener Listener
   * @returns Cleanup function
   */
  on<K extends keyof T>(
    [type, priority = "normal"]: [K, EventPriority?],
    listener: EventListener<T[K]>
  ) {
    const i = this.listenersOf(type, priority).push(listener)
    return () => delete this.listenersOf(type, priority)[i]
  }

  /**
   * Execute the given listener once the given event type is emitted
   * (self-cancelling event listener)
   * @param [type, priority] Event type and priority
   * @param listener Listener
   * @returns Cleanup function
   */
  once<K extends keyof T>(
    [type, priority = "normal"]: [K, EventPriority?],
    listener: EventListener<T[K]>
  ) {
    const off = this.on([type, priority],
      (e) => { off(); listener(e) })
    return off
  }

  /**
   * Promise that resolves (with the result) when the given event type is emitted,
   * or rejects with a Cancelled when the cleanup function is called
   * @param type Event type
   * @param priority Event priority
   * @returns Promise and cleanup function
   */
  wait<K extends keyof T>(
    type: K, priority: EventPriority = "normal"
  ): [Promise<T[K]>, () => void] {
    let clean: () => void

    const promise = new Promise<T[K]>((ok, err) => {
      const off = this.once([type, priority], ok)
      clean = () => { off(); err(new Cancelled()) }
    })

    return [promise, () => clean()];
  }

  /**
   * Promise that rejects (with the result) when the given event type is emitted,
   * or rejects with a Cancelled when the cleanup function is called
   * @param type Event type
   * @param priority Event priority
   * @returns Promise and cleanup function
   */
  error<K extends keyof T>(
    type: K, priority: EventPriority = "normal"
  ): [Promise<never>, () => void] {
    let clean: () => void

    const promise = new Promise<never>((ok, err) => {
      const off = this.once([type, priority], err)
      clean = () => { off(); err(new Cancelled()) }
    })

    return [promise, () => clean()];
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
      ]) await listener(data)
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
      ]) listener(data)
    } catch (e: unknown) {
      if (e instanceof Cancelled)
        return e
      throw e
    }
  }
}