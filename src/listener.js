/**
 * @author comahead@gmail.com
 */
;(function (core, global, undefined) {
    "use strict";

    core.addon('Listener', function () {
        /**
         * 이벤트 리스너로서, 일반 객체에 이벤트 기능을 붙이고자 할경우에 사용
         * @class
         * @name vcui.Listener
         * @example
         * var obj = {};
         * vcui.Listener.build(obj);
         * obj.on('clickitem', function(){
         *   alert(0);
		 * });
         * obj.trigger('clickitem');
         */
        var Listener = /** @lends vcui.Listener# */ {
            /**
             * obj에 이벤트 기능 적용하기
             * @param {object} obj 이벤트를 적용하고자 하는 객체
             */
            build: function (obj) {
                vcui.extend(obj, vcui.Listener).init();
            },
            /**
             * UI모듈이 작성될 때 내부적으로 호출되는 초기화 함수
             */
            init: function () {
                this._listeners = $(this);
            },

            /**
             * 이벤트 핸들러 등록
             * @param {string} name 이벤트명
             * @param {string} [selector] 타겟
             * @param {eventCallback} [cb] 핸들러
             */
            on: function () {
                var lsn = this._listeners;
                lsn.on.apply(lsn, arguments);
                return this;
            },

            /**
             * 한번만 실행할 이벤트 핸들러 등록
             * @param {string} name 이벤트명
             * @param {string} [selector] 타겟
             * @param {eventCallback} [cb] 핸들러
             */
            once: function () {
                var lsn = this._listeners;
                lsn.once.apply(lsn, arguments);
                return this;
            },

            /**
             * 이벤트 핸들러 삭제
             * @param {string} name 삭제할 이벤트명
             * @param {function} [cb] 삭제할 핸들러. 이 인자가 없을 경우 name에 등록된 모든 핸들러를 삭제.
             */
            off: function () {
                var lsn = this._listeners;
                lsn.off.apply(lsn, arguments);
                return this;
            },

            /**
             * 이벤트 발생
             * @param {string} name 발생시킬 이벤트명
             * @param {*} [data] 데이타
             */
            trigger: function () {
                var lsn = this._listeners;
                lsn.trigger.apply(lsn, arguments);

                return this;
            }
        };

        return Listener;
    });
})(window[LIB_NAME], window);
