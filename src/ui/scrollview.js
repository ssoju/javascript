/*!
 * @author scrollview
 * @email comahead@vi-nyl.com
 * @create 2014-12-11
 * @license MIT License
 */
(function ($, core, undefined) {
    "use strict";
    var $doc = $(document),
        $win = $(window),
        isTouch = core.browser.isTouch;

    // 커스텀 스크롤 클래스
    core.ui('Scrollview', {
        bindjQuery: 'scrollview',
        defaults: {

        },
        selectors: {
            scrollArea: '.ui_scrollarea',
            content: '.ui_content',
            scrollBar: '.ui_scrollbar'
        },
        initialize: function(el, options) {
            var me = this;

            if (me.supr(el, options) === false) {
                return;
            }

            me.containerHeight = me.$scrollArea.height();
            me.contentHeight = me.$content.height();
            if (me.contentHeight <= me.containerHeight) {
                me.$scrollBar.hide();
                me.release();
                return;
            }

            me.scrollRate = me.containerHeight / me.contentHeight;
            me.scrollBarHeight = me.containerHeight * me.scrollRate;
            me.scrollHeight = me.containerHeight - me.scrollBarHeight;
            me.isMouseDown = false;
            me.moveY = 0;

            me.$scrollBar.on('mousedown touchstart', function(e) {
                e.preventDefault();
                if (isTouch) {
                    e.stopPropagation();
                }

                me.isMouseDown = true;
                me.currY = parseInt($(this).css('top'), 10);
                me.downY = me._getY(e);
                return false;
            });

            $doc.on('mouseup touchend mousemove touchmove', function(e) {
                if (!me.isMouseDown) {
                    return;
                }

                switch (e.type) {
                    case 'mouseup':
                    case 'touchend':
                        me.isMouseDown = false;
                        me.moveY = 0;
                        break;
                    case 'mousemove':
                    case 'touchmove':
                        me.moveY = me._getY(e);
                        me._move(me.currY - (me.downY - me.moveY));

                        e.preventDefault();
                        break
                }
            });

            me.$scrollArea.on('scroll', function() {
                if (!me.isMouseDown) {
                    me.update();
                }
            }).on('mousewheel DOMMouseScroll', function(e) {
                e.preventDefault();
                e = e.originalEvent;
                var delta = e.wheelDelta || -e.detail;

                me.$scrollArea.scrollTop(me.$scrollArea.scrollTop() - delta);
            });

            if(isTouch) {
                me.$scrollArea.on('touchstart touchmove touchend touchcancel', function(){
                    var isTouchDown = false,
                        moveY = 0,
                        currY = 0,
                        downY = 0;
                    return function(e) {
                        //e.stopPropagation();
                        switch(e.type) {
                            case 'touchstart':
                                isTouchDown = true;
                                moveY = 0;
                                currY = me.$scrollArea.scrollTop();
                                downY = me._getY(e);
                                break;
                            case 'touchmove':
                                if(!isTouchDown) { return; }
                                moveY = me._getY(e);
                                me.$scrollArea.scrollTop(currY + (downY - moveY));
                                break;
                            case 'touchend':
                            case 'touchcancel':
                                isTouchDown = false;
                                moveY = 0;
                                break;
                        }
                    };
                }());
            }

            me.update();
        },

        update: function() {
            var me = this;

            me.contentTop = me.$scrollArea.scrollTop();
            me.$scrollBar.css('height', me.scrollBarHeight).find('span.bg_mid').css('height', me.scrollBarHeight - 11);
            me.$scrollBar.css('top', me.contentTop * me.scrollRate);
        },
        _move: function(top) {
            var me = this;

            top = Math.max(0, Math.min(top, me.scrollHeight));

            me.$scrollBar.css('top', top);
            me.$scrollArea.scrollTop((me.contentHeight - me.containerHeight) * (top / me.scrollHeight));
        },
        _getY: function(e) {
            if (isTouch && e.originalEvent.touches) {
                e = e.originalEvent.touches[0];
            }
            return e.pageY;
        }
    });



})(jQuery, window[LIB_NAME]);
