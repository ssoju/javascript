/**
 * @module scui.ui.SimpleSlider
 * @authror: 김승일
 * @email: comahead@vi-nyl.com
 * @created: 2014-06-27
 * @description: 개인 > 카드상세에서 이용
 */
(function ($, core, undefined) {
	"use strict";

	var $win = $(window),
		$doc = $(document),
		imports = core.importJs(['modules/smooth-scroll']);

	//
	var SimpleSlider = core.ui('SimpleSlider', {
		bindjQuery: 'simpleSlider',
		defaults: {
			itemSelector: '>li',        // snap 타겟
			buttonToggle: 'disabled',   // disabled, visible, none 끝에 다다랐을 때 버튼처리 방식
			slidingType: 'page',        // page, item
			duration: 200,
			itemSize: false
		},
		selectors: {
			btnPrev: '.ui_simpleslider_prev',   // 이전
			btnNext: '.ui_simpleslider_next',   // 다음
			wrapper: '.ui_simpleslider_wrapper' // 래퍼
		},
		/**
		 *
		 * @param el
		 * @param options
		 */
		initialize: function (el, options) {
			var me = this;

			if (me.supr(el, options) === false) { return; }

			me.$scroller = me.$wrapper.children(); // 실제 움직일 대상
			me.$items = me.$scroller.find(me.options.itemSelector);
			me.itemCount = me.$items.size();

			me._layout();
			me._bindEvents();
			imports.done(function () {
				// 스무스스크롤 빌드
				me.scroller = me.$wrapper.scSmoothScroll({
					scrollY: false,
					scrollX: true,
					scrollByWheel: false,
					snap: '>ul>li',
					selectors: {
						scroller: '>ul'
					}
				}).on('smoothscrollend', function (e, data) {
					me._toggleButtons();
				}).scSmoothScroll('instance');

				$win.on('resizeend.'+me.cid, function () {
					me._layout();
					me.scroller.refresh();
					me.update();
					/* - 160224 수정
					me.scroller.refresh();
					me._moveToActive();
					me._toggleButtons();
					*/
				});
				me._moveToActive();
				me._toggleButtons();
			});
		},

		/**
		 *
		 * @private
		 */
		_bindEvents: function () {
			var me = this;

			$win.on('resize.'+me.cid, function () {
				!scui.isMobileMode() && me._layout();
			});

			me.$el.on('click', '.ui_simpleslider_prev', me.prev.bind(me));  // 이전
			me.$el.on('click', '.ui_simpleslider_next', me.next.bind(me));  // 다음
		},

		/**
		 * 컨텐츠 위치에 따른 버튼 토글
		 * @private
		 */
		_toggleButtons: function () {
			var me = this;

			var isBegin = me.scroller.getCurrentX() < 0,
				isEnd = me.scroller.getCurrentX() > (me.$wrapper.width() - me.$scroller.width());

			switch (me.options.buttonToggle) {
				case 'visible': // 숨김처리
					me.$btnPrev.toggle(isBegin);
					me.$btnNext.toggle(isEnd);
					break;
				case 'disabled':    // disabled 처리
					me.$btnPrev.prop('disabled', !isBegin).toggleClass('on', isBegin);
					me.$btnNext.prop('disabled', !isEnd).toggleClass('on', isEnd);
					break;
			}

			if (!isBegin && isEnd && me.$btnPrev.is(':focus')) {
				me.$btnNext.focus();
			} else if (isBegin && !isEnd && me.$btnNext.is(':focus')) {
				me.$btnPrev.focus();
			}
		},

		/**
		 * on 되어 있는 요소
		 * @private
		 */
		_moveToActive: function (){
			var me = this,
				itemWidth = me.$items.eq(0).outerWidth(),
				index = me.$items.filter('.on').index(),
				left = 0;

			if (index < 1) { return; }
			if (me.wrapWidth >= me.contentWidth) {
				me._contentScrollTo(0, 0, 0);
			} else {
				me._contentScrollTo(-itemWidth * (index - 1), 0, 0);
			}
		},

		/**
		 * on 되어 있는 요소에 강제 포커스
		 * @private
		 */
		_focusToActive: function (){
			var me = this;
			// 160304 - 임시 제거
			//me.$items.filter('.on').find('a').focus();
		},

		/**
		 *
		 * @private
		 */
		_layout: function () {
			var me = this,
				wrapWidth = me.$wrapper.width();

			me.wrapWidth = wrapWidth;
			me.contentWidth = 0;
			me.$items.each(function () {
				me.contentWidth += $(this).outerWidth(true);
			});
			me.$scroller.css('width', me.contentWidth + 2);
			if (me.wrapWidth >= me.contentWidth) {
				me._contentScrollTo(0, 0, 0);
			}
		},

		_contentScrollTo: function (x, y) {
			var me = this;
			me.scroller && me.scroller.scrollTo(Math.min(0, Math.max(me.wrapWidth - me.contentWidth, x)), 0, 0)
		},

		/**
		 * 이전
		 * @param {jQuery#Event} e
		 */
		prev: function (e) {
			var me = this;

			me._moving(false);
		},

		/**
		 * 다음
		 * @param {jQuery#Event} e
		 */
		next: function (e){
			var me = this;

			me._moving(true);
		},

		/**
		 * 스크롤
		 * @param {string} dir 지정된 방향으로 스크롤
		 * @private
		 */
		_moving: function (dir) {
			var me = this, opt = me.options;

			me.$wrapper.scSmoothScroll((dir ? 'scrollNext' :  'scrollPrev'), 'x', opt.duration);
		},

		/**
		 * 업데이트
		 * @param {string}
		 * @private
		 */
		update: function () {
			var me = this, opt = me.options;

			me._moveToActive();
			me._toggleButtons();
			me._focusToActive();
		}
	});

})(jQuery, window[LIB_NAME]);