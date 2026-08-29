import * as esbuild from 'esbuild'

// libil (2014) relies on sloppy-mode implicit globals, so this bundle must
// not run strict. The no-op banner below demotes esbuild's emitted
// "use strict" from a directive to a dead expression. Do not remove.
const banner = '/* libil (2014) relies on sloppy-mode implicit globals, so this bundle must not run strict. The no-op below demotes esbuild\'s emitted "use strict" from a directive to a dead expression. Do not remove. */ 0;'

await esbuild.build({
  entryPoints: ['src/index.js'],
  bundle: true,
  format: 'iife',
  globalName: 'prokem',
  outfile: 'dist/prokem.js',
  banner: { js: banner }
})
