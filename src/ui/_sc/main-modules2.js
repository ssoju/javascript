/**
 * @module scui.ui.NormalCard
 * @authror: 강태진
 * @email: comahead@vinylc.com
 * @created: 2016-01-16
 * @description: 개인 > 메인 - 숫자카드에서 사용
 */
(function ($, core, undefined) {
	"use strict";

	var $win = $(window),
		$doc = $(document),
		isMobile = core.isMobileMode();

	var NormalCard = core.ui('NormalCard', {
		bindjQuery: 'normalCard',
		defaults: {
			center: 1
		},
		selectors: {
			cardPlate: '.ui_normal_plate',
			cardInfo: '.ui_normal_info',
			cardPrev: '.ui_normal_prev',
			cardNext: '.ui_normal_next',
			cardShadow: '.ui_normal_shadow'
		},
		/**
		 *
		 * @param el
		 * @param options
		 */
		initialize: function (el, options) {
			var me = this;

			if (me.supr(el, options) === false) { return; }

			me.isAnimate = true;
			me.position = [];
			me.position[0] = [];
			me.position[1] = [];
			me.position[2] = [];
			me.position[3] = [];

			me._layout();
			me._bindEvents();
		},

		/**
		 *
		 * @private
		 * @description PC/Mobile 공통 이벤트
		 */
		_bindEvents: function () {
			var me = this,
				changemediasizeCallback;

			$win.on('changemediasize.' + me.cid + ' resizeend.' + me.cid, changemediasizeCallback = function (e) {
				isMobile = core.isMobileMode();
				if (isMobile) {
					me.position[0]['left'] = 0;
					me.position[0]['width'] = 145;
					me.position[0]['height'] = 57;

					me.position[1]['left'] = 32;
					me.position[1]['width'] = 182;
					me.position[1]['height'] = 69;

					me.position[2]['left'] = 101;
					me.position[2]['width'] = 145;
					me.position[2]['height'] = 57;

					me.position[3]['firstLeft'] = -70;
					me.position[3]['lastLeft'] = 181;
					me.position[3]['width'] = 101;
					me.position[3]['height'] = 40;
				} else {
					me.position[0]['left'] = 0;
					me.position[0]['width'] = 290;
					me.position[0]['height'] = 98;

					me.position[1]['left'] = 98;
					me.position[1]['width'] = 366;
					me.position[1]['height'] = 132;

					me.position[2]['left'] = 270;
					me.position[2]['width'] = 290;
					me.position[2]['height'] = 98;

					me.position[3]['firstLeft'] = -90;
					me.position[3]['lastLeft'] = 420;
					me.position[3]['width'] = 203;
					me.position[3]['height'] = 68;
				}

				me.$cardPlate.eq(0).css({'left': me.position[0]['left'], 'width': me.position[0]['width'], 'height': me.position[0]['height'], 'zIndex': 2})
					.end().eq(1).css({'left': me.position[1]['left'], 'width': me.position[1]['width'], 'height': me.position[1]['height'], 'zIndex': 5})
					.end().eq(2).css({'left': me.position[2]['left'], 'width': me.position[2]['width'], 'height': me.position[2]['height'], 'zIndex': 2})
					.end().eq(3).css({'left': me.position[3]['lastLeft'], 'width': me.position[3]['width'], 'height': me.position[3]['height'], 'zIndex': 1});
			});
			changemediasizeCallback();

			me.$el.swipeGesture().on('swipegestureleft swipegestureright', function (e) {
				if (e.type === 'swipegestureleft') {
					me.$cardNext.trigger('click');
				} else {
					me.$cardPrev.trigger('click');
				}
			})

			me.$cardPrev.on('click', function (e) {
				e.preventDefault();

				if (me.isAnimate) {
					me.isAnimate = false;

					me.$cardPlate.eq(3).show().css({left:me.position[3]['firstLeft'],width: me.position[3]['width'],height: me.position[3]['height'],zIndex:1}).insertBefore(me.$cardPlate.eq(0));
					me.$cardInfo.eq(3).insertBefore(me.$cardInfo.eq(0));
					me.updateSelectors();

					me.$cardShadow.hide();
					me.$cardPlate.eq(0).css('zIndex', 2).animate({
						'left': me.position[0]['left'],
						'width': me.position[0]['width'],
						'height': me.position[0]['height']
					}, 400);

					me.$cardPlate.eq(1).css('zIndex', 5).animate({
						'left': me.position[1]['left'],
						'width': me.position[1]['width'],
						'height': me.position[1]['height']
					}, 400);

					me.$cardPlate.eq(2).css('zIndex', 2).animate({
						'left': me.position[2]['left'],
						'width': me.position[2]['width'],
						'height': me.position[2]['height']
					}, 400);

					me.$cardPlate.eq(3).css('zIndex', 1).animate({
						'left': me.position[3]['lastLeft'],
						'width': me.position[3]['width'],
						'height': me.position[3]['height']
					}, 400, function () {
						me.$cardPlate.eq(3).hide();
						me.$cardShadow.show();
						me.isAnimate = true;
					});

					me.$cardInfo.eq(2).fadeOut(400).end().eq(1).fadeIn(400);
				}
			});

			me.$cardNext.on('click', function (e) {
				e.preventDefault();
				if (me.isAnimate) {
					me.isAnimate = false;
					me.$cardPlate.eq(3).show();
					me.$cardShadow.hide();
					me.$cardPlate.eq(0).css('zIndex', 1).animate({
						'left': me.position[3]['firstLeft'],
						'width': me.position[3]['width'],
						'height': me.position[3]['height']
					}, 400);

					me.$cardPlate.eq(1).css('zIndex', 2).animate({
						'left': me.position[0]['left'],
						'width': me.position[0]['width'],
						'height': me.position[0]['height']
					}, 400);

					me.$cardPlate.eq(2).css('zIndex', 5).animate({
						'left': me.position[1]['left'],
						'width': me.position[1]['width'],
						'height': me.position[1]['height']
					}, 400);

					me.$cardPlate.eq(3).css('zIndex', 2).animate({
						'left': me.position[2]['left'],
						'width': me.position[2]['width'],
						'height': me.position[2]['height']
					}, 400, function () {
						me.$cardPlate.eq(0).css({
							'left': me.position[3]['lastLeft'],
							'width': me.position[3]['width'],
							'height': me.position[3]['height'],
							zIndex: 1
						}).insertAfter(me.$cardPlate.eq(3));
						me.$cardInfo.eq(0).insertAfter(me.$cardInfo.eq(3));
						me.updateSelectors();
						me.$cardPlate.eq(3).hide();
						me.$cardShadow.show();
						me.isAnimate = true;
					});

					me.$cardInfo.eq(1).fadeOut(400).end().eq(2).fadeIn(400);
				}
			});
		},

		/**
		 *
		 * @private
		 * @description 레이아웃 설정
		 */
		_layout: function () {
			var me = this,
				height = me.$el.height();

			me.$cardInfo.hide().eq(me.options.center).show();
			me.$cardPrev.css('top', (height - me.$cardPrev.height()) / 2);
			me.$cardNext.css('top', (height - me.$cardNext.height()) / 2);

		},

		/**
		 * 해제
		 */
		release: function () {
			var me = this;

			$win.off('.' + me.cid);
			me.supr();
		}
	});
})(jQuery, window[LIB_NAME]);

