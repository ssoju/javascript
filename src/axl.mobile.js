/*
 * 모바일전용 스크립트
 *
 * @author 김승일
 * @version 1.0 (2014. 5. 8) 최초생성
 * @depends jQuery 1.9.1
 */ (function($, core, ui, undefined) {
    "use strict";


    // TODO : 퍼브리싱서버 테스트용
    if (location.href.indexOf('MMI1') >= 0) {
        window.isLogin = true;
    }

    /**
     * @namespace
     * @name axl.mobile
     */
    core.define('mobile', /** @lends axl.mobile */ {
        appScheme: 'axl-today',

        init: function() {
            this.getCmdFrame();
        },

        /**
         * 커맨드 통신용 아이프레임을 생성
         */
        getCmdFrame: function() {
            if (!this.iframe) {
                this.iframe = document.createElement('iframe');
                this.iframe.src = 'about:blank';
                this.iframe.style.cssText = 'display:none;';
                this.iframe.id = 'cmd_frm';
                this.iframe.title = '빈프레임입니다.';
                document.body.appendChild(this.iframe);
            }
            return this.iframe;
        },



        /**
         * 앱 실행(For Android)
         * @private
         * @param {JSON} data 데이터
         */
        _openAppAndroid: function(data) {
            var uagent = navigator.userAgent.toLocaleLowerCase(),
                browser;
            if (uagent.search("chrome") > -1) {
                browser = "android+chrome";
            }
            var d = $.extend({
                install: 'market://details?id={uid}',
                command: this.appScheme + '://launch_app/',
                uid: 'com.axl.today'
            }, data);

            var iframe;
            var full_url = d.command;
            if (browser == "android+chrome") {
                window.location = "intent:" + full_url + "#Intent;package=" + d.uid + ";end;";
            } else {
                var install_block = function() {
                    window.location = d.install.replace('{uid}', d.uid);
                };

                if (!(iframe = document.getElementById('frm_runapp'))) {
                    iframe = document.createElement('iframe');
                    iframe.id = 'frm_runapp';
                    iframe.style.display = 'none';
                    iframe.title = '빈프레임입니다';
                }
                iframe.src = full_url;
                iframe.onload = install_block;
                document.body.appendChild(iframe);
            }
        },


        /**
         * 앱 실행(For IOS)
         * @private
         * @param {JSON} data 데이터
         */
        _openAppIOS: function(data) {
            var d = $.extend({
                install: 'http://itunes.apple.com/app/{uid}',
                command: this.appScheme + '://launch_app/',
                uid: 'id397728319'
            }, data);

            function install_app(app_url) {
                var R = new Date();
                setTimeout(function() {
                    if (new Date() - R < 2000) {
                        window.location.replace(app_url);
                    }
                }, 1500)
            }

            install_app(d.install.replace('{uid}', d.uid));
            window.location = d.command;
        },

        /**
         * 앱 실행(기본적으로 이마트앱이 실행한다.)
         * @param {String} data.install 설치 URL (ex: 'market://details?id={uid}' uid 는 data.uid로 치환)
         * @param {String} data.command 실행 커맨드
         * @param {String} data.uid 앱 아이디
         */
        openApp: function(data) {
            if (core.browser.isAndroid) {
                // 모바일 웹 안드로이드
                core.mobile._openAppAndroid(data.android);
            } else if (core.browser.isIOS) {
                // 모바일 웹 아이폰
                core.mobile._openAppIOS(data.ios);
            }
        },

        /**
         * 오른쪽 퀵메뉴를 여는 함수
         * @param {String} href 메뉴url
         */
        openRightMenu: function(href) {
            var menus = ['menuMain', 'pointcard', 'date_holiday', 'menuFavorite', 'emartMall', 'couponList'];
            var m = (href || '').match(/^\/menu\/([a-z]+)/i);
            if (m && m.length > 1) {
                var index = axl.array.indexOf(menus, m[1]);
                if (index >= 0 && index < menus.length && axl.pageLayout) {
                    axl.pageLayout.openRightMenu(index);
                }
            }
        }
    });

    /**
     * 더보기 유틸함수
     * @memberOf axl.ui
     * @function
     * @name buildMoreList
     * @param {String} options.list 리스트 타겟(ul의 부모요소)의 셀렉터
     * @param {String} options.url 리스트 서버주소
     * @param {String} options.moreButton 더보기 버튼 셀렉터
     * @param {Function} options.beforeSend ajax 호출하기 전에 실행되는 핸들러
     * @param {Function} options.complete ajax 호출이 완료된 후에 실행되는 핸들러
     * @param {Function} options.getParams ajax 호출 시 추가적으로 넘어야 하는 파라미터를 설정
     */
    ui.buildMoreList = function(options) {
        var opts = $.extend({
            beforeSend: function() {},
            complete: function() {},
            getParams: function() {
                return {};
            }
        }, options);

        var $el = $(opts.list),
            $list = $el.find('>ul'),
            $btn = $(opts.moreButton),
            url = opts.url,
            getLastSeq = function() {
                return ($list.children().last().attr('data-seq') | 0);
            },
            getTotalCount = function() {
                return ($list.children().first().attr('data-total-count') | 0);
            },
            getList = function(isMore) {
                opts.beforeSend();

                $.ajax({
                    url: url,
                    data: $.extend({
                        nextSeq: getLastSeq()
                    }, opts.getParams()),
                    cache: false
                }).done(function(html) {
                    var $items = $($.trim(html));
                    // 내부에 이미지가 있으면 다 로딩될때 까지 기다렸다가 표시한다.
                    //core.util.waitImageLoad($items.find('img'), true).done(function(){
                    // 데이타가 없음으로 오면
                    if ($items.hasClass('nodata_list')) {
                        $el.replaceWith($items); // replace 말고 그냥 ul에다 <li>데이타가 없습니다.</li> 를 삽입하는 방식으로 했으면 좋으련만..
                        $btn.addClass('none');
                    } else {
                        $list.find('.list_loading').remove();
                        $list.append(html);

                        if (getLastSeq() >= getTotalCount()) {
                            $btn.addClass('none');
                        } else {
                            $btn.removeClass('none').html('<span>더보기<span class="num">(' + getLastSeq() + '/' + getTotalCount() + ')</span></span>');
                        }
                        opts.complete($list, getLastSeq(), getTotalCount());
                    }

                    //});
                });
            };

        $btn.click(function() {
            getList(true);
        });

        getList();
    };

    // ajax 통신대생 페이지가 로그인필요 페이지이면 로그인 페이지로 보낸다.
    $.ajaxSetup({
        error: function(xhr, textStatus, error) {
            if (xhr.status === 401) {
                if (confirm("로그인이 필요합니다.\n로그인 화면으로 이동하시겠습니까?")) {
                    if (window.isApp) {
                        axl.app.cmd('open_main_webpage', 'link=' + axl.Env.get('loginUrl'));
                    } else {
                        location.href = axl.Env.get('loginUrl');
                    }
                }
            }
        }
    });

    // 아코디온 디폴트 옵션 설정
    core.browser.isTouch && ui.setDefaults('AccordionList', {
        isSlideType: true, // 슬라이딩 타입 지정
        slideTime: 300, // 슬라이딩 duration
        foldOthers: false // 열려있는 다른 것들을 닫을것인가
    });

    /*
     * IOS6 Button highlight fix
     * 클릭이벤트를 딜레이시킨다.
     */
    core.browser.isIOS && window.addEventListener('load', function() {
        var body = document.getElementsByTagName('body')[0];
        body.addEventListener('click', function(event) {
            var target = event.target,
                tag = undefined,
                type = undefined;

            while (target && target !== body) {
                tag = target.tagName.toLowerCase();
                type = tag === 'input' ? target.type.toLowerCase() : '';

                if (tag === 'button' || (tag === 'input' && (type === 'button' || type === 'submit' || type === 'image'))) {
                    (function() {
                        var a, b;
                        b = a = new Date();
                        while ((a.getTime() - b.getTime()) < 100) {
                            a = new Date();
                        }
                    })();
                    break;
                }

                target = target.parentNode;
            }
        }, false);
    }, false);

    // 달략 디폴트 옵션 설정
    ui.setDefaults('Calendar', {
        weekNames: ['일', '월', '화', '수', '목', '금', '토']
    });



    // 탑버튼 표시 /////////////////////////////////////////////////
    // 컨텐츠 크기가 윈도우 크기보다 클 경우에만 탑버튼 표시
    // (더보기 기능땜에 동적으로 페이지사이즈가 달라질 수 있기 때문에 1초마다 사이즈를 체크하도록 함)
    axl.mobile.moveTop = {
        $topBtn: null,
        isShow: false,
        // 시작
        start: function() {
            var me = this;

            me.$topBtn = $('#contents .btn_top');
            if (me.$topBtn.length === 0) {
                return;
            }

            me.topTimer = setInterval(me.toggle.bind(me), 500);

            // 탑버튼을 클릭할 경우 상단으로 스크롤링(애니메이션닝)
            me.$topBtn.click(function(e) {
                e.preventDefault();
                $('html, body').stop().animate({
                    scrollTop: 0
                }, 100);
            });

            // 뭔가 액션이 일어났을 때 컨텐츠가 변경됐을 수도 있기 때문에 체크
            axl.$doc.on('click.movetop', 'a, button, input, select', function(e) {
                me.toggle();
            });

            axl.$win.on('resize.movetop', function() {
                me.winHeight = axl.util.getWinHeight();
                me.toggle();
            }).triggerHandler('resize.movetop');
        },
        // 토글
        toggle: function() {
            var me = this,
                docHeight = me.$topBtn.css('display', 'block').offset().top; //axl.util.getDocHeight();

            me.hide();
            if (docHeight > me.winHeight) {
                me.show();
            }
        },
        // 표시
        show: function() {
            var me = this;
            me.$topBtn[0].style.display = 'block';
        },
        // 숨김
        hide: function() {
            var me = this;
            me.$topBtn[0].style.display = 'none';
        }
    };

})(jQuery, axl, axl.ui);

