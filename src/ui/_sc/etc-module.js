/*!
 * @author 
 * @email dududu1@vi-nyl.com
 * @create 2016-06-03
 * @license MIT License
 */
(function ($, core, undefined) {
	"use strict";

	var $win = $(window),
		browser = core.browser,
		isMobile = browser.isMobile,
		css3 = core.css3;
	

    var browserPrefix = "";            
    var usrAg = navigator.userAgent;
        
    if(usrAg.indexOf('Chrome') > -1 || usrAg.indexOf('Safari') > -1 ){
        browserPrefix = "-webkit-";
    }else if(usrAg.indexOf('Opera') > -1){
        browserPrefix = "-o-";
    }else if(usrAg.indexOf('Firefox') > -1){
        browserPrefix = "-moz-";
    }else if(usrAg.indexOf('MSIE') > -1){
        browserPrefix = "-ms-";
    }
            

	/**
	 * @class
	 * @name 
	 * @description 
	 * @extends 
	 */
	var FinanceHover = core.ui('FinanceHover', {
		bindjQuery: 'financeHover',
		$statics: {
		},
		defaults: {
		},
		selectors: {
		},
		/**
		 * 생성자
		 * @param el
		 * @param options
		 */		
		
		initialize: function(el, options) {
		    
			var me = this;
			if(me.supr(el, options) === false) { return me.release(); }
			
			me.$child = me.options.childs || me.$el.children();			
			me.$activeSel = me.options.activeSel;
			me.nowIndex;			
			me._init();
			me._bind();
				
		},

		_init: function () {
			var me = this;			
						
            me.$child.each(function(index, e){                                     
                $(e).addClass('nohover');                                                               
            });            
		},
		
		_bind:function(){
		    
		    var me = this;
		    
		    me.$child.find('a').on('click',function(e){                    
                    
                var $parent = $(e.currentTarget).parent();
                var idx = me.$child.index(e.currentTarget.parentElement);                
                                    
                if ( $parent.find(me.$activeSel).length > 0){                     
                    e.preventDefault();     
                    //me._selectItem($parent.index());                        
                    me._selectItem(idx);          
                }   
            });
		    
		},
		
        _selectItem:function(idx){      
                          
            var me = this;            
            me.$child.each(function(index, e){ 
                                                       
                if(index != idx) $(e).removeClass('active');
                else $(e).addClass('active');   
                
                if(idx==-1) $(e).addClass('nohover');   
                me.nowIndex = idx;                                     
            });             
        }
                
    });
    
	if (typeof define === "function" && define.amd) {
		define([], function() {
			return FinanceHover;
		});
	}
	
	/**
     * @class
     * @name 
     * @description 
     * @extends 
     */
    var FCEventBanner = core.ui('FCEventBanner', {
        bindjQuery: 'fcEventBanner',
        $statics: {
        },
        defaults: {
           rollingTime:5000,
           distance: 20,
           imgDist:30,
           selectIndex:0,
           imgTop : -41,
           aniTime : 300,
           linkName:'>a .ico_link',
           imgName:'>a .img'
        },
        selectors: {    
            prevSel:$('.btn_wrap > .prev'),
            nextSel:$('.btn_wrap > .next')
                            
        },
        /**
         * 생성자
         * @param el
         * @param options
         */     
        
        initialize: function(el, options) {
            
            var me = this;
            if(me.supr(el, options) === false) { return me.release(); }
            
            me.$child = me.$el.children();
            
            me.selectIndex = me.options.selectIndex;
            me.distance = me.options.distance;
            me.imgDist = me.options.imgDist;
            me.rollingTime = me.options.rollingTime;            
            me.maxIndex = me.$child.length;
            me.imgName = me.options.imgName;
            me.linkName = me.options.linkName;
            me.imgTop = me.options.imgTop;
            me.aniTime = me.options.aniTime;
            
            me.timer = null;                        
                      
            me._init();
            me._bind();   
            me._selectItem({'idx' : me.selectIndex, direct : 'none'});      
        },

        _init: function () {
            
            var me = this;    
            var idx = -1;      
             
            
            me.$child.each(function(index, e){
                var on = $(e).attr('data-selected');
                if(on =='on'){
                    idx = index;
                    return false;
                }   
            });   
            
            me.selectIndex = (idx == -1)? 0: idx;
                          
        },
        
        _bind:function(){
            
            var me = this;            
            
            if(me.maxIndex > 1){     
                
                me.$prevSel.show();
                me.$nextSel.show();        
                            
                me.$prevSel.on('click',function(e){   
                    e.preventDefault();             
                    var idx = me.selectIndex -1;
                    if(idx < 0) idx = me.maxIndex - 1;                               
                    me._selectItem({'idx' : idx, direct : 'prev'});
                });
                
                me.$nextSel.on('click',function(e){              
                    e.preventDefault();         
                    var idx = me.selectIndex +1;
                    if(idx > me.maxIndex -1) idx = 0;                         
                    me._selectItem({'idx' : idx, direct : 'next'});             
                    
                });
                
                
                me.$child.find('> a').on('mouseenter mouseleave focusin focusout', function(e){
                    
                    if(e.type =='mouseenter' || e.type =='focusin'){
                        clearTimeout(me.timer);                 
                    } else if (e.type =='mouseleave' || e.type =='focusout'){
                        me._rollingTimer(me.rollingTime);
                    } 
                });
                
                me._rollingTimer(me.rollingTime);
                
            }else{
                me.$prevSel.hide();
                me.$nextSel.hide();
            }
            
        },
        
        _selectItem:function(obj){      
                          
            var me = this;                 
            var sIdx = obj.idx; 
            var direct = 0;
                
            if(obj.direct=='next') direct = 1;
            else if(obj.direct=='prev') direct = -1;
                
            if ( sIdx == me.selectIndex && direct!=0) return;
            
            var isMotion = direct==0? false:true;  
                
            me.$child.each(function(index, e){
                    
                var $target = $(e);
                var $link = $target.find(me.linkName);   
                var $img = $target.find(me.imgName); 
                    
                if (sIdx != index){                     
                        
                    if(isMotion) {                          
                        $link.clearQueue().stop().animate({
                            opacity:0,
                            top:-direct*me.distance
                            },me.aniTime,function(){                           
                                $link.css('visibility','hidden');   
                                $target.attr('data-selected', '');  
                                $target.css('visibility','hidden');                                                     
                        });
                        
                        $img.clearQueue().stop().animate({
                            opacity:0,
                            top:me.imgTop-direct*me.imgDist
                            },me.aniTime,function(){                           
                                $img.css('visibility','hidden');                                                            
                        });
                        
                        
                    }else{
                        $link.css({ 'visibility':'hidden', 'opacity':0, 'top':-direct*me.distance, 'left':0});
                        $img.css({'top':me.imgTop, 'opacity':0, 'visibility':'hidden'});
                        $target.attr('data-selected', '');
                    }
                            
                }else{
                    
                    if(isMotion){
                        
                        $target.css({'visibility':'visible'});  
                        $link.css({'top':direct*me.distance, 'left':0, 'visibility':'visible'});
                        $img.css({'top':direct*me.imgDist + me.imgTop, 'visibility':'visible'}); 
                    
                        $link.clearQueue().stop().animate({
                            opacity:1,
                            top:0
                            },me.aniTime,function(){   
                                $target.attr('data-selected', 'on');  
                                me._rollingTimer(me.rollingTime);                                  
                        });
                        
                        $img.clearQueue().stop().animate({
                            opacity:1,
                            top:me.imgTop
                            },me.aniTime,function(){                                       
                        });
                        
                    }else{
                        $link.css({'opacity':1, 'top':0, 'left':0, 'visibility':'visible'});    
                        $img.css({'top':me.imgTop, 'opacity':1, 'visibility':'visible'});
                        $target.attr('data-selected', 'on');  
                        me._rollingTimer(me.rollingTime);            
                    }                       
                }                   
             });
                
            me.selectIndex = sIdx;
                
                     
        },
        
        _rollingTimer:function(delayTime){
            
                var me = this; 
                var idx = null;
                
                clearTimeout(me.timer);
                me.timer = null;
                me.timer = setTimeout(function(){                
                    
                    idx = (me.selectIndex + 1 > me.maxIndex-1) ? 0 : me.selectIndex+ 1;                    
                    me._selectItem({'idx' : idx, direct : 'next'});                    
                    me._rollingTimer(me.rollingTime);
                    
                }, delayTime);
            }
                
    });
    
    if (typeof define === "function" && define.amd) {
        define([], function() {
            return FCEventBanner;
        });
    }
    

    var FixedElement = core.ui('FixedElement', {
        bindjQuery: 'fixedElement',
        $statics: {
        },
        defaults: {
            fixedEnabled : true,
            topPadding : 0,
            fixedItemHeight:-1
        },
        selectors: {            
            header : $('#htop')         
        },

        
        initialize: function(el, options) {
            
            var me = this;
            if(me.supr(el, options) === false) { return me.release(); }            
            
            me.paddingClass = me.options.paddingClass || ''; 
            me.fixedEnabled = me.options.fixedEnabled; 
            me.topPadding = me.options.topPadding || 0;
            me.fixedItemHeight = me.options.fixedItemHeight;
                        
            me.isFixed = false;  
            me.bindEvent(); 
            
        },

        
        bindEvent:function(){         
            
            var me = this,
                $body = $('body'),
                resizeCallback, scrollCallback;

            $win.on('resize.' + me.cid, resizeCallback = function (e) {
                
                var top = $win.scrollTop();
                me.toggleFixed(top);                
                me.triggerHandler('resize.' + me.cid);                
                
            }).on('scroll.' + me.cid, scrollCallback = function (e) {
                
                if ($body.hasClass('opened_header')) { return; }
                me.toggleFixed($win.scrollTop(), false);                    
                me.triggerHandler('scroll.' + me.cid);                  
                
            }).on('changemediasize.' + me.cid, function (e) {            
                me.triggerHandler('changemediasize.' + me.cid);                
            });
                        
            me.calcPos();
            resizeCallback();
            scrollCallback();
            
        },

        toggleFixed: function (top, isForce) {    
                           
            var me = this;    
            if(!me.fixedEnabled) return;         
               
            if (top >= me.elTop - me.topOffset) {                
                 
                if (!me.isFixed || isForce) { // fixed 가 안돼있을 때만 fixed 설정(리플로우 최소화).
                    me.isFixed = true;                      
                    me.calcPos();                        
                    if(me.$opponent != undefined) me.$opponent.addClass(me.paddingClass);                    
                    me.$el.css({position: 'fixed', top: me.topOffset + 'px'});                     
                    me.$el.addClass('fixed');                                                             
                }
                
                me.triggerHandler('fixedchange.'+ me.cid, {'isFixed' : me.isFixed});
               
            } else {                
                
                if (me.isFixed || isForce) { // fixed 가 돼있을 때만 fixed 해제(리플로우 최소화)
                    
                    me.isFixed = false;                    
                    if(me.$opponent != undefined) me.$opponent.removeClass(me.paddingClass);
                    me.$el.css({position: '', top: ''});   
                    me.$el.removeClass('fixed');                    
                    
                }     
                me.triggerHandler('fixedchange.'+ me.cid, {'isFixed' : me.isFixed});           
            }
        },
        
        calcPos: function () {                   
            
            var me = this;
            me.elTop = me.$el.offset().top;    
            me.topOffset = me.$header.height() + (parseInt(me.$header.css('top'), 10) || 0) + me.topPadding;             
            me.totalOffset = me.topOffset + ((me.fixedItemHeight>0)? me.fixedItemHeight : me.$el.height());                         
                         
        }     
        
            
           
    });
    
    if (typeof define === "function" && define.amd) {
        define([], function() {
            return FixedElement;
        });
    }
    
    
    var FixedCardFinder = core.ui('FixedCardFinder', 'FixedElement',{
        bindjQuery: 'fixedCardFinder',
        $statics: {
        },
        defaults: {
            paddingClass:'floating'
        },
        selectors: {
            opponent : $('.benefit_box_new'),
            checkbox:'.ui_category_box .ui_checkbox',
            radiobox:' .ui_category_box .ui_radiobox',
            bopponent : $('.delegate')
            
        },
        
        initialize: function(el, options) {
            
            var me = this;
            if(me.supr(el, options) === false) { return me.release(); }  
            me._bind();   
                
        },
        
    
        // 상속관련 가이드
        //this.supr(); 
        //this.suprMethod('funcName'); 
             
        
        _bind:function(){
            
            var me = this,
                $body = $('body'),
                resizeCallback, scrollCallback;

            me.$el.on('resize.'+ me.cid, resizeCallback = function (e) {     
                         
                me._posFixedY();
                
            }).on('scroll.' + me.cid, scrollCallback = function (e) {
                
                                    
            }).on('fixedchange.'+ me.cid, function(e, obj){                
                me._toggleFixed($win.scrollTop(), obj.isFixed);   
                         
            });            
            
            me.$checkbox.on('change', function(e){
                
                me.$el.triggerHandler('checkboxChange');
                
            });
            
            me.$radiobox.on('change', function(e){
                
                me.$el.triggerHandler('radioboxChange');                
                
            });            
            
           resizeCallback();
            
            
        },
        
        _toggleFixed: function (top, flag) {   
            
            var me = this;     
            if(!me.fixedEnabled) return;      
               
            if (flag) {
                               
                if ( me.bOffset <= top + me.bottomOffset){                                
                    me.$el.css({top: me.bOffset - (top + me.bottomOffset - me.topPadding) + 'px'});                    
                }else{                
                    me.$el.css({top: me.topOffset + 'px'});
                }
                
                
            }
        },
        
        _posFixedY: function () {
                        
            var me = this;    
            if(!me.fixedEnabled) return;       
              
            me.bOffset = me.$bopponent[0].getBoundingClientRect().top + $win.scrollTop();
            me.bottomOffset = me.$el.height() + me.topOffset;     
             
            me.$el.css({ left: me.$opponent.offset().left +'px' });                      
            
        },
        
        getCheckedList : function(){
            
            var me = this;            
            var arr = [];
                             
            me.$checkbox.each(function(idx, target){                
                if($(target).find('input').attr('checked')=='checked'){
                    
                    //console.log($(target).parent().parent()[0]);
                    arr.push(target);                        
                };
            });
            
            me.$radiobox.each(function(idx, target){                
                if($(target).find('input').attr('checked')=='checked'){
                    
                    //console.log($(target).parent().parent()[0]);
                    arr.push(target);                        
                };
            });
            
            return arr;
            
        },
        
        allChecked : function(flag, evtFlag){
            
            var me = this;            
            var $items = me.$checkbox.children();    
            $items.each(function(idx, target){      
                $(target).checked(flag, evtFlag);     
                
            });
        },
        
        refresh : function(){
            var me = this;
            var top = $win.scrollTop();            
            me.suprMethod('calcPos');            
            me._posFixedY();         

        }
             
           
    });
    
    if (typeof define === "function" && define.amd) {
        define([], function() {
            return FixedCardFinder;
        });
    }
    
    /// main 관련 스크립트
    
    
    var FixedContentsArea = core.ui('FixedContentsArea', 'FixedElement',{
        bindjQuery: 'fixedContentsArea',
        $statics: {
        },
        defaults: {
            paddingClass:'',
            startPos:-1,            
            itemGap : -20 
        },
        selectors: {
            opponent : '',
            bopponent : '',
            links : '.ui_anchor',
            targets: $('.module_box')
        },
        
        initialize: function(el, options) {
            
            var me = this;
            if(me.supr(el, options) === false) { return me.release(); }              
            
            me.startPos = me.options.startPos;
            me.itemGap = me.options.itemGap;
            me._bind();               
                
        },
        
    
        // 상속관련 가이드
        //this.supr(); 
        //this.suprMethod('funcName'); 
             
        
        _bind:function(){
            
            var me = this,
                $body = $('body'),
                resizeCallback, scrollCallback;

            me.$el.on('resize.'+ me.cid, resizeCallback = function (e) {     
                         
                me._posFixedY();
                me._calcPos();
                
            }).on('scroll.' + me.cid, scrollCallback = function (e) {
                
                if ($body.hasClass('opened_header')) return;
                me._activeLink($win.scrollTop()); 
                me._getAreaElement($win.scrollTop(), false);   
                                        
                                    
            }).on('fixedchange.'+ me.cid, function(e, obj){      
                       
                me._toggleFixed($win.scrollTop(), obj.isFixed);   
                         
            });        
            
            
            // 링크클릭시
            me.$links.on('click', function (e) {
                
                e.preventDefault();    
                
                me.$targets.each(function(i, item){
               
                   $(item).attr('data-on', true);                   
                   $(item).css('opacity',1);            
                   $(item).css(browserPrefix + 'transform', 'translateY(0px)');  
                   
               });           
                
                me.selectIndex = $(this).index();                  
                me._calcPos();    
                me._activeLink($win.scrollTop());                 
                var py = me.linksPos[me.selectIndex].start;                           
                                        
                $('html, body').animate({'scrollTop': py - me.totalOffset}, 'easeOutQuad');                
                
            });    
            
           me.selectIndex = 0;  
           resizeCallback();            
           me._getAreaElement($win.scrollTop(), true);
           
                    
                                   
           me.$targets.each(function(i, item){
               
               if(!$(item).attr('data-on')){
                   $(item).css('opacity',0);            
                   $(item).css(browserPrefix + 'transform', 'translateY(80px)');  
               }               
           });           
            
           scrollCallback();          
            
        },
        
        _toggleFixed: function (top, flag) {   
            
            var me = this;         
               
            if (flag) {
                               
                if ( me.bOffset <= top + me.bottomOffset){                                
                    me.$el.css({top: me.bOffset - (top + me.bottomOffset - me.topPadding) + 'px'});                    
                }else{                
                    me.$el.css({top: me.topOffset + 'px'});
                }
                
                
            }
        },
        
        _posFixedY: function () {
                        
            var me = this;             
            
            //me.bOffset = me.$bopponent[0].getBoundingClientRect().top + $win.scrollTop();
            //me.bottomOffset = me.$el.height() + me.topOffset;                  
            //me.$el.css({ left: me.$opponent.offset().left +'px' });            
            //console.log('// '+me.$bopponent[0].getBoundingClientRect().top) ;   
            
        },
        
        
        _getAreaElement: function (top, flag) {
            
            var me = this;        
            
            var originTop = top;
            top = top + me.totalOffset + 1;
            
            for (var i = 0; i < me.linksPos.length; i++) {                
               
                if ( (originTop + $win.height()) > (me.linksPos[i].start) + 200) {        
                    
                    if (flag){
                        me.$targets.eq(i).attr('data-on', true);
                    }else{
                        
                        if (!me.$targets.eq(i).attr('data-on')){      
                            me.triggerHandler('areachange.'+ me.cid, {'idx' : i});                             
                        }
                    } 
                }
            }           
            
        },
        
        _activeLink: function (top) {
            
            var me = this;            
                        
            var originTop = top;            
            top = top + me.totalOffset + 1; 
            
            var arr = [];               
            
            for (var i = 0; i < me.$links.length; i++) {
                
                if ((originTop + $win.height()) == $('#wrap').outerHeight(true)) {                    
                    if (me.linksPos[i].start >= top && (top + $win.height() - me.totalOffset) > (me.linksPos[i].end)) {                                                                          
                        arr.push(i);               
                    }                     
                }                 
            }                 
            
            if(arr.length>0){
                
                var idx = core.array.indexOf(arr, me.selectIndex);
                idx = idx>-1? idx:0;                
                me.$links.not(me.$links.eq(arr[idx]).addClass('on')).removeClass('on');                                     
               
            }else{
                
                for (var i = 0; i < me.$links.length; i++) {
                
                    if (me.linksPos[i].start <= top && top < me.linksPos[i].end) {                                                
                        me.$links.not(me.$links.eq(i).addClass('on')).removeClass('on'); 
                        break;                    
                    }               
                }
            }                          
            
        },
        
        _calcPos: function () {     
            
           var me = this;      
           me.linksPos = [];                      
            
           var minVal = {start:Infinity, index:-1};
           
            me.$targets.each(function (idx) {
                
                var $el = $(this),
                    start = $el.offset().top + me.itemGap;
                                        
                if(minVal.start > start){
                    minVal.start  = start;
                    minVal.index  = idx;                        
                }                     
                me.linksPos.push({
                    start: start,
                    end: start + $el.outerHeight(true)
                });    
                                                    
            });
                        
            if(me.startPos > -1){           
                if(minVal.index > -1) {
                    me.linksPos[minVal.index].start = me.startPos;
                }
            }              
                         
        }
             
           
    });
    
    if (typeof define === "function" && define.amd) {
        define([], function() {
            return FixedContentsArea;
        });
    }
    
    
    
    //Banner ////////////////////////////////////////////////////////////////////////////////
    /**
     * @class
     * @name 
     * @description 
     * @extends 
     */
    var PromotionBanner = core.ui('PromotionBanner', {
        bindjQuery: 'promotionBanner',
        $statics: {
            ON_BANNER_CHANGED: 'promotionBannerChange'
        },
        defaults: {
            easing: 'easeInOutQuad',  //160411 수정
            rollingTime: 5000,
            slideTime: 1000, 
            isAutoRolling: true,
            buttonType: 'always',    // always(무한 롤링용), none
            buttonPosition: 'content',  // content는 배너 영역, image는 이미지 영역. 기타(css)는 퍼블리싱에서 지정된 위치
            selectedIndex: 0,
            removeClass: '',
            directType:'left',
            isGesture:false,
            fixHeight:-1,
            animationType:'fadeInOut'
        },
        selectors: {
            content: '.ui_single_banner_content',
            btnPrev: '.ui_single_banner_prev',
            btnNext: '.ui_single_banner_next',
            indi: '.ui_single_banner_indi',
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
            
            me.animationType = me.options.animationType;

            me.maxCount = me.$li.size() - 1;
            me.timer = null;
            me.isAuto = (me.maxCount === 0) ? false : me.options.isAutoRolling;
            me.isRolling = (me.maxCount === 0) ? false : me.options.isAutoRolling;
            me.isAnimation = true;
            me.isPlay = true;
            me.directType = me.options.directType;
            me.isGesture = me.options.isGesture;
            
            
            me.$ul.css('width', '100%');            
            me.setContent();    
            me.$el.css('visibility', '');          

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
                
                //me.$li.stop(true, true).css({'position' : 'absolute', 'top' : '0px'});
                
            });
            me.fnc();
        },

        _bind: function () {
            
            var me = this;
            var directType = me.directType;
            var isGesture = me.isGesture;            
            
            me.$el.on('mouseenter mouseleave focusin focusout', function (e) {
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

            
            me.$indi.on('click.' + me.cid, '> .btn_indi', function (e) {
                e.preventDefault();
                                
                var setIndex = me.$indi.find('> .btn_indi').index($(this));                
                
                if (me.isAnimation && setIndex !== me.nowIndex) {
                    me.isAnimation = false;
                    me.newIndex = setIndex;                                        
                    me.$li.css('left', '-300%').eq(me.nowIndex).css('left', '0%').end().eq(me.newIndex).css('left', (me.newIndex < me.nowIndex)? '-100%':'100%');
                    me.selectContent(me.newIndex, (me.newIndex < me.nowIndex)? 'PREV' : 'NEXT');                    
                }
            });

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
                
                if (me.isAnimation) {                   
                    me.isAnimation = false;
                    me.newIndex = (me.nowIndex + 1 > me.maxCount) ? 0 : me.nowIndex + 1;
                    
                    me.$li.css(directType, '-300%').eq(me.nowIndex).css(directType, '0%').end().eq(me.newIndex).css(directType, '100%');
                    me.selectContent(me.newIndex, 'NEXT'); 
                }
            });                
           
            me.$autoButton && me.$autoButton.on('click', function () {
                $(this).hasClass('stop') ? $(this).replaceClass('stop', 'play').find('span.hide').html('자동 롤링 시작하기')  : $(this).replaceClass('play', 'stop').find('span.hide').html('자동 롤링 멉추기');
                me.setRolling({'isPlay': $(this).hasClass('stop'), 'isTab': false});
            });
            
            
            if(!isGesture) return;   
            
            me.$el.swipeGesture().on('swipegesturestart swipegestureup swipegesturedown swipegestureleft swipegestureright swipegesturemove swipegestureend swipegesturecancel', function (e, data) {

                var distance;
                var distanceGap;              
                
                e.stopPropagation();
                e.preventDefault();             
                
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

                }else if(e.type === 'swipegesturemove'){
                    me.isAnimation = false; 
                    
                    if(me.$ul.find('li:animated').length>0){
                        me.isAnimation = true; 
                        return false;   
                    } 
                    
                    distance = data.diff.x;
                    distanceGap = me.$content.width();
                    
                    if(Math.abs(distance) >= distanceGap){
                        me.isAnimation = true;
                        return false;
                    }

                    me.$li.eq(me.nowIndex).css(directType, distance + 'px');
                    
                    var conW = Number(me.$li.eq(me.nowIndex).width());
                    
                    if(distance >0){
                        if(me.nowIndex == 0){
                            me.$li.eq(me.maxCount).css(directType , -conW + me.$li.eq(me.nowIndex).position()[directType] + 'px');
                            me.$li.eq(me.maxCount).css({'display':'','visibility':''});
                            
                            if(me.maxCount > 1){
                                me.$li.eq(me.nowIndex + 1).css(directType , conW + me.$li.eq(me.nowIndex).position()[directType] + 'px');
                                me.$li.eq(me.nowIndex + 1).css({'display':'','visibility':''});
                            }  
                        }else{ 
                            me.$li.eq(me.nowIndex -1).css(directType, -conW + me.$li.eq(me.nowIndex).position()[directType] + 'px');
                            me.$li.eq(me.nowIndex -1).css({'display':'','visibility':''});
                            if(me.maxCount > 1){
                                me.$li.eq(me.nowIndex +1).css(directType, conW + me.$li.eq(me.nowIndex).position()[directType] + 'px');
                                me.$li.eq(me.nowIndex +1).css({'display':'','visibility':''});
                            }                   
                        }
                        
                    }else{
                        
                        if(me.nowIndex == me.maxCount){
                            me.$li.eq(0).css(directType, conW + me.$li.eq(me.nowIndex).position()[directType] + 'px');
                            me.$li.eq(0).css({'display':'','visibility':''});
                            if(me.maxCount > 1){
                                me.$li.eq(me.nowIndex -1).css(directType, -conW + me.$li.eq(me.nowIndex).position()[directType] + 'px');
                                me.$li.eq(me.nowIndex -1).css({'display':'','visibility':''});
                            } 
                            
                        }else{ 
                            
                                        
                            me.$li.eq(me.nowIndex + 1).css(directType, conW + me.$li.eq(me.nowIndex).position()[directType] + 'px');
                            me.$li.eq(me.nowIndex + 1).css({'display':'','visibility':''});
                            if(me.maxCount > 1){
                                me.$li.eq(me.nowIndex -1).css(directType, -conW + me.$li.eq(me.nowIndex).position()[directType] + 'px');
                                me.$li.eq(me.nowIndex -1).css({'display':'','visibility':''});
                            } 
                        }
                    }
                    
                    me.isAnimation = true;
                    //160425 슬라이더 오류 수정 끝

                }else if(e.type === 'swipegesturecancel'){

                    distance = data.diff.x;
                    
                    if(distance >0){
                        if(me.nowIndex == 0){
                            me.$li.eq(me.maxCount).animate({'left': -100 + '%', 'visibility':'', 'display':''}, 500);
                        }else{ 
                           me.$li.eq(me.nowIndex -1).animate({'left': -100 + '%', 'visibility':'', 'display':''}, 500);
                            
                        }
                    }else{
                        if(me.nowIndex == me.maxCount){
                            me.$li.eq(0).animate({'left': 100 + '%', 'visibility':'', 'display':''}, 500);                            
                        }else{ 
                            me.$li.eq(me.nowIndex + 1).animate({'left': 100 + '%', 'visibility':'', 'display':''}, 500);                            
                        }
                    }
                    
                    me.$li.eq(me.nowIndex).animate({'left': 0 + '%', 'visibility':'', 'display':''}, 500);

                    //me.isPlay = true;
                }else if(e.type === "swipegestureend"){
                    me.isAnimation = true;
                }
                //160411 추가 끝

            });
            
        },

        
        setContent: function() {
            
            var me = this;
            var directType = me.directType;

            me.nowIndex = (me.options.selectedIndex === 'last') ? me.maxCount : me.options.selectedIndex;
            me.leftPosition = 0;

            var heights = [];
            me.$li.each(function () {
                heights.push($(this).height());
            });
            me.$content.css({'height': me.fixHeight > 0? me.fixHeight : scui.array.max(heights)});            
            
            
            me.$li.stop(true, true).css({'position' : 'absolute', 'top' : '0px', 'left' : '-300%'}).eq(me.nowIndex).css({'left': '0%'});
            
            me.$indi.find('.indi').removeClass('on').eq(me.nowIndex).addClass('on');
            me.$li.eq(me.nowIndex).css({'visibility':'', 'display':''}).siblings().css({'visibility':'hidden', 'display':'none'});
            me._setButton();
            
            //160411 추가
            me.$li.each(function(){
                $(this).css(directType, ($(this).index() - me.nowIndex) * 100 +'%');                    
            });            

            if(me.nowIndex == 0){
                me.$li.eq(me.maxCount).css(directType, me.maxCount>1 ? '-100%' : '100%'); 
            }

            if(me.nowIndex == me.maxCount){
                me.$li.eq(0).css(directType, '100%');       
            }
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
    
            me.$indi.find('.btn_indi').removeClass('on').eq(me.newIndex).addClass('on');
            //me.$li.css('visibility', ''); //find(':focusable').attr('tabindex', -1);

            aniTime = me.$li.eq(me.newIndex).width() * 0.5;
            aniTime = aniTime != me.options.slideTime? me.options.slideTime : aniTime;
            aniTime = _isDrag? 100 : aniTime;
            
            //console.log(aniTime);
            
            
            me.$el.trigger('slidebefore', {'parentIndex': parentIndex, 'index': me.newIndex, 'aniTime': aniTime, 'direction': direction, 'isDrag':_isDrag});
            
            if(me.$li.eq(me.newIndex).data('indiClass')) me.$indi.removeClass(me.options.removeClass).addClass(me.$li.eq(me.newIndex).data('indiClass'));
            me._transition({'parentIndex': parentIndex, 'index': me.newIndex, 'aniTime': aniTime, 'direction': direction, 'isDrag':_isDrag});
            
            
        },

        _transition: function (data) {
            var me = this,
                time = data.aniTime / 1000;            
            var directType = me.directType;
                        
            //160411 수정
            if (data.direction === 'PREV') {
                me[directType] = 100;
                //me.$li.css({'top': '-300%'}).eq(me.nowIndex).css({'top': '0%'}).end().eq(data.index).css({'top': '-100%'});
            } else {
                me[directType] = -100;
                //me.$li.css({'top': '-300%'}).eq(me.nowIndex).css({'top': '0%'}).end().eq(data.index).css({'top': '100%'});
            }
            
            
            if(me.animationType == 'fadeInOut'){
                
                me.$li.stop(true, true).eq(me.nowIndex).css({'visibility':'visible', 'display':'', 'left':'0%', }).animate({
                opacity : 0
                }, {'duration': data.aniTime, 'easing': me.options.easing}).end().eq(data.index).css({'opacity':0,'visibility':'visible','display':'', 'left':'0%'}).animate({
                    opacity : 1
                }, {'duration': data.aniTime, 'easing': me.options.easing, complete:function () {
                    me.transData = data;
                    me._transitionEnd();
                }});
                
            }else{
                
                me.$li.stop(true, true).eq(me.nowIndex).animate({
                'left' : me[directType] + '%'
                }, {'duration': data.aniTime, 'easing': me.options.easing}).end().eq(data.index).css('visibility', '').animate({
                    'left' : 0 + '%'
                }, {'duration': data.aniTime, 'easing': me.options.easing, complete:function () {
                    me.transData = data;
                    me._transitionEnd();
                }});
                
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
            me.$li.eq(me.nowIndex).siblings().css({'visibility':'hidden', 'display':'none'}); // find(':focusable').removeAttr('tabindex');
            me._setButton(true);
            if (me.isAuto && me.isRolling) me.setTimer();
            me.$el.trigger('slideafter', me.transData);
            
                                    
            //160411 추가
            me.$li.each(function(){
                $(this).css(directType, ($(this).index() - me.nowIndex) * 100 +'%');                        
            });

            if(me.nowIndex == 0){
                me.$li.eq(me.maxCount).css(directType, me.maxCount>1 ? '-100%' : '100%');       // 160516 maxCount 2개일때 오류수정*/
            }

            if(me.nowIndex == me.maxCount){
                me.$li.eq(0).css(directType, '100%');       
            }
            
            me.isAnimation = true; // 160525 추가
        },


        /**
         * 이미지 롤링 시작
         * @param {}
         */
        setRolling: function (data) {
            var me = this;

            me.isRolling = (me.maxCount === 0) ? false : data.isPlay;

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


        update: function () {
            
            var me = this;
            me.updateSelectors();

            me.$ul = me.$content.find('> ul');
            me.$li = me.$ul.find('> li');

            me.nowIndex = 0;
            me.maxCount = me.$li.size() - 1;
            me.timer = null;
            me.isAuto = (me.maxCount === 0) ? false : me.options.isAutoRolling;
            me.isRolling = (me.maxCount === 0) ? false : me.options.isAutoRolling;
            me.isAnimation = true;
            me.isPlay = true;
        }
    });
    ///////////////////////////////////////////////////////////////////////////////////////

    if (typeof define === "function" && define.amd) {
        define([], function() {
            return PromotionBanner;
        });
    }
    
    
    
    /**
     * @class
     * @name 
     * @description 
     * @extends 
     */
    var MainCardPromotion = core.ui('MainCardPromotion', {
        bindjQuery: 'mainCardPromotion',
        $statics: {
        },
        defaults: {
            defaultIdx : 1000,
            elMaxWidth : 405,
            elMinWidth : 148,
            elContentWidth:1134,
            elRadio:0.4,
            infoItemName:'.big_cont',
            startPos:0
        },
        selectors: {    
            cardItems:'li'
                            
        },
        
        initialize: function(el, options) {
            
            var me = this;
            if(me.supr(el, options) === false) { return me.release(); }
            me._init();
            me._bind();     
        },

        _init: function () {
            
            var me = this;    
            var idx = -1;      
             
            me.defaultIdx = me.options.defaultIdx;
            me.radio = me.options.elRadio;
            me.infoItemName = me.options.infoItemName;
            me.startPos = me.options.startPos;
            
            me.maxItemWidth = me.options.elMaxWidth;
            me.elContentWidth = me.options.elContentWidth;
            me.minItemWidth = me.elContentWidth/(me.$cardItems.length);   
            
            me.$cardItems.each(function(index, target){                
                
                $(target).css({'position':'absolute', 'left':(me.minItemWidth*index + me.startPos)+'px'});
                $(target).css(browserPrefix + 'transform-origin', '0');                
                $(target).css(browserPrefix + 'transform', 'scale('+ me.radio +')');                
                $(target).find('.big_cont').css('opacity',0);
                
            });      
            
            me.$el.css('visibility', '');
                          
        },
        
        
        _bind:function(){
            
            var me = this;     
            
            
            me.$cardItems.on('mouseenter mouseleave', 'a', function(e){
                
                e.preventDefault();
                var $target = $(e.currentTarget).parent();               
                             
                if(e.type == 'mouseenter'){
                    me._activeItem($target.index(), true);                    
                }else if(e.type == 'mouseleave'){
                    me._activeItem(me.defaultIdx, true);
                }
            });
            
            me._activeItem(me.defaultIdx, false);             
            
        },
        
        _activeItem:function(idx, isMotion){      
                   
                  
           var me = this; 
           var px = 0, dist = 0;         
           
           var itemW = (idx>900)? me.minItemWidth : (me.elContentWidth - me.maxItemWidth)/(me.$cardItems.length);
           
            me.$cardItems.each(function(index, target){  
                
                if(idx < index) dist = me.maxItemWidth;
                else dist = 0;
                
                px = itemW*index + dist + me.startPos;
               
               if(index == idx){
                   
                   $(target).css('z-index',1);
                   
                   if(isMotion){
                       
                       $(target).find(me.infoItemName).clearQueue().stop().animate({opacity:1}, {
                            step : function(now, fx){                                        
                                var pn = parseFloat(me.radio) + parseFloat(parseFloat(1.0-me.radio)*now);
                                $(target).css(browserPrefix + 'transform','scale('+pn+')');                                                       
                            },
                            duration : 500, easing : 'easeOutQuad'
                        });
                       
                   }else{                       
                       $(target).find(me.infoItemName).clearQueue().stop();
                       $(target).find(me.infoItemName).css('opacity',1);
                       $(target).css(browserPrefix + 'transform','scale(1)');                        
                   }                   
                   
               }else{
                   
                   $(target).css('z-index',0);
                                      
                   if(isMotion){
                       
                       $(target).find(me.infoItemName).clearQueue().stop().animate({opacity:0}, {
                            step : function(now, fx){           
                                
                                var pn = parseFloat(me.radio) + parseFloat(parseFloat(1.0-me.radio)*now); 
                                $(target).css(browserPrefix + 'transform','scale('+pn+')');  
                            },
                            duration : 500, easing : 'easeOutQuad'
                        });
                       
                   }else{
                       $(target).find(me.infoItemName).clearQueue().stop();
                       $(target).find(me.infoItemName).css('opacity',0);
                       $(target).css(browserPrefix + 'transform','scale('+me.radio+')'); 
                   }                       
               }
               
               if(isMotion){
                   
                   $(target).clearQueue().stop().animate({left:px}, {                        
                        duration : 500, easing : 'easeOutQuad'
                    });
                   
               }else{
                   $(target).clearQueue().stop();
                   $(target).css('left', px);
               }               
                 
            });  
                     
        }
                
    });
    
    if (typeof define === "function" && define.amd) {
        define([], function() {
            return MainCardPromotion;
        });
    }
    
    
    
    
    //Banner ////////////////////////////////////////////////////////////////////////////////
    /**
     * @class
     * @name 
     * @description 
     * @extends 
     */
    var FlipMainContents = core.ui('FlipMainContents', {
        bindjQuery: 'FlipMainContents',
        $statics: {
        },
        defaults: {
            easing: 'easeInOutQuad',           
            selectedIndex: 0,
            isAnimation:true
        },
        selectors: {
            content: '.ui_content_container',
            child:'.ui_content_item'
            
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

            me.maxCount = me.$child.size() - 1;
            me.isAnimation = me.options.isAnimation;
            me.setContent();    
            //me.$el.css('visibility', '');          

        },
        
        _bind: function () {
            
            var me = this;  
            
            
            me.$el.swipeGesture().on('swipegesturestart swipegestureup swipegesturedown swipegestureleft swipegestureright swipegesturemove swipegestureend swipegesturecancel', function (e, data) {

                var distance;
                var distanceGap;              
                
                //e.stopPropagation();
                //e.preventDefault();             
                
                if (e.type === 'swipegestureleft' || e.type === 'swipegesturedown'){

                    if (me.isAnimation) {
                        me.isAnimation = false;
                        me.newIndex = (me.nowIndex + 1 > me.maxCount) ? 0 : me.nowIndex + 1;
                        me.selectContent(me.newIndex, 'NEXT', true);
                    }
                } else if (e.type === 'swipegestureright' || e.type === 'swipegestureup'){

                    if (me.isAnimation) {
                        me.isAnimation = false;
                        me.newIndex = (me.nowIndex - 1) < 0 ? me.maxCount : me.nowIndex - 1;
                        me.selectContent(me.newIndex, 'PREV', true); 
                    }

                }else if(e.type === 'swipegesturemove'){
                    me.isAnimation = false;                     
                    
                    distance = data.diff.x;
                    distanceGap = me.$content.width();
                    
                    if(Math.abs(distance) >= distanceGap){
                        me.isAnimation = true;
                        return false;
                    }

                    me.$child.eq(me.nowIndex).css('left', distance + 'px');
                    
                    var conW = Number(me.$child.eq(me.nowIndex).width());
                    
                    if(distance >0){
                        if(me.nowIndex == 0){
                            me.$child.eq(me.maxCount).css('left' , -conW + me.$child.eq(me.nowIndex).position()['left'] + 'px');
                            me.$child.eq(me.maxCount).css({'display':'','visibility':''});
                            
                            if(me.maxCount > 1){
                                me.$child.eq(me.nowIndex + 1).css('left' , conW + me.$child.eq(me.nowIndex).position()['left'] + 'px');
                                me.$child.eq(me.nowIndex + 1).css({'display':'','visibility':''});
                            }  
                        }else{ 
                            me.$child.eq(me.nowIndex -1).css('left', -conW + me.$child.eq(me.nowIndex).position()['left'] + 'px');
                            me.$child.eq(me.nowIndex -1).css({'display':'','visibility':''});
                            if(me.maxCount > 1){
                                me.$child.eq(me.nowIndex +1).css('left', conW + me.$child.eq(me.nowIndex).position()['left'] + 'px');
                                me.$child.eq(me.nowIndex +1).css({'display':'','visibility':''});
                            }                   
                        }
                        
                    }else{
                        
                        if(me.nowIndex == me.maxCount){
                            me.$child.eq(0).css('left', conW + me.$child.eq(me.nowIndex).position()['left'] + 'px');
                            me.$child.eq(0).css({'display':'','visibility':''});
                            if(me.maxCount > 1){
                                me.$child.eq(me.nowIndex -1).css('left', -conW + me.$child.eq(me.nowIndex).position()['left'] + 'px');
                                me.$child.eq(me.nowIndex -1).css({'display':'','visibility':''});
                            } 
                            
                        }else{ 
                            
                                        
                            me.$child.eq(me.nowIndex + 1).css('left', conW + me.$child.eq(me.nowIndex).position()['left'] + 'px');
                            me.$child.eq(me.nowIndex + 1).css({'display':'','visibility':''});
                            if(me.maxCount > 1){
                                me.$child.eq(me.nowIndex -1).css('left', -conW + me.$child.eq(me.nowIndex).position()['left'] + 'px');
                                me.$child.eq(me.nowIndex -1).css({'display':'','visibility':''});
                            } 
                        }
                    }
                    
                    me.isAnimation = true;

                }else if(e.type === 'swipegesturecancel'){

                    distance = data.diff.x;
                    
                    if(distance >0){
                        if(me.nowIndex == 0){
                            me.$child.eq(me.maxCount).animate({'left': -100 + '%', 'visibility':'', 'display':''}, 500);
                        }else{ 
                           me.$child.eq(me.nowIndex -1).animate({'left': -100 + '%', 'visibility':'', 'display':''}, 500);
                            
                        }
                    }else{
                        if(me.nowIndex == me.maxCount){
                            me.$child.eq(0).animate({'left': 100 + '%', 'visibility':'', 'display':''}, 500);                            
                        }else{ 
                            me.$child.eq(me.nowIndex + 1).animate({'left': 100 + '%', 'visibility':'', 'display':''}, 500);                            
                        }
                    }
                    
                    me.$child.eq(me.nowIndex).animate({'left': 0 + '%', 'visibility':'', 'display':''}, 500);

                }else if(e.type === "swipegestureend"){
                    me.isAnimation = true;
                }

            });
            
        },

        
        setContent: function() {
            
            var me = this;

            me.nowIndex = (me.options.selectedIndex === 'last') ? me.maxCount : me.options.selectedIndex;        
                        
            me.$child.stop(true, true).css({'position' : 'absolute', 'top' : '0px', 'left' : '-200%'}).eq(me.nowIndex).css({'left': '0%'});            
            me.$child.eq(me.nowIndex).css({'visibility':'', 'display':''}).siblings().css({'visibility':'hidden', 'display':'none'});
            
            me.$child.each(function(){
                $(this).css('left', ($(this).index() - me.nowIndex) * 100 +'%');                    
            });            

            if(me.nowIndex == 0){
                me.$child.eq(me.maxCount).css('left', me.maxCount>1 ? '-100%' : '100%'); 
            }

            if(me.nowIndex == me.maxCount){
                me.$child.eq(0).css('left', '100%');       
            }
        },
        

        /**
         * index에 해당하는 컨텐츠를 활성화
         * @param {number} index 탭버튼 인덱스
         */
        selectContent: function(index, direction, isDrag) {
            
            var me = this,
                parentIndex = 0,
                //parentIndex = me.$child.eq(me.newIndex).parent().find('ul').index(me.$child.eq(me.newIndex).parent()),
                e, aniTime;

            var _isDrag = isDrag==undefined? false : isDrag;    

            aniTime = me.$child.eq(me.newIndex).width() * 0.5;
            aniTime = aniTime != me.options.slideTime? me.options.slideTime : aniTime;
            aniTime = _isDrag? 100 : aniTime;
            
            
            me.triggerHandler('slidebefore', {'parentIndex': parentIndex, 'index': me.newIndex, 'aniTime': aniTime, 'direction': direction, 'isDrag':_isDrag});
            me._transition({'parentIndex': parentIndex, 'index': me.newIndex, 'aniTime': aniTime, 'direction': direction, 'isDrag':_isDrag});
            
            
        },

        _transition: function (data) {
            var me = this,
                time = data.aniTime / 1000;      
                        
            var tx = -100;            
            if (data.direction === 'PREV') {
                tx = 100;
            }
            
            me.$child.stop(true, true).eq(me.nowIndex).animate({
            'left' : tx + '%'
            }, {'duration': data.aniTime, 'easing': me.options.easing}).end().eq(data.index).css('visibility', '').animate({
                'left' : 0 + '%'
            }, {'duration': data.aniTime, 'easing': me.options.easing, complete:function () {
                me.transData = data;
                me._transitionEnd();
            }});
            

        },

        /**
         * 슬라이드가 끝났을 때 실행
         * @private
         */
        _transitionEnd: function () {
            var me = this;

            me.nowIndex = me.newIndex;
            me.$child.eq(me.nowIndex).siblings().css({'visibility':'hidden', 'display':'none'});
            
            
            me.$child.each(function(){
                $(this).css('left', ($(this).index() - me.nowIndex) * 100 +'%');                        
            });

            if(me.nowIndex == 0){
                me.$child.eq(me.maxCount).css('left', me.maxCount>1 ? '-100%' : '100%'); 
            }

            if(me.nowIndex == me.maxCount){
                me.$child.eq(0).css('left', '100%');       
            }
            
            me.isAnimation = true;
            me.triggerHandler('slideafter', me.transData);
            
        },


        update: function () {
            
            var me = this;
            me.updateSelectors();
            me.nowIndex = 0;
            me.maxCount = me.$child.size() - 1;
        }
    });
    ///////////////////////////////////////////////////////////////////////////////////////

    if (typeof define === "function" && define.amd) {
        define([], function() {
            return FlipMainContents;
        });
    }
    
    

})(jQuery, window[LIB_NAME]);