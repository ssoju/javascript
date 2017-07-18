/**
 * @module scui.ui.faqSlider
 * @authror: 강태진
 * @email: comahead@vinylc.com
 * @created: 2015-12-14
 * @description: 개인 > faq에서 이용
 */
(function ($, core, undefined) {
	"use strict";

	var FaqSlider = core.ui('FaqSlider', {
		bindjQuery: 'faqSlider',
		defaults: {
			defaultLeftPosition: 1,
			animteTime: 500
		},
		selectors: {
			faqPrev : '.ui_faq_prev',
			faqNext : '.ui_faq_next',
			faqContent : '.ui_faq_content'
		},
		/**
		 *
		 * @param el
		 * @param options
		 */
		initialize: function (el, options) {
			var me = this;

			if (me.supr(el, options) === false) { return; }

			me._init();
			me._bindEvents();
		},

		/**
		 *
		 * @private
		 */
		_init: function () {
			var me = this;

			me.maxCount = me.$faqContent.find('> ul > li').size() - 1;
			me.contentWidth = me.$el.width() + me.options.defaultLeftPosition;
			me.viewPage = 0;
			me.isAnimate = true;

			me.$faqContent.css('left', me.options.defaultLeftPosition).find('li').not(':eq('+ me.viewPage +')').children().css('visibility', 'hidden');
			me._setButton(false);
		},

		/**
		 *
		 * @private
		 */
		_bindEvents: function () {
			var me = this;



			me.$faqPrev.on('click', function (e) {
				e.preventDefault();
				if (me.isAnimate && me.viewPage > 0) {
					me.isAnimate = false;
					me.viewPage = me.viewPage - 1;
					me._animate('prev');
				}
			});

			me.$faqNext.on('click', function (e) {
				e.preventDefault();
				if (me.isAnimate && me.viewPage < me.maxCount) {
					me.isAnimate = false;
					me.viewPage = me.viewPage + 1;
					me._animate('next');
				}
			});
		},

		/**
		 * animate
		 * @param {string}
		 * @private
		 */
		_animate: function (dir) {
			var me = this,
				move = (dir === 'next') ? -me.contentWidth : me.contentWidth;

			me.$faqContent.find('li').children().css('visibility', 'visible');
			me.$faqContent.animate({
				'left': '+=' + move
			}, me.options.animteTime, function () {
				me.isAnimate = true;
				me.$faqContent.find('li').not(':eq('+ me.viewPage +')').children().css('visibility', 'hidden');
				me._setButton(true);
			});
		},

		/**
		 * animate
		 * @param {string}
		 * @private
		 */
		_setButton: function (isClick) {
			var me = this;

			me.$faqPrev.removeClass('disalbed').addClass('on').prop('disabled', false);
			me.$faqNext.removeClass('disalbed').addClass('on').prop('disabled', false);

			if (me.viewPage === 0) me.$faqPrev.addClass('disalbed').removeClass('on').prop('disabled', true);
			if (me.viewPage === me.maxCount)  me.$faqNext.addClass('disalbed').removeClass('on').prop('disabled', true);

			if (isClick) {
				if (me.viewPage === 0) me.$faqNext.focus();
				if (me.viewPage === me.maxCount) me.$faqPrev.focus();
			}
		}
	});

})(jQuery, window[LIB_NAME]);


/*!
 * @module scui.ui.SlideNav
 * @author 김승일 책임(comahead@vinylc.com)
 * @created 2015-08-04
 */
