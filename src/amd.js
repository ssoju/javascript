/**
 * @author comahead@gmail.com
 * vcui.importJs
 */
;(function ($, core, global, undefined) {
    var isA = function (a, b) {
            return a instanceof (b || Array);
        },
        doc = document,
        aliases = {},
        bd = doc.getElementsByTagName("body")[0] || doc.documentElement,
        appendElmt = function (type, attrs, callback) {
            var e = doc.createElement(type), i;
            if (callback && isA(callback, Function)) {
                if (e.readyState) {
                    e.onreadystatechange = function () {
                        if (e.readyState === "loaded" || e.readyState === "complete") {
                            e.onreadystatechange = null;
                            callback();
                        }
                    };
                } else {
                    e.onload = callback;
                }
            }
            for (i in attrs) {
                attrs[i] && (e.setAttribute(i, attrs[i]));
            }
            bd.appendChild(e);
        },
        load = function (url, callback) {
            if (isA(url)) {
                for (var i = 0; i < url.length; i++) {
                    loader.load(url[i]);
                }
                callback && url.push(callback);
                return loader.load.apply(loader, url);
            }
            if (url.match(/\.css\b/)) {
                return loader.loadcss(url, callback);
            }
            return loader.loadjs(url, callback);
        },
        loaded = {},
        loader = {
            urlParse: function (pUrl, type) {
                var parts = {}, url, ver,
                    fn = type === 'js' ? core.importJs : core.importCss;

                url = pUrl.replace(/\?(.*)$/g, function (m, a) {
                    if (a && a.indexOf('ver=') >= 0) {
                        parts.ver = a.match(/[\?|&]?ver=([a-z0-9]*)/)[1];
                    }
                    return '';
                });
                aliases[url] && (url = aliases[url]);
                ver = parts.ver || fn.ver;
                if (url.toLowerCase().indexOf('.' + type) < 0) {
                    url += '.' + type;  // 확장자 추가
                }
                if (url.substr(0, 1) !== '/') {
                    url = fn.baseUrl + '/' + url;
                }
                parts.u = url;
                parts.full = url + (ver ? '?ver=' + ver : '');
                return parts;
            },
            loadjs: function (url, callback) {
                var parts = loader.urlParse(url, 'js');
                url = parts.u;
                if (loaded[url] === true) {
                    callback && callback();
                    return loader;
                } else if (loaded[url] !== undefined) {
                    if (callback) {
                        loaded[url] = (function (ocb, callback) {
                            return function () {
                                ocb && ocb();
                                callback && callback();
                            };
                        })(loaded[url], callback);
                    }
                    return loader;
                }
                loaded[url] = (function (callback) {
                    return function () {
                        loaded[url] = true;
                        callback && callback();
                    };
                })(callback);
                callback = function () {
                    loaded[url]();
                };
                // 스크립트 태그를 사용하지 않고 실행시킬 것인지
                if (core.importJs.isEval) {
                    $.ajax({url: parts.full, cache: true}).done(function (jsstring) {
                        eval(jsstring);
                        callback();
                    });
                } else {
                    appendElmt('script', {
                        type: 'text/javascript',
                        'data-import': 'true',
                        src: parts.full
                    }, callback);
                }
                return loader;
            },
            loadcss: function (url, callback) {
                var parts = loader.urlParse(url, 'css');
                url = parts.u;
                loaded[url] || appendElmt('link', {
                    'type': 'text/css',
                    'rel': 'stylesheet',
                    'data-import': 'true',
                    'href': parts.full
                });
                loaded[url] = true;
                callback && callback();
                return loader;
            },
            load: function () {
                var argv = arguments, argc = argv.length;
                if (argc === 1 && isA(argv[0], Function)) {
                    argv[0]();
                    return loader;
                }
                load.call(loader, argv[0], argc <= 1 ? undefined : function () {
                    loader.load.apply(loader, [].slice.call(argv, 1));
                });
                return loader;
            }
        };

    // 이미 존재하는 파일정보를 추출 - START
    var scripts = doc.getElementsByTagName("script"),
        links = doc.getElementsByTagName('link'),
        detectLoaded = function () {
            var i, l, url;
            for (i = 0, l = scripts.length; i < l; i++) {
                if (scripts[i].getAttribute('data-import')) {
                    continue;
                }
                (url = scripts[i].getAttribute('src')) && (loaded[url.replace(/\?.*$/, '')] = true);
            }
            for (i = 0, l = links.length; i < l; i++) {
                if (links[i].getAttribute('data-import')) {
                    continue;
                }
                (links[i].rel === 'stylesheet' || links[i].type === 'text/css') && (loaded[links[i].getAttribute('href').replace(/\?.*$/, '')] = true);
            }
        };
    detectLoaded();
    $(function () {
        detectLoaded();
    });
    // 이미 존재하는 파일정보를 추출 - END

    var importResource = function (type) {
        var regs = {
            js: {
                test: /(?!min)\.js$/i,
                value: '.min.js'
            },
            css: {
                test: /(?!min)\.css$/i,
                value: '.min.css'
            }
        };

        function rename(files) {
            if (core.configs.loadMinify) {
                core.each(files, function (src, i, files) {
                    files[i] = src.replace(regs[type].test, regs[type].value);
                });
                return files;
            } else {
                return files;
            }
        }

        return function (files, callback) {
            var defer = $.Deferred();
            debugger;
            loader.load(rename(files), function () {
                defer.resolve();
                if ($.isReady) {
                    callback && callback();
                }
                else {
                    callback && $(function () {
                        callback();
                    });
                }
            });
            return defer.promise();
        };
    };
    var jsImporter = core.importJs = importResource('js');
    var cssImporter = core.importCss = importResource('css');

    cssImporter.baseUrl = '';
    jsImporter.baseUrl = core.configs.importBasePath || ''; // '';
    jsImporter.loadMinify = core.configs.loadMinify;
    jsImporter.ver = cssImporter.ver = '';
    jsImporter.isEval = false;
    jsImporter.define = function (src) {
        if (!/\.js$/.test(src)) {
            src += '.js';
        }
        src = jsImporter.baseUrl.replace(/\/$/, '') + ('/' + src).replace(/\/{2,}/g, '/');
        loaded[src] = true;
    };
    jsImporter.addAliases = cssImporter.addAliases = function (a) {
        if (typeof arguments[0] === 'string') {
            aliases[arguments[0]] = arguments[1];
        } else {
            for (var i in a) {
                aliases[i] = isA(a[i]) ? a[i].slice(0) : a[i];
            }
        }
    };

    core.import = jsImporter;

    ////////////////////////////////////////////////////
})(jQuery, window[LIB_NAME], window);