$(function() {

    // 모바일 초기작업 실행
    axl.mobile.init();

    if (!window.isApp) {
        // 버튼에 d-login-require클래스가 있는 경우, 
        // 로그인체크 후 로그인이 안되어 있으면 로그인페이지로 보낸다.
        axl.$doc.on('click.mobile', '.d-login-require', function(e) {

            // 로그인필요 페이지 체크
            if (!window.isLogin) {
                e.preventDefault();
                e.stopPropagation();

                if (confirm("로그인이 필요합니다.\n로그인 화면으로 이동하시겠습니까?")) {
                    location.href = axl.Env.get('loginUrl');
                }
            }
        });

        // 오른쪽 메뉴를 열어야 하는 링크인 경우
        axl.$doc.on('click.mobile', 'a[data-cmd=open_menu_webpage]', function(e) {
            if (this.href) {
                e.preventDefault();
                axl.mobile.openRightMenu(this.href);
            }
        });
    }

    // ** 앱실행용 링크 바인딩
    axl.$doc.on('click.mobile', 'a.d-openapp', function(e) {
        if (!axl.browser.isMobile) {
            return;
        }

        e.preventDefault();

        var $el = $(this),
            ios = $el.data('ios') || {},
            android = $el.data('android') || {};

        if ($el.attr('data-cmd')) {



            if (window.isApp) {
                return;
            } // 앱인 경우 data-cmd에 지정되어 있는 커맨드로 실행되도록 그냥 빠져나간다.

            axl.mobile.openApp({
                ios: {
                    command: 'axl-today://' + $el.attr('data-cmd')
                },
                android: {
                    command: 'axl-today://' + $el.attr('data-cmd')
                }
            });
        } else {
            if (window.isApp) { // 외부 앱을 실행해야 할 때, 앱인 경우 커맨드를 날림


                var d = window.isIOS ? ios : android;
                axl.app.cmd('open_app', 'scheme=' + (d.command || '') + '&install_param=' + (d.uid || ''));
            } else {

                axl.mobile.openApp({
                    ios: ios,
                    android: android
                });
            }
        }
    });

    // 앱과 로딩바 표시가 겹쳐지기 않도록 하기 위애 loaded클래스로 체크(앱에서는 load까지만 로딩바 표시)
    var $body = $('#body');
    $(window).on('load', function() {
        $body.addClass('loaded');
    });

    // 카카오 모듈 로딩
    axl.require(['/js/common/kakao.min.js']);
    axl.require(['/js/common/kakao.js']);
    axl.require(['/js/common/kakao_init.js']);


    // 푸터부분의 이마트 앱 다운로드
    $('#footer .d-download-app').on('click', function(e) {
        e.preventDefault();

        axl.mobile.openApp({
            ios: {
                uid: 'id397728319'
            },
            android: {
                uid: 'com.axl.today'
            }
        });
    });


    // 탑버튼 표시 /////////////////////////////////////////////////
    axl.mobile.moveTop.start();
    /////////////////////////////////////////////////////////////////

    // 디폴트로 포커스 라인을 안보이게 해놓고 pc에서만 포커스가 보이도록
    axl.$doc.on('keyup.outline', function(e) {
        if (e.which === 9) {
            $('body').addClass('outline');
            axl.$doc.off('keyup.outline');
        }
    });
});

// 로그아웃 함수
function logout(returnUrl) {
    if (confirm('로그아웃 하시겠습니까?')) {
        var url = returnUrl || '/main/main.do';

        if (window.isApp && url[0] === '/') {
            url = axl.getHost() + url;
        }

        $.ajax({
            type: "POST",
            url: "/login/logout.do",
            dataType: "json",
            success: function(data, status, xhr) {
                if ("00" == data.result) {
                    if (window.isApp) {
                        axl.app.cmd("logout_success");
                        setTimeout(function() {
                            axl.app.cmd('open_main_webpage', 'link=' + url);
                        }, 500);
                    } else {
                        window.location.href = url;
                    }
                }
            },
            error: function(xhr, status, errorThrown) {
                try {
                    var obj = eval("(" + xhr.responseText + ")");
                } catch (e) {}
            }
        });

    }
}
