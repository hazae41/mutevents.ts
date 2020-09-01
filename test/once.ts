import { EventEmitter } from "../mod.ts";

class Dog extends EventEmitter<{
  "woof": [string]
  "death": []
}> { }

const dog = new Dog()
listener(dog)
emitter(dog)

async function emitter(dog: Dog) {
  // await dog.emit("death", [])
  await new Promise(r => setTimeout(r, 1000))
  const result = await dog.emit("woof", "Woof!")
}

async function listener(dog: Dog) {
  // Listener-based
  dog.on(["woof"], () => ["Modified!"])

  // Promise-based
  const line = await new Promise<string>((r, s) => {
    dog.once(["woof"], (line) => r(line))
    dog.once(["death"], () => s("Dead!"))
  })

  console.log(line)
}