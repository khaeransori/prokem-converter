import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import vm from 'node:vm'

test('the browser bundle exposes a working global', { skip: !existsSync('dist/prokem.js') }, () => {
  const context = vm.createContext({})
  vm.runInContext(readFileSync('dist/prokem.js', 'utf8'), context)

  assert.equal(context.prokem.semarang.encode('mangan'), 'kahath')
  assert.equal(context.prokem.jogja.encode('mangan'), 'daladh')
  assert.equal(context.prokem.malang.encode('malang'), 'ngalam')
  assert.equal(context.prokem.unang.encode('hancur'), 'uncar hanung')
  assert.deepEqual(Object.keys(context.prokem.dialects).sort(),
    ['jogja', 'malang', 'semarang', 'unang'])
})

test('the bundle inlines libil rather than requiring it', { skip: !existsSync('dist/prokem.js') }, () => {
  assert.doesNotMatch(readFileSync('dist/prokem.js', 'utf8'), /require\(["']libil["']\)/)
})
