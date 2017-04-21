(function($, core, ui, undefined) {
	"use strict";
    var $win = core.$win,
        $doc = core.$doc;
    

    /**
     * ...
     * @namespace
     * @name emart.ui.NewspaperAD
     */
    /**
     * ...
     * @namespace
     * @name emart.ui.NewspaperAD.Event
     */
 	core.define('NewspaperAD.Event', /** @lends emart.ui.NewspaperAD.Event */{
 		CHANGE: "change",
 		IMAGE_LOADED: "image_loaded",
 		STEP_CHANGE: "step_change",
 		CLOSE: "close"
 	});
 	
    /**
     * ...
     * @class
     * @name emart.ui.NewspaperAD.Zoomer
     */
    ui('NewspaperAD.Zoomer', /**@lends emart.ui.NewspaperAD.Zoomer# */{
        $statics: /**@lends emart.ui.NewspaperAD.Zoomer */{
        	
        },
        
        $mixins: [ui.Listener],
       
        defaults:{
        	step: 4,
        	moveDist: 100,
        	noneClass:"none"
        },
        
        selectors: {
			content: ".d-content",
			cursorTarget: ".d-content img"
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
        	this.elWid = this.$el.width();
			this.elHei = this.$el.height();
			
			this.maxWid = parseInt(this.$content.attr("data-width"));
			this.maxHei = parseInt(this.$content.attr("data-height"));
			
			this.headerWid;
			this.headerHei;
			
			this.isLoaded = false;
			this.isLoadStart = false;
			this.pos;
			this.currentStep = 0;
			this._setImgUrl();
			this._setZoomStepData();
			this._createDraggable();
			this._bindNewspaperADEvent();
			this.initContent();	
		},
        
		/**
		 * 신문광고 이미지를 로드(data-src속성에 있는 url을 src에 설정)
		 */
        _setImgUrl: function(){
        	this.imgUrlAry = [];
        	var me=this;
        	
        	this.$content.find("img[data-src]").each(function(){
        		me.imgUrlAry.push( $(this).attr("data-src") );
        	});	
        },
        
        /**
		 * 이미지 url 배열 반환
		 * @return {Array}
		 */
        getImgUrl: function(){
        	return this.imgUrlAry;
        },
        
		/**
		 * 이미지를 사이즈를 초기화
		 */
        initContent: function(){
        	this.setSize(0, { perX:0, perY:0 });
        },
        
        getElement: function(){
        	return this.$el;	
        },
        
		/**
		 * 이미지 로드 여부
		 * @return {Boolean}
		 */
        getIsLoaded: function(){
        	return this.isLoaded;	
        },
        
		/**
		 * 이미지가 다 로드될 때까지 기다렸다가 다 로드가 되면 IMAGE_LOADED 이벤트를 날려줌
		 */
        loadImg: function(){
        	if(this.isLoadStart){return}
        	this.isLoadStart = true;
        	var me = this;
        	emart.util.lazyImages( this.$el.find("[data-src]") ).done(function(){
        		me.trigger( core.NewspaperAD.Event.IMAGE_LOADED );
        		me.isLoaded = true;
        	});
        },
        
		/** 
		 * 드래그 기능 바인딩
		 */
        _createDraggable: function(){
        	var me = this;
        	this.$content.draggable({ scroll: false,
        		drag: function( event, ui ) {
        			var top = ui.position.top;
        			var left = ui.position.left;
        			
					// top위치 제한
        			if( top > me.pos.minTop ){
        				ui.position.top =  me.pos.minTop;  	
        			}else if( top < me.pos.limitTop  ){
        				ui.position.top =  me.pos.limitTop;
        			}
        			
					// left 위치 제한
        			if( left > me.pos.minLeft ){
        				ui.position.left = me.pos.minLeft;
        			}else if( left < me.pos.limitLeft ){
        				ui.position.left = me.pos.limitLeft;
        			}
        			
					// 변경되었음을 날려줌
        			me._triggerChange();
        		}
        	});
        },
        
        /**
		 * 이벤트 바인딩
		 */
        _bindNewspaperADEvent: function(){
        	var me = this;
        	        	
			// 마우스다운 시, 커서모양을 +로 변경
        	this.$el.on("mousedown", function(){
        		me.$el.one("mousemove.cursor", function(){
        			me.setCursor("move");	
        		});
        	});
        	
			// 마우스 업 시, 커서모양을 원래대로 되돌림
        	$doc.on("mouseup", function(){
        		me.$el.off("mousemove.cursor");
        		me.setCursor( me.currentStep );
        	});
        	
			// 이미지를 클릭시, 이미지를 확대시켜 준다.
        	this.$el.on("click", this.selectors.content, function(e){
        		var xpos, ypos, x;
        		 if(e.offsetX==undefined){
        		 	//firefox undefined bug
				    xpos = e.originalEvent.layerX;
				    ypos = e.originalEvent.layerY;
				    x = xpos;
				 }else{
				    xpos = e.offsetX;
				    ypos = e.offsetY;
				    x = xpos + me.$cursorTarget.index(e.target)*$(e.target).width();
				 }
  				
        		var perY = ypos/me.$content.height();
        		var perX = x/me.$content.width();
        		if( me.isQuickZoom ){
        			me.setOriginalSize({"perX": perX, "perY":perY});
        		}else{
        			me.setDefaultSize({"perX": perX, "perY":perY});
        		}
        	});
        },
        
		/**
		 * 확대된 이미지를 왼쪽으로 이동
		 */
        moveLeft: function(){
        	var left = parseInt(this.$content.css("left").replace("px",""));
        	var targetLeft = left+this.options.moveDist;
        	
        	if( targetLeft > 0 ){
        		targetLeft = 0
        	}
        	
        	this._animateLeft( targetLeft );
        },
        
		/**
		 * 확대된 이미지를 오른쪽으로 이동
		 */
        moveRight: function(){
        	var left = parseInt(this.$content.css("left").replace("px",""));
        	var targetLeft = left-this.options.moveDist;
        	var limitLeft = this._getLimitPosition().limitLeft;
        	
        	if( targetLeft < limitLeft ){
        		targetLeft = limitLeft
        	}
        	
        	this._animateLeft( targetLeft );
        },
        
		/**
		 * 이미지를 움직일 때 애니메이셔닝(좌우)
		 * @param {Number} left 움직임 크기
		 */
        _animateLeft: function( left ){
        	var currentLeft = parseInt(this.$content.css("left").replace("px",""));
        	if( left == currentLeft ){return}
        	
        	var me = this;
        	this.$content.stop().animate({ "left": left}, {
        		duration: 300,
        		ease: "easeInQuad",
        		step: function( now, tween ){
        			me._triggerChange();
        		}
        	});
        },
        
		/**
		 * 이미지를 움직일 때 애니메이셔닝(상하)
		 * @param {Number} left 움직임 크기
		 */
        _animateTop: function( top ){
        	var currentTop = parseInt(this.$content.css("top").replace("px",""));
        	if( top == currentTop ){return}
        	
        	var me = this;
        	this.$content.stop().animate({ "top": top}, {
        		duration: 300,
        		ease: "easeInQuad",
        		step: function( now, tween ){
        			me._triggerChange();
        		}
        	});
        },
        
		/**
		 * 이미지를 위로 이동
		 */
        moveTop: function(){
        	var top = parseInt(this.$content.css("top").replace("px",""));
        	var targetTop = top+this.options.moveDist;
        	
        	if( targetTop > 0 ){
        		targetTop = 0
        	}
        	
        	this._animateTop( targetTop );
        },
        
		/**
		 * 이미지를 아래로 이동
		 */
        moveBottom: function(){
        	var top = parseInt(this.$content.css("top").replace("px",""));
        	var targetTop = top-this.options.moveDist;
        	var limitTop = this._getLimitPosition().limitTop;
        	if( targetTop < limitTop ){
        		targetTop = limitTop
        	}
        	this._animateTop( targetTop );
        },
        
		/**
		 * 단계별 이미지사이즈 계산하여 보관
		 */
        _setZoomStepData: function(){
        	this.stepData = [];
        	var wid = (this.maxWid - this.elWid)/(this.options.step-1);
        	var hei = (this.maxHei - this.elHei)/(this.options.step-1);
        	for( var i=0; i<this.options.step; i++ ){
        		this.stepData[i] = {
        			"wid": this.elWid+Math.round(wid*i),
        			"hei": this.elHei+Math.round(hei*i)
        		}
        		
        	}
        },
        
		/**
		 * 움직일 수 있는 영역 계산
		 * @return {JSON} 
		 */
        _getLimitPosition: function(){
        	return {
        		minTop: 0,
        		minLeft: 0,
        		limitTop: ( this.headerHei-this.elHei )*-1,
        		limitLeft: ( this.headerWid-this.elWid )*-1
        	}
        },
        
		/**
		 * 이미지를 기본사이즈로 되돌림
		 * @param {Number} pos 위치
		 */
        setDefaultSize: function( pos ){
        	this.setSize(0, pos);
        },
        
		/**
		 * 이미지사이즈를 원본 사이즈로 설정
		 * @param {Number} pos 위치
		 */
        setOriginalSize: function( pos ){
        	this.setSize(this.options.step-1, pos);
        },
        
        /**
		 * 이미지 사이즈 설정
		 * @param {Number} step 단계
		 * @param {Number} pos 위치
		 */
        setSize: function( step, pos ){
        	this.currentStep = step;
        	this.setCursor( step );
        	
        	var data = this.stepData[step];
        	this.headerWid = data.wid;
			this.headerHei = data.hei;
			
			var me = this;
			me.pos = me._getLimitPosition();
        	
        	this.trigger( core.NewspaperAD.Event.STEP_CHANGE, {"step": step, "stepCount": this.options.step } );
        	
        	
        	if( pos != undefined ){
				// 위치 정보가 없을 경우, 위치정보 계산
        		var top = Math.round( ((data.hei*pos.perY)*-1) + (me.elHei*0.5));
				var limitTop = (data.hei-me.elHei )*-1;
				if( top > 0 ){
    				top = 0  	
    			}else if( top < limitTop  ){
    				top =  limitTop;
    			}
			    		
			    		
			    var left = Math.round(((data.wid*pos.perX)*-1) + (me.elWid*0.5));
				var limitLeft = ( data.wid-me.elWid )*-1;
				if( left > 0 ){
    				left = 0  	
    			}else if( left < limitLeft  ){
    				left =  limitLeft;
    			}
		        				
        		this.$content.css({
	        		"width": data.wid, 
	        		"height": data.hei,
        			"top": top,
        			"left": left
        		});
        		
        		me._triggerChange();
        	}else{
        		
		    	this.$content.stop().animate({"width": data.wid, "height": data.hei}, {
	        		duration: 500,
	        		easing: "easeOutQuad",
	        		step: function( now, tween ){
	        			if( tween.prop == "height" ){
	        				var limitTop = ( now-me.elHei )*-1;
	        				var top = parseInt(me.$content.css("top").replace("px",""));
		        			if( top < limitTop  ){
		        				top =  limitTop;
		        				me.$content.css("top", top);
		        			}
	        			}else{
	        				var limitLeft = ( now-me.elWid )*-1;
	        				var left = parseInt(me.$content.css("left").replace("px",""));
	        				if( left < limitLeft ){
		        				left = limitLeft;
		        				me.$content.css("left", left);
		        			}
	        			}
	        			
	        			me._triggerChange();
	        		}
	        	});
        	}
        },
        
        /**
		 * 이미지를 사이즈정보를 기반으로 위치를 계산하여 이동
		 * @param {JSON} 사이즈 정보
		 */
        setPosition: function( data ){
        	var tb = (data.containHeight-data.height)*-1;
			var td = (this.elHei-this.$content.height());
        	
        	var lb = (data.containWidth-data.width)*-1;
			var ld = (this.elWid-this.$content.width());
        		
        	if( data.top != undefined){
        		var y = data.top*-1;
        		var x = data.left*-1;
        		
        		var top = td/tb*y+0;
        		var left = ld/lb*x+0;
        		
        		this.$content.css({
        			top: top,
        			left: left
        		});
        	}
        },
        
		/**
		 * 사이즈나 위치가 변경될 때 이벤트를 날림
		 */
        _triggerChange: function(){
        	var top = parseInt(this.$content.css("top")),
        		left = parseInt(this.$content.css("left"));

        	this.trigger( core.NewspaperAD.Event.CHANGE, {
        		top : top,
        		left : left,
        		width: this.$content.width(),
        		height: this.$content.height(),
        		containHeight: this.elHei,
        		containWidth: this.elWid,
        		ratio : this.getContainRatio(),
        		scale: this.elWid/this.$content.width()
        	});
        },
        
        /**
		 * 단계에 따라 커서를 변경
		 * @param {Number} step
		 */
        setCursor: function(step){
        	if( step == "move" && this.currentStep != 0 ){
        		this.$cursorTarget.addClass("move_cursor");
        		this.$cursorTarget.removeClass("plus_cursor minus_cursor");
        	}else if( step != this.options.step-1 ){
	        	this.$cursorTarget.addClass("plus_cursor");
	        	this.$cursorTarget.removeClass("minus_cursor move_cursor");
	        	this.isQuickZoom = true;
        	}else{
        		this.$cursorTarget.addClass("minus_cursor");
	        	this.$cursorTarget.removeClass("plus_cursor move_cursor");
	        	this.isQuickZoom = false;
        	}
        },
        
        /**
		 * 줌인
		 */
        zoomIn: function(){
        	if( this.currentStep >= this.options.step-1 ){return}
        	this.setSize( this.currentStep+1);
        },
        
		/**
		 * 줌아웃
		 * @param {Number} step 단계
		 */
        zoomOut: function(step){
        	if( this.currentStep <= 0 ){return}
        	this.setSize( this.currentStep-1 );
        },
        
		/**
		 * 현재 사이즈 비율 반환
		 */
        getContainRatio: function(){
        	var ratio = this.elHei/this.elWid;
        	return ratio; 
        }
        
    });
    
    
    
    /**
     * 이미지맵(축소판) 모듈
     * @class
     * @name emart.ui.NewspaperAD.Map
     */
    ui('NewspaperAD.Map', /**@lends emart.ui.NewspaperAD.Map# */{
        $statics: /**@lends emart.ui.NewspaperAD.Map */{},
        
        $mixins: [ui.Listener],
       
        defaults:{},
        
        selectors: {
        	map: ".d-map",
        	thumbImg: ".d-thumb-img",
			focusTarget: ".d-focus-target",
			maskImg: ".d-focus-target img",
			closeBtn: ".d-close"
		},
        
        events: {},

        /**
         * 
         * @param el
         * @param options
         */
        initialize: function(el, options) {
        	if( this.callParent(el, options) === false ) { return; }
        	this.pos;
        	this.elWid = this.$map.width();
        	this.elHei = this.$map.height();
			this._createMap();
			this._bindMapEvent();
        },
        
		/**
		 * 초기화
		 */
        initContent: function(){
        	this.$el.css({"left": "", "top":""});
        },
        
		/**
		 * 신문광고 이미지를 바탕으로 축소이미지 url 설정
		 */
        setImgUrl: function(urlAry){
        	this.$thumbImg.each(function(){
        		$(this).find("img").each(function(index){
        			$(this).attr("data-src", urlAry[index]);
        		});
        	});
        },
        
		/**
		 * 이벤트 바인딩(드래그)
		 */
        _createMap: function(){
        	this.$el.draggable({ containment: "parent", scroll: false, handle: ".d-handle" });
        	var me = this;
			this.$focusTarget.draggable({ containment: "parent", scroll: false,
				start: function(){
					me.pos = me._getLimitPosition();
				},
				
				drag: function( event, ui ) {
        			me._triggerChange();
        			
        			var top = ui.position.top;
        			var left = ui.position.left;
        			
        			if( top < me.pos.minTop ){
        				ui.position.top =  me.pos.minTop;  	
        			}else if( top > me.pos.limitTop  ){
        				ui.position.top =  me.pos.limitTop;
        			}
        			
        			if( left < me.pos.minLeft ){
        				ui.position.left = me.pos.minLeft;
        			}else if( left > me.pos.limitLeft ){
        				ui.position.left = me.pos.limitLeft;
        			}
        			
        			me.$maskImg.css({
						"left": ui.position.left*-1,
						"top": ui.position.top*-1
					});
        		}
			});
        },
        
		/**
		 * 이벤트 바인딩(초점이동, 닫기 버튼)
		 */
        _bindMapEvent: function(){
        	var me = this;
        	this.$el.on("click", this.selectors.map, function(e){
        		e.preventDefault();
        		var xpos, ypos;
        		
			    xpos = e.pageX-( me.$el.offset().left + parseInt(me.$map.css("margin-left"),10));
			    ypos = e.pageY-( me.$el.offset().top + parseInt(me.$map.css("margin-top"),10) );
				
        		var left = Math.round(xpos - (me.$focusTarget.width()*0.5));
        		var top = Math.round(ypos - (me.$focusTarget.height()*0.5));
        		me.moveToPoint( {"top": top, "left": left} );
        	});
        	
        	this.$el.on("click", this.selectors.closeBtn, function(e){
        		e.preventDefault();
        		me.triggerHandler( core.NewspaperAD.Event.CLOSE );
        	})
        },
        
		/**
		 * 초점 이동
		 * @param {JSON} data.top
		 * @param {JSON} data.left
		 * @param {JSON} data.perX
		 * @param {JSON} data.perY
		 */
        moveToPoint: function( data ){
        	var top, left;
        	if( data.top ){
        		top = data.top, left = data.left;
        	}else{
        		
        		var y = Math.round(this.elHei*data.perY);
        		var x = Math.round(this.elWid*data.perX);
        		left = Math.round(x - (this.$focusTarget.width()*0.5));
        		top = Math.round(y - (this.$focusTarget.height()*0.5));
        	}
        	
        	var pos = this._getLimitPosition();
    		if( top < pos.minTop ){
				top =  pos.minTop;  	
			}else if( top > pos.limitTop  ){
				top =  pos.limitTop;
			}
			
			if( left < pos.minTop ){
				left = pos.minTop;
			}else if( left > pos.limitLeft ){
				left = pos.limitLeft;
			}
    		
    		this._setPosition({"top": top, "left": left});
    		this._triggerChange();
        },
        
		/**
		 * 임계영역 반환
		 */
        _getLimitPosition: function(){
        	return {
        		minTop: 0,
        		minLeft: 0,
        		limitTop: this.elHei- this.$focusTarget.height(),
        		limitLeft: this.elWid - this.$focusTarget.width()
        	}
        },
        
        /**
		 * 위치 및 사이즈 변경시 이벤트를 날려줌
		 */
        _triggerChange: function(){
        	var top = parseInt(this.$focusTarget.css("top").replace("px", "")),
        		left = parseInt(this.$focusTarget.css("left").replace("px", ""));
        	
        	this.triggerHandler( core.NewspaperAD.Event.CHANGE, {
        		top : top,
        		left : left,
        		width: this.$focusTarget.width(),
        		height: this.$focusTarget.height(),
        		containHeight: this.elHei,
        		containWidth: this.elWid
        	});
        },
        
		/**
		 * 위치 설정
		 * @param {JSON} data.scale
		 * @param {JSON} data.ratio
		 * @param {JSON} data.containHeight
		 * @param {JSON} data.containWidth
		 * @param {JSON} data.width
		 * @param {JSON} data.height
		 * @param {JSON} data.top
		 * @param {JSON} data.left
		 */
        setPosition: function( data ){
        
        	var wid = Math.round(this.elWid*data.scale);
        	this.$focusTarget.width( wid );
        	this.$focusTarget.height( Math.round(wid*data.ratio));
        	
        	var tb = (data.containHeight-data.height)*-1;
			var td = (this.elHei-this.$focusTarget.height());
        	
        	var lb = (data.containWidth-data.width)*-1;
			var ld = (this.elWid-this.$focusTarget.width());
			
        	if( data.top != undefined){
        		var y = data.top*-1;
        		var x = data.left*-1;
        		
        		var top = td/tb*y+0;
        		var left = ld/lb*x+0;
        		this._setPosition({"top": top, "left": left});
        	}
        },
        
		/**
		 * 실제 엘리먼트 이동
		 * @param {JSON} pos.left
		 * @param {JSON} pos.top
		 */
        _setPosition: function( pos ){
        	if( pos.top == undefined || isNaN(pos.top) ){
        		pos.top = 0;
        	}
        	
        	if( pos.left == undefined || isNaN(pos.left) ){
        		pos.left = 0;
        	}
        	
        	this.$focusTarget.css({
        			top: pos.top,
        			left: pos.left
        		});
        		
        		this.$maskImg.css({
					"left": pos.left*-1,
					"top": pos.top*-1
				})
        }
    });
    
    
    
    /**
     * 신문전단 모듈
     * @class
     * @name emart.ui.NewspaperAd
     */
    ui('NewspaperAd', /**@lends emart.ui.NewspaperAd# */{
        $statics: /**@lends emart.ui.NewspaperAd */{},
        
        $mixins: [ui.Listener],
        bindjQuery: 'NewspaperAd',
        defaults:{
        	expandStep: 3,
        	compositionPage: 2,
        	moveDist: 100,
        	noneClass: "none",
        	disableClass: "disabled",
        	highDepthClass: "high_depth"
        },
        
        selectors: {
        	plusButton : ".d-plus",
			minusButton : ".d-minus",
			container: ".d-contain",
			map: ".d-map",
			content: ".d-content",
			focusTarget: ".d-focus-target",
			moveBtnContain: ".d-move-btn",
			cursorTarget: ".d-content img",
			loading: ".d-loading",
			totalPageField: ".d-total-page",
			currentPageField: ".d-current-page",
			nextBtn: ".d-next",
			prevBtn: ".d-prev"
		},
        
        events: {},

        /**
         * 생성자
         * @param el
         * @param options
         */
        initialize: function(el, options) {
        	if( this.callParent(el, options) === false ) { return; }
        	this.ad;
        	this.map;
        	this.currentIndex;
        	this.totalPage = this.$container.length;
        	this.$totalPageField.html(this.totalPage*this.options.compositionPage);
        	this.contentAry = [];
        	this.isDisable = false;
        	this._setContent(0);
        	this._bindNewspaperAdEvent();
        },
        
        /**
         * Zoomer, Map 객체 생성
		 */
        _createContents: function( $contain ){
        	var obj = {};
			obj.ad = new ui.NewspaperAD.Zoomer( $contain, {
											selectors:{
												content: this.selectors.content,
												cursorTarget: this.selectors.cursorTarget
											},
											
											noneClass:"none",
											moveDist: this.options.moveDist,
											step: this.options.expandStep
										});
			
				
			obj.ad.one( core.NewspaperAD.Event.IMAGE_LOADED, $.proxy(function(){
				this._showSelectedContent();
			}, this));

			var imgUrlAry = obj.ad.getImgUrl();		
			obj.map = this.map = new ui.NewspaperAD.Map( $contain.find(this.selectors.map), {
												selectors:{
													focusTarget: this.selectors.focusTarget
												}
											});
			
			obj.map.setImgUrl( imgUrlAry );								
			return obj;		
        },
        
		/** 
		 * 페이지정보 표시
		 * @param {Number} index 페이지 인덱스
		 */
        _setPageData: function(index){
        	if( this.options.compositionPage == 1 ){
        		index++;
        		this.$currentPageField.val(index);	
        	}else{
    			index = (index*this.options.compositionPage)+1;
    			this.$currentPageField.val(index+"~"+(index+1));
        	}
        	
        },
        
		/**
		 * index에 따라 버튼상태를 변경
		 */
        _setPageButton: function( index ){
        	if( this.totalPage == 1 ){
        		this.$prevBtn.addClass(this.options.disableClass);
        		this.$nextBtn.addClass(this.options.disableClass);
        		return;
        	}
        	
        	this.$nextBtn.removeClass(this.options.disableClass);
        	this.$prevBtn.removeClass(this.options.disableClass);
        		
        	if( index == 0 ){
        		this.$prevBtn.addClass(this.options.disableClass);
        	}else if( index == this.totalPage-1 ){
        		this.$nextBtn.addClass(this.options.disableClass);
        	}
        },
        
		/**
		 * index에 해당하는 컨텐츠를 설정
		 * @param {Number} index 인덱스
		 */
        _setContent: function(index){
        	this.isDisable = true;
        	this.currentIndex = index;
        	
        	this._setPageButton( index );
        	var targetCont = this.contentAry[index];
        	if( targetCont == undefined ){
        		targetCont = this.contentAry[index] = this._createContents( this.$container.eq(index) );
        	}
        	        	
        	this.ad = targetCont.ad;
        	this.map = targetCont.map;
        	if( this.ad.getIsLoaded() ){
        		this._showSelectedContent();
        	}else{        		
        		this._showLoading();
        		this.ad.loadImg();
        	}
        	
        	this._bindContentsEvent();
        },
        
		/**
		 * 현재 컨텐츠 이미지를 표시
		 */
        _showSelectedContent: function(){
        	this._hideLoading();
        	this.ad.initContent();
        	this.map.initContent();
        	this._setPageData(this.currentIndex);
        	var $target = this.$container.eq(this.currentIndex);
        	var $siblings = this.$container.not($target);
        	
        	$target.addClass(this.options.highDepthClass).removeClass(this.options.noneClass).css("opacity", 0)
        	.stop().animate({"opacity":1}, 500, $.proxy(function(){
        		this.isDisable = false;
        		$siblings.addClass(this.options.noneClass);
        		$target.removeClass(this.options.highDepthClass);
        	},this));
        },
        
		/**
		 * 로딩이미지 표시
		 */
        _showLoading: function(){
        	this.$loading.removeClass(this.options.noneClass);
        },
        
		/** 
		 * 로딩이미지 숨김
		 */
        _hideLoading: function(){
        	this.$loading.addClass(this.options.noneClass);
        },
        
		/**
		 * 이벤트 바인딩
		 */
        _bindNewspaperAdEvent: function(){
        	var me = this;

			// 다음 버튼
        	this.$el.on( "click", this.selectors.nextBtn, function(e){
        		e.preventDefault();
        		if( me.isDisable || (me.currentIndex+1)>=me.totalPage ){ return }
        		me._setContent(  me.currentIndex+1 );
        	});
        	
			// 이전 버튼
        	this.$el.on( "click", this.selectors.prevBtn, function(e){
        		e.preventDefault();
        		if( me.isDisable || me.currentIndex <= 0){ return }
        		me._setContent( me.currentIndex-1 );
        	});
        	
			//확대 버튼
        	this.$el.on( "click", this.selectors.plusButton, function(){
        		me.ad.zoomIn();
        	});
        	
			// 축소 버튼
        	this.$el.on( "click", this.selectors.minusButton, function(){
        		me.ad.zoomOut();
        	});
        	
        	/////
        	///// 좌로 이동
        	this.$moveBtnContain.on("click", ".d-left", function(){
        		me.ad.moveLeft();
        	});
        	
			// 우로 이동
        	this.$moveBtnContain.on("click", ".d-right", function(){
        		me.ad.moveRight();
        	});
        	
			// 위로 이동
        	this.$moveBtnContain.on("click", ".d-top", function(){
        		me.ad.moveTop();
        	});
        	
			// 아래로 이동
        	this.$moveBtnContain.on("click", ".d-bottom", function(){
        		me.ad.moveBottom();
        	});
        	
        	var intervalID;
        	var intervalTime = 250;
			// 누르고 있으면 계속 이동되도록...
        	this.$moveBtnContain.on("mousedown", ".d-left", function(){
        		clearInterval(intervalID);
        		intervalID = setInterval(function(){
        			me.ad.moveLeft();	
        		}, intervalTime );
        	});
        	
			// 누르고 있으면 계속 이동되도록...
        	this.$moveBtnContain.on("mousedown", ".d-right", function(){
        		clearInterval(intervalID);
        		intervalID = setInterval(function(){
        			me.ad.moveRight();	
        		}, intervalTime );
        	});
        	
			// 누르고 있으면 계속 이동되도록...
        	this.$moveBtnContain.on("mousedown", ".d-top", function(){
        		clearInterval(intervalID);
        		intervalID = setInterval(function(){
        			me.ad.moveTop();	
        		}, intervalTime );
        	});
        	
			// 누르고 있으면 계속 이동되도록...
        	this.$moveBtnContain.on("mousedown", ".d-bottom", function(){
        		clearInterval(intervalID);
        		intervalID = setInterval(function(){
        			me.ad.moveBottom();	
        		}, intervalTime );
        	});
        	
        	$doc.on("mouseup", function(){
        		clearInterval(intervalID);
        	});

			// 페이지를 입력했을 때 해당페이지로 이동
			this.$currentPageField.on('keyup', function(e) {
				if(e.which === 13) {
					if(!me.isDisable && /^[1-9][0-9]*$/.test(this.value)){
						var index = parseInt(this.value, 10);
						if(me.options.compositionPage === 2){
							index = Math.ceil(index / 2);
						}
						
						index = index - 1;
						if(index >= 0 && index < me.totalPage){
							me._setContent(index);	
							return;
						}
					}
					alert('페이지를 잘못 입력하셨습니다.');
					me._setPageData(me.currentIndex);
				}
			});
        	/////
        	
        },
        
		/**
		 * 축소판 <-> 이미지 컨텐츠 상호간에 어떤 액션이 발생했을 때 이미지컨텐츠에 액션에 따른 동기화처리를 해준다.
		 */
        _bindContentsEvent:function(){
        	if( this.map ){
        		this.map.off(core.NewspaperAD.Event.CLOSE );
        		this.map.off(core.NewspaperAD.Event.CHANGE );
        		this.ad.off(core.NewspaperAD.Event.CHANGE);
        		this.ad.off( core.NewspaperAD.Event.STEP_CHANGE );
        	}
        	
        	var me = this;
			// 축소판을 닫을 때, 이미지를 원래대로 되돌린다.
        	this.map.on(core.NewspaperAD.Event.CLOSE, function(e, data){
        		me.ad.initContent();
        	});
        	
			// 축소판에서 초점이 이동했을 때 이미지도 초점을 이동시켜 준다.
        	this.map.on(core.NewspaperAD.Event.CHANGE, function(e, data){
        		me.ad.setPosition(data);
        	});
        	
			// 이미지에서 초점이 이동했을 때 축소판도 초점을 이동시켜 준다.
        	this.ad.on(core.NewspaperAD.Event.CHANGE, function(e, data){
				me.map.setPosition(data);
        	});
        	
			// 이미지에서 축소 및 확대했을 때 축소판도 그에 따라 표현시킨다.
        	this.ad.on(core.NewspaperAD.Event.STEP_CHANGE, function(e, data){
        		var step = data.step
        		var stepCount = data.stepCount;
        		me.$minusButton.removeClass(me.options.disableClass);
        		me.$plusButton.removeClass(me.options.disableClass);
        		
        		
        		if( step == 0 ){
        			me.$minusButton.addClass(me.options.disableClass);
        			me.map.getElement().addClass(me.options.noneClass);
					me.$moveBtnContain.addClass(me.options.noneClass);	
        		}else{
        			me.map.getElement().removeClass(me.options.noneClass);
					me.$moveBtnContain.removeClass(me.options.noneClass);
					if( step == stepCount-1 ){
						me.$plusButton.addClass(me.options.disableClass);
					}
        		}
        	});
        	
        }
    });
    
})(jQuery, window.emart, window.emart.ui);
