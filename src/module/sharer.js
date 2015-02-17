/*!
 * @author common.module.Sharer.js
 * @email comahead@vi-nyl.com
 * @create 2014-11-25
 * @license MIT License
 */
(function($, core) {
    "use strict";

    var $doc = core.$doc,
        win = window,
        enc = encodeURIComponent;

    var detect = {
        PC: 1,
        MOBILE: 2,
        APP: 4
    };

    /**
     * @namespace
     * @name common.module.Sharer
     */
    var Sharer = /** @lends common.module.Sharer */{
        types: /** @lends common.module.Sharer.types */{ //['facebook', 'twitter', 'kakaotalk', 'kakaostory'/* , 'googleplus'*/],
            'facebook': /** @lends common.module.Sharer.types.facebook */{
                name: '페이스북',
                support: detect.PC | detect.MOBILE,
                size: [500, 300],
                baseUrl: 'https://www.facebook.com/sharer.php?',
                makeParam: function(data) {
                    data.url = core.uri.addParam(data.url, {
                        '_t': +new Date
                    });
                    return 'u=' + enc(data.url) + (data.title && '&t=' + enc(data.title));
                }
            },
            'twitter': /** @lends common.module.Sharer.types.twitter */{
                name: '트위터',
                support: detect.PC | detect.MOBILE,
                size: [550, 300],
                baseUrl: 'https://twitter.com/intent/tweet?',
                makeParam: function(data) {
                    data.desc = data.desc || '';

                    var length = 140 - data.url.length - 6, // ... 갯수
                        txt = data.title + ' - ' + data.desc;

                    txt = txt.length > length ? txt.substr(0, length) + '...' : txt;
                    return 'text=' + enc(txt + ' ' + data.url);
                }
            },
            'kakaotalk': /** @lends common.module.Sharer.types.kakaotalk */{
                name: '카카오톡',
                support: detect.APP | detect.MOBILE,
                makeParam: function(data) {
                    return {
                        msg: data.title + "\n" + (data.desc||''),
                        url: data.url,
                        appid: "common store",
                        appver: "0.1",
                        type: "link",
                        appname: "이마트스토어"
                    };
                }
            },
            'kakaostory': /** @lends common.module.Sharer.types.kakaostory */{
                name: '카카오스토리',
                support: detect.APP | detect.MOBILE,
                makeParam: function(data) {
                    return {
                        post: data.title + "\n" + (data.desc||'')+"\n"+data.url,
                        appid: "common.com",
                        appver: "1.0",
                        apiver: "1.0",
                        appname: "이마트 스토어"
                    };
                }
            },
            'line': /** @lends common.module.Sharer.types.line */{
                name: '라인',
                support: detect.APP | detect.MOBILE,
                baseUrl: 'line://msg/text/',
                store: {
                    android: {
                        intentPrefix: "intent://msg/text/",
                        intentSuffix: "#Intent;scheme=line;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;package=jp.naver.line.android;end"
                    },
                    ios: "http://itunes.apple.com/jp/app/line/id443904275"
                },
                makeParam: function(data) {
                    return '';
                }
            },
            'googleplus': /** @lends common.module.Sharer.types.googleplus */{
                name: '구글플러스',
                support: detect.PC | detect.MOBILE,
                baseUrl: 'https://plus.google.com/share?',
                makeParam: function(data) {
                    return 'url=' + enc(data.title + ' ' + data.url);
                }
            },
            'pinterest': /** @lends common.module.Sharer.types.pinterest */
            {
                name: '핀터레스트',
                detects: detect.PC | detect.MOBILE,
                size: [740, 300],
                baseUrl: 'https://www.pinterest.com/pin/create/button/?',
                makeParam: function(data) {
                    return 'url=' + enc(data.url) + '&media=' + enc(data.image) + '&description=' + enc(data.desc);
                }
            }
        },

        /**
         * 전송
         * @param {string} type facebook|twitter|line|kakaotalk|kakaostory|googleplus|pinterest
         * @param {Object} params
         * @param {string} params.url url 주소
         * @param {string} params.title 타이틀
         * @param {string} params.image 이미지
         * @param {string} params.desc 설명
         */
        _send: function(type, params) {
            var service = this.types[type];
            if (!service) {
                return;
            }

            params.url = (params.url + '').replace(/#$/g, '');
            params.url = params.url || location.href.replace(/#$/g, '');
            params.title = params.title || document.title;

            switch (type) {
                case 'facebook':
                case 'twitter':
                case 'pinterest':
                    window.open(
                        service.baseUrl + service.makeParam(params),
                        type, 'menubar=no,height=' + service.size[1] + ', width=' + service.size[0]);
                    break;
            }
        },

        /**
         * 공유하기 실행
         * @param {jQuery|Element|string} el 버튼
         * @param {string} type sns벤더명
         */
        share: function(el, type) {
            var $el = $(el),
                url = ($el.attr('href') || '').replace(/^#/, '') || $el.attr('data-url') || location.href,
                title = $el.attr('data-title') || $('head meta[property$=title]').attr('content') || document.title,
                desc = $el.attr('data-desc') || $('head meta[property$=description]').attr('content') || $('head meta[name=description]').attr('content') || '',
                image = $el.attr('data-image') || $('head meta[property$=image]').attr('content') || '';

            type || (type = $el.attr('data-sns'));

            if (!type) {
                alert('공유할 SNS타입을 지정해주세요.');
                return;
            }

            core.sns._send(type, {
                url: url,
                title: title,
                desc: desc,
                image: image
            });
        }
    };

    common.module('Sharer', Sharer);

    if (typeof define === "function" && define.amd) {
        define([], function() {
            return Sharer;
        });
    }

})(jQuery, window[LIB_NAME]);
