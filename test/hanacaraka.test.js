import test from 'node:test'
import assert from 'node:assert/strict'
import {
  LETTERS, isVowel, tokenize, makeCipher, applyCipher, prefixH, stripH
} from '../src/hanacaraka.js'

const SEMARANG = makeCipher(i => 19 - i)

test('LETTERS holds the twenty hanacaraka consonants, each once', () => {
  assert.equal(LETTERS.length, 20)
  assert.equal(new Set(LETTERS).size, 20)
  assert.equal(LETTERS[0], 'h')
  assert.equal(LETTERS[19], 'ng')
})

test('isVowel accepts the five vowels and nothing else', () => {
  for (const v of 'aiueo') assert.equal(isVowel(v), true)
  for (const c of ['b', 'ng', '', undefined, '1']) assert.equal(isVowel(c), false)
})

test('tokenize keeps the four digraphs together', () => {
  assert.deepEqual(tokenize('mangan'), ['m', 'a', 'ng', 'a', 'n'])
  assert.deepEqual(tokenize('dhenyom'), ['dh', 'e', 'ny', 'o', 'm'])
  assert.deepEqual(tokenize('thole'), ['th', 'o', 'l', 'e'])
})

test('tokenize returns an empty array for text with no letters', () => {
  assert.deepEqual(tokenize(''), [])
  assert.deepEqual(tokenize('!!'), [])
})

test('makeCipher builds an involution over the whole table', () => {
  assert.equal(SEMARANG.h, 'ng')
  assert.equal(SEMARANG.ng, 'h')
  assert.equal(SEMARANG.k, 'm')
  for (const letter of LETTERS) assert.equal(SEMARANG[SEMARANG[letter]], letter)
})

test('makeCipher supports the jogja pairing too', () => {
  const jogja = makeCipher(i => (i + 10) % 20)
  assert.equal(jogja.h, 'p')
  assert.equal(jogja.n, 'dh')
  for (const letter of LETTERS) assert.equal(jogja[jogja[letter]], letter)
})

test('applyCipher swaps consonants and leaves vowels alone', () => {
  assert.equal(applyCipher('bali', SEMARANG), 'capi')
})

test('applyCipher passes through letters outside hanacaraka', () => {
  assert.equal(applyCipher('fax', SEMARANG), 'fax')
})

test('applyCipher honours keepFinal only in final position', () => {
  const keep = new Set(['t', 's', 'h', 'ng'])
  assert.equal(applyCipher('mas', SEMARANG, keep), 'kas')
  assert.equal(applyCipher('mas', SEMARANG), 'kaj')
  assert.equal(applyCipher('sikat', SEMARANG, keep), 'jimat')
  assert.equal(applyCipher('sasat', SEMARANG, keep), 'jajat')
})

test('prefixH adds h only before an initial vowel', () => {
  assert.equal(prefixH('aku'), 'haku')
  assert.equal(prefixH('bali'), 'bali')
  assert.equal(prefixH(''), '')
})

test('stripH removes a leading h only when a vowel follows', () => {
  assert.equal(stripH('haku'), 'aku')
  assert.equal(stripH('bali'), 'bali')
  assert.equal(stripH('h'), 'h')
})

test('stripH is knowingly lossy: initial ha- and a- are one aksara', () => {
  assert.equal(stripH('hana'), 'ana')
})
