/**
 * Created by comahead on 2015-05-12.
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

            // �ʱ� ������ ��� ����
            me.mediaMode = core.isMobileSize() ? 'mobile' : 'pc';

            me._render();
            me._bindEvents();
        },

        /**
         * �̺�Ʈ ���ε�
         */
        _bindEvents: function() {
            var me = this;

            if (me.options.url) {
                me.on('click', '.ui_list_more', function (e) {
                    e.preventDefault();

                    me._renderAjax();
                });
            }

            // ��尡 ��ȯ�� ���� ���� ������
            $(window).on('changemediasize', function () {
                var m = core.isMobileSize() ? 'mobile' : 'pc';
                if (me.mediaMode != m) {
                    me.mediaMode = m;
                    me._render();
                }
            });
        },

        /**
         * ������
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
            // layout ������
            $.tmpl(layout, me.data).appendTo(me.$el);

            // ����Ʈ
            if ( me.options.hasMoreList ) {
                if (!me.data.list || me.data.list.length === 0) {
                    if (!me.options.url) {
                        throw new Error('�����Ⱑ �ִ� ��� url �ɼ��� �������ּ���.');
                    }
                    me._renderAjax();
                }
                me._toggleMoreButton();
            }

        },

        /**
         * ������ ��ȸ
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
         * ������ ������
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
         * ������ ��ư�� ī��Ʈ ǥ��
         * @private
         */
        _toggleMoreButton: function () {
            var me = this;

            if (me.data.current < me.data.total){
                me.$('.btn_more_wrap').show()
                    .find('.txt').html('������ <span class="num">(<span class="hide">����������</span>'+me.data.current+'/<span class="hide">��ü������</span>'+me.data.total+')</span>');
            } else {
                me.$('.btn_more_wrap').hide();
            }
        }
    });

    core.ui.AdaptiveTemplater = AdaptiveTemplater;
})(jQuery, window[LIB_NAME]);
