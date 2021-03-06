/*!
 * @author 김승일
 * @email comahead@vi-nyl.com
 * @date 2012-04-24
 * @description 멜론 프레임웍
 */
!(function($, WEBSVC, PBPGN, undefined) {
	var Class = WEBSVC.Class,
		dateUtil = WEBSVC.date,
		stringUtil = WEBSVC.string,
		numberUtil = WEBSVC.number,
		$doc = $(document),
		$win = $(window);

	// 차트메뉴 내에서 띄워지는 주간달력 캡션부분의 문구를 재정의(화면에는 안보이지만, 리더기를 위해 숨겨진 텍스트를 제공하는데, 이곳에 들어갈 문구)
	PBPGN.WeekCalendar.prototype.defaults.getCaption = function(type, wn, sy, sm, sd, ey, em, ed) {
		var date = sy+'.'+sm+'.'+sd+'~'+ey+'.'+em+'.'+ed;
		switch(type){
		case 'active':	// 선택된 주간
			return date+' (선택하신 주간 '+this.options.title+'입니다.)';
		case 'normal':	// 선택할 수 있는 주간
			return date + ' '+this.options.title+' - 페이지 이동';
		case 'before':	// 선택할 수 없는 이전주간(이를테면, 12주 이전의 주간)
			return date + ' (' + this.limitWeek + '주 이내의 데이터만 조회가 가능합니다)';
		case 'after':	// 선택할 수 없는 이후주간(이를테면, 현재 시간 이후)
			return date+' (해당 '+this.options.title+'(은)는 아직 집계되지 않았습니다.)';
		}
		return '';
	};
	// 차트메뉴 내에서 띄워지는 주간달력 툴팁부분의 문구를 재정의(캡션과 동일)
	PBPGN.WeekCalendar.prototype.defaults.getTitle = PBPGN.WeekCalendar.prototype.defaults.getCaption;

	// 차트메뉴 내에서 띄워지는 월간간달력 툴팁(title속성)부분의 문구를 재정의
	PBPGN.MonthCalendar.prototype.defaults.getTitle = function(type, year, month) {
		switch(type){
		case 'active':	// 선택된 주간
			return month+'월 '+this.options.title+'';
		case 'normal':	// 선택할 수 있는 주간
			return month+'월 '+this.options.title+' - 페이지 이동';
		case 'before':	// 선택할 수 없는 이전주간(이를테면, 12주 이전의 주간)
			return '('+this.limitDate.getFullYear()+'년도 '+(this.limitDate.getMonth()+1)+'월까지의 데이터만 조회가 가능합니다.)';
		case 'after':	// 선택할 수 없는 이후주간(이를테면, 현재 시간 이후)
			return	'(해당 '+this.options.title+'(은)는 아직 집계되지 않았습니다.)';
		}
		return '';
	};

	WEBSVC.define('PBPGN.SearchChart', function() {
        var parts = ['age', 'year', 'mon', 'day','classCd'],		// 서버에 보내질 값들의 이름
			charts = ['WE', 'MO', 'YE', 'AG', 'MV', 'AL', 'NS'],	// 차트 종류
			string = WEBSVC.string,
			array = WEBSVC.array,
			idNames = ['decade', 'year', 'month', 'week', 'gnr'],	// 각 부분별 요소의 prefix id
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
		var SearchChart = Class(/**@lends MELON.PBPGN.SearchChart# */{
			name: 'SearchChart',
			$extend: MELON.PBPGN.View,
			selectors: {
				container: 'div.wrap_chart',		// 컨테이너
				panels: 'div.box_chic',				// 패널
				inputs: 'input[type=hidden]'		// 차트종류를 담고 있는 히든폼
			},
			events: {
				'click h4>a': 'onSelectedChartType',				// 차트종류를 선택했을 때, onSelectedChartType함수를 실행
				'click div.list_value input:radio': function(e) {	// 라디오버튼를 클릭했을 때, 소속된 패널에 on클래스 추가
					var me = this,
						$this = $(e.currentTarget),
						depth = $this.closest('div.box_chic').index() + 1;	// 뎁스 구하기

					$this.closest('div.box_chic.view').addClass('on');		// 소속된 패널에 on 클래스 추가
					$this.closest('li').siblings().removeClass('on').end().addClass('on');	// 해당 li에 on 클래스 추가

					me.onSelectedItem(depth);
				}
			},
			defaults: {
				searchUrl: 'searchchart_data.html',		// 검색 url
				timeout: 5000							// 최대 응답 시간
			},

			/**
			 * 생성자
			 */
			initialize: function(el, options) {
				var me = this;

				if(me.supr(el, options) === false) { return; }

				me.chartType = '';

				//start: 20140208 : mhover
				me.$el.find('.list_value').mouseHover('li');
				//end: 20140208 : mhover
			},

			/**
			 * 차트종류를 선택했을 때 실행
			 */
			onSelectedChartType: function(e) {
				e.preventDefault();

				var me = this,
					$this = $(e.currentTarget);

				me.chartType = $this.attr('data-value');		// 선택한 차트의 종류 : data-value=""에 설정되어 있어야 함(연대(YE), 월간(MO), 주간(WE)...중)
				me.$container.insertAfter($this.parent());		// 장차법에 의거하여, 하위요소는 무조건 현재요소의 밑에 위치해야 하므로, 클릭할 때마다 하위요소를 클릭한 요소의 밑으로 옮겨온다.
				me.$el.find('>h3').addClass('on');				// 패널의 헤더부분을 활성화(이미지 체크박스 부뷴)
				me.$panels.find('div.list_bass>ul').show();		// 하위패널들을 초기상태로 설정

				$this.parent().activeRow('on');					// 선택한 차트 링크를 활성화
				$this.next().prop('checked', true);				// 숨겨져있는 라디오버튼을 checked

				me._loadItems(0);								// 하위목록을 로딩
			},

			/**
			 * 챠트항목 선택시의 핸들러함수
			 * @private
			 */
			onSelectedItem: function(depth) {
				var me = this,
					chartType = me.chartType;

				if(depth > 4){		// 마지막 뎁스에서 선택했으면 selected이벤트를 발생시키고(이때, 선택한 항목들의 값을 json으로 말아서 넘겨준다.), 끝낸다.
                    me.trigger('selected', [me._makeParams(depth)]);
					return;
				}

				switch(chartType) {
				case 'WE':
				case 'MO':
				case 'YE':
				case 'AG':
					if(depth + array.indexOf(charts, chartType) >= 4){
						// 차트의 종류에 따라 관련된 패널만 활성화
						me.$panels.filter(':gt('+(depth - 1)+')').find('div.list_bass>ul').hide();
						depth = 4;
					}
				case 'NS':
				case 'MV':
				case 'AL':
					break;
				}

                if ( (chartType == 'AL' || chartType == 'MV' ) && depth === 4 ) {
					//앨범, 뮤비 차트는 하위 패널이 없다.
                    return;
                }
				// 서버로부터 하위단계의 데이타를 가져온다.
				me._loadItems(depth);
			},

			/**
			 * 선택된 라디오박스들을 바탕으로 json에 셋팅하여 반환(서버에 보낼 데이타)
			 */
            _makeParams: function(depth){
				var me = this,
					params = {
                        chartType   : me.chartType,		// 차트 종류
                        searchDepth : depth				// 뎁스
					};

				// 각 패널을 돌면서 선택된 라디오박스의 값을 json에 저장
				me.$panels.each(function(i) {
					var $pane = $(this),
						$item = $pane.find('div.list_value input:radio:checked');

					if($pane.hasClass('on')) {
                        params[parts[i]] = $item.val();
					}
				});

				// 날짜를 선택했으면, 날짜값에서 시작일과 종료일을 분리하여 json에 저장
                if(params.day) {
                    var wds = params.day.replace(/:/g, '').split('^');
                    params.startDay = wds[0];
                    params.endDay   = wds[1];
				}

				return params;
			},

			/**
			 * depth에 뿌려질 데이타를 서버에서 가져와서 표시
			 * @param {Integer} depth 뎁스
			 */
			_loadItems: function(depth) {
				// 이미 로딩 중일 땐 그냥 반환
				if(isLoading) { return; }
				isLoading = true;

				var me = this,
					url = me.options.searchUrl,
                    params = me._makeParams(depth),			// 이전 depth들에서 선택된 값들을 가져온다.
					dfd = new $.Deferred(); // 걍 써봄 ;;

				me._disabledSubPanels(depth);	// depth이후의 패널들을 비활성화

				if(me.options.getUrl){	// 옵션을 통해 url와 파라미터를 재조합 할 수 있다.
					// 예) $('#..').searchChart({
					//	getUrl: function(depth, params) {
					//		return {
					//			url: '...',
					//			params: { ... }
					//		}
					// });
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
					// 서버에서 데이타를 도으면, 데이타를 바탕으로 라디오박스를 뿌린다.
                    me._fillItems(depth, res.itemData);
					// 해당 패널을 활성화
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
                    //items = data.listTable['itemList'],
                    items = data,
					html = '';

				var postFix  = "",
					fieldNm  = "ITEMNM",
					fieldVal = "ITEMVAL";

				switch(depth) {
					case 0 : postFix = "년대"; fieldNm = "SYEAR";   fieldVal = "SYEAR"; break;
					case 1 : postFix = "년";   fieldNm = "SYEAR";   fieldVal = "SYEAR"; break;
					case 2 : postFix = "월";   fieldNm = "SMON";    fieldVal = "SMON";  break;
					case 4 : postFix = "";     fieldNm = "CHARTNM"; fieldVal = "CHARTCODE";  break;
				}

				//me._disabledSubPanels(depth);
				if(items && items.length > 0) {
					for(var i = 0, item; item = items[i++]; ) {
						html += ['<li><span>',
                                    '<input type="radio" name="'+parts[depth]+'" id="'+idNames[depth]+'_'+i+'" class="input_radio" value="'+ item[fieldVal] +'" caption ="'+ item[fieldNm] + postFix + '" />',
                                    '<label for="'+idNames[depth]+'_'+i+'">'+item[fieldNm] + postFix+'</label>',
								'</span></li>'].join('');
					}
				}

				me.$panels.eq(depth).find('div.list_value>ul').html(html);
			},

            getValue: function(depth) {
                return this._makeParams(depth);
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

	WEBSVC.define('PBPGN.TimeSlider', function () {

		/**
		 * 실시간차트의 타임슬라이더
		 * @class MELON.PBPGN.TimeSlider
		 */
		var TimeSlider = Class(/** @lends MELON.PBPGN.TimeSlider# */{
			name: 'TimeSlider',
			$extend: MELON.PBPGN.View,
			defaults: {
				orientation: 'horizontal',			// 방향(가로)
				duration: 300,						// 슬라이딩 duration
				easing: 'ease-in-out',				// 이징
				animate: true,						// 애니메이트 사용여부
				render: false						// true: 동적으로 그릴 것인가(false: 서버에서 뿌릴 것인가)
			},
			selectors: {
				'sliderBox': '.d_slider_box',		// 컨테이너
				'panel': '.d_panel',				// 움직이는 박스
				'prevArrow': '.d_prev',				// 왼쪽 버튼
				'nextArrow': '.d_next'				// 오른쪽 버튼
			},

			initialize: function (el, options) {
				var me = this;

				if(me.supr(el, options) === false) { me.destroy(); return; }

				// 마지막 시간
				me.lastTime = me.options.lastTime || me.$el.attr('data-last-time') || dateUtil.format(new Date(), 'hh:00');
				// 선택된 시간
				me._activeTime = me.options.activeTime || me.$el.attr('data-active-time') || me.lastTime; // 131104_수정: onTime -> activeTime
				// start: 131104_수정
				// 통계자료가 있는 시간(01:00;02:00;03:00...)
                me._enableTimes = me.options.enableTimes || me.$el.attr('data-disable-times') || "";
				// end: 131104_수정

				me._initTimeSlider();
				// 옵션으로 받은 시간을 활성화
				me.active(me._activeTime); // 131104_수정
			},

			/**
			 * 기본 작업
			 * @private
			 */
			_initTimeSlider: function() {
				var me = this;

				me.$panel.css('width', me.totalWidth);	//

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

			/**
			 * time에 해당하는 요소를 활성화
			 * @param {String} time ex) 13:00
			 */
			active: function(time) {
				var me = this,
					left = 0,
					centerPos = 0,
					t = time.match(/^\d+/);

				if(t) {
					me._activeTime = time;		// 131104_수정
					me.options.render && me.render();	// 스크립트에서 그린것인가

					me.$items = me.$panel.find('>li');	// 시간 아이템들
					me.itemCount = me.$items.length;	// 갯수
					me.moveWidth = me.$sliderBox.width();		// 한번에 움직일 width
					me.itemWidth = me.$items.eq(0).width();		// 아이템 하나의 width
					me.totalWidth = me.itemWidth * me.itemCount;	// 총 너비
					me.limitLeft =  me.moveWidth - me.totalWidth;	// 움직일 수 있는 최대 left값

					centerPos = Math.floor((me.moveWidth / me.itemWidth) / 2);
					t = parseInt(t[0], 10); // 13:00 에서 13을 추출

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
					// 왼쪽 방향
					currentLeft = Math.min(0, currentLeft + me.moveWidth);
				} else if(dir === 'next'){
					// 오른쪽 방향
					currentLeft = Math.max(me.limitLeft, currentLeft - me.moveWidth);
				}
				// 애니메이트
				me.$panel.stop().animate({
					'left': currentLeft
				}, {
					'easing': 'easeInOutCubic',
					'duration': 600
				});
				// 왼쪽, 오른쪽 버튼의 토글링
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
			// 스크립트로 렌더링
			render: function() {
				// start: 131104_수정
				var me = this,
					nowHour = parseInt(me.lastTime.split(':')[0], 10),
					html = '',
					h, t, isOn;

				for(var i = 0; i < 24; i++ ){
					h = numberUtil.zeroPad(i), t = h+':00';
					isOn = (t === me._activeTime);
					if( !isOn && i <= nowHour){
						// 이전 시간이지만, disable 하고자 하는 시간인지 여부
                        if(me._enableTimes.indexOf(h) >= 0) {
							html += '<li data-time="'+t+'"><a href="#" title="'+h+'시 실시간 급상승 TOP100 페이지로 이동">'+t+'</a></li>';
						} else {
							html += '<li data-time="'+t+'"><span>'+t+'</span></li>';
						}
					} else {
						html += '<li data-time="'+t+'"'+(isOn?' class="on"' : "")+'><span>'+t+'</span></li>';
					}
				}
				// end: 131104_수정

				me.$panel.html(html);
			}
		});

		WEBSVC.bindjQuery(TimeSlider, 'timeSlider');

		return TimeSlider;
	});

// start: 131122_수정
	/**
	 * 인기배틀의 인기상 후보 타임라인 모듈
	 * @class MELON.PBPGN.Timeline
	 */
	var Timeline = Class(/** @lends MELON.PBPGN.Timeline# */{
		$extend: PBPGN.View,
		name: 'timeline',
		defaults: {
			arrowHeight: 48, // 40 + 8	// 아이콘 크기
			boxTopMargin: 24	// 박스간 간격
		},
		/**
		 * 생성자
		 */
		initialize: function(el, options) {
			var me = this;

			if(me.supr(el, options) === false) { return; }

			me.measure = {
				left: 0,
				center: 0,
				right: 0
			};

			me.update();
		},
		/**
		 * 자세한 설명은 melonweb_artist.js의 timeline 모듈 참조
		 */
		update: function(start) {
			start = start || 0;

			var me = this,
				$items = me.$el.find('>ul>li').filter(function(i){ return i >= start; }),		// 이후에 추가된 항목
				items = [],
				measure = me.measure,
				ARROW_HEIGHT = me.options.arrowHeight,
				BOX_TOP_MARGIN = me.options.boxTopMargin;

			me.$el.css('visibility', 'hidden').show();	// 정확한 사이즈계산을 위해 visibility:hidden, display:block로 변경
			if(start === 0) {
				measure.left = measure.center = measure.right = 0;
			}


			$items.each(function(i){
				var $li = $(this),
					boxHeight = $li.show().height(),
					align, targetTopOffset, arrowTopOffset;

				align = (measure.left <= measure.right) ? 'left' : 'right';
				targetTopOffset = measure[align];
				arrowTopOffset = Math.max(measure.center - targetTopOffset, 0);

				items.push({
					$target: $li.hide(),
					css: align,
					top: targetTopOffset,
					arrowTop: arrowTopOffset
				});

				measure[align] += boxHeight + BOX_TOP_MARGIN;
				measure.center = targetTopOffset + arrowTopOffset + ARROW_HEIGHT;
			});

			// 위에서 계산된 위치정보를 바탕으로 요소를 배치시킨다.
			$.each(items, function(i, item){
				item.$target.removeClass('lc_left lc_right')
					.addClass('lc_'+item.css)
					.css({'top': item.top})
					.fadeIn('slow')
					.find('div.wrap_icon').css({'top': item.arrowTop});
			});

			// 컨텐이너의 크기를 최종적으로 배치된 높이에 맞게 변경
			me.$el.css({'visibility': '', height: Math.max(measure.left, measure.right)});
			me.triggerHandler('completed');
		}
	});

	WEBSVC.bindjQuery(Timeline, 'timeline');

	/**
	 * 롤링카운터 모듈
	 * @class MELON.PBPGN.RollingCounter
	 */
	var RollingCounter = Class(/** @lends MELON.PBPGN.RollingCounter# */{
		name: 'RollingCounter',
		$extend: MELON.PBPGN.View,
		$statics: {
			ON_ROLLING_END: 'rollingcounterend'
		},
		defaults: {
			height: 75,		// 높이
			duration: 1000,	// 애니메이션 duration
			delay: 300,		// 자릿수간에 애니메이션 간격
			easing: 'easeInOutQuart'
		},
		initialize: function(el, options) {
			var me = this;

			if(me.supr(el, options) === false) { return; }

			me._$items = [].reverse.call(me.$el.find('>span'));		// 숫자에 해당하는 각 요소를 찾아서 거꾸로 정렬시켜서 가지고 있는다.(일단위부터 애니메이션을 시작)
			me._numbers = (me.$el.attr('data-value') || parseInt(me.$el.text() || 0))+"";		// 뿌려질 숫자값

			me.start();
		},
		// 시작
		start: function(){
			var me = this,
				opts = me.options,
				numbers = [].reverse.call(me._numbers.split('')).join(''), // 숫자를 거꾸로 정렬
				cssUtil = MELON.WEBSVC.css,
				ease = opts.easing,
				len = numbers.length;

			me._$items.attr('style', 'background-position:0 75px').stop(true).each(function(i){
				if(i >= len){ return false; }

				var $el = $(this),
					n = parseInt(numbers.substr(i, 1), 10),		// i번째 숫자를 가져옴
					y = ((n * opts.height) + 750);				// n에 해당하는 top를 계산

				$el.data('number', n);		// n를 보관(동일한 숫자일 때 애니메이트를 안하기 위함)
				$el.delay(i * opts.delay).queue(function(){
					// ie9, firefox에서 backgroundPosition에 대한 animate기능이 문제가 있어서 트릭으로 구현
					$el.prop({ypos: -y}).stop().animate({ypos: 0}, {
						duration: opts.duration,
						easing: opts.easing,
						step: function(now) {
							$el.css('background-position', '0 '+(y + now + 75)+'px');
						}
					});
					$el.dequeue();	// 큐를 제거
				});
				$el.children().html(n);
			});
		},
		// 업데이트
		// @param {Interger} newNumber 새로운 숫자값
		// $('..').rollingCounter('update', 1234); 로 호출하면 숫자가 변경됨
		update: function(newNumber) {
			var me = this;

			me.$el.attr('data-value', newNumber)
			me._numbers = newNumber+"";
			me._$items.attr('style', 'background-position:0 75px').children().html(0);
			me.start();
		}
	});
	WEBSVC.bindjQuery(RollingCounter, 'rollingCounter');


	// 시간 타이머 140401_수정 string으로 변경
	var TimeCountdown = Class({
		name: 'TimeCountdown',
		$extend: MELON.PBPGN.View,
		$statics: {
			ON_TIMER_END: 'timecountdownend',
            ON_TIMER_SOON: 'timecountdownsoon' //140401_마감임박추가
		},
		defaults: {
			height: 75,
			duration: 400,
			easing: 'easeInOutQuart',
			serverTime: 0,
			limits: [9, 5, 9, 5, 9, 9]	 // 각 요소별 최대수(초단위, 십초단위, 분단위, 십분단위, 시단위, 열시단위]
		},
		initialize: function(el, options) {
			var me = this;

			if(me.supr(el, options) === false) { me.destroy(); return; }

			me._time = WEBSVC.date.parseDate(me.options.time);
			me._timeGap = (+new Date) - me.options.serverTime; // 서버와 로컬의 시간차를 가지고 타이머를 시작한다.(보다 정확한 타이밍을 위해)
			me._$items = [].reverse.call(me.$el.find('>span:even > span')); // 숫자 노드를 찾아서 거꾸로 정렬

			me._init();
			me._timer();
		},

		// 초기 시간을 셋팅
		_init: function() {
			var me = this,
				time = me._time.getTime() - (+new Date) + me._timeGap;

			if( time < 0 ) { return; }

			var numbers = me._convertReverseTime(time);
			me._$items.data('number', 0).children().html(00); // 초기화(0위치로 설정)
			me._$items.each(function(i) {
				if(i >= numbers.length){ return false; } // 자릿수까지 왔으면 멈춘다.(더이상의 처리는 무의미하므로...)

				var $el = me._$items.eq(i),
					n = numbers.substr(i, 1);	// 자릿수에 해당하는 수를 추출

				if( n == $el.data('number') ) { return; }	// 현재 표시된 수와 동일하면 무시
				// n에 해당하는 백그라운드 위치를 지정
                $el.data('number', n).html(n)
			});
		},
		// 타이머 실행
		_timer: function() {
			var me = this,
				time = me._time.getTime();
            var setTimerID = null;
			// 완료

			if( time < 0 ) { clearTimeout(setTimerID); me.$el.triggerHandler(TimeCountdown.ON_TIMER_END); clearInterval(me.interval);  return; }
            var soonEnd = (time - (+new Date) + me._timeGap)/1000/3600;
            if( soonEnd > 0 && soonEnd < 24) {//140402_수정
                setTimerID = setTimeout(function(){ me.$el.triggerHandler(TimeCountdown.ON_TIMER_SOON)},0);
            } //남은시간이 24시간 미만일경우 트리거 발생

			// interval은 시간이 지날수록 오차가 커지므로, 로컬시간+서버시간과의 갭을 기준으로 잔여시간 계산

			me.interval = setInterval(function() {
				var now = time - (+new Date) + me._timeGap;
				if( now <= 0) {
					clearInterval(me.interval);
					me.$el.triggerHandler(TimeCountdown.ON_TIMER_END);
				}
				else {
					me._update(now);
				}
			}, 200);
		},
		// 밀리초인 amount를 시분초로 변환한 후, 역으로 정렬
		_convertReverseTime: function(amount) {
			var zeroPad = WEBSVC.number.zeroPad,
				days = 0,
				hours = 0,
				mins = 0,
				secs = 0;

			amount = amount / 1000;
			days = Math.floor(amount / 86400), amount = amount % 86400;
			hours = Math.floor(amount / 3600), amount = amount % 3600;
			mins = Math.floor(amount / 60), amount = amount % 60;
			secs = Math.floor(amount);

			return [].reverse.call((zeroPad(hours+(24*days))+zeroPad(mins)+zeroPad(secs)).split('')).join('');
		},
			// 애니메이트 수행
		_update: function(time) {
			var me = this,
				opts = me.options,
				limits = opts.limits,
				numbers = me._convertReverseTime(time);

			me._$items.each(function(i){
				// 주어진 값의 자릿수까지 왔으면 멈춘다.
				if(i >= numbers.length){ return false; }

				var $el = me._$items.eq(i), no = $el.data('number'),
					n = numbers.substr(i, 1), y; // i번째 숫자를 가져옴

				if( n == no ) { return; }	 // 현재 표시된 숫자와 동일하면 무시함
				$el.data('number', n).html(n)
				y = (n + 1) * opts.height;
			});
		}
	});
	WEBSVC.bindjQuery(TimeCountdown, 'timeCountdown');
// end: 131122_수정

})(jQuery, MELON.WEBSVC, MELON.PBPGN);

// start: 131114_수정
$(function() {
	// 달력이 표시될 때 zindex문제땜에 .summ_prid에 on클래스를 추가해준다.(닫을 땐 제거)
	$('div.summ_prid').on('showcalendar hidecalendar', function(e){
		if(e.type === 'showcalendar'){
			$(this).addClass('on');
		} else {
			$(this).removeClass('on');
		}
	});

});
// end: 131114_수정
