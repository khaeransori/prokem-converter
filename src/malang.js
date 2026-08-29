/**
 * Walikan Malang (ngalam / osob kiwalan): the aksara of a word are read back
 * to front, so Malang becomes Ngalam.
 *
 * Encoding delegates to libil (MIT, Didiet Noor) so output stays byte-identical
 * to the reference implementation.
 *
 * Decoding is ours. libil has no decode, and its own function cannot serve as
 * one: it prefixes an h to vowel-initial words, reversal carries that h to the
 * end, and a second call prefixes another (aku -> ukah -> hakuh). Reversing
 * without the prefix and then stripping a leading h recovers the original.
 */
import libil from 'libil'
import { tokenize, stripH } from './hanacaraka.js'
import { mapWords } from './text.js'

/** @param {string} text @returns {string} */
export const encode = text => mapWords(text, word => libil.convert_word_ngalam(word))

/** @param {string} text @returns {string} */
export const decode = text =>
  mapWords(text, word => stripH(tokenize(word).reverse().join('')))
