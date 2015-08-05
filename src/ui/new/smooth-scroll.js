/*! iScroll v5.1.2 ~ (c) 2008-2014 Matteo Spinelli ~ http://cubiq.org/license */
/**
 * Customized by comahead@vi-nyl.com(±è½ÂÀÏ) on 2015-05-20.
 */
(function ($, core, undefined) {
    "use strict";



    var rAF = window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
    var _elementStyle = document.createElement('div').style;
    var _vendor = (function () {
        var vendors = ['t', 'webkitT', 'MozT', 'msT', 'OT'],
            transform,
            i = 0,
            l = vendors.length;

        for (; i < l; i++) {
            transform = vendors[i] + 'ransform';
            if (transform in _elementStyle) {
                return vendors[i].substr(0, vendors[i].length - 1);
            }
        }

        return false;
    })();

    function _prefixStyle(style) {
        if (_vendor === false) return false;
        if (_vendor === '') return style;
        return _vendor + style.charAt(0).toUpperCase() + style.substr(1);
    }

    var _transform = _prefixStyle('transform');

    var getTime = Date.now || function getTime() {
            return new Date().getTime();
        };

    var momentum = function (current, start, time, lowerMargin, wrapperSize, deceleration) {
        var distance = current - start,
            speed = Math.abs(distance) / time,
            destination,
            duration;

        deceleration = deceleration === undefined ? 0.0006 : deceleration;

        destination = current + ( speed * speed ) / ( 2 * deceleration ) * ( distance < 0 ? -1 : 1 );
        duration = speed / deceleration;

        if (destination < lowerMargin) {
            destination = wrapperSize ? lowerMargin - ( wrapperSize / 2.5 * ( speed / 8 ) ) : lowerMargin;
            distance = Math.abs(destination - current);
            duration = distance / speed;
        } else if (destination > 0) {
            destination = wrapperSize ? wrapperSize / 2.5 * ( speed / 8 ) : 0;
            distance = Math.abs(current) + destination;
            duration = distance / speed;
        }

        return {
            destination: Math.round(destination),
            duration: duration
        };
    };

    var browser = {
        hasTransform: _transform !== false,
        hasPerspective: _prefixStyle('perspective') in _elementStyle,
        hasTouch: 'ontouchstart' in window,
        hasPointer: window.PointerEvent || window.MSPointerEvent, // IE10 is prefixed
        hasTransition: _prefixStyle('transition') in _elementStyle
    };

    var easingType = {
        quadratic: {
            style: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            fn: function (k) {
                return k * ( 2 - k );
            }
        },
        circular: {
            style: 'cubic-bezier(0.1, 0.57, 0.1, 1)',   // Not properly "circular" but this looks better, it should be (0.075, 0.82, 0.165, 1)
            fn: function (k) {
                return Math.sqrt(1 - ( --k * k ));
            }
        },
        back: {
            style: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            fn: function (k) {
                var b = 4;
                return ( k = k - 1 ) * k * ( ( b + 1 ) * k + b ) + 1;
            }
        },
        bounce: {
            style: '',
            fn: function (k) {
                if (( k /= 1 ) < ( 1 / 2.75 )) {
                    return 7.5625 * k * k;
                } else if (k < ( 2 / 2.75 )) {
                    return 7.5625 * ( k -= ( 1.5 / 2.75 ) ) * k + 0.75;
                } else if (k < ( 2.5 / 2.75 )) {
                    return 7.5625 * ( k -= ( 2.25 / 2.75 ) ) * k + 0.9375;
                } else {
                    return 7.5625 * ( k -= ( 2.625 / 2.75 ) ) * k + 0.984375;
                }
            }
        },
        elastic: {
            style: '',
            fn: function (k) {
                var f = 0.22,
                    e = 0.4;

                if (k === 0) {
                    return 0;
                }
                if (k == 1) {
                    return 1;
                }

                return ( e * Math.pow(2, -10 * k) * Math.sin(( k - f / 4 ) * ( 2 * Math.PI ) / f) + 1 );
            }
        }
    };

    var eventType = {
        touchstart: 1,
        touchmove: 1,
        touchend: 1,

        mousedown: 2,
        mousemove: 2,
        mouseup: 2,

        pointerdown: 3,
        pointermove: 3,
        pointerup: 3,

        MSPointerDown: 3,
        MSPointerMove: 3,
        MSPointerUp: 3
    };

    var style = {
        transform: _transform,
        transitionTimingFunction: _prefixStyle('transitionTimingFunction'),
        transitionDuration: _prefixStyle('transitionDuration'),
        transitionDelay: _prefixStyle('transitionDelay'),
        transformOrigin: _prefixStyle('transformOrigin')
    };

    var SmoothScroll = core.ui('SmoothScroll', {
        bindjQuery: 'smoothScroll',
        defaults: {
            startX: 0,
            startY: 0,
            scrollY: true,
            directionLockThreshold: 5,
            mouseWheelSpeed: 20,
            momentum: true,

            bounce: true,
            bounceTime: 600,
            bounceEasing: '',

            preventDefault: true,
            preventDefaultException: { tagName: /^(INPUT|TEXTAREA|BUTTON|SELECT)$/i },

            HWCompositing: true,
            useTransition: true,
            useTransform: true
        },
        selectors: {
            //wrapper: '.ui_wrapper',
            scroller: '.ui_scroller'
        },
        initialize: function(el, options) {
            var me = this;
            if(me.supr(el, options) === false) { return; }

            me.$wrapper = me.$el;
            me.isBadAndroid = /Android /.test(window.navigator.appVersion) && !(/Chrome\/\d/.test(window.navigator.appVersion));
            me.translateZ = me.options.HWCompositing && browser.hasPerspective ? ' translateZ(0)' : '';
            me.options.useTransition = browser.hasTransition && me.options.useTransition;
            me.options.useTransform = browser.hasTransform && me.options.useTransform;
            me.options.eventPassthrough = me.options.eventPassthrough === true ? 'vertical' : me.options.eventPassthrough;
            me.options.preventDefault = !me.options.eventPassthrough && me.options.preventDefault;
            me.options.scrollY = me.options.eventPassthrough == 'vertical' ? false : me.options.scrollY;
            me.options.scrollX = me.options.eventPassthrough == 'horizontal' ? false : me.options.scrollX;
            me.options.freeScroll = me.options.freeScroll && !me.options.eventPassthrough;
            me.options.directionLockThreshold = me.options.eventPassthrough ? 0 : me.options.directionLockThreshold;
            me.options.bounceEasing = typeof me.options.bounceEasing == 'string' ? easingType[me.options.bounceEasing] || easingType.circular : me.options.bounceEasing;
            me.options.resizePolling = me.options.resizePolling === undefined ? 60 : me.options.resizePolling;
            me.options.invertWheelDirection = me.options.invertWheelDirection ? -1 : 1;

            me.x = 0;
            me.y = 0;
            me.directionX = 0;
            me.directionY = 0;

            this.scrollerStyle = this.$scroller[0].style;

            me._init();
            me.refresh();

            me.scrollTo(me.options.startX, me.options.startY);
            me.enable();
        },

        enable: function(){
            this.enabled = true;
        },

        _init: function() {
            this._initEvents();
        },

        _initEvents: function() {
            var me = this;

            me._handle(me.$wrapper, 'mousedown');
            me._handle(me.$wrapper, 'touchstart');
            me._handle(me.$wrapper, 'selectstart');
            me._handle(me.$wrapper, 'click');

            if(me.options.useTransition) {
                me._handle(me.$scroller, 'transitionend');
                me._handle(me.$scroller, 'webkitTransitionEnd');
                me._handle(me.$scroller, 'oTransitionEnd');
                me._handle(me.$scroller, 'MSTransitionEnd');
            }

            me._initWheel();

        },
        _initWheel: function () {
            var me = this;

            me._handle(me.$wrapper, 'wheel');
            me._handle(me.$wrapper, 'mousewheel');
            me._handle(me.$wrapper, 'DOMMouseScroll');
        },

        _wheel: function (e) {
            var me = this;
            if ( !me.enabled ) {
                return;
            }

            e.preventDefault ? e.preventDefault() : e.returnValue = false;
            e.stopPropagation ? e.stopPropagation() : e.cancalBubble = true;

            var wheelDeltaX, wheelDeltaY,
                newX, newY;

            if ( me.wheelTimeout === undefined ) {
                me.triggerHandler('smoothscrollstart', {x: me.x, y: me.y});
            }

            // Execute the scrollEnd event after 400ms the wheel stopped scrolling
            clearTimeout(me.wheelTimeout);
            me.wheelTimeout = setTimeout(function () {
                me.triggerHandler('smoothscrollend', {x: me.x, y: me.y});
                me.wheelTimeout = undefined;
            }, 400);

            e = e.originalEvent || e;
            if ( 'deltaX' in e ) {
                if (e.deltaMode === 1) {
                    wheelDeltaX = -e.deltaX * me.options.mouseWheelSpeed;
                    wheelDeltaY = -e.deltaY * me.options.mouseWheelSpeed;
                } else {
                    wheelDeltaX = -e.deltaX;
                    wheelDeltaY = -e.deltaY;
                }
            } else if ( 'wheelDeltaX' in e ) {
                wheelDeltaX = e.wheelDeltaX / 120 * me.options.mouseWheelSpeed;
                wheelDeltaY = e.wheelDeltaY / 120 * me.options.mouseWheelSpeed;
            } else if ( 'wheelDelta' in e ) {
                wheelDeltaX = wheelDeltaY = e.wheelDelta / 120 * me.options.mouseWheelSpeed;
            } else if ( 'detail' in e ) {
                wheelDeltaX = wheelDeltaY = -e.detail / 3 * me.options.mouseWheelSpeed;
            } else {
                return;
            }

            wheelDeltaX *= me.options.invertWheelDirection;
            wheelDeltaY *= me.options.invertWheelDirection;

            if ( !me.hasVerticalScroll ) {
                wheelDeltaX = wheelDeltaY;
                wheelDeltaY = 0;
            }

            newX = me.x + Math.round(me.hasHorizontalScroll ? wheelDeltaX : 0);
            newY = me.y + Math.round(me.hasVerticalScroll ? wheelDeltaY : 0);

            if ( newX > 0 ) {
                newX = 0;
            } else if ( newX < me.maxScrollX ) {
                newX = me.maxScrollX;
            }

            if ( newY > 0 ) {
                newY = 0;
            } else if ( newY < me.maxScrollY ) {
                newY = me.maxScrollY;
            }

            me.scrollTo(newX, newY, 0);
        },

        _handle: function($el, eventName, isBind) {
            var me = this;
            if(isBind !== false) {
                $el.on(eventName+'.'+me.cid, me.handleEvent.bind(me));
            } else {
                $el.off(eventName+'.'+me.cid);
            }
        },

        handleEvent: function(e) {
            var me = this;

            switch(e.type) {
                case 'mousedown':
                case 'touchstart':
                    me._start(e);
                    break;
                case 'selectstart':
                    e.preventDefault ? e.preventDefault : e.returnValue = false;
                    break;
                case 'mousemove':
                case 'touchmove':
                    me._move(e);
                    break;
                case 'mouseup':
                case 'mousecancel':
                case 'touchend':
                case 'touchcancel':
                    me._end(e);
                    break;
                case 'transitionend':
                case 'webkitTransitionEnd':
                case 'oTransitionEnd':
                case 'MSTransitionEnd':
                    me._transitionEnd(e);
                    break;
                case 'wheel':
                case 'mousewheel':
                case 'DOMMouseScroll':
                    me._wheel(e);
                    break;
                //case 'click':
                //    me._click(e);
                //    break;
            }
        },

        getPosition: function () {
            var matrix = this.scrollerStyle,
                x, y;

            if ( this.options.useTransform ) {
                matrix = matrix[style.transform].match(/-?[0-9]+/g);
                x = +(matrix[0]);
                y = +(matrix[1]);
            } else {
                x = +matrix.left.replace(/[^-\d.]/g, '');
                y = +matrix.top.replace(/[^-\d.]/g, '');
            }

            return { x: x, y: y };
        },

        _animate: function (destX, destY, duration, easingFn) {
            var me = this,
                startX = this.x,
                startY = this.y,
                startTime = getTime(),
                destTime = startTime + duration;

            function step () {
                var now = getTime(),
                    newX, newY,
                    easing;

                if ( now >= destTime ) {
                    me.isAnimating = false;
                    me._translate(destX, destY);

                    if ( !me.resetPosition(me.options.bounceTime) ) {
                        me.triggerHandler('smoothscrollend', {x: me.x, y: me.y});
                    }

                    return;
                }

                now = ( now - startTime ) / duration;
                easing = easingFn(now);
                newX = ( destX - startX ) * easing + startX;
                newY = ( destY - startY ) * easing + startY;
                me._translate(newX, newY);

                if ( me.isAnimating ) {
                    rAF(step);
                }
            }

            this.isAnimating = true;
            step();
        },
        _transitionTime: function (time) {
            time = time || 0;

            this.scrollerStyle[style.transitionDuration] = time + 'ms';

            /*if ( !time && utils.isBadAndroid ) {
             this.scrollerStyle[style.transitionDuration] = '0.001s';
             }*/

        },

        _transitionTimingFunction: function (easing) {
            this.scrollerStyle[style.transitionTimingFunction] = easing;

        },
        _translate: function (x, y) {
            var me = this;

            if ( me.options.useTransform ) {
                me.scrollerStyle[style.transform] = 'translate(' + x + 'px,' + y + 'px)' + me.translateZ;
            } else {
                x = Math.round(x);
                y = Math.round(y);
                me.scrollerStyle.left = x + 'px';
                me.scrollerStyle.top = y + 'px';
            }

            me.x = x;
            me.y = y;
            me.triggerHandler('smoothscrollmove', {x: me.x, y: me.y});
        },

        resetPosition: function (time) {
            var me = this,
                x = me.x,
                y = me.y;

            time = time || 0;

            if ( !me.hasHorizontalScroll || me.x > 0 ) {
                x = 0;
            } else if ( me.x < me.maxScrollX ) {
                x = me.maxScrollX;
            }

            if ( !me.hasVerticalScroll || me.y > 0 ) {
                y = 0;
            } else if ( me.y < me.maxScrollY ) {
                y = me.maxScrollY;
            }

            if ( x == me.x && y == me.y ) {
                return false;
            }

            me.scrollTo(x, y, time, me.options.bounceEasing);

            return true;
        },

        scrollTo: function (x, y, time, easing) {
            var me = this;
            easing = easing || easingType.circular;

            me.isInTransition = me.options.useTransition && time > 0;

            if ( !time || (me.options.useTransition && easing.style) ) {
                me._transitionTimingFunction(easing.style);
                me._transitionTime(time);
                me._translate(x, y);
            } else {
                me._animate(x, y, time, easing.fn);
            }
        },

        scrollToElement: function (el, time, offsetX, offsetY, easing) {
            var me = this;
            el = el.nodeType ? el : me.$scroller.querySelector(el);

            if ( !el ) {
                return;
            }

            var pos = $(el).offset();

            pos.left -= me.wrapperOffset.left;
            pos.top  -= me.wrapperOffset.top;

            // if offsetX/Y are true we center the element to the screen
            if ( offsetX === true ) {
                offsetX = Math.round(el.offsetWidth / 2 - me.$wrapper.offsetWidth / 2);
            }
            if ( offsetY === true ) {
                offsetY = Math.round(el.offsetHeight / 2 - me.$wrapper.offsetHeight / 2);
            }

            pos.left -= offsetX || 0;
            pos.top  -= offsetY || 0;
            pos.left = pos.left > 0 ? 0 : pos.left < me.maxScrollX ? me.maxScrollX : pos.left;
            pos.top  = pos.top  > 0 ? 0 : pos.top  < me.maxScrollY ? me.maxScrollY : pos.top;

            time = time === undefined || time === null || time === 'auto' ? Math.max(Math.abs(me.x-pos.left), Math.abs(me.y-pos.top)) : time;

            me.scrollTo(pos.left, pos.top, time, easing);
        },

        /***
         _isDownable: function(el){
            if(el && el.tagName && this.options.preventDefaultException.tagName.test(el.tagName)){
                return true;
            } else {
                return false;
            }
        },

         _click: function(e) {
            var me = this,
                point = e.touches ? e.touches[0] : e;
 
            if(!(me.downX === point.pageX && me.downY === point.pageY)) {
                console.log('prevent click', me.downX, me.downY, e.pageX, e.pageY);
                e.preventDefault ? e.preventDefault() : e.returnValue = false;
            }
        },
         ***/
        _start: function(ev) {
            var me = this;
            var e = ev.originalEvent || ev;

            if ( eventType[e.type] != 1 ) {
                if ( e.button !== 0 ) {
                    return;
                }
            }

            if ( !me.enabled || (me.initiated && eventType[e.type] !== me.initiated) ) {
                return;
            }

            var $doc = $(document),
                point = e.touches ? e.touches[0] : e,
                pos;

            /***if(!me._isDownable($(e.target).closest(':focusable').get(0))) {
                e.preventDefault ? e.preventDefault() : e.returnValue = false;
            }***/
            me._handle($doc, 'mousemove');
            me._handle($doc, 'touchmove');
            me._handle($doc, 'touchend');
            me._handle($doc, 'mouseup');
            me._handle($doc, 'mousecancel');
            me._handle($doc, 'tocuchcancel');

            me.initiated        = eventType[e.type];
            me.moved            = false;
            me.distX            = 0;
            me.distY            = 0;
            me.directionX = 0;
            me.directionY = 0;
            me.directionLocked = 0;

            me._transitionTime();

            me.startTime = getTime();
            if ( me.options.useTransition && me.isInTransition ) {
                me.isInTransition = false;
                pos = me.getPosition();
                me._translate(Math.round(pos.x), Math.round(pos.y));
                me.triggerHandler('smoothscrollend', {x: me.x, y: me.y});
            } else if ( !me.options.useTransition && me.isAnimating ) {
                me.isAnimating = false;
                me.triggerHandler('smoothscrollend', {x: me.x, y: me.y});
            }

            me.startX    = me.x;
            me.startY    = me.y;
            me.absStartX = me.x;
            me.absStartY = me.y;
            me.pointX    = me.downX = point.pageX;
            me.pointY    = me.downY = point.pageY;
        },

        _move: function(e) {
            var me = this;

            e = e.originalEvent || e;
            if ( !me.enabled || eventType[e.type] !== me.initiated ) {
                return;
            }

            if ( me.options.preventDefault ) {  // increases performance on Android? TODO: check!
                e.preventDefault ? e.preventDefault() : e.defaultValue = false;
            }

            var point           = e.touches ? e.touches[0] : e,
                deltaX          = point.pageX - me.pointX,
                deltaY          = point.pageY - me.pointY,
                timestamp       = getTime(),
                newX, newY,
                absDistX, absDistY;


            me.pointX           = point.pageX;
            me.pointY           = point.pageY;

            me.distX            += deltaX;
            me.distY            += deltaY;
            absDistX            = Math.abs(me.distX);
            absDistY            = Math.abs(me.distY);

            // We need to move at least 10 pixels for the scrolling to initiate
            if ( timestamp - me.endTime > 300 && (absDistX < 10 && absDistY < 10) ) {
                return;
            }

            // If you are scrolling in one direction lock the other
            if ( !me.directionLocked && !me.options.freeScroll ) {
                if ( absDistX > absDistY + me.options.directionLockThreshold ) {
                    me.directionLocked = 'h';           // lock horizontally
                } else if ( absDistY >= absDistX + me.options.directionLockThreshold ) {
                    me.directionLocked = 'v';           // lock vertically
                } else {
                    me.directionLocked = 'n';           // no lock
                }
            }

            if ( me.directionLocked == 'h' ) {
                if ( me.options.eventPassthrough == 'vertical' ) {
                    e.preventDefault ? e.preventDefault() : e.defaultValue = false;
                } else if ( me.options.eventPassthrough == 'horizontal' ) {
                    me.initiated = false;
                    return;
                }

                deltaY = 0;
            } else if ( me.directionLocked == 'v' ) {
                if ( me.options.eventPassthrough == 'horizontal' ) {
                    e.preventDefault ? e.preventDefault() : e.defaultValue = false;
                } else if ( me.options.eventPassthrough == 'vertical' ) {
                    me.initiated = false;
                    return;
                }

                deltaX = 0;
            }


            deltaX = me.hasHorizontalScroll ? deltaX : 0;
            deltaY = me.hasVerticalScroll ? deltaY : 0;

            newX = me.x + deltaX;
            newY = me.y + deltaY;

            // Slow down if outside of the boundaries
            if ( newX > 0 || newX < me.maxScrollX ) {
                newX = me.options.bounce ? me.x + deltaX / 3 : newX > 0 ? 0 : me.maxScrollX;
            }
            if ( newY > 0 || newY < me.maxScrollY ) {
                newY = me.options.bounce ? me.y + deltaY / 3 : newY > 0 ? 0 : me.maxScrollY;
            }

            me.directionX = deltaX > 0 ? -1 : deltaX < 0 ? 1 : 0;
            me.directionY = deltaY > 0 ? -1 : deltaY < 0 ? 1 : 0;

            if ( !me.moved ) {
                me.triggerHandler('smoothscrollstart', {x: me.x, y: me.y});
            }
            me.moved = true;
            me._translate(newX, newY);

            if ( timestamp - me.startTime > 300 ) {
                me.startTime = timestamp;
                me.startX = me.x;
                me.startY = me.y;
            }
        },

        _end: function(e) {
            var me = this;

            if ( !me.enabled || eventType[e.type] !== me.initiated ) {
                return;
            }

            var $doc = $(document),
            //point = e.changedTouches ? e.changedTouches[0] : e,
                momentumX,
                momentumY,
                duration = getTime() - me.startTime,
                newX = Math.round(me.x),
                newY = Math.round(me.y),
            //distanceX = Math.abs(newX - me.startX),
            //distanceY = Math.abs(newY - me.startY),
                time = 0,
                easing = '';

            $doc.off('.'+me.cid);

            me.isInTransition = 0;
            me.initiated = 0;
            me.endTime = getTime();

            // reset if we are outside of the boundaries
            if ( me.resetPosition(me.options.bounceTime) ) {
                return;
            }

            me.scrollTo(newX, newY);    // ensures that the last position is rounded

            if ( !me.moved ) {
                return;
            }

            // start momentum animation if needed
            if ( me.options.momentum && duration < 300 ) {
                momentumX = me.hasHorizontalScroll ? momentum(me.x, me.startX, duration, me.maxScrollX, me.options.bounce ? me.wrapperWidth : 0, me.options.deceleration) : { destination: newX, duration: 0 };
                momentumY = me.hasVerticalScroll ? momentum(me.y, me.startY, duration, me.maxScrollY, me.options.bounce ? me.wrapperHeight : 0, me.options.deceleration) : { destination: newY, duration: 0 };
                newX = momentumX.destination;
                newY = momentumY.destination;
                time = Math.max(momentumX.duration, momentumY.duration);
                me.isInTransition = 1;
            }

            if ( newX != me.x || newY != me.y ) {
                // change easing function when scroller goes out of the boundaries
                if ( newX > 0 || newX < me.maxScrollX || newY > 0 || newY < me.maxScrollY ) {
                    easing = easingType.quadratic;
                }

                me.scrollTo(newX, newY, time, easing);
                return;
            }

            me.triggerHandler('smoothscrollend', {x: me.x, y: me.y});
        },

        refresh: function() {
            //var rf = this.$wrapper[0].offsetHeight;           // Force reflow
            var me = this;

            me.wrapperWidth     = me.options.getWrapperWidth ? me.options.getWrapperWidth() : me.$wrapper.width();
            me.wrapperHeight    = me.options.getWrapperHeight ? me.options.getWrapperHeight() : me.$wrapper.height();

            me.scrollerWidth    = me.options.getScrollerWidth ? me.options.getScrollerWidth() : me.$scroller.width();
            me.scrollerHeight   = me.options.getScrollerHeight ? me.options.getScrollerHeight() : me.$scroller.height();


            me.maxScrollX               = me.wrapperWidth - me.scrollerWidth;
            me.maxScrollY               = me.wrapperHeight - me.scrollerHeight;

            me.hasHorizontalScroll      = me.options.scrollX && me.maxScrollX < 0;
            me.hasVerticalScroll                = me.options.scrollY && me.maxScrollY < 0;

            if ( !me.hasHorizontalScroll ) {
                me.maxScrollX = 0;
                me.scrollerWidth = me.wrapperWidth;
            }

            if ( !me.hasVerticalScroll ) {
                me.maxScrollY = 0;
                me.scrollerHeight = me.wrapperHeight;
            }

            me.endTime = 0;
            me.directionX = 0;
            me.directionY = 0;

            me.resetPosition();
        },

        _transitionEnd: function(e) {
            if ( e.target != this.$scroller[0] || !this.isInTransition ) {
                return;
            }

            this._transitionTime();
            if ( !this.resetPosition(this.options.bounceTime) ) {
                this.isInTransition = false;
                this.triggerHandler('smoothscrollend', {x: this.x, y: this.y});
            }
        },

        getMaxScrollX: function(){ return this.maxScrollX; },
        getMaxScrollY: function(){ return this.maxScrollY; }
    });

})(jQuery, window[LIB_NAME]);