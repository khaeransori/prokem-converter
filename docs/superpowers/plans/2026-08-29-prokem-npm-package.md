# prokem npm package Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn this repo into `prokem`, an ESM npm package exposing four secret-language dialects (semarang, unang, jogja, malang) with encode and decode for each.

**Architecture:** One shared hanacaraka engine (`src/hanacaraka.js`) provides the twenty-letter table, the tokenizer, and cipher construction. Semarang and Unang are ported from the existing `main.js` unchanged in behaviour. Jogja and Malang delegate encoding to the `libil` package verbatim so output stays byte-identical to the reference implementation, and supply their own decode, which libil does not have. `src/index.js` composes the four into namespace objects plus a `dialects` record.

**Tech Stack:** Plain ESM JavaScript with JSDoc types, `node:test` + `node:assert/strict`, `libil` 0.1.2 as the only runtime dependency, `typescript` for `.d.ts` emission only, `esbuild` for the browser bundle.

**Spec:** `docs/superpowers/specs/2026-08-29-prokem-npm-package-design.md`

## Global Constraints

- ESM only. `"type": "module"` in package.json. No CJS source, no transpiled JS.
- Node >= 20 (required for stable `node:test` and `node:util` `parseArgs`).
- Exactly one runtime dependency: `"libil": "0.1.2"`, pinned exact, never a range.
- Jogja and Malang **encode** output must be byte-identical to `libil.convert_word` / `libil.convert_word_ngalam`. Never reimplement them.
- Semarang's `KEEP_FINAL` and nasal collapse are Semarang-only. Never applied to jogja or malang.
- Authoring is `.js` with JSDoc annotations. The only TypeScript file permitted is the ambient declaration for libil.
- Every dialect module exports bare `encode(text)` and `decode(text)`, both taking and returning arbitrary text, not single words.
- Package name is `prokem`. License MIT. Credit libil (MIT, Didiet Noor) for jogja and malang.

## Golden vectors (measured, do not recompute)

These were captured from the current `main.js` and from libil 0.1.2 before any
files were deleted. They are the contract for the rewrite.

**Semarang lexicon** (all round-trip exactly):
`mangan→kahath`, `ombe→ngoce`, `turu→yugu`, `lunga→puha`, `mas→kas`,
`bapak→calam`, `wedok→dhenyom`, `enak→ngetham`, `apik→ngalim`, `iso→ngijo`,
`ireng→ngigeng`, `rokok→gomom`, `kopi→moli`, `sik→jim`, `rak ono→gam ngotho`,
`sikat→jimat`, `loro→pogo`, `seket→jemet`, `sepuluh→jelupuh`

**Semarang formula** (non-lexicon):
`aku→ngamu`, `bali→capi`, `kowe→modhe`, `jajan→sasath`,
`amalia→ngakapinga`, `ngombe→hoce`

**Semarang known-lossy round trips** (assert these explicitly, do not "fix"):
- `amalia → ngakapinga → amaliha` — the `h` inserted between two vowels is
  indistinguishable from a real one (`bahasa`, `tahu`).
- `ngombe → hoce → ngobe` — the homorganic nasal collapse (`mb→b`) discards the
  nasal, which decode cannot restore.
- `stripH` cannot tell an original `ha-` from an original `a-`; in hanacaraka
  they are the same aksara.

**Unang:** `hancur→uncar hanung`, `lari→ura laning`, `siapa→upa sianang`,
`sebentar→untar sebenang`, `bel→ubal neng`, `sepedanya→uda sepenangnya`.
All six round-trip exactly.

**Jogja** (libil): `mangan→daladh`, `aku→panyu`, `malang→dangal`, `ombe→podse`,
`iso→pibo`, `enak→pedhany`, `sikat→binyag`, `arema→payeda`, `sam→bad`,
`bapak→sahany`, `kota→nyoga`, `matamu→dagadu`, `ini→pidhi`, `oke→ponye`,
`bali→sangi`, `kowe→nyothe`, `turu→guyu`, `rokok→yonyony`

**Malang** (libil): `mangan→nangam`, `aku→ukah`, `malang→ngalam`, `ombe→ebmoh`,
`iso→osih`, `enak→kaneh`, `sikat→takis`, `arema→amerah`, `sam→mas`,
`bapak→kapab`, `kota→atok`, `matamu→umatam`, `ini→inih`, `oke→ekoh`,
`bali→ilab`, `kowe→ewok`, `turu→urut`, `rokok→kokor`

All 18 jogja and all 18 malang vectors round-trip exactly under the decode
designed in Tasks 5 and 6. This was verified before writing this plan.

**Text handling, current behaviour to preserve:** `Mangan! → Kahath!`,
`mangan, turu → kahath, yugu`, `mangan  turu → kahath  yugu` (double space
kept), `sik 2 menit → jim 2 kethit`.

**Text handling, one deliberate change:** `MANGAN` currently yields `Kahath`;
after Task 2 it yields `KAHATH`. This is the only intentional behavioural
change in the port.

## File structure

| File | Responsibility |
|---|---|
| `src/hanacaraka.js` | The twenty-letter table, tokenizer, cipher construction, `h` prefix/strip. No dialect knowledge. |
| `src/text.js` | `mapWords`: splits text, preserves punctuation and spacing, restores capitalisation. No dialect knowledge. |
| `src/semarang.js` | Reversed pairing, `LEXICON`, `KEEP_FINAL`, nasal collapse. |
| `src/unang.js` | `U(x) (b)n(c)ng` split and its pair-aware decode. |
| `src/jogja.js` | libil encode + `stripH` decode. |
| `src/malang.js` | libil encode + reverse-tokens decode. |
| `src/index.js` | Namespaces, `dialects` record, `LEXICON` re-export. |
| `src/libil.d.ts` | Ambient declaration for the untyped libil package. |
| `bin/prokem.js` | CLI over `dialects`. |
| `test/*.test.js` | One test file per source module. |
| `README.md` | Usage, per-dialect rules, sources, credits. |

---

### Task 1: Package scaffolding and the hanacaraka engine

