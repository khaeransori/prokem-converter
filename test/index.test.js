import test from 'node:test'
import assert from 'node:assert/strict'
import { semarang, jogja, malang, unang, dialects, LEXICON } from '../src/index.js'

test('every dialect is exported with encode and decode', () => {
  for (const dialect of [semarang, jogja, malang, unang]) {
    assert.equal(typeof dialect.encode, 'function')
    assert.equal(typeof dialect.decode, 'function')
  }
})

test('each namespace converts as its own module does', () => {
  assert.equal(semarang.encode('mangan'), 'kahath')
  assert.equal(jogja.encode('mangan'), 'daladh')
  assert.equal(malang.encode('malang'), 'ngalam')
  assert.equal(unang.encode('hancur'), 'uncar hanung')
})

test('each namespace decodes back', () => {
  assert.equal(semarang.decode('kahath'), 'mangan')
  assert.equal(jogja.decode('daladh'), 'mangan')
  assert.equal(malang.decode('ngalam'), 'malang')
  assert.equal(unang.decode('uncar hanung'), 'hancur')
})

test('dialects is keyed by name and holds the same objects', () => {
  assert.deepEqual(Object.keys(dialects).sort(), ['jogja', 'malang', 'semarang', 'unang'])
  assert.equal(dialects.semarang, semarang)
  assert.equal(dialects.jogja.encode('mangan'), 'daladh')
})

test('LEXICON is re-exported from the entry point', () => {
  assert.equal(LEXICON.mangan, 'kahath')
})

test('every dialect round-trips its own encoding', () => {
  for (const [name, dialect] of Object.entries(dialects)) {
    assert.equal(dialect.decode(dialect.encode('mangan')), 'mangan', name)
  }
})
