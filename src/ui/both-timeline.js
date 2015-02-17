/*!
 * @authror: 김승일
 * @email: comahead@vi-nyl.com
 * @created: 2014-06-27
 * @description: framework
 */
(function($, core, undefined) {
    "use strict";

    var ui = core.ui;

    /**
     * 좌우 타임라인 모듈
     * @class
     * @name common.ui.BothTimeline
     */
    var BothTimeline = ui('BothTimeline', /** @lends common.ui.BothTimeline# */{
        defaults: {
            arrowHeight: 28, // 화살표아이콘의 사이즈
            boxTopMargin: 24, // 박스간의 간격
            classPrefix: 'bt_',
            itemSelector: '>div>ul>li'
        },
        /**
         * @param {*} el
         * @param {Object} options (Optional) = this.defaults
         */
        initialize: function(el, options) {
            var me = this;

            if (me.supr(el, options) === false) {
                return;
            }

            // 각 아이템이 배치될 위치(좌 or 우)를 결정할 때 기준이 되는 값 :
            // 좌우에 차례로 배치되면서 각 아이템의 top+height를 계속 더해간다.(좌측에 배치되면 left에, 우측에 배치되면 right에)
            me.measure = {
                left: 0, // 왼쪽 높이
                center: 0, // 가운데부분 높이
                right: 0 // 오른쪽부분 높이
            };

            // 배치 시작
            //me.update(0);
        },

        /**
         * 각 요소들의 위치를 잡아준다.
         * @param {number} 몇번째부터 배치할 것인가..(더보기시에 사용)
         */
        update: function(start) {
            // 내부 이미지들이 다 불러질 때까지 기다렸다가 배치시킨다.
            core.util.waitImageLoad(this.$el.find(this.options.itemSelector).filter(function(i) {
                return i >= start;
            }).find('img')).done(function(){
                this._update(start);
            }.bind(this));
        },

        /**
         * 요소들을 배치
         * @param {Integer} start 몇번째 항목부터 배치할 것인가...더보기를 했을 때,
         * ajax로 가져온 항목들을 append한 후, 새로 append된 아이템부터 배치하기 위함
         */
        _update: function(start) {
            start = start|0;

            var me = this,
                $items = me.$el.find(me.options.itemSelector).filter(function(i) {
                    return i >= start;
                }),             // 새로 추가된 항목만 필터링
                items = [],     // 각 요소별 배치정보 보관
                measure = me.measure,                  // 좌중우 높이정보
                ARROW_HEIGHT = me.options.arrowHeight, // 아이콘의 높이
                BOX_TOP_MARGIN = me.options.boxTopMargin; // 박스간의 간격

            // UI요소가 차지하는 화면상의 사이즈를 계산하기 위해선 display가 none이 아니어야 되므로,
            // 대신 visibility:hidden으로 해놓고, display:block으로 변경
            me.$el.css('visibility', 'hidden');
            if (start === 0) {
                // 첫항목부터 배치되어야 하는 경우, 배치값을 초기화.
                measure.left = measure.center = measure.right = 0;
            }

            // 각각 li 항목의 좌우위치와 높이, 그리고 그에따른 아이콘 위치를 계산해서 items에 담는다.(아직 배치전)
            $items.each(function(i) {
                var $li = $(this),
                    boxHeight = $li.show().height(),
                    align, targetTopOffset, arrowTopOffset;

                align = (measure.left <= measure.right) ? 'left' : 'right';
                targetTopOffset = measure[align];
                arrowTopOffset = Math.max(measure.center - targetTopOffset, 0);

                items.push({
                    $target: $li.hide(),    // 대상 요소
                    css: align,             // 위치 클래스
                    top: targetTopOffset,   // top 위치
                    arrowTop: arrowTopOffset // 아이콘 위치
                });

                measure[align] += boxHeight + BOX_TOP_MARGIN; // 좌측, 우측의 위치별로 최종 top를 저장(다음 항목의 top를 계산하기 위해)
                measure.center = targetTopOffset + arrowTopOffset + ARROW_HEIGHT; // 중앙쪽에 최종 top를 저장(다음 항목의 top를 계산하기 위해)
            });

            // 위에서 계산 위치를 바탕으로 실제로 배치(top css)
            var opts = me.options;
            $.each(items, function(i, item) {
                item.$target.removeClass(opts.classPrefix +'left ' + opts.classPrefix + 'right')
                    .addClass(opts.classPrefix + item.css) // 좌 or 우
                    .css({
                        'top': item.top
                    }) // top 설정
                    .fadeIn('slow')
                    .css({
                        '_backgroundPositionY': item.arrowTop
                    }); // 아이콘
            });

            // 가장밑에 배치된 항목을 기준으로 컨테이너 높이를 지정
            me.$el.css({
                'visibility': '',
                'height': Math.max(measure.left, measure.right)
            });
            me.trigger('completed.bothtimeline'); // 완료 이벤트를 발생
        }
    });

    if (typeof define === "function" && define.amd) {
        define([], function() {
            return BothTimeline;
        });
    }

})(jQuery, window[LIB_NAME]);
