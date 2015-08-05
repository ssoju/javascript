/**
 * Created by 김승일(comahead@vi-nyl.com) on 2015-05-04.
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

    // 캐얼 모듈
    var inputSel = {
        // 캐럿 위치 반환
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
        // 캐럿 위치 설정
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

    // placeholder 지원여부
    var supportPlaceholder = ('placeholder' in document.createElement('input'));

    var FormatInput = core.ui('FormatInput', /** @lends coma.ui.Formatter# */{
        $statics: {
            // 허용할 기능키
            byPassKeys: [8, 9, 16, 17, 18, 35, 36, 37, 38, 39, 40, 46, 91, 116],
            // 각 코드에 대한 정규식
            translation: {
                '0': {pattern: /\d/},
                '9': {pattern: /\d/, optional: true},
                '#': {pattern: /\d/, recursive: true},
                'A': {pattern: /[a-zA-Z0-9]/},
                'S': {pattern: /[a-zA-Z]/}
            },
            // 마스킹 타입
            masks: {
                // 현금
                comma: {format: '000,000,000,000,000,000,000,000,000', reverse: true},
                // 전화번호
                tel: {
                    format: function(val, e, field, options) {
                        return val.replace(/\D/g, '').length < 8 ? '000-0000' : '0000-0000'
                    }
                },
                // 핸드폰 번호
                mobile: {
                    format: function(val, e, field, options) {
                        return val.replace(/\D/g, '').length < 8 ? '000-0000' : '0000-0000'
                    }
                },
                // 숫자
                num: {format: '0000000000000000000'},
                // 카드
                card: {format: '0000-0000-0000-0000'},
                // 아멕스카드
                amexcard: {format: '0000-000000-00000'},
                // 운전면허번호
                driverno: {format: '00-000000-00'},
                // 사업자번호
                bizno: {format:'000-00-00000'},
                // 법인번호
                corpno: {format:'000000-0000000'},
                // 날짜
                date: {format:'0000.00.00'},
                // 영문
                eng: {format: 'S'}
            }
        },
        bindjQuery: 'formatter',
        defaults: {
            format: 'comma', // 기본 포맷
            watch: true,    // 수정을 감시할건가
            watchInterval: 300 // 감시 인터벌
        },
        /**
         * 생성자
         * @param el
         * @param options
         * @returns {boolean}
         */
        initialize: function(el, options) {
            var me = this;

            if(me.supr(el, options) === false) { return false; }

            // 자동완성 끜
            me.$el.attr('autocomplete', 'off');
            // 숫자 와 같이 단순한 포맷은 걍 키만 막고 빠져나간다
            if(me._isSimpleFormat() === true) {
                return;
            }

            // 이벤트 바인딩
            me._bindEvents();

            me.oldValue = me.$el.trimVal(); // 원래 값
            me.byPassKeys = FormatInput.byPassKeys; // alias
            me.translation = core.extend({}, FormatInput.translation, me.options.translation);  // alias
            me.invalid = [];
            if(!supportPlaceholder) {
                // placeholder를 지원하지 않는 브라우저면 placeholder 문구를 보관하고 있는다.
                me.notSupportPlaceholder = true;
                me.txtPlaceholder = me.$el.attr('placeholder');
            }

            me._reloadMask();
            var caret = inputSel.get(me.el).begin; // 캐럿 위치를 보관
            me.update();
            if(me.$el.is(':focus')) {
                inputSel.set(me.el, caret + me._getMCharsBeforeCount(caret, true));
            }
            // 마스킹에 대한 전체 정규식을 가져온다
            me.regexMask = me._getRegexMask();
            // 값이 변경됐는지 감시
            if(me.options.watch) {
                me._watchStart();
            }
        },

        /**
         * 마스킹처리된 값을 인풋에 넣어준다
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
         * 마스킹 옵션이 변경됐을 수도 있기 때문에 다시 정규화 한다.
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
         * 숫자, 영문자 만 입력하는거면 마스킹 처리는 하지 않고 키보드만 막는다.
         * @returns {boolean}
         * @private
         */
        _isSimpleFormat: function(){
            var me = this;
            var old;

            if(me.options.format === 'eng') {
                // 영문자
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
                return true; // 다른건 처리안하도록 true 반환
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
                return true; // 다른건 처리안하도록 true 반환
            } else if(core.array.include(['num', 'card', 'amexcard',
                    'tel', 'mobile', 'bizno', 'corpno', 'comma', 'date'], me.options.format)) {
                if (window.IS_DEBUG && core.browser.isMobile) {
                    me.$el.attr('type', 'tel');
                }
                // 숫자
                me.$el.on('keydown', function(e) {
                    if (!e.ctrlKey && !e.shiftKey && !e.altKey
                        && !((e.keyCode >= 48 && e.keyCode <= 57)
                        || (e.keyCode >= 96 && e.keyCode <= 105)
                        || core.array.include(FormatInput.byPassKeys, e.keyCode))) {
                        e.preventDefault();
                    }

                    if(me.options.format === 'num') {
                        return true; // 다른건 처리안하도록 true 반환
                    }
                });
            }
        },

        /**
         * 이벤트 바인딩
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
                    // 포커싱될 때 셀렉트시킬 것인가..
                    if(me.options.selectOnFocus === true) {
                        $(e.target).select();
                    }
                    me._watchStop();
                })
                .on('focusout', function() {
                    // 포커스가 나갈 때 안맞는 값을 지울것인가
                    if(me.options.clearIfNotMatch && !me.regexMask.test(me.$el.trimVal())) {
                        me.$el.val('');
                    }
                });

            // comma 형식일 땐 ,가 제거된 상태로 넘어가게
            me.options.format === 'comma' && $(me.el.form).on('submit', function(e) {
                me.remove();
                me.oldValue = '';
            });
        },

        /**
         * 값이 변경됐는지 감시 시작
         * @private
         */
        _watchStart: function(){
            var me = this;
            me._watchStop();

            if(!me.options.watch || me.$el.prop('readonly') || me.$el.prop('disabled')) { return; }

            var totalTime = 0, dur = me.options.watchInterval;
            me.watchTimer = setInterval(function() {
                // 40초에 한번씩 dom에서 제거 됐건지 체크해서 타이머를 멈춘다.
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
         * 값 변경 감시 중지
         * @private
         */
        _watchStop: function() {
            var me = this;
            clearInterval(me.watchTimer);
            me.watchTimer = null;
        },

        /**
         * 마스킹에 대한 정규식 반환
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
            // 기준을 끝으로 했을 때
            if(oRecursive) {
                r = r.replace(new RegExp('(' + oRecursive.digit + '(.*' + oRecursive.digit + ')?)'), '($1)?')
                    .replace(new RegExp(oRecursive.digit, 'g'), oRecursive.pattern);
            }

            return new RegExp(r);
        },
        /**
         * index위치의 마스킹처리된 문자수
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
         * 캐럿 위치
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
         * 마스킹처리
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
         * 마스킹처리 코어부분
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
         * 콜백함수 바인딩
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
         * 지우기
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
         * 마스킹 제거
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
 