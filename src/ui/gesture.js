/**
 * Created by comahead on 2013-05-05.
 */
(function($, core, undefined) {
    "use strict";

    function getDiff(a, b) {
        return {
            x: a.x - b.x,
            y: a.y - b.y
        };
    }

    function getTouchCoords(e) {
        var touches = e.changedTouches || e.originalEvent.changedTouches,
            touch;

        if(!touches || touches.length !== 1) {
            return;
        }

        touch = touches[0];

        return {
            x: touch.screenX,
            y: touch.screenY
        };
    }

    function getCoords(e) {
        return {
            x: e.screenX,
            y: e.screenY
        };
    }

    function getDirection(diff, dir) {
        if(dir === 'horizontal') {
            if (diff.x < 0) {
                return 'left';
            }
            else if (diff.x > 0) {
                return 'right';
            }
        } else {
            if (diff.y < 0) {
                return 'down';
            }
            else if (diff.y > 0) {
                return 'up';
            }
        }
    }

    var Gesture = core.ui('Gesture', {
        defaults: {
            direction: 'horizontal'
        },
        initialize: function(el, options) {
            var me = this;
            if (me.supr(el, options) === false) {
                return;
            }

            if('ontouchstart' in window) {
                me._bindGestureTouchEvents();
            } else {
                me._bindGestureEvents();
            }
        },
        _bindGestureEvents: function() {
            var me = this,
                touchStart,
                downPos,
                isSwipe = false,
                isScroll = false,
                $doc = $(document);

            me.$el.on('mousedown.gesture', function(downEvent) {
                //e.preventDefault();
                downPos = touchStart = getCoords(downEvent);
                isSwipe = isScroll = false;

                $doc.off('.gesture'+me.cid).on('mousemove.gesture'+me.cid, function (moveEvent) {
                    var touch = getCoords(moveEvent),
                        diff, slope;

                    if (!touchStart || isScroll) {
                        return;
                    }

                    diff = getDiff(touch, touchStart);
                    if (!isSwipe) {
                        if(me.options.direction === 'horizontal') {
                            slope = Math.abs(diff.y) / Math.abs(diff.x);
                        } else {
                            slope = Math.abs(diff.x) / Math.abs(diff.y);
                        }
                        if (slope < 1) {
                            isSwipe = true;
                            me.trigger('gesturestart', touch);
                        } else {
                            isScroll = true;
                        }
                    }

                    if (isSwipe) {
                        moveEvent.stopPropagation();
                        moveEvent.preventDefault();

                        touch.diff = diff;
                        touch.direction = getDirection(diff, me.options.direction);
                        me.trigger('gesturemove', touch)
                    }
                }).on('mouseup.gesture'+me.cid, function (upEvent) {

                    if (isSwipe && touchStart) {
                        var touch = getCoords(upEvent);
                        touch.diff = getDiff(touch, touchStart)
                        touch.direction = getDirection(touch.diff, me.options.direction);
                        me.trigger('gestureend', touch);
                    }

                    touchStart = null;
                    isScroll = false;

                    $doc.off('.gesture'+me.cid)
                });
            }).on('click', 'a, button', function(e) {
                var pos = getCoords(e);
                if(downPos.x != pos.x || downPos.y != pos.y) {
                    e.preventDefault();
                }
            });
        },
        _bindGestureTouchEvents: function() {
            var me = this,
                touchStart,
                isSwipe = false,
                isScroll = false;

            me.$el.on({
                'touchstart.gesture': function(startEvent) {
                    touchStart = getTouchCoords(startEvent);
                    isSwipe = isScroll = false;

                    me.$el.on({
                        'touchmove.gesture': function (moveEvent) {
                            var touch = getTouchCoords(moveEvent),
                                diff, slope;

                            if (!touchStart || isScroll) {
                                return;
                            }

                            diff = getDiff(touch, touchStart);
                            if (!isSwipe) {
                                if(me.options.direction === 'horizontal') {
                                    slope = Math.abs(diff.y) / Math.abs(diff.x);
                                } else {
                                    slope = Math.abs(diff.x) / Math.abs(diff.y);
                                }
                                if (slope < 1) {
                                    isSwipe = true;
                                    me.trigger('gesturestart', touch);
                                } else {
                                    isScroll = true;
                                }
                            }

                            if (isSwipe) {
                                moveEvent.stopPropagation();
                                moveEvent.preventDefault();

                                touch.diff = diff;
                                touch.direction = getDirection(diff, me.options.direction);
                                me.trigger('gesturemove', touch)
                            }
                        }
                    }).on('touchend.gesture touchcancel.gesture', function (endEvent) {

                        if (isSwipe && touchStart) {
                            var touch = getTouchCoords(endEvent);
                            touch.diff = getDiff(touch, touchStart)
                            touch.direction = getDirection(touch.diff);
                            me.trigger('gestureend', touch);
                        }

                        touchStart = null;
                        isScroll = false;
                    });
                }
            });

        },

        release: function(){
            this.off('.gestire');
            this.supr();
        }
    });

    core.ui.Gesture = Gesture;
})(jQuery, window[LIB_NAME]);