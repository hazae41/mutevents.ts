import { EventEmitter } from "../mod";

const test = new EventEmitter<"test">()

async function emitter() {
    await test.emit("test", "it works!")
}

async function receiver() {
    const [data] = await test.wait(["test"])
    console.log(data)

    // Should display "test" mapped to an empty set
    console.log(test.listeners.normal)
}

receiver()
emitter()