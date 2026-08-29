# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Static, single-page converter for two Indonesian/Javanese word games: **walikan
Semarang** (boso gali) and **bahasa Unang**. Two files, zero dependencies, no
build step, no package.json, no test framework.

## Commands

```bash
open index.html                 # run the app (no server needed)
python3 -m http.server 8000     # if a real origin is wanted

# main.js also loads under Node (module.exports guard at the bottom) —
# this is the only way to test:
node -e "const p=require('./main.js');
  console.log(p.convert('mangan bapak','encode'));
  console.log(p.convert('kahath calam','decode'));
  console.log(p.convert('hancur','unang-encode'));
  console.log(p.convert('uncar hanung','unang-decode'));"
```

## Architecture

`index.html` is markup + inline handlers only; all logic is in `main.js`, plain
ES5 with top-level globals loaded via `<script src>`. `convertInput()`,
`swapDirection()` are wired through `onchange`/`oninput` attributes — they must
stay global function declarations (no modules, no bundler, no `const`/arrow
rewrite unless the handlers are rewired too).

`convert(text, mode)` is the single dispatcher; mode is `lang + direction`
composed in `convertInput()` (`encode`, `decode`, `unang-encode`,
`unang-decode`). `mapWords()` splits on `/([A-Za-z]+)/` so punctuation, spacing
and leading capitals survive — every per-word converter goes through it, except
Unang decoding, which needs *pairs* of words and therefore has its own walker
(`unangDecodeText`).

### Walikan

Symmetric cipher (an involution): first ten hanacaraka letters swapped with the
last ten reversed, so `applyCipher` serves both directions. Order inside
`encodeWord` is load-bearing:

1. `LEXICON` lookup — attested words win over the formula.
2. Homorganic nasal clusters collapse (`ngg→g`, `mb→b`, …) so `ombe→ngoce`.
3. `h` prefixed to vowel-initial words and inserted between adjacent vowels, so
   every vowel has a consonant partner.
4. `applyCipher`, with `KEEP_FINAL` (t, s, h, ng) left untouched word-finally.

`decodeWord` is the same cipher plus stripping a leading `h`; the inserted
medial `h` is intentionally not removed (indistinguishable from a real one).
`DECODE_LEXICON` is `LEXICON` inverted at load time, seeded with loose spellings.

### Unang

`U(x) (b)n(c)ng`: `UNANG_SPLIT` peels the final syllable plus its preceding
consonant cluster into `x`, the rest is `b`, `c` is the original vowel. `-nya`
is detached first (only when the stem still has two syllables) and re-appended.
`unangDecodePair` returns `null` for anything that isn't a valid pair, which is
how `unangDecodeText` decides to leave text alone.

## Conventions

- Comments and UI text are in Indonesian; keep it that way.
- The vocabulary table and rule prose in `index.html` mirror `LEXICON` and
  `KEEP_FINAL` in `main.js` — change both together.
- Rules trace to Samidjan (2013) via Khoiriyah (2018), UNNES. Attested forms that
  contradict the formula belong in `LEXICON`, not in special-casing the cipher.
