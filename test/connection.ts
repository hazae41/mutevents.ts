import { EventEmitter } from "../mutevents.ts";

class Connection extends EventEmitter<{
  message: string
  close: Error
}> {
  async onmessage() {
    await this.emit("message", "Hello")
  }

  async onclose() {
    await this.emit("close", new Error("Closed"))
  }

  async read() {
    const [message, offmsg] = this.wait("message")
    const [close, offclose] = this.error("close")

    const line = await Promise.race([message, close])
      .finally(() => { offmsg(); offclose() })

    return line
  }
}

const conn = new Connection()

async function emit() {
  await new Promise(ok => setTimeout(ok, 100))

  // Change the order of the following lines
  await conn.onmessage()
  await conn.onclose()
}

async function receive() {
  try {
    const msg = await conn.read()
    console.log(msg)
  } catch (e) {
    console.error(e)
  }
}


receive()
emit()
