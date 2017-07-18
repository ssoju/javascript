/*!
 * @module scui.ui.filebox.js
 * @email comahead@vinylc.com
 * @create 2015-03-31
 * @license MIT License
 *
 * @modifier 김승일(comahead@vi-nyl.com)
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
	 * @description 동적파일폼 모듈
	 * @name Filebox
	 * @extends scui.ui.View
	 */
	var Filebox = ui('Filebox', /** @lends scui.ui.Filebox# */{
		bindjQuery: 'filebox',
		defaults: {
			fileBox: 'ui_filebox',              // 파일박스
			fileList: 'ui_file_list',           // 파일폼 리스트
			exts: 'jpg;jpeg;gif;png;bmp;tif',   // 허용 확장자
			fileMaxLength: 50,                     // 최대 등록수
			allowDuplicate: true                   // 중복 허용 여부
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
		_bindEvent : function () {
			var me = this;

			me.$fileButton.find('button').attr('tabIndex', -1);
			me.$fileButton.find('.'+me.options.fileBox).addClass('ui_select_file'); // 파일명 설정

			me.title = me.$('.ui_select_file:file').attr('title') || '첨부파일';

			me.$el.on('mouseenter mouseleave', '.ui_select_file', function (e) {
				$(this).siblings('button').toggleClass('active', e.type === 'mouseenter');
			});

			// 파일 선택 버튼에 이벤트 바인드
			me.$fileButton.on('change', '.' + me.options.fileBox, function (e) {
				var $el = $(this),
					fileName, $selectedFile;

				if (!me._isValid($el.val())) { e.preventDefault(); return; }
				// 최대 등록수 초과시 얼럿 표시
				if (!me._checkCount(e)) { return; }

				me._addFileItem($el);
				if (me.options.max > me._getFileCount()) {
					me._createNewFile();
				} else {
					me.$fileButton.find('button').attr('tabIndex', 0);
					setTimeout(function () {
						me.$fileButton.find('button').focus();
					});
				}

			}).on('click', '.' + me.options.fileBox, function (e) {
				me._checkCount(e);
			}).on('focusin focusout', '.' + me.options.fileBox, function (e) {
				me.$fileButton.toggleClass('focus', e.type === 'focusin');
			}).on('click', 'button', function (e) {
				me._checkCount(e);
			});

			// 삭제버튼 클릭
			me.$fileContent.on('click', 'button.ui_file_del', function (e) {
				e.preventDefault();
				$(this).closest('.'+me.options.fileList).remove();
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

		_checkCount: function (e) {
			var me = this;
			// 최대 등록수 초과시 얼럿 표시
			if(me._getFileCount() >= me.options.max) {
				core.showMessage('N0000003', [me.options.max]); // 최대 {0}개까지 추가할 수 있습니다.
				e && e.preventDefault();
				return false;
			}
			return true;
		},

		/**
		 * 확장자 유효성 체크, 중복체크
		 * @param {string} val
		 * @return {boolean}
		 * @private
		 */
		_isValid: function (val) {
			var me = this, fileExt;

				if(me.options.fileExts) {
					fileExt = core.string.getFileExt(val);
					if(fileExt) { fileExt = fileExt.toLowerCase(); }
					if(me.options.fileExts.toLowerCase().indexOf(fileExt) < 0){
						setTimeout(function () {
							core.showMessage('N0000001'); // 유효하지 않은 확장자입니다.
						} , 0);
						return false;
					}
				}
				return true;

			/*
			if(!me.options.allowDuplicate && me._isExists(val)) {
				core.showMessage('N0000002'); //이미 추가한 파일입니다.
				return false;
			}
			*/

		},

		/**
		 * 리스트에 추가된 파일항목 추가
		 * @param {jQuery} $el
		 * @private
		 */
		_addFileItem: function ($el) {
			var me = this,
				$selectedFile, html, fileName;

			fileName = core.string.getFileName($el.val());
			fileName = me._renameForIOS(fileName);

			html = '<div class="file_item ' + me.options.fileList + '"><p><span class="txt" title="' + fileName + ' 파일">' + fileName + '</span><button class="ui_file_del" type="button" title="'+fileName+' 파일"><span class="hide">삭제</span></button></p></div>';

			$selectedFile = $(html).prepend(
				$el.attr('name', me.options.fileName)
					.removeClass('ui_select_file').addClass('ui_new_file')
					.css({'display':'none'})
			);
			if (me.options.titleName) {
				html = '<div class="file_tit_outer">	<span class="rel ui_inputbox csr_file_tit"><input type="text" name="' + me.options.titleName + '" class="in_txt" maxlength="' + me.options.fileMaxLength + '" title="'+fileName+' 이미지의 설명" placeholder="이미지의 설명을 입력해주세요."><button type="button" class="input_del" style="display: none;">입력사항 삭제하기</button></span></div>';
				$selectedFile.append(html);
			}
			me.$fileContent.append($selectedFile).show();
			me._titleNumbering();
		},

		/**
		 * 새로운 파일요소 추가
		 * @private
		 */
		_createNewFile: function() {
			var me = this;

			if(me.$fileButton.find('.ui_select_file').size() > 0) {
				me.$fileButton.find('.ui_select_file').focus();
				return;
			}

			var fileHTML = '<input class="' + me.options.fileBox + ' ui_select_file" type="file" style="font-size:50px;line-height:0;" title="' + me.title + '" />';

			me.$fileButton.append(fileHTML);//.find('.' + me.options.fileBox).find('.ui_select_file').focus();
			setTimeout(function (){
				me.$fileButton.find('.ui_select_file').focus();
			});
		},

		/**
		 * 추가된 파일 갯수 반환
		 * @return {number}
		 * @private
		 */
		_getFileCount: function(){
			var me = this;

			return me.$fileContent.find('.' + me.options.fileBox).size();
		},

		/**
		 * 동일한 이름의 파일 추가여부 체크
		 * @param {string} fileName
		 * @returns {boolean}
		 * @private
		 */
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

		/**
		 * title 속성에 넘버링
		 * @private
		 */
		_titleNumbering: function () {
			var me = this;

			me.$fileContent.find('.' + me.options.fileList).each(function (rowIdx) {
				$(this).find('[title]').each(function () {
					this.title = (rowIdx + 1) + '번째 ' + this.title.replace(/^[0-9]+번째 /, '');
				});
			});
		},

		/**
		 * 아이폰에서는 추가되는 파일명이 전부 원래 이름이 아닌 image.jpg으로 넘어오므로 랜덤값으로 리스트에 표시
		 * @param {string} fileName
		 * @return {string}
		 * @private
		 */
		_renameForIOS: function (fileName) {
			if (!core.browser.isIOS || !core.browser.isMobile || fileName.indexOf('image.') < 0) { return fileName; }
			var ext = core.string.getFileExt(fileName);
			return core.string.random(10).toUpperCase() + '.' + ext;
		},

		/**
		 * 싸고있는 form이 reset 될 때 추가된 파일을 모두 제거해준다.
		 */
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