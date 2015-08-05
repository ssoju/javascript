/*!
 * @module coma.ui.Accordion
 * @license MIT License
 *
 * @modifier (김승일책임)comahead@vi-nyl.com
 */
(function ($, core, undefined) {
    "use strict";
    if (core.ui.Accordion) { return; }

    var ctx = window,
        ui  = core.ui,
        disabledAccordion = $('body').hasClass('ui_disabled_accordion');

    /**
     * 아코디언 모듈
     * @class
     * @name coma.ui.Accordion
     * @author 강태진
     * @modifier 김승일
     */
    var Accordion = ui('Accordion', /**@lends coma.ui.Accordion */{
        bindjQuery: 'accordion',
        defaults: {
            singleOpen: true,               // 단일열림 / 다중열림 여부
            toggleButtonType: '',           // 토글버튼 유형.(현재 미사용)
            duration: 300,                   // 펼쳐지거나 닫혀지거나 할 때 애니메이션 속도

            activeClass: "active",        // 활성화됐을 때 추가할 css 클래스명
            selectedClass: 'on',        // 버튼이 토글될 때 추가할 css 클래스명
            toggleClass: "ui_accord_toggle",
            contentClass: "ui_accord_content",
            itemClosest: 'li',
            itemSelector: '>ul>li',
            toggleSelector: ">.head>.ui_accord_toggle",  // 토글버튼
            contentSelector: ">.ui_accord_content"       // 컨텐츠
        },

        /**
         * 생성자
         * @param el 모듈 요소
         * @param options 옵션(기본값: defaults 속성 참조)
         */
        initialize: function (el, options) {
            var me = this;

            if (me.supr(el, options) === false || disabledAccordion) {
                return;
            }

            me._setOptionsByAccordType();
            me._bindEvent();

            // option에 기본적으로 오픈시킬 인덱스 값이 있으면 오픈시킨다.
            var openIndex = me.$el.data('openIndex');
            if (openIndex !== undefined) {
                if(openIndex === 'all') {
                    // 전체 오픈
                    me.expandAll();
                } else {
                    // openIndex에 해당하는 컨텐츠를 오픈
                    me.expand(openIndex, false);
                }
            }
        },

        _setOptionsByAccordType: function(){
            var me = this;

            if (me.options.accordType === 'detailview') {
                me.options.itemSelector = '';
                me.options.itemClosest = 'div';
                me.options.toggleSelector = '>h2>.ui_accord_toggle';
                me.options.contentSelector = '>.ui_accord_content';
            }
        },

        /**
         * 이벤트 바인딩
         */
        _bindEvent: function () {
            var me = this,
                o;

            // 토글버튼 클릭됐을 때
            me.on("click dblclick", me.options.itemSelector + me.options.toggleSelector, function (e) {
                e.preventDefault();

                me.updateSelectors();
                var $item = $(this).closest(me.options.itemClosest),
                    index = me.$items.index($item);

                // 열려있으면 닫고
                if ($item.hasClass(me.options.selectedClass)) {
                    me.collapse(index, true, function(){
                        $item.addClass(me.options.activeClass);
                    });
                } else {
                    // 아니면 열고
                    me.expand(index, true);
                }
            });

            if (o = me.options.accordGroup) {
                // 아코디언 요소가 따로 떨어져 있는 것을 data-accord-group속성을 묶고,
                // 하나가 열리면 그룹으로 묶여진 다른 아코디언에 열려진게 있으면 닫아준다.
                me.on('accordionbeforeexpand', function (e) {
                    $('.ui_accordion[data-accord-group=' + o + '], .ui_accordion_list[data-accord-group=' + o + ']')
                        .not(me.$el).scAccordion('collapse').find(me.options.itemSelector).removeClass(me.options.selectedClass);
                });
            }
        },

        _findSelected: function() {
            return this.$items.filter('.'+me.options.selectedClass);
        },

        // 재정의
        updateSelectors: function() {
            var me = this;

            if(me.options.accordType === 'detailview') {
                me.$items = me.$el;
            } else {
                if (me.$items && me.$items.size() > 0) {
                    me.$items = me.$items.add(me.$items.last().nextAll());//me.$('>tbody>tr');
                } else {
                    me.$items = me.options.itemSelector ? me.$(me.options.itemSelector) : me.$el;
                }
            }
        },

        /**
         * slide effect collapse handler
         * @private
         * @param { }
         */
        collapse: function (index, isAni, cb) {
            var me = this,
                opts = me.options,
                data = {};           // 애니메이션 시간

            if (arguments.length === 0 || index === null) {
                // index가 안넘어보면 현재 활성화된 패널의 index를 갖고 온다.
                index = me.$items.filter('.' + opts.selectedClass).index();
            }

            if (index < 0) { return; }

            data.index = index;
            data.header = me.$items.eq(index);
            data.content = data.header.find(opts.contentSelector);

            // 열리기 전에 이벤트 발생
            if (me.triggerHandler('accordionbeforecollapse', data) === false){ return; }
            if(isAni !== false) {
                // 애니메이션 모드
                //if(this.isAnimate) { return; }
                data.header.removeClass(opts.selectedClass);
                data.content.slideUp(opts.duration, function () {
                    // 열려진 후에 이벤트 발생
                    me.trigger('accordioncollapse', data);
                    me._updateButton(index, false);
                    cb && cb();
                });
            } else {
                // 일반 모드
                data.header.removeClass(opts.selectedClass);
                data.content.hide();
                // 열려진 후에 이벤트 발생
                me.trigger('accordioncollapse', data);
                me._updateButton(index, false);
                cb && cb();
            }
        },


        /**
         * slide effect expand handler
         * @param { }
         */
        expand: function (index, isAni, cb) {
            var me = this,
                opts = me.options,
                oldItem, oldIndex, newItem, data;           //

            if (arguments.length === 0) {
                return;
            }

            newItem = me.$items.eq(index);
            oldItem = me.$items.filter('.'+opts.selectedClass);
            oldIndex = oldItem.index();
            data = {
                index: index,
                header: newItem,
                oldIndex: oldIndex,
                oldHeader: oldIndex < 0 ? null : oldItem
            };

            if (data.index === data.oldIndex) { return; }

            data.content = newItem.find(opts.contentSelector);
            data.oldContent = oldIndex < 0 ? null : oldItem.find(opts.contentSelector);

            if (me.triggerHandler('accordionbeforeexpand', data) === false) { return; }
            if(isAni !== false) {
                // 애니메이션 사용
                me.isAnimate = true;
                if (opts.singleOpen && data.oldHeader) {
                    // 하나만 열리는 모드
                    data.oldHeader.removeClass(opts.selectedClass);
                    data.oldContent.slideUp(opts.duration, function () {
                        me._updateButton(data.oldIndex, false);
                        cb && cb();
                    });
                }
                data.header.addClass(opts.selectedClass)
                data.content.slideDown(opts.duration, function () {
                    me.isAnimate = false;
                    me.trigger('accordionexpand', data);
                    me._updateButton(index, true);
                    cb && cb();
                });
            } else {
                // 에니메이션 미사용
                if (opts.singleOpen) {
                    // 하나만 열리는 모드
                    data.oldHeader.removeClass(opts.selectedClass);
                    data.oldContent.hide();
                }
                data.header.addClass(opts.selectedClass);
                data.content.show();
                me.trigger('accordionexpand', data);
                me._updateButton(index, true);
                cb && cb();
            }
        },

        getActivate: function () {
            var me = this,
                opts = me.options,
                item = me.$items.filter('.'+opts.selectedClass);

            if (item.length === 0) {
                return {
                    index: -1,
                    header: null,
                    content: null
                }
            } else {
                return {
                    index: item.index(),
                    header: item,
                    content: item.find(opts.contentSelector)
                };
            }
        },

        _updateButton: function(index, toggle) {
            var me = this,
                sc = me.options.activeClass,
                tc = me.options.toggleButtonClass,
                $btn = me.$items.eq(index).find(me.options.toggleSelector);

            if ($btn.is('a')) {
                if(toggle) {
                    $btn.parent().parent().removeClass(sc).addClass(tc);
                    $btn.find('span.ui_accord_text').html(function () {
                        return $btn.attr('data-close-text');
                    }).parent().parent().replaceClass('btn_open', 'btn_close');
                } else {
                    $btn.parent().parent().removeClass(tc);
                    $btn.find('span.ui_accord_text').html(function () {
                        return $btn.attr('data-open-text');
                    }).parent().parent().replaceClass('btn_close', 'btn_open');
                }
            } else {
                if(toggle) {
                    $btn.replaceClass('btn_open', 'btn_close')
                        .parent().parent().removeClass(sc).addClass(tc);
                    $btn.find('span.ui_accord_text').html(function () {
                        return $btn.attr('data-close-text');
                    });
                } else {
                    $btn.replaceClass('btn_close', 'btn_open')
                        .parent().parent().removeClass(tc);
                    $btn.find('span.ui_accord_text').html(function () {
                        return $btn.attr('data-open-text');
                    });
                }
            }
        },

        collapseAll: function() {
            var me = this,
                count = me.$items.size();

            me.collapseMode = 'all';
            for(var i = 0; i < count; i++) {
                me.collapse(i, false);
            }
            me.collapseMode = null;
        },

        expandAll: function() {
            if(this.options.singleOpen){ return; }
            var me = this,
                count = me.$items.size();

            me.expandMode = 'all';
            for(var i = 0; i < count; i++) {
                me.expand(i, false);
            }
            me.expandMode = null;
        }
    });


    if (typeof define === "function" && define.amd) {
        define('modules/accordion', [], function ($) {
            return Accordion;
        });
    }

})(jQuery, window[LIB_NAME]);

/*!
 * @module coma.ui.Scrollview
 * @author comahead
 * @email comahead@vi-nyl.com
 * @create 2014-12-11
 * @license MIT License
 */
