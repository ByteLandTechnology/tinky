[**tinky**](../README.md)

---

[tinky](../globals.md) / AppProps

# Interface: AppProps

Props for the AppContext.

## Properties

### env?

> `readonly` `optional` **env**: `Record`\<`string`, `string` \| `undefined`\>

Environment variables.

---

### exit()

> `readonly` **exit**: (`error?`) => `void`

Exit (unmount) the whole Tinky app.

#### Parameters

##### error?

`Error`

#### Returns

`void`

---

### platform?

> `readonly` `optional` **platform**: `string`

The platform the app is running on.
