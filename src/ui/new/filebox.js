/*!
 * @author coma.ui.filebox.js
 * @email odyseek@vi-nyl.com
 * @create 2015-03-31
 * @license MIT License
 *
 * @modifier comahead@vi-nyl.com
 */
(function ($, core, undefined) {
    "use strict";

    if(core.ui.Filebox) { return; }

    var ctx = window,
        $doc = $(document),
        ui = core.ui,
        dateUtil = core.date,
        browser = core.browser,
        isTouch = browser.isTouch;

    //Filebox ////////////////////////////////////////////////////////////////////////////
    /**
     * @class
     * @description
     * @name
     * @extends coma.ui.View
     */
    var Filebox = ui('Filebox', /** @lends coma.ui.Filebox# */{
        bindjQuery: 'filebox',
        defaults: {
            fileBox: 'ui_filebox',
            fileList: 'ui_file_list',
            exts: 'jpg;gif;png'
        },

        events: {
        },

        selectors: {
            fileButton : '.ui_file_select',
            fileContent : '.ui_file'
        },

        /**
         *
         * @param el
         * @param options
         * @returns {boolean}
         */
        initialize: function (el, options) {
            var me = this;

            if (me.supr(el, options) === false) { return; }

            if (me.$el.data('isBind') === undefined) {
                me.$el.data('isBind', 'BIND');
                me._bindEvent();
            }
        },

        /**
         * 이벤트 바인딩
         */
        _bindEvent : function () {
            var me = this;

            me.max = me.$el.data('max');
            me.maxAlert = me.$el.data('maxAlert');
            me.fileName = me.$el.data('fileName');
            me.fileExts = me.$el.data('fileExts') || me.options.exts;

            me.$fileButton.find('button').attr('tabIndex', -1);
            me.$fileButton.find('.'+me.options.fileBox).addClass('ui_select_file'); // 파일명 설정

            // 파일 선택 버튼에 이벤트 바인드
            me.$fileButton.on('change', '.' + me.options.fileBox, function (e) {
                var $el = $(this),
                    fileExt, fileName, $selectedFile;
                if(me.fileExts) {
                    fileExt = coma.string.getFileExt($el.val());
                    if(fileExt) { fileExt = fileExt.toLowerCase(); }
                    if(me.fileExts.toLowerCase().indexOf(fileExt) < 0){
                        alert('유효하지 않은 확장자입니다.');
                        e.preventDefault();
                        return;
                    }
                }

                if(me._isExists($el.val())) {
                    alert('이미 추가한 파일입니다.');
                    e.preventDefault();
                    return;
                }

                fileName = coma.string.getFileName($el.val());

                var uiFileHTML = '<p class="' + me.options.fileList + '"><span class="txt" title="' + fileName + '">' + fileName + '</span><button class="ui_file_del" type="button"><span class="hide">' + fileName + ' 삭제</span></button></p>';

                $selectedFile = $(uiFileHTML).append(
                    $el.attr('name', me.fileName)
                        .removeClass('ui_select_file').addClass('ui_new_file')
                        .css({'display':'none'})
                );
                me.$fileContent.append($selectedFile).show();

                if (me.max > me._getFileCount()) {
                    me._createNewFile();
                } else {
                    me.$fileButton.find('button').attr('tabIndex', 0);
                    setTimeout(function () {
                        me.$fileButton.find('button').focus();
                    });
                }

            }).on('focusin focusout', '.' + me.options.fileBox, function (e) {
                me.$fileButton.toggleClass('focus', e.type === 'focusin');
            }).on('click', 'button', function () {
                if(me._getFileCount() >= me.max) {
                    alert(me.maxAlert);
                }
            });

            me.$fileContent.on('click', 'button.ui_file_del', function (e) {
                e.preventDefault();
                $(this).closest('.'+me.options.fileList).remove();
                me.$fileButton.find('button').attr('tabIndex', -1);
                me._createNewFile();
                if (me._getFileCount() === 0) {
                    me.$fileContent.hide();
                    me.$el.find('.' + me.options.fileBox).focus();
                }
            });

            me.$el.closest('form').on('reset', me.reset.bind(me));
        },
        _createNewFile: function() {
            var me = this;

            if(me.$fileButton.find('.ui_select_file').size() > 0) {
                me.$fileButton.find('.ui_select_file').focus();
                return;
            }

            var fileHTML = '<input class="' + me.options.fileBox + ' ui_select_file" type="file" style="font-size:50px;line-height:0;" />';

            me.$fileButton.append(fileHTML);//.find('.' + me.options.fileBox).find('.ui_select_file').focus();
            setTimeout(function (){
                me.$fileButton.find('.ui_select_file').focus();
            });
        },
        _getFileCount: function(){
            var me = this;

            return me.$fileContent.find('.' + me.options.fileBox).size();
        },
        _isExists: function(fileName) {
            var me = this, isExist = false;

            me.$fileContent.find('.' + me.options.fileBox).each(function(){
                if($(this).val() === fileName) {
                    isExist = true;
                    return false;
                }
            });
            return isExist;
        },
        reset: function() {
            var me = this;
            me.$fileContent.find('.ui_new_file').each(function() {
                $(this).closest('.ui_file_list').remove();
            });
        }
    });
    ///////////////////////////////////////////////////////////////////////////////////////

    if (typeof define === "function" && define.amd) {
        define([], function() {
            return Filebox;
        });
    }

})(jQuery, window[LIB_NAME]);