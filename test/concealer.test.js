'use strict';

/* eslint func-names: 0, max-len: 0, no-unused-vars: 0 */

var tap = require('tap');
var test = tap.test;

var Concealer = require('../src/concealer');

var config = [{
  key: [ 0x0f, 0x46, 0xd2, 0xde, 0x2d, 0x23, 0x8b, 0xe3, 0x07, 0x22 ],
  salt: 'EcQxgFe2xMLFsqJPclHN 2M5AFgL7WRoQP5F2vcE3',
  minlength: 20
}, {
  key: [ 0xf0, 0x64, 0x2d, 0xed, 0xd2, 0x32, 0xb8, 0x3e, 0x70, 0x22 ],
  salt: 'EcQxgFe2 2M5AFgL7WRoQP',
  minlength: 5
}];

test('Errors if not instantiated new', function (t) {
  t.plan(1);

  t.throws(function () {
    var concealer = Concealer(config[0].key, config[0].salt, config[0].minlength);
  });
  t.end();
});

test('Fails with no salt provided', function (t) {
  t.plan(2);

  t.throws(function () {
    new Concealer([ 0x0f, 0x46 ], null, 10);
  }, Error);
  t.throws(function () {
    new Concealer([ 0x0f, 0x46 ], null);
  }, Error);

  t.end();
});

test('Fails with no secret key provided', function (t) {
  t.plan(3);

  t.throws(function () {
    new Concealer();
  }, Error);
  t.throws(function () {
    new Concealer(null, 'salt');
  }, Error);
  t.throws(function () {
    new Concealer(null, 'salt', 10);
  }, Error);

  t.end();
});

test('Fails with bad secret key', function (t) {
  t.plan(5);

  t.throws(function () {
    new Concealer('badkey', 'salt');
  }, TypeError);
  t.throws(function () {
    new Concealer([], 'salt');
  }, TypeError);
  t.throws(function () {
    new Concealer([ 1, 2, 3, '1' ], 'salt');
  }, TypeError);
  t.throws(function () {
    new Concealer([ -1 ], 'salt');
  }, TypeError);
  t.throws(function () {
    new Concealer([ 0, 1, 256, 255 ], 'salt');
  }, TypeError);

  t.end();
});

test('Fails with bad min length', function (t) {
  t.plan(2);

  t.throws(function () {
    new Concealer(config[0].key, config[0].salt, 0.5);
  }, TypeError);
  t.throws(function () {
    new Concealer(config[0].key, config[0].salt, '1');
  }, TypeError);

  t.end();
});

test('Fails on encode non-integer', function (t) {
  t.plan(2);

  var concealer = new Concealer(config[0].key, config[0].salt, config[0].minlength);

  t.throws(function () {
    concealer.encode('xyz');
  }, TypeError);
  t.throws(function () {
    concealer.encode(1.5);
  }, TypeError);

  t.end();
});

test('Fails on decode non-string', function (t) {
  t.plan(1);

  var concealer = new Concealer(config[0].key, config[0].salt, config[0].minlength);

  t.throws(function () {
    concealer.decode(123);
  }, TypeError);

  t.end();
});

test('Encodes id with minimum length', function (t) {
  t.plan(3);

  var concealer = new Concealer(config[0].key, config[0].salt, config[0].minlength);

  var id = 100;
  var encoded = concealer.encode(id);

  t.notEquals(id, encoded);
  t.ok(typeof encoded === 'string');
  t.ok(encoded.length >= config[0].minlength);

  t.end();
});

test('Encodes id without minimum length', function (t) {
  t.plan(2);

  var concealer = new Concealer(config[0].key, config[0].salt);

  var id = 100;
  var encoded = concealer.encode(id);

  t.notEquals(id, encoded);
  t.ok(typeof encoded === 'string');

  t.end();
});

test('Null on bad decode string', function (t) {
  t.plan(1);

  var concealer = new Concealer(config[0].key, config[0].salt, config[0].minlength);

  var decoded = concealer.decode('this is an obviously bad decode string');

  t.equals(null, decoded);

  t.end();
});

test('Decodes id', function (t) {
  t.plan(1);

  var concealer = new Concealer(config[0].key, config[0].salt, config[0].minlength);

  var id = 101;
  var encoded = concealer.encode(id);
  var decoded = concealer.decode(encoded);

  t.equals(id, decoded);

  t.end();
});

test('Same id with same secrets produces same encoding', function (t) {
  t.plan(1);

  var concealer = new Concealer(config[0].key, config[0].salt, config[0].minlength);

  var id1 = 5000;
  var id2 = 5000;

  var encoded1 = concealer.encode(id1);
  var encoded2 = concealer.encode(id2);

  t.equals(encoded1, encoded2);

  t.end();
});

test('Same id with different secrets produces same encoding', function (t) {
  t.plan(1);

  var concealer1 = new Concealer(config[0].key, config[0].salt, config[0].minlength);
  var concealer2 = new Concealer(config[1].key, config[1].salt, config[1].minlength);

  var id1 = 5000;
  var id2 = 5000;

  var encoded1 = concealer1.encode(id1);
  var encoded2 = concealer2.encode(id2);

  t.notEquals(encoded1, encoded2);

  t.end();
});

test('Different keys produce different encodings', function (t) {
  t.plan(1);

  var concealer = new Concealer(config[0].key, config[0].salt, config[0].minlength);

  var key1 = 1000;
  var key2 = 1001;

  var encoded1 = concealer.encode(key1);
  var encoded2 = concealer.encode(key2);

  t.notEquals(encoded1, encoded2);

  t.end();
});

test('Same id, same secrets, diff minlength produces different encodings that both decode', function (t) {
  t.plan(2);

  var concealer1 = new Concealer(config[0].key, config[0].salt, 0);
  var concealer2 = new Concealer(config[0].key, config[0].salt, config[0].minlength + 200);

  var id1 = 5000;
  var id2 = 5000;

  var encoded1 = concealer1.encode(id1);
  var encoded2 = concealer2.encode(id2);

  t.notEquals(encoded1, encoded2);

  var decoded1 = concealer2.decode(encoded1);
  var decoded2 = concealer1.decode(encoded2);

  t.equals(decoded1, decoded2);

  t.end();
});
