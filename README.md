# Mutevents

![events graph](https://i.imgur.com/Se9fNFI.png?1)

Events allows multiple listeners (A, B, C) to be executed when objects (O, S) trigger them; without ever knowing their existence at compile time.

## Usage

    deno cache -r https://deno.land/x/mutevents/mod.ts

```typescript
import { EventEmitter } from "https://deno.land/x/mutevents/mod.ts";

interface AnimalEvents {
	death: []
}

class Animal extends EventEmitter<AnimalEvents> { 
	async die(){
		const cancelled = await this.emit("death")
		if (cancelled) throw cancelled;
	}
}

const animal = new Animal()

animal.on(["death"], () => console.log("Dead!"))

const cancelled = await animal.emit("death")
if(cancelled) console.error(cancelled)
```

## Syntax

```typescript
emitter.emit(event, ...args: any[]): Promise<Cancelled | undefined>
emitter.on([event, priority], listener: EventListener): void
emitter.off([event, priority], listener: EventListener): void
emitter.once([event, priority], listener: EventListener): EventListener
```

## Types

Types are useful with TypeScript autocompletion and compiler warnings. Plus, they allow you to inherit events from a superclass.

### Class way

We define a generic type Animal with a "death" event type

```typescript
interface AnimalEvents {
	death: []
}

class Animal<E extends AnimalEvents = AnimalEvents> extends EventEmitter<E> {
	// ...	
}
```

Then we define a type Dog that extends Animal with a "woof" event type.

```typescript
interface DogEvents extends AnimalEvents {
	woof: [string]
}

class Dog extends Animal<DogEvents> {
	// ...
}
```

Dog can now emit two event types: "woof" and "death"

### Attribute way

We define an Animal class with an events attribute.
	
```typescript
interface AnimalEvents {
	death: []
}

class Animal<E extends AnimalEvents = AnimalEvents> {
	events: new EventEmitter<E>()
	// ...
}
```

Then we define a type Duck that overrides Animal's events attribute type to inject a new "quack" event type.

```typescript
interface DuckEvents extends AnimalEvents { 
	quack: [] 
}

class Duck extends Animal<DuckEvents> {
	// ...
}
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
dog.on(["woof"], () => {
	if(dog.name !== "Rex") 
		throw new Cancelled();

	console.log("Rex: woof");
});

dog.on(["woof"], () => {
	console.log("This won't be displayed")
});
```

You can check for cancellation on the emitter side

```typescript
const cancelled = await dog.emit("woof");
if (cancelled) console.error("cancelled")
```

Or rethrow it

```typescript
const cancelled = await dog.emit("woof");
if (cancelled) throw cancelled;
```
