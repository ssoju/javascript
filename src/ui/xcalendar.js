/*!
 * @author axl.ui.calendar.js
 * @email comahead@gmail.com
 * @create 2013-11-25
 * @license MIT License
 */
(function ( $, core, undefined) {
    "use strict";

    var ctx = window,
        $doc = $(document),
        ui = core.ui,
        dateUtil = core.date,
        browser = core.browser,
        isTouch = browser.isTouch;

    //Calendar ////////////////////////////////////////////////////////////////////////////
    /**
     * @class
     * @description 달력 모듈
     * @name axl.ui.Calendar
     * @extends axl.ui.View
     */
    var daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    var Calendar = ui('Calendar', /** @lends axl.ui.Calendar# */{
        bindjQuery: 'calendar',
        defaults: {
            weekNames: ['일', '월','화','수','목','금', '토'],
            monthNames: '1월,2월,3월,4월,5월,6월,7월,8월,9월,10월,11월,12월'.split(','),

            titleFormat: 'yyyy년 MM월 dd일',

            weekendDisabled: false,     // 주말을 disabled시킬 것인가
            type: 'button',           // 날짜가 선택되게 할 것인가
            inputTarget: '',            // 날짜를 선택했을 때, 날짜가 들어갈 인풋박스의 셀렉터
            marginTop: 4,
            showOtherMonths: false,     // 이전, 다음달의 날짜를 표시할 것인가
            isBubble: false,
            date: new Date(),       // 처음에 표시할 기본 날짜
            today: new Date(),
            useSelectbox: false,
            isClickActive: true,
            startSelectYear: '2004',
            endSelectYear: '+1',
            template: {
                header: '<button class="ui_calendar_prev">이전달</button>' +
                '<a href="#" class="ui_calendar_text"></a>' +
                '<button class="ui_calendar_next">다음달</button>',

                selectHeader: '<a href="#" class="ui_calendar_prev"><span class="hide">이전달</span></a>' +
                '<select class="ui_calendar_years y_selct" title="해당년 선택란"></select>' +
                '<select class="ui_calendar_months m_selct" title="해당월 선택란"><option value="1">01</option><option value="2">02</option><option value="3">03</option><option value="4">04</option><option value="5">05</option><option value="6">06</option><option value="7">07</option><option value="8">08</option><option value="9">09</option><option value="10">10</option><option value="11">11</option><option value="12">12</option></select>' +
                '<a href="#" class="ui_calendar_next"><span class="hide">다음달</span></a>',

                label: '<span class="ui_calendar_day" title="{{-title}}">{{=day}}</span>',
                button: '<button class="ui_calendar_day" title="{{-title}}" {{-disabled}}>{{=day}}</button>'
            },
            holidays: [],               // 휴일 날짜 -> ['2013-04-05', '2013-05-12'],
            summary: '캘린더입니다. 글은 일요일, 월요일, 화요일, 수요일, 목요일, 금요일, 토요일 순으로 나옵니다.',
            colWidth: '32px', // 셀 너비
            caption: '달력',
            canSelectHoliday: false,		// 휴일을 선택하게 할 것인가,
            customDaysTarget: null		// 휴일, 오늘, 토요일, 일요일 이외의 날짜를 표현할 경우, json를 담고 있는 script id를 지정
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
            var me = this;
            if (me.supr(el, options) === false) {
                return me.release();
            }

            me.isInline = !me.$el.is('button, input, a');
            me.currDate = dateUtil.parse(me.options.date);
            me._normalizeOptions();

            if(me.options.customDaysTarget) {
                try {
                    var $data = $(me.options.customDaysTarget);
                    me.customDays = $.parseJSON($.trim($data.html()));
                } catch(e) { console.error('[calendar] custom day의 값이 잘못 되었습니다.'); }
                $data.remove();
            }

            if(me.isInline){
                me._render();
            } else {
                me.options.header = true;
                me.options.type = 'button';
                if(me.options.inputTarget){
                    me.$input = $(me.options.inputTarget);
                }
                me.off('.calendar').on('click.calendar', function(e){
                    e.preventDefault();
                    e.stopPropagation();
                    if(me.$calendar && me.$calendar.is(':visible')){
                        me.close();
                        return;
                    }
                    me.open();
                });
            }
        },

        _normalizeOptions: function() {
            var me = this,
                opts = me.options;

            if(!core.is(opts.today, 'date')) {
                opts.today = dateUtil.parse(opts.today+'');
            }

            //data-holidays속성을 이용한 경우 문자열로 넘어오기 때문에 배열로 변환해주어야 한다.
            if(core.is(opts.holidays, 'string')) {
                try {
                    opts.holidays = eval(opts.holidays);
                } catch (e){ opts.holidays = []; }
            }

            if(opts.useSelectbox) {
                var date = new Date;
                if(/^[+-]/.test(opts.startSelectYear.toString())) {
                    me.startSelectYear = date.getFullYear() + (opts.startSelectYear|0)
                } else {
                    me.startSelectYear = opts.startSelectYear|0;
                }

                if(/^[+-]/.test(opts.endSelectYear.toString())) {
                    me.endSelectYear = date.getFullYear() + (opts.endSelectYear|0)
                } else {
                    me.endSelectYear = opts.endSelectYear|0;
                }
            }
        },

        /**
         * 위치 재조절
         */
        _reposition: function() {
            if(this.options.type !== 'button'){ return; }

            this.$el.parent().css('position', 'relative');
            var me = this,
                pos = me.$el.parent().position(),
                height = me.$calendar.height(),
                top;

            if(core.util.getDocHeight() > pos.top + height + me.options.marginTop) {
                top = -height;
            } else {
                top = pos.top + height + me.options.marginTop;
            }
            if(top < 0) {
                top = me.$el.outerHeight();
            }
            me.$calendar.css({
                left: me.options.inputTarget ? me.$input.position().left + parseInt(me.$input.css('marginLeft'), 10) : pos.left,
                top: top
            }).focus();

            return me;
        },

        /**
         * 모달 띄우기
         * @returns {Calendar}
         */
        open: function(){
            var me = this;

            Calendar.active && Calendar.active.close();
            Calendar.active = this;

            if(me.options.inputTarget) {
                var val = me.$input.val(),
                    currDate = dateUtil.parse(me.$input.val());

                if((val && val.length < 8) || isNaN(currDate.getTime())) {
                    currDate = new Date;
                }

                if(me.options.header && me.options.useSelectbox) {
                    currDate = me._checkValid(currDate);
                }
                me.currDate = currDate;
            }
            me._render();
            me._reposition();
            me.show();

            return me;
        },

        /**
         * 모달 닫기
         * @returns {Calendar}
         */
        close: function(){
            if(this.isInline){
                return;
            }

            this._remove();
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
                    clearTimeout(me.focusTimer);
                    if (me.$calendar[0].contains(e.target)) {
                        e.stopPropagation();
                        return;
                    }

                    me.close();
                });

                if(!core.isTouch) {
                    me._escape();

                    me.$calendar.on('focusin focusout', function(e) {
                        clearTimeout(me.focusTimer);
                        switch(e.type) {
                            case 'focusout':
                                me.focusTimer = setTimeout(function() {
                                    me.close();
                                }, 200);
                                break;
                        }
                    });
                }
                me.$monthPanel.css('height', me.$datePanel.height() - 24);
                me.$calendar.showLayer({opener: me.$el});
            }

            return me;
        },

        _escape: function() {
            var me = this;

            me.$calendar.add(me.$el).add(me.$input)
                .off('keyup.calendar').on('keyup.calendar', function(e) {
                    if(e.keyCode === core.keyCode.ESCAPE) {
                        me.close();
                        me.options.inputTarget && me.$input.focus();
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

            tmpl = '<div class="ui_calendar_container">' +
                '<div class="ui_calendar_datepanel">' +
                    (opts.header !== false ?
                    '<div class="ui_calendar_header">' +
                    (opts.header && opts.useSelectbox ? opts.template.selectHeader : opts.template.header) +
                    '</div>' : '') +
                    '<div class="ui_calendar_date"></div>' +
                '</div>' +
                '<div class="ui_calendar_monthpanel" style="display: none;">' +
                    '<div class="ui_calendar_header"><button class="ui_calendar_prev">이전해</button>' +
                    '<span class="ui_calendar_text"></span>' +
                    '<button class="ui_calendar_next">다음해</button></div>' +
                    '<div class="ui_calendar_month"><ul></ul>' +
                '</div></div>';

            me._remove();
            me.$calendar = $(tmpl);
            me.$datePanel = me.$calendar.find('.ui_calendar_datepanel');
            me.$monthPanel = me.$calendar.find('.ui_calendar_monthpanel');

            if(me.isInline) {
                // 인라인
                me.$el.empty().append(me.$calendar);
            } else {
                // 모달
                me.$calendar.css({
                    position: 'absolute',
                    backgroundColor: '#fff',
                    zIndex: 9999
                });
                me.$el.after(me.$calendar);
            }
            me.$datePanel.off('.calendar')
                .on('click.calendar mousedown.calendar', '.ui_calendar_prev, .ui_calendar_next', function(e){
                    // 이전 / 다음
                    e.preventDefault();
                    if(me.$el.hasClass('disabled')){ return; }

                    var $el = $(e.currentTarget),
                        isPrev = $el.hasClass('ui_calendar_prev');

                    switch (e.type) {
                        case 'click':
                            me[isPrev ? 'prev' : 'next']();
                            break;
                        case 'mousedown':
                            clearInterval(timer);
                            timer = null;
                            timer = setInterval(function(){
                                me[isPrev ? 'prev' : 'next']();
                            }, 300);
                            $doc.on('mouseup.calendar', function() {
                                clearInterval(timer);
                                timer = null;
                                $doc.off('mouseup.calendar');
                            });
                            break;
                    }
                })
                .on('click.calendar', '.ui_calendar_day', function(e) {
                    // 날짜 클릭
                    e.preventDefault();
                    if(me.$el.hasClass('disabled')){ return; }

                    var $this = $(this).closest('td'),
                        data = $this.data(),
                        date = new Date(data.year, data.month - 1, data.day),
                        format = dateUtil.format(date, opts.format || ''),
                        e;

                    if(opts.inputTarget) {
                        me.$input.val(format)
                    }

                    e = $.Event('calendar:selected');
                    e.target = e.currentTarget = this;
                    me.$el[opts.isBubble ? 'trigger' : 'triggerHandler'](e, {
                        target: this,
                        year: $this.data('year'),
                        month: $this.data('month'),
                        day: $this.data('day'),
                        value: format,
                        date: date,
                        instance: me
                    });

                    if(me.isInline && opts.isClickActive !== false){
                        me.$datePanel.find('.ui_calendar_active').removeClass('ui_calendar_active');
                        $this.addClass('ui_calendar_active');
                    }

                    if(!e.isDefaultPrevented() && !me.isInline) {
                        me.close();
                        me.$el.focus();
                    }
                })
                .on('click.calendar', '.ui_calendar_text', function(e) {
                    e.preventDefault();
                    me.currYear = me.currDate.getFullYear();
                    me._renderMonths();
                    me.$datePanel.hide();
                    me.$monthPanel.show().find('.ui_calendar_text').text(me.currYear);
                    me.$monthPanel.find(':focusable').focus();
                });

            me.$monthPanel.on('click.calendar', '.ui_calendar_prev, .ui_calendar_next', function(e) {
                me.$monthPanel.show().find('.ui_calendar_text').text($(this).hasClass('ui_calendar_prev') ? --me.currYear : ++me.currYear);
                me._renderMonths();
            }).on('click.calendar', '.ui_calendar_month button', function(e) {
                e.stopPropagation();
                me.currDate.setYear(me.$monthPanel.find('.ui_calendar_text').text()|0);
                me.currDate.setMonth($(this).data('month') - 1);
                me._renderDate();
                me.$monthPanel.hide();
                me.$datePanel.show().find(':focusable').focus();
            });

            me._renderDate();
            me._renderMonths();
            me._bindSelectboxEvents();

            return me;
        },

        _bindSelectboxEvents: function () {
            var me = this,
                opts = me.options;

            if(opts.header && opts.useSelectbox) {
                me.$yearSelectbox = me.$datePanel.find('.ui_calendar_years');
                me.$monthSelectbox = me.$monthPanel.find('.ui_calendar_months');

                me.$yearSelectbox[0].options.length = 0;
                for(var i = me.startSelectYear; i <= me.endSelectYear; i++) {
                    me.$yearSelectbox[0].options.add(new Option(i, i));
                }

                me.$yearSelectbox.add(me.$monthSelectbox).off('change.calendar').on('change.calendar', function(e) {
                    var year = me.$yearSelectbox.val(),
                        month = me.$monthSelectbox.val();

                    me.currDate.setYear(year|0);
                    me.currDate.setMonth((month|0) - 1);

                    me._renderDate();
                });
            }
        },

        _selectCurrentDate: function(){
            var me = this,
                opts = me.options;

            if(!opts.header || !opts.useSelectbox) { return; }

            me.$yearSelectbox.val(me.currDate.getFullYear());
            me.$monthSelectbox.val(me.currDate.getMonth() + 1);

        },

        release: function() {
            var me = this;
            me._remove();
            me.close();
            me.callParent();
        },

        /**
         * 휴일 여부
         * @param {number} y 년도
         * @param {number} m 월
         * @param {number} d 일
         * @returns {boolean} 휴일여부
         * @private
         */
        _isHoliday: function(y, m, d) {
            var me = this,
                holidays = me.options.holidays,
                i, date, item;

            for (i = -1; item = holidays[++i]; ) {
                date = dateUtil.parse(item);
                if(date.getFullYear() === y && date.getMonth() + 1 === m && date.getDate() === d) {
                    return true;
                }
            }

            return false;
        },

        _checkValid: function(date) {
            var me = this;

            if(me.startSelectYear > date.getFullYear()) { return new Date(me.startSelectYear, 0, 1); }
            if(me.endSelectYear < date.getFullYear()) { return new Date(me.endSelectYear, 11, 1); }
            return date;
        },

        _renderMonths: function() {
            var me = this,
                html = '';

            for(var i = 1; i <=12; i++){
                html += '<li><button type="button" data-month="'+i+'" class="'+(me.currDate.getFullYear() === me.currYear && me.currDate.getMonth() + 1 === i ? 'ui_active': '')+'">'+i+'월</button></li>';
            }

            me.$monthPanel.find('ul').html( html );
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
                isHoliday = false,
                isToday = false,
                isOtherMonth = false,
                i, j, y, m, d, week, len, cell, customClass;

            html += '<table class="ui_calendar_table" border="1" summary="'+opts.summary+'"><caption>'+opts.caption+'</caption>';
            html += '<colgroup>';
            for(i = 0; i < 7; i++) {
                html += '<col width="'+opts.colWidth+'" />';
            }
            html += '</colgroup><thead>';
            for(i = 0; i < 7; i++) {
                html += '<th class="ui_calendar_dayname ' + (i === 0 ? ' ui_calendar_sunday' : i === 6 ? ' ui_calendar_saturday' : '') + '" scope="col">';
                html += opts.weekNames[i];
                html += '</th>';
            }
            html += '</thead><tbody>';

            for(i = 0, len = date.length; i < len; i++) {
                week = date[i];

                html += '<tr>';
                for(j = 0; j < 7; j++) {
                    y = week[j].year, m = week[j].month, d = week[j].day;
                    isHoliday = /*((j === 0 || j === 6) && opts.weekendDisabled) || */me._isHoliday(y, m, d);
                    isToday = opts.today.getFullYear() === y && opts.today.getMonth() + 1 === m && opts.today.getDate() === d;
                    isOtherMonth = (me.currDate.getMonth() + 1) != m;
                    var nowd = new Date(y, m - 1, d);

                    if(beforeRenderDay){
                        cell = beforeRenderDay.call(me, y, m, d, {
                            isSaturday: j === 6,
                            isSunday: j === 0,
                            isHoliday: isHoliday,
                            isToday: isToday,
                            isOtherMonth: isOtherMonth}) || {cls:'', html:'', disabled:''};
                    } else {
                        cell = {cls:'', html:'', disabled:''};
                    }

                    customClass = me.customDays ? ' '+me._getClassCustomDay(y, m, d) : '';
                    cell.cls = customClass;

                    html += '<td class="ui_calendar_'+ dateUtil.format(nowd, 'yyyyMMdd') + ' ui_calendar_cell';
                    if(opts.showOtherMonths && isOtherMonth || !isOtherMonth) {
                        html += (isHoliday ? ' ui_calendar_holiday' : '')
                        + (j === 0 ? ' ui_calendar_sunday' : j === 6 ? ' ui_calendar_saturday' : '')
                        + (isToday ? ' ui_calendar_today' : '');
                    }
                    html += (isOtherMonth ? ' ui_calendar_other' : '')
                    + cell.cls
                    + '" data-year="'+y+'" data-month="'+m+'" data-day="'+d+'">';

                    if(!isOtherMonth || opts.showOtherMonths) {
                        if (cell.html) {
                            html += cell.html;
                        } else {
                            html += tmpl({
                                title: dateUtil.format(nowd, opts.titleFormat),
                                isHoliday: isHoliday,
                                isToday: isToday,
                                isOtherMonth: isOtherMonth,
                                customClass: customClass,
                                isSunday: j === 0,
                                isSaturday: j === 6,
                                disabled: isHoliday || cell.disabled ? ' disabled="disabled" ' : '',
                                day: d,
                                date: nowd
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

            me.$calendar.find('.ui_calendar_date').html(html);
            me.$calendar.find('.ui_calendar_text').text(dateUtil.format(me.currDate, 'yyyy-MM'));

            if(opts.header && opts.useSelectbox){
                me._selectCurrentDate();
            }

            return me;
        },

        _getClassCustomDay: function(y, m, d) {
            var me = this,
                cls = '';

            m = m - 1;
            core.each(me.customDays, function(item, key) {
                var date;
                for(var i = 0; i < item.length; i++) {
                    date = dateUtil.parse(item[i]);
                    if(date.getFullYear() === y && date.getMonth() === m && date.getDate() === d) {
                        cls = key;
                        return false;
                    }
                }
            });
            return cls;
        },

        setCustomDays: function(data) {
            this.customDays = data;
            this.refresh();
        },

        refresh: function(){
            this._renderDate();
        },

        findDateCell: function(day) {
            return this.$calendar.find('.data-'+day.getFullYear()+''+(day.getMonth() + 1)+''+day.getDate());
        },

        enable: function() {
            var me = this;
            if(me.options.inputTarget) {
                me.$input.disabled(false);
            }
            me.$el.disabled(false);
        },

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
                var currDate = core.is(date, 'date') ? date : dateUtil.parse(date);
                if(me.options.header && me.options.useSelectbox){
                    currDate = me._checkValid(currDate);
                }
                this.currDate = currDate;
                me._renderDate();
            } catch(e) {
                throw new Error('Calendar#setDate(): 날짜 형식이 잘못 되었습니다.');
            }
            return this;
        },

        /**
         *
         * @param holidays
         */
        setHolidays: function(holidays) {
            var me = this;

            if(core.isArray(holidays)) {
                me.options.holidays = holidays;
            } else if(core.is(holidays, 'string')){
                if(holidays.substr(0, 1) !== '[') {
                    holidays = '[' + holidays + ']';
                }
                me.options.holidays = eval(holidays);
            } else {
                return;
            }

            /*
             me.$calendar.find('.ui_calendar_holiday').removeClass('ui_calendar_holiday');
             core.each(me.options.holidays, function(day, i) {
             day = dateUtil.parse(day);
             me.findDateCell(day).addClass('ui_calendar_holiday');
             });
             */
            me._renderDate();
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
            /*
             var to = me.options.today,
             cur = me.currDate;
             me.$calendar.find('td.ui_calendar_today').removeClass('ui_calendar_today');
             if(to.getFullYear() === cur.getFullYear()
             && to.getMonth() === cur.getMonth()) {
             // 오늘날짜가 현재월에 해당하면, 활성화 해줌
             me.findDateCell(to).addClass('ui_calendar_today');
             }
             */
        },

        /**
         * 오늘날짜 반환
         * @returns {Date} 오늘날짜
         */
        getToday: function() {
            return this.options.today;
        },

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
            if(me.options.header && me.options.useSelectbox){
                currDate = me._checkValid(currDate);
            }
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
            if(me.options.header && me.options.useSelectbox){
                currDate = me._checkValid(currDate);
            }
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

            var month = date.getMonth() + 1,
                year = date.getFullYear(),
                startOnWeek = date.getDay() + 1,
                last = daysInMonth[date.getMonth()],    // 마지막날
                prevLast = daysInMonth[date.getMonth() === 0 ? 11 : date.getMonth() - 1], // 이전달의 마지막날
                startPrevMonth = prevLast - startOnWeek,// 이전달의 시작일
                y = year, m = month;

            if (month > 12) {
                month -= 12, year += 1;
            } else {
                if (month == 2 && core.date.isLeapYear(year)) {
                    last = 29;
                }
            }

            var data = [],
                week = [];

            if (startOnWeek > 0) {
                if (month == 3 && core.date.isLeapYear(year)) {
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
        }
    });
    ///////////////////////////////////////////////////////////////////////////////////////

    if (typeof define === "function" && define.amd) {
        define([], function() {
            return Calendar;
        });
    }

})(jQuery, window[LIB_NAME]);