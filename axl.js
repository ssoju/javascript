/*!
 * @author comahead@gmail.com
 * @description axl js ui 라이브러리
 * @license MIT License
 */
;(function (global, undefined) {
    "use strict";
    /* jshint expr: true, validthis: true */
    /* global axl, alert, escape, unescape */

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

    if (!jQuery) {
        throw new Error("This library requires jQuery");
    }

    var _configs = typeof axlConfigs === 'undefined' ? {} : axlConfigs;

    window.LIB_NAME = _configs.name || 'axl';
    window.IS_DEBUG = _configs.debug || location.href.indexOf('debug=true') >= 0;

    // 프레임웍 이름
    var /** @const */LIB_NAME = global.LIB_NAME || 'axl';
    if (global[LIB_NAME]) {
        return;
    }

    /**
     * @namespace
     * @name axl
     * @description vinylc javascript library
     */
    var core = global[LIB_NAME] || (global[LIB_NAME] = {});

    if (!('importBasePath' in _configs)) {
        (function () {    // import 할 baseUrl이 설정안돼있을 경우 axl.js경로를 알아내 설정해준다.
            var scripts = document.getElementsByTagName('script');
            var regex = /(.*)axl\.(min\.)?js.*/i;
            var m;

            for (var i = -1, item; item = scripts[++i];) {
                if (item.src && (m = item.src.match(regex))) {
                    _configs.importBasePath = m[1];
                    return;
                }
            }
        })();
    }

    ///// require js setting //////////////////////////////////////
    var requireConfig = {
        baseUrl: _configs.importBasePath,
        skipDataMain: true,
        waitSeconds: 15,
        shim: {
            jquery: {
                exports: 'jQuery'
            }
        }
    };

    require.config(requireConfig);
    core.require = require;
    define('jquery', function () {
        return window.$;
    });
    define('axl', function () {
        return core;
    });
    // end require js config /////////////////////////////////////

    var root = global.document.documentElement,
        doc = global.document,
        $win = $(global),
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

    var isPlainObject = (function () {
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
         * @name axl.each
         * @param {Array|Object} obj 배열 및 json객체
         * @param {arrayCallback} iterater 콜백함수
         * @param {*} [ctx] 컨텍스트
         * @return {*}
         * @example
         * axl.each({'a': '에이', 'b': '비', 'c': '씨'}, function(value, key) {
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
         * @name axl.eachReverse
         * @param {array} obj 배열
         * @param {arrayCallback} iterater 콜백함수
         * @param {*} [ctx] 컨텍스트
         * @return {jQuery}
         * @example
         * axl.eachReverse(['a', '에이', 'b', '비', 'c', '씨'], function(value, key) {
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
         * @name axl.extend
         * @param {object} obj...
         * @return {jQuery}
         * @example
         * var ori = {"a": 'A', "b": [1, 2, 3]};
         * axl.extend(ori, {
         *    "c": "C"
         * }); // {"a": 'A', "b": [1, 2, 3], "c": "C"}
         */
        extend = (function () { 
            function type(obj, val) {
                return Object.prototype.toString.call(obj).toLowerCase() === '[object ' + val + ']';
            }

            function isPlainObject(value) {
                return value !== null
                    && value !== undefined
                    && type(value, 'object')
                    && value.ownerDocument === undefined;
            } 
            return function (deep, target) {
                var objs;
                if (typeof deep === 'boolean') {
                    objs = [].slice.call(arguments, 2);
                } else {
                    objs = [].slice.call(arguments, 1);
                    target = deep;
                    deep = false;
                }
                        
                each(objs, function (obj) {
                    if (!obj || (!isPlainObject(obj) && !type(obj, 'array'))) { return; }
                    each(obj, function (val, key) {     
                        var isArr = type(val, 'array');   
                        if (deep === true && (isArr || isPlainObject(val))) {
                            target[key] = extend(deep, target[key] || (target[key] = isArr ? [] : {}), val);
                            return;
                        }
                        target[key] = val;
                    });
                });
                return target;
            }
        })(),
        /**
         * 객체 복제 함수
         * @function
         * @name axl.clone
         * @param {object} obj 배열 및 json객체
         * @return {jQuery}
         * @example
         * var ori = {"a": 'A', "b": [1, 2, 3]};
         * var clone = axl.clone(ori); // {"a": 'A', "b": [1, 2, 3]};
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
        version: '0.0.7',           // 버전
        debug: false,               // 디버깅 여부
        noop: function () {},
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
        info: function () {
            console.table({
                'name': {value: this.name},
                'version': {value: this.version},
                'license': {value: 'MIT License'},
                'copyright': {value: 'VinylC UID Group'},
                'componentPrefix': {value: this.UI_PREFIX},
                'debug': {value: this.IS_DEBUG},
                'company': {value: 'http://c.vi-nyl.com'},
                'reference': {value: 'http://family.vinylc.com/reference/'},
                'js docs': {value: 'http://family.vinylc.com/reference/axl/reference/script/jsdocs/index.html'},
                'download': {value: 'http://family.vinylc.com/reference/axl/downloads/index.html'}
            });
        },
        /**
         * 특정속성을 지원하는지 체크하기 위한 엘리먼트
         * @member
         * @name axl.tmpInput
         * @example
         * if('placeholder' in axl.tmpInput) {
         *     alert('placeholder를 지원합니다.');
         * }
         */
        tmpInput: tmpInput,
        /**
         * 특정 css스타일을 지원하는지 체크하기 위한 엘리먼트
         * @member
         * @name axl.tmpNode
         * @example
         * if('transform' in axl.tmpNode.style) {
         *     alert('transform를 지원합니다.');
         * }
         */
        tmpNode: doc.createElement('div'),

        /**
         * 타입 체크
         * @function
         * @name axl.isType
         * @param {*} o 타입을 체크할 값
         * @param {string=} typeName 타입명(null, Number, String, element, nan, infinity, date, Array)
         * @return {boolean|string} typeName이 안넘오면 타입값을 반환해준다.
         * @example
         * axl.isType('aaaa', 'string'); // true
         * axl.isType(new Date(), 'date'); // true
         * axl.isType(1, 'number'); // true
         * axl.isType(/[a-z]/, 'regexp'); // true
         * axl.isType(document.getElementById('box'), 'element'); // true
         * axl.isType({a:'a'}, 'object'); // true
         * axl.isType([], 'array'); // true
         * axl.isType(NaN, 'nan'); // true
         * axl.isType(null, 'null'); // true
         * // 파라미터를 하나만 넘기면 타입명을 반환받을 수 있다.
         * axl.isType('') // "string"
         * axl.isType(null) //"null"
         * axl.isType(1) //"number"
         * axl.isType({}) //"object"
         * axl.isType([]) // "array"
         * axl.isType(undefined) // "undefined"
         * axl.isType(new Date()) // "date"
         * axl.isType(/[a-z]/) // "regexp"
         * axl.isType(document.body) //"element"
         */
        isType: isType,
        /**
         * 타입 체크 axl.isType의 별칭
         * @function
         * @name axl.type
         * @param {*} o 타입을 체크할 값
         * @param {String=} typeName 타입명(null, Number, String, element, nan, infinity, date, Array)
         * @return {string|boolean}
         */
        type: isType,

        /**
         * 주어진 값이 함수형인가
         * @function
         * @name axl.isFunction
         * @param val {function}
         * @return {boolean}
         */
        isFunction: _bindType('function'),

        /**
         * 주어진 값이 JSON인가
         * @function
         * @name axl.isPlainObject
         * @param val {function}
         * @return {boolean}
         */
        isPlainObject: isPlainObject,

        /**
         * 주어진 값이 문자형인가
         * @function
         * @name axl.isStrinng
         * @param val {string}
         * @return {boolean}
         */
        isString: _bindType('string'),

        /**
         * 주어진 값이 배열형인가
         * @function
         * @name axl.isArray
         * @param val {array}
         * @return {boolean}
         */
        isArray: _bindType('array'),

        /**
         * 주어진 값이 숫자형인가
         * @function
         * @name axl.isNumber
         * @param val {*}
         * @return {boolean}
         */
        isNumber: _bindType('number'),

        /**
         * 문자열이든 숫자든 상관없이 숫자만 있는지 체크
         * @param val
         * @returns {boolean}
         */
        isNumeric: function (val) {
            return !isNaN(parseFloat(val)) && isFinite(val);
        },


        /**
         * 주어진 값이 객체형인가
         * @function
         * @name axl.isObject
         * @param val {*}
         * @return {boolean}
         */
        isObject: _bindType('object'),

        /**
         * undefined 여부 체크
         * @function
         * @name axl.isUndefined
         * @param value {*}
         * @return {boolean}
         */
        isUndefined: function (value) {
            return typeof value === 'undefined';
        },

        /**
         * 주어진 인자가 빈값인지 체크
         * @function
         * @name axl.isEmpty
         * @param {*} value 체크할 값(문자열, 객체 등등)
         * @param {boolean} [allowEmptyString = false] 빈문자를 허용할 것인지 여부
         * @return {boolean}
         * @example
         * axl.isEmpty(null); // true
         * axl.isEmpty(undefined); // true
         * axl.isEmpty(''); // true
         * axl.isEmpty(0); // true
         * axl.isEmpty(null); // true
         * axl.isEmpty([]); // true
         * axl.isEmpty({}); // true
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
         * @name axl.hasOwn
         * @param {object} obj 객체
         * @param {string} name 키 이름
         * @return {boolean} 키의 존재 여부
         * @example
         * var obj = {"a": "A"}
         * if(axl.hasOwn(obj, 'a')){
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
         * @name axl.namespace
         *
         * @param {string} name 네임스페이스명
         * @param {Object=} [obj] 지정된 네임스페이스에 등록할 객체, 함수 등
         * @return {object} 생성된 새로운 네임스페이스
         *
         * @example
         * axl.namesapce('axl.widget.Tabcontrol', TabControl)
         * // 를 native로 풀면,
         * var axl = {
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
         * axl 하위에 name에 해당하는 네임스페이스를 생성하여 object를 설정해주는 함수
         *
         * @function
         * @name axl.addon
         *
         * @param {string} name .를 구분자로 해서 axl을 시작으로 하위 네임스페이스를 생성. name이 없으면 axl에 추가된다.
         * @param {Object|Function} obj
         *
         * @example
         * axl.addon('urls', {
         *    store: 'Store',
         *    company: 'Company'
         * });
         *
         * alert(axl.urls.store);
         * alert(axl.urls.company);
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

            if (isExecFn !== false && typeof object === 'function' && !hasOwn.call(object, 'superClass')) {
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
         * @name axl.detect
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
         * if(axl.browser.isIE && axl.browser.isVersion < 9) {
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
            detect.isMobileDevice = ('ontouchstart' in win) || win.DocumentTouch && document instanceof DocumentTouch || na.msMaxTouchPoints;

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
         * @param {Function} fn 콜백함수
         * @param {number} time 딜레이시간
         * @param {*} scope 컨텍스트
         * @returns {Function}
         * @example
         * // 리사이징 중일 때는 #box의 크기를 변경하지 않다가,
         * // 리사이징이 끝나고 0.5초가 지난 후에 #box사이즈를 변경하고자 할 경우에 사용.
         * $(window).on('resize', axl.delayRun(function(){
         *
        $('#box').css('width', $(window).width());
         *  }, 500));
         */
        delayRun: function(fn, time, scope) {
            time || (time = 250);
            var timeout = null;
            var runner = function () {
                var args = [].slice.call(arguments),
                    self = this;

                runner.cancel();
                timeout = setTimeout(function() {
                    fn.apply(scope || self, args);
                    timeout = null;
                }, time);
            };
            runner.cancel = function () {
                clearTimeout(timeout);
                timeout = null;
            };

            return runner;
        },

        /**
         * 주어진 시간내에 호출이 되면 무시되고, 초과했을 때만 비로소 fn를 실행시켜주는 함수
         * @function
         * @name axl.throttle
         * @param {function} fn 콜백함수
         * @param {number} time 딜레이시간
         * @param {*} scope 컨텍스트
         * @returns {function}
         * @example
         * // 리사이징 중일 때는 #box의 크기를 변경하지 않다가,
         * // 리사이징이 끝나고 0.5초가 지난 후에 #box사이즈를 변경하고자 할 경우에 사용.
         * $(window).on('resize', axl.throttle(function(){
		 *		$('#box').css('width', $(window).width());
		 *  }, 500));
         */
        throttle: function (fn, time, scope) {
            time || (time = 250);
            var lastCall = 0;
            return function () {
                var now = +new Date();
                if (now - lastCall < time) {
                    return;
                }
                lastCall = now;
                fn.apply(scope || this, arguments);
            };
        },

        /**
         * 주어진 값을 배열로 변환
         * @function
         * @name axl.toArray
         * @param {*} value 배열로 변환하고자 하는 값
         * @return {array}
         *
         * @example
         * axl.toArray('abcd"); // ["a", "b", "c", "d"]
         * axl.toArray(arguments);  // arguments를 객체를 array로 변환하여 Array에서 지원하는 유틸함수(slice, reverse ...)를 쓸수 있다.
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
         * @name axl.getUniqId
         * @return {string}
         */
        getUniqId: function (len) {
            len = len || 32;
            var rdmString = "";
            for (; rdmString.length < len; rdmString += Math.random().toString(36).substr(2)) ;
            return rdmString.substr(0, len);
        },

        /**
         * 순번으로 유니크값 을 생성해서 반환
         * @function
         * @name axl.nextSeq
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
         * @name axl.keyCode
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
         *     if(e.which === axl.keyCode.DOWN) {
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
        }
    });
    core.is = core.isType;


    // 커스텀 이벤트 생성
    core.customWindowEvents = {
        delayTime: 200,
        build: function () {
            var self = this;
            $win.on(function () {
                var bindGlobalEvent = function (type) {
                    var data = {};
                    return function () {
                        if (!data[type + 'Start']) {
                            $win.triggerHandler(type + 'start');
                            data[type + 'Start'] = true;
                        }
                        data[type + 'Timer'] && clearTimeout(data[type + 'Timer']);
                        data[type + 'Timer'] = setTimeout(function () {
                            $win.triggerHandler(type + 'end');
                            data[type + 'Start'] = false;
                        }, self.delayTime);
                    };
                };
                /**
                 * @fires window#scrollstart
                 * @fires window#scrollend
                 * @fires window#resizestart
                 * @fires window#resizeend
                 */
                /**
                 * 스크롤 시작시에 호출
                 * @event window#scrollstart
                 * @type {Object}
                 */
                /**
                 * 스크롤 종료시에 호출
                 * @event window#scrollend
                 * @type {Object}
                 */
                /**
                 * 리사이징 시작시에 호출
                 * @event window#resizestart
                 * @type {Object}
                 */
                /**
                 * 리사이징 종료시에 호출
                 * @event window#resizeend
                 * @type {Object}
                 */
                return {
                    'scroll': bindGlobalEvent('scroll'),
                    'resize': bindGlobalEvent('resize')
                };
            }());
        },
        start: function (delayTime) {
            if (this.isBuilt) {
                return;
            }
            this.isBuilt = true;
            if (delayTime !== undefined) {
                this.delayTime = delayTime;
            }
            this.build();
        }
    };

    core.customWindowEvents.start();

})(window);

;(function (core, global, undefined) {
/////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     * 숫자관련 유틸함수 모음
     *
     * @namespace
     * @name axl.number
     */
    core.addon('number', /** @lends axl.number */{
        /**
         * 주어진 수를 자릿수만큼 앞자리에 0을 채워서 반환
         *
         * @param {string} value
         * @param {Number=} [size = 2]
         * @param {String=} [ch = '0']
         * @return {string}
         *
         * @example
         * axl.number.zeroPad(2, 3); // "002"
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
         * axl.number.addComma(21342); // "21,342"
         * // or
         * axl.number.comma(21342); // 21,342
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
         * axl.number.toKorean(123456); // 십이만삼천사백오십육
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
        },
        /**
         * 바이트단위를 사이즈단위로 변환
         * @param {number} bytes 값
         * @param {number} decimals 소수점 갯수
         * @param {string} sizes 단위 배열
         * @returns {*}
         */
        bytesToSize: function(bytes, decimals, sizes) {
            sizes = sizes || ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
            if (!bytes) return '0' + sizes[0];
            var i = Math.floor(Math.log(bytes) / Math.log(1024));
            return parseFloat(bytes / Math.pow(1024, i)).toFixed(decimals || 0) + '' + sizes[i];
        },
        /**
         * Percentage 변환 함수
         * @param {number} value 값
         * @param {number} total 전체
         * @return {number}
         */
        percent: function (value, total, fixLength) {
            if (!total) { return 0; }
            var result = (value / total) * 100;

            if (typeof fixLength === 'number') {
                return result.toFixed(fixLength);
            }
            return result;
        }
    });
    /**
     * axl.number.zeroPad의 별칭
     * @function
     * @static
     * @name axl.number.pad
     */
    core.number.pad = core.number.zeroPad;
    /**
     * axl.number.addComma 별칭
     * @function
     * @static
     * @name axl.comma
     */
    core.comma = core.number.addComma;
/////////////////////////////////////////////////////////////////////////////////////////////////
})(window[LIB_NAME], window);
;(function (core, global, undefined) {
    /**
     * 문자열 관련 유틸 함수 모음
     *
     * @namespace
     * @name axl.string
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

        return /** @lends axl.string */{
            /**
             * 앞뒤 빈문자열을 제거
             * @param {string} value
             * @return {string}
             * @example
             * axl.string.trim(" abc "); // 'abc'
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
             * axl.string.replaceAll("a,b,c,d", ',', ''); // "abcd"
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
             * axl.string.byteLength("동해물과"); // euckr:8byte, utf8:12byte
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
             * axl.string.getFileExt('etc/bin/jslib.js'); // 'js'
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
             * axl.string.getFileName('etc/bin/jslib.js'); // 'jslib.js'
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
             * axl.string.cut("동해물과", 3, "..."); // "동..."
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
             * axl.string.cutByByte("동해물과", 3, "..."); // "동..."
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
             * axl.string.indexByByte("동해물과", 3); // 2
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
             * axl.string.capitalize("abCdEfg"); // "Abcdefg"
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
             * axl.string.capitalize("ab-cd-efg"); // "abCdEfg"
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
             * axl.string.dasherize("abCdEfg"); // "ab-cd-efg"
             */
            dasherize: function (value) {
                return value ? value.replace(/[_\s]+/g, '-').replace(/([A-Z])/g, '-$1').replace(/-+/g, '-').toLowerCase() : value;
            },

            /**
             * 첫글자를 소문자로 변환
             * @param {string} value 문자열
             * @returns {string} 결과 문자열
             * @example
             * axl.string.toFirstLower("Welcome"); // 'welcome'
             */
            toFirstLower: function (value) {
                return value ? value.substr(0, 1).toLowerCase() + value.substr(1) : value;
            },

            /**
             * 첫글자를 대문자로 변환
             * @param {string} value 문자열
             * @returns {string} 결과 문자열
             * @example
             * axl.string.toFirstUpper("welcome"); // 'Welcome'
             */
            toFirstUpper: function (value) {
                return value ? value.substr(0, 1).toUpperCase() + value.substr(1) : value;
            },

            /**
             * 주어진 문자열을 지정한 수만큼 반복하여 조합
             *
             * @param {string} value 문자열
             * @param {number} cnt 반복 횟수
             * @return {string} 결과 문자열
             *
             * @example
             * axl.string.repeat("ab", 4); // "abababab"
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
             * axl.string.escapeHTML('<div><a href="#">링크</a></div>'); // "&lt;div&gt;&lt;a href=&quot;#&quot;&gt;링크&lt;/a&gt;&lt;/div&gt;"
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
             * axl.string.unescapeHTML('&lt;div&gt;&lt;a href=&quot;#&quot;&gt;링크&lt;/a&gt;&lt;/div&gt;');  // '<div><a href="#">링크</a></div>'
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
             * axl.string.toggle('ASC", "ASC", "DESC"); // "DESC"
             * axl.string.toggle('DESC", "ASC", "DESC"); // "ASC"
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
             * axl.string.format("{{0}}:{{1}}:{{2}} {{0}}", "a", "b", "c");  // "a:b:c a"
             * axl.string.format("{{a}}:{{b}}:{{c}} {{d}}", {a:"a", b:"b", c:"c", d: "d"});  // "a:b:c a"
             */
            format: function (format, val) {
                var args = core.toArray(arguments).slice(1),
                    isJson = core.type(val, 'object');

                return format.replace(/\{\{([0-9a-z_]+)\}\}/ig, function (m, i) {
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
             * axl.string.stripTags('welcome to <b>the</b> jungle'); // 'welcome to the jungle'
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
             * axl.string.stripScripts('welcome <s'+'cript>alert('hello');</s'+'cript> to the jungle'); // 'welcome to the jungle'
             */
            stripScripts: function (value) {
                return (value || '').toString().replace(scriptRegexp, '');
            },

            /**
             * 형식문자열을 주어진 인자값으로 치환하여 반환
             * @function
             * @name axl.string.sprintf
             * @param {string} str 형식문자열(%d, %f, %s)
             * @param {*=} ... 형식문자열에 지정된 형식에 대치되는 값
             * @example
             * var ret = axl.string.sprintf('%02d %s', 2, 'abc'); // => '02 abc'
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
;(function (core, global, undefined) {
    var arrayProto = Array.prototype;
    var arraySlice = arrayProto.slice;
    var each = core.each;

// 네이티브에 f가 존재하지 않으면 false 반환
    function nativeCall(f) {
        return f ? function (obj) {
            return f.apply(obj, arrayProto.slice.call(arguments, 1));
        } : false;
    }

    /**
     * 배열관련 유틸함수
     * @namespace
     * @name axl.array
     */
    core.addon('array', /** @lends axl.array# */{
        /**
         * @deprecated use axl.array.merge
         * 배열 병합
         * @param {array} arr 원본 배열
         * @param {...*} var_args 합칠 요소들
         * @return {array} 모두 합쳐진 배열
         * @exmaple
         * var newArray = axl.array.append([1,2,3], [4,5,6], [6, 7, 8]); // [1,2,3,4,5,6,7,8]
         */
        append: function (arr) {
            var args = arraySlice.call(arguments),
                isUnique = args[args.length - 1] === true,
                result;

            if (isUnique) {
                args.pop();
                result = this.unique(arrayProto.concat.apply([], args));
            } else {
                result = arrayProto.concat.apply([], args);
            }
            return result;
        },

        /**
         * 배열 병합
         * @param {array} arr 원본 배열
         * @param {...*} var_args 합칠 요소들
         * @return {array} 모두 합쳐진 배열
         * @exmaple
         * var newArray = axl.array.merge([1,2,3], [4,5,6], [6, 7, 8]); // [1,2,3,4,5,6,7,8]
         */
        merge: function () {
            var result = [], arrays = [].slice.call(arguments);
            for(var i = 0, ilen = arrays.length; i < ilen; i++) {
                if (core.isArray(arrays[i])) {
                    for (var j = 0, jlen = arrays[i].length; j < jlen; j++) {
                        result.push(arrays[i][j]);
                    }
                } else {
                    result.push(arrays[i]);
                }
            }
            return result;
        },

        /**
         * 중복되는 배열 요소 제거
         * @param {array} arr 원본 배열
         * @return {array} 중복되는 요소가 제거된 배열
         * @exmaple
         * var arr = axl.array.unique([1,1,2,2,3,3,4,5]); // [1,2,3,4,5]
         */
        unique: function (arr) {
            if (!core.isArray(arr)) {
                return arr;
            }

            var result = [];
            for (var i = 0, len = arr.length; i < len; i++) {
                if (this.indexOf(result, arr[i]) < 0) {
                    result.push(arr[i]);
                }
            }
            return result;
        },

        /**
         * 설명하기 어려움 - 인터넷 참조바람
         * @function
         * @name axl.array.reduce
         * @param {array} arr 원본 배열
         * @param {function} callback} 반복자
         * @param {*} initialValue} 초기값
         * @return {*} 초기값
         * @exmaple
         * var arr = axl.array.reduce([1,2,3], function (prev, cur) {
         *  prev.push(cur);
         *  return prev;
         * }, [0]); // [0, 1, 2, 3]
         */
        reduce: function (arr, callback, initialValue) {
            if (!core.isArray(arr)) {
                return initialValue;
            }

            if (!core.isFunction(callback)) {
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
         * @name axl.array.map
         * @function
         * @param {array} arr 배열
         * @param {arrayCallback} callback 콜백함수
         * @param {object} (optional) 컨텍스트
         * @return {array} 기공된 배열
         *
         * @example
         * axl.array.map([1, 2, 3], function(item, index) {
		 *		return item * 10;
		 * });
         * // [10, 20, 30]
         */
        map: function (arr, callback, ctx) {
            var results = [];

            if (!core.isFunction(callback)) {
                return results;
            }

            arr = core.toArray(arr);
            // vanilla js~
            for (var i = 0, len = arr.length; i < len; i++) {
                results[results.length] = callback.call(ctx || arr, arr[i], i, arr);
            }
            return results;
        },

        /**
         * 반복자함수의 반환값이 true가 아닐 때까지 반복
         *
         * @name axl.array.every
         * @function
         * @param {array} arr 배열
         * @param {arrayCallback} callback 함수
         * @return {boolean} 최종 결과
         * @example
         * axl.array.every([1, 3, 5, 7], function(val) {
         *     return val > 5;
         * });
         * // false
         *
         * axl.array.every([1, 3, 5, 7], function(val) {
         *     return val > 0;
         * });
         * // true
         */
        every: function (arr, callback, ctx) {
            if (!core.isFunction(callback)) {
                return true;
            }

            arr = core.toArray(arr);
            for(var i = 0, len = arr.length; i < len; i++) {
                if (callback.call(ctx || arr, arr[i], i, arr) !== true) {
                    return false;
                }
            }
            return true;
        },

        /**
         * 반복자함수의 반환값이 true일 때까지 반복
         *
         * @name axl.array.any
         * @function
         * @param {array} arr 배열
         * @param {arrayCallback} callback 함수
         * @return {boolean} 최종 결과
         * @example
         * axl.array.any([1, 3, 5, 7], function(val) {
         *     return val < 5;
         * });
         * // true
         *
         * axl.array.any([1, 3, 5, 7], function(val) {
         *     return val < 0;
         * });
         * // false
         */
        any: function (arr, callback, ctx) {
            if (!core.isFunction(callback)) {
                return false;
            }

            arr = core.toArray(arr);
            for(var i = 0, len = arr.length; i < len; i++) {
                if (callback.call(ctx || arr, arr[i], i, arr) === true) {
                    return true;
                }
            }
            return false;
        },

        /**
         * callback에 부합되는 요소 하나만 반환
         * @param arr
         * @param callback
         * @return {*}
         */
        filterOne: function (arr, callback, ctx) {
            if(!core.isFunction(callback)) {
                return null;
            }

            arr = core.toArray(arr);
            for(var i = 0, len = arr.length; i < len; i++) {
                if (callback.call(ctx || arr, arr[i], i, arr) === true) {
                    return arr[i];
                }
            }
            return null;
        },

        /**
         * 배열 요소의 순서를 섞어주는 함수
         *
         * @param {array} arr 배열
         * @return {array} 순서가 섞인 새로운 배열
         * @example
         * axl.array.shuffle([1, 3, 4, 6, 7, 8]); // [6, 3, 8, 4, 1, 7]
         */
        shuffle: function (arr) {
            var rand,
                index = 0,
                shuffled = [],
                number = core.number;

            for(var i = 0, len = arr.length; i < len; i++) {
                rand = number.random(index++);
                shuffled[index - 1] = shuffled[rand];
                shuffled[rand] = arr[i];
            }
            return shuffled;
        },

        /**
         * 콜백함수로 하여금 요소를 걸려내는 함수
         * @function
         * @name axl.array.filter
         * @param {array} arr 배열
         * @param {function(value, index)} callback 콜백함수
         * @param {*=} (optional) 컨텍스트
         * @returns {array}
         *
         * @example
         * axl.array.filter([1, '일', 2, '이', 3, '삼'], function(item, index) {
		 *		return typeof item === 'String';
		 * });
         * // ['일','이','삼']
         */
        filter: function (arr, callback, ctx) {
            var results = [];

            if (!core.isFunction(callback)) {
                return results;
            }

            arr = core.toArray(arr);
            for (var i = 0, len = arr.length; i < len; i++) {
                callback.call(ctx || arr, arr[i], i, arr) && (results.push(arr[i]));
            }
            return results;
        },

        /**
         * 주어진 배열에 지정된 값이 존재하는지 체크
         * @function
         * @name axl.array.include
         * @param {array} arr 배열
         * @param {*} value 찾을 값
         * @return {boolean}
         *
         * @example
         * axl.array.include([1, '일', 2, '이', 3, '삼'], '삼');  // true
         */
        include: function (arr, value, b) {
            if (!core.type(arr, 'array')) {
                return value;
            }

            arr = core.toArray(arr);
            if (core.isFunction(value)) {
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
         * @name axl.array.has
         * @param {array} arr 배열
         * @param {*} value 찾을 값
         * @return {boolean}
         *
         * @example
         * axl.array.has([1, '일', 2, '이', 3, '삼'], '삼');  // true
         */
        has: function () { return this.include.apply(this, arguments); },

        /**
         * 주어진 인덱스의 요소를 반환
         * @function
         * @name axl.array.indexOf
         * @param {array} obj 배열
         * @param {*} value 찾을 값
         * @return {number}
         *
         * @example
         * axl.array.indexOf([1, '일', 2, '이', 3, '삼'], '일');  // 1
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
         * @param {array} arr 배열
         * @param {number} index 삭제할 인덱스 or 요소
         * @return {array} 지정한 요소가 삭제된 배열
         * @example
         * axl.array.removeAt([1, 2, 3, 4], 1); // [1, 3, 4]
         */
        removeAt: function (arr, index) {
            if (!core.type(arr, 'array')) {
                return arr;
            }
            arr.splice(index, 1);
            return arr;
        },


        /**
         * 주어진 배열에서 해당하는 요소를 삭제
         *
         * @param {array} arr 배열
         * @param {*|function(value, index)} iter 요소 및 필터콜백
         * @return {array} 지정한 요소가 삭제된 배열
         * @example
         * axl.array.remove(['a', 'b', 'c'], 'b'); // ['a', 'c']
         *
         * axl.array.remove(['a', 'b', 'c'], function(value){
         *     return value === 'b';
         * }); // ['a', 'c']
         */
        remove: function (arr, iter) {
            if (!core.isArray(arr)) {
                return arr;
            }

            if (core.isFunction(iter)) {
                for (var i = arr.length, item; item = arr[--i];) {
                    if (iter(item, i) === true) {
                        arr = this.removeAt(arr, i);
                    }
                }
                return arr;
            } else {
                var index = this.indexOf(arr, iter);
                if (index < 0) {
                    return arr;
                }
                return this.removeAt(arr, index);
            }
        },

        /**
         * 주어진 배열에서 가장 큰 요소를 반환
         *
         * @param {array} arr 배열
         * @param {function} callback
         * @return {number} 최대값
         * @example
         * axl.array.max([2, 1, 3, 5, 2, 8]); // 8
         * axl.array.max([{value:1}, {value:2}], function (item) {
         *   return item.value;
         * }); // 2
         */
        max: function (arr, callback) {
            if (callback) {
                arr = core.array.map(arr, callback);
            }
            return Math.max.apply(Math, arr);
        },

        /**
         * 주어진 배열에서 가장 작은 요소를 반환
         *
         * @param {array} arr 배열
         * @param {function} callback
         * @return {number} 최소값
         * @example
         * axl.array.min([2, 1, 3, 5, 2, 8]); // 1
         * axl.array.max([{value:1}, {value:2}], function (item) {
         *   return item.value;
         * }); // 1
         */
        min: function (arr, callback) {
            if (callback) {
                arr = core.array.map(arr, callback);
            }
            return Math.min.apply(Math, arr);
        },

        /**
         * 배열의 요소를 역순으로 재배치
         *
         * @name reverse
         * @param {array} arr 배열
         * @return {array} 역순으로 정렬된 새로운 배열
         * @example
         * axl.array.reverse([1, 2, 3]); // [3, 2, 1]
         */
        reverse: function (arr) {
            var tmp = null, first, last;
            var length = arr.length;

            for (first = 0, last = length - 1; first < length / 2; first++, last--) {
                tmp = arr[first];
                arr[first] = arr[last];
                arr[last] = tmp;
            }

            return arr;
        },

        /**
         * 두 배열의 차집합을 반환
         * @param {array} arr1 배열1
         * @param {array} arr2 배열2
         * @returns {array} 차집합 배열
         * @example
         * axl.array.different([1, 2, 3, 4, 5], [3, 4, 5, 6, 7]); // [1, 2, 6, 7]
         */
        different: function (arr1, arr2) {
            var newArr = [], iof = core.array.indexOf;
            core.each(arr1, function (value) {
                if (iof(arr2, value) < 0) {
                    newArr.push(value);
                }
            });

            core.each(arr2, function (value) {
                if (iof(arr1, value) < 0) {
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
            for (var i = 0, len = arr.length; i < len; i++) {
                total += (arr[i] | 0);
            }
            return total;
        }
    });

})(window[LIB_NAME], window);
;(function (core, global, undefined) {
    /**
     * 날짜관련 유틸함수
     * @namespace
     * @name axl.date
     */
    core.addon('date', function () {
        var months = "Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec".split(","),
            fullMonths = "January,Febrary,March,April,May,June,July,Augst,September,October,November,December".split(",");


        function compare(d1, d2) {
            if (!(d1 instanceof Date)) {
                d1 = core.date.parse(d1);
            }
            if (!(d2 instanceof Date)) {
                d2 = core.date.parse(d2);
            }

            return d1.getTime() > d2.getTime() ? -1 : (d1.getTime() === d2.getTime() ? 0 : 1);
        }

        return /** @lends axl.date */{
            MONTHS_NAME: months,
            MONTHS_FULLNAME: fullMonths,
            FORMAT: 'yyyy-MM-dd',

            /**
             * 날짜형식을 지정한 포맷의 문자열로 변환
             *
             * @param {date} formatDate
             * @param {string} formatString} 포맷 문자열
             * @return {string} 변환된 문자열
             *
             * @example
             * // ex) 2015-04-07 15:03:45
             * // yyyy: 2015
             * // yy: 15
             * // M: 4
             * // MM: 04
             * // MMM: Apr
             * // MMMMM: April
             * // d: 7
             * // dd: 07
             * // h: 15
             * // hh: 15
             * // H: 3
             * // m: 3
             * // mm: 03
             * // s: 45
             * // ss: 45
             * // x: PM
             *
             * axl.date.format(new Date(), "yy/MM/dd");
             * // '15/01/05'
             */
            format: function (formatDate, formatString) {
                if (formatDate === '' || formatDate === null) return '';
                formatString || (formatString = this.FORMAT);
                if (core.type(formatDate, 'number')) {
                    formatDate = new Date(formatDate);
                } else if (core.type(formatDate, 'string')) {
                    formatDate = this.parse(formatDate);
                }
                if (formatDate instanceof Date) {
                    var yyyy = formatDate.getFullYear(),
                        yy = yyyy.toString().substring(2),
                        M = formatDate.getMonth() + 1,
                        MM = M < 10 ? "0" + M : M,
                        MMM = this.MONTHS_NAME[M - 1],
                        MMMM = this.MONTHS_FULLNAME[M - 1],
                        d = formatDate.getDate(),
                        dd = d < 10 ? "0" + d : d,
                        h = formatDate.getHours(),
                        hh = h < 10 ? "0" + h : h,
                        m = formatDate.getMinutes(),
                        mm = m < 10 ? "0" + m : m,
                        s = formatDate.getSeconds(),
                        ss = s < 10 ? "0" + s : s,
                        x = h > 11 ? "PM" : "AM",
                        H = h % 12;

                    if (H === 0) {
                        H = 12;
                    }
                    return formatString.replace(/yyyy/g, yyyy)
                        .replace(/yy/g, yy)
                        .replace(/MMMM/g, MMMM)
                        .replace(/MMM/g, MMM)
                        .replace(/MM/g, MM)
                        .replace(/M/g, M)
                        .replace(/dd/g, dd)
                        .replace(/d/g, d)
                        .replace(/hh/g, hh)
                        .replace(/h/g, h)
                        .replace(/mm/g, mm)
                        .replace(/m/g, m)
                        .replace(/ss/g, ss)
                        .replace(/s/g, s)
                        .replace(/!!!!/g, MMMM)
                        .replace(/!!!/g, MMM)
                        .replace(/H/g, H)
                        .replace(/x/g, x);
                } else {
                    return "";
                }
            },

            /**
             * 주어진 날자가 유효한지 체크
             * @param {string} date 날짜 문자열
             * @returns {boolean} 유효한 날자인지 여부
             * @example
             * axl.date.isValid('2014-13-23'); // false
             * axl.date.isValid('2014-11-23'); // true
             */
            isValid: function (date) {
                try {
                    return !isNaN(this.parse(date).getTime());
                } catch (e) {
                    return false;
                }
            },

            /**
             * date가 start와 end사이인지 여부
             *
             * @param {date} date 날짜
             * @param {date} start 시작일시
             * @param {date} end 만료일시
             * @return {boolean} 두날짜 사이에 있는지 여부
             * @example
             * axl.date.between('2014-09-12', '2014-09-11', '2014=09-12'); // true
             * axl.date.between('2014-09-12', '2014-09-11', '2014=09-11') // false
             */
            between: function (date, start, end) {
                if (!date.getDate) {
                    date = core.date.parse(date);
                }
                if (!start.getDate) {
                    start = core.date.parse(start);
                }
                if (!end.getDate) {
                    end = core.date.parse(end);
                }
                return date.getTime() >= start.getTime() && date.getTime() <= end.getTime();
            },

            /**
             * 날짜 비교
             *
             * @function
             * @name axl.date.compare
             * @param {date} date1 날짜1
             * @param {date} date2 날짜2
             * @return {number} -1: date1가 이후, 0: 동일, 1:date2가 이후
             * @example
             * var d1 = new Date(2014, 11, 23);
             * var d2 = new Date(2014, 09, 23);
             *
             * axl.date.compare(d1, d2); // -1
             * axl.date.compare(d1, d1); // 0
             * axl.date.compare(d2, d1); // 1
             */
            compare: compare,

            /**
             * 년월일이 동일한가
             *
             * @param {date|String} date1 날짜1
             * @param {date|String} date2 날짜2
             * @return {boolean} 두 날짜의 년월일이 동일한지 여부
             * @example
             * axl.date.equalsYMD('2014-12-23 11:12:23', '2014-12-23 09:00:21'); // true
             */
            equalsYMD: function (a, b) {
                var ret = true;
                if (!a || !b) {
                    return false;
                }
                if (!a.getDate) {
                    a = this.parse(a);
                }
                if (!b.getDate) {
                    b = this.parse(b);
                }
                each(['getFullYear', 'getMonth', 'getDate'], function (fn) {
                    ret = ret && (a[fn]() === b[fn]());
                    if (!ret) {
                        return false;
                    }
                });
                return ret;
            },


            /**
             * 주어진 날짜를 기준으로 type만큼 가감된 날짜를 format형태로 반환
             * @param {date} date 기준날짜
             * @param {string} type -2d, -3d, 4M, 2y ..
             * @param {string} format 포맷
             * @returns {date|String} format지정값에 따라 결과를 날짜형 또는 문자열로 변환해서 반환
             * @example
             * axl.date.calcDate('2014-12-23', '-3m'); // 2014-09-23(Date)
             * axl.date.calcDate('2014-12-23', '-3m', 'yyyy/MM/dd'); // '2014/09/23'(String)
             *
             * axl.date.calcDate('2014-12-23', '-10d'); // 2014-12-13(Date)
             */
            calcDate: function (date, type, format) {
                date = this.parse(date);
                if (!date) {
                    return null;
                }

                var m = type.match(/([-+]*)([0-9]*)([a-z]+)/i),
                    g = m[1] === '-' ? -1 : 1,
                    d = (m[2] | 0) * g;

                switch (m[3]) {
                    case 'd':
                        date.setDate(date.getDate() + d);
                        break;
                    case 'w':
                        date.setDate(date.getDate() + (d * 7));
                        break;
                    case 'M':
                        date.setMonth(date.getMonth() + d);
                        break;
                    case 'y':
                        date.setFullYear(date.getFullYear() + d);
                        break;
                }
                if (format) {
                    return this.format(date, format === 'format' ? this.FORMAT : format);
                }
                return date;
            },

            calc: function () {
                return this.calcDate.apply(this, [].slice.call(arguments));
            },

            /**
             * 주어진 날짜 형식의 문자열을 Date객체로 변환
             *
             * @function
             * @name axl.date.parse
             * @param {string} dateStringInRange 날짜 형식의 문자열
             * @return {date} 주어진 날짜문자열을 파싱한 값을 Date형으로 반환
             * @example
             * axl.date.parse('2014-11-12');
             * // Wed Nov 12 2014 00:00:00 GMT+0900 (대한민국 표준시)
             *
             * axl.date.parse('20141112');
             * // Wed Nov 12 2014 00:00:00 GMT+0900 (대한민국 표준시)
             */
            parse: (function () {
                var isoExp = /^\s*(\d{4})(\d{2})(\d{2})(\d{2})?(\d{2})?(\d{2})?\s*$/;
                return function (dateStringInRange) {
                    var date, month, parts;

                    if (dateStringInRange instanceof Date) {
                        return core.clone(dateStringInRange);
                    }

                    dateStringInRange = (dateStringInRange + '').replace(/[^\d]+/g, '');
                    if (dateStringInRange.length !== 8 && dateStringInRange.length !== 14) {
                        return new Date(NaN);
                    }
                    if (dateStringInRange.length === 14) {
                        date = new Date(dateStringInRange.substr(0, 4) | 0,
                            (dateStringInRange.substr(4, 2) | 0) - 1,
                            dateStringInRange.substr(6, 2) | 0,
                            dateStringInRange.substr(8, 2) | 0,
                            dateStringInRange.substr(10, 2) | 0,
                            dateStringInRange.substr(12, 2) | 0
                        );
                        if (!isNaN(date)) {
                            return date;
                        }
                    }
                    date = new Date(dateStringInRange);
                    if (!isNaN(date)) {
                        return date;
                    }

                    date = new Date(NaN);
                    parts = isoExp.exec(dateStringInRange);

                    if (parts) {
                        month = +parts[2];
                        date.setFullYear(parts[1] | 0, month - 1, parts[3] | 0);
                        date.setHours(parts[4] | 0);
                        date.setMinutes(parts[5] | 0);
                        date.setSeconds(parts[6] | 0);
                        if (month != date.getMonth() + 1) {
                            date.setTime(NaN);
                        }
                        return date;
                    }
                    return date;
                };
            })(),

            /**
             * 두 날짜의 월 간격
             * @param {date} d1 날짜 1
             * @param {date} d2 날짜 2
             * @return {number} 두날짜의 월차
             * axl.date.monthDiff('2011-02-12', '2014-11-23'); // 44
             */
            monthDiff: function (d1, d2) {
                d1 = this.parse(d1);
                d2 = this.parse(d2);

                var months;
                months = (d2.getFullYear() - d1.getFullYear()) * 12;
                months -= d1.getMonth();
                months += d2.getMonth();
                return months;
            },

            /**
             * 주어진 년월의 일수를 반환
             *
             * @param {number} year 년도
             * @param {number} month 월
             * @return {date} 주어진 년월이 마지막 날짜
             * @example
             * axl.date.daysInMonth(2014, 2); // 28
             */
            daysInMonth: function (year, month) {
                var dd = new Date(year | 0, month | 0, 0);
                return dd.getDate();
            },

            /**
             * 밀리초를 시,분,초로 변환
             * @param amount 밀리초값
             * @return {object} dates 변환된 시간 값
             * @return {number} dates.days 일 수
             * @return {number} dates.hours 시간 수
             * @return {number} dates.mins 분 수
             * @return {number} dates.secs 초 수
             * @example
             * axl.date.splits(2134000);
             * // {days: 0, hours: 0, mins: 35, secs: 34}
             */
            splits: function (amount) {
                var days, hours, mins, secs;

                amount = amount / 1000;
                days = Math.floor(amount / 86400), amount = amount % 86400;
                hours = Math.floor(amount / 3600), amount = amount % 3600;
                mins = Math.floor(amount / 60), amount = amount % 60;
                secs = Math.floor(amount);

                return {
                    days: days,
                    hours: hours,
                    mins: mins,
                    secs: secs
                };
            },

            /**
             * 주어진 두 날짜의 간견을 시, 분, 초로 반환
             *
             * @param {date} t1 기준 시간
             * @param {date} t2 비교할 시간
             * @return {object} dates 시간차 값들이 들어있는 객체
             * @return {number} dates.ms 밀리초
             * @return {number} dates.secs 초
             * @return {number} dates.mins 분
             * @return {number} dates.hours 시
             * @return {number} dates.days 일
             * @return {number} dates.weeks 주
             * @return {number} dates.diff
             *
             * @example
             * axl.date.diff(new Date, new Date(new Date() - 51811));
             * // {ms: 811, secs: 51, mins: 0, hours: 0, days: 0, weeks: 0, diff: 51811}
             */
            diff: function (t1, t2) {
                if (!core.type(t1, 'date')) {
                    t1 = new Date(t1);
                }

                if (!core.type(t2, 'date')) {
                    t2 = new Date(t2);
                }

                var diff = t1.getTime() - t2.getTime(),
                    ddiff = diff;

                diff = Math.abs(diff);

                var ms = diff % 1000;
                diff /= 1000;

                var s = Math.floor(diff % 60);
                diff /= 60;

                var m = Math.floor(diff % 60);
                diff /= 60;

                var h = Math.floor(diff % 24);
                diff /= 24;

                var d = Math.floor(diff);

                var w = Math.floor(diff / 7);

                return {
                    ms: ms,
                    secs: s,
                    mins: m,
                    hours: h,
                    days: d,
                    weeks: w,
                    diff: ddiff
                };
            },

            /**
             * 주어진 날짜가 몇번째 주인가
             * @function
             * @param {date} date 날짜
             * @return {number}
             * @example
             * axl.date.weekOfYear(new Date); // 2 // 2015-01-05를 기준으로 했을 때
             */
            weekOfYear: (function () {
                var ms1d = 1000 * 60 * 60 * 24,
                    ms7d = 7 * ms1d;

                return function (date) {
                    var DC3 = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate() + 3) / ms1d,
                        AWN = Math.floor(DC3 / 7),
                        Wyr = new Date(AWN * ms7d).getUTCFullYear();

                    return AWN - Math.floor(Date.UTC(Wyr, 0, 7) / ms7d) + 1;
                };
            }()),

            /**
             * 윤년인가
             * @param {number} y 년도
             * @return {boolean}
             * @example
             * axl.date.isLeapYear(2014); // false
             */
            isLeapYear: function (y) {
                if (toString.call(y) === '[object Date]') {
                    y = y.getUTCFullYear();
                }
                return (( y % 4 === 0 ) && ( y % 100 !== 0 )) || ( y % 400 === 0 );
            },

            /**
             * 날짜 가감함수
             * @param {date} date 날짜
             * @param {string} interval 가감타입(ms, s, m, h, d, M, y)
             * @param {number} value 가감 크기
             * @return {date} 가감된 날짜의 Date객체
             * @example
             * // 2014-06-10에서 y(년도)를 -4 한 값을 계산
             * var d = axl.date.add(new Date(2014, 5, 10), 'y', -4); // 2010-06-10
             */
            add: function (date, interval, value) {
                var d = new Date(date.getTime());
                if (!interval || value === 0) {
                    return d;
                }

                switch (interval) {
                    case "ms":
                        d.setMilliseconds(d.getMilliseconds() + value);
                        break;
                    case "s":
                        d.setSeconds(d.getSeconds() + value);
                        break;
                    case "m":
                        d.setMinutes(d.getMinutes() + value);
                        break;
                    case "h":
                        d.setHours(d.getHours() + value);
                        break;
                    case "d":
                        d.setDate(d.getDate() + value);
                        break;
                    case "M":
                        d.setMonth(d.getMonth() + value);
                        break;
                    case "y":
                        d.setFullYear(d.getFullYear() + value);
                        break;
                }
                return d;
            },

            /**
             * 주어진 두 날짜 중에서 큰값 반환
             * @param {date} a
             * @param {date} b
             * @return {date}
             */
            max: function (a, b) {
                return new Date(Math.max(this.parse(a), this.parse(b)));
            },

            /**
             * 주어진 두 날짜 중에서 작은값 반환
             * @param {date} a
             * @param {date} b
             * @return {date}
             */
            min: function (a, b) {
                return new Date(Math.min(this.parse(a), this.parse(b)));
            },

            /**
             * 시분초 normalize화 처리
             * @param {number} h 시
             * @param {number} M 분
             * @param {number} s 초
             * @param {number} ms 밀리초
             * @return {object} dates 시간정보가 담긴 객체
             * @return {number} dates.day 일
             * @return {number} dates.hour 시
             * @return {number} dates.min 분
             * @return {number} dates.sec 초
             * @return {number} dates.ms 밀리초
             * @example
             * axl.date.normalize(0, 0, 120, 0) // {day:0, hour: 0, min: 2, sec: 0, ms: 0} // 즉, 120초가 2분으로 변환
             */
            normalize: function (h, M, s, ms) {
                h = h || 0;
                M = M || 0;
                s = s || 0;
                ms = ms || 0;

                var d = 0;

                if (ms > 1000) {
                    s += Math.floor(ms / 1000);
                    ms = ms % 1000;
                }

                if (s > 60) {
                    M += Math.floor(s / 60);
                    s = s % 60;
                }

                if (M > 60) {
                    h += Math.floor(M / 60);
                    M = M % 60;
                }

                if (h > 24) {
                    d += Math.floor(h / 24);
                    h = h % 24;
                }

                return {
                    day: d,
                    hour: h,
                    min: M,
                    sec: s,
                    ms: ms
                }
            }
        };
    });
})(window[LIB_NAME], window);

;(function (core, global, undefined) {
    /**
     * JSON객체 관련 유틸함수
     * @namespace
     * @name axl.object
     */
    core.addon('object', /** @lends axl.object */{

        /**
         * 개체의 열거가능한 속성 및 메서드 이름을 배열로 반환
         * @name axl.object.keys
         * @function
         * @param {object} obj 리터럴 객체
         * @return {array} 객체의 열거가능한 속성의 이름이 포함된 배열
         *
         * @example
         * axl.object.keys({"name": "Axl rose", "age": 50}); // ["name", "age"]
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
         * @name axl.object.values
         * @param {object} obj 리터럴 객체
         * @return {array} 객체의 열거가능한 속성의 값들이 포함된 배열
         *
         * @example
         * axl.object.values({"name": "Axl rose", "age": 50}); // ["Axl rose", 50]
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
         * axl.object.map({1; 'one', 2: 'two', 3: 'three'}, function(item, key) {
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
         * axl.object.hasItems(obj1); // false
         * axl.object.hasItems(obj2); // true
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
         * axl.object.toQueryString({"a":1, "b": 2, "c": {"d": 4}}); // "a=1&b=2&c[d]=4"
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
         * axl.object.travere({1:'a', 2:'b', 3:'c', 4:'d'});
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
         * axl.object.remove(obj, 'b'); // {"a":"A"} // delete obj.b;로 하는게 더 낫겠네..ㅎ
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
         * @name axl.object.stringify
         * @param {object} val json 객체
         * @param {object} [opts]
         * @param {boolean} [opts.singleQuotes = false] 문자열을 '로 감쌀것인가
         * @param {string} [opts.indent = '']  들여쓰기 문자(\t or 스페이스)
         * @param {string} [opts.nr = ''] 줄바꿈 문자(\n or 스페이스)
         * @param {string} [pad = ''] 기호와 문자간의 간격
         * @return {string}
         * @example
         * axl.object.stringify({"a": "A"
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
;(function ($, core, global, undefined) {
    "use strict";
    /**
     * 수학 유틸함수들이 들어있는 객체이다.
     * @namespace
     * @name axl.math
     */
    core.addon('math', /** @lends axl.math */{
        /**
         * 두 포인터간의 각도 계산
         * @param {{x: (*|Number), y: (*|Number)}} startPoint 시작점
         * @param {{x: (*|Number), y: (*|Number)}} endPoint 끝점
         * @return {number} 각도
         */
        getAngle: function (startPoint, endPoint) {
            var x = startPoint.x - endPoint.x;
            var y = endPoint.y - startPoint.y;
            var r = Math.atan2(y, x); //radians
            var angle = Math.round(r * 180 / Math.PI); //degrees

            if (angle < 0) {
                angle = 360 - Math.abs(angle);
            }

            return angle;
        },

        /**
         * 두 포인터의 간격을 계산
         * @param {{x: (*|Number), y: (*|Number)}} a
         * @param {{x: (*|Number), y: (*|Number)}} b
         * @return {{x: Number, y: Number}}
         */
        getDiff: function (a, b) {
            return {
                x: a.x - b.x,
                y: a.y - b.y
            };
        },

        /**
         * 시작점과 끝점을 비교해서 이동한 방향을 반환
         * @param {{x: (*|Number), y: (*|Number)}} startPoint 시작점
         * @param {{x: (*|Number), y: (*|Number)}} endPoint 끝점
         * @param {string} direction
         * @returns {string} left, right, down, up
         */
        getDirection: function (startPoint, endPoint, direction) {
            var angle,
                isHoriz = !direction || direction === 'horizontal' || direction === 'both',
                isVert = !direction || direction === 'vertical' || direction === 'both';

            if (isHoriz != isVert) {
                if (isHoriz) {
                    if (startPoint.x > endPoint.x) {
                        return 'left';
                    }
                    else if (startPoint.x == endPoint.x) {
                        return '';
                    }
                    else {
                        return 'right';
                    }
                } else {
                    if (startPoint.y > endPoint.y) {
                        return 'down';
                    }
                    else if (startPoint.y == endPoint.y) {
                        return '';
                    }
                    else {
                        return 'up';
                    }
                }
            }

            angle = this.getAngle(startPoint, endPoint);
            if ((angle <= 45) && (angle >= 0)) {
                return 'left';
            } else if ((angle <= 360) && (angle >= 315)) {
                return 'left';
            } else if ((angle >= 135) && (angle <= 225)) {
                return 'right';
            } else if ((angle > 45) && (angle < 135)) {
                return 'down';
            } else {
                return 'up';
            }
        },

        /**
         * 평균
         * @param arr
         * @returns {number}
         */
        average: function (arr) {
            return this.sum(arr) / arr.length;
        },

        /**
         * 경사
         * @param x
         * @param y
         * @returns {number}
         */
        slope: function (x, y) {
            return (y[1] - x[1]) / (y[0]-x[0]);
        },

        /**
         * 배열요소들의 합계 구하기
         * @param arr
         * @returns {number}
         */
        sum: function (arr, fn) {
            var val = 0;
            for (var i=0, len = arr.length; i<len; i++)
                val += (fn ? fn(arr[i], i, arr) : (arr[i]-0));
            return val;
        }
    })
})(jQuery, window[LIB_NAME], window);
;(function (core, global, undefined) {

    /**
     * @namespace
     * @name axl.uri
     */
    core.addon('uri', /** @lends axl.uri */{
        /**
         * 현재 페이지의 호스트주소를 반환
         * @returns {string}
         * @example
         * alert(axl.uri.getHost());
         */
        getHost: function () {
            var loc = doc.location;
            return loc.protocol + '//' + loc.host;
        },
        /**
         * 현재 url 반환(쿼리스트링, # 제외)
         * @returns {string}
         * @example
         * alert(axl.uri.getPageUrl());
         */
        getPageUrl: function () {
            var loc = doc.location;
            return loc.protocol + '//' + loc.host + loc.pathname;
        },

        /**
         * 주어진 url에 쿼리스츠링을 조합
         *
         * @param {string} url
         * @param {String:Object} String
         * @return {string}
         *
         * @example
         * axl.uri.addParam("board.do", {"a":1, "b": 2, "c": {"d": 4}}); // "board.do?a=1&b=2&c[d]=4"
         * axl.uri.addParam("board.do?id=123", {"a":1, "b": 2, "c": {"d": 4}}); // "board.do?id=123&a=1&b=2&c[d]=4"
         */
        addParam: function (url, string) {
            if (core.type(string, 'object')) {
                string = core.object.toQueryString(string);
            }
            if (!core.isEmpty(string)) {
                return url + (url.indexOf('?') === -1 ? '?' : '&') + string;
            }

            return url;
        },

        /**
         * 쿼리스트링을 객체로 변환
         *
         * @param {string} query 쿼리스트링 문자열
         * @return {object}
         *
         * @example
         * axl.uri.parseQuery("a=1&b=2"); // {"a": 1, "b": 2}
         */
        parseQuery: function (query) {
            if (!query) {
                return {};
            }
            if (query.length > 0 && query.charAt(0) === '?') {
                query = query.substr(1);
            }

            var params = (query + '').split('&'),
                obj = {},
                params_length = params.length,
                tmp = '',
                i;

            for (i = 0; i < params_length; i++) {
                tmp = params[i].split('=');
                obj[decodeURIComponent(tmp[0])] = decodeURIComponent(tmp[1]).replace(/[+]/g, ' ');
            }
            return obj;
        },

        /**
         * url를 파싱하여 host, port, protocol 등을 추출
         *
         * @function
         * @param {string} str url 문자열
         * @return {object}
         *
         * @example
         * axl.uri.parseUrl("http://www.axl.com:8080/list.do?a=1&b=2#comment");
         * // {scheme: "http", host: "www.axl.com", port: "8080", path: "/list.do", query: "a=1&b=2"…}
         */
        parseUrl: (function () {
            var o = {
                strictMode: false,
                key: ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"],
                q: {
                    name: "queryKey",
                    parser: /(?:^|&)([^&=]*)=?([^&]*)/g
                },
                parser: {
                    strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
                    loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/\/?)?((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
                }
            };

            return function (str) {
                if (str.length > 2 && str[0] === '/' && str[1] === '/') {
                    str = context.location.protocol + str;
                }
                var m = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
                    uri = {}, i = 14;
                while (i--) {
                    uri[o.key[i]] = m[i] || "";
                }
                return uri;
            };
        })(),

        /**
         * 주어진 url에서 해쉬문자열 제거
         *
         * @param {string} url url 문자열
         * @return {string} 결과 문자열
         *
         * @example
         * axl.uri.removeHash("list.do#comment"); // "list.do"
         */
        removeHash: function (url) {
            return url ? url.replace(/#.*$/, '') : url;
        },

        /**
         * name에 대한 url 파라미터 값 반환
         * @param name
         * @returns {*}
         */
        getParam: function (name) {
            if (this.currentSearch === location.search && this.params && (name in this.params)) {
                return this.params[name];
            }
            this.currentSearch = location.search;

            var search = location.search;
            if (!search || search.indexOf(name) < 0) {
                return '';
            }

            this.params = this.parseQuery(search);
            return this.params[name] || '';
        }
    });

})(window[LIB_NAME], window);
;(function (core, global, undefined) {
    var doc = global.document;

    /**
     * css3관련 유틸함수들이 들어있는 객체이다.
     * @namespace
     * @name axl.css3
     */
    core.addon('css3', function () {

        var _tmpDiv = core.tmpNode,
            _prefixes = ['Webkit', 'Moz', 'O', 'ms', ''],
            _style = _tmpDiv.style,
            _noReg = /^([0-9]+)[px]+$/,
            _vendor = (function () {
                var vendors = ['t', 'webkitT', 'MozT', 'msT', 'OT'],
                    transform,
                    i = 0,
                    l = vendors.length;

                for (; i < l; i++) {
                    if (vendors[i] + 'ransitionDuration' in _style && vendors[i] + 'ransform' in _style) {
                        return vendors[i].substr(0, vendors[i].length - 1);
                    }
                }

                return false;
            })(),
            string = core.string;

        function prefixStyle(name, isHyppen) {
            if (_vendor === false) return isHyppen ? name.toLowerCase() : name;
            if (_vendor === '') return isHyppen ? name.toLowerCase() : name;
            if (isHyppen) {
                return '-' + _vendor.toLowerCase() + '-' + name[0].toLowerCase() + string.dasherize(name.substr(1));
            }
            return _vendor + string.capitalize(name);
        }

        return /** @lends axl.css3 */{
            /**
             * css3 지원여부
             * @var {boolean}
             * @example
             * if(axl.css3.support) {
             * // css3 지원
             * }
             */
            support: _vendor !== false,
            /**
             * 3d style 지원여부
             * @var {boolean}
             * @example
             * if(axl.css3.support3D) {
             * // 3d css3 지원
             * }
             */
            support3D: (function () {
                return false; // 자주 사용하지 않을 것 같아서 임시로 뺌
                /*var body = doc.body,
                    docEl = doc.documentElement,
                    docOverflow;
                if (!body) {
                    body = doc.createElement('body');
                    body.fake = true;
                    body.style.background = '';
                    body.style.overflow = 'hidden';
                    body.style.padding = '0 0 0 0';
                    docEl.appendChild(body);
                }
                docOverflow = docEl.style.overflow;
                docEl.style.overflow = 'hidden';

                var parent = doc.createElement('div'),
                    div = doc.createElement('div'),
                    cssTranslate3dSupported;

                div.style.position = 'absolute';
                parent.appendChild(div);
                body.appendChild(parent);

                div.style[prefixStyle('transform')] = 'translate3d(20px, 0, 0)';
                cssTranslate3dSupported = ($(div).position().left - div.offsetLeft == 20);
                if (body.fake) {
                    body.parentNode.removeChild(body);
                    docEl.offsetHeight;
                    body = null;
                } else {
                    parent.parentNode.removeChild(parent);
                }
                docEl.style.overflow = docOverflow;
                return cssTranslate3dSupported;*/
            })(),

            /**
             * 현재 브라우저의 css prefix명 (webkit or Moz or ms or O)
             * @var {string}
             * @example
             * $('div').css(axl.css.vender+'Transform', 'translate(10px 0)');
             */
            vendor: _vendor,
            /**
             * 주어진 css속성을 지원하는지 체크
             *
             * @param {string} cssName 체크하고자 하는 css명
             * @return {boolean} 지원여부
             * @example
             * if(axl.css3.has('transform')) { ...
             */
            has: function (name) {
                var a = _prefixes.length;
                if (name in _style) {
                    return true;
                }
                name = string.capitalize(name);
                while (a--) {
                    if (_prefixes[a] + name in _style) {
                        return true;
                    }
                }
                return false;
            },

            /**
             * $el요소의 현재 위치를 반환
             * @name axl.css3.position
             * @function
             * @param {jQuery} $el
             * @return {object} data
             * @return {number} data.x
             * @return {number} data.y
             */
            position: (function () {
                var support = _vendor !== false;
                var transform = prefixStyle('transform');
                return support ? function ($el) {
                    var el = $el[0] || $el;
                    var matrix = global.getComputedStyle ? global.getComputedStyle(el, null) : el.currentStyle,
                        x, y;

                    if (!matrix[transform] || matrix[transform] === 'none') {
                        return {x: 0, y: 0, left:0, top: 0};
                    }
                    matrix = matrix[transform].split(')')[0].split(', ');
                    x = +(matrix[12] || matrix[4] || 0);
                    y = +(matrix[13] || matrix[5] || 0);
                    return {x: x, y: y, left: x, top: y};
                } : function ($el) {
                    var el = $el[0] || $el;
                    var matrix = el.style, x, y;
                    x = +matrix.left.replace(/[^-\d.]/g, '');
                    y = +matrix.top.replace(/[^-\d.]/g, '');
                    return {x: x, y: y, left: x, top: y};
                };
            })(),

            getTranslateXY: function ($el) {
                return this.position($el);
            },

            transform: prefixStyle('transform'),
            transitionTimingFunction: prefixStyle('transitionTimingFunction'),
            transitionDuration: prefixStyle('transitionDuration'),
            transitionDelay: prefixStyle('transitionDelay'),
            transformOrigin: prefixStyle('transformOrigin'),
            transition: prefixStyle('transition'),
            translateZ: prefixStyle('perspective') in _style ? ' translateZ(0)' : '',
            transitionEnd: (function () {
                var names = {
                    WebkitTransition: 'webkitTransitionEnd',
                    MozTransition: 'transitionend',
                    transition: 'transitionend'
                };
                for (var name in names) {
                    if (core.tmpNode.style[name] !== undefined) {
                        return names[name];
                    }
                }
                return 'transitionend';
            })(),
            // 이름을 transitionStyle으로 바꾸면 안될려나
            style: function ($el, motion, dur, easing) {
                $el.css(this.transition, motion);
                $el.css(this.transitionDuration, dur + 's');
                $el.css(this.transitionTimingFunction, easing);
            },
            /**
             * 주어진 css명 앞에 현재 브라우저에 해당하는 벤더prefix를 붙여준다.
             *
             * @function
             * @param {string} cssName css명
             * @return {string}
             * @example
             * axl.css3.prefix('transition'); // // webkitTransition
             */
            prefix: prefixStyle
        };
    });
    /////////////////////////////////////////////////////////////////////////////////////////////////

})(window[LIB_NAME], window);
;(function (core, global, undefined) {
    "use strict";


    core.addon('Env', /** @lends axl.Env */{
        configs: {},

        /**
         * 설정값을 꺼내오는 함수
         *
         * @param {string} name 설정명. `.`를 구분값으로 단계별로 값을 가져올 수 있다.
         * @param {*} [def] 설정된 값이 없을 경우 사용할 기본값
         * @return {*} 설정값
         * @example
         * axl.Env.get('siteTitle'); // '바이널'
         */
        get: function (name, def) {
            var root = this.configs,
                names = name.split('.'),
                pair = root;

            for (var i = 0, len = names.length; i < len; i++) {
                if (!(pair = pair[names[i]])) {
                    return def;
                }
            }
            return pair;
        },

        /**
         * 설정값을 지정하는 함수
         *
         * @param {string} name 설정명. `.`를 구분값으로 단계를 내려가서 설정할 수 있다.
         * @param {*} value 설정값
         * @return {*} 설정값
         * @example
         * axl.Env.set('siteTitle', '바이널');
         */
        set: function (name, value) {
            var root = this.configs,
                names = name.split('.'),
                len = names.length,
                last = len - 1,
                pair = root;

            for (var i = 0; i < last; i++) {
                pair = pair[names[i]] || (pair[names[i]] = {});
            }
            return (pair[names[last]] = value);
        }
    });
})(window[LIB_NAME], window);
;(function (core, global, undefined) {
    /**
     * 루트클래스로서, axl.BaseClass나 axl.Class를 이용해서 클래스를 구현할 경우 axl.BaseClass를 상속받게 된다.
     * @class
     * @name axl.BaseClass
     * @example
     * var Person = axl.BaseClass.extend({  // 또는 var Person = axl.Class({ 으로 구현해도 동일하다.
	*	$singleton: true, // 싱글톤 여부
	*	$statics: { // 클래스 속성 및 함수
	*		live: function() {} // Person.live(); 으로 호출
	*	},
	*	$mixins: [Animal, Robot], // 특정 클래스에서 메소드들을 빌려오고자 할 때 해당 클래스를 지정(다중으로도 가능),
	*	initialize: function(name) {
	*		this.name = name;
	*	},
	*	say: function(job) {
	*		alert("I'm Person: " + job);
	*	},
	*	run: function() {
	*		alert("i'm running...");
	*	}
	*`});
     *
	 * // Person에서 상속받아 Man클래스를 구현하는 경우
     * var Man = Person.extend({
	*	initialize: function(name, age) {
	*		this.supr(name);  // Person(부모클래스)의 initialize메소드를 호출 or this.suprMethod('initialize', name);
	*		this.age = age;
	*	},
	*	// say를 오버라이딩함
	*	say: function(job) {
	*		this.suprMethod('say', 'programer'); // 부모클래스의 say 메소드 호출 - 첫번째인자는 메소드명, 두번째부터는 해당 메소드로 전달될 인자

	*		alert("I'm Man: "+ job);
	*	}
	* });
     * var man = new Man('kim', 20);
     * man.say('freeman');  // 결과: alert("I'm Person: programer"); alert("I'm Man: freeman");
     * man.run(); // 결과: alert("i'm running...");
     */


    var arraySlice = Array.prototype.slice,
        F = function () {
        },
        ignoreNames = ['superClass', 'members', 'statics', 'hooks'];

    // 부모클래스의 함수에 접근할 수 있도록 .supr 속성에 부모함수를 래핑하여 설정
    function wrap(k, fn, supr) {
        return function () {
            var tmp = this.supr, ret;

            this.supr = supr.prototype[k];
            ret = undefined;
            try {
                ret = fn.apply(this, arguments);
            } catch (e) {
                console.error(e);
            } finally {
                this.supr = tmp;
            }
            return ret;
        };
    }

    // 속성 중에 부모클래스에 똑같은 이름의 함수가 있을 경우 래핑처리
    function inherits(what, o, supr) {
        core.each(o, function (v, k) {
            what[k] = core.isFunction(v) && core.isFunction(supr.prototype[k]) ? wrap(k, v, supr) : v;
        });
    }

    var classSyntax = {};
    function classExtend(name, attr, parentClass) {
        var supr = parentClass || this,
            statics, mixins, singleton, instance, hooks, requires, name, strFunc;

        if (!core.type(name, 'string')) {
            attr = name;
            name = undefined;
        }

        if (core.type(attr, 'function')) {
            attr = attr();
        }

        singleton = attr.$singleton || false;
        statics = attr.$statics || false;
        mixins = attr.$mixins || false;
        hooks = attr.$hooks || false;
        requires = attr.$requires || false;
        name = name || attr.$name || 'BaseClass';

        !attr.initialize && (attr.initialize = supr.prototype.initialize || function () {});

        function constructor() {
            if (singleton && instance) {
                return instance;
            } else {
                instance = this;
            }

            var args = arraySlice.call(arguments),
                self = this,
                ctr = self.constructor;

            if (self.initialize) {
                self.initialize.apply(this, args);
            } else {
                supr.prototype.initialize && supr.prototype.initialize.apply(self, args);
            }

            /**if (constructor.hooks) {
                // 페이지상에서 한번만 실행
                if (!ctr.hooks.inited) {
                    ctr.hooks.init && core.each(ctr.hooks.init, function (fn) {
                        fn.call(me);
                    });
                    ctr.hooks.inited = true;
                }

                // 생성때마다 실행
                ctr.hooks.create && core.each(ctr.hooks.create, function (fn) {
                    fn.call(me);
                });
            }**/
        }

        if (!singleton) {
            strFunc = "return function " + name + "() { constructor.apply(this, arguments); }";
        } else {
            strFunc = "return function " + name + "() { if(instance) { return instance; } else { instance = this; } constructor.apply(this, arguments); }";
        }

        classSyntax[name] = new Function("constructor", "instance",
            strFunc
        )(constructor, instance);

        F.prototype = supr.prototype;
        classSyntax[name].superClass = supr.prototype;
        classSyntax[name].prototype = new F;
        /**
         * 해당 클래스에서 상속된 새로운 자식클래스를 생성해주는 함수
         * @function
         * @name axl.BaseClass.extend
         * @param {object} memthods 메소드모음
         * @return {axl.BaseClass} 새로운 클래스
         * @example
         * var Child = axl.BaseClass.extend({
             *     show: function(){
             *         alert('hello');
             *     }
             * });
         *
         * new Child().show();
         */
        classSyntax[name].extend = classExtend;
        core.extend(classSyntax[name].prototype, {
            constructor: classSyntax[name],
            destroy: function () {},
            proxy: function (fn) {
                var self = this;
                if (typeof fn === 'string') {
                    fn = self[fn];
                }
                return function () {
                    return fn.apply(self, arguments);
                };
            },
            /**
             * 메소드내부에서 부모클레스의 메소드를 명시적으로 호출하고자 할 때 사용
             * @function
             * @name axl.BaseClass#suprByName
             * @return {*} 해당 부모함수의 반환값
             * @example
             * var Parent = axl.BaseClass.extend({
             *     show: function(){
             *         alert('parent.show');
             *     }
             * });
             * var Child = Parent.extend({
             *     // override
             *     show: function(){
             *         this.supr(); // Parent#show()가 호출됨
             *         alert('child.show');
             *     },
             *     display: function(){
             *         this.suprByName('show'); // 특정 부모함수를 명명해서 호출할 수 도 있음
             *     }
             * });
             * var child = new Child();
             * child.show(); // alert('parent.show'); alert('child.show');
             * child.display(); // alert('parent.show');
             */
            suprByName: function (name) {
                var args = arraySlice.call(arguments, 1);
                return supr.prototype[name].apply(this, args);
            }
        });

        if (singleton) {
            /**
             * 싱클톤 클래스의 객체를 반환
             * @function
             * @name axl.BaseClass.getInstance
             * @return {axl.BaseClass}
             * @example
             * var Child = axl.BaseClass.extend({
                 *    $singleton: true,
                 *    show: function(){
                 *        alert('hello');
                 *    }
                 * });
             * Child.getInstance().show();
             * Child.getInstance().show();
             */
            classSyntax[name].getInstance = function () {
                var arg = arguments,
                    len = arg.length;
                if (!instance) {
                    switch (true) {
                        case !len:
                            instance = new classSyntax[name];
                            break;
                        case len === 1:
                            instance = new classSyntax[name](arg[0]);
                            break;
                        case len === 2:
                            instance = new classSyntax[name](arg[0], arg[1]);
                            break;
                        default:
                            instance = new classSyntax[name](arg[0], arg[1], arg[2]);
                            break;
                    }
                }
                return instance;
            };
        }

        /**
         * 해당 클래스의 객체가 생성될 때 hook를 등록하는 클래스함수
         * @function
         * @name axl.BaseClass.hooks
         * @param {string} name 훅 이름('init' 는 처음에 한번만 실행, 'create' 는 객체가 생성될 때마다 실행)
         * @param {function} func 실행할 훅 함수
         * @example
         * var Child = axl.BaseClass.extend({
             *     show: function(){
             *         alert('hello');
             *     }
             * });
         * Child.hooks('init', function(){
             *     alert('초기화');
             * });
         * Child.hooks('create', function(){
             *     alert('객체생성');
             * });
         *
         * new Child(); // alert('초기화'); alert('객체생성');
         * new Child(); // alert('객체생성');
         */
        classSyntax[name].hooks = {init: [], initialize: []};
        core.extend(true, classSyntax[name].hooks, supr.hooks);
        hooks && core.each(hooks, function (name, fn) {
            classSyntax[name].hooks(name, fn);
        });


        classSyntax[name].mixins = function (o) {
            var self = this;
            if (!o.push) {
                o = [o];
            }
            var proto = self.prototype;
            core.each(o, function (mixObj, i) {
                if (!mixObj) {
                    return;
                }
                core.each(mixObj, function (fn, key) {
                    if (key === 'build' && self.hooks) {
                        self.hooks.init.push(fn);
                    } else if (key === 'create' && self.hooks) {
                        self.hooks.create.push(fn);
                    } else {
                        proto[key] = fn;
                    }
                });
            });
        };
        mixins && classSyntax[name].mixins.call(classSyntax[name], mixins);

        /**
         * 이미 존재하는 클래스에 메소드 추가
         * @function
         * @name axl.BaseClass.members
         * @param o {object} methods 메소드 모음 객체
         * @example
         * var Parent = axl.BaseClass.extend({});
         * Parent.members({
             *     show: function(){
             *         alert('hello');
             *     }
             * });
         * new Parent().show();
         */
        classSyntax[name].members = function (o) {
            inherits(this.prototype, o, supr);
        };
        attr && classSyntax[name].members.call(classSyntax[name], attr);

        /**
         * 이미 존재하는 클래스에 정적메소드 추가
         * @function
         * @name axl.BaseClass.members
         * @param o {object} methods 메소드 모음 객체
         * @example
         * var Parent = axl.BaseClass.extend({});
         * Parent.statics({
             *     show: function(){
             *         alert('hello');
             *     }
             * });
         * Parent.show();
         */
        classSyntax[name].statics = function (o) {
            o = o || {};
            for (var k in o) {
                if (core.array.indexOf(ignoreNames, k) < 0) {
                    this[k] = o[k];
                }
            }
            return this;
        };
        classSyntax[name].statics.call(classSyntax[name], supr);
        statics && classSyntax[name].statics.call(classSyntax[name], statics);

        return classSyntax[name];
    }

    var BaseClass = function () {};
    BaseClass.extend = classExtend;
    core.extend(BaseClass.prototype, {
        constructor: BaseClass,
        initialize: function () {},
        destroy: function () {},
        release: function () { this.destroy(); },
        proxy: function (fn) {
            return fn.bind(this);
        }
    });
    core.BaseClass = BaseClass;


    /**
     * 클래스를 생성해주는 함수(axl.BaseClass.extend 별칭)
     * @param {object} attr 메소드 모음 객체
     * @returns {axl.BaseClass} 새로운 객체
     * @example
     * var Parent = axl.Class({
         *     show: function(){
         *         alert('parent.show');
         *     }
         * });
     * var Child = axl.Class({
         *     $extend: Parent, // 부모클래스
         *     run: function(){
         *          alert('child.run');
         *     }
         * });
     * new Child().show();
     * new Child().run();
     */
    core.Class = function (attr) {
        return classExtend(attr.name || attr.$name || 'unknown', attr, attr.$extend || BaseClass);
    };

})(window[LIB_NAME], window);
;(function ($, core, global, undefined) {
    /**
     }
     * benchmark 모듈
     */
    core.addon(/** @lends axl */{
        /**
         * timeStart("name")로 name값을 키로하는 타이머가 시작되며, timeEnd("name")로 해당 name값의 지난 시간을 로그에 출력해준다.
         *
         * @param {string} name 타이머의 키값
         * @param {boolean} reset=false 리셋(초기화) 여부
         *
         * @example
         * axl.timeStart('animate');
         * ...
         * axl.timeEnd('animate'); -> animate: 10203ms
         */
        timeStart: function (name, reset) {
            if (!name) {
                return;
            }
            var time = +new Date,
                key = "KEY" + name.toString();

            this.timeCounters || (this.timeCounters = {});
            if (!reset && this.timeCounters[key]) {
                return;
            }
            this.timeCounters[key] = time;
        },

        /**
         * timeStart("name")에서 지정한 해당 name값의 지난 시간을 로그에 출력해준다.
         *
         * @param {string} name 타이머의 키값
         * @return {number} 걸린 시간
         *
         * @example
         * axl.timeStart('animate');
         * ...
         * axl.timeEnd('animate'); -> animate: 10203ms
         */
        timeEnd: function (name) {
            if (!this.timeCounters) {
                return null;
            }

            var time = +new Date,
                key = "KEY" + name.toString(),
                timeCounter = this.timeCounters[key],
                diff;

            if (timeCounter) {
                diff = time - timeCounter;
                // 이 콘솔은 디버깅을 위한 것이므로 지우지 말것.
                console.log('[' + name + '] ' + diff + 'ms');
                delete this.timeCounters[key];
            }
            return diff;
        }
    });

})(jQuery, window[LIB_NAME], window)
/**
 * axl.importJs
 */
;(function ($, core, global, undefined) {
    // benchmark: https://github.com/malko/l.js/blob/master/l.js

    var isA = function (a, b) {
            return a instanceof (b || Array);
        },
        doc = document,
        bd = doc.getElementsByTagName("body")[0] || doc.documentElement,
        appendElmt = function (type, attrs, callback) {
            var e = doc.createElement(type), i;
            if (callback && isA(callback, Function)) {
                if (e.readyState) {
                    e.onreadystatechange = function () {
                        if (e.readyState === "loaded" || e.readyState === "complete") {
                            e.onreadystatechange = null;
                            callback();
                        }
                    };
                } else {
                    e.onload = callback;
                }
            }
            for (i in attrs) {
                attrs[i] && (e.setAttribute(i, attrs[i]));
            }
            bd.appendChild(e);
        };

    core.loadJs = core.importJs = function (url, callback) {
        if (!isA(url)) {
            url = [url];
        }
        var len = url.length,
            oriLen = len,
            loaded = 0;

        while(len--) {
            appendElmt('script', {
                'type': 'text/javascript',
                'data-import': 'true',
                'src': url
            }, function () {
                loaded += 1;
                if (loaded === oriLen) {
                    callback && callback();
                }
            });
        }
    };

    ////////////////////////////////////////////////////
})(jQuery, window[LIB_NAME], window);
;(function (core, global, undefined) {
    var doc = document;

    /**
     * @namespace
     * @name axl.Cookie
     */
    core.addon('Cookie', /** @lends axl.Cookie */ {
        defaults: {
            // domain: location.host,
            path: ''
        },

        /**
         * 쿠키를 설정
         *
         * @param {string} name 쿠키명
         * @param {string} value 쿠키값
         * @param {object} [options]
         * @param {date} [options.expires] 만료시간
         * @param {string} [options.path] 쿠키의 유효경로
         * @param {string} [options.domain] 쿠키의 유효 도메인
         * @param {boolean} [options.secure] https에서만 쿠키 설정이 가능하도록 하는 속성
         * @example
         * axl.Cookie.set('userid', 'axl');
         * // or
         * axl.Cookie.set({
         *              'userid': 'axl',
         *              'name': '바이널'
         *              });
         */
        set: function (name, value, options) {
            if (!core.type(name, 'string')) {
                core.each(name, function (val, key) {
                    this.set(key, value, value);
                }.bind(this));
                return;
            }

            options = core.extend({}, options || {}, this.defaults);
            var curCookie = name + "=" + encodeURIComponent(value) +
                ((options.expires) ? "; expires=" + (options.expires instanceof Date ? options.expires.toGMTString() : options.expires) : "") +
                ((options.path) ? "; path=" + options.path : '') +
                ((options.domain) ? "; domain=" + options.domain : '') +
                ((options.secure) ? "; secure" : "");

            doc.cookie = curCookie;
        },

        /**
         * 쿠키를 설정
         *
         * @param {string} name 쿠키명
         * @return  {string} 쿠키값
         * @example
         * axl.Cookie.get('userid'); // 'axl'
         */
        get: function (name) {
            var j, g, h, f;
            j = ";" + doc.cookie.replace(/ /g, "") + ";";
            g = ";" + name + "=";
            h = j.indexOf(g);

            if (h !== -1) {
                h += g.length;
                f = j.indexOf(";", h);
                return decodeURIComponent(j.substr(h, f - h));
            }
            return "";
        },

        /**
         * 쿠키 삭제
         *
         * @param {string} name 쿠키명
         * @example
         * core.Cookie.remove('userid');
         * // or
         * core.Cookie.remove(['userid', 'name']);
         */
        remove: function (name) {
            if (core.type(name, 'string')) {
                doc.cookie = name + "=;expires=Fri, 31 Dec 1987 23:59:59 GMT;";
            } else {
                core.each(name, function (val, key) {
                    this.remove(key);
                }.bind(this))
            }
        },

        /**
         * sep를 구분자로 하여 문자열로 조합하여 쿠키에 셋팅
         * @param {string} name 쿠키명
         * @param {string} val 값
         * @param {string} sep 구분자
         * @example
         * axl.Cookie.setItem('arr', 'a');
         * axl.Cookie.setItem('arr', 'b');  // arr:a|b
         */
        setItem: function (name, val, sep) {
            sep = sep || '|';
            val = val + '';

            var value = this.get(name),
                values = value ? value.split(sep) : [];

            if (!core.array.include(values, val)) {
                values.push(val);
            }

            this.set.apply(this, [name, values.join(sep)].concat(arguments));
        },

        getItems: function (name) {
            var val = this.get(name) || '';
            if (!$.trim(val)) {
                return [];
            }
            return val.split('|');
        },

        /**
         * name에 셋팅되어 있던 조합문자열에서 val를 제거
         * @param {string} name 쿠키명
         * @param {string} val 값
         * @param {string} sep
         * @example
         * axl.Cookie.setItem('arr', 'a');
         * axl.Cookie.setItem('arr', 'b');  // arr='a|b'
         * axl.Cookie.removeItem('arr', 'b'); // arr='a'
         */
        removeItem: function (name, val, sep) {
            sep = sep || '|';
            val = val + '';

            var value = this.get(name),
                values = value ? value.split(sep) : [];

            values = core.array.remove(values, val);

            this.set.apply(this, [name, values.join(sep)].concat(arguments));
        }
    });

})(window[LIB_NAME], window);
;(function ($, core, global, undefined) {
    /**
     * @namespace
     * @name axl.util
     */
    core.addon('util', function () {
        return /** @lends axl.util */{
            /**
             * 이미지가  wrap에 맞춰 자동 조절 되도록
             * @param images
             * @returns {*}
             */
            imageCover: function (images) {
                $(images).each(function () {
                    var ir = this.width / this.height,
                        $wrap = $(this).css('visibility', '').parent(),
                        er = $wrap.width() / $wrap.height();

                    if (ir < er) {
                        $(this).addClass('portrait');
                    } else {
                        $(this).removeClass('portrait');
                    }
                });
            },

            /**
             * 팝업을 띄우는 함수. (axl.openPopup으로도 사용가능)
             * @param {string} url 주소
             * @param {Number=} width 너비. 또는 옵션
             * @param {Number=} height 높이.
             * @param {opts=} 팝업 창 모양 제어 옵션.(커스텀옵션: name(팝업이름), align(=center, 부모창의 가운데에 띄울것인가),
             * @example
             * axl.openPopup('http://google.com', 500, 400, {name: 'notice', align: null, scrollbars: 'no'});
             * //or
             * axl.openPopup('http://google.com', {name: 'notice', width: 500, height: 400, scrollbars: 'no'});
             */
            openPopup: function (url, width, height, opts) {
                if (arguments.length === 2 && core.type(width, 'json')) {
                    opts = width;
                    width = opts.width || 600;
                    height = opts.height || 400;
                }

                opts = $.extend({
                    name: 'popupWin',
                    width: width || 600,
                    height: height || 400,
                    align: 'center',
                    resizable: 'no',
                    scrollbars: 'no'
                }, opts);

                var target = opts.target || opts.name || 'popupWin',
                    feature = 'app_, ',
                    tmp = [],
                    winCoords;

                if (opts.align === 'center') {
                    winCoords = core.util.popupCoords(opts.width, opts.height);
                    opts.left = winCoords.left;
                    opts.top = winCoords.top;
                }
                delete opts.name;
                delete opts.target;
                delete opts.align;

                core.detect.isSafari && tmp.push('location=yes');
                core.each(opts, function (val, key) {
                    tmp.push(key + '=' + val);
                });
                feature += tmp.join(', ');

                var popupWin = window.open(url, target, feature);
                /*if (!popupWin || popupWin.outerWidth === 0 || popupWin.outerHeight === 0) {
                 alert("팝업 차단 기능이 설정되어 있습니다\n\n차단 기능을 해제(팝업허용) 한 후 다시 이용해 주세요.");
                 return false;
                 }

                 if (popupWin.location.href === 'about:blank') {
                 popupWin.location.href = url;
                 }*/

                return popupWin;
            },

            /**
             * 팝업을 띄운 후에 주어진 콜백함수를 호출
             * @param {string} url 주소
             * @param {object} feature 팝업 모양 (커스텀옵션: name(팝업이름), align(=center: 부모창의 가운데에 띄울것인가),
             * @param {function()} (Optional) callback 띄워진 후에 실행할 콜백함수
             * @example
             * axl.util.openPopupAndExec('http://google.com', {name: 'notice', width: 500, height:400, align: 'nw'}, function(popup){
             *     alert('팝업이 정상적으로 띄워졌습니다.');
             *     popup.close(); // 열자마자 닫아버림....:-b
             * });
             */
            openPopupAndExec: function (url, feature, callback) {
                feature || (feature = {});

                var popupWin;

                if ((popupWin = this.openPopup(url, feature.width, feature.height, feature)) === false) {
                    return;
                }
                if (!callback) {
                    return;
                }

                var limit = 0, // 5초 이내에 팝업이 로딩안되면 콜백함수 무시해버림
                    fn = function () {
                        if (limit++ > 50) {
                            return;
                        }
                        if (!popupWin.document.body) {
                            setTimeout(fn, 100);
                            return;
                        }
                        callback && callback(popupWin);
                        popupWin.focus();
                    };

                if (!popupWin.document.body) {
                    setTimeout(fn, 100);
                } else {
                    fn();
                }
            },


            /**
             * 컨텐츠 사이즈에 맞게 창사이즈를 조절
             * @example
             * axl.util.resizeToContent(); // 팝업에서만 사용
             */
            resizeToContent: function () {
                var innerX, innerY,
                    pageX, pageY,
                    win = window,
                    doc = win.document;

                if (win.innerHeight) {
                    innerX = win.innerWidth;
                    innerY = win.innerHeight;
                } else if (doc.documentElement && doc.documentElement.clientHeight) {
                    innerX = doc.documentElement.clientWidth;
                    innerY = doc.documentElement.clientHeight;
                } else if (doc.body) {
                    innerX = doc.body.clientWidth;
                    innerY = doc.body.clientHeight;
                }

                pageX = doc.body.offsetWidth;
                pageY = doc.body.offsetHeight;

                win.resizeBy(pageX - innerX, pageY - innerY);
            },

            /**
             * 팝업의 사이즈에 따른 화면상의 중앙 위치좌표를 반환
             * @param {number} w 너비.
             * @param {number} h 높이.
             * @return {{left:Number, top:Number}} {left: 값, top: 값}
             */
            popupCoords: function (w, h) {
                w = w || 400;
                h = h || 300;

                var dualScreenLeft = 'screenLeft' in window ? window.screenLeft : screen.left,
                    dualScreenTop = 'screenTop' in window ? window.screenTop : screen.top,
                    width = window.innerWidth || document.documentElement.clientWidth || screen.width,
                    height = window.innerHeight || document.documentElement.clientHeight || screen.height,
                    left = ((width / 2) - (w / 2)) + dualScreenLeft,
                    top = ((height / 2) - (h / 2)) + dualScreenTop;

                return {
                    left: left,
                    top: top
                };
            },

            /**
             * data-src속성에 있는 이미지url를 src에 설정하여 로드시키는 함수
             * @param {string} target 이미지 요소
             * @return {promise} promise
             * @example
             * axl.util.loadImages('img[data-src]').done(function(){
             *     alert('모든 이미지 로딩 완료');
             * });
             */
            loadImages: function (target) {
                var $imgs = $(target),
                    len = $imgs.length,
                    idx = len,
                    def = $.Deferred();
                function loaded(e) {
                    if (e.type === 'error') {
                        def.reject(e.target);
                        return;
                    }
                    var $target;
                    // 이미지가 아닐 경우 배경으로 깐다.
                    if ($target = $(this).data('target')) {
                        $target.css('background', 'url(' + this.src + ')');
                    }
                    idx--;
                    def.notify(this, (len - idx) / len * 100);
                    if (!idx) {
                        def.resolve();
                    }
                }
                if (!len) {
                    def.resolve();
                } else {
                    $imgs.each(function (i) {
                        var $img = $imgs.eq(i);
                        // 이미지가 아닐 경우
                        if (!$img.is('img')) {
                            $img = $('<img>').data({
                                'target': $img[0],
                                'src': $img.attr('data-src')
                            });
                        }
                        $img.one("load.lazyload error.lazyload", loaded);
                        var src = $img.attr("data-src");
                        if (src) {
                            $img.attr("src", src);
                        } else if (this.complete) {
                            $img.trigger("load");
                        }
                    });
                }
                return def.promise();
            },

            /**
             * 정확한 사이즈계산을 위해 내부에 있는 이미지를 다 불러올 때까지 기다린다.
             * @param {jQuery} $imgs 이미지 요소들
             * @param {boolean} allowError 에러 허용여부(true이면 중간에 에러가 나도 다음 이미지를 대기)
             * @return {promise}
             * @example
             * axl.util.waitImageLoad('img[data-src]').done(function(){
             *     alert('모든 이미지 로딩 완료');
             * });
             */
            waitImageLoad: function (imgs, allowError) {
                if (core.type(imgs, 'string')) {
                    imgs = $(imgs);
                }
                var self = this,
                    defer = $.Deferred(),
                    count = imgs.length,
                    total = count,
                    loaded = function () {
                        count -= 1;

                        var percent = 100 - (count/total) * 100;
                        defer.notify(percent, count, total);
                        if (count <= 0) {
                            defer.resolve(imgs);
                        }
                    };
                if (count === 0) {
                    defer.resolve();
                } else {
                    setTimeout(function () {
                        imgs.each(function (i) {
                            if (this.complete || this.naturalWidth >= 0) {
                                loaded.call(this);
                            } else {
                                var fakeImg = new Image();
                                fakeImg.onload = function () {
                                    loaded.call(this);
                                    fakeImg.onload = null;
                                    fakeImg = null;
                                };
                                if (allowError) {
                                    fakeImg.onerror = function () {
                                        loaded.call(this);
                                        fakeImg = null;
                                    }
                                }
                                fakeImg.src = this.src;
                            }
                        });
                    });
                }

                return defer.promise();
            },

            /**
             * 이미지의 원래 사이즈 구하기
             * @param src
             * @param callback
             */
            getImageSize: function (src, callback) {
                var img;
                img = new Image();
                img.onload = function () {
                    callback(this.width + " " + this.height);
                };
                img.src = src;
            },

            /**
             * 어떤 요소의 자식들의 총 너비를 구하는 함수
             * @param {jQuery|NodeCollection} items 자식요소들
             * @return {number}
             */
            getItemsWidth: function (items) {
                var width = 0;
                $(items).each(function () {
                    width += $(this).width();
                });
                return width;
            },
            /**
             * 디바이스의 방향 체크
             * @returns {string}
             */
            getDeviceOrientation: function(){
                var orientation = "portrait";
                if($win.width() > $win.height()){
                    orientation = "landscape";
                }
                return orientation;
            },

            /**
             * 스크롤이벤트 무효화
             * @param $el
             */
            disableScroll: function($el) {
                $el = $el || $win;

                var scrollTop = $el.scrollTop();
                $el.on("scroll.disableScroll mousewheel.disableScroll DOMMouseScroll.disableScroll touchmove.disableScroll", function(event) {
                    event.preventDefault();
                    $el.scrollTop(scrollTop);
                });
            },

            /**
             * 스크롤이벤트 무효화 취소
             * @param $el
             */
            enableScroll: function($el) {
                $el = $el || $win;

                $el.off(".disableScroll");
            },
            /**
             * json 문자 파싱(eval 이용)
             * @param str
             * @returns {*}
             */
            parse: function (str) {
                return (new Function('return (' + str + ')'))();
            },

            /**
             * 풀스크린 모드 전환
             * @param el
             */
            requestFullScreen: function (el) {
                if (typeof el === 'string') {
                    el = document.getElementById(el);
                }
                if (el.requestFullscreen) {
                    el.requestFullscreen();
                } else if (el.webkitRequestFullscreen) {
                    el.webkitRequestFullscreen();
                } else if (el.mozRequestFullScreen) {
                    el.mozRequestFullScreen();
                } else if (el.msRequestFullscreen) {
                    el.msRequestFullscreen();
                }
            }
        };
    });

})(jQuery, window[LIB_NAME], window);
;(function ($, core, global, undefined) {
    "use strict";

    function getDocSize(name) {
        var doc = document,
            bd = doc.body,
            de = doc.documentElement;

        return Math.max(
            Math.max(bd['scroll'+name], de['scroll'+name]),
            Math.max(bd['offset'+name], (de['offset'+name] - (de['offset'+name] - de['client'+name]))),
            Math.max(bd['client'+name], de['client'+name])
        );
    }

    function getWinSize(name) {
        var w = 0,
            self = global;

        if (self['inner'+name]) {
            w = self['inner'+name];
        } else if (document.documentElement && document.documentElement['client'+name]) {
            w = document.documentElement['client'+name];
        } else if (document.body) {
            w = document.body['client'+name];
        }
        return w;
    }

    var prefixNames = [
        'webkit',
        'moz',
        'ms',
        ''
    ];
    function getPrefix(name, callback) {
        var val;
        for (var i = -1, item; item = prefixNames[++i]; ) {
            if (item) {
                val = item + core.string.toFirstUpper(name);
            } else {
                val = name;
            }
            if (callback(val)) {
                return val;
            }
        }
        return name;
    }

    /**
     * @namespace
     * @name axl.dom
     */
    core.addon('dom', /** @lends axl.dom */{
        /**
         * css3 support
         * @var {boolean}
         */
        css3: core.css3.support,
        /**
         * css3d support
         * @var {boolean}
         */
        css3D: core.css3.support3D,
        /**
         * transitionend event name
         * @var {string}
         */
        transitionEnd: core.css3.transitionEnd,
        /**
         * transform name
         * @var {string}
         */
        transform: core.css3.transform,
        /**
         * ransformOrigin name
         * @var {string}
         */
        transformOrigin: core.css3.transformOrigin,
        /**
         * translateZ name
         * @var {string}
         */
        translateZ: core.css3.translateZ,
        /**
         * transition name
         * @var {string}
         */
        transition: core.css3.transition,
        /**
         * transitionDelay name
         * @var {string}
         */
        transitionDelay: core.css3.transitionDelay,
        /**
         * transitionDuration name
         * @var {string}
         */
        transitionDuration: core.css3.transitionDuration,
        /**
         * transitionTimingFunction name
         * @var {string}
         */
        transitionTimingFunction: core.css3.transitionTimingFunction,
        /**
         * translate 위치 반환
         * @function
         * @return {{x: (*|number), y: (*|number)}}
         */
        getTranslateXY: core.css3.getTranslateXY,
        /**
         * 주어진 스타일에 해당 vendor prefix 추가(브라우저에서 지원되는거면 아무것도 안붙임)
         * @param name
         * @return {string} name에 벤더 prefix를 붙여서 반환
         */
        getVendorStyle: function (name) {
            return getPrefix(name, function (name) {
                return core.tmpNode.style[name] !== undefined;
            });
        },
        /**
         * 주어진 속성에 해당 vendor prefix 추가(브라우저에서 지원되는거면 아무것도 안붙임)
         * @param name
         * @return {string} name에 벤더 prefix를 붙여서 반환
         */
        getVendorAttr: function (name) {
            return getPrefix(name, function (name) {
                return core.tmpNode[name] !== undefined;
            });
        },
        /**
         * 주어진 이벤트에 해당 vendor prefix 추가(브라우저에서 지원되는거면 아무것도 안붙임)
         * @param name
         * @return {string} name에 벤더 prefix를 붙여서 반환
         */
        getVendorEvent: function (name) {
            return getPrefix(name, function (name) {
                return core.tmpNode[name] !== undefined;
            });
        },
        /**
         * 이벤트의 좌표 추출
         * @param ev 이벤트 객체
         * @param {string} type mouseend나 touchend 이벤트일때 'end'를 넘겨주면 좀더 정확한 값이 반환된다.
         * @return {{x: (*|number), y: (*|number)}}
         */
        getEventPoint: function (ev, type) {
            var e = ev.originalEvent || ev;
            if (type === 'end' || ev.type === 'touchend') {
                e = e.changedTouches && e.changedTouches[0] || e;
            } else {
                e = e.touches && e.touches[0] || e;
            }
            return {
                x: e.pageX || e.clientX,
                y: e.pageY || e.clientY
            };
        },
        /**
         *  캐럿 위치 반환
         *  @param {element} el 인풋 엘리먼트
         *  @return {{begin:(number), end:(number)}}
         */
        getCaretPos: function (el) {
            if (core.type(el.selectionStart, 'number')) {
                return {
                    begin: el.selectionStart,
                    end: el.selectionEnd
                };
            }

            var range = document.selection.createRange();
            if (range && range.parentElement() === el) {
                var inputRange = el.createTextRange(), endRange = el.createTextRange(), length = el.value.length;
                inputRange.moveToBookmark(range.getBookmark());
                endRange.collapse(false);

                if (inputRange.compareEndPoints('StartToEnd', endRange) > -1) {
                    return {
                        begin: length,
                        end: length
                    };
                }

                return {
                    begin: -inputRange.moveStart('character', -length),
                    end: -inputRange.moveEnd('character', -length)
                };
            }

            return {
                begin: 0,
                end: 0
            };
        },
        /**
         * 캐럿 위치 설정
         *
         * @param {element} el 엘리먼트
         * @param {object|number} pos 위치시키고자 하는 begin & end
         * @param {number} pos.begin
         * @param {number} pos.end
         */
        setCaretPos: function (el, pos) {
            if (!core.type(pos, 'object')) {
                pos = {
                    begin: pos,
                    end: pos
                };
            }

            if (el.setSelectionRange) {
                //el.focus();
                el.setSelectionRange(pos.begin, pos.end);
            } else if (el.createTextRange) {
                var range = el.createTextRange();
                range.collapse(true);
                range.moveEnd('character', pos.end);
                range.moveStart('character', pos.begin);
                range.select();
            }
        },
        /**
         * $el요소의 현재 위치를 반환
         * @param {element} $el
         * @return {{x: (*|number), y: (*|number)}}
         */
        position: function () {
            return core.css3.position.apply(core.css3, [].slice.call(arguments, 0));
        },

        /**
         * @function
         *
         * css3가 지원되면 transition으로, 아닌 곳에서는 left으로 el를 움직여준다.
         * @param {element} $el 대상 엘리먼트
         * @param {number} x x축 이동 크기
         * @param {number} y y축 이동 크기
         * @param {number} duration 애니메이션 시간
         * @param {function} [callback] 이동이 완료됐을 때 실행되는 콜백함수
         */
        move: core.css3.support ? function () {
            core.css3.move.apply(core.css3, [].slice.call(arguments, 0));
        } : function ($el, x, y, duration, callback) {
            var css = {};
            if (typeof x !== 'undefined') {
                css.left = x;
            }
            if (typeof y !== 'undfined') {
                css.top = y;
            }

            if (!duration) {
                $el.css(css);
                callback && callback();
            } else {
                $el.stop(false, true).animate(css, duration, function () {
                    callback && callback.apply(this, [].slice.call(arguments, 0));
                });
            }
        },
        /**
         * 주어진 el이 container 내부에 속한 엘리먼트인가
         * @param {element} container 컨테이너 엘리먼트
         * @param {element} el 엘리먼드
         * @param {boolean} [isIncludeSelf=true] 컨테이너 자신도 체크대상에 포함시킬 것인가
         * @returns {boolean}
         */
        contains: function (container, el, isIncludeSelf) {
            if (!container || !el) {
                return false;
            }
            if ('contains' in container) {
                return (container !== el && container.contains(el)) || (isIncludeSelf === true && container === el);
            } else {
                return (container.compareDocumentPosition(el) % 16) || (isIncludeSelf === true && container === el);
            }
        },

        /**
         * 눌러진 마우스 버튼 반환
         * @param {jquery.event} e
         * @return {string} [left|middle|right]
         */
        getMouseButton: function (e) {
            var type = '';
            if (e.which == null) {
                type = (e.button < 2) ? 'left' : ((e.button == 4) ? 'middle' : 'right');
            } else {
                type = (e.which < 2) ? 'left' : ((e.which == 2) ? 'middle' : 'right');
            }
            return type;
        },

        /**
         * 도큐먼트의 높이를 반환
         * @return {number}
         * @example
         * alert(axl.dom.getDocHeight());
         */
        getDocHeight: function () {
            return getDocSize('Height');
        },

        /**
         * 도큐먼트의 너비를 반환
         * @return {number}
         * @example
         * alert(axl.dom.getDocWidth());
         */
        getDocWidth: function () {
            return getDocSize('Width')
        },

        /**
         * 창의 너비를 반환
         * @return {number}
         * @example
         * alert(axl.dom.getWinWidth());
         */
        getWinWidth: function () {
            return getWinSize('Width');
        },

        /**
         * 창의 높이를 반환
         * @return {number}
         * @example
         * alert(axl.dom.getWinHeight());
         */
        getWinHeight: function () {
            return getWinSize('Height');
        },

        /**
         * 주어진 요소의 사이즈 & 위치를 반환
         * @param {element} elem
         * @return {{width:Number, height:Number, offset:{top:Number, left:Number}}} {width: 너비, height: 높이, offset: { top: 탑위치, left: 레프트위치}}
         *
         * @example
         * var dims = axl.dom.getDimensions('#box');
         * console.log(dims.left, dims.top, dims.width, dims.height);
         */
        getDimensions: function (elem) {
            var rect = this.getRect(elem);

            rect.left = rect.left - this.getScrollLeft();
            rect.top = rect.top - this.getScrollTop();
            rect.right = rect.left + rect.width;
            rect.bottom = rect.top + rect.height;

            return rect;
        },

        /**
         * 주어진 요소의 사이즈 & 위치를 반환(스크롤 위치 무시)
         * @param {element} elem
         * @return {{width:Number, height:Number, offset:{top:Number, left:Number}}} {width: 너비, height: 높이, offset: { top: 탑위치, left: 레프트위치}}
         *
         * @example
         * var dims = axl.dom.getRect('#box');
         * console.log(dims.left, dims.top, dims.width, dims.height);
         */
        getRect: function (elem) {
            elem = $(elem);

            var width, height;
            var offset = elem.offset();

            width = elem.outerWidth();
            height = elem.outerHeight();

            return {
                width: width,
                height: height,
                top: offset.top,
                left: offset.left,
                bottom: offset.top + height,
                right: offset.left + width
            };
        },

        /**
         * 해당브라우저의 휠이벤트,명 반환
         * @function
         * @return {string} 휠이벤트명
         */
        mouseWheel: ( 'onwheel' in document || document.documentMode >= 9 ) ? 'wheel' : 'mousewheel DomMouseScroll MozMousePixelScroll',

        /**
         * 휠이벤트의 deltaY 추출(위로: 1, 아래로: -1)
         * @param {jQuery#Event}
         * @return {number} deltaY
         * @example
         * $el.on('mousewheel DOMMouseScroll wheel', function (e) {
             *     var deltaY = axl.dom.getDeltaY(e);
             * });
         */
        getDeltaY: function (e) {
            return this.getWheelDelta(e).y;
        },

        /**
         * 휠이벤트의 deltaX 추출(우: 1, 좌: -1)
         * @param {jQuery#Event}
         * @example
         * $el.on('mousewheel DOMMouseScroll wheel', function (e) {
             *     var deltaX = axl.dom.getDeltaX(e);
             * });
         */
        getDeltaX: function (e) {
            return this.getWheelDelta(e).x;
        },

        /**
         * 휠이벤트의 deltaX, deltaY 추출(상: 1, 하: -1, 우: 1, 좌: -1)
         * @param {jQuery#Event}
         * @return {{x:Number, y:Number}}
         * @example
         * $el.on('mousewheel DOMMouseScroll wheel', function (e) {
             *     var delta = axl.dom.getWheelDelta(e);
             *     // delta.x;
             *     // delta.y;
             * });
         */
        getWheelDelta: function (e) {
            var wheelDeltaX, wheelDeltaY;

            e = e.originalEvent || e;
            if ('deltaX' in e) {
                if (e.deltaMode === 1) {
                    wheelDeltaX = -e.deltaX;
                    wheelDeltaY = -e.deltaY;
                } else {
                    wheelDeltaX = -e.deltaX;
                    wheelDeltaY = -e.deltaY;
                }
            } else if ('wheelDeltaX' in e) {
                wheelDeltaX = e.wheelDeltaX;
                wheelDeltaY = e.wheelDeltaY;
            } else if ('wheelDelta' in e) {
                wheelDeltaX = wheelDeltaY = e.wheelDelta;
            } else if ('detail' in e) {
                wheelDeltaX = wheelDeltaY = -e.detail;
            } else {
                wheelDeltaX = wheelDeltaY = 0;
            }
            return {
                x: wheelDeltaX === 0 ? 0 : (wheelDeltaX > 0 ? 1 : -1),
                y: wheelDeltaY === 0 ? 0 : (wheelDeltaY > 0 ? 1 : -1)
            };
        },

        /**
         * 글자 사이즈(영역) 계산
         *
         * @param text {string}
         * @param parent {HTMLElement} 텍스트를 둘러싸고 있는 엘리먼트(이게 있어야 정확한 계산이 가능함)
         * @return {number}
         */
        getMeasureText: function(text, parent){
            if (!text){
                return 0;
            }

            var parent = parent || document.body,
                container = document.createElement("div");

            container.style.position = "absolute";
            container.style.visibility = "hidden";
            container.style.height = "auto";
            container.style.width = "auto";
            container.style.padding = "0";
            container.style.whiteSpace = "nowrap";
            container.textContent = text;

            parent.appendChild(container);
            var width = container.clientWidth;
            var height = container.clientHeight;
            parent.removeChild(container);

            return {
                width: width,
                height: height
            };
        },

        /**
         * 스타일 태그 동적으로 생성하기
         * @param css css 문자열
         * @returns {function}
         * @example
         * var detach = axl.dom.createStyle('.tab-nav { display: none; }');
         * // 만약 생성한 스타일을 지우고자 할 경우, 위와 같이 반환값을 갖고 있다가 실행해주면 된다.
         * detach();
         */
        createStyle: function (css) {
            var head = document.head || document.getElementsByTagName('head')[0],
                style = document.createElement('style');

            style.type = 'text/css';
            if (style.styleSheet){
                style.styleSheet.cssText = css;
            } else {
                style.appendChild(document.createTextNode(css));
            }

            head.appendChild(style);
            return function () {
                head.removeChild(style);
            };
        },

        /**
         * 클립보드에 복사하기
         * @param txt
         * @example
         * axl.dom.copyToClipboard('복사할 문자열');
         */
        copyToClipboard: function (txt) {
            if (core.detect.isIE)
                return window.prompt("Press Ctrl+C (or CMD+C on Mac) to copy the text", txt);

            var result,
                txtNode = document.createElement("textarea");

            txtNode.style.position = "fixed";
            txtNode.style.top = "1px";
            txtNode.style.zIndex = "-9999";
            txtNode.style.opacity = "0";
            txtNode.value = txt;
            txtNode.setAttribute("readonly", "");
            txtNode.setAttribute("id", "someFakeId");
            document.body.appendChild(txtNode);
            txtNode.select();
            try {
                result = document.execCommand("copy")
            } catch (e) {
                result = false
            }
            return document.body.removeChild(txtNode),
                txtNode = null,
                result;
        },
        /**
         * 스크롤탑 반환
         * @return {number}
         */
        getScrollTop: function() {
            return Math.round((window.pageYOffset || document.scrollTop) - (document.clientTop || 0) || 0);
        },
        /**
         * 스크롤left 반환
         * @return {number}
         */
        getScrollLeft: function() {
            return Math.round((window.pageXOffset || document.scrollLeft) - (document.clientLeft || 0) || 0);
        },
        /**
         * 아이폰의 튕김 스크롤 영역인지 체크
         * @param currentScrollY
         * @return {boolean}
         */
        isOutOfBounds: function (currentScrollY) {
            var pastTop = currentScrollY < 0,
                pastBottom = currentScrollY + this.getWinHeight() > this.getDocHeight();

            return pastTop || pastBottom;
        }

    });
})(jQuery, window[LIB_NAME], window);
;(function ($, core, global, undefined) {
    "use strict";

    core.template =
        /**
         * 템플릿 생성
         * @function
         * @name axl.template
         * @param {string} text 템플릿 문자열
         * @param {object} data 템플릿 문자열에서 변환될 데이타
         * @param {object} settings 옵션
         * @return {function} tempalte 함수
         *
         * @example
         * {{#set 변수명=값}} : 지역변수 생성
         * {{#if expression}} ... {{#elsif expression}} ... {{#else}} ... {{/if}}
         * {{#each (item, index) in list}} ... {{/each}}
         * {{#each item in list}} ... {{$index}} ... {{/each}}
         * {{#template('템플릿태그 id', {key: value})}}
         * {{#raw name}} : escape html 처리를 하지 않은 값을 출력
         * {{# 표현식 #}}
         * {{$rootData.title}} : 어느 스코프에서든 루트에 있는 데이타를 가져올 수 있다.
         *
         * <script type="text/template" id="t0">
         *   :: {{subtitle}}
         *   </script>
         *   <script type="text/template" id="t2">
         *   {{title}}<br>
         *   {{#template('#t4', $root)}}
         *   </script>
         *   <script type="text/template" id="item">
         *   {{index + 1}} 점수: {{no > 2 ? "a" : "b"}} - 제목 : (escaped: {{item.title}}):(raw: {{#raw item.title}}), 내용 : {{item.desc}}!!<hr>
         *   </script>
         *   <script type="text/template" id="t4">
         *   {{#template('#t0', $rootData)}}<br><br>
         *   {{#each (item, index) in list}}
         *   {{#set no = index + 1}}
         *   {{#template('#item', {index:index, item: item, no: no})}}
         *   {{# if (index > 0) { #}}
        *       하하하하하<br>
        *   {{# } #}}
         *   {{/each}}
         *   {{#each item in list}}
         *   {{#set no = $index + 1}}
         *   {{$index + 1}}- 제목 : (escaped: {{item.title}}).<br>
         *   {{/each}}
         *   </script>
         *   <script>
         *   $('#box').html(axl.template('#t2', {
      *      title: '리스트 제목',
      *      subtitle: '소 제목',
      *      list: [
      *          {title: "글제목 1", desc: '글내용 1'},
      *          {title: "글제목 2", desc: '글내용 2'},
      *          {title: "글제목 3", desc: '글내용 3'},
      *          {title: "<a>aa</a>", desc: '글내용 4'},
      *      ]
      *  }));
         *   </script>
         *
         */
        function (string, data) {
            if (!string) {
                return '';
            }
            if (string.substr(0, 1) === '#') {
                string = $(string).html() || '';
            }

            if (!/{{/.test(string)) {
                return !data ? function () {
                    return string;
                } : string;
            }

            string = string.replace(/\n/g, '').replace(/\s{2}/g, '');
            var fn = (function () {
                var body = (
                    "var me = this; try { " +
                    "with (me.stash) { " +
                    "me.ret += '" +

                    string
                        .replace(/{{/g, '\x11')
                        .replace(/}}/g, '\x13')
                        .replace(/'(?![^\x11\x13]+?\x13)/g, '\\x27')
                        .replace(/^\s*|\s*$/g, '')
                        .replace(/\x11\/\/([^\x13]+?)\x13/ig, '')
                        .replace(/\x11\(([^\x13]+?)\)\x13/ig, "' + ($1) + '")
                        .replace(/\x11=([^\x13]+?)\x13/ig, "' + ($1) + '")
                        .replace(/\x11([a-z0-9\._]+?)\x13/ig, "' + me.escapeHTML($1) + '")
                        .replace(/\x11#each ([^\s]+) in ([^\x13]+)\x13/g, function (str, item, items) {
                            return "'; me.each(" + items + ", function(" + item + ", _key){ " + item + "._key = _key; me.ret += '";
                        }).replace(/\x11\/each\x13/ig, function (str, item) {
                            return "';}); me.ret += '";
                        }).replace(/\x11#if ([^\x13]+)\x13/g, function (str, item) {
                            item = item.replace(/'/g, '"');
                            return "'; if (" + item + "){ me.ret += '";
                        }).replace(/\x11#elsif ([^\x13]+)\x13/g, function (str, item) {
                            item = item.replace(/'/g, '"');
                            return "';} else if (" + item + "){ me.ret += '";
                        }).replace(/\x11#else\x13/g, function (str, item) {
                            return "';} else { me.ret += '";
                        }).replace(/\x11\/if\x13/ig, function (str, item) {
                            return "';} me.ret += '";
                        }).replace(/\x11#set\s([^\/\x13]+)\x13/ig, function (str, item) {
                            return "'; var " + item + "; me.ret += '";
                        }).replace(/\x11(.+?)\x13/g, "'; $1; me.ret += '") +

                    "'; } return me.ret;" +
                    "} catch (e) { throw 'TemplateError: ' + e + '' }"
                ).replace(/this\.ret \+= '';/g, '');

                try {
                    var func = new Function(body);
                } catch (e) {
                    console.error(body);
                    throw new Error('템플릿 문법에 오류가 있습니다.')
                }
                return function (stash) {
                    return func.call({
                        escapeHTML: core.string.escapeHTML,
                        each: core.each,
                        isEmpty: core.isEmpty,
                        rand: core.number.random,
                        ret: '',
                        stash: stash
                    })
                };
            })();

            return data ? fn(data) : fn;
        };

})(jQuery, window[LIB_NAME], window);
;(function ($, core, global, undefined) {
    /**
     * @namespace
     * @name axl.PubSub
     * @description 발행/구독 객체: 상태변화를 관찰하는 옵저버(핸들러)를 등록하여, 상태변화가 있을 때마다 옵저버를 발행(실행)
     * 하도록 하는 객체이다..
     * @example
     * // 옵저버 등록
     * axl.PubSub.on('customevent', function() {
	 *	 alert('안녕하세요');
	 * });
     *
     * // 등록된 옵저버 실행
     * axl.PubSub.trigger('customevent');
     */
    core.addon('PubSub', function () {

        var PubSub = $(global);

        var tmp = /** @lends axl.PubSub */{
            /**
             * 이벤트 바인딩
             * @function
             * @param {string} name 이벤트명
             * @param {eventCallback} handler 핸들러
             * @return {axl.PubSub}
             */
            on: function (name, handler) {
                return this;
            },

            /**
             * 이벤트 언바인딩
             * @param {string} name 이벤트명
             * @param {function} [handler] 핸들러
             * @return {axl.PubSub}
             */
            off: function (name, handler) {
                return this;
            },

            /**
             * 이벤트 트리거
             * @param {string} name 이벤트명
             * @param {object} [data] 핸들러
             * @return {axl.PubSub}
             */
            trigger: function (name, data) {
                return this;
            }
        };


        return PubSub;
    });

})(jQuery, window[LIB_NAME], window);
;(function (core, global, undefiend) {
    "use strict";

    /**
     * @function
     * @description helper 생성 함수
     * @name axl.helper
     * @param {string} name 헬퍼 이름
     * @param {object} props class 속성
     * @returns {axl.Class}
     */
    axl.helper = function helper(name, props) {
        return core.helper[name] = props;
    };

})(window[LIB_NAME], window);
;(function ($, core, global, undefined) {
    var arraySlice = Array.prototype.slice;
    var doc = global.document;
    var $doc = $(doc);
    var $win = $(global);

// obj가 객체가 아닌 함수형일 때 함수를 실행한 값을 반환
    var execObject = function (obj, ctx) {
        return core.type(obj, 'function') ? obj.call(ctx) : obj;
    };

//
    function eventHandling(inst, type, isNorm, args) {
        if (!inst.$el) { return inst; }

        isNorm && (args[0] = inst._generateEventNS(args[0]));
        inst.$el[type].apply(inst.$el, args);

        return inst;
    }

    /**
     * 모든 UI요소 클래스의 최상위 클래스로써, UI클래스를 작성함에 있어서 편리한 기능을 제공해준다.
     * @class
     * @name axl.ui.View
     * @extends axl.BaseClass
     *
     * @example
     * // 상속받음으로써 자식클래스에서 할 수 있는 작업들
     * // 1. 윈도우 이벤트의 네임스페이스 자동관리
     * this.winOn('resize', function () { });
     * this.winOff('resize'); // 자신이 등록한 이벤트만 해제
     * // 2. document 이벤트의 네임스페이스 자동관리
     * this.docOn('mousemove', function () { });
     * this.docOff('mousemove'); // 자신이 등록한 이벤트만 해제
     * // 3. 빌드된 UI컴포넌트의 인스턴스 얻기
     * $('.ui_tab').vcTab();
     * var tab = $('.ui_tab').vcTab('instance');
     * tab.select(2);
     * // 4. 하위에서 엘리먼트 찾기
     * var $box = this.$('.box')
     * // 5. selectors속성에 지정된 셀렉터로 다시 조회할 수 있도록 함수 제공
     * this.updateSelectors();
     * // 6. 옵션 변경
     * this.option('selectIndex', 1); // set
     * var selectIndex = this.option('selectIndex'); // get
     */
    var View = core.BaseClass.extend(/** @lends axl.ui.View# */{
        $name: 'View',
        $statics: {
            _instances: [] // 모든 인스턴스를 갖고 있는다..
        },

        /**
         * this.$el 를 root로 하여 하위에 존재하는 엘리먼트를 검색
         * @param {string} selector 셀렉터
         * @param {string} [parent] 상위요소
         * @returns {jQuery} this.$el 하위에서 selector에 해당하는 엘리먼트들
         * @example
         * var $btn = this.$('button');
         */
        $: function (selector, parent) {
            if (!this.$el) {
                return $();
            }
            return this.$el.find.apply(this.$el, arguments);
        },

        /**
         * 해당 엘리먼트에 빌드된 클래스 인스턴스를 반환
         * @return {klass} 해당 인스턴스
         * @example
         * var tab = $('div').Tabs('instance');
         */
        instance: function () {
            return this;
        },

        /**
         * 해당 클래스의 소속 엘리먼트를 반환
         * @return {jQuery} 해당 DOM 엘리먼트
         * @example
         * var tab = new Tab('#tab');
         * tab.getElement().hide();
         */
        getElement: function () {
            return this.$el;
        },


        /**
         * 생성자
         * @param {String|Element|jQuery} el 해당 엘리먼트(노드, id, jQuery 어떤 형식이든 상관없다)
         * @param {object} options 옵션값
         * @return {Object|boolean} false 가 반환되면, 이미 해당 엘리먼트에 해당 모듈이 빌드되어 있거나 disabled 상태임을 의미한다.
         */
        initialize: function (el, options) {
            options || (options = {});

            var self = this,
                moduleName;

            self.name = self.name || self.$name;
            if (!self.name) {
                throw new Error('[ui.View] 클래스의 이름이 없습니다');
            }

            moduleName = self.moduleName = core.string.toFirstLower(self.name);
            self.$el = el instanceof $ ? el : $(el);

            if (!el) {
                return false;
            }

            // dom 에 존재하는가
            var el = self.$el[0];
            if (el !== window && el !== doc && !$.contains(doc, el)) {
                return false;
            }

            if (self.$el.data('ui_' + self.moduleName)) {
                return false;
            }

            View._instances.push(self);
            self.el = self.$el[0]; // 원래 엘리먼트도 변수에 설정
            self.options = core.extend(true, {}, self.constructor.superClass.defaults, self.defaults, self.$el.data(), options); // 옵션 병합
            self.cuid = core.nextSeq();
            self.cid = moduleName + '_' + self.cuid; // 객체 고유 키
            self.eventNS = '.' + self.cid;
            self.$el.data('ui_' + self.moduleName, self);

            if (self.selectors && self.selectors.auto !== false) {
                self.updateSelectors();
            }
            self._renderTemplate();
            self._bindEventsByOption();
        },

        /**
         * 템플릿 렌더
         * @private
         */
        _renderTemplate: function () {
            var self = this;

            //self.templated = {};
            self._tmplCached = {};
            self.templates = core.extend({}, self.constructor.superClass.templates, self.templates, self.options.templates);

            /*if (core.isEmpty(self.templates)) { return; }
            core.each(self.templates, function (template, name) {
                self.templated[name] = core.template(template);
            });*/
            /*core.each(self.templates, function (item) {
                var tmpl = core.tmpl(item.value)(item.data||{});
                core.each(['append', 'prepend', 'insertBefore', 'insertAfter', 'html'], function (method) {
                    if (method in item) {
                        self.$(item[method])[method](tmpl);
                        return false;
                    }
                });
            });*/
        },

        /**
         * 옵션으로 넘어온 이벤트들을 바인딩함
         * @private
         */
        _bindEventsByOption: function () {
            var self = this,
                eventPattern = /^([^\s|\$]+) *([^$]*)$/i;

            // events 속성 처리
            // events: {
            //	'click ul>li.item': 'onItemClick', //=> this.$el.on('click', 'ul>li.item', this.onItemClick); 으로 변환
            // }
            self.options.events = core.extend({},
                execObject(self.events, self),
                execObject(self.options.events, self));

            core.each(self.options.events, function (value, key) {
                var m;
                if (!(m = key.match(eventPattern))) {
                    return false;
                }

                var name = m[1],
                    selector = m[2] || '',
                    args = [name],
                    func = core.type(value, 'function') ? value : (core.type(self[value], 'function') ? self[value] : core.emptyFn);

                if (selector) {
                    args[args.length] = $.trim(selector);
                }

                // this를 UI클래스의 인스턴스로 설정
                args[args.length] = function () {
                    func.apply(self, arguments);
                };
                self.on.apply(self, args);
            });

            // options.on에 지정한 이벤트들을 클래스에 바인딩
            self.options.on && core.each(self.options.on, function (value, key) {
                // this는 이벤트가 발생한 엘리먼트이다
                self.on(key, value);
            });
        },

        /**
         * this.selectors를 기반으로 엘리먼트를 조회해서 멤버변수에 셋팅
         * @returns {axl.ui.View}
         * @example
         * var Tab = axl.ui.View.extend({
         *     selectors: { // 객체가 생성될 때 주어진 요소를 검색해서 멤버변수로 셋팅해주는 옵션
         *        btns: '>li>a',
         *        contents: '>li>div'
         *     },
         *     // ...         *
         * });
         * var tab = new Tab('#js-tab');
         * // 객체가 생성된 다음에 DOM이 동적으로 변경되었다면
         * tab.updateSelectors(); // 를 호출해줌으로써 다시 찾은 다음 멤버변수에 셋팅해준다.
         */
        updateSelectors: function () {
            var self = this;
            // selectors 속성 처리
            self.selectors = core.extend({},
                execObject(self.constructor.superClass.selectors, self),
                execObject(self.selectors, self),
                execObject(self.options.selectors, self));

            delete self.selectors.auto;
            core.each(self.selectors, function (value, key) {
                //if (!value) { return; }

                if (typeof value === 'string') {
                    self['$' + key] = self.$el.find(value);
                } else if (value instanceof $) {
                    self['$' + key] = value;
                } else {
                    self['$' + key] = $(value);
                }
                // me.ui[key] = me['$' + key];
            });

            return self;
        },

        /**
         * 옵션 설정함수
         *
         * @param {string} name 옵션명
         * @param {*} value 옵션값
         * @returns {axl.ui.View} chaining
         * @fires axl.ui.View#optionchange
         * @example
         * var tab = new Tab('#tab');
         * tab.on('optionchange', function(e, data){
         *     alert('옵션이 변경됨(옵션명:'+data.name+', 옵션값:'+data.value);
         * });
         *
         * tab.setOption('selectedIndex', 2); // alert('옵션이 변경됨(옵션명: selectedIndex, 옵션값: 2);
         */
        setOption: function (name, value) {
            this.options[name] = value;
            /**
             * 옵션이 변경됐을 때 발생
             * @event axl.ui.View#optionchange
             * @type {object}
             * @property {string} name 옵션명
             * @property {*} value 옵션명
             */
            this.triggerHandler('optionchange', {name: name, value: value});
            return this;
        },

        /**
         * 옵션값 반환함수
         *
         * @param {string} name 옵션명
         * @param {*} def 옵션값이 없을 경우 기본값
         * @return {*} 옵션값
         * @example
         * var tab = new Tab('#tab');
         * tab.getOption('selectedIndex'); // 2
         */
        getOption: function (name, def) {
            var o = this.options[name];
            if (typeof o === 'undefined') {
                return def;
            }
            return o;
        },

        /**
         * 인자수에 따라 옵션값을 설정하거나 반환해주는 함수
         *
         * @param {string} name 옵션명
         * @param {*} [value] 옵션값: 없을 경우 name에 해당하는 값을 반환
         * @return {*}
         * @example
         * $('...').tabs('option', 'startIndex', 2); // set
         * $('...').tabs('option', 'startIndex'); // get // 2
         */
        option: function (name, value) {
            if (arguments.length === 1) {
                return this.getOption(name);
            } else {
                this.setOption(name, value);
            }
        },

        /**
         * 이벤트명에 현재 클래스 고유의 네임스페이스를 붙여서 반환 (ex: 'click mousedown' -> 'click.MyClassName mousedown.MyClassName')
         * @private
         * @param {String|$.Event} en 네임스페이스가 없는 이벤트명
         * @return {string} 네임스페이스가 붙어진 이벤트명
         */
        _generateEventNS: function (en) {
            if (en instanceof $.Event && en.type.indexOf('.') === -1) {
                en.type = en.type + this.eventNS;
                return en;
            }

            var self = this,
                m = (en || "").split(/\s/);
            if (!m || !m.length) {
                return en;
            }

            var name, tmp = [], i;
            for (i = -1; name = m[++i];) {
                if (name.indexOf('.') === -1) {
                    tmp.push(name + self.eventNS);
                } else {
                    tmp.push(name);
                }
            }
            return tmp.join(' ');
        },

        /**
         * 현재 클래스의 이벤트네임스페이스를 반환
         * @param {string} [eventName] 이벤트명
         * @return {string} 이벤트 네임스페이스
         * @example
         * var en = tab.makeEventNS('click mousedown');
         */
        makeEventNS: function (en) {
            if (en) {
                var pairs = en.split(' '),
                    tmp = [];
                for (var i = -1, pair; pair = pairs[++i];) {
                    if (pair.indexOf('.') > -1) {
                        tmp.push(pair);
                    } else {
                        tmp.push(pair + this.eventNS);
                    }
                }
                return tmp.join(' ');
            }
            return this.eventNS;
        },

        getEventNS: function () {
          return this.eventNS;
        },

        _trigger: function () {
            var args = arraySlice.call(arguments),
                prefix = this.moduleName.toLowerCase();
            if (typeof args[0] === 'string') {
                args[0] = prefix + args[0];
            } else {
                args[0].type = prefix + args[0].type;
            }
            return this.$el.trigger.apply(this.$el, args);
        },

        _triggerHandler: function () {
            var args = arraySlice.call(arguments),
                prefix = this.moduleName.toLowerCase();
            if (typeof args[0] === 'string') {
                args[0] = prefix + args[0];
            } else {
                args[0].type = prefix + args[0].type;
            }
            return this.$el.triggerHandler.apply(this.$el, args);
        },

        /**
         * me.$el에 이벤트 핸들러를 바인딩
         * @param {string} name 이벤트명
         * @param {string} [selector] 타겟
         * @param {eventCallback} handler 핸들러
         * @returns {axl.ui.View} chaining
         * @example
         * var tab = new Tab('#tab');
         * tab.on('tabchanged', function(e, data){
         *     alert(data.selectedIndex);
         * });
         */
        on: function () {
            return eventHandling(this, 'on', true, arraySlice.call(arguments));
        },

        /**
         * me.$el에 등록된 이벤트 핸들러를 언바인딩
         * @param {string} name 이벤트명
         * @param {eventCallback} [handler] 핸들러
         * @returns {axl.ui.View} chaining
         * @example
         * var tab = new Tab('#tab');
         * tab.off('tabchanged');
         */
        off: function () {
            return eventHandling(this, 'off', false, arraySlice.call(arguments));
        },

        /**
         * me.$el에 일회용 이벤트 핸들러를 바인딩
         * @param {string} name 이벤트명
         * @param {string} [selector] 타겟
         * @param {eventCallback} handler 핸들러
         * @returns {axl.ui.View} chaining
         * @example
         * var tab = new Tab('#tab');
         * tab.one('tabchanged', function(e, data){
         *     alert(data.selectedIndex);
         * });
         */
        one: function () {
            return eventHandling(this, 'one', true, arraySlice.call(arguments));
        },

        /**
         * me.$el에 등록된 이벤트를 실행
         * @param {string} name 이벤트명
         * @param {*} data 데이타
         * @return {axl.ui.View} chaining
         * @example
         * var tab = new Tab('#tab');
         * tab.trigger('tabchanged', {selectedIndex: 1});
         */
        trigger: function () {
            return eventHandling(this, 'trigger', false, arraySlice.call(arguments));
        },

        /**
         * 커스텀 이벤트 발생기(주어진 이벤트명 앞에 모듈명이 자동으로 붙는다)<br>
         *     this.customTrigger('expand'); // this.trigger('accordionexpand') 으로 변환
         * @param {string} name 이벤트명
         * @param {*} data 데이타
         * @return {axl.ui.View} chaining
         * @example
         * var tab = new Tab('#tab');
         * tab.customTrigger('changed', {selectedIndex: 1});
         */
        customTrigger: function () {
            var args = arraySlice.call(arguments);
            args[0] = this.name + args[0];
            return this.trigger(this, 'trigger', false, args);
        },

        /**
         * me.$el에 등록된 이벤트 핸들러를 실행(실제 이벤트는 발생안하고 핸들러 함수만 실행)
         * @param {string} name 이벤트명
         * @param {*} data 데이타
         * @return {axl.ui.View} chaining
         * @example
         * var tab = new Tab('#tab');
         * tab.triggerHandler('tabchanged', {selectedIndex: 1});
         */
        triggerHandler: function () {
            return eventHandling(this, 'triggerHandler', false, arraySlice.call(arguments));
        },

        uiTrigger: function () {
            var args = arraySlice.call(arguments);
            if (args[0].indexOf(this.name) < 0) {
                args[0] = this.name.toLowerCase() + args[0];
            }
            return eventHandling(this, 'trigger', false, args);
        },

        uiTriggerHandler: function () {
            var args = arraySlice.call(arguments);
            if (args[0].indexOf(this.name) < 0) {
                args[0] = this.name.toLowerCase() + args[0];
            }
            return eventHandling(this, 'triggerHandler', false, args);
        },

        /**
         * templates 속성에 등록된 템플릿문자열을 파싱하여 data를 적용하여 반환해준다.
         * @param id
         * @param data
         * @returns {*}
         */
        tmpl: function (id, data) {
            if (!this.templates || !this.templates[id]) { return ''; }
            if (!this._tmplCached[id]) { this._tmplCached[id] = core.template(this.templates[id]); }

            return this._tmplCached[id](data || {});
        },

        /**
         * 해당컴포넌트와 관련하여 document에 이벤트를 등록하고자 할 경우 네임스페이스를 자동으로 붙여준다.
         * @param eventName
         * @returns {axl.ui.View}
         * @example
         * var Tab = core.ui('Tab', {
         * :
         * _bindEvents: function () {
         *   // 아랫코드는 $(document).on('click.tab_1 mouseup.tab_1', function (){}) 와 동일하다.
         *   // 네임스페이스는 생성된 컴포넌트마다 자동생성되는 고유문자열이다.
         *   this.docOn('click mouseup', function (e) {
         *       ...
         *   });
         * }
         * :
         */
        docOn: function (eventName) {
            eventName = this.makeEventNS(eventName);
            $doc.on.apply($doc, [eventName].concat([].slice.call(arguments, 1)));
            return this;
        },

        /**
         * 해당컴포넌트와 관련하여 document에 일회용 이벤트를 등록하고자 할 경우 네임스페이스를 자동으로 붙여준다.
         * @param eventName
         * @returns {axl.ui.View}
         * @example
         * var Tab = core.ui('Tab', {
         * :
         * _bindEvents: function () {
         *   // 아랫코드는 $(document).on('click.tab_1 mouseup.tab_1', function (){}) 와 동일하다.
         *   // 네임스페이스는 생성된 컴포넌트마다 자동생성되는 고유문자열이다.
         *   this.docOne('click mouseup', function (e) {
         *       ...
         *   });
         * }
         * :
         */
        docOne: function (eventName) {
            eventName = this.makeEventNS(eventName);
            $doc.one.apply($doc, [eventName].concat([].slice.call(arguments, 1)));
            return this;
        },

        /**
         * 해당컴포넌트와 관련하여 등록된 document 이벤트를 제거해준다.
         * @param eventName
         * @returns {axl.ui.View}
         *
         * this.docOff(); // $(document).off('.tab_1'); 와 동일
         * this.docOff('click mouseup'); // $(document).off('click.tab_1 mouseup.tab_1'); 와 동일
         */
        docOff: function (eventName) {
            eventName = eventName ? this.makeEventNS(eventName) : this.getEventNS();
            //console.log(eventName);
            $doc.off.apply($doc, [eventName].concat([].slice.call(arguments, 1)));
            return this;
        },

        /**
         * 해당컴포넌트와 관련하여 window에 이벤트를 등록하고자 할 경우 네임스페이스를 자동으로 붙여준다.
         * @param eventName
         * @returns {axl.ui.View}
         * @example
         * var Tab = core.ui('Tab', {
         * :
         * _bindEvents: function () {
         *   // 아랫코드는 $(window).on('click.tab_1 mouseup.tab_1', function (){}) 와 동일하다.
         *   // 네임스페이스는 생성된 컴포넌트마다 자동생성되는 고유문자열이다.
         *   this.winOn('click mouseup', function (e) {
         *       ...
         *   });
         * }
         * :
         */
        winOn: function (eventName) {
            $win.on.apply($win, [this.makeEventNS(eventName)].concat([].slice.call(arguments, 1)));
            return this;
        },

        /**
         * 해당컴포넌트와 관련하여 window에 일회용 이벤트를 등록하고자 할 경우 네임스페이스를 자동으로 붙여준다.
         * @param eventName
         * @returns {axl.ui.View}
         * @example
         * var Tab = core.ui('Tab', {
         * :
         * _bindEvents: function () {
         *   // 아랫코드는 $(window).on('click.tab_1 mouseup.tab_1', function (){}) 와 동일하다.
         *   // 네임스페이스는 생성된 컴포넌트마다 자동생성되는 고유문자열이다.
         *   this.winOne('click mouseup', function (e) {
         *       ...
         *   });
         * }
         * :
         */
        winOne: function (eventName) {
            $win.one.apply($win, [this.makeEventNS(eventName)].concat([].slice.call(arguments, 1)));
            return this;
        },

        /**
         * 해당컴포넌트와 관련하여 등록된 window이벤트를 제거해준다.
         * @param eventName
         * @returns {axl.ui.View}
         *
         * this.winOff(); // $(window).off('.tab_1'); 와 동일
         * this.winOff('click mouseup'); // $(window).off('click.tab_1 mouseup.tab_1'); 와 동일
         */
        winOff: function (eventName) {
            $win.off.apply($win, [eventName ? this.makeEventNS(eventName) : this.getEventNS()].concat([].slice.call(arguments, 1)));
            return this;
        },

        /**
         * 파괴자
         */
        destroy: function () {
            var self = this;

            self.triggerHandler('destroy');
            self.$el.off(self.eventNS).removeData('ui_' + self.moduleName);
            self.winOff();
            self.docOff();

            // me에 등록된 엘리먼트들의 연결고리를 해제(메모리 해제대상)
            core.each(self, function (item, key) {
                if (key.substr(0, 1) === '$') {
                    self[key] = null;
                    delete self[key];
                }
            });
            self.el = null;

           core.array.remove(core.ui.View._instances, self);
        }
    });

    /**
     * @function
     * @description ui 모듈 생성 함수
     * @name axl.ui
     * @param {string} name UI 모듈명
     * @param {axl.Class} [supr] 부모 클래스
     * @param {object} props 클래스 속성
     * @return {axl.Class}
     */
    var ui = core.ui = function (name, supr, attr) {
        var bindName,
            cls = {}; // 에러가 났을 때 클래스이름이 표시되도록 하기 위함

        if (core.ui[name]) {
            return core.ui[name];
        }

        if (!attr) {
            attr = supr;
            supr = View;
        }

        if (typeof supr === 'string') {
            supr = ui[supr];
        } else if (attr.$extend) {
            supr = attr.$extend
        }

        if (core.type(attr, 'function')) {
            if (!core.type(attr = attr(supr), 'function')) {
                bindName = attr.bindjQuery;
                cls[name] = supr.extend(name, attr);
            } else {
                cls[name] = attr;
            }
        } else {
            bindName = attr.bindjQuery;
            cls[name] = supr.extend(name, attr);
        }

        // 외부에서 디폴트 옵션을 설정한 경우 이를 defaults에 머지해준다.
        if (ui._templDefaults[name]) {
            attr.defaults || (attr.defaults = {});
            core.extend(true, attr.defaults, ui._templDefaults[name]);
            delete ui._templDefaults[name];
        }

        cls[name].prototype.name = name;
        ui[name] = cls[name];
        if (bindName) { // jquery plugin 방식으로 사용할 수 있도록 설정해준다.
            if (bindName === true) {
                bindName = core.string.toFirstLower(name);
            }
            ui.bindjQuery(cls[name], bindName, core.UI_PREFIX);
        }
        return cls[name];
    };

    ui.View = View;

// 삭제된 고아 엘리먼트에 빌드된 모듈을 메모리에서 해제
    ui.clearUIGarbage = function (all) {
        if (!ui.View) {
            return;
        }
        var items = ui.View._instances;
        for (var i = items.length, view; i--; ) {
            view = items[i];
            if (all === true || (view.$el && !$.contains(document, view.$el[0]))) {
                try {
                    console.log('ui instance removed', view.name);
                    view.destroy();
                    view = null;

                    //items[i] = view = null;
                    //items.splice(i, 1);
                } catch (e) {
                    console.error('error remove', e);
                }
            }
        }
    };

    var garbageCallback;
    // 20초마다 엘리먼트 삭제여부를 체크하여 메모리상에 남아있는 객체를 제거한다.
    setTimeout(garbageCallback = function () {
        ui.clearUIGarbage();
        setTimeout(garbageCallback, 20000);
    }, 20000);

    /**
     * 작성된 UI모듈을 jQuery의 플러그인으로 사용할 수 있도록 바인딩시켜 주는 함수
     *
     * @function
     * @name axl.ui.bindjQuery
     * @param {axl.ui.View} Klass 클래스
     * @param {string} name 플러그인명
     *
     * @example
     * // 클래스 정의
     * var Slider = axl.ui.View({
     *   initialize: function(el, options) { // 생성자의 형식을 반드시 지킬 것..(첫번째 인수: 대상 엘리먼트, 두번째
     *   인수: 옵션값들)
     *   ...
     *   },
     *   ...
     * });
     * axl.ui.bindjQuery(Slider, 'slider');
     * // 실제 사용시
     * $('#slider').vcSlider({count: 10});
     *
     * // 객체 가져오기 : instance 키워드 사용
     * var slider = $('#slider').vcSlider('instance');
     * slider.move(2); // $('#slider').vcSlider('move', 2); 와 동일
     *
     * // 객체 해제하기 : destroy 키워드 사용
     * $('#slider').vcSlider('destroy');
     *
     * // 옵션 변경하기
     * $('#slider').option('effect', 'fade'); // 이때 optionchange 라는 이벤트가 발생된다.
     */
    ui.bindjQuery = function (Klass, name, prefix) {
        if (!prefix && prefix !== false) {
            prefix = core.UI_PREFIX;
        }
        var pluginName = prefix ? prefix + name.substr(0, 1).toUpperCase() + name.substr(1) : name,
            old = $.fn[pluginName];

        $.fn[pluginName] = function (options) {
            var a = arguments,
                args = arraySlice.call(a, 1),
                isMethodCall = typeof options === 'string',
                returnValue = this;

            this.each(function () {
                var $this = $(this),
                    methodValue,
                    instance = $this.data('ui_' + name);

                if (instance) {
                    if (isMethodCall) {
                        switch (options) {
                            case 'destroy':
                                try {
                                    instance.destroy();
                                    instance = null;
                                } catch (e) {
                                }
                                //$this.removeData('ui_' + name);
                                return;
                            case 'instance':
                                returnValue = instance;
                                return false;
                        }
                    } else {
                        return;
                    }
                }  else {
                    if (options === 'destroy') {
                        return;
                    }
                }

                if (!instance || (a.length === 1 && typeof options !== 'string')) {
                    instance && (instance.destroy(), $this.removeData('ui_' + name));
                    instance = new Klass(this, core.extend({}, $this.data(), options));
                }

                if (isMethodCall && typeof instance[options] === 'function') {
                    if (options.substr(0, 1) === '_') {
                        throw new Error('[bindjQuery] private 메소드는 호출할 수 없습니다.');
                    }

                    try {
                        methodValue = instance[options].apply(instance, args);
                    } catch (e) {
                        console.error('[' + name + '.' + options + ' error] ' + e);
                    }

                    if (methodValue !== instance && methodValue !== undefined) {
                        returnValue = methodValue;
                        return false;
                    }
                }
            });

            return returnValue;
        };

        // 기존의 모듈로 복구
        $.fn[pluginName].noConflict = function () {
            $.fn[pluginName] = old;
            return this;
        };
    };

    /**
     * UI모듈의 기본옵션을 변경
     * @function
     * @name axl.ui.setDefaults
     * @param {string} name ui모듈명(네임스페이스 제외)
     * @param {*} opts 옵션값들
     * @example
     * axl.ui.setDefaults('Tab', {
     *     selectedIndex: 2
     * });
     */
    ui.setDefaults = function (name, opts) {
        if (core.ui[name]) {
            $.extend(true, core.ui[name].prototype.defaults, opts);
        } else {
            ui._templDefaults[name] = opts;
        }
    };
    ui._templDefaults = {};

})(jQuery, window[LIB_NAME], window);
;(function ($, core) {

    var i18n = core.extend({}, window.i18n, {
        ko: {
            play: '재생',
            pause: '일시정지',
            stop: '정지',
            volume: '볼륨',
            mute: '음소거',
            unmute: '음소거 해제',
            facebook: '페이스북',
            twitter: '트위터',
            kakaotalk: '카카오톡',
            kakaostory: '카카오스토리',
            googleplus: '구글플러스',
            pinterest: '핀터레스트',
            line: '라인'
        },
        en: {},
        jp: {},
        cn: {}
    });


    core.translate = function (id, values, def) {
        var pairs = id.split('.');
        var node = core.translate.i18n || {};

        if (!core.isPlainObject(values)) {
            def = values;
            values = {};
        }

        for(var i = -1, item; (item = pairs[++i]) && node[item]; ) {
            node = node[item] || null
        }

        if (!node || !core.isString(node)) { node = def || id; }
        if (node.indexOf('{{') > -1) {
            node = core.string.format(node, values)
        }
        return node || def || '';
    };
    core.translate.i18n = {};
    core.translate.options = {
        locale: 'ko',
        fallback: 'en'
    };
    core.translate.config = function (options) {
        core.extend(this.options, options)
    };
    core.translate.locale = function (locale) {
        this.config({
            locale: locale
        });
        this.i18n = i18n[locale] || {};
    };
    core.translate.locale('ko');

})(jQuery, window[LIB_NAME]);
/**
 * jQuery 확장
 */
(function ($, core, context, undefined) {
    "use strict";

    $.extend(jQuery.expr[':'], {
        focusable: function (el, index, selector) {
            // 160112 password type 추가
            return $(el).is('a, button, input[type=password], input[type=text], input[type=file], input[type=checkbox], input[type=radio], select, textarea, [tabindex]');
        }
    });

    /**
     * jQuery 객체
     * @class
     * @name $
     */
        // TODO: 뺄 것
    var oldOff = $.fn.off;
    /**
     * name 이벤트 언바인딩
     * @function
     * @name $#off
     * @return {jQuery}
     */
    /*$.fn.unbind = $.fn.off = function (name) {
        if ((this[0] === context || this[0] === document)
            && name !== 'ready' && name.indexOf('.') < 0) {
            throw new Error('[' + name + '] window, document에서 이벤트를 off할 때는 네임스페이스를 꼭 넣어주셔야 합니다.');
        }
        if (IS_DEBUG) {
            console.log('off', name);
            console.trace();
        }
        return oldOff.apply(this, arguments);
    };*/

    // TODO 테스트용
    /*if (IS_DEBUG) {
        var oldOn = $.fn.on;
        $.fn.on = function (name) {
            if (this[0] === context || this[0] === document) {
                console.log('on', name);
                console.trace();

            }
            return oldOn.apply(this, arguments);
        };
    }*/

    /**
     * value값의 앞뒤 빈문자 제거
     * @param {string} value 문자열 값
     * @param {string} value 문자열 값
     * @return {string} 빈값이 제거된 문자열
     */
    $.fn.trimVal = function (value) {
        if (arguments.length === 0) {
            return $.trim(this.val());
        } else {
            return this.val($.trim(value));
        }
    };

    /**
     * value값을 URI인코딩하여 반환
     * @function
     * @name $#encodeURI
     * @return {string} 인코딩된 문자열
     */
    $.fn.encodeURI = function (value) {
        if (arguments.length === 0) {
            return encodeURIComponent($.trim(this.val()));
        } else {
            return this.val(encodeURIComponent(value));
        }
    };

    /**
     * 클래스 치환
     * @function
     * @name $#replaceClass
     * @param {string} old 대상클래스
     * @param {string} newCls 치환클래스
     * @return {jQuery}
     */
    $.fn.replaceClass = function (old, newCls) {
        return this.each(function () {
            $(this).removeClass(old).addClass(newCls);
        });
    };

    /**
     * 아무것도 안하는 빈함수
     * @function
     * @name $#noop
     * @return {jQuery}
     * @example
     * $(this)[ isDone ? 'show' : 'noop' ](); // isDone이 true에 show하되 false일때는 아무것도 안함.
     */
    $.fn.noop = function () {
        return this;
    };

    /**
     * 체크된 항목의 값을 배열에 담아서 반환
     * @function
     * @name $#checkedValues
     * @return {array}
     */
    $.fn.checkedValues = function () {
        var results = [];
        this.each(function () {
            if ((this.type === 'checkbox' || this.type === 'radio') && !this.disabled && this.checked === true) {
                results.push(this.value);
            }
        });
        return results;
    };

    /**
     * 같은 레벨에 있는 다른 row에서 on를 제거하고 현재 row에 on 추가
     * @function
     * @name $#activeItem
     * @param {string} className='on' 활성 클래스명
     * @return {jQuery}
     */
    $.fn.activeItem = function (className, isActive) {
        className = className || 'on';
        if (typeof isActive === 'undefined') {
            isActive = true;
        }
        return this.toggleClass(className, isActive).siblings().toggleClass(className, !isActive).end();
    };

    /**
     * 해당 이미지가 로드됐을 때 콜백함수 실행
     * @function
     * @name $#onImgLoaded
     * @param {function(width:Number, height:Number)} callback width, height 인자를 갖는 콜백함수
     * @return {jQuery}
     */
    $.fn.onImgLoaded = function (callback) {
        core.util.waitImageLoad(this).done(callback);
        return this;
    };

    /**
     * 비동기 방식으로 이미지 사이즈를 계산해서 콜백함수로 넘겨준다.
     * @function
     * @name $#getImgSize
     * @param {function(width:Number, height:Number)} cb width, height 인자를 갖는 콜백함수
     * @return {jQuery}
     */
    $.fn.getImgSize = function (cb) {
        var $img = this.eq(0);
        $img.onImgLoaded(function () {
            cb && cb.call($img[0], $img.css('width', '').width(), $img.css('height', '').height());
        });
        return this;
    };


    $.fn.debounce = function(event, fn, time) {
        var timer;
        return this.on(event, function(e) {
            clearTimeout(timer);
            timer = setTimeout(function() {
                fn(e);
            }, time || 250);
        });
    };

})(jQuery, window[LIB_NAME], window);
