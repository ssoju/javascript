/*!
 * @author 김승일
 * @email comahead@vi-nyl.com
 * @date 2012-06-12
 * @description 멜론 프레임웍
 */
!(function($, WEBSVC, PBPGN, undefined) {
	var Class = WEBSVC.Class,
		dateUtil = WEBSVC.date,
		stringUtil = WEBSVC.string,
		numberUtil = WEBSVC.number,
		$doc = $(document),
		$win = $(window);

	PBPGN.WeekCalendar.prototype.defaults.getCaption = function(type, wn, sy, sm, sd, ey, em, ed) {
		var date = sy+'.'+sm+'.'+sd+'~'+ey+'.'+em+'.'+ed;
		switch(type){
		case 'active':
			return date+' (선택하신 주간 차트입니다.)';
		case 'normal': 
		console.log(type);
			return date + ' 차트 - 페이지 이동';
		case 'before': 
			return date + ' (' + this.limitWeek + '주 이내의 데이터만 조회가 가능합니다)';
		case 'after':
			return date+' (해당 차트는 아직 집계되지 않았습니다.)';
		}
		return '';
	};
	PBPGN.WeekCalendar.prototype.defaults.getTitle = PBPGN.WeekCalendar.prototype.defaults.getCaption;

	PBPGN.MonthCalendar.prototype.defaults.getTitle = function(type, year, month) {
		switch(type){
		case 'active':
			return month+'월 차트';
		case 'normal':
			return month+'월 차트 - 페이지 이동';
		case 'before':
			return '('+this.limitDate.getFullYear()+'년도 '+(this.limitDate.getMonth()+1)+'월까지의 데이터만 조회가 가능합니다.)';
		case 'after':
			return	'(해당 차트는 아직 집계되지 않았습니다.)';
		}
		return '';
	};

	WEBSVC.define('PBPGN.SearchChart', function() {
		var parts = ['age', 'year', 'month', 'day','classCd'],
			charts = ['WE', 'MO', 'YE', 'AG', 'MV', 'AL', 'NS'],
			string = WEBSVC.string,
			array = WEBSVC.array,
			idNames = ['decade', 'year', 'month', 'week', 'gnr'],
			isLoading = false;

		/**
		 * 챠트 검색 모듈
		 * @class
		 * @name MELON.PBPGN.SearchChart
		 * @example
		 * new MELON.PBPGN.SearchChart('#chart');
		 * // or
		 * $('#chart').searchChart();
		 */	
		var SearchChart = Class({
			name: 'SearchChart',
			$extend: MELON.PBPGN.View,
			selectors: {
				container: 'div.wrap_chart',
				panels: 'div.box_chic',
				inputs: 'input[type=hidden]'
			},
			events: {
				'click h4>a': 'onSelectedChartType',
				'click div.list_value input:radio': function(e) {
					var me = this,
						$this = $(e.currentTarget),
						depth = $this.closest('div.box_chic').index() + 1;

					$this.closest('div.box_chic.view').addClass('on');
					$this.closest('li').siblings().removeClass('on').end().addClass('on');

					me.onSelectedItem(depth);
				}
			},
			defaults: {
				searchUrl: 'searchchart_data.html',
				timeout: 5000
			},

			/**
			 * 생성자
			 * @function
			 * @name MELON.PBPGN.SearchChart#initialize
			 */
			initialize: function(el, options) {
				var me = this;

				if(me.supr(el, options) === false) { return; }

				me.chartType = '';
			},

			onSelectedChartType: function(e) {
				e.preventDefault();

				var me = this,
					$this = $(e.currentTarget);

				me.chartType = $this.attr('data-value');
				me.$container.insertAfter($this.parent());
				me.$el.find('>h3').addClass('on');
				me.$panels.find('div.list_bass>ul').show();

				$this.parent().activeRow('on');
				$this.next().prop('checked', true);

				me._loadItems(0);
			},

			/**
			 * 챠트항목 선택시의 핸들러함수
			 * @function
			 * @private
			 * @name MELON.PBPGN.SearchChart#onSelectedItems
			 */
			onSelectedItem: function(depth) {
				var me = this,
					chartType = me.chartType;

				if(depth > 4){
					me.trigger('selected', [me._makeParams()]);
					return;
				}

				switch(chartType) {
				case 'WE': 
				case 'MO':
				case 'YE':
				case 'AG':
					if(depth + array.indexOf(charts, chartType) >= 4){
						me.$panels.filter(':gt('+(depth - 1)+')').find('div.list_bass>ul').hide();
						depth = 4;
					}
				case 'NS':
				case 'MV':
				case 'AL':
					break;
				}
				
				me._loadItems(depth);
			},

			_makeParams: function(){
				var me = this,
					params = {
						p_chartType: me.chartType
					};

				me.$panels.each(function(i) {
					var $pane = $(this),
						$item = $pane.find('div.list_value input:radio:checked');

					if($pane.hasClass('on')) {
						params['p_' + parts[i]] = $item.val();
					}
				});

				if(params.p_day) {
					var wds = params.p_day.replace(/:/g, '').split('~');
					params.p_startDay = params.p_year+wds[0];
					params.p_endDay = params.p_year+wds[1];
				}

				return params;
			},

			/**
			 * 
			 * @function
			 * @private
			 * @name MELON.PBPGN.SearchChart#_loadItems
			 */
			_loadItems: function(depth) {
				if(isLoading) { return; }
				isLoading = true;

				var me = this,
					url = me.options.searchUrl,
					params = me._makeParams(),
					dfd = new $.Deferred(); // 걍 써봄 ;;
				
				me._disabledSubPanels(depth);

				if(me.options.getUrl){
					url = me.options.getUrl(depth, params);
					if(typeof url !== 'undefined' && typeof url !== 'string') {
						url = url.url;
						params = url.params;
					}
				}

				$.ajax({
					url: url,
					data: params,
					method: 'post',
					dataType: 'json',
					beforeSend: function() {

					},
					timeout: me.options.timeout
				}).done(function(res) {
					if(res && res.success === true) {
						dfd.resolveWith(me, [depth, res]);
					} else {
						dfd.rejectWith(me, [depth, res]);
					}
				}).fail(function(){
					dfd.rejectWith(me);
				}).always(function(){
					isLoading = false;
				});
				
				dfd.done(function(depth, res) {
					me._fillItems(depth, res.data);
					me.$panels.eq(depth).removeClass('on').addClass('view');
				}).fail(function() {
					alert('죄송합니다. 알수 없는 이유로 중단되었습니다.');
				});
			},

			_disabledSubPanels: function(depth) {
				var me = this,
					params = {};

				me.$panels.each(function(i) {
					if(depth > i) { return; }
					var $pane = $(this);
					$pane.removeClass('view').removeClass('on').find('div.list_value li').remove();
				});
			},

			/**
			 * depth에 해당하는 패널에 data를 바탕으로 리스트를 생성.
			 * @function
			 * @name MELON.PBPGN.SearchChart#_fillItems
			 * @param {Number} depth 해당패널의 depth
			 * @param {JSON} ajax를 통해 받은 데이타
			 */
			_fillItems: function(depth, data) {
				var me = this,
					$panels = me.$panels,
					items = data.listTable['itemList'],
					html = '';

				//me._disabledSubPanels(depth);
				
				if(items && items.length > 0) {
					for(var i = 0, item; item = items[i++]; ) {
						html += ['<li><span>',
									'<input type="radio" name="p_'+parts[depth]+'" id="'+idNames[depth]+'_'+i+'" class="input_radio" value="'+item.itemValue+'" />',
									'<label for="'+idNames[depth]+'_'+i+'">'+item.itemName+'</label>',
								'</span></li>'].join('');
					}
				}

				me.$panels.eq(depth).find('div.list_value>ul').html(html);
			},

			getValue: function() {
				return this._makeParams();
			},

			/**
			 * 파괴자
			 * @function
			 * @name MELON.PBPGN.SearchChart#destroy
			 */
			destroy: function() {
				var me = this;

				me.supr();
			}
		});

		WEBSVC.bindjQuery(SearchChart, 'searchChart');
		return SearchChart;
	});

	WEBSVC.define('TimeSlider', function () {
		var TimeSlider = Class({
			name: 'TimeSlider',
			$extend: MELON.PBPGN.View,
			defaults: {
				orientation: 'horizontal',
				duration: 300,
				easing: 'ease-in-out',
				animate: true,
				render: false
			},
			selectors: {
				'sliderBox': '.d_slider_box',
				'panel': '.d_panel',
				'prevArrow': '.d_prev',
				'nextArrow': '.d_next'
			},

			initialize: function (el, options) {
				var me = this;

				if(me.supr(el, options) === false) { me.destroy(); return; }

				me.lastTime = me.options.lastTime || me.$el.attr('data-last-time') || dateUtil.format(new Date(), 'hh:00');
				me.onTime = me.options.activeTime || me.$el.attr('data-active-time') || me.lastTime;

				me._initTimeSlider();
				me.active(me.onTime);
			},

			_initTimeSlider: function() {
				var me = this;

				me.$panel.css('width', me.totalWidth);

				me.$prevArrow.on('click', function(){
					me._slide('prev');
				});

				me.$nextArrow.on('click', function(){
					me._slide('next');
				});

				me.on('click', 'a', function(e) {
					e.preventDefault();

					me.trigger('selected', [$(this).text()]);
				});

			},

			active: function(time) {
				var me = this,
					left = 0,
					centerPos = 0,
					t = time.match(/^\d+/);

				if(t) {
					me.onTime = time;
					me.options.render && me.render();

					me.$items = me.$panel.find('>li');
					me.itemCount = me.$items.length;
					me.moveWidth = me.$sliderBox.width();
					me.itemWidth = me.$items.eq(0).width();
					me.totalWidth = me.itemWidth * me.itemCount;
					me.limitLeft =  me.moveWidth - me.totalWidth;

					centerPos = Math.floor((me.moveWidth / me.itemWidth) / 2);
					t = parseInt(t[0], 10);

					if(t < centerPos) {
						left = 0;
					} else if(centerPos >= (me.itemCount - t)) {
						left = me.limitLeft;
					} else {
						left = -((t - centerPos) * me.itemWidth);
					}
					
					me._slide('cur', left);
				}
			},

			_slide: function(dir, currentLeft) {
				var me = this;

				currentLeft = typeof currentLeft === 'undefined' ? parseInt(me.$panel.css('left'), 10) : currentLeft;

				if(dir === 'prev') {
					currentLeft = Math.min(0, currentLeft + me.moveWidth);
				} else if(dir === 'next'){
					currentLeft = Math.max(me.limitLeft, currentLeft - me.moveWidth);
				}

				me.$panel.stop().animate({
					'left': currentLeft
				}, {
					'easing': 'easeInOutCubic', 
					'duration': 600
				});

				if(currentLeft === 0) {
					me.$prevArrow.addClass('disabled').prop('disabled', true);
					me.$nextArrow.removeClass('disabled').prop('disabled', false);
				} else if(currentLeft === me.limitLeft){
					me.$prevArrow.removeClass('disabled').prop('disabled', false);
					me.$nextArrow.addClass('disabled').prop('disabled', true);
				} else {
					me.$prevArrow.removeClass('disabled').prop('disabled', false);
					me.$nextArrow.removeClass('disabled').prop('disabled', false);
				}
			},

			render: function() {
				var me = this,
					nowHour = parseInt(me.lastTime.split(':')[0], 10), 
					html = '',
					h, isOn;

				for(var i = 0; i < 24; i++ ){
					h = numberUtil.zeroPad(i);
					isOn = (h+':00' === me.onTime);
					if( !isOn && i <= nowHour){
						html += '<li data-time="'+h+':00"><a href="#" title="'+h+'시 실시간 급상승 TOP100 페이지로 이동">'+h+':00</a></li>';
					} else {
						html += '<li data-time="'+h+':00"'+(isOn?' class="on"' : "")+'><span>'+h+':00</span></li>';
					}
				}

				me.$panel.html(html);
			}
		});

		WEBSVC.bindjQuery(TimeSlider, 'timeSlider');

		return TimeSlider;
	});


	$(function() {
		
		$('div.summ_prid').on('showcalendar hidecalendar', function(e){
			if(e.type === 'showcalendar'){
				$(this).addClass('on');
			} else {
				$(this).removeClass('on');
			}
		});

		//start: 20140208 : mhover
		$('.period_album').mouseHover('li');
		//end: 20140208 : mhover
		
	});

})(jQuery, MELON.WEBSVC, MELON.PBPGN);
