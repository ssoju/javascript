;(function ($, core, global, undefined) {
    /**
     }
     * benchmark 모듈
     */
    core.addon(/** @lends vcui */{
        /**
         * timeStart("name")로 name값을 키로하는 타이머가 시작되며, timeEnd("name")로 해당 name값의 지난 시간을 로그에 출력해준다.
         *
         * @param {string} name 타이머의 키값
         * @param {boolean} reset=false 리셋(초기화) 여부
         *
         * @example
         * vcui.timeStart('animate');
         * ...
         * vcui.timeEnd('animate'); -> animate: 10203ms
         */
        timeStart: function (name, reset) {
            if (!name) {
                return;
            }
            var time = +new Date,
                key = "KEY" + name.toString();

            this.timeCounters || (this.timeCounters = {});
            if (!reset && this.timeCounters[key]) {
                return;
            }
            this.timeCounters[key] = time;
        },

        /**
         * timeStart("name")에서 지정한 해당 name값의 지난 시간을 로그에 출력해준다.
         *
         * @param {string} name 타이머의 키값
         * @return {number} 걸린 시간
         *
         * @example
         * vcui.timeStart('animate');
         * ...
         * vcui.timeEnd('animate'); -> animate: 10203ms
         */
        timeEnd: function (name) {
            if (!this.timeCounters) {
                return null;
            }

            var time = +new Date,
                key = "KEY" + name.toString(),
                timeCounter = this.timeCounters[key],
                diff;

            if (timeCounter) {
                diff = time - timeCounter;
                // 이 콘솔은 디버깅을 위한 것이므로 지우지 말것.
                console.log('[' + name + '] ' + diff + 'ms');
                delete this.timeCounters[key];
            }
            return diff;
        }
    });

})(jQuery, window[LIB_NAME], window)