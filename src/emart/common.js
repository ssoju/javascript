/*!
 * @author 김승일
 * @email comahead@vi-nyl.com
 * @description 이마트 코어 라이브러리
 * @license MIT License
 */

 /*
 * @Searching List
 * @jQuery
 *  $.fn
 *      .showLayer() : div를 표시하고 layershown 이벤트 발생.
 *      .hideLayer() : div를 숨기고 layerhidden 이벤트 발생.
 *      .disabled() : disabled속성 변경과 disabled 클래스 토글.
 *      .checked() : checked속성 변경과 changed이벤트 발생
 *      .replaceClass() : 클래스 변환
 *      .checkedValues() : 체크된 값을 반환
 *      .activeItem() : 이전에 추가된 'on'를 지우고 현재 요소에 'on'클래스를 삽입
 *      .trimVal() : 폼요소의 값에서 앞뒤 스페이스를 제거한 값을 반환
 *      .buildUIControls() : 요소에 포함된 공통 UI모듈을 빌드
 *		.toggleLayer()
 *	    .noop() : 빈 메소드 ex) $(this)[isRemove ? 'remove' : 'noop']();
 *
 *
 *
 * @Core : 코어 함수
 * emart
 *          .$win : $(window)
 *          .$doc : $(document)
 *          .$body : $(document.body)
 *          .each() : 반복자
 *          .extend() :  속성 복사
 *          .namespace() : 네임스페이스 생성
 *          .define() : emart를 루트로 한 네임스페이스 생성
 *          .hasOwn() : Object.prototype.hasOwnProperty 단축명
 *          .is() : 타입 체크
 *          .require() : 동적 js 로더
 *          .isEmpty() : 빈값 체크
 *			.isString()
 *			.isArray()
 *			.isFunction()
 *			.isDate()
 *			.isNumber()
 *		    .isElement()
 *          .isTextNode()
 *          .toArray() : 주어진 값을 배열로 변환
 *          .getUniqId() : 고유값 생성(32자리)
 *          .nextSeq() : 0에서 1씩 증가시킨 순번을 반환
 *          .template() : 템플릿 생성
 *			.loadScript() : js 동적 로드
 *			.require() : loadScript 별칭
 *          .Class() : OOP 클래스 정의함수
 *          .Base : OOP 클래스의 Root
 *
 *
 * @Browser : 브라우저 정보
 * emart.browser
 *          .isMobile   : 모바일여부
 *          .isRetina   : 레티나 여부
 *          .isAndroid  : 안드로이드 여부
 *          .isOpera    : 오페라
 *          .isWebKit   : 웹킷
 *          .isTouch    : 터치여부
 *          .isIE       : IE
 *          .isIE6      : IE 6버전
 *          .isIE7      : IE 7버전
 *          .isOldIE    : IE 6, 7, 8버전
 *          .version    : IE버전
 *          .isWin
 *          .isMac      : 맥 OS
 *          .isLinux
 *          .is64Bit
 *          .isChrome   : 크롬
 *          .isGecko    : 파폭
 *          .isAir      : Adobe Air
 *          .isIOS  : 모바일 디바이스
 *          .isSafari   : 사파리
 *          .isIETri4   : 쿼크
 *          .androidVersion
 *          .isNotSupport3DTransform
 *
 * @date
 * emart.date
 *			.diffTime(...)
 *			.compare(...)
 *			.between(...)
 *			.msToTime(...)
 *			.parse(...)
 *			.format(...)
 *		    .normalize(...)
 *		    .isAfter(...)
 *		    .isBefore(...)
 *			.daysInMonth(...)
 *			.prettyDuration(...)
 *			.weekOfYear(...)
 *			.isLeafYear(...)
 *			.add(...)
 *			.diffMonths(...)
 *		    .equalsYMH(...)
 *		    .monthDiff(...)
 *
 *
 * @string
 * emart.string
 *			.trim(...)
 *			.replaceAll(...)
 *			.byteLength(...)
 *			.cutByByte(...)
 *			.charsByByte(...)
 *			.capitalize(...)
 *			.camelize(...)
 *			.dasherise(...)
 *			.toFirstLower(...)
 *			.repeate(...)
 *			.escapeHTML(...)
 *			.unescapeHTML(...)
 *			.toggle(...)
 *			.format(...)
 *		    .sprintf(...)
 *			.stripTags(...)
 *			.stripSctipts(...)
 *
 * @uri
 * emart.uri
 *			.addParam(...)
 *			.parseQuery(...)
 *			.parseUrl(...)
 *			.removeHash(...)
 *			
 * @number
 * emart.number
 *			.zeroPad(...)
 *			.pad(...)
 *			.addComma(...)
 *			.random(...)
 *			.limit(...)
 *
 * @array
 * emart.array
 *			.append(...)
 *			.map(...)
 *			.every(...)
 *			.any(...)
 *			.shuffle(...)
 *			.filter(...)
 *			.include(...)
 *			.indexOf(...)
 *			.removeAt(...)
 *			.remove(...)
 *			.max(...)
 *			.min(...)
 *
 * @json
 * emart.json
 *			.keys(...)
 *			.values(...)
 *			.map(...)
 *			.has(...)
 *			.limit(...)
 *			.toQueryString(...)
 *			.traverse(...)
 *			.remove(...)
 *
 *
 * @Util : Util함수 모음
 * emart.util
 *          .png24(...)              : png 투명 처리
 *          .openPopup(...)          : 팝업 띄우기
 *          .resizePopup(...)        : 팝업 리사이즈
 *          .popupCoords(...)        : 팝업을 화면 가운데에 위치시키기
 *          .centeringImage(...)     : 이미지를 가운데 위치시키기
 *          .lazyImages(...)         : 이미지로딩 대기
 *          .getDocHeight(...)       : 도큐먼트 height
 *          .getDocWidth(...)        : 도큐먼트 width
 *          .getWinWidth(...)        : 윈도우 width
 *          .getWinHeight(...)       : 윈도우 height
 *			 .scrollTopAnimate(...)	 : 스크롤 애니메이션
 *
 *
 * @UI : UI 모듈
 * emart.ui
 * 		 .AccordionList             : 아코디언 리스트
 * 		 .Calendar                  : 달력
 * 	     .Modal                     : 모달
 * 	     .ajaxModal                 : ajax 모달
 * 	     .alert                     : 모달 alert
 *          .Paginate                  : 페이지네이션
 *          .Placeholder               : 플레이스홀더
 *          .ScrollView                : 커스텀스크롤
 *          .Selectbox                 : 스킨형 셀렉트박스
 *          .Slider                    : 슬라이더
 *          .Tab                       : 탭컨트롤
 *			 .AjaxList				   : ajax 리스트
 *	
 */
