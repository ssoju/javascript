/*!
 * @module scui.ui.SpeechRecognition
 * @author 김승일 책임(comahead@vinylc.com)
 */
(function ($, core, undefined) {
	"use strict";

	/**
	 * 음성검색 모듈
	 * @class
	 * @name scui.ui.SpeechRecognition
	 * @extends scui.ui.View
	 */
	var SpeechRecognition = core.ui('SpeechRecognition', {
		bindjQuery: 'speechRecognition',
		defaults: {

		},
		selectors: {
			ready: '.ui_ready',
			searching: '.ui_searching',
			failure: '.ui_failure'
		},
		initialize: function (el, options) {
			var me = this;

			if (me.supr(el, options) === false) { return; }

			me._bindEvents();
		},
		_bindEvents: function (){
			var me = this;

			me.$el.on('click', '.ui_ready', function (e) {
				e.preventDefault();

				me.$ready.hide();
				me.$searching.show();
				me.$failure.hide();
			}).on('click', '.ui_searching', function (e) {
				e.preventDefault();

				me.$ready.hide();
				me.$searching.hide();
				me.$failure.show();
			}).on('click', '.ui_failure', function (e) {
				e.preventDefault();

				me.$ready.show();
				me.$searching.hide();
				me.$failure.hide();
			});
		}
	});


	if (typeof define === "function" && define.amd) {
		define([], function() {
			return SpeechRecognition;
		});
	}

})(jQuery, window[LIB_NAME]);