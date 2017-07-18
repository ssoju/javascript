/**
 * Created by comahead on 2016-01-18
 * @author odyseek@vinylc.com 강태진
 */
(function($, core) {
	"use strict";

	if (core.ui.ItemPageFade) { return; }

	var isMobileSize = core.isMobileMode();
	/**
	 * 아이템페이지 슬라이더 모듈
	 * @class
	 * @name scui.ui.ItemPageFade
	 * @extends scui.ui.View
	 */
	var ItemPageFade = core.ui('ItemPageFade', {
		bindjQuery: 'itemPageFade',
		defaults: {
			pageType: 'top'
		},
		selectors: {
			content: '.slide',
			item: '.slide > ul > li'
		},
		/**
		 * 생성자
		 * @param el
		 * @param options
		 */
		initialize: function (el, options) {
			var me = this;
			if (me.supr(el, options) === false) { return; }

			me.nowPage = 0;
			me.isAnimate = true;

			me._bindEvents();
			me._update();

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
					me.move('prev');
				} else if($el[0].className.indexOf('nxt') >= 0) {
					me.move('next');
				}
			});

			me.$el.swipeGesture().on('swipegestureend', function (e, data) {
				if (!core.isMobileMode()) {return};
				switch(data.direction) {
					case 'left':
						me.move('next');
						break;
					case 'right':
						me.move('prev');
						break;
				}
			});

			$(window).on('resizeend', fuc = function (){
				me._update();
				me._renderPage();
			});
			fuc();
		},
		/**
		 * 이전 페이지
		 */
		move: function (direction) {
			var me = this;

			if (me.isAnimate) {
				if (direction === 'prev') {
					me.newPage = (me.nowPage - 1 < 0) ? me.totalPage - 1 : me.nowPage - 1;
					me._fade();
				} else {
					me.newPage = (me.nowPage + 1 < me.totalPage) ? me.nowPage + 1 : 0;
					me._fade();
				}
			}
		},

		/**
		 * fadein / fadeout
		 */
		_fade: function () {
			var me = this;

			me.isAnimate = false;
			if (core.isMobileMode()) {
				// 모바일일 경우 1개만 가지고 모션
				me.$item.eq(me.nowPage).hide().end().eq(me.newPage).show();
				me.isAnimate = true;
				me.nowPage = me.newPage;
				me._renderPage();
			} else {
				me.$item.eq(me.nowPage * 2).hide().end().eq((me.nowPage * 2) + 1).hide().end().eq(me.newPage * 2).show().end().eq((me.newPage * 2) + 1).show();
				me.isAnimate = true;
				me.nowPage = me.newPage;
				me._renderPage();
			}
		},
		/**
		 * 레이아웃 사이즈 재계산
		 */
		_update: function () {
			var me = this,
				isMultiNum = core.isMobileMode() ? 1 : 2;

			me.nowPage = 0;
			me.$item.css({'position': 'absolute', 'top': 0});
			me.wrapperWidth = me.$content.width();
			me.maxCount = me.$item.size();
			me.totalPage = Math.ceil(me.maxCount / isMultiNum);

			if (me.totalPage < 1) {
				// 1페이지 이하이면 좌우 버튼을 숨긴다.
				me.$('.btn_page').css('visibiity', 'hidden');
			} else if (me.options.pageType === 'top') {
				// 아이템별 사이즈 설정
				me.$item.css({'width': me.wrapperWidth, 'top': 0}).eq(0).show().siblings().hide();
				!core.isMobileMode() && me.$item.each(function (index, el) {
					var top = (index % 2 === 0) ? 0 : 109;
					$(el).css({'top': top}).toggle(index === 0 || index === 1);
				});
				me.$('.btn_page').css('visibiity', '');
			} else if (me.options.pageType === 'left') {
				if (core.isMobileMode()) {
					// 아이템별 사이즈 설정
					me.$item.css({'width': me.wrapperWidth, 'top': 0, 'left': 0}).eq(0).show().siblings().hide();
				} else {
					// 아이템별 사이즈 설정
					me.$item.css({'width': '', 'top': 0}).eq(0).show().siblings().hide();
					me.$item.each(function (index, el) {
						var left, marginLeft, paddingLeft;
						if (index % 2 === 0) {
							left = 0 ;
							marginLeft = 0;
							paddingLeft = 0;
						} else {
							left = 306;
							marginLeft = '';
							paddingLeft = '';
						}
						$(el).css({'left': left, 'marginLeft': marginLeft, 'paddingLeft': paddingLeft}).toggle(index === 0 || index === 1);
					});
				}
				me.$('.btn_page').css('visibiity', '');
			}
		},
		/**
		 * 레이아웃 사이즈 재계산
		 */
		update: function () {
			var me = this;

			me.updateSelectors();
			me._update();
			me._renderPage();
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
				page = me.nowPage + 1;

			me.$('.btn_page>span').html('<span class="hide">현재 항목</span>' + page + ' / <span class="hide">전체 항목</span>' + me.totalPage);
		}
	});

	if (typeof define === "function" && define.amd) {
		define('modules/item-page-slider', [], function() {
			return ItemPageSlider;
		});
	}

})(jQuery, window[LIB_NAME]);