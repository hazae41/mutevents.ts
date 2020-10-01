import { EventEmitter } from "../mod.ts";

import { Abort } from "https://deno.land/x/abortable/mod.ts"
import { Timeout } from "https://deno.land/x/timeout/mod.ts"

class Connection extends EventEmitter<{
  message: string
  close: Error
}> {
  async onmessage(message: string) {
    await this.emit("message", message)
  }

  async onclose(reason: string) {
    await this.emit("close", new Error(reason))
  }

  // Wait for a message until the connection is closed
  // Removing both listeners when one of them fullfills
  async read() {
    const message = this.wait("message")
    const close = this.error("close")
    return await Abort.race([message, close])
  }

  // Simulate a response
  async write(message: string) {
    console.log("Sent:", message)
    await Timeout.wait(500 /*Change me*/)
    conn.onmessage("I'm fine")
  }

  // Send and wait for a message until the connection is closed OR the delay is exceeded
  // Removing both listeners and clearing the timeout when one of them fullfills
  async request(request: string) {
    const response = this.wait("message")
    const close = this.error("close")

    this.write(request)

    return await Timeout.race([response, close], 1000)
  }
}

const conn = new Connection()

async function emit() {
  // Change the order of the following lines
  await conn.onmessage("Hello!")
  await Timeout.wait(100 /*Change me*/)
  await conn.onclose("Closed!")
}

async function receive() {
  try {
    const msg1 = await conn.read()
    console.log("Received:", msg1)

    const msg2 = await conn.request("How are you?")
    console.log("Received:", msg2)
  } catch (e) {
    console.error(e)
  }
}

receive()
emit()
