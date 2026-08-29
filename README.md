# prokem

**English** · [Bahasa Indonesia](README.id.md)

Converts Indonesian and Javanese text into four secret languages, and back.

## What this is

*Prokem* is the Indonesian word for an argot — a way of speaking built to be
opaque to outsiders. The word is an example of the thing it names: it comes
from *préman*, "street tough", chopped up and rebuilt around an inserted
*-ok-*, the same pattern that turned *bapak* into *bokap* and gave a generation
of Jakarta slang its shape.

Across Java the most durable of these argots work by *walikan* — "reversal",
from the Javanese *walik*, to turn something over. A word is put through one
fixed transformation and comes out unreadable to anyone who does not know the
rule, and perfectly ordinary to anyone who does. Each city settled on a
different rule, so the transformation doubles as a badge of where you are from:
Yogyakarta swaps letters across the twenty-letter hanacaraka alphabet, Malang
reads words back to front, Semarang pairs the same alphabet a different way.

These are not ciphers invented for this package. They are spoken, painted on
shopfronts, and used daily — by traders, by football supporters, by anyone who
wants the person beside them to understand and the person behind them not to.

This package implements four of them, in both directions.

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
| rak | gam | tidak |
| ono | ngotho | ada |
| sikat | jimat | sikat, ambil |
| jalan | sapath | jalan |
| loro | pogo | dua |
| seket | jemet | lima puluh |
| sepuluh | jelupuh | sepuluh |

`rak` and `ono` are separate entries that combine as a phrase: `rak ono` →
`gam ngotho`, "tidak ada".

This code appeared among the *gali* of Semarang in the 1970s and 80s around
Terminal Terboyo, Pasar Johar and Pelabuhan Tanjung Emas, and spread into the
city's everyday slang. The rules follow Samidjan (2013) as quoted in Khoiriyah
(2018), *Bahasa Prokem Semarang atau Basa Walikan dalam Komunikasi di Kota
Semarang*, skripsi UNNES.

### Walikan Jogja

The same twenty letters, paired in parallel instead of reversed: h↔p, n↔dh,
c↔j, r↔y, k↔ny. *matamu* becomes *dagadu*, *mangan* becomes *daladh*.

Yogyakarta's version is the one outsiders are most likely to have met without
knowing it: the local clothing label Dagadu Djokdja takes its name from
*dagadu*, which is simply *matamu*, "your eyes", run through this table.

### Walikan Malang (ngalam)

The aksara of a word are read back to front, so *Malang* becomes *Ngalam* and
*sam* becomes *mas*. Digraphs (ng, ny, th, dh) move as single units.

*Ngalam* is what the city calls itself, and the argot — also known as osob
kiwalan — is commonly traced to fighters during the independence struggle, who
needed a way of speaking that an infiltrator could not follow. It stayed, and
is now ordinary among *arek Malang*.

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

Decoding is pattern-based, not a lookup, so it can occasionally match and
transform an ordinary two-word phrase that was never Unang at all — for
example `unang.decode('untuk menang')` returns `'mentak'`.

## Round-trip fidelity

Decoding recovers the original for every attested word and for the vast
majority of formula-generated ones. Four cases are lossy by construction and
are asserted as known exceptions in the test suite:

- Semarang inserts an `h` between adjacent vowels, and it cannot be told apart
  from a real one afterwards: `amalia` → `ngakapinga` → `amaliha`.
- Semarang's nasal collapse discards the nasal: `ngombe` → `hoce` → `ngobe`.
- In hanacaraka an initial `a` and an initial `ha` are the same aksara, so
  decoding cannot distinguish them.
- A word ending in `y` or `j` encodes to one ending in `t` or `s` (`y→t`,
  `j→s` under the Semarang cipher), and the final-consonant rule then refuses
  to swap either back, since both are in `KEEP_FINAL`: `boy` → `cot` → `bot`.

## Credits

Walikan Jogja and Malang are produced by [libil](https://github.com/libil/libil.js)
(MIT, © 2014 Didiet Noor), wrapped here so output stays identical to the
reference implementation. The decode direction, which libil does not implement,
is this package's own.

MIT
