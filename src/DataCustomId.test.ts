import DataCustomId, {DataCustomIdLengthError} from "./DataCustomId";

describe("constructor", () => {
  describe("rawId", () => {
    test("should set rawId", () => {
      const dataCustomId = new DataCustomId("rawId");

      expect(dataCustomId.rawId).toBe("rawId");
    });

    test("rawId doesn't include params", () => {
      const dataCustomId = new DataCustomId("rawId?param=true");

      expect(dataCustomId.rawId).toBe("rawId");
    });
  })

  describe("pathParts", () => {
    test("pathParts is rawId split by /", () => {
      const dataCustomId = new DataCustomId("rawId/part2/part3");

      expect(dataCustomId.pathParts).toStrictEqual(["rawId", "part2", "part3"]);
    });

    test("pathParts doesn't include params", () => {
      const dataCustomId = new DataCustomId("rawId/part2/part3?param=true");

      expect(dataCustomId.pathParts).toStrictEqual(["rawId", "part2", "part3"]);
    });
  })

  describe("fields", () => {
    test("should set fields", () => {
      const dataCustomId = new DataCustomId("rawId?param1=value1&param2=true&param3=1,2,3");

      expect(dataCustomId.getFields()).toMatchObject({
        param1: "value1",
        param2: "true",
        param3: ["1", "2", "3"],
      });
    })
  });
});

describe("adding fields", () => {
  test("adding one field", () => {
    const dataCustomId = new DataCustomId("rawId");

    expect(dataCustomId.getFields()).toMatchObject({});
    dataCustomId.addField("param1", "value1");
    expect(dataCustomId.getFields()).toMatchObject({
      param1: "value1",
    });
  });

  test("adding one field overwrites field with the same name", () => {
    const dataCustomId = new DataCustomId("rawId");

    expect(dataCustomId.getFields()).toMatchObject({});

    dataCustomId.addField("param1", "value1");
    expect(dataCustomId.getFields()).toMatchObject({
      param1: "value1",
    });

    dataCustomId.addField("param1", "value2");
    expect(dataCustomId.getFields()).toMatchObject({
      param1: "value2",
    });
  });

  test("adding multiple fields", () => {
    const dataCustomId = new DataCustomId("rawId");

    expect(dataCustomId.getFields()).toMatchObject({});
    dataCustomId.addFields({
      param1: "value1",
      param2: "true",
    });
    expect(dataCustomId.getFields()).toMatchObject({
      param1: "value1",
      param2: "true",
    });
  });

  test("adding multiple fields overwrites fields with the same name", () => {
    const dataCustomId = new DataCustomId("rawId");

    expect(dataCustomId.getFields()).toMatchObject({});
    dataCustomId.addFields({
      param1: "value1",
      param2: "true",
    });
    expect(dataCustomId.getFields()).toMatchObject({
      param1: "value1",
      param2: "true",
    });

    dataCustomId.addFields({
      param1: "value2",
      param2: "false",
    });
    expect(dataCustomId.getFields()).toMatchObject({
      param1: "value2",
      param2: "false",
    });
  });
});

describe("removing fields", () => {
  test("removing one field", () => {
    const dataCustomId = new DataCustomId("rawId");

    expect(dataCustomId.getFields()).toMatchObject({});
    dataCustomId.addFields({
      param1: "value1",
      param2: "true",
    });
    expect(dataCustomId.getFields()).toMatchObject({
      param1: "value1",
      param2: "true",
    });

    dataCustomId.removeField("param1");
    expect(dataCustomId.getFields()).toMatchObject({
      param2: "true",
    });
  });
});

