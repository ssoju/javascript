;(function (core, global, undefined) {
    /**
     * 문자열 관련 유틸 함수 모음
     *
     * @namespace
     * @name vcui.string
     */
    core.addon('string', function () {
        var escapeChars = {
                '&': '&amp;',
                '>': '&gt;',
                '<': '&lt;',
                '"': '&quot;',
                "'": '&#39;'
            },
            unescapeChars = (function (escapeChars) {
                var results = {};
                core.each(escapeChars, function (v, k) {
                    results[v] = k;
                });
                return results;
            })(escapeChars),
            escapeRegexp = /[&><'"]/g,
            unescapeRegexp = /\&[^;]+;/g, // /(&amp;|&gt;|&lt;|&quot;|&#39;|&#[0-9]{1,5};)/g,
            tagRegexp = /<\/?[^>]+>/gi,
            scriptRegexp = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/ig,
            hexRegexp = /^\&#x([\da-fA-F]+);$/;

        return /** @lends vcui.string */{
            /**
             * 앞뒤 빈문자열을 제거
             * @param {string} value
             * @return {string}
             * @example
             * vcui.string.trim(" abc "); // 'abc'
             */
            trim: function (value) {
                return value ? value.replace(/^\s+|\s+$/g, "") : value;
            },
            /**
             * 정규식이나 검색문자열을 사용하여 문자열에서 텍스트를 교체
             *
             * @param {string} value 교체를 수행할 문자열
             * @param {RegExp|String} find 검색할 문자열이나 정규식 패턴
             * @param {string} rep 대체할 문자열
             * @param {boolean} isCaseIgnore 대소문자 무시할 것인가
             * @return {string} 대체된 결과 문자열
             *
             * @example
             * vcui.string.replaceAll("a,b,c,d", ',', ''); // "abcd"
             */
            replaceAll: function (value, find, rep, isCaseIgnore) {
                if (find.constructor === RegExp) {
                    return value.replace(new RegExp(find.toString().replace(/^\/|\/$/gi, ""), "g" + (isCaseIgnore ? "i" : "")), rep);
                }
                return value.split(find).join(rep);
            },

            /**
             * 주어진 문자열의 바이트길이 반환
             *
             * @param {string} value 길이를 계산할 문자열
             * @return {number}
             *
             * @example
             * vcui.string.byteLength("동해물과"); // euckr:8byte, utf8:12byte
             */
            byteLength: function (value) {
                if (!value) {
                    return 0;
                }
                return encodeURIComponent(value).replace(/%[A-F\d]{2}/g, 'U').length; // 역시 native가 빨라...ㅋㅋ
            },

            /**
             * 주어진 path에서 확장자를 추출
             * @param {string} fname path문자열
             * @return {string} 확장자
             * @example
             * vcui.string.getFileExt('etc/bin/jslib.js'); // 'js'
             */
            getFileExt: function (fname) {
                fname || (fname = '');
                return fname.substr((~-fname.lastIndexOf(".") >>> 0) + 2);
            },

            /**
             * 주어진 path에서 파일명을 추출
             * @param {string} str path경로
             * @return {string} 경로가 제거된 파일명
             * @example
             * vcui.string.getFileName('etc/bin/jslib.js'); // 'jslib.js'
             */
            getFileName: function (str) {
                var paths = str.split(/\/|\\/g);
                return paths[paths.length - 1];
            },

            /**
             * 주어진 문자열을 지정된 길이만큼 자른 후, 꼬리글을 덧붙여 반환
             *
             * @param {string} value 문자열
             * @param {number} length 잘라낼 길이
             * @param {string} [truncation = '...'] 꼬리글
             * @return {string} 결과 문자열
             *
             * @example
             * vcui.string.cut("동해물과", 3, "..."); // "동..."
             */
            cut: function (value, length, truncation) {
                var str = value;

                truncation || (truncation = '');
                if (str.length > length) {
                    return str.substring(0, length) + truncation;
                }
                return str;
            },

            /**
             * 주어진 문자열을 지정된 길이(바이트)만큼 자른 후, 꼬리글을 덧붙여 반환
             *
             * @param {string} value 문자열
             * @param {number} length 잘라낼 길이
             * @param {string} [truncation = '...'] 꼬리글
             * @return {string} 결과 문자열
             *
             * @example
             * vcui.string.cutByByte("동해물과", 3, "..."); // "동..."
             */
            cutByByte: function (value, length, truncation) {
                var str = value,
                    chars = this.indexByByte(value, length);

                truncation || (truncation = '');
                if (str.length > chars) {
                    return str.substring(0, chars) + truncation;
                }
                return str;
            },

            /**
             * 주어진 바이트길이에 해당하는 char index 반환(UTF-8 상에서 한글은 3바이드로 3바이트로 계산됩니다.)
             *
             * @param {string} value 문자열
             * @param {number} length 제한 문자수
             * @return {number} chars index
             * @example
             * vcui.string.indexByByte("동해물과", 3); // 2
             */
            indexByByte: function (value, length) {
                var len, i, c;
                if (typeof value !== 'string') {
                    return 0;
                }
                for (len = i = 0; c = value.charCodeAt(i++);) {
                    len += c >> 11 ? 3 : c >> 7 ? 2 : 1;
                    if (len > length) {
                        return i > 0 ? i - 1 : 0;
                    }
                }
                return i;
            },

            /**
             * 첫글자를 대문자로 변환하고 이후의 문자들은 소문자로 변환
             *
             * @param {string} value 문자열
             * @return {string} 결과 문자열
             *
             * @example
             * vcui.string.capitalize("abCdEfg"); // "Abcdefg"
             */
            capitalize: function (value) {
                return value ? value.charAt(0).toUpperCase() + value.substring(1) : value;
            },

            /**
             * 카멜 형식으로 변환
             *
             * @param {string} value 문자열
             * @return {string} 결과 문자열
             *
             * @example
             * vcui.string.capitalize("ab-cd-efg"); // "abCdEfg"
             */
            camelize: function (value) {
                return value ? value.replace(/(\-|_|\s)+(.)?/g, function (a, b, c) {
                    return (c ? c.toUpperCase() : '');
                }) : value
            },

            /**
             * 대쉬 형식으로 변환
             *
             * @param {string} value 문자열
             * @return {string} 결과 문자열
             *
             * @example
             * vcui.string.dasherize("abCdEfg"); // "ab-cd-efg"
             */
            dasherize: function (value) {
                return value ? value.replace(/[_\s]+/g, '-').replace(/([A-Z])/g, '-$1').replace(/-+/g, '-').toLowerCase() : value;
            },

            /**
             * 첫글자를 소문자로 변환
             * @param {string} value 문자열
             * @returns {string} 결과 문자열
             * @example
             * vcui.string.toFirstLower("Welcome"); // 'welcome'
             */
            toFirstLower: function (value) {
                return value ? value.replace(/^[A-Z]/, function (s) {
                    return s.toLowerCase();
                }) : value;
            },

            /**
             * 주어진 문자열을 지정한 수만큼 반복하여 조합
             *
             * @param {string} value 문자열
             * @param {number} cnt 반복 횟수
             * @return {string} 결과 문자열
             *
             * @example
             * vcui.string.repeat("ab", 4); // "abababab"
             */
            repeat: function (value, cnt, sep) {
                sep || (sep = '');
                var result = [];

                for (var i = 0; i < cnt; i++) {
                    result.push(value);
                }
                return result.join(sep);
            },

            /**
             * 특수기호를 HTML ENTITY로 변환
             *
             * @param {string} value 특수기호
             * @return {string} 결과 문자열
             *
             * @example
             * vcui.string.escapeHTML('<div><a href="#">링크</a></div>'); // "&lt;div&gt;&lt;a href=&quot;#&quot;&gt;링크&lt;/a&gt;&lt;/div&gt;"
             */
            escapeHTML: function (value) {
                return value ? (value + "").replace(escapeRegexp, function (m) {
                    return escapeChars[m];
                }) : value;
            },

            /**
             * HTML ENTITY로 변환된 문자열을 원래 기호로 변환
             *
             * @param {string} value 문자열
             * @return {string} 결과 문자열
             *
             * @example
             * vcui.string.unescapeHTML('&lt;div&gt;&lt;a href=&quot;#&quot;&gt;링크&lt;/a&gt;&lt;/div&gt;');  // '<div><a href="#">링크</a></div>'
             */
            unescapeHTML: (function () {
                //var temp = document.createElement('div');
                return function (value) {
                    var temp = document.createElement('div');
                    temp.innerHTML = value;
                    var result = '';
                    for (var i = -1, item; item = temp.childNodes[++i];) {
                        result += item.nodeValue;
                    }
                    temp = null;
                    return result;
                };
            })(),
            /*
             // 윗방식이 훨씬 퍼포먼스가 나음....
             unescapeHTML: function (value) {
             return !value ? '' : String(value).replace(unescapeRegexp, function (entityCode) {
             var match;
             if (entityCode in unescapeChars) {
             return unescapeChars[entityCode];
             } else if (match = entityCode.match(hexRegexp)) {
             return String.fromCharCode(parseInt(match[1], 16));
             } else if (match = entityCode.match(/^\&#(\d+)$/)) {
             return String.fromCharCode(~~match[1]);
             } else {
             return entityCode;
             }
             });
             },*/
            /*
             unescapeHTML: function (value) {
             return value ? (value + "").replace(unescapeRegexp, function (m) {
             return unescapeChars[m];
             }) : value;
             },*/

            /**
             * value === these이면 other를,  value !== these 이면 value를 반환
             *
             * @param {string} value 현재 상태값
             * @param {string} these 첫번째 상태값
             * @param {string} other 두번째 상태값
             * @return {string}
             *
             * @example
             * // 정렬버튼에 이용
             * vcui.string.toggle('ASC", "ASC", "DESC"); // "DESC"
             * vcui.string.toggle('DESC", "ASC", "DESC"); // "ASC"
             */
            toggle: function (value, these, other) {
                return these === value ? other : value;
            },

            /**
             * 주어진 문자열에 있는 {인덱스} 부분을 주어진 인수에 해당하는 값으로 치환 후 반환
             *
             * @param {string} format 문자열
             * @param {String|Object} ... 대체할 문자열
             * @return {string} 결과 문자열
             *
             * @example
             * vcui.string.format("{0}:{1}:{2} {0}", "a", "b", "c");  // "a:b:c a"
             * vcui.string.format("{a}:{b}:{c} {d}", {a:"a", b:"b", c:"c", d: "d"});  // "a:b:c a"
             */
            format: function (format, val) {
                var args = core.toArray(arguments).slice(1),
                    isJson = core.type(val, 'object');

                return format.replace(/\{([0-9a-z_]+)\}/ig, function (m, i) {
                    return isJson ? val[i] : args[i] || '';
                });
            },

            /**
             * 문자열을 HTML ENTITIES로 변환
             * @param value
             * @return {string}
             */
            toEntities: function (value) {
                var buffer = [];
                for (var i = 0, len = value.length; i < len; i++) {
                    buffer.push("&#", value.charCodeAt(i).toString(), ";");
                }
                return buffer.join("");
            },

            /**
             * 랜덤문자열 생성
             * @param {number} 길이
             * @return {string} 랜덤문자열
             */
            random: function (len) {
                var keystr = '', x;
                for (var i = 0; i < len; i++) {
                    x = Math.floor((Math.random() * 36));
                    if (x < 10) {
                        keystr += String(x);
                    } else {
                        keystr += String.fromCharCode(x + 87);
                    }
                }
                return keystr;
            },

            /**
             * 주어진 문자열에서 HTML를 제거
             *
             * @param {string} value 문자열
             * @return {string} 태그가 제거된 문자열
             * @example
             * vcui.string.stripTags('welcome to <b>the</b> jungle'); // 'welcome to the jungle'
             */
            stripTags: function (value) {
                return (value || '').toString().replace(tagRegexp, '');
            },

            /**
             * 주어진 문자열에서 스크립트를 제거
             *
             * @param {string} value 문자열
             * @return {string} 스크립트가 제거된 문자열
             * @example
             * vcui.string.stripScripts('welcome <s'+'cript>alert('hello');</s'+'cript> to the jungle'); // 'welcome to the jungle'
             */
            stripScripts: function (value) {
                return (value || '').toString().replace(scriptRegexp, '');
            },

            /**
             * 형식문자열을 주어진 인자값으로 치환하여 반환
             * @function
             * @name vcui.string.sprintf
             * @param {string} str 형식문자열(%d, %f, %s)
             * @param {*=} ... 형식문자열에 지정된 형식에 대치되는 값
             * @example
             * var ret = vcui.string.sprintf('%02d %s', 2, 'abc'); // => '02 abc'
             */
            sprintf: (function () {
                var re = /%%|%(?:(\d+)[\$#])?([+-])?('.|0| )?(\d*)(?:\.(\d+))?([bcdfosuxXhH])/g,
                    core = core;

                // 형식문자열을 파싱
                var s = function () {
                    var args = [].slice.call(arguments, 1);
                    var val = arguments[0];
                    var index = 0;

                    var x;
                    var ins;

                    return val.replace(re, function () {
                        if (arguments[0] == "%%") {
                            return "%";
                        }

                        x = [];
                        for (var i = 0; i < arguments.length; i++) {
                            x[i] = arguments[i] || '';
                        }
                        x[3] = x[3].slice(-1) || ' ';

                        ins = args[+x[1] ? x[1] - 1 : index++];

                        return s[x[6]](ins, x);
                    });
                };

                var pad = function (value, size, ch) {
                    var sign = value < 0 ? '-' : '',
                        result = String(Math.abs(value));

                    ch || (ch = "0");
                    size || (size = 2);

                    if (result.length >= size) {
                        return sign + result.slice(-size);
                    }

                    while (result.length < size) {
                        result = ch + result;
                    }
                    return sign + result;
                };

                // %d 처리
                s.d = s.u = function (ins, x) {
                    return pad(Number(ins).toString(0x0A), x[2] + x[4], x[3]);
                };

                // %f 처리
                s.f = function (ins, x) {
                    var ins = Number(ins);

                    if (x[5]) {
                        ins = ins.toFixed(x[5]);
                    } else if (x[4]) {
                        ins = ins.toExponential(x[4]);
                    } else {
                        ins = ins.toExponential();
                    }

                    x[2] = x[2] == "-" ? "+" : "-";
                    return pad(ins, x[2] + x[4], x[3]);
                };

                // %s 처리
                s.s = function (ins, x) {
                    return ins;
                };

                return s;
            })()

        };
    });
//core.String.bytes = core.String.byteLength;

})(window[LIB_NAME], window);