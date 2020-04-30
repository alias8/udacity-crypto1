"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var _ = __importStar(require("lodash"));
exports.DEFAULT_UNICODE_LENGTH = 7;
/*
 * Turn a decimal number into an array of 1's and 0's
 * */
exports.convertDecimalToBits = function (decimal, padding) {
    if (padding === void 0) { padding = exports.DEFAULT_UNICODE_LENGTH; }
    return _.padStart(decimal.toString(2), padding, "0")
        .split("")
        .map(function (entry) { return (entry === "1" ? 1 : 0); });
};
/*
 * Returns a unicode string of letters given a string of binary input
 * */
exports.binaryToUnicode = function (binary) {
    if (binary.charAt(0) !== "0" && binary.charAt(0) !== "1") {
        throw Error("Pass in a string of 1's and 0's. Received: " + binary);
    }
    if (binary.length % exports.DEFAULT_UNICODE_LENGTH !== 0) {
        throw Error("This might not a correctly padding unicode binary string. Received: " + binary);
    }
    var processedString = binary;
    var words = "";
    while (processedString.length > 0) {
        var letter = processedString.slice(0, exports.DEFAULT_UNICODE_LENGTH);
        processedString = processedString.slice(exports.DEFAULT_UNICODE_LENGTH);
        words += String.fromCharCode(parseInt(letter, 2));
    }
    return words;
};
exports.unicodeValue = function (char) {
    if (char.length !== 1) {
        throw Error("char must be length 1");
    }
    return char.charCodeAt(0);
};
/*
 * Turn an array of 1's and 0's into a string of 1's and 0's
 * */
exports.displayBits = function (array) {
    return array.join("");
};
/*
 * Turn a string into an array of 1's and 0's
 * */
exports.unicodeToBits = function (chars) {
    return chars.split("").reduce(function (prev, curr) {
        return __spreadArrays(prev, exports.convertDecimalToBits(exports.unicodeValue(curr)));
    }, []);
};
/*
 * Takes an english (unicode) string as input, gives back the binary representation
 * */
exports.unicodeToBitsAsString = function (englishLetters) {
    return exports.displayBits(exports.unicodeToBits(englishLetters));
};
/*
 * Takes message as an English sentence
 * */
exports.oneTimePadEncrypt = function (message, key) {
    if (key.length < message.length * exports.DEFAULT_UNICODE_LENGTH) {
        throw Error("Key too small for one time pad");
    }
    if (key.charAt(0) !== "0" && key.charAt(0) !== "1") {
        throw Error("key must be a string of 0's and 1's. Received: " + key);
    }
    message = exports.unicodeToBitsAsString(exports.padWithSpaces(message, 0, key.length)); // convert to binary string
    return message.split("").reduce(function (prev, curr, index) {
        return prev + (parseInt(curr, 2) ^ parseInt(key[index], 2));
    }, "");
};
exports.oneTimePadDecrypt = function (cipherText, key) {
    if (cipherText.length !== key.length) {
        throw Error("Ciphertext and key must be the same length, ciphertext length: " + cipherText.length + ", key length: " + key.length);
    }
    if ((cipherText.charAt(0) !== "0" && cipherText.charAt(0) !== "1") ||
        (key.charAt(0) !== "0" && key.charAt(0) !== "1")) {
        throw Error("Ciphertext and key must be a string of 0's and 1's. Ciphertext " + cipherText + ", key: " + key);
    }
    return exports.binaryToUnicode(cipherText.split("").reduce(function (prev, curr, index) {
        return prev + (parseInt(curr, 2) ^ parseInt(key[index], 2));
    }, ""));
};
/*
 * XOR two strings of 1's and 0's together
 * */
exports.XORStrings = function (a, b) {
    if (a.length !== b.length) {
        throw Error("Strings to XOR must be of the same length");
    }
    if ((a.charAt(0) !== "0" && a.charAt(0) !== "1") ||
        (b.charAt(0) !== "0" && b.charAt(0) !== "1")) {
        throw Error("key must be a string of 0's and 1's. Received: " + a + ", " + b);
    }
    return a.split("").reduce(function (prev, curr, index) {
        return prev + (parseInt(curr, 2) ^ parseInt(b[index], 2));
    }, "");
};
exports.getRandomKey = function (size) {
    return _.range(0, size)
        .map(function (index) { return Math.round(Math.random()).toString(); })
        .join("");
};
exports.padWithSpaces = function (chars, leadingSpaces, totalBitSize) {
    if (totalBitSize % exports.DEFAULT_UNICODE_LENGTH !== 0) {
        throw Error("please use a total bit size that is a multiple of " + exports.DEFAULT_UNICODE_LENGTH + ". Received: " + totalBitSize);
    }
    var totalChars = totalBitSize / exports.DEFAULT_UNICODE_LENGTH;
    var withLeadingSpaces = _.padStart(chars, chars.length + leadingSpaces, " ");
    return _.padEnd(withLeadingSpaces, totalChars, " ");
};
//# sourceMappingURL=utils.js.map