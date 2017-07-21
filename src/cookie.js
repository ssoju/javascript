;(function (core, global, undefined) {
    /**
     * @namespace
     * @name vcui.Cookie
     */
    core.addon('Cookie', /** @lends vcui.Cookie */ {
        defaults: {
            // domain: location.host,
            path: ''
        },

        /**
         * 쿠키를 설정
         *
         * @param {string} name 쿠키명
         * @param {string} value 쿠키값
         * @param {object} [options]
         * @param {date} [options.expires] 만료시간
         * @param {string} [options.path] 쿠키의 유효경로
         * @param {string} [options.domain] 쿠키의 유효 도메인
         * @param {boolean} [options.secure] https에서만 쿠키 설정이 가능하도록 하는 속성
         * @example
         * vcui.Cookie.set('userid', 'vcui');
         * // or
         * vcui.Cookie.set({
         *              'userid': 'vcui',
         *              'name': '바이널'
         *              });
         */
        set: function (name, value, options) {
            if (!core.type(name, 'string')) {
                core.each(name, function (val, key) {
                    this.set(key, value, value);
                }.bind(this));
                return;
            }

            options = core.extend({}, options || {}, this.defaults);
            var curCookie = name + "=" + encodeURIComponent(value) +
                ((options.expires) ? "; expires=" + (options.expires instanceof Date ? options.expires.toGMTString() : options.expires) : "") +
                ((options.path) ? "; path=" + options.path : '') +
                ((options.domain) ? "; domain=" + options.domain : '') +
                ((options.secure) ? "; secure" : "");

            doc.cookie = curCookie;
        },

        /**
         * 쿠키를 설정
         *
         * @param {string} name 쿠키명
         * @return  {string} 쿠키값
         * @example
         * vcui.Cookie.get('userid'); // 'vcui'
         */
        get: function (name) {
            var j, g, h, f;
            j = ";" + doc.cookie.replace(/ /g, "") + ";";
            g = ";" + name + "=";
            h = j.indexOf(g);

            if (h !== -1) {
                h += g.length;
                f = j.indexOf(";", h);
                return decodeURIComponent(j.substr(h, f - h));
            }
            return "";
        },

        /**
         * 쿠키 삭제
         *
         * @param {string} name 쿠키명
         * @example
         * core.Cookie.remove('userid');
         * // or
         * core.Cookie.remove(['userid', 'name']);
         */
        remove: function (name) {
            if (core.type(name, 'string')) {
                doc.cookie = name + "=;expires=Fri, 31 Dec 1987 23:59:59 GMT;";
            } else {
                core.each(name, function (val, key) {
                    this.remove(key);
                }.bind(this))
            }
        },

        /**
         * sep를 구분자로 하여 문자열로 조합하여 쿠키에 셋팅
         * @param {string} name 쿠키명
         * @param {string} val 값
         * @param {string} sep 구분자
         * @example
         * vcui.Cookie.setItem('arr', 'a');
         * vcui.Cookie.setItem('arr', 'b');  // arr:a|b
         */
        setItem: function (name, val, sep) {
            sep = sep || '|';
            val = val + '';

            var value = this.get(name),
                values = value ? value.split(sep) : [];

            if (!core.array.include(values, val)) {
                values.push(val);
            }

            this.set.apply(this, [name, values.join(sep)].concat(arguments));
        },

        getItems: function (name) {
            var val = this.get(name) || '';
            if (!$.trim(val)) {
                return [];
            }
            return val.split('|');
        },

        /**
         * name에 셋팅되어 있던 조합문자열에서 val를 제거
         * @param {string} name 쿠키명
         * @param {string} val 값
         * @param {string} sep
         * @example
         * vcui.Cookie.setItem('arr', 'a');
         * vcui.Cookie.setItem('arr', 'b');  // arr='a|b'
         * vcui.Cookie.removeItem('arr', 'b'); // arr='a'
         */
        removeItem: function (name, val, sep) {
            sep = sep || '|';
            val = val + '';

            var value = this.get(name),
                values = value ? value.split(sep) : [];

            values = core.array.remove(values, val);

            this.set.apply(this, [name, values.join(sep)].concat(arguments));
        }
    });

})(window[LIB_NAME], window);