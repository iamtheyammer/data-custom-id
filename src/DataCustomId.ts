import { parse, stringify } from "qs";
type DataCustomIdFieldValue = string | string[];
type EncodableDataCustomIdFieldValue =
  | boolean
  | number
  | number[]
  | null
  | DataCustomIdFieldValue;

export interface DataCustomIdFields {
  [key: string]: DataCustomIdFieldValue | EncodableDataCustomIdFieldValue;
}

export interface DataCustomIdEncodeOptions {
  /**
   * Saves Custom ID space by not encoding [falsy values](https://developer.mozilla.org/en-US/docs/Glossary/Falsy).
   * This means values like `0`, `false`, `""`, `[]`, etc. will be omitted from serialization.
   *
   * Defaults to `true`.
   *
   * Helps save space, but means that falsy values will not be encoded at all-- if your fields object
   * looks like `{ foo: "", bar: 0 }`, after encoding and decoding, your resulting fields
   * object will be `{}`, as both `""` and `0` are falsy.
   *
   * Both `!originalFields.foo` and `!originalFields.bar` are true, and so are `!fields.foo` and `!fields.bar`.
   * However, `typeof originalFields.foo === "string"` whereas `typeof fields.foo === "undefined"`.
   *
   * If you use helper functions like `getStringField`, `getNumberField`, etc., you can use this option safely--
   * those helper functions will return an empty value (`""` for string, `0` for number, etc.) if the field doesn't exist.
   * However, if you read raw fields, this might matter.
   *
   * @default true
   */
  skipFalsyValues?: boolean;
  /**
   * Saves space by encoding the value `true` as `1` instead of `"true"`.
   *
   * Defaults to `false`, because, sometimes, an empty value can mean something other than plain `false`.
   *
   * If you use the helper function `getBooleanField`, you can use this option safely-- it will return `true`.
   * However, if you read raw fields, this might matter.
   *
   * @default false
   */
  convertTrueToOne?: boolean;
}

export const defaultEncodeOptions: DataCustomIdEncodeOptions = {
  skipFalsyValues: true,
  convertTrueToOne: false,
};

/**
 * DataCustomIdLengthError is thrown by `DataCustomId.toString()` when the
 * length of the resulting string is greater than Discord's maximum length of 100 characters.
 */
export class DataCustomIdLengthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DataCustomIdLengthError";
  }
}

/**
 * DataCustomId lets you store data inside Discord's Custom ID system.
 * This is useful for storing state within multi-interaction flows.
 *
 * Data is stored using a system similar to URL query strings appended to
 * the provided custom ID.
 *
 * It's important to note that you **can not** guarantee data integrity.
 * Custom IDs are sent by the client, and can be modified by users.
 * **DO NOT INCLUDE SENSITIVE DATA IN CUSTOM IDS!**.
 *
 * Once instances are created, the raw Custom ID (`customId.rawId`) is immutable.
 * If you want to keep the current state and change the raw ID, you can
 * create a new instance with the new raw ID, then call `newCustomId.copyFieldsFrom(oldCustomId)`.
 *
 * @author iamtheyammer
 */
export default class DataCustomId {
  /**
   * The raw Custom ID string.
   */
  public readonly rawId: string;

  public readonly pathParts: string[];
  private fields: DataCustomIdFields = {};

  /**
   * Creates a new DataCustomId instance with a given Custom ID which
   * may or may not contain data.
   *
   * Fields should be strings, optionally separated by `/` characters.
   * This will allow you to use `customId.pathParts`.
   *
   * If a custom ID is provided, it will be parsed,
   * allowing you to use methods like `getFields` and `addFields`.
   *
   * Custom IDs with**out** data must not have `?` or `&` characters.
   * Those characters are used to store data.
   *
   * Discord limits Custom IDs to 100 characters, but this limit is not enforced
   * until you call `toString()`.
   *
   * @param id {string} The raw custom ID with or without fields appended.
   */
  constructor(id: string = "") {
    if (id.includes("?")) {
      this.rawId = id.slice(0, id.indexOf("?"));
      this.fields = parse(id.slice(id.indexOf("?") + 1), {
        // because we encode with commas to save space
        comma: true,
      }) as DataCustomIdFields;
    } else {
      this.rawId = id;
    }

    this.pathParts = this.rawId.split("/");

    return this;
  }

  /**
   * Adds a field to the custom ID.
   *
   * Keep names and values short to avoid hitting Discord's limit, which is not enforced
   * until you call `toString()`.
   *
   * @param key The key (name) of the field.
   * @param value Its value: a string, array of strings, or boolean.
   */
  public addField(
    key: string,
    value: EncodableDataCustomIdFieldValue
  ): DataCustomId {
    // @ts-ignore - qs will handle serialization of "incompatible" types
    this.fields[key] = value;

    return this;
  }

  /**
   * Add multiple fields to the custom ID.
   * Overwrites existing fields with the same name.
   * @param fields Fields to add to the custom ID.
   * @returns The current instance for chaining.
   */
  public addFields(fields: DataCustomIdFields): DataCustomId {
    this.fields = {
      ...this.fields,
      ...fields,
    };

    return this;
  }

  /**
   * Removes a field from the custom ID.
   * @param key The key (name) of the field to remove.
   * @returns The current instance for chaining.
   */
  public removeField(key: string): DataCustomId {
    delete this.fields[key];
    return this;
  }

