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
var SPACER = "_";
var text = fs_1.default.readFileSync("./data/text.txt", "utf8");
var textByLine = text.split(/\r\n/).filter(function (word) { return word.length >= 2; });
// .slice(0, 1000);
/*
 * Define lookup table that counts the number of times a suffix and prefix
 * appears in the 30,000 word list. Suffixes and prefixes are max 3 letters long.
 * */
var partialWordFreq = {};
textByLine.forEach(function (word) {
    var min = 3;
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
            if (!wordList) {
                var g = 2;
            }
            if (!wordList.includes(word)) {
                wordList.push(word);
            }
            partialWordFreq[suffix] = {
                freq: partialWordFreq[suffix].freq,
                wordList: wordList,
            };
        }
    }
});
/*
 * Runs one time pad decryption on known strings so you can see what happens
 * */
var crackOneTimePad = function (C, C_Prime, wordsInMPrimeSoFar) {
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
    var valid = [];
    ["shannon"].forEach(function (word, wordCount) {
        _.range(0, C.length / utils_1.DEFAULT_UNICODE_LENGTH).forEach(function (numberOfLeadingSpaces, index, array) {
            if (numberOfLeadingSpaces === 120) {
                var g = 2;
            }
            var tempWord = word;
            if (numberOfLeadingSpaces + tempWord.length >
                C.length / utils_1.DEFAULT_UNICODE_LENGTH) {
                // need to shorten the word being tested
                tempWord = tempWord.slice(1);
            }
            // todo: need to fix this overlap thing, make sure that words can go all the way to the end
            // about 121 loops, we should skip if insertion not possible
            var overlap = false;
            for (var i = numberOfLeadingSpaces; i < numberOfLeadingSpaces + tempWord.length; i++) {
                if (MPrimeSoFar[i] !== SPACER) {
                    overlap = true;
                    break;
                }
            }
            if (!overlap) {
                var M_Prime = utils_1.padWithSpaces(tempWord, numberOfLeadingSpaces, C.length);
                var M = testPossibleM_Prime(M_Prime, C1XORC2);
                var start = numberOfLeadingSpaces - (numberOfLeadingSpaces === 0 ? 0 : 1);
                var end = numberOfLeadingSpaces + tempWord.length + 1; // plus one for the space
                var sectionOfInterest = M.slice(start, end);
                var sections = sectionOfInterest.split(" ").filter(function (o) { return o.length; });
                if (sections.every(function (o) { return checkValidWithRegex(o); })) {
                    // everything should satisfy the regex
                    if (sections.some(function (o) { return checkValidWithLookup(o); })) {
                        // some satisfy lookup is ok
                        valid.push({
                            M: M,
                            start: start,
                            end: end,
                            freq: sections.length === 1
                                ? partialWordFreq[sectionOfInterest.trim()].freq
                                : undefined,
                            word: tempWord,
                        });
                    }
                }
            }
        });
        if (wordCount % 100 === 0) {
            console.log("up to count: " + wordCount + ", valid count: " + valid.length);
        }
    });
    valid = _.orderBy(valid, [function (o) { return o.word.length; }, function (o) { return o.freq; }], ["desc", "desc"]);
    var definedFreq = valid.filter(function (o) { return o.freq; });
    var unDefinedFreq = valid.filter(function (o) { return !o.freq; });
    chalk_1.default.blue("Words with defined freq might be present in M_Prime");
    definedFreq.forEach(function (entry) { return print(entry); });
    chalk_1.default.blue("\n\nWords with undefined freq might be present in M. The highlighted green section is the string in M_Prime");
    unDefinedFreq.forEach(function (entry) { return print(entry); });
};
var print = function (_a) {
    var M = _a.M, start = _a.start, end = _a.end, freq = _a.freq, word = _a.word;
    console.log("\"" +
        M.slice(0, start) +
        chalk_1.default.green(M.slice(start, end)) +
        M.slice(end) +
        "\"" +
        ("              from: " + start + " to " + end + ", freq: " + freq + ", word: " + word));
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
    var M = "Creates an array of elements, sorted in ascending order by the results of running each element in a collection thru each ";
    var M_Prime = "Gets the size of collection by returning its length for array-like values or the number of own enumerable string keyed pr";
    var M_Prime_almost = "     the size    collection by           its length for array-like           the        of own enumerable                ";
    var C = "1100100011010111011000000101100010100011101111101001000100011001111000100111010001100001110100101110110101110101000100111000110011101010101001101011100001110000100111001100101110001100010011010000110000100101010110001001100011000111101101101011000111010110011101110110010111010100101010111101010011011110110011010100100010011011101010011011001111011000101000111111111111011101010111001011100101100111100000000010101011001001001000011101010111010111000011001110101011111001111100110000001111001100100011101110101011010101110001100000101110110010000110110001011110011010111000011101001100111010011101011010010011001101011000100111111001110100000010011101101101011101110001010000001011001011110101101001010100001001010110101110101111110111001001010001010011100111110001111010101000110110000100010001011100011001110011001011100011101111011110000111010";
    var C_Prime = "1100000010001011111010010111001000100111111100110101010010011011100101000011110111010011001001100110101001101010000100111011110010100110011001111001101000110011100001011101001110001000100110000011010111110011001100010000010111101001101101100011000010111111101101110110010110010011001010011011110001100111101001001000101010011101101010011011001010001000100111101101111110011111110111001011100101100001101011101011101110011011000100111111001111001100000100001011000001010000010100011010010000100110000001001100000011010101001011100111001001110100100110111001110000010101110110010101001111111010010101101100110110001000011001000111000000011100101010101111110111011101110010010000001110011111101100101100011100101010110111011110101111110110001010010010110100110100011001100100110100100101100000010111001110011100010111001011100110001110111000001101000";
    var b = testPossibleM_Prime(M_Prime_almost, utils_1.XORStrings(C, C_Prime)); // see how close the output looks when we almost have it
    /*
     * Make sure to have the keys with included spaces around them. The number
     * is the index at which the WORD starts, not any trailing spaces. Subtract
     * ones from the index if you have a preceding space.
     * */
    var wordsInMPrimeSoFar = {
        " collection by ": [16],
        " length ": [44],
        " number ": [80],
        "like valu": [62],
        "gets the ": [0],
        " erable string ": [98],
        " the ": [76],
        " returning its": [30],
    };
    crackOneTimePad(C, C_Prime, wordsInMPrimeSoFar);
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
    // shannon: [112],
    };
    crackOneTimePad(C, C_Prime, wordsInMPrimeSoFar);
}
udacityTest();
//# sourceMappingURL=index.js.map