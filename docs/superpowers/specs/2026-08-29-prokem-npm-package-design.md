# prokem — npm package design

Date: 2026-08-29
Status: approved for planning

## Goal

Turn this repo into `prokem`, an npm package that converts Indonesian and
Javanese text into four secret-language dialects, and back. The existing
static demo stays, now driven by the package it documents.

- `semarang` — walikan Semarang (boso gali), already implemented here
- `unang` — bahasa Unang, already implemented here
- `jogja` — walikan Jogja, from `libil` 0.1.2
- `malang` — walikan Malang (ngalam / osob kiwalan), from `libil` 0.1.2

`prokem` is unclaimed on npm (checked 2026-08-29).

## Decisions

Four decisions shaped this design; each is recorded with the reasoning so a
later reader does not reopen it without new information.

**Jogja and Malang wrap `libil`, they are not reimplemented.** `libil` 0.1.2
(MIT, Didiet Noor) is unmaintained since 2014 and its two dialects amount to
about fifty lines over the same twenty-letter table this repo already carries,
so reimplementing was on the table. Wrapping wins because it makes upstream
parity structural rather than aspirational: the output cannot drift from the
reference implementation, because it *is* the reference implementation. The
cost is accepted and named — libil's tokenizer cannot produce the inverse
transform, so a second tokenizer lives beside it in `src/hanacaraka.js`.

**`libil` supplies encode only; decode is ours.** libil exposes no decode, so
there is no upstream behaviour to be unfaithful to. This also removes the one
real problem with libil's Malang: its `h`-prefix for vowel-initial words
migrates to the end of the word under token reversal, where it is
indistinguishable from a genuine final `h`. Re-running libil's own function
therefore fails to round-trip every vowel-initial word (`aku → ukah → akuh`).
Our inverse — tokenize *without* the prefix, reverse, strip a leading `h` —
recovers all of them (`ukah → haku → aku`). Encode output stays byte-identical
to libil; only the direction libil never implemented is ours.

**Semarang's extra rules stay Semarang-only.** `KEEP_FINAL` (word-final
`t`/`s`/`h`/`ng` left unswapped) and the homorganic nasal collapse
(`ngg→g`, `ndh→dh`, `nd→d`, `mb→b`, `nj→j`) are specific claims made by the
UNNES source about Semarang, not general walikan phonology. Promoting them to
shared defaults would silently move Jogja and Malang off libil parity, which is
the property this design just paid a dependency to guarantee.

**Namespaced API over a single `convert()`.** One object per dialect, each with
`encode`/`decode`, gives the best autocomplete and lets a bundle pull a single
dialect through a subpath export. The one thing it loses — driving a language
picker — is restored by also exporting a `dialects` record keyed by name.

## Public API

```js
import { semarang, jogja, malang, unang, dialects, LEXICON } from 'prokem'

semarang.encode('mangan')      // 'kahath'
semarang.decode('kahath')      // 'mangan'
jogja.encode('mangan')         // 'daladh'
jogja.decode('daladh')         // 'mangan'
malang.encode('malang')        // 'ngalam'
malang.decode('ngalam')        // 'malang'
unang.encode('hancur')         // 'uncar hanung'
unang.decode('uncar hanung')   // 'hancur'

dialects.jogja.encode('mangan')   // for pickers; keys are the dialect names
Object.keys(dialects)             // ['semarang','jogja','malang','unang']
```

Every `encode`/`decode` takes and returns arbitrary text, not a single word.
Deep imports are supported for bundle size:

```js
import { encode, decode } from 'prokem/jogja'
```

Each `src/<dialect>.js` exports bare `encode` and `decode` functions; `index.js`
gathers them into the namespace objects and the `dialects` record. The namespace
object and the subpath module are the same two functions viewed two ways.

