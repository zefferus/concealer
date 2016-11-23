var Skip32: any = require('skip32').Skip32;
var Hashids: any = require('hashids');

// Public methods

export class Concealer {

  private skip32: any;
  private hashids: any;

  constructor(private secretKey: number[], private salt: string,
    private minLength = 1, private customAlphabet?: string) {

    if (!secretKey) {
      throw new Error('Secret Key must be provided');
    }
    if (!salt) {
      throw new Error('Salt must be provided');
    }
    if (!Array.isArray(secretKey) || !secretKey.length || !secretKey.every(isByte)) {
      throw new TypeError('Secret Key must be an Array of bytes represented by integers');
    }
    if (minLength !== undefined && !Number.isInteger(minLength)) {
      throw new TypeError('Min Length must be an integer, if provided');
    }

    this.skip32 = new Skip32(secretKey);
    this.hashids = new Hashids(salt, minLength || 1, customAlphabet);
  }


  encode(key: number): string {
    if (!Number.isInteger(key) || key < 0) {
      throw new TypeError('Key must be a non-negative integer');
    }

    const encrypted = this.skip32.encrypt(key);

    return this.hashids.encode(encrypted);
  }


  decode(key: string): number {
    const encrypted = this.hashids.decode(key)[0];

    if (encrypted === undefined) {
      return null;
    }

    return this.skip32.decrypt(encrypted);
  }
}


// Private methods

// Returns whether a given value represents a single byte
function isByte(val: number) {
  return Number.isInteger(val) && val >= 0 && val <= 255;
};
