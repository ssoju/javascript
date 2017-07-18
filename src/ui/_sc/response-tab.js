/*!
 * @author response-tab.js
 * @email comahead@vinylc.com
 * @create 2015-01-08
 * @license MIT License
 */
(function ($, core, undefined) {
	"use strict";

	if(core.ui.ResponseTab) { return; }

	var ctx = window,
		$doc = $(document),
		$win = $(window),
		ui = core.ui;

	//ResponseTab ////////////////////////////////////////////////////////////////////////////////
	/**
	 * @class
	 * @name vinyl.ui.ResponseTab
	 * @description 페이징모듈
	 * @extends vinyl.ui.View
	 */
	var ResponseTab = core.ui('ResponseTab', /** @lends vinyl.ui.ResponseTab# */{
		bindjQuery: 'responseTab',
		$statics: /** @lends vinyl.ui.ResponseTab */{
		},
		defaults: {
			pcCount: 0,
			mobileCount: 3,
			maxWidth: 769,
			animationTime: 700		// 애니메이션 타임. 0.7초.
		},
		selectors: {
			tabContent: '.ui_tab_content',
			tabCategory: '.ui_tab_category',
			btnPrev: '.ui_tab_prev',
			btnNext: '.ui_tab_next'
		},
		/**
		 * 생성자
		 * @param el
		 * @param options
		 */
		initialize: function(el, options) {
			var me = this;

			if(me.supr(el, options) === false) { return me.release(); }

			me.now = 0;
			me.newCount = 0;
			me.categoryWidth = 0;
			me.contentWidth = 0;
			me.setLeft = 0;
			me.isAnimation = true;

			$win.on('resizeend.' + me.cid + ' changemediasize.' + me.cid, me.fnc = function () {
				me.windowWidth =  $win.width();
				if (me.windowWidth < me.options.maxWidth) {
					me.maxCount = Math.ceil(me.$tabContent.find('a').size() / me.options.mobileCount) - 1;
					me.categoryWidth = 0;
					me.contentWidth = me.$tabContent.width();
					me.percent1 = Math.floor(1000 / me.options.mobileCount) / 1000;
					me.percent2 = Math.ceil(1000 / me.options.mobileCount) / 1000;

					me.$tabContent.find('a').each(function (index, el) {
						me.itemWidth = ((index + 1) % me.options.mobileCount === 0) ? Math.round(me.contentWidth * me.percent1): Math.round(me.contentWidth * me.percent2);
						$(el).css({'width':me.itemWidth - 1});
						me.categoryWidth += ($(el).width() + 1);
					});
					me.contentWidth = me.itemWidth * me.options.mobileCount;
					me.$tabCategory.css({'width': me.categoryWidth});
					me.setContent();
				} else {
					me.maxCount = Math.ceil(me.$tabContent.find('a').size() / me.options.pcCount) - 1;
					if (me.options.pcCount === 0) {
						me.$tabContent.find('a').css({'width': ''});
						me.$tabCategory.css({'width': '', 'left': 0});
					} else {
						setTimeout(function () {
							me.now  = (me.now > me.maxCount) ? me.maxCount : me.now;
							me.categoryWidth = 0;
							me.contentWidth = me.$tabContent.width();

							me.percent1 = Math.floor(1000 / me.options.pcCount) / 1000;
							me.percent2 = Math.ceil(1000 / me.options.pcCount) / 1000;

							me.$tabContent.find('a').each(function (index, el) {
								me.itemWidth = ((index + 1) % me.options.pcCount === 0) ? Math.floor(me.contentWidth * me.percent1): Math.floor(me.contentWidth * me.percent2);
								$(el).css({'width': me.itemWidth});
								me.categoryWidth += ($(el).width() + 1);
							});
							me.contentWidth = me.itemWidth * me.options.pcCount + me.options.pcCount;
							me.$tabCategory.css({'width': me.categoryWidth});
						});
					}

					me.setLeft = me.contentWidth * me.newCount;
					me.setAnimate(0);
				}
			});
			me.fnc();

			me.$el.on('click.' + me.cid, me.selectors.btnPrev + ', ' + me.selectors.btnNext, function (e) {
				e.preventDefault();
				me.newCount =  ($(e.target).hasClass('ui_tab_next')) ? (me.now + 1 < me.maxCount) ?  me.now + 1: me.maxCount : (me.now - 1 > 0) ?  me.now - 1: 0;
				me.setLeft = me.contentWidth * me.newCount;
				me.setAnimate(me.options.animationTime);
			}).on('focus.'+ me.cid, 'a', function (e) {
				e.preventDefault();
				if (me.windowWidth < me.options.maxWidth) {
					me.newCount = Math.floor($(e.target).index() / me.options.mobileCount);
					me.setLeft = me.contentWidth * me.newCount;
					me.setAnimate(0);
				}
			});

			scui.importJs([
				'libs/jquery.touchSwipe'
			], function () {
				me.$el.swipe({
					triggerOnTouchEnd: true,
					fingers: 1,
					allowPageScroll: "vertical",
					threshold: 75,
					excludedElements: 'input, select, textarea, .noSwipe',
					swipeLeft: function () {
						me.$btnNext.trigger('click');
					},
					swipeRight: function () {
						me.$btnPrev.trigger('click');
					}
				});
			});
		},

		setContent: function () {
			var me = this;

			me.$btnPrev.addClass('on');
			me.$btnNext.addClass('on');

			if (me.now === 0) {
				me.$btnPrev.removeClass('on');
			}
			if (me.now === me.maxCount) {
				me.$btnNext.removeClass('on');
			}
		},

		setAnimate: function (time) {
			var me = this;
			if (me.isAnimation && (me.options.pcCount > 0 || me.windowWidth < me.options.maxWidth)) {
				me.isAnimation = false;
				me.setLeft = me.setLeft < 0 ? 0 : me.setLeft;
				me.$tabContent.stop(true, true).animate({
					'scrollLeft': me.setLeft
				}, time, function () {
					me.now = me.newCount;
					me.isAnimation = true;
					me.setContent();
				});
				/*
				me.$tabCategory.animate({
					'left': -me.setLeft
				}, time, function () {
					me.now = me.newCount;
					me.isAnimation = true;
					me.setContent();
				});
				*/
			}
		}
	});
	///////////////////////////////////////////////////////////////////////////////////////

	if (typeof define === "function" && define.amd) {
		define([], function() {
			return ResponseTab;
		});
	}

})(jQuery, window[LIB_NAME]);