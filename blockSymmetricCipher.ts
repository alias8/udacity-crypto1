import * as _ from "lodash";

export class BlockSymmetricCipher {
  static DEFAULT_UNICODE_LENGTH = 8;
  static BLOCK_SIZE = 128;
  static PADDING_CHARACTER = String.fromCharCode(128);

  private padToBlockSize = (unicodeBinaryString: string) => {
    return _.padEnd(
      unicodeBinaryString,
      BlockSymmetricCipher.BLOCK_SIZE *
        Math.ceil(unicodeBinaryString.length / BlockSymmetricCipher.BLOCK_SIZE),
      BlockSymmetricCipher.PADDING_CHARACTER
    );
  };
  /*
   * Turn a decimal number into an array of 1's and 0's
   * */
  private convertDecimalToBits = (
    decimal: number,
    padding: number = BlockSymmetricCipher.DEFAULT_UNICODE_LENGTH
  ): number[] => {
    return _.padStart(decimal.toString(2), padding, "0")
      .split("")
      .map((entry) => (entry === "1" ? 1 : 0));
  };
  /*
   * Returns a unicode string of letters given a string of binary input
   * */
  private binaryToUnicode = (binary: string): string => {
    if (binary.charAt(0) !== "0" && binary.charAt(0) !== "1") {
      throw Error(`Pass in a string of 1's and 0's. Received: ${binary}`);
    }
    if (binary.length % BlockSymmetricCipher.DEFAULT_UNICODE_LENGTH !== 0) {
      throw Error(
        `This might not a correctly padding unicode binary string. Received: ${binary}`
      );
    }
    let processedString = binary;
    let words = "";
    while (processedString.length > 0) {
      const letter = processedString.slice(
        0,
        BlockSymmetricCipher.DEFAULT_UNICODE_LENGTH
      );
      processedString = processedString.slice(
        BlockSymmetricCipher.DEFAULT_UNICODE_LENGTH
      );
      words += String.fromCharCode(parseInt(letter, 2));
    }
    return words;
  };
  private unicodeValue = (char: string) => {
    if (char.length !== 1) {
      throw Error("char must be length 1");
    }
    return char.charCodeAt(0);
  };
  /*
   * Turn an array of 1's and 0's into a string of 1's and 0's
   * */
  private displayBits = (array: number[]): string => {
    return array.join("");
  };
  /*
   * Turn an english string into an array of 1's and 0's
   * */
  private unicodeToBits = (chars: string): number[] => {
    return chars.split("").reduce((prev, curr) => {
      return [...prev, ...this.convertDecimalToBits(this.unicodeValue(curr))];
    }, [] as number[]);
  };

  /*
   * Takes an english (unicode) string as input, gives back the binary representation
   * */
  private unicodeToBitsAsString = (englishLetters: string): string => {
    return this.padToBlockSize(
      this.displayBits(this.unicodeToBits(englishLetters))
    );
  };
  /*
   * Takes message as an English sentence
   * */
  public oneTimePadEncrypt = (message: string, key: string): string => {
    if (key.charAt(0) !== "0" && key.charAt(0) !== "1") {
      throw Error(`key must be a string of 0's and 1's. Received: ${key}`);
    }
    const messageUnicodeString = this.unicodeToBitsAsString(message); // convert to binary string
    return messageUnicodeString.split("").reduce((prev, curr, index) => {
      return (
        prev +
        (parseInt(curr, 2) ^
          parseInt(key[index % BlockSymmetricCipher.BLOCK_SIZE], 2))
      );
    }, "");
  };

  public oneTimePadDecrypt = (cipherText: string, key: string): string => {
    if (
      (cipherText.charAt(0) !== "0" && cipherText.charAt(0) !== "1") ||
      (key.charAt(0) !== "0" && key.charAt(0) !== "1")
    ) {
      throw Error(
        `Ciphertext and key must be a string of 0's and 1's. Ciphertext ${cipherText}, key: ${key}`
      );
    }
    return this.binaryToUnicode(
      cipherText.split("").reduce((prev, curr, index) => {
        return (
          prev +
          (parseInt(curr, 2) ^
            parseInt(key[index % BlockSymmetricCipher.BLOCK_SIZE], 2))
        );
      }, "")
    ).trim();
  };

  /*
   * XOR two strings of 1's and 0's together
   * */
  public XORStrings = (a: string, b: string) => {
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

  public getRandomKey = (size: number = BlockSymmetricCipher.BLOCK_SIZE) => {
    return _.range(0, size)
      .map((index) => Math.round(Math.random()).toString())
      .join("");
  };
  private padWithSpaces = (
    chars: string,
    leadingSpaces: number,
    totalBitSize: number
  ) => {
    if (totalBitSize % BlockSymmetricCipher.DEFAULT_UNICODE_LENGTH !== 0) {
      throw Error(
        `please use a total bit size that is a multiple of ${BlockSymmetricCipher.DEFAULT_UNICODE_LENGTH}. Received: ${totalBitSize}`
      );
    }
    const totalChars =
      totalBitSize / BlockSymmetricCipher.DEFAULT_UNICODE_LENGTH;

    const withLeadingSpaces = _.padStart(
      chars,
      chars.length + leadingSpaces,
      " "
    );
    return _.padEnd(withLeadingSpaces, totalChars, " ");
  };
}

const crypto = new BlockSymmetricCipher();

const m =
  "hello world how are you today the quick brown fox jumps over the lazy dog";
const key = crypto.getRandomKey();
const tt = crypto.oneTimePadEncrypt(m, key);
const gg = crypto.oneTimePadDecrypt(tt, key);
const bb = 2;
