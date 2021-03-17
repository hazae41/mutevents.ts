import { Cancelled, EventEmitter } from "../mod.ts";

// This file tests inheritance and cancellation

interface AnimalEvents {
  death: void
}

class Animal<E extends AnimalEvents = AnimalEvents> extends EventEmitter<E> {
  async die() {
    return await this.emit("death", undefined)
  }
}

interface DogEvents extends AnimalEvents {
  woof: string
}

class Dog extends Animal<DogEvents> {
  async woof(text: string) {
    return await this.emit("woof", text)
  }
}

interface DuckEvents extends AnimalEvents {
  quack: string
}

class Duck extends Animal<DuckEvents> {
  async quack(text: string) {
    return await this.emit("quack", text)
  }
}

interface CatEvents extends AnimalEvents {
  meow: string
}

class Cat extends Animal<CatEvents> {
  async meow(text: string) {
    return await this.emit("meow", text)
  }
}

class Lizard extends Animal {
  // Nothing more
}

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

  // Comment this listener and see what happens
  dog.on(["woof", "before"], () => {
    throw new Cancelled("Muzzled")
  })

  dog.on(["woof", "after"], (text) => {
    console.log("Dog:", text)
  })

  const [,cancelled] = await dog.woof("Woof!")
  if (cancelled) console.log(cancelled)
}

test();