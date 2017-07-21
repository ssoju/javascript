;(function (core, global, undefined) {

    /**
     * @namespace
     * @name vcui.uri
     */
    core.addon('uri', /** @lends vcui.uri */{
        /**
         * 현재 페이지의 호스트주소를 반환
         * @returns {string}
         * @example
         * alert(vcui.uri.getHost());
         */
        getHost: function () {
            var loc = doc.location;
            return loc.protocol + '//' + loc.host;
        },
        /**
         * 현재 url 반환(쿼리스트링, # 제외)
         * @returns {string}
         * @example
         * alert(vcui.uri.getPageUrl());
         */
        getPageUrl: function () {
            var loc = doc.location;
            return loc.protocol + '//' + loc.host + loc.pathname;
        },

        /**
         * 주어진 url에 쿼리스츠링을 조합
         *
         * @param {string} url
         * @param {String:Object} String
         * @return {string}
         *
         * @example
         * vcui.uri.addParam("board.do", {"a":1, "b": 2, "c": {"d": 4}}); // "board.do?a=1&b=2&c[d]=4"
         * vcui.uri.addParam("board.do?id=123", {"a":1, "b": 2, "c": {"d": 4}}); // "board.do?id=123&a=1&b=2&c[d]=4"
         */
        addParam: function (url, string) {
            if (core.type(string, 'object')) {
                string = core.object.toQueryString(string);
            }
            if (!core.isEmpty(string)) {
                return url + (url.indexOf('?') === -1 ? '?' : '&') + string;
            }

            return url;
        },

        /**
         * 쿼리스트링을 객체로 변환
         *
         * @param {string} query 쿼리스트링 문자열
         * @return {object}
         *
         * @example
         * vcui.uri.parseQuery("a=1&b=2"); // {"a": 1, "b": 2}
         */
        parseQuery: function (query) {
            if (!query) {
                return {};
            }
            if (query.length > 0 && query.charAt(0) === '?') {
                query = query.substr(1);
            }

            var params = (query + '').split('&'),
                obj = {},
                params_length = params.length,
                tmp = '',
                i;

            for (i = 0; i < params_length; i++) {
                tmp = params[i].split('=');
                obj[decodeURIComponent(tmp[0])] = decodeURIComponent(tmp[1]).replace(/[+]/g, ' ');
            }
            return obj;
        },

        /**
         * url를 파싱하여 host, port, protocol 등을 추출
         *
         * @function
         * @param {string} str url 문자열
         * @return {object}
         *
         * @example
         * vcui.uri.parseUrl("http://www.vcui.com:8080/list.do?a=1&b=2#comment");
         * // {scheme: "http", host: "www.vcui.com", port: "8080", path: "/list.do", query: "a=1&b=2"…}
         */
        parseUrl: (function () {
            var o = {
                strictMode: false,
                key: ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"],
                q: {
                    name: "queryKey",
                    parser: /(?:^|&)([^&=]*)=?([^&]*)/g
                },
                parser: {
                    strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
                    loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/\/?)?((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
                }
            };

            return function (str) {
                if (str.length > 2 && str[0] === '/' && str[1] === '/') {
                    str = context.location.protocol + str;
                }
                var m = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
                    uri = {}, i = 14;
                while (i--) {
                    uri[o.key[i]] = m[i] || "";
                }
                return uri;
            };
        })(),

        /**
         * 주어진 url에서 해쉬문자열 제거
         *
         * @param {string} url url 문자열
         * @return {string} 결과 문자열
         *
         * @example
         * vcui.uri.removeHash("list.do#comment"); // "list.do"
         */
        removeHash: function (url) {
            return url ? url.replace(/#.*$/, '') : url;
        },

        getParam: function (name) {
            var search = location.search,
                params;

            if (!search || search.indexOf(name) < 0) {
                return '';
            }

            params = this.parseQuery(search);
            return params[name] || '';
        }
    });

})(window[LIB_NAME], window);