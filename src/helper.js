/**
 * @author comahead@gmail.com
 */
;(function (core, global, undefiend) {
    "use strict";

    /**
     * @function
     * @description helper 생성 함수
     * @name vcui.helper
     * @param {string} name 헬퍼 이름
     * @param {object} props class 속성
     * @returns {vcui.Class}
     */
    vcui.helper = function helper(name, props) {
        return core.helper[name] = core.BaseClass.extend(props);
    };

})(window[LIB_NAME], window);
