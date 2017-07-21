/**
 * jQuery 확장
 */
(function ($, core, context, undefined) {
    "use strict";

    $.extend(jQuery.expr[':'], {
        focusable: function (el, index, selector) {
            // 160112 password type 추가
            return $(el).is('a, button, input[type=password], input[type=text], input[type=file], input[type=checkbox], input[type=radio], select, textarea, [tabindex]');
        }
    });

    /**
     * jQuery 객체
     * @class
     * @name $
     */
        // TODO: 뺄 것
    var oldOff = $.fn.off;
    /**
     * name 이벤트 언바인딩
     * @function
     * @name $#off
     * @return {jQuery}
     */
    $.fn.unbind = $.fn.off = function (name) {
        if ((this[0] === context || this[0] === document)
            && name !== 'ready' && name.indexOf('.') < 0) {
            throw new Error('[' + name + '] window, document에서 이벤트를 off할 때는 네임스페이스를 꼭 넣어주셔야 합니다.');
        }
        if (IS_DEBUG) {
            console.log('off', name);
            console.trace();
        }
        return oldOff.apply(this, arguments);
    };

    // TODO 테스트용
    if (IS_DEBUG) {
        var oldOn = $.fn.on;
        $.fn.on = function (name) {
            if (this[0] === context || this[0] === document) {
                console.log('on', name);
                console.trace();

            }
            return oldOn.apply(this, arguments);
        };
    }

    /**
     * value값의 앞뒤 빈문자 제거
     * @param {string} value 문자열 값
     * @param {string} value 문자열 값
     * @return {string} 빈값이 제거된 문자열
     */
    $.fn.trimVal = function (value) {
        if (arguments.length === 0) {
            return $.trim(this.val());
        } else {
            return this.val($.trim(value));
        }
    };

    /**
     * value값을 URI인코딩하여 반환
     * @function
     * @name $#encodeURI
     * @return {string} 인코딩된 문자열
     */
    $.fn.encodeURI = function (value) {
        if (arguments.length === 0) {
            return encodeURIComponent($.trim(this.val()));
        } else {
            return this.val(encodeURIComponent(value));
        }
    };

    /**
     * 클래스 치환
     * @function
     * @name $#replaceClass
     * @param {string} old 대상클래스
     * @param {string} newCls 치환클래스
     * @return {jQuery}
     */
    $.fn.replaceClass = function (old, newCls) {
        return this.each(function () {
            $(this).removeClass(old).addClass(newCls);
        });
    };

    /**
     * 아무것도 안하는 빈함수
     * @function
     * @name $#noop
     * @return {jQuery}
     * @example
     * $(this)[ isDone ? 'show' : 'noop' ](); // isDone이 true에 show하되 false일때는 아무것도 안함.
     */
    $.fn.noop = function () {
        return this;
    };

    /**
     * 체크된 항목의 값을 배열에 담아서 반환
     * @function
     * @name $#checkedValues
     * @return {array}
     */
    $.fn.checkedValues = function () {
        var results = [];
        this.each(function () {
            if ((this.type === 'checkbox' || this.type === 'radio') && !this.disabled && this.checked === true) {
                results.push(this.value);
            }
        });
        return results;
    };

    /**
     * 같은 레벨에 있는 다른 row에서 on를 제거하고 현재 row에 on 추가
     * @function
     * @name $#activeItem
     * @param {string} className='on' 활성 클래스명
     * @return {jQuery}
     */
    $.fn.activeItem = function (className, isReverse) {
        className = className || 'on';
        return this.toggleClass(className, !isReverse).siblings().toggleClass(className, isReverse).end();
    };


    /**
     * 해당 이미지가 로드됐을 때 콜백함수 실행
     * @function
     * @name $#onImgLoaded
     * @param {function(width:Number, height:Number)} callback width, height 인자를 갖는 콜백함수
     * @return {jQuery}
     */
    $.fn.onImgLoaded = function (callback) {
        core.util.waitImageLoad(this).done(callback);
        return this;
    };

    /**
     * 비동기 방식으로 이미지 사이즈를 계산해서 콜백함수로 넘겨준다.
     * @function
     * @name $#getImgSize
     * @param {function(width:Number, height:Number)} cb width, height 인자를 갖는 콜백함수
     * @return {jQuery}
     */
    $.fn.getImgSize = function (cb) {
        var $img = this.eq(0);
        $img.onImgLoaded(function () {
            cb && cb.call($img[0], $img.css('width', '').width(), $img.css('height', '').height());
        });
        return this;
    };


})(jQuery, window[LIB_NAME], window);
