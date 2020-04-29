import {
  binaryToUnicode,
  convertToBits,
  displayBits,
  oneTimePadDecrypt,
  oneTimePadEncypt,
  stringToBits,
  unicodeValue,
} from "./index";

describe("Basic strings", () => {
  test("unicodeValue function works", () => {
    expect(unicodeValue("C")).toEqual(67);
  });

  test("convertToBits works", () => {
    expect(convertToBits(unicodeValue("C"))).toEqual([1, 0, 0, 0, 0, 1, 1]);
  });

  test("displayBits works", () => {
    expect(displayBits(convertToBits(unicodeValue("C")))).toEqual("1000011");
  });

  test("stringToBits works", () => {
    expect(stringToBits("CS")).toEqual([
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
});

describe("oneTimePad", () => {
  const key = "11001000100110";
  const message = "CS";
  const cipherText = oneTimePadEncypt(displayBits(stringToBits(message)), key);
  const decrypted = oneTimePadDecrypt(cipherText, key);

  test("oneTimePadEncrypt works", () => {
    expect(oneTimePadEncypt(displayBits(stringToBits(message)), key)).toEqual(
      cipherText
    );
  });

  test("oneTimePadDecrypt works", () => {
    expect(binaryToUnicode(decrypted)).toEqual(message);
  });
});
