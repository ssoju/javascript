/*!
 * @author banner.js
 * @email comahead@vinylc.com
 * @create 2015-01-08
 * @license MIT License
 */
(function ($, core, undefined) {
	"use strict";

	var $win = $(window),
		browser = core.browser,
		isMobile = browser.isMobile,
		css3 = core.css3;

	//Banner ////////////////////////////////////////////////////////////////////////////////
	/**
	 * @class
	 * @name vinyl.ui.Banner
	 * @description Scroll Left를 이용한 배너
	 * @extends vinyl.ui.View
	 */
	var Banner = core.ui('Banner', /** @lends vinyl.ui.Banner# */{
		bindjQuery: 'banner',
		$statics: /** @lends vinyl.ui.Banner */{
			ON_BANNER_CHANGED: 'bannerchange'
		},
		defaults: {
			easing: 'easeInOutQuart',
			buttonType: 'disabled', // disabled, none, always
			slideType: 'page',
			mobileType: 'multi',
			selectedIndex: 0,
			setWebWide: 3,
			setWeb1024: 3,
			setWeb1023: 2,
			setMobile: 1,
			threshold: 75,
			isAutoRolling: false,
			rollingTime: 5000,
			slideTime: 300,
			hideNextItem:false
		},
		events: {
		},
		selectors: {
			content: '.ui_banner_content',
			dim: '.ui_banner_dim',
			btnPrev: '.ui_banner_prev',
			btnNext: '.ui_banner_next',
			indi: '.ui_banner_indi',
			autoButton: '.ui_auto_rolling'
		},
		/**
		 * 생성자
		 * @param el
		 * @param options
		 */
		initialize: function(el, options) {
			var me = this;

			if(me.supr(el, options) === false) { return me.release(); }

			me.contentWidth = 0;
			me.left = 0;
			me.outerWidth = 0;
			me.isAnimation = true;
			me.leftRatio = 0;
			me.maxCount = me.$content.find('> ul > li').size();
			me.nowIndex = me.options.selectedIndex;
			me.isAuto = me.options.isAutoRolling;
			me.isRolling = me.options.isAutoRolling;
			me.timer = null;
			me.hideNextItem = me.options.hideNextItem;

			if (me.options.slideType === 'page') {
				// 160127_모바일에서도 인디게이터 클릭되도록 수정
				//if (isMobile) {
				//	me.$indi.find('>.indi').attr('tabIndex', -1);
				//} else {
				me.$indi.on('click', '>.indi', function (e) {
					e.preventDefault();
					var diff = 0;
					if (me.isAnimation && $(e.currentTarget).index() !== me.nowIndex) {
						if (me.nowIndex < $(e.currentTarget).index()) {
							diff = $(e.currentTarget).index() - me.nowIndex;
							me.setAnimate(me.contentWidth * diff, 'right'); // 김승일
						} else {
							diff = me.nowIndex - $(e.currentTarget).index();
							me.setAnimate(-(me.contentWidth * diff), 'left'); // 김승일
						}
						me.nowIndex = $(e.currentTarget).index();
						me._setIndi();
					}
				});
				//}
			} else {
				me.$indi.hide();
			}

			var mediasizeCallback;
			// 윈도우에 이벤트 바인드
			$win.on('resizeend.' + me.cid, function (e, data) {
			                    
				me.setContent();
				me._setLine('next');				
				
                
			}).on('changemediasize.' + me.cid, mediasizeCallback = function (e) {
				var data = core.ui.mediaInfo;

				me.$btnPrev.show();
				me.$btnNext.show();

				if(isMobile) {
					// 모바일일 경우 무조건 모바일 타입으로 고정
					me.count = me.options.setMobile;
					me.percent = (!me.hideNextItem && me.count === 1 && me.options.mobileType === 'multi') ? 0.8 : 1; // 김승일 me.count === 1 &&  추가
					me.$dim.show();
					me._toggleButtons(false);
				} else {
					switch(data.mode){
						case 'wide': // > 1280
							me.count = me.options.setWebWide;
							me.percent = 1;
							me.$dim.hide();
							me._toggleButtons(false);
							me._setButtonHide();
							break;
						case 'w1280':
							// 창크기가 1279 ~ 1024 사이일 경우 창크기로 고정
							me.count = me.options.setWeb1024;
							me.percent = 1;
							me.$dim.hide();
							me._toggleButtons(false);
							me._setButtonHide();
							break;
						case 'w1024':
							// 창크기가 1203 ~ 768 사이일 경우 창크기로 고정
							me.count = me.options.setWeb1023;
							me.percent = 1;
							me.$dim.hide();
							me._toggleButtons(false);
							break;
						case 'w768':
						case 'w376':
							// 창크기가 768 이하일 경우 모바일 화면 (PC에서 모바일 사이즈로 줄인 경우)
							me.count = me.options.setMobile;
							me.percent = (!me.hideNextItem && me.count === 1 && me.options.mobileType === 'multi') ? 0.8 : 1; // 김승일 me.count === 1 &&  추가
							me.$dim.show();
							me._toggleButtons(false);
							break;
					}
				}
			});
			mediasizeCallback();

			scui.util.waitImageLoad(me.$content.find('img'), true).done(function() {
				me.$content.find('ul').show();
				me.setContent();
				me._setLine('next');
			});

			// 모듈에 이벤트 바인드 - 김승일 - start
			me.$content.swipeGesture({
				swipe: function (phase, data) {
					var direction, distance;

					switch(phase) {
						case 'start':
							me.left = me.$content.scrollLeft();
							break;
						case 'move':
							direction = data.direction;
							distance = Math.abs(data.diff.x);

							if (direction === 'left' || direction === 'right') {
								me.$content.scrollLeft((direction === 'left') ? me.left + distance : me.left - distance);
							}
							
							break;
						case 'end':
						case 'cancel':
							direction = data.direction;
							distance = Math.abs(data.diff.x);
							if (direction === 'left' || direction === 'right') {
								if (me.options.threshold < distance) {
									me._setLine(direction);
								} else {
									direction = (direction === 'left') ? 'right' : 'left';
									me._setLine(direction);
								}
							} else {
								me._setLine('left');
							}
							break;
					}
				}
			});
			// 김승일 - end

			me.$btnPrev.on('click', function (e) {
				me.setAnimate(-me.contentWidth, 'left'); // 김승일
				//console.log(me.contentWidth);
			});

			me.$btnNext.on('click', function (e) {
				me.setAnimate(me.contentWidth, 'right'); // 김승일
				//console.log(me.contentWidth);
			});

			// autoRolling
			me.$autoButton.on('click', function () {
				$(this).hasClass('stop') ? $(this).replaceClass('stop', 'play').find('span.hide').html('자동 롤링 시작하기')  : $(this).replaceClass('play', 'stop').find('span.hide').html('자동 롤링 멉추기');
				me.setRolling({'isPlay': $(this).hasClass('stop')});
			});
			me._toggleButtons();
		},

		setAnimate: function (left, dir) {
			var me = this;
			if (me.isAnimation) {
				me.isAnimation = false;
				me.left = me.$content.scrollLeft();

				// 김승일 - start
				if (dir === 'left' && me.left === 0) {
					me.left = me.$content.prop('scrollWidth') - me.$content.width();
				} else if(dir === 'right' && parseInt(me.left / 10, 10) * 10 ===  parseInt((me.$content.prop('scrollWidth') - me.$content.width()) / 10, 10) * 10) {
					me.left = 0;
				} else {
					me.left = (me.left + left <= 0) ? 0 : ((me.left + left > me.outerWidth - me.contentWidth) ? me.outerWidth - me.contentWidth : me.left + left);
				}
				// 김승일 - end

				if (dir === 'left') {
					me.nowIndex = (me.nowIndex - 1 < 0) ? me.maxCount - 1 : me.nowIndex - 1;
				} else {
					me.nowIndex = (me.nowIndex + 1 > me.maxCount - 1) ? 0 : me.nowIndex + 1;
				}

				me.aniTime = me.contentWidth * 0.8;
				me.aniTime = me.aniTime < me.options.slideTime ? me.options.slideTime : me.aniTime;

				me.$content.animate({
					'scrollLeft': me.left
				}, {'duration': me.aniTime, 'easing': me.options.easing, complete: function () {
					me.isAnimation = true;
					me.leftRatio = me.$content.scrollLeft() / me.outerWidth;
					me._toggleButtons(true);
					me._setIndi();
					if (me.isAuto && me.isRolling) me.setTimer();
				}});
			}
		},

		/**
		 * 컨텐츠 정렬
		 * @param {}
		 */
		setContent: function () {
			var me = this,
				heights = [];

			if (me.count === 0) {
				me.outerWidth = 0;
				me.$content.find('> ul > li').css('width', '');
				me.$content.css({'height': '' }).find('ul').css({'width': '', 'paddingLeft': '', 'paddingRight': '', 'position': ''});
				me._toggleButtons(false);
				me.$el.css({'visibility': ''});
			} else {
				me.outerWidth = 0;
				me.itemWidth = Math.round(me.$content.width() / me.count * me.percent);		
				
				//////////////
				
				// 160610 script added
				if(me.hideNextItem){
				    				    
				    if(me.$content.width() > me.itemWidth*me.maxCount - 5){
				        				                               
                         me.$btnPrev.hide();                     
                         me.$btnNext.hide();        
                         me.$content.css({'width':'100%'});  
                         //me.$content.find('> ul').css('margin', '0px auto');          
                         me.itemWidth = Math.round(me.$content.width() / me.count * me.percent);                            
                    }
				}	
				
				//////////////
				
				me.paddingWidth = (me.percent === 1) ? 0 : Math.round(me.$content.width() / me.count * ((1 - me.percent) / 2));				
				
				// item 크기 설정
				heights = [];				
				me.$content.find('> ul > li').css('width', me.itemWidth);
				me.$content.find('> ul > li').each(function (index) {
				   
					me.outerWidth += $(this).outerWidth();
					heights.push($(this).outerHeight(true));
					
					/*$(this).find('> dl').css({'width':$(this).find('> dl').css({'display':'inline-block'}).width(), 'display':''});*/
					
				});
				me.outerHeight = core.array.max(heights);          
                me.$content.css({'height': me.outerHeight }).find('ul').css({'width': me.outerWidth, 'paddingLeft': me.paddingWidth, 'paddingRight': me.paddingWidth, 'position': 'relative'}).end().scrollLeft(me.outerWidth * me.leftRatio);

                
				me.$dim.css({'width': me.paddingWidth, 'height': me.$el.height(), 'top': 0}).eq(0).css({'left': 0, 'right': ''}).end().eq(1).css({'left': '', 'right': 0});

				if (me.options.slideType === 'page') {
					me.contentWidth = me.$content.find('li').outerWidth() * Math.floor(me.$content.width() / me.$content.find('li').outerWidth());
				} else {
					me.contentWidth = me.$content.find('li').outerWidth();
				}
                
				if (me.isAuto && me.isRolling) me.setTimer();
				me._toggleButtons(false);
				me.$el.css({'visibility': ''});
			}

		},

		/**
		 * index에 해당하는 컨텐츠를 활성화
		 * @param {number} index 탭버튼 인덱스
		 */
		_setIndi: function () {
			var me = this;

			me.$indi.find('>.indi').removeClass('on').eq(me.nowIndex).addClass('on');
		},

		/**
		 *
		 */
		_setLine: function (direction) {
			var me = this,
				setLeft, diff;

			if (me.isAnimation) {
				diff = me.$content.scrollLeft() % me.itemWidth;
				switch (direction) {
					case 'right':
						setLeft = '-=' + diff;
						break;
					case 'mid':
						setLeft = me.left;
						break;
					case 'left':
					default:
						setLeft = '+=' + (me.itemWidth - diff);
						break;
				}

				if (diff > 0) {
					me.isAnimation = false;
					me.$content.animate({
						'scrollLeft': setLeft
					}, 300, function () {
						me.isAnimation = true;
						me.leftRatio = me.$content.scrollLeft() / me.outerWidth;
						if (me.left !== me.$content.scrollLeft()) {
							if (direction === 'left') {
								me.nowIndex = (me.nowIndex + 1 > me.maxCount - 1) ? 0 : me.nowIndex + 1;
							} else {
								me.nowIndex = (me.nowIndex - 1 < 0) ? me.maxCount - 1 : me.nowIndex - 1;
							}
							me._setIndi();
						}
						me._toggleButtons();
						if (me.isAuto && me.isRolling) me.setTimer();
					});
				}
			}
		},

		_toggleButtons: function (isClick) {
			var me = this,
				scrollLeft = me.$content.prop('scrollLeft'),
				buttonType = me.options.buttonType;

			if (buttonType === 'disabled' || buttonType === 'multi') {
				me.$btnPrev.disabled(false);
				me.$btnNext.disabled(false);
				if (scrollLeft === 0) {
					me.$btnPrev.disabled(true);
					isClick && me.$btnNext.focus();
				}

				if (scrollLeft + 5 > me.$content.prop('scrollWidth') - me.$content.width()) {
					me.$btnNext.disabled(true);
					isClick && me.$btnPrev.focus();
				}
			} else if(buttonType === 'none') {
				me.$btnPrev.toggle(scrollLeft !== 0);
				me.$btnNext.toggle(scrollLeft !== me.$content.prop('scrollWidth') - me.$content.width());

				if (!me.$btnPrev.is(':visible')) {
					isClick && me.$btnNext.focus();
				}

				if (!me.$btnNext.is(':visible')) {
					isClick && me.$btnPrev.focus();
				}
			}
		},

		_setButtonHide: function () {
			var me = this;

			if (me.options.buttonType === 'multi' && me.count === me.options.setWebWide && me.options.setWebWide >=  me.maxCount) {
				me.$btnPrev.hide();
				me.$btnNext.hide();
			}
		},

		/**
		 * 이미지 롤링 시작
		 * @param {}
		 */
		setRolling: function (data) {
			var me = this;

			// 배너 이미지 센터 정렬
			me.isRolling = data.isPlay;

			if (me.isAuto && me.isRolling) {
				me.setTimer();
			} else {
				clearTimeout(me.timer);
				me.timer = null;
			}
			
		},

		setTimer: function () {
			var me = this;

			clearTimeout(me.timer);
			me.timer = null;
			me.timer = setTimeout(function () {
				if (me.isAnimation) {
					me.setAnimate(me.contentWidth, 'right'); // 김승일
				}
			}, me.options.rollingTime);
		},

		update: function () {
			var me = this;

			me.contentWidth = 0;
			me.left = 0;
			me.outerWidth = 0;
			me.isAnimation = true;
			me.leftRatio = 0;
			me.maxCount = me.$content.find('> ul > li').size();
			me.nowIndex = me.options.selectedIndex;
			me.isAuto = me.options.isAutoRolling;
			me.isRolling = me.options.isAutoRolling;
			me.timer = null;

			scui.util.waitImageLoad(me.$content.find('img'), true).done(function() {
				me.$content.find('ul').show();
				me.setContent();
				me._setLine('next');
			});
		}
	});
	///////////////////////////////////////////////////////////////////////////////////////

	if (typeof define === "function" && define.amd) {
		define([], function() {
			return Banner;
		});
	}




	//Banner ////////////////////////////////////////////////////////////////////////////////
	/**
	 * @class
	 * @name vinyl.ui.SingleBanner
	 * @description 무한롤링 배너 - 각 아이템을 Absolute로 띄우고 left로 위치를 이동하여 이동
	 * @extends vinyl.ui.View
	 */
	var SingleBanner = core.ui('SingleBanner', /** @lends vinyl.ui.SingleBanner# */{
		bindjQuery: 'singleBanner',
		$statics: /** @lends vinyl.ui.SingleBanner */{
			ON_BANNER_CHANGED: 'singleBannerchange'
		},
		defaults: {
			easing: 'easeOutQuart',  //160411 수정
			rollingTime: 5000,
			slideTime: 100, //160525 수정 
			isCss3: false,
			isAutoRolling: false,
			buttonType: 'always',	 // always(무한 롤링용), none
			buttonPosition: 'content',	// content는 배너 영역, image는 이미지 영역. 기타(css)는 퍼블리싱에서 지정된 위치
			selectedIndex: 0,
			heightFlexible: false,
			removeClass: '',
			directType:'left',
			isGesture:true,
			fixHeight:-1
		},
		selectors: {
			content: '.ui_single_banner_content',
			btnPrev: '.ui_single_banner_prev',
			btnNext: '.ui_single_banner_next',
			indi: '.ui_single_banner_indi',
			visualImage: '.ui_image_center',
			autoButton:''
			
		},
		/**
		 * 생성자
		 * @param el
		 * @param options
		 */
		initialize: function(el, options) {
			var me = this;

			if(me.supr(el, options) === false) { return me.release(); }

			me._init();
			me._bindResize();
			if (me.maxCount === 0) {
				me._controlHide();
			} else {
				me._controlShow();
				me._bind();
			}
		},

		_init: function () {
			var me = this;

			me.$ul = me.$content.find('> ul');
			me.$li = me.$ul.find('> li');
			

			me.maxCount = me.$li.size() - 1;
			me.contentWidth = 100;
			me.timer = null;
			me.isAuto = (me.maxCount === 0) ? false : me.options.isAutoRolling;
			me.isRolling = (me.maxCount === 0) ? false : me.options.isAutoRolling;
			me.isAnimation = true;
			me.isPlay = true;
			me.fixHeight = me.options.fixHeight;
			me.directType = me.options.directType;
			me.isGesture = me.options.isGesture;
			
			
			if(me.directType =='left') me.$ul.css('width', '100%');
			else me.$ul.css('height', '100%');
			
			                        
			//160404 추가
			if(me.$indi.parent().attr('id') == 'card_list_rec' || me.$indi.parent().attr('id') == 'card_list_new'){
				me.isPlay = false;
			}
			//160404 추가 끝

			me.setContent(false);
		},

		_controlHide: function () {
			var me = this;

			me.$btnPrev.css('visibility', 'hidden');
			me.$btnNext.css('visibility', 'hidden');
			me.$indi.css('visibility', 'hidden');

			me.$el.addClass('one');
		},

		_controlShow: function () {
			var me = this;

			me.$btnPrev.css('visibility', '');
			me.$btnNext.css('visibility', '');
			me.$indi.css('visibility', '');

			me.$el.removeClass('one');
		},

		_bindResize: function () {
			var me = this;
			
			// 윈도우에 이벤트 바인드
			$win.on('changemediasize.'  + me.cid + ' resizeend.' + me.cid, me.fnc = function (e, data) {
				// 컨텐츠 위치 값 및 크기 조정
				scui.util.waitImageLoad(me.$content.find('img:visible'), true).done(function() {
					var heights = [];
					me.$li.each(function () {
						heights.push($(this).height());
					});
					me.$content.css({'height': me.fixHeight > 0? me.fixHeight : scui.array.max(heights)});
					me.setButtonTop();
				});
				if(me.directType =='left') me.$li.stop(true, true).css({'position' : 'absolute', 'top' : '0px'});
				else me.$li.stop(true, true).css({'position' : 'absolute', 'left' : '0px'});
				
				me.setVisualImage();
			});
			me.fnc();
		},

		_bind: function () {
			var me = this;
			var directType = me.directType;
			var isGesture = me.isGesture;
			//160411 수정
			
			me.$el.swipeGesture({'direction': directType=='left'? 'horizontal':'vertical'}).on('swipegesturestart swipegestureup swipegesturedown swipegestureleft swipegestureright swipegesturemove swipegestureend swipegesturecancel', function (e, data) {
			//160411 수정 끝
				var distance;
				var distanceGap;		
				
				if(!isGesture) return;		
				
				if (e.type === 'swipegestureleft' || e.type === 'swipegesturedown'){
					if(me.$ul.find('li:animated').length>0) return false; //160411 추가

					if (me.isAnimation) {
						me.isAnimation = false;
						me.newIndex = (me.nowIndex + 1 > me.maxCount) ? 0 : me.nowIndex + 1;
						me.selectContent(me.newIndex, 'NEXT', true); //160516 오류수정
					}
				} else if (e.type === 'swipegestureright' || e.type === 'swipegestureup'){
					if(me.$ul.find('li:animated').length>0) return false; //160411 추가

					if (me.isAnimation) {
						me.isAnimation = false;
						me.newIndex = (me.nowIndex - 1) < 0 ? me.maxCount : me.nowIndex - 1;
						me.selectContent(me.newIndex, 'PREV', true); //160516 오류수정
					}
				//160411 추가
				}else if(e.type === 'swipegesturemove'){
					me.isAnimation = false; 

					//160425 슬라이더 오류 수정 
					if(me.$ul.find('li:animated').length>0){
						me.isAnimation = true; 
						return false; 	
					} 
					
					distance = directType=='left'? data.diff.x : data.diff.y;
					distanceGap = directType=='left'? me.$content.width() : me.$content.height();
					
					if(Math.abs(distance) >= distanceGap){
						me.isAnimation = true;
						return false;
					}

					me.$li.eq(me.nowIndex).css(directType, distance + 'px');
					
					var conW = directType=='left'? Number(me.$li.eq(me.nowIndex).width()) : Number(me.$li.eq(me.nowIndex).height());
                    
                     // 160516 maxCount 1개일때 오류수정
                    
					if(distance >0){
						if(me.nowIndex == 0){
							me.$li.eq(me.maxCount).css(directType , -conW + me.$li.eq(me.nowIndex).position()[directType] + 'px');
							me.$li.eq(me.maxCount).css('visibility','');
							
							if(me.maxCount > 1){
							    me.$li.eq(me.nowIndex + 1).css(directType , conW + me.$li.eq(me.nowIndex).position()[directType] + 'px');
							    me.$li.eq(me.nowIndex + 1).css('visibility','');
							}  
						}else{ 
							me.$li.eq(me.nowIndex -1).css(directType, -conW + me.$li.eq(me.nowIndex).position()[directType] + 'px');
							me.$li.eq(me.nowIndex -1).css('visibility','');
							if(me.maxCount > 1){
							    me.$li.eq(me.nowIndex +1).css(directType, conW + me.$li.eq(me.nowIndex).position()[directType] + 'px');
							    me.$li.eq(me.nowIndex +1).css('visibility','');
							} 					
						}
						
					}else{
					    
						if(me.nowIndex == me.maxCount){
							me.$li.eq(0).css(directType, conW + me.$li.eq(me.nowIndex).position()[directType] + 'px');
							me.$li.eq(0).css('visibility','');
							if(me.maxCount > 1){
							    me.$li.eq(me.nowIndex -1).css(directType, -conW + me.$li.eq(me.nowIndex).position()[directType] + 'px');
							    me.$li.eq(me.nowIndex -1).css('visibility','');
							} 
							
						}else{ 
							me.$li.eq(me.nowIndex + 1).css(directType, conW + me.$li.eq(me.nowIndex).position()[directType] + 'px');
							me.$li.eq(me.nowIndex + 1).css('visibility','');
							if(me.maxCount > 1){
							    me.$li.eq(me.nowIndex -1).css(directType, -conW + me.$li.eq(me.nowIndex).position()[directType] + 'px');
							    me.$li.eq(me.nowIndex -1).css('visibility','');
							} 
						}
					}
					
					me.isAnimation = true;
					//160425 슬라이더 오류 수정 끝

				}else if(e.type === 'swipegesturecancel'){

                    distance = directType=='left'? data.diff.x : data.diff.y;
                    
					if(distance >0){
						if(me.nowIndex == 0){
							if(directType=='left') me.$li.eq(me.maxCount).animate({'left': -100 + '%', 'visibility':''}, 500);
							else me.$li.eq(me.maxCount).animate({'top': -100 + '%', 'visibility':''}, 500);
						}else{ 
							if(directType=='left') me.$li.eq(me.nowIndex -1).animate({'left': -100 + '%', 'visibility':''}, 500);
							else me.$li.eq(me.nowIndex -1).animate({'top': -100 + '%', 'visibility':''}, 500);
						}
					}else{
						if(me.nowIndex == me.maxCount){
							if(directType=='left') me.$li.eq(0).animate({'left': 100 + '%', 'visibility':''}, 500);
							else me.$li.eq(0).animate({'top': 100 + '%', 'visibility':''}, 500);
						}else{ 
							if(directType=='left') me.$li.eq(me.nowIndex + 1).animate({'left': 100 + '%', 'visibility':''}, 500);
							else me.$li.eq(me.nowIndex + 1).animate({'top': 100 + '%', 'visibility':''}, 500);
						}
					}
					
					if(directType=='left') me.$li.eq(me.nowIndex).animate({'left': 0 + '%', 'visibility':''}, 500);
					else me.$li.eq(me.nowIndex).animate({'top': 0 + '%', 'visibility':''}, 500);

					//me.isPlay = true;
				}else if(e.type === "swipegestureend"){
					me.isAnimation = true;
				}
				//160411 추가 끝

			}).on('mouseenter mouseleave focusin focusout', function (e) {
				switch (e.type) {
					case 'mouseenter' :
					case 'focusin' :
						!core.isMobileMode() && (me.isPlay = false);
						me.isRolling && me.setTimer();
						break;
					case 'mouseleave' :
					case 'focusout' :
						!core.isMobileMode() && (me.isPlay = true);
						me.isRolling && me.setTimer();
						break;
				}
			});

			// 인디게이터에 이벤트 바인드 - 151230 ; 모바일 인디게이터 클릭 가능하도록 수정. 서영락 책임과 협의. 추후 이슈가 생기면 다시 막는다.
			//if (isMobile) {
			//	// TODO - 모바일에서는 터치스타트를 막아야한다.
			//	me.$indi.find('>.indi').attr('tabIndex', -1);
			//} else {
			me.$indi.on('click.' + me.cid, '> .indi', function (e) {
				e.preventDefault();
				
				var setIndex = me.$indi.find('> .indi').index($(this));
				
				if (me.isAnimation && setIndex !== me.nowIndex) {
					me.isAnimation = false;
					me.newIndex = setIndex;
					me.$li.eq(me.newIndex).css({'left':((me.newIndex < me.nowIndex) ? -100:100)+'%'}); // 160525 추가
					me.selectContent(me.newIndex, (me.newIndex < me.nowIndex) ? 'PREV' : 'NEXT');
				}
			});

			

			// 이전 다음 버튼에 이벤트 바인드
			me.$btnPrev.on('click.' + me.cid, function (e) {
				e.preventDefault();
				if (me.isAnimation) {
					me.isAnimation = false;
                    me.newIndex = (me.nowIndex - 1) < 0 ? me.maxCount : me.nowIndex - 1;
                    
                    me.$li.css(directType, '-300%').eq(me.nowIndex).css(directType, '0%').end().eq(me.newIndex).css(directType, '-100%');
                    me.selectContent(me.newIndex, 'PREV');                        
                        
				}
			});

			me.$btnNext.on('click.' + me.cid, function (e) {
				e.preventDefault();
				
				console.log('bb');
				if (me.isAnimation) {					
					me.isAnimation = false;
                    me.newIndex = (me.nowIndex + 1 > me.maxCount) ? 0 : me.nowIndex + 1;
                    
                    me.$li.css(directType, '-300%').eq(me.nowIndex).css(directType, '0%').end().eq(me.newIndex).css(directType, '100%');
                    me.selectContent(me.newIndex, 'NEXT'); 
				}
			});
                
                
			me.$ul.on(css3.transitionEnd, function () {
				me.$li.eq(me.newIndex).css(directType, '0%').siblings().css(directType,'300%');
				css3.move($(this), 0, 0, 0);
				me._transitionEnd();
			});
            
			me.$autoButton && me.$autoButton.on('click', function () {
				$(this).hasClass('stop') ? $(this).replaceClass('stop', 'play').find('span.hide').html('자동 롤링 시작하기')  : $(this).replaceClass('play', 'stop').find('span.hide').html('자동 롤링 멉추기');
				me.setRolling({'isPlay': $(this).hasClass('stop'), 'isTab': false});
			});
		},

		/**
		 *
		 * @param {}
		 */
		setContent: function() {
		    
			var me = this;
			var directType = me.directType;

			me.nowIndex = (me.options.selectedIndex === 'last') ? me.maxCount : me.options.selectedIndex;
			me.leftPosition = 0;

			// 컨텐츠 위치 값 및 크기 조정
			scui.util.waitImageLoad(me.$content.find('img:visible'), true).done(function() {
				var heights = [];
				me.$li.each(function () {
					heights.push($(this).height());
				});
				me.$content.css({'height': me.fixHeight > 0? me.fixHeight : scui.array.max(heights)});
				
				
				
				if(directType=='left') me.$li.stop(true, true).css({'position' : 'absolute', 'top' : '0px', 'left' : '-300%'}).eq(me.nowIndex).css({'left': '0%'});
				else me.$li.stop(true, true).css({'position' : 'absolute', 'top' : '-300%', 'left' : '0px'}).eq(me.nowIndex).css({'top': '0%'});
				
				me.$indi.find('.indi').removeClass('on').eq(me.nowIndex).addClass('on');
				me.$li.eq(me.nowIndex).css('visibility', '').siblings().css('visibility', 'hidden');
				me._setButton();
				
				//160411 추가
				me.$li.each(function(){
					$(this).css(directType, ($(this).index() - me.nowIndex) * 100 +'%');					
				});
				

				if(me.nowIndex == 0){
					me.$li.eq(me.maxCount).css(directType, me.maxCount>1 ? '-100%' : '100%');	 // 160516 maxCount 2개일때 오류수정*/
				}

				if(me.nowIndex == me.maxCount){
					me.$li.eq(0).css(directType, '100%');		
				}
				//160411 추가 끝
			});
		},

		/**
		 * index에 해당하는 컨텐츠를 활성화
		 * @param {number} index 탭버튼 인덱스
		 */
		selectContent: function(index, direction, isDrag) {
		    
			var me = this,
				parentIndex = me.$li.eq(me.newIndex).parent().parent().find('ul').index(me.$li.eq(me.newIndex).parent()),
				e, aniTime;

            var _isDrag = isDrag==undefined? false : isDrag;
    
			me.$indi.find('.indi').removeClass('on').eq(me.newIndex).addClass('on');
			//me.$li.css('visibility', ''); //find(':focusable').attr('tabindex', -1);

			if (me.options.heightFlexible) {
				me.$content.stop(true, true).animate({
					'height' : me.$li.eq(me.newIndex).height()
				}, me.options.slideTime);
			}

			aniTime = me.directType=='left'? me.$li.eq(me.newIndex).width() * 0.5 : me.$li.eq(me.newIndex).height() * 0.5;
			aniTime = aniTime != me.options.slideTime? me.options.slideTime : aniTime;
			aniTime = _isDrag? 100 : aniTime;
			
			
			me.$el.trigger('slidebefore', {'parentIndex': parentIndex, 'index': me.newIndex});
			// 160314 추가 : 인디게이터가 Background Image에 따라 컬러값이 변경되는 경우 li의 클래스를 불러온다.
			if(me.$li.eq(me.newIndex).data('indiClass')) me.$indi.removeClass(me.options.removeClass).addClass(me.$li.eq(me.newIndex).data('indiClass'));
			me._transition({'parentIndex': parentIndex, 'index': me.newIndex, 'aniTime': aniTime, 'direction': direction, 'isDrag':_isDrag});
			
			
		},

		_transition: function (data) {
			var me = this,
				time = data.aniTime / 1000;            
            var directType = me.directType;
            
            
			if (css3.support && me.options.isCss3 && !data.isDrag) {
				me.$li.css('visibility', '').eq(me.nowIndex).css(directType, '0%').end().eq(me.newIndex).css(directType, (data.direction === 'NEXT' ? '' : '-') + '100%');
				setTimeout(function () {
					me.transData = data;
					css3.style(me.$ul, '', 0, 'cubic-bezier(0.550, 0.055, 0.675, 0.190)');
					css3.move(me.$li.eq(me.nowIndex).parent(), (data.direction === 'NEXT' ? '-' : '') + '100%', 0, time);
				}, 50);				
				
			} else {
            
				//160411 수정
				if (data.direction === 'PREV') {
					me[directType] = 100;
					//me.$li.css({'top': '-300%'}).eq(me.nowIndex).css({'top': '0%'}).end().eq(data.index).css({'top': '-100%'});
				} else {
					me[directType] = -100;
					//me.$li.css({'top': '-300%'}).eq(me.nowIndex).css({'top': '0%'}).end().eq(data.index).css({'top': '100%'});
				}

                if(directType =='left'){
                    me.$li.stop(true, true).eq(me.nowIndex).animate({
                        'left' : me[directType] + '%'
                    }, {'duration': data.aniTime, 'easing': me.options.easing}).end().eq(data.index).css('visibility', '').animate({
                        'left' : 0 + '%'
                    }, {'duration': data.aniTime, 'easing': me.options.easing, complete:function () {
                        me.transData = data;
                        me._transitionEnd();
                    }});
                }else{
                    me.$li.stop(true, true).eq(me.nowIndex).animate({
                        'top' : me[directType] + '%'
                    }, {'duration': data.aniTime, 'easing': me.options.easing}).end().eq(data.index).css('visibility', '').animate({
                        'top' : 0 + '%'
                    }, {'duration': data.aniTime, 'easing': me.options.easing, complete:function () {
                        me.transData = data;
                        me._transitionEnd();
                    }});
                }
				//160411 수정 끝
			}

		},

		/**
		 * 슬라이드가 끝났을 때 실행
		 * @private
		 */
		_transitionEnd: function () {
			var me = this;
			var directType = me.directType;

			//me.isAnimation = true; // 160525 삭제
			me.nowIndex = me.newIndex;
			me.$li.eq(me.nowIndex).siblings().css('visibility', 'hidden'); // find(':focusable').removeAttr('tabindex');
			me._setButton(true);
			if (me.isAuto && me.isRolling) me.setTimer();
			me.$el.trigger('slideafter', {'parentIndex': me.transData.parentIndex, 'index': me.newIndex});
									
			//160411 추가
			me.$li.each(function(){
				$(this).css(directType, ($(this).index() - me.nowIndex) * 100 +'%');						
			});

			if(me.nowIndex == 0){
				me.$li.eq(me.maxCount).css(directType, me.maxCount>1 ? '-100%' : '100%');		// 160516 maxCount 2개일때 오류수정*/
			}

			if(me.nowIndex == me.maxCount){
				me.$li.eq(0).css(directType, '100%');		
			}
			
			me.isAnimation = true; // 160525 추가
		},

		/**
		 * 비주얼 이미지 Center 정렬
		 * @param {}
		 */
		setVisualImage: function (isTab) {
			var me = this;

			scui.util.waitImageLoad(me.$visualImage.find('img:visible'), true).done(function() {
				var left = Math.ceil((me.$visualImage.width() - me.$visualImage.find('img:visible').width()) / 2);
				me.$visualImage.find('img:visible').css({'left': left});
				isTab && me.$li.eq(0).css('visibility', '').siblings().css('visibility', 'hidden');
			});
		},

		setButtonTop: function () {
			var me = this, top;
			if (me.options.buttonPosition === 'image') {
				top = Math.ceil((me.$content.find('img:visible').height() - me.$btnPrev.height()) / 2);
				me.$btnPrev.css({'marginTop': 0, 'top':  top});
				me.$btnNext.css({'marginTop': 0, 'top':  top});
			} else if (me.options.buttonPosition === 'content') {
				top = Math.ceil((me.$content.height() - me.$btnPrev.height()) / 2);
				me.$btnPrev.css({'marginTop': 0, 'top':  top});
				me.$btnNext.css({'marginTop': 0, 'top':  top});
			}
		},

		/**
		 * 이미지 롤링 시작
		 * @param {}
		 */
		setRolling: function (data) {
			var me = this;

			me.isRolling = (me.maxCount === 0) ? false : data.isPlay;

			// 배너 이미지 센터 정렬
			//me.setVisualImage(data.isTab);
			me.setButtonTop();

			if (me.isAuto && me.isRolling) {
				data.isTab && me.setContent(); // 탭 변경인 경우 1번 배너부터 다시 롤링
				me.setTimer();
			} else {
				clearTimeout(me.timer);
				me.timer = null;
			}
		},

		setTimer: function () {
			var me = this;

			clearTimeout(me.timer);
			me.timer = null;
			if (me.isPlay) {
				me.timer = setTimeout(function () {
					//me.$btnNext.triggerHandler('click');
					if (me.isAnimation) {
						me.isAnimation = false;
						me.newIndex = (me.nowIndex + 1 > me.maxCount) ? 0 : me.nowIndex + 1;
						me.selectContent(me.newIndex, 'NEXT');
						
					}
				}, me.options.rollingTime);
			}
		},

		setHeight: function () {
			var me = this;

			me.$content.stop(true, true).css({
				'height' : me.$li.eq(me.nowIndex).height()
			});
			me.setButtonTop();
		},

		setTab: function (index) {
			var me = this,
				setIndex = me.$li.index(me.$ul.eq(index).find('li:first')),
				direction = (setIndex < me.nowIndex) ? 'PREV' : 'NEXT';

			if (me.isAnimation && setIndex !== me.nowIndex) {
				me.isAnimation = false;
				me.newIndex = setIndex;
				me.selectContent(me.newIndex, (me.newIndex < me.nowIndex) ? 'PREV' : 'NEXT');
			}
		},

		_setButton: function (isClick) {
			var me = this;

			if (me.maxCount === 0) {
				me.$btnPrev.hide();
				me.$btnNext.hide();
				me.$indi.hide();
			} else {
				me.$btnPrev.show();
				me.$btnNext.show();
				me.$indi.show();

				if (me.options.buttonType === 'disabled') {
					me.$btnPrev.removeClass('disable').prop('disabled', false);
					me.$btnNext.removeClass('disable').prop('disabled', false);
					if (me.nowIndex === 0) {
						me.$btnPrev.addClass('disable').prop('disabled', true);
						isClick && me.$btnNext.focus();
					}
					if (me.nowIndex === me.maxCount) {
						me.$btnNext.addClass('disable').prop('disabled', true);
						isClick && me.$btnPrev.focus();
					}

					me.$li.eq(me.nowIndex).data('year') && me._setButtonText();
				} else if(me.options.buttonType === 'none') {
					me.$btnPrev.show();
					me.$btnNext.show();
					if (me.nowIndex === 0) {
						me.$btnPrev.hide();
						isClick && me.$btnNext.focus();
					}
					if (me.nowIndex === me.maxCount) {
						me.$btnNext.hide();
						isClick && me.$btnPrev.focus();
					}

					me.$li.eq(me.nowIndex).data('year') && me._setButtonText();
				}
			}
		},

		_setButtonText: function (isClick) {
			var me = this;

			me.$btnPrev.find('.year').html(me.$li.eq(me.nowIndex - 1).data('year')).end().find('.muns').html(me.$li.eq(me.nowIndex - 1).data('month'));
			me.$btnNext.find('.year').html(me.$li.eq(me.nowIndex + 1).data('year')).end().find('.muns').html(me.$li.eq(me.nowIndex + 1).data('month'));
		},

		selectedIndex: function () {
			var me = this;
			return me.nowIndex;
		},

		selectedCount: function () {
			var me = this;

			return me.maxCount;
		},

		update: function () {
			var me = this;

			me.updateSelectors();

			me.$ul = me.$content.find('> ul');
			me.$li = me.$ul.find('> li');

			me.nowIndex = 0;
			me.maxCount = me.$li.size() - 1;
			me.contentWidth = 100;
			me.timer = null;
			me.isAuto = (me.maxCount === 0) ? false : me.options.isAutoRolling;
			me.isRolling = (me.maxCount === 0) ? false : me.options.isAutoRolling;
			me.isAnimation = true;
			me.isPlay = true;

			me.setContent(false);
		}
	});
	///////////////////////////////////////////////////////////////////////////////////////

	if (typeof define === "function" && define.amd) {
		define([], function() {
			return SingleBanner;
		});
	}

	//Banner ////////////////////////////////////////////////////////////////////////////////
	/**
	 * @class
	 * @name vinyl.ui.TabBanner
	 * @description 무한롤링 배너 - 각 아이템을 Absolute로 띄우고 left로 위치를 이동하여 이동
	 * @extends vinyl.ui.View
	 */
	var TabBanner = core.ui('TabBanner', /** @lends vinyl.ui.TabBanner# */{
		bindjQuery: 'tabBanner',
		$statics: /** @lends vinyl.ui.TabBanner */{
			ON_BANNER_CHANGED: 'tabBannerchange'
		},
		defaults: {
			selectedIndex: 0,
			buttonPosition: 'content'	// auto는 자옹 위치 아니면 css에서 설정한 위치
		},
		events: {
		},
		selectors: {
			tabButton : '.ui_tab_banner_button',
			tabContent : '.ui_tab_banner_content',
			autoButton: '.ui_tab_auto_rolling'
		},
		/**
		 * 생성자
		 * @param el
		 * @param options
		 */
		initialize: function(el, options) {
			var me = this;

			if(me.supr(el, options) === false) { return me.release(); }

			me._init();
			me._bind();
		},

		_init: function () {
			var me = this;
			me.index = me.options.selectedIndex;
		},

		_bind: function () {
			var me = this,
				$bannerContent = me.$el.find('.ui_tab_banner_content');


			// 보여지는 탭 내부의 배너 롤링 시작.
			$bannerContent.scSingleBanner({'isAutoRolling': true, 'buttonPosition': me.options.buttonPosition, selectors: {'autoButton': me.selectors.autoButton}}).scSingleBanner('setRolling',  {'isPlay': false, 'isTab': true}).eq(me.index).scSingleBanner('setRolling',  {'isPlay': true, 'isTab': true});
			//(me.$tabContent.scSingleBanner('selectedCount') === 0) && me.$autoButton.hide().off('click');

			// 탭버튼 이벤트 바인드
			me.$tabButton.on('click', function () {
				me.index = me.$tabButton.index($(this));
				me.isPlay = me.$tabContent.eq(me.index).find(me.selectors.autoButton).hasClass('stop') ? true : false;
				me.$tabButton.removeClass('on').eq(me.index).addClass('on');
				me.$tabContent.removeClass('on').scSingleBanner('setRolling', {'isPlay': false, 'isTab': true}).eq(me.index).addClass('on').scSingleBanner('setRolling',  {'isPlay': me.isPlay, 'isTab': true});
			});

			// autoRolling
			/*
			 me.$autoButton.on('click', function () {
			 $(this).hasClass('stop') ? $(this).replaceClass('stop', 'play').find('span.hide').html('자동 롤링 시작하기')  : $(this).replaceClass('play', 'stop').find('span.hide').html('자동 롤링 멉추기');
			 me.$tabContent.scSingleBanner('setRolling', {'isPlay': $(this).hasClass('stop'), 'isTab': false});
			 });
			 */
		}
	});
	///////////////////////////////////////////////////////////////////////////////////////

	if (typeof define === "function" && define.amd) {
		define([], function() {
			return TabBanner;
		});
	}

})(jQuery, window[LIB_NAME]);