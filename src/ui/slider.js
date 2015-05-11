/*!
 * @author slider
 * @email comahead@gmail.com
 * @create 2015-01-09
 * @license MIT License
 */
(function (ctx, $, core, undefined) {
    "use strict";
    /**
     * 진행바 컨트롤 클래스
     * @class
     * @name axl.ui.Slidebar
     * @extends axl.ui.View
     */
    ui.View.extend( /**@lends axl.ui.Slidebar# */ {
        name: 'Slidebar',
        defaults: {
            interval: 100,
            direction: 'horizontal', // 방향
            maxValue: 0, // 최대값
            minValue: 0, // 최소값
            distValue: 10, // 이동크기
            titleFormat: '{0}' // 타이틀 포맷
        },
        selectors: {
            bar: '.d-bar' // 바
        },
        /**
         * 생성자
         * @param {jQuery|Element|string} el
         * @param {Object} options
         * @param [options.interval = 100]
         * @param [options.direction = 'horizontal'] // 방향
         * @param [options.maxValue = 0] // 최대값
         * @param [options.minValue = 0] // 최소값
         * @param [options.distValue = 10] // 이동크기
         * @param [options.titleFormat = '{0}'] // 타이틀(현재 바의 위치) 포맷
        */
        initialize: function(el, options) {
            if (this.supr(el, options) === false) {
                return;
            }

            var me = this;

            me.isHoriz = me.options.direction === 'horizontal'; // 방향
            me.sizeName = me.isHoriz ? 'width' : 'height'; // 사이즈명
            me.xyName = me.isHoriz ? 'X' : 'Y'; // 좌표방향명
            me.dirName = me.isHoriz ? 'left' : 'top'; // 방향명

            //me.conSize = me.$el[me.sizeName]();
            me.$bar.css(me.sizeName, 0).data('percent', 0).css('cursor', 'pointer').attr('title', '0'); // 타이틀
            me.$el.css('cursor', 'pointer');

            me._bindEvents();
        },
        /**
         * 이벤트 비인딩
         * @private
         */
        _bindEvents: function() {
            var me = this;

            // 바의 위치를 클릭한 위치로 이동
            me.on('click', function(e) {
                e.preventDefault();
                e.stopPropagation();

                if (me.$el.hasClass('disabled')) {
                    return;
                }

                var val = e['page' + me.xyName] - me.$el.offset()[me.dirName],
                    conSize = me.$el[me.sizeName](), // 트랙사이즈
                    per = ((me.isHoriz ? val : conSize - val) / conSize), // 퍼센테이지
                    newValue = (per * me.options.maxValue);

                me._trigger(newValue);
            });

            //me._bindBarSlide(); //
            // 모바일이 아닐 경우 키보드이벤트를 바인딩
            !isTouch && me._bindKeyboardEvents();
        },

        /**
         * 바에 드래그기능 바인딩
         */
        _bindBarSlide: function() {
            var me = this,
                start = 0,
                conSize = 0,
                timer = null;

            me.hammer = new Hammer(me.$bar[0]);
            me.hammer.on('dragstart', function(e) {
                if (me.options.maxValue <= 0 || me.$el.hasClass('disabled')) {
                    e.preventDefault();
                    return false;
                }
                // 드래그사 시작될 때 위치와 컨테이너 사이즈를 보관
                start = me.$bar.width();
                conSize = me.$el[me.sizeName]();
            });
            me.hammer.on('drag', function(e) {
                if (me.options.maxValue <= 0) {
                    return;
                }

                var val = e.gesture.deltaX + start,
                    per = (conSize - (conSize - val)) / conSize,
                    newValue = per * me.options.maxValue;

                me.setValue(newValue);

                clearTimeout(timer);
                timer = setTimeout(function() {
                    // 실시간으로 바뀌면 문제가 생길 소지가 있으므로 딜레이를 준다.(드래그가 끝난 후 0.3초동안 움직임이 없는 경우 이벤트를 날림)
                    me._trigger(newValue);
                }, 300);
            });
        },

        /**
         * 키보드 이벤트를 바인딩
         */
        _bindKeyboardEvents: function() {
            var me = this;

            if (!isTouch) {
                // 비터치기반 디바이스에서 키보드의 상하좌우 키로 바를 이동시킬 수 있도록 바인딩
                me.upKey = me.isHoriz ? 39 : 38; // 업키보드
                me.downKey = me.isHoriz ? 37 : 40; // 다운 키보드
                var lastTime = 0;

                me.on('keydown', function(e) {
                    if (e.keyCode === me.downKey || e.keyCode === me.upKey) { // <> 38:up, 40: down
                        e.stopPropagation();
                        e.preventDefault();

                        if (lastTime === 0) {
                            lastTime = +new Date;
                        }

                        // 키를 누른 상태가 유지되면, 0.3초마다 바를 이동
                        if ((+new Date) - lastTime < 200) {
                            return;
                        }

                        lastTime = +new Date;
                        me._moveBar(e.keyCode === me.downKey ? -1 : 1);
                    }
                }).on('keyup', function(e) {
                    if (e.keyCode === me.downKey || e.keyCode === me.upKey) {
                        e.stopPropagation();
                        e.preventDefault();

                        me._moveBar(e.keyCode === me.downKey ? -1 : 1);
                    }
                });
            }
        },

        /**
         * 값이 변경되었음을 날림
         * @param {Number} newValue
         */
        _trigger: function(newValue) {
            if (this.$el.hasClass('disabled')) {
                return;
            }

            var me = this,
                e = $.Event('valuechange');

            me.triggerHandler(e, {
                value: newValue
            });
            // 핸들러쪽에서 e.preventDefault()를 했을 경우 값변경을 취소
            if (e.isDefaultPrevented()) {
                return;
            }

            me.setValue(newValue);
        },

        /**
         * 바 이동
         * @param {Number} dir -1: 감소, 1: 증가
         * @private
         */
        _moveBar: function(dir) {
            var me = this,
                newValue = 0;

            if (dir < 0) {
                newValue = Math.max(0, me.value - me.options.distValue);
            } else {
                newValue = Math.min(me.options.maxValue, me.value + me.options.distValue);
            }

            me._trigger(newValue);
        },

        /**
         * 최대값 설정
         * @param {Number} newValue
         */
        setMaxValue: function(newValue) {
            var me = this;
            me.options.maxValue = newValue;
            if (newValue < me.value) {
                me.setValue(newValue);
            }
        },

        /**
         * 타이틀 변경
         * @param {String} value
         */
        setTitle: function(value) {
            var me = this;

            me.$bar[0].title = value;
        },

        /**
         * 값 설정
         * @param {Number} value
         */
        setValue: function(value) {
            var me = this,
                val;

            if (value < me.options.minValue || value > me.options.maxValue) {
                return;
            }

            me.value = value;
            if (me.options.maxValue === 0) {
                me.$bar[0].style[me.sizeName] = '0%';
                me.$bar.data('percent', 0);
            } else {
                me.$bar[0].style[me.sizeName] = (val = Math.min(100, ((value / me.options.maxValue) * 100))) + '%';
                me.$bar.data('percent', val);
            }
        }
    });
})(window, jQuery, window[LIB_NAME]);