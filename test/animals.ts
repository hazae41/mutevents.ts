import { Cancelled, EventEmitter } from "../mod.ts";


interface AnimalEvents {
  death: []
}

class Animal<E extends AnimalEvents = AnimalEvents> extends EventEmitter<E> {
  async die() {
    return await this.emit("death")
  }
}

interface DogEvents extends AnimalEvents {
  woof: [{ msg: string }]
}

class Dog extends Animal<DogEvents> { }

interface DuckEvents extends AnimalEvents {
  quack: [{ msg: string }]
}

class Duck extends Animal<DuckEvents> { }

interface CatEvents extends AnimalEvents {
  meow: [{ msg: string }]
}

class Cat extends Animal<CatEvents> { }

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
  // slizard.emit("")

  // After-observer
  dog.on(["woof", "after"], (e) => {
    console.log("After:", e.msg)
  })

  // Modifier
  dog.on(["woof"], (e) => {
    e.msg = "Waf!"
  })

  // Canceller
  dog.on(["woof"], (e) => {
    if (e.msg === "Waf!")
      throw new Cancelled()
  })

  // Before-observer
  dog.on(["woof", "before"], (e) => {
    console.log("Before:", e.msg)
  })

  const e = { msg: "Woof!" }
  const cancelled = await dog.emit("woof", e);
  if (cancelled) console.log(cancelled)

  console.log("Result:", e.msg);
}

test();