  /**
   * Copies all fields from another custom ID to this custom ID.
   * Useful for continuing state from one custom ID to another.
   *
   * Overwrites existing fields with the same name.
   * @param other DataCustomId instance to copy fields from.
   * @returns The current instance for chaining.
   */
  public copyFieldsFrom(other: DataCustomId): DataCustomId {
    this.fields = {
      ...this.fields,
      ...other.fields,
    };

    return this;
  }

  /**
   * Returns all the Custom ID's fields.
   */
  public getFields(): DataCustomIdFields {
    return this.fields;
  }

  /**
   * Returns the value of a field, coalesced to a string.
   *
   * @param key The key (name) of the field.
   * @returns A string with the value, or `""` if the field does not exist.
   */
  public getStringField(key: string): string {
    return typeof this.fields[key] === "string"
      ? (this.fields[key] as string)
      : "";
  }

  /**
   * Returns the value of a field, coalesced to a string array.
   * @param key The key (name) of the field.
   * @returns An array of strings, or an empty array if the field does not exist.
   */
  public getStringArrayField(key: string): string[] {
    if (typeof this.fields[key] === "undefined") {
      return [];
    }

    return Array.isArray(this.fields[key])
      ? (this.fields[key] as string[])
      : [this.fields[key] as string];
  }

  /**
   * Returns the value of a field, coalesced to a number or float.
   *
   * Floats can only have base 10.
   *
   * @param key The key (name) of the field.
   * @param float Whether the number should be parsed with `parseFloat()`. Doesn't support bases. Default false.
   * @param base The base to parse the number in. Numbers only (no floats). Default 10.
   * @returns A number or `NaN` if the field doesn't exist or isn't a number.
   */
  public getNumericField(key: string, float = false, base = 10): number {
    return typeof this.fields[key] === "string"
      ? (float ? parseFloat : parseInt)(this.fields[key] as string, base)
      // @ts-ignore - possible to have a number if someone added it and queried it without serialization
      : typeof this.fields[key] === "number" ? this.fields[key] as number : NaN;
  }

  /**
   * Returns the value of a field, coalesced to a number array.
   * If the value contains non-numbers, they will be in the return value as NaN.
   * Remember to use isNaN() to check for NaN values, not `value === NaN` (that _does not_ work!).
   *
   * @param key The key (name) of the field.
   * @param float Whether the numbers should be parsed with `parseFloat()`. Doesn't support bases. Default false.
   * @param base The base to parse the number in. Numbers only (no floats). Default 10.
   * @returns A number array, or an empty array if the field does not exist.
   */
  public getNumericArrayField(key: string, float = false, base = 10): number[] {
    if (typeof this.fields[key] === "undefined") {
      return [];
    }

    return this.getStringArrayField(key).map((x) => parseInt(x, 10));
  }

  /**
   * Returns the value of a field, coalesced to a boolean.
   * If the value of the field is not `true` or `1`, it will be `false`.
   *
   * @param key The key (name) of the field.
   * @returns A boolean with the value, or `false` if the field does not exist.
   */
  public getBooleanField(key: string): boolean {
    return (
      this.fields[key] === "true" ||
      this.fields[key] === "1" ||
      this.fields[key] === true ||
      // @ts-ignore - it's possible for someone to add this field pre-encoding.
      this.fields[key] === 1
    );
  }

  /**
   * Compresses fields based on the passed-in compression options.
   * @param fields The fields to compress.
   * @param options Compression options.
   * @returns A new object with compressed fields.
   * @private
   */
  private static compressFields(
    fields: DataCustomIdFields,
    options: DataCustomIdEncodeOptions
  ): DataCustomIdFields {
    // if every compression option is disabled, we can just return the fields
    if (Object.values(options).every((v) => v === false)) {
      return fields;
    }

    const compressedFields: DataCustomIdFields = {};

    for (const key in fields) {
      const value = fields[key];

      if (options.skipFalsyValues) {
        if (!value) {
          continue;
        }
      }

      if (options.convertTrueToOne) {
        if (value === true || value === "true") {
          compressedFields[key] = "1";
          continue;
        }
      }

      compressedFields[key] = value;
    }

    return compressedFields;
  }

  /**
   * Returns the raw ID string with all fields encoded.
   *
   * A Custom ID `/ban` with fields `{ "reason": "spam"}` should return `/ban?reason=spam`.
   * `true` and falsy values may or may not be encoded depending on selected options.
   *
   * @throws {DataCustomIdLengthError} if the serialized string is over Discord's 100-character limit.
   * @returns The Custom ID value with all fields encoded. Use this as the value for the Custom ID field in a Discord API request.
   */
  public toString(compressionOptions = defaultEncodeOptions): string {
    const compressedFields = DataCustomId.compressFields(
      this.fields,
      compressionOptions
    );

    const encodedFields = stringify(compressedFields, {
      // add ?
      addQueryPrefix: true,
      // rather than ?key[]=value&key[]=value2
      arrayFormat: "comma",
      // save space
      skipNulls: true,
      // not necessary to URL encode
      encode: false,
    });

    const finalId =
      encodedFields.length > 1 ? `${this.rawId}${encodedFields}` : this.rawId;

    if (finalId.length > 100) {
      throw new DataCustomIdLengthError(
        `DataCustomId is over Discord's limit of 100 characters: ${finalId}`
      );
    }

    return finalId;
  }
}

module.exports = DataCustomId;
module.exports.DataCustomIdLengthError = DataCustomIdLengthError;
module.exports.defaultEncodeOptions = defaultEncodeOptions;
