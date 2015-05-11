/*!
 * @author tab.js
 * @email comahead@gmail.com
 * @create 2014-12-08
 * @license MIT License
 */
(function ($, core) {
   "use strict";

    //Tab ////////////////////////////////////////////////////////////////////////////////
    /**
     * @class
     * @name axl.ui.Tab
     * @description 페이징모듈
     * @extends axl.ui.View
     */
    var Tab = core.ui('Tab', /** @lends axl.ui.Tab# */{
        bindjQuery: 'tab',
        $statics: /** @lends axl.ui.Tab */{
            ON_TAB_CHANGED: 'tabchange'
        },
        defaults: {
            selectedIndex: 0,
            onClassName: 'on',
            tabType: 'inner'
        },

        events: {
        },
        selectors: {
            //tabs: '>ul>li'
        },
        /**
         * 생성자
         * @param {string|Element|jQuery} el 해당 엘리먼트(노드, id, jQuery 어떤 형식이든 상관없다)
         * @param {Object} [options] 옵션값
         * @param {number} [options.selectedIndex = 0]  초기선택값
         * @param {string} [options.onClassName = 'on'] 활성 css클래스명
         * @param {string} [options.tabType = 'inner'] 탭형식(inner | outer)
         */
        initialize: function(el, options) {
            var me = this;

            if(me.supr(el, options) === false) { return me.release(); }

            me.$tabs = me.$('>li');
            me.$tabs.on('click', '>a, >button', function(e) {
                e.preventDefault();

                me.select($(e.currentTarget).parent().index());
            }).on('keydown', '>a', function(e) {
                var index = me.$tabs.filter('.on').index(),
                    newIndex;
                switch(e.which) {
                    case core.keyCode.RIGHT:
                        me.select(newIndex = Math.min(me.$tabs.size() - 1, index + 1));
                        me.$tabs.eq(newIndex).find('>a').focus();
                        break;
                    case core.keyCode.LEFT:
                        me.select(newIndex = Math.max(0, index - 1));
                        me.$tabs.eq(newIndex).find('>a').focus();
                        break;
                }
            });

            // 컨텐츠가 li바깥에 위치한 탭인 경우
            if(me.options.tabType === 'outer') {
                var selectors = [];
                // 탭버튼의 href에 있는 #아이디 를 가져와서 컨텐츠를 조회
                me.$tabs.each(function() {
                    selectors.push($(this).find('a').attr('href'));
                });

                if(selectors.length) {
                    me.$contents = $(selectors.join(', '));
                }
                me._buildARIA();
            }

            me.select(me.options.selectedIndex);
        },

        /**
         * aria 속성 빌드
         */
        _buildARIA: function() {
            var me = this,
                tablistid = 'tab_' + me.cid,
                tabid, panelid;

            me.$el.attr('role', 'tablist');
            me.$tabs.each(function(i) {
                if(!me.$contents.eq(i).attr('id')) {
                    me.$contents.eq(i).attr('id', tabid = (tablistid + '_' + i));
                }
                var panelid = me.$contents.eq(i).attr('id');
                me.$contents.eq(i).attr({
                    'aria-labelledby': tabid,
                    'role': 'tabpanel',
                    'aria-hidden': 'true'
                });

                $(this).attr({
                    'id': tabid,
                    'role': 'tab',
                    'aria-selected': 'false',
                    'aria-controls': panelid
                });
            });

            me.on('tabchanged', function(e, data) {
                me.$tabs.attr('aria-selected', 'false').eq(data.selectedIndex).attr('aria-selected', 'true');
                me.$contents.attr('aria-hidden', 'true').eq(data.selectedIndex).attr('aria-hidden', 'false');
            });

        },

        /**
         * index에 해당하는 탭을 활성화
         * @param {number} index 탭버튼 인덱스
         * @fires axl.ui.Tab#tabchange
         * @fires axl.ui.Tab#tabchanged
         * @example
         * $('#tab').tab('select', 1);
         * // or
         * $('#tab').tab('instance').select(1);
         */
        select: function(index) {
            var me = this, e;
            if(index < 0 || (me.$tabs.length && index >= me.$tabs.length)) {
                throw new Error('index 가 범위를 벗어났습니다.');
            }
            /**
             * 탭이 바뀌기 직전에 발생. e.preventDefault()를 호출함으로써 탭변환을 취소할 수 있다.
             * @event axl.ui.Tab#tabchange
             * @type {Object}
             * @property {number} selectedIndex 선택된 탭버튼의 인덱스
             */
            me.triggerHandler(e = $.Event('tabchange'), {selectedIndex: index});
            if(e.isDefaultPrevented()) { return; }

            me.selectedIndex = index;
            me.$tabs.removeClass('on').eq(index).addClass('on');

            // 컨텐츠가 li바깥에 위치한 탭인 경우
            if(me.options.tabType === 'outer' && me.$contents) {
                me.$contents.hide().eq(index).show();
            }
            /**
             * 탭이 바뀌기 직전에 발생. e.preventDefault()를 호출함으로써 탭변환을 취소할 수 있다.
             * @event axl.ui.Tab#tabchanged
             * @type {Object}
             * @property {number} selectedIndex 선택된 탭버튼의 인덱스
             */
            me.triggerHandler('tabchanged', {selectedIndex: index});
        }
    });
    ///////////////////////////////////////////////////////////////////////////////////////

    if (typeof define === "function" && define.amd) {
        define(['lib/jquery'], function() {
            return Tab;
        });
    }

})(jQuery, window[LIB_NAME]);