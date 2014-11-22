var normal      = ['h','n','c','r','k','d','t','s','w','l','p','dh','j','y','ny','m','g','b','th','ng'];
var walian      = ['ng','th','b','g','m','ny','y','j','dh','p','l','w','s','t','d','k','r','c','n','h'];
var input       = '';
var output      = '';
var splitter    = '';
var result      = '';
var tmpVokal;
var j;
var sentence;

//test test

//Ver 2.2
function convertSentence() {
    sentence = '';
    input = document.getElementById('input').value;
    
    var words = input.split(' ');

    for(var i=0;i<words.length;i++){
        word = fixWord(words[i]);
        convertWord(word);
    }
    document.getElementById('output').innerHTML = sentence;
}

function fixWord (word) {
    // cek dulu apakah huruf depannya vokal
    // jika iya tambahkan h didepannya
    // misal: aku menjadi haku
    if(word.charAt(0)=='a' || word.charAt(0)=='i' || word.charAt(0)=='u' || word.charAt(0)=='e' || word.charAt(0)=='o'){
        word = 'h' + word;
    }

    // kemudian split berdasarkan terlebih dahulu untuk mengecek apakah ada 2 vokal yang berdampingan
    // jika iya tambahkan h diantaranya
    // misal: amalia [ia]
    character   = word.split('');
    tmp         = '';

    for (var current = 0; current < character.length; current++) {
        if (character[current]=='a' || character[current]=='i' || character[current]=='u' || character[current]=='e' || character[current]=='o') {
            next = current + 1;
            if (character[next]=='a' || character[next]=='i' || character[next]=='u' || character[next]=='e' || character[next]=='o') {
                character[current] += 'h';
            }
        }

        tmp += character[current];
    }

    return tmp;
}

function convertWord(word) {
    // inisialisasi variabel
    j           = 0;
    tmpVokal    = '';
    input       = word;
    result      = '';

    splitter = input.split(/[aeiou]/gi);
    
    tmpVokal = input.match(new RegExp(/[aeiou]/gi));
    
    for(var i = 0; i < splitter.length; i++) {
        if (splitter[i].length == 1) {
            changeChar(splitter[i]);
        } else {
            if (splitter[i] == 'th' || splitter[i] == 'dh' || splitter[i] == 'ng' || splitter[i] == 'ny') {
                changeChar(splitter[i]);
            } else {
                splitter[i] = splitter[i].split('');
                changeChar(splitter[i]);
            }
        }
    }
    
    // cek apakah huruf belakangnya th atau dh
    // jika iya hapus h paling belakang
    last_string = result.substring(result.length-2, result.length);
    if (last_string == 'th' || last_string == 'dh') {
        result = result.substring(0, result.length-1);
    }
    
    // cek apakah huruf paling belakangnya adalah j
    // jika iya kembalikan menjadi s
    if(result.charAt(result.length-1)=='j'){
        result = result.substring(0,result.length-1)+'s';
    }
    
    sentence += result+' ';
}

function changeChar(huruf){
    for(var i = 0;i<normal.length;i++){
        if(normal[i] == huruf){
            result += walian[i];
            if(tmpVokal[j] !== undefined){
                result += tmpVokal[j];
                j++;
            }
            break;
        }
    }
}

