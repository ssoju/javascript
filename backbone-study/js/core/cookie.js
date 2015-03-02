define([
	'underscore'
], function(_){
    return {
        defaults: {
            // domain: location.host,
            path: '/'
        },
        set: function(name, value, options) {
            options || (options = {});
            var curCookie = name + "=" + encodeURIComponent(value) + ((options.expires) ? "; expires=" + (options.expires instanceof Date ? options.expires.toGMTString() : options.expires) : "") + ((options.path) ? "; path=" + options.path : '') + ((options.domain) ? "; domain=" + options.domain : '') + ((options.secure) ? "; secure" : "");

            document.cookie = curCookie;
        },
        get: function(name) {
            var j, g, h, f;
            j = ";" + document.cookie.replace(/ /g, "") + ";";
            g = ";" + name + "=";
            h = j.indexOf(g);

            if (h !== -1) {
                h += g.length;
                f = j.indexOf(";", h);
                return decodeURIComponent(j.substr(h, f - h));
            }
            return "";
        },
        remove: function(name) {
            document.cookie = name + "=;expires=Fri, 31 Dec 1987 23:59:59 GMT;";
        }
	};
});
