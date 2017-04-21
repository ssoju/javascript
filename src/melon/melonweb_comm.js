/*!
 * @author 김승일
 * @email comahead@vi-nyl.com
 * @date 2012-03-23
 * @description 멜론 프레임웍
 */
 (function (context, $, undefined) {
  "use strict";
    /* jshint expr: true, validthis: true */
    /* global MELON, alert, escape, unescape, Base64, Logger */

    var $root = $(document.documentElement);

    $root.one( 'touchstart MSGestureStart', function () {
        $root.addClass('touch');
    });

    /**
     * @namespace
     * @name MELON
     * @description root namespace of melon site
     */


    /**
     * @namespace
     * @name MELON.WEBSVC
     * @description 멜론 웹 공통 기능 스크립트
     */

    /**
     * @namespace
     * @name WEBSVC
     * @description MELON.WEBSVC 단축명
     */
    var MELON = context.MELON || (context.MELON = {}),
        WEBSVC = MELON.WEBSVC || (MELON.WEBSVC = {}),

         // start 20131101 구매 CM 추가
        CM = MELON.WEBSVC.CM || (MELON.WEBSVC.CM= {});
        // end 20131101 구매 CM 추가

    var toString = Object.prototype.toString,
        hasOwn = Object.prototype.hasOwnProperty,
        doc = context.document,
        emptyFn = function () {};

    if (typeof Function.prototype.bind === 'undefined') {
        /**
         * 함수내의 컨텐스트를 지정
         * @param {Object} context 컨텍스트
         * @param {Mixed} ... 두번째 인자부터는 실제로 싱행될 함수로 전달된다.
         * @example
         * function Test(){
         *      alert(this.name);
         * }.bind({name: 'axl rose'});
         *
         * Test(); -> alert('axl rose');
         */
        Function.prototype.bind = function () {
            var __method = this,
                args = Array.prototype.slice.call(arguments),
                object = args.shift();

            return function () {
                // bind로 넘어오는 인자와 원본함수의 인자를 병합하여 넘겨줌.
                var local_args = args.concat(Array.prototype.slice.call(arguments));
                if (this !== window) { local_args.push(this); }
                return __method.apply(object, local_args);
            };
        };
    }

    /**
     * jQuery 객체
     * @class
     * @name $
     */

    /**
     * value값을 URI인코딩하여 반환
     * @function
     * @name $#encodeURI
     * @return {String} 인코딩된 문자열
     */
    $.fn.encodeURI = function(value) {
        if (arguments.length === 0) {
            return encodeURIComponent($.trim(this.val()));
        } else {
            return this.val(encodeURIComponent(value));
        }
    };

    /**
     * value값의 앞뒤 스페이스문자 또는 old ie인경우에 placeholder를 제거하여 실제 값만 반환
     * @function
     * @name $#trimVal
     * @return {String} 문자열
     */
    $.fn.trimVal = (function() {
        var supportPlaceholder = ('placeholder' in document.createElement('input'));

        return supportPlaceholder ? function(value) {
            if(arguments.length === 0) { return $.trim(this.val()); }
            else { return this.val($.trim(value)); }
        } : function(value) {
            if (arguments.length === 0) {
                if(this.val() === this.attr('placeholder')) {
                    return '';
                }
                return $.trim(this.val());
            } else {
                value = $.trim(value) || this.attr('placeholder');
                return this.val(value);
            }
        };
    })();

    /**
     * 체크여부를 지정할 때, changed 이벤트를 발생시킨다.(연결된 label에 on클래스를 토글링하고자 할 때 사용)
     * @function
     * @name $#checked
     * @param {Boolean} checked 체크여부
     * @fires $#changed
     * @example
     * // 먼저 changed 이벤트 바인딩
     * $('input:checkbox').on('changed', function(e, isChecked){ $(this).parent()[isChecked?'addClass':'removeClass']('on'); });
     * ..
     * // checked 값을 변경
     * $('input:checkbox').checked(true); // 해당체크박스의 부모에 on클래스가 추가된다.
     */
    $.fn.checked = function(checked) {
        return this.each(function() {
            if(this.type !== 'checkbox' && this.type !== 'radio'){ return; }
            /**
             * @event $#changed
             * @type {object}
             * @peoperty {boolean} checked - 체크 여부
             */
            var $this = $(this).prop('checked', checked).trigger('changed', [checked]);
        });
    };

    /**
     * 클래스 치환
     * @function
     * @name $#replaceClass
     * @param {String} old 대상클래스
     * @param {String} newCls 치환클래스
     */
    $.fn.replaceClass = function(old, newCls) {
        return this.each(function() {
            $(this).removeClass(old).addClass(newCls);
        });
    };

    /**
     * 레이어 표시 담당:
     * - 단순히 show를 하는게 아니라, 레이어가 표시되기전에 beforeshow이벤트를, 표시된 후에 show이벤트를 발생시켜준다.
     * - 레이어를 띄운 버튼을 보관한다. 닫을때, 버튼에 어떠한 액션을 취하고자 할 때 유용
     * @function
     * @name $#showLayer
     * @param {Element|jQuery} options.button (Optional) 버튼
     * @param {Function} options.onShow (Optional) 표시될 때 실행될 함수
     */
    $.fn.showLayer = function(options) {
        options = $.extend({
            onShow: MELON.WEBSVC.emptyFn,
            opener: null
        }, options);

        return this.each(function() {
            var $this = $(this),
                evt;
            if (options.opener) {
                $this.data('opener', options.opener);
                $(options.opener).attr({'aria-pressed': 'true', 'aria-expand': 'true'});
            }

            $this.trigger(evt = $.Event('beforeshow'));
            if (evt.isDefaultPrevented()){ return; }

            // 표시될 때 d_open 클래스 추가
            $this.addClass('d_open').show().trigger('show');
            options.onShow.call($this[0]);
        });
    };

    /**
     * 레이어 숨김 담당:
     * - 단순히 hide를 하는게 아니라, 숨겨진 후에 hide이벤트를 발생시켜준다.
     * @function
     * @name $#hideLayer
     * @param {Boolean} options.focusOpener (Optional) 숨겨진 후에 버튼에 포커스를 줄것인지 여부
     * @param {Function} options.onHide (Optional) 숨겨진 후에 실행될 함수
     */
    $.fn.hideLayer = function(options) {
        options = $.extend({
            onHide: MELON.WEBSVC.emptyFn,
            focusOpener: false
        }, options);

        return this.each(function() {
            var $this = $(this);
            $this.removeClass('d_open').hide().trigger('hide');
            options.onHide.call($this[0]);

            // 숨겨진 후에 열었던 원래버튼에 포커스를 강제로 준다.
            if($this.data('opener')){
                var $btn = $( $this.data('opener') );
                $btn.attr({'aria-pressed': 'false', 'aria-expand': 'false'});
                if (options.focusOpener === true) {
                    $btn.focus();
                }
            }
        });
    };

    /**
     * 아무것도 안하는 빈함수
     * @function
     * @name $#noop
     * @example
     * $(this)[ isDone ? 'show' : 'noop' ](); // isDone이 true에 show하되 false일때는 아무것도 안함.
     */
    $.fn.noop = function(){
        return this;
    };

    /**
     * 체크된 항목의 값을 배열에 담아서 반환
     * @function
     * @name $#checkedValues
     * @return {Array}
     */
    $.fn.checkedValues = function() {
        var results = [];
        this.each(function() {
            if((this.type === 'checkbox' || this.type === 'radio') && this.checked === true) {
                results[results.length] = this.value;
            }
        });
        return results;
    };

    /**
     * 같은 레벨에 있는 다른 row에서 on를 제거하고 현재 row에 on 추가
     * @function
     * @name $#activeRow
     * @param {String} cls 활성 클래스명
     * @return {jQuery}
     */
    $.fn.activeRow = function(cls) {
        cls = cls || 'on';
        return this.addClass(cls).siblings().removeClass(cls).end();
    };

    //start: 20140208 : mhover
    /**
     * hover 기능
     * @param {String} selector hover대상요소의 셀렉터(hover대상이 페이지내에서 여러개가 존재하는 경우가 많으므로, 각각에 바인딩하지 않고 부모에 바인딩하여 버블링을 통해 hover효과를 구현한다.)
     */
    $.fn.mouseHover = function(selector) {
        var args = ['mouseenter mouseleave'];
        selector&&args.push(selector);
        return this.on.apply(this, args.concat(function(e) {
            e.stopPropagation();
            $(this).toggleClass('mhover', e.type === 'mouseenter');
        }));
    };
    //end: 20140208 : mhover


    /**
     * timeStart("name")로 name값을 키로하는 타이머가 시작되며, timeEnd("name")로 해당 name값의 지난 시간을 로그에 출력해준다.
     * @memberOf MELON.WEBSVC
     * @name timeStart
     * @function
     *
     * @param {String} name 타이머의 키값
     * @param {Boolean} reset 리셋(초기화) 여부
     *
     * @example
     * MELON.WEBSVC.timeStart('animate');
     * ...
     * MELON.WEBSVC.timeEnd('animate'); -> animate: 10203ms
     */
    WEBSVC.timeStart = function(name, reset){
        if(!name) { return; }
        var time = new Date().getTime(),
            key = "KEY" + name.toString();

        this.timeCounters || (this.timeCounters = {});
        if(!reset && this.timeCounters[key]) { return; }
        this.timeCounters[key] = time;
    };

    /**
     * timeStart("name")에서 지정한 해당 name값의 지난 시간을 로그에 출력해준다.
     * @memberOf MELON.WEBSVC
     * @name timeEnd
     * @function
     *
     * @param {String} name 타이머의 키값
     * @return {Number} 걸린 시간
     *
     * @example
     * MELON.WEBSVC.timeStart('animate');
     * ...
     * MELON.WEBSVC.timeEnd('animate'); -> animate: 10203ms
     */
    WEBSVC.timeEnd = function(name){
        if(!this.timeCounters) { return; }

        var time = new Date().getTime(),
            key = "KEY" + name.toString(),
            timeCounter = this.timeCounters[key],
            diff, label;

        if(timeCounter) {
            diff = time - timeCounter;
            label = name + ": " + diff + "ms";
            Logger.info(label);
            delete this.timeCounters[key];
        }
        return diff;
    };

    /**
     * 네임스페이스 공간을 생성하고 객체를 설정<br>
     * js의 네이티브에서 제공하지 않는 기능이지만,<br>
     * 객체리터럴을 이용하여 여타 컴파일 언어의 네임스페이스처럼 쓸 수 있다.
     *
     * @function
     * @memberOf MELON.WEBSVC
     * @name namespace
     *
     * @param {String} name 네임스페이스명
     * @param {Object} obj {Optional} 지정된 네임스페이스에 등록할 객체, 함수 등
     * @return {Object} 생성된 네임스페이스
     *
     * @example
     * MELON.WEBSVC.namesapce('MELON.WEBSVC.widget.Tabcontrol', TabControl)
     *
     * ex) MELON.WEBSVC.namespace('MELON.WEBSVC.widget.Control', function(){}) 를 네이티브로 풀어서 작성한다면 다음과 같다.
     *
     * var MELON.WEBSVC = MELON.WEBSVC || {};
     * MELON.WEBSVC.ui = MELON.WEBSVC.ui || {};
     * MELON.WEBSVC.widget.Control = MELON.WEBSVC.widget.Control || function(){};
     */
    WEBSVC.namespace = function (name, obj) {
        if (typeof name !== 'string') {
            obj && (name = obj);
            return name;
        }
        var root = context,
            names = name.split('.'),
            isSet = arguments.length === 2;

        if(isSet) {
            for(var i = -1, item; item = names[++i]; ){
                root = root[item] || (root[item] = (i === names.length - 1 ? obj : {}));
            }
        } else { // isGet
            for(var i = -1, item; item = names[++i]; ){
                if(item in root) { root = root[item] }
                else { throw Error(name + '은(는) 정의되지 않은 네임스페이스입니다.'); }
            }
        }

        return root;
    };

    /**
     * MELON를 루트로 하여 네임스페이스를 생성하여 새로운 속성을 추가하는 함수
     *
     * @function
     * @memberOf MELON.WEBSVC
     * @name define
     *
     * @param {String} name .를 구분자로 해서 melon를 시작으로 하위 네임스페이스를 생성. 없으면 melon에 추가된다.
     * @param {Object|Function} object
     * @param {Boolean} (Optional) isExecFn object값이 함수형일 때 실행을 시킨 후에 설정할 것인가 여부
     *
     * @example
     * MELON.WEBSVC.define('', [], {});
     * MELON.WEBSVC.
     */
    WEBSVC.define = function (name, object, isExecFn) {
        if (typeof name !== 'string') {
            object = name; name = '';
        }

        var root = MELON,
            names = name ? name.replace(/^melon\.?/, '').split('.') : [],
            ln = names.length - 1,
            leaf = names[ln];

        if (isExecFn !== false && typeof object === 'function' && !hasOwn.call(object, 'classType')) {
            object = object.call(root);
        }

        for (var i = 0; i < ln; i++) {
            root = root[names[i]] || (root[names[i]] = {});
        }

        (leaf && (root[leaf] ? $.extend(root[leaf], object) : (root[leaf] = object))) || $.extend(root, object);
    };

    /**
     * MELON.WEBSVC.define 를 통해 정의된 모듈을 변수에 담아서 사용하고자 할 경우
     *
     * @function
     * @memberOf MELON.WEBSVC
     * @name use
     *
     * @param {String} name 네임스페이스
     * @return {Object} 함수를 실행한 결과값
     *
     * @example
     * MELON.WEBSVC.define('test', function(){
    *    return {
    *       init: function(){
    *            alert(0);
    *       }
    *   });
     * var test = MELON.WEBSVC.use('test');
     * test.init()  => alert(0)
     */
    WEBSVC._prefix = 'MELON.';
    WEBSVC.use = function(name) {
        var obj = WEBSVC.namespace(WEBSVC._prefix + name);
        if(WEBSVC.isFunction(obj) && !hasOwn.call(obj, 'classType')) {
            obj = obj();
        }
        return obj;
    };

    WEBSVC.define('WEBSVC',  /** @lends MELON.WEBSVC */ {
        /**
         * document jQuery wrapper
         */
        $doc: $(document),
        /**
         * window jQuery wrapper
         */
        $win: $(window),
        /**
         * 빈 함수
         * @function
         * @example
         * var func = MELON.WEBSVC.emptyFn
         */
        emptyFn: emptyFn,

        /**
         * 임시 노드: css3스타일의 지원여부와 html을 인코딩/디코딩하거나 노드생성할 때  사용
         */
        tmpNode: doc.createElement('div'),

        /**
         * html5 속성의 지원여부를 체크할 때 사용
         * @example
         * is = 'placeholder' in MELON.WEBSVC.tmpInput;  // placeholder를 지원하는가
         */
        tmpInput: doc.createElement('input'),

        /**
         * 터치기반 디바이스 여부
         */
        isTouch: !!('ontouchstart' in window),

        /**
         * 객체 자체에 주어진 이름의 속성이 있는지 조회
         *
         * @param {Object} obj 객체
         * @param {String} name 키 이름
         * @return {Boolean} 키의 존재 여부
         */
        hasOwn: function (obj, name) {
            return hasOwn.call(obj, name);
        },

        /**
         * 브라우저의 Detect 정보: 되도록이면 Modernizr 라이브러리를 사용할 것을 권함
         *
         * @example
         * MELON.WEBSVC.browser.isOpera // 오페라
         * MELON.WEBSVC.browser.isWebKit // 웹킷
         * MELON.WEBSVC.browser.isIE // IE
         * MELON.WEBSVC.browser.isIE6 // IE56
         * MELON.WEBSVC.browser.isIE7 // IE567
         * MELON.WEBSVC.browser.isOldIE // IE5678
         * MELON.WEBSVC.browser.version // IE의 브라우저
         * MELON.WEBSVC.browser.isChrome // 크롬
         * MELON.WEBSVC.browser.isGecko // 파이어폭스
         * MELON.WEBSVC.browser.isMac // 맥OS
         * MELON.WEBSVC.browser.isAir // 어도비 에어
         * MELON.WEBSVC.browser.isIDevice // 아이폰, 아이패드
         * MELON.WEBSVC.browser.isSafari // 사파리
         * MELON.WEBSVC.browser.isIETri4 // IE엔진
         */
        browser: (function () {
            var t = {},
                win = context,
                na = win.navigator,
                ua = na.userAgent,
                match;

            t.isOpera = win.opera && win.opera.buildNumber;
            t.isWebKit = /WebKit/.test(ua);

            match = /(msie) ([\w.]+)/.exec(ua.toLowerCase()) || /(trident)(?:.*rv.?([\w.]+))?/.exec(ua.toLowerCase()) || ['',null,-1];
            t.isIE = !t.isWebKit && !t.isOpera && match[1] !== null;        //(/MSIE/gi).test(ua) && (/Explorer/gi).test(na.appName);
            t.isIE6 = t.isIE && /MSIE [56]/i.test(ua);
            t.isIE7 = t.isIE && /MSIE [567]/i.test(ua);
            t.isOldIE = t.isIE && /MSIE [5678]/i.test(ua);
            t.version = parseInt(match[2], 10);     // 사용법: if(WEBSVC.browser.isIE && WEBSVC.browser.version > 8) { // 9이상인 ie브라우저

            t.isChrome = (ua.indexOf('Chrome') !== -1);
            t.isGecko = (ua.indexOf('Firefox') !==-1);
            t.isMac = (ua.indexOf('Mac') !== -1);
            t.isAir = ((/adobeair/i).test(ua));
            t.isIDevice = /(iPad|iPhone)/.test(ua);
            t.isSafari = (/Safari/).test(ua);
            t.isIETri4 = (t.isIE && ua.indexOf('Trident/4.0') !== -1);

            return t;
        }()),

        /**
         * 주어진 인자가 빈값인지 체크
         *
         * @param {Object} value 체크할 문자열
         * @param {Boolean} allowEmptyString (Optional: false) 빈문자를 허용할 것인지 여부
         * @return {Boolean}
         */
        isEmpty: function (value, allowEmptyString) {
            return (value === null) || (value === undefined) || (!allowEmptyString ? value === '' : false) || (this.isArray(value) && value.length === 0);
        },

        /**
         * 배열인지 체크
         *
         * @function
         * @param {Object} value 체크할 값
         * @return {Boolean}
         */
        isArray: function (value) {
            return value && (value.constructor === Array || !!value.push);
        },

        /**
         * 날짜형인지 체크
         * @param {Object} value 체크할 값
         * @return {Boolean}
         */
        isDate: function (value) {
            return toString.call(value) === '[object Date]';
        },

        /**
         * JSON 객체인지 체크
         *
         * @function
         * @param {Object} value 체크할 값
         * @return {Boolean}
         */
        isObject: (toString.call(null) === '[object Object]') ? function (value) {
            return value !== null && value !== undefined && toString.call(value) === '[object Object]' && value.ownerDocument === undefined;
        } : function (value) {
            return toString.call(value) === '[object Object]';
        },

        /**
         * 함수형인지 체크
         *
         * @function
         * @param {Object} value 체크할 값
         * @return {Boolean}
         */
        isFunction: (typeof document !== 'undefined' && typeof document.getElementsByTagName('body') === 'function') ? function (value) {
            return toString.call(value) === '[object Function]';
        } : function (value) {
            return typeof value === 'function';
        },

        /**
         * 숫자 타입인지 체크.
         * @param {Object} value 체크할 값
         * @return {Boolean}
         */
        isNumber: function (value) {
            return typeof value === 'number' && isFinite(value);
        },

        /**
         * 숫지인지 체크하되 .를 허용
         * @param {Object} value 예: 1, '1', '2.34'
         * @return {Boolean}
         */
        isNumeric: function (value) {
            return !isNaN(parseFloat(value)) && isFinite(value);
        },

        /**
         * 문자형인지 체크
         * @param {Object} value 체크할 값
         * @return {Boolean}
         */
        isString: function (value) {
            return typeof value === 'string';
        },

        /**
         * 불린형인지 체크
         *
         * @param {Object} value 체크할 값
         * @return {Boolean}
         */
        isBoolean: function (value) {
            return typeof value === 'boolean';
        },

        /**
         * 엘리먼트인지 체크
         * @param {Object} value 체크할 값
         * @return {Boolean}
         */
        isElement: function (value) {
            return value ? value.nodeType === 1 : false;
        },

        /**
         * 텍스트노드인지 체크
         * @param {Object} value 체크할 값
         * @return {Boolean}
         */
        isTextNode: function (value) {
            return value ? value.nodeName === "#text" : false;
        },

        /**
         * 정의된 값인지 체크
         * @param {Object} 체크할 값
         * @return {Boolean}
         */
        isDefined: function (value) {
            return typeof value !== 'undefined';
        },

        /**
         * 주어진 값을 배열로 변환
         *
         * @param {Mixed} 배열로 변환하고자 하는 값
         * @return {Array}
         *
         * @example
         * MELON.WEBSVC.toArray('abcd"); => ["a", "b", "c", "d"]
         * MELON.WEBSVC.toArray(arguments);  => arguments를 객체를 array로 변환하여 Array에서 지원하는 유틸함수(slice, reverse ...)를 쓸수 있다.
         */
        toArray: function (value) {
            return Array.prototype.slice.apply(value, Array.prototype.slice.call(arguments, 1));
        },

        /**
         * 15자의 숫자로 이루어진 유니크한 값 생성
         *
         * @return {String}
         */
        getUniqId: function () {
            return Number(String(Math.random() * 10).replace(/\D/g, ''));
        },

        /**
         * 순번으로 유니크값 을 생성해서 반환
         * @function
         * @return {Number}
         */
        getUniqKey: (function() {
            var uniqKey = 1;
            return function() {
                return (uniqKey += 1);
            };
        }())

    });

    /**
     * MELON.WEBSVC 로거(console를 지원하지 않는 브라우저에서 에러가 안나도록 console를 Wrapping한 객체<br>
     * 지원하는 메소드들: [warn, info, debug, error ...])
     *
     * @namespace
     * @name MELON.WEBSVC.Logger
     *
     * @example
     * Logger.debug('bebug log');
     * Logger.setLevel(2); //
     */
    WEBSVC.define('WEBSVC.Logger', function () {
        /*!
         * js-logger - http://github.com/jonnyreeves/js-logger
         * Jonny Reeves, http://jonnyreeves.co.uk/
         * js-logger may be freely distributed under the MIT license.
         */

        // Logger 인스턴스
        var Logger = {};

        // 버전
        Logger.VERSION = "0.9.2";

        // Function which handles all incoming log messages.
        var logHandler;

        // Map of ContextualLogger instances by name; used by Logger.get() to return the same named instance.
        var contextualLoggersByNameMap = {};

        // Polyfill for ES5's Function.bind.
        var bind = function (scope, func) {
            return function () {
                return func.apply(scope, arguments);
            };
        };

        // Super exciting object merger-matron 9000 adding another 100 bytes to your download.
        var merge = function () {
            var args = arguments,
                target = args[0],
                key, i;
            for (i = 1; i < args.length; i++) {
                for (key in args[i]) {
                    if (!(key in target) && args[i].hasOwnProperty(key)) {
                        target[key] = args[i][key];
                    }
                }
            }
            return target;
        };

        // Helper to define a logging level object; helps with optimisation.
        var defineLogLevel = function (value, name) {
            return {
                value: value,
                name: name
            };
        };

        // Predefined logging levels.
        /**
         * 디버그 level
         * @memberOf MELON.WEBSVC.Logger
         * @name DEBUG
         * @static
         */
        Logger.DEBUG = defineLogLevel(1, 'DEBUG');
        /**
         * 정보 level
         * @memberOf MELON.WEBSVC.Logger
         * @name INFO
         * @static
         */
        Logger.INFO = defineLogLevel(2, 'INFO');
        /**
         * 경고 level
         * @memberOf MELON.WEBSVC.Logger
         * @name WARN
         * @static
         */
        Logger.WARN = defineLogLevel(4, 'WARN');
        /**
         * 에러 level
         * @memberOf MELON.WEBSVC.Logger
         * @name ERROR
         * @static
         */
        Logger.ERROR = defineLogLevel(8, 'ERROR');
        /**
         * off 모드
         * @memberOf MELON.WEBSVC.Logger
         * @name OFF
         * @static
         */
        Logger.OFF = defineLogLevel(99, 'OFF');

        // Inner class which performs the bulk of the work; ContextualLogger instances can be configured independently
        // of each other.
        var ContextualLogger = function (defaultContext) {
            this.context = defaultContext;
            this.setLevel(defaultContext.filterLevel);
            this.log = this.info; // Convenience alias.
        };

        ContextualLogger.prototype = /** @lends MELON.WEBSVC.Logger*/ {
            /**
             * 로그 레벨을 지정
             *
             * @param {LEVEL} level 레벨
             * @example
             * // Only log WARN and ERROR messages.
             *  Logger.setLevel(Logger.WARN);
             *  Logger.debug("Donut machine is out of pink ones");  // Not a peep.
             *  Logger.warn("Asteroid detected!");  // Logs "Asteroid detected!", best do something about that!
             */
            setLevel: function (newLevel) {
                // Ensure the supplied Level object looks valid.
                if (newLevel && "value" in newLevel) {
                    this.context.filterLevel = newLevel;
                }
            },

            // Is the logger configured to output messages at the supplied level?
            enabledFor: function (lvl) {
                var filterLevel = this.context.filterLevel;
                return lvl.value >= filterLevel.value;
            },
            /**
             * 디버그 로그
             * @param {Mixed} .... 로깅 내용
             */
            debug: function () {
                this.invoke(Logger.DEBUG, arguments);
            },

            /**
             * 정보 로그
             * @param {Mixed} ... 로깅 내용
             */
            info: function () {
                this.invoke(Logger.INFO, arguments);
            },

            /**
             * 경고 로그
             * @param {Mixed} ... 로깅 내용
             */
            warn: function () {
                this.invoke(Logger.WARN, arguments);
            },

            /**
             * 에러 로그
             *
             * @param {Mixed} ... 로깅 내용
             */
            error: function () {
                this.invoke(Logger.ERROR, arguments);
            },

            /**
             * 각 레벨에 등록된 핸들러에 로그 전달
             *
             * @param {LEVEL} level
             * @param {Mixed} ... 로깅 내용
             */
            invoke: function (level, msgArgs) {
                if (logHandler && this.enabledFor(level)) {
                    logHandler(msgArgs, merge({
                        level: level
                    }, this.context));
                }
            }
        };

        // Protected instance which all calls to the to level `Logger` module will be routed through.
        var globalLogger = new ContextualLogger({
            filterLevel: Logger.OFF
        });

        // Configure the global Logger instance.
        (function () {
            // Shortcut for optimisers.
            var L = Logger;

            L.enabledFor = bind(globalLogger, globalLogger.enabledFor);
            L.debug = bind(globalLogger, globalLogger.debug);
            L.info = bind(globalLogger, globalLogger.info);
            L.warn = bind(globalLogger, globalLogger.warn);
            L.error = bind(globalLogger, globalLogger.error);

            // Don't forget the convenience alias!
            L.log = L.info;
        }());

        /**
         * 로그 핸들러 등록
         *
         * @memberOf MELON.WEBSVC.Logger
         * @name setHandler
         * @function
         * @param {Function} func callback(meesages, context)  핸들러
         * @example
         * Logger.setHandler(function (messages, context)) {
         *   // Send messages to a custom logging endpoint for analysis.
         *   // TODO: Add some security? (nah, you worry too much! :P)
         *   jQuery.post('/logs', { message: messages[0], level: context.level });
         * });
         */
        Logger.setHandler = function (func) {
            logHandler = func;
        };


        Logger.setLevel = function (level) {
            // Set the globalLogger's level.
            globalLogger.setLevel(level);

            // Apply this level to all registered contextual loggers.
            for (var key in contextualLoggersByNameMap) {
                if (contextualLoggersByNameMap.hasOwnProperty(key)) {
                    contextualLoggersByNameMap[key].setLevel(level);
                }
            }
        };

        /**
         * Retrieve a ContextualLogger instance.  Note that named loggers automatically inherit the global logger's level,
         * default context and log handler.
         * @memberOf MELON.WEBSVC.Logger
         * @name get
         * @function
         * @param {String} name
         * @return {Logger} new sub Logger
         * @example
         * // Retrieve a named logger and store it for use.
         * var myLogger = Logger.get('ModuleA');
         * myLogger.info("FizzWozz starting up");
         */
        Logger.get = function (name) {
            // All logger instances are cached so they can be configured ahead of use.
            return contextualLoggersByNameMap[name] ||
                (contextualLoggersByNameMap[name] = new ContextualLogger(merge({
                name: name
            }, globalLogger.context)));
        };

        /**
         * Configure and example a Default implementation which writes to the `window.console` (if present).
         * @memberOf MELON.WEBSVC.Logger
         * @name useDefaults
         * @function
         * @param {Logger.Level} defaultLevel
         */
        Logger.useDefaults = function (defaultLevel) {
            // Check for the presence of a logger.
            if (!("console" in window)) {
                return;
            }

            Logger.setLevel(defaultLevel || Logger.DEBUG);
            Logger.setHandler(function (messages, context) {
                var console = window.console;
                var hdlr = console.log;

                // Prepend the logger's name to the log message for easy identification.
                if (context.name) {
                    messages[0] = "[" + context.name + "] " + messages[0];
                }

                // Delegate through to custom warn/error loggers if present on the console.
                if (context.level === Logger.WARN && console.warn) {
                    hdlr = console.warn;
                } else if (context.level === Logger.ERROR && console.error) {
                    hdlr = console.error;
                } else if (context.level === Logger.INFO && console.info) {
                    hdlr = console.info;
                }

                if (typeof hdlr !== 'function') {
                    hdlr = Function.prototype.call.bind(hdlr, console);
                }
                hdlr.apply(console, messages);
            });
        };

        return Logger;
    });
    var Logger = window.Logger = MELON.WEBSVC.Logger;
    Logger.useDefaults();

    var logger = window.logger = Logger.get('Melon Core');
    logger.setLevel(location.host.indexOf('melon.local.com') < 0 ? Logger.OFF : Logger.DEBUG); // Logger.OFF 로 지정하면 저희 로그는 안찍힙니다.

    /**
     * 문자열 관련 유틸 함수 모음
     *
     * @namespace
     * @name MELON.WEBSVC.string
     * @description
     */
    WEBSVC.define('WEBSVC.string', function () {
        var escapeChars = {
                '&': '&amp;',
                '>': '&gt;',
                '<': '&lt;',
                '"': '&quot;',
                "'": '&#39;'
            },
            unescapeChars = (function (escapeChars) {
                var results = {};
                $.each(escapeChars, function (k, v) {
                    results[v] = k;
                });
                return results;
            })(escapeChars),
            escapeRegexp = /[&><'"]/g,
            unescapeRegexp = /(&amp;|&gt;|&lt;|&quot;|&#39;|&#[0-9]{1,5};)/g,
            tagRegexp = /<\/?[^>]+>/gi,
            scriptRegexp = /<script[^>]*>([\\S\\s]*?)<\/script>/img;

        return /** @lends MELON.WEBSVC.string */{
            /**
             * 정규식이나 검색문자열을 사용하여 문자열에서 텍스트를 교체
             *
             * @param {String} value 교체를 수행할 문자열
             * @param {RegExp|String} 검색할 문자열이나 정규식 패턴
             * @param {String} 대체할 문자열
             * @return {String} 대체된 결과 문자열
             *
             * @example
             * MELON.WEBSVC.replaceAll("a1b2c3d", /[0-9]/g, ''); => "abcd"
             */
            replaceAll: function (value, find, rep) {
                if (find.constructor === RegExp) {
                    return value.replace(new RegExp(find.toString().replace(/^\/|\/$/gi, ""), "gi"), rep);
                }
                return value.split(find).join(rep);
            },

            /**
             * 주어진 문자열의 바이트길이 반환
             *
             * @param {String} value 길이를 계산할 문자열
             * @return {Number}
             *
             * @example
             * MELON.WEBSVC.byteLength("동해물과"); => 8
             */
            byteLength: function (value) {
                var l = 0;
                for (var i=0, len = value.length; i < len; i++) {
                    l += (value.charCodeAt(i) > 255) ? 2 : 1;
                }
                return l;
            },

            /**
             * 주어진 문자열을 지정된 길이(바이트)만큼 자른 후, 꼬리글을 덧붙여 반환
             *
             * @param {String} value 문자열
             * @param {Number} length 잘라낼 길이
             * @param {String} truncation (Optional: '...') 꼬리글
             * @return {String} 결과 문자열
             *
             * @example
             * MELON.WEBSVC.string.cutByByte("동해물과", 3, "..."); => "동..."
             */
            cutByByte: function (value, length, truncation) {
                var str = value,
                    chars = this.charsByByte(value, length);

                truncation || (truncation = '');
                if (str.length > chars) {
                    return str.substring(0, chars) + truncation;
                }
                return str;
            },

            /**
             * 주어진 바이트길이에 해당하는 char index 반환
             *
             * @param {String} value 문자열
             * @param {Number} length 제한 문자수
             * @return {Number} chars count
             */
            charsByByte: function (value, length) {
                var str = value,
                    l = 0, len = 0, i = 0;
                for (i=0, len = str.length; i < len; i++) {
                    l += (str.charCodeAt(i) > 255) ? 2 : 1;
                    if (l > length) { return i; }
                }
                return i;
            },

            /**
             * 첫글자를 대문자로 변환하고 이후의 문자들은 소문자로 변환
             *
             * @param {String} value 문자열
             * @return {String} 결과 문자열
             *
             * @example
             * MELON.WEBSVC.string.capitalize("abCdEfg"); => "Abcdefg"
             */
            capitalize: function (value) {
                return value ? value.charAt(0).toUpperCase() + value.substring(1) : value;
            },

            /**
             * 카멜 형식으로 변환
             *
             * @param {String} value 문자열
             * @return {String} 결과 문자열
             *
             * @example
             * MELON.WEBSVC.string.capitalize("ab-cd-efg"); => "abCdEfg"
             */
            camelize: function (value) {
                return value ? value.replace(/(\-|_|\s)+(.)?/g, function(a, b, c) {
                    return (c ? c.toUpperCase() : '');
                }) : value
            },


            /**
             * 대쉬 형식으로 변환
             *
             * @param {String} value 문자열
             * @return {String} 결과 문자열
             *
             * @example
             * MELON.WEBSVC.string.dasherize("abCdEfg"); => "ab-cd-efg"
             */
            dasherize: function (value) {
                return value ? value.replace(/[_\s]+/g, '-').replace(/([A-Z])/g, '-$1').replace(/-+/g, '-').toLowerCase() : value;
            },

            /**
             * 주어진 문자열을 지정한 수만큼 반복하여 조합
             *
             * @param {String} value 문자열
             * @param {Number} cnt 반복 횟수
             * @return {String} 결과 문자열
             *
             * @example
             * MELON.WEBSVC.string.repeat("ab", 4); => "abababab"
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
             * @param {String} value 특수기호
             * @return {String} 결과 문자열
             *
             * @example
             * MELON.WEBSVC.string.escapeHTML('<div><a href="#">링크</a></div>'); => "&lt;div&gt;&lt;a href=&quot;#&quot;&gt;링크&lt;/a&gt;&lt;/div&gt;"
             */
            escapeHTML: function (value) {
                return value ? (value+"").replace(escapeRegexp, function (m) {
                    return escapeChars[m];
                }) : value;
            },

            /**
             * HTML ENTITY로 변환된 문자열을 원래 기호로 변환
             *
             * @param {String} value 문자열
             * @return {String} 결과 문자열
             *
             * @example
             * MELON.WEBSVC.string.unescapeHTML('&lt;div&gt;&lt;a href=&quot;#&quot;&gt;링크&lt;/a&gt;&lt;/div&gt;');  => '<div><a href="#">링크</a></div>'
             */
            unescapeHTML: function (value) {
                return value ? (value+"").replace(unescapeRegexp, function (m) {
                    return unescapeChars[m];
                }) : value;
            },

            /**
             * string === value이면 other를,  string !== value 이면 value를 반환
             *
             * @param {String} value
             * @param {String} these
             * @param {String} other
             * @return {String}
             *
             * @example
             * MELON.WEBSVC.string.toggle('ASC", "ASC", "DESC"); => "DESC"
             * MELON.WEBSVC.string.toggle('DESC", "ASC", "DESC"); => "ASC"
             */
            toggle: function (value, these, other) {
                return these === value ? other : value;
            },

            /**
             * 주어진 문자열에 있는 {인덱스} 부분을 인수로 대테하여 반환
             *
             * @param {String} format 문자열
             * @param {String} ... 대체할 문자열
             * @return {String} 결과 문자열
             *
             * @example
             * MELON.WEBSVC.string.format("{0}:{1}:{2} {0}", "a", "b", "c");  => "a:b:c a"
             */
            format: function (format) {
                var args = MELON.WEBSVC.toArray(arguments).slice(1);

                return format.replace(/{([0-9]+)}/g, function (m, i) {
                    return args[i];
                });
            },

            /**
             * 주어진 문자열에서 HTML를 제거
             *
             * @param {String} value 문자열
             * @return {String}
             */
            stripTags: function (value) {
                return value.replace(tagRegexp, '');
            },

            /**
             * 주어진 문자열에서 스크립트를 제거
             *
             * @param {String} value 문자열
             * @return {String}
             */
            stripScripts: function (value) {
                return value.replace(scriptRegexp, '');
            }

        };
    });


    /**
     * @namespace
     * @name MELON.WEBSVC.uri
     * @description
     */
    WEBSVC.define('WEBSVC.uri', /** @lends MELON.WEBSVC.uri */{

        /**
         * 주어진 url에 쿼리스츠링을 조합
         *
         * @param {String} url
         * @param {String:Object} string
         * @return {String}
         *
         * @example
         * MELON.WEBSVC.uri.urlAppend("board.do", {"a":1, "b": 2, "c": {"d": 4}}); => "board.do?a=1&b=2&c[d]=4"
         * MELON.WEBSVC.uri.urlAppend("board.do?id=123", {"a":1, "b": 2, "c": {"d": 4}}); => "board.do?id=123&a=1&b=2&c[d]=4"
         */
        addToQueryString: function (url, string) {
            if (MELON.WEBSVC.isObject(string)) {
                string = MELON.WEBSVC.object.toQueryString(string);
            }
            if (!MELON.WEBSVC.isEmpty(string)) {
                return url + (url.indexOf('?') === -1 ? '?' : '&') + string;
            }

            return url;
        },

        /**
         * 쿼리스트링을 객체로 변환
         *
         * @param {String} query
         * @return {Object}
         *
         * @example
         * MELON.WEBSVC.uri.parseQuery("a=1&b=2"); => {"a": 1, "b": 2}
         */
        parseQuery: function (query) {
            if (!query) {
                return {};
            }
            if (query.length > 0 && query.charAt(0) === '?'){ query = query.substr(1); }

            var params = (query + '').split('&');
            var obj = {};
            var params_length = 0,
                tmp = '',
                x = 0;
            params_length = params.length;
            for (x = 0; x < params_length; x++) {
                tmp = params[x].split('=');
                obj[unescape(tmp[0])] = unescape(tmp[1]).replace(/[+]/g, ' ');
            }
            return obj;
        },

        /**
         * url를 파싱하여 host, port, protocol 등을 추출
         *
         * @function
         * @param {String} str url 문자열
         * @return {Object}
         *
         * @example
         * MELON.WEBSVC.uri.parseUrl("http://www.MELON.WEBSVC.com:8080/list.do?a=1&b=2#comment");
         * => {scheme: "http", host: "www.MELON.WEBSVC.com", port: "8080", path: "/list.do", query: "a=1&b=2"…}
         */
        parseUrl: (function() {
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
                    str = window.location.protocol + str;
                }
                var m = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
                    uri = {}, i = 14;
                while (i--){ uri[o.key[i]] = m[i] || ""; }
                var retArr = {};
                if (uri.protocol !== '') { retArr.scheme = uri.protocol; }
                if (uri.host !== '') { retArr.host = uri.host; }
                if (uri.port !== '') { retArr.port = uri.port; }
                if (uri.user !== '') { retArr.user = uri.user; }
                if (uri.password !== '') { retArr.pass = uri.password; }
                if (uri.path !== '') { retArr.path = uri.path; }
                if (uri.query !== '') { retArr.query = uri.query; }
                if (uri.anchor !== '') { retArr.fragment = uri.anchor; }
                return retArr;
            };
        })(),

        /**
         * 주어진 url에서 해쉬문자열 제거
         *
         * @param {String} url url 문자열
         * @return {String} 결과 문자열
         *
         * @example
         * MELON.WEBSVC.uri.removeHash("list.do#comment"); => "list.do"
         */
        removeHash: function (url) {
            return url ? url.replace(/.*(?=#[^\s]+$)/, '') : url;
        }
    });

    /**
     * 숫자관련 유틸함수 모음
     *
     * @namespace
     * @name MELON.WEBSVC.number
     * @description
     */
    WEBSVC.define('WEBSVC.number', /** @lends MELON.WEBSVC.number */{
        /**
         * 주어진 수를 자릿수만큼 앞자리에 0을 채워서 반환
         *
         * @param {String} value
         * @param {Number} size (Optional: 2)
         * @param {String} character (Optional: '0')
         * @return {String}
         *
         * @example
         * MELON.WEBSVC.number.zeroPad(2, 3); => "002"
         */
        zeroPad: function (value, size, character) {
            var result = String(value);
            character = character || "0";
            size || (size = 2);

            while (result.length < size) {
                result = character + result;
            }
            return result;
        },

        /**
         * 세자리마다 ,를 삽입
         *
         * @param {Number} value
         * @return {String}
         *
         * @example
         * MELON.WEBSVC.number.addComma(21342); => "21,342"
         */
        addComma: function (value) {
            value += '';
            var x = value.split('.'),
                x1 = x[0],
                x2 = x.length > 1 ? '.' + x[1] : '',
                re = /(\d+)(\d{3})/;

            while (re.test(x1)) {
                x1 = x1.replace(re, '$1' + ',' + '$2');
            }
            return x1 + x2;
        },

        /**
         * min ~ max사이의 랜덤값 반환
         *
         * @param {Number} min 최소값
         * @param {Number} max 최대값
         * @return {Number} 랜덤값
         */
        random: function (min, max) {
            if (max === null) {
                max = min;
                min = 0;
            }
            return min + Math.floor(Math.random() * (max - min + 1));
        },

        /**
         * 상하한값을 반환. value가 min보다 작을 경우 min을, max보다 클 경우 max를 반환
         *
         * @param {Number} value
         * @param {Number} min 최소값
         * @param {Number} max 최대값
         * @return {Number}
         */
        limit: function (value, min, max) {
            if (value < min) { return min; }
            else if (value > max) { return max; }
            return value;
        }
    });


    /**
     * 배열관련 유틸함수
     * @namespace
     * @name MELON.WEBSVC.array
     */
    WEBSVC.define('WEBSVC.array', /** @lends MELON.WEBSVC.array */{
        /**
         * 콜백함수로 하여금 요소를 가공하는 함수
         *
         * @param {Array} obj 배열
         * @param {Function} cb 콜백함수
         * @return {Array}
         *
         * @example
         * MELON.WEBSVC.array.map([1, 2, 3], function(item, index){
         *      return item * 10;
         * });
         * => [10, 20, 30]
         */
        map: function (obj, cb) {
            var results = [];
            if (!WEBSVC.isArray(obj) || !WEBSVC.isFunction(cb)) { return results; }

            for(var i =0, len = obj.length; i < len; i++) {
                results[results.length] = cb(obj[i], i, obj);
            }
            return results;
        },

        /**
         * 배열 요소의 순서를 섞어주는 함수
         *
         * @param {Array} obj 배열
         * @return {Array} 순서가 섞인 새로운 배열
         */
        shuffle: function (obj) {
            var rand,
                index = 0,
                shuffled = [],
                number = WEBSVC.number;

            $.each(obj, function (k, value) {
                rand = number.random(index++);
                shuffled[index - 1] = shuffled[rand], shuffled[rand] = value;
            });
            return shuffled;
        },

        /**
         * 콜백함수로 하여금 요소를 걸려내는 함수
         *
         * @param {Array} obj 배열
         * @param {Function} cb 콜백함수
         * @return {Array}
         *
         * @example
         * MELON.WEBSVC.array.filter([1, '일', 2, '이', 3, '삼'], function(item, index){
         *      return typeof item === 'string';
         * });
         * => ['일','이','삼']
         */
        filter: function (obj, cb) {
            var results = [];
            if (!WEBSVC.isArray(obj) || !WEBSVC.isFunction(cb)) { return results; }
            for(var i =0, len = obj.length; i < len; i++) {
                cb(obj[i], i, obj) && (results[results.length] = obj[i]);
            }
            return results;
        },

        /**
         * 주어진 배열에 지정된 값이 존재하는지 체크
         *
         * @param {Array} obj 배열
         * @param {Function} cb 콜백함수
         * @return {Array}
         *
         * @example
         * MELON.WEBSVC.array.include([1, '일', 2, '이', 3, '삼'], '삼');  => true
         */
        include: function (arr, value, b) {
            return MELON.WEBSVC.array.indexOf(arr, value, b) > -1;
        },

        /**
         * 주어진 인덱스의 요소를 반환
         *
         * @param {Array} obj 배열
         * @param {Function} cb 콜백함수
         * @return {Array}
         *
         * @example
         * MELON.WEBSVC.array.indexOf([1, '일', 2, '이', 3, '삼'], '일');  => 1
         */
        indexOf: function (arr, value, b) {
            for (var i = 0, len = arr.length; i < len; i++) {
                if( (b !== false && arr[i] === value) || (b === false && arr[i] == value) ) { return i; }
            }
            return -1;
        },

        /**
         * 주어진 배열에서 index에 해당하는 요소를 삭제
         *
         * @param {Array} value 배열
         * @param {Number} index 삭제할 인덱스
         * @return {Array} 지정한 요소가 삭제된 배열
         */
        remove: function (value, index) {
            if (!MELON.WEBSVC.isArray(value)) { return value; }
            return value.slice(index, 1);
        },

        /**
         * 주어진 배열에서 가장 큰 요소를 반환
         *
         * @param {Array} array 배열
         * @return {Mix}
         */
        max: function( array ){
            return Math.max.apply( Math, array );
        },

        /**
         * 주어진 배열에서 가장 작은 요소를 반환
         *
         * @param {Array} array 배열
         * @return {Mix}
         */
        min: function( array ){
            return Math.min.apply( Math, array );
        }
    });

    /**
     * JSON객체 관련 유틸함수
     * @namespace
     * @name MELON.WEBSVC.object
     */
    WEBSVC.define('WEBSVC.object', /** @lends MELON.WEBSVC.object */{

        /**
         * 개체의 열거가능한 속성 및 메서드 이름을 배열로 반환
         *
         * @param {Object} obj 리터럴 객체
         * @return {Array} 객체의 열거가능한 속성의 이름이 포함된 배열
         *
         * @example
         * MELON.WEBSVC.object.keys({"name": "Axl rose", "age": 50}); => ["name", "age"]
         */
        keys: function (obj) {
            var results = [];
            $.each(obj, function (k) {
                results[results.length] = k;
            });
            return results;
        },

        /**
         * 개체의 열거가능한 속성의 값을 배열로 반환
         *
         * @param {Object} obj 리터럴 객체
         * @return {Array} 객체의 열거가능한 속성의 값들이 포함된 배열
         *
         * @example
         * MELON.WEBSVC,object.values({"name": "Axl rose", "age": 50}); => ["Axl rose", 50]
         */
        values: function (obj) {
            var results = [];
            $.each(obj, function (k, v) {
                results[results.length] = v;
            });
            return results;
        },

        /**
         * 콜백함수로 하여금 요소를 가공하는 함수
         *
         * @param {JSON} obj 배열
         * @param {Function} cb 콜백함수
         * @return {JSON}
         *
         * @example
         * MELON.WEBSVC.object.map({1; 'one', 2: 'two', 3: 'three'}, function(item, key){
         *      return item + '__';
         * });
         * => {1: 'one__', 2: 'two__', 3: 'three__'}
         */
        map: function(obj, cb) {
            if (!WEBSVC.isObject(obj) || !WEBSVC.isFunction(cb)){ return obj; }
            var results = {};
            for(var k in obj) {
                if (obj.hasOwnProperty(k)) {
                    results[k] = cb(obj[k], k, obj);
                }
            }
            return results;
        },

        /**
         * 요소가 있는 json객체인지 체크
         *
         *
         * @param {Object} value json객체
         * @return {Boolean} 요소가 하나라도 있는지 여부
         */
        hasItems: function (value) {
            if (!MELON.WEBSVC.isObject(value)) {
                return false;
            }

            for (var key in value) {
                if (value.hasOwnProperty(key)) {
                    return true;
                }
            }
            return false;
        },


        /**
         * 객체를 쿼리스크링으로 변환
         *
         * @param {Object} obj 문자열
         * @param {Boolean} isEncode {Optional} URL 인코딩할지 여부
         * @return {String} 결과 문자열
         *
         * @example
         * MELON.WEBSVC.object.toQueryString({"a":1, "b": 2, "c": {"d": 4}}); => "a=1&b=2&c[d]=4"
         */
        toQueryString: function (params, isEncode) {
            if (typeof params === 'string') {
                return params;
            }
            var queryString = '',
                encode = isEncode === false ? function (v) {
                    return v;
                } : encodeURIComponent;

            $.each(params, function (key, value) {
                if (typeof (value) === 'object') {
                    $.each(value, function (innerKey, innerValue) {
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
         * 주어진 배열를 키와 요소를 맞바꾸어 반환
         *
         * @param {Array} obj 배열
         * @return {Object}
         *
         * @example
         * MELON.WEBSVC.object.travere({1:a, 2:b, 3:c, 4:d]);
         * => {a:1, b:2, c:3, d:4}
         */
        traverse: function (obj) {
            var result = {};
            $.each(obj, function (index, item) {
                result[item] = index;
            });
            return result;
        },

        /**
         * 주어진 리터럴에서 index에 해당하는 요소를 삭제
         *
         * @param {Array} value 리터럴
         * @param {Number} key 삭제할 키
         * @return 지정한 요소가 삭제된 리터럴
         */
        remove: function (value, key) {
            if (!WEBSVC.isObject(value)) { return value; }
            value[key] = null;
            delete value[key];
            return value;
        }
    });


    /**
     * 날짜관련 유틸함수
     * @namespace
     * @name MELON.WEBSVC.date
     */
    WEBSVC.define('WEBSVC.date', function () {
        var months = "Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec".split(","),
            fullMonths = "January,Febrary,March,April,May,June,July,Augst,September,October,November,December".split(",");


        function compare(d1, d2) {
            return d1.getTime() > d2.getTime() ? -1 : (d1.getTime() === d2.getTime() ? 0 : 1);
        }

        return /** @lends MELON.WEBSVC.date */{
            /**
             * 날짜형식을 지정한 포맷의 문자열로 변환
             *
             * @param {Date} formatDate
             * @param {String} formatString} 포맷 문자열
             * @return {String} 결과 문자열
             *
             * @example
             * MELON.WEBSVC.date.format(new Date(), "yy:MM:dd");
             * =>
             */
            format: function (formatDate, formatString) {
                formatString || (formatString = 'yyyy-MM-dd');
                if (formatDate instanceof Date) {
                    var yyyy = formatDate.getFullYear(),
                        yy = yyyy.toString().substring(2),
                        M = formatDate.getMonth() + 1,
                        MM = M < 10 ? "0" + M : M,
                        MMM = months[M - 1],
                        MMMM = fullMonths[M - 1],
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
                    return formatString.replace(/yyyy/g, yyyy).replace(/yy/g, yy).replace(/MMMM/g, MMMM).replace(/MMM/g, MMM).replace(/MM/g, MM).replace(/M/g, M).replace(/dd/g, dd).replace(/d/g, d).replace(/hh/g, hh).replace(/h/g, h).replace(/mm/g, mm).replace(/m/g, m).replace(/ss/g, ss).replace(/s/g, s).replace(/!!!!/g, MMMM).replace(/!!!/g, MMM).replace(/H/g, H).replace(/x/g, x);
                } else {
                    return "";
                }
            },

            /**
             * date가 start와 end사이인지 여부
             *
             * @param {Date} date 날짜
             * @param {Date} start 시작일시
             * @param {Date} end 만료일시
             * @return {Boolean}
             */
            between: function (date, start, end) {
                return date.getTime() >= start.getTime() && date.getTime() <= end.getTime();
            },

            /**
             * 날짜 비교
             *
             * @function
             * @param {Date} date1 날짜1
             * @param {Date} date2 날짜2
             * @return {Number} -1: date1가 이후, 0: 동일, 1:date2가 이후
             */
            compare: compare,

            /**
             * 년월일이 동일한가
             *
             * @param {Date} date1 날짜1
             * @param {Date} date2 날짜2
             * @return {Boolean}
             */
            equalsYMH: function(a, b){
                var ret = true;
                if(!a || !a.getDate || !b || !b.getDate) { return false; }
                $.each(['getFullYear', 'getMonth', 'getDate'], function(i, fn){
                    ret = ret && (a[fn]() === b[fn]());
                    if(!ret){ return false; }
                });
                return ret;
            },

            /**
             * value날짜가 date이후인지 여부
             *
             * @param {Date} value 날짜
             * @param {Date} date
             * @return {Boolean}
             */
            isAfter: function (value, date) {
                return compare(value, date || new Date()) === 1;
            },

            /**
             * value날짜가 date이전인지 여부
             *
             * @param {Date} value 날짜
             * @param {Date} date
             * @return {Boolean}
             */
            isBefore: function (value, date) {
                return compare(value, date || new Date()) === -1;
            },

            /**
             * 주어진 날짜 형식의 문자열을 Date객체로 변환
             *
             * @function
             * @param {String} dateStringInRange 날짜 형식의 문자열
             * @return {Date}
             */
            parseDate: (function() {
                var isoExp = /^\s*(\d{4})(\d{2})(\d{2})(\d{2})?(\d{2})?(\d{2})?\s*$/;
                return function (dateStringInRange) {
                    var date, month, parts;

                    if (dateStringInRange instanceof Date){
                        return dateStringInRange;
                    }

                    dateStringInRange = dateStringInRange.replace(/[^\d]+/g, '');
                    date = new Date(dateStringInRange);
                    if (!isNaN(date)) {
                        return date;
                    }

                    date = new Date(NaN);
                    parts = isoExp.exec(dateStringInRange);

                    if(parts) {
                        month = +parts[2];
                        date.setFullYear(parts[1]|0, month - 1, parts[3]|0);
                        date.setHours(parts[4]|0);
                        date.setMinutes(parts[5]|0);
                        date.setSeconds(parts[6]|0);
                        if(month != date.getMonth() + 1) {
                            date.setTime(NaN);
                        }
                    }
                    return date;
              };
            })(),

            /**
             * 주어진 년월의 일수를 반환
             *
             * @param {Number} year 년도
             * @param {Number} month 월
             * @return {Date}
             */
            daysInMonth: function(year, month) {
                var dd = new Date(year|0, month|0, 0);
                return dd.getDate();
            },

            /**
             * 주어진 시간이 현재부터 몇시간 이전인지 표현(예: -54000 -> 54초 이전)
             *
             * @function
             * @param {Date|Interval} time 시간
             * @return {String}
             *
             * @example
             * MELON.WEBSVC.date.prettyTimeDiff(new Date() - 51811); -> "52초 이전"
             */
            prettyTimeDiff: (function() {
                var ints = {
                    '초': 1,
                    '분': 60,
                    '시': 3600,
                    '일': 86400,
                    '주': 604800,
                    '월': 2592000,
                    '년': 31536000
                };

                return function(time) {

                    time = +new Date(time);

                    var gap = ((+new Date()) - time) / 1000,
                        amount, measure;

                    for (var i in ints) {
                        if (gap > ints[i]) { measure = i; }
                    }

                    amount = gap / ints[measure];
                    amount = gap > ints.day ? (Math.round(amount * 100) / 100) : Math.round(amount);
                    amount += measure + ' 이전';

                    return amount;
                };
            }()),
            /**
             * 주어진 시간이 현재부터 몇시간 이전인지 표현(예: -54000 -> 54초 이전)
             *
             * @function
             * @param {Date|Interval} time 시간
             * @return {String}
             *
             * @example
             * MELON.WEBSVC.date.timeDiff(new Date() - 51811); -> "00:00:52"
             */
            timeDiff: function(t1, t2) {
                var zeroPad = WEBSVC.number.zeroPad;
                var amount = (t1.getTime() - t2.getTime()) / 1000,
                    days = 0,
                    hours = 0,
                    mins = 0,
                    secs = 0;

                days=Math.floor(amount/86400);
                amount=amount%86400;
                hours=Math.floor(amount/3600);
                amount=amount%3600;
                mins=Math.floor(amount/60);
                amount=amount%60;
                secs=Math.floor(amount);

                return zeroPad(hours) + ':' + zeroPad(mins) + ':' + zeroPad(secs);
            }
        };
    });


    /**
     * prototype 을 이용한 클래스 생성
     * @namespace
     * @name MELON.WEBSVC.Class
     * @example
     * var Person = Class({
    *   $extend: Object, // 상속받을 부모클래스
    *   $singleton: true, // 싱글톤 여부
    *   $statics: { // 클래스 속성 및 함수
    *       live: function() {} // Person.live(); 으로 호출
    *   },
    *   $mixins: [Animal, Robot], // 특정 클래스에서 메소드들을 빌려오고자 할 때 해당 클래스를 지정(다중으로도 가능),
    *   initialize: function(name) {
    *       this.name = name;
    *   },
    *   say: function(job){
    *       alert("I'm Person: " + job);
    *   },
    *   run: function(){
    *       alert("i'm running...");
    *   }
    *`});
    *
    * var Man = Class({
    *   $extend: Person,
    *   initialize: function(name, age) {
    *       this.supr(name);  // Person(부모클래스)의 initialize메소드를 호출 or this.suprMethod('initialize', name);
    *       this.age = age;
    *   },
    *   // say를 오버라이딩함
    *   say: function(job) {
    *       this.suprMethod('say', 'programer'); // 부모클래스의 say 메소드 호출 - 첫번째인자는 메소드명, 두번째부터는 해당 메소드로 전달될 인자

    *       alert("I'm Man: "+ job);
    *   }
    * });
    * var man = new Man('kim', 20);
    * man.say('freeman');  // 결과: alert("I'm Person: programer"); alert("I'm Man: freeman");
    * man.run(); // 결과: alert("i'm running...");
    */


    WEBSVC.define('WEBSVC.Class', function () {
        var isFn = MELON.WEBSVC.isFunction,
            emptyFn = MELON.WEBSVC.emptyFn,
            include = MELON.WEBSVC.array.include,
            ignoreNames = ['superclass', 'members', 'statics'];


        // 부모클래스의 함수에 접근할 수 있도록 .supr 속성에 부모함수를 래핑하여 설정
        function wrap(k, fn, supr) {
            return function () {
                var tmp = this.supr, undef, ret;

                this.supr = supr.prototype[k];
                ret = {}.fabricatedUndefined;
                try {
                    ret = fn.apply(this, arguments);
                } finally {
                    this.supr = tmp;
                }
                return ret;
            };
        }

        // 속성 중에 부모클래스에 똑같은 이름의 함수가 있을 경우 래핑처리
        function process(what, o, supr) {
            for (var k in o) {
                if (o.hasOwnProperty(k)) {
                    what[k] = isFn(o[k]) && isFn(supr.prototype[k]) ? wrap(k, o[k], supr) : o[k];
                }
            }
        }

        /**
         * 클래스 정의
         *
         * @memberOf MELON.WEBSVC.Class
         *
         * @param {String} ns (Optional) 네임스페이스
         * @param {Object} attr 속성
         * @return {Class}
         */
        return function (attr) {
            var supr, statics, mixins, singleton, Parent, instance;

            if (isFn(attr)) {
                attr = attr();
            }

            // 생성자 몸체
            function constructor() {
                if (singleton) {
                    if (instance) {
                        return instance;
                    } else {
                        instance = this;
                    }
                }
                // ***** 해당클래스가 호출되기 전 초기화해야 할 글로벌 작업이 있을 경우,
                // 메모리를 아끼기 위해 미리 실행하지 않고 클래스가 한번이라도 호출될 때 실행하도록
                // 콜백함수를 제공
                // ex) var Test = Class({...}); Test.onClassCreate = function(){ window.onresize = ...; };
                if(this.constructor.onClassCreate) {
                    this.constructor.onClassCreate();
                    delete this.constructor.onClassCreate;
                }

                if (this.initialize) {
                    this.initialize.apply(this, arguments);
                } else {
                    supr.prototype.initialize && supr.prototype.initialize.apply(this, arguments);
                }
            }

            function Class() {
                constructor.apply(this, arguments);
            }

            supr = attr.$extend || emptyFn;
            singleton = attr.$singleton || false;
            statics = attr.$statics || false;
            mixins = attr.$mixins || false;

            Parent = emptyFn;
            Parent.prototype = supr.prototype;

            Class.prototype = new Parent;
            Class.prototype.constructor = Class;

            /**
             * 메소드 내에서 부모클래스에 접근할 때 사용
             * @memberOf MELON.WEBSVC.Class
             * @property
             */
            Class.superclass = supr.prototype;
            Class.classType = Class;

            if (singleton) {
                /**
                 * 싱글톤 클래스일 경우 싱글톤 인스턴스를 반환
                 * @memberOf MELON.WEBSVC.Class
                 * @property
                 */
                Class.getInstance = function () {
                    if (!instance) {
                        instance = new Class();
                    }
                    return instance;
                };
            }

            /**
             * 부모클래스의 메소드를 호출할 수 있는 래핑함수
             * @memberOf MELON.WEBSVC.Class
             * @name suprMethod
             * @function
             * @param {String} name 호출하고자 하는 부모함수명
             * @return {Mix} 부모함수의 반환값
             * @example
             * this.suprMethod('show', true);  -> 부모클래스의 show(true) 메소드 호출
             */
            Class.prototype.suprMethod = function(name) {
                var args = [].slice.call(arguments, 1);
                return supr.prototype[name].apply(this, args);
            };

            /**
             * func의 컨텍스트를 this로 지정
             * @memberOf MELON.WEBSVC.Class
             * @name proxy
             * @function
             * @param {function} function 함수
             * @return {Function}
             * @example
             * function test(){
             *      alert(this.name);
             * }
             * var Person = Class({
             *      initialize: function() {
             *          this.name = 'axl rose',
             *          this.proxy(test)();  // = test.bind(this)와 동일, test함수의 컨텍스틑 this로 지정 -> 결과: alert('axl rose');
             *      }
             * });
             */
            Class.prototype.proxy = function (func) {
                var _this = this;
                return function () {
                    func.apply(_this, [].slice.call(arguments));
                };
            };


            /**
             * 여러 클래스를 mixins방식으로 merge
             * @memberOf MELON.WEBSVC.Class
             * @name mixins
             * @function
             * @param {function} o 객체
             * @example
             * var A = Class({
             *      funcA: function(){ ... }
             * });
             * var B = Class({
             *      funcB: function(){ ... }
             * });
             * var Person = Class({
             *      initialize: function() {
             *          ...
             *      }
             * });
             * Person.mixins([A, B]);
             * var person = new Person();
             * person.funcA();
             * person.funcB();
             */
            Class.mixins = function (o) {
                if (!o.push) { o = [o]; }
                $.each(o, function (index, value) {
                    $.each(value, function (key, item) {
                        Class.prototype[key] = item;
                    });
                });
            };
            mixins && Class.mixins.call(Class, mixins);


            /**
             * 클래스에 메소드  추가
             * @memberOf MELON.WEBSVC.Class
             * @name members
             * @function
             * @param {function} o 객체
             * @example
             * var Person = Class({
             *      initialize: function() {
             *          ...
             *      }
             * });
             * Person.members({
             *      newFunc: function() { ... }
             * });
             * var person = new Person();
             * person.newFunc();
             */
            Class.members = function (o) {
                process(Class.prototype, o, supr);
            };
            attr && Class.members.call(Class, attr);

            /*
             * 클래스함수 추가함수
             * @memberOf MELON.WEBSVC.Class
             * @name statics
             * @function
             * @param {function} o 객체
             * @example
             * var Person = Class({
             *      initialize: function() {
             *          ...
             *      }
             * });
             * Person.statics({
             *      staticFunc: function() { ... }
             * });
             * Person.staticFunc();
             */
            Class.statics = function (o) {
                o = o || {};
                for (var k in o) {
                    if (!include(ignoreNames, k)) {
                        Class[k] = o[k];
                    }
                }
                return Class;
            };
            Class.statics.call(Class, supr);
            statics && Class.statics.call(Class, statics);

            return Class;
        };
    });

    WEBSVC.define('WEBSVC', /** @lends MELON.WEBSVC */{
        /**
         * 설정 값들이 들어갈 리터럴
         *
         * @private
         * @type {Object}
         */
        configs: {},

        /**
         * 설정값을 꺼내오는 함수
         *
         * @param {String} name 설정명. `.`를 구분값으로 단계별로 값을 가져올 수 있다.
         * @param {Object} def {Optional} 설정된 값이 없을 경우 사용할 기본값
         * @return {Object} 설정값
         */
        getConfig: function (name, def) {
            var root = MELON.WEBSVC.configs,
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
         * @param {String} name 설정명. `.`를 구분값으로 단계를 내려가서 설정할 수 있다.
         * @param {Object} value 설정값
         * @return {Object} 설정값
         */
        setConfig: function (name, value) {
            var root = MELON.WEBSVC.configs,
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

    /**
     * @namespace
     * @name MELON.WEBSVC.Base64
     * @description Base64 모듈
     */
    WEBSVC.define('WEBSVC.Base64', function(){
        var Base64 = /** @lends MELON.WEBSVC.Base64 */{
            _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
            /**
             * 인코딩 함수
             *
             * @param {String} c 인코딩할 문자열
             * @return {String} 인코딩된 문자열
             */
            encode: function (c) {
                var a = "";
                var k, h, f, j, g, e, d;
                var b = 0;
                c = Base64._utf8_encode(c);
                while (b < c.length) {
                    k = c.charCodeAt(b++);
                    h = c.charCodeAt(b++);
                    f = c.charCodeAt(b++);
                    j = k >> 2;
                    g = ((k & 3) << 4) | (h >> 4);
                    e = ((h & 15) << 2) | (f >> 6);
                    d = f & 63;
                    if (isNaN(h)) {
                        e = d = 64
                    } else {
                        if (isNaN(f)) {
                            d = 64
                        }
                    }
                    a = a + this._keyStr.charAt(j) + this._keyStr.charAt(g) + this._keyStr.charAt(e) + this._keyStr.charAt(d)
                }
                return a
            },
            /**
             * 디코딩 함수
             *
             * @param {String} c 디코딩할 문자열
             * @return {String} 디코딩된 문자열
             */
            decode: function (c) {
                var a = "";
                var k, h, f;
                var j, g, e, d;
                var b = 0;
                c = c.replace(/[^A-Za-z0-9\+\/\=]/g, "");
                while (b < c.length) {
                    j = this._keyStr.indexOf(c.charAt(b++));
                    g = this._keyStr.indexOf(c.charAt(b++));
                    e = this._keyStr.indexOf(c.charAt(b++));
                    d = this._keyStr.indexOf(c.charAt(b++));
                    k = (j << 2) | (g >> 4);
                    h = ((g & 15) << 4) | (e >> 2);
                    f = ((e & 3) << 6) | d;
                    a = a + String.fromCharCode(k);
                    if (e != 64) {
                        a = a + String.fromCharCode(h)
                    }
                    if (d != 64) {
                        a = a + String.fromCharCode(f)
                    }
                }
                a = Base64._utf8_decode(a);
                return a
            },
            _utf8_encode: function (b) {
                b = b.replace(/\r\n/g, "\n");
                var a = "";
                for (var e = 0; e < b.length; e++) {
                    var d = b.charCodeAt(e);
                    if (d < 128) {
                        a += String.fromCharCode(d)
                    } else {
                        if ((d > 127) && (d < 2048)) {
                            a += String.fromCharCode((d >> 6) | 192);
                            a += String.fromCharCode((d & 63) | 128)
                        } else {
                            a += String.fromCharCode((d >> 12) | 224);
                            a += String.fromCharCode(((d >> 6) & 63) | 128);
                            a += String.fromCharCode((d & 63) | 128)
                        }
                    }
                }
                return a
            },
            _utf8_decode: function (a) {
                var b = "";
                var d = 0;
                var e = 0,
                    c1 = 0,
                    c2 = 0,
                    c3 = 0; // 140117 추가
                while (d < a.length) {
                    e = a.charCodeAt(d);
                    if (e < 128) {
                        b += String.fromCharCode(e);
                        d++
                    } else {
                        if ((e > 191) && (e < 224)) {
                            c2 = a.charCodeAt(d + 1);
                            b += String.fromCharCode(((e & 31) << 6) | (c2 & 63));
                            d += 2
                        } else {
                            c2 = a.charCodeAt(d + 1);
                            c3 = a.charCodeAt(d + 2);
                            b += String.fromCharCode(((e & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                            d += 3
                        }
                    }
                }
                return b
            }
        };
        return Base64;
    });
    var Base64 = WEBSVC.Base64;


    /**
     * @namespace
     * @name MELON.WEBSVC.Cookie
     */
    WEBSVC.define('WEBSVC.Cookie', /** @lends MELON.WEBSVC.Cookie */{
        /**
         * 쿠키를 설정
         *
         * @param {String} name 쿠키명
         * @param {String} value 쿠키값
         * @param {Date} (Optional) options.expires 만료시간
         * @param {String} (Optional) options.path 쿠키의 유효경로
         * @param {String} (Optional) options.domain 쿠키의 유효 도메인
         * @param {Boolean} (Optional) options.secure https에서만 쿠키 설정이 가능하도록 하는 속성
         */
        set: function (name, value, options) {
            options || (options = {});
            var curCookie = name + "=" + escape(value) +
                ((options.expires) ? "; expires=" + options.expires.toGMTString() : "") +
                ((options.path) ? "; path=" + options.path : ";path=/") +
                ((options.domain) ? "; domain=" + options.domain : "") +
                ((options.secure) ? "; secure" : "");
            document.cookie = curCookie;
        },

        /**
         * 쿠키를 설정
         *
         * @param {String} name 쿠키명
         * @return  {String} 쿠키값
         */
        get: function (name) {
            var j, g, h, f;
            j = ";" + document.cookie.replace(/ /g, "") + ";";
            g = ";" + name + "=";
            h = j.indexOf(g);

            if (h !== -1) {
                h += g.length;
                f = j.indexOf(";", h);
                return unescape(j.substr(h, f - h));
            }
            return "";
        },

        /**
         * 쿠키 삭제
         *
         * @param {String} name 쿠키명
         */
        remove: function (name) {
            document.cookie = name + "=;expires=Fri, 31 Dec 1987 23:59:59 GMT;";
        },

        /**
         * 실명인증 쿠키 설정
         * @param {String} name
         * @param {String} value
         */
        setReal: function(name, value) {
            //document.cookie = name + "=" + escape(value) + ";path=/;domain=.melon.com";
            this.set(name, value, {
                path: '/',
                domain: 'MELON.WEBSVC.com'
            });
        },

        /**
         * dcf지원여부( 0:미지원 or 1:지원)
         * Y/N
         * @return {String}
         */
        getAndroidCkDcf: function() {
            return this.getMUADHeader("androidCkDcf");
        },

        /**
         * ???
         *
         * @return {Boolean}
         */
        chkMACAuth: function() {
            var buf = this.get("MAC");

            return (buf === null || buf === '') ? false : true;
        },

        /**
         * ???
         *
         * @return {Boolean}
         */
        chkMUACAuth: function() {
            var buf1 = this.geteMUAC();
            return (buf1 === null || buf1 === '') ? false : true;
        },

        /**
         * 상품에 대한 MHC cookie정보를 가져온다.
         * @param {String} Name
         * @return{String}
         *
         * ex)MELON.WEBSVC.Cookie.getMHCHeader("memberId");
         */
        getMHCHeader: function(Name) {

            var cookieNameArray = {},
                strBuf = unescape(decodeURIComponent(Base64.decode(this.get("MHC")))),
                arrStr;

            if (strBuf === null) { return null; }

            arrStr = strBuf.split(";");
            cookieNameArray.memberId = arrStr[0];
            cookieNameArray.melonCash = arrStr[1];
            cookieNameArray.memberGiftCnt = arrStr[2];
            cookieNameArray.melonPoint = arrStr[3];
            cookieNameArray.prodId = arrStr[4];
            cookieNameArray.prodName = arrStr[5];
            cookieNameArray.prodToDate = arrStr[6];
            cookieNameArray.autoRechargeFail = arrStr[7];
            cookieNameArray.seqmtCode = arrStr[8];

            return cookieNameArray[Name];
        },

        /**
         * ???
         * @param {String} Name
         * @return {Strring}
         *
         * ex)MELON.WEBSVC.Cookie.getMUADHeader("memberKey");
         */
        getMUADHeader: function(Name){
            var cookieNameArray = {},
                strBuf = this.getMUAD();
            if(strBuf === null) { return null; }

            var arrStr = strBuf.split(";");
            cookieNameArray.androidCkMdn = arrStr[0];
            cookieNameArray.androidCkDcf = arrStr[1];
            return cookieNameArray[Name];
        },

        /**
         * 실명인증 정보에 대한 MUAC cookie 정보를 가져온다.
         *
         * @function
         * @param {String} Name
         * @return {String}
         *
         * ex)MELON.WEBSVC.Cookie.getMUACHeader("memberKey");
         */
        getMUACHeader: (function(){
            var keyNames = 'memberKey,memberAge,realNameYn,memberNickName,memberSex,memberTempPwdYn,adultPwdOption'.split(',');

            return function(Name) {
                var strBuf = unescape(decodeURI(Base64.decode(MELON.WEBSVC.Cookie.get('MUAC'))));
                if (strBuf === null) { return null; }

                var arrStr = strBuf.split(";");
                return arrStr[MELON.WEBSVC.array.indexOf(keyNames, Name)];
            };
        })(),

        /**
         * singleton 패턴을 이용하기 위해서 작성
         * 실명인증 정보(MUAC)는 한번 등록하고 또 읽을 필요없음.
         * @return {String}
         */
        _singletonCookieMUAC: '', //singleton 전역변수
        getMUAC: function() {
            if (typeof this._singletonCookieMUAC === 'undefined') {
                var strBuf = this.get('MUAC');
                if (strBuf !== null) {
                    this._singletonCookieMUAC = unescape(decodeURI(Base64.decode(strBuf)));
                }
            }
            return this._singletonCookieMUAC;
        }
    });

    WEBSVC.define('WEBSVC', /** @lends MELON.WEBSVC */{
        /**
         * 템플릿 생성
         *
         * @param {String} text 템플릿 문자열
         * @param {Object} data 템플릿 문자열에서 변환될 데이타
         * @param {Object} settings 옵션
         * @return tempalte 함수
         *
         * @example
         * var tmpl = MELON.WEBSVC.template('&lt;span>&lt;%=name%>&lt;/span>');
         * var html = tmpl({name: 'Axl rose'}); => &lt;span>Axl rose&lt;/span>
         * $('div').html(html);
         */
        template: function (str, data) {
            var m,
                src = 'var __src = [], escapeHTML=MELON.WEBSVC.string.escapeHTML; with(value||{}){ __src.push("';
            str = $.trim(str);
            src += str.replace(/\r|\n|\t/g, " ")
                .replace(/<%(.*?)%>/g, function(a, b){ return '<%' + b.replace(/"/g, '\t') + '%>'; })
                .replace(/"/g, '\\"')
                .replace(/<%(.*?)%>/g, function(a, b){ return '<%' + b.replace(/\t/g, '"') + '%>'; })
                .replace(/<%=(.+?)%>/g, '", $1, "')
                .replace(/<%-(.+?)%>/g, '", escapeHTML($1), "')
                .replace(/(<%|%>)/g, function(a, b){ return b === '<%' ? '");' : '__src.push("'});

            src+='"); }; return __src.join("")';

            var f = new Function('value', 'data', src);
            if( data ) {
                return f( data );
            }
            return f;
        }
    });


    /**
     * @namespace
     * @name MELON.WEBSVC.valid
     * @description 밸리데이션 함수 모음
     */
    WEBSVC.define('WEBSVC.valid', function () {
        var trim = $.trim,
            isString = MELON.WEBSVC.isString,
            isNumber = MELON.WEBSVC.isNumber,
            isElement = MELON.WEBSVC.isElement;

        return /** @lends MELON.WEBSVC.valid */{
            empty: MELON.WEBSVC.isEmpty,
            /**
             * 필수입력 체크
             *
             * @param {String} str
             * @return {Boolean} 빈값이면 false 반환
             */
            require: function (str) {
                isString(str) || (isElement(str) && (str = str.value));
                return !!str;
            },
            /**
             * 유효한 이메일형식인지 체크
             *
             * @param {String} str
             * @return {Boolean}
             */
            email: function (str) {
                isString(str) || (isElement(str) && (str = str.value));
                return (str = trim(str)) ? (/\w+([-+.]\w+)*@\w+([-.]\w+)*\.[a-zA-Z]{2,4}$/).test(str) : false;
            },
            /**
             * 한글인지 체크
             *
             * @param {String} str
             * @return {Boolean}
             */
            kor: function (str) {
                isString(str) || (isElement(str) && (str = str.value));
                return (str = trim(str)) ? (/^[가-힝]+$/).test(str) : false;
            },
            /**
             * 영문 체크
             *
             * @param {String} str
             * @return {Boolean}
             */
            eng: function (str) {
                isString(str) || (isElement(str) && (str = str.value));
                return (str = trim(str)) ? (/^[a-zA-Z]+$/).test(str) : false;
            },
            /**
             * 숫자 체크
             *
             * @param {String} str
             * @return {Boolean}
             */
            num: function (str) {
                isString(str) || (isElement(str) && (str = str.value));
                return (str = trim(str)) ? isNumber(str) : false;
            },
            /**
             * 유효한 url형식인지 체크
             *
             * @param {String} str
             * @return {Boolean}
             */
            url: function (str) {
                isString(str) || (isElement(str) && (str = str.value));
                return (str = trim(str)) ? (/^https?:\/\/([\w\-]+\.)+/).test(str) : false;
            },
            /**
             * 특수기호 유무 체크
             *
             * @param {String} str
             * @return {Boolean}
             */
            special: function (str) {
                isString(str) || (isElement(str) && (str = str.value));
                return (str = trim(str)) ? (/^[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]+$/).test(str) : false;
            },
            /**
             * 유효한 전화번호형식인지 체크
             *
             * @param {String} str
             * @return {Boolean}
             */
            phone: function (str) {
                isString(str) || (isElement(str) && (str = str.value));
                return (str = trim(str)) ? (/^\d{1,3}-\d{3,4}-\d{4}$/).test(str) : false;
            },
            /**
             * 유효한 yyyy-MM-dd형식인지 체크
             *
             * @param {String} str
             * @return {Boolean}
             */
            dateYMD: function (str) {
                isString(str) || (isElement(str) && (str = str.value));
                return (str = trim(str)) ? (/^\d{4}-\d{2}-\d{2}$/).test(str) : false;
            },
            /**
             * 유효한 yyyy-MM-dd hh:mm:ss형식인지 체크
             *
             * @param {String} str
             * @return {Boolean}
             */
            dateYMDHMS: function (str) {
                isString(str) || (isElement(str) && (str = str.value));
                return (str = trim(str)) ? (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/).test(str) : false;
            },
            /**
             * 유효한 주민번호인지 체크
             *
             * @param {String} strSsn1 앞주민번호.
             * @param {String} strSsn2 (Optional) 뒷주민번호. 값이 없으면 strSsn1만으로 체크
             * @return {Boolean}
             */
            SSN: function (sid1, sid2) {
                var num = sid1 + (sid2 ? sid2 : ""),
                    pattern = /^(\d{6})-?(\d{7})$/,
                    sum = 0,
                    last, mod,
                    bases = "234567892345";

                if (!pattern.test(num)) { return false; }
                num = RegExp.$1 + RegExp.$2;

                last = num.charCodeAt(12) - 0x30;

                for (var i = 0; i < 12; i++) {
                    if (isNaN(num.substring(i, i + 1))) { return false; }
                    sum += (num.charCodeAt(i) - 0x30) * (bases.charCodeAt(i) - 0x30);
                }
                mod = sum % 11;
                return ((11 - mod) % 10 === last) ? true : false;
            },
            /**
             * 유효한 외국인주민번호인지 체크
             *
             * @param {String} strSsn1 앞주민번호.
             * @param {String} strSsn2 (Optional) 뒷주민번호. 값이 없으면 strSsn1만으로 체크
             * @return {Boolean}
             */
            FgnSSN: function (sid1, sid2) {
                var num = sid1 + (sid2 ? sid2 : ""),
                    pattern = /^(\d{6})-?(\d{7})$/,
                    sum = 0,
                    odd, buf,
                    multipliers = "234567892345".split("");

                if (!pattern.test(num)) { return false; }
                num = RegExp.$1 + RegExp.$2;

                buf = MELON.WEBSVC.toArray(num);
                odd = buf[7] * 10 + buf[8];

                if (odd % 2 !== 0) { return false; }

                if ((buf[11] !== 6) && (buf[11] !== 7) && (buf[11] !== 9)) { return false; }

                for (var i = 0; i < 12; i++) { sum += (buf[i] *= multipliers[i]); }

                sum = 11 - (sum % 11);
                if (sum >= 10){ sum -= 10; }

                sum += 2;
                if (sum >= 10) { sum -= 10; }

                if (sum !== buf[12]) { return false; }

                return true;
            }
        };
    });

    /**
     * @namespace
     * @name MELON.WEBSVC.css
     * @description 벤더별 css명칭 생성
     */
    WEBSVC.define('WEBSVC.css', function(){

        var _tmpDiv = WEBSVC.tmpNode,
            _prefixes = ['Webkit', 'Moz', 'O', 'ms', 'Khtml'],
            _style = _tmpDiv.style,
            _vendor = (function () {
                var vendors = ['t', 'webkitT', 'MozT', 'msT', 'OT'],
                    transform,
                    i = 0,
                    l = vendors.length;

                for ( ; i < l; i++ ) {
                    transform = vendors[i] + 'ransform';
                    if ( transform in _style ) return vendors[i].substr(0, vendors[i].length-1);
                }

                return false;
            })(),
            string  = WEBSVC.string;

            function prefixStyle(name) {
                if ( _vendor === false ) return false;
                if ( _vendor === '' ) return name;
                return _vendor + string.capitalize(name);
            }

        return /** @lends MELON.WEBSVC.css */{
            supportTransition: _vendor !== false,
            /**
             * 현재 브라우저의 css prefix명 (webkit or Moz or ms or O)
             * @function
             * @return {String}
             */
            vendor: _vendor,
            /**
             * 주어진 css속성을 지원하는지 체크
             *
             * @param {String} cssName 체크하고자 하는 css명
             * @return {Boolean} 지원여부
             */
            hasCSS3: function (name) {
                var a = _prefixes.length;
                if (name in _style) { return true; }
                name = string.capitalize(name);
                while (a--) {
                    if (_prefixes[a] + name in _style) {
                        return true;
                    }
                }
                return false;
            },

            /**
             * 주어진 css명 앞에 현재 브라우저에 해당하는 prefix를 붙여준다.
             *
             * @function
             * @param {String} cssName css명
             * @return {String}
             * @example
             * MELON.WEBSVC.css.prefixStyle('transition'); // => webkitTransition
             */
            prefixStyle: prefixStyle
        };
    });

    /**
     * @namespace
     * @name MELON.WEBSVC.util
     */
    WEBSVC.define('WEBSVC.util', function(){

        return /** @lends MELON.WEBSVC.util */{
            /**
             * png Fix
             */
            pngFix: function () {
                var s, bg;
                $('img[@src*=".png"]', document.body).each(function () {
                    this.css('filter', 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src=\'' + this.src + '\', sizingMethod=\'\')');
                    this.src = MELON.WEBSVC.getSite() + MELON.WEBSVC.Urls.getBlankImage() || '/resource/images/common/blank.gif';
                });
                $('.pngfix', document.body).each(function () {
                    var $this = $(this);

                    s = $this.css('background-image');
                    if (s && /\.(png)/i.test(s)) {
                        bg = /url\("(.*)"\)/.exec(s)[1];
                        $this.css('background-image', 'none');
                        $this.css('filter', "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + bg + "',sizingMethod='scale')");
                    }
                });
            },

            /**
             * 페이지에 존재하는 플래쉬의 wmode모드를 opaque로 변경
             */
            wmode: function () {
                $('object').each(function () {
                    var $this;
                    if (this.classid.toLowerCase() === 'clsid:d27cdb6e-ae6d-11cf-96b8-444553540000' || this.type.toLowerCase() === 'application/x-shockwave-flash') {
                        if (!this.wmode || this.wmode.toLowerCase() === 'window') {
                            this.wmode = 'opaque';
                            $this = $(this);
                            if (typeof this.outerHTML === 'undefined') {
                                $this.replaceWith($this.clone(true));
                            } else {
                                this.outerHTML = this.outerHTML;
                            }
                        }
                    }
                });
                $('embed[type="application/x-shockwave-flash"]').each(function () {
                    var $this = $(this),
                        wm = $this.attr('wmode');
                    if (!wm || wm.toLowerCase() === 'window') {
                        $this.attr('wmode', 'opaque');
                        if (typeof this.outerHTML === 'undefined') {
                            $this.replaceWith($this.clone(true));
                        } else {
                            this.outerHTML = this.outerHTML;
                        }
                    }
                });
            },

            /**
             * 팝업. (MELON.WEBSVC.openPopup으로도 사용가능)
             * @param {string} url 주소
             * @param {number=} width 너비.
             * @param {number=} height 높이.
             * @param {opts=} 팝업 창 모양 제어 옵션.
             */
            openPopup: function (url, width, height, opts, center, target) {//140611_수정
                opts = $.extend({

                }, opts);
                width = width || 600;
                height = height || 400;
                center = center;//140408_추가
                target = target;//140611_추가
                var winCoords = WEBSVC.util.popupCoords(width, height),//140408_수정
                    target = target || '',//140611_수정
                    feature = 'app_, ',
                    tmp = [];

                delete opts.name;
                for(var key in opts) {
                    tmp.push(key + '=' + opts[ key ]);
                }
                WEBSVC.browser.isSafari && tmp.push('location=yes');
                tmp.push('height='+height);
                tmp.push('width='+width);
                //140408_추가
                if (center) {
                    tmp.push('top='+winCoords.top);
                    tmp.push('left='+winCoords.left);
                };
                /* + ', top=' + winCoords.top + ', left=' + winCoords.left;*/
                feature += tmp.join(', ');

                var winpop = window.open(//140611_수정
                    url,
                    target,
                    feature
                );

                /* 140618 update */
                winpop.focus();
                return winpop;
                /* //140618 update */
            },

            /**
             * 팝업의 사이즈를 $el 사이즈에 맞게 조절
             */
            resizePopup: function($el) {
                if(!($el instanceof jQuery)) { $el = $($el); }
                window.resizeTo($el.width(), $el.height());
            },

            /**
             * 팝업의 사이즈에 따른 화면상의 중앙 위치좌표를 반환
             * @param {number} w 너비.
             * @param {number} h 높이.
             * @return {JSON} {left: 값, top: 값}
             */
            popupCoords: function (w, h) {
                var wLeft = window.screenLeft ? window.screenLeft : window.screenX,
                    wTop = window.screenTop ? window.screenTop : window.screenY,
                    wWidth = window.outerWidth ? window.outerWidth : document.documentElement.clientWidth,
                    wHeight = window.outerHeight ? window.outerHeight : document.documentElement.clientHeight;
                    if(!wLeft) wLeft = 0;if(!wTop) wTop = 0; // 140617 update

                return {
                    left: wLeft + (wWidth / 2) - (w / 2),
                    top: wTop + (wHeight / 2) - (h / 2) - 25
                };
            },

            /**
             * data-src에 있는 이미지주소를 실제로 불러들인 다음, 주어진 사이즈내에서 자동으로 리사이징 처리
             * @param {jQuery} $imgs
             * @param {Number} wrapWidth 최대 너비 값
             * @param {Number} wrapHeight 최대 높이 값
             * @param {Function} [onError] (optional) 이미지를 불어오지 못했을 경우 실행할 콜백함수
             * @return {Boolean} true 불러들인 이미지가 있었는지 여부
             */
            lazyLoadImage: function ($imgs, wrapWidth, wrapHeight, onError) {
                var hasLazyImage = false;
                var dataSrcAttr = 'data-src';

                $imgs.filter('img[data-src]').each(function(i) {
                    var $img = $(this);
                    wrapWidth = wrapWidth || $img.parent().width();
                    wrapHeight = wrapHeight || $img.parent().height();

                    // 이미지가 로드되면, 실제 사이즈를 체크해서 가로이미지인지 세로이미지인지에 따라 기준이 되는 width, height에 지정한다.
                    $img.one('load', function() {
                        $img.removeAttr('width height').css({'width':'auto', 'height':'auto'});
                        if($img.attr('data-no-height') === 'true' && this.width > wrapWidth) {
                            $img.css('width', wrapWidth);
                        } else if($img.attr('data-no-width') === 'true' && this.height > wrapHeight) {
                            $img.css('height', wrapWidth);
                        } else {
                            var isHoriz = this.width > this.height;
                            if ( isHoriz ) { // 가로로 긴 이미지
                                 $img.css('width', Math.min(this.width, wrapWidth));
                             } else { // 세로로 긴 이미지
                                 $img.css('height', Math.min(this.height, wrapHeight));
                             }
                        }
                    }).attr('src', $img.attr('data-src')).removeAttr('data-src');
                });
                return hasLazyImage;
            },

            /**
             * 도큐먼트의 높이를 반환
             * @return {Number}
             */
            getDocHeight: function() {
                var doc = document,
                    bd = doc.body,
                    de = doc.documentElement;

                return Math.max(
                    Math.max(bd.scrollHeight, de.scrollHeight),
                    Math.max(bd.offsetHeight, de.offsetHeight),
                    Math.max(bd.clientHeight, de.clientHeight)
                );
            },

            /**
             * 도큐먼트의 너비를 반환
             * @return {Number}
             */
            getDocWidth: function() {
                var doc = document,
                    bd = doc.body,
                    de = doc.documentElement;
                return Math.max(
                    Math.max(bd.scrollWidth, de.scrollWidth),
                    Math.max(bd.offsetWidth, de.offsetWidth),
                    Math.max(bd.clientWidth, de.clientWidth)
                );
            },

            /**
             * 창의 너비를 반환
             * @return {Number}
             */
            getWinWidth : function() {
                var w = 0;
                if (self.innerWidth) {
                    w = self.innerWidth;
                } else if (document.documentElement && document.documentElement.clientHeight) {
                    w = document.documentElement.clientWidth;
                } else if (document.body) {
                    w = document.body.clientWidth;
                }
                return w;
            },

            /**
             * 창의 높이를 반환
             * @return {Number}
             */
            getWinHeight : function() {
                var w = 0;
                if (self.innerHeight) {
                    w = self.innerHeight;
                } else if (document.documentElement && document.documentElement.clientHeight) {
                    w = document.documentElement.clientHeight;
                } else if (document.body) {
                    w = document.body.clientHeight;
                }
                return w;
            }
        };
    });

    WEBSVC.openPopup = WEBSVC.util.openPopup;

})(window, jQuery);


(function (context, $, WEBSVC) {
    "use strict";
    /* jshint expr: true, validthis: true */

    var $win = WEBSVC.$win,
        $doc = WEBSVC.$doc,
        Class = WEBSVC.Class,
        logger = window.logger,
        dateUtil = WEBSVC.date,
        stringUtil = WEBSVC.string,
        numberUtil = WEBSVC.number,
        View;       // PBPGN.View

    /*
     * @namespace
     * @name MELON.WEBSVC.EVENTS
     */
    WEBSVC.define('WEBSVC.EVENTS', {
        ON_BEFORE_SHOW: 'beforeshow',
        ON_SHOW: 'show',
        ON_BEFORE_HIDE: 'beforehide',
        ON_HIDE: 'hide'
    });


    WEBSVC.define('WEBSVC', /** @lends MELON.WEBSVC */{
        /**
         * 작성된 클래스를 jQuery의 플러그인으로 사용할 수 있도록 바인딩시켜 주는 함수
         *
         * @param {Class} klass 클래스
         * @param {String} name 플러그인명
         *
         * @example
         * // 클래스 정의
         * var Slider = MELON.WEBSVC.Class({
         *   initialize: function(el, options) { // 생성자의 형식을 반드시 지킬 것..(첫번째 인수: 대상 엘리먼트, 두번째 인수: 옵션값들)
         *   ...
         *   },
         *   ...
         * });
         * MELON.WEBSVC.bindjQuery(Slider, 'melonSlider');
         * // 실제 사용시
         * $('#slider').melonSlider({count: 10});
         */
        bindjQuery: function (Klass, name) {
            var old = $.fn[name];

            $.fn[name] = function (options) {
                var a = arguments,
                    args = [].slice.call(a, 1),
                    me = this,
                    returnValue = this;

                this.each(function() {
                    var $this = $(this),
                        methodValue,
                        instance;

                    if( !(instance = $this.data(name)) || (a.length === 1 && typeof options !== 'string')) {
                        instance && (instance.destroy(), instance = null);
                        $this.data(name, (instance = new Klass(this, $.extend({}, $this.data(), options), me)));
                    }

                    if (typeof options === 'string' && WEBSVC.isFunction(instance[options])) {
                        try {
                            methodValue = instance[options].apply(instance, args);
                        } catch(e) {
                            logger.debug(e);
                        }

                        if (/*methodValue !== instance && */methodValue !== undefined) {
                            returnValue = methodValue;
                            return false;
                        }
                    }
                });
                return returnValue;
            };

            // 기존의 모듈로 복구
            $.fn[name].noConflict = function() {
                $.fn[name] = old;
                return this;
            };
        }
    });


    WEBSVC.define('WEBSVC.Listener', function () {
        /**
         * 이벤트 리스너
         * @class
         * @name MELON.WEBSVC.Listener
         */
        var Listener = Class( /** @lends MELON.WEBSVC.Listener# */ {
            /**
             * 생성자
             */
            initialize: function () {
                this._listeners = $({});
            },

            /**
             * 이벤트 핸들러 등록
             * @param {Object} name 이벤트명
             * @param {Object} cb 핸들러
             */
            on: function () {
                var lsn = this._listeners;
                lsn.on.apply(lsn, arguments);
                return this;
            },

            /**
             * 한번만 실행할 이벤트 핸들러 등록
             * @param {Object} name 이벤트명
             * @param {Object} cb 핸들러
             */
            once: function () {
                var lsn = this._listeners;
                lsn.once.apply(lsn, arguments);
                return this;
            },

            /**
             * 이벤트 핸들러 삭제
             * @param {Object} name 삭제할 이벤트명
             * @param {Object} cb {Optional} 삭제할 핸들러. 이 인자가 없을 경우 name에 등록된 모든 핸들러를 삭제.
             */
            off: function () {
                var lsn = this._listeners;
                lsn.off.apply(lsn, arguments);
                return this;
            },

            /**
             * 이벤트 발생
             * @param {Object} name 발생시킬 이벤트명
             */
            trigger: function () {
                var lsn = this._listeners;
                lsn.trigger.apply(lsn, arguments);
                return this;
            }
        });

        return Listener;
    });


    /**
     * @namespace
     * @name MELON.WEBSVC.PubSub
     * @description 발행/구독 객체: 상태변화를 관찰하는 옵저버(핸들러)를 등록하여, 상태변화가 있을 때마다 옵저버를 발행(실행)
     * 하도록 하는 객체이다.
     * @example
     * // 옵저버 등록
     * MELON.WEBSVC.PubSub.on('customevent', function(){
     *   alert('안녕하세요');
     * });
     *
     * // 등록된 옵저버 실행
     * MELON.WEBSVC.PubSub.trigger('customevent');
     */
    WEBSVC.define('WEBSVC.PubSub', function () {

        var PubSub = new WEBSVC.Listener();
        PubSub.attach = PubSub.on;
        PubSub.unattach = PubSub.off;

        return PubSub;
    });


    /**
     * @namespace
     * @name MELON.PBPGN
     */
    View = WEBSVC.define('PBPGN.View', function () {
        var isFn = MELON.WEBSVC.isFunction,
            execObject = function(obj, ctx) {
                return isFn(obj) ? obj.call(ctx) : obj;
            };

        /**
         * 모든 UI요소 클래스의 최상위 클래스로써, UI클래스를 작성함에 있어서 편리한 기능을 제공해준다.
         * @class
         * @name MELON.PBPGN.View
         *
         * @example
         *
         * var Slider = Class({
         *      $extend: MELON.PBPGN.View,
         *      // 기능1) events 속성을 통해 이벤트핸들러를 일괄 등록할 수 있다. ('이벤트명 selector': '핸들러함수명')
         *  events: {
         *      click ul>li.item': 'onItemClick',       // this.$el.on('click', 'ul>li.item', this.onItemClick.bind(this)); 를 자동 수행
         *      'mouseenter ul>li.item>a': 'onMouseEnter'   // this.$el.on('mouseenter', 'ul>li.item>a', this.onMouseEnter.bind(this)); 를 자동 수행
         *  },
         *  // 기능2) selectors 속성을 통해 지정한 selector에 해당하는 노드를 주어진 이름의 멤버변수에 자동으로 설정해 준다.
         *  selectors: {
         *      box: 'ul',          // this.$box = this.$el.find('ul') 를 자동수행
         *      items: 'ul>li.item',    // this.$items = this.$el.find('ul>li.item') 를 자동수행
         *      prevBtn: 'button.prev', // this.$prevBtn = this.$el.find('button.prev') 를 자동 수행
         *      nextBtn: 'button..next' // this.$nextBtn = this.$el.find('button.next') 를 자동 수행
         *  },
         *  initialize: function(el, options) {
         *  this.supr(el, options); // 기능4) this.$el, this.options가 자동으로 설정된다.
         *  },
         *  onItemClick: function(e) {
         *      ...
         *  },
         *  onMouseEnter: function(e) {
         *      ...
         *  }
         * });
         *
         * new MELON.PBPGN.Slider('#slider', {count: 10});
         */
        var View = Class(/** @lends MELON.PBPGN.View# */{
            $statics: {
                _instances: [] // 모든 인스턴스를 갖고 있는다..
            },
            /**
             * 생성자
             * @param {String|Element|jQuery} el 해당 엘리먼트(노드, id, jQuery 어떤 형식이든 상관없다)
             * @param {Object} options 옵션값
             * @return {Mixes} false 가 반환되면, 이미 해당 엘리먼트에 해당 모듈이 빌드되어 있거나 disabled 상태임을 의미한다.
             */
            initialize: function (el, options) {
                options || (options = {});

                var me = this,
                    eventPattern = /^([a-z]+) ?([^$]*)$/i,
                    moduleName;

                if (!me.name){
                    throw new Error('클래스의 이름이 없습니다');
                }

                moduleName = me.moduleName = me.name.replace(/^[A-Z]/, function(s) { return s.toLowerCase(); });
                me.$el = el instanceof jQuery ? el : $(el);
                // 강제로 리빌드 시킬 것인가
                if(options.rebuild === true) {
                    try { me.$el.data(moduleName).destroy(); } catch(e){}
                    me.$el.removeData(moduleName);
                } else {
                    // 이미 빌드된거면 false 반환
                    if (me.$el.data(moduleName) ) {
                        return false;
                    }
                }

                // disabled상태면 false 반환
                if (me.$el.hasClass('disabled') || me.$el.attr('data-readony') === 'true' || me.$el.attr('data-disabled') === 'true') {
                    return false;
                }

                View._instances.push(me);
                var superClass = me.constructor.superclass;

                me.el = me.$el[0];                                                  // 원래 엘리먼트도 변수에 설정
                me.options = $.extend({}, superClass.defaults, me.defaults, options);           // 옵션 병합
                me._uid = MELON.WEBSVC.getUniqKey();                    // 객체 고유 키
                me._eventNamespace = '.' + me.name + '_' + me._uid; // 객체 고유 이벤트 네임스페이스명
                me.subviews = {};                                                       // 하위 컨트롤를 관리하기 위함

                // selectors 속성 처리
                // selectors: {
                //  box: 'ul',          // => this.$box = this.$el.find('ul');
                //  items: 'ul>li.item'  // => this.$items = this.$el.find('ul>li.item');
                // }
                me.options.selectors = $.extend({},  execObject(superClass.selectors, me), execObject(me.selectors, me), execObject(me.options.selectors, me));
                $.each(me.options.selectors, function (key, value) {
                    if (typeof value === 'string') {
                        me['$' + key] = me.$el.find(value);
                    } else if (value instanceof jQuery) {
                        me['$' + key] = value;
                    } else {
                        me['$' + key] = $(value);
                    }
                });

                // events 속성 처리
                // events: {
                //  'click ul>li.item': 'onItemClick', //=> this.$el.on('click', 'ul>li.item', this.onItemClick); 으로 변환
                // }
                me.options.events = $.extend({}, execObject(me.events, me), execObject(me.options.events, me));
                $.each(me.options.events, function (key, value) {
                    if (!eventPattern.test(key)) { return false; }

                    var name = RegExp.$1,
                        selector = RegExp.$2,
                        args = [name],
                        func = isFn(value) ? value : (isFn(me[value]) ? me[value] : MELON.WEBSVC.emptyFn);

                    if (selector) { args[args.length] = $.trim(selector); }

                    args[args.length] = function () {
                        func.apply(me, arguments);
                    };

                    me.on.apply(me, args);
                });

                // options.on에 지정한 이벤트들을 클래스에 바인딩
                $.each(me.options.on || {}, function (key, value) {
                    me.on(key, value);
                });

                // on으로 시작하는 속성명을 클래스에 이벤트로 바인딩. : onClick => me.on('click', onClick);
                $.each(me.options, function (key, value) {
                    if (!isFn(value)) { return; }

                    var m = key.match(/^on([a-z]+)$/i);
                    if (m) {
                        me.on((m[1] + "").toLowerCase(), value);
                    }
                });

            },

            /**
             * 파괴자
             */
            destroy: function () {
                var me = this;

                me.$el.removeData(me.moduleName);
                me.$el.off();
                // me.subviews에 등록된 자식들의 파괴자 호출
                $.each(me.subviews, function(key, item) {
                    item.destroy && item.destroy();
                });
            },

            /**
             * 옵션 설정함수
             *
             * @param {String} name 옵션명
             * @param {Mixed} value 옵션값
             */
            setOption: function(name, value) {
                this.options[name] = value;
            },

            /**
             * 옵션값 반환함수
             *
             * @param {String} name 옵션명
             * @param {Mixed} def 옵션값이 없을 경우 기본값
             * @return {Mixed} 옵션값
             */
            getOption: function(name, def) {
                return (name in this.options && this.options[name]) || def;
            },

            /**
             * 인자수에 따라 옵션값을 설정하거나 반환해주는 함수
             *
             * @param {String} name 옵션명
             * @param {Mixed} value {Optional} 옵션값: 없을 경우 name에 해당하는 값을 반환
             * @return {Mixed}
             * @example
             * $('...').tabs('option', 'startIndex', 2);
             */
            option: function(name, value) {
                if (typeof value === 'undefined') {
                    return this.getOption(name);
                } else {
                    this.setOption(name, value);
                    this.on('optionchange', [name, value]);
                }
            },

            /**
             * 이벤트명에 현재 클래스 고유의 네임스페이스를 붙여서 반환 (ex: 'click mousedown' -> 'click.MyClassName mousedown.MyClassName')
             * @private
             * @param {String} eventNames 네임스페이스가 없는 이벤트명
             * @return {String} 네임스페이스가 붙어진 이벤트명
             */
            _generateEventNamespace: function(eventNames) {
                if (eventNames instanceof $.Event) {
                    return eventNames;
                }

                var me = this,
                    m = (eventNames || "").match( /^(\w+)\s*$/ );
                if(!m) {
                    return eventNames;
                }

                var name, tmp = [];
                for(var i = 1, len = m.length; i < len; i++) { name = m[i];
                    if (!name) { continue; }
                    if (name.indexOf('.') === -1) {
                        tmp[tmp.length] = name + me._eventNamespace;
                    } else {
                        tmp[tmp.length] = name;
                    }
                }
                return tmp.join(' ');
            },

            /**
             * 현재 클래스의 이벤트네임스페이스를 반환
             * @return {String} 이벤트 네임스페이스
             */
            getEventNamespace: function() {
                return this._eventNamespace;
            },

            offEvents: function(){
                this.$el.off(this.getEventNamespace());
            },

            /**
             * me.$el에 이벤트를 바인딩
             */
            on: function() {
                var args = [].slice.call(arguments);
                args[0] = this._generateEventNamespace(args[0]);

                this.$el.on.apply(this.$el, args);
                return this;
            },

            /**
             * me.$el에 등록된 이벤트를 언바인딩
             */
            off: function() {
                var args = [].slice.call(arguments);
                this.$el.off.apply(this.$el, args);
                return this;
            },

            /**
             * me.$el에 일회용 이벤트를 바인딩
             */
            one: function() {
                var args = [].slice.call(arguments);
                args[0] = this._generateEventNamespace(args[0]);

                this.$el.one.apply(this.$el, args);
                return this;
            },

            /**
             * me.$el에 등록된 이벤트를 실행
             */
            trigger: function() {
                var args = [].slice.call(arguments);
                this.$el.trigger.apply(this.$el, args);
                return this;
            },

            /**
             * me.$el에 등록된 이벤트 핸들러를 실행
             */
            triggerHandler: function() {
                var args = [].slice.call(arguments);
                this.$el.triggerHandler.apply(this.$el, args);
                return this;
            },

            /**
             * 해당 엘리먼트에 바인딩된 클래스 인스턴스를 반환
             * @return {Class}
             * @example
             * var tabs = $('div').Tabs('instance');
             */
            instance: function() {
                return this;
            },

            /**
             * 해당 클래스의 소속 엘리먼트를 반환
             * @return {jQuery}
             */
            getElement: function(){
                return this.$el;
            }
        });

        return View;
    });

    WEBSVC.define('PBPGN.Layout', function () {
        /**
         *
         * @class
         * @name MELON.PBPGN.Layout
         * @extends MELON.PBPGN.View
         */
        var Layout = Class({
            name: 'MelonLayout',
            $extend: MELON.PBPGN.View,
            $statics: /** @lends MELON.PBPGN.Layout*/ {
                /**
                 * 해상도 타입별 사이즈 정의<br>
                 * {<br>
                    small: [0, 1280],<br>
                    medium: [1281, 1360],<br>
                    large: [1361, 1000000]<br>
                 * }<br>
                 * @static
                 */
                SIZES: {
                    small: [0, 1280],
                    medium: [1281, 1360],
                    large: [1361, 1000000]
                },
                /**
                 * resizeEnd 이벤트명 : 리사이징이 끝났을 때 발생,<br>
                 * resize이벤트는 발생주기가 짧아, UI 재배치와 같은 로직이 있을 경우 상당한 reflow가 발생하는데,
                 * 리사이징 액션이 끝나는 시점을 체크하여 이때 비로소 UI적인 변화를 처리하게 하여
                 * reflow 발생을 최소화시키기 위해 만든 이벤트다.
                 * @static
                 */
                ON_RESIZE_END: 'resizeend',
                /**
                 * scrollEnd 이벤트명 : 스크롤링 도중 일정시간 동안 멈췄을 때 발생
                 * @static
                 */
                ON_SCROLL_END: 'scrollend',
                /**
                 * mediaQueryChange 이벤트명 : 미디어쿼리가 바뀌었을 때 발생
                 * @static
                 */
                ON_MEDIAQUERY_CHANGE: 'mediaquerychange'
            },
            /**
             * 싱글톤
             */
            $singleton: true,
            /**
             * 기본 옵션값
             * @property
             */
            defaults: {
                interval: 300
            },
            /**
             * 생성자
             * @param {String|Element|jQuery} el
             * @param {Object} options
             */
            initialize: function (el, options) {
                var me = this;

                // 부모 크래스 호출(필수)
                if(me.supr(el, options) === false) { return; }

                me._initLayout();

                $(function () {
                    me.trigger('resize');
                    me.trigger(Layout.ON_RESIZE_END);
                });
            },


            /**
             * 이벤트 바인딩 등 초기화 작업 수행
             *
             * @private
             */
            _initLayout: function () {
                var me = this,
                    resizeTimer, scrollTimer,
                    prevMediaType = me.getWidthType();

                me.$el.off('.melonLayout').on('resize.melonLayout', function (e) {

                    //me.trigger('resize');
                    var w = $win.innerWidth();

                    if (resizeTimer) {
                        clearTimeout(resizeTimer);
                    }

                    // trigger resizeEnd : 리사이징 도중에 잠시 interval동안 멈췄을 때 발생
                    resizeTimer = setTimeout(function () {
                        me.trigger(me.constructor.ON_RESIZE_END);
                    }, me.options.interval);

                    // trigger mediaQueryChange
                    $.each(Layout.SIZES, function (key, size) {
                        var type = me.getWidthType(w);
                        if (prevMediaType != type) {
                            me.trigger(me.constructor.ON_MEDIAQUERY_CHANGE, [type, prevMediaType]);

                            prevMediaType = type;
                            return false;
                        }
                    });

                }).on('scroll.melonLayout', function (e) {

                    if (scrollTimer) {
                        clearTimeout(scrollTimer);
                    }

                    scrollTimer = setTimeout(function () {
                        // trigger scrollEnd : 스크롤링 도중에 잠시 interval동안 멈췄을 때 발생
                        me.trigger(me.constructor.ON_SCROLL_END);
                    }, me.options.interval);

                });
            },

            /**
             * 현재 브라우저의 해상도가 지정된 type인지 체크
             * @param {String} type small, medium, large, xlarge
             * @return {Boolean}
             */
            is: function (type) {
                return this.getWidthType() === type;
            },

            /**
             * 현재 브라우저 해상도의 type를 반환(small, medium, large)
             * @param {Number} w {Optional} width값, 없으면 현재 window의 width로 계산
             * @return {String} (small, medium, large, xlarge)
             */
            getWidthType: function (w) {
                var me = this,
                    size = !! w ? false : me.getWinSize(),
                    w = w || size.width,
                    hasOwn = WEBSVC.hasOwn,
                    SIZES = Layout.SIZES;

                for (var name in SIZES) {
                    if (hasOwn(SIZES, name) && w > SIZES[name][0] && w <= SIZES[name][1]) {
                        return name;
                    }
                }
                return 'unknown';
            },

            /**
             * scrollTop값 반환
             * @return {Number}
             */
            getScrollTop: function () {
                return $win.scrollTop();
            },

            /**
             *  도큐먼트의 사이즈 반환
             * @return {Object} {width, height}
             */
            getDocSize: function () {
                return {
                    width: $doc.innerWidth(),
                    height: $doc.innerHeight()
                };
            },

            /**
             * 브라우저의 사이즈 반환
             * @return {Object} {width, height}
             */
            getWinSize: function () {
                return {
                    width: $win.innerWidth(),
                    height: $win.innerHeight()
                };
            }
        });

        return Layout;
    });


    WEBSVC.define('PBPGN.Modal', function() {
        var $doc = WEBSVC.$doc;
        /**
         * 모달 클래스<br />
         * // 옵션 <br />
         * options.overlay:true 오버레이를 깔것인가<br />
         * options.clone: true  복제해서 띄울 것인가<br />
         * options.closeByEscape: true  // esc키를 눌렀을 때 닫히게 할 것인가<br />
         * options.removeOnClose: false // 닫을 때 dom를 삭제할것인가<br />
         * options.draggable: true              // 드래그를 적용할 것인가<br />
         * options.dragHandle: 'h1.title'       // 드래그대상 요소<br />
         * options.show: true                   // 호출할 때 바로 표시할 것인가...
         * options.multiLayer: true             // 다중 레이어 호출 150415_add
         *
         * @class
         * @name MELON.PBPGN.Modal
         * @extends MELON.PBPGN.View
         * @example
         */
        var Modal = Class(/** @lends MELON.PBPGN.Modal# */{
                $extend: MELON.PBPGN.View,
                name: 'Modal',
                $statics: /** @lends MELON.PBPGN.Modal */{
                    /**
                     * 모달 생성시 발생되는 이벤트
                     * @static
                     */
                    ON_MODAL_CREATED: 'created',
                    /**
                     * 모달 표시 전에 발생되는 이벤트
                     * @static
                     */
                    ON_MODAL_SHOW:'modalshow',
                    /**
                     * 모달 표시 후에 발생되는 이벤트
                     * @static
                     */
                    ON_MODAL_SHOWN:'modalshown',    // 표시 후
                    /**
                     * 모달이 숨기기 전에 발생되는 이벤트
                     * @static
                     */
                    ON_MODAL_HIDE:'modalhide',          // 숨기기 전
                    /**
                     * 모달이 숨겨진 후에 발생되는 이벤트
                     * @static
                     */
                    ON_MODAL_HIDDEN: 'modalhidden'  // 숨긴 후
                },
                defaults: {
                    overlay: true,
                    overlayNotClose: false, // 140221 add
                    clone: true,
                    closeByEscape: true,
                    removeOnClose: false,
                    draggable: true,
                    dragHandle: 'h1.layer_title', // 140625 modal update
                    opener: '', //140616 update
                    show: true,
                    minWidth : 260, //140625 update
                    multiLayer : false //150415_add
                },

                events: {
                    'click button[data-role]': function (e) {
                        var me = this,
                            $btn = $(e.currentTarget),
                            role = ($btn.attr('data-role') || ''),
                            e;

                        if (role) {
                            me.trigger(e = $.Event(role), [me]);
                            if(e.isDefaultPrevented()){
                                return;
                            }
                        }

                        this.hide();
                    },
                    'click .d_close': function(e) {
                        e.preventDefault();
                        e.stopPropagation();

                        this.hide();
                    }
                },
                /**
                 * 생성자
                 * @constructors
                 * @param {String|Element|jQuery} el
                 * @param {Object} options
                 * @param {Boolean}  options.overlay:true 오버레이를 깔것인가
                 * @param {Boolean}  options.clone: true    복제해서 띄울 것인가
                 * @param {Boolean}  options.closeByEscape: true    // esc키를 눌렀을 때 닫히게 할 것인가
                 * @param {Boolean}  options.removeOnClose: false   // 닫을 때 dom를 삭제할것인가
                 * @param {Boolean}  options.draggable: true                // 드래그를 적용할 것인가
                 * @param {Boolean}  options.dragHandle: 'h1.title'     // 드래그대상 요소
                 * @param {Boolean}  options.show: true                 // 호출할 때 바로 표시할 것인가...
                 * @param {Boolean}  options.multiLayer: true           // 다중 레이어 호출 150415_add
                 */
                initialize: function(el, options) {
                    var me = this;
                    options = options || {};


                    if(me.supr(el, options) === false) {
                        return;
                    }
                    this.isIE7 = (WEBSVC.browser.isIE && WEBSVC.browser.version <= 7)?true:false;
                    this.isIE9 = (WEBSVC.browser.isIE && WEBSVC.browser.version <= 9)?true:false;



                    // 열릴때 body로 옮겼다가, 닫힐 때 다시 원복하기 위해 임시요소를 넣어놓는다.
                    me._createHolder();

                    me.isShown = false;
                    me._originalDisplay = me.$el.css('display');

                    if(me.options.remote) {
                        me.$el.load(me.options.remote).done(function(){
                            me.options.show && me.show();
                        });
                    } else {
                        me.options.show && me.show();
                    }

                    me.$el.on('mousewheel.modal', function(e) {
                        e.stopPropagation();
                    });

                    me.trigger('created');
                },

                /**
                 * zindex때문에 모달을 body바로 위로 옮긴 후에 띄우는데, 닫을 때 원래 위치로 복구시켜야 하므로,
                 * 원래 위치에 임시 홀더를 만들어 놓는다.
                 * @private
                 */
                _createHolder: function() {
                    var me = this;

                    if(me.$el.parent().is('body')){ return; }

                    me.$holder = $('<span class="d_modal_area" style="display:none;"></span>').insertAfter(me.$el);
                    me.$el.appendTo('body');
                },
                /**
                 * 원래 위치로 복구시키고 홀더는 제거
                 * @private
                 */
                _replaceHolder: function() {
                    var me = this;

                    if(me.$holder){
                        me.$el.insertBefore(me.$holder);
                        me.$holder.remove();
                    }
                },

                /**
                 * 토글
                 */
                toggle: function() {
                    var me = this;

                    me[ me.isShown ? 'hide' : 'show' ]();
                },

                /**
                 * 표시
                 */
                show: function() {
                    if(this.isShown && Modal.active === this) { return; }
                    /* 140605 modal add, 150112_update  */
                    if( $doc.height() > $(window).height()) {
                        /* 레이어가 이중으로 뜰 경우 */
                        if( $('body').hasClass('scroll_no') || $('html').css('overflow') =='hidden') {
                            $('body').addClass('dblLayer');
                        /* 맥 safari 일경우 */
                        } else if(MELON.WEBSVC.browser.isMac) {
                               $('body').addClass('scroll_no');
                        /* IE7 or 호환성모드일 경우  */
                        } else if(this.isIE7) {
                            $('html').css('overflow','hidden');
                            $('body').addClass('scroll_no').addClass('scroll_margin');
                        /* 일반 케이스  */
                        } else {
                            $('body').addClass('scroll_no').addClass('scroll_margin');
                        }
                    }
                    /* // 140605 modal add, 150112_update */

                    if(!this.$el.is('.d_like_alert')){
                        if (this.options.multiLayer == false) {Modal.close();};
                    }//150415_수정

                    Modal.active = this;

                    var me = this,
                        e = $.Event('modalshow');

                    me.$el.trigger(e);
                    if(me.isShown || e.isDefaultPrevented()) { return; }

                    me.isShown = true;

                    // me.layout(); 140605 modal del
                    me._escape();
                    me._overlay();
                    me._draggabled();
                    me._enforceFocus();

                    if(me.options.title) {
                        me.$el.find('h1.d_title').html(me.options.title || '알림');
                    }


                    me.$el.stop().addClass('d_modal_container')
                        .css({
                            'position':'absolute', // 140605 modal update
                            left: '50%',
                            top: '50%',
                            'min-width':(me.options.minWidth)+'px', // 140625 update
                            zIndex: 9900,
                            'background': '#fff',
                            outline: 'none',
                            backgroundClip: 'padding-box'
                        }).fadeIn('fast', function() {
                            me.$el.trigger('modalshown').focus();
                            // me.layout(); 140605 modal del
                        })
                        //140319_포토modal레이어에서 버튼을 찾지못하는 에러로인해 try처리
                        try{
                            /* 140616 update */
                            /*
                            150618_수정
                            if(me.$el.find('input[type=text]').length >0)
                                me.$el.find('input[type=text]')[0].focus();
                            else
                            //150618_수정 */
                                me.$el.find('button')[0].focus();
                            /* //140616 update */
                        }catch(e){
                            me.$el.find('button').eq(0).focus();
                        }

                    /* modal test */

                    /* 140605 modal update  */


                    if (me.$el.find('>div').hasClass('layer_popup')) {
                       me.modalW = me.$el.find('.layer_popup').outerWidth();
                       me.modalH = me.$el.find('.layer_popup').outerHeight();
                    } else {
                        /* 140625 update */
                        if(me.options.minWidth > me.$el.width())
                            me.modalW = me.options.minWidth
                        else
                            /* 150327_modify */
                            if (me.$el.hasClass('d_alert')) {
                                 me.modalW = me.$el.width() +10; //alert 창 사이즈 계산
                            }else {
                                me.modalW = me.$el.width();
                            };
                            /* //150327_modify */
                            me.modalH = me.$el.height();
                        /* // 140625 update */
                    }

                    function modalResize() {
                       if(me.modalW  <= $(window).width()){
                            me.$el.css({
                                'width':me.modalW, // 140625 update
                                'left':'50%',
                                'margin-left' : -Math.ceil(me.modalW /2)+'px'
                            });
                            if (me.modalH <= $(window).height()) {
                                me.$el.css({
                                    'top':'50%',
                                    'margin-top' :-( Math.ceil(me.modalH/2))+'px'
                                });
                            } else {
                                me.$el.css({
                                    'top':'0',
                                    'margin-top':'0'
                                });
                            }
                        } else  {
                            me.$el.css({
                                'left':'0',
                                'margin-left' :'0'
                            });
                            if (me.modalH <= $(window).height()) {
                                me.$el.css({
                                    'top':'50%',
                                    'margin-top' :-( Math.ceil(me.modalH/2))+'px'
                                });
                            }else {

                                me.$el.css({
                                    'top':'0',
                                    'margin-top':'0'
                                });
                            }
                        }
                        me.$el.find('.layer_popup').css({
                            'left':'0',
                            'margin-left' :'0',
                            'top':'0',
                            'margin-top' :0
                        });
                    };
                    /* // 140605 modal update  */

                    modalResize();
                    $(window).resize(function() {
                        modalResize();
                    });

                    /*
                    if (me.$el.height() > $(window).height()) {
                        me.$el.css('top',0);
                        me.$el.find('.layer_cntt').css({
                            'height': $(window).height() - 120,
                            'overflowY': 'scroll' ,
                            'overflowX': 'hidden' ,
                            'position': 'relative'
                        });
                        me.$el.addClass('d_scrolldiv');
                    }else {
                        me.$el.css('top','50%');
                        me.$el.removeClass('d_scrolldiv');
                    };
                    */
                   /* 140605 modal del */
                    // $doc.find('body').addClass('scroll_no'); // 140221 add
                    /* // 140605 modal del */
                    WEBSVC.PubSub.trigger('hide:modal');

                },

                /**
                 * 숨김
                 */
                hide: function(e) {
                    if(e) {
                        e.preventDefault();
                    }
                    /*  140605 modal update, 140613 modal, 140625 modal upadte, 150112_update */

                    /* 레이어가 이중으로 뜰 경우 */
                    if($('body').hasClass('dblLayer')) {
                        $('body').removeClass('dblLayer');
                    /* Mac safari 일경우  */
                    } else if(MELON.WEBSVC.browser.isMac) {
                        $('body').removeClass('scroll_no');
                    /* IE7 or 호환성모드 일경우  */
                    } else if(this.isIE7) {
                        $('html').css('overflow','auto');
                        $('body').removeClass('scroll_no').removeClass('scroll_margin');
                    /* 일반케이스  */
                    }else {
                        $('body').removeClass('scroll_no').removeClass('scroll_margin');
                    }
                    /* // 140605 modal update, 140613 modal, 140625 modal upadte, 150112_update */

                    var me = this;

                    e = $.Event('modalhide');
                    me.$el.trigger(e);
                    if(!me.isShown || e.isDefaultPrevented()) { return; }

                    $doc.off('focusin.modal');
                    me.$el.off('click.modal keyup.modal');

                    me.isShown = false;
                    me._escape();
                    me.hideModal();

                    me.$el.trigger('modalhidden');

                    Modal.active = null;
                },

                /**
                 * 뒷처리 담당
                 */
                hideModal: function() {
                    var me = this;
                    me.$el.hide().removeData(me.moduleName).removeClass('d_modal_container');
                    me.offEvents();
                    me._replaceHolder();

                    if(me.options.removeOnClose) {
                        me.$el.remove();
                    }
                    //140113추가
                    if(me.options.opener){
                        $(me.options.opener).focus();
                    }
                    //140113추가 end

                    if(me.$overlay) {
                        me.$overlay.hide().remove(), me.$overlay = null;
                    }
                },

                /**
                 * 도큐먼트의 가운데에 위치하도록 지정
                 */
                /* 140605 del by kiok
                layout: function(){
                    var me = this,
                        width = 0,
                        height = 0;

                    me.$el.css({'display': 'inline', 'position': 'fixed' });
                    width = me.$el.width();
                    height = me.$el.height();
                    me.$el.css({'display': ''});

                    //140409_수정
                    me.$el.css({
                        'width': width,
                        'marginLeft': Math.ceil(width / 2) * -1
                    });
                    //140409_추가
                    if (me.$el.height() < $(window).height()) {
                        me.$el.css('marginTop', Math.ceil(height / 2) * -1);
                    }else {
                        me.$el.css('marginTop', 0);
                    };
                },
                // 140605 del by kiok */

                /**
                 * 타이틀 영역을 드래그기능 빌드
                 * @private
                 */
                _draggabled: function(){
                    var me = this,
                        options = me.options;

                    if(!options.draggable || me.bindedDraggable) { return; }
                    me.bindedDraggable = true;

                    if (options.dragHandle) {
                        me.$el.find(options.dragHandle).css('cursor', 'move');
                        me.$el.draggable({
                            handle: options.dragHandle
                        });
                    } else {
                        me.$el.draggable('cancel');
                    }
                },

                /**
                 * 모달이 띄워진 상태에서 탭키를 누를 때, 모달안에서만 포커스가 움직이게
                 * @private
                 */
                _enforceFocus: function() {
                    var me = this;

                    $doc
                        .off('focusin.modal')
                        .on('focusin.modal', me.proxy(function(e) {
                            if(me.$el[0] !== e.target && !$.contains(me.$el[0], e.target)) {
                                me.$el.find(':focusable').first().focus();
                                e.stopPropagation();
                            }
                        }));
                },

                /**
                 * esc키를 누를 때 닫히도록
                 * @private
                 */
                _escape: function() {
                    var me = this;

                    if(me.isShown && me.options.closeByEscape) {
                        me.$el.off('keyup.modal').on('keyup.modal', me.proxy(function(e) {
                            e.which === 27 && me.hide();
                        }));
                    } else {
                        me.$el.off('keyup.modal');
                    }
                },

                /**
                 * 오버레이 생성
                 * @private
                 */
                _overlay: function() {
                    /* 150918 */
                    var me = this,
                        options = me.options;
                    if($('.d_modal_overlay').length > 0){
                        if (!options.multiLayer) {
                            return false;
                        };
                    }
                    /* //150918 */

                    /* 140613 modal update */
                    me.$el.wrap(
                        $('<div class="d_modal_overlay" />').css({
                        'opacity':'1',
                        'background': 'rgba(255,255,255,0.5)',
                        'position': 'fixed',
                        'top': 0,
                        'left': 0,
                        'right': 0,
                        'bottom': 0,
                        'zIndex': 9000,
                        'overflow':'auto'
                    }));
                    me.$overlay = me.$el.parents('.d_modal_overlay');//150415_modify
                    if(this.isIE9) me.$overlay.addClass('ie9');
                    /* // 140613 modal update */

                    if(me.options.overlayNotClose) {return false;} // 140221 add
                    me.$overlay.off('click.modal').on('click.modal', function(e) {
                        if(e.target != e.currentTarget) { return; }
                        me.$overlay.off('click.modal');
                        me.hide();
                    });
                },

                /**
                 * 모달의 사이즈가 변경되었을 때 가운데위치를 재조절
                 * @example
                 * $('...').modal(); // 모달을 띄운다.
                 * $('...').find('.content').html( '...');  // 모달내부의 컨텐츠를 변경
                 * $('...').modal('center');    // 컨텐츠의 변경으로 인해 사이즈가 변경되었으로, 사이즈에 따라 화면가운데로 강제 이동
                 */

                /* 140605 modal del */
                center: function(){
                    // this.layout();
                },
                /* // 140605 modal del */

                /**
                 * 닫기
                 */
                close: function() {
                    this.hide();
                },

                destroy: function() {
                    var me = this;

                    me.supr();
                    me.$el.off('.modal').removeClass('d_modal_container');
                    me.$overlay.add(me.$el).off('.modal').remove();
                    $doc.off('.modal');
                    $win.off('.melonModal');
                }
        });


        Modal.close = function (e) {
            if (!Modal.active) return;
            if (e) e.preventDefault();
            Modal.active.hide();
            Modal.active = null;
        };

        // 모달모듈이 한번이라도 호출되면, 이 부분이 실행됨, 모달모듈이 단 한번도 사용안하는 경우도 있는데,
        // 무조건 바인딩시켜놓는건 비효율적인 듯 해서 이와 같이 처리함
        Modal.onClassCreate = function() {

            WEBSVC.PubSub.on('hide:modal', function (e, force) {
                if (force === false) {
                    if(Modal.active){
                        Modal.close();
                    }
                }
            });

        };

        WEBSVC.bindjQuery(Modal, 'modal');

        WEBSVC.modal = function(el, options){
            $(el).modal(options);
        };

        return Modal;

    });


    WEBSVC.define('WEBSVC.alert', function () {
        var Modal = MELON.PBPGN.Modal;

        var tmpl = ['<div class="layer_popup d_alert small" style="display:none">',//150327_수정
                    '<h1 class="layer_title d_title">알림창</h1>', // 20140208 수정
                    '<div class="layer_cntt">', // 20140208 수정
                        '<div class="d_content">',
                        '</div>',
                        '<div class="wrap_btn_c">',
                            '<button type="button" class="btn_emphs_small" data-role="ok"><span class="odd_span"><span class="even_span">확인</span></span></button>',
                        '</div>',
                    '</div>',
                    '<button type="button" class="btn_close d_close"><span class="odd_span">닫기</span></button>',
                    '<span class="shadow"></span>',
                '</div>'].join('');
        /**
         * 얼럿레이어
         * @memberOf MELON.WEBSVC
         * @name alert
         * @function
         * @param {String} msg 얼럿 메세지
         * @param {JSON} options 모달 옵션
         * @example
         * MELON.WEBSVC.alert('안녕하세요');
         */
        return function (msg, options) {
            if(typeof msg !== 'string' && arguments.length === 0) {
                options = msg;
                msg = '';
            };
            var el = $(tmpl).appendTo('body').find('div.d_content').html(msg).end();
            var modal = new Modal(el, options);
            return modal.on('modalhidden', function(){
                el.remove();
            });
        };
    });
    //140227_추가 alert2레이어용 모듈 별도 생성
    WEBSVC.define('WEBSVC.alert2', function () {
        var AltModal = Class(/** @lends MELON.PBPGN.AltModal# */{
            $extend: MELON.PBPGN.View,
            name: 'AltModal',
            $statics: /** @lends MELON.PBPGN.Modal */{
                /**
                 * 모달 생성시 발생되는 이벤트
                 * @static
                 */
                ON_MODAL_CREATED: 'created',
                /**
                 * 모달 표시 전에 발생되는 이벤트
                 * @static
                 */
                ON_MODAL_SHOW:'modalshow',
                /**
                 * 모달 표시 후에 발생되는 이벤트
                 * @static
                 */
                ON_MODAL_SHOWN:'modalshown',    // 표시 후
                /**
                 * 모달이 숨기기 전에 발생되는 이벤트
                 * @static
                 */
                ON_MODAL_HIDE:'modalhide',          // 숨기기 전
                /**
                 * 모달이 숨겨진 후에 발생되는 이벤트
                 * @static
                 */
                ON_MODAL_HIDDEN: 'modalhidden'  // 숨긴 후
            },
            defaults: {
                overlay: true,
                overlayNotClose: false, // 140221 add
                closeByEscape: true,
                removeOnClose: false,
                draggable: true,
                show: true,
                opener: ''
            },

            events: {
                'click button[data-role]': function (e) {
                    var me = this,
                        $btn = $(e.currentTarget),
                        role = ($btn.attr('data-role') || ''),
                        e;

                    if (role) {
                        me.trigger(e = $.Event(role), [me]);
                        if(e.isDefaultPrevented()){
                            return;
                        }
                    }

                    this.hide();
                },
                'click .d_close': function(e) {
                    e.preventDefault();
                    e.stopPropagation();

                    this.hide();
                }
            },
            /**
             * 생성자
             * @constructors
             * @param {String|Element|jQuery} el
             * @param {Object} options
             * @param {Boolean}  options.overlay:true 오버레이를 깔것인가
             * @param {Boolean}  options.clone: true    복제해서 띄울 것인가
             * @param {Boolean}  options.closeByEscape: true    // esc키를 눌렀을 때 닫히게 할 것인가
             * @param {Boolean}  options.removeOnClose: false   // 닫을 때 dom를 삭제할것인가
             * @param {Boolean}  options.draggable: true                // 드래그를 적용할 것인가
             * @param {Boolean}  options.dragHandle: 'h1.title'     // 드래그대상 요소
             * @param {Boolean}  options.show: true                 // 호출할 때 바로 표시할 것인가...
             */
            initialize: function(el, options) {
                var me = this;
                options = options || {};

                /* 140616 update */
                this.isIE7 = (WEBSVC.browser.isIE && WEBSVC.browser.version <= 7)?true:false;
                this.isIE9 = (WEBSVC.browser.isIE && WEBSVC.browser.version <= 9)?true:false;
                /* //140616 update */


                if(me.supr(el, options) === false) {
                    return;
                }

                me.isShown = false;
                me._originalDisplay = me.$el.css('display');

                if(me.options.remote) {
                    me.$el.load(me.options.remote).done(function(){
                        me.options.show && me.show();
                    });
                } else {
                    me.options.show && me.show();
                }

                me.$el.on('mousewheel.modal', function(e) {
                    e.stopPropagation();
                });

                me.trigger('created');
            },

            /**
             * 토글
             */
            toggle: function() {
                var me = this;

                me[ me.isShown ? 'hide' : 'show' ]();
            },
            /**
             * 표시
             */
            mutex : null,
            show: function() {
                if(this.isShown && AltModal.active === this) { return; }

                AltModal.active = this;

                var me = this,
                    e = $.Event('modalshow');

                me.$el.trigger(e);
                if(me.isShown || e.isDefaultPrevented()) {return; }


                    me.layout();
                    me.isShown = true;
                    me.$el.trigger('modalshown').focus();
                    me.$el.find('button')[0].focus(); // 140221 update
                    me._overlay();

                    /* 140616 update, 140618 update, 150112_update */
                    if( $doc.height() > $(window).height()) {
                        /* 레이어가 이중으로 뜰 경우 */
                        if( $('body').hasClass('scroll_no') || $('html').css('overflow') =='hidden') {
                            $('body').addClass('dblLayer');
                        /* 맥 safari 일경우 */
                        } else if(MELON.WEBSVC.browser.isMac) {
                               $('body').addClass('scroll_no');
                        /* IE7 or 호환성모드일 경우  */
                        } else if(this.isIE7) {
                            $('html').css('overflow','hidden');
                            $('body').addClass('scroll_no').addClass('scroll_margin');
                        /* 일반 케이스  */
                        } else {
                            $('body').addClass('scroll_no').addClass('scroll_margin');
                        }
                    }
                    /* //140616 update, 140618 update, 150112_update  */

                setTimeout(function(){
                    me._escape();
                 },0);
                setTimeout(function(){
                    me._enforceFocus();
                },0);
                setTimeout(function(){
                    //140327_추가
                    me._modalOverap();
                    WEBSVC.PubSub.trigger('hide:modal');
                },0)
                return false;
            },

            /**
             * 숨김
             */
            hide: function(e) {
                if(e) {
                    e.preventDefault();
                }
                /* 140616 update, 140618 update, 150112_update */
                /* 레이어가 이중으로 뜰 경우 */
                if($('body').hasClass('dblLayer')) {
                    $('body').removeClass('dblLayer');
                /* Mac safari 일경우  */
                } else if(MELON.WEBSVC.browser.isMac) {
                    $('body').removeClass('scroll_no');
                /* IE7 or 호환성모드 일경우  */
                } else if(this.isIE7) {
                    $('html').css('overflow','auto');
                    $('body').removeClass('scroll_no').removeClass('scroll_margin');
                /* 일반케이스  */
                }else {
                    $('body').removeClass('scroll_no').removeClass('scroll_margin');
                }
                var me = this;
                e = $.Event('modalhide');
                me.$el.trigger(e);
                if(!me.isShown || e.isDefaultPrevented()) { return; }
                /* 140616 update, 140618 update, 150112_update */

                /* //140616 update */

                me._escape();
                me.hideModal();

                setTimeout(function(){
                    $doc.off('focusin.modal');
                    me.$el.off('click.modal keyup.modal');
                },0);
                setTimeout(function(){
                    me.isShown = false;
                    me.$el.trigger('modalhidden');
                },0);
                setTimeout(function(){


                    AltModal.active = null;
               },0);

            },

            /**
             * 뒷처리 담당
             */
            hideModal: function() {
                var me = this;
                me.$el.hide()

                me.options.opener.focus();

                if(me.$overlay) {
                    me.$overlay.remove(), me.$overlay = null;
                }
                setTimeout(function(){
                    me.$el.removeData(me.moduleName);
                },0);
                setTimeout(function(){
                    me.offEvents();
                },0);
                setTimeout(function(){
                    if(me.options.removeOnClose) {
                        me.$el.remove();
                    }
                    //140327_추가
                    me._modalOverap();
                },0);
            },

            /**
             * 도큐먼트의 가운데에 위치하도록 지정
             */
            layout: function(){
                var me = this,
                    width = 0,
                    height = 0;
                    me.$el.css({'display': 'inline', 'position': 'fixed' });
                    width = me.$el.width();
                    height = me.$el.height();
                    me.$el.css({'display': ''});
                    me.$el.css({
                        'width': width,
                        'marginTop': Math.ceil(height / 2) * -1,
                        'marginLeft': Math.ceil(width / 2) * -1
                    });

            },
            /**
             * 모달이 띄워진 상태에서 탭키를 누를 때, 모달안에서만 포커스가 움직이게
             * @private
             */
            _enforceFocus: function() {
                var me = this;

                $doc
                    .off('focusin.modal')
                    .on('focusin.modal', me.proxy(function(e) {
                        if(me.$el[0] !== e.target && !$.contains(me.$el[0], e.target)) {
                            me.$el.find(':focusable').first().focus();
                            e.stopPropagation();
                        }
                    }));
            },

            /**
             * esc키를 누를 때 닫히도록
             * @private
             */
            _escape: function() {
                var me = this;

                if(me.isShown && me.options.closeByEscape) {
                    me.$el.off('keyup.modal').on('keyup.modal', me.proxy(function(e) {
                        e.which === 27 && me.hide();
                    }));
                } else {
                    me.$el.off('keyup.modal');
                }
            },

            /**
             * 오버레이 생성
             * @private
             */
            _overlay: function() {
                var me = this;

                /* 140618 modal update */
                    if($('.d_modal_overlay').length > 0){
                        var overlaylen = $('d_modal_overlay').length;
                        me.$el.wrap($('<div class="d_modal_overlay" id="d_modal_overlay'+overlaylen+'"/>'));
                        me.$overlay = $('#d_modal_overlay'+overlaylen);

                    } else {
                        me.$el.wrap($('<div class="d_modal_overlay"/>'));
                        me.$overlay = $('.d_modal_overlay');
                    }

                    me.$overlay.css({
                        'opacity':'1',
                        'background': 'rgba(255,255,255,0.5)',
                        'position': 'fixed',
                        'top': 0,
                        'left': 0,
                        'right': 0,
                        'bottom': 0,
                        'zIndex': 9000,
                        'overflow':'auto'
                    });
                /* 140618 modal update */

                if(this.isIE9) me.$overlay.addClass('ie9');

                if(me.options.overlayNotClose) {return false;} // 140221 add
                setTimeout(function(){
                    me.$overlay.off('click.modal').on('click.modal', function(e) {
                        if(e.target != e.currentTarget) { return; }
                        me.$overlay.off('click.modal');
                        me.hide();
                    });
                },0)
            },
            //140327_추가
            _modalOverap: function(){
                var me = this,
                    options = me.options;

                if ((options.opener).parents('.d_layer').attr('role')) {
                    $(options.opener).parents('.d_layer').removeAttr('role');
                }else {
                    $(options.opener).parents('.d_layer').attr('role','dialog');
                };
            },
            center: function(){
                this.layout();
            },
            close: function() {
                this.remove();
            }
        });

        var tmpl = ['<div class="layer_popup d_alert no_title d_like_alert d_modal_container" style="display:none">',//150327_수정
                    '<div class="layer_cntt">', // 20140208 수정
                        '<div class="d_content box_default">',//140114_수정
                        '</div>',
                        '<div class="wrap_btn_c">',
                            '<button type="button" class="btn_emphs_small" data-role="ok"><span class="odd_span"><span class="even_span">확인</span></span></button>',
                        '</div>',
                    '</div>',
                    '<button type="button" class="btn_close d_close"><span class="odd_span">닫기</span></button>',
                    '<span class="shadow"></span>',
                '</div>'].join('');
        /**
         * 얼럿레이어
         * @memberOf MELON.WEBSVC
         * @name alert
         * @function
         * @param {String} msg 얼럿 메세지
         * @param {JSON} options 모달 옵션
         * @example
         * MELON.WEBSVC.alert('안녕하세요');
         */

        return function (msg, options) {

            if(typeof msg !== 'string' && arguments.length === 0) {
                options = msg;
                msg = '';
            };
            var el = $(tmpl).appendTo('body').find('div.d_content').html(msg).end();
            var modal = new AltModal(el, options);

            return el.on('modalhidden', function(){
                el.remove();
            });
        };
    });
    // ajaxModal
    WEBSVC.define('WEBSVC.ajaxModal', function() {
        /**
         * ajax 레이어
         * @memberOf MELON.WEBSVC
         * @name ajaxModal
         * @function
         * @param {String} url url
         * @param {JSON} options ajax options
         * @example
         * MELON.WEBSVC.ajaxModal('MP1.1.1.6T.2L_ajax.html');
         */
        return function(url, options) {
            var defer = $.Deferred();
            $.ajax($.extend({
                url: url
            }, options)).done(function(html) {
                defer.resolve();
                var $div = $(html.replace(/\n|\r/g, "")).appendTo('body');
                $div.modal().on('modalhidden', function(){
                    $div.remove();
                });
            }).fail(function(){
                defer.reject();
                WEBSVC.alert('죄송합니다.<br>알수 없는 이유로 작업이 중단되었습니다.', {title: '에러'});
            });
            return defer.promise();
        };
    });

    // confirm
    WEBSVC.define('WEBSVC.confirm', function () {
        var Modal = MELON.PBPGN.Modal,
            Confirm = Class({
                name: 'Confirm',
                $extend: Modal,
                defaults: $.extend({}, Modal.prototype.defaults, {
                    modal: true,
                    containerCss:{
                        backgroundColor: '#fffff'
                    }
                })
            });

        var tmpl = ['<div class="layer_popup small" style="display:none">',
                    '<h1 class="layer_title d_title">확인창</h1>', // 20140208 수정
                    '<div class="layer_cntt">', // 20140208 수정
                        '<div class="d_content">',
                        '</div>',
                        '<div class="wrap_btn_c">',
                            '<button type="button" class="btn_emphs_small" data-role="ok"><span class="odd_span"><span class="even_span">확인</span></span></button>&nbsp;',
                            '<button type="button" class="btn_emphs02_small d_close" data-role="cancel"><span class="odd_span"><span class="even_span">취소</span></span></button>',
                        '</div>',
                    '</div>',
                    '<button type="button" class="btn_close d_close"><span class="odd_span">닫기</span></button>',
                    '<span class="shadow"></span>',
                '</div>'].join('');
        /**
         * 컨펌레이어
         * @memberOf MELON.WEBSVC
         * @name confirm
         * @param {String} msg 컨펌 메세지
         * @param {JSON} options 모달 옵션
         * @example
         * MELON.WEBSVC.confirm('안녕하세요', {
         *      onOk: function() {},
         *      onCancel: function() {}
         *  });
         */
        return function (msg, options) {
            if(typeof msg !== 'string' && arguments.length === 0) {
                options = msg;
                msg = '';
            };
            var el = $(tmpl).appendTo('body').find('div.d_content').html(msg).end();
            var modal = new Modal(el, options);
            return modal.on('modalhidden', function(){
                el.remove();
            });
        };
    });

    // 140327_추가
    WEBSVC.define('WEBSVC.confirm2', function () {
        var Modal = MELON.PBPGN.Modal,
            Confirm = Class({
                name: 'Confirm2',
                $extend: Modal,
                defaults: $.extend({}, Modal.prototype.defaults, {
                    modal: true,
                    containerCss:{
                        backgroundColor: '#fffff'
                    }
                })
            });

        var tmpl = ['<div class="layer_popup no_title" style="display:none;">',
                    '<div class="layer_cntt">', // 20140208 수정
                        '<div class="bd_content box_default">',
                        '</div>',
                        '<div class="wrap_btn_c">',
                            '<button type="button" class="btn_emphs_small" data-role="ok"><span class="odd_span"><span class="even_span">확인</span></span></button>&nbsp;',
                            '<button type="button" class="btn_emphs02_small d_close" data-role="cancel"><span class="odd_span"><span class="even_span">취소</span></span></button>',
                        '</div>',
                    '</div>',
                    '<button type="button" class="btn_close d_close"><span class="odd_span">닫기</span></button>',
                    '<span class="shadow"></span>',
                '</div>'].join('');
        /**
         * 컨펌레이어
         * @memberOf MELON.WEBSVC
         * @name confirm
         * @param {String} msg 컨펌 메세지
         * @param {JSON} options 모달 옵션
         * @example
         * MELON.WEBSVC.confirm('안녕하세요', {
         *      onOk: function() {},
         *      onCancel: function() {}
         *  });
         */
        return function (msg, options) {
            if(typeof msg !== 'string' && arguments.length === 0) {
                options = msg;
                msg = '';
            };
            var el = $(tmpl).appendTo('body').find('.bd_content').html(msg).end();
            var modal = new Modal(el, options);
            return modal.on('modalhidden', function(){
                el.remove();
            });
        };
    });


    WEBSVC.define('PBPGN.Selectbox', function() {
        var $dropdown = $(),
            isIE7 = WEBSVC.browser.isIE && WEBSVC.browser.version <= 7;

        /**
         * 커스텀 셀렉트박스<br />
         * wrapClasses: ''<br />
         * disabledClass: 'disabled'<br />
         * bottomClass: 'bottomHover'<br />
         *
         * @class
         * @name MELON.PBPGN.Selectbox
         * @extends MELON.PBPGN.View
         */
        var Selectbox = Class(/** @lends MELON.PBPGN.Selectbox# */{
            name: 'Selectbox',
            $extend: MELON.PBPGN.View,
            $statics: {
                /**
                 * @static
                 */
                ON_CHANGED: 'changed'
            },
            /**
            * 옵션
            * @property {JSON}
            */
            defaults: {
                wrapClasses: '',
                disabledClass: 'disabled',
                bottomClass: 'bottomHover'
            },
            /**
             * 생성자
             * @param {jQuery|Node|String} el 대상 엘리먼트
             * @param {JSON} options {Optional} 옵션
             */
            initialize: function(el, options) {
                var me = this;
                if(me.supr(el, options) === false){ return; }

                me._create();
            },

            _create: function() {
                var me = this,
                    cls = me.$el.attr('data-class') || 'select_type01',
                    timer = null;

                // 리스트 표시
                function openList() {
                    $dropdown = me.$list.show();
                    me.$selectbox.triggerHandler('openlist');
                }

                // 리스트 숨김
                function closeList() {
                    me.$list.hide(), me.$selectbox.triggerHandler('closelist');
                }

                 /* 140321_추가 */
                //
                function placeholderReplace(index) {
                    if ($(me.$el[0].options[index]).attr('placeholder-replace')) {
                        var inputPlace = $(me.$selectbox.parent()).next('.input_text'),
                            selectPlace = $(me.$el[0].options[index]).attr('placeholder-replace');

                        inputPlace.attr('placeholder',selectPlace);
                        /* 140331_추가 */
                        inputPlace.placeholder('destroy');
                        inputPlace.placeholder('update');
                        /* //140331_추가 */
                    };
                }
                 /* //140321_추가 */

                 /* 140325_추가 */
                 function titleReplace(index) {
                    if ($(me.$el[0].options[index]).attr('title-replace')) {
                        var inputPlace = $(me.$selectbox.parent()).next('.input_text'),
                            selectTit = $(me.$el[0].options[index]).attr('title-replace');

                            inputPlace.attr('title',selectTit);
                    };
                }
                /* //140325_추가 */

                me.width = parseInt(me.$el.css('width'), 10);
                // 셀렉트박스
                me.$selectbox = $('<div class="'+cls+'"></div>').addClass(me.options.wrapClasses);
                // 레이블
                me.$label = $('<span class="select_box" tabindex="0" title="'+(me.$el.attr('title') || '셀렉트박스')+'"><span class="sel_r" style="width:190px;">&nbsp;</span></span>');

                /////// Label //////////////////////////////////////////////////////////////////////////////////////////
                me.$label.on('click', '.sel_r', function(e) {
                    e.preventDefault();
                    e.stopPropagation();

                    if(me.$list != $dropdown) {
                        // 이미 열려있는 다른 셀렉트박스의 리스트가 있으면 닫는다.
                        closeList();
                    }

                    if (!me.$label.hasClass(me.options.disabledClass)) {
                        // 현재 셀렉트박스가 열려있으면 닫고, 닫혀있으면 열어준다.
                        if(me.$label.hasClass('open')) {
                            closeList();
                        } else {
                            openList()
                        }
                    }
                });
                // 키보드에 의해서도 작동되도록 바인딩
                !WEBSVC.isTouch && me.$label.on('keydown', function(e){
                    if(e.keyCode === 13){
                        $(this).find('.sel_r').trigger('click');
                    } else if(e.keyCode === $.ui.keyCode.DOWN){
                        openList();
                        me.$list.find(':focusable:first').focus();
                    }
                });
                me.$label.find('.sel_r').css('width', me.width);
                /////////////////////////////////////////////////////////////////////////////////////////////////////

                /////// List /////////////////////////////////////////////////////////////////////////////////////////
                me.$list = $('<div class="select_open" style="position:absolute;" tabindex="0"></div>');
                me.$list.hide().on('click', function(e){
                        me.$list.focus();
                    }).on('click', 'li>a', function(e) {
                        // 아이템을 클릭했을 때
                        e.preventDefault();
                        e.stopPropagation();

                        me.selectedIndex($(this).parent().index());
                        closeList();
                        me.$label.focus();

                        /* 140321_추가 */
                        placeholderReplace(me.selectedIndex());
                         /* //140321_추가 */

                         /* 140325_추가 */
                        titleReplace(me.selectedIndex());
                         /* //140325_추가 */

                    }).on('mousedown', 'li>a', function() {
                        this.focus();
                    });

                    !WEBSVC.isTouch && me.$list.on('keydown', 'li a', function(e) {
                        // 키보드의 위/아래 키로 이동
                        var index = $(this).parent().index(),
                            items = me.$list.find('li'),
                            count = items.length;

                        switch(e.keyCode){
                        case $.ui.keyCode.UP:
                            e.stopPropagation();
                            e.preventDefault();
                            items.eq(Math.max(0, index - 1)).children().focus();
                            break;
                        case $.ui.keyCode.DOWN:
                            e.stopPropagation();
                            e.preventDefault();
                            items.eq(Math.min(count - 1, index + 1)).children().focus();
                            break;
                        }
                    });
                //////////////////////////////////////////////////////////////////////////////////////////////////////
                me.$selectbox.insertAfter(me.$el.hide());
                me.$selectbox.append(me.$label);
                me.$selectbox.append(me.$list);

                me.$selectbox.on('openlist closelist', function(e){
                    // 리스트가 열리거나 닫힐 때 zindex 처리
                    var zindexSelector = me.$el.attr('data-zindex-target'),
                        $zIndexTargets = zindexSelector ? me.$el.parents(zindexSelector) : false;

                    if(e.type === 'openlist') {
                        me.$label.addClass('open');
                        me.$el.closest('div.select_wrap').addClass('on');
                        $zIndexTargets&&$zIndexTargets.addClass('on');

                        WEBSVC.isTouch && $('body').on('touchend.selectbox', function(){
                            closeList();
                        });
                    } else {
                        me.$label.removeClass('open');
                        me.$el.closest('div.select_wrap').removeClass('on');
                        $zIndexTargets&&$zIndexTargets.removeClass('on');
                        clearTimeout(timer), timer = null;

                        WEBSVC.isTouch && $('body').off('touchend.selectbox');
                    }
                });

                // 비터치 기반일 때에 대한 이벤트 처리
                if( !WEBSVC.isTouch ) {
                    // 셀렉트박스에서 포커스가 벗어날 경우 자동으로 닫히게
                    me.$selectbox.on('focusin focusout', function(e) {
                        clearTimeout(timer), timer = null;
                        if(e.type === 'focusout' && me.$label.hasClass('open')) {
                            timer = setTimeout(function(){
                                closeList();
                            }, 100);
                        }
                    }).on('keydown', function(e) {
                        if(e.keyCode === $.ui.keyCode.ESCAPE) {
                            closeList();
                            me.$label.focus();
                        }
                    });
                } else {
                    me.$selectbox.on('touchend', function(e){ e.stopPropagation(); });
                }

                me.$el.on('change.selectbox', function(e) {
                    me.selectedIndex(this.selectedIndex, false);
                });

                me.$el.closest('form').on('reset', function() {
                    me.update();
                });

                //start: 20140208 : mhover
                me.$selectbox.mouseHover('.select_box, .select_open li');
                //end: 20140208 : mhover

                me.update();
            },

            /**
             * index에 해당하는 option항목을 선택
             *
             * @param {Number} index 선택하고자 하는 option의 인덱스
             * @param {Boolean} trigger change이벤트를 발생시킬 것인지 여부
             */
            selectedIndex: function(index, trigger) {
                if (arguments.length === 0) {
                    return this.$el[0].selectedIndex;
                }

                var me = this,
                    item = me.$el.find('option')
                        .prop('selected', false).removeAttr('selected')
                        .eq(index).prop('selected', true).attr('selected', 'selected');

                if (trigger !== false) {
                    me.$el.trigger('change', [index]);
                }

                me.$list.find('li').removeClass('on').eq(index).addClass('on');
                me.$label.children().text(item.text());
            },

            /**
             * value 에 해당하는 option항목을 선택, 인자가 없을땐 현재 선택되어진 value를 반환
             *
             * @param {String} index 선택하고자 하는 option의 인덱스
             * @param {Boolean} trigger change이벤트를 발생시킬 것인지 여부
             * @return {String}
             * @example
             * &lt;select id="sel">&lt;option value="1">1&lt;/option>&lt;option value="2">2&lt;/option>&lt;/select>
             *
             * $('#sel').selectbox('value', 2);
             * value = $('#sel').selectbox('value'); // = $('#sel')[0].value 와 동일
             */
            value: function(_value) {
                var me = this;

                if (arguments.length === 0) {
                    return me.$el[0].options[me.$el[0].selectedIndex].value;
                } else {
                    $.each(me.$el[0].options, function(i, item) {
                        if (item.value == _value) {
                            me.selectedIndex(i);
                            return false;
                        }
                    });
                }
            },
            /**
             * 동적으로 select의 항목들이 변경되었을 때, UI에 반영
             *
             * @example
             * &lt;select id="sel">&lt;option value="1">1&lt;/option>&lt;option value="2">2&lt;/option>&lt;/select>
             *
             * $('#sel')[0].options[2] = new Option(3, 3);
             * $('#sel')[0].options[3] = new Option(4, 4);
             * $('#sel').selectbox('update');
             */
            update: function() {
                var me = this,
                    html = '',
                    index = -1,
                    text = '';

                $.each(me.$el[0].options, function(i, item) {
                    if ($(item).prop('selected')) {
                        index = i;
                        text = item.text;
                    }
                    html += '<li><a href="#" data-value="' + item.value + '" data-text="' + item.text + '">' + item.text + '</a></li>';
                });
                me.$list.empty().html('<ul>'+html+'</ul>').find('li:eq(' + index + ')').addClass('on');
                me.$label.children().text(text);

                if (me.$el.prop(me.options.disabledClass)) {
                    me.$label.addClass(me.options.disabledClass).removeAttr('tabIndex');
                } else {
                    me.$label.removeClass(me.options.disabledClass).attr('tabIndex',0);
                }
            },

            /**
             * 소멸자
             */
            destroy: function() {
                var me = this;

                me.supr();
                me.$label.off().remove();
                me.$list.off().remove();
                me.$el.unwrap('<div></div>');
                me.$el.off('change.selectbox').show();
            }
        });

        // 셀렉트박스 모듈이 한번이라도 호출되면, 이 부분이 실행됨, 셀렉트박스 모듈이 단 한번도 사용안하는 경우도 있는데,
        // 무조건 바인딩시켜놓는건 비효율적인 듯 해서 이와 같이 처리함
        Selectbox.onClassCreate = function() {
            logger.log('Selectbox ready');

            WEBSVC.$doc.on('click.selectbox', function(e) {
                $dropdown.hide().trigger('closelist');
            });
        };

        WEBSVC.bindjQuery(Selectbox, 'selectbox');
        return Selectbox;
    });

    WEBSVC.define('PBPGN.Dropdown', function() {

        var $dropdown = $();

        /**
         * 드롭다운 레이어
         * @class
         * @name MELON.PBPGN.Dropdown
         * @extends MELON.PBPGN.View
         * @example
         * // dropdown 옵션들
         * &lt;button data-control="dropdown">드롭다운 보이기&lt;/button>
         * &lt;div class="d_notpos" data-zindex-target="div.wrap">...&lt;/div>
         * //1. d_notpos 클래스 : 강제 위치 재조절에서 제외시키는 옵션
         * //2. data-zindex-target 속성: ie7이하에서는 position:absolute인 노드가 overflow:hidden영역을 못벗어나는 문제가 있는데,
         * // 이때 특정부모 노드의 zindex값도 같이 올려주어야 하므로 이 속성에다 부모 노드의 selector를 지정해 주면 된다.(,를 구분자로 여러개 지정 가능)
         */
        var Dropdown = Class(/** @lends MELON.PBPGN.Dropdown# */{
            name: 'Dropdown',
            $extend: MELON.PBPGN.View,
            $statics: {
                ON_BEFORE_SHOW: 'beforeshow',   // $.fn.showLayer에서 발생
                ON_SHOW: 'show',        // $.fn.showLayer에서 발생
                ON_HIDE: 'hide'         // $.fn.hideLayer에서 발생
            },
            defaults: {
                dropdownTarget: ''
            },
            /**
             * 생성자
             * @param {jQuery|Node|String} el 대상 엘리먼트
             * @param {JSON} options {Optional} 옵션
             */
            initialize: function(el, options) {
                var me = this;

                if(me.supr(el, options) === false) { return; }

                me.$dropdown = me.$el.attr('data-dropdown-target') ? $( me.$el.attr('data-dropdown-target') ) : me.$el.next('div');
                me.$dropdown.addClass('d_layer').addClass('d_dropdown');

                me.$el.attr('aria-haspopup', 'true');
                me.on('mousedown keydown', me.toggle.bind(me));
                me.$el.add(me.$dropdown)
                    .on('keydown.dropdown', function(e) {
                        if (e.keyCode === $.ui.keyCode.ESCAPE) {

                            // 140402_추가 버튼에 클래스 삭제
                            if (me.$el.attr('data-class-on')) {
                                me.$el.removeClass(me.$el.attr('data-class-on'));
                            };

                            me.$dropdown.hideLayer({focusOpener: true});
                            return;
                        }
                    });

                me.$dropdown.on('click', '.d_close, .btn_close', function(e){
                    e.preventDefault();
                    e.stopPropagation();

                    // 140402_추가 버튼에 클래스 삭제
                    if (me.$el.attr('data-class-on')) {
                        me.$el.removeClass(me.$el.attr('data-class-on'));
                    };

                    me.$dropdown.hideLayer();
                }).on('click.dropdown', 'a', function(e) {
                    if(e.isDefaultPrevented()) { return; }

                    // 140327_추가 버튼에 클래스 삭제
                    if (me.$el.attr('data-class-on')) {
                        me.$el.removeClass(me.$el.attr('data-class-on'));
                    };

                    me.$dropdown.hideLayer();
                });
            },

            /**
             * 드롭다운 레이어를 띄울 때, $dropdown이 $el를 기준으로 가시영역 내에서 보이도록 위치를 재조절
             * @private
             * @param {jQuery} $el 드롭다운 버튼
             * @param {jQuery} $dropdown 드롭다운 레이어
             */
            _posInArea: function() {
                var $el = this.$el,
                    $dropdown = this.$dropdown,
                    $bullet = $dropdown.find('span[class^=bullet]'),
                    bulletClass = $dropdown.attr('data-ori-bullet') || $bullet.attr('class'),
                    hasBullet = $bullet.length > 0,
                    isNotPos = $dropdown.hasClass('d_notpos');

                if(isNotPos || !hasBullet) {
                    return;
                }

                var $con = (function($c){ return ($c.length === 0) ? WEBSVC.$win : $c; })($el.closest('div.d_scrolldiv')),
                    isIE7 = WEBSVC.browser.isIE7,
                    isWindow = !$con.hasClass('d_scrolldiv'),
                    isRelative = !isWindow && ($con.css('position') === 'relative'),
                    calcBullet = Number($bullet.css('display') !== 'none'),
                    css = {},
                    pos = $el.position(),
                    offset = $el.offset(),
                    conOffset = !isWindow ? $con.offset() : {left:0, top:0},
                    scrollPos = {top: $con.scrollTop(), left: $con.scrollLeft()},
                    conSize = {width: $con.width(), height: $con.height()},
                    dropSize = {width: $dropdown.outerWidth(), height: $dropdown.outerHeight()},
                    dropMargin = {left: parseInt($dropdown.css('marginLeft'), 10), top: parseInt($dropdown.css('marginTop'), 10)},
                    btnSize = {width: $el.outerWidth(), height: $el.outerHeight()},
                    bulletSize = hasBullet ? {width: $bullet.width(), height: $bullet.height()} : {width: 0, height:0},
                    btnPaddingTop = parseInt($el.css('paddingTop'), 10),
                    btnBorder = isIE7 ? {left:0, top:0} : {left: parseInt($el.css('borderLeftWidth'), 10)|0, top: parseInt($el.css('borderTopWidth'), 10)|0},
                    btnMargin = isIE7 ? {left:0, top: 0} : {left: parseInt($el.css('marginLeft'), 10), top: parseInt($el.css('marginTop'), 10)},
                    bulletTop = hasBullet ? 9 + Math.floor(bulletSize.height / 2) : 0, modalCon = false; //140519_포토상세 말풍선 관련 수정

                offset.top -= conOffset.top;
                offset.left -= conOffset.left;

                if(!isWindow && !isRelative) {
                    //140519_포토상세 말풍선 관련 수정
                    if(!$con.hasClass('d_modal_ajax')){
                        $con.css('position', 'relative');
                    }else{
                        modalCon = true;
                    }
                }
                $dropdown.css('marginTop', 0);

                /*logger.debug(
                    'pos.top:', pos.top, ', ',
                    'pos.left:', pos.left, ', ',
                    'offset.top:', offset.top, ', ',
                    'offset.left:', offset.left, ', ',
                    'scrollPos.top:', scrollPos.top, ', ',
                    'scrollPos.left:', scrollPos.left, ', ',
                    'dropMargin.top:', dropMargin.top,',',
                    'dropMargin.left:', dropMargin.left,',',
                    'conSize.width:', conSize.width, ', ',
                    'conSize.height:', conSize.height, ', ',
                    'dropSize.width:', dropSize.width, ', ',
                    'dropSize.height:', dropSize.height, ', ',
                    'btnSize.width:', btnSize.width, ', ',
                    'btnSize.height:', btnSize.height, ', ',
                    'bulletSize.width:', bulletSize.width, ', ',
                    'bulletSize.height:', bulletSize.height, ', ',
                    'btnPaddingTop:', btnPaddingTop, ',',
                    'btnBorder.top:', btnBorder.top, ', ',
                    'btnBorder.left:', btnBorder.left, ', ',
                    'btnMargin.top:', btnMargin.top, ', ',
                    'btnMargin.left:', btnMargin.left
                );/*/

                $bullet[0].className = bulletClass;
                /* 140403_수정 scroll이 존재할경우에 대한 처리 제거
                var D_scrollHeight = 0;
                */
                if(conSize.height + (scrollPos.top * Number(isWindow)) - 5 < offset.top + dropSize.height) {
                    if(bulletClass === 'bullet_vertical') {
                        if(isWindow) {
                            if((conSize.height + (scrollPos.top * Number(isWindow)) - 5) - offset.top < 13){//140319_윈도우창에 걸쳐진 더보기 버튼 클릭시
                                css.top = (scrollPos.top + conSize.height - dropSize.height - offset.top - 5) + 13;
                                hasBullet && $bullet.css('top', pos.top - css.top + btnPaddingTop);
                            }else{
                                css.top = scrollPos.top + conSize.height - dropSize.height - offset.top - 5;
                                hasBullet && $bullet.css('top', pos.top - css.top + btnPaddingTop);
                            }
                        } else {
                            if(modalCon){ //140519_포토상세 말풍선 관련 수정
                                css.top = btnSize.height - dropSize.height - 7 - btnPaddingTop; // 140403_수정 D_scrollHeight 관련 수정
                                if(offset.top - css.top + bulletSize.height > dropSize.height) { css.top += bulletSize.height; }
                                hasBullet && $bullet.css('top', dropSize.height - btnSize.height - 5 - btnPaddingTop);
                            }else{
                                css.top = conSize.height - dropSize.height - 5 - btnPaddingTop + dropMargin.top; // 140403_수정 D_scrollHeight 관련 수정
                                if(offset.top - css.top + bulletSize.height > dropSize.height) { css.top += bulletSize.height; }
                                hasBullet && $bullet.css('top', offset.top - css.top); // 140403_수정 D_scrollHeight 관련 수정
                            }
                        }
                    } else if(bulletClass === 'bullet_top') {
                        if(Math.abs(pos.top - dropSize.height - (9*calcBullet)) < offset.top - scrollPos.top) {
                            /* 140110 수정 */
                            /* 140320_수정 */
                            $(window).scrollTop(scrollPos.top+dropSize.height);
                            /* //140320_수정 */
                           // hasBullet && $bullet.attr('class', 'bullet_bottom').css({'top': '', 'bottom': -7});
                            //css.top = pos.top - dropSize.height - (9*calcBullet);
                            /* // 140110 수정 */
                            /* 140319 수정 */
                            hasBullet && $bullet.css({'bottom': '', 'top': -7});
                            css.top = pos.top + btnSize.height + (7*calcBullet);
                            /* //140319 수정 */
                        }
                    } else if(bulletClass === 'bullet'){
                        hasBullet && $bullet.attr('class', 'bullet_bottom').css({'top': '', 'bottom': -7, 'left': (dropSize.width / 2) - 6});
                        css.top = pos.top - dropSize.height - (9*calcBullet);
                    }
                } else {
                    if(bulletClass === 'bullet_vertical') {
                        hasBullet && $bullet.css('top', 7);//140110
                        css.top = pos.top + Math.floor(btnSize.height / 2) - bulletTop; // 140403_수정 D_scrollHeight 관련 수정
                    } else if(bulletClass === 'bullet_top') {
                        hasBullet && $bullet.css({'bottom': '', 'top': -7});
                        css.top = pos.top + btnSize.height + (7*calcBullet);
                    } else if(bulletClass === 'bullet') {
                        hasBullet && $bullet.css({'bottom': '', 'top': -7, 'left': '50%'});
                        css.top = pos.top + btnSize.height + (7*calcBullet);
                    }
                }
                /* 140124 kiok add */
                if(( $('#id_box .expn').is(':visible')&& conSize.width < 1280&& offset.left+btnSize.width + dropSize.width+5 >= parseInt((conSize.width/2)+504-208,10)) || ($('#id_box .expn').is(':visible') && conSize.width >= 1280 && offset.left > parseInt(conSize.width-211 - dropSize.width- btnSize.width - 8)) || (conSize.width + scrollPos.left < offset.left + btnSize.width + dropSize.width)) {
                    /* 140124 kiok add */
                    if(bulletClass === 'bullet_vertical') { //174
                        css.left = pos.left - dropSize.width - (9*calcBullet);
                        hasBullet && ($bullet[0].className = 'bullet_right');
                    } else if(bulletClass === 'bullet_top') {
                    } else if(bulletClass === 'bullet') {
                        css.left = pos.left - Math.ceil((dropSize.width - btnSize.width) / 2);
                    }

                } else {

                    if(bulletClass === 'bullet_vertical') {
                        css.left = pos.left + btnSize.width + (9*calcBullet);
                    } else if(bulletClass === 'bullet_top') {
                    } else if(bulletClass === 'bullet') {
                        css.left = pos.left - Math.ceil((dropSize.width - btnSize.width) / 2);
                    }
                }

                if(!isWindow) {
                    css.top += btnPaddingTop;
                    css.top +=  scrollPos.top;
                }
                css.left -= dropMargin.left;
                css.top += btnBorder.top;

                $dropdown.attr('data-ori-bullet', bulletClass).css(css);
            },

            /**
             * 토글(open &lt; - > close)
             * @param {$.Event} e 이벤트
             */
            toggle: function(e) {
                var me = this;
                if (e.type === 'keydown' && e.keyCode !== 13) { return; }
                e.stopPropagation();
                if(me.$dropdown.hasClass('d_open')) {
                    me.close();
                    //1404002_추가
                    me.$el.addClass('mactive');
                } else {
                    me.open();
                    //1404002_추가
                    me.$el.addClass('mactive');
                }
            },

            /**
             * 표시
             */
            open: function() {
                var me = this;
                if(me.$el.is('.disabled, :disabled')){ return; }
                if(me.$dropdown.hasClass('d_open')) { return; }

                me.$el.attr('aria-pressed', 'true');
                $dropdown.hideLayer();

                /* 140528_수정 */
                if (me.$el.parents().is('.d_scrolldiv')) {
                    if (me.$el.parents('.d_scrolldiv').height() < me.$dropdown.height()) {
                        me.$dropdown.find('.l_cntt').css({
                            'height' : me.$el.parents('.d_scrolldiv').height() - 30,
                            'overflow-y' : 'scroll'
                        });
                        me.$dropdown.mouseleave(function() {
                            me.close();
                            me.$el.addClass('mactive');
                        });
                        me.$dropdown.find('.btn_close').hide();
                    };
                };
                /* //140528_수정 */
                me._posInArea(me.$el, me.$dropdown);
                $dropdown = me.$dropdown.css({'zIndex': 9999}).showLayer({opener: me.$el});

                // 140402_추가 버튼에 클래스 추가
                if (me.$el.attr('data-class-on')) {
                    $('body').find('[data-class-on]').removeClass(me.$el.attr('data-class-on'));
                    me.$el.addClass(me.$el.attr('data-class-on'));
                };

            },

            /**
             * 숨김
             */
            close: function() {
                var me = this;
                me.$el.attr('aria-pressed', 'false');
                me.$dropdown.hideLayer();

                // 140327_추가 버튼에 클래스 삭제
                if (me.$el.attr('data-class-on')) {
                    me.$el.removeClass(me.$el.attr('data-class-on'));
                };
            },

            destroy: function() {
                var me = this;

                me.supr();
                me.$el.off('.dropdown');
                me.$dropdown.off('.dropdown');
            }
        });

        // 드롭다운 모듈이 한번이라도 호출되면, 이 부분이 실행됨, 드롭다운 모듈이 단 한번도 사용안하는 경우도 있는데,
        // 무조건 바인딩시켜놓는건 비효율적인 듯 해서 이와 같이 처리함
        Dropdown.onClassCreate = function() {
            logger.log('Dropdown ready');

            // ie7에서 드롭다운을 표시할 때 부모 엘리먼트의 zindex도 같이 올려주어야 한다.(data-zindex-target 속성에 부모엘리먼트를 지정)
            if (MELON.WEBSVC.browser.isIE7) {
                $doc.on('beforeshow.dropdown hide.dropdown', 'div.d_layer', function(e) {
                    var $this = $(this),
                        attrTarget = $this.attr('data-zindex-target'),
                        zIndexTarget = attrTarget || 'td, li',
                        $target;

                    zIndexTarget = zIndexTarget ? zIndexTarget.split(/\s*,\s*/) : [];
                    for(var i = 0, len = zIndexTarget.length; i < len; i++){
                        if(!zIndexTarget[i]){ continue; }

                        $target = $this.closest(zIndexTarget[i]);
                        if($target.length > 0) {
                            $target.toggleClass('on', e.type === 'beforeshow');
                            if(!attrTarget){ break; }   // 기본 셀렉터(td, li)일때에는 하나만 실행하기
                        }
                    }
                });
            }

            // 레이어 영역외에서 클릭할 때 닫히게 해준다.
            $doc.on('mousedown.dropdown keydown.dropdown', function(e) {

                if(e.type === 'keydown' && e.keyCode !== 13) {
                    return;
                }

                var $target = $(e.target),
                    $popup = $target.closest('div.d_open.d_layer');

                if ( $popup.length === 0 ){
                    $dropdown.not('[role=dialog]').hideLayer();
                }
                // 140402_추가 버튼에 클래스 삭제
                var dataClass = $('body').find('[data-class-on]');
                if (dataClass) {
                    dataClass.removeClass(dataClass.attr('data-class-on'));
                };
                e.stopPropagation();
            });

            //
            WEBSVC.PubSub.on('hide:modal', function() {
                $dropdown.not('[role=dialog]').hideLayer();
            });
        };

        WEBSVC.bindjQuery(Dropdown, 'dropdown');
        return Dropdown;
    });

    WEBSVC.define('PBPGN.Tooltip', function() {

        /**
         * 툴팁 레이어
         * @class
         * @name MELON.PBPGN.Tooltip
         * @extends MELON.PBPGN.View
         */
        var Tooltip = Class({
            name: 'Tooltip',
            $extend: MELON.PBPGN.View,
            defaults: {
                interval: 300
            },

            /**
             * 생성자
             * @param {jQuery|Node|String} el 대상 엘리먼트
             * @param {JSON} options {Optional} 옵션
             */
            initialize: function(el, options) {
                var me = this;

                if(me.supr(el, options) === false) { return; }

                me.$tooltip = (me.$el.attr('data-tooltip-target') ? $(me.$el.attr('data-tooltip-target')) : me.$el.next('div'));
                me.isShown = false;
                me.timer = null;

                // 마우스가 버튼위에서 .3초이상 머물었을 때만 툴팁이 표시되며,
                // 마우스가 버튼과 툴팁박스를 완전히 벗어나서 .3초가 지났을 때만 툴팁이 사라지도록 처리
                // 마우스가 닿을 때마다 보였다안보였다하는 건 너무 난잡해 보여서...
                me.on('focusin mouseenter', me.open.bind(me)).on('mouseleave focusout', me.close.bind(me));

                me.$tooltip.on('focusin.tooltip mouseenter.tooltip', function() {
                    if(me.$tooltip.data('timer')) {
                        clearTimeout(me.$tooltip.data('timer')), me.$tooltip.removeData('timer');
                    }
                }).on('focusout.tooltip mouseleave.tooltip', function() {
                    me.isShown && me.$tooltip.data('timer', setTimeout(function(){
                        me.isShown = false, me.$tooltip.hide();
                        if(me.$tooltip.data('timer')) {
                            clearTimeout(me.$tooltip.data('timer')), me.$tooltip.removeData('timer');
                        }
                    }, me.options.interval));
                });
            },
            /**
             * 표시
             */
            open: function() {
                var me = this,
                    offset = me.$el.offset();

                offset.top += me.$el.height();

                me.timer = setTimeout(function() {
                    me.$tooltip/*.css(offset)*/.fadeIn('fast');
                    me.isShown = true;
                }, me.options.interval);
            },
            /**
             * 숨김
             */
            close: function() {
                var me = this;

                if (me.isShown) {
                    me.$tooltip.data('timer', setTimeout(function(){
                        me.isShown = false;
                        me.$tooltip.hide();
                    }, me.options.interval));
                } else {
                    clearTimeout(me.timer), me.timer = null;
                }
            },
            /**
             * 소멸자
             */
            destroy: function() {
                var me = this;

                me.supr();
                me.$tooltip.off('.tooltip').removeData('timer');
            }
        });

        WEBSVC.bindjQuery(Tooltip, 'tooltip');
        return Tooltip;
    });

    WEBSVC.define('PBPGN.Expander', function() {

        /**
         * 확장기능 클래스
         * @class
         * @name MELON.PBPGN.Expander
         * @extends MELON.PBPGN.View
         *
         * @example
         * // 지원속성: data-expand-target="#해당요소의 id" // 확장 요소
         */
        var Expander = Class(/** @lends MELON.PBPGN.Expander# */{
            name: 'Expander',
            $extend: MELON.PBPGN.View,
            $statics: {
                ON_COLLAPSE: 'collapse',        // 확장될 때 발생
                ON_EXPAND: 'expand'             // 축소될 때 발생
            },
            defaults: {
                interval: 300
            },
            /**
             * 생성자
             * @param {jQuery|Node|String} el 대상 엘리먼트
             * @param {JSON} options {Optional} 옵션
             */
            initialize: function(el, options) {
                var me = this,
                    $target;

                if(me.supr(el, options) === false) { return; }
                if(me.$el.hasClass('disabled')) { return; }

                $target = me.$target = me.$el.attr('data-expand-target') ? $(me.$el.attr('data-expand-target')) : me.$el.next('.d_expand');
                if ($target.size() === 0) {
                    return;
                }

                me.on('click', function(e) {
                    e.preventDefault();
                    var $this = $(this),
                        evt,
                        isExpand = $this.hasClass('on');

                    evt = $.Event(isExpand ? 'collapse' : 'expand');
                    me.trigger(evt);
                    if(evt.isDefaultPrevented()) {
                        return;
                    }

                    $this.toggleClass('on', !isExpand);
                    $target.toggle(isExpand);
                });
            },

            /**
             * 토글
             */
            toggle: function() {
                this.trigger('click');
            },

            destroy: function() {
                var me = this;

                me.supr();
            }
        });

        WEBSVC.bindjQuery(Expander, 'expander');

        return Expander;
    });

    WEBSVC.define('PBPGN.Exposer', function() {
        // 펼침기능 베이스클래스
        var BaseExpose = Class({
            initialize: function(el, options) {
                var me = this;

                me.$el = $(el);
                me.options = $.extend({}, me.defaults, me.$el.data(), options);
                me.init();
                me._init();
            },
            _init: function(){
                var me = this;
                me.$el.on('click.expose', function(e) {
                    e.preventDefault();
                    e.stopPropagation();

                    me.toggle();
                });
            },

            init: function() {},

            expose: function() {
            },

            unexpose: function() {
            },

            destroy: function() {
                var me = this;

                me.supr();
                me.$el.off('.expose');
            }
        });

        // show/hide 조절방식의 expose
        var DisplayExpose = Class({
            $extend: BaseExpose,
            /* 140707_수정 */
            defaults: {
                moreClass: 'more',
                exposeClass: 'on',
                downClass: 'arrow_d',
                upClass: 'arrow_u'
            },
            /* //140707_수정 */
            init: function() {
                var me = this;
                me.$target = me.$el.attr('data-expose-target') ? $( me.$el.attr('data-expose-target') ) : me.$el.siblings('div.text');
            },

            toggle: function() {
                var me = this,
                    evt,
                    isExpose = me.$target.hasClass(me.options.exposeClass);//140520_수정

                evt = $.Event(isExpose ? 'expose' : 'unexpose');
                me.$el.trigger(evt, [me.$target[0]]);
                if(evt.isDefaultPrevented()){
                    return;
                }

                if(!isExpose){//140520_수정
                    me.expose();
                } else {
                    me.unexpose();
                }
            },

            expose: function() {
                var me = this;
                me.$target.addClass(me.options.exposeClass);
                me.$target.attr('tabindex', 0).focus();
                me.$el.find('span').text('접기');//140520_추가
                me.$el.replaceClass(me.options.downClass, me.options.upClass);//140707_추가
            },

            unexpose: function() {
                var me = this;
                me.$target.removeClass(me.options.exposeClass);
                me.$target.find('button.more').focus();
                me.$el.find('span').text('펼치기');//140520_추가
                me.$el.replaceClass(me.options.upClass, me.options.downClass);//140707_추가
            }
        });

        // height 조절방식의 expose
        var HeightExpose = Class({
            $extend: BaseExpose,
            defaults: {
                exposeClass: 'ws_normal',
                downClass: 'arrow_d',
                upClass: 'arrow_u'
            },
            init: function() {

                var me = this;
                me.$target = me.$el.attr('data-expose-target') ? $( me.$el.attr('data-expose-target') ) : me.$el.closest('.d_expose');
                me.$el.hasClass(me.options.downClass) && me.$target.data('old_height', parseInt(me.$target.css('height'), 10));
            },

            toggle: function() {
                var me = this,
                    evt,
                    isExpose = me.$el.hasClass(me.options.downClass);

                evt = $.Event(isExpose ? 'expose' : 'unexpose');
                me.$el.trigger(evt, [me.$target[0]]);
                if(evt.isDefaultPrevented()){
                    return;
                }

                if(isExpose){
                    me.expose();
                } else {
                    me.unexpose();
                }
            },

            expose: function() {
                var me = this;
                me.$target.css('height', 'auto');
                me.$target.addClass(me.options.exposeClass);
                me.$el.replaceClass(me.options.downClass, me.options.upClass).html('<span class="text">접기</span> <span class="icon"></span>').attr('title', function(){
                    return this.title.replace('더보기', '접기');
                });
            },

            unexpose: function(isExpose) {
                var me = this;
                me.$target.css('height', me.$target.data('old_height'));
                me.$target.removeClass(me.options.exposeClass);
                me.$el.replaceClass(me.options.upClass, me.options.downClass).html('<span class="text">더보기</span> <span class="icon"></span>').attr('title', function(){
                    return this.title.replace('접기', '더보기');
                });
            }
        });

        /**
         * 펼침기능 클래스
         * @class
         * @name MELON.PBPGN.Exposer
         * @extends MELON.PBPGN.View
         *
         * @example
         * data-expose-type="height/display", data-expose-target="#id"
         */
        var Exposer = Class(/** @lends MELON.PBPGN.Exposer# */{
            name: 'Exposer',
            $statics: {
                ON_EXPOSE: 'expose',
                ON_UNEXPOSE: 'unexpose'
            },
            /**
             * 생성자
             * @param {jQuery|Node|String} el 대상 엘리먼트
             * @param {JSON} options {Optional} 옵션
             */
            initialize: function(el, options) {
                options || (options = {});

                var me = this,
                    exposeType = $(el).attr('data-expose-type') || options.exposeType || 'height';

                if(exposeType === 'height') {
                    me.exposer = new HeightExpose(el, options);
                } else {
                    me.exposer = new DisplayExpose(el, options);
                }
            },

            /**
             * 토글(expose or unexpose)
             */
            toggle: function() {
                this.exposer.toggle();
            },

            /**
             * 펼치기
             */
            expose: function() {
                this.exposer.expose();
            },

            /**
             * 닫기
             */
            unexpose: function() {
                this.exposer.unexpose();
            },

            /**
             * 소멸자
             */
            destroy: function() {
                var me = this;

                me.exposer.destroy();
            }
        });

        WEBSVC.bindjQuery(Exposer, 'exposer');

        return Exposer;
    });


    WEBSVC.define('PBPGN.Placeholder', function () {
        /**
         * placeholder를 지원하지 않는 IE7~8상에서 placeholder효과를 처리하는 클래스
         * @class
         * @name MELON.PBPGN.Placeholder
         * @extends MELON.PBPGN.View
         * @example
         * new MELON.WEBSVC.Placeholder( $('input[placeholder]'), {});
         * // 혹은 jquery 플러그인 방식으로도 호출 가능
         * $('input[placeholder]').placeholder({});
         */
        var Placeholder = Class(/** @lends MELON.PBPGN.Placeholder# */{
            name: 'Placeholder',
            $extend: MELON.PBPGN.View,
            defaults: {
                foreColor: ''
            },
            /**
             * 생성자
             * @param {String|Element|jQuery} el 해당 엘리먼트(노드, id, jQuery 어떤 형식이든 상관없다)
             * @param {Object} options 옵션값
             */
            initialize: function (el, options) {
                var me = this,
                    is = 'placeholder' in MELON.WEBSVC.tmpInput;

                if ( is ) { return; }

                if(me.supr(el, options) === false) { return; }
                me.placeholder = me.$el.attr('placeholder');
                me._foreColor = me.options.foreColor;

                var isPassword = me.$el.attr('type') === 'password';

                me.on('focusin click', function () {
                    if ($.trim(this.value) === me.placeholder || !$.trim(this.value)) {
                        me.$el.removeClass(me._foreColor);
                        if(isPassword) {
                            me.$el.removeClass('placeholder');
                        }
                        this.value = '';
                    }
                }).on('focusout', function () {
                    if (this.value === '' || this.value === me.placeholder) {
                        if(isPassword) {
                            me.$el.val('').addClass('placeholder');
                        } else {
                            me.$el.val(me.placeholder).addClass(me._foreColor);
                        }
                    }
                }).triggerHandler('focusout');
            },

            /**
             * placeholder 갱신(only ie9 이하)
             */
            update: function(){
                var me = this;
                me.$el.val(me.placeholder);
            },

            /**
             * 파괴자 : 자동으로 호출되지 않으므로, 필요할 때는 직접 호출해주어야 한다.
             */
            destroy: function () {
                var me = this;


                me.$el.removeData();
                me.supr();
            }
        });

        // 플레이스홀더 모듈이 한번이라도 호출되면, 이 부분이 실행됨, 플레이스홀더 모듈이 단 한번도 사용안하는 경우도 있는데,
        // 무조건 바인딩시켜놓는건 비효율적인 듯 해서 이와 같이 처리함
        Placeholder.onClassCreate = function() {
            logger.log('Placeholder ready');

            if(!('placeholder' in MELON.WEBSVC.tmpInput)) {
                $doc.on('submit.placeholder', 'form', function(e) {
                    $('input[placeholder], textarea[placeholder]').each(function() {
                        if ($(this).attr('placeholder') === this.value) {
                            $(this).removeClass(Placeholder.prototype.defaults.foreColor);
                            this.value = '';
                        }
                    });
                });
            }

        };

        MELON.WEBSVC.bindjQuery(Placeholder, 'placeholder');
        return Placeholder;
    });

    WEBSVC.define('PBPGN.TextCounter', function() {
        var browser = WEBSVC.browser,
            byteLength = WEBSVC.string.byteLength,
            charsByByte = WEBSVC.string.charsByByte;

        /**
         * 입력제한 기능을 담당하는 클래스
         * @class
         * @name MELON.PBPGN.TextCounter
         * @extends MELON.PBPGN.View
         * @example
         * new MELON.WEBSVC.TextCounter( $('input.d_textcounter'), {});
         * // 혹은 jquery 플러그인 방식으로도 호출 가능
         * $('input.d_textcounter').textcounter({});
         */
        var TextCounter = Class(/** @lends MELON.PBPGN.TextCounter# */{
            name: 'TextCounter',
            $extend: MELON.PBPGN.View,
            $statics: {
                ON_TEXTCOUNT_CHANGE: 'textcounterchange' // 글자수가 변경되었을 때 발생
            },
            defaults: {
                countType: 'byte',
                limit: 100 // 최대 글자 수(바이트)
            },

            /**
             * 생성자
             * @param {String|Element|jQuery} el 해당 엘리먼트(노드, id, jQuery 어떤 형식이든 상관없다)
             * @param {Object} options 옵션값
             */
            initialize: function(el, options) {
                this.supr(el, options);

                var me = this;

                me.currentLength = 0;
                me.placeholder = 'placeholder' in WEBSVC.tmpInput ? '' : me.$el.attr('placeholder');

                if (MELON.WEBSVC.browser.isGecko) {
                    me._forceKeyup();
                }

                me.on('keydown keyup cut paste blur', function(e) {
                    var isOver = me._checkLimit();

                    if (e.type === 'keyup') {
                        if (isOver) {
                            me._truncateValue();//140522_추가
                            alert('입력하신 글자 수가 초과되었습니다.');
                            this.focus();
                        }
                    }
                    me.trigger('textcounterchange', [me.currentLength]);
                });
                me._checkLimit();
                me.trigger('textcounterchange', [me.currentLength]);
            },

            /**
             * str의 길이 계산(options.countType이 char일 땐, 글자수, byte일땐 바이트수로 계산)
             */
            textLength: function(str) {
                var me = this;

                if(me.options.countType === 'byte') {
                    return byteLength(str);
                }
                return (str||'').length;
            },

            /**
            */
            _checkLimit: function() {
                var me = this,
                    o = me.options,
                    isOver = false;

                me.currentLength = me.textLength(me.$el[0].value);
                if (me.currentLength > o.limit) {
                    //me._truncateValue(); 140521_삭제
                    isOver = true;
                }
                return isOver;
            },

            /**
             * 텍스트박스의 문자열이 제한길이를 초과했을 경우, 자르는 역할을 담당
             * @private
             */
            _truncateValue: function() {
                var me = this,
                    $el = me.$el,
                    value = browser.isOldIE && $el[0].value === me.placeholder ? '' : $el[0].value,
                    limit = me.options.limit,
                    chars = 0;

                if (limit === 0) {
                    $el[0].value = me.placeholder;
                    me.currentLength = limit;
                } else if(limit < me.currentLength) {
                    chars = (me.options.countType === 'byte' ? charsByByte(value, limit) : limit);
                    $el[0].blur();
                    $el[0].value = value.substring(0, chars);
                    $el[0].focus();
                    me.currentLength = limit;
                }
            },

            /**
             * 파이어폭스에서 한글을 입력할 경우, keyup이벤트가 발생하지 않는 버그가 있어서,
             * timeout를 이용하여 value값이 변경됐을 때 강제로 keyup를 이벤트 날려주는 로직을 설정하는 함수
             * @private
             */
            _forceKeyup: function() {
                // 파이어폭스에서 한글을 입력할 때 keyup이벤트가 발생하지 않는 버그가 있어서
                // 타이머로 value값이 변경된걸 체크해서 강제로 keyup 이벤트를 발생시켜 주어야 한다.
                var me = this,
                    $el = me.$el,
                    el = $el[0],
                    prevValue,
                    win = window,
                    doc = document,

                    // keyup 이벤트 발생함수: 크로스브라우징 처리
                    fireEvent = (function(){
                        if (doc.createEvent) {
                            // anti ie
                            return function(){
                                var e;
                                if (win.KeyEvent) {
                                    e = doc.createEvent('KeyEvents');
                                    e.initKeyEvent('keyup', true, true, win, false, false, false, false, 65, 0);
                                } else {
                                    e = doc.createEvent('UIEvents');
                                    e.initUIEvent('keyup', true, true, win, 1);
                                    e.keyCode = 65;
                                }
                                el.dispatchEvent(e);
                            };
                        } else {
                            // ie: :(
                            return function() {
                                var e = doc.createEventObject();
                                e.keyCode = 65;
                                el.fireEvent('onkeyup', e);
                            };
                        }
                    })();

                me.timer = null;

                me.on('focus', function(){
                    if (me.timer){ return; }
                    me.timer = setInterval(function() {
                        if (prevValue !== el.value) {
                            prevValue = el.value;
                            fireEvent();
                        }
                    }, 60);
                }).on('blur', function(){
                    if (me.timer){
                        clearInterval(me.timer);
                        me.timer = null;
                    }
                });
            },

            /**
             * 파괴자 : 자동으로 호출되지 않으므로, 필요할 땐 직접 호출해주어야 한다.
             */
            destroy: function() {
                var me = this;

                me.timer && clearInterval(me.timer);
                me.supr();
            }
        });

        MELON.WEBSVC.bindjQuery(TextCounter, 'textCounter');
        return TextCounter;
    });

    WEBSVC.define('PBPGN.TextControl', function () {
        /**
         * textarea, input에서 글자수 체크 및 자동리사이징 처리를 담당하는 클래스
         * @class
         * @name MELON.PBPGN.TextControl
         * @extends MELON.PBPGN.View
         * @example
         * new MELON.PBPGN.TextControl( $('textarea'), {counting: true});
         * // or
         * $('textarea').textControl({counting: true});
         */
        var TextControl = Class(/** @lends MELON.PBPGN.TextControl# */{
            name: 'TextControl',
            $extend: MELON.PBPGN.View,
            $statics: {
                ON_INIT: 'init',
                ON_CHANGE: 'textcontrolchange'
            },
            defaults: {
                counting: false,
                limit: 100,
                limitTarget: '',
                autoResize: false,
                allowPaste: false
            },
            /**
             * 생성자
             * @param {String|Element|jQuery} el 해당 엘리먼트(노드, id, jQuery 어떤 형식이든 상관없다)
             * @param {Object} options 옵션값
             */
            initialize: function (el, options) {
                var me = this;

                if(me.supr(el, options) === false) { return; }

                me._initTextControl();
                me.trigger(TextControl.ON_INIT);
            },

            /**
             * 초기화 작업
             * @private
             */
            _initTextControl: function () {
                var me = this,
                    o = me.options;

                // 붙여넣기
                if (!o.allowPaste) {
                    me.on('paste', function (e) {
                        e.preventDefault();
                        alert("죄송합니다. \n도배글 등을 방지하기 위해 붙여넣기를 하실 수 없습니다.");
                    });
                }

                // 자동 리사이징
                if (me.$el.is('textarea') && o.autoResize) {
                    me._autoResize();
                }

                // 입력글자 수 체크
                if (o.counting) {
                    // subviews에다 설정하면 destroy가 호출될 때, subviews에 들어있는 컨트롤들의 destroy도 알아서 호출해준다.
                    me.textCounter = me.subviews.counter = new MELON.PBPGN.TextCounter(me.$el, {
                        countType: o.countType,
                        limit: o.limit,
                        on: {
                            'textcounterchange': (function() {
                                var $limitTarget = $(me.options.limitTarget);
                                return function(e, len) {
                                    if(me.$el.val()===me.$el.attr('placeholder' )){return;} // 140117 update
                                    if (len > o.limit) {return};//140521_추가
                                    $limitTarget.html('<strong>' + len + '</strong> / ' + o.limit + '자');
                                };
                            }())
                        }
                    });
                }
            },

            /**
             * 텍스트박스의 리사이징을 위한 초기화 작업 담당
             * @private
             */
            _autoResize: function() {
                var me = this,
                    isOldIE = WEBSVC.browser.isOldIE,
                    $clone, oriHeight, offset = 0;


                me.$el.css({overflow: 'hidden', resize: 'none'/*, height: 'auto'*/});

                $clone = isOldIE ? me.$el.clone().removeAttr('name').removeAttr('id').addClass('d_tmp_textarea').val('').appendTo(me.$el.parent()) : me.$el;
                oriHeight = $clone.height();
                $clone[0].scrollHeight; // for ie6 ~ 8

                if ($clone[0].scrollHeight !== oriHeight) {
                    offset = $clone.innerHeight() - oriHeight;
                }
                isOldIE && $clone.hide();

                me.on('keyup change input paste focusin focusout', function(){
                    this._layout(this, this.$el, $clone, oriHeight, offset);
                }.bind(me));
                me._layout(me, me.$el, $clone, oriHeight, offset);
            },

            /**
             * 텍스트박스의 scrollHeight에 따라 height를 늘려주는 역할을 담당
             * @private
             */
            _layout: function(me, $el, $clone, initialHeight, offset) {
                var current = $el.val(),
                    prev = me.prevVal,
                    isOldIE = WEBSVC.browser.isOldIE,
                    scrollHeight, height;

                if ( current === prev ) { return; }
                me.prevVal = current;

                $clone.css('height', '');
                isOldIE && $clone.val(current).show()[0].scrollHeight; // for IE6-8
                scrollHeight = $clone[0].scrollHeight;
                height = scrollHeight - offset;
                isOldIE && $clone.hide();

                $el.height(height = Math.max(height, initialHeight));
                me.triggerHandler(TextControl.ON_CHANGE, [height]);
            },

            /**
             * 파괴자 : 자동으로 호출되지 않으므로, 직접 호출해주어야 한다.
             */
            destroy: function () {
                var me = this;

                me.supr();
            }
        });

        MELON.WEBSVC.bindjQuery(TextControl, 'textControl');

        return TextControl;
    });

    WEBSVC.define('PBPGN.FormValidator', function() {
        var ruleRegex = /^(.+?)\(([^\)]+)\)?$/,
            numericRegex = /^[0-9]+$/,
            integerRegex = /^\-?[0-9]+$/,
            floatRegex = /^\-?[0-9]*\.?[0-9]+$/,
            emailRegex = /[\S]+@[\w-]+(.[\w-]+)+/,
            alphaRegex = /^[a-z]+$/i,
            alphaNumericRegex = /^[a-z0-9]+$/i,
            alphaDashRegex = /^[a-z0-9_\-]+$/i,
            numberRegex = /^[1-9][0-9]+$/i,
            numericDashRegex = /^[0-9\-]+$/,
            urlRegex = /^(http|https|ftp)\:\/\/[a-z0-9\-\.]+\.[a-z]{2,3}(:[0-9]*)?\/?[a-z0-9\-\._\?\,\'\/+&amp;%\$#\=~]*$/i,
            phoneRegex = /^[0-9]{2,4}\-?[0-9]{3,4}\-?[0-9]{4}$/i,
            korRegex = /^[가-힝]+$/;

        var messages = {
            required: '필수입력 항목입니다.',
            match:'동일한 값이어야 합니다.',
            email: '이메일 형식이 잘못 되엇습니다.',
            url: 'URL 형식이 잘못 되었습니다.',
            min_chars: '유효하지 않은 길이입니다.',
            max_chars: '유효하지 않은 길이입니다.',
            exact_chars: '유효하지 않은 길이입니다.',
            alpha: '유효하지 않은 값입니다.',
            alpha_numeric: '유효하지 않은 값입니다.',
            numeric: '유효하지 않은 값입니다.',
            integer: '유효하지 않은 값입니다.',
            decimal: '유효하지 않은 값입니다.(예: -0.2)',
            kor: '한글만 입력해 주세요.',
            file_exts: '유효하지 않은 확장자입니다.',
            ssn: '잘못된 주민등록번호입니다.'
        };

        /**
         * 폼밸리데이터
         * @class
         * @name MELON.WEBSVC.FormValidator
         */
        var FormValidator = Class(/** @lends MELON.WEBSVC.FormValidator# */{
            name: 'Validator',
            defaults:{},
            /**
             * 생성자
             * @param {jQuery} el 노드
             * @param {Object} options 옵션
             */
            initialize: function(el, options) {
                var me = this;

                me.$el = el instanceof jQuery ? el : $(el);
                me.options = $.extend({}, me.defaults, options);
                me.messages = me.handlers = {};
                me.fields = me.errors = {};

                // ready
                $.each(me.$el[0].elements, function(i, eitem) {
                    var $item = $(eitem),
                        rules;
                    if (!$item.is(':disabled, :hidden') && (rules = $item.attr('data-valid-rules'))) {
                        me.fields[$item.attr('name')] = rules;
                    }
                });
                me.fields = $.extend(me.fields, me.options.fields || {});
            },

            _clearPlaceholder: function() {
                var me = this,
                    elems = me.$el[0].elements,
                    ph;

                for(var i = 0, el; el = elements[i++]; ){
                    if((ph = el.getAttribute('placeholder')) && ph === el.value) {
                        el.value = '';
                    }
                }
            },

            _generateRule: function(rule) {
                    var pairs = ruleRegex.exec(rule);

                    return {
                        name: pairs && pairs[1] || rule,
                        params: (pairs && pairs[2] && pairs[2].replace(/\s/g, '').split(',')) || []
                    };
            },

            /**
             * 실행
             * @return {Boolean}
             */
            run: function() {
                return this._validate();
            },

            _validate: function(e) {
                var me = this,
                    fields = me.fields,
                    els = me.$el[0].elements,
                    rules, rule, el;

                for(var name in fields) { if (fields.hasOwnProperty(name)) {
                    rules = fields[name].split('|');
                    for(var i = 0, len = rules.length; i < len; i++) {
                        rule = me._generateRule(rules[i]), el = els[name];
                        if (me._valid[rule.name] && (me._valid[rule.name].apply(me, [el].concat(rule.params)) === false)) {
                            messages[rule.name] && alert(messages[rule.name]);
                            el.focus(); el.select();
                            return false;
                        }
                    }
                }}
            },

            /**
             * @namespace
             * @name MELON.WEBSVC.FormValidator._valid
             */
            _valid: /** @lends MELON.WEBSVC.FormValidator._valid */{
                /**
                 * 필수입력 체크
                 * @param {Node} el 인풋박스
                 * @return {Boolean}
                 */
                required: function(el) {
                    var val = el.value,
                        form = el.form;

                    if (el.type === 'checkbox' || el.type === 'radio') {
                        return el.checked === true;
                    }

                    return !!val;
                },
                /**
                 * 인자로 받은 두 인풋의 값이 동일한가 체크
                 * @param {Node} el 인풋박스
                 * @param {Node} targetName 인풋박스
                 * @return {Boolean}
                 */
                match: function(el, targetName) {
                    var target = el.form[targetName];
                    if (target) {
                        return el.value === target.value;
                    }
                    return false;
                },
                /**
                 * 이메일 체크
                 * @param {Node} el 인풋박스
                 * @return {Boolean}
                 */
                email: function(el) {
                    return emailRegex.test(el.value);
                },
                /**
                 * url 체크
                 * @param {Node} el 인풋박스
                 * @return {Boolean}
                 */
                url: function(el) {
                    return urlRegex.test(el.value);
                },
                /**
                 * 최소 입력 글자 수 체크
                 * @param {Node} el 인풋박스
                 * @param {Number} len 최소 입력 글자 수
                 * @return {Boolean}
                 */
                min_chars: function(el, len) {
                    return el.value.length >= parseInt(len, 10);
                },
                /**
                 * 최대 입력 글자 수 체크
                 * @param {Node} el 인풋박스
                 * @param {Number} len 최대 입력 글자 수
                 * @return {Boolean}
                 */
                max_chars: function(el, len) {
                    return el.value.length <= parseInt(len, 10);
                },
                /**
                 * 고정 입력 글자 수 체크
                 * @param {Node} el 인풋박스
                 * @param {Number} len 고정 입력 글자 수
                 * @return {Boolean}
                 */
                exact_chars: function(el, len) {
                    return el.value.length === parseInt(len, 10);
                },
                /**
                 * 알파벳 체크
                 * @param {Node} el 인풋박스
                 * @return {Boolean}
                 */
                alpha: function(el) {
                    return alphaRegex.test(el.value);
                },
                /**
                 * 알파벳+숫자 체크
                 * @param {Node} el 인풋박스
                 * @return {Boolean}
                 */
                alpha_numeric: function(el) {
                    return alphaNumericRegex.test(el.value);
                },
                /**
                 * 숫자 체크
                 * @param {Node} el 인풋박스
                 * @return {Boolean}
                 */
                numeric: function(el) {
                    return numericRegex.test(el.value);
                },
                /**
                 * 숫자 체크(-, . 허용)
                 * @param {Node} el 인풋박스
                 * @return {Boolean}
                 */
                integer: function(el) {
                    return integerRegex.test(el.value);
                },
                /**
                 * 소수점 숫자 체크(-, . 허용)
                 * @param {Node} el 인풋박스
                 * @return {Boolean}
                 */
                decimal: function(el) {
                    return decimalRegex.test(el.value);
                },
                /**
                 * 한글 체크
                 * @param {Node} el 인풋박스
                 * @return {Boolean}
                 */
                kor: function(el) {
                    return korRegex.test(el.value);
                },
                /**
                 * 파일 확장자 체크
                 * @param {Node} el 인풋박스
                 * @param {String} exts 허용할 확장자
                 * @return {Boolean}
                 */
                file_exts: function(el, exts) {
                    var types = exts.split('|'),
                        ext = el.value.substr(el.value.lastIndexOf('.') + 1);
                    for(var i = 0, len = types.length; i < len; i++) {
                        if(ext === types[i]) {
                            return true;
                        }
                    }
                    return false;
                },
                /**
                 * 주민번호 체크
                 * @param {Node} el 인풋박스
                 * @param {Node} other {Optional} 입력칸이 두개일 때 두번째 인풋박스
                 * @return {Boolean}
                 */
                ssn: function(el, other) {
                    var val = el.value + (other && other.value);
                    return WEBSVC.valid.SSN(val);
                }
            }
        });

        WEBSVC.bindjQuery(FormValidator, 'validator');
        return FormValidator;
    });

    WEBSVC.define('PBPGN.Tabs', function() {
        // 일반 탭(탭버튼과 컨텐츠가 따로 존재할 경우 사용)
        var NormalTabs = Class({
            name: 'NormalTabs',
            $extend: MELON.PBPGN.View,
            $statics: {
                ON_SELECTED: 'selected'
            },
            defaults: {
                selectedIndex: 0,
                selectEvent: 'click'
            },
            selectors: {
                tabs: '.d_tab',
                contents: '.d_content'
            },
            // 생성자
            initialize: function(el, options) {
                var me = this;

                if(me.supr(el, options) === false) { return; }
                me.on(me.options.selectEvent, me.options.selectors.tabs, function(e) {
                    e.preventDefault();
                    var $this = $(e.currentTarget),
                        index = me.$tabs.parent().index($this.parent());

                    me.select(index);
                });

                if(me.$el.find('li.on').index() >= 0) {
                    me.options.selectedIndex = me.$el.find('li.on').index();
                }
                me.select(me.options.selectedIndex);
            },

            // index에 해당하는 탭 활성화
            select: function(index) {
                var me = this,
                    $tabs = me.$tabs,
                    $contents = me.$contents;

                $tabs.parent().siblings('.on').removeClass('on').end().eq(index).addClass('on');
                $contents.hide().eq(index).show();
                me.trigger(NormalTabs.ON_SELECTED, [index]); // 이벤트를 날림.
            }
        });

        // 컨텐츠가 li안에 있고, li에 on클래스를 추가하면 컨텐츠가 표시되는 형태일 때 사용
        var ParentOnTabs = Class({
            name: 'ParentOnTabs',
            $extend: MELON.PBPGN.View,
            $statics: {
                ON_SELECTED: 'selected'
            },
            defaults: {
                selectedIndex: 0,
                selectEvent: 'click',
                msgBefore:false // 140127 add
            },
            selectors: {
                tabs: 'li > a'
            },
            // 생성자
            initialize: function(el, options) {
                var me = this;

                if(me.supr(el, options) === false) { return; }

                me.on(me.options.selectEvent, me.options.selectors.tabs, function(e) {
                    e.preventDefault();
                    var $this = $(e.currentTarget);

                    me.select($this.parent().index());
                });
                if(me.$el.find('li.on').index() >= 0) {
                    me.options.selectedIndex = me.$el.find('li.on').index();
                }
                me.select(me.options.selectedIndex,'firstSel'); // 140127 update
            },

            select: function(index,firstSel) {
                var me = this,
                    $tabs = me.$tabs,
                    /* 140127 kiok update */
                    result = true;
               var preIdx = $tabs.parent().filter('.on').index();

                if(!firstSel && me.options.msgBefore) {
                    /* 140407_삭제
                    if(me.options.condition){
                        if(me.options.condition.eq(preIdx).val() !=='true'){
                            if(!confirm(me.options.msgBefore)) {
                                result = false;
                            }
                        }
                    }
                    */
                    //140408_수정
                    if ($tabs.parent().eq(index).hasClass('on')) {
                            return false;
                    }else {
                        if (me.options.condition.find('tr.check').length > 0) {
                            result = false;
                            WEBSVC.confirm2(me.options.msgBefore).on('ok', function(){
                                result = true;

                                if(result){
                                    $tabs.parent().filter('.on').removeClass('on').end().eq(index).addClass('on');
                                    me.trigger(ParentOnTabs.ON_SELECTED, [index,result]); // 이벤트를 날림.
                                }
                            }).on('cancel', function(){
                                result = false;
                            });
                        };
                    };
                    //140408_수정
                }
                //140408_수정
                if(result){
                    $tabs.parent().filter('.on').removeClass('on').end().eq(index).addClass('on');
                    me.trigger(ParentOnTabs.ON_SELECTED, [index,result]); // 이벤트를 날림.
                }
                //140408_수정
                /* 140127 kiok update */
            }
        });

        /**
         * 탭컨트롤
         * @class
         * @name MELON.PBPGN.Tabs
         * @extends MELON.PBPGN.View
         */
        var Tabs = Class(/** @lends MELON.PBPGN.Tabs# */{
            name: 'Tabs',
            $statics: {
                ON_SELECTED: 'selected',
                TYPES: {
                    NORMAL: 'normal',
                    PARENT_ON: 'parent-on'
                }
            },
            defaults: {
                type: 'parent-on', // or 'display'
                selectedIndex: 0
            },
            /**
             * 생성자
             * @param {jQuery|Element|String} el 대상 엘리먼트
             * @param {JSON} options
             */
            initialize: function(el, options) {
                var me = this;
                options = $.extend({}, this.defaults, options);
                if(options.type === 'parent-on') {
                    me.tabs = new ParentOnTabs(el, options);
                } else {
                    me.tabs = new NormalTabs(el, options);
                }
            },

            /**
             * index에 해당하는 탭 활성화
             * @param {Number} index
             */
            select: function(index) {
                this.tabs.select(index);
            }
        });

        WEBSVC.bindjQuery(Tabs, 'tabs');  // 이 부분을 실행하면 $(..).tabs()로도 호출이 가능해진다.
        return Tabs;
    });

    WEBSVC.define('PBPGN.ToggleSlider', function() {
        /**
         * 토글 슬라이더
         * @class
         * @name MELON.PBPGN.ToggleSlider
         */
        var ToggleSlider = Class(/** @lends MELON.PBPGN.ToggleSlider# */{
            name: 'ToggleSlider',
            $extend: MELON.PBPGN.View,
            $statics: {
                ON_CHANGED: 'togglesliderchanged'
            },
            defaults: {
                selectedIndex: 0,
                selectEvent: 'click',
                random: 'false'//140728_추가
            },
            selectors: {
                tabs: '>div.wrap_page>div.page>span.wrap_btn>a',                    // 탭버튼
                contents: '>div.wrap_list_mv>ul',                                               // 컨텐츠
                nowpages: '>div.wrap_page>div.page>span.page_num>strong',   // 현재 페이지 표시영역
                totalpages: '>div.wrap_page>div.page>span.page_num>span'        // 전체 페이지 표시영역
            },

            /**
             * 생성자
             * @param {jQuery|Element|String} el 대상 엘리먼트
             * @param {JSON} options
             */
            initialize: function(el, options) {
                var me = this;
                if(me.supr(el, options) === false) { return; }

                me.nowpage = 0;
                me.maxpage = me.$contents.size() - 1;
                me.$totalpages.html(me.maxpage+1);

                if ( me.maxpage === 0 ) {
                    me.$tabs.addClass('disabled');
                } else {
                    me.$tabs.eq(0).addClass('disabled');
                }

                me.on(me.options.selectEvent, me.options.selectors.tabs, function(e) {
                    /* 150206_수정 */
                    e.preventDefault();
                    if($(this).hasClass('disabled')) {
                        e.stopPropagation();
                        return;
                    }
                    /* //150206_수정 */

                    if ( me.$tabs.index(this) === 0 && me.nowpage > 0 ) {
                        me.nowpage = me.nowpage - 1;
                    } else if ( me.$tabs.index(this) === 1 && me.nowpage < me.maxpage ) {
                        me.nowpage = me.nowpage + 1;
                    }

                    me.select(me.nowpage);
                });
                /* 140729_수정 */
                if (me.options.random == 'true') {// 시작 인덱스
                    var randomNum = Math.floor(Math.random()*me.$el.find(me.options.selectors.contents).length);
                    me.select(randomNum);
                }else {
                    me.select(me.options.selectedIndex);
                };
                /* //140729_수정 */
            },

            /**
             * index에 해당하는 컨텐츠 표시
             * @param {Number} index 인덱스
             */
            select: function(index) {
                var me = this,
                    $tabs = me.$tabs,
                    $contents = me.$contents;

                me.nowpage = index;
                $contents.hide().eq(me.nowpage).show();
                me._toggleButtons();

                me.trigger(ToggleSlider.ON_CHANGED, [index]); // 이벤트를 날림.
                // END : 131126_수정
            },

            /**
             * 이전/다음 버튼 활성화 토글링
             * @private
             */
            // START : 131126_수정
            _toggleButtons: function(){
                var me = this;

                /* 150205_수정 */
                var btnprev = me.$tabs.eq(0),
                    btnnext = me.$tabs.eq(1);

                if ( me.maxpage === 0 ) {
                    me.$tabs.addClass('disabled');
                } else if (me.nowpage === 0 ) {
                    btnprev.addClass('disabled');
                    btnnext.removeClass('disabled');
                } else if(me.nowpage === me.maxpage){
                    btnprev.removeClass('disabled');
                    btnnext.addClass('disabled');
                } else {
                    me.$tabs.removeClass('disabled');
                }
                /* //150205_수정 */

                me.$nowpages.html( me.nowpage+1 );
            },
            // END : 131126_수정

            /**
             * 컨텐츠가 변경됐을 경우, 갱신
             * @example
             * $('div.slider').toggleSlider('update');
             */
            update: function(){
                var me = this;

                me.$contents = me.$el.find(me.options.selectors.contents);
                me.$contents.hide().first().show();

                me.nowpage = 0;
                me.maxpage = me.$contents.size() - 1;
                me.$nowpages[0].innerHTML = me.nowpage + 1;
                me.$totalpages.html(me.maxpage+1);

                me.select(me.nowpage);
            }
        });

        WEBSVC.bindjQuery(ToggleSlider, 'toggleSlider');  // 이 부분을 실행하면 $(..).tabs()로도 호출이 가능해진다.
        return ToggleSlider;
    });

    WEBSVC.define('PBPGN.StarRating', function() {
        /**
         * 별점주기
         * @class
         * @name MELON.PBPGN.StarRating
         * @extends MELON.PBPGN.View
         */
        var StarRating = Class(/** @lends MELON.PBPGN.StarRating# */{
            name: 'StarRating',
            $extend: MELON.PBPGN.View,
            $statics: {
                ON_CHANGED_RATE: 'changedrate'
            },
            defaults: {
                activateClass: 'on',
                ratio: 0.5
            },
            selectors: {
                stars: 'label'
            },
            /**
             * 생성자
             * @param {String|Element|jQuery} el
             * @param {Object} options
             */
            initialize: function(el, options) {
                var me = this;

                if(me.supr(el, options) === false) { return; }
                me._initStarRating();
            },

            _initStarRating: function() {
                var me = this,
                    $stars = me.$stars,
                    index = me.$stars.filter('.on:last').index();

                $stars.on('click', function(e){
                    e.preventDefault();

                    index = $(this).index();
                    me.activate(index);
                    me.trigger(StarRating.ON_CHANGED_RATE, {rate: (index + 1) * me.options.ratio});
                }).on('mouseenter focus', function() {
                    me.activate($(this).index());
                }).on('mouseleave blur', function() {
                    me.activate(index);
                });

            },
            /**
             * idx에 해당하는 별점를 활성화
             * @param {Number} idx 별점
             * @example
             * $('#starRating').startRating('activate', 3.5);
             */
            activate: function(idx) {
                var me = this,
                    $stars = me.$stars,
                    onCls = me.options.activateClass;

                if (idx < 0){
                    $stars.removeClass(onCls);
                } else {
                    $stars.eq(idx).nextAll().removeClass(onCls).end().prevAll().addBack().addClass(onCls);
                }
            }
        });

        WEBSVC.bindjQuery(StarRating, 'starRating');
        return StarRating;
    });

    WEBSVC.define('PBPGN.SimpleBanner', function() {
        /**
         * 단순한 배너 모듈
         * @class
         * @name MELON.PBPGN.SimpleBanner
         */
        var SimpleBanner = Class({
            name: 'SimpleBanner',
            $extend: MELON.PBPGN.View,
            $statics: {
                ON_SLIDE_END: 'simplebannerslideend',
                ON_PLAY: 'simplebannerplay',
                ON_STOP: 'simplebannerstop'
            },
            defaults: {
                start: 0,
                interval: 3000,
                useFade: true,
                autoStart: true,
                buttonDisabled: false
            },
            selectors: {
                items: 'li',
                indicators: 'a.d_indicator',
                btnPlay: '.d_btn_ctrl.play',
                btnPause: '.d_btn_ctrl.pause'
            },
            events: {
                'click .d_btn_ctrl': function(e) {
                    e.preventDefault();
                    var me = this,
                        $this = $(e.currentTarget);

                    if($this.hasClass('pre') || $this.hasClass('prev')){
                        me.prev();
                    } else if($this.hasClass('pause')){
                        me.stop();
                    } else if($this.hasClass('play')){
                        me.play();
                    } else if($this.hasClass('next')){
                        me.next();
                    }
                }
            },
            initialize: function(el, options) {
                var me = this;
                if(me.supr(el, options) === false) { me.destroy(); return; }
                me._current = 0;
                me._count = me.$items.length;

                if(me._count === 0) { me.destroy(); return; }

                me._isMouseOver = false;

                me.$indicators.on('click', function(e) {
                    e.preventDefault();
                    me.select($(this).index());
                });

                me.on('mouseenter focusin mouseleave focusout', function(e){
                    switch(e.type) {
                    case 'mouseenter':
                    case 'focusin':
                        me._isMouseOver = true;
                        break;
                    default:
                        me._isMouseOver = false;
                        break;
                    }
                });

                me.select(me.options.start);
                me.options.autoStart && me.play();
            },
            select: function(index) {
                var me = this;
                if (index < 0) { index = me._count - 1; }
                else if(index >= me._count) { index = 0; }

                if( me.options.type === 'show' ) {
                    me.$items.hide().eq(index).show();
                } else {
                    me.$items.removeClass('on').eq(index).addClass('on');
                }
                me.$indicators.removeClass('on').eq(index).addClass('on');
                if(me.options.buttonDisabled) {
                    me.$el.find('button.d_btn_ctrl')
                        .filter('.pre').prop('disabled', index === 0).toggleClass('disabled', index === 0).end().
                        filter('.next').prop('disabled', index + 1 === me._count).toggleClass('disabled', index + 1 === me._count);
                }
                me._current = index;
                me.triggerHandler('simplebannerslideend', [index]);
            },
            play: function() {
                var me = this,
                    seltor = me.options.selectors;
                if(me.timer) { return; }

                me.timer = setInterval(function() {
                    if(me._isMouseOver) { return; }
                    me.next();
                }, me.options.interval);

                var $btn = me.$el.find(seltor.btnPlay);
                $btn.attr('title', ($btn.attr('title')||'재생').replace('재생', '일시정지')).replaceClass('play', 'pause').children().html(function(){
                    this.innerHTML = this.innerHTML.replace('재생', '일시정지');
                });
                me.triggerHandler('simplebannerplay');
            },
            stop: function() {
                var me = this,
                    seltor = me.options.selectors;
                if(me.timer) {
                    clearInterval(me.timer);
                    me.timer = null;
                }

                var $btn = me.$el.find(seltor.btnPause);
                $btn.attr('title', ($btn.attr('title')||'일시정지').replace('일시정지', '재생')).replaceClass('pause', 'play').children().html(function(){
                    this.innerHTML = this.innerHTML.replace('일시정지', '재생');
                });
                me.triggerHandler('simplebannerstop');
            },
            prev: function() {
                var me = this;

                me.select(me._current - 1);
            },
            next: function() {
                var me = this;

                me.select(me._current + 1);
            }
        });

        WEBSVC.bindjQuery(SimpleBanner, 'simpleBanner');

        return SimpleBanner;
    });

    /* 140422_수정 */
    WEBSVC.define('PBPGN.RollingBanner', function() {
        /**
         * 롤링배너
         * @class
         */
        var RollingBanner = Class(/** @lends MELON.PBPGN.GNB.RollingBanner# */{
            $extend: View,
            name: 'RollingBanner',
            defaults: {
                interval: 3000, // 롤링주기
                duration: 600,   // 롤링시간
                container: 'li',
                containerArea:'width',
                containerAreaN :220,
                item: 'li>div',
                position: 'top',
                posRange: 22,
                fadeUse: false,
                easingOpt: 'easeInOutQuad',
                btnPlay: '.play',
                btnPause: '.pause',
                autoPlay: true,
                random: false//140612_추가
            },
            events: {
                'click .move > a': function(e) {
                    e.preventDefault();
                    var me = this,
                        $this = $(e.currentTarget);

                    if (me._$items.is(':animated')) {
                        return false;
                    };

                    if (!$this.hasClass('on')) {
                        me.stop();
                        me.roll($this.index());
                        if (me.options.autoPlay == 'false' || me.$el.find('.d_btn_ctrl').hasClass('play')) {
                            return false;
                        };
                        me.start();
                    };
                },
                'click .d_btn_ctrl': function(e) {
                    e.preventDefault();
                    var me = this,
                        $this = $(e.currentTarget);
                    if($this.hasClass('pause')){
                        me.stop();
                        me.stopBtn();
                    } else if($this.hasClass('play')){
                        me.start();
                        me.playBtn();
                    }
                }
            },
            /**
             * 생성자
             * @param {String|Element|jQuery} el 해당 엘리먼트(노드, id, jQuery 어떤 형식이든 상관없다)
             * @param {Object} options 옵션값
             */
            initialize: function(el, options) {
                var me = this;

                if(me.supr(el, options) === false) { return; }

                me.$el.find(me.options.container).css(me.options.containerArea, me.options.containerAreaN);
                me._$items = me.$el.find(me.options.item);         // 롤링할 아이템 조회
                /* 140701_수정 */
                if(me._$items.length <= 1) { // 아이템이 1개 이하면 무시
                    me.$el.find('.play_control').hide();
                    return;
                }
                /* //140701_수정 */

                /* 140612_수정 */
                if (me.options.random == true) {// 시작 인덱스
                    var randomNum = Math.floor(Math.random()*me.$el.find(me.options.item).length);
                    me._$items.eq(randomNum).show().siblings().hide();
                    me.$el.find('.move >a').eq(randomNum).addClass('on').siblings().removeClass('on');
                    me.index = randomNum;
                }else {
                    me.index = 0;
                };
                /* //140612_수정 */
                me.count = me._$items.length;       // 총 아이템 갯수
                if (me.options.autoPlay == 'true') {
                    me.start();
                };                                 // 롤링 시작

                // 롤링영역에 마우스가 오버됐거나 포커스가 들어오면 롤링을 일시 중지 시킨다.
                me.$el.find(me.options.container).on('mouseenter focusin mouseleave focusout', function(e){
                    if (me.options.autoPlay == 'false') {
                        return false;
                    };
                    switch(e.type) {
                    case 'mouseenter':
                    case 'focusin':
                        me.stop();
                        break;
                    default:
                        !me.timer && me.start();
                        break;
                    }
                });

            },
            /**
             * 롱링 시작
             */
            roll: function(index){
                var me = this,
                    indicator = index,
                    mePos = me.options.position,
                    mePosRange = me.options.posRange,
                    $curr = me._$items.eq(me.index),
                    nextIndex,
                    aniPos = {};

                if (indicator !== undefined) {
                    nextIndex = indicator;
                }else {
                    nextIndex = (me.index + 1 <= me.count - 1 ? me.index + 1 : 0);
                };
                var $next = me._$items.eq(nextIndex).css({mePos : mePosRange, 'display': 'inline'}); // 다음 아이템

                aniPos[mePos] = -mePosRange;

                if (me.options.fadeUse == true) {
                    aniPos['opacity'] = 0;
                };

                $curr.stop().css(mePos, 0).animate(aniPos, {
                    easing: me.options.easingOpt,
                    duration: me.options.duration,
                    step: function(now, fx) {
                        if (me.options.fadeUse == true && fx.prop == 'opacity') {
                            $next.css('opacity', 1 - now);
                        }else if (fx.prop == mePos) {
                            $next.css(mePos , mePosRange + now);
                        };
                    },
                    complete: function(){
                        $curr.hide().css(mePos, 0); // 가시영역 밖으로 나간 녀석은 hide처리(탭키에 의한 포커스가 가지 않도록...)
                    }
                });

                me.index = nextIndex;

                me.$el.find('.move >a').eq(nextIndex).addClass('on').siblings().removeClass('on');
            },
            start: function(el, options){
                var me = this;
                clearInterval(me.timer), me.timer = null;
                /* 140616_추가 */
                if (me.$el.find('.play_control .d_btn_ctrl').is('.play')) {

                    return;
                };
                /* //140616_추가 */
                me.timer = setInterval(function() {
                    me.roll();
                }, me.options.interval); // 3초마다 롤링
            },
            /**
             * 롤링 중지
             */
            stop: function(index){
                var me = this;
                clearInterval(me.timer), me.timer = null;
            },
            playBtn:function(){
                var me = this;
                var $btn = me.$el.find(me.options.btnPlay);
                $btn.attr('title', ($btn.attr('title')||'재생').replace('재생', '일시정지')).replaceClass('play', 'pause').children().html(function(){
                    this.innerHTML = this.innerHTML.replace('재생', '일시정지');
                });
            },
            stopBtn:function(){
                var me = this;
                var $btn = me.$el.find(me.options.btnPause);
                $btn.attr('title', ($btn.attr('title')||'일시정지').replace('일시정지', '재생')).replaceClass('pause', 'play').children().html(function(){
                    this.innerHTML = this.innerHTML.replace('일시정지', '재생');
                });
            }
        });
        WEBSVC.bindjQuery(RollingBanner, 'rollingBanner');
        return RollingBanner;
    });
    /* //140422_수정 */

    WEBSVC.define('PBPGN.WeekCalendar', function() {
        var daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
            dateUtil = WEBSVC.date;
        /**
         * 주간 달력
         * @class
         * @name MELON.PBPGN.WeekCalendar
         * @extends MELON.PBPGN.View
         * @example
         * // 속성 : data-active-start="2013-12-12" : 선택된 주간의 시작일
         * // 속성 : data-active-end="2013-12-19" : 선택된 주간의 종료일
         * // 속성 : data-last-date="2013-12-19" : 선택할 수 있는 마지막 날짜
         * // 속성 : data-limit-week="12" : 12주 이전부터 선택가능
         */
        var WeekCalendar = Class(/** @lends MELON.PBPGN.WeekCalendar# */{
            name: 'WeekCalendar',
            $extend: MELON.PBPGN.View,
            $statics: {
                ON_SELECTED: 'selected',                        // 날짜 선택시 발생되는 이벤트
                ON_SELECTED_WEEK: 'selectedweek',                       // 날짜 선택시 발생되는 이벤트
                ON_SHOWCALENDAR: 'showcalendar',    // 달력이 표시될 때 발생되는 이벤트
                ON_HIDECALENDAR: 'hidecalendar'     // 달력이 숨겨질 때 발생되는 이벤트
            },
            defaults: {
                weekNames: ['월','화','수','목','금', '토', '일'],
                monthNames: '1월,2월,3월,4월,5월,6월,7월,8월,9월,10월,11월,12월'.split(','),
                startDate: '19700101',
                endDate: '21001231',
                limitWeek: 12,
                title: '',
                // 테이블의 캡션부분을 표시될 문구 생성(클래스 생성시 오버라이딩 가능)
                getCaption: function(type, wname, sy, sm, sd, ey, em, ed) {
                    if(!this.options.title){ return ''; }

                    switch(type){
                    case 'active':
                        return '선택된 주간입니다.('+sy+'.'+sm+'.'+sd+')';
                    case 'before':
                    case 'after':
                        return '선택할 수 없는 주간입니다.';
                    }
                    return wname+'입니다.('+sy+'.'+sm+'.'+sd+' ~ '+ey+'.'+em+'.'+ed+')';
                },
                // 각 날짜의 title속성에 표시할 문구 생성(클래스 생성시 오버라이딩 가능)
                getTitle: function() { return this.options.getCaption.apply(this, arguments); }
            },
            template: ['<div class="l_calendar" tabindex="0" style="position:absolute; z-index:13; left:35px; top:55px;"><dl class="cntt"><dt>',
                    '<button type="button" class="btn_round small pre"><span class="odd_span"><span class="even_span">이전 달</span></span></button>', // 20140208 수정
                    '<span class="date"></span>',
                    '<button type="button" class="btn_round small next"><span class="odd_span"><span class="even_span">다음 달</span></span></button>',    // 20140208 수정
                '</dt><dd class="week_calendar"><table border="1">',
                        '<caption></caption>',
                        '<colgroup><col /><col style="width:36px;" /><col style="width:36px;" /><col style="width:36px;" /><col style="width:36px;" /><col style="width:36px;" /><col style="width:36px;" /><col style="width:36px;" /></colgroup>',
                        '<thead><tr><th>주 선택란</th><th id="week01">월</th><th id="week02">화</th><th id="week03">수</th><th id="week04">목</th><th id="week05">금</th><th id="week06">토</th><th id="week07">일</th></tr></thead>',
                        '<tbody class="days"><!-- 내용부분 --></tbody></table></dd>',
                        '</dl><button type="button" class="btn_close"><span class="odd_span">닫기</span></button><span class="shadow"></span></div>'].join(''),       // 20140208 수정
            events: {
                // 달력버튼을 클릭할 때
                'click': function(e) {
                    if(WeekCalendar.active === this) {
                        this.close();
                    } else {
                        this.open();
                    }
                }
            },

            /**
             * 생성자
             * @param {String|Element|jQuery} el
             * @param {Object} options
             */
            initialize: function(el, options) {
                var me = this;

                me.supr(el, options);
                me.limitWeek = me.$el.data('limitWeek') || me.options.limitWeek;
                me._initWeekCalendar();
            },

            /**
             * 초기화
             * @private
             */
            _initWeekCalendar: function() {
                var me = this;

                //start: 20140208 .mhover
                me.$el.mouseHover('tr');
                //end: 20140208
            },

            /**
             * 버튼의 data속성을 바탕으로 표시할 날짜를 계산
             * @private
             */
            _configure: function(){
                var me = this,
                    activeStart = me.$el.attr('data-active-start') || me.options.activeStart,
                    activeEnd = me.$el.attr('data-active-end') || me.options.activeEnd,
                    lastDate =  me.$el.attr('data-last-date') || me.options.lastDate;

                me.lastDate = lastDate && dateUtil.parseDate(lastDate) || (function() {
                    var d = new Date();
                    d.setDate(d.getDate() - d.getDay());
                    return d;
                }());
                me.startDate = activeStart && dateUtil.parseDate(activeStart) || (function() {
                    var d = new Date(me.lastDate.getTime());
                    d.setDate(d.getDate() - d.getDay() - 6);
                    return d;
                }());
                me.endDate = activeEnd && dateUtil.parseDate(activeEnd) || (function(){
                    var d = new Date(me.startDate.getTime());
                    d.setDate(d.getDate() + 6);
                    return d;
                }());
                me.currentDate = new Date(me.endDate.getTime());

                me.startLimitDate = new Date(me.lastDate.getTime() - (1000 * 60 * 60 * 24 * 7 * (me.limitWeek)) + (1000 * 60 * 60 * 24) );
                me.endLimitDate = new Date(me.lastDate.getTime());
            },

            destroy: function() {
                var me = this;

                me.supr();
                $doc.off(me._eventNamespace);
                me.$calendar.off().remove();
            },

            /**
             * 이벤트 바인딩 및 달력표시
             */
            open: function() {
                var me = this;

                me._configure();

                me.$calendar = $(me.template).hide().insertAfter(me.$el[0]);
                me.$calendar
                    .css('zIndex', 9999)
                    .css(me.options.css||{})
                    .on('click', 'button.pre, button.next', function(e) {
                        // 이전, 다음 클릭
                        me.currentDate.setMonth(me.currentDate.getMonth() + (this.className.indexOf('pre') > -1 ? -1 : 1));
                        me.render(new Date(me.currentDate));
                    }).on('click mouseenter mouseleave focusin focusout', 'tbody tr.d_week', function(e) {
                        // 주간 row에 대한 이벤트 바인딩
                        switch(e.type) {
                        case 'mouseenter':
                        case 'focusin':
                            // 활성화
                            $(this).closest('tr').siblings().removeClass('mfocus').end().addClass('mfocus');
                            break;
                        case 'mouseleave':
                        case 'focusout':
                            // 비활성화
                            $(this).closest('tr').removeClass('mfocus');
                            break;
                        case 'click':
                            // 주간 클릭
                            var $this = $(this),
                                value = {};

                            if(!$this.hasClass('on')) {
                                value = {
                                    startDate: $this.attr('data-start-date'),
                                    endDate: $this.attr('data-end-date'),
                                    startYear: $this.attr('data-start-year'),
                                    startMonth: $this.attr('data-start-month'),
                                    startDay: $this.attr('data-start-day'),
                                    endYear: $this.attr('data-end-year'),
                                    endMonth: $this.attr('data-end-month'),
                                    endDay: $this.attr('data-end-day'),
                                    isFirstDate: $this.attr('data-start-date') === dateUtil.format(me.startLimitDate, 'yyyyMMdd'),
                                    isLastDate: $this.attr('data-end-date') === dateUtil.format(me.endLimitDate, 'yyyyMMdd'),
                                    week: $this.attr('data-week')
                                };

                                me.$el.triggerHandler(WeekCalendar.ON_SELECTED, [
                                    value.startDate, value.endDate,
                                    value.startYear, value.startMonth, value.startDay,
                                    value.endYear, value.endMonth, value.endDay,
                                    value.isFirstDate,
                                    value.isLastDate,
                                    value.week
                                ]);
                                me.$el.triggerHandler(WeekCalendar.ON_SELECTED_WEEK, [value]);
                            }
                            break;
                        }
                    }).on('click', 'tbody th>a', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        $(this).closest('tr').click();
                    }).on('click', function(e) {
                        // 달력내에서 마우스다운시 닫히지 않도록
                        e.stopPropagation();
                    }).on('click', 'button.btn_close', function(e){
                        // 닫기 버튼
                        e.stopPropagation();
                        me.close();
                    });

                if(WEBSVC.browser.isIE7) {
                    // zindex fix
                    me.$calendar.on('beforeshow hide', function(e) {
                        if(e.type === 'beforeshow'){
                            $(this).closest('div.summ_prid').addClass('on');
                        } else {
                            $(this).closest('div.summ_prid').removeClass('on');
                        }
                    });
                }

                // 달력밖에서 클릭시 닫는다.
                $doc.on('click' + me._eventNamespace, function(e) {
                    if (me.$el[0] !== e.target && !$.contains(me.$el[0], e.target) &&
                        me.$calendar[0] !== e.target && !$.contains(me.$calendar[0], e.target)) {

                        WeekCalendar.active && WeekCalendar.active.close();
                    }
                });

                me.show();
            },

            /**
             * 달력표시
             */
            show: function() {
                var me = this;

                WeekCalendar.active = me;

                me.render(me.currentDate);
                me.$calendar.showLayer().focus();
                me.trigger(WeekCalendar.ON_SHOWCALENDAR, [me.$calendar]);
            },

            /**
             * 달력숨김
             */
            hide: function() {
                var me = this;
                me.isShown = false;
                this.$calendar.hideLayer();
                me.trigger(WeekCalendar.ON_HIDECALENDAR, [me.$calendar]);
            },

            /**
             * 달력닫기
             */
            close: function(){
                var me = this;

                $doc.off('click' + me._eventNamespace);
                me.hide();
                me.$calendar.off().remove();
                WeekCalendar.active = null;
            },

            /**
             * 이전 주 계산
             * @param date 현재 날짜
             * @return {JSON} 이전 주에 해당하는 값들
             */
            _getPrevWeek: function(date){
                var d = new Date(date.getTime() - (1000*60*60*24*7));
                return {
                    startDate: new Date(d.getTime()),
                    endDate: new Date(d.getTime() + (1000*60*60*24*6))
                };
            },

            /**
             * 다음 주 계산
             * @param date 현재 날짜
             * @return {JSON} 이전 주에 해당하는 값들
             */
            _getNextWeek: function(date){
                var d = new Date(date.getTime() + (1000*60*60*24*7));
                return {
                    startDate: new Date(d.getTime()),
                    endDate: new Date(d.getTime() + (1000*60*60*24*6))
                };
            },

            _sameWeekDate: function(date, d) {
                return date.getFullYear() === d.year && date.getMonth() === d.month - 1 && date.getDate() === d.day;
            },

            /**
             * 달력 렌더링
             * @param {Date} 렌더링시 기준 날짜
             */
            render: function(date) {
                var me = this,
                    zeroPad = WEBSVC.number.zeroPad,
                    data = me._getDateList(date),
                    startLimit = me.startLimitDate.getTime(),
                    endLimit = me.endLimitDate.getTime(),
                    title = me.options.title,
                    getCaption = me.options.getCaption,
                    getTitle = me.options.getTitle,
                    html = '', curr, headerId, isOn, cls, wn, wi, week, startWeek, endWeek, sy, sm, sd, ey, em, ed,args;

                for(var i = 0; i < data.length; i++) {
                    week = data[i];
                    startWeek = week[0];
                    endWeek = week[6];
                    curr = new Date(startWeek.year, startWeek.month - 1, startWeek.day, 0, 0, 0);
                    isOn = me._sameWeekDate(me.startDate, startWeek)&&me._sameWeekDate(me.endDate, endWeek);
                    cls = isOn ? "on" : "d_btn";
                    headerId = 'cycle0'+(i + 1);
                    sy = startWeek.year; sm = zeroPad(startWeek.month); sd = zeroPad(startWeek.day);
                    ey = endWeek.year; em = zeroPad(endWeek.month); ed = zeroPad(endWeek.day);

                    if(i > 1 && startWeek.month !== endWeek.month) { wn = endWeek.month + '월 1주차'; wi = 1; }
                    else { wn = endWeek.month + '월 ' + (wi = (i + 1)) + '주차'; }

                    args = [wn, sy, sm, sd, ey, em, ed];
                    if(startLimit <= curr.getTime() && endLimit > curr.getTime()) {
                        html += '<tr class="d_week ' + cls + '" title="'+getTitle.apply(me, [isOn?'active':'normal'].concat(args))+'" ';
                        html += 'data-start-date="'+sy+sm+sd+'" data-start-year="'+sy+'" data-start-month="'+sm+'" data-start-day="'+sd+'" ';
                        html += 'data-end-date="'+ey+em+ed+'" data-end-year="'+ey+'" data-end-month="'+em+'" data-end-day="'+ed+'" data-week="'+wi+'">';

                        if(isOn) {
                            html += '<th id="'+headerId+'">' + getCaption.apply(me, ['active'].concat(args)) + '</th>';
                        } else {
                            html += '<th id="'+headerId+'"><a href="#" title="' + getCaption.apply(me, ['normal'].concat(args)) + '">' + (i + 1) + '</a></th>';
                        }
                    } else {
                        html += '<tr class="end">';

                        if(startLimit > curr.getTime()) {
                            html += '<tr class="end" title="'+getTitle.apply(me, ['before'].concat(args))+'">';
                            html += '<th>' + getCaption.apply(me, ['before'].concat(args)) + '</th>';
                        } else {
                            html += '<tr class="end" title="'+getTitle.apply(me, ['after'].concat(args))+'">';
                            html += '<th>' + getCaption.apply(me, ['after'].concat(args)) + '</th>';
                        }
                    }

                    for(var j = 0, len = week.length; j < len; j++) {
                        if(j === 0) { cls = 'first'; }
                        else if(j === len - 1){ cls = 'end'; }
                        else { cls = ''; }
                        html += '<td headers="'+headerId+' week0'+(j + 1)+'" class="'+cls+'">'+(week[j].month - 1 === date.getMonth() ? '' : '<span class="none">'+week[j].month+'월</span>')+week[j].day + '</td>';
                    }
                    html += '</tr>';
                }

                // 날짜 제한에 따른 이전, 다음 버튼 활성화
                if(me.startLimitDate.getFullYear() === date.getFullYear() && me.startLimitDate.getMonth() === date.getMonth()) {
                    me.$calendar.find('button.pre').addClass('disabled').prop('disabled', true);
                } else {
                    me.$calendar.find('button.pre').removeClass('disabled').prop('disabled', false);
                }
                var now = me.endLimitDate;
                if(date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()) {
                    me.$calendar.find('button.next').addClass('disabled').prop('disabled', true);
                } else {
                    me.$calendar.find('button.next').removeClass('disabled').prop('disabled', false);
                }

                me.$calendar.find('tbody.days').html(html);
                me.$calendar.find('span.date').html(date.getFullYear() + '<span class="none">년</span>.' + zeroPad(date.getMonth() + 1) + '<span class="none">월</span>');
                me.$calendar.find('caption').html(date.getFullYear() + '년 ' + (date.getMonth() + 1) + '월 주간 선택 달력 테이블');
            },

            /**
             * 날짜 데이타 계산
             * @param {Date} date 렌더링할 날짜 데이타 생성
             * @return {Array}
             */
            _getDateList: function(date) {
                date.setDate(1);

                var me = this,
                    month = date.getMonth() + 1,
                    year = date.getFullYear(),
                    startOnWeek = date.getDay() === 0 ? 7 : date.getDay(),      // 1일의 요일
                    last = daysInMonth[date.getMonth()],    // 마지막날
                    prevLast = daysInMonth[date.getMonth() === 0 ? 11 : date.getMonth() - 1], // 이전달의 마지막날
                    startPrevMonth = prevLast - startOnWeek,// 이전달의 시작일
                    y = year, m = month;

                if (month > 12) {
                    month -= 12, year += 1;
                } else {
                    if (month == 2 && me._isLeapYear(year)) {
                        last = 29;
                    }
                }

                var weekDay = 0,
                    data = [],
                    week = [];

                if ( startOnWeek > 0 ) {
                    if (month == 3 && me._isLeapYear(year)) { startPrevMonth += 1; }
                    if ((m = month -1) < 1) { m = 12, y = year - 1; }
                    for(var i = 1; i < startOnWeek; i++ ) {
                        week.push({year: y, month: m, day: startPrevMonth + i + 1});        // ***** +1
                    }
                    if (week.length > 6) { data.push(week), week = []; }
                }

                for(var i = 1; i <= last; i++) {
                    week.push({year:year, month: month, day: i});
                    if (week.length > 6) {
                        data.push(week), week = [];
                    }
                }

                if (week.length > 0 && week.length < 7) {
                    if ((m = month + 1) > 12) { m -= 12, y = year + 1; }
                    if( (month - 1) < 1){ m = 2, y = year;} //140425_1월의마지막주
                    for(var i = week.length, d = 1; i< 7; i++, d++) {
                        week.push({year:y, month: m, day: d});
                    }
                }
                week.length&&data.push(week);
                return data;
            },

            /**
             * 윤년 여부
             * @param {Date} date 렌더링할 날짜 데이타 생성
             * @return {Boolean} 윤년 여부
             */
            _isLeapYear: function(year) {
                return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0))
            },

            /**
             * 현재 표시된 주가 제한값의 시작주인가
             * @return {Boolean}
             */
            isFirstDate: function(){
                var me = this;
                me._configure();
                return dateUtil.format(me.startDate, 'yyyyMMdd') === dateUtil.format(me.startLimitDate, 'yyyyMMdd');
            },

            /**
             * 현재 표시된 주가 제한값의 마지막주인가
             * @return {Boolean}
             */
            isLastDate: function(){
                var me = this;
                me._configure();
                return dateUtil.format(me.endDate, 'yyyyMMdd') === dateUtil.format(me.endLimitDate, 'yyyyMMdd');
            },

            /**
             * 전주, 다음주 계산
             * @private
             * @param {Number} 1: 다음주, -1: 전주
             * @return {JSON} 주간정보
             */
            _calc: function(n) {
                var me = this,
                    value;

                me._configure();
                value = n > 0 ? me._getNextWeek(me.startDate) : me._getPrevWeek(me.startDate);

                if(value.startDate.getMonth() !== value.endDate.getMonth()){ value.week = 1; }
                else {
                    value.week = Math.ceil((value.startDate.getDay() + value.startDate.getDate()) / 7);
                }

                value.startYear = value.startDate.getFullYear();
                value.startMonth = numberUtil.zeroPad(value.startDate.getMonth() + 1);
                value.startDay = numberUtil.zeroPad(value.startDate.getDate());

                value.endYear = value.endDate.getFullYear();
                value.endMonth = numberUtil.zeroPad(value.endDate.getMonth() + 1);
                value.endDay = numberUtil.zeroPad(value.endDate.getDate());

                value.startDate = dateUtil.format(value.startDate, 'yyyyMMdd');
                value.endDate = dateUtil.format(value.endDate, 'yyyyMMdd');

                value.isFirstDate = value.startDate === dateUtil.format(me.startLimitDate, 'yyyyMMdd');
                value.isLastDate = value.endDate === dateUtil.format(me.endLimitDate, 'yyyyMMdd');

                return value;
            },

            /**
             * 전주
             * @return {JSON} 전주 정보
             */
            prev: function() {
                return this._calc(-1);
            },

            /**
             * 다음주
             * @return {JSON} 다음주 정보
             */
            next: function() {
                return this._calc(1);
            }
        });

        // 달력 모듈이 한번이라도 호출되면, 이 부분이 실행됨, 달력 모듈이 단 한번도 사용안하는 경우도 있는데,
        // 무조건 바인딩시켜놓는건 비효율적인 듯 해서 이와 같이 처리함
        WeekCalendar.onClassCreate = function() {
            WEBSVC.PubSub.on('hide:modal', function() {
                WeekCalendar.active&&WeekCalendar.active.close();
            });
        };
        WEBSVC.bindjQuery(WeekCalendar, 'weekCalendar');
        return WeekCalendar;
    });

    WEBSVC.define('PBPGN.MonthCalendar', function() {
        var dateUtil = WEBSVC.date;

        /**
         * 월간 달력
         * @class
         * @name MELON.PBPGN.MonthCalendar
         * @extends MELON.PBPGN.View
         */
        var MonthCalendar = Class(/** @lends MELON.PBPGN.MonthCalendar# */{
            name: 'MonthCalendar',
            $extend: MELON.PBPGN.View,
            $statics: {
                ON_SELECTED: 'selected',                        // 날짜 선택시 발생되는 이벤트
                ON_SHOWCALENDAR: 'showcalendar',    // 달력이 표시될 때 발생되는 이벤트
                ON_HIDECALENDAR: 'hidecalendar'     // 달력이 숨겨질 때 발생되는 이벤트
            },
            events: {
                // 달력버튼을 클릭할 때
                'click': function(e) {
                    if (MonthCalendar.active === this) {
                        this.close();
                    } else {
                        this.open();
                    }
                }
            },
            template: ['<div class="l_calendar" tabindex="0" style="position:absolute; z-index:13; left:35px; top:55px;"><dl class="cntt"><dt>',
            '<button type="button" class="btn_round small pre"><span class="odd_span"><span class="even_span">이전 년도</span></span></button>',    // 20140208 수정
            '<span class="date">2013<span class="none">년</span></span>',
            '<button type="button" class="btn_round small next"><span class="odd_span"><span class="even_span">다음 년도</span></span></button>',   // 20140208 수정
            '</dt><dd class="month_calendar"><ul>',
            '</ul></dd></dl><button type="button" class="btn_close"><span class="odd_span">닫기</span></button>',     // 20140208 수정
                '<span class="shadow"></span>',
            '</div>'].join(''),
            defaults: {
                limitMonth: 0,
                title: '',
                // 테이블의 캡션부분을 표시될 문구 생성(클래스 생성시 오버라이딩 가능)
                getCaption: function() { return ''; },
                // 각 날짜의 title속성에 표시할 문구 생성(클래스 생성시 오버라이딩 가능)
                getTitle: function() { return ''; }
            },
            /**
             * 생성자
             * @param {String|Element|jQuery} el
             * @param {Object} options
             */
            initialize: function(el, options) {
                var me = this;

                me.supr(el, options);
                me._initMonthCalendar();
            },

            /**
             * 초기화
             * @private
             */
            _initMonthCalendar: function() {
                var me = this;

            },

            /**
             * 버튼의 data속성을 바탕으로 표시할 날짜를 계산
             * @private
             */
            _configure: function(){
                var me = this,
                    limitMonth =  me.$el.data('limitMonth') || me.options.limitMonth,
                    lastDate = me.$el.attr('data-last-date') || me.options.lastDate,
                    activeDate =  me.$el.attr('data-active-date') || me.options.activeDate,
                    startDate = me.$el.attr('data-start-date') || me.options.startDate;//140502_수정

                me.endDate =  lastDate && dateUtil.parseDate(lastDate+'.01') || (function(){
                    var d = new Date();
                    d.setMonth(d.getMonth());//140124_수정 우측은 서버타임 사용시? d.setMonth(d.getMonth() - 1);
                    return d;
                }());

                me.activeDate = activeDate && dateUtil.parseDate(activeDate+'.01') || new Date(me.endDate.getTime());
                me.currentDate = new Date(me.activeDate.getTime());
                me.limitDate = new Date(me.endDate.getTime());
                if(limitMonth) {
                    me.limitDate.setMonth( me.limitDate.getMonth() - limitMonth );
                /* 140502_수정 */
                }else if (startDate) {
                    me.limitDate.setYear(dateUtil.parseDate(startDate+'.01').getFullYear());
                    me.limitDate.setMonth(dateUtil.parseDate(startDate+'.01').getMonth());
                /* //140502_수정 */
                } else {
                    me.limitDate.setYear(me.limitDate.getFullYear() - 1);
                    me.limitDate.setMonth(0); // - limitMonth
                }
            },


            /**
             * 이벤트 바인딩 및 달력표시
             */
            open: function() {
                var me = this;

                me._configure();

                me.$calendar = $(me.template).hide().insertAfter(me.$el);
                if(me.options.style) {
                    me.$calendar[0].style.cssText = me.options.style;
                }
                me.$calendar
                    .css('zIndex', 9999)
                    .on('click', 'li>a', function(e){
                        e.preventDefault();
                        var $this = $(this);
                        // selected 이벤트 트리거
                        me.trigger(MonthCalendar.ON_SELECTED, [
                            $this.attr('data-date'),
                            $this.attr('data-year'),
                            $this.attr('data-month'),
                            $this.attr('data-date') === dateUtil.format(me.limitDate, 'yyyyMM'),
                            $this.attr('data-date') === dateUtil.format(me.endDate, 'yyyyMM')
                        ]);
                    })
                    .on('click', 'button.pre, button.next', function(e) {
                        me.currentDate.setYear(me.currentDate.getFullYear() + (this.className.indexOf('pre') > -1 ? -1 : 1));
                        me.render(new Date(me.currentDate));
                    })
                    .on('click', 'button.btn_close', function(e){
                        e.stopPropagation();
                        me.close();
                    });

                if(WEBSVC.browser.isIE7) {
                    // z-index 문제 해결
                    me.$calendar.on('beforeshow hide', function(e) {
                        if(e.type === 'beforeshow'){
                            $(this).closest('div.summ_prid').addClass('on');
                        } else {
                            $(this).closest('div.summ_prid').removeClass('on');
                        }
                    });
                }

                $doc.on('click' + me._eventNamespace, function(e) {
                    // 달력 영역 바깥에서 클릭하면 닫는다.
                    if (me.$el[0] !== e.target && !$.contains(me.$el[0], e.target) &&
                        me.$calendar[0] !== e.target && !$.contains(me.$calendar[0], e.target)) {
                        MonthCalendar.active && MonthCalendar.active.close();
                    }
                });
                me.show();
            },

            /**
             * 현재 표시된 월이 제한값의 시작월인가
             */
            isFirstDate: function(){
                var me = this;
                me._configure();
                return dateUtil.format(me.activeDate, 'yyyyMM') === dateUtil.format(me.limitDate, 'yyyyMM');
            },

            /**
             * 현재 표시된 월이 제한값의 마지막월인가
             */
            isLastDate: function(){
                var me = this;
                me._configure();
                return dateUtil.format(me.activeDate, 'yyyyMM') === dateUtil.format(me.endDate, 'yyyyMM');
            },

            /**
             * 달력표시
             */
            show: function() {
                var me = this;

                MonthCalendar.active = me;

                me.render(me.currentDate);
                me.$calendar.showLayer().focus();
                me.trigger(MonthCalendar.ON_SHOWCALENDAR, [me.$calendar]);
            },

            /**
             * 달력숨김
             */
            hide: function() {
                var me = this;

                this.$calendar.hide();
                me.trigger(MonthCalendar.ON_HIDECALENDAR, [me.$calendar]);
            },

            /**
             * 달력삭제
             */
            close: function(){
                var me = this;

                $doc.off('click' + me._eventNamespace);
                me.hide();
                me.$calendar.off().remove();
                MonthCalendar.active = null;
            },

            /**
             * 달력 렌더링
             * @param {Date} date 렌더링시 기준 날짜
             */
            render: function(date) {
                var me = this,
                    html = '',
                    title = me.options.title,
                    year = date.getFullYear(),
                    limitDate = parseInt(dateUtil.format(me.limitDate, 'yyyyMM'), 10),
                    endDate = parseInt(dateUtil.format(me.endDate, 'yyyyMM'), 10),
                    getCaption = function() { return me.options.getCaption.apply(me, arguments); },
                    getTitle = function() { return me.options.getTitle.apply(me, arguments); },
                    curr, isOn

                for(var i = 1; i <=12; i++) {
                    curr = parseInt(date.getFullYear() + "" + numberUtil.zeroPad(i), 10);
                    isOn = (me.activeDate.getFullYear() === date.getFullYear() && me.activeDate.getMonth() === (i - 1));

                    if (limitDate <= curr && endDate >= curr) {
                        html += '<li><a href="#" data-date="'+curr+'" title="'+getTitle(isOn?'active':'normal', year, i)+'" data-year="'+date.getFullYear()+'" data-month="'+numberUtil.zeroPad(i)+'" class="btn'+(isOn?' on':'')+'"><span class="odd_span"><span class="none">'+year+'년도</span>'+i+'월</span></a></li>';
                    } else {
                        if(limitDate > curr) {
                            // 이전
                            html += '<li class="d_before"><span class="btn disabled"><span><span class="none">'+year+'년도</span>'+i+'월<span class="none">'+getTitle('before', year, i)+'</span></span></span></li>';
                        } else {
                            // 이후
                            html += '<li class="d_nodata"><span class="btn disabled"><span><span class="none">'+year+'년도</span>'+i+'월<span class="none">'+getTitle('after', year, i)+'</span></span></span></li>';
                        }
                    }
                }

                me.$calendar.find('dd.month_calendar>ul').html(html);
                // 날짜 제한에 따른 이전, 다음 버튼 활성화
                if(me.limitDate.getFullYear() === date.getFullYear()) {
                    me.$calendar.find('button.pre').addClass('disabled').prop('disabled', true);
                } else {
                    me.$calendar.find('button.pre').removeClass('disabled').prop('disabled', false);
                }
                if(date.getFullYear() === (new Date()).getFullYear()) {
                    me.$calendar.find('button.next').addClass('disabled').prop('disabled', true);
                } else {
                    me.$calendar.find('button.next').removeClass('disabled').prop('disabled', false);
                }
                me.$calendar.find('span.date').html(date.getFullYear()+'<span class="none">년</span>');
            },

            /**
             * 이전달, 다음달 계산
             * @private
             * @param {Number} 1: 다음달, -1: 이전달
             * @return {JSON} 월간 정보
             */
            _calc: function(n){
                var me = this,
                    date;

                me._configure();
                me.activeDate.setMonth( me.activeDate.getMonth() + n );
                date = dateUtil.format(me.activeDate, 'yyyyMM');

                var value = {
                    date: date,
                    year: me.activeDate.getFullYear()+"",
                    month: numberUtil.zeroPad(me.activeDate.getMonth() + 1),
                    isFirstDate: date === dateUtil.format(me.limitDate, 'yyyyMM'),
                    isLastDate: date === dateUtil.format(me.endDate, 'yyyyMM')
                };

                // 변경된 날짜를 버튼에 셋팅
                me.$el.attr('data-active-date', value.date);
                return value;
            },

            /**
             * 이전달
             * @return {JSON} 이전달 정보
             */
            prev: function() {
                return this._calc(-1);
            },

            /**
             * 다음달
             * @return {JSON} 다음달 정보
             */
            next: function() {
                return this._calc(1);
            }

        });

        // 달력 모듈이 한번이라도 호출되면, 이 부분이 실행됨, 달력 모듈이 단 한번도 사용안하는 경우도 있는데,
        // 무조건 바인딩시켜놓는건 비효율적인 듯 해서 이와 같이 처리함
        MonthCalendar.onClassCreate = function() {

            WEBSVC.PubSub.on('hide:modal', function() {
                MonthCalendar.active&&MonthCalendar.active.close();
            });

        };

        WEBSVC.bindjQuery(MonthCalendar, 'monthCalendar');
        return MonthCalendar;
    });

    // 아티스트 파인더 모듈
    WEBSVC.define('PBPGN.ArtistFinder', function() {

        // 장르 목록 수정 및 추가 140203_수정
        // 각 장르에 해당하는 세부장르 셋팅
        // 가요 : 0101, 팝 : 0201, OST : 0301, , 일렉트로니카/클럽뮤직 : 1401, 록/메탈 : 1501, R&amp;B/Soul : 1601, 랩/힙합 : 1701, 인디음악 : 1801, 트로트 : 1901, 일본음악 : 0401, 클래식 : 0501, 재즈 : 0901, 뉴에이지 : 0801, 어린이 : 0701, 태교 : 2001, CCM : 0601, 종교음악 : 1101, 국악 : 1201, 중국음악 : 1301, 월드 : 1001,
        var genres = {
            '0101': [{'cd': '0102', 'name': '발라드'}, {'cd': '0103', 'name': '댄스'},{'cd': '0104', 'name': '랩/힙합'},{'cd': '0105', 'name': 'R&B/Soul'},{'cd': '0106', 'name': '록'},{'cd': '0107', 'name': '일렉트로니카'},{'cd': '0108', 'name': '트로트'},{'cd': '0109', 'name': '포크'},{'cd': '0110', 'name': '인디음악'}],
            '0201': [{'cd': '0202', 'name': '팝'},{'cd': '0203', 'name': '록'},{'cd': '0204', 'name': '얼터너티브록'},{'cd': '0205', 'name': '하드록'},{'cd': '0206', 'name': '모던록'},{'cd': '0207', 'name': '헤비메탈'},{'cd': '0208', 'name': '뉴메탈/하드코어'},{'cd': '0209', 'name': '프로그레시브/아트록'},{'cd': '0210', 'name': '일렉트로니카'},{'cd': '0211', 'name': '클럽뮤직'},{'cd': '0212', 'name': '랩/힙합'},{'cd': '0213', 'name': 'R&amp;B/Soul'},{'cd': '0214', 'name': 'Urban'},{'cd': '0215', 'name': '올디스'},{'cd': '0216', 'name': '포크'},{'cd': '0217', 'name': '블루스'},{'cd': '0218', 'name': '컨트리'},{'cd': '0219', 'name': '월드팝'}],
            '0301': [{'cd': '0301', 'name': '국내영화'},{'cd': '0302', 'name': '국외영화'},{'cd': '0303', 'name': '국내드라마'},{'cd': '0304', 'name': '국외드라마'},{'cd': '0305', 'name': '애니메이션/게임'},{'cd': '0306', 'name': '국내뮤지컬'},{'cd': '0307', 'name': '국외뮤지컬'}],
            '1401': [{'cd': '1402', 'name': '국내'},{'cd': '1403', 'name': '국외'},{'cd': '1404', 'name': '일렉트로니카'},{'cd': '1405', 'name': '클럽뮤직'}],
            '1501': [{'cd': '1501', 'name': '국내'},{'cd': '1502', 'name': '국외'},{'cd': '1503', 'name': '모던/얼터너티브록'},{'cd': '1504', 'name': '팝메탈/하드록/아트록'},{'cd': '1505', 'name': '뉴메탈/하드코어'},{'cd': '1506', 'name': '인디'}],
            '1601': [{'cd': '1601', 'name': '국내'},{'cd': '1602', 'name': '국외'},{'cd': '1603', 'name': 'R&amp;B'},{'cd': '1604', 'name': 'Soul'},{'cd': '1605', 'name': 'Urban'}],
            '1701': [{'cd': '1701', 'name': '국내'},{'cd': '1702', 'name': '국외'},{'cd': '1703', 'name': '팝랩'},{'cd': '1704', 'name': '갱스터/하드코어랩'},{'cd': '1705', 'name': '90년대 힙합'}],
            '1801': [{'cd': '1801', 'name': '어쿠스틱 스타일'},{'cd': '1802', 'name': '록 스타일'},{'cd': '1803', 'name': '일렉트로닉 스타일'},{'cd': '1804', 'name': '언더그라운드 힙합'}],
            '1901': [{'cd': '1902', 'name': '신세대 트로트'},{'cd': '1903', 'name': '전설의 트로트'},{'cd': '1904', 'name': '묻지마 관광 뽕짝'},{'cd': '1905', 'name': '메들리 돌리고~돌리고~'}],
            '0401': [{'cd': '0402', 'name': 'J-POP'},{'cd': '0403', 'name': 'J-Rock'},{'cd': '0404', 'name': '일렉트로니카'},{'cd': '0405', 'name': '랩/힙합'},{'cd': '0406', 'name': 'R&amp;B/Soul'},{'cd': '0407', 'name': '시부야케이'},{'cd': '0408', 'name': '뉴에이지'},{'cd': '0409', 'name': '재즈'}],
            '0501': [{'cd': '0501', 'name': '관현악곡'},{'cd': '0502', 'name': '교향곡'},{'cd': '0503', 'name': '실내악'},{'cd': '0504', 'name': '협주곡'},{'cd': '0505', 'name': '독주곡'},{'cd': '0506', 'name': '오페라'},{'cd': '0507', 'name': '크로스오버'},{'cd': '0508', 'name': '현대음악'},{'cd': '0509', 'name': '성악/합창곡'},{'cd': '0510', 'name': '발레/무용곡'}],
            '0901': [{'cd': '0902', 'name': '애시드 재즈'},{'cd': '0903', 'name': '밥'},{'cd': '0904', 'name': '보사노바'},{'cd': '0905', 'name': 'J-Jazz'},{'cd': '0906', 'name': '라틴재즈'},{'cd': '0907', 'name': '빅밴드/스윙'}],
            '0801': [{'cd': '0801', 'name': '이지 리스닝'},{'cd': '0802', 'name': 'J-Newage'},{'cd': '0803', 'name': '기능성 음악'},{'cd': '0804', 'name': '뉴에이지 피아노'}],
            '0701': [{'cd': '0701', 'name': '동요세상'},{'cd': '0702', 'name': '동화나라'},{'cd': '0703', 'name': '만화잔치'},{'cd': '0704', 'name': '영어마을'},{'cd': '0705', 'name': '어린이클래식'}],
            '2001': [{'cd': '2001', 'name': '엄마, 아빠와 함께'},{'cd': '2002', 'name': '아가를 위한 클래식'},{'cd': '2003', 'name': '릴렉싱 &amp; 힐링'}],
            '0601': [{'cd': '0601', 'name': '국내CCM'},{'cd': '0602', 'name': '국외CCM'},{'cd': '0603', 'name': '워십'},{'cd': '0604', 'name': '찬송가'},{'cd': '0605', 'name': '성가'},{'cd': '0606', 'name': '연주곡'},{'cd': '0607', 'name': '어린이'}],
            '1101': [{'cd': '1102', 'name': '불교음악'},{'cd': '1103', 'name': '가톨릭음악'}],
            '1201': [{'cd': '1201', 'name': '국악 크로스오버'},{'cd': '1202', 'name': '국악가요'},{'cd': '1203', 'name': '민요'},{'cd': '1204', 'name': '판소리/단가'},{'cd': '1205', 'name': '풍물/사물놀이'}],
            '1301': [{'cd': '1302', 'name': 'C-Pop'},{'cd': '1303', 'name': 'C-Rock'}],
            '1001': [{'cd': '1002', 'name': '샹송'},{'cd': '1003', 'name': '칸초네'},{'cd': '1004', 'name': '켈릭/아이리시'},{'cd': '1005', 'name': '브라질'},{'cd': '1006', 'name': '탱고/플라멩코'},{'cd': '1007', 'name': '라틴'},{'cd': '1008', 'name': '레게'},{'cd': '1009', 'name': '파두'}]
        },
        isTouch = WEBSVC.isTouch;


        // 연대 슬라이더 클래스(private)
        var PeriodSlider = Class({
            $extend: MELON.PBPGN.View,
            name: 'PeriodSlider',
            defaults: {
                width: 588, // 총너비
                distance: 84,   // 눈금당 간격
                items: [0, 1960, 1970, 1980, 1990, 2000, 2010, 2020],
                startYear: 0,
                endYear: 2020
            },
            selectors: {
                btnMin:'div.yearlk_bar.last',           // 연대 왼쪽버튼
                btnMax: 'div.yearlk_bar.start',         // 연대 오른쪽 버튼
                sliderBar: 'div.yearlk_bar.bar_year'
            },
            initialize: function(el, options) {
                var me = this;

                if(me.supr(el, options) === false) { return; }

                me.$btnMin.css('zIndex', 101);
                me.$btnMax.css('zIndex', 100);

                me._moveX = me._downX = me._currX = 0;  // 드래그앤드롭을 위한 속성값
                me._isMouseDown = false;
                me.$activeBtn = me.$lastMovedBtn = null;        // 현재 드래그중인 버튼, 마지막으로 움직인 버튼을 기억하기 위함
                me._currStartLeft = parseInt(me.$btnMin.css('width'), 10);  // 왼쪽버튼의 위치(너비값으로 위치 조절)
                me._currEndLeft = parseInt(me.$btnMax.css('width'), 10);    // 오른쪽버튼의 위치(너비값으로 위치 조절)
                me._maxWidth = me.options.width;

                // 년대 링크를 클릭할 때 해당 위치로 이동
                me.on('click', 'div.yearlk_text>a', function(e) {
                    e.preventDefault();

                    var left = $(this).index() * me.options.distance,
                        diffMin = Math.abs(me._currStartLeft - left),
                        diffMax = Math.abs(me._currEndLeft - left);

                    if(me._currStartLeft > left) {
                        me.$activeBtn = me.$btnMin;
                    } else if(me._currEndLeft < left){
                        me.$activeBtn = me.$btnMax;
                    } else if(diffMin > diffMax) {
                        me.$activeBtn = me.$btnMax;
                    } else if(diffMin < diffMax) {
                        me.$activeBtn = me.$btnMin;
                    } else if(me.$lastMovedBtn) {
                        me.$activeBtn = me.$lastMovedBtn;
                    } else {
                        return;
                    }

                    me._move(left);
                    me.$activeBtn = null;
                });

                // 드래그 시작
                me.on('mousedown touchstart', 'div.last>div.sel, div.start>div.sel', function(e) {
                    e.preventDefault();
                    if(isTouch){
                        e.stopPropagation();
                    }

                    me._isMouseDown = true;
                    me._currX = parseInt($(this).parent().css('width'), 10);
                    me._downX = me._getX(e);
                    me.$activeBtn = $(this).parent();

                    return false;
                }).on('keydown', 'div.yearlk_bar div.sel', function(e){
                    //좌우 버튼
                    var $btn = $(this).parent(),
                        left = parseInt($btn.css('width'), 10);

                    switch(e.keyCode){
                    case 37: // left
                        left -= me.options.distance;
                        break;
                    case 39:    // right
                        left += me.options.distance;
                        break;
                    }
                    me.$activeBtn = $btn;
                    me._move(left);
                    me.$activeBtn = null;
                });

                // 드래그 종료
                $doc.on('mouseup.artistfinder touchend.artistfinder mousemove.artistfinder touchmove.artistfinder', function(e){
                    if(!me._isMouseDown){ return; }

                    switch(e.type){
                    case 'mouseup':
                    case 'touchend':
                        me._isMouseDown = false;
                        me._moveX = 0;
                        // 드래그가 끝났을 때, 해당 위치에서 가장 가까운 눈금으로 이동
                        me._fixPos();

                        me.$activeBtn = null;
                        break;
                    case 'mousemove':
                    case 'touchmove':
                        me._moveX = me._getX(e);
                        me._move(me._currX - (me._downX - me._moveX));

                        e.preventDefault();
                        break
                    }
                });

                me.init();
            },

            // 초기화 함수
            init: function() {
                var me = this;

                me.moveByYear(me.options.startYear, me.options.endYear);
            },

            // 마우스 이벤트로부터 x좌표 추출
            _getX: function(e) {
                if(isTouch && e.originalEvent.touches){
                    e = e.originalEvent.touches[0];
                }
                return e.pageX;
            },

            // 현재 활성화된 버튼을 left위치로 이동
            _move: function(left) {
                var me = this,
                    distance = me.options.distance;

                if(!me.$activeBtn){ return; }

                if(me.$activeBtn.hasClass('last')){
                    if(left >= me._currEndLeft - distance){
                        left = me._currEndLeft - distance;
                    } else if(left < 0){
                        left = 0;
                    }
                    me._currStartLeft = left;
                } else {
                    if(left < me._currStartLeft + distance){
                        left = me._currStartLeft + distance;
                    } else if(left > me._maxWidth){
                        left = me._maxWidth;
                    }
                    me._currEndLeft = left;
                }
                me.$lastMovedBtn = me.$activeBtn.css('width', left);
            },

            // 주어진 년대에 해당하는 위치에 버튼을 옮김
            moveByYear: function(startYear, endYear){
                var me = this,
                    distance = me.options.distance,
                    startIdx = WEBSVC.array.indexOf(me.options.items, startYear),
                    endIdx = WEBSVC.array.indexOf(me.options.items, endYear);

                if(startIdx > 0) {
                    me.$activeBtn = me.$btnMin;
                    me._move(startIdx * distance);
                }
                if(endIdx > 0) {
                    me.$activeBtn = me.$btnMax;
                    me._move(endIdx * distance);
                }
                me.$activeBtn = null;
            },

            // 버튼이 놓여진 위치에서 가장 가까운 눈금의 위치로 이동
            _fixPos: function() {
                var me = this,
                    distance = me.options.distance;
                if(!me.$activeBtn){ return; }

                var left = parseInt(me.$activeBtn.css('width'), 10);

                left = (Math.round(left / distance) * distance);
                me._move(left);
            },

            // 년대값을 조합해서 반환
            getValue: function() {
                var me = this,
                    distance = me.options.distance,
                    items = me.options.items,
                    startIndex = Math.round(me._currStartLeft / distance),
                    endIndex = Math.round(me._currEndLeft / distance),
                    startTitle = '',
                    endTitle = '',
                    value = [],
                    isSelected = false;

                if(startIndex !== 0 || endIndex !== items.length - 1) {
                    isSelected = true;
                    startTitle = startIndex === 0 ? items[1] + ' 이전' : items[ startIndex ];
                    endTitle = endIndex === items.length - 1 ? items[ items.length - 2] + ' 이후' : items[ endIndex ];

                    for(var i = startIndex; i <= endIndex; i++) {
                        value.push(items[i]);
                    }
                }

                return {
                    'isYearSelected': isSelected,           // 년대가 변경되었는가...(두 버튼이 양쪽끝에 위치해 있으면 변경이 없었던 걸로 판단)
                    'startYear': startTitle,
                    'endYear': endTitle,
                    'startTitle': startTitle,
                    'endTitle': endTitle,
                    'years': value                              // 시작년대와 마지막년대 사이의 년대를 배열로 조합
                }
            }
        });

        /**
         * 아티스트파인더 검색영역 담당클래스
         * @class
         * @name MELON.PBPGN.ArtistFinder
         * @extends MELON.PBPGN.View
         */
        var ArtistFinder = Class(/** @lends MELON.PBPGN.ArtistFinder# */{
            $extend:MELON.PBPGN.View,
            $statics: {
                ON_SEARCH: 'artistfindersearch'
            },
            name: 'ArtistFinder',
            defaults: {

            },
            selectors: {

            },
            events: {
                // 성별, 활동유현, 국적 선택시
                'click dl:not(.gnr) input:radio:not(:disabled)': function(e) {
                    var me = this,
                        $radio = $(e.target);

                    $radio.parent().activeRow('on');
                    me.triggerHandler(ArtistFinder.ON_SEARCH, [me.getValue(), me.getPeriodValue()]);
                },
                // 장르 선택시 세부장르 표시
                'click dl.gnr input:radio:not(:disabled)': function(e) {
                    var me = this,
                        $radio = $(e.target),
                        $dd = me.$el.find('dl.gnr_dtl>dd'), // 리스트 영역
                        html = '', key = '', name = '';;

                    $dd.find('>label').remove();
                    if(genres[$radio.val()]) {
                        // 세부장르가 있느냐
                        $dd.find('>div.finder_wrong').hide();

                        html += ['<label class="on"><input type="radio" name="genreCd" value="'+$radio.val()+'" class="input_radio" checked="checked" />',
                                '<span class="text">전체</span></label>'].join('');

                        $.each(genres[$radio.val()], function(i, item) {
                            html += ['<label><input type="radio" name="genreCd" value="'+item.cd+'" class="input_radio" />',
                                    '<span class="text">'+item.name+'</span></label>'].join('');

                        });
                        $dd.append(html);
                    } else {
                        // 세부장르가 없느냐

                        $dd.find('>div.finder_wrong').show();
                        html += ['<label style="display:none;"><input type="radio" name="genreCd" value="'+$radio.val()+'" class="input_radio" checked="checked" /></label>'].join('');
                        $dd.append(html);
                    }

                    $radio.parent().activeRow('on');
                    me.triggerHandler(ArtistFinder.ON_SEARCH, [me.getValue()]);
                }
            },
            /**
             * 생성자
             * @param {String|Element|jQuery} el 해당 엘리먼트(노드, id, jQuery 어떤 형식이든 상관없다)
             * @param {Object} options 옵션값
             */
            initialize: function(el, options) {
                var me = this;

                if(me.supr(el, options) === false) { return; }

                // 연대 슬라이더 생성
                me.periodSlider = new PeriodSlider(me.options.periodSelector);

                // 연대적용 버튼 클릭시
                me.$el.find('button.btn_big.calendar').on('click', function(){
                    me.triggerHandler(ArtistFinder.ON_SEARCH, [me.getValue(), me.getPeriodValue()]);
                });


                //start: 20140208: mhover
                me.$el.find('.wrap_finder_cnd').mouseHover('label');
                //end: 20140208: mhover
            },

            /**
             * 선택된 라디오들의 값을 조합해서 반환
             * @return {JSON}
             */
            getValue: function(){
                var me = this,
                    data = {};

                me.$el.find('input:radio:checked:not(:disabled)').each(function(){
                    var $radio = $(this);
                    data[ $radio.attr('name') ] = $radio.val();
                });
                return data;
            },

            /**
             * 연대값 반환
             * @return {JSON}
             */
            getPeriodValue: function() {
                var me = this;

                return me.periodSlider.getValue()
            },

            /**
             * 선택된 값들의 텍스트를 배열에 담아 반환, 연대는 시작연대~마지막연대 로 담겨짐
             * @return {Array}
             */
            getSearchTitles: function() {
                var me = this,
                    titles = [],
                    periodValue = me.periodSlider.getValue();

                me.$el.find('input:radio:checked:not(:disabled)').each(function(){
                    if(this.value === '') { return; }

                    var $radio = $(this),
                        title = $radio.next().text();
                    title && titles.push( title );
                });

                if(periodValue.isYearSelected) {
                    titles.push( periodValue.startTitle + '~' + periodValue.endTitle )
                }
                return titles;
            },

            /**
             * 소멸자
             */
            destroy: function(){
                var me = this;

                me.periodSlider.destroy();
                me.periodSlider = null;
                me.supr();
            }
        });

        WEBSVC.bindjQuery(ArtistFinder, 'artistFinder');

        return ArtistFinder;
    });

    // 년월일 셀렉트 박스
    WEBSVC.define('PBPGN.DatePulldown', function() {
        var dateUtil = WEBSVC.date;

        /**
         * 년월일 셀렉트박스
         * @class
         * @name MELON.PBPGN.DatePulldown
         * @extends MELON.PBPGN.View
         * @example
         * $('select.d_name').datePulldown({year: 'select.d_year', month: 'select.d_month'});
         */
        var DatePulldown = Class(/** @lends MELON.PBPGN.DatePulldown# */{
            name: 'DatePulldown',
            $extends: MELON.PBPGN.View,
            $statics: {
                ON_CHANGE: 'change'
            },
            /**
             * 생성자
             * @param {String|Element|jQuery} el 해당 엘리먼트(노드, id, jQuery 어떤 형식이든 상관없다)
             * @param {Object} options 옵션값
             */
            initialize: function(el, options) {
                options || (options = {});
                if(!options.year || !options.month){ return; }

                var me = this, $year, $month;

                $year = $(options.year);
                if($year.length === 0) { return; }

                $month = $(options.month);
                if($month.length === 0) { return; }

                if(me.supr(el, options) === false) { return; }

                $year.add($month).on('change', function() {
                    me.$el[0].options.length = 1;

                    var year = $year.val(),
                        month = $month.val(),
                        days = 0;

                    if(year && month) {
                        days = dateUtil.daysInMonth(year, month);
                        for(var i = 1; i <= days; i++) {
                            me.$el[0].options[i] = new Option(i, i);
                        }
                    }

                    me.$el.selectbox('update');
                });
                $year.triggerHandler('change');
            }
        });

        WEBSVC.bindjQuery(DatePulldown, 'datePulldown');

        return DatePulldown;
    });

})(window, jQuery, MELON.WEBSVC);

(function (context, $, WEBSVC, PBPGN, undefined) {
    "use strict";
    /* jshint expr: true, validthis: true */

    var $win = WEBSVC.$win,
        $doc = WEBSVC.$doc,
        Class = WEBSVC.Class,
        logger = window.logger,

        Cookie = WEBSVC.Cookie,
        Base64 = WEBSVC.Base64;

    /**
     * 멜론사이트의 url들을 담고 있는 모듈
     * @namespace
     * @name MELON.WEBSVC.Urls
     */
    WEBSVC.define('WEBSVC.Urls', /** @lends MELON.WEBSVC.Urls */{
        /**
         * 루트 도메인 반환
         * @return {String} 루트도메인
         */
        getRoot: function () {
            return window.location.protocol + '//' + window.location.host + '/';
        },

        /*
         * 쿼리스트링과 해쉬를 제거한 url를 반환
         * @return {String}
         */
        getPageUrl: function () {
            return document.location.protocol + '//' + document.location.host + document.location.pathname;
        },

        /*
         * css 위치
         * @return {String}
         */
        getCSS: function(file) {
            return '/resource/style/web/' + (file || '');
        },

        /*
         * script 위치
         * @return {String}
         */
        getScript: function(file) {
            return '/resource/script/web/' + (file || '');
        },

        /*
         * blank image 경로
         * @return {String}
         */
        getBlankImage: function() {
            return '/resource/images/common/blank.gif';
        },

        /*
         * 모바일 사이트 경로
         * @return {String}
         */
        getMobile: function() {
            return 'm.melon.com';
        },

        /*
         * 로그인 페이지 경로
         * @return {String}
         */
        getLogin: function(r) {
            return '/login.do?r=' + encodeURIComponent(r || '/');
        },

        /*
         * 팝업로그인 페이지 경로
         * @return {String}
         */
        getLoginPop: function(r) {
            return '/login.do?r=' + encodeURIComponent(r || '/');
        }
    });

    /**
     * @namespace
     * @name MELON.WEBSVC.Auth
     */
    WEBSVC.define('WEBSVC.Auth', /** @lends MELON.WEBSVC.Auth */{
        /**
         * 멜론 로그인 여부
         * @return {Boolean}
         */
        isMelonLogin: function() {

            var memberKey = Cookie.getMUACHeader("memberKey");
            if (typeof memberKey === "undefined" || memberKey.length <= 0) { return false; }
            return true;
        },

        /**
         * 회원키
         * @return {String}
         */
        getMemberKey: function() {

            return Cookie.getMUACHeader("memberKey");
        },

        /**
         * 회원아이디
         * @return {String}
         */
        getMemberId: function() {

            return Cookie.getMHCHeader("memberId");
        },

        /**
         * 회원닉네임
         * @return {String}
         */
        getMemberNickName: function() {
            var strBuf = unescape(decodeURIComponent(Base64.decode(Cookie.get("MUNIK"))));
            if (strBuf === null){ return null; }

            var arrStr = strBuf.split(";");
            return arrStr[0];

        },

        /**
         * 회원나이
         * @return {String}
         */
        getMemberAge: function() {
            return Cookie.getMUACHeader("memberAge");
        },

        /**
         * 회원성별
         * @return {String}
         */
        getMemberSex: function() {

            return Cookie.getMUACHeader("memberSex");

        },

        /**
         * 회원생년원일
         * @return {String}
         */
        getMemberBirthDay: function() {

            var age = Cookie.getMUACHeader("memberAge");
            var curDate = new Date();
            var year = curDate.getYear();
            var birth = year - age + 1;
            return birth + "0101";
        },

        /**
         * 회원 성인여부
         * @return {String} : 0:미성년자, 1:성인 실명인증, 2:성인 실명미인증
         */
        isMemberAdult: function() {
            var memberAge = Cookie.getMUACHeader("memberAge");
            var realNameYn = Cookie.getMUACHeader("realNameYn");
            if (memberAge < 19) {
                return "0";
            } else if (memberAge >= 19 && realNameYn === "Y") {
                return "1";
            } else if (memberAge >= 19 && realNameYn === "N") {
                return "2";
            }
        },

        /**
         * 회원 실명인증여부
         * @return {String} : Y:실명인증회원, N:비실명회원
         */
        isRealNameFlag: function() {
            var realNameYn = Cookie.getMUACHeader("realNameYn");
            if(realNameYn==="Y") {
                return "Y";
            }
            return "N";
        },

        /**
         * 회원 성인인증에대한 비밀번호 옵션
         * @return {String} : 0:비밀번호 옵션설정 안함, 1:비밀번호 옵션시 매번 물어보기, 2:비밀번호 옵션시 자동저장
         */
        isAdultPwdOption: function() {
            var adultPwdOption = Cookie.getMUACHeader("adultPwdOption");
            if(typeof adultPwdOption==='undefined'){
                return "0";
            }
            return adultPwdOption;
        },

        /**
         * 상품유무???
         * @return {Boolean}
         */
        isFreeUser: function() {
            var svcName = Cookie.getMHCHeader("prodId");
            if (typeof svcName === "undefined" || svcName.length <= 0) { return true; }
            return false;
        },

        /**
         * 인증(본인/성인) 플래그 조회
         * @return {String}         :{0, 1, 2, 3, 4, 5}<br>
         *      - 본인확인 인증여부     : X O O O, O, O<br>
         *      - 성인인증 비밀번호 설정여부    : X X O O, X, O<br>
         *      - 성인인증 비밀번호 수동설정    : X X O X, ?, O<br>
         *      - 성인인증 비밀번호 자동설정    : X X X O, ?, X<br>
         *      - 미성년자 여부: ?, X, ?, ?, O, X<br>
         *      - 세션에 한한 인증 여부: ?, ?, ?, ?, ?, O<br>
         */
        getMemberAuthFlg: function(){
            var memberAuthFlg = this.isAdultPwdOption();
            var realNameFlg = this.isRealNameFlag();

            if( memberAuthFlg !== "0" ){        // 비밀번호 옵션 체크

                if(realNameFlg === "N"){        // 본인인증 없이 성인인증 비밀번호 세팅한 경우 예외처리.
                    if(this.isMemberAdult() === "0") {  // 본인인증X, 미성년자O
                        return "6";
                    }
                    return "0";
                }else {
                    if(this.isMemberAdult() === "0"){
                        return "4";
                    }else{
                        if(memberAuthFlg === "1"){
                            var IS_INPUT_AUTHENTICATION_ADULT_PWD = Cookie.get("IS_INPUT_AUTHENTICATION_ADULT_PWD");

                            if(IS_INPUT_AUTHENTICATION_ADULT_PWD === "Y"){
                                return "5";
                            }
                        }
                        return (Number(memberAuthFlg)+1)+"";
                    }
                }
            }else{

                if(realNameFlg === "Y"){
                    if(this.isMemberAdult() === "0") {
                        return "4";
                    }
                    return "1";
                } else {
                    if(this.isMemberAdult() === "0") {  // 본인인증X, 미성년자O
                        return "6";
                    }
                    return "0";
                }
            }
        },

        /**
         * 멜론캐쉬
         * @return {String}
         */
        getMelonCash: function() {
            return Cookie.getMHCHeader("melonCash");
        },

        /**
         * 회원 받은 선물 건수
         * @return {String}
         */
        getMemberGiftCnt: function() {
            return Cookie.getMHCHeader("memberGiftCnt");
        },

        /**
         * 멜론포인트
         * @return {String}
         */
        getMelonPoint: function() {
            return Cookie.getMHCHeader("melonPoint");
        },

        /**
         * 상품아이디
         * @return {String}
         */
        getProdId: function() {
            return Cookie.getMHCHeader("prodId");
        },

        /**
         * 상품명
         * @return {String}
         */
        getProdName: function() {
            return Cookie.getMHCHeader("prodName");
        },

        /**
         * 상품종료일
         * @return {String}
         */
        getProdToDate: function() {
            return Cookie.getMHCHeader("prodToDate");
        },

        /**
         * 자동결재실패 정보
         * Y : 프리클럽 자결실패 , M : MP3 자결실패  변경알림.
         * @return {String}
         */
        getAutoRechargeFail: function() {
            return Cookie.getMHCHeader("autoRechargeFail");
        },

        /**
         * 고객세분화 정보
         * 세그먼트코드|상품아이디|....,세그먼트코드|상품아이디,세그먼트.... .
         * @return {String}
         */
        getSeqmtCode: function() {
            return Cookie.getMHCHeader("seqmtCode");
        },

        /**
         * 비밀번호변경 정보
         * Y 일때 비밀번호변경 알림.
         * @return {String}
         */
        getMemberTempPwdYn: function() {
            return Cookie.getMUACHeader("memberTempPwdYn");
        },

        /**
         * androidCarrier가 0이면 폰번호, 1이면 현재 회원db의 min번호 또는 가상min번호
         * @return {String}
         */
        getAndroidCkMdn: function() {
            return Cookie.getMUADHeader("androidCkMdn");
        },

        /**
         * dcf지원여부( 0:미지원 or 1:지원)
         * @return {String} Y/N
         */
        getAndroidCkDcf: function() {
            return Cookie.getMUADHeader("androidCkDcf");
        },

        /**
         * ??
         * @return {String}
         */
        chkMACAuth: function() {
            var buf = Cookie.get("MAC");

            return (buf === null || buf === '') ? false : true;
        },

        /**
         * ???
         * @return {String}
         */
        chkMUACAuth: function() {
            var buf1 = Cookie.getMUAC();
            return (buf1 === null || buf1 === '') ? false : true;
        }
    });

    /**
     * 페이지 이벤트 바인딩
     * 사이트 전반에 포진되어 있는 기능들이기에 따로 일일이 바인딩하지 않아도 data- 속성만 추가하기만 하면,
     * 자동으로 해당기능들(레이어표시, 펼침/숨기기, 더보기/간략보기)이 작동되도록 해준다.
     * (document 에 델리게이트방식으로 바인딩)
     *
     * @namespace
     * @name MELON.WEBSVC.GlobalEvents
     */
    WEBSVC.define('WEBSVC.GlobalEvents', /** @lends MELON.WEBSVC.GlobalEvents */{
        _$tooltip: $(),
        _inited: false,
        /**
         * 초기화 함수
         */
        init: function () {
            var me = this;

            if (me._inited){ return; }
            me._inited = true;

            me._basic();
            me._dropdown();
            me._tooltip();
            me._checkbox();
            me._expand();
            me._expose();
            setTimeout(function() {  // 20140208 수정
                me._placeholder();
            }, 25); // 20140208 수정
            me._skipNaviFocus();
        },

        /**
         * 레이어닫기, 모달띄우기, 버튼의 pressed효과 와 관련해서 델리게이트 이벤트 바인딩
         * @example
         * // 1. 레이어팝업 닫기 버튼:
         * // 레이어팝업 내의 닫기버튼에 d_close 클래스를 추가해주면, 해당 버튼을 클릭했을 때 소속된 레이어가 닫힌다.
         * // 단, 레이어에 d_layer라는 클래스가 있어야 한다.
         * &lt;div class="d_layer">.....&lt;button class="d_close">닫기&lt;/button>...&lt;/div>
         *
         * // 2. 윕도우팝업의 닫기 버튼
         * // 윈도우 팝업도 레이어팝업에서처럼 버튼에 d_close를 추가해주면 클릭했을 때 팝업이 닫힌다.
         *
         * // 3. 모달띄우가
         * &lt;a href="#modal_id" data-control="modal">숨겨진 모달 띄우기&lt;/a>
         * &lt;a href="/modal/login.do" data-control="modal">ajax 모달 띄우기&lt;/a>
         * &lt;button data-target="#modal_id" data-control="modal">버튼으로 모달 띄우기&lt;/button>
         */
        _basic: function() {
            var me = this;

            // 레이어에 있는 닫기버튼을 클릭했을 때 해당레이어가 닫히도록
            $doc.on('click.globalevents', 'div.d_layer .d_close, div.d_layer .btn_close', function(e) {
                e.preventDefault();
                e.stopPropagation();


                $(this).closest('div.d_layer').hideLayer({focusOpener: true});
            });

            //팝업에서 닫기 버튼을 클릭시 창닫기
            $doc.on('click.globalevents', 'body>div.popup .d_close', function(e) {
                e.preventDefault();
                e.stopPropagation();

                self.close();
            });

            // 모달 띄우기
            $doc.on('click.globalevents', '[data-control=modal]', function(e) {
                e.preventDefault();
                var $el = $(this),
                    target = $el.attr('href') || $el.attr('data-target'),
                    $modal;
                if(target){
                    if(!/^#/.test(target)) {
                        $.ajax({
                            url: target
                        }).done(function(html) {
                            $modal = $('<div class="d_modal_ajax" style="display:none"></div>').html(html).insertAfter($el);
                            $modal.modal({removeOnClose:true});
                        });
                        return;
                    } else {
                        $modal = $(target);
                    }
                } else {
                    $modal = $(this).next('div.layer_popup');
                }

                if($modal && $modal.length > 0) {
                    $modal.modal($modal.data());
                }
            });

            // 버튼 pressed 효과
            $doc.on('mousedown.globalevents mouseup.globalevents mouseleave.globalevents click.globalevents', '.d_btn, .btn, button, a.btn_play_song', function(e) {//140225_마크업 변경관련 mactive 적용
                var $this = $(this);
                if($this.is('a')){
                    /* 140805_수정 */
                    if ($this.attr('href') == '#' || $this.hasClass('directlink')) {
                        e.preventDefault();
                    };
                    /* //140805_수정 */
                }
                if($this.hasClass('disabled')) {
                    $this.removeAttr('onclick');//140529_추가
                    return;
                }

                switch(e.type) {
                case 'mousedown':
                    $this.addClass('mactive');
                    break;
                case 'mouseup':
                case 'mouseleave':
                case 'click':
                    $this.removeClass('mactive');
                    break;
                }
            });

            //start: 20140208_수정: hover 효과 대신해서 스크립트로 .mhover구현
            $doc.on('mouseenter.globalevents mouseleave.globalevents',
                '.d_btn, .btn, button, input , .magazine_box_thum', function(e) {
                var $this = $(this);

                if($this.is(':disabled, .disabled')) {
                    $this.removeClass('mhover', e.type === 'mouseleave');//140425_추가
                    return;
                }

                $this.toggleClass('mhover', e.type === 'mouseenter');
            });

            //140423_수정 반응형 처리 -> respond.js 제거함에 따라 140318_개인화영역 접혀있는 case 보완
            window.MelonPersonal && MelonPersonal.respond && $win.on('resize.respond', (function() {
                var util = WEBSVC.util,
                    $html = $(document.documentElement),
                    isNarrow;
                    var isPersonal;
                return function(){
                    var _isNarrow = util.getWinWidth() < 1280;
                    var _isPersonal = util.getWinWidth() < 1400;
                    // 퍼포먼스를 위해 창의 사이즈가 1280를 기점으로 변할때만 클래스를 토글링

                    if( isNarrow !== _isNarrow ) {
                        $html.toggleClass('narrow-screen', _isNarrow); // 1280보다 작으면
                        isNarrow = _isNarrow;
                    }
                    if(_isPersonal && !_isNarrow){
                        var wid =  1488 - util.getWinWidth(); // 140609 수정
                        $('#util_menu .fold_on').css('right',(wid/2)+7);
                    }else{
                        $('#util_menu .fold_on').css('right',0);
                    }
                };
            })()).trigger('resize.respond');

            //end: 20140208_수정
        },

        /**
         * 드롭다운 띄우기 이벤트 바인딩
         *
         * @example
         * &lt;button data-control="dropdown">
         * &lt;div class="d_notpos">...&lt;/div>        &lt;!-- d_notpos클래스: 강제 위치재조절이 안되도록 하기 위한 옵션 -->
         */
        _dropdown: function () {
            var me = this;

            logger.debug('_dropdown');

            // data-control=dropdown 인 엘리먼트를 클릭했을 때 해당 모달을 띄운다.
            $doc.on('mousedown.globalevents keydown.globalevents', '[data-control=dropdown]', function (e) {
                if(e.type === 'keydown' && e.keyCode !== 13) {
                    return;
                }
                e.preventDefault();

                var $this = $(this);
                if($this.hasClass('disabled') || $this.is(':disabled') || $this.data('dropdown')) { return; }

                e.stopPropagation();
                $this.dropdown('open');
            });
        },

        /**
         * 툴팁 띄우기 이벤트 바인딩
         *
         * @example
         * &lt;button data-hover="tooltip">
         * &lt;div class="d_tooltip">...&lt;/div>
         */
        _tooltip: function () {
            var me = this;

            logger.debug('_tooltip');

            $doc.on('mouseenter.globalevents focusin.globalevents mouseleave.globalevents focusout.globalevents', '[data-control=tooltip]', function () {
                var $btn = $(this);
                if ($btn.data('tooltip')){ return; }

                $btn.tooltip('open');
            });
        },

        /**
         * 전체선택 체크박스
         *
         * @example
         * &lt;table data-checked-class="on">&lt;thead>&lt;tr>&lt;th>
         * &lt;!-- 테이블에 data-checked-class속성을 추가해주면, 체크했을 때 해당 row에 배경이 자동으로 들어간다. -->
         * &lt;input type="checkbox" class="check-all d_checkall">
         * &lt;/th>&lt;/tr>&lt;/thread>&lt;tbody>&lt;tr>&lt;td>&lt;input type="checkbox" ..>..&lt;/td>&lt;/tr>&lt;/tbody>&lt;/table>
         */
        _checkbox: function () {
            var me = this;

            // 전체 선택
            $doc.on('click.globalevents', 'table input:checkbox:not(.d_downall)', function (e) { // 140424_커머스전체선택버튼은 선택되지않도록 수정
                var $check = $(this),
                    $table = $check.closest('table'),
                    $thead = $table.find('>thead'),//140403_추가
                    $tbody = $table.find('>tbody'),
                    $items, activeClass;

                if($check.hasClass('d_checkall')) {
                    $items = $tbody.find('input:checkbox:enabled:visible').checked(this.checked); //.prop('checked', this.checked);
                    if(activeClass = $table.attr('data-checked-class')){
                        $tbody.find('>tr:has(input:enabled)').toggleClass(activeClass, this.checked);
                    }
                } else {
                    if(activeClass = $table.attr('data-checked-class')){
                        $check.closest('tr').toggleClass(activeClass, this.checked);
                    }
                    if(!$thead.find('input:checkbox').is('.d_downall')){//140429_예외추가
                        $thead.find('input:checkbox').removeAttr('checked');//140403_추가
                    }
                }
                e.type = 'checkboxchanged';
                $table.triggerHandler(e);
            });
        },

        /**
         * 펼침/숨기기
         *
         * @example
         * &lt;button data-control="expand">
         * &lt;div class="d_expand">...&lt;/div>
         */
        _expand: function () {
            var me = this;

            logger.debug('_expand');


            $doc.on('click.globalevents', '[data-control=expand]', function (e) {
                e.preventDefault();
                var $this = $(e.currentTarget);

                if($this.data('expander')) { return; }

                $this.expander('toggle');
            });
        },

        /**
         * 더보기/가리기 바인딩
         *
         * @example
         * &lt;button data-control="expose">
         * &lt;div class="d_expose">...&lt;/div>
         */
        _expose: function() {
            var me = this;

            logger.debug('_expose');


            $doc.on('click.globalevents', '[data-control=expose]', function (e) {
                e.preventDefault();
                e.stopPropagation();

                var $this = $(e.currentTarget);

                if($this.data('exposer')) { return; }

                $this.exposer('toggle');
            });
        },

        /**
         * placeholder 기능 바인딩, placeholder를 지원하는 브라우저에서는 무시됨
         *
         * @example
         * $('input').placeholder();
         */
        _placeholder: function() {
            var isSupport = 'placeholder' in MELON.WEBSVC.tmpInput;

            if(isSupport){
                $('input[placeholder], textarea[placeholder]').each(function(){
                    if(this.value === this.getAttribute('placeholder')) { this.value = ''; return; }
                });
            } else {
                $('input[placeholder], textarea[placeholder]').placeholder();
            }
        },

        /**
         * 스킵네비게이션으로 이동했을 때, 해당 영역에 포커싱이 가도록..
         */
        _skipNaviFocus: function(){
            $('#skip_nav').on('click', 'a', function(e) {
                $($(this).attr('href')).attr('tabindex', 0).focus();
            });
        }
    });

    /**
     * GNB
     * @namespace
     * @name MELON.PBPGN.GNB
     */
    WEBSVC.define('PBPGN.GNB.MelonGNB', function() {
        var PBPGN = MELON.PBPGN,
            $doc = WEBSVC.$doc,
            $body = $('body'),
            isTouch = WEBSVC.isTouch,
            $win = WEBSVC.$win,
            util = WEBSVC.util,
            View = PBPGN.View;

        /**
         * GNB부분의 검색카테고리 셀렉트박스 모듈
         * @class
         * @name MELON.PBPGN.GNB.SearchCategory
         * @extends MELON.PBPGN.View
         * @example
         * new SearchCategory('select.d_name', {});
         */
        var SearchCategory = Class(/** @lends MELON.PBPGN.GNB.SearchCategory# */{
            name: 'SearchCategory',
            /**
             * 생성자
             * @param {String|Element|jQuery} el 해당 엘리먼트(노드, id, jQuery 어떤 형식이든 상관없다)
             * @param {Object} options 옵션값
             */
            initialize: function(el, options) {
                var me = this;

                me.$el = $(el);
                me.options = $.extend({}, options);

                me._bindSearchCategory();
            },

            /**
             * 이벤트들을 바인딩
             * @private
             */
            _bindSearchCategory: function(){
                var me = this;

                var $doc = WEBSVC.$doc,
                    timer = null,
                    $searchCategory = me.$el,
                    $selectBox = $searchCategory.find('>span.select_box'),
                    $selectOpen = $searchCategory.find('>div.select_open');

                // 터치기반 디바이스에서 셀렉트박스 안쪽에 클릭했을 때 자동으로 닫히지 않도록 버블링 중지시킴
                WEBSVC.isTouch && me.$el.on('touchend', function(e) { e.stopPropagation(); });

                // 닫힘 이벤트 처리
                $searchCategory.on('closecategory', function(){
                    $selectOpen.removeClass('on');  // on클래스 제거
                    $doc.off('.searchcategory');        // 카테고리 관련 글로벌이벤트 제거
                }).on('click', function(e){
                    e.stopPropagation();        // 버블링 금지(셀렉트박스 내에서 클릭했을 때, 닫히지 않도록...
                    e.preventDefault();
                });

                // 열기 클릭
                $selectBox.on('click', function() {
                    $selectOpen.addClass('on').find('a:first').focus(); // 열릴때 첫번째 항목에 강제포커싱

                    // 셀렉트박스 영역 밖에 클릭했을 때 닫히도록 글로벌이벤트 등록.....
                    $doc.off('.searchcategory').on('click.searchcategory', function(e){
                        if(!$.contains($selectOpen[0], e.target)){ // 클릭된 객체가 셀렉트박스 외부에 위치한 것인가...
                            $searchCategory.triggerHandler('closecategory');
                        }
                    });

                    // 터치기반 디바이스에서 바깥부분을 터치했을 때 닫히도록...
                    WEBSVC.isTouch && $doc.on('touchend.searchcategory', function() {
                        $searchCategory.triggerHandler('closecategory');
                    });
                });

                // 아이템을 클릭했을 경우
                $selectOpen.on('click', 'a', function(e) {
                    e.preventDefault();

                    var $this = $(this),
                        value = $this.data('value');

                    $selectOpen.children('input').val(value); // 히든폼에 선택된 항목의 값을 설정
                    $selectBox.children().text($this.text());   // 선택된 아이템의 텍스트를 라벨에 표시

                    $searchCategory.triggerHandler('closecategory');
                });

                // pc일 경우, 포커싱 핸들러 바인딩(포커스가 셀렉트박스에서 빠져나갈 때 닫히도록...)
                !WEBSVC.isTouch && $selectOpen.on('focusin focusout', 'a', function(e) {
                    e.stopPropagation();

                    switch(e.type){
                    case 'focusin':
                        clearTimeout(timer), timer = null;
                        break;
                    case 'focusout':
                        timer = setTimeout(function(){
                            $searchCategory.triggerHandler('closecategory');
                        }, 300);
                        break;
                    }
                });
            }
        });

        /**
         * GNB부분의 실시간 급상승 키워드 140314_GNB수정
         * @class
         * @name MELON.PBPGN.GNB.RealtimeKeyword
         * @extends MELON.PBPGN.RollingBanner
         * @example
         * new RealtimeKeyword('select.d_name', {});
         */
        var RealtimeKeyword = Class({
            $extend: PBPGN.RollingBanner,
            defaults: {
                btnPlay: '.d_btn_ctrl.play',
                btnPause: '.d_btn_ctrl.pause'
            },
            initialize: function(el, options) {
                var me = this;

                if(me.supr(el, options) === false) { return; }

                me._$items = me.$el.find('li');         // 롤링할 아이템 조회
                if(me._$items.length <= 1) { return; }      // 아이템이 1개 이하면 무시

                me.index = 0;                               // 시작 인덱스
                me.count = me._$items.length;       // 총 아이템 갯수
                me.start();                                 // 롤링 시작

                //140630_수정 롤링영역에 마우스가 오버됐거나 포커스가 들어오면 급상승 키워드 전체 노출.
                me.$el.find('div.keyword_overlay').on('mouseenter focusin mouseleave', function(e){
                    var item = $(this),timerId;

                    switch(e.type) {
                    case 'mouseenter':
                    case 'focusin':
                        item.addClass('active');
                        me.stop();
                        //me.$el.find('ol').css('height',244); 140723_삭제
                        me._$items.stop().css('top',0);
                        /* 140723_삭제
                        me._$items.queue(function(){
                            me.$el.find('li').show();
                        })
                        */
                        me.$el.find('li').css('width','');
                        me.$el.addClass('d_hover');
                        me.$el.find('.ranktitle').removeClass('none');
                        break;
                    case 'mouseleave':
                    //case 'focusout': 140723_삭제
                        /* 140808_modify */
                        clearTimeout(timerId);
                        timerId = setTimeout(function(){
                            item.removeClass('active');
                            if(!item.is('.active')){
                                //me.$el.find('ol').css('height',20); 140723_삭제
                                //me._$items.eq(me.index).show().siblings().hide(); 140723_삭제
                                me.$el.find('.ranktitle').addClass('none');
                                me.$el.removeClass('d_hover');
                                !me.timer && me.start();
                            }
                        },30);
                        /* //140808_modify */
                        //me.$el.focus(); 140723_삭제
                        break;
                    }
                });
                /* 140723_추가 */
                me.$el.siblings().on('click focusin',function(e) {
                    //e.stopPropagation(); 150204_del
                    var item = $('.keyword_overlay'),timerId;

                    item.removeClass('active');
                    clearTimeout(timerId);
                    timerId = setTimeout(function(){
                        if(!item.is('.active')){
                            me.$el.find('.ranktitle').addClass('none');
                            me.$el.removeClass('d_hover');
                            !me.timer && me.start();
                        }
                    },30);
                });
                /* //140723_추가 */
            },
            events: {
                'click .d_btn_ctrl': function(e) {
                    e.preventDefault();
                    var me = this,
                        $this = $(e.currentTarget);
                    if($this.hasClass('pause')){
                        me.stop();
                        me.stopBtn();
                    } else if($this.hasClass('play')){
                        me.start();
                        me.playBtn();
                    }
                }
            },
            /**
             * 롱링 시작
             */
            start: function(){
                var me = this;
                clearInterval(me.timer), me.timer = null;
                me.timer = setInterval(function(){
                    var $curr = me._$items.eq(me.index),
                        nextIndex = (me.index + 1 <= me.count - 1 ? me.index + 1 : 0),
                        $next = me._$items.eq(nextIndex).css({'top': 22}) // 다음 아이템
                        $next.show();

                    $curr.stop().removeClass('on').css('top', 0).animate({top: -22}, { // 140609 수정
                        easing: 'easeInOutQuad',
                        duration: me.options.duration,
                        step: function(now) {
                            $next.css('top', 22 + now);
                        },
                        complete: function(){
                            $curr.hide().css('top', 0); // 가시영역 밖으로 나간 녀석은 hide처리(탭키에 의한 포커스가 가지 않도록...)
                        }
                    });
                    me.index = nextIndex;
                }, me.options.interval); // 3초마다 롤링
            },
            /* 키워드 모두 노출 */
            show: function(){

            },
            /**
             * 롤링 중지
             */
            stop: function(){
                var me = this;
                var $curr = me._$items.eq(me.index);
                me._$items.hide();//140808_modify
                $curr.show().addClass('on');//140808_modify
                clearInterval(me.timer), me.timer = null;
            },
            playBtn:function(){
                var me = this;
                var $btn = me.$el.find(me.options.btnPlay);
                $btn.attr('title', ($btn.attr('title')||'재생').replace('재생', '일시정지')).replaceClass('play', 'pause').children().html(function(){
                    this.innerHTML = this.innerHTML.replace('재생', '일시정지');
                });
            },
            stopBtn:function(){
                var me = this;
                var $btn = me.$el.find(me.options.btnPause);
                $btn.attr('title', ($btn.attr('title')||'일시정지').replace('일시정지', '재생')).replaceClass('pause', 'play').children().html(function(){
                    this.innerHTML = this.innerHTML.replace('일시정지', '재생');
                });
            }
        });

        /**
         * GNB
         * @class
         * @name MELON.PBPGN.GNB.MelonGNB
         * @extends MELON.PBPGN.View
         * @example
         * new MelonGNB('select.d_name', {});
         */
        var MelonGNB = Class(/**@lends MELON.PBPGN.GNB.MelonGNB# */{
            name: 'MelonGNB',
            $extend: View,
            $singleton: true,   // 페이지 내에서 한번만 실행해야 되는 모듈이기에...
            defaults: {
                enterDelay: 200,        // 마우스가 얼마동안 머물렀을 때 표시할텐가..(현재 사용 안함)
                leaveDelay: 400     // 마우스가 떠나고 .4초 이후에 닫히도록...(현재 사용 안함)
            },
            /**
             * 생성자
             * @param {String|Element|jQuery} el 해당 엘리먼트(노드, id, jQuery 어떤 형식이든 상관없다)
             * @param {Object} options 옵션값
             */
            initialize: function(el, options) {
                var me = this;

                if(me.supr(el, options) === false) { return; }

                // 검색 카테고리
                me.searchCategory = new SearchCategory($('#d_search_category'));

                // 메뉴
                me._bindGNBMenu();

                // 소식함 갯수 가져오기
                // start: 131212_수정
                me._getAjaxContents();
                // end: 131212_수정
            },

            /**
             * GNB 메뉴 이벤트 바인딩 140401_GNB수정
             */
            _bindGNBMenu: function() {
                var me = this;

                var $gnbMenu = $('#gnb_menu > ul:eq(0)'),
                    moreLay = $gnbMenu.find('div.more_wrap'),
                    moreLay2 = $gnbMenu.find('.gnr_more');//151207
                var timerID = null;

                //더보기 드롭다운레이어
                /* 140723_삭제
                moreLay.bind('click mouseenter mouseleave',function(e){
                    var $lay = $(this),
                        $li = $lay.parent();
                    switch(e.type){
                        case 'click':
                            moreLay['hide']();
                            $('#header')['removeClass']('more_lay');
                            $li['removeClass']('on');
                            break;
                        case 'mouseenter':
                            $lay.addClass('mhover');
                            break;
                        case 'mouseleave':
                            $lay.removeClass('mhover');
                            break;
                    }
                })
                */

                /* 140522_수정 */
                var moreLiIdx = $('#gnb_menu').find('>ul >li').find('.more_wrap').parents('li').index();//140723_수정
                if (moreLiIdx > 0) {
                    /* 140723_삭제
                    $gnbMenu.find('>li').eq(moreLiIdx).find('>a').bind('click',function(e){
                        e.stopPropagation();
                        e.preventDefault();
                        var $li = $(this).parent();
                            this.focus();
                            moreLay[(!$li.hasClass('on')) ? 'show' : 'hide']();
                            $('#header')[(!$li.hasClass('on')) ?'addClass' : 'removeClass']('more_lay');
                            $li[(!$li.hasClass('on')) ? 'addClass' : 'removeClass']('on');

                            $(this).unbind('focusout');
                            $(this).bind('focusout',function(){
                                if(!$gnbMenu.find('div.more_wrap').hasClass('mhover')){
                                    moreLay['hide']();
                                    $('#header')['removeClass']('more_lay');
                                    $li['removeClass']('on');
                                }
                            })
                    });
                    */
                    /* 140723_추가 */
                    $('#gnb_menu').find('>ul >li')
                    .on('click', function (e) {//150310_modify
                        if ($(this).index() == moreLiIdx) {
                            $('#gnb_menu').find('>ul >li').eq(moreLiIdx).addClass('on');
                        }else {
                            $('#gnb_menu').find('>ul >li').eq(moreLiIdx).removeClass('on');
                        };
                    }).on('mouseleave', function () {
                        $('#gnb_menu').find('>ul >li').eq(moreLiIdx).removeClass('on');
                    });
                    /* //140723_추가 */
                };
                /* //140522_수정 */

                //소식함 갯수영역 mhover
                $('#gnb_menu > ul.sub_gnb > li.mymusic').hover(function(){
                    $(this).addClass('mhover');
                },function(){
                    $(this).removeClass('mhover');
                })

                //140318_2depth 더보기 드롭다운레이어
                /* 140723_삭제
                moreLay2.bind('click mouseenter mouseleave',function(e){
                    var $lay = $(this),
                        $li = $lay.prev().find('>li:last-child > a').parent();
                    switch(e.type){
                        case 'click':
                            moreLay2['hide']();
                            $li['removeClass']('on');
                            break;
                        case 'mouseenter':
                            $lay.addClass('mhover');
                            break;
                        case 'mouseleave':
                            $lay.removeClass('mhover');
                            break;
                    }
                })
                if(moreLay2.is('ul')){
                    moreLay2.prev().find('>li:last-child > a').bind('click',function(e){
                        e.stopPropagation();
                        e.preventDefault();
                        var $li = $(this).parent();
                        this.focus();
                        moreLay2[(!$li.hasClass('on')) ? 'show' : 'hide']();//140331_수정
                        $li[(!$li.hasClass('on')) ? 'addClass' : 'removeClass']('on');//140331_수정

                        $(this).unbind('focusout')
                        $(this).bind('focusout',function(){
                            if(!moreLay2.hasClass('mhover')){
                                moreLay2['hide']();
                                $('#header')['removeClass'](' more_lay');
                                $li['removeClass']('on');
                            }
                        })
                    })

                }*/
                /* 151207 */
                var moreLiIdx2 = $gnbMenu.find('.gnr_more').parents('li').index();
                if (moreLiIdx2 > 0) {
                    var moreLay2Li = moreLay2.prev().find('>li:last-child');
                    moreLay2.prev().find('>li:last-child')
                    .on('click focusin', function () {
                        moreLay2Li.addClass('on');
                        moreLay2.addClass('on');
                    }).siblings()
                    .on('click focusin', function () {
                        moreLay2Li.removeClass('on');
                        moreLay2.removeClass('on');
                    }).parents('li').siblings()
                    .on('click focusin', function () {
                        moreLay2Li.removeClass('on');
                        moreLay2.removeClass('on');
                    });
                    moreLay2
                    .on('focusin mouseenter', function () {
                        moreLay2Li.addClass('on');
                        moreLay2.addClass('on');
                    }).on('mouseleave', function () {
                        moreLay2Li.removeClass('on');
                        moreLay2.removeClass('on');
                    });
                };
                /* //151207 */

                /* 151207 */
                $('.btn_menu_more').on('click',function(e) {
                    if (!$(this).parents('.wrap_gnb_more').hasClass('on')) {
                        $(this).parents('.wrap_gnb_more').addClass('on');
                    }else {
                        $(this).parents('.wrap_gnb_more').removeClass('on');
                    };
                });
                /* //151207 */
            },
            // start: 131212_수정
            /**
             * 소식함 갯수 가져오기
             */
            _getAjaxContents: function() {
                /* 140603_수정 */
                var me = this;
                if(!me.options.contentsUrl && !me.options.bannerUrl && !me.options.newsUrl) { return; }

                //GNB수정 실시간 키워드,개인화영역 배너(로그아웃 상태일 때만 가져온다.)
                $.ajax({
                    url: me.options.contentsUrl
                }).done(function(html) {
                    var $tmp = $('<div style="display:none;"></div>').html( html ),
                        $contents = $tmp.find('>script'),
                        isLogin = isMelonLogin();

                    setTimeout(function(){ // 20140208 수정

                        //140314_GNB수정 실시간 키워드
                        $('#gnb div.realtime_soar_keyword>.title').css('display','inline-block');//140620_추가
                        $('#gnb div.realtime_soar_keyword>div.keyword_overlay>ol').html( $contents.filter('.d_realtime_keyword').html() );

                        // 개인화영역 배너(로그아웃 상태일 때만 가져온다.)
                        !isLogin && $('#id_box div.id_login>div.ban').html( $contents.filter('.d_personal_banner').html() );

                        // 인터렉티브 바인딩
                        //me._bindInteractive(); 150204_del
                        // 실시간 급상승 키워드 150204_add
                        (function($realtimeKeyword) {
                            // 없으면 바인딩 안되도록..(팝업인 경우)
                            if(!$realtimeKeyword || $realtimeKeyword.length === 0) { return; }
                            me.realtimeKeyword = new RealtimeKeyword($realtimeKeyword);
                        })($('#gnb div.realtime_soar_keyword'));

                        $contents.remove(), $contents = null;
                    }, 25); // 20140208 수정
                });
                // 헤더 배너
                $.ajax({
                    url: me.options.bannerUrl
                }).done(function(html) {
                    var $tmp = $('<div style="display:none;"></div>').html( html ),
                        $contents = $tmp.find('>script');
                        //isLogin = isMelonLogin(); // 150204_del
                        //isShow = $contents.filter('.d_news_count').html()!= undefined; // 150204_del

                    setTimeout(function(){ // 20140208 수정
                        // 소식함 갯수 - 로그인 상태일 때만
                        // start: 131213_수정 - 소식함 갯수 기본 숨김상태에서 숫자를 삽입 후 표시
                        //isLogin && isShow &&  $('#gnb_menu ul.sub_gnb span.msg_box span.num').html( $contents.filter('.d_news_count').html() ).parent().show();  //  150204_del
                        // end: 131213_수정

                        //140314_GNB수정 실시간 키워드
                        //$('#gnb div.realtime_soar_keyword>div.keyword_overlay>ol').html( $contents.filter('.d_realtime_keyword').html() ); 150204_del

                        // 헤더 배너
                        $('#gnb div.cmn_banner').html( $contents.filter('.d_gnb_banner').html() );

                        // 개인화영역 배너(로그아웃 상태일 때만 가져온다.)
                        //!isLogin && $('#id_box div.id_login>div.ban').html( $contents.filter('.d_personal_banner').html() );  150204_del

                        // 인터렉티브 바인딩
                        //me._bindInteractive(); 150204_del
                        // 이벤트 배너
                        (function($eventBanner){
                            // 없으면 바인딩 안되도록..(팝업인 경우)
                            if(!$eventBanner || $eventBanner.length === 0) { return; }

                            me.eventBanner = new PBPGN.SimpleBanner($eventBanner, {
                                selectors: {
                                    items: 'a.d_item'
                                },
                                type: 'show',
                                autoStart: false
                            });
                        })($('#gnb div.cmn_banner'));

                        $contents.remove(), $contents = null;
                    }, 25); // 20140208 수정
                });
                // 소식함 갯수 - 로그인 상태일 때만
                if (isMelonLogin()) {
                    $.ajax({
                        url: me.options.newsUrl
                    }).done(function(html) {
                        var $tmp = $('<div style="display:none;"></div>').html( html ),
                            $contents = $tmp.find('>script');
                            //isLogin = isMelonLogin(); 150204_del
                            var isShow = $contents.filter('.d_news_count').html()!= undefined;

                        setTimeout(function(){ // 20140208 수정
                            // 소식함 갯수 - 로그인 상태일 때만
                            // start: 131213_수정 - 소식함 갯수 기본 숨김상태에서 숫자를 삽입 후 표시
                            isShow &&  $('#gnb_menu ul.sub_gnb span.msg_box span.num').html( $contents.filter('.d_news_count').html() ).parent().show();  //  150204_modify
                            // end: 131213_수정

                            // 인터렉티브 바인딩
                            //me._bindInteractive(); 150204_del

                            $contents.remove(), $contents = null;
                        }, 25); // 20140208 수정
                    });
                };
                /* //140603_수정 */
            },

            // 인터렉티브 바인딩
            /* 150204_del
            _bindInteractive: function() {
                var me = this;

                // 실시간 급상승 키워드
                (function($realtimeKeyword) {
                    // 없으면 바인딩 안되도록..(팝업인 경우)
                    if(!$realtimeKeyword || $realtimeKeyword.length === 0) { return; }
                    me.realtimeKeyword = new RealtimeKeyword($realtimeKeyword);
                })($('#gnb div.realtime_soar_keyword')); //140314_수정

                // 이벤트 배너
                (function($eventBanner){
                    // 없으면 바인딩 안되도록..(팝업인 경우)
                    if(!$eventBanner || $eventBanner.length === 0) { return; }

                    me.eventBanner = new PBPGN.SimpleBanner($eventBanner, {
                        selectors: {
                            items: 'a.d_item'
                        },
                        type: 'show',
                        autoStart: false
                    });
                })($('#gnb div.cmn_banner'));
            },
            */
            // end: 131212_수정
            /**
             * 파괴자
             */
            destroy: function(){
                var me = this;

                me.searchCategory.destroy();
                me.realtimeKeyword&&me.realtimeKeyword.destroy();
                me.eventBanner&&me.eventBanner.destroy();
                me.supr();
            }
        });
        return MelonGNB;
    });

    //
    /**
     * 개인화영역
     * @namespace
     * @name MELON.PBPGN.Personal
     */
    WEBSVC.define('PBPGN.Personal.PersonalArea', function() {
        var PBPGN = MELON.PBPGN,
            $doc = WEBSVC.$doc,
            $body = $('body'),
            isTouch = WEBSVC.isTouch,
            $win = WEBSVC.$win,
            util = WEBSVC.util,
            View = PBPGN.View;

        /**
         * 개인화영역의 구분바(사이즈조절바) 모듈
         * @class
         * @name MELON.PBPGN.Personal.VerticalSplitter
         * @extends MELON.PBPGN.View
         * @example
         * new VerticalSplitter('select.d_name', {});
         */
        var VerticalSplitter = Class(/**@lends MELON.PBPGN.Personal.VerticalSplitter# */{
            $extend: View,
            name: 'VerticalSplitter',
            defaults: {
                containerOffset:{top:0, left:0, right:0, bottom:0}  // 컨테이너를 기준으로 드래그 영역 제한하기 위한 값(함수도 가능)
                /*
                // 함수로 하고자 할 경우
                containerOffset: function() {
                    return {top:0, left:0, right:0, bottom:0};
                }
                */
            },
            /**
             * 생성자
             * @param {String|Element|jQuery} el 해당 엘리먼트(노드, id, jQuery 어떤 형식이든 상관없다)
             * @param {Object} options 옵션값
             */
            initialize: function(el, options) {
                var me = this,
                    $clone,
                    isDrag = false;     // 드래그 중인가

                if(me.supr(el, options) === false) { return; }
                me.$con = $(me.options.container);  // 컨테이너

                /* 140626_수정 */
                $clone = me.$el.clone().hide().insertAfter(me.$el).css({'zIndex': 9999, position: 'absolute', opacity: 0, cursor: 'n-resize'});
                me.$el.on('mouseenter', function(e) {
                    $clone.css({'top': me.$el.position().top}).show();
                });
                /* //140626_수정 */

                $clone.draggable({
                    potinter: 'n-resize',
                    axis: 'y',      // y로만 드래깅
                    start: function(e, ui) {
                        if(me.options.clone){
                            $clone.css('opacity', '');
                        }
                        isDrag = true;
                        me.triggerHandler('splittermovestart', [ui])
                    },
                    drag: function(e, ui) {
                        me.triggerHandler('splittermoving', [ui]);
                    },
                    stop: function(e, ui) {
                        if(me.options.clone){
                            $clone.css('opacity', 0);
                        }
                        isDrag = false;
                        me.triggerHandler('splittermoveend', [ui]);
                    }
                }).on('mousedown focusin', function(){
                    var offset = me.$con.offset(),
                        height = me.$con.height(),
                        containerOffset = me.options.containerOffset;

                    if( WEBSVC.isFunction(containerOffset) ){
                        // 드래그 제한영역을 동적으로 계산하기 위해 옵션으로 함수를 넘겨받았을 때
                        // (윈도우 리사이징에 의해 컨테이너의 사이즈가 수시로 변경되므로..)
                        containerOffset = $.extend({}, me.defaults.containerOffset, containerOffset());
                    }
                    // 드래그 영역을 설정
                    $clone.draggable('option', 'containment', [
                        0,
                        offset.top + containerOffset.top,       // 상단 100px로 제한
                        0,
                        offset.top + height - containerOffset.bottom        // 하단 100px로 제한
                    ]);
                });
            }
        });

        /**
         * 커스텀스크롤이 붙은 컨텐츠담당 클래스
         * @class
         * @name MELON.PBPGN.Personal.ScrollView
         * @extends MELON.PBPGN.View
         * @example
         * new ScrollView('select.d_name', {});
         */
        var ScrollView = Class(/**@lends MELON.PBPGN.Personal.ScrollView# */{
            $extend: View,
            name: 'ScrollView',
            /**
             * 생성자
             * @param {String|Element|jQuery} el 해당 엘리먼트(노드, id, jQuery 어떤 형식이든 상관없다)
             * @param {Object} options 옵션값
             */
            initialize: function(el, options) {
                var me = this;

                if(me.supr(el, options) === false) { return; }

                // 스크롤 컨테이너
                me.$scrollView = me.$el.find('div.d_scrollview');
                // 스크롤바
                me.$scrollBar = me.$el.find('div.d_scrollbar');
                // 컨텐츠
                me.$content = me.$el.find('ul.d_scrollcontent');

                me._configure();
                me._isMouseEnter = false;
                me._isMouseDown = false;
                me.isScrollForceHide = false;

                me.$scrollBar.parent().hide();

                if( WEBSVC.isTouch ) {
                    // 터치기반 디바이스일 때, 터치이벤트 바인딩
                    me._bindTouch();
                } else {
                    me._bindMouse();
                }

                me.update();
            },
            /**
             * 마우스기반 디바이스에서는 마우스 이벤트 바인딩
             * @private
             */
            _bindMouse: function() {
                var me = this;

                // 스크롤바 드래그 시작 준비
                me.$scrollBar.on('mousedown', function(e){
                    e.preventDefault();
                    if(isTouch){
                        e.stopPropagation();
                    }

                    me._isMouseDown = true;
                    me._currY = parseInt($(this).css('top'), 10);
                    me._downY = me._getY(e);    // 마우스의 y 위치

                    // 글로벌 이벤트 등록
                    me._bindDocEvent();
                    return false;
                });

                // 스크롤 시, 커스텀스크롤바 위치 조절
                me.$scrollView.on('scroll', function(){
                    if(!me._isMouseDown) { // 마우스휠에 의한 스크롤일 때만 스크롤바 위치 조절
                        me.update();
                    }
                }).on('mousewheel DOMMouseScroll', function(e) {
                    // 마우스 휠로 스크롤링 할때 내부컨텐츠 scrollTop 갱신
                    e.preventDefault();
                    e = e.originalEvent;
                    var delta = e.wheelDelta || -e.detail;

                    me.$scrollView.scrollTop(me.$scrollView.scrollTop() - delta);
                });
                // 탭키로 리스트에 접근했을 때, 스크롤바를 표시....
                // (timer를 쓰는 이유는 포커스가 옮겨질때마다 레이아웃을 새로 그려지는 걸 방지하기 위함으로,
                // ul내부에 포커스가 처음 들어올 때, 마지막으로 빠져나갈 때만 발생한다.)
                me.$content.on('focusin focusout', (function() {
                    var timer = null;
                    return function(e) {
                        clearTimeout(timer), timer = null;
                        if(e.type === 'focusin') {
                            !me._isMouseEnter && (timer = setTimeout(function(){
                                me.$el.triggerHandler('mouseenter');
                            }, 200));
                        } else {
                            me._isMouseEnter && (timer = setTimeout(function(){
                                me.$el.triggerHandler('mouseleave');
                            }, 200));
                        }
                    };
                })());

                me.$el.on('mouseenter mouseleave', function(e){
                    if(e.type === 'mouseenter' && !me.isScrollForceHide){
                        // 마우스가 컨텐츠영역 안으로 들어올 때 스크롤 위치를 계산후, 표시
                        me._isMouseEnter = true;
                        me._configure();
                        me._toggleScrollbar(true);
                    } else {
                        // 마우스가 컨텐츠영역 밖으로 벗어날 때 숨김
                        me._isMouseEnter = false;
                        if(!me._isMouseDown) { me._toggleScrollbar(false); }
                    }
                });
            },

            /**
             * 터치기반 디바이스에서는 터치이벤트 바인딩
             * @private
             */
            _bindTouch: function() {
                var me = this,
                    $con = me.$scrollView,
                    scrollTop = 0,
                    startY = 0;

                $con.find('>ul').on('touchstart touchmove touchend touchcancel', function(e) {
                    var oe = e.originalEvent;
                    if(oe.touches.length != 1) { return; }
                    var touchY = oe.touches[0].pageY;

                    switch(e.type) {
                    case 'touchstart':
                        scrollTop = $con.scrollTop();
                        startY = touchY;
                        break;
                    case 'touchmove':
                        e.preventDefault();
                        e.stopPropagation();
                        $con.scrollTop(scrollTop + (startY - touchY));
                        break;
                    default:
                        break;
                    }
                });
            },

            /**
             * 스크롤바 드래그를 위한 글로벌 이벤트 바인딩
             * @private
             */
            _bindDocEvent: function() {
                var me = this;

                $doc.off('.scrollview').on('mouseup.scrollview touchend.scrollview mousemove.scrollview touchmove.scrollview', function(e){
                    switch(e.type){
                    case 'mouseup':
                    case 'touchend':
                        // 드래그 끝
                        me._isMouseDown = false;
                        me._moveY = 0;

                        $doc.off('.scrollview');
                        if(!me._isMouseEnter) { me._toggleScrollbar(false); }
                        break;
                    case 'mousemove':
                    case 'touchmove':
                        // 드래그 중
                        me._moveY = me._getY(e);
                        me._move(me._currY - (me._downY - me._moveY));

                        e.preventDefault();
                        break
                    }
                });
            },
            /**
             * 현 시점에 컨텐츠 길이와 컨테이너 길이를 바탕으로 스크롤바 사이즈와 위치를 재계산
             * @private
             */
            _configure: function(){
                var me = this;

                me._moveY = 0;
                me._containerHeight = me.$scrollView.height();                                      // 컨테이너 높이
                me._contentHeight = me.$content.innerHeight();                                              // 컨텐츠 높이
                me._scrollRate =  me._containerHeight / me._contentHeight;                      // 스크롤 사이즈 비율
                me._scrollBarHeight = me._containerHeight * me._scrollRate;                     // 스크롤바 크기
                if( me._scrollBarHeight < 20 ) {                                                                // 최소 크기: 20
                    me._scrollRate = (me._containerHeight - (20 - me._scrollBarHeight)) / me._contentHeight;
                    me._scrollBarHeight = 20;
                }
                me._scrollHeight = me._containerHeight - me._scrollBarHeight;                   // 실제 스크롤 영역 크기
                me._contentTop = me.$scrollView.scrollTop();                                            // 현재 컨텐츠의 scrollTop
            },

            /**
             * _configure에서 계산된 값을 바탕으로 스크롤바 위치 조절
             * @private
             */
            _scrollLayout: function(){
                var me = this;
                // 컨텐츠가 컨테이너보다 클 경우에만...
                if(me._contentHeight > me._containerHeight){
                    me.$scrollBar.css({
                        'height': me._scrollBarHeight,
                        'top': Math.min(me._contentTop * me._scrollRate, me._scrollHeight)
                    })
                    .children('div.body').css('height', me._scrollBarHeight - 6);
                }
            },

            /**
             * 스크롤바 표시 토글링
             * @private
             * @param {Boolean} isShow 표시여부
             */
            _toggleScrollbar: function(isShow) {
                var me = this;
                if(me._contentHeight < me._containerHeight){
                    me.$scrollBar.parent().hide();
                } else {
                    me._scrollLayout();
                    me.$scrollBar.parent().toggle(isShow);
                }
            },
            /**
             * 드래그 시 호출되는 함수
             * @private
             * @param {Integer} top 마우스의 y 위치
             */
            _move: function(top) {
                var me = this;

                top = Math.max(0, Math.min(top, me._scrollHeight));

                me.$scrollBar.css('top', top);
                me.$scrollView.scrollTop((me._contentHeight - me._containerHeight) * (top / me._scrollHeight));
            },

            /**
             * 터치이벤트, 마우스이벤트에 따른 y좌표값 반환(_bindDocEvent에서 호출됨)
             * @param {jQuery#Event} e jquery 이벤트
             * @return {Integer}
             */
            _getY: function(e) {
                if(isTouch && e.originalEvent.touches){
                    e = e.originalEvent.touches[0];
                }
                return e.pageY;
            },
            /**
             * 스크롤를 다시 계산하여 표시하기
             */
            update: function(){
                var me = this;

                me._configure();
                me._scrollLayout();

                return this;
            }
        });

        /**
         * 개인화 영역 모듈
         * @class
         * @name MELON.PBPGN.Personal.PersonalArea
         * @extends MELON.PBPGN.View
         * @example
         * new PersonalArea('select.d_name', {});
         */
        var PersonalArea = Class(/** @lends MELON.PBPGN.Personal.PersonalArea# */{
            name: 'PersonalArea',
            $extend: View,
            $singleton: true,
            defaults: {
                expand: false,                  // 초기에 확장시킬 것인가,
                isSaveCookie:   true,           // 쿠키에 저장할 것인가
                wideWidth: 1279,                //1280 이상일때이므로, -1 해줌. 140124 update
                splitterLimit: 100,             // 구분자 제한(상하로)
                narrowMinium: 420,          // 1024이하 모드에서 최소 높이
                narrowMaxium: 900,      // 1024이하 모드에서 최대 높이
                narrowBottom: 56 + 44,  // 56: 하단부분 간격, 44는 개인화영역 top
                wideMinium: 420             // 1024이상 모드에서 최소 높이
            },
            /**
             * 생성자
             * @param {String|Element|jQuery} el 해당 엘리먼트(노드, id, jQuery 어떤 형식이든 상관없다)
             * @param {Object} options 옵션값
             */
            initialize: function(el, options) {
                var me = this;

                if(me.supr(el, options) === false) { return; }
                me._isLogon = me.$el.hasClass('logon');
                if(!me._isLogon){ me.destroy(); return; }

                var $logon = me.$el.find('div.logout'); // 소식함 박스
                me._$expnBox = $('#personal_expn'); // 20140208  $logon.find('>div.expn');        // 화장모드 박스
                me._$foldBox = $('#personal_fold'); // 20140208 $logon.find('>div.fold');            // 축소모드 박스

                if (!$logon.length || !me._$expnBox.length || !me._$foldBox.length) {
                    me.destroy();
                    return;
                }
                me._$topView = $('#personal_news'); // 20140208 수정: $logon.find('div.news_box:first');               // 새로운 소식
                me._$splitter = $('#personal_splitbar'); // 20140208 수정: $logon.find('div.ctrl_bar:first');                  // 구분바
                me._$bottomView = $('#personal_friend'); // 20140208 수정: $logon.find('div.active_friend:first');       // 활동중인 친구
                me._$bottomNone = true; //140513_화면로딩순서 관련 수정
                me._$topBanner = false; //140116_추가
                me._$bottomChk = me._$bottomView.find('div.list_wrap>ul>li');
                me._$topBannerChk = me._$expnBox.prev().find('>a'); //140116_추가

                var _mover = function(){$(this).addClass('hover')},
                    _mout = function(){$(this).removeClass('hover')};

                me._$expnBox.find('.top_area button.btn_icon').hover(_mover,_mout)//140115_추가
                me._$foldBox.find('.id_logout > button.btn_icon').hover(_mover,_mout)//140115_추가

                // 개인화영역의 축소/확장여부에 따라 my_fold클래스가 add/remove 될 엘리먼트들
                me._$layouts = $('#conts_section, #footer, #header_wrap, #util_menu>div.top_right');


                me._rateHeight = 0.6;       // 구분바 위치(비율로) 140117수정
                me._expanHeight = -1;

                me._configure();
                me._createSubControls();
                me._bindExpandToggle();
                me._bindResizable();

                me._isExpand = !!me.options.expand;
                me._isAutoExpand = me.options.autoexpand;


                // 초기에 펼침모드로 열것인가. 140116수정
                if(me._isExpand) {
                    me._loadNews();
                    me._loadActiveFriends();
                    me._layout();
                    me.$el.removeClass('d_fold_off');//140123_추가
                    me.expand();
                }else{
                    me.$el.addClass('d_fold_off');//140123_추가
                    me.collapse();
                }
            },

            /**
             * 확장/ 축소
             * @private
             */
            _bindExpandToggle: function() {//140331_버튼클릭시에만 캐쉬에 모드가 저장되도록 수정
                var me = this;

                // 개인화 영역 펼침/숨기기
                me.$el.on('click', 'button.d_expand, button.d_collapse', function(e){
                    var isExpand = $(this).hasClass('d_expand');

                    // 축소/확장 모드가 변경 시 viewmodechanged 이벤트 발생
                    me._isExpand = isExpand;
                    me.$el.triggerHandler('viewmodechanged', [isExpand]);
                    //140429_1024이하 해상도 캐쉬처리 관련 추가
                    if(MelonPersonal.isVexpand){
                        MelonPersonal.isVexpand = false;
                    }
                }).on('viewmodechanged', function(e, isExpand) {
                    // 모드가 변환될 때 발생되는 이벤트에 핸들러 바인딩

                    /* 140403_수정 반응형 131206 - 폴더 on/off로 수정 */
                    if(!isExpand && me._isUtilCtrl){
                        var wid =  1488 - me._winWidth; //140609 수정
                        $('#util_menu .top_right').css('right',(wid/2)+7);
                    }else{
                        $('#util_menu .top_right').css('right',0);
                    }
                    if (me._isWideScreen) { // 1280이상
                        if ( !isExpand ) { me._$layouts.removeClass('my_fold').replaceClass('fold_off', 'fold_on');  }      // 접힘
                        else { me._$layouts.removeClass('my_fold').replaceClass('fold_on', 'fold_off');  }      // 펼침
                    } else { // 1280 이하
                        //me._$layouts.removeClass('fold_off fold_on').addClass('my_fold');
                        me._$layouts.removeClass('my_fold').replaceClass('fold_off', 'fold_on');
                    }

                    /* 140820_modify */
                    if (!$('#wrap').hasClass('event_gnb')) {
                        me._$expnBox.attr('style', 'display: '+(isExpand?'block':'none')+' !important;');
                        me._$foldBox.attr('style', 'display: '+(!isExpand?'block':'none')+' !important;');
                    };
                    /* //140820_modify */

                    if ( isExpand ) {
                        me.newsList.isScrollForceHide = false; // 스크롤바 표시 플래그 초기화
                        me._layout();
                        me.$el.removeClass('d_fold_off')//140123_추가
                        !me._isLoadedNews && setTimeout(function(){
                            me._loadNews();
                        }, 0); // freezing 현살 때문에 쓰레드(?)로 가져옴
                        //140318_수정
                        !me._isLoadActiveFriends && setTimeout(function(){
                            me._loadActiveFriends();
                        }, 0);
                    }else{
                         me.$el.addClass('d_fold_off')//
                    }

                    // 모드를 쿠키에 저장
                    //140429_1024이하 해상도 캐쉬처리 관련 추가
                    if(MelonPersonal.isVexpand){
                        isExpand = true;
                        me._isExpand = true;
                    }
                    var option = [];
                    option.domain = 'melon.com';
                    me.options.isSaveCookie && WEBSVC.Cookie.set('personalexpand', isExpand ? 'true' : 'false', option);
                    WEBSVC.PubSub.trigger('personalmodechanged', [isExpand]);
                });
            },

            /**
             * 새로운 소식, 구분바 객체 생성 및 이벤트 바인딩
             * @private
             */
            _createSubControls: function() {
                var me = this;

                // 컨텐츠 영역
                me.newsList = new ScrollView(me._$topView);
                // 구분바
                me.splitter = new VerticalSplitter(me._$splitter, {
                    container: me._$expnBox,
                    containerOffset: function() {
                        // 드래그 영역 제한(상하 100)
                        return {
                            top: me._$topView.position().top + 100 + 12, // 12는 top padding값
                            bottom: 100
                        };
                    },
                    clone: false,//140626_수정
                    on: {
                        splittermovestart: function(e, ui) {
                            // 드래그 시작
                            me._expanHeight = me._$expnBox.height();
                            // 드래그 중일 때는 스크롤바가 안보이게...
                            me.newsList.isScrollForceHide = true;
                        },
                        /* 140626_추가 */
                        splittermoving: function(e, ui, options) {
                            // 드래그 중
                            if (!me.splitter.options.clone) {
                                var viewTop = me._$topView.position().top,
                                    conHeight = me._expanHeight - viewTop,
                                    height = ui.position.top - viewTop - 12; // 12는 top padding값

                                me._rateHeight = height / conHeight;                                //
                                me._$topView.css('height', height);                                 // 새로운 소식
                                me._$bottomView.css('height', conHeight - height - 5);      // 활동중인 친구

                                me.newsList.isScrollForceHide = false;
                            };
                        },
                        /* //140626_추가 */
                        splittermoveend: function(e, ui) {
                            // 드래그 끝
                            var viewTop = me._$topView.position().top,
                                conHeight = me._expanHeight - viewTop,
                                height = ui.position.top - viewTop - 12; // 12는 top padding값

                            me._rateHeight = height / conHeight;                                //
                            me._$topView.css('height', height);                                 // 새로운 소식
                            me._$bottomView.css('height', conHeight - height - 5);      // 활동중인 친구

                            me.newsList.isScrollForceHide = false;
                        }
                    }
                });
            },

            /**
             * 확장
             */
             expand: function() {
                this.$el.triggerHandler('viewmodechanged', [this._isExpand]); //140331_기능수정
             },

            /**
             * 축소
             */
            collapse: function() {
                //140429_1024이하 해상도 캐쉬처리 관련 추가
                if (getCookie('personalexpand') != 'false'){
                    MelonPersonal.isVexpand = true;
                }
                this.$el.triggerHandler('viewmodechanged', [false]);
            },

            /**
             * 토글
             * @param {Boolean} isExpand 확장여부
             */
            toggle: function(isExpand) {
                (this._isExpand != isExpand) && this[isExpand ? 'collapse' : 'expand']();
            },

            /**
             * 현재 창의 치수 저장
             * @private
             */
            _configure: function() {
                var me = this;

                me._winHeight = util.getWinHeight();
                me._winWidth = util.getWinWidth();
                me._isWideScreen = me._winWidth > me.options.wideWidth;     // 넓은 화면인지, 좁은화면인지 여부
                //초기
                me._isUtilCtrl = me._winWidth < 1400 && me._isWideScreen; //util 영역 제어가 필요한지
            },

            /**
             * 리사이징 바인드
             * @private
             */
            _bindResizable: function() {
                var me = this;
                // 리사이징 핸들러 등록
                $win.on('resize.personalarea', (function() {
                    var timer,
                        prevHeight = -1,
                        util = WEBSVC.util;

                    return function() {
                        clearTimeout(timer), timer = null;
                        var oldWideMode = me._isWideScreen,
                            oldHeight = me._winHeight;

                        me._configure(); // 현재 창의 치수 저장

                        if( oldWideMode != me._isWideScreen ) {     // 미디어쿼리가 바뀌는 시점이라면
                            // 열려진 상태에서 창이 줄어든거면 무조건 축소..
                            if(!me._isWideScreen && me._isAutoExpand !== false) {
                                me.collapse();
                            } else if(me._isWideScreen && me._isAutoExpand !== false){
                                // 창이 늘어난거면 무조건 확장.
                                MelonPersonal.isVexpand = false;//140429_1024이하 해상도 캐쉬처리 관련 추가
                                me.expand();
                            }
                            return;
                        } else {
                            if( oldHeight === me._winHeight ) { return }    // height에 변화가 없으면 걍 무시
                        }

                        // resize이벤트는 1px단위로 빈번하게 발생하는데, 이때마다 레이아웃을 계산하면 부하가 상당히 커지므로,
                        // 10px이상 변경되거나, 리사이징이 멈추고 0.2초가 지난 후에 비로소 레이아웃을 재계산한다.
                        if(Math.abs(prevHeight - me._winHeight) > 10) {
                            me._layout();
                            prevHeight = me._winHeight;
                        } else {
                            timer = setTimeout(function() {
                                me._layout();
                            }, 200);
                        }
                    };
                })());
            },

            /**
             * 새로운 소식의 top 위치: 배치 기준이 됨
             * @private
             */
            _getViewTop: function() {
                var me = this;

                if(!me._viewTopHeight || me._viewTopHeight <= 0) {
                    me._viewTopHeight = me._$topView.position().top;
                }
                return me._viewTopHeight;
            },

            /**
             * 요소들을 재배치
             * @private
             */
            _layout: function() {
                var me = this,
                    opts = me.options,
                    expnHeight, viewHeight, bottomHeight, viewTop, splitterLimit,expnStartPosition;

                // 확장모드일 때
                if( me._isExpand ) {
                    viewTop = me._getViewTop();
                    splitterLimit = opts.splitterLimit;     // 구분자 이동 제한값
                    if (me._isWideScreen) { // 1280이상
                        expnStartPosition = me._$expnBox.position().top+2; //search 페이지일때의 차이값
                    }else{
                        expnStartPosition = 0;
                    }
                    if(me._isWideScreen) { expnHeight = Math.max(opts.wideMinium, me._winHeight); }          // minium: 최소크기
                    else { expnHeight = Math.min(opts.narrowMaxium, Math.max(opts.narrowMinium, me._winHeight - opts.narrowBottom)); }
    /* 140116_수정 */
                    /* 140317_개인화영역 배너제거
                    if(!MelonPersonal.topBanner){ //상단 배너가 없다면
                        topBannerHeight = 80;
                    }
                    */
                    /* 140318_ 활동중인친구 기본높이 187로 변경 */
                    me._expanHeight = expnHeight;
                    viewHeight = Math.max(splitterLimit, (expnHeight - viewTop - 12 - 187/*topView paddingTop*/));
                    bottomHeight = 169;

                    me._$expnBox.css('height', expnHeight);
                    if(me._$bottomNone){ //활동중인 친구가 없다면,
                        me._$splitter.hide();
                        me._$topView.css('height', viewHeight + bottomHeight + 12 - expnStartPosition);/*topView paddingTop*/
                    }else{
                        me._$splitter.show();//140513_화면로딩순서 관련 수정
                        me._$topView.css('height', viewHeight - (bottomHeight<splitterLimit?splitterLimit-bottomHeight:0));   // 새로운 소식
                        me._$bottomView.css('height', Math.max(splitterLimit, bottomHeight));                               // 활동중인 친구
                    }
    /* 140116_수정 end */
                }
            },
            /**
             * 새로운 소식
             * @private
             */
            _loadNews: function() {
                var me = this;
                if(me._isLoadedNews || !me.options.newsUrl){
                    return;
                  }
                me._isLoadedNews = true;

                $.ajax({
                    url: me.options.newsUrl
                }).done(function(html) {

                    setTimeout(function() { // 20140208 수정
                        me._$topView.find('>div.list_view').removeClass('load').find('>div.list_wrap>ul').html(html);
                        /* 140411_제거
                        if($('#Personal_nonews').length){//140409_ajax데이터에 소식없음 아이템이 있을경우
                            me._$topView.find('h2').html('<span class="bg">새로운 소식이 없습니다.</span>');
                        }else{
                            me._$topView.find('h2').html('<a class="all_view">새로운 소식</a>');
                        }
                        */
                        //140409_refresh 버튼 존재할경우
                        if($('#newReflash').length){
                            $('#newReflash').click(function(){
                                //me.options.newsUrl = '/wsg/main_layout_news_ajax.html'; //개발요청이므로 기획용dp코드는 생략하겠습니다.
                                me._isLoadedNews = false;
                                me._loadNews();
                            })
                        }
                        //me._$topView.find('li').hover(function(){$(this).addClass('hover')},function(){$(this).removeClass('hover')})//140314_제거
                        /* 140317_개인화영역 배너제거 if(!MelonPersonal.topBanner){
                            me._$topView.prev().hide();
                        }else{
                            me._$topView.prev().show();
                        }*/
                    }, 25);     // 20140208 수정
                });
            },
            /**
             * 활동중인 친구
             * @private
             */
            _loadActiveFriends: function() {
                var me = this;
                if(me._isLoadActiveFriends || !me.options.activeFriendsUrl){ return; }
                me._isLoadActiveFriends = true;

                $.ajax({
                    url: me.options.activeFriendsUrl
                }).done(function(html) {
                    setTimeout(function() { // 20140208 수정
                        me._$bottomView.find('>div.list_view').removeClass('load').find('>div.list_wrap>ul').html(html);
                        me._$bottomChk = me._$bottomView.find('div.list_wrap>ul>li');
                        if(!me._$bottomChk.length){
                            me._$bottomNone = true;
                            me._$bottomView.hide();
                        }else{//140513_화면로딩순서 관련 수정
                            me._$bottomNone = false;
                        }
                        me._layout();
                    }, 25); // 20140208 수정
                });
            }
        });
        return PersonalArea;
    });

    /**
     * Top 버튼
     * @namespace MELON.PBPGN.MoveTop
     */
    WEBSVC.define('PBPGN.MoveTop', {
        /**
         * memberOf MELON.PBPGN.MoveTop
         * @param {jQuery} el 탑버튼
         * @param {JSON} options
         *      @param {Integer} startTop 표시 시작위치
         *      @param {Integer} footerHeight 푸터 사이즈
         *      @param {Integer} rightMargin 우측 마진
         *      @param {Integer} bottomMargin 하단 마진
         */
        init: function(el, opts) {
            var $topBtn = $(el);
            if(!$topBtn.length || this._inited){ return; }
            this._inited = true;

            var isShow = false,
                $cont = $('#conts_section'),
                conWidth = $cont.width(),
                util = WEBSVC.util;

            opts = $.extend({
                startTop: 800,
                footerHeight: 203,
                rightMargin: 10,
                bottomMargin: 10
            }, opts);

            $topBtn.css({'position': 'fixed', 'display':'none'}).on('click', function(e) {
                e.preventDefault();
                $('html, body').animate({'scrollTop': 0}, {easing: 'easeInOutQuart', duration: 300});
            });

            WEBSVC.PubSub.on('personalmodechanged', function(e, isExpand) {
                $win.triggerHandler('resize.movetop');
            });

            /* 140528_수정 */
            topMove();

            $win.on('scroll.movetop resize.movetop', function() {
                topMove();
            });
            function topMove() {
                var scrollTop = $win.scrollTop(),
                    scrollLeft = $win.scrollLeft(),
                    conOffset = {},
                    docHeight = 0,
                    conRight = 0,
                    conBottom = 0;

                if( scrollTop > opts.startTop ) {
                    docHeight = util.getDocHeight() - util.getWinHeight();
                    conOffset = $cont.offset();
                    conRight = conOffset.left + conWidth - opts.rightMargin;
                    conBottom = conOffset.top + $cont.height();

                    $topBtn.css({
                        bottom: /*docHeight - scrollTop < opts.footerHeight ? (opts.footerHeight + opts.bottomMargin) - (docHeight - scrollTop) : */opts.bottomMargin,
                        left: conRight - scrollLeft - 33
                    });

                    !isShow && $topBtn.show();
                    isShow = true;
                } else {
                    if( isShow ) {
                        $topBtn.hide();
                        isShow = false;
                    }
                }
            }
            /* //140528_수정 */
        }
    });

    /**
     *  시간 제한 팝업 모듈
     * @namespace MELON.PBPGN.TimeLimitPopup
     */
    WEBSVC.define('PBPGN.TimeLimitPopup', {
        /**
         * memberOf MELON.PBPGN.TimeLimitPopup
         * @param {JSON} options
         *      @param {String} cookieId 쿠키 아이디
         *      @param {String} limitType 시간 제한 타입 day/eternity
         */
        init: function(options) {
            var me = this,
                cookieData = '';

            options.nowTime = WEBSVC.date.parseDate(options.serverTime);
            // 쿠키 타입에 따른 분기
            cookieData = WEBSVC.date.parseDate(me._get_data(options));

            // 쿠키가 없을 경우 - 무조건 레이어 혹은 윈도우 팝업 오픈
            if ( cookieData === '' ) {
                $doc.trigger('limitpopup', [options.cookieId]);
            // 쿠키가 있을 경우 - 시간 계산하여 팝업 여부 결정
            } else {
                // day 타입인 경우 쿠키에 저장된 시간을 비교. eternity인 경우 쿠키가 있을 경우 무조건 띄우지 않는다.
                if ( ( options.limitType === 'day' && WEBSVC.date.compare( cookieData, options.nowTime ) === 1 ) ) {
                    $doc.trigger('limitpopup', [options.cookieId]);
                }
            }
        },
        _get_data: function(options) {
            var me = this,
                cookieData = '',
                cookieIndex = 0,
                cookieArray = new Array;

            if ( options.cookieType === 'array' ) {
                cookieArray = WEBSVC.Cookie.get('melonCookieArray').split("||");
                cookieIndex = MELON.WEBSVC.array.indexOf(cookieArray, options.cookieId)

                if ( cookieIndex === -1 ) {
                    cookieData = '';
                } else {
                    cookieData = cookieArray[cookieIndex + 1];
                }
            } else {
                cookieData = WEBSVC.Cookie.get(options.cookieId);
            }

            return cookieData;
        }
    });

    WEBSVC.define('PBPGN.TimeLimitSet', function() {
        /**
         * 팝업 제한 시간 설정
         * @class
         * @name MELON.PBPGN.TimeLimitSet
         */
        var TimeLimitSet = Class(/** @lends MELON.PBPGN.TimeLimitSet# */{
            name: 'TimeLimitSet',
            $extend: MELON.PBPGN.View,
            $statics: {
                ON_SETTING: 'timelimitset'
            },
            defaults: {
                cookieType: 'normal',
                timeType: 'day',
                timeLocation: 'local',
                selectEvent: 'click'
            },
            selectors: {
                closebtn: '>.d_limit_btn',          // 닫기 버튼
                checkbox: '>input.d_limit_check'    // 체크 박스
            },

            /**
             * 생성자
             * @param {jQuery|Element|String} el 대상 엘리먼트
             * @param {JSON} options
             */
            initialize: function(el, options) {
                var me = this;

                if(me.supr(el, options) === false) { return; }

                me.on(me.options.selectEvent, me.options.selectors.closebtn, function(e) {
                    e.preventDefault();
                    if (me.$checkbox.length) {
                        if ( me.$checkbox.is(":checked") ) {
                            me._set_cookie();
                        }
                    } else {
                        me._set_cookie();
                    }
                });
            },

            _set_cookie: function() {
                var me = this,
                    nowdate = new Date(),
                    closeaction = me.$closebtn.attr('data-close-action'),
                    expiresTime;//140710_추가

                /* 140710_수정 */
                if( me.options.timeLocation === 'local' ) {
                    if ( me.options.timeType === 'dayafter' ) {
                        nowdate.setDate(nowdate.getDate() + 1);
                    }
                    me.options.setTime = MELON.WEBSVC.date.format(nowdate, "yyyy:MM:dd") + ' 23:59:59';
                    me._set_data();
                    if (me.options.cookieType === 'array') {
                        nowdate.setDate(nowdate.getDate() + 10000);
                        expiresTime = nowdate;
                    }else {
                        expiresTime = WEBSVC.date.parseDate(me.options.setTime);
                    };
                    WEBSVC.Cookie.set( me.options.cookieId, me.options.setTime, {expires : expiresTime} );
                    $doc.trigger(TimeLimitSet.ON_SETTING);
                } else {
                    $.ajax({
                        url: '/wsg/script/time.html',
                        dataType: 'json',
                        data : {
                            timetype: me.options.timeType
                        }
                    }).done(function(json) {
                        me.options.setTime = json.data.nowday + ' 23:59:59';
                        me._set_data();
                        if (me.options.cookieType === 'array') {
                            nowdate.setDate(nowdate.getDate() + 10000);
                            expiresTime = nowdate;
                        }else {
                            expiresTime = WEBSVC.date.parseDate(me.options.setTime);
                        };
                        WEBSVC.Cookie.set( me.options.cookieId, me.options.setTime, {expires : expiresTime} );
                        $doc.trigger(TimeLimitSet.ON_SETTING);
                    });
                }
                /* //140710_수정 */

                if ( closeaction === 'fadeout' ) {
                    $(me.el).fadeOut(function(){
                    });
                } else if ( closeaction === 'slideup' ) {
                    $(me.el).slideUp();
                } else {
                    $(me.el).hide().modal('hide');//140613_수정
                }
                $('#conts').removeClass('ban');
            },

            _set_data: function() {
                var me = this,
                    cookieId = me.$closebtn.attr('data-cookie-id'),
                    cookieIndex = 0,
                    cookieData = [];

                if ( me.options.cookieType === 'array' ) {
                    me.options.cookieId = 'melonCookieArray';

                    cookieData = WEBSVC.Cookie.get(me.options.cookieId).split("||");
                    cookieIndex = MELON.WEBSVC.array.indexOf(cookieData, cookieId)

                    if ( cookieIndex === -1 ) {
                        cookieData.push(cookieId);
                        cookieData.push(me.options.setTime);
                    } else {
                        cookieIndex = cookieIndex + 1;
                        cookieData[cookieIndex] = me.options.setTime;
                    }
                    // 문자열로 만들기
                    me.options.setTime = cookieData.join('||');
                } else {
                    me.options.cookieId = cookieId;
                }
            }
        });

        WEBSVC.bindjQuery(TimeLimitSet, 'timeLimitSet');  // 이 부분을 실행하면 $(..).tabs()로도 호출이 가능해진다.
        return TimeLimitSet;
    });

})(window, jQuery, MELON.WEBSVC, MELON.PBPGN);

// 글로벌 작업들
(function($, WEBSVC, PBPGN, undefined) {
    var $win = WEBSVC.$win,
        $doc = WEBSVC.$doc;

    // placeholder 폰트 색상 지정(old ie전용)
    PBPGN.Placeholder.prototype.defaults.foreColor = 'fc_lgray';

    $(function () {

        // 글로벌 이벤트 바인딩
        WEBSVC.GlobalEvents.init();

        // 커스텀 셀렉트박스 빌드
        $('select.d_selectbox').selectbox();

        // 탑버튼 ////////////////////////////////////////////////////////////////////////
        /* 140528_수정 */
        PBPGN.MoveTop.init($('.btn_top_wrap'), { startTop:1800 });
        /* //140528_수정 */
        ///////////////////////////////////////////////////////////////////////////////////
        
        //실시간 검색어 160921
        $('.daum_search_wrap').on('click', 'li a,.btn_closed', function(e) {
            e.preventDefault();
            if ($(this).hasClass('btn_closed')) {
                $(this).parents('.daum_search_wrap').hide();
            }else {
                $(this).parents('li').addClass('on').siblings().removeClass('on');
            };
        });

    });

})(jQuery, MELON.WEBSVC, MELON.PBPGN);

