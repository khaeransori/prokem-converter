# prokem

[English](README.md) · **Bahasa Indonesia**

Mengubah teks bahasa Indonesia dan Jawa menjadi empat bahasa sandi, dan
mengembalikannya lagi.

## Apa ini

*Prokem* adalah kata Indonesia untuk bahasa sandi — cara bicara yang memang
dirancang supaya tidak dimengerti orang luar. Kata itu sendiri contoh dari hal
yang dinamainya: ia berasal dari *préman*, dipotong lalu disusun ulang di
sekitar sisipan *-ok-*, pola yang sama yang mengubah *bapak* menjadi *bokap*
dan membentuk satu generasi bahasa gaul Jakarta.

Di seluruh Jawa, bahasa sandi yang paling awet bekerja dengan cara *walikan* —
dari kata Jawa *walik*, membalik. Sebuah kata dilewatkan satu rumus tetap, lalu
keluar tidak terbaca bagi yang tidak tahu rumusnya, dan terdengar biasa saja
bagi yang tahu. Tiap kota memilih rumus yang berbeda, sehingga hasilnya
sekaligus menjadi penanda asal: Yogyakarta menukar huruf lewat dua puluh aksara
hanacaraka, Malang membaca kata dari belakang, Semarang memasangkan aksara yang
sama dengan cara lain.

Ini bukan sandi yang dibuat-buat untuk paket ini. Semuanya dipakai bicara,
ditulis di papan toko, dan digunakan sehari-hari — oleh pedagang, oleh suporter
bola, oleh siapa pun yang ingin orang di sebelahnya paham dan orang di
belakangnya tidak.

Paket ini mengimplementasikan empat di antaranya, dua arah.

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

Setiap `encode` dan `decode` menerima teks bebas: tanda baca, angka, spasi, dan
huruf kapital dipertahankan, dan hanya rangkaian huruf yang diubah.

```js
semarang.encode('Mangan sik, 2 menit!')   // 'Kahath jim, 2 kethit!'
```

Impor satu ragam saja kalau ukuran bundel jadi pertimbangan:

```js
import { encode } from 'prokem/jogja'
```

Jalankan pemilih bahasa lewat record `dialects`:

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

## Peramban

```html
<script src="https://cdn.jsdelivr.net/npm/prokem/dist/prokem.js"></script>
<script>prokem.semarang.encode('mangan')</script>
```

## Ragam bahasanya

### Walikan Semarang (boso gali)

Sepuluh aksara Jawa pertama ditukar dengan sepuluh aksara terakhir dalam urutan
terbalik. Vokal tetap, dan rumusnya berlaku dua arah.

```
ha  na  ca  ra  ka  da  ta  sa  wa  la
nga tha ba  ga  ma  nya ya  ja  dha pa
```

Konsonan di akhir kata yang hasil tukarannya janggal dilafalkan (t, s, h, ng)
dibiarkan tetap, sehingga *mas* menjadi *kas*, bukan "kaj", dan *sikat* menjadi
*jimat*, bukan "jimay". Kluster sengau homorgan (mb, nd, ndh, nj, ngg) dibaca
satu bunyi dan sengaunya luluh sebelum ditukar, sehingga *ombe* menjadi
*ngoce*.

Kosakata yang tercatat di sumber, dipakai sebelum rumus, diekspor sebagai
`LEXICON`:

| Jawa | Prokem | Arti |
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

`rak` dan `ono` adalah dua entri terpisah yang bergabung menjadi frasa:
`rak ono` → `gam ngotho`, "tidak ada".

Bahasa sandi ini muncul di kalangan *gali* Semarang era 1970–1980an di sekitar
Terminal Terboyo, Pasar Johar, dan Pelabuhan Tanjung Emas, lalu menyebar
menjadi bahasa gaul warga Semarang. Rumusnya mengikuti Samidjan (2013)
sebagaimana dikutip Khoiriyah (2018), *Bahasa Prokem Semarang atau Basa Walikan
dalam Komunikasi di Kota Semarang*, skripsi UNNES.

