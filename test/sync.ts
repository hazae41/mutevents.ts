import { EventEmitter } from "../mod.ts";

import { Timeout } from "https://deno.land/x/timeout@2.4/mod.ts"

type Data = { value: string }

class Sync extends EventEmitter<{
  test: Data
}> { }

const sync = new Sync()

async function modifyData(data: Data) {
  await Timeout.wait(100)
  // throw new Cancelled()
  data.value = "Modified"
}

sync.on(["test"], (data) => {
  modifyData(data)
})

const [data, cancelled] = sync.emitSync("test", { value: "Original" })
if (cancelled) throw cancelled
console.log(data.value)