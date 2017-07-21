/**
 * @author comahead@gmail.com
 */
;(function ($, core, global, undefined) {
    /**
     * @namespace
     * @name vcui.dom
     */
    core.addon('dom', {
        /**
         * 이벤트의 좌표 추출
         * @param ev 이벤트 객체
         * @param {string} type mouseend나 touchend 이벤트일때 'end'를 넘겨주면 좀더 정확한 값이 반환된다.
         * @return {{x: (*|number), y: (*|number)}}
         */
        getEventPoint: function (ev, type) {
            var e = ev.originalEvent || ev;
            if (type === 'end' || ev.type === 'touchend') {
                e = e.changedTouches && e.changedTouches[0] || e;
            } else {
                e = e.touches && e.touches[0] || e;
            }
            return {
                x: e.pageX || e.clientX,
                y: e.pageY || e.clientY
            };
        },
        /**
         *  캐럿 위치 반환
         *  @param {element} el 인풋 엘리먼트
         *  @return {{begin:(number), end:(number)}}
         */
        getCaretPos: function (el) {
            if (core.type(el.selectionStart, 'number')) {
                return {
                    begin: el.selectionStart,
                    end: el.selectionEnd
                };
            }

            var range = document.selection.createRange();
            if (range && range.parentElement() === el) {
                var inputRange = el.createTextRange(), endRange = el.createTextRange(), length = el.value.length;
                inputRange.moveToBookmark(range.getBookmark());
                endRange.collapse(false);

                if (inputRange.compareEndPoints('StartToEnd', endRange) > -1) {
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
        /**
         * 캐럿 위치 설정
         *
         * @param {element} el 엘리먼트
         * @param {object|number} pos 위치시키고자 하는 begin & end
         * @param {number} pos.begin
         * @param {number} pos.end
         */
        setCaretPos: function (el, pos) {
            if (!core.type(pos, 'object')) {
                pos = {
                    begin: pos,
                    end: pos
                };
            }

            if (el.setSelectionRange) {
                //el.focus();
                el.setSelectionRange(pos.begin, pos.end);
            } else if (el.createTextRange) {
                var range = el.createTextRange();
                range.collapse(true);
                range.moveEnd('character', pos.end);
                range.moveStart('character', pos.begin);
                range.select();
            }
        },
        /**
         * $el요소의 현재 위치를 반환
         * @param {element} $el
         * @return {object} data
         * @return {number} data.x
         * @return {number} data.y
         */
        position: function () {
            return core.css3.position.apply(core.css3, [].slice.call(arguments, 0));
        },

        /**
         * @function
         *
         * css3가 지원되면 transition으로, 아닌 곳에서는 left으로 el를 움직여준다.
         * @param {element} $el 대상 엘리먼트
         * @param {number} x x축 이동 크기
         * @param {number} y y축 이동 크기
         * @param {number} duration 애니메이션 시간
         * @param {function} [callback] 이동이 완료됐을 때 실행되는 콜백함수
         */
        move: core.css3.support ? function () {
            core.css3.move.apply(core.css3, [].slice.call(arguments, 0));
        } : function ($el, x, y, duration, callback) {
            var css = {};
            if (typeof x !== 'undefined') {
                css.left = x;
            }
            if (typeof y !== 'undfined') {
                css.top = y;
            }

            if (!duration) {
                $el.css(css);
                callback && callback();
            } else {
                $el.stop(false, true).animate(css, duration, function () {
                    callback && callback.apply(this, [].slice.call(arguments, 0));
                });
            }
        },
        /**
         * 주어진 el이 container 내부에 속한 엘리먼트인가
         * @param {element} container 컨테이너 엘리먼트
         * @param {element} el 엘리먼드
         * @param {boolean} [isIncludeSelf=true] 컨테이너 자신도 체크대상에 포함시킬 것인가
         * @returns {boolean}
         */
        contains: function (container, el, isIncludeSelf) {
            if (!container || !el) {
                return false;
            }
            if ('contains' in container) {
                return (container !== el && container.contains(el)) || (isIncludeSelf === true && container === el);
            } else {
                return (container.compareDocumentPosition(el) % 16) || (isIncludeSelf === true && container === el);
            }
        },

        /**
         * 눌러진 마우스 버튼 반환
         * @param {jquery.event} e
         * @return {string} [left|middle|right]
         */
        getMouseButton: function (e) {
            var type = '';
            if (e.which == null) {
                type = (e.button < 2) ? 'left' : ((e.button == 4) ? 'middle' : 'right');
            } else {
                type = (e.which < 2) ? 'left' : ((e.which == 2) ? 'middle' : 'right');
            }
            return type;
        },

        /**
         * 도큐먼트의 높이를 반환
         * @return {number}
         * @example
         * alert(vcui.dom.getDocHeight());
         */
        getDocHeight: function () {
            var doc = document,
                bd = doc.body,
                de = doc.documentElement;

            return Math.max(
                Math.max(bd.scrollHeight, de.scrollHeight),
                Math.max(bd.offsetHeight, de.offsetHeight),
                Math.max(bd.clientHeight, de.clientHeight)
            );
        },

        /**
         * 도큐먼트의 너비를 반환
         * @return {number}
         * @example
         * alert(vcui.dom.getDocWidth());
         */
        getDocWidth: function () {
            var doc = document,
                bd = doc.body,
                de = doc.documentElement;
            return Math.max(
                Math.max(bd.scrollWidth, de.scrollWidth),
                Math.max(bd.offsetWidth, (de.offsetWidth - (de.offsetWidth - de.clientWidth))),
                Math.max(bd.clientWidth, de.clientWidth)
            );
        },

        /**
         * 창의 너비를 반환
         * @return {number}
         * @example
         * alert(vcui.dom.getWinHeight());
         */
        getWinWidth: function () {
            var w = 0;
            if (self.innerWidth) {
                w = self.innerWidth;
            } else if (document.documentElement && document.documentElement.clientHeight) {
                w = document.documentElement.clientWidth;
            } else if (document.body) {
                w = document.body.clientWidth;
            }
            return w;
        },

        /**
         * 창의 높이를 반환
         * @return {number}
         * @example
         * alert(vcui.dom.getWinHeight());
         */
        getWinHeight: function () {
            var w = 0;
            if (self.innerHeight) {
                w = self.innerHeight;
            } else if (document.documentElement && document.documentElement.clientHeight) {
                w = document.documentElement.clientHeight;
            } else if (document.body) {
                w = document.body.clientHeight;
            }
            return w;
        },

        /**
         * 주어진 요소의 사이즈 & 위치를 반환
         * @param {element} elem
         * @return {{width:Number, height:Number, offset:{top:Number, left:Number}}} {width: 너비, height: 높이, offset: { top: 탑위치, left: 레프트위치}}
         *
         * @example
         * var dims = vcui.dom.getDimensions('#box');
         * console.log(dims.left, dims.top, dims.width, dims.height);
         */
        getDimensions: function (elem) {
            if (core.type(elem, 'string')) {
                elem = $(elem);
            }

            var el = elem[0];
            if (el.nodeType === 9) {
                return {
                    width: elem.width(),
                    height: elem.height(),
                    offset: {top: 0, left: 0}
                };
            }
            if ($.isWindow(el)) {
                return {
                    width: elem.width(),
                    height: elem.height(),
                    offset: {top: elem.scrollTop(), left: elem.scrollLeft()}
                };
            }
            if (el.preventDefault) {
                return {
                    width: 0,
                    height: 0,
                    offset: {top: el.pageY, left: el.pageX}
                };
            }
            return {
                width: elem.outerWidth(),
                height: elem.outerHeight(),
                offset: elem.offset()
            };
        },

        /**
         * 휠이벤트의 deltaY 추출(위로: 1, 아래로: -1)
         * @param {jQuery#Event}
         * @return {number} deltaY
         * @example
         * $el.on('mousewheel DOMMouseScroll wheel', function (e) {
             *     var deltaY = vcui.dom.getDeltaY(e);
             * });
         */
        getDeltaY: function (e) {
            return this.getWheelDelta(e).y;
        },

        /**
         * 휠이벤트의 deltaX 추출(우: 1, 좌: -1)
         * @param {jQuery#Event}
         * @example
         * $el.on('mousewheel DOMMouseScroll wheel', function (e) {
             *     var deltaX = vcui.dom.getDeltaX(e);
             * });
         */
        getDeltaX: function (e) {
            return this.getWheelDelta(e).x;
        },

        /**
         * 휠이벤트의 deltaX, deltaY 추출(상: 1, 하: -1, 우: 1, 좌: -1)
         * @param {jQuery#Event}
         * @return {{x:Number, y:Number}}
         * @example
         * $el.on('mousewheel DOMMouseScroll wheel', function (e) {
             *     var delta = vcui.dom.getWheelDelta(e);
             *     // delta.x;
             *     // delta.y;
             * });
         */
        getWheelDelta: function (e) {
            var wheelDeltaX, wheelDeltaY;

            e = e.originalEvent || e;
            if ('deltaX' in e) {
                if (e.deltaMode === 1) {
                    wheelDeltaX = -e.deltaX;
                    wheelDeltaY = -e.deltaY;
                } else {
                    wheelDeltaX = -e.deltaX;
                    wheelDeltaY = -e.deltaY;
                }
            } else if ('wheelDeltaX' in e) {
                wheelDeltaX = e.wheelDeltaX;
                wheelDeltaY = e.wheelDeltaY;
            } else if ('wheelDelta' in e) {
                wheelDeltaX = wheelDeltaY = e.wheelDelta;
            } else if ('detail' in e) {
                wheelDeltaX = wheelDeltaY = -e.detail;
            } else {
                wheelDeltaX = wheelDeltaY = 0;
            }
            return {
                x: wheelDeltaX === 0 ? 0 : (wheelDeltaX > 0 ? 1 : -1),
                y: wheelDeltaY === 0 ? 0 : (wheelDeltaY > 0 ? 1 : -1)
            };
        },

        /**
         * 두 포인터의 간격을 계산
         * @param {{x: (*|Number), y: (*|Number)}} a
         * @param {{x: (*|Number), y: (*|Number)}} b
         * @return {{x: Number, y: Number}}
         */
        getDiff: function (a, b) {
            return {
                x: a.x - b.x,
                y: a.y - b.y
            };
        },

        /**
         * 두 포인터간의 각도 계산
         * @param {{x: (*|Number), y: (*|Number)}} startPoint 시작점
         * @param {{x: (*|Number), y: (*|Number)}} endPoint 끝점
         * @return {number} 각도
         */
        getAngle: function (startPoint, endPoint) {
            var x = startPoint.x - endPoint.x;
            var y = endPoint.y - startPoint.y;
            var r = Math.atan2(y, x); //radians
            var angle = Math.round(r * 180 / Math.PI); //degrees

            if (angle < 0) {
                angle = 360 - Math.abs(angle);
            }

            return angle;
        },

        /**
         * 시작점과 끝점을 비교해서 이동한 방향을 반환
         * @param {{x: (*|Number), y: (*|Number)}} startPoint 시작점
         * @param {{x: (*|Number), y: (*|Number)}} endPoint 끝점
         * @param {string} direction
         * @returns {string} left, right, down, up
         */
        getDirection: function (startPoint, endPoint, direction) {
            var angle,
                isHoriz = !direction || direction === 'horizontal' || direction === 'both',
                isVert = !direction || direction === 'vertical' || direction === 'both';

            if (isHoriz != isVert) {


                if (isHoriz) {
                    if (startPoint.x > endPoint.x) {
                        return 'left';
                    }
                    else if (startPoint.x == endPoint.x) {
                        return '';
                    }
                    else {
                        return 'right';
                    }
                } else {
                    if (startPoint.y > endPoint.y) {
                        return 'down';
                    }
                    else if (startPoint.y == endPoint.y) {
                        return '';
                    }
                    else {
                        return 'up';
                    }
                }
            }

            angle = this.getAngle(startPoint, endPoint);
            if ((angle <= 45) && (angle >= 0)) {
                return 'left';
            } else if ((angle <= 360) && (angle >= 315)) {
                return 'left';
            } else if ((angle >= 135) && (angle <= 225)) {
                return 'right';
            } else if ((angle > 45) && (angle < 135)) {
                return 'down';
            } else {
                return 'up';
            }
        },

        copyToClipboard: function (txt) {
            if (core.detect.isIE)
                return window.prompt("Press Ctrl+C (or CMD+C on Mac) to copy the text", txt);

            var result,
                txtNode = document.createElement("textarea");

            txtNode.style.position = "fixed";
            txtNode.style.top = "1px";
            txtNode.style.zIndex = "-9999";
            txtNode.style.opacity = "0";
            txtNode.value = txt;
            txtNode.setAttribute("readonly", "");
            txtNode.setAttribute("id", "someFakeId");
            document.body.appendChild(txtNode);
            txtNode.select();
            try {
                result = document.execCommand("copy")
            } catch (e) {
                result = false
            }
            return document.body.removeChild(txtNode),
                txtNode = null,
                result;
        }

    });
})(jQuery, window[LIB_NAME], window);
