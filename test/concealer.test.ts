'use strict';

/* eslint func-names: 0, max-len: 0, no-unused-consts: 0 */

import test from 'ava';

import { Concealer } from '../src/concealer.js';

const config = [{
  key: [ 0x0f, 0x46, 0xd2, 0xde, 0x2d, 0x23, 0x8b, 0xe3, 0x07, 0x22 ],
  salt: 'EcQxgFe2xMLFsqJPclHN 2M5AFgL7WRoQP5F2vcE3',
  minlength: 20
}, {
  key: [ 0xf0, 0x64, 0x2d, 0xed, 0xd2, 0x32, 0xb8, 0x3e, 0x70, 0x22 ],
  salt: 'EcQxgFe2 2M5AFgL7WRoQP',
  minlength: 5
}];

test('Fails with no salt provided', (t) => {
  t.plan(2);

  t.throws(() => { new Concealer([ 0x0f, 0x46 ], null, 10); }, Error);
  t.throws(() => { new Concealer([ 0x0f, 0x46 ], null); }, Error);
});

test('Fails with no secret key provided', (t) => {
  t.plan(2);

  t.throws(() => { new Concealer(null, 'salt'); }, Error);
  t.throws(() => { new Concealer(null, 'salt', 10); }, Error);
});

test('Fails with bad secret key', (t) => {
  t.plan(3);

  t.throws(() => { new Concealer([], 'salt'); }, TypeError);
  t.throws(() => { new Concealer([ -1 ], 'salt'); }, TypeError);
  t.throws(() => { new Concealer([ 0, 1, 256, 255 ], 'salt'); }, TypeError);
});

test('Fails with bad min length', (t) => {
  t.plan(2);

  t.throws(() => { new Concealer(config[0].key, config[0].salt, 0.5); }, TypeError);
  t.throws(() => { new Concealer(config[0].key, config[0].salt, null); }, TypeError);
});

test('Fails on encode non-positive integer', (t) => {
  t.plan(2);

  const concealer = new Concealer(config[0].key, config[0].salt, config[0].minlength);

  t.throws(() => { concealer.encode(-1); }, TypeError);
  t.throws(() => { concealer.encode(1.5); }, TypeError);
});

test('Encodes id with minimum length', (t) => {
  t.plan(3);

  const concealer = new Concealer(config[0].key, config[0].salt, config[0].minlength);

  const id = 100;
  const encoded = concealer.encode(id);

  t.not(id.toString(), encoded);
  t.truthy(typeof encoded === 'string');
  t.truthy(encoded.length >= config[0].minlength);
});

test('Encodes id without minimum length', (t) => {
  t.plan(2);

  const concealer = new Concealer(config[0].key, config[0].salt);

  const id = 100;
  const encoded = concealer.encode(id);

  t.not(id.toString(), encoded);
  t.truthy(typeof encoded === 'string');
});

test('Null on bad decode string', (t) => {
  t.plan(1);

  const concealer = new Concealer(config[0].key, config[0].salt, config[0].minlength);

  const decoded = concealer.decode('this is an obviously bad decode string');

  t.is(null, decoded);
});

test('Decodes id', (t) => {
  t.plan(1);

  const concealer = new Concealer(config[0].key, config[0].salt, config[0].minlength);

  const id = 101;
  const encoded = concealer.encode(id);
  const decoded = concealer.decode(encoded);

  t.is(id, decoded);
});

test('Same id with same secrets produces same encoding', (t) => {
  t.plan(1);

  const concealer = new Concealer(config[0].key, config[0].salt, config[0].minlength);

  const id1 = 5000;
  const id2 = 5000;

  const encoded1 = concealer.encode(id1);
  const encoded2 = concealer.encode(id2);

  t.is(encoded1, encoded2);
});

test('Same id with different secrets produces same encoding', (t) => {
  t.plan(1);

  const concealer1 = new Concealer(config[0].key, config[0].salt, config[0].minlength);
  const concealer2 = new Concealer(config[1].key, config[1].salt, config[1].minlength);

  const id1 = 5000;
  const id2 = 5000;

  const encoded1 = concealer1.encode(id1);
  const encoded2 = concealer2.encode(id2);

  t.not(encoded1, encoded2);
});

test('Different keys produce different encodings', (t) => {
  t.plan(1);

  const concealer = new Concealer(config[0].key, config[0].salt, config[0].minlength);

  const key1 = 1000;
  const key2 = 1001;

  const encoded1 = concealer.encode(key1);
  const encoded2 = concealer.encode(key2);

  t.not(encoded1, encoded2);
});

test('Same id, same secrets, diff minlength produces different encodings that both decode', (t) => {
  t.plan(2);

  const concealer1 = new Concealer(config[0].key, config[0].salt, 0);
  const concealer2 = new Concealer(config[0].key, config[0].salt, config[0].minlength + 200);

  const id1 = 5000;
  const id2 = 5000;

  const encoded1 = concealer1.encode(id1);
  const encoded2 = concealer2.encode(id2);

  t.not(encoded1, encoded2);

  const decoded1 = concealer2.decode(encoded1);
  const decoded2 = concealer1.decode(encoded2);

  t.is(decoded1, decoded2);
});
