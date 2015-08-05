/**
 * Created by 김승일책임(comahead@vi-nyl.com) on 2015-05-27.
 */
(function ($, core) {
    "use strict";

    var TableItemMover = core.ui('TableItemMover', {
        bindjQuery: 'tableItemMover',
        defaults: {
            maxCount: 10000
        },
        selectors: {
            sourceTable: '.ui_source_table',
            targetTable: '.ui_target_table',
            btnAdd: '.ui_item_add',
            btnDel: '.ui_item_del',
            btnDelAll: '.ui_item_delall',
            btnClear: '.ui_item_clear',
            btnUp: '.ui_item_up',
            btnDown: '.ui_item_down'
        },
        initialize: function(el, options) {
            var me = this;
            if (me.supr(el, options) === false) { return; }

            me.options.maxCount = (me.$targetTable.attr('data-max-count') || me.options.maxCount)|0;
            me._bindEvents();
        },

        _bindEvents: function() {
            var me = this;

            me.$sourceTable.on('checkedchanged', '[type=checkbox]', function(){
                me.$btnAdd.disabled(me._getSourceItems().size() === 0);
            });

            me.$targetTable.on('checkedchanged', 'tbody [type=checkbox]', function(){
                var disable = me._getTargetItems().size() === 0,
                    $el = $(this),
                    $tr = $el.closest('tr'),
                    isCheck = $el.prop('checked');

                me.$btnDel.disabled(disable);
                me.$btnUp.disabled(disable);
                me.$btnDown.disabled(disable);

                if(!isCheck) { return; }

                if ($tr.hasClass('ui_represent_item')) {
                    me._getTargetItems().find(':checkbox:checked').not(this).checked(false);
                } else {
                    $tr.siblings('.ui_represent_item').find(':checkbox:checked').checked(false);
                }
            });

            // 추가
            me.$btnAdd.on('click', function(e) {
                var $sourceItems = me._getSourceItems(),
                    sourceCount = $sourceItems.size();

                if (sourceCount === 0) {
                    alert('추출할 항목을 선택해 주세요.');
                    return;
                }

                if (me._getTargetItems(false).size() + sourceCount > me.options.maxCount) {
                    alert('최대 '+me.options.maxCount+'건까지 추가하실 수 있습니다');
                    return;
                }

                var $items = $sourceItems.clone();
                me._disableItem($sourceItems);
                $items.each(function(){
                    var $item = $(this).addClass('ui_added_item');
                    $item.children().show().filter('.ui_hide_item').remove();
                    // for, id 변경
                    $item.find('[for]').each(function(){
                        var t = +new Date();
                        $item.find('[id='+$(this).attr('for')+']').attr('id', t);
                        $(this).attr('for', t);
                    });
                    $item.find('[data-ui-class]').each(function() {
                        $(this).addClass($(this).attr('data-ui-class'));
                    }).end().buildUIControls();
                    me.$targetTable.find('tbody').append($item);
                });
                me._numbering();
                me._complete();
            });

            // 전체 삭제
            me.$btnClear.on('click', function(){
                me.clear();
            });

            // 삭제
            me.$targetTable.on('click', '.ui_item_del', function(e) {
                var $targetItems = $(this).parent().parent();

                me._enableItems(me.$sourceTable.find('tr:has(:checkbox[value=' + $targetItems.data('value') + '])'));
                $targetItems.remove();
                me._numbering();
                me._complete();
            });

// 삭제
            me.$btnDel.on('click', function(e) {
                var $targetItems = me._getTargetItems();
                if ($targetItems.size() === 0) {
                    alert('삭제할 항목을 선택해 주세요.');
                    return;
                }

                $targetItems.each(function(){
                    me._enableItems(me.$sourceTable.find('tr:has(:checkbox[value='+$(this).find(':checkbox').val()+'])'));
                    $(this).remove();
                });
                me.$targetTable.find('thead :checkbox').checked(false);
                me._numbering();
                me._complete();
            });

// 전체 삭제
            me.$btnDelAll.on('click', function(){
                me._getTargetItems(false).each(function(){
                    me._enableItems(me.$sourceTable.find('tr:has(:checkbox[value='+$(this).find(':checkbox').val()+'])'));
                    $(this).remove();
                });
                me.$targetTable.find('thead :checkbox').checked(false);
                me._complete();
            });

// 위로
            me.$btnUp.on('click', function(e) {
                var $items = me._getTargetItems();
                $items.each(function(){
                    var $item = $(this);

                    if($item.prev('tr:has(input:checked)').length > 0) { return; }
                    $item.insertBefore($item.prev('tr:not(.ui_no_result)'));
                });
                me._numbering();
            });

// 아래로
            me.$btnDown.on('click', function(e) {
                var $items = me._getTargetItems();
                Array.prototype.reverse.call($items).each(function(){
                    var $item = $(this);

                    if($item.next('tr:has(input:checked)').length > 0) { return; }
                    $item.insertAfter($item.next());
                });
                me._numbering();
            });

            // 폼이 서브밋될 때 추가된 항목을 체크해준다.
            $(me.$el.find(':checkbox:first').get(0).form).on('submit', function(){
                me.$sourceTable.find('tbody :checkbox').checked(false);
            });
        },

        _numbering: function(){
            var me = this;

            me._getTargetItems(false).each(function(i) {
                $(this).find('.ui_seq').html(i + 1);
            })
        },

        _complete: function(){
            var me = this;
            me.$targetTable.find(':checkbox:checked').checked(false);
            me.$sourceTable.find(':checkbox:checked').checked(false);

            if(me.$targetTable.find('tbody tr.ui_added_item').size() === 0) {
                me.$targetTable.find('tbody tr.ui_no_result').show().children().show();
                me.$targetTable.find('tbody tr.ui_represent_item').hide().children().hide();
                me.$('.ui_activate').disabled(true);
                me.$btnClear.disabled(true);
                me.$btnDelAll.disabled(true);
            } else {
                me.$targetTable.find('tbody tr.ui_no_result').hide().children().hide();
                me.$targetTable.find('tbody tr.ui_represent_item').show().children().show();
                me.$targetTable.find('tbody tr.ui_represent_item').find(':checkbox').checked(false);
                me.$('.ui_activate').disabled(false);
                me.$btnClear.disabled(false);
                me.$btnDelAll.disabled(false);
            }
        },

        _getSourceItems: function(isCheck){
            var me = this;
            return me.$sourceTable.find('tbody tr:not(.disabled):has(input:checkbox'+(isCheck === false ? '' : ':checked')+')');
        },

        _getTargetItems: function(isCheck) {
            var me = this;
            return me.$targetTable.find('tbody tr.ui_added_item'+(isCheck === false ? '' : ':has(:checkbox:checked)'));
        },

        _enableItems: function($items) {
            $items.removeClass('disabled').find(':checkbox').prop('disabled', false).checked(false).end()
                .find('a').attr('tabindex', '').removeClass('disabled');
        },

        _disableItem: function($items) {
            $items.addClass('disabled').find(':checkbox').prop('disabled', true).checked(false).end()
                .find('a').attr('tabindex', -1).addClass('disabled');
        },

        // 초기화
        clear: function(){
            var me = this;

            me.$targetTable.find('tbody tr.ui_added_item').remove();
            me._complete();
            me._enableItems(me.$sourceTable.find('tbody tr.disabled'));
        }
    });
})(jQuery, window[LIB_NAME]);