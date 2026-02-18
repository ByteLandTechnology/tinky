[**tinky**](../README.md)

---

[tinky](../globals.md) / EventEmitter

# Class: EventEmitter

A minimal EventEmitter implementation using mitt.

Provides a familiar Node.js-style EventEmitter API while using the
lightweight mitt library under the hood. This class is used internally
by Tinky for handling input events.

## Example

```typescript
const emitter = new EventEmitter();

// Register an event listener
emitter.on("data", (payload) => {
  console.log("Received:", payload);
});

// Emit an event
emitter.emit("data", { key: "value" });

// Register a one-time listener
emitter.once("single", (payload) => {
  console.log("Called only once:", payload);
});
```

## Constructors

### Constructor

> **new EventEmitter**(): `EventEmitter`

#### Returns

`EventEmitter`

## Properties

### emitter

> **emitter**: `Emitter`\<[`Events`](../type-aliases/Events.md)\>

The underlying mitt emitter instance.

## Methods

### emit()

> **emit**(`event`, `data?`): `boolean`

Emits an event with optional data payload.

#### Parameters

##### event

`string`

The name of the event to emit.

##### data?

`unknown`

Optional data payload to pass to the event handlers.

#### Returns

`boolean`

Always returns `true` indicating the event was emitted.

---

### off()

> **off**(`event`, `fn`): `this`

Removes an event listener for the specified event.

#### Parameters

##### event

`string`

The name of the event to stop listening for.

##### fn

`Handler`\<`unknown`\>

The handler function to remove.

#### Returns

`this`

This EventEmitter instance for chaining.

---

### on()

> **on**(`event`, `fn`): `this`

Registers an event listener for the specified event.

#### Parameters

##### event

`string`

The name of the event to listen for.

##### fn

`Handler`\<`unknown`\>

The handler function to call when the event is emitted.

#### Returns

`this`

This EventEmitter instance for chaining.

---

### once()

> **once**(`event`, `fn`): `this`

Registers a one-time event listener that automatically removes itself
after being called once.

#### Parameters

##### event

`string`

The name of the event to listen for.

##### fn

`Handler`\<`unknown`\>

The handler function to call when the event is emitted.

#### Returns

`this`

This EventEmitter instance for chaining.
