/*!
 * @module vcui.ui.LazyLoader
 * @license MIT License
 * @description LazyLoader 컴포넌트
 * @copyright VinylC UID Group
 */
define('ui/lazyLoader', ['jquery', 'vcui'], function ($, core) {
    "use strict";

    var LazyLoader = core.ui('LazyLoader', {
        bindjQuery: 'lazyLoader',
        singleton: true,
        defaults: {
            outsect: 100,
            selector: '[data-src]',
            container: window,
            dataAttribute: 'data-src',
            useFade: true
        },

        initialize: function(el, options) {
            var self = this;
            if(self.supr(el, options) === false) { return; }

            self.largestPositionX = 0;
            self.largestPositionY = 0;
            self.$items = self.$(self.options.selector);
            self.$con = $(self.options.container);

            self._bindEvents();
        },

        _bindEvents: function() {
            var self = this;

            self.$con.on('scroll'+self.eventNS, function () {
                self.run();
            });

            self.run();
        },

        _getContainerSize: function() {
            return {
                height: this.$con.height(),
                width: this.$con.width(),
            };
        },

        _getScrollValue: function() {
            return {
                scrollTop: this.$con.scrollTop(),
                scrollLeft: this.$con.scrollLeft(),
            };
        },

        run: function() {
            var self = this;
            var scrollValue = self._getScrollValue();
            var sizeValue = self._getContainerSize();

            if(scrollValue.scrollLeft >= self.largestPositionX || scrollValue.scrollTop >= self.largestPositionY) {
                self.$items = self.$items.filter(function () {
                    var $el = $(this),
                        offset = $el.offset();

                    if(/*((scrollValue.scrollLeft + self.options.outsect + sizeValue.width) >= offset.left) && */
                    ((scrollValue.scrollTop + self.options.outsect + sizeValue.height) >= offset.top)) {
                        if (self.options.useFade) {
                            $el.css('opacity', 0);
                        }
                        self._loadImage($el, function () {
                            if (self.options.useFade) {
                                $el.stop().animate({opacity:1});
                            }
                        });
                        return false;
                    }
                    return true;
                });
                self.largestPositionX = scrollValue.scrollLeft;
                self.largestPositionY = scrollValue.scrollTop;
            }
        },
        _loadImage: function($el, cb) {
            var src = $el.attr('data-src');

            $el.removeAttr('data-src').addClass('lazyloaded');

            if ($el.get(0).tagName.toLowerCase() === 'img') {
                $el.attr("src", src);

                if ($el[0].complete) {
                    cb.call($el);
                } else {
                    $el.one('load', cb);
                }
            } else {
                $el.css('background-image',"url('" + src + "')");
                cb.call($el);
            }
        },
        update: function () {
            this.$items = this.$items.add(this.$(this.options.selector));            
            this.run();
        }
    });

    return LazyLoader;
});
