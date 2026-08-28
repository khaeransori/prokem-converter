/**
 * Prokem Semarang (boso gali / basa walikan Semarang) converter — Ver 3.0
 *
 * Rumus (Samidjan 2013, dikutip Khoiriyah 2018, skripsi UNNES):
 * sepuluh aksara Jawa pertama ditukar dengan sepuluh aksara terakhir
 * dalam urutan terbalik. Hanya konsonan yang ditukar, vokal tetap,
 * dan rumusnya simetris (berlaku dua arah).
 *
 *   ha  na  ca  ra  ka  da  ta  sa  wa  la
 *   nga tha ba  ga  ma  nya ya  ja  dha pa
 *
 * Contoh: mangan = ma-nga-n -> ka-ha-th (kahath), mas -> kas
 */

/**
 * Kamus kosakata yang tercatat di sumber (skripsi UNNES, aslisemarang.id,
 * Mojok, Halo Semarang). Dipakai dua arah, dicek sebelum rumus, supaya
 * bentuk yang lazim dipakai selalu keluar persis seperti yang tercatat
 * dan bentuk yang menyimpang dari rumus tetap dikenali.
 */
var LEXICON = {
    mangan:  'kahath',   // makan
    ombe:    'ngoce',    // minum
    turu:    'yugu',     // tidur
    lunga:   'puha',     // pergi
    mas:     'kas',      // mas
    bapak:   'calam',    // bapak
    wedok:   'dhenyom',  // perempuan
    enak:    'ngetham',  // enak
    apik:    'ngalim',   // bagus
    iso:     'ngijo',    // bisa
    ireng:   'ngigeng',  // hitam
    rokok:   'gomom',    // rokok
    kopi:    'moli',     // kopi
    sik:     'jim',      // dulu, sebentar
    rak:     'gam',      // tidak
    ono:     'ngotho',   // ada
    sikat:   'jimat',    // sikat, ambil
    jalan:   'sapath',   // jalan
    loro:    'pogo',     // dua
    seket:   'jemet',    // lima puluh
    sepuluh: 'jelupuh'   // sepuluh
};

// Ejaan longgar yang beredar di masyarakat, hanya dikenali saat decode.
// Skripsi UNNES mencatat "kahath" sering ditulis "kahad"/"kahat".
var DECODE_LEXICON = {
    kahat: 'mangan',
    kahad: 'mangan'
};
(function () {
    for (var word in LEXICON) {
        DECODE_LEXICON[LEXICON[word]] = word;
    }
})();

var LETTERS = ['h','n','c','r','k','d','t','s','w','l','p','dh','j','y','ny','m','g','b','th','ng'];

var CIPHER = {};
for (var i = 0; i < LETTERS.length; i++) {
    CIPHER[LETTERS[i]] = LETTERS[LETTERS.length - 1 - i];
}

var VOWELS = 'aiueo';

function isVowel(ch) {
    return ch !== '' && ch !== undefined && VOWELS.indexOf(ch) !== -1;
}

// Satu token = digraf aksara (ng/ny/th/dh) atau satu huruf.
function tokenize(word) {
    return word.match(/ng|ny|th|dh|[a-z]/g) || [];
}

// Konsonan akhir yang tidak ikut ditukar. Hasil tukarannya janggal atau
// sulit dilafalkan di akhir kata, jadi dalam praktik dibiarkan:
// mas -> kas (bukan "kaj"), sikat -> jimat (bukan "jimay"),
// sepuluh -> jelupuh (bukan "jelupung"), ireng -> ngigeng (bukan "ngigeh").
var KEEP_FINAL = { t: true, s: true, h: true, ng: true };

function applyCipher(word) {
    var tokens = tokenize(word);
    var out = '';
    for (var t = 0; t < tokens.length; t++) {
        if (t === tokens.length - 1 && KEEP_FINAL[tokens[t]]) {
            out += tokens[t];
        } else {
            // vokal dan huruf di luar hanacaraka (f, q, v, x, z) dibiarkan
            out += CIPHER[tokens[t]] || tokens[t];
        }
    }
    return out;
}

