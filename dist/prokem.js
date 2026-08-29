"use strict";
var prokem = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    try {
      return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    } catch (e) {
      throw mod = 0, e;
    }
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // node_modules/libil/lib/libil.js
  var require_libil = __commonJS({
    "node_modules/libil/lib/libil.js"(exports, module) {
      var Libil = Libil || {};
      Libil.CONSONANT_MAP = [
        "h",
        "n",
        "c",
        "r",
        "k",
        "d",
        "t",
        "s",
        "w",
        "l",
        "p",
        "dh",
        "j",
        "y",
        "ny",
        "m",
        "g",
        "b",
        "th",
        "ng"
      ];
      Libil.inverseCap = function(s) {
        sc = s.slice(1);
        return s.charAt(0).toLowerCase() + sc.toUpperCase();
      };
      Libil.capitalize = function(s) {
        sc = s.slice(1);
        return s.charAt(0).toUpperCase() + sc.toLowerCase();
      };
      Libil.fixCase = function(orig, mapped) {
        if (orig.toLowerCase() == orig) {
          return mapped.toLowerCase();
        } else if (Libil.capitalize(orig) == orig) {
          return Libil.capitalize(mapped);
        } else if (orig.toUpperCase() == orig) {
          return mapped.toUpperCase();
        } else if (Libil.inverseCap(orig) == orig) {
          return Libil.inverseCap(mapped);
        } else {
          return mapped;
        }
      };
      Libil.mapToken = function(t) {
        idx = Libil.CONSONANT_MAP.indexOf(t.toLowerCase());
        if (idx === -1) {
          return t;
        }
        map_idx = -1;
        if (idx <= 9) {
          map_idx = idx + 10;
        } else {
          map_idx = idx - 10;
        }
        return Libil.CONSONANT_MAP[map_idx];
      };
      Libil.mapFixToken = function(t) {
        m = Libil.mapToken(t);
        return Libil.fixCase(t, m);
      };
      Libil.fixSourceVocal = function(s) {
        var vocals = ["a", "i", "u", "e", "o"];
        var pair = s.slice(0, 2);
        var c2 = s.charAt(0);
        if (vocals.indexOf(c2) != -1) {
          if (Libil.capitalize(pair) == pair) {
            return "H" + c2.toLowerCase() + s.slice(1);
          } else if (pair.toUpperCase() == pair) {
            return "H" + s;
          } else {
            return "h" + s;
          }
        } else {
          return s;
        }
      };
      Libil.tokenize = function(s) {
        var w = Libil.fixSourceVocal(s);
        var tokens = [];
        var pair = "";
        if (!s.trim()) {
          return tokens;
        }
        for (var i = 0; i < w.length; ++i) {
          c = w[i];
          pair = w.slice(i, i + 2);
          if (-1 != Libil.CONSONANT_MAP.indexOf(pair.toLowerCase())) {
            ++i;
            tokens.push(pair);
          } else {
            tokens.push(c);
          }
        }
        return tokens;
      };
      Libil.convert_word = function(s) {
        var mappedTokens = Libil.tokenize(s).map(function(t) {
          return Libil.mapFixToken(t);
        });
        return mappedTokens.join("");
      };
      Libil.convert_word_ngalam = function(s) {
        var tokens = Libil.tokenize(s);
        tokens.reverse();
        return Libil.fixCase(s, tokens.join(""));
      };
      Libil.convert = function(s, ngalam) {
        var words = s.split(" ");
        var mappedWords = words.map(ngalam === true ? Libil.convert_word_ngalam : Libil.convert_word);
        return mappedWords.join(" ");
      };
      if (typeof module !== "undefined") {
        module.exports = {
          tokenize: Libil.tokenize,
          convert_word: Libil.convert_word,
          convert_word_ngalam: Libil.convert_word_ngalam,
          convert: Libil.convert
        };
      }
    }
  });

  // src/index.js
  var index_exports = {};
  __export(index_exports, {
    LEXICON: () => LEXICON,
    dialects: () => dialects,
    jogja: () => jogja_exports,
    malang: () => malang_exports,
    semarang: () => semarang_exports,
    unang: () => unang_exports
  });

  // src/semarang.js
  var semarang_exports = {};
  __export(semarang_exports, {
    LEXICON: () => LEXICON,
    decode: () => decode,
    encode: () => encode
  });

  // src/hanacaraka.js
  var LETTERS = [
    "h",
    "n",
    "c",
    "r",
    "k",
    "d",
    "t",
    "s",
    "w",
    "l",
    "p",
    "dh",
    "j",
    "y",
    "ny",
    "m",
    "g",
    "b",
    "th",
    "ng"
  ];
  var VOWELS = "aiueo";
  function isVowel(ch) {
    return typeof ch === "string" && ch.length === 1 && VOWELS.includes(ch);
  }
  function tokenize(word) {
    return word.match(/ng|ny|th|dh|[a-z]/g) || [];
  }
  function makeCipher(partner) {
    const cipher = {};
    for (let i = 0; i < LETTERS.length; i++) cipher[LETTERS[i]] = LETTERS[partner(i)];
    return cipher;
  }
  function applyCipher(word, cipher, keepFinal = null) {
    const tokens = tokenize(word);
    return tokens.map((token, i) => keepFinal && i === tokens.length - 1 && keepFinal.has(token) ? token : cipher[token] || token).join("");
  }
  function prefixH(word) {
    return isVowel(word.charAt(0)) ? "h" + word : word;
  }
  function stripH(word) {
    return word.charAt(0) === "h" && isVowel(word.charAt(1)) ? word.slice(1) : word;
  }

  // src/text.js
  function restoreCase(source, out) {
    if (out === "") return out;
    const isUpper = source === source.toUpperCase() && source !== source.toLowerCase();
    if (isUpper && source.length > 1) return out.toUpperCase();
    if (source.charAt(0) !== source.charAt(0).toLowerCase()) {
      return out.charAt(0).toUpperCase() + out.slice(1);
    }
    return out;
  }
  function mapWords(text, convertWord) {
    return text.split(/([A-Za-z]+)/).map((part) => /^[A-Za-z]+$/.test(part) ? restoreCase(part, convertWord(part.toLowerCase())) : part).join("");
  }

  // src/semarang.js
  var CIPHER = makeCipher((i) => 19 - i);
  var KEEP_FINAL = /* @__PURE__ */ new Set(["t", "s", "h", "ng"]);
  var LEXICON = Object.freeze({
    mangan: "kahath",
    // makan
    ombe: "ngoce",
    // minum
    turu: "yugu",
    // tidur
    lunga: "puha",
    // pergi
    mas: "kas",
    // mas
    bapak: "calam",
    // bapak
    wedok: "dhenyom",
    // perempuan
    enak: "ngetham",
    // enak
    apik: "ngalim",
    // bagus
    iso: "ngijo",
    // bisa
    ireng: "ngigeng",
    // hitam
    rokok: "gomom",
    // rokok
    kopi: "moli",
    // kopi
    sik: "jim",
    // dulu, sebentar
    rak: "gam",
    // tidak
    ono: "ngotho",
    // ada
    sikat: "jimat",
    // sikat, ambil
    jalan: "sapath",
    // jalan
    loro: "pogo",
    // dua
    seket: "jemet",
    // lima puluh
    sepuluh: "jelupuh"
    // sepuluh
  });
  var DECODE_LEXICON = { kahat: "mangan", kahad: "mangan" };
  for (const [javanese, prokem] of Object.entries(LEXICON)) {
    DECODE_LEXICON[prokem] = javanese;
  }
  function encodeWord(word) {
    if (Object.hasOwn(LEXICON, word)) return LEXICON[word];
    const collapsed = word.replace(/ngg/g, "g").replace(/ndh/g, "dh").replace(/nd/g, "d").replace(/mb/g, "b").replace(/nj/g, "j");
    const padded = prefixH(collapsed).replace(/([aiueo])(?=[aiueo])/g, "$1h");
    return applyCipher(padded, CIPHER, KEEP_FINAL);
  }
  function decodeWord(word) {
    if (Object.hasOwn(DECODE_LEXICON, word)) return DECODE_LEXICON[word];
    return stripH(applyCipher(word, CIPHER, KEEP_FINAL));
  }
  var encode = (text) => mapWords(text, encodeWord);
  var decode = (text) => mapWords(text, decodeWord);

  // src/jogja.js
  var jogja_exports = {};
  __export(jogja_exports, {
    decode: () => decode2,
    encode: () => encode2
  });
  var import_libil = __toESM(require_libil(), 1);
  var encode2 = (text) => mapWords(text, (word) => import_libil.default.convert_word(word));
  var decode2 = (text) => mapWords(text, (word) => stripH(import_libil.default.convert_word(word)));

  // src/malang.js
  var malang_exports = {};
  __export(malang_exports, {
    decode: () => decode3,
    encode: () => encode3
  });
  var import_libil2 = __toESM(require_libil(), 1);
  var encode3 = (text) => mapWords(text, (word) => import_libil2.default.convert_word_ngalam(word));
  var decode3 = (text) => mapWords(text, (word) => stripH(tokenize(word).reverse().join("")));

  // src/unang.js
  var unang_exports = {};
  __export(unang_exports, {
    decode: () => decode4,
    encode: () => encode4
  });
  var SPLIT = /^([a-z]*?)([^aeiou]*[aeiou]+[^aeiou]*)$/;
  function encodeWord2(word) {
    let stem = word;
    let nya = "";
    if (word.endsWith("nya")) {
      const root = word.slice(0, -3);
      if ((root.match(/[aeiou]+/g) || []).length >= 2) {
        stem = root;
        nya = "nya";
      }
    }
    const m2 = stem.match(SPLIT);
    if (!m2) return word;
    const [, b, x] = m2;
    const c2 = (
      /** @type {RegExpMatchArray} */
      x.match(/[aeiou]+/)[0]
    );
    return "u" + x.replace(/[aeiou]/g, "a") + " " + b + "n" + c2 + "ng" + nya;
  }
  function decodePair(uWord, nWord) {
    if (uWord.charAt(0) !== "u") return null;
    let tail = nWord;
    let nya = "";
    if (tail.endsWith("ngnya")) {
      nya = "nya";
      tail = tail.slice(0, -3);
    }
    const m2 = tail.match(/^([a-z]*?)n([aeiou]+)ng$/);
    if (!m2) return null;
    const [, b, c2] = m2;
    const x = uWord.slice(1);
    if (!/[aeiou]/.test(x)) return null;
    return b + x.replace(/[aeiou]+/, c2) + nya;
  }
  var encode4 = (text) => mapWords(text, encodeWord2);
  function decode4(text) {
    const parts = text.split(/([A-Za-z]+)/);
    let out = "";
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const pairable = /^[A-Za-z]+$/.test(part) && i + 2 < parts.length && /^\s+$/.test(parts[i + 1]) && /^[A-Za-z]+$/.test(parts[i + 2]);
      if (pairable) {
        const decoded = decodePair(part.toLowerCase(), parts[i + 2].toLowerCase());
        if (decoded !== null) {
          out += restoreCase(part, decoded);
          i += 2;
          continue;
        }
      }
      out += part;
    }
    return out;
  }

  // src/index.js
  var dialects = { semarang: semarang_exports, jogja: jogja_exports, malang: malang_exports, unang: unang_exports };
  return __toCommonJS(index_exports);
})();
