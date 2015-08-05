/*!
 * @modul coma.ui.Calendar.js
 * @email odyseek@vi-nyl.com
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

    //Calendar ////////////////////////////////////////////////////////////////////////////
    /**
     * @class
     * @description 달력 모듈
     * @name coma.ui.Calendar
     * @extends coma.ui.View
     */
    var daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    var dateRegex = /[0-9]{4}.?[0-9]{2}.?[0-9]{2}/;
    var Calendar = ui('Calendar', /** @lends coma.ui.Calendar# */{
        bindjQuery: 'calendar',
        defaults: {
            weekNames: ['일', '월','화','수','목','금', '토'],
            monthNames: '1월,2월,3월,4월,5월,6월,7월,8월,9월,10월,11월,12월'.split(','),
            titleFormat: 'yyyy년 MM월 dd일',
            weekendDisabled: false,     // 주말을 disabled시킬 것인가
            type: 'button',                         // 날짜가 선택되게 할 것인가
            inputTarget: '',            // 날짜를 선택했을 때, 날짜가 들어갈 인풋박스의 셀렉터
            marginTop: 4,                  //
            showOtherMonths: false,     // 이전, 다음달의 날짜를 표시할 것인가
            isBubble: false,                // 달력이벤트의 버블링을 허용할 것인가
            date: new Date(),                            // 처음에 표시할 기본 날짜
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
                '<select class="ui_selectbox sel_years" data-class="item_wrap" data-width-class="f_wd_year" title="년"></select>' +
                '<a href="#" class="ui-calendar-close"><span class="hide">닫기</span></a>' +
                '</div>' +
                '<div class="ui-calendar-header-second">' +
                '<a href="#" class="ui-calendar-prev">&lt;</a>' +
                '<span class="ui-calendar-now">01</span>' +
                '<a href="#" class="ui-calendar-next">&gt;</a>' +
                '</div>',

                label: '<span class="ui-calendar-day" title="{{-title}}">{{=day}}</span>',
                button: '<button type="button" class="ui-calendar-day{{-disabled?\' disabled\':""}}" title="{{-title}}" {{-disabled?\'disabled="disabled"\':""}}>{{=day}}</button>'
            },
            holidays: [],               // 휴일 날짜 -> ['2014-04-05', '2014-05-12'],
            caption: '캘린더입니다. 글은 일요일, 월요일, 화요일, 수요일, 목요일, 금요일, 토요일 순으로 나옵니다.',
            monthCaption: '월 선택 캘린더입니다. 1월부터 12월까지 순서대로 나옵니다.',
            colWidth: '32px'                        // 셀 너비
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
            me._parseMinMaxDate();

            if(me.isInline){
                me.currDate = (d = dateUtil.parse(me.options.date)), isNaN(d) ? new Date() : d;
                me._render();
            } else {
                if (me.options.inputTarget) {
                    me.$input = $(me.options.inputTarget);
                } else {
                    throw new Error('data-input-target 속성을 설정해주세요.');
                }

                me.currDate = (d = dateUtil.parse(me.$input.trimVal() || me.options.date)), isNaN(d) ? new Date() : d;
                if (core.browser.isMobile) {
                    me._renderMobileCalendar();
                    return;
                } else {
                    me.options.showByInput && me.$input.on('click', function (e) {
                        if (me.isShown) { return; }
                        me.opener = this;
                        me.open();
                    });
                    me.$input.addClass('ui_formatter').attr({'data-format': 'date', 'maxlength': 10}).prop('readonly', false);
                    me.$input.on('keyup', function (e) {
                        if (!me.isShown || this.value.length !== 10) { return; }
                        me.setDate(this.value);
                    });
                    me._validateInput();
                }

                me.options.header = true;
                me.options.type = 'button';
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

        _validateInput: function () {
            var me = this;

            me.options.isValidate && me.$input.on('focusout', function (e){
                var date, v, y, m, d, isInvalind, errMsg, pos;
                if (!(v = me.$input.realVal())) { return; }
                if (v.length !== 8) {
                    errMsg = "아래의 예시처럼 입력해 주시기 바랍니다. \n예시) 20151212";
                    isInvalind = true;
                } else {
                    /*date = core.date.parse(v);
                     if (isNaN(date)) {
                     errMsg = "날짜가 유효하지 않습니다.";
                     isInvalind = true;
                     }*/
                    y = v.substr(0, 4)|0;
                    if (y < me.minDate.getFullYear() || y > me.maxDate.getFullYear()) {
                        if (!me.$el.attr('data-min-date') && !me.$el.attr('data-max-date')) {
                            errMsg = "년도는 이전 5년 이후 5년까지 입력 가능합니다.";
                            pos = {begin: 0, end: 4};
                            isInvalind = true;
                        }
                    }
                    if (!isInvalind) {
                        m = v.substr(4, 2) | 0;
                        if (m < 1 || m > 12) {
                            errMsg = "월은 01-12 까지 입력 가능합니다.";
                            pos = {begin: 5, end: 7};
                            isInvalind = true;
                        }
                    }
                    if (!isInvalind) {
                        var nd = new Date(y, m, -1);
                        d = v.substr(6) | 0;
                        if (d < 1 || d > dateUtil.daysInMonth(y, m)) {
                            errMsg = "일은 01-31 까지 입력해 주시기 바랍니다.";
                            pos = {begin: 8, end: 10};
                            isInvalind = true;
                        }
                    }
                }
                if (!isInvalind && me._compareDate(date) !== 0) {
                    errMsg = "'"+dateUtil.format(me.minDate)+"' ~ '"+dateUtil.format(me.maxDate)+"' 사이의 날짜만 입력 가능합니다.";
                    pos = {begin: 0, end: 10};
                    isInvalind = true;
                }
                if (isInvalind) {
                    e.preventDefault();
                    alert(errMsg);
                    me.$input.focus();
                    inputSel.set(me.$input[0], pos);
                    return false;
                }
            });
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
         * 최소날짜 설정
         *
         * @param {Date|String} minDate '2014-12-12', '-2M'
         */
        setMinDate: function (minDate) {
            var me = this,
                today = core.clone(me.options.today),
                val;

            if (minDate) {
                if (core.is(minDate, 'date')) {
                    me.minDate = core.clone(minDate);
                } else if (dateRegex.test(minDate)){
                    me.minDate = core.date.parse(minDate);
                } else {
                    if (val = core.date.calc(today, minDate)){
                        me.minDate = val;
                    }
                }
                me.minDate.setHours(0, 0, 0, 0);
            }
            if (!core.is(me.minDate, 'date')){
                me.minDate = new Date(today.getFullYear() - 5, 0, 1, 0, 0, 0, 0);
            }
        },

        /**
         * 최대날짜 설정
         *
         * @param {Date|String} maxDate '2014-12-12', '+2M'
         */
        setMaxDate: function (maxDate) {
            var me = this,
                today = core.clone(me.options.today),
                val;

            if (maxDate) {
                if (core.is(maxDate, 'date')) {
                    me.maxDate = core.clone(maxDate);
                } else if (dateRegex.test(maxDate)) {
                    me.maxDate = core.date.parse(maxDate);
                } else {
                    if (val = core.date.calc(today, maxDate)){
                        me.maxDate = val;
                    }
                }
                me.maxDate.setHours(0, 0, 0, 0);
            }
            if (!core.is(me.maxDate, 'date')) {
                me.maxDate = new Date(today.getFullYear() + 5, 11, 31, 0, 0, 0, 0);
            }
        },

        /**
         * 모바일 버전 렌더링
         * @private
         */
        _renderMobileCalendar: function() {
            var me = this,
                $label, $span, labelTxt = '';

            if (!(me.elID = me.$input.attr('id'))) { // 2015.06.23 보이스오버에서 정상적인 클릭이 안됨.... 아래 소스로 바꾸니 됨..ㅋㅋㅋ
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
            me.$input.css({'position':'absolute',top:0,left:15,width:1,height:1,zIndex:-1}).val(dotDate(me.$input.val())).attr('type', 'date').prop({
                'readonly': false,
                'min': dateUtil.format(me.minDate),
                'max': dateUtil.format(me.maxDate)
            }).on('change dateselectboxchange', function () { // dateselectboxchange: DateSelectbox 에 발생하는 이벤트
                var value = this.value;
                $label.find('.ui_calendar_value').html(hypenDate(value));
            });
            me.$el.after($label);
            me.$el.remove();
            $label.find('.ui_calendar_value').html(hypenDate(me.$input.val()));
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

            if (core.isMobileSize()) {
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

            me._readInput();
            me._render();
            me._reposition();
            me.show();
            me.isShown = true;
            me.$calendar.attr('tabindex', 0).focus();

            return me;
        },

        _readInput: function () {
            var me = this,
                val = me.$input.trimVal(),
                valDate = (val && val.length < 8) ? null : dateUtil.parse(val);

            if(!valDate || isNaN(valDate.getTime())) {
                me.currDate = core.clone(me.options.date);
                me.activeDate = core.clone(me.options.today);
                if (val) {
                    me.$input.val(dateUtil.format(me.activeDate));
                }
            } else {
                var cmp = me._compareDate(valDate);
                if (cmp < 0) { valDate = me.currDate = core.clone(me.minDate); }
                else if (cmp > 0) { valDate = me.currDate = core.clone(me.maxDate); }
                else { me.currDate = valDate; }
                me.activeDate = core.clone(valDate);

                if (val && cmp !== 0) {
                    me.$input.val(dateUtil.format(valDate));
                }
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

                $doc.on('click.calendar', function (e) {
                    e.preventDefault();
                    if((me.$input && me.$input[0] !== e.target)
                        && !$.contains(me.$el[0], e.target)
                        && !$.contains(me.$calendar[0], e.target)
                        && me.$el[0] != e.target){
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

                me._trigger('show');
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

            tmpl = '<div class="ui-calendar-container"><div class="ui-select-day">' +
                (opts.header !== false ? opts.template.header : '') +
                '<div class="ui-calendar-date"></div></div></div>';

            me._remove();
            me.$calendar = $(tmpl);

            if(opts.header) {
                me.$selectboxYears = me.$calendar.find('.sel_years');
                for(var i = me.minDate.getFullYear(); i <= me.maxDate.getFullYear(); i++) {
                    me.$selectboxYears[0].options.add(new Option(i, i));
                }
                me.$selectboxYears.on('change', function (e) {
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
                    me.$el.after(me.$calendar);
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
                        e = $.Event('calendarinsertdate');
                        e.target = e.currentTarget = this;
                        me.$input[opts.isBubble ? 'trigger' : 'triggerHandler'](e, evtData);
                        if (e.isDefaultPrevented()) {
                            return;
                        }
                        me.$input.val(format);
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

            me._renderDate();
            me._enforceFocus();

            return me;
        },

        /**
         * 헤더에 현재 날짜에 대한 정보 표시
         * @private
         */
        _renderHeader: function(){
            var me = this,
                opts = me.options;

            if(!opts.header) { return; }

            // 일달력(.ui-calendar-header-first)의 년도 선택 버튼에 년도 설정
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

            $second.find('.ui-calendar-prev').toggleClass('disabled', isFirst).attr('tabindex', isFirst ? '-1' : '');
            $second.find('.ui-calendar-next').toggleClass('disabled', isLast).attr('tabindex', isLast ? '-1' : '');
        },

        /**
         * 해제 메소드
         */
        release: function() {
            var me = this;

            me._remove();
            me.close();
            me.supr();
        },

        /**
         * 주어진 날짜가 유효한 범위에 있는가 체크
         * @param date
         * @returns {*}
         * @private
         */
        _compareMonth: function(date) {
            var me = this;
            date = new Date(date.getTime());
            date.setDate(me.minDate.getDate());
            date.setHours(0, 0, 0, 0);

            if (date.getTime() < me.minDate.getTime()) { return -1; }
            date.setDate(me.maxDate.getDate());
            if (date.getTime() > me.maxDate.getTime()) { return 1; }
            return 0;
        },

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
                    isDisabled = me._compareDate(nowd) !== 0;
                    if(beforeRenderDay){
                        cell = beforeRenderDay.call(me, y, m, d, {
                                isSaturday: j === 6,
                                isSunday: j === 0,
                                isToday: isToday,
                                isOtherMonth: isOtherMonth}) || {cls:'', html:'', disabled:''};
                    } else {
                        cell = {cls:'', html:'', disabled:''};
                    }
                    cell.cls = '';

                    html += '<td class="ui-calendar-'+ dateUtil.format(nowd, 'yyyyMMdd') + ' ui-calendar-cell' + (isDisabled?" disabled":"");
                    if(opts.showOtherMonths && isOtherMonth || !isOtherMonth) {
                        html += (j === 0 ? ' ui-calendar-sunday' : j === 6 ? ' ui-calendar-saturday' : '')
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
                    oldMode = !core.isMobileSize() ? 'pc' : 'mobile';

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

})(jQuery, window[LIB_NAME]);