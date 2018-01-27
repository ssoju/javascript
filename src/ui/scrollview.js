/*!
 * @author scrollview
 * @email comahead@gmail.com
 * @create 2012-12-11
 * @license MIT License
 */
(function ($, core, undefined) {
    "use strict";
    var $doc = $(document),
        $win = $(window),
        isTouch = core.browser.isTouch,
	KEY_PAGEUP = 33,
	KEY_PAGEDOWN = 34,
	KEY_UP = 38,
	KEY_DOWN = 40;

    // 커스텀 스크롤 클래스
    core.ui('Scrollview', {
        bindjQuery: true,  //$('..').Scrollvw()
        defaults: {
	    vscroll: true,
	    hscroll: fale,
	    momentium: true,
	    autohide: true
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
		
            me.isMouseDown = false;
            me.moveY = 0;
            me._calcSizes();

            me.smoothAnimator = new core.ui.SmoothAnimator({
		max: me.$scrollArea.prop('scrollHeight') - me.containerHeight, 
		min: 0
	    });
            me.smoothAnimator.on('move', function(e, data) {
                me.$scrollArea.scrollTop(data.delta);
            });

            new core.ui.Gesture(me.$scrollBar, {
                direction: 'vertical'
            }).on((function(){
                var startY = 0;
                return {
                    'gesturestart': function(e) {
                        me.isMouseDown = true;
                        startY = parseInt(me.$scrollBar.css('top'), 10);
                    },
                    'gesturemove': function(e, data) {
                        me._move(startY + data.diff.y);
                    },
                    'gestureend': function(){
                        me.isMouseDown = false;
                    }
                };
            })());

            me.$scrollArea.on('scroll', function() {
                if (!me.isMouseDown) {
                    me._updateScrollBar();
                }
                me.smoothAnimator.goto(me.$scrollArea.scrollTop(), false);
            }).on('mousewheel DOMMouseScroll', function(e) {
                e.preventDefault();
                e = e.originalEvent;
                var delta = e.wheelDelta || -e.detail;

                me.smoothAnimator.goto(me.$scrollArea.scrollTop() - delta);
            });

            new core.ui.Gesture(me.$scrollArea, {
                direction: 'vertical'
            }).on((function() {
                return {
                    'gesturestart': function(e) {
                        me.smoothAnimate.start(0, me.$scrollArea.scrollTop());
                    },
                    'gesturemove': function(e, data) {
                        me.smoothAnimate.move(data.diff.y);
                    },
                    'gestureend': function(e) {
                        me.smoothAnimate.end();
                    }
                }
            })());

            if(!isTouch) {
				me.$el.attr('tabindex', 0).on('keyup', function(e) {
					var isUpDown = e.which === KEY_UP || e.which === KEY_DOWN,
						isPageUpDown = e.which === KEY_PAGEUP || e.which === KEY_PAGEDOWN,
						isUp = e.which === KEY_UP || e.which === KEY_PAGEUP;;

					if(!isUpDown && !isPageUpDown){ return; }
					if(e.target !== this && e.target.className.indexOf('ui_scrollbar') < 0){ return; }

					me.scroll(isUp ? 'up' : 'down', isUpDown ? .1 : .5);
				});
			}

            me._updateScrollBar();
        },

		scroll: function(dir, r){
			var me = this;
			dir = dir === 'up' ? -1 : 1;
			r = r || .1;
			
			me.$scrollArea.scrollTop(me.$scrollArea.scrollTop() + (me.containerHeight * r * dir));
		},

        _updateScrollBar: function() {
            var me = this;

            me.$scrollBar.css({
				'height': me.scrollBarHeight,
				'top': me.$scrollArea.scrollTop() * me.scrollRate
			}).find('span.bg_mid').css('height', me.scrollBarHeight - 11);
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
