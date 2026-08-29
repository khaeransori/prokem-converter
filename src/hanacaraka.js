/**
 * The shared hanacaraka engine: the twenty-letter table, the tokenizer, and
 * cipher construction. Knows nothing about any individual dialect.
 *
 *   ha na ca ra ka da ta sa wa la  pa dha ja ya nya ma ga ba tha nga
 */

/** @type {readonly string[]} */
export const LETTERS = [
  'h', 'n', 'c', 'r', 'k', 'd', 't', 's', 'w', 'l',
  'p', 'dh', 'j', 'y', 'ny', 'm', 'g', 'b', 'th', 'ng'
]

export const VOWELS = 'aiueo'

/**
 * @param {string} [ch]
 * @returns {boolean}
 */
export function isVowel (ch) {
  return typeof ch === 'string' && ch.length === 1 && VOWELS.includes(ch)
}

/**
 * Splits a lowercase word into aksara tokens: a digraph (ng, ny, th, dh)
 * or a single letter.
 * @param {string} word
 * @returns {string[]}
 */
export function tokenize (word) {
  return word.match(/ng|ny|th|dh|[a-z]/g) || []
}

/**
 * Builds a letter-substitution table by pairing each index with partner(index).
 * @param {(index: number) => number} partner
 * @returns {Record<string, string>}
 */
export function makeCipher (partner) {
  /** @type {Record<string, string>} */
  const cipher = {}
  for (let i = 0; i < LETTERS.length; i++) cipher[LETTERS[i]] = LETTERS[partner(i)]
  return cipher
}

/**
 * Substitutes every token through the cipher. Vowels and letters outside
 * hanacaraka (f, q, v, x, z) pass through untouched, as does any token listed
 * in keepFinal when it lands in final position.
 * @param {string} word
 * @param {Record<string, string>} cipher
 * @param {Set<string> | null} [keepFinal]
 * @returns {string}
 */
export function applyCipher (word, cipher, keepFinal = null) {
  const tokens = tokenize(word)
  return tokens
    .map((token, i) =>
      (keepFinal && i === tokens.length - 1 && keepFinal.has(token))
        ? token
        : (cipher[token] || token))
    .join('')
}

/**
 * Vowel-initial words get an h so every vowel has a consonant partner.
 * @param {string} word
 * @returns {string}
 */
export function prefixH (word) {
  return isVowel(word.charAt(0)) ? 'h' + word : word
}

/**
 * Undoes prefixH. Lossy by design: in hanacaraka an initial `a` and an
 * initial `ha` are the same aksara, so `hana` decodes to `ana`.
 * @param {string} word
 * @returns {string}
 */
export function stripH (word) {
  return (word.charAt(0) === 'h' && isVowel(word.charAt(1))) ? word.slice(1) : word
}
