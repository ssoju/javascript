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
					me.position[0]['width'] = 125;
					me.position[0]['height'] = 51;

					me.position[1]['left'] = 30;
					me.position[1]['width'] = 175;
					me.position[1]['height'] = 67;

					me.position[2]['left'] = 111;
					me.position[2]['width'] = 125;
					me.position[2]['height'] = 51;

					me.position[3]['firstLeft'] = -70;
					me.position[3]['lastLeft'] = 181;
					me.position[3]['width'] = 88;
					me.position[3]['height'] = 36;

					me.cdImageHeight = 67;
					$('.ui_normal_info').css({'position': 'absolute', 'top': 0});
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

					me.cdImageHeight = 132;
					$('.ui_normal_info').css({'position': '', 'top': ''});
				}

				me.$cardPlate.eq(0).css({'left': me.position[0]['left'], 'width': me.position[0]['width'], 'height': me.position[0]['height'], 'zIndex': 2})
					.end().eq(1).css({'left': me.position[1]['left'], 'width': me.position[1]['width'], 'height': me.position[1]['height'], 'zIndex': 5})
					.end().eq(2).css({'left': me.position[2]['left'], 'width': me.position[2]['width'], 'height': me.position[2]['height'], 'zIndex': 2})
					.end().eq(3).css({'left': me.position[3]['lastLeft'], 'width': me.position[3]['width'], 'height': me.position[3]['height'], 'zIndex': 1}).parent().css('height', me.cdImageHeight);
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
			maxWidth : '20%', // 160425 숫자카드 수정
			minWidth : '12%', // 160525 수정
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
			me.setCardNumber = 0;

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
			me._setTimer();

			$win.on('changemediasize.' + me.cid + ' resizeend.' + me.cid, changemediasizeCallback = function (e) {
				var data = scui.ui.mediaInfo;
				me.winWidth = $win.width();
				me.$cardSummary.is(':visible') && me.$cardSummary.css('height', '');
				//160404 수정
				me.$cardDetail.is(':visible') && me.$cardDetail.css('height', core.isMobileMode() ? '' : '417px');
				//160404 수정 끝
				//160404 추가
				if(!core.isMobileMode()){
					me.$cardDetailLi.css('height', '416px');	
				}
				//160404 추가 끝
			});
			changemediasizeCallback();

			// 카드 디테일에 대한 이벤트 바인딩
			me.$cardDetail.on('click.' + me.cid, '.close', function (e) {
				// 카드 디테일 닫기 버튼 - 닫은후 현재 위치의 카드 넘버에 포커스 이동
				e.preventDefault();
				me._setTimer();
				
				// 160404 추가
				$('#V_Banner').css({overflow:'hidden'});
				$('#V_Banner').children().show();
				// 160404 추가 끝

				me.$cardSummaryUl.fadeIn(me.options.slideTime);
				me.$cardSummaryDiv.scrollLeft(me.winWidth * me.oldIndex);
				me.$cardSummary.find('li').eq(me.oldIndex).find('a').focus();

				me.$cardSummary.show().css('height', 0).animate({
					'height' : core.isMobileMode() ? '79px' : '231px' /* 160330  수정 */
				}, me.options.slideTime, function () {
					me._layoutMobileButton();
					me.oldIndex = '';
				});

				me.$cardDetail.show().animate({
					'height' : '0'
				}, me.options.slideTime, function () {
					me.$cardDetail.hide();
				});

				//160404 추가
				if(!core.isMobileMode()){
					$('#new_num_wrap').stop().animate({
						'height': '257px'
					}, me.options.slideTime);
				}
				//160404 추가 끝
				
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

						// 160525 수정
						if($that.hasClass('no1')){
							me.$cardSummaryUl.parent().css({'left':0});	
						}else{
							me.$cardSummaryUl.parent().css('left', '-60px');
						}
						// 160525 수정

						// 160510 수정
						if($that.hasClass('no1') || $that.hasClass('no7')){
							$that.parent().removeClass('no1 no2 no3 no4 no5 no6 no7').addClass('on').addClass($that.attr('class'));
								$that.stop(true, true).animate({
									'width': me.options.maxWidth
								}, me.options.slideTime).siblings().stop(true, true).animate({
									'width': me.options.minWidth
									,'marginLeft' : 0
								}, me.options.slideTime);
						}else{
							$that.parent().removeClass('no1 no2 no3 no4 no5 no6 no7').addClass('on').addClass($that.attr('class'));
							$that.stop(true, true).animate({
								'width': me.options.maxWidth
							}, me.options.slideTime).siblings().stop(true, true).animate({
								'width': me.options.minWidth
								,'marginLeft' : '10px'
							}, me.options.slideTime);
						}
						// 160510 수정 끝
						

					}, me.options.timerTime);
				}

			}).on('mouseleave.' + me.cid + ' focusout.' + me.cid, function (e) {
				if (!core.isMobileMode()) {
					// ul에서 마우스 아웃시 동작
					e.preventDefault();
					
					me.$cardSummaryUl.parent().css('left', '-60px'); // 160525 수정
					
					clearTimeout(me.numberCardTimer);
					me.isAnimate && $(this).removeClass('on no1 no2 no3 no4 no5 no6 no7').find('li').stop(true, true).animate({
						'width': me.options.normalWidth
						,'marginLeft': 0 // 160510 추가
					}, me.options.slideTime, function () {
						me.isAnimate = false;
					});
				}
				// 160510 삭제 */
				// 160516 추가 */
			}).on('click.' + me.cid, 'a', function (e) {

				if(!core.isMobileMode()) return;

				// 카드 클릭시 컨텐츠 교체 - 카드 디테일 SHOW후에 닫기 버튼으로 포커스 이동
				e.preventDefault();
				clearTimeout(me.timer);
				
				//160404 추가
				if(window.v_banner_interval) clearInterval(window.v_banner_interval);
			
				$('#V_Banner').css({overflow:'visible'});
				$('#V_Banner').children().hide().eq(1).show();
				//160404 추가 끝

				me.oldIndex = me.detailIndex = $(this).closest('li').index();

				me._setIndigator(me.detailIndex);
				me.$cardSummaryUl.fadeOut(me.options.slideTime);

				me.$cardSummary.show().css('height', core.isMobileMode() ? '79px' : '231px').animate({
					'height' : '0'
				}, me.options.slideTime,function () {
					me.$cardSummary.hide();
				});

				//160404 추가
				$('#new_num_wrap').stop().animate({
					'height': '417px'
				}, me.options.slideTime);
				//160404 추가 끝

				me.$cardDetail.show().animate({
					'height' : core.isMobileMode() ? '300px' : '417px' //160404 수정
				}, me.options.slideTime, function () {
					$(this).find('.close').focus();

					var bottom = me.$cardDetail.offset().top + (core.isMobileMode() ? 300 : 417),
						scrollTop = $(window).scrollTop() + $(window).height();

					// 160211_수정
					if (bottom > scrollTop) {
						$('html, body').animate({
							scrollTop: $(window).scrollTop() + (bottom - scrollTop)
						}, 200);
					}
				}).find('li').hide().css('left', '100%').eq(me.detailIndex).show().css('left', '0%');
			});
			// 160516 추가 끝*/
			// 160510 삭제 */
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
			me.setCardNumber = 0;

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
				me.$cardSummary.css('height', core.isMobileMode() ? '79px' : '231px').animate({ /* 160330  수정 */
					'height' : '0'
				}, me.options.slideTime);
				me.$cardDetail.animate({
					'height' : core.isMobileMode() ? '300px' : '417px' //160404 수정
				}, me.options.slideTime, function () {
					$(this).find('.close').focus();
				}).find('li').css('left','100%').eq(me.summaryIndex).css('left', '0%');
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

		_setTimer: function () {
			var me = this;
			if(core.isMobileMode()) {
				me.timer = setTimeout(function () {
					me.setCardNumber = (me.setCardNumber + 1 > 6) ? 0 : me.setCardNumber + 1;
					me.$cardSummaryLi.eq(me.setCardNumber).addClass('over').siblings().removeClass('over');
					me._setTimer();
				}, 2000);
			}
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


/**
 * @module scui.ui.MainServiceContent
 * @authror: 강태진
 * @email: comahead@vinylc.com
 * @created: 2016-03-11
 * @description: 개인 > 메인 - 상단 서비스 안내에서 사용
 */
(function ($, core, undefined) {
	"use strict";

	var $win = $(window),
		$doc = $(document),
		isMobile = core.isMobileMode();

	var MainServiceContent = core.ui('MainServiceContent', {
		bindjQuery: 'mainServiceContent',
		defaults: {
			contentWidth : 166,
			contentTotal : 712
		},
		selectors: {
			serviceSummary : '.ui_service_summary',
			serviceContent : '.ui_service_summary > div',
			serviceDetail : '.ui_service_detail',
			service : '.ui_service'
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
			me.index = '';

			me._bindEvents();
		},

		/**
		 *
		 * @private
		 * @description PC/Mobile 공통 이벤트
		 */
		_bindEvents: function () {
			var me = this;

			// 서비스 Summary 클릭시 동작
			me.$serviceSummary.on('click', function (e) {
				e.preventDefault();
				if (me.isAnimate) {
					me.isAnimate = false;
					me.index = me.$serviceSummary.index($(this));
					me.$serviceContent.eq(me.index).addClass('box_rotate_on').css('backgroundColor', '#fafafa');	// 로테이션용 css 클래스 호출 및 마우스오버 컬러 제거

					// css3 에니메이션 종료후 해당 컨텐츠 hide하여 blank 화면 보여줌
					setTimeout(function () {
						me.$serviceContent.eq(me.index).find('.sub_conts').hide();
					}, 200);

					// css3 에니메이션 종료 후 0.3초 후에 자세한 내용 컨텐츠 보여주기
					setTimeout(function () {
						// 컨텐츠 내용 감춰 놓기
						me.$serviceDetail.eq(me.index).find('> div').fadeOut(0);
						// 크기 설정 및 0.5후에 크기 키우기
						me.$serviceDetail.eq(me.index).css({'left' : (me.options.contentWidth * me.index) + (16 * me.index) + 8, 'width' : me.options.contentWidth, 'display' : 'block'}).animate({
							left : 8,
							width : me.options.contentTotal
						}, 200, function () {
							me.$service.addClass('no_shadow');
							me.$serviceSummary.hide();	// 서머리 내용 감주기(탭이동시 포커스 안가도록)
							me.$serviceDetail.eq(me.index).focus();
							me.isAnimate = true;
						});
						// 컨텐츠 내용 0.5초 후에 fadeIn
						me.$serviceDetail.eq(me.index).find('> div').fadeIn(200);
					}, 400);
				}
			});

			// 서비스 Detail 화면 닫기 버튼 클릭시 동작
			me.$serviceDetail.on('click', '.btn_det_close', function (e) {
				e.preventDefault();
				if (me.isAnimate) {
					me.isAnimate = false;
					me.$serviceSummary.show(); // 감춰둔 서머리 내용 보여주기
					me.$serviceContent.css('backgroundColor', ''); // 컬러값 복구
					// 작은 크기 및 위치로 에니메이션
					me.$serviceDetail.eq(me.index).animate({
						left: (me.options.contentWidth * me.index) + (16 * me.index) + 8,
						width: me.options.contentWidth
					}, 200, function () {
						me.$service.removeClass('no_shadow');
						me.$serviceDetail.eq(me.index).addClass('box_rotate_on');
						me.$serviceContent.eq(me.index).show().removeClass('box_rotate_on');
						// 디테일 내용 사이즈 변경 후 0.3초 이후에 서머리 내용 보여주고 디테일 내용 감춘다.
						setTimeout(function () {
							me.$serviceContent.eq(me.index).find('.sub_conts').show();
							me.$serviceDetail.eq(me.index).hide().delay(200).removeClass('box_rotate_on');
							me.$serviceContent.eq(me.index).focus();
							me.isAnimate = true;
						}, 300);
					});
					// 에니메이션 동안 디테일 내용 fadeOut
					me.$serviceDetail.eq(me.index).find('> div').fadeOut(200);
				}
			});
		}
	});
})(jQuery, window[LIB_NAME]);


/* 160525 추가 */
(function ($, core, undefined) {
	"use strict";

	var $win = $(window),
		$doc = $(document),
		isMobile = core.isMobileMode();

	/**
	 * @module scui.ui.MainCardVSlider
	 * @authror: 이성진
	 * @email: 
	 * @created: 2016-05-24
	 * @description: 개인 > 메인 
	 */
	var MainCardVSlider = core.ui('MainCardVSlider', {
		bindjQuery: 'mainCardVSlider',
		defaults: {
			contentHeight : 265,
			contentTotal : 3,
			duration : 800,       	// 160531 수정
			easing : 'easeOutCirc', // 160531 수정
			autoRolling:true
		},
		selectors: {
			bannerWrap : '#V_Banner',
			bannerList : '#V_Banner > div',
			tabs : '#_tabs > li',
			tabsBtn : '#_tabs > li > a',
			skypass : '.icon_skypass_card' // 160531 추가
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
			me.currentIdx = 0;
			me.timer = null;

			me._bindEvents();
			//me._skyPass(); 
		},

		/**
		 *
		 * @private
		 * @description PC 이벤트
		 */
		_bindEvents: function () {
			var me = this;

			// 추천, 숫자, 프리미엄카드 클릭 이벤트 바인딩
			me.$tabsBtn.on('click', function (e) {
				e.preventDefault();

				if (me.isAnimate) {
					me.isAnimate = false;
					me.idx = $(this).parent().index();

					if(me.currentIdx != me.idx){
						me._slideUp();
					}else{
						me.isAnimate = true;
					}

					if(me.options.autoRolling){
						clearTimeout(me.timer);
						me._setTimer();
					}
				}
			});

			// 롤링타이머 설정
			if(me.options.autoRolling){
				me._setTimer();

				// 카드에 마우스 오버 시 롤링 긐지
				me.$bannerWrap.hover(function(){
					clearTimeout(me.timer);
				}, function(){
					me._setTimer();
				});
			}
		},

		_slideUp: function(){
			var me = this;

			me.$tabs.removeClass('on').eq(me.idx).addClass('on');

			me.$bannerList.eq(me.currentIdx).animate({'top': '-100%'}, {'duration': me.options.duration, 'easing': me.options.easing, complete:function () {
					$(this).css({top: '100%'});
			}}).end().eq(me.idx).animate({'top': 0}, {'duration': me.options.duration, 'easing': me.options.easing, complete:function () {
					me.currentIdx = me.idx;

					/* 160531 추가 */
					/*
					if(me.currentIdx == 0) me._skyPass();
					else me._resetSkyPass();
					*/
					/* //160531 추가 */ 

					me.isAnimate = true;
			}});
		},

		_setTimer: function(){
			var me = this;
			
			me.timer = setTimeout(function(){
				if (me.isAnimate) {
					me.isAnimate = false;
					me.idx = (me.currentIdx == me.options.contentTotal -1)? 0: me.currentIdx+1;
					me._slideUp();
					me._setTimer();
				}
			}, 5000);
			
		}, //160531 수정 ','

		/* 160531 추가 */
		_skyPass: function(){
			var me = this;

			me.$skypass.find('.icon01 > img').animate({'width':'100%', 'height':'100%', 'margin-top':-5}, 3000);
			me.$skypass.find('.icon02').animate({'left':'-50%'}, 3000);
			me.$skypass.find('.icon03').animate({'right':'-50%'}, 3000);
		},

		_resetSkyPass: function(){
			var me = this;
			me.$skypass.find('.icon01 > img').stop(true, true).css({'width': '20%', 'height': '20%', 'margin-top':'25px'});
			me.$skypass.find('.icon02').stop(true, true).css({'left': 0}).end().find('.icon03').stop(true, true).css({'right':0});
		}
		/* //160531 추가 */
	});


	/**
	 * @module scui.ui.MainCardFlip
	 * @authror: 이성진
	 * @email: 
	 * @created: 2016-05-24
	 * @description: 개인 > 메인 > 카드 플립기능 
	 */
	var MainCardFlip = core.ui('MainCardFlip', {
		bindjQuery: 'mainCardFlip',
		defaults: {
			cardHeight : 170,
			cardWidth : 198,
			openDuration : 400,
			closeDuration : 200
		},
		selectors: {
			cardPanel : '.ui_flip_panel',
			frontPanel : '.ui_flip_panel .front',
			backPanel : '.ui_flip_panel .back'
		},

		/**
		 *
		 * @param el
		 * @param options
		 */
		initialize: function (el, options) {
			var me = this;

			if (me.supr(el, options) === false) { return; }

			me.timer = null;

			me._bindEvents();
		},

		/**
		 *
		 * @private
		 * @description PC 이벤트
		 */
		_bindEvents: function () {
			var me = this;

			if(scui.css3.support3D){ //3D transform 지원할때ㅔ
				me.$backPanel.show();

				me.$cardPanel.hover(function(){
					$(this).addClass('flip');
				}, function(){
					$(this).removeClass('flip');
				});
		    }else{ // 3D transform 미지원
		    	me.$cardPanel.addClass('not_flip');
		    	me.$backPanel.show();

		    	me.$cardPanel.hover(function(){
		            $(this).find('.front').animate({'width': 0, 'left':'50%' , 'height': me.options.cardHeight}, me.options.closeDuration);
		            $(this).find('.back').animate({'width': me.options.cardWidth, 'left':0, 'height': me.options.cardHeight}, me.options.openDuration);
		        }, function(){
		            $(this).find('.back').animate({'width': 0, 'left':'50%', 'height': me.options.cardHeight}, me.options.closeDuration);
		            $(this).find('.front').animate({'width': me.options.cardWidth, 'left':0, 'height': me.options.cardHeight}, me.options.openDuration);
		        });
		    }
		}
	});
	
	/* 160614 추가 (운영:이성진) */
	/**
	 * @module scui.ui.MainFlashPlayer
	 * @authror: 이성진
	 * @email: 
	 * @created: 2016-06-14
	 * @description: 개인 > 메인 > 플래시 영상
	 */
	var MainFlashPlayer = core.ui('MainFlashPlayer', {
		bindjQuery: 'mainFlashPlayer',
		defaults: {
			cnt:3,
			easeing:'easeOutCirc'
		},
		
		selectors: {
		},

		/**
		 *
		 * @param el
		 * @param options
		 */
		initialize: function (el, options) {
			var me = this;

			if (me.supr(el, options) === false) { return; }

			me._bindVideo();
		},

		/**
		 *
		 * @private
		 * @description PC 이벤트
		 */
		_bindVideo: function () {
			var me = this;
			me.videoDir = (typeof video_dir === 'undefined'  ? '' : video_dir);
			
			me.flashNo = Math.floor((Math.random() * me.options.cnt) + 1);  
			
			switch(me.flashNo) {
				case 1 : 
					me.flashSmBtn = '84x117_benefit.swf';
					me.flashVideo = '1172x399_benefit.swf';
					break;
				case 2 : 
					me.flashSmBtn = '84x117_magic.swf'; 
					me.flashVideo = '1172x399_magic.swf'; 
					break;
				case 3 : 
					me.flashSmBtn = '84x117_festival.swf';
					me.flashVideo = '1172x399_festival.swf';
					break;
				default: 
					me.flashSmBtn = '84x117_benefit.swf';
					me.flashVideo = '1172x399_benefit.swf';
			}
			
			if(me.flashNo < 3){ // 1~2는 플래시 노출
				me.flashBtnObj ='<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" width="84" height="117" id="" align="middle">'
									+'<param name="movie" value="'+ me.videoDir +'/images/personal/swf/'+ me.flashSmBtn +'" />'
									+'<param name="wmode" value="transparent" />'
									+'<param name="quality" value="high" />'
									+'<param name="play" value="true" />'
									+'<param name="loop" value="true" />'
									+'<param name="scale" value="showall" />'
									+'<param name="menu" value="true" />'
									+'<param name="devicefont" value="false" />'
									+'<param name="salign" value="" />'
									+'<param name="allowScriptAccess" value="always" />'
									+'<object type="application/x-shockwave-flash" data="'+ me.videoDir +'/images/personal/swf/'+ me.flashSmBtn +'" width="84" height="117">'
									+'<param name="movie" value="'+ me.videoDir +'/images/personal/swf/'+ me.flashSmBtn +'" />'
									+'<param name="wmode" value="transparent" />'
									+'<param name="quality" value="high" />'
									+'<param name="play" value="true" />'
									+'<param name="loop" value="true" />'
									+'<param name="scale" value="showall" />'
									+'<param name="menu" value="true" />'
									+'<param name="devicefont" value="false" />'
									+'<param name="salign" value="" />'
									+'<param name="allowScriptAccess" value="always" />'
									+'</object>'
								+'</object>';	

				me.flashVideoObj ='<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" width="1172" height="399" id="1172x474_cs5" align="middle">'
										+'<param name="movie" value="'+me.videoDir+'/images/personal/swf/'+me.flashVideo+'" />' //160426 수정
										+'<param name="wmode" value="transparent" />'
										+'<param name="quality" value="high" />'
										+'<param name="play" value="true" />'
										+'<param name="loop" value="true" />'
										+'<param name="scale" value="showall" />'
										+'<param name="menu" value="true" />'
										+'<param name="devicefont" value="false" />'
										+'<param name="salign" value="" />'
										+'<param name="FlashVars" value="skinpath='+me.videoDir+'" />'
										+'<param name="allowScriptAccess" value="always" />'
										+'<param name="autoPlay" value="true" />'
										+'<object type="application/x-shockwave-flash" data="'+me.videoDir+'/images/personal/swf/'+me.flashVideo+'" width="1172" height="399">'//160426 수정
										+'<param name="movie" value="'+me.videoDir+'/images/personal/swf/'+me.flashVideo+'" />'//160426 수정
										+'<param name="wmode" value="transparent" />'
										+'<param name="quality" value="high" />'
										+'<param name="play" value="true" />'
										+'<param name="loop" value="true" />'
										+'<param name="scale" value="showall" />'
										+'<param name="menu" value="true" />'
										+'<param name="devicefont" value="false" />'
										+'<param name="salign" value="" />'
										+'<param name="FlashVars" value="skinpath='+me.videoDir+'" />'
										+'<param name="allowScriptAccess" value="always" />'
										+'<param name="autoPlay" value="true" />'
									+'</object>'
								+'</object>';
				
				$('#_video_open > p').hide().html(me.flashBtnObj);
				
				setTimeout(function(){
					$('#_video_open > p').show();
				}, 100);
			}else{
				$('#ui_shopping_btn').fadeIn(500);
			}
		},
		
		videoOpen: function(){
			var me = this;
			
			$('#_video_open').fadeOut(500);
			me.$el.html(me.flashVideoObj);

			setTimeout(function(){
				me.$el.slideDown(500, me.options.easeing);//show();
			//	me.options.isLocal ? null:_satellite.track('video_clicks');
			}, 100);
		},
		
		videoClose: function(){
			var me = this;
			
			me.$el.slideUp(500, me.options.easeing, function(){$(this).empty();});
			$('#_video_open').find('p').empty().html(me.flashBtnObj).end().fadeIn(500);
		},
		
		videoLink: function(){
			var me = this, lnk;
			
			switch(me.flashNo){
				case 1 : lnk = 'https://www.samsungcard.com/personal/my-benefits/UHPPBE0102D0.jsp?click=gnb_benefit_my'; break; //160518 수정
				case 2 : lnk = 'https://www.samsungcard.com/personal/event/ing/UHPPBE1403M0.jsp?cms_id=100910&click=main_videoad_hollabun'; break;
				case 3 : lnk = 'https://www.samsungcard.com/personal/card/taptap/UHPPCA0209M0.jsp?click=main_videoad_taptap'; break;
				case 4 : lnk = 'https://www.samsungcard.com/personal/card/taptap/UHPPCA0209M0.jsp?click=main_videoad_taptap'; break; // 160510추가
			}
			
			window.open(lnk);
		}
		
	});
	
	
	/**
	 * @module scui.ui.MainShoppingLayer
	 * @authror: 이성진
	 * @email: 
	 * @created: 2016-06-14
	 * @description: 개인 > 메인 > 쇼핑레이어 추가
	 */
	var MainShoppingLayer = core.ui('MainShoppingLayer', {
		bindjQuery: 'mainShoppingLayer',
		defaults: {
			layerWidth:1172,
			layerHeight:399,
			easeing:'easeInOutCirc',
			duration:500,
			aniType: 1
		},
		selectors: {
			
		},

		/**
		 *
		 * @param el
		 * @param options
		 */
		initialize: function (el, options) {
			var me = this;
			if (me.supr(el, options) === false) { return; }

			me._bind();
		},

		/**
		 *
		 * @private
		 * @description PC 이벤트
		 */
		_bind: function () {
			var me = this;
			//$('#ui_shopping_btn').fadeIn(500);
			$('#ui_shopping_btn > p').on('click', function(){
				$(this).parent().hide();
				
				if(me.options.aniType === 1){
					$('#ui_main_shopping_layer').show().stop().animate({'width':me.options.layerWidth}, me.options.duration, me.options.easeing, function(){
						$(this).animate({'height':me.options.layerHeight}, me.options.duration, me.options.easeing);
					});
				}else{
					$('#ui_main_shopping_layer').show().stop().animate({'height':me.options.layerHeight}, me.options.duration, me.options.easeing, function(){
						$(this).animate({'width':me.options.layerWidth}, me.options.duration, me.options.easeing);
					});
				}
			});
			
			$('#ui_main_shopping_close').on('click', function(e){
				e.preventDefault();
				$('#ui_shopping_btn').show();
				$('#ui_main_shopping_layer').stop().animate({'height':'10px'}, me.options.duration, me.options.easeing, function(){
					$(this).animate({'width':0}, me.options.duration, me.options.easeing, function(){$(this).hide();});
				});
			});
		}
		
	});
	/* 160614 추가 끝(운영:이성진) */
})(jQuery, window[LIB_NAME]);
/* 160525 추가 끝*/