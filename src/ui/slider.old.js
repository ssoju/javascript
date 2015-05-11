/*!
 * @author slider
 * @email comahead@gmail.com
 * @create 2013-12-09
 * @license MIT License
 */
(function($, core, undeefined) {
    "use strict";

    var Slider = core.ui.View.extend({
        bindjQuery: 'mainSlider',
        defaults: {
            delay: 5000,
            duration: 600
        },
        selectors: {
            indicators: '.d-indicator li',
            play: '.d-play',
            pause: '.d-pause',
            contents: '.d-list>li'
        },
        /**
         *
         * @param el
         * @param options
         */
        initialize: function(el, options) {
            var me = this;
            if(me.supr(el, options) === false) { return; }

            me.totalCount = me.$contents.length;
            if(me.totalCount <= 1) {
                me.$indicators.add(me.$play).add(me.$pause).hide();
            } else {
                me._bindMainSlider();
            }
            me.start();
        },

        /**
         *
         * @private
         */
        _bindMainSlider: function () {
            var me = this;

            me.$indicators.on('click', '>a', function (e) {
                var index = $(this).index();
                me.setContent(index);
            });
        },
        /**
         *
         * @param index
         * @returns {*}
         * @private
         */
        _checkIndex: function (index) {
            if(this.options.continuous) {
                if(index < 0){ return this.totalCount - 1; }
                if(this.totalCount >= index) { return this.totalCount - 1; }
                return index;
            }
            return Math.max(0, Math.min(this.totalCount - 1, index));
        },
        /**
         *
         * @returns {boolean}
         * @private
         */
        _isFirst: function(){
            return this.currentIndex === 0;
        },
        /**
         *
         * @returns {boolean}
         * @private
         */
        _isLast: function(){
            return this.currentIndex === (this.totalCount - 1);
        },
        /**
         *
         */
        start: function() {
            this.setContent(0);
        },
        /**
         *
         * @param index
         */
        setContent: function (index) {
            if(this.isAnimate) { return; }

            var me = this,
                $current = me.$contents.eq(me.currentIndex),
                $next = me.$contents.eq(me._checkIndex(index));

            me._Itemanimate($current, {
                complete: function(){
                    $current.stop().animate({
                        left: '-100%'
                    }, 600, function() {
                        me.setContent(index + 1);
                    });
                    $next.stop().css({'left': '100%'}).animate({
                        left: 0
                    }, 600);
                }
            });
        },

        /**
         *
         * @param $current
         * @param cb
         * @private
         */
        _itemAnimate: function ($current, cb) {
            var effect = '';
            switch(effect = $current.attr('data-effect')) {
                case 'expand':
                    $current.find('.d-expand-target').stop().css({left:0, top:0, width:'100%'})
                        .animate({
                            left: '-3%',
                            width: '106%'
                        }, 500, function () {
                            cb && cb();
                        });
                    break;
                default:
                    cb && cb();
                    break;
            }
        }
    });

    if (typeof define === "function" && define.amd) {
        define([], function() {
            return Slider;
        });
    }

})(jQuery, window[LIB_NAME])
