"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
var _ = __importStar(require("lodash"));
var fs_1 = __importDefault(require("fs"));
var chalk_1 = __importDefault(require("chalk"));
var allowedOneLetterWords = {
    i: true,
    a: true,
};
// there are too many uncommon two letter words that we want to filter out
var allowedTwoLetterWords = {
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
var SPACER = "_";
var text = fs_1.default.readFileSync("./data/text.txt", "utf8");
var textByLine = text
    .split(/\r\n/)
    .filter(function (word) {
    return word.length >= 3 ||
        allowedTwoLetterWords[word] ||
        allowedOneLetterWords[word];
})
    .slice(0);
/*
 * Define lookup table that counts the number of times a suffix and prefix
 * appears in the 30,000 word list. Suffixes and prefixes are max 3 letters long.
 * This is a lookup table so we can lookup if a letter combo can be present in english
 * */
var partialWordFreq = {};
textByLine.forEach(function (word) {
    var min = 2;
    for (var i = 0; i <= word.length - min; i++) {
        var suffix = word.slice(i);
        addToList(word, suffix);
    }
    for (var i = word.length; i >= min; i--) {
        var prefix = word.slice(0, i);
        addToList(word, prefix);
    }
    function addToList(word, suffix) {
        if (!partialWordFreq.hasOwnProperty(suffix)) {
            partialWordFreq[suffix] = {
                freq: 1,
                wordList: [word],
            };
        }
        else {
            var wordList = partialWordFreq[suffix].wordList;
            if (!wordList.includes(word)) {
                wordList.push(word);
                partialWordFreq[suffix] = {
                    freq: partialWordFreq[suffix].freq,
                    wordList: wordList,
                };
            }
        }
    }
});
/*
 * Runs one time pad decryption on known strings so you can see what happens
 * */
var crackOneTimePad = function (_a) {
    var C = _a.C, C_Prime = _a.C_Prime, wordsInMPrimeSoFar = _a.wordsInMPrimeSoFar, realM_Prime = _a.realM_Prime;
    var C1XORC2 = utils_1.XORStrings(C, C_Prime);
    var MPrimeSoFar = _.range(0, C.length / utils_1.DEFAULT_UNICODE_LENGTH).map(function (index) { return SPACER; });
    Object.entries(wordsInMPrimeSoFar).forEach(function (_a) {
        var word = _a[0], startPosition = _a[1];
        startPosition.forEach(function (startPos) {
            word.split("").forEach(function (letter, index) {
                if (MPrimeSoFar[startPos + index] !== SPACER &&
                    MPrimeSoFar[startPos + index] !== letter) {
                    throw Error("trying to place word in non empty spot");
                }
                MPrimeSoFar[startPos + index] = letter;
            });
        });
    });
    var MPrimeSoFarAsString = MPrimeSoFar.map(function (char) {
        return char === SPACER ? " " : char;
    }).join("");
    console.log(chalk_1.default.green("M_Prime so far: \"" + MPrimeSoFarAsString + "\""));
    console.log(chalk_1.default.green("      M so far: \"" + testPossibleM_Prime(MPrimeSoFarAsString, C1XORC2) + "\""));
    var distanceBetweenUpdates = 100;
    var rollingAverage = [];
    var previousValidCount = 0;
    var valid = [];
    var hrStart = process.hrtime();
    var hrEnd;
    textByLine.forEach(function (word, wordCount) {
        _.range(0, C.length / utils_1.DEFAULT_UNICODE_LENGTH - word.length).forEach(function (numberOfLeadingSpaces) {
            if (word === "producing") {
                var t = 2;
            }
            // if all slots we are looking at are spacers
            if (MPrimeSoFar.slice(numberOfLeadingSpaces + 1, numberOfLeadingSpaces + 1 + word.length).every(function (o) { return o === SPACER; })) {
                var M_Prime = utils_1.padWithSpaces(word, numberOfLeadingSpaces, C.length);
                var M = testPossibleM_Prime(M_Prime, C1XORC2);
                var start = numberOfLeadingSpaces - (numberOfLeadingSpaces === 0 ? 0 : 1);
                var end = numberOfLeadingSpaces + word.length + 1; // plus one for the space
                var sectionOfInterest = M.slice(start, end);
                var sections = sectionOfInterest.split(" ").filter(function (o) { return o.length; });
                // everything should satisfy the regex i.e. letters and spaces only
                if (sections.every(function (o) { return checkValidWithLookup(o); })) {
                    valid.push({
                        realM_Prime: realM_Prime,
                        M: M,
                        start: start,
                        end: end,
                        freq: sections.length === 1
                            ? partialWordFreq[sectionOfInterest.trim()].freq
                            : sections.reduce(function (acc, prev) {
                                return acc + partialWordFreq[prev.trim()].freq;
                            }, 0),
                        word: word,
                        sections: sections.length,
                    });
                }
            }
        });
        // if (wordCount % distanceBetweenUpdates === 0) {
        //   hrEnd = process.hrtime(hrStart);
        //   const totalSeconds = hrEnd[0] + hrEnd[1] / 10 ** 9;
        //   rollingAverage.push(valid.length - previousValidCount);
        //   if (rollingAverage.length > 10) {
        //     rollingAverage.shift();
        //   }
        //   const average = Math.round(_.mean(rollingAverage));
        //   previousValidCount = valid.length;
        //   console.log(
        //     `up to count: ${wordCount}, valid count: ${
        //       valid.length
        //     }. Rolling average: ${average} per ${distanceBetweenUpdates} words. Processing: ${Math.round(
        //       distanceBetweenUpdates / totalSeconds
        //     )} words per second`
        //   );
        //   hrStart = process.hrtime();
        // }
    });
    valid = _.orderBy(valid, [function (o) { return o.word.length; }, function (o) { return o.freq; }], ["desc", "desc"]);
    var singleSection = valid.filter(function (o) { return o.sections === 1; });
    var unDefinedFreq = valid.filter(function (o) { return o.sections !== 1; });
    console.log(chalk_1.default.blue("Words with single section might be present in M_Prime"));
    singleSection.forEach(function (entry) { return print(entry); });
    console.log(chalk_1.default.blue("\n\nWords with multiple sections might be present in M. The highlighted green section is the string in M_Prime"));
    unDefinedFreq.forEach(function (entry) { return print(entry); });
};
var print = function (_a) {
    var M = _a.M, start = _a.start, end = _a.end, freq = _a.freq, word = _a.word, realM_Prime = _a.realM_Prime;
    console.log("predicted M_Prime: " +
        "\"" +
        M.slice(0, start) +
        chalk_1.default.green(M.slice(start, end)) +
        M.slice(end) +
        "\"" +
        ("     from: " + start + " to " + end + ", freq: " + freq + ", word: " + word));
    if (realM_Prime) {
        console.log("real M_prime:      " +
            "\"" +
            realM_Prime.slice(0, start) +
            chalk_1.default.green(realM_Prime.slice(start, end)) +
            realM_Prime.slice(end) +
            "\"");
    }
    console.log("\n");
};
/*
 * Function for checking result of M_Prime XOR with C1 XOR C2. PAss in M_Prime as an english string, returns english string
 * */
var testPossibleM_Prime = function (M_Prime, C1XORC2) {
    return utils_1.binaryToUnicode(utils_1.XORStrings(utils_1.unicodeToBitsAsString(M_Prime), C1XORC2));
};
var checkValidWithLookup = function (partial) {
    return !!partialWordFreq[partial];
};
/*
 * Checks iSample Textf message contains all latin characters
 * */
var checkValidWithRegex = function (sentence) {
    var regex = /[a-zA-Z\s.]+/;
    for (var i = 0; i < sentence.length; i++) {
        if (!regex.test(sentence[i])) {
            return false;
        }
    }
    return true;
};
// udacity ones
// test(C1, C2)
function myTest() {
    var k = "0100111100011100010011100100011000111010110001110011000111011010010110110111001001111111100011100101110110001100010100100011001111011000101010100000001101000010011100010000000000110111111010100011100110101101011000010111011100100010011001011001111110010010011011010001001011110100011010000001101111000000100100001001000110101111010001110111110101011011110111001101001101000100001001011001100110100010011001010010110110000100001110001000010110100101110001110010010101010111001111011001111100011100111000010010011001010110010100010101011001101001101011111111100101010100011000101111110100100110000011111011010010101000101110111110100100011010010101000000011001001101101011001101111001001000110111001001100101110010101011001000011100111100101010101011001001111010001111000011101001000010110000001101110010110011110000000000000010011110100100000011010";
    var M_Prime = "Society is often considered in terms of citizenship, rights, and ethics. The strength and unity of any society's members'";
    var M = "Seafood is food made from fish or other sea animals (such as shrimp and lobsters). The harvesting (collecting) of seafood";
    var M_Prime_almost = "Society    often considered    terms    citizenship  rights              The          and unity                  members ";
    var M_Prime_almost1 = "                 considered                                                                                              ";
    var C = utils_1.XORStrings(utils_1.unicodeToBitsAsString(M), k);
    var C_Prime = utils_1.XORStrings(utils_1.unicodeToBitsAsString(M_Prime), k);
    var b = testPossibleM_Prime(M_Prime_almost1, utils_1.XORStrings(C, C_Prime)); // see how close the output looks when we almost have it?
    /*
     * Make sure to have the keys with included spaces around them. The number
     * is the index at which the WORD starts, not any trailing spaces. Subtract
     * one from the index if you have a preceding space.
     * */
    var wordsInMPrimeSoFar = {
        " and unity of ": [85],
        "society ": [0],
        " often ": [9],
        " and eth ": [59],
    };
    // swap out M for M prime if you're sure about some of the words in M
    var wordsInMSoFar = {
        " made from fi": [15],
        " harvesting ": [86],
        " shrimp ": [59],
    };
    crackOneTimePad({ C: C, C_Prime: C_Prime, wordsInMPrimeSoFar: wordsInMPrimeSoFar, realM_Prime: M_Prime });
}
function udacityTest() {
    /*
     * Ciphertexts from udacity problem
     * */
    var C = "1010110010011110011111101110011001101100111010001111011101101011101000110010011000000101001110111010010111100100111101001010000011000001010001001001010000000010101001000011100100010011011011011011010111010011000101010111111110010011010111001001010101110001111101010000001011110100000000010010111001111010110000001101010010110101100010011111111011101101001011111001101111101111000100100001000111101111011011001011110011000100011111100001000101111000011101110101110010010100010111101111110011011011001101110111011101100110010100010001100011001010100110001000111100011011001000010101100001110011000000001110001011101111010100101110101000100100010111011000001111001110000011111111111110010111111000011011001010010011100011100001011001101110110001011101011101111110100001111011011000110001011111111101110110101101101001011110110010111101000111011001111";
    var C_Prime = "1011110110100110000001101000010111001000110010000110110001101001111101010000101000110100111010000010011001100100111001101010001001010001000011011001010100001100111011010011111100100101000001001001011001110010010100101011111010001110010010101111110001100010100001110000110001111111001000100001001010100011100100001101010101111000100001111101111110111001000101111111101011001010000100100000001011001001010000101001110101110100001111100001011101100100011000110111110001000100010111110110111010010010011101011111111001011011001010010110100100011001010110110001001000100011011001110111010010010010110100110100000111100001111101111010011000100100110011111011001010101000100000011111010010110111001100011100001111100100110010010001111010111011110110001000111101010110101001110111001110111010011111111010100111000100111001011000111101111101100111011001111";
    /*
     * Make sure to have the keys with included spaces around them. The number
     * is the index at which the WORD starts, not any trailing spaces. Subtract
     * ones from the index if you have a preceding space.
     * */
    var wordsInMPrimeSoFar = {
        "i visualize a time when we will be to robots what dogs are to humans, and i'm rooting for the machines.  (Claude Shannon)": [
            0,
        ],
    };
    crackOneTimePad({ C: C, C_Prime: C_Prime, wordsInMPrimeSoFar: wordsInMPrimeSoFar });
}
udacityTest();
//# sourceMappingURL=index.js.map