### Walikan Jogja

Dua puluh aksara yang sama, tetapi dipasangkan sejajar, bukan dibalik: h↔p,
n↔dh, c↔j, r↔y, k↔ny. *matamu* menjadi *dagadu*, *mangan* menjadi *daladh*.

Versi Yogyakarta ini yang paling mungkin pernah ditemui orang luar tanpa
sadar: label pakaian Dagadu Djokdja mengambil namanya dari *dagadu*, yang tidak
lain adalah *matamu* yang dilewatkan tabel ini.

### Walikan Malang (ngalam)

Aksara dalam satu kata dibaca dari belakang, sehingga *Malang* menjadi *Ngalam*
dan *sam* menjadi *mas*. Digraf (ng, ny, th, dh) berpindah sebagai satu satuan.

*Ngalam* adalah sebutan kota itu untuk dirinya sendiri, dan bahasa sandinya —
dikenal juga sebagai osob kiwalan — lazim dirunut ke para pejuang di masa
revolusi, yang butuh cara bicara yang tidak bisa diikuti penyusup. Cara itu
bertahan, dan kini biasa dipakai *arek Malang*.

### Bahasa Unang

Setiap kata dipecah menjadi dua kata dengan rumus **U(x) (b)n(c)ng**, di mana
*x* adalah suku kata terakhir yang seluruh vokalnya diubah menjadi `a`
(konsonan tepat sebelum suku kata terakhir ikut masuk ke *x*), *b* adalah kata
tanpa suku kata terakhirnya, dan *c* adalah vokal asli suku kata terakhir. Kata
satu suku kata tidak punya *b*. Akhiran *-nya* dipisah dulu lalu ditempel lagi
di belakang.

| Indonesia | Unang |
|---|---|
| hancur | uncar hanung |
| lari | ura laning |
| siapa | upa sianang |
| sebentar | untar sebenang |
| bel | ubal neng |
| sepedanya | uda sepenangnya |

Pembacaan baliknya berdasarkan pola, bukan kamus, sehingga sesekali bisa cocok
dan mengubah frasa dua kata biasa yang sebenarnya bukan Unang sama sekali —
misalnya `unang.decode('untuk menang')` menghasilkan `'mentak'`.

## Ketepatan dua arah

Decode mengembalikan bentuk asli untuk setiap kata yang tercatat dan untuk
sebagian besar kata hasil rumus. Empat kasus memang kehilangan informasi karena
konstruksinya, dan ditegaskan sebagai pengecualian yang diketahui di dalam
rangkaian tes:

- Semarang menyisipkan `h` di antara dua vokal berdampingan, dan setelahnya
  sisipan itu tidak bisa dibedakan dari `h` asli: `amalia` → `ngakapinga` →
  `amaliha`.
- Peluluhan sengau di Semarang membuang bunyi sengaunya: `ngombe` → `hoce` →
  `ngobe`.
- Dalam hanacaraka, `a` dan `ha` di awal kata adalah aksara yang sama, jadi
  decode tidak bisa membedakannya.
- Kata berakhiran `y` atau `j` menjadi kata berakhiran `t` atau `s` (`y→t`,
  `j→s` pada sandi Semarang), lalu aturan konsonan akhir menolak menukar
  keduanya kembali karena sama-sama ada di `KEEP_FINAL`: `boy` → `cot` →
  `bot`.

## Kredit

Walikan Jogja dan Malang dihasilkan oleh
[libil](https://github.com/libil/libil.js) (MIT, © 2014 Didiet Noor), yang
dibungkus di sini supaya keluarannya tetap sama persis dengan implementasi
acuannya. Arah decode, yang tidak diimplementasikan libil, adalah milik paket
ini sendiri.

MIT
