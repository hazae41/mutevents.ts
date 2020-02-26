import { EventEmitter } from "./events.ts";

class Animal<T> extends EventEmitter<T | "death"> {}
class Dog extends Animal<"woof"> {}

function test() {
    let message = "hello world";
    const dog = new Dog();

    dog.on(["woof"], (msg: string) => {
        console.log(msg);
        return ["changed!"];
    })

    dog.on(["woof"], (msg: string) => {
        console.log(msg)
        // return "cancelled";
    })

    const result = dog.emit("woof", message);
    if(result === "cancelled") return;
    [message] = result;

    console.log(message);
}

test();