function encodeWord(word) {
    // Kosakata yang tercatat di sumber dipakai apa adanya.
    if (LEXICON.hasOwnProperty(word)) {
        return LEXICON[word];
    }

    // Kluster sengau homorgan (mb, nd, ndh, nj, ngg) dibaca satu bunyi;
    // sengaunya luluh sebelum ditukar, sehingga ombe -> ngoce (bukan "ngokce").
    word = word
        .replace(/ngg/g, 'g')
        .replace(/ndh/g, 'dh')
        .replace(/nd/g, 'd')
        .replace(/mb/g, 'b')
        .replace(/nj/g, 'j');

    // Kata berawalan vokal diberi "h" dulu: aku -> haku -> ngamu.
    if (isVowel(word.charAt(0))) {
        word = 'h' + word;
    }

    // Dua vokal berdampingan disisipi "h" supaya tiap vokal punya
    // pasangan konsonan: amalia -> amaliha.
    word = word.replace(/([aiueo])(?=[aiueo])/g, '$1h');

    return applyCipher(word);
}

function decodeWord(word) {
    // Kosakata yang tercatat (termasuk ejaan longgar) dikenali langsung.
    if (DECODE_LEXICON.hasOwnProperty(word)) {
        return DECODE_LEXICON[word];
    }

    // Rumusnya simetris, jadi penukarannya sama dengan encode.
    var out = applyCipher(word);

    // Buang "h" tambahan di depan vokal: ngamu -> haku -> aku.
    // (Dalam hanacaraka bunyi awal a/ha memang setara.)
    if (out.charAt(0) === 'h' && isVowel(out.charAt(1))) {
        out = out.slice(1);
    }

    // Catatan: "h" sisipan di antara dua vokal tidak bisa dibedakan dari
    // "h" asli (mis. bahasa, tahu), jadi tidak dibuang saat decode.
    return out;
}

/* ===================== Bahasa Unang =====================
 *
 * Rumus: U(x) (b)n(c)ng
 *   x = suku kata terakhir yang seluruh vokalnya diubah menjadi 'a';
 *       konsonan tepat sebelum suku kata terakhir ikut masuk ke x
 *   b = kata yang suku kata terakhirnya (beserta konsonan tadi) dihilangkan
 *   c = vokal asli dari suku kata terakhir
 *
 * Contoh: hancur -> uncar hanung, lari -> ura laning,
 *         sebentar -> untar sebenang, bel -> ubal neng (b kosong).
 * Akhiran -nya dipisah dulu lalu ditempel di belakang:
 * sepedanya -> uda sepenangnya.
 */

// Memecah kata menjadi: b + (kluster konsonan + deret vokal terakhir +
// konsonan penutup) = b + x. Kluster konsonan sebelum deret vokal
// terakhir seluruhnya masuk ke x (aturan 1: sebentar -> untar, bukan utar).
var UNANG_SPLIT = /^([a-z]*?)([^aeiou]*[aeiou]+[^aeiou]*)$/;

function unangEncodeWord(word) {
    // Aturan 3: akhiran -nya dipisah dulu, hanya jika sisa katanya masih
    // punya minimal dua suku kata (punya/tanya diperlakukan sebagai akar).
    var nya = '';
    if (/nya$/.test(word)) {
        var stem = word.slice(0, -3);
        if ((stem.match(/[aeiou]+/g) || []).length >= 2) {
            word = stem;
            nya = 'nya';
        }
    }

    var m = word.match(UNANG_SPLIT);
    if (!m) {
        return word + nya; // tanpa vokal, biarkan apa adanya
    }
    var b = m[1];
    var x = m[2];
    var c = x.match(/[aeiou]+/)[0];

    // Aturan 2: kata satu suku kata -> b kosong, kata kedua tinggal n+c+ng.
    return 'u' + x.replace(/[aeiou]/g, 'a') + ' ' + b + 'n' + c + 'ng' + nya;
}

