;(function (core, global, undefined) {
    "use strict";


    core.addon('Env', /** @lends vcui.Env */{
        configs: {},

        /**
         * 설정값을 꺼내오는 함수
         *
         * @param {string} name 설정명. `.`를 구분값으로 단계별로 값을 가져올 수 있다.
         * @param {*} [def] 설정된 값이 없을 경우 사용할 기본값
         * @return {*} 설정값
         * @example
         * vcui.Env.get('siteTitle'); // '바이널'
         */
        get: function (name, def) {
            var root = this.configs,
                names = name.split('.'),
                pair = root;

            for (var i = 0, len = names.length; i < len; i++) {
                if (!(pair = pair[names[i]])) {
                    return def;
                }
            }
            return pair;
        },

        /**
         * 설정값을 지정하는 함수
         *
         * @param {string} name 설정명. `.`를 구분값으로 단계를 내려가서 설정할 수 있다.
         * @param {*} value 설정값
         * @return {*} 설정값
         * @example
         * vcui.Env.set('siteTitle', '바이널');
         */
        set: function (name, value) {
            var root = this.configs,
                names = name.split('.'),
                len = names.length,
                last = len - 1,
                pair = root;

            for (var i = 0; i < last; i++) {
                pair = pair[names[i]] || (pair[names[i]] = {});
            }
            return (pair[names[last]] = value);
        }
    });
})(window[LIB_NAME], window);