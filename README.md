# data-custom-id

[![npm version](https://badge.fury.io/js/data-custom-id.svg)](https://badge.fury.io/js/data-custom-id)

DataCustomId lets you store data inside Discord's Custom ID system. 
This is useful for storing state within multi-interaction flows (confirm buttons, flows, etc.).

Data is stored using a system similar to URL query strings appended to the provided custom ID.

It's important to note that you can not guarantee data integrity. 
Custom IDs are sent by the client, and can be modified by users. 
**DO NOT INCLUDE SENSITIVE DATA IN CUSTOM IDS!.**

Once instances are created, the raw Custom ID (customId.rawId) is immutable.
If you want to keep the current state and change the raw ID, you can create a new instance with the new raw ID, 
then call `newCustomId.copyFieldsFrom(oldCustomId)`.

|   Custom ID   |               State                | DataCustomId (that you'll send to Discord) |
|:-------------:|:----------------------------------:|:------------------------------------------:|
| `ban/confirm` | `{ "user": "42390489028347289" } ` |    `ban/confirm?user=42390489028347289`    |

## Quickstart

See full documentation [here](docs/API.md).

### Install

`npm install data-custom-id` / `yarn add data-custom-id`

For TypeScript users, types are included in the package.

### Import

```js
// if using node with modules, typescript, or a bundler
import DataCustomId from 'data-custom-id';
// otherwise,
const DataCustomId = require("data-custom-id");
```

### Send a DataCustomId

```js
// create a new DataCustomId
const dataCustomId = new DataCustomId("ban/confirm")
  // add fields (chainable)
  .addField("user", "42390489028347289")

await interaction.reply({
  content: "Are you sure you want to ban this user?",
  components: [
    new MessageActionRow().addComponents(
      new MessageButton()
        .setLabel("Confirm")
        .setCustomId(dataCustomId.toString())
        .setStyle("DANGER")
    )
  ]
})
```

### Receive a DataCustomId

This example uses "path parts", which is your raw ID split by `/`.

```js
// assuming you're using discord.js, but you don't have to
client.on("interactionCreate", (interaction) => {
  // only message components have custom IDs
  if(!interaction.isMessageComponent()) {
    return;
  }

  // new DataCustomId(id) parses fields from the string id if present
  // using the example from before, let's say the custom id is:
  // ban/confirm?user=42390489028347289
  const dataCustomId = new DataCustomId(interaction.customId);

  // pathParts splits the rawId by /
  // if you need, you can also use dataCustomId.rawId, which is the custom id without any data
  switch(dataCustomId.pathParts[0]) {
    case "ban": {
      // the `|| ""` is in case the id is just `ban`
      switch (dataCustomId.pathParts[1] || "") {
        case "confirm": {
          const userId = dataCustomId.getStringField("user"); // 42390489028347289
          // ban the user
          break;
        };
        // ... (more cases for ban/*)
      }
      break;
    }
    // ... (more cases for *)
  }
})
```

### Copy fields between DataCustomIds

```js
// new DataCustomId(id) parses the id and handles fields
const customId = new DataCustomId(interaction.customId)
// customId.getFields() -> { "user": "42390489028347289", "reason": "spam" }

const newCustomId = new DataCustomId("...")
  .copyFieldsFrom(customId)
// newCustomId.getFields() -> { "user": "42390489028347289", "reason": "spam" }
```

## Tell me more

### What can I store?

- Boolean values (`true`, `false`)
- Integers and integer arrays (`1`, `2`, `3`) or `[1, 2, 3]`
- Strings and string arrays (`"hello"`, `"world"`) or `["hello", "world"]`

### How do I get the data back?

You can use convenience methods like:

- `getStringField` / `getStringArrayField`
- `getNumberField` / `getNumberArrayField`
- `getBooleanField`

Or, you can use `getFields` to get all fields, however
the convenience methods handle types, so `"1"` is converted to `1`, for example.

## Full documentation

See full docs [here](docs/API.md).
