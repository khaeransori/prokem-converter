import test from 'node:test'
import assert from 'node:assert/strict'
import libil from 'libil'
import { encode, decode } from '../src/malang.js'

const VECTORS = {
  mangan: 'nangam', aku: 'ukah', malang: 'ngalam', ombe: 'ebmoh',
  iso: 'osih', enak: 'kaneh', sikat: 'takis', arema: 'amerah',
  sam: 'mas', bapak: 'kapab', kota: 'atok', matamu: 'umatam',
  ini: 'inih', oke: 'ekoh', bali: 'ilab', kowe: 'ewok',
  turu: 'urut', rokok: 'kokor'
}

test('encodes every vector as libil does', () => {
  for (const [word, expected] of Object.entries(VECTORS)) {
    assert.equal(encode(word), expected, word)
  }
})

test('encode output stays byte-identical to libil itself', () => {
  for (const word of Object.keys(VECTORS)) {
    assert.equal(encode(word), libil.convert_word_ngalam(word), word)
  }
})

test('every vector round-trips', () => {
  for (const word of Object.keys(VECTORS)) {
    assert.equal(decode(encode(word)), word, word)
  }
})

test('the city keeps its name both ways', () => {
  assert.equal(encode('malang'), 'ngalam')
  assert.equal(decode('ngalam'), 'malang')
})

test('digraphs survive reversal as single units', () => {
  assert.equal(encode('mangan'), 'nangam')
  assert.equal(encode('kowe'), 'ewok')
})

test('decode is ours because libil re-run does not round-trip', () => {
  const encoded = libil.convert_word_ngalam('aku')
  assert.notEqual(libil.convert_word_ngalam(encoded), 'aku')
  assert.equal(decode(encoded), 'aku')
})

test('preserves punctuation, spacing and case', () => {
  assert.equal(encode('Malang!'), 'Ngalam!')
  assert.equal(encode('mangan, turu'), 'nangam, urut')
  assert.equal(encode('MALANG'), 'NGALAM')
})
