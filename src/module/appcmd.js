/*!
 * @author appcmd.js
 * @email comahead@vi-nyl.com
 * @create 2015-01-16
 * @license MIT License
 */
(function ($, core, undefined) {
    "use strict";

    core.define('app', /** @lends common.app */{
        scheme: 'app-scheme://', // 스키마
        init: function() {
            if(this.inited){ return; }
            this.inited = true;

            this.ifrmCMD = $('<iframe>').attr({'src': 'about:blank'}).hide().appendTo('body')[0];
            this._bindEvents();
        },


        _bindEvents: function() {
            var me = this,
                $doc = $(document);

            $doc.off('.appcmd').on('click.appcmd', '[data-cmd]', function(e) {
                e.preventDefault();

                var $el = $(this),
                    cmd = $el.attr('data-cmd'),
                    href = $el.is('a') ? core.uri.removeHash($el.attr('href')||'') : ($el.is('button') ? $el.attr('data-href')||'' : ''),
                    param = $el.attr('data-param') || '';

                // d-login-require클래스가 있으면 로그인 체크를 한다.
                if($el.hasClass('d-login-require') && !window.isLogin){
                    if(confirm("로그인이 필요합니다.\n로그인 화면으로 이동하시겠습니까?")) {
                        common.PubSub.trigger('gotoLogin');
                    }
                    return;
                }

                if(href){
                    // 앱에서 페이지를 불려들일 경우 앞에 host를 붙여주어야 한다.
                    if(href[0] === '/'){
                        href = common.getHost() + href;
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
            this.ifrmCMD.src = this.scheme + cmd + '/' + (param ? '?' + param : '');
        }
    });

})(jQuery, window[LIB_NAME]);