`LEXICON` (Semarang's attested vocabulary) is exported read-only for consumers
that want to display or extend the word list.

## Module layout

```
src/
  hanacaraka.js   LETTERS, tokenize(), applyCipher(), h-prefix helpers
  text.js         mapWords(): punctuation, spacing, capitalisation
  semarang.js     reversed pairing + LEXICON + KEEP_FINAL + nasal collapse
  jogja.js        libil.convert_word + our inverse
  malang.js       libil.convert_word_ngalam + our inverse
  unang.js        U(x) (b)n(c)ng, pair-aware decode
  index.js        the four namespaces, dialects, LEXICON
bin/prokem.js     CLI
test/*.test.js    node:test
dist/prokem.js    esbuild IIFE bundle, committed
types/            .d.ts emitted from JSDoc, publish-time only
index.html        demo, four-way picker, loads dist/
```

`main.js` is deleted. Its Semarang and Unang logic moves into `src/` with no
behavioural change; the current outputs become test vectors.

`src/hanacaraka.js` owns the twenty-letter table exactly once:

```
ha na ca ra ka da ta sa wa la  pa dha ja ya nya ma ga ba tha nga
```

Semarang pairs index `i` with `19 - i` (`h↔ng`, `n↔th`, `c↔b`, `r↔g`, `k↔m`).
Jogja, inside libil, pairs `i` with `(i + 10) % 20` (`h↔p`, `n↔dh`, `c↔j`,
`r↔y`, `k↔ny`). Both are involutions.

## Rules per dialect

| dialect | transform | keep final t/s/h/ng | nasal collapse | h before initial vowel |
|---|---|---|---|---|
| semarang | pair `i ↔ 19-i` | yes | yes | yes |
| jogja | pair `i ↔ (i+10)%20` | no | no | yes |
| malang | reverse token order | — | no | encode yes (libil), decode no |
| unang | syllable split, not a cipher | — | — | — |

Decode per dialect:

- **semarang** — inverted lexicon first, then the same cipher, then strip a
  leading `h`. The `h` inserted *between* two vowels is deliberately not
  removed: it is indistinguishable from a real one (`bahasa`, `tahu`).
- **jogja** — `libil.convert_word`, then strip a leading `h`.
- **malang** — our tokenizer without the `h`-prefix, reversed, then strip a
  leading `h`.
- **unang** — pair-aware; consumes two whitespace-separated words at a time and
  leaves anything that is not a valid pair untouched.

"Strip a leading `h`" means precisely: remove a word-initial `h` **only when the
next character is a vowel**, undoing the prefix that encode adds to
vowel-initial words. An `h` before a consonant is never touched.

This rule is knowingly lossy in one direction: after decoding, an initial
`ha-` and an initial `a-` are no longer distinguishable, so `hana` decodes to
`ana`. This is deliberate and inherited from the current implementation — in
hanacaraka the initial `a` and `ha` are the same aksara, so the two spellings
represent the same sound. The affected words are asserted as explicit known
exceptions in the round-trip tests rather than silently skipped.

## Text handling

`mapWords()` splits on `/([A-Za-z]+)/` so punctuation, digits, and whitespace
pass through unchanged, and restores case per word in three forms: all-lower,
Title, and ALL-CAPS (`MANGAN → KAHATH`). ALL-CAPS is new, adopted from libil's
`fixCase`; libil's fourth form (inverse capitalisation) is not carried over.

Unang decoding cannot use `mapWords` because it consumes word *pairs*; it keeps
its own walker over the same split, and `unangDecodePair` returning `null` is
how it decides to leave text alone.

## CLI

```
$ npx prokem semarang "mangan bapak"
kahath calam
$ echo "ngalam" | npx prokem malang --decode
malang
```

Dialect name is the first positional argument and must be a key of `dialects`;
text is the remaining arguments, or stdin when none are given. `--decode`
reverses direction. Built on `node:util` `parseArgs`, no dependency. Unknown
dialect exits non-zero listing the valid names.

## Packaging

```json
{
  "name": "prokem",
  "type": "module",
  "exports": {
    ".":          { "types": "./types/index.d.ts", "default": "./src/index.js" },
    "./semarang": { "types": "./types/semarang.d.ts", "default": "./src/semarang.js" },
    "./jogja":    { "types": "./types/jogja.d.ts",    "default": "./src/jogja.js" },
    "./malang":   { "types": "./types/malang.d.ts",   "default": "./src/malang.js" },
    "./unang":    { "types": "./types/unang.d.ts",    "default": "./src/unang.js" }
  },
  "bin":   { "prokem": "./bin/prokem.js" },
  "files": ["src", "bin", "types", "dist"],
  "dependencies":    { "libil": "0.1.2" },
  "devDependencies": { "typescript": "^5", "esbuild": "^0.25" }
}
```

Dev dependency ranges above are indicative; pin whatever is current at scaffold
time. `libil` is pinned to an exact version, not a range: the package has not moved
since 2014 and parity is the entire reason it is present.

Authoring is plain ESM with JSDoc annotations. TypeScript is a build-time
dependency only, run as `tsc -p jsconfig.json` to emit `types/` before publish;
no `.ts` source, no transpiled JS. `esbuild` produces `dist/prokem.js`, an IIFE
bundle with `globalName: 'prokem'` that inlines libil, committed to the repo so
the demo works from `file://` and over GitHub Pages.

ESM-only. Consumers on CJS use the `dist/` bundle or dynamic `import()`.

## Testing

`node --test`, `node:assert`, no framework and no fixtures. Three kinds:

1. **Golden vectors** per dialect. Jogja and Malang vectors are generated from
   libil itself and committed, so any drift from upstream — a fork, a version
   bump, an accidental reimplementation — fails the suite. Semarang and Unang
   vectors come from the current `main.js` output plus the tables in
   `index.html`, so the rewrite is provably behaviour-preserving.
2. **Round-trip properties**: `decode(encode(w)) === w` across the lexicon and a
   word list, per dialect. Semarang's medial-`h` case and any other known
   non-invertible input are asserted as explicit known exceptions rather than
   skipped, so the list of lossy cases stays visible.
3. **Text handling**: punctuation, multiple spaces, newlines, digits, and the
   three capitalisation forms survive a round trip.

## Demo page

`index.html` keeps its current structure. The language radio group goes from
two options to four; `convertInput()` drives `dialects[name]` instead of a
mode string. The notes section gains rule descriptions and example tables for
Jogja and Malang, alongside the existing Semarang and Unang ones, and credits
libil under MIT.

## Out of scope for 1.0

Additional dialects (Malang has documented variants beyond plain reversal;
Bandung and Jakarta prokem are different systems), a browser UI beyond the
existing demo, and any attempt to make Semarang's medial-`h` insertion
reversible.
