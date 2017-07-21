/**
 * @author comahead@gmail.com
 */
;(function (core, global, undefined) {
    var doc = global.document;

    /**
     * css3관련 유틸함수들이 들어있는 객체이다.
     * @namespace
     * @name vcui.css3
     */
    core.addon('css3', function () {

        var _tmpDiv = core.tmpNode,
            _prefixes = ['Webkit', 'Moz', 'O', 'ms', ''],
            _style = _tmpDiv.style,
            _noReg = /^([0-9]+)[px]+$/,
            _vendor = (function () {
                var vendors = ['t', 'webkitT', 'MozT', 'msT', 'OT'],
                    transform,
                    i = 0,
                    l = vendors.length;

                for (; i < l; i++) {
                    if (vendors[i] + 'ransitionDuration' in _style && vendors[i] + 'ransform' in _style) {
                        return vendors[i].substr(0, vendors[i].length - 1);
                    }
                }

                return false;
            })(),
            string = core.string;

        function prefixStyle(name, isHyppen) {
            if (_vendor === false) return isHyppen ? name.toLowerCase() : name;
            if (_vendor === '') return isHyppen ? name.toLowerCase() : name;
            if (isHyppen) {
                return '-' + _vendor.toLowerCase() + '-' + name[0].toLowerCase() + string.dasherize(name.substr(1));
            }
            return _vendor + string.capitalize(name);
        }

        return /** @lends vcui.css3 */{
            /**
             * css3 지원여부
             * @var {boolean}
             * @example
             * if(vcui.css3.support) {
             * // css3 지원
             * }
             */
            support: _vendor !== false,
            /**
             * 3d style 지원여부
             * @var {boolean}
             * @example
             * if(vcui.css3.support3D) {
             * // 3d css3 지원
             * }
             */
            support3D: (function () {
                return false; // 자주 사용하지 않을 것 같아서 임시로 뺌
                /*var body = doc.body,
                    docEl = doc.documentElement,
                    docOverflow;
                if (!body) {
                    body = doc.createElement('body');
                    body.fake = true;
                    body.style.background = '';
                    body.style.overflow = 'hidden';
                    body.style.padding = '0 0 0 0';
                    docEl.appendChild(body);
                }
                docOverflow = docEl.style.overflow;
                docEl.style.overflow = 'hidden';

                var parent = doc.createElement('div'),
                    div = doc.createElement('div'),
                    cssTranslate3dSupported;

                div.style.position = 'absolute';
                parent.appendChild(div);
                body.appendChild(parent);

                div.style[prefixStyle('transform')] = 'translate3d(20px, 0, 0)';
                cssTranslate3dSupported = ($(div).position().left - div.offsetLeft == 20);
                if (body.fake) {
                    body.parentNode.removeChild(body);
                    docEl.offsetHeight;
                    body = null;
                } else {
                    parent.parentNode.removeChild(parent);
                }
                docEl.style.overflow = docOverflow;
                return cssTranslate3dSupported;*/
            })(),

            /**
             * 현재 브라우저의 css prefix명 (webkit or Moz or ms or O)
             * @var {string}
             * @example
             * $('div').css(vcui.css.vender+'Transform', 'translate(10px 0)');
             */
            vendor: _vendor,
            /**
             * 주어진 css속성을 지원하는지 체크
             *
             * @param {string} cssName 체크하고자 하는 css명
             * @return {boolean} 지원여부
             * @example
             * if(vcui.css3.has('transform')) { ...
             */
            has: function (name) {
                var a = _prefixes.length;
                if (name in _style) {
                    return true;
                }
                name = string.capitalize(name);
                while (a--) {
                    if (_prefixes[a] + name in _style) {
                        return true;
                    }
                }
                return false;
            },

            /**
             * $el요소의 현재 위치를 반환
             * @name vcui.css3.position
             * @function
             * @param {jQuery} $el
             * @return {object} data
             * @return {number} data.x
             * @return {number} data.y
             */
            position: (function () {
                var support = _vendor !== false;
                var transform = prefixStyle('transform');
                return support ? function ($el) {
                    var matrix = global.getComputedStyle ? global.getComputedStyle($el[0], null) : $el[0].currentStyle,
                        x, y;

                    if (!matrix[transform] || matrix[transform] === 'none') {
                        return {x: 0, y: 0};
                    }
                    matrix = matrix[transform].split(')')[0].split(', ');
                    x = +(matrix[12] || matrix[4] || 0);
                    y = +(matrix[13] || matrix[5] || 0);
                    return {x: x, y: y};
                } : function ($el) {
                    var matrix = $el[0].style, x, y;
                    x = +matrix.left.replace(/[^-\d.]/g, '');
                    y = +matrix.top.replace(/[^-\d.]/g, '');
                    return {x: x, y: y};
                };
            })(),

            transform: prefixStyle('transform'),
            transitionTimingFunction: prefixStyle('transitionTimingFunction'),
            transitionDuration: prefixStyle('transitionDuration'),
            transitionDelay: prefixStyle('transitionDelay'),
            transformOrigin: prefixStyle('transformOrigin'),
            transition: prefixStyle('transition'),
            translateZ: prefixStyle('perspective') in _style ? ' translateZ(0)' : '',
            transitionEnd: (function () {
                var names = {
                    WebkitTransition: 'webkitTransitionEnd',
                    MozTransition: 'transitionend',
                    transition: 'transitionend'
                };
                for (var name in names) {
                    if (core.tmpNode.style[name] !== undefined) {
                        return names[name];
                    }
                }
                return 'transitionend';
            })(),
            // 이름을 transitionStyle으로 바꾸면 안될려나
            style: function ($el, motion, dur, easing) {
                $el.css(this.transition, motion);
                $el.css(this.transitionDuration, dur + 's');
                $el.css(this.transitionTimingFunction, easing);
            },
            /**
             * 주어진 css명 앞에 현재 브라우저에 해당하는 벤더prefix를 붙여준다.
             *
             * @function
             * @param {string} cssName css명
             * @return {string}
             * @example
             * vcui.css3.prefix('transition'); // // webkitTransition
             */
            prefix: prefixStyle
        };
    });
    /////////////////////////////////////////////////////////////////////////////////////////////////

})(window[LIB_NAME], window);
