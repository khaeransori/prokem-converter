// The bare 'libil' import is intentionally not used from src: its index.js
// shim assigns an undeclared `libil` global, which throws under the strict
// mode esbuild emits for the bundle. src/jogja.js and src/malang.js import
// this subpath instead — the same four functions without the shim.
declare module 'libil/lib/libil.js' {
  const libil: {
    tokenize (s: string): string[]
    convert_word (s: string): string
    convert_word_ngalam (s: string): string
    convert (s: string, ngalam?: boolean): string
  }
  export default libil
}
