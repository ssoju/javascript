/**
 * Created by 김승일책임(comahead@vi-nyl.com) on 2015-05-15.
 * 수정 160603 
 */
(function ($, core) {
    "use strict";

    var daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    var HorizCalendar = core.ui('HorizCalendar', {
        bindjQuery: 'horizCalendar',
        defaults: {
            currentDate:new Date()
        },
        selectors: {
            wrapper: '.days',
            ul: '.days>ul'
        },
        initialize: function(el, options) {
            
            var me = this;

            if(me.supr(el, options) === false) {
                return;
            }
            
            var cd = me.options.currentDate;            
            me.currDate = cd;           
                                    
            me.ulWidth = 0;                            
            me.wrapperWidth = me.$wrapper.width();      

            if(me.hasButton = me.$('.days_wrap>.pre').size() > 0){
                me.$prevMoveBtn = me.$('.days_wrap>.pre>button');
                me.$nextMoveBtn = me.$('.days_wrap>.next>button');                
            }

	        core.importJs(['modules/smooth-scroll'], function() {
		        me._bindEvents();
		        me._render(me.currDate);                          
                me._resizeFunc($(window).width());	                
                
	        });
	        
	        
	        
        },

        _bindEvents: function() {
            var me = this,
                posX;

            // 이전달, 다음달 버튼
            me.on('click', '.month button', function(e) {
                e.preventDefault();
                if($(this).parent().hasClass('pre')) {
                    me.prev();
                } else {
                    me.next();
                }
            });

            if(me.hasButton) {
                // 좌우 이동 버튼
                me.on('click', '.days_wrap>.pre>button, .days_wrap>.next>button', function (e) {
                    e.preventDefault();
                    if ($(this).parent().hasClass('pre')) {
                        me._moveDir('prev');
                    } else {
                        me._moveDir('next');
                    }
                });
            }
            // 링크 클릭시 활성화시키기
            var activeLink = function($el) {
                $el.closest('li').addClass('on').find('.ui_hide_text').html('선택됨')
                    .end().siblings().removeClass('on').find('.ui_hide_text').html(' ');
            };

	        // 클릭한 아이템 활성화
            me.on('mousedown touchstart click', '.days>ul a', function(e) {
                switch(e.type) {
                    case 'mousedown':
                    case 'touchstart':
                        posX = me._getX(e);
                        break;
                    case 'click':
                        if(e.originalEvent) {
                            if (posX === me._getX(e)) {
                                //activeLink($(this));
                            } else {
                                e.preventDefault();
                            }
                        } else {
                            //activeLink($(this));
                        }
                        break;
                }
            });

	        // selection 방지
            me.on('mousedown selectstart', '.days>ul', function(e){
                e.preventDefault();
            });

            // 포거싱된 항목위치로 강제 스크롤
            me.on('focusin', '.days>ul a', core.delayRun(function(){
                var pos = $(this).parent().position().left,
                    currLeft = Math.abs(me.$wrapper.scSmoothScroll('getPosition').x),
                    left;

                if(pos < currLeft){
                    left = pos;
                } else if(pos > currLeft + me.wrapperWidth) {
                    left = pos + me.wrapperWidth - me.$ul.children().first().width();
                }
                left = Math.max(0, Math.min(-me.$wrapper.scSmoothScroll('getMaxScrollX'), left));
                if(left != currLeft) {
                    me.$wrapper.scSmoothScroll('scrollTo', -left, 0, 0);
                }
            }, 200));

	        // SmoothScroll 빌드
            me.$wrapper.scSmoothScroll({
                scrollX: true,
                scrollY: false,
                scrollType: 'scroll',
                selectors: {
                    scroller: '>ul'
                },
                getScrollerWidth: function(){
                    return me.ulWidth + 1;
                }
            }).on('smoothscrollend', function(e, data) {
                
                if (me.$wrapper.data('snap') !== true) {
                    me._snapPos(data.x);
                } else {
                    me.$wrapper.removeData('snap');
                }                                
                me._disableBtn(data.x);
                
                
            });
            
            
            me.itemsWidth =  91;
            me.selectedDay = 0;
            

            $(window).on('resizeend', function(){     
                me._resizeFunc($(this).width());         
            });      
            
        },
        
        selectDay:function(day){
            
            var me = this;            
            
            var findToday = function(format, day) {    
                
                var currentDay = core.date.format(day, "yyyy-MM-dd");   
                var on = core.date.equalsYMD(format, currentDay);     
                return {type: on? 'on':'', name: ''};
            };
            
            var sDay = -1, status={};
            
            for(var i = 0; i<me.dateList.length; i++) {
                
                var d = me.dateList[i];
                status = findToday(d.year+'-'+d.month+'-'+d.day, day);     
                           
                if(status.type=='on'){                    
                    sDay = i; 
                    break;
                }              
            }                               
                         
            
            var $el = me.$ul.children().eq(sDay);            
                        
            if(!$el.closest('li').hasClass('on')){
                $el.closest('li').addClass('on').find('.ui_hide_text').html('선택됨')
                    .end().siblings().removeClass('on').find('.ui_hide_text').html(' ');
            } 
            
             
            me.selectedDay = sDay;    
                
        },
        
        positionDay:function(){
            
            var me = this; 
            
            var currLeft = Math.abs(me.$wrapper.scSmoothScroll('getPosition').x);
            me._disableBtn(currLeft);
            
            me.$wrapper.removeData('snap');                
            me.$wrapper.scSmoothScroll('scrollTo', -Math.abs(me.selectedDay * me.itemsWidth), 0, 0);
            me.$wrapper.scSmoothScroll('refresh');      
            
                
        },
        
        _disableBtn:function(xpos){
            
            var me = this;
            
            if(xpos == 0){                    
                me.$prevMoveBtn.addClass('disabled');                    
            }else{
                me.$prevMoveBtn.removeClass('disabled');
            }
            
            if(Math.abs(xpos)>=me.ulWidth - me.wrapperWidth){
                me.$nextMoveBtn.addClass('disabled');
            }else{
                me.$nextMoveBtn.removeClass('disabled');
            }
            
        },
        _resizeFunc:function(width){
                
            var me = this;
            me.wrapperWidth = me.$wrapper.width();                 
            
            if(width <= 768 ){
                me.itemsWidth =  Math.ceil(me.wrapperWidth/3);
            }else{
                me.itemsWidth =  91;
            }                                                     
            
            me.ulWidth = me.$ul.children().length * me.itemsWidth;                                  
            me.$ul.css('width', Math.ceil(me.ulWidth));    
            
            
            me.$ul.children().each(function(i, item){                    
                $(item).css({'left':i*me.itemsWidth, 'width':me.itemsWidth});    
            });                                                
                                    
            
            var currLeft = Math.abs(me.$wrapper.scSmoothScroll('getPosition').x);
            me._disableBtn(currLeft);
            
            me.$wrapper.removeData('snap');                
            me.$wrapper.scSmoothScroll('scrollTo', -Math.abs(me.selectedDay * me.itemsWidth), 0, 0);
            me.$wrapper.scSmoothScroll('refresh');    
                
        },

	    /**
	     * 스내핑
	     * @param scrollLeft
	     * @private
	     */
        _snapPos: function(scrollLeft) {
            if(!this.hasButton) { return; }

            scrollLeft = Math.abs(scrollLeft);
            var me = this,
                itemWidth = me.itemsWidth,
                diff = scrollLeft % itemWidth;

            if (diff === 0) { return; }
	        if (me.$wrapper[0].scrollWidth - me.wrapperWidth === me.$wrapper[0].scrollLeft) { return; }
            if (diff < Math.round(itemWidth / 2)) {
                me.$wrapper.data('snap', true).scSmoothScroll('scrollTo', -(scrollLeft - diff), 0, 300);
            } else {
                me.$wrapper.data('snap', true).scSmoothScroll('scrollTo', -(scrollLeft + (itemWidth - diff)), 0, 300);
            }
        },

        /**
         * 내부 ul요소 이동
         * @param pos
         * @private
         */
        _move: function(pos) {
            var me = this;
            me.$wrapper.scrollLeft(Math.abs(pos));
        },

        /**
         * 좌우 이동 버튼을 의한 내부 ul 요소 이동
         * @param dir
         * @private
         */
        _moveDir: function(dir) {
            if(this.isAnimate){ return; }
            var me = this,
                pos = me.$wrapper.scSmoothScroll('getPosition').x ,
                endPos = Math.abs(dir === 'prev' ?
                    pos - me.wrapperWidth :
                    pos + me.wrapperWidth);
                    

            if(dir === 'prev') {
                if(pos  < 0) {
                    endPos = Math.min(0, pos + me.wrapperWidth);
                } else {
                    return;
                }
            } else {
                var max = me.$wrapper.scSmoothScroll('getMaxScrollX');
                if(pos > max) {
                    endPos = Math.max(pos - me.wrapperWidth, max);
                } else {
                    return;
                }
            }
            me.$wrapper.scSmoothScroll('scrollTo', -Math.abs(endPos), 0, 400);
       },
       
       
        changeMonth: function(nowDate) { // ex) 2016, 6, 1
            
            var me = this;
                 
            me.currDate = nowDate;
            me._render(me.currDate); 
            me.selectDay(me.currDate);
            me._resizeFunc($(window).width());
            
                
        },


        _getX: function(e) {
            if(e.originalEvent.touches && e.originalEvent.touches >0) {
                return e.originalEvent.touches[0].screenX;
            }
            return e.screenX;
        },


        _getMaxLeft: function(){
            var me = this;
            return me.$wrapper.prop('scrollWidth') - me.$wrapper.width();
        },

        _render: function(currentDate) {
            var me = this,
                html = '',
                status;                
            
            
            me.dateList = core.array.append(me._getDateList(currentDate), me._getDateList(core.date.calcDate(currentDate, '1M'))); // 160614 스크립트 수정 2달기준으로 변경
            
                        
            var findToday = function(format) {    
                
                var currentDay = core.date.format(me.currDate, "yyyy-MM-dd");   
                var on = core.date.equalsYMD(format, currentDay);        
                return {type: on? 'on':'', name: ''};
            };
            
            
            for(var i = 0; i<me.dateList.length; i++) {
                
                var d = me.dateList[i];
                status = findToday(d.year+'-'+d.month+'-'+d.day);
                
                var leftW = i*me.itemsWidth;
                
                html += ['<li class=" ' + d.weekClass + '" style="position:absolute; left:'+leftW+'px; width:'+me.itemsWidth+'px;" >',                       
                    '<a href="#" data-year="' + d.year + '" data-month="' + d.month + '" data-day="' + d.day + '">',
                    '<span class="week">'+ d.weekName +'<span class="hide">요일</span><span class="hide ui_hide_text">'+(status.type=='on'? '선택됨':'') +'</span></span>',
                    '<span class="day">',
                    '<span class="month">'+d.month+'<span class="hide">월</span></span><span>.</span>',
                    '<span class="date">'+d.day+'<span class="hide">일</span></span></span></a></li>'].join('');
                                
            }
            
            me.$ul.html(html).children().last().addClass('');   
            me.ulWidth = me.itemsWidth * me.dateList.length;
            me.$ul.css('width', Math.ceil(me.ulWidth));      
            
        },

	    /**
	     * 년월 형식으로 변환
	     * @param date
	     * @returns {string}
	     * @private
	     */
        _format: function(date) {
            return date.getFullYear() + '년 ' + (date.getMonth() + 1) + '월';
        },

        /**
         * 날짜 데이타 계산
         * @param {Date} date 렌더링할 날짜 데이타 생성
         * @return {Array}
         */
        _getDateList: function (d) {
            
            var date = new Date(d);
            date.setDate(1);

            var me = this,
                month = date.getMonth() + 1,
                year = date.getFullYear(),
                last = daysInMonth[date.getMonth()],    // 마지막날
                weekNames = ['일', '월','화','수','목','금','토'],
				weekClass = ['sun', 'mon','tue','wed','thu','fri','sat'];

            if (month > 12) {
                month -= 12, year += 1;
            } else {
                if (month == 2 && core.date.isLeapYear(year)) {
                    last = 29;
                }
            }
            month = month < 10 ? "0" + month : month;

            var data = [],
                week = [], nday;
                        
            for (var i = 1; i <= last; i++) {
                
                date.setDate(i);                
                nday = i < 10 ? "0" + i : i;                
                data.push({year: year, month: month, day: nday, weekClass: weekClass[date.getDay()], weekName: weekNames[date.getDay()]});
          
            }
            return data;
        }
    });

    if (typeof define === "function" && define.amd) {
        define([], function() {
            return HorizCalendar;
        });
    }
})(jQuery, window[LIB_NAME]);