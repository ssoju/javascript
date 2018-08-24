/*!
 * @author axl.module.Sharer.js
 * @email comahead@gmail.com
 * @create 2013-11-25
 * @license MIT License
 */
define('helper/sharer', ['jquery', 'vcui'], function ($, core) {
    "use strict";

    var $doc = core.$doc,
        win = window,
        enc = encodeURIComponent;

    var detect = {
        PC: 1,
        MOBILE: 2,
        APP: 4
    };

    var defaultOption = {
        selector: '.ui-sharer',
        attr: 'data-service',
        metas: {
            title: {},
            description: {},
            image: {}
        },
        onBeforeShare: function () {
        },
        onShrered: function () {
        }
    };

    var Sharer = /** @lends axl.module.Sharer */{
        support: detect,
        services: /** @lends axl.module.Sharer.services */{ //['facebook', 'twitter', 'kakaotalk', 'kakaostory'/* , 'googleplus'*/],
            'facebook': /** @lends axl.module.Sharer.services.facebook */{
                name: '페이스북',
                support: detect.PC | detect.MOBILE,
                size: [500, 300],
                url: 'https://www.facebook.com/sharer.php?',
                makeParam: function makeParam(data) {
                    data.url = core.uri.addParam(data.url, {
                        '_t': +new Date()
                    });
                    return {u: data.url, t: data.title || ''};
                }
            },
            'twitter': /** @lends axl.module.Sharer.services.twitter */{
                name: '트위터',
                support: detect.PC | detect.MOBILE,
                size: [550, 300],
                url: 'https://twitter.com/intent/tweet?',
                makeParam: function makeParam(data) {
                    data.desc = data.desc || '';

                    var length = 140 - data.url.length - 6,
                        // ... 갯수
                        txt = data.title + ' - ' + data.desc;

                    txt = txt.length > length ? txt.substr(0, length) + '...' : txt;
                    return {text: txt + ' ' + data.url};
                }
            },
            'googleplus': /** @lends axl.module.Sharer.services.googleplus */{
                name: '구글플러스',
                support: detect.PC | detect.MOBILE,
                size: [400, 420],
                url: 'https://plus.google.com/share?',
                makeParam: function makeParam(data) {
                    return {url: data.url};
                }
            },
            'pinterest': /** @lends axl.module.Sharer.services.pinterest */{
                name: '핀터레스트',
                support: detect.PC | detect.MOBILE,
                size: [740, 740],
                url: 'https://www.pinterest.com/pin/create/button/?',
                makeParam: function makeParam(data) {
                    return {
                        url: data.url,
                        media: data.image,
                        description: data.desc
                    };
                }
            },
            'linkedin': {
                name: '링크드인',
                support: detect.PC | detect.MOBILE,
                url: 'https://www.linkedin.com/shareArticle',
                makeParam: function(data) {
                    return {
                        url: data.url,
                        mini: true
                    };
                }
            },
            'kakaotalk': /** @lends axl.module.Sharer.services.kakaotalk */{
                name: '카카오톡',
                support: detect.APP | detect.MOBILE,
                makeParam: function makeParam(data) {
                    return {
                        msg: data.title + "\n" + (data.desc || ''),
                        url: data.url,
                        appid: "common store",
                        appver: "0.1",
                        type: "link",
                        appname: data.title
                    };
                }
            },
            'kakaostory': /** @lends axl.module.Sharer.services.kakaostory */{
                name: '카카오스토리',
                support: detect.APP | detect.MOBILE,
                makeParam: function makeParam(data) {
                    return {
                        post: data.title + "\n" + (data.desc || '') + "\n" + data.url,
                        appid: "axl.com",
                        appver: "1.0",
                        apiver: "1.0",
                        appname: data.title
                    };
                }
            },
            'line': /** @lends axl.module.Sharer.services.line */{
                name: '라인',
                support: detect.APP | detect.MOBILE,
                appUrl: 'http://line.me/R/msg/text/',
                url: 'line://msg/text/',
                store: {
                    android: {
                        intentPrefix: "intent://msg/text/",
                        intentSuffix: "#Intent;scheme=line;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;package=jp.naver.line.android;end"
                    },
                    ios: "http://itunes.apple.com/jp/app/line/id443904275"
                },
                makeParam: function makeParam(data) {
                    return {};
                }
            },
            'copy_url': {
                support: detect.PC | detect.MOBILE,
                run: function (el) {

                }
            }
        },
        addService: function (name, options) {
            this.services[name] = options;
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
        share: function share(type, params) {
            var service = this.services[type];
            var sizeFeature = '';
            if (!service) {
                return;
            }

            if (service.support & (detect.PC | detect.MOBILE)) {
                if (core.isFunction(service.run)) {
                    service.run(params.target);
                } else {
                    params.url = (params.url + '').replace(/#$/g, '');
                    params.url = params.url || location.href.replace(/#$/g, '');
                    params.title = params.title || document.title;

                    if (service.size) {
                        sizeFeature += ', height=' + service.size[1] + ', width=' + service.size[0];
                    }
                    window.open(service.url + core.json.toQueryString(service.makeParam(params)),
                        type,
                        'menubar=no' + sizeFeature
                    );
                }
            } else if (service.support & detect.APP) {

            }
        },

        _getMetaInfo: function (type, service) {
            var metas = this.options.metas;
            var name = metas[type][service] || type;

            switch (type) {
                case 'title':
                case 'description':
                case 'image':
                    if (core.isFunction(name)) {
                        return name(type, service);
                    } else {
                        return $('head meta').filter('[name$="' + name + '"], ' +
                            '[property$="' + name + '"]').eq(0).attr('content') || '';
                    }
            }

            return '';
        },

        /**
         * 공유하기 실행
         * @param {jQuery|Element|string} el 버튼
         * @param {string} service sns벤더명
         */
        _share: function _share(el, service) {
            var $el = $(el),
                url = ($el.attr('href') || '').replace(/^#/, '') || $el.attr('data-url') || location.href,
                title = $el.attr('data-title') || this._getMetaInfo('title', service) || document.title,
                desc = $el.attr('data-desc') || this._getMetaInfo('description', service) || '',
                image = $el.attr('data-image') || this._getMetaInfo('image', service) || '',
                data;

            this.share(service, data = {
                target: el,
                url: url,
                title: title,
                desc: desc,
                image: image
            });

            data.service = service;
            this.options.onShrered($el, data);
        },

        init: function init(options) {
            var self = this,
                services = core.object.keys(this.services);

            self.options = core.extend(true, defaultOption, options);

            function hasClass($el) {
                var service;
                core.each(self.services, function (item, svc) {
                    if ($el.hasClass(svc)) {
                        service = svc;
                        return false;
                    }
                });
                return service;
            }

            $(document).on('click.sharer', self.options.selector, function (e) {
                e.preventDefault();

                var $el = $(this),
                    service = '';

                if (self.options.attr === 'class') {
                    service = hasClass($el);
                } else {
                    service = $el.attr(self.options.attr);
                }

                if (self.options.onBeforeShare($el, {service: service}) === false) {
                    return;
                }

                if (!service || !core.array.include(services, service)) {
                    alert('공유할 SNS타입을 지정해주세요.');
                    return;
                }

                self._share($el.get(0), service);
            });
        }
    };

    return Sharer;
});