/**
 * @module scui.ui.NumberCard
 * @authror: 강태진
 * @email: comahead@vinylc.com
 * @created: 2016-01-16
 * @description: 개인 > 메인 - 숫자카드에서 사용
 */
(function ($, core, undefined) {
	"use strict";

	var $win = $(window),
		$doc = $(document),
		isMobile = core.isMobileMode();

	var NumberCard = core.ui('NumberCard', {
		bindjQuery: 'numberCard',
		defaults: {
			normalWidth : '14%',
			maxWidth : '26%',
			minWidth : '12%',
			slideTime : 400,
			timerTime : 200
		},
		selectors: {
			cardSummary: '.ui_number_card_summary',  	// 숫자 카드 초기 서머리 영역
			cardDetail: '.ui_number_card_detail'		// 숫자 카드 디데일 영역
		},
		/**
		 *
		 * @param el
		 * @param options
		 */
		initialize: function (el, options) {
			var me = this;

			if (me.supr(el, options) === false) { return; }

			// 디폴트값 설정
			me.numberCardTimer = null;
			me.detailIndex = null;
			me.isAnimate = false;
			me.isPcEventBind = '';

			// 컨텐츠 내부에 각 엘리먼트를 찾는다
			me.$indi = me.$cardDetail.find('.indi_wrap > button');
			me.$cardSummaryDiv = me.$cardSummary.find('> div');
			me.$cardSummaryUl = me.$cardSummary.find('> div > ul');
			me.$cardSummaryLi = me.$cardSummary.find('> div > ul > li');
			me.$cardDetailUl = me.$cardDetail.find('ul');
			me.$cardDetailLi = me.$cardDetail.find('ul > li');
			me.cardDetailMax = me.$cardDetailLi.size() - 1;

			me._bindEvents();
		},

		/**
		 *
		 * @private
		 * @description PC/Mobile 공통 이벤트
		 */
		_bindEvents: function () {
			var me = this,
				changemediasizeCallback;

			me._bindEventsPC();
			/*
			 // 인디케이터 재계산
			 $win.on('changemediasize.' + me.cid + ' resizeend.' + me.cid, changemediasizeCallback = function (e) {
			 var data = scui.ui.mediaInfo;
			 me.winWidth = $win.width();
			 if (core.isMobileMode()) {
			 if (me.isPcEventBind ===  '' || me.isPcEventBind) {
			 me._unbindEventsPC();
			 me._bindEventsMobile();
			 }
			 me._layoutMobile();
			 } else {
			 switch(data.mode){
			 case 'wide':
			 case 'w1280':
			 case 'w1024':
			 // 창크기가 1203~768 사이일 경우 창크기로 고정
			 if (me.isPcEventBind ===  '' || !me.isPcEventBind) {
			 me._unbindEventsMobile();
			 me._bindEventsPC();
			 }
			 me._layoutPC();
			 break;
			 case 'w768':
			 case 'w376':
			 if (me.isPcEventBind ===  '' || me.isPcEventBind) {
			 me._unbindEventsPC();
			 me._bindEventsMobile();
			 }
			 me._layoutMobile();
			 // 창크기가 768 이하일 경우 모바일 화면
			 break;
			 }
			 }
			 });
			 changemediasizeCallback();
			 */

			$win.on('changemediasize.' + me.cid + ' resizeend.' + me.cid, changemediasizeCallback = function (e) {
				var data = scui.ui.mediaInfo;
				me.winWidth = $win.width();
				me.$cardSummary.is(':visible') && me.$cardSummary.css('height', '');
				me.$cardDetail.is(':visible') && me.$cardDetail.css('height', '');
			});
			changemediasizeCallback();

			// 카드 디테일에 대한 이벤트 바인딩
			me.$cardDetail.on('click.' + me.cid, '.close', function (e) {
				// 카드 디테일 닫기 버튼 - 닫은후 현재 위치의 카드 넘버에 포커스 이동
				e.preventDefault();

				me.$cardSummaryUl.fadeIn(me.options.slideTime);
				me.$cardSummaryDiv.scrollLeft(me.winWidth * me.oldIndex);
				me.$cardSummary.find('li').eq(me.oldIndex).find('a').focus();

				me.$cardSummary.show().css('height', 0).animate({
					'height' : core.isMobileMode() ? '120px' : '220px'
				}, me.options.slideTime, function () {
					me._layoutMobileButton();
					me.oldIndex = '';
				});

				me.$cardDetail.show().animate({
					'height' : '0'
				}, me.options.slideTime, function () {
					me.$cardDetail.hide();
				});
			}).on('click.' + me.cid, '.prev, .next', function (e) {
				// 이전 다음 버튼 클릭시
				e.preventDefault();
				var isNext = $(this).hasClass('next'),
					newIndex;

				if (isNext) {
					newIndex = (me.detailIndex === me.cardDetailMax) ? 0 : me.detailIndex + 1;
				} else {
					newIndex = (me.detailIndex === 0) ? me.cardDetailMax : me.detailIndex - 1;
				}
				me._moveNumberCardDetail(isNext, !isNext, newIndex );
			}).on('click.' + me.cid, '.indi_wrap > button', function (e) {
				// 인디게이터 버튼 클릭시
				e.preventDefault();
				var newIndex = $(this).index();
				me._moveNumberCardDetail(me.detailIndex < newIndex, me.detailIndex > newIndex, newIndex );
			}).swipeGesture().on('swipegestureleft swipegestureright', function (e) {
				var isNext, newIndex;
				if (e.type === 'swipegestureleft') {
					isNext = true;
					newIndex = (me.detailIndex === me.cardDetailMax) ? 0 : me.detailIndex + 1;
				} else {
					isNext = false;
					newIndex = (me.detailIndex === 0) ? me.cardDetailMax : me.detailIndex - 1;
				}
				me._moveNumberCardDetail(isNext, !isNext, newIndex );
			});
		},

		/**
		 *
		 * @private
		 */
		_bindEventsPC: function () {
			var me = this;
			me.isPcEventBind = true;

			// 카드 서머리에 대한 이벤트 바인딩 - li 각각에 대하여 마우스 오버에 대한 이벤트를 ul 자체에 마우스 아웃에 대한 이벤트를 지정.
			me.$cardSummaryUl.on('mouseenter.' + me.cid + ' focusin.' + me.cid, 'li', function (e) {
				if (!core.isMobileMode()) {
					// li 마우스 오버시 동작
					var $that = $(this);
					clearTimeout(me.numberCardTimer);
					me.numberCardTimer = setTimeout(function () {
						me.isAnimate = true;
						$that.parent().removeClass('no1 no2 no3 no4 no5 no6 no7').addClass('on').addClass($that.attr('class'));
						$that.stop(true, true).animate({
							'width': me.options.maxWidth
						}, me.options.slideTime).siblings().stop(true, true).animate({
							'width': me.options.minWidth
						}, me.options.slideTime);
					}, me.options.timerTime);
				}
			}).on('mouseleave.' + me.cid + ' focusout.' + me.cid, function (e) {
				if (!core.isMobileMode()) {
					// ul에서 마우스 아웃시 동작
					e.preventDefault();
					clearTimeout(me.numberCardTimer);
					me.isAnimate && $(this).removeClass('on no1 no2 no3 no4 no5 no6 no7').find('li').stop(true, true).animate({
						'width': me.options.normalWidth
					}, me.options.slideTime, function () {
						me.isAnimate = false;
					});
				}
			}).on('click.' + me.cid, 'a', function (e) {
				// 카드 클릭시 컨텐츠 교체 - 카드 디테일 SHOW후에 닫기 버튼으로 포커스 이동
				e.preventDefault();
				me.oldIndex = me.detailIndex = $(this).closest('li').index();

				me._setIndigator(me.detailIndex);
				me.$cardSummaryUl.fadeOut(me.options.slideTime);

				me.$cardSummary.show().css('height', core.isMobileMode() ? '120px' : '220px').animate({
					'height' : '0'
				}, me.options.slideTime,function () {
					me.$cardSummary.hide();
				});

				me.$cardDetail.show().animate({
					'height' : core.isMobileMode() ? '300px' : '377px'
				}, me.options.slideTime, function () {
					$(this).find('.close').focus();
				}).find('li').hide().css('left', '100%').eq(me.detailIndex).show().css('left', '0%');
			});
		},

		/**
		 *
		 * @private
		 */
		_unbindEventsPC: function () {
			var me = this;
			me.isPcEventBind = '';
			me.$cardSummary.off();
			me.$cardSummaryUl.off();
		},

		/**
		 *
		 * @private
		 */
		_bindEventsMobile: function () {
			var me = this;
			me.isPcEventBind = false;

			// 카드 서머리에 대한 이벤트 바인딩 - li 각각에 대하여 마우스 오버에 대한 이벤트를 ul 자체에 마우스 아웃에 대한 이벤트를 지정.
			me.$cardSummary.on('click.' + me.cid, '.prev, .next', function (e) {
				// 모바일 - 카드 서머리 좌우 이동버튼 클릭시
				e.preventDefault();
				!me.isAnimate && me._moveNumberCardSummary($(this).hasClass('next'));
			}).on('click.' + me.cid, 'ul > li> a', function (e) {
				// 카드 클릭시 컨텐츠 교체 - 카드 디테일 SHOW후에 닫기 버튼으로 포커스 이동
				e.preventDefault();
				me.oldIndex = me.summaryIndex = $(this).closest('li').index();

				me._setIndigator(me.summaryIndex);
				me.$cardSummaryUl.fadeOut(me.options.slideTime);
				me.$cardSummary.css('height', core.isMobileMode() ? '120px' : '220px').animate({
					'height' : '0'
				}, me.options.slideTime);
				me.$cardDetail.animate({
					'height' : core.isMobileMode() ? '300px' : '377px'
				}, me.options.slideTime, function () {
					$(this).find('.close').focus();
				}).find('li').css('left', '100%').eq(me.summaryIndex).css('left', '0%');
				me._layoutMobileButton();
			}).swipeGesture().on('swipegestureleft swipegestureright', function (e) {
				var isNext;
				if (e.type === 'swipegestureleft') {
					isNext = true;
				} else {
					isNext = false;
				}
				!me.isAnimate && me._moveNumberCardSummary(isNext);
				me._layoutMobileButton();
			});


		},

		/**
		 *
		 * @private
		 */
		_unbindEventsMobile: function () {
			var me = this;
			me.isPcEventBind = '';
			me.$cardSummary.off();
			me.$cardSummaryUl.off();
		},

		/**
		 *
		 * @private
		 */
		_layoutPC: function () {
			var me = this;

			me.$cardSummaryUl.css('width', '').removeClass('on no1 no2 no3 no4 no5 no6 no7');
			me.$cardSummaryLi.css('width', '');
			//me.$cardDetail.css({'height' : '377px'});
		},

		/**
		 *
		 * @private
		 */
		_layoutMobile: function () {
			var me = this,
				top;

			me.maxWidth = Math.ceil(me.winWidth * 7);
			me.$cardSummaryUl.css({'width':  me.maxWidth}).addClass('on no1 no2 no3 no4 no5 no6 no7');
			me.$cardSummaryLi.css('width', me.winWidth);
			//me.$cardDetail.css({'height' : '300px'});

			me._layoutMobileButton();
		},

		/**
		 *
		 * @private
		 */
		_layoutMobileButton: function (isClick) {
			var me = this,
				left = me.$cardSummaryDiv.scrollLeft(),
				top;

			// 좌우 버튼 위치 설정
			top = Math.ceil((me.$cardSummaryLi.outerHeight() - me.$cardSummary.find('.btns > button.prev').height()) / 2);
			me.$cardSummary.find('.btns > button').css({'top':  top});

			// 좌우 버튼 disabled 설정
			me.$cardSummary.find('.btns > button.prev').removeClass('disable').prop('disabled', false);
			me.$cardSummary.find('.btns > button.next').removeClass('disable').prop('disabled', false);

			if (left === 0) {
				me.$cardSummary.find('.btns > button.prev').addClass('disable').prop('disabled', true);
				isClick && me.$cardSummary.find('.btns > button.next').focus();
			}
			if (left + me.winWidth >= me.maxWidth) {
				me.$cardSummary.find('.btns > button.next').addClass('disable').prop('disabled', true);
				isClick && me.$cardSummary.find('.btns > button.prev').focus();
			}
		},

		/**
		 *
		 * @private
		 */
		_setIndigator : function (idx) {
			var me = this;
			me.$indi.removeClass('on').eq(idx).addClass('on');
		},

		/**
		 *
		 * @private
		 */
		_moveNumberCardDetail : function (isNext, isPrev, newIndex) {
			var me = this;

			if (isNext) {
				me._setIndigator(newIndex);
				me.$cardDetail.find('li').show().eq(me.detailIndex).css('left', '0%').animate({
					'left' : '-100%'
				}, me.options.slideTime).end().eq(newIndex).css('left', '100%').animate({
					'left' : '0%'
				}, me.options.slideTime, function () {
					me.$cardDetail.find('li').hide().eq(newIndex).show();
					me.detailIndex = newIndex;
				});
			} else if (isPrev) {
				me._setIndigator(newIndex);
				me.$cardDetail.find('li').show().eq(me.detailIndex).css('left', '0%').animate({
					'left' : '100%'
				}, me.options.slideTime).end().eq(newIndex).css('left', '-100%').animate({
					'left' : '0%'
				}, me.options.slideTime, function () {
					me.$cardDetail.find('li').hide().eq(newIndex).show();
					me.detailIndex = newIndex;
				});
			}
		},

		/**
		 *
		 * @private
		 */
		_moveNumberCardSummary : function (isNext) {
			var me = this,
				left = me.$cardSummaryDiv.scrollLeft();

			me.isAnimate = true;
			if (isNext) {
				me.$cardSummaryDiv.animate({
					'scrollLeft' : left + me.winWidth
				}, me.options.slideTime, function () {
					me._layoutMobileButton(true);
					me.isAnimate = false;
				})
			} else {
				me.$cardSummaryDiv.animate({
					'scrollLeft' : left - me.winWidth
				}, me.options.slideTime, function () {
					me._layoutMobileButton(true);
					me.isAnimate = false;
				})
			}
		},

		/**
		 * 해제
		 */
		release: function () {
			var me = this;

			$win.off('.' + me.cid);
			me.$cardSummaryUl.off();
			me.$cardDetail.off();
			me.stop();
			me.supr();
		}
	});
})(jQuery, window[LIB_NAME]);

