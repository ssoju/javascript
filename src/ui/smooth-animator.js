/**
 * Created by comahead on 2013-05-11.
 */
(function($, core, undefined) {
    "use strict";

    (function(window) {
        if(window.requestAnimationFrame) { return; }

        var lastTime = 0,
            vendors = ['webkit', 'moz'],
            requestAnimationFrame = window.requestAnimationFrame,
            cancelAnimationFrame = window.cancelAnimationFrame,
            i = vendors.length;

        while (--i >= 0 && !requestAnimationFrame) {
            requestAnimationFrame = window[vendors[i] + 'RequestAnimationFrame'];
            cancelAnimationFrame = window[vendors[i] + 'CancelRequestAnimationFrame'];
        }

        if (!requestAnimationFrame || !cancelAnimationFrame) {
            requestAnimationFrame = function(callback) {
                var now = +Date.now(),
                    nextTime = Math.max(lastTime + 16, now);
                return setTimeout(function() {
                    callback(lastTime = nextTime);
                }, nextTime - now);
            };

            cancelAnimationFrame = clearTimeout;
        }

        window.requestAnimationFrame = requestAnimationFrame;
        window.cancelAnimationFrame = cancelAnimationFrame;
    }(window));

    var SmoothAnimator = core.Base.extend({
        initialize: function(options) {
            var me = this;

            me.options = core.extend({
                max: 0,
                min: 0,
                timeConstant: 325
            }, options);

            core.extend(me, {
                pos: 0,
                prevPos: 0,
                started: false,
                speed: 0, // 속도
                startPos: 0,
                timestamp: 0,
                ticker: 0,
                amplitude: 0, // 크기
                target: 0,
                timeConstant: me.options.timeConstant  // ms
            });

            me.$event = $(this);
        },

        trigger: function(){
            this.$event.trigger.apply(this.$event, arguments);
        },

        on: function() {
            this.$event.on.apply(this.$event, arguments);
        },

        off: function() {
            this.$event.off.apply(this.$event, arguments);
        },

        one: function() {
           this.$event.one.apply(this.$event, arguments);
        },

        _triggerMove: function(pos, trigger) {
            this.pos = (pos > this.options.max) ? this.options.max : (pos < this.options.min) ? this.options.min : pos;
            if(trigger !== false) {
                this.trigger('move', {delta: this.pos});
            }
        },

        _track: function () {
            var me = this,
                now, elapsed, delta, v;

            now = Date.now();
            elapsed = now - me.timestamp;
            me.timestamp = now;
            delta = me.pos - me.startPos;
            me.startPos = me.pos;

            v = 1000 * delta / (1 + elapsed);
            me.speed = 0.8 * v + 0.2 * me.speed;
        },

        start: function(pos) {
            var me = this;

            me.amplitude = 0;
            me.started = true;
            me.prevPos = pos;

            me.speed = me.amplitude = 0;
            me.startPos = me.pos;
            me.timestamp = Date.now();
            clearInterval(me.ticker);
            me.ticker = setInterval(me._track.bind(me), 100);
        },

        move: function(pos) {
            var me = this,
                p, delta;
            if(me.started) {
                delta = me.prevPos - pos;
                if(delta > 2 || delta < -2) {
                    me.prevPos = pos;
                    me._triggerMove(me.pos + delta);
                }
            }
        },

        end: function() {
            var me = this;

            me.started = false;
            clearInterval(me.ticker);
            if(me.speed > 10 || me.speed < -10) {
                me.amplitude = 0.8 * me.speed;
                me.target = Math.round(me.pos + me.amplitude);
                me.timestamp = Date.now();
                requestAnimationFrame(me._moving.bind(me));
            }
        },

        goto: function(pos, trigger) {
            this.amplitude = 0;
            this._triggerMove(pos, trigger);
        },

        _moving: function() {
            var me = this,
                elapsed, delta;

            if(me.amplitude) {
                elapsed = Date.now() - me.timestamp;
                delta = -me.amplitude * Math.exp(-elapsed / me.timeConstant);
                if(delta > 0.5 || delta < -0.5) {
                    //me._scroll(me.target + delta);
                    me._triggerMove(me.target + delta);
                    requestAnimationFrame(me._moving.bind(me));
                } else {
                    me._triggerMove(me.target);
                }
            }
        }
    });

    core.ui.SmoothAnimator = SmoothAnimator;

})(jQuery, window[LIB_NAME]);
