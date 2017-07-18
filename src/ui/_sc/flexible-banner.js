/*!
 * @author banner.js
 * @email comahead@vinylc.com
 * @create 2015-01-08
 * @license MIT License
 */
(function ($, core, undefined) {
    "use strict";

    var ctx = window,
        $win = $(window),
        $doc = $(document),
        ui = core.ui,
        dateUtil = core.date,
        browser = core.browser,
        isTouch = browser.isTouch;

    //FlexibleBanner ////////////////////////////////////////////////////////////////////////////////
    /**
     * @class
     * @name vinyl.ui.FlexibleBanner
     * @description 페이징모듈
     * @extends vinyl.ui.View
     */
    var FlexibleBanner = core.ui('FlexibleBanner', /** @lends vinyl.ui.FlexibleBanner# */{
        bindjQuery: 'flexibleBanner',
        $statics: /** @lends vinyl.ui.FlexibleBanner */{
            ON_BANNER_CHANGED: 'flexibleBannerchange'
        },
        defaults: {
            selectedIndex: 0,
            setViewCount: 1,
            autoHeight: true,
            notFlexible: 0,
            notFlexibleCondition: 'MIN',
            notFlexibleMobile: false,
            notFlexiblePc: false
        },
        events: {
        },
        selectors: {
            content: '.ui_flex_content',
            btnPrev: '.ui_prev',
            btnNext: '.ui_next',
            indi: '.ui_indi'
        },
        /**
         * 생성자
         * @param el
         * @param options
         */
        initialize: function(el, options) {
            var me = this,
                callback;

            if(me.supr(el, options) === false) { return me.release(); }

            me.newIndex = me.nowIndex = me.options.selectedIndex;
            me.contentPosition = me.$content.css('position');
            me.isAnimation = true;
            me.isMaxOver = true;
            me.maxCount = me.$content.length - 1;


            me.$el.swipeGesture({
                container: me.$el,
                swipe: function (phase, data) {
                    var direction, distance;

                    switch(phase) {
                        case 'left':
                            if (me.isAnimation && me.isMaxOver) {
                                me.isAnimation = false;
                                me.newIndex = (me.nowIndex + me.perCount) > me.maxCount ? (me.nowIndex + me.perCount - me.maxCount - 1) : me.nowIndex + me.perCount;
                                me.selectContent(me.newIndex, 'NEXT');
                            }
                            break;
                        case 'right':
                            if (me.isAnimation && me.isMaxOver) {
                                me.isAnimation = false;
                                me.newIndex = (me.nowIndex - 1) < 0 ? me.maxCount : me.nowIndex - 1;
                                me.selectContent(me.newIndex, 'PREV');
                            }
                            break;
                    }
                }
            });

            // 인디게이터에 이벤트 바인드
            me.$indi.on('click.' + me.cid, '> .indi, button.sub_indi', function(e) {
                e.preventDefault();
                if (me.isAnimation && $(e.currentTarget).index() !== me.nowIndex) {
                    me.isAnimation = false;
                    me.selectContent($(e.currentTarget).index(), 'INDI');
                }
            });

            // 이전 다음 버튼에 이벤트 바인드
            me.$btnPrev.on('click.' + me.cid, function (e) {
                e.preventDefault();

                if (me.isAnimation && me.isMaxOver) {
                    me.isAnimation = false;
                    me.newIndex = (me.nowIndex - 1) < 0 ? me.maxCount : me.nowIndex - 1;
                    me.selectContent(me.newIndex, 'PREV');
                }
            });

            me.$btnNext.on('click.' + me.cid, function (e) {
                e.preventDefault();

                if (me.isAnimation && me.isMaxOver) {
                    me.isAnimation = false;
                    me.newIndex = (me.nowIndex + me.perCount) > me.maxCount ? (me.nowIndex + me.perCount - me.maxCount - 1) : me.nowIndex + me.perCount;
                    me.selectContent(me.newIndex, 'NEXT');
                }
            });

            $win.on('changemediasize.' + me.cid, callback = function (e) {
                var data = core.ui.mediaInfo;

                if (me._notFlexibleCheck(data)) {
                    me._notFlexible();
                } else {
                    me.nowIndex = 0;
                    me.perCount = me._perCount(data.mode);
                    me.isMaxOver = (me.perCount <= me.maxCount) ? true : false;
                    me._setContent();
                }
            });
            callback();
        },

        /**
         * Flexible가 아닌 경우
         */
        _notFlexible: function() {
            var me = this;

            me.$content.parent().parent().css({'height': ''});
            $.each(me.$content,function (idx, that) {
                $(that).css({'left': '', 'position': '', 'top': ''});
            });
        },

        /**
         * Flexible적용 확인
         */
        _notFlexibleCheck: function (data) {
            var me = this;

            if (me.options.notFlexibleMobile && scui.isMobileMode()) {
                return true;
            } else if (me.options.notFlexiblePc && !scui.isMobileMode()) {
                return true;
            } else if (me.options.notFlexibleCondition === 'MIN') {
                if (me.options.notFlexible !== 0 &&  me.options.notFlexible <= data.min) {
                    return true;
                } else {
                    return false;
                }
            } else {
                if (me.options.notFlexible !== 0 &&  me.options.notFlexible >= data.max) {
                    return true;
                } else {
                    return false;
                }
            }
        },

        /**
         * 크기에 따른 컨턴츠 위치 계산
         */
        _setContent: function() {
            var me = this;

            // 컨텐츠 크기 계산(컨텐츠 + right Margin) 및 위치값 계산
            me.contentWidth = 100 / me.perCount;
            me.leftPosition = 0;
            //me.$content.find(':focusable').attr('tabindex', -1).end().eq(0).find('[tabindex=-1]').removeAttr('tabindex');

            // 컨텐츠 위치 값 및 크기 조정
            me.options.autoHeight && scui.util.waitImageLoad(me.$content.find('img')).done(function() {
                me.$el.find('ul').parent().css({'height': me.$content.height()});
            });
            me.$content.stop(true, true).css({'position' : 'absolute', 'top' : '0px'});
            $.each(me.$content,function (idx, that) {
                $(that).css({'left': me.leftPosition + '%'});
                me.leftPosition += me.contentWidth;
            });

            me.setIndi();
        },

        /**
         * index에 해당하는 컨텐츠를 활성화
         * @param {number} index 탭버튼 인덱스
         */
        selectContent: function(index, direction) {
            var me = this, e;

            me.$indi.find('.indi').removeClass('on').eq(index).addClass('on');
            //me.$content.find(':focusable').attr('tabindex', -1);
            me.left = (direction === 'PREV') ? 100 / me.perCount : -100 / me.perCount;

            if (direction === 'INDI') {
                me.left = (index < me.nowIndex) ? (100 * (me.nowIndex - index)) / me.perCount :  (-100 * (index - me.nowIndex)) / me.perCount;
                me.oldIndex = me.nowIndex;
                me.nowIndex = index;
            } else if (direction === 'PREV') {
                me.$content.eq(index).css({'left': -me.left + '%'});
                me.oldIndex = me.nowIndex + me.perCount;
                me.nowIndex = (me.nowIndex - 1 < 0) ? me.maxCount : me.nowIndex - 1;
            } else {
                me.$content.eq(index).css({'left': '100%'});
                me.oldIndex = me.nowIndex;
                me.nowIndex = (me.nowIndex + 1 > me.maxCount) ? 0 : me.nowIndex + 1;
            }

            me.$content.stop(true, true).animate({
                'left' : '+=' + me.left + '%'
            }, 300, function () {
                me.isAnimation = true;
                me.setIndi();
                //me.$content.eq(index).find(':focusable').removeAttr('tabindex');
            });
        },

        /**
         * 위치값 설정 및 인디게이터 생성
         * @param {number} index 탭버튼 인덱스
         */
        setIndi: function() {
            var me = this, e;

            me.$indi.find('span.indi, button.sub_indi').removeClass('on').eq(me.nowIndex).addClass('on');
        },

        _perCount: function(mode) {
            var me = this;

            me.$content.eq(0).css('width', '');
            return Math.round(me.$content.parent().parent().width() / me.$content.eq(0).width());
        }
    });
    ///////////////////////////////////////////////////////////////////////////////////////

    if (typeof define === "function" && define.amd) {
        define([], function() {
            return FlexibleBanner;
        });
    }

})(jQuery, window[LIB_NAME]);