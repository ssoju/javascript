/*!
 * @author comahead@gmail.com
 * @description UI 코어 라이브러리
 * @license MIT License
 */

/*
 *
 */
(function (global) {
    "use strict";
    /* jshint expr: true, validthis: true */
    /* global vcui, alert, escape, unescape */

    /**
     * @callback arrayCallback
     * @param  {*} item - 배열의 요소
     *
     * @param  {number} index   - 배열의 인덱스
     * @param  {array}  Array   - 배열 자신
     * @return {boolean} false를 반환하면 반복을 멈춘다.
     */

    /**
     * 이벤트헨들러
     *
     * @callback eventCallback
     * @param {$.Event} e 이벤트 객체
     * @param {object} [data] 데이타
     */

    var _configs = typeof vcuiConfigs === 'undefined' ? {} : vcuiConfigs;

    window.LIB_NAME = _configs.name || 'axl';
    //window.IMPORT_BASE = configs.importBasePath || '';
    window.IS_DEBUG = _configs.debug || location.href.indexOf('jsdebug=true') >= 0;

    // 프레임웍 이름
    var /** @const */LIB_NAME = global.LIB_NAME || 'vcui';
    if (global[LIB_NAME]) {
        return;
    }

    if (!jQuery) {
        throw new Error("This library requires jQuery");
    }

    // start polyfill
    if (!Function.prototype.bind) {
        /**
         * 함수내의 컨텐스트를 지정
         * @param {object} context 컨텍스트
         * @param {*} ... 두번째 인자부터는 실제로 싱행될 콜백함수로 전달된다.
         * @return {function} 주어진 객체가 켄텍스트로 적용된 함수
         * @example
         * function Test() {
         *      alert(this.name);
         * }.bind({name: 'axl rose'});
         *
         * Test(); -> alert('axl rose');
         */
        Function.prototype.bind = function () {
            var fn = this,
                args = arraySlice.call(arguments),
                object = args.shift();

            return function () {
                // bind로 넘어오는 인자와 원본함수의 인자를 병합하여 넘겨줌.
                var local_args = args.concat(arraySlice.call(arguments));
                if (this !== global) {
                    local_args.push(this);
                }
                return fn.apply(object, local_args);
            };
        };
    }

    if (!global.console) {
        // 콘솔을 지원하지 않는 브라우저를 위해 출력요소를 생성
        (function (global) {
            global.console = {};
            var consoleMethods = ['log', 'info', 'warn', 'error', 'assert', 'dir', 'clear', 'profile', 'profileEnd', 'trace'];
            for (var i = -1, method; method = consoleMethods[++i];) {
                global.console[method] = function () {};
            }
        })(global);
    }

    // end polyfill /////////////////////////////////////

    var root = global.document.documentElement,
        doc = global.document,
        tmpInput = doc.createElement('input'),
        isTouch = ('ontouchstart' in global),
        isMobile = ('orientation' in global) || global.IS_MOBILE === true,
        supportPlaceholder = ('placeholder' in tmpInput),
        arrayProto = Array.prototype,
        objectProto = Object.prototype,
        toString = objectProto.toString,
        hasOwn = objectProto.hasOwnProperty,
        arraySlice = arrayProto.slice,
        globalStyle = '';

    // detect
    globalStyle += ' js';
    isTouch && (globalStyle += ' touch');
    isMobile && (globalStyle += ' mobile');
    root.className += globalStyle;


    /**
     * @namespace
     * @name vcui
     * @description vinylc javascript library
     */
    var core = global[LIB_NAME] || (global[LIB_NAME] = {}),

        // json 객체 여부
        isPlainObject = (function () {
            var o = '[object Object]';

            return (toString.call(null) === o) ? function (value) {
                return value !== null
                    && value !== undefined
                    && toString.call(value) === o
                    && value.ownerDocument === undefined;
            } : function (value) {
                return toString.call(value) === o;
            }
        })(),

        // 타입 체크
        isType = function (value, typeName) {
            var isGet = arguments.length === 1;

            function result(name) {
                return isGet ? name : typeName === name;
            }

            if (value === null) {
                return result('null');
            }

            if (typeof value === undefined) {
                return 'undefined'
            }

            if (value && value.nodeType) {
                if (value.nodeType === 1 || value.nodeType === 9) {
                    return result('element');
                } else if (value && value.nodeType === 3 && value.nodeName === '#text') {
                    return result('textnode');
                }
            }

            if (typeName === 'object' || typeName === 'json') {
                return isGet ? 'object' : isPlainObject(value);
            }

            var s = toString.call(value),
                type = s.match(/\[object (.*?)\]/)[1].toLowerCase();

            if (type === 'number') {
                if (isNaN(value)) {
                    return result('nan');
                }
                if (!isFinite(value)) {
                    return result('infinity');
                }
                return result('number');
            }

            return isGet ? type : type === typeName;
        },

        /**
         * 반복 함수
         * @function
         * @name vcui.each
         * @param {Array|Object} obj 배열 및 json객체
         * @param {arrayCallback} iterater 콜백함수
         * @param {*} [ctx] 컨텍스트
         * @return {*}
         * @example
         * vcui.each({'a': '에이', 'b': '비', 'c': '씨'}, function(value, key) {
         *     alert('key:'+key+', value:'+value);
         *     if(key === 'b') {
         *         return false; // false 를 반환하면 순환을 멈춘다.
         *     }
         * });
         */
        each = function (obj, iterater, ctx) {
            if (!obj) {
                return obj;
            }
            var i = 0,
                len = 0,
                isArr = isArray(obj);

            if (isArr) {
                // 배열
                for (i = 0, len = obj.length; i < len; i++) {
                    if (iterater.call(ctx || obj, obj[i], i, obj) === false) {
                        break;
                    }
                }
            } else {
                // 객체체
                for (i in obj) {
                    if (hasOwn.call(obj, i)) {
                        if (iterater.call(ctx || obj, obj[i], i, obj) === false) {
                            break;
                        }
                    }
                }
            }
            return obj;
        },
        /**
         * 역순 반복 함수(배열만 유효)
         * @function
         * @name vcui.eachReverse
         * @param {array} obj 배열
         * @param {arrayCallback} iterater 콜백함수
         * @param {*} [ctx] 컨텍스트
         * @return {jQuery}
         * @example
         * vcui.eachReverse(['a', '에이', 'b', '비', 'c', '씨'], function(value, key) {
         *     alert('key:'+key+', value:'+value);
         *     if(key === 'b') {
         *         return false; // false 를 반환하면 순환을 멈춘다.
         *     }
         * });
         */
        eachReverse = function (obj, iterater, ctx) {
            if (!obj) {
                return obj;
            }
            var i = 0,
                isArr = isArray(obj);

            if (isArr) {
                for (i = obj.length - 1; i >= 0; i--) {
                    if (iterater.call(ctx || obj, obj[i], i, obj) === false) {
                        break;
                    }
                }
            } else {
                throw new Error('eachReverse 함수는 배열에만 사용할 수 있습니다.');
            }
            return obj;
        },
        /**
         * 객체 확장 함수
         * @function
         * @name vcui.extend
         * @param {object} obj...
         * @return {jQuery}
         * @example
         * var ori = {"a": 'A', "b": [1, 2, 3]};
         * vcui.extend(ori, {
         *    "c": "C"
         * }); // {"a": 'A', "b": [1, 2, 3], "c": "C"}
         */
        extend = function (deep, obj) {
            var args;
            if (deep === true) {
                args = arraySlice.call(arguments, 2);
            } else {
                args = arraySlice.call(arguments, 1);
                obj = deep;
                deep = false;
            }
            each(args, function (source) {
                if (!source) {
                    return;
                }

                each(source, function (val, key) {
                    var isArr = isArray(val);
                    if (deep && (isArr || isPlainObject(val))) {
                        obj[key] || (obj[key] = isArr ? [] : {});
                        obj[key] = extend(deep, obj[key], val);
                    } else {
                        obj[key] = val;
                    }
                });
            });
            return obj;
        },
        /**
         * 객체 복제 함수
         * @function
         * @name vcui.clone
         * @param {object} obj 배열 및 json객체
         * @return {jQuery}
         * @example
         * var ori = {"a": 'A', "b": [1, 2, 3]};
         * var clone = vcui.clone(ori); // {"a": 'A', "b": [1, 2, 3]};
         * // ori 복제본, ori를 변경하여도 clone은 변하지 않는다.
         */
        clone = function (obj) {
            if (null === obj || "object" != typeof obj) return obj;

            var copy;

            if (obj instanceof Date) {
                copy = new Date();
                copy.setTime(obj.getTime());
                return copy;
            }

            if (obj instanceof Array) {
                copy = [];
                for (var i = 0, len = obj.length; i < len; i++) {
                    copy[i] = clone(obj[i]);
                }
                return copy;
            }

            if (obj instanceof Object) {
                copy = {};
                for (var attr in obj) {
                    if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
                }
                return copy;
            }
            throw new Error('oops!! clone is fail');
        },
        _bindType = function (name) {
            return function (val) {
                return isType(val, name);
            };
        },

        // 배열 여부
        isArray = _bindType('array');

    extend(core, {
        name: LIB_NAME,             // 프렘웍 이름
        debug: false,               // 디버깅 여부
        UI_PREFIX: 'vc',            // ui 모듈의 PREFIX
        IS_DEBUG: !!(_configs.debug || global.IS_DEBUG),
        configs: extend(_configs, {
            importBasePath: _configs.importBasePath || '',
            loadMinify: !!_configs.loadMinify
        }),
        each: each,                 // 반복함수
        eachReverse: eachReverse,   // 역순 반복함수
        extend: extend,             // 객체 병합함수
        clone: clone,               // 객체 복제함수
        emptyFn: function () {      // 빈함수
        },
        /**
         * 특정속성을 지원하는지 체크하기 위한 엘리먼트
         * @member
         * @name vcui.tmpInput
         * @example
         * if('placeholder' in vcui.tmpInput) {
         *     alert('placeholder를 지원합니다.');
         * }
         */
        tmpInput: tmpInput,
        /**
         * 특정 css스타일을 지원하는지 체크하기 위한 엘리먼트
         * @member
         * @name vcui.tmpNode
         * @example
         * if('transform' in vcui.tmpNode.style) {
         *     alert('transform를 지원합니다.');
         * }
         */
        tmpNode: doc.createElement('div'),

        /**
         * 타입 체크
         * @function
         * @name vcui.isType
         * @param {*} o 타입을 체크할 값
         * @param {string=} typeName 타입명(null, Number, String, element, nan, infinity, date, Array)
         * @return {boolean|string} typeName이 안넘오면 타입값을 반환해준다.
         * @example
         * vcui.isType('aaaa', 'string'); // true
         * vcui.isType(new Date(), 'date'); // true
         * vcui.isType(1, 'number'); // true
         * vcui.isType(/[a-z]/, 'regexp'); // true
         * vcui.isType(document.getElementById('box'), 'element'); // true
         * vcui.isType({a:'a'}, 'object'); // true
         * vcui.isType([], 'array'); // true
         * vcui.isType(NaN, 'nan'); // true
         * vcui.isType(null, 'null'); // true
         * // 파라미터를 하나만 넘기면 타입명을 반환받을 수 있다.
         * vcui.isType('') // "string"
         * vcui.isType(null) //"null"
         * vcui.isType(1) //"number"
         * vcui.isType({}) //"object"
         * vcui.isType([]) // "array"
         * vcui.isType(undefined) // "undefined"
         * vcui.isType(new Date()) // "date"
         * vcui.isType(/[a-z]/) // "regexp"
         * vcui.isType(document.body) //"element"
         */
        isType: isType,
        /**
         * 타입 체크 vcui.isType의 별칭
         * @function
         * @name vcui.type
         * @param {*} o 타입을 체크할 값
         * @param {String=} typeName 타입명(null, Number, String, element, nan, infinity, date, Array)
         * @return {string|boolean}
         */
        type: isType,

        /**
         * 주어진 값이 함수형인가
         * @function
         * @name vcui.isFunction
         * @param val {function}
         * @return {boolean}
         */
        isFunction: _bindType('function'),

        /**
         * 주어진 값이 문자형인가
         * @function
         * @name vcui.isStrinng
         * @param val {string}
         * @return {boolean}
         */
        isString: _bindType('string'),

        /**
         * 주어진 값이 배열형인가
         * @function
         * @name vcui.isArray
         * @param val {array}
         * @return {boolean}
         */
        isArray: _bindType('array'),

        /**
         * 주어진 값이 숫자형인가
         * @function
         * @name vcui.isNumber
         * @param val {*}
         * @return {boolean}
         */
        isNumber: _bindType('number'),


        /**
         * 주어진 값이 객체형인가
         * @function
         * @name vcui.isObject
         * @param val {*}
         * @return {boolean}
         */
        isObject: _bindType('object'),

        /**
         * undefined 여부 체크
         * @function
         * @name vcui.isUndefined
         * @param value {*}
         * @return {boolean}
         */
        isUndefined: function (value) {
            return typeof value === 'undefined';
        },

        /**
         * 주어진 인자가 빈값인지 체크
         * @function
         * @name vcui.isEmpty
         * @param {*} value 체크할 값(문자열, 객체 등등)
         * @param {boolean} [allowEmptyString = false] 빈문자를 허용할 것인지 여부
         * @return {boolean}
         * @example
         * vcui.isEmpty(null); // true
         * vcui.isEmpty(undefined); // true
         * vcui.isEmpty(''); // true
         * vcui.isEmpty(0); // true
         * vcui.isEmpty(null); // true
         * vcui.isEmpty([]); // true
         * vcui.isEmpty({}); // true
         */
        isEmpty: function (value, allowEmptyString) {
            return (value === null)
                || (value === undefined)
                || (value === 0)
                || (core.isType(value, 'string') && !allowEmptyString ? value === '' : false)
                || (core.isType(value, 'array') && value.length === 0)
                || (core.isType(value, 'object') && !core.object.hasItems(value));
        },

        /**
         * 객체 자체에 주어진 이름의 속성이 있는지 조회
         * @function
         * @name vcui.hasOwn
         * @param {object} obj 객체
         * @param {string} name 키 이름
         * @return {boolean} 키의 존재 여부
         * @example
         * var obj = {"a": "A"}
         * if(vcui.hasOwn(obj, 'a')){
         *     alert('obj객체에 a가 존재합니다.');
         * }
         */
        hasOwn: function (obj, name) {
            return hasOwn.call(obj, name);
        },

        /**
         * 네임스페이스 공간을 생성하고 객체를 설정<br>
         * .를 구분자로 하여 하위 네임스페이스가 생성된다.
         *
         * @function
         * @name vcui.namespace
         *
         * @param {string} name 네임스페이스명
         * @param {Object=} [obj] 지정된 네임스페이스에 등록할 객체, 함수 등
         * @return {object} 생성된 새로운 네임스페이스
         *
         * @example
         * vcui.namesapce('vcui.widget.Tabcontrol', TabControl)
         * // 를 native로 풀면,
         * var vcui = {
         *     widget: {
         *         Tabcontrol: TabControl
         *     }
         * };
         *
         */
        namespace: function (name, obj, ctx) {
            if (typeof name !== 'string') {
                obj && (name = obj);
                return name;
            }

            var root = ctx || global,
                names = name.split('.'),
                i, item;

            if (names[0] === LIB_NAME) {
                names = names.slice(1);
            }

            for (i = -1; item = names[++i];) {
                root = root[item] || (root[item] = {});
            }

            return extend(root, obj || {});
        },

        /**
         * vcui 하위에 name에 해당하는 네임스페이스를 생성하여 object를 설정해주는 함수
         *
         * @function
         * @name vcui.addon
         *
         * @param {string} name .를 구분자로 해서 vcui을 시작으로 하위 네임스페이스를 생성. name이 없으면 vcui에 추가된다.
         * @param {Object|Function} obj
         *
         * @example
         * vcui.addon('urls', {
         *    store: 'Store',
         *    company: 'Company'
         * });
         *
         * alert(vcui.urls.store);
         * alert(vcui.urls.company);
         */
        addon: function (name, object, isExecFn) {
            if (typeof name !== 'string') {
                object = name;
                name = '';
            }

            var root = core,
                names = name ? name.split('.') : [],
                ln = names.length - 1,
                leaf = names[ln];

            if (isExecFn !== false && typeof object === 'function' && !hasOwn.call(object, 'superclass')) {
                object = object.call(root);
            }

            for (var i = 0; i < ln; i++) {
                root = root[names[i]] || (root[names[i]] = {});
            }

            return (leaf && (root[leaf] ? extend(root[leaf], object) : (root[leaf] = object))) || extend(root, object), object;
        },

        /**
         * 브라우저의 Detect 정보: 되도록이면 Modernizr 라이브러리를 사용할 것을 권함
         * @readonly
         * @name vcui.detect
         * @enum {*}
         * @property {boolean} isTouch // 터치디바이스 여부
         * @property {boolean} isRetina // 레티나 여부
         * @property {boolean} isMobile // orientation 작동여부로 판단
         * @property {boolean} isMac // 맥OS
         * @property {boolean} isLinux // 리눅스
         * @property {boolean} isWin // 윈도우즈
         * @property {boolean} is64Bit // 64비트 플랫폼
         * @property {boolean} isIE // IE
         * @property {boolean} ieVersion // IE의 버전
         * @property {boolean} isOpera // 오페라
         * @property {boolean} isChrome // 크롬
         * @property {boolean} isSafari // 사파리
         * @property {boolean} isWebKit // 웹킷
         * @property {boolean} isGecko // 파이어폭스
         * @property {boolean} isIETri4 // IE엔진
         * @property {boolean} isAir // 어도비 에어
         * @property {boolean} isIOS // 아이폰, 아이패드
         * @property {boolean} isAndroid // 안드로이드
         * @property {number} iosVersion // ios 버전 : [8, 1, 0] -> [major, minor, revision]
         * @property {number} androidVersion // android 버전 : [4, 1, 0] -> [major, minor, revision]
         * @example
         * if(vcui.browser.isIE && vcui.browser.isVersion < 9) {
         *     alert('구버전을 사용하고 있습니다.');
         * }
         */
        detect: (function () {
            // 아 정리하고 싶당..
            var detect = {},
                win = global,
                na = win.navigator,
                ua = na.userAgent,
                lua = ua.toLowerCase(),
                match;

            detect.placeholder = supportPlaceholder;
            detect.isStrict = (typeof global == 'undefined');

            detect.isRetina = 'devicePixelRatio' in global && global.devicePixelRatio > 1;
            detect.isAndroid = lua.indexOf('android') !== -1;
            detect.isBadAndroid = /Android /.test(na.appVersion) && !(/Chrome\/\d/.test(na.appVersion));
            detect.isOpera = !!(win.opera && win.opera.buildNumber);
            detect.isWebKit = /WebKit/.test(ua);
            detect.isTouch = !!('ontouchstart' in global);

            match = /(msie) ([\w.]+)/.exec(lua) || /(trident)(?:.*rv.?([\w.]+))?/.exec(lua) || ['', null, -1];
            detect.isIE = !detect.isWebKit && !detect.isOpera && match[1] !== null;
            detect.version = detect.ieVersion = parseInt(match[2], 10);
            detect.isOldIE = detect.isIE && detect.version < 9;

            detect.isWin = (na.appVersion.indexOf("Win") != -1);
            detect.isMac = (ua.indexOf('Mac') !== -1);
            detect.isLinux = (na.appVersion.indexOf("Linux") != -1);
            detect.is64Bit = (lua.indexOf('wow64') > -1 || (na.platform === 'Win64' && lua.indexOf('x64') > -1));

            detect.isChrome = (ua.indexOf('Chrome') !== -1);
            detect.isGecko = (ua.indexOf('Firefox') !== -1);
            detect.isAir = ((/adobeair/i).test(ua));
            detect.isIOS = /(iPad|iPhone)/.test(ua);
            detect.isSafari = !detect.isChrome && (/Safari/).test(ua);
            detect.isIETri4 = (detect.isIE && ua.indexOf('Trident/4.0') !== -1);
            detect.isGalaxy = (ua.indexOf(' SHV-') !== -1);

            detect.msPointer = !!(na.msPointerEnabled && na.msMaxTouchPoints && !win.PointerEvent);
            detect.pointer = !!((win.PointerEvent && na.pointerEnabled && na.maxTouchPoints) || detect.msPointer);

            if (detect.isAndroid) {
                detect.androidVersion = function () {
                    var v = ua.match(/[a|A]ndroid[^\d]*(\d+).?(\d+)?.?(\d+)?/);
                    if (!v) {
                        return -1;
                    }
                    return [parseInt(v[1] | 0, 10), parseInt(v[2] | 0, 10), parseInt(v[3] | 0, 10)];
                }();
            } else if (detect.isIOS) {
                detect.iosVersion = function () {
                    var v = ua.match(/OS (\d+)_?(\d+)?_?(\d+)?/);
                    return [parseInt(v[1] | 0, 10), parseInt(v[2] | 0, 10), parseInt(v[3] | 0, 10)];
                }();
            }

            detect.isMobile = isMobile || detect.isIOS || detect.isAndroid;
            return detect;
        }()),


        /**
         * 주어진 시간내에 호출이 되면 무시되고, 초과했을 때만 비로소 fn를 실행시켜주는 함수
         * @function
         * @name vcui.delayRun
         * @param {function} fn 콜백함수
         * @param {number} time 딜레이시간
         * @param {*} scope 컨텍스트
         * @returns {function}
         * @example
         * // 리사이징 중일 때는 #box의 크기를 변경하지 않다가,
         * // 리사이징이 끝나고 0.5초가 지난 후에 #box사이즈를 변경하고자 할 경우에 사용.
         * $(window).on('resize', vcui.delayRun(function(){
		 *		$('#box').css('width', $(window).width());
		 *  }, 500));
         */
        delayRun: function (fn, time, scope) {
            time || (time = 250);
            var timeout = null;
            return function () {
                if (timeout) {
                    clearTimeout(timeout);
                }
                var args = arguments,
                    me = this;
                timeout = setTimeout(function () {
                    fn.apply(scope || me, args);
                    timeout = null;
                }, time);
            };
        },

        /**
         * 주어진 값을 배열로 변환
         * @function
         * @name vcui.toArray
         * @param {*} value 배열로 변환하고자 하는 값
         * @return {array}
         *
         * @example
         * vcui.toArray('abcd"); // ["a", "b", "c", "d"]
         * vcui.toArray(arguments);  // arguments를 객체를 array로 변환하여 Array에서 지원하는 유틸함수(slice, reverse ...)를 쓸수 있다.
         */
        toArray: function (value) {
            try {
                return arraySlice.apply(value, arraySlice.call(arguments, 1));
            } catch (e) {
            }

            var ret = [];
            try {
                for (var i = 0, len = value.length; i < len; i++) {
                    ret.push(value[i]);
                }
            } catch (e) {
            }
            return ret;
        },

        /**
         * 15자의 영문, 숫자로 이루어진 유니크한 값 생성
         * @function
         * @name vcui.getUniqId
         * @return {string}
         */
        getUniqId: function (len) {
            len = len || 32;
            var rdmString = "";
            for (; rdmString.length < len; rdmString += Math.random().toString(36).substr(2));
            return rdmString.substr(0, len);
        },

        /**
         * 순번으로 유니크값 을 생성해서 반환
         * @function
         * @name vcui.nextSeq
         * @return {number}
         */
        nextSeq: (function () {
            var seq = 0;
            return function (prefix) {
                return (prefix || '') + (seq += 1);
            };
        }()),

        /**
         * 키 이름
         * @name vcui.keyCode
         * @readonly
         * @enum {number}
         * @property {number} BACKSPACE 스페이스
         * @property {number} DELETE 딜리트
         * @property {number} DOWN 다운
         * @property {number} END 엔드
         * @property {number} ENTER 엔터
         * @property {number} ESCAPE ESC
         * @property {number} HOME 홈
         * @property {number} LEFT 왼쪽
         * @property {number} PAGE_DOWN 페이지다운
         * @property {number} PAGE_UP 페이지업
         * @property {number} RIGHT 오른쪽
         * @property {number} SPACE 스페이스
         * @property {number} TAB 탭
         * @property {number} UP 업
         * @example
         * $('#userid').on('keypress', function(e) {
         *     if(e.which === vcui.keyCode.DOWN) {
         *         alert('다운키 입력');
         *     }
         * });
         */
        keyCode: {
            ESCAPE: 27,
            TAB: 9,
            BACKSPACE: 8,
            ENTER: 13,
            DELETE: 46,
            LEFT: 37,
            UP: 38,
            RIGHT: 39,
            DOWN: 40,
            PAGE_UP: 33,
            PAGE_DOWN: 34,
            HOME: 36,
            END: 35,
            SPACE: 32
        },

        /**
         * 템플릿 생성
         * @function
         * @name vcui.template
         * @param {string} text 템플릿 문자열
         * @param {object} data 템플릿 문자열에서 변환될 데이타
         * @param {object} settings 옵션
         * @return {function} tempalte 함수
         *
         * @example
         * var tmpl = vcui.template('&lt;span>&lt;$=name$>&lt;/span>');
         * var html = tmpl({name: 'Axl rose'}); // &lt;span>Axl rose&lt;/span>
         * $('div').html(html);
         */
        template: function (str, data) {
            var src = 'var __src = [], each=' + LIB_NAME + '.each, escapeHTML=' + LIB_NAME + '.string.escapeHTML; with(value||{}) { __src.push("';
            str = core.string.trim(str);
            src += str
                .replace(/\r|\n|\t/g, " ")
                .replace(/\{\{(.*?)\}\}/g, function (a, b) {
                    return '{{' + b.replace(/"/g, '\t') + '}}';
                })
                .replace(/"/g, '\\"')
                .replace(/\{\{each ([a-z]+) in ([a-zA-Z0-9\.]+)\}\}(.+)\{\{\/each\}\}/g, function (str, item, items, conts) {
                    return '{{each(value.' + items + ', function(item){ }}' + conts + ' {{ }); }}';
                })
                .replace(/\{\{(.*?)\}\}/g, function (a, b) {
                    return '{{' + b.replace(/\t/g, '"') + '}}';
                })

                .replace(/\{\{=(.+?)\}\}/g, '", $1, "')
                .replace(/\{\{-(.+?)\}\}/g, '", escapeHTML($1), "')
                .replace(/(\{\{|\}\})/g, function (a, b) {
                    return b === '{{' ? '");' : '__src.push("'
                });

            //src+='"); };  console.log(__src);return __src.join("");';
            src += '"); }; return __src.join("");';
            var f = new Function('value', 'data', src);
            if (data) {
                return f(data);
            }
            return f;
        }
    });

})(window);
