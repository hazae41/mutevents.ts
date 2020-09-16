import { EventEmitter } from "../mod.ts";

interface DogEvents {
  woof: [string]
  death: []
}

class Dog extends EventEmitter<DogEvents> { }

const dog = new Dog()
listener(dog)
emitter(dog)

async function emitter(dog: Dog) {
  // await dog.emit("death")
  await new Promise((ok) => setTimeout(ok, 1000))
  await dog.emit("woof", "Woof!")
}

async function listener(dog: Dog) {
  // Listener-based
  dog.once(["woof"], console.log)

  // Promise-based
  try {
    const line = await new Promise<string>((ok, err) => {
      dog.once(["woof"], (line) => ok(line))
      dog.once(["death"], () => err(Error("Dead!")))
    })

    console.log(line)
  } catch (e: unknown) {
    console.error(e)
  }
}