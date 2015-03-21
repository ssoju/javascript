/*!
 * @author: 김승일(comahead@vi-nyl.com)
 */ (function($, core, ui, undefined) {
    "use strict";

    if (location.href.indexOf('isapp=true') >= 0) {
        window.isApp = true;
    }

    // 앱 코어 ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    core.define('app', /** @lends emart.app */ {
        scheme: 'emart-today://', // 스키마
        init: function() {
            if (this.inited) {
                return;
            }
            this.inited = true;

            this.ifrmCMD = emart.mobile.getCmdFrame();
            this._bindEvents();
        },


        // 글로벌 이벤트 바인딩(data-cmd속성이 있는거는 앱호출용 링크임을 의미한다.)
        _bindEvents: function() {
            var me = this,
                $doc = core.$doc;

            // 앱호출 관련 링크를 클릭 시 앱에 호출
            $doc.off('.appcmd').on('click.appcmd', '[data-cmd]', function(e) {

                //alert("app-1");

                e.preventDefault();

                var $el = $(this),
                    cmd = $el.attr('data-cmd'),
                    href = $el.is('a') ? core.uri.removeHash($el.attr('href') || '') : ($el.is('button') ? $el.attr('data-href') || '' : ''),
                    param = $el.attr('data-param') || '';


                //alert("app-2");


                // d-login-require클래스가 있으면 로그인 체크를 한다.
                if ($el.hasClass('d-login-require') && !window.isLogin) {
                    if (confirm("로그인이 필요합니다.\n로그인 화면으로 이동하시겠습니까?")) {
                        emart.app.cmd('open_main_webpage', 'link=' + emart.Env.get('loginUrl'));
                    }
                    return;
                }

                //alert("app-3");

                if (href) {

                    // 앱에서 페이지를 불려들일 경우 앞에 host를 붙여주어야 한다.
                    if (href[0] === '/') {
                        href = emart.getHost() + href;
                    }
                    param = 'link=' + href;
                }

                me.cmd(cmd, param);
            });
        },


        /**
         * app 호출
         */
        cmd: function(cmd, param) {

            if (!window.isApp) {
                return;
            }
            this.ifrmCMD.src = this.scheme + cmd + '/' + (param ? '?' + param : '');
        }
    });
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    // 앱호출 함수 모음 //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    core.extend(core.app, /** @lends emart.app */ {




        // 마감시간 업델트
        updateShoppingTime: function(src) {
            this.cmd('update_shopping_time', src);
        }
    });


    // 앱에서 호출하는 함수 모음 /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    core.extend(core.app, /** @lends emart.app */ {


        // 앱에서 함수를 호출할 때 해당함수명으로 글로벌 이벤트를 날려준다.
        _triggerAppNotify: function(name, arg) {
            var args = [].slice.call(arg);
            core.PubSub.trigger.apply(core.PubSub, [name].concat([args]));
        },

        // request_new_message_exists에 대한 콜백 함수
        notifyNewMessageExists: function() {
            this._triggerAppNotify('notifyNewMessageExists', arguments);
        },

        // open_qr_and_search 에 대한 콜백
        notifyScanResult: function() {
            this._triggerAppNotify('notifyScanResult', arguments);
        },

        // 파일 업로드 후 호출되는 콜백(android 4.3 up)
        notifyFileUploadResult: function() {
            this._triggerAppNotify('notifyFileUploadResult', arguments);
        },

        // 영엽시간 요청 콜백
        notifyUpdateShoppingTime: function() {
            this._triggerAppNotify('notifyUpdateShoppingTime', arguments);
        },

        // 오른쪽 메뉴가 표시되거나 숨겨질 때 호출
        notifyMenubarVisible: function(result) {
            this._triggerAppNotify('notifyMenubarVisible', arguments);
        },

        // 이마트뮤직 이전음악 듣기(ios)
        notifyEmartMusicPrev: function() {
            this._triggerAppNotify('notifyEmartMusicPrev', arguments);
        },

        // 이마트뮤직 다음음악 듣기(ios)
        notifyEmartMusicNext: function() {
            this._triggerAppNotify('notifyEmartMusicNext', arguments);
        },

        // 지오로케이션 값 
        myGeolocation: function(x, y, errorCode) {
            this._triggerAppNotify('notifyMyGeolocation', arguments);
        }
    });
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

})(jQuery, window[LIB_NAME], window[LIB_NAME].ui);

$(function() {
    "use strict";

    // 초기 작업
    emart.app.init();

    // 대문자 	
    emart.$doc.on('focusin', 'input, textarea', function() {
        if (window.isIOS) {
            // 인풋에 포커싱됐을 때 키패드가 대문자로 안바뀌도록..
            this.setAttribute('autocapitalize', 'off');

            //ios 일때는 인풋박스에 포커스인될 때 위로 스크롤링을 해주어야 한다.
            var top = $(this).offset().top;
            $('html, body').stop().animate({
                scrollTop: top - 77
            });
        }
    });

});
