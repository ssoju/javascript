/**
 * @authror: 김승일
 * @email: comahead@vinylc.com
 * @created: 2012-08-29
 * @escription: 무한스크롤러 모듈
 */
(function($, core, undefined) {
    "use strict";

    if (core.ui.InifiniteScroller) {
        return;
    }

    var InfiniteScroller = core.ui('InfiniteScroller', {
        bindjQuery: 'infiniteScroller',
        defaults: {
            ajax: {
                method: 'get'
            },
            buffScroll: 40,
            firstLoad: true,
            onBeforeSend: null,
            onSuccess: null,
            onError: null,
            onComplete: null,
            tmpl: {
                src: '',
                target: ''
            }
        },
        selectors: {

        },
        initialize: function(el, options) {
            var me = this;

            if (me.supr(el, options) === false) {
                return;
            }
            // duringAkjax

            me.isDuringAjax = false;
            if (me.options.listSelector) {
                me.$list = $(me.options.listSelector);
            }

            me._bindEvents();
            me.options.firstLoad && me._load();
        },

        _bindEvents: function() {
            var me = this,
                $wrap = me.$wrap,
                wrapHeight = me.$wrap.height();

            $wrap.on('scroll', function() {
                if (me.isDuringAjax) {
                    return;
                }
                if ($wrap[0].scrollHeight - wrapHeight <= $wrap[0].scrollTop + me.options.buffScroll) {
                    me._load();
                }
            }).on('mouseenter focusin', function() {
                wrapHeight = me.$wrap.height();
            });
        },

        _load: function() {
            var me = this,
                opts = me.options,
                promise;

            me.isDuringAjax = true;
            return promise = $.ajax({
                url: opts.ajax.url,
                method: opts.ajax.method,
                params: (me.prevData = (me.options.ajax.params($.extend({},
                    me.options.ajax.defaultParams,
                    me.prevData), me.prevResult) || {})),
                dataType: 'json',
                beforeSend: me.options.onBeforeSend
            }).done(function(json) {
                me.prevResult = json;
                if (me._trigger('success', this, [].slice.call(arguments)) !== false) {
                    if (me.tmpl) {
                        me.tmpl(json).appendTo()
                    }
                }
            }).fail(function() {
                me.isFailure = true;
                me._trigger('error', this, [].slice.call(arguments));
            }).always(function() {
                me.isDuringAjax = false;
                me._trigger('complete', this, [].slice.call(arguments));
            });
        },

        _trigger: function(type, ajax, args) {
            var me = this,
                fn,
                fullName = 'on' + type.substr(0, 1).toUpperCase() + type.substr(1);

            if (fn = me.options[fullName]) {
                return fn.apply(ajax, args || []);
            }
        }
    });


})(jQuery, window[LIB_NAME]);
