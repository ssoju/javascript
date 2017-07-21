/**
 * @author comahead@gmail.com
 */
;(function (core, global, undefined) {
    /**
     * JSON객체 관련 유틸함수
     * @namespace
     * @name vcui.object
     */
    core.addon('object', /** @lends vcui.object */{

        /**
         * 개체의 열거가능한 속성 및 메서드 이름을 배열로 반환
         * @name vcui.object.keys
         * @function
         * @param {object} obj 리터럴 객체
         * @return {array} 객체의 열거가능한 속성의 이름이 포함된 배열
         *
         * @example
         * vcui.object.keys({"name": "Axl rose", "age": 50}); // ["name", "age"]
         */
        keys: Object.keys || function (obj) {
            var results = [];
            each(obj, function (v, k) {
                results.push(k);
            });
            return results;
        },

        /**
         * 개체의 열거가능한 속성의 값을 배열로 반환
         * @function
         * @name vcui.object.values
         * @param {object} obj 리터럴 객체
         * @return {array} 객체의 열거가능한 속성의 값들이 포함된 배열
         *
         * @example
         * vcui.object.values({"name": "Axl rose", "age": 50}); // ["Axl rose", 50]
         */
        values: Object.values || function (obj) {
            var results = [];
            each(obj, function (v) {
                results.push(v);
            });
            return results;
        },

        /**
         * 콜백함수로 바탕으로 각 요소를 가공하는 함수
         *
         * @param {object} obj 객체
         * @param {function(value, index)} callback 콜백함수
         * @return {object}
         *
         * @example
         * vcui.object.map({1; 'one', 2: 'two', 3: 'three'}, function(item, key) {
		 *		return item + '__';
		 * });
         * // {1: 'one__', 2: 'two__', 3: 'three__'}
         */
        map: function (obj, callback) {
            if (!core.type(obj, 'object') || !core.type(callback, 'function')) {
                return obj;
            }
            var results = {};
            core.each(obj, function (v, k) {
                results[k] = callback(obj[k], k, obj);
            });
            return results;
        },

        /**
         * 요소가 있는 json객체인지 체크
         *
         * @param {object} obj json객체
         * @return {boolean} 요소가 하나라도 있는지 여부
         * @example
         * var obj1 = {};
         * var obj2 = {"a": "A"}
         * vcui.object.hasItems(obj1); // false
         * vcui.object.hasItems(obj2); // true
         */
        hasItems: function (obj) {
            if (!core.type(obj, 'object')) {
                return false;
            }

            var has = false;
            core.each(obj, function (v) {
                return has = true, false;
            });
            return has;
        },


        /**
         * 객체를 쿼리스크링으로 변환
         *
         * @param {object} obj json객체
         * @param {boolean} [isEncode = true] URL 인코딩할지 여부
         * @return {string} 결과 문자열
         *
         * @example
         * vcui.object.toQueryString({"a":1, "b": 2, "c": {"d": 4}}); // "a=1&b=2&c[d]=4"
         */
        toQueryString: function (params, isEncode) {
            if (typeof params === 'string') {
                return params;
            }
            var queryString = '',
                encode = isEncode === false ? function (v) {
                    return v;
                } : encodeURIComponent;

            core.each(params, function (value, key) {
                if (typeof (value) === 'object') {
                    core.each(value, function (innerValue, innerKey) {
                        if (queryString !== '') {
                            queryString += '&';
                        }
                        queryString += encode(key) + '[' + encode(innerKey) + ']=' + encode(innerValue);
                    });
                } else if (typeof (value) !== 'undefined') {
                    if (queryString !== '') {
                        queryString += '&';
                    }
                    queryString += encode(key) + '=' + encode(value);
                }
            });
            return queryString;
        },

        /**
         * 주어진 json를 키와 요소를 맞바꿔주는 함수
         *
         * @param {object} obj 배열
         * @return {object}
         *
         * @example
         * vcui.object.travere({1:'a', 2:'b', 3:'c', 4:'d'});
         * // {a:1, b:2, c:3, d:4}
         */
        traverse: function (obj) {
            var result = {};
            core.each(obj, function (item, index) {
                result[item] = index;
            });
            return result;
        },

        /**
         * 주어진 리터럴에서 key에 해당하는 요소를 삭제
         *
         * @param {object} value 리터럴
         * @param {string} key 삭제할 키
         * @return 지정한 요소가 삭제된 리터럴
         * @example
         * var obj = {"a": "A", "b": "B"}
         * vcui.object.remove(obj, 'b'); // {"a":"A"} // delete obj.b;로 하는게 더 낫겠네..ㅎ
         */
        remove: function (value, key) {
            if (!core.type(value, 'object')) {
                return value;
            }
            value[key] = null;
            delete value[key];
            return value;
        },

        /**
         * json를 문자열로 변환(JSON을 지원하는 브라우저에서는 JSON.stringify를 사용한다.)
         * @name vcui.object.stringify
         * @param {object} val json 객체
         * @param {object} [opts]
         * @param {boolean} [opts.singleQuotes = false] 문자열을 '로 감쌀것인가
         * @param {string} [opts.indent = '']  들여쓰기 문자(\t or 스페이스)
         * @param {string} [opts.nr = ''] 줄바꿈 문자(\n or 스페이스)
         * @param {string} [pad = ''] 기호와 문자간의 간격
         * @return {string}
         * @example
         * vcui.object.stringify({"a": "A"
         */
        stringify: global.JSON ? JSON.stringify : function (val, opts, pad) {
            var cache = [];
            return (function stringify(val, opts, pad) {
                var objKeys;
                opts = $.extend({}, {
                    singleQuotes: false,
                    indent: '', // '\t'
                    nr: '' // '\n'
                }, opts);
                pad = pad || '';

                if (typeof val === 'number' ||
                    typeof val === 'boolean' ||
                    val === null ||
                    val === undefined) {
                    return val;
                }

                if (typeof val === 'string') {
                    return '"' + val + '"';
                }

                if (val instanceof Date) {
                    return "new Date('" + val.toISOString() + "')";
                }

                if ($.isArray(val)) {
                    if (core.isEmpty(val)) {
                        return '[]';
                    }

                    return '[' + opts.nr + core.array.map(val, function (el, i) {
                            var eol = val.length - 1 === i ? opts.nr : ', ' + opts.nr;
                            return pad + opts.indent + stringify(el, opts, pad + opts.indent) + eol;
                        }).join('') + pad + ']';
                }

                if (core.isPlainObject(val)) {
                    if (core.array.indexOf(cache, val) !== -1) {
                        return null;
                    }

                    if (core.isEmpty(val)) {
                        return '{}';
                    }

                    cache.push(val);

                    objKeys = core.object.keys(val);

                    return '{' + opts.nr + core.array.map(objKeys, function (el, i) {
                            var eol = objKeys.length - 1 === i ? opts.nr : ', ' + opts.nr;
                            var key = /^[^a-z_]|\W+/ig.test(el) && el[0] !== '$' ? stringify(el, opts) : el;
                            return pad + opts.indent + '"' + key + '": ' + stringify(val[el], opts, pad + opts.indent) + eol;
                        }).join('') + pad + '}';
                }

                if (opts.singleQuotes === false) {
                    return '"' + (val + '').replace(/"/g, '\\\"') + '"';
                } else {
                    return "'" + (val + '').replace(/'/g, "\\\'") + "'";
                }
            })(val, opts, pad);
        }
    });
    core.object.has = core.object.hasItems;
    core.json = core.object;

})(window[LIB_NAME], window);