// Kebalikan rumus untuk sepasang kata "u(x) (b)n(c)ng[nya]".
// Mengembalikan null jika pasangan itu bukan bahasa Unang yang sah.
function unangDecodePair(uWord, nWord) {
    if (uWord.charAt(0) !== 'u') {
        return null;
    }
    var nya = '';
    if (/ngnya$/.test(nWord)) {
        nya = 'nya';
        nWord = nWord.slice(0, -3);
    }
    var m = nWord.match(/^([a-z]*?)n([aeiou]+)ng$/);
    if (!m) {
        return null;
    }
    var b = m[1];
    var c = m[2];
    var x = uWord.slice(1);
    if (!/[aeiou]/.test(x)) {
        return null;
    }
    return b + x.replace(/[aeiou]+/, c) + nya;
}

function unangDecodeText(text) {
    var parts = text.split(/([A-Za-z]+)/);
    var out = '';
    for (var i = 0; i < parts.length; i++) {
        var part = parts[i];
        // Pasangan kata hanya dipisah spasi; selain itu dibiarkan.
        if (/^[A-Za-z]+$/.test(part) &&
            i + 2 < parts.length &&
            /^\s+$/.test(parts[i + 1]) &&
            /^[A-Za-z]+$/.test(parts[i + 2])) {
            var decoded = unangDecodePair(part.toLowerCase(), parts[i + 2].toLowerCase());
            if (decoded !== null) {
                if (part.charAt(0) !== part.charAt(0).toLowerCase()) {
                    decoded = decoded.charAt(0).toUpperCase() + decoded.slice(1);
                }
                out += decoded;
                i += 2;
                continue;
            }
        }
        out += part;
    }
    return out;
}

/* ===================== Antarmuka umum ===================== */

// Hanya rangkaian huruf yang diubah; spasi, angka, dan tanda baca tetap.
function mapWords(text, convertWord) {
    return text.split(/([A-Za-z]+)/).map(function (part) {
        if (!/^[A-Za-z]+$/.test(part)) {
            return part;
        }
        var capital = part.charAt(0) !== part.charAt(0).toLowerCase();
        var out = convertWord(part.toLowerCase());
        if (capital && out !== '') {
            out = out.charAt(0).toUpperCase() + out.slice(1);
        }
        return out;
    }).join('');
}

function convert(text, mode) {
    switch (mode) {
    case 'unang-encode':
        return mapWords(text, unangEncodeWord);
    case 'unang-decode':
        return unangDecodeText(text);
    case 'decode':
        return mapWords(text, decodeWord);
    default: // 'encode'
        return mapWords(text, encodeWord);
    }
}

function convertInput() {
    var lang = document.querySelector('input[name="lang"]:checked').value;
    var dir = document.querySelector('input[name="mode"]:checked').value;

    var unang = lang === 'unang';
    document.getElementById('label-encode').textContent =
        unang ? 'Indonesia → Unang' : 'Jawa → Prokem';
    document.getElementById('label-decode').textContent =
        unang ? 'Unang → Indonesia' : 'Prokem → Jawa';

    var mode = (unang ? 'unang-' : '') + dir;
    var text = document.getElementById('input').value;
    document.getElementById('output').textContent = convert(text, mode);
}

function swapDirection() {
    var encode = document.getElementById('mode-encode');
    var decode = document.getElementById('mode-decode');
    var input = document.getElementById('input');
    var output = document.getElementById('output');

    if (encode.checked) {
        decode.checked = true;
    } else {
        encode.checked = true;
    }
    input.value = output.textContent;
    convertInput();
}

// Supaya bisa diuji dengan Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        convert: convert,
        encodeWord: encodeWord,
        decodeWord: decodeWord,
        unangEncodeWord: unangEncodeWord,
        unangDecodePair: unangDecodePair
    };
}