(function ($, core, undefined) {
    "use strict";
    if (core.ui.Scrollview) { return; }

    $.easing.smooth = function (x, t, b, c, d) {
        var ts = (t /= d) * t, tc = ts * t;
        return b + c * (-1 * ts * ts + 4 * tc + -6 * ts + 4 * t);
    };

    var cssTransform = core.css3.prefix('transform');

    var Scrollview = core.ui('Scrollview', {
        bindjQuery: 'scrollview',
        selectors: {
            wrapper: '.ui_scrollarea',
            scroller: '.ui_content',
            vscrollbar: '.ui_scrollbar'
        },
        defaults: {
            duration: 600,
            speedLimit: 1.2,
            moveThreshold: 100,
            offsetThreshold: 30,
            startThreshold: 5,
            acceleration: 0.1,
            accelerationT: 250,
            watch: true,
            watchInterval: 400
        },
        initialize: function (el, options) {
            var me = this;

            if (me.supr(el, options) === false) {
                return;
            }

            me.maxScrollY = 0;
            me.scrollHeight = 0;
            me.wrapperHeight = 0;
            me.visibleScroll = false;

            if (me.$vscrollbar.length > 0) {
                me.scrollbarStyle = me.$vscrollbar[0].style;
                me.scrollbarStyle.display = 'none';
                var $inner = me.$vscrollbar.find('span.bg_mid');
                if ($inner.length) {
                    me.scrollbarInnerStyle = $inner[0].style;
                    me.scrollbarInnerStyle.paddingBottom = 0;
                }
            }

            //me.$el.addClass('strack');
            me.$el.attr('tabindex', 0);
            me._bindEvents();
        },

        _bindEvents: function () {
            var me = this;

            /*$(window).on('resizeend.' + me.cid, function (){
             me.wrapperHeight = me.$wrapper.height();
             }).triggerHandler('resizeend.'+me.cid);*/


            if (me.$vscrollbar.size()){
                me.$wrapper.on('scroll', function () {
                    me._moveScrollbar((me.$wrapper[0].scrollTop*me.scrollRate));
                });

                if (me.options.watch === true) {
                    // 사이즈 변화 감시
                    var totalTime = 0, dur = me.options.watchInterval;
                    me.updateTimer = setInterval(function () {
                        // 40초에 한번씩 dom에서 제거 됐건지 체크해서 타이머를 멈춘다.
                        if (totalTime > 40000) {
                            totalTime = 0;
                            if (!$.contains(document, me.$el[0])) {
                                clearInterval(me.updateTimer);
                                me.updateTimer = null;
                                return;
                            }
                        } else {
                            totalTime += dur;
                        }
                        me.update();
                    }, dur);
                }
            }
            if (core.browser.isTouch) {
                me._bindContentScroll();
            } else {
                me._bindScrollbar();
                me._bindKeys();
                me._bindWheel();
            }
        },

        _watchStart: function () {
            var me = this;

        },
        /**
         * 터치기반 디바이스에서 터치로 컨텐츠를 스크롤할 수 있도록 바인딩
         * @private
         */
        _bindContentScroll: function () {
            var me = this,
                times = {}, multiplier = 1,
                isMove, startY, scrollableY, distance, acc, touchTime, maxOffset, elemH, offset, maxScrollY,
                scrollTop, duration;

            me.$el.on('touchstart touchmove touchend touchcancel', function (e) {
                times[e.type] = e.timeStamp;

                switch (e.type) {
                    case 'touchstart':
                        //e.preventDefault();

                        elemH = me.wrapperHeight;
                        scrollableY = me.$wrapper[0].scrollHeight/*.scrollHeight*/ > elemH;
                        maxScrollY = me.$wrapper[0].scrollHeight/*.scrollHeight*/ - elemH;
                        startY = e.originalEvent.touches[0].pageY;
                        multiplier = 1;

                        if (me.$wrapper.is(":animated")
                            && (times['touchstart'] - times['touchend'] < me.options.accelerationT)) {
                            multiplier += me.options.acceleration;
                        } else {
                            multiplier = 1;
                        }

                        me.$wrapper
                            .stop(true, false)
                            .data('scrollTop', me.$wrapper.scrollTop());

                        break;
                    case 'touchmove':
                        e.preventDefault();
                    case 'touchend':
                    case 'touchcancel':
                        if (!scrollableY) { return; }

                        isMove = (Math.abs(startY - e.originalEvent.pageY) > me.options.startThreshold);
                        if (isMove) {
                            if (e.type === 'touchmove') {
                                distance = startY - e.originalEvent.touches[0].pageY;
                                acc = Math.abs(distance / (times['touchmove'] - times['touchstart']));

                                scrollTop = me.$wrapper.data('scrollTop') + distance;
                                duration = 0;
                            } else {
                                elemH = me.wrapperHeight;

                                touchTime = times['touchend'] - times['touchmove'];
                                maxOffset = elemH * me.options.speedLimit;
                                offset = Math.pow(acc, 2) * elemH;
                                offset = offset > maxOffset ? maxOffset : multiplier * offset;
                                offset = (multiplier * offset) * ((distance < 0) ? -1 : 1);

                                if ((touchTime < me.options.moveThreshold) && offset != 0 && Math.abs(offset) > me.options.offsetThreshold) {
                                    scrollTop = me.$wrapper.data('scrollTop') + distance + offset;
                                    duration = me.options.duration;
                                }
                            }

                            if (scrollableY) {
                                if (scrollTop < 0) { scrollTop = 0; }
                                else if (scrollTop > maxScrollY) { scrollTop = maxScrollY; }

                                me.$wrapper.stop(true, false).animate({
                                    scrollTop: scrollTop
                                }, {
                                    duration: duration,
                                    easing: 'smooth',
                                    complete: function () {
                                        multiplier = 1;
                                    }
                                });
                            }
                        }
                        break;
                }
            });

        },

        /**
         * pc에서 상하키로 스크롤할 수 있도록 바인딩
         * @private
         */
        _bindKeys: function () {
            var me = this;

            me.$el.on('keydown', function (e) {
                var keyCode = e.keyCode || e.which,
                    wrapperHeight = me.$wrapper.innerHeight(),
                    scrollTop = me.$wrapper.prop('scrollTop'),
                    maxScrollY = me.$wrapper.prop('scrollHeight') - wrapperHeight,
                    newY;

                switch (keyCode) {
                    case 38: // up
                        e.preventDefault();
                        if (scrollTop <= 0) {
                            return;
                        }
                        newY = scrollTop - wrapperHeight;
                        break;
                    case 40: // down
                        e.preventDefault();
                        if (scrollTop >= maxScrollY) {
                            return;
                        }
                        newY = scrollTop + wrapperHeight;
                        break;
                    default:
                        return;
                }
                if (newY) {
                    me.$wrapper.stop(true, false)
                        .animate({
                            scrollTop: newY
                        }, {
                            duration: me.options.duration,
                            easing: 'smooth'
                        });
                }
            });
        },

        /**
         * pc에서 스크롤바로 컨텐츠를 스크롤할 수 있도록 바인딩
         * @private
         */
        _bindScrollbar: function () {
            var me = this,
                $doc = $(document),
                isTouch = core.browser.isTouch,
                currY, downY, moveY;

            function getY(e){
                if (isTouch && e.originalEvent.touches) {
                    e = e.originalEvent.touches[0];
                }
                return e.pageY;
            }

            me.$vscrollbar.on('mousedown touchstart', function (e) {
                e.preventDefault();
                if (isTouch) {
                    e.stopPropagation();
                }

                me.isMouseDown = true;
                currY = me.getPosition().y;
                downY = getY(e);

                $doc.on('mouseup.' + me.cid + ' mousecancel.' + me.cid +
                    ' touchend.' + me.cid + ' mousemove.' + me.cid +
                    ' touchmove.' + me.cid + ' touchcancel.' + me.cid, function (e) {
                    if (!me.isMouseDown) {
                        $doc.off('.' + me.cid);
                        return;
                    }

                    switch (e.type) {
                        case 'mouseup':
                        case 'touchend':
                        case 'mousecancel':
                        case 'touchcancel':
                            me.isMouseDown = false;
                            moveY = 0;
                            $doc.off('.' + me.cid);
                            break;
                        case 'mousemove':
                        case 'touchmove':
                            moveY = getY(e);

                            var top = currY - (downY - moveY),
                                scrollHeight = me.wrapperHeight - me.scrollbarHeight,
                                y;

                            me.scrollbarStyle.top = (top = Math.max(0, Math.min(top, scrollHeight)));
                            y = (me.scrollHeight - me.wrapperHeight) * (top / scrollHeight);
                            me.$wrapper.scrollTop(y);
                            e.preventDefault();
                            break;
                    }
                });
                return false;
            });
        },

        /**
         * pc에서 마우스로 스크롤할 수 있도록 바인딩
         * @private
         */
        _bindWheel: function () {
            var me = this;
            me.$wrapper.on('mousewheel DOMMouseScroll wheel', function (ev) {
                var e = ev.originalEvent;
                var delta     = core.util.getDeltaY(e) * 100,
                    scrollTop = me.$wrapper[0].scrollTop;

                me.$wrapper.scrollTop(scrollTop - delta);
                //if (me.$scrollArea.scrollTop() === scrollTop) {
                ev.preventDefault();
                ev.stopPropagation();
                //}
            });
        },

        /**
         * 스크롤바의 위치를 반환
         * @returns {{x: *, y: *}}
         */
        getPosition: function () {
            var matrix = this.scrollbarStyle,
                x, y;

            if ( core.css3.support ) {
                matrix = matrix[cssTransform].match(/-?[0-9]+/g);
                x = +(matrix[0]);
                y = +(matrix[1]);
            } else {
                x = +matrix.left.replace(/[^-\d.]/g, '');
                y = +matrix.top.replace(/[^-\d.]/g, '');
            }

            return { x: x, y: y };
        },

        /**
         * 스크롤바를 움직여주는 함수
         * @param top
         * @param height
         * @private
         */
        _moveScrollbar: function (top, height) {
            var me = this;

            if (!me.visibleScroll) { return; }
            if (height !== undefined && me.scrollbarHeight != height) {
                height = Math.max(height, 8);
                if (me.scrollbarInnerStyle){
                    var roundSize = me.$vscrollbar.children().eq(0).height();
                    me.scrollbarInnerStyle.top = roundSize + 'px';
                    me.scrollbarInnerStyle.bottom = roundSize + 'px';
                }
                me.scrollbarStyle.height = height+'px';
                me.scrollbarHeight = height;
            } else {
                height = me.scrollbarHeight;
            }
            if (me.wrapperHeight < height + top) {
                top = me.wrapperHeight - height;
            }
            if (core.css3.support) {
                me.scrollbarStyle[cssTransform] = 'translate(0px, ' + top + 'px)';
            } else {
                me.scrollbarStyle.top = top + 'px';
            }
        },

        /**
         * 사이즈 변화에 따른 UI 갱신
         */
        update: function (){
            var me = this,
                wrapperHeight, scrollHeight, visibleScroll, scrollbarHeight;

            wrapperHeight = me.$wrapper[0].offsetHeight;
            if (wrapperHeight === 0){
                me.wrapperHeight = 0;
                return;
            }

            scrollHeight = me.$wrapper[0].scrollHeight;
            visibleScroll = wrapperHeight < scrollHeight;
            if (visibleScroll !== me.visibleScroll) {
                me.visibleScroll = visibleScroll;
                me.scrollbarStyle.display = visibleScroll ? '' : 'none';
                me.$el.toggleClass('strack', visibleScroll);
            }
            if (visibleScroll && (scrollHeight !== me.scrollHeight || wrapperHeight !== me.wrapperHeight)) {
                me.wrapperHeight = wrapperHeight;
                me.scrollHeight = scrollHeight;
                me.scrollRate = wrapperHeight / scrollHeight;
                me._moveScrollbar(me.$wrapper[0].scrollTop * me.scrollRate, scrollbarHeight = wrapperHeight * me.scrollRate);
            }
        },

        /**
         * scrollTop 설정
         * @param top
         * @returns {*}
         */
        scrollTop: function (top) {
            var me = this;
            if (arguments.length > 0) {
                me.$wrapper.scrollTop(top);
                me.update();
            } else {
                return me.$wrapper.scrollTop();
            }
        },

        release: function () {
            var me = this;

            me.updateTimer && (clearInterval(me.updateTimer), me.updateTimer = null);
            me.supr();
        }
    });

    if (typeof define === 'function' && define.amd) {
        define('mobules/scrollview', [], function (){
            return Scrollview;
        })
    }

})(jQuery, window[LIB_NAME]);

/*!
 * @module coma.ui.Selectbox
 * @author odyseek
 * @email odyseek@vi-nyl.com
 * @create 2015-03-17
 * @license MIT License
 *
 * @modifier (김승일책임)comahead@vi-nyl.com
 */
