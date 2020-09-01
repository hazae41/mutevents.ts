import { EventEmitter } from "../mod.ts";

class Numbers extends EventEmitter<{
  1: []
  2: []
  3: []
}> { }

export async function test() {
  const numbers = new Numbers()
  // Should autocomplete to 1 or 2 or 3
  // numbers.emit()

  numbers.on([1], () => console.log("Bingo!"))

  numbers.emit(2)
  numbers.emit(3)
  numbers.emit(1)
}

test()