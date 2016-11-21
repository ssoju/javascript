/**
 * Authror: 김승일
 * Email: comahead@vi-nyl.com
 * Created date: 2014-04-22
 * Description: framework
 */
(function($, core, ui, undefined) {
    "use strict";

    var $win = core.$win,
        $doc = core.$doc,
		dateUtil = core.date;


    // 점포찾기 모듈
    var ClosedaySearcher = ui('ClosedaySearcher', {
        $singleton: true,
        defaults: {
        },
		selectors: {
			tabWrap: '.tab_wrap'
		},
        initialize: function(el, options) {
            var me = this;
            if(me.callParent(el, options) === false) { return me.release(), false; }

            me.activeStoreCode = '';
            me.$activeStore = null;

            me._initCloseIcon();
            me._bindEvents();

            if(window['STORE_CODE']) { 
	            me.selectStore(window.STORE_CODE);
			}
        },

        /**
         * 이벤트 바인딩
         * @private
         */
        _bindEvents: function () {
            var me = this;

            // 지역명 선택
            me.on('click', '.tab_cont a', function (e) {
                e.preventDefault();
                
                //console.log($(this).data()); 
                
                
                me.selectStore($(this).data('code'));
                me.triggerHandler('selectedstore', {storeId: $(this).data('code')});

//              //센텀시티점 추가 테스트 표출부분 20160225 제거
//                if($(this).data("etc") == 'S'){
//                	$(".etc_txt").text("");
//                	$(".etc_txt").text("* 해당 지점에는 이마트가 입점되어 있지 않습니다.");
//                }else{
//                	$(".etc_txt").text("");
//                }
            });

            // 지점타입 선택: 이마트, 문화센터, 주유소, 전기충전소
            var $areaItem = me.$('.tab_cont>ul>li');
            me.on('click', '.d-instore a', function (e) {
                e.preventDefault();
                var $el = $(this);

                if($el.hasClass('s_culture')) {
                    // 문화센터
                    $areaItem.hide().filter(':has(.culture)').show();
                } else if($el.hasClass('s_gas')) {
                    // 주유소
                    $areaItem.hide().filter(':has(.gas)').show();
                } else if($el.hasClass('s_elec')) {
                    // 전기충전소
                    $areaItem.hide().filter(':has(.elec)').show();
                } else if($el.hasClass('s_traders')) {
                    // 트레이더스
                    $areaItem.hide().filter(':has(.traders)').show();
                }else if($el.hasClass('s_life')) {
                    // 더라이프
                    $areaItem.hide().filter(':has(.the_life)').show();
                }else if($el.hasClass('s_mollys')) {
                    // 몰리스
                    $areaItem.hide().filter(':has(.mollys)').show();
                }else if($el.hasClass('s_electro')) {
                    // 일렉트로
                    $areaItem.hide().filter(':has(.electro)').show();
                }else if($el.hasClass('s_emart')) {
                	// 일렉트로
                    $areaItem.hide().filter(':has(.emart)').show();
                }else {
                    // 전체
                    $areaItem.show();
                }

                $el.parent().activeItem();
            });
        },

        /**
         * 달력이 선택됐을 시 휴점아이콘 토글링
         * @param {jQuery} $el
         * @private
         */
        _initCloseIcon: function () {
            var me = this;

            // 달력 표시
            me.calendar = me.$('.d-calendar').calendar('instance');
            me.calendar.on('calendarselected', function(e, data) {
				// 날짜를 선택했을 때, 휴점아이콘
                me._toggleCloseIcon(data.date);
            });

            var today = me.calendar.getToday();
            me._toggleCloseIcon(today);
        },

        /**
         * 선택한 날짜의 휴점아이콘 토글링
         * @param {Date} date 날짜
         * @private
         */
        _toggleCloseIcon: function (date) {
            var me = this;
			// date에 해당하는 점포만 휴점아이콘 표시
            me.$('span.ico_store.close').hide()
                .filter('.d-'+dateUtil.format(date, 'yyyyMMdd')).show();
        },

		/**
		 * code에 해당하는 점포 활성화
		 */
        selectStore: function(code) {
            if(code === this.activeStoreCode) { return; }

            var me = this;

            if(me.$activeStore){
				// 기존에 활성화된게 있으면 비활성화 시킨다.
                me.$activeStore
                    .closest('li').removeClass('on')
					.closest('.tab_cont').scrollTop(0);
				me.$activeStore = null;
            }

			var $newStore = me.$tabWrap.find('a[data-code='+code+']');
			if($newStore.length === 0) { return; }

            $newStore
                .closest('li').addClass('on')			// 점포아이콘
                .parent().closest('li').activeItem(); // 서울, 경기

			var $tabCont = $newStore.closest('.tab_cont'),
				tabContHeight = $tabCont.height(),
				top = $newStore.position().top,
				height = $newStore.height();

            me.activeStoreCode = code;
            me.$activeStore = $newStore;

			// 선택한 항목의 위치로 스크롤링
			if((top + height) > tabContHeight) {
				$tabCont.scrollTop(top - (tabContHeight / 2));
			}
        },

        release: function() {
            var me = this;

            me.calendar.release();
            me.calendar = null;
            me.callParent();
        }
    });

	// 지도검색 모듈
	var MapSearcher = ui('MapSearcher', {
        $singleton: true,
        defaults: {
			mapCodes: {
				'A': 'seoul',
				'B': 'busan',
				'C': 'incheon',
				'D': 'daegu',
				'E': 'gwangju',
				'F': 'daejeon',
				'G': 'ulsan',
				'H': 'gangwon',
				'I': 'gyeonggi',
				'J': 'gyeongsang',
				'K': 'gyeongsang',
				'L': 'jeolla',
				'M': 'jeolla',
				'N': 'chongcheng',
				'O': 'chongcheng',
				'P': 'jeju'
			}
        },
		selectors: {
			mapAreas: '.map_area>img',
			mapList: '.map_right',
			mapTags: '.map_tag>span'
		},
        initialize: function(el, options) {
            var me = this;
            if(me.callParent(el, options) === false) { return false; }

            me.activeStoreCode = '';
            me.$activeStore = null;
            me._bindEvents();

            if(window['STORE_CODE']) { 
	            me.selectStore(window.STORE_CODE);
			}
        },

        /**
         * 이벤트 바인딩
         * @private
         */
        _bindEvents: function () {
            var me = this,
				isHateIE = core.browser.isIE && core.browser.version <= 8,
				activeArea = function(ename, isact){
					me.$mapTags.not('.d-active')
						.filter('.'+ename).children().toggleClass('none', !isact);				
				};

            // 지역 선택
			if(isHateIE) {
				// 빌어먹을 IE(area태그에서 포커스 이벤트가 발생안됨, but 인라인으로 하면 발생함)
				$('#map_area area').attr('onfocus', 'emart.PubSub.trigger(\'storeMapHover\', [this, true])')
						.attr('onblur', 'emart.PubSub.trigger(\'storeMapHover\', [this, false])');

				core.PubSub.on('storeMapHover', function(e, sender, isFocus){
					if(!isFocus){
						// 기존 활성버튼 해제
						me.$mapTags.not('.d-active').children().addClass('none');
						return;
					}
					
					// 화성
					activeArea($(sender).attr('data-name'),  true)
				});

				// 마우스 이용시
				$('#map_area').on('mouseenter mouseleave', 'area', function(e) {
					e.preventDefault();

					var ename = $(this).attr('data-name');
					me.$mapTags.not('.d-active').children().addClass('none');

					switch(e.type){
						case 'mouseenter':
							activeArea(ename, true);
							break;
					}
				});

			} else {
				// 착한 브라우저들
				$('#map_area').on('mouseenter mouseleave focusin focusout', 'area', function(e) {
					e.preventDefault();

					var ename = $(this).attr('data-name'),
						isact = false;

					switch(e.type){
						case 'mouseenter':
						case 'focusin': isact = true; break;
						case 'mouseleave':
						case 'focusout': isact = false; break;
					}
					activeArea(ename, isact);
				});
			}

			// 클릭시 on 추가, 오른쪽에 지역이미지 표시
			$('#map_area').on('click', 'area', function(e) {
				e.preventDefault();

				var ename = $(this).attr('data-name');

				if(me.activeArea === ename){ return; }
				me._activeArea(ename, {type: 'index', value: $(this).attr('data-index')});
			});

			// 지역별 점포 선택
			me.on('click', '.map_right a', function(e) {
				e.preventDefault();

				var cls = (this.className||''),
					code = cls.replace(/^map_/, '');

				me.selectStore(code);
				me.triggerHandler('selectedstore', {storeId: code});
			});
            
        },

		// 지역 활성화
		_activeArea: function(ename) {
			var me = this;
			if(me.activeArea === ename) { return; }

			me.activeArea = ename;
			me.$mapAreas.filter('.'+ename).activeItem('none', true);
			me.$mapTags.filter('.d-active').removeClass('d-active').children().addClass('none');
			me.$mapTags.filter('.'+ename).addClass('d-active').children().removeClass('none');
			me.$mapList.find('div.d-area-map.'+ename).activeItem();
		},

		// 점포 활성화
        selectStore: function(code) {
            if(code === this.activeStoreCode) { return; }

            var me = this;

            var $newStore = me.$mapList.find('a.map_'+code);
			if($newStore.length === 0) {
				return;
			}
			
            if(me.$activeStore){
                me.$activeStore.closest('li').removeClass('on');
            }
            me.activeStoreCode = code;
			me.$activeStore = $newStore;
            me.$activeStore.closest('li').activeItem('on');

			// 지역명 추출
			var ename = me.options.mapCodes[$newStore.attr('data-code')];
			me._activeArea(ename);
        }
	});

	// 매장검색 모듈
	var ShopSearcher = ui('ShopSearcher', {
		initialize: function(el, options) {
			var me = this;
            if(me.callParent(el, options) === false) { return false; }

			me.$form = me.$('#frm_shop_search');
			me.$list = me.$('#srch_shop_result');

			me._bindEvents();
		},

		_bindEvents: function() {
			var me = this;

			// 검색 버튼 클릭시
			me.$form.on('submit', function() {
				if(!$.trim(me.$form[0].elements[0].value)){
					alert('지역을 선택해주세요.');
					me.$form[0].elements[0].focus();
					return;
				}
				if(!$.trim(me.$form[0].elements[1].value)){
					alert('매장명을 적어주세요.');
					me.$form[0].elements[1].focus();
					return;
				}

				$.ajax({
					url: this.action,
					data: me.$form.serialize(),
					type: me.$form.attr('method'),
					cache: false
				}).done(function(html) {
					me.$list.html(html);
				});
			});

			// 매장명 클릭
			me.$list.on('click', 'a', function(e) {
				e.preventDefault();

				me.triggerHandler('selectedstore', {storeId: $(this).attr('data-code')});
			});
		},

		// 점포 활성화
        selectStore: function(code) {
			var me = this;
		}
	});

	// 메인클래스
	var StoreSearcher = ui('StoreSearcher', {
		$singleton: true,
		selectors: {
		},
		initialize: function(el, options) {
			var me = this;
            if(me.callParent(el, options) === false) { return false; }

			// 휴점일 탭
			me.closedayTab = new ClosedaySearcher(me.$('.d-srch-tab.d-close-day').parent());
			// 지도 탭
			me.mapTab = new MapSearcher(me.$('.d-srch-tab.d-map').parent());
			// 매장검색 탭
			me.shopTab = new ShopSearcher(me.$('.d-srch-tab.d-shop').parent());

			me._bindEvents();
		},
		
		_bindEvents: function() {
			var me = this;


			// 휴점일, 지도 탭, 매장검색 클릭시
			me.on('click', '.d-srch-tab', function(e) {
				e.preventDefault();

				$(this).parent().activeItem();
			});

			me.closedayTab.on('selectedday', function(e, data) {
				// 날짜 선택시
				
			}).on('selectedstore', function(e, data) {
				// 휴점일 탭의 점포 선택시
				me.mapTab.selectStore(data.storeId);
				me.triggerHandler(e, data);
			});

			me.mapTab.on('selectedstore', function(e, data) {
				// 지도검색 탭의 점포 선택시
				me.closedayTab.selectStore(data.storeId);
				me.triggerHandler(e, data);
			});

			me.shopTab.on('selectedstore', function(e, data) {
				// 매장검색 탭의 점포 선택시
				
				me.triggerHandler(e, data);
			});
		}
	});


	if(window.parent != window.self){
		document.domain = 'emart.com';
		$(document).on('ajaxComplete', function() {
			setTimeout(function(){
				window.parent.$('#iframe_shop').attr('height', '').attr('height', emart.util.getDocHeight() - 100);
			}, 200);
		});
	}


})(jQuery, window[LIB_NAME], window[LIB_NAME].ui);

