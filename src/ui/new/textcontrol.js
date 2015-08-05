/**
 * @module coma.ui.Textcontrol
 * @authror: �����
 * @email: comahead@vi-nyl.com
 * @created: 2014-06-27
 * @description: framework
 */
(function ($, core, undefined) {
    "use strict";

    if(core.ui.TextControl) { return; }

    var browser = core.browser,
        ui = core.ui,
        byteLength = core.string.byteLength,
        charsByByte = core.string.indexByByte;

    /**
     * textarea, input���� ���ڼ� üũ �� �ڵ�������¡ ó���� ����ϴ� Ŭ����
     * @class
     * @name coma.ui.TextControl
     * @extends coma.ui.View
     * @fires coma.ui.TextControl#textcontrolchange
     * @fires coma.ui.TextControl#textcontrolresize
     * @example
     * new ui.TextControl( $('textarea'), {checkCount: true});
     * // or
     * $('textarea').scTextControl({checkCount: true});
     */
    var TextControl = ui('TextControl', /** @lends coma.ui.TextControl# */{
        $statics: {
            ON_INIT: 'init',
            ON_CHANGE: 'textcontrolchange'
        },
        bindjQuery: 'textControl',
        defaults: {
            limit: 2000,
            checkCount: true,
            countTarget: '',
            countText: '<strong>{len}</strong> / {limit}��',
            countType: 'char',
            autoResize: false,
            allowPaste: true
        },
        /**
         * ������
         * @param {string|Element|jQuery} el �ش� ������Ʈ(���, id, jQuery � �����̵� �������)
         * @param {Object} [options] �ɼǰ�
         * @param {number} [options.limit = 100]  �ִ� �Է°����� ���� ��
         * @param {boolean} [options.checkCount = true] ���ڼ� üũ ����
         * @param {string} [options.countTarget = ''] ���ڼ��� ǥ�õ� ���
         * @param {string} [options.countType = 'char']  ī���� ���(char | byte)
         * @param {boolean} [options.autoResize = false]  �ڵ�������¡ ����
         * @param {boolean} [options.allowPaste = true] �ٿ��ֱ� ��� ����
         */
        initialize: function (el, options) {
            var me = this;
            if (me.supr(el, options) === false) { return; }

            me.currentLength = 0;
            me.placeholder = me.$el.attr('placeholder');

            if (core.browser.isGecko) {
                me._forceKeyup();
            }
            me.on('keydown keyup cut paste blur', function(e) {
                var isOver = me._checkLimit();
                if (e.type === 'keyup' || e.type === 'paste') {
                    if (isOver) {
                        alert('�Է��Ͻ� ���� ���� �ʰ��Ǿ����ϴ�.');
                        this.focus();
                    }
                }
                /**
                 * �ؽ�Ʈ�� ������� �� �߻�
                 * @event coma.ui.TextControl#textcontrolchange
                 * @type {Object}
                 * @property {index} length �ؽ�Ʈ ����
                 */
                me.trigger('textcontrolchange', {length: me.currentLength});
            });
            me._checkLimit();
            me.trigger('textcontrolchange', {length: me.currentLength});

            me._initTextControl();
            me.trigger('textcontrolinit');
        },

        /**
         * �ʱ�ȭ �۾�
         * @private
         */
        _initTextControl: function () {
            var me = this,
                o = me.options;

            // �ٿ��ֱ�
            if (!o.allowPaste) {
                me.on('paste', function (e) {
                    e.preventDefault();
                    alert("�˼��մϴ�. \n����� ���� �����ϱ� ���� �ٿ��ֱ⸦ �Ͻ� �� �����ϴ�.");
                });
            }

            // �ڵ� ������¡
            if (me.$el.is('textarea') && o.autoResize) {
                me._autoResize();
            }

            // �Է±��� �� üũ
            if (o.checkCount) {
                // subviews���� �����ϸ� release�� ȣ��� ��, subviews�� ����ִ� ��Ʈ�ѵ��� release�� �˾Ƽ� ȣ�����ش�.
                me.on('textcontrolchange', (function() {
                    var $countTarget = $(me.options.countTarget),
                        strUtil = core.string,
                        numUtil = core.number,
                        showCount = function(len, limit){
                            $countTarget.html(strUtil.format(me.options.countText, {len: numUtil.addComma(len) || 0, limit:numUtil.addComma(limit) || 0}));
                        };

                    showCount(me.currentLength, o.limit);
                    return function(e, data) {
                        //if(!me._getValue()){return;}
                        showCount(me.currentLength, o.limit);
                    };
                }()));
            }
        },


        /**
         * str�� ���� ���(options.countType�� char�� ��, ���ڼ�, byte�϶� ����Ʈ���� ���)
         */
        textLength: function(str) {
            var me = this;

            if(me.options.countType === 'byte') {
                return byteLength(str);
            }
            return (str||'').length;
        },

        _getValue: ('placeholder' in core.tmpInput) ? function () {
            return this.$el.val();
        } : function () {
            var val = this.$el.val();
            if (val === this.placeholder) { val = ''; }
            return val;
        },


        /**
         */
        _checkLimit: function() {
            var me = this,
                o = me.options,
                val = me._getValue(),
                isOver = false;

            me.currentLength = me.textLength(val);
            if (me.currentLength > o.limit) {
                me._truncateValue();
                isOver = true;
            }
            return isOver;
        },

        /**
         * �ؽ�Ʈ�ڽ��� ���ڿ��� ���ѱ��̸� �ʰ����� ���, �ڸ��� ������ ���
         * @private
         */
        _truncateValue: function() {
            var me = this,
                $el = me.$el,
                value = me._getValue(),
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
         * ���̾��������� �ѱ��� �Է��� ���, keyup�̺�Ʈ�� �߻����� �ʴ� ���װ� �־,
         * timeout�� �̿��Ͽ� value���� ������� �� ������ keyup�� �̺�Ʈ �����ִ� ������ �����ϴ� �Լ�
         * @private
         */
        _forceKeyup: function() {
            // ���̾��������� �ѱ��� �Է��� �� keyup�̺�Ʈ�� �߻����� �ʴ� ���װ� �־
            // Ÿ�̸ӷ� value���� ����Ȱ� üũ�ؼ� ������ keyup �̺�Ʈ�� �߻����� �־�� �Ѵ�.
            var me = this,
                $el = me.$el,
                el = $el[0],
                prevValue,
                win = window,
                doc = document,

            // keyup �̺�Ʈ �߻��Լ�: ũ�ν�����¡ ó��
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
         * �ؽ�Ʈ�ڽ��� ������¡�� ���� �̺�Ʈ ���ε�
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
         * �ؽ�Ʈ�ڽ��� scrollHeight�� ���� height�� �÷��ִ� ������ ���
         * @private
         */
        _layout: function(me, $el, $clone, initialHeight, offset) {
            var me = this,
                current = me._getValue(),
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
            /**
             * �ؽ�Ʈ�ڽ��� ����� ����� �� �߻�.
             * @event coma.ui.TextControl#textcontrolresize
             */
            me.triggerHandler('textcontrolresize');
        },

        /**
         * �ı��� : �ڵ����� ȣ����� �����Ƿ�, ���� ȣ�����־�� �Ѵ�.
         */
        release: function () {
            var me = this;

            me.timer && clearInterval(me.timer);
            me.$el.off(me._eventNamespace);
            me.$el.css({overflow: '', height: ''});
            me.supr();
        }
    });


    TextControl.prototype.defaults.countText = '<span class="fc_dgray">{len}</span> / {limit}';

    if (typeof define === "function" && define.amd) {
        define([], function() {
            return TextControl;
        });
    }

})(jQuery, window[LIB_NAME]);