**Files:**
- Create: `package.json`, `.gitignore`, `src/hanacaraka.js`
- Test: `test/hanacaraka.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces: `LETTERS: string[]` (20 entries), `VOWELS: string`,
  `isVowel(ch: string): boolean`, `tokenize(word: string): string[]`,
  `makeCipher(partner: (i: number) => number): Record<string, string>`,
  `applyCipher(word: string, cipher: Record<string,string>, keepFinal?: Set<string> | null): string`,
  `prefixH(word: string): string`, `stripH(word: string): string`.

Note: adding `"type": "module"` makes the existing `main.js` unloadable by
`require`. That is expected. Every value the port needs from it is already
captured in the "Golden vectors" section above; do not try to run it.

- [ ] **Step 1: Create package.json**

```json
{
  "name": "prokem",
  "version": "0.0.0",
  "description": "Converts Indonesian and Javanese text into walikan Semarang, Jogja, Malang, and bahasa Unang — and back",
  "type": "module",
  "license": "MIT",
  "keywords": ["walikan", "prokem", "semarang", "jogja", "malang", "unang", "javanese", "indonesian"],
  "repository": { "type": "git", "url": "git+https://github.com/khaeransori/prokem-converter.git" },
  "engines": { "node": ">=20" },
  "scripts": {
    "test": "node --test"
  }
}
```

- [ ] **Step 2: Create .gitignore**

```
node_modules/
types/
*.tgz
```

- [ ] **Step 3: Write the failing test**

Create `test/hanacaraka.test.js`:

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  LETTERS, isVowel, tokenize, makeCipher, applyCipher, prefixH, stripH
} from '../src/hanacaraka.js'

const SEMARANG = makeCipher(i => 19 - i)

test('LETTERS holds the twenty hanacaraka consonants, each once', () => {
  assert.equal(LETTERS.length, 20)
  assert.equal(new Set(LETTERS).size, 20)
  assert.equal(LETTERS[0], 'h')
  assert.equal(LETTERS[19], 'ng')
})

test('isVowel accepts the five vowels and nothing else', () => {
  for (const v of 'aiueo') assert.equal(isVowel(v), true)
  for (const c of ['b', 'ng', '', undefined, '1']) assert.equal(isVowel(c), false)
})

test('tokenize keeps the four digraphs together', () => {
  assert.deepEqual(tokenize('mangan'), ['m', 'a', 'ng', 'a', 'n'])
  assert.deepEqual(tokenize('dhenyom'), ['dh', 'e', 'ny', 'o', 'm'])
  assert.deepEqual(tokenize('thole'), ['th', 'o', 'l', 'e'])
})

test('tokenize returns an empty array for text with no letters', () => {
  assert.deepEqual(tokenize(''), [])
  assert.deepEqual(tokenize('!!'), [])
})

test('makeCipher builds an involution over the whole table', () => {
  assert.equal(SEMARANG.h, 'ng')
  assert.equal(SEMARANG.ng, 'h')
  assert.equal(SEMARANG.k, 'm')
  for (const letter of LETTERS) assert.equal(SEMARANG[SEMARANG[letter]], letter)
})

test('makeCipher supports the jogja pairing too', () => {
  const jogja = makeCipher(i => (i + 10) % 20)
  assert.equal(jogja.h, 'p')
  assert.equal(jogja.n, 'dh')
  for (const letter of LETTERS) assert.equal(jogja[jogja[letter]], letter)
})

test('applyCipher swaps consonants and leaves vowels alone', () => {
  assert.equal(applyCipher('bali', SEMARANG), 'capi')
})

test('applyCipher passes through letters outside hanacaraka', () => {
  assert.equal(applyCipher('fax', SEMARANG), 'fax')
})

test('applyCipher honours keepFinal only in final position', () => {
  const keep = new Set(['t', 's', 'h', 'ng'])
  assert.equal(applyCipher('mas', SEMARANG, keep), 'kas')
  assert.equal(applyCipher('mas', SEMARANG), 'kaj')
  assert.equal(applyCipher('sikat', SEMARANG, keep), 'jimat')
  assert.equal(applyCipher('sasat', SEMARANG, keep), 'jajat')
})

test('prefixH adds h only before an initial vowel', () => {
  assert.equal(prefixH('aku'), 'haku')
  assert.equal(prefixH('bali'), 'bali')
  assert.equal(prefixH(''), '')
})

test('stripH removes a leading h only when a vowel follows', () => {
  assert.equal(stripH('haku'), 'aku')
  assert.equal(stripH('bali'), 'bali')
  assert.equal(stripH('h'), 'h')
})

test('stripH is knowingly lossy: initial ha- and a- are one aksara', () => {
  assert.equal(stripH('hana'), 'ana')
})
```

- [ ] **Step 4: Run the test to verify it fails**

Run: `node --test test/hanacaraka.test.js`
Expected: FAIL — `Cannot find module .../src/hanacaraka.js`

- [ ] **Step 5: Write the implementation**

Create `src/hanacaraka.js`:

```js
/**
 * The shared hanacaraka engine: the twenty-letter table, the tokenizer, and
 * cipher construction. Knows nothing about any individual dialect.
 *
 *   ha na ca ra ka da ta sa wa la  pa dha ja ya nya ma ga ba tha nga
 */

/** @type {readonly string[]} */
export const LETTERS = [
  'h', 'n', 'c', 'r', 'k', 'd', 't', 's', 'w', 'l',
  'p', 'dh', 'j', 'y', 'ny', 'm', 'g', 'b', 'th', 'ng'
]

export const VOWELS = 'aiueo'

/**
 * @param {string} [ch]
 * @returns {boolean}
 */
export function isVowel (ch) {
  return typeof ch === 'string' && ch.length === 1 && VOWELS.includes(ch)
}

/**
 * Splits a lowercase word into aksara tokens: a digraph (ng, ny, th, dh)
 * or a single letter.
 * @param {string} word
 * @returns {string[]}
 */
export function tokenize (word) {
  return word.match(/ng|ny|th|dh|[a-z]/g) || []
}

/**
 * Builds a letter-substitution table by pairing each index with partner(index).
 * @param {(index: number) => number} partner
 * @returns {Record<string, string>}
 */
export function makeCipher (partner) {
  /** @type {Record<string, string>} */
  const cipher = {}
  for (let i = 0; i < LETTERS.length; i++) cipher[LETTERS[i]] = LETTERS[partner(i)]
  return cipher
}

/**
 * Substitutes every token through the cipher. Vowels and letters outside
 * hanacaraka (f, q, v, x, z) pass through untouched, as does any token listed
 * in keepFinal when it lands in final position.
 * @param {string} word
 * @param {Record<string, string>} cipher
 * @param {Set<string> | null} [keepFinal]
 * @returns {string}
 */
export function applyCipher (word, cipher, keepFinal = null) {
  const tokens = tokenize(word)
  return tokens
    .map((token, i) =>
      (keepFinal && i === tokens.length - 1 && keepFinal.has(token))
        ? token
        : (cipher[token] || token))
    .join('')
}

/**
 * Vowel-initial words get an h so every vowel has a consonant partner.
 * @param {string} word
 * @returns {string}
 */
export function prefixH (word) {
  return isVowel(word.charAt(0)) ? 'h' + word : word
}

/**
 * Undoes prefixH. Lossy by design: in hanacaraka an initial `a` and an
 * initial `ha` are the same aksara, so `hana` decodes to `ana`.
 * @param {string} word
 * @returns {string}
 */
export function stripH (word) {
  return (word.charAt(0) === 'h' && isVowel(word.charAt(1))) ? word.slice(1) : word
}
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `node --test test/hanacaraka.test.js`
Expected: PASS, 12 tests

- [ ] **Step 7: Commit**

```bash
git add package.json .gitignore src/hanacaraka.js test/hanacaraka.test.js
git commit -m "feat: add the shared hanacaraka engine"
```

---

### Task 2: Text walker

**Files:**
- Create: `src/text.js`
- Test: `test/text.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces: `mapWords(text: string, convertWord: (word: string) => string): string`.
  `convertWord` always receives a lowercase word and its result has the source
  word's capitalisation reapplied.

- [ ] **Step 1: Write the failing test**

Create `test/text.test.js`:

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import { mapWords } from '../src/text.js'

const reverse = word => [...word].reverse().join('')

test('converts each run of letters', () => {
  assert.equal(mapWords('abc', reverse), 'cba')
})

test('preserves punctuation, digits and repeated spaces', () => {
  assert.equal(mapWords('sik, 2  menit!', reverse), 'kis, 2  tinem!')
  assert.equal(mapWords('', reverse), '')
  assert.equal(mapWords('123', reverse), '123')
})

test('preserves newlines', () => {
  assert.equal(mapWords('abc\ndef', reverse), 'cba\nfed')
})

test('restores Title case', () => {
  assert.equal(mapWords('Abc', reverse), 'Cba')
})

