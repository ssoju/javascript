;(function (core, global, undefined) {
/////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     * 숫자관련 유틸함수 모음
     *
     * @namespace
     * @name vcui.number
     */
    core.addon('number', /** @lends vcui.number */{
        /**
         * 주어진 수를 자릿수만큼 앞자리에 0을 채워서 반환
         *
         * @param {string} value
         * @param {Number=} [size = 2]
         * @param {String=} [ch = '0']
         * @return {string}
         *
         * @example
         * vcui.number.zeroPad(2, 3); // "002"
         */
        zeroPad: function (value, size, ch) {
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
        },

        /**
         * 세자리마다 ,를 삽입, .comma로 해도 됨
         *
         * @function
         * @param {number} value
         * @return {string}
         *
         * @example
         * vcui.number.addComma(21342); // "21,342"
         * // or
         * vcui.number.comma(21342); // 21,342
         */
        addComma: (function () {
            var regComma = /(\d+)(\d{3})/;
            return function (value) {
                value += '';
                var x = value.split('.'),
                    x1 = x[0],
                    x2 = x.length > 1 ? '.' + x[1] : '';

                while (regComma.test(x1)) {
                    x1 = x1.replace(regComma, '$1' + ',' + '$2');
                }
                return x1 + x2;
            };
        })(),

        /**
         * min ~ max사이의 랜덤값 반환
         *
         * @param {number} min 최소값
         * @param {Number=} max 최대값
         * @return {number} 랜덤값
         */
        random: function (min, max) {
            if (!max) {
                max = min;
                min = 0;
            }
            return min + Math.floor(Math.random() * (max - min + 1));
        },

        /**
         * 상하한값을 반환. value가 min보다 작을 경우 min을, max보다 클 경우 max를 반환
         *
         * @param {number} value
         * @param {number} min 최소값
         * @param {number} max 최대값
         * @return {number}
         */
        limit: function (value, min, max) {
            if (value < min) {
                return min;
            }
            else if (value > max) {
                return max;
            }
            return value;
        },

        /**
         * 어떠한 경우에도 숫자로 변환(뒤에 있는 숫자외의 문자를 제거한 후 숫자만 추출)
         * @param {*} value
         * @return {number}
         */
        parse: function (value) {
            value = (value || '').toString().replace(/[^-0-9\.]+/g, '');
            value = value * 1;
            return isNaN(value) ? 0 : value;
        },
        /**
         * 2진수로 변환
         * @param {number} d 숫자값
         * @param {number} bits=8 비트길이 (4 or 8)
         * @return {string}
         */
        toBinary: function (d, bits) {
            var b = [];
            if (!bits) {
                bits = 8;
            }
            while (d > 0) {
                b.unshift(d % 2);
                d >>= 1;
            }
            if (bits) {
                while (b.length < bits) {
                    b.unshift(0);
                }
            }
            return b.join("");
        },
        /**
         * 2진수를 10진수로 변환
         * @param {string} b
         * @return {number}
         */
        fromBinary: function (b) {
            var ba = (b || '').split(""),
                len = ba.length,
                n = 1,
                r = 0;
            for (var i = len - 1; i >= 0; i--) {
                r += n * ba[i];
                n *= 2;
            }
            return r;
        },
        /**
         * 수를 한글로 변환
         * @param {number} num
         * @return {string}
         * @example
         * vcui.number.toKorean(123456); // 십이만삼천사백오십육
         */
        toKorean: function (num) {
            var nums, sign, korName, subUnit, unit, subPos, pos, result, ch;

            if (num == null) {
                return '';
            }
            num = num + '';

            if (num == '0') {
                return '영';
            }
            if (num.substr(0, 1) == '-') {
                sign = '마이너스 ';
                num = num.substr(1);
            }

            nums = num.split('');
            sign = '';
            korName = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
            unit = ['', '만', '억', '조', '경', '해'];
            subUnit = ['', '십', '백', '천'];
            pos = 0;
            subPos = 0;
            result = '';
            ch = '';

            for (var i = nums.length - 1; i >= 0; i--, subPos++) {
                if (subPos > 0 && subPos % 4 === 0) {
                    pos++;
                }
                if (!(ch = korName[nums[i]])) {
                    continue;
                }
                if (subPos % 4 === 0) {
                    result = unit[pos] + result; // 만, 억, 조, 경, 해
                    if (ch === '일' && (i === 0 && pos <= 1)) {
                        ch = '';
                    }
                } else {
                    if (ch === '일') {
                        ch = '';
                    }
                }
                if (ch += subUnit[subPos % 4]) {
                    result = ch + result;
                }
            }
            return sign + result;
        }
    });
    /**
     * vcui.number.zeroPad의 별칭
     * @function
     * @static
     * @name vcui.number.pad
     */
    core.number.pad = core.number.zeroPad;
    /**
     * vcui.number.addComma 별칭
     * @function
     * @static
     * @name vcui.comma
     */
    core.comma = core.number.addComma;
/////////////////////////////////////////////////////////////////////////////////////////////////
})(window[LIB_NAME], window);