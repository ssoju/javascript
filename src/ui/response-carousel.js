/*!
 * @mdule axl.ui.ResponseCarousel
 * @author comahead@vi-nyl.com(김승일 책임)
 */
(function($, core) {
    "use strict";

    if (core.ui.ResponseCarousel) {
        return;
    }

    var $win = $(window),
        $doc = $(document),
        css3 = core.css3;

    /**
     * 반응형 Carousel
     */
    var ResponseCarousel = core.ui('ResponseCarousel', {
        bindjQuery: 'responseCarousel',
        defaults: {
            autoPlay: false, // 자동 스라이드 여부
            interval: 5000, // 자동 슬라이드 간격
            duration: 300, // 애니메이션 시간
            addHeight: 110 //
        },
        selectors: {
            con: '.banner_list', // 컨테이너
            items: '.banner_list>li', // 아이템
            indiCon: '.bnr_control' // 인디케이터 박스
        },
        initialize: function(el, options) {
            var me = this;
            if (me.supr(el, options) === false) {
                return;
            }

            me.pageIndex = 0; // 현재 페이지 인덱스
            me.totalPage = 0; // 총 페이지 수
            me.totalCount = me.$items.length; // 총 갯수
            me.perCount = 0;

            me.$items.eq(0).find('img').onImgLoaded(function() {

                me.isImgLoaded = true;
                me.perCount = me._perCount();
                me._bindEvents();
                me._refresh();
                me._createIndicator();

                me.$el.css({
                    position: 'relative'
                });
                me.$con.css({
                    'left': 0,
                    'position': 'absolute'
                });
                me.$items.each(function(i) {
                    $(this).attr('data-index', i);
                });
                me.$con.css('visibility', '');
                me._hideOuter();
                me.options.autoPlay && me.play();
            });

        },
        _bindEvents: function() {
            var me = this,
                changemediasizeCallback;

            // 인디케이터 재계산
            $win.on('changemediasize.' + me.cid, changemediasizeCallback = function(e) {
                var data = core.ui.mediaInfo;
                me.perCount = me._perCount(data.mode);
                me._createIndicator();
            });
            changemediasizeCallback();

            // UI 재배치
            $win.on('resize.' + me.cid, function() {
                me._refresh();
            }).on('resizeend.' + me.cid, function(e) {
                me._refresh();
                me._createIndicator();
                me.moveIndex(Math.min(me.pageIndex, me.totalPage - 1), false);
            });

            // 인디케이터 클릭시 해당 페이지로 슬라이딩
            me.$indiCon.on('click', 'a', function(e) {
                e.preventDefault();
                var index = $(this).parent().index();
                me.moveIndex(index);
            });

            var isAutoPlay;
            // hate IE
            me.on('mousedown selectstart', function(e) {
                e.preventDefault();
            });
            // 자동 재생 모드일 때, 마우스가 올라오면 일시적으로 정지 시키고 나가면 원복시킨다.
            me.options.autoPlay && me.on('mouseenter touchstart mouseleave touchend touchcancel', function(e) {
                switch (e.type) {
                    case 'mouseenter':
                    case 'touchstart':
                        if (me.playTimer) {
                            isAutoPlay = true;
                            me.stop();
                        } else {
                            isAutoPlay = false;
                        }
                        break;
                    case 'mouseleave':
                    case 'touchstart':
                    case 'touchend':
                        if (isAutoPlay === true) {
                            me.play();
                        }
                        break;
                }
            });

            var startLeft, currLeft, prevX, isEast;
            // 스와이핑 바인딩
            me.$con.swipeGesture().on('swipegesturestart swipegesturemove swipegestureend swipegesturecancel', function(e, data) {
                switch (e.type) {
                    case 'swipegesturestart':
                        startLeft = css3.position(me.$con).x; //parseInt(me.$con.css('left'), 10);
                        prevX = data.x;
                        break;
                    case 'swipegesturemove':
                        var limit = me.conWidth - me.totalWidth;
                        currLeft = (startLeft + data.diff.x);
                        if (currLeft > 0) {
                            currLeft = currLeft / 3;
                        } else if (currLeft < limit) {
                            currLeft = currLeft + Math.abs(limit);
                            currLeft = limit + (currLeft / 3);
                        }
                        isEast = data.x < prevX;
                        prevX = data.x;
                        me.move(currLeft, false);
                        break;
                    case 'swipegestureend':
                    case 'swipegesturecancel':
                        var index;
                        if (isEast /*data.direction === 'left'*/ ) {
                            index = Math.ceil(Math.abs(currLeft) / me.conWidth);
                            me.moveIndex(index);
                        } else /*if (data.direction === 'right')*/ {
                            index = Math.floor(Math.abs(currLeft) / me.conWidth);
                            me.moveIndex(index);
                        }
                        /* else {
                                                    me.moveIndex(me.pageIndex);
                                                }*/
                        break;
                }
            });
        },
        /**
         * 인디케이터 생성
         * @private
         */
        _createIndicator: function() {
            var me = this,
                html = '';

            for (var i = 0; i < me.totalPage; i++) {
                html += '<span class="' + (i === me.pageIndex ? 'on' : '') + '">' +
                    '<a href="#"><span class="hide">' + (i === me.pageIndex ? '현재페이지' : '') + '</span>' + (i + 1) + '</a></span>';
            }
            me.$indiCon.html(html);
        },
        /**
         * 재생
         */
        play: function() {
            var me = this;

            if (me.playTimer) {
                return;
            }
            me.playTimer = setInterval(function() {
                me.next();
            }, me.options.interval);
        },
        /**
         * 정지
         */
        stop: function() {
            var me = this;
            clearInterval(me.playTimer);
            me.playTimer = null;
        },
        /**
         * 다음
         */
        next: function() {
            var me = this,
                index = me.pageIndex + 1;
            if (index >= me.totalPage) {
                index = 0;
            }
            me.moveIndex(index);
        },
        /**
         * 이전
         */
        prev: function() {
            var me = this,
                index = me.pageIndex - 1;
            if (index < 0) {
                index = me.totalPage - 1;
            }
            me.moveIndex(index);
        },
        /**
         * 페이지 이동
         * @param newIndex 이동할 페이지 인덱스
         * @param isAni 애니메이션 동작 여부
         */
        moveIndex: function(newIndex, isAni) {
            var me = this;

            if (
                /*me.isAnimate
                                 || */
                me.conWidth > me.totalWidth) {
                me.move(0, false);
                return;
            }

            if (newIndex < 0) {
                newIndex = 0;
            }
            if (newIndex >= me.totalPage) {
                newIndex = me.totalPage - 1;
            }

            me.pageIndex = newIndex;
            var newLeft = newIndex * (me.itemWidth * me.perCount);
            if (newLeft > me.totalWidth - me.conWidth) {
                newLeft = me.totalWidth - me.conWidth;
            }

            me.isAnimate = true;
            ////me.$items.css('display', '');
            me.move(-newLeft, isAni);
        },

        /**
         * 슬라이딩
         * @function
         * @param newLeft 이동할 위치
         * @param isAni 애니메이션 동작 여부
         */
        move: css3.support ? function(newLeft, isAni) {
            var me = this;
            css3.move(me.$con, newLeft, 0, isAni !== false ? me.options.duration / 1000 : 0, function() {
                me._transitionEnd();
            });
        } : function(newLeft, isAni) {
            var me = this;
            if (isAni !== false) {
                me.$con.stop().animate({
                    left: newLeft
                }, me.options.duration, function() {
                    me._transitionEnd();
                });
            } else {
                me.$con.stop().css('left', newLeft);
            }

        },
        /**
         * 슬라이드가 끝났을 때 실행
         * @private
         */
        _transitionEnd: function() {
            var me = this;

            me.isAnimate = false;
            //me._hideOuter(-newLeft);
            me.$indiCon.children().removeClass('on').find('span.hide').html('').end()
                .eq(me.pageIndex).addClass('on').find('span.hide').html('현재 페이지');
        },
        /**
         * 가시영역 밖에 포커스가 안가도록 하기 위해 숨김
         * @param conLeft
         * @private
         */
        _hideOuter: function(conLeft) {
            return;

            var me = this;
            if (!conLeft) {
                conLeft = parseInt(me.$con.css('left'), 10);
            }
            conLeft = Math.abs(conLeft);
            me.$items.filter(function() {
                var $el = $(this),
                    left = parseInt($el.css('left'), 10) - conLeft;
                return !(left >= 0 && left < me.conWidth);
            }).css('display', 'none');
        },
        /**
         * 해상도에 따라 몇개 표시할지 계산
         * @returns {number}
         * @private
         */
        _perCount: function() {
            var me = this;

            me.$items.eq(0).css('width', '');

            return Math.round(me.$el.width() / me.$items.eq(0).width());
        },
        /**
         * 현재 UI들의 치수를 다시 계산
         * @private
         */
        _refresh: function() {
            var me = this;

            if (!me.isImgLoaded) {
                return;
            }

            me.conWidth = me.$el.width();
            me.itemWidth = Math.floor(me.conWidth / me.perCount);
            me.itemHeight = me.$items.eq(0).height();
            me.totalPage = Math.ceil(me.totalCount / me.perCount);
            me.totalWidth = (me.itemWidth * me.totalCount);

            me.$items.stop().css('width', me.itemWidth).each(function(i) {
                var left = (me.itemWidth) * i;
                me.$items.eq(i).css('left', left); // + me.conWidth);
            });

            me.$el.css({
                height: me.itemHeight + me.options.addHeight
            });
        },
        release: function() {
            var me = this;

            $win.off('.' + me.cid);
            me.$indiCon.off();
            me.$con.off();
            me.stop();
            me.supr();
        }
    });


    if (typeof define === "function" && define.amd) {
        define([], function() {
            return ResponseCarousel;
        });
    }
})(jQuery, window[LIB_NAME]);
