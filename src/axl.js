/*!
 * @author 김승일
 * @email comahead@gmail.com
 * @description 이마트 코어 라이브러리
 * @license MIT License
 */
window.LIB_NAME = 'axl';
window.LIB_DIV_DEBUG = false;
/*
 *
 */
(function ($) {
    "use strict";
    /* jshint expr: true, validthis: true */
    /* global common, alert, escape, unescape */

    /**
     * @callback arrayCallback
     * @param  {*} item - 배열의 요소
     * @param  {number} index   - 배열의 인덱스
     * @param  {Array}  array   - 배열 자신
     * @return {boolean} false를 반환하면 반복을 멈춘다.
     */

    /**
     * 이벤트헨들러
     *
     * @callback eventCallback
     * @param {$.Event} e 이벤트 객체
     * @param {Object} [data] 데이타
     */

    /**
     * 글로벌 컨텍스트
     * @namespace
     * @name window
     */

    /**
     * ui 네임스페이스
     * 더불어, axl.ui.View에서 상속받아 새로운 UI모듈을 생성해준다.
     * @namespace
     * @name axl.ui
     * @example
     * var Tab = axl.ui('Tab', {
     *    select: function(index) {
     *        //
     *    }
     * });
     *
     * var tab = new Tab();
     * // or
     * var tab = new axl.ui.Tab();
     *
     * tab.select(2);
     */

    if (!$) {
        throw new Error("This library requires jQuery");
    }

    // 프레임웍 이름
    var /** @const */LIB_NAME = window.LIB_NAME || 'common',
        context = window,
        $root = $(document.documentElement).addClass('js'),
        tmpInput = document.createElement('input'),
        isTouch = ('ontouchstart' in context),
        isMobile = ('orientation' in context);

    isTouch && $root.addClass('touch');
    isMobile && $root.addClass('mobile');

    if (typeof Function.prototype.bind === 'undefined') {
        /**
         * 함수내의 컨텐스트를 지정
         * @param {Object} context 컨텍스트
         * @param {*} ... 두번째 인자부터는 실제로 싱행될 콜백함수로 전달된다.
         * @return {Function} 주어진 객체가 켄텍스트로 적용된 함수
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

            return function (context) {
                // bind로 넘어오는 인자와 원본함수의 인자를 병합하여 넘겨줌.
                var local_args = args.concat(arraySlice.call(arguments));
                if (this !== window) { local_args.push(this); }
                return fn.apply(object, local_args);
            };
        };
    }

    if (!window.console) {
        // 콘솔을 지원하지 않는 브라우저를 위해 출력요소를 생성
        window.console = {};
        if(window.LIB_DIV_DEBUG === true) {
            window.$debugDiv = $('<div class="ui_debug" style=""></div>');
            $(function () {
                window.$debugDiv.appendTo('body');
            });
        }
        var consoleMethods = ['log', 'info', 'warn', 'error', 'assert', 'dir', 'clear', 'profile', 'profileEnd'];
        for(var i = -1, method; method = consoleMethods[++i]; ) {
            +function(method) {
                console[method] = window.LIB_DIV_DEBUG === true ?
                    function () {
                        window.$debugDiv.append('<div style="font-size:9pt;">&gt; <span>[' + method + ']</span> ' + [].slice.call(arguments).join(', ') + '</div>');
                    } : function () {
                };
            }(method);
        }
    }

    /**
     * jQuery 객체
     * @class
     * @name $
     */

    $.extend(jQuery.expr[':'], {
        focusable: function(el){
            return $(el).is(':visible, a, button, input[type=text], input[type=file], input[type=checkbox], input[type=radio], select, textarea, [tabindex]');
        }
    });

    // TODO: 뺄 것
    var oldOff = $.fn.off;
    $.fn.unbind = $.fn.off = function(name) {
        if((this[0] === window || this[0] === document)
            && name !== 'ready' && name.indexOf('.') < 0) {
            throw new Error('['+name+'] window, document에서 이벤트를 off할 때는 네임스페이스를 꼭 넣어주셔야 합니다.');
        }
        return oldOff.apply(this, arguments);
    };

    /**
     * value값을 URI인코딩하여 반환
     * @function
     * @name $#encodeURI
     * @return {string} 인코딩된 문자열
     */
    $.fn.encodeURI = function(value) {
        if (arguments.length === 0) {
            return encodeURIComponent($.trim(this.val()));
        } else {
            return this.val(encodeURIComponent(value));
        }
    };

    $.fn.getPlaceholder = function(){
        var val = '';
        if(this.attr('ori-placeholder')){
            val = this.attr('ori-placeholder').replace(/\\r\\n/g, "\n").replace(/\\n/g, "\n");
        } else {
            val = ('placeholder' in tmpInput ? this.attr('placeholder') : '');
        }
        return val;
    };

    /**
     * value값의 앞뒤 스페이스문자 또는 old ie인경우에 placeholder를 제거하여 실제 값만 반환
     * @function
     * @name $#trimVal
     * @return {string} 문자열
     */
    $.fn.trimVal = (function() {
        var supportPlaceholder = ('placeholder' in tmpInput);

        return  function(value) {
            if(supportPlaceholder && !this.attr('ori-placeholder')){
                if (arguments.length === 0) { return $.trim(this.val()); }
                else { return this.val($.trim(value)); }
            } else {
                var txtPlaceholder = this.getPlaceholder();
                if (arguments.length === 0) {
                    if (this.val() === txtPlaceholder) {
                        return '';
                    }
                    return $.trim(this.val());
                } else {
                    value = $.trim(value) || txtPlaceholder;
                    return this.val(value);
                }
            }
        };
    })();

    $.fn.toggleLayer = function() {
        return this.each(function() {
            var $el = $(this),
                $target = $( $el.attr('data-target') || $el.attr('href') );

            $el.on('click', function(e) {
                e.preventDefault();

                $target.toggle(!$target.is(':visible'));
            });
        });
    };


    /**
     * 체크여부를 지정할 때, changed 이벤트를 발생시킨다.(연결된 label에 on클래스를 토글링하고자 할 때 사용)
     * @function
     * @name $#checked
     * @param {boolean} checked 체크여부
     * @param {boolean} isBubble 버블링 여부
     * @returns {jQuery}
     * @fires $#changed
     * @example
     * // 먼저 changed 이벤트 바인딩
     * $('input:checkbox').on('changed', function(e, isChecked) { $(this).parent()[isChecked?'addClass':'removeClass']('on'); });
     * ..
     * // checked 값을 변경
     * $('input:checkbox').checked(true); // 해당체크박스의 부모에 on클래스가 추가된다.
     */
    $.fn.checked = function(checked, isBubble) {
        return this.each(function() {
            if (this.type !== 'checkbox' && this.type !== 'radio') { return; }
            /**
             * @event $#changed
             * @type {Object}
             * @peoperty {boolean} checked - 체크 여부
             */
            $(this).prop('checked', checked)[isBubble === false ? 'triggerHandler' : 'trigger']('checkboxchanged', [checked])
                .parent().toggleClass('on', checked);
        });
    };

    /**
     * 클래스 치환
     * @function
     * @name $#replaceClass
     * @param {string} old 대상클래스
     * @param {string} newCls 치환클래스
     * @returns {jQuery}
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
     * @param {Element|jQuery} [options.button] 버튼
     * @param {Function} [options.onShow] 표시될 때 실행될 함수
     */
    $.fn.showLayer = function(options, isBubble) {
        options = extend({
            onShow: core.emptyFn,
            opener: null
        }, options);

        return this.each(function() {
            var $this = $(this),
                trigger = [isBubble === false ? 'triggerHandler' : 'trigger'],
                evt;
            if (options.opener) {
                $this.data('opener', options.opener);
                $(options.opener).attr({'aria-pressed': 'true', 'aria-expand': 'true'});
            }

            $this[trigger](evt = $.Event($.fn.showLayer.ON_BEFORESHOW));
            if (evt.isDefaultPrevented()) { return; }

            // 표시될 때 d_open 클래스 추가
            $this.addClass($.fn.showLayer.openClass).show()[trigger]($.fn.showLayer.ON_SHOWN);
            options.onShow.call($this[0]);
        });
    };
    $.fn.showLayer.openClass = 'ui_open';
    $.fn.showLayer.ON_BEFORESHOW = 'layerbeforeshow';
    $.fn.showLayer.ON_SHOWN = 'layershown';

    /**
     * 레이어 숨김 담당:
     * - 단순히 hide를 하는게 아니라, 숨겨진 후에 hide이벤트를 발생시켜준다.
     * @function
     * @name $#hideLayer
     * @param {boolean} [options.focusOpener = false] 숨겨진 후에 버튼에 포커스를 줄것인지 여부
     * @param {Function} [options.onHide] 숨겨진 후에 실행될 함수
     */
    $.fn.hideLayer = function(options, isBubble) {
        options = extend({
            onHide: core.emptyFn,
            focusOpener: false
        }, options);

        return this.each(function() {
            var $this = $(this);
            $this.removeClass($.fn.showLayer.openClass).hide()[isBubble === false ? 'triggerHandler' : 'trigger']($.fn.hideLayer.ON_HIDDEN);
            options.onHide.call($this[0]);

            // 숨겨진 후에 열었던 원래버튼에 포커스를 강제로 준다.
            if ($this.data('opener')) {
                var $btn = $( $this.data('opener') );
                $btn.attr({'aria-pressed': 'false', 'aria-expand': 'false'});
                if (options.focusOpener === true) {
                    $btn.focus();
                }
            }
        });
    };
    $.fn.hideLayer.ON_HIDDEN = 'layerhidden';

    /**
     * 아무것도 안하는 빈함수
     * @function
     * @name $#noop
     * @example
     * $(this)[ isDone ? 'show' : 'noop' ](); // isDone이 true에 show하되 false일때는 아무것도 안함.
     */
    $.fn.noop = function() {
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
            if ((this.type === 'checkbox' || this.type === 'radio') && this.checked === true) {
                results.push(this.value);
            }
        });
        return results;
    };

    /**
     * 같은 레벨에 있는 다른 row에서 on를 제거하고 현재 row에 on 추가
     * @function
     * @name $#activeItem
     * @param {string} cls 활성 클래스명
     * @return {jQuery}
     */
    $.fn.activeItem = function(cls, isReverse) {
        cls = cls || 'on';
        return this.toggleClass(cls, !isReverse).siblings().toggleClass(cls, isReverse).end();
    };

    /**
     * disabled 및 flag에 따라 클래스 토글
     * @function
     * @name $#disabled
     * @param {string} [name = disabled] 클래스명
     * @param {boolean} flag
     * @returns {*}
     */
    $.fn.disabled = function(name, flag) {
        if(arguments.length === 0){
            name = 'disabled';
            flag = true;
        }
        if(typeof name !== 'string') {
            flag = !!name;
            name = 'disabled';
        }
        return this.prop('disabled', flag).toggleClass(name, flag);
    };

    /**
     * $(':focusable')  포커싱할 수 있는 대상을 검색
     * @name $#focusable
     */
    $.extend(jQuery.expr[':'], {
        focusable: function(el, index, selector){
            return $(el).is('a, button, input[type=text], input[type=file], input[type=checkbox], input[type=radio], select, textarea, [tabindex]');
        }
    });

    /**
     * @namespace
     * @name common
     * @description root namespace of hib site
     */
    var core = context[ LIB_NAME ] || (context[ LIB_NAME ] = {});
    var doc = document,
        arrayProto = Array.prototype,
        objectProto = Object.prototype,
        toString = objectProto.toString,
        hasOwn = objectProto.hasOwnProperty,
        arraySlice = arrayProto.slice,

        isPlainObject = (toString.call(null) === '[object Object]') ? function (value) {
            return value !== null
                && value !== undefined
                && toString.call(value) === '[object Object]'
                && value.ownerDocument === undefined;
        } : function (value) {
            return toString.call(value) === '[object Object]';
        },

        isType = function (value, typeName) {
            var isGet = arguments.length === 1;
            function result(name) {
                return isGet ? name : typeName === name;
            }
            if (value === null) {
                return result('null');
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

        isArray = function(obj){
            return isType(obj, 'array');
        },

        isFunction = function (obj) {
            return isType(obj, 'function');
        },

        /**
         * 반복 함수
         * @function
         * @name axl.each
         * @param {Array|Object} obj 배열 및 json객체
         * @param {arrayCallback} iterater 콜백함수
         * @param {*} [ctx] 컨텍스트
         * @returns {*}
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
                if (obj.forEach) {
                    if (obj.forEach(iterater, ctx || obj) === false) {

                    }
                } else {
                    for (i = 0, len = obj.length; i < len; i++) {
                        if (iterater.call(ctx || obj, obj[i], i, obj) === false) {
                            break;
                        }
                    }
                }
            } else {
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
         * 객체 확장 함수
         * @function
         * @name axl.extend
         * @param {Object} obj...
         * @returns {*}
         * @example
         * var ori = {"a": 'A', "b": [1, 2, 3]};
         * axl.extend(ori, {
         *    "c": "C"
         * }); // {"a": 'A', "b": [1, 2, 3], "c": "C"}
         */
        extend = function(deep, obj) {
            var args;
            if(deep === true) {
                args = arraySlice.call(arguments, 2);
            } else {
                args = arraySlice.call(arguments, 1);
                obj = deep;
                deep = false;
            }
            each(args, function (source) {
                if(!source) { return; }

                each(source, function (val, key) {
                    var isArr = isArray(val);
                    if(deep && (isArr || isPlainObject(val))) {
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
         * @name axl.clone
         * @param {Object} obj 배열 및 json객체
         * @returns {*}
         * @example
         * var ori = {"a": 'A', "b": [1, 2, 3]};
         * var clone = axl.clone(ori); // {"a": 'A', "b": [1, 2, 3]};
         * // ori 복제본, ori를 변경하여도 clone은 변하지 않는다.
         */
        clone = function(obj) {
            if (null == obj || "object" != typeof obj) return obj;

            if (obj instanceof Date) {
                var copy = new Date();
                copy.setTime(obj.getTime());
                return copy;
            }

            if (obj instanceof Array) {
                var copy = [];
                for (var i = 0, len = obj.length; i < len; i++) {
                    copy[i] = clone(obj[i]);
                }
                return copy;
            }

            if (obj instanceof Object) {
                var copy = {};
                for (var attr in obj) {
                    if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
                }
                return copy;
            }
            throw new Error('oops!! clone is fail');
        };


    extend(core, {
        name: LIB_NAME,
        debug: false,
        each: each,
        extend: extend,
        clone: clone,
        emptyFn: function(){},
        /**
         * 특정속성을 지원하는지 체크하기 위한 엘리먼트
         * @member
         * @name axl.tmpInput
         * @example
         * if('placeholder' in axl.tmpInput) {
         *     alert('placeholder를 지원합니다.');
         * }
         */
        tmpInput: doc.createElement('input'),
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
         * @name axl.is
         * @param {Object} o 타입을 체크할 값
         * @param {string} typeName 타입명(null, number, string, element, nan, infinity, date, array)
         * @return {boolean}
         * @example
         * axl.is('aaaa', 'string'); // true
         * axl.is(new Date(), 'date'); // true
         * axl.is(1, 'number'); // true
         * axl.is(/[a-z]/, 'regexp'); // true
         * axl.is(document.getElementById('box'), 'element'); // true
         * axl.is({a:'a'}, 'object'); // true
         * axl.is([], 'array'); // true
         * axl.is(NaN, 'nan'); // true
         * axl.is(null, 'null'); // true
         * // 파라미터를 하나만 넘기면 타입명을 반환받을 수 있다.
         * axl.is('') // "string"
         * axl.is(null) //"null"
         * axl.is(1) //"number"
         * axl.is({}) //"object"
         * axl.is([]) // "array"
         * axl.is(undefined) // "undefined"
         * axl.is(new Date()) // "date"
         * axl.is(/[a-z]/) // "regexp"
         * axl.is(document.body) //"element"
         */
        is: isType,
        /**
         * 타입 체크 axl.is의 별칭
         * @function
         * @name axl.type
         * @param {Object} o 타입을 체크할 값
         * @param {string} typeName 타입명(null, number, string, element, nan, infinity, date, array)
         * @return {boolean}
         * @example
         * axl.type('aaaa', 'string'); // true
         * axl.type(new Date(), 'date'); // true
         * axl.type(1, 'number'); // true
         * axl.type(/[a-z]/, 'regexp'); // true
         * axl.type(document.getElementById('box'), 'element'); // true
         * axl.type({a:'a'}, 'object'); // true
         * axl.type([], 'array'); // true
         * axl.type(NaN, 'nan'); // true
         * axl.type(null, 'null'); // true
         * // 파라미터를 하나만 넘기면 타입명을 반환받을 수 있다.
         * axl.type('') // "string"
         * axl.type(null) //"null"
         * axl.type(1) //"number"
         * axl.type({}) //"object"
         * axl.type([]) // "array"
         * axl.type(undefined) // "undefined"
         * axl.type(new Date()) // "date"
         * axl.type(/[a-z]/) // "regexp"
         * axl.type(document.body) //"element"
         */
        type: isType,

        /**
         * 주어진 인자가 빈값인지 체크
         *
         * @param {Object} value 체크할 문자열
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
                || (core.is(value, 'string') && !allowEmptyString ? value === '' : false)
                || (core.is(value, 'array') && value.length === 0)
                || (core.is(value, 'object') && !core.object.hasItems(value));
        },

        /**
         * 객체 자체에 주어진 이름의 속성이 있는지 조회
         *
         * @param {Object} obj 객체
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
         * @param {Object} [obj] 지정된 네임스페이스에 등록할 객체, 함수 등
         * @return {Object} 생성된 새로운 네임스페이스
         *
         * @example
         * axl.namesapce('axl.widget.Tabcontrol', TabControl)
         * // 를 native로 풀면,
         * var common = {
         *     widget: {
         *         Tabcontrol: TabControl
         *     }
         * };
         *
         */
        namespace: function (name, obj) {
            if (typeof name !== 'string') {
                obj && (name = obj);
                return name;
            }

            var root = context,
                names = name.split('.'),
                i, item;

            for (i = -1; item = names[++i];) {
                root = root[item] || (root[item] = {});
            }

            return extend(root, obj || {});
        },
        /**
         * common 하위에 name에 해당하는 네임스페이스를 생성하여 object를 설정해주는 함수
         *
         * @function
         * @name axl.addon
         *
         * @param {string} name .를 구분자로 해서 axl을 시작으로 하위 네임스페이스를 생성. name이 없으면 vinyl에 추가된다.
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
                names = name ? name.replace(/^_core\.?/, '').split('.') : [],
                ln = names.length - 1,
                leaf = names[ln];

            if (isExecFn !== false && typeof object === 'function' && !hasOwn.call(object, 'superclass')) {
                console.log(name);
                object = object.call(root);
            }

            for (var i = 0; i < ln; i++) {
                root = root[names[i]] || (root[names[i]] = {});
            }

            return (leaf && (root[leaf] ? extend(root[leaf], object) : (root[leaf] = object))) || extend(root, object), object;
        }
    });
    core.ns = core.namespace;

    /**
     * benchmart functions
     */
    extend(core, /** @lends common */{
        /**
         * timeStart("name")로 name값을 키로하는 타이머가 시작되며, timeEnd("name")로 해당 name값의 지난 시간을 로그에 출력해준다.
         *
         * @param {string} name 타이머의 키값
         * @param {boolean} reset 리셋(초기화) 여부
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
         * @param {number} [size = 2]
         * @param {string} [ch = '0']
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

            if(result.length >= size) {
                return sign + result.slice(-size);
            }

            while (result.length < size) {
                result = ch + result;
            }
            return sign + result;
        },

        /**
         * 세자리마다 ,를 삽입
         *
         * @function
         * @param {number} value
         * @return {string}
         *
         * @example
         * axl.number.addComma(21342); // "21,342"
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
         * @param {number} max 최대값
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
            if (value < min) { return min; }
            else if (value > max) { return max; }
            return value;
        },

        /**
         * 어떠한 경우에도 숫자로 변환(문자를 제거한 후 숫자만 추출)
         * @param value
         * @return {number}
         */
        parse: function(value) {
            value = (value||'').replace(/[^-0-9\.]/gi, '');
            return value|0;
        },
        /**
         * 2진수로 변환
         * @param d 숫자값
         * @param bits 비트길이 (4 or 8)
         * @return {string}
         */
        toBinary: function(d, bits)  {
            var b  = [];
            if(!bits) {
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
        fromBinary: function(b) {
            var ba  = (b||'').split(""),
                n = 1,
                r = 0;
            for (var i in ba) {
                r += n * ba[i];
                n *= 2;
            }
            return r;
        }
    });
    /**
     * axl.number.zeroPad의 별칭
     * @function
     * @static
     * @name axl.number.pad
     */
    core.number.pad = core.number.zeroPad;
    /////////////////////////////////////////////////////////////////////////////////////////////////

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
                each(escapeChars, function (v, k) {
                    results[v] = k;
                });
                return results;
            })(escapeChars),
            escapeRegexp = /[&><'"]/g,
            unescapeRegexp = /(&amp;|&gt;|&lt;|&quot;|&#39;|&#[0-9]{1,5};)/g,
            tagRegexp = /<\/?[^>]+>/gi,
            scriptRegexp = /<script[^>]*>([\\S\\s]*?)<\/script>/img;

        return /** @lends axl.string */{
            /**
             * 앞뒤 빈문자열을 제거
             * @param {string} value
             * @returns {string}
             * @example
             * axl.string.trim(" abc "); // 'abc'
             */
            trim: function(value) {
                return value ? value.replace(/^\s+|\s+$/g, "") : value;
            },
            /**
             * 정규식이나 검색문자열을 사용하여 문자열에서 텍스트를 교체
             *
             * @param {string} value 교체를 수행할 문자열
             * @param {RegExp|string} find 검색할 문자열이나 정규식 패턴
             * @param {string} rep 대체할 문자열
             * @return {string} 대체된 결과 문자열
             *
             * @example
             * axl.string.replaceAll("a,b,c,d", ',', ''); // "abcd"
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
             * @param {string} value 길이를 계산할 문자열
             * @return {number}
             *
             * @example
             * axl.string.byteLength("동해물과"); // 8
             */
            byteLength: function (value) {
                var l = 0;
                for (var i=0, len = value.length; i < len; i++) {
                    l += (value.charCodeAt(i) > 255) ? 2 : 1;
                }
                return l;
            },

            /**
             * 주어진 path에서 확장자를 추출
             * @param {string} fname path문자열
             * @return {string} 확장자
             * @example
             * axl.string.getFileExt('etc/bin/jslib.js'); // 'js'
             */
            getFileExt: function(fname){
                fname || (fname = '');
                return fname.substr((~-fname.lastIndexOf(".") >>> 0) + 2);
            },

            /**
             * 주어진 path에서 파일명을 추출
             * @param {string} str path경로
             * @returns {string} 파일명
             * @example
             * axl.string.getFileName('etc/bin/jslib.js'); // 'jslib.js'
             */
            getFileName: function(str) {
                var paths = str.split(/\/|\\/g);
                return paths[paths.length - 1];
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
             * 주어진 바이트길이에 해당하는 char index 반환
             *
             * @param {string} value 문자열
             * @param {number} length 제한 문자수
             * @return {number} chars index
             * @example
             * axl.string.indexByByte("동해물과", 3); // 2
             */
            indexByByte: function (value, length) {
                var str = value,
                    l = 0, len, i;
                for (i=0, len = str.length; i < len; i++) {
                    l += (str.charCodeAt(i) > 255) ? 2 : 1;
                    if (l > length) { return i; }
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
                return value ? value.replace(/(\-|_|\s)+(.)?/g, function(a, b, c) {
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
                return value ? value.replace(/^[A-Z]/, function(s) { return s.toLowerCase(); }) : value;
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
                return value ? (value+"").replace(escapeRegexp, function (m) {
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
            unescapeHTML: function (value) {
                return value ? (value+"").replace(unescapeRegexp, function (m) {
                    return unescapeChars[m];
                }) : value;
            },

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
             * @param {string} ... 대체할 문자열
             * @return {string} 결과 문자열
             *
             * @example
             * axl.string.format("{0}:{1}:{2} {0}", "a", "b", "c");  // "a:b:c a"
             */
            format: function (format, val) {
                var args = core.toArray(arguments).slice(1),
                    isJson = core.is(val, 'object');

                return format.replace(/\{([0-9a-z]+)\}/ig, function (m, i) {
                    return isJson ? val[i] : args[i] || '';
                });
            },

            /**
             * 문자열을 HTML ENTITIES로 변환
             * @param value
             * @return {string}
             */
            toEntities: function(value) {
                var buffer = [];
                for (var i = 0, len = string.length; i < len; i++) {
                    buffer.push("&#", value.charCodeAt(i).toString(), ";");
                }
                return buffer.join("");
            },

            /**
             * 랜덤문자열 생성
             * @param {Number} 길이
             * @returns {String} 랜덤문자열
             */
            random: function(len) {
                var keystr = '', x;
                for (var i = 0; i < len; i++) {
                    x = Math.floor((Math.random() * 36));
                    if (x<10) {
                        keystr += String(x);
                    } else {
                        keystr += String.fromCharCode(x+87);
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
                return value.replace(tagRegexp, '');
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
                return value.replace(scriptRegexp, '');
            }

        };
    });
    /////////////////////////////////////////////////////////////////////////////////////////////////
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
         * @param {Object} obj 리터럴 객체
         * @return {Array} 객체의 열거가능한 속성의 이름이 포함된 배열
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
         * @param {Object} obj 리터럴 객체
         * @return {Array} 객체의 열거가능한 속성의 값들이 포함된 배열
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
         * @param {Object} obj 객체
         * @param {Function} cb 콜백함수
         * @return {Object}
         *
         * @example
         * axl.object.map({1; 'one', 2: 'two', 3: 'three'}, function(item, key) {
		 *		return item + '__';
		 * });
         * // {1: 'one__', 2: 'two__', 3: 'three__'}
         */
        map: function(obj, cb) {
            if (!core.is(obj, 'object') || !core.is(cb, 'function')) { return obj; }
            var results = {};
            each(obj, function(v, k) {
                results[k] = cb(obj[k], k, obj);
            });
            return results;
        },

        /**
         * 요소가 있는 json객체인지 체크
         *
         * @param {Object} obj json객체
         * @return {boolean} 요소가 하나라도 있는지 여부
         * @example
         * var obj1 = {};
         * var obj2 = {"a": "A"}
         * axl.object.hasItems(obj1); // false
         * axl.object.hasItems(obj2); // true
         */
        hasItems: function (obj) {
            if (!core.is(obj, 'object')) {
                return false;
            }

            var has = false;
            each(obj, function(v) {
                return has = true, false;
            });
            return has;
        },


        /**
         * 객체를 쿼리스크링으로 변환
         *
         * @param {Object} obj json객체
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

            each(params, function (value, key) {
                if (typeof (value) === 'object') {
                    each(value, function (innerValue, innerKey) {
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
         * 주어진 배열를 키와 요소를 맞바꿔주는 함수
         *
         * @param {Array} obj 배열
         * @return {Object}
         *
         * @example
         * axl.object.travere({1:a, 2:b, 3:c, 4:d]);
		 * // {a:1, b:2, c:3, d:4}
		 */
        traverse: function (obj) {
            var result = {};
            each(obj, function (item, index) {
                result[item] = index;
            });
            return result;
        },

        /**
         * 주어진 리터럴에서 key에 해당하는 요소를 삭제
         *
         * @param {Object} value 리터럴
         * @param {Object} key 삭제할 키
         * @return 지정한 요소가 삭제된 리터럴
         * @example
         * var obj = {"a": "A", "b": "B"}
         * axl.object.remove(obj, 'b'); // {"a":"A"} // delete obj.b;로 하는게 더 낫겠네..ㅎ
         */
        remove: function (value, key) {
            if (!core.is(value, 'object')) { return value; }
            value[key] = null;
            delete value[key];
            return value;
        },

        /**
         * json를 문자열로 변환(JSON을 지원하는 브라우저에서는 JSON.stringify를 사용한다.)
         * @name axl.object.stringfy
         * @param {Object} val json 객체
         * @param {Object} [opts]
         * @param {boolean} [opts.singleQuotes = false] 문자열을 '로 감쌀것인가
         * @param {string} [opts.indent = '']  들여쓰기 문자(\t or 스페이스)
         * @param {string} [opts.nr = ''] 줄바꿈 문자(\n or 스페이스)
         * @param {string} [pad = ''] 기호와 문자간의 간격
         * @return {string}
         * @example
         * axl.object.stringify({"a": "A"
         */
        stringify: window.JSON ? JSON.stringify : function (val, opts, pad) {
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

                if(typeof val === 'string') {
                    return '"' + val +'"';
                }

                if (val instanceof Date) {
                    return "new Date('" + val.toISOString() + "')";
                }

                if ($.isArray(val)) {
                    if (core.isEmpty(val)) {
                        return '[]';
                    }

                    return '[' + opts.nr + core.array.map(val, function (el, i) {
                            var eol = val.length - 1 === i ? opts.nr : ', '+opts.nr;
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

                    return '{'+opts.nr + core.array.map(objKeys, function (el, i) {
                            var eol = objKeys.length - 1 === i ? opts.nr : ', '+opts.nr;
                            var key = /^[^a-z_]|\W+/ig.test(el) && el[0] !== '$' ? stringify(el, opts) : el;
                            return pad + opts.indent + '"' + key + '": ' + stringify(val[el], opts, pad + opts.indent) + eol;
                        }).join('') + pad + '}';
                }

                if (opts.singleQuotes === false) {
                    return '"' + (val+'').replace(/"/g, '\\\"') + '"';
                } else {
                    return "'" + (val+'').replace(/'/g, "\\\'") + "'";
                }
            })(val, opts, pad);
        }
    });
    core.object.has = core.object.hasItems;
    core.json = core.object;
    /////////////////////////////////////////////////////////////////////////////////////////////////
    var arrayProto = Array.prototype;

    // 네이티브에 f가 존재하지 않으면 false 반환
    function nativeCall(f) {
        return f ? function(obj) {
            return f.apply(obj, arraySlice.call(arguments, 1));
        } : false;
    }

    /**
     * 배열관련 유틸함수
     * @namespace
     * @name axl.array
     */
    core.addon('array', /** @lends axl.array# */{
        /**
         * 배열 병합
         * @param {Array} arr 원본 배열
         * @param {...Mixed} var_args 합칠 요소들
         * @returns {Array} 모두 합쳐진 배열
         * @exmaple
         * var newArray = axl.array.append([1,2,3], [4,5,6], [6, 7, 8]); // [1,2,3,4,5,6,7,8]
         */
        append: function (arr) {
            var args = arraySlice.call(arguments);
            arrayProto.push.apply.apply(args);
            return args[0];
        },
        /**
         * 콜백함수로 하여금 요소를 가공하는 함수
         *
         * @name axl.array.map
         * @function
         * @param {Array} obj 배열
         * @param {arrayCallback} cb 콜백함수
         * @param {Object} (optional) 컨텍스트
         * @return {Array} 기공된 배열
         *
         * @example
         * axl.array.map([1, 2, 3], function(item, index) {
		 *		return item * 10;
		 * });
         * // [10, 20, 30]
         */
        map: nativeCall(arrayProto.map) || function (obj, cb, ctx) {
            var results = [];
            if (!core.is(obj, 'array') || !core.is(cb, 'function')) { return results; }
            // vanilla js~
            for(var i =0, len = obj.length; i < len; i++) {
                results[results.length] = cb.call(ctx||obj, obj[i], i, obj);
            }
            return results;
        },

        /**
         * 반복자함수의 반환값이 true가 아닐 때까지 반복
         *
         * @name axl.array.every
         * @function
         * @param {Array} arr 배열
         * @param {arrayCallback} cb 함수
         * @return {boolean} 최종 결과
         * @example
         * var sum = 0;
         * axl.array.every([1, 3, 5, 7], function(val) {
         *     return val > 5;
         * });
         * // 9
         */
        every: nativeCall(arrayProto.every) || function(arr, cb, ctx) {
            var isTrue = true;
            if (!core.is(arr, 'array') || !core.is(cb, 'function')) { return isTrue; }
            each(arr, function(v, k) {
                if (cb.call(ctx||this, v, k) !== true) {
                    return isTrue = false, false;
                }
            });
            return isTrue;
        },

        /**
         * 반복자함수의 반환값이 true일 때까지 반복
         *
         * @name axl.array.any
         * @function
         * @param {Array} arr 배열
         * @param {arrayCallback} cb 함수
         * @return {boolean} 최종 결과
         * @example
         * var sum = 0;
         * axl.array.any([1, 3, 5, 7], function(val) {
         *     return val < 5;
         * });
         * // 4
         */
        any: nativeCall(arrayProto.any) || function(arr, cb, ctx) {
            var isTrue = false;
            if (!core.is(arr, 'array') || !core.is(cb, 'function')) { return isTrue; }
            each(arr, function(v, k) {
                if (cb.call(ctx||this, v, k) === true) {
                    return isTrue = true, false;
                }
            });
            return isTrue;
        },

        /**
         * 배열 요소의 순서를 섞어주는 함수
         *
         * @param {Array} obj 배열
         * @return {Array} 순서가 섞인 새로운 배열
         * @example
         * axl.array.shuffle([1, 3, 4, 6, 7, 8]); // [6, 3, 8, 4, 1, 7]
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
         * @name axl.array.filter
         * @param {Array} obj 배열
         * @param {Function} cb 콜백함수
         * @param {Object} (optional) 컨텍스트
         * @returns {Array}
         *
         * @example
         * axl.array.filter([1, '일', 2, '이', 3, '삼'], function(item, index) {
		 *		return typeof item === 'string';
		 * });
         * // ['일','이','삼']
         */
        filter: nativeCall(arrayProto.filter) || function (obj, cb, ctx) {
            var results = [];
            if (!core.is(obj, 'array') || !core.is(cb, 'function')) { return results; }
            for(var i =0, len = obj.length; i < len; i++) {
                cb.call(ctx||obj, obj[i], i, obj) && (results[results.length] = obj[i]);
            }
            return results;
        },

        /**
         * 주어진 배열에 지정된 값이 존재하는지 체크
         *
         * @param {Array} obj 배열
         * @param {Function} cb 콜백함수
         * @return {boolean}
         *
         * @example
         * axl.array.include([1, '일', 2, '이', 3, '삼'], '삼');  // true
         */
        include: function (arr, value, b) {
            if (!core.is(arr, 'array')) { return value; }
            if(typeof value === 'function') {
                for(var i = 0; i<arr.length; i++) {
                    if(value(arr[i], i) === true){
                        return true;
                    }
                }
                return false;
            }
            return core.array.indexOf(arr, value, b) > -1;
        },

        /**
         * 주어진 인덱스의 요소를 반환
         * @function
         * @name axl.array.indexOf
         * @param {Array} obj 배열
         * @param {Function} cb 콜백함수
         * @return {number}
         *
         * @example
         * axl.array.indexOf([1, '일', 2, '이', 3, '삼'], '일');  // 1
         */
        indexOf: nativeCall(arrayProto.indexOf) || function (arr, value, b) {
            for (var i = 0, len = arr.length; i < len; i++) {
                if ( (b !== false && arr[i] === value) || (b === false && arr[i] == value) ) { return i; }
            }
            return -1;
        },

        /**
         * 주어진 배열에서 index에 해당하는 요소를 삭제
         *
         * @param {Array} value 배열
         * @param {number} index 삭제할 인덱스 or 요소
         * @return {Array} 지정한 요소가 삭제된 배열
         * @example
         * axl.array.removeAt([1, 2, 3, 4], 1); // [1, 3, 4]
         */
        removeAt: function (value, index) {
            if (!core.is(value, 'array')) { return value; }
            value.splice(index, 1);
            return value;
        },


        /**
         * 주어진 배열에서 해당하는 요소를 삭제
         *
         * @param {Array} value 배열
         * @param {*} item 요소
         * @return {Array} 지정한 요소가 삭제된 배열
         * @example
         * axl.array.remove(['a', 'b', 'c'], 'b'); // ['a', 'c']
         *
         * axl.array.remove(['a', 'b', 'c'], function(value){
         *     return value === 'b';
         * }); // ['a', 'c']
         */
        remove: function (value, iter) {
            if (!core.is(value, 'array')) { return value; }
            if(typeof iter === 'function'){
                for(var i = value.length, item; item = value[--i]; ){
                    if(iter(item, i) === true){
                        value = this.removeAt(value, i);
                    }
                }
                return value;
            } else {
                var index = this.indexOf(value, iter);
                if(index < 0) { return value; }
                return this.removeAt(value, index);
            }
        },

        /**
         * 주어진 배열에서 가장 큰 요소를 반환
         *
         * @param {Array} array 배열
         * @return {number} 최대값
         * @example
         * axl.array.max([2, 1, 3, 5, 2, 8]); // 8
         */
        max: function( array ) {
            return Math.max.apply( Math, array );
        },

        /**
         * 주어진 배열에서 가장 작은 요소를 반환
         *
         * @param {Array} array 배열
         * @return {number} 최소값
         * @example
         * axl.array.min([2, 1, 3, 5, 2, 8]); // 1
         */
        min: function( array ) {
            return Math.min.apply( Math, array );
        },

        /**
         * 배열의 요소를 역순으로 재배치
         *
         * @name reverse
         * @param {Array} array 배열
         * @return {Array} 역순으로 정렬된 새로운 배열
         * @example
         * axl.array.reverse([1, 2, 3]); // [3, 2, 1]
         */
        reverse: nativeCall(arrayProto.reverse) || function(array) {
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
         * @param {Array} arr1 배열1
         * @param {Array} arr2 배열2
         * @returns {Array} 차집합 배열
         * @example
         * axl.array.different([1, 2, 3, 4, 5], [3, 4, 5, 6, 7]); // [1, 2, 6, 7]
         */
        different: function(arr1, arr2) {
            var newArr = [];
            core.each(arr1, function (value) {
                if(core.array.indexOf(arr2, value) < 0) {
                    newArr.push(value);
                }
            });
            core.each(arr2, function (value) {
                if(core.array.indexOf(arr1, value) < 0) {
                    newArr.push(value);
                }
            });
            return newArr;
        }
    });
    /////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     * 날짜관련 유틸함수
     * @namespace
     * @name axl.date
     */
    core.addon('date', function () {
        var months = "Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec".split(","),
            fullMonths = "January,Febrary,March,April,May,June,July,Augst,September,October,November,December".split(",");


        function compare(d1, d2) {
            if(!(d1 instanceof Date)){ d1 = core.date.parse(d1); }
            if(!(d2 instanceof Date)){ d2 = core.date.parse(d2); }

            return d1.getTime() > d2.getTime() ? -1 : (d1.getTime() === d2.getTime() ? 0 : 1);
        }

        return /** @lends axl.date */{
            MONTHS_NAME: months,
            MONTHS_FULLNAME: fullMonths,

            /**
             * 날짜형식을 지정한 포맷의 문자열로 변환
             *
             * @param {Date} formatDate
             * @param {string} formatString} 포맷 문자열
             * @return {string} 변환된 문자열
             *
             * @example
             * axl.date.format(new Date(), "yy/MM/dd");
             * // '15/01/05'
             */
            format: function (formatDate, formatString) {
                formatString || (formatString = 'yyyy-MM-dd');
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
                    return formatString.replace(/yyyy/g, yyyy).replace(/yy/g, yy).replace(/MMMM/g, MMMM).replace(/MMM/g, MMM).replace(/MM/g, MM).replace(/M/g, M).replace(/dd/g, dd).replace(/d/g, d).replace(/hh/g, hh).replace(/h/g, h).replace(/mm/g, mm).replace(/m/g, m).replace(/ss/g, ss).replace(/s/g, s).replace(/!!!!/g, MMMM).replace(/!!!/g, MMM).replace(/H/g, H).replace(/x/g, x);
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
            isValid: function(date) {
                try {
                    return !isNaN( this.parse(date).getTime() );
                } catch(e){
                    return false;
                }
            },

            /**
             * date가 start와 end사이인지 여부
             *
             * @param {Date} date 날짜
             * @param {Date} start 시작일시
             * @param {Date} end 만료일시
             * @return {boolean} 두날짜 사이에 있는지 여부
             * @example
             * axl.date.between('2014-09-12', '2014-09-11', '2014=09-12'); // true
             * axl.date.between('2014-09-12', '2014-09-11', '2014=09-11') // false
             */
            between: function (date, start, end) {
                if(!date.getDate) { date = core.date.parse(date); }
                if(!start.getDate) { start = core.date.parse(start); }
                if(!end.getDate) { end = core.date.parse(end); }
                return date.getTime() >= start.getTime() && date.getTime() <= end.getTime();
            },

            /**
             * 날짜 비교
             *
             * @function
             * @name axl.date.compare
             * @param {Date} date1 날짜1
             * @param {Date} date2 날짜2
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
             * @param {Date|string} date1 날짜1
             * @param {Date|string} date2 날짜2
             * @return {boolean} 두 날짜의 년월일이 동일한지 여부
             * @example
             * axl.date.equalsYMH('2014-12-23 11:12:23', '2014-12-23 09:00:21'); // true
             */
            equalsYMH: function(a, b) {
                var ret = true;
                if (!a || !b){ return false; }
                if(!a.getDate) { a = this.parse(a); }
                if(!b.getDate) { b = this.parse(b); }
                each(['getFullYear', 'getMonth', 'getDate'], function(fn) {
                    ret = ret && (a[fn]() === b[fn]());
                    if (!ret) { return false; }
                });
                return ret;
            },

            /**
             * value날짜가 date이후인지 여부
             *
             * @param {Date} value 날짜
             * @param {Date} date 체크할 날짜
             * @return {boolean} 주어진 날짜가 지정된 날짜의 이후인지 체크
             * @example
             * axl.date.isAfter('2014-12-23', '2013-12-23'); // false
             */
            isAfter: function (value, date) {
                return compare(value, date || new Date()) === 1;
            },

            /**
             * value날짜가 date이전인지 여부
             *
             * @param {Date} value 날짜
             * @param {Date} date 체크할 날짜
             * @return {boolean} 주어진 날짜가 지정된 날짜의 이후인지 체크
             * @example
             * axl.date.isBefore('2014-12-23', '2013-12-23'); // true
             */
            isBefore: function (value, date) {
                return compare(value, date || new Date()) === -1;
            },

            /**
             * 주어진 날짜를 기준으로 type만큼 가감된 날짜를 format형태로 반환(내가 이걸 왜 beforeDate로 명명 했을까나..;;;)
             * @param {Date} date 기준날짜
             * @param {string} type -2d, -3d, 4M, 2y ..
             * @param {string} format 포맷
             * @returns {Date|string} format지정값에 따라 결과를 날짜형 또는 문자열로 변환해서 반환
             * @example
             * axl.date.calcDate('2014-12-23', '-3m'); // 2014-09-23(Date)
             * axl.date.calcDate('2014-12-23', '-3m', 'yyyy/MM/dd'); // '2014/09/23'(string)
             *
             * axl.date.calcDate('2014-12-23', '-10d'); // 2014-12-13(Date)
             */
            calcDate: function(date, type, format) {
                date = this.parse(date);
                var m = type.match(/([-+]*)([0-9]*)([a-z]+)/i),
                    g = m[1] === '-' ? -1 : 1,
                    d = (m[2]|0) * g;

                switch(m[3]) {
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
                if(format) {
                    return this.format(date, format);
                }
                return date;
            },

            /**
             * 주어진 날짜 형식의 문자열을 Date객체로 변환
             *
             * @function
             * @name axl.date.parse
             * @param {string} dateStringInRange 날짜 형식의 문자열
             * @return {Date} 주어진 날짜문자열을 파싱한 값을 Date형으로 반환
             * @example
             * axl.date.parse('2014-11-12');
             * // Wed Nov 12 2014 00:00:00 GMT+0900 (대한민국 표준시)
             *
             * axl.date.parse('20141112');
             * // Wed Nov 12 2014 00:00:00 GMT+0900 (대한민국 표준시)
             */
            parse: (function() {
                var isoExp = /^\s*(\d{4})(\d{2})(\d{2})(\d{2})?(\d{2})?(\d{2})?\s*$/;
                return function (dateStringInRange) {
                    var date, month, parts;

                    if (dateStringInRange instanceof Date) {
                        return dateStringInRange;
                    }

                    dateStringInRange = (dateStringInRange+'').replace(/[^\d]+/g, '');
                    date = new Date(dateStringInRange);
                    if (!isNaN(date)) {
                        return date;
                    }

                    date = new Date(NaN);
                    parts = isoExp.exec(dateStringInRange);

                    if (parts) {
                        month = +parts[2];
                        date.setFullYear(parts[1]|0, month - 1, parts[3]|0);
                        date.setHours(parts[4]|0);
                        date.setMinutes(parts[5]|0);
                        date.setSeconds(parts[6]|0);
                        if (month != date.getMonth() + 1) {
                            date.setTime(NaN);
                        }
                        return date;
                    }
                    return new Date;
                };
            })(),

            /**
             * 두 날짜의 월 간격
             * @param {Date} d1 날짜 1
             * @param {Date} d2 날짜 2
             * @return {number} 두날짜의 월차
             * axl.date.monthDiff('2011-02-12', '2014-11-23'); // 44
             */
            monthDiff: function(d1, d2) {
                d1 = this.parse(d1);
                d2 = this.parse(d2);

                var months;
                months = (d2.getFullYear() - d1.getFullYear()) * 12;
                months -= d1.getMonth() + 1;
                months += d2.getMonth();
                return months;
            },

            /**
             * 주어진 년월의 일수를 반환
             *
             * @param {number} year 년도
             * @param {number} month 월
             * @return {Date} 주어진 년월이 마지막 날짜
             * @example
             * axl.date.daysInMonth(2014, 2); // 28
             */
            daysInMonth: function(year, month) {
                var dd = new Date(year|0, month|0, 0);
                return dd.getDate();
            },

            /**
             * 주어진 시간이 현재부터 몇시간 이전인지 표현(예: -54000 -> 54초 이전)
             *
             * @function
             * @name axl.date.prettyDuration
             * @param {Date|Interval} time 시간
             * @param {Date|Interval} [std] 기준시간
             * @param {string} [tailWord = '이전'] 기준시간
             * @return {Object}
             *
             * @example
             * axl.date.prettyDuration(new Date() - 51811); -> "52초 이전"
             */
            prettyDuration: (function() {
                var ints = {
                    '초': 1,
                    '분': 60,
                    '시': 3600,
                    '일': 86400,
                    '주': 604800,
                    '월': 2592000,
                    '년': 31536000
                };

                return function(time, std, tailWord) {
                    std || (std = +new Date);
                    tailWord || (tailWord = '이전');

                    if(time instanceof Date) {
                        time = time.getTime();
                    }
                    // time = +new Date(time);

                    var gap = (std - time) / 1000,
                        amount, measure;

                    for (var i in ints) {
                        if (gap > ints[i]) { measure = i; }
                    }

                    amount = gap / ints[measure];
                    amount = gap > ints.day ? (Math.round(amount * 100) / 100) : Math.round(amount);
                    amount += measure + ' ' + tailWord;

                    return amount;
                };
            }()),

            /**
             * 밀리초를 시,분,초로 변환
             * @param amount 밀리초값
             * @returns {Object} dates 변환된 시간 값
             * @returns {number} dates.days 일 수
             * @returns {number} dates.hours 시간 수
             * @returns {number} dates.mins 분 수
             * @returns {number} dates.secs 초 수
             * @example
             * axl.date.msToTime(2134000);
             * // {days: 0, hours: 0, mins: 35, secs: 34}
             */
            msToTime: function(amount) {
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
             * @param {Date} t1 기준 시간
             * @param {Date} t2 비교할 시간
             * @returns {Object} dates 시간차 값들이 들어있는 객체
             * @returns {number} dates.ms 밀리초
             * @returns {number} dates.secs 초
             * @returns {number} dates.mins 분
             * @returns {number} dates.hours 시
             * @returns {number} dates.days 일
             * @returns {number} dates.weeks 주
             * @returns {number} dates.diff
             *
             * @example
             * axl.date.diffTime(new Date, new Date(new Date() - 51811));
             * // {ms: 811, secs: 51, mins: 0, hours: 0, days: 0, weeks: 0, diff: 51811}
             */
            diffTime: function(t1, t2) {
                if(!core.is(t1, 'date')) { t1 = new Date(t1); };
                if(!core.is(t2, 'date')) { t2 = new Date(t2); };

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
             * @param {Date} date 날짜
             * @returns {number}
             * @example
             * axl.date.weekOfYear(new Date); // 2 // 2015-01-05를 기준으로 했을 때
             */
            weekOfYear : (function() {
                var ms1d = 1000 * 60 * 60 * 24,
                    ms7d = 7 * ms1d;

                return function(date) {
                    var DC3 = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate() + 3) / ms1d,
                        AWN = Math.floor(DC3 / 7),
                        Wyr = new Date(AWN * ms7d).getUTCFullYear();

                    return AWN - Math.floor(Date.UTC(Wyr, 0, 7) / ms7d) + 1;
                };
            }()),

            /**
             * 윤년인가
             * @param {number} y 년도
             * @returns {boolean}
             * @example
             * axl.date.isLeapYear(2014); // false
             */
            isLeapYear: function ( y ) {
                if ( toString.call( y ) === '[object Date]' ) { y = y.getUTCFullYear(); }
                return (( y % 4 === 0 ) && ( y % 100 !== 0 )) || ( y % 400 === 0 );
            },

            /**
             * 날짜 가감함수
             * @param {Date} date 날짜
             * @param {string} interval 가감타입(ms, s, m, h, d, M, y)
             * @param {number} value 가감 크기
             * @returns {Date} 가감된 날짜의 Date객체
             * @example
             * // 2014-06-10에서 y(년도)를 -4 한 값을 계산
             * var d = axl.date.add(new Date(2014, 5, 10), 'y', -4); // 2010-06-10
             */
            add: function(date, interval, value) {
                var d = new Date(date.getTime());
                if (!interval || value === 0) {
                    return d;
                }

                switch(interval) {
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
             * 시분초 normalize화 처리
             * @param {number} h 시
             * @param {number} M 분
             * @param {number} s 초
             * @param {number} ms 밀리초
             * @returns {Object} dates 시간정보가 담긴 객체
             * @returns {number} dates.day 일
             * @returns {number} dates.hour 시
             * @returns {number} dates.min 분
             * @returns {number} dates.sec 초
             * @returns {number} dates.ms 밀리초
             * @example
             * axl.date.normalize(0, 0, 120, 0) // {day:0, hour: 0, min: 2, sec: 0, ms: 0} // 즉, 120초가 2분으로 변환
             */
            normalize: function(h, M, s, ms) {
                h = h || 0;
                M = M || 0;
                s = s || 0;
                ms = ms || 0;

                var d = 0;

                if(ms > 1000) {
                    s += Math.floor(ms / 1000);
                    ms = ms % 1000;
                }

                if(s > 60) {
                    M += Math.floor(s / 60);
                    s = s % 60;
                }

                if(M > 60) {
                    h += Math.floor(M / 60);
                    M = M % 60;
                }

                if(h > 24) {
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
    /////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     * @namespace
     * @name axl.uri
     */
    core.addon('uri', /** @lends axl.uri */{

        /**
         * 주어진 url에 쿼리스츠링을 조합
         *
         * @param {string} url
         * @param {string:Object} string
         * @return {string}
         *
         * @example
         * axl.uri.addParam("board.do", {"a":1, "b": 2, "c": {"d": 4}}); // "board.do?a=1&b=2&c[d]=4"
         * axl.uri.addParam("board.do?id=123", {"a":1, "b": 2, "c": {"d": 4}}); // "board.do?id=123&a=1&b=2&c[d]=4"
         */
        addParam: function (url, string) {
            if (core.is(string, 'object')) {
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
         * @return {Object}
         *
         * @example
         * axl.uri.parseQuery("a=1&b=2"); // {"a": 1, "b": 2}
         */
        parseQuery: function (query) {
            if (!query) {
                return {};
            }
            if (query.length > 0 && query.charAt(0) === '?') { query = query.substr(1); }

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
         * @return {Object}
         *
         * @example
         * axl.uri.parseUrl("http://www.axl.com:8080/list.do?a=1&b=2#comment");
         * // {scheme: "http", host: "www.axl.com", port: "8080", path: "/list.do", query: "a=1&b=2"…}
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
                while (i--) { uri[o.key[i]] = m[i] || ""; }
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
        }
    });
    /////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * css3관련 유틸함수들이 들어있는 객체이다.
     * @namespace
     * @name axl.css3
     */
    core.addon('css3', function() {

        var _tmpDiv = doc.createElement('div'),
            _prefixes = ['Webkit', 'Moz', 'O', 'ms', ''],
            _style = _tmpDiv.style,
            _noReg = /^([0-9]+)[px]+$/,
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
            string  = core.string;

        function prefixStyle(name, isHippen) {
            if ( _vendor === false ) return name;
            if ( _vendor === '' ) return name;
            if(isHippen){
                return '-' + _vendor.toLowerCase()+'-'+name[0].toLowerCase()+name.substr(1);
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
            support3D: (function() {
                var body = doc.body,
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
                } else {
                    parent.parentNode.removeChild(parent);
                }
                docEl.style.overflow = docOverflow;
                return cssTranslate3dSupported;
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
         * @param {Object} [options]
         * @param {Date} [options.expires] 만료시간
         * @param {string} [options.path] 쿠키의 유효경로
         * @param {string} [options.domain] 쿠키의 유효 도메인
         * @param {boolean} [options.secure] https에서만 쿠키 설정이 가능하도록 하는 속성
         * @example
         * axl.Cookie.set('userid', 'common');
         * // or
         * axl.Cookie.set({
         *              'userid': 'common',
         *              'name': '바이널'
         *              });
         */
        set: function (name, value, options) {
            if(!core.is(name, 'string')) {
                core.each(name, function(val, key) {
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
         * axl.Cookie.get('userid'); // 'common'
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
            if(core.is(name, 'string')) {
                doc.cookie = name + "=;expires=Fri, 31 Dec 1987 23:59:59 GMT;";
            } else {
                core.each(name, function(val, key) {
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
        setItem: function(name, val, sep) {
            sep = sep || '|';
            val = val + '';

            var value = this.get(name),
                values = value ? value.split(sep) : [];

            if(!core.array.include(values, val)) {
                values.push(val);
            }

            this.set.apply(this, [name, values.join(sep)].concat(arguments));
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
        removeItem: function(name, val, sep) {
            sep = sep || '|';
            val = val + '';

            var value = this.get(name),
                values = value ? value.split(sep) : [];

            values = core.array.remove(values, val);

            this.set.apply(this, [name, values.join(sep)].concat(arguments));
        }
    });
    /////////////////////////////////////////////////////////////////////////////////////////////////



    core.addon(/** @lends common */ {
        /**
         * 현재 페이지의 호스트주소를 반환
         * @returns {string}
         * @example
         * alert(axl.getHost());
         */
        getHost: function() {
            var loc = doc.location;
            return loc.protocol + '//' + loc.host;
        },
        /**
         * 현재 url 반환(쿼리스트링, # 제외)
         * @returns {string}
         */
        getPageUrl: function() {
            var loc = doc.location;
            return loc.protocol + '//' + loc.host + loc.pathname;
        },


        /**
         * 브라우저의 Detect 정보: 되도록이면 Modernizr 라이브러리를 사용할 것을 권함
         *
         * @example
         * axl.browser.isTouch // 터치디바이스 여부
         * axl.browser.isRetina // 레티나 여부
         * axl.browser.isMobile // orientation 작동여부로 판단
         * axl.browser.isMac // 맥OS
         * axl.browser.isLinux // 리눅스
         * axl.browser.isWin // 윈도우즈
         * axl.browser.is64Bit // 64비트 플랫폼
         *
         * axl.browser.isIE // IE
         * axl.browser.ieVersion // IE의 버전
         * axl.browser.isOpera // 오페라
         * axl.browser.isChrome // 크롬
         * axl.browser.isSafari // 사파리
         * axl.browser.isWebKit // 웹킷
         * axl.browser.isGecko // 파이어폭스
         * axl.browser.isIETri4 // IE엔진
         * axl.browser.isAir // 어도비 에어
         * axl.browser.isIOS // 아이폰, 아이패드
         * axl.browser.isAndroid // 안드로이드
         * axl.browser.iosVersion // ios 버전 : [8, 1, 0] -> [major, minor, revision]
         * axl.browser.androidVersion // android 버전 : [4, 1, 0] -> [major, minor, revision]
         * @example
         * if(axl.browser.isIE && axl.browser.isVersion < 9) {
         *     alert('구버전을 사용하고 있습니다.');
         * }
         */
        browser: (function () {
            // 아 정리하고 싶당..
            var detect = {},
                win = context,
                na = win.navigator,
                ua = na.userAgent,
                lua = ua.toLowerCase(),
                match;

            detect.isMobile = typeof orientation !== 'undefined';
            detect.isRetina = 'devicePixelRatio' in window && window.devicePixelRatio > 1;
            detect.isAndroid = lua.indexOf('android') !== -1;
            detect.isOpera = win.opera && win.opera.buildNumber;
            detect.isWebKit = /WebKit/.test(ua);
            detect.isTouch = !!('ontouchstart' in window);

            match = /(msie) ([\w.]+)/.exec(lua) || /(trident)(?:.*rv.?([\w.]+))?/.exec(lua) || ['',null,-1];
            detect.isIE = !detect.isWebKit && !detect.isOpera && match[1] !== null;
            detect.version = parseInt(match[2], 10);
            detect.isOldIE = detect.isIE && detect.version < 9;

            detect.isWin = (na.appVersion.indexOf("Win")!=-1);
            detect.isMac = (ua.indexOf('Mac') !== -1);
            detect.isLinux = (na.appVersion.indexOf("Linux")!=-1);
            detect.is64Bit = (lua.indexOf('wow64') > -1 || (na.platform==='Win64' && lua.indexOf('x64') > -1));

            detect.isChrome = (ua.indexOf('Chrome') !== -1);
            detect.isGecko = (ua.indexOf('Firefox') !==-1);
            detect.isAir = ((/adobeair/i).test(ua));
            detect.isIOS = /(iPad|iPhone)/.test(ua);
            detect.isSafari = !detect.isChrome && (/Safari/).test(ua);
            detect.isIETri4 = (detect.isIE && ua.indexOf('Trident/4.0') !== -1);

            detect.msPointer = na.msPointerEnabled && na.msMaxTouchPoints && !win.PointerEvent;
            detect.pointer = (win.PointerEvent && na.pointerEnabled && na.maxTouchPoints) || detect.msPointer;


            if(detect.isAndroid) {
                detect.androidVersion = +function () {
                    var v = ua.match(/[a|A]ndroid[^\d]*(\d+).?(\d+)?.?(\d+)?/);
                    return [parseInt(v[1], 10), parseInt(v[2] || 0, 10), parseInt(v[3] || 0, 10)];
                }();
            } else if(detect.isIOS) {
                detect.iosVersion = +function () {
                    var v = ua.match(/OS (\d+)_?(\d+)?_?(\d+)?/);
                    return [parseInt(v[1], 10), parseInt(v[2] || 0, 10), parseInt(v[3] || 0, 10)];
                }();
            }

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
         *
         * @param {*} value 배열로 변환하고자 하는 값
         * @return {Array}
         *
         * @example
         * axl.toArray('abcd"); // ["a", "b", "c", "d"]
         * axl.toArray(arguments);  // arguments를 객체를 array로 변환하여 Array에서 지원하는 유틸함수(slice, reverse ...)를 쓸수 있다.
         */
        toArray: function (value) {
            try {
                return arraySlice.apply(value, arraySlice.call(arguments, 1));
            } catch (e){}

            var ret = [];
            try {
                for (var i = 0, len = value.length; i < len; i++) {
                    ret.push(value[i]);
                }
            } catch (e) {}
            return ret;
        },

        /**
         * 15자의 영문, 숫자로 이루어진 유니크한 값 생성
         *
         * @return {string}
         */
        getUniqId: function (len) {
            len = len || 32;
            var rdmString = "";
            for( ; rdmString.length < len; rdmString  += Math.random().toString(36).substr(2));
            return  rdmString.substr(0, len);
        },

        /**
         * 순번으로 유니크값 을 생성해서 반환
         * @function
         * @return {number}
         */
        nextSeq: (function() {
            var seq = 0;
            return function(prefix) {
                return (prefix || '') + (seq += 1);
            };
        }()),

        /**
         * 템플릿 생성
         *
         * @param {string} text 템플릿 문자열
         * @param {Object} data 템플릿 문자열에서 변환될 데이타
         * @param {Object} settings 옵션
         * @return {Function} tempalte 함수
         *
         * @example
         * var tmpl = axl.template('&lt;span>&lt;$=name$>&lt;/span>');
         * var html = tmpl({name: 'Axl rose'}); // &lt;span>Axl rose&lt;/span>
         * $('div').html(html);
         */
        template: function (str, data) {
            var src = 'var __src = [], each='+LIB_NAME+'.each, escapeHTML='+LIB_NAME+'.string.escapeHTML; with(value||{}) { __src.push("';
            str = $.trim(str);
            src += str
                .replace(/\r|\n|\t/g, " ")
                .replace(/\{\{(.*?)\}\}/g, function(a, b) { return '{{' + b.replace(/"/g, '\t') + '}}'; })
                .replace(/"/g, '\\"')
                .replace(/\{\{each ([a-z]+) in ([a-z]+)\}\}(.+)\{\{\/each\}\}/g, function(str, item, items, conts) {
                    return '{{each(value["'+items+'"], function(item){ }}' + conts + ' {{ }); }}';
                })
                .replace(/\{\{(.*?)\}\}/g, function(a, b) { return '{{' + b.replace(/\t/g, '"') + '}}'; })

                .replace(/\{\{=(.+?)\}\}/g, '", $1, "')
                .replace(/\{\{-(.+?)\}\}/g, '", escapeHTML($1), "')
                .replace(/(\{\{|\}\})/g, function(a, b) { return b === '{{' ? '");' : '__src.push("'});

            src+='"); };  console.log(__src);return __src.join("");';
            var f = new Function('value', 'data', src);
            console.log(src);
            if ( data ) {
                return f( data );
            }
            return f;
        },

        /**
         * js파일을 동적으로 로딩
         * @function
         * @name importJs
         * @param {Array} scriptList 로딩할 js파일 리스트
         * @param {Function} callback 주어진 js파일들의 로딩이 모두 완료가 되었을 때 실행할 콜백함수
         * @return {Deferred} 지연객체
         * @example
         * axl.importJs([
         *     '/ui/tab.js'
         * ]).done(function(){
         *     new axl.ui.Tab('#tab');
         * });
         *
         *
         * axl.importJs([
         *     '/ui/tab.js'
         * ], function(){
         *     new axl.ui.Tab('#tab');
         * });
         */
        importJs: (function () {
            // benchmark: https://github.com/eancc/seque-loadjs/blob/master/seque-loadjs.js

            var loadedjs = {},
                isChecked = false;

            return function(scriptList, cb) {
                scriptList = [].concat(scriptList);

                var args = arraySlice.call(arguments),
                    callbackArgs = args.slice(2),
                    len = scriptList.length,
                    loadedLen = 0,
                    defer = $.Deferred();

                for(var i = -1, item; item = scriptList[++i]; ){
                    if(item.indexOf('.js') < 0) {
                        scriptList[i] += '.js';
                    }
                }

                // 이미 포함된 스크립트를 검색
                if(!isChecked) {
                    $('script').each(function() {
                        loadedjs[$(this).attr('src')] = true;
                    });
                    isChecked = true;
                }

                function callback() {
                    if(cb) {
                        cb.apply(null, callbackArgs);
                    }
                    defer.resolve.apply(null, callbackArgs);
                };

                function deepCallbacks(incallback, func, args) {
                    if (func) {
                        func.apply(null, args);
                    }
                    incallback();
                }

                //
                function loadScripts() {
                    if (loadedLen < len) {
                        loadScript(scriptList[loadedLen++], loadScripts);
                    } else if (callback) {
                        callback.apply(null, callbackArgs);
                    }
                }
                //////////

                // load
                function loadScript(scriptName, incallback) {

                    if (scriptName instanceof Array) {
                        incallback = deepCallbacks(incallback, scriptName[1], scriptName.slice(2));
                        scriptName = scriptName[0];
                    }
                    //캐쉬
                    if (scriptName && !loadedjs[scriptName]) {
                        loadedjs[scriptName] = true;

                        var body = doc.getElementsByTagName('body')[0],
                            script = doc.createElement('script');

                        script.type = 'text/javascript';
                        body.appendChild(script);
                        if (script.readyState) {
                            script.onreadystatechange = function() {
                                if (script.readyState === "loaded" || script.readyState === "complete") {
                                    script.onreadystatechange = null;
                                    incallback();
                                }
                            };
                        } else {
                            script.onload = incallback;
                        }

                        script.src = (core.importJs.baseUrl||'')+scriptName;
                    } else if (incallback) {
                        incallback();
                    }
                }
                ////////////

                loadScripts();
                return defer.promise();
            };

        })(),

        /**
         * css 파일 로딩
         * @param {string} href
         * @param {string} id
         * @example
         * axl.importCss('/css/tab.css');
         */
        importCss: function (href, id) {
            var $head = $('head');
            if($head.find('>link[href="' + href + '"]').size()) { return; }

            var link = doc.createElement('link');
            core.extend(link, {
                id: id || 'style_'+(new Data).getTime(),
                rel: 'stylesheet',
                type: 'text/javascript',
                href: href
            });
            $head.appendChild(link);
        }
    });


    /**
     * 루트클래스로서, axl.Base나 axl.Class를 이용해서 클래스를 구현할 경우 axl.Base를 상속받게 된다.
     * @class
     * @name axl.Base
     * @example
     * var Person = axl.Base.extend({  // 또는 var Person = axl.Class({ 으로 구현해도 동일하다.
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
    (function () {
        var F = function(){},
            ignoreNames = ['superclass', 'members', 'statics'];

        function array_indexOf(arr, value) {
            if(Array.prototype.indexOf) {
                return Array.prototype.indexOf.call(arr, value);
            } else {
                for(var i = -1, item; item = arr[++i]; ){
                    if(item == value) { return true; }
                }
                return false;
            }
        }

        // 부모클래스의 함수에 접근할 수 있도록 .supr 속성에 부모함수를 래핑하여 설정
        function wrap(k, fn, supr) {
            return function () {
                var tmp = this.supr, ret;

                this.supr = supr.prototype[k];
                ret = undefined;
                try {
                    ret = fn.apply(this, arguments);
                } finally {
                    this.supr = tmp;
                }
                return ret;
            };
        }

        // 속성 중에 부모클래스에 똑같은 이름의 함수가 있을 경우 래핑처리
        function inherits(what, o, supr) {
            each(o, function(v, k) {
                what[k] = isFunction(v) && isFunction(supr.prototype[k]) ? wrap(k, v, supr) : v;
            });
        }

        function classExtend(attr, c) {
            var supr = c ? (attr.$extend || Object) : this,
                statics, mixins, singleton, instance, hooks;

            if (core.is(attr, 'function')) {
                attr = attr();
            }

            singleton = attr.$singleton || false;
            statics = attr.$statics || false;
            mixins = attr.$mixins || false;
            hooks = attr.$hooks || false;

            !attr.initialize && (attr.initialize = supr.prototype.initialize || function () {});

            function ctor() {
                if (singleton && instance) {
                    return instance;
                } else {
                    instance = this;
                }
                ////////////////////////////////////////////
                var args = arraySlice.call(arguments),
                    me = this,
                    ctr = me.constructor;

                if(ctr.hooks && ctr.hooks.init && ctr.hooks.init.length){
                    each(ctr.hooks.init, function(fn) {
                        fn.call(me);
                    });
                    delete ctr.hooks.init;
                }
                ctr.hooks && each(ctr.hooks.create, function(fn) {
                    fn.call(me);
                });
                //////////////////////////////////////////////

                if (me.initialize) {
                    me.initialize.apply(this, args);
                } else {
                    supr.prototype.initialize && supr.prototype.initialize.apply(me, args);
                }
            }

            function Class() {
                if(!(this instanceof Class)) { return Class; }
                ctor.apply(this, arguments);
            }

            F.prototype = supr.prototype;
            Class.prototype = new F;
            Class.prototype.constructor = Class;
            Class.superclass = supr.prototype;
            /**
             * 해당 클래스에서 상속된 새로운 자식클래스를 생성해주는 함수
             * @function
             * @name axl.Base.extend
             * @param {Object} memthods 메소드모음
             * @return {axl.Base} 새로운 클래스
             * @example
             * var Child = axl.Base.extend({
             *     show: function(){
             *         alert('hello');
             *     }
             * });
             *
             * new Child().show();
             */
            Class.extend = classExtend;
            /**
             * 해당 클래스의 객체가 생성될 때 hook를 등록하는 클래스함수
             * @function
             * @name axl.Base.hooks
             * @param {string} name 훅 이름('init' 는 처음에 한번만 실행, 'create' 는 객체가 생성될 때마다 실행)
             * @param {function} func 실행할 훅 함수
             * @example
             * var Child = axl.Base.extend({
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
            Class.hooks = function(name, func) {
                if(name != 'init' && name != 'create') { return; }
                Class.hooks[name].push(func);
            };
            extend(true, Class.hooks, {
                create:[],
                init:[]
            }, supr.hooks);
            hooks && each(hooks, function(fn, name) {
                Class.hooks(name, fn);
            });


            if (singleton) {
                /**
                 * 싱클톤 클래스의 객체를 반환
                 * @function
                 * @name axl.Base.getInstance
                 * @return {axl.Base}
                 * @example
                 * var Child = axl.Base.extend({
                 *    $singleton: true,
                 *    show: function(){
                 *        alert('hello');
                 *    }
                 * });
                 * Child.getInstance().show();
                 * Child.getInstance().show();
                 */
                Class.getInstance = function() {
                    var arg = arguments,
                        len = arg.length;
                    if (!instance) {
                        switch(true){
                            case !len: instance = new Class; break;
                            case len === 1: instance = new Class(arg[0]); break;
                            case len === 2: instance = new Class(arg[0], arg[1]); break;
                            default: instance = new Class(arg[0], arg[1], arg[2]); break;
                        }
                    }
                    return instance;
                };
            }

            /**
             * 메소드내부에서 부모클레스의 함수를 호출하고자 할 때 사용
             * @function
             * @name axl.Base#suprMethod
             * @return {*} 해당 부모함수의 반환값
             * @example
             * var Parent = axl.Base.extend({
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
             *         this.suprMethod('show'); // 특정 부모함수를 명명해서 호출할 수 도 있음
             *     }
             * });
             * var child = new Child();
             * child.show(); // alert('parent.show'); alert('child.show');
             * child.display(); // alert('parent.show');
             */
            Class.prototype.suprMethod = function (name) {
                var args = arraySlice.call(arguments, 1);
                return supr.prototype[name].apply(this, args);
            };

            Class.mixins = function (o) {
                if (!o.push) {
                    o = [o];
                }
                var proto = this.prototype;
                each(o, function (mixObj, i) {
                    if(!mixObj){ return; }
                    each(mixObj, function (fn, key) {
                        if(key === 'build' && Class.hooks) {
                            Class.hooks.init.push(fn)
                        } else {
                            proto[key] = fn;
                        }
                    });
                });
            };
            mixins && Class.mixins.call(Class, mixins);

            /**
             * 이미 존재하는 클래스에 메소드 추가
             * @function
             * @name axl.Base.members
             * @param {Object} methods 메소드 모음 객체
             * @example
             * var Parent = axl.Base.extend({});
             * Parent.members({
             *     show: function(){
             *         alert('hello');
             *     }
             * });
             * new Parent().show();
             */
            Class.members = function (o) {
                inherits(this.prototype, o, supr);
            };
            attr && Class.members.call(Class, attr);

            /**
             * 이미 존재하는 클래스에 정적메소드 추가
             * @function
             * @name axl.Base.members
             * @param {Object} methods 메소드 모음 객체
             * @example
             * var Parent = axl.Base.extend({});
             * Parent.statics({
             *     show: function(){
             *         alert('hello');
             *     }
             * });
             * Parent.show();
             */
            Class.statics = function (o) {
                o = o || {};
                for (var k in o) {
                    if (array_indexOf(ignoreNames, k) < 0) {
                        this[k] = o[k];
                    }
                }
                return Class;
            };
            Class.statics.call(Class, supr);
            statics && Class.statics.call(Class, statics);

            return Class;
        }

        var Base = function(){ };
        Base.prototype.initialize = function(){ /*throw new Error("Base 클래스로 객체를 생성 할 수 없습니다");*/ };
        Base.prototype.release = function(){};
        Base.prototype.proxy = function(fn) {
            var me = this;
            if(typeof fn === 'string') {
                fn = me[fn];
            }
            return function() {
                return fn.apply(me, arguments);
            };
        }
        Base.extend = classExtend;

        /**
         * 클래스를 생성해주는 함수(axl.Base.extend 별칭)
         * @param {Object} attr 메소드 모음 객체
         * @returns {axl.Base} 새로운 객체
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
        core.Class = function(attr){ return classExtend.apply(this, [attr, true]); };
        return core.Base = Base;
    })();

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


    core.addon('Listener', function () {
        /**
         * 이벤트 리스너로서, 일반 객체에 이벤트 기능을 붙이고자 할경우에 사용
         * @class
         * @name axl.Listener
         * @example
         * var obj = {};
         * axl.Listener.build(obj);
         * obj.on('clickitem', function(){
         *   alert(0);
		 * });
         * obj.trigger('clickitem');
         */
        var Listener = /** @lends axl.Listener# */ {
            /**
             * obj에 이벤트 기능 적용하기
             * @param {Object} obj 이벤트를 적용하고자 하는 객체
             */
            build: function(obj){
                axl.extend(obj, axl.Listener).init();
            },
            /**
             * UI모듈이 작성될 때 내부적으로 호출되는 초기화 함수
             */
            init: function () {
                this._listeners = $(this);
            },

            /**
             * 이벤트 핸들러 등록
             * @param {string} name 이벤트명
             * @param {string} [selector] 타겟
             * @param {eventCallback} [cb] 핸들러
             */
            on: function () {
                var lsn = this._listeners;
                lsn.on.apply(lsn, arguments);
                return this;
            },

            /**
             * 한번만 실행할 이벤트 핸들러 등록
             * @param {string} name 이벤트명
             * @param {string} [selector] 타겟
             * @param {eventCallback} [cb] 핸들러
             */
            once: function () {
                var lsn = this._listeners;
                lsn.once.apply(lsn, arguments);
                return this;
            },

            /**
             * 이벤트 핸들러 삭제
             * @param {string} name 삭제할 이벤트명
             * @param {Function} [cb] 삭제할 핸들러. 이 인자가 없을 경우 name에 등록된 모든 핸들러를 삭제.
             */
            off: function () {
                var lsn = this._listeners;
                lsn.off.apply(lsn, arguments);
                return this;
            },

            /**
             * 이벤트 발생
             * @param {string} name 발생시킬 이벤트명
             * @param {*} [data] 데이타
             */
            trigger: function () {
                var lsn = this._listeners;
                lsn.trigger.apply(lsn, arguments);
                return this;
            }
        };

        return Listener;
    });

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

        var PubSub = $(window);

        var tmp = /** @lends axl.PubSub */{
            /**
             * 이벤트 바인딩
             * @function
             * @param {string} name 이벤트명
             * @param {eventCallback} handler 핸들러
             * @return {axl.PubSub}
             */
            on: function(name, handler) {
                return this;
            },

            /**
             * 이벤트 언바인딩
             * @param {string} name 이벤트명
             * @param {Function} [handler] 핸들러
             * @return {axl.PubSub}
             */
            off: function (name, handler) {
                return this;
            },

            /**
             * 이벤트 트리거
             * @param {string} name 이벤트명
             * @param {Object} [data] 핸들러
             * @return {axl.PubSub}
             */
            trigger: function (name, data) {
                return this;
            }
        };


        return PubSub;
    });

})(jQuery);

/*!
 * @author axl.ui.js
 * @email comahead@gmail.com
 * @create 2014-12-02
 * @license MIT License
 */
(function ($, core) {
    "use strict";

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    var arraySlice = Array.prototype.slice;		// axl.ui.View

    var ui = core.ui = function(name, supr, attr) {
        var bindName, Klass;

        if(!attr) {
            attr = supr;
            supr = null;
        }
        if(typeof supr === 'string'){
            supr = ui[supr];
        } else if(attr.$extend) {
            supr = attr.$extend
        } else if(supr && supr.superclass) {
            // supr = supr;
        } else {
            supr = ui.View;
        }

        if(core.is(attr, 'function')) {
            if(!core.is(attr = attr(supr), 'function')) {
                bindName = attr.bindjQuery;
                Klass = supr.extend(attr);
            } else {
                Klass = attr;
            }
        } else {
            bindName = attr.bindjQuery;
            Klass = supr.extend(attr);
        }

        Klass.prototype.name = name;
        //core.addon('ui.' + name, Klass);
        ui[name] = Klass;
        if (bindName) {
            ui.bindjQuery(Klass, bindName);
        }
        return Klass;
    };

    // obj가 객체가 아닌 함수형일 때 함수를 실행한 값을 반환
    var execObject = function(obj, ctx) {
        return core.is(obj, 'function') ? obj.call(ctx) : obj;
    };

    //
    function eventHandling(inst, type, isNorm, args) {
        isNorm && (args[0] = inst._normalizeEventNamespace(args[0]));
        inst.$el[type].apply(inst.$el, args);

        return inst;
    }

    /**
     * 모든 UI요소 클래스의 최상위 클래스로써, UI클래스를 작성함에 있어서 편리한 기능을 제공해준다.
     * @class
     * @name axl.ui.View
     */
    var View = ui.View = core.Base.extend(/** @lends axl.ui.View# */{
        $statics: {
            _instances: [] // 모든 인스턴스를 갖고 있는다..
        },
        /**
         * 생성자
         * @param {string|Element|jQuery} el 해당 엘리먼트(노드, id, jQuery 어떤 형식이든 상관없다)
         * @param {Object} options 옵션값
         * @return {Object|boolean} false 가 반환되면, 이미 해당 엘리먼트에 해당 모듈이 빌드되어 있거나 disabled 상태임을 의미한다.
         */
        initialize: function (el, options) {
            options || (options = {});

            var me = this,
                moduleName;

            if (!el) {
                throw new Error('[ui.View] el객체가 없습니다.');
            }

            if (!me.name) {
                throw new Error('[ui.View] 클래스의 이름이 없습니다');
            }

            moduleName = me.moduleName = core.string.toFirstLower(me.name);
            me.$el = el instanceof jQuery ? el : $(el);

            // disabled상태면 false 반환
            if (me.$el.hasClass('disabled') || me.$el.attr('data-readony') === 'true' || me.$el.attr('data-disabled') === 'true') {
                return false;
            }

            // 강제로 리빌드 시킬 것인가 ///////////////////////////////////////////////////////////////
            if (options.rebuild === true) {
                try {
                    me.$el.data('ui_' + moduleName).release();
                } catch (e) {}
                me.$el.removeData('ui_' + moduleName);
            } else {
                if (me.$el.data('ui_' + moduleName)) {    // 이미 빌드된거면 false 반환 - 중복 빌드 방지
                    return false;
                }
                me.$el.data('ui_' + moduleName, this);
            }

            // TODO
            // View._instances.push(me);
            me.el = me.$el[0]; // 원래 엘리먼트도 변수에 설정
            me.options = $.extend(true, {}, me.constructor.superclass.defaults, me.defaults, me.$el.data(), options); // 옵션 병합
            me.cid = moduleName + '_' + core.nextSeq(); // 객체 고유 키
            me.ui = {};
            me.subViews = {}; // 하위 컨트롤를 관리하기 위함
            me.eventNamespace = '.' + me.cid;

            me.updateSelectors();
            me._bindOptionEvents();
        },

        /**
         * 옵션으로 넘어온 이벤트들을 바인딩함
         * @private
         */
        _bindOptionEvents: function () {
            var me = this,
                eventPattern = /^([a-z]+) ?([^$]*)$/i;

            // events 속성 처리
            // events: {
            //	'click ul>li.item': 'onItemClick', //=> this.$el.on('click', 'ul>li.item', this.onItemClick); 으로 변환
            // }
            me.options.events = core.extend({},
                execObject(me.events, me),
                execObject(me.options.events, me));
            core.each(me.options.events, function(value, key) {
                if (!eventPattern.test(key)) {
                    return false;
                }

                var name = RegExp.$1,
                    selector = RegExp.$2,
                    args = [name],
                    func = core.is(value, 'function') ? value : (isFn(me[value]) ? me[value] : core.emptyFn);

                if (selector) {
                    args[args.length] = $.trim(selector);
                }

                args[args.length] = function() {
                    func.apply(me, arguments);
                };
                me.on.apply(me, args);
            });

            // options.on에 지정한 이벤트들을 클래스에 바인딩
            me.options.on && core.each(me.options.on, function(value, key) {
                me.on(key, value);
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
            var me = this;
            // selectors 속성 처리
            me.selectors = core.extend({},
                execObject(me.constructor.superclass.selectors, me),
                execObject(me.selectors, me),
                execObject(me.options.selectors, me));
            core.each(me.selectors, function (value, key) {
                if (typeof value === 'string') {
                    me['$' + key] = me.$el.find(value);
                } else if (value instanceof jQuery) {
                    me['$' + key] = value;
                } else {
                    me['$' + key] = $(value);
                }
                me.ui[key] = me['$'+key];
            });

            return me;
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
            return this.$el.find.apply(this.$el, arguments);
        },

        /**
         * 파괴자
         */
        release: function () {
            var me = this;

            me.$el.off(me.eventNamespace);
            me.$el.removeData('ui_'+me.moduleName);

            // me.subviews에 등록된 자식들의 파괴자 호출
            core.each(me.subViews, function(item, key) {
                if (key.substr(0, 1) === '$') {
                    item.off(me.eventNamespace);
                } else {
                    item.release && item.release();
                }
                delete me.subViews[key];
            });

            core.array.remove(core.ui.View._instances, me);
            return me;
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
        setOption: function(name, value) {
            this.options[name] = value;
            /**
             * 옵션이 변경됐을 때 발생
             * @event axl.ui.View#optionchange
             * @type {Object}
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
        getOption: function(name, def) {
            return (name in this.options && this.options[name]) || def;
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
        option: function(name, value) {
            if (arguments.length === 1) {
                return this.getOption(name);
            } else {
                this.setOption(name, value);
            }
        },

        /**
         * 이벤트명에 현재 클래스 고유의 네임스페이스를 붙여서 반환 (ex: 'click mousedown' -> 'click.MyClassName mousedown.MyClassName')
         * @private
         * @param {string|$.Event} en 네임스페이스가 없는 이벤트명
         * @return {string} 네임스페이스가 붙어진 이벤트명
         */
        _normalizeEventNamespace: function(en) {
            if (en instanceof $.Event && en.type.indexOf('.') === -1){
                en.type = en.type + this.eventNamespace;
                return en;
            }

            var me = this,
                m = (en || "").split( /\s/ );
            if (!m || !m.length) {
                return en;
            }

            var name, tmp = [], i;
            for(i = -1; name = m[++i]; ) {
                if (name.indexOf('.') === -1) {
                    tmp.push(name + me.eventNamespace);
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
         * var en = tab.getEventNamespace('click mousedown');
         */
        getEventNamespace: function(en) {
            if(en) {
                var pairs = en.split(' '),
                    tmp = [];
                for(var i = -1, pair; pair = pairs[++i]; ) {
                    tmp.push(pair+this.eventNamespace);
                }
                return tmp.join(' ');
            }
            return this.eventNamespace;
        },

        /**
         * 현재 클래스의 이벤트네임스페이스를 반환
         * @return {string} 이벤트 네임스페이스
         * @example
         * var en = tab.getEN('click mousedown');
         */
        getEN: function () {
            return this.getEventNamespace.apply(this, arguments);
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
        on: function() {
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
        off: function() {
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
        one: function() {
            return eventHandling(this, 'one', true, arraySlice.call(arguments));
        },

        /**
         * me.$el에 등록된 이벤트를 실행
         * @param {string} name 이벤트명
         * @param {*} data 데이타
         * @returns {axl.ui.View} chaining
         * @example
         * var tab = new Tab('#tab');
         * tab.trigger('tabchanged', {selectedIndex: 1});
         */
        trigger: function() {
            return eventHandling(this, 'trigger', false, arraySlice.call(arguments));
        },

        /**
         * 커스텀 이벤트 발생기(주어진 이벤트명 앞에 모듈명이 자동으로 붙는다)<br>
         *     this.customTrigger('expand'); // this.trigger('accordionexpand') 으로 변환
         * @param {string} name 이벤트명
         * @param {*} data 데이타
         * @returns {axl.ui.View} chaining
         * @example
         * var tab = new Tab('#tab');
         * tab.customTrigger('changed', {selectedIndex: 1});
         */
        customTrigger: function() {
            var args = arraySlice.call(arguments);
            args[0] = this.name + args[0];
            return this.trigger(this, 'trigger', false, args);
        },

        /**
         * me.$el에 등록된 이벤트 핸들러를 실행(실제 이벤트는 발생안하고 핸들러 함수만 실행)
         * @param {string} name 이벤트명
         * @param {*} data 데이타
         * @returns {axl.ui.View} chaining
         * @example
         * var tab = new Tab('#tab');
         * tab.triggerHandler('tabchanged', {selectedIndex: 1});
         */
        triggerHandler: function() {
            return eventHandling(this, 'triggerHandler', false, arraySlice.call(arguments));
        },

        /**
         * 해당 엘리먼트에 빌드된 클래스 인스턴스를 반환
         * @return {Class} 해당 인스턴스
         * @example
         * var tab = $('div').Tabs('instance');
         */
        instance: function() {
            return this;
        },

        /**
         * 해당 클래스의 소속 엘리먼트를 반환
         * @return {jQuery} 해당 DOM 엘리먼트
         * @example
         * var tab = new Tab('#tab');
         * tab.getElement().hide();
         */
        getElement: function() {
            return this.$el;
        },

        show: function(){},
        hide: function(){},
        disabled: function(){
            this.$el.disabled();
        },
        enabled: function(){
            this.$el.disabled(false);
        }
    });

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
     * $('#slider').slider({count: 10});
     *
     * // 객체 가져오기 : instance 키워드 사용
     * var slider = $('#slider').slider('instance');
     * slider.move(2); // $('#slider').slider('move', 2); 와 동일
     *
     * // 객체 해제하기 : release 키워드 사용
     * $('#slider').slider('release');
     *
     * // 옵션 변경하기
     * $('#slider').option('effect', 'fade'); // 이때 optionchange 라는 이벤트가 발생된다.
     */
    ui.bindjQuery = function (Klass, name) {
        var old = $.fn[name];

        $.fn[name] = function (options) {
            var a = arguments,
                args = arraySlice.call(a, 1),
                me = this,
                returnValue = this;

            this.each(function() {
                var $this = $(this),
                    methodValue,
                    instance = $this.data('ui_'+name);

                if(instance && options === 'release') {
                    try { instance.release(); } catch(e){}
                    $this.removeData('ui_'+name);
                    return;
                }

                if ( !instance || (a.length === 1 && typeof options !== 'string')) {
                    instance && (instance.release(), $this.removeData('ui_'+name));
                    $this.data('ui_'+name, (instance = new Klass(this, core.extend({}, $this.data(), options), me)));
                }

                if(options === 'instance'){
                    returnValue = instance;
                    return false;
                }

                if (typeof options === 'string' && core.is(instance[options], 'function')) {
                    if(options[0] === '_') {
                        throw new Error('[bindjQuery] private 메소드는 호출할 수 없습니다.');
                    }

                    try {
                        methodValue = instance[options].apply(instance, args);
                    } catch(e) {
                        console.error('[name.'+options+' error] ' + e);
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
        $.fn[name].noConflict = function() {
            $.fn[name] = old;
            return this;
        };
    }

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
    ui.setDefaults = function(name, opts) {
        $.extend(true, core.ui[name].prototype.defaults, opts);
    };

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
    core.keyCode = {
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
    };

    if (typeof define === "function" && define.amd) {
        define([], function() {
            return core.ui;
        });
    }

})(jQuery, window[LIB_NAME]);

(function($, core) {
    "use strict";

    var doc = document;

    /**
     * @namespace
     * @name axl.util
     */
    core.addon('util', function() {

        return /** @lends axl.util */{


            /**
             * ie하위버전에서 주어진 셀렉터에 해당하는 png 이미지가 정상적으로 출력되도록 AlphaImageLoader필터를 적용시켜 주는 함수
             * png
             * @param {string} selector
             * @example
             * axl.util.png24('#thumbnail');
             */
            png24: function ( selector ) {
                var $target;
                if ( typeof (selector) == 'string') {
                    $target = $(selector + ' img');
                } else {
                    $target = selector.find(' img');
                }
                var c = [];
                $target.each(function(j) {
                    c[j] = new Image();
                    c[j].src = this.src;
                    if (navigator.userAgent.match(/msie/i))
                        this.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(enabled='true',sizingMethod='scale',src='" + this.src + "')";
                });
            },

            /**
             * ie하위버전에서 페이지에 존재하는 모든 png 이미지가 정상적으로 출력되도록 AlphaImageLoader필터를 적용시켜 주는 함수
             * png Fix
             */
            pngFix: function () {
                var s, bg;
                $('img[@src*=".png"]', doc.body).each(function () {
                    this.css('filter', 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src=\'' + this.src + '\', sizingMethod=\'\')');
                    this.src = '/resource/images/core/blank.gif';
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
             * 팝업을 띄우는 함수. (axl.openPopup으로도 사용가능)
             * @param {string} url 주소
             * @param {number=} width 너비.
             * @param {number=} height 높이.
             * @param {opts=} 팝업 창 모양 제어 옵션.
             * @example
             * axl.openPopup('http://google.com', 500, 400, {scrollbars: 'no'});
             */
            openPopup: function (url, width, height, opts) {
                opts = extend({

                }, opts);
                width = width || 600;
                height = height || 400;
                //var winCoords = axl.util.popupCoords(width, height),
                var target = opts.target || '',
                    feature = 'app_, ',
                    tmp = [];

                delete opts.name;
                for(var key in opts) {
                    tmp.push(key + '=' + opts[ key ]);
                }
                core.browser.isSafari && tmp.push('location=yes');
                tmp.push('height='+height);
                tmp.push('width='+width);
                /* + ', top=' + winCoords.top + ', left=' + winCoords.left;*/
                feature += tmp.join(', ');

                window.open(
                    url,
                    target,
                    feature
                );
            },

            /**
             * 팝업의 사이즈에 따른 화면상의 중앙 위치좌표를 반환
             * @param {number} w 너비.
             * @param {number} h 높이.
             * @return {Object} {left: 값, top: 값}
             */
            popupCoords: function (w, h) {
                var wLeft = window.screenLeft ? window.screenLeft : window.screenX,
                    wTop = window.screenTop ? window.screenTop : window.screenY,
                    wWidth = window.outerWidth ? window.outerWidth : document.documentElement.clientWidth,
                    wHeight = window.outerHeight ? window.outerHeight : document.documentElement.clientHeight;

                return {
                    left: wLeft + (wWidth / 2) - (w / 2),
                    top: wTop + (wHeight / 2) - (h / 2) - 25
                };
            },

            /**
             * data-src속성에 있는 이미지url를 src에 설정하여 로드시키는 함수
             * @param { string } target 이미지 요소
             * @return { Deferred } deferred
             * @example
             * axl.util.loadImages('img[data-src]').done(function(){
             *     alert('모든 이미지 로딩 완료');
             * });
             */
            loadImages: function(target) {
                var $imgs = $(target),
                    len = $imgs.length,
                    def = $.Deferred();

                function loaded(e) {
                    if (e.type === 'error') {
                        def.reject(e.target);
                        return;
                    }
                    var $target;
                    if($target = $(this).data('target')) {
                        $target.css('background', 'url('+this.src+')');
                    }

                    len--;
                    if (!len) {
                        def.resolve();
                    }
                }

                if(!len){
                    def.resolve();
                } else {
                    $imgs.each(function(i) {
                        var $img = $imgs.eq(i);
                        if(!$img.is('img')) {
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
             * @param allowError 에러 허용여부(true이면 중간에 에러가 나도 다음 이미지를 대기)
             * @return {*}
             * @example
             * axl.util.waitImageLoad('img[data-src]').done(function(){
             *     alert('모든 이미지 로딩 완료');
             * });
             */
            waitImageLoad: function(imgs, allowError){
                if(core.is(imgs, 'string')){
                    imgs = $(imgs);
                }
                var me = this,
                    defer = $.Deferred(),
                    count = imgs.length,
                    loaded = function() {
                        count -= 1;
                        if(count <= 0){
                            defer.resolve();
                        }
                    };

                if(count === 0) {
                    defer.resolve();
                } else {
                    $imgs.each(function(i) {
                        if(this.complete){
                            loaded();
                        } else {
                            $imgs.eq(i).one('load' + (allowError === false?'' : ' error'), loaded);
                        }
                    });
                }

                return defer.promise();
            },

            /**
             * 도큐먼트의 높이를 반환
             * @return {number}
             * @example
             * alert(axl.util.getDocHeight());
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
             * @return {number}
             * @example
             * alert(axl.util.getDocWidth());
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
             * @return {number}
             * @example
             * alert(axl.util.getWinHeight());
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
             * @return {number}
             * @example
             * alert(axl.util.getWinHeight());
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
            },


            /**
             * @function scroll top animate
             * @param {number} y target y
             * @param {Object} data 옵션
             * @param {number} data.triggerY
             * @param {number} data.duration
             * @param {Function} data.triggerCallback
             * @param {Function} data.completeCallback 완료 후 호출될 콜백함수
             * @example
             * axl.util.scrollTopAnimate(0, {
             *     complete: function() {
             *         alert('완료');
             *     },
             *     step: function(){
             *     }
             * });
             */
            scrollTopAnimate: function( y, data ){
                var $body = $("body");
                var duration = ( data == undefined || data.duration == undefined  ) ? 200 : data.duration;

                var isTrigger = false;
                var triggerFuncExe = function(){
                    if( data && data.triggerY != undefined && data.triggerY != "" && $body.scrollTop() < data.triggerY && !isTrigger){
                        isTrigger = true;
                        if( data && data.step ){
                            data.step();
                        }
                    }
                }

                $body.stop().animate({scrollTop:y}, {duration:duration,
                    step:function(){
                        triggerFuncExe();
                    }, complete:function(){
                        triggerFuncExe();
                        if( data && data.complete ){
                            data.complete();
                        }
                    }, ease: "easeOutQuad"
                });
            },

            /**
             * 주어진 요소의 사이즈 & 위치를 반환
             * @param {Element} elem
             * @returns {Object} {width: 너비, height: 높이, offset: { top: 탑위치, left: 레프트위치}}
             *
             * @example
             * var dims = axl.util.getDimensions('#box');
             * console.log(dims.left, dims.top, dims.width, dims.height);
             */
            getDimensions: function( elem ) {
                if(core.is(elem, 'string')){
                    elem = $(elem);
                }

                var el = elem[0];
                if ( el.nodeType === 9 ) {
                    return {
                        width: elem.width(),
                        height: elem.height(),
                        offset: { top: 0, left: 0 }
                    };
                }
                if ( $.isWindow( el ) ) {
                    return {
                        width: elem.width(),
                        height: elem.height(),
                        offset: { top: elem.scrollTop(), left: elem.scrollLeft() }
                    };
                }
                if ( el.preventDefault ) {
                    return {
                        width: 0,
                        height: 0,
                        offset: { top: el.pageY, left: el.pageX }
                    };
                }
                return {
                    width: elem.outerWidth(),
                    height: elem.outerHeight(),
                    offset: elem.offset()
                };
            },

            /**
             * 전체선택 기능 빌드
             * @param {Element} el
             */
            bindCheckAll: function(el) {
                var $con = $(el);

                // 전체 선택
                $con.on('click.globalui', ' input:checkbox:enabled', function (e) {
                    var $el = $(this),
                        $checkes = $con.find('input:checkbox:enabled:not(.ui_notcheck)'),
                        $checkAll = $checkes.filter('.ui_checkall'),
                        $others = $checkes.not('.ui_checkall');

                    if($el.hasClass('ui_checkall')) {
                        $others.prop('checked', this.checked);
                    } else {
                        $checkAll.prop('checked', $others.not(':checked').size() === 0);
                    }
                    $checkAll.triggerHandler('checkallchanged');
                });

            },


            /**
             * 컨텐츠 사이즈에 맞게 창사이즈를 조절
             * @example
             * axl.util.resizeToContent(); // 팝업에서만 사용
             */
            resizeToContent: function() {
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
             * 팝업을 띄운 후에 주어진 콜백함수를 호출
             * @param {string} url
             * @param {Object} feature
             * @param {Function} callback
             * @example
             * axl.util.openPopupAndExec('http://google.com', '', function(){
             *     alert('팝업이 정상적으로 띄워졌습니다.');
             * });
             */
            openPopupAndExec: function(url, feature, callback) {
                feature = $.extend(feature,  {
                    name: 'popupWin',
                    width: 600,
                    height: 531,
                    align: 'center',
                    resizable: 'no',
                    scrollbars: 'no'
                });
                var f = [];
                core.each(feature, function(val, key){
                    f.push(key + '=' + val);
                });

                var popupWin = window.open('', feature.name, f.join(','));
                if (!popupWin || popupWin.outerWidth === 0 || popupWin.outerHeight === 0) {
                    alert("팝업 차단 기능이 설정되어있습니다\n\n차단 기능을 해제(팝업허용) 한 후 다시 이용해 주십시오.");
                    return;
                }

                if (popupWin.location.href === 'about:blank') {
                    popupWin.location.href = url;
                }

                var limit = 0,
                    fn = function() {
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
            }
        };
    });

})(jQuery, window[LIB_NAME]);


(function($, core) {
    "use strict";

    core.s = core.string;
    core.d = core.date;
    core.n = core.number;
    core.a = core.array;
    core.o = core.object;
    core.u = core.uri;
    core.b = core.browser;

    /**
     * 모듈 생성 함수 및 네임스페이스
     * @namespace
     * @name axl.module
     * @example
     * var Geolocation = axl.Base.extend({...});
     * axl.module('Geolocation', Geolocation);
     *
     * //or
     * axl.module('Geolocation', {
     *     initialize: function(){}
     * });
     *
     * axl.module.Geolocation().getInstance()...
     */
    axl.module = function(name, obj) {
        if(!obj){ return; }
        if(!obj.superclass) {
            console.log(name);
            obj = axl.Base.extend(obj);
        }
        this.module[name] = obj;
    };


    var $win = $(window);
    $win.on(function(){
        var bindGlobalEvent = function(type) {
            var data = {};
            return function() {
                if (!data[type + 'Start']) {
                    $win.triggerHandler(type + 'start');
                    data[type + 'Start'] = true;
                }
                data[type + 'Timer'] && clearTimeout(data[type + 'Timer']);
                data[type + 'Timer'] = setTimeout(function () {
                    $win.triggerHandler(type + 'end');
                    data[type + 'Start'] = false;
                }, 200);
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


    $.fn.buildUIControls = function(){
        return this;
    };

})(jQuery, window[LIB_NAME]);