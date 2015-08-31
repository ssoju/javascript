/*!
 * @author coma.ui.RangeSlider.js
 * @email odyseek@vi-nyl.com
 * @create 2015-03-31
 * @license MIT License
 *
 * @modifier comahead@vi-nyl.com
 */
(function ($, core, undefined) {
    "use strict";

    if(core.ui.RangeSlider) { return; }

    var ctx = window,
        $win = $(window),
        $doc = $(document),
        ui = core.ui,
        browser = core.browser,
        isTouch = browser.isTouch;

    //Slider ////////////////////////////////////////////////////////////////////////////
    /**
     * @class
     * @description
     * @name
     * @extends coma.ui.View
     */
    var RangeSlider = ui('RangeSlider', /** @lends coma.ui.RangeSlider# */{
        bindjQuery: 'rangeSlider',
        defaults: {
            startValue: 0,
            endValue: 100
        },
        selectors: {
            btnMin:'.ui_rangeslider_min',
            btnMax: '.ui_rangeslider_max',
            position: '.ui_position'
        },
        initialize: function(el, options) {
            var me = this;

            if (me.supr(el, options) === false) {
                return;
            }

            me.moveX = me.downX = me.currX = 0;
            me.isMouseDown = false;
            me.$activeBtn = me.$lastMovedBtn = null;

            me.items = me.options.items || me.$position.map(function(){ return $(this).data('value'); }).get();
            me.$maxInput = $( me.options.maxInput );
            me.$minInput = $( me.options.minInput );

            me._calcSize();
            me._init();
            me._bindEvents();
        },

        _bindEvents: function(){
            var me = this;

            me.$position.on('click', function(e) {
                e.preventDefault();

                var left = me.$position.index($(this)) * me.options.distance,
                    calMinWidth = me._getMinWidth(),
                    calMaxWidth = me._getMaxWidth(),
                    diffMin = Math.abs(calMinWidth - left),
                    diffMax = Math.abs(calMaxWidth - left);

                if(calMinWidth > left) {
                    me.$activeBtn = me.$btnMin;
                } else if(calMaxWidth < left){
                    me.$activeBtn = me.$btnMax;
                } else if(diffMin > diffMax) {
                    me.$activeBtn = me.$btnMax;
                } else if(diffMin < diffMax) {
                    me.$activeBtn = me.$btnMin;
                } else if(me.$lastMovedBtn) {
                    me.$activeBtn = me.$lastMovedBtn;
                } else {
                    return;
                }

                me._move(left);
                me._syncInput();
            });

            me.on('mousedown touchstart', 'button.cir', function(e) {
                e.preventDefault();
                if(isTouch){
                    e.stopPropagation();
                }

                me.isMouseDown = true;
                me.$activeBtn = $(this).parent();
                me.currX = me.$activeBtn.hasClass('ui_rangeslider_max') ? me._getMaxWidth() : me._getMinWidth();
                me.downX = me._getX(e);


                $doc.off('.'+me.cid).on('mouseup.'+me.cid+' touchend.'+me.cid+' mousemove.'+me.cid+' touchmove.'+me.cid, function(e){
                    if(!me.isMouseDown){ $doc.off('.'+me.cid); return; }

                    switch(e.type){
                        case 'mouseup':
                        case 'touchend':
                            me.isMouseDown = false;
                            me.moveX = 0;
                            me._fixPos();
                            me.trigger('slidechanged', [me.getValue()]);
                            $doc.off('.'+me.cid);
                            break;
                        case 'mousemove':
                        case 'touchmove':
                            me.moveX = me._getX(e);
                            me._move(me.currX - (me.downX - me.moveX));
                            e.preventDefault();
                            break
                    }
                });

                return false;
            }).on('keydown', 'button.cir', function(e){
                var $btn = $(this).parent(),
                    left = $btn.hasClass('ui_rangeslider_max') ? me._getMaxWidth() : me._getMinWidth();
                switch(e.keyCode){
                    case 37: // left
                        left -= me.options.distance;
                        e.stopPropagation();
                        e.preventDefault();
                        break;
                    case 39:
// right
                        left += me.options.distance;
                        e.stopPropagation();
                        e.preventDefault();
                        break;
                }
                me.$activeBtn = $btn;
                me._move(left);
                me._syncInput();
            });

            //if(core.browser.isTouch) {
            $(window).on('resizeend', function() {
                var maxWidth = me.$el.width(); // me.options.width;
                if(maxWidth === me.maxWidth) { return; }

                me.maxWidth = maxWidth;
                me.options.distance = Math.round(me.maxWidth / (me.$position.size() - 1));
                me.setValues(me.$minInput.val()|0, me.$maxInput.val()|0);
            });
            //}
        },

        _getMinWidth: function() {
            return this.$btnMin.width();
        },

        _getMinIndex: function(){
            var me = this;
            return Math.round( me._getMinWidth() / me.options.distance );
        },

        _getMaxIndex: function(){
            var me = this;
            return Math.round( me._getMaxWidth() / me.options.distance );
        },

        _getMaxWidth: function() {
            return this.maxWidth - this.$btnMax.width();
        },

        _init: function() {
            var me = this,
                startValue = 'startValue' in me.options ? me.options.startValue : me.items[me._getMinIndex()],
                endValue = 'endValue' in me.options ? me.options.endValue : me.items[me._getMaxIndex()];

            me.moveByValue(startValue, endValue);
            me._syncInput();
        },

        _syncInput: function(){
            var me = this,
                val = me.getValue();
            me.$minInput.val(val.minValue);
            me.$maxInput.val(val.maxValue);
            me.$btnMin.find('span.hide>span').text(me.$position.eq(me._getMinIndex()).data('title')+'에서');
            me.$btnMax.find('span.hide>span').text(me.$position.eq(me._getMaxIndex()).data('title')+'까지');

            // 설정된 버튼 위치의 li에 on 클래스 추가
            me.$position.parent().removeClass('on').eq(me._getMinIndex()).addClass('on').end().eq(me._getMaxIndex()).addClass('on');
        },

        _getX: function(e) {
            if(isTouch && e.originalEvent.touches){
                e = e.originalEvent.touches[0];
            }
            return e.pageX;
        },

        _move: function(left) {
            var me = this;
            if(me.$activeBtn.hasClass('ui_rangeslider_max')){
                me._moveMax(left);
            } else {
                me._moveMin(left);
            }
        },

        _moveMin: function(w) {
            var me = this,
                distance = me.options.distance;

            w = Math.min(Math.max(0, w), me._getMaxWidth() - distance);
            if (w === 0) {
                me.$btnMin.find('button').addClass('zero');
            } else {
                me.$btnMin.find('button').removeClass('zero');
            }
            me.$btnMin.css('width', w);
            me.$lastMovedBtn = me.$btnMin;
        },

        _moveMax: function(w) {
            var me = this,
                distance = me.options.distance;

            w = Math.max(Math.min(me.maxWidth, w), me._getMinWidth() + distance);
            w = me.maxWidth - w;
            if (w === 0) {
                me.$btnMax.find('button').addClass('zero');
            } else {
                me.$btnMax.find('button').removeClass('zero');
            }
            me.$btnMax.css('width', w);
            me.$lastMovedBtn = me.$btnMax;
        },

        moveByValue: function(startValue, endValue){
            var me = this,
                distance = me.options.distance,
                startIdx = coma.array.indexOf(me.items, startValue),
                endIdx = coma.array.indexOf(me.items, endValue);

            me._moveMin(startIdx * distance);
            me._moveMax(endIdx * distance);
        },

        setValues: function(startValue, endValue){
            this.moveByValue(startValue, endValue);
        },

        _fixPos: function() {
            var me = this,
                distance = me.options.distance,
                isMaxBtn = me.$activeBtn.hasClass('ui_rangeslider_max'),
                left;


            left = isMaxBtn ? me._getMaxWidth() : me._getMinWidth();
            left = (Math.round(left / distance) * distance);
            me._move(left);
            me._syncInput();
        },

        getValue: function () {
            var me = this,
                distance = me.options.distance,
                items = me.items,
                minIndex = Math.round(me._getMinWidth() / distance),
                maxIndex = Math.round(me._getMaxWidth() / distance);

            return {
                'minValue': items[minIndex],
                'maxValue': items[maxIndex]
            }
        },

        _calcSize: function(){
            var me = this,
                maxWidth = me.$el.width(); // me.options.width;

            me.maxWidth = maxWidth;
            me.options.distance = Math.round(me.maxWidth / (me.$position.size() - 1));
        },

        update: function () {
            var me = this;

            me._calcSize();
            me.setValues(me.$minInput.val()|0, me.$maxInput.val()|0);
        }
    });
    ///////////////////////////////////////////////////////////////////////////////////////

    if (typeof define === "function" && define.amd) {
        define([], function() {
            return RangeSlider;
        });
    }

})(jQuery, window[LIB_NAME]);
