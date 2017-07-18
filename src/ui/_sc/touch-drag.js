/*!
 * @author touch-drag.js
 * @email comahead@vinylc.com
 * @create 2015-04-14
 * @license MIT License
 */
(function ($, core) {
    "use strict";

    if(core.ui.TouchDrag){ return; }

    //TouchDrag ////////////////////////////////////////////////////////////////////////////////
    /**
     * @class
     * @name vinyl.ui.TouchDrag
     * @description 페이징모듈
     * @extends vinyl.ui.View
     */
    var TouchDrag = core.ui('TouchDrag', /** @lends vinyl.ui.TouchDrag# */{
        bindjQuery: 'touchDrag',
        $statics: /** @lends vinyl.ui.TouchDrag */{
        },

        defaults: {
        },

        events: {
        },

        selectors: {
            touchSlide: '.ui_touch_slide'
        },
        /**
         * 생성자
         * @param el
         * @param options
         */
        initialize: function(el, options) {
            var me = this;

            if(me.supr(el, options) === false) { return me.release(); }

            $(window).on('resizeend', function () {
                me.$touchSlide.css({'left':0});
            });

            /*
            scui.importJs([
                'libs/jquery.touchSwipe'
            ], function () {
                me.$el.swipe({
                    triggerOnTouchEnd: true,
                    fingers: 1,
                    allowPageScroll: "vertical",
                    threshold: 75,
                    excludedElements: 'input, select, textarea, .noSwipe',
                    swipeLeft: function () {
                        me.$btnNext.triggerHandler('click');
                    },
                    swipeRight: function () {
                        me.$btnPrev.triggerHandler('click');
                    }
                });
            });
            */

            me.$el.on({
                'touchstart': function (event) {
                    var touches = event.originalEvent.touches[0],
                        width = 0;
                    me.$touchSlide.find('.ui_select_dom').each(function (val, that) {
                        width += parseInt($(this).width(),10);
                    });
                    me.width = (width - me.$el.width()) * -1;
                    me.posLeft = me.$touchSlide.position().left;
                    me.startX = touches.pageX;
                    me.startY = touches.pageY;
                    me.direction = null;
                },
                'touchmove': function (event) {
                    var touches = event.originalEvent.touches[0];
                    me.distanceX = touches.pageX - me.startX;
                    me.distanceY = touches.pageY - me.startY;

                    if(me.direction == 'up' || me.direction == 'down') return true;

                    if(Math.abs(me.distanceX) > Math.abs(me.distanceY) && me.width < 0){
                        me.direction = (me.distanceX < 0 ? 'left' : 'right' );
                        if (Math.abs(me.distanceX) > 10) {
                            if(me.distanceX < 0) {
                                me.setLeft = ((me.posLeft + me.distanceX) < me.width) ? me.width: me.posLeft + me.distanceX;
                                me.$touchSlide.css({'left':me.setLeft});
                            }
                            if(me.distanceX > 0) {
                                me.setLeft = ((me.posLeft + me.distanceX) > 0) ? 0 : me.posLeft + me.distanceX;
                                me.$touchSlide.css({'left':me.setLeft});
                            }
                        }
                    }
                    if(Math.abs(me.distanceY) > Math.abs(me.distanceX)){
                        me.direction = (me.distanceY < 0 ? 'up' : 'down' );
                    }

                    if(me.direction == 'left' || me.direction == 'right') return false;
                },
                'touchend': function (event) {
                    var temp = (me.distanceX < 0 ? +1: -1),
                        direction = (me.distance < 0 ? 'prev': 'next');

                    me.distanceX = 0, me.distanceY = 0;
                }
            }).on('mousedown mousemove selectstart', function (e) {
                if (e.type === 'mousedown') {
                    e.preventDefault();
                    // 마우스업시 - User Event 발생
                    $(document).on('mouseup.'+me.cid, function (e) {
                        me.mousedown = false;
                        $(document).off('.'+me.cid);
                    });
                    me.elWidth = 0;
                    me.$touchSlide.find('.ui_select_dom').each(function (val, that) {
                        me.elWidth += parseInt($(this).width(),10);
                    });
                    me.mousedown = true;
                    me.mouseClientX = e.clientX;
                    me.width = (me.elWidth - me.$el.width()) * -1;
                    me.posLeft = me.$touchSlide.position().left;
                } else if (e.type === 'mousemove' && me.mousedown) {
                    me.distanceX = e.clientX - me.mouseClientX;
                    if ((parseInt(me.$el.width(),10) + 10) < me.elWidth) {
                        if (me.distanceX < 0) {
                            me.setLeft = ((me.posLeft + me.distanceX) < me.width) ? me.width: me.posLeft + me.distanceX;
                            me.$touchSlide.css({'left':me.setLeft});
                        }
                        if (me.distanceX > 0) {
                            me.setLeft = ((me.posLeft + me.distanceX) > 0) ? 0 : me.posLeft + me.distanceX;
                            me.$touchSlide.css({'left':me.setLeft});
                        }
                    }
                } else {
                    e.preventDefault();
                }
            });

        }
    });
    ///////////////////////////////////////////////////////////////////////////////////////

    if (typeof define === "function" && define.amd) {
        define(['lib/jquery'], function() {
            return TouchDrag;
        });
    }

})(jQuery, window[LIB_NAME]);