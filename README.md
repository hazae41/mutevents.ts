# Mutevents

![events graph](https://i.imgur.com/Se9fNFI.png?1)

Events allows multiple listeners (A, B, C) to be executed when objects (O, S) trigger them; without ever knowing their existence at compile time.

## Usage

    deno cache -r https://deno.land/x/mutevents/mod.ts

```typescript
import { EventEmitter } from "https://deno.land/x/mutevents/mod.ts";

class Animal extends EventEmitter<{
	death: [] // No args
}> { 
	// ...
}

const animal = new Animal()
animal.on(["death"], () => console.log("dead"))
animal.emit("death")
```

## Syntax

```typescript
emitter.emit(event, ...args: any[]): Promise<any[]>
emitter.on([event, priority], listener: EventListener): void
emitter.off([event, priority], listener: EventListener): void
emitter.once([event, priority], listener: EventListener): EventListener
await emitter.wait([event, priority]): any[]
```

## Types

Types are useful with TypeScript autocompletion and compiler warnings. Plus, they allow you to inherit events from a superclass.

### Class way

We define a generic type Animal with a "death" event type

```typescript
class Animal<E = never> extends EventEmitter<E & {
	death: []
}> {
	// ...	
}
```

Then we define a type Dog that extends Animal with a "woof" event type.

```typescript
class Dog extends Animal<{
	woof: [string]
}> {
	// ...
}
```

Dog can now emit two event types: "woof" and "death"

### Attribute way

We define an Animal class with an events attribute.
	
```typescript
interface Animal<E = never> {
	events: new EventEmitter<E & { death: [] }>()
}
```

Then we define a type Duck that overrides Animal's events attribute type to inject a new "quack" event type.

```typescript
interface Duck extends Animal<{ quack: [] }> {}
```

Duck can now emit both "quack" and "death".

## Priorities

An event listener can have a priority:
- "before" means it will be handled first
- "normal" means normal
- "after" means it will be handled last

The priority must be defined in the array after the event name. If no priority is defined, "normal" will be used.

Example

```typescript
dog.on(["woof"], () => console.log("Normal"));
dog.on(["woof", "after"], () => console.log("Last"));
dog.on(["woof", "before"], () => console.log("First"));
```

The "low" listener will be executed after the "normal" one, which will be executed after the "high" one.

When multiple listeners are on the same priority, the first defined will be the first executed.

```typescript
dog.on(["woof", "before"], () => console.log("First"));
dog.on(["woof", "before"], () => console.log("Last"));
```

## Cancellation

Any event can be cancelled by any listener. The listener needs to throw something.
The next listener will not be executed, and the emit() will also throw.

```typescript
dog.on(["woof", "before"], () => { throw Error("cancelled") });
dog.on(["woof"], () => console.log("This won't be displayed"));
```

Block form

```typescript
dog.on(["woof"], () => {
	if(dog.name !== "Rex") throw Error("cancelled");
	console.log("Rex: woof");
});
```

You can check for cancellation on the emitter side

```typescript
try {
	await dog.emit("woof");
} catch(e){
	if(e.message !== "cancelled") throw e;
	console.log("cancelled")
}

```

## Mutability

Any event is mutable by any listener. If a listener returns an array, the next listener will be passed this array.

```typescript
player.on(["command"], (cmd: string) => {
	if(cmd === "man") return ["tldr"];
})

player.on(["command", "after"], (cmd: string) => {
	// cmd is now "tldr"
})
```

With multiple arguments

```typescript
player.on(["move"], (x, y, z) => {
	return [x, 0, z];
})

player.on(["move"], (x, y, z) => {
	// y is now 0
})
```

You can retrieve modification on the emitter side

```typescript
let x = 1;
let y = 2;
let z = 3;

[x, y, z] = await player.emit("move", x, y, z);
```
