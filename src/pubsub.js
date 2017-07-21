;(function ($, core, global, undefined) {
    /**
     * @namespace
     * @name vcui.PubSub
     * @description 발행/구독 객체: 상태변화를 관찰하는 옵저버(핸들러)를 등록하여, 상태변화가 있을 때마다 옵저버를 발행(실행)
     * 하도록 하는 객체이다..
     * @example
     * // 옵저버 등록
     * vcui.PubSub.on('customevent', function() {
	 *	 alert('안녕하세요');
	 * });
     *
     * // 등록된 옵저버 실행
     * vcui.PubSub.trigger('customevent');
     */
    core.addon('PubSub', function () {

        var PubSub = $(global);

        var tmp = /** @lends vcui.PubSub */{
            /**
             * 이벤트 바인딩
             * @function
             * @param {string} name 이벤트명
             * @param {eventCallback} handler 핸들러
             * @return {vcui.PubSub}
             */
            on: function (name, handler) {
                return this;
            },

            /**
             * 이벤트 언바인딩
             * @param {string} name 이벤트명
             * @param {function} [handler] 핸들러
             * @return {vcui.PubSub}
             */
            off: function (name, handler) {
                return this;
            },

            /**
             * 이벤트 트리거
             * @param {string} name 이벤트명
             * @param {object} [data] 핸들러
             * @return {vcui.PubSub}
             */
            trigger: function (name, data) {
                return this;
            }
        };


        return PubSub;
    });

})(jQuery, window[LIB_NAME], window);