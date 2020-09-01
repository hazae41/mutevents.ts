import { EventEmitter } from "../mod.ts";

class Animal<E = never> extends EventEmitter<E & {
    death: []
}> {
    // ...
}

class Dog extends Animal<{
    woof: [string]
}> { }
class Duck extends Animal<"quack"> { }
class Cat extends Animal<"meow"> { }
class Lizard extends Animal { }

export async function test() {
    const dog = new Dog();
    // Should autocomplete to "woof" and "death"
    // dog.emit("")

    const duck = new Duck()
    // Should autocomplete to "quack" and "death"
    // duck.emit("")

    const cat = new Cat()
    // Should autocomplete to "meow" and "death"
    // cat.emit("")

    const lizard = new Lizard()
    // Should only autocomplete to "death"
    // lizard.emit("")

    // After-observer
    dog.on(["woof", "after"], (msg: string) => {
        console.log("after", msg)
    })

    // Modifier
    dog.on(["woof"], (msg: string) => {
        return ["Waf!"];
    })

    // Canceller
    dog.on(["woof"], (msg: string) => {
        throw Error("cancelled")
    })

    // Before-observer
    dog.on(["woof", "before"], (msg: string) => {
        console.log("before", msg)
    })

    try {
        const [msg] = await dog.emit("woof", "Woof!");
        console.log("result:", msg);
    } catch (e) {
        if (e !== "cancelled") throw e
        console.log("cancelled")
    }
}

test();