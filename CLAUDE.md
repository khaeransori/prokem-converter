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
to the `libil` package so output stays byte-identical to the reference
implementation; their decode is ours, because libil has none. Never
reimplement libil's encode, and never apply Semarang's `KEEP_FINAL` or nasal
collapse to the other dialects — both would break that parity, which the
tests assert directly against libil.

`src/index.js` composes the four modules into namespaces plus a `dialects`
record; the CLI and any consumer picker drive off that record.

## Conventions

- Comments describing the dialect rules are in Indonesian; keep it that way.
- Rule order in `semarang.js` `encodeWord` is load-bearing: lexicon, nasal
  collapse, `h` padding, cipher.
- Three round trips are lossy by construction (medial `h`, nasal collapse,
  initial `ha`/`a`). They are asserted as known exceptions — do not "fix" them.
- Attested forms that contradict a formula belong in `LEXICON`, not in a
  special case inside the cipher.
- The browser bundle (`dist/prokem.js`) stays strict. `libil` 0.1.2 assigns
  `c`, `sc`, `idx`, `map_idx`, `pair`, and `m` without declaring them, which
  throws under the bundle's strict mode; `scripts/build.mjs` has an esbuild
  plugin that declares those six identifiers at module scope when it loads
  libil's file, which is behaviour-preserving because each is written before
  it is read within a single call. `test/dist.test.js` is the guard — remove
  the plugin and `jogja`/`malang` encoding breaks in the bundle.
