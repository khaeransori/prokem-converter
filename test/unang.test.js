import test from 'node:test'
import assert from 'node:assert/strict'
import { encode, decode } from '../src/unang.js'

const ATTESTED = {
  hancur: 'uncar hanung',
  lari: 'ura laning',
  siapa: 'upa sianang',
  sebentar: 'untar sebenang',
  bel: 'ubal neng',
  sepedanya: 'uda sepenangnya'
}

test('encodes every attested example exactly as recorded', () => {
  for (const [indonesian, unang] of Object.entries(ATTESTED)) {
    assert.equal(encode(indonesian), unang, indonesian)
  }
})

test('every attested example round-trips', () => {
  for (const [indonesian, unang] of Object.entries(ATTESTED)) {
    assert.equal(decode(unang), indonesian, unang)
  }
})

test('a one-syllable word drops the b part', () => {
  assert.equal(encode('bel'), 'ubal neng')
})

test('the consonant before the last syllable joins x', () => {
  assert.equal(encode('sebentar'), 'untar sebenang')
})

test('-nya is detached and reattached', () => {
  assert.equal(encode('sepedanya'), 'uda sepenangnya')
})

test('-nya is treated as part of the root when the stem is one syllable', () => {
  assert.equal(decode(encode('punya')), 'punya')
  assert.equal(decode(encode('tanya')), 'tanya')
})

test('leaves a pair that is not valid Unang untouched', () => {
  assert.equal(decode('mangan turu'), 'mangan turu')
  assert.equal(decode('uncar'), 'uncar')
})

test('preserves punctuation and case', () => {
  assert.equal(encode('Hancur!'), 'Uncar hanung!')
  assert.equal(decode('Uncar hanung!'), 'Hancur!')
})

test('leaves a word with no vowel untouched', () => {
  assert.equal(encode('brr'), 'brr')
})
