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
var C1 = "1010110010011110011111101110011001101100111010001111011101101011101000110010011000000101001110111010010111100100111101001010000011000001010001001001010000000010101001000011100100010011011011011011010111010011000101010111111110010011010111001001010101110001111101010000001011110100000000010010111001111010110000001101010010110101100010011111111011101101001011111001101111101111000100100001000111101111011011001011110011000100011111100001000101111000011101110101110010010100010111101111110011011011001101110111011101100110010100010001100011001010100110001000111100011011001000010101100001110011000000001110001011101111010100101110101000100100010111011000001111001110000011111111111110010111111000011011001010010011100011100001011001101110110001011101011101111110100001111011011000110001011111111101110110101101101001011110110010111101000111011001111";
var C2 = "1011110110100110000001101000010111001000110010000110110001101001111101010000101000110100111010000010011001100100111001101010001001010001000011011001010100001100111011010011111100100101000001001001011001110010010100101011111010001110010010101111110001100010100001110000110001111111001000100001001010100011100100001101010101111000100001111101111110111001000101111111101011001010000100100000001011001001010000101001110101110100001111100001011101100100011000110111110001000100010111110110111010010010011101011111111001011011001010010110100100011001010110110001001000100011011001110111010010010010110100110100000111100001111101111010011000100100110011111011001010101000100000011111010010110111001100011100001111100100110010010001111010111011110110001000111101010110101001110111001110111010011111111010100111000100111001011000111101111101100111011001111";
var text = fs_1.default.readFileSync("./data/text.txt", "utf8");
var textByLine = text.split(/\r\n/).filter(function (word) { return word.length >= 4; });
var cc = 2;
var partialWordSearch = {};
textByLine.forEach(function (word) {
    if (word === "product") {
        var e = 2;
    }
    var g = 2;
    for (var i = 0; i < word.length; i++) {
        var prefix = word.slice(i);
        if (prefix.length >= 3) {
            partialWordSearch[prefix] = word;
        }
    }
    var t = 2;
});
/*
 * Runs one time pad decryption on known strings so you can see what happens
 * */
var test1 = function () {
    var key = "0100100000011100110111101101101000011100110010000100000011100111111101111111100110100010100110001010110101111100010010000010011110001010100110110111011011100010011000001000010110010010001010100101101010011011100011101101000000010010111011001111101101100101010010101111101101001110111010011010010000111110111010111101001110001000110011111111100010001110100100001101100111000010111011000001101001101011011011100100011001110110000010110001110111001001011101011010111011100101000100100001110000001110011001010110010011100000101010101110100011100001001101010100110010010010111110001100111000001101010101010111111010001111000110110011101001001101101110010001011110100000011110111110001101000001000100101100111001001000100100111001100000011100011001100010100011100110010001111011011011011101111100100011001111110101110101000101100011010001011010010110010";
    // change this value. When "M" comes out as something like an english sentence, hardcode those values into your guess for M2
    var C1 = "1010110010011110011111101110011001101100111010001111011101101011101000110010011000000101001110111010010111100100111101001010000011000001010001001001010000000010101001000011100100010011011011011011010111010011000101010111111110010011010111001001010101110001111101010000001011110100000000010010111001111010110000001101010010110101100010011111111011101101001011111001101111101111000100100001000111101111011011001011110011000100011111100001000101111000011101110101110010010100010111101111110011011011001101110111011101100110010100010001100011001010100110001000111100011011001000010101100001110011000000001110001011101111010100101110101000100100010111011000001111001110000011111111111110010111111000011011001010010011100011100001011001101110110001011101011101111110100001111011011000110001011111111101110110101101101001011110110010111101000111011001111";
    var C2 = "1011110110100110000001101000010111001000110010000110110001101001111101010000101000110100111010000010011001100100111001101010001001010001000011011001010100001100111011010011111100100101000001001001011001110010010100101011111010001110010010101111110001100010100001110000110001111111001000100001001010100011100100001101010101111000100001111101111110111001000101111111101011001010000100100000001011001001010000101001110101110100001111100001011101100100011000110111110001000100010111110110111010010010011101011111111001011011001010010110100100011001010110110001001000100011011001110111010010010010110100110100000111100001111101111010011000100100110011111011001010101000100000011111010010110111001100011100001111100100110010010001111010111011110110001000111101010110101001110111001110111010011111111010100111000100111001011000111101111101100111011001111";
    var C1XORC2 = utils_1.XORStrings(C1, C2);
    var messageSoFar = _.range(0, key.length / utils_1.DEFAULT_UNICODE_LENGTH).map(function (index) { return " "; });
    var words = {
        the: [89],
    };
    Object.entries(words).forEach(function (_a) {
        var key = _a[0], value = _a[1];
        value.forEach(function (startPos) {
            key.split("").forEach(function (letter, index) {
                if (messageSoFar[startPos + index] !== " ") {
                    throw Error("trying to place word in non empty spot");
                }
                messageSoFar[startPos + index] = letter;
            });
        });
    });
    console.log(chalk_1.default.green("Message so far: \"" + messageSoFar.join("") + "\""));
    var wordsToCheck = ["and"];
    textByLine.forEach(function (word) {
        console.log("\n M_Prime: \"" + word + "\"");
        _.range(0, key.length / utils_1.DEFAULT_UNICODE_LENGTH - word.length).forEach(function (numberOfLeadingSpaces) {
            // about 121 loops
            if (messageSoFar[numberOfLeadingSpaces] === " ") {
                // only try to insert if nothing already
                if (numberOfLeadingSpaces + word.length >
                    key.length / utils_1.DEFAULT_UNICODE_LENGTH) {
                    // need to shorten the word being tested
                    word = word.slice(1);
                }
                var M_Prime = utils_1.padWithSpaces(word, numberOfLeadingSpaces, key.length);
                var M = testPossibleM_Prime(M_Prime, C1XORC2);
                var start = numberOfLeadingSpaces - (numberOfLeadingSpaces === 0 ? 0 : 1);
                var end = numberOfLeadingSpaces + word.length + 1; // plus one for the space
                var sectionOfInterest = M.slice(start, end);
                if (word === "what" && start === 44) {
                    var r = 2;
                }
                if (checkValidWithLookup(sectionOfInterest.trim())) {
                    console.log(M.slice(0, start) +
                        chalk_1.default.green(M.slice(start, end)) +
                        M.slice(end) +
                        ("              from: " + start + " to " + end));
                }
            }
        });
    });
    var b = 2;
};
/*
 * Runs one time pad decryption on known strings so you can see what happens
 * */