(function (context, $, undefined) {
    "use strict";
    /* jshint expr: true, validthis: true */
    /* global emart, alert, escape, unescape */

    if(!$) {
        throw new Error("This library requires jQuery");
    }

    // 프레임웍 이름
    var LIB_NAME = window.LIB_NAME = 'emart';

    var $root = $(document.documentElement).addClass('js');
    ('ontouchstart' in context) && $root.addClass('touch');
    ('orientation' in context) && $root.addClass('mobile');

    /**
     * @namespace
     * @name emart
     * @description root namespace of hib site
     */
    var core = context[ LIB_NAME ] || (context[ LIB_NAME ] = {});
    var arrayProto = Array.prototype,
        objectProto = Object.prototype,
        toString = objectProto.toString,
        hasOwn = objectProto.hasOwnProperty,
        arraySlice = arrayProto.slice,
        doc = document,
        tmpInput = doc.createElement('input'),
        tmpNode = doc.createElement('div'),
        emptyFn = function () {},
        /**
         * 주어진 값이 배열형인가
         */
        isArray = Array.isArray || function (value) {
            return value && (typeof value === '[object Array]');
        },
        /**
         * 주어진 값이 함수형인가
         */
        isFunction = (typeof doc !== 'undefined' && typeof doc.getElementsByTagName('body') === 'function') ? function (value) {
            return toString.call(value) === '[object Function]';
        } : function (value) {
            return typeof value === 'function';
        },
        /**
         * 주어진 값이 json형인가
         */
        isPlainObject = (toString.call(null) === '[object Object]') ? function (value) {
            return value !== null
                && value !== undefined
                && toString.call(value) === '[object Object]'
                && value.ownerDocument === undefined;
        } : function (value) {
            return toString.call(value) === '[object Object]';
        },
        /**
         * 반복 함수
         * @function
         * @name emart.each
         * @param {Array|JSON} obj 배열 및 json객체
         * @param {function(this:Array|Object, value, index)} cb
         * @param {Object} ctx
         * @returns {*}
         * @example
         * emart.each({'a': '에이', 'b': '비', 'c': '씨'}, function(value, key) {
         *     alert('key:'+key+', value:'+value);
         *     if(key === 'b') {
         *         return false; // false 를 반환하면 순환을 멈춘다.
         *     }
         * });
         */
        each = function (obj, cb, ctx) {
            if (!obj) {
                return obj;
            }
            var i = 0,
                len = 0,
                isArr = isArray(obj);

            if (isArr) {
                if (obj.forEach) {
                    if (obj.forEach(cb, ctx || obj) === false) {

                    }
                } else {
                    for (i = 0, len = obj.length; i < len; i++) {
                        if (cb.call(ctx || obj, obj[i], i, obj) === false) {
                            break;
                        }
                    }
                }
            } else {
                for (i in obj) {
                    if (hasOwn.call(obj, i)) {
                        if (cb.call(ctx || obj, obj[i], i, obj) === false) {
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
         * @name emart.extend
         * @param {JSON} obj...
         * @returns {*}
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
         * @name emart.clone
         * @param {JSON} obj 배열 및 json객체
         * @returns {*}
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
        /**
         * document jQuery wrapper
         */
        $doc: $(document),
        /**
         * window jQuery wrapper
         */
        $win: $(window),

        /**
         * body jQuery wrapper
         */
        getBody: function(isNative) {
            if(!this.$body) {
                this.$body = $('body');
            }
            return isNative === true ? this.$body[0] : this.$body;
        },

        /**
         * 빈 함수
         * @function
         * @example
         * var func = emart.emptyFn
         */
        emptyFn: emptyFn,

        /**
         * base url
         */
        baseUrl: context.location.protocol + '//' + context.location.host + '/',

        /**
         * 임시 노드: css3스타일의 지원여부와 html을 인코딩/디코딩하거나 노드생성할 때  사용
         */
        tmpNode: tmpNode,

        /**
         * html5 속성의 지원여부를 체크할 때 사용
         * @example
         * is = 'placeholder' in emart.tmpInput;  // placeholder를 지원하는가
         */
        tmpInput: tmpInput,

        /**
         * 터치기반 디바이스 여부
         */
        isTouch: !!('ontouchstart' in window),

        /**
         * 키 코드
         */
        keyCode: {
            BACKSPACE: 8,
            DELETE: 46,
            DOWN: 40,
            END: 35,
            ENTER: 13,
            ESCAPE: 27,
            HOME: 36,
            LEFT: 37,
            PAGE_DOWN: 34,
            PAGE_UP: 33,
            RIGHT: 39,
            SPACE: 32,
            TAB: 9,
            UP: 38
        },

        each: each,
        extend: extend,
        clone: clone
    });

    if (typeof Function.prototype.bind === 'undefined') {
        /**
         * 함수내의 컨텐스트를 지정
         * @param {Object} context 컨텍스트
         * @param {Mixed} ... 두번째 인자부터는 실제로 싱행될 콜백함수로 전달된다.
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
        window.console = {};
        each(['log', 'info', 'warn', 'error', 'assert', 'dir', 'clear', 'profile', 'profileEnd'],
            function(method) {
                console[method] = function(){};
            });
    }

    /**
     * jQuery 객체
     * @class
     * @name $
     */

     // $(':focusable') => 포커싱할 수 있는 대상을 검색
    $.extend(jQuery.expr[':'], {
        focusable: function(el, index, selector){
            return $(el).is('a, button, input[type=text], input[type=file], input[type=checkbox], input[type=radio], select, textarea, [tabindex]');
        }
    });

    // TODO: 뺄 것
    // window나 document와 같은 글로벌 객체에 이벤트를 바인딩할 때 반드시 네임스페이스를 지정하도록 체크.
	// 지정하지 않았을 경우 에러를 발생시킨다.
    var oldOff = $.fn.off;
    $.fn.unbind = $.fn.off = function(name) {
        if((this[0] === window || this[0] === document)
            && name !== 'ready' && name.indexOf('.') < 0) {
            throw new Error('['+name+'] window, document에서 이벤트를 off할 때는 네임스페이스를 꼭 넣어주셔야 합니다.');
        }
        return oldOff.apply(this, arguments);
    };
    if(core.debug === true) {
    var oldOn = $.fn.on;
		$.fn.on = function() {
			if(arguments.length === 3) {
				console.log('Bubble binding...', this[0].tagName, arguments[0], arguments[1]);
				console.trace();				
			}
			return oldOn.apply(this, arguments);
		};
    }

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
	 * placeholder 속성값을 반환
     * @function
     * @name $#getPlaceholder
	 * @return {String}
	 */
	$.fn.getPlaceholder = function(){
		var val = '';
		if(this.attr('ori-placeholder')){
			val = this.attr('ori-placeholder').replace(/\\r\\n/g, "\n").replace(/\\n/g, "\n");
		} else {
			val = ('placeholder' in tmpInput ? this.attr('placeholder') : '');
		}
		return val;
	}

    /**
     * value값의 앞뒤 스페이스문자와 old ie인경우에 placeholder 문자열를 제거하여 실제 값만 반환
     * @function
     * @name $#trimVal
     * @return {String} 문자열
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
        /*return supportPlaceholder ? function(value) {
         if (arguments.length === 0) { return $.trim(this.val()); }
         else { return this.val($.trim(value)); }
         } : function(value) {
         var txtPlaceholder = this.attr('placeholder') || this.attr('ori-placeholder');
         if (arguments.length === 0) {
         if (this.val() === txtPlaceholder) {
         return '';
         }
         return $.trim(this.val());
         } else {
         value = $.trim(value) || txtPlaceholder;
         return this.val(value);
         }
         };*/

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
     * @param {Boolean} checked 체크여부
     * @param {Boolean} isBubble 버블링 여부
     * @returns {jQuery}
     * @fires $#changed
     * @example
     * // 체크박스 체킹여부에 따라 해당 체크박스를 둘러싼 요소에 on클래스를 토글하고자 할 경우
     * $('input:checkbox').on('changed', function(e, isChecked) { 
	 *     $(this).parent()[isChecked?'addClass':'removeClass']('on'); 
	 * });
     * ..
     * // checked 값을 변경
     * $('input:checkbox').checked(true); // 체크박스를 체크하거나 해제하면 부모요소에 on클래스가 토글된다.(마우스
     */
    $.fn.checked = function(checked, isBubble) {
        return this.each(function() {
            if (this.type !== 'checkbox' && this.type !== 'radio') { return; }
            /**
             * @event $#changed
             * @type {object}
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
     * @param {String} old 대상클래스
     * @param {String} newCls 치환클래스
     * @returns {jQuery}
     */
    $.fn.replaceClass = function(old, newCls) {
        return this.each(function() {
            $(this).removeClass(old).addClass(newCls);
        });
    };

    /**
     * 레이어 표시 담당:
     * - 단순히 show하는 것 뿐만 아니라, 레이어가 표시되기전에 layerbeforeshow이벤트를, 표시된 후에는 layershown이벤트를 발생시켜준다.
     * @function
     * @name $#showLayer
     * @param {Element|jQuery} options.button (Optional) 레이어를 띄운 버튼
     * @param {Function} options.onShow (Optional) 표시될 때 실행될 함수
	 * @example
     * // 먼저 이벤트 핸들러 바인딩
	 * $('#box').on('layerbeforeshow', function(){ alert('box 레이어가 뜨기 전'); });
	 * $('#box').on('layershown', function(){ alert('box 레이어가 뜬 후'); });
     * // 레이어를 표시
     * $('#box').showLayer();
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
    $.fn.showLayer.openClass = 'd-open';
    $.fn.showLayer.ON_BEFORESHOW = 'layerbeforeshow';
    $.fn.showLayer.ON_SHOWN = 'layershown';

    /**
     * 레이어 숨김 담당:
     * - 단순히 hide를 하는 것 뿐만 아니라, 숨겨진 후에 layerhidden이벤트를 발생시켜준다.
     * @function
     * @name $#hideLayer
     * @param {Boolean} options.focusOpener (Optional) 숨겨진 후에 버튼에 포커스를 줄것인지 여부
     * @param {Function} options.onHide (Optional) 숨겨진 후에 실행될 함수
	 * @example
     * // 먼저 이벤트 핸들러 바인딩
	 * $('#box').on('layerhidden', function(){ alert('box 레이어가 숨겨진 후'); });
     * // 레이어를 표시
     * $('#box').hideLayer();
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
     * @param {String} cls 활성 클래스명
     * @return {jQuery}
     */
    $.fn.activeItem = function(cls, isReverse) {
        cls = cls || 'on';
        return this[isReverse?'removeClass':'addClass'](cls).siblings()[isReverse?'addClass':'removeClass'](cls).end();
    };

    /**
     * flag에 따라 disabled속성과 클래스를 토글(disabled상태로 변경되면서 disabled클래스도 같이 추가해준다.)
     * @function
     * @name $#disabled
     * @param {String} (Optional) name 클래스이름(default: disabled')
     * @param {Boolean} flag
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
     * 커스텀 체크/라디오박스 빌드(단순히 체크여부에 따라 둘러싸고 있는 부모요소에 on클래스를 토글해줄 뿐이다.)
     * @function
     * @name $#customCheckbox
     * @param {String} (Optional) name
     * @param {Boolean} flag
     * @returns {*}
     */
    $.fn.customCheckbox = function(){
        this.find(':checkbox, :radio').off('.custominput').on('focusin.custominput focusout.custominput click.custominput', function(e) {
            var $el = $(this);

            switch(e.type) {
                case 'click':
                    var isChecked = $el.prop('checked'),
                        id;
                    $el.siblings('label').toggleClass('on', isChecked);
                    if($el.is(':radio')) {
                        $($el[0].form[$el.attr('name')]).not(this).removeClass('on');
                    }
                    break;
                case 'focusin':
                case 'focusout':
                    /*if(id = $el.attr('id')){
                     $('#'+id).toggleClass('focus', e.type === 'focusin');
                     }*/
                    $el.siblings('label').toggleClass('focus', e.type === 'focusin');
                    break;
            }
        });
        return this;
    };

    extend(core, /** @lends emart */{
        /**
         * onclick="return confirm('실행하시겠습니까?')" 에서 '취소'를 선택해도, 
         * window나 document에 등록된 버블링기반 핸들러실행은 취소가 되지 않기 때문에
         * 버블링을 막을 필요가 있을 경우에는 이 함수를 사용하면 된다.
         * @param {Event} e 이벤트객체
         * @param {String} msg confirm 메세지
         * @example 
         * <a href="#" onclick="return emart.confirm(event, '실행하시겠습니까?')">실행</a>
         */
		confirm: function(e, msg) {
			  e = e || window.event;
			
			if(confirm(msg)) { return true; }
			
			if (e.stopPropagation) {
			  e.stopPropagation();
			} else {
			  e.cancelBubble = true;
			}
			return false;
		},
        /**
         * timeStart("name")로 name값을 키로하는 타이머가 시작되며, timeEnd("name")로 해당 name값의 지난 시간을 로그에 출력해준다.
         *
         * @param {String} name 타이머의 키값
         * @param {Boolean} reset 리셋(초기화) 여부
         *
         * @example
         * emart.timeStart('animate');
         * ...
         * emart.timeEnd('animate'); -> animate: 10203ms
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
         * @param {String} name 타이머의 키값
         * @return {Number} 걸린 시간
         *
         * @example
         * emart.timeStart('animate');
         * ...
         * emart.timeEnd('animate'); -> animate: 10203ms
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

    /**
     * 네임스페이스 공간을 생성하고 객체를 설정<br>
     * .를 구분자로 하여 하위 네임스페이스가 생성된다.
     *
     * @function
     * @name emart.namespace
     *
     * @param {String} name 네임스페이스명
     * @param {Object} obj {Optional) 지정된 네임스페이스에 등록할 객체, 함수 등
     * @return {Object} 생성된 네임스페이스
     *
     * @example
     * emart.namesapce('emart.widget.Tabcontrol', TabControl)
     * // 를 native로 풀면,
     * var emart = {
     *     widget: {
     *         Tabcontrol: TabControl
     *     }
     * };
     *
     */
    core.namespace = function (name, obj) {
        if (typeof name !== 'string') {
            obj && (name = obj);
            return name;
        }
        var root = context,
            names = name.split('.'),
            isSet = arguments.length === 2,
            i, item;

        // if (isSet) {
        for(i = -1; item = names[++i]; ) {
            root = root[item] || (root[item] = (i === names.length - 1 ? obj : {}));
        }
        /* } else { // isGet
         for(i = -1; item = names[++i]; ) {
         if (item in root) { root = root[item] }
         else { throw Error(name + '은(는) 정의되지 않은 네임스페이스입니다.'); }
         }
         } */

        return root;
    };

    core.ns = core.namespace;

    /**
     * emart 하위에 name에 해당하는 네임스페이스를 생성하여 object를 설정해주는 함수
     *
     * @function
     * @name emart.define
     *
     * @param {String} name .를 구분자로 해서 common를 시작으로 하위 네임스페이스를 생성. name이 없으면 emart에 추가된다.
     * @param {Object|Function} object
     * @param {Boolean} isExecFn (Optional) object값이 함수형일 때 실행한 값을 설정할 것인가 여부
     *
     * @example
     * emart.define('urls', {
     *     store: 'store.emart.com',
     *     culture: 'culture.emart.com'
     * });
     * 
     * emart.define('urls', {
     *     company: 'company.emart.com'   // urls가 새로 정의되지 않고 merge된다.
     * });
     * 
     * alert(emart.urls.store);
     * alert(emart.urls.company);
     */
    core.define = function (name, object, isExecFn) {
        if (typeof name !== 'string') {
            object = name; name = '';
        }

        var root = core,
            names = name ? name.replace(/^_core\.?/, '').split('.') : [],
            ln = names.length - 1,
            leaf = names[ln];

        if (isExecFn !== false && typeof object === 'function' && !hasOwn.call(object, 'superclass')) {
            object = object.call(root);
        }

        for (var i = 0; i < ln; i++) {
            root = root[names[i]] || (root[names[i]] = {});
        }

        return (leaf && (root[leaf] ? extend(root[leaf], object) : (root[leaf] = object))) || extend(root, object), object;
    };

    core._prefix = LIB_NAME + '.';

    core.define(/** @lends emart */ {
		getHost: function() {
            var loc = document.location;
			return loc.protocol + '//' + loc.host;
		},
        /**
         * 현재 url 반환(쿼리스트링, # 제외)
         * @returns {string}
         */
        getPageUrl: function() {
            var loc = document.location;
            return loc.protocol + '//' + loc.host + loc.pathname;
        },

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
         * emart.browser.isOpera // 오페라
         * emart.browser.isWebKit // 웹킷
         * emart.browser.isIE // IE
         * emart.browser.isIE6 // IE56
         * emart.browser.isIE7 // IE567
         * emart.browser.isOldIE // IE5678
         * emart.browser.version // IE의 브라우저
         * emart.browser.isChrome // 크롬
         * emart.browser.isGecko // 파이어폭스
         * emart.browser.isMac // 맥OS
         * emart.browser.isAir // 어도비 에어
         * emart.browser.isIDevice // 아이폰, 아이패드
         * emart.browser.isSafari // 사파리
         * emart.browser.isIETri4 // IE엔진
         * emart.browser.isNotSupporte3DTransform // 안드로이드 3.0이하 3d transform지원X
         * emart.browser.isGingerbread // 안드로이드 Gingerbread
         * emart.browser.isIcecreamsandwith // 안드로이드 Icecreamsandwith
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
            detect.isIE = !detect.isWebKit && !detect.isOpera && match[1] !== null;		//(/MSIE/gi).test(ua) && (/Explorer/gi).test(na.appName);
            detect.isIE6 = detect.isIE && /MSIE [56]/i.test(ua);
            detect.isIE7 = detect.isIE && /MSIE [567]/i.test(ua);
            detect.isOldIE = detect.isIE && /MSIE [5678]/i.test(ua);
            detect.version = parseInt(match[2], 10);		// 사용법: if (browser.isIE && browser.version > 8) { // 9이상인 ie브라우저

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

            detect.isNotSupporte3DTransform = /android 2/i.test(lua);
            detect.isGingerbread = /android 2.3/i.test(lua);
            detect.isIcecreamsandwith = /android 4.0/i.test(lua);

			if(detect.isAndroid) {
				detect.androidVersion = (function(match){ if(match){ return match[1]|0; } else { return 0; } })(lua.match(/android ([\w.]+)/));
			} else if(detect.isIOS) {
				detect.iosVersion = (function(match){ if(match){ return match[1]|0; } else { return 0; } })(ua.match(/OS ([[0-9]+)/));
			}

            return detect;
        }()),

        /**
         * 타입 체크
         * @param {Mixins} o 타입을 체크할 값
         * @param {String} typeName 타입명(null, number, string, element, nan, infinity, date, array)
         * @return {Boolean}
         */
        is: function (o, typeName) {
            if (o === null) {
                return typeName === 'null';
            }

            if (o && (o.nodeType === 1 || o.nodeType === 9)) {
                return typeName === 'element';
            }

            var s = toString.call(o),
                type = s.match(/\[object (.*?)\]/)[1].toLowerCase();

            if (type === 'number') {
                if (isNaN(o)) {
                    return typeName === 'nan';
                }
                if (!isFinite(o)) {
                    return typeName === 'infinity';
                }
            }

            return type === typeName;
        },

        /**
         * 주어진 인자가 빈값인지 체크
         *
         * @param {Object} value 체크할 문자열
         * @param {Boolean} allowEmptyString (Optional: false) 빈문자를 허용할 것인지 여부
         * @return {Boolean}
         */
        isEmpty: function (value, allowEmptyString) {
            return (value === null) || (value === undefined) || (!allowEmptyString ? value === '' : false) || (core.is(value, 'array') && value.length === 0);
        },

        /**
         * 배열인지 체크
         *
         * @function
         * @param {Object} value 체크할 값
         * @return {Boolean}
         */
        isArray: isArray,

        /**
         * 주어진 시간내에 호출이 되면 무시되고, 초과했을 때만 비로소 fn를 실행시켜주는 함수
         * @param {Function} fn 콜백함수
         * @param {Number} time 딜레이시간
         * @param {Mixin} scope 컨텍스트
         * @returns {Function}
		 * @example
		 * // 리사이징 중일 때는 #box의 크기를 변경하지 않다가,
		 * // 리사이징이 끝나고 0.5초가 지난 후에 #box사이즈를 변경하고자 할 경우에 사용.
		 * $(window).on('resize', emart.delayRun(function(){
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
         * @name emart.isPlainObject
         * @param {Object} value 체크할 값
         * @return {Boolean}
         */
        isPlainObject: isPlainObject,

        /**
         * 함수형인지 체크
         *
         * @function
         * @name emart.isFunction
         * @param {Object} value 체크할 값
         * @return {Boolean}
         */
        isFunction: isFunction,

        /**
         * 숫자 타입인지 체크.
         *
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
         * 주어진 값을 배열로 변환
         *
         * @param {Mixed} value 배열로 변환하고자 하는 값
         * @return {Array}
         *
         * @example
         * emart.toArray('abcd"); => ["a", "b", "c", "d"]
         * emart.toArray(arguments);  => arguments를 객체를 array로 변환하여 Array에서 지원하는 유틸함수(slice, reverse ...)를 쓸수 있다.
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
         * 15자의 숫자로 이루어진 유니크한 값 생성
         *
         * @return {String}
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
         * @return {Number}
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
         * @param {String} text 템플릿 문자열
         * @param {Object} data 템플릿 문자열에서 변환될 데이타
         * @param {Object} settings 옵션
         * @return {Function} tempalte 함수
         *
         * @example
         * var tmpl = emart.template('&lt;span>&lt;$=name$>&lt;/span>');
         * var html = tmpl({name: 'Axl rose'}); => &lt;span>Axl rose&lt;/span>
         * $('div').html(html);
         */
        template: function (str, data) {
            var m,
                src = 'var __src = [], each='+LIB_NAME+'.each, escapeHTML='+LIB_NAME+'.string.escapeHTML; with(value||{}) { __src.push("';
            str = $.trim(str);
            src += str.replace(/\r|\n|\t/g, " ")
                .replace(/<\$(.*?)\$>/g, function(a, b) { return '<$' + b.replace(/"/g, '\t') + '$>'; })
                .replace(/"/g, '\\"')
                .replace(/<\$(.*?)\$>/g, function(a, b) { return '<$' + b.replace(/\t/g, '"') + '$>'; })
				//.replace(/<\$each\(([a-z0-9]+)\:([a-z0-9]+)\)\$>([^<]+?)<\$\/each\$>/ig, '", (function(){ var __ret = \'\'; each($1, function($2, $2_i) { __ret += $3; }); return __ret; })(), "')
                .replace(/<\$=(.+?)\$>/g, '", $1, "')
                .replace(/<\$-(.+?)\$>/g, '", escapeHTML($1), "')
                .replace(/(<\$|\$>)/g, function(a, b) { return b === '<$' ? '");' : '__src.push("'});

            src+='"); }; return __src.join("")';

            var f = new Function('value', 'data', src);
            if ( data ) {
                return f( data );
            }
            return f;
        },

        /**
         * js파일을 동적으로 로딩
         * @function
         * @name loadScript
         * @param {Array} scriptList 로딩할 js파일 리스트
         * @param {Function} callback 주어진 js파일들의 로딩이 모두 완료가 되었을 때 실행할 콜백함수
         */
        loadScript: (function () {
            // benchmark: https://github.com/eancc/seque-loadjs/blob/master/seque-loadjs.js

            var loadedjs = {},
                core = core;

            return function(scriptList, cb) {
                var args = arraySlice.call(arguments),
                    callbackArgs = args.slice(2),
                    len = scriptList.length,
                    loadedLen = 0,
                    defer = $.Deferred();

                // 이미 포함된 스크립트를 검색
                $('script').each(function() {
                    loadedjs[$(this).attr('src')] = true;
                });

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

                        var body = document.getElementsByTagName('body')[0],
                            script = document.createElement('script');

                        script.type = 'text/javascript';
                        script.src = scriptName;

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

                        body.appendChild(script);
                    } else if (incallback) {
                        incallback();
                    }
                }
                ////////////

                if (scriptList instanceof Array) {
                    loadScripts();
                } else if (typeof (scriptList) == "string") {
                    loadScript(scriptList, function() {
                        callback.apply(null, callbackArgs);
                    });
                }
                return defer.promise();
            };

        })()
    });
    core.require = core.loadScript;

    /**
     * 문자열 관련 유틸 함수 모음
     *
     * @namespace
     * @name emart.string
     * @description
     */
    core.define('string', function () {
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

        return /** @lends emart.string */{
            trim: function(value) {
                return value ? value.replace(/^\s+|\s+$/g, "") : value;
            },
            /**
             * 정규식이나 검색문자열을 사용하여 문자열에서 텍스트를 교체
             *
             * @param {String} value 교체를 수행할 문자열
             * @param {RegExp|String} find 검색할 문자열이나 정규식 패턴
             * @param {String} rep 대체할 문자열
             * @return {String} 대체된 결과 문자열
             *
             * @example
             * emart.replaceAll("a1b2c3d", /[0-9]/g, ''); => "abcd"
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
             * emart.byteLength("동해물과"); => 8
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
             * @param {String} fname path문자열
             * @return {String} 확장자
             */
			getFileExt: function(fname){
				fname || (fname = '');
				return fname.substr((~-fname.lastIndexOf(".") >>> 0) + 2);
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
             * emart.string.cutByByte("동해물과", 3, "..."); => "동..."
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
             * emart.string.capitalize("abCdEfg"); => "Abcdefg"
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
             * emart.string.capitalize("ab-cd-efg"); => "abCdEfg"
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
             * emart.string.dasherize("abCdEfg"); => "ab-cd-efg"
             */
            dasherize: function (value) {
                return value ? value.replace(/[_\s]+/g, '-').replace(/([A-Z])/g, '-$1').replace(/-+/g, '-').toLowerCase() : value;
            },

            /**
             * 첫글자를 소문자로 변환하고 이후의 모든 문자를 소문자로 변환
             * @param {String} value
             * @returns {string}
             */
            toFirstLower: function (value) {
                return value ? value.replace(/^[A-Z]/, function(s) { return s.toLowerCase(); }) : value;
            },

            /**
             * 주어진 문자열을 지정한 수만큼 반복하여 조합
             *
             * @param {String} value 문자열
             * @param {Number} cnt 반복 횟수
             * @return {String} 결과 문자열
             *
             * @example
             * emart.string.repeat("ab", 4); => "abababab"
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
             * emart.string.escapeHTML('<div><a href="#">링크</a></div>'); => "&lt;div&gt;&lt;a href=&quot;#&quot;&gt;링크&lt;/a&gt;&lt;/div&gt;"
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
             * emart.string.unescapeHTML('&lt;div&gt;&lt;a href=&quot;#&quot;&gt;링크&lt;/a&gt;&lt;/div&gt;');  => '<div><a href="#">링크</a></div>'
             */
            unescapeHTML: function (value) {
                return value ? (value+"").replace(unescapeRegexp, function (m) {
                    return unescapeChars[m];
                }) : value;
            },

            /**
             * value === these이면 other를,  value !== these 이면 value를 반환
             *
             * @param {String} value 현재 상태값
             * @param {String} these 첫번째 상태값
             * @param {String} other 두번째 상태값
             * @return {String}
             *
             * @example
			 * // 정렬버튼에 이용 
             * emart.string.toggle('ASC", "ASC", "DESC"); => "DESC"
             * emart.string.toggle('DESC", "ASC", "DESC"); => "ASC"
             */
            toggle: function (value, these, other) {
                return these === value ? other : value;
            },

            /**
             * 주어진 문자열에 있는 {인덱스} 부분을 주어진 인수에 해당하는 값으로 치환 후 반환
             *
             * @param {String} format 문자열
             * @param {String} ... 대체할 문자열
             * @return {String} 결과 문자열
             *
             * @example
             * emart.string.format("{0}:{1}:{2} {0}", "a", "b", "c");  => "a:b:c a"
             */
            format: function (format, val) {
                var args = core.toArray(arguments).slice(1),
                    isJson = core.isPlainObject(val);

                return format.replace(/\{([0-9a-z]+)\}/ig, function (m, i) {
                    return isJson ? val[i] : args[i] || '';
                });
            },

			/**
			 * 형식문자열을 주어진 인자값으로 치환하여 반환
			 * @function
			 * @name emart.string.sprintf
			 * @param {String} str 형식문자열(%d, %f, %s)
			 * @param {Mixins} ... 형식문자열에 지정된 형식에 대치되는 값
			 * @example
			 * var ret = emart.string.sprintf('%2d %s', 2, 'abc'); // => '02 abc'
			 */
            sprintf: (function() {
                var re = /%%|%(?:(\d+)[\$#])?([+-])?('.|0| )?(\d*)(?:\.(\d+))?([bcdfosuxXhH])/g,
                    core = core;

                // 형식문자열을 파싱
                var s = function() {
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

                // %d 처리
                s.d = s.u = function(ins, x){
                    return core.number.zeroPad(Number(ins).toString(0x0A), x[2] + x[4], x[3]);
                };

                // %f 처리
                s.f = function(ins, x) {
                    var ins = Number(ins);

                    if (x[5]) {
                        ins = ins.toFixed(x[5]);
                    } else if (x[4]) {
                        ins = ins.toExponential(x[4]);
                    } else {
                        ins = ins.toExponential();
                    }

                    x[2] = x[2] == "-" ? "+" : "-";
                    return core.number.zeroPad(ins, x[2] + x[4], x[3]);
                };

                // %s 처리
                s.s = function(ins, x)
                {
                    return core.number.zeroPad(ins, x[2] + x[4], x[3]);
                };

                return s;
            })(),

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
     * @name emart.uri
     * @description
     */
    core.define('uri', /** @lends emart.uri */{

        /**
         * 주어진 url에 쿼리스츠링을 조합
         *
         * @param {String} url
         * @param {String:Object} string
         * @return {String}
         *
         * @example
         * emart.uri.addParam("board.do", {"a":1, "b": 2, "c": {"d": 4}}); => "board.do?a=1&b=2&c[d]=4"
         * emart.uri.addParam("board.do?id=123", {"a":1, "b": 2, "c": {"d": 4}}); => "board.do?id=123&a=1&b=2&c[d]=4"
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
         * @param {String} query
         * @return {Object}
         *
         * @example
         * emart.uri.parseQuery("a=1&b=2"); => {"a": 1, "b": 2}
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
         * @param {String} str url 문자열
         * @return {Object}
         *
         * @example
         * emart.uri.parseUrl("http://www.emart.com:8080/list.do?a=1&b=2#comment");
         * => {scheme: "http", host: "www.emart.com", port: "8080", path: "/list.do", query: "a=1&b=2"…}
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
         * @param {String} url url 문자열
         * @return {String} 결과 문자열
         *
         * @example
         * emart.uri.removeHash("list.do#comment"); => "list.do"
         */
        removeHash: function (url) {
            return url ? url.replace(/#.*$/, '') : url;
        }
    });

    /**
     * 숫자관련 유틸함수 모음
     *
     * @namespace
     * @name emart.number
     * @description
     */
    core.define('number', /** @lends emart.number */{
        /**
         * 주어진 수를 자릿수만큼 앞자리에 0을 채워서 반환
         *
         * @param {String} value
         * @param {Number} size (Optional: 2)
         * @param {String} ch (Optional: '0')
         * @return {String}
         *
         * @example
         * emart.number.zeroPad(2, 3); => "002"
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
         * @param {Number} value
         * @return {String}
         *
         * @example
         * emart.number.addComma(21342); => "21,342"
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
    core.number.pad = core.number.zeroPad;

    // 네이티브에 f가 존재하지 않으면 false 반환
    function nativeCall(f) {
        return f ? function(obj) {
            return f.apply(obj, arraySlice.call(arguments, 1));
        } : false;
    }

    /**
     * 배열관련 유틸함수
     * @namespace
     * @name emart.array
     */
    core.define('array', /** @lends emart.array */{
        /**
         * 배열 병합
         * @param {Array} arr
         * @param {Array} ...
         * @returns {*}
		 * @exmaple
		 * var newArray = emart.array.append([1,2,3], [4,5,6], [6, 7, 8]); // [1,2,3,4,5,6,7,8]
         */
        append: function (arr) {
            var args = arraySlice.call(arguments);
            arrayProto.push.apply.apply(args);
            return args[0];
        },
        /**
         * 콜백함수로 하여금 요소를 가공하는 함수
         *
         * @function
         * @name emart.array.map
         * @param {Array} obj 배열
         * @param {Function} cb 콜백함수
         * @param {Object} (optional) 컨텍스트
         * @return {Array}
         *
         * @example
         * emart.array.map([1, 2, 3], function(item, index) {
		 *		return item * 10;
		 * });
         * => [10, 20, 30]
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
         * @function
         * @name emart.array.every
         * @return {Boolean} 최종 결과
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
         * @function
         * @name emart.array.any
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
         */
        shuffle: function (obj) {
            var rand,
                index = 0,
                shuffled = [],
                number = core.number;

            each(obj, function (value, k) {
                rand = number.random(index++);
                shuffled[index - 1] = shuffled[rand], shuffled[rand] = value;
            });
            return shuffled;
        },

        /**
         * 콜백함수로 하여금 요소를 걸려내는 함수
         * @function
         * @name emart.array.filter
         * @param {Array} obj 배열
         * @param {Function} cb 콜백함수
         * @param {Object} (optional) 컨텍스트
         * @returns {Array}
         *
         * @example
         * emart.array.filter([1, '일', 2, '이', 3, '삼'], function(item, index) {
		 *		return typeof item === 'string';
		 * });
         * => ['일','이','삼']
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
         * @return {Array}
         *
         * @example
         * emart.array.include([1, '일', 2, '이', 3, '삼'], '삼');  => true
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
         * @name emart.array.indexOf
         * @param {Array} obj 배열
         * @param {Function} cb 콜백함수
         * @return {Array}
         *
         * @example
         * emart.array.indexOf([1, '일', 2, '이', 3, '삼'], '일');  => 1
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
         * @param {Number} index 삭제할 인덱스 or 요소
         * @return {Array} 지정한 요소가 삭제된 배열
         */
        removeAt: function (value, index, cb) {
            if (!core.is(value, 'array')) { return value; }
            value.splice(index, 1);
			cb && cb.call(value, index);
            return value;
        },


        /**
         * 주어진 배열에서 해당하는 요소를 삭제
         *
         * @param {Array} value 배열
         * @param {Mixed} item 요소
         * @return {Array} 지정한 요소가 삭제된 배열
         */
        remove: function (value, iter, cb) {
            if (!core.is(value, 'array')) { return value; }
            if(typeof iter === 'function'){
                for(var i = value.length, item; item = value[--i]; ){
                    if(iter(item, i) === true){
                        value = this.removeAt(value, i, cb);
                    }
                }
                return value;
            } else {
                var index = this.indexOf(value, iter);
                if(index < 0) { return value; }
                return this.removeAt(value, index, cb);
            }
        },

        /**
         * 주어진 배열에서 가장 큰 요소를 반환
         *
         * @param {Array} array 배열
         * @return {Mix}
         */
        max: function( array ) {
            return Math.max.apply( Math, array );
        },

        /**
         * 주어진 배열에서 가장 작은 요소를 반환
         *
         * @param {Array} array 배열
         * @return {Mix}
         */
        min: function( array ) {
            return Math.min.apply( Math, array );
        },

        /**
         * 배열의 요소를 역순으로 재배치
         *
         * @function
         * @name reverse
         * @param {Array} array 배열
         * @return {Array}
         */
        reverse: nativeCall(arrayProto.reverse) || function(array) {
            var first = null;
            var last = null;
            var tmp = null;
            var length = array.length;

            for (first = 0, last = length - 1; first < length / 2; first++, last--) {
                tmp = array[first];
                array[first] = array[last];
                array[last] = tmp;
            }

            return array;
        }
    });

    /**
     * JSON객체 관련 유틸함수
     * @namespace
     * @name emart.object
     */
    core.define('object', /** @lends emart.object */{

        /**
         * 개체의 열거가능한 속성 및 메서드 이름을 배열로 반환
         * @function
         * @name emart.object.keys
         * @param {Object} obj 리터럴 객체
         * @return {Array} 객체의 열거가능한 속성의 이름이 포함된 배열
         *
         * @example
         * emart.object.keys({"name": "Axl rose", "age": 50}); => ["name", "age"]
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
         * @name emart.object.values
         * @param {Object} obj 리터럴 객체
         * @return {Array} 객체의 열거가능한 속성의 값들이 포함된 배열
         *
         * @example
         * emart.object.values({"name": "Axl rose", "age": 50}); => ["Axl rose", 50]
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
         * @param {JSON} obj 배열
         * @param {Function} cb 콜백함수
         * @return {JSON}
         *
         * @example
         * emart.object.map({1; 'one', 2: 'two', 3: 'three'}, function(item, key) {
		 *		return item + '__';
		 * });
         * => {1: 'one__', 2: 'two__', 3: 'three__'}
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
         *
         * @param {Object} obj json객체
         * @return {Boolean} 요소가 하나라도 있는지 여부
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
         * @param {Object} obj 문자열
         * @param {Boolean} isEncode (Optional) URL 인코딩할지 여부
         * @return {String} 결과 문자열
         *
         * @example
         * emart.object.toQueryString({"a":1, "b": 2, "c": {"d": 4}}); => "a=1&b=2&c[d]=4"
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
         * emart.object.travere({1:a, 2:b, 3:c, 4:d]);
		 * => {a:1, b:2, c:3, d:4}
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
         * @param {Number} key 삭제할 키
         * @return 지정한 요소가 삭제된 리터럴
         */
        remove: function (value, key) {
            if (!core.is(value, 'object')) { return value; }
            value[key] = null;
            delete value[key];
            return value;
        },

        /**
         * json를 문자열로 변환
         * @param {JSON} val json 객체
         * @param {Boolean} opts.singleQuotes (Optional) 문자열을 '로 감쌀것인가
         * @param {String} opts.indent (Optional)  들여쓰기 문자(\t or 스페이스)
         * @param {String} opts.nr (Optional) 줄바꿈 문자(\n or 스페이스)
         * @param {Boolean} (Optional) pad 기호와 문자간의 간격
         * @return {String}
         */
        stringify: function (val, opts, pad) {
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


    /**
     * 날짜관련 유틸함수
     * @namespace
     * @name emart.date
     */
    core.define('date', function () {
        var months = "Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec".split(","),
            fullMonths = "January,Febrary,March,April,May,June,July,Augst,September,October,November,December".split(",");


        function compare(d1, d2) {
            if(!(d1 instanceof Date)){ d1 = core.date.parse(d1); }
            if(!(d2 instanceof Date)){ d2 = core.date.parse(d2); }

            return d1.getTime() > d2.getTime() ? -1 : (d1.getTime() === d2.getTime() ? 0 : 1);
        }

        return /** @lends emart.date */{
            MONTHS_NAME: months,
            MONTHS_FULLNAME: fullMonths,

            /**
             * 날짜형식을 지정한 포맷의 문자열로 변환
             *
             * @param {Date} formatDate
             * @param {String} formatString} 포맷 문자열
             * @return {String} 결과 문자열
             *
             * @example
             * emart.date.format(new Date(), "yy:MM:dd");
             * =>
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
             * @return {Boolean}
             */
            between: function (date, start, end) {
                return date.getTime() >= start.getTime() && date.getTime() <= end.getTime();
            },

            /**
             * 날짜 비교
             *
             * @function
             * @name emart.date.compare
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
            equalsYMH: function(a, b) {
                var ret = true;
                if (!a || !a.getDate || !b || !b.getDate) { return false; }
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
             * 주어진 날짜를 기준으로 type만큼 가감된 날짜를 format형태로 반환(내가 이걸 왜 beforeDate로 명명 했을까나..;;;)
             * @param {Date} date 기준날짜
             * @param {String} type -2d, -3d, 4M, 2y ..
             * @param {String} format
             * @returns {Date|String}
             */
            beforeDate: function(date, type, format) {
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
             * @name emart.date.parse
             * @param {String} dateStringInRange 날짜 형식의 문자열
             * @return {Date}
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
             * @return {Number}
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
             * @name emart.date.prettyDuration
             * @param {Date|Interval} time 시간
             * @param {Date|Interval} time (Optional) 기준시간
             * @return {JSON}
             *
             * @example
             * emart.date.prettyDuration(new Date() - 51811); -> "52초 이전"
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
             * @param time
             * @returns {JSON}
             */
            msToTime: function(amount) {
                var days = 0,
                    hours = 0,
                    mins = 0,
                    secs = 0;

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
             * @function
             * @param {Date|Interval} time 시간
             * @param {Date|Interval} time 시간
             * @return {String}
             *
             * @example
             * emart.date.timeDiff(new Date, new Date(new Date() - 51811));
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
             * @returns {Number}
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
             * @param {Number} y 년도
             * @returns {boolean}
             */
            isLeapYear: function ( y ) {
                if ( toString.call( y ) === '[object Date]' ) { y = y.getUTCFullYear(); }
                return (( y % 4 === 0 ) && ( y % 100 !== 0 )) || ( y % 400 === 0 );
            },

            /**
             * 날짜 가감함수
             * @param {Date} date 날짜
             * @param {String} interval 가감타입(ms, s, m, h, d, M, y)
             * @param {Number} value 가감 크기
             * @returns {Date}
			 * @example
			 * // 2014-06-10에서 y(년도)를 -4 한 값을 계산
			 * var d = emart.date.add(new Date(2014, 5, 10), 'y', -4); // 결과 => 2010-06-10
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
             * @param h
             * @param M
             * @param s
             * @param ms
             * @returns {{day: number, hour: (*|number), min: (*|number), sec: (*|number), ms: (*|number)}}
			 * @example
			 * emart.date.normalize(0, 0, 120, 0) // => {day:0, hour: 0, min: 2, sec: 0, ms: 0} // 즉, 120초가 2분으로 변환
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


    /**
     * 루트클래스로서, emart.Base나 emart.Class를 이용해서 클래스를 구현할 경우 emart.Base를 상속받게 된다.
     * @namespace
     * @name emart.Base
     * @example
     * var Person = emart.Base.extend({  // 또는 var Person = emart.Class({ 으로 구현해도 동일하다.
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
    var Base = (function () {
        var isFn = core.isFunction,
            emptyFn = core.emptyFn,
            include = core.array.include,
            F = function(){},
            ignoreNames = ['superclass', 'members', 'statics'];


        // 부모클래스의 함수에 접근할 수 있도록 .supr 속성에 부모함수를 래핑하여 설정
        function wrap(k, fn, supr) {
            return function () {
                var tmp = this.callParent, ret;

                this.callParent = supr.prototype[k];
                ret = undefined;
                try {
                    ret = fn.apply(this, arguments);
                } finally {
                    this.callParent = tmp;
                }
                return ret;
            };
        }

        // 속성 중에 부모클래스에 똑같은 이름의 함수가 있을 경우 래핑처리
        function inherits(what, o, supr) {
			each(o, function(v, k) {
				what[k] = isFn(v) && isFn(supr.prototype[k]) ? wrap(k, v, supr) : v;
			});
        }

        function classExtend(attr, c) {
            var supr = c ? (attr.$extend || Object) : this,
                statics, mixins, singleton, instance;

            if (isFn(attr)) {
                attr = attr();
            }

            singleton = attr.$singleton || false;
            statics = attr.$statics || false;
            mixins = attr.$mixins || false;


            function ctor() {
                if (singleton && instance) {
                    return instance;
                } else {
                    instance = this;
                }

                var args = arraySlice.call(arguments),
                    me = this;
                each(me.constructor.hooks.init, function(fn, i) {
                    fn.call(me);
                });

                if (me.initialize) {
                    me.initialize.apply(this, args);
                } else {
                    supr.prototype.initialize && supr.prototype.initialize.apply(me, args);
                }
            }

            function Class() {
                ctor.apply(this, arguments);
            }

            F.prototype = supr.prototype;
            Class.prototype = new F;
            Class.prototype.constructor = Class;
            Class.superclass = supr.prototype;
            Class.extend = classExtend;
            Class.hooks = extend({
                init:[]
            }, supr.hooks);


            if (singleton) {
                Class.getInstance = function () {
                    if (!instance) {
                        instance = new Class();
                    }
                    return instance;
                };
            }

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
                        if(key === 'init' && Class.hooks) {
                            Class.hooks.init.push(fn)
                        } else {
                            proto[key] = fn;
                        }
                    });
                });
            };
            mixins && Class.mixins.call(Class, mixins);

            Class.members = function (o) {
                inherits(this.prototype, o, supr);
            };
            attr && Class.members.call(Class, attr);

            Class.statics = function (o) {
                o = o || {};
                for (var k in o) {
                    if (!core.array.include(ignoreNames, k)) {
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
        Base.prototype.initialize = function(){};
        Base.prototype.release = function(){};
        Base.extend = classExtend;

        core.Class = function(attr){ return classExtend.apply(this, [attr, true]); };
        return core.Base = Base;
    })();

    core.define('Env', /** @lends emart */{
        /**
         * 사이트의 설정 값들이 들어갈 객체
         *
         * @private
         * @type {Object}
         */
        configs: {},

        /**
         * 설정값을 꺼내오는 함수
         *
         * @param {String} name 설정명. `.`를 구분값으로 단계별로 값을 가져올 수 있다.
         * @param {Object} def (Optional) 설정된 값이 없을 경우 사용할 기본값
         * @return {Object} 설정값
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
         * @param {String} name 설정명. `.`를 구분값으로 단계를 내려가서 설정할 수 있다.
         * @param {Object} value 설정값
         * @return {Object} 설정값
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


    /**
     * @namespace
     * @name emart.valid
     * @description 밸리데이션 함수 모음
     */
    core.define('valid', function () {
        var trim = $.trim,
            isString = core.isString,
            isNumber = core.isNumber,
            isNumeric = core.isNumeric,
            isElement = core.isElement,
            inRange = function(v, s, e) {
                if(typeof v == 'undefined') { return false; }
                v = v | 0;
                if(v >= s && v <= e){ return true; }
                return false;
            };

        return /** @lends emart.valid */{
            empty: core.isEmpty,
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
             * 숫자 체크(실제 숫자타입인가)
             *
             * @param {String} str
             * @return {Boolean}
             */
            rawNum: function (str) {
                isElement(str) && (str = str.value); // 엘리먼인 경우 .value에서 꺼내온다.
                return isNumber(str);
            },

            /**
             * 숫자 체크
             *
             * @param {String} str
             * @param {Boolean} allowSign (optional)  없으면 -, +기호를 허용안함, true이면 -, + 허용함
             * @return {Boolean}
             */
            num: function (str, allowSign) {
                isElement(str) && (str = str.value); // 엘리먼인 경우 .value에서 꺼내온다.
				str = trim(str);
				if(allowSign !== true && !/^[0-9]*$/g.test(str)) { return false; }
                return isNumeric(str);
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

			allowFile: function(path, exts){
				if(!core.isArray(exts)){
					exts = [exts];
				}
				var ext = core.string.getFileExt(path);
				if(!ext){ return false; }
				return core.array.include(exts, ext);
			},

            /**
             * 날짜가 유효한지 체크(20130212, 2013-12-12, 2013-12-12 23:12:12 모두 체크 가능)
             *
             *
             * @param {String} str
             * @return {Boolean}
             */
            date: function(str) {
                isString(str) || (isElement(str) && (str = str.value));
                if(!str){ return false; }
                var s ='',
                    m = str.match(/^(\d{4})[- ]*(\d{2})[- ]*(\d{2})[ ]*(\d{0,2})[:]*(\d{0,2})[:]*(\d{0,2})[:]*$/);
                if(!m || m.length < 4){ return false; }
                if(m.length > 4){
                    if(!inRange(m[4], 0, 23)) { return false; }
                    if(!inRange(m[5], 0, 59)) { return false; }
                    if(!inRange(m[6], 0, 59)) { return false; }
                }
                return core.date.isValid(m[1]+'-'+m[2]+'-'+m[3]);
            },
            /**
             * 유효한 yyyy-MM-dd형식인지 체크(삭제 예정)
             *
             * @deprecated
             * @param {String} str
             * @return {Boolean}
             */
            dateYMD: function (str) {
                isString(str) || (isElement(str) && (str = str.value));
                return (str = trim(str)) ? (/^\d{4}-\d{2}-\d{2}$/).test(str) : false;
            },
            /**
             * 유효한 yyyy-MM-dd hh:mm:ss형식인지 체크(삭제 예정)
             *
             * @deprecated
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

                buf = core.toArray(num);
                odd = buf[7] * 10 + buf[8];

                if (odd % 2 !== 0) { return false; }

                if ((buf[11] !== 6) && (buf[11] !== 7) && (buf[11] !== 9)) { return false; }

                for (var i = 0; i < 12; i++) { sum += (buf[i] *= multipliers[i]); }

                sum = 11 - (sum % 11);
                if (sum >= 10) { sum -= 10; }

                sum += 2;
                if (sum >= 10) { sum -= 10; }

                if (sum !== buf[12]) { return false; }

                return true;
            },


            run: function(frm, validators) {
                var isValid = true;
                each(validators, function(v, k) {

                });
                return isValid;
            }
        };
    });

    /**
	 * css3관련 유틸함수들이 들어있는 객체이다.
     * @namespace
     * @name emart.css3
     * @description
     */
    core.define('css3', function() {

        var _tmpDiv = core.tmpNode,
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

        return /** @lends emart.css3 */{
            support: _vendor !== false,
            support3D: (function() {
                var body = document.body,
                    docEl = document.documentElement,
                    docOverflow;
                if (!body) {
                    body = document.createElement('body');
                    body.fake = true;
                    body.style.background = '';
                    body.style.overflow = 'hidden';
                    body.style.padding = '0 0 0 0';
                    docEl.appendChild(body);
                }
                docOverflow = docEl.style.overflow;
                docEl.style.overflow = 'hidden';

                var parent = document.createElement('div'),
                    div = document.createElement('div'),
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
             * @function
             * @return {String}
             */
            vendor: _vendor,
            /**
             * 주어진 css속성을 지원하는지 체크
             *
             * @param {String} cssName 체크하고자 하는 css명
             * @return {Boolean} 지원여부
			 * @example
			 * if(emart.css3.has('transform')) { ...
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
             * @param {String} cssName css명
             * @return {String}
             * @example
             * emart.css3.prefix('transition'); // => webkitTransition
             */
            prefix: prefixStyle,
            get: function(el, style) {
                if (!el || !core.is(el, 'element')) { return null; }
                var value;
                if (el.currentStyle) {
                    value = el.currentStyle[ string.camelize(style) ];
                } else {
                    value = window.getComputedStyle(el, null)[ string.camelize(style) ];
                }
                if(_noReg.test(value)) {
                    return parseInt(RegExp.$1, 10);
                }
                return value;
            }
        };
    });

    core.define('class', {
        has: function(el, c) {
            if (!el || !core.is(el, 'element')) { return false; }
            var classes = el.className;
            if (!classes) { return false; }
            if (classes == c){ return true; }
            return classes.search("\\b" + c + "\\b") !== -1;
        },
        add: function(el, c) {
            if (!el || !core.is(el, 'element')) { return; }
            if (this.has(el, c)) { return; }
            if (el.className) { c = " " + c; }
            return el.className += c, this;
        },
        remove: function(el, c) {
            if (!el || !core.is(el, 'element')) { return; }
            return el.className = el.className.replace(new RegExp("\\b" + c + "\\b\\s*", "g"), ""), this;
        },
        replace: function(el, c, n) {
            if (!el || !core.is(el, 'element')) { return null; }
            return this.remove(el, c), this.add(el, n), this;
        }
    });

    /**
     * @namespace
     * @name emart.util
     */
    core.define('util', function() {

        return /** @lends emart.util */{


            /**
			 * ie하위버전에서 주어진 셀렉터에 해당하는 png 이미지가 정상적으로 출력되도록 AlphaImageLoader필터를 적용시켜 주는 함수
             * png
             */
            png24: function ( selector ) {
                var $target;
                if ( typeof (selector) == 'string') {
                    $target = $(selector + ' img');
                } else {
                    $target = selector.find(' img');
                }
                var c = new Array();
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
                $('img[@src*=".png"]', document.body).each(function () {
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
             * 팝업을 띄우는 함수. (emart.openPopup으로도 사용가능)
             * @param {string} url 주소
             * @param {number=} width 너비.
             * @param {number=} height 높이.
             * @param {opts=} 팝업 창 모양 제어 옵션.
             */
            openPopup: function (url, width, height, opts) {
                opts = extend({

                }, opts);
                width = width || 600;
                height = height || 400;
                //var winCoords = emart.util.popupCoords(width, height),
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
             * 팝업의 사이즈를 $el 사이즈에 맞게 조절
             */
            resizePopup: function($el) {
                if (!($el instanceof jQuery)) { $el = $($el); }
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

                return {
                    left: wLeft + (wWidth / 2) - (w / 2),
                    top: wTop + (wHeight / 2) - (h / 2) - 25
                };
            },

            /**
             * data-src에 있는 이미지주소를 실제로 불러들인 다음, 주어진 사이즈내에서 가운데에 배치시켜주는 함수
             * @param {jQuery} $imgs
             * @param {Number} wrapWidth 최대 너비 값
             * @param {Number} wrapHeight 최대 높이 값
             * @param {Function} [onError] (optional) 이미지를 불어오지 못했을 경우 실행할 콜백함수
             * @return {Boolean} true 불러들인 이미지가 있었는지 여부
             */
            centeringImage: function ($imgs, wrapWidth, wrapHeight, onError) {
                var hasLazyImage = false;
                var dataSrcAttr = 'data-src';

                $imgs.filter('img[data-src]').each(function(i) {
                    var $img = $(this);
                    wrapWidth = wrapWidth || $img.parent().width();
                    wrapHeight = wrapHeight || $img.parent().height();

                    // 이미지가 로드되면, 실제 사이즈를 체크해서 가로이미지인지 세로이미지인지에 따라 기준이 되는 width, height에 지정한다.
                    $img.one('load', function() {
                        $img.removeAttr('width height').css({'width':'auto', 'height':'auto'});
                        if ($img.attr('data-no-height') === 'true' && this.width > wrapWidth) {
                            $img.css('width', wrapWidth);
                        } else if ($img.attr('data-no-width') === 'true' && this.height > wrapHeight) {
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
             * data-src속성에 있는 이미지url를 src에 설정하여 로드시키는 함수 
             * @param { jquery/string } target 이미지 요소
             * @param { jquery/string } loadingClip
             * @return { jquery } deferred
             */
            lazyImages: function(target, loadingClip) {
                var $imgs = $(target),
                    $loading = $(loadingClip),
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
						if ($loading) {
							$loading.addClass("none");
						}
						def.resolve();
					}
				}

				if(!len){
					$loading.addClass("none");
					def.resolve();
				} else {

					if ($loading) {
						$loading.removeClass("none");
					}

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

			// 정확한 사이즈계산을 위해 내부에 있는 이미지를 다 불러올 때까지 기다린다.
			waitImageLoad: function($imgs, allowError){
				var me = this,
					defer = $.Deferred(),
					count = $imgs.length,
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
            },


            /**
             * @function scroll top animate
             * @param { Integer } y target y
             * @param { Integer } data.triggerY
             * @param { Integer } data.duration
             * @param { function } data.triggerCallback
             * @param { function } data.completeCallback
             */
            scrollTopAnimate: function( y, data ){
                var $body = $("body");
                var duration = ( data == undefined || data.duration == undefined  ) ? 200 : data.duration;

                var isTrigger = false;
                var triggerFuncExe = function(){
                    if( data && data.triggerY != undefined && data.triggerY != "" && $body.scrollTop() < data.triggerY && !isTrigger){
                        isTrigger = true;
                        if( data && data.triggerCallback ){
                            data.triggerCallback();
                        }
                    }
                }

                $body.stop().animate({scrollTop:y}, {duration:duration,
                    step:function(){
                        triggerFuncExe();
                    }, complete:function(){
                        triggerFuncExe();
                        if( data && data.completeCallback ){
                            data.completeCallback();
                        }
                    }, ease: "easeOutQuad"
                });
            },

            /**
             * 주어진 요소의 사이즈 & 위치를 반환
             * @param elem
             * @returns {JSON} {width: 너비, height: 높이, offset: { top: 탑위치, left: 레프트위치}}
             */
            getDimensions: function( elem ) {
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

            bindCheckAll: function(el) {
                var $con = $(el);

                // 전체 선택
                $con.on('click.globalui', ' input:checkbox:enabled', function (e) {
                    var $el = $(this),
                        $checkes = $con.find('input:checkbox:enabled:not(.d-notcheck)'),
                        $checkAll = $checkes.filter('.d-checkall'),
                        $others = $checkes.not('.d-checkall');

                    if($el.hasClass('d-checkall')) {
                        $others.prop('checked', this.checked);
                    } else {
                        $checkAll.prop('checked', $others.not(':checked').size() === 0);
                    }
					$checkAll.triggerHandler('checkallchanged');
                });

            },

            getFileName: function(str) {
                var paths = str.split(/\/|\\/g);
                return paths[paths.length - 1];
            }
            /**
             *
             * @param {String} scriptUrl URL
             * @param {Function} [callback] 콜백
             * @return {Deferred} deferred
             */
            /*
             loadScript: (function() {
             var doc = document,
             loaded = {};

             return function(url, callback) {
             var defer = $.Deferred();
             if(loaded[url]){
             callback&&callback();
             defer.resolve(url)
             return defer.promise();
             }

             var script = document.createElement('script');

             script.type = 'text/javascript';
             script.async = true;

             script.onerror = function() {
             defer.reject(url);
             //throw new Error(url + ' not loaded');
             };

             script.onreadystatechange = script.onload = function (e) {
             e = context.event || e;

             if (e.type == 'load' || this.readyState.test(/loaded|complete/)) {
             this.onreadystatechange = null;
             callback&&callback();
             defer.resolve(url);
             }
             };

             script.src = url;
             doc.getElementsByTagName('head')[0].appendChild(script);
             return defer.promise();
             };
             })()*/
        };
    });
    /**
	 * emart.util.openPopup 함수의 별칭
     * @name emart.openPopup
     */
    core.openPopup = core.util.openPopup;

    core.define('Cookie', {
        defaults: {
            // domain: location.host,
            path: '/'
        },

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
            var curCookie = name + "=" + encodeURIComponent(value) +
                ((options.expires) ? "; expires=" + (options.expires instanceof Date ? options.expires.toGMTString() : options.expires) : "") +
                ((options.path) ? "; path=" + options.path : '') +
                ((options.domain) ? "; domain=" + options.domain : '') +
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
                return decodeURIComponent(j.substr(h, f - h));
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
         * sep를 구분자로 하여 문자열로 조합하여 쿠키에 셋팅
         * @param {String} name 쿠키명
         * @param {String} val 값
         * @param {String} sep 구분자
         * @example
         * emart.cookie.addToArray('arr', 'a');
         * emart.cookie.addToArray('arr', 'b');  // arr:a|b
         */
        addToArray: function(name, val, sep) {
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
         * @param {String} name 쿠키명
         * @param {String} val 값
         * @param {String} sep
         * @example
         * emart.cookie.addToArray('arr', 'a');
         * emart.cookie.addToArray('arr', 'b');  // arr:a|b
         */
        removeToArray: function(name, val, sep) {
            sep = sep || '|';
            val = val + '';

            var value = this.get(name),
                values = value ? value.split(sep) : [];

            values = core.array.remove(values, val);

            this.set.apply(this, [name, values.join(sep)].concat(arguments));
        }
    });

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    var $win = core.$win,
        $doc = core.$doc,
        View;		// emart.ui.View

    core.define( /** @lends emart */{
        /*cleanUIModules: function(el) {
         $('[data-ui-modules]', el).each(function(){
         var $el = $(this),
         modules = $el.attr('data-ui-modules');
         each(modules.split(','), function(name){
         var klass = $el.data(name);
         try {
         klass.release();
         klass = null;
         $el.removeData(name);
         } catch(e) { }
         });
         $el.removeAttr('data-ui-modules');
         });
         },*/

        /**
         * 작성된 UI모듈을 jQuery의 플러그인으로 사용할 수 있도록 바인딩시켜 주는 함수
         *
         * @param {Class} Klass 클래스
         * @param {String} name 플러그인명
         *
         * @example
         * // 클래스 정의
         * var Slider = emart.ui.View({
		 *   initialize: function(el, options) { // 생성자의 형식을 반드시 지킬 것..(첫번째 인수: 대상 엘리먼트, 두번째
		 *   인수: 옵션값들)
		 *   ...
		 *   },
		 *   ...
		 * });
         * emart.bindjQuery(Slider, 'hibSlider');
         * // 실제 사용시
         * $('#slider').hibSlider({count: 10});
         */
        bindjQuery: function (Klass, name) {
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
                        instance && (instance.release(), instance = null);
                        $this.data('ui_'+name, (instance = new Klass(this, extend({}, $this.data(), options), me)));
                    }

                    if(options === 'instance'){
                        returnValue = instance;
                        return false;
                    }

                    if (typeof options === 'string' && core.is(instance[options], 'function')) {
                        if(options[0] === '_') {
                            throw new Error('[bindjQuery] private 메소드는 호출할 수 없습니다.');
                        }

                        // try {
                        methodValue = instance[options].apply(instance, args);
                        //} catch(e) {
                        //    console.error('[jQuery bind error] ' + e);
                        //}

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
    });


    core.define('Listener', function () {
        /**
         * 이벤트 리스너로서, 일반 객체에 이벤트 기능을 붙이고자 할경우에 사용
         * @class
         * @name emart.Listener
		 * @example
		 * var obj = {};
		 * emart.Listener.build(obj);
		 * obj.on('clickitem', function(){
         *   alert(0);
		 * });
		 * obj.trigger('clickitem');
         */
        var Listener = /** @lends emart.Listener# */ {
			/**
			 * obj에 이벤트 기능 적용하기
			 * @param {Object} obj 이벤트를 적용하고자 하는 객체
			 */
			build: function(obj){
				emart.extend(obj, emart.Listener).init();
			},
            /**
             * UI모듈이 작성될 때 내부적으로 호출되는 초기화 함수
             */
            init: function () {
                this._listeners = $(this);
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
             * @param {Object} cb (Optional) 삭제할 핸들러. 이 인자가 없을 경우 name에 등록된 모든 핸들러를 삭제.
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
        };

        return Listener;
    });

    /**
     * @namespace
     * @name emart.PubSub
     * @description 발행/구독 객체: 상태변화를 관찰하는 옵저버(핸들러)를 등록하여, 상태변화가 있을 때마다 옵저버를 발행(실행)
     * 하도록 하는 객체이다.
     * @example
     * // 옵저버 등록
     * emart.PubSub.on('customevent', function() {
	 *	 alert('안녕하세요');
	 * });
     *
     * // 등록된 옵저버 실행
     * emart.PubSub.trigger('customevent');
     */
    core.define('PubSub', function () {

        var PubSub = $(window);
        PubSub.attach = PubSub.on;
        PubSub.unattach = PubSub.off;

        return PubSub;
    });

    /**
	 * ui 관련 네임스페이스
     * @name emart.ui
     * @param name
     * @param attr
     * @returns {*}
     */
    core.ui = function(/*String*/name, supr, /*Object*/attr) {
        var bindName, Klass, isFn = core.isFunction;

        if(!attr) {
            attr = supr;
            supr = null;
        }
        if(typeof supr === 'string'){ 
        	supr = core.ui[supr];
        } else if(attr.$extend) {
	        supr = attr.$extend
	    } else if(supr && supr.superclass) {
	    	// supr = supr;
	    } else {
	    	supr = core.ui.View;
	    }

        if(isFn(attr)) {
            if(!isFn(attr = attr(supr))) {
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
        core.define('ui.' + name, Klass);
        if (bindName) {
            core.bindjQuery(Klass, bindName);
        }
        return Klass;
    };

    core.ui.setDefaults = function(name, opts) {
        $.extend(true, core.ui[name].prototype.defaults, opts);
    };

    View = core.define('ui.View', function () {
        var isFn = core.isFunction,
            execObject = function(obj, ctx) {
                return isFn(obj) ? obj.call(ctx) : obj;
            };

        function setUIName($el, name) {
            $el.attr('ui-modules', (function(modules) {
                var arr;
                if(modules) {
                    arr = modules.split(',');
                } else {
                    arr = [];
                }
                arr.push(name);
                return arr.join(',');
            })($el.attr('ui-modules')));
        }

        /**
         * 모든 UI요소 클래스의 최상위 클래스로써, UI클래스를 작성함에 있어서 편리한 기능을 제공해준다.
         * @class
         * @name emart.ui.View
         *
         * @example
         *
         * var Slider = Class({
		 *		$extend: emart.ui.View,
		 *		// 기능1) events 속성을 통해 이벤트핸들러를 일괄 등록할 수 있다. ('이벤트명 selector': '핸들러함수명')
		 *	events: {
		 *		click ul>li.item': 'onItemClick',		// this.$el.on('click', 'ul>li.item', this.onItemClick.bind(this)); 를 자동 수행
		 *		'mouseenter ul>li.item>a': 'onMouseEnter'	// this.$el.on('mouseenter', 'ul>li.item>a', this.onMouseEnter.bind(this)); 를 자동 수행
		 *	},
		 *	// 기능2) selectors 속성을 통해 지정한 selector에 해당하는 노드를 주어진 이름의 멤버변수에 자동으로 설정해 준다.
		 *	selectors: {
		 *		box: 'ul',			// this.$box = this.$el.find('ul') 를 자동수행
		 *		items: 'ul>li.item',	// this.$items = this.$el.find('ul>li.item') 를 자동수행
		 *		prevBtn: 'button.prev', // this.$prevBtn = this.$el.find('button.prev') 를 자동 수행
		 *		nextBtn: 'button..next' // this.$nextBtn = this.$el.find('button.next') 를 자동 수행
		 *	},
		 *	initialize: function(el, options) {
		 *	this.supr(el, options);	// 기능4) this.$el, this.options가 자동으로 설정된다.
		 *	},
		 *	onItemClick: function(e) {
		 *		...
		 *	},
		 *	onMouseEnter: function(e) {
		 *		...
		 *	}
		 * });
         *
         * new emart.ui.Slider('#slider', {count: 10});
         */
        var View = core.Base.extend(/** @lends emart.ui.View# */{
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
                    moduleName, superClass;

                if(!el) {
                    throw new Error('[ui.View] el객체가 없습니다.');
                }

                if (!me.name) {
                    throw new Error('[ui.View] 클래스의 이름이 없습니다');
                }

                moduleName = me.moduleName = core.string.toFirstLower(me.name);
                me.$el = el instanceof jQuery ? el : $(el);

                // 강제로 리빌드 시킬 것인가 ///////////////////////////////////////////////////////////////
                if (options.rebuild === true) {
                    try { me.$el.data('ui_'+moduleName).release(); } catch(e) {}
                    me.$el.removeData('ui_'+moduleName);
                } else {
                    // 이미 빌드된거면 false 반환 - 중복 빌드 방지
                    if (me.$el.data('ui_'+moduleName) ) {
                        return false;
                    }
                    me.$el.data('ui_'+moduleName, this);
                }


                // disabled상태면 false 반환
                if (me.$el.hasClass('disabled') || me.$el.attr('data-readony') === 'true' || me.$el.attr('data-disabled') === 'true') {
                    return false;
                }

                superClass = me.constructor.superclass;
                // TODO
                View._instances.push(me);
                me.el = me.$el[0];  // 원래 엘리먼트도 변수에 설정
                me.options = $.extend(true, {}, superClass.defaults, me.defaults, me.$el.data(), options);			// 옵션 병합
                me.cid = moduleName + '_' + core.nextSeq();    // 객체 고유 키
                me.subViews = {};   // 하위 컨트롤를 관리하기 위함
                me._eventNamespace = '.' + /*moduleName*/ me.cid;	// 객체 고유 이벤트 네임스페이스명

                setUIName(me.$el, me.name);
                me.updateSelectors();

                // events 속성 처리
                // events: {
                //	'click ul>li.item': 'onItemClick', //=> this.$el.on('click', 'ul>li.item', this.onItemClick); 으로 변환
                // }
                me.options.events = core.extend({},
                    execObject(me.events, me),
                    execObject(me.options.events, me));
                core.each(me.options.events, function (value, key) {
                    if (!eventPattern.test(key)) { return false; }

                    var name = RegExp.$1,
                        selector = RegExp.$2,
                        args = [name],
                        func = isFn(value) ? value : (isFn(me[value]) ? me[value] : core.emptyFn);

                    if (selector) { args[args.length] = $.trim(selector); }

                    args[args.length] = function () {
                        func.apply(me, arguments);
                    };
                    me.on.apply(me, args);
                });

                // options.on에 지정한 이벤트들을 클래스에 바인딩
                me.options.on && core.each(me.options.on, function (value, key) {
                    me.on(key, value);
                });

            },

            /**
             * this.selectors를 기반으로 엘리먼트를 조회해서 멤버변수에 셋팅
             * @returns {emart.ui.View}
             */
            updateSelectors: function () {
                var me = this;
                // selectors 속성 처리
                // selectors: {
                //  box: 'ul',			// => this.$box = this.$el.find('ul');
                //  items: 'ul>li.item'  // => this.$items = this.$el.find('ul>li.item');
                // }
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
                    me.subViews['$' + key] = me['$' + key];
                });

                return me;
            },

            /**
             * this.$el하위에 있는 엘리먼트를 조회
             * @param {String} selector 셀렉터
             * @returns {jQuery}
             */
            $: function (selector) {
                return this.$el.find(selector);
            },

            /**
             * 파괴자
             */
            release: function () {
                var me = this;

                me.$el.off(me._eventNamespace);
                me.$el.removeData(me.moduleName);

                // me.subviews에 등록된 자식들의 파괴자 호출
                core.each(me.subViews, function(item, key) {
                    if (key.substr(0, 1) === '$') {
                        item.off(me._eventNamespace);
                    } else {
                        item.release && item.release();
                    }
                    me.subViews[key] = null;
                });

                core.array.remove(View._instances, me);
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
             * @param {Mixed} value (Optional) 옵션값: 없을 경우 name에 해당하는 값을 반환
             * @return {Mixed}
             * @example
             * $('...').tabs('option', 'startIndex', 2);
             */
            option: function(name, value) {
                if (typeof value === 'undefined') {
                    return this.getOption(name);
                } else {
                    this.setOption(name, value);
                    this.triggerHandler('optionchange', [name, value]);
                }
            },

            /**
             * 이벤트명에 현재 클래스 고유의 네임스페이스를 붙여서 반환 (ex: 'click mousedown' -> 'click.MyClassName mousedown.MyClassName')
             * @private
             * @param {String} eventNames 네임스페이스가 없는 이벤트명
             * @return {String} 네임스페이스가 붙어진 이벤트명
             */
            _normalizeEventNamespace: function(eventNames) {
                if (eventNames instanceof $.Event) {
                    return eventNames;
                }

                var me = this,
                    m = (eventNames || "").split( /\s/ );
                if (!m || !m.length) {
                    return eventNames;
                }

                var name, tmp = [], i;
                for(i = -1; name = m[++i]; ) {
                    if (name.indexOf('.') === -1) {
                        tmp.push(name + me._eventNamespace);
                    } else {
                        tmp.push(name);
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

            proxy: function(fn){
                var me = this;
                return function(){
                    return fn.apply(me, arguments);
                };
            },


            /**
             * me.$el에 이벤트를 바인딩
             */
            on: function() {
                var args = arraySlice.call(arguments);
                args[0] = this._normalizeEventNamespace(args[0]);

                this.$el.on.apply(this.$el, args);
                return this;
            },

            /**
             * me.$el에 등록된 이벤트를 언바인딩
             */
            off: function() {
                var args = arraySlice.call(arguments);
                this.$el.off.apply(this.$el, args);
                return this;
            },

            /**
             * me.$el에 일회용 이벤트를 바인딩
             */
            one: function() {
                var args = arraySlice.call(arguments);
                args[0] = this._normalizeEventNamespace(args[0]);

                this.$el.one.apply(this.$el, args);
                return this;
            },

            /**
             * me.$el에 등록된 이벤트를 실행
             */
            trigger: function() {
                var args = arraySlice.call(arguments);
                this.$el.trigger.apply(this.$el, args);
                return this;
            },

            /**
             * me.$el에 등록된 이벤트 핸들러를 실행
             */
            triggerHandler: function() {
                var args = arraySlice.call(arguments);
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
            getElement: function() {
                return this.$el;
            },

            show: function(){},
            hide: function(){},
            setDisabled: function(){}
        });

        return View;
    });

})(window, jQuery);

(function($, core, ui, undefined) {
    "use strict";


    var $doc = core.$doc,
        $win = core.$win,
        strUtil = core.string,
        dateUtil = core.date,
        numberUtil = core.number,
        browser = core.browser,
        isTouch = browser.isTouch;

    // Modal ////////////////////////////////////////////////////////////////////////////
    /**
     * 모달 클래스<br />
     * // 기본 옵션 <br />
     * options.overlay:true 오버레이를 깔것인가<br />
     * options.clone: true  복제해서 띄울 것인가<br />
     * options.closeByEscape: true  // esc키를 눌렀을 때 닫히게 할 것인가<br />
     * options.removeOnClose: false // 닫을 때 dom를 삭제할것인가<br />
     * options.draggable: true              // 드래그를 적용할 것인가<br />
     * options.dragHandle: 'h1.title'       // 드래그대상 요소<br />
     * options.show: true                   // 호출할 때 바로 표시할 것인가...
     *
     * @class
     * @name emart.ui.Modal
     * @extends emart.ui.View
     * @example
     */
    var Modal = ui('Modal', /** @lends emart.ui.Modal# */{
        bindjQuery: 'modal',
        $statics: /** @lends emart.ui.Modal */{
            /**
             * 모달 생성시 발생되는 이벤트
             * @static
             */
            ON_CREATED: 'modalcreated',
            /**
             * 모달 표시 전에 발생되는 이벤트
             * @static
             */
            ON_SHOW:'modalshow',
            /**
             * 모달 표시 후에 발생되는 이벤트
             * @static
             */
            ON_SHOWN:'modalshown',    // 표시 후
            /**
             * 모달이 숨기기 전에 발생되는 이벤트
             * @static
             */
            ON_HIDE:'modalhide',          // 숨기기 전
            /**
             * 모달이 숨겨진 후에 발생되는 이벤트
             * @static
             */
            ON_HIDDEN: 'modalhidden'  // 숨긴 후
        },
        defaults: {
            overlay: true,
            clone: true,
            closeByEscape: true,
            removeOnClose: false,
            draggable: true,
            dragHandle: 'header h1',
            show: true,

            cssTitle: '.d-modal-title'
        },

        events: {
            'click button[data-role]': function (e) {
                var me = this,
                    $btn = $(e.currentTarget),
                    role = ($btn.attr('data-role') || ''),
                    e;

                if (role) {
                    me.triggerHandler(e = $.Event(role), [me]);
                    if(e.isDefaultPrevented()){
                        return;
                    }
                }

                this.hide();
            },
            'click .d-close': function(e) {
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
            if(me.callParent(el, options) === false) {
                return me.release();
            }

            // 열릴때 body로 옮겼다가, 닫힐 때 다시 원복하기 위해 임시요소를 넣어놓는다.
            me._createHolder();

            me.isShown = false;
            me._originalDisplay = me.$el.css('display');

            if(me.options.remote) {
                me.$el.load(me.options.remote).done(function(){
                    me.options.show && core.util.waitImageLoad(me.$el.find('img')).done(function() {
						me.show();
					});
                });
            } else {
                me.options.show && core.util.waitImageLoad(me.$el.find('img')).done(function() {
					me.show();
				});
            }


            // TODO
            me.$el.attr({
                'role': 'dialog',
				'aria-hidden': 'false',
                'aria-describedby': me.$('section').attr('id') || me.$('section').attr('id', me.cid+'_content').attr('id'),
                'aria-labelledby': me.$('h1').attr('id') || me.$('h1').attr('id', me.cid+'_title').attr('id')
            });

			me.on('mousewheel.modal', function(e) {
                e.stopPropagation();
            });
        },

        /**
         * zindex때문에 모달을 body바로 위로 옮긴 후에 띄우는데, 닫을 때 원래 위치로 복구시켜야 하므로,
         * 원래 위치에 임시 홀더를 만들어 놓는다.
         * @private
         */
        _createHolder: function() {
            var me = this;

            if(me.$el.parent().is('body')){ return; }

            me.$holder = $('<span class="d-modal-area" style="display:none;"></span>').insertAfter(me.$el);
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

            Modal.active = this;

            var me = this,
                opts = me.options,
                e = $.Event(Modal.ON_SHOW);

            me.trigger(e);
            if(me.isShown || e.isDefaultPrevented()) { return; }

            me.isShown = true;
            if(opts.overlay !== false){
				// 오버레이 생성
                me._overlay();
            }
			// 위치 배치
            me.layout();
			// 드래그 기능 빌드
            me._draggabled();
            if(!core.browser.isTouch){
				// esc키이벤트 바인딩
                me._escape();
				// 탭키로 포커스를 이동시킬 때 포커스가 레이어팝업 안에서만 돌도록 빌드
                me._enforceFocus();
            }

            if(opts.title) {
                me.$el.find(opts.cssTitle).html(opts.title || '알림');
            }

            me.$el.stop().addClass('d-modal-container')
                .css({
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    zIndex: 9900,
                    backgroundColor: '#ffffff',
                    outline: 'none',
                    backgroundClip: 'padding-box'
                }).fadeIn('fast', function() {
                    me.trigger(Modal.ON_SHOWN, {module: this});
                    me.layout();

                    var $focusEl = me.$el.find('[data-autofocus=true]');					
					// 레이어내에 data-autofocus를 가진 엘리먼트에 포커스를 준다.
					if($focusEl.size() > 0){
						$focusEl.eq(0).focus();
					} else {
						// 레이어에 포커싱
						me.$el.attr('tabindex', 0).focus();
					}
                });

			// body를 비활성화(aria)
            $('body').attr('aria-hidden', 'true');

			// 버튼
			if(me.options.opener) {
				var modalid = '';
				if(!(modalid = me.$el.attr('id'))){
					modalid = 'modal_' + core.getUniqId(16);
					me.$el.attr('id', modalid);
				}
				$(me.options.opener).attr('aria-controls', modalid);
			}

            core.PubSub.trigger('hide:modal');
        },

        /**
         * 숨김
         */
        hide: function(e) {
            if(e) {
                e.preventDefault();
            }

            var me = this;
            e = $.Event(Modal.ON_HIDE);
            me.trigger(e);
            if(!me.isShown || e.isDefaultPrevented()) { return; }

			// 모달관련 글로벌 이벤트 제거
            $doc.off('focusin.modal');
            me.off('click.modal keyup.modal');

            me.isShown = false;
            if(!core.browser.isTouch){
				// esc 키이벤트 제거
                me._escape();
            }
			// dom에 추가된 것들 제거
            me.$el.hide().removeData(me.moduleName).removeClass('d-modal-container');
            me.off(me.getEventNamespace());
			// body밑으로 뺀 el를 다시 원래 위치로 되돌린다.
            me._replaceHolder();

            if(me.options.removeOnClose) {
				// 닫힐 때 dom에서 삭제하도록 옵션이 지정돼있으면, dom에서 삭제한다.
                me.$el.remove();
            }
            if(me.options.opener){
				// 레이어팝업을 띄운 버튼에 포커스를 준다.
                $(me.options.opener).removeAttr('aria-controls').focus();
            }

            if(me.$overlay) {
				// 오버레이를 제거
                me.$overlay.hide().remove(), me.$overlay = null;
            }
			// 비활성화를 푼다.
            $('body').removeAttr('aria-hidden');

            me.trigger(Modal.ON_HIDDEN);
            Modal.active = null;
        },


        /**
         * 도큐먼트의 가운데에 위치하도록 지정
         */
        layout: function(){
			var me = this,
				width = 0,
				height = 0,
				winHeight = core.util.getWinHeight();

			if(!me.isShown) {
				me.$el.css({'display': 'inline'});
			}
			width = me.$el.outerWidth();
			height = me.$el.outerHeight();
			me.$el.css({'display': ''});
			
			if(height > winHeight){
				// 레이어가 창보다 클 경우 top을 0으로 지정
				me.$el.css({
					'top': 0,
					'left': '50%',
					'marginLeft': Math.ceil(width / 2) * -1,
					'marginTop': ''
				});
			} else {
				me.$el.css({
					'top': '50%',
					'left': '50%',
					'marginTop': Math.ceil(height / 2) * -1,
					'marginLeft': Math.ceil(width / 2) * -1
				});
			}
        },

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
                me.$el.css('position', 'absolute');
                core.css3.prefix('user-select') && me.$(options.dragHandle).css(core.css3.prefix('user-select'), 'none');
                me.on('mousedown.modaldrag touchstart.modaldrag', options.dragHandle, function(e) {
                    e.preventDefault();

                    var isMouseDown = true,
                        pos = me.$el.position(),
                        size = {
                            width: me.$el.width(),
                            height: me.$el.height()
                        },
                        docSize = {
                            width: core.util.getDocWidth(),
                            height: core.util.getDocHeight()
                        },
                        oriPos = {left: e.pageX - pos.left, top: e.pageY - pos.top};

                    $doc.on('mousemove.modaldrag mouseup.modaldrag touchmove.modaldrag touchend.modaldrag touchcancel.modaldrag', function(e) {
                        switch(e.type) {
                            case 'mousemove':
                            case 'touchmove':
                                if(!isMouseDown){ return; }
                                /*if(e.pageX + size.width > docSize.width
                                 || e.pageY + size.height > docSize.height
                                 || e.pageX - oriPos.left < 0
                                 || e.pageY - oriPos.top < 0) {
                                 return;
                                 }*/

                                me.$el.css({
                                    left: e.pageX - oriPos.left,
                                    top: e.pageY - oriPos.top
                                });
                                break;
                            case 'mouseup':
                                isMouseDown = false;
                                $doc.off('.modaldrag');
                                break;
                        }
                    });
                });

                me.$el.find(options.dragHandle).css('cursor', 'move');
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
                me.off('keyup.modal').on('keyup.modal', me.proxy(function(e) {
                    e.which === 27 && me.hide();
                }));
            } else {
                me.off('keyup.modal');
            }
        },

        /**
         * 오버레이 생성
         * @private
         */
        _overlay: function() {
            var me = this;
            if($('.d-modal-overlay').length > 0){ return false;} //140123_추가

            me.$overlay = $('<div class="d-modal-overlay" />');
            me.$overlay.css({
                'backgroundColor': '#ffffff',
                'opacity': 0.6,
                'position': 'fixed',
                'top': 0,
                'left': 0,
                'right': 0,
                'bottom': 0,
                'zIndex': 9000
            }).appendTo('body');

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
        center: function(){
            this.layout();
        },

        /**
         * 열기
         */
        open: function(){
            this.show();
        },

        /**
         * 닫기
         */
        close: function() {
            this.hide();
        },

        /**
         *
         */
        release: function() {
            var me = this;

            me.callParent();
            me.$el.add(me.$overlay).off('.modal').remove();
            $doc.off('.modal');
            $win.off('.modal');
        }
    });

	/**
	 * 열려 있는 레이어팝업을 닫는 static 함수
	 * @name emart.ui.Modal.close
	 */
    Modal.close = function (e) {
        if (!Modal.active) return;
        if (e) e.preventDefault();
        Modal.active.hide();
        Modal.active = null;
    };

	/**
	 * 열려 있는 레이어팝업을 닫는 글로벌이벤트
	 * @example 
	 * emart.PubSub.trigger('hide:modal')
	 */
    core.PubSub.on('hide:modal', function (e, force) {
        if (force === false) {
            if(Modal.active){
                Modal.close();
            }
        }
    });

	/**
	 * 열려 있는 레이어팝업을 가운데에 위치시키는 글로벌이벤트
	 * @example 
	 * emart.PubSub.trigger('resize:modal')
	 */
    core.PubSub.on('resize:modal', function() {
        if(Modal.active){
            Modal.active.center();
        }
    });

	//윈도우가 리사이징 될때 가운데에 자동으로 위치시킴
    $(window).on('resize.modal', function() {
        if(Modal.active){
            Modal.active.center();
        }
    });

    core.modal = function(el, options){
        $(el).modal(options);
    };

    /**
     * @class
     * @name emart.ui.AjaxModal
     * @description ajax로 불러들인 컨텐츠를 모달로 띄워주는 모듈
     * @extends emart.ui.View
     */
    core.ui.ajaxModal = function () {
        return function(url, options) {
            return $.ajax($.extend({
                url: url,
				cache: false
            }, options && options.ajax)).done(function(html) {
                var el = $(html.replace(/\n|\r/g, "")).appendTo('body');
                var modal = new Modal(el, core.extend({removeOnClose: true, show: true}, options));
                modal.getElement().buildUIControls();
                modal.on('modalhidden', function(){
                    el = null;
                    modal = null;
                });
            });
        };
    }();

    core.ui.alert = function () {
        /**
         * 얼럿레이어
         * @memberOf emart.ui
         * @name alert
         * @function
         * @param {String} msg 얼럿 메세지
         * @param {JSON} options 모달 옵션
         * @example
         * emart.ui.alert('안녕하세요');
         */
        return function (msg, options) {
            if(typeof msg !== 'string' && arguments.length === 0) {
                options = msg;
                msg = '';
            };
            var el = $(core.ui.alert.tmpl).appendTo('body').find('div.d-content').html(msg).end();
            var modal = new Modal(el, core.extend({removeOnClose: true, show: true}, options));
            modal.getElement().buildUIControls();
            modal.on('modalhidden', function(){
                el = null;
                modal = null;
            });
            return modal;
        };
    }();
    core.ui.alert.tmpl = ['<div class="layer_popup small d-alert" role="alert" style="display:none">',
        '<h1 class="title d-title">알림창</h1>',
        '<div class="cntt">',
        '<div class="d-content">&nbsp;</div>',
        '<div class="wrap_btn_c">',
        '<button type="button" class="btn_emphs_small" data-role="ok"><span><span>확인</span></span></button>',
        '</div>',
        '</div>',
        '<button type="button" class="d-close"><span>닫기</span></button>',
        '<span class="shadow"></span>',
        '</div>'].join('');
    ///////////////////////////////////////////////////////////////////////////////////////

    //Calendar ////////////////////////////////////////////////////////////////////////////
    /**
     * @class
     * @description 달력 모듈
     * @name emart.ui.Calendar
     * @extends emart.ui.View
     */
    var daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    var Calendar = ui('Calendar', /** @lends emart.ui.Calendar# */{
        bindjQuery: 'calendar',
        defaults: {
            weekNames: ['일', '월','화','수','목','금', '토'],
            monthNames: '1월,2월,3월,4월,5월,6월,7월,8월,9월,10월,11월,12월'.split(','),

            titleFormat: 'yyyy년 MM월 dd일',

            weekendDisabled: false,     // 주말을 disabled시킬 것인가
            type: 'button',           // 날짜가 선택되게 할 것인가
            inputTarget: '',            // 날짜를 선택했을 때, 날짜가 들어갈 인풋박스의 셀렉터
            marginTop: 4,
            showOtherMonths: false,     // 이전, 다음달의 날짜를 표시할 것인가
			isBubble: false,
            date: new Date(),       // 처음에 표시할 기본 날짜
            today: new Date(),
            useSelectbox: true,
			isClickActive: true,
            startSelectYear: '2004',
            endSelectYear: '+1',
            template: {
                header: '<button class="m-calendar-prev">이전달</button>' +
                    '<span class="m-calendar-text"></span>' +
                    '<button class="m-calendar-next">다음달</button>',

                selectHeader: '<a href="#" class="m-calendar-prev"><span class="hide">이전달</span></a>' +
                    '<select class="m-calendar-years y_selct" title="해당년 선택란"></select>' +
                    '<select class="m-calendar-months m_selct" title="해당월 선택란"><option value="1">01</option><option value="2">02</option><option value="3">03</option><option value="4">04</option><option value="5">05</option><option value="6">06</option><option value="7">07</option><option value="8">08</option><option value="9">09</option><option value="10">10</option><option value="11">11</option><option value="12">12</option></select>' +
                    '<a href="#" class="m-calendar-next"><span class="hide">다음달</span></a>',

                label: '<span class="m-calendar-day" title="<$-title$>"><$=day$></span>',
                button: '<button class="m-calendar-day" title="<$-title$>" <$-disabled$>><$=day$></button>'
            },
            holidays: [],               // 휴일 날짜 -> ['2014-04-05', '2014-05-12'],
            summary: '캘린더입니다. 글은 일요일, 월요일, 화요일, 수요일, 목요일, 금요일, 토요일 순으로 나옵니다.',
            colWidth: '32px', // 셀 너비
            caption: '캘린더입니다. 글은 일요일, 월요일, 화요일, 수요일, 목요일, 금요일, 토요일 순으로 나옵니다.', //접근성 수정 160913
            canSelectHoliday: false,		// 휴일을 선택하게 할 것인가,
            customDaysTarget: null		// 휴일, 오늘, 토요일, 일요일 이외의 날짜를 표현할 경우, json를 담고 있는 script id를 지정
        },
        events: {

        },

        /**
         *
         * @param el
         * @param options
         * @returns {boolean}
         */
        initialize: function (el, options) {
            var me = this;
            if (me.callParent(el, options) === false) {
                return me.release();
            }

            me.isInline = !me.$el.is('button, input, a');
            me.currDate = dateUtil.parse(me.options.date);
            me._normalizeOptions();

            if(me.options.customDaysTarget) {
                try {
                    var $data = $(me.options.customDaysTarget);
                    me.customDays = $.parseJSON($.trim($data.html()));
                } catch(e) { console.error('[calendar] custom day의 값이 잘못 되었습니다.'); }
                $data.remove();
            }

            if(me.isInline){
                me._render();
            } else {
                me.options.header = true;
                if(me.options.inputTarget){
                    me.$input = $(me.options.inputTarget);
                }
                me.off('.calendar').on('click.calendar', function(e){
                    e.preventDefault();
                    e.stopPropagation();
                    if(me.$calendar && me.$calendar.is(':visible')){
                        me.close();
                        return;
                    }
                    me.open();
                });
            }
        },

        _normalizeOptions: function() {
            var me = this,
                opts = me.options;

            if(!core.isDate(opts.today)) {
                opts.today = dateUtil.parse(opts.today+'');
            }

            //data-holidays속성을 이용한 경우 문자열로 넘어오기 때문에 배열로 변환해주어야 한다.
            if(core.is(opts.holidays, 'string')) {
                try {
                    opts.holidays = eval(opts.holidays);
                } catch (e){ opts.holidays = []; }
            }

            if(opts.useSelectbox) {
                var date = new Date;
                if(/^[+-]/.test(opts.startSelectYear.toString())) {
                    me.startSelectYear = date.getFullYear() + (opts.startSelectYear|0)
                } else {
                    me.startSelectYear = opts.startSelectYear|0;
                }

                if(/^[+-]/.test(opts.endSelectYear.toString())) {
                    me.endSelectYear = date.getFullYear() + (opts.endSelectYear|0)
                } else {
                    me.endSelectYear = opts.endSelectYear|0;
                }
            }
        },

        /**
         * 위치 재조절
         */
        _reposition: function() {
            var me = this,
                pos = me.$el.position(),
                height = me.$el.height();

            me.$calendar.css({
                left: me.options.inputTarget ? me.$input.position().left + parseInt(me.$input.css('marginLeft'), 10) : pos.left,
                top: pos.top + height + me.options.marginTop
            }).focus();

            return me;
        },

        /**
         * 모달 띄우기
         * @returns {Calendar}
         */
        open: function(){
            var me = this;

            Calendar.active && Calendar.active.close();
            Calendar.active = this;

            if(me.options.inputTarget) {
                var val = me.$input.val(),
                    currDate = dateUtil.parse(me.$input.val());

                if((val && val.length < 8) || isNaN(currDate.getTime())) {
                    currDate = new Date;
                }

                if(me.options.header && me.options.useSelectbox) {
                    currDate = me._checkValid(currDate);
                }
                me.currDate = currDate;
            }
            me._render();
            me._reposition();
            me.show();

            return me;
        },

        /**
         * 모달 닫기
         * @returns {Calendar}
         */
        close: function(){
            if(this.isInline){
                return;
            }

            this._remove();
            $doc.off('.calendar');
            Calendar.active = null;

            return this;
        },

        /**
         * 모달 표시
         * @returns {Calendar}
         */
        show: function(){
            var me = this;

            if(!me.isInline) {
                if(me.$el.prop('disabled') || me.$el.hasClass('disabled')) { return; }

                $doc.on('click.calendar', function (e) {
                    if (me.$calendar[0].contains(e.target)) {
                        e.stopPropagation();
                        return;
                    }

                    me.close();
                });

                if(!core.isTouch) {
                    me._escape();

                    me.$calendar.on('focusin focusout', (function() {
                        var timer = null;
                        return function(e) {
                            clearTimeout(timer);
                            switch(e.type) {
                                case 'focusout':
                                    timer = setTimeout(function() {
                                        me.close();
                                    }, 200);
                                    break;
                            }
                        };
                    })());
                }
                me.$calendar.showLayer({opener: me.$el});
            }

            return me;
        },

        _escape: function() {
            var me = this;

            me.$calendar.add(me.$el).add(me.$input)
                .off('keyup.calendar').on('keyup.calendar', function(e) {
                    if(e.keyCode === core.keyCode.ESCAPE) {
                        me.close();
                        me.options.inputTarget && me.$input.focus();
                    }
                });

        },

        /**
         * DOM 삭제
         * @returns {Calendar}
         */
        _remove: function() {
            var me = this;

            if(me.$calendar){
                me.$calendar.off();
                me.$calendar.remove();
                me.$calendar = null;
            }

            return me;
        },

        /**
         * 렌더링
         */
        _render: function() {
            var me = this,
                opts = me.options,
                timer, tmpl;

            tmpl = '<div class="m-calendar-container">' +
                (opts.header !== false ?
                    '<div class="m-calendar-header">' +
                    (opts.header && opts.useSelectbox ? opts.template.selectHeader : opts.template.header) +
                    '</div>' : '') +
                '<div class="m-calendar-date"></div>' +
                '</div>'

            me._remove();
            me.$calendar = $(tmpl);
            if(me.isInline) {
                // 인라인
                me.$el.empty().append(me.$calendar);
            } else {
                // 모달
                me.$calendar.css({
                    position: 'absolute',
                    backgroundColor: '#fff',
                    zIndex: 9999
                });
                me.$el.after(me.$calendar);
            }
            me.$calendar.off('.calendar')
                .on('click.calendar mousedown.calendar', '.m-calendar-prev, .m-calendar-next', function(e){
                    // 이전 / 다음
                    e.preventDefault();
                    if(me.$el.hasClass('disabled')){ return; }

                    var $el = $(e.currentTarget),
                        isPrev = $el.hasClass('m-calendar-prev');

                    switch (e.type) {
                        case 'click':
                            me[isPrev ? 'prev' : 'next']();
                            break;
                        case 'mousedown':
                            clearInterval(timer);
                            timer = null;
                            timer = setInterval(function(){
                                me[isPrev ? 'prev' : 'next']();
                            }, 300);
                            $doc.on('mouseup.calendar', function() {
                                clearInterval(timer);
                                timer = null;
                                $doc.off('mouseup.calendar');
                            });
                            break;
                    }
                })
                .on('click.calendar', '.m-calendar-day a, .m-calendar-day button', function(e) {
                    // 날짜 클릭
                    e.preventDefault();
                    if(me.$el.hasClass('disabled')){ return; }

                    var $this = $(this).closest('td'),
                        data = $this.data(),
                        date = new Date(data.year, data.month - 1, data.day),
                        format = dateUtil.format(date, opts.format || ''),
                        e;

                    if(opts.inputTarget) {
                        me.$input.val(format)
                    }

                    e = $.Event('calendarselected');
                    e.target = e.currentTarget = this;
                    me.$el[opts.isBubble ? 'trigger' : 'triggerHandler'](e, {
						target: this,
                        year: $this.data('year'),
                        month: $this.data('month'),
                        day: $this.data('day'),
                        value: format,
                        date: date,
                        calendar: me.$calendar[0]
                    });

                    if(me.isInline && opts.isClickActive !== false){
                        me.$calendar.find('.m-calendar-active').removeClass('m-calendar-active');
                        $this.addClass('m-calendar-active');
                    }

                    if(!e.isDefaultPrevented() && !me.isInline) {
                        me.close();
                        me.$el.focus();
                    }

                });

            if(opts.header && opts.useSelectbox) {
                me.$yearSelectbox = me.$calendar.find('.m-calendar-years');
                me.$monthSelectbox = me.$calendar.find('.m-calendar-months');

                me.$yearSelectbox[0].options.length = 0;
                for(var i = me.startSelectYear; i <= me.endSelectYear; i++) {
                    me.$yearSelectbox[0].options.add(new Option(i, i));
                }

                me.$yearSelectbox.add(me.$monthSelectbox).off('change.calendar').on('change.calendar', function(e) {
                    var year = me.$yearSelectbox.val(),
                        month = me.$monthSelectbox.val();

                    me.currDate.setYear(year|0);
                    me.currDate.setMonth((month|0) - 1);

                    me._renderDate();
                });
            }

            me._renderDate();

            return me;
        },

        _selectCurrentDate: function(){
            var me = this,
                opts = me.options;

            if(!opts.header || !opts.useSelectbox) { return; }

            me.$yearSelectbox.val(me.currDate.getFullYear());
            me.$monthSelectbox.val(me.currDate.getMonth() + 1);

        },

        release: function() {
            var me = this;
            me._remove();
            me.close();
            me.callParent();
        },

        /**
         * 휴일 여부
         * @param {Number} y 년도
         * @param {Number} m 월
         * @param {Number} d 일
         * @returns {boolean} 휴일여부
         * @private
         */
        _isHoliday: function(y, m, d) {
            var me = this,
                holidays = me.options.holidays,
                i, date, item;

            for (var i = -1; item = holidays[++i]; ) {
                date = dateUtil.parse(item);
                if(date.getFullYear() === y && date.getMonth() + 1 === m && date.getDate() === d) {
                    return true;
                }
            }

            return false;
        },

        _checkValid: function(date) {
            var me = this,
                opts = me.options;

            if(me.startSelectYear > date.getFullYear()) { return new Date(me.startSelectYear, 0, 1); }
            if(me.endSelectYear < date.getFullYear()) { return new Date(me.endSelectYear, 11, 1); }
            return date;
        },

        /**
         * 달력 그리기
         * @returns {Calendar}
         * @private
         */
        _renderDate: function() {
            var me = this,
                opts = me.options,
                beforeRenderDay = opts.beforeRenderDay,
                date = me._getDateList(me.currDate),
                html = '',
                tmpl = core.template(opts.template[opts.type] || opts.template.button),
                isHoliday = false,
                isToday = false,
                isOtherMonth = false,
                i, j, y, m, d, week, len, cell, customClass;

            //html += '<table class="m-calendar-table" border="1" summary="'+opts.summary+'"><caption>'+opts.caption+'</caption>';
            html += '<table class="m-calendar-table" border="1"><caption>'+opts.caption+'</caption>';
            html += '<colgroup>';
            for(i = 0; i < 7; i++) {
                html += '<col width="'+opts.colWidth+'" />';
            }
            html += '</colgroup><thead>';
            for(i = 0; i < 7; i++) {
                html += '<th class="m-calendar-dayname ' + (i === 0 ? ' m-calendar-sunday' : i === 6 ? ' m-calendar-saturday' : '') + '" scope="col">';
                html += opts.weekNames[i];
                html += '</th>';
            }
            html += '</thead><tbody>';

            for(i = 0, len = date.length; i < len; i++) {
                week = date[i];

                html += '<tr>';
                for(j = 0; j < 7; j++) {
                    y = week[j].year, m = week[j].month, d = week[j].day;
                    isHoliday = /*((j === 0 || j === 6) && opts.weekendDisabled) || */me._isHoliday(y, m, d);
                    isToday = opts.today.getFullYear() === y && opts.today.getMonth() + 1 === m && opts.today.getDate() === d;
                    isOtherMonth = (me.currDate.getMonth() + 1) != m;
					var nowd = new Date(y, m - 1, d);

                    if(beforeRenderDay){
                        cell = beforeRenderDay.call(me, y, m, d, {
                            isSaturday: j === 6,
                            isSunday: j === 0,
                            isHoliday: isHoliday,
                            isToday: isToday,
                            isOtherMonth: isOtherMonth}) || {cls:'', html:'', disabled:''};
                    } else {
                        cell = {cls:'', html:'', disabled:''};
                    }

					customClass = me.customDays ? ' '+me._getClassCustomDay(y, m, d) : '';
                    cell.cls = customClass;
 
                    html += '<td class="m-calendar-'+ dateUtil.format(nowd, 'yyyyMMdd') + ' m-calendar-cell';
					if(opts.showOtherMonths && isOtherMonth || !isOtherMonth) {
                        html += (isHoliday ? ' m-calendar-holiday' : '')
                        + (j === 0 ? ' m-calendar-sunday' : j === 6 ? ' m-calendar-saturday' : '')
                        + (isToday ? ' m-calendar-today' : '');
					}
                    html += (isOtherMonth ? ' m-calendar-other' : '')
                        + cell.cls
                        + '" data-year="'+y+'" data-month="'+m+'" data-day="'+d+'">';

                    if(!isOtherMonth || opts.showOtherMonths) {
                        if (cell.html) {
                            html += cell.html;
                        } else {
                            html += tmpl({
                                title: dateUtil.format(nowd, opts.titleFormat),
                                isHoliday: isHoliday,
                                isToday: isToday,
                                isOtherMonth: isOtherMonth,
								customClass: customClass,
                                isSunday: j === 0,
                                isSaturday: j === 6,
                                disabled: isHoliday || cell.disabled ? ' disabled="disabled" ' : '',
                                day: d,
								date: nowd
                            });
                        }
                    } else {
                        html += '&nbsp;';
                    }
                    html += '</td>';
                } // for
                html += '</tr>';
            } // for
            html += '</tbody></table>';

            me.$calendar.find('.m-calendar-date').html(html);
            me.$calendar.find('.m-calendar-text').text(dateUtil.format(me.currDate, 'yyyy-MM'));

            if(opts.header && opts.useSelectbox){
                me._selectCurrentDate();
            }

            return me;
        },

        _getClassCustomDay: function(y, m, d) {
            var me = this,
                cls = '';

            m = m - 1;
            core.each(me.customDays, function(item, key) {
                var date;
                for(var i = 0; i < item.length; i++) {
                    date = dateUtil.parse(item[i]);
                    if(date.getFullYear() === y && date.getMonth() === m && date.getDate() === d) {
                        cls = key;
                        return false;
                    }
                }
            });
            return cls;
        },

        setCustomDays: function(data) {
            this.customDays = data;
            this.refresh();
        },

        refresh: function(){
            this._renderDate();
        },

        findDateCell: function(day) {
            return this.$calendar.find('.data-'+day.getFullYear()+''+(day.getMonth() + 1)+''+day.getDate());
        },

        enable: function() {
            var me = this;
            if(me.options.inputTarget) {
                me.$input.disabled(false);
            }
            me.$el.disabled(false);
        },

        disable: function() {
            var me = this;

            me.close();
            if(me.options.inputTarget) {
                me.$input.disabled(true);
            }
            me.$el.disabled(true);
        },

        /**
         * 날짜 변경
         * @param date
         */
        setDate: function(date, options) {
            if(!date) { return; }
            var me = this;

            if(options) {
                me.options = $.extend(true, me.options, me.$el.data(), options);
                me._normalizeOptions();
            }

            try {
                var currDate = core.is(date, 'date') ? date : dateUtil.parse(date);
                if(me.options.header && me.options.useSelectbox){
                    currDate = me._checkValid(currDate);
                }
                this.currDate = currDate;
                me._renderDate();
            } catch(e) {
                throw new Error('Calendar#setDate(): 날짜 형식이 잘못 되었습니다.');
            }
            return this;
        },

        /**
         *
         * @param holidays
         */
        setHolidays: function(holidays) {
            var me = this;

            if(core.isArray(holidays)) {
                me.options.holidays = holidays;
            } else if(core.is(holidays, 'string')){
                if(holidays.substr(0, 1) !== '[') {
                    holidays = '[' + holidays + ']';
                }
                me.options.holidays = eval(holidays);
            } else {
                return;
            }

            /*
             me.$calendar.find('.m-calendar-holiday').removeClass('m-calendar-holiday');
             core.each(me.options.holidays, function(day, i) {
             day = dateUtil.parse(day);
             me.findDateCell(day).addClass('m-calendar-holiday');
             });
             */
            me._renderDate();
        },

        /**
         * 오늘날짜 변경
         * @param today
         */
        setToday: function(today) {
            var me = this;

            if(!core.is(today, 'date')) {
                try {
                    me.options.today = core.date.parse(today)
                } catch(e) {
                    throw new Error('calendar#setToday: 날짜 형식이 잘못 되었습니다.')
                }
            }
            var to = me.options.today,
                cur = me.currDate;

            me._renderDate();
            /*
             me.$calendar.find('td.m-calendar-today').removeClass('m-calendar-today');
             if(to.getFullYear() === cur.getFullYear()
             && to.getMonth() === cur.getMonth()) {
             // 오늘날짜가 현재월에 해당하면, 활성화 해줌
             me.findDateCell(to).addClass('m-calendar-today');
             }
             */
        },

        /**
         * 오늘날짜 반환
         * @returns {Date} 오늘날짜
         */
        getToday: function() {
            return this.options.today;
        },

        getCurrentDate: function() {
            return this.currDate;
        },

        /**
         * 이전달
         * @returns {Calendar}
         */
        prev: function(){
            var me = this,
                currDate = core.date.add(me.currDate, 'M', -1);
            if(me.options.header && me.options.useSelectbox){
                currDate = me._checkValid(currDate);
            }
            me.currDate = currDate;
            me._renderDate();

            return this;
        },

        /**
         * 다음달
         * @returns {Calendar}
         */
        next: function() {
            var me = this,
                currDate = core.date.add(me.currDate, 'M', 1);
            if(me.options.header && me.options.useSelectbox){
                currDate = me._checkValid(currDate);
            }
            me.currDate = currDate;
            me._renderDate();

            return this;
        },

        /**
         * 날짜 데이타 계산
         * @param {Date} date 렌더링할 날짜 데이타 생성
         * @return {Array}
         */
        _getDateList: function (date) {
            date.setDate(1);

            var me = this,
                month = date.getMonth() + 1,
                year = date.getFullYear(),
                startOnWeek = date.getDay() + 1,
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

            var data = [],
                week = [];

            if (startOnWeek > 0) {
                if (month == 3 && me._isLeapYear(year)) {
                    startPrevMonth += 1;
                }
                if ((m = month - 1) < 1) {
                    m = 12, y = year - 1;
                }
                for (var i = 1; i < startOnWeek; i++) {
                    week.push({year: y, month: m, day: startPrevMonth + i + 1});        // ***** +1
                }
                if (week.length > 6) {
                    data.push(week), week = [];
                }
            }

            for (var i = 1; i <= last; i++) {
                week.push({year: year, month: month, day: i});
                if (week.length > 6) {
                    data.push(week), week = [];
                }
            }

            if (week.length > 0 && week.length < 7) {
                if ((m = month + 1) > 12) {
                    m -= 12, y = year + 1;
                }
                for (var i = week.length, d = 1; i < 7; i++, d++) {
                    week.push({year: y, month: m, day: d});
                }
            }
            week.length && data.push(week);
            return data;
        },

        /**
         * 윤년 여부
         * @param {Date} date 렌더링할 날짜 데이타 생성
         * @return {Boolean} 윤년 여부
         */
        _isLeapYear: function (year) {
            return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0))
        }
        });
    ///////////////////////////////////////////////////////////////////////////////////////


    //Paginate ////////////////////////////////////////////////////////////////////////////
    /**
     * @class
     * @name emart.ui.Paginate
     * @description 페이징모듈
     * @extends emart.ui.View
     */
    var Paginate = ui('Paginate', /** @lends emart.ui.Paginate# */{
        bindjQuery: 'paginate',
        $statics: /** @lends emart.ui.Paginate */{
            ON_PAGECLICK: 'paginatepageclick',
            ON_BEFORESEND: 'paginatebeforesend'
        },
        defaults: {
            pageSize: 10,       // 페이지 수
            page: 1,            // 기본 페이지
            totalCount: 0,      // 전체 리스트 수
            paramName: 'page',
            isRender: true,

            firstImgSrc: 'first.gif',
            prevImgSrc: 'prev.gif',
            nextImgSrc: 'next.gif',
            lastImgSrc: 'last.gif',

            firstClass: 'd-paginate-first',
            prevClass: 'd-paginate-prev',
            nextClass: 'd-paginate-next',
            lastClass: 'd-paginate-last',
            pageClass: 'd-paginate-page',
            pageListClass: 'd-paginate-list'
        },

        events: {
            // 페이지링크 클릭
            'click a, button': '_onPageClick'
        },
        selectors: {
        },
        /**
         *
         * @param el
         * @param options
         */
        initialize: function(el, options) {
            var me = this;

            if(me.callParent(el, options) === false) { return me.release(); }

            /*if(!me.options.ajax){
             throw new Error('ajax 옵션을 지정해 주세요.');
             }*/
            //me.totalCount = 0;
            me.rowTmpl = me.$('.'+me.options.pageListClass).first().html();
            me.$('.'+me.options.pageListClass).empty();

            me._configure();
            me._render();
            me.setPage(me.options.page);

            me.$el.show();
        },

        /**
         * 멤버변수 초기화
         * @private
         */
        _configure: function() {
            var me = this;

            me.page = 1;
            me.currPage = 0;
            //me.totalPage = Math.ceil(me.totalCount / me.options.pageSize);
        },


        /**
         * 페이지 번호 DOM 생성
         * @private
         */
        _render: function() {
            if(!this.options.isRender) { return; }

            var me = this,
                listNode = null,
                item = null,
                opts = me.options,
                total = opts.totalCount,
                totalPage = Math.ceil(total / opts.pageSize),
                nowGroupPage, start, end;


            me.$('.'+opts.firstClass).prop('disabled', total === 0 || me.page === 1);
            me.$('.'+opts.prevClass).prop('disabled', total === 0 || me.page <= 1);
            me.$('.'+opts.nextClass).prop('disabled', total === 0 || me.page >= totalPage);
            me.$('.'+opts.lastClass).prop('disabled', total === 0 || me.page === totalPage);

            if(total <= 0) {
                me.$el.find('.'+opts.pageListClass).empty();
                me.$items = null;
                return;
            }

            nowGroupPage = Math.floor((me.page - 1) / opts.pageSize);
            if(me.groupPage !== nowGroupPage || me.totalPage !== totalPage) {
                me.groupPage = nowGroupPage;
                me.totalPage = totalPage;

                start = nowGroupPage * opts.pageSize;
                end = Math.min(me.totalPage, start + opts.pageSize);

                listNode = $('<ul>');
                for (var i = start + 1; i <= end; i++) {
                    item = $($.trim(me.rowTmpl.replace(/\{0\}/g, i)));
                    item.find('.'+opts.pageClass).attr('data-page', i);
                    listNode.append(item);
                }
                me.$('.'+opts.pageListClass).empty().append(listNode.children());
                me.$items = me.$('.'+opts.pageClass);
                listNode = null;
            }

            me.$items.eq((me.page % opts.pageSize) - 1).activeItem('current');
        },

        _onPageClick: function(e) {
            e.preventDefault();

            var me = this,
                $btn = $(e.currentTarget),
                opts = me.options,
                page;

            if($btn.hasClass('disable')) {
                return;
            }

            if($btn.hasClass(opts.firstClass)) {
                // 첫 페이지
                page = 1;
            } else if($btn.hasClass(opts.prevClass)) {
                // 이전 페이지
                page = Math.max(1, me.page - 1);
            } else if($btn.hasClass(opts.nextClass)) {
                // 다음 페이지
                page = Math.min(me.totalPage, me.page + 1);
            } else if($btn.hasClass(opts.lastClass)) {
                // 마지막 페이지
                page = me.totalPage;
            } else {
                // 클릭한 페이지
                page = $btn.data('page');
            }

            me.triggerHandler(Paginate.ON_PAGECLICK, {page: page});
        },

        setPage: function(options) {
            var me = this;

            me.options = $.extend({}, me.options, options);
            me.page = me.options.page || 1;
            me._render();
        },

        /**
         * UI 새로고침
         * @param {JSON} options 변경할 옵션
         */
        update: function(options) {
            var me = this;

            me.options = $.extend({}, me.options, options);
            me._configure();
            me._render();
        },

        release: function() {
            var me = this;

            me.callParent();
        }
    });
    ///////////////////////////////////////////////////////////////////////////////////////


    //AjaxList ////////////////////////////////////////////////////////////////////////////
    /*
     ////////////////////////////////////////////////////////
     // 본 코드는 스크립트파트에서 그냥 작성해본 샘플입니다.
     // 이를 사용하셔도 되고 따로 구현하셔도 됩니다..^^
     var list = new ui.AjaxList('.board_list', {
     url: 'CAP1_2_list_ajax.html',
     paginate: { // 페이징 요소
     target: '.paging'
     }
     });

     // 처음 페이지 진입시 1페이지를 불러옴
     list.load(1, {
     storeCode: '',
     lectCode: '',
     weeks: [], // 검색부분에서 체크된 값을 배열로 설정 예) ['mo', 'we', 'fr']
     keyword: '',  // 검색부분의 강좌명 값
     status: '',     // 리스트헤더부분의 '전체,접수중(ing),접수마감(end)' 중 하나 예) '' or 'ing' or 'end'
     sort: ''
     });
     /////////////////////////////////////////////////////////
     */
    var AjaxList = ui('AjaxList', /** @lends emart.ui.AjaxList# */ {
        defaults: {
        },
        initialize: function(el, options) {
            var me = this,
                opts;

            if(me.callParent(el, options) === false) { return me.release(); }

            opts = me.options;
            if(opts.paginate) {
                me.paginate = new Paginate(opts.paginate.target, opts.pginate);
                me.paginate.on('paginatepageclick', function(e, data) {
                    me.load(data.page || 1);
                });
                me.on('pageloaded', function(e, data) {
                    var info = $.trim(me.$('.d-data').html());
                    if(info) {
                        try {
                            me.paginate.setPage($.parseJSON(info));
                        } catch(e) {
                            throw new Error('ajax결과값에 들어있는 json형식이 잘못 되었습니다.\n('+opts.url+')');
                        }
                    } else {
                        me.paginate.update({page: data.page})
                    }
                });
            }

            me._init();
        },

        _init: function() {
            var me = this;

            //me.load();
        },

        getCurrentPage: function() {
            return this.page;
        },

        load: function(p, data) {
            var me = this,
                opts = me.options;

            if(me._isLoading) {return;}
            me._isLoading = true;
            me.triggerHandler('preload', {page: p});

            data || (data = {});
            data['page'] = p;

            return $.ajax({
                url: opts.url,
                type: opts.type,
                data: data
            }).done(function(html) {
                me.$el.html(html);
                me.page = p;

                me.triggerHandler('pageloaded', {page: p});
            }).always(function() {
                me._isLoading = false;
                me.triggerHandler('loadcomplete');
            });
        }
    });
    ///////////////////////////////////////////////////////////////////////////////////////


    //Placeholder /////////////////////////////////////////////////////////////////////////
    /**
     * placeholder를 지원하지 않는 IE7~8상에서 placeholder효과를 처리하는 클래스
     * @class
     * @name emart.ui.Placeholder
     * @extends emart.ui.View
     * @example
     * new emart.ui.Placeholder( $('input[placeholder]'), {});
     * // 혹은 jquery 플러그인 방식으로도 호출 가능
     * $('input[placeholder]').placeholder({});
     */
    var Placeholder = ui('Placeholder', /** @lends emart.ui.Placeholder# */{
        bindjQuery: 'placeholder',
        defaults: {
            foreColor: '',
            placeholderClass: 'placeholder'
        },
        /**
         * 생성자
         * @param {String|Element|jQuery} el 해당 엘리먼트(노드, id, jQuery 어떤 형식이든 상관없다)
         * @param {Object} options 옵션값
         */
        initialize: function (el, options) {
            var me = this,
                is = ('placeholder' in core.tmpInput);

            if ( (options && options.force !== true) && is ) { return; }

            if(me.callParent(el, options) === false) { return; }

            me.placeholder = me.$el.attr('placeholder');

            me.$el.removeAttr('placeholder').attr('ori-placeholder', me.placeholder);
            me.placeholder = me.$el.getPlaceholder();
            me._foreColor = me.options.foreColor;

            var isPassword = me.$el.attr('type') === 'password';
			if(!me.$el[0].value){
				if(isPassword) {
					// 암호인풋인 경우 백그라운으로 처리
					me.$el.addClass(me.options.placeholderClass);
				} else {
					me.$el[0].value = me.placeholder;
				}
				me.$el.addClass('placeholder');
			}

            me.on('focusin click', function () {
                var val = me.options.force === true ? this.value.replace(/\r/g, '') : this.value;
                if (val === me.placeholder || !$.trim(val)) {
                    me.$el.removeClass(me._foreColor);
                    // 암호요소인 경우 백그라운드로 처리
                    if(isPassword) {
                        me.$el.removeClass(me.options.placeholderClass);
                    }
                    this.value = '';
					me.$el.removeClass('placeholder');
                }
            });
            me.on('focusout', function () {
                var val = me.options.force === true ? this.value.replace(/\r/g, '') : this.value;
                if (val === '' || val === me.placeholder) {
                    if(isPassword) {
                        me.$el.val('').addClass(me.options.placeholderClass);
                    } else {
                        me.$el.val(me.placeholder).addClass(me._foreColor);
                    }
					me.$el.addClass('placeholder');
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
        release: function () {
            var me = this;

            me.$el.removeData();
            me.callParent();
        }
    });

    if(!('placeholder' in core.tmpInput)) {
        $doc.on('submit.placeholder', 'form', function(e) {
            $('input[placeholder], input[ori-placeholder], textarea[placeholder], textarea[ori-placeholder]').each(function() {
                var $el = $(this),
                    txtPlaceholder = $el.getPlaceholder();
                if (txtPlaceholder === this.value) {
                    $el.removeClass(Placeholder.prototype.defaults.foreColor);
                    this.value = '';
                }
            });
        });
    }
    ///////////////////////////////////////////////////////////////////////////////////////


    //Selectbox////////////////////////////////////////////////////////////////////////////
    /**
     * 커스텀 셀렉트박스<br />
     * wrapClasses: ''<br />
     * disabledClass: 'disabled'<br />
     *
     * @class
     * @name emart.ui.Selectbox
     * @extends emart.ui.View
     */
    var Selectbox = ui('Selectbox', /** @lends emart.ui.Selectbox# */{
        bindjQuery: 'selectbox',
        $statics: {
            ON_CHANGED: 'selectboxchanged'
        },
        /**
         * 옵션
         * @property {JSON}
         */
        defaults: {
            wrapClasses: '',
            disabledClass: 'disabled'
        },
        /**
         * 생성자
         * @param {jQuery|Node|String} el 대상 엘리먼트
         * @param {JSON} options {Optional} 옵션
         */
        initialize: function(el, options) {
            var me = this;
            if(me.callParent(el, options) === false){ return me.release(); }
            me._create();
        },

        /**
         * select 컨트롤을 기반으로 UI DOM 생성
         * @private
         */
        _create: function() {
            var me = this,
                cls = me.$el.attr('data-class') || 'select_type01',
                timer = null;

            me.width = parseInt(me.$el.css('width'), 10);
            // 셀렉트박스
            me.$selectbox = $('<div class="'+cls+'"></div>').addClass(me.options.wrapClasses);
            me.$selectbox.insertAfter(me.$el.hide());

            me._createLabel();
            me._createList();

            me.$selectbox.on('selectboxopen selectboxclose', function(e){
                e.stopPropagation();

                // 리스트가 열리거나 닫힐 때 zindex 처리
                var zindexSelector = me.$el.attr('data-zindex-target'),
                    $zIndexTargets = zindexSelector ? me.$el.parents(zindexSelector) : false;

                if(e.type === 'selectboxopen') {
                    me.$label.addClass('open');
                    me.$el.closest('div.select_wrap').addClass('on');
                    $zIndexTargets&&$zIndexTargets.addClass('on');

                    isTouch && $('body').on('touchend.selectbox', function(){
                        me.close();
                    });
                } else {
                    me.$label.removeClass('open');
                    me.$el.closest('div.select_wrap').removeClass('on');
                    $zIndexTargets&&$zIndexTargets.removeClass('on');
                    clearTimeout(timer), timer = null;

                    isTouch && $('body').off('touchend.selectbox');
                }
            });

            // 비터치 기반일 때에 대한 이벤트 처리
            if( !isTouch ) {
                // 셀렉트박스에서 포커스가 벗어날 경우 자동으로 닫히게
                me.$selectbox.on('focusin focusout', function(e) {
                    clearTimeout(timer), timer = null;
                    if(e.type === 'focusout' && me.$label.hasClass('open')) {
                        timer = setTimeout(function(){
                            me.close();
                        }, 100);
                    }
                }).on('keydown', function(e) {
                    if(e.keyCode === core.keyCode.ESCAPE) {
                        me.close();
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

            me.update();
        },

        /**
         * 레이블 생성
         * @private
         */
        _createLabel: function() {
            var me = this;

            me.$label = $('<span class="select_box" tabindex="0" title="'+(me.$el.attr('title') || '셀렉트박스')+'"><span class="sel_r" style="width:190px;">&nbsp;</span></span>');
            me.$label.attr({
                'id': me.cid+'_button',
                'role': 'combobox',
                'aria-owns': me.cid+'_menu',
                'aria-expanded': 'false',
                'aria-haspopup': 'true',
                'aria-disabled': 'false'
            }).on('click', '.sel_r', function(e) {
                e.preventDefault();
                e.stopPropagation();

                if(me === Selectbox.active) {
                    me.close();
                    return;
                }

                if (!me.$label.hasClass(me.options.disabledClass)) {
                    // 현재 셀렉트박스가 열려있으면 닫고, 닫혀있으면 열어준다.
                    if(me.$label.hasClass('open')) {
                        me.close();
                    } else {
                        me.open();
                    }
                }
            });

            // 키보드에 의해서도 작동되도록 바인딩
            !isTouch && me.$label.on('keydown', function(e){
                if(e.keyCode === 13){
                    $(this).find('.sel_r').trigger('click');
                } else if(e.keyCode === core.keyCode.DOWN){
                    me.open();
                    me.$list.find(':focusable:first').focus();
                }
            });
            me.$label.find('.sel_r').css('width', me.width);
            me.$selectbox.append(me.$label);
        },

        /**
         * 리스트 생성
         * @private
         */
        _createList: function() {
            var me = this;

            me.$list = $('<div class="select_open" style="position:absolute;" tabindex="0"></div>');
            me.$list.hide().on('click', function(e){
                me.$list.focus();
            }).on('click', 'li>a', function(e) {
                // 아이템을 클릭했을 때
                e.preventDefault();
                e.stopPropagation();

                me.selectedIndex($(this).parent().index());
                me.close();
                me.$label.focus();
            }).on('mousedown', 'li>a', function() {
                this.focus();
            });
            me.$list.attr({
                'id': me.cid+'_menu',
                'role': 'listbox',
                'aria-hidden': 'true',
                'aria-labelledby': me.cid+'_button',
                'aria-disabled': 'false'
            });

            !isTouch && me.$list.on('keydown', 'li a', function(e) {
                // 키보드의 위/아래 키로 이동
                var index = $(this).parent().index(),
                    items = me.$list.find('li'),
                    count = items.length;

                switch(e.keyCode){
                    case core.keyCode.UP:
                        e.stopPropagation();
                        e.preventDefault();
                        items.eq(Math.max(0, index - 1)).children().focus();
                        break;
                    case core.keyCode.DOWN:
                        e.stopPropagation();
                        e.preventDefault();
                        items.eq(Math.min(count - 1, index + 1)).children().focus();
                        break;
                }
            });
            me.$selectbox.append(me.$list);
        },

        /**
         * 리스트 표시
         */
        open: function() {
            var me = this,
                scrollTop = $win.scrollTop(),
                winHeight = $win.height(),
                offset = me.$selectbox.offset(),
                listHeight = me.$list.height();

            Selectbox.active && Selectbox.active.close();

            me.$list.css('visibility', 'hidden').show();
            if(offset.top + listHeight > scrollTop + winHeight){
                me.$list.css('marginTop', (listHeight + me.$selectbox.height()) * -1);
            } else {
                me.$list.css('marginTop', '');
            }

            me.$list.css('visibility', '');
            me.$selectbox.triggerHandler('selectboxopen');
            Selectbox.active = me;
            $doc.on('click.selectbox', function(e) {
                Selectbox.active && Selectbox.active.close();
            });

            me.$list.attr({
                'aria-hidden': 'false'
            });
            me.$label.attr({
                'aria-expanded': 'true'
            });
        },

        /**
         * 리스트 닫기
         */
        close: function() {
            var me = this;

            me.$list.hide(), me.$selectbox.triggerHandler('selectboxclose');
            me.$list.attr({
                'aria-hidden': 'true'
            });
            me.$label.attr({
                'aria-expanded': 'false'
            });
            $doc.off('.selectbox');
            Selectbox.active = null;
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
                me.trigger('change', {selectedIndex: index});
            }

            me.$list.find('li').removeClass('on').eq(index).addClass('on');
            me.$list.attr({
                'aria-activedescendant': me.$list.find('li').attr('id')
            });
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
                core.each(me.$el[0].options, function(item, i) {
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
        update: function(list) {
            var me = this,
                opts = me.options,
                html = '',
                index = -1,
                text = '';

            if(core.isArray(list)){
                // list 값이 있으면 select를 갱신시킨다.
                me.el.options.length = 1;
                core.each(list, function(item, i) {
                    me.el.options.add(new Option(item.text || item.value, item.value));
                });
            }

            // select에 있는 options를 바탕으로 UI를 새로 생성한다.
            core.each(core.toArray(me.$el[0].options), function(item, i) {
                if ($(item).prop('selected')) {
                    index = i;
                    text = item.text;
                }
                html += '<li role="option" id="'+me.cid+'_item"><a href="#" data-value="' + item.value + '" data-text="' + item.text + '">' + item.text + '</a></li>';
            });
            me.$list.empty().html('<ul>'+html+'</ul>').find('li:eq(' + index + ')').addClass('on');
            me.$label.children().text(text);

            if (me.$el.prop('disabled')) {
                me.$label.addClass(opts.disabledClass).removeAttr('tabIndex');
            } else {
                me.$label.removeClass(opts.disabledClass).attr('tabIndex',0);
            }
        },

        /**
         * 소멸자
         */
        release: function() {
            var me = this;

            me.callParent();
            me.$label.off().remove();
            me.$list.off().remove();
            me.$el.unwrap('<div></div>');
            me.$el.off('change.selectbox').show();
        }
    });
    ///////////////////////////////////////////////////////////////////////////////////////

    //Tab ////////////////////////////////////////////////////////////////////////////////
    /**
     * @class
     * @name emart.ui.Tab
     * @description 페이징모듈
     * @extends emart.ui.View
     */
    ui('Tab', /** @lends emart.ui.Tab# */{
        bindjQuery: 'tab',
        $statics: /** @lends emart.ui.Tab */{
            ON_TAB_CHANGED: 'tabchanged'
        },
        defaults: {
            selectedIndex: 0,
            onClassName: 'on',
            tabType: 'inner'
        },

        events: {
        },
        selectors: {
            //tabs: '>ul>li'
        },
        /**
         * 생성자
         * @param el
         * @param options
         */
        initialize: function(el, options) {
            var me = this;

            if(me.callParent(el, options) === false) { return me.release(); }

            me.$tabs = me.$el.is('ul') ? me.$('>li') : me.$('>ul>li');
            me.$tabs.on('click', '>a, >button', function(e) {
                e.preventDefault();

                me.selectTab($(e.currentTarget).parent().index());
            });

            // 컨텐츠가 li바깥에 위치한 탭인 경우
            if(me.options.tabType === 'outer') {
                var selectors = [];
                // 탭버튼의 href에 있는 #아이디 를 가져와서 컨텐츠를 조회
                me.$tabs.each(function() {
                    selectors.push($(this).find('a').attr('href'));
                });

                if(selectors.length) {
                    me.$contents = $(selectors.join(', '));
                }
                me._buildARIA();
            }

            me.selectTab(me.options.selectedIndex);
        },

		/**
		 * aria 속성 빌드
		 */
        _buildARIA: function() {
            var me = this,
                tablistid = 'tab_' + me.cid,
                tabid, panelid;

            me.$el.attr('role', 'tablist');
            me.$tabs.each(function(i) {
                if(!me.$contents.eq(i).attr('id')) {
                    me.$contents.eq(i).attr('id', tabid = (tablistid + '_' + i));
                }
                var panelid = me.$contents.eq(i).attr('id');
                me.$contents.eq(i).attr({
                    'aria-labelledby': tabid,
                    'role': 'tabpanel',
                    'aria-hidden': 'true'
                });

                $(this).attr({
                    'id': tabid,
                    'role': 'tab',
                    'aria-selected': 'false',
                    'aria-controls': panelid
                });
            });

            me.on('tabchanged', function(e, data) {
                me.$tabs.attr('aria-selected', 'false').eq(data.selectedIndex).attr('aria-selected', 'true');
                me.$contents.attr('aria-hidden', 'true').eq(data.selectedIndex).attr('aria-hidden', 'false');
            });

        },

        activeTab: function(index) {
            var me = this, e;
            if(index < 0){ index = 0; }
            if(me.$tabs.length && index >= me.$tabs.length) {
                index = me.$tabs.length - 1;
            }


            me.$tabs.eq(index).activeItem(me.options.onClassName);

            // 컨텐츠가 li바깥에 위치한 탭인 경우
            if(me.options.tabType === 'outer' && me.$contents) {
                me.$contents.hide().eq(index).show();
            }
        },

		/**
		 * index에 해당하는 탭을 활성화
		 * @param {Number} index 탭버튼 인덱스
		 */
        selectTab: function(index) {
            var me = this, e;
            if(index < 0 || (me.$tabs.length && index >= me.$tabs.length)) {
                throw new Error('index 가 범위를 벗어났습니다.');
            }

            me.triggerHandler(e = $.Event('tabchange'), {selectedIndex: index});
            if(e.isDefaultPrevented()) { return; }

            me.$tabs.eq(index).activeItem(me.options.onClassName);

            // 컨텐츠가 li바깥에 위치한 탭인 경우
            if(me.options.tabType === 'outer' && me.$contents) {
                me.$contents.hide().eq(index).show();
            }
            me.triggerHandler('tabchanged', {selectedIndex: index});

        }
    });
    ///////////////////////////////////////////////////////////////////////////////////////

})(jQuery, window[LIB_NAME], window[LIB_NAME].ui);

(function($, core, ui, undefined) {
    var $win = core.$win,
        $doc = core.$doc,
        $body = core.$body;


    /**
     * 아코디언  이벤트
     * @name emart.ui.AccordionListEvent
     */
    core.define("ui.AccordionListEvent",
        /** @lends emart.ui.AccordionListEvent */{
            /** @property { String } EXPAND 리스트 열기  */
            EXPAND: "expand",
            /** @property { String } FOLD 리스트 닫기  */
            FOLD: "fold",
            /** @property { String } EXPAND 리스트 열림*/
            EXPANDED: "expanded",
            /** @property { String } EXPAND 리스트 닫힘*/
            FOLDED: "folded"
        }
    );


    /**********************************************************************************************
     *
     * AccordionList
     *
     **********************************************************************************************/

    /**
     * 아코디언 모듈
     * @class
     * @name emart.ui.AccordionList
	 * @author 김부윤
     */
    ui('AccordionList', /**@lends emart.ui.AccordionList# */{
        bindjQuery: 'accordion',
        $statics: /**@lends emart.ui.AccordionList */{

        },

        $mixins: [ui.Listener],

        defaults:{
            selectedClass : "on",
            disabledTitleClass : "disable",
            noneClass : "none",
            isSlideType: false,
            slideTime: 300,
            foldOthers: true,
            defaultOpenIndex:-1,
            isMoveTop: false
        },

        selectors: {
            list : ".d-accord-content",
            toggleClassTarget: ".d-accord-content",		
            toggleButton : ".d-toggle-button",				// 토글버튼
            content : ".cont",											// 컨텐츠 요소
            closeButton: ".d-close"								// 닫기 버튼
        },

        events: {
        },

        /**
         * 생성자
         * @param el
         * @param options
         */
        initialize: function(el, options) {
            if( this.callParent(el, options) === false ) { return; }
            this.isAniComplete = true;
            this.currentIndex;
            this.$contentList;

            if( this.options.isSlideType == "false" ){ this.options.isSlideType = false }

            if( this.options.defaultOpenIndex != -1 ){
                this._visibleExpand( this.options.defaultOpenIndex );
            }

            this._setHandlerOption();
            this._bindEvent();
        },

        /**
         * _option.isSlideType에 따라 핸들러 함수 설정
         * @private
         */
        _setHandlerOption: function(){
            this.fold = this._visibleFold;
            this.expand = this._visibleExpand;
            if( this.options.isSlideType ){
                this.fold = this._slideFold;
                this.expand = this._slideExpand;
            }
        },

        /**
         * 이벤트 바인딩
         */
        _bindEvent : function() {
            var me = this;
            var gnbTimer = undefined;
            var clicked = false;
            var isTouch = emart.browser.isTouch;

            function setClickedTimer(){
                clicked = true;
                clearTimeout( gnbTimer );
                gnbTimer = setTimeout(function(){
                    clicked = false;
                }, 500 );
            }

            var count = 0;
            this.$el.on("click dblclick", this.selectors.toggleButton, function(e){
				e.preventDefault();

                if( isTouch && clicked ){
                    return
                };


                if( isTouch ){setClickedTimer();}

                var $t = $(this);
                if ( $t.hasClass( me.options.disabledTitleClass ) ){
                    return;
                }

                var $currentTarget = $t.closest(me.selectors.list);
                var $classTarget;
                if( me.selectors.toggleClassTarget == me.selectors.list ){
                    $classTarget = $currentTarget;
                }else{
                    $classTarget = $currentTarget.find(me.selectors.toggleClassTarget);
                }

                me.$contentList = me.$el.find( me.selectors.list );
                var index = me.$contentList.index( $currentTarget );

                if( $currentTarget.find(me.selectors.content).length ){
                    e.preventDefault();
                }

                if ( $classTarget.hasClass( me.options.selectedClass ) ) {
                    me.fold( index );
                } else {
                    me.expand( index );
                }
            });

            this.$el.on("click", this.selectors.closeButton, function(e){
                e.preventDefault();
                var $targetList = $(this).closest(me.selectors.list);
                var index = me.$list.index($targetList);
                me.fold( index, me.options.duration );
            });
        },

        /**
         * 거리에 따른 duration 계산
         * @return { Integer }
         */
        _getDuration:function( dist, value ){
            var time = (dist/value)*this.options.slideTime;
            if( time < 200 ){  time = 200 };
            if( time > 700 ){  time = 700 };
            return Math.round(time);
        },

        /**
         * slide effect expand handler
         * @param { Integer } target index
         */
        _slideExpand: function( index ){
            var targetData = this._getTargetData(index);
            if( !targetData.isExe ){
                return;
            }

			var ev;
            this.trigger( ev = $.Event(ui.AccordionListEvent.EXPAND), {index: index} );
			if(ev.isDefaultPrevented()){ return; }

            var $targetCont = targetData.$targetCont,
                $scaleTarget = targetData.$scaleTarget,
                $classTarget = targetData.$classTarget;

            this.isAniComplete = false;
            $scaleTarget.removeClass( this.options.noneClass );
            $classTarget.addClass( this.options.selectedClass );

            $scaleTarget.height("");
            var targetHeight = $scaleTarget.outerHeight();
            var duration = this._getDuration(targetHeight,700);//this.options.slideTime;

            if( this.options.foldOthers && index != this.currentIndex ){
                this.isAniComplete = true;
                this._slideFold( this.currentIndex, duration );
            }

            $scaleTarget.stop().height(0).animate({"height": targetHeight }, duration, $.proxy(function(){
                this.isAniComplete = true;
                this.trigger( ui.AccordionListEvent.EXPANDED );
                $scaleTarget.height("");
                if(this.options.isMoveTop) {
                    $('html, body').stop().animate({'scrollTop': $classTarget.offset().top},  300 );
                }
            }, this));

            this.currentIndex = index;
        },

        _getTargetData: function( index ){
            var $targetCont;
            if( this.$contentList ){
                $targetCont = this.$contentList.eq(index);
            }else{
                $targetCont = this.$el.find( this.selectors.list ).eq(index);
            }

            var $scaleTarget = $targetCont.find( this.selectors.content );

            var isExe = true;
            if( !this.isAniComplete || $scaleTarget.length == 0 ){
                isExe = false
            }

            var $classTarget;
            if( this.selectors.toggleClassTarget == this.selectors.list ){
                $classTarget = $targetCont;
            }else{
                $classTarget = $targetCont.find(this.selectors.toggleClassTarget);
            }

            return {
                $targetCont : $targetCont,
                $scaleTarget : $scaleTarget,
                $classTarget : $classTarget,
                isExe: isExe
            }
        },


        /**
         * slide effect fold handler
         * @private
         * @param { Integer } target index
         */
        _slideFold: function( index, duration ){

            var targetData = this._getTargetData(index);
            if( !targetData.isExe ){
                return;
            }

			var ev;
            this.trigger( ev = $.Event(ui.AccordionListEvent.FOLD), {index: index} );
			if(ev.isDefaultPrevented()){ return; }

            var $targetCont = targetData.$targetCont,
                $scaleTarget = targetData.$scaleTarget,
                $classTarget = targetData.$classTarget;

            this.isAniComplete = false;


            if( duration == undefined ){
                duration = this.options.slideTime;
            }

            $scaleTarget.stop().animate({"height":0 }, duration, $.proxy(function(){
                $scaleTarget.addClass( this.options.noneClass );
                $classTarget.removeClass( this.options.selectedClass );
                this.trigger( ui.AccordionListEvent.FOLDED, {index: index} );
                this.isAniComplete = true;
            },this));
        },

        /**
         * expand handler
         * @private
         * @param { Integer } target index
         */
        _visibleExpand : function( index ) {
            var targetData = this._getTargetData(index);
            if( !targetData.isExe ){
                return;
            }

			var ev;
            this.trigger( ev = $.Event(ui.AccordionListEvent.EXPAND), {index: index} );
			if(ev.isDefaultPrevented()){ return; }

            var $targetCont = targetData.$targetCont,
                $scaleTarget = targetData.$scaleTarget,
                $classTarget = targetData.$classTarget;

            $scaleTarget.removeClass( this.options.noneClass );
            $classTarget.addClass( this.options.selectedClass );

            if( this.options.foldOthers && index != this.currentIndex ){
                this._visibleFold( this.currentIndex );
            }
            $scaleTarget.removeClass( this.options.noneClass );

            if(this.options.isMoveTop) {
                $('html, body').scrollTop($classTarget.offset().top);
            }


            this.currentIndex = index;
            this.trigger( ui.AccordionListEvent.EXPANDED, {index: index} );
        },

        /**
         * fold handler
         * @private
         * @param { Integer } target index
         */
        _visibleFold : function( index ) {
            var targetData = this._getTargetData(index);
            if( !targetData.isExe ){
                return;
            }

			var ev;
            this.trigger( ev = $.Event(ui.AccordionListEvent.FOLD), {index: index} );
			if(ev.isDefaultPrevented()){ return; }

            var $targetCont = targetData.$targetCont,
                $scaleTarget = targetData.$scaleTarget,
                $classTarget = targetData.$classTarget;

            $classTarget.removeClass( this.options.selectedClass );
            $scaleTarget.addClass( this.options.noneClass );
            this.trigger( ui.AccordionListEvent.FOLDED, {index: index} );
        },

        release: function(){

        }
    });
})(jQuery, window[LIB_NAME], window[LIB_NAME].ui);

(function($, core, ui, undefined) {
    "use strict";

    var $doc = core.$doc,
        win = window;

    var s = {
        PC: 1,
        MOBILE: 2,
        APP: 4
    };

    core.sns = /** @lends emart.sns */{
        types: /** @lends emart.sns.types */{ //['facebook', 'twitter', 'kakaotalk', 'kakaostory'/* , 'googleplus'*/],
            'facebook': /** @lends emart.sns.types.facebook */{
                name: '페이스북',
                support: s.PC | s.MOBILE,
                baseUrl: 'https://www.facebook.com/sharer.php?',
                makeParam: function(data) {
					data.url = core.uri.addParam(data.url, {
						'_t': +new Date
					});
                    return 'u=' + encodeURIComponent(data.url) + (data.title && '&t=' + encodeURIComponent(data.title));
                }
            },
            'twitter': /** @lends emart.sns.types.twitter */{
                name: '트위터',
                support: s.PC | s.MOBILE,
                baseUrl: 'https://twitter.com/intent/tweet?',
                makeParam: function(data) {
					data.desc = data.desc || '';

					var length = 140 - data.url.length - 6, // ... 갯수
						txt = data.title + ' - ' + data.desc;

					txt = txt.length > length ? txt.substr(0, length) + '...' : txt;
                    return 'text=' + encodeURIComponent(txt + ' ' + data.url);
                }
            },
            'kakaotalk': /** @lends emart.sns.types.kakaotalk */{
                name: '카카오톡',
                support: s.APP | s.MOBILE,
                makeParam: function(data) {
                    return {
                        msg: data.title + "\n" + (data.desc||''),
                        url: data.url,
                        appid: "emart store",
                        appver: "0.1",
                        type: "link",
                        appname: "이마트스토어"
                    };
                }
            },
            'kakaostory': /** @lends emart.sns.types.kakaostory */{
                name: '카카오스토리',
                support: s.APP | s.MOBILE,
                makeParam: function(data) {
                    return {
                        post: data.title + "\n" + (data.desc||'')+"\n"+data.url,
                        appid: "emart.com",
                        appver: "1.0",
                        apiver: "1.0",
                        appname: "이마트 스토어"
                    };
                }
            },
            'line': /** @lends emart.sns.types.line */{
                name: '라인',
                support: s.APP | s.MOBILE,
                baseUrl: 'line://msg/text/',
                store: {
                    android: {
                        intentPrefix: "intent://msg/text/",
                        intentSuffix: "#Intent;scheme=line;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;package=jp.naver.line.android;end"
                    },
                    ios: "http://itunes.apple.com/jp/app/line/id443904275"
                },
                makeParam: function(data) {
                    return '';
                }
            },
            'googleplus': /** @lends emart.sns.types.googleplus */{
                name: '구글플러스',
                support: s.PC | s.MOBILE,
                baseUrl: 'https://plus.google.com/share?',
                makeParam: function(data) {
                    return 'url=' + encodeURIComponent(data.title + ' ' + data.url);
                }
            }
        },

        share: function(type, params) {
            var service = this.types[type];
            if(!service){ return; }

            params.url = (params.url+'').replace(/#$/g, '');
            params.url = params.url || location.href.replace(/#$/g, '');
            params.title = params.title||document.title;

            if(!core.browser.isMobile && service.support&s.MOBILE === 0) {
                alert("‘"+service.name+"’으로의 공유 기능은\n모바일 기기에서만 사용하실 수 있습니다");
                return;
            }

            this._send(type, params);
        },

        _send: function (type, params) {
            var service = this.types[type];
            if(!service){ return; }

			switch(type) {
                case 'facebook':
                case 'twitter':
                    if(window.isApp){
						core.app&&core.app.cmd('open_out_webpage', 'link='+service.baseUrl + service.makeParam(params));
					} else {
						window.open(
							 service.baseUrl + service.makeParam(params),
							type,
							'menubar=no,height=300, width=550'
						);
					}
                    break;
                case 'kakaotalk':
					if(!window.kakao){
						alert('카카오톡 공유기능은 모바일기기에서만 가능합니다.');
						return;
					}
                    kakao.link('talk').send(service.makeParam(params));
                    break;
                case 'kakaostory':
                	Kakao.Auth.login({
                		success: function() {
                	        // 로그인 성공시, API를 호출합니다.
                			Kakao.API.request( {
                				url : '/v1/api/story/linkinfo',
                				data : {
                					url : params.url
                				}
                	        }).then(function(res) {
                	        	// 이전 API 호출이 성공한 경우 다음 API를 호출합니다.
                	        	return Kakao.API.request( {
                	        		url : '/v1/api/story/post/link',
                	        		data : {
                	        			link_info : res
                	        		}
                	        	});
                	        }).then(function(res) {
                	        	return Kakao.API.request( {
                	        		url : '/v1/api/story/mystory',
                	        		data : { id : res.id }
                	        	});
                	        }).then(function(res) {
                	        	//이곳에서 제대로 처리 되었을 경우 최종 리턴 값
                	        	alert("카카오스토리에 공유했습니다.");
                	        	return true;
                	        }, function (err) {
                	        	console.log(err);
                	        });
                		},
                		fail: function(err) {
                			console.log(err);
                		}
                	});
                    //kakao.link('story').send(service.makeParam(params));
                	
                    break;
            }
        }
    };

})(jQuery, window[LIB_NAME], window[LIB_NAME].ui);

(function($, core, ui, undefined) {
    "use strict";

    // 글로벌 기능들 구현 부분
    // modal, selectbox

    var $doc = core.$doc,
        win = window,
        _isInit = false;

    /**
     * 주어진 엘리먼트 하위에 탭, 아코디온, 달력, Placeholder 관연요소가 있을 때 해당 UI모듈을 빌드해준다.
     * @function
     * @name $#buildUIControls
     * @param {String} types (Optional) "tab,selectbox,calendar,placeholder"
	 * @example
	 * $.ajax(...).done(function(html) {
	 *    $('#box').html(html).buildUIControls();  
	 *    // 동적으로 새로 추가된 컨텐츠에 탭이나 아코디온이 존재할 경우 이 메소드를 호출해주어야 각 기능들이 작동한다.
	 * });
     */
    $.fn.buildUIControls = function() {
        //this.find('.d-selectbox').selectbox();   // 셀렉트박스 스킨모드로 변경
        this.find('.d-tab').tab();               // 탭
        this.find('.d-calendar').calendar();     // 달력
        this.find('.d-accordion').accordion();    // 아코디온
        if(!('placeholder' in core.tmpInput)) {   // placeholder
            this.find('input[placeholder], textarea[placeholder]').placeholder();
        }
    };


    /**
	 * 글로벌 이벤트 정의(인쇄, 전체선택, 공유하기, 공통 UI 빌드 등)
     * @name emart.GlobalUI
     */
    core.GlobalUI = /** @lends emart.GlobalUI */{
        init: function() {
            if(_isInit) { return; }

            this.base();
            this.hover();
            this.modal();
            this.close();
            this.print();
            this.link();
            this.buttonPressed();
            this.checkAll();
            this.sns();
        },

        /**
         * 탭, 커스텀셀렉트박스, 달력, 플레이스홀더, 아코디온 등의 공통 기능을 바인딩
         */
        base: function() {
            // tab, selectbox, calendar, placeholder
            $doc.buildUIControls();
        },

        /**
         * 1. 버튼에 링크기능 바인딩(_self:현재창, _blank: 팝업, _modal: 모달레이어)
         * 2. [data-control=toggle], .d-toggle에 해당하는 요소를 클릭했을 때 next에 있는 요소를 토글링해준다.(드롭다운 레이어)
         */
        link: function(){
            // 버튼에 링크기능 추가
            $doc.on("click.globalui", "button[data-href], a[data-target]", function(e){
                e.preventDefault();

                var $el = $(this),
                    href = $el.attr("data-href") ||  $el.attr("href"),
                    target = $el.attr("data-target");

				if(!href){ return; }

                switch( target ){
                    case "_self":
                        window.location.assign(href);
                        break;
                    case "_blank":
                        window.open(href, target, $el.attr('data-options') || '');
                        break;
                    case "_modal":
                        core.ui.ajaxModal(href, {opener: $el});
                        break;
                    default :
                        window.location.assign(href);
                }
            });

			$doc.on('click.globalui', 'a.disabled', function(e) {
				e.preventDefault();
				e.stopPropagation();
			});

            // 드롭다운 레이어 바인딩
			// ex) <button class="d-toggle" data-target="#box">보기</button><div class="none" id="box">...</div>
            $doc.on('click.globalui', '[data-control=toggle], .d-toggle', (function() {
                var $layer = $(),
                    $btn = $();

                function hideLayer() {
                    $layer.addClass('none');
                    $btn.removeClass('on');
                    $doc.off('click.togglelayer');
                }

                return function(e) {
                    e.preventDefault();
                    e.stopPropagation();

                    var $el = $(this),
                        target = $el.attr('data-target') || core.uri.removeHash($el.attr('href')),
                        $target = target ? $( target ) : $el.next('div');

                    if($target.length === 0){ return; }
                    if($target[0] != $layer[0]) { hideLayer(); }

                    var isShow = !$target.hasClass('none');
                    if(!isShow) {
                        // 레이어영역 밖을 클릭했을 때 레이어가 닫히도록
                        $doc.off('click.togglelayer').on('click.togglelayer', function(e) {
                            if(($layer[0] !== e.target && !$.contains($layer[0], e.target)) || $(e.target).hasClass('d-close')) {
                                //e.preventDefault();
                                hideLayer();
                                $btn.focus();
                            }
                        });
                    }
                    $layer = $target.addClass('d-togglelayer').toggleClass('none', isShow);
                    $btn = $el.toggleClass('on', !isShow);

                    $layer.triggerHandler(isShow ? 'hidelayer' : 'showlayer');
                };
            })());
        },

        /**
         * a 링크에 버튼눌림과 같은 효가를 주기 위해 마우스다운 시 active클래스를 추가, 마우스업 때 제거
         */
        buttonPressed: function() {
            // 버튼 눌림효과

            // 터치디바이스에서는 무시함
            /*if(!core.browser.isOldIE){
                return;
            }*/

            // 버튼 pressed 효과
            $doc.on('mousedown.globalui mouseup.globalui mouseleave.globalui click.globalui', '.d-active', function(e) {
                var $el = $(this);

                if($el.hasClass('disabled')) {
                    return;
                }

                switch(e.type) {
                    case 'mousedown':
                        $el.addClass('active');
                        break;
                    default:
                        $el.removeClass('active');
                        break;
                }
            });
        },

        /**
         * a 이외에 요소에 효버효과를 바인딩(ie하위버전에서 a이외에 :hover가 있으면 freezing 현상이 발생)
         */
        hover: function() {
            // 터치디바이스에서는 무시함
            if(core.browser.isTouch){
                return;
            }

            // 호버 효과
            $doc.on('mouseenter.globalui', '.d-hover', function(e) {
                $(this).addClass('hover');
            });

            $doc.on('mouseleave.globalui', '.d-hover', function(e) {
                $(this).removeClass('hover');
            });
        },

        /**
         * 전체선택 체크박스(테이블 태그 내)
         *
         * @example
         */
        checkAll: function() {
            var me = this;

            // 전체 선택
            $doc.on('click.globalui', 'thead input:checkbox, tbody input:checkbox', function (e) {
                var $check = $(this),
                    $table = $check.closest('table'),
                    $thead = $table.find('>thead'),
                    $tbody = $table.find('>tbody'),
                    isInHead = $thead.length > 0;

                if($check.closest('thead').length) {
                    $tbody.find('input:checkbox:enabled:not(.d-notcheck)').prop('checked', this.checked);
                } else {
                    if($tbody.find('input:checkbox:not(:checked)').length) {
                        $thead.find('input:checkbox').prop('checked', false);
                    } else {
                        $thead.find('input:checkbox').prop('checked', true);
                    }
                }
                
                $thead.find('input:checkbox').triggerHandler('checkallchanged');
			});
        },

        /**
         * 1. 윈도우 창 닫기 기능 바인딩
         * 2. 레이어 닫기
         */
        close: function(){
            //윈도우 창 닫기 기능
            $doc.on("click.globalui", ".d-win-close", function(e){
                e.preventDefault();

                self.close();
            });

            // 레이어 닫기
            $doc.on("click.globalui", ".d-layer .d-close", function(e){
                e.preventDefault();

                $(this).closest('.d-layer').toggle( !$(this).closest('.d-layer').is(':visible') );
            });
        },

        /**
         * 버튼에 d-print를 추가해주면 인쇄 기능이 바인딩
         */
        print: function(){
            //인쇄 기능
            $doc.on("click.globalui", ".d-print", function(e) {
                e.preventDefault();
                if(this.getAttribute('data-frame')){
                    try {
                        win.frames[this.getAttribute('data-frame')].print();
                    } catch(e){alert(e)}
                } else {
                    win.print();
                }
            });
        },

        /**
         * 버튼에 data-control=modal를 추가해줌으로써 next에 있는 div를 모달로 띄워준다.
         */
        modal: function() {
            // 모달 띄우기
            $.fn.modal && $doc.on('click.globalui', '[data-control=modal]', function(e) {
                e.preventDefault();
                var $el = $(this),
                    target = $el.attr('href') || $el.attr('data-target'),
                    $modal;
                if(target){
                    // ajax형 모달인 경우
                    if(!/^#/.test(target)) {
                        $.ajax({
                            url: target
                        }).done(function(html) {
                            $modal = $('<div class="d-modal-ajax d-modal-new" style="display:none"></div>').html(html).appendTo('body');
                            $modal.modal({opener: $el, removeOnClose:true});
                        });
                        return;
                    } else {
                        $modal = $(target);
                    }
                } else {
                    $modal = $(this).next('div.d-layerpop');
                }

                if($modal && $modal.length > 0) {
                    $modal.modal({opener: $el});
                }
            });

            // ajax로 생성된 레이어팝업이면 표시때, 내부에 속한 공통 UI 들을 빌드
            $doc.on('modalshown.globalui', '.d-modal-new', function(e) {
                $(this).buildUIControls().removeClass('d-modal-new');
            });
        },

        sns: function() {
            var types = core.object.keys(core.sns.types);

            $doc.on('click.globalui', core.array.map(types, function(val) { return '.d-'+val; }).join(', '), function(e) {
                e.preventDefault();

                var $el = $(this),
                    url = $el.attr('href') || $el.attr('data-url') || location.href,
                    title = $el.attr('data-title') || document.title,
                    desc = $el.attr('data-desc') || $('head meta[property$=description]').attr('content') || $('head meta[name=description]').attr('content') || '',
                    image = $el.attr('data-image') || $('head meta[property$=image]').attr('content') || '',
                    service = $el.attr('data-service');

                if(!service){
                    core.each(types, function(name) {
                        if($el.hasClass('d-'+name)) {
                            service = name;
                            return false;
                        }
                    });
                    if(!service) {
                        alert('공유할 SNS타입을 지정해주세요.');
                        return;
                    }
                }

                core.sns.share(service, {url: url, title:title, desc: desc, image: image});
            });
        }
    };

	// 결제가능한 브라우저인가.
	core.browser.isCanPayment = (function(){
		var b = core.browser;

		if(b.isWin && (b.isIE || b.isChrome)){ return true; }
		return false;
	})();

})(jQuery, window[LIB_NAME], window[LIB_NAME].ui);

(function($, core, ui, undefined) {
    "use strict";

    var $doc = core.$doc,
        $win = core.$win;

    // ui를 글로벌에 설정
    window.ui = ui;

    // UI모듈의 기본값 설정
    ui.setDefaults('Tab', {
        events: {
            'tabchanged': function() {
                // 만약 탭이 모달내부에 있고 탭이 변경될 때 내부사이즈가 변경되면,
                // 해당 모달창의 크기를 컨텐츠 사이즈에 맞게 재조절
                setTimeout(function() {
                    // 현재 표시 되고 있는 모달창의 사이즈를 재조절
                    core.PubSub.trigger('resize:modal'); // ui.Modal 모듈코드 참조
                }, 100);
            }
        }
    });

    // UI모듈의 기본값 설정
    ui.setDefaults('Modal', {
        events: {
            'modalshow': function() {
                $('html, body').stop().animate({
					scrollTop: 0
				}, 50);
            }
        }
    });

    ui.setDefaults('Placeholder', {
        'placeholderClass': 'user_pw'
    });

    ui.setDefaults('Calendar', {
        weekNames: ['일','월','화','수','목','금','토'],
        header: false,
        template: {
            button: [
                '<span class="m-calendar-day" title="<$-title$>">',
                '<$if(isHoliday){$>',
                '<span class="hide">휴점일</span>',
                '<$} if(isToday){$>',
                '<span class="hide">오늘</span>',
                '<$}$>',
                '<a href="#" aria-describedby="d-<$-emart.date.format(date, \'yyyyMMdd\')$>"><$=day$></a>',
                '</span>'].join(''),
            label: [
                '<span class="m-calendar-day" title="<$-title$>">',
                '<$if(isHoliday){$>',
                '<span class="hide">휴점일</span>',
                '<$} if(isToday){$>',
                '<span class="hide">오늘</span>',
                '<$}$>',
                '<em><$=day$></em>',
                '</span>'].join('')
        }
    });

	// 문화센터에서만 사용
	// ajax 대상 페이지가 로그인 필요페이지일 경우 서버에서 status code를 401로 반환해주는데, 
	// 이를 체크하여 로그인팝업을 띄워주도록 설정
	$.ajaxSetup({
		error: function(xhr, textStatus, error) {
			if(xhr.status === 401){
				culture.login.open_login_pop();
			} else {
				//alert('');
			}
		}
	});

    $(function() {
        core.GlobalUI.init();

		// 퓨터 패밀리사이트 가기
		!core.browser.isMobile && $('#footer .family_link .link_go').click(function(){
			var href =$(this).parent().find('select option:selected').val();
			if(href) {
				window.open(href, '_blank');
			} else {
				alert('이동할 사이트를 선택해 주세요.');
				$(this).focus();
			}
		});
		///////////////////////////////

    });

})(jQuery, window[LIB_NAME], window[LIB_NAME].ui);

/* 개발팀 요청으로 추가한 글로벌함수 */
/*
 * gateUrl : 필수
 * retUrl : (옵션)이동할 경로
 * popup : (옵션)새창으로 표시할 경우 true
 * confirmMsg : (옵션)이동 전 알림문구. 필요시 설정
 */
function ssoLink(gateUrl, retUrl, popup, confirmMsg) { 
	   if (gateUrl == undefined || gateUrl == '') {
			   alert('이동할 곳이 지정되지 않았습니다.');
			   return;
	   }
	   
	   var isPop = false;
	   if (popup != undefined && popup) {
			   isPop = true;
	   }
	   
	   var hasConfirmMsg = false;
	   if (confirmMsg != undefined && confirmMsg != '') {
			   hasConfirmMsg = true;
	   }
	   
	   var isRun = true;
	   if (hasConfirmMsg) {
			   isRun = confirm(confirmMsg);
	   }
	   
	   if (isRun) {
			   $.ajax({
					  type           : 'GET',
			   dataType       : 'json',
			   url                   : emart.Env.get("emartTokenUrl"), //'/myemart/getToken.do',
			  success : function(data){
					  var destUrl = gateUrl;
					  if (data.token)
					  {
						  destUrl = gateUrl + '?token=' + data.token;
						  if (retUrl != undefined && retUrl != '') {
								  destUrl = destUrl + '&retUrl=' + retUrl;
						  }
					  }
			  
					  if(window.isApp){
							 emart.app.cmd("open_out_webpage", "link=" + destUrl);
					  } else {
							 if (isPop) {
									 window.open(destUrl,"gate","toolbar=yes,menubar=yes,location=yes,scrollbars=yes,resizable=yes");
							 } else {
									 document.location.href = destUrl;
							 }
					  }
			   },
			   error : function(data, status){      
							 if (isPop) {
									 window.open(gateUrl,"gate","toolbar=yes,menubar=yes,location=yes,scrollbars=yes,resizable=yes");
							 } else {
									 document.location.href = gateUrl;
							 }
			   }
			});
	   }
}
