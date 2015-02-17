/*!
 * @author common.ui.placeholder.js
 * @email comahead@vi-nyl.com
 * @create 2014-11-25
 * @license MIT License
 */
(function ($, core, undefined) {
    "use strict";

    var $doc = core.$doc,
        ui = core.ui,
        browser = core.browser,
        isTouch = browser.isTouch;


    //Placeholder /////////////////////////////////////////////////////////////////////////
    /**
     * placeholder를 지원하지 않는 IE7~8상에서 placeholder효과를 처리하는 클래스
     * @class
     * @name common.ui.Placeholder
     * @extends common.ui.View
     * @example
     * new common.ui.Placeholder('input[placeholder]', {});
     * // 혹은 jquery 플러그인 방식으로도 호출 가능
     * $('input[placeholder]').placeholder({});
     */
    var Placeholder = ui('Placeholder', /** @lends common.ui.Placeholder# */{
        bindjQuery: 'placeholder',
        defaults: {
            foreColor: '',
            placeholderClass: 'placeholder'
        },
        /**
         * 생성자
         * @param {string|Element|jQuery} el 해당 엘리먼트(노드, id, jQuery 어떤 형식이든 상관없다)
         * @param {Object} [options] 옵션값
         * @param {string} [options.foreColor = ''] placeholder 폰트색
         * @param {string} [options.placeholderClass = 'placeholder'] placeholder 클래스명
         */
        initialize: function (el, options) {
            var me = this,
                is = ('placeholder' in core.tmpInput);

            if ( (options && options.force !== true) && is ) { return; }
            if(me.supr(el, options) === false) { return; }

            me.placeholder = me.$el.attr('placeholder');
            me.$el.removeAttr('placeholder').attr('ori-placeholder', me.placeholder);
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
            me._bindEvents();
        },

        _bindEvents: function () {
            var me = this;

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
            me.supr();
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

    if (typeof define === "function" && define.amd) {
        define([], function() {
            return Placeholder;
        });
    }

})(jQuery, window[LIB_NAME]);
