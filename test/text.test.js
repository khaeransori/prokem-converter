import test from 'node:test'
import assert from 'node:assert/strict'
import { mapWords } from '../src/text.js'

const reverse = word => [...word].reverse().join('')

test('converts each run of letters', () => {
  assert.equal(mapWords('abc', reverse), 'cba')
})

test('preserves punctuation, digits and repeated spaces', () => {
  assert.equal(mapWords('sik, 2  menit!', reverse), 'kis, 2  tinem!')
  assert.equal(mapWords('', reverse), '')
  assert.equal(mapWords('123', reverse), '123')
})

test('preserves newlines', () => {
  assert.equal(mapWords('abc\ndef', reverse), 'cba\nfed')
})

test('restores Title case', () => {
  assert.equal(mapWords('Abc', reverse), 'Cba')
})

test('restores ALL CAPS', () => {
  assert.equal(mapWords('ABC', reverse), 'CBA')
})

test('treats a lone capital letter as Title case, not ALL CAPS', () => {
  assert.equal(mapWords('A', () => 'ngaku'), 'Ngaku')
})

test('leaves lowercase alone', () => {
  assert.equal(mapWords('abc DEF Ghi', reverse), 'cba FED Ihg')
})

test('always hands convertWord a lowercase word', () => {
  const seen = []
  mapWords('ABC Def ghi', word => { seen.push(word); return word })
  assert.deepEqual(seen, ['abc', 'def', 'ghi'])
})

test('tolerates a converter that returns an empty string', () => {
  assert.equal(mapWords('Abc!', () => ''), '!')
})

test('tolerates a converter that returns several words', () => {
  assert.equal(mapWords('Hancur.', () => 'uncar hanung'), 'Uncar hanung.')
})