/**
 * @module scui.ui.TimeLine
 * @authror: 강태진
 * @email: comahead@vinylc.com
 * @created: 2016-01-16
 * @description: 개인 > 메인 - 타임라인에서 사용
 */
(function ($, core, undefined) {
	"use strict";

	var $win = $(window),
		$doc = $(document),
		isMobile = core.isMobileMode();

	//
	var TimeLine = core.ui('TimeLine', {
		bindjQuery: 'timeLine',
		defaults: {
			timerTime : 5000
		},
		selectors: {
			timelineItem : '.ui_timeline_item',
			itemTop : '.cd_top',
			itemBottom : '.cd_bottom',
			slideSlideButton : '.ui_slide_button',
			slideAutoButton : '.ui_slide_stop_button',
			slidePrev : '.ui_timeline_prev',
			slideNext : '.ui_timeline_next'
		},
		/**
		 *
		 * @param el
		 * @param options
		 */
		initialize: function (el, options) {
			var me = this;

			if (me.supr(el, options) === false) { return; }

			me.timer;
			me.$el.find('> button').css('zIndex', 0);
			me.$itemTop.addClass('activeitem').css('zIndex', 1);

			me.$slideSlideButton.hide();
			me.$slideAutoButton.hide();
			me.$slidePrev.hide();
			me.$slideNext.hide();

			me.isAnimate = true;
			me.isSlideStop = false;
			me.mouseEnter = false;

			me._bindEvents();
			me._setTimer();
			me._setButton(0);
		},

		/**
		 *
		 * @private
		 * @description
		 */
		_bindEvents: function () {
			var me = this,
				mediasizeCallback;

			// 윈도우에 이벤트 바인드
			$win.on('changemediasize.' + me.cid, mediasizeCallback = function (e) {
				var data = core.ui.mediaInfo;

				if(core.isMobileMode()) {
					me.isMobile = true;
					me.isSlideStop = true;
					me.$slideAutoButton.removeClass('play').addClass('stop').find('span.hide').html('애니메이션 멈추기');
					me._setPosition();
					me._setTimer();
					me._setButton(3);
				} else {
					switch(data.mode){
						case 'wide': // > 1280
						case 'w1280':
						case 'w1024':
							me._setPosition();
							me.isMobile = false;
							break;
						case 'w768':
						case 'w376':
							// 창크기가 768 이하일 경우 모바일 화면 (PC에서 모바일 사이즈로 줄인 경우)
							me.isMobile = true;
							me.isSlideStop = false;
							me.$slideAutoButton.removeClass('play').addClass('stop').find('span.hide').html('애니메이션 멈추기');
							me._setPosition();
							me._setTimer();
							me._setButton(3);
							break;
					}
				}
			});
			mediasizeCallback();

			me.$el.on('mouseenter.' + me.cid + ' mouseleave.' + me.cid, function (e) {
				if (e.type === 'mouseenter') {
					me.mouseEnter = true;
					me._clearTimer();
					me._setButton(3);
				} else {
					me.mouseEnter = false;
					me._setTimer();
					me._setButton(0);
				}
			});

			me.$slidePrev.on('click.' + me.cid, function (e) {
				e.preventDefault();
				me.isAnimate && me._slideUp();
			});

			me.$slideNext.on('click.' + me.cid, function (e) {
				e.preventDefault();
				me.isAnimate && me._slideUp();
			});

			me.$slideSlideButton.on('click.' + me.cid, function (e) {
				e.preventDefault();
				me.isAnimate && me._slideUp(300);
			}).on('focusin.' + me.cid + ' focusout.' + me.cid, function (e) {
				if (e.type === 'focusin') {
					$(this).css('zIndex', '3');
				} else {
					!me.mouseEnter && $(this).css('zIndex', '0');
				}
			});

			me.$slideAutoButton.on('click.' + me.cid, function (e) {
				e.preventDefault();
				if ($(this).hasClass('stop')) {
					me.isSlideStop = true;
					$(this).removeClass('stop').addClass('play').find('span.hide').html('애니메이션 시작하기');
				} else {
					me.isSlideStop = false;
					$(this).removeClass('play').addClass('stop').find('span.hide').html('애니메이션 멈추기');
				}
			}).on('focusin.' + me.cid + ' focusout.' + me.cid, function (e) {
				if (e.type === 'focusin') {
					$(this).css('zIndex', '3');
				} else {
					!me.mouseEnter && $(this).css('zIndex', '0');
				}
			});
		},

		_setPosition : function (zindex) {
			var me = this,
				isTop = me.$itemTop.hasClass('activeitem');

			if (isTop) {
				me.$itemTop.stop(true, true).css({top: 0, 'zIndex' : 1});
				me.$itemBottom.stop(true, true).css({top: me.$timelineItem.height(), 'zIndex' : 2});
			} else {
				me.$itemTop.stop(true, true).css({top: me.$timelineItem.height(), 'zIndex' : 2});
				me.$itemBottom.stop(true, true).css({top: 0, 'zIndex' : 1});
			}
		},

		_setButton : function (zindex) {
			var me = this;

			if (core.isMobileMode()) {
				me.$slideSlideButton.hide();
				me.$slideAutoButton.hide();
				me.$slidePrev.show();
				me.$slideNext.show();
			} else {
				me.$slideSlideButton.css('zIndex', zindex).toggle(zindex > 0);
				me.$slideAutoButton.css('zIndex', zindex).toggle(zindex > 0);
				me.$slidePrev.hide();
				me.$slideNext.hide();
			}
		},

		_slideUp : function (time) {
			var me = this,
				isTop = me.$itemTop.hasClass('activeitem'),
				setTime = (time > 0 ) ? time : 700,
				$main, $slide;

			me.isAnimate = false;

			if (isTop) {
				$main = me.$itemTop;
				$slide = me.$itemBottom;
			} else {
				$main = me.$itemBottom;
				$slide = me.$itemTop;

			}

			$.each($slide, function (index, el) {
				setTimeout(function () {
					$(el).css({top: me.$timelineItem.height(), 'zIndex' : 2}).animate({
						'top' : '0px'
					}, setTime, function () {
						if (index === $slide.size() - 1) me.isAnimate = true;
						$(this).css({'zIndex' : 1}).addClass('activeitem');
						$main.eq(index).css({top: me.$timelineItem.height(), 'zIndex' : 2}).removeClass('activeitem');
					});
				}, index * (setTime + 100));
			});
		},

		_setTimer : function () {
			var me = this;

			me._clearTimer();
			if (!me.isSlideStop) {
				me.timer = setTimeout(function () {
					me._slideUp();
					me._setTimer();
				}, me.options.timerTime);
			}
		},

		_clearTimer : function () {
			var me = this;

			clearTimeout(me.timer);
			me.timer = null;
		},

		/**
		 * 해제
		 */
		release: function () {
			var me = this;

			$win.off('.' + me.cid);
			//me.$cardSummaryUl.off();
			//me.$cardDetail.off();
			me.stop();
			me.supr();
		}
	});

})(jQuery, window[LIB_NAME]);

