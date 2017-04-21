/**
 * @authror: 김승일
 * @email: comahead@vi-nyl.com
 * @created: 2014-06-27
 * @description: framework
 */ 
(function ($, core, ui, undefined) {
    "use strict";

    var browser = core.browser,
        byteLength = core.string.byteLength,
        charsByByte = core.string.charsByByte;

    /**
     * 입력제한 기능을 담당하는 클래스
     * @class
     * @name emart.ui.TextCounter
     * @extends emart.ui.View
     * @example
     * new TextCounter( $('input.d_textcounter'), {});
     * // 혹은 jquery 플러그인 방식으로도 호출 가능
     * $('input.d_textcounter').textCounter({});
     */
    var TextCounter = ui('TextCounter', /** @lends emart.ui.TextCounter# */{
        $statics: {
            ON_TEXTCOUNT_CHANGE: 'textcounterchange' // 글자수가 변경되었을 때 발생
        },
        defaults: {
            countType: 'char',
            limit: 100 // 최대 글자 수(charType)
        },

        /**
         * 생성자
         * @param {String|Element|jQuery} el 해당 엘리먼트(노드, id, jQuery 어떤 형식이든 상관없다)
         * @param {Object} options 옵션값
         */
        initialize: function(el, options) {
            var me = this;

            me.callParent(el, options);
            me.currentLength = 0;
            me.placeholder = me.$el.getPlaceholder();

            if (core.browser.isGecko) {
                me._forceKeyup();
            }

            me.on('keydown keyup cut paste blur', function(e) {
                var isOver = me._checkLimit();
                if (e.type === 'keyup' || e.type === 'paste') {
                    if (isOver) {
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

            me.currentLength = me.textLength(me.$el.trimVal());
            if (me.currentLength > o.limit) {
                me._truncateValue();
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
                value = $el.trimVal(),
                limit = me.options.limit,
				countingByte = me.options.countType === 'byte',
                chars = 0;

            if (limit === 0) {
                $el[0].value = me.placeholder;
                me.currentLength = limit;
            } else if(limit < me.currentLength) {
                chars = (countingByte ? charsByByte(value, limit) : limit);
                $el[0].blur();
                $el[0].value = value.substring(0, chars);
                $el[0].focus();
                me.currentLength = (countingByte ? byteLength($el[0].value) : limit);
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
        release: function() {
            var me = this;

            me.timer && clearInterval(me.timer);
            me.callParent();
        }
    });

    /**
     * textarea, input에서 글자수 체크 및 자동리사이징 처리를 담당하는 클래스
     * @class
     * @name emart.ui.TextControl
     * @extends emart.ui.View
     * @example
     * new ui.TextControl( $('textarea'), {checkCount: true});
     * // or
     * $('textarea').textControl({checkCount: true});
     */
    var TextControl = ui('TextControl', /** @lends emart.ui.TextControl# */{
        $extend: TextCounter,
        $statics: {
            ON_INIT: 'init',
            ON_CHANGE: 'textcontrolchange'
        },
        bindjQuery: 'textControl',
        defaults: {
            limit: 100,
            checkCount: true,
            countTarget: '',
            countText: '<strong>{len}</strong> / {limit}자',

            autoResize: false,
            allowPaste: true
        },
        /**
         * 생성자
         * @param {String|Element|jQuery} el 해당 엘리먼트(노드, id, jQuery 어떤 형식이든 상관없다)
         * @param {Object} options 옵션값
         */
        initialize: function (el, options) {
            var me = this;
            if(me.callParent(el, options) === false) { return; }

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
            if (o.checkCount) {
                // subviews에다 설정하면 release가 호출될 때, subviews에 들어있는 컨트롤들의 release도 알아서 호출해준다.
                me.on('textcounterchange', (function() {
                    var $countTarget = $(me.options.countTarget),
                        strUtil = core.string,
						numUtil = core.number,
						showCount = function(len, limit){
							$countTarget.html(strUtil.format(me.options.countText, {len: numUtil.addComma(len) || 0, limit:numUtil.addComma(limit) || 0}));
						};

					showCount(me.currentLength, o.limit);
                    return function(e, len) {
                        if(me.$el.val()===me.$el.getPlaceholder()){return;}
						showCount(me.currentLength, o.limit);
                    };
                }()));
            }
        },

        /**
         * 텍스트박스의 리사이징을 위한 이벤트 바인딩
         * @private
         */
        _autoResize: function() {
            var me = this,
                isOldIE = core.browser.isOldIE,
                $clone, oriHeight, offset = 0;


            me.$el.css({overflow: 'hidden', resize: 'none'/*, height: 'auto'*/});

            $clone = isOldIE ? me.$el.clone().removeAttr('name').removeAttr('id').addClass('d-tmp-textarea').val('').appendTo(me.$el.parent()) : me.$el;
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
            var me = this,
                current = $el.val(),
                prev = me.prevVal,
                isOldIE = core.browser.isOldIE,
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
        release: function () {
            var me = this;

            me.callParent();
        }
    });


    TextControl.prototype.defaults.countText = '{len} / {limit}byte';

})(jQuery, window[LIB_NAME], window[LIB_NAME].ui);
