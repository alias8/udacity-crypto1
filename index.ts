import {
  binaryToUnicode,
  DEFAULT_UNICODE_LENGTH,
  getRandomKey,
  oneTimePadDecrypt,
  oneTimePadEncrypt,
  padWithSpaces,
  unicodeToBitsAsString,
  XORStrings,
} from "./utils";
import * as _ from "lodash";
import fs from "fs";
import chalk from "chalk";

interface IPrint {
  M: string;
  start: number;
  end: number;
  freq?: number;
  word: string;
  sections: number;
}

interface IWordList {
  [word: string]: boolean;
}

const allowedOneLetterWords: IWordList = {
  i: true,
  a: true,
};

// there are too many uncommon two letter words that we want to filter out
const allowedTwoLetterWords: IWordList = {
  of: true,
  is: true,
  be: true,
  to: true,
  in: true,
  it: true,
  or: true,
  us: true,
  so: true,
  ok: true,
};

const SPACER = "_";
const text = fs.readFileSync("./data/text.txt", "utf8");
const textByLine = text
  .split(/\r\n/)
  .filter(
    (word) =>
      word.length >= 3 ||
      allowedTwoLetterWords[word] ||
      allowedOneLetterWords[word]
  )
  .slice(0, 1000);

/*
 * Define lookup table that counts the number of times a suffix and prefix
 * appears in the 30,000 word list. Suffixes and prefixes are max 3 letters long.
 * This is a lookup table so we can lookup if a letter combo can be present in english
 * */
const partialWordFreq: {
  [uffix: string]: {
    freq: number;
    wordList: string[];
  };
} = {};
textByLine.forEach((word) => {
  const min = 2;
  for (let i = 0; i <= word.length - min; i++) {
    const suffix = word.slice(i);
    addToList(word, suffix);
  }

  for (let i = word.length; i >= min; i--) {
    const prefix = word.slice(0, i);
    addToList(word, prefix);
  }

  function addToList(word: string, suffix: string) {
    if (!partialWordFreq.hasOwnProperty(suffix)) {
      partialWordFreq[suffix] = {
        freq: 1,
        wordList: [word],
      };
    } else {
      const wordList = partialWordFreq[suffix].wordList;
      if (!wordList.includes(word)) {
        wordList.push(word);
        partialWordFreq[suffix] = {
          freq: partialWordFreq[suffix].freq,
          wordList,
        };
      }
    }
  }
});

/*
 * Runs one time pad decryption on known strings so you can see what happens
 * */
