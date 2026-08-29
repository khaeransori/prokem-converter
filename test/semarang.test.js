import test from 'node:test'
import assert from 'node:assert/strict'
import { encode, decode, LEXICON } from '../src/semarang.js'

const ATTESTED = {
  mangan: 'kahath', ombe: 'ngoce', turu: 'yugu', lunga: 'puha', mas: 'kas',
  bapak: 'calam', wedok: 'dhenyom', enak: 'ngetham', apik: 'ngalim',
  iso: 'ngijo', ireng: 'ngigeng', rokok: 'gomom', kopi: 'moli', sik: 'jim',
  sikat: 'jimat', loro: 'pogo', seket: 'jemet', sepuluh: 'jelupuh'
}

test('encodes every attested lexicon word exactly as recorded', () => {
  for (const [javanese, prokem] of Object.entries(ATTESTED)) {
    assert.equal(encode(javanese), prokem, javanese)
  }
})

test('every attested word round-trips', () => {
  for (const javanese of Object.keys(ATTESTED)) {
    assert.equal(decode(encode(javanese)), javanese, javanese)
  }
})

test('handles the multi-word lexicon entry', () => {
  assert.equal(encode('rak ono'), 'gam ngotho')
  assert.equal(decode('gam ngotho'), 'rak ono')
})

test('applies the formula to words outside the lexicon', () => {
  assert.equal(encode('aku'), 'ngamu')
  assert.equal(encode('bali'), 'capi')
  assert.equal(encode('kowe'), 'modhe')
  assert.equal(encode('jajan'), 'sasath')
})

test('collapses homorganic nasal clusters before swapping', () => {
  assert.equal(encode('ngombe'), 'hoce')
})

test('inserts h so every vowel has a consonant partner', () => {
  assert.equal(encode('amalia'), 'ngakapinga')
})

test('keeps an awkward final consonant rather than swapping it', () => {
  // Non-lexicon words, so these exercise KEEP_FINAL rather than a table lookup.
  assert.equal(encode('wedus'), 'dhenyus')   // final s kept, not swapped to j
  assert.equal(encode('terus'), 'yegus')
  assert.equal(encode('omah'), 'ngokah')     // final h kept
  assert.equal(encode('bareng'), 'cageng')   // final ng kept
})

test('swaps a final consonant that is not awkward', () => {
  assert.equal(encode('montor'), 'kothyog')  // final r swaps to g
})

test('recognises the loose spellings recorded in the source', () => {
  assert.equal(decode('kahat'), 'mangan')
  assert.equal(decode('kahad'), 'mangan')
})

test('known lossy round trip: the inserted medial h cannot be told apart', () => {
  assert.equal(decode(encode('amalia')), 'amaliha')
})

test('known lossy round trip: the nasal collapse discards the nasal', () => {
  assert.equal(decode(encode('ngombe')), 'ngobe')
})

test('preserves punctuation, digits, spacing and case', () => {
  assert.equal(encode('Mangan!'), 'Kahath!')
  assert.equal(encode('mangan, turu'), 'kahath, yugu')
  assert.equal(encode('mangan  turu'), 'kahath  yugu')
  assert.equal(encode('sik 2 menit'), 'jim 2 kethit')
  assert.equal(encode('MANGAN'), 'KAHATH')
})

test('LEXICON is exported, frozen, and contains the attested pairs', () => {
  assert.equal(LEXICON.mangan, 'kahath')
  assert.equal(LEXICON.sepuluh, 'jelupuh')
  assert.equal(Object.isFrozen(LEXICON), true)
})
