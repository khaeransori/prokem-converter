import * as esbuild from 'esbuild'

// Attribution for both bundled works. This is a comment, not a statement, so
// it does not push esbuild's "use strict" out of first-statement position.
const BANNER = `/*!
 * prokem - MIT
 * Includes libil 0.1.2 - MIT (c) 2014 Didiet Noor
 */`

// No plugin is needed here any more. libil's undeclared identifiers are fixed
// once, in src/vendor/libil.js, so every consumer's bundler benefits — not
// just this one.
await esbuild.build({
  entryPoints: ['src/index.js'],
  bundle: true,
  format: 'iife',
  globalName: 'prokem',
  outfile: 'dist/prokem.js',
  banner: { js: BANNER }
})
