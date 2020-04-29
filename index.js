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
exports.convertToBits = function (decimal, padding) {
    if (padding === void 0) { padding = 7; }
    return _.padStart(decimal.toString(2))
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
    if (binary.length % 7 !== 0) {
        throw Error("This might not a correctly padding unicode binary string. Received: " + binary);
    }
    var processedString = binary;
    var words = "";
    while (processedString.length > 0) {
        var letter = processedString.slice(0, 7);
        processedString = processedString.slice(7);
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
exports.displayBits = function (array) {
    return array.join("");
};
exports.stringToBits = function (chars) {
    return chars.split("").reduce(function (prev, curr) {
        return __spreadArrays(prev, exports.convertToBits(exports.unicodeValue(curr)));
    }, []);
};
exports.oneTimePadEncypt = function (message, key) {
    if (message.length !== key.length) {
        throw Error("message and key must be the same length, message length: " + message.length + ", key length: " + key.length);
    }
    if ((message.charAt(0) !== "0" && message.charAt(0) !== "1") ||
        (key.charAt(0) !== "0" && key.charAt(0) !== "1")) {
        throw Error("message and key must be a string of 0's and 1's. Message " + message + ", key: " + key);
    }
    return message.split("").reduce(function (prev, curr, index) {
        return prev + (parseInt(curr, 2) ^ parseInt(key[index], 2));
    }, "");
};
exports.oneTimePadDecrypt = function (cipherText, key) {
    if (cipherText.length !== key.length) {
        throw Error("Ciphertext and key must be the same length,ciphertext length: " + cipherText.length + ", key length: " + key.length);
    }
    if ((cipherText.charAt(0) !== "0" && cipherText.charAt(0) !== "1") ||
        (key.charAt(0) !== "0" && key.charAt(0) !== "1")) {
        throw Error("Ciphertext and key must be a string of 0's and 1's. Ciphertext " + cipherText + ", key: " + key);
    }
    return cipherText.split("").reduce(function (prev, curr, index) {
        return prev + (parseInt(curr, 2) ^ parseInt(key[index], 2));
    }, "");
};
var key = "11001000100110";
var message = "CS";
var cipherText = exports.oneTimePadEncypt(exports.displayBits(exports.stringToBits(message)), key);
var decrypted = exports.oneTimePadDecrypt(cipherText, key);
var tt = exports.binaryToUnicode(decrypted);
var b = 2;
//# sourceMappingURL=index.js.map