$(function() {
	// GNB에서 단골점포를 변경했을 때 본문에 반영
	emart.PubSub.on('layer_act_change_favo_emart', function(e, data) {
		var $btn = $('div.d-favor-toggle').find('>button');
		if($btn.attr('data-store-id') === data.id){
			$btn.disabled().css('cursor', 'default');
			$btn.parent().addClass('on').closest('.store_intro').addClass('on').find('.favo_flag>span').html('현재 단골이마트');
		} else {
			$btn.disabled(false).css('cursor', 'hand');
			$btn.parent().removeClass('on').closest('.store_intro').removeClass('on').find('.favo_flag>span').html('단골이마트 미설정');
		}
	});

    // 점포찾기
    new ui.StoreSearcher('#d-store-search', {
        on: {
            'selectedstore': function(e, data) {
                // 지역명을 선택했을 때 발생
                //alert(data.storeId);
                emart.PubSub.trigger('selectedstore', data);
            }
        }
    });


	// 상세 휴점일 달력 토글
	$('#conts').on('click.calendar', '.calendar_wrap .prev_next a', function(e) {
		e.preventDefault();

		var $el = $(this),
			$wrap = $el.closest('.calendar_wrap');

		if($el.hasClass('disabled')) { return; }

		var isPrev = $el.hasClass('prev');		
		// 이전달
		$wrap.find('.d-cal-prev').toggleClass('none', !isPrev);
		// 다음달
		$wrap.find('.d-cal-next').toggleClass('none', isPrev);

		// 클릭한 위치의 요소에다 강제포커싱
		if(isPrev) {
			$wrap.find('.d-cal-prev a.prev').focus();
		} else {
			$wrap.find('.d-cal-next a.next').focus();
		}
	});

});
