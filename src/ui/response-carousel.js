/*!
 * @author ResponseCarousel
 * @email comahead@gmail.com
 * @create 2015-03-06
 * @license MIT License
 */
(function (ctx, $, core, undefined) {
    "use strict";

    var ResponseCarousel = core.ui('ResponseCarousel', {
        bindjQuery: 'responseCarousel',
        defaults: {
            maxItemWidth: 200,
            minItemWidth: 150,
            startIndex: 0,
            response: true,
            interval: 3000,
            duration: 500,
            activeClass: 'active',
            autoPlay: true
        },
        selectors: {
            items: '.ui_item',
            indicators: '.ui_indicator',
            indicatorsWrapper: '.ui_indicators_wrap',
            wrapper: '.ui_wrapper',
            wrapperOuter: '.ui_wrapper_outer',
			controls: '.ui_control'
        },
        events: {
            'click .ui_indicator': function(e) {
                e.preventDefault();

                var me = this;
                var index = $(e.currentTarget).index();
                me.moveByIndex(index);
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
                    me.prevItem();
                } else if($this.hasClass('ui_next')) {
                    me.nextItem();
                }
            }
        },
        initialize: function(el, options) {
            var me = this;
            if(me.supr(el, options) === false) { return; }

            if(me.$items.length === 0){ me.return; }

            me._init();
            if(me.options.response) {
                $(window).on('resizeend', function () {
                    me.update();
                    if(me.isAutoPlay) {
                        me.start();
                    }
                });
            }
            me.update();
            me._autoPlay();
        },

        _autoPlay: function(){
            var me = this;
            if(!me.isOverWrap){ return; }

            if(me.options.autoPlay) {
                me.start();
                me._toggleButton(me.isAutoPlay = true);

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
            }
        },

        _init: function() {
            var me = this;

            me.count = me.$items.length;
            me.index = me.options.startIndex;
            me.itemIndex = 0;
            me.rate = me.$el.width() / me.$el.height();
            me.isOverWrap = true;

            me.$wrapper.css({
                position: 'absolute',
                left: 0,
                top: 0
            });
            me.indicateTmpl = me.$indicatorsWrapper.html();
        },

        _makeIndicator: function(){
            var me = this;

            if(!me.isOverWrap){ return; }
            var pages = Math.ceil(me.count / me.perCount);
            var html = '';

            for(var i = 0; i < pages; i++) {
                html += me.indicateTmpl;
            }
            me.$indicatorsWrapper.html(html);
            me.updateSelectors();
        },

        _limit: function(i, min, max) {
            if(i < min) { return min; }
            else if(i > max) { return max; }
            return i;
        },

        moveByIndex: function(index, ani) {
            var me = this;
            if(!me.isOverWrap){ return; }

            me.index = me._limit(index, 0, me.maxIndex);
            me.itemIndex = me._limit(Math.floor(me.index * me.perCount), 0, me.maxItemIndex);
            me.moveLeft(me.itemIndex * me.itemWidth * -1, ani);
            console.log(me.index, me.itemIndex, me.maxItemIndex);
        },

        moveByItemIndex: function(itemIndex, ani) {
            var me = this;
            if(!me.isOverWrap){ return; }

            me.itemIndex = me._limit(itemIndex, 0, me.maxItemIndex);
            me.index = me.itemIndex === me.maxItemIndex ? me.maxIndex : Math.floor(me.itemIndex / me.perCount);
            me.moveLeft(me.itemIndex * me.itemWidth * -1, ani);
        },

        update: function() {
            this.stop();

            var me = this,
                wrapperOuterWidth = Math.round(me.$wrapperOuter.width()),
                wrapperWidth = Math.round(me.$wrapper.width()),
                per, itemWidth, fullWidth;

            if(me.wrapOuterWidth === wrapperOuterWidth){ return; }

            per = Math.floor(wrapperOuterWidth / me.options.maxItemWidth);
            itemWidth = Math.round(wrapperOuterWidth / per);
            fullWidth = me.count * itemWidth;

            if(wrapperOuterWidth > fullWidth) {
                me.$items.css('width', wrapperOuterWidth / me.count);
                me.$wrapper.css({'left': 0, 'width': '100%'});
                me.$controls.hide();
                me.isOverWrap = false;
                return;
            }
            else { me.$controls.show(); }

            me.isOverWrap = true;
            me.wrapOuterWidth = wrapperOuterWidth;
            me.perCount = per;
            me.itemWidth = itemWidth;
            me.maxIndex = Math.ceil(me.count / per) - 1;
            me.maxItemIndex = me.count - me.perCount;
            me.fullWidth = fullWidth;

            me.$items.css('width', itemWidth);
            me.$wrapper.css({
                'width': fullWidth,
                'height': ''//wrapperOuterWidth * me.rate
            });
            me._makeIndicator();
            me.moveByItemIndex(me.itemIndex, false);
        },

        moveLeft: function(left, ani){
            var me = this;
            if(!me.isOverWrap){ return; }

            if(ani === false) {
                me.$wrapper.stop().css('left', left);
                me._activeIndicator();
                me.isAnimating = false;
                return;
            }

            if(me.isAnimating) { return; }
            me.isAnimating = true;

            left = me._limit(left, me.wrapOuterWidth - me.fullWidth, 0);
            me.$wrapper.stop().animate({
                left: left
            }, me.options.duration, function() {
                me._activeIndicator();
                me.isAnimating = false;
            });

        },
        _activeIndicator: function(){
            var me = this;

            me.$indicators.removeClass(me.options.activeClass).eq(me.index).addClass(me.options.activeClass);
        },
        start: function(){
            var me = this;
            clearInterval(me.timer), me.timer = null;
            if(!me.isOverWrap){ return; }

            me.timer = setInterval(function() {
                me.next();
            }, me.options.interval); // 3초마다 롤링
        },
        /**
         * 롤링 중지
         */
        stop: function(){
            var me = this;
            clearInterval(me.timer); me.timer = null;
        },
        prev: function() {
            var me = this,
                index;
            if(!me.isOverWrap){ return; }

            if(me.index <= 0) { index = me.maxIndex; }
            else { index = me.index - 1; }

            me.moveByIndex(index);
        },
        next: function() {
            var me = this,
                index;
            if(!me.isOverWrap){ return; }

            if(me.index >= me.maxIndex) { index = 0; }
            else { index = me.index + 1; }
            me.moveByIndex(index);
        },
        prevItem: function(){
            var me = this,
                itemIndex;
            if(!me.isOverWrap){ return; }

            if(me.itemIndex <= 0) { itemIndex = me.maxItemIndex; }
            else { itemIndex = me.itemIndex - 1; }

            me.moveByItemIndex(itemIndex);
        },
        nextItem: function(){
            var me = this,
                itemIndex;
            if(!me.isOverWrap){ return; }

            if(me.itemIndex >= me.maxItemIndex) { itemIndex = 0; }
            else { itemIndex = me.itemIndex + 1; }

            me.moveByItemIndex(itemIndex);
        },
        _toggleButton: function(status) {
            var me = this;

            if(status) {
                me.$('.ui_play').attr('title', '배너 멈춤').replaceClass('ui_play', 'ui_pause').text('■');
            } else {
                me.$('.ui_pause').attr('title', '배너 시작').replaceClass('ui_pause', 'ui_play').text('▶');
            }
        }
    })

})(window, jQuery, window[LIB_NAME]);