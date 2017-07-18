/*!
 * @module scui.ui.Accordion
 * @author comahead
 * @email comahead@vinylc.com
 * @create 2015-01-29
 * @license MIT License
 *
 * @modifier (김승일책임)comahead@vi-nyl.com
 */
(function ($, core, undefined) {
	"use strict";
	if (core.ui.Accordion) { return; }

	var ctx = window,
		ui  = core.ui,
		disabledAccordion = $('body').hasClass('ui_disabled_accordion');

	/**
	 * 아코디언 모듈
	 * @class
	 * @name scui.ui.Accordion
	 * @author 강태진
	 * @modifier 김승일
	 */
	var Accordion = ui('Accordion', /**@lends scui.ui.Accordion */{
		bindjQuery: 'accordion',
		defaults: {
			singleOpen: false,               // 단일열림 / 다중열림 여부
			toggleButtonType: '',           // 토글버튼 유형.(현재 미사용)
			duration: 200,                   // 펼쳐지거나 닫혀지거나 할 때 애니메이션 속도

			activeClass: "active",        // 활성화됐을 때 추가할 css 클래스명
			selectedClass: 'on',        // 버튼이 토글될 때 추가할 css 클래스명
			toggleClass: "ui_accord_toggle",
			contentClass: "ui_accord_content",
			itemClosest: 'li',
			itemSelector: '>ul>li',
			toggleSelector: ">.head>.ui_accord_toggle",  // 토글버튼
			contentSelector: ">.ui_accord_content"       // 컨텐츠
		},

		/**
		 * 생성자
		 * @param el 모듈 요소
		 * @param options 옵션(기본값: defaults 속성 참조)
		 */
		initialize: function (el, options) {
			var me = this;

			if (me.supr(el, options) === false || disabledAccordion) {
				return;
			}

			me._setOptionsByAccordType();
			me._bindEvent();

			// option에 기본적으로 오픈시킬 인덱스 값이 있으면 오픈시킨다.
			var openIndex = me.$el.data('openIndex');
			if (openIndex !== undefined) {
				if(openIndex === 'all') {
					// 전체 오픈
					me.expandAll();
				} else {
					// openIndex에 해당하는 컨텐츠를 오픈
					var indexes = [].concat(openIndex);
					if (me.options.singleOpen) {
						me.expand(indexes[0], false)
					} else {
						core.each(indexes, function (index) {
							me.expand(index, false);
						});
					}
				}
			}
		},

		_setOptionsByAccordType: function(){
			var me = this,
				opts = me.options;

			if (opts.accordType === 'detailview') {
				opts.itemSelector = '';
				opts.itemClosest = 'div';
				opts.toggleSelector = '>h2>.ui_accord_toggle';
				opts.contentSelector = '>.ui_accord_content';
			}
		},

		/**
		 * 이벤트 바인딩
		 */
		_bindEvent: function () {
			var me = this,
				o;

			// 토글버튼 클릭됐을 때
			me.on("click dblclick", me.options.itemSelector + me.options.toggleSelector, function (e) {
				e.preventDefault();

				//me.updateSelectors();
				var $item = $(this).closest(me.options.itemClosest),
					$items = me._findItems(),
					index = $items.index($item);

				// 열려있으면 닫고
				if ($item.hasClass(me.options.selectedClass)) {
					me.collapse(index, true, function(){
						$item.addClass(me.options.activeClass);
					});
				} else {
					// 아니면 열고
					me.expand(index, true);
				}
			});

			if (o = me.options.accordGroup && me.options.singleOpen) {
				// 아코디언 요소가 따로 떨어져 있는 것을 data-accord-group속성을 묶고,
				// 하나가 열리면 그룹으로 묶여진 다른 아코디언에 열려진게 있으면 닫아준다.
				me.on('accordionbeforeexpand', function (e) {
					$('.ui_accordion[data-accord-group=' + o + '], .ui_accordion_list[data-accord-group=' + o + ']')
						.not(me.$el).scAccordion('collapse').find(me.options.itemSelector).removeClass(me.options.selectedClass);
				});
			}
		},

		_findSelected: function() {
			return this.$items.filter('.'+me.options.selectedClass);
		},

		// 재정의
		_findItems: function() {
			var me = this, $items;

			if(me.options.accordType === 'detailview') {
				$items = me.$el;
			} else {
				$items = me.options.itemSelector ? me.$(me.options.itemSelector) : me.$el;
			}
			return $items;
		},

		/**
		 * slide effect collapse handler
		 * @private
		 * @param { }
		 */
		collapse: function (index, isAni, cb) {
			var me = this,
				opts = me.options,
				data = {},           // 애니메이션 시간
				$items = me._findItems();

			if (arguments.length === 0 || index === null) {
				// index가 안넘어보면 현재 활성화된 패널의 index를 갖고 온다.
				index = $items.filter('.' + opts.selectedClass).index();
			}

			if (index < 0) { return; }

			data.index = index;
			data.header = $items.eq(index);
			data.content = data.header.find(opts.contentSelector);

			// 닫히기 전에 이벤트 발생
			//if (me.triggerHandler('accordionbeforecollapse', data) === false){ return; }
			var ev = $.Event('accordionbeforecollapse');
			me.$el.triggerHandler(ev, data);
			if (ev.isDefaultPrevented()) { return; }

			if(isAni !== false) {
				// 애니메이션 모드
				//if(this.isAnimate) { return; }
				data.header.removeClass(opts.selectedClass);
				data.content.slideUp(opts.duration, function () {
					// 닫혀진 후에 이벤트 발생
					me.trigger('accordioncollapse', data);
					me._updateButton(index, false);
					cb && cb();
				});
			} else {
				// 일반 모드
				data.header.removeClass(opts.selectedClass);
				data.content.hide();
				// 닫혀진 후에 이벤트 발생
				me.trigger('accordioncollapse', data);
				me._updateButton(index, false);
				cb && cb();
			}
		},


		/**
		 * slide effect expand handler
		 * @param { }
		 */
		expand: function (index, isAni, cb) {
			var me = this,
				opts = me.options,
				$items, oldItem, oldIndex, newItem, data;           //

			if (arguments.length === 0) {
				return;
			}

			$items = me._findItems();
			newItem = $items.eq(index);
			oldItem = $items.filter('.'+opts.selectedClass);
			oldIndex = oldItem.index();
			data = {
				index: index,
				header: newItem,
				oldIndex: oldIndex,
				oldHeader: oldIndex < 0 ? null : oldItem
			};

			if (data.index === data.oldIndex) { return; }

			data.content = newItem.find(opts.contentSelector);
			data.oldContent = oldIndex < 0 ? null : oldItem.find(opts.contentSelector);

			// 열리기 전에 이벤트 발생
			//if (me.triggerHandler('accordionbeforeexpand', data) === false) { return; }
			var ev = $.Event('accordionbeforeexpand');
			me.$el.triggerHandler(ev, data);
			if (ev.isDefaultPrevented()) { return; }

			if(isAni !== false) {
				// 애니메이션 사용
				me.isAnimate = true;
				if (opts.singleOpen && data.oldHeader) {
					// 하나만 열리는 모드
					data.oldHeader.removeClass(opts.selectedClass);
					data.oldContent.slideUp(opts.duration, function () {
						me._updateButton(data.oldIndex, false);
						cb && cb();
					});
				}
				data.header.addClass(opts.selectedClass)
				data.content.slideDown(opts.duration, function () {
					me.isAnimate = false;
					// 열려진 후에 이벤트 발생
					me.trigger('accordionexpand', data);
					me._updateButton(index, true);
					cb && cb();
				});
			} else {
				// 에니메이션 미사용
				if (opts.singleOpen && data.oldHeader) {
					// 하나만 열리는 모드
					data.oldHeader.removeClass(opts.selectedClass);
					data.oldContent.hide();
				}
				data.header.addClass(opts.selectedClass);
				data.content.show();
				// 열려진 후에 이벤트 발생
				me.trigger('accordionexpand', data);
				me._updateButton(index, true);
				cb && cb();
			}
		},

		getActivate: function () {
			var me = this,
				opts = me.options,
				item = me._findItems().filter('.'+opts.selectedClass);

			if (item.length === 0) {
				return {
					index: -1,
					header: null,
					content: null
				}
			} else {
				return {
					index: item.index(),
					header: item,
					content: item.find(opts.contentSelector)
				};
			}
		},

		_updateButton: function(index, toggle) {
			var me = this,
				sc = me.options.activeClass,
				tc = me.options.toggleButtonClass,
				$btn = me._findItems().eq(index).find(me.options.toggleSelector);

			if ($btn.is('a')) {
				if(toggle) {
					$btn.parent().parent().removeClass(sc).addClass(tc);
					$btn.find('span.btn_txt').html('닫기');
					$btn.find('span.ui_accord_text').html(function () {
						return $btn.attr('data-close-text');
					}).parent().parent().replaceClass('btn_open', 'btn_close');
				} else {
					$btn.parent().parent().removeClass(tc);
					$btn.find('span.btn_txt').html('상세보기');
					$btn.find('span.ui_accord_text').html(function () {
						return $btn.attr('data-open-text');
					}).parent().parent().replaceClass('btn_close', 'btn_open');
				}
			} else {
				if(toggle) {
					$btn.find('span.btn_txt').html('닫기');
					$btn.replaceClass('btn_open', 'btn_close')
						.parent().parent().removeClass(sc).addClass(tc);
					$btn.find('span.ui_accord_text').html(function () {
						return $btn.attr('data-close-text');
					});
				} else {
					$btn.find('span.btn_txt').html('상세보기');
					$btn.replaceClass('btn_close', 'btn_open')
						.parent().parent().removeClass(tc);
					$btn.find('span.ui_accord_text').html(function () {
						return $btn.attr('data-open-text');
					});
				}
			}
		},

		collapseAll: function() {
			var me = this,
				count = me._findItems().size();

			me.collapseMode = 'all';
			for(var i = 0; i < count; i++) {
				me.collapse(i, false);
			}
			me.collapseMode = null;
		},

		expandAll: function() {
			if(this.options.singleOpen){ return; }
			var me = this,
				count = me._findItems().size();

			me.expandMode = 'all';
			for(var i = 0; i < count; i++) {
				me.expand(i, false);
			}
			me.expandMode = null;
		}
	});


	if (typeof define === "function" && define.amd) {
		define('modules/accordion', [], function ($) {
			return Accordion;
		});
	}

})(jQuery, window[LIB_NAME]);


/*!
 * @modul scui.ui.Calendar.js
 * @email comahead@vinylc.com
 * @create 2015-03-25
 * @license MIT License
 *
 * @modifier 김승일(comahead@vinylc.com)
 */
(function ( $, core, undefined) {
	"use strict";

	if(core.ui.Calendar){ return; }

	var ctx = window,
		$win = $(window),
		$doc = $(document),
		ui = core.ui,
		dateUtil = core.date,
		browser = core.browser,
		isTouch = browser.isTouch;

	//Calendar ////////////////////////////////////////////////////////////////////////////
	/**
	 * @class
	 * @description 달력 모듈
	 * @name scui.ui.Calendar
	 * @extends scui.ui.View
	 * @fires scui.ui.Calendar#calendarshow
	 * @fires scui.ui.Calendar#calendarshown
	 * @fires scui.ui.Calendar#calendarhide
	 * @fires scui.ui.Calendar#calendarhidden
	 * @fires scui.ui.Calendar#calendarselected
	 * @fires scui.ui.Calendar#calendarinsertdate
	 */
	var daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
	var dateRegex = /[0-9]{4}.?[0-9]{2}.?[0-9]{2}/;
	var Calendar = ui('Calendar', /** @lends scui.ui.Calendar# */{
		bindjQuery: 'calendar',
		defaults: {
			weekNames: ['일', '월','화','수','목','금', '토'],
			monthNames: '1월,2월,3월,4월,5월,6월,7월,8월,9월,10월,11월,12월'.split(','),
			titleFormat: 'yyyy년 MM월 dd일',
			weekendDisabled: false,     // 주말을 disabled시킬 것인가
			type: 'button',				// 날짜가 선택되게 할 것인가
			inputTarget: '',            // 날짜를 선택했을 때, 날짜가 들어갈 인풋박스의 셀렉터
			marginTop: 4,                  //
			showOtherMonths: false,     // 이전, 다음달의 날짜를 표시할 것인가
			isBubble: false,                // 달력이벤트의 버블링을 허용할 것인가
			date: new Date(),			     // 처음에 표시할 기본 날짜
			today: new Date(),              // 오늘 날짜
			isClickActive: true,            // 인라인모드에서 클릭했을 때 active효과를 줄 것인가.
			showByInput: false,              // 인풋박스에 의해서도 달력을 열 것인가
			where: 'inline',                // 달력 dom을 어디에 두고 열것인가 설정:(body(body 맨 하단, inline(버튼 바로 밑)
			minDate: '-5y',                 // 날짜 하한값
			maxDate: '+5y',                 // 날짜 상한값
			isValidate: false,               // 유효한 날짜인지 체크
			template: {
				header: '<div class="ui-calendar-header-first">' +
				'<a href="#" class="ui-calendar-set-today" title="현재일 보기">오늘</a>' +
				'<select class="ui_selectbox sel_years" data-class="item_wrap" data-width-class="f_wd_year" title="달력년도"></select>' +
				'<a href="#" class="ui-calendar-close"><span class="hide">닫기</span></a>' +
				'</div>' +
				'<div class="ui-calendar-header-second">' +
				'<a href="#" class="ui-calendar-prev">&lt;</a>' +
				'<span class="ui-calendar-now">01</span>' +
				'<a href="#" class="ui-calendar-next">&gt;</a>' +
				'</div>',

				label: '<span class="ui-calendar-day" title="{{-title}}">{{=day}}</span>',
				button: '<button type="button" class="ui-calendar-day{{-disabled?\' disabled\':""}}" title="{{-title}}" {{=disabled?\'disabled="disabled" style="cursor:default;"\':""}}>{{=day}}</button>'
			},
			holidays: [],               // 휴일 날짜 -> ['2014-04-05', '2014-05-12'],
			holidaysAlertCode: '',               // 휴일 날짜 -> ['2014-04-05', '2014-05-12'],
			caption: '캘린더입니다. 글은 일요일, 월요일, 화요일, 수요일, 목요일, 금요일, 토요일 순으로 나옵니다.',
			monthCaption: '월 선택 캘린더입니다. 1월부터 12월까지 순서대로 나옵니다.',
			colWidth: '32px'			// 셀 너비
		},

		events: {

		},

		/**
		 *
		 * @param el
		 * @param options
		 * @returns {boolean}
		 */
		initialize: function (el, options) {
			var me = this, d;
			if (me.supr(el, options) === false) {
				return me.release();
			}

			me._normalizeOptions();
			me.isInline = !me.$el.is('button, input, a');

			if(me.isInline){
				me.currDate = (d = dateUtil.parse(me.options.date)), isNaN(d) ? new Date() : d;
				me._render();
			} else {
				if (me.options.inputTarget) {
					me.$input = $(me.options.inputTarget);
					me.$input.data('ui_calendar', me);
				} else {
					throw new Error('data-input-target 속성을 설정해주세요.');
				}

				if (core.browser.isMobile) {
					me.currDate = (d = dateUtil.parse(me.$input.val() || me.options.date)), isNaN(d) ? new Date() : d;
					me._renderMobileCalendar();
					return;
				} else {
					me.options.showByInput && me.$input.on('click', function (e) {
						if (me.isShown) { return; }
						me.opener = this;
						me.open();
					});
					me.$input.addClass('ui_formatter').attr({
						'data-format': 'date',
						'maxlength': 10
					}).prop('readonly', false);
					me.$input.on('keyup paste change', function (e) {
						if (!me.isShown || this.value.length !== 10) { return; }
						if (me._isValidDate(this.value)) {
							me.setDate(this.value);
						}
					});
				}

				me.options.header = true;
				me.options.type = 'button';
				me._parseMinMaxDate();
				me.off('.calendar').on('click.calendar', function(e){
					e.preventDefault();
					if(me.isShown){
						me.close();
						return;
					}
					me.opener = this;
					me.open();
				});
			}
		},

		_isValidDate: function (val) {
			if (!val || val.length < 8) { return false; }
			val = dateUtil.parse(val);
			if (!dateUtil.isValid(val)) { return false; }
			if (this.minDate > val) { return false; }
			if (this.maxDate < val) { return false; }
			return true;
		},

		/**
		 * 옵션 중에서 날짜옵션에 문자열로 된게 있으면 파싱해서 date형으로 변환한다.
		 * @private
		 */
		_normalizeOptions: function() {
			var me = this,
				opts = me.options;

			if(!core.is(opts.today, 'date')) {
				opts.today = dateUtil.parse(opts.today+'');
			}

			//data-holidays속성을 이용한 경우 문자열로 넘어오기 때문에 배열로 변환해주어야 한다.
			if(core.is(opts.holidays, 'string')) {
				try {
					opts.holidays = eval(opts.holidays);
				} catch (e){ opts.holidays = []; }
			}
		},

		/**
		 * 옵션에 있는 최소날짜와 최대날짜를 Date형으로 변환
		 */
		_parseMinMaxDate: function () {
			var me = this,
				opts = me.options,
				minDate = opts.minDate,
				maxDate = opts.maxDate;

			me.setMinDate(minDate);
			me.setMaxDate(maxDate);
		},

		/**
		 * 휴일 여부
		 * @param {number} y 년도
		 * @param {number} m 월
		 * @param {number} d 일
		 * @returns {boolean} 휴일여부
		 * @private
		 */
		_isHoliday: function(y, m, d) {
			var me = this,
				holidays = me.options.holidays,
				i, date, item;

			for (var i = -1; item = holidays[++i]; ) {
				date = dateUtil.parse(item);
				if(date.getFullYear() === y && date.getMonth() + 1 === m && date.getDate() === d) {
					return true;
				}
			}

			return false;
		},

		/**
		 * 최소날짜 설정
		 *
		 * @param {Date|String} minDate '2014-12-12', '-2M'
		 */
		setMinDate: function (m, isRender) {
			var me = this,
				today = core.clone(me.options.today),
				minDate, val;

			if (!m){ minDate = core.clone(me.options.minDate); }
			else { minDate = m; }

			if (core.is(minDate, 'date')) {
				me.minDate = core.clone(minDate);
			} else if (dateRegex.test(minDate)){
				me.minDate = core.date.parse(minDate);
			} else {
				if (val = core.date.calc(today, minDate)){
					me.minDate = val;
				}
			}

			if (!core.is(me.minDate, 'date')){
				me.minDate = new Date(today.getFullYear() - 5, 0, 1, 0, 0, 0, 0);
			}

			me.minDate.setHours(0, 0, 0, 0);

			if (dateUtil.isValid(me.currDate) && me.currDate < me.minDate) {
				me.currDate = core.clone(me.minDate);
			}
			if (me.isShown && isRender !== false) {
				me._renderHeader();
				me._renderDate();
			}

			if (me.$input
				&& dateUtil.isValid(me.$input.val())
				&& dateUtil.compare(me.minDate, me.$input.val()) === -1) {
				me.$input.val(dateUtil.format(me.minDate));
			}
		},

		/**
		 * 최대날짜 설정
		 *
		 * @param {Date|String} maxDate '2014-12-12', '+2M'
		 */
		setMaxDate: function (m, isRender) {
			var me = this,
				today = core.clone(me.options.today),
				maxDate, val;

			if (!m){ maxDate = core.clone(me.options.maxDate); }
			else { maxDate = m; }

			if (core.is(maxDate, 'date')) {
				me.maxDate = core.clone(maxDate);
			} else if (dateRegex.test(maxDate)) {
				me.maxDate = core.date.parse(maxDate);
			} else {
				if (val = core.date.calc(today, maxDate)){
					me.maxDate = val;
				}
			}

			if (!core.is(me.maxDate, 'date')) {
				me.maxDate = new Date(today.getFullYear() + 5, 11, 31, 0, 0, 0, 0);
			}

			me.maxDate.setHours(0, 0, 0, 0);

			if (dateUtil.isValid(me.currDate) && me.currDate > me.maxDate) {
				me.currDate = core.clone(me.maxDate);
			}
			if (me.isShown && isRender !== false) {
				me._renderHeader();
				me._renderDate();
			}
			if (me.$input
				&& dateUtil.isValid(me.$input.val())
				&& dateUtil.compare(me.maxDate, me.$input.val()) === 1) {
				me.$input.val(dateUtil.format(me.maxDate));
			}
		},

		setRangeDate: function (minDate, maxDate) {
			var me = this;

			me.setMinDate(minDate, false);
			me.setMaxDate(maxDate, false);
			if (me.isShown) {
				me._renderHeader();
				me._renderDate();
			}
		},

		/**
		 * 모바일 버전 렌더링
		 * @private
		 */
		_renderMobileCalendar: function() {
			var me = this,
				placeholder = me.$input.attr('placeholder') === undefined ? '' : me.$input.attr('placeholder'),
				$label, $span, labelTxt;

			if (!(me.elID = me.$input.attr('id'))) {
				me.$input.attr('id', me.elID = me.cid);
			} else {
				$label = $('label[for='+me.$input.attr('id')+']');
				if ($label.size() > 0) {
					$span = $('<span>' + (labelTxt = $label.text()) + '</span>');
					$label.replaceWith($span);
					$label = null;
				}
			}

			var dateUtil = core.date,
				$label = $('<label><span class="input_cal"></span><span class="hide">'+labelTxt+'</span><span class="ui_calendar_value" style="line-height:36px;"></span></label>');

			// 2012-12-12 를 2012.12.12 형식으로 변환
			var hypenDate = function (value) {
				if (!value) { return ''; }
				return core.date.format(value, 'yyyy.MM.dd');
			};
			var dotDate = function (value) {
				if (!value) { return ''; }
				return core.date.format(value, 'yyyy-MM-dd');
			};

			$label.attr('for', me.elID)[0].className = me.$input[0].className;
			me.$input.css({'position':'absolute',top:0,right:5,width:1,height:1,zIndex:-1,'opacity': 0}).val(dotDate(me.$input.val())).attr({'type': 'date', 'data-module': 'calendar'}).prop({
				'readonly': false,
				'min': dateUtil.format(me.minDate),
				'max': dateUtil.format(me.maxDate)
			}).on('change dateselectboxchange', function () { // dateselectboxchange: DateSelectbox 에 발생하는 이벤트
				var value = this.value;
				setTimeout(function () {
					var labelText = hypenDate(me.$input.val()) !== '' ? hypenDate(me.$input.val()) : placeholder;
					$label.find('.ui_calendar_value').html(labelText);
				});
			});
			me.$el.after($label);
			me.$el.remove();
			setTimeout(function () {
				var labelText = hypenDate(me.$input.val()) !== '' ? hypenDate(me.$input.val()) : placeholder;
				$label.find('.ui_calendar_value').html(labelText);
			});

			core.each(Calendar.prototype, function (a, name) {
				if (name.substr(0, 1) != '_') {
					me[name] = function () {};
				}
			});
		},

		/**
		 * 위치 재조절
		 */
		_reposition: function() {
			if(this.options.type !== 'button' || this.options.isInline){ return; }

			var me = this,
				util = core.util,
				calWidth = me.$calendar.width(),
				calHalfWidth = Math.ceil(calWidth / 2),
				inpWidth, inpHalfWidth, offset, docWidth, top, left, absLeft;

			inpWidth = me.$input.outerWidth();
			inpHalfWidth = Math.ceil(inpWidth / 2);
			top = me.$input[me.options.where === 'body' ? 'offset' : 'position']().top + me.$input.outerHeight() + 10;

			if (core.isMobileMode()) {
				offset = me.$el.parent().offset();
				docWidth = util.getDocWidth();

				absLeft = offset.left - Math.abs(inpHalfWidth - calHalfWidth);
				if (inpWidth < calWidth && absLeft < 0) {
					left = offset.left - Math.abs(inpHalfWidth - calHalfWidth);
				} else if (docWidth < absLeft + calWidth) {
					left = docWidth - (offset.left + calWidth) - 4;
				} else {
					left = inpHalfWidth - calHalfWidth;
				}
			} else {
				left = inpHalfWidth - calHalfWidth;
			}

			me.$calendar.css({
				left: left,
				top: top
			});
			return me;
		},

		/**
		 * 모달 띄우기
		 * @returns {Calendar}
		 */
		open: function(){
			var me = this;
			if(me.isInline) { return; }

			Calendar.active && Calendar.active.close();
			Calendar.active = this;

			var ev = $.Event('calendarshow');
			me.trigger(ev);
			if (ev.isDefaultPrevented()) { return; }

			me._readInput();
			me._render();
			me._reposition();
			me.show();
			me.isShown = true;
			me.$calendar.attr('tabindex', 0).focus();

			return me;
		},

		/**
		 * 인풋에 있는 값을 달려ㅕㄱ에 반영
		 * @private
		 */
		_readInput: function () {
			var me = this,
				val = me.$input.val(),
				valDate = (val && val.length < 8) ? null : dateUtil.parse(val);

			if (core.date.isValid(valDate)) {
				if (!valDate || isNaN(valDate.getTime())) {
					me.currDate = core.clone(me.options.date);
					me.activeDate = core.clone(me.options.today);
					if (val) {
						me.$input.val(dateUtil.format(me.activeDate));
					}
				} else {
					var cmp = me._compareDate(valDate);
					if (cmp < 0) {
						valDate = me.currDate = core.clone(me.minDate);
					} else if (cmp > 0) {
						valDate = me.currDate = core.clone(me.maxDate);
					} else {
						me.currDate = valDate;
					}
					me.activeDate = core.clone(valDate);

					if (val && cmp !== 0) {
						me.$input.val(dateUtil.format(valDate));
					}
				}
			} else {
				me.currDate = core.clone(me.options.date);
				me.activeDate = core.clone(me.options.today);
			}
		},

		/**
		 * 모달 닫기
		 * @returns {Calendar}
		 */
		close: function(){
			var me = this;
			if(me.isInline){ return; }

			me.isShown = false;
			me._trigger('hidden');
			me._remove();
			$doc.off('.calendar');
			Calendar.active = null;

			return this;
		},

		/**
		 * 모달 표시
		 * @returns {Calendar}
		 */
		show: function(){
			var me = this;

			if(!me.isInline) {
				if(me.$el.prop('disabled') || me.$el.hasClass('disabled')) { return; }

				$doc.on('mousedown.calendar', function (e) {
					if((me.$input && me.$input[0] !== e.target)
						&& !$.contains(me.$el[0], e.target)
						&& !$.contains(me.$calendar[0], e.target)
						&& me.$el[0] != e.target){
						//e.preventDefault();
						me.close();
					}
				});

				if(!core.isTouch) {
					me._escape();

					/*me.$calendar.off('focusin focusout').on('focusin focusout', (function() {
					 var timer = null;
					 return function(e) {
					 clearTimeout(timer);
					 switch(e.type) {
					 case 'focusout':
					 timer = setTimeout(function() {
					 //me.close();
					 }, 200);
					 break;
					 }
					 };
					 })());*/
				}

				me.$calendar.show(); //showLayer({opener: me.$el});
				me._trigger('shown');
			}

			return me;
		},

		/**
		 * esc 키를 누르면 닫히도록 이번트 바인딩
		 * @private
		 */
		_escape: function() {
			var me = this;

			me.$calendar.add(me.$el).add(me.$input)
				.off('keyup.calendar').on('keyup.calendar', function(e) {
					if(e.keyCode === core.keyCode.ESCAPE) {
						me.close();
						$(me.opener).focus();
					}
				});
		},

		/**
		 * DOM 삭제
		 * @returns {Calendar}
		 */
		_remove: function() {
			var me = this;

			if(me.$calendar){
				me.$selectboxYears.scSelectbox('release');
				me.$calendar.off();
				me.$calendar.remove();
				me.$calendar = null;
			}

			return me;
		},

		/**
		 * 렌더링
		 */
		_render: function() {
			var me = this,
				opts = me.options,
				timer, tmpl;

			if (!dateUtil.isValid(me.currDate)) { me.currDate = dateUtil.parse(me.options.date); }
			if (me.currDate < me.minDate) { me.currDate = core.clone(me.minDate); }
			if (me.currDate > me.maxDate) { me.currDate = core.clone(me.maxDate); }

			tmpl = '<div class="ui-calendar-container"><div class="ui-select-day">' +
				(opts.header !== false ? opts.template.header : '') +
				'<div class="ui-calendar-date"></div></div></div>';

			me._remove();
			me.$calendar = $(tmpl);

			if(opts.header) {
				me.$calendar.on('change', '.sel_years', function (e) {
					var date = core.clone(me.currDate);
					date.setYear(this.value|0);
					me.setCurrentDate(date);
				});
			}

			if(me.isInline) {
				// 인라인
				me.$el.empty().append(me.$calendar);
				me.$el.find('.ui-calendar-close').remove();
			} else {
				// 모달
				me.$calendar.css({
					position: 'absolute',
					backgroundColor: '#fff',
					zIndex: 9999
				});
				if (me.options.where === 'body') {
					$('body').append(me.$calendar);
				} else {
					me.$el.parent().append(me.$calendar);
				}
			}

			me.$calendar.off('.calendar')
				.on('click.calendar', '.ui-calendar-prev, .ui-calendar-next', function(e){
					// 이전 / 다음
					e.preventDefault();
					if(me.$el.hasClass('disabled')){ return; }

					var $el = $(e.currentTarget),
						isPrev = $el.hasClass('ui-calendar-prev');

					me[isPrev ? 'prev' : 'next']();
					me.$calendar.find('.ui-calendar-' + (isPrev?'prev':'next')).focus();
				})
				.on('click.calendar', '.ui-calendar-day:not(.disabled)', function(e) {
					// 날짜 클릭
					e.preventDefault();
					if (me.$el.hasClass('disabled')) {
						return;
					}

					if (me.options.holidaysAlertCode !== '' && ($(this).parent().hasClass('ui-calendar-holiday') || $(this).parent().hasClass('ui-calendar-sunday') || $(this).parent().hasClass('ui-calendar-saturday'))) {
						core.showMessage(me.options.holidaysAlertCode);
						return;
					}

					var $this = $(this).closest('td'),
						data = $this.data(),
						date = new Date(data.year, data.month - 1, data.day),
						format = dateUtil.format(date, opts.format || ''),
						e,
						evtData = {
							target: this,
							year: $this.data('year'),
							month: $this.data('month'),
							day: $this.data('day'),
							value: format,
							date: date,
							calendar: me.$calendar[0]
						};


					e = $.Event('calendarselected');
					e.target = e.currentTarget = this;
					me[opts.isBubble ? 'trigger' : 'triggerHandler'](e, evtData);
					if (e.isDefaultPrevented()) {
						return;
					}

					if (opts.inputTarget) {
						me.$input.val(format);
						e = $.Event('calendarinsertdate');
						e.target = e.currentTarget = this;
						me.$input[opts.isBubble ? 'trigger' : 'triggerHandler'](e, evtData);
						/*if (e.isDefaultPrevented()) {
						 return;
						 }*/
					}

					if (me.isInline && opts.isClickActive !== false) {
						me.$calendar.find('.ui-calendar-active').removeClass('ui-calendar-active');
						$this.addClass('ui-calendar-active');
					}
					if (!me.isInline) {
						me.close();
						me.$input.focus();
					}
				})
				.on('click.calendar', '.ui-calendar-set-today', function(e) {
					// 오늘 클릭
					e.preventDefault();
					me.activeDate = core.clone(me.options.today);
					me.currDate = core.clone(me.options.today);

					// 달력 그리기
					me._renderDate();
				})
				.on('click.calendar', '.ui-calendar-close', function(e) {
					// 닫기 클릭
					e.preventDefault();

					me.close();
					$(me.opener).focus();
				})
				.on('mouseenter.calendar mouseleave.calendar', 'td.ui-calendar-cell:not(.disabled)', function (e) {
					$(this).toggleClass('active', e.type === 'mouseenter');
				})
				.on('mouseenter.calendar mouseleave.calendar', '.ui-calendar-table tbody', function (e) {
					$(this).toggleClass('ui-calendar-over', e.type === 'mouseenter');
				});

			me._renderHeader();
			me._renderDate();
			me._enforceFocus();

			return me;
		},

		update: function () {
			if (!this.isShown) { return; }
			this._render();
			this._reposition();
		},

		/**
		 * 헤더에 현재 날짜에 대한 정보 표시
		 * @private
		 */
		_renderHeader: function(){
			var me = this,
				opts = me.options;

			if(!opts.header) { return; }

			me.$calendar.find('.ui-calendar-header-first').css('z-index', 1);
			me.$selectboxYears = me.$calendar.find('.sel_years');
			for(var i = me.minDate.getFullYear(); i <= me.maxDate.getFullYear(); i++) {
				me.$selectboxYears[0].options.add(new Option(i, i));
			}

			// 일달력(.ui-calendar-header-first)의 년도 선택 버튼에 년도 설정
			me.$selectboxYears.scSelectbox('option', 'preventZindex', true);
			me.$selectboxYears.scSelectbox('value', me.currDate.getFullYear(), false);

			// 일달력(.ui-calendar-header-second)의 월선택 버튼에 월 설정
			var currDate = new Date(me.currDate.getTime()), html,
				$second = me.$calendar.find('.ui-calendar-header-second'),
				isFirst = currDate.getFullYear() === me.minDate.getFullYear() && currDate.getMonth() === me.minDate.getMonth(),
				isLast = currDate.getFullYear() === me.maxDate.getFullYear() && currDate.getMonth() === me.maxDate.getMonth();

			currDate = core.date.calcDate(currDate, '-1M');
			$second.children().each(function (val, name) {
				html = '<span class="hide">'+currDate.getFullYear()+'년</span>';
				html += core.number.zeroPad(currDate.getMonth() + 1, 2);
				if(val === 1) {
					html += '<span class="hide">월이 선택됨</span>';
				} else {
					html += '<span class="hide">월로 이동</span>';
				}
				$(this).html(html);
				currDate = core.date.calcDate(currDate, '1M');
			});

			$second.find('.ui-calendar-prev').css({outline: 'none'}).toggleClass('disabled', isFirst).attr('tabindex', isFirst ? '-1' : '0');
			$second.find('.ui-calendar-next').css({outline: 'none'}).toggleClass('disabled', isLast).attr('tabindex', isLast ? '-1' : '0');
		},

		/**
		 * 해제 메소드
		 */
		release: function() {
			var me = this;

			me.$input && me.$input.removeData('calendar');
			me._remove();
			me.close();
			me.supr();
		},

		/**
		 * 주어진 월이 유효한 범위에 있는가 체크
		 * @param date
		 * @returns {*}
		 * @private
		 */
		_compareMonth: function(date) {
			var me = this;
			date = core.clone(date);
			date.setDate(me.minDate.getDate());
			date.setHours(0, 0, 0, 0);

			if (date.getTime() < me.minDate.getTime()) { return -1; }
			date.setDate(me.maxDate.getDate());
			if (date.getTime() > me.maxDate.getTime()) { return 1; }
			return 0;
		},

		/**
		 * 주어진 날짜가 유효한 범위에 있는가 체크
		 * @param date
		 * @returns {*}
		 * @private
		 */
		_compareDate: function (date) {
			var me = this;
			if (!(date instanceof Date)) {
				date = dateUtil.parse(date);
			}
			if (!date || isNaN(date)){ return null; }
			date.setHours(0, 0, 0, 0);

			if (date.getTime() < me.minDate.getTime()) { return -1; }
			if (date.getTime() > me.maxDate.getTime()) { return 1; }
			return 0;
		},

		/**
		 * 표시할 날짜 설정
		 * @param date
		 */
		setCurrentDate: function (date) {
			if (!(date instanceof Date)) {
				date = dateUtil.parse(date);
			}
			if (!date || isNaN(date)){ return; }
			var me = this,
				result = me._compareMonth(date);
			if (result < 0) {
				date.setYear(me.minDate.getFullYear());
				date.setMonth(me.minDate.getMonth());
			} else if(result > 0) {
				date.setYear(me.maxDate.getFullYear());
				date.setMonth(me.maxDate.getMonth());
			}
			me.currDate = date;
			if (me.isShown) {
				me._renderDate();
			}
		},

		/**
		 * 달력 그리기
		 * @returns {Calendar}
		 * @private
		 */
		_renderDate: function() {
			var me = this,
				opts = me.options,
				beforeRenderDay = opts.beforeRenderDay,
				date = me._getDateList(me.currDate),
				html = '',
				tmpl = core.template(opts.template[opts.type] || opts.template.button),
				isHoliday = false,
				isToday = false,
				isSelectDay = false,
				isOtherMonth = false,
				isDisabled = false,
				i, j, y, m, d, week, len, cell, nowd;

			html += '<table class="ui-calendar-table" border="0"><caption>'+opts.caption+'</caption>';
			html += '<colgroup>';
			for(i = 0; i < 7; i++) {
				html += '<col width="'+opts.colWidth+'" />';
			}
			html += '</colgroup><thead>';
			for(i = 0; i < 7; i++) {
				html += '<th class="ui-calendar-dayname ' + (i === 0 ? ' ui-calendar-sunday' : i === 6 ? ' ui-calendar-saturday' : '') + '" scope="col">';
				html += opts.weekNames[i];
				html += '</th>';
			}
			html += '</thead><tbody>';
			for(i = 0, len = date.length; i < len; i++) {
				week = date[i];

				html += '<tr>';
				for(j = 0; j < 7; j++) {
					y = week[j].year, m = week[j].month, d = week[j].day;
					nowd = new Date(y, m - 1, d);

					if (me.activeDate) {
						isSelectDay = me.activeDate.getFullYear() === y && me.activeDate.getMonth() + 1 === m && me.activeDate.getDate() === d;
					}
					isToday = opts.today.getFullYear() === y && opts.today.getMonth() + 1 === m && opts.today.getDate() === d;
					isOtherMonth = (me.currDate.getMonth() + 1) != m;
					isDisabled = (me._compareDate(nowd) !== 0) || (opts.weekendDisabled && (j === 0 || j === 6));
					isHoliday = me._isHoliday(y, m, d);

					if(beforeRenderDay){
						cell = beforeRenderDay.call(me, y, m, d, {
								isSaturday: j === 6,
								isSunday: j === 0,
								isHoliday: isHoliday,
								isToday: isToday,
								isOtherMonth: isOtherMonth}) || {cls:'', html:'', disabled:''};
					} else {
						cell = {cls:'', html:'', disabled:''};
					}
					cell.cls = '';

					html += '<td class="ui-calendar-'+ dateUtil.format(nowd, 'yyyyMMdd') + ' ui-calendar-cell' + (isDisabled?" disabled":"");
					if(opts.showOtherMonths && isOtherMonth || !isOtherMonth) {
						html += (isHoliday ? ' ui-calendar-holiday' : '')
							+ (j === 0 ? ' ui-calendar-sunday' : j === 6 ? ' ui-calendar-saturday' : '')
							+ (isToday ? ' ui-calendar-today' : '')
							+ (!isDisabled && isSelectDay ? ' ui-calendar-active' : '');
					}
					html += (isOtherMonth ? ' ui-calendar-other' : '')
						+ cell.cls
						+ '" data-year="'+y+'" data-month="'+m+'" data-day="'+d+'">';

					if(!isOtherMonth || opts.showOtherMonths) {
						if (cell.html) {
							html += cell.html;
						} else {
							html += tmpl({
								title: dateUtil.format(nowd, opts.titleFormat) + (isToday ? ' 오늘' : '') + (isDisabled ? " 선택할 수 없음": (isSelectDay ? ' 선택일' : '')),
								isHoliday: isHoliday,
								isToday: isToday,
								isOtherMonth: isOtherMonth,
								isSunday: j === 0,
								isSaturday: j === 6,
								day: d,
								date: nowd,
								disabled: isDisabled
							});
						}
					} else {
						html += '&nbsp;';
					}
					html += '</td>';
				} // for
				html += '</tr>';
			} // for
			html += '</tbody></table>';

			me.$calendar.find('.ui-calendar-date').html(html);
			me.$calendar.find('.ui-calendar-text').text(dateUtil.format(me.currDate, 'yyyy-MM'));

			if(opts.header){
				me._renderHeader();
			}

			return me;
		},

		/**
		 * 화면 갱신
		 */
		refresh: function(){
			this._renderDate();
		},

		/**
		 * 주어진 날짜에 해당하는 dom요소를 반환
		 * @param day
		 * @returns {*}
		 */
		findDateCell: function(day) {
			return this.$calendar.find('.data-'+day.getFullYear()+''+(day.getMonth() + 1)+''+day.getDate());
		},

		/**
		 * 입력요소를 활성화
		 */
		enable: function() {
			var me = this;
			if(!me.options.isInline) {
				me.$input.disabled(false);
			}
			me.$el.disabled(false);
		},

		/**
		 * 입력요소를 비활성화
		 */
		disable: function() {
			var me = this;

			me.close();
			if(me.options.inputTarget) {
				me.$input.disabled(true);
			}
			me.$el.disabled(true);
		},

		/**
		 * 날짜 변경
		 * @param date
		 */
		setDate: function(date, options) {
			if(!date) { return; }
			var me = this;

			if(options) {
				me.options = $.extend(true, me.options, me.$el.data(), options);
				me._normalizeOptions();
			}

			try {
				if (dateUtil.isValid(date)) {
					me.activeDate = dateUtil.parse(date);
				} else {
					return;
					//me.activeDate = new Date();
				}
				me.currDate = core.clone(me.activeDate);
				if (me.isShown) {
					me.setCurrentDate(core.clone(me.currDate));
				}
			} catch(e) {
				throw new Error('Calendar#setDate(): 날짜 형식이 잘못 되었습니다.');
			}
			return this;
		},

		/**
		 * 오늘날짜 변경
		 * @param today
		 */
		setToday: function(today) {
			var me = this;

			if(!core.is(today, 'date')) {
				try {
					me.options.today = core.date.parse(today)
				} catch(e) {
					throw new Error('calendar#setToday: 날짜 형식이 잘못 되었습니다.')
				}
			}
			me._renderDate();
		},

		/**
		 * 오늘날짜 반환
		 * @returns {Date} 오늘날짜
		 */
		getToday: function() {
			return this.options.today;
		},

		/**
		 * 현재 날짜를 반환
		 * @returns {*}
		 */
		getCurrentDate: function() {
			return this.currDate;
		},

		/**
		 * 이전달
		 * @returns {Calendar}
		 */
		prev: function(){
			var me = this,
				currDate = core.date.add(me.currDate, 'M', -1);
			if(me.options.header && me._compareMonth(currDate) !== 0){ return this; }
			me.currDate = currDate;
			me._renderDate();

			return this;
		},

		/**
		 * 다음달
		 * @returns {Calendar}
		 */
		next: function() {
			var me = this,
				currDate = core.date.add(me.currDate, 'M', 1);
			if(me.options.header && me._compareMonth(currDate) !== 0){ return this; }
			me.currDate = currDate;
			me._renderDate();

			return this;
		},

		/**
		 * 날짜 데이타 계산
		 * @param {Date} date 렌더링할 날짜 데이타 생성
		 * @return {Array}
		 */
		_getDateList: function (date) {
			date.setDate(1);

			var me = this,
				month = date.getMonth() + 1,
				year = date.getFullYear(),
				startOnWeek = date.getDay() + 1,
				last = daysInMonth[date.getMonth()],    // 마지막날
				prevLast = daysInMonth[date.getMonth() === 0 ? 11 : date.getMonth() - 1], // 이전달의 마지막날
				startPrevMonth = prevLast - startOnWeek,// 이전달의 시작일
				y = year, m = month;

			if (month > 12) {
				month -= 12, year += 1;
			} else {
				if (month == 2 && me._isLeapYear(year)) {
					last = 29;
				}
			}

			var data = [],
				week = [];

			if (startOnWeek > 0) {
				if (month == 3 && me._isLeapYear(year)) {
					startPrevMonth += 1;
				}
				if ((m = month - 1) < 1) {
					m = 12, y = year - 1;
				}
				for (var i = 1; i < startOnWeek; i++) {
					week.push({year: y, month: m, day: startPrevMonth + i + 1});        // ***** +1
				}
				if (week.length > 6) {
					data.push(week), week = [];
				}
			}

			for (var i = 1; i <= last; i++) {
				week.push({year: year, month: month, day: i});
				if (week.length > 6) {
					data.push(week), week = [];
				}
			}

			if (week.length > 0 && week.length < 7) {
				if ((m = month + 1) > 12) {
					m -= 12, y = year + 1;
				}
				for (var i = week.length, d = 1; i < 7; i++, d++) {
					week.push({year: y, month: m, day: d});
				}
			}
			week.length && data.push(week);
			return data;
		},

		/**
		 * 다음달
		 * @returns {Calendar}
		 */
		_enforceFocus: function() {
			var me = this,
				isKeyDown = false;

			$doc.off('keydown.calendar keyup.calendar')
				.on('keydown.calendar keyup.calendar', function(e) {
					isKeyDown = e.type === 'keydown';
				})
				.off('focusin.calendar')
				.on('focusin.calendar', me.proxy(function(e) {
					if (!isKeyDown) { return; }
					if(me.$calendar[0] !== e.target && !$.contains(me.$calendar[0], e.target)) {
						me.$calendar.find('div:visible').find(':focusable').first().focus();
						e.stopPropagation();
					}
				}));
		},

		/**
		 * 윤년 여부
		 * @param {Date} date 렌더링할 날짜 데이타 생성
		 * @return {boolean} 윤년 여부
		 */
		_isLeapYear: function (year) {
			return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0))
		}
	});
	///////////////////////////////////////////////////////////////////////////////////////

	// 768이하에서 풀사이즈로 뜨는건 해당 사이트에서만 사용되는 기능이므로,
	// 달력 코드내에 삽입하지 말고 이렇게 외부에서 이벤트로 처리.(달력에는 달력고유의 기능만 있어야 함)
	core.ui.setDefaults('Calendar', {
		on: {
			'calendarshown': function(e) {
				var instance = $(this).scCalendar('instance'),
					oldMode = !core.isMobileMode() ? 'pc' : 'mobile';

				// 뜰 때 부모요소들의 zIndex를 같이 올려줌
				$(this).parentsUntil('#wrap').filter(function(i){
					return $(this).css('position') === 'relative';
				}).addClass('zindex');

				$win.on('resizeend.' + instance.cid + ' changemediasize_.' + instance.cid, function(){
					//instance._reposition();
					instance.close();
				});
			},
			'calendarhidden': function(e){
				var instance = $(this).scCalendar('instance'),
					$el = $(this);

				$el.parents('.zindex').removeClass('zindex');
				$el.parent().css('position', '');
				$win.off('.' + instance.cid);
			}
		}
	});

	if (typeof define === "function" && define.amd) {
		define([], function() {
			return Calendar;
		});
	}

	core.importJs.define('modules/calendar', Calendar);

})(jQuery, window[LIB_NAME]);


/*!
 * @module scui.ui.SmoothScroll
 * @author 김승일 책임(comahead@vinylc.com)
 * momentum benchmark: iScroll v5.1.2 ~ (c) 2008-2014 Matteo Spinelli ~ http://cubiq.org/license
 */
(function ($, core, undefined) {
	"use strict";
	if (core.ui.SmoothScroll) { return; }

	var rAF = window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function (callback) {
			window.setTimeout(callback, 1000 / 60);
		};
	var _elementStyle = document.createElement('div').style;
	var _vendor = (function () {
		var vendors = ['t', 'webkitT', 'MozT', 'msT', 'OT'],
			transform,
			i = 0,
			l = vendors.length;

		for (; i < l; i++) {
			transform = vendors[i] + 'ransform';
			if (transform in _elementStyle) {
				return vendors[i].substr(0, vendors[i].length - 1);
			}
		}

		return false;
	})();

	function _prefixStyle(style) {
		if (_vendor === false) return false;
		if (_vendor === '') return style;
		return _vendor + style.charAt(0).toUpperCase() + style.substr(1);
	}

	var _transform = _prefixStyle('transform');

	var getTime = Date.now || function getTime() {
			return new Date().getTime();
		};

	// 위치와 속도에 따라 이동크기와 걸리는 시간 게산
	var momentum = function (current, start, time, lowerMargin, wrapperSize, deceleration) {
		var distance = current - start,
			speed = Math.abs(distance) / time,
			destination,
			duration;

		deceleration = deceleration === undefined ? 0.0006 : deceleration;

		destination = current + ( speed * speed ) / ( 2 * deceleration ) * ( distance < 0 ? -1 : 1 );
		duration = speed / deceleration;

		if (destination < lowerMargin) {
			destination = wrapperSize ? lowerMargin - ( wrapperSize / 2.5 * ( speed / 8 ) ) : lowerMargin;
			distance = Math.abs(destination - current);
			duration = distance / speed;
		} else if (destination > 0) {
			destination = wrapperSize ? wrapperSize / 2.5 * ( speed / 8 ) : 0;
			distance = Math.abs(current) + destination;
			duration = distance / speed;
		}

		return {
			destination: Math.round(destination),
			duration: duration
		};
	};

	var browser = {
		hasTransform: _transform !== false,
		hasPerspective: _prefixStyle('perspective') in _elementStyle,
		hasTouch: 'ontouchstart' in window,
		hasPointer: window.PointerEvent || window.MSPointerEvent, // IE10 is prefixed
		hasTransition: _prefixStyle('transition') in _elementStyle
	};

	var easingType = {
		quadratic: {
			style: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
			fn: function (k) {
				return k * ( 2 - k );
			}
		},
		circular: {
			style: 'cubic-bezier(0.1, 0.57, 0.1, 1)',	// Not properly "circular" but this looks better, it should be (0.075, 0.82, 0.165, 1)
			fn: function (k) {
				return Math.sqrt(1 - ( --k * k ));
			}
		},
		back: {
			style: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
			fn: function (k) {
				var b = 4;
				return ( k = k - 1 ) * k * ( ( b + 1 ) * k + b ) + 1;
			}
		},
		bounce: {
			style: '',
			fn: function (k) {
				if (( k /= 1 ) < ( 1 / 2.75 )) {
					return 7.5625 * k * k;
				} else if (k < ( 2 / 2.75 )) {
					return 7.5625 * ( k -= ( 1.5 / 2.75 ) ) * k + 0.75;
				} else if (k < ( 2.5 / 2.75 )) {
					return 7.5625 * ( k -= ( 2.25 / 2.75 ) ) * k + 0.9375;
				} else {
					return 7.5625 * ( k -= ( 2.625 / 2.75 ) ) * k + 0.984375;
				}
			}
		},
		elastic: {
			style: '',
			fn: function (k) {
				var f = 0.22,
					e = 0.4;

				if (k === 0) {
					return 0;
				}
				if (k == 1) {
					return 1;
				}

				return ( e * Math.pow(2, -10 * k) * Math.sin(( k - f / 4 ) * ( 2 * Math.PI ) / f) + 1 );
			}
		}
	};

	var eventType = {
		touchstart: 1,
		touchmove: 1,
		touchend: 1,

		mousedown: 2,
		mousemove: 2,
		mouseup: 2,

		pointerdown: 3,
		pointermove: 3,
		pointerup: 3,

		MSPointerDown: 3,
		MSPointerMove: 3,
		MSPointerUp: 3
	};

	function eventButton(e) {
		if (!e.which && e.button) {
			if (e.button & 1) {return 1; }
			else if (e.button & 4) { return 2; }
			else if (e.button & 2) { return 3; }
		}
		return e.button;
	}

	var style = {
		transform: _transform,
		transitionTimingFunction: _prefixStyle('transitionTimingFunction'),
		transitionDuration: _prefixStyle('transitionDuration'),
		transitionDelay: _prefixStyle('transitionDelay'),
		transformOrigin: _prefixStyle('transformOrigin')
	};

	/**
	 * 부드러운 스크롤러 모듈
	 * @class scui.ui.SmoothScroll
	 * @extends scui.ui.View
	 * @fires scui.ui.SmoothScroll#smoothscrollstart
	 * @fires scui.ui.SmoothScroll#smoothscrollmove미
	 * @fires scui.ui.SmoothScroll#smoothscrollend
	 */
	var SmoothScroll = core.ui('SmoothScroll', {
		bindjQuery: 'smoothScroll',
		defaults: {
			startX: 0,                      // 첫 x 위치
			startY: 0,                      // 첫 y 위치
			scrollX: false,                // 가로스크롤 허용여부
			scrollY: true,                  // 세로스크롤 허용여부
			directionLockThreshold: 5,  //
			scrollByWheel: true,            // 마우스 휠 허용여부
			scrollType: 'style',            // 'scroll', 'style' 중 택일
			mouseWheelSpeed: 20,            // 마우스휠 속도
			momentum: true,                 // 던지는 효과사용

			bounce: true,                   // 튕기는 효과사용
			bounceTime: 600,                // 튕기는 속도
			bounceEasing: '',

			preventDefault: true,
			preventDefaultException: { tagName: /^(INPUT|TEXTAREA|SELECT)$/i },

			HWCompositing: true,            // 하드웨어 가속 사용
			useTransition: true,            // 트랜지션 사용
			useTransform: true,             // 트랜스폼 사용
			resizeRefresh: false,           // 리사이징시에 자동으로 레이아웃사이즈를 재계산 할 것인가
			resizePolling: 60,               // 재계산 최소 시간

			snap: ''                          // 스냅대상 셀렉터
		},
		selectors: {
			//wrapper: '.ui_wrapper',
			scroller: '.ui_scroller'
		},
		/**
		 * 생성자
		 * @param {string} el
		 * @param {Object} options
		 */
		initialize: function(el, options) {
			var me = this, opts;
			if (me.supr(el, options) === false) { return; }
			if (!me.$scroller[0]){ return; }

			opts = me.options;
			me.$wrapper = me.$el;
			me.isBadAndroid = /Android /.test(window.navigator.appVersion) && !(/Chrome\/\d/.test(window.navigator.appVersion));
			me.translateZ = opts.HWCompositing && browser.hasPerspective ? ' translateZ(0)' : '';
			opts.useTransition = browser.hasTransition && opts.useTransition && opts.scrollType === 'style';
			opts.useTransform = browser.hasTransform && opts.useTransform;
			opts.eventPassthrough = opts.eventPassthrough === true ? 'vertical' : opts.eventPassthrough;
			opts.preventDefault = !opts.eventPassthrough && opts.preventDefault;
			opts.scrollY = opts.eventPassthrough == 'vertical' ? false : opts.scrollY;
			opts.scrollX = opts.eventPassthrough == 'horizontal' ? false : opts.scrollX;
			opts.freeScroll = opts.freeScroll && !opts.eventPassthrough;
			opts.directionLockThreshold = opts.eventPassthrough ? 0 : opts.directionLockThreshold;
			opts.bounceEasing = typeof opts.bounceEasing == 'string' ? easingType[opts.bounceEasing] || easingType.circular : opts.bounceEasing;
			opts.invertWheelDirection = opts.invertWheelDirection ? -1 : 1;  // 마우스휠 반대 방향

			me._startX = 0;
			me._startY = 0;
			me.x = 0;   // 현재 x 위치
			me.y = 0;   // 현재 y 위치
			me.directionX = 0;
			me.directionY = 0;
			me.scrollerStyle = me.$scroller[0].style;

			if (opts.snap) {
				// 스냅대상 검색
				me.$snapItems = me.$(opts.snap);
			}

			me._init();
			me.refresh();

			me.scrollTo(opts.startX, opts.startY);
			me.enable();
		},

		/**
		 * 활성화
		 */
		enable: function(){
			this.isEnabled = true;
		},

		/**
		 * 비활성화
		 * @param flag
		 */
		setDisabled: function (flag) {
			this.isEnabled = !flag;
		},

		/**
		 * 초기 작업
		 * @private
		 */
		_init: function() {
			this._initEvents();
		},

		/**
		 * 이벤트 바인딩
		 * @private
		 */
		_initEvents: function() {
			var me = this;

			me._handle(me.$wrapper, 'mousedown');
			me._handle(me.$wrapper, 'touchstart');
			me._handle(me.$wrapper, 'selectstart');
			me._handle(me.$wrapper, 'dragstart');
			me._handle(me.$wrapper, 'click');

			if(me.options.useTransition) {
				me._handle(me.$scroller, 'transitionend');
				me._handle(me.$scroller, 'webkitTransitionEnd');
				me._handle(me.$scroller, 'oTransitionEnd');
				me._handle(me.$scroller, 'MSTransitionEnd');
			}

			if (me.options.scrollByWheel){
				me._initWheel();
			}

			if (me.options.resizeRefresh) {
				$(window).on('resize.' + me.cid, function (){
					me.refresh();
				});
			}
		},

		/**
		 * 마우스휠 이벤트 바인딩
		 * @private
		 */
		_initWheel: function () {
			var me = this;

			me._handle(me.$wrapper, 'wheel');
			me._handle(me.$wrapper, 'mousewheel');
			me._handle(me.$wrapper, 'DOMMouseScroll');
		},

		/**
		 * 휠이벤트 핸들러
		 * @param e
		 * @private
		 */
		_wheel: function (e) {
			var me = this;
			if ( !me.isEnabled ) {
				return;
			}

			e.preventDefault ? e.preventDefault() : e.returnValue = false;
			e.stopPropagation ? e.stopPropagation() : e.cancalBubble = true;

			var wheelDeltaX, wheelDeltaY,
				newX, newY;

			if ( me.wheelTimeout === undefined ) {
				me._startX = me.x;
				me._startY = me.y;
				var ev = $.Event('smoothscrollstart');
				me.triggerHandler(ev, {x: me.x, y: me.y});
				if (ev.isDefaultPrevented()) {
					return;
				}
			}

			clearTimeout(me.wheelTimeout);
			me.wheelTimeout = setTimeout(function () {
				me._triggerEnd();
				me.wheelTimeout = undefined;
			}, 400);

			e = e.originalEvent || e;
			if ( 'deltaX' in e ) {
				if (e.deltaMode === 1) {
					wheelDeltaX = -e.deltaX * me.options.mouseWheelSpeed;
					wheelDeltaY = -e.deltaY * me.options.mouseWheelSpeed;
				} else {
					wheelDeltaX = -e.deltaX;
					wheelDeltaY = -e.deltaY;
				}
			} else if ( 'wheelDeltaX' in e ) {
				wheelDeltaX = e.wheelDeltaX / 120 * me.options.mouseWheelSpeed;
				wheelDeltaY = e.wheelDeltaY / 120 * me.options.mouseWheelSpeed;
			} else if ( 'wheelDelta' in e ) {
				wheelDeltaX = wheelDeltaY = e.wheelDelta / 120 * me.options.mouseWheelSpeed;
			} else if ( 'detail' in e ) {
				wheelDeltaX = wheelDeltaY = -e.detail / 3 * me.options.mouseWheelSpeed;
			} else {
				return;
			}

			wheelDeltaX *= me.options.invertWheelDirection;
			wheelDeltaY *= me.options.invertWheelDirection;

			if ( !me.hasVerticalScroll ) {
				wheelDeltaX = wheelDeltaY;
				wheelDeltaY = 0;
			}

			newX = me.x + Math.round(me.hasHorizontalScroll ? wheelDeltaX : 0);
			newY = me.y + Math.round(me.hasVerticalScroll ? wheelDeltaY : 0);

			if ( newX > 0 ) {
				newX = 0;
			} else if ( newX < me.maxScrollX ) {
				newX = me.maxScrollX;
			}

			if ( newY > 0 ) {
				newY = 0;
			} else if ( newY < me.maxScrollY ) {
				newY = me.maxScrollY;
			}

			me.scrollTo(newX, newY, 0);
		},

		/**
		 * el에 eventName 이벤트 바인딩
		 * @param {jQuery} $el
		 * @param {string} eventName
		 * @param {boolean} isBind
		 * @private
		 */
		_handle: function($el, eventName, isBind) {
			var me = this;
			if(isBind !== false) {
				$el.on(eventName+'.'+me.cid, me.handleEvent.bind(me));
			} else {
				$el.off(eventName+'.'+me.cid);
			}
		},

		/**
		 * 이벤트 핸들러
		 * @param e
		 */
		handleEvent: function(e) {
			var me = this;

			switch(e.type) {
				case 'mousedown':
				case 'touchstart':
					if (me.moved) {
						e.preventDefault();
					}
					me._start(e);
					break;
				case 'selectstart':
				case 'dragstart':
					e.preventDefault ? e.preventDefault : e.returnValue = false;
					break;
				case 'mousemove':
				case 'touchmove':
					me._move(e);
					break;
				case 'mouseup':
				case 'mousecancel':
				case 'touchend':
				case 'touchcancel':
					me._end(e);
					break;
				case 'transitionend':
				case 'webkitTransitionEnd':
				case 'oTransitionEnd':
				case 'MSTransitionEnd':
					me._transitionEnd(e);
					break;
				case 'wheel':
				case 'mousewheel':
				case 'DOMMouseScroll':
					me._wheel(e);
					break;
				case 'click':
					if (me.moved) {
						e.preventDefault();
						e.stopPropagation();
					} else {
						me._click(e);
					}
					break;
			}
		},

		/**
		 * 현재 위치 조회
		 * @returns {{x: *, y: *}}
		 */
		getPosition: function () {
			var x, y;

			if (this.options.scrollType === 'style') {
				var pos = core.dom.position(this.$scroller);
				x = pos.x;
				y = pos.y;
			} else if (this.options.scrollType === 'scroll') {
				x = -this.$scroller.parent().scrollLeft();
				y = -this.$scroller.parent().scrollTop();
			}
			return { x: x, y: y };
		},

		/**
		 * 애니메이션
		 * @param {number} destX
		 * @param {number} destY
		 * @param {number} duration
		 * @param {function} easingFn
		 * @private
		 */
		_animate: function (destX, destY, duration, easingFn) {
			var me = this,
				startX = this.x,
				startY = this.y,
				startTime = getTime(),
				destTime = startTime + duration;

			function step () {
				var now = getTime(),
					newX, newY,
					easing;

				if ( now >= destTime ) {
					me.isAnimating = false;
					me._translate(destX, destY);

					if (!me.resetPosition(me.options.bounceTime) ) {
						me._triggerEnd();
					}

					return;
				}

				now = ( now - startTime ) / duration;
				easing = easingFn(now);
				newX = ( destX - startX ) * easing + startX;
				newY = ( destY - startY ) * easing + startY;
				me._translate(newX, newY);

				if ( me.isAnimating ) {
					rAF(step);
				}
			}

			this.isAnimating = true;
			step();
		},
		/**
		 * 애니메이션 시간 설정
		 * @param {number} time
		 * @private
		 */
		_transitionTime: function (time) {
			if (!this.options.useTransition) { return; }

			time = time || 0;
			this.scrollerStyle[style.transitionDuration] = time + 'ms';

			/*if ( !time && utils.isBadAndroid ) {
			 this.scrollerStyle[style.transitionDuration] = '0.001s';
			 }*/

		},
		/**
		 * easing  설정
		 * @param {string} easing
		 * @private
		 */
		_transitionTimingFunction: function (easing) {
			if (!this.options.useTransition) { return; }

			this.scrollerStyle[style.transitionTimingFunction] = easing;
		},

		/**
		 * 이동
		 * @param {number} x
		 * @param {number} y
		 * @private
		 */
		_translate: function (x, y) {
			var me = this;

			var ev = $.Event('smoothscrollmove');
			me.triggerHandler(ev, {x: x, y: y});
			if (ev.isDefaultPrevented()) {
				return;
			}

			if ( me.options.scrollType === 'style') {
				if (me.options.useTransform) {
					me.scrollerStyle[style.transform] = 'translate(' + x + 'px,' + y + 'px)' + me.translateZ;
				} else {
					x = Math.round(x);
					y = Math.round(y);
					me.scrollerStyle.left = x + 'px';
					me.scrollerStyle.top = y + 'px';
				}
			} else if (me.options.scrollType === 'scroll') {
				me.$scroller.parent().scrollLeft(-x);
				me.$scroller.parent().scrollTop(-y);
			}

			me.scrollSizeX = me.x - x;
			me.scrollSizeY = me.y - y;
			me.x = x;
			me.y = y;
			//me.triggerHandler('smoothscrollmove', {x: me.x, y: me.y});
		},

		/**
		 * 튕기는 효과
		 * @param time
		 * @returns {boolean}
		 */
		resetPosition: function (time) {
			var me = this,
				x = me.x,
				y = me.y;

			time = time || 0;

			if ( !me.hasHorizontalScroll || me.x > 0 ) {
				x = 0;
			} else if ( me.x < me.maxScrollX ) {
				x = me.maxScrollX;
			}

			if ( !me.hasVerticalScroll || me.y > 0 ) {
				y = 0;
			} else if ( me.y < me.maxScrollY ) {
				y = me.maxScrollY;
			}

			if ( x == me.x && y == me.y ) {
				return false;
			}

			me.scrollTo(x, y, time, me.options.bounceEasing);

			return true;
		},

		/**
		 * 이전으로 스크롤
		 * @param {string} dir 'x', 'y'
		 * @param {number} time
		 * @param {function} easing
		 */
		scrollPrev: function (dir, time, easing) {
			var me = this,
				x = 0, y = 0;

			if (dir === 'x') {
				x = Math.min(0, me.x + me.wrapperWidth);
			} else {
				y = Math.min(0, me.y + me.wrapperHeight);
			}

			me.scrollTo(x, y, time, easing);
		},

		/**
		 * 이후로 스크롤
		 * @param {string} dir 'x', 'y'
		 * @param {number} time
		 * @param {function} easing
		 */
		scrollNext: function (dir, time, easing) {
			var me = this,
				x = 0, y = 0;

			if (dir === 'x') {
				x = Math.max(me.maxScrollX, me.x - me.wrapperWidth);
			} else {
				y = Math.max(me.maxScrollY, me.y - me.wrapperHeight);
			}

			me.scrollTo(x, y, time, easing);
		},

		/**
		 * 지정한 위치로 스크롤링
		 * @param {number} x
		 * @param {number} y
		 * @param {float} time
		 * @param easing
		 */
		scrollTo: function (x, y, time, easing) {
			var me = this;
			easing = easing || easingType.circular;

			if (typeof x === 'string') {
				if (/^-=/.test(x)) {
					x = me.x - parseInt(x.substr(2), 10);
				} else if (/^\+=/.test(x)) {
					x = me.x + parseInt(x.substr(2));
				}
			}

			if (typeof y === 'string') {
				if (/^-=/.test(y)) {
					y = me.y - parseInt(y.substr(2), 10);
				} else if (/^\+=/.test(y)) {
					y = me.y + parseInt(y.substr(2), 10);
				}
			}

			if (!me.options.momentum) {
				x = Math.max(me.maxScrollX, Math.min(x, 0));
				y = Math.max(me.maxScrollY, Math.min(y, 0));
			}
			me.isInTransition = me.options.useTransition && time > 0;

			if ( !time || (me.options.useTransition && easing.style) ) {
				me._transitionTimingFunction(easing.style);
				me._transitionTime(time);
				me._translate(x, y);
			} else {
				me._animate(x, y, time, easing.fn);
			}
		},

		/**
		 * el이 위치한 곳으로 스크롤링
		 * @param {Element} el
		 * @param {float} time
		 * @param {number} offsetX
		 * @param {number} offsetY
		 * @param easing
		 */
		scrollToElement: function (el, time, offsetX, offsetY, easing) {
			var me = this;
			el = el.nodeType ? el : me.$scroller.find(el);

			if ( !el ) {
				return;
			}

			var pos = $(el).position();
			pos.left *= -1;
			pos.top *= -1;

			/*pos.left -= me.wrapperOffset.left;
			 pos.top  -= me.wrapperOffset.top;

			 // if offsetX/Y are true we center the element to the screen
			 if ( offsetX === true ) {
			 offsetX = Math.round(el.offsetWidth / 2 - me.$wrapper.offsetWidth / 2);
			 }
			 if ( offsetY === true ) {
			 offsetY = Math.round(el.offsetHeight / 2 - me.$wrapper.offsetHeight / 2);
			 }

			 pos.left -= offsetX || 0;
			 pos.top  -= offsetY || 0;*/

			pos.left = pos.left > 0 ? 0 : pos.left < me.maxScrollX ? me.maxScrollX : pos.left;
			pos.top  = pos.top  > 0 ? 0 : pos.top  < me.maxScrollY ? me.maxScrollY : pos.top;

			time = time === undefined || time === null || time === 'auto' ? Math.max(Math.abs(me.x-pos.left), Math.abs(me.y-pos.top)) : time;

			me.scrollTo(pos.left, pos.top, time, easing);
		},

		_isDragable: function(el){
			if (core.browser.isTouch) { return true; }

			if(el && el.tagName && this.options.preventDefaultException.tagName.test(el.tagName)){
				return false;
			} else {
				return true;
			}
		},

		/**
		 * pc에서 드래그후의 클릭이벤트를 무효화
		 * @param e
		 * @private
		 */
		_click: function(e) {

			var me = this,
				point = core.dom.getEventPoint(e);

			if(!(me.downX === point.x && me.downY === point.y)) {
				e.preventDefault ? e.preventDefault() : e.returnValue = false;
				e.stopPropagation ? e.stopPropagation() : e.cancalBubble = true;
			}
		},

		/**
		 * 터치 스타트 핸들러
		 * @param ev
		 * @private
		 */
		_start: function(ev) {
			var me = this;
			var e = ev.originalEvent || ev;

			if ( eventType[e.type] != 1 ) {
				if (core.dom.getMouseButton(e) !== 'left') {
					return;
				}
			}

			// 160113_삭제 버튼 미동작 - 버튼 클래스에 input_del이 있는 경우 무시
			if ((!me.isEnabled || (me.initiated && eventType[e.type] !== me.initiated)) && !$(ev.target).hasClass('input_del')) {
				return;
			}

			var $doc = $(document),
				point = core.dom.getEventPoint(e),
				pos;

			/***if(!me._isDownable($(e.target).closest(':focusable').get(0))) {
                e.preventDefault ? e.preventDefault() : e.returnValue = false;
            }***/
			if (!me._isDragable(ev.target)) {
				return;
			}

			me._handle($doc, 'mousemove');
			me._handle($doc, 'touchmove');
			me._handle($doc, 'touchend');
			me._handle($doc, 'mouseup');
			me._handle($doc, 'mousecancel');
			me._handle($doc, 'tocuchcancel');

			me.initiated	= eventType[e.type];
			me.moved		= false;
			me.distX		= 0;
			me.distY		= 0;
			me.directionX = 0;
			me.directionY = 0;
			me.directionLocked = 0;

			me._transitionTime();

			me.startTime = getTime();
			if ( me.options.useTransition && me.isInTransition ) {
				me.isInTransition = false;
				pos = me.getPosition();
				me._translate(Math.round(pos.x), Math.round(pos.y));
				me._triggerEnd();
			} else if ( !me.options.useTransition && me.isAnimating ) {
				me.isAnimating = false;
				me._triggerEnd();
			}

			me.startX    = me.x;
			me.startY    = me.y;
			me.absStartX = me.x;
			me.absStartY = me.y;
			me.pointX    = me.downX = point.x;
			me.pointY    = me.downY = point.y;
		},

		/**
		 * 터치무브 핸들러
		 * @param e
		 * @private
		 */
		_move: function(e) {
			var me = this;

			e = e.originalEvent || e;
			if ( !me.isEnabled || eventType[e.type] !== me.initiated ) {
				return;
			}

			if ( me.options.preventDefault ) {	// increases performance on Android? TODO: check!
				e.preventDefault ? e.preventDefault() : e.defaultValue = false;
			}

			var point		= core.dom.getEventPoint(e),
				deltaX		= point.x - me.pointX,
				deltaY		= point.y - me.pointY,
				timestamp	= getTime(),
				newX, newY,
				absDistX, absDistY;


			me.pointX		= point.x;
			me.pointY		= point.y;

			me.distX		+= deltaX;
			me.distY		+= deltaY;
			absDistX		= Math.abs(me.distX);
			absDistY		= Math.abs(me.distY);

			// We need to move at least 10 pixels for the scrolling to initiate
			if ( timestamp - me.endTime > 300 && (absDistX < 10 && absDistY < 10) ) {
				return;
			}

			// If you are scrolling in one direction lock the other
			if ( !me.directionLocked && !me.options.freeScroll ) {
				if ( absDistX > absDistY + me.options.directionLockThreshold ) {
					me.directionLocked = 'h';		// lock horizontally
				} else if ( absDistY >= absDistX + me.options.directionLockThreshold ) {
					me.directionLocked = 'v';		// lock vertically
				} else {
					me.directionLocked = 'n';		// no lock
				}
			}


			if ( me.directionLocked == 'h' ) {
				if ( me.options.eventPassthrough == 'vertical' ) {
					e.preventDefault ? e.preventDefault() : e.defaultValue = false;
				} else if ( me.options.eventPassthrough == 'horizontal' ) {
					me.initiated = false;
					return;
				}

				deltaY = 0;
			} else if ( me.directionLocked == 'v' ) {
				if ( me.options.eventPassthrough == 'horizontal' ) {
					e.preventDefault ? e.preventDefault() : e.defaultValue = false;
				} else if ( me.options.eventPassthrough == 'vertical' ) {
					me.initiated = false;
					return;
				}

				deltaX = 0;
			}


			deltaX = me.hasHorizontalScroll ? deltaX : 0;
			deltaY = me.hasVerticalScroll ? deltaY : 0;

			newX = me.x + deltaX;
			newY = me.y + deltaY;

			// Slow down if outside of the boundaries
			if ( newX > 0 || newX < me.maxScrollX ) {
				newX = me.options.bounce ? me.x + deltaX / 3 : newX > 0 ? 0 : me.maxScrollX;
			}
			if ( newY > 0 || newY < me.maxScrollY ) {
				newY = me.options.bounce ? me.y + deltaY / 3 : newY > 0 ? 0 : me.maxScrollY;
			}

			me.directionX = deltaX > 0 ? -1 : deltaX < 0 ? 1 : 0;
			me.directionY = deltaY > 0 ? -1 : deltaY < 0 ? 1 : 0;

			if ( !me.moved ) {
				me._startX = me.x;
				me._startY = me.y;
				var ev = $.Event('smoothscrollstart');
				me.triggerHandler(ev, {x: me.x, y: me.y});
				if (ev.isDefaultPrevented()) {
					return;
				}
			}
			me.moved = true;
			me._translate(newX, newY);

			if ( timestamp - me.startTime > 300 ) {
				me.startTime = timestamp;
				me.startX = me.x;
				me.startY = me.y;
			}
		},

		/**
		 * 터치이벤트 핸들러
		 * @param e
		 * @private
		 */
		_end: function(e) {
			var me = this;

			if ( !me.isEnabled || eventType[e.type] !== me.initiated ) {
				return;
			}

			var $doc = $(document),
			//point = e.changedTouches ? e.changedTouches[0] : e,
				momentumX,
				momentumY,
				duration = getTime() - me.startTime,
				newX = Math.round(me.x),
				newY = Math.round(me.y),
			//distanceX = Math.abs(newX - me.startX),
			//distanceY = Math.abs(newY - me.startY),
				time = 0,
				easing = '';

			$doc.off('.'+me.cid);

			me.isInTransition = 0;
			me.initiated = 0;
			me.endTime = getTime();

			// reset if we are outside of the boundaries
			if ( me.resetPosition(me.options.bounceTime) ) {
				return;
			}

			me.scrollTo(newX, newY);	// ensures that the last position is rounded

			if ( !me.moved ) {
				return;
			}

			// start momentum animation if needed
			if ( me.options.momentum && duration < 300 ) {
				momentumX = me.hasHorizontalScroll ? momentum(me.x, me.startX, duration, me.maxScrollX, me.options.bounce ? me.wrapperWidth : 0, me.options.deceleration) : { destination: newX, duration: 0 };
				momentumY = me.hasVerticalScroll ? momentum(me.y, me.startY, duration, me.maxScrollY, me.options.bounce ? me.wrapperHeight : 0, me.options.deceleration) : { destination: newY, duration: 0 };
				newX = momentumX.destination;
				newY = momentumY.destination;
				time = Math.max(momentumX.duration, momentumY.duration);
				me.isInTransition = 1;
			}

			if ( newX != me.x || newY != me.y ) {
				// change easing function when scroller goes out of the boundaries
				if ( newX > 0 || newX < me.maxScrollX || newY > 0 || newY < me.maxScrollY ) {
					easing = easingType.quadratic;
				}

				me.scrollTo(newX, newY, time, easing);
				return;
			}

			me._triggerEnd();
		},

		/**
		 * 재배치 된 요소들을 대계산
		 */
		refresh: function() {
			//var rf = this.$wrapper[0].offsetHeight;		// Force reflow
			var me = this;

			me.wrapperWidth	= me.options.getWrapperWidth ? me.options.getWrapperWidth() : me.$wrapper.width();
			me.wrapperHeight	= me.options.getWrapperHeight ? me.options.getWrapperHeight() : me.$wrapper.height();

			me.scrollerWidth	= me.options.getScrollerWidth ? me.options.getScrollerWidth() : me.$scroller.width();
			me.scrollerHeight	= me.options.getScrollerHeight ? me.options.getScrollerHeight() : me.$scroller.height();

			me.maxScrollX		= me.wrapperWidth - me.scrollerWidth;
			me.maxScrollY		= me.wrapperHeight - me.scrollerHeight;

			me.hasHorizontalScroll	= me.options.scrollX && me.maxScrollX < 0;
			me.hasVerticalScroll		= me.options.scrollY && me.maxScrollY < 0;

			if ( !me.hasHorizontalScroll ) {
				me.maxScrollX = 0;
				me.scrollerWidth = me.wrapperWidth;
			}

			if ( !me.hasVerticalScroll ) {
				me.maxScrollY = 0;
				me.scrollerHeight = me.wrapperHeight;
			}

			me.endTime = 0;
			me.directionX = 0;
			me.directionY = 0;

			me.resetPosition();
			me.options.snap && me._refreshSnapPos();
		},

		/**
		 * 스내핑 대상들의 위치 재계산
		 * @private
		 */
		_refreshSnapPos: function () {
			var me = this;
			if (!me.options.snap) { return; }

			me.snapItemsPos = [];
			me.$snapItems.each(function (){
				me.snapItemsPos.push($(this).position());
			});
		},

		/**
		 * 애니메이션이 끝났을 때 발생
		 * @param e
		 * @private
		 */
		_transitionEnd: function(e) {
			var me = this;
			if ( e.target != me.$scroller[0] || !me.isInTransition ) {
				return;
			}

			me._transitionTime();
			if ( !me.resetPosition(me.options.bounceTime) ) {
				me.isInTransition = false;
				this._triggerEnd();
			}
		},

		/**
		 * 스냅 처리
		 * @returns {boolean}
		 * @private
		 */
		_snap: function () {
			var me = this;
			if (!me.options.snap) { return; }
			if (me._isSnap) {
				me._isSnap = false;
			} else if (me.maxScrollX != me.x) {
				var x = me._startX - me.x,
					prevX = 0, isMoved = false;

				me._isSnap = true;
				x && core.each(me.snapItemsPos, function (item) {
					var left = item.left;
					if (x > 0) {
						if (left > Math.abs(me.x)) {
							isMoved = true;
							me._animate(-left, 0, 200, easingType.circular.fn);
							return false;
						}
					} else if (x < 0) {
						if (left > Math.abs(me.x)) {
							isMoved = true;
							me._animate(-prevX, 0, 200, easingType.circular.fn);
							return false;
						}
					}
					prevX = left;
				});
				if (isMoved) {
					return true;
				}
			}

			me._isSnap = false;
		},

		/**
		 * smoothscrollend  트리거
		 * @private
		 */
		_triggerEnd: function () {
			var me = this;

			me.moved = false;
			if (me.options.snap && me._snap() === true) { return; }
			me.triggerHandler('smoothscrollend', {
				x: me.x,
				y: me.y,
				dir: {x: me._startX - me.x, y: me._startY - me.y},
				wrapWidth: me.wrapperWidth,
				wrapHeight: me.wrapperHeight,
				scrollWidth: me.scrollerWidth,
				scrollHeight: me.scrollerHeight
			});
		},

		getCurrentX: function (){ return this.x; },
		getCurrentY: function (){ return this.y; },
		getMaxScrollX: function(){ return this.maxScrollX; },
		getMaxScrollY: function(){ return this.maxScrollY; }
	});


	if (typeof define === "function" && define.amd) {
		define([], function() {
			return SmoothScroll;
		});
	}
	core.importJs.define('modules/smooth-scroll', SmoothScroll);

})(jQuery, window[LIB_NAME]);

/*!
 * @module scui.ui.Scrollview
 * @author 김승일 책임((comahead@vi-nyl.com)
 * @create 2014-12-11
 * @license MIT License
 */
(function ($, core, undefined) {
	"use strict";
	if (core.ui.Scrollview) { return; }

	$.easing.smooth = function (x, t, b, c, d) {
		var ts = (t /= d) * t, tc = ts * t;
		return b + c * (-1 * ts * ts + 4 * tc + -6 * ts + 4 * t);
	};

	var cssTransform = core.css3.prefix('transform');

	var Scrollview = core.ui('Scrollview', {
		bindjQuery: 'scrollview',
		selectors: {
			wrapper: '>.ui_scrollarea',
			scroller: '>.ui_scrollarea>.ui_content',
			vscrollbar: '>.ui_scrollbar'
		},
		defaults: {
			duration: 600,
			speedLimit: 1.2,
			moveThreshold: 100,
			offsetThreshold: 30,
			startThreshold: 5,
			acceleration: 0.1,
			accelerationT: 250,
			watch: true,
			watchInterval: 400,
			preventScroll: true
		},
		initialize: function (el, options) {
			var me = this;

			if (me.supr(el, options) === false) {
				return;
			}

			me.maxScrollY = 0;
			me.scrollHeight = 0;
			me.wrapperHeight = 0;
			me.visibleScroll = false;

			if (me.$vscrollbar.size() === 0) {
				// 스크롤바가 없으면 자동 생성해 준다.
				me.$vscrollbar = $('<div class="scroll ui_scrollbar">' +
					'<span class="bg_top"></span><span class="bg_mid"></span>' +
					'<span class="bg_btm"></span></div>');
				me.$el.append(me.$vscrollbar);
			}

			me.scrollbarStyle = me.$vscrollbar[0].style;
			me.scrollbarStyle.display = 'none';
			var $inner = me.$vscrollbar.find('span.bg_mid');
			if ($inner.length) {
				me.scrollbarInnerStyle = $inner[0].style;
				me.scrollbarInnerStyle.paddingBottom = 0;
			}

			//me.$el.addClass('strack');
			me.$el.attr('tabindex', 0);
			me._bindEvents();
		},

		_bindEvents: function () {
			var me = this;

			if (me.$vscrollbar.size()){
				me.$wrapper.on('scroll', function () {
					var rate = (me.wrapperHeight - me.scrollbarHeight) / (me.scrollHeight - me.wrapperHeight);
					me._moveScrollbar(me.$wrapper[0].scrollTop * rate);
				});

				if (me.options.watch === true) {
					// 사이즈 변화 감시
					var totalTime = 0, dur = me.options.watchInterval;
					me.updateTimer = setInterval(function () {
						// 40초에 한번씩 dom에서 제거 됐건지 체크해서 타이머를 멈춘다.
						if (totalTime > 40000) {
							totalTime = 0;
							if (!$.contains(document, me.$el[0])) {
								clearInterval(me.updateTimer);
								me.updateTimer = null;
								return;
							}
						} else {
							totalTime += dur;
						}
						me.update();
					}, dur);
				}
			}
			/*if (core.browser.isTouch) {
			 me._bindContentScroll();
			 } else {
			 me._bindScrollbar();
			 me._bindKeys();
			 me._bindWheel();
			 }*/
		},

		_watchStart: function () {
			var me = this;

		},
		/**
		 * 터치기반 디바이스에서 터치로 컨텐츠를 스크롤할 수 있도록 바인딩
		 * @private
		 */
		_bindContentScroll: function () {
			var me = this,
				times = {}, multiplier = 1,
				util = core.util,
				distance, startY, startX, acc, scrollableY, wrapHeight, maxScrollY, startScrollTop, pos, isScrolling;

			me.$el.on('touchstart touchmove touchend touchcancel', function (e) {
				var isMove, touchTime, maxOffset, offset, scrollTop, duration, pointY;
				times[e.type] = e.timeStamp;

				pos = util.getEventPoint(e);
				pointY = pos.y;
				switch (e.type) {
					case 'touchstart':
						wrapHeight = me.wrapperHeight;
						maxScrollY = me.$wrapper[0].scrollHeight - wrapHeight;
						scrollableY = maxScrollY > 0;

						if (!scrollableY) { return; }

						startScrollTop = me.$wrapper[0].scrollTop;
						//pos = util.getEventPoint(e).y;
						startX = pos.x;
						startY = pos.y;
						multiplier = 1;
						isScrolling = false;

						if (me.$wrapper.is(":animated")
							&& (times['touchstart'] - times['touchend'] < me.options.accelerationT)) {
							multiplier += me.options.acceleration;
						} else {
							multiplier = 1;
						}

						me.$wrapper
							.stop(true, false)
							.data('scrollTop', me.$wrapper.scrollTop());

						break;
					case 'touchmove':
						if (!isScrolling && Math.abs(startX - pos.x) > Math.abs(startY - pos.y)) { scrollableY = false; }
						if (!scrollableY) { return; }

						if (me.options.preventScroll) { e.preventDefault(); }
						else {
							if (startY < pointY && startScrollTop === 0) { return; }
							if (startY > pointY && startScrollTop === maxScrollY) { return; }
							e.preventDefault();
						}

						distance = startY - pointY;
						acc = Math.abs(distance / (times['touchmove'] - times['touchstart']));
						scrollTop = me.$wrapper.data('scrollTop') + distance;
						duration = 0;
						multiplier = 1;
						isScrolling = true;

						if (scrollTop < 0) { scrollTop = 0; }
						else if (scrollTop > maxScrollY) { scrollTop = maxScrollY; }
						me.$wrapper.stop(true, false).scrollTop(scrollTop);

						e.stopPropagation();
						break;
					case 'touchend':
					case 'touchcancel':
						if (!scrollableY || !isScrolling) { return; }
						isMove = (Math.abs(startY - pointY) > me.options.startThreshold);
						if (isMove) {
							touchTime = times['touchend'] - times['touchmove'];
							maxOffset = wrapHeight * me.options.speedLimit;
							offset = Math.pow(acc, 2) * wrapHeight;
							offset = offset > maxOffset ? maxOffset : multiplier * offset;
							offset = (multiplier * offset) * ((distance < 0) ? -1 : 1);

							if ((touchTime < me.options.moveThreshold) && offset != 0 && Math.abs(offset) > me.options.offsetThreshold) {
								scrollTop = me.$wrapper.data('scrollTop') + distance + offset;
								duration = me.options.duration;

								if (scrollTop < 0) { scrollTop = 0; }
								else if (scrollTop > maxScrollY) { scrollTop = maxScrollY; }

								me.$wrapper.stop(true, false).animate({
									scrollTop: scrollTop
								}, {
									duration: duration,
									easing: 'smooth',
									complete: function () {
										multiplier = 1;
									}
								});
							}
						}
						break;
				}
			});

		},

		/**
		 * pc에서 상하키로 스크롤할 수 있도록 바인딩
		 * @private
		 */
		_bindKeys: function () {
			var me = this;

			me.$el.on('keydown', function (e) {
				var keyCode = e.keyCode || e.which,
					wrapperHeight = me.$wrapper.innerHeight(),
					scrollTop = me.$wrapper.prop('scrollTop'),
					maxScrollY = me.$wrapper.prop('scrollHeight') - wrapperHeight,
					newY;

				switch (keyCode) {
					case 38: // up
						e.preventDefault();
						if (scrollTop <= 0) {
							return;
						}
						newY = scrollTop - wrapperHeight;
						break;
					case 40: // down
						e.preventDefault();
						if (scrollTop >= maxScrollY) {
							return;
						}
						newY = scrollTop + wrapperHeight;
						break;
					default:
						return;
				}
				if (newY) {
					me.$wrapper.stop(true, false)
						.animate({
							scrollTop: newY
						}, {
							duration: me.options.duration,
							easing: 'smooth'
						});
				}
			});
		},

		/**
		 * pc에서 스크롤바로 컨텐츠를 스크롤할 수 있도록 바인딩
		 * @private
		 */
		_bindScrollbar: function () {
			var me = this,
				$doc = $(document),
				isTouch = core.browser.isTouch,
				currY, downY, moveY;

			function getY(e){
				if (isTouch && e.originalEvent.touches) {
					e = e.originalEvent.touches[0];
				}
				return e.pageY;
			}

			me.$vscrollbar.on('mousedown touchstart', function (e) {
				e.preventDefault();
				if (isTouch) {
					e.stopPropagation();
				}

				me.isMouseDown = true;
				currY = core.css3.position(me.$vscrollbar).y;
				downY = getY(e);

				$doc.on('mouseup.' + me.cid + ' mousecancel.' + me.cid +
					' touchend.' + me.cid + ' mousemove.' + me.cid +
					' touchmove.' + me.cid + ' touchcancel.' + me.cid, function (e) {
					if (!me.isMouseDown) {
						$doc.off('.' + me.cid);
						return;
					}

					switch (e.type) {
						case 'mouseup':
						case 'touchend':
						case 'mousecancel':
						case 'touchcancel':
							me.isMouseDown = false;
							if (!me.isScrollbarActive) {
								me.$vscrollbar.removeClass('active');
							}
							moveY = 0;
							$doc.off('.' + me.cid);
							break;
						case 'mousemove':
						case 'touchmove':
							moveY = getY(e);

							var top = currY - (downY - moveY),
								scrollHeight = me.wrapperHeight - me.scrollbarHeight,
								y;

							me.scrollbarStyle.top = (top = Math.max(0, Math.min(top, scrollHeight)));
							y = (me.scrollHeight - me.wrapperHeight) * (top / scrollHeight);
							me.$wrapper.scrollTop(y);
							e.preventDefault();
							break;
					}
				});
				return false;
			}).on('mouseenter mouseleave', function(e) {
				me.isScrollbarActive = e.type === 'mouseenter';
				me.$vscrollbar.toggleClass('active', me.isScrollbarActive || me.isMouseDown);
			});
		},

		/**
		 * pc에서 마우스로 스크롤할 수 있도록 바인딩
		 * @private
		 */
		_bindWheel: function () {
			var me = this;
			me.$wrapper.on('mousewheel DOMMouseScroll wheel', function (ev) {
				var e = ev.originalEvent;
				var delta     = core.util.getDeltaY(e) * 100,
					scrollTop = me.$wrapper[0].scrollTop;

				me.$wrapper.scrollTop(scrollTop - delta); // -: down +: up
				if (me.options.preventScroll) {
					ev.preventDefault();
					ev.stopPropagation();
				} else {
					if (me.$wrapper[0].scrollTop != scrollTop) {
						ev.preventDefault();
						ev.stopPropagation();
					}
				}
			});
		},


		/**
		 * 스크롤바를 움직여주는 함수
		 * @param top
		 * @param height
		 * @private
		 */
		_moveScrollbar: function (top, height) {
			var me = this;

			if (!me.visibleScroll) { return; }
			if (isNaN(top)) { top = 0; }
			if (height !== undefined && me.scrollbarHeight != height) {
				height = Math.max(height, 18);
				if (me.scrollbarInnerStyle){
					var roundSize = me.$vscrollbar.children().eq(0).height();
					me.scrollbarInnerStyle.top = roundSize + 'px';
					me.scrollbarInnerStyle.bottom = roundSize + 'px';
				}
				me.scrollbarStyle.height = height+'px';
				me.scrollbarHeight = height;
			} else {
				height = me.scrollbarHeight;
			}
			if (me.wrapperHeight < height + top) {
				top = me.wrapperHeight - height;
			}
			if (core.css3.support) {
				me.scrollbarStyle[cssTransform] = 'translate(0px, ' + top + 'px)';
			} else {
				me.scrollbarStyle.top = top + 'px';
			}
		},

		/**
		 * 사이즈 변화에 따른 UI 갱신
		 */
		update: function (){
			var me = this,
				wrapperHeight, scrollHeight, visibleScroll, scrollbarHeight, rate;

			wrapperHeight = me.$wrapper[0].offsetHeight;
			if (wrapperHeight === 0){
				me.wrapperHeight = 0;
				return;
			}

			scrollHeight = me.$wrapper[0].scrollHeight;
			visibleScroll = wrapperHeight < scrollHeight - 1;
			if (visibleScroll && !me._bindedEventOver) {
				me._bindedEventOver = true;
				// 실질적으로 컨텐츠가 래퍼를 오버했을 때만 스크롤을 붙인다.
				if (core.browser.isTouch) {
					me._bindContentScroll();
				} else {
					me._bindScrollbar();
					me._bindKeys();
					me._bindWheel();
				}
			}
			// 160217 - 영역보다 내용이 작을 경우 스크롤바 감추기
			me.scrollbarStyle.display = visibleScroll ? '' : 'none';
			if (visibleScroll !== me.visibleScroll) {
				me.visibleScroll = visibleScroll;
				me.$el.toggleClass('strack', visibleScroll);
			}
			if (visibleScroll && (scrollHeight !== me.scrollHeight || wrapperHeight !== me.wrapperHeight)) {
				me.wrapperHeight = wrapperHeight;
				me.scrollHeight = scrollHeight;
				me.scrollRate = wrapperHeight / scrollHeight;
				rate = (me.wrapperHeight - me.scrollbarHeight) / (me.scrollHeight - me.wrapperHeight);
				me._moveScrollbar(me.$wrapper[0].scrollTop * rate, wrapperHeight * me.scrollRate);
			}
		},

		/**
		 * scrollTop 설정
		 * @param top
		 * @returns {*}
		 */
		scrollTop: function (top) {
			var me = this;
			if (arguments.length > 0) {
				me.$wrapper.scrollTop(top);
				me.update();
			} else {
				return me.$wrapper.scrollTop();
			}
		},

		release: function () {
			var me = this;

			me.updateTimer && (clearInterval(me.updateTimer), me.updateTimer = null);
			me.supr();
		}
	});

	if (typeof define === 'function' && define.amd) {
		define('mobules/scrollview', [], function (){
			return Scrollview;
		})
	}

})(jQuery, window[LIB_NAME]);

/*!
 * @module scui.ui.Selectbox
 * @author odyseek
 * @email comahead@vinylc.com
 * @create 2015-03-17
 * @license MIT License
 *
 * @modifier (김승일책임)comahead@vi-nyl.com
 */
(function ($, core, undefined) {
	"use strict";
	if (core.ui.Selectbox) { return; }

	var $doc    = $(document),
		$win    = $(window),
		isTouch = core.browser.isTouch;

	var BaseSelectbox = core.ui.View.extend({
		name: 'Selectbox',

		initialize: function (el, options) {
			var me = this;
			if (me.supr(el, options) === false) { return; }

			if (me.$el.attr('data-class') && me.$el.attr('data-class').indexOf('read') > -1) {
				me.$el.prop('readonly', true);
			}
		},
		_options: function (cb) {
			core.each(core.toArray(this.el.options), cb);
		},

		_isDeactive: function () {
			var me = this;

			return me.$el.prop('disabled') || me.$el.prop('readonly') === true;
		},

		/**
		 * 레이블 말줄임처림(뭐가 뭔지 모르겠어서 로직을 최적화 할 수가 없네...;;)
		 * @param option
		 * @param type
		 * @returns {*}
		 * @private
		 */
		_itemHTML: function (option, type) {
			if (!option) { return '<span class="ui_select_text"></span><span class="hide"></span><span class="ico"></span>'; }
			var me       = this,
				$o       = $(option),
				dataList = {}, cname,
				html     = '';

			if (cname = $o.attr('data-sup')) { dataList['sup'] = cname; }
			if (cname = $o.attr('data-cnum')) { dataList['cnum'] = cname; }
			if (cname = $o.attr('data-cname')) { dataList['cname'] = cname; }
			if (cname = $o.attr('data-cname-mobile')) { dataList['cnameMobile'] = cname; }

			// option에 data속성이 있으면
			if (core.json.hasItems(dataList)) {
				var isW768 = core.isMobileMode();
				core.each(['sup', 'cnum', 'cname'], function (val) {
					var txt = '';
					if (dataList[val]) {
						if (val !== 'cname') {
							txt = dataList[val];
						} else if (val === 'cname' && type === 'label') {
							if (me.options.cnameOption && !isW768) {
								txt = option.text;
							} else {
								if( dataList['cnameMobile'] && isW768) {
									txt = dataList['cnameMobile'];
								} else {
									txt = dataList[val];
								}
							}
						} else {
							txt = option.text;
						}
						html += '<span class="' + val + '">' + txt + '</span>';
					}
				});
				if (type === 'label') {
					html = html + '<span class="hide">선택됨</span><span class="ico"></span>';
				}
				return html;
			} else {
				if (type === 'label') {
					return '<span class="ui_select_text" _style="text-overflow: ellipsis;' +
						'width: 100%;display: inline-block;overflow: hidden;">' + option.text +
						'</span><span class="hide">선택됨</span><span class="ico"></span>';
				} else {
					return option.text;
				}
			}
		},

		/**
		 * url에 해당하는 페이지를 호출하여 받은 값을 바탕으로 option list 갱신
		 * @param {String} data.url url 주소
		 */
		remote: function (url) {
			var me = this;

			$.ajax({
				url: url,
				dataType: 'json',
				async: false,
				success: function (json) {
					if (typeof json === 'string') {
						json = $.parseJSON(json);
					}
					me.update(json);
				}
			});
		},

		selectedIndex: function (index, trigger) {
			if (arguments.length === 0) {
				return this.el.selectedIndex;
			} else {
				if (this.el.options.length === 0) { return; }

				var e = $.Event('beforechange');
				this.$el.trigger(e);
				if (e.isDefaultPrevented()) { return; }

				this.el.selectedIndex = index;
				//this._updateLabel();
				if (trigger !== false) {
					this.$el.trigger('change', {selectedIndex: this.el.selectedIndex});
				} else {
					this._updateLabel();
				}
			}
		},
		value: function (val, trigger) {
			var me = this;
			if (arguments.length === 0) {
				return me.el.value;
			} else {
				if (/*me._isDeactive() ||*/ me.el.options.length === 0) { return; }
				this._options(function (option, i) {
					if (option.value === val+"") {
						me.selectedIndex(i, trigger);
						return false;
					}
				});
			}
		},
		text: function (txt, trigger) {
			var me = this;
			if (arguments.length === 0) {
				return this.el.value;
			} else {
				if (/*me._isDeactive() || */me.el.options.length === 0) { return; }
				this._options(function (option, i) {
					if (option.text === txt+"") {
						me.selectedIndex(i, trigger);
						return false;
					}
				});
			}
		},
		selectedOption: function () {
			return this.el.options[this.el.selectedIndex];
		},

		/**
		 * 레이블 갱신
		 * @param index
		 * @private
		 */
		_updateLabel: function (index) {
			var me = this,
				isActive = !me._isDeactive(),
				$label = me.$label.children(),
				isReadonly = me.$el.hasClass('read') || me.$el.prop('readonly') === true,
				isDisabled = me.$el.prop('disabled');

			index = typeof index === 'undefined' ? me.el.selectedIndex : index;
			if (index < 0 && me.el.options.length > 0) { me.el.selectedIndex = index = 0; }
			me.attrTitle = (me.$el.attr('title') || me.$el.attr('data-title'));

			me.$selectbox.toggleClass('read', isReadonly && !isDisabled)
				.toggleClass('disabled', isDisabled )
				.toggleClass('warn', me.$el.is('[data-class*=warn]'));

			$label.attr('title', me.attrTitle + ' 열기')
				.find('.hide')
				.text(isActive ? '선택됨' : '선택불가');

			$label.html(me._itemHTML((index < 0 ? null : me.el.options[index]), 'label'));
			if (isActive) {
				$label.removeAttr('tabindex');
			} else {
				if (me.$el.prop('disabled')) {
					$label.attr('tabindex', -1);
				}
			}
		},

		update: function (list, selectedValue) {
			var me = this;

			if (/*me._isDeactive() ||*/ !list) { return; }
			if (core.is(list, 'array')) {
				// list 값이 있으면 select를 갱신시킨다.
				me.el.options.length = 0;
				core.each(list, function (item, i) {
					if ('text' in item) {
						me.el.options.add(new Option(item.text || item.value, item.value));
					} else {
						core.each(item, function (txt, val) {
							me.el.options.add(new Option(txt, val));
							return false;
						});
					}
				});
			} else if (core.is(list, 'json')) {
				me.el.options.length = 0;
				core.each(list, function (key, value) {
					me.el.options.add(new Option(key, value));
				});
			}

			if (selectedValue) {
				me.el.value = selectedValue;
			}
		},

		/**
		 * 셀렉트박스 UI 표시
		 */
		show: function () {
			this.display = true;
			this.$selectbox.toggle(this.display);
		},

		/**
		 * 셀렉트박스 UI 숨김
		 */
		hide: function () {
			this.display = false;
			this.$selectbox.toggle(this.display);
		},

		/**
		 * 셀렉트박스 UI 토글링
		 * @param {Boolean} flag 표시 여부
		 */
		toggle: function (flag) {
			if (arguments.length === 0) {
				flag = !this.display;
			}
			this.display = flag;
			this.$selectbox.toggle(this.display);
		},

		readonly: function (flag) {
			this.$el.toggleClass('read', flag).prop('readonly', flag);
			this.update();
		},
		disabled: function (flag) {
			this.$el.toggleClass('disabled', flag).prop('disabled', flag);
			this.update();
		}
	});

	//Selectbox////////////////////////////////////////////////////////////////////////////
	/**
	 * 커스텀 셀렉트박스<br />
	 *
	 * @class
	 * @name scui.ui.Selectbox
	 * @extends scui.ui.View
	 */
	var CustomSelectbox = core.ui('CusomtSelectbox', BaseSelectbox, {
		//bindjQuery: 'selectbox',
		$statics: {
			ON_CHANGED: 'selectboxchanged'
		},
		defaults: {
			classSort: ['sup', 'cnum', 'cname'],
			allowScrollbar: true,
			containerMargin: 2,
			where: 'inline',
			wrapClasses: '',
			disabledClass: 'disabled'
		},

		tmpl: '',
		/**
		 * 생성자
		 * @param {string|Element|jQuery} el 해당 엘리먼트(노드, id, jQuery 어떤 형식이든 상관없다)
		 * @param {Object} [options] 옵션값
		 * @param {string} [options.wrapClasses = ''] wrap 클래스명
		 * @param {string} [options.disabledClass = 'disabled'] disabled 클래스명
		 */
		initialize: function (el, options) {
			var me = this;
			if (me.supr(el, options) === false) {
				return;
			}

			me.display = me.$el.css('display') !== 'none';
			me.$el.hide();

			me._create();
			me.update();
		},

		/**
		 * select 컨트롤을 기반으로 UI DOM 생성
		 * @private
		 */
		_create: function () {
			var me    = this,
				cls   = me.$el.attr('data-class') || 'item_wrap',
				elId = (!me.options.id ? '' : ' id="' + me.options.id + '"');

			me.originalWidth = parseInt(me.$el.css('width'), 10) + 22;
			me.attrTitle = (me.options.title || me.$el.attr('title') || '셀렉트박스');
			if (me.options.wrapClasses) {
				cls = cls + ' ' + me.options.wrapClasses;
			}

			// 셀렉트박스
			me.$selectbox = $('<div class="ui_select_dom ' + cls + '" ' + elId + '></div>');
			if (!me.options.widthClass) {
				me.$selectbox.css('width', me.originalWidth);
			} else {
				me.$selectbox.addClass(me.options.widthClass);
			}
			me.$selectbox.insertAfter(me.$el);

			me._createLabel();
			me._createList();
			me._bindEvents();
		},

		/**
		 * 이벤트 바인딩
		 * @private
		 */
		_bindEvents: function () {
			var me = this;
			var timer;
			//
			me.on('selectboxopen selectboxclose', function (e) {
				if(me._isDeactive()) { return; }

				var isOpen = e.type === 'selectboxopen';

				me.$selectbox.toggleClass('on', isOpen);
				me.$el.closest('div.select_wrap').toggleClass('on', isOpen);

				if (isOpen) {
					me._reposition();
					me.$list.show();

					me._refreshScroll();
					me._scrollToItem();

					$doc.on('touchstart.selectbox' + me.cid + ' mousedown.selectbox' + me.cid, function (e) {
						if (!$.contains(me.$selectbox[0], e.target)) {
							clearTimeout(timer), timer = null;
							me.close();
						}
					});

					Selectbox.active = me;
				} else {
					me.$list.hide();
					Selectbox.active = null;
					clearTimeout(timer), timer = null;
					$doc.off('.selectbox' + me.cid);
				}
				me.isShown = isOpen;
				me.$label.find('.ui_select_button').attr('title', me.attrTitle + (isOpen ? ' 닫기' : ' 열기'));
			});

			me.$el.on('change', function () {
				me._updateLabel(this.selectedIndex);
			});

			// 비터치 기반일 때에 대한 이벤트 처리
			if (!isTouch) {
				// 셀렉트박스에서 포커스가 벗어날 경우 자동으로 닫히게
				me.$selectbox.on('mouseenter.selectbox mouseleave.selectbox ' +
					'focusin.selectbox focusout.selectbox', function (e) {
					clearTimeout(timer), timer = null;
					if (me.$el.prop('disabled')) { return; }
					if (e.type === 'mouseenter' || e.type === 'focusin') {
						me.$selectbox.addClass('active');
					} else if (e.type === 'mouseleave' || e.type === 'focusout') {
						me.$selectbox.removeClass('active');
						if (e.type === 'focusout' && me.$selectbox.hasClass('on')) {
							timer = setTimeout(function () {
								me.close();
							}, 200);
						}
					}
				}).on('keydown', function (e) {
					if (!me.isShown){ return; }
					switch (e.keyCode){
						case core.keyCode.ESCAPE:
							me.close();
							me.$label.find('a').focus();
							break;
					}
				});
			}

			var changemediasizeCallback;
			$(window).on('changemediasize.' + me.cid, changemediasizeCallback = function (e, data) {
				if (me.isShown) {
					me._refreshScroll();
				}
				me._updateLabel();
			});
			changemediasizeCallback();

			$(me.el.form).on('reset', function (){
				setTimeout(function () {
					me.update();
				});
			});
		},

		/**
		 * 레이블 생성
		 * @private
		 */
		_createLabel: function () {
			var me = this;

			me.$label = $('<div class="item_view"><a href="#0" class="ui_select_button" title="">' + me._itemHTML((me.el.selectedIndex >= 0 ? me.el.options[me.el.selectedIndex] : null), 'label') + '</a></div>');

			me.$label.attr({
				'id': me.cid + '_button'
			}).on('click', '.ui_select_button', function (e) {
				e.preventDefault();
				if (me === Selectbox.active) {
					me.close();
					return;
				}

				// 현재 셀렉트박스가 열려있으면 닫고, 닫혀있으면 열어준다.
				if (me.$selectbox.hasClass('on')) {
					me.close();
				} else {
					if(me._isDeactive()) { return; }
					me.open();
				}
			});
			!isTouch && me.$selectbox.on('keydown', '.item_view a', function (e) {
				if (me._isDeactive()){ return; }
				if (e.keyCode === 40) { // down
					if (!me.isShown) {
						me.open();
					}
					me.$list.find('li>a:eq(0)').focus();
					e.preventDefault();
				}
			});

			me.$selectbox.append(me.$label);
		},

		/**
		 * 리스트 생성
		 * @private
		 */
		_createList: function () {
			var me = this;

			me.$list = $('<div class="item_list" id="' + me.cid + '_menu"><div class="ui_selectbox_wrapper ui_item_scrollarea ui_item_content"></div></div>');
			me.$selectbox.append(me.$list);
			me.$listWrapper = me.$list.children();

			me.$selectbox.on('click', '.item_list', function (e) {
				me.$list.focus();
			}).on('click', '.item_list li>a', function (e) {
				// 아이템을 클릭했을 때
				e.preventDefault();
				e.stopPropagation();

				me.selectedIndex($(this).parent().index());
				me.close();
				me.$label.find('a').focus();
			});

			!isTouch && me.$selectbox.on('mousedown', '.item_list li>a', function () {
				this.focus();
			}).on('keydown', '.item_list a', function (e) {
				if (e.keyCode != 38 && e.keyCode != 40) { return; }
				if (!me.isShown) { return; }
				e.preventDefault();

				// 키보드의 위/아래 키로 이동
				var $links = me.$selectbox.find('a'),
					index = $links.index(this),
					count = $links.length;

				switch (e.keyCode) {
					case 38: // up
						$links.eq(Math.max(0, index - 1)).focus();
						break;
					case 40: // down
						$links.eq(Math.min(count, index + 1)).focus();
						break;
				}
			});
			me.maxHeight = parseInt(me.$listWrapper.css('max-height'), 10);

			me.$scrollbar = $('<div class="scroll ui_item_scrollbar" style="top: 0px;">' +
				'<span class="bg_top"></span><span class="bg_mid" style=""></span>' +
				'<span class="bg_btm"></span></div>');
			me.$list.append(me.$scrollbar);
			if (!isTouch) {
				me.$list.on('mouseenter mouseleave', function (e){
					me.isScrollbarActive = e.type === 'mouseenter';
					me.$scrollbar.toggleClass('active', me.isScrollbarDown || me.isScrollbarActive);
				});
			}
			/* TODO
			 if (!core.browser.isTouch) {
			 me.$list.on('mouseenter mouseleave', function (e){
			 me.isScrollbarActive = e.type === 'mouseenter';
			 me.$scrollbar.toggleClass('active', me.isMouseDown || me.isScrollbarActive);
			 });
			 }
			 */
		},

		/**
		 * 스크롤박스를 버튼 위에 놓을지 아래에 놓을지 결정
		 * @private
		 */
		_reposition: function(){
			var me = this, $scrollarea,
				scrollTop, offset, listHeight, selectHeight, scrollHeight;

			$scrollarea = me.$selectbox.parentsUntil('body').filter(function(){
				var overflow = $(this).css('overflowY');
				return overflow === 'hidden' || overflow === 'auto';
			});
			if($scrollarea.size() === 0){ return; }

			scrollTop = $scrollarea.scrollTop();
			scrollHeight = $scrollarea.prop('scrollHeight');
			selectHeight = me.$selectbox.innerHeight();
			offset = me.$selectbox.offset().top - $scrollarea.offset().top + scrollTop;
			me.$list.css('visibility', 'hidden').show();
			listHeight = me.$listWrapper.innerHeight();
			me.$list.css('visibility', '').hide();

			if(offset + listHeight + selectHeight > scrollHeight && (offset - scrollTop) > listHeight) {
				me.$selectbox.addClass('up');
				me.$list.css('marginTop', (listHeight + selectHeight + 3) * -1);
			} else {
				me.$selectbox.removeClass('up');
				me.$list.css('marginTop', '');
			}
		},

		/**
		 * 리스트 표시
		 * @fires scui.ui.Selectbox#selectboxopen
		 */
		open: function () {
			var me        = this;
			Selectbox.active && Selectbox.active.close();

			if (me.options.where === 'body') {
				me.$list.css({
					position: 'absolute',
					zIndex: 9000,
					top: me.$label.offset().top + me.$label.height(),
					left: me.$label.offset().left
				}).appendTo('body');
			}

			/**
			 * 셀렉트박스가 열릴 때 발생
			 * @event scui.ui.Selectbox#selectboxopen
			 *///me.$selectbox.triggerHandler('selectboxopen');
			me.triggerHandler('selectboxopen');
		},

		/**
		 * 리스트 닫기
		 * @fires scui.ui.Selectbox#selectboxclose
		 */
		close: function () {
			var me = this;

			/**
			 * 셀렉트박스가 닫힐 때 발생
			 * @event scui.ui.Selectbox#selectboxclose
			 */
			me.triggerHandler('selectboxclose');

			if (me.options.where === 'body') {
				me.$label.after(me.$list.css({
					position: '',
					zIndex: '',
					top: '',
					left: ''
				}));
			}
		},

		/**
		 * index에 해당하는 option항목을 선택
		 *
		 * @param {number} index 선택하고자 하는 option의 인덱스
		 * @param {boolean} trigger change이벤트를 발생시킬 것인지 여부
		 */
		selectedIndex: function (index, trigger) {
			var me   = this;

			if (arguments.length === 0) {
				return me.el.selectedIndex;
			}
			//if (me._isDeactive()) { return; }
			me.supr.apply(me, core.toArray(arguments));
			me.$list.find('li').removeClass('on').eq(me.el.selectedIndex).addClass('on');
		},

		/**
		 * value 에 해당하는 option항목을 선택, 인자가 없을땐 현재 선택되어진 value를 반환
		 *
		 * @param {string} index 선택하고자 하는 option의 인덱스
		 * @param {boolean} trigger change이벤트를 발생시킬 것인지 여부
		 * @return {string}
		 * @example
		 * &lt;select id="sel">&lt;option value="1">1&lt;/option>&lt;option value="2">2&lt;/option>&lt;/select>
		 *
		 * $('#sel').scSelectbox('value', 2);
		 * value = $('#sel').scSelectbox('value'); // = $('#sel')[0].value 와 동일
		 */
		value: function (_value, trigger) {
			var me = this;

			if (arguments.length === 0) {
				return me.el.options[me.el.selectedIndex].value;
			} else {
				//if (me._isDeactive()) { return; }
				me.supr.apply(me, core.toArray(arguments));
			}
		},


		/**
		 * 동적으로 select의 항목들이 변경되었을 때, UI에 반영
		 *
		 * @param {json} (optional) list 만약 option들을 새로 갱신하고자 할 경우
		 * @example
		 * &lt;select id="sel">&lt;option value="1">1&lt;/option>&lt;option value="2">2&lt;/option>&lt;/select>
		 *
		 * $('#sel')[0].options[2] = new Option(3, 3);
		 * $('#sel')[0].options[3] = new Option(4, 4);
		 * $('#sel').scSelectbox('update');
		 */
		update: function (list, selectedValue) {
			var me    = this,
				html  = '',
				text  = '',
				num   = 1;

			var isDisabled = me.$el.prop('disabled');
			var isReadonly = me.$el.prop('readonly') === true;

			me.close();
			if (list) {
				me.supr(list, selectedValue);
			}

			me._updateLabel();
			if (isReadonly || isDisabled) {
				return;
			}

			// select에 있는 options를 바탕으로 UI를 새로 생성한다.
			me._options(function (item, i) {
				html += '<li><a href="#' + (num++) + '" data-value="' + item.value +
					'" data-text="' + item.text + '" title="' + me.attrTitle + '">' +
					me._itemHTML(item) + '</a></li>';
			});

			me.$listWrapper.empty().html('<ul>' + html + '</ul>')
				.find('li:eq(' + me.el.selectedIndex + ')').addClass('on');

			me.$selectbox.toggle(me.display);
		},

		setTitle: function (title) {
			this.$listWrapper.find('a').attr('title', this.attrTitle = title);
		},

		/**
		 * readonly 모드로 변경
		 * @param flag
		 */
		readonly: function(flag) {
			var me = this;

			me.supr(flag);
			me.close();
			me.update();
		},

		/**
		 * disabled 모드로 변경
		 * @param flag
		 */
		disabled: function(flag) {
			var me = this;

			me.supr(flag);
			me.close();
			me.update();
		},

		/**
		 * 스크롤바 이벤트 바인딩
		 * @private
		 */
		_bindScrollEvent: function () {
			var me = this;
			var $listChild = me.$listWrapper;

			$listChild.on('scroll', function () {
				if (!me.isScrollbarDown) {
					me._scrollUpdate();
				}
			});

			if (!isTouch) {
				if (me.options.allowScrollbar) {
					// 스크롤바 드래그 바인딩
					me.$scrollbar.swipeGesture({
						direction: 'vertical',
						swipe: (function () {
							var currY, top, rate, scrollbarHeight, wrapperHeight, scrollHeight;
							return function (type, data) {
								if (!me.isVisibleScrollbar) {
									return false;
								}
								switch (type) {
									case 'start':
										me.isScrollbarDown = true;
										currY = parseInt(me.$scrollbar.css('top'), 10);
										scrollbarHeight = me.$scrollbar.height();
										wrapperHeight = me.$listWrapper.height();
										scrollHeight = me.$listWrapper.prop('scrollHeight');
										break;
									case  'move':
										if (!me.isScrollbarDown) {
											return;
										}
										top = me._scrollbarMove(currY + data.diff.y);
										rate = top / (wrapperHeight - scrollbarHeight);
										me.$listWrapper.scrollTop(rate * (scrollHeight - wrapperHeight));
										break;
									default:
										me.isScrollbarDown = false;
										!me.isScrollbarActive && me.$scrollbar.removeClass('active');
										break;
								}
							};
						})()
					});
				}

				// 휠스크롤 바인딩
				me.$selectbox.on('mousewheel DOMMouseScroll wheel', function (event) {
					if (!me.isVisibleScrollbar) {
						return;
					}
					//event.preventDefault();
					var e = event.originalEvent,
						delta = core.util.getDeltaY(e) * 40,
						scrollTop = $listChild.scrollTop();

					$listChild.scrollTop(scrollTop - delta);
					//if ($listChild.scrollTop() == scrollTop) {
					event.preventDefault();
					event.stopPropagation();
					//}
				});
			} else {
				// 리스트 드래그 바인딩
				me.$list.swipeGesture({
					direction: 'vertical',
					swipe: (function () {
						var currY = 0;
						return function (type, data) {
							if (!me.isVisibleScrollbar) {
								return false;
							}
							switch (type) {
								case 'start':
									currY = $listChild.scrollTop();
									break;
								case 'move':
									$listChild.scrollTop(currY - data.diff.y);
									break;
							}
						};
					})()
				})/*.on('touchstart', function (e){
				 e.preventDefault();
				 })*/;
			}
			// ScrollBar Event Bind End
		},

		/**
		 * 스크롤바 삭제
		 * @private
		 */
		_hideScroll: function () {
			var me = this;

			me.isVisibleScrollbar = false;
			me.$scrollbar.hide().css({'height': 0, 'top': 0}).find('span.bg_mid').css('height', 0);
		},

		/**
		 * 스크롤바 갱신
		 * @private
		 */
		_scrollUpdate: function () {
			var me = this;
			if (!me.isVisibleScrollbar) { return; }
			var rate = (me.wrapperHeight - me.scrollBarHeight) / (me.scrollerHeight - me.wrapperHeight);
			me._scrollbarMove(me.$listWrapper.scrollTop() * rate);
		},

		/**
		 * 스크롤바 이동
		 * @param top
		 * @returns {number|*}
		 * @private
		 */
		_scrollbarMove: function (top) {
			var me = this;

			if (!me.isVisibleScrollbar) {
				return;
			}
			top = Math.min(me.scrollHeight, Math.max(0, top));
			me.$scrollbar.css({
				'height': Math.ceil(me.scrollBarHeight),
				'top': top
			}).find('span.bg_mid').css('height', Math.ceil(me.scrollBarHeight) - 24);
			return top;
		},

		// 스크롤링
		_scrollTop: function (top) {
			var me = this;

			me.$listWrapper.scrollTop(top * me.scrollRate);
			me._scrollUpdate();
		},

		/**
		 * 활성화된 아이템을 가시영역에 보이도록 강제 스크롤
		 * @private
		 */
		_scrollToItem: function () {
			var me = this, selIndex = me.el.selectedIndex;

			if (selIndex > 0) {
				var $option = me.$list.find('li').eq(selIndex),
					scrollTop = me.$listWrapper.scrollTop(),
					optionTop = $option.position().top + scrollTop,
					wrapperHeight = me.$list.height(),
					optionHeight, listHeight;

				if (optionTop < scrollTop || optionTop >= wrapperHeight + scrollTop) {
					optionHeight = $option.height();
					listHeight = me.$listWrapper.height();
					me.$listWrapper.scrollTop(optionTop - (listHeight / 2) + (optionHeight / 2));
				}
			} else {
				me.$listWrapper.scrollTop(0);
			}
		},

		/**
		 * 스크롤바 재배치(꼭 해야되는 상황일 때만 갱신함)
		 * @private
		 */
		_refreshScroll: function () {
			var me = this;

			me.scrollerHeight = me.$list.find('ul').height();
			if (me.maxHeight > me.scrollerHeight) {
				me._hideScroll();
				return;
			}

			me.wrapperHeight = me.$listWrapper.height();// - (me.options.containerMargin * 2);
			if (me.scrollerHeight <= me.wrapperHeight) {
				me._hideScroll();
				return;
			} else if (me.$selectbox.hasClass('on')) {
				me.$scrollbar.show();
				me.isVisibleScrollbar = true;
			}
			if (!me._bindedOverEvents) {
				me._bindedOverEvents = true;
				me._bindScrollEvent();
			}
			me.scrollRate = me.wrapperHeight / me.scrollerHeight;
			me.scrollBarHeight = Math.max(30, me.wrapperHeight * me.scrollRate);
			me.scrollHeight = me.wrapperHeight - me.scrollBarHeight;
			me.isScrollbarDown = false;
			me.moveY = 0;

			me._scrollUpdate();
		},

		/**
		 * 소멸자
		 */
		release: function () {
			var me = this;

			$doc.off('.selectbox' + me.cid);
			$win.off('.' + me.cid);
			me.$scrollbar.off();
			me.$label.off().remove();
			me.$list.off().remove();
			me.$selectbox.off().remove();
			me.$el.off('change.selectbox').show().unwrap('<div></div>');
			me.supr();
		}
	});
	///////////////////////////////////////////////////////////////////////////////////////

	var PickerSelectbox = core.ui('PickerSelectbox', BaseSelectbox, {
		initialize: function (el, options) {
			var me = this;

			if (me.supr(el, options) === false) { return; }

			me._create();
			me._bindEvents();
		},

		_create: function () {
			var me    = this,
				cls   = me.$el.attr('data-class') || 'item_wrap',
				elId = (!me.options.id ? '' : ' id="' + me.options.id + '"');

			me.originalWidth = parseInt(me.$el.css('width'), 10) + 22;
			me.attrTitle = (me.options.title || me.$el.attr('title') || '셀렉트박스');
			if (me.options.wrapClasses) {
				cls = cls + ' ' + me.options.wrapClasses;
			}

			// 셀렉트박스
			me.$selectbox = $('<div class="ui_select_dom ' + cls + '" ' + elId + '></div>');
			if (!me.options.widthClass) {
				me.$selectbox.css('width', me.originalWidth);
			} else {
				me.$selectbox.addClass(me.options.widthClass);
			}

			me.$el.css({
				'-webkit-appearance': 'none',
				'-moz-appearance': 'none',
				'border-radius': 0,
				'opacity': 0,
				'position': 'absolute',
				'top': 0,
				'left': 0,
				'bottom': 0,
				'width': '100%'
			});
			me.$selectbox.insertBefore(me.$el);
			me.$label = $('<div class="item_view"><a tabindex="-1" class="ui_select_button" title="">' + me._itemHTML(me.el.options[me.el.selectedIndex], 'label') + '</a></div>').appendTo(me.$selectbox);
			me.$selectbox.prepend(me.$el);
			me.display = me.$el.css('display') !== 'none';
			me.$selectbox.toggle(me.display);
			me._updateLabel();
		},

		_bindEvents: function () {
			var me = this;

			me.$el.on('change', function () {
				me._updateLabel(me.el.selectedIndex);
			}).on('focusin focusout', function (e) {
				me.$selectbox.toggleClass('active', e.type === 'focusin');
			});
		},

		_updateLabel: function () {
			this.supr();
			if (this.$el.prop('readonly') === true) {
				this.$el.hide();
			}
		},

		update: function (list, selectedValue) {
			list && this.supr(list, selectedValue);
			this._updateLabel();
		}
	});

	var Selectbox = core.ui('Selectbox', /** @lends scui.ui.Selectbox# */{
		bindjQuery: 'Selectbox',
		defaults: {
			allowPicker: true
		},
		initialize: function (el, options) {
			var me = this;

			if (me.supr(el, options) === false) { return; }
			delete me.options.on;
			delete me.options.events;

			// 모바일에서 픽커가 아닌 커스텀셀렉트박스를 띄워야하는지 체크
			if (me.$el.attr('data-width-class') === 'f_wd_one') {
				me.options.allowPicker = false;
			}
			if (core.browser.isTouch && core.browser.isMobile && me.options.allowPicker !== false) {
				// picker
				me.sel = new PickerSelectbox(el, me.options);
			} else {
				// custom (dom ui)
				me.sel = new CustomSelectbox(el, me.options);
			}

			// puiblic 메소드를 외부에서 호출할 수 있도록 현재인스턴스에 추가
			me.$selectbox = me.sel.$selectbox;
			core.each(['selectedIndex', 'value', 'text',
				'selectedOption', 'update', 'hide', 'show', 'toggle',
				'remote', 'readonly', 'disabled'], function (name) {
				me[name] = function () {
					return this.sel[name].apply(this.sel, [].slice.call(arguments, 0));
				};
			});
		}
	});

	// li 내부에 셀렉트박스가 들어있을 경우 토글링시 li에 frm_on클래스도 토글링해주어야 함
	core.ui.setDefaults('Selectbox', {
		events: {
			'selectboxopen': function (e) {
				if (this.options.preventZindex) {
					return;
				}
				this.$el.parentsUntil('#wrap').filter(function (i) {
					return $(this).css('position') === 'relative';
				}).addClass('zindex');
			},
			'selectboxclose': function (e) {
				if (this.options.preventZindex) {
					return;
				}
				this.$el.parents('.zindex').removeClass('zindex');
			}
		}
	});

	var dateUtil = core.date;
	var imports = core.importJs(['modules/calendar']);

	// 날짜범위 셀렉트박스: 셀렉트박스에서 상속받아 구현
	var DateSelectbox = core.ui('DateSelectbox', {
		bindjQuery: 'dateSelectbox',
		initialize: function(el, options) {
			var me = this;
			$(el).scSelectbox();
			if(me.supr(el, options) === false) {
				return;
			}

			if(!me.options.startTarget || !me.options.endTarget) { return; }

			me.$startInput = $(me.options.startTarget);
			me.$endInput = $(me.options.endTarget);

			imports.done(function () {
				me.$startInput.siblings('button').scCalendar();
				me.$endInput.siblings('button').scCalendar();
				me._bindInputEvents();
			});
		},
		_bindInputEvents: function () {
			var me = this,
				format = me.options.format || dateUtil.FORMAT,
				calcRegex = /^[-+]?[0-9]+[a-z]$/i,
				dateRegex = /^[0-9]{4}.?[0-9]{2}.?[0-9]{2}$/;

			// 주어진 기준날짜를 option value에 해당하는 가감값을 계산하여 시작일과 종료일을 설정
			me.$el.on('change', function(){
				var $el = $(this),
					$option = $el.find('option:selected'),
					val = $el.val(),
					attrEndDate = $el.attr('data-lastdate'),
					attrOptionEndDay = $option.data('lastDay'),
					endDate, startDate;

				if (attrEndDate) {
					if (calcRegex.test(attrEndDate)) {
						endDate = dateUtil.calc(new Date(), attrEndDate);
					} else if (dateRegex.test(attrEndDate)) {
						endDate = dateUtil.parse(attrEndDate);
					}
				}
				if (!dateUtil.isValid(endDate)){
					endDate = new Date();
				}
				endDate = dateUtil.format(endDate, format);

				if ($option.data('start') !== undefined) {
					startDate = $option.data('start');
					endDate = $option.data('end');
				} else if (val === 'user') {
					// 151216_사용자 선택시 me.$startInput.val() / me.$endInput.val() 에서 ''로 변경
					startDate = '';
					endDate = '';
				} else if (val === 'default') {
					startDate = $el.data('start');
					endDate = $el.data('end');
				} else if (/^[0-9]{4}$/.test(val)) {
					startDate = val + ((core.browser.isTouch && core.browser.isMobile) ? '-01-01' : '.01.01');
					endDate = new Date();
					if (attrOptionEndDay === 'now' && parseInt(val,10) === parseInt(endDate.getFullYear(),10)) {
						endDate = val + ((core.browser.isTouch && core.browser.isMobile) ? '-' + scui.number.zeroPad(endDate.getMonth() + 1, 2) + '-' + scui.number.zeroPad(endDate.getDate(), 2) : '.' + scui.number.zeroPad(endDate.getMonth() + 1, 2) + '.' + scui.number.zeroPad(endDate.getDate(), 2));
					} else {
						endDate = val + ((core.browser.isTouch && core.browser.isMobile) ? '-12-31' : '.12.31');
					}
				} else {
					startDate = dateUtil.format(dateUtil.calc(endDate, val) || new Date(), format);
				}

				if (dateUtil.parse(startDate) > dateUtil.parse(endDate)) {
					me.$startInput.val(endDate).triggerHandler('dateselectboxchange');
					me.$endInput.val(startDate).triggerHandler('dateselectboxchange');
				} else {
					me.$startInput.val(startDate).triggerHandler('dateselectboxchange');
					me.$endInput.val(endDate).triggerHandler('dateselectboxchange');
				}
				me._setMinMaxDate();
			});

			// 사용자가 날짜선택 부분을 변경하면 셀렉트박스의 값을 사용자선택으로 변경해준다.
			me.$startInput.add(me.$endInput).on('change paste keydown focusin keyup calendarinsertdate', function(e) {
				if (e.type === 'keydown' || e.type === 'focusin') {
					$(this).data('prevValue', this.value);
					return;
				}
				if (this.value !== $(this).data('prevValue')) {
					if (!core.browser.isMobile){
						$(this).module('calendar').setRangeDate(null, null);
					}
					me.$el.scSelectbox('value', 'user', false); // false는 change이벤트가 발생하지 않도록 하기 위함
				}
			});

			if (!core.browser.isMobile) {
				me._bindCalendarEvents();
			}
		},

		/**
		 * pc용일 때
		 * @private
		 */
		_bindCalendarEvents: function () {
			var me = this;

			// 열기 전에 시작일의 최대날짜 설정
			var startCal = me.$startInput.module('calendar');
			startCal.on('calendarshow', function () {
				if (dateUtil.isValid(me.$endInput.val())) {
					startCal.setRangeDate(null, me.$endInput.val());
				}
			});
			// 열기전에 종료일의 최소날짜 설정
			var endCal = me.$endInput.module('calendar');
			endCal.on('calendarshow', function () {
				if (dateUtil.isValid(me.$startInput.val())) {
					endCal.setRangeDate(me.$startInput.val(), null);
				}
			});

			// 시작일에 입력한 날짜를 기본으로 종료일을 설정
			me.$startInput.parent().on('focusin focusout', (function (){
				var timer;
				return function (e) {
					clearTimeout(timer), timer = null;

					if (e.type === 'focusout') {
						if (me.$startInput[0].value.length != 10 || me.$endInput[0].value.length != 10) { return; }
						timer = setTimeout(function () {
							var start = dateUtil.parse(me.$startInput.val());
							var end = dateUtil.parse(me.$endInput.val());
							if (dateUtil.isValid(start) && dateUtil.isValid(end) && start > end) {
								me.$endInput.val(dateUtil.format(start));
							}
						});
					}
				};
			})());

			// 종료일에 입력한 날짜를 기본으로 시작일을 설정
			me.$endInput.parent().on('focusin focusout', (function (){
				var timer;
				return function (e) {
					clearTimeout(timer), timer = null;

					if (e.type === 'focusout') {
						if (me.$endInput[0].value.length != 10 || me.$startInput[0].value.length != 10) { return; }
						timer = setTimeout(function () {
							var start = dateUtil.parse(me.$startInput.val());
							var end = dateUtil.parse(me.$endInput.val());
							if (dateUtil.isValid(start) && dateUtil.isValid(end) && start > end) {
								me.$startInput.val(dateUtil.format(end));
							}
						});
					}
				};
			})());
		},

		/**
		 * min, max 날짜 설정
		 * @private
		 */
		_setMinMaxDate: function () {
			var me = this,
				startDate = dateUtil.parse(me.$startInput.val()),
				endDate = dateUtil.parse(me.$endInput.val());

			me.$startInput.module('calendar').setMaxDate(null);
			me.$endInput.module('calendar').setMinDate(null);

			if (dateUtil.isValid(startDate)) {
				me.$endInput.module('calendar').setMinDate(startDate);
			}

			if (dateUtil.isValid(endDate)) {
				me.$startInput.module('calendar').setMaxDate(endDate);
			}
		},
		/**
		 * 셀렉트박스 리스트 갱신
		 * @param list
		 * @returns {*}
		 */
		update: function (list) {
			if (arguments.length === 0) {
				return this.$el.scSelectbox('update');
			} else {
				return this.$el.scSelectbox('update', list);
			}
		}
	});

	if (typeof define === "function" && define.amd) {
		define('modules/selectbox', [], function () {
			return Selectbox;
		});

		define('modules/dateselectbox', [], function(){
			return DateSelectbox;
		});
	}

})(jQuery, window[LIB_NAME]);

/*!
 * @module scui.ui.Modal
 * @author comahead
 * @email comahead@vi-nyl.com
 * @create 2014-11-25
 * @license MIT License
 */
(function ($, core, undefined) {
	"use strict";
	if (core.ui.Modal) { return; }

	var $doc    = $(document),
		$win    = $(window),
		$body   = $('body'),
		browser = core.browser,
		isTouch = browser.isTouch,
		ui      = core.ui,
		_zIndex = 500;

	// 모달관련해서 총괄을 하는 모듈
	var ModalManager = window.ModalManager = {
		// 모달이 여러개 띄워지는 것을 허용할 것인가...
		overlap: false,
		init: function (options) {
			var me = this;

			me.options = $.extend({}, options);
			// 열려져 있는 모달을 담은 배열
			me.stack = [];
			// 현재 최상위에 보이는 모달
			me.active = null;
			// 글로벌이벤트 바인드 여부
			me.globalEventBind = false;
			// 내부에서만 포커스 이동시킬것인가
			me.isForceFocusin = true;

			me._bind();
		},

		_bind: function () {
			var me = this;

			$doc.on('modalshow.modalmanager', '.ui_modal_layer', function (e) {
				var $modal = $(e.currentTarget),
					modal  = $modal.scModal('instance');

				// 160219 : GNB가 열려있을 경우 무한루프가 발생하므로 무조건 닫는다.
				(typeof gnb !== 'undefined') && gnb.closeAll();
				// 다중 모달 모드가 아닐 경우 기존 모달을 닫는다,
				if (!ModalManager.overlap) {
					me.closeAll();
				}
				me.active = modal;
				// stack에 추가
				me.add(modal);
			}).on('modalshown.modalmanager', '.ui_modal_layer', function (e) {
				!me.globalEventBind && me._bindGlobalEvent();
				if (me.stack.length === 1) {
					// 모달이 떠 있는 상태에서 body 본문을 을 안읽도록 aria 추가
					$('#wrap').attr('aria-hidden', 'true');
				}
				//core.ui.setBodyOverflow(true);
			});

			// 링크나 버튼에  data-control="modal" 가 있으면 관련한 모달이 뜨도록 처리
			$doc.on('click.modalmanager', '[data-control=modal]', function (e) {
				e.preventDefault();

				var $el   = $(this),
					$next = $el.next('.laypop_wrap, .laypop_mpc'),
					target, $modal;
				if ($next.size() > 0) {
					// 모달이 버튼 다음에 위치하고 있을 때
					$next.scModal($.extend($el.data(), {opener: $el})).one('modalhidden.modalmanager', function (e) {
						setTimeout(function (){ $el[0].focus(); });
					});
				} else {
					if (target = ($el.attr('href') || $el.attr('data-target') || $el.attr('data-href'))) {
						// ajax형 모달인 경우
						if (!/^#/.test(target)) {
							if (window.scard && $el.data('crossDomain') && scui.browser.isIE && scui.browser.ieVersion < 10  ) {
								scard.ajax({
									url: target,
									contentType: 'html',
									success: function(html){
										var $tmp = $('<div></div>').html(html);
										$modal = $tmp.children().appendTo('body');
										$modal.addClass('ui_modal_dynamic').buildUIControls().scModal($.extend({
											removeOnClose: true
										}, $el.data(), {opener: $el})).one('modalhidden', function (e) {
											setTimeout(function (){ $el[0].focus(); });
										});
										$tmp.remove(), $tmp = null;
										$el.triggerHandler('modalloaded', {url: target, modal: $modal});
									}
								});
							} else {
								$.ajax({
									url: target
								}).done(function (html) {
									var $tmp = $('<div></div>').html(html);
									$modal = $tmp.children().appendTo('body');
									$modal.addClass('ui_modal_dynamic').buildUIControls().scModal($.extend({
										removeOnClose: true
									}, $el.data(), {opener: $el})).one('modalhidden', function (e) {
										setTimeout(function (){ $el[0].focus(); });
									});
									$tmp.remove(), $tmp = null;
									$el.triggerHandler('modalloaded', {url: target, modal: $modal});
								});
							}
						} else {
							// 모달이 버튼과 다른 곳에 위치하고 있을 때 target 속성에 모달 id을 설정
							$(target).scModal($.extend($el.data(), {opener: $el})).one('modalhidden', function (e) {
								setTimeout(function (){ $el[0].focus(); });
							});
						}
					}
				}
			});
		},
		// 초기에 글로벌 이벤트를 바인딩 하지 않고 모달이 한개라도 띄워졌을 때,
		// 비로소 글로벌이벤트를 바인딩 시킨다.
		_bindGlobalEvent: function () {
			var me = this;

			if (me.globalEventBind) {
				return;
			}
			me.globalEventBind = true;

			// 창 리사이징시에 가운데에 위치시킨다.
			$win.on('resizeend.modalmanager', function () {
				for (var i = -1, modal; modal = me.stack[++i];) {
					modal.isShown && modal.center();
				}
			});

			// 창이 다 닫히면 글로벌이벤트를 언바인딩 시킨다
			$doc.on('modalhidden.modalmanager', '.ui_modal_layer', function (e) {
				var $modal = $(e.currentTarget),
					modal  = $modal.scModal('instance');

				// zindex -= 1
				me.revertZIndex();
				me.remove(modal);

				if (me.stack.length > 0) {
					me.active = me.stack[me.stack.length - 1];
				} else {
					me.active = null;
					me._unbindGlobalEvent();
					// 보이스오버가 본문 내용을 다시 읽을 수 있도록 aria  속성을 뺀다.
					$('#wrap').removeAttr('aria-hidden');
				}
				//core.ui.setBodyOverflow(false);
			}).on('focusin.modalmanager', function (e) {
				// 탭키로 포커싱 이동 시 모달안에 머물도록 처리
				if (!me.active || me.isForceFocusin === false) {
					return;
				}
				if (me.active.isShown
					&& me.active.$el[0] !== e.target
					&& !$.contains(me.active.$el[0], e.target)) {
					me.active.$el.find(':focusable').first().focus();
					e.stopPropagation();
				}
			});
		},
		// 글로벌이벤트 언바인딩
		_unbindGlobalEvent: function () {
			$win.off('resizeend.modalmanager');
			$doc.off('modalhidden.modalmanager');
			$doc.off('focusin.modalmanager');
			this.globalEventBind = false;
		},
		forceFocusin: function (flag) {
			this.isForceFocusin = flag;
		},
		// 모달 stack 추가
		add: function (modal) {
			this.stack.push(modal);
		},
		// 모달 stack 에서 제거
		remove: function (modal) {
			this.stack = core.array.remove(this.stack, modal);
		},
		// 전체 모달 닫기
		closeAll: function () {
			for(var i = this.stack.length - 1; i >= 0; i--) {
				this.stack[i].close();
			}
		},
		// 모달을 띄울 때 zindex를 9000부터 시작하여 1씩 증가시켜 모달에 설정한다.
		nextZIndex: function () {
			var zi = _zIndex;
			_zIndex += 1;
			return zi;
		},
		// 모달이 닫힐 때 zindex를 -1 반환.
		revertZIndex: function () {
			_zIndex -= 1;
		}
	};
	ModalManager.init();


	// Modal ////////////////////////////////////////////////////////////////////////////
	/**
	 * 모달 클래스<br />
	 * // 기본 옵션 <br />
	 * options.overlay:true 오버레이를 깔것인가<br />
	 * options.clone: true  복제해서 띄울 것인가<br />
	 * options.closeByEscape: true  // esc키를 눌렀을 때 닫히게 할 것인가<br />
	 * options.removeOnClose: false // 닫을 때 dom를 삭제할것인가<br />
	 * options.draggable: true              // 드래그를 적용할 것인가<br />
	 * options.dragHandle: 'h1.title'       // 드래그대상 요소<br />
	 * options.show: true                   // 호출할 때 바로 표시할 것인가...
	 *
	 * @class
	 * @name scui.ui.Modal
	 * @extends scui.ui.View
	 */
	var Modal = ui('Modal', /** @lends scui.ui.Modal# */ {
		bindjQuery: 'modal',
		defaults: {
			overlay: true,
			clone: true,
			closeByEscape: true,
			overlayClose: false,
			removeOnClose: false,
			draggable: false,
			autoAlign: true,
			dragHandle: 'header h1',
			show: true,
			overlayOpacity: 0.7,
			effect: 'slide', // slide | fade | none
			cssTitle: '.ui_modal_title',
			flexible: false, // 'both' = true, 'horiz', 'vert'
			forceTop: 0,
			offsetTop: 16,
			offsetLeft: 16
		},

		events: {
			'click button[data-event]': function (e) {
				var me   = this,
					$btn = $(e.currentTarget),
					event = ($btn.attr('data-event') || ''),
					ev;

				if (event) {
					me.triggerHandler(ev = $.Event('modal' + event), [me]);
					if (ev.isDefaultPrevented()) {
						return;
					}
				}

				//this.hide();
			},
			'click .close, .ui_close': function (e) {
				e.preventDefault();
				e.stopPropagation();

				this.hide();
			}
		},

		selectors: {
			header: '>.laypop_header',
			content: '>.laypop_content',
			scroller: '>.laypop_content>.ui_scrollview',
			buttonWrap: '>.laypop_content>.btn_wrap'
		},

		/**
		 * 생성자
		 * @constructors
		 * @param {String|Element|jQuery} el
		 * @param {Object} options
		 * @param {Boolean}  options.overlay:true 오버레이를 깔것인가
		 * @param {Boolean}  options.clone: true    복제해서 띄울 것인가
		 * @param {Boolean}  options.closeByEscape: true    // esc키를 눌렀을 때 닫히게 할 것인가
		 * @param {Boolean}  options.removeOnClose: false   // 닫을 때 dom를 삭제할것인가
		 * @param {Boolean}  options.draggable: true                // 드래그를 적용할 것인가
		 * @param {Boolean}  options.dragHandle: 'h1.title'     // 드래그대상 요소
		 * @param {Boolean}  options.show: true                 // 호출할 때 바로 표시할 것인가...
		 */
		initialize: function (el, options) {
			var me = this;

			if (!$.contains(document, el)) {
				$(el).appendTo('body').addClass('ui_modal_dynamic');
			}

			if (me.supr(el, options) === false) {
				return;
			}

			me.$el.addClass('ui_modal_layer');

			me.isShown = false;
			me.isDynamicModal = me.$el.hasClass('ui_modal_dynamic');
			me._originalDisplay = me.$el.css('display');

			me.$el.css({
				position: 'absolute',
				backgroundColor: '#ffffff',
				outline: 'none',
				backgroundClip: 'padding-box',
				marginLeft: 0,
				marginTop: 0
			});

			me.$el.on('optionchange', function (e, data) {
				if (data.name === 'autoAlign') {
					me.layout();
				}
			});

			me.options.show && core.util.waitImageLoad(me.$('img')).done(function () {
				me.show();
			});
		},

		_bindAria: function () {
			var me = this;
			// TODO
			me.$el.attr({
				'role': 'dialog',
				//'aria-hidden': 'false',
				'aria-describedby': me.$content.attr('id') || me.$content.attr('id', me.cid + '_content').attr('id'),
				'aria-labelledby': me.$('h1').attr('id') || me.$('h1').attr('id', me.cid + '_title').attr('id')
			});
		},

		/**
		 * zindex때문에 모달을 body바로 위로 옮긴 후에 띄우는데, 닫을 때 원래 위치로 복구시켜야 하므로,
		 * 원래 위치에 임시 홀더를 만들어 놓는다.
		 * @private
		 */
		_createHolder: function () {
			var me = this;
			if (me.isDynamicModal) { return; }
			me.$holder = $('<span class="ui_modal_holder" style="display:none;"></span>').insertAfter(me.$el);
		},

		/**
		 * 원래 위치로 복구시키고 홀더는 제거
		 * @private
		 */
		_replaceHolder: function () {
			var me = this;

			if (me.isDynamicModal) { return; }
			if (me.$holder) {
				me.$el.insertBefore(me.$holder);
				me.$holder.remove();
			}
		},

		/**
		 * 토글
		 */
		toggle: function () {
			var me = this;

			me[me.isShown ? 'hide' : 'show']();
		},

		/**
		 * 표시
		 */
		show: function () {
			if (this.isShown) {
				return;
			}

			var me   = this,
				opts = me.options,
				e    = $.Event('modalshow');

			me.trigger(e);
			if (me.isShown || e.isDefaultPrevented()) {
				return;
			}

			me.$scroller.find('>.ui_scrollarea').css({'height': '100%'});
			if (core.browser.isMobile && me.options.flexible) {
				me.$el.css('maxHeight', 'none');
				me.$scroller.find('>.ui_scrollarea').css('maxHeight', 'none');
			}

			me.isShown = true;
			if (opts.title) {
				me.$(opts.cssTitle).html(opts.title || '알림');
			}

			me._createHolder();
			me._createModalContainer();
			me.layout();

			var defer = $.Deferred();
			if (opts.effect === 'fade') {
				me.$el.hide().fadeIn('fast', function () {
					defer.resolve();
				});
			} else if (opts.effect === 'slide') {
				var modalHeight = me.$el.height(),
					winHeight = core.util.getWinHeight();
				me.$el.css({
					'top': -modalHeight
				}).animate({top: me.forceResize ? opts.offsetTop :  (opts.forceTop > 0 ? opts.forceTop : (winHeight - modalHeight) / 2)}, 400, function () {
					defer.resolve();
				});
			} else if (opts.effect === 'none') {
				me.$el.show();
				defer.resolve();
			} else {
				defer.resolve();
			}

			defer.done(function () {
				me.trigger('modalshown', {
					module: me
				});

				me._bindAria(); // aria 셋팅
				/*me.$el.attr('aria-hidden', 'false');*/
				me._draggabled();    // 드래그 기능 빌드
				if (me.options.closeByEscape){
					me._escape();   // esc키이벤트 바인딩
				}
				//// ModalManager로 옮김: me._enforceFocus();   // 탭키로 포커스를 이동시킬 때 포커스가 레이어팝업 안에서만 돌도록 빌드
				me._focusing();
			});

		},

		/**
		 * 표시때 포커싱대상에 포커스 주기
		 * @private
		 */
		_focusing: function () {
			var me = this;
			var $focusEl = me.$('[data-autofocus=true]');
			if ($focusEl.size() > 0) {
				$focusEl.eq(0).focus();
			} else {
				me.$el.find('h1:first').attr('tabindex', 0).css('outline', 'none').focus();
			}
		},

		/**
		 * 숨김
		 */
		hide: function (e) {
			if (e) {
				e.preventDefault();
			}

			var me = this;
			e = $.Event('modalhide');
			me.trigger(e);
			if (!me.isShown || e.isDefaultPrevented()) {
				return;
			}

			var defer = $.Deferred();
			me.isShown = false;
			if (me.options.effect === 'fade') {
				me.$el.fadeOut('fast', function () {
					defer.resolve();
				});
			} else if (me.options.effect === 'slide') {
				me.$el.animate({
					top: -me.$el.outerHeight()
				}, 400, function () {
					defer.resolve();
				});
			} else if(me.options.effect === 'none') {
				me.$el.hide();
				defer.resolve();
			} else {
				defer.resolve();
			}

			defer.done(function () {
				me.trigger('modalhidden');

				me.$el.removeClass('ui_modal_layer');    // dom에 추가된 것들 제거
				if (me.options.closeByEscape){
					me._escape(false);    // esc 키이벤트 제거
				}

				if (me.options.opener) {
					$(me.options.opener).removeAttr('aria-controls').focus();    // 레이어팝업을 띄운 버튼에 포커스를 준다.
				}

				me.$el.css({
					'position': '',
					'top': '',
					'left': '',
					'outline': '',
					'marginLeft': '',
					'marginTop': '',
					'backgroundClip': '',
					'zIndex': '',
					'display': me._originalDisplay
				}).off('.'+me.cid);////.attr('aria-hidden', 'true');
				me._removeModalContainer();
				//me.$container.remove();
				//me.$container = null;    // 오버레이를 제거
				////// $('body').removeAttr('aria-hidden');    // 비활성화를 푼다.

				me.release();
			});
		},


		/**
		 * 도큐먼트의 가운데에 위치하도록 지정
		 */
		layout: function () {
			var me = this,
				opts = me.options,
				width, height, attr, marginRight, marginTop,
				paddingBottom, contentHeight, buttonWrapHeight,
				winHeight = core.util.getWinHeight(),
				winWidth  = Math.max(core.util.getWinWidth(), core.util.getDocWidth());

			me.$el.css({
				'display': 'inline',
				'visibility': 'hidden',
				'top': '',
				'left': '',
				'height': '',
				'width': ''
			});
			me.$content.css('height', '');
			me.$scroller.css('height', '');
			width = me.$el.width();
			height = me.$el.height();

			attr = {
				visibility: '',
				display: 'inline'
			};

			me.forceResize = false;
			if (core.browser.isMobile && opts.flexible) {
				me.forceResize = true;
				attr.top = opts.offsetTop;
				attr.height = winHeight - (opts.offsetTop * 2) - parseInt(me.$el.css('paddingBottom'), 10);
				// TODO 2015-08-10 퍼블리싱 요청으로 left 및 width 값 삭제
				//attr.left = opts.offsetLeft;
				//attr.width = winWidth - (opts.offsetLeft * 2);
			} else {
				if (height > winHeight) {
					me.forceResize = true;
					attr.top = 0;
					attr.height = winHeight;
				} else {
					//attr.top = (winHeight - height) / 2;
					attr.top = (opts.forceTop > 0 ? opts.forceTop : (winHeight - height) / 2);
					attr.height = '';
				}
				marginRight = parseInt(me.$el.css('margin-right') || 0, 10);
				attr.left = Math.max(marginRight, (width > winWidth ? 0 : ((winWidth - width) / 2)));
			}

			if (me.forceResize) {
				marginTop = parseInt(me.$content.css('marginTop'), 10);
				paddingBottom = parseInt(me.$content.css('paddingBottom'), 10);
				buttonWrapHeight = me.$buttonWrap.outerHeight();
				contentHeight = (attr.height - me.$header.outerHeight() - marginTop - paddingBottom);

				me.$content.css('height', contentHeight);
				me.$scroller.css('height', contentHeight - buttonWrapHeight);
			}
			if (me.options.autoAlign === false) {
				delete attr.top;
				delete attr.left;
			}
			me.$el.stop().css(attr);
			me.$scroller.scScrollview('update');
		},

		/**
		 * 타이틀 영역을 드래그기능 빌드
		 * @private
		 */
		_draggabled: function () {
			var me      = this,
				options = me.options;

			if (!options.draggable || me.bindedDraggable) {
				return;
			}
			me.bindedDraggable = true;

			if (options.dragHandle) {
				me.$el.css('position', 'absolute');
				core.css3.prefix('user-select') && me.$(options.dragHandle).css(core.css3.prefix('user-select'), 'none');
				me.on('mousedown touchstart', options.dragHandle, function (e) {
					e.preventDefault();

					var isMouseDown = true,
						pos         = me.$el.position(),
						oriPos      = {
							left: e.pageX - pos.left,
							top: e.pageY - pos.top
						}, handler;

					$doc.on(me.getEN('mousemove mouseup touchmove touchend touchcancel'), handler = function (e) {

						switch (e.type) {
							case 'mousemove':
							case 'touchmove':
								if (!isMouseDown) {
									return;
								}
								me.$el.css({
									left: e.pageX - oriPos.left,
									top: e.pageY - oriPos.top
								});
								break;
							case 'mouseup':
							case 'touchend':
							case 'touchcancel':
								isMouseDown = false;
								$doc.off(me.getEN(), handler);
								var offset = me.$el.offset();
								if (offset.top < 0) {
									offset.top = 10;
								}
								if (offset.left < 0) {
									offset.left = 10;
								}
								me.$el.css(offset);
								break;
						}
					});
				});

				me.$(options.dragHandle).css('cursor', 'move');
			}
		},

		/**
		 * 모달이 띄워진 상태에서 탭키를 누를 때, 모달안에서만 포커스가 움직이게
		 * @private
		 */
		_enforceFocus: function () {
			var me = this;
			$doc.off('focusin.'+me.cid)
				.on('focusin.'+me.cid, me.proxy(function(e) {
					if (me.$el[0] !== e.target && !$.contains(me.$el[0], e.target)) {
						me.$el.find(':focusable').first().focus();
					}
				}));
		},

		/**
		 * esc키를 누를 때 닫히도록
		 * @private
		 */
		_escape: function (isOff) {
			if (isTouch) {
				return;
			}
			var me = this;

			if (isOff !== false) {
				me.off('keyup').on('keyup', me.proxy(function (e) {
					me.off('keyup');
					e.which === 27 && me.hide();
				}));
			} else {
				me.off('keyup');
			}
		},

		/**
		 * 컨테이너 생성
		 * @private
		 */
		_createModalContainer: function () {
			var me = this;

			me.$container = $('<div class="ui_modal_container" />');
			if (me.options.overlay) {
				me.$dim = $('<div class="ui_modal_dim" />');
				me.$dim.css({
					'backgroundColor': 'none',
					'opacity': me.options.overlayOpacity,
					'position': 'fixed',
					'top': 0,
					'left': 0,
					'right': 0,
					'height': '120%',
					'z-index': -1 /* IOS dim 결함처리방법 1 -> -1 */
				}).appendTo(me.$container);
			}

			me.$container.css({
				'position': 'fixed',
				'top': 0,
				'left': 0,
				'right': 0,
				'height': '100%',
				//'bottom': -100,
				'zIndex': ModalManager.nextZIndex()
			}).on('mousewheel DOMMouseScroll wheel touchmove', function (e) {
				e.preventDefault();
			}).on('click', function (e) {
				// 151009_라디오 및 체크박스처럼 Document에 이벤트를 바인드한 것이 작동하지 않는다. - 강태진
				//e.stopPropagation(); // TODO: 문제있으면 빼주세요.
			}).append(me.$el.css({
				'zIndex': 2
			})).appendTo('body');

			core.browser.isTouch && me.$container.on('touchmove.'+me.cid, function (e) {
				e.preventDefault();
			});

			if (me.options.overlayClose) {
				me.$container.off('click.modal').on('click.modal', function (e) {
					if (e.target != e.currentTarget) {
						return;
					}
					me.$container.off('click.modal');
					me.hide();
				});
			}

		},

		/**
		 * 컨테이너 제거
		 * @private
		 */
		_removeModalContainer: function () {
			var me = this;

			if (me.options.removeOnClose) {
				me.$el.remove();    // 닫힐 때 dom에서 삭제하도록 옵션이 지정돼있으면, dom에서 삭제한다.
				me.$holder && me.$holder.remove();
			} else {
				me._replaceHolder();    // body밑으로 뺀 el를 다시 원래 위치로 되돌린다.
			}
			me.$dim.off();
			me.$container.off().remove();
			me.$dim = null;
			me.$container = null;
		},

		/**
		 * 모달의 사이즈가 변경되었을 때 가운데위치를 재조절
		 * @example
		 * $('...').scModal(); // 모달을 띄운다.
		 * $('...').find('.content').html( '...');  // 모달내부의 컨텐츠를 변경
		 * $('...').scModal('center');    // 컨텐츠의 변경으로 인해 사이즈가 변경되었으로, 사이즈에 따라 화면가운데로 강제 이동
		 */
		center: function () {
			this.layout();
		},

		/**
		 * 열기
		 */
		open: function () {
			this.show();
		},

		/**
		 * 닫기
		 */
		close: function () {
			this.hide();
		},

		/**
		 *
		 */
		release: function () {
			var me = this;

			me.supr();
		}
	});


	/**
	 * 열려 있는 레이어팝업을 가운데에 위치시키는 글로벌이벤트
	 * @example
	 * scui.PubSub.trigger('resize:modal')
	 */
	/*core.PubSub.on('resize:modal', function() {
	 if(Modal.active){
	 Modal.active.center();
	 }
	 });*/

	//윈도우가 리사이징 될때 가운데에 자동으로 위치시킴
	/*$(window).on('resize.modal', function() {
	 if(Modal.active){
	 Modal.active.center();
	 }
	 });*/

	core.modal = function (el, options) {
		$(el).scModal(options);
	};

	/**
	 * @class
	 * @name scui.ui.AjaxModal
	 * @description ajax로 불러들인 컨텐츠를 모달로 띄워주는 모듈
	 * @extends scui.ui.View
	 */
	$.ajaxModal = core.ui.ajaxModal = function () {
		var $modal,
			promise = $.Deferred();

		$.ajax.apply($.ajax, core.toArray(arguments)).done( function (html) {
			var $tmp = $('<div>').html(html);
			$modal = $tmp.children().addClass('ui_modal_dynamic').appendTo('body');
			$modal.scModal({removeOnClose: true}).buildUIControls();
			promise.resolve($modal);
			$tmp = null;
		}).fail(function (){
			promise.reject.apply(promise, arguments);
		});

		promise.closeModal = function () {
			$modal &&  $modal.scModal('close');
			$modal = null;
		};

		return promise;
	};

	core.ui.alert = function () {
		/**
		 * 얼럿레이어
		 * @memberOf scui.ui
		 * @name alert
		 * @function
		 * @param {string} msg 얼럿 메세지
		 * @param {Object} options 모달 옵션
		 * @example
		 * scui.ui.alert('안녕하세요');
		 */
		return function (msg, options) {
			if (typeof msg !== 'string' && arguments.length === 0) {
				options = msg;
				msg = '';
			}
			var el = $(core.ui.alert.tmpl).appendTo('body').find('div.ui_content').html(msg).end();
			var modal = new Modal(el, core.extend({removeOnClose: true, effect: 'fade'}, options));
			modal.getElement().buildUIControls();
			modal.on('modalhidden', function () {
				el = null;
				modal = null;
			});
			return modal;
		};
	}();
	core.ui.alert.tmpl = ['<article class="laypop_mpc lp480">',
		'<header class="laypop_header">',
		'<h1 id="modal_32_title" tabindex="0" style="outline: none;">알림창</h1>',
		'</header>',
		'<div class="laypop_content" id="modal_32_content">',
		'<div class="">',
		'<div class="ui_content">',
		'</div>',
		'</div>',
		'<div class="btn_wrap">',
		'<button type="button" class="btn_pop ui_close" data-event="ok"><span>확인</span></button>',
		'</div>',
		'</div>',
		'<footer class="laypop_footer">',
		'<a href="#" class="close"><span class="hide">레이어팝업 닫기</span></a>',
		'</footer>',
		'</article>'].join('');
	///////////////////////////////////////////////////////////////////////////////////////

	if (typeof define === "function" && define.amd) {
		define('modules/modal', [], function () {
			return Modal;
		});
	}

})(jQuery, window[LIB_NAME]);

/*!
 * @module scui.ui.Tooltip
 * @author odyseek
 * @email comahead@vinylc.com
 * @create 2015-03-17
 * @license MIT License
 *
 * @modifier 김승일 책임(comahead@vinylc.com)
 */
(function ($, core, undefined) {
	"use strict";
	if (core.ui.Tooltip) { return; }

	var $doc    = $(document),
		$win    = $(window),
		isTouch = core.browser.isTouch;

	/**
	 * 툴팁 레이어
	 * @class
	 * @name scui.ui.Tooltip
	 * @extends scui.ui.View
	 */
	var Tooltip = core.ui('Tooltip', /** @lends scui.ui.Tooltip# */{
		bindjQuery: 'tooltip',
		defaults: {
			interval: 200,
			action: 'mouseenter' // click, mouseenter
		},

		/**
		 * 생성자
		 * @param {jQuery|Node|String} el 대상 엘리먼트
		 * @param {JSON} options {Optional} 옵션
		 */
		initialize: function (el, options) {
			var me = this;

			if (me.supr(el, options) === false) {
				return;
			}

			me.$el.removeAttr('data-control');
			me.$tooltip = (me.$el.attr('data-tooltip-target')
				? $(me.$el.attr('data-tooltip-target'))
				: me.$el.next('div'));
			me.isShown = false;
			me.openTimer = me.closeTimer = null;

			me._bindEvents();
			if (me.options.eventType === me.options.action) {
				me.open();
			}
			me.options.action = me.options.eventType;
		},

		/**
		 * 이벤트 바인딩
		 * @private
		 */
		_bindEvents: function () {
			var me= this,
				handler, timer;

			switch (me.options.action) {
				case 'click':
					me._bindClickEvents();
					me.$tooltip.on('click.tooltip', '.ui_tooltip_close', function (e) {
						e.preventDefault();
						me.close();
						me.$el.focus();
					});
					break;
				case 'mouseenter':
					me._bindOverEvents();
					me.$tooltip.find('.ui_tooltip_close').hide();
					break;
			}


			if (!core.browser.isTouch) {
				me.$el.on('focusin focusout', handler = function (e) {
					clearTimeout(timer), timer = null;
					switch(e.type) {
						case 'focusin':
							break;
						case 'focusout':
							timer = setTimeout(function () {
								me.close();
							}, 100);
							break;
					}
				});

				me.$tooltip.attr('tabindex', 0).css('outline', 'none').on('click', function (e) {
					clearTimeout(timer), timer = null;
				}).on('focusin focusout', handler);
			}
		},

		/**
		 * 클릭기반일 때 관련이벤트 바인딩
		 * @private
		 */
		_bindClickEvents: function () {
			var me = this;

			me.$el.on('click.tooltip', function (e) {
				e.preventDefault();
				if (me.isShown) {
					me.close();
				} else {
					me.open();
				}
			});
		},

		/**
		 * 마우스오버기반일 때 관련이벤트 바인딩
		 * @private
		 */
		_bindOverEvents: function () {
			var me = this;

			// 마우스가 버튼위에서 .5초이상 머물었을 때만 툴팁이 표시되며,
			// 마우스가 버튼과 툴팁박스를 완전히 벗어나서 .5초가 지났을 때만 툴팁이 사라지도록 처리
			// 마우스가 닿을 때마다 보였다안보였다하는 건 너무 난잡해 보여서...
			me.$el.add(me.$tooltip).on('focusin mouseenter', me.open.bind(me))
				.on('focusout mouseleave', me.close.bind(me));
			me.$el.on('click', function (e) {e.preventDefault();});
		},

		/**
		 * 티이머 오프
		 * @private
		 */
		_clearTimer: function () {
			var me = this;

			clearTimeout(me.openTimer), me.openTimer = null;
			clearTimeout(me.closeTimer), me.closeTimer = null;
		},

		/**
		 * 표시
		 */
		open: function () {
			var me     = this;

			if (me.isShown) { return; }
			me.isShown = true;
			switch (me.options.action) {
				case 'mouseenter':
					me._clearTimer();
					me.openTimer = setTimeout(function () {
						me._open();
					}, me.options.interval);
					break;
				case 'click':
					me._open();
					break;
			}
		},

		_open: function () {
			var me = this;
			me.$tooltip.stop().fadeIn(100);
			$doc.on('click.'+me.cid, function (e) {
				if (core.dom.contains(me.$el.get(0), e.target, true)
					|| core.dom.contains(me.$tooltip.get(0), e.target, true)) {
					return;
				}
				me.close();
			});
		},

		/**
		 * 숨김
		 */
		close: function () {
			var me = this;
			if (!me.isShown) { return; }
			me.isShown = false;
			switch (me.options.action){
				case 'mouseenter':
					me._clearTimer();
					me.closeTimer = setTimeout(function () { me._close(); }, 100);
					break;
				case 'click':
					me._close();
					break;
			}
		},

		_close: function () {
			var me = this;

			me.$tooltip.stop().fadeOut(100);
			$doc.off('.'+me.cid);
		},

		/**
		 * 소멸자
		 */
		release: function () {
			var me = this;

			me.supr();
			clearTimeout(me.openTimer), me.openTimer = null;
			clearTimeout(me.closeTimer), me.closeTimer = null;
			me.$tooltip.off();
			$doc.off('.'+me.cid);
		}
	});

	$doc.on('mouseenter.tooltip click.tooltip', '[data-control=tooltip]', function (e) {
		e.preventDefault();

		var $btn = $(this);
		//if ($btn.data('ui_tooltip')){ return; }

		$btn.scTooltip({eventType: e.type});
	});

	if (typeof define === "function" && define.amd) {
		define('modules/tooltip', [], function () {
			return Tooltip;
		});
	}
})(jQuery, window[LIB_NAME]);

/*!
 * @module scui.ui.Tab
 * @author 김승일 책임(comahead@vi-nyl.com)
 * @create 2014-12-08
 * @license MIT License
 */
(function ($, core) {
	"use strict";

	if(core.ui.Tab){ return; }

	// 탭에 대한 퍼블리싱 케이스가 너무 많아 타입별로 클래스 작성
	var BaseTab = core.ui.View.extend({
		name: 'BaseTab',
		defaults: {
			tabSelector: '>li',
			btnSelector: '>a'
		},
		initialize: function (el, options) {
			var me = this, index;
			if (me.supr(el, options) === false) { return }

			me.$el[0].selectedIndex = 0;

			me._findControls();
			me._bindEvents();
			me._initTab();
		},
		_initTab: function (){
			var me = this, index;
			if ((index = me.$tabs.filter('.on').index()) >= 0) {
				me.selectTab(index);
			}
		},
		_findControls: function () {
			var me = this,
				selectors = [],
				contents = [];

			me.$tabs = me.$(me.options.tabSelector);
			me.$tabs.each(function () {
				var $el = me.options.btnSelector ? $(this).find(me.options.btnSelector) : $(this),
					cont = $el.attr('href') || $el.attr('data-href');
				if (cont && cont.length > 1 && cont.substr(0, 1) === '#') {
					selectors.push(cont);
				} else {
					// '#' 만 있으면 inner content
					contents.push($el.next().is('div')  ? $el.next() : {});
				}
			});

			if (selectors.length > 0) {
				me.$contents = $(selectors.join(', '));
			} else {
				me.$contents = $(contents);
			}
		},
		_bindEvents: function () {
			var me = this;
			me.$el.on('click', me.options.tabSelector + me.options.btnSelector, function (e) {
				e.preventDefault();
				if (me.getState('disabled')
					|| me.getState('readonly')
					|| $(this).hasClass('disabled')
					|| $(this).prop('disabled') === true) { return; }

				var index = me.$tabs.index(me.options.btnSelector ? me.$tabs.has(this) : this);
				me.selectTab(index);
			}).on('statechange', function (e, data) {
				switch(data.name) {
					case 'disabled':
					case 'readonly':
						if (data.value) {
							me.$tabs.find(':focusable').attr('tabindex', -1);
						} else {
							me.$tabs.find(':focusable').removeAttr('tabindex');
						}
						break;
				}
			});
		},

		// 별도의 처리가 필요한거는 오버라이드
		_selectTab: function (index) {},
		_toggleText: function (index) {
			var me = this,
				txtSpan = (me.options.btnSelector ? me.options.btnSelector + ' ' : '')+'span.hide';

			me.$tabs.find(txtSpan).html(' ');
			me.$tabs.eq(index).find(txtSpan).html('선택됨');
		},
		_getEventTarget: function (index) {
			var me = this;
			return me.options.btnSelector ? me.$tabs.eq(index).find(me.options.btnSelector) : me.$tabs.eq(index);
		},
		/**
		 * index에 해당하는 탭을 활성화
		 * @param {number} index 탭버튼 인덱스
		 */
		selectTab: function(index) {
			var me = this, e, param;
			if (me.getState('disabled') || me.getState('readonly')) { return; }
			if(index < 0 || (me.$tabs.length && index >= me.$tabs.length)) {
				index = me.options.selectedIndex;
			}

			param = {
				selectedIndex: index,
				tab: me.$tabs.get(index),
				content: me.$contents.get(index),
				sender: me._getEventTarget(index)
			};

			me.$el[0].selectedIndex = index;
			me.trigger(e = $.Event('tabchange'), param);
			if(e.isDefaultPrevented()) { me.$el[0].selectedIndex = me.selectedIndex; return false; }

			me.$el[0].selectedIndex = me.selectedIndex = index;
			me._selectTab(index);
			me._toggleText(index);

			me.$tabs.removeClass('on').eq(index).addClass('on');
			me.$contents.hide().eq(index).show();

			me.trigger('tabchanged', param);
		}
	});

	/**
	 * 다음 네항목 중에서 type에 따라 필요한걸 구현해주면 된다.
	 * defaults: 기본 옵션값
	 * _toggleText: 탭이 선택여부에 따른 숨김문구 변경하는 함수
	 * _selectTab: 선택될 때 호출되는 함수
	 * _initTab: 초기화 함수
	 */
	var TabTypes = {
		'type01': BaseTab,
		'type02': BaseTab.extend({ // 바로 하위에 버튼이 있는 경우
			defaults: {
				tabSelector: '>a, >button',
				btnSelector: ''
			},
			// overide
			_toggleText: function (index) {
				var me = this;
				me.$tabs.find('span.hide').html(' ');
				me.$tabs.eq(index).find('span.hide').html('선택됨');
			}
		}),
		'type03': BaseTab.extend({  // 탭이 탭영역을 벗어날 경우 좌우로 스와이핑 되는 탭
			defaults: {
				tabSelector: '>.tab_hbox>ul>li',
				btnSelector: '>a'
			},
			selectors: {
				tabBox: '>.tab_hbox',
				scroller: '>.tab_hbox>ul'
			},
			// overide
			_initTab: function(){
				var me = this, html, $ul, size;

				html = ['<div class="tab_nav" style="display:none;">',
					'<a href="#" class="prev_tab"><span class="hide">이전 탭보기</span></a>',
					'<a href="#" class="next_tab"><span class="hide">다음 탭보기</span></a>',
					'</div>'].join('');

				size = me._getTabsWidth();

				me.$scroller.css({'width': 1000});
				me.$tabBox.css({'margin': 0});
				me.$el.prepend(me.$tabNavi = $(html));

				var move = function(val, isAni) {
					if(isAni) {
						me.$scroller.stop().animate({'margin-left': val}, function(e) {
							enabled();
						});
					} else {
						me.$scroller.stop().css({'margin-left': val});
						enabled();
					}
				};
				var enabled = function(size) {
					var margin = parseInt(me.$scroller.css('margin-left'), 10) || 0;

					size = size || me._getTabsWidth();

					if(!size.isOver) {
						me.$tabNavi.hide();
						me.$tabBox.css({'margin': 0});
						me.$scroller.css('margin-left', 0);
					} else {
						me.$tabNavi.show();
						me.$tabBox.css({'margin': '0 ' + (me.$tabNavi.find('>a').width()) + 'px'});

						me.$tabNavi.find('>.prev_tab').toggleClass('on', margin !== 0 && size.tabWidth < size.tabsWidth);
						me.$tabNavi.find('>.next_tab').toggleClass('on', margin !== size.tabWidth - size.tabsWidth  && size.tabWidth < size.tabsWidth);
					}

				};

				// 탭 클릭
				me.on('click', '.tab_nav a', function(e) {
					e.preventDefault();

					var $el = $(this),
						size = me._getTabsWidth(),
						marginLeft = parseInt(me.$scroller.css('margin-left'), 10) || 0;

					if($el.hasClass('prev_tab')) {
						move(Math.min(0, marginLeft + (size.tabWidth * 0.5)), true);
					} else {
						move(Math.max(size.tabWidth - size.tabsWidth, marginLeft - (size.tabWidth * 0.5)), true);
					}
				});
				var marginLeft;
				me.$tabBox.swipeGesture().on('swipegesturestart', function () {
					if(!size.isOver) {
						return;
					}
					marginLeft = parseInt(me.$scroller.css('margin-left'), 10) || 0;
				}).on('swipegesturemove', function (e, data) {
					if(!size.isOver) {
						return;
					}
					if(data.direction === 'left') {
						move(Math.max(size.tabWidth - size.tabsWidth, marginLeft + data.diff.x));
					} else if(data.direction === 'right') {
						move(Math.min(0, marginLeft + data.diff.x));
					}
				});


				$(window).on('resizeend.'+me.cid, function() {
					size = me._getTabsWidth();
					if(size.isOver) {
						move(0);
					}
					enabled(size);
				});
				enabled(size);

				me.supr();
			},

			/**
			 * 탭 너비 구하기
			 * @returns {{isOver: boolean, tabWidth: *, tabsWidth: (number|tabsWidth)}}
			 * @private
			 */
			_getTabsWidth: function(){
				var me = this,
					tabsWidth = 0;

				me.$tabs.each(function(){
					tabsWidth += $(this).width() + 1;
				});

				var result = {
					tabWidth: me.$tabBox.width(),
					tabsWidth: tabsWidth
				};

				return {
					isOver: result.tabWidth < result.tabsWidth,
					tabWidth: result.tabWidth,
					tabsWidth: result.tabsWidth
				};
			}
		}),
		'type04': BaseTab.extend({  // 라디오박스
			defaults: {
				tabSelector: '>li',
				btnSelector: '>span>a'
			},
			// overide
			_initTab: function (){
				var me = this,
					index = me.$tabs.index(me.$tabs.has('>span>:radio:checked'));
				if (index < 0) {
					index = me.options.selectedIndex;
				}
				me.selectTab(index);
			},
			// overide
			_bindEvents: function () {
				var me = this;
				me.$el.on('checkedchanged', '>li>span>:radio', function (e) {
					e.preventDefault();
					if (me.getState('disabled')
						|| me.getState('readonly')
						|| $(this).prop('disabled') === true
						|| $(this).hasClass('disabled')) { return; }

					var index = me.$tabs.index($(this).closest('li').eq(0));
					me.selectTab(index, false);
				});
			},
			// overide
			selectTab: function (index, isOut) {
				var me = this;
				me.supr(index);
				if (isOut !== false) {
					me.$tabs.eq(index).find(':radio').checked(true, false);
				}
			},
			// overide
			_toggleText: function (index) {
				return false;
			}
		})
	};

	var Tab = core.ui('Tab', {
		bindjQuery: 'tab',
		defaults: {
			selectedIndex: 0
		},
		initialize: function (el, options) {
			var me = this,
				tabType, TabClass;

			tabType = $(el).data('tabType') || 'type01'; //'scrollTab';
			if (TabClass = TabTypes[tabType]) {
				var tab = new TabClass(el, $.extend({}, options, me.defaults));
				$.extend(me, tab);
			} else {
				throw new Error('탭가이드에 없는 형식입니다.');
			}
		}
	});

	if (typeof define === "function" && define.amd) {
		define('modules/tab', ['lib/jquery'], function() {
			return Tab;
		});
	}

})(jQuery, window[LIB_NAME]);


/*!
 * @module scui.ui.SwipeGesture
 * @author 김승일 책임(comahead@vi-nyl.com)
 * @create 2014-12-11
 * @license MIT License
 */
(function($, core, undefined) {
	"use strict";
	if (core.ui.SwipeGesture) { return; }

	var util = core.util;
	var SwipeGesture = core.ui('SwipeGesture', {
		defaults: {
			container: document,
			threshold: 50,
			direction: 'horizontal',
			swipeStart: null,
			swipeMove: null,
			swipeEnd: null
		},
		initialize: function(el, options) {
			var me = this;
			if (me.supr(el, options) === false) {
				return;
			}

			me.isHoriz = me.options.direction === 'horizontal' || me.options.direction === 'both';
			me.isVerti = me.options.direction === 'vertical' || me.options.direction === 'both';
			me._bindSwipeEvents();
		},
		_bindSwipeEvents: function() {
			var me = this,
				touchStart,
				downPos,
				isSwipe = false,
				isScroll = false;

			me.$el[0].onselectstart = function (){ return false; };
			me.$el.attr('unselectable', 'on');
			me.$el.on('mousedown.swipegesture, touchstart.swipegesture', function(downEvent) {
				if (downEvent.type === 'mousedown') {
					downEvent.preventDefault();
				}
				downPos = touchStart = util.getEventPoint(downEvent);
				isSwipe = isScroll = false;


				$(me.options.container).on('mousemove.swipegesture'+me.cid+' touchmove.swipegesture'+me.cid, function (moveEvent) {
					var touch = util.getEventPoint(moveEvent),
						diff, slope, swipeY, swipeX;
					if (!touchStart || isScroll) {
						return;
					}

					diff = util.getDiff(touch, touchStart);
					if (!isSwipe ) {
						swipeX = Math.abs(diff.y) / (Math.abs(diff.x) || 1);
						swipeY = Math.abs(diff.x) / (Math.abs(diff.y) || 1);
						if ((swipeX < 1 && me.isHoriz) || (swipeY < 1 && me.isVerti)) {
							touch.event = moveEvent;
							if (me._swipeCallback('start', touch) === false){ return; };
							if (me.triggerHandler('swipegesturestart', touch) === false){ return; };
							isSwipe = true;
						} else {
							if ((me.isHoriz && swipeX > 1) || (me.isVerti && swipeY > 1)) {
								isScroll = true;
							}
						}
					}

					if (isSwipe) {
						moveEvent.stopPropagation();
						moveEvent.preventDefault();

						touch.diff = diff;
						touch.direction = util.getDirection(touchStart, touch,  me.options.direction);
						touch.event = moveEvent;
						if (me._swipeCallback('move', touch) === false) { return; }
						if (me.triggerHandler('swipegesturemove', touch) === false) { return; }
					}
				}).on('mouseup.swipegesture'+me.cid+' mousecancel.swipegesture'+me.cid+' touchend.swipegesture'+me.cid+' touchcancel.swipegesture'+me.cid, function (upEvent) {
					if (isSwipe && touchStart) {
						var touch = util.getEventPoint(upEvent, 'end');
						touch.diff = util.getDiff(touch, touchStart);

						touch.direction = util.getDirection(touchStart, touch, me.options.direction);
						touch.event = upEvent;
						if(Math.abs(touch.diff.x) > me.options.threshold
							|| Math.abs(touch.diff.y) > me.options.threshold) {
							me._swipeCallback('end', touch);
							me.triggerHandler('swipegestureend', touch);
						} else {
							me._swipeCallback('cancel', touch);
							me.triggerHandler('swipegesturecancel', touch);
						}
						switch(touch.direction) {
							case 'left':
							case 'right':
								if(Math.abs(touch.diff.x) > me.options.threshold && me.isHoriz){
									me._swipeCallback(touch.direction, touch);
									me.triggerHandler('swipegesture'+touch.direction);
								}
								break;
							case 'up':
							case 'down':
								if(Math.abs(touch.diff.y) > me.options.threshold && me.isVerti){
									me._swipeCallback(touch.direction, touch);
									me.triggerHandler('swipegesture'+touch.direction);
								}
								break;
						}
					}/* else {
					 var pos = util.getEventPoint(upEvent, 'end');
					 if(downPos.x === pos.x || downPos.y === pos.y) {
					 $(upEvent.target).trigger('click', {fake: true});
					 }
					 }*/

					touchStart = null;
					isScroll = false;

					$(me.options.container).off('.swipegesture'+me.cid)
				});
			}).on('click.swipegesture', 'a, button', function(e) {
				if(!downPos){ return; }
				var pos = util.getEventPoint(e);
				if(downPos.x != pos.x || downPos.y != pos.y) {
					e.preventDefault();
					e.stopPropagation();
				}
			});
		},

		_swipeCallback: function (type, data) {
			var me = this, ret;
			me.options['swipe' + type] && (ret = me.options['swipe' + type].call(me, data));
			me.options['swipe'] && (ret = me.options['swipe'].call(me, type, data));
			return ret;
		},

		release: function(){
			this.$el.off('.swipegesture'+this.cid).off('.swipegesture');
			$(this.options.container).off('.swipegesture'+this.cid);
			this.supr();
		}
	});

	core.ui.bindjQuery(SwipeGesture, 'swipeGesture');
	if (typeof define === 'function' && define.amd) {
		define('modules/swipe-gesture', [], function (){
			return SwipeGesture;
		});
	}
})(jQuery, window[LIB_NAME]);

/*!
 * @module scui.ui.checkboxAllChecker
 * @author 김승일 책임(comahead@vi-nyl.com)
 * @create 2015-03-31
 * @license MIT License
 *
 * @modifier comahead@vi-nyl.com
 */
(function ($, core, undefined) {
	"use strict";
	if (core.ui.checkboxAllChecker) {
		return;
	}

	var CheckboxAllChecker = core.ui('CheckboxAllChecker', {
		bindjQuery: 'checkboxAllChecker',
		defaults: {
			mode: ''
		},
		initialize: function (el, options) {
			var me = this;

			if (me.supr(el, options) === false) {
				return;
			}

			me.allCheck = true;
			me.$wrapper = $(me.$el.attr('data-check-all'));
			me.checkOnce = me.$el.data('checkOnce');
			me.limit = me.$el.data('checkLimit');
			if (me.$wrapper.size() === 0) { return; }

			me._bindEvents();
		},
		_bindEvents: function () {
			var me = this,
				selector = ':checkbox:enabled:not(.ui_checkall_ignore)';

			// 전체선택 체크박스 선택시
			me.on('change', function (e) {
				//me.$wrapper.find(selector).not(this).checked(this.checked);
				// 속도걔선을 위해 querySelectorAll를 지원하는 브라우저서는 querySelectorAll를 사용해서 조회
				setTimeout(function () {
					if (me.limit > 0) {
						me.allCheck = false;
						me.$wrapper.find('[type=checkbox]:enabled:not(.ui_checkall_ignore):lt(' + me.limit + ')').not(this).checked(this.checked);
					} else if (me.$wrapper[0].querySelectorAll) {
						$(me.$wrapper[0].querySelectorAll('[type=checkbox]'))
							.filter(':enabled:not(.ui_checkall_ignore)').not(this).checked(this.checked);
					} else {
						me.$wrapper.find('[type=checkbox]:enabled:not(.ui_checkall_ignore)').not(this).checked(this.checked);
					}
				}.bind(this));
			});

			var i = 0,
				oldCount;
			// 소속 체크박스를 선택시
			me.$wrapper.on('checkedchanged', ':checkbox', function (e) {
				if (this === me.$el[0]) { return; }
				var count = me.$wrapper.find(selector + ':not(:checked)').not(me.$el[0]).length,
					checkedCount = me.$wrapper.find(selector + ':checked').not(me.$el[0]).length,
					allCount = me.$wrapper.find(selector).not(me.$el[0]).length;

				if (me.checkOnce) {
					me.$el.checked(checkedCount > 0, false);
				} else if (oldCount !== count && me.allCheck) {
					oldCount = count;
					me.$el.checked(count === 0, false); // 전체가 선택되어 있는지 여부에 따라 전체선택 checked
				} else if (checkedCount > me.limit) {
					$(this).checked(false, false);
					core.showMessage('N0000003', [me.limit]);
					oldCount = count;
					me.$el.checked(checkedCount === me.limit, false); // 전체가 선택되어 있는지 여부에 따라 전체선택 checked
				} else {
					me.$el.checked(checkedCount === me.limit || checkedCount === allCount, false); // 전체가 선택되어 있는지 여부에 따라 전체선택 checked
				}
			});
		}
	});

	if (typeof define === 'function' && define.amd) {
		define('modules/checkbox-all-checker', [], function (){
			return CheckboxAllChecker;
		});
	}

})(jQuery, window[LIB_NAME]);

/*!
 * @module scui.ui.Dropdown
 * @author 김승일 책임((comahead@vi-nyl.com)
 * @create 2015-03-31
 * @license MIT License
 *
 * @modifier comahead@vi-nyl.com
 */
(function ($, core, undefined) {
	"use strict";
	if (core.ui.Dropdown) {
		return;
	}

	var $doc = $(document),
		$win = $(window),
		isTouch = core.browser.isTouch;

	/**
	 * 드롭다운 레이어
	 * @class
	 * @name scui.ui.Dropdown
	 * @extends scui.ui.View
	 */

	var contains = function (parentEl, el) {
		if (!parentEl || !el) { return false; }
		if (parentEl === el || $.contains(parentEl, el)) { return true; }
		return false;
	};

	var Dropdown = core.ui('Dropdown', {
		bindjQuery: 'dropdown',
		defaults: {
			wrapper: 'parent', //
			dropdown: '.ui_dropdown_box',
			activeClass: 'on'
		},
		initialize: function (el, options) {
			var me = this;
			if(me.supr(el, options) === false) { return false; }

			me._findControls();
			me._bindEvents();
		},
		_bindEvents: function () {
			var me = this, $target;

			me.$el.on('click', function(e) {
				e.preventDefault();

				if (me.$wrapper.hasClass(me.options.activeClass)) {
					me.hide();
				} else {
					me.show();
				}
			});
			me.$wrapper.on('focusin focusout click', function(e) {
				clearTimeout(me.focusTimer);
				me.focusTimer = null;
				switch (e.type) {
					case 'focusout':
						me.focusTimer = setTimeout(function() {
							me.hide();
						}, 300);
						break;
				}
			});
		},
		_findControls: function() {
			var me = this;
			switch(true) {
				case me.$el.attr('data-target'):
					me.$wrapper = me.$el;
					break;
				case me.options.wrapper === 'parent':
					me.$wrapper = me.$el.parent();
					break;
				case me.options.wrapper.indexOf('closest') === 0:
					me.$wrapper = me.$el.closest(me.options.wrapper.split('=')[1]);
					break;
				default:
					me.$wrapper = $(me.options.wrapper);
					break;
			}
			return $();
		},
		show: function () {
			var me = this;

			if (me._toggle(true) === false){ me.hide(); return; }

			$doc.on('touchstart.' + me.cid + ' mousedown.' + me.cid, function(e) {
				clearTimeout(me.focusTimer);
				me.focusTimer = null;
				if (!core.dom.contains(me.$wrapper[0], e.target, true)) {
					me.hide();
				}
			});
			me.options.show && me.options.show();
		},
		hide: function () {
			var me = this;

			me._toggle(false);
			$doc.off('.' + me.cid);
			me.options.hide && me.options.hide();
		},
		_toggle: function (flag) {
			var me = this,
				ev;
			if (!me.el || flag === me.$wrapper.hasClass(me.options.activeClass)) {
				return false;
			}
			ev = $.Event(flag ? 'opendropdown' : 'closedropdown');
			me.$el.triggerHandler(ev);
			if (ev.isDefaultPrevented()) { return; }
			me.$wrapper.toggleClass(me.options.activeClass, flag);
		}
	});

	if (typeof define === 'function' && define.amd) {
		define('modules/dropdown', [], function (){
			return Dropdown;
		});
	}
})(jQuery, window[LIB_NAME]);

/*!
 * @module scui.ui.DropdownSub
 * @author 강태진((comahead@vinylc.com)
 * @create 2016-01-18
 * @license MIT License
 *
 * @modifier comahead@vinylc.com
 */
(function ($, core, undefined) {
	"use strict";
	if (core.ui.DropdownSub) {
		return;
	}

	var $doc = $(document),
		$win = $(window),
		isTouch = core.browser.isTouch;

	/**
	 * 드롭다운 레이어
	 * @class
	 * @name scui.ui.DropdownSub
	 * @extends scui.ui.View
	 */

	var contains = function (parentEl, el) {
		if (!parentEl || !el) { return false; }
		if (parentEl === el || $.contains(parentEl, el)) { return true; }
		return false;
	};

	var DropdownSub = core.ui('DropdownSub', {
		bindjQuery: 'dropdownSub',
		defaults: {
			wrapper: 'parent', //
			dropdown: '.ui_dropdown_box',
			activeClass: 'on'
		},
		initialize: function (el, options) {
			var me = this;
			if(me.supr(el, options) === false) { return false; }

			me._findControls();
			me.$dropOpen = me.$wrapper.find('.ui_dropdown_open');
			me.$dropClose = me.$wrapper.find('.ui_dropdown_close');
			me._bindEvents();
		},
		_bindEvents: function () {
			var me = this, $target;

			me.$el.on('click', function(e) {
				e.preventDefault();
				me.show();
				me.$dropOpen.hide();
				me.$dropClose.focus();
			});

			me.$dropClose.on('click', function(e) {
				e.preventDefault();
				me.hide();
				me.$dropOpen.show().focus();
			});

			me.$wrapper.on('focusin focusout click', function(e) {
				clearTimeout(me.focusTimer);
				me.focusTimer = null;
				switch (e.type) {
					case 'focusout':
						me.focusTimer = setTimeout(function() {
							me.$dropOpen.show();
							me.hide();
						}, 300);
						break;
				}
			});
		},
		_findControls: function() {
			var me = this;
			switch(true) {
				case me.$el.attr('data-target'):
					me.$wrapper = me.$el;
					break;
				case me.options.wrapper === 'parent':
					me.$wrapper = me.$el.parent();
					break;
				case me.options.wrapper.indexOf('closest') === 0:
					me.$wrapper = me.$el.closest(me.options.wrapper.split('=')[1]);
					break;
				default:
					me.$wrapper = $(me.options.wrapper);
					break;
			}
			return $();
		},
		show: function () {
			var me = this;

			if (me._toggle(true) === false){ me.hide(); return; }

			$doc.on('touchstart.' + me.cid + ' mousedown.' + me.cid, function(e) {
				clearTimeout(me.focusTimer);
				me.focusTimer = null;
				if (!core.dom.contains(me.$wrapper[0], e.target, true)) {
					me.hide();
				}
			});
			me.options.show && me.options.show();
		},
		hide: function () {
			var me = this;

			me.$dropOpen.show();
			me._toggle(false);
			$doc.off('.' + me.cid);
			me.options.hide && me.options.hide();
		},
		_toggle: function (flag) {
			var me = this,
				ev;
			if (!me.el || flag === me.$wrapper.hasClass(me.options.activeClass)) {
				return false;
			}
			ev = $.Event(flag ? 'opendropdown' : 'closedropdown');
			me.$el.triggerHandler(ev);
			if (ev.isDefaultPrevented()) { return; }
			me.$wrapper.toggleClass(me.options.activeClass, flag);
		}
	});

	if (typeof define === 'function' && define.amd) {
		define('modules/dropdown', [], function (){
			return Dropdown;
		});
	}
})(jQuery, window[LIB_NAME]);

/*!
 * @module scui.ui.HelpModal
 * @author 김승일 책임(comahead@vi-nyl.com)
 * @create 2015-09-23
 * @license MIT License
 */
(function ($, core, undefined) {
	"use strict";
	if (core.ui.HelpModal) { return; }

	var $doc    = $(document),
		$win    = $(window),
		$body   = $('body'),
		browser = core.browser,
		isTouch = browser.isTouch,
		ui      = core.ui,
		_zIndex = 9000;

	var CommonMenuModal = {
		initialize: function () {
			var me = this;

			me.isShown = false;
			me.isAnimating = false;

			//me.$el.wrap('<div>');
			me.$el.on('click', '.ui_close', function (e) {
				e.preventDefault();
				me.close();
				if (me.options.opener) {
					$(me.options.opener).focus();
				}
			});
		},

		/**
		 * 모달이 띄워진 상태에서 탭키를 누를 때, 모달안에서만 포커스가 움직이게
		 * @private
		 */
		_enforceFocus: function () {
			var me = this;
			$doc.off('focusin.'+me.cid)
				.on('focusin.'+me.cid, me.proxy(function(e) {
					if (me.$el[0] !== e.target && !$.contains(me.$el[0], e.target)) {
						me.$el.find(':focusable').first().not(this).focus();
					}
				}));
		},

		toggle: function () {
			if (this.isShown) {
				this.close();
			} else {
				this.open();
			}
		},

		/**
		 * 표시
		 */
		open: function (cb) {
			var me = this;

			if (me.isShown || me.isAnimating) {
				return;
			}

			var complete = function () {
				me.isAnimating = false;
				me.$el.find(':focusable:first').focus();
				cb && cb();
				me._enforceFocus();
				$win.on('resizeend.'+me.cid+' changemediasize.'+me.cid, function () {
					var top = (me.$el.attr('id') === 'help_recommand') ? parseInt($(me.options.opener).css('top'), 10) + (($(me.options.opener).height() - me.$el.height()) / 2) : '';
					me.positionTop(top, '');
				});
				$doc.on('click.'+me.cid, function (e) {
					if (!core.dom.contains(me.$el[0], e.target, true)
						&& !core.dom.contains(me.options.opener, e.target, true)) {
						me.close();
					}
				});
			};

			me.isShown = true;
			me.isAnimating = true;
			me.$el.triggerHandler('show');
			//me._getDim(me.options.dim).show();
			core.isMobileMode() && $(me.options.content).find('> a').hide();
			//me.top = (me.$el.attr('id') === 'help_recommand') ? parseInt($(me.options.opener).css('top'), 10) + (($(me.options.opener).height() - me.$el.height()) / 2) + 73 : '';
			// Help Modal 위치 조정 (컨텐츠 크기의 중앙에 오도록 수정함.) -> 향후 가변적 크기일 경우 위치값을 고정하여 계산할수 없고 컨텐츠의 중앙으로 위치하도록 해야함. after 역시 중앙으로 위치하는게 좋음....
			me.top = (me.$el.attr('id') === 'help_recommand') ? parseInt($(me.options.opener).css('top'), 10) + (($(me.options.opener).height() - me.$el.height()) / 2) : '';
			me.positionTop(me.top, complete);
			$('.ui_floating_content').css('zIndex', 54);
		},

		/**
		 * 숨김
		 */
		close: function (cb) {
			var me = this;

			if (!me.isShown || me.isAnimating) {
				return;
			}
			var complete = function () {
				me.$el.hide().triggerHandler('hidden');
				me.isAnimating = false;
				cb && cb();
				$win.off('.'+me.cid);
				$doc.off('.'+me.cid);
			};

			me.isShown = false;
			me.isAnimating = true;
			me.$el.hide().triggerHandler('hide');
			//!core.isMobileMode() && me._getDim(me.options.dim).hide();
			core.isMobileMode() && $(me.options.content).find('> a').show();
			if (core.isMobileMode()) {
				me.$el.stop().css({
					top: -(me.options.heightByMobile + 50)/*400*/
				});
				complete();
			} else {
				complete();
			}
			$('.ui_floating_content').css('zIndex', '');
		},

		_reposition: function (cb) {
			var me = this, isHeader;
			if (!me.isShown) { return; }
			if (core.isMobileMode()) {

				// 160120 - 헬프레이어가 뜨기전에 scrollTop값이 20이하인경우 스크롤을 이동한다. 최세웅 책임 요청.
				isHeader = ($(window).scrollTop() < 20) ? true : false;
				isHeader && $('html, body').animate({
					'scrollTop': 50
				}, 0);

				if (me.options.heightByMobile === 'auto') {
					me.$el.show()[0].style.cssText = 'margin-left:-400px;height: auto !important;';
					me.options.heightByMobile = me.$el.height();
				}

				var w = Math.min(me.options.widthByMobile/*332*/, $(window).width() - 40),
					h = Math.min(me.options.heightByMobile/*379*/, $(window).height() - 40);

				me.$el[0].style.cssText = 'display:block;top:50% !important;left:50% !important;' +
					'right:auto !important;bottom:auto !important;width:' + w + 'px !important;' +
					'height:' + h + 'px !important;margin-left:-' + (w / 2) + 'px;z-index:55;' +
					'margin-top:-' + (h / 2 - 20) + 'px;';
			} else {
				me.$el[0].style.cssText = 'display:block; width:'+me.options.widthByPC+'px;' +
					'height: ' + ((me.options.heightByPC === 'auto') ? 'auto !important;' : me.options.heightByPC + 'px;');
			}
			cb && cb();
		},

		_getDim: function (id) {
			var me = this,
				$dim = $(id);

			if (!$dim.size()) {
				$dim = $('<div>').attr('id', id.replace(/^#/, '')).insertAfter(me.$el);
			}
			$dim[0].style.cssText = 'background-color: #000; opacity: 0.7;filter:alpha(opacity=70);' +
				'position: fixed; top: 0; left: 0; right: 0 ; bottom:0; z-index: 48; display: none;';
			return $dim;
		},

		positionTop: function (top, complete) {
			var me = this;

			me._reposition(complete);
			top && me.$el.css('top', top);
		},

		/**
		 *
		 */
		release: function () {
			var me = this;

			me.supr();
			$doc.off('.' + me.cid);
			$(window).off('.' + me.cid);
		}
	};

	// HelpModal ////////////////////////////////////////////////////////////////////////////
	/**
	 * 모달 클래스<br />
	 * // 기본 옵션 <br />
	 * @class
	 * @name scui.ui.HelpModal
	 * @extends scui.ui.View
	 */
	var HelpModal = ui('HelpModal', /** @lends scui.ui.Modal# */ {
		bindjQuery: 'helpModal',
		$mixins: [CommonMenuModal],
		defaults: {
			widthByPC: 332,
			heightByPC: 448,
			widthByMobile: 332,
			heightByMobile: 379
		},
		/**
		 * 생성자
		 * @constructors
		 * @param {String|Element|jQuery} el
		 * @param {Object} options
		 */
		initialize: function (el, options) {
			var me = this;

			if (me.supr(el, options) === false) {
				return;
			}

			me._loadMain();
			me._bindEvents();
		},

		_bindEvents: function () {
			var me = this;
			var $helpModal = $('.ui_help_content');

			core.browser.isTouch && me.$el.on('touchmove.'+me.cid, function (e) {
				e.preventDefault();
			});

			// ajax 링크를 클릭시
			me.$el.on('click', 'a.ui_ajax_button', function (e) {
				e.preventDefault();

				var type = $(this).data('target'),
					href = $(this).attr('href');

				if (!href || href.substr(0, 1) === '#') { return; }
				$.ajax({
					url: href
				}).done(function(html) {
					$helpModal.removeClass('main faq menu word').addClass(type);
					$helpModal.html(html).buildUIControls();
				});
			});
		},

		open: function () {
			var me = this;
			me._loadMain().done(function (){
				CommonMenuModal.open.call(me);
			});
		},

		openContent: function (el) {
			var me = this;
			me._openContent(el).done(function (){
				CommonMenuModal.open.call(me);
			});
		},

		_openContent: function (el) {
			var me = this,
				$helpModal = $('.ui_help_content'),
				type = $(el).data('target'),
				href = $(el).attr('href');

			if (!href || href.substr(0, 1) === '#') { return; }
			return $.ajax({
				url: href,
				global : false
			}).done(function(html) {
				$helpModal.removeClass('main faq menu word').addClass(type);
				setTimeout(function () {
					$helpModal.html(html).buildUIControls();
				}, 500);
			});
		},

		/**
		 * 초기화면을 불러온다..
		 * @private
		 */
		_loadMain: function () {
			var me = this;

			var $helpModal = $('.ui_help_content');
			return $.ajax({
				url: me.$el.attr('data-main-url'),
				global : false
			}).done(function(html) {
				$helpModal.removeClass('main faq menu word').addClass('main');
				$helpModal.html(html).buildUIControls();
			});
		}
	});
	if (typeof define === "function" && define.amd) {
		define('modules/help-modal', [], function () {
			return HelpModal;
		});
	}

	// SnsModal
	var SNSModal = ui('SNSModal', {
		$mixins: [CommonMenuModal],
		bindjQuery: 'SNSModal',
		defaults: {
			widthByPC: 334,
			heightByPC: 230,
			widthByMobile: 334,
			heightByMobile: 'auto'
		},
		initialize: function (el, options) {
			var me = this;

			if (me.supr(el, options) === false) { return; }

			me._bindEvents();
		},

		_bindEvents: function () {
			var me = this;

			me.$el.on('click', '.ui_copyurl', function (e) {
				e.preventDefault();
				if (window.clipboardData) {
					window.clipboardData.setData('URL', $(this).attr('href'));
					alert('복사되었습니다.');
				} else if (!core.browser.isTouch) {
					prompt('아랫 URL을 복사하세요.', $(this).attr('href'));
				}
			}).on('show', function(e) {
				if (core.browser.isTouch) {
					me.$el.find('.alert_s_new').html('<span class="notice"></span>' +
						'<span class="ls0">URL</span>을 길게 누르시면 복사하실 수 있습니다.');
				} else {
					me.$el.find('.alert_s_new').html('<span class="notice"></span>' +
						'<span class="ls0">URL</span>을 누르시면 복사하실 수 있습니다.');
				}
			})
		}
	});

	// RecommandModal
	var RecommandModal = ui('RecommandModal', {
		$mixins: [CommonMenuModal],
		bindjQuery: 'recommandModal',
		defaults: {
			widthByPC: 329,
			heightByPC: 'auto',
			widthByMobile: 329,
			heightByMobile: 'auto'
		},
		initialize: function (el, options) {
			var me = this;

			if (me.supr(el, options) === false) { return; }

			me._bindEvents();
		},

		_bindEvents: function () {
			var me = this;
		}
	});

})(jQuery, window[LIB_NAME]);


/**
 * @module scui.ui.GnbSearcher
 * @author 김승일 책임(comahead@vinylc.com)
 * @description 헤더 검색모듈
 */
(function ($, core, undefined) {
	"use strict";

	var $win = $(window),
		$doc = $(document);

	// 검색. pc, mobile dom이 따로 있어서 버블링을 이용하여 구현함(굿아이디어~~~)
	var /** @const */COOKIE_NAME = 'recent_keywords';
	/**
	 * 헤더검색 모듈
	 * @class
	 * @name scui.ui.GnbSearcher
	 * @extends scui.ui.View
	 * @fires scui.ui.GnbSearcher#opensearch
	 * @fires scui.ui.GnbSearcher#closesearchu
	 */
	var GnbSearcher = core.ui('GnbSearcher', {
		defaults: {

		},
		selectors: {
			searchBox: '.ui_gnb>div.visible .t_search',
			searchDropBox: '.ui_gnb>div.visible .t_search .layer_top_search',
			keywordBox: '.ui_gnb>div.visible .auto_keyword',
			popularBox: '.ui_gnb>div.visible .rank_sec_in',
			recentBox: '.ui_gnb>div.visible .recent_keyword',
			input: '.ui_gnb>div.visible .search_area input[type=text]:visible',
			btnSubmit: '.ui_gnb>div.visible .btn_mirror'
		},
		initialize: function (el, options) {
			var me = this;

			if (me.supr(el, options) === false) { return; }

			me._bindEvents();
			me._bindSpeechEvents();
			me._bindInputEvents();
			me._bindDropdownListEvents();
			// 검색창 생성시 인기 검색어 생성을 검색 버튼 클릭시로 한번만 실행되도록 변경. 160107 - 김건우 선임 요청
			//	me._loadPopularList();
		},

		/**
		 *
		 * @param value
		 * @private
		 */
		_openDropdown: function (value) {
			var me = this;

			if (!$.trim(value)) {
				me.hasKeywords = false;
				me._toggleRecents(true);
			} else {
				if (value === me.oldKeyword) {
					if (me.hasKeywords) {
						me._toggleKeywords(true);
					}
				} else {
					me._loadKeywords(value);
				}
			}
		},


		/**
		 * 이벤트 바인딩
		 * @private
		 */
		_bindEvents: function () {
			var me = this;

			var isMobileSize = core.isMobileMode();
			$win.on('changemediasize.'+me.cid, function () {
				if (isMobileSize != core.isMobileMode()) {
					me._toggleSearch(false);
					me._closeAllsubs();
					me.hasKeywords = false;
					// 모바일, PC 모드 변경시 인풋값 동기화
					me.$('.' + (isMobileSize ? 'p' : 'm') + '_display .search_area input').val(me.$input.val());
					isMobileSize = core.isMobileMode();
				}
			}).on('resizeend.'+me.cid, function (){
				if (!me.opened || !core.isMobileMode()) {  return; }
			});

			// 서브밋 시에 값 체크
			me.$el.on('submit', 'form', function (e) {
				var $input = $(this).find('[name=query]');
				if (!$.trim($input.val())) {
					// 160113_오진호 과장 요청으로 입력값이 없을 경우 추천(placeholder)검색어로 검색
					//core.showMessage('N0000009'); // 검색어를 입력해주세요.
					//$input.focus();
					//return false;
					$input.val($input.attr('placeholder'));
				}
			});

			// 검색영역이 열릴 때 필요요소를 재탐색
			me.$el.on('opensearch', function (e) {
				me.updateSelectors();
			}).find('.btn_search').css('-webkit-user-select', 'none');

			// 키워드 링크를 클릭했을 때 검색페이지로 날린다.
			me.$el.on('click', '[data-keyword]', function (e) {
				e.preventDefault();

				me._closeAllsubs();
				me.$input.val($(this).attr('data-keyword'))[0].form.submit();
			});

		},

		/**
		 * 인풋관련 이벤트 바인딩
		 * @private
		 */
		_bindInputEvents: function () {
			var me = this;

			if (core.browser.isGecko) {
				// 파폭에서는 한글키 입력시에 키이벤트가 발생안되는 버그가 있어서 타이머를 돌려서 강제를 이벤트를 발생
				me._forceKeyup();
			}

			// 검색어 입력 - START
			me.$el.on('focusout', '.visible .search_area input', function (e) {
				//me.$el.off('mousedown.toggle'+me.cid);
				if (!core.browser.isTouch) {
					me.closeTimer = setTimeout(function () {
						me._closeAllsubs();
					}, 100);
				}
			}).on('keyup paste cut focusin change', '.visible .search_area input[type=text]', core.delayRun(function (e) {
				// 단어입력시 키워드 리스트 조회
				if (e.type == 'keyup' && core.array.include([38, 37, 40, 39, 35, 36, 13, 27], e.keyCode)) { return; } // 키능식 조작시 ajax콜 방지
				clearTimeout(me.closeTimer);

				if (e.type === 'focusin' && !core.browser.isTouch) {
					me.$el.off('mousedown.toggle'+me.cid)
						.on('mousedown.toggle'+me.cid, '.visible .search_area input', function (e) {
							clearTimeout(me.closeTimer);

							if (!$.trim(this.value)) {
								me._toggleRecents();
							} else if(me.hasKeywords){
								me._toggleKeywords();
							}
						});
				}

				me._openDropdown(this.value);
			}, 100));

			// 키보드 방향키 바인딩
			!core.browser.isTouch && me.$el.on('keydown', '.visible .search_area input', function (e) {
				switch (e.keyCode) {
					case 38: // 위로
						if (me.$('.search_area>div.visible').size() === 0) { return; }

						e.preventDefault();
						me._selectItem('up');
						break;
					case 40: // 아래로
						if (me.$('.search_area>div.visible').size() === 0) {
							return;
						}

						e.preventDefault();
						me._selectItem('down');
						break;
					case 27: // esc
						e.preventDefault();
						me._closeAllsubs();
						break;
				}
			});
			// 검색어 입력 - END
		},

		/**
		 * 음성검색 레이어 팝업
		 * @private
		 */
		_bindSpeechEvents: function () {
			var me = this;

			// 음성검색: 추본 모듈은 샘플용입니다. 개발은 서버개발단에서 하는걸로 협의가 됐습니다.
			var showSpeechModal = function () {
				if ($('#speech-modal').size() > 0) { $('#speech-modal').scModal('open'); return; }

				core.importJs(['modules/speech-recognition'], function (e) {
					var $modal = $($('#speech-modal-tmpl').html()).appendTo('body');
					$modal.scModal('open').scSpeechRecognition().on('modalshown', function () {
						$modal.find('.ui_searching, .ui_failure').hide();
						$modal.find('.ui_ready').show();
					});
				});
			};
			// 음성검색 버튼 클릭
			me.$el.on('click', '.input_voice', function (e) {
				showSpeechModal();
			});
		},

		/**
		 * 키워드 관련 이벤트 바인딩
		 * 최근 검색어 관련 이벤트 바인딩
		 * @private
		 */
		_bindDropdownListEvents: function () {
			var me = this;

			// 자동완성 리스트 - START
			me.$el.on('click', '.visible .auto_keyword .close', function (e) {
				me._toggleKeywords(false);
				me.$btnSubmit.focus();
			}).on('mousedown', '.visible .auto_keyword', function (e) {
				e.preventDefault();
				clearTimeout(me.closeTimer);
			});
			// 자동완성 리스트 - END

			// 최근검색어 - START
			me.$el.on('click', '.visible .recent_keyword li .del', function (e) {
				e.stopPropagation();

				// 최근검색어 삭제
				core.Cookie.removeItem(COOKIE_NAME, $(this).siblings('a').attr('data-keyword'));
				$(this).closest('li').remove();

				if (me.$recentBox.find('li').size() === 0) {
					me._toggleRecents(false);
				}
				me.$input.focus();
			}).on('click', '.visible .recent_keyword .close', function (e) {
				// 최근검색어 닫기
				me._toggleRecents(false);
				me.$btnSubmit.focus();
			}).on('click', '.visible .recent_keyword .all_del', function (e) {
				// 최근검색어 전체삭제
				core.Cookie.remove(COOKIE_NAME);
				me._toggleRecents(false);
				me.$input.focus();
			}).on('mousedown', '.visible .recent_keyword', function (e) {
				e.preventDefault();
				clearTimeout(me.closeTimer);
			});
			// 최근검색어 - END
		},

		_forceKeyup: function () {
			// 파이어폭스에서 한글을 입력할 때 keyup이벤트가 발생하지 않는 버그가 있어서
			// 타이머로 value값이 변경된걸 체크해서 강제로 keyup 이벤트를 발생시켜 주어야 한다.
			var me = this,
				nowValue,
				win = window,
				doc = document,

			// keyup 이벤트 발생함수: 크로스브라우징 처리
				fireEvent = (function(){
					if (doc.createEvent) {
						// no ie
						return function(oldValue){
							var e;
							if (win.KeyEvent) {
								e = doc.createEvent('KeyEvents');
								e.initKeyEvent('keyup', true, true, win, false, false, false, false, 65, 0);
							} else {
								e = doc.createEvent('UIEvents');
								e.initUIEvent('keyup', true, true, win, 1);
								e.keyCode = 65;
							}
							me.$input[0].dispatchEvent(e);
						};
					} else {
						// ie: :(
						return function(oldValue) {
							var e = doc.createEventObject();
							e.keyCode = 65;
							me.$input[0].fireEvent('onkeyup', e);
						};
					}
				})();

			var timer = null;
			me.$el.on('focusin', '.visible .search_area input', function(){
				if (timer){ return; }
				var el = this;
				timer = setInterval(function() {
					nowValue = el.value;
					if (me.oldKeyword !== nowValue) {
						me.oldKeyword = nowValue;
						fireEvent();
					}
				}, 60);
			}).on('focuout', '.visible .search_area input', function(){
				if (timer){
					clearInterval(timer);
					timer = null;
				}
			});
		},

		// 활성화
		_selectItem: function(dir) {
			var me = this,
				index, $items, $item, count;

			$items = me.$('.search_area>div.visible li');
			count = $items.size();
			index = $items.index($items.filter('.active'));

			if (dir === 'up') {
				index -= 1;
				if (index < 0) { index = count - 1; }
			} else {
				index += 1;
				if (index >= count) { index = 0; }
			}

			$item = $items.eq(index);
			$items.filter('.active').removeClass('active');
			$item.addClass('active');  // 활성화

			me.$input.val($item.find('a').attr('data-keyword')); // 인풋에 삽입
		},
		/**
		 *
		 * @private
		 */
		_closeAllsubs: function () {
			var me = this;

			me._toggleKeywords(false);
			me._toggleRecents(false);
		},

		/**
		 * 검색박스 토글
		 * @param flag
		 * @private
		 */
		_toggleSearch: function (flag) {
			var me = this;

			if (!flag) {
				me.close();
			} else {
				me.open();
			}
		},

		/**
		 * 검색박스 열기
		 */
		open: function () {
			var me = this;

			if (me.opened) { return; }
			me.opened = true;
			me.updateSelectors();
			me.$searchBox.addClass('open');
			me.$el.trigger('opensearch');

			// 다른 영역을 클릭했을 때 닫히도록
			$doc.on('click.gnbsearch' + me.cid, function (e) {
				if (me.$searchBox && core.dom.contains(me.$searchBox[0], e.target)
					|| core.dom.contains($(e.target).closest('.ui_modal_container').get(0), e.target)) {
					return;
				}
				me.close();
			});
		},

		/**
		 * 검색박스 닫기
		 */
		close: function () {
			var me = this;

			if (!me.opened) { return; }
			me.opened = false;
			me.$('.t_search').removeClass('open');
			me._closeAllsubs();
			me.$el.trigger('closesearch');
			$doc.off('click.gnbsearch' + me.cid);
		},

		toggle: function () {
			this.opened ? this.close() : this.open();
		},

		/**
		 * 열려있는가 체크
		 * @returns {*}
		 */
		isOpened: function () {
			return this.$searchBox.hasClass('open');
		},

		/**
		 * 검색리스트 조회
		 * @param q
		 * @returns {null|*}
		 * @private
		 */
		_loadKeywords: function (q) {
			var me = this;

			if (me.oldKeyword === me.$input.val()) { return; }
			// 이전 request 취소
			if (me.xhr && me.xhr.readyState != 4) { me.xhr.abort(); me.xhr = null; }

			me.xhr = $.ajax({
				url: me.$input.attr('data-url'),
				dataType: 'json',
				cache: false,
				data: {
					query: q
				}
			}).done(function (json) {
				if (json.responsestatus == 0
					&& !core.isEmpty(json.result)
					&& !core.isEmpty(json.result[0].items)) {
					me.hasKeywords = true;
					me._renderKeywords(json, q);
					me._toggleKeywords(true);
				} else {
					me.hasKeywords = false;
					me._toggleKeywords(false);
				}
			}).fail(function () {
				me._toggleKeywords(false)
			});

			return me.xhr;
		},

		/**
		 * 인기검색어 조회
		 * @private
		 */
		_loadPopularList: function () {
			var me = this,
				url = me.$('.ui_rank_list').eq(0).attr('data-url');

			if (!url) { return; }
			$.ajax({
				url: url,
				dataType: 'json'
			}).done(function (json) {
				var html = '', tmpl, items,
					status = {
						U: ['up', '순위상승'],
						D: ['down', '순위하락'],
						N: ['new', '순위진입'],
						C: ['', '순위변동없음']
					};

				if (json.Data && core.is(json.Data.Query, 'array')) {
					html = '<ul class="rank_list">';
					tmpl = '<li><a href="#" data-keyword="{keyword}"><span class="f_ls0 {topClass}">{rank}. </span>' +
						'<span class="ellip">{keyword}</span><span class="ico {statusClass}">' +
						'<span class="hide">{statusText}</span></span></a></li>';
					items = json.Data.Query;

					core.each(items, function (item, i) {
						var keyword = core.string.escapeHTML(item.content);
						html += core.string.format(tmpl, {
							keyword: keyword,
							topClass: (i < 3 ? ' fc_org' : ''),
							rank: item.id,
							statusClass: (item.updown in status ? status[item.updown][0] : ''),
							statusText: (status[item.updown][1] || '순위변동없음')
						});
						if (i === 4) { html += '</ul><ul class="rank_list">'; }
					});
					if (items.length <= 5) {
						html += '</ul><ul class="rank_list">';
					}
					html += '</ul>';
					me.$('.ui_rank_list').html(html);
				}
			});
		},

		/**
		 * 자동완성 렌더링
		 * @param json
		 * @private
		 */
		_renderKeywords: function (json, q) {
			var me = this,
				html = '';

			if (json.responsestatus != 0 || core.isEmpty(json.result) || core.isEmpty(json.result[0].items)) {
				me.hasKeywords = false;
				me.$keywordBox.find('ul').empty();
				return;
			}

			core.each(json.result[0].items, function (item, i) {
				if (i >= 14){ return false; } // TODO
				var val = core.string.escapeHTML(item.keyword);
				if (item.hkeyword) {
					html += '<li><a href="#" data-keyword="' + val + '">' + item.hkeyword + '</a></li>';
				} else {
					html += '<li><a href="#" data-keyword="' + val + '">' + val.replace(q, '<i class="highlight">' + q + '</i>') + '</a></li>';
				}
			});

			if (html) {
				me.$keywordBox.find('ul').html(html);
			} else {
				me.hasKeywords = false;
				me.$keywordBox.find('ul').empty();
			}
		},

		/**
		 * 최근검색어 렌더링
		 * @private
		 */
		_renderRecents: function () {
			var me = this,
				items = core.Cookie.getItems(COOKIE_NAME),
				html = '';

			if (core.isEmpty(items)) {
				me.hasRecents = false;
				me.$recentBox.find('ul').empty();
				return;
			}

			core.each(items, function (val, i) {
				if (i >= 14){ return false; }
				val = core.string.escapeHTML(val);
				html += '<li><a href="#" data-keyword="'+val+'">'+val+'</a><button type="button" class="del"><span class="hide">검색어 삭제</span></button></li>';
			});
			me.$recentBox.find('ul').html(html);
			me.hasRecents = true;
		},

		/**
		 * 최근검색어 토글
		 * @param flag
		 * @private
		 */
		_toggleRecents: function (flag) {
			var me = this;

			if (flag) {
				// 키워드박스 닫기
				me._toggleKeywords(false);
			}

			me._renderRecents();
			if (arguments.length === 0) {
				flag = !me.$recentBox.is('.visible');
			}
			flag = flag && me.hasRecents;
			me.$recentBox.toggle(flag).toggleClass('visible', flag);
		},

		/**
		 * 키워드 토글
		 * @param flag
		 * @private
		 */
		_toggleKeywords: function (flag) {
			var me = this;

			if (arguments.length === 0) {
				flag = !me.$keywordBox.is('.visible');
			}
			flag = flag && me.hasKeywords;

			if (flag) {
				// 최근검색어 닫기
				me._toggleRecents(false);
			}
			me.$keywordBox.toggle(flag).toggleClass('visible', flag);
		},
		release: function () {
			var me = this;

			$doc.on('click.gnbsearch' + me.cid);
			me.supr();
		}
	});

	core.importJs.define('modules/gnb-searcher', GnbSearcher);

})(jQuery, window[LIB_NAME]);


/**
 * Created by 김승일책임(comahead@vi-nyl.com) on 2015-05-22.
 * @module scui.ui.Gnb
 * @author 김승일 책임(comahead@vi-nyl.com)
 * @description 헤더 전체메뉴
 */
(function ($, core) {
	"use strict";

	var imports = core.importJs(['modules/smooth-scroll', 'modules/gnb-searcher']);

	var cssTransform = core.css3.transform, // core.css3.prefix('transform'),
		cssTransition = core.css3.transtion, //core.css3.prefix('transition'),
		cssTransitionDuration = core.css3.transitionDuration,
		cssTransitionTimingFunction = core.css3.transitionTimingFunction,
		transitionEnd = core.css3.transitionEnd;

	var $win = $(window),
		$doc = $(document),
		currentChannel;


	// TODO 퍼블리싱 서버용
	currentChannel = location.pathname.split('/')[1];
	if (currentChannel === 'search') { currentChannel = 'personal'; }

	/**
	 * 메뉴 요소 생성
	 * @param item
	 * @returns {string}
	 */
	function linkParse(link) {
		var href = link.split('/'),
			page = href[href.length - 1].split('.');

		return page[0];
	}
	function createMenuLink(item) {
		return '<li><a href="'+ item.link + '" data-menu-id="' + ((item.copy_yn !== 'T') ? linkParse(item.link) : '') + '"' +
			(item.pop_yn === 'T' ? 'class="blank" target="_blank" title="새 창"' : '') +
			'>' + item.name + '</a></li>';
	}
	function createMenu(item, isUtilMenu) {
		var html = '',
			hasChild = item.child && item.child.length > 0, count;

		html = '<h2 style="min-width: 183px;">';
		if (isUtilMenu && hasChild) {
			html += '<a href="#" class="ui_dropdown_open"><span class="ico"></span>' + item.name + '<span class="ico_open">' +
				'<span class="hide">하위메뉴 열기</span></span></a>';
		} else if (isUtilMenu) {
			html += '<a href="' + item.link + '"><span class="ico"></span>'+item.name+'</a>';
		} else {
			if (item.link) {
				html += '<a href="' + item.link + '" data-menu-id="' + ((item.copy_yn !== 'T') ? linkParse(item.link) : '') + '" class="link">' + item.name + '</a>';
			} else {
				html += '<span data-menu-id="' + ((item.copy_yn !== 'T') ? linkParse(item.link) : '') + '">' + item.name + '</span>';
			}
		}
		html += '</h2>';
		if (!hasChild) { return html; }

		if(isUtilMenu) html += '<div class="depth02_wrap"><p class="tit_menu"><a href="#" class="ui_dropdown_close"><span class="ico"></span>' + item.name + '<span class="ico_open"><span class="hide">하위메뉴 닫기</span></span></a></p>';
		html += '<ul class="depth02">';
		core.each(item.child, function (twoItem, j) {
			hasChild = twoItem.child && twoItem.child.length > 0;

			// 160222_자식노드 중에 menu_yn === 'T' 인개 0개인 경우 일반 링크 처리
			if (hasChild) {	// 3depth
				count = 0;
				core.each(twoItem.child, function (threeItem, el) {
					threeItem.menu_yn === 'T' && count++;
				});
				count === 0 && (hasChild = false);
			}

			if (hasChild) {	// 3depth
				html += '<li><a href="#" class="open_link">' + twoItem.name + '<span class="ico_open">' +
					'<span class="hide">하위메뉴 열기</span></span></a><ul class="depth03">';
				core.each(twoItem.child, function (threeItem, k) {
					// 160222_menu_yn === 'T'인 경우만 노출
					threeItem.menu_yn === 'T' && (html += createMenuLink(threeItem));
				});
				html += '</ul></li>';
			} else {
				html += createMenuLink(twoItem);	// 최하위 메뉴(실제 링크)
			}
		});
		html += '</ul>';
		if(isUtilMenu) html += '</div>';

		return html;
	}

	/**
	 * 웹접근성을 위해 각 버튼($el)에 대한 숨김텍스트 반영
	 * @param $el
	 * @param flag
	 * @private
	 */
	var toggleWAText = function ($el, flag) {
		var txt = $el.text();
		$el.text(txt.replace(flag ? '열기' : '닫기', flag ? '닫기' : '열기'));
	};

	/**
	 * 모바일 전체메뉴
	 * @class
	 * @name scui.ui.MobileAllMenu
	 * @extends scui.ui.View
	 * @fires scui.ui.MobileAllMenu#openallmenu
	 * @fires scui.ui.MobileAllMenu#closeallmenu
	 */
	var MobileAllMenu = core.ui('MobileAllMenu', {
		$statics: {
			'ON_OPEN_ALLMENU': 'openallmenu',
			'ON_CLOSE_ALLMENU': 'closeallmenu'
		},
		selectors: {
			moveBox: '.menu_nav',           // 왼쪽에서는 나오는 박스
			//leftMenus: '.l_nav li',         // 1뎁스 메뉴
			leftWrapper: '.l_nav',          // 1뎁스 래퍼
			rightWrapper: '.d_nav .h_box',  // 2,3 뎁스 메뉴 래퍼
			dimLayer: '.dim_layer'           // 딤레이어
		},
		defaults: {
			gnbDuration: 300,
			topOffset: 16
		},
		events: {},

		initialize: function (el, options) {

			var me = this;
			if (me.supr(el, options) === false) { return; }
			if (me.$leftWrapper.size() === 0 || me.$rightWrapper.size() === 0) { return; }

			// 사전 준비
			me.$leftWrapper.find('a').css('-webkit-tap-highlight-color', 'rgba(0,0,0,0)');
			me.$leftWrapper.find('ul').css('position', 'relative');

			me.$rightWrapper.css('position', 'relative');
			me.$moveBox.css({top:0, left:0, bottom:0});
			me.$dimLayer.css({'position': 'absolute', 'height': $(document).height(), 'z-index':51}).on('touchstart touchmove touchend touchcancel', function (e) {
				e.preventDefault();
			});

			// SmoothScroll, GnbSearcher 모듈 임포트
			imports.done(function () {
				me._bindEvents();
			});
		},

		/**
		 * 이벤트 바인딩
		 * @private
		 */
		_bindEvents: function () {
			var me = this;

			// 왼쪽 바로가기 메뉴
			me.leftMenuScroll = new core.ui.SmoothScroll(me.$leftWrapper, {
				scrollY: true
			});

			// 오른쪽 아코디온 메뉴
			me.rightMenuScroll = new core.ui.SmoothScroll(me.$rightWrapper, {
				scrollY: true
			});

			var flag = false, prevIndex; // flag: 터치에 의한 스크롤인지, 호출에 의한 스크롤인지 구분하기 위함
			me.$el.on('click', '.menu_close', function (e) {
				// 닫기 클릭
				e.preventDefault();
				me.close();
			}).on('click', '.d_nav .nav_list a', function () {
				//me._refresh();	// 메뉴가 토글될 때 스크롤사이즈 재계산
			}).on('click', '.l_nav ul a', function (e) {
				// 왼쪽 메뉴 클릭시 우측메뉴 스크롤링
				e.preventDefault();
				var idx = me.$leftMenus.index($(this).parent());
				if (idx >= 0) {
					var top = me.$rightHeaders.eq(idx).position().top + me.$rightHeaders.position().top;
					// 왼쪽에서 선택한 메뉴를 top에 위치
					me.rightMenuScroll.scrollTo(0, -top, 200);
				} else {
					me.rightMenuScroll.scrollTo(0, 0, 200);
				}
			});

			// 오른쪽 메뉴를 스크롤시
			me.rightMenuScroll.on('smoothscrollmove', function (e, data) {
				// 스크롤링된 위치에 해당하는 왼쪽 메뉴를 활성화
				var lastIndex;
				for (var i = 0; i < me.tops.length; i++) {
					if (me.tops[i] - (8 + me.options.topOffset) >= Math.abs(data.y)) {
						lastIndex = i - 1;
						break;
					}
				}

				// 이미 동일메뉴가 활성화돼있을 시에는 무시
				if (lastIndex !== undefined && prevIndex !== lastIndex) {
					var $active = me.$leftMenus.removeClass('on').eq(prevIndex = lastIndex).addClass('on');
					var activeTop = $active.position().top;
					var leftWrapperHeight = me.$leftWrapper.height();
					var leftScrollTop = -me.leftMenuScroll.getCurrentY();
					if (activeTop < leftScrollTop) {
						me.leftMenuScroll.scrollTo(0, Math.min(0, -activeTop + 20), 0);
					} else if (activeTop > leftWrapperHeight + leftScrollTop - 50) {
						me.leftMenuScroll.scrollTo(0, -activeTop, 0);
					}
				}
			});
			// 리사이징 시에 레이아웃을 재배치 시킨다.
			$win.on('orientationchange.' + me.cid + ' resize.' + me.cid +
				' scrollend.' + me.cid + ' resizeend.' + me.cid, function (e) {
				if (!me.opened) {
					return;
				}
				if (e.type === 'resizeend'){
					me._refresh();
				} else {
					me._resize();
				}
			});

			if (core.css3.support) {
				// css3으로 동작시킬 때는 transitionend 이벤트로 하여금 애니메이션 완료시점을 알아낸다.
				me.$el.on(transitionEnd, function () {
					me._complete(me.opened);
				});

				me.$moveBox[0].style[cssTransitionTimingFunction] = 'ease-in-out';
			}

			// GNB 메뉴에서 레이어 팝업이 뜨는 경우
			if ($(me.options.layerId).size() === 1) {
				$(me.options.layerId).on('modalshow', function () {
					me._forceFocusin(false);
				}).on('modalhidden', function () {
					me._forceFocusin(true);
				});
			}
		},

		/**
		 * 리사이징이 끝나면 스크롤영역을 다시 계산
		 * @private
		 */
		_refresh: function () {
			if (!this.opened) {
				return;
			}

			var me = this;
			me._resize();
			me._updateHeaderTop();
		},

		/**
		 * 리사이징 때 UI요소 재배치
		 * @private
		 */
		_resize: function () {
			var me = this;
			if (!me.opened) {
				return;
			}
			var winHeight = core.util.getWinHeight(),
				scrollTop = $win.scrollTop(),
				leftWrapperTop = me.$leftWrapper.offset().top - scrollTop,
				rightWrapperTop = me.$rightWrapper.offset().top - scrollTop,
				scrollHeight = me.$rightWrapper.find('>div').css('height', 'auto').height(),
				lastBoxHeight = me.$rightHeaders.last().outerHeight() +
					me.$rightWrapper.find('.allmenu01>ul,.allmenu02>ul').last().height(),
				wrapperHeight;

			me.$leftWrapper.css('height', winHeight - leftWrapperTop);
			me.$rightWrapper.css('height', wrapperHeight = (winHeight - rightWrapperTop));
			me.$rightWrapper.find('>div').css('height', Math.max(scrollHeight, scrollHeight + (wrapperHeight - lastBoxHeight)));

			me.leftMenuScroll && me.leftMenuScroll.refresh();
			me.rightMenuScroll && me.rightMenuScroll.refresh();
		},

		/**
		 * 메뉴를 그린 다음 다시 재계산
		 * @param {number} top 스크롤할 위치
		 */
		rightScrollRefresh: function (top) {
			var me = this;
			me._refresh();

			if (arguments.length > 0) {
				me.rightMenuScroll.scrollTo(0, Math.min(0, Math.max(me.rightMenuScroll.maxScrollY, -top)), 100);
			}
		},

		/**
		 * 각 메뉴 헤더의 top를 보관
		 * @private
		 */
		_updateHeaderTop: function () {
			var me = this;
			me.tops = [];
			me.heights = [];
			me.$rightHeaders = me.$('.ui_menu_list h2');

			// 각 메뉴 헤더의 top를 기억
			me.$rightHeaders.each(function () {
				me.tops.push($(this).position().top);
			});
			me.tops.push(me.tops[me.tops.length - 1] + 1000);
		},

		/**
		 * 키보드로 포커스를 이동시킬 때 메뉴안에서만 이동되도록 처리
		 * @param {boolean} isBind
		 * @private
		 */
		_forceFocusin: function (isBind) {
			var me = this;

			if (isBind !== false) {
				$doc.on('focusin.forcefocus' + me.cid, function (e) {
					if (!me.opened) {
						return;
					}
					if (me.$el[0] !== e.target && !$.contains(me.$el[0], e.target)) {
						me.$el.find(':focusable:visible').first().focus();
						e.stopPropagation();
					}
				});
			} else {
				$doc.off('focusin.forcefocus' + me.cid);
			}
		},

		/**
		 * 메뉴 열기
		 * @param {boolean} isAnimate 애니사용 여부
		 */
		open: function (isAnimate) {
			var me = this;

			if (me.opened) { return; }
			me.opened = true;
			me._resize();

			me.$el.triggerHandler('openallmenu');
			if (core.css3.support) {
				me.$moveBox.css(cssTransform, 'translate(-'+$win.width()+'px, 0px)'+core.css3.translateZ).show();
			} else {
				me.$moveBox.css({'left': '-'+$win.width()+'px'}).show();
			}

			me.$dimLayer.show();
			if (isAnimate !== false) {
				me._animate(0, me.options.gnbDuration / 1000);
			} else {
				me._animate(0, 0);
			}
		},

		/**
		 * 메뉴 닫기
		 * @param {boolean} isAnimate 애니사용 여부
		 */
		close: function (isAnimate) {
			var me = this;

			if (!me.opened) { return; }
			me.opened = false;
			me.$el.triggerHandler('closeallmenu');

			if (isAnimate !== false) {
				me._animate(-$win.width(), me.options.gnbDuration / 1000);
			} else {
				me._animate(-$win.width(), 0);
			}
		},

		/**
		 * 토글
		 */
		toggle: function () {
			this.opened ? this.close() : this.open();
		},

		/**
		 * css3 지언여부에 따라 분기 처리
		 * @function
		 * @name _animate
		 * @param {number} left
		 * @param {number} time
		 */
		_animate: core.css3.support ? function (left, time) {
			var me = this;
			//me.$moveBox.css(cssTransition, 'all ' + (time === 0 ? 0 : time) + 's ease-in-out');
			me.$moveBox[0].style[cssTransitionDuration] = time + 's';
			setTimeout(function () {
				me.$moveBox[0].style[cssTransform] = 'translate(' + left + 'px, 0px)' + core.css3.translateZ;
			},50);
			if (!time) {
				me._complete(me.opened);
			}
		} : function (left, time) {
			var me = this;
			if (time === 0) {
				me.$moveBox.css('left', left + 'px').toggle(left === 0);
				me._complete(me.opened);
			} else {
				me.$moveBox.animate({
					left: left + 'px'
				}, {
					duration: 'fast',
					complete: function () {
						me._complete(me.opened);
					}
				});
			}
		},

		/**
		 * 모바일에서 메뉴펼침/닫힘 애니메이션이 끝났을 때 마무리 작업
		 * @param {boolean} isOpen
		 * @private
		 */
		_complete: function (isOpen) {
			var me = this;

			if (isOpen) {
				$win.triggerHandler('resize.' + me.cid);
				me._refresh();
				me.$el.find(':focusable:visible:eq(0)').focus();
				me._forceFocusin();
			} else {
				me.$moveBox.hide();
				me._forceFocusin(false);
				me.$dimLayer.hide();
			}
		},

		/**
		 * 현재 메뉴에 on 클래스 추가
		 *
		 */
		nowPageUrl : function () {
			var menuId = linkParse(location.href),
				$toggleMenu = $('.menu_nav').find('[data-menu-id=' + menuId + ']');

			$toggleMenu.addClass('on');
			if ($toggleMenu.parent().parent().hasClass('depth03')) {
				$toggleMenu.parent().parent().siblings('a:visible').trigger('click');
			}
		},
		/**
		 * 메뉴 json을 바탕으로 렌더링
		 * @param {Object} data
		 */
		renderByJson: function (data) {
			if (core.isEmpty(data)) { return; }
			var me = this,
				rootMenu,
				menuList,
				html1Depth = '',
				html1DeptNormal = '',
				html1DeptUtil = '',
				html = '',
				htmlUtil = '';

			core.each(data, function (item) {
				rootMenu = item;
				return false;
			});
			if (!rootMenu) { return; }

			// 전체메뉴
			if (menuList = rootMenu.child) {
				core.each(menuList, function (oneItem, i) {
					if (oneItem.menu_yn !== 'T') { return; }
					//html1Depth += '<li><a href="#"><span class="txt">' + oneItem.name + '</span></a></li>';
					if (oneItem.menu_type === 'util') {
						html1DeptUtil += '<li><a href="#"><span class="txt">' + oneItem.name + '</span></a></li>';
						htmlUtil += createMenu(oneItem);
					} else {
						html1DeptNormal += '<li><a href="#"><span class="txt">' + oneItem.name + '</span></a></li>';
						html += createMenu(oneItem);
					}
					html1Depth = html1DeptNormal + html1DeptUtil;
				});

				me.$el.find('.allmenu01').html(html);       // 전체메뉴
				me.$el.find('.allmenu02').html(htmlUtil);   // 유틸메뉴

				// GNB 서브 메뉴 렌더링용 함수 : 160201 비디 임은영 선임 요청
				if(typeof callBackMenu =='function'){
					callBackMenu();
				}
			}
			me.$leftMenus = me.$el.find('.l_nav_in>ul').html(html1Depth).find('>li');
			me.$leftMenus.eq(0).addClass('on');

			me._updateHeaderTop();
			me.rightScrollRefresh();
		},

		/**
		 * 해제작업
		 */
		release: function () {
			var me = this;

			me._forceFocusin(false);
			me.$leftWrapper.off();
			me.$rightScroller.off();

			me.supr();
			//core.ui.removedClean();
		}
	});

	/**
	 * PC 전체 메뉴 모듈
	 * @class
	 * @name scui.ui.PcAllMenu
	 * @extends scui.ui.View
	 * @fires scui.ui.PcAllMenu#openallmenu
	 * @fires scui.ui.PcAllMenu#closeallmenu
	 */
	var PcAllMenu = core.ui('PcAllMenu', {
		$statics: {
			'ON_OPEN_ALLMENU': 'openallmenu',
			'ON_CLOSE_ALLMENU': 'closeallmenu'
		},

		selectors: {},

		/**
		 * 생성자
		 * @param {string|Element} el
		 * @param {Object} options
		 */
		initialize: function (el, options) {
			var me = this;

			if (me.supr(el, options) === false) { return; }

			me._bindEvents();
		},

		/**
		 * 이벤트 바인딩
		 * @private
		 */
		_bindEvents: function () {
			var me = this,
				heights = [];

			// 처음엔 빌드하지 않고 한번이라도 오픈했을 때 비로소 빌드시킨다.
			me.$el.one('openallmenu', function () {
				me.$('.allmenu01 a.ui_dropdown').scDropdown({
					wrapper: 'closest=.menu_list',
					dropdown: 'ul.depth02'
				}).on('opendropdown closedropdown', function (e) {
					// 숨김텍스트 변환
					toggleWAText($(this).find('.hide'), e.type === 'opendropdown');
				});
				me.$('.allmenu01 a.ui_dropdown_open').scDropdownSub({
					wrapper: 'closest=.menu_list',
					dropdown: 'ul.depth02'
				});

				me.nowPageUrl();
			});

			// 메뉴 영역 밖에 클릭했을 때 메뉴를 닫는다.
			$doc.on('click.allmenu' + me.cid, function (e) {
				if (!me.opened) { return; }
				if (core.dom.contains(me.$('.btn_sec')[0], e.target)) {
					return;
				}
				me.close();
			});

			// GNB 메뉴에서 레이어 팝업이 뜨는 경우 gnb메뉴의 강제 포커스를 삭제한다.
			if ($(me.options.layerId).size() === 1) {
				$(me.options.layerId).on('modalshow', function () {
					me._forceFocusin(false);
				}).on('modalhidden', function () {
					me._forceFocusin(true);
				});
			}
		},

		subMenuHeight: function () {
			var me = this,
				heights = [];

			// 각 메뉴 헤더의 height를 기억 - 160118 염주현 수석님 요청사항. height값을 동일하게 맞춘다.
			me.$('.allmenu02 ul.depth02').css('minHeight', '').each(function () {
				heights.push($(this).height());
			}).css('minHeight', scui.array.max(heights));
		},

		/**
		 * 현재 메뉴에 on 클래스 추가
		 *
		 */
		nowPageUrl : function () {
			//menu_nav
			var menuId = linkParse(location.href),
				$toggleMenu = $('.menu_nav').find('[data-menu-id=' + linkParse(location.href) + ']');

			$toggleMenu.addClass('on');
			if ($toggleMenu.parent().parent().hasClass('depth03')) {
				$toggleMenu.parent().parent().siblings('a:visible').trigger('click');
			}
		},

		/**
		 * 키보드로 포커스를 이동시킬 때 메뉴안에서만 이동되도록 처리
		 * @param {boolean} isBind
		 * @private
		 */
		_forceFocusin: function (isBind) {
			var me = this;

			if (isBind !== false) {
				$doc.on('focusin.forcefocus' + me.cid, function (e) {
					if (!me.opened) {
						return;
					}
					if (me.$el[0] !== e.target && !$.contains(me.$el[0], e.target)) {
						me.$el.find(':focusable:visible').first().focus();
						e.stopPropagation();
					}
				});
			} else {
				$doc.off('focusin.forcefocus' + me.cid);
			}
		},

		/**
		 * 열기
		 */
		open: function () {
			var me = this;

			if (me.opened) { return; }
			me.opened = true;
			me.$('.btn_sec').addClass('open');
			me.$el.triggerHandler('openallmenu');
			me._forceFocusin();
			me.subMenuHeight();
		},

		/**
		 * 닫기
		 */
		close: function () {
			if (!this.opened) { return; }

			this.$('.btn_sec').removeClass('open');
			this.opened = false;
			this.$el.triggerHandler('closeallmenu');
			this._forceFocusin(false);
		},

		/**
		 * 토글
		 */
		toggle: function () {
			this.opened ? this.close() : this.open();
		},

		/**
		 * 메뉴  json을 바탕으로 메뉴 생성
		 * @param {Object} data
		 */
		renderByJson: function (data) {
			if (core.isEmpty(data)) { return; }
			var me = this,
				idx = 1,
				rootMenu,
				menuList,
				html = '',
				htmlUtil = '';

			if (core.isEmpty(data)) { return; }
			core.each(data, function (item) {
				rootMenu = item;
				return false;
			});
			if (!rootMenu) { return; }

			// 전체메뉴
			if (menuList = rootMenu.child) {
				core.each(menuList, function (oneItem, i) {
					if (oneItem.menu_yn !== 'T') { return; }

					if (oneItem.menu_type === 'util') {
						if (oneItem.control_yn === 'T') me.controlItem = oneItem;
						htmlUtil += '<div class="menu_list menu0' + idx + (oneItem.control_yn === 'T' ? ' enjoy_life' : '') + ' ui_menu_list">'; // 160217_라이프즐기기 추가
						//htmlUtil += '<div class="menu_list menu0' + idx + ' ui_menu_list">';
						htmlUtil += createMenu(oneItem, true);
						htmlUtil += '</div>';
						idx += 1;
					} else {
						html += '<div class="menu_list' + (oneItem.control_yn === 'T' ? ' enjoy_life' : '') + '">'; // 160217_라이프즐기기 추가
						//html += '<div class="menu_list">';
						html += createMenu(oneItem);
						html += '</div>';
					}
				});
				// 라이프 즐기기용 : Util 메뉴에 있는 Data를 일반 메뉴에도 그려준다.
				if (me.controlItem) {
					html += '<div class="menu_list enjoy_life">'; // 160217_라이프즐기기 추가
					html += createMenu(me.controlItem);
					html += '</div>';
				}
				me.$el.find('.allmenu02').html(html);       // 전체메뉴
				me.$el.find('.allmenu01').html(htmlUtil);   // 유틸메뉴
			}
		},

		/**
		 * 해제작업
		 */
		release: function () {
			var me = this;

			$doc.off('click.allmenu' + me.cid);
		}
	});

	/**
	 * 전체 메뉴
	 * @class
	 * @name scui.ui.Gnb
	 * @extends scui.ui.View
	 * @fires scui.ui.Gnb#openheader
	 * @fires scui.ui.Gnb#closeheader
	 */
	var Gnb = core.ui('Gnb', {
		$singleton: true,       // 싱글톤모드로 빌드
		bindjQuery: 'gnb',
		defaults: {},
		selectors: {},
		/**
		 * 생성자
		 * @param {string|Element} el
		 * @param {Object} options
		 */
		initialize: function (el, options) {
			var me = this;

			if (me.supr(el, options) === false) {
				return;
			}

			me.isPopularListLoad = true;
			me.isInited = false;
			me.prevScrolltop = 0; // 메뉴가 표시되기 전의 스크롤 위치를 보관
			me.$dimLayer = $('<div class="dim_layer" style="display:none;"></div>').appendTo('body');

			imports.done(function () {
				// 현재 보이고 있는 요소에 .visible 클래스 추가
				me.$el.find('.ui_gnb>div').removeClass('visible').filter(':visible').addClass('visible');

				// 검색, 전체메뉴 객체 생성
				me.searcher = new core.ui.GnbSearcher(me.$el);
				me.pcMenu = new PcAllMenu(me.$el.find('.p_display'));   // pc메뉴모듈 빌드
				me.mobileMenu = new MobileAllMenu(me.$el.find('.m_display'));   // mobile메뉴모듈 빌드

				me._loadMenuData(function () {
					me._bindEvents();
				});
			});
			me._bindBannerEvents();
			me._loadUserData();
		},

		/**
		 * 이벤트 바인딩
		 * @private
		 */
		_bindEvents: function () {
			var me = this;

			// 전체 메뉴 열기/닫기
			me.$el.on('click', '.all_menu', function (e) {
				e.preventDefault();
				if (!me.isInited) {
					// 처음엔 아무것도 바인딩하지 않고 한번이라도 열었을 때 비로소 바인딩한다.
					me._bindLazyEvents();
					me.isInited = true;
				}
				me._toggleBox('allmenu', $(this));
			}).on('click', '.btn_search', function (e) {//  검색버튼
				// 검색창 생성시 인기 검색어 생성을 검색 버튼 클릭시로 한번만 실행되도록 변경. 160107 - 김건우 선임 요청
				if (me.isPopularListLoad) {
					me.searcher._loadPopularList();
					me.isPopularListLoad = false;
				}
				me._toggleBox('search');
			});
			if (!core.isMobileMode()) {
				me.$el.on('click', '.t_logout', function (e) {
					// 로그인정보가 표시될 때는 다른 드롭다운 요소들이 닫히지 않도록 버블링을 막는다.
					e.stopPropagation();
				});
			}

			me.pcMenu.on('openallmenu closeallmenu', me._toggleHeader.bind(me));
			me.mobileMenu.on('openallmenu closeallmenu', me._toggleHeader.bind(me));
			me.searcher.on('opensearch closesearch', me._toggleHeader.bind(me));

			var fn, isNowMobile = core.isMobileMode();
			// 현재 보이고 있는 요소에 .visible 클래스 추가
			$win.on('changemediasize.'+me.cid, fn = function () {
				var isMobile = core.isMobileMode();
				if (isMobile != isNowMobile) {
					me.closeAll();
					isNowMobile = isMobile;
				}
				me.$el.find('.ui_gnb>div').removeClass('visible')
					.filter(':visible').addClass('visible');
				me.pcMenu.subMenuHeight();
			});
			fn();
		},

		/**
		 * 헤더가 토글될 때 처리해야 할 사항들 처리
		 * @param e
		 * @private
		 */
		_toggleHeader: function (e) {
			var me = this,
				isOpen = !!~e.type.indexOf('open');

			$('body').toggleClass('opened_header', isOpen);
			// 현재 스크롤위치에서 메뉴가 열리되, 상단으로 스크롤되는건 방지
			me.$el.toggleClass('opened', isOpen); // fixed를 푼다.
			me.$el[0].style.cssText = isOpen ? 'position: absolute !important;' +
			'margin-top:' + $win.scrollTop() + 'px;' +
			'height:' + me.$el.height() + 'px;' : '';
			me.$dimLayer.removeClass('allmenu search');

			switch(e.type) {
				case 'openallmenu':  // 전체메뉴 열기
				case 'closeallmenu': // 전체메뉴 닫기
					// 버튼 텍스트전환
					toggleWAText(me.$el.find('.visible .all_menu .hide'), isOpen);
					// 전체메뉴가 열릴 땐 allmenu 클래스가 추가
					me.$dimLayer.toggleClass('allmenu', isOpen && !core.isMobileMode())
						.toggle(isOpen && !core.isMobileMode());
					break;
				case 'opensearch': // 검색 열기
				case 'closesearch': // 검색 닫기
									// 버튼 텍스트전환
					toggleWAText(me.$el.find('.visible .btn_search .hide'), isOpen);
					// 검색이 열릴 땐 search 클래스가 추가
					me.$dimLayer.toggleClass('search', isOpen && core.isMobileMode()).toggle(isOpen);
					break;
			}
			if (!isOpen) {
				// 닫힐 때 이전 위치로 스크롤
				$('#contents').css({'marginTop': ''});
				$win.scrollTop(me.prevScrolltop);
			}
			core.PubSub.triggerHandler(isOpen ? 'openheader' : 'closeheader');
		},

		/**
		 * 펼침메뉴 빌드
		 * @private
		 */
		_bindLazyEvents: function () {
			var me = this;

			// 펼침버튼
			me.$el.on('click.allmenu'+me.cid, '.ui_menu_list li>a', function (e) {
				var $el = $(this), $ul, isOpened;

				if (($ul = $el.siblings('ul')).size() > 0) {
					e.preventDefault();
					// 열려있는거 닫는다.
					me.$('.ui_menu_list li.on>ul').not($ul[0]).stop()
						.slideUp('fast', function () {
							toggleWAText($(this).parent().removeClass('on').find('>a .hide'), false);
						});

					// 열기
					$ul.slideToggle('fast', function () {
						isOpened = $el.parent().hasClass('on');
						toggleWAText($el.find('.hide'), !isOpened);
						$el.parent().toggleClass('on', !isOpened);

						if (core.isMobileMode()) {
							// 열리면서 맨위로 올려준다.
							if (!isOpened) {
								me.mobileMenu.rightScrollRefresh($el.parent().position().top);
							} else {
								me.mobileMenu.rightScrollRefresh();
							}
						}
					});
				}
			});

			me.mobileMenu.nowPageUrl();
		},

		/**
		 * 배너 관련 이벤트
		 * @private
		 */
		_bindBannerEvents: function () {
			var me = this;

			var $banner = me.$('.top_banner').removeClass('visible');
			if ($banner.size() > 0) {
				// 오늘하루 안보이기 를 안했을 경우 배너를 표시해준다.
				if (core.Cookie.get('main_banner_hide') !== 'Y') {
					$('#wrap').addClass('top_banner_wrap'); // 160226 - 배너가 있을 경우 #wrap에 top_banner_wrap 추가
					me.$el.addClass('banner'); // 배너가 있을 때는 #htop 에 banner클래스를 넣어준다.
					me.$('.top_banner').show().addClass('visible');
				}
				// 배너 닫기
				me.$el.on('click', '.ui_banner_close', function (e) {
					e.preventDefault();
					me.$el.removeClass('banner');
					$('#wrap').removeClass('top_banner_wrap'); // 160226 - 배너가 있을 경우 #wrap에 top_banner_wrap 추가
					me.$('.top_banner').hide().removeClass('visible');
					if (me.$('.top_banner :checkbox').prop('checked')) {
						// 오늘 하루 안보이기 를 체크했으면 쿠키에 저장
						core.Cookie.set('main_banner_hide', 'Y', {expires: core.date.calc(new Date(), '+1d')});
					}
				});
			}
		},

		/**
		 * 전체메뉴, 검색 드롭박스 오픈
		 * @param {string} type 'allmenu', 'search'
		 * @private
		 */
		_toggleBox: function (type, $that) {
			var me = this,
				isOpen = false;

			if (type === 'allmenu') {
				isOpen = !me.getMenu().opened;
				me.searcher.close();
				me.getMenu().toggle();
				$that.find('hide').html(isOpen ? $that.data('closeText') : $that.data('openText'));
			} else if (type === 'search') {
				isOpen = !me.searcher.opened;
				me.getMenu().close();
				me.searcher.toggle();
			}
			if (isOpen){ //} && (!core.isMobileMode() || type === 'search')) {
				// 열릴 때 현재 스크롤 위치를 저장해놨다가 닫을 때 다시 원위치 시킨다.
				me.prevScrolltop = $win.scrollTop();
				$('#contents').css({'marginTop': -me.prevScrolltop, 'height':''});
				if (me.$el.hasClass('fixed')) {
					$win.scrollTop(0);
				}
			}
			return isOpen;
		},

		/**
		 * 전체 닫기
		 */
		closeAll: function () {
			var me = this;

			me.pcMenu.close();
			me.mobileMenu.close(false);
			me.searcher.close();
			me.$dimLayer.hide();
		},

		/**
		 * 창사이즈에 맞는 전체메뉴(모바일, PC) 모듈을 반환
		 * @param {string} type 'pc', 'mobile'
		 * @return {TypeClass}
		 */
		getMenu: function (type) {
			var me = this;
			if (type === undefined) {
				type = core.isMobileMode() ? 'mobile' : 'pc';
			}
			return me[type+'Menu'];
		},

		/**
		 * 사용자로그인정보 조회
		 * @private
		 */
		_loadUserData: function () {
			var me = this,
				url;

			// 로그인정보 url
			// TODO : 파라미터로 로그인여부 변경하기, 나중에 제거할것 - START
			if (location.href.indexOf('.html') >= 0 && location.href.indexOf('login=false') >= 0) {
				return;
			}
			// TODO: END

			url = me.$el.find('.ui_gnb').attr('data-user-url');
			if (!url) { return; }

			// 160217 - 성능개선 사항으로 개발팀(오진호 과장)에서 수정 요청. - START
			if (typeof _userInfo != "undefined") {
				var json = _userInfo;
				me._loadUserDataEnd(json);
			} else {
				$.ajax({
					url: url,
					dataType: 'json',
					cache: false
				}).done(function (json) {
					me._loadUserDataEnd(json);
				});
			}
			// 160217 - 성능개선 사항으로 개발팀(오진호 과장)에서 수정 요청. - END
		},

		/**
		 * 사용자로그인정보 조회 후 처리
		 * @private
		 */
		_loadUserDataEnd: function (json) {
			var me = this,
				url;

			// 로그인 후 Show/Hide 처리
			$('.ui_is_login_content').toggle(json.userInfo.isLogin);
			$('.ui_is_logout_content').toggle(!json.userInfo.isLogin);
			if (json.userInfo && json.userInfo.isLogin) {

				// 모발일 로그인정보 반영 //////////////////////
				me.$('.m_display .ui_link_login').html('로그아웃').attr('href', function () {
					return $(this).attr('data-logout');
				});
				////////////////////////////////////////////////

				// pc 로그인정보 반영 //////////////////////////
				me.$('.p_display .ui_link_login').each(function () {
					var $el = $(this);
					// data-text속성이 있으면 이 값을, 없으면 json으로 받은 값을 설정
					$(this).html('<span class="ico"></span>' + ($el.attr('data-text') || (json.userInfo.name+'님'))).attr('href', function () {
						return $(this).attr('data-url') || $(this).attr('data-mypage');
					});
				}).replaceClass('login_btn', 'user').parent().replaceClass('t_login', 't_logout');
				me.$('.p_display .ui_remain_time')
					.scDropdown({
						wrapper: 'closest=.t_logout',
						activeClass: 'expn'
					});

				me.$('.ui_user_info_content .f_login dd')
					.html(core.date.format(json.userInfo.lastLoginTime, 'yy년 M월 d일 h시 m분'));
				me.$('.ui_overtime').show();
				////////////////////////////////////////////////

				// 타이머 시작
				me._startTimer();
			}
		},

		/**
		 * 메뉴데이타를 불러와서 렌더링
		 * @private
		 */
		_loadMenuData: function (cb) {
			var me = this,
				path = location.pathname.substring(1, location.pathname.indexOf("/", 2)),
				url;

			// 160106 - 메뉴 구조 PC와 모바일 분기 및 호출 방법 jsonp로 변경. 오진호 과장님 요청 사항.
			// 메뉴 데이타 url
			if (me.$el.find('.ui_gnb').attr('data-menu-murl') !== '') {
				url = scui.isMobileMode() ? me.$el.find('.ui_gnb').attr('data-menu-murl') : me.$el.find('.ui_gnb').attr('data-menu-url');
			} else {
				url = me.$el.find('.ui_gnb').attr('data-menu-url');
			}
			if (!url) { return; }

			// 160217 - 성능개선 사항으로 개발팀(오진호 과장)에서 수정 요청. - START
			var path = location.pathname.substring(1, location.pathname.indexOf("/", 2));
			//회사소개 국문, 영문 세션스토리지 변수명 구변하기 위해 예외처리 160224
			if (location.pathname.indexOf('/company/english') > -1) {
				path = 'company_english';
			}
			try {
				var menuJson = sessionStorage.getItem("data_MenuJson_"+path);

				// 160219 : 법인 요청으로 코드 추가
				if (typeof menuJson != 'undefined' && menuJson!=null) {
					var json = $.parseJSON(menuJson);
					if(typeof _CORPORATION_DVC!== 'undefined' && _CORPORATION_DVC === '3'){
						if(typeof json.hpsMenuList === 'undefined' || json.hpsMenuList ===null){
							sessionStorage.removeItem('data_MenuJson_corporation');
							menuJson = sessionStorage.getItem("data_MenuJson_"+path);
						}
					}

					if(typeof _CORPORATION_DVC!== 'undefined' && _CORPORATION_DVC !== '3'){
						if(typeof json.hpcMenuList === 'undefined' || json.hpcMenuList ===null){
							sessionStorage.removeItem('data_MenuJson_corporation');
							menuJson = sessionStorage.getItem("data_MenuJson_"+path);
						}
					}
				}

				if (typeof menuJson != 'undefined' && menuJson!=null) {
					var json = $.parseJSON(menuJson);

					if (typeof _scard_default_domain_ != 'undefined') {
						json = JSON.stringify(json).split(_scard_default_domain_).join(''); //convert to JSON string
						json = JSON.parse(json); //convert back to array
					}

					me.json = json;
					me.pcMenu.renderByJson(json);
					me.mobileMenu.renderByJson(json);
					cb && cb(json);
					return;
				}
			}catch(e) {console.log(e);}

			return $.ajax({
				url: url,
				//dataType: 'json'
				dataType : 'jsonp',
				contentType : 'text/plain;charset=UTF-8',
				jsonpCallback : scui.isMobileMode() ? 'mobileMenu' : 'webMenu'
			}).done(function (json) {

				if (typeof _scard_default_domain_ != 'undefined') {
					json = JSON.stringify(json).split(_scard_default_domain_).join(''); //convert to JSON string
					json = JSON.parse(json); //convert back to array
				}

				me.json = json;
				me.pcMenu.renderByJson(json);
				me.mobileMenu.renderByJson(json);
				try {sessionStorage.setItem("data_MenuJson_"+path, JSON.stringify(json));}catch (e){console.log(e);}
				cb && cb(json);
			});
			// 160217 - 성능개선 사항으로 개발팀(오진호 과장)에서 수정 요청. - END
		},

		// 타이머 시작
		_startTimer: function () {
			var me = this,
				$overtime = me.$el.find('.ui_overtime');

			me.stayTimer = me.stayTimer || (new OverTimer({
					limitTime: $overtime.data('limitTime') || 600000, // 10분
					remainTime: $overtime.data('remainTime') || 60000,  // 60초
					events: {
						// 10분 초과하였을 때 발생
						'overtime': function () {
							// 외부에서 캐치할 수 있도록 글로벌이벤트롤 날려준다.
							core.PubSub.triggerHandler('overtime');
						},
						// 1초마다 발생
						'timeupdate': function (data) {
							if (core.isMobileMode()) { return; }
							var t = core.date.splits(Math.max(0, data.remainTime));
							me.$('.ui_remain_time').html(core.string.sprintf('<span class="hide">로그인 남은시간</span>%02d' +
								'<span class="hide">분</span>:%02d<span class="hide">초</span>', t.mins, t.secs));
						},
						// 종료 30초전 발생
						'beforeovertime': function () {
							// 외부에서 캐치할 수 있도록 글로벌이벤트롤 날려준다.
							core.PubSub.triggerHandler('beforeovertime');
						}
					}
				}).start());

			// 로그인 연장 클릭시
			me.$el.off('click.checkovertime')
				.on('click.checkovertime', '.ui_btn_refresh', function (e) {
					me.stayTimer.refresh();
				});

			// 외부에서 scui.PubSub.trigger('overtimerefresh'); 라고 호출하면 시간이 연장됩니다.
			core.PubSub.off('overtimerefresh.checkovertime')
				.on('overtimerefresh.checkovertime', function (e, data){
					if (data) {
						me.stayTimer.setLimitTime(data.time);
					}
					me.stayTimer.refresh();
				}).on('timerefresh.checkovertime', function (e, data){
					if (data) {
						me.stayTimer.refresh(data.time);
					}
				});
		},

		release: function () {
			var me = this;

			me.stayTimer.stop();
			me.stayTimer = null;
			me.$el.off('.allmenu'+me.cid).off('click.checkovertime');
			core.PubSub.off('overtimerefresh.checkovertime');

			me.supr();
		}
	});

	/**
	 * 로케이션 메뉴
	 * @class
	 * @name scui.ui.GnbLocationMenu
	 * @extends scui.ui.View
	 */
	var GnbLocationMenu = core.ui('GnbLocationMenu', {
		bindjQuery: 'GnbLocationMenu',
		initialize: function (el, options) {
			var me = this;

			if (me.supr(el, options) === false) { return; }

			me._bindEvents();
			me.$el.find('.ui_scrollview').scScrollview();
		},
		/**
		 * 이벤트 바인딩
		 * @private
		 */
		_bindEvents: function () {
			var me = this,
				$location = me.$el;

			var isOpened = false;
			// 로케이션 유무에 따라 #htop에 .smenu_active 추가
			var toggle = function (flag) {
				isOpened = flag;
				me.$el.closest('#htop').toggleClass('smenu_active', flag);
				toggleWAText($location.find('.btn_expn .hide'), flag);	// 숨김텍스트 변환
				resizeEvent(flag);
				return flag;
			};
			// 창사이즈가 서브메뉴가 작은 경우 서브메뉴 height을 창사이즈에 맞게 줄여준다.
			var resizeEvent = function (flag) {
				if (!flag) { $win.off('scrollend.' + me.cid + ' resizeend.' + me.cid); return; }
				var fn;
				$win.on('scrollend.' + me.cid + ' resizeend.' + me.cid, fn = function () {
					if (!isOpened) { return; }

					var $scrollarea = $location.find('.ui_scrollarea'),
						winHeight = ($win[0].innerHeight === undefined) ? $win.innerHeight() : $win[0].innerHeight,
						offset = me.$el.height(),
						height = $scrollarea.children().height() + offset;

					if (winHeight < height) {
						$scrollarea.css('max-height', winHeight - offset - 10);
					} else {
						$scrollarea.css('max-height', 1000);
					}
				});
				fn();
			};

			// 로케이션 링크 뮤효화 - 160112 김두일 수석 테스트용 이벤트 허용
			$location.find('.btn_expn').on('click', function (e) {
				//e.preventDefault();
			});

			// 로케이션 유무에 따라 #htop에 .smenu_active 추가
			if (core.browser.isTouch) {
				// 모바일에서는 클릭베이스
				$location.find('.btn_expn').scDropdown({
					wrapper: 'closest=.location_menu_wrap'
				}).on('opendropdown closedropdown', function (e) {
					toggle(e.type === 'opendropdown');
				});
			} else {
				// pc에서는 마우스오버 베이스
				$location.on('mouseenter mouseleave', function (e) {
					toggle(e.type === 'mouseenter');
				}).on('focusin focusout', core.delayRun(function (e) {
					toggle(e.type === 'focusin');
				}, 100));
			}
		}
	});

	/**
	 * 유저가 머무는 시간을 체크하기 위한 모듈
	 * @class
	 * @name OverTimer
	 * @extends scui.BaseClass
	 */
	var OverTimer = core.BaseClass.extend({
		$mixins: [core.EventListener],
		limitTime: 600000,  // 제한시간
		remainTime: 60000,  // 제한시간 전 알림시간
		/**
		 * 생성자
		 * @param options
		 */
		initialize: function (options) {
			var me = this;
			me.options = $.extend({}, options);

			core.each(me.options.events, function (item, name) {
				me.on(name, item);
			});
		},
		/**
		 * 시작
		 * @returns {OverTimer}
		 */
		start: function (setUpdateTime) {
			var me = this, oldPassTime, fn;

			me.stop();
			if (setUpdateTime) {
				me.trigger('timeupdate', {passTime: 0, remainTime: me.options.limitTime - setUpdateTime});
			} else {
				me.trigger('timeupdate', {passTime: 0, remainTime: me.options.limitTime});
			}

			// 처음에 제한시간 10:00은 보여주어야 하지 않나라는 의견이 있어서 10;00을 표시하고서 1초 후에 타이머를 시작한다.
			setTimeout(function () {
				me.activeTime = +new Date;
				setUpdateTime && (me.activeTime -= setUpdateTime);
				clearInterval(me.timer);
				me.timer = setInterval(fn = function () {
					var time = +new Date,
						passTime = time - me.activeTime;

					// setInterval의 시간차가 정확하지 않아서 0.3초마다 돌면서 초가 변경됐을 때 이벤트를 날림
					if (passTime - oldPassTime <= 1000) {
						return;
					}
					oldPassTime = passTime;

					// 1초마다 발생
					me.trigger('timeupdate', {passTime: passTime, remainTime: me.options.limitTime - passTime});
					if (!me.isNotified
						&& (passTime > (me.options.limitTime - me.options.remainTime))) {
						me.isNotified = true;
						// 30초전 발생
						me.trigger('beforeovertime');
					}

					if (passTime > me.options.limitTime) {
						// 종료시 발생
						me.trigger('overtime');
						me.stop();
					}
				}, 200);
			}, 1000);

			return this;
		},
		/**
		 * 정지
		 * @returns {OverTimer}
		 */
		stop: function () {
			clearInterval(this.timer);
			return this;
		},

		setLimitTime: function (time) {
			this.options.limitTime = time;
		},

		/**
		 * 갱신
		 * @returns {OverTimer}
		 */
		refresh: function (time) {
			this.isNotified = false;
			this.start(time);
			return this;
		}
	});

	core.importJs.define('modules/gnb', Gnb);

	// TODO : 삭제할 거 - START
	if (!!~location.pathname.indexOf('.html')) {
		scui.Cookie.setItem('recent_keywords', '영화 할인 카드');
		scui.Cookie.setItem('recent_keywords', '마일리지 카드');
		scui.Cookie.setItem('recent_keywords', '놀이공원 할인 카드');
		scui.Cookie.setItem('recent_keywords', '국민행복 삼성카드국민행복 삼성카드국민행복 삼성카드국민행복 삼성카드');
		scui.Cookie.setItem('recent_keywords', '카드론');
		scui.Cookie.setItem('recent_keywords', '삼성카드4');
		scui.Cookie.setItem('recent_keywords', '삼성카드');
		scui.Cookie.setItem('recent_keywords', '숫자카드숫자카드숫자카드숫자카드숫자카드숫자카드숫자카드');
		scui.Cookie.setItem('recent_keywords', '숫자카드숫자카드숫자카드');
		scui.Cookie.setItem('recent_keywords', '숫자카드숫자카드숫자카드');

		if (!$('#wrap').hasClass('main')) {
			// 서브인 경우 임시로 로케이션을 넣어준다.

			if (!$('#htop .location_menu_wrap').hasClass('no_sub')){


				$('#htop .location_menu_wrap:not(.sub)').append('<div class="smenu ui_scrollview">' +
					'<div class="smenu_in ui_scrollarea"><ul class="ui_content">' +
					'<li><a href="#"><span>고객센터 메인</span></a></li>' +
					'<li><a href="#"><span>자주하는 질문(FAQ)</span><span class="hide">메뉴 선택됨</span></a></li>' +
					'<li><a href="#"><span>상담안내/접수</span></a></li>' +
					'<li><a href="#"><span>분실신고/사고접수</span></a></li>' +
					'<li><a href="#"><span>카드해지</span></a></li>' +
					'<li><a href="#"><span>카드발급상황 조회</span></a></li>' +
					'<li><a href="#"><span>카드 사용등록</span></a></li>' +
					'<li><a href="#"><span>공인인증센터</span></a></li>' +
					'<li><a href="#"><span>뉴스/공지사항</span></a></li>' +
					'<li><a href="#"><span>금융소비자 안내</span></a></li>' +
					'<li><a href="#"><span>삼성카드 지점안내</span></a></li>' +
					'<li><a href="#"><span>삼성카드 CS패널</span></a></li>' +
					'</ul></div></div>').addClass('sub');

				$('#htop .location_menu_wrap').scGnbLocationMenu();

			}


		}
	}
	// TODO: 삭제할 거 - END
})(jQuery, window[LIB_NAME]);

/**
 * @module scui.ui.Footer
 * @author 강태진 수석
 * @description 푸터
 */
(function ($, core, undefined) {
	"use strict";

	if(core.ui.Footer) { return; }

	var ctx = window,
		$win = $(window),
		$doc = $(document),
		ui = core.ui,
		dateUtil = core.date,
		browser = core.browser,
		isTouch = browser.isTouch;

	//Footer ////////////////////////////////////////////////////////////////////////////////
	/**
	 * @class
	 * @name vinyl.ui.Footer
	 * @description 페이징모듈
	 * @extends vinyl.ui.View
	 */
	var Footer = core.ui('Footer', /** @lends vinyl.ui.Footer# */{
		bindjQuery: 'footer',
		$statics: /** @lends vinyl.ui.Footer */{
		},
		defaults: {
			frame: 2000
		},
		selectors: {
			familyBtn: '.ui_family_btn',
			familyList: '.ui_family_list',
			awardPrev: '.ui_footer_prev',
			awardNext: '.ui_footer_next',
			awardContent: '.ui_award_content',
			awardMore: '.ui_award_more',
			awardItem: '.ui_award_item'
		},
		/**
		 * 생성자
		 * @param el
		 * @param options
		 */
		initialize: function(el, options) {
			var me = this;

			if(me.supr(el, options) === false) { return me.release(); }

			// 패밀리 사이트
			me.$familyBtn.scDropdown({
				wrapper: '.ui_family_list'
			});

			// 이전 다음 이벤트
			me.$awardPrev.on('click', function (e) {
				e.preventDefault();
				me._prev();
			});

			me.$awardNext.on('click', function (e) {
				e.preventDefault();
				me._next();
			});

			me.$awardContent.swipeGesture().on('swipegestureleft', function (e) {
				me._next();
			}).on('swipegestureright', function (e) {
				me._prev();
			});

			var changemediasizeCallback;
			$win.on('changemediasize.' + me.cid, changemediasizeCallback = function(e) {
				var data = core.ui.mediaInfo;
				me._resize(data);
			});
			changemediasizeCallback();
		},

		_resize: function (data) {
			var me = this;

			// 초기화
			me.$awardItem.css({'marginRight':''});
			me.$awardMore.removeClass('more7');

			me.size = 0;
			me.margin = 0;
			me.fullSize = 0;
			me.page = 0;
			me.isAnimate = true;
			me.contentWidth = me.$awardContent.width();
			me.$element = me.$awardContent.find('ul');

			// Award 영역
			// Award 영역이 2페이지 이상인지 확인
			me.$awardItem.each(function (index) {
				if (me.contentWidth < (me.size + $(this).width())) {
					me.$awardMore.addClass('more7');
					me.size = 0;
				} else {
					me.size += $(this).outerWidth(true);
				}
			});

			// Award 영역에 아이템 배치
			me.size = 0;
			me.$awardItem.each(function (index) {
				if (me.contentWidth < (me.size + $(this).width())) {
					me.margin = me.contentWidth - me.size + 1;
					me.size = $(this).outerWidth(true);
					if (index > 0) {
						me.$awardItem.eq(index-1).css({'marginRight':me.margin});
					}
					me.page++;
				} else {
					me.margin = 0;
					me.size += $(this).outerWidth(true);
				}
			});

			me.$awardItem.each(function (index) {
				me.fullSize += $(this).outerWidth(true);
			});
			me.$element.css({'width':me.fullSize + 20, 'left':'0px'});

			if (data.mode === 'w768' || data.mode === 'w376') {
				me.page--;
			}
		},

		_next: function () {
			var me = this;

			if (me.isAnimate && Math.abs(parseInt(me.$element.css("left"), 10)) < (me.contentWidth * me.page)) {
				me.isAnimate = false;
				me.$element.animate({
					'left': "-=" + me.contentWidth
				}, me.options.frame, function () {
					me.isAnimate = true;
				})
			}
		},

		_prev: function () {
			var me = this;

			if (me.isAnimate && parseInt(me.$element.css("left"), 10) < 0) {
				me.isAnimate = false;
				me.$element.animate({
					'left': "+=" + me.contentWidth
				}, me.options.frame, function () {
					me.isAnimate = true;
				})
			}
		}
	});
	///////////////////////////////////////////////////////////////////////////////////////

	if (typeof define === "function" && define.amd) {
		define([], function() {
			return Footer;
		});
	}

	core.importJs.define('modules/footer', Footer);

})(jQuery, window[LIB_NAME]);


/**
 * @module scui.ui.Formatter
 * @author 김승일 책임(comahead@vi-nyl.com)
 * @description 형식입력폼
 * Benchmark
 * github: https://github.com/firstopinion/formatter.js
 * License: The MIT License (MIT) Copyright (c) 2013 First Opinion
 */
(function ($, core) {
	"use strict";

	// {{9999}}-{{9999}}-{{9999}}
	// comma
	// tel
	// mobile
	// email

	// 캐얼 모듈
	var inputSel = {
		// 캐럿 위치 반환
		get: function(el) {
			if(core.is(el.selectionStart, 'number')) {
				return {
					begin: el.selectionStart,
					end: el.selectionEnd
				};
			}

			var range = document.selection.createRange();
			if(range && range.parentElement() === el) {
				var inputRange = el.createTextRange(), endRange = el.createTextRange(), length = el.value.length;
				inputRange.moveToBookmark(range.getBookmark());
				endRange.collapse(false);

				if(inputRange.compareEndPoints('StartToEnd', endRange) > -1) {
					return {
						begin: length,
						end: length
					};
				}

				return {
					begin: -inputRange.moveStart('character', -length),
					end: -inputRange.moveEnd('character', -length)
				};
			}

			return {
				begin: 0,
				end: 0
			};
		},
		// 캐럿 위치 설정
		set: function(el, pos) {
			if(!core.is(pos, 'object')) {
				pos = {
					begin: pos,
					end: pos
				};
			}

			if(el.setSelectionRange) {
				//el.focus();
				el.setSelectionRange(pos.begin, pos.end);
			} else if(el.createTextRange) {
				var range = el.createTextRange();
				range.collapse(true);
				range.moveEnd('character', pos.end);
				range.moveStart('character', pos.begin);
				range.select();
			}
		}
	};

	var utils = {
		numRegex: /[^0-9]/g,
		engRegex: /[^a-zA-Z\s]/g,
		alphaRegex: /[^a-zA-Z]/g,
		alnumRegex: /[^a-zA-Z0-9]/g,
		engnumRegex: /[^a-zA-Z0-9\s]/g,

		isPressedMetaKey: function (e) {
			return e.ctrlKey || e.shiftKey || e.altKey;
		},
		numKey: function (e) {
			var kc = e.keyCode;
			return (e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105);
		},
		engKey: function (e) {
			var kc = e.keyCode;
			return (kc >= 65 && kc <=90) || (kc >= 97 && kc <=122) || kc === 32; // 32: space bar
		},
		alphaKey: function (e) {
			var kc = e.keyCode;
			return (kc >= 65 && kc <=90) || (kc >= 97 && kc <=122);
		},
		alnumKey: function (e) {
			var kc = e.keyCode;
			return (kc >= 65 && kc <= 90) || (kc >= 97 && kc <= 122) || (kc >= 48 && kc <= 57);
		},
		engnumKey: function (e) {
			var kc = e.keyCode;
			return (kc >= 65 && kc <= 90) || (kc >= 97 && kc <= 122) || (kc >= 48 && kc <= 57) || kc === 32; // 32: space bar
		},
		isInvalidKey: function (e, type, ignoreKeys) {
			if (e.keyCode !== 0 && e.keyCode !== 229) {
				return !utils.isPressedMetaKey(e) && !utils[type+'Key'](e) && !core.array.include(ignoreKeys, e.keyCode);
			}
		},
		cleanChars: function (type, el, focusin) {
			if (!supportPlaceholder && el.value === el.getAttribute('placeholder')) { return; }

			var caret = inputSel.get(el);
			el.value = el.value.replace(utils[type+'Regex'], '');
			if (focusin) {
				inputSel.set(el, Math.min(caret.begin, el.value.length));
			}
		},

		forceKeyup: function (el) {
			// 파이어폭스에서 한글을 입력할 때 keyup이벤트가 발생하지 않는 버그가 있어서
			// 타이머로 value값이 변경된걸 체크해서 강제로 keyup 이벤트를 발생시켜 주어야 한다.
			var me = this,
				$el = $(el),
				prevValue, nowValue,
				win = window,
				doc = document,

			// keyup 이벤트 발생함수: 크로스브라우징 처리
				fireEvent = (function(){
					if (doc.createEvent) {
						// no ie
						return function(oldValue){
							var e;
							if (win.KeyEvent) {
								e = doc.createEvent('KeyEvents');
								e.initKeyEvent('keyup', true, true, win, false, false, false, false, 65, 0);
							} else {
								e = doc.createEvent('UIEvents');
								e.initUIEvent('keyup', true, true, win, 1);
								e.keyCode = 65;
							}
							el.dispatchEvent(e);
						};
					} else {
						// ie: :(
						return function(oldValue) {
							var e = doc.createEventObject();
							e.keyCode = 65;
							el.fireEvent('onkeyup', e);
						};
					}
				})();

			var timer = null;
			$el.on('focusin', function(){
				if (timer){ return; }
				timer = setInterval(function() {
					nowValue = el.value;
					if (prevValue !== nowValue) {
						prevValue = nowValue;
						fireEvent();
					}
				}, 60);
			}).on('focuout', function(){
				if (timer){
					clearInterval(timer);
					timer = null;
				}
			});
		}
	};

	/**
	 * 한글 전용 입력폼
	 */
	var KorInput = core.ui.View.extend({
		name: 'korInput',
		initialize: function (el, options) {
			var me = this;

			if (me.supr(el, options) === false) { return; }

			me.$el = $(el);
			me._bindEvents();
		},
		_bindEvents: function () {
			var me = this,
				caret,
				regNotKor = /[^ㄱ-ㅎ|ㅏ-ㅣ|가-힝 ]+/;

			me.$el.on('keyup paste change', function (e) {
				var val = me.$el.val();

				if (regNotKor.test(val)) {
					val = val.replace(regNotKor, '');
					if (caret.start > 0){ caret.start -= 1; }
					me.$el.val(val);
					if (me.$el.is(':focus')){
						core.dom.setCaretPos(me.$el[0], caret);
					}
				}
			}).on('keydown  focusin', function(e){
				caret = core.dom.getCaretPos(me.$el[0]);
			});
		},
		release: function () {
			var me = this;
			clearInterval(me.timer);
			me.supr();
		}
	});

	/*
	 * 영숫자 전용 입력폼
	 */
	var AlnumInput = core.ui.View.extend({
		name: 'alnumInput',
		initialize: function (el, options) {
			var me = this;
			if (me.supr(el, options) === false) { return; }

			if (core.browser.isGecko) {
				utils.forceKeyup(me.el);
			}

			var old, format = me.options.format;
			me.$el.on('keydown focusin keyup focusout paste change', function(e) {
				var el = this, change;
				switch (e.type) {
					case 'keydown':
						if(utils.isInvalidKey(e, format, [].concat(FormatInput.byPassKeys, 16))) {
							e.preventDefault();
						}
						break;
					case 'focusin':
						//old = this.value;
						break;
					case 'keyup':
						if (old != el.value) {
							setTimeout(function () {
								utils.cleanChars(format, el, false);
							});
						}
						old = el.value;
						break;
					case 'paste':
					case 'focusout':
					case 'change':
						utils.cleanChars(format, el, e.type === 'paste');
						break;
				}
			});
		}
	});

	// placeholder 지원여부
	var supportPlaceholder = ('placeholder' in document.createElement('input'));

	/**
	 * 형식 입력폼 모듈
	 * @class
	 * @name scui.ui.FormatInput
	 * @extends scui.ui.View
	 */
	var FormatInput = core.ui('FormatInput', /** @lends scui.ui.Formatter# */{
		$statics: {
			// 허용할 기능키
			byPassKeys: [8, 9, 16, 17, 18, 35, 36, 37, 38, 39, 40, 46, 91, 116],
			// 각 코드에 대한 정규식
			translation: {
				'0': {pattern: /\d/},
				'9': {pattern: /\d/, optional: true},
				'#': {pattern: /\d/, recursive: true},
				'A': {pattern: /[a-zA-Z0-9]/},
				'a': {pattern: /[a-zA-Z]/},
				'o': {pattern: /[0-1]/},    // 월 앞자리
				'm': {pattern: /[0-2]/},    // 월 뒷자리
				'M': {pattern: /[0-3]/},
				'n': {pattern: /[1-9]/},
				'e': {pattern: /[0-8]/}, // 2월 28
				'E': {pattern: /[0-9]/}, // 2월 29
				'Z': {pattern: /0/},
				'Y': {pattern: /[1-2]/}
			},
			// 마스킹 타입
			masks: {
				// 현금
				comma: {
					format: '000,000,000,000,000,000,000,000,000',
					valid: function (value, field, options) {
						value = value.replace(/\D/g, '');

						// 금액은 0으로 시작할 수 없기에..... -> 160107 0원을 입력하는 경우도 있으므로 수정.
						// if (value.substr(0, 1) === '0') { return '';}
						if (value.substr(0, 1) === '0' && value.length > 1) { return value.substr(1);}
						var len = value.length;
						if (len <= 3) {
							return value;
						}
						var maxlength = parseInt(field.getAttribute('maxlength') || 13, 10),
							mod = maxlength - Math.floor((len - 1) / 3);

						return value.substr(0, mod);
					},
					reverse: true
				},
				// 전화번호
				tel: {
					format: function(val, field, options) {
						return val.replace(/\D/g, '').length < 8 ? '000-0000' : '0000-0000'
					}
				},
				// 핸드폰 번호
				mobile: {
					format: function(val, field, options) {
						var maxlength = parseInt(field.getAttribute('maxlength') || 9, 10);

						val = val.replace(/\D/g, '');
						if (maxlength > 9) {
							return val.length < 11 ? '000-000-0000' : '000-0000-0000';
						} else {
							return val.length < 8 ? '000-0000' : '0000-0000';
						}
					}
				},
				// 숫자
				num: {format: '0000000000000000000'},
				// 카드
				card: {format: '0000-0000-0000-0000'},
				// 아멕스카드
				amexcard: {format: '0000-000000-00000'},
				// 카드 자동인식
				allcard: {
					format: function (val, field, options) {
						if (val.substr(0, 4) === '3791') {
							// 아멕스 카드
							return '0000-000000-00000';
						}
						return '0000-0000-0000-0000';
					}
				},
				// 카드 마스킹된 값
				cardmarsking: {format: '0000-****-****-0000'},
				// 아멕스카드 마스킹된 값
				amexcardmarsking: {format: '0000-******-**000'},
				// 카드 자동인식 마스킹된 값
				allcardmarsking: {
					format: function (val, field, options) {
						if (val.substr(0, 4) === '3791') {
							// 아멕스 카드
							return '0000-******-**000';
						}
						return '0000-****-****-0000';
					}
				},
				// 운전면허번호
				driverno: {format: '00-000000-00'},
				// 주민등록번호
				personalno: {format: '000000-0000000'},
				// 사업자번호
				bizno: {format:'000-00-00000'},
				// 법인번호
				corpno: {format:'000000-0000000'},
				// 날짜
				date: {
					format: function (val, field, options) { //'0000.M0.m0'
						val = val.replace(/[^0-9]/g, '').substr(0, 8);
						var len = val.length, ch, y, m, d;
						switch(len) {
							case 5:
								return 'Y000.o';
							case 6:
								ch = val.substr(4, 1);
								if (ch === '1') {
									return 'Y000.om'
								} else if (ch === '0') {
									return 'Y000.on';
								}
							case 7:
								if (val.substr(4, 2) === '02') {
									return 'Y000.o0.m';
								}
								return 'Y000.oE.M';
							case 8:
								y = parseInt(val.substr(0, 4), 10);
								m = parseInt(val.substr(4, 2), 10);
								d = parseInt(val.substr(6, 2), 10);

								if (m === 2) {
									if (core.date.isLeapYear(y, m)) {
										return 'Y000.Zm.0E';
									} else {
										return 'Y000.oE.0e';
									}
								} else if (d >= 30) {
									if (m === 1 || m === 3 || m === 5 || m === 7 || m === 8 || m === 10 || m === 12) {
										return 'Y000.oE.0o';
									} else {
										return 'Y000.oE.0Z';
									}
								} else if (d === 0) {
									return 'Y000.oE.Zn';
								}
						}
						return 'Y000.oE.ME';
					}
				},
				// 영문
				eng: {format: 'a'}
			}
		},
		bindjQuery: 'formatter',
		defaults: {
			format: 'comma', // 기본 포맷
			watch: false,    // 수정을 감시할건가
			watchInterval: 300 // 감시 인터벌
		},
		/**
		 * 생성자
		 * @param el
		 * @param options
		 * @returns {boolean}
		 */
		initialize: function(el, options) {
			var me = this;

			if(me.supr(el, options) === false) { return false; }

			// 자동완성 끜
			me.$el.attr('autocomplete', 'off');

			// card인지 확인
			me.isCard = (me.options.format.indexOf('card') > -1) ? true : false;

			// 원래 이게 여기 있으면 안되는데, 퍼블리싱에서 파일을 전부 다 바꿔야 된대서..걍 스크립트단에서 해줌
			if (me.options.format === 'allcard' || me.options.format === 'card') {
				me.$el.attr('maxlength', 19);
			}

			// IME mode 설정
			me._setIMEMode();

			// 숫자 와 같이 단순한 포맷은 걍 키만 막고 빠져나간다
			if(me._isSimpleFormat() === true) {
				me.clean = function () { return me.$el.val() === me.txtPlaceholder ? '' : me.$el.val(); };
				me.update = function (){ me.inputModule.update(); };
				return;
			}

			me.oldValue = me.$el.val(); // 원래 값
			me.byPassKeys = FormatInput.byPassKeys; // alias
			me.translation = core.extend({}, FormatInput.translation, me.options.translation);  // alias
			me.invalid = [];

			if(!supportPlaceholder) {
				// placeholder를 지원하지 않는 브라우저면 placeholder 문구를 보관하고 있는다.
				me.notSupportPlaceholder = true;
				me.txtPlaceholder = me.$el.attr('placeholder');
			}

			if (core.browser.isGecko) {
				//utils.forceKeyup(me.el);
			}

			me._reloadMask();
			if(me.$el.is(':focus')) {
				var caret = inputSel.get(me.el).begin; // 캐럿 위치를 보관
				me.update();
				inputSel.set(me.el, caret + me._getMCharsBeforeCount(caret, true));
			} else {
				// 최초 로딩시에만 true
				me.update(true);
				// 값이 변경됐는지 감시
				if (me.options.watch) {
					me._watchStart();
				}
			}

			me.regexMask = me._getRegexMask();    // 마스킹에 대한 전체 정규식을 가져온다

			// 이벤트 바인딩
			me._bindEvents();
		},

		/**
		 * 이벤트 바인딩
		 * @private
		 */
		_bindEvents: function() {
			var me = this;

			me.$el
				.on('keyup', function(e) {

					// 바이널 마스크 패턴 사용을 위해 '*' => '0' 으로 변환 : 160119 김건우 선임 요청으로 마스킹 처리 관려 코드 추가 START
					if (me.isCard && location.href.indexOf('.html') === -1) {
						me.$el.val( me.$el.val().replace(/\*/g, '0'));
					}

					me._reloadMask();
					me._process(e);

					// scard.masking.genMask() 함수로 마스킹 적용
					if (me.isCard && location.href.indexOf('.html') === -1) {
						me.$el.val( scard.masking.genMask(me.$el.val(), 'CDNO') );
					}
					// 바이널 마스크 패턴 사용을 위해 '*' => '0' 으로 변환 : 160119 김건우 선임 요청으로 마스킹 처리 관려 코드 추가 - END
				})
				.on('paste drop', function() {
					setTimeout(function() {
						me.$el.keydown().keyup();
					});
				})
				.on('keydown blur', function() {
					me.oldValue = me.$el.val();
				})
				.on('change', function () {
					me.$el.data('changed', true);
				})
				.on('blur', function (){
					if (me.oldValue !== me.$el.val() && !me.$el.data('changed')) {
						me.$el.triggerHandler('change');
					}
					me.oldValue = me.$el.val();
					me.$el.data('changed', false);
				})
				.on('focusin', function() {
					// 포커싱될 때 셀렉트시킬 것인가..
					if(me.options.selectOnFocus === true) {
						$(e.target).select();
					}
					me._watchStop();
				})
				.on('focusout', function() {
					me._watchStart();

					// 포커스가 나갈 때 안맞는 값을 지울것인가
					if(me.options.clearIfNotMatch && !me.regexMask.test(me.$el.val())) {
						me.$el.val('');
					}
				});

			me.$el.on('optionchange', function (e, data) {
				if(data.name === 'format') {
					me.$el.attr('data-format', data.value);
					me.update();
				}
			});

			// comma 형식일 땐 ,가 제거된 상태로 넘어가게
			me.options.format === 'comma' && $(me.el.form).on('submit', function(e) {
				me.remove();
				me.oldValue = '';
			});
		},

		_setIMEMode: function () {
			var me = this;

			switch(me.$el.data('format')) {
				case 'eng':
				case 'num':
				case 'alnum':
				case 'tel':
				case 'mobile':
				case 'allcard':
				case 'card':
				case 'amexcard':
				case 'comma':
				case 'driverno':
				case 'personalno':
				case 'corpno':
				case 'bizno':
				case 'date':
					me.$el.css('ime-mode', 'disabled');
					break;
				case 'kor':
					me.$el.css('ime-mode', 'active');
					break;
			}
		},

		/**
		 * 숫자, 영문자 만 입력하는거면 마스킹 처리는 하지 않고 키보드만 막는다.
		 * @returns {boolean}
		 * @private
		 */
		_isSimpleFormat: function(){
			var me = this,
				format = me.options.format;

			if(format === 'eng' || format === 'alnum' || format === 'num') {
				me.inputModule = new AlnumInput(me.$el[0], {format: format});
				if (core.browser.isMobile && (format === 'num' && me.el.type !== 'password')) {
					me.$el.attr('type', 'tel');
				}
				return true;  // 마스킹은 처리안하도록 true 반환
			} else if(core.array.include(['allcard', 'card', 'amexcard',
					'tel', 'mobile', 'driverno', 'personalno', 'bizno', 'corpno', 'comma', 'date'], format)) {

				if (core.browser.isMobile && me.el.type !== 'password') {
					me.$el.attr('type', 'tel');
				}
				// 숫자
				me.$el.on('keydown', function(e) {
					if (utils.isInvalidKey(e, 'num', FormatInput.byPassKeys)) {
						e.preventDefault();
					}
				});
			} else if (format === 'kor') {
				me.inputModule = new KorInput(me.$el[0]);
				return true;
			}
		},

		/**
		 * 값이 변경됐는지 감시 시작
		 * @private
		 */
		_watchStart: function(){
			var me = this;
			me._watchStop();

			if(!me.options.watch || me.$el.prop('readonly') || me.$el.prop('disabled')) { return; }

			var totalTime = 0, dur = me.options.watchInterval;
			me.watchTimer = setInterval(function() {
				// 40초에 한번씩 dom에서 제거 됐건지 체크해서 타이머를 멈춘다.
				if (totalTime > 40000){
					totalTime = 0;
					if (!$.contains(document, me.$el[0])) {
						clearInterval(me.watchTimer);
						me.watchTimer = null;
						return;
					}
				} else {
					totalTime += dur;
				}
				if (!me.$el){ clearInterval(me.watchTimer); me.watchTimer = null; return; }
				if (me.$el[0].disabled || 0 <= me.$el[0].className.indexOf('disabled')) { return; }

				var val = me.$el.val();
				if(val && me.oldValue != val){
					me.update();
				}
			}, dur);
		},

		/**
		 * 값 변경 감시 중지
		 * @private
		 */
		_watchStop: function() {
			var me = this;
			clearInterval(me.watchTimer);
			me.watchTimer = null;
		},

		/**
		 * 마스킹에 대한 정규식 반환
		 * @returns {RegExp}
		 * @private
		 */
		_getRegexMask: function() {
			var me = this,
				maskChunks = [],
				translation, pattern, optional, recursive, oRecursive, r, ch;

			for(var i = 0, len = me.mask.length; i < len; i++) {
				ch = me.mask.charAt(i);
				if(translation = me.translation[ch]){
					pattern = translation.pattern.toString().replace(/.{1}$|^.{1}/g, '');
					optional = translation.optional;
					if(recursive = translation.recursive){
						maskChunks.push(ch);
						oRecursive = {digit: ch, pattern: pattern};
					} else {
						maskChunks.push(!optional ? pattern : (pattern + '?'));
					}
				} else {
					maskChunks.push(ch.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
				}
			}

			r = maskChunks.join('');
			// 기준을 끝으로 했을 때
			if(oRecursive) {
				r = r.replace(new RegExp('(' + oRecursive.digit + '(.*' + oRecursive.digit + ')?)'), '($1)?')
					.replace(new RegExp(oRecursive.digit, 'g'), oRecursive.pattern);
			}

			return new RegExp(r);
		},
		/**
		 * index위치의 마스킹처리된 문자수
		 * @param index
		 * @param onCleanVal
		 * @returns {number}
		 * @private
		 */
		_getMCharsBeforeCount: function(index, onCleanVal) {
			var me = this, mask = me.mask;
			for (var count = 0, i = 0, maskL = mask.length; i < maskL && i < index; i++) {
				if (!me.translation[mask.charAt(i)]) {
					index = onCleanVal ? index + 1 : index;
					count++;
				}
			}
			return count;
		},
		/**
		 * 캐럿 위치
		 * @param originalCaretPos
		 * @param oldLength
		 * @param newLength
		 * @param maskDif
		 * @returns {*}
		 * @private
		 */
		_caretPos: function (originalCaretPos, oldLength, newLength, maskDif) {
			var me = this,
				mask = me.mask,
				translation = me.translation[mask.charAt(Math.min(originalCaretPos - 1, mask.length - 1))];

			return !translation ? me._caretPos(originalCaretPos + 1, oldLength, newLength, maskDif)
				: Math.min(originalCaretPos + newLength - oldLength - maskDif, newLength);
		},
		/**
		 * 마스킹처리
		 * @param e
		 * @returns {*}
		 * @private
		 */
		_process: function(e) {
			var me = this,
				keyCode = e.keyCode;
			// TODO
			if (keyCode === 17 || (keyCode === 65 && e.ctrlKey)) { return; }

			me.invalid = [];
			if ($.inArray(keyCode, me.byPassKeys) === -1 || keyCode === 46 || keyCode === 8) {
				var caretPos = inputSel.get(me.el).begin,
					currVal = me.maskOption.valid ? me.maskOption.valid(me.$el.val(), me.$el[0]) : me.$el.val(),
					currValL = currVal.length,
					changeCaret = caretPos < currValL,
					newVal = me._getMasked(currVal),
					newValL = newVal.length,
					isFocusin = me.$el.is(':focus'),
					maskDif;

				me.el.value = newVal;
				if (isFocusin && changeCaret && !(keyCode === 65 && e.ctrlKey)) {
					if (!(keyCode === 8 || keyCode === 46)) {
						maskDif = me._getMCharsBeforeCount(newValL - 1) - me._getMCharsBeforeCount(currValL - 1);
						//TODO caretPos = me._caretPos(caretPos, currValL, newValL, maskDif);
						if (newValL != currValL) {
							caretPos += 1;
						}
					}
					inputSel.set(me.el, caretPos);
				}
				return me._callbacks(e);
			}
		},

		/**
		 * 마스킹 옵션이 변경됐을 수도 있기 때문에 다시 정규화 한다.
		 * @private
		 */
		_reloadMask: function() {
			var me = this,
				m, mask;

			me.$el.data('format', me.options.format = me.$el.data('format'));

			// 서버 기본 세팅용 마스킹 패턴
			if (me.isCard) {
				if(m = FormatInput.masks[me.options.format + 'marsking']) {
					me.maskOption = m;
					if(core.is(m.format, 'function')) {
						me.serverMask = m.format.call(me, me.$el.val(), me.$el[0], me.options);
					} else {
						me.serverMask = m.format;
					}
					me.options.reverse = !!m.reverse;
				} else {
					me.serverMask = core.is(me.options.format, 'function') ? me.options.format.call(me) : me.options.format;
				}
			}

			if(m = FormatInput.masks[me.options.format]) {
				me.maskOption = m;
				if(core.is(m.format, 'function')) {
					me.mask = m.format.call(me, me.$el.val(), me.$el[0], me.options);
				} else {
					me.mask = m.format;
				}
				me.options.reverse = !!m.reverse;
			} else {
				me.mask = core.is(me.options.format, 'function') ? me.options.format.call(me) : me.options.format;
			}
		},

		/**
		 * 마스킹처리 코어부분
		 * @param skipMaskChars
		 * @returns {string}
		 * @private
		 */
		_getMasked: function(value, skipMaskChars, isFirst) {
			this._reloadMask();

			if (!value) { return ''; }
			var me = this,
				mask = (me.isCard && isFirst) ? me.serverMask : me.mask,
				buf = [],
				m = 0, maskLen = mask.length,
				v = 0, valLen = value.length,
				offset = 1, addMethod = 'push',
				resetPos = -1,
				lastMaskChar,
				check;

			if (me.options.reverse) {
				addMethod = 'unshift';
				offset = -1;
				lastMaskChar = 0;
				m = maskLen - 1;
				v = valLen - 1;
				check = function () {
					return m > -1 && v > -1;
				};
			} else {
				lastMaskChar = maskLen - 1;
				check = function () {
					return m < maskLen && v < valLen;
				};
			}

			while (check()) {
				var maskDigit = mask.charAt(m),
					valDigit = value.charAt(v),
					translation = me.translation[maskDigit];

				if (translation) {
					if (valDigit.match(translation.pattern)) {
						buf[addMethod](valDigit);
						if (translation.recursive) {
							if (resetPos === -1) {
								resetPos = m;
							} else if (m === lastMaskChar) {
								m = resetPos - offset;
							}

							if (lastMaskChar === resetPos) {
								m -= offset;
							}
						}
						m += offset;
					} else if (translation.optional) {
						m += offset;
						v -= offset;
					} else if (translation.fallback) {
						buf[addMethod](translation.fallback);
						m += offset;
						v -= offset;
					} else {
						me.invalid.push({p: v, v: valDigit, e: translation.pattern});
					}
					v += offset;
				} else {
					if (!skipMaskChars) {
						buf[addMethod](maskDigit);
					}

					if (valDigit === maskDigit) {
						v += offset;
					}

					m += offset;
				}
			}

			var lastMaskCharDigit = mask.charAt(lastMaskChar);
			if (maskLen === valLen + 1 && !me.translation[lastMaskCharDigit]) {
				buf.push(lastMaskCharDigit);
			}

			return buf.join('');
		},

		/**
		 * 콜백함수 바인딩
		 * @param e
		 * @private
		 */
		_callbacks: function (e) {
			var me = this,
				mask = me.mask,
				val = me.$el.val(),
				changed = val !== me.oldValue,
				defaultArgs = [val, e, me.el, me.options],
				callback = function(name, criteria, args) {
					if (typeof me.options[name] === 'function' && criteria) {
						me.options[name].apply(this, args);
					}
				};

			callback('onChange', changed === true, defaultArgs);
			callback('onKeyPress', changed === true, defaultArgs);
			callback('onComplete', val.length === mask.length, defaultArgs);
			callback('onInvalid', me.invalid.length > 0, [val, e, me.el, me.invalid, me.options]);
		},
		/**
		 * 지우기
		 */
		remove: function() {
			var me = this,
				caret = inputSel.get(me.el).begin;
			me._watchStop();
			me.$el.off();
			me.$el.val(me.clean());
			if(me.$el.is(':focus')) {
				inputSel.set(me.el, caret - me._getMCharsBeforeCount(caret));
			}
		},
		/**
		 * 마스킹 제거
		 * @returns {*|string}
		 */
		clean: function() {
			return this._getMasked(this.$el.val(), true);
		},

		/**
		 * 마스킹처리된 값을 인풋에 넣어준다
		 */
		update: function(isFirst) {
			var me = this,
				val = me.$el.val();

			if (val) {
				me.$el.val(me._getMasked(val, '', isFirst));
			}
		},

		release: function (){
			clearInterval(this.watchTimer);
			this.watchTimer = null;

			if (me.inputModule) {
				try { this.inputModule.release(); this.inputModule = null; } catch(e){}
			}
			this.supr();
		}
	});

	if (typeof define === "function" && define.amd) {
		define([], function() {
			return FormatInput;
		});
	}

	core.importJs.define('modules/formatter', FormatInput);

})(jQuery, window[LIB_NAME]);

/**
 * spin module
 */
(function () {
	/**
	 * Copyright (c) 2011-2014 Felix Gnass
	 * Licensed under the MIT license
	 */
	(function(root, factory) {

		/* CommonJS */
		if (typeof exports == 'object')  module.exports = factory();

		/* AMD module */
		else if (typeof define == 'function' && define.amd) define(factory);

		/* Browser global */
		else root.Spinner = factory();
	}
	(this, function() {
		"use strict";

		var prefixes = ['webkit', 'Moz', 'ms', 'O'] /* Vendor prefixes */
			, animations = {} /* Animation rules keyed by their name */
			, useCssAnimations; /* Whether to use CSS animations or setTimeout */

		/**
		 * Utility function to create elements. If no tag name is given,
		 * a DIV is created. Optionally properties can be passed.
		 */
		function createEl(tag, prop) {
			var el = document.createElement(tag || 'div')
				, n;

			for(n in prop) el[n] = prop[n];
			return el;
		}

		/**
		 * Appends children and returns the parent.
		 */
		function ins(parent /* child1, child2, ...*/) {
			for (var i=1, n=arguments.length; i<n; i++)
				parent.appendChild(arguments[i]);

			return parent;
		}

		/**
		 * Insert a new stylesheet to hold the @keyframe or VML rules.
		 */
		var sheet = (function() {
			var el = createEl('style', {type : 'text/css'});
			ins(document.getElementsByTagName('head')[0], el);
			return el.sheet || el.styleSheet;
		}());

		/**
		 * Creates an opacity keyframe animation rule and returns its name.
		 * Since most mobile Webkits have timing issues with animation-delay,
		 * we create separate rules for each line/segment.
		 */
		function addAnimation(alpha, trail, i, lines) {
			var name = ['opacity', trail, ~~(alpha*100), i, lines].join('-')
				, start = 0.01 + i/lines * 100
				, z = Math.max(1 - (1-alpha) / trail * (100-start), alpha)
				, prefix = useCssAnimations.substring(0, useCssAnimations.indexOf('Animation')).toLowerCase()
				, pre = prefix && '-' + prefix + '-' || '';

			if (!animations[name]) {
				sheet.insertRule(
					'@' + pre + 'keyframes ' + name + '{' +
					'0%{opacity:' + z + '}' +
					start + '%{opacity:' + alpha + '}' +
					(start+0.01) + '%{opacity:1}' +
					(start+trail) % 100 + '%{opacity:' + alpha + '}' +
					'100%{opacity:' + z + '}' +
					'}', sheet.cssRules.length);

				animations[name] = 1;
			}

			return name;
		}

		/**
		 * Tries various vendor prefixes and returns the first supported property.
		 */
		function vendor(el, prop) {
			var s = el.style
				, pp
				, i;

			prop = prop.charAt(0).toUpperCase() + prop.slice(1);
			for(i=0; i<prefixes.length; i++) {
				pp = prefixes[i]+prop;
				if(s[pp] !== undefined) return pp;
			}
			if(s[prop] !== undefined) return prop;
		}

		/**
		 * Sets multiple style properties at once.
		 */
		function css(el, prop) {
			for (var n in prop)
				el.style[vendor(el, n)||n] = prop[n];

			return el;
		}

		/**
		 * Fills in default values.
		 */
		function merge(obj) {
			for (var i=1; i < arguments.length; i++) {
				var def = arguments[i];
				for (var n in def)
					if (obj[n] === undefined) obj[n] = def[n];
			}
			return obj;
		}

		/**
		 * Returns the absolute page-offset of the given element.
		 */
		function pos(el) {
			var o = { x:el.offsetLeft, y:el.offsetTop };
			while((el = el.offsetParent))
				o.x+=el.offsetLeft, o.y+=el.offsetTop;

			return o;
		}

		/**
		 * Returns the line color from the given string or array.
		 */
		function getColor(color, idx) {
			return typeof color == 'string' ? color : color[idx % color.length];
		}

		// Built-in defaults

		var defaults = {
			lines: 12,            // The number of lines to draw
			length: 7,            // The length of each line
			width: 5,             // The line thickness
			radius: 10,           // The radius of the inner circle
			rotate: 0,            // Rotation offset
			corners: 1,           // Roundness (0..1)
			color: '#000',        // #rgb or #rrggbb
			direction: 1,         // 1: clockwise, -1: counterclockwise
			speed: 1,             // Rounds per second
			trail: 100,           // Afterglow percentage
			opacity: 1/4,         // Opacity of the lines
			fps: 20,              // Frames per second when using setTimeout()
			zIndex: 2e9,          // Use a high z-index by default
			className: 'spinner', // CSS class to assign to the element
			top: '50%',           // center vertically
			left: '50%',          // center horizontally
			position: 'absolute'  // element position
		};

		/** The constructor */
		function Spinner(o) {
			this.opts = merge(o || {}, Spinner.defaults, defaults);
		}

		// Global defaults that override the built-ins:
		Spinner.defaults = {};

		merge(Spinner.prototype, {

			/**
			 * Adds the spinner to the given target element. If this instance is already
			 * spinning, it is automatically removed from its previous target b calling
			 * stop() internally.
			 */
			spin: function(target) {
				this.stop();

				var self = this
					, o = self.opts
					, el = self.el = css(createEl(0, {className: o.className}), {position: o.position, width: 0, zIndex: o.zIndex})
					, mid = o.radius+o.length+o.width;

				css(el, {
					left: o.left,
					top: o.top
				});

				if (target) {
					target.insertBefore(el, target.firstChild||null);
				}

				el.setAttribute('role', 'progressbar');
				self.lines(el, self.opts);

				if (!useCssAnimations) {
					// No CSS animation support, use setTimeout() instead
					var i = 0
						, start = (o.lines - 1) * (1 - o.direction) / 2
						, alpha
						, fps = o.fps
						, f = fps/o.speed
						, ostep = (1-o.opacity) / (f*o.trail / 100)
						, astep = f/o.lines;

					;(function anim() {
						i++;
						for (var j = 0; j < o.lines; j++) {
							alpha = Math.max(1 - (i + (o.lines - j) * astep) % f * ostep, o.opacity);
							self.opacity(el, j * o.direction + start, alpha, o);
						}
						self.timeout = self.el && setTimeout(anim, ~~(1000/fps));
					})();
				}
				return self;
			},

			/**
			 * Stops and removes the Spinner.
			 */
			stop: function() {
				var el = this.el;
				if (el) {
					clearTimeout(this.timeout);
					if (el.parentNode) el.parentNode.removeChild(el);
					this.el = undefined;
				}
				return this;
			},

			/**
			 * Internal method that draws the individual lines. Will be overwritten
			 * in VML fallback mode below.
			 */
			lines: function(el, o) {
				var i = 0
					, start = (o.lines - 1) * (1 - o.direction) / 2
					, seg;

				function fill(color, shadow) {
					return css(createEl(), {
						position: 'absolute',
						width: (o.length+o.width) + 'px',
						height: o.width + 'px',
						background: color,
						boxShadow: shadow,
						transformOrigin: 'left',
						transform: 'rotate(' + ~~(360/o.lines*i+o.rotate) + 'deg) translate(' + o.radius+'px' +',0)',
						borderRadius: (o.corners * o.width>>1) + 'px'
					});
				}

				for (; i < o.lines; i++) {
					seg = css(createEl(), {
						position: 'absolute',
						top: 1+~(o.width/2) + 'px',
						transform: o.hwaccel ? 'translate3d(0,0,0)' : '',
						opacity: o.opacity,
						animation: useCssAnimations && addAnimation(o.opacity, o.trail, start + i * o.direction, o.lines) + ' ' + 1/o.speed + 's linear infinite'
					});

					if (o.shadow) ins(seg, css(fill('#000', '0 0 4px ' + '#000'), {top: 2+'px'}));
					ins(el, ins(seg, fill(getColor(o.color, i), '0 0 1px rgba(0,0,0,.1)')));
				}
				return el;
			},

			/**
			 * Internal method that adjusts the opacity of a single line.
			 * Will be overwritten in VML fallback mode below.
			 */
			opacity: function(el, i, val) {
				if (i < el.childNodes.length) el.childNodes[i].style.opacity = val;
			}

		});


		function initVML() {

			/* Utility function to create a VML tag */
			function vml(tag, attr) {
				return createEl('<' + tag + ' xmlns="urn:schemas-microsoft.com:vml" class="spin-vml">', attr);
			}

			// No CSS transforms but VML support, add a CSS rule for VML elements:
			sheet.addRule('.spin-vml', 'behavior:url(#default#VML)');

			Spinner.prototype.lines = function(el, o) {
				var r = o.length+o.width
					, s = 2*r;

				function grp() {
					return css(
						vml('group', {
							coordsize: s + ' ' + s,
							coordorigin: -r + ' ' + -r
						}),
						{ width: s, height: s }
					);
				}

				var margin = -(o.width+o.length)*2 + 'px'
					, g = css(grp(), {position: 'absolute', top: margin, left: margin})
					, i;

				function seg(i, dx, filter) {
					ins(g,
						ins(css(grp(), {rotation: 360 / o.lines * i + 'deg', left: ~~dx}),
							ins(css(vml('roundrect', {arcsize: o.corners}), {
									width: r,
									height: o.width,
									left: o.radius,
									top: -o.width>>1,
									filter: filter
								}),
								vml('fill', {color: getColor(o.color, i), opacity: o.opacity}),
								vml('stroke', {opacity: 0}) // transparent stroke to fix color bleeding upon opacity change
							)
						)
					);
				}

				if (o.shadow)
					for (i = 1; i <= o.lines; i++)
						seg(i, -2, 'progid:DXImageTransform.Microsoft.Blur(pixelradius=2,makeshadow=1,shadowopacity=.3)');

				for (i = 1; i <= o.lines; i++) seg(i);
				return ins(el, g);
			};

			Spinner.prototype.opacity = function(el, i, val, o) {
				var c = el.firstChild;
				o = o.shadow && o.lines || 0;
				if (c && i+o < c.childNodes.length) {
					c = c.childNodes[i+o]; c = c && c.firstChild; c = c && c.firstChild;
					if (c) c.opacity = val;
				}
			};
		}

		var probe = css(createEl('group'), {behavior: 'url(#default#VML)'});

		if (!vendor(probe, 'transform') && probe.adj) initVML();
		else useCssAnimations = vendor(probe, 'animation');

		return Spinner;

	}));

	$.fn.spin = function(opts) {
		this.each(function () {
			var $this = $(this),
				data = $this.data();

			if (data.spinner) {
				data.spinner.stop();
				delete data.spinner;
			}

			if (opts !== false) {
				data.spinner = new Spinner($.extend({color: $this.css('color')}, opts)).spin(this);
			}
		});

		return this;
	};
})();

/*!
 * @author comahead
 * @email 김승일 책임(comahead@vi-nyl.com)
 * @create 2014-12-08
 * @license MIT License
 * @description 삼성카드 전용 유틸함수 모음
 */
(function ($, core, undefined) {
	"use strict";
	if (core.ui.isNumberKeys) { return; }

	/**
	 * 키이벤트에 대한 숫자키여부 체크
	 * @param keyCode
	 * @returns {boolean}
	 */
	core.ui.isNumberKeys = function (keyCode) {
		return (keyCode >= 48 && keyCode <= 57)
			|| (keyCode >= 96 && keyCode <= 105) // 오른쪽 숫자키
			|| (keyCode === 37) // left
			|| (keyCode === 39)  // right
			|| (keyCode === 9)// left
			|| (keyCode === 46) // delete
			|| (keyCode === 35) // end
			|| (keyCode === 36) // home
			|| (keyCode === 144) // num lock
			|| (keyCode === 109) // -
			|| (keyCode === 189) // .
			|| (keyCode === 8); // backspace
	};

	/**
	 * body를 스크롤이 안되게 변경
	 * * 현재 사용안함
	 * @param flag
	 */
	core.ui.setBodyOverflow = function (flag) {
		var $html = $('html'),
			cnt   = $html.data('overflowCount') === undefined ? 0 : $html.data('overflowCount');

		if (flag) {
			cnt += 1;
			if (cnt === 1) {
				$html.css('overflow', 'hidden');
			}
		} else {
			cnt = Math.max(cnt - 1, 0);
			if (cnt === 0) {
				$html.css('overflow', '');
			}
		}

		$html.data('overflowCount', cnt);
	};

	// 주어진 엘리먼트위치로 스크롤(헤더아래)
	core.util.scrollToElement = function($el, opts) {
		opts || (opts = {});
		var top,
			duration = opts.duration || 'fast',
			easing = opts.easing || 'easeOutQuad',
			complete = opts.complete || null,
			scroller;

		if (opts.scroller) {
			scroller = $(opts.scroller).children();
			top = ($el.offset().top - scroller.offset().top) + scroller.scrollTop();
		} else {
			scroller = $('html, body');
			top = $el.offset().top - (opts.ignoreHeader !== false ? $('#htop').height() : 0);
		}

		scroller.stop().animate({
			scrollTop: top - (opts.offset|0)
		}, {
			duration: duration,
			easing: easing,
			complete: complete
		});
	};

})(jQuery, window[LIB_NAME]);


/*! ============================================================
 * jQuery Easing v1.3 - http://gsgd.co.uk/sandbox/jquery/easing/
 *
 * Open source under the BSD License.
 *
 * Copyright © 2008 George McGinley Smith
 * All rights reserved.
 * https://raw.github.com/danro/jquery-easing/master/LICENSE
 * ======================================================== */
jQuery.easing.jswing=jQuery.easing.swing,jQuery.extend(jQuery.easing,{def:"easeInOutQuad",swing:function(a,b,c,d,e){return jQuery.easing[jQuery.easing.def](a,b,c,d,e)},easeInQuad:function(a,b,c,d,e){return d*(b/=e)*b+c},easeOutQuad:function(a,b,c,d,e){return-d*(b/=e)*(b-2)+c},easeInOutQuad:function(a,b,c,d,e){return(b/=e/2)<1?d/2*b*b+c:-d/2*(--b*(b-2)-1)+c},easeInCubic:function(a,b,c,d,e){return d*(b/=e)*b*b+c},easeOutCubic:function(a,b,c,d,e){return d*((b=b/e-1)*b*b+1)+c},easeInOutCubic:function(a,b,c,d,e){return(b/=e/2)<1?d/2*b*b*b+c:d/2*((b-=2)*b*b+2)+c},easeInQuart:function(a,b,c,d,e){return d*(b/=e)*b*b*b+c},easeOutQuart:function(a,b,c,d,e){return-d*((b=b/e-1)*b*b*b-1)+c},easeInOutQuart:function(a,b,c,d,e){return(b/=e/2)<1?d/2*b*b*b*b+c:-d/2*((b-=2)*b*b*b-2)+c},easeInQuint:function(a,b,c,d,e){return d*(b/=e)*b*b*b*b+c},easeOutQuint:function(a,b,c,d,e){return d*((b=b/e-1)*b*b*b*b+1)+c},easeInOutQuint:function(a,b,c,d,e){return(b/=e/2)<1?d/2*b*b*b*b*b+c:d/2*((b-=2)*b*b*b*b+2)+c},easeInSine:function(a,b,c,d,e){return-d*Math.cos(b/e*(Math.PI/2))+d+c},easeOutSine:function(a,b,c,d,e){return d*Math.sin(b/e*(Math.PI/2))+c},easeInOutSine:function(a,b,c,d,e){return-d/2*(Math.cos(Math.PI*b/e)-1)+c},easeInExpo:function(a,b,c,d,e){return b==0?c:d*Math.pow(2,10*(b/e-1))+c},easeOutExpo:function(a,b,c,d,e){return b==e?c+d:d*(-Math.pow(2,-10*b/e)+1)+c},easeInOutExpo:function(a,b,c,d,e){return b==0?c:b==e?c+d:(b/=e/2)<1?d/2*Math.pow(2,10*(b-1))+c:d/2*(-Math.pow(2,-10*--b)+2)+c},easeInCirc:function(a,b,c,d,e){return-d*(Math.sqrt(1-(b/=e)*b)-1)+c},easeOutCirc:function(a,b,c,d,e){return d*Math.sqrt(1-(b=b/e-1)*b)+c},easeInOutCirc:function(a,b,c,d,e){return(b/=e/2)<1?-d/2*(Math.sqrt(1-b*b)-1)+c:d/2*(Math.sqrt(1-(b-=2)*b)+1)+c},easeInElastic:function(a,b,c,d,e){var f=1.70158,g=0,h=d;if(b==0)return c;if((b/=e)==1)return c+d;g||(g=e*.3);if(h<Math.abs(d)){h=d;var f=g/4}else var f=g/(2*Math.PI)*Math.asin(d/h);return-(h*Math.pow(2,10*(b-=1))*Math.sin((b*e-f)*2*Math.PI/g))+c},easeOutElastic:function(a,b,c,d,e){var f=1.70158,g=0,h=d;if(b==0)return c;if((b/=e)==1)return c+d;g||(g=e*.3);if(h<Math.abs(d)){h=d;var f=g/4}else var f=g/(2*Math.PI)*Math.asin(d/h);return h*Math.pow(2,-10*b)*Math.sin((b*e-f)*2*Math.PI/g)+d+c},easeInOutElastic:function(a,b,c,d,e){var f=1.70158,g=0,h=d;if(b==0)return c;if((b/=e/2)==2)return c+d;g||(g=e*.3*1.5);if(h<Math.abs(d)){h=d;var f=g/4}else var f=g/(2*Math.PI)*Math.asin(d/h);return b<1?-0.5*h*Math.pow(2,10*(b-=1))*Math.sin((b*e-f)*2*Math.PI/g)+c:h*Math.pow(2,-10*(b-=1))*Math.sin((b*e-f)*2*Math.PI/g)*.5+d+c},easeInBack:function(a,b,c,d,e,f){return f==undefined&&(f=1.70158),d*(b/=e)*b*((f+1)*b-f)+c},easeOutBack:function(a,b,c,d,e,f){return f==undefined&&(f=1.70158),d*((b=b/e-1)*b*((f+1)*b+f)+1)+c},easeInOutBack:function(a,b,c,d,e,f){return f==undefined&&(f=1.70158),(b/=e/2)<1?d/2*b*b*(((f*=1.525)+1)*b-f)+c:d/2*((b-=2)*b*(((f*=1.525)+1)*b+f)+2)+c},easeInBounce:function(a,b,c,d,e){return d-jQuery.easing.easeOutBounce(a,e-b,0,d,e)+c},easeOutBounce:function(a,b,c,d,e){return(b/=e)<1/2.75?d*7.5625*b*b+c:b<2/2.75?d*(7.5625*(b-=1.5/2.75)*b+.75)+c:b<2.5/2.75?d*(7.5625*(b-=2.25/2.75)*b+.9375)+c:d*(7.5625*(b-=2.625/2.75)*b+.984375)+c},easeInOutBounce:function(a,b,c,d,e){return b<e/2?jQuery.easing.easeInBounce(a,b*2,0,d,e)*.5+c:jQuery.easing.easeOutBounce(a,b*2-e,0,d,e)*.5+d*.5+c}});

/*!
 * jQuery word-break keep-all Plugin
 * ver 1.3.0
 *
 * Copyright 2012, Ahn Hyoung-woo (mytory@gmail.com)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * https://github.com/mytory/jquery-word-break-keep-all
 * http://mytory.co.kr/archives/2801
 *
 * Date: 2013-09-04
 */

jQuery.fn.wordBreakKeepAll = function(option) {
	var is_there_end_angle_bracket = function(str){
		return str.lastIndexOf('<') < str.lastIndexOf('>');
	};

	var is_there_start_angle_bracket = function(str){
		return str.lastIndexOf('>') < str.lastIndexOf('<');
	};

	var is_there_no_angle_bracket = function(str){
		//only -1
		return str.lastIndexOf('>') == str.lastIndexOf('<');
	};

	var defaultOption = {
		OffForIE: false, // If IE, turn off plugin.
		useCSSonIE: true // on IE, use CSS word-break: keep-all
	};

	var opt = $.extend(defaultOption,option);

	if( /MSIE/.test(navigator.userAgent) && opt.OffForIE == false && opt.useCSSonIE == true){
		var addWordBreakKeepAll = function(obj){
			$(obj).css({
				'word-break': 'keep-all',
				'word-wrap': 'break-word'
			});
			if($(obj).css('display') == 'inline'){
				$(obj).css('display','block');
			}
		};
	}else if( ! /MSIE/.test(navigator.userAgent) || /MSIE/.test(navigator.userAgent) && opt.OffForIE == false && opt.useCSSonIE == false ){
		var addWordBreakKeepAll = function(obj){

			var html = $(obj).html();

			// to store line break
			html = html.replace(/(\r\n|\n|\r)/gm, ' ＃＆＊＠§ ');

			// .html() 로 집어 넣었을 때, 여는 태그만 있으면 브라우저가 자동으로 닫는 태그를 집어 넣기 때문에 <,>를 다 없앤다.
			var textArr = html.split(' ');

			// remove empty array
			textArr = textArr.filter(function(e){return e;});
			$(obj).text('');
			var skip = false;
			var full_str = '';

			for(var i=0,j=textArr.length; i<j; i++){
				var str = textArr[i];

				/*
				 * 태그가 닫히고 끝났으면 일단 이놈은 적용하지 않고 다음 놈부터 skip = false;
				 * 태그가 열리고 끝났으면 skip = true;
				 * 태그가 없는 경우 특별히 skip을 조정하지 않는다. 태그 안의 속성도 글자만 있을 수 있다.
				 * 
				 * nowrap 적용할 경우 : 태그가 없다 and skip == false
				 * nowrap 적용 안 하는 경우 : 태그가 있는 경우 or skip == true
				 * 
				 * skip = true 로 변경하는 경우 : 지금 태그가 열린 경우
				 * skip = false 로 변경하는 경우 : 지금 태그가 닫힌 경우
				 */
				if(skip == false && is_there_no_angle_bracket(str) &&  str.indexOf('＃＆＊＠§') == -1 ){
					full_str += '<span style="white-space: nowrap">'+str+'</span> ';
				}else{
					full_str += str + ' ';
				}

				if(is_there_start_angle_bracket(str)){
					skip = true;
				}
				if(is_there_end_angle_bracket(str)){
					skip = false;
				}
			};
			$(obj).html(full_str.replace(/＃＆＊＠§/g, "\n"));
		};
	}
	return this.each(function(){
		addWordBreakKeepAll(this);
	});
};

(function ($, core) {
	"use strict";
	if (core._initGlobalBuilds) { return; }
	core._initGlobalBuilds = true;

	var $doc = $(document),
		$win = $(window);


	// 공통 UI컨트롤 빌드
	$.fn.buildUIControls = function () {
		// 아코디언
		$('.ui_accordion', this).scAccordion();

		// 내부 스크롤
		$('.ui_scrollview', this).scScrollview();

		// 셀렉트 박스
		$('.ui_selectbox', this).scSelectbox();

		// 탭
		$('.ui_tab', this).scTab();

		// 전체선택
		$(':checkbox[data-check-all]', this).scCheckboxAllChecker();

		return this;
	};

	$(function () {
		$doc.buildUIControls();
		$('body').removeClass('invisible');  // 기본 UI 빌드후에 컨텐츠 내용 View - 160106 김건우 선임 요청 : #wrap에서 body로 변경. 160112 문경나 차장 요청

		// IE9에서 placeholder가 지원안되어 강제로 import
		if (core.browser.isIE && core.browser.version === 9) {
			core.importJs([
				'libs/placeholders.min'
			], function() {
			});
		}
	});

	// 형식 입력폼(금액, 전화번호): 김승일
	//  작동원리: getElementsByTagName으로 특정 태그를 찾고나서 dom이 동적으로 변경됐을 때, 다시 검색하지 않아도
	// 자동으로 새로 추가된 엘리먼트가 변수에 추가된다. 이를 이용하여 형식폼을 빌드시킨다.
	$(function() {
		core.importJs([
			'modules/formatter'
		], function() {
			var inputs = document.getElementsByTagName('input'),
				len;

			setInterval(function () {
				if (len === inputs.length) { return; }
				len = inputs.length;
				var input;
				for (var i = 0; i < len; i++) {
					input = inputs[i];
					if ((input.type === 'text' || input.type === 'password')
						&& input.className.indexOf('ui_formatter') >= 0
						&& !input.getAttribute('data-formatted')) {
						$(input).scFormatter();
						input.setAttribute('data-formatted', 'true');
					}
				}
			}, 500);

			// H1 타이틀 Word Break용 호출
			$('.location_menu_wrap > .tit > h1').wordBreakKeepAll();
			$('.card_info_wrap > .card_info > h2 > span').wordBreakKeepAll();
			$('#gnb_mobile').find('.l_nav_in > ul > li > a > span').wordBreakKeepAll();
			$('#gnb_mobile').find('.nav_list > div > ul > li > a').wordBreakKeepAll();
			$('#gnb_mobile').find('.nav_list > div > ul > li > ul > li > a').wordBreakKeepAll();
		});
	});
})(jQuery, window[LIB_NAME]);
