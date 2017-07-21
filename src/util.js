/**
 * @author comahead@gmail.com
 */
;(function ($, core, global, undefined) {
    /**
     * @namespace
     * @name vcui.util
     */
    core.addon('util', function () {
        return /** @lends vcui.util */{
            /**
             * ie하위버전에서 주어진 셀렉터에 해당하는 png 이미지가 정상적으로 출력되도록 AlphaImageLoader필터를 적용시켜 주는 함수
             * png
             * @param {string} selector
             * @example
             * vcui.util.png24('#thumbnail');
             */
            png24: function (selector) {
                var $target;
                if (typeof (selector) == 'string') {
                    $target = $(selector + ' img');
                } else {
                    $target = selector.find(' img');
                }
                var c = [];
                $target.each(function (j) {
                    c[j] = new Image();
                    c[j].src = this.src;
                    if (navigator.userAgent.match(/msie/i))
                        this.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(enabled='true',sizingMethod='scale',src='" + this.src + "')";
                });
            },

            /**
             * ie하위버전에서 페이지에 존재하는 모든 png 이미지가 정상적으로 출력되도록 AlphaImageLoader필터를 적용시켜 주는 함수
             * png Fix
             */
            pngFix: function () {
                var s, bg;
                $('img[@src*=".png"]', doc.body).each(function () {
                    this.css('filter', 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src=\'' + this.src + '\', sizingMethod=\'\')');
                    this.src = '/resource/images/core/blank.gif';
                });
                $('.pngfix', document.body).each(function () {
                    var $this = $(this);

                    s = $this.css('background-image');
                    if (s && /\.(png)/i.test(s)) {
                        bg = /url\("(.*)"\)/.exec(s)[1];
                        $this.css('background-image', 'none');
                        $this.css('filter', "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + bg + "',sizingMethod='scale')");
                    }
                });
            },

            /**
             * 페이지에 존재하는 플래쉬의 wmode모드를 opaque로 변경
             */
            wmode: function () {
                $('object').each(function () {
                    var $this;
                    if (this.classid.toLowerCase() === 'clsid:d27cdb6e-ae6d-11cf-96b8-444553540000' || this.type.toLowerCase() === 'application/x-shockwave-flash') {
                        if (!this.wmode || this.wmode.toLowerCase() === 'window') {
                            this.wmode = 'opaque';
                            $this = $(this);
                            if (typeof this.outerHTML === 'undefined') {
                                $this.replaceWith($this.clone(true));
                            } else {
                                this.outerHTML = this.outerHTML;
                            }
                        }
                    }
                });
                $('embed[type="application/x-shockwave-flash"]').each(function () {
                    var $this = $(this),
                        wm = $this.attr('wmode');
                    if (!wm || wm.toLowerCase() === 'window') {
                        $this.attr('wmode', 'opaque');
                        if (typeof this.outerHTML === 'undefined') {
                            $this.replaceWith($this.clone(true));
                        } else {
                            this.outerHTML = this.outerHTML;
                        }
                    }
                });
            },

            /**
             * 팝업을 띄우는 함수. (vcui.openPopup으로도 사용가능)
             * @param {string} url 주소
             * @param {Number=} width 너비. 또는 옵션
             * @param {Number=} height 높이.
             * @param {opts=} 팝업 창 모양 제어 옵션.(커스텀옵션: name(팝업이름), align(=center, 부모창의 가운데에 띄울것인가),
             * @example
             * vcui.openPopup('http://google.com', 500, 400, {name: 'notice', align: null, scrollbars: 'no'});
             * //or
             * vcui.openPopup('http://google.com', {name: 'notice', width: 500, height: 400, scrollbars: 'no'});
             */
            openPopup: function (url, width, height, opts) {
                if (arguments.length === 2 && core.type(width, 'json')) {
                    opts = width;
                    width = opts.width || 600;
                    height = opts.height || 400;
                }

                opts = $.extend({
                    name: 'popupWin',
                    width: width || 600,
                    height: height || 400,
                    align: 'center',
                    resizable: 'no',
                    scrollbars: 'no'
                }, opts);

                var target = opts.target || opts.name || 'popupWin',
                    feature = 'app_, ',
                    tmp = [],
                    winCoords;

                if (opts.align === 'center') {
                    winCoords = core.util.popupCoords(opts.width, opts.height);
                    opts.left = winCoords.left;
                    opts.top = winCoords.top;
                }
                delete opts.name;
                delete opts.target;
                delete opts.align;

                core.browser.isSafari && tmp.push('location=yes');
                core.each(opts, function (val, key) {
                    tmp.push(key + '=' + val);
                });
                feature += tmp.join(', ');

                var popupWin = window.open(url, target, feature);
                /*if (!popupWin || popupWin.outerWidth === 0 || popupWin.outerHeight === 0) {
                 alert("팝업 차단 기능이 설정되어 있습니다\n\n차단 기능을 해제(팝업허용) 한 후 다시 이용해 주세요.");
                 return false;
                 }

                 if (popupWin.location.href === 'about:blank') {
                 popupWin.location.href = url;
                 }*/

                return popupWin;
            },

            /**
             * 팝업을 띄운 후에 주어진 콜백함수를 호출
             * @param {string} url 주소
             * @param {object} feature 팝업 모양 (커스텀옵션: name(팝업이름), align(=center: 부모창의 가운데에 띄울것인가),
             * @param {function()} (Optional) callback 띄워진 후에 실행할 콜백함수
             * @example
             * vcui.util.openPopupAndExec('http://google.com', {name: 'notice', width: 500, height:400, align: 'nw'}, function(popup){
             *     alert('팝업이 정상적으로 띄워졌습니다.');
             *     popup.close(); // 열자마자 닫아버림....:-b
             * });
             */
            openPopupAndExec: function (url, feature, callback) {
                feature || (feature = {});

                var popupWin;

                if ((popupWin = this.openPopup(url, feature.width, feature.height, feature)) === false) {
                    return;
                }
                if (!callback) {
                    return;
                }

                var limit = 0, // 5초 이내에 팝업이 로딩안되면 콜백함수 무시해버림
                    fn = function () {
                        if (limit++ > 50) {
                            return;
                        }
                        if (!popupWin.document.body) {
                            setTimeout(fn, 100);
                            return;
                        }
                        callback && callback(popupWin);
                        popupWin.focus();
                    };

                if (!popupWin.document.body) {
                    setTimeout(fn, 100);
                } else {
                    fn();
                }
            },


            /**
             * 컨텐츠 사이즈에 맞게 창사이즈를 조절
             * @example
             * vcui.util.resizeToContent(); // 팝업에서만 사용
             */
            resizeToContent: function () {
                var innerX, innerY,
                    pageX, pageY,
                    win = window,
                    doc = win.document;

                if (win.innerHeight) {
                    innerX = win.innerWidth;
                    innerY = win.innerHeight;
                } else if (doc.documentElement && doc.documentElement.clientHeight) {
                    innerX = doc.documentElement.clientWidth;
                    innerY = doc.documentElement.clientHeight;
                } else if (doc.body) {
                    innerX = doc.body.clientWidth;
                    innerY = doc.body.clientHeight;
                }

                pageX = doc.body.offsetWidth;
                pageY = doc.body.offsetHeight;

                win.resizeBy(pageX - innerX, pageY - innerY);
            },

            /**
             * 팝업의 사이즈에 따른 화면상의 중앙 위치좌표를 반환
             * @param {number} w 너비.
             * @param {number} h 높이.
             * @return {{left:Number, top:Number}} {left: 값, top: 값}
             */
            popupCoords: function (w, h) {
                var dualScreenLeft = 'screenLeft' in window ? window.screenLeft : screen.left,
                    dualScreenTop = 'screenTop' in window ? window.screenTop : screen.top,
                    width = window.innerWidth || document.documentElement.clientWidth || screen.width,
                    height = window.innerHeight || document.documentElement.clientHeight || screen.height,
                    left = ((width / 2) - (w / 2)) + dualScreenLeft,
                    top = ((height / 2) - (h / 2)) + dualScreenTop;

                return {
                    left: left,
                    top: top
                };
            },

            /**
             * data-src속성에 있는 이미지url를 src에 설정하여 로드시키는 함수
             * @param {string} target 이미지 요소
             * @return {promise} promise
             * @example
             * vcui.util.loadImages('img[data-src]').done(function(){
             *     alert('모든 이미지 로딩 완료');
             * });
             */
            loadImages: function (target) {
                var $imgs = $(target),
                    len = $imgs.length,
                    def = $.Deferred();

                function loaded(e) {
                    if (e.type === 'error') {
                        def.reject(e.target);
                        return;
                    }
                    var $target;
                    if ($target = $(this).data('target')) {
                        $target.css('background', 'url(' + this.src + ')');
                    }

                    len--;
                    if (!len) {
                        def.resolve();
                    }
                }

                if (!len) {
                    def.resolve();
                } else {
                    $imgs.each(function (i) {
                        var $img = $imgs.eq(i);
                        if (!$img.is('img')) {
                            $img = $('<' + 'img>').data({
                                'target': $img[0],
                                'src': $img.attr('data-src')
                            });
                        }

                        $img.one("load.lazyload error.lazyload", loaded);
                        var src = $img.attr("data-src");

                        if (src) {
                            $img.attr("src", src);
                        } else if (this.complete) {
                            $img.trigger("load");
                        }
                    });

                }

                return def.promise();
            },

            /**
             * 정확한 사이즈계산을 위해 내부에 있는 이미지를 다 불러올 때까지 기다린다.
             * @param {jQuery} $imgs 이미지 요소들
             * @param {boolean} allowError 에러 허용여부(true이면 중간에 에러가 나도 다음 이미지를 대기)
             * @return {promise}
             * @example
             * vcui.util.waitImageLoad('img[data-src]').done(function(){
             *     alert('모든 이미지 로딩 완료');
             * });
             */
            waitImageLoad: function (imgs, allowError) {
                if (core.type(imgs, 'string')) {
                    imgs = $(imgs);
                }
                var me = this,
                    defer = $.Deferred(),
                    count = imgs.length,
                    loaded = function () {
                        count -= 1;
                        if (count <= 0) {
                            defer.resolve(imgs);
                        }
                    };
                if (count === 0) {
                    defer.resolve();
                } else {
                    imgs.each(function (i) {
                        if (this.complete) {
                            loaded();
                        } else {
                            var fakeImg = new Image();
                            fakeImg.onload = function () {
                                loaded();
                                fakeImg.onload = null;
                                fakeImg = null;
                            };
                            if (allowError) {
                                fakeImg.onerror = function () {
                                    loaded();
                                    fakeImg = null;
                                }
                            }
                            fakeImg.src = this.src;
                        }
                    });
                }

                return defer.promise();
            },

            /**
             * 어떤 요소의 자식들의 총 너비를 구하는 함수
             * @param {jQuery|NodeCollection} items 자식요소들
             * @return {number}
             */
            getItemsWidth: function (items) {
                var width = 0;
                $(items).each(function () {
                    width += $(this).width();
                });
                return width;
            },

            /**
             * 인피니트 스크롤
             * @param {String|jQuery| el
             * @param {function()} callback
             */
            infiniteScroll: function (el, callback) {
                var $wrap = el instanceof jQuery ? el : $(el),
                    wrapHeight = $wrap.height();

                $win.on('resizeend.infinitescroll', function () {
                    wrapHeight = $wrap.height();
                });

                $wrap.on('scroll', function (e) {
                    // 스크롤바가 도달 했을 때 ajax 콜
                    if ($wrap[0].scrollHeight - wrapHeight <= $wrap[0].scrollTop) {
                        callback();
                    }
                }).on('mousewheel DOMMouseScroll wheel', function (e) {
                    e.preventDefault();

                    var y = core.dom.getDeltaY(e);
                    $wrap.scrollTop($wrap[0].scrollTop - (y * 50));
                });
            },

            /**
             * 스크롤위치가 options.topOffset 를 넘었을 때 el를 fixed 설정
             * @param {String|jQuery|Element} el
             * @param options.topOffset
             * @param options.onFixed
             */
            fixedScroll: function (el, options) {
                var navTop = $(el).offset().top,
                    $body = $('body'),
                    offset,
                    isFixed = false;

                options = $.extend({
                    topOffset: 0,
                    onFixed: function () {
                    }
                }, options);

                offset = typeof options.topOffset === 'function' ? options.topOffset : function () {
                    return options.topOffset;
                };

                $win.on('scroll.fixedscroll resizeend.fixedscroll load.fixedscroll', function (e) {
                    if ($body.hasClass('opened_header')) {
                        return;
                    }
                    var top = $win.scrollTop(),
                        left = $win.scrollLeft(),
                        $el = $(el);

                    if (top >= navTop + offset()) {
                        if (!isFixed) { // fixed 가 안돼있을 때만 fixed 설정(리플로우 최소화).
                            isFixed = true;
                            navTop = $el.offset().top;
                            options.onFixed.call(el, isFixed);
                        }
                    } else {
                        if (isFixed) { // fixed 가 돼있을 때만 fixed 해제(리플로우 최소화)
                            isFixed = false;
                            options.onFixed.call(el, isFixed);
                        }
                    }
                    if (e.type === 'resizeend') {
                        if (isFixed) {
                            $el.css('width', '').css('width', core.util.getDocWidth()).addClass('fixed');
                        } else {
                            $el.css({'left': '', 'width': ''}).removeClass('fixed');
                        }
                    }
                    if (e.type === 'scroll' && isFixed) {
                        $el.css({'left': -left});
                    }
                });

                // 헤더가 열릴 때 토글해준다.
                core.PubSub.on('openheader closeheader', function (e) {
                    $(el).toggle(e.type === 'closeheader');
                });
            }
        };
    });

})(jQuery, window[LIB_NAME], window);
