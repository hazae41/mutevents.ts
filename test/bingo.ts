import { EventEmitter } from "../mutevents.ts";

class Bingo extends EventEmitter<{
  1: undefined
  2: undefined
  3: undefined
}> { }

const bingo = new Bingo()

// Loop to emit random numbers
async function emit() {
  // Should autocomplete to 1 or 2 or 3
  // numbers.emit()

  while (true) {
    // Wait one second between each emit
    await new Promise(ok => setTimeout(ok, 1000))

    // Emit a random number
    const random = [1, 2, 3][~~(Math.random() * 3)]
    await bingo.emit(random as 1 | 2 | 3, undefined)
  }
}

// Say "Bingo! 1" when the number 1 is emitted
async function one() {
  const [one] = bingo.wait(1)
  await one
  console.log("Bingo!", 1)
}

// Say "Bingo! 2" when the number 2 is emitted
async function two() {
  const [two] = bingo.wait(2)
  await two
  console.log("Bingo!", 2)
}

// Say "Bingo! 3" when the number 3 is emitted
async function three() {
  const [three] = bingo.wait(3)
  await three
  console.log("Bingo!", 3)
}

emit()

// Wait for all three numbers, unordered
await Promise.all([one(), two(), three()])

// Kill the loop
Deno.exit()