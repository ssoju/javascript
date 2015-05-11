/**
 * Created by comahead on 2013-05-05.
 */
(function ($, core, undefined) {
    "use strict";


    var Selection = {
        xxget: function (el) {
            if (el.selectionStart) {
                return {
                    begin: el.selectionStart,
                    end: el.selectionEnd
                };
            }

            // for ie
            var range = document.selection.createRange();
            if (range && range.parentElement() === el) {
                var inputRange = el.createTextRange(),
                    endRange = el.createTextRange(),
                    length = el.value.length;

                // Create a working TextRange for the input selection
                inputRange.moveToBookmark(range.getBookmark());

                // Move endRange begin pos to end pos (hence endRange)
                endRange.collapse(false);

                // If we are at the very end of the input, begin and end
                // must both be the length of the el.value
                if (inputRange.compareEndPoints('StartToEnd', endRange) > -1) {
                    return {begin: length, end: length};
                }

                // Note: moveStart usually returns the units moved, which
                // one may think is -length, however, it will stop when it
                // gets to the begin of the range, thus giving us the
                // negative value of the pos.
                return {
                    begin: -inputRange.moveStart('character', -length),
                    end: -inputRange.moveEnd('character', -length)
                };
            }
            return {begin: 0, end: 0};
        },

        xget: function (el) {
            var start = 0, end = 0, normalizedValue, range,
                textInputRange, len, endRange;

            if (typeof el.selectionStart == "number" && typeof el.selectionEnd == "number") {
                start = el.selectionStart;
                end = el.selectionEnd;
            } else {
                range = document.selection.createRange();

                if (range && range.parentElement() == el) {
                    len = el.value.length;
                    normalizedValue = el.value.replace(/\r\n/g, "\n");

                    // Create a working TextRange that lives only in the input
                    textInputRange = el.createTextRange();
                    textInputRange.moveToBookmark(range.getBookmark());

                    // Check if the start and end of the selection are at the very end
                    // of the input, since moveStart/moveEnd doesn't return what we want
                    // in those cases
                    endRange = el.createTextRange();
                    endRange.collapse(false);

                    if (textInputRange.compareEndPoints("StartToEnd", endRange) > -1) {
                        start = end = len;
                    } else {
                        start = -textInputRange.moveStart("character", -len);
                        start += normalizedValue.slice(0, start).split("\n").length - 1;

                        if (textInputRange.compareEndPoints("EndToEnd", endRange) > -1) {
                            end = len;
                        } else {
                            end = -textInputRange.moveEnd("character", -len);
                            end += normalizedValue.slice(0, end).split("\n").length - 1;
                        }
                    }
                }
            }

            return {
                start: start,
                end: end
            };
        },

        get: function (el) {
            var s = {start: 0, end: 0};
            if (typeof el.selectionStart == "number"
                && typeof el.selectionEnd == "number") {
                // Firefox (and others)
                s.start = el.selectionStart;
                s.end = el.selectionEnd;
            } else if (document.selection) {
                // IE
                var bookmark = document.selection.createRange().getBookmark();
                var sel = el.createTextRange();
                var bfr = sel.duplicate();
                sel.moveToBookmark(bookmark);
                bfr.setEndPoint("EndToStart", sel);
                s.start = bfr.text.length;
                s.end = s.start + sel.text.length;
            }
            return s;
        },

        set: function (el, pos) {
            // Normalize pos
            if (typeof pos !== 'object') {
                pos = {begin: pos, end: pos};
            }

            // If normal browser
            if (el.setSelectionRange) {
                el.focus();
                el.setSelectionRange(pos.begin, pos.end);

                // IE = TextRange fun
            } else if (el.createTextRange) {
                var range = el.createTextRange();
                range.collapse(true);
                range.moveEnd('character', pos.end);
                range.moveStart('character', pos.begin);
                range.select();
            }
        }
    };
    var ua = navigator.userAgent,
        iPhone = /iphone/i.test(ua),
        chrome = /chrome/i.test(ua),
        android = /android/i.test(ua),
        caretTimeoutId;

    $.mask = {
        //Predefined character definitions
        definitions: {
            '9': "[0-9]",
            'a': "[A-Za-z]",
            '*': "[A-Za-z0-9]"
        },
        autoclear: true,
        dataName: "rawMaskFn",
        placeholder: '_'
    };

    $.fn.extend({
        //Helper Function for Caret positioning
        caret: function (begin, end) {
            var range;

            if (this.length === 0 || this.is(":hidden")) {
                return;
            }

            if (typeof begin == 'number') {
                end = (typeof end === 'number') ? end : begin;
                return this.each(function () {
                    if (this.setSelectionRange) {
                        this.setSelectionRange(begin, end);
                    } else if (this.createTextRange) {
                        range = this.createTextRange();
                        range.collapse(true);
                        range.moveEnd('character', end);
                        range.moveStart('character', begin);
                        range.select();
                    }
                });
            } else {
                if (this[0].setSelectionRange) {
                    begin = this[0].selectionStart;
                    end = this[0].selectionEnd;
                } else if (document.selection && document.selection.createRange) {
                    range = document.selection.createRange();
                    begin = 0 - range.duplicate().moveStart('character', -100000);
                    end = begin + range.text.length;
                }
                return {
                    begin: begin,
                    end: end
                };
            }
        },
        unmask: function () {
            return this.trigger("unmask");
        }
    });

//    $('.money').mask('#.##0,00', {reverse: true});

    var FormatInput = core.ui('FormatInput', {
        bindjQuery: 'formatInput',
        defaults: {
            placeholder: ' '
        },
        initialize: function (el, options) {
            var me = this;
            if (me.supr(el, options) === false) {
                return;
            }

            var mask = me.options.mask,
                input,
                defs,
                tests,
                partialPosition,
                firstNonMaskPos,
                lastRequiredNonMaskPos,
                len,
                oldVal,
                settings = me.options;


            defs = $.mask.definitions;
            tests = [];
            partialPosition = len = mask.length;
            firstNonMaskPos = null;

            $.each(mask.split(""), function (i, c) {
                if (c == '?') {
                    len--;
                    partialPosition = i;
                } else if (defs[c]) {
                    tests.push(new RegExp(defs[c]));
                    if (firstNonMaskPos === null) {
                        firstNonMaskPos = tests.length - 1;
                    }
                    if (i < partialPosition) {
                        lastRequiredNonMaskPos = tests.length - 1;
                    }
                } else {
                    tests.push(null);
                }
            });

            (function () {
                var input = $(this),
                    buffer = $.map(
                        mask.split(""),

                        function (c, i) {
                            if (c != '?') {
                                return defs[c] ? getPlaceholder(i) : c;
                            }
                        }),
                    defaultBuffer = buffer.join(''),
                    focusText = input.val();

                function tryFireCompleted() {
                    if (!settings.completed) {
                        return;
                    }

                    for (var i = firstNonMaskPos; i <= lastRequiredNonMaskPos; i++) {
                        if (tests[i] && buffer[i] === getPlaceholder(i)) {
                            return;
                        }
                    }
                    settings.completed.call(input);
                }

                function getPlaceholder(i) {
                    if (i < settings.placeholder.length) return settings.placeholder.charAt(i);
                    return settings.placeholder.charAt(0);
                }

                function seekNext(pos) {
                    while (++pos < len && !tests[pos]);
                    return pos;
                }

                function seekPrev(pos) {
                    while (--pos >= 0 && !tests[pos]);
                    return pos;
                }

                function shiftL(begin, end) {
                    var i,
                        j;

                    if (begin < 0) {
                        return;
                    }

                    for (i = begin, j = seekNext(end); i < len; i++) {
                        if (tests[i]) {
                            if (j < len && tests[i].test(buffer[j])) {
                                buffer[i] = buffer[j];
                                buffer[j] = getPlaceholder(j);
                            } else {
                                break;
                            }

                            j = seekNext(j);
                        }
                    }
                    writeBuffer();
                    input.caret(Math.max(firstNonMaskPos, begin));
                }

                function shiftR(pos) {
                    var i,
                        c,
                        j,
                        t;

                    for (i = pos, c = getPlaceholder(pos); i < len; i++) {
                        if (tests[i]) {
                            j = seekNext(i);
                            t = buffer[i];
                            buffer[i] = c;
                            if (j < len && tests[j].test(t)) {
                                c = t;
                            } else {
                                break;
                            }
                        }
                    }
                }

                function androidInputEvent(e) {
                    var curVal = input.val();
                    var pos = input.caret();
                    if (oldVal && oldVal.length && oldVal.length > curVal.length) {
                        // a deletion or backspace happened
                        checkVal(true);
                        while (pos.begin > 0 && !tests[pos.begin - 1])
                            pos.begin--;
                        if (pos.begin === 0) {
                            while (pos.begin < firstNonMaskPos && !tests[pos.begin])
                                pos.begin++;
                        }
                        input.caret(pos.begin, pos.begin);
                    } else {
                        var pos2 = checkVal(true);
                        while (pos.begin < len && !tests[pos.begin])
                            pos.begin++;

                        input.caret(pos.begin, pos.begin);
                    }

                    tryFireCompleted();
                }

                function blurEvent(e) {
                    checkVal();

                    if (input.val() != focusText) input.change();
                }

                function keydownEvent(e) {
                    if (input.prop("readonly")) {
                        return;
                    }

                    var k = e.which || e.keyCode,
                        pos,
                        begin,
                        end;
                    oldVal = input.val();
                    //backspace, delete, and escape get special treatment
                    if (k === 8 || k === 46 || (iPhone && k === 127)) {
                        pos = input.caret();
                        begin = pos.begin;
                        end = pos.end;

                        if (end - begin === 0) {
                            begin = k !== 46 ? seekPrev(begin) : (end = seekNext(begin - 1));
                            end = k === 46 ? seekNext(end) : end;
                        }
                        clearBuffer(begin, end);
                        shiftL(begin, end - 1);

                        e.preventDefault();
                    } else if (k === 13) { // enter
                        blurEvent.call(this, e);
                    } else if (k === 27) { // escape
                        input.val(focusText);
                        input.caret(0, checkVal());
                        e.preventDefault();
                    }
                }

                function keypressEvent(e) {
                    if (input.prop("readonly")) {
                        return;
                    }

                    var k = e.which || e.keyCode,
                        pos = input.caret(),
                        p,
                        c,
                        next;

                    if (e.ctrlKey || e.altKey || e.metaKey || k < 32) { //Ignore
                        return;
                    } else if (k && k !== 13) {
                        if (pos.end - pos.begin !== 0) {
                            clearBuffer(pos.begin, pos.end);
                            shiftL(pos.begin, pos.end - 1);
                        }

                        p = seekNext(pos.begin - 1);
                        if (p < len) {
                            c = String.fromCharCode(k);
                            if (tests[p].test(c)) {
                                shiftR(p);

                                buffer[p] = c;
                                writeBuffer();
                                next = seekNext(p);

                                if (android) {
                                    //Path for CSP Violation on FireFox OS 1.1
                                    var proxy = function () {
                                        $.proxy($.fn.caret, input, next)();
                                    };

                                    setTimeout(proxy, 0);
                                } else {
                                    input.caret(next);
                                }
                                if (pos.begin <= lastRequiredNonMaskPos) {
                                    tryFireCompleted();
                                }
                            }
                        }
                        e.preventDefault();
                    }
                }

                function clearBuffer(start, end) {
                    var i;
                    for (i = start; i < end && i < len; i++) {
                        if (tests[i]) {
                            buffer[i] = getPlaceholder(i);
                        }
                    }
                }

                function writeBuffer() {
                    input.val(buffer.join(''));
                }

                function checkVal(allow) {
                    //try to place characters where they belong
                    var test = input.val(),
                        lastMatch = -1,
                        i,
                        c,
                        pos;

                    for (i = 0, pos = 0; i < len; i++) {
                        if (tests[i]) {
                            buffer[i] = getPlaceholder(i);
                            while (pos++ < test.length) {
                                c = test.charAt(pos - 1);
                                if (tests[i].test(c)) {
                                    buffer[i] = c;
                                    lastMatch = i;
                                    break;
                                }
                            }
                            if (pos > test.length) {
                                clearBuffer(i + 1, len);
                                break;
                            }
                        } else {
                            if (buffer[i] === test.charAt(pos)) {
                                pos++;
                            }
                            if (i < partialPosition) {
                                lastMatch = i;
                            }
                        }
                    }
                    if (allow) {
                        writeBuffer();
                    } else if (lastMatch + 1 < partialPosition) {
                        if (settings.autoclear || buffer.join('') === defaultBuffer) {
                            // Invalid value. Remove it and replace it with the
                            // mask, which is the default behavior.
                            if (input.val()) input.val("");
                            clearBuffer(0, len);
                        } else {
                            // Invalid value, but we opt to show the value to the
                            // user and allow them to correct their mistake.
                            writeBuffer();
                        }
                    } else {
                        writeBuffer();
                        input.val(input.val().substring(0, lastMatch + 1));
                    }
                    return (partialPosition ? i : firstNonMaskPos);
                }

                input.data($.mask.dataName, function () {
                    return $.map(buffer, function (c, i) {
                        return tests[i] && c != getPlaceholder(i) ? c : null;
                    }).join('');
                });


                input.one("unmask", function () {
                    input.off(".mask")
                        .removeData($.mask.dataName);
                })
                    .on("focus.mask", function () {
                        if (input.prop("readonly")) {
                            return;
                        }

                        clearTimeout(caretTimeoutId);
                        var pos;

                        focusText = input.val();

                        pos = checkVal();

                        caretTimeoutId = setTimeout(function () {
                            if (input.get(0) !== document.activeElement) {
                                return;
                            }
                            writeBuffer();
                            if (pos == mask.replace("?", "").length) {
                                input.caret(0, pos);
                            } else {
                                input.caret(pos);
                            }
                        }, 10);
                    })
                    .on("blur.mask", blurEvent)
                    .on("keydown.mask", keydownEvent)
                    .on("keypress.mask", keypressEvent)
                    .on("input.mask paste.mask", function () {
                        if (input.prop("readonly")) {
                            return;
                        }

                        setTimeout(function () {
                            var pos = checkVal(true);
                            input.caret(pos);
                            tryFireCompleted();
                        }, 0);
                    });
                if (chrome && android) {
                    input.off('input.mask')
                        .on('input.mask', androidInputEvent);
                }
                checkVal(); //Perform initial check for existing values
            }).apply(me.$el);
        }
    });

})(jQuery, window[LIB_NAME]);

