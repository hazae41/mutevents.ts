import { EventEmitter } from "../mod.ts";

interface ParentEvents {
  foo: string
  bar: Error
}

interface ChildEvents {
  foo: Error
  bar: string
}

class Parent extends EventEmitter<ParentEvents> {
  child = new EventEmitter<ChildEvents>()

  constructor() {
    super()

    this.child.on(["foo"], this.reemit("bar"))
    this.child.on(["bar"], this.reemit("foo"))
  }
}

const parent = new Parent()

parent.on(["foo"], text => console.log("Foo", text))
parent.on(["bar"], error => console.error("Bar", error))

parent.child.emit("bar", "It works!")
parent.child.emit("foo", new Error("It works"))