import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'

const DIST_PATH = fileURLToPath(new URL('../dist/prokem.js', import.meta.url))

test('the browser bundle exposes a working global', { skip: !existsSync(DIST_PATH) }, () => {
  const context = vm.createContext({})
  vm.runInContext(readFileSync(DIST_PATH, 'utf8'), context)

  assert.equal(context.prokem.semarang.encode('mangan'), 'kahath')
  assert.equal(context.prokem.jogja.encode('mangan'), 'daladh')
  assert.equal(context.prokem.malang.encode('malang'), 'ngalam')
  assert.equal(context.prokem.unang.encode('hancur'), 'uncar hanung')
  assert.deepEqual(Object.keys(context.prokem.dialects).sort(),
    ['jogja', 'malang', 'semarang', 'unang'])
})

test('the bundle inlines libil rather than requiring it', { skip: !existsSync(DIST_PATH) }, () => {
  assert.doesNotMatch(readFileSync(DIST_PATH, 'utf8'), /require\(["']libil["']\)/)
})
