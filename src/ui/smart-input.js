/**
 * Created by comahead on 2013-04-21.
 */
(function ($, core) {
    "use strict";

    var insertChars = function (str, pos, chars) {
        str = str || '';
        return str.substr(0, pos) + chars + str.substr(pos);
    };

    var removeChars = function (str, start, end) {
        str = str || '';
        return str.substr(0, start) + str.substr(end);
    };

    var isBetween = function (val, arr) {
        arr.sort(function (a, b) {
            return a - b;
        });
        return val > arr[0] && val < arr[1];
    };

    var getClipboard = function (e) {
        return (e.clipboardData || window.clipboardData).getData('Text');
    };

    var SHIFT = 0, ALT = 1, CTRL = 2;

    var getMatchingKey = function (which, keyCode, keys) {
        // Loop over and return if matched.
        for (var k in keys) {
            var key = keys[k];
            if (which === key.which && keyCode === key.keyCode) {
                return k;
            }
        }
    };

    var isDelKeyDown = function (which, keyCode) {
        var keys = {
            'backspace': {'which': 8, 'keyCode': 8},
            'delete': {'which': 46, 'keyCode': 46}
        };

        return getMatchingKey(which, keyCode, keys);
    };

    var isDelKeyPress = function (which, keyCode) {
        var keys = {
            'backspace': {'which': 8, 'keyCode': 8, 'shiftKey': false},
            'delete': {'which': 0, 'keyCode': 46}
        };

        return getMatchingKey(which, keyCode, keys);
    };

    var isSpecialKeyPress = function (which, keyCode) {
        var keys = {
            'tab': {'which': 0, 'keyCode': 9},
            'enter': {'which': 13, 'keyCode': 13},
            'end': {'which': 0, 'keyCode': 35},
            'home': {'which': 0, 'keyCode': 36},
            'leftarrow': {'which': 0, 'keyCode': 37},
            'uparrow': {'which': 0, 'keyCode': 38},
            'rightarrow': {'which': 0, 'keyCode': 39},
            'downarrow': {'which': 0, 'keyCode': 40},
            'F5': {'which': 116, 'keyCode': 116}
        };

        return getMatchingKey(which, keyCode, keys);
    };

    var isModifier = function (evt) {
        return evt.ctrlKey || evt.altKey || evt.metaKey;
    };

    var inputRegs = {
        '9': /[0-9]/,
        'a': /[A-Za-z]/,
        '*': /[A-Za-z0-9]/
    };

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

    var patternMatcher = (function () {
        //
        // Parse a matcher string into a RegExp. Accepts valid regular
        // expressions and the catchall '*'.
        // @private
        //
        var parseMatcher = function (matcher) {
            if (matcher === '*') {
                return /.*/;
            }
            return new RegExp(matcher);
        };

        //
        // Parse a pattern spec and return a function that returns a pattern
        // based on user input. The first matching pattern will be chosen.
        // Pattern spec format:
        // Array [
        //  Object: { Matcher(RegExp String) : Pattern(Pattern String) },
        //  ...
        // ]
        function patternMatcher(patternSpec) {
            var matchers = [],
                patterns = [];

            // Iterate over each pattern in order.
            utils.forEach(patternSpec, function (patternMatcher) {
                // Process single property object to obtain pattern and matcher.
                utils.forEach(patternMatcher, function (patternStr, matcherStr) {
                    var parsedPattern = pattern.parse(patternStr),
                        regExpMatcher = parseMatcher(matcherStr);

                    matchers.push(regExpMatcher);
                    patterns.push(parsedPattern);

                    // Stop after one iteration.
                    return false;
                });
            });

            var getPattern = function (input) {
                var matchedIndex;
                utils.forEach(matchers, function (matcher, index) {
                    if (matcher.test(input)) {
                        matchedIndex = index;
                        return false;
                    }
                });

                return matchedIndex === undefined ? null : patterns[matchedIndex];
            };

            return {
                getPattern: getPattern,
                patterns: patterns,
                matchers: matchers
            };
        }

        return patternMatcher;
    })();

    var pattern = (function () {

// Define module
        var pattern = {};

// Match information
        var DELIM_SIZE = 4;

// Our regex used to parse
        var regexp = new RegExp('{{([^}]+)}}', 'g');

//
// Helper method to parse pattern str
//
        var getMatches = function (pattern) {
            // Populate array of matches
            var matches = [],
                match;
            while (match = regexp.exec(pattern)) {
                matches.push(match);
            }

            return matches;
        };

//
// Create an object holding all formatted characters
// with corresponding positions
//
        pattern.parse = function (pattern) {
            // Our obj to populate
            var info = {inpts: {}, chars: {}};

            // Pattern information
            var matches = getMatches(pattern),
                pLength = pattern.length;

            // Counters
            var mCount = 0,
                iCount = 0,
                i = 0;

            // Add inpts, move to end of match, and process
            var processMatch = function (val) {
                var valLength = val.length;
                for (var j = 0; j < valLength; j++) {
                    info.inpts[iCount] = val.charAt(j);
                    iCount++;
                }
                mCount++;
                i += (val.length + DELIM_SIZE - 1);
            };

            // Process match or add chars
            for (i; i < pLength; i++) {
                if (mCount < matches.length && i === matches[mCount].index) {
                    processMatch(matches[mCount][1]);
                } else {
                    info.chars[i - (mCount * DELIM_SIZE)] = pattern.charAt(i);
                }
            }

            // Set mLength and return
            info.mLength = i - (mCount * DELIM_SIZE);
            return info;
        };


// Expose
        return pattern;
    })();

    var SmartInput = core.ui('SmarkInput', {
        bindjQuery: 'smartInput',
        defaults: {
            persistent: false,
            repeat: false,
            placeholder: '',
            pattern: ''
        },
        initialize: function (el, options) {
            var me = this;
            if (me.supr(el, options) === false) {
                return;
            }

            if (me.options.pattern) {
                me.options.patterns = me._specSinglePattern(me.options.pattern);
                delete me.options.pattern;
            } else {
                return;
            }

            me.patternMacher = patternMatcher(me.options.patterns);
            me._updatePattern();

            me.hldrs = {};
            me.focus = 0;

            me._bindEvents();
        },

        _bindEvents: function () {
            var me = this;

            me.on({
                keydown: function (e) {
                    var keyCode = e.which;

                    if (keyCode && isDelKeyDown(e.which, e.keyCode)) {
                        me._processKey(null, k);
                        e.preventDefault();
                    }
                },
                keypress: function (e) {
                    var keyCode = e.which, isSpecial;

                    isSpecial = isSpecialKeyPress(e.which, e.keyCode);

                    if (isDelKeyPress(e.which, e.keyCode) && !isSpecial && isModifier(e.originalEvent)) {
                        me._processKey(String.fromCharCode(keyCode), false);
                        e.preventDefault();
                    }
                },
                paste: function (e) {
                    me._processKey(getClipboard(e), false);
                    e.preventDefault();
                }
            });

            if (me.options.persistent) {
                me._processKey('', false);
                me.el.blur();

                var focus = function (e) {
                    setTimeout(function () {
                        var selection = Selection.get(me.el);
                        var isAfterStart = selection.end > me.focus,
                            isFirstChar = selection.end === 0;
                        if (isAfterStart || isFirstChar) {
                            Selection.set(self.el, self.focus);
                        }
                    }, 0);
                };

                me.$el.on({
                    focus: focus,
                    click: focus,
                    touchstart: focus
                })
            }
        },

        _specSinglePattern: function (ptn) {
            return [{'*': ptn}];
        },

        _processKey: function (chars, delKey, ignoreCaret) {
            var me = this;

            me.sel = Selection.get(me.el);
            me.val = me.el.value;

            me.delta = 0;

            if (me.sel.begin !== me.sel.end) {
                me.delta = (-1) * Math.abs(this.sel.begin - me.sel.end);
                me.val = removeChars(me.val, me.sel.begin, me.sel.end);
            } else if (delKey && delKey === 46) {
                this._delete();
            } else if (delKey && me.sel.begin - 1 >= 0) {
                me.val = removeChars(me.val, me.sel.end - 1, me.sel.end);
                me.delta -= 1;
            } else if (delKey) {
                return true;
            }

            if (!delKey) {
                me.val = addChars(me.val, chars, me.sel.begin);
                me.delta += chars.length;
            }

            me._formatValue(ignoreCaret);
        },

        addInptType: function (chr, reg) {
            inputRegs[chr] = reg;
        },

        _delete: function () {
            var me = this;

            // Adjust focus to make sure its not on a formatted char
            while (me.chars[me.sel.begin]) {
                me._nextPos();
            }

            // As long as we are not at the end
            if (me.sel.begin < me.val.length) {
                // We will simulate a delete by moving the caret to the next char
                // and then deleting
                me._nextPos();
                me.val = removeChars(me.val, me.sel.end - 1, me.sel.end);
                me.delta = -1;
            }
        },

        _updatePattern: function () {
            // Determine appropriate pattern
            var newPattern = this.patternMatcher.getPattern(this.val);

            // Only update the pattern if there is an appropriate pattern for the value.
            // Otherwise, leave the current pattern (and likely delete the latest character.)
            if (newPattern) {
                // Get info about the given pattern
                this.mLength = newPattern.mLength;
                this.chars = newPattern.chars;
                this.inpts = newPattern.inpts;
            }
        },

        resetPattern: function (str) {
            // Update opts to hold new pattern
            this.opts.patterns = str ? this._specFromSinglePattern(str) : this.opts.patterns;

            // Get current state
            this.sel = Selection.get(this.el);
            this.val = this.el.value;

            // Init values
            this.delta = 0;

            // Remove all formatted chars from val
            this._removeChars();

            this.patternMatcher = patternMatcher(this.opts.patterns);

            // Update pattern
            var newPattern = this.patternMatcher.getPattern(this.val);
            this.mLength = newPattern.mLength;
            this.chars = newPattern.chars;
            this.inpts = newPattern.inpts;

            // Format on start
            this._processKey('', false, true);
        },

        _nextPos: function () {
            this.sel.end++;
            this.sel.begin++;
        },

        _formatValue: function (ignoreCaret) {
            var me = this;
            // Set caret pos
            me.newPos = me.sel.end + me.delta;

            // Remove all formatted chars from val
            me._removeChars();

            // Switch to first matching pattern based on val
            me._updatePattern();

            // Validate inputs
            me._validateInpts();

            // Add formatted characters
            me._addChars();

            // Set value and adhere to maxLength
            me.el.value = me.val.substr(0, me.mLength);

            // Set new caret position
            if ((typeof ignoreCaret) === 'undefined' || ignoreCaret === false) {
                Selection.set(me.el, me.newPos);
            }
        },

        _removeChars: function () {
            var me = this;
            // Delta shouldn't include placeholders
            if (me.sel.end > me.focus) {
                me.delta += me.sel.end - me.focus;
            }

            // Account for shifts during removal
            var shift = 0;

            // Loop through all possible char positions
            for (var i = 0; i <= me.mLength; i++) {
                // Get transformed position
                var curChar = me.chars[i],
                    curHldr = me.hldrs[i],
                    pos = i + shift,
                    val;

                // If after selection we need to account for delta
                pos = (i >= me.sel.begin) ? pos + me.delta : pos;
                val = me.val.charAt(pos);
                // Remove char and account for shift
                if (curChar && curChar === val || curHldr && curHldr === val) {
                    me.val = utils.removeChars(me.val, pos, pos + 1);
                    shift--;
                }
            }

            // All hldrs should be removed now
            me.hldrs = {};

            // Set focus to last character
            me.focus = me.val.length;
        },

        _validateInpts: function () {
            var me = this;

            // Loop over each char and validate
            for (var i = 0; i < me.val.length; i++) {
                // Get char inpt type
                var inptType = me.inpts[i];

                // Checks
                var isBadType = !inptRegs[inptType],
                    isInvalid = !isBadType && !inptRegs[inptType].test(me.val.charAt(i)),
                    inBounds = me.inpts[i];

                // Remove if incorrect and inbounds
                if ((isBadType || isInvalid) && inBounds) {
                    me.val = utils.removeChars(me.val, i, i + 1);
                    me.focusStart--;
                    me.newPos--;
                    me.delta--;
                    i--;
                }
            }
        },

        _addChars: function () {
            var me = this;
            if (me.opts.persistent) {
                // Loop over all possible characters
                for (var i = 0; i <= me.mLength; i++) {
                    if (!me.val.charAt(i)) {
                        // Add placeholder at pos
                        me.val = utils.addChars(me.val, me.opts.placeholder, i);
                        me.hldrs[i] = me.opts.placeholder;
                    }
                    me._addChar(i);
                }

                // Adjust focus to make sure its not on a formatted char
                while (me.chars[me.focus]) {
                    me.focus++;
                }
            } else {
                // Avoid caching val.length, as they may change in _addChar.
                for (var j = 0; j <= me.val.length; j++) {
                    // When moving backwards there are some race conditions where we
                    // dont want to add the character
                    if (me.delta <= 0 && (j === me.focus)) {
                        return true;
                    }

                    // Place character in current position of the formatted string.
                    me._addChar(j);
                }
            }
        },

        _addChar: function (i) {
            var me = this;

            // If char exists at position
            var chr = me.chars[i];
            if (!chr) {
                return true;
            }

            // If chars are added in between the old pos and new pos
            // we need to increment pos and delta
            if (isBetween(i, [me.sel.begin - 1, me.newPos + 1])) {
                me.newPos++;
                me.delta++;
            }

            // If character added before focus, incr
            if (i <= me.focus) {
                me.focus++;
            }

            // Updateholder
            if (me.hldrs[i]) {
                delete me.hldrs[i];
                me.hldrs[i + 1] = me.opts.placeholder;
            }

            // Update value
            me.val = addChars(me.val, chr, i);
        }

    })
})(jQuery, window[LIB_NAME]);