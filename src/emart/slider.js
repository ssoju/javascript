/*!
 * @author 김
 */
 (function($, core, ui, undefined) {
    var $win = core.$win,
        $doc = core.$doc;
    
   
   
    core.define( 'ui.MoveDirection', 
    	{
    		/** @property {String} SLIDE_HORIZONTAL 가로 슬라이드 효과 옵션  */
			HORIZONTAL : "horizontal",
			/** @property {String} SLIDE_VERTICAL 세로 슬라이드 효과 옵션  */
			VERTICAL : "vertical" 	
    	 }
    );
    
    core.define( 'ui.IndicatorType', 
    	{
    		/** @property {String} SLIDE_HORIZONTAL 가로 슬라이드 효과 옵션  */
			NORMAL : "normal",
			/** @property {String} SLIDE_VERTICAL 세로 슬라이드 효과 옵션  */
			BG_ANIMATE : "bg_animate" 	
    	 }
    );
    
    core.define( 'ui.EffectType', 
    	{
    		/** @property {String} SLIDE_HORIZONTAL 가로 슬라이드 효과 옵션  */
			SLIDE_HORIZONTAL : "slide_horizontal",
			/** @property {String} SLIDE_VERTICAL 세로 슬라이드 효과 옵션  */
			SLIDE_VERTICAL : "slide_vertical",
			/** @property {String} ALPHA 페이드인 효과 옵션  */
			ALPHA : "alpha",
			ALPHA_PNG : "alpha_png",
			EXPAND_SLIDE_HORIZONTAL: "expand_slide_horizontal" 	
    	 }
    );
    
    /**********************************************************************************************
	 * 
	 * Transitioner
	 * 
	**********************************************************************************************/
    ui('Transitioner', {
        $statics: {
        	COMPLETE_TRASITION : "complete_transition"
        },
        
        $mixins: [ui.Listener],
       
        defaults:{
        	noneClass : "none",
            onClass: "on",
			effectType: "",
			duration: 500,
			intervalTime: 5000,
			focustarget:"",
			startIndex: 0,
			easing: "easeOutQuad"
        },
        
        selectors: {
			contentList : "",
			listContainer: "",
			playButton : "",
			pauseButton : ""
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
			this.currentIndex;
			this.selectedIndex = this.currentIndex;
			this.maxLength;
			this.intervalID;
			this._effectHandler = this._getEffectHandler(this.options.effectType);
			this.maxLength = this.$contentList.length;
			this.$contentList.eq(this.options.startIndex).siblings().addClass(this.options.noneClass);
			this.setContent( this.options.startIndex, false);
		
        },
        
		/**
		 * 선택된 컨텐츠 설정
		 * @param {int} index select index
		 */
		setContent : function(index, isAni) {
			isAni = (isAni == undefined) ? true : isAni;
			//this.selectedIndex = index;
			if (this.isAnimate || this.currentIndex == index) {
				return;
			};
			var $new = this.$contentList.eq(index), $old = this.$contentList.eq(this.currentIndex);
			var direction = (this.currentIndex > index ) ? -1 : 1;
			this.currentIndex = index;
			this._effectHandler($new, $old, direction, isAni);
		},

		/**
		 * fadein/fadeout 모션 핸들러
		 * @param { jqeury } $new 신규로 보여져야할 엘리먼트 jquery 객체
		 */
		_alphaEffect : function($new) {
			this.isAnimate = true;
			this.$listContainer.append($new);
			$new.removeClass(this.options.noneClass).css("opacity", 0).stop().animate({
				opacity : 1
			}, {
				duration: this.options.duration,
				complete: $.proxy(this._setEffectCompleteCallback, this, $new),
				easing: this.options.easing
			});
		},

		/**
		 * png fadein/fadeout 모션 핸들러
		 * @param { jqeury } $new 신규로 보여져야할 엘리먼트 jquery 객체
		 */
		_alphaPNGEffect : function( $new, $old, direction, isAni ) {
			this.isAnimate = true;
			this.$listContainer.append($new);
			if (isAni) {
				$old.stop().animate({
					opacity : 0
				}, {
					duration: this.options.duration,
					easing: this.options.easing
				});
				
				$new.removeClass(this.options.noneClass).css("opacity", 0).stop().animate({
					opacity : 1
				}, {
					duration: this.options.duration,
					complete: $.proxy(this._setEffectCompleteCallback, this, $new),
					easing: this.options.easing
				});
				
			} else {
				$old.stop().css("opacity", 0);
				$new.removeClass(this.options.noneClass).css("opacity", 1);
				this._setEffectCompleteCallback($new);
			}

		},
		
		_expandSlideToHorizontalEffect : function($new, $old, direction, isAni) {
			
			this.isAnimate = true;
			var old_left = 100 * (-1 * direction);
			$old.find(".d-expand-target").stop();
			if (isAni) {
				var $expandTarget = $new.find(".d-expand-target").css({width:"100%", left:"0%", top: "0%"});
				$new.css("left", (100 * direction)+"%");
				$new.removeClass(this.options.noneClass).stop().animate({
					left : 0
				}, {
					duration: this.options.duration,
					complete: $.proxy(function(){
									this._setEffectCompleteCallback($new);
									this._expandImgAnimate($new); 
									
								}, this),
					easing: this.options.easing
				});
				
				
				$old.stop().animate({
					left : old_left+"%"
				},{
					duration: this.options.duration,
					easing: this.options.easing
				});	
				
			}else{
				$new.stop().removeClass(this.options.noneClass).css("left", 0);
				$old.stop().css("left" , old_left);
				this._expandImgAnimate($new);
				this._setEffectCompleteCallback($new);
			}
		},
		
		_expandImgAnimate: function( $target ){
			var $expandTarget = $target.find(".d-expand-target").css({width:"100%", left:"0%", top: "0%"});
			$expandTarget.stop().animate({width:"106%", left:"-3%"},{
											duration: this.options.intervalTime-this.options.duration,
											easing: this.options.easing
										});
		},
		/**
		 * 가로 슬라이드 모션 핸들러
		 * @param { jqeury } $new 신규로 보여져야할 엘리먼트 jquery 객체
		 * @param { jqeury } $old 기존에 보여졌던 엘리먼트 jquery 객체
		 * @param { number } direction 슬라이드 방향
		 */
		_slideToHorizontalEffect : function($new, $old, direction, isAni) {
			this.isAnimate = true;
			var old_left = this.listWidth * (-1 * direction);
			if (isAni) {
				$new.css("left", this.listWidth * direction);
				$new.removeClass(this.options.noneClass).stop().animate({
					left : 0
				}, {
					duration: this.options.duration,
					complete: $.proxy(this._setEffectCompleteCallback, this, $new),
					easing: this.options.easing
				});
				
				$old.stop().animate({
					left : old_left
				},{
					duration: this.options.duration,
					easing: this.options.easing
				});	
				
			}else{
				$new.stop().removeClass(this.options.noneClass).css("left", 0);
				$old.stop().css("left" , old_left);
				this._setEffectCompleteCallback( $new);
			}
		},

		/**
		 * 세로 슬라이드 모션 핸들러
		 * @param { jqeury } $new 신규로 보여져야할 엘리먼트 jquery 객체
		 * @param { jqeury } $old 기존에 보여졌던 엘리먼트 jquery 객체
		 * @param { number } direction 슬라이드 방향
		 */
		_slideToVerticalEffect : function($new, $old, direction) {
			this.isAnimate = true;
			$new.css("top", this._listHeight * direction);
			$new.removeClass(this.options.noneClass).stop().stop().animate({
				top : 0
			}, {
				duration: this.options.duration,
				complete: $.proxy(this._setEffectCompleteCallback, this, $new),
				easing: this.options.easing
			});
			
			$old.stop().animate({
				top : this._listHeight * (-1 * direction)
			}, {
				duration: this.options.duration,
				easing: this.options.easing
			});
		},

		/**
		 * 모션 완료후 공통 실행될 callback함수
		 * @param { jqeury } $target 화면에 감춰야할 엘리먼트 jquery 객체
		 */
		_setEffectCompleteCallback : function($target) {
			$target.siblings().addClass(this.options.noneClass);
			this.isAnimate = false;

			if (this.selectedIndex != this.currentIndex) {
				this.setContent(this.currentIndex);
				this.selectedIndex = this.currentIndex;
			} else {
				this.trigger( ui.Transitioner.COMPLETE_TRASITION, [ this.currentIndex ]);
			}
		},
				
		/**
		 * type에 따라 실행할 effectHandler return
		 * @param { string } 모션 타입
		 * @retunr { function } effectHandler
		 */
		_getEffectHandler : function(type) {
			switch( type ) {
				case ui.EffectType.ALPHA:
					return this._alphaEffect;
					break;
				case ui.EffectType.SLIDE_HORIZONTAL:
					this.listWidth = this.$contentList.eq(0).width();
					return this._slideToHorizontalEffect;
					break;
					
				case ui.EffectType.SLIDE_VERTICAL:
					this._listHeight = this.$contentList.eq(0).height();
					return this._slideToVerticalEffect;
					break;
					
				case ui.EffectType.ALPHA_PNG:
					var $img = this.$contentList.find("img");
					$img.css("filter", "inherit");
					core.util.png24($img);
					return this._alphaPNGEffect;
					break;
				case ui.EffectType.EXPAND_SLIDE_HORIZONTAL:
					return this._expandSlideToHorizontalEffect;
					break;
				default :
					return this._alphaEffect;
			}
			
			
		},
		
        release: function(){
           
        }
    });
    
    
    
    
    ui('AbBannerUI', {
        $statics: {
        	
        },
        
        $mixins: [ui.Listener],
       
        defaults:{
        	noneClass: "none",
        	isAutoPlay: true,
        	loop: false,
        	startIndex: 0,
        	disableClass: "disable"
        },
        
        selectors: {
			playButton : ".d-play",
			pauseButton : ".d-pause",
			nextButton : ".d-next",
			prevButton : ".d-prev"
		},
        
        events: {
        	
        },

        /**
         * 
         * @param el
         * @param options
         */
        initialize: function( el, options ) {
        	if( this.callParent(el, options) === false ) { return; }
        	this.isAutoPlay = this.options.isAutoPlay;
        	this.currentIndex = this.options.startIndex;
        	this.maxLength;
        	this._bindIndicatorEvent();

			if(this.getAutoPlay()){
				this.play();
			}
        },
        
        _bindIndicatorEvent: function(){
        	var me = this;
        	if( core.isTouch ){
				this.$el.swipe( {
					excludedElements: "label, input, select, textarea, .noSwipe",
					swipeLeft: $.proxy( me._nextHandler, this ),
					swipeRight: $.proxy( me._prevHandler, this ),
					fingers:1,
					threshold:0
				});
			}
			
			if(me.getAutoPlay()){
				this.$el.on("mouseenter focusin", function(e) {
					me.isPause = true;
					if ( me.getAutoPlay() ) {
						me.pause();	
					}
				});
		
				this.$el.on("mouseleave focusout", function(e) {
					me.isPause = false;
					if ( me.getAutoPlay() ) {
						me.play();
					}
				});
			}
			
			
			if( this.selectors.nextButton != "" ){
				this.$el.on( "click", this.selectors.prevButton, $.proxy( this._prevHandler, this ));
        		this.$el.on( "click", this.selectors.nextButton, $.proxy( this._nextHandler, this ));
			}
        	
        	if( this.selectors.playButton != "" ){
	        	this.$el.on( "click", this.selectors.playButton, $.proxy( function(e){
	        		e.preventDefault();
	        		if( this.options.isToggle ){
	        			this.$playButton.addClass(this.options.noneClass);
	        			this.$pauseButton.removeClass(this.options.noneClass).focus();
	        		}
	        		this.setAutoPlay(true);
	        	}, this ));
	        	
	        	this.$el.on( "click", this.selectors.pauseButton, $.proxy( function(e){
	        		e.preventDefault();
	        		if( this.options.isToggle ){
	        			this.$playButton.removeClass(this.options.noneClass).focus();
	        			this.$pauseButton.addClass(this.options.noneClass);
	        		}
	        		this.setAutoPlay(false);
	        	}, this ));
        	}
        },
        
        setAutoPlay: function( bool ){
        	if( this.isAutoPlay == bool ){return};
        	this.isAutoPlay = bool;
        	if( bool ){
        		this.play();
        	}else{
        		this.pause();
        	}        	
        },
        
        getAutoPlay: function(){
        	return this.isAutoPlay;	
        },
        
        play: function(){},
        
        pause: function(){},
        
        _triggerSelected: function(index){},
        
        select: function( index ){
			this.$prevButton.removeClass(this.options.disableClass);
			this.$nextButton.removeClass(this.options.disableClass);
			if(!this.options.loop) {				
				if( index == 0 ){
					this.$prevButton.addClass(this.options.disableClass);
				}else if( index == this.maxLength-1 ){
					this.$nextButton.addClass(this.options.disableClass);
				}
			}
        },
        
        _prevHandler: function(e){
			e.preventDefault();

        	var index = this.currentIndex-1;
        	if( index < 0 ){ 
				if(this.options.loop){
					index = this.maxLength-1;
				}else{
					return;	
				}	
			};
			this._triggerSelected(index);
        },
        
        _nextHandler: function(e){
			e.preventDefault();

        	var index = this.currentIndex+1;        	
			if( index == this.maxLength ){ 
				if(this.options.loop){
					index = 0;
				}else{
					return;	
				}	
			};		
			this._triggerSelected(index);
        }
         
     });
     
    
    ui('BasicBannerUI', 'AbBannerUI', {
        $statics: {
        	
        },
        
        $mixins: [ui.Listener],
       
        defaults:{
        	intervalTime: 3000,
        	isAutoPlay: true,
        	startIndex: 0,
        	loop: false,
        	onClass: "on",
        	isToggle: false,
        	maxLength: 0
        },
        
        selectors: {
        	indicator: ".d-icon",
			playButton : ".d-play",
			pauseButton : ".d-pause",
			prevButton : ".d-prev",
			nextButton : ".d-next"
		},
        
        events: {
        	
        },

        /**
         * 
         * @param el
         * @param options
         */
        initialize: function( el, options ) {
        	if( this.callParent(el, options) === false ) { return; }
        	this.maxLength = this.options.maxLength;//this.$indicator.length;
        	this._bindBasicIndicatorEvent();
        	this.isPlay = true;
        	if( this.getAutoPlay() ){ this.play(); }
        },
        
        _bindBasicIndicatorEvent: function(){
        	if( !this.selectors.indicator.length ){
        		return
        	}
        	
        	var me = this;
        	var len = this.maxLength; 
        	
        	this.$el.on( "click", this.selectors.indicator, function(e){
        		e.preventDefault();
        		var index = me.$indicator.index(this);
        		me._triggerSelected( index );
        	});
        },
        
        select: function( index ){
        	this.callParent( index );
        	if( this.intervalID ){
        		this._clearTimer();
        		this._setTimer();
        	}
        	
        	this.currentIndex = index;        	
        	var $cur = this.$indicator.eq(index).addClass( this.options.onClass );
        	this.$indicator.not($cur).removeClass( this.options.onClass );
        },
        
        _triggerSelected: function( index ){
        	this.trigger( "selected", index );
        },
        
        play: function(){
        	this._setTimer();
        	this.isPlay = true;
        },
        
        pause: function(){
        	this._clearTimer();	
        	this.isPlay = false;
        },
        
        getIsPlay: function(){
        	return this.isPlay;
        },
        
        _setTimer: function(){
        	var me = this;
			if ( this.intervalID) {
				return;
			};
			
			this.intervalID = setInterval(function() {
				var nextIndex = me.currentIndex + 1;
				if (nextIndex >= me.maxLength) {
					nextIndex = 0;
				}

				me._triggerSelected( nextIndex );
			}, this.options.intervalTime );
        },
        
        _clearTimer: function(){
        	clearInterval(this.intervalID);
			this.intervalID = undefined;
        },
       	       	
        release: function(){
           
        }
    });
    
    /**********************************************************************************************
	 * 
	 * BGAnimator
	 * 
	**********************************************************************************************/
	
    ui('BGAnimator', {
        $statics: {
        	COMPLETE: "complete"
        },
        
        $mixins: [ui.Listener],
       
        defaults:{
        	moveType: ui.MoveDirection.VERTICAL,
        	duration: 1000,
        	frame: 30,
        	startPosition: 0, 
        	isPlayOnce: true,
        	dist: 20
        },
        
        selectors: {
			
		},
        
        events: {
        },

        /**
         * 
         * @param el
         * @param options
         */
        initialize: function( el, options ) {
        	if( this.callParent(el, options) === false ) { return; }
        	this._setMoveType();
			this.currentFrame=0;
			this.timer;
			this.moveType;
			this.isPlay = true;
			this.startPosition = this.options.startPosition;
			this.intervalTime = this.options.duration/this.options.frame;
        },
        
        _setMoveType: function(){
        	if( this.options.moveType == ui.MoveDirection.HORIZONTAL){
        		this.moveType = "background-position-x";
        	}else{
        		this.moveType = "background-position-y";
        	}
        },
        
        play: function(){
        	this.isPlay = true;
        	var me = this;
        	var frame = this.options.frame;
        	
        	this.pause();
        	this.timer = setInterval(function(){
        		var pos;
        		if( me.currentFrame == 0 ){
        			pos = me.startPosition;
        		}else{
        			pos = me.getPosition(me.currentFrame);
        		}
        		
        		me.$el.css( me.moveType, pos );
        		me.currentFrame++;
        		if( me.currentFrame > frame ){
        			me.playComplete();
        			me.currentFrame = 0;
        		}
        		
        	}, this.intervalTime );
        },
        
        pause: function(){
        	this.isPlay = false;
        	clearInterval( this.timer );
        },
       
        
        getIsPlay: function(){
        	return this.isPlay;
        },
        
        stop: function(){
        	this.pause();
        	this.currentFrame = 0;
        	this.$el.css( this.moveType, ( this.startPosition ) );
        },
       	
       	getPosition: function( currentFrame ){
       		var pos = (this.options.dist*currentFrame)+this.startPosition;
       		return pos;
       	},
       	
       	goToEnd: function(){
       		this.stop();
       		this.currentFrame = this.options.frame-1;
       		var pos = this.getPosition(this.currentFrame);
       		this.$el.css( this.moveType, pos );
       	}, 
       	
       	goToFirst: function(){
       		this.stop();
       		this.currentFrame = 0;
       		this.$el.css( this.moveType, 0 );
       	}, 
       	
       	playComplete: function(){
       		this.trigger("complete");
       		if( this.options.isPlayOnce ){
       			this.stop();
       		}
       	},
       	
        release: function(){
           
        }
    });
    
    emart.bindjQuery(ui.BGAnimator, 'BGAnimator');
    
    
    
    ui('AnimateIndicatorUI', 'AbBannerUI', {
        $statics: {
        	
        },
        
        $mixins: [ui.Listener],
       
        defaults:{
        	moveType: ui.MoveDirection.VERTICAL,
        	frame: 30,
        	startPosition: -20, 
        	isPlayOnce: true,
        	dist: 20,
        	isToggle: false,
        	
        	intervalTime: 3000,
        	isAutoPlay: true,
        	startIndex: 0,
        	loop: false,
        	onClass: "on"
        },
        
        selectors: {
        	indicator: ".d-icon",
			playButton : ".d-play",
			pauseButton : ".d-pause"
		},
        
        events: {
        	
        },

        /**
         * 
         * @param el
         * @param options
         */
        initialize: function( el, options ) {
        	if( this.callParent(el, options) === false ) { return; }
        	this.maxLength = this.$indicator.length;
        	this.isPause = false;
        	this._createBgAnimator();
        	this._bindAnimateIndicatorUIEvent();
        	if( this.getAutoPlay() ){
        		this.play();
        	}
        },
        
        _createBgAnimator: function(){
        	this.$indicator.BGAnimator({
        		moveType: this.options.moveType,
	        	duration: this.options.intervalTime,
	        	frame: this.options.frame,
	        	startPosition: this.options.startPosition, 
	        	isPlayOnce: this.options.isPlayOnce,
	        	dist: this.options.dist	
        	});
        },
        
        _bindAnimateIndicatorUIEvent: function(){
        	var me = this;
        	        	
        	this.$indicator.on("complete", function(){
        		var index = me.$indicator.index(this);
        		
        		if( me.getAutoPlay() ){
        			var index = index+1;
        			if( index == me.maxLength ){
        				index = 0;
        			}
        			
        			me._triggerSelected( index );
        		}
        		
        	});
        	
        	this.$el.on( "click", this.selectors.indicator, function(e){
        		e.preventDefault();
        		var index = me.$indicator.index(this);
        		me._triggerSelected( index );
        	});
        	
        },
        
        select: function( index ){
        	this.currentIndex = index;
        	var $target = this.$indicator.eq(index);
        	
        	this.$indicator.not(':eq('+index+')').BGAnimator('stop');
        	
        	if( this.isAutoPlay && !this.isPause ){
        		$target.BGAnimator('play');
        	}else{
        		$target.BGAnimator('goToFirst');
        	}
        },
        
        _triggerSelected: function( index ){
        	this.trigger( "selected", index );
        },
        
        play: function(){
        	this.select( this.currentIndex );
        },
        
        pause: function(){
        	this.$indicator.eq( this.currentIndex ).BGAnimator('pause');
        },
         	
        release: function(){
           
        }
    });
    
/**********************************************************************************************
 * 
 * BasicBanner
 * 
**********************************************************************************************/
	
    /**
     * ...
     * @class
     * @name emart.ui.BasicBanner
     */
    ui('BasicBanner', 'Transitioner', /**@lends emart.ui.BasicBanner# */ {
        bindjQuery: 'BasicBanner',
        
        $statics: /**@lends emart.ui.BasicBanner */{
            SELECTED: 'selected'
        },
        
        defaults:{
            onClass: "on",
			effectType: "",
			isAutoPlay: true,
			intervalTime: 5000,
			indicatorType: ui.IndicatorType.NORMAL,
			focustarget:"",
			startIndex: 0,
			loop: false,
			isToggle: false,
			easing: "easeOutQuad",
			bgAniIndicator : {
				moveType: ui.MoveDirection.VERTICAL,
				duration: 1000,
				frame: 30,
				startPosition: 0, 
				isPlayOnce: true,
				dist: 20	
			}
        },
        
        selectors: {
			contentList  : "",
			prevButton : "",
			nextButton : "",
			indicator : "",
			playButton:"",
			pauseButton: ""
        },
        
        events: {
            /*'click .d-slider': function(e) {
                var me = this;
                e.preventDefault();
            }*/
        },

        /**
         * 
         *
         * @param el
         * @param options
         */
        initialize: function(el, options) {
        	if( this.callParent(el, options) === false ) { return; }
			this.currentIndex;
			this.indicator;
			this.isAutoPlay = this.options.isAutoPlay;
			this.maxLength = this.$contentList.length;
					
			this._initUI();
			this._createIndicator();
			this._bindIndicatorEvent();
			this.setContent( this.options.startIndex, false );
			
        },

		_initUI: function(){	
			if(this.maxLength <= 1){
				this.$playButton.add(this.$pauseButton).add(this.$indicator).add(this.$prevButton).add(this.$nextButton).add($('.cen_bar')).hide();
			}

			if(this.options.loop){				
				this.$prevButton.removeClass( 'disable' );
				this.$nextButton.removeClass( 'disable' );
			}
		},
        
        play: function(){
        	this.indicator.play();
        }, 
        
        pause: function(){
        	this.indicator.pause();
        },
        
        getIsPlay:function(){
        	return this.indicator.getIsPlay();
        },
        
        _createIndicator: function(){
        	//if( this.$indicator.length ){
        		
        		var selector = {
					indicator: this.selectors.indicator,
					playButton : this.selectors.playButton,
					pauseButton : this.selectors.pauseButton,
					nextButton : this.selectors.nextButton,
					prevButton : this.selectors.prevButton
				};

		        var option = {
		        	selectors : selector,
		        	intervalTime: this.options.intervalTime,
		        	isAutoPlay: this.options.isAutoPlay,
		        	startIndex: this.options.startIndex,
		        	onClass: this.options.onClass,
		        	isToggle: this.options.isToggle,
		        	loop : this.options.loop,
		        	maxLength: this.maxLength
		        }
		        
        		switch( this.options.indicatorType ){
        			case ui.IndicatorType.NORMAL :
        				this.indicator = new ui.BasicBannerUI( this.$el, option );
        			break;
        			case ui.IndicatorType.BG_ANIMATE :
        				option.moveType = this.options.bgAniIndicator.moveType;
        				option.frame = this.options.bgAniIndicator.frame;
        				option.startPosition = this.options.bgAniIndicator.startPosition;
        				option.isPlayOnce = this.options.bgAniIndicator.isPlayOnce;
        				option.dist = this.options.bgAniIndicator.dist;
	        			this.indicator = new ui.AnimateIndicatorUI( this.$el, option );
        			break;
        		}
        	//}
        },
      
        
        _bindIndicatorEvent: function(){
        	var me = this;
        	
			this.indicator.on("selected", function(e, index){
				me.setContent(index);
			});
        },
        
        /**
		 * prev/next 버튼 활성/비활성 상태 변경
		 * @private
		 */
		_setNextPrevButtonState:function( index ){
			if(!this.options.loop) {
				this.$prevButton.toggleClass( this.options.onClass, index != 0 ).html('이전 내용 보기');
				this.$nextButton.removeClass( this.options.onClass, index == this.maxLength - 1 ).html('다음 내용 보기');
			} else {
				this.$prevButton.removeClass( this.options.onClass ).html(index == 0 ? '마지막 내용 보기' : '이전 내용 보기');				
				this.$nextButton.removeClass( this.options.onClass ).html(index == this.maxLength - 1 ? '처음 내용 보기' : '다음 내용 보기');
			}
		},
		
		
		/**
		 * 선택된 컨텐츠 설정
		 * @param {int} index select index
		 */
		setContent: function( index, isAni ){
			if( this.isAnimate || this.currentIndex == index ){ return; };
			this._setNextPrevButtonState( index );
			this.suprMethod( 'setContent', index, isAni );
			this._setIndicator( index );
			this.currentIndex = index;
		},
		
		/**
		 * 인디케이터 상태 변경
		 * @param {int} index select index
		 */
		_setIndicator: function( index ){
			if( this.indicator ){
				this.indicator.select( index );	
			}
		},
		
        release: function(){
           
        }
    });
    
    
})(jQuery, window.emart, window.emart.ui);
