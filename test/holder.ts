import { EventEmitter } from "../mutevents.ts";

class EventHolder<E = never> {
    events = new EventEmitter<E>()
}

class None extends EventHolder { }

class Test extends EventHolder<{
    test: void
}> { }

export async function test() {
    const none = new None()
    // Should NOT autocomplete
    // none.events.emit()

    const test = new Test()
    // Should autocomplete to "test"
    // test.events.emit("")
}