test('restores ALL CAPS', () => {
  assert.equal(mapWords('ABC', reverse), 'CBA')
})

test('treats a lone capital letter as Title case, not ALL CAPS', () => {
  assert.equal(mapWords('A', () => 'ngaku'), 'Ngaku')
})

test('leaves lowercase alone', () => {
  assert.equal(mapWords('abc DEF Ghi', reverse), 'cba FED Ihg')
})

test('always hands convertWord a lowercase word', () => {
  const seen = []
  mapWords('ABC Def ghi', word => { seen.push(word); return word })
  assert.deepEqual(seen, ['abc', 'def', 'ghi'])
})

test('tolerates a converter that returns an empty string', () => {
  assert.equal(mapWords('Abc!', () => ''), '!')
})

test('tolerates a converter that returns several words', () => {
  assert.equal(mapWords('Hancur.', () => 'uncar hanung'), 'Uncar hanung.')
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test test/text.test.js`
Expected: FAIL — `Cannot find module .../src/text.js`

- [ ] **Step 3: Write the implementation**

Create `src/text.js`:

```js
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
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test test/text.test.js`
Expected: PASS, 10 tests

- [ ] **Step 5: Commit**

```bash
git add src/text.js test/text.test.js
git commit -m "feat: add the text walker with capitalisation restore"
```

---

### Task 3: Semarang dialect

**Files:**
- Create: `src/semarang.js`
- Test: `test/semarang.test.js`

**Interfaces:**
- Consumes: `makeCipher`, `applyCipher`, `prefixH`, `stripH` from `src/hanacaraka.js`; `mapWords` from `src/text.js`.
- Produces: `encode(text: string): string`, `decode(text: string): string`,
  `LEXICON: Record<string, string>` (Javanese word → prokem word).

Rule order inside encode is load-bearing: lexicon, then nasal collapse, then
`h` prefix and `h` insertion, then the cipher with `KEEP_FINAL`. Changing the
order changes the output.

- [ ] **Step 1: Write the failing test**

Create `test/semarang.test.js`:

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import { encode, decode, LEXICON } from '../src/semarang.js'

const ATTESTED = {
  mangan: 'kahath', ombe: 'ngoce', turu: 'yugu', lunga: 'puha', mas: 'kas',
  bapak: 'calam', wedok: 'dhenyom', enak: 'ngetham', apik: 'ngalim',
  iso: 'ngijo', ireng: 'ngigeng', rokok: 'gomom', kopi: 'moli', sik: 'jim',
  sikat: 'jimat', loro: 'pogo', seket: 'jemet', sepuluh: 'jelupuh'
}

test('encodes every attested lexicon word exactly as recorded', () => {
  for (const [javanese, prokem] of Object.entries(ATTESTED)) {
    assert.equal(encode(javanese), prokem, javanese)
  }
})

test('every attested word round-trips', () => {
  for (const javanese of Object.keys(ATTESTED)) {
    assert.equal(decode(encode(javanese)), javanese, javanese)
  }
})

test('handles the multi-word lexicon entry', () => {
  assert.equal(encode('rak ono'), 'gam ngotho')
  assert.equal(decode('gam ngotho'), 'rak ono')
})

test('applies the formula to words outside the lexicon', () => {
  assert.equal(encode('aku'), 'ngamu')
  assert.equal(encode('bali'), 'capi')
  assert.equal(encode('kowe'), 'modhe')
  assert.equal(encode('jajan'), 'sasath')
})

test('collapses homorganic nasal clusters before swapping', () => {
  assert.equal(encode('ngombe'), 'hoce')
})

test('inserts h so every vowel has a consonant partner', () => {
  assert.equal(encode('amalia'), 'ngakapinga')
})

test('keeps an awkward final consonant rather than swapping it', () => {
  // Non-lexicon words, so these exercise KEEP_FINAL rather than a table lookup.
  assert.equal(encode('wedus'), 'dhenyus')   // final s kept, not swapped to j
  assert.equal(encode('terus'), 'yegus')
  assert.equal(encode('omah'), 'ngokah')     // final h kept
  assert.equal(encode('bareng'), 'cageng')   // final ng kept
})

test('swaps a final consonant that is not awkward', () => {
  assert.equal(encode('montor'), 'kothyog')  // final r swaps to g
})

test('recognises the loose spellings recorded in the source', () => {
  assert.equal(decode('kahat'), 'mangan')
  assert.equal(decode('kahad'), 'mangan')
})

test('known lossy round trip: the inserted medial h cannot be told apart', () => {
  assert.equal(decode(encode('amalia')), 'amaliha')
})

test('known lossy round trip: the nasal collapse discards the nasal', () => {
  assert.equal(decode(encode('ngombe')), 'ngobe')
})

test('preserves punctuation, digits, spacing and case', () => {
  assert.equal(encode('Mangan!'), 'Kahath!')
  assert.equal(encode('mangan, turu'), 'kahath, yugu')
  assert.equal(encode('mangan  turu'), 'kahath  yugu')
  assert.equal(encode('sik 2 menit'), 'jim 2 kethit')
  assert.equal(encode('MANGAN'), 'KAHATH')
})

test('LEXICON is exported, frozen, and contains the attested pairs', () => {
  assert.equal(LEXICON.mangan, 'kahath')
  assert.equal(LEXICON.sepuluh, 'jelupuh')
  assert.equal(Object.isFrozen(LEXICON), true)
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test test/semarang.test.js`
Expected: FAIL — `Cannot find module .../src/semarang.js`

- [ ] **Step 3: Write the implementation**

Create `src/semarang.js`:

```js
/**
 * Walikan Semarang (boso gali).
 *
 * Rumus (Samidjan 2013, dikutip Khoiriyah 2018, skripsi UNNES): sepuluh aksara
 * Jawa pertama ditukar dengan sepuluh aksara terakhir dalam urutan terbalik.
 * Hanya konsonan yang ditukar, vokal tetap, dan rumusnya simetris.
 *
 *   ha  na  ca  ra  ka  da  ta  sa  wa  la
 *   nga tha ba  ga  ma  nya ya  ja  dha pa
 */
import { makeCipher, applyCipher, prefixH, stripH } from './hanacaraka.js'
import { mapWords } from './text.js'

const CIPHER = makeCipher(i => 19 - i)

/**
 * Konsonan akhir yang tidak ikut ditukar: hasil tukarannya janggal di akhir
 * kata, jadi dalam praktik dibiarkan. mas -> kas (bukan "kaj"),
 * sikat -> jimat (bukan "jimay"), sepuluh -> jelupuh, ireng -> ngigeng.
 */
const KEEP_FINAL = new Set(['t', 's', 'h', 'ng'])

/**
 * Kosakata yang tercatat di sumber. Dipakai dua arah dan dicek sebelum rumus,
 * supaya bentuk yang lazim selalu keluar persis seperti yang tercatat dan
 * bentuk yang menyimpang dari rumus tetap dikenali.
 *
 * Frozen: it is part of the public API and consumers must copy rather than
 * mutate it.
 * @type {Readonly<Record<string, string>>}
 */
export const LEXICON = Object.freeze({
  mangan: 'kahath',   // makan
  ombe: 'ngoce',      // minum
  turu: 'yugu',       // tidur
  lunga: 'puha',      // pergi
  mas: 'kas',         // mas
  bapak: 'calam',     // bapak
  wedok: 'dhenyom',   // perempuan
  enak: 'ngetham',    // enak
  apik: 'ngalim',     // bagus
  iso: 'ngijo',       // bisa
  ireng: 'ngigeng',   // hitam
  rokok: 'gomom',     // rokok
  kopi: 'moli',       // kopi
  sik: 'jim',         // dulu, sebentar
  rak: 'gam',         // tidak
  ono: 'ngotho',      // ada
  sikat: 'jimat',     // sikat, ambil
  jalan: 'sapath',    // jalan
  loro: 'pogo',       // dua
  seket: 'jemet',     // lima puluh
  sepuluh: 'jelupuh'  // sepuluh
})

/**
 * Ejaan longgar yang beredar di masyarakat, hanya dikenali saat decode.
 * Skripsi UNNES mencatat "kahath" sering ditulis "kahad"/"kahat".
 * @type {Record<string, string>}
 */
const DECODE_LEXICON = { kahat: 'mangan', kahad: 'mangan' }
for (const [javanese, prokem] of Object.entries(LEXICON)) {
  DECODE_LEXICON[prokem] = javanese
}

/**
 * @param {string} word lowercase
 * @returns {string}
 */
function encodeWord (word) {
  if (Object.hasOwn(LEXICON, word)) return LEXICON[word]

  // Kluster sengau homorgan (mb, nd, ndh, nj, ngg) dibaca satu bunyi;
  // sengaunya luluh sebelum ditukar, sehingga ombe -> ngoce (bukan "ngokce").
  const collapsed = word
    .replace(/ngg/g, 'g')
    .replace(/ndh/g, 'dh')
    .replace(/nd/g, 'd')
    .replace(/mb/g, 'b')
    .replace(/nj/g, 'j')

  // Kata berawalan vokal diberi h (aku -> haku), dan dua vokal berdampingan
  // disisipi h supaya tiap vokal punya pasangan konsonan (amalia -> amaliha).
  const padded = prefixH(collapsed).replace(/([aiueo])(?=[aiueo])/g, '$1h')

  return applyCipher(padded, CIPHER, KEEP_FINAL)
}

/**
 * @param {string} word lowercase
 * @returns {string}
 */
function decodeWord (word) {
  if (Object.hasOwn(DECODE_LEXICON, word)) return DECODE_LEXICON[word]
  // Rumusnya simetris, jadi penukarannya sama dengan encode.
  // Catatan: h sisipan di antara dua vokal tidak bisa dibedakan dari h asli
  // (bahasa, tahu), jadi tidak dibuang.
  return stripH(applyCipher(word, CIPHER, KEEP_FINAL))
}

/** @param {string} text @returns {string} */
export const encode = text => mapWords(text, encodeWord)

/** @param {string} text @returns {string} */
export const decode = text => mapWords(text, decodeWord)
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test test/semarang.test.js`
Expected: PASS, 13 tests

- [ ] **Step 5: Commit**

```bash
git add src/semarang.js test/semarang.test.js
git commit -m "feat: port walikan Semarang onto the shared engine"
```

---

### Task 4: Unang dialect

**Files:**
- Create: `src/unang.js`
- Test: `test/unang.test.js`

**Interfaces:**
- Consumes: `mapWords` from `src/text.js`.
- Produces: `encode(text: string): string`, `decode(text: string): string`.

Unang is not a cipher: it splits one word into two. Decoding therefore consumes
word *pairs* and cannot use `mapWords`; it keeps its own walker over the same
split, and a pair that is not valid Unang is left untouched.

- [ ] **Step 1: Write the failing test**

Create `test/unang.test.js`:

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import { encode, decode } from '../src/unang.js'

const ATTESTED = {
  hancur: 'uncar hanung',
  lari: 'ura laning',
  siapa: 'upa sianang',
  sebentar: 'untar sebenang',
  bel: 'ubal neng',
  sepedanya: 'uda sepenangnya'
}

test('encodes every attested example exactly as recorded', () => {
  for (const [indonesian, unang] of Object.entries(ATTESTED)) {
    assert.equal(encode(indonesian), unang, indonesian)
  }
})

test('every attested example round-trips', () => {
  for (const [indonesian, unang] of Object.entries(ATTESTED)) {
    assert.equal(decode(unang), indonesian, unang)
  }
})

test('a one-syllable word drops the b part', () => {
  assert.equal(encode('bel'), 'ubal neng')
})

test('the consonant before the last syllable joins x', () => {
  assert.equal(encode('sebentar'), 'untar sebenang')
})

test('-nya is detached and reattached', () => {
  assert.equal(encode('sepedanya'), 'uda sepenangnya')
})

test('-nya is treated as part of the root when the stem is one syllable', () => {
  assert.equal(decode(encode('punya')), 'punya')
  assert.equal(decode(encode('tanya')), 'tanya')
})

test('leaves a pair that is not valid Unang untouched', () => {
  assert.equal(decode('mangan turu'), 'mangan turu')
  assert.equal(decode('uncar'), 'uncar')
})

test('preserves punctuation and case', () => {
  assert.equal(encode('Hancur!'), 'Uncar hanung!')
  assert.equal(decode('Uncar hanung!'), 'Hancur!')
})

test('leaves a word with no vowel untouched', () => {
  assert.equal(encode('brr'), 'brr')
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test test/unang.test.js`
Expected: FAIL — `Cannot find module .../src/unang.js`

- [ ] **Step 3: Write the implementation**

Create `src/unang.js`:

```js
/**
 * Bahasa Unang.
 *
 * Rumus: U(x) (b)n(c)ng
 *   x = suku kata terakhir yang seluruh vokalnya diubah menjadi 'a';
 *       konsonan tepat sebelum suku kata terakhir ikut masuk ke x
 *   b = kata yang suku kata terakhirnya (beserta konsonan tadi) dihilangkan
 *   c = vokal asli dari suku kata terakhir
 *
 * hancur -> uncar hanung, lari -> ura laning, sebentar -> untar sebenang,
 * bel -> ubal neng (b kosong), sepedanya -> uda sepenangnya.
 */
import { mapWords } from './text.js'

// b + (kluster konsonan + deret vokal terakhir + konsonan penutup) = b + x.
// Kluster konsonan sebelum deret vokal terakhir seluruhnya masuk ke x,
// sehingga sebentar -> untar, bukan utar.
const SPLIT = /^([a-z]*?)([^aeiou]*[aeiou]+[^aeiou]*)$/

/**
 * @param {string} word lowercase
 * @returns {string}
 */
function encodeWord (word) {
  // Akhiran -nya dipisah dulu, hanya jika sisa katanya masih punya minimal
  // dua suku kata (punya/tanya diperlakukan sebagai akar).
  let stem = word
  let nya = ''
  if (word.endsWith('nya')) {
    const root = word.slice(0, -3)
    if ((root.match(/[aeiou]+/g) || []).length >= 2) {
      stem = root
      nya = 'nya'
    }
  }

  const m = stem.match(SPLIT)
  if (!m) return word // tanpa vokal, biarkan apa adanya

  const [, b, x] = m
  const c = x.match(/[aeiou]+/)[0]
  return 'u' + x.replace(/[aeiou]/g, 'a') + ' ' + b + 'n' + c + 'ng' + nya
}

/**
 * Kebalikan rumus untuk sepasang kata "u(x) (b)n(c)ng[nya]".
 * @param {string} uWord lowercase
 * @param {string} nWord lowercase
 * @returns {string | null} null jika pasangan itu bukan bahasa Unang yang sah
 */
function decodePair (uWord, nWord) {
  if (uWord.charAt(0) !== 'u') return null

  let tail = nWord
  let nya = ''
  if (tail.endsWith('ngnya')) {
    nya = 'nya'
    tail = tail.slice(0, -3)
  }

  const m = tail.match(/^([a-z]*?)n([aeiou]+)ng$/)
  if (!m) return null

  const [, b, c] = m
  const x = uWord.slice(1)
  if (!/[aeiou]/.test(x)) return null

  return b + x.replace(/[aeiou]+/, c) + nya
}

/** @param {string} text @returns {string} */
export const encode = text => mapWords(text, encodeWord)

/**
 * Decoding consumes two whitespace-separated words at a time, so it walks the
 * split itself instead of going through mapWords.
 * @param {string} text
 * @returns {string}
 */
export function decode (text) {
  const parts = text.split(/([A-Za-z]+)/)
  let out = ''
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    const pairable = /^[A-Za-z]+$/.test(part) &&
      i + 2 < parts.length &&
      /^\s+$/.test(parts[i + 1]) &&
      /^[A-Za-z]+$/.test(parts[i + 2])

    if (pairable) {
      const decoded = decodePair(part.toLowerCase(), parts[i + 2].toLowerCase())
      if (decoded !== null) {
        const capital = part.charAt(0) !== part.charAt(0).toLowerCase()
        out += capital ? decoded.charAt(0).toUpperCase() + decoded.slice(1) : decoded
        i += 2
        continue
      }
    }
    out += part
  }
  return out
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test test/unang.test.js`
Expected: PASS, 9 tests

- [ ] **Step 5: Commit**

```bash
git add src/unang.js test/unang.test.js
git commit -m "feat: port bahasa Unang onto the shared text walker"
```

---

### Task 5: Jogja dialect (wraps libil)

**Files:**
- Modify: `package.json` (add the dependency)
- Create: `src/jogja.js`
- Test: `test/jogja.test.js`

**Interfaces:**
- Consumes: `stripH` from `src/hanacaraka.js`; `mapWords` from `src/text.js`; `libil` from npm.
- Produces: `encode(text: string): string`, `decode(text: string): string`.

libil's API, for reference: `libil.convert_word(s)`, `libil.convert_word_ngalam(s)`,
`libil.convert(s, ngalam)`, `libil.tokenize(s)`. It is CommonJS, so a default
import is how ESM reaches it. It has no decode.

Jogja's cipher is an involution, so decoding is the same call plus stripping the
`h` that libil prefixes to vowel-initial words.

- [ ] **Step 1: Install the dependency, pinned exact**

```bash
npm install libil@0.1.2 --save-exact
```

Verify `package.json` now contains `"dependencies": { "libil": "0.1.2" }` with
no caret or tilde.

- [ ] **Step 2: Write the failing test**

Create `test/jogja.test.js`:

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import libil from 'libil'
import { encode, decode } from '../src/jogja.js'

const VECTORS = {
  mangan: 'daladh', aku: 'panyu', malang: 'dangal', ombe: 'podse',
  iso: 'pibo', enak: 'pedhany', sikat: 'binyag', arema: 'payeda',
  sam: 'bad', bapak: 'sahany', kota: 'nyoga', matamu: 'dagadu',
  ini: 'pidhi', oke: 'ponye', bali: 'sangi', kowe: 'nyothe',
  turu: 'guyu', rokok: 'yonyony'
}

test('encodes every vector as libil does', () => {
  for (const [word, expected] of Object.entries(VECTORS)) {
    assert.equal(encode(word), expected, word)
  }
})

test('encode output stays byte-identical to libil itself', () => {
  for (const word of Object.keys(VECTORS)) {
    assert.equal(encode(word), libil.convert_word(word), word)
  }
})

test('every vector round-trips', () => {
  for (const word of Object.keys(VECTORS)) {
    assert.equal(decode(encode(word)), word, word)
  }
})

test('strips the h libil prefixes to vowel-initial words', () => {
  assert.equal(encode('aku'), 'panyu')
  assert.equal(decode('panyu'), 'aku')
})

test('does not apply the Semarang final-consonant rule', () => {
  assert.equal(encode('mas'), 'bad')
  assert.equal(encode('sikat'), 'binyag')
})

test('does not apply the Semarang nasal collapse', () => {
  assert.equal(encode('ombe'), 'podse')
})

test('preserves punctuation, spacing and case', () => {
  assert.equal(encode('Mangan!'), 'Daladh!')
  assert.equal(encode('mangan, turu'), 'daladh, guyu')
  assert.equal(encode('MANGAN'), 'DALADH')
})
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `node --test test/jogja.test.js`
Expected: FAIL — `Cannot find module .../src/jogja.js`

- [ ] **Step 4: Write the implementation**

Create `src/jogja.js`:

```js
/**
 * Walikan Jogja.
 *
 * Encoding delegates to libil (MIT, Didiet Noor) so output stays byte-identical
 * to the reference implementation: the first ten hanacaraka letters are paired
 * with the last ten in the same order (h<->p, n<->dh, c<->j, r<->y, k<->ny).
 *
 * libil has no decode. The pairing is an involution, so decoding is the same
 * substitution followed by stripping the h that libil prefixes to
 * vowel-initial words (aku -> panyu -> haku -> aku).
 */
import libil from 'libil'
import { stripH } from './hanacaraka.js'
import { mapWords } from './text.js'

/** @param {string} text @returns {string} */
export const encode = text => mapWords(text, word => libil.convert_word(word))

/** @param {string} text @returns {string} */
export const decode = text => mapWords(text, word => stripH(libil.convert_word(word)))
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `node --test test/jogja.test.js`
Expected: PASS, 7 tests

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/jogja.js test/jogja.test.js
git commit -m "feat: add walikan Jogja by wrapping libil"
```

---

### Task 6: Malang dialect (wraps libil for encode only)

**Files:**
- Create: `src/malang.js`
- Test: `test/malang.test.js`

**Interfaces:**
- Consumes: `tokenize`, `stripH` from `src/hanacaraka.js`; `mapWords` from `src/text.js`; `libil` from npm.
- Produces: `encode(text: string): string`, `decode(text: string): string`.

Malang reverses the token order rather than substituting letters. Encoding is
libil's, verbatim. Decoding **cannot** reuse libil's function: libil prefixes an
`h` to vowel-initial words, reversal moves that `h` to the end where it is
indistinguishable from a real final `h`, and re-running the function adds a
second prefix (`aku → ukah → hakuh`). Our inverse tokenizes without the prefix,
reverses, then strips a leading `h`: `ukah → haku → aku`.

- [ ] **Step 1: Write the failing test**

Create `test/malang.test.js`:

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import libil from 'libil'
import { encode, decode } from '../src/malang.js'

const VECTORS = {
  mangan: 'nangam', aku: 'ukah', malang: 'ngalam', ombe: 'ebmoh',
  iso: 'osih', enak: 'kaneh', sikat: 'takis', arema: 'amerah',
  sam: 'mas', bapak: 'kapab', kota: 'atok', matamu: 'umatam',
  ini: 'inih', oke: 'ekoh', bali: 'ilab', kowe: 'ewok',
  turu: 'urut', rokok: 'kokor'
}

test('encodes every vector as libil does', () => {
  for (const [word, expected] of Object.entries(VECTORS)) {
    assert.equal(encode(word), expected, word)
  }
})

test('encode output stays byte-identical to libil itself', () => {
  for (const word of Object.keys(VECTORS)) {
    assert.equal(encode(word), libil.convert_word_ngalam(word), word)
  }
})

test('every vector round-trips', () => {
  for (const word of Object.keys(VECTORS)) {
    assert.equal(decode(encode(word)), word, word)
  }
})

test('the city keeps its name both ways', () => {
  assert.equal(encode('malang'), 'ngalam')
  assert.equal(decode('ngalam'), 'malang')
})

test('digraphs survive reversal as single units', () => {
  assert.equal(encode('mangan'), 'nangam')
  assert.equal(encode('kowe'), 'ewok')
})

test('decode is ours because libil re-run does not round-trip', () => {
  const encoded = libil.convert_word_ngalam('aku')
  assert.notEqual(libil.convert_word_ngalam(encoded), 'aku')
  assert.equal(decode(encoded), 'aku')
})

test('preserves punctuation, spacing and case', () => {
  assert.equal(encode('Malang!'), 'Ngalam!')
  assert.equal(encode('mangan, turu'), 'nangam, urut')
  assert.equal(encode('MALANG'), 'NGALAM')
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test test/malang.test.js`
Expected: FAIL — `Cannot find module .../src/malang.js`

- [ ] **Step 3: Write the implementation**

Create `src/malang.js`:

```js
/**
 * Walikan Malang (ngalam / osob kiwalan): the aksara of a word are read back
 * to front, so Malang becomes Ngalam.
 *
 * Encoding delegates to libil (MIT, Didiet Noor) so output stays byte-identical
 * to the reference implementation.
 *
 * Decoding is ours. libil has no decode, and its own function cannot serve as
 * one: it prefixes an h to vowel-initial words, reversal carries that h to the
 * end, and a second call prefixes another (aku -> ukah -> hakuh). Reversing
 * without the prefix and then stripping a leading h recovers the original.
 */
import libil from 'libil'
import { tokenize, stripH } from './hanacaraka.js'
import { mapWords } from './text.js'

/** @param {string} text @returns {string} */
export const encode = text => mapWords(text, word => libil.convert_word_ngalam(word))

/** @param {string} text @returns {string} */
export const decode = text =>
  mapWords(text, word => stripH(tokenize(word).reverse().join('')))
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test test/malang.test.js`
Expected: PASS, 7 tests

- [ ] **Step 5: Commit**

```bash
git add src/malang.js test/malang.test.js
git commit -m "feat: add walikan Malang with an inverse libil never had"
```

---

### Task 7: Public entry point and package exports

**Files:**
- Create: `src/index.js`
- Modify: `package.json` (add `exports`, `files`, `sideEffects`)
- Test: `test/index.test.js`

**Interfaces:**
- Consumes: all four dialect modules.
- Produces: named exports `semarang`, `jogja`, `malang`, `unang` (each a module
  namespace with `encode`/`decode`), `dialects: Record<string, {encode, decode}>`
  keyed by dialect name, and `LEXICON` re-exported from semarang.

- [ ] **Step 1: Write the failing test**

Create `test/index.test.js`:

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import { semarang, jogja, malang, unang, dialects, LEXICON } from '../src/index.js'

test('every dialect is exported with encode and decode', () => {
  for (const dialect of [semarang, jogja, malang, unang]) {
    assert.equal(typeof dialect.encode, 'function')
    assert.equal(typeof dialect.decode, 'function')
  }
})

test('each namespace converts as its own module does', () => {
  assert.equal(semarang.encode('mangan'), 'kahath')
  assert.equal(jogja.encode('mangan'), 'daladh')
  assert.equal(malang.encode('malang'), 'ngalam')
  assert.equal(unang.encode('hancur'), 'uncar hanung')
})

test('each namespace decodes back', () => {
  assert.equal(semarang.decode('kahath'), 'mangan')
  assert.equal(jogja.decode('daladh'), 'mangan')
  assert.equal(malang.decode('ngalam'), 'malang')
  assert.equal(unang.decode('uncar hanung'), 'hancur')
})

test('dialects is keyed by name and holds the same objects', () => {
  assert.deepEqual(Object.keys(dialects).sort(), ['jogja', 'malang', 'semarang', 'unang'])
  assert.equal(dialects.semarang, semarang)
  assert.equal(dialects.jogja.encode('mangan'), 'daladh')
})

test('LEXICON is re-exported from the entry point', () => {
  assert.equal(LEXICON.mangan, 'kahath')
})

test('every dialect round-trips its own encoding', () => {
  for (const [name, dialect] of Object.entries(dialects)) {
    assert.equal(dialect.decode(dialect.encode('mangan')), 'mangan', name)
  }
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test test/index.test.js`
Expected: FAIL — `Cannot find module .../src/index.js`

- [ ] **Step 3: Write the implementation**

Create `src/index.js`:

```js
/**
 * prokem — Indonesian and Javanese secret languages, both directions.
 *
 * Each dialect is a namespace with encode(text) and decode(text). The dialects
 * record is the same four objects keyed by name, for pickers and CLIs.
 */
import * as semarang from './semarang.js'
import * as jogja from './jogja.js'
import * as malang from './malang.js'
import * as unang from './unang.js'

export { semarang, jogja, malang, unang }
export { LEXICON } from './semarang.js'

/** @type {Record<string, { encode: (text: string) => string, decode: (text: string) => string }>} */
export const dialects = { semarang, jogja, malang, unang }
```

- [ ] **Step 4: Add exports, files and sideEffects to package.json**

Merge these keys into `package.json`, keeping the existing ones:

```json
{
  "main": "./src/index.js",
  "sideEffects": false,
  "exports": {
    ".": "./src/index.js",
    "./semarang": "./src/semarang.js",
    "./jogja": "./src/jogja.js",
    "./malang": "./src/malang.js",
    "./unang": "./src/unang.js",
    "./package.json": "./package.json"
  },
  "files": ["src", "bin", "dist", "types", "README.md"]
}
```

The `types` entries are added in Task 10, once the declarations exist.

- [ ] **Step 5: Verify the subpath exports resolve**

```bash
npm pack --dry-run
node --input-type=module -e "
  import('./src/jogja.js').then(m => console.log(m.encode('mangan')))
"
```
Expected: the pack listing includes `src/`, and the import prints `daladh`.

- [ ] **Step 6: Run the whole suite**

Run: `npm test`
Expected: PASS, all files green

- [ ] **Step 7: Commit**

```bash
git add src/index.js package.json test/index.test.js
git commit -m "feat: add the package entry point and subpath exports"
```

---

### Task 8: CLI

**Files:**
- Create: `bin/prokem.js`
- Modify: `package.json` (add `bin`)
- Test: `test/cli.test.js`

**Interfaces:**
- Consumes: `dialects` from `src/index.js`.
- Produces: the `prokem` executable. Contract: `prokem <dialect> [text...] [--decode]`,
  reads stdin when no text positional is given, exits 1 on an unknown dialect
  or with no arguments.

- [ ] **Step 1: Write the failing test**

Create `test/cli.test.js`:

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'

const run = (args, input = '') =>
  execFileSync('node', ['bin/prokem.js', ...args], { input, encoding: 'utf8' })

test('encodes text given as arguments', () => {
  assert.equal(run(['semarang', 'mangan bapak']), 'kahath calam\n')
})

test('joins several text arguments with a space', () => {
  assert.equal(run(['semarang', 'mangan', 'bapak']), 'kahath calam\n')
})

test('decodes with --decode', () => {
  assert.equal(run(['malang', 'ngalam', '--decode']), 'malang\n')
})

test('reads stdin when no text is given', () => {
  assert.equal(run(['jogja'], 'mangan\n'), 'daladh\n')
})

test('supports every dialect', () => {
  assert.equal(run(['unang', 'hancur']), 'uncar hanung\n')
  assert.equal(run(['jogja', 'mangan']), 'daladh\n')
})

test('exits non-zero and names the valid dialects on an unknown one', () => {
  try {
    run(['betawi', 'mangan'])
    assert.fail('expected a non-zero exit')
  } catch (err) {
    assert.equal(err.status, 1)
    assert.match(err.stderr, /unknown dialect/)
    assert.match(err.stderr, /semarang/)
  }
})

test('exits non-zero with usage when given no arguments', () => {
  try {
    run([])
    assert.fail('expected a non-zero exit')
  } catch (err) {
    assert.equal(err.status, 1)
  }
})

test('prints usage and exits zero for --help', () => {
  assert.match(run(['--help']), /Usage: prokem/)
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test test/cli.test.js`
Expected: FAIL — `Cannot find module .../bin/prokem.js`

- [ ] **Step 3: Write the implementation**

Create `bin/prokem.js`:

```js
#!/usr/bin/env node
import { parseArgs } from 'node:util'
import { dialects } from '../src/index.js'

const NAMES = Object.keys(dialects)
const USAGE = `Usage: prokem <${NAMES.join('|')}> [text...] [--decode]

Reads stdin when no text is given.

  prokem semarang "mangan bapak"     kahath calam
  prokem jogja mangan                daladh
  echo ngalam | prokem malang --decode
`

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    decode: { type: 'boolean', default: false },
    help: { type: 'boolean', short: 'h', default: false }
  }
})

if (values.help) {
  process.stdout.write(USAGE)
  process.exit(0)
}

if (positionals.length === 0) {
  process.stderr.write(USAGE)
  process.exit(1)
}

const [name, ...rest] = positionals

if (!Object.hasOwn(dialects, name)) {
  process.stderr.write(`prokem: unknown dialect '${name}'. Try one of: ${NAMES.join(', ')}\n`)
  process.exit(1)
}

/**
 * @returns {Promise<string>}
 */
async function readStdin () {
  process.stdin.setEncoding('utf8')
  let text = ''
  for await (const chunk of process.stdin) text += chunk
  return text
}

const text = rest.length > 0 ? rest.join(' ') : await readStdin()
const convert = values.decode ? dialects[name].decode : dialects[name].encode

process.stdout.write(convert(text.replace(/\n$/, '')) + '\n')
```

- [ ] **Step 4: Make it executable and register it**

```bash
chmod +x bin/prokem.js
```

Add to `package.json`:

```json
{
  "bin": { "prokem": "./bin/prokem.js" }
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `node --test test/cli.test.js`
Expected: PASS, 8 tests

- [ ] **Step 6: Commit**

```bash
git add bin/prokem.js package.json test/cli.test.js
git commit -m "feat: add the prokem CLI"
```

---

### Task 9: README, and removal of the old demo

**Files:**
- Create: `README.md`
- Delete: `main.js`, `index.html`
- Modify: `CLAUDE.md`

Order matters: write `README.md` first, carrying over the prose from
`index.html`, and only then delete. If any wording is needed after deletion,
recover it with `git show HEAD:index.html`.

Everything from `index.html` that must survive is already accounted for: the
lexicon table is `LEXICON` in `src/semarang.js` and asserted in
`test/semarang.test.js`; the Unang examples are asserted in
`test/unang.test.js`; the rule prose and the UNNES citation go into the README
below.

- [ ] **Step 1: Write README.md**

````markdown
# prokem

Converts Indonesian and Javanese text into four secret languages, and back.

```bash
npm install prokem
```

```js
import { semarang, jogja, malang, unang } from 'prokem'

semarang.encode('mangan')      // 'kahath'
semarang.decode('kahath')      // 'mangan'
jogja.encode('mangan')         // 'daladh'
malang.encode('malang')        // 'ngalam'
unang.encode('hancur')         // 'uncar hanung'
unang.decode('uncar hanung')   // 'hancur'
```

Every `encode` and `decode` takes arbitrary text: punctuation, digits, spacing
and capitalisation are preserved, and only runs of letters are converted.

```js
semarang.encode('Mangan sik, 2 menit!')   // 'Kahath jim, 2 kethit!'
```

Import a single dialect when bundle size matters:

```js
import { encode } from 'prokem/jogja'
```

Drive a picker with the `dialects` record:

```js
import { dialects } from 'prokem'
dialects[name].encode(text)   // name: 'semarang' | 'jogja' | 'malang' | 'unang'
```

## CLI

```
$ npx prokem semarang "mangan bapak"
kahath calam
$ echo ngalam | npx prokem malang --decode
malang
```

## Browser

```html
<script src="https://cdn.jsdelivr.net/npm/prokem/dist/prokem.js"></script>
<script>prokem.semarang.encode('mangan')</script>
```

## The dialects

### Walikan Semarang (boso gali)

The first ten hanacaraka letters are swapped with the last ten in reverse
order. Vowels stay, and the formula is symmetric.

```
ha  na  ca  ra  ka  da  ta  sa  wa  la
nga tha ba  ga  ma  nya ya  ja  dha pa
```

A word-final consonant whose swap is awkward to pronounce (t, s, h, ng) is left
alone, so *mas* becomes *kas* rather than "kaj", and *sikat* becomes *jimat*
rather than "jimay". Homorganic nasal clusters (mb, nd, ndh, nj, ngg) count as
one sound and lose the nasal before swapping, so *ombe* becomes *ngoce*.

Attested vocabulary, applied before the formula, is exported as `LEXICON`:

| Javanese | prokem | meaning |
|---|---|---|
| mangan | kahath | makan |
| ombe | ngoce | minum |
| turu | yugu | tidur |
| lunga | puha | pergi |
| mas | kas | mas |
| bapak | calam | bapak |
| wedok | dhenyom | perempuan |
| enak | ngetham | enak |
| apik | ngalim | bagus |
| iso | ngijo | bisa |
| ireng | ngigeng | hitam |
| rokok | gomom | rokok |
| kopi | moli | kopi |
| sik | jim | dulu, sebentar |
| rak ono | gam ngotho | tidak ada |
| sikat | jimat | sikat, ambil |
| loro | pogo | dua |
| seket | jemet | lima puluh |
| sepuluh | jelupuh | sepuluh |

This code appeared among the *gali* of Semarang in the 1970s and 80s around
Terminal Terboyo, Pasar Johar and Pelabuhan Tanjung Emas, and spread into the
city's everyday slang. The rules follow Samidjan (2013) as quoted in Khoiriyah
(2018), *Bahasa Prokem Semarang atau Basa Walikan dalam Komunikasi di Kota
Semarang*, skripsi UNNES.

### Walikan Jogja

The same twenty letters, paired in parallel instead of reversed: h↔p, n↔dh,
c↔j, r↔y, k↔ny. *matamu* becomes *dagadu*, *mangan* becomes *daladh*.

### Walikan Malang (ngalam)

The aksara of a word are read back to front, so *Malang* becomes *Ngalam* and
*sam* becomes *mas*. Digraphs (ng, ny, th, dh) move as single units.

### Bahasa Unang

Each word becomes two, by the formula **U(x) (b)n(c)ng**, where *x* is the last
syllable with every vowel changed to `a` (the consonant immediately before that
syllable joins *x*), *b* is the word without its last syllable, and *c* is the
original vowel. A one-syllable word has no *b*. The suffix *-nya* is detached
first and reattached at the end.

| Indonesian | Unang |
|---|---|
| hancur | uncar hanung |
| lari | ura laning |
| siapa | upa sianang |
| sebentar | untar sebenang |
| bel | ubal neng |
| sepedanya | uda sepenangnya |

## Round-trip fidelity

Decoding recovers the original for every attested word and for the vast
majority of formula-generated ones. Three cases are lossy by construction and
are asserted as known exceptions in the test suite:

- Semarang inserts an `h` between adjacent vowels, and it cannot be told apart
  from a real one afterwards: `amalia` → `ngakapinga` → `amaliha`.
- Semarang's nasal collapse discards the nasal: `ngombe` → `hoce` → `ngobe`.
- In hanacaraka an initial `a` and an initial `ha` are the same aksara, so
  decoding cannot distinguish them.

## Credits

Walikan Jogja and Malang are produced by [libil](https://github.com/libil/libil.js)
(MIT, © 2014 Didiet Noor), wrapped here so output stays identical to the
reference implementation. The decode direction, which libil does not implement,
is this package's own.

MIT
````

- [ ] **Step 2: Verify every README example actually works**

```bash
node --input-type=module -e "
import { semarang, jogja, malang, unang, dialects } from './src/index.js'
import assert from 'node:assert/strict'
assert.equal(semarang.encode('mangan'), 'kahath')
assert.equal(semarang.decode('kahath'), 'mangan')
assert.equal(jogja.encode('mangan'), 'daladh')
assert.equal(malang.encode('malang'), 'ngalam')
assert.equal(unang.encode('hancur'), 'uncar hanung')
assert.equal(unang.decode('uncar hanung'), 'hancur')
assert.equal(semarang.encode('Mangan sik, 2 menit!'), 'Kahath jim, 2 kethit!')
assert.equal(dialects.jogja.encode('mangan'), 'daladh')
console.log('README examples OK')
"
```
Expected: `README examples OK`. If the `Mangan sik, 2 menit!` line disagrees,
fix the README to match the code, not the other way round.

- [ ] **Step 3: Delete the old implementation and demo**

```bash
git rm main.js index.html
```

- [ ] **Step 4: Rewrite CLAUDE.md for the library**

The current `CLAUDE.md` documents a two-file static page and is now entirely
wrong. Replace its body (keep the required header) with:

````markdown
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
````

- [ ] **Step 5: Run the whole suite**

Run: `npm test`
Expected: PASS. Nothing referenced the deleted files.

- [ ] **Step 6: Commit**

```bash
git add README.md CLAUDE.md
git commit -m "docs: add README and remove the superseded demo page"
```

---

### Task 10: Types and browser bundle

**Files:**
- Create: `jsconfig.json`, `src/libil.d.ts`
- Modify: `package.json` (scripts, `types` in exports, devDependencies)
- Test: `test/dist.test.js`

**Interfaces:**
- Consumes: everything.
- Produces: `types/*.d.ts` (generated, gitignored), `dist/prokem.js` (generated, committed).

- [ ] **Step 1: Install the build tools**

```bash
npm install --save-dev typescript esbuild
```

- [ ] **Step 2: Declare the untyped libil package**

Create `src/libil.d.ts` — the one TypeScript file the project permits, because
libil ships no types and `checkJs` cannot resolve it otherwise:

```ts
declare module 'libil' {
  const libil: {
    tokenize (s: string): string[]
    convert_word (s: string): string
    convert_word_ngalam (s: string): string
    convert (s: string, ngalam?: boolean): string
  }
  export default libil
}
```

- [ ] **Step 3: Create jsconfig.json**

```json
{
  "compilerOptions": {
    "allowJs": true,
    "checkJs": true,
    "declaration": true,
    "emitDeclarationOnly": true,
    "outDir": "types",
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "target": "es2022",
    "strict": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*.js", "src/libil.d.ts"]
}
```

- [ ] **Step 4: Add the build scripts**

```json
{
  "scripts": {
    "test": "node --test",
    "types": "tsc -p jsconfig.json",
    "build": "esbuild src/index.js --bundle --format=iife --global-name=prokem --outfile=dist/prokem.js",
    "prepublishOnly": "npm run types && npm run build && npm test"
  }
}
```

- [ ] **Step 5: Run both builds and fix any type errors**

```bash
npm run types
npm run build
```
Expected: `types/*.d.ts` and `dist/prokem.js` both exist. If `tsc` reports
errors, fix the JSDoc annotations in `src/` — do not silence them with `any`
or disable `checkJs`.

- [ ] **Step 6: Write the bundle test**

Create `test/dist.test.js`:

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import vm from 'node:vm'

test('the browser bundle exposes a working global', { skip: !existsSync('dist/prokem.js') }, () => {
  const context = vm.createContext({})
  vm.runInContext(readFileSync('dist/prokem.js', 'utf8'), context)

  assert.equal(context.prokem.semarang.encode('mangan'), 'kahath')
  assert.equal(context.prokem.jogja.encode('mangan'), 'daladh')
  assert.equal(context.prokem.malang.encode('malang'), 'ngalam')
  assert.equal(context.prokem.unang.encode('hancur'), 'uncar hanung')
  assert.deepEqual(Object.keys(context.prokem.dialects).sort(),
    ['jogja', 'malang', 'semarang', 'unang'])
})

test('the bundle inlines libil rather than requiring it', { skip: !existsSync('dist/prokem.js') }, () => {
  assert.doesNotMatch(readFileSync('dist/prokem.js', 'utf8'), /require\(["']libil["']\)/)
})
```

The `skip` guard keeps the suite green on a fresh clone before `npm run build`.

- [ ] **Step 7: Point the exports at the generated types**

Update each `exports` entry in `package.json` to a conditional object:

```json
{
  "exports": {
    ".": { "types": "./types/index.d.ts", "default": "./src/index.js" },
    "./semarang": { "types": "./types/semarang.d.ts", "default": "./src/semarang.js" },
    "./jogja": { "types": "./types/jogja.d.ts", "default": "./src/jogja.js" },
    "./malang": { "types": "./types/malang.d.ts", "default": "./src/malang.js" },
    "./unang": { "types": "./types/unang.d.ts", "default": "./src/unang.js" },
    "./package.json": "./package.json"
  }
}
```

- [ ] **Step 8: Stop ignoring dist, keep ignoring types**

`dist/prokem.js` is committed so CDN consumers can reach it; `types/` is
generated at publish time. Update `.gitignore`:

```
node_modules/
types/
*.tgz
```

(`dist/` must NOT be listed.)

- [ ] **Step 9: Run the whole suite**

Run: `npm test`
Expected: PASS, every test file green, including `test/dist.test.js`.

- [ ] **Step 10: Verify the published shape**

```bash
npm pack --dry-run
```
Expected: the listing contains `src/`, `bin/`, `dist/prokem.js`, `types/`,
`README.md`, `package.json` — and does **not** contain `test/`, `docs/`,
`jsconfig.json`, or `node_modules/`.

- [ ] **Step 11: Commit**

```bash
git add jsconfig.json src/libil.d.ts package.json package-lock.json .gitignore dist/prokem.js test/dist.test.js
git commit -m "build: emit types and a browser bundle"
```

---

## Publishing

Publishing is deliberately not a task in this plan: it is an outward-facing,
irreversible action. When the owner is ready, `npm version 1.0.0` then
`npm publish` — `prepublishOnly` regenerates types, rebuilds the bundle, and
runs the suite first. The name `prokem` was unclaimed on npm as of 2026-08-29.
