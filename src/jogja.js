/**
 * Walikan Jogja.
 *
 * Encoding delegates to libil (MIT, Didiet Noor) so output stays byte-identical
 * to the reference implementation: the first ten hanacaraka letters are paired
 * with the last ten in the same order (h<->p, n<->dh, c<->j, r<->y, k<->ny).
 *
 * libil has no decode. The pairing is an involution, so decoding is the same
 * substitution followed by stripping the h that libil prefixes to
 * vowel-initial words (aku -> panyu -> haku -> aku).
 */
import libil from 'libil/lib/libil.js'
import { stripH } from './hanacaraka.js'
import { mapWords } from './text.js'

/** @param {string} text @returns {string} */
export const encode = text => mapWords(text, word => libil.convert_word(word))

/** @param {string} text @returns {string} */
export const decode = text => mapWords(text, word => stripH(libil.convert_word(word)))
