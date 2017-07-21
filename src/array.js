;(function (core, global, undefined) {
    var arrayProto = Array.prototype;
    var arraySlice = arrayProto.slice;

// 네이티브에 f가 존재하지 않으면 false 반환
    function nativeCall(f) {
        return f ? function (obj) {
            return f.apply(obj, arrayProto.slice.call(arguments, 1));
        } : false;
    }

    /**
     * 배열관련 유틸함수
     * @namespace
     * @name vcui.array
     */
    core.addon('array', /** @lends vcui.array# */{
        /**
         * 배열 병합
         * @param {array} arr 원본 배열
         * @param {...*} var_args 합칠 요소들
         * @return {array} 모두 합쳐진 배열
         * @exmaple
         * var newArray = vcui.array.append([1,2,3], [4,5,6], [6, 7, 8]); // [1,2,3,4,5,6,7,8]
         */
        append: function (arr) {
            var args = arraySlice.call(arguments),
                isUnique = args[args.length - 1] === true,
                result;

            if (isUnique) {
                args.pop();
                result = this.unique(Array.prototype.concat.apply([], args));
            } else {
                result = Array.prototype.concat.apply([], args);
            }
            return result;
        },

        /**
         * 중복되는 배열 요소 제거
         * @param {array} Array 원본 배열
         * @return {array} 중복되는 요소가 제거된 배열
         * @exmaple
         * var arr = vcui.array.unique([1,1,2,2,3,3,4,5]); // [1,2,3,4,5]
         */
        unique: function (array) {
            if (!core.type(array, 'array') || !array.length) {
                return array;
            }
            var result = [];
            for (var i = 0, len = array.length; i < len; i++) {
                if (this.indexOf(result, array[i]) < 0) {
                    result.push(array[i]);
                }
            }
            return result;
        },

        /**
         * 설명하기 어려움 - 인터넷 참조바람
         * @param {array} arr 원본 배열
         * @param {function} callback} 반복자
         * @param {*} initialValue} 초기값
         * @return {*} 초기값
         * @exmaple
         * var arr = vcui.array.reduce([1,2,3], function (prev, cur) {
         *  prev.push(cur);
         *  return prev;
         * }, [0]); // [0, 1, 2, 3]
         */
        reduce: nativeCall(arrayProto.reduce) || function (arr, callback, initialValue) {
            if (!core.type(arr, 'array')) {
                //throw new TypeError('reduce called on null or undefined');
                return initialValue;

            }
            if (typeof callback !== 'function') {
                throw new TypeError(callback + ' is not a function');
            }
            var t = Object(arr), len = t.length >>> 0, k = 0, value;
            if (arguments.length === 3) {
                value = arguments[2];
            } else {
                while (k < len && !(k in t)) {
                    k++;
                }
                if (k >= len) {
                    throw new TypeError('Reduce of empty array with no initial value');
                }
                value = t[k++];
            }
            for (; k < len; k++) {
                if (k in t) {
                    value = callback(value, t[k], k, t);
                }
            }
            return value;
        },

        /**
         * 콜백함수로 하여금 요소를 가공하는 함수
         *
         * @name vcui.array.map
         * @function
         * @param {array} obj 배열
         * @param {arrayCallback} callback 콜백함수
         * @param {object} (optional) 컨텍스트
         * @return {array} 기공된 배열
         *
         * @example
         * vcui.array.map([1, 2, 3], function(item, index) {
		 *		return item * 10;
		 * });
         * // [10, 20, 30]
         */
        map: nativeCall(arrayProto.map) || function (obj, callback, ctx) {
            var results = [];
            if (!core.type(obj, 'array') || !core.type(callback, 'function')) {
                return results;
            }
            // vanilla js~
            for (var i = 0, len = obj.length; i < len; i++) {
                results[results.length] = callback.call(ctx || obj, obj[i], i, obj);
            }
            return results;
        },

        /**
         * 반복자함수의 반환값이 true가 아닐 때까지 반복
         *
         * @name vcui.array.every
         * @function
         * @param {array} arr 배열
         * @param {arrayCallback} callback 함수
         * @return {boolean} 최종 결과
         * @example
         * var sum = 0;
         * vcui.array.every([1, 3, 5, 7], function(val) {
         *     return val > 5;
         * });
         * // 9
         */
        every: nativeCall(arrayProto.every) || function (arr, callback, ctx) {
            var isTrue = true;
            if (!core.type(arr, 'array') || !core.type(callback, 'function')) {
                return isTrue;
            }
            each(arr, function (v, k) {
                if (callback.call(ctx || this, v, k) !== true) {
                    return isTrue = false, false;
                }
            });
            return isTrue;
        },

        /**
         * 반복자함수의 반환값이 true일 때까지 반복
         *
         * @name vcui.array.any
         * @function
         * @param {array} arr 배열
         * @param {arrayCallback} callback 함수
         * @return {boolean} 최종 결과
         * @example
         * var sum = 0;
         * vcui.array.any([1, 3, 5, 7], function(val) {
         *     return val < 5;
         * });
         * // 4
         */
        any: nativeCall(arrayProto.any) || function (arr, callback, ctx) {
            var isTrue = false;
            if (!core.type(arr, 'array') || !core.type(callback, 'function')) {
                return isTrue;
            }
            each(arr, function (v, k) {
                if (callback.call(ctx || this, v, k) === true) {
                    return isTrue = true, false;
                }
            });
            return isTrue;
        },

        /**
         * 배열 요소의 순서를 섞어주는 함수
         *
         * @param {array} obj 배열
         * @return {array} 순서가 섞인 새로운 배열
         * @example
         * vcui.array.shuffle([1, 3, 4, 6, 7, 8]); // [6, 3, 8, 4, 1, 7]
         */
        shuffle: function (obj) {
            var rand,
                index = 0,
                shuffled = [],
                number = core.number;

            each(obj, function (value) {
                rand = number.random(index++);
                shuffled[index - 1] = shuffled[rand], shuffled[rand] = value;
            });
            return shuffled;
        },

        /**
         * 콜백함수로 하여금 요소를 걸려내는 함수
         * @function
         * @name vcui.array.filter
         * @param {array} obj 배열
         * @param {function(value, index)} callback 콜백함수
         * @param {*=} (optional) 컨텍스트
         * @returns {array}
         *
         * @example
         * vcui.array.filter([1, '일', 2, '이', 3, '삼'], function(item, index) {
		 *		return typeof item === 'String';
		 * });
         * // ['일','이','삼']
         */
        filter: nativeCall(arrayProto.filter) || function (obj, callback, ctx) {
            var results = [];
            if (!core.type(obj, 'array') || !core.type(callback, 'function')) {
                return results;
            }
            for (var i = 0, len = obj.length; i < len; i++) {
                callback.call(ctx || obj, obj[i], i, obj) && (results[results.length] = obj[i]);
            }
            return results;
        },

        /**
         * 주어진 배열에 지정된 값이 존재하는지 체크
         * @function
         * @name vcui.array.include
         * @param {array} arr 배열
         * @param {*} value 찾을 값
         * @return {boolean}
         *
         * @example
         * vcui.array.include([1, '일', 2, '이', 3, '삼'], '삼');  // true
         */
        include: function (arr, value, b) {
            if (!core.type(arr, 'array')) {
                return value;
            }
            if (typeof value === 'function') {
                for (var i = 0; i < arr.length; i++) {
                    if (value(arr[i], i) === true) {
                        return true;
                    }
                }
                return false;
            }
            return core.array.indexOf(arr, value, b) > -1;
        },
        
        /**
         * 주어진 배열에 지정된 값이 존재하는지 체크
         * @function
         * @name vcui.array.has
         * @param {array} arr 배열
         * @param {*} value 찾을 값
         * @return {boolean}
         *
         * @example
         * vcui.array.has([1, '일', 2, '이', 3, '삼'], '삼');  // true
         */
        has: function () { return this.include.apply(this, arguments); },

        /**
         * 주어진 인덱스의 요소를 반환
         * @function
         * @name vcui.array.indexOf
         * @param {array} obj 배열
         * @param {*} value 찾을 값
         * @return {number}
         *
         * @example
         * vcui.array.indexOf([1, '일', 2, '이', 3, '삼'], '일');  // 1
         */
        indexOf: nativeCall(arrayProto.indexOf) || function (arr, value, b) {
            for (var i = 0, len = arr.length; i < len; i++) {
                if ((b !== false && arr[i] === value) || (b === false && arr[i] == value)) {
                    return i;
                }
            }
            return -1;
        },

        /**
         * 주어진 배열에서 index에 해당하는 요소를 삭제
         *
         * @param {array} value 배열
         * @param {number} index 삭제할 인덱스 or 요소
         * @return {array} 지정한 요소가 삭제된 배열
         * @example
         * vcui.array.removeAt([1, 2, 3, 4], 1); // [1, 3, 4]
         */
        removeAt: function (value, index) {
            if (!core.type(value, 'array')) {
                return value;
            }
            value.splice(index, 1);
            return value;
        },


        /**
         * 주어진 배열에서 해당하는 요소를 삭제
         *
         * @param {array} value 배열
         * @param {*|function(value, index)} iter 요소 및 필터콜백
         * @return {array} 지정한 요소가 삭제된 배열
         * @example
         * vcui.array.remove(['a', 'b', 'c'], 'b'); // ['a', 'c']
         *
         * vcui.array.remove(['a', 'b', 'c'], function(value){
         *     return value === 'b';
         * }); // ['a', 'c']
         */
        remove: function (value, iter) {
            if (!core.type(value, 'array')) {
                return value;
            }
            if (typeof iter === 'function') {
                for (var i = value.length, item; item = value[--i];) {
                    if (iter(item, i) === true) {
                        value = this.removeAt(value, i);
                    }
                }
                return value;
            } else {
                var index = this.indexOf(value, iter);
                if (index < 0) {
                    return value;
                }
                return this.removeAt(value, index);
            }
        },

        /**
         * 주어진 배열에서 가장 큰 요소를 반환
         *
         * @param {array} Array 배열
         * @return {number} 최대값
         * @example
         * vcui.array.max([2, 1, 3, 5, 2, 8]); // 8
         */
        max: function (array) {
            return Math.max.apply(Math, array);
        },

        /**
         * 주어진 배열에서 가장 작은 요소를 반환
         *
         * @param {array} Array 배열
         * @return {number} 최소값
         * @example
         * vcui.array.min([2, 1, 3, 5, 2, 8]); // 1
         */
        min: function (array) {
            return Math.min.apply(Math, array);
        },

        /**
         * 배열의 요소를 역순으로 재배치
         *
         * @name reverse
         * @param {array} Array 배열
         * @return {array} 역순으로 정렬된 새로운 배열
         * @example
         * vcui.array.reverse([1, 2, 3]); // [3, 2, 1]
         */
        reverse: nativeCall(arrayProto.reverse) || function (array) {
            var tmp = null, first, last;
            var length = array.length;

            for (first = 0, last = length - 1; first < length / 2; first++, last--) {
                tmp = array[first];
                array[first] = array[last];
                array[last] = tmp;
            }

            return array;
        },

        /**
         * 두 배열의 차집합을 반환
         * @param {array} arr1 배열1
         * @param {array} arr2 배열2
         * @returns {array} 차집합 배열
         * @example
         * vcui.array.different([1, 2, 3, 4, 5], [3, 4, 5, 6, 7]); // [1, 2, 6, 7]
         */
        different: function (arr1, arr2) {
            var newArr = [];
            core.each(arr1, function (value) {
                if (core.array.indexOf(arr2, value) < 0) {
                    newArr.push(value);
                }
            });
            core.each(arr2, function (value) {
                if (core.array.indexOf(arr1, value) < 0) {
                    newArr.push(value);
                }
            });
            return newArr;
        },

        /**
         * 배열요소들의 합을 반환
         * @param {array} arr
         * @return {number}
         */
        sum: function (arr) {
            var total = 0;
            core.each(arr, function (val) {
                total += (val | 0);
            });
            return total;
        }
    });

})(window[LIB_NAME], window);