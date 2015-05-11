/*!
 * @author carousel.js
 * @email comahead@gmail.com
 * @create 2015-03-06
 * @license MIT License
 */
(function (ctx, $, core, undefined) {
    "use strict";

    var supportTransform = core.css3.support;

    var Carousel = core.ui('Carousel', {
        bindjQuery: 'carousel',
        defaults: {
            interval: 3000, // 롤링주기
            duration: 600,   // 롤링시간
            effect: 'slide', //'fadeInOut',
            activeClass: 'active',
            easingOpt: 'easeInOutQuad',
            btnPlay: '.ui_play',
            btnPause: '.ui_pause',
            autoPlay: true,
            random: false
        },
        selectors: {
            wrapper: '.ui_wrapper',
            items: '.ui_item',
            controls: '.ui_control',
            indicators: '.ui_indicator'
        },
        events: {
            'click .indicators > .ui_indicator': function(e) {
                e.preventDefault();
                var me = this,
                    $this = $(e.currentTarget),
                    index;

                if (me.isAnimating) { return false; }

                if (!$this.hasClass(me.options.activeClass)) {
                    //me.stop();
                    index = me.$indicators.index($this);
                    me.roll(index, me.index > index ? 'right' : '');
                }
            },
            'click .ui_control': function(e) {
                e.preventDefault();
                var me = this,
                    $this = $(e.currentTarget);
                if($this.hasClass('ui_pause')){
                    me._toggleButton(me.isAutoPlay = false);
                    me.stop();
                } else if($this.hasClass('ui_play')){
                    me._toggleButton(me.isAutoPlay = true);
                    me.start();
                } else if($this.hasClass('ui_prev')) {
                    me.prev();
                } else if($this.hasClass('ui_next')) {
                    me.next();
                }
            }
        },
        /**
         * 생성자
         * @param {String|Element|jQuery} el 해당 엘리먼트(노드, id, jQuery 어떤 형식이든 상관없다)
         * @param {Object} options 옵션값
         */
        initialize: function(el, options) {
            var me = this;

            if(me.supr(el, options) === false) { return; }

            if(me.$items.length <= 1) { // 아이템이 1개 이하면 무시
                me.$controls.hide();
                return;
            }

            me._init(); // 초기화 작업
            if (me.options.autoPlay === true) {
                me._toggleButton(me.isAutoPlay = true);
                me.start();
            }                                // 롤링 시작

            // 롤링영역에 마우스가 오버됐거나 포커스가 들어오면 롤링을 일시 중지 시킨다.
            me.$el.on('mouseenter focusin mouseleave focusout', function(e){
                switch(e.type) {
                    case 'mouseenter':
                    case 'focusin':
                        me.stop();
                        break;
                    default:
                        me.isAutoPlay && me.start();
                        break;
                }
            });

        },

        _init: function(){
            var me = this;

            me.index = 0;
            me.count = me.$items.length;       // 총 아이템 갯수

            me.$wrapper.css({
                position: 'relative',
                overflow: 'hidden',
                width: me.width = me.$items.eq(0).width(),
                height: me.height = me.$items.eq(0).height()
            });

            me.$items.hide().css({left:0, top:0}).eq(me.index).show();
            me._activeIndicator(me.index);
        },

        /**
         * 롱링 시작
         */
        roll: function(index, direction){
            if(this.isAnimating) { return; }
            this.isAnimating = true;

            var me = this,
                $curr = me.$items.eq(me.index),
                nextIndex;

            if (index !== undefined) {
                nextIndex = index;
            }else {
                nextIndex = (me.index + 1 <= me.count - 1 ? me.index + 1 : 0);
            }
            var $next = me.$items.eq(nextIndex), // 다음 아이템
                css = {}, currCss = {}, nextCss = {};

            if(me.options.effect === 'fadeInOut') {
                currCss = {opacity: 0};
                css = {opacity: 0,display: 'block'};
                nextCss = {opacity: 1};
            } else {
                currCss = {left: direction === 'right' ? me.width : -me.width};
                css = {'display': 'block', 'left': direction === 'right' ? -me.width : me.width};
                nextCss = {left: 0};
            }

            $curr.stop().animate(currCss, me.options.duration, function() {
                $curr.hide();
            });
            $next.stop().css(css).animate(nextCss, me.options.duration, function() {
                me._activeIndicator(me.index = nextIndex);
                me.isAnimating = false;
            });
        },
        _activeIndicator: function(index){
            this.$indicators.removeClass(this.options.activeClass).eq(index).addClass(this.options.activeClass);
        },
        start: function(){
            var me = this;
            clearInterval(me.timer), me.timer = null;

            me.timer = setInterval(function() {
                me.roll();
            }, me.options.interval); // 3초마다 롤링
        },
        /**
         * 롤링 중지
         */
        stop: function(){
            var me = this;
            clearInterval(me.timer); me.timer = null;
        },
        prev: function(){
            var me = this;

            me.roll(me.index - 1 < 0 ? me.count - 1 : me.index - 1, 'right');
        },
        next: function(){
            var me = this;

            me.roll(me.index + 1 >= me.count ? 0 : me.index + 1);
        },
        _toggleButton: function(status) {
            var me = this;

            if(status) {
                me.$('.ui_play').attr('title', '배너 멈춤').replaceClass('ui_play', 'ui_pause').text('■');
            } else {
                me.$('.ui_pause').attr('title', '배너 시작').replaceClass('ui_pause', 'ui_play').text('▶');
            }
        }
    });


})(window, jQuery, window[LIB_NAME]);