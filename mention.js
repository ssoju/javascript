/**
 * Created by gilbert on 2016. 1. 12..
 */
(function () {
    "use strict";

    var collabee = {};

    (function(core) {
        var F = function() {},
            arraySlice = Array.prototype.slice,
            hasOwn = Object.prototype.hasOwnProperty,
            ignoreNames = ['superclass', 'members', 'statics'];

        function array_indexOf(arr, value) {
            if (Array.prototype.indexOf) {
                return Array.prototype.indexOf.call(arr, value);
            } else {
                for (var i = -1, item; item = arr[++i];) {
                    if (item == value) {
                        return i;
                    }
                }
                return -1;
            }
        }

        function each(obj, iterater, ctx) {
            if (!obj) {
                return obj;
            }
            var i = 0,
                len = 0,
                isArr = isArray(obj);

            if (isArr) {
                if (obj.forEach) {
                    if (obj.forEach(iterater, ctx || obj) === false) {

                    }
                } else {
                    for (i = 0, len = obj.length; i < len; i++) {
                        if (iterater.call(ctx || obj, obj[i], i, obj) === false) {
                            break;
                        }
                    }
                }
            } else {
                for (i in obj) {
                    if (hasOwn.call(obj, i)) {
                        if (iterater.call(ctx || obj, obj[i], i, obj) === false) {
                            break;
                        }
                    }
                }
            }
            return obj;
        }

        function extend(deep, obj) {
            var args;
            if (deep === true) {
                args = arraySlice.call(arguments, 2);
            } else {
                args = arraySlice.call(arguments, 1);
                obj = deep;
                deep = false;
            }
            each(args, function(source) {
                if (!source) {
                    return;
                }

                each(source, function(val, key) {
                    var isArr = isArray(val);
                    if (deep && (isArr || isPlainObject(val))) {
                        obj[key] || (obj[key] = isArr ? [] : {});
                        obj[key] = extend(deep, obj[key], val);
                    } else {
                        obj[key] = val;
                    }
                });
            });
            return obj;
        }

        // 부모클래스의 함수에 접근할 수 있도록 .supr 속성에 부모함수를 래핑하여 설정
        function wrap(k, fn, supr) {
            return function() {
                var tmp = this.supr,
                    ret;

                this.supr = supr.prototype[k];
                ret = undefined;
                try {
                    ret = fn.apply(this, arguments);
                } finally {
                    this.supr = tmp;
                }
                return ret;
            };
        }

        function isArray (value) {
            return value && value.push;
        }

        function isFunction (value) {
            return typeof value === 'function';
        }

        // 속성 중에 부모클래스에 똑같은 이름의 함수가 있을 경우 래핑처리
        function inherits(what, o, supr) {
            each(o, function(v, k) {
                what[k] = isFunction(v) && isFunction(supr.prototype[k]) ? wrap(k, v, supr) : v;
            });
        }

        function classExtend(attr, c) {
            var supr = c ? (attr.$extend || Object) : this,
                statics, mixins, singleton, instance, hooks;

            if (isFunction(attr)) {
                attr = attr();
            }

            singleton = attr.$singleton || false;
            statics = attr.$statics || false;
            mixins = attr.$mixins || false;

            !attr.initialize && (attr.initialize = supr.prototype.initialize || function() {});

            function ctor() {
                if (singleton && instance) {
                    return instance;
                } else {
                    instance = this;
                }

                var args = arraySlice.call(arguments),
                    me = this;

                if (me.initialize) {
                    me.initialize.apply(this, args);
                } else {
                    supr.prototype.initialize && supr.prototype.initialize.apply(me, args);
                }
            }

            function TypeClass() {
                if (!(this instanceof TypeClass)) {
                    return TypeClass;
                }
                ctor.apply(this, arguments);
            }

            F.prototype = supr.prototype;
            TypeClass.prototype = new F;
            TypeClass.prototype.constructor = TypeClass;
            TypeClass.superclass = supr.prototype;

            if (singleton) {
                TypeClass.getInstance = function() {
                    var arg = arguments,
                        len = arg.length;
                    if (!instance) {
                        switch (true) {
                            case !len:
                                instance = new TypeClass;
                                break;
                            case len === 1:
                                instance = new TypeClass(arg[0]);
                                break;
                            case len === 2:
                                instance = new TypeClass(arg[0], arg[1]);
                                break;
                            default:
                                instance = new TypeClass(arg[0], arg[1], arg[2]);
                                break;
                        }
                    }
                    return instance;
                };
            }


            TypeClass.prototype.suprMethod = function(name) {
                var args = arraySlice.call(arguments, 1);
                return supr.prototype[name].apply(this, args);
            };

            TypeClass.mixins = function(o) {
                if (!o.push) {
                    o = [o];
                }
                var proto = this.prototype;
                each(o, function(mixObj, i) {
                    if (!mixObj) {
                        return;
                    }
                    each(mixObj, function(fn, key) {
                        if (key === 'build' && TypeClass.hooks) {
                            TypeClass.hooks.init.push(fn)
                        } else {
                            proto[key] = fn;
                        }
                    });
                });
            };
            mixins && TypeClass.mixins.call(TypeClass, mixins);


            TypeClass.members = function(o) {
                inherits(this.prototype, o, supr);
            };
            attr && TypeClass.members.call(TypeClass, attr);


            TypeClass.statics = function(o) {
                o = o || {};
                for (var k in o) {
                    if (array_indexOf(ignoreNames, k) < 0) {
                        this[k] = o[k];
                    }
                }
                return TypeClass;
            };
            TypeClass.statics.call(TypeClass, supr);
            statics && TypeClass.statics.call(TypeClass, statics);

            return TypeClass;
        }

        var BaseClass = function() {};
        BaseClass.prototype.initialize = function() { /*throw new Error("Base 클래스로 객체를 생성 할 수 없습니다");*/ };
        BaseClass.prototype.release = function() {};
        BaseClass.prototype.proxy = function(fn) {
            var me = this;
            if (typeof fn === 'string') {
                fn = me[fn];
            }
            return function() {
                return fn.apply(me, arguments);
            };
        }
        BaseClass.extend = classExtend;

        extend(core, {
            each: each,
            extend: extend,
            isFunction: isFunction,
            isArray: isArray,
            Class: function(attr) {
                return classExtend.apply(this, [attr, true]);
            },
            BaseClass: BaseClass
        });
    })(collabee);

    collabee.View = collabee.BaseClass.extend({
        initialize: function (el, options) {
            var me = this;

            me.el = el;
            me.options = collabee.extend(true, me.defaults, options);

        },

        proxy: function (fn) {
            var me = this;
            return fn.apply(me, Array.prototype.slice.call(arguments, 1));
        }
    });



    var AutoComplete = collabee.View.extend({
        defaults: {
            delimiter: ','
        },
        initialize: function (el, options) {
            var me = this;

            me.supr(el, options);

            console.log(me.el);

            me.matcher = me.options.matcher || me.matcher;
            me.renderDropdown = me.options.renderDropdown || me.renderDropdown;

            me.query = '';
            me.hasFocus = true;

            me.renderInput();
            me._bindEvents();
        },

        _bindEvents: function () {
            var me = this;

            me.el.addEventListener('keyup', me._proxyKeyup = me.proxy(me._onKeyup));
            me.el.addEventListener('keydown', me._proxyKeydown = me.proxy(me._onKeydown));
            me.el.addEventListener('click', me._proxyClick = me.proxy(me._onClick));

            document.body.addEventListener('click', me._proxyFocusout = me.proxy(me._onFocusout));
            window.addEventListener('scroll', me._proxyScroll = me.proxy(me._onScroll));
        },

        _unbindEvents: function () {
            var me = this;


            me.el.removeEventListener('keyup', me._proxyKeyup);
            me.el.addEventListener('keydown', me._proxyKeydown);
            me.el.addEventListener('click', me._proxyClick);

            document.body.addEventListener('click', me._proxyFocusout);
            window.addEventListener('scroll', me._proxyScroll);
        },

        _onKeyup: function (e) {
            var me = this;

            switch(e.which || e.keyCode) {
                case 40: // down arrow
                case 38: // up arrow
                case 16: // shift
                case 17: // ctrl
                case 18: // alt
                case 8: // backspace
                    if (!me.query) {
                        me.cleanup(true);
                    } else {
                        me.lookup();
                    }
                    break;
                case 9: // tab
                case 13: // enter
                    var item = (me.dropdown) ? me.dropdown.querySelector('li.active') : null;
                    if (item) {
                        me.select(item.getAttribute('data-num'));
                        me.cleanup(false);
                    } else {
                        me.cleaup(true);
                    }
                    break;
                case 27: //esc
                    me.cleanup(true);
                    break;
                default:
                    me.lookup();
            }
        },

        _onKeydown: function (e) {
            var me = this;

            switch (e.which || e.keyCode) {
                case 9:	//TAB
                case 13:	//ENTER
                case 27:	//ESC
                    e.preventDefault();
                    break;
                case 38:	//UP ARROW
                    e.preventDefault();
                    if (me.dropdown !== undefined) {
                        me.highlightPreviousResult();
                    }
                    break;
                case 40:	//DOWN ARROW
                    e.preventDefault();
                    if (me.dropdown !== undefined) {
                        me.highlightNextResult();
                    }
                    break;
            }

            e.stopPropagation();
        },

        _onClick: function (e) {
            var me = this,
                target = e.target;

            if (me.hasFocus && target.parentNode.getAttribute('id') !== 'autocomplete-searchtext') {
                me.cleanup(true);
            }
        },

        _onFocusout: function (e) {
            if (this.hasFocus) {
                this.cleanUp(true);
            }
        },

        _onScroll: function () {

        },

        lookup: function () {
            var me = this;

            me.query = me.el.querySelector('#autocomplete-searchtext').innerText.replace('\ufeff', '');

            if (me.dropdown === undefined) {
                me.show();
            }

            clearTimeout(me.searchTimeout);
            me.searchTimeout = setTimeout(me.proxy(function () {
                var items = collabee.isFunction(me.options.source) ? me.options.source(me.query, me.proxy(me.process), me.options.delimiter) : me.options.source;
                if (items) {
                    me.process(items);
                }
            }), me.options.delay);
        },

        matcher: function (item) {
            return ~item[this.options.queryBy].toLowerCase().indexOf(this.query.toLowerCase())
        },

        highlighter: function (text) {
            return text.replace(new RegExp('(' + this.query.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1') + ')', 'ig'), function ($1, match) {
                return '<strong>' + match + '</strong>';
            });
        },

        show: function () {
            var me = this,
                offset = {top:0, left:0};

            me.dropdown = this.renderDropdown();
            me.dropdown.top = offset.top + 'px';
            me.dropdown.left = offset.left + 'px';

            document.body.appendChild(this.dropdown);

            me.dropdown.addEventListener('click', me.proxy(me.autoCompleteClick));
        },

        process: function (data) {
            var me = this;

            if (!me.hasFocus) {
                return;
            }

            var result = [],
                items = [];

            for (var i = 0, len = data.length; i < len; i++) {
                if (me.matcher(data[i]) ) {
                    items.push(data[i])
                }
            }

            items = items.slice(0, me.options.items);
            collabee.each(items, function (item, i) {
                var element = me.render(item);

                element.innerHTML = element.innerHTML.replace(element.innerText, me.highlighter(element.innerText));

                collabee.each(items[i], function (val, key) {
                    element.setAttribute('data-' + key, val);
                });

                result.push(element.outerHTML);
            });

            if (result.length) {
                me.dropdown.innerHTML = result.join('');
                me.dropdown.style.display = 'block';
            } else {
                me.dropdown.style.display = 'none';
            }
        },

        renderDropdown: function () {
            return '<ul class="rte-autocomplete dropdown-menu"><li class="loading"></li></ul>';
        },

        render: function (item) {
            return '<li>' +
                '<a href="javascript:;"><span>' + item[this.options.queryBy] + '</span></a>' +
                '</li>';
        },

        autoCompleteClick: function (e) {
            var item = $(e.target).closest('li').data();
            if (!$.isEmptyObject(item)) {
                this.select(item);
                this.cleanUp(false);
            }
            e.stopPropagation();
            e.preventDefault();
        },

        highlightPreviousResult: function () {
            var currentIndex = this.$dropdown.find('li.active').index(),
                index = (currentIndex === 0) ? this.$dropdown.find('li').length - 1 : --currentIndex;

            this.$dropdown.find('li').removeClass('active').eq(index).addClass('active');
        },

        highlightNextResult: function () {
            var currentIndex = this.$dropdown.find('li.active').index(),
                index = (currentIndex === this.$dropdown.find('li').length - 1) ? 0 : ++currentIndex;

            this.$dropdown.find('li').removeClass('active').eq(index).addClass('active');
        },

        select: function (item) {
            this.editor.focus();
            var selection = this.editor.dom.select('span#autocomplete')[0];
            this.editor.dom.remove(selection);
            this.editor.execCommand('mceInsertContent', false, this.insert(item));
        },

        insert: function (item) {
            return '<span>' + item[this.options.queryBy] + '</span>&nbsp;';
        },

        cleanUp: function (rollback) {
            this.unbindEvents();
            this.hasFocus = false;

            if (this.$dropdown !== undefined) {
                this.$dropdown.remove();
                delete this.$dropdown;
            }

            if (rollback) {
                var text = this.query,
                    $selection = $(this.editor.dom.select('span#autocomplete')),
                    replacement = $('<p>' + this.options.delimiter + text + '</p>')[0].firstChild,
                    focus = $(this.editor.selection.getNode()).offset().top === ($selection.offset().top + (($selection.outerHeight() - $selection.height()) / 2));

                this.editor.dom.replace(replacement, $selection[0]);

                if (focus) {
                    this.editor.selection.select(replacement);
                    this.editor.selection.collapse();
                }
            }
        },

        offset: function () {
            var rtePosition = $(this.editor.getContainer()).offset(),
                contentAreaPosition = $(this.editor.getContentAreaContainer()).position(),
                nodePosition = $(this.editor.dom.select('span#autocomplete')).position();

            return {
                top: rtePosition.top + contentAreaPosition.top + nodePosition.top + $(this.editor.selection.getNode()).innerHeight() - $(this.editor.getDoc()).scrollTop() + 5,
                left: rtePosition.left + contentAreaPosition.left + nodePosition.left
            };
        },

        offsetInline: function () {
            var nodePosition = $(this.editor.dom.select('span#autocomplete')).offset();

            return {
                top: nodePosition.top + $(this.editor.selection.getNode()).innerHeight() + 5,
                left: nodePosition.left
            };
        },

        renderInput: function () {
            var me = this,
                rawHtml = '<span id="autocomplete">' +
                    '<span id="delimiter">'+me.options.delimiter+'</span>' +
                    '<span id="searchtext"><span class="dummy">\uFEFF</span></span>' +
                    '</span>';

            me.el.focus();
            document.execCommand('insertHtml', false, rawHtml);
        },
        release: function () {

        }
    });

    window.AutoComplete = AutoComplete;
})();