/**
 * @module scui.ui.AfterLoginService
 * @authror: 강태진
 * @email: comahead@vinylc.com
 * @created: 2016-01-16
 * @description: 개인 > 메인 - 숫자카드에서 사용
 */
(function ($, core, undefined) {
	"use strict";

	var $win = $(window),
		$doc = $(document),
		isMobile = core.isMobileMode();

	var AfterLoginService = core.ui('AfterLoginService', {
		bindjQuery: 'afterLoginService',
		defaults: {
		},
		selectors: {
			content: '.ui_after_login_content',
			prev: '.ui_after_login_prev',  	// 숫자 카드 초기 서머리 영역
			next: '.ui_after_login_next'		// 숫자 카드 디데일 영역
		},
		/**
		 *
		 * @param el
		 * @param options
		 */
		initialize: function (el, options) {
			var me = this;

			if (me.supr(el, options) === false) { return; }

			me.contentWidth = me.$content.width();
			me.isAnimate = true;

			me._bindEvents();
		},

		/**
		 *
		 * @private
		 * @description PC/Mobile 공통 이벤트
		 */
		_bindEvents: function () {
			var me = this;

			me.$el.on('click.' + me.cid, '.prev, .next', function (e) {
				// 이전 다음 버튼 클릭시
				e.preventDefault();
				var isNext = $(this).hasClass('next');
				me._moveService(isNext);
			});

			$win.on('changemediasize.'  + me.cid + ' resizeend.' + me.cid, me.fnc = function (e, data) {
				me.$content.find('> ul').css('width', me.$content.find('> ul > li').width() * me.$content.find('> ul > li').size());
			});
			me.fnc();
			me.maxWidth = me.$content.find('> ul').width();
		},

		/**
		 *
		 * @private
		 */
		_moveService : function (isNext) {
			var me = this,
				left = me.$content.scrollLeft();

			me.isAnimate = false;
			if (isNext) {
				me.$content.animate({
					'scrollLeft' : left + me.contentWidth
				}, 600, function () {
					me._setButton();
					me.isAnimate = true;
				})
			} else {
				me.$content.animate({
					'scrollLeft' : left - me.contentWidth
				}, 600, function () {
					me._setButton();
					me.isAnimate = true;
				})
			}
		},

		_setButton : function () {
			var me = this,
				left = me.$content.scrollLeft();

			// 좌우 버튼 disabled 설정
			me.$prev.removeClass('disable').prop('disabled', false);
			me.$next.removeClass('disable').prop('disabled', false);

			if (left === 0) {
				me.$prev.addClass('disable').prop('disabled', true);
				me.$next.focus();
			}
			if (left + me.contentWidth >= me.maxWidth) {
				me.$next.addClass('disable').prop('disabled', true);
				me.$prev.focus();
			}
		}
	});
})(jQuery, window[LIB_NAME]);
