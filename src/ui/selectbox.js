/*!
 * @author common.ui.selectbox.js
 * @email comahead@vi-nyl.com
 * @create 2014-11-25
 * @license MIT License
 */
(function ($, core, undefined) {
    "use strict";

    var $doc = core.$doc,
        $win = core.$win,
        ui = core.ui,
        browser = core.browser,
        isTouch = browser.isTouch;

    //Selectbox////////////////////////////////////////////////////////////////////////////
    /**
     * 커스텀 셀렉트박스<br />
     *
     * @class
     * @name common.ui.Selectbox
     * @extends common.ui.View
     */
    var Selectbox = ui('Selectbox', /** @lends common.ui.Selectbox# */{
        bindjQuery: 'selectbox',
        $statics: {
            ON_CHANGED: 'selectboxchanged'
        },
        defaults: {
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
        initialize: function(el, options) {
            var me = this;
            if(me.supr(el, options) === false){ return; }
            me._create();
            me.update();
        },

        /**
         * select 컨트롤을 기반으로 UI DOM 생성
         * @private
         */
        _create: function() {
            var me = this,
                cls = me.$el.attr('data-class') || 'select_type01',
                timer = null;

            me.width = parseInt(me.$el.css('width'), 10);
            // 셀렉트박스
            me.$selectbox = $('<div class="'+cls+'"></div>').addClass(me.options.wrapClasses);
            me.$selectbox.insertAfter(me.$el.hide());

            me._createLabel();
            me._createList();
            me._bindEvents();
        },
        /**
         * 이벤트 바인딩
         * @private
         */
        _bindEvents: function () {
            var me = this;

            me.$selectbox.on('selectboxopen selectboxclose', function(e){
                e.stopPropagation();

                // 리스트가 열리거나 닫힐 때 zindex 처리
                var zindexSelector = me.$el.attr('data-zindex-target'),
                    $zIndexTargets = zindexSelector ? me.$el.parents(zindexSelector) : false;

                if(e.type === 'selectboxopen') {
                    me.$label.addClass('open');
                    me.$el.closest('div.select_wrap').addClass('on');
                    $zIndexTargets&&$zIndexTargets.addClass('on');

                    isTouch && $('body').on('touchend.selectbox', function(){
                        me.close();
                    });
                } else {
                    me.$label.removeClass('open');
                    me.$el.closest('div.select_wrap').removeClass('on');
                    $zIndexTargets&&$zIndexTargets.removeClass('on');
                    clearTimeout(timer), timer = null;

                    isTouch && $('body').off('touchend.selectbox');
                }
            });

            // 비터치 기반일 때에 대한 이벤트 처리
            if( !isTouch ) {
                var timer;
                // 셀렉트박스에서 포커스가 벗어날 경우 자동으로 닫히게
                me.$selectbox.on('focusin focusout', function(e) {
                    clearTimeout(timer), timer = null;
                    if(e.type === 'focusout' && me.$label.hasClass('open')) {
                        timer = setTimeout(function(){
                            me.close();
                        }, 100);
                    }
                }).on('keydown', function(e) {
                    if(e.keyCode === core.keyCode.ESCAPE) {
                        me.close();
                        me.$label.focus();
                    }
                });
            } else {
                me.$selectbox.on('touchend', function(e){ e.stopPropagation(); });
            }

            me.$el.on('change.selectbox', function(e) {
                me.selectedIndex(this.selectedIndex, false);
            });

            me.$el.closest('form').on('reset', function() {
                me.update();
            });
        },

        /**
         * 레이블 생성
         * @private
         */
        _createLabel: function() {
            var me = this;

            me.$label = $('<span class="select_box" tabindex="0" title="'+(me.$el.attr('title') || '셀렉트박스')+'"><span class="sel_r" style="width:190px;">&nbsp;</span></span>');
            me.$label.attr({
                'id': me.cid+'_button',
                'role': 'combobox',
                'aria-owns': me.cid+'_menu',
                'aria-expanded': 'false',
                'aria-haspopup': 'true',
                'aria-disabled': 'false'
            }).on('click', '.sel_r', function(e) {
                e.preventDefault();
                e.stopPropagation();

                if(me === Selectbox.active) {
                    me.close();
                    return;
                }

                if (!me.$label.hasClass(me.options.disabledClass)) {
                    // 현재 셀렉트박스가 열려있으면 닫고, 닫혀있으면 열어준다.
                    if(me.$label.hasClass('open')) {
                        me.close();
                    } else {
                        me.open();
                    }
                }
            });

            // 키보드에 의해서도 작동되도록 바인딩
            !isTouch && me.$label.on('keydown', function(e){
                if(e.keyCode === 13){
                    $(this).find('.sel_r').trigger('click');
                } else if(e.keyCode === core.keyCode.DOWN){
                    me.open();
                    me.$list.find(':focusable:first').focus();
                }
            });
            me.$label.find('.sel_r').css('width', me.width);
            me.$selectbox.append(me.$label);
        },

        /**
         * 리스트 생성
         * @private
         */
        _createList: function() {
            var me = this;

            me.$list = $('<div class="select_open" style="position:absolute;"></div>');
            me.$list.hide().on('click', function(e){
                me.$list.focus();
            }).on('click', 'li>a', function(e) {
                // 아이템을 클릭했을 때
                e.preventDefault();
                e.stopPropagation();

                me.selectedIndex($(this).parent().index());
                me.close();
                me.$label.focus();
            }).on('mousedown', 'li>a', function() {
                this.focus();
            });
            me.$list.attr({
                'id': me.cid+'_menu',
                'role': 'listbox',
                'aria-hidden': 'true',
                'aria-labelledby': me.cid+'_button',
                'aria-disabled': 'false'
            });

            !isTouch && me.$list.on('keydown', 'li a', function(e) {
                // 키보드의 위/아래 키로 이동
                var index = $(this).parent().index(),
                    items = me.$list.find('li'),
                    count = items.length;

                switch(e.keyCode){
                    case core.keyCode.UP:
                        e.stopPropagation();
                        e.preventDefault();
                        items.eq(Math.max(0, index - 1)).children().focus();
                        break;
                    case core.keyCode.DOWN:
                        e.stopPropagation();
                        e.preventDefault();
                        items.eq(Math.min(count - 1, index + 1)).children().focus();
                        break;
                }
            });
            me.$selectbox.append(me.$list);
        },

        /**
         * 리스트 표시
         * @fires common.ui.Selectbox#selectboxopen
         */
        open: function() {
            var me = this,
                scrollTop = $(window).scrollTop(),
                winHeight = $(window).height(),
                offset = me.$selectbox.offset(),
                listHeight = me.$list.height();

            Selectbox.active && Selectbox.active.close();

            me.$list.css('visibility', 'hidden').show();
            if(offset.top + listHeight > scrollTop + winHeight){
                me.$list.css('marginTop', (listHeight + me.$selectbox.height()) * -1);
            } else {
                me.$list.css('marginTop', '');
            }

            me.$list.css('visibility', '');
            /**
             * 셀렉트박스가 열릴 때 발생
             * @event common.ui.Selectbox#selectboxopen
             */
            me.$selectbox.triggerHandler('selectboxopen');
            Selectbox.active = me;
            $(document).on('click.selectbox'+me.cid, function(e) {
                Selectbox.active && Selectbox.active.close();
            });

            me.$list.attr({
                'aria-hidden': 'false'
            });
            me.$label.attr({
                'aria-expanded': 'true'
            });
        },

        /**
         * 리스트 닫기
         * @fires common.ui.Selectbox#selectboxclose
         */
        close: function() {
            var me = this;
            /**
             * 셀렉트박스가 닫힐 때 발생
             * @event common.ui.Selectbox#selectboxclose
             */
            me.$list.hide(), me.$selectbox.triggerHandler('selectboxclose');
            me.$list.attr({
                'aria-hidden': 'true'
            });
            me.$label.attr({
                'aria-expanded': 'false'
            });
            $(document).off('.selectbox'+me.cid);
            Selectbox.active = null;
        },

        /**
         * index에 해당하는 option항목을 선택
         *
         * @param {number} index 선택하고자 하는 option의 인덱스
         * @param {boolean} trigger change이벤트를 발생시킬 것인지 여부
         */
        selectedIndex: function(index, trigger) {
            if (arguments.length === 0) {
                return this.$el[0].selectedIndex;
            }

            var me = this,
                item = me.$el.find('option')
                    .prop('selected', false).removeAttr('selected')
                    .eq(index).prop('selected', true).attr('selected', 'selected');

            if (trigger !== false) {
                me.trigger('change.selectbox', {selectedIndex: index});
            }

            me.$list.find('li').removeClass('on').eq(index).addClass('on');
            me.$list.attr({
                'aria-activedescendant': me.$list.find('li').attr('id')
            });
            me.$label.children().text(item.text());
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
         * $('#sel').selectbox('value', 2);
         * value = $('#sel').selectbox('value'); // = $('#sel')[0].value 와 동일
         */
        value: function(_value) {
            var me = this;

            if (arguments.length === 0) {
                return me.$el[0].options[me.$el[0].selectedIndex].value;
            } else {
                core.each(me.$el[0].options, function(item, i) {
                    if (item.value == _value) {
                        me.selectedIndex(i);
                        return false;
                    }
                });
            }
        },
        /**
         * 동적으로 select의 항목들이 변경되었을 때, UI에 반영
         *
         * @example
         * &lt;select id="sel">&lt;option value="1">1&lt;/option>&lt;option value="2">2&lt;/option>&lt;/select>
         *
         * $('#sel')[0].options[2] = new Option(3, 3);
         * $('#sel')[0].options[3] = new Option(4, 4);
         * $('#sel').selectbox('update');
         */
        update: function(list) {
            var me = this,
                opts = me.options,
                html = '',
                index = -1,
                text = '';

            if(core.is(list, 'array')){
                // list 값이 있으면 select를 갱신시킨다.
                me.el.options.length = 1;
                core.each(list, function(item, i) {
                    me.el.options.add(new Option(item.text || item.value, item.value));
                });
            }

            // select에 있는 options를 바탕으로 UI를 새로 생성한다.
            core.each(core.toArray(me.$el[0].options), function(item, i) {
                if ($(item).prop('selected')) {
                    index = i;
                    text = item.text;
                }
                html += '<li role="option"><a href="#" data-value="' + item.value + '" data-text="' + item.text + '">' + item.text + '</a></li>';
            });
            me.$list.empty().html('<ul>'+html+'</ul>').find('li:eq(' + index + ')').addClass('on');
            me.$label.children().text(text);

            if (me.$el.prop('disabled')) {
                me.$label.addClass(opts.disabledClass).removeAttr('tabIndex');
            } else {
                me.$label.removeClass(opts.disabledClass).attr('tabIndex',0);
            }
        },

        /**
         * 소멸자
         */
        release: function() {
            var me = this;

            me.supr();
            me.$label.off().remove();
            me.$list.off().remove();
            me.$el.unwrap('<div></div>');
            me.$el.off('change.selectbox').show();
        }
    });
    ///////////////////////////////////////////////////////////////////////////////////////

    if (typeof define === "function" && define.amd) {
        define([], function() {
            return Selectbox;
        });
    }

})(jQuery, window[LIB_NAME]);
