/**
 * Applies a per-word conversion across arbitrary text, leaving everything that
 * is not a run of ASCII letters exactly as it was, and reapplying the source
 * word's capitalisation to the result.
 */

/**
 * @param {string} source the original word
 * @param {string} out the converted word
 * @returns {string}
 */
function restoreCase (source, out) {
  if (out === '') return out
  const isUpper = source === source.toUpperCase() && source !== source.toLowerCase()
  if (isUpper && source.length > 1) return out.toUpperCase()
  if (source.charAt(0) !== source.charAt(0).toLowerCase()) {
    return out.charAt(0).toUpperCase() + out.slice(1)
  }
  return out
}

/**
 * @param {string} text
 * @param {(word: string) => string} convertWord receives a lowercase word
 * @returns {string}
 */
export function mapWords (text, convertWord) {
  return text
    .split(/([A-Za-z]+)/)
    .map(part => /^[A-Za-z]+$/.test(part)
      ? restoreCase(part, convertWord(part.toLowerCase()))
      : part)
    .join('')
}
