import { EventEmitter } from "../mod.ts";
import { Timeout } from "https://deno.land/x/timeout@2.4/mod.ts"

class Bingo extends EventEmitter<{
  1: void
  2: void
  3: void
}> { }

const bingo = new Bingo()

// Loop to emit random numbers
async function emit() {
  // Should autocomplete to 1 or 2 or 3
  // numbers.emit()

  while (true) {
    // Wait one second between each emit
    await Timeout.wait(1000)
    // Emit a random number
    const random = [1, 2, 3][~~(Math.random() * 3)]
    bingo.emit(random as 1 | 2 | 3, undefined)
    console.log("Emitted", random)
  }
}

// Say "Bingo!" when the number 1 is emitted
async function one() {
  await bingo.wait([1])
  console.log("Bingo! Got", 1)
}

// Say "Bingo!" when the number 2 is emitted
async function two() {
  await bingo.wait([2])
  console.log("Bingo! Got", 2)
}

// Say "Bingo!" when the number 3 is emitted
async function three() {
  await bingo.wait([3])
  console.log("Bingo! Got", 3)
}

emit()

// Wait for all three numbers, unordered
await Promise.all([one(), two(), three()])

// Kill the loop
Deno.exit()