(function ($, core, undefined) {
	var $doc = $(document);

	var SlideNav = core.ui('SlideNav', /**@lends scui.ui.SlieNav */{
		bindjQuery: 'slideNav',
		defaults: {
			buttonToggleType: 'disabled', // disabled, display 슬라이드가 끝났을 때 버튼을 어떻게 할 것인가
			sideOffset: 20// 버튼영역이 그라이데이션이기 때문에 공백을 추가적으로 설정해주어야 한다.
		},
		selectors: {
			wrapper: '.ui_slide_wrap',
			scroller: '.ui_slide_scroller'
		},
		initialize: function (el, options) {
			var me = this;
			if (me.supr(el, options) === false) { return; }

			me.isEnable = true;
			me.offset = me.options.sideOffset;
			me.$el.css('paddingLeft', 0);
			me.$scroller.children().css('position', 'absolute');

			me._bindEvents();
		},

		/**
		 * 이벤트 바인딩
		 * @private
		 */
		_bindEvents: function () {
			var me = this;

			var startPos, prevPos;
			var getPosType = function () {
				var posType,
					scrollLeft = me.$wrapper[0].scrollLeft;
				if (scrollLeft === 0) {
					posType = 'start';
				} else if (scrollLeft === me.$wrapper[0].scrollWidth - me.$el.width()) {
					posType = 'end';
				} else {
					posType = 'mid';
				}
				return posType;
			};

			me.$scroller.swipeGesture().on('swipegesturestart swipegesturemove swipegestureend swipegesturecancel', function (e, data) {
				if (!me.isEnable) { return; }
				var scrollLeft,
					posType;
				switch(e.type) {
					case 'swipegesturestart':
						startPos = me.$wrapper[0].scrollLeft;
						break;
					case 'swipegesturemove':
						me.$wrapper.scrollLeft(startPos - data.diff.x);
						scrollLeft = me.$wrapper[0].scrollLeft;
						posType = getPosType();
						me.$el.triggerHandler('slidenavmove', {pos: scrollLeft, posType: posType});
						break;
					case 'swipegestureend':
					case 'swipegesturecancel':
						if (data.diff.x !== 0){
							me._snapPos(data.direction);
						}
						break;
				}
			});

			me.$el
				.on('click', '.ui_slide_prev', function (e) { e.preventDefault(); me.prev(); })     // 좌로 이동
				.on('click', '.ui_slide_next', function (e) { e.preventDefault(); me.next(); });    // 우로 이동

			// 좌우 버튼 토글
			me.$el.on('slidenavstart slidenavmove slidenavend', function (e, data) {
				if (!me.isEnable) { return; }
				me._toggleButtons();
			});
			var mediasizeCallback;
			$(window).on('changemediasize.' + me.cid, mediasizeCallback = function (e) {
				me.update(false);
			});
			mediasizeCallback();
		},

		_toggleButtons: function () {
			var me = this,
				scrollLeft = me.$wrapper[0].scrollLeft,
				prev = true,
				next = true;

			if (!me.isEnable) { return; }
			if (me.$wrapper.scrollWidth < me.$el.width()) {
				prev = next = false;
			} else {
				if (scrollLeft === 0) {
					prev = false;
					next = true;
				} else if (scrollLeft === me.$wrapper[0].scrollWidth - me.$el.width()) {
					prev = true;
					next = false;
				} else {
					prev = next = true;
				}
			}

			if (me.options.buttonToggleType === 'disabled') {
				prev = !prev;
				next = !next;
			}


			me.$('.ui_slide_prev')[me.options.buttonToggleType](prev);
			me.$('.ui_slide_next')[me.options.buttonToggleType](next);
		},

		enable: function (flag) {
			var me = this;

			me.isEnable = flag;
			me.$el.css('paddingLeft', flag ? 0 : '');
			if (!flag) {
				me.$scroller.children().css({'position': '', 'left': ''});
				me.$wrapper.scrollLeft(0);
			} else {
				me.update();
			}
		},

		/**
		 * 좌로 스크롤
		 */
		prev: function () {
			var me = this,
				scrollLeft = me.$wrapper[0].scrollLeft;

			if (!me.isEnable) { return; }
			for(var i = me.items.length - 1, item; i >= 0; i--) {
				item = me.items[i];
				if (scrollLeft > item.x) {
					me._scroll(item.x - me.offset);
					break;
				}
			}
		},

		/**
		 * 우로 스크롤
		 */
		next: function () {
			var me = this,
				scrollLeft = me.$wrapper[0].scrollLeft,
				endPoint = scrollLeft + me.$el.width();

			if (!me.isEnable) { return; }
			for(var i = 0, len = me.items.length, item; i < len; i++) {
				item = me.items[i];
				if (item.x + item.width > endPoint - me.offset) {
					me._scroll(scrollLeft + ((item.x + item.width) - endPoint) + me.offset);
					break;
				}
			}
		},

		/**
		 * 스와이핑 방향에 따라 스냅 시켜 준다.
		 * @param dir 방향
		 * @private
		 */
		_snapPos: function (dir) {
			var me = this,
				scrollLeft = me.$wrapper[0].scrollLeft,
				endPoint = scrollLeft + me.$el.width();

			if (!me.isEnable) { return; }
			if (dir === 'left') {
				for(var i = 0, len = me.items.length, item; i < len; i++) {
					item = me.items[i];
					if (item.x + item.width > endPoint - me.offset) {
						me._scroll(scrollLeft + ((item.x + item.width) - endPoint) + me.offset);
						break;
					}
				}
			} else { // right
				for(var i = 0, len = me.items.length, item; i < len; i++) {
					item = me.items[i];
					if (item.x + item.width > scrollLeft + me.offset) {
						me._scroll(item.x - me.offset);
						break;
					}
				}
			}
		},

		/**
		 * 스크롤링
		 * @param left
		 * @private
		 */
		_scroll: function (left) {
			var me = this;
			if (!me.isEnable) { return; }
			me.$wrapper.stop(true, false).animate({
				'scrollLeft': left
			}, 'fast', function (){
				me._complete();
			});
		},

		/**
		 * 스크롤이 완료됐을 때 호출
		 * @private
		 */
		_complete: function () {
			var me = this,
				scrollLeft = me.$wrapper[0].scrollLeft,
				posType;

			if (!me.isEnable) { return; }
			if (scrollLeft === 0) {
				posType = 'start';
			} else if (scrollLeft === me.$wrapper[0].scrollWidth - me.$el.width()) {
				posType = 'end';
			} else {
				posType = 'mid';
			}
			me.$el.triggerHandler('slidenavend', {pos: scrollLeft, posType: posType});
		},

		/**
		 * 위치 재계산
		 */
		update: function (isReposition) {
			var me = this;
			if (!me.isEnable) { return; }

			if (isReposition !== false) {
				var totalWidth = me.offset,
					items = [];
				me.$scroller.css('width', '').children().each(function () {
					var $el = $(this),
						w = $el.outerWidth();

					$el.css({'position': 'absolute', 'left': totalWidth});
					items.push({x: totalWidth, width: w});
					totalWidth += w;
				});
				me.items = items;
				me.$scroller.scrollLeft(0).css({'width': totalWidth + me.offset});
			}

			me._toggleButtons();
		},

		center: function ($item) {
			var me = this;

			if (!me.isEnable) { return; }
			if (!$item || !$item.size()) { return; }
			me.$wrapper.scrollLeft($item.position().left - (me.$el.width() / 2) + ($item.outerWidth() / 2));
			me._complete();
		},

		scrollTo: function (left, duration) {
			var me = this;

			me.$wrapper.scrollLeft(left)
			me._complete();
		}
	});


	if (typeof define === "function" && define.amd) {
		define([], function() {
			return SlideNav;
		});
	}
})(jQuery, window[LIB_NAME]);
