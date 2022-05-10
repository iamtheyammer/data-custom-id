# DataCustomId API

## Table of Contents

- [DataCustomId](#datacustomid)
- [DataCustomId.defaultEncodeOptions](#defaultencodeoptions)
- [DataCustomId.DataCustomIdLengthError](#DataCustomIdLengthError)

## Types

This package is entirely written in TypeScript, so all types should be included in the package.

### `EncodableDataCustomIdFieldValue`

`number | number[] | null | DataCustomIdFieldValue`

Used for encodable data. Data that can be encoded includes things like numbers, arrays, nulls, etc.

However, when decoding data, types like numbers aren't decoded to number but rather their string representations.

### `DataCustomIdFieldValue`

`string | string[]`

## `DataCustomId`

`DataCustomId` is the core class used to represent a custom ID.

Create one with `new DataCustomId(id)`.

### `constructor (id: string) => DataCustomId`

Creates a new DataCustomId instance with a given Custom ID which may or may not contain data.
Fields should be strings, optionally separated by / characters. This will allow you to use customId.pathParts.
If a custom ID is provided, it will be parsed, allowing you to use methods like getFields and addFields.
Custom IDs without data must not have ? or & characters. Those characters are used to store data.
Discord limits Custom IDs to 100 characters, but this limit is not enforced until you call toString().

Params:
- id – The raw custom ID with or without fields appended.

```js
const customId = new DataCustomId('customId');
console.log(customId.toString());
// -> customId
```

### `addField (field: string, value: EncodableDataCustomIdFieldValue) => DataCustomId`

Adds a field to the custom ID.
Keep names and values short to avoid hitting Discord's limit, which is not enforced until you call toString().

Params:
- key – The key (name) of the field.
- value – Its value: a string, array of strings, or boolean.

```js
const customId = new DataCustomId('rawId');

customId.addField('field1', 'value1');

console.log(customId.toString()); 
// -> rawId?field1=value1
```

### `addFields (fields: { [key: string]: EncodableDataCustomIdFieldValue }) => DataCustomId`

Add multiple fields to the custom ID. Overwrites existing fields with the same name.

Params:
- fields – Fields to add to the custom ID.

### `removeField (field: string) => DataCustomId`

Removes a field from the custom ID.

Params:
- key – The key (name) of the field to remove.

### `copyFieldsFrom (other: DataCustomId) => DataCustomId`

Copies all fields from another custom ID to this custom ID. Useful for continuing state from one custom ID to another.
Overwrites existing fields with the same name.

Params:
- other – DataCustomId instance to copy fields from.

```js
const customId = new DataCustomId('rawId').addField('field1', 'value1');
console.log(customId.toString()); 
// -> rawId?field1=value1

const customId2 = new DataCustomId('rawId2').copyFieldsFrom(customId);
console.log(customId2.toString()); 
// -> rawId2?field1=value1
```

### `getFields () => { [key: string]: DataCustomIdFieldValue }`

Returns all the Custom ID's fields.

Remember that decoded fields are always strings or string arrays.
It's highly recommended to use the convenience methods instead of accessing the fields directly.

### `getStringField (key: string) => string`

Returns the value of a field, coalesced to a string.

Params:
- key – The key (name) of the field.

Returns:
- A string with the value, or "" if the field does not exist.

### `getStringArrayField (key: string) => string[]`

Returns the value of a field, coalesced to a string array.

Params:
- key – The key (name) of the field.

Returns:
- An array of strings, or an empty array if the field does not exist.

### `getNumericField (key: string) => number`

Returns the value of a field, coalesced to a number or float.
Floats can only have base 10.

Params:
- key – The key (name) of the field.
- float: boolean – Whether the number should be parsed with parseFloat(). Doesn't support bases. Default false.
- base: number – The base to parse the number in. Numbers only (no floats). Default 10.

Returns:
- A number or NaN if the field doesn't exist or isn't a number.

### `getNumericArrayField (key: string) => number[]`

Returns the value of a field, coalesced to a number array. If the value contains non-numbers, they will be in the return value as NaN. Remember to use isNaN() to check for NaN values, not value === NaN (that does not work!).

Params:
- key – The key (name) of the field.
- float: boolean – Whether the numbers should be parsed with parseFloat(). Doesn't support bases. Default false.
- base: number – The base to parse the number in. Numbers only (no floats). Default 10.

Returns:
- A number array, or an empty array if the field does not exist.

### `getBooleanField (key: string) => boolean`

Returns the value of a field, coalesced to a boolean. If the value of the field is not true or 1, it will be false.

Params:
- key – The key (name) of the field.

Returns:
- A boolean with the value, or false if the field does not exist.

### `toString (compressionOptions: DataCustomIdEncodeOptions) => string`

Returns the raw ID string with all fields encoded.
A Custom ID /ban with fields { "reason": "spam"} should return /ban?reason=spam. true and falsy values may or may not be encoded depending on selected options.

Params:
- compressionOptions: [DataCustomIdEncodeOptions](#DataCustomIdEncodeOptions) – The options to use when encoding the fields.

Returns:
- The Custom ID value with all fields encoded. Use this as the value for the Custom ID field in a Discord API request.

Throws:
- [DataCustomIdLengthError](#DataCustomIdLengthError) – if the serialized string is over Discord's 100-character limit.

```js
const customId = new DataCustomId("rawId")
  .addField("param1", 0)

console.log(customId.toString()) // uses default compression options
// -> rawId

console.log(customId.toString({ skipFalsyValues: false })); // inline compression options
// -> rawId?param1=0
```

## `DataCustomIdEncodeOptions`

### `skipFalsyValues`

Saves Custom ID space by not encoding falsy values . This means values like 0, false, "", [], etc. will be omitted from serialization.

Defaults to true.

Helps save space, but means that falsy values will not be encoded at all– if your fields object looks like { foo: "", bar: 0 }, after encoding and decoding, your resulting fields object will be {}, as both "" and 0 are falsy.

Both !originalFields.foo and !originalFields.bar are true, and so are !fields.foo and !fields.bar. However, typeof originalFields.foo === "string" whereas typeof fields.foo === "undefined".

If you use helper functions like [getStringField](#getstringfield-key-string--string), [getNumericField](#getnumericfield-key-string--number), etc., you can use this option safely– those helper functions will return an empty value ("" for string, 0 for number, etc.) if the field doesn't exist. However, if you read raw fields, this might matter.

### `convertTrueToOne`

Saves space by encoding the value true as 1 instead of "true".

Defaults to false, because, sometimes, an empty value can mean something other than plain false.

If you use the helper function [getBooleanField](#getbooleanfield-key-string--boolean), you can use this option safely– it will return true. However, if you read raw fields, this might matter.

## `DataCustomIdLengthError`

Thrown if the to-be-serialized Custom ID is over 100 characters, Discord's limit for Custom IDs.

## `defaultEncodeOptions`

Defaults:

```json
{
  "skipFalsyValues": true,
  "convertTrueToOne": false
}
```

You can change these, like this:

```ts
import { defaultEncodeOptions } from "discord-datacustomid";
defaultEncodeOptions.skipFalsyValues = false;
```

These are global defaults, and you can always set them when encoding, shown in [toString](#tostring-compressionoptions-datacustomidencodeoptions--string).
