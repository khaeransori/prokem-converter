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

function applyCipher(word) {
    var tokens = tokenize(word);
    var out = '';
    for (var t = 0; t < tokens.length; t++) {
        // vokal dan huruf di luar hanacaraka (f, q, v, x, z) dibiarkan
        out += CIPHER[tokens[t]] || tokens[t];
    }
    // Bunyi /j/ janggal di akhir kata Jawa, dikembalikan menjadi /s/
    // sehingga mas -> kas (bukan "kaj"). Berlaku dua arah: kas -> mas.
    if (out.charAt(out.length - 1) === 'j') {
        out = out.slice(0, -1) + 's';
    }
    return out;
}

function encodeWord(word) {
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

function convert(text, mode) {
    var convertWord = mode === 'decode' ? decodeWord : encodeWord;
    // Hanya rangkaian huruf yang diubah; spasi, angka, dan tanda baca tetap.
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

function convertInput() {
    var mode = document.querySelector('input[name="mode"]:checked').value;
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
        decodeWord: decodeWord
    };
}
