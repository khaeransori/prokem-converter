import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'

const run = (args, input = '') =>
  execFileSync('node', ['bin/prokem.js', ...args], { input, encoding: 'utf8' })

test('encodes text given as arguments', () => {
  assert.equal(run(['semarang', 'mangan bapak']), 'kahath calam\n')
})

test('joins several text arguments with a space', () => {
  assert.equal(run(['semarang', 'mangan', 'bapak']), 'kahath calam\n')
})

test('decodes with --decode', () => {
  assert.equal(run(['malang', 'ngalam', '--decode']), 'malang\n')
})

test('reads stdin when no text is given', () => {
  assert.equal(run(['jogja'], 'mangan\n'), 'daladh\n')
})

test('supports every dialect', () => {
  assert.equal(run(['unang', 'hancur']), 'uncar hanung\n')
  assert.equal(run(['jogja', 'mangan']), 'daladh\n')
})

test('exits non-zero and names the valid dialects on an unknown one', () => {
  try {
    run(['betawi', 'mangan'])
    assert.fail('expected a non-zero exit')
  } catch (err) {
    assert.equal(err.status, 1)
    assert.match(err.stderr, /unknown dialect/)
    assert.match(err.stderr, /semarang/)
  }
})

test('exits non-zero with usage when given no arguments', () => {
  try {
    run([])
    assert.fail('expected a non-zero exit')
  } catch (err) {
    assert.equal(err.status, 1)
  }
})

test('prints usage and exits zero for --help', () => {
  assert.match(run(['--help']), /Usage: prokem/)
})