const crackOneTimePad = (
  C: string,
  C_Prime: string,
  wordsInMPrimeSoFar: { [word: string]: number[] }
) => {
  const C1XORC2 = XORStrings(C, C_Prime);
  let MPrimeSoFar = _.range(0, C.length / DEFAULT_UNICODE_LENGTH).map(
    (index) => SPACER
  );

  Object.entries(wordsInMPrimeSoFar).forEach(([word, startPosition]) => {
    startPosition.forEach((startPos) => {
      word.split("").forEach((letter, index) => {
        if (
          MPrimeSoFar[startPos + index] !== SPACER &&
          MPrimeSoFar[startPos + index] !== letter
        ) {
          throw Error(`trying to place word in non empty spot`);
        }
        MPrimeSoFar[startPos + index] = letter;
      });
    });
  });
  const MPrimeSoFarAsString = MPrimeSoFar.map((char) =>
    char === SPACER ? " " : char
  ).join("");
  console.log(chalk.green(`M_Prime so far: "${MPrimeSoFarAsString}"`));
  console.log(
    chalk.green(
      `      M so far: "${testPossibleM_Prime(MPrimeSoFarAsString, C1XORC2)}"`
    )
  );
  const distanceBetwenUpdates = 100;
  let rollingAverage: number[] = [];
  let previousValidCount: number = 0;
  let valid: IPrint[] = [];
  let hrStart = process.hrtime();
  let hrEnd;
  textByLine.forEach((word, wordCount) => {
    _.range(0, C.length / DEFAULT_UNICODE_LENGTH - word.length).forEach(
      (numberOfLeadingSpaces) => {
        // if all slots we are looking at are spacers
        if (
          MPrimeSoFar.slice(
            numberOfLeadingSpaces + 1,
            numberOfLeadingSpaces + 1 + word.length
          ).every((o) => o === SPACER)
        ) {
          const M_Prime = padWithSpaces(word, numberOfLeadingSpaces, C.length);
          const M = testPossibleM_Prime(M_Prime, C1XORC2);
          const start =
            numberOfLeadingSpaces - (numberOfLeadingSpaces === 0 ? 0 : 1);
          const end = numberOfLeadingSpaces + word.length + 1; // plus one for the space
          const sectionOfInterest = M.slice(start, end);
          const sections = sectionOfInterest.split(" ").filter((o) => o.length);
          // everything should satisfy the regex i.e. letters and spaces only
          if (sections.every((o) => checkValidWithLookup(o))) {
            valid.push({
              M,
              start,
              end,
              freq:
                sections.length === 1
                  ? partialWordFreq[sectionOfInterest.trim()].freq
                  : sections.reduce((acc, prev) => {
                      return acc + partialWordFreq[prev.trim()].freq;
                    }, 0),
              word,
              sections: sections.length,
            });
          }
        }
      }
    );
    if (wordCount % distanceBetwenUpdates === 0) {
      hrEnd = process.hrtime(hrStart);
      const totalSeconds = hrEnd[0] + hrEnd[1] / 10 ** 9;
      rollingAverage.push(valid.length - previousValidCount);
      if (rollingAverage.length > 10) {
        rollingAverage.shift();
      }
      const average = Math.round(_.mean(rollingAverage));
      previousValidCount = valid.length;
      console.log(
        `up to count: ${wordCount}, valid count: ${
          valid.length
        }. Rolling average: ${average} per ${distanceBetwenUpdates} words. Processing: ${Math.round(
          distanceBetwenUpdates / totalSeconds
        )} words per second`
      );
      hrStart = process.hrtime();
    }
  });

  valid = _.orderBy(
    valid,
    [(o) => o.word.length, (o) => o.freq],
    ["desc", "desc"]
  );
  const singleSection = valid.filter((o) => o.sections === 1);
  const unDefinedFreq = valid.filter((o) => o.sections !== 1);
  console.log(
    chalk.blue("Words with single section might be present in M_Prime")
  );
  singleSection.forEach((entry) => print(entry));
  console.log(
    chalk.blue(
      "\n\nWords with multiple sections might be present in M. The highlighted green section is the string in M_Prime"
    )
  );
  unDefinedFreq.forEach((entry) => print(entry));
};

const print = ({ M, start, end, freq, word }: IPrint) => {
  console.log(
    `"` +
      M.slice(0, start) +
      chalk.green(M.slice(start, end)) +
      M.slice(end) +
      `"` +
      `     from: ${start} to ${end}, freq: ${freq}, word: ${word}`
  );
};

/*
 * Function for checking result of M_Prime XOR with C1 XOR C2. PAss in M_Prime as an english string, returns english string
 * */
const testPossibleM_Prime = (M_Prime: string, C1XORC2: string) => {
  return binaryToUnicode(XORStrings(unicodeToBitsAsString(M_Prime), C1XORC2));
};

const checkValidWithLookup = (partial: string) => {
  return !!partialWordFreq[partial];
};

/*
 * Checks iSample Textf message contains all latin characters
 * */
const checkValidWithRegex = (sentence: string): boolean => {
  const regex = /[a-zA-Z\s.]+/;
  for (let i = 0; i < sentence.length; i++) {
    if (!regex.test(sentence[i])) {
      return false;
    }
  }
  return true;
};

// udacity ones
// test(C1, C2)

