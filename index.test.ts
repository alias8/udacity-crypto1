import {
  binaryToUnicode,
  convertDecimalToBits,
  DEFAULT_UNICODE_LENGTH,
  displayBits,
  oneTimePadDecrypt,
  oneTimePadEncrypt,
  padWithSpaces,
  unicodeToBits,
  unicodeValue,
} from "./utils";

describe("Basic strings", () => {
  test("unicodeValue function works", () => {
    expect(unicodeValue("C")).toEqual(67);
  });

  test("convertToBits works 1", () => {
    const value = unicodeValue("C");
    expect(value).toEqual(67);
    expect(convertDecimalToBits(value)).toEqual([1, 0, 0, 0, 0, 1, 1]);
  });

  test("convertDecimaltoBits pads with leading zeros", () => {
    expect(convertDecimalToBits(1)).toEqual([0, 0, 0, 0, 0, 0, 1]);
  });

  test("displayBits works", () => {
    expect(displayBits([1, 0, 0, 0, 0, 1, 1])).toEqual("1000011");
  });

  test("stringToBits works", () => {
    expect(unicodeToBits("CS")).toEqual([
      1,
      0,
      0,
      0,
      0,
      1,
      1,
      1,
      0,
      1,
      0,
      0,
      1,
      1,
    ]);
  });

  test("binaryToUnicode works", () => {
    expect(binaryToUnicode("1000011")).toEqual("C");
  });

  test("padWithSpaces works", () => {
    const word = "world";
    expect(
      padWithSpaces(word, 0, DEFAULT_UNICODE_LENGTH * word.length)
    ).toEqual("world");
    expect(
      padWithSpaces(word, 2, DEFAULT_UNICODE_LENGTH * (word.length + 2))
    ).toEqual("  world");

    expect(
      padWithSpaces(word, 1, DEFAULT_UNICODE_LENGTH * (word.length + 3))
    ).toEqual(" world  ");
  });
});

describe("oneTimePad", () => {
  const key = "11001000100110";
  const message = "CS";

  test("oneTimePadEncrypt works", () => {
    expect(oneTimePadEncrypt(message, key)).toEqual("01001111110101");
  });

  test("oneTimePadDecrypt works", () => {
    expect(oneTimePadDecrypt("01001111110101", key)).toEqual(message);
  });
});
