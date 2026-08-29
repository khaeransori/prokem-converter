import test from 'node:test'
import assert from 'node:assert/strict'
import libil from 'libil/lib/libil.js'
import { encode, decode } from '../src/jogja.js'

const VECTORS = {
  mangan: 'daladh', aku: 'panyu', malang: 'dangal', ombe: 'podse',
  iso: 'pibo', enak: 'pedhany', sikat: 'binyag', arema: 'payeda',
  sam: 'bad', bapak: 'sahany', kota: 'nyoga', matamu: 'dagadu',
  ini: 'pidhi', oke: 'ponye', bali: 'sangi', kowe: 'nyothe',
  turu: 'guyu', rokok: 'yonyony'
}

test('encodes every vector as libil does', () => {
  for (const [word, expected] of Object.entries(VECTORS)) {
    assert.equal(encode(word), expected, word)
  }
})

test('encode output stays byte-identical to libil itself', () => {
  for (const word of Object.keys(VECTORS)) {
    assert.equal(encode(word), libil.convert_word(word), word)
  }
})

test('every vector round-trips', () => {
  for (const word of Object.keys(VECTORS)) {
    assert.equal(decode(encode(word)), word, word)
  }
})

test('strips the h libil prefixes to vowel-initial words', () => {
  assert.equal(encode('aku'), 'panyu')
  assert.equal(decode('panyu'), 'aku')
})

test('does not apply the Semarang final-consonant rule', () => {
  assert.equal(encode('mas'), 'dab')      // semarang keeps the final s: kas
  assert.equal(encode('sikat'), 'binyag') // semarang keeps the final t: jimat
})

test('does not apply the Semarang nasal collapse', () => {
  assert.equal(encode('ombe'), 'podse')
})

test('preserves punctuation, spacing and case', () => {
  assert.equal(encode('Mangan!'), 'Daladh!')
  assert.equal(encode('mangan, turu'), 'daladh, guyu')
  assert.equal(encode('MANGAN'), 'DALADH')
})
