import * as esbuild from 'esbuild'
import { readFileSync } from 'node:fs'

// libil 0.1.2's lib/libil.js assigns c, sc, idx, map_idx, pair, and m
// without declaring them. That's a fatal ReferenceError under the strict
// mode this bundle runs in (esbuild always emits "use strict" for an ESM
// entry bundled to IIFE). Each of those six identifiers is written before
// it is ever read within a single synchronous call, so declaring them at
// module scope is behaviour-preserving: it only fixes where the implicit
// global would otherwise be created, it changes no conversion logic.
const declareLibilGlobals = {
  name: 'declare-libil-globals',
  setup (build) {
    build.onLoad({ filter: /libil[\\/]lib[\\/]libil\.js$/ }, args => ({
      contents: 'var c, sc, idx, map_idx, pair, m;\n' + readFileSync(args.path, 'utf8'),
      loader: 'js'
    }))
  }
}

await esbuild.build({
  entryPoints: ['src/index.js'],
  bundle: true,
  format: 'iife',
  globalName: 'prokem',
  outfile: 'dist/prokem.js',
  plugins: [declareLibilGlobals]
})