describe("copying fields from another DataCustomId", () => {
  test("copying one field", () => {
      const dataCustomId = new DataCustomId("rawId");
      dataCustomId.addField("param1", "value1");

      const dataCustomId2 = new DataCustomId("rawId2");
      dataCustomId2.copyFieldsFrom(dataCustomId);
      expect(dataCustomId2.getFields()).toMatchObject({
        param1: "value1",
      });
  });

  test("copying multiple fields and types", () => {
    const dataCustomId = new DataCustomId("rawId");
    dataCustomId.addField("param1", "value1");
    dataCustomId.addField("param2", true);

    const dataCustomId2 = new DataCustomId("rawId2");
    dataCustomId2.copyFieldsFrom(dataCustomId);
    expect(dataCustomId2.getFields()).toMatchObject({
      param1: "value1",
      param2: true,
    });
  });

  test("overwrites fields with the same name", () => {
    const dataCustomId = new DataCustomId("rawId");
    dataCustomId.addField("param1", "value1");

    const dataCustomId2 = new DataCustomId("rawId2");
    dataCustomId2.addField("param1", "value2");
    dataCustomId2.copyFieldsFrom(dataCustomId);

    expect(dataCustomId2.getFields()).toMatchObject({
      param1: "value1",
    });
  });
});

