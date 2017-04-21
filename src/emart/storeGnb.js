/*!
 * @author 김부윤
 * @email booyoonkim@vi-nyl.com
 * @description
 */
(function($, core, ui, undefined) {
    var $win = core.$win,
        $doc = core.$doc;

    /**
     * @class 
	 * @name emart.ui.GNB
     * @description 페이징모듈
     * @extends emart.ui.View
     */
    ui('GNB', /** @lends emart.ui.GNB# */{
        bindjQuery: 'GNB',
        $statics: /** @lends emart.ui.GNB */{

        },

        defaults: {
            onClass: "on",
            noneClass: "none",
            duration: 300
        },

        selectors: {
            mainBtn: ">li:not(.d-favo)",
            subContain: ".d-sub-contain",
            subLayer: ".d-sub-layer",
            favo: ".d-favo",
            favoBtn: ".d-favo>a",
            favoCloseBtn: ".d-favo-wrap .d-close"
        },

        /**
         *
         * @param el
         * @param options
         */
        initialize: function(el, options) {
            var me = this;
            if(me.callParent(el, options) === false) { return; }
            this.favoriteStore;//단골이마트 객체
            this.subLayerHei = this.$el.find(this.selectors.subContain).eq(0).height();
            this.curtLayerTop = this.subLayerHei*-1;
            this.$mainBtns = this.$el.find(this.selectors.mainBtn);
            this.$currentSubContain;
            this.currentMoveLayer;
            this.isEndFrame = true;
            this.currentTargetTop;
            this.foldTimer;
            this.$animateTarget = $("<div></div>");
            this.isExpand;
        
            if( !core.browser.isTouch ){
                this._bindGNBEvent();
            }else{
                this._bindGNBTouchEvent();
            }

			emart.PubSub.on("loaded_favo_source", function(){
				me._loadedFavorElement();
			});
        },
		
		_loadedFavorElement: function(){
			//관련 html을 동적으로 생성하므로 이벤트 수신 후에 생성
			this._createFavoriteStore();
            this._bindFavoMenuEvent();
		},
		
		/**
		 * 이벤트 바인등
		 
		 */
        _bindGNBEvent: function(){
            var me = this,
				timer;

			this.$el.on('focusin focusout mouseenter mouseleave', '>li:not(.d-favo)', function(e) {
				var $el = $(this);

				clearTimeout(timer);
				switch(e.type){
					case 'focusin':
					case 'mouseenter':
						$el.addClass('on').siblings(':not(.d-favo)').removeClass('on');
						break;
					case 'focusout':
						timer = setTimeout(function(){
							$el.removeClass('on');
						}, 100);
						break;
					case 'mouseleave':
						$el.removeClass('on');
						break;
				}
			});

			this.$subContain.on("mouseenter focusin", 'a', function(e) {
				$(this).children().attr('src', function() {
					return this.src.replace(/[_on]*\.png$/, '_on.png');
				});
			});
			
			this.$subContain.on("mouseleave focusout", 'a', function(e) {
				$(this).children().attr('src', function() {
					return this.src.replace(/[_on]+\.png$/, '.png');
				});
			});

			return;
			
            //this.$el.on( "mouseenter focusin", this.selectors.mainBtn, function(e){
            //    var index = me.$mainBtns.index(this);
            //    me.$mainBtns.removeClass(me.options.onClass).eq(index).addClass(me.options.onClass);
                /*if( !me._expandSubLayer( index )){
                    me._foldSubLayer();
                }*/
            //});

            //this.$el.on( "mouseleave focusout", this.selectors.mainBtn, function(e){
            //    $(this).removeClass(me.options.onClass);
                //var index = me.$mainBtns.index(this);
                //me._foldSubLayer();
            //});
        },
        
        /**
         * 단골이마트 별도 이벤트 바인딩(클릭시 오픈)
         
		 */
        _bindFavoMenuEvent: function(){
        	var me = this;
        	this.$el.on("click", this.selectors.favoCloseBtn, function(e){
                e.preventDefault();
                me.$favo.removeClass('on sel');
                emart.PubSub.trigger("favoemart_close");                
            });

            this.$el.on("click", this.selectors.favoBtn, function(e){
                e.preventDefault();
                if(me.$favo.hasClass('on')){
                    me.$favo.removeClass('on sel');
                	emart.PubSub.trigger("favoemart_close");
                }else{
                    me.$favo.addClass('on sel');
                    emart.PubSub.trigger("favoemart_open");
                }
            });
        },
		
		/**
		 * 단골이마트 모듈 생성
		 
		 */
		_createFavoriteStore: function(){
			if( ui.FavoriteEmart ){
				this.favoriteStore = new ui.FavoriteEmart($(".d-favo"), {
					storeInfoUrl: emart.Env.get( "favoEmartData" ),
					regiFavoStoreUrl:emart.Env.get( "registerFavoEmart" ),
					dateServerUrl : emart.Env.get( "emartBusinessHoursData")
				});	
				
				//init시 메인 배너 움직임을 멈추므로 처음 로드 후 생성시 relase호출
				this.favoriteStore.release();
			}
		},
		
		/**
		 * 태블릿에서 메뉴 이벤트 별도 바인딩(모바일 디바이스는 hover처리 불가)
		 
		 */
        _bindGNBTouchEvent: function(){
            var me = this;
            
            this.$el.on( "click", this.selectors.mainBtn, function(e){
            	if( $(e.target).closest(me.selectors.subContain).length ){
                    return;
                }
                var $target = $(this);
                var subContain = $target.find( me.selectors.subContain );

                if( subContain.length && !$target.hasClass(me.options.onClass) ){
                    e.preventDefault();
                    var index = me.$mainBtns.index(this);
                    me.$mainBtns.removeClass(me.options.onClass).eq(index).addClass(me.options.onClass);
                    $doc.on("touchend.gnb", function(e){
                    	setTimeout(function(){
                    	   me.$mainBtns.removeClass(me.options.onClass);
 	                       $doc.off("touchend.gnb");	
                    	}, 100 );
                    	
                    })
                }else{
                    me.$mainBtns.removeClass(me.options.onClass);
                    $doc.off("touchend.gnb");
                }
            });
            
            /*this.$el.on( "click", this.selectors.mainBtn, function(e){
                if( $(e.target).closest(me.selectors.subContain).length ){
                    return;
                }
                var $target = $(this);
                var subContain = $target.find( me.selectors.subContain );

                if( subContain.length && !subContain.data("isExpand") ){
                    e.preventDefault();
                    var index = me.$mainBtns.index(this);
                    me._expandSubLayer( index );
                    $doc.on("touchstart.gnb", function(e){
                        if( !$(e.target).closest(me.$el).length ){
                            me._foldSubLayer();
                            $doc.off("touchstart.gnb");
                        }
                    })
                }else{
                    me._foldSubLayer();
                    $doc.off("touchstart.gnb");
                }
            });*/
        },

		/**
		 * 하단 슬라이드 메뉴시 필요한 sublayer open함수(현재버저에서는 삭제)
		 
		 * @param {Number} index
		 */
        _expandSubLayer: function( index ){
            clearTimeout( this.foldTimer );
            var $subContain = this.$mainBtns.removeClass(this.options.onClass).eq(index).addClass(this.options.onClass).find( this.selectors.subContain );
            if( $subContain.length ){
                var $subLayer = $subContain.find(this.selectors.subLayer);
                var hei = $subContain.height();
                $subContain.removeClass( this.options.noneClass ).data("isExpand", true);

                if( this.$currentSubContain && this.$currentSubContain.get(0) != $subContain.get(0)){
                    this.$currentSubContain.addClass(this.options.noneClass).data("isExpand", false);
                }

                this.$currentSubContain = $subContain;
                this.currentMoveLayer = $subLayer;
                this._enterFrame(0);
                return true;
            }else{
                return false;
            }
        },

		/**
		 * 하단 슬라이드 영역 닫기 
		 
		 */
        _foldSubLayer: function(){
            clearTimeout( this.foldTimer );
            this.foldTimer = setTimeout($.proxy(function(){
                if( this.$currentSubContain && this.$currentSubContain.length ){
                    this.$currentSubContain.data("isExpand", false);
                    var $subLayer = this.$currentSubContain.find(this.selectors.subLayer);
                    this.currentMoveLayer = $subLayer;
                    this._enterFrame( (this.subLayerHei*-1));
                }
            }, this), 300 );
        },

		/**
		 * 하단 슬라이드 레이어 모션시 메뉴마다 레이어가 존재하기 때문에 개별 애니메이션이 아닌 enterframe함수를 통해 처리(슬라이드중 서브레이어 교체시)
		 
		 * @param {Number} targetTop
		 */
        _enterFrame: function( targetTop ){
            if( this.currentTargetTop == targetTop ){
                if( this.isEndFrame ){
                    this.currentMoveLayer.css("top", targetTop);
                }
                return
            }

            this.currentTargetTop = targetTop;
            var me = this;

            this.$animateTarget.stop().prop("hei", this.curtLayerTop ).animate( {"hei": targetTop},{
                step:function(now, tween){
                    me.isEndFrame = false;
                    me.curtLayerTop = now;
                    me.currentMoveLayer.css("top", now);
                },

                complete: function(){
                    me.isEndFrame = true;
                    if( targetTop != 0 ){
                        me.currentMoveLayer.parent().addClass(me.options.noneClass);
                        me.currentMoveLayer.closest("li").removeClass( me.options.onClass );
                    }
                },
                ease: "easeInOutQuart",

                duration: this.options.duration
            });
        }

    });

	
	
	
	/**
     * 남은 쇼핑시간 계산 모듈
     * @class
     * @name emart.ui.EmartClock
     */
    ui('EmartClock', /**@lends emart.ui.EmartClock# */{
        $statics: /**@lends emart.ui.EmartClock */{
        	
        },
        
        $mixins: [ui.Listener],
       
        defaults:{
        	marginTime: 5000,
			intervalTime: 1000,
			closeTime: "24:00",
			openTime: "10:30",
			serverUrl: ""//"/wsg/servertime.asp"
        },
        
        selectors: {
        	remainTime: ""
        },
        
        events: {
        },

        /**
         * 
         * @param el
         * @param options
         */
        initialize: function(el, options) {
        	if( this.callParent(el, options) === false ) { return; }
			this.serverTime;
			this.localTime;
			this.passTime;
			this.timer;
			this.isInit;
			this.closeTime = this.options.closeTime;
			this.openTime = this.options.openTime;
			this.setBusinessTime( {closeTime: this.closeTime , openTime: this.openTime } );
			//this.init();
        },
        
        init: function(){
        	if ( this.isInit ) {
				this.release();
			}
			
			this._getServerTime();
			this.isInit = true;
        },
        
        /**
         * 서버시간 로드
		 * @private
		 * @function
         */
        _getServerTime: function() {
			var me = this;	
			if(me.options.serverUrl == "" || !me.timer){return;}
			me.stop();
			$.ajax({
				url: this.options.serverUrl,
				cache: false,
				dataType: 'json',
				success: function( json ) {
					me.serverTime = Number( json.response );
					me.localTime = ( new Date() ).getTime();	
					me.start();
				}
			});
		},
		
		/**
		 * 숫자 앞에 0를 붙여 통일된 자리수로 표현
		 * @param { Number } number 변경할 숫자
		 * @param { Number } space 자릿수
		 */
		_addFrontZero: function (number, space) {
		    space = (space == undefined) ? 2 : space;
		    var sign = (number >= 0) ? "" : "-";
		    var strNumber = number.toString();
		    if (sign == "-") strNumber = strNumber.substring(1, strNumber.length);
		    var strNumberLength = strNumber.length;
		    
		    if (strNumberLength > space) {
		        strNumber = strNumber.substring(strNumberLength-space, strNumberLength);
		    } else if (strNumberLength < space) {
		        while (strNumber.length < space) {
		            strNumber = "0" + strNumber;
		        }   
		    }  
		    if (sign == "-" && space != 0) strNumber = sign + strNumber;
		    return strNumber;
		},
		
		/**
		 * 시간 함수
		 * 
		 * @private
		 * @function
		 */
		_tick: function() {
			var $now = this.$now,
				diffTime = ( new Date() ).getTime() - this.localTime,
				currTime = this.serverTime + diffTime;				
			if (  this.serverTime == undefined || Math.abs( diffTime - this.passTime ) >= this.options.marginTime ) {
				this._getServerTime();
			}else {
				var currDate = new Date( currTime );
				var bizHours = this._getDateBusinessHours( currDate );
				var remainTime = bizHours.closeTime - currDate;
				
				if( remainTime < 0 || (currDate.getTime()-bizHours.openTime.getTime()) < 0 ){
					this.$remainTime.find('dd').html( "00:00" );
					return;
				}
				
				var ms = emart.date.msToTime(remainTime);
				
				h = this._addFrontZero( ms.hours, 2 );
				m = this._addFrontZero( ms.mins, 2 );
				
				this.$remainTime.find('dd').html( h + ":" + m );
			}
		},
		
		_getDateBusinessHours:function( currDate ){
			var closeTime = new Date( currDate.getFullYear(), currDate.getMonth(), currDate.getDate() );
			var openTime = new Date( currDate.getFullYear(), currDate.getMonth(), currDate.getDate() );
			
			if( this.openTime > this.closeTime ){
				//새벽 시간 오픈
				closeTime.setDate(closeTime.getDate()+1);
			}
			
			closeTime.setTime( closeTime.getTime()+this.closeTime );
			openTime.setTime( openTime.getTime()+this.openTime );
			
			return {
				closeTime: closeTime,
				openTime: openTime 	
			}
		},

		setBusinessTime: function( data ){
			var openTimeAry = data.openTime.split(":");
			var closeTimeAry = data.closeTime.split(":");
			var openTime, closeTime;
			openTime = parseInt(openTimeAry[0])*60*1000*60 + parseInt(openTimeAry[1])*60*1000;
			closeTime = parseInt(closeTimeAry[0])*60*1000*60 + parseInt(closeTimeAry[1])*60*1000;
			
			this.openTime = openTime;
			this.closeTime = closeTime;
			this._tick();
		},
		
		/**
		 * 타이머 시작
		 * @function
		 */
		start: function() {
			var me = this,
				interval = this.options.intervalTime;

			this.$remainTime.removeClass('no_sel');
			this.$el.removeClass('no_shop');

			clearInterval( this.timer );			
			this.timer = setInterval( function() {
				me.passTime += interval;
				me._tick();
			}, interval );
			
			this.passTime = 0;
			this._tick();
		},
		
		/**
		 * 타이머 정지
		 * @function
		 */
		stop: function() {

			this.$remainTime.addClass('no_sel').find('dd').html('00:00');
			this.$el.addClass('no_shop');

			clearInterval( this.timer );
			this.timer = null;
		},

        release: function(){
			this.stop();
			this.isInit = false;
        }
    });
    

   
   /**
     * ...
     * @class
     * @name emart.ui.FavoriteEmart
     */
    ui('FavoriteEmart', /**@lends emart.ui.FavoriteEmart# */{
        $statics: /**@lends emart.ui.FavoriteEmart */{
        	
        },
        
        $mixins: [ui.Listener],
       
        defaults:{
			storeInfoUrl: "",//"/wsg/favoriteEmart.asp",
			regiFavoStoreUrl:"",
			onClass: "on",
			noneClass: "none",
			favoStoreClass: "my-favo",
			dateServerUrl: ""
        },
        
        selectors: {
        	storeTitle: ".d-store-title",			// GNB부분의 단골점포 표시영역
        	localSelBox: ".d-local-sel",			// 지역선택 셀렉트박스
        	storeSelBox: ".d-shop-sel",			// 점포선택 셀렉트박스
        	localList: ".d-local-sel .d-sel-list li",				// 지역선택 아이템요소
        	storeList: ".d-shop-sel .d-sel-list li",				// 점포선택 아이템요소
        	localListContain: ".d-local-sel .d-sel-list",		// 지역선택 텍스트부분
        	storeListContain: ".d-shop-sel .d-sel-list",	// 점포선택 텍스트부분
        	localSelBtn: ".d-local-sel>a",						// 지역선택 버튼
        	storeSelBtn: ".d-shop-sel>a",						// 점포선택 버튼
        	
        	storeInfoData: ".d-shop-info .d-shop-data",		// 점포정보 영역
        	storeInfoNodata: ".d-shop-info .d-nodata",			// 점포정포 no-data
			
			
			prevCalendarContain: ".d-calendar-contain.d-prev",	 // 현재달
			nextCalendarContain: ".d-calendar-contain.d-next",	// 다음달
			prevMonthBtn: ".d-prev-month",									// 현재달 보기 버튼
			nextMonthBtn: ".d-next-month",									// 다음달보기 버튼
			calendar: ".d-calendar-date",										// 달력 영역
			
			holidayStrElContain: ".d-close_info",							// 휴점정보 영역
			holidayStrEl: ".d-close_info dd",									//
			month: ".d-calendar-text em",										// 월표시 영역
			
			myFavorBtn: ".d-setfavo-btn .d-myfavo-btn",				// 단골점포 버튼
			setMyFavorBtn: ".d-setfavo-btn .d-set-myfavo-btn",	// 단골점포 설정 버튼
			
			emartClock: ".d-emart-clock",										// 시간영역
			openTime: ".d-emart-clock .d-open-time",					// 오픈시간
			closeTime: ".d-emart-clock .d-close-time"     				// 클로즈시간
        },
        
        events: {
        },

        /**
         * 
         * @param el
         * @param options
         */
        initialize: function(el, options) {
        	if( this.callParent(el, options) === false ) { return; }
        
			this.clock;
			this._createClock();
			var storeId;
			var $selectedStore = this.$storeList.filter("."+this.options.onClass);
			
			if( $selectedStore.length ){
				storeId = $selectedStore.attr("data-code");
			}
			
			this.init( storeId );
			this.$prevCalendarContain.find(this.selectors.calendar).calendar();
			this.$nextCalendarContain.find(this.selectors.calendar).calendar();
			this._bindFavoriteEmartEvent();
			this._bindCalendarEvent();
			//this._getStoreInfoData();
        },
        
		/**
		 * 카운팅 모듈 생성
		 */
        _createClock: function(){
	       this.clock =  new ui.EmartClock(this.$emartClock, {
				selectors: {
					remainTime: ".remain_time"
				},
				serverUrl: this.options.dateServerUrl
			});
			
			this.clock.stop();	
        },
        
		/** 
		 * 단골점포가 지정되어 있으면 영업시간 조회
		 * @param {String} storeId
		 */
        init: function( storeId ){
			if( storeId ){
        		this.clock.start();
				this._setStore( storeId );
				this._getStoreInfoData( storeId );	
			}
			
			emart.PubSub.trigger("favoemart_open");
        },
		
		/**
		 * 달력의 이전, 다음 버튼에 클릭이벤트 바인딩
		 */
		_bindCalendarEvent: function(){			
			var me = this;
			// 현재달 보기
			this.$el.on("click", this.selectors.prevMonthBtn, function(e){
				e.preventDefault();
				me.$prevCalendarContain.removeClass(me.options.noneClass);
				me.$nextCalendarContain.addClass(me.options.noneClass);
				me.$prevCalendarContain.find(me.selectors.prevMonthBtn).focus();
			});
			 // 다음달 보기
			this.$el.on("click", this.selectors.nextMonthBtn, function(e){
				e.preventDefault();
				me.$prevCalendarContain.addClass(me.options.noneClass);
				me.$nextCalendarContain.removeClass(me.options.noneClass);
				me.$nextCalendarContain.find(me.selectors.nextMonthBtn).focus();
			});
		},
		
		/**
		 * 단골점포 설정 레이어 이벤트 바인딩
		 */
		_bindFavoriteEmartEvent: function(){
			var me = this;
			
			this.$el.on("click", this.selectors.setMyFavorBtn, function(){
				//비로그인 사용자일 경우 로그인 팝업창 연결
				if( !window.isLogin ){
					emart.PubSub.trigger("openLoginPopup");
				}else{
					me._sendChangeFavoEmartData( me.$storeSelBtn.attr("data-select-store") );	
				}
			});
			
			
			this.$el.on("click", this.selectors.localSelBox, function(e){
				e.stopPropagation();
			});			
			// 지역 선택
			this.$el.on("click", this.selectors.localSelBtn, function(e){
				e.preventDefault();
				if( me.$localSelBox.hasClass( me.options.onClass ) ){
					me.$localSelBox.removeClass( me.options.onClass );
					
				}else{
					me.$localSelBox.addClass( me.options.onClass );
					me.$storeSelBox.removeClass( me.options.onClass );
					$doc.off("click.localbox").on("click.localbox", function(event){
						$doc.off("click.localbox");
						me.$localSelBox.removeClass( me.options.onClass );
					});
				}
			});

			
			this.$el.on("click", this.selectors.storeSelBox, function(e){
				e.stopPropagation();
			});
			// 점포 선택
			this.$el.on("click", this.selectors.storeSelBtn, function(e){
				e.preventDefault();
				var currentStoreLen = me.$storeListContain.not("."+me.options.noneClass).length;
				if( currentStoreLen == 0){
					me.$localSelBox.removeClass( me.options.onClass );
					return;
				}
				if( me.$storeSelBox.hasClass( me.options.onClass ) ){
					me.$storeSelBox.removeClass( me.options.onClass );
				}else{
					me.$localSelBox.removeClass( me.options.onClass );
					me.$storeSelBox.addClass( me.options.onClass );
					$doc.off("click.storebox").on("click.storebox", function(event){
						$doc.off("click.storebox");
						me.$storeSelBox.removeClass( me.options.onClass );
					});
				}
			});
			
			// 지역셀렉트박스에서 지역 선택
			this.$el.on("click", this.selectors.localList, function(e){
				e.preventDefault();
				me.$localSelBox.removeClass( me.options.onClass );
				var $t = $(this);
				if( $t.hasClass(me.options.onClass) ){
					return;
				}
				var code = $t.attr("data-code");
				me._setLocal( code );
				me.$localSelBtn.focus();
			});
			
			// 점포 셀렉트박스에서 점포 선택
			this.$el.on("click", this.selectors.storeList, function(e){
				e.preventDefault();
				me.$storeSelBox.removeClass( me.options.onClass );
				var $t = $(this);
				if( $t.hasClass(me.options.onClass) ){
					return;
				}
				var code = $t.attr("data-code");
				var localCode = $t.parent().attr("data-code");
				me._setStore( code );
				me.$storeSelBtn.focus();
				
				// 변경되었음을 외부에 알림
				emart.PubSub.trigger("selected_store", {"store":code, "local":localCode });
			});
			
			//단골 이마트 외부에서 변경시
			emart.PubSub.on("change_favo_emart", function( e, data ){
				me._chagneFavoEmart(data);
			});
			
		},
		
		/**
		 * 단공점포 설정 버튼 토글
		 * @param {Boolean} bool 설정버튼 표시 여부
		 */
		_setMyFavoriteStoreBtn: function( bool ){
			if( bool ){
				this.$myFavorBtn.removeClass(this.options.noneClass);
				this.$setMyFavorBtn.addClass(this.options.noneClass);
			}else{
				this.$myFavorBtn.addClass(this.options.noneClass);
				this.$setMyFavorBtn.removeClass(this.options.noneClass);
			}
		},
		
		/**
		 * 점포셀렉트박스에 해당점포 활성화
		 * @param {String} code 점포id
		 */
		_setStore: function( code ){
			var $el = this.$storeList.filter("[data-code="+code+"]");
			this._setMyFavoriteStoreBtn( $el.hasClass(this.options.favoStoreClass));
						
			var localCode = $el.parent().attr("data-code");
			//지역선택 함께 적용
			this._setLocal( localCode );
			this.$storeList.removeClass(this.options.onClass);
			
			if( $el.length != 0 ){
				$el.addClass(this.options.onClass);
				this._getStoreInfoData( code );
				this.$storeSelBtn.html( $el.children().html() );
				this.$storeSelBtn.attr("data-select-store", code);
			}
			
		},
		
		/**
		 *  지역셀렉트박스에 해당지역 활성화
		 * @param {String} code 지역id
		 */
		_setLocal: function( code ){
			var $t = this.$localListContain.find("[data-code="+code+"]").addClass(this.options.onClass);
			$t.siblings().removeClass(this.options.onClass);
			
			if(!$t.length){
				this.$localSelBtn.html( this.$localSelBtn.attr("data-default") );
			}
			
			var $currentSel = this.$storeListContain.filter("[data-code="+code+"]").removeClass(this.options.noneClass);
				$currentSel.find("li").removeClass(this.options.onClass);
				
				this.$localSelBtn.html( $t.children().html() );
				this.$storeListContain.not($currentSel).addClass(this.options.noneClass);
				this.$storeSelBtn.html( this.$storeSelBtn.attr("data-default") );
		},
		
		/**
		 * 단골점포 변경 요청
		 * @param {String} id 점포 id
		 */
		_sendChangeFavoEmartData: function( id ){
			if(this.options.regiFavoStoreUrl == ""){return}

			var $el = this.$storeList.filter("[data-code="+id+"]");
			if(!confirm($el.children().html()+'을 단골이마트로 설정하시겠습니까?')) { return; }

			var me = this;
			$.ajax({
				url: this.options.regiFavoStoreUrl,
				cache: false,
				async: false,
				data: {"storeid": id, "isfavor": "Y"},
				dataType: 'html',
				success: function( json ) {
					var response = jQuery.parseJSON(json).response;
					me._chagneFavoEmart( response );
				}
			});	
		},
		
		/**
		 * 단골점포 변경 후에 실행할 작업들
		 * @param {JSON} data
		*/
		_chagneFavoEmart: function( data ){
			//console.log(data);
			//alert(data);
			if( !data || !data.id || data.id == undefined ){
				
				this.$openTime.addClass(this.options.noneClass);
				this.$closeTime.addClass(this.options.noneClass);	
				this.$holidayStrElContain.addClass(this.options.noneClass);
				
				this.$prevCalendarContain.find(this.selectors.calendar).calendar("setHolidays", []);
				this.$nextCalendarContain.find(this.selectors.calendar).calendar("setHolidays", []);
			
			}
			
			var storeID = data.id;
			var title = data.title;
			var $favoEl = this.$storeSelBox.find("[data-code="+storeID+"]");
			this.$storeList.removeClass(this.options.favoStoreClass);
			$favoEl.addClass(this.options.favoStoreClass);
			this.$storeTitle.attr("title", title);
			this.$storeTitle.html(title);
			this._setStore( storeID );
			
			//점포찾기 단골이마트 버튼에 반영돼야하므로 
			emart.PubSub.trigger("layer_act_change_favo_emart", { "id": storeID, "title": title  });
			
		},
		
		/**
		 * 서버에서 점포운영 시간 조회
		 * @param {String} id 점포 id
		 */
		_getStoreInfoData: function( id ){
			if(this.options.storeInfoUrl == ""){return}
			if(!id) {
				this.clock.stop();
				return;
			}

			var me = this;
			$.ajax({
				url: this.options.storeInfoUrl,
				cache: false,
				data: {"storeid": id},
				dataType: 'html',
				success: function( data ) {		
					$data = $(data);
					var infoDataEl = $data.filter("#storeInfo");
					var infoEl = infoDataEl.children();
					var closeTime = infoDataEl.attr("data-close");
					var openTime = infoDataEl.attr("data-open");
					var favoriteYn = infoDataEl.attr("data-favoriteYn");	// 16.04.07 choi.jh
					
					me.$storeInfoData.html( infoEl ).removeClass(me.options.noneClass);
					me.$storeInfoNodata.addClass(me.options.noneClass);
					
					// 월별 휴점일정보 삽입
					me._setCalendarData( $data.filter("#prevCalendarInfo"), me.$prevCalendarContain );
					me._setCalendarData( $data.filter("#nextCalendarInfo"), me.$nextCalendarContain );
					
					
					//단골이마트 해제할경우 감추는 클래스 해제
					me.$holidayStrElContain.removeClass(me.options.noneClass);
					// me.$storeTitle.html(me.$storeList.filter("[data-code="+id+"]").children().html());

					// 2014.08.25 수정 : 휴점일 표시
					var holidays = $data.filter("#prevCalendarInfo").attr('data-holiday'); // 이달의 휴점일 
					var today = emart.date.format(new Date(), 'MM/dd');
					var isHoliday = (holidays||'').indexOf(today) >= 0;

					if(isHoliday) {					
						// 오늘이 휴점일일 때
						me.$emartClock.addClass('no_shop');						// 시계레이아웃 비활성화
						me.$openTime.addClass(me.options.noneClass);	// 오픈 시간
						me.$closeTime.addClass(me.options.noneClass);	// 클로즈 시간	
						me.$('.remain_time').hide();										// 남은 시간
						me.$('.offshop_notice').show();								// 휴점일입니다. 문구 
					} else {
						// 
						me.$emartClock.removeClass('no_shop');													// 시계레이아웃 비활성화
						me.$openTime.removeClass(me.options.noneClass).html(openTime);		// 오픈 시간
						me.$closeTime.removeClass(me.options.noneClass).html(closeTime);   		// 클로즈 시간	
						me.clock.setBusinessTime({openTime: openTime, closeTime: closeTime}); // 오픈, 클로즈시간 설정
						me.clock.start();																							 // 카운트다운 시작

						me.$('.remain_time').show();
						me.$('.offshop_notice').hide();
					}
					
					if(favoriteYn == "Y") {	// 단골점포 가능여부 Y 일때 16.04.07 choi.jh
						$(".d-setfavo-btn").show();
					}
					else {
						$(".d-setfavo-btn").hide();						
					}
				}
			});	
		},
		
		/**
		 * 월별 휴점일 정보 셋팅
		 * @param {jQuery} $dataEl 서버에서 가져온 데이타
		 * @param {jQuery} $calendarContain 달력요소
		 */
		_setCalendarData: function( $dataEl, $calendarContain ){
			var month = $dataEl.attr("data-month");
			var holidayStr = $dataEl.attr("data-holiday");
			
			var $calenderEl = $dataEl.children();
			var today = $calenderEl.attr("data-today");
			var holiday = $calenderEl.attr("data-holidays");
			
			$calendarContain.find(this.selectors.month).html( month );
			$calendarContain.find(this.selectors.holidayStrEl).html( holidayStr );
			$calendarContain.find(this.selectors.calendar).calendar("setDate", today);
			if( $calendarContain == this.$prevCalendarContain ){
				$calendarContain.find(this.selectors.calendar).calendar("setToday", today);
			}
			$calendarContain.find(this.selectors.calendar).calendar("setHolidays", holiday);
		},
		
        release: function(){
        	emart.PubSub.trigger("favoemart_close");
        	this.clock.stop();
        }
    });

    
})(jQuery, window.emart, window.emart.ui);


$(document).ready(function(){
	var ui = emart.ui;

	new ui.GNB(".d-gnb");

	// navigation dropdown
	emart.require([
		'/js/common/dropdown-location.js'
	]).done(function() {
		new ui.DropdownLocation($('section.h_link a.sel').parent());
	});
});
