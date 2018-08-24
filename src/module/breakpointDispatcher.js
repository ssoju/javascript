/*!
 * @module vcui.helper.BreakpointDispatcher
 * @bechmark https://github.com/paulirish/matchMedia.js
 * @license MIT License
 * @description 반응형 분기점을 지날때마다 이벤트를 발생시켜주는 헬퍼
 * @copyright VinylC UID Group
 */
define('helper/breakpointDispatcher', ['jquery', 'vcui'], function ($, core) {
    "use strict";

    window.matchMedia || (window.matchMedia = function() {
        "use strict";

        var styleMedia = (window.styleMedia || window.media);
        if (!styleMedia) {
            var style       = document.createElement('style'),
                script      = document.getElementsByTagName('script')[0],
                info        = null;

            style.type  = 'text/css';
            style.id    = 'matchmediajs-test';

            if (!script) {
                document.head.appendChild(style);
            } else {
                script.parentNode.insertBefore(style, script);
            }

            info = ('getComputedStyle' in window) && window.getComputedStyle(style, null) || style.currentStyle;

            styleMedia = {
                matchMedium: function(media) {
                    var text = '@media ' + media + '{ #matchmediajs-test { width: 1px; } }';

                    if (style.styleSheet) {
                        style.styleSheet.cssText = text;
                    } else {
                        style.textContent = text;
                    }

                    return info.width === '1px';
                }
            };
        }

        return function(media) {
            return {
                matches: styleMedia.matchMedium(media || 'all'),
                media: media || 'all'
            };
        };
    }());

    (function(){
        if (window.matchMedia && window.matchMedia('all').addListener) {
            return false;
        }

        var localMatchMedia = window.matchMedia,
            hasMediaQueries = localMatchMedia('only all').matches,
            isListening     = false,
            timeoutID       = 0,    // setTimeout for debouncing 'handleChange'
            queries         = [],   // Contains each 'mql' and associated 'listeners' if 'addListener' is used
            handleChange    = function(evt) {
                // Debounce
                clearTimeout(timeoutID);

                timeoutID = setTimeout(function() {
                    for (var i = 0, il = queries.length; i < il; i++) {
                        var mql         = queries[i].mql,
                            listeners   = queries[i].listeners || [],
                            matches     = localMatchMedia(mql.media).matches;

                        if (matches !== mql.matches) {
                            mql.matches = matches;

                            for (var j = 0, jl = listeners.length; j < jl; j++) {
                                listeners[j].call(window, mql);
                            }
                        }
                    }
                }, 30);
            };

        window.matchMedia = function(media) {
            var mql         = localMatchMedia(media),
                listeners   = [],
                index       = 0;

            mql.addListener = function(listener) {

                if (!hasMediaQueries) {
                    return;
                }

                if (!isListening) {
                    isListening = true;
                    window.addEventListener('resize', handleChange, true);
                }

                if (index === 0) {
                    index = queries.push({
                        mql         : mql,
                        listeners   : listeners
                    });
                }

                listeners.push(listener);
            };

            mql.removeListener = function(listener) {
                for (var i = 0, il = listeners.length; i < il; i++){
                    if (listeners[i] === listener){
                        listeners.splice(i, 1);
                    }
                }
            };

            return mql;
        };
    }());

    /**
     * @class
     * @name vcui.helper.BreakpointDispatcher
     */
    var BreakpointDispatcher = core.helper.BreakpointDispatcher = /** @lends  vcui.helper.BreakpointDispatcher */ vcui.BaseClass.extend({
        $singleton: true,
        initialize: function (options) {
            var self = this;

            self.options = core.extend({
                matches: {}
            }, options);
        },
        /**
         *
         */
        start: function () {
            var self = this,
                data;

            core.each(self.options.matches, function (item, key) {
                var mq = window.matchMedia(key);

                mq.addListener(item);
                item(mq);
            });
        }
    });

    return BreakpointDispatcher;
});
