/**
 * Created by 김승일(comahead@vi-nyl.com) on 2015-05-04.
 */
(function ($, core) {
	"use strict";

	var $win = $(window),
		$doc = $(document);

	/**
	 * 스크롤 위치에 따라 fixed 처리
	 * @class
	 * @name scui.ui.ScrollNav
	 * @extends scui.ui.View
	 */
	var ScrollNav = core.ui('ScrollNav', {
		bindjQuery: 'scrollNav',
		defaults:{
		    startPos:-1
		},
		selectors: {

		},
		initialize: function (el, options) {
			var me = this;

			if (me.supr(el, options) === false) { return; }

			me.$fixedDOM = me.$el.children();
			me.$fixedDOM.addClass('ui_fixed_scroll');
			me.fixedDOMStyle = me.$fixedDOM[0].style; // 리플로우 속도 개선을 위해
			me.$links = me.$('a'); // 링크
			me.$targets = me.$links.map(function () { return $($(this).attr('href')); });
			me.$header = $('#htop');     // 헤더
			me.startPos = me.options.startPos;
			
			me._calclinksPos();			
			me._bindEvents();
			
		},

		/**
		 * 이벤트 바인딩
		 * @private
		 */
		_bindEvents: function () {
			var me = this,
				$body = $('body'),
				resizeCallback, scrollCallback;

			$win.on('resize.' + me.cid, resizeCallback = function () {
				me.fixedDOMStyle.width = (me.options.maxWidth > 0 && me.$fixedDOM.css('position') !== 'fixed') ? me.options.maxWidth + 'px' : core.util.getDocWidth() + 'px';
				me.fixedDOMStyle.left = -$win.scrollLeft() + 'px';
				
			}).on('scroll.' + me.cid, scrollCallback = function () {
			    
				if ($body.hasClass('opened_header')) { return; }
				var top = $win.scrollTop();

				me._toggleFixed(top);
				me._activeLink(top);
			}).on('changemediasize.' + me.cid, function () {
			    
				me._toggleFixed($win.scrollTop(), true);
			});
			$doc.ajaxComplete(function () {
				setTimeout(function () {
					me._calclinksPos();
				}, 50);
			});
			resizeCallback();
			scrollCallback();
			

			// 링크클릭시
			me.$el.on('click', 'a', function (e) {
			    
				e.preventDefault();

				var index = $(this).index();
				me._calclinksPos();
				
				$('html, body').animate({'scrollTop': me.linksPos[index].start - me.totalOffset}, 'fast');
				
				
			});

			// 헤더가 열릴 때 토글해준다.
			core.PubSub.on('openheader closeheader', function (e) {
				if (!me.isFixed) { return; }
				me.$fixedDOM.toggle(e.type === 'closeheader');
			});
		},

		/**
		 * 스크롤 위치에 따라 fixed 토글
		 * @param {string} top 스크롤값
		 * @param {boolean} isForce
		 * @private
		 */
		_toggleFixed: function (top, isForce) {
			var me = this;
			
			if (top >= me.navTop - me.topOffset) {
				if (!me.isFixed || isForce) { // fixed 가 안돼있을 때만 fixed 설정(리플로우 최소화).
					me._calclinksPos();
					me.isFixed = true;
					me.fixedDOMStyle.position = 'fixed';
					me.fixedDOMStyle.top = me.topOffset + 'px';
					me.fixedDOMStyle.width = core.util.getDocWidth() + 'px';
					me.fixedDOMStyle.left = -$win.scrollLeft() + 'px';
				}
			} else {
				if (me.isFixed || isForce) { // fixed 가 돼있을 때만 fixed 해제(리플로우 최소화)
					me.isFixed = false;
					me.$fixedDOM.css({
						position: '',
						top: '',
						left: '',
						width: ''
					});
				}
			}
			me.$fixedDOM.css({
				'left': -$win.scrollLeft()
			});
		},

		/**
		 * 현재 스크롤위치에 해당하는 링크를 활성화
		 * @param {number} top 스크롤값
		 * @private
		 */
		_activeLink: function (top) {
			var me = this;

			top = top + me.totalOffset + 1;
			me.$links.removeClass('on');
			for (var i = 0; i < me.linksPos.length; i++) {
				if (me.linksPos[i].start <= top && top < me.linksPos[i].end) {
					me.$links.eq(i).addClass('on');
					break;
				}
			}
		},

		/**
		 * 리사이징 될 때 top값들을 재계산
		 * @private
		 */
		_calclinksPos: function () {
			var me = this;

			me.navTop = me.$el.offset().top; // nav top 값
			me.topOffset = me.$header.height() + (parseInt(me.$header.css('top'), 10) || 0); // 헤더 두께
			me.totalOffset = me.topOffset + me.$el.height(); // 헤더랑 nav 두께 총합*/
			
			
			me.linksPos = [];
			// 리사이징이 되고 나면 레이아웃이 재배치되기 때문에 관련요소들의 위치를 다시 가져온다.
			
			console.log("------------------");
			
			var minVal = {start:Infinity, index:-1}; //160530 수정 시작포인트 추가			
			
			me.$targets.each(function (idx) {
				var $el = $(this),
					start = $el.offset().top;
										
                    if(minVal.start > start){
                        minVal.start  = start;
                        minVal.index  = idx;                        
                    } 
                    
				me.linksPos.push({
					start: start,
					end: start + $el.outerHeight()
				});
				
				console.log(start);
			});
			
			if(me.startPos > -1){			
    			if(minVal.index > -1) {
    			    me.linksPos[minVal.index].start = me.startPos;
    			}
			}
			
		}
	});

	if (typeof define === "function" && define.amd) {
		define('modules/scroll-nav', [], function() {
			return ScrollNav;
		});
	}
})(jQuery, window[LIB_NAME]);