(function ($, core, undefined) {
    "use strict";
    if (core.ui.Selectbox) { return; }

    var $doc    = $(document),
        $win    = $(window),
        isTouch = core.browser.isTouch;

    //Selectbox////////////////////////////////////////////////////////////////////////////
    /**
     * 커스텀 셀렉트박스<br />
     *
     * @class
     * @name coma.ui.Selectbox
     * @extends coma.ui.View
     */
    var Selectbox = core.ui('Selectbox', /** @lends coma.ui.Selectbox# */{
        bindjQuery: 'selectbox',
        $statics: {
            ON_CHANGED: 'selectboxchanged'
        },
        defaults: {
            classSort: ['sup', 'cnum', 'cname'],
            allowScrollbar: true,
            containerMargin: 4,
            where: 'inline',
            wrapClasses: '',
            disabledClass: 'disabled'
        },

        tmpl: '',
        /**
         * 생성자
         * @param {string|Element|jQuery} el 해당 엘리먼트(노드, id, jQuery 어떤 형식이든 상관없다)
         * @param {Object} [options] 옵션값
         * @param {string} [options.wrapClasses = ''] wrap 클래스명
         * @param {string} [options.disabledClass = 'disabled'] disabled 클래스명
         */
        initialize: function (el, options) {
            var me = this;
            if (me.supr(el, options) === false) {
                return;
            }

            me.display = me.$el.css('display') !== 'none';

            me._create();
            me.update();
        },

        /**
         * select 컨트롤을 기반으로 UI DOM 생성
         * @private
         */
        _create: function () {
            var me    = this,
                cls   = me.$el.attr('data-class') || 'item_wrap';

            me.width = parseInt(me.$el.css('width'), 10) + 22;
            me.widthClass = (me.$el.attr('data-width-class') === undefined) ? '' : me.$el.attr('data-width-class');
            me.split = (me.$el.attr('data-split') === undefined) ? '' : me.$el.attr('data-split');
            me.title = (me.$el.attr('data-title') || me.$el.attr('title') || '셀렉트박스');
            me.id = (me.$el.attr('data-id') === undefined) ? '' : ' id="' + me.$el.attr('data-id') + '"';
            me.hideClass = (me.$el.data('hideClass') === undefined) ? '' : '.' + me.$el.data('hideClass');
            me.cname = (me.$el.data('cnameOption') === undefined) ? false : me.$el.data('cnameOption');
            me.isReadonly = me.$el.prop('readonly') || !!~cls.indexOf('read');
            me.isDisabled = me.$el.prop('disabled') || !!~cls.indexOf('disabled');

            // 셀렉트박스
            me.$selectbox = $('<div class="ui_select_dom ' + cls + '" ' + me.id + '></div>').addClass(me.options.wrapClasses);
            if (me.widthClass === '') {
                me.$selectbox.css('width', me.width);
            } else {
                me.$selectbox.addClass(me.widthClass);
            }
            me.$selectbox.insertAfter(me.$el.hide());


            me._createLabel();
            me._createList();
            me._bindEvents();
        },

        /**
         * 스크롤바 생성
         * @private
         */
        _refreshScroll: function () {
            var me = this;

            me.contentHeight = me.$list.find('ul').height();
            if (me.maxHeight > me.contentHeight) {
                me.$scrollBar.hide();
                return;
            }

            me.containerHeight = me.$list.children().height() - (me.options.containerMargin * 2);
            if (me.contentHeight <= me.containerHeight) {
                me.$scrollBar.hide();
            } else if (me.$selectbox.hasClass('on')) {
                me.$scrollBar.show();
            }
            me.$scrollBar.css('marginTop', me.$label.height() + me.options.containerMargin);

            me.scrollRate = me.containerHeight / me.contentHeight;
            me.scrollBarHeight = me.containerHeight * me.scrollRate;
            me.scrollHeight = me.containerHeight - me.scrollBarHeight;
            me.isMouseDown = false;
            me.moveY = 0;

            me._scrollUpdate();
        },

        /**
         * 스크롤바 삭제
         * @private
         */
        _hideScroll: function () {
            var me = this;

            me.$scrollBar.hide();
            me.$scrollBar.css('height', 0).find('span.bg_mid').css('height', 0);
            me.$scrollBar.css('top', 0);
        },

        _scrollUpdate: function () {
            var me = this;


            me.contentTop = me.$list.children().scrollTop();
            me.$scrollBar.css('height', Math.ceil(me.scrollBarHeight)).find('span.bg_mid').css('height', Math.ceil(me.scrollBarHeight) - 24);
            me.$scrollBar.css('top', (me.contentTop * me.scrollRate));
        },

        _move: function (top) {
            var me = this;

            top = Math.max(0, Math.min(top, me.scrollHeight));

            me.$list.children().scrollTop((me.contentHeight - me.containerHeight) * (top / me.scrollHeight));
            me._scrollUpdate();
        },

        _getY: function (e) {
            if (isTouch && e.originalEvent.touches) {
                e = e.originalEvent.touches[0];
            }
            return e.pageY;
        },

        /**
         * 이벤트 바인딩
         * @private
         */
        _bindEvents: function () {
            var me = this;
            me.on('selectboxopen selectboxclose', function (e) {
                e.stopPropagation();


                if (e.type === 'selectboxopen') {
                    if(me.isReadonly || me.isDisabled) { return; }

                    me.$selectbox.addClass('on');
                    me.$el.closest('div.select_wrap').addClass('on');

                    isTouch && $(document).on('touchstart.selectbox' + me.cid, function (e) {
                        if (!$.contains(me.$selectbox[0], e.target)) {
                            me.close();
                        }
                    });
                } else {
                    me.$selectbox.removeClass('on');
                    me.$el.closest('div.select_wrap').removeClass('on');
                    clearTimeout(timer), timer = null;

                    isTouch && $(document).off('touchstart.selectbox' + me.cid);
                }
            });

            // 비터치 기반일 때에 대한 이벤트 처리
            if (!isTouch) {
                var timer;
                // 셀렉트박스에서 포커스가 벗어날 경우 자동으로 닫히게
                me.$selectbox.on('mouseenter.selectbox mouseleave.selectbox focusin.selectbox focusout.selectbox', function (e) {
                    clearTimeout(timer), timer = null;
                    if (me.$el.prop('disabled')) { return; }
                    if (e.type === 'mouseenter' || e.type === 'focusin') {
                        me.$selectbox.addClass('active');
                    } else if (e.type === 'mouseleave' || e.type === 'focusout') {
                        me.$selectbox.removeClass('active');
                        if (e.type === 'focusout' && me.$selectbox.hasClass('on')) {
                            timer = setTimeout(function () {
                                me.close();
                            }, 200);
                        }
                    }
                }).on('keydown', function (e) {
                    if (!me.isShown){ return; }
                    switch (e.keyCode){
                        case core.keyCode.ESCAPE:
                            me.close();
                            me.$label.find('a').focus();
                            break;
                    }
                });
            }

            $(window).on('changemediasize.' + me.cid, function (e, data) {
                //me.update();
                me._refreshScroll();
            });

            me._buildScrollbar();
        },

        _buildScrollbar: function () {
            var me = this;

            // ScrollBar Event Bind Start
            if (!isTouch && me.options.allowScrollbar) {
                me.$scrollBar.on('mousedown touchstart', function (e) {
                    e.preventDefault();
                    if (isTouch) {
                        e.stopPropagation();
                    }

                    me.isMouseDown = true;
                    me.currY = parseInt($(this).css('top'), 10);
                    me.downY = me._getY(e);

                    $doc.on('mouseup.scroll' + me.cid + ' touchend.scroll' + me.cid + ' mousemove.scroll' + me.cid + ' touchmove.scroll' + me.cid, function (e) {
                        if (!me.isMouseDown) {
                            return;
                        }

                        switch (e.type) {
                            case 'mouseup':
                            case 'touchend':
                                me.isMouseDown = false;
                                me.moveY = 0;
                                $doc.off('.scroll'+me.cid);
                                break;
                            case 'mousemove':
                            case 'touchmove':
                                me.moveY = me._getY(e);
                                me._move(me.currY - (me.downY - me.moveY));
                                e.preventDefault();
                                break
                        }
                    });

                    return false;
                });
            }

            var $listChild = me.$list.children();
            $listChild.on('scroll', function () {
                if (!me.isMouseDown) {
                    me._scrollUpdate();
                }
            }).on('mousewheel DOMMouseScroll wheel', function (event) {
                event.preventDefault();
                var e = event.originalEvent,
                    delta     = core.util.getDeltaY(e) * 40,
                    scrollTop = $listChild.scrollTop();

                $listChild.scrollTop(scrollTop - delta);
                //if ($listChild.scrollTop() == scrollTop) {
                event.preventDefault();
                //}
            });

            if (isTouch) {
                me.$list.on('touchstart touchmove touchend touchcancel', function () {
                    var isTouchDown = false,
                        moveY       = 0,
                        currY       = 0,
                        downY       = 0;
                    return function (e) {
                        switch (e.type) {
                            case 'touchstart':
                                isTouchDown = true;
                                moveY = 0;
                                currY = $listChild.scrollTop();
                                downY = me._getY(e);
                                break;
                            case 'touchmove':
                                e.preventDefault();
                                e.stopPropagation();
                                if (!isTouchDown) {
                                    return;
                                }
                                moveY = me._getY(e);
                                $listChild.scrollTop(currY + (downY - moveY));
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
            // ScrollBar Event Bind End
        },

        /**
         * 레이블 생성
         * @private
         */
        _createLabel: function () {
            var me = this;

            me.$label = $('<div class="item_view"><a href="#0" class="ui_select_button" title="">' + me._itemHTML(me.el.options[0], 'label') + '</a></div>');

            me.$label.attr({
                'id': me.cid + '_button'
            }).on('click', '.ui_select_button', function (e) {
                e.preventDefault();
                if (me === Selectbox.active) {
                    me.close();
                    return;
                }

                // 현재 셀렉트박스가 열려있으면 닫고, 닫혀있으면 열어준다.
                if (me.$selectbox.hasClass('on')) {
                    me.close();
                } else {
                    if(me.isReadonly || me.isDisabled) { return; }
                    me.open();
                }
            });
            !isTouch && me.$label.on('keydown', function (e) {
                if (me.isReadonly || me.isDisabled || me.isShown) {
                    if (e.keyCode === core.keyCode.DOWN) {
                        me.open();
                        me.$list.find('li>a:eq(0)').focus();
                    }
                    return;
                }
                var index = me.$el[0].selectedIndex,
                    count = me.$el[0].options.length;

                switch (e.keyCode) {
                    case core.keyCode.UP:
                        e.preventDefault();
                        me.selectedIndex(Math.max(0, index - 1));
                        break;
                    case core.keyCode.DOWN:
                        e.preventDefault();
                        me.selectedIndex(Math.min(count - 1, index + 1));
                        break;
                }
            });

            me.$selectbox.append(me.$label);
        },

        /**
         * 리스트 생성
         * @private
         */
        _createList: function () {
            var me = this;

            me.$list = $('<div class="item_list"><div class="ui_item_scrollarea ui_item_content"></div></div>');
            me.$list.on('click', function (e) {
                me.$list.focus();
            }).on('click', 'li>a', function (e) {
                // 아이템을 클릭했을 때
                e.preventDefault();
                e.stopPropagation();

                me.selectedIndex($(this).parent().index());
                me.close();
                me.$label.find('a').focus();
            }).on('mousedown', 'li>a', function () {
                this.focus();
            });
            me.$list.attr({
                'id': me.cid + '_menu'
            });

            !isTouch && me.$list.on('keydown', 'a', function (e) {
                // 키보드의 위/아래 키로 이동
                var $links = me.$selectbox.find('a'),
                    index = $links.index(this),
                    count = $links.length;

                switch (e.keyCode) {
                    case core.keyCode.UP:
                        if (!me.isShown) { return; }
                        e.preventDefault();
                        $links.eq(Math.max(0, index - 1)).focus();
                        break;
                    case core.keyCode.DOWN:
                        if (!me.isShown) { return; }
                        e.preventDefault();
                        $links.eq(Math.min(count, index + 1)).focus();
                        break;
                }
            });
            me.$selectbox.append(me.$list);
            me.maxHeight = parseInt(me.$list.children().css('max-height'), 10);

            me.$scrollBar = $('<div class="scroll ui_item_scrollbar" style="top: 0px;"><span class="bg_top"></span><span class="bg_mid" style=""></span><span class="bg_btm"></span></div>');
            me.$selectbox.append(me.$scrollBar);
        },

        /**
         * 스크롤박스를 버튼 위에 놓을지 아래에 놓을지 결정
         * @private
         */
        _reposition: function(){
            var me = this, $scrollarea,
                scrollTop, offset, listHeight, selectHeight, scrollHeight;

            $scrollarea = me.$selectbox.parentsUntil('body').filter(function(){
                var overflow = $(this).css('overflowY');
                return overflow === 'hidden' || overflow === 'auto';
            });
            if($scrollarea.size() === 0){ return; }

            scrollTop = $scrollarea.scrollTop();
            scrollHeight = $scrollarea.prop('scrollHeight');
            selectHeight = me.$selectbox.innerHeight();
            offset = me.$selectbox.offset().top - $scrollarea.offset().top + scrollTop;
            me.$list.css('visibility', 'hidden').show();
            listHeight = me.$list.children().innerHeight();
            me.$list.css('visibility', '').hide();
            if(offset + listHeight + selectHeight > scrollHeight) {
                me.$selectbox.addClass('up');
                me.$list.css('marginTop', (listHeight + selectHeight + 3) * -1);
            } else {
                me.$selectbox.removeClass('up');
                me.$list.css('marginTop', '');
            }
        },

        /**
         * 활성화된 아이템을 가시영역에 보이도록 강제 스크롤
         * @private
         */
        _scrollToItem: function () {
            var me = this, selIndex = me.$el[0].selectedIndex;

            if (selIndex > 0) {
                var $option = me.$list.find('li').eq(selIndex),
                    scrollTop = me.$list.children().scrollTop(),
                    optionTop = $option.position().top + scrollTop,
                    wrapperHeight = me.$list.height(),
                    optionHeight, listHeight;

                if (optionTop < scrollTop || optionTop >= wrapperHeight + scrollTop) {
                    optionHeight = $option.height();
                    listHeight = me.$list.children().height();
                    me.$list.children().scrollTop(optionTop - (listHeight / 2) + (optionHeight / 2));
                }
            } else {
                me.$list.children().scrollTop(0);
            }
        },

        /**
         * 리스트 표시
         * @fires coma.ui.Selectbox#selectboxopen
         */
        open: function () {
            var me        = this;

            Selectbox.active && Selectbox.active.close();
            if (me.$el.prop('disabled') || me.$el.prop('readonly')) { return; }
            me._reposition();

            /**
             * 셀렉트박스가 열릴 때 발생
             * @event coma.ui.Selectbox#selectboxopen
             *///me.$selectbox.triggerHandler('selectboxopen');
            me.isShown = true;
            if (me.options.where === 'body') {
                me.$list.css({
                    position: 'absolute',
                    zIndex: 9000,
                    top: me.$label.offset().top + me.$label.height(),
                    left: me.$label.offset().left
                }).appendTo('body');
            }
            me.$list.show();
            me._scrollToItem();
            me.triggerHandler('selectboxopen');
            Selectbox.active = me;

            if (core.browser.isTouch) {
                $doc.on('click.selectbox' + me.cid, function (e) {
                    e.preventDefault();
                    if (!$.contains(me.$selectbox[0], e.target)) {
                        me.close();
                        return;
                    }
                });
            }

            me.$label.find('.ui_select_button').attr('title', me.title + ' 닫기');
            me._refreshScroll();
        },
        /**
         * url에 해당하는 페이지를 호출하여 받은 값을 바탕으로 option list 갱신
         * @param {String} data.url url 주소
         */
        remote: function () {
            var me = this;

            $.ajax.apply($, [].slice.call(arguments)).done(function (json) {
                me.update(json);
            });
        },

        /**
         * 리스트 닫기
         * @fires coma.ui.Selectbox#selectboxclose
         */
        close: function () {
            var me = this;

            Selectbox.active = null;
            /**
             * 셀렉트박스가 닫힐 때 발생
             * @event coma.ui.Selectbox#selectboxclose
             */
            me.isShown = false;
            me.triggerHandler('selectboxclose');
            me.$label.find('.ui_select_button').attr('title', me.title + ' 열기');

            if (me.options.where === 'body') {
                me.$label.after(me.$list.css({
                    position: '',
                    zIndex: '',
                    top: '',
                    left: ''
                }));
            }
            me.$list.hide();
            me._hideScroll();

            $doc.off('.selectbox' + me.cid);
        },

        _itemHTML: function (option, type) {
            if (!option) { return; }
            var me       = this,
                opts     = me.options,
                $o       = $(option),
                dataList = {}, cname,
                html     = '';

            if (cname = $o.attr('data-sup')) { dataList['sup'] = cname; }
            if (cname = $o.attr('data-cnum')) { dataList['cnum'] = cname; }
            if (cname = $o.attr('data-cname')) { dataList['cname'] = cname; }
            if (cname = $o.attr('data-cname-mobile')) { dataList['cnameMobile'] = cname; }

            // option에 data속성이 있으면
            if (core.json.hasItems(dataList)) {
                var isW768 = $('body').hasClass('w768');
                core.each(opts.classSort, function (val) {
                    if (dataList[val]) {
                        if (val !== 'cname') {
                            html += '<span class="' + val + '">' + dataList[val] + '</span>';
                        } else if (val === 'cname' && type === 'label') {
                            if (me.cname && !isW768) {
                                html += '<span class="' + val + '">' + option.text + '</span>';
                            } else {
                                if( dataList['cnameMobile'] && isW768) {
                                    html += '<span class="' + val + '">' + dataList['cnameMobile'] + '</span>';
                                } else {
                                    html += '<span class="' + val + '">' + dataList[val] + '</span>';
                                }
                            }
                        } else {
                            html += '<span class="' + val + '">' + option.text + '</span>';
                        }
                    }
                });
                if (type === 'label') {
                    html = html + '<span class="hide">선택됨</span><span class="ico"></span>';
                }
                return html;
            } else {
                if (type === 'label') {
                    return '<span class="ui_select_text">' + option.text + '</span><span class="hide">선택됨</span><span class="ico"></span>';
                } else {
                    return option.text;
                }
            }
        },

        /**
         * index에 해당하는 option항목을 선택
         *
         * @param {number} index 선택하고자 하는 option의 인덱스
         * @param {boolean} trigger change이벤트를 발생시킬 것인지 여부
         */
        selectedIndex: function (index, trigger) {
            if (arguments.length === 0) {
                return this.$el[0].selectedIndex;
            }
            if (this.isReadonly || this.isDisabled || this.el.options.length === 0) { return; }
            if (index < 0 || index >= this.$el[0].options.length) { return; }


            var me   = this,
                item = me.$el.find('option')
                    .prop('selected', false).removeAttr('selected')
                    .eq(index).prop('selected', true).attr('selected', 'selected');

            if (trigger !== false) {
                me.trigger('change', {selectedIndex: index});
            }

            me.$list.find('li').removeClass('on').eq(index).addClass('on');
            /*me.$list.attr({
             'aria-activedescendant': me.$list.find('li').attr('id')
             });*/
            // 이건 머지? me.text = (me.split === '') ? item.text() : item.text().split(me.split)[0];
            me.$label.find('a').html(me._itemHTML(me.el.options[index], 'label'));

            if (me.hideClass !== '') {
                me.showHide();
            }
        },

        /**
         * value 에 해당하는 option항목을 선택, 인자가 없을땐 현재 선택되어진 value를 반환
         *
         * @param {string} index 선택하고자 하는 option의 인덱스
         * @param {boolean} trigger change이벤트를 발생시킬 것인지 여부
         * @return {string}
         * @example
         * &lt;select id="sel">&lt;option value="1">1&lt;/option>&lt;option value="2">2&lt;/option>&lt;/select>
         *
         * $('#sel').scSelectbox('value', 2);
         * value = $('#sel').scSelectbox('value'); // = $('#sel')[0].value 와 동일
         */
        value: function (_value, trigger) {
            var me = this;

            if (arguments.length === 0) {
                return me.$el[0].options[me.$el[0].selectedIndex].value;
            } else {
                core.each(core.toArray(me.$el[0].options), function (item, i) {
                    if (item.value == _value) {
                        me.selectedIndex(i, trigger);
                        return false;
                    }
                });
            }
        },

        /**
         * 선택된 option 의 텍스트 반환
         * @returns {*}
         */
        text: function () {
            return this.$el[0].options[this.$el[0].selectedIndex].text;
        },

        /**
         * 선택된 option dom 자체를 반환
         * @returns {*}
         */
        selectedOption: function () {
            return this.$el[0].options[this.$el[0].selectedIndex];
        },

        /**
         * 동적으로 select의 항목들이 변경되었을 때, UI에 반영
         *
         * @param {json} (optional) list 만약 option들을 새로 갱신하고자 할 경우
         * @example
         * &lt;select id="sel">&lt;option value="1">1&lt;/option>&lt;option value="2">2&lt;/option>&lt;/select>
         *
         * $('#sel')[0].options[2] = new Option(3, 3);
         * $('#sel')[0].options[3] = new Option(4, 4);
         * $('#sel').scSelectbox('update');
         */
        update: function (list) {
            var me    = this,
                opts  = me.options,
                html  = '',
                index = -1,
                text  = '',
                num   = 1;

            if (core.is(list, 'array')) {
                // list 값이 있으면 select를 갱신시킨다.
                me.el.options.length = 0;
                core.each(list, function (item, i) {
                    me.el.options.add(new Option(item.text || item.value, item.value));
                });
            } else if (core.is(list, 'json')) {
                me.el.options.length = 0;
                core.each(list, function (key, value) {
                    me.el.options.add(new Option(key, value));
                });
            }

            me.$selectbox.toggleClass('read', me.isReadonly && !me.isDisabled)
                .toggleClass('disabled', me.isDisabled )
                .toggleClass('warn', me.$el.is('[data-class*=warn]'));

            if (me.isReadonly || me.isDisabled) {
                me.$label.children().attr('title', me.title + ' 선택불가').find('.hide').text('선택불가');
                if (me.isDisabled) {
                    me.$label.children().attr('tabindex', -1);
                }
                return;
            } else {
                me.$label.children().attr('title', me.title + ' 열기').removeAttr('tabindex').find('.hide').text('선택됨');
            }

            // select에 있는 options를 바탕으로 UI를 새로 생성한다.
            core.each(core.toArray(me.$el[0].options), function (item, i) {
                if ($(item).prop('selected')) {
                    index = i;
                    text = item.text;
                }
                html += '<li><a href="#' + (num++) + '" data-value="' + item.value + '" data-text="' + item.text + '" title="' + me.title + '">' + me._itemHTML(item) + '</a></li>';
            });

            if (index >= 0) {
                me.$list.children().empty().html('<ul>' + html + '</ul>').find('li:eq(' + index + ')').addClass('on');
                me.$label.find('a').html(me._itemHTML(me.el.options[index], 'label'));
            } else {
                me.$list.children().empty();
                me.$label.find('a').html('');
            }

            if (me.hideClass !== '') {
                me.showHide();
            }

            me.$selectbox.toggle(me.display);
        },

        /**
         * readonly 모드로 변경
         * @param flag
         */
        readonly: function(flag) {
            var me = this;

            me.isReadonly = flag;
            if (flag) {
                me.$el.prop('disabled', false);
            }
            me.close();
            me.update();
        },

        /**
         * disabled 모드로 변경
         * @param flag
         */
        disabled: function(flag) {
            var me = this;

            me.isDisabled = flag;
            me.$el.prop('disabled', flag);
            me.close();
            me.update();
        },

        /**
         * 셀렉트박스 UI 표시
         */
        show: function () {
            this.display = true;
            this.$selectbox.toggle(this.display);
        },

        /**
         * 셀렉트박스 UI 숨김
         */
        hide: function () {
            this.display = false;
            this.$selectbox.toggle(this.display);
        },

        /**
         * 셀렉트박스 UI 토글링
         * @param {Boolean} flag 표시 여부
         */
        toggle: function (flag) {
            if (arguments.length === 0) {
                flag = !this.display;
            }
            this.display = flag;
            this.$selectbox.toggle(this.display);
        },

        /**
         * Selceted 됐을 경우 영역 Show Hide
         *
         * @example
         * &lt;select id="sel">&lt;option value="#id1">1&lt;/option>&lt;option value="#id2">2&lt;/option>&lt;/select>
         *
         * $('#sel')[0].options[2] = new Option(3, 3);
         * $('#sel')[0].options[3] = new Option(4, 4);
         * $('#sel').scSelectbox('update');
         */
        showHide: function() {
            var me = this,
                id = me.$el.val();

            $(me.hideClass).hide();
            $(id).show();
        },

        /**
         * 소멸자
         */
        release: function () {
            var me = this;

            $(document).off('.selectbox' + me.cid);
            $(window).off('.' + me.cid);
            me.$label.off().remove();
            me.$list.off().remove();
            me.$selectbox.off().remove();
            me.$el.unwrap('<div></div>');
            me.$el.off('change.selectbox').show();
            me.supr();
        }
    });
    ///////////////////////////////////////////////////////////////////////////////////////

    /**
     * 자동빌드
     */
    /*
     Selectbox.autoBuild = function () {
     var selectboxes = document.getElementsByTagName('select'),
     prevCount   = 0;

     Selectbox.autoBuildTimer = setInterval(function () {
     var el;
     if (selectboxes.length === prevCount) {
     return;
     }
     prevCount = selectboxes.length;
     for (var i = 0; i < prevCount; i++) {
     el = selectboxes[i];
     if (!el.getAttribute('_sb_')) {
     el.setAttribute('_sb_', '1');
     $(el).scSelectbox();
     }
     }
     }, 150);
     };

     Selectbox.stopBuild = function () {
     clearInterval(Selectbox.autoBuildTimer);
     Selectbox.autoBuildTimer = null;
     };
     */

    // li 내부에 셀렉트박스가 들어있을 경우 토글링시 li에 frm_on클래스도 토글링해주어야 함
    core.ui.setDefaults('Selectbox', {
        on: {
            'selectboxopen': function (e) {
                $(this).parentsUntil('#wrap').filter(function (i) {
                    return $(this).css('position') === 'relative';
                }).addClass('zindex');
            },
            'selectboxclose': function (e) {
                $(this).parents('.zindex').removeClass('zindex');
            }
        }
    });

    // 날짜범위 셀렉트박스: 셀렉트박스에서 상속받아 구현
    var DateSelectbox = core.ui('DateSelectbox', Selectbox, {
        bindjQuery: 'dateSelectbox',
        initialize: function(el, options) {
            var me = this;
            if(me.supr(el, options) === false) {
                return;
            }

            if(!me.options.startTarget || !me.options.endTarget) { return; }
            var $startTarget = $(me.options.startTarget),
                $endTarget = $(me.options.endTarget),
                format = me.options.format || core.date.FORMAT;

            me.on('change', function(){
                var $el = $(this),
                    val = $el.val(),
                    endDate = core.date.format(new Date(), format),
                    startDate;

                if (val === 'user' || val === 'default') {
                    if (val === 'user') {
                        startDate = $startTarget.val();
                        endDate = $endTarget.val();
                    } else {
                        startDate = $el.data('start');
                        endDate = $el.data('end');
                    }
                } else {
                    startDate = core.date.format(core.date.calcDate(endDate, val) || new Date(), format);
                }

                if (core.date.parse(startDate) > core.date.parse(endDate)) {
                    $startTarget.val(endDate).triggerHandler('dateselectboxchange');
                    $endTarget.val(startDate).triggerHandler('dateselectboxchange');
                } else {
                    $startTarget.val(startDate).triggerHandler('dateselectboxchange');
                    $endTarget.val(endDate).triggerHandler('dateselectboxchange');
                }
            });

            // 사용자가 날짜선택 부분을 변경하면 셀렉트박스의 값을 사용자선택으로 변경해준다.
            $startTarget.add($endTarget).on('change calendarinsertdate.' + me.cid, function() {
                me.$el.scDateSelectbox('value', 'user', false); // false는 change이벤트가 발생하지 않도록 하기 위함
            });
        }
    });

    if (typeof define === "function" && define.amd) {
        define('modules/selectbox', [], function () {
            return Selectbox;
        });

        define('modules/dateselectbox', [], function(){
            return DateSelectbox;
        });
    }

})(jQuery, window[LIB_NAME]);

/*!
 * @module coma.ui.Modal
 * @author comahead
 * @email comahead@vi-nyl.com
 * @create 2014-11-25
 * @license MIT License
 */
(function ($, core, undefined) {
    "use strict";
    if (core.ui.Modal) { return; }

    var $doc    = $(document),
        $win    = $(window),
        $body   = $('body'),
        browser = core.browser,
        isTouch = browser.isTouch,
        ui      = core.ui,
        _zIndex = 9000;

    // 모달관련해서 총괄을 하는 모듈
    var ModalManager = window.ModalManager = {
        // 모달이 여러개 띄워지는 것을 허용할 것인가...
        overlap: false,
        init: function (options) {
            var me = this;

            me.options = $.extend({}, options);
            // 열려져 있는 모달을 담은 배열
            me.stack = [];
            // 현재 최상위에 보이는 모달
            me.active = null;
            // 글로벌이벤트 바인드 여부
            me.globalEventBind = false;

            me._bind();
        },

        _bind: function () {
            var me = this;

            // 초기에 글로벌 이벤트를 바인딩 하지 않고 모달이 한개라도 띄워졌을 때,
            // 비로소 글로벌이벤트를 바인딩 시킨다.
            var bindGlobalEvent = function () {
                if (me.globalEventBind) {
                    return;
                }
                me.globalEventBind = true;

                // 창 리사이징시에 가운데에 위치시킨다.
                $win.on('resizeend.modalmanager', function () {
                    for (var i = -1, modal; modal = me.stack[++i];) {
                        modal.isShown && modal.center();
                    }
                });

                // 창이 다 닫히면 글로벌이벤트를 언바인딩 시킨다
                $doc.on('modalhidden.modalmanager', '.ui_modal_layer', function (e) {
                    var $modal = $(e.currentTarget),
                        modal  = $modal.scModal('instance');

                    // zindex -= 1
                    me.revertZIndex();
                    me.remove(modal);

                    if (me.stack.length > 0) {
                        me.active = me.stack[me.stack.length - 1];
                    } else {
                        me.active = null;
                        unbindGlobalEvent();
                        // 보이스오버가 본문 내용을 다시 읽을 수 있도록 aria  속성을 뺀다.
                        $('#wrap').removeAttr('aria-hidden');
                    }
                    //core.ui.setBodyOverflow(false);
                }).on('focusin.modalmanager', function (e) {
                    // 탭키로 포커싱 이동 시 모달안에 머물도록 처리
                    if (!me.active) {
                        return;
                    }
                    if (me.active.$el[0] !== e.target && !$.contains(me.active.$el[0], e.target)) {
                        me.active.$el.find(':focusable').first().focus();
                        e.stopPropagation();
                    }
                });
            };

            // 글로벌이벤트 언바인딩
            var unbindGlobalEvent = function () {
                $win.off('resizeend.modalmanager');
                $doc.off('modalhidden.modalmanager');
                $doc.off('focusin.modalmanager');
                me.globalEventBind = false;
            };

            $doc.on('modalshow.modalmanager', '.ui_modal_layer', function (e) {
                var $modal = $(e.currentTarget),
                    modal  = $modal.scModal('instance');

                // 다중 모달 모드가 아닐 경우 기존 모달을 닫는다,
                if (!ModalManager.overlap) {
                    me.closeAll();
                }
                me.active = modal;
                // stack에 추가
                me.add(modal);
            }).on('modalshown.modalmanager', '.ui_modal_layer', function (e) {
                !me.globalEventBind && bindGlobalEvent();
                if (me.stack.length === 1) {
                    // 모달이 떠 있는 상태에서 body 본문을 을 안읽도록 aria 추가
                    $('#wrap').attr('aria-hidden', 'true');
                }
                //core.ui.setBodyOverflow(true);
            });

            // 링크나 버튼에  data-control="modal" 가 있으면 관련한 모달이 뜨도록 처리
            $doc.on('click.modalmanager', '[data-control=modal]', function (e) {
                e.preventDefault();

                var $el   = $(this),
                    $next = $el.next('.laypop_wrap, .laypop_mpc'),
                    target, $modal;
                if ($next.size() > 0) {
                    // 모달이 버튼 다음에 위치하고 있을 때
                    $next.scModal($el.data()).one('modalhidden.modalmanager', function (e) {
                        setTimeout(function (){ $el[0].focus(); });
                    });
                } else {
                    if (target = ($el.attr('href') || $el.attr('data-target') || $el.attr('data-href'))) {
                        // ajax형 모달인 경우
                        if (!/^#/.test(target)) {
                            $.ajax({
                                url: target
                            }).done(function (html) {
                                var $tmp = $('<div></div>').html(html);
                                $modal = $tmp.children().appendTo('body');
                                $modal.addClass('ui_modal_ajax').buildUIControls().scModal($.extend({
                                    removeOnClose: true
                                }, $el.data())).one('modalhidden', function (e) {
                                    setTimeout(function (){ $el[0].focus(); });
                                });
                                $tmp.remove(), $tmp = null;
                                $el.triggerHandler('modalloaded', {url: target, modal: $modal});
                            });
                        } else {
                            // 모달이 버튼과 다른 곳에 위치하고 있을 때 target 속성에 모달 id을 설정
                            $(target).scModal($el.data()).one('modalhidden', function (e) {
                                setTimeout(function (){ $el[0].focus(); });
                            });
                        }
                    }
                }
            });
        },
        // 모달 stack 추가
        add: function (modal) {
            this.stack.push(modal);
        },
        // 모달 stack 에서 제거
        remove: function (modal) {
            this.stack = core.array.remove(this.stack, modal);
        },
        // 전체 모달 닫기
        closeAll: function () {
            for(var i = this.stack.length - 1; i >= 0; i--) {
                this.stack[i].close();
            }
        },
        // 모달을 띄울 때 zindex를 9000부터 시작하여 1씩 증가시켜 모달에 설정한다.
        nextZIndex: function () {
            var zi = _zIndex;
            _zIndex += 1;
            return zi;
        },
        // 모달이 닫힐 때 zindex를 -1 반환.
        revertZIndex: function () {
            _zIndex -= 1;
        }
    };
    ModalManager.init();


    // Modal ////////////////////////////////////////////////////////////////////////////
    /**
     * 모달 클래스<br />
     * // 기본 옵션 <br />
     * options.overlay:true 오버레이를 깔것인가<br />
     * options.clone: true  복제해서 띄울 것인가<br />
     * options.closeByEscape: true  // esc키를 눌렀을 때 닫히게 할 것인가<br />
     * options.removeOnClose: false // 닫을 때 dom를 삭제할것인가<br />
     * options.draggable: true              // 드래그를 적용할 것인가<br />
     * options.dragHandle: 'h1.title'       // 드래그대상 요소<br />
     * options.show: true                   // 호출할 때 바로 표시할 것인가...
     *
     * @class
     * @name coma.ui.Modal
     * @extends coma.ui.View
     */
    var Modal = ui('Modal', /** @lends coma.ui.Modal# */ {
        bindjQuery: 'modal',
        defaults: {
            overlay: true,
            clone: true,
            closeByEscape: true,
            overlayClose: false,
            removeOnClose: false,
            draggable: false,
            dragHandle: 'header h1',
            show: true,
            overlayOpacity: 0.7,
            effect: 'slide', // slide | fade
            cssTitle: '.ui_modal_title',
            flexible: false, // 'both' = true, 'horiz', 'vert'
            offsetTop: 16,
            offsetLeft: 16
        },

        events: {
            'click button[data-event]': function (e) {
                var me   = this,
                    $btn = $(e.currentTarget),
                    event = ($btn.attr('data-event') || ''),
                    ev;

                if (event) {
                    me.triggerHandler(ev = $.Event('modal' + event), [me]);
                    if (ev.isDefaultPrevented()) {
                        return;
                    }
                }

                //this.hide();
            },
            'click .close, .ui_close': function (e) {
                e.preventDefault();
                e.stopPropagation();

                this.hide();
            }
        },

        selectors: {
            header: '>.laypop_header',
            content: '>.laypop_content',
            scroller: '>.laypop_content>.ui_scrollview',
            buttonWrap: '>.laypop_content>.btn_wrap'
        },

        /**
         * 생성자
         * @constructors
         * @param {String|Element|jQuery} el
         * @param {Object} options
         * @param {Boolean}  options.overlay:true 오버레이를 깔것인가
         * @param {Boolean}  options.clone: true    복제해서 띄울 것인가
         * @param {Boolean}  options.closeByEscape: true    // esc키를 눌렀을 때 닫히게 할 것인가
         * @param {Boolean}  options.removeOnClose: false   // 닫을 때 dom를 삭제할것인가
         * @param {Boolean}  options.draggable: true                // 드래그를 적용할 것인가
         * @param {Boolean}  options.dragHandle: 'h1.title'     // 드래그대상 요소
         * @param {Boolean}  options.show: true                 // 호출할 때 바로 표시할 것인가...
         */
        initialize: function (el, options) {
            var me = this;
            if (me.supr(el, options) === false) {
                return;
            }

            me.$el.addClass('ui_modal_layer');

            me.isShown = false;
            me.isAjaxMoodal = me.$el.hasClass('ui_modal_ajax');
            me._originalDisplay = me.$el.css('display');

            me.$el.css({
                position: 'absolute',
                backgroundColor: '#ffffff',
                outline: 'none',
                backgroundClip: 'padding-box',
                marginLeft: 0,
                marginTop: 0
            });
            me.$scroller.find('>.ui_scrollarea').css({'height': '100%'});
            if (core.browser.isMobile && me.options.flexible) {
                me.$el.css('maxHeight', 'none');
                me.$scroller.find('>.ui_scrollarea').css('maxHeight', 'none');
            }

            me.options.show && core.util.waitImageLoad(me.$('img')).done(function () {
                me.show();
            });
        },

        _bindAria: function () {
            var me = this;
            // TODO
            me.$el.attr({
                'role': 'dialog',
                //'aria-hidden': 'false',
                'aria-describedby': me.$content.attr('id') || me.$content.attr('id', me.cid + '_content').attr('id'),
                'aria-labelledby': me.$('h1').attr('id') || me.$('h1').attr('id', me.cid + '_title').attr('id')
            });
        },

        /**
         * zindex때문에 모달을 body바로 위로 옮긴 후에 띄우는데, 닫을 때 원래 위치로 복구시켜야 하므로,
         * 원래 위치에 임시 홀더를 만들어 놓는다.
         * @private
         */
        _createHolder: function () {
            var me = this;
            if (me.isAjaxMoodal) { return; }
            me.$holder = $('<span class="ui_modal_holder" style="display:none;"></span>').insertAfter(me.$el);
        },

        /**
         * 원래 위치로 복구시키고 홀더는 제거
         * @private
         */
        _replaceHolder: function () {
            var me = this;

            if (me.isAjaxMoodal) { return; }
            if (me.$holder) {
                me.$el.insertBefore(me.$holder);
                me.$holder.remove();
            }
        },

        /**
         * 토글
         */
        toggle: function () {
            var me = this;

            me[me.isShown ? 'hide' : 'show']();
        },

        /**
         * 표시
         */
        show: function () {
            if (this.isShown) {
                return;
            }

            var me   = this,
                opts = me.options,
                e    = $.Event('modalshow');

            me.trigger(e);
            if (me.isShown || e.isDefaultPrevented()) {
                return;
            }

            me.isShown = true;
            if (opts.title) {
                me.$(opts.cssTitle).html(opts.title || '알림');
            }

            me._createHolder();
            me._createModalContainer();
            me.layout();

            var defer = $.Deferred();
            if (opts.effect === 'fade') {
                me.$el.hide().fadeIn('fast', function () {
                    defer.resolve();
                });
            } else if (opts.effect === 'slide') {
                var modalHeight = me.$el.height(),
                    winHeight = core.util.getWinHeight();
                me.$el.css({
                    'top': -modalHeight
                }).animate({top: me.forceResize ? opts.offsetTop :  (winHeight - modalHeight) / 2}, 400, function () {
                    defer.resolve();
                });
            } else {
                defer.resolve();
            }

            defer.done(function () {
                me.trigger('modalshown', {
                    module: me
                });

                me._bindAria(); // aria 셋팅
                /*me.$el.attr('aria-hidden', 'false');*/
                me._draggabled();    // 드래그 기능 빌드
                if (me.options.closeByEscape){
                    me._escape();   // esc키이벤트 바인딩
                }
                //// ModalManager로 옮김: me._enforceFocus();   // 탭키로 포커스를 이동시킬 때 포커스가 레이어팝업 안에서만 돌도록 빌드
                me._focusing();
            });

        },

        /**
         * 표시때 포커싱대상에 포커스 주기
         * @private
         */
        _focusing: function () {
            var me = this;
            var $focusEl = me.$('[data-autofocus=true]');
            if ($focusEl.size() > 0) {
                $focusEl.eq(0).focus();
            } else {
                me.$el.find('h1:first').attr('tabindex', 0).css('outline', 'none').focus();
            }
        },

        /**
         * 숨김
         */
        hide: function (e) {
            if (e) {
                e.preventDefault();
            }

            var me = this;
            e = $.Event('modalhide');
            me.trigger(e);
            if (!me.isShown || e.isDefaultPrevented()) {
                return;
            }

            var defer = $.Deferred();
            me.isShown = false;
            if (me.options.effect === 'fade') {
                me.$el.fadeOut('fast', function () {
                    defer.resolve();
                });
            } else if (me.options.effect === 'slide') {
                me.$el.animate({
                    top: -me.$el.outerHeight()
                }, 400, function () {
                    defer.resolve();
                });
            } else {
                defer.resolve();
            }

            defer.done(function () {
                me.trigger('modalhidden');

                me.$el.removeClass('ui_modal_layer');    // dom에 추가된 것들 제거
                if (me.options.closeByEscape){
                    me._escape(false);    // esc 키이벤트 제거
                }

                if (me.options.opener) {
                    $(me.options.opener).removeAttr('aria-controls').focus();    // 레이어팝업을 띄운 버튼에 포커스를 준다.
                }

                me.$el.css({
                    'position': '',
                    'top': '',
                    'left': '',
                    'outline': '',
                    'marginLeft': '',
                    'marginTop': '',
                    'backgroundClip': '',
                    'zIndex': '',
                    'display': me._originalDisplay
                }).off('.'+me.cid);////.attr('aria-hidden', 'true');
                me._removeModalContainer();
                //me.$container.remove();
                //me.$container = null;    // 오버레이를 제거
                ////// $('body').removeAttr('aria-hidden');    // 비활성화를 푼다.

                me.release();
            });
        },


        /**
         * 도큐먼트의 가운데에 위치하도록 지정
         */
        layout: function () {
            var me = this,
                opts = me.options,
                width, height, attr, marginRight, marginTop,
                paddingBottom, contentHeight, buttonWrapHeight,
                winHeight = core.util.getWinHeight(),
                winWidth  = Math.max(core.util.getWinWidth(), core.util.getDocWidth());

            me.$el.css({
                'display': 'inline',
                'visibility': 'hidden',
                'top': '',
                'left': '',
                'height': '',
                'width': ''
            });
            me.$content.css('height', '');
            me.$scroller.css('height', '');
            width = me.$el.width();
            height = me.$el.height();

            attr = {
                visibility: '',
                display: 'inline'
            };

            me.forceResize = false;
            if (core.browser.isMobile && opts.flexible) {
                me.forceResize = true;
                attr.top = opts.offsetTop;
                attr.height = winHeight - (opts.offsetTop * 2) - parseInt(me.$el.css('paddingBottom'), 10);
                attr.left = opts.offsetLeft;
                attr.width = winWidth - (opts.offsetLeft * 2);
            } else {
                if (height > winHeight) {
                    me.forceResize = true;
                    attr.top = 0;
                    attr.height = winHeight;
                } else {
                    attr.top = (winHeight - height) / 2;
                    attr.height = '';
                }
                marginRight = parseInt(me.$el.css('margin-right') || 0, 10);
                attr.left = Math.max(marginRight, (width > winWidth ? 0 : ((winWidth - width) / 2)));
            }

            if (me.forceResize) {
                marginTop = parseInt(me.$content.css('marginTop'), 10);
                paddingBottom = parseInt(me.$content.css('paddingBottom'), 10);
                buttonWrapHeight = me.$buttonWrap.outerHeight();
                contentHeight = (attr.height - me.$header.outerHeight() - marginTop - paddingBottom);

                me.$content.css('height', contentHeight);
                me.$scroller.css('height', contentHeight - buttonWrapHeight);
            }
            me.$el.stop().css(attr);
            me.$scroller.scScrollview('update');
        },

        /**
         * 타이틀 영역을 드래그기능 빌드
         * @private
         */
        _draggabled: function () {
            var me      = this,
                options = me.options;

            if (!options.draggable || me.bindedDraggable) {
                return;
            }
            me.bindedDraggable = true;

            if (options.dragHandle) {
                me.$el.css('position', 'absolute');
                core.css3.prefix('user-select') && me.$(options.dragHandle).css(core.css3.prefix('user-select'), 'none');
                me.on('mousedown touchstart', options.dragHandle, function (e) {
                    e.preventDefault();

                    var isMouseDown = true,
                        pos         = me.$el.position(),
                        oriPos      = {
                            left: e.pageX - pos.left,
                            top: e.pageY - pos.top
                        }, handler;

                    $doc.on(me.getEN('mousemove mouseup touchmove touchend touchcancel'), handler = function (e) {

                        switch (e.type) {
                            case 'mousemove':
                            case 'touchmove':
                                if (!isMouseDown) {
                                    return;
                                }
                                me.$el.css({
                                    left: e.pageX - oriPos.left,
                                    top: e.pageY - oriPos.top
                                });
                                break;
                            case 'mouseup':
                            case 'touchend':
                            case 'touchcancel':
                                isMouseDown = false;
                                $doc.off(me.getEN(), handler);
                                var offset = me.$el.offset();
                                if (offset.top < 0) {
                                    offset.top = 10;
                                }
                                if (offset.left < 0) {
                                    offset.left = 10;
                                }
                                me.$el.css(offset);
                                break;
                        }
                    });
                });

                me.$(options.dragHandle).css('cursor', 'move');
            }
        },

        /**
         * 모달이 띄워진 상태에서 탭키를 누를 때, 모달안에서만 포커스가 움직이게
         * @private
         */
        _enforceFocus: function () {
            var me = this;
            $doc.off('focusin.'+me.cid)
                .on('focusin.'+me.cid, me.proxy(function(e) {
                    if (me.$el[0] !== e.target && !$.contains(me.$el[0], e.target)) {
                        me.$el.find(':focusable').first().focus();
                    }
                }));
        },

        /**
         * esc키를 누를 때 닫히도록
         * @private
         */
        _escape: function (isOff) {
            if (isTouch) {
                return;
            }
            var me = this;

            if (isOff !== false) {
                me.off('keyup').on('keyup', me.proxy(function (e) {
                    me.off('keyup');
                    e.which === 27 && me.hide();
                }));
            } else {
                me.off('keyup');
            }
        },

        /**
         * 컨테이너 생성
         * @private
         */
        _createModalContainer: function () {
            var me = this;

            me.$container = $('<div class="ui_modal_container" />');
            if (me.options.overlay) {
                me.$dim = $('<div class="ui_modal_dim" />');
                me.$dim.css({
                    'backgroundColor': '#000',
                    'opacity': me.options.overlayOpacity,
                    'position': 'fixed',
                    'top': 0,
                    'left': 0,
                    'right': 0,
                    'height': '120%',
                    'z-index': 1
                }).appendTo(me.$container);
            }

            me.$container.css({
                'position': 'fixed',
                'top': 0,
                'left': 0,
                'right': 0,
                'height': '120%',
                //'bottom': -100,
                'zIndex': ModalManager.nextZIndex()
            }).append(me.$el.css({
                'zIndex': 2
            })).appendTo('body');

            core.browser.isTouch && me.$container.on('touchmove.'+me.cid, function (e) {
                e.preventDefault();
            });

            if (me.options.overlayClose) {
                me.$container.off('click.modal').on('click.modal', function (e) {
                    if (e.target != e.currentTarget) {
                        return;
                    }
                    me.$container.off('click.modal');
                    me.hide();
                });
            }

        },

        /**
         * 컨테이너 제거
         * @private
         */
        _removeModalContainer: function () {
            var me = this;

            if (me.options.removeOnClose) {
                me.$el.remove();    // 닫힐 때 dom에서 삭제하도록 옵션이 지정돼있으면, dom에서 삭제한다.
            } else {
                me._replaceHolder();    // body밑으로 뺀 el를 다시 원래 위치로 되돌린다.
            }
            me.$dim.off();
            me.$container.off().remove();
            me.$dim = null;
            me.$container = null;
        },

        /**
         * 모달의 사이즈가 변경되었을 때 가운데위치를 재조절
         * @example
         * $('...').scModal(); // 모달을 띄운다.
         * $('...').find('.content').html( '...');  // 모달내부의 컨텐츠를 변경
         * $('...').scModal('center');    // 컨텐츠의 변경으로 인해 사이즈가 변경되었으로, 사이즈에 따라 화면가운데로 강제 이동
         */
        center: function () {
            this.layout();
        },

        /**
         * 열기
         */
        open: function () {
            this.show();
        },

        /**
         * 닫기
         */
        close: function () {
            this.hide();
        },

        /**
         *
         */
        release: function () {
            var me = this;

            me.supr();
        }
    });


    /**
     * 열려 있는 레이어팝업을 가운데에 위치시키는 글로벌이벤트
     * @example
     * coma.PubSub.trigger('resize:modal')
     */
    /*core.PubSub.on('resize:modal', function() {
     if(Modal.active){
     Modal.active.center();
     }
     });*/

    //윈도우가 리사이징 될때 가운데에 자동으로 위치시킴
    /*$(window).on('resize.modal', function() {
     if(Modal.active){
     Modal.active.center();
     }
     });*/

    core.modal = function (el, options) {
        $(el).scModal(options);
    };

    /**
     * @class
     * @name coma.ui.AjaxModal
     * @description ajax로 불러들인 컨텐츠를 모달로 띄워주는 모듈
     * @extends coma.ui.View
     */
    $.ajaxModal = core.ui.ajaxModal = function () {
        var $modal,
            promise = $.Deferred();

        $.ajax.apply($.ajax, core.toArray(arguments)).done( function (html) {
            $modal = $(core.string.trim(html)).addClass('ui_modal_ajax').appendTo('body');
            $modal.scModal({removeOnClose: true}).buildUIControls();
            promise.resolve($modal);
        }).fail(function (){
            promise.reject.apply(promise, arguments);
        });

        promise.closeModal = function () {
            $modal &&  $modal.scModal('close');
            $modal = null;
        };

        return promise;
    };

    core.ui.alert = function () {
        /**
         * 얼럿레이어
         * @memberOf coma.ui
         * @name alert
         * @function
         * @param {string} msg 얼럿 메세지
         * @param {Object} options 모달 옵션
         * @example
         * coma.ui.alert('안녕하세요');
         */
        return function (msg, options) {
            if (typeof msg !== 'string' && arguments.length === 0) {
                options = msg;
                msg = '';
            };
            var el = $(core.ui.alert.tmpl).appendTo('body').find('div.ui_modal_content').html(msg).end();
            var modal = new Modal(el, core.extend({removeOnClose: true}, options));
            modal.getElement().buildUIControls();
            modal.on('modalhidden', function () {
                el = null;
                modal = null;
            });
            return modal;
        };
    }();
    core.ui.alert.tmpl = ['<div class="layer_popup small ui_alert" role="alert" style="display:none">',
        '<h1 class="title ui_modal_title">알림창</h1>',
        '<div class="cntt">',
        '<div class="ui_modal_content">&nbsp;</div>',
        '<div class="wrap_btn_c">',
        '<button type="button" class="btn_emphs_small" data-role="ok"><span><span>확인</span></span></button>',
        '</div>',
        '</div>',
        '<button type="button" class="ui_modal_close"><span>닫기</span></button>',
        '<span class="shadow"></span>',
        '</div>'].join('');
    ///////////////////////////////////////////////////////////////////////////////////////

    if (typeof define === "function" && define.amd) {
        define('modules/modal', [], function () {
            return Modal;
        });
    }

})(jQuery, window[LIB_NAME]);

/*!
 * @module coma.ui.Tooltip
 * @author odyseek
 * @email odyseek@vi-nyl.com
 * @create 2015-03-17
 * @license MIT License
 */
(function ($, core, undefined) {
    "use strict";
    if (core.ui.Tooltip) { return; }

    var $doc    = $(document),
        $win    = $(window),
        isTouch = core.browser.isTouch;

    /**
     * 툴팁 레이어
     * @class
     * @name coma.ui.Tooltip
     * @extends coma.ui.View
     */
    var Tooltip = core.ui('Tooltip', /** @lends coma.ui.Tooltip# */{
        bindjQuery: 'tooltip',
        defaults: {
            interval: 300
        },

        /**
         * 생성자
         * @param {jQuery|Node|String} el 대상 엘리먼트
         * @param {JSON} options {Optional} 옵션
         */
        initialize: function (el, options) {
            var me = this;

            if (me.supr(el, options) === false) {
                return;
            }

            me.$tooltip = (me.$el.attr('data-tooltip-target') ? $(me.$el.attr('data-tooltip-target')) : me.$el.next('div'));
            me.isShown = false;
            me.timer = null;

            me.on('click.tooltip', function (e) {
                e.preventDefault();
                e.stopPropagation();

                if (me.isShown) {
                    me.close();
                } else {
                    me.open();
                }
            });

            // 마우스가 버튼위에서 .5초이상 머물었을 때만 툴팁이 표시되며,
            // 마우스가 버튼과 툴팁박스를 완전히 벗어나서 .5초가 지났을 때만 툴팁이 사라지도록 처리
            // 마우스가 닿을 때마다 보였다안보였다하는 건 너무 난잡해 보여서...
            me.on('mouseenter', me.open.bind(me)).on('mouseleave', me.close.bind(me));
            me.$tooltip.on('focusin.tooltip mouseenter.tooltip', function () {
                if (me.$tooltip.data('timer')) {
                    clearTimeout(me.$tooltip.data('timer')), me.$tooltip.removeData('timer');
                }
            }).on('mouseleave.tooltip', function () {
                me.isShown && me.$tooltip.data('timer', setTimeout(function () {
                    me.isShown = false, me.$tooltip.hide();
                    if (me.$tooltip.data('timer')) {
                        clearTimeout(me.$tooltip.data('timer')), me.$tooltip.removeData('timer');
                    }
                }, me.options.interval));
            }).on('click', function (){
                clearTimeout(me.$tooltip.data('timer')), me.$tooltip.removeData('timer');
            }).on('click.tooltip focusout.tooltip', '.ui_tooltip_close', function (e) {
                e.preventDefault();
                me.close();
                if (e.type === 'click') me.$el.focus();
            });

            me.open();
        },
        /**
         * 표시
         */
        open: function () {
            var me     = this,
                offset = me.$el.offset();

            offset.top += me.$el.height();
            me.timer = setTimeout(function () {
                me.$tooltip/*.css(offset)*/.fadeIn('fast');
                me.isShown = true;
            }, me.options.interval);
        },
        /**
         * 숨김
         */
        close: function () {
            var me = this;

            clearTimeout(me.timer), me.timer = null;
            if (me.isShown) {
                me.$tooltip.data('timer', setTimeout(function () {
                    me.isShown = false;
                    me.$tooltip.hide();
                }, me.options.interval));
            }
        },
        /**
         * 소멸자
         */
        destroy: function () {
            var me = this;

            me.supr();
            me.$tooltip.off('.tooltip').removeData('timer');
        }
    });

    $doc.on('mouseenter.tooltip focusin.tooltip click.tooltip', '[data-control=tooltip]', function () {
        var $btn = $(this);
        //if ($btn.data('ui_tooltip')){ return; }

        $btn.scTooltip();
    });

    if (typeof define === "function" && define.amd) {
        define('modules/tooltip', [], function () {
            return Tooltip;
        });
    }
})(jQuery, window[LIB_NAME]);

/*!
 * @module coma.ui.Tab
 * @author comahead
 * @email comahead@vi-nyl.com
 * @create 2014-12-08
 * @license MIT License
 */
(function ($, core) {
    "use strict";

    if(core.ui.Tab){ return; }

    var BaseTab = core.ui.View.extend({
        name: 'BaseTab',
        defaults: {
            tabSelector: '>li',
            btnSelector: '>a'
        },
        initialize: function (el, options) {
            var me = this, index;
            if (me.supr(el, options) === false) { return }

            me._findControls();
            me._bindEvents();
            me._initTab();
        },
        _initTab: function (){
            var me = this, index;
            if ((index = me.$tabs.filter('.on').index()) >= 0) {
                me.selectTab(index);
            }
        },
        _findControls: function () {
            var me = this,
                selectors = [];

            me.$tabs = me.$(me.options.tabSelector);
            me.$tabs.each(function () {
                var $el = me.options.btnSelector ? $(this).find(me.options.btnSelector) : $(this),
                    cont = $el.attr('href') || $el.attr('data-href');
                if (cont) {
                    selectors.push(cont);
                }
            });

            if (selectors.length) {
                me.$contents = $(selectors.join(', '));
            } else {
                me.$contents = $();
            }
        },
        _bindEvents: function () {
            var me = this;
            me.$el.on('click', me.options.tabSelector + me.options.btnSelector, function (e) {
                e.preventDefault();
                var index = me.$tabs.index(me.$tabs.has(this));
                me.selectTab(index);
            });
        },

        // 별도의 처리가 필요한거는 오버라이드
        _selectTab: function (index) {},
        _toggleText: function (index) {
            var me = this,
                txtSpan = (me.options.btnSelector ? me.options.btnSelector + ' ' : '')+'span.hide';

            me.$tabs.find(txtSpan).html(' ');
            me.$tabs.eq(index).find(txtSpan).html('현재 선택됨');
        },
        _getEventTarget: function (index) {
            var me = this;
            return me.options.btnSelector ? me.$tabs.eq(index).find(me.options.btnSelector) : me.$tabs.eq(index);
        },
        /**
         * index에 해당하는 탭을 활성화
         * @param {number} index 탭버튼 인덱스
         */
        selectTab: function(index) {
            var me = this, e, param;
            if(index < 0 || (me.$tabs.length && index >= me.$tabs.length)) {
                index = me.options.selectedIndex;
            }

            param = {
                selectedIndex: index,
                tab: me.$tabs.get(index),
                content: me.$contents.get(index),
                sender: me._getEventTarget(index)
            };

            me.trigger(e = $.Event('tabchange'), param);
            if(e.isDefaultPrevented()) { return false; }

            me.selectedIndex = index;
            me._selectTab(index);
            me._toggleText(index);

            me.$tabs.removeClass('on').eq(index).addClass('on');
            me.$contents.hide().eq(index).show();

            me.trigger('tabchanged', param);
        }
    });

    /**
     * 다음 네항목 중에서 type에 따라 필요한걸 구현해주면 된다.
     * defaults: 기본 옵션값
     * _toggleText: 탭이 선택여부에 따른 숨김문구 변경하는 함수
     * _selectTab: 선택될 때 호출되는 함수
     * _initTab: 초기화 함수
     */
    var TabTypes = {
        'type01': BaseTab,
        'type02': BaseTab.extend({ // 바로 하위에 버튼이 있는 경우
            defaults: {
                tabSelector: '>a, >button',
                btnSelector: false
            },
            // overide
            _toggleText: function (index) {
                var me = this;
                me.$tabs.find('span.hide').html(' ');
                me.$tabs.eq(index).find('span.hide').html('현재 선택됨');
            }
        }),
        'type03': BaseTab.extend({  // 탭이 탭영역을 벗어날 경우 좌우로 스와이핑 되는 탭
            defaults: {
                tabSelector: '>.tab_hbox>ul>li',
                btnSelector: '>a'
            },
            selectors: {
                tabBox: '>.tab_hbox',
                scroller: '>.tab_hbox>ul'
            },
            // overide
            _initTab: function(){
                var me = this, html, $ul, size;

                html = ['<div class="tab_nav" style="display:none;">',
                    '<a href="#" class="prev_tab"><span class="hide">이전 탭보기</span></a>',
                    '<a href="#" class="next_tab"><span class="hide">다음 탭보기</span></a>',
                    '</div>'].join('');

                size = me._getTabsWidth();

                me.$scroller.css({'width': 1000});
                me.$tabBox.css({'margin': 0});
                me.$el.prepend(me.$tabNavi = $(html));

                var move = function(val, isAni) {
                    if(isAni) {
                        me.$scroller.stop().animate({'margin-left': val}, function(e) {
                            enabled();
                        });
                    } else {
                        me.$scroller.stop().css({'margin-left': val});
                        enabled();
                    }
                };
                var enabled = function(size) {
                    var margin = parseInt(me.$scroller.css('margin-left'), 10) || 0;

                    size = size || me._getTabsWidth();

                    if(!size.isOver) {
                        me.$tabNavi.hide();
                        me.$tabBox.css({'margin': 0});
                        me.$scroller.css('margin-left', 0);
                    } else {
                        me.$tabNavi.show();
                        me.$tabBox.css({'margin': '0 ' + (me.$tabNavi.find('>a').width()) + 'px'});

                        me.$tabNavi.find('>.prev_tab').toggleClass('on', margin !== 0 && size.tabWidth < size.tabsWidth);
                        me.$tabNavi.find('>.next_tab').toggleClass('on', margin !== size.tabWidth - size.tabsWidth  && size.tabWidth < size.tabsWidth);
                    }

                };

                // 탭 클릭
                me.on('click', '.tab_nav a', function(e) {
                    e.preventDefault();

                    var $el = $(this),
                        size = me._getTabsWidth(),
                        marginLeft = parseInt(me.$scroller.css('margin-left'), 10) || 0;

                    if($el.hasClass('prev_tab')) {
                        move(Math.min(0, marginLeft + (size.tabWidth * 0.5)), true);
                    } else {
                        move(Math.max(size.tabWidth - size.tabsWidth, marginLeft - (size.tabWidth * 0.5)), true);
                    }
                });
                var marginLeft;
                me.$tabBox.gesture().on('gesturestart', function () {
                    if(!size.isOver) {
                        return;
                    }
                    marginLeft = parseInt(me.$scroller.css('margin-left'), 10) || 0;
                }).on('gesturemove', function (e, data) {
                    if(!size.isOver) {
                        return;
                    }
                    if(data.direction === 'left') {
                        move(Math.max(size.tabWidth - size.tabsWidth, marginLeft + data.diff.x));
                    } else if(data.direction === 'right') {
                        move(Math.min(0, marginLeft + data.diff.x));
                    }
                });


                $(window).on('resizeend.'+me.cid, function() {
                    size = me._getTabsWidth();
                    if(size.isOver) {
                        move(0);
                    }
                    enabled(size);
                });
                enabled(size);

                me.supr();
            },

            /**
             * 탭 너비 구하기
             * @returns {{isOver: boolean, tabWidth: *, tabsWidth: (number|tabsWidth)}}
             * @private
             */
            _getTabsWidth: function(){
                var me = this,
                    tabsWidth = 0;

                me.$tabs.each(function(){
                    tabsWidth += $(this).width() + 1;
                });

                var result = {
                    tabWidth: me.$tabBox.width(),
                    tabsWidth: tabsWidth
                };

                return {
                    isOver: result.tabWidth < result.tabsWidth,
                    tabWidth: result.tabWidth,
                    tabsWidth: result.tabsWidth
                };
            }
        }),
        'type04': BaseTab.extend({  // 라디오박스
            defaults: {
                tabSelector: '>li',
                btnSelector: '>span>a'
            },
            // overide
            _initTab: function (){
                var me = this,
                    index = me.$tabs.filter('>span>:radio:checked').index();
                if (index < 0) {
                    index = me.options.selectedIndex;
                }
                me.selectTab(index);
            },
            // overide
            _bindEvents: function () {
                var me = this;
                me.$el.on('click', '>li>span>a, >li>span>label', function (e) {
                    e.preventDefault();
                    var index = me.$tabs.index($(this).closest('li').eq(0));
                    me.selectTab(index);
                });
            },
            // overide
            _selectTab: function (index) {
                var me = this;
                me.$tabs.eq(index).find(':radio').checked(true);
            },
            // overide
            _toggleText: function (index) {
                return false;
            }
        })
    };

    var Tab = core.ui('Tab', {
        bindjQuery: 'tab',
        defaults: {
            selectedIndex: 0
        },
        initialize: function (el, options) {
            var me = this;

            if (me.supr(el, options) === false) { return; }

            me._detectTabType();
        },
        /**
         * tabType에 따라 탭클래스 생성
         * @private
         */
        _detectTabType: function () {
            var me = this,
                tabType, TabClass;

            tabType = me.options.tabType || 'type01'; //'scrollTab';
            if (TabClass = TabTypes[tabType]) {
                me.tab = new TabClass(me.el, me.options);
            } else {
                throw new Error('탭가이드에 없는 형식입니다.');
            }
        },

        /**
         * index에 해당하는 탭을 활성화
         * @param {number} index 탭버튼 인덱스
         */
        selectTab: function(index) {
            var me = this, e;
            me.tab.selectTab(index);
        }
    });

    if (typeof define === "function" && define.amd) {
        define('modules/tab', ['lib/jquery'], function() {
            return Tab;
        });
    }

})(jQuery, window[LIB_NAME]);


/*!
 * @module coma.ui.Gesture
 * @author comahead
 * @email comahead@vi-nyl.com
 * @create 2014-12-11
 * @license MIT License
 */
(function($, core, undefined) {
    "use strict";
    if (core.ui.Gesture) { return; }

    var util = core.util;
    var Gesture = core.ui('Gesture', {
        defaults: {
            threshold: 50,
            direction: 'horizontal'
        },
        initialize: function(el, options) {
            var me = this;
            if (me.supr(el, options) === false) {
                return;
            }

            me.isHoriz = me.options.direction === 'horizontal' || me.options.direction === 'both';
            me.isVerti = me.options.direction === 'vertical' || me.options.direction === 'both';
            me._bindGestureEvents();
        },
        _bindGestureEvents: function() {
            var me = this,
                touchStart,
                downPos,
                isSwipe = false,
                isScroll = false,
                $doc = $(document);

            me.$el[0].onselectstart = function (){ return false; };
            me.$el.attr('unselectable', 'on');
            me.$el.on('mousedown.gesture, touchstart.gesture', function(downEvent) {
                if (downEvent.type === 'mousedown') {
                    downEvent.preventDefault();
                }
                downPos = touchStart = util.getEventPoint(downEvent);
                isSwipe = isScroll = false;


                $doc.on('mousemove.gesture'+me.cid+' touchmove.gesture'+me.cid, function (moveEvent) {
                    var touch = util.getEventPoint(moveEvent),
                        diff, slope, swipeY, swipeX;
                    if (!touchStart || isScroll) {
                        return;
                    }

                    diff = util.getDiff(touch, touchStart);
                    if (!isSwipe) {
                        swipeX = Math.abs(diff.y) / Math.abs(diff.x || 1);
                        swipeY = Math.abs(diff.x) / Math.abs(diff.y || 1);
                        if ((swipeX < 1 && me.isHoriz) || (swipeY < 1 && me.isVerti)) {
                            isSwipe = true;
                            touch.event = moveEvent;
                            me.triggerHandler('gesturestart', touch);
                        } else {
                            if ((me.isHoriz && swipeX > 1) || (me.isVerti && swipeY > 1)) {
                                isScroll = true;
                            }
                        }
                    }

                    if (isSwipe) {
                        moveEvent.stopPropagation();
                        moveEvent.preventDefault();

                        touch.diff = diff;
                        touch.direction = util.getDirection(touchStart, touch); //getDirection(diff, me.options.direction);
                        touch.event = moveEvent;
                        me.triggerHandler('gesturemove', touch)
                    }
                }).on('mouseup.gesture'+me.cid+' mousecancel.gesture'+me.cid+' touchend.gesture'+me.cid+' touchcancel.gesture'+me.cid, function (upEvent) {
                    if (isSwipe && touchStart) {
                        var touch = util.getEventPoint(upEvent, 'end');
                        touch.diff = util.getDiff(touch, touchStart);


                        touch.direction = util.getDirection(touchStart, touch);
                        touch.event = upEvent;
                        if(Math.abs(touch.diff.x) > me.options.threshold
                            || Math.abs(touch.diff.y) > me.options.threshold) {
                            if (upEvent.type.indexOf('cancel') >= 0) {
                                me.triggerHandler('gesturcancel', touch);
                            } else {
                                me.triggerHandler('gestureend', touch);
                            }
                        }
                        switch(touch.direction) {
                            case 'left':
                            case 'right':
                                if(Math.abs(touch.diff.x) > me.options.threshold && me.isHoriz){
                                    me.triggerHandler('gesture'+touch.direction);
                                }
                                break;
                            case 'up':
                            case 'down':
                                if(Math.abs(touch.diff.y) > me.options.threshold && me.isVerti){
                                    me.triggerHandler('gesture'+touch.direction);
                                }
                                break;
                        }
                    }/* else {
                     var pos = util.getEventPoint(upEvent, 'end');
                     if(downPos.x === pos.x || downPos.y === pos.y) {
                     $(upEvent.target).trigger('click', {fake: true});
                     }
                     }*/

                    touchStart = null;
                    isScroll = false;

                    $doc.off('.gesture'+me.cid)
                });
            }).on('click', 'a, button', function(e) {
                if(!downPos){ return; }
                var pos = util.getEventPoint(e);
                if(downPos.x != pos.x || downPos.y != pos.y) {
                    e.preventDefault();
                }
            });
        },

        release: function(){
            this.off('.gesture'+this.cid);
            this.supr();
        }
    });

    core.ui.bindjQuery(Gesture, 'gesture');
    if (typeof define === 'function' && define.amd) {
        define('modules/gesture', [], function (){
            return Gesture;
        });
    }
})(jQuery, window[LIB_NAME]);

/*!
 * @module coma.ui.checkboxAllChecker
 * @author comahead
 * @email comahead@vi-nyl.com
 * @create 2015-03-31
 * @license MIT License
 *
 * @modifier comahead@vi-nyl.com
 */
(function ($, core, undefined) {
    "use strict";
    if (core.ui.checkboxAllChecker) {
        return;
    }

    var CheckboxAllChecker = core.ui('CheckboxAllChecker', {
        bindjQuery: 'checkboxAllChecker',
        defaults: {
            mode: ''
        },
        initialize: function (el, options) {
            var me = this;

            if (me.supr(el, options) === false) {
                return;
            }

            me.$wrapper = $(me.$el.attr('data-check-all'));
            if (me.$wrapper.size() === 0) { return; }

            me.$checkboxes = me.$wrapper.find(':checkbox');
            me._bindEvents();
        },
        _bindEvents: function () {
            var me = this,
                selector = ':checkbox:enabled:not(.ui_checkall_ignore)';

            me.on('checkedchanged', function (e, checked) {
                me.$wrapper.find(selector).not(this).checked(checked, false);
            });

            var i = 0,
                oldCount;
            me.$wrapper.on('checkedchanged', ':checkbox', function (e) {
                var count = me.$wrapper.find(selector + ':not(:checked)').not(me.$el[0]).length;
                if (oldCount != count) {
                    oldCount = count;
                    me.$el.checked(count === 0, false);
                }
            });
        }
    });

    if (typeof define === 'function' && define.amd) {
        define('modules/checkbox-all-checker', [], function (){
            return CheckboxAllChecker;
        });
    }

})(jQuery, window[LIB_NAME]);

/*!
 * @author comahead
 * @email comahead@vi-nyl.com
 * @create 2014-12-08
 * @license MIT License
 * @description 코마카드 전용 유틸함수 모음
 */
(function ($, core, undefined) {
    "use strict";
    if (core.ui.isNumberKeys) { return; }

    core.ui.isNumberKeys = function (keyCode) {
        return (keyCode >= 48 && keyCode <= 57)
            || (keyCode >= 96 && keyCode <= 105) // 오른쪽 숫자키
            || (keyCode === 37) // left
            || (keyCode === 39)  // right
            || (keyCode === 9)// left
            || (keyCode === 46) // delete
            || (keyCode === 35) // end
            || (keyCode === 36) // home
            || (keyCode === 144) // num lock
            || (keyCode === 109) // -
            || (keyCode === 189) // .
            || (keyCode === 8); // backspace
    };

    core.ui.setBodyOverflow = function (flag) {
        var $html = $('html'),
            cnt   = $html.data('overflowCount') === undefined ? 0 : $html.data('overflowCount');

        if (flag) {
            cnt += 1;
            if (cnt === 1) {
                $html.css('overflow', 'hidden');
            }
        } else {
            cnt = Math.max(cnt - 1, 0);
            if (cnt === 0) {
                $html.css('overflow', '');
            }
        }

        $html.data('overflowCount', cnt);
    };

    // 주어진 엘리먼트위치로 스크롤(헤더아래)
    core.util.scrollToElement = function($el, opts) {
        opts || (opts = {});
        var top,
            duration = opts.duration || 'fast',
            easing = opts.easing || 'easeOutQuad',
            complete = opts.complete || null,
            scroller;

        if (opts.scroller) {
            scroller = $(opts.scroller).children();
            top = ($el.offset().top - scroller.offset().top) + scroller.scrollTop();
        } else {
            scroller = $('html, body');
            top = $el.offset().top - (opts.ignoreHeader !== false ? $('#htop').height() : 0);
        }

        scroller.stop().animate({
            scrollTop: top - (opts.offset|0)
        }, {
            duration: duration,
            easing: easing,
            complete: complete
        });
    };

})(jQuery, window[LIB_NAME]);

/* Placeholders.js v3.0.2 */
/*(function(t){"use strict";console.log('placeholder');function e(t,e,r){return t.addEventListener?t.addEventListener(e,r,!1):t.attachEvent?t.attachEvent("on"+e,r):void 0}function r(t,e){var r,n;for(r=0,n=t.length;n>r;r++)if(t[r]===e)return!0;return!1}function n(t,e){var r;t.createTextRange?(r=t.createTextRange(),r.move("character",e),r.select()):t.selectionStart&&(t.focus(),t.setSelectionRange(e,e))}function a(t,e){try{return t.type=e,!0}catch(r){return!1}}t.Placeholders={Utils:{addEventListener:e,inArray:r,moveCaret:n,changeType:a}}})(this),function(t){"use strict";function e(){}function r(){try{return document.activeElement}catch(t){}}function n(t,e){var r,n,a=!!e&&t.value!==e,u=t.value===t.getAttribute(V);return(a||u)&&"true"===t.getAttribute(D)?(t.removeAttribute(D),t.value=t.value.replace(t.getAttribute(V),""),t.className=t.className.replace(R,""),n=t.getAttribute(F),parseInt(n,10)>=0&&(t.setAttribute("maxLength",n),t.removeAttribute(F)),r=t.getAttribute(P),r&&(t.type=r),!0):!1}function a(t){var e,r,n=t.getAttribute(V);return""===t.value&&n?(t.setAttribute(D,"true"),t.value=n,t.className+=" "+I,r=t.getAttribute(F),r||(t.setAttribute(F,t.maxLength),t.removeAttribute("maxLength")),e=t.getAttribute(P),e?t.type="text":"password"===t.type&&M.changeType(t,"text")&&t.setAttribute(P,"password"),!0):!1}function u(t,e){var r,n,a,u,i,l,o;if(t&&t.getAttribute(V))e(t);else for(a=t?t.getElementsByTagName("input"):b,u=t?t.getElementsByTagName("textarea"):f,r=a?a.length:0,n=u?u.length:0,o=0,l=r+n;l>o;o++)i=r>o?a[o]:u[o-r],e(i)}function i(t){u(t,n)}function l(t){u(t,a)}function o(t){return function(){m&&t.value===t.getAttribute(V)&&"true"===t.getAttribute(D)?M.moveCaret(t,0):n(t)}}function c(t){return function(){a(t)}}function s(t){return function(e){return A=t.value,"true"===t.getAttribute(D)&&A===t.getAttribute(V)&&M.inArray(C,e.keyCode)?(e.preventDefault&&e.preventDefault(),!1):void 0}}function d(t){return function(){n(t,A),""===t.value&&(t.blur(),M.moveCaret(t,0))}}function g(t){return function(){t===r()&&t.value===t.getAttribute(V)&&"true"===t.getAttribute(D)&&M.moveCaret(t,0)}}function v(t){return function(){i(t)}}function p(t){t.form&&(T=t.form,"string"==typeof T&&(T=document.getElementById(T)),T.getAttribute(U)||(M.addEventListener(T,"submit",v(T)),T.setAttribute(U,"true"))),M.addEventListener(t,"focus",o(t)),M.addEventListener(t,"blur",c(t)),m&&(M.addEventListener(t,"keydown",s(t)),M.addEventListener(t,"keyup",d(t)),M.addEventListener(t,"click",g(t))),t.setAttribute(j,"true"),t.setAttribute(V,x),(m||t!==r())&&a(t)}var b,f,m,h,A,y,E,x,L,T,N,S,w,B=["text","search","url","tel","email","password","number","textarea"],C=[27,33,34,35,36,37,38,39,40,8,46],k="#ccc",I="placeholdersjs",R=RegExp("(?:^|\\s)"+I+"(?!\\S)"),V="data-placeholder-value",D="data-placeholder-active",P="data-placeholder-type",U="data-placeholder-submit",j="data-placeholder-bound",q="data-placeholder-focus",z="data-placeholder-live",F="data-placeholder-maxlength",G=document.createElement("input"),H=document.getElementsByTagName("head")[0],J=document.documentElement,K=t.Placeholders,M=K.Utils;if(K.nativeSupport=void 0!==G.placeholder,!K.nativeSupport){for(b=document.getElementsByTagName("input"),f=document.getElementsByTagName("textarea"),m="false"===J.getAttribute(q),h="false"!==J.getAttribute(z),y=document.createElement("style"),y.type="text/css",E=document.createTextNode("."+I+" { color:"+k+"; }"),y.styleSheet?y.styleSheet.cssText=E.nodeValue:y.appendChild(E),H.insertBefore(y,H.firstChild),w=0,S=b.length+f.length;S>w;w++)N=b.length>w?b[w]:f[w-b.length],x=N.attributes.placeholder,x&&(x=x.nodeValue,x&&M.inArray(B,N.type)&&p(N));L=setInterval(function(){for(w=0,S=b.length+f.length;S>w;w++)N=b.length>w?b[w]:f[w-b.length],x=N.attributes.placeholder,x?(x=x.nodeValue,x&&M.inArray(B,N.type)&&(N.getAttribute(j)||p(N),(x!==N.getAttribute(V)||"password"===N.type&&!N.getAttribute(P))&&("password"===N.type&&!N.getAttribute(P)&&M.changeType(N,"text")&&N.setAttribute(P,"password"),N.value===N.getAttribute(V)&&(N.value=x),N.setAttribute(V,x)))):N.getAttribute(D)&&(n(N),N.removeAttribute(V));h||clearInterval(L)},100)}M.addEventListener(t,"beforeunload",function(){K.disable()}),K.disable=K.nativeSupport?e:i,K.enable=K.nativeSupport?e:l}(this);*/

/*! ============================================================
 * jQuery Easing v1.3 - http://gsgd.co.uk/sandbox/jquery/easing/
 *
 * Open source under the BSD License.
 *
 * Copyright ? 2008 George McGinley Smith
 * All rights reserved.
 * https://raw.github.com/danro/jquery-easing/master/LICENSE
 * ======================================================== */
jQuery.easing.jswing=jQuery.easing.swing,jQuery.extend(jQuery.easing,{def:"easeOutQuad",swing:function(a,b,c,d,e){return jQuery.easing[jQuery.easing.def](a,b,c,d,e)},easeInQuad:function(a,b,c,d,e){return d*(b/=e)*b+c},easeOutQuad:function(a,b,c,d,e){return-d*(b/=e)*(b-2)+c},easeInOutQuad:function(a,b,c,d,e){return(b/=e/2)<1?d/2*b*b+c:-d/2*(--b*(b-2)-1)+c},easeInCubic:function(a,b,c,d,e){return d*(b/=e)*b*b+c},easeOutCubic:function(a,b,c,d,e){return d*((b=b/e-1)*b*b+1)+c},easeInOutCubic:function(a,b,c,d,e){return(b/=e/2)<1?d/2*b*b*b+c:d/2*((b-=2)*b*b+2)+c},easeInQuart:function(a,b,c,d,e){return d*(b/=e)*b*b*b+c},easeOutQuart:function(a,b,c,d,e){return-d*((b=b/e-1)*b*b*b-1)+c},easeInOutQuart:function(a,b,c,d,e){return(b/=e/2)<1?d/2*b*b*b*b+c:-d/2*((b-=2)*b*b*b-2)+c},easeInQuint:function(a,b,c,d,e){return d*(b/=e)*b*b*b*b+c},easeOutQuint:function(a,b,c,d,e){return d*((b=b/e-1)*b*b*b*b+1)+c},easeInOutQuint:function(a,b,c,d,e){return(b/=e/2)<1?d/2*b*b*b*b*b+c:d/2*((b-=2)*b*b*b*b+2)+c},easeInSine:function(a,b,c,d,e){return-d*Math.cos(b/e*(Math.PI/2))+d+c},easeOutSine:function(a,b,c,d,e){return d*Math.sin(b/e*(Math.PI/2))+c},easeInOutSine:function(a,b,c,d,e){return-d/2*(Math.cos(Math.PI*b/e)-1)+c},easeInExpo:function(a,b,c,d,e){return b==0?c:d*Math.pow(2,10*(b/e-1))+c},easeOutExpo:function(a,b,c,d,e){return b==e?c+d:d*(-Math.pow(2,-10*b/e)+1)+c},easeInOutExpo:function(a,b,c,d,e){return b==0?c:b==e?c+d:(b/=e/2)<1?d/2*Math.pow(2,10*(b-1))+c:d/2*(-Math.pow(2,-10*--b)+2)+c},easeInCirc:function(a,b,c,d,e){return-d*(Math.sqrt(1-(b/=e)*b)-1)+c},easeOutCirc:function(a,b,c,d,e){return d*Math.sqrt(1-(b=b/e-1)*b)+c},easeInOutCirc:function(a,b,c,d,e){return(b/=e/2)<1?-d/2*(Math.sqrt(1-b*b)-1)+c:d/2*(Math.sqrt(1-(b-=2)*b)+1)+c},easeInElastic:function(a,b,c,d,e){var f=1.70158,g=0,h=d;if(b==0)return c;if((b/=e)==1)return c+d;g||(g=e*.3);if(h<Math.abs(d)){h=d;var f=g/4}else var f=g/(2*Math.PI)*Math.asin(d/h);return-(h*Math.pow(2,10*(b-=1))*Math.sin((b*e-f)*2*Math.PI/g))+c},easeOutElastic:function(a,b,c,d,e){var f=1.70158,g=0,h=d;if(b==0)return c;if((b/=e)==1)return c+d;g||(g=e*.3);if(h<Math.abs(d)){h=d;var f=g/4}else var f=g/(2*Math.PI)*Math.asin(d/h);return h*Math.pow(2,-10*b)*Math.sin((b*e-f)*2*Math.PI/g)+d+c},easeInOutElastic:function(a,b,c,d,e){var f=1.70158,g=0,h=d;if(b==0)return c;if((b/=e/2)==2)return c+d;g||(g=e*.3*1.5);if(h<Math.abs(d)){h=d;var f=g/4}else var f=g/(2*Math.PI)*Math.asin(d/h);return b<1?-0.5*h*Math.pow(2,10*(b-=1))*Math.sin((b*e-f)*2*Math.PI/g)+c:h*Math.pow(2,-10*(b-=1))*Math.sin((b*e-f)*2*Math.PI/g)*.5+d+c},easeInBack:function(a,b,c,d,e,f){return f==undefined&&(f=1.70158),d*(b/=e)*b*((f+1)*b-f)+c},easeOutBack:function(a,b,c,d,e,f){return f==undefined&&(f=1.70158),d*((b=b/e-1)*b*((f+1)*b+f)+1)+c},easeInOutBack:function(a,b,c,d,e,f){return f==undefined&&(f=1.70158),(b/=e/2)<1?d/2*b*b*(((f*=1.525)+1)*b-f)+c:d/2*((b-=2)*b*(((f*=1.525)+1)*b+f)+2)+c},easeInBounce:function(a,b,c,d,e){return d-jQuery.easing.easeOutBounce(a,e-b,0,d,e)+c},easeOutBounce:function(a,b,c,d,e){return(b/=e)<1/2.75?d*7.5625*b*b+c:b<2/2.75?d*(7.5625*(b-=1.5/2.75)*b+.75)+c:b<2.5/2.75?d*(7.5625*(b-=2.25/2.75)*b+.9375)+c:d*(7.5625*(b-=2.625/2.75)*b+.984375)+c},easeInOutBounce:function(a,b,c,d,e){return b<e/2?jQuery.easing.easeInBounce(a,b*2,0,d,e)*.5+c:jQuery.easing.easeOutBounce(a,b*2-e,0,d,e)*.5+d*.5+c}});


(function ($, core) {
    "use strict";
    if (core._initUIEnv) { return; }
    core._initEnv = true;

    var $doc = $(document),
        $win = $(window);

    // 768이하 해상도에서 아코디온을 펼쳤을 때 top으로 강제 스크롤
    core.ui.setDefaults('Accordion', {
        on: {
            'accordionexpand': function (e, data) {
                if (!core.isMobileSize()) { return; }

                var $el = $(this), instance = $el.scAccordion('instance'),
                    $scrollview;

                if (instance.expandMode === 'all') {
                    return;
                }

                $scrollview = data.header.closest('.ui_scrollview');
                if ($scrollview.size() === 0){
                    core.util.scrollToElement(data.header);
                } else {
                    // 보류: 현업이 요구하면: core.util.scrollToElement(data.header, {scroller: $scrollview});
                }
            }
        }
    });


    // 공통 UI컨트롤 빌드
    $.fn.buildUIControls = function () {
        // 아코디언
        $('.ui_accordion', this).scAccordion();

        // 내부 스크롤
        $('.ui_scrollview', this).scScrollview();

        // 셀렉트 박스
        $('.ui_selectbox', this).scSelectbox();

        // 탭
        $('.ui_tab', this).scTab();

        // 전체선택
        $(':checkbox[data-check-all]', this).scCheckboxAllChecker();

        return this;
    };

    $(function () {
        $doc.buildUIControls();
    });

    // 형식 입력폼(금액, 전화번호): 김승일
    //  작동원리: getElementsByTagName으로 특정 태그를 찾고나서 dom이 동적으로 변경됐을 때, 다시 검색하지 않아도
    // 자동으로 새로 추가된 엘리먼트가 변수에 추가된다. 이를 이용하여 형식폼을 빌드시킨다.
    $(function() {
        core.importJs([
            'modules/formatter'
        ], function() {
            var inputs = document.getElementsByTagName('input'),
                len;
            setInterval(function () {
                if (len === inputs.length) { return; }
                len = inputs.length;
                var input;
                for (var i = 0; i < len; i++) {
                    input = inputs[i];
                    if (input.type === 'text'
                        && input.className.indexOf('ui_formatter') >= 0
                        && !input.getAttribute('data-formatted')) {
                        $(input).scFormatter();
                        input.setAttribute('data-formatted', 'true');
                    }
                }
            }, 500);
        });
    });

})(jQuery, window[LIB_NAME]);
