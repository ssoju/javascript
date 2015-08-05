/*!
 * @modul coma.ui.Calendar.js
 * @email odyseek@vi-nyl.com
 * @create 2015-03-25
 * @license MIT License
 *
 * @modifier �����(comahead@vinylc.com)
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
        // ĳ�� ��ġ ��ȯ
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
        // ĳ�� ��ġ ����
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
     * @description �޷� ���
     * @name coma.ui.Calendar
     * @extends coma.ui.View
     */
    var daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    var dateRegex = /[0-9]{4}.?[0-9]{2}.?[0-9]{2}/;
    var Calendar = ui('Calendar', /** @lends coma.ui.Calendar# */{
        bindjQuery: 'calendar',
        defaults: {
            weekNames: ['��', '��','ȭ','��','��','��', '��'],
            monthNames: '1��,2��,3��,4��,5��,6��,7��,8��,9��,10��,11��,12��'.split(','),
            titleFormat: 'yyyy�� MM�� dd��',
            weekendDisabled: false,     // �ָ��� disabled��ų ���ΰ�
            type: 'button',                         // ��¥�� ���õǰ� �� ���ΰ�
            inputTarget: '',            // ��¥�� �������� ��, ��¥�� �� ��ǲ�ڽ��� ������
            marginTop: 4,                  //
            showOtherMonths: false,     // ����, �������� ��¥�� ǥ���� ���ΰ�
            isBubble: false,                // �޷��̺�Ʈ�� ������ ����� ���ΰ�
            date: new Date(),                            // ó���� ǥ���� �⺻ ��¥
            today: new Date(),              // ���� ��¥
            isClickActive: true,            // �ζ��θ�忡�� Ŭ������ �� activeȿ���� �� ���ΰ�.
            showByInput: false,              // ��ǲ�ڽ��� ���ؼ��� �޷��� �� ���ΰ�
            where: 'inline',                // �޷� dom�� ��� �ΰ� �����ΰ� ����:(body(body �� �ϴ�, inline(��ư �ٷ� ��)
            minDate: '-5y',                 // ��¥ ���Ѱ�
            maxDate: '+5y',                 // ��¥ ���Ѱ�
            isValidate: false,               // ��ȿ�� ��¥���� üũ
            template: {
                header: '<div class="ui-calendar-header-first">' +
                '<a href="#" class="ui-calendar-set-today" title="������ ����">����</a>' +
                '<select class="ui_selectbox sel_years" data-class="item_wrap" data-width-class="f_wd_year" title="��"></select>' +
                '<a href="#" class="ui-calendar-close"><span class="hide">�ݱ�</span></a>' +
                '</div>' +
                '<div class="ui-calendar-header-second">' +
                '<a href="#" class="ui-calendar-prev">&lt;</a>' +
                '<span class="ui-calendar-now">01</span>' +
                '<a href="#" class="ui-calendar-next">&gt;</a>' +
                '</div>',

                label: '<span class="ui-calendar-day" title="{{-title}}">{{=day}}</span>',
                button: '<button type="button" class="ui-calendar-day{{-disabled?\' disabled\':""}}" title="{{-title}}" {{-disabled?\'disabled="disabled"\':""}}>{{=day}}</button>'
            },
            holidays: [],               // ���� ��¥ -> ['2014-04-05', '2014-05-12'],
            caption: 'Ķ�����Դϴ�. ���� �Ͽ���, ������, ȭ����, ������, �����, �ݿ���, ����� ������ ���ɴϴ�.',
            monthCaption: '�� ���� Ķ�����Դϴ�. 1������ 12������ ������� ���ɴϴ�.',
            colWidth: '32px'                        // �� �ʺ�
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
                    throw new Error('data-input-target �Ӽ��� �������ּ���.');
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
                    errMsg = "�Ʒ��� ����ó�� �Է��� �ֽñ� �ٶ��ϴ�. \n����) 20151212";
                    isInvalind = true;
                } else {
                    /*date = core.date.parse(v);
                     if (isNaN(date)) {
                     errMsg = "��¥�� ��ȿ���� �ʽ��ϴ�.";
                     isInvalind = true;
                     }*/
                    y = v.substr(0, 4)|0;
                    if (y < me.minDate.getFullYear() || y > me.maxDate.getFullYear()) {
                        if (!me.$el.attr('data-min-date') && !me.$el.attr('data-max-date')) {
                            errMsg = "�⵵�� ���� 5�� ���� 5����� �Է� �����մϴ�.";
                            pos = {begin: 0, end: 4};
                            isInvalind = true;
                        }
                    }
                    if (!isInvalind) {
                        m = v.substr(4, 2) | 0;
                        if (m < 1 || m > 12) {
                            errMsg = "���� 01-12 ���� �Է� �����մϴ�.";
                            pos = {begin: 5, end: 7};
                            isInvalind = true;
                        }
                    }
                    if (!isInvalind) {
                        var nd = new Date(y, m, -1);
                        d = v.substr(6) | 0;
                        if (d < 1 || d > dateUtil.daysInMonth(y, m)) {
                            errMsg = "���� 01-31 ���� �Է��� �ֽñ� �ٶ��ϴ�.";
                            pos = {begin: 8, end: 10};
                            isInvalind = true;
                        }
                    }
                }
                if (!isInvalind && me._compareDate(date) !== 0) {
                    errMsg = "'"+dateUtil.format(me.minDate)+"' ~ '"+dateUtil.format(me.maxDate)+"' ������ ��¥�� �Է� �����մϴ�.";
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
         * �ɼ� �߿��� ��¥�ɼǿ� ���ڿ��� �Ȱ� ������ �Ľ��ؼ� date������ ��ȯ�Ѵ�.
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
         * �ɼǿ� �ִ� �ּҳ�¥�� �ִ볯¥�� Date������ ��ȯ
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
         * �ּҳ�¥ ����
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
         * �ִ볯¥ ����
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
         * ����� ���� ������
         * @private
         */
        _renderMobileCalendar: function() {
            var me = this,
                $label, $span, labelTxt = '';

            if (!(me.elID = me.$input.attr('id'))) { // 2015.06.23 ���̽��������� �������� Ŭ���� �ȵ�.... �Ʒ� �ҽ��� �ٲٴ� ��..������
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

            // 2012-12-12 �� 2012.12.12 �������� ��ȯ
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
            }).on('change dateselectboxchange', function () { // dateselectboxchange: DateSelectbox �� �߻��ϴ� �̺�Ʈ
                var value = this.value;
                $label.find('.ui_calendar_value').html(hypenDate(value));
            });
            me.$el.after($label);
            me.$el.remove();
            $label.find('.ui_calendar_value').html(hypenDate(me.$input.val()));
        },

        /**
         * ��ġ ������
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
         * ��� ����
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
         * ��� �ݱ�
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
         * ��� ǥ��
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
         * esc Ű�� ������ �������� �̹�Ʈ ���ε�
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
         * DOM ����
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
         * ������
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
                // �ζ���
                me.$el.empty().append(me.$calendar);
                me.$el.find('.ui-calendar-close').remove();
            } else {
                // ���
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
                    // ���� / ����
                    e.preventDefault();
                    if(me.$el.hasClass('disabled')){ return; }

                    var $el = $(e.currentTarget),
                        isPrev = $el.hasClass('ui-calendar-prev');

                    me[isPrev ? 'prev' : 'next']();
                    me.$calendar.find('.ui-calendar-' + (isPrev?'prev':'next')).focus();
                })
                .on('click.calendar', '.ui-calendar-day:not(.disabled)', function(e) {
                    // ��¥ Ŭ��
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
                    // ���� Ŭ��
                    e.preventDefault();
                    me.activeDate = core.clone(me.options.today);
                    me.currDate = core.clone(me.options.today);

                    // �޷� �׸���
                    me._renderDate();
                })
                .on('click.calendar', '.ui-calendar-close', function(e) {
                    // �ݱ� Ŭ��
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
         * ����� ���� ��¥�� ���� ���� ǥ��
         * @private
         */
        _renderHeader: function(){
            var me = this,
                opts = me.options;

            if(!opts.header) { return; }

            // �ϴ޷�(.ui-calendar-header-first)�� �⵵ ���� ��ư�� �⵵ ����
            me.$selectboxYears.scSelectbox('value', me.currDate.getFullYear(), false);

            // �ϴ޷�(.ui-calendar-header-second)�� ������ ��ư�� �� ����
            var currDate = new Date(me.currDate.getTime()), html,
                $second = me.$calendar.find('.ui-calendar-header-second'),
                isFirst = currDate.getFullYear() === me.minDate.getFullYear() && currDate.getMonth() === me.minDate.getMonth(),
                isLast = currDate.getFullYear() === me.maxDate.getFullYear() && currDate.getMonth() === me.maxDate.getMonth();

            currDate = core.date.calcDate(currDate, '-1M');
            $second.children().each(function (val, name) {
                html = '<span class="hide">'+currDate.getFullYear()+'��</span>';
                html += core.number.zeroPad(currDate.getMonth() + 1, 2);
                if(val === 1) {
                    html += '<span class="hide">���� ���õ�</span>';
                } else {
                    html += '<span class="hide">���� �̵�</span>';
                }
                $(this).html(html);
                currDate = core.date.calcDate(currDate, '1M');
            });

            $second.find('.ui-calendar-prev').toggleClass('disabled', isFirst).attr('tabindex', isFirst ? '-1' : '');
            $second.find('.ui-calendar-next').toggleClass('disabled', isLast).attr('tabindex', isLast ? '-1' : '');
        },

        /**
         * ���� �޼ҵ�
         */
        release: function() {
            var me = this;

            me._remove();
            me.close();
            me.supr();
        },

        /**
         * �־��� ��¥�� ��ȿ�� ������ �ִ°� üũ
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
         * �޷� �׸���
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
                                title: dateUtil.format(nowd, opts.titleFormat) + (isToday ? ' ����' : '') + (isDisabled ? " ������ �� ����": (isSelectDay ? ' ������' : '')),
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
         * ȭ�� ����
         */
        refresh: function(){
            this._renderDate();
        },

        /**
         * �־��� ��¥�� �ش��ϴ� dom��Ҹ� ��ȯ
         * @param day
         * @returns {*}
         */
        findDateCell: function(day) {
            return this.$calendar.find('.data-'+day.getFullYear()+''+(day.getMonth() + 1)+''+day.getDate());
        },

        /**
         * �Է¿�Ҹ� Ȱ��ȭ
         */
        enable: function() {
            var me = this;
            if(!me.options.isInline) {
                me.$input.disabled(false);
            }
            me.$el.disabled(false);
        },

        /**
         * �Է¿�Ҹ� ��Ȱ��ȭ
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
         * ��¥ ����
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
                throw new Error('Calendar#setDate(): ��¥ ������ �߸� �Ǿ����ϴ�.');
            }
            return this;
        },

        /**
         * ���ó�¥ ����
         * @param today
         */
        setToday: function(today) {
            var me = this;

            if(!core.is(today, 'date')) {
                try {
                    me.options.today = core.date.parse(today)
                } catch(e) {
                    throw new Error('calendar#setToday: ��¥ ������ �߸� �Ǿ����ϴ�.')
                }
            }
            me._renderDate();
        },

        /**
         * ���ó�¥ ��ȯ
         * @returns {Date} ���ó�¥
         */
        getToday: function() {
            return this.options.today;
        },

        /**
         * ���� ��¥�� ��ȯ
         * @returns {*}
         */
        getCurrentDate: function() {
            return this.currDate;
        },

        /**
         * ������
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
         * ������
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
         * ��¥ ����Ÿ ���
         * @param {Date} date �������� ��¥ ����Ÿ ����
         * @return {Array}
         */
        _getDateList: function (date) {
            date.setDate(1);

            var me = this,
                month = date.getMonth() + 1,
                year = date.getFullYear(),
                startOnWeek = date.getDay() + 1,
                last = daysInMonth[date.getMonth()],    // ��������
                prevLast = daysInMonth[date.getMonth() === 0 ? 11 : date.getMonth() - 1], // �������� ��������
                startPrevMonth = prevLast - startOnWeek,// �������� ������
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
         * ������
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
         * ���� ����
         * @param {Date} date �������� ��¥ ����Ÿ ����
         * @return {boolean} ���� ����
         */
        _isLeapYear: function (year) {
            return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0))
        }
    });
    ///////////////////////////////////////////////////////////////////////////////////////

    // 768���Ͽ��� Ǯ������� �ߴ°� �ش� ����Ʈ������ ���Ǵ� ����̹Ƿ�,
    // �޷� �ڵ峻�� �������� ���� �̷��� �ܺο��� �̺�Ʈ�� ó��.(�޷¿��� �޷°����� ��ɸ� �־�� ��)
    core.ui.setDefaults('Calendar', {
        on: {
            'calendarshown': function(e) {
                var instance = $(this).scCalendar('instance'),
                    oldMode = !core.isMobileSize() ? 'pc' : 'mobile';

                // �� �� �θ��ҵ��� zIndex�� ���� �÷���
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