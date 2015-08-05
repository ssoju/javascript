/**
 * Created by �����(comahead@vi-nyl.com) on 2015-05-04.
 * Benchmark
 * github: https://github.com/firstopinion/formatter.js
 * License: The MIT License (MIT) Copyright (c) 2013 First Opinion
 */
(function ($, core) {
    "use strict";

    // {{9999}}-{{9999}}-{{9999}}
    // comma
    // tel
    // mobile
    // email

    // ĳ�� ���
    var inputSel = {
        // ĳ�� ��ġ ��ȯ
        get: function(el) {
            if(core.is(el.selectionStart, 'number')) {
                return {
                    begin: el.selectionStart,
                    end: el.selectionEnd
                };
            }

            var range = document.selection.createRange();
            if(range && range.parentElement() === el) {
                var inputRange = el.createTextRange(), endRange = el.createTextRange(), length = el.value.length;
                inputRange.moveToBookmark(range.getBookmark());
                endRange.collapse(false);

                if(inputRange.compareEndPoints('StartToEnd', endRange) > -1) {
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
        // ĳ�� ��ġ ����
        set: function(el, pos) {
            if(!core.is(pos, 'object')) {
                pos = {
                    begin: pos,
                    end: pos
                };
            }

            if(el.setSelectionRange) {
                //el.focus();
                el.setSelectionRange(pos.begin, pos.end);
            } else if(el.createTextRange) {
                var range = el.createTextRange();
                range.collapse(true);
                range.moveEnd('character', pos.end);
                range.moveStart('character', pos.begin);
                range.select();
            }
        }
    };

    // placeholder ��������
    var supportPlaceholder = ('placeholder' in document.createElement('input'));

    var FormatInput = core.ui('FormatInput', /** @lends coma.ui.Formatter# */{
        $statics: {
            // ����� ���Ű
            byPassKeys: [8, 9, 16, 17, 18, 35, 36, 37, 38, 39, 40, 46, 91, 116],
            // �� �ڵ忡 ���� ���Խ�
            translation: {
                '0': {pattern: /\d/},
                '9': {pattern: /\d/, optional: true},
                '#': {pattern: /\d/, recursive: true},
                'A': {pattern: /[a-zA-Z0-9]/},
                'S': {pattern: /[a-zA-Z]/}
            },
            // ����ŷ Ÿ��
            masks: {
                // ����
                comma: {format: '000,000,000,000,000,000,000,000,000', reverse: true},
                // ��ȭ��ȣ
                tel: {
                    format: function(val, e, field, options) {
                        return val.replace(/\D/g, '').length < 8 ? '000-0000' : '0000-0000'
                    }
                },
                // �ڵ��� ��ȣ
                mobile: {
                    format: function(val, e, field, options) {
                        return val.replace(/\D/g, '').length < 8 ? '000-0000' : '0000-0000'
                    }
                },
                // ����
                num: {format: '0000000000000000000'},
                // ī��
                card: {format: '0000-0000-0000-0000'},
                // �Ƹ߽�ī��
                amexcard: {format: '0000-000000-00000'},
                // ���������ȣ
                driverno: {format: '00-000000-00'},
                // ����ڹ�ȣ
                bizno: {format:'000-00-00000'},
                // ���ι�ȣ
                corpno: {format:'000000-0000000'},
                // ��¥
                date: {format:'0000.00.00'},
                // ����
                eng: {format: 'S'}
            }
        },
        bindjQuery: 'formatter',
        defaults: {
            format: 'comma', // �⺻ ����
            watch: true,    // ������ �����Ұǰ�
            watchInterval: 300 // ���� ���͹�
        },
        /**
         * ������
         * @param el
         * @param options
         * @returns {boolean}
         */
        initialize: function(el, options) {
            var me = this;

            if(me.supr(el, options) === false) { return false; }

            // �ڵ��ϼ� ��
            me.$el.attr('autocomplete', 'off');
            // ���� �� ���� �ܼ��� ������ �� Ű�� ���� ����������
            if(me._isSimpleFormat() === true) {
                return;
            }

            // �̺�Ʈ ���ε�
            me._bindEvents();

            me.oldValue = me.$el.trimVal(); // ���� ��
            me.byPassKeys = FormatInput.byPassKeys; // alias
            me.translation = core.extend({}, FormatInput.translation, me.options.translation);  // alias
            me.invalid = [];
            if(!supportPlaceholder) {
                // placeholder�� �������� �ʴ� �������� placeholder ������ �����ϰ� �ִ´�.
                me.notSupportPlaceholder = true;
                me.txtPlaceholder = me.$el.attr('placeholder');
            }

            me._reloadMask();
            var caret = inputSel.get(me.el).begin; // ĳ�� ��ġ�� ����
            me.update();
            if(me.$el.is(':focus')) {
                inputSel.set(me.el, caret + me._getMCharsBeforeCount(caret, true));
            }
            // ����ŷ�� ���� ��ü ���Խ��� �����´�
            me.regexMask = me._getRegexMask();
            // ���� ����ƴ��� ����
            if(me.options.watch) {
                me._watchStart();
            }
        },

        /**
         * ����ŷó���� ���� ��ǲ�� �־��ش�
         */
        update: supportPlaceholder ? function() {
            var me = this;
            me.$el.val(this._getMasked());
        } : function(){
            var me = this;
            if(me.el.value !== me.txtPlaceholder) {
                me.$el.val(this._getMasked());
            }
        },

        /**
         * ����ŷ �ɼ��� ������� ���� �ֱ� ������ �ٽ� ����ȭ �Ѵ�.
         * @private
         */
        _reloadMask: function() {
            var me = this,
                m, mask;

            if(m = FormatInput.masks[me.options.format]) {
                if(core.is(m.format, 'function')) {
                    me.mask = m.format.call(me, me.$el.trimVal());
                } else {
                    me.mask = m.format;
                }
                me.options.reverse = !!m.reverse;
            } else {
                me.mask = core.is(me.options.format, 'function') ? me.options.format.call(me) : me.options.format;
            }
        },

        /**
         * ����, ������ �� �Է��ϴ°Ÿ� ����ŷ ó���� ���� �ʰ� Ű���常 ���´�.
         * @returns {boolean}
         * @private
         */
        _isSimpleFormat: function(){
            var me = this;
            var old;

            if(me.options.format === 'eng') {
                // ������
                me.$el.on('keydown', function(e) {
                    if(!e.ctrlKey && !e.shiftKey && !e.altKey
                        && !(e.keyCode === 16 // enter
                        || (e.keyCode >= 65 && e.keyCode <=90)
                        || (e.keyCode >= 97 && e.keyCode <=122)
                        || core.array.include(FormatInput.byPassKeys, e.keyCode))) {
                        e.preventDefault();
                    }
                    old = this.value;
                }).on('keyup blur paste', function() {
                    if(old != this.value) {
                        var caret = inputSel.get(this);
                        me.$el.val(this.value.replace(/[^a-zA-Z\s]/g, ''));
                        inputSel.set(this, Math.min(caret.begin, this.value.length));
                    }
                });
                return true; // �ٸ��� ó�����ϵ��� true ��ȯ
            } else if (me.options.format === 'alnum') {
                me.$el.on('keydown', function(e) {
                    if(!e.ctrlKey && !e.shiftKey && !e.altKey
                        && !((e.keyCode >= 65 && e.keyCode <=90)
                        || (e.keyCode >= 97 && e.keyCode <=122)
                        || (e.keyCode >= 48 && e.keyCode <= 57)
                        || core.array.include(FormatInput.byPassKeys, e.keyCode))) {
                        e.preventDefault();
                    }
                    old = this.value;
                }).on('keyup blur paste', function() {
                    if(old != this.value) {
                        var caret = inputSel.get(this);
                        me.$el.val(this.value.replace(/[^a-zA-Z0-9\s]/g, ''));
                        inputSel.set(this, Math.min(caret.begin, this.value.length));
                    }
                });
                return true; // �ٸ��� ó�����ϵ��� true ��ȯ
            } else if(core.array.include(['num', 'card', 'amexcard',
                    'tel', 'mobile', 'bizno', 'corpno', 'comma', 'date'], me.options.format)) {
                if (window.IS_DEBUG && core.browser.isMobile) {
                    me.$el.attr('type', 'tel');
                }
                // ����
                me.$el.on('keydown', function(e) {
                    if (!e.ctrlKey && !e.shiftKey && !e.altKey
                        && !((e.keyCode >= 48 && e.keyCode <= 57)
                        || (e.keyCode >= 96 && e.keyCode <= 105)
                        || core.array.include(FormatInput.byPassKeys, e.keyCode))) {
                        e.preventDefault();
                    }

                    if(me.options.format === 'num') {
                        return true; // �ٸ��� ó�����ϵ��� true ��ȯ
                    }
                });
            }
        },

        /**
         * �̺�Ʈ ���ε�
         * @private
         */
        _bindEvents: function() {
            var me = this;

            me.$el
                .on('keyup', function(e) {
                    me._reloadMask();
                    me._process(e);
                })
                .on('paste drop', function() {
                    setTimeout(function() {
                        me.$el.keydown().keyup();
                    });
                })
                .on('change', function() {
                    me.$el.data('changed', true);
                })
                .on('blur', function(e) {
                    if(me.oldValue != me.$el.trimVal() && !me.$el.data('changed')) {
                        me.$el.triggerHandler('change');
                    }
                    me.$el.data('change', false);
                    me._watchStart();
                })
                .on('keydown blur', function() {
                    me.oldValue = me.$el.trimVal();
                })
                .on('focusin', function() {
                    // ��Ŀ�̵� �� ����Ʈ��ų ���ΰ�..
                    if(me.options.selectOnFocus === true) {
                        $(e.target).select();
                    }
                    me._watchStop();
                })
                .on('focusout', function() {
                    // ��Ŀ���� ���� �� �ȸ´� ���� ������ΰ�
                    if(me.options.clearIfNotMatch && !me.regexMask.test(me.$el.trimVal())) {
                        me.$el.val('');
                    }
                });

            // comma ������ �� ,�� ���ŵ� ���·� �Ѿ��
            me.options.format === 'comma' && $(me.el.form).on('submit', function(e) {
                me.remove();
                me.oldValue = '';
            });
        },

        /**
         * ���� ����ƴ��� ���� ����
         * @private
         */
        _watchStart: function(){
            var me = this;
            me._watchStop();

            if(!me.options.watch || me.$el.prop('readonly') || me.$el.prop('disabled')) { return; }

            var totalTime = 0, dur = me.options.watchInterval;
            me.watchTimer = setInterval(function() {
                // 40�ʿ� �ѹ��� dom���� ���� �ư��� üũ�ؼ� Ÿ�̸Ӹ� �����.
                if (totalTime > 40000){
                    totalTime = 0;
                    if (!$.contains(document, me.$el[0])) {
                        clearInterval(me.watchTimer);
                        me.watchTimer = null;
                        return;
                    }
                } else {
                    totalTime += dur;
                }

                if (!me.$el) { me._watchStop(); return; }
                if (me.$el[0].disabled || me.$el[0].className.indexOf('disabled')) { return; }
                var val = me.el.value;
                if(me.oldValue != val){
                    me.update();
                }
            }, dur);
        },

        /**
         * �� ���� ���� ����
         * @private
         */
        _watchStop: function() {
            var me = this;
            clearInterval(me.watchTimer);
            me.watchTimer = null;
        },

        /**
         * ����ŷ�� ���� ���Խ� ��ȯ
         * @returns {RegExp}
         * @private
         */
        _getRegexMask: function() {
            var me = this,
                maskChunks = [],
                translation, pattern, optional, recursive, oRecursive, r, ch;

            for(var i = 0, len = me.mask.length; i < len; i++) {
                ch = me.mask.charAt(i);
                if(translation = me.translation[ch]){
                    pattern = translation.pattern.toString().replace(/.{1}$|^.{1}/g, '');
                    optional = translation.optional;
                    if(recursive = translation.recursive){
                        maskChunks.push(ch);
                        oRecursive = {digit: ch, pattern: pattern};
                    } else {
                        maskChunks.push(!optional ? pattern : (pattern + '?'));
                    }
                } else {
                    maskChunks.push(ch.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
                }
            }

            r = maskChunks.join('');
            // ������ ������ ���� ��
            if(oRecursive) {
                r = r.replace(new RegExp('(' + oRecursive.digit + '(.*' + oRecursive.digit + ')?)'), '($1)?')
                    .replace(new RegExp(oRecursive.digit, 'g'), oRecursive.pattern);
            }

            return new RegExp(r);
        },
        /**
         * index��ġ�� ����ŷó���� ���ڼ�
         * @param index
         * @param onCleanVal
         * @returns {number}
         * @private
         */
        _getMCharsBeforeCount: function(index, onCleanVal) {
            var me = this, mask = me.mask;
            for (var count = 0, i = 0, maskL = mask.length; i < maskL && i < index; i++) {
                if (!me.translation[mask.charAt(i)]) {
                    index = onCleanVal ? index + 1 : index;
                    count++;
                }
            }
            return count;
        },
        /**
         * ĳ�� ��ġ
         * @param originalCaretPos
         * @param oldLength
         * @param newLength
         * @param maskDif
         * @returns {*}
         * @private
         */
        _caretPos: function (originalCaretPos, oldLength, newLength, maskDif) {
            var me = this,
                mask = me.mask,
                translation = me.translation[mask.charAt(Math.min(originalCaretPos - 1, mask.length - 1))];

            return !translation ? me._caretPos(originalCaretPos + 1, oldLength, newLength, maskDif)
                : Math.min(originalCaretPos + newLength - oldLength - maskDif, newLength);
        },
        /**
         * ����ŷó��
         * @param e
         * @returns {*}
         * @private
         */
        _process: function(e) {
            var me = this,
                keyCode = e.keyCode;
            // TODO
            if (keyCode === 17 || (keyCode === 65 && e.ctrlKey)) { return; }

            me.invalid = [];
            if ($.inArray(keyCode, me.byPassKeys) === -1 || keyCode === 46 || keyCode === 8) {
                var caretPos = inputSel.get(me.el).begin,
                    currVal = me.$el.trimVal(),
                    currValL = currVal.length,
                    changeCaret = caretPos < currValL,
                    newVal = me._getMasked(),
                    newValL = newVal.length,
                    maskDif = me._getMCharsBeforeCount(newValL - 1) - me._getMCharsBeforeCount(currValL - 1);

                me.$el.val(newVal);

                // change caret but avoid CTRL+A
                if (changeCaret && !(keyCode === 65 && e.ctrlKey)) {
                    // Avoid adjusting caret on backspace or delete
                    if (!(keyCode === 8 || keyCode === 46)) {
                        caretPos = me._caretPos(caretPos, currValL, newValL, maskDif);
                    }
                    if(me.$el.is(':focus')) {
                        inputSel.set(me.el, caretPos);
                    }
                }

                return me._callbacks(e);
            }
        },
        /**
         * ����ŷó�� �ھ�κ�
         * @param skipMaskChars
         * @returns {string}
         * @private
         */
        _getMasked: function(skipMaskChars) {
            var me = this,
                mask = me.mask,
                buf = [],
                value = me.$el.trimVal(),
                m = 0, maskLen = mask.length,
                v = 0, valLen = value.length,
                offset = 1, addMethod = 'push',
                resetPos = -1,
                lastMaskChar,
                check;

            if (me.options.reverse) {
                addMethod = 'unshift';
                offset = -1;
                lastMaskChar = 0;
                m = maskLen - 1;
                v = valLen - 1;
                check = function () {
                    return m > -1 && v > -1;
                };
            } else {
                lastMaskChar = maskLen - 1;
                check = function () {
                    return m < maskLen && v < valLen;
                };
            }

            while (check()) {
                var maskDigit = mask.charAt(m),
                    valDigit = value.charAt(v),
                    translation = me.translation[maskDigit];

                if (translation) {
                    if (valDigit.match(translation.pattern)) {
                        buf[addMethod](valDigit);
                        if (translation.recursive) {
                            if (resetPos === -1) {
                                resetPos = m;
                            } else if (m === lastMaskChar) {
                                m = resetPos - offset;
                            }

                            if (lastMaskChar === resetPos) {
                                m -= offset;
                            }
                        }
                        m += offset;
                    } else if (translation.optional) {
                        m += offset;
                        v -= offset;
                    } else if (translation.fallback) {
                        buf[addMethod](translation.fallback);
                        m += offset;
                        v -= offset;
                    } else {
                        me.invalid.push({p: v, v: valDigit, e: translation.pattern});
                    }
                    v += offset;
                } else {
                    if (!skipMaskChars) {
                        buf[addMethod](maskDigit);
                    }

                    if (valDigit === maskDigit) {
                        v += offset;
                    }

                    m += offset;
                }
            }

            var lastMaskCharDigit = mask.charAt(lastMaskChar);
            if (maskLen === valLen + 1 && !me.translation[lastMaskCharDigit]) {
                buf.push(lastMaskCharDigit);
            }

            return buf.join('');
        },
        /**
         * �ݹ��Լ� ���ε�
         * @param e
         * @private
         */
        _callbacks: function (e) {
            var me = this,
                mask = me.mask,
                val = me.$el.trimVal(),
                changed = val !== me.oldValue,
                defaultArgs = [val, e, me.el, me.options],
                callback = function(name, criteria, args) {
                    if (typeof me.options[name] === 'function' && criteria) {
                        me.options[name].apply(this, args);
                    }
                };

            callback('onChange', changed === true, defaultArgs);
            callback('onKeyPress', changed === true, defaultArgs);
            callback('onComplete', val.length === mask.length, defaultArgs);
            callback('onInvalid', me.invalid.length > 0, [val, e, me.el, me.invalid, me.options]);
        },
        /**
         * �����
         */
        remove: function() {
            var me = this,
                caret = inputSel.get(me.el).begin;
            me._watchStop();
            me.$el.off();
            me.$el.val(me.clean());
            if(me.$el.is(':focus')) {
                inputSel.set(me.el, caret - me._getMCharsBeforeCount(caret));
            }
        },
        /**
         * ����ŷ ����
         * @returns {*|string}
         */
        clean: function() {
            return this._getMasked(true);
        }
    });

    if (typeof define === "function" && define.amd) {
        define([], function() {
            return FormatInput;
        });
    }

})(jQuery, window[LIB_NAME]);
 