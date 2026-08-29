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
