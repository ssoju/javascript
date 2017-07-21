/**
 * @author comahead@gmail.com
 */
;(function (core, global, undefined) {
    /**
     * 날짜관련 유틸함수
     * @namespace
     * @name vcui.date
     */
    core.addon('date', function () {
        var months = "Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec".split(","),
            fullMonths = "January,Febrary,March,April,May,June,July,Augst,September,October,November,December".split(",");


        function compare(d1, d2) {
            if (!(d1 instanceof Date)) {
                d1 = core.date.parse(d1);
            }
            if (!(d2 instanceof Date)) {
                d2 = core.date.parse(d2);
            }

            return d1.getTime() > d2.getTime() ? -1 : (d1.getTime() === d2.getTime() ? 0 : 1);
        }

        return /** @lends vcui.date */{
            MONTHS_NAME: months,
            MONTHS_FULLNAME: fullMonths,
            FORMAT: 'yyyy.MM.dd',

            /**
             * 날짜형식을 지정한 포맷의 문자열로 변환
             *
             * @param {date} formatDate
             * @param {string} formatString} 포맷 문자열
             * @return {string} 변환된 문자열
             *
             * @example
             * // ex) 2015-04-07 15:03:45
             * // yyyy: 2015
             * // yy: 15
             * // M: 4
             * // MM: 04
             * // MMM: Apr
             * // MMMMM: April
             * // d: 7
             * // dd: 07
             * // h: 15
             * // hh: 15
             * // H: 3
             * // m: 3
             * // mm: 03
             * // s: 45
             * // ss: 45
             * // x: PM
             *
             * vcui.date.format(new Date(), "yy/MM/dd");
             * // '15/01/05'
             */
            format: function (formatDate, formatString) {
                if (formatDate === '' || formatDate === null) return '';
                formatString || (formatString = this.FORMAT);
                if (core.type(formatDate, 'number')) {
                    formatDate = new Date(formatDate);
                } else if (core.type(formatDate, 'string')) {
                    formatDate = this.parse(formatDate);
                }
                if (formatDate instanceof Date) {
                    var yyyy = formatDate.getFullYear(),
                        yy = yyyy.toString().substring(2),
                        M = formatDate.getMonth() + 1,
                        MM = M < 10 ? "0" + M : M,
                        MMM = this.MONTHS_NAME[M - 1],
                        MMMM = this.MONTHS_FULLNAME[M - 1],
                        d = formatDate.getDate(),
                        dd = d < 10 ? "0" + d : d,
                        h = formatDate.getHours(),
                        hh = h < 10 ? "0" + h : h,
                        m = formatDate.getMinutes(),
                        mm = m < 10 ? "0" + m : m,
                        s = formatDate.getSeconds(),
                        ss = s < 10 ? "0" + s : s,
                        x = h > 11 ? "PM" : "AM",
                        H = h % 12;

                    if (H === 0) {
                        H = 12;
                    }
                    return formatString.replace(/yyyy/g, yyyy)
                        .replace(/yy/g, yy)
                        .replace(/MMMM/g, MMMM)
                        .replace(/MMM/g, MMM)
                        .replace(/MM/g, MM)
                        .replace(/M/g, M)
                        .replace(/dd/g, dd)
                        .replace(/d/g, d)
                        .replace(/hh/g, hh)
                        .replace(/h/g, h)
                        .replace(/mm/g, mm)
                        .replace(/m/g, m)
                        .replace(/ss/g, ss)
                        .replace(/s/g, s)
                        .replace(/!!!!/g, MMMM)
                        .replace(/!!!/g, MMM)
                        .replace(/H/g, H)
                        .replace(/x/g, x);
                } else {
                    return "";
                }
            },

            /**
             * 주어진 날자가 유효한지 체크
             * @param {string} date 날짜 문자열
             * @returns {boolean} 유효한 날자인지 여부
             * @example
             * vcui.date.isValid('2014-13-23'); // false
             * vcui.date.isValid('2014-11-23'); // true
             */
            isValid: function (date) {
                try {
                    return !isNaN(this.parse(date).getTime());
                } catch (e) {
                    return false;
                }
            },

            /**
             * date가 start와 end사이인지 여부
             *
             * @param {date} date 날짜
             * @param {date} start 시작일시
             * @param {date} end 만료일시
             * @return {boolean} 두날짜 사이에 있는지 여부
             * @example
             * vcui.date.between('2014-09-12', '2014-09-11', '2014=09-12'); // true
             * vcui.date.between('2014-09-12', '2014-09-11', '2014=09-11') // false
             */
            between: function (date, start, end) {
                if (!date.getDate) {
                    date = core.date.parse(date);
                }
                if (!start.getDate) {
                    start = core.date.parse(start);
                }
                if (!end.getDate) {
                    end = core.date.parse(end);
                }
                return date.getTime() >= start.getTime() && date.getTime() <= end.getTime();
            },

            /**
             * 날짜 비교
             *
             * @function
             * @name vcui.date.compare
             * @param {date} date1 날짜1
             * @param {date} date2 날짜2
             * @return {number} -1: date1가 이후, 0: 동일, 1:date2가 이후
             * @example
             * var d1 = new Date(2014, 11, 23);
             * var d2 = new Date(2014, 09, 23);
             *
             * vcui.date.compare(d1, d2); // -1
             * vcui.date.compare(d1, d1); // 0
             * vcui.date.compare(d2, d1); // 1
             */
            compare: compare,

            /**
             * 년월일이 동일한가
             *
             * @param {date|String} date1 날짜1
             * @param {date|String} date2 날짜2
             * @return {boolean} 두 날짜의 년월일이 동일한지 여부
             * @example
             * vcui.date.equalsYMD('2014-12-23 11:12:23', '2014-12-23 09:00:21'); // true
             */
            equalsYMD: function (a, b) {
                var ret = true;
                if (!a || !b) {
                    return false;
                }
                if (!a.getDate) {
                    a = this.parse(a);
                }
                if (!b.getDate) {
                    b = this.parse(b);
                }
                each(['getFullYear', 'getMonth', 'getDate'], function (fn) {
                    ret = ret && (a[fn]() === b[fn]());
                    if (!ret) {
                        return false;
                    }
                });
                return ret;
            },


            /**
             * 주어진 날짜를 기준으로 type만큼 가감된 날짜를 format형태로 반환
             * @param {date} date 기준날짜
             * @param {string} type -2d, -3d, 4M, 2y ..
             * @param {string} format 포맷
             * @returns {date|String} format지정값에 따라 결과를 날짜형 또는 문자열로 변환해서 반환
             * @example
             * vcui.date.calcDate('2014-12-23', '-3m'); // 2014-09-23(Date)
             * vcui.date.calcDate('2014-12-23', '-3m', 'yyyy/MM/dd'); // '2014/09/23'(String)
             *
             * vcui.date.calcDate('2014-12-23', '-10d'); // 2014-12-13(Date)
             */
            calcDate: function (date, type, format) {
                date = this.parse(date);
                if (!date) {
                    return null;
                }

                var m = type.match(/([-+]*)([0-9]*)([a-z]+)/i),
                    g = m[1] === '-' ? -1 : 1,
                    d = (m[2] | 0) * g;

                switch (m[3]) {
                    case 'd':
                        date.setDate(date.getDate() + d);
                        break;
                    case 'w':
                        date.setDate(date.getDate() + (d * 7));
                        break;
                    case 'M':
                        date.setMonth(date.getMonth() + d);
                        break;
                    case 'y':
                        date.setFullYear(date.getFullYear() + d);
                        break;
                }
                if (format) {
                    return this.format(date, format === 'format' ? this.FORMAT : format);
                }
                return date;
            },

            calc: function () {
                return this.calcDate.apply(this, [].slice.call(arguments));
            },

            /**
             * 주어진 날짜 형식의 문자열을 Date객체로 변환
             *
             * @function
             * @name vcui.date.parse
             * @param {string} dateStringInRange 날짜 형식의 문자열
             * @return {date} 주어진 날짜문자열을 파싱한 값을 Date형으로 반환
             * @example
             * vcui.date.parse('2014-11-12');
             * // Wed Nov 12 2014 00:00:00 GMT+0900 (대한민국 표준시)
             *
             * vcui.date.parse('20141112');
             * // Wed Nov 12 2014 00:00:00 GMT+0900 (대한민국 표준시)
             */
            parse: (function () {
                var isoExp = /^\s*(\d{4})(\d{2})(\d{2})(\d{2})?(\d{2})?(\d{2})?\s*$/;
                return function (dateStringInRange) {
                    var date, month, parts;

                    if (dateStringInRange instanceof Date) {
                        return core.clone(dateStringInRange);
                    }

                    dateStringInRange = (dateStringInRange + '').replace(/[^\d]+/g, '');
                    if (dateStringInRange.length !== 8 && dateStringInRange.length !== 14) {
                        return new Date(NaN);
                    }
                    if (dateStringInRange.length === 14) {
                        date = new Date(dateStringInRange.substr(0, 4) | 0,
                            (dateStringInRange.substr(4, 2) | 0) - 1,
                            dateStringInRange.substr(6, 2) | 0,
                            dateStringInRange.substr(8, 2) | 0,
                            dateStringInRange.substr(10, 2) | 0,
                            dateStringInRange.substr(12, 2) | 0
                        );
                        if (!isNaN(date)) {
                            return date;
                        }
                    }
                    date = new Date(dateStringInRange);
                    if (!isNaN(date)) {
                        return date;
                    }

                    date = new Date(NaN);
                    parts = isoExp.exec(dateStringInRange);

                    if (parts) {
                        month = +parts[2];
                        date.setFullYear(parts[1] | 0, month - 1, parts[3] | 0);
                        date.setHours(parts[4] | 0);
                        date.setMinutes(parts[5] | 0);
                        date.setSeconds(parts[6] | 0);
                        if (month != date.getMonth() + 1) {
                            date.setTime(NaN);
                        }
                        return date;
                    }
                    return date;
                };
            })(),

            /**
             * 두 날짜의 월 간격
             * @param {date} d1 날짜 1
             * @param {date} d2 날짜 2
             * @return {number} 두날짜의 월차
             * vcui.date.monthDiff('2011-02-12', '2014-11-23'); // 44
             */
            monthDiff: function (d1, d2) {
                d1 = this.parse(d1);
                d2 = this.parse(d2);

                var months;
                months = (d2.getFullYear() - d1.getFullYear()) * 12;
                months -= d1.getMonth() + 1;
                months += d2.getMonth();
                return months;
            },

            /**
             * 주어진 년월의 일수를 반환
             *
             * @param {number} year 년도
             * @param {number} month 월
             * @return {date} 주어진 년월이 마지막 날짜
             * @example
             * vcui.date.daysInMonth(2014, 2); // 28
             */
            daysInMonth: function (year, month) {
                var dd = new Date(year | 0, month | 0, 0);
                return dd.getDate();
            },

            /**
             * 밀리초를 시,분,초로 변환
             * @param amount 밀리초값
             * @return {object} dates 변환된 시간 값
             * @return {number} dates.days 일 수
             * @return {number} dates.hours 시간 수
             * @return {number} dates.mins 분 수
             * @return {number} dates.secs 초 수
             * @example
             * vcui.date.splits(2134000);
             * // {days: 0, hours: 0, mins: 35, secs: 34}
             */
            splits: function (amount) {
                var days, hours, mins, secs;

                amount = amount / 1000;
                days = Math.floor(amount / 86400), amount = amount % 86400;
                hours = Math.floor(amount / 3600), amount = amount % 3600;
                mins = Math.floor(amount / 60), amount = amount % 60;
                secs = Math.floor(amount);

                return {
                    days: days,
                    hours: hours,
                    mins: mins,
                    secs: secs
                };
            },

            /**
             * 주어진 두 날짜의 간견을 시, 분, 초로 반환
             *
             * @param {date} t1 기준 시간
             * @param {date} t2 비교할 시간
             * @return {object} dates 시간차 값들이 들어있는 객체
             * @return {number} dates.ms 밀리초
             * @return {number} dates.secs 초
             * @return {number} dates.mins 분
             * @return {number} dates.hours 시
             * @return {number} dates.days 일
             * @return {number} dates.weeks 주
             * @return {number} dates.diff
             *
             * @example
             * vcui.date.diff(new Date, new Date(new Date() - 51811));
             * // {ms: 811, secs: 51, mins: 0, hours: 0, days: 0, weeks: 0, diff: 51811}
             */
            diff: function (t1, t2) {
                if (!core.type(t1, 'date')) {
                    t1 = new Date(t1);
                }

                if (!core.type(t2, 'date')) {
                    t2 = new Date(t2);
                }

                var diff = t1.getTime() - t2.getTime(),
                    ddiff = diff;

                diff = Math.abs(diff);

                var ms = diff % 1000;
                diff /= 1000;

                var s = Math.floor(diff % 60);
                diff /= 60;

                var m = Math.floor(diff % 60);
                diff /= 60;

                var h = Math.floor(diff % 24);
                diff /= 24;

                var d = Math.floor(diff);

                var w = Math.floor(diff / 7);

                return {
                    ms: ms,
                    secs: s,
                    mins: m,
                    hours: h,
                    days: d,
                    weeks: w,
                    diff: ddiff
                };
            },

            /**
             * 주어진 날짜가 몇번째 주인가
             * @function
             * @param {date} date 날짜
             * @return {number}
             * @example
             * vcui.date.weekOfYear(new Date); // 2 // 2015-01-05를 기준으로 했을 때
             */
            weekOfYear: (function () {
                var ms1d = 1000 * 60 * 60 * 24,
                    ms7d = 7 * ms1d;

                return function (date) {
                    var DC3 = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate() + 3) / ms1d,
                        AWN = Math.floor(DC3 / 7),
                        Wyr = new Date(AWN * ms7d).getUTCFullYear();

                    return AWN - Math.floor(Date.UTC(Wyr, 0, 7) / ms7d) + 1;
                };
            }()),

            /**
             * 윤년인가
             * @param {number} y 년도
             * @return {boolean}
             * @example
             * vcui.date.isLeapYear(2014); // false
             */
            isLeapYear: function (y) {
                if (toString.call(y) === '[object Date]') {
                    y = y.getUTCFullYear();
                }
                return (( y % 4 === 0 ) && ( y % 100 !== 0 )) || ( y % 400 === 0 );
            },

            /**
             * 날짜 가감함수
             * @param {date} date 날짜
             * @param {string} interval 가감타입(ms, s, m, h, d, M, y)
             * @param {number} value 가감 크기
             * @return {date} 가감된 날짜의 Date객체
             * @example
             * // 2014-06-10에서 y(년도)를 -4 한 값을 계산
             * var d = vcui.date.add(new Date(2014, 5, 10), 'y', -4); // 2010-06-10
             */
            add: function (date, interval, value) {
                var d = new Date(date.getTime());
                if (!interval || value === 0) {
                    return d;
                }

                switch (interval) {
                    case "ms":
                        d.setMilliseconds(d.getMilliseconds() + value);
                        break;
                    case "s":
                        d.setSeconds(d.getSeconds() + value);
                        break;
                    case "m":
                        d.setMinutes(d.getMinutes() + value);
                        break;
                    case "h":
                        d.setHours(d.getHours() + value);
                        break;
                    case "d":
                        d.setDate(d.getDate() + value);
                        break;
                    case "M":
                        d.setMonth(d.getMonth() + value);
                        break;
                    case "y":
                        d.setFullYear(d.getFullYear() + value);
                        break;
                }
                return d;
            },

            /**
             * 주어진 두 날짜 중에서 큰값 반환
             * @param {date} a
             * @param {date} b
             * @return {date}
             */
            max: function (a, b) {
                return new Date(Math.max(this.parse(a), this.parse(b)));
            },

            /**
             * 주어진 두 날짜 중에서 작은값 반환
             * @param {date} a
             * @param {date} b
             * @return {date}
             */
            min: function (a, b) {
                return new Date(Math.min(this.parse(a), this.parse(b)));
            },

            /**
             * 시분초 normalize화 처리
             * @param {number} h 시
             * @param {number} M 분
             * @param {number} s 초
             * @param {number} ms 밀리초
             * @return {object} dates 시간정보가 담긴 객체
             * @return {number} dates.day 일
             * @return {number} dates.hour 시
             * @return {number} dates.min 분
             * @return {number} dates.sec 초
             * @return {number} dates.ms 밀리초
             * @example
             * vcui.date.normalize(0, 0, 120, 0) // {day:0, hour: 0, min: 2, sec: 0, ms: 0} // 즉, 120초가 2분으로 변환
             */
            normalize: function (h, M, s, ms) {
                h = h || 0;
                M = M || 0;
                s = s || 0;
                ms = ms || 0;

                var d = 0;

                if (ms > 1000) {
                    s += Math.floor(ms / 1000);
                    ms = ms % 1000;
                }

                if (s > 60) {
                    M += Math.floor(s / 60);
                    s = s % 60;
                }

                if (M > 60) {
                    h += Math.floor(M / 60);
                    M = M % 60;
                }

                if (h > 24) {
                    d += Math.floor(h / 24);
                    h = h % 24;
                }

                return {
                    day: d,
                    hour: h,
                    min: M,
                    sec: s,
                    ms: ms
                }
            }
        };
    });
})(window[LIB_NAME], window);
