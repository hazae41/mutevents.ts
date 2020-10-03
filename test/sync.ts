import { Cancelled, EventEmitter } from "../mod.ts";
import { Timeout } from "https://deno.land/x/timeout/mod.ts"

class Sync extends EventEmitter<{
  test: { value: string }
}> { }

const sync = new Sync()

sync.on(["test"], async (data) => {
  await Timeout.wait(100)
  // throw new Cancelled()
  data.value = "Modified"
})

const data = { value: "Original" }
const cancelled = sync.emitSync("test", data)
if (cancelled) throw cancelled
console.log(data.value)