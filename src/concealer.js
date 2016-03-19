'use strict';

var Skip32 = require('skip32').Skip32;
var Hashids = require('hashids');

var internals = {
  isInteger: Number.isInteger
};

// Number.isInteger is ES2016, include this polyfill just in case
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger

// istanbul ignore if
if (!internals.isInteger) {
  internals.isInteger = function isInteger(value) {
    return typeof value === 'number' &&
      isFinite(value) &&
      Math.floor(value) === value;
  };
}

// Returns whether a given value represents a single byte
internals.isByte = function isByte(val) {
  return internals.isInteger(val) && val >= 0 && val <= 255;
};


// Public methods

/**
 * Creates new Concealer utility. It iss highly recommended to provide a secret
 * key of 10 bytes to achieve the best encryption.
 *
 * @param  {Array<number>} secretKey - Array of bytes for the secret key.
 * @param  {string} salt - Salt for hashing function.
 * @param  {?number} [minLength] - Minimum length of encoder output.
 * @param  {?string} [customAlphabet] - Custom alphabet to use for generating
 *     hash results.
 * @throws {Error|TypeError} If Concealer isn't instantiated as new or if
 *     secretKey, salt, or minLength are not provided or are not of right types.
 */
exports = module.exports = internals.Concealer = Concealer;
function Concealer(secretKey, salt, minLength, customAlphabet) {
  if (!(this instanceof internals.Concealer)) {
    throw new Error('Concealer must be instantiated using new');
  }

  if (!secretKey) {
    throw new Error('Secret Key must be provided');
  }
  if (!salt) {
    throw new Error('Salt must be provided');
  }
  if (!Array.isArray(secretKey) || !secretKey.length ||
    !secretKey.every(internals.isByte)) {

    throw new TypeError('Secret Key must be an Array of bytes represented by integers');
  }
  if (minLength !== undefined && !internals.isInteger(minLength)) {
    throw new TypeError('Min Length must be an integer, if provided');
  }

  this._skip32 = new Skip32(secretKey);
  this._hashids = new Hashids(salt, minLength || 1, customAlphabet);
}


/**
 * Encrypts and encodes an integer to an obfuscated string.
 *
 * @param  {number} key - Non-negative integer to encode
 * @return {string} Encrypted and encoded key
 * @throws {TypeError} If key is not a non-negative integer
 */
internals.Concealer.prototype.encode = function encode(key) {
  if (!internals.isInteger(key) || key < 0) {
    throw new TypeError('Key must be a non-negative integer');
  }

  var encrypted = this._skip32.encrypt(key);

  return this._hashids.encode(encrypted);
};


/**
 * Decrypts encoded key back to a number.
 *
 * @param  {string} key - The encoded key.
 * @return {number|null} Key ID or null if the key could not be decoded.
 * @throws {TypeError} If key is not a string.
 */
internals.Concealer.prototype.decode = function decode(key) {
  if (typeof key !== 'string') {
    throw new TypeError('Key must be a string');
  }

  var encrypted = this._hashids.decode(key)[0];

  if (encrypted === undefined) {
    return null;
  }

  return this._skip32.decrypt(encrypted);
};
