/**
 * Bahasa Unang.
 *
 * Rumus: U(x) (b)n(c)ng
 *   x = suku kata terakhir yang seluruh vokalnya diubah menjadi 'a';
 *       konsonan tepat sebelum suku kata terakhir ikut masuk ke x
 *   b = kata yang suku kata terakhirnya (beserta konsonan tadi) dihilangkan
 *   c = vokal asli dari suku kata terakhir
 *
 * hancur -> uncar hanung, lari -> ura laning, sebentar -> untar sebenang,
 * bel -> ubal neng (b kosong), sepedanya -> uda sepenangnya.
 */
import { mapWords, restoreCase } from './text.js'

// b + (kluster konsonan + deret vokal terakhir + konsonan penutup) = b + x.
// Kluster konsonan sebelum deret vokal terakhir seluruhnya masuk ke x,
// sehingga sebentar -> untar, bukan utar.
const SPLIT = /^([a-z]*?)([^aeiou]*[aeiou]+[^aeiou]*)$/

/**
 * @param {string} word lowercase
 * @returns {string}
 */
function encodeWord (word) {
  // Akhiran -nya dipisah dulu, hanya jika sisa katanya masih punya minimal
  // dua suku kata (punya/tanya diperlakukan sebagai akar).
  let stem = word
  let nya = ''
  if (word.endsWith('nya')) {
    const root = word.slice(0, -3)
    if ((root.match(/[aeiou]+/g) || []).length >= 2) {
      stem = root
      nya = 'nya'
    }
  }

  const m = stem.match(SPLIT)
  if (!m) return word // tanpa vokal, biarkan apa adanya

  const [, b, x] = m
  // x always contains a vowel by construction (SPLIT's middle group), so the
  // match cannot be null; cast rather than add a runtime check that can't fire.
  const c = /** @type {RegExpMatchArray} */ (x.match(/[aeiou]+/))[0]
  return 'u' + x.replace(/[aeiou]/g, 'a') + ' ' + b + 'n' + c + 'ng' + nya
}

/**
 * Kebalikan rumus untuk sepasang kata "u(x) (b)n(c)ng[nya]".
 * @param {string} uWord lowercase
 * @param {string} nWord lowercase
 * @returns {string | null} null jika pasangan itu bukan bahasa Unang yang sah
 */
function decodePair (uWord, nWord) {
  if (uWord.charAt(0) !== 'u') return null

  let tail = nWord
  let nya = ''
  if (tail.endsWith('ngnya')) {
    nya = 'nya'
    tail = tail.slice(0, -3)
  }

  const m = tail.match(/^([a-z]*?)n([aeiou]+)ng$/)
  if (!m) return null

  const [, b, c] = m
  const x = uWord.slice(1)
  if (!/[aeiou]/.test(x)) return null

  return b + x.replace(/[aeiou]+/, c) + nya
}

/** @param {string} text @returns {string} */
export const encode = text => mapWords(text, encodeWord)

/**
 * Decoding consumes two whitespace-separated words at a time, so it walks the
 * split itself instead of going through mapWords.
 * @param {string} text
 * @returns {string}
 */
export function decode (text) {
  const parts = text.split(/([A-Za-z]+)/)
  let out = ''
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    const pairable = /^[A-Za-z]+$/.test(part) &&
      i + 2 < parts.length &&
      /^\s+$/.test(parts[i + 1]) &&
      /^[A-Za-z]+$/.test(parts[i + 2])

    if (pairable) {
      const decoded = decodePair(part.toLowerCase(), parts[i + 2].toLowerCase())
      if (decoded !== null) {
        out += restoreCase(part, decoded)
        i += 2
        continue
      }
    }
    out += part
  }
  return out
}
