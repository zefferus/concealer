# Concealer

A fast two-way encryption module to generate unique, random-appearing, non-sequential strings from integers. This is a great way to encode database primary keys before presenting them to the user.

[![Build Status](https://travis-ci.org/zefferus/concealer.svg?branch=master)](https://travis-ci.org/zefferus/concealer)![Current Version](https://img.shields.io/npm/v/concealer.svg)

Development on **Concealer** is sponsored by [Sparo Labs](http://www.sparolabs.com/).

And to make the output more URL-friendly, the algorithm automatically tries to avoid generating output with common English curse words by reserving some letters (`cfhistuCFHISTU`) for use as separators.

***Security Note:*** This module uses the SKIP32 algorithm, which is a 80-bit key, 32-bit block symmetric cipher based on [Skipjack](https://en.wikipedia.org/wiki/Skipjack_%28cipher%29). This module is not intended to be cryptographically secure; it may be possible, with enough encoded results, to determine the key and salt used and break the encryption. Please ***do not*** use this module for anything that you must keep absolutely secure; this module is more useful for making URL-ready strings representing database primary keys that you would rather not directly expose to the end-user.


## Install

```bash
$ npm install --save concealer
```


## Usage

### `new Concealer(secretKey, salt, [minLength], [customAlphabet])`

Creates a new `Concealer` object where:

- `secretKey` - An array of bytes to use for the secret key. The method will use up to the first ten bytes in the array and will duplicate values provided if there are less. It is *highly* recommended to provide all ten bytes for the most secure encryption.
- `salt` - A string to use for the salt for the encryption process.
- `minLength` - An optional minimum integer length for the output. Depending on the size of the primary key, the encoded string could be longer than the given minimum.
- `customAlphabet` - An optional string to define a custom alphabet for generating the encoded string. The string must contain all unique characters, no spaces, and be at least 16 characters long.

```javascript
const Concealer = require('concealer');

// Do ***NOT*** use these keys and salts in a production system
const key = [ 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x10 ];
const salt = 'example salt';
const minLength = 8;

const concealer = new Concealer(key, salt, minLength);
```


### `concealer.encode(key)`

Encrypts and encodes an integer key into an obfuscated string where:

- `key` - A non-negative integer to encode.

Returns the resulting encoded string.

```javascript
concealer.encode(1);
// 'ZBoM3XdG'

concealer.encode(2);
// 'ZlllPKa5'

concealer.encode(3);
// 'D4GqMMzA'
```


### `concealer.decode(key)`

Decrypts encoded key string back to a number where:

- `key` - The encoded key string.

Returns the decoded number or null if the key string cannot be decoded.

```javascript
concealer.decode('ZlllPKa5');
// 2

concealer.decode('manipulated key string');
// null
```


## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.
