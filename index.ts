import * as _ from "lodash";

export const convertToBits = (
  decimal: number,
  padding: number = 7
): number[] => {
  return _.padStart(decimal.toString(2))
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
  if (binary.length % 7 !== 0) {
    throw Error(
      `This might not a correctly padding unicode binary string. Received: ${binary}`
    );
  }
  let processedString = binary;
  let words = "";
  while (processedString.length > 0) {
    const letter = processedString.slice(0, 7);
    processedString = processedString.slice(7);
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

export const displayBits = (array: number[]): string => {
  return array.join("");
};

export const stringToBits = (chars: string): number[] => {
  return chars.split("").reduce((prev, curr) => {
    return [...prev, ...convertToBits(unicodeValue(curr))];
  }, [] as number[]);
};

export const oneTimePadEncypt = (message: string, key: string): string => {
  if (message.length !== key.length) {
    throw Error(
      `message and key must be the same length, message length: ${message.length}, key length: ${key.length}`
    );
  }
  if (
    (message.charAt(0) !== "0" && message.charAt(0) !== "1") ||
    (key.charAt(0) !== "0" && key.charAt(0) !== "1")
  ) {
    throw Error(
      `message and key must be a string of 0's and 1's. Message ${message}, key: ${key}`
    );
  }
  return message.split("").reduce((prev, curr, index) => {
    return prev + (parseInt(curr, 2) ^ parseInt(key[index], 2));
  }, "");
};

export const oneTimePadDecrypt = (cipherText: string, key: string): string => {
  if (cipherText.length !== key.length) {
    throw Error(
      `Ciphertext and key must be the same length,ciphertext length: ${cipherText.length}, key length: ${key.length}`
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
  return cipherText.split("").reduce((prev, curr, index) => {
    return prev + (parseInt(curr, 2) ^ parseInt(key[index], 2));
  }, "");
};

const key = "11001000100110";
const message = "CS";
const cipherText = oneTimePadEncypt(displayBits(stringToBits(message)), key);
const decrypted = oneTimePadDecrypt(cipherText, key);
const tt = binaryToUnicode(decrypted);
const b = 2;
