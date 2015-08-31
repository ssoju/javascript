/*!
 * @author axl.ui.filebox.js
 * @email comahead@vi-nyl.com
 * @create 2015-03-31
 * @license MIT License
 *
 * @modifier comahead@vi-nyl.com
 */
(function($, core, undefined) {
    "use strict";

    if (core.ui.Filebox) {
        return;
    }

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
     * @extends axl.ui.View
     */
    var Filebox = ui('Filebox', /** @lends axl.ui.Filebox# */ {
        bindjQuery: 'filebox',
        defaults: {
            fileBox: 'ui_filebox',
            fileList: 'ui_file_list',
            exts: 'jpg;jpeg;gif;png;bmp;tif',
            allowDuplicate: true
        },

        events: {},

        selectors: {
            fileButton: '.ui_file_select',
            fileContent: '.ui_file'
        },

        /**
         *
         * @param el
         * @param options
         * @returns {boolean}
         */
        initialize: function(el, options) {
            var me = this;

            if (me.supr(el, options) === false) {
                return;
            }

            /*me.max = me.$el.data('max');
            me.maxAlert = me.$el.data('maxAlert');
            me.fileName = me.$el.data('fileName');
            me.titleName = me.$el.data('titleName');
            me.fileExts = me.$el.data('fileExts') || me.options.exts;*/

            me._bindEvent();
        },

        /**
         * 이벤트 바인딩
         */
        _bindEvent: function() {
            var me = this;

            me.$fileButton.find('button').attr('tabIndex', -1);
            me.$fileButton.find('.' + me.options.fileBox).addClass('ui_select_file'); // 파일명 설정

            me.title = me.$('.ui_select_file:file').attr('title') || '첨부파일';

            // 파일 선택 버튼에 이벤트 바인드
            me.$fileButton.on('change', '.' + me.options.fileBox, function(e) {
                var $el = $(this),
                    fileName, $selectedFile;

                if (!me._isValid($el.val())) {
                    e.preventDefault();
                    return;
                }

                me._addFileItem($el);

                if (me.options.max > me._getFileCount()) {
                    me._createNewFile();
                } else {
                    me.$fileButton.find('button').attr('tabIndex', 0);
                    setTimeout(function() {
                        me.$fileButton.find('button').focus();
                    });
                }

            }).on('focusin focusout', '.' + me.options.fileBox, function(e) {
                me.$fileButton.toggleClass('focus', e.type === 'focusin');
            }).on('click', 'button', function() {
                if (me._getFileCount() >= me.options.max) {
                    alert(me.options.maxAlert);
                }
            });

            me.$fileContent.on('click', 'button.ui_file_del', function(e) {
                e.preventDefault();
                $(this).closest('.' + me.options.fileList).remove();
                me.$fileButton.find('button').attr('tabIndex', -1);
                me._createNewFile();
                if (me._getFileCount() === 0) {
                    me.$fileContent.hide();
                    me.$el.find('.' + me.options.fileBox).focus();
                } else {
                    me._titleNumbering();
                }
            });

            me.$el.closest('form').on('reset', me.reset.bind(me));
        },

        _isValid: function(val) {
            var me = this,
                fileExt;

            if (me.options.fileExts) {
                fileExt = core.string.getFileExt(val);
                if (fileExt) {
                    fileExt = fileExt.toLowerCase();
                }
                if (me.options.fileExts.toLowerCase().indexOf(fileExt) < 0) {
                    alert('유효하지 않은 확장자입니다.');
                    return false;
                }
            }

            if (!me.options.allowDuplicate && me._isExists(val)) {
                alert('이미 추가한 파일입니다.');
                return false;
            }

            return true;
        },

        _addFileItem: function($el) {
            var me = this,
                $selectedFile, html, fileName;

            fileName = core.string.getFileName($el.val());
            fileName = me._renameForIOS(fileName);

            html = '<p class="' + me.options.fileList + '"><span class="txt" title="' + fileName + ' 이미지">' + fileName + '</span><button class="ui_file_del" type="button" title="' + fileName + ' 이미지 삭제"><span class="hide">' + fileName + ' 삭제</span></button></p>';

            $selectedFile = $(html).prepend(
                $el.attr('name', me.options.fileName)
                .removeClass('ui_select_file').addClass('ui_new_file')
                .css({
                    'display': 'none'
                })
            );
            if (me.options.titleName) {
                html = '<div class="file_tit_outer"> < span class = "rel ui_inputbox csr_file_tit" > < input type = "text"
                name = "' + me.options.titleName + '"
                class = "in_txt"
                maxlength = "15"
                title = "'+fileName+' 이미지의 설명"
                placeholder = "이미지의 설명을 입력해주세요." > < button type = "button"
                class = "input_del"
                style = "display: none;" > 입력사항 삭제하기 < /button></span > < /div>';
                $selectedFile.append(html);
            }
            me.$fileContent.append($selectedFile).show();
            me._titleNumbering();
        },

        _createNewFile: function() {
            var me = this;

            if (me.$fileButton.find('.ui_select_file').size() > 0) {
                me.$fileButton.find('.ui_select_file').focus();
                return;
            }

            var fileHTML = '<input class="' + me.options.fileBox + ' ui_select_file" type="file" style="font-size:50px;line-height:0;" title="' + me.title + '" />';

            me.$fileButton.append(fileHTML); //.find('.' + me.options.fileBox).find('.ui_select_file').focus();
            setTimeout(function() {
                me.$fileButton.find('.ui_select_file').focus();
            });
        },
        _getFileCount: function() {
            var me = this;

            return me.$fileContent.find('.' + me.options.fileBox).size();
        },
        _isExists: function(fileName) {
            var me = this,
                isExist = false;

            me.$fileContent.find('.' + me.options.fileBox).each(function() {
                if ($(this).val() === fileName) {
                    isExist = true;
                    return false;
                }
            });
            return isExist;
        },

        _titleNumbering: function() {
            var me = this;

            me.$fileContent.find('.' + me.options.fileList).each(function(rowIdx) {
                $(this).find('[title]').each(function() {
                    this.title = (rowIdx + 1) + '번째 ' + this.title.replace(/^[0-9]+번째 /, '');
                });
            });
        },

        _renameForIOS: function(fileName) {
            if (!core.browser.isIOS || !core.browser.isMobile || fileName.indexOf('image.') < 0) {
                return fileName;
            }
            var ext = core.string.getFileExt(fileName);
            return core.string.random(16).toUpperCase() + '.' + ext;
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
