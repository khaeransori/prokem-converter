#!/usr/bin/env node
import { parseArgs } from 'node:util'
import { dialects } from '../src/index.js'

const NAMES = Object.keys(dialects)
const USAGE = `Usage: prokem <${NAMES.join('|')}> [text...] [--decode]

Reads stdin when no text is given.

  prokem semarang "mangan bapak"     kahath calam
  prokem jogja mangan                daladh
  echo ngalam | prokem malang --decode
`

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    decode: { type: 'boolean', default: false },
    help: { type: 'boolean', short: 'h', default: false }
  }
})

if (values.help) {
  process.stdout.write(USAGE)
  process.exit(0)
}

if (positionals.length === 0) {
  process.stderr.write(USAGE)
  process.exit(1)
}

const [name, ...rest] = positionals

if (!Object.hasOwn(dialects, name)) {
  process.stderr.write(`prokem: unknown dialect '${name}'. Try one of: ${NAMES.join(', ')}\n`)
  process.exit(1)
}

/**
 * @returns {Promise<string>}
 */
async function readStdin () {
  process.stdin.setEncoding('utf8')
  let text = ''
  for await (const chunk of process.stdin) text += chunk
  return text
}

const text = rest.length > 0 ? rest.join(' ') : await readStdin()
const convert = values.decode ? dialects[name].decode : dialects[name].encode

process.stdout.write(convert(text.replace(/\n$/, '')) + '\n')
