import * as _ from "lodash";

export const DEFAULT_UNICODE_LENGTH = 7;
/*
 * Turn a decimal number into an array of 1's and 0's
 * */
export const convertDecimalToBits = (
  decimal: number,
  padding: number = DEFAULT_UNICODE_LENGTH
): number[] => {
  return _.padStart(decimal.toString(2), padding, "0")
    .split("")
    .map((entry) => (entry === "1" ? 1 : 0));
};
/*
 * Returns a unicode string of letters given a string of binary input
 * */
export const binaryToUnicode = (binary: string): string => {
  if (binary.charAt(0) !== "0" && binary.charAt(0) !== "1") {
    throw Error(`Pass in a string of 1's and 0's. Received: ${binary}`);
  }
  if (binary.length % DEFAULT_UNICODE_LENGTH !== 0) {
    throw Error(
      `This might not a correctly padding unicode binary string. Received: ${binary}`
    );
  }
  let processedString = binary;
  let words = "";
  while (processedString.length > 0) {
    const letter = processedString.slice(0, DEFAULT_UNICODE_LENGTH);
    processedString = processedString.slice(DEFAULT_UNICODE_LENGTH);
    words += String.fromCharCode(parseInt(letter, 2));
  }
  return words;
};
export const unicodeValue = (char: string) => {
  if (char.length !== 1) {
    throw Error("char must be length 1");
  }
  return char.charCodeAt(0);
};
/*
 * Turn an array of 1's and 0's into a string of 1's and 0's
 * */
export const displayBits = (array: number[]): string => {
  return array.join("");
};
/*
 * Turn a string into an array of 1's and 0's
 * */
export const unicodeToBits = (chars: string): number[] => {
  return chars.split("").reduce((prev, curr) => {
    return [...prev, ...convertDecimalToBits(unicodeValue(curr))];
  }, [] as number[]);
};

/*
 * Takes an english (unicode) string as input, gives back the binary representation
 * */
export const unicodeToBitsAsString = (englishLetters: string): string => {
  return displayBits(unicodeToBits(englishLetters));
};
/*
 * Takes message as an English sentence
 * */
export const oneTimePadEncrypt = (message: string, key: string): string => {
  if (key.length < message.length * DEFAULT_UNICODE_LENGTH) {
    throw Error(`Key too small for one time pad`);
  }
  if (key.charAt(0) !== "0" && key.charAt(0) !== "1") {
    throw Error(`key must be a string of 0's and 1's. Received: ${key}`);
  }
  message = unicodeToBitsAsString(padWithSpaces(message, 0, key.length)); // convert to binary string
  return message.split("").reduce((prev, curr, index) => {
    return prev + (parseInt(curr, 2) ^ parseInt(key[index], 2));
  }, "");
};
export const oneTimePadDecrypt = (cipherText: string, key: string): string => {
  if (cipherText.length !== key.length) {
    throw Error(
      `Ciphertext and key must be the same length, ciphertext length: ${cipherText.length}, key length: ${key.length}`
    );
  }
  if (
    (cipherText.charAt(0) !== "0" && cipherText.charAt(0) !== "1") ||
    (key.charAt(0) !== "0" && key.charAt(0) !== "1")
  ) {
    throw Error(
      `Ciphertext and key must be a string of 0's and 1's. Ciphertext ${cipherText}, key: ${key}`
    );
  }
  return binaryToUnicode(
    cipherText.split("").reduce((prev, curr, index) => {
      return prev + (parseInt(curr, 2) ^ parseInt(key[index], 2));
    }, "")
  );
};

/*
 * XOR two strings of 1's and 0's together
 * */
export const XORStrings = (a: string, b: string) => {
  if (a.length !== b.length) {
    throw Error(`Strings to XOR must be of the same length`);
  }
  if (
    (a.charAt(0) !== "0" && a.charAt(0) !== "1") ||
    (b.charAt(0) !== "0" && b.charAt(0) !== "1")
  ) {
    throw Error(`key must be a string of 0's and 1's. Received: ${a}, ${b}`);
  }
  return a.split("").reduce((prev, curr, index) => {
    return prev + (parseInt(curr, 2) ^ parseInt(b[index], 2));
  }, "");
};

const getRandomKey = (size: number) => {
  return _.range(0, size)
    .map((index) => Math.round(Math.random()).toString())
    .join("");
};
export const padWithSpaces = (
  chars: string,
  leadingSpaces: number,
  totalBitSize: number
) => {
  if (totalBitSize % DEFAULT_UNICODE_LENGTH !== 0) {
    throw Error(
      `please use a total bit size that is a multiple of ${DEFAULT_UNICODE_LENGTH}. Received: ${totalBitSize}`
    );
  }
  const totalChars = totalBitSize / DEFAULT_UNICODE_LENGTH;

  const withLeadingSpaces = _.padStart(
    chars,
    chars.length + leadingSpaces,
    " "
  );
  return _.padEnd(withLeadingSpaces, totalChars, " ");
};