describe("getting fields", () => {
  test("getFields", () => {
    const dataCustomId = new DataCustomId("rawId");
    dataCustomId.addField("param1", "value1");
    dataCustomId.addField("param2", true);

    expect(dataCustomId.getFields()).toMatchObject({
      param1: "value1",
      param2: true,
    });
  });

  describe("getStringField", () => {
    test("with value", () => {
      const dataCustomId = new DataCustomId("rawId");
      dataCustomId.addField("param1", "value1");

      expect(dataCustomId.getStringField("param1")).toBe("value1");
    });

    test("without value", () => {
      const dataCustomId = new DataCustomId("rawId");

      expect(dataCustomId.getStringField("param1")).toBe("");
    });
  });

  describe("getStringArrayField", () => {
    test("with value", () => {
      const dataCustomId = new DataCustomId("rawId");
      dataCustomId.addField("param1", ["value1", "value2"]);

      expect(dataCustomId.getStringArrayField("param1")).toStrictEqual(["value1", "value2"]);
    });

    test("without value", () => {
      const dataCustomId = new DataCustomId("rawId");

      expect(dataCustomId.getStringArrayField("param1")).toStrictEqual([]);
    });
  });

  describe("getNumericField", () => {
    test("base10 number with value", () => {
      const dataCustomId = new DataCustomId("rawId");
      dataCustomId.addField("param1", 1);
      dataCustomId.addField("param2", "2");

      expect(dataCustomId.getNumericField("param1")).toBe(1);
      expect(dataCustomId.getNumericField("param2")).toBe(2);
    });

    test("base10 number without value", () => {
      const dataCustomId = new DataCustomId("rawId");

      expect(dataCustomId.getNumericField("param1")).toBeNaN();
    });

    test("string", () => {
      const dataCustomId = new DataCustomId("rawId")
      dataCustomId.addField("param1", "abc");

      expect(dataCustomId.getNumericField("param1")).toBeNaN();
    });

    test("base10 float with value", () => {
      const dataCustomId = new DataCustomId("rawId")
      dataCustomId.addField("param1", "123.456");

      expect(dataCustomId.getNumericField("param1", true)).toStrictEqual(123.456);
    });

    test("specified-base number", () => {
      const dataCustomId = new DataCustomId("rawId")
      dataCustomId.addField("param1", "10");

      expect(dataCustomId.getNumericField("param1", false, 2)).toStrictEqual(2);
    });

    test("specified-base float doesn't work", () => {
      const dataCustomId = new DataCustomId("rawId")
      dataCustomId.addField("param1", "10.5");

      expect(dataCustomId.getNumericField("param1", true, 2)).not.toStrictEqual(2.5);
    });

    test("without value", () => {
      const dataCustomId = new DataCustomId("rawId")

      expect(dataCustomId.getNumericField("param1", true, 2)).toBeNaN();
    });
  });

  describe("getNumericArrayField", () => {
    test("with numbers", () => {
      const dataCustomId = new DataCustomId("rawId");
      dataCustomId.addField("param1", [1, 2]);

      expect(dataCustomId.getNumericArrayField("param1")).toStrictEqual([1, 2]);
    });

    test("with string numbers", () => {
      const dataCustomId = new DataCustomId("rawId");
      dataCustomId.addField("param1", ["1", "2"]);

      expect(dataCustomId.getNumericArrayField("param1")).toStrictEqual([1, 2]);
    });

    test("with non-numbers", () => {
      const dataCustomId = new DataCustomId("rawId");
      dataCustomId.addField("param1", ["value1", "value2"]);

      expect(dataCustomId.getNumericArrayField("param1").every(val => isNaN(val))).toBe(true);
    });

    test("getNumericArrayField with numbers", () => {
      const dataCustomId = new DataCustomId("rawId");
      dataCustomId.addField("param1", [1, 2]);

      expect(dataCustomId.getNumericArrayField("param1")).toStrictEqual([1, 2]);
    });

    test("getNumericArrayField with string numbers", () => {
      const dataCustomId = new DataCustomId("rawId");
      dataCustomId.addField("param1", ["1", "2"]);

      expect(dataCustomId.getNumericArrayField("param1")).toStrictEqual([1, 2]);
    });

    test("without value", () => {
      const dataCustomId = new DataCustomId("rawId");

      expect(dataCustomId.getNumericArrayField("param1")).toStrictEqual([]);
    });
  });

  describe("getBooleanField", () => {
    test("with valid values", () => {
      const dataCustomId = new DataCustomId("rawId");
      dataCustomId.addFields({
        param1: true,
        param2: "true",
        param3: 1,
        param4: "1",
      });

      expect(dataCustomId.getBooleanField("param1")).toBe(true);
      expect(dataCustomId.getBooleanField("param2")).toBe(true);
      expect(dataCustomId.getBooleanField("param3")).toBe(true);
      expect(dataCustomId.getBooleanField("param4")).toBe(true);
    });

    test("with invalid values", () => {
      const dataCustomId = new DataCustomId("rawId");
      dataCustomId.addFields({
        param1: "false",
        param2: "abc",
        param3: 0,
      });

      expect(dataCustomId.getBooleanField("param1")).toBe(false);
      expect(dataCustomId.getBooleanField("param2")).toBe(false);
      expect(dataCustomId.getBooleanField("param3")).toBe(false);
    });

    test("without value", () => {
      const dataCustomId = new DataCustomId("rawId");

      expect(dataCustomId.getBooleanField("param1")).toBe(false);
    });
  });

  describe("toString", () => {
    test("with no fields", () => {
      const dataCustomId = new DataCustomId("rawId");

      expect(dataCustomId.toString()).toBe("rawId");
    });

    test("with simple fields", () => {
      const dataCustomId = new DataCustomId("rawId");
      dataCustomId.addFields({
        param1: "value1",
        param2: "value2",
      });

      expect(dataCustomId.toString()).toBe("rawId?param1=value1&param2=value2");
    });

    describe("compression", () => {
      test("skipFalsyValues", () => {
        const dataCustomId = new DataCustomId("rawId");
        // @ts-ignore
        dataCustomId.addFields({
          param1: false,
          param2: 0,
          param3: -0,
          // @ts-ignore
          param4: null,
          // @ts-ignore
          param5: undefined,
          param6: NaN
        });

        expect(dataCustomId.toString({
          skipFalsyValues: true,
          convertTrueToOne: false
        })).toBe("rawId");
      });

      test("convertTrueToOne", () => {
        const dataCustomId = new DataCustomId("rawId");
        dataCustomId.addFields({
          param1: true,
          param2: "true",
        })

        expect(dataCustomId.toString({
          convertTrueToOne: true
        })).toBe("rawId?param1=1&param2=1");
      });
    });

    test("throws when over 100 characters", () => {
      const dataCustomId = new DataCustomId("rawId");
      dataCustomId.addField("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")

      try {
        dataCustomId.toString();
      } catch(e: any) {
        expect(e).toBeInstanceOf(DataCustomIdLengthError)
      }
    });

    test("encodes empty fields when told to", () => {
      const dataCustomId = new DataCustomId("rawId");
      dataCustomId.addField("param1", "");

      expect(dataCustomId.toString({
        skipFalsyValues: false
      })).toBe("rawId?param1=");
    });
  });
});
