/*!
 * @author lazyscroll.js
 * @email comahead@gmail.com
 * @create 2013-01-19
 * @license MIT License
 */
(function ($, core, undefined) {
    "use strict";

    var LazyScroll = core.ui('LazyScroll', {
        bindjQuery: 'lazyScroll',
        defaults: {
            range: 200,
            selector: 'img',
            mode: 'vertical',
            container: 'window',
            dataAttribute: 'data-src',
            useFade: true
        },

        initialize: function(el, options) {
            var me = this;
            if(me.supr(el, options) === false) { return; }

            me.isVert = me.options.mode === 'vertical';
            me.largestPosition = 0;
            me.$items = $(me.options.selector);
            me.$con = me.$el.css('overflow') === 'scroll' ? me.$el : $(window);

            me._bindEvents();
        },

        _bindEvents: function() {
            var me = this;

            me.$con.on('scroll'+me.eventNamespace, function () {
                me._action();
            }).trigger('scroll'+me.eventNamespace);
        },

        _getContainerSize: function() {
            return this.$con[this.isVert ? 'height' : 'width']();
        },

        _getScrollValue: function() {
            return this.$con[this.isVert ? 'scrollTop' : 'scrollLeft']();
        },

        _action: function() {
            var me = this;

            var scrollValue = me._getScrollValue();

            if(scrollValue >= me.largestPosition) {
                me.$items = me.$items.filter(function () {
                    var $el = $(this),
                        pos = $el.offset()[me.isVert ? 'top' : 'left'];

                    if((scrollValue + me.options.range + me._getContainerSize()) >= pos) {
                        if (me.options.useFade) {
                            $el.css('opacity', 0);
                        }
                        me._loadImage($el, function () {
                            if (me.options.useFade) {
                                $el.stop().animate({opacity:1});
                            }
                        });
                        return false;
                    }
                    return true;
                });
                me.largestPosition = scrollValue;
            }

            me.triggerHandler('lazyscroll:scroll');
            if(!me.$items.length){
                me.triggerHandler('lazyscroll:complete');
                me.$con.off(me.eventNamespace);
            }
        },
        _loadImage: function($img, cb) {
            var src = $img.attr('data-src');
            $img.attr("src", src);
            console.log(src);
            if ($img[0].complete) {
                cb.call($img);
            } else {
                $img.one('load', cb);
            }
        }
    });

})(jQuery, window[LIB_NAME]);