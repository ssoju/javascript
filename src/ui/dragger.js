/**
 * @author 김승일(comahead@gmail.com)
 */
(function($, core, undefined) {
    "use strict";

    var context = window;
    var getPageScroll = function(){
        return {
            x: (context.pageXOffset !== undefined) ? context.pageXOffset : (document.documentElement || document.body.parentNode || document.body).scrollLeft,
            y: (context.pageYOffset !== undefined) ? context.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop
        };
    };

    document.onselectstart = function(){ return false; }

    var Dragger = ui('Dragger', {
        defaults: {
            start: null,
            drag: null,
            stop: null,
            initX: 0,
            initY: 0,
            allowVerticalScrolling: true,
            allowHorizontalScrolling: true,

            bounds: {
                minX: null,
                maxX: null,
                minY: null,
                maxY: null
            }
        },
        initialize: function(el, options) {
            var me = this;

            if(me.supr(el, options) === false){ return; }

            me.bounds = $.extend({}, me.defaults.bounds, me.options.bounds);
            me.dragStart = { x: 0, y: 0, diffX: 0, diffY: 0, scrollX: 0, scrollY: 0 };
            me.isDragging = false;
            me.isScrolling = false;

            me.$el.css('msTouchAction', 'none');
            me.bindEvents();
            me.enabled = true;
        },
        bindEvents: function () {
            var me = this;
            me.$el.on('mousedown', me._eventMouseDown.bind(me));
            core.$doc.on('mousemove', me._eventMouseMove.bind(me));
            core.$doc.on('mouseup', me._eventMouseUp.bind(me));
            me.$el.on('touchstart', me._eventTouchStart.bind(me));
            me.$el.on('touchmove', me._eventTouchMove.bind(me));
            me.$el.on('touchend', me._eventTouchEnd.bind(me));
            me.$el.on('click', me._preventClickWhenDrag.bind(me));
        },
        unbindEvents: function () {
            me.$el.off('mousedown', me._eventMouseDown.bind(me));
            core.$doc.off('mousemove', me._eventMouseMove.bind(me));
            core.$doc.off('mouseup', me._eventMouseUp.bind(me));
            me.$el.off('touchstart', me._eventTouchStart.bind(me));
            me.$el.off('touchmove', me._eventTouchMove.bind(me));
            me.$el.off('touchend', me._eventTouchEnd.bind(me));
            me.$el.off('click', me._preventClickWhenDrag.bind(me));
        },
        setBounds: function (newBounds) {
            $.extend(this.bounds, newBounds);
        },
        preventDragStart: function (e) {
            e.preventDefault();
        },
        hasDragged: function () {
            return (this.dragStart.diffX !== 0 || this.dragStart.diffY !== 0);
        },
        getNewPos: function (pointPos) {
            var diffX, diffY, newX, newY;

            diffX = pointPos.x - this.dragStart.x;
            diffY = pointPos.y - this.dragStart.y;

            this.dragStart.diffX = diffX;
            this.dragStart.diffY = diffY;

            newX = diffX;
            newY = diffY;

            if (typeof this.bounds.minX === 'number') {
                newX = Math.max(newX, this.bounds.minX);
            }
            if (typeof this.bounds.maxX === 'number') {
                newX = Math.min(newX, this.bounds.maxX);
            }
            if (typeof this.bounds.minY === 'number') {
                newY = Math.max(newY, this.bounds.minY);
            }
            if (typeof this.bounds.maxY === 'number') {
                newY = Math.min(newY, this.bounds.maxY);
            }

            return {
                x: newX,
                y: newY
            };
        },
        _startDrag: function(pointPos) {
            var me = this,
                pageScroll = getPageScroll();

            me.dragStart = {
                x: pointPos.x,
                y: pointPos.y,
                diffX: 0,
                diffY: 0,
                scrollX: pageScroll.x,
                scrollY: pageScroll.y
            };

            me.triggerHandler('dragstart', {pos: pointPos});
        },

        _moveHandle: function(pointPos) {
            var me = this,
                newPos = me.getNewPos(pointPos);

            me.triggerHandler('dragmove', {pos: newPos, x: newPos.x, y: newPos.y});
        },

        _stopDrag: function(pointPos) {
            var me = this;

            var newPos = me.getNewPos(pointPos);
            var dragSuccess = (me.hasDragged() || !me.isScrolling);
            me.triggerHandler('dragend', {dragSuccess: dragSuccess, pos: newPos, x: newPos.x, y: newPos.y});
            me.isDragging = false;
        },

        _didPageScroll: function() {
            var me = this;
            var pageScroll = getPageScroll();
            if (me.options.allowVerticalScrolling && pageScroll.y !== me.dragStart.scrollY) {
                return true;
            }
            if (me.options.allowHorizontalScrolling && pageScroll.x !== me.dragStart.scrollX) {
                return true;
            }
            return false;
        },
        _didDragEnough: function(pos) {
            var me = this,
                opts = me.options;

            if (!opts.allowVerticalScrolling && Math.abs(pos.y - me.dragStart.y) > 10) {
                return true;
            }
            if (!opts.allowHorizontalScrolling && Math.abs(pos.x - me.dragStart.x) > 10) {
                return true;
            }
            return false;
        },
        _eventMouseDown: function (e) {
            this.isDragging = true;
            this._startDrag({ x: e.clientX, y: e.clientY });
        },

        _eventMouseMove: function (e) {
            if (!this.isDragging) return;
            this._moveHandle({x: e.clientX, y: e.clientY});
        },

        _eventMouseUp: function (e) {
            if (!this.isDragging) return;
            this._stopDrag({x: e.clientX, y: e.clientY});
        },
        _eventTouchStart: function (e) {
            this.isDragging = false;
            this._startDrag({x: e.touches[0].clientX, y: e.touches[0].clientY});
        },
        _eventTouchMove: function(e){
            var me = this;
            if (me.isScrolling) return true;
            var pos = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
            if (!me.isDragging) {
                if (me._didPageScroll()) {
                    me.isScrolling = true;
                    return true;
                }
                if (me._didDragEnough(pos)) {
                    me.isDragging = true;
                } else {
                    return true;
                }
            }
            e.preventDefault();
            me._moveHandle(pos);
        },
        _eventTouchEnd: function(e){
            var me = this,
                pos = {
                    x: (me.isScrolling) ? me.dragStart.x : e.changedTouches[0].clientX,
                    y: (me.isScrolling) ? me.dragStart.y : e.changedTouches[0].clientY
                };
            me._stopDrag(pos);
            me.isScrolling = false;
        },
        _preventClickWhenDrag: function (e) {
            if (this.hasDragged()) {
                e.preventDefault();
            }
        },
        relase: function(){
            if (!this.enabled) return;
            this.unbindEvents();
            delete this.dragStart;
            delete this.isDragging;
            delete this.isScrolling;
            this.el.style.msTouchAction = undefined;
            delete this.enabled;
        }
    });

    if (typeof define === "function" && define.amd) {
        define([], function() {
            return Dragger;
        });
    }

})(jQuery, window[LIB_NAME]);