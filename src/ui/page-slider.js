/*!
 * @module scui.ui.ContentSlider
 * @author 김승일 책임(comahead@vinylc.com)
 * @description CSR 시즌테마 전용 컨텐츠 슬라이더모듈
 * @requires: modules/smooth-scroll.js, modules/content-slider.js
 */
(function ($, core, undefined) {
	"use strict";

	var imports = core.importJs(['modules/smooth-scroll']),
		$win = $(window),
		$doc = $(document);

	var CsrContentSlider = core.ui('CsrContentSlider', {
		bindjQuery: 'csrContentSlider',
		defaults: {
			tabSelector:'',      // 연결된 탭 셀렉터
			activeIndex: 0
		},
		selectors: {
			contentScroller: '.thema_list',    // 컨텐츠스크롤러
			contentPanels: '.cont_view'         // 컨텐츠패널
		},
		initialize: function (el, options) {
			var me = this;
			if (me.supr(el, options) === false) {
				return;
			}

			me.currentIndex = 0;        // 현재 인덱스
			me.panelCount = me.$contentPanels.size();    // 컨텐츠 패널 갯수
			me.isSliding = false;

			me.$tabSlide = $(me.options.tabSelector);
			if (me.panelCount <= 1) {
				me._visible();
				return;
			}

			me.$tabSlideScroller = me.$tabSlide.find('>.ui_scroller');
			me.$tabSlideItems = me.$tabSlideScroller.find('>li');
			me.$tabSlideButtons = me.$tabSlide.find('>.m_display');
			me.$contentSlide = me.$el;


			// 참조모듈이 모두 로드됐을 때 비로서 빌드시킨다.
			imports.done(function (){
				me._bindEvents();
				me._buildSlideTab();
				me._buildContentSlide();
				me.scrollToIndex(me.options.activeIndex);
				me._hideOuterItems(me.currentIndex);  // 바깥영역에 있는 건 숨김처리(포커스가 안가도록)
				me._visible();
				me._inited = true;
			});
		},
		_visible: function () {
			this.$tabSlide.css('visibility', '');
			this.$contentSlide.css('visibility', '');
		},
		_bindEvents: function () {
			var me = this,
				lastWidth,
				resizeCallback;


			$win.on('resize.contentslide changemediasize.contentslide', resizeCallback = function (){
				var winWidth = $win.width();

				if (lastWidth === winWidth) {
					return;
				}
				lastWidth = winWidth;
				me.$contentScroller.css({
					width: winWidth * me.panelCount
				});
				me.$contentPanels.css({
					width: winWidth
				}).show();

				if (core.isMobileMode()) {
					me.$tabSlide.css('width', winWidth);
					me.$tabSlideButtons.css('width', winWidth);
					me.$tabSlideScroller.css('width', me.panelCount * (winWidth / 3));
					me.$tabSlideItems.css('width', winWidth / 3);
					me.$tabSlideButtons.show();
				} else {
					me.$tabSlide.css('width', '');
					me.$tabSlideScroller.css('width', Math.min(954, winWidth));
					me.$tabSlideItems.css('width', '20%');
					me.$tabSlideButtons.hide();
				}

				if (me._inited) {

					if (core.isMobileMode()) {
						me._moveActiveTab(undefined, false);
					}

					me.$contentSlide.scSmoothScroll('scrollTo', -(winWidth * me.currentIndex), 0, 0);
				}
			});

			me._preventSlideFocusin();
			resizeCallback();
		},


		/**
		 * 슬라이드탭 빌드
		 * @private
		 */
		_buildSlideTab: function () {
			var me = this,
				$btns = me.$tabSlide.find('.bg_arrow');

			// 상단탭 슬라이딩 - start
			me.$tabSlide.on('smoothscrollend', function (e, data) {
				// 스크롤위치에 따라 좌우 버튼 토글
				$btns.filter('.left').toggle(data.x < 0);
				$btns.filter('.right').toggle(data.x > data.wrapWidth - data.scrollWidth + 3);
				// 화면에 보이는 갯수가 홀수이어서 딱 맞아떨어지지 않아서 -+3
			}).on('click', 'a', function (e) {
				// 상단 탭 클릭시
				e.preventDefault();
				me.scrollToIndex($(this).parent().index());
			}).scSmoothScroll({
				scrollX: true,
				eventPassthrough: 'vertical',
				resizeRefresh: true,
				momentum: false,
				snap: 'li'
			}).on('touchstart mousedown', function (e) {
				me.$tabSlide.scSmoothScroll('option', 'snap', 'li');
			});
			// 상단탭 슬라이딩 - end
		},

		/**
		 * 컨텐츠 슬라이드 빌드
		 * @private
		 */
		_buildContentSlide: function () {
			var me = this;

			me.$contentSlide.on('smoothscrollstart', function (e) {
				if (!core.browser.isTouch || me.isSliding) {e.preventDefault(); return; }
				me.isSliding = true;

				me._contentSlideStart();
			}).on('smoothscrollend', function (e, data) {
				if (!core.browser.isTouch) { return; }
				me.isSliding = false;

				var index = Math.round(Math.abs(data.x) / data.wrapWidth);
				me._contentSlideEnd(index);
			}).scSmoothScroll({
				selectors: {
					scroller: '.thema_list'
				},
				scrollX: true,
				scrollByWheel: false,
				directionLockThreshold: 20,
				eventPassthrough: 'vertical',
				resizeRefresh: true,
				momentum: false,
				snap: '.cont_view'
			});
		},

		/**
		 * 슬라이드 이전에 호출
		 * @private
		 */
		_contentSlideStart: function () {
			var me = this;

			me.$contentPanels.css({
				'overflowY': '',
				'visibility': '',
				'height': 'auto'
			});
			me.$contentScroller.css({
				'overflowY': 'hidden',
				'height': me.$contentPanels.eq(me.currentIndex).height()
			});
			me.$contentSlide.triggerHandler('contentslidestart', {index: me.currentIndex});
		},

		/**
		 * 슬라이드가 끝난 이후에 호출
		 * @param index
		 * @private
		 */
		_contentSlideEnd: function (index) {
			var me = this;
			if (me.currentIndex === index) { return; }

			me.currentIndex = index;
			me._hideOuterItems(index);

			// tab - start
			me._moveActiveTab(index);
			$('html,body').scrollTop(0);
			// tab - en

			me.$contentSlide.triggerHandler('csrcontentslideend', {index:index, target: me.$contentPanels.get(index)});
		},

		/**
		 * 디바이스에서 가상키보드가 올라왔을 때는 좌우스와이핑이 안먹도록 설정
		 * @private
		 */
		_preventSlideFocusin: function() {
			var me = this,
				isFocusin = false;

			if (core.browser.isMobile && core.browser.isTouch) {
				me.$contentSlide.on('focusin focusout', 'input[type=text], input[type=tel], ' +
					'input[type=date], input[type=password], select, textarea', function (e){
					isFocusin = e.type === 'focusin';
					me.$contentSlide.module('smoothScroll').setDisabled(isFocusin);
				});
			}
		},

		/**
		 * 주어진 index 외의 컨텐츠는 숨긴다.(body height 조절 및 포커싱이 안되도록 하기 위함)
		 * @param index
		 * @private
		 */
		_hideOuterItems: function (index){
			var me = this;
			me.$contentPanels.eq(index).css({
				'overflowY': 'visible',
				'height': 'auto'			,
				'visibility': ''
			}).siblings().css({
				'overflowY': 'hidden',
				'height': me.$contentPanels.eq(index).height(),
				'visibility': ''
			});
			me.$contentScroller.css({
				'overflowY': 'visible',
				'height': 'auto'
			});
		},

		/**
		 * 탭 활성화
		 * @param index
		 * @private
		 */
		_moveActiveTab: function (index, isAni) {
			var me = this;

			if (me.panelCount <= 3) { return; }
			if (typeof index === 'undefined') {
				index = me.$tabSlideItems.index(me.$tabSlideItems.filter('.on'));
			} else {
				var $tab = me.$tabSlideItems.eq(index).addClass('on');

				$tab.siblings().removeClass('on no_bg');
				$tab.prev().addClass('no_bg');
			}

			if (core.isMobileMode()) {
				if (index > 0 && index < me.panelCount - 1) { // 5
					index -= 1;
				} else if (index === me.panelCount - 1) {
					index = me.panelCount - 3;
				}
				// 활성화된 탭이 가운데 오도록 스크롤
				if (me._inited) {
					me.$tabSlide.scSmoothScroll('option', 'snap', '');
					me.$tabSlide.scSmoothScroll('scrollTo', -(index * (me.$tabSlide.width() / 3)), 0, isAni === false ? 0 : 120);
				}
			}
		},


		/**
		 * index에 해당하는 위치로 스크롤
		 * @param index
		 * @param isForce
		 */
		scrollToIndex: function (index) {
			var me = this;

			if (index < 0) { index = 0; }
			else if (index >= me.panelCount){ index = me.panelCount - 1; }

			me._contentSlideStart();
			me.$contentPanels.css({'overflowY': ''});
			me.$contentSlide.scSmoothScroll('scrollTo', -(me.$contentSlide.width() * index), 0, 0);
			me._contentSlideEnd(index);
		},
		getCurrentIndex: function () {
			return this.currentIndex;
		}
	});


	if (typeof define === "function" && define.amd) {
		define('modules/csrcontent-slider', [], function() {
			return CsrContentSlider;
		});
	}

})(jQuery, window[LIB_NAME]);
