/**
 * Created by comahead on 2011-05-12.
 */
(function($, core) {
    "use strict";

    var $win = $(window);

    var AdaptiveTemplater = core.ui('AdaptiveTemplater', {
        bindjQuery: 'adaptiveTemplater',
        defaults: {
        },
        initialize: function(el, options) {
            var me = this;

            if (me.supr(el, options) === false) { return; }

            if (core.is(me.options.data, 'string')) {
                me.data = $.parseJSON( $.trim($(me.options.data).html()) );
            } else {
                me.data = me.options.data;
            }


            me.pcLayout = $(me.options.pcTmpl + '.layout').html();
            me.mobileLayout = $(me.options.mobileTmpl + '.layout').html();

            if (me.options.hasMoreList) {
                me.pcItem = $(me.options.pcTmpl + '.item').html();
                me.mobileItem = $(me.options.mobileTmpl + '.item').html();
            }

            // 초기 렌더링 모드 설정
            me.mediaMode = core.isMobileSize() ? 'mobile' : 'pc';

            me._render();
            me._bindEvents();
        },

        /**
         * 이벤트 바인딩
         */
        _bindEvents: function() {
            var me = this;

            if (me.options.url) {
                me.on('click', '.ui_list_more', function (e) {
                    e.preventDefault();

                    me._renderAjax();
                });
            }

            // 모드가 전환될 때만 새로 렌더링
            $(window).on('changemediasize', function () {
                var m = core.isMobileSize() ? 'mobile' : 'pc';
                if (me.mediaMode != m) {
                    me.mediaMode = m;
                    me._render();
                }
            });
        },

        /**
         * 렌더링
         * @private
         */
        _render: function () {
            var me = this,
                layout;

            me.$el.empty();
            if (me.mediaMode === 'mobile') {
                layout = me.mobileLayout;
            } else {
                layout = me.pcLayout;
            }
            // layout 렌더링
            $.tmpl(layout, me.data).appendTo(me.$el);

            // 리스트
            if ( me.options.hasMoreList ) {
                if (!me.data.list || me.data.list.length === 0) {
                    if (!me.options.url) {
                        throw new Error('더보기가 있는 경우 url 옵션을 설정해주세요.');
                    }
                    me._renderAjax();
                }
                me._toggleMoreButton();
            }

        },

        /**
         * 더보기 조회
         * @private
         */
        _renderAjax: function () {
            var me = this,
                item;
            $.ajax({
                url: me.options.url.call(me, me.data),
                dataType: 'json'
            }).done( function (json) {
                me.data.total = json.total;
                me.data.current = json.current;
                me.data.list = me.data.list.concat(json.list);

                me._renderItem(json.list);
            });
        },

        /**
         * 더보기 렌더링
         * @param list
         * @private
         */
        _renderItem: function (list) {
            var me = this;

            if (me.mediaMode === 'mobile') {
                $.tmpl(me.mobileItem, {list: list}).appendTo(me.$(me.options.mobileTmpl + '.list'));
            } else {
                $.tmpl(me.pcItem, {list: list}).appendTo(me.$(me.options.pcTmpl + '.list'));
            }

            me._toggleMoreButton();
        },

        /**
         * 더보기 버튼에 카운트 표시
         * @private
         */
        _toggleMoreButton: function () {
            var me = this;

            if (me.data.current < me.data.total){
                me.$('.btn_more_wrap').show()
                    .find('.txt').html('더보기 <span class="num">(<span class="hide">현재페이지</span>'+me.data.current+'/<span class="hide">전체페이지</span>'+me.data.total+')</span>');
            } else {
                me.$('.btn_more_wrap').hide();
            }
        }
    });

    core.ui.AdaptiveTemplater = AdaptiveTemplater;
})(jQuery, window[LIB_NAME]);
