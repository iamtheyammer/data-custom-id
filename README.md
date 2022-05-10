# data-custom-id

[![npm version](https://badge.fury.io/js/data-custom-id.svg)](https://badge.fury.io/js/data-custom-id)

Holds data in Discord's Interaction Custom IDs.

Have you ever wanted to store state between Discord interactions (perhaps for a confirm button)?
Here's a simple way to do it with full TypeScript support and rigorous testing.

| Command        | State | DataCustomId                          |
|----------------| --- |---------------------------------------|
| `/ban/confirm` | `{ "user": "42390489028347289"} ` | `/ban/confirm?user=42390489028347289` |

## Installation and Usage

`npm install data-custom-id` / `yarn add data-custom-id`

### Import

```js
// if using node modules, typescript, or a bundler
import DataCustomId from 'data-custom-id';
// otherwise,
const DataCustomId = require("data-custom-id").default;
```

### Send a DataCustomId

```js
// create a new DataCustomId
const dataCustomIdString = new DataCustomId("myRawId")
  // add fields (chainable)
  .addField("user", "42390489028347289")
  // stringify
  .toString()

await interaction.reply({
  content: "Are you sure you want to ban this user?",
  components: [
    new MessageActionRow().addComponents(
      new MessageButton()
        .setLabel("Confirm")
        .setCustomId(dataCustomIdString)
        .setStyle("DANGER")
    )
  ]
})
```

### Handle a DataCustomId

This example uses "path parts", which is your raw ID split by `/`.

```js
client.on("interactionCreate", (interaction) => {
  // only message components have custom IDs
  if(interaction.isMessageComponent()) {
    // using the example from before, let's say the custom id is:
    // /ban/confirm?user=42390489028347289
    const dataCustomId = new DataCustomId(interaction.customId);
    
    // splits the rawId by /
    // if you need, you can also use dataCustomId.rawId
    switch(dataCustomId.pathParts[0]) {
      case "ban": {
        switch (dataCustomId.pathParts[1]) {
          case "confirm": {
            const userId = dataCustomId.getStringField("user");
            // ban the user
            break;
          };
          // ... (more cases for /ban/*)
        }
        break;
      }
      // ... (more cases for /*)
    }
  }
})
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

Full documentation is coming, but, for now, check out the JSDoc comments
on the code [here](https://github.com/iamtheyammer/data-custom-id/blob/main/src/DataCustomId.ts).