var test = function () {
    var key = "0100100000011100110111101101101000011100110010000100000011100111111101111111100110100010100110001010110101111100010010000010011110001010100110110111011011100010011000001000010110010010001010100101101010011011100011101101000000010010111011001111101101100101010010101111101101001110111010011010010000111110111010111101001110001000110011111111100010001110100100001101100111000010111011000001101001101011011011100100011001110110000010110001110111001001011101011010111011100101000100100001110000001110011001010110010011100000101010101110100011100001001101010100110010010010111110001100111000001101010101010111111010001111000110110011101001001101101110010001011110100000011110111110001101000001000100101100111001001000100100111001100000011100011001100010100011100110010001111011011011011101111100100011001111110101110101000101100011010001011010010110010";
    var M1 = "the coffee was set on the table and the weather was nice and we could not see the terrible storm coming hopefully I woul"; // will be unknown
    var M2 = "weather was nice this Summers day at home and could not. There was an amazing sunrise over the top of the clouds that sho";
    if (M1.length * utils_1.DEFAULT_UNICODE_LENGTH > key.length) {
        throw Error("too long, " + M1.length + ". Should be " + key.length / utils_1.DEFAULT_UNICODE_LENGTH + " max");
    }
    // change this value. When "M" comes out as something like an english sentence, hardcode those values into your guess for M2
    var C1 = utils_1.oneTimePadEncrypt(M1, key);
    var C2 = utils_1.oneTimePadEncrypt(M2, key);
    var C1XORC2 = utils_1.XORStrings(C1, C2);
    var wordsToCheck = ["the coffee was set on the"];
    var messageSoFar = _.range(0, key.length / utils_1.DEFAULT_UNICODE_LENGTH).map(function (index) { return " "; });
    var words = {
        the: [0, 21],
        coffee: [4],
    };
    Object.entries(words).forEach(function (_a) {
        var key = _a[0], value = _a[1];
        value.forEach(function (startPos) {
            key.split("").forEach(function (letter, index) {
                if (messageSoFar[startPos + index] !== " ") {
                    throw Error("trying to place word in non empty spot");
                }
                messageSoFar[startPos + index] = letter;
            });
        });
    });
    console.log(chalk_1.default.green("Message so far: \"" + messageSoFar.join("") + "\""));
    wordsToCheck.forEach(function (word) {
        console.log("M_Prime: \"" + word + "\"");
        _.range(0, key.length / utils_1.DEFAULT_UNICODE_LENGTH - word.length).forEach(function (numberOfLeadingSpaces) {
            // about 121 loops
            if (messageSoFar[numberOfLeadingSpaces] !== " ") {
                // only try to insert if nothing already
                if (numberOfLeadingSpaces + word.length >
                    key.length / utils_1.DEFAULT_UNICODE_LENGTH) {
                    // need to shorten the word being tested
                    word = word.slice(1);
                }
                var M_Prime = utils_1.padWithSpaces(word, numberOfLeadingSpaces, key.length);
                var M = testPossibleM_Prime(M_Prime, C1XORC2);
                var start = numberOfLeadingSpaces - (numberOfLeadingSpaces === 0 ? 0 : 1);
                var end = numberOfLeadingSpaces + word.length + 1; // plus one for the space
                var sectionOfInterest = M.slice(start, end);
                if (checkValid(sectionOfInterest)) {
                    console.log(M.slice(0, start) +
                        chalk_1.default.green(M.slice(start, end)) +
                        M.slice(end) +
                        ("              from: " + start + " to " + end));
                }
            }
        });
    });
    var b = 2;
};
/*
 * Function for checking result of M_Prime XOR with C1 XOR C2
 * */
var testPossibleM_Prime = function (M_Prime, C1XORC2) {
    return utils_1.binaryToUnicode(utils_1.XORStrings(utils_1.unicodeToBitsAsString(M_Prime), C1XORC2));
};
var checkValidWithLookup = function (partial) {
    return !!partialWordSearch[partial];
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
test1();
//# sourceMappingURL=index.js.map