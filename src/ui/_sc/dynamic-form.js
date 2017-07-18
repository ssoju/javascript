/*!
 * @author dynamic-form.js
 * @email comahead@vinylc.com
 * @create 2015-04-15
 * @license MIT License
 */
(function ($, core) {
	"use strict";

	if(core.ui.DynamicForm){ return; }

	//DynamicForm ////////////////////////////////////////////////////////////////////////////////
	/**
	 * @class
	 * @name vinyl.ui.DynamicForm
	 * @description 페이징모듈
	 * @extends vinyl.ui.View
	 */
	var DynamicForm = core.ui('DynamicForm', /** @lends vinyl.ui.DynamicForm# */{
		bindjQuery: 'dynamicForm',
		$statics: /** @lends vinyl.ui.DynamicForm */{
		},
		defaults: {
			minCount : 1,
			maxCount : 10,
			defaultCount: 0,
			btnText : '',
			btnToggle : true,
			tmpl : ''
		},
		events: {
		},
		selectors: {
		},
		/**
		 * 생성자
		 * @param el
		 * @param options
		 */
		initialize: function(el, options) {
			var me = this;

			if(me.supr(el, options) === false) { return me.release(); }

			scui.importJs([
				'libs/jquery.tmpl'
			], function () {
				me.dynamicHtml = $(me.options.tmpl).html();
			});

			me.tmpl = '';
			me.idCount = 1;
			me.tmplData = me.$el.data('tmplData');

			// 추가되는 항목내부에 추가버튼이 있는 경우
			me.$el.on('click', '.ui_dynamic_btn', function (e) {
				e.preventDefault();

				var $that = $(this);

				me.count = me.$el.find('.ui_dynamic_item').size() + me.options.defaultCount;
				if ($that.hasClass('ui_change')) { // 삭제
					me.deleteRow(me.$('.ui_dynamic_item').index($that.closest('.ui_dynamic_item')));
				} else if (me.count < me.options.maxCount) { // 추가
					me.addNewRow();
				} else {
					//alert('더 이상 추가할 수 없습니다.');
					core.showMessage('N0000003', [me.options.maxCount]); // 최대 {0}개까지 추가할 수 있습니다.
				}

			});

			// 추가버튼 하나짜리
			me.$el.on('click', '.ui_add_btn', function (e) {
				e.preventDefault();
				me.addNewRowInContent();
			});

			// 초기화 버튼
			me.$el.on('click', '.ui_reset_btn', function (e) {
				e.preventDefault();
				me.clear();
			});
		},

		/**
		 * 새항목 추가
		 */
		addNewRowInContent: function () {
			var me = this;

			me.count = me.$el.find('.ui_dynamic_item').size() + me.options.defaultCount;
			if (me.count < me.options.maxCount) {
				me._tmplHtml();
				me.$el.find('.ui_dynamin_content').append(me.tmpl)
					.buildUIControls().trigger('appendHtml', {newRow: me.tmpl});
				me._setTitle();
				me._setForID();
			} else {
				core.showMessage('N0000003', [me.options.maxCount]); // 최대 {0}개까지 추가할 수 있습니다.
			}
		},
		/**
		 * 다음 행에 새 항목 추가
		 */
		addNewRow: function () {
			var me = this;

			me._tmplHtml();
			me.options.btnToggle && me.tmpl.find('.ui_dynamic_btn').addClass('ui_change').html(me.options.btnText);
			me.$el.append(me.tmpl).buildUIControls().trigger('appendHtml', {newRow: me.tmpl});
			me._setTitle();
			me._setForID();
		},
		/**
		 * index에 해당하는 항목 삭제
		 * @param index
		 */
		deleteRow: function (index) {
			var me = this;

			me.$('.ui_dynamic_item').eq(index).remove();
			$(window).trigger('deleteHtml',{index: index});
			me._setTitle();
			me._setForID();
			me.$el.find('.ui_dynamic_btn, .ui_add_btn').eq(0).blur().focus();
		},
		/**
		 * 전부 삭제
		 */
		clear: function () {
			var me = this;

			me.$('.ui_dynamic_item').remove();
		},

		_getFileCount: function(){
			var me = this;

			return me.$el.find('.ui_dynamic_btn').size();
		},

		_setTitle: function(){
			var me = this;

			$.each(me.$el.find('.ui_dynamic_item'), function (idx, el) {
				var count= idx + me.options.defaultCount + 1,
					countText = count + '번째 ';
				$.each($(el).find('input[type=text], input[type=password], textarea, .ui_change'), function (idx, el) {
					$(el).attr('title', countText + $(el).data('title'));
				});

				$.each($(el).find('[data-flexible-title]'), function (idx, el) {
					var title = $(el).data('flexibleTitle');
					$(el).html(title.replace('#', count));
				});
			});
		},

		_setForID: function(){
			var me = this;

			$.each(me.$el.find('.ui_dynamic_item'), function (idx, el) {
				var count= idx + me.options.defaultCount + 1,
					countText = count + '번째 ';
				$.each($(el).find('[data-flexible-for]'), function (idx, el) {
					var labelFor = $(el).data('flexibleFor');
					$(el).attr('for', labelFor.replace('#', count));
				});

				$.each($(el).find('[data-flexible-id]'), function (idx, el) {
					var id = $(el).data('flexibleId');
					$(el).attr('id', id.replace('#', count));
				});
			});
		},

		_tmplHtml: function(){
			var me = this;

			me.mergeData = {};
			if (me.tmplData !== undefined) {
				$.each(me.tmplData, function (key, value) {
					me.idCount++;
					me.mergeData[key] = value + me.idCount;
				});
			}
			me.tmpl = $( $.tmpl(me.dynamicHtml, me.mergeData) );
		}
	});
	///////////////////////////////////////////////////////////////////////////////////////

	if (typeof define === "function" && define.amd) {
		define(['lib/jquery'], function() {
			return DynamicForm;
		});
	}

})(jQuery, window[LIB_NAME]);