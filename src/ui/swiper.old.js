/*!
 * @author slide
 * @email comahead@gmail.com
 * @create 2013-03-17
 * @license MIT License
 */
(function (ctx, $, core, undefined) {
    "use strict";

    // https://github.com/nathansearles/Slides/blob/SlidesJS-3/source/jquery.slides.js

    var defaults = {
            start: 0,
            indicator: {
                auto: true,
                filter: '.ui_slide_indicator'
            },
            itemFilter: '.ui_slide_item',
            effect: 'slide', // fade
            isWrap: false,
            interval: 5000,
            duration: 500
        },
        isTouch = core.isTouch,
        Swiper = core.ui('SlideBanner', {
            defaults: defaults,
            selectors: {
                items: '.ui_slide_item',
                prev: '.ui_slide_prev',
                next: '.ui_slide_next'
            },
            initialize: function(el, options) {
                var me = this;
                if(me.supr(el, options) === false){ return; }

                me._init();
            },
            _init: function() {
                var me = this;

                me.$el.data({
                    animating: false,
                    total: me.$items.size(),
                    current: me.options.start
                });

                me.$el.css({
                    overflow: 'hidden'
                })
            }
        });

    if(define && define.amd) {
        define([], function(){
            return Swiper;
        });
    }

})(window, jQuery, window[LIB_NAME]);