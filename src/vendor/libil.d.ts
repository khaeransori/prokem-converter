// Types for the vendored libil (see ./libil.js for why it is vendored).
//
// The vendored file is third-party 2014 JavaScript kept byte-identical to
// upstream, so it is excluded from checkJs — type-checking someone else's
// untyped source would only invite edits to it. This declaration gives
// src/jogja.js and src/malang.js the types they need instead.
declare const tokenize: (s: string) => string[]
declare const convert_word: (s: string) => string
declare const convert_word_ngalam: (s: string) => string
declare const convert: (s: string, ngalam?: boolean) => string

export { tokenize, convert_word, convert_word_ngalam, convert }
export default { tokenize, convert_word, convert_word_ngalam, convert }
