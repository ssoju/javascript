/*!
 * @author 김승일
 * @email comahead@vi-nyl.com
 * @description 멜론 프레임웍
 */
;(function($, WEBSVC, PBPGN, undefined) {
	var $doc = $(document),
		Class = WEBSVC.Class,
		View = PBPGN.View,
		stringUtil = WEBSVC.string,
		isTouch = !!window.ontouchstart,
		strUtil = WEBSVC.string;



	// 아티스트탭 > 상단 아티스트 리스트 담당클래스
	var PlayArtistList = Class({
		$extend: View,
		name: 'PlayArtistList',
		selectors: {
			playArtistIntro: 'div.play_box>p.sr',		// 안내문구
			playArtistList: 'div.play_box div.atist_unit_cont',	// 아티스트 리스트
			similarArtistList: 'div.play_box>div.sim_atist>p',	// 유사 아티스트 리스트
			btnPlay: 'div.play_box button.btn_play'	, // 재생 버튼
			settingLayer: 'div.fl_right>div.l_popup'	// 설정레이어
		},
		events: {
			// 추가된 아티스트항목에서 삭제를 눌렀을 경우
			'click div.play_box span.atist>button': function(e) {//140429_atist_cntt
				e.preventDefault();
				e.stopPropagation();

				var me = this,
					$btn = $(e.currentTarget),
					artistId = $btn.attr('data-artist-id');

				if( !artistId ){
					alert('아티스트 번호가 없습니다.');
					return;
				}

				me.trigger('requestRemoveArtist', [artistId]);
			},
			// 더보기/접기
			'click div.atist_unit button.btn_arrow_d, div.atist_unit button.btn_arrow_u': function(e){
				var me = this,
					$btn = $(e.currentTarget),
					isDown = $btn.hasClass('btn_arrow_d');

				me.$similarArtistList.parent().toggle(!isDown);

				if(isDown){
					$btn.attr('title', '아티스트 접기').html('접기').replaceClass('btn_arrow_d', 'btn_arrow_u')
						.closest('div.atist_unit').addClass('on').closest('div.play_box').addClass('on');
				} else {
					if($('#insert_atist').is(":checked")){
						$('div.sim_atist').hide();
					}
					$btn.attr('title', '아티스트 더보기').html('더보기').replaceClass('btn_arrow_u', 'btn_arrow_d')
						.closest('div.atist_unit').removeClass('on').closest('div.play_box').removeClass('on');
				}
			},
			// 유사아티스트 더보기/접기
			'click div.sim_atist button.btn_arrow_d02, div.sim_atist button.btn_arrow_u': function(e){
				var me = this,
					$btn = $(e.currentTarget),
					isDown = $btn.hasClass('btn_arrow_d02');

				me.$playArtistList.parent().toggle(!isDown);

				if(isDown){
					$btn.attr('title','유사 아티스트 접기').html('접기').replaceClass('btn_arrow_d02', 'btn_arrow_u')
						.closest('div.sim_atist').addClass('on');
					$('#simArtsitMoreBtn').attr('data-isOpen','Y');
				} else {
					$btn.attr('title','유사 아티스트 더보기').html('더보기').replaceClass('btn_arrow_u', 'btn_arrow_d02')
						.closest('div.sim_atist').removeClass('on');
					$('#simArtsitMoreBtn').attr('data-isOpen','N');
				}
			},

			// 설정 or 초기화
			'click div.fl_right>a': function(e) {
				e.preventDefault();

				var me = this,
					$btn = $(e.currentTarget),
					index = $btn.index();

				if(index === 0) { // 초기화
					me.trigger('btnResetClicked');
				} else {	// 설정레이어 팝업
					if(me.$settingLayer.is(':visible')) {
						me.$settingLayer.hideLayer();
					} else {
						/* 140616_삭제
						if(me.isIncludeSimilar) {
							$('#sim_atist').prop('checked', true);
						} else {
							$('#insert_atist').prop('checked', true);
						}
						*/
						me.$settingLayer.showLayer();
					}
				}
			}
		},
		initialize: function(el, options) {
			var me = this;

			if(me.supr(el, options) === false) { return; }

			me.init();

			// 아티스트가 추가되거나 삭제될 때, 유사아티스트 설정 변경시, 더보기 토글링처리
			me.on('addedartist removedartist changedIncludeSimilar', function(e){
				var overHeight = false,
				$items = me.$playArtistList.find('>span.atist_cntt');//140429_atist_cntt 마크업변경

				if(e.type === 'removedartist' && $items.length === 0) {
					me.init();
					return;
				}

				me._showMoreButtons();
			});

			// 호버 됐을 때 마지막항목의 너비가 넓어지면서 밑으로 내려가는 현상이 발생.
			// 이을 방지하기 위해 호버시에 부모노드의 길이를 늘려준다.
			me.on('mouseenter mouseleave', 'span.atist', function(e){//140429_atist_cntt
				var $span = $(this),
					$parent, isExtended = false,
					oriContWidth = 0;

				$parent = $span.closest('div.atist_unit_cont');
				isExtended = $parent.closest('div.play_box').hasClass('on');

				switch(e.type) {
				case 'mouseenter':
					oriContWidth = $parent.css('width', '').width();

					$span.addClass('over');
					$parent.css('width', oriContWidth + 21);
					break;
				case 'mouseleave':
					$span.removeClass('over');
					$parent.css('width', '');
					break;
				}
			});

			// 설정레이어에서 확인 눌렸을 때
			me.$settingLayer.on('click', 'button.btn_emphs_small', function(e) {
				e.preventDefault();
				//
				if($('#simArtsitMoreBtn').attr('data-isOpen') == 'Y'){
					$('.btn_arrow_u').trigger('click');
				}
				//
				var isIncludeSimilar = $('#sim_atist').prop('checked');
				me.trigger('requestChangeIncludeSimilar', [isIncludeSimilar]);
				me.$settingLayer.hideLayer();
			});
		},

		// 초기화
		init: function(){
			var me = this;

			me.$playArtistList.closest('div.atist_unit.on').removeClass('on');
			me.$playArtistList.closest('div.play_box.on').removeClass('on');
			me.$playArtistList.parent().find('>button').replaceClass('btn_arrow_u', 'btn_arrow_d').hide();
			me.$similarArtistList.parent().find('>button').replaceClass('btn_arrow_u', 'btn_arrow_d02').hide();
			me.isIncludeSimilar = true;
			me.$settingLayer.hideLayer();

			me.$playArtistIntro.show();
			me.$playArtistList.parent().hide();
			me.$playArtistList.find('span.atist_cntt').remove();//140429_atist_cntt 마크업변경

			me.$similarArtistList.parent().removeClass('on').hide();
			me.$similarArtistList.find('span').remove();

			me.$btnPlay.hide();

			me.trigger('artistlistinited');
		},

		// 표시영역을 초과하였을 경우 더보기 버튼 표시
		_showMoreButtons: function() {
			var me = this,
				overHeight = false;

			if(!me.$playArtistList.parent().hasClass('on')) {
				me.$playArtistList.find('>span.atist_cntt:last').each(function(){//140429_atist_cntt 마크업변경
					//if($(this).position().left+$(this).width() > 425) {// 둘째라인인가.. 140429_atist_cntt 마크업변경 관련 둘째라인 체크 기준 변경 2차수정
					if($('.atist_unit_cont').width() >= 400) {// 둘째라인인가.. 140429_atist_cntt 마크업변경 관련 둘째라인 체크 기준 변경 2차수정
						overHeight = true;
						return false;
					}
				});
				// 둘째줄에 표시되는 항목이 있으면 더보기 표시
				if(overHeight) {
					me.$playArtistList.parent().find('>button').show();
				} else {
					me.$playArtistList.parent().find('>button').hide();
				}
			}

			if(!me.$similarArtistList.parent().hasClass('on')) {
				overHeight = false;
				// 말줄임이 됐는지 여부를 알기 위해 아래와 같이 처리함
				me.$similarArtistList.clone().css({'width': 1000, 'visibility': 'hidden'}).insertAfter(me.$similarArtistList).each(function() {
					var $last = $(this).find('>span:visible:last');
					if($last.length === 0) { return; }
					if($last.position().left + $last.width() > 400) {
						overHeight = true;
						return false;
					}
				}).remove();
				if(overHeight) {
					me.$similarArtistList.parent().find('>button').show();
				} else {
					me.$similarArtistList.parent().find('>button').hide();
				}
			}
		},

		// 추가된 아티스트 갯수
		getArtistCount: function() {
			var me = this;
			return me.$playArtistList.find('>span.atist_cntt').length;//140429_atist_cntt 마크업변경
		},

		// 추가된 아티스트 번호 배열
		getArtistList: function() {
			var me = this,
				artists = [];

			// 구성 아티스트
			me.$playArtistList.find('>span.atist_cntt').each(function(){//140429_atist_cntt 마크업변경
				artists.push( $(this).attr('data-artist-id') );
			});

			return artists;
		},

		// 유사아티스트 리스트
		getSimilarList: function() {
			var me = this,
				similars = [];

			// [유사아티스트 포함듣기] 모드가 아니면 빈 []를 반환
			if(!me.isIncludeSimilar) { return similars; }

			// 유사아티스트
			me.$similarArtistList.find('>span').each(function(){
				similars = similars.concat( $(this).attr('data-similar-nos').split(',') );
			});

			return similars;
		},

		// 아티스트 추가
		addArtist: function(artistId, name, similarArtists) {
			var me = this,
				$addedItems = me.$playArtistList.find('>span.atist_cntt'),//140429_atist_cntt 마크업변경
				$item;

			// ie7 fix :(
			$('div.atist_unit_cont').css('width', '');

			var firstChild = $('div.atist_unit_cont').children().length ? "class='atist_cntt'" : "class='first_child atist_cntt'"; //140212_추가

			// 안내 문구 숨기기
			me.$playArtistIntro.hide();

			// 구성 아티스트 추가 ////////////////////////////////////////////////////////////////////////////
            //140428_마크업 변경 적용
			$item = $(['<span '+firstChild+' data-artist-id="'+artistId+'"><span class="plus">+</span><span class="atist">', //140212_수정
						'<span class="bg"><strong><span class="ellipsis">'+strUtil.cutByByte(name, 30, '...')+'</span></strong></span>',
						'<button type="button" title="아티스트 '+name+' 삭제 버튼" data-artist-id="'+artistId+'">삭제</button></span></span>'].join(''));

			// 비활성화
			$item.find('strong').addClass('chic');

			if(WEBSVC.browser.isIE7){ // 이넘의 IE :(
				$addedItems.css('display', 'none');
				me.$playArtistList.append($item).parent().show();
				$item.css('min-width', $item.width());
				$addedItems.css('display', '');
			} else {
				me.$playArtistList.append($item).parent().show();
			}
			///////////////////////////////////////////////////////////////////////////////////////////////////

			// 유사 아티스트 추가 ///////////////////////////////////////////////////////////////////////////
			var $similars = null, nos = [], names = [], simCount = me.$similarArtistList.find('>span:first').length;
			if(similarArtists && similarArtists.length > 0) {
				$.each(similarArtists, function(i, item) {
					nos.push( item.artistId );
					names.push( item.artistName );
				});
				$similars = $('<span data-artist-id="'+ artistId+'" data-similar-nos="'+nos.join(',')+'">'+(simCount > 0 ? ' <span class="simPlus">+</span> ' : '')+'<span class="simText">'+names.join(', ')+'</span></span>');
				$similars.addClass('chic');
				me.$similarArtistList.append($similars);
			}
			me.$similarArtistList.parent()[ me.isIncludeSimilar ? 'show' : 'hide' ]();
			///////////////////////////////////////////////////////////////////////////////////////////////////

			// 유사 아티스트 말줄임 처리
			me.adjustSimilarArtistsSize();

			me.trigger('addedartist', [artistId, name]);
		},

		// 유사 아티스트 말줄임 처리
		adjustSimilarArtistsSize: function() {
			// 컨테이너 복제본을 만들어 on 상태로 작업한다.
			var $simAtist = $('.sim_atist');
			var $simAtistClone = $simAtist.clone();
			$simAtistClone.css({'visibility': 'hidden'}).addClass('on').insertAfter($simAtist).each(function() {
				var $p = $simAtistClone.find('> p');

				// 모든 유사 아티스트 초기화
				$p.find('.simText').show();
				$p.find('.simTextTrunc').remove();
				$p.find('.simEllipsis').remove();
				$p.find('> span').show();

				// 마지막 유사 아티스트부터 시작
				var $span = $p.find('> span:last-child');
				if ($span.length > 0) {
					// 2줄 이하이고, 더보기 버튼을 가리지 않을 때까지 반복한다.
					var loop = 0;
					while (loop < 1000 && ($p.height() > 50 || ($span.position().top > 30 && $span.position().left + $span.width() >= $p.width()))) {
						loop++;

						// 원본 텍스트 엘리먼트
						var $simText = $span.find('.simText');

						// 줄여진 텍스트 엘리먼트
						var $simTextTrunc = $span.find('.simTextTrunc');
						if ($simTextTrunc.length == 0) {
							$simTextTrunc = $('<span class="simTextTrunc"></span>').html($simText.hide().html()).appendTo($span);
						}

						// 말줄임표(...) 엘리먼트
						var $simEllipsis = $span.find('.simEllipsis');
						if ($simEllipsis.length == 0) {
							$simEllipsis = $('<span class="simEllipsis" style="margin-right:10px;">...</span>').appendTo($span);
						}

						// 현재 유사 아티스트의 글자가 모두 없어지면, 이를 감추고, 이전 유사 아티스트로 간다.
						var text = $simTextTrunc.html();
						if (text <= 1) {
							$simText.show();
							$simTextTrunc.remove();
							$simEllipsis.remove();
							$span.hide();
							$span = $span.prev();
							continue;
						}

						// 현재 유사 아티스트에서 한글자를 줄인다.
						$simTextTrunc.html(text.substring(0,text.length-1));
					}
				}

				$simAtist.find('> p').html($p.html());
			}).remove();
		},

		// 유사아티스트 포함 여부
		setIncludeSimilar: function(b) {
			var me = this;

			me.isIncludeSimilar = b
			if(me.isIncludeSimilar && me.$similarArtistList.find('span').length){
				me.$similarArtistList.parent().show();
			} else {
				me.$similarArtistList.parent().hide();
			}

			me.trigger('changedIncludeSimilar', [me.isIncludeSimilar]);
		},

		// 아티스트 전부 활성화
		activeArtists: function(){
			var me = this;

			me.$playArtistList.find('span[data-artist-id] strong.chic').removeClass('chic');//140429_atist_cntt
		},

		// 유사 아티스트 전부 활성화
		activeSimilarArtists: function(){
			var me = this;

			me.$similarArtistList.find('span.chic').removeClass('chic');
		},

		// 이미 추가된 아티스트인지 체크
		existsArtist: function(artistId) {
			var me = this;
			return me.$playArtistList.find('span[data-artist-id='+artistId+']').length > 0; //140429_atist_cntt 마크업변경관련
		},

		// 최종적으로 존재하는 아티스트들의 번호를 반환
		getValue: function() {
			var me = this,
				artists = me.getArtistList(), // 구성 아티스트
				similars = me.getSimilarList(); // 유사 아티스트


			return {
				'artists': artists,
				'similars': similars
			};
		}
	});

	// 연대 슬라이더
	var EraSlider = Class({
		$extend: View,
		name: 'EraSlider',
		defaults: {
			width: 576,	// 총너비
			distance: 78,	// 눈금당 간격
			items: [1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020],
			startYear: 2010,
			endYear: 2020
		},
		selectors: {
			btnMin:'div.yearlk_bar.last',
			btnMax: 'div.yearlk_bar.start',
			sliderBar: 'div.yearlk_bar.bar_year'
		},
		initialize: function(el, options) {
			var me = this;

			if(me.supr(el, options) === false) { return; }

			me.$btnMin.css('zIndex', 101);
			me.$btnMax.css('zIndex', 100);

			me.moveX = me.downX = me.currX = 0;
			me.isMouseDown = false;
			me.$activeBtn = me.$lastMovedBtn = null;
			me.currMinLeft = parseInt(me.$btnMin.css('width'), 10);
			me.currMaxLeft = parseInt(me.$btnMax.css('width'), 10);
			me.maxWidth = me.options.width;

			// 년대를 클릭할 때 해당 위치로 이동
			me.on('click', 'div.yearlk_text>a', function(e) {
				e.preventDefault();

				var left = $(this).index() * me.options.distance,
					diffMin = Math.abs(me.currMinLeft - left - 30),
					diffMax = Math.abs(me.currMaxLeft - left - 30);

				if(me.currMinLeft > left) {
					me.$activeBtn = me.$btnMin;
				} else if(me.currMaxLeft < left){
					me.$activeBtn = me.$btnMax;
				} else if(diffMin > diffMax) {
					me.$activeBtn = me.$btnMax;
				} else if(diffMin < diffMax) {
					me.$activeBtn = me.$btnMin;
				} else if(me.$lastMovedBtn) {
					me.$activeBtn = me.$lastMovedBtn;
				} else {
					return;
				}

				me._move(left);
				me.$activeBtn = null;
			});

			// 드래그 시작
			me.on('mousedown touchstart', 'div.last>div.sel, div.start>div.sel', function(e) {
				e.preventDefault();
				if(isTouch){
					e.stopPropagation();
				}

				me.isMouseDown = true;
				me.currX = parseInt($(this).parent().css('width'), 10);
				me.downX = me._getX(e);
				me.$activeBtn = $(this).parent();

				return false;
			}).on('keydown', 'div.yearlk_bar div.sel', function(e){
				//좌우 버튼
				var $btn = $(this).parent(),
					left = parseInt($btn.css('width'), 10) - 30;

				switch(e.keyCode){
				case 37: // left
					left -= me.options.distance;
					break;
				case 39:	// right
					left += me.options.distance;
					break;
				}
				me.$activeBtn = $btn;
				me._move(left);
				me.$activeBtn = null;
			});

			$doc.on('mouseup touchend mousemove touchmove', function(e){
				if(!me.isMouseDown){ return; }

				switch(e.type){
				case 'mouseup':
				case 'touchend':
					me.isMouseDown = false;
					me.moveX = 0;
					// 드래그가 끝났을 때, 해당 위치에서 가장 가까운 눈금으로 이동
					me._fixPos();

					me.$activeBtn = null;

					me.trigger('slidechanged', [me.getValue()]);
					break;
				case 'mousemove':
				case 'touchmove':
					me.moveX = me._getX(e);
					me._move(me.currX - (me.downX - me.moveX) - 30);

					e.preventDefault();
					break
				}
			});

			me.init();
		},

		init: function() {
			var me = this;

			me.moveByYear(me.options.startYear, me.options.endYear);
		},

		_getX: function(e) {
			if(isTouch && e.originalEvent.touches){
				e = e.originalEvent.touches[0];
			}
			return e.pageX;
		},

		_move: function(left) {
			var me = this,
				distance = me.options.distance;

			if(!me.$activeBtn){ return; }

			left += 30;
			var ev = $.Event('changedyear');

			if(me.$activeBtn.hasClass('last')){
				if(left >= me.currMaxLeft - distance){
					left = me.currMaxLeft - distance;
				} else if(left < 30){
					left = 30;
				}

				me.trigger(ev, ['start', me.options.items[ Math.round(left / distance) ]]);
				if(ev.isDefaultPrevented()){ return; }

				me.currMinLeft = left;
			} else {
				if(left < me.currMinLeft + distance){
					left = me.currMinLeft + distance;
				} else if(left > me.maxWidth){
					left = me.maxWidth;
				}

				me.trigger(ev, ['end', me.options.items[ Math.round(left / distance) ]]);
				if(ev.isDefaultPrevented()){ return; }

				me.currMaxLeft = left;
			}

			me.$lastMovedBtn = me.$activeBtn.css('width', left);
		},

		moveByYear: function(startYear, endYear){
			var me = this,
				distance = me.options.distance,
				oldStartIdx = Math.round(me.currMinLeft / distance),
				oldEndIdx = Math.round(me.currMaxLeft / distance),
				startIdx = WEBSVC.array.indexOf(me.options.items, startYear),
				endIdx = WEBSVC.array.indexOf(me.options.items, endYear);

			function moveStartYear() {
				if(startIdx >= 0) {
					me.$activeBtn = me.$btnMin;
					me._move(startIdx * distance);
				}
			}

			function moveEndYear() {
				if(endIdx > 0) {
					me.$activeBtn = me.$btnMax;
					me._move(endIdx * distance);
				}
			}

			if (oldEndIdx > startIdx) {
				moveStartYear();
				moveEndYear();
			} else {
				moveEndYear();
				moveStartYear();
			}

			me.$activeBtn = null;
		},

		setYears: function(startYear, endYear){
			this.moveByYear(startYear, endYear);
		},

		_fixPos: function() {
			var me = this,
				distance = me.options.distance;
			if(!me.$activeBtn){ return; }

			var left = parseInt(me.$activeBtn.css('width'), 10) - 30;

			left = (Math.round(left / distance) * distance);
			me._move(left);
		},

		getValue: function() {
			var me = this,
				distance = me.options.distance,
				items = me.options.items,
				startIndex = Math.round(me.currMinLeft / distance),
				endIndex = Math.round(me.currMaxLeft / distance),
				startTitle = startIndex === 0 ? items[1] + ' 이전' : items[ startIndex ],
				endTitle = endIndex === items.length - 1 ? items[ items.length - 2] + ' 이후' : items[ endIndex ],
				value = [];

			for(var i = startIndex; i <= endIndex; i++) {
				value.push(items[i]);
			}

			return {
				'startYear': startTitle,
				'endYear': endTitle,
				'value': value.join('|')
			}
		}
	});

	// 장르 슬라이더
	var GenreSlider = Class({
		$extend: View,
		name: 'GenreSlider',

		initialize: function(el, options) {
			var me = this;

			if(me.supr(el, options) === false) { return false; }

			// 1단계 장르 선택시 2단계 장르 토글링
			me.on('click', 'div.genre_depth1 a', function(e) {
				e.preventDefault();
				var $this = $(this),
					prevCount = 0;
				$this.closest('div.of_h').find('li.on').removeClass('on');
				$this.parent().addClass('on');
				$this.closest('ul').prevAll('ul').each(function(){
					prevCount += $(this).find('li').length;
				});
				me.$el.find('>div.genre_depth2').hide().eq( prevCount + $this.parent().index() ).show();
			});

			//2depth 장르 클릭시
			me.on('click', 'div.genre_depth2 a', function(e) {
				e.preventDefault();

				var $depth1 = me.$el.find('div.genre_depth1>div.genre_depth1_cont li.on a'),
					depth1 = $depth1.attr('data-genre-code'),
					depth1Name = $depth1.text(),
					$depth2 = $(this),
					depth2Name = $depth2.text(),
					depth2 = $depth2.attr('data-genre-code');

				$depth2.closest('div.genre_tab').find('div.genre_depth2 li.on').removeClass('on');
				$depth2.parent().addClass('on');

				me.trigger('selectedgenre', [{depth1: depth1, depth1Name: depth1Name, depth2: depth2, depth2Name: depth2Name}]);
			});

			// 1Depth 왼쪽으로 이동
			me.on('click', 'button.genre_tab_left', function(e) {
				me._moveLeft($(this).siblings('div.genre_depth1_cont'));
			});

			// 1Depth 오른쪽으로 이동
			me.on('click', 'button.genre_tab_right', function(e) {
				me._moveRight($(this).siblings('div.genre_depth1_cont'));
			});

			// 2Depth 왼쪽으로 이동
			me.on('click', 'button.genre_tab_left2', function(e) {
				me._moveLeft($(this).siblings('div.genre_depth2_cont'));
			});

			// 2Depth 오른쪽으로 이동
			me.on('click', 'button.genre_tab_right2', function(e) {
				me._moveRight($(this).siblings('div.genre_depth2_cont'));
			});

			// 1Depth 초기화 이벤트 바인딩
			me.$el.find('div.genre_depth1').each(function() {
				initSlider.call(this, 540);
			});

			// 2Depth 초기화 이벤트 바인딩
			me.$el.find('div.genre_depth2').each(function() {
				initSlider.call(this, 540);
			});

			function initSlider(width) {
				var $div = $(this),
					$panel = $div.find('div.of_h'),
					$uls = $panel.find('ul'),
					$buttons = $div.find('>button');

				$panel.css({'width': width * $uls.length});
				$uls.each(function(i) {
					$uls.eq(i).css({'position': 'absolute', 'left': i * width});
				});

				if($uls.length <= 1) {
					$buttons.remove();
				} else {
					$buttons.show().eq(0).hide();
				}
			}

			me.init();
		},

		// 폰트가 일그러지는 정확한 원인을 알수 없지만, 슬라이드 방식을 left대신에 scrollLeft로 변경하니까 해당 현상이 안 나타남
		_move: function($con, direction) {
				if(this._isAnimation){ return; }

				var me = this,
					$panel = $con.find('>div.of_h'),
					conWidth = $con.width(),
					panelWidth = $panel.width(),
					currLeft = $con.scrollLeft(),
					left = (direction === 'left') ? Math.max(0, currLeft - conWidth) : Math.min(panelWidth, currLeft + conWidth),
					$pages = $panel.find('>ul').css('visibility','');

				me._isAnimation = true;
				$con.stop().animate({'scrollLeft': left}, {duration:400, easing:'easeInOutQuart', complete: function() {
					$pages.each(function(i){
						// 안보이는 영역에 위치한 ul은 숨겨야 함(탭키로 포커스 이동 시 가시영역으로 나와버리는 현상땜에...)
						if(i !== (left / conWidth)) {
							$pages.eq(i).css('visibility', 'hidden');
						}
					});
					// start: 131121_수정
					me.toggleButtons($con, left);
					// end: 131121_수정
					me._isAnimation = false;
				}});
		},

		// 왼쪽으로 슬라이딩
		_moveLeft: function($con) {
				this._move($con, 'left');
		},

		// 오른쪽으로 슬라이딩
		_moveRight: function($con) {
				this._move($con, 'right');
		},

		toggleButtons: function($con, left){
			var $buttons = $con.siblings('button'),
				conWidth = $con.width(),
				panelWidth = $con.find('>div.of_h').width();

			$buttons.eq(0).toggle(left > 0);
			$buttons.eq(1).toggle(left !== panelWidth - conWidth);
		},

		// 초기화
		init: function(){
			var me = this,
				$div;

			// 1Depth: 슬라이딩 위치를 0으로 하고 첫번째 항목을 활성화
			//me.$el.find('div.genre_depth1').trigger('initslider').find('li:first a').trigger('click');
			$div = me.$el.find('div.genre_depth1');
			$div.find('div.of_h').stop().css({'left': 0}).find('>ul>li.on').removeClass('on');
			$div.find('li:first a').trigger('click')

			// 2Depth
			//me.$el.find('div.genre_depth2').hide().eq(0).trigger('initslider').show();
			$div = me.$el.find('div.genre_depth2');
			$div.find('div.of_h').stop().css({'left': 0}).find('li.on').removeClass('on');
			$div.hide().eq(0).show();

			// 초기화 후 첫 페이지로 돌아가지 않는 문제 해결
			me.setGenres('DP0100','DP0102');                       // 가요 > 발라드 선택
			me.$el.find('.genre_depth2 li.on').removeClass('on');  // 2뎁스 선택 해제
		},

		setGenres: function(depth1Code, depth2Code){
			var me = this;

			var $depth1 = me.$el.find('>div.genre_depth1'),
				$con1 = $depth1.find('>div.genre_depth1_cont'),
				$btn1 = $depth1.find('li>a[data-genre-code='+depth1Code+']'),
				$ul1 = $btn1.closest('ul'),
				index1 = $ul1.prevAll('ul').find('li').length + $btn1.parent().index(),

				$depth2 = me.$el.find('>div.genre_depth2').hide().eq(index1).show(),
				$con2 = $depth2.find('>div.genre_depth2_cont'),
				$btn2 = $depth2.find('a[data-genre-code='+depth2Code+']'),
				$ul2 = $btn2.closest('ul'),
				left = 0;

			// 1뎁스
			$depth1.find('li.on').removeClass('on');
			$ul1.parent().parent().scrollLeft(left = ($ul1.index() * 540)); // 슬라이딩
			$ul1.css('visibility','').siblings().css('visibility', 'hidden'); // 키보드로 접근할 때, 안보이는 영역에 위치한 장르에 포커스가 가지않도록 숨겨야 한다.
			$btn1.parent().addClass('on');
			me.toggleButtons($con1, left);

			// 2뎁스
			$ul2.parent().parent().scrollLeft(left = ($ul2.index() * 528)); // 슬라이딩
			$ul2.css('visibility','').siblings().css('visibility', 'hidden'); // 키보드로 접근할 때, 안보이는 영역에 위치한 장르에 포커스가 가지않도록 숨겨야 한다.
			$depth2.find('li.on').removeClass('on');
			$btn2.parent().addClass('on');
			me.toggleButtons($con2, left);
		}
	});

	var AbstractTab = Class({
		$extend: View,
		name: 'AbstractTab',
		init: function(){
			throw new Error(this.name + '클래스에 init 메소드를 정의해 주세요.');
		},
		play: function(){
			throw new Error(this.name + '클래스에 play 메소드를 정의해 주세요.');
		}
	});

	var ArtistSearcher = Class({
		$extend: AbstractTab,
		name: 'ArtistSearcher',
		selectors: {
			btnSearch: '>button',	// 검색버튼
			inputSearch: 'input',	// 검색어 입력칸
			artistListbox: 'div.input_list'				// 검색리스트 레이어
		},
		events: {
			// 포커스가 검색영역을 벗어날 경우 아티스트리스트박스 숨기기
			'focusin div.search_wrap': function(e) {
				var me = this;
				clearTimeout(me.timer), me.timer = null;
			},

			// 포커스가 검색영역을 벗어날 경우 아티스트리스트박스 숨기기
			'focusout div.search_wrap': function(e) {
				var me = this;
				clearTimeout(me.timer), me.timer = null;
				me.timer = setTimeout(function(){
					me.$artistListbox.hide();
				}, 1000);
			}
		},

		initialize: function(el, options) {
			var me = this;

			if(me.supr(el, options) === false){ return; }

			// 검색어 입력칸
			var prevText = ''
			me.$inputSearch.on('keyup focusin', function(e) {
				var kwd = me.$inputSearch.trimVal();

				// 자동완성이 표시중이 아닌 경우, 아이템 포커스 제거
				if (!me.$artistListbox.is(':visible')) {
					me.$artistListbox.find('li.autocomplete-focused-item').removeClass('autocomplete-focused-item');
				}

				// 포커스된 아이템
				var $focusedItem = me.$artistListbox.find('li.autocomplete-focused-item');
				if ($focusedItem.length == 0) {
					$focusedItem = me.$artistListbox.find('li:focus');
				}

				// 엔터키를 누른 경우
				if (e.keyCode == 13) {
					// 포커스된 아이템이 없으면 검색
					if ($focusedItem.length == 0) {
						me.$btnSearch.click();
						return false;
					// 포커스된 아이템이 있으면 해당 아이템 선택
					} else {
						$focusedItem.find('a').click();
						return false;
					}
				}

				// 자동완성이 표시중인 경우
				if (me.$artistListbox.is(':visible')) {
					// 위 또는 아래 화살표를 누른 경우
					if (e.keyCode == 38 || e.keyCode == 40) {
						// 새 아이템 포커스를 한칸 위 또는 아래로 설정
						if (e.keyCode == 38) {
							var $newFocusedItem = $focusedItem.prev('li');
							if ($newFocusedItem.length == 0) {
								$newFocusedItem = me.$artistListbox.find('li:last');
							}
						} else if (e.keyCode == 40) {
							var $newFocusedItem = $focusedItem.next('li');
							if ($newFocusedItem.length == 0) {
								$newFocusedItem = me.$artistListbox.find('li:first');
							}
						}

						// 새 아이템 포커스가 설정되었으면
						if ($newFocusedItem.length > 0) {
							// 아이템 포커스 이동
							$focusedItem.removeClass('autocomplete-focused-item');
							$newFocusedItem.addClass('autocomplete-focused-item');

							// 포커스된 아이템이 보이도록 스크롤
							var listScrollTop    = me.$artistListbox.scrollTop();
							var listScrollBottom = listScrollTop + me.$artistListbox.height();
							var itemScrollTop    = listScrollTop + $newFocusedItem.offset().top  - me.$artistListbox.offset().top;
							var itemScrollBottom = itemScrollTop + $newFocusedItem.outerHeight();
							if (itemScrollTop < listScrollTop) {
								me.$artistListbox.scrollTop(itemScrollTop);
							} else if (listScrollBottom < itemScrollBottom) {
								me.$artistListbox.scrollTop(itemScrollBottom - me.$artistListbox.height());
							}
						}
						return false;
					}
				}

				// 한 글자만 입력해도 자동완성 표시
				if(kwd.length < 1){
					prevText = kwd;
					me.$artistListbox.hide();
					return;
				}

				if(prevText != kwd) {
					me._loadSearchList(kwd);
				}
				prevText = kwd;
				//me.$artistListbox.show();
			});

			// 검색 버튼
			me.$btnSearch.on('click', function(){
				clearTimeout(me.timer), me.timer = null;

				var kwd = me.$inputSearch.trimVal();

				me.$artistListbox.hide();
				me.trigger('btnSearchClicked', [kwd]);
			});

			// 검색된 리스트에 있는 항목을 클릭 시
			me.$artistListbox.on('click', 'a', function(e) {
				var $btn = $(e.currentTarget),
					artistId = $btn.attr('data-artist-id'),
					name = $btn.find('dt').text(),
					ev;

				ev = $.Event('artistclick');
				me.trigger(ev, [artistId, name]);
				if(ev.isDefaultPrevented()) {
					return false;
				}

				me.$artistListbox.hide();
				me.$inputSearch.val('');
				return false;
			});

			// 다른곳을 클릭시 아티스트 검색결과 리스트박스 숨기기
			$doc.off('.smartradio').on('mousedown.smartradio', function(e) {
				if($(e.target).closest('div.search_wrap').length === 0) {
					me.$artistListbox.hide();
				}
			});


			// 동명이인 팝업에서 받기
			WEBSVC.PubSub.on('addartist', function(e, artistId, artistName) {
				var ev = $.Event('searchartistclick');
				me.trigger(ev, [artistId, artistName]);

				if(ev.isDefaultPrevented()){
					e.preventDefault();
					return;
				}

				me.$inputSearch.trimVal('').focus();
			});
		},

		init: function(){
			var me = this;
			me.$artistListbox.hide().find('ul').empty();
			me.$inputSearch.val('');
		},

		// 자동완성
		_loadSearchList: function(kwd) {
			var me = this;

			// 자동완성 Ajax
			smartRadio.listArtistSearchSuggest(kwd).done(function(json) {
				var html = '', li = '';

				if(json.artists && json.artists.length) {
					li = ['<li><a href="artist.do?artist_id={0}" data-artist-id="{0}" title="{2} - 새 창" target="_blank"><span><img src="{1}" width="40" height="40" alt="{2}" onerror="WEBPOCIMG.defaultArtistImg(this);"></span>',
							'<dl><dt>{2}</dt><dd>{3}</dd></dl></a></li>'].join('');

					for(var i = -1, artist; artist = json.artists[++i]; ){
						html += stringUtil.format(li,
							artist.artistId,
							artist.artistImgThumbSrc,
							artist.artistName,
							artist.profile);
					}
					me.$artistListbox.css('height', '');
					me.$artistListbox.find('>ul').html(html).end().show();
					me.$artistListbox.show();
				} else {
					//검색 결과 없음
					html = '';
					me.$artistListbox.css('height', 0);
					me.$artistListbox.find('>ul').html(html).end().hide();
					me.$artistListbox.hide();
				}
			}).fail(function(xhr, status, err) {
				alert('키워드 검색 에러: ' + err);
			});
		}
	});

	// 아티스트탭 클래스
	var ArtistTab = Class({
		$extend: AbstractTab,
		$statics: {

		},
		name: 'ArtistTab',
		events: {
			'click button.btn_play': function(e) {
				var me = this;

				me.play();
			}
		},

		initialize: function(el, options) {
			var me = this;

			if(me.supr(el, options) === false){ return; }

			me.timer = null;
			me.playArtistList = new PlayArtistList(el); // 플레이리스트 객체
			me.artistSearcher = new ArtistSearcher(me.$el.find('div.search_wrap')); // 아티스트 검색

			me._initArtistTab();
		},

		_initArtistTab: function(){
			var me = this;

			me.artistSearcher.on('searchartistclick', function(e, artistId, artistName) {
				var ev = $.Event('artistclick');
				me.trigger(ev, [artistId, artistName]);
				if(ev.isDefaultPrevented()) {
					return false;
				}
			});
		},

		init: function(){
			var me = this;

			me.playArtistList.init();
			me.artistSearcher.init();
		},

		// 재생버튼 클릭시 실행
		play: function() {
			var me = this,
				data = me.playArtistList.getValue(),
				e;

			me.trigger(e = $.Event('requestplay'), [data]);
			if(e.isDefaultPrevented()) { return; }

			me.playArtistList.activeArtists(); // 아티스트 활성화
			if(me.isIncludeSimilar) {
				me.playArtistList.activeSimilarArtists(); // 유사 아티스트 활성화
			}
		}

	});

	// 장르 탭
	var GenreTab = Class({
		$extend: AbstractTab,
		name: 'GenreTab',
		initialize: function(el, options) {
			var me = this;

			if(me.supr(el, options) === false) { return false; }

			// 연대 슬라이더
			me.ageSlider = new EraSlider(me.$el.find('div.yearlk_wrap'), me.options);
			// 장르 슬라이더
			me.genreSlider = new GenreSlider($('div.genre_tab'));

			// 초기화 버튼
			me.on('click', 'div.fl_right>a', function(e) {
				e.preventDefault();

				me.trigger('btnResetClicked');
			});
		},

		init: function() {
			var me = this;

			me.$el.find('p.sr>strong').html('음악이 필요한 순간, 멜론 스마트라디오');

			me.ageSlider.init();
			me.genreSlider.init();
		},

		play: function(){
			var me = this,
				data = {};

			data = me.ageSlider.getValue();
			data = $.extend(data, me.genreSlider.getValue());

			me.trigger(e = $.Event('requestplay'), [data]);
			if(e.isDefaultPrevented()){ return; }

			me.setTile(data.depth1Name, data.depth2Name, data.startYear, data.endYear);
		},

		setTitle: function( depth1Name, depth2Name, startYear, endYear){
			var me = this;
			/* 141027_modify */
			if (startYear === '1960 이전' && endYear === '2010 이후') {
				me.$el.find('p.sr>strong').html(depth1Name+' '+depth2Name+' (전체)');
			}else if (startYear === '1960 이전') {
				me.$el.find('p.sr>strong').html(depth1Name+' '+depth2Name+' ('+endYear+'년 이전)');
			}else if (endYear === '2010 이후') {
				me.$el.find('p.sr>strong').html(depth1Name+' '+depth2Name+' ('+startYear+'년 이후)');
			}else {
				me.$el.find('p.sr>strong').html(depth1Name+' '+depth2Name+' (' + startYear+'년 ~ '+endYear+'년)');
			};
			/* //141027_modify */
		}
	});

	WEBSVC.define('PBPGN.ArtistTab', function() { return ArtistTab; });
	WEBSVC.define('PBPGN.GenreTab', function() { return GenreTab });

	// 커스텀 스크롤 클래스
	var CustomScrollBar = Class({
		$extend: View,
		name: 'CustomScrollBar',
		initialize: function(el, options) {
			var me = this;

			if(me.supr(el, options) === false) { return; }

			me.$scrollBar = me.$el.siblings('div.d_scrollbar');
			me.$content = me.$el.find('.d_content');


			me.containerHeight = me.$el.height();
			me.contentHeight = me.$content.height();
			if(me.contentHeight <= me.containerHeight){
				me.$scrollBar.hide();
				me.destroy();
				return;
			}

			me.scrollRate =  me.containerHeight / me.contentHeight;
			me.scrollBarHeight = me.containerHeight * me.scrollRate;
			me.scrollHeight = me.containerHeight - me.scrollBarHeight;
			me.isMouseDown = false;
			me.moveY = 0;

			me.$scrollBar.on('mousedown', function(e){
				e.preventDefault();
				if(isTouch){
					e.stopPropagation();
				}

				me.isMouseDown = true;
				me.currY = parseInt($(this).css('top'), 10);
				me.downY = me._getY(e);
				return false;
			});

			$doc.on('mouseup touchend mousemove touchmove', function(e){
				if(!me.isMouseDown){ return; }

				switch(e.type){
				case 'mouseup':
				case 'touchend':
					me.isMouseDown = false;
					me.moveY = 0;
					break;
				case 'mousemove':
				case 'touchmove':
					me.moveY = me._getY(e);
					me._move(me.currY - (me.downY - me.moveY));

					e.preventDefault();
					break
				}
			});

			me.on('scroll', function(){
				if(!me.isMouseDown) {
					me.update();
				}
			}).on('mousewheel DOMMouseScroll', function(e) {
				e.preventDefault();
				e = e.originalEvent;
				var delta = e.wheelDelta || -e.detail;

				me.$el.scrollTop(me.$el.scrollTop() - delta);
			});

			me.update();
		},

		update: function(){
			var me = this;

			me.contentTop = me.$el.scrollTop();
			me.$scrollBar.css('height', me.scrollBarHeight).find('span.bg_mid').css('height', me.scrollBarHeight - 11);
			me.$scrollBar.css('top', me.contentTop * me.scrollRate);
		},
		_move: function(top) {
			var me = this;

			top = Math.max(0, Math.min(top, me.scrollHeight));

			me.$scrollBar.css('top', top);
			me.$el.scrollTop((me.contentHeight - me.containerHeight) * (top / me.scrollHeight));
		},
		_getY: function(e) {
			if(isTouch && e.originalEvent.touches){
				e = e.originalEvent.touches[0];
			}
			return e.pageY;
		}
	});


	$(function(){

		new CustomScrollBar($('div.right_cont div.scrollarea'));
		$('select.d_selectbox').selectbox();

	});

})(jQuery, MELON.WEBSVC, MELON.PBPGN);
