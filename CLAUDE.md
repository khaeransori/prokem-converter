# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`prokem`, an ESM npm package converting Indonesian and Javanese text into four
secret languages and back: walikan Semarang, walikan Jogja, walikan Malang, and
bahasa Unang. No build step for the source; `dist/` and `types/` are generated.

## Commands

```bash
npm test                      # node --test, the whole suite
node --test test/unang.test.js        # one file
node --test --test-name-pattern="round-trip"   # one test
npm run build                 # esbuild -> dist/prokem.js
npm run types                 # tsc -> types/*.d.ts
node bin/prokem.js semarang mangan
```

## Architecture

`src/hanacaraka.js` owns the twenty-letter table, the tokenizer (digraphs ng,
ny, th, dh are single tokens), cipher construction, and the `h` prefix/strip
used by every letter-swapping dialect. `src/text.js` owns `mapWords`, which is
the only place punctuation, spacing and capitalisation are handled — dialects
convert one lowercase word and know nothing about text.

Semarang and Unang are implemented here. Jogja and Malang delegate **encoding**
to libil so output stays byte-identical to the reference implementation; their
decode is ours, because libil has none. Never reimplement libil's encode, and
never apply Semarang's `KEEP_FINAL` or nasal collapse to the other dialects —
both would break that parity, which the tests assert directly against the real
libil package.

libil is **vendored** at `src/vendor/libil.js`, not imported from
`node_modules` at runtime. It has to be: libil 0.1.2 assigns `c`, `sc`, `idx`,
`map_idx`, `pair`, and `m` without declaring them, which is fine in the
sloppy-mode CommonJS it was written for and a fatal `ReferenceError` under
strict mode — which is every ESM bundle. Importing it directly shipped a
package whose Jogja and Malang broke for anyone bundling with Vite, webpack,
Rollup, or Next. The vendored copy declares those six identifiers and exports
as ESM; every function body is byte-identical to upstream.

Because the vendored module is ESM, it is strict by construction, so the
ordinary Node tests now exercise the strict-mode path — deleting that
declaration line fails 18 tests. That is the regression guard. libil stays
installed as a **devDependency** so `test/jogja.test.js` and
`test/malang.test.js` can assert our output still matches upstream. The
published package has **no runtime dependencies**.

`src/index.js` composes the four modules into namespaces plus a `dialects`
record; the CLI and any consumer picker drive off that record.

## Conventions

- Comments describing the dialect rules are in Indonesian; keep it that way.
- Rule order in `semarang.js` `encodeWord` is load-bearing: lexicon, nasal
  collapse, `h` padding, cipher.
- Four round trips are lossy by construction (medial `h`, nasal collapse,
  initial `ha`/`a`, and a final `y`/`j` encoding to a kept `t`/`s` — e.g.
  `boy` → `cot` → `bot`). They are asserted as known exceptions — do not
  "fix" them.
- Attested forms that contradict a formula belong in `LEXICON`, not in a
  special case inside the cipher.
- `src/vendor/libil.js` is third-party code kept byte-identical to upstream
  apart from its module wrapper. Do not reformat it, do not "improve" it, and
  do not type-check it — `jsconfig.json` excludes it deliberately and
  `src/vendor/libil.d.ts` supplies its types instead.
- The browser bundle (`dist/prokem.js`) stays strict, and `scripts/build.mjs`
  needs no plugin to achieve that any more: the vendored source is already
  strict-safe, so the fix serves every consumer's bundler rather than only
  ours. `test/dist.test.js` guards the bundle.