function myTest() {
  const k =
    "0100111100011100010011100100011000111010110001110011000111011010010110110111001001111111100011100101110110001100010100100011001111011000101010100000001101000010011100010000000000110111111010100011100110101101011000010111011100100010011001011001111110010010011011010001001011110100011010000001101111000000100100001001000110101111010001110111110101011011110111001101001101000100001001011001100110100010011001010010110110000100001110001000010110100101110001110010010101010111001111011001111100011100111000010010011001010110010100010101011001101001101011111111100101010100011000101111110100100110000011111011010010101000101110111110100100011010010101000000011001001101101011001101111001001000110111001001100101110010101011001000011100111100101010101011001001111010001111000011101001000010110000001101110010110011110000000000000010011110100100000011010";
  const M =
    "Seafood is food made from fish or other sea animals (such as shrimp and lobsters). The harvesting (collecting) of seafood";
  const M_Prime =
    "Society is often considered in terms of citizenship, rights, and ethics. The strength and unity of any society's members'";
  const M_Prime_almost =
    "Society    often considered    terms    citizenship  rights            . The          and unity                  members ";
  const C = XORStrings(unicodeToBitsAsString(M), k);
  const C_Prime = XORStrings(unicodeToBitsAsString(M_Prime), k);
  const b = testPossibleM_Prime(M_Prime_almost, XORStrings(C, C_Prime)); // see how close the output looks when we almost have it?

  /*
   * Make sure to have the keys with included spaces around them. The number
   * is the index at which the WORD starts, not any trailing spaces. Subtract
   * ones from the index if you have a preceding space.
   * */
  const wordsInMPrimeSoFar: { [word: string]: number[] } = {
    // " and unity of ": [85],
    // "society ": [0],
    // " often ": [9],
    // " and eth ": [59],
  };

  // swap out M for M prime if you're sure about some of the words in M
  const wordsInMSoFar: { [word: string]: number[] } = {
    // " made from fi": [15],
    // " harvesting ": [86],
    // " shrimp ": [59],
  };

  crackOneTimePad(C, C_Prime, wordsInMPrimeSoFar);
}

function udacityTest() {
  /*
   * Ciphertexts from udacity problem
   * */
  const C =
    "1010110010011110011111101110011001101100111010001111011101101011101000110010011000000101001110111010010111100100111101001010000011000001010001001001010000000010101001000011100100010011011011011011010111010011000101010111111110010011010111001001010101110001111101010000001011110100000000010010111001111010110000001101010010110101100010011111111011101101001011111001101111101111000100100001000111101111011011001011110011000100011111100001000101111000011101110101110010010100010111101111110011011011001101110111011101100110010100010001100011001010100110001000111100011011001000010101100001110011000000001110001011101111010100101110101000100100010111011000001111001110000011111111111110010111111000011011001010010011100011100001011001101110110001011101011101111110100001111011011000110001011111111101110110101101101001011110110010111101000111011001111";
  const C_Prime =
    "1011110110100110000001101000010111001000110010000110110001101001111101010000101000110100111010000010011001100100111001101010001001010001000011011001010100001100111011010011111100100101000001001001011001110010010100101011111010001110010010101111110001100010100001110000110001111111001000100001001010100011100100001101010101111000100001111101111110111001000101111111101011001010000100100000001011001001010000101001110101110100001111100001011101100100011000110111110001000100010111110110111010010010011101011111111001011011001010010110100100011001010110110001001000100011011001110111010010010010110100110100000111100001111101111010011000100100110011111011001010101000100000011111010010110111001100011100001111100100110010010001111010111011110110001000111101010110101001110111001110111010011111111010100111000100111001011000111101111101100111011001111";
  /*
   * Make sure to have the keys with included spaces around them. The number
   * is the index at which the WORD starts, not any trailing spaces. Subtract
   * ones from the index if you have a preceding space.
   * */
  const wordsInMPrimeSoFar: { [word: string]: number[] } = {
    // shannon: [112],
    // the: [89],
    // digit: [61],
    // time: [13],
  };
  crackOneTimePad(C, C_Prime, wordsInMPrimeSoFar);
}

myTest();
