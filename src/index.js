/**
 * prokem — Indonesian and Javanese secret languages, both directions.
 *
 * Each dialect is a namespace with encode(text) and decode(text). The dialects
 * record is the same four objects keyed by name, for pickers and CLIs.
 */
import * as semarang from './semarang.js'
import * as jogja from './jogja.js'
import * as malang from './malang.js'
import * as unang from './unang.js'

export { semarang, jogja, malang, unang }
export { LEXICON } from './semarang.js'

/** @type {Record<string, { encode: (text: string) => string, decode: (text: string) => string }>} */
export const dialects = { semarang, jogja, malang, unang }
