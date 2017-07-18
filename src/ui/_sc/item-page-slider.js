/**
 * Created by comahead on 2015-05-12.
 * @author comahead@vinylc.com 김승일 쵁임
 */
(function($, core) {
	"use strict";

	if (core.ui.ItemPageSlider) { return; }

	/**
	 * 아이템페이지 슬라이더 모듈
	 * @class
	 * @name scui.ui.ItemPageSlider
	 * @extends scui.ui.View
	 */
	var ItemPageSlider = core.ui('ItemPageSlider', {
		bindjQuery: 'itemPageSlider',
		defaults: {
			wrapMode: 'multi'   // single, multi : 썸네일이 한개자리인지, 두개짜리인지
		},
		selectors: {
			wrapper: '.slide',      // 래퍼
			scroller: '.slide>ul'   // 스크롤러
		},
		/**
		 * 생성자
		 * @param el
		 * @param options
		 */
		initialize: function (el, options) {
			var me = this;
			if (me.supr(el, options) === false) { return; }

			me.currPage = 1;

			me._bindEvents();
			me.update();

			// 표시
			me.$el.css('visibility', '');
		},
		/**
		 * 이벤트 바인딩
		 * @private
		 */
		_bindEvents: function () {
			var me = this, fuc;

			// <, > 버튼 클릭
			me.$el.on('click', '.btn_page>button', function (e) {
				e.preventDefault();

				var $el = $(this);
				if ($el[0].className.indexOf('pre') >= 0) {
					me.prev();
				} else if($el[0].className.indexOf('nxt') >= 0) {
					me.next();
				}
			});

			var startX;
			me.$wrapper.swipeGesture({
				swipe: function (type, data) {
					if (me.isAnimating) { return; }
					switch(type) {
						case 'start':
							me.isMouseDown = true;
							startX = me.$wrapper[0].scrollLeft;
							break;
						case 'move':
							if (!me.isMouseDown || data.diff.x === 0) { return; }
							me.$wrapper.scrollLeft(startX - data.diff.x);
							break;
						default:
							me.isMouseDown = false;
							if (data.diff.x === 0) { return; }
							me._snapPos(data.direction);
							break;
					}
				}
			});

			$(window).on('resizeend', fuc = function (){
				me.update();
				me._snapPos('', false);
			});
			fuc();

			me.$wrapper.on('focusin', function (e) {
				if (me.isMouseDown) { return; }
				me.currPage = $(e.target).closest('li').index() + 1;
				me._snapPos('', false);
			});
		},
		/**
		 * 이전 페이지
		 */
		prev: function () {
			var me = this;

			if (me.$wrapper[0].scrollLeft <= 0) {
				return;
			}
			me._scroll(me.$wrapper[0].scrollLeft - me.wrapperWidth);
		},
		/**
		 * 다음 페이지
		 */
		next: function () {
			var me = this;

			if (me.$wrapper[0].scrollLeft >= me.$wrapper[0].scrollWidth - me.wrapperWidth) {
				return;
			}
			me._scroll(me.$wrapper[0].scrollLeft + me.wrapperWidth);
		},
		/**
		 * 레이아웃 사이즈 재계산
		 */
		update: function () {
			var me = this,
				isMobileSize = core.isMobileMode(),
				isMultiNum = isMobileSize && me.options.wrapMode === 'multi' ? 2 : 1;

			me.wrapperWidth = me.$wrapper.width();
			me.totalPage = me.$scroller.children().size() * isMultiNum;

			if (me.totalPage < 1) {
				// 1페이지 이하이면 좌우 버튼을 숨긴다.
				me.$('.btn_page').css('visibiity', 'hidden');
			} else {
				// 아이템별 사이즈 설정
				me.$scroller.children().css('width', me.wrapperWidth * isMultiNum);
				// 전체 사이즈 설정
				me.$scroller.css('width', me.wrapperWidth * me.totalPage);
				me.$('.btn_page').css('visibiity', '');
			}
		},
		/**
		 * 스크롤링
		 * @param {Number} left 움직일 위치
		 * @private
		 */
		_scroll: function (left, useAnimate) {
			var me = this;
			// 애니메이션 중인가
			if (me.isAnimating) {
				return;
			}
			me.isAnimating = true;
			me.$wrapper.stop(true, false).animate({
				scrollLeft: left
			}, useAnimate !== false ? 'fast' : 0, function (){
				me.isAnimating = false;
				me._renderPage();
			});
		},
		/**
		 * 현재 페이지 표시
		 * @private
		 */
		_renderPage: function () {
			var me = this,
				page = Math.round(me.$wrapper[0].scrollLeft / me.wrapperWidth) + 1;

			me.currPage = page;
			me.$('.btn_page>span').html('<span class="hide">현재 항목</span>' + page + ' / <span class="hide">전체 항목</span>' + me.totalPage);
		},
		/**
		 * 스와이프가 끝난 후에 스크롤 위치 조정
		 * @param dir
		 * @private
		 */
		_snapPos: function (dir, useAnimate) {
			var me = this,
				page;
			switch(dir) {
				case 'left':
					// 좌로 했을 때 이전페이지 표시
					page = Math.ceil(me.$wrapper[0].scrollLeft / me.wrapperWidth);
					break;
				case 'right':
					// 우로 했을 때 다음페이지 표시
					page = Math.floor(me.$wrapper[0].scrollLeft / me.wrapperWidth);
					break;
				default:
					//page = Math.round(me.$wrapper[0].scrollLeft / me.wrapperWidth);
					page = me.currPage - 1;
					break;
			}
			me._scroll(me.wrapperWidth * page, useAnimate);
		}
	});

	if (typeof define === "function" && define.amd) {
		define('modules/item-page-slider', [], function() {
			return ItemPageSlider;
		});
	}

})(jQuery, window[LIB_NAME]);