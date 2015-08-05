/*!
 * @author �����
 * @email comahead@vi-nyl.com
 * @description �ڸ�ī�� �ھ� ���̺귯��
 * @license MIT License
 */
window.LIB_NAME = 'coma';
window.LIB_DIV_DEBUG = false;
window.IS_DEBUG = location.href.indexOf('jsdebug=true') >= 0;
/*
 *
 */
(function ($) {
    "use strict";
    /* jshint expr: true, validthis: true */
    /* global coma, alert, escape, unescape */

    /**
     * @callback arrayCallback
     * @param  {*} item - �迭�� ���
     *
     * @param  {number} index   - �迭�� �ε���
     * @param  {Array}  array   - �迭 �ڽ�
     * @return {boolean} false�� ��ȯ�ϸ� �ݺ��� �����.
     */

    /**
     * �̺�Ʈ��鷯
     *
     * @callback eventCallback
     * @param {$.Event} e �̺�Ʈ ��ü
     * @param {Object} [data] ����Ÿ
     */

    /**
     * �۷ι� ���ؽ�Ʈ
     * @namespace
     * @name window
     */

    /**
     * ui ���ӽ����̽�
     * ���Ҿ�, coma.ui.View���� ��ӹ޾� ���ο� UI����� �������ش�.
     * @namespace
     * @name coma.ui
     * @example
     * var Tab = coma.ui('Tab', {
     *    select: function(index) {
     *        //
     *    }
     * });
     *
     * var tab = new Tab();
     * // or
     * var tab = new coma.ui.Tab();
     *
     * tab.select(2);
     */

// �����ӿ� �̸�
    var /** @const */LIB_NAME = window.LIB_NAME || 'coma';
    if (window[LIB_NAME]) {
        return;
    }

    if (!$) {
        throw new Error("This library requires jQuery");
    }

    var context = window,
        $root = $(document.documentElement).addClass('js'),
        tmpInput = document.createElement('input'),
        isTouch = ('ontouchstart' in context),
        isMobile = ('orientation' in context) || isTouch;

    isTouch && $root.addClass('touch');
    isMobile && $root.addClass('mobile');

    if (typeof Function.prototype.bind === 'undefined') {
        /**
         * �Լ����� ���ٽ�Ʈ�� ����
         * @param {Object} context ���ؽ�Ʈ
         * @param {*} ... �ι�° ���ں��ʹ� ������ ����� �ݹ��Լ��� ���޵ȴ�.
         * @return {Function} �־��� ��ü�� ���ؽ�Ʈ�� ����� �Լ�
         * @example
         * function Test() {
         *      alert(this.name);
         * }.bind({name: 'axl rose'});
         *
         * Test(); -> alert('axl rose');
         */
        Function.prototype.bind = function () {
            var fn = this,
                args = arraySlice.call(arguments),
                object = args.shift();

            return function (context) {
// bind�� �Ѿ���� ���ڿ� �����Լ��� ���ڸ� �����Ͽ� �Ѱ���.
                var local_args = args.concat(arraySlice.call(arguments));
                if (this !== window) {
                    local_args.push(this);
                }
                return fn.apply(object, local_args);
            };
        };
    }

    if (!window.console) {
// �ܼ��� �������� �ʴ� �������� ���� ��¿�Ҹ� ����
        window.console = {};
        if (window.LIB_DIV_DEBUG === true) {
            window.$debugDiv = $('<div class="ui_debug" style=""></div>');
            $(function () {
                window.$debugDiv.appendTo('body');
            });
        }
        var consoleMethods = ['log', 'info', 'warn', 'error', 'assert', 'dir', 'clear', 'profile', 'profileEnd', 'trace'];
        for (var i = -1, method; method = consoleMethods[++i];) {
            +function (method) {
                console[method] = window.LIB_DIV_DEBUG === true ?
                    function () {
                        window.$debugDiv.append('<div style="font-size:9pt;">&gt; <span>[' + method + ']</span> ' + [].slice.call(arguments).join(', ') + '</div>');
                    } : function () {
                };
            }(method);
        }
    }

    /**
     * jQuery ��ü
     * @class
     * @name $
     */
// TODO: �� ��
    var oldOff = $.fn.off;
    $.fn.unbind = $.fn.off = function (name) {
        if ((this[0] === window || this[0] === document)
            && name !== 'ready' && name.indexOf('.') < 0) {
            throw new Error('[' + name + '] window, document���� �̺�Ʈ�� off�� ���� ���ӽ����̽��� �� �־��ּž� �մϴ�.');
        }
        if (IS_DEBUG) {
            console.log('off', name);
            console.trace();
        }
        return oldOff.apply(this, arguments);
    };
// TODO �׽�Ʈ��
    if (IS_DEBUG) {
        var oldOn = $.fn.on;
        $.fn.on = function (name) {
            if (this[0] === window || this[0] === document) {
                console.log('on', name);
                console.trace();
            }
            return oldOn.apply(this, arguments);
        };
    }

    /**
     * value���� URI���ڵ��Ͽ� ��ȯ
     * @function
     * @name $#encodeURI
     * @return {string} ���ڵ��� ���ڿ�
     */
    $.fn.encodeURI = function (value) {
        if (arguments.length === 0) {
            return encodeURIComponent($.trim(this.val()));
        } else {
            return this.val(encodeURIComponent(value));
        }
    };

    $.fn.getPlaceholder = function () {
        var val = '';
        if (this.attr('ori-placeholder')) {
            val = this.attr('ori-placeholder').replace(/\\r\\n/g, "\n").replace(/\\n/g, "\n");
        } else {
            val = ('placeholder' in tmpInput ? this.attr('placeholder') : '');
        }
        return val;
    };

    /**
     * value���� �յ� �����̽����� �Ǵ� old ie�ΰ�쿡 placeholder�� �����Ͽ� ���� ���� ��ȯ
     * @function
     * @name $#trimVal
     * @return {string} ���ڿ�
     */
    $.fn.trimVal = (function () {
        var supportPlaceholder = ('placeholder' in tmpInput);

        return supportPlaceholder ?
            function (value) {
                if (arguments.length === 0) {
                    return $.trim(this.val());
                }
                else {
                    return this.val($.trim(value));
                }
            } :
            function (value) {
                var txtPlaceholder = this.attr('data-placeholder-value');
                if (arguments.length === 0) {
                    if (this.val() === txtPlaceholder) {
                        return '';
                    }
                    return $.trim(this.val());
                } else {
                    value = $.trim(value) || txtPlaceholder;
                    return this.val(value);
                }
            }
    })();


// ����ŷ�� ������ ���� ����
    $.fn.unformatVal = function () {
        var module;
        if (module = this.data('ui_formatInput')) {
            return module.clean();
        }
        return this.trimVal();
    };

    $.fn.realVal = function () {
        var module;
        if (module = this.data('ui_formatInput')) {
            return module.clean();
        }
        return this.trimVal();
    };


    $.fn.toggleLayer = function () {
        return this.each(function () {
            var $el = $(this),
                $target = $($el.attr('data-target') || $el.attr('href'));

            $el.on('click', function (e) {
                e.preventDefault();

                $target.toggle(!$target.is(':visible'));
            });
        });
    };


    /**
     * �ش� �̹����� �ε���� �� �ݹ��Լ� ����
     *
     * @param cb �ݹ��Լ�
     * @returns {jQuery}
     */
    $.fn.onImgLoaded = function (cb) {
        core.util.waitImageLoad(this).done(cb);
        return this;
    };

    /**
     * �񵿱� ������� �̹��� ����� ����ؼ� �ݹ��Լ��� �Ѱ��ش�.
     * @param cb
     * @returns {jQuery}
     */
    $.fn.getImgSize = function (cb) {
        var $img = this.eq(0);
        $img.imgLoaded(function () {
            cb && cb($img.css('width', ''), width(), $img.css('height', '').height());
        });
        return this;
    };


    /**
     * üũ���θ� ������ ��, changed �̺�Ʈ�� �߻���Ų��.(����� label�� onŬ������ ��۸��ϰ��� �� �� ���)
     * @function
     * @name $#checked
     * @param {boolean} checked üũ����
     * @param {boolean} isTrigger ���� ����
     * @returns {jQuery}
     * @fires $#changed
     * @example
     * // ���� changed �̺�Ʈ ���ε�
     * $('input:checkbox').on('changed', function(e, isChecked) { $(this).parent()[isChecked?'addClass':'removeClass']('on'); });
     * ..
     * // checked ���� ����
     * $('input:checkbox').checked(true); // �ش�üũ�ڽ��� �θ� onŬ������ �߰��ȴ�.
     */
    $.fn.checked = function (checked, isTrigger) {
        return this.each(function () {
            if (this.type !== 'checkbox' && this.type !== 'radio') {
                return;
            }
            if (this.disabled) {
                $(this).parent().addClass('disabled');
                return;
            }
            if (checked === null) { // Ŭ���� ���ѰŸ�
                checked = !this.checked;
            }

            this.checked = checked;
            if (checked) {
                this.setAttribute('checked', 'checked');
            }
            else {
                this.removeAttribute('checked');
            }

            var $el = $(this),
                isRadio = this.type === 'radio',
                text = checked ? '���õ�' : '�̼��õ�',
                $a = $el.parent().removeClass('disabled').find('a');

            text = this.disabled ? '���úҰ�' : text;
            if (isRadio) {
                $('input[name="' + $el.attr('name') + '"]', this.form).not(this).each(function () {
                    var txt = this.disabled ? '���úҰ�' : (this.checked ? '���õ�' : '�̼��õ�');
                    this.removeAttribute('checked');
                    $(this).parent().toggleClass('disabled', this.disabled)
                        .find('a').removeClass('check').find('span:eq(2)').text(txt);
                });
            }
            $a.toggleClass('check', checked).find('span').eq(2).html(text);
            if (isTrigger !== false) {
                /**
                 * @event $#changed
                 * @type {Object}
                 * @peoperty {boolean} checked - üũ ����
                 */
                var e = $.Event('checkedchanged');
                $el.trigger(e, [checked]);
            }
        });
    };

    /**
     * Ŭ���� ġȯ
     * @function
     * @name $#replaceClass
     * @param {string} old ���Ŭ����
     * @param {string} newCls ġȯŬ����
     * @returns {jQuery}
     */
    $.fn.replaceClass = function (old, newCls) {
        return this.each(function () {
            $(this).removeClass(old).addClass(newCls);
        });
    };

    /**
     * ���̾� ǥ�� ���:
     * - �ܼ��� show�� �ϴ°� �ƴ϶�, ���̾ ǥ�õǱ����� beforeshow�̺�Ʈ��, ǥ�õ� �Ŀ� show�̺�Ʈ�� �߻������ش�.
     * - ���̾ ��� ��ư�� �����Ѵ�. ������, ��ư�� ��� �׼��� ���ϰ��� �� �� ����
     * @function
     * @name $#showLayer
     * @param {Element|jQuery} [options.button] ��ư
     * @param {Function} [options.onShow] ǥ�õ� �� ����� �Լ�
     */
    $.fn.showLayer = function (options, isTrigger) {
        options = extend({
            onShow: core.emptyFn,
            opener: null
        }, options);

        return this.each(function () {
            var $this = $(this),
                evt;
            if (options.opener) {
                $this.data('opener', options.opener);
                $(options.opener).attr({'aria-pressed': 'true', 'aria-expand': 'true'});
            }

            if (isTrigger !== false) {
                $this.trigger(evt = $.Event($.fn.showLayer.ON_BEFORESHOW));
                if (evt.isDefaultPrevented()) {
                    return;
                }
            }

// ǥ�õ� �� d_open Ŭ���� �߰�
            $this.addClass($.fn.showLayer.openClass).show()[trigger]($.fn.showLayer.ON_SHOWN);
            options.onShow.call($this[0]);
        });
    };
    $.fn.showLayer.openClass = 'ui_open';
    $.fn.showLayer.ON_BEFORESHOW = 'layerbeforeshow';
    $.fn.showLayer.ON_SHOWN = 'layershown';

    /**
     * ���̾� ���� ���:
     * - �ܼ��� hide�� �ϴ°� �ƴ϶�, ������ �Ŀ� hide�̺�Ʈ�� �߻������ش�.
     * @function
     * @name $#hideLayer
     * @param {boolean} [options.focusOpener = false] ������ �Ŀ� ��ư�� ��Ŀ���� �ٰ����� ����
     * @param {Function} [options.onHide] ������ �Ŀ� ����� �Լ�
     * @param {boolean} [isTrigger = true] �̺�Ʈ ���� ���ΰ�
     */
    $.fn.hideLayer = function (options, isTrigger) {
        options = extend({
            onHide: core.emptyFn,
            focusOpener: false
        }, options);

        return this.each(function () {
            var $this = $(this);
            $this.removeClass($.fn.showLayer.openClass).hide();
            if (isTrigger !== false) {
                $this.trigger($.fn.hideLayer.ON_HIDDEN);
            }
            options.onHide.call($this[0]);

// ������ �Ŀ� ������ ������ư�� ��Ŀ���� ������ �ش�.
            if ($this.data('opener')) {
                var $btn = $($this.data('opener'));
                $this.removeData('opener');
                $btn.attr({'aria-pressed': 'false', 'aria-expand': 'false'});
                if (options.focusOpener === true) {
                    $btn.focus();
                }
            }
        });
    };
    $.fn.hideLayer.ON_HIDDEN = 'layerhidden';

    /**
     * �ƹ��͵� ���ϴ� ���Լ�
     * @function
     * @name $#noop
     * @example
     * $(this)[ isDone ? 'show' : 'noop' ](); // isDone�� true�� show�ϵ� false�϶��� �ƹ��͵� ����.
     */
    $.fn.noop = function () {
        return this;
    };

    /**
     * üũ�� �׸��� ���� �迭�� ��Ƽ� ��ȯ
     * @function
     * @name $#checkedValues
     * @return {Array}
     */
    $.fn.checkedValues = function () {
        var results = [];
        this.each(function () {
            if ((this.type === 'checkbox' || this.type === 'radio') && this.checked === true) {
                results.push(this.value);
            }
        });
        return results;
    };

    /**
     * ���� ������ �ִ� �ٸ� row���� on�� �����ϰ� ���� row�� on �߰�
     * @function
     * @name $#activeItem
     * @param {string} cls Ȱ�� Ŭ������
     * @return {jQuery}
     */
    $.fn.activeItem = function (cls, isReverse) {
        cls = cls || 'on';
        return this.toggleClass(cls, !isReverse).siblings().toggleClass(cls, isReverse).end();
    };

    /**
     * append �� ���� ù��°�� ��Ŀ�� �ֱ�
     * @param html
     * @returns {*}
     */
    $.fn.appendAndFocus = function (html, element) {
        var $html = $(html),
            $focus = ($(element).size() === 0) ? $html.find(':focusable').eq(0) : $(element).find(':focusable').eq(0);

        this.append($html);
        $focus.focus();
        return this;
    };

    /**
     * html �� ���� ù��°�� ��Ŀ�� �ֱ�
     * @param html
     * @returns {*}
     */
    $.fn.htmlAndFocus = function (html, opts) {
        var me = this;
        me.html(html);

        setTimeout(function () {
            window[LIB_NAME].util.scrollToElement(me, {
                offset: me.offset().top + parseInt(me.css('marginTop'), 10),
                complete: function () {
                    me.attr('tabindex', -1).focus();
                }
            });
        }, 50);
        return me;
    };

    /**
     * ���� ������ �ִ� �ٸ� row���� on�� �����ϰ� ���� row�� on �߰�
     * @function
     * @name $#activeOne
     * @param {string} cls Ȱ�� Ŭ������
     * @return {jQuery}
     */
    $.fn.activeOne = function (index, cls, isReverse) {
        cls = cls || 'on';
        return this.removeClass(cls, !isReverse).eq(index).addClass(cls, isReverse).end();
    };

    /**
     * disabled �� flag�� ���� Ŭ���� ���
     * @function
     * @name $#disabled
     * @param {string} [name = disabled] Ŭ������
     * @param {boolean} flag
     * @returns {*}
     */
    $.fn.disabled = function (name, flag) {
        if (arguments.length === 0) {
            name = 'disabled';
            flag = true;
        }
        if (typeof name !== 'string') {
            flag = !!name;
            name = 'disabled';
        }
        return this.prop('disabled', flag).toggleClass(name, flag);
    };

    /**
     * $(':focusable')  ��Ŀ���� �� �ִ� ����� �˻�
     * @name $#focusable
     */
    $.extend(jQuery.expr[':'], {
        focusable: function (el, index, selector) {
            return $(el).is('a, button, input[type=text], input[type=file], input[type=checkbox], input[type=radio], select, textarea, [tabindex]');
        }
    });

    /**
     * @namespace
     * @name coma
     * @description root namespace of hib site
     */
    var core = context[LIB_NAME] || (context[LIB_NAME] = {});
    var doc = document,
        arrayProto = Array.prototype,
        objectProto = Object.prototype,
        toString = objectProto.toString,
        hasOwn = objectProto.hasOwnProperty,
        arraySlice = arrayProto.slice,

        isPlainObject = (toString.call(null) === '[object Object]') ? function (value) {
            return value !== null
                && value !== undefined
                && toString.call(value) === '[object Object]'
                && value.ownerDocument === undefined;
        } : function (value) {
            return toString.call(value) === '[object Object]';
        },

        isType = function (value, typeName) {
            var isGet = arguments.length === 1;

            function result(name) {
                return isGet ? name : typeName === name;
            }

            if (value === null) {
                return result('null');
            }

            if (value && value.nodeType) {
                if (value.nodeType === 1 || value.nodeType === 9) {
                    return result('element');
                } else if (value && value.nodeType === 3 && value.nodeName === '#text') {
                    return result('textnode');
                }
            }

            if (typeName === 'object' || typeName === 'json') {
                return isGet ? 'object' : isPlainObject(value);
            }

            var s = toString.call(value),
                type = s.match(/\[object (.*?)\]/)[1].toLowerCase();

            if (type === 'number') {
                if (isNaN(value)) {
                    return result('nan');
                }
                if (!isFinite(value)) {
                    return result('infinity');
                }
                return result('number');
            }

            return isGet ? type : type === typeName;
        },

        isArray = function (obj) {
            return isType(obj, 'array');
        },

        isFunction = function (obj) {
            return isType(obj, 'function');
        },

        /**
         * �ݺ� �Լ�
         * @function
         * @name coma.each
         * @param {Array|Object} obj �迭 �� json��ü
         * @param {arrayCallback} iterater �ݹ��Լ�
         * @param {*} [ctx] ���ؽ�Ʈ
         * @returns {*}
         * @example
         * coma.each({'a': '����', 'b': '��', 'c': '��'}, function(value, key) {
         *     alert('key:'+key+', value:'+value);
         *     if(key === 'b') {
         *         return false; // false �� ��ȯ�ϸ� ��ȯ�� �����.
         *     }
         * });
         */
        each = function (obj, iterater, ctx) {
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
        },
        eachReverse = function (obj, iterater, ctx) {
            if (!obj) {
                return obj;
            }
            var i = 0,
                len = 0,
                isArr = isArray(obj);

            if (isArr) {
                for (i = obj.length - 1; i >= 0; i--) {
                    if (iterater.call(ctx || obj, obj[i], i, obj) === false) {
                        break;
                    }
                }
            } else {
                throw new Error('eachReverse �Լ��� �迭���� ����� �� �ֽ��ϴ�.');
            }
            return obj;
        },
        /**
         * ��ü Ȯ�� �Լ�
         * @function
         * @name coma.extend
         * @param {Object} obj...
         * @returns {*}
         * @example
         * var ori = {"a": 'A', "b": [1, 2, 3]};
         * coma.extend(ori, {
         *    "c": "C"
         * }); // {"a": 'A', "b": [1, 2, 3], "c": "C"}
         */
        extend = function (deep, obj) {
            var args;
            if (deep === true) {
                args = arraySlice.call(arguments, 2);
            } else {
                args = arraySlice.call(arguments, 1);
                obj = deep;
                deep = false;
            }
            each(args, function (source) {
                if (!source) {
                    return;
                }

                each(source, function (val, key) {
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
        },
        /**
         * ��ü ���� �Լ�
         * @function
         * @name coma.clone
         * @param {Object} obj �迭 �� json��ü
         * @returns {*}
         * @example
         * var ori = {"a": 'A', "b": [1, 2, 3]};
         * var clone = coma.clone(ori); // {"a": 'A', "b": [1, 2, 3]};
         * // ori ������, ori�� �����Ͽ��� clone�� ������ �ʴ´�.
         */
        clone = function (obj) {
            if (null == obj || "object" != typeof obj) return obj;

            if (obj instanceof Date) {
                var copy = new Date();
                copy.setTime(obj.getTime());
                return copy;
            }

            if (obj instanceof Array) {
                var copy = [];
                for (var i = 0, len = obj.length; i < len; i++) {
                    copy[i] = clone(obj[i]);
                }
                return copy;
            }

            if (obj instanceof Object) {
                var copy = {};
                for (var attr in obj) {
                    if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
                }
                return copy;
            }
            throw new Error('oops!! clone is fail');
        };


    extend(core, {
        name: LIB_NAME,
        debug: false,
        each: each,
        eachReverse: eachReverse,
        extend: extend,
        clone: clone,
        emptyFn: function () {
        },
        /**
         * Ư���Ӽ��� �����ϴ��� üũ�ϱ� ���� ������Ʈ
         * @member
         * @name coma.tmpInput
         * @example
         * if('placeholder' in coma.tmpInput) {
         *     alert('placeholder�� �����մϴ�.');
         * }
         */
        tmpInput: doc.createElement('input'),
        /**
         * Ư�� css��Ÿ���� �����ϴ��� üũ�ϱ� ���� ������Ʈ
         * @member
         * @name coma.tmpNode
         * @example
         * if('transform' in coma.tmpNode.style) {
         *     alert('transform�� �����մϴ�.');
         * }
         */
        tmpNode: doc.createElement('div'),

        /**
         * Ÿ�� üũ
         * @function
         * @name coma.is
         * @param {Object} o Ÿ���� üũ�� ��
         * @param {string} typeName Ÿ�Ը�(null, number, string, element, nan, infinity, date, array)
         * @return {boolean}
         * @example
         * coma.is('aaaa', 'string'); // true
         * coma.is(new Date(), 'date'); // true
         * coma.is(1, 'number'); // true
         * coma.is(/[a-z]/, 'regexp'); // true
         * coma.is(document.getElementById('box'), 'element'); // true
         * coma.is({a:'a'}, 'object'); // true
         * coma.is([], 'array'); // true
         * coma.is(NaN, 'nan'); // true
         * coma.is(null, 'null'); // true
         * // �Ķ���͸� �ϳ��� �ѱ�� Ÿ�Ը��� ��ȯ���� �� �ִ�.
         * coma.is('') // "string"
         * coma.is(null) //"null"
         * coma.is(1) //"number"
         * coma.is({}) //"object"
         * coma.is([]) // "array"
         * coma.is(undefined) // "undefined"
         * coma.is(new Date()) // "date"
         * coma.is(/[a-z]/) // "regexp"
         * coma.is(document.body) //"element"
         */
        is: isType,
        /**
         * Ÿ�� üũ coma.is�� ��Ī
         * @function
         * @name coma.type
         * @param {Object} o Ÿ���� üũ�� ��
         * @param {string} typeName Ÿ�Ը�(null, number, string, element, nan, infinity, date, array)
         * @return {boolean}
         * @example
         * coma.type('aaaa', 'string'); // true
         * coma.type(new Date(), 'date'); // true
         * coma.type(1, 'number'); // true
         * coma.type(/[a-z]/, 'regexp'); // true
         * coma.type(document.getElementById('box'), 'element'); // true
         * coma.type({a:'a'}, 'object'); // true
         * coma.type([], 'array'); // true
         * coma.type(NaN, 'nan'); // true
         * coma.type(null, 'null'); // true
         * // �Ķ���͸� �ϳ��� �ѱ�� Ÿ�Ը��� ��ȯ���� �� �ִ�.
         * coma.type('') // "string"
         * coma.type(null) //"null"
         * coma.type(1) //"number"
         * coma.type({}) //"object"
         * coma.type([]) // "array"
         * coma.type(undefined) // "undefined"
         * coma.type(new Date()) // "date"
         * coma.type(/[a-z]/) // "regexp"
         * coma.type(document.body) //"element"
         */
        type: isType,

        /**
         * �־��� ���ڰ� ������ üũ
         *
         * @param {Object} value üũ�� ���ڿ�
         * @param {boolean} [allowEmptyString = false] ���ڸ� ����� ������ ����
         * @return {boolean}
         * @example
         * coma.isEmpty(null); // true
         * coma.isEmpty(undefined); // true
         * coma.isEmpty(''); // true
         * coma.isEmpty(0); // true
         * coma.isEmpty(null); // true
         * coma.isEmpty([]); // true
         * coma.isEmpty({}); // true
         */
        isEmpty: function (value, allowEmptyString) {
            return (value === null)
                || (value === undefined)
                || (value === 0)
                || (core.is(value, 'string') && !allowEmptyString ? value === '' : false)
                || (core.is(value, 'array') && value.length === 0)
                || (core.is(value, 'object') && !core.object.hasItems(value));
        },

        /**
         * ��ü ��ü�� �־��� �̸��� �Ӽ��� �ִ��� ��ȸ
         *
         * @param {Object} obj ��ü
         * @param {string} name Ű �̸�
         * @return {boolean} Ű�� ���� ����
         * @example
         * var obj = {"a": "A"}
         * if(coma.hasOwn(obj, 'a')){
         *     alert('obj��ü�� a�� �����մϴ�.');
         * }
         */
        hasOwn: function (obj, name) {
            return hasOwn.call(obj, name);
        },
        /**
         * ���ӽ����̽� ������ �����ϰ� ��ü�� ����<br>
         * .�� �����ڷ� �Ͽ� ���� ���ӽ����̽��� �����ȴ�.
         *
         * @function
         * @name coma.namespace
         *
         * @param {string} name ���ӽ����̽���
         * @param {Object} [obj] ������ ���ӽ����̽��� ����� ��ü, �Լ� ��
         * @return {Object} ������ ���ο� ���ӽ����̽�
         *
         * @example
         * coma.namesapce('coma.widget.Tabcontrol', TabControl)
         * // �� native�� Ǯ��,
         * var coma = {
         *     widget: {
         *         Tabcontrol: TabControl
         *     }
         * };
         *
         */
        namespace: function (name, obj) {
            if (typeof name !== 'string') {
                obj && (name = obj);
                return name;
            }

            var root = context,
                names = name.split('.'),
                i, item;

            for (i = -1; item = names[++i];) {
                root = root[item] || (root[item] = {});
            }

            return extend(root, obj || {});
        },
        /**
         * coma ������ name�� �ش��ϴ� ���ӽ����̽��� �����Ͽ� object�� �������ִ� �Լ�
         *
         * @function
         * @name coma.addon
         *
         * @param {string} name .�� �����ڷ� �ؼ� coma�� �������� ���� ���ӽ����̽��� ����. name�� ������ coma�� �߰��ȴ�.
         * @param {Object|Function} obj
         *
         * @example
         * coma.addon('urls', {
         *    store: 'Store',
         *    company: 'Company'
         * });
         *
         * alert(coma.urls.store);
         * alert(coma.urls.company);
         */
        addon: function (name, object, isExecFn) {
            if (typeof name !== 'string') {
                object = name;
                name = '';
            }

            var root = core,
                names = name ? name.replace(/^_core\.?/, '').split('.') : [],
                ln = names.length - 1,
                leaf = names[ln];

            if (isExecFn !== false && typeof object === 'function' && !hasOwn.call(object, 'superclass')) {
                object = object.call(root);
            }

            for (var i = 0; i < ln; i++) {
                root = root[names[i]] || (root[names[i]] = {});
            }

            return (leaf && (root[leaf] ? extend(root[leaf], object) : (root[leaf] = object))) || extend(root, object), object;
        }
    });
    core.ns = core.namespace;

    /**
     * benchmart functions
     */
    extend(core, /** @lends coma */{
        /**
         * timeStart("name")�� name���� Ű���ϴ� Ÿ�̸Ӱ� ���۵Ǹ�, timeEnd("name")�� �ش� name���� ���� �ð��� �α׿� ������ش�.
         *
         * @param {string} name Ÿ�̸��� Ű��
         * @param {boolean} reset ����(�ʱ�ȭ) ����
         *
         * @example
         * coma.timeStart('animate');
         * ...
         * coma.timeEnd('animate'); -> animate: 10203ms
         */
        timeStart: function (name, reset) {
            if (!name) {
                return;
            }
            var time = +new Date,
                key = "KEY" + name.toString();

            this.timeCounters || (this.timeCounters = {});
            if (!reset && this.timeCounters[key]) {
                return;
            }
            this.timeCounters[key] = time;
        },

        /**
         * timeStart("name")���� ������ �ش� name���� ���� �ð��� �α׿� ������ش�.
         *
         * @param {string} name Ÿ�̸��� Ű��
         * @return {number} �ɸ� �ð�
         *
         * @example
         * coma.timeStart('animate');
         * ...
         * coma.timeEnd('animate'); -> animate: 10203ms
         */
        timeEnd: function (name) {
            if (!this.timeCounters) {
                return null;
            }

            var time = +new Date,
                key = "KEY" + name.toString(),
                timeCounter = this.timeCounters[key],
                diff;

            if (timeCounter) {
                diff = time - timeCounter;
// �� �ܼ��� ������� ���� ���̹Ƿ� ������ ����.
                console.log('[' + name + '] ' + diff + 'ms');
                delete this.timeCounters[key];
            }
            return diff;
        }
    });


/////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     * ���ڰ��� ��ƿ�Լ� ����
     *
     * @namespace
     * @name coma.number
     */
    core.addon('number', /** @lends coma.number */{
        /**
         * �־��� ���� �ڸ�����ŭ ���ڸ��� 0�� ä���� ��ȯ
         *
         * @param {string} value
         * @param {number} [size = 2]
         * @param {string} [ch = '0']
         * @return {string}
         *
         * @example
         * coma.number.zeroPad(2, 3); // "002"
         */
        zeroPad: function (value, size, ch) {
            var sign = value < 0 ? '-' : '',
                result = String(Math.abs(value));

            ch || (ch = "0");
            size || (size = 2);

            if (result.length >= size) {
                return sign + result.slice(-size);
            }

            while (result.length < size) {
                result = ch + result;
            }
            return sign + result;
        },

        /**
         * ���ڸ����� ,�� ����
         *
         * @function
         * @param {number} value
         * @return {string}
         *
         * @example
         * coma.number.addComma(21342); // "21,342"
         */
        addComma: (function () {
            var regComma = /(\d+)(\d{3})/;
            return function (value) {
                value += '';
                var x = value.split('.'),
                    x1 = x[0],
                    x2 = x.length > 1 ? '.' + x[1] : '';

                while (regComma.test(x1)) {
                    x1 = x1.replace(regComma, '$1' + ',' + '$2');
                }
                return x1 + x2;
            };
        })(),

        /**
         * min ~ max������ ������ ��ȯ
         *
         * @param {number} min �ּҰ�
         * @param {number} max �ִ밪
         * @return {number} ������
         */
        random: function (min, max) {
            if (!max) {
                max = min;
                min = 0;
            }
            return min + Math.floor(Math.random() * (max - min + 1));
        },

        /**
         * �����Ѱ��� ��ȯ. value�� min���� ���� ��� min��, max���� Ŭ ��� max�� ��ȯ
         *
         * @param {number} value
         * @param {number} min �ּҰ�
         * @param {number} max �ִ밪
         * @return {number}
         */
        limit: function (value, min, max) {
            if (value < min) {
                return min;
            }
            else if (value > max) {
                return max;
            }
            return value;
        },

        /**
         * ��� ��쿡�� ���ڷ� ��ȯ(���ڸ� ������ �� ���ڸ� ����)
         * @param value
         * @return {number}
         */
        parse: function (value) {
            value = (value || '').replace(/[^-0-9\.]/gi, '');
            return value | 0;
        },
        /**
         * 2������ ��ȯ
         * @param d ���ڰ�
         * @param bits ��Ʈ���� (4 or 8)
         * @return {string}
         */
        toBinary: function (d, bits) {
            var b = [];
            if (!bits) {
                bits = 8;
            }
            while (d > 0) {
                b.unshift(d % 2);
                d >>= 1;
            }
            if (bits) {
                while (b.length < bits) {
                    b.unshift(0);
                }
            }
            return b.join("");
        },
        fromBinary: function (b) {
            var ba = (b || '').split(""),
                n = 1,
                r = 0;
            for (var i in ba) {
                r += n * ba[i];
                n *= 2;
            }
            return r;
        }
    });
    /**
     * coma.number.zeroPad�� ��Ī
     * @function
     * @static
     * @name coma.number.pad
     */
    core.numPad = core.number.pad = core.number.zeroPad;
    core.comma = core.number.addComma;
/////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * ���ڿ� ���� ��ƿ �Լ� ����
     *
     * @namespace
     * @name coma.string
     */
    core.addon('string', function () {
        var escapeChars = {
                '&': '&amp;',
                '>': '&gt;',
                '<': '&lt;',
                '"': '&quot;',
                "'": '&#39;'
            },
            unescapeChars = (function (escapeChars) {
                var results = {};
                each(escapeChars, function (v, k) {
                    results[v] = k;
                });
                return results;
            })(escapeChars),
            escapeRegexp = /[&><'"]/g,
            unescapeRegexp = /(&amp;|&gt;|&lt;|&quot;|&#39;|&#[0-9]{1,5};)/g,
            tagRegexp = /<\/?[^>]+>/gi,
            scriptRegexp = /<script[^>]*>([\\S\\s]*?)<\/script>/img;

        return /** @lends coma.string */{
            /**
             * �յ� ���ڿ��� ����
             * @param {string} value
             * @returns {string}
             * @example
             * coma.string.trim(" abc "); // 'abc'
             */
            trim: function (value) {
                return value ? value.replace(/^\s+|\s+$/g, "") : value;
            },
            /**
             * ���Խ��̳� �˻����ڿ��� ����Ͽ� ���ڿ����� �ؽ�Ʈ�� ��ü
             *
             * @param {string} value ��ü�� ������ ���ڿ�
             * @param {RegExp|string} find �˻��� ���ڿ��̳� ���Խ� ����
             * @param {string} rep ��ü�� ���ڿ�
             * @return {string} ��ü�� ��� ���ڿ�
             *
             * @example
             * coma.string.replaceAll("a,b,c,d", ',', ''); // "abcd"
             */
            replaceAll: function (value, find, rep) {
                if (find.constructor === RegExp) {
                    return value.replace(new RegExp(find.toString().replace(/^\/|\/$/gi, ""), "gi"), rep);
                }
                return value.split(find).join(rep);
            },

            /**
             * �־��� ���ڿ��� ����Ʈ���� ��ȯ
             *
             * @param {string} value ���̸� ����� ���ڿ�
             * @return {number}
             *
             * @example
             * coma.string.byteLength("���ع���"); // 8
             */
            byteLength: function (value) {
                var l = 0;
                for (var i = 0, len = value.length; i < len; i++) {
                    l += (value.charCodeAt(i) > 255) ? 2 : 1;
                }
                return l;
            },

            /**
             * �־��� path���� Ȯ���ڸ� ����
             * @param {string} fname path���ڿ�
             * @return {string} Ȯ����
             * @example
             * coma.string.getFileExt('etc/bin/jslib.js'); // 'js'
             */
            getFileExt: function (fname) {
                fname || (fname = '');
                return fname.substr((~-fname.lastIndexOf(".") >>> 0) + 2);
            },

            /**
             * �־��� path���� ���ϸ��� ����
             * @param {string} str path���
             * @returns {string} ���ϸ�
             * @example
             * coma.string.getFileName('etc/bin/jslib.js'); // 'jslib.js'
             */
            getFileName: function (str) {
                var paths = str.split(/\/|\\/g);
                return paths[paths.length - 1];
            },

            /**
             * �־��� ���ڿ��� ������ ����(����Ʈ)��ŭ �ڸ� ��, �������� ���ٿ� ��ȯ
             *
             * @param {string} value ���ڿ�
             * @param {number} length �߶� ����
             * @param {string} [truncation = '...'] ������
             * @return {string} ��� ���ڿ�
             *
             * @example
             * coma.string.cutByByte("���ع���", 3, "..."); // "��..."
             */
            cutByByte: function (value, length, truncation) {
                var str = value,
                    chars = this.indexByByte(value, length);

                truncation || (truncation = '');
                if (str.length > chars) {
                    return str.substring(0, chars) + truncation;
                }
                return str;
            },

            /**
             * �־��� ����Ʈ���̿� �ش��ϴ� char index ��ȯ
             *
             * @param {string} value ���ڿ�
             * @param {number} length ���� ���ڼ�
             * @return {number} chars index
             * @example
             * coma.string.indexByByte("���ع���", 3); // 2
             */
            indexByByte: function (value, length) {
                var str = value,
                    l = 0, len, i;
                for (i = 0, len = str.length; i < len; i++) {
                    l += (str.charCodeAt(i) > 255) ? 2 : 1;
                    if (l > length) {
                        return i;
                    }
                }
                return i;
            },

            /**
             * ù���ڸ� �빮�ڷ� ��ȯ�ϰ� ������ ���ڵ��� �ҹ��ڷ� ��ȯ
             *
             * @param {string} value ���ڿ�
             * @return {string} ��� ���ڿ�
             *
             * @example
             * coma.string.capitalize("abCdEfg"); // "Abcdefg"
             */
            capitalize: function (value) {
                return value ? value.charAt(0).toUpperCase() + value.substring(1) : value;
            },

            /**
             * ī�� �������� ��ȯ
             *
             * @param {string} value ���ڿ�
             * @return {string} ��� ���ڿ�
             *
             * @example
             * coma.string.capitalize("ab-cd-efg"); // "abCdEfg"
             */
            camelize: function (value) {
                return value ? value.replace(/(\-|_|\s)+(.)?/g, function (a, b, c) {
                    return (c ? c.toUpperCase() : '');
                }) : value
            },

            /**
             * �뽬 �������� ��ȯ
             *
             * @param {string} value ���ڿ�
             * @return {string} ��� ���ڿ�
             *
             * @example
             * coma.string.dasherize("abCdEfg"); // "ab-cd-efg"
             */
            dasherize: function (value) {
                return value ? value.replace(/[_\s]+/g, '-').replace(/([A-Z])/g, '-$1').replace(/-+/g, '-').toLowerCase() : value;
            },

            /**
             * ù���ڸ� �ҹ��ڷ� ��ȯ
             * @param {string} value ���ڿ�
             * @returns {string} ��� ���ڿ�
             * @example
             * coma.string.toFirstLower("Welcome"); // 'welcome'
             */
            toFirstLower: function (value) {
                return value ? value.replace(/^[A-Z]/, function (s) {
                    return s.toLowerCase();
                }) : value;
            },

            /**
             * �־��� ���ڿ��� ������ ����ŭ �ݺ��Ͽ� ����
             *
             * @param {string} value ���ڿ�
             * @param {number} cnt �ݺ� Ƚ��
             * @return {string} ��� ���ڿ�
             *
             * @example
             * coma.string.repeat("ab", 4); // "abababab"
             */
            repeat: function (value, cnt, sep) {
                sep || (sep = '');
                var result = [];

                for (var i = 0; i < cnt; i++) {
                    result.push(value);
                }
                return result.join(sep);
            },

            /**
             * Ư����ȣ�� HTML ENTITY�� ��ȯ
             *
             * @param {string} value Ư����ȣ
             * @return {string} ��� ���ڿ�
             *
             * @example
             * coma.string.escapeHTML('<div><a href="#">��ũ</a></div>'); // "&lt;div&gt;&lt;a href=&quot;#&quot;&gt;��ũ&lt;/a&gt;&lt;/div&gt;"
             */
            escapeHTML: function (value) {
                return value ? (value + "").replace(escapeRegexp, function (m) {
                    return escapeChars[m];
                }) : value;
            },

            /**
             * HTML ENTITY�� ��ȯ�� ���ڿ��� ���� ��ȣ�� ��ȯ
             *
             * @param {string} value ���ڿ�
             * @return {string} ��� ���ڿ�
             *
             * @example
             * coma.string.unescapeHTML('&lt;div&gt;&lt;a href=&quot;#&quot;&gt;��ũ&lt;/a&gt;&lt;/div&gt;');  // '<div><a href="#">��ũ</a></div>'
             */
            unescapeHTML: function (value) {
                return value ? (value + "").replace(unescapeRegexp, function (m) {
                    return unescapeChars[m];
                }) : value;
            },

            /**
             * value === these�̸� other��,  value !== these �̸� value�� ��ȯ
             *
             * @param {string} value ���� ���°�
             * @param {string} these ù��° ���°�
             * @param {string} other �ι�° ���°�
             * @return {string}
             *
             * @example
             * // ���Ĺ�ư�� �̿�
             * coma.string.toggle('ASC", "ASC", "DESC"); // "DESC"
             * coma.string.toggle('DESC", "ASC", "DESC"); // "ASC"
             */
            toggle: function (value, these, other) {
                return these === value ? other : value;
            },

            /**
             * �־��� ���ڿ��� �ִ� {�ε���} �κ��� �־��� �μ��� �ش��ϴ� ������ ġȯ �� ��ȯ
             *
             * @param {string} format ���ڿ�
             * @param {string} ... ��ü�� ���ڿ�
             * @return {string} ��� ���ڿ�
             *
             * @example
             * coma.string.format("{0}:{1}:{2} {0}", "a", "b", "c");  // "a:b:c a"
             */
            format: function (format, val) {
                var args = core.toArray(arguments).slice(1),
                    isJson = core.is(val, 'object');

                return format.replace(/\{([0-9a-z]+)\}/ig, function (m, i) {
                    return isJson ? val[i] : args[i] || '';
                });
            },

            /**
             * ���ڿ��� HTML ENTITIES�� ��ȯ
             * @param value
             * @return {string}
             */
            toEntities: function (value) {
                var buffer = [];
                for (var i = 0, len = string.length; i < len; i++) {
                    buffer.push("&#", value.charCodeAt(i).toString(), ";");
                }
                return buffer.join("");
            },

            /**
             * �������ڿ� ����
             * @param {Number} ����
             * @returns {String} �������ڿ�
             */
            random: function (len) {
                var keystr = '', x;
                for (var i = 0; i < len; i++) {
                    x = Math.floor((Math.random() * 36));
                    if (x < 10) {
                        keystr += String(x);
                    } else {
                        keystr += String.fromCharCode(x + 87);
                    }
                }
                return keystr;
            },

            /**
             * �־��� ���ڿ����� HTML�� ����
             *
             * @param {string} value ���ڿ�
             * @return {string} �±װ� ���ŵ� ���ڿ�
             * @example
             * coma.string.stripTags('welcome to <b>the</b> jungle'); // 'welcome to the jungle'
             */
            stripTags: function (value) {
                return value.replace(tagRegexp, '');
            },

            /**
             * �־��� ���ڿ����� ��ũ��Ʈ�� ����
             *
             * @param {string} value ���ڿ�
             * @return {string} ��ũ��Ʈ�� ���ŵ� ���ڿ�
             * @example
             * coma.string.stripScripts('welcome <s'+'cript>alert('hello');</s'+'cript> to the jungle'); // 'welcome to the jungle'
             */
            stripScripts: function (value) {
                return value.replace(scriptRegexp, '');
            }

        };
    });
/////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     * JSON��ü ���� ��ƿ�Լ�
     * @namespace
     * @name coma.object
     */
    core.addon('object', /** @lends coma.object */{

        /**
         * ��ü�� ���Ű����� �Ӽ� �� �޼��� �̸��� �迭�� ��ȯ
         * @name coma.object.keys
         * @function
         * @param {Object} obj ���ͷ� ��ü
         * @return {Array} ��ü�� ���Ű����� �Ӽ��� �̸��� ���Ե� �迭
         *
         * @example
         * coma.object.keys({"name": "Axl rose", "age": 50}); // ["name", "age"]
         */
        keys: Object.keys || function (obj) {
            var results = [];
            each(obj, function (v, k) {
                results.push(k);
            });
            return results;
        },

        /**
         * ��ü�� ���Ű����� �Ӽ��� ���� �迭�� ��ȯ
         * @function
         * @name coma.object.values
         * @param {Object} obj ���ͷ� ��ü
         * @return {Array} ��ü�� ���Ű����� �Ӽ��� ������ ���Ե� �迭
         *
         * @example
         * coma.object.values({"name": "Axl rose", "age": 50}); // ["Axl rose", 50]
         */
        values: Object.values || function (obj) {
            var results = [];
            each(obj, function (v) {
                results.push(v);
            });
            return results;
        },

        /**
         * �ݹ��Լ��� �������� �� ��Ҹ� �����ϴ� �Լ�
         *
         * @param {Object} obj ��ü
         * @param {Function} cb �ݹ��Լ�
         * @return {Object}
         *
         * @example
         * coma.object.map({1; 'one', 2: 'two', 3: 'three'}, function(item, key) {
 *
return item + '__';
 * });
         * // {1: 'one__', 2: 'two__', 3: 'three__'}
         */
        map: function (obj, cb) {
            if (!core.is(obj, 'object') || !core.is(cb, 'function')) {
                return obj;
            }
            var results = {};
            each(obj, function (v, k) {
                results[k] = cb(obj[k], k, obj);
            });
            return results;
        },

        /**
         * ��Ұ� �ִ� json��ü���� üũ
         *
         * @param {Object} obj json��ü
         * @return {boolean} ��Ұ� �ϳ��� �ִ��� ����
         * @example
         * var obj1 = {};
         * var obj2 = {"a": "A"}
         * coma.object.hasItems(obj1); // false
         * coma.object.hasItems(obj2); // true
         */
        hasItems: function (obj) {
            if (!core.is(obj, 'object')) {
                return false;
            }

            var has = false;
            each(obj, function (v) {
                return has = true, false;
            });
            return has;
        },


        /**
         * ��ü�� ������ũ������ ��ȯ
         *
         * @param {Object} obj json��ü
         * @param {boolean} [isEncode = true] URL ���ڵ����� ����
         * @return {string} ��� ���ڿ�
         *
         * @example
         * coma.object.toQueryString({"a":1, "b": 2, "c": {"d": 4}}); // "a=1&b=2&c[d]=4"
         */
        toQueryString: function (params, isEncode) {
            if (typeof params === 'string') {
                return params;
            }
            var queryString = '',
                encode = isEncode === false ? function (v) {
                    return v;
                } : encodeURIComponent;

            each(params, function (value, key) {
                if (typeof (value) === 'object') {
                    each(value, function (innerValue, innerKey) {
                        if (queryString !== '') {
                            queryString += '&';
                        }
                        queryString += encode(key) + '[' + encode(innerKey) + ']=' + encode(innerValue);
                    });
                } else if (typeof (value) !== 'undefined') {
                    if (queryString !== '') {
                        queryString += '&';
                    }
                    queryString += encode(key) + '=' + encode(value);
                }
            });
            return queryString;
        },

        /**
         * �־��� �迭�� Ű�� ��Ҹ� �¹ٲ��ִ� �Լ�
         *
         * @param {Array} obj �迭
         * @return {Object}
         *
         * @example
         * coma.object.travere({1:a, 2:b, 3:c, 4:d]);
 * // {a:1, b:2, c:3, d:4}
 */
        traverse: function (obj) {
            var result = {};
            each(obj, function (item, index) {
                result[item] = index;
            });
            return result;
        },

        /**
         * �־��� ���ͷ����� key�� �ش��ϴ� ��Ҹ� ����
         *
         * @param {Object} value ���ͷ�
         * @param {Object} key ������ Ű
         * @return ������ ��Ұ� ������ ���ͷ�
         * @example
         * var obj = {"a": "A", "b": "B"}
         * coma.object.remove(obj, 'b'); // {"a":"A"} // delete obj.b;�� �ϴ°� �� ���ڳ�..��
         */
        remove: function (value, key) {
            if (!core.is(value, 'object')) {
                return value;
            }
            value[key] = null;
            delete value[key];
            return value;
        },

        /**
         * json�� ���ڿ��� ��ȯ(JSON�� �����ϴ� ������������ JSON.stringify�� ����Ѵ�.)
         * @name coma.object.stringfy
         * @param {Object} val json ��ü
         * @param {Object} [opts]
         * @param {boolean} [opts.singleQuotes = false] ���ڿ��� '�� ���Ұ��ΰ�
         * @param {string} [opts.indent = '']  �鿩���� ����(\t or �����̽�)
         * @param {string} [opts.nr = ''] �ٹٲ� ����(\n or �����̽�)
         * @param {string} [pad = ''] ��ȣ�� ���ڰ��� ����
         * @return {string}
         * @example
         * coma.object.stringify({"a": "A"
         */
        stringify: window.JSON ? JSON.stringify : function (val, opts, pad) {
            var cache = [];
            return (function stringify(val, opts, pad) {
                var objKeys;
                opts = $.extend({}, {
                    singleQuotes: false,
                    indent: '', // '\t'
                    nr: '' // '\n'
                }, opts);
                pad = pad || '';

                if (typeof val === 'number' ||
                    typeof val === 'boolean' ||
                    val === null ||
                    val === undefined) {
                    return val;
                }

                if (typeof val === 'string') {
                    return '"' + val + '"';
                }

                if (val instanceof Date) {
                    return "new Date('" + val.toISOString() + "')";
                }

                if ($.isArray(val)) {
                    if (core.isEmpty(val)) {
                        return '[]';
                    }

                    return '[' + opts.nr + core.array.map(val, function (el, i) {
                            var eol = val.length - 1 === i ? opts.nr : ', ' + opts.nr;
                            return pad + opts.indent + stringify(el, opts, pad + opts.indent) + eol;
                        }).join('') + pad + ']';
                }

                if (core.isPlainObject(val)) {
                    if (core.array.indexOf(cache, val) !== -1) {
                        return null;
                    }

                    if (core.isEmpty(val)) {
                        return '{}';
                    }

                    cache.push(val);

                    objKeys = core.object.keys(val);

                    return '{' + opts.nr + core.array.map(objKeys, function (el, i) {
                            var eol = objKeys.length - 1 === i ? opts.nr : ', ' + opts.nr;
                            var key = /^[^a-z_]|\W+/ig.test(el) && el[0] !== '$' ? stringify(el, opts) : el;
                            return pad + opts.indent + '"' + key + '": ' + stringify(val[el], opts, pad + opts.indent) + eol;
                        }).join('') + pad + '}';
                }

                if (opts.singleQuotes === false) {
                    return '"' + (val + '').replace(/"/g, '\\\"') + '"';
                } else {
                    return "'" + (val + '').replace(/'/g, "\\\'") + "'";
                }
            })(val, opts, pad);
        }
    });
    core.object.has = core.object.hasItems;
    core.json = core.object;
/////////////////////////////////////////////////////////////////////////////////////////////////
    var arrayProto = Array.prototype;

// ����Ƽ�꿡 f�� �������� ������ false ��ȯ
    function nativeCall(f) {
        return f ? function (obj) {
            return f.apply(obj, arraySlice.call(arguments, 1));
        } : false;
    }

    /**
     * �迭���� ��ƿ�Լ�
     * @namespace
     * @name coma.array
     */
    core.addon('array', /** @lends coma.array# */{
        /**
         * �迭 ����
         * @param {Array} arr ���� �迭
         * @param {...Mixed} var_args ��ĥ ��ҵ�
         * @returns {Array} ��� ������ �迭
         * @exmaple
         * var newArray = coma.array.append([1,2,3], [4,5,6], [6, 7, 8]); // [1,2,3,4,5,6,7,8]
         */
        append: function (arr) {
            var args = arraySlice.call(arguments);
            arrayProto.push.apply.apply(args);
            return args[0];
        },
        /**
         * �ݹ��Լ��� �Ͽ��� ��Ҹ� �����ϴ� �Լ�
         *
         * @name coma.array.map
         * @function
         * @param {Array} obj �迭
         * @param {arrayCallback} cb �ݹ��Լ�
         * @param {Object} (optional) ���ؽ�Ʈ
         * @return {Array} ����� �迭
         *
         * @example
         * coma.array.map([1, 2, 3], function(item, index) {
 *
return item * 10;
 * });
         * // [10, 20, 30]
         */
        map: nativeCall(arrayProto.map) || function (obj, cb, ctx) {
            var results = [];
            if (!core.is(obj, 'array') || !core.is(cb, 'function')) {
                return results;
            }
// vanilla js~
            for (var i = 0, len = obj.length; i < len; i++) {
                results[results.length] = cb.call(ctx || obj, obj[i], i, obj);
            }
            return results;
        },

        /**
         * �ݺ����Լ��� ��ȯ���� true�� �ƴ� ������ �ݺ�
         *
         * @name coma.array.every
         * @function
         * @param {Array} arr �迭
         * @param {arrayCallback} cb �Լ�
         * @return {boolean} ���� ���
         * @example
         * var sum = 0;
         * coma.array.every([1, 3, 5, 7], function(val) {
         *     return val > 5;
         * });
         * // 9
         */
        every: nativeCall(arrayProto.every) || function (arr, cb, ctx) {
            var isTrue = true;
            if (!core.is(arr, 'array') || !core.is(cb, 'function')) {
                return isTrue;
            }
            each(arr, function (v, k) {
                if (cb.call(ctx || this, v, k) !== true) {
                    return isTrue = false, false;
                }
            });
            return isTrue;
        },

        /**
         * �ݺ����Լ��� ��ȯ���� true�� ������ �ݺ�
         *
         * @name coma.array.any
         * @function
         * @param {Array} arr �迭
         * @param {arrayCallback} cb �Լ�
         * @return {boolean} ���� ���
         * @example
         * var sum = 0;
         * coma.array.any([1, 3, 5, 7], function(val) {
         *     return val < 5;
         * });
         * // 4
         */
        any: nativeCall(arrayProto.any) || function (arr, cb, ctx) {
            var isTrue = false;
            if (!core.is(arr, 'array') || !core.is(cb, 'function')) {
                return isTrue;
            }
            each(arr, function (v, k) {
                if (cb.call(ctx || this, v, k) === true) {
                    return isTrue = true, false;
                }
            });
            return isTrue;
        },

        /**
         * �迭 ����� ������ �����ִ� �Լ�
         *
         * @param {Array} obj �迭
         * @return {Array} ������ ���� ���ο� �迭
         * @example
         * coma.array.shuffle([1, 3, 4, 6, 7, 8]); // [6, 3, 8, 4, 1, 7]
         */
        shuffle: function (obj) {
            var rand,
                index = 0,
                shuffled = [],
                number = core.number;

            each(obj, function (value) {
                rand = number.random(index++);
                shuffled[index - 1] = shuffled[rand], shuffled[rand] = value;
            });
            return shuffled;
        },

        /**
         * �ݹ��Լ��� �Ͽ��� ��Ҹ� �ɷ����� �Լ�
         * @function
         * @name coma.array.filter
         * @param {Array} obj �迭
         * @param {Function} cb �ݹ��Լ�
         * @param {Object} (optional) ���ؽ�Ʈ
         * @returns {Array}
         *
         * @example
         * coma.array.filter([1, '��', 2, '��', 3, '��'], function(item, index) {
 *
return typeof item === 'string';
 * });
         * // ['��','��','��']
         */
        filter: nativeCall(arrayProto.filter) || function (obj, cb, ctx) {
            var results = [];
            if (!core.is(obj, 'array') || !core.is(cb, 'function')) {
                return results;
            }
            for (var i = 0, len = obj.length; i < len; i++) {
                cb.call(ctx || obj, obj[i], i, obj) && (results[results.length] = obj[i]);
            }
            return results;
        },

        /**
         * �־��� �迭�� ������ ���� �����ϴ��� üũ
         *
         * @param {Array} obj �迭
         * @param {Function} cb �ݹ��Լ�
         * @return {boolean}
         *
         * @example
         * coma.array.include([1, '��', 2, '��', 3, '��'], '��');  // true
         */
        include: function (arr, value, b) {
            if (!core.is(arr, 'array')) {
                return value;
            }
            if (typeof value === 'function') {
                for (var i = 0; i < arr.length; i++) {
                    if (value(arr[i], i) === true) {
                        return true;
                    }
                }
                return false;
            }
            return core.array.indexOf(arr, value, b) > -1;
        },

        /**
         * �־��� �ε����� ��Ҹ� ��ȯ
         * @function
         * @name coma.array.indexOf
         * @param {Array} obj �迭
         * @param {Function} cb �ݹ��Լ�
         * @return {number}
         *
         * @example
         * coma.array.indexOf([1, '��', 2, '��', 3, '��'], '��');  // 1
         */
        indexOf: nativeCall(arrayProto.indexOf) || function (arr, value, b) {
            for (var i = 0, len = arr.length; i < len; i++) {
                if ((b !== false && arr[i] === value) || (b === false && arr[i] == value)) {
                    return i;
                }
            }
            return -1;
        },

        /**
         * �־��� �迭���� index�� �ش��ϴ� ��Ҹ� ����
         *
         * @param {Array} value �迭
         * @param {number} index ������ �ε��� or ���
         * @return {Array} ������ ��Ұ� ������ �迭
         * @example
         * coma.array.removeAt([1, 2, 3, 4], 1); // [1, 3, 4]
         */
        removeAt: function (value, index) {
            if (!core.is(value, 'array')) {
                return value;
            }
            value.splice(index, 1);
            return value;
        },


        /**
         * �־��� �迭���� �ش��ϴ� ��Ҹ� ����
         *
         * @param {Array} value �迭
         * @param {*} item ���
         * @return {Array} ������ ��Ұ� ������ �迭
         * @example
         * coma.array.remove(['a', 'b', 'c'], 'b'); // ['a', 'c']
         *
         * coma.array.remove(['a', 'b', 'c'], function(value){
         *     return value === 'b';
         * }); // ['a', 'c']
         */
        remove: function (value, iter) {
            if (!core.is(value, 'array')) {
                return value;
            }
            if (typeof iter === 'function') {
                for (var i = value.length, item; item = value[--i];) {
                    if (iter(item, i) === true) {
                        value = this.removeAt(value, i);
                    }
                }
                return value;
            } else {
                var index = this.indexOf(value, iter);
                if (index < 0) {
                    return value;
                }
                return this.removeAt(value, index);
            }
        },

        /**
         * �־��� �迭���� ���� ū ��Ҹ� ��ȯ
         *
         * @param {Array} array �迭
         * @return {number} �ִ밪
         * @example
         * coma.array.max([2, 1, 3, 5, 2, 8]); // 8
         */
        max: function (array) {
            return Math.max.apply(Math, array);
        },

        /**
         * �־��� �迭���� ���� ���� ��Ҹ� ��ȯ
         *
         * @param {Array} array �迭
         * @return {number} �ּҰ�
         * @example
         * coma.array.min([2, 1, 3, 5, 2, 8]); // 1
         */
        min: function (array) {
            return Math.min.apply(Math, array);
        },

        /**
         * �迭�� ��Ҹ� �������� ���ġ
         *
         * @name reverse
         * @param {Array} array �迭
         * @return {Array} �������� ���ĵ� ���ο� �迭
         * @example
         * coma.array.reverse([1, 2, 3]); // [3, 2, 1]
         */
        reverse: nativeCall(arrayProto.reverse) || function (array) {
            var tmp = null, first, last;
            var length = array.length;

            for (first = 0, last = length - 1; first < length / 2; first++, last--) {
                tmp = array[first];
                array[first] = array[last];
                array[last] = tmp;
            }

            return array;
        },

        /**
         * �� �迭�� �������� ��ȯ
         * @param {Array} arr1 �迭1
         * @param {Array} arr2 �迭2
         * @returns {Array} ������ �迭
         * @example
         * coma.array.different([1, 2, 3, 4, 5], [3, 4, 5, 6, 7]); // [1, 2, 6, 7]
         */
        different: function (arr1, arr2) {
            var newArr = [];
            core.each(arr1, function (value) {
                if (core.array.indexOf(arr2, value) < 0) {
                    newArr.push(value);
                }
            });
            core.each(arr2, function (value) {
                if (core.array.indexOf(arr1, value) < 0) {
                    newArr.push(value);
                }
            });
            return newArr;
        }
    });
/////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     * ��¥���� ��ƿ�Լ�
     * @namespace
     * @name coma.date
     */
    core.addon('date', function () {
        var months = "Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec".split(","),
            fullMonths = "January,Febrary,March,April,May,June,July,Augst,September,October,November,December".split(",");


        function compare(d1, d2) {
            if (!(d1 instanceof Date)) {
                d1 = core.date.parse(d1);
            }
            if (!(d2 instanceof Date)) {
                d2 = core.date.parse(d2);
            }

            return d1.getTime() > d2.getTime() ? -1 : (d1.getTime() === d2.getTime() ? 0 : 1);
        }

        return /** @lends coma.date */{
            MONTHS_NAME: months,
            MONTHS_FULLNAME: fullMonths,
            FORMAT: 'yyyy.MM.dd',

            /**
             * ��¥������ ������ ������ ���ڿ��� ��ȯ
             *
             * @param {Date} formatDate
             * @param {string} formatString} ���� ���ڿ�
             * @return {string} ��ȯ�� ���ڿ�
             *
             * @example
             * coma.date.format(new Date(), "yy/MM/dd");
             * // '15/01/05'
             */
            format: function (formatDate, formatString) {
                formatString || (formatString = this.FORMAT);
                if (core.is(formatDate, 'number')) {
                    formatDate = new Date(formatDate);
                } else if (core.is(formatDate, 'string')) {
                    formatDate = this.parse(formatDate);
                }
                if (formatDate instanceof  Date) {
                    var yyyy = formatDate.getFullYear(),
                        yy = yyyy.toString().substring(2),
                        M = formatDate.getMonth() + 1,
                        MM = M < 10 ? "0" + M : M,
                        MMM = this.MONTHS_NAME[M - 1],
                        MMMM = this.MONTHS_FULLNAME[M - 1],
                        d = formatDate.getDate(),
                        dd = d < 10 ? "0" + d : d,
                        h = formatDate.getHours(),
                        hh = h < 10 ? "0" + h : h,
                        m = formatDate.getMinutes(),
                        mm = m < 10 ? "0" + m : m,
                        s = formatDate.getSeconds(),
                        ss = s < 10 ? "0" + s : s,
                        x = h > 11 ? "PM" : "AM",
                        H = h % 12;

                    if (H === 0) {
                        H = 12;
                    }
                    return formatString.replace(/yyyy/g, yyyy)
                        .replace(/yy/g, yy)
                        .replace(/MMMM/g, MMMM)
                        .replace(/MMM/g, MMM)
                        .replace(/MM/g, MM)
                        .replace(/M/g, M)
                        .replace(/dd/g, dd)
                        .replace(/d/g, d)
                        .replace(/hh/g, hh)
                        .replace(/h/g, h)
                        .replace(/mm/g, mm)
                        .replace(/m/g, m)
                        .replace(/ss/g, ss)
                        .replace(/s/g, s)
                        .replace(/!!!!/g, MMMM)
                        .replace(/!!!/g, MMM)
                        .replace(/H/g, H)
                        .replace(/x/g, x);
                } else {
                    return "";
                }
            },

            /**
             * �־��� ���ڰ� ��ȿ���� üũ
             * @param {string} date ��¥ ���ڿ�
             * @returns {boolean} ��ȿ�� �������� ����
             * @example
             * coma.date.isValid('2014-13-23'); // false
             * coma.date.isValid('2014-11-23'); // true
             */
            isValid: function (date) {
                try {
                    return !isNaN(this.parse(date).getTime());
                } catch (e) {
                    return false;
                }
            },

            /**
             * date�� start�� end�������� ����
             *
             * @param {Date} date ��¥
             * @param {Date} start �����Ͻ�
             * @param {Date} end �����Ͻ�
             * @return {boolean} �γ�¥ ���̿� �ִ��� ����
             * @example
             * coma.date.between('2014-09-12', '2014-09-11', '2014=09-12'); // true
             * coma.date.between('2014-09-12', '2014-09-11', '2014=09-11') // false
             */
            between: function (date, start, end) {
                if (!date.getDate) {
                    date = core.date.parse(date);
                }
                if (!start.getDate) {
                    start = core.date.parse(start);
                }
                if (!end.getDate) {
                    end = core.date.parse(end);
                }
                return date.getTime() >= start.getTime() && date.getTime() <= end.getTime();
            },

            /**
             * ��¥ ��
             *
             * @function
             * @name coma.date.compare
             * @param {Date} date1 ��¥1
             * @param {Date} date2 ��¥2
             * @return {number} -1: date1�� ����, 0: ����, 1:date2�� ����
             * @example
             * var d1 = new Date(2014, 11, 23);
             * var d2 = new Date(2014, 09, 23);
             *
             * coma.date.compare(d1, d2); // -1
             * coma.date.compare(d1, d1); // 0
             * coma.date.compare(d2, d1); // 1
             */
            compare: compare,

            /**
             * ������� �����Ѱ�
             *
             * @param {Date|string} date1 ��¥1
             * @param {Date|string} date2 ��¥2
             * @return {boolean} �� ��¥�� ������� �������� ����
             * @example
             * coma.date.equalsYMD('2014-12-23 11:12:23', '2014-12-23 09:00:21'); // true
             */
            equalsYMD: function (a, b) {
                var ret = true;
                if (!a || !b) {
                    return false;
                }
                if (!a.getDate) {
                    a = this.parse(a);
                }
                if (!b.getDate) {
                    b = this.parse(b);
                }
                each(['getFullYear', 'getMonth', 'getDate'], function (fn) {
                    ret = ret && (a[fn]() === b[fn]());
                    if (!ret) {
                        return false;
                    }
                });
                return ret;
            },


            /**
             * �־��� ��¥�� �������� type��ŭ ������ ��¥�� format���·� ��ȯ(���� �̰� �� beforeDate�� ��� �����..;;;)
             * @param {Date} date ���س�¥
             * @param {string} type -2d, -3d, 4M, 2y ..
             * @param {string} format ����
             * @returns {Date|string} format�������� ���� ����� ��¥�� �Ǵ� ���ڿ��� ��ȯ�ؼ� ��ȯ
             * @example
             * coma.date.calcDate('2014-12-23', '-3m'); // 2014-09-23(Date)
             * coma.date.calcDate('2014-12-23', '-3m', 'yyyy/MM/dd'); // '2014/09/23'(string)
             *
             * coma.date.calcDate('2014-12-23', '-10d'); // 2014-12-13(Date)
             */
            calcDate: function (date, type, format) {
                date = this.parse(date);
                if (!date) {
                    return null;
                }

                var m = type.match(/([-+]*)([0-9]*)([a-z]+)/i),
                    g = m[1] === '-' ? -1 : 1,
                    d = (m[2] | 0) * g;

                switch (m[3]) {
                    case 'd':
                        date.setDate(date.getDate() + d);
                        break;
                    case 'w':
                        date.setDate(date.getDate() + (d * 7));
                        break;
                    case 'M':
                        date.setMonth(date.getMonth() + d);
                        break;
                    case 'y':
                        date.setFullYear(date.getFullYear() + d);
                        break;
                }
                if (format) {
                    return this.format(date, format);
                }
                return date;
            },

            calc: function () {
                return this.calcDate.apply(this, [].slice.call(arguments));
            },

            /**
             * �־��� ��¥ ������ ���ڿ��� Date��ü�� ��ȯ
             *
             * @function
             * @name coma.date.parse
             * @param {string} dateStringInRange ��¥ ������ ���ڿ�
             * @return {Date} �־��� ��¥���ڿ��� �Ľ��� ���� Date������ ��ȯ
             * @example
             * coma.date.parse('2014-11-12');
             * // Wed Nov 12 2014 00:00:00 GMT+0900 (���ѹα� ǥ�ؽ�)
             *
             * coma.date.parse('20141112');
             * // Wed Nov 12 2014 00:00:00 GMT+0900 (���ѹα� ǥ�ؽ�)
             */
            parse: (function () {
                var isoExp = /^\s*(\d{4})(\d{2})(\d{2})(\d{2})?(\d{2})?(\d{2})?\s*$/;
                return function (dateStringInRange) {
                    var date, month, parts;

                    if (dateStringInRange instanceof Date) {
                        return core.clone(dateStringInRange);
                    }

                    dateStringInRange = (dateStringInRange + '').replace(/[^\d]+/g, '');
                    if (dateStringInRange.length !== 8) {
                        return new Date(NaN);
                    }
                    date = new Date(dateStringInRange);
                    if (!isNaN(date)) {
                        return date;
                    }

                    date = new Date(NaN);
                    parts = isoExp.exec(dateStringInRange);

                    if (parts) {
                        month = +parts[2];
                        date.setFullYear(parts[1] | 0, month - 1, parts[3] | 0);
                        date.setHours(parts[4] | 0);
                        date.setMinutes(parts[5] | 0);
                        date.setSeconds(parts[6] | 0);
                        if (month != date.getMonth() + 1) {
                            date.setTime(NaN);
                        }
                        return date;
                    }
                    return date;
                };
            })(),

            /**
             * �� ��¥�� �� ����
             * @param {Date} d1 ��¥ 1
             * @param {Date} d2 ��¥ 2
             * @return {number} �γ�¥�� ����
             * coma.date.monthDiff('2011-02-12', '2014-11-23'); // 44
             */
            monthDiff: function (d1, d2) {
                d1 = this.parse(d1);
                d2 = this.parse(d2);

                var months;
                months = (d2.getFullYear() - d1.getFullYear()) * 12;
                months -= d1.getMonth() + 1;
                months += d2.getMonth();
                return months;
            },

            /**
             * �־��� ����� �ϼ��� ��ȯ
             *
             * @param {number} year �⵵
             * @param {number} month ��
             * @return {Date} �־��� ����� ������ ��¥
             * @example
             * coma.date.daysInMonth(2014, 2); // 28
             */
            daysInMonth: function (year, month) {
                var dd = new Date(year | 0, month | 0, 0);
                return dd.getDate();
            },

            /**
             * �и��ʸ� ��,��,�ʷ� ��ȯ
             * @param amount �и��ʰ�
             * @returns {Object} dates ��ȯ�� �ð� ��
             * @returns {number} dates.days �� ��
             * @returns {number} dates.hours �ð� ��
             * @returns {number} dates.mins �� ��
             * @returns {number} dates.secs �� ��
             * @example
             * coma.date.splits(2134000);
             * // {days: 0, hours: 0, mins: 35, secs: 34}
             */
            splits: function (amount) {
                var days, hours, mins, secs;

                amount = amount / 1000;
                days = Math.floor(amount / 86400), amount = amount % 86400;
                hours = Math.floor(amount / 3600), amount = amount % 3600;
                mins = Math.floor(amount / 60), amount = amount % 60;
                secs = Math.floor(amount);

                return {
                    days: days,
                    hours: hours,
                    mins: mins,
                    secs: secs
                };
            },

            /**
             * �־��� �� ��¥�� ������ ��, ��, �ʷ� ��ȯ
             *
             * @param {Date} t1 ���� �ð�
             * @param {Date} t2 ���� �ð�
             * @returns {Object} dates �ð��� ������ ����ִ� ��ü
             * @returns {number} dates.ms �и���
             * @returns {number} dates.secs ��
             * @returns {number} dates.mins ��
             * @returns {number} dates.hours ��
             * @returns {number} dates.days ��
             * @returns {number} dates.weeks ��
             * @returns {number} dates.diff
             *
             * @example
             * coma.date.diff(new Date, new Date(new Date() - 51811));
             * // {ms: 811, secs: 51, mins: 0, hours: 0, days: 0, weeks: 0, diff: 51811}
             */
            diff: function (t1, t2) {
                if (!core.is(t1, 'date')) {
                    t1 = new Date(t1);
                }

                if (!core.is(t2, 'date')) {
                    t2 = new Date(t2);
                }

                var diff = t1.getTime() - t2.getTime(),
                    ddiff = diff;

                diff = Math.abs(diff);

                var ms = diff % 1000;
                diff /= 1000;

                var s = Math.floor(diff % 60);
                diff /= 60;

                var m = Math.floor(diff % 60);
                diff /= 60;

                var h = Math.floor(diff % 24);
                diff /= 24;

                var d = Math.floor(diff);

                var w = Math.floor(diff / 7);

                return {
                    ms: ms,
                    secs: s,
                    mins: m,
                    hours: h,
                    days: d,
                    weeks: w,
                    diff: ddiff
                };
            },

            /**
             * �־��� ��¥�� ���° ���ΰ�
             * @function
             * @param {Date} date ��¥
             * @returns {number}
             * @example
             * coma.date.weekOfYear(new Date); // 2 // 2015-01-05�� �������� ���� ��
             */
            weekOfYear: (function () {
                var ms1d = 1000 * 60 * 60 * 24,
                    ms7d = 7 * ms1d;

                return function (date) {
                    var DC3 = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate() + 3) / ms1d,
                        AWN = Math.floor(DC3 / 7),
                        Wyr = new Date(AWN * ms7d).getUTCFullYear();

                    return AWN - Math.floor(Date.UTC(Wyr, 0, 7) / ms7d) + 1;
                };
            }()),

            /**
             * �����ΰ�
             * @param {number} y �⵵
             * @returns {boolean}
             * @example
             * coma.date.isLeapYear(2014); // false
             */
            isLeapYear: function (y) {
                if (toString.call(y) === '[object Date]') {
                    y = y.getUTCFullYear();
                }
                return (( y % 4 === 0 ) && ( y % 100 !== 0 )) || ( y % 400 === 0 );
            },

            /**
             * ��¥ �����Լ�
             * @param {Date} date ��¥
             * @param {string} interval ����Ÿ��(ms, s, m, h, d, M, y)
             * @param {number} value ���� ũ��
             * @returns {Date} ������ ��¥�� Date��ü
             * @example
             * // 2014-06-10���� y(�⵵)�� -4 �� ���� ���
             * var d = coma.date.add(new Date(2014, 5, 10), 'y', -4); // 2010-06-10
             */
            add: function (date, interval, value) {
                var d = new Date(date.getTime());
                if (!interval || value === 0) {
                    return d;
                }

                switch (interval) {
                    case "ms":
                        d.setMilliseconds(d.getMilliseconds() + value);
                        break;
                    case "s":
                        d.setSeconds(d.getSeconds() + value);
                        break;
                    case "m":
                        d.setMinutes(d.getMinutes() + value);
                        break;
                    case "h":
                        d.setHours(d.getHours() + value);
                        break;
                    case "d":
                        d.setDate(d.getDate() + value);
                        break;
                    case "M":
                        d.setMonth(d.getMonth() + value);
                        break;
                    case "y":
                        d.setFullYear(d.getFullYear() + value);
                        break;
                }
                return d;
            },

            /**
             * �ú��� normalizeȭ ó��
             * @param {number} h ��
             * @param {number} M ��
             * @param {number} s ��
             * @param {number} ms �и���
             * @returns {Object} dates �ð������� ��� ��ü
             * @returns {number} dates.day ��
             * @returns {number} dates.hour ��
             * @returns {number} dates.min ��
             * @returns {number} dates.sec ��
             * @returns {number} dates.ms �и���
             * @example
             * coma.date.normalize(0, 0, 120, 0) // {day:0, hour: 0, min: 2, sec: 0, ms: 0} // ��, 120�ʰ� 2������ ��ȯ
             */
            normalize: function (h, M, s, ms) {
                h = h || 0;
                M = M || 0;
                s = s || 0;
                ms = ms || 0;

                var d = 0;

                if (ms > 1000) {
                    s += Math.floor(ms / 1000);
                    ms = ms % 1000;
                }

                if (s > 60) {
                    M += Math.floor(s / 60);
                    s = s % 60;
                }

                if (M > 60) {
                    h += Math.floor(M / 60);
                    M = M % 60;
                }

                if (h > 24) {
                    d += Math.floor(h / 24);
                    h = h % 24;
                }

                return {
                    day: d,
                    hour: h,
                    min: M,
                    sec: s,
                    ms: ms
                }
            }
        };
    });
/////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     * @namespace
     * @name coma.uri
     */
    core.addon('uri', /** @lends coma.uri */{

        /**
         * �־��� url�� ������������ ����
         *
         * @param {string} url
         * @param {string:Object} string
         * @return {string}
         *
         * @example
         * coma.uri.addParam("board.do", {"a":1, "b": 2, "c": {"d": 4}}); // "board.do?a=1&b=2&c[d]=4"
         * coma.uri.addParam("board.do?id=123", {"a":1, "b": 2, "c": {"d": 4}}); // "board.do?id=123&a=1&b=2&c[d]=4"
         */
        addParam: function (url, string) {
            if (core.is(string, 'object')) {
                string = core.object.toQueryString(string);
            }
            if (!core.isEmpty(string)) {
                return url + (url.indexOf('?') === -1 ? '?' : '&') + string;
            }

            return url;
        },

        /**
         * ������Ʈ���� ��ü�� ��ȯ
         *
         * @param {string} query ������Ʈ�� ���ڿ�
         * @return {Object}
         *
         * @example
         * coma.uri.parseQuery("a=1&b=2"); // {"a": 1, "b": 2}
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
         * url�� �Ľ��Ͽ� host, port, protocol ���� ����
         *
         * @function
         * @param {string} str url ���ڿ�
         * @return {Object}
         *
         * @example
         * coma.uri.parseUrl("http://www.coma.com:8080/list.do?a=1&b=2#comment");
         * // {scheme: "http", host: "www.coma.com", port: "8080", path: "/list.do", query: "a=1&b=2"��}
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
                    str = window.location.protocol + str;
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
         * �־��� url���� �ؽ����ڿ� ����
         *
         * @param {string} url url ���ڿ�
         * @return {string} ��� ���ڿ�
         *
         * @example
         * coma.uri.removeHash("list.do#comment"); // "list.do"
         */
        removeHash: function (url) {
            return url ? url.replace(/#.*$/, '') : url;
        }
    });
/////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * css3���� ��ƿ�Լ����� ����ִ� ��ü�̴�.
     * @namespace
     * @name coma.css3
     */
    core.addon('css3', function () {

        var _tmpDiv = doc.createElement('div'),
            _prefixes = ['Webkit', 'Moz', 'O', 'ms', ''],
            _style = _tmpDiv.style,
            _noReg = /^([0-9]+)[px]+$/,
            _vendor = (function () {
                var vendors = ['t', 'webkitT', 'MozT', 'msT', 'OT'],
                    transform,
                    i = 0,
                    l = vendors.length;

                for (; i < l; i++) {
                    transform = vendors[i] + 'ransform';
                    if (transform in _style) return vendors[i].substr(0, vendors[i].length - 1);
                }

                return false;
            })(),
            string = core.string;

        function prefixStyle(name, isHyppen) {
            if (_vendor === false) return isHyppen ? name.toLowerCase() : name;
            if (_vendor === '') return isHyppen ? name.toLowerCase() : name;
            if (isHyppen) {
                return '-' + _vendor.toLowerCase() + '-' + name[0].toLowerCase() + string.dasherize(name.substr(1));
            }
            return _vendor + string.capitalize(name);
        }

        return /** @lends coma.css3 */{
            /**
             * css3 ��������
             * @var {boolean}
             * @example
             * if(coma.css3.support) {
             * // css3 ����
             * }
             */
            support: _vendor !== false,
            /**
             * 3d style ��������
             * @var {boolean}
             * @example
             * if(coma.css3.support3D) {
             * // 3d css3 ����
             * }
             */
            support3D: (function () {
                var body = doc.body,
                    docEl = doc.documentElement,
                    docOverflow;
                if (!body) {
                    body = doc.createElement('body');
                    body.fake = true;
                    body.style.background = '';
                    body.style.overflow = 'hidden';
                    body.style.padding = '0 0 0 0';
                    docEl.appendChild(body);
                }
                docOverflow = docEl.style.overflow;
                docEl.style.overflow = 'hidden';

                var parent = doc.createElement('div'),
                    div = doc.createElement('div'),
                    cssTranslate3dSupported;

                div.style.position = 'absolute';
                parent.appendChild(div);
                body.appendChild(parent);

                div.style[prefixStyle('transform')] = 'translate3d(20px, 0, 0)';
                cssTranslate3dSupported = ($(div).position().left - div.offsetLeft == 20);
                if (body.fake) {
                    body.parentNode.removeChild(body);
                    docEl.offsetHeight;
                } else {
                    parent.parentNode.removeChild(parent);
                }
                docEl.style.overflow = docOverflow;
                return cssTranslate3dSupported;
            })(),

            /**
             * ���� �������� css prefix�� (webkit or Moz or ms or O)
             * @var {string}
             * @example
             * $('div').css(coma.css.vender+'Transform', 'translate(10px 0)');
             */
            vendor: _vendor,
            /**
             * �־��� css�Ӽ��� �����ϴ��� üũ
             *
             * @param {string} cssName üũ�ϰ��� �ϴ� css��
             * @return {boolean} ��������
             * @example
             * if(coma.css3.has('transform')) { ...
             */
            has: function (name) {
                var a = _prefixes.length;
                if (name in _style) {
                    return true;
                }
                name = string.capitalize(name);
                while (a--) {
                    if (_prefixes[a] + name in _style) {
                        return true;
                    }
                }
                return false;
            },

            position: (function () {
                var support = _vendor !== false;
                var transform = prefixStyle('transform');
                return support ? function ($el) {
                    var matrix = window.getComputedStyle($el[0], null),
                        x, y;

                    matrix = matrix[transform].split(')')[0].split(', ');
                    x = +(matrix[12] || matrix[4] || 0);
                    y = +(matrix[13] || matrix[5] || 0);
                    return {x: x, y: y};
                } : function ($el) {
                    var matrix = $el[0].style, x, y;
                    x = +matrix.left.replace(/[^-\d.]/g, '');
                    y = +matrix.top.replace(/[^-\d.]/g, '');
                    return {x: x, y: y};
                };
            })(),

            transform: prefixStyle('transform'),
            transitionTimingFunction: prefixStyle('transitionTimingFunction'),
            transitionDuration: prefixStyle('transitionDuration'),
            transitionDelay: prefixStyle('transitionDelay'),
            transformOrigin: prefixStyle('transformOrigin'),
            transition: prefixStyle('transition'),
            transitionEnd: 'transitionend webkitTransitionEnd MSTransitionEnd',
            move: function ($el, x, y, dur, cb) {
                $el.css(this.transitionDuration, dur + 's');
                $el.css(this.transform, 'translate(' + (x | 0) + 'px, ' + (y | 0) + 'px) translateZ(0px)');
                if (!$el.data('bindedEnd') && cb) {
                    $el.data('bindedEnd', true).on(this.transitionEnd, function () {
                        cb.call($el[0]);
                    });
                }
            },

            /*move: function() {
             var transitionEnd = prefixStyle('TransitionEnd', true);
             return function ($el, opts) {
             opts || (opts = {});
             var left, top, pos;
             pos  = this.position($el);
             if (typeof opts.left === 'string' && /^[+-]=/.test(opts.left)) {
             left = pos.x + parseInt(opts.left.replace('=', ''), 10);
             } else {
             left = opts.left;
             }
             ('maxLeft' in opts) && (left = Math.min(opts.maxLeft, left));
             ('minLeft' in opts) && (left = Math.max(opts.minLeft, left));
             if (typeof opts.top === 'string' && /^[+-]=/.test(opts.top)) {
             top = pos.y + parseInt(opts.top.replace('=', ''), 10);
             } else {
             top = opts.top;
             }
             ('maxTop' in opts) && (top = Math.min(opts.maxTop, top));
             ('minTop' in opts) && (top = Math.max(opts.minTop, top));

             this.transition($el, opts.style||'all', opts.duration||0, opts.easeing||'ease-in-out');
             this.transform($el, left, top);
             if (!$el.data('bindedEnd') && opts.complete) {
             $el.data('bindedEnd', true).on(transitionEnd, function(){
             opts.complete.call($el[0]);
             });
             }
             return {
             offEnd: function() {
             $el.removeData('bindedEnd').off(transitionEnd);
             }
             };
             };
             }(),*/

            /**
             * �־��� css�� �տ� ���� �������� �ش��ϴ� ����prefix�� �ٿ��ش�.
             *
             * @function
             * @param {string} cssName css��
             * @return {string}
             * @example
             * coma.css3.prefix('transition'); // // webkitTransition
             */
            prefix: prefixStyle
        };
    });
/////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     * @namespace
     * @name coma.Cookie
     */
    core.addon('Cookie', /** @lends coma.Cookie */ {
        defaults: {
// domain: location.host,
            path: ''
        },

        /**
         * ��Ű�� ����
         *
         * @param {string} name ��Ű��
         * @param {string} value ��Ű��
         * @param {Object} [options]
         * @param {Date} [options.expires] ����ð�
         * @param {string} [options.path] ��Ű�� ��ȿ���
         * @param {string} [options.domain] ��Ű�� ��ȿ ������
         * @param {boolean} [options.secure] https������ ��Ű ������ �����ϵ��� �ϴ� �Ӽ�
         * @example
         * coma.Cookie.set('userid', 'coma');
         * // or
         * coma.Cookie.set({
         *              'userid': 'coma',
         *              'name': '���̳�'
         *              });
         */
        set: function (name, value, options) {
            if (!core.is(name, 'string')) {
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
         * ��Ű�� ����
         *
         * @param {string} name ��Ű��
         * @return  {string} ��Ű��
         * @example
         * coma.Cookie.get('userid'); // 'coma'
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
         * ��Ű ����
         *
         * @param {string} name ��Ű��
         * @example
         * core.Cookie.remove('userid');
         * // or
         * core.Cookie.remove(['userid', 'name']);
         */
        remove: function (name) {
            if (core.is(name, 'string')) {
                doc.cookie = name + "=;expires=Fri, 31 Dec 1987 23:59:59 GMT;";
            } else {
                core.each(name, function (val, key) {
                    this.remove(key);
                }.bind(this))
            }
        },

        /**
         * sep�� �����ڷ� �Ͽ� ���ڿ��� �����Ͽ� ��Ű�� ����
         * @param {string} name ��Ű��
         * @param {string} val ��
         * @param {string} sep ������
         * @example
         * coma.Cookie.setItem('arr', 'a');
         * coma.Cookie.setItem('arr', 'b');  // arr:a|b
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

        /**
         * name�� ���õǾ� �ִ� ���չ��ڿ����� val�� ����
         * @param {string} name ��Ű��
         * @param {string} val ��
         * @param {string} sep
         * @example
         * coma.Cookie.setItem('arr', 'a');
         * coma.Cookie.setItem('arr', 'b');  // arr='a|b'
         * coma.Cookie.removeItem('arr', 'b'); // arr='a'
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
/////////////////////////////////////////////////////////////////////////////////////////////////


    core.addon(/** @lends coma */ {
        /**
         * ���� �������� ȣ��Ʈ�ּҸ� ��ȯ
         * @returns {string}
         * @example
         * alert(coma.getHost());
         */
        getHost: function () {
            var loc = doc.location;
            return loc.protocol + '//' + loc.host;
        },
        /**
         * ���� url ��ȯ(������Ʈ��, # ����)
         * @returns {string}
         */
        getPageUrl: function () {
            var loc = doc.location;
            return loc.protocol + '//' + loc.host + loc.pathname;
        },


        /**
         * �������� Detect ����: �ǵ����̸� Modernizr ���̺귯���� ����� ���� ����
         *
         * @example
         * coma.browser.isTouch // ��ġ����̽� ����
         * coma.browser.isRetina // ��Ƽ�� ����
         * coma.browser.isMobile // orientation �۵����η� �Ǵ�
         * coma.browser.isMac // ��OS
         * coma.browser.isLinux // ������
         * coma.browser.isWin // ��������
         * coma.browser.is64Bit // 64��Ʈ �÷���
         *
         * coma.browser.isIE // IE
         * coma.browser.ieVersion // IE�� ����
         * coma.browser.isOpera // �����
         * coma.browser.isChrome // ũ��
         * coma.browser.isSafari // ���ĸ�
         * coma.browser.isWebKit // ��Ŷ
         * coma.browser.isGecko // ���̾�����
         * coma.browser.isIETri4 // IE����
         * coma.browser.isAir // ��� ����
         * coma.browser.isIOS // ������, �����е�
         * coma.browser.isAndroid // �ȵ���̵�
         * coma.browser.iosVersion // ios ���� : [8, 1, 0] -> [major, minor, revision]
         * coma.browser.androidVersion // android ���� : [4, 1, 0] -> [major, minor, revision]
         * @example
         * if(coma.browser.isIE && coma.browser.isVersion < 9) {
         *     alert('�������� ����ϰ� �ֽ��ϴ�.');
         * }
         */
        browser: (function () {
// �� �����ϰ� �ʹ�..
            var detect = {},
                win = context,
                na = win.navigator,
                ua = na.userAgent,
                lua = ua.toLowerCase(),
                match;

            detect.placeholder = ('placeholder' in tmpInput);
            detect.isStrict = (typeof context == 'undefined');

            detect.isMobile = isMobile;
            detect.isRetina = 'devicePixelRatio' in window && window.devicePixelRatio > 1;
            detect.isAndroid = lua.indexOf('android') !== -1;
            detect.isOpera = !!(win.opera && win.opera.buildNumber);
            detect.isWebKit = /WebKit/.test(ua);
            detect.isTouch = !!('ontouchstart' in window);

            match = /(msie) ([\w.]+)/.exec(lua) || /(trident)(?:.*rv.?([\w.]+))?/.exec(lua) || ['', null, -1];
            detect.isIE = !detect.isWebKit && !detect.isOpera && match[1] !== null;
            detect.version = detect.ieVersion = parseInt(match[2], 10);
            detect.isOldIE = detect.isIE && detect.version < 9;

            detect.isWin = (na.appVersion.indexOf("Win") != -1);
            detect.isMac = (ua.indexOf('Mac') !== -1);
            detect.isLinux = (na.appVersion.indexOf("Linux") != -1);
            detect.is64Bit = (lua.indexOf('wow64') > -1 || (na.platform === 'Win64' && lua.indexOf('x64') > -1));

            detect.isChrome = (ua.indexOf('Chrome') !== -1);
            detect.isGecko = (ua.indexOf('Firefox') !== -1);
            detect.isAir = ((/adobeair/i).test(ua));
            detect.isIOS = /(iPad|iPhone)/.test(ua);
            detect.isSafari = !detect.isChrome && (/Safari/).test(ua);
            detect.isIETri4 = (detect.isIE && ua.indexOf('Trident/4.0') !== -1);

            detect.msPointer = !!(na.msPointerEnabled && na.msMaxTouchPoints && !win.PointerEvent);
            detect.pointer = !!((win.PointerEvent && na.pointerEnabled && na.maxTouchPoints) || detect.msPointer);

            if (detect.isAndroid) {
                detect.androidVersion = function () {
                    var v = ua.match(/[a|A]ndroid[^\d]*(\d+).?(\d+)?.?(\d+)?/);
                    if (!v) {
                        return -1;
                    }
                    return [parseInt(v[1] | 0, 10), parseInt(v[2] | 0, 10), parseInt(v[3] | 0, 10)];
                }();
            } else if (detect.isIOS) {
                detect.iosVersion = function () {
                    var v = ua.match(/OS (\d+)_?(\d+)?_?(\d+)?/);
                    return [parseInt(v[1] | 0, 10), parseInt(v[2] | 0, 10), parseInt(v[3] | 0, 10)];
                }();
            }

            return detect;
        }()),


        /**
         * �־��� �ð����� ȣ���� �Ǹ� ���õǰ�, �ʰ����� ���� ��μ� fn�� ��������ִ� �Լ�
         * @param {Function} fn �ݹ��Լ�
         * @param {number} time �����̽ð�
         * @param {*} scope ���ؽ�Ʈ
         * @returns {Function}
         * @example
         * // ������¡ ���� ���� #box�� ũ�⸦ �������� �ʴٰ�,
         * // ������¡�� ������ 0.5�ʰ� ���� �Ŀ� #box����� �����ϰ��� �� ��쿡 ���.
         * $(window).on('resize', coma.delayRun(function(){
 *
$('#box').css('width', $(window).width());
 *  }, 500));
         */
        delayRun: function (fn, time, scope) {
            time || (time = 250);
            var timeout = null;
            return function () {
                if (timeout) {
                    clearTimeout(timeout);
                }
                var args = arguments,
                    me = this;
                timeout = setTimeout(function () {
                    fn.apply(scope || me, args);
                    timeout = null;
                }, time);
            };
        },

        /**
         * �־��� ���� �迭�� ��ȯ
         *
         * @param {*} value �迭�� ��ȯ�ϰ��� �ϴ� ��
         * @return {Array}
         *
         * @example
         * coma.toArray('abcd"); // ["a", "b", "c", "d"]
         * coma.toArray(arguments);  // arguments�� ��ü�� array�� ��ȯ�Ͽ� Array���� �����ϴ� ��ƿ�Լ�(slice, reverse ...)�� ���� �ִ�.
         */
        toArray: function (value) {
            try {
                return arraySlice.apply(value, arraySlice.call(arguments, 1));
            } catch (e) {
            }

            var ret = [];
            try {
                for (var i = 0, len = value.length; i < len; i++) {
                    ret.push(value[i]);
                }
            } catch (e) {
            }
            return ret;
        },

        /**
         * 15���� ����, ���ڷ� �̷���� ����ũ�� �� ����
         *
         * @return {string}
         */
        getUniqId: function (len) {
            len = len || 32;
            var rdmString = "";
            for (; rdmString.length < len; rdmString += Math.random().toString(36).substr(2));
            return rdmString.substr(0, len);
        },

        /**
         * �������� ����ũ�� �� �����ؼ� ��ȯ
         * @function
         * @return {number}
         */
        nextSeq: (function () {
            var seq = 0;
            return function (prefix) {
                return (prefix || '') + (seq += 1);
            };
        }()),

        /**
         * ���ø� ����
         *
         * @param {string} text ���ø� ���ڿ�
         * @param {Object} data ���ø� ���ڿ����� ��ȯ�� ����Ÿ
         * @param {Object} settings �ɼ�
         * @return {Function} tempalte �Լ�
         *
         * @example
         * var tmpl = coma.template('&lt;span>&lt;$=name$>&lt;/span>');
         * var html = tmpl({name: 'Axl rose'}); // &lt;span>Axl rose&lt;/span>
         * $('div').html(html);
         */
        template: function (str, data) {
            var src = 'var __src = [], each=' + LIB_NAME + '.each, escapeHTML=' + LIB_NAME + '.string.escapeHTML; with(value||{}) { __src.push("';
            str = $.trim(str);
            src += str
                .replace(/\r|\n|\t/g, " ")
                .replace(/\{\{(.*?)\}\}/g, function (a, b) {
                    return '{{' + b.replace(/"/g, '\t') + '}}';
                })
                .replace(/"/g, '\\"')
                .replace(/\{\{each ([a-z]+) in ([a-zA-Z0-9\.]+)\}\}(.+)\{\{\/each\}\}/g, function (str, item, items, conts) {
                    return '{{each(value.' + items + ', function(item){ }}' + conts + ' {{ }); }}';
                })
                .replace(/\{\{(.*?)\}\}/g, function (a, b) {
                    return '{{' + b.replace(/\t/g, '"') + '}}';
                })

                .replace(/\{\{=(.+?)\}\}/g, '", $1, "')
                .replace(/\{\{-(.+?)\}\}/g, '", escapeHTML($1), "')
                .replace(/(\{\{|\}\})/g, function (a, b) {
                    return b === '{{' ? '");' : '__src.push("'
                });

//src+='"); };  console.log(__src);return __src.join("");';
            src += '"); }; return __src.join("");';
            var f = new Function('value', 'data', src);
            if (data) {
                return f(data);
            }
            return f;
        }
    });


    (function () {
// benchmark: https://github.com/malko/l.js/blob/master/l.js

        var isA = function (a, b) {
                return a instanceof (b || Array);
            },
            doc = document,
            aliases = {},
            bd = doc.getElementsByTagName("body")[0] || doc.documentElement,
            appendElmt = function (type, attrs, cb) {
                var e = doc.createElement(type), i;
                if (cb && isA(cb, Function)) {
                    if (e.readyState) {
                        e.onreadystatechange = function () {
                            if (e.readyState === "loaded" || e.readyState === "complete") {
                                e.onreadystatechange = null;
                                cb();
                            }
                        };
                    } else {
                        e.onload = cb;
                    }
                }
                for (i in attrs) {
                    attrs[i] && (e[i] = attrs[i]);
                }
                bd.appendChild(e);
            },
            load = function (url, cb) {
                if (isA(url)) {
                    for (var i = 0; i < url.length; i++) {
                        loader.load(url[i]);
                    }
                    cb && url.push(cb);
                    return loader.load.apply(loader, url);
                }
                if (url.match(/\.css\b/)) {
                    return loader.loadcss(url, cb);
                }
                return loader.loadjs(url, cb);
            },
            loaded = {},
            loader = {
                urlParse: function (url, t) {
                    var parts = {}, u; // u => url, i => id, f = fallback
                    u = url.replace(/\?.*$/g, function (m, a) {
                        a && (parts.ver = a);
                        return '';
                    });
                    aliases[u] && (u = aliases[u]);
                    var ver = parts.ver || core[t === 'js' ? 'importJs' : 'importCss'].ver;
                    if (u.substr(0, 1) !== '/') {
                        u = core.importJs.baseUrl + u;
                    }
                    parts.u = u;
                    parts.full = u + (ver ? '?' + ver : '');
                    return parts;
                },
                loadjs: function (url, cb) {
                    var parts = loader.urlParse(url, 'js');
                    url = parts.u;
                    if (loaded[url] === true) {
                        cb && cb();
                        return loader;
                    } else if (loaded[url] !== undefined) {
                        if (cb) {
                            loaded[url] = (function (ocb, cb) {
                                return function () {
                                    ocb && ocb();
                                    cb && cb();
                                };
                            })(loaded[url], cb);
                        }
                        return loader;
                    }
                    loaded[url] = (function (cb) {
                        return function () {
                            loaded[url] = true;
                            cb && cb();
                        };
                    })(cb);
                    cb = function () {
                        loaded[url]();
                    };
                    appendElmt('script', {
                        type: 'text/javascript',
                        src: parts.full
                    }, cb);
                    return loader;
                },
                loadcss: function (url, cb) {
                    var parts = loader.urlParse(url, 'css');
                    url = parts.u;
                    loaded[url] || appendElmt('link', {
                        type: 'text/css',
                        rel: 'stylesheet',
                        href: parts.full
                    });
                    loaded[url] = true;
                    cb && cb();
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

// ���� �۾��Ѱ� : comahead
        var i, l, scripts, links, url;
        scripts = doc.getElementsByTagName("script");
        for (i = 0, l = scripts.length; i < l; i++) {
            (url = scripts[i].getAttribute('src')) && (loaded[url.replace(/\?.*$/, '')] = true);
        }
        links = doc.getElementsByTagName('link');
        for (i = 0, l = links.length; i < l; i++) {
            (links[i].rel === 'stylesheet' || links[i].type === 'text/css') && (loaded[links[i].getAttribute('href').replace(/\?.*$/, '')] = true);
        }
        var suffix = function (list, ext) {
            if (!core.is(list, 'array')) {
                list = [list];
            }
            core.each(list, function (val, i) {
                if (val.indexOf('.' + ext) < 0) {
                    list[i] += '.' + ext;
                }
            });
            return list;
        };
        var importResource = function (type) {
            return function (jss, cb) {
                var defer = $.Deferred();
                jss = suffix(jss, type);
                loader.load(jss, function () {
                    defer.resolve();
                    cb && cb();
                });
                return defer.promise();
            };
        };
        core.importJs = importResource('js');
        core.importCss = importResource('css');
        core.importJs.addAliases = core.importCss.addAliases = function (a) {
            for (var i in a) {
                aliases[i] = isA(a[i]) ? a[i].slice(0) : a[i];
            }
        };
        core.importJs.baseUrl = core.importCss.baseUrl = '';
        core.importJs.ver = core.importCss.ver = '';
////////////////////////////////////////////////////
    })();

    /**
     * ��ƮŬ�����μ�, coma.Base�� coma.Class�� �̿��ؼ� Ŭ������ ������ ��� coma.Base�� ��ӹް� �ȴ�.
     * @class
     * @name coma.Base
     * @example
     * var Person = coma.Base.extend({  // �Ǵ� var Person = coma.Class({ ���� �����ص� �����ϴ�.
*
$singleton: true, // �̱��� ����
*
$statics: { // Ŭ���� �Ӽ� �� �Լ�
*
live: function() {} // Person.live(); ���� ȣ��
*
},
*
$mixins: [Animal, Robot], // Ư�� Ŭ�������� �޼ҵ���� ���������� �� �� �ش� Ŭ������ ����(�������ε� ����),
*
initialize: function(name) {
*
this.name = name;
*
},
*
say: function(job) {
*
alert("I'm Person: " + job);
*
},
*
run: function() {
*
alert("i'm running...");
*
}
*`});
     *
 * // Person���� ��ӹ޾� ManŬ������ �����ϴ� ���
     * var Man = Person.extend({
*
initialize: function(name, age) {
*
this.supr(name);  // Person(�θ�Ŭ����)�� initialize�޼ҵ带 ȣ�� or this.suprMethod('initialize', name);
*
this.age = age;
*
},
*
// say�� �������̵���
*
say: function(job) {
*
this.suprMethod('say', 'programer'); // �θ�Ŭ������ say �޼ҵ� ȣ�� - ù��°���ڴ� �޼ҵ��, �ι�°���ʹ� �ش� �޼ҵ�� ���޵� ����

*
alert("I'm Man: "+ job);
*
}
* });
     * var man = new Man('kim', 20);
     * man.say('freeman');  // ���: alert("I'm Person: programer"); alert("I'm Man: freeman");
     * man.run(); // ���: alert("i'm running...");
     */
    (function () {
        var F = function () {
            },
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

// �θ�Ŭ������ �Լ��� ������ �� �ֵ��� .supr �Ӽ��� �θ��Լ��� �����Ͽ� ����
        function wrap(k, fn, supr) {
            return function () {
                var tmp = this.supr, ret;

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

// �Ӽ� �߿� �θ�Ŭ������ �Ȱ��� �̸��� �Լ��� ���� ��� ����ó��
        function inherits(what, o, supr) {
            each(o, function (v, k) {
                what[k] = isFunction(v) && isFunction(supr.prototype[k]) ? wrap(k, v, supr) : v;
            });
        }

        function classExtend(attr, c) {
            var supr = c ? (attr.$extend || Object) : this,
                statics, mixins, singleton, instance, hooks;

            if (core.is(attr, 'function')) {
                attr = attr();
            }

            singleton = attr.$singleton || false;
            statics = attr.$statics || false;
            mixins = attr.$mixins || false;
            hooks = attr.$hooks || false;

            !attr.initialize && (attr.initialize = supr.prototype.initialize || function () {
                });

            function ctor() {
                if (singleton && instance) {
                    return instance;
                } else {
                    instance = this;
                }
////////////////////////////////////////////
                var args = arraySlice.call(arguments),
                    me = this,
                    ctr = me.constructor;

                if (ctr.hooks && ctr.hooks.init && ctr.hooks.init.length) {
                    each(ctr.hooks.init, function (fn) {
                        fn.call(me);
                    });
                    delete ctr.hooks.init;
                }
                ctr.hooks && each(ctr.hooks.create, function (fn) {
                    fn.call(me);
                });
//////////////////////////////////////////////

                if (me.initialize) {
                    me.initialize.apply(this, args);
                } else {
                    supr.prototype.initialize && supr.prototype.initialize.apply(me, args);
                }
            }

            function Class() {
                if (!(this instanceof Class)) {
                    return Class;
                }
                ctor.apply(this, arguments);
            }

            F.prototype = supr.prototype;
            Class.prototype = new F;
            Class.prototype.constructor = Class;
            Class.superclass = supr.prototype;
            /**
             * �ش� Ŭ�������� ��ӵ� ���ο� �ڽ�Ŭ������ �������ִ� �Լ�
             * @function
             * @name coma.Base.extend
             * @param {Object} memthods �޼ҵ����
             * @return {coma.Base} ���ο� Ŭ����
             * @example
             * var Child = coma.Base.extend({
             *     show: function(){
             *         alert('hello');
             *     }
             * });
             *
             * new Child().show();
             */
            Class.extend = classExtend;
            /**
             * �ش� Ŭ������ ��ü�� ������ �� hook�� ����ϴ� Ŭ�����Լ�
             * @function
             * @name coma.Base.hooks
             * @param {string} name �� �̸�('init' �� ó���� �ѹ��� ����, 'create' �� ��ü�� ������ ������ ����)
             * @param {function} func ������ �� �Լ�
             * @example
             * var Child = coma.Base.extend({
             *     show: function(){
             *         alert('hello');
             *     }
             * });
             * Child.hooks('init', function(){
             *     alert('�ʱ�ȭ');
             * });
             * Child.hooks('create', function(){
             *     alert('��ü����');
             * });
             *
             * new Child(); // alert('�ʱ�ȭ'); alert('��ü����');
             * new Child(); // alert('��ü����');
             */
            Class.hooks = function (name, func) {
                if (name != 'init' && name != 'create') {
                    return;
                }
                Class.hooks[name].push(func);
            };
            extend(true, Class.hooks, {
                create: [],
                init: []
            }, supr.hooks);
            hooks && each(hooks, function (fn, name) {
                Class.hooks(name, fn);
            });


            if (singleton) {
                /**
                 * ��Ŭ�� Ŭ������ ��ü�� ��ȯ
                 * @function
                 * @name coma.Base.getInstance
                 * @return {coma.Base}
                 * @example
                 * var Child = coma.Base.extend({
                 *    $singleton: true,
                 *    show: function(){
                 *        alert('hello');
                 *    }
                 * });
                 * Child.getInstance().show();
                 * Child.getInstance().show();
                 */
                Class.getInstance = function () {
                    var arg = arguments,
                        len = arg.length;
                    if (!instance) {
                        switch (true) {
                            case !len:
                                instance = new Class;
                                break;
                            case len === 1:
                                instance = new Class(arg[0]);
                                break;
                            case len === 2:
                                instance = new Class(arg[0], arg[1]);
                                break;
                            default:
                                instance = new Class(arg[0], arg[1], arg[2]);
                                break;
                        }
                    }
                    return instance;
                };
            }

            /**
             * �޼ҵ峻�ο��� �θ�Ŭ������ �Լ��� ȣ���ϰ��� �� �� ���
             * @function
             * @name coma.Base#suprMethod
             * @return {*} �ش� �θ��Լ��� ��ȯ��
             * @example
             * var Parent = coma.Base.extend({
             *     show: function(){
             *         alert('parent.show');
             *     }
             * });
             * var Child = Parent.extend({
             *     // override
             *     show: function(){
             *         this.supr(); // Parent#show()�� ȣ���
             *         alert('child.show');
             *     },
             *     display: function(){
             *         this.suprMethod('show'); // Ư�� �θ��Լ��� ����ؼ� ȣ���� �� �� ����
             *     }
             * });
             * var child = new Child();
             * child.show(); // alert('parent.show'); alert('child.show');
             * child.display(); // alert('parent.show');
             */
            Class.prototype.suprMethod = function (name) {
                var args = arraySlice.call(arguments, 1);
                return supr.prototype[name].apply(this, args);
            };

            Class.mixins = function (o) {
                if (!o.push) {
                    o = [o];
                }
                var proto = this.prototype;
                each(o, function (mixObj, i) {
                    if (!mixObj) {
                        return;
                    }
                    each(mixObj, function (fn, key) {
                        if (key === 'build' && Class.hooks) {
                            Class.hooks.init.push(fn)
                        } else {
                            proto[key] = fn;
                        }
                    });
                });
            };
            mixins && Class.mixins.call(Class, mixins);

            /**
             * �̹� �����ϴ� Ŭ������ �޼ҵ� �߰�
             * @function
             * @name coma.Base.members
             * @param {Object} methods �޼ҵ� ���� ��ü
             * @example
             * var Parent = coma.Base.extend({});
             * Parent.members({
             *     show: function(){
             *         alert('hello');
             *     }
             * });
             * new Parent().show();
             */
            Class.members = function (o) {
                inherits(this.prototype, o, supr);
            };
            attr && Class.members.call(Class, attr);

            /**
             * �̹� �����ϴ� Ŭ������ �����޼ҵ� �߰�
             * @function
             * @name coma.Base.members
             * @param {Object} methods �޼ҵ� ���� ��ü
             * @example
             * var Parent = coma.Base.extend({});
             * Parent.statics({
             *     show: function(){
             *         alert('hello');
             *     }
             * });
             * Parent.show();
             */
            Class.statics = function (o) {
                o = o || {};
                for (var k in o) {
                    if (array_indexOf(ignoreNames, k) < 0) {
                        this[k] = o[k];
                    }
                }
                return Class;
            };
            Class.statics.call(Class, supr);
            statics && Class.statics.call(Class, statics);

            return Class;
        }

        var Base = function () {
        };
        Base.prototype.initialize = function () { /*throw new Error("Base Ŭ������ ��ü�� ���� �� �� �����ϴ�");*/
        };
        Base.prototype.release = function () {
        };
        Base.prototype.proxy = function (fn) {
            var me = this;
            if (typeof fn === 'string') {
                fn = me[fn];
            }
            return function () {
                return fn.apply(me, arguments);
            };
        }
        Base.extend = classExtend;

        /**
         * Ŭ������ �������ִ� �Լ�(coma.Base.extend ��Ī)
         * @param {Object} attr �޼ҵ� ���� ��ü
         * @returns {coma.Base} ���ο� ��ü
         * @example
         * var Parent = coma.Class({
         *     show: function(){
         *         alert('parent.show');
         *     }
         * });
         * var Child = coma.Class({
         *     $extend: Parent, // �θ�Ŭ����
         *     run: function(){
         *          alert('child.run');
         *     }
         * });
         * new Child().show();
         * new Child().run();
         */
        core.Class = function (attr) {
            return classExtend.apply(this, [attr, true]);
        };
        return core.Base = Base;
    })();

    core.addon('Env', /** @lends coma.Env */{
        configs: {},

        /**
         * �������� �������� �Լ�
         *
         * @param {string} name ������. `.`�� ���а����� �ܰ躰�� ���� ������ �� �ִ�.
         * @param {*} [def] ������ ���� ���� ��� ����� �⺻��
         * @return {*} ������
         * @example
         * coma.Env.get('siteTitle'); // '���̳�'
         */
        get: function (name, def) {
            var root = this.configs,
                names = name.split('.'),
                pair = root;

            for (var i = 0, len = names.length; i < len; i++) {
                if (!(pair = pair[names[i]])) {
                    return def;
                }
            }
            return pair;
        },

        /**
         * �������� �����ϴ� �Լ�
         *
         * @param {string} name ������. `.`�� ���а����� �ܰ踦 �������� ������ �� �ִ�.
         * @param {*} value ������
         * @return {*} ������
         * @example
         * coma.Env.set('siteTitle', '���̳�');
         */
        set: function (name, value) {
            var root = this.configs,
                names = name.split('.'),
                len = names.length,
                last = len - 1,
                pair = root;

            for (var i = 0; i < last; i++) {
                pair = pair[names[i]] || (pair[names[i]] = {});
            }
            return (pair[names[last]] = value);
        }
    });


    core.addon('Listener', function () {
        /**
         * �̺�Ʈ �����ʷμ�, �Ϲ� ��ü�� �̺�Ʈ ����� ���̰��� �Ұ�쿡 ���
         * @class
         * @name coma.Listener
         * @example
         * var obj = {};
         * coma.Listener.build(obj);
         * obj.on('clickitem', function(){
         *   alert(0);
 * });
         * obj.trigger('clickitem');
         */
        var Listener = /** @lends coma.Listener# */ {
            /**
             * obj�� �̺�Ʈ ��� �����ϱ�
             * @param {Object} obj �̺�Ʈ�� �����ϰ��� �ϴ� ��ü
             */
            build: function (obj) {
                coma.extend(obj, coma.Listener).init();
            },
            /**
             * UI����� �ۼ��� �� ���������� ȣ��Ǵ� �ʱ�ȭ �Լ�
             */
            init: function () {
                this._listeners = $(this);
            },

            /**
             * �̺�Ʈ �ڵ鷯 ���
             * @param {string} name �̺�Ʈ��
             * @param {string} [selector] Ÿ��
             * @param {eventCallback} [cb] �ڵ鷯
             */
            on: function () {
                var lsn = this._listeners;
                lsn.on.apply(lsn, arguments);
                return this;
            },

            /**
             * �ѹ��� ������ �̺�Ʈ �ڵ鷯 ���
             * @param {string} name �̺�Ʈ��
             * @param {string} [selector] Ÿ��
             * @param {eventCallback} [cb] �ڵ鷯
             */
            once: function () {
                var lsn = this._listeners;
                lsn.once.apply(lsn, arguments);
                return this;
            },

            /**
             * �̺�Ʈ �ڵ鷯 ����
             * @param {string} name ������ �̺�Ʈ��
             * @param {Function} [cb] ������ �ڵ鷯. �� ���ڰ� ���� ��� name�� ��ϵ� ��� �ڵ鷯�� ����.
             */
            off: function () {
                var lsn = this._listeners;
                lsn.off.apply(lsn, arguments);
                return this;
            },

            /**
             * �̺�Ʈ �߻�
             * @param {string} name �߻���ų �̺�Ʈ��
             * @param {*} [data] ����Ÿ
             */
            trigger: function () {
                var lsn = this._listeners;
                lsn.trigger.apply(lsn, arguments);
                return this;
            }
        };

        return Listener;
    });

    /**
     * @namespace
     * @name coma.PubSub
     * @description ����/���� ��ü: ���º�ȭ�� �����ϴ� ������(�ڵ鷯)�� ����Ͽ�, ���º�ȭ�� ���� ������ �������� ����(����)
     * �ϵ��� �ϴ� ��ü�̴�..
     * @example
     * // ������ ���
     * coma.PubSub.on('customevent', function() {
 *
 alert('�ȳ��ϼ���');
 * });
     *
     * // ��ϵ� ������ ����
     * coma.PubSub.trigger('customevent');
     */
    core.addon('PubSub', function () {

        var PubSub = $(window);

        var tmp = /** @lends coma.PubSub */{
            /**
             * �̺�Ʈ ���ε�
             * @function
             * @param {string} name �̺�Ʈ��
             * @param {eventCallback} handler �ڵ鷯
             * @return {coma.PubSub}
             */
            on: function (name, handler) {
                return this;
            },

            /**
             * �̺�Ʈ ����ε�
             * @param {string} name �̺�Ʈ��
             * @param {Function} [handler] �ڵ鷯
             * @return {coma.PubSub}
             */
            off: function (name, handler) {
                return this;
            },

            /**
             * �̺�Ʈ Ʈ����
             * @param {string} name �̺�Ʈ��
             * @param {Object} [data] �ڵ鷯
             * @return {coma.PubSub}
             */
            trigger: function (name, data) {
                return this;
            }
        };


        return PubSub;
    });

})(jQuery);

/*!
 * @author coma.ui.js
 * @email comahead@vi-nyl.com
 * @create 2014-12-02
 * @license MIT License
 */
(function ($, core) {
    "use strict";
    if (core._initViewClass) {
        return;
    }
    core._initViewClass = true;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    var arraySlice = Array.prototype.slice;
// coma.ui.View
    var ui = core.ui = function (name, supr, attr) {
        if (core.ui[name]) {
            return core.ui[name];
        }

        var bindName, Klass;

        if (!attr) {
            attr = supr;
            supr = null;
        }
        if (typeof supr === 'string') {
            supr = ui[supr];
        } else if (attr.$extend) {
            supr = attr.$extend
        } else if (supr && supr.superclass) {
// supr = supr;
        } else {
            supr = ui.View;
        }

        if (core.is(attr, 'function')) {
            if (!core.is(attr = attr(supr), 'function')) {
                bindName = attr.bindjQuery;
                Klass = supr.extend(attr);
            } else {
                Klass = attr;
            }
        } else {
            bindName = attr.bindjQuery;
            Klass = supr.extend(attr);
        }

        Klass.prototype.name = name;
//core.addon('ui.' + name, Klass);
        ui[name] = Klass;
        if (bindName) {
            ui.bindjQuery(Klass, bindName, 'sc');
        }
        return Klass;
    };

// obj�� ��ü�� �ƴ� �Լ����� �� �Լ��� ������ ���� ��ȯ
    var execObject = function (obj, ctx) {
        return core.is(obj, 'function') ? obj.call(ctx) : obj;
    };

//
    function eventHandling(inst, type, isNorm, args) {
        isNorm && (args[0] = inst._normalizeEventNamespace(args[0]));
        inst.$el[type].apply(inst.$el, args);

        return inst;
    }

// ������ ������Ʈ�� ����� ����� �޸𸮿��� ����
    ui.uiGarbageClear = function () {
        if (!ui.View) {
            return;
        }
        for (var i = ui.View._instances.length - 1, view; i >= 0; i--) {
            view = ui.View._instances[i];
            if (view.$el && !$.contains(document, view.$el[0])) {
                try {
                    view.release();
                    view = null;
                } catch (e) {
                }
            }
        }
    };

    /**
     * ��� UI��� Ŭ������ �ֻ��� Ŭ�����ν�, UIŬ������ �ۼ��Կ� �־ ���� ����� �������ش�.
     * @class
     * @name coma.ui.View
     */
    var View = ui.View = core.Base.extend(/** @lends coma.ui.View# */{
        $statics: {
            _instances: [] // ��� �ν��Ͻ��� ���� �ִ´�..
        },
        /**
         * ������
         * @param {string|Element|jQuery} el �ش� ������Ʈ(���, id, jQuery � �����̵� �������)
         * @param {Object} options �ɼǰ�
         * @return {Object|boolean} false �� ��ȯ�Ǹ�, �̹� �ش� ������Ʈ�� �ش� ����� ����Ǿ� �ְų� disabled �������� �ǹ��Ѵ�.
         */
        initialize: function (el, options) {
            options || (options = {});

            var me = this,
                moduleName;

            if (!el) {
                throw new Error('[ui.View] el��ü�� �����ϴ�.');
            }

            if (!me.name) {
                throw new Error('[ui.View] Ŭ������ �̸��� �����ϴ�');
            }

            moduleName = me.moduleName = core.string.toFirstLower(me.name);
            me.$el = el instanceof jQuery ? el : $(el);

            if (!$.contains(document, me.$el[0])) {
                return false;
            }

// ������ ������ ��ų ���ΰ� ///////////////////////////////////////////////////////////////
            if (options.rebuild === true) {
                try {
                    me.$el.data('ui_' + moduleName).release();
                } catch (e) {
                }
                me.$el.removeData('ui_' + moduleName);
            } else {
                if (me.$el.data('ui_' + moduleName)) {    // �̹� ����ȰŸ� false ��ȯ - �ߺ� ���� ����
                    return false;
                }
                me.$el.data('ui_' + moduleName, this);
            }

// TODO
            View._instances.push(me);
            me.el = me.$el[0]; // ���� ������Ʈ�� ������ ����
            me.options = $.extend(true, {}, me.constructor.superclass.defaults, me.defaults, me.$el.data(), options); // �ɼ� ����
            me.cid = moduleName + '_' + core.nextSeq(); // ��ü ���� Ű
            me.ui = {};
            me.eventNamespace = '.' + me.cid;

            me.updateSelectors();
            me._bindOptionEvents();
        },

        /**
         * �ɼ����� �Ѿ�� �̺�Ʈ���� ���ε���
         * @private
         */
        _bindOptionEvents: function () {
            var me = this,
                eventPattern = /^([a-z]+) ?([^$]*)$/i;

// events �Ӽ� ó��
// events: {
//
//            'click ul>li.item': 'onItemClick', //=> this.$el.on('click', 'ul>li.item', this.onItemClick); ���� ��ȯ
// }
            me.options.events = core.extend({},
                execObject(me.events, me),
                execObject(me.options.events, me));
            core.each(me.options.events, function (value, key) {
                if (!eventPattern.test(key)) {
                    return false;
                }

                var name = RegExp.$1,
                    selector = RegExp.$2,
                    args = [name],
                    func = core.is(value, 'function') ? value : (core.is(me[value], 'function') ? me[value] : core.emptyFn);

                if (selector) {
                    args[args.length] = $.trim(selector);
                }

                args[args.length] = function () {
                    func.apply(me, arguments);
                };
                me.on.apply(me, args);
            });

// options.on�� ������ �̺�Ʈ���� Ŭ������ ���ε�
            me.options.on && core.each(me.options.on, function (value, key) {
                me.on(key, value);
            });
        },

        /**
         * this.selectors�� ������� ������Ʈ�� ��ȸ�ؼ� ��������� ����
         * @returns {coma.ui.View}
         * @example
         * var Tab = coma.ui.View.extend({
         *     selectors: { // ��ü�� ������ �� �־��� ��Ҹ� �˻��ؼ� ��������� �������ִ� �ɼ�
         *        btns: '>li>a',
         *        contents: '>li>div'
         *     },
         *     // ...         *
         * });
         * var tab = new Tab('#js-tab');
         * // ��ü�� ������ ������ DOM�� �������� ����Ǿ��ٸ�
         * tab.updateSelectors(); // �� ȣ���������ν� �ٽ� ã�� ���� ��������� �������ش�.
         */
        updateSelectors: function () {
            var me = this;
// selectors �Ӽ� ó��
            me.selectors = core.extend({},
                execObject(me.constructor.superclass.selectors, me),
                execObject(me.selectors, me),
                execObject(me.options.selectors, me));
            core.each(me.selectors, function (value, key) {
                if (typeof value === 'string') {
                    me['$' + key] = me.$el.find(value);
                } else if (value instanceof jQuery) {
                    me['$' + key] = value;
                } else {
                    me['$' + key] = $(value);
                }
                me.ui[key] = me['$' + key];
            });

            return me;
        },

        /**
         * this.$el �� root�� �Ͽ� ������ �����ϴ� ������Ʈ�� �˻�
         * @param {string} selector ������
         * @param {string} [parent] �������
         * @returns {jQuery} this.$el �������� selector�� �ش��ϴ� ������Ʈ��
         * @example
         * var $btn = this.$('button');
         */
        $: function (selector, parent) {
            return this.$el.find.apply(this.$el, arguments);
        },

        /**
         * �ı���
         */
        release: function () {
            var me = this;

            me.triggerHandler('release');
            me.$el.off(me.eventNamespace);
            me.$el.removeData('ui_' + me.moduleName);
            $(window).off('.' + me.cid).off(me.getEN());
            $(document).off('.' + me.cid).off(me.getEN());

// me�� ��ϵ� ������Ʈ���� ������� ����(�޸� �������)
            core.each(me, function (item, key) {
                if (key.substr(0, 1) === '$') {
                    me[key] = null;
                    delete me[key];
                }
            });
            me.el = null;

            core.ui.View._instance = core.array.remove(core.ui.View._instances, me);
        },

        /**
         * �ɼ� �����Լ�
         *
         * @param {string} name �ɼǸ�
         * @param {*} value �ɼǰ�
         * @returns {coma.ui.View} chaining
         * @fires coma.ui.View#optionchange
         * @example
         * var tab = new Tab('#tab');
         * tab.on('optionchange', function(e, data){
         *     alert('�ɼ��� �����(�ɼǸ�:'+data.name+', �ɼǰ�:'+data.value);
         * });
         *
         * tab.setOption('selectedIndex', 2); // alert('�ɼ��� �����(�ɼǸ�: selectedIndex, �ɼǰ�: 2);
         */
        setOption: function (name, value) {
            this.options[name] = value;
            /**
             * �ɼ��� ������� �� �߻�
             * @event coma.ui.View#optionchange
             * @type {Object}
             * @property {string} name �ɼǸ�
             * @property {*} value �ɼǸ�
             */
            this.triggerHandler('optionchange', {name: name, value: value});
            return this;
        },

        /**
         * �ɼǰ� ��ȯ�Լ�
         *
         * @param {string} name �ɼǸ�
         * @param {*} def �ɼǰ��� ���� ��� �⺻��
         * @return {*} �ɼǰ�
         * @example
         * var tab = new Tab('#tab');
         * tab.getOption('selectedIndex'); // 2
         */
        getOption: function (name, def) {
            return (name in this.options && this.options[name]) || def;
        },

        /**
         * ���ڼ��� ���� �ɼǰ��� �����ϰų� ��ȯ���ִ� �Լ�
         *
         * @param {string} name �ɼǸ�
         * @param {*} [value] �ɼǰ�: ���� ��� name�� �ش��ϴ� ���� ��ȯ
         * @return {*}
         * @example
         * $('...').tabs('option', 'startIndex', 2); // set
         * $('...').tabs('option', 'startIndex'); // get // 2
         */
        option: function (name, value) {
            if (arguments.length === 1) {
                return this.getOption(name);
            } else {
                this.setOption(name, value);
            }
        },

        /**
         * �̺�Ʈ�� ���� Ŭ���� ������ ���ӽ����̽��� �ٿ��� ��ȯ (ex: 'click mousedown' -> 'click.MyClassName mousedown.MyClassName')
         * @private
         * @param {string|$.Event} en ���ӽ����̽��� ���� �̺�Ʈ��
         * @return {string} ���ӽ����̽��� �پ��� �̺�Ʈ��
         */
        _normalizeEventNamespace: function (en) {
            if (en instanceof $.Event && en.type.indexOf('.') === -1) {
                en.type = en.type + this.eventNamespace;
                return en;
            }

            var me = this,
                m = (en || "").split(/\s/);
            if (!m || !m.length) {
                return en;
            }

            var name, tmp = [], i;
            for (i = -1; name = m[++i];) {
                if (name.indexOf('.') === -1) {
                    tmp.push(name + me.eventNamespace);
                } else {
                    tmp.push(name);
                }
            }
            return tmp.join(' ');
        },

        /**
         * ���� Ŭ������ �̺�Ʈ���ӽ����̽��� ��ȯ
         * @param {string} [eventName] �̺�Ʈ��
         * @return {string} �̺�Ʈ ���ӽ����̽�
         * @example
         * var en = tab.getEventNamespace('click mousedown');
         */
        getEventNamespace: function (en) {
            if (en) {
                var pairs = en.split(' '),
                    tmp = [];
                for (var i = -1, pair; pair = pairs[++i];) {
                    tmp.push(pair + this.eventNamespace);
                }
                return tmp.join(' ');
            }
            return this.eventNamespace;
        },

        /**
         * ���� Ŭ������ �̺�Ʈ���ӽ����̽��� ��ȯ
         * @return {string} �̺�Ʈ ���ӽ����̽�
         * @example
         * var en = tab.getEN('click mousedown');
         */
        getEN: function () {
            return this.getEventNamespace.apply(this, arguments);
        },

        _trigger: function () {
            var args = arraySlice.call(arguments),
                prefix = this.moduleName.toLowerCase();
            if (typeof args[0] === 'string') {
                args[0] = prefix + args[0];
            } else {
                args[0].type = prefix + args[0].type;
            }
            return this.$el.trigger.apply(this.$el, args);
        },

        _triggerHandler: function () {
            var args = arraySlice.call(arguments),
                prefix = this.moduleName.toLowerCase();
            if (typeof args[0] === 'string') {
                args[0] = prefix + args[0];
            } else {
                args[0].type = prefix + args[0].type;
            }
            return this.$el.triggerHandler.apply(this.$el, args);
        },

        /**
         * me.$el�� �̺�Ʈ �ڵ鷯�� ���ε�
         * @param {string} name �̺�Ʈ��
         * @param {string} [selector] Ÿ��
         * @param {eventCallback} handler �ڵ鷯
         * @returns {coma.ui.View} chaining
         * @example
         * var tab = new Tab('#tab');
         * tab.on('tabchanged', function(e, data){
         *     alert(data.selectedIndex);
         * });
         */
        on: function () {
            return eventHandling(this, 'on', true, arraySlice.call(arguments));
        },

        /**
         * me.$el�� ��ϵ� �̺�Ʈ �ڵ鷯�� ����ε�
         * @param {string} name �̺�Ʈ��
         * @param {eventCallback} [handler] �ڵ鷯
         * @returns {coma.ui.View} chaining
         * @example
         * var tab = new Tab('#tab');
         * tab.off('tabchanged');
         */
        off: function () {
            return eventHandling(this, 'off', false, arraySlice.call(arguments));
        },

        /**
         * me.$el�� ��ȸ�� �̺�Ʈ �ڵ鷯�� ���ε�
         * @param {string} name �̺�Ʈ��
         * @param {string} [selector] Ÿ��
         * @param {eventCallback} handler �ڵ鷯
         * @returns {coma.ui.View} chaining
         * @example
         * var tab = new Tab('#tab');
         * tab.one('tabchanged', function(e, data){
         *     alert(data.selectedIndex);
         * });
         */
        one: function () {
            return eventHandling(this, 'one', true, arraySlice.call(arguments));
        },

        /**
         * me.$el�� ��ϵ� �̺�Ʈ�� ����
         * @param {string} name �̺�Ʈ��
         * @param {*} data ����Ÿ
         * @returns {coma.ui.View} chaining
         * @example
         * var tab = new Tab('#tab');
         * tab.trigger('tabchanged', {selectedIndex: 1});
         */
        trigger: function () {
            return eventHandling(this, 'trigger', false, arraySlice.call(arguments));
        },

        /**
         * Ŀ���� �̺�Ʈ �߻���(�־��� �̺�Ʈ�� �տ� ������ �ڵ����� �ٴ´�)<br>
         *     this.customTrigger('expand'); // this.trigger('accordionexpand') ���� ��ȯ
         * @param {string} name �̺�Ʈ��
         * @param {*} data ����Ÿ
         * @returns {coma.ui.View} chaining
         * @example
         * var tab = new Tab('#tab');
         * tab.customTrigger('changed', {selectedIndex: 1});
         */
        customTrigger: function () {
            var args = arraySlice.call(arguments);
            args[0] = this.name + args[0];
            return this.trigger(this, 'trigger', false, args);
        },

        /**
         * me.$el�� ��ϵ� �̺�Ʈ �ڵ鷯�� ����(���� �̺�Ʈ�� �߻����ϰ� �ڵ鷯 �Լ��� ����)
         * @param {string} name �̺�Ʈ��
         * @param {*} data ����Ÿ
         * @returns {coma.ui.View} chaining
         * @example
         * var tab = new Tab('#tab');
         * tab.triggerHandler('tabchanged', {selectedIndex: 1});
         */
        triggerHandler: function () {
            return eventHandling(this, 'triggerHandler', false, arraySlice.call(arguments));
        },

        /**
         * �ش� ������Ʈ�� ����� Ŭ���� �ν��Ͻ��� ��ȯ
         * @return {Class} �ش� �ν��Ͻ�
         * @example
         * var tab = $('div').Tabs('instance');
         */
        instance: function () {
            return this;
        },

        /**
         * �ش� Ŭ������ �Ҽ� ������Ʈ�� ��ȯ
         * @return {jQuery} �ش� DOM ������Ʈ
         * @example
         * var tab = new Tab('#tab');
         * tab.getElement().hide();
         */
        getElement: function () {
            return this.$el;
        },

        toggle: function (flag) {
            this.$el.toggle(flag);
        },
        show: function () {
            this.toggle(true);
        },
        hide: function () {
            this.toggle(false);
        },
        disabled: function () {
            this.$el.disabled();
        },
        enabled: function () {
            this.$el.disabled(false);
        }
    });

    /**
     * �ۼ��� UI����� jQuery�� �÷��������� ����� �� �ֵ��� ���ε����� �ִ� �Լ�
     *
     * @function
     * @name coma.ui.bindjQuery
     * @param {coma.ui.View} Klass Ŭ����
     * @param {string} name �÷����θ�
     *
     * @example
     * // Ŭ���� ����
     * var Slider = coma.ui.View({
     *   initialize: function(el, options) { // �������� ������ �ݵ�� ��ų ��..(ù��° �μ�: ��� ������Ʈ, �ι�°
     *   �μ�: �ɼǰ���)
     *   ...
     *   },
     *   ...
     * });
     * coma.ui.bindjQuery(Slider, 'slider');
     * // ���� ����
     * $('#slider').scSlider({count: 10});
     *
     * // ��ü �������� : instance Ű���� ���
     * var slider = $('#slider').scSlider('instance');
     * slider.move(2); // $('#slider').scSlider('move', 2); �� ����
     *
     * // ��ü �����ϱ� : release Ű���� ���
     * $('#slider').scSlider('release');
     *
     * // �ɼ� �����ϱ�
     * $('#slider').option('effect', 'fade'); // �̶� optionchange ��� �̺�Ʈ�� �߻��ȴ�.
     */
    ui.bindjQuery = function (Klass, name, prefix) {
        var pluginName = prefix ? prefix + name.substr(0, 1).toUpperCase() + name.substr(1) : name,
            old = $.fn[pluginName];

        $.fn[pluginName] = function (options) {
            var a = arguments,
                args = arraySlice.call(a, 1),
                me = this,
                returnValue = this;

            this.each(function () {
                var $this = $(this),
                    methodValue,
                    instance = $this.data('ui_' + name);

                if (instance && options === 'release') {
                    try {
                        instance.release();
                    } catch (e) {
                    }
                    $this.removeData('ui_' + name);
                    return;
                }

                if (!instance || (a.length === 1 && typeof options !== 'string')) {
                    instance && (instance.release(), $this.removeData('ui_' + name));
                    $this.data('ui_' + name, (instance = new Klass(this, core.extend({}, $this.data(), options), me)));
                }

                if (options === 'instance') {
                    returnValue = instance;
                    return false;
                }

                if (typeof options === 'string' && core.is(instance[options], 'function')) {
                    if (options.substr(0, 1) === '_') {
                        throw new Error('[bindjQuery] private �޼ҵ�� ȣ���� �� �����ϴ�.');
                    }

                    try {
                        methodValue = instance[options].apply(instance, args);
                    } catch (e) {
                        console.error('[' + name + '.' + options + ' error] ' + e);
                    }

                    if (methodValue !== instance && methodValue !== undefined) {
                        returnValue = methodValue;
                        return false;
                    }
                }
            });
            return returnValue;
        };

// ������ ���� ����
        $.fn[pluginName].noConflict = function () {
            $.fn[pluginName] = old;
            return this;
        };
    }

    /**
     * UI����� �⺻�ɼ��� ����
     * @function
     * @name coma.ui.setDefaults
     * @param {string} name ui����(���ӽ����̽� ����)
     * @param {*} opts �ɼǰ���
     * @example
     * coma.ui.setDefaults('Tab', {
     *     selectedIndex: 2
     * });
     */
    ui.setDefaults = function (name, opts) {
        $.extend(true, core.ui[name].prototype.defaults, opts);
    };

    /**
     * Ű �̸�
     * @name coma.keyCode
     * @readonly
     * @enum {number}
     * @property {number} BACKSPACE �����̽�
     * @property {number} DELETE ����Ʈ
     * @property {number} DOWN �ٿ�
     * @property {number} END ����
     * @property {number} ENTER ����
     * @property {number} ESCAPE ESC
     * @property {number} HOME Ȩ
     * @property {number} LEFT ����
     * @property {number} PAGE_DOWN �������ٿ�
     * @property {number} PAGE_UP ��������
     * @property {number} RIGHT ������
     * @property {number} SPACE �����̽�
     * @property {number} TAB ��
     * @property {number} UP ��
     * @example
     * $('#userid').on('keypress', function(e) {
     *     if(e.which === coma.keyCode.DOWN) {
     *         alert('�ٿ�Ű �Է�');
     *     }
     * });
     */
    core.keyCode = {
        ESCAPE: 27,
        TAB: 9,
        BACKSPACE: 8,
        ENTER: 13,
        DELETE: 46,
        LEFT: 37,
        UP: 38,
        RIGHT: 39,
        DOWN: 40,
        PAGE_UP: 33,
        PAGE_DOWN: 34,
        HOME: 36,
        END: 35,
        SPACE: 32
    };

    if (typeof define === "function" && define.amd) {
        define([], function () {
            return core.ui;
        });
    }

})(jQuery, window[LIB_NAME]);

(function ($, core) {
    "use strict";
    if (core.util) {
        return;
    }

    var doc = document;

    /**
     * @namespace
     * @name coma.util
     */
    core.addon('util', function () {

        return /** @lends coma.util */{


            /**
             * ie������������ �־��� �����Ϳ� �ش��ϴ� png �̹����� ���������� ��µǵ��� AlphaImageLoader���͸� ������� �ִ� �Լ�
             * png
             * @param {string} selector
             * @example
             * coma.util.png24('#thumbnail');
             */
            png24: function (selector) {
                var $target;
                if (typeof (selector) == 'string') {
                    $target = $(selector + ' img');
                } else {
                    $target = selector.find(' img');
                }
                var c = [];
                $target.each(function (j) {
                    c[j] = new Image();
                    c[j].src = this.src;
                    if (navigator.userAgent.match(/msie/i))
                        this.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(enabled='true',sizingMethod='scale',src='" + this.src + "')";
                });
            },

            /**
             * ie������������ �������� �����ϴ� ��� png �̹����� ���������� ��µǵ��� AlphaImageLoader���͸� ������� �ִ� �Լ�
             * png Fix
             */
            pngFix: function () {
                var s, bg;
                $('img[@src*=".png"]', doc.body).each(function () {
                    this.css('filter', 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src=\'' + this.src + '\', sizingMethod=\'\')');
                    this.src = '/resource/images/core/blank.gif';
                });
                $('.pngfix', document.body).each(function () {
                    var $this = $(this);

                    s = $this.css('background-image');
                    if (s && /\.(png)/i.test(s)) {
                        bg = /url\("(.*)"\)/.exec(s)[1];
                        $this.css('background-image', 'none');
                        $this.css('filter', "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + bg + "',sizingMethod='scale')");
                    }
                });
            },

            /**
             * �������� �����ϴ� �÷����� wmode��带 opaque�� ����
             */
            wmode: function () {
                $('object').each(function () {
                    var $this;
                    if (this.classid.toLowerCase() === 'clsid:d27cdb6e-ae6d-11cf-96b8-444553540000' || this.type.toLowerCase() === 'application/x-shockwave-flash') {
                        if (!this.wmode || this.wmode.toLowerCase() === 'window') {
                            this.wmode = 'opaque';
                            $this = $(this);
                            if (typeof this.outerHTML === 'undefined') {
                                $this.replaceWith($this.clone(true));
                            } else {
                                this.outerHTML = this.outerHTML;
                            }
                        }
                    }
                });
                $('embed[type="application/x-shockwave-flash"]').each(function () {
                    var $this = $(this),
                        wm = $this.attr('wmode');
                    if (!wm || wm.toLowerCase() === 'window') {
                        $this.attr('wmode', 'opaque');
                        if (typeof this.outerHTML === 'undefined') {
                            $this.replaceWith($this.clone(true));
                        } else {
                            this.outerHTML = this.outerHTML;
                        }
                    }
                });
            },

            /**
             * �˾��� ���� �Լ�. (coma.openPopup���ε� ��밡��)
             * @param {string} url �ּ�
             * @param {number=} width �ʺ�.
             * @param {number=} height ����.
             * @param {opts=} �˾� â ��� ���� �ɼ�.
             * @example
             * coma.openPopup('http://google.com', 500, 400, {scrollbars: 'no'});
             */
            openPopup: function (url, width, height, opts) {
                opts = extend({}, opts);
                width = width || 600;
                height = height || 400;
//var winCoords = coma.util.popupCoords(width, height),
                var target = opts.target || '',
                    feature = 'app_, ',
                    tmp = [];

                delete opts.name;
                for (var key in opts) {
                    tmp.push(key + '=' + opts[key]);
                }
                core.browser.isSafari && tmp.push('location=yes');
                tmp.push('height=' + height);
                tmp.push('width=' + width);
                /* + ', top=' + winCoords.top + ', left=' + winCoords.left;*/
                feature += tmp.join(', ');

                window.open(
                    url,
                    target,
                    feature
                );
            },

            /**
             * �˾��� ����� ���� ȭ����� �߾� ��ġ��ǥ�� ��ȯ
             * @param {number} w �ʺ�.
             * @param {number} h ����.
             * @return {Object} {left: ��, top: ��}
             */
            popupCoords: function (w, h) {
                var wLeft = window.screenLeft ? window.screenLeft : window.screenX,
                    wTop = window.screenTop ? window.screenTop : window.screenY,
                    wWidth = window.outerWidth ? window.outerWidth : document.documentElement.clientWidth,
                    wHeight = window.outerHeight ? window.outerHeight : document.documentElement.clientHeight;

                return {
                    left: wLeft + (wWidth / 2) - (w / 2),
                    top: wTop + (wHeight / 2) - (h / 2) - 25
                };
            },

            /**
             * data-src�Ӽ��� �ִ� �̹���url�� src�� �����Ͽ� �ε��Ű�� �Լ�
             * @param { string } target �̹��� ���
             * @return { Deferred } deferred
             * @example
             * coma.util.loadImages('img[data-src]').done(function(){
             *     alert('��� �̹��� �ε� �Ϸ�');
             * });
             */
            loadImages: function (target) {
                var $imgs = $(target),
                    len = $imgs.length,
                    def = $.Deferred();

                function loaded(e) {
                    if (e.type === 'error') {
                        def.reject(e.target);
                        return;
                    }
                    var $target;
                    if ($target = $(this).data('target')) {
                        $target.css('background', 'url(' + this.src + ')');
                    }

                    len--;
                    if (!len) {
                        def.resolve();
                    }
                }

                if (!len) {
                    def.resolve();
                } else {
                    $imgs.each(function (i) {
                        var $img = $imgs.eq(i);
                        if (!$img.is('img')) {
                            $img = $('<img>').data({
                                'target': $img[0],
                                'src': $img.attr('data-src')
                            });
                        }

                        $img.one("load.lazyload error.lazyload", loaded);
                        var src = $img.attr("data-src");

                        if (src) {
                            $img.attr("src", src);
                        } else if (this.complete) {
                            $img.trigger("load");
                        }
                    });

                }

                return def.promise();
            },

            /**
             * ��Ȯ�� ���������� ���� ���ο� �ִ� �̹����� �� �ҷ��� ������ ��ٸ���.
             * @param {jQuery} $imgs �̹��� ��ҵ�
             * @param allowError ���� ��뿩��(true�̸� �߰��� ������ ���� ���� �̹����� ���)
             * @return {*}
             * @example
             * coma.util.waitImageLoad('img[data-src]').done(function(){
             *     alert('��� �̹��� �ε� �Ϸ�');
             * });
             */
            waitImageLoad: function (imgs, allowError) {
                if (core.is(imgs, 'string')) {
                    imgs = $(imgs);
                }
                var me = this,
                    defer = $.Deferred(),
                    count = imgs.length,
                    loaded = function () {
                        count -= 1;
                        if (count <= 0) {
                            defer.resolve();
                        }
                    };

                if (count === 0) {
                    defer.resolve();
                } else {
                    imgs.each(function (i) {
                        if (this.complete) {
                            loaded();
                        } else {
                            imgs.eq(i).one('load' + (allowError === false ? '' : ' error'), loaded);
                        }
                    });
                }

                return defer.promise();
            },

            /**
             * ��ť��Ʈ�� ���̸� ��ȯ
             * @return {number}
             * @example
             * alert(coma.util.getDocHeight());
             */
            getDocHeight: function () {
                var doc = document,
                    bd = doc.body,
                    de = doc.documentElement;

                return Math.max(
                    Math.max(bd.scrollHeight, de.scrollHeight),
                    Math.max(bd.offsetHeight, de.offsetHeight),
                    Math.max(bd.clientHeight, de.clientHeight)
                );
            },

            /**
             * ��ť��Ʈ�� �ʺ� ��ȯ
             * @return {number}
             * @example
             * alert(coma.util.getDocWidth());
             */
            getDocWidth: function () {
                var doc = document,
                    bd = doc.body,
                    de = doc.documentElement;
                return Math.max(
                    Math.max(bd.scrollWidth, de.scrollWidth),
                    Math.max(bd.offsetWidth, de.offsetWidth),
                    Math.max(bd.clientWidth, de.clientWidth)
                );
            },

            /**
             * â�� �ʺ� ��ȯ
             * @return {number}
             * @example
             * alert(coma.util.getWinHeight());
             */
            getWinWidth: function () {
                var w = 0;
                if (self.innerWidth) {
                    w = self.innerWidth;
                } else if (document.documentElement && document.documentElement.clientHeight) {
                    w = document.documentElement.clientWidth;
                } else if (document.body) {
                    w = document.body.clientWidth;
                }
                return w;
            },

            /**
             * â�� ���̸� ��ȯ
             * @return {number}
             * @example
             * alert(coma.util.getWinHeight());
             */
            getWinHeight: function () {
                var w = 0;
                if (self.innerHeight) {
                    w = self.innerHeight;
                } else if (document.documentElement && document.documentElement.clientHeight) {
                    w = document.documentElement.clientHeight;
                } else if (document.body) {
                    w = document.body.clientHeight;
                }
                return w;
            },

            /**
             * �־��� ����� ������ & ��ġ�� ��ȯ
             * @param {Element} elem
             * @returns {Object} {width: �ʺ�, height: ����, offset: { top: ž��ġ, left: ����Ʈ��ġ}}
             *
             * @example
             * var dims = coma.util.getDimensions('#box');
             * console.log(dims.left, dims.top, dims.width, dims.height);
             */
            getDimensions: function (elem) {
                if (core.is(elem, 'string')) {
                    elem = $(elem);
                }

                var el = elem[0];
                if (el.nodeType === 9) {
                    return {
                        width: elem.width(),
                        height: elem.height(),
                        offset: {top: 0, left: 0}
                    };
                }
                if ($.isWindow(el)) {
                    return {
                        width: elem.width(),
                        height: elem.height(),
                        offset: {top: elem.scrollTop(), left: elem.scrollLeft()}
                    };
                }
                if (el.preventDefault) {
                    return {
                        width: 0,
                        height: 0,
                        offset: {top: el.pageY, left: el.pageX}
                    };
                }
                return {
                    width: elem.outerWidth(),
                    height: elem.outerHeight(),
                    offset: elem.offset()
                };
            },

            /**
             * ������ ����� �°� â����� ����
             * @example
             * coma.util.resizeToContent(); // �˾������� ���
             */
            resizeToContent: function () {
                var innerX, innerY,
                    pageX, pageY,
                    win = window,
                    doc = win.document;

                if (win.innerHeight) {
                    innerX = win.innerWidth;
                    innerY = win.innerHeight;
                } else if (doc.documentElement && doc.documentElement.clientHeight) {
                    innerX = doc.documentElement.clientWidth;
                    innerY = doc.documentElement.clientHeight;
                } else if (doc.body) {
                    innerX = doc.body.clientWidth;
                    innerY = doc.body.clientHeight;
                }

                pageX = doc.body.offsetWidth;
                pageY = doc.body.offsetHeight;

                win.resizeBy(pageX - innerX, pageY - innerY);
            },

            /**
             * �˾��� ��� �Ŀ� �־��� �ݹ��Լ��� ȣ��
             * @param {string} url �ּ�
             * @param {Object} feature �˾� ���
             * @param {Function} (Optional) callback ����� �Ŀ� ������ �ݹ��Լ�
             * @example
             * coma.util.openPopupAndExec('http://google.com', '', function(){
             *     alert('�˾��� ���������� ��������ϴ�.');
             * });
             */
            openPopupAndExec: function (url, feature, callback) {
                feature = $.extend(feature, {
                    name: 'popupWin',
                    width: 600,
                    height: 531,
                    align: 'center',
                    resizable: 'no',
                    scrollbars: 'no'
                });
                var f = [];
                core.each(feature, function (val, key) {
                    f.push(key + '=' + val);
                });

                var popupWin = window.open('', feature.name, f.join(','));
                if (!popupWin || popupWin.outerWidth === 0 || popupWin.outerHeight === 0) {
                    alert("�˾� ���� ����� �����Ǿ��ֽ��ϴ�\n\n���� ����� ����(�˾����) �� �� �ٽ� �̿��� �ֽʽÿ�.");
                    return;
                }

                if (popupWin.location.href === 'about:blank') {
                    popupWin.location.href = url;
                }

                var limit = 0,
                    fn = function () {
                        if (limit++ > 50) {
                            return;
                        }
                        if (!popupWin.document.body) {
                            setTimeout(fn, 100);
                            return;
                        }
                        callback && callback(popupWin);
                        popupWin.focus();
                    };

                if (!popupWin.document.body) {
                    setTimeout(fn, 100);
                } else {
                    fn();
                }
            },

            /**
             * ���̺�Ʈ�� deltaY ����(����: 1, �Ʒ���: -1)
             * @param {jQuery#Event}
             * @example
             * $el.on('mousewheel DOMMouseScroll wheel', function (e) {
             *     var deltaY = coma.util.getDeltaY(e);
             * });
             */
            getDeltaY: function (e) {
                e = e.originalEvent || e;

                var detail;
                if ('detail' in e) {
                    detail = e.detail * 1;
                }
                if ('wheelDelta' in e) {
                    detail = e.wheelDelta;
                }
                if ('wheelDeltaY' in e) {
                    detail = e.wheelDeltaY;
                }
                if ('deltaY' in e) {
                    detail = e.deltaY * -1;
                }

                return detail === 0 ? 0 : (detail > 0 ? 1 : -1);
            },
            /**
             * �� �������� ������ ���
             * @param {{x: (*|Number|number), y: (*|number|Number)}} a
             * @param {{x: (*|Number|number), y: (*|number|Number)}} b
             * @returns {{x: number, y: number}}
             */
            getDiff: function (a, b) {
                return {
                    x: a.x - b.x,
                    y: a.y - b.y
                };
            },

            /**
             * �̺�Ʈ�� ��ǥ ����
             * @param e �̺�Ʈ ��ü
             * @param type
             * @returns {{x: (*|Number|number), y: (*|number|Number)}}
             */
            getEventPoint: function (e, type) {
                e = e.originalEvent || e;
                if (type === 'end') {
                    e = e.changedTouches && e.changedTouches[0] || e;
                } else {
                    e = e.touches && e.touches[0] || e;
                }
                return {
                    x: e.pageX || e.clientX,
                    y: e.pageY || e.clientY
                };
            },

            /**
             * �� �����Ͱ��� ���� ���
             * @param {{x: (*|Number|number), y: (*|number|Number)}} startPoint ������
             * @param {{x: (*|Number|number), y: (*|number|Number)}} endPoint ����
             * @returns {number} ����
             */
            getAngle: function (startPoint, endPoint) {
                var x = startPoint.x - endPoint.x;
                var y = endPoint.y - startPoint.y;
                var r = Math.atan2(y, x); //radians
                var angle = Math.round(r * 180 / Math.PI); //degrees

                if (angle < 0) {
                    angle = 360 - Math.abs(angle);
                }

                return angle;
            },

            /**
             * �������� ������ ���ؼ� �̵��� ������ ��ȯ
             * @param {{x: (*|Number|number), y: (*|number|Number)}} startPoint ������
             * @param {{x: (*|Number|number), y: (*|number|Number)}} endPoint ����
             * @returns {*} left, right, down, up
             */
            getDirection: function (startPoint, endPoint) {
                var angle = this.getAngle(startPoint, endPoint);

                if ((angle <= 45) && (angle >= 0)) {
                    return 'left';
                } else if ((angle <= 360) && (angle >= 315)) {
                    return 'left';
                } else if ((angle >= 135) && (angle <= 225)) {
                    return 'right';
                } else if ((angle > 45) && (angle < 135)) {
                    return 'down';
                } else {
                    return 'up';
                }
            }
        };
    });

    var $win = $(window);
    $win.on(function () {
        var bindGlobalEvent = function (type) {
            var data = {};
            return function () {
                if (!data[type + 'Start']) {
                    $win.triggerHandler(type + 'start');
                    data[type + 'Start'] = true;
                }
                data[type + 'Timer'] && clearTimeout(data[type + 'Timer']);
                data[type + 'Timer'] = setTimeout(function () {
                    $win.triggerHandler(type + 'end');
                    data[type + 'Start'] = false;
                }, 200);
            };
        };
        /**
         * @fires window#scrollstart
         * @fires window#scrollend
         * @fires window#resizestart
         * @fires window#resizeend
         */
        /**
         * ��ũ�� ���۽ÿ� ȣ��
         * @event window#scrollstart
         * @type {Object}
         */
        /**
         * ��ũ�� ����ÿ� ȣ��
         * @event window#scrollend
         * @type {Object}
         */
        /**
         * ������¡ ���۽ÿ� ȣ��
         * @event window#resizestart
         * @type {Object}
         */
        /**
         * ������¡ ����ÿ� ȣ��
         * @event window#resizeend
         * @type {Object}
         */
        return {
            'scroll': bindGlobalEvent('scroll'),
            'resize': bindGlobalEvent('resize')
        };
    }());

    core.s = core.string;
    core.d = core.date;
    core.n = core.number;
    core.a = core.array;
    core.o = core.object;
    core.u = core.uri;
    core.b = core.browser;

    /**
     * ��� ���� �Լ� �� ���ӽ����̽�
     * @namespace
     * @name coma.module
     * @example
     * var Geolocation = coma.Base.extend({...});
     * coma.module('Geolocation', Geolocation);
     *
     * //or
     * coma.module('Geolocation', {
     *     initialize: function(){}
     * });
     *
     * coma.module.Geolocation().getInstance()...
     */
    core.module = function (name, obj) {
        if (!obj) {
            return;
        }
        if (!obj.superclass) {
            obj = core.Base.extend(obj);
        }
        this.module[name] = obj;
    };

})(jQuery, window[LIB_NAME]);
//// ��������� �����ӿ� �ҽ��Դϴ�. //////////////////////////////////////////////////////////////////


// ���� ����Ʈ ���� �۷ι� �۾����� ó���ϴ� �͸� �Լ�
(function ($, core) {
    "use strict";
    if (core._initGlobalUI) {
        return;
    }
    core._initGlobalUI = true;

    var $win = $(window);

// ����̽��̸� ��¥ ������ ����
    if (core.browser.isMobile) {
        core.date.FORMAT = 'yyyy-MM-dd';
    }

// import ���� �ɼ�
    core.importJs.baseUrl = JS_DIR; // �⺻ js ���丮
    core.importJs.ver = '20150406'; // ����
    core.importJs.addAliases({ // ����� �߰�, ���� ���Ǵ� �͸�

    });

    core.consts = {
        MOBILE_SIZE: 768,       // ����ϻ����� ����
        M_HEADER_HEIGHT: 44,    // ����ϻ������� �� ��� ������
        P_HEADER_HEIGHT: 56     // pc�������� �� ��� ������
    };
// ���� â ����� ����� ���������� ����
    core.isMobileSize = function (w) {
        if (w === undefined) {
            w = $win.width();
        }
        return w <= core.consts.MOBILE_SIZE;
    };

// ������ UI����� ����� ��ҵ��� ajax �� ����,
// ��ü�ǰų� ������ DOM�� ���ؼ� �ֱ������� �޸�����, �̺�Ʈ ����ε� ���� �����ش�.
    setInterval(function () {
        core.ui.uiGarbageClear();
    }, 60000);


// �ػ󵵺� ������ ������ ���ϴ� ������ changemediasize��� �̺�Ʈ�� ������ �߻���Ų��.
    $win.on('resize.changemediasize', (function () {
        var sizes = [
                {
                    mode: 'w376',
                    min: 0,
                    max: 376
                },
                {
                    mode: 'w768',
                    min: 376,
                    max: 768
                },
                {
                    mode: 'w1024',
                    min: 768,
                    max: 1024
                },
                {
                    mode: 'w1280',
                    min: 1024,
                    max: 1280
                },
                {
                    mode: 'wide',
                    min: 1280,
                    max: 100000
                }
            ],
            prevMode = '', f,
            $body = $('body');

        f = function (force) {
            var w = $win.width();
            if ($body.size() === 0) {
                $body = $('body');
            }
// �˾��̰ų� pc���� �������� ��� changemediasize �̺�Ʈ�� ������ �ʴ´�.
            if ($body.hasClass('pop_body') || $body.hasClass('pc_body')) {
                $win.off('resize.changemediasize', f);
                return;
            }
            if (force === true) {
                prevMode = null;
            }
            document.title = w + ' - ' + document.title.replace(/^[0-9\- ]*/, '');
            for (var i = 0, size; size = sizes[i]; i++) {
                if (w > size.min && w <= size.max && prevMode != size.mode) {
                    size.width = w;
                    switch (size.mode) {
                        case 'wide': // > 1280
                            $body.removeClass('w376 w768 w1024 w1280');
                            break;
                        case 'w1280':
// âũ�Ⱑ 1279 ~ 1024 ������ ��� âũ��� ����
                            $body.addClass('w1280').removeClass('w376 w768 w1024');
                            break;
                        case 'w1024':
// âũ�Ⱑ 1203 ~ 768 ������ ��� âũ��� ����
                            $body.addClass('w1024').removeClass('w376 w768 w1280');
                            break;
                        case 'w768':
// âũ�Ⱑ 767 ������ ��� ����� ȭ��
                            $body.addClass('w768').removeClass('w376 w1024 w1280');
                            break;
                        case 'w376':
// âũ�Ⱑ 376 ������ ��� ����� ȭ��
                            $body.addClass('w376 w768').removeClass('w1024 w1280');
                            break;
                    }
                    prevMode = size.mode;
                    core.ui.mediaInfo = size;
                    console.log('changemediasize');
                    $win.trigger('changemediasize', false);
                    break;
                }
            }
        };
// ����ڰ� ���� trigger�ϴ°Ŷ� �����ϱ� ���� �ι�° ���ڸ� ���
        $win.on('changemediasize', function (e, data) {
// �ٷ� ���Լ����� �����Ŵ� ����
            if (data !== false) {
                f(true);
            }
        });
// �ʱ⿡ �ѹ� ����
        $(function () {
//setTimeout(function () {
            f();
//}, 0);
        });
        return f;
    })());


    /**
     * @namespace
     * @name coma.GlobalUIs
     * @description ������ �̺�Ʈ ���ε�
     * @example
     * coma.GlobalUIs.init();
     */
    core.addon('GlobalUIs', function () {
        var $doc = $(document);

        var GlobalUIs = /** @lends coma.GlobalUIs# */ {
            init: function () {
                var me = this;

                if (me._inited) {
                    return;
                }
                me._inited = true;
                me.isPopup = $('body').hasClass('pop_body');

                me._inputBox();
                me._radioAndCheckbox();
                me._button();
                me._skipNaviFocus();

                if (!core.browser.isTouch) {
                    me._hover();
                }

                if (!me.isPopup) {
                    me._header();
                    me._commonMenu();
                    me._footer();
                }
            },

            _get: function (name, selector) {
                var me = this;

                return me['$' + name] || (me['$' + name] = $(selector));
            },

            /**
             * document�� INPUT BOX ���� �̺�Ʈ ���ε�
             *
             */
            _inputBox: function () {

                $doc.on('focusin.globalui', '.ui_inputbox', function (e) {
                    var $that = $(this);
// �ߺ� ���ε� ����
                    if ($that.data('inputDel')) {
                        return;
                    }
                    $that.data('inputDel', true);

// ��ǲ�� x��ư ó��
                    var $inp = $that.find('input:text'),
                        $btn = $that.find('button'),
                        timer;

                    function isDisable($el) {
                        return $el.prop('readonly') || $el.prop('disabled');
                    }

                    $inp.on('keyup', function (e) {
                        if (isDisable($inp)) {
                            return;
                        }
                        var isNotEmpty = $inp.trimVal() !== '';

                        $btn.toggle(isNotEmpty);
                        $inp.toggleClass('input_pad', isNotEmpty);
                    });

// ��Ŀ�̿� ���� x��ư ���
                    $that.on('focusin focusout', function (e) {
                        var isNotEmpty = $inp.trimVal() !== '';

                        if (isNotEmpty && e.type === 'focusin') {
                            if (isDisable($inp)) {
                                return;
                            }
                            clearTimeout(timer);
                            timer = null;
                            $btn.show();
                            $inp.addClass('input_pad');
                            $inp.val($inp.val());
                        } else if (e.type === 'focusout') {
                            timer = setTimeout(function () {
                                $btn.hide();
                                $inp.removeClass('input_pad');
                                $inp.val($inp.val());
                            }, 200);
                        }
                    });

                    if ($inp.trimVal() !== '') {
                        if (isDisable($inp)) {
                            return;
                        }
                        clearTimeout(timer);
                        timer = null;
                        $btn.show();
                        $inp.addClass('input_pad');
                        $inp.val($inp.val());
                    }

                    $btn.on('click', function (e) {
                        e.preventDefault();
                        $inp.val('').trigger('change').focus();
                    });

                });
            },

            /**
             * document�� üũ�ڽ� & ����
             *
             */
            _radioAndCheckbox: function () {
                var me = this;

// ��Ų�� �����ڽ�, üũ�ڽ�
                $doc.on('click.globalui keydown.globalui', '.ui_checkbox, .ui_radiobox', function (e) {
// ����Ƽ��ó�� Ŭ�� Ȥ�� �����̽�Ű�� ������ üũ�� �ǵ���..
                    var valid = (e.type === 'click' || (e.type === 'keydown' && e.keyCode === 32));
                    if (valid) {
                        e.preventDefault();

                        var $el = $(this),
                            $input;
                        if ($el.hasClass('ui_checkbox')) {
                            $input = $el.find('input:checkbox:enabled');
                        } else {
                            $input = $el.find('input:radio:enabled:not(:checked)');
                        }
                        $input.checked(null);
                    }
                });
            },

            /**
             * document�� Element�� Hover �̺�Ʈ ���ε�
             *
             */
            _hover: function () {
                var me = this;

                if (!core.isTouch) {
// button, li, input, textarea ȣ���� Ȱ��ȭ
                    $doc.on('mouseenter.globalui mouseleave.globalui focusin.globalui focusout.globalui',
                        'textarea:not([readonly]):enabled, :text:not([readonly]):enabled, :password:not([readonly]):enabled',
                        function (e) {
                            switch (e.type) {
                                case 'mouseenter':
                                case 'mouseleave':
                                    $(this).toggleClass('active', e.type === 'mouseenter');
                                    break;
                                case 'focusin':
                                case 'focusout':
                                    $(this).toggleClass('on', e.type === 'focusin');
                                    break;
                            }
                        }).on('mouseenter.globalui mouseleave.globalui focusin.globalui focusout.globalui',
                        'button:not(:disabled), li:not(.disabled)',
                        function (e) {
                            var $el = $(this);

                            switch (e.type) {
                                case 'mouseenter':
                                case 'focusin':
                                    if (!$el.hasClass('on')) {
                                        $el.addClass('active');
                                    }
                                    break;
                                default:
                                    $el.removeClass('active');
                                    break;
                            }
                        });
                }
            },

            /**
             * ��� �޴� Fixed ���
             *
             */
            _commonMenu: function () {
                var me = this,
                    $comaMenu = me._get('commonMenu', '.ui_common_menu'),
                    $comaMenuContent = $comaMenu.find('.ui_common_menu_content');

                var showcomaMenu = function () {
                    $comaMenuContent.show().find('.ui_close').focus();

// ����޴� �ݱ�
                    $comaMenuContent.off().on('click', '.ui_close', function (e) {
                        e.preventDefault();

                        $comaMenu.find('.ui_common_menu_btn').focus();
                        hidecomaMenu();
                    });
                };

                var hidecomaMenu = function () {
                    $comaMenuContent.off().hide();
                };

// ����޴� ���� �� top��ư ���ε�
                $comaMenu.on('click', 'a', function (e) {
                    e.preventDefault();

                    var $el = $(this);
                    if ($el.hasClass('ui_common_menu_btn')) {
                        showcomaMenu();
                    } else if ($el.hasClass('ui_go_top')) {
                        $(window).scrollTop(1);
                    }
                });
            },

            /**
             *GNB
             *
             */
            _gnb: function () {
                $('.ui_skip_navi').on('click', function () {
// IE������ �����ٷΰ��⸦ ������ ��� ��ũ��Ʈ�� Ŭ������ �������� ������ ��ũ �̵� �� ��ũ�Ѹ� �̺�Ʈ�� �۵�. ũ�ҿ����� ���� ������ ���� ���� üũ�� ���� ����.
                    if ($(window).height() < $(document).height()) {
                        $('#htop').addClass('fixed').removeClass('dp_menu').css({'position': '', 'top': ''});
                        $('.main_sec, .main, .subm').addClass('fixed');
                    }
                });

// ��ü�޴� ����
                coma.importJs([
                    'modules/allmenu'
                ], function () {
                    window.allMenu = new coma.ui.AllMenu($('.ui_all_menu'));
                });
            },

            /**
             * ���� ��� ��ư. ����Ʈ/�ݱ�
             *
             */
            _button: function () {
                var me = this;

                $doc.on('click.globaluibutton', '.ui_print, .ui_close, .ui_popup', function (e) {
                    e.preventDefault();
                    var $el = $(this), target;
                    switch (true) {
                        case $el.hasClass('ui_print'): // �μ� ��ư
                            window.print();
                            break;
                        case $el.hasClass('ui_close'): // �ݱ��ư
                            if (me.isPopup) { // �˾� �ݱ�
                                window.self.close();
                            } else if (target = $el.attr('data-target')) {  // data-target�� ������ ��Ҹ� hide
                                if ($(target).hide().size()) {
                                    e.stopPropagation();
                                }
                            } else if (target = $el.attr('data-closest')) {  // ������ �θ� hide
                                if ($el.closest(target).hide().size()) {
                                    e.stopPropagation();
                                }
                            }
                            break;
                    }
                });

                if (!core.browser.isMobile) {
                    $doc.on('click.globaluibutton', '.f_tel', function (e) {
                        e.preventDefault();
                    });
                }
            },

            _header: function () {
                var me = this,
                    top = 0,
                    $htop = me.$htop || (me.$htop = $('#htop')),
                    $skipNavi = me.$skipNavi || (me.$skipNavi = $('.skip')),
                    $mainSec = me.$mainSec || (me.$mainSec = $('.main_sec, .main, .subm')),
                    $commonMenu = me.$comaMenu || (me.$comaMenu = $('.ui_common_menu')),
                    $goTop = me.$goTop || (me.$goTop = $('.ui_go_top')),
                    $fixedSubHeader;

                var getFixedSubHeader = function () {
                    if (!$fixedSubHeader || $fixedSubHeader.size() === 0) {
                        $fixedSubHeader = $('.ui_fixed_header')
                    }
                    return $fixedSubHeader;
                };

// �������(fixed <-> static)
                $win.on('scroll.globalheader', function (e) {
                    if (core.isTouch) {
                        setTimeout(function () {
                            e.preventDefault();
                        }, 0);
                    }
                    var scrollTop = $win.scrollTop(),
                        skipNaviHeight = 18;

                    if (window.allMenu && window.allMenu.menuOpended && window.allMenu.menuMode === 'pc') {
// pc������� �޴��� ������ ���� ��
                        if (scrollTop < $htop.offset().top) {
                            top = (scrollTop > skipNaviHeight) ? 0 : skipNaviHeight - scrollTop;
                            $htop.removeClass('fixed').css({'position': 'absolute', 'top': scrollTop + top});
                        }
                    } else {
                        var bNavi = (parseInt(scrollTop, 10) >= skipNaviHeight);

                        $htop.toggleClass('fixed', bNavi);
                        $mainSec.toggleClass('fixed', bNavi);
// ������ �Ҽ� ��� ����
                        if ($fixedSubHeader = getFixedSubHeader()) {
                            $fixedSubHeader.toggleClass('fixed', bNavi);
                        }
                        $commonMenu.toggleClass('scroll', bNavi);
                        $goTop.toggle(bNavi);
                    }
                });


// ��������� ����
                var $userInfo = $htop.find('.ui_user_info'),
                    $userInfoContent = $htop.find('.ui_user_info_content').attr('tabindex', 0).css('outline', 'none'),
                    $userInfoBox = $userInfo.parent();

                var showUserInfo = function () {
                    $doc.on('click.globaluiuserinfo', function (e) {
                        if (!$.contains($userInfoBox[0], e.target)) {
                            hideUserInfo();
                        }
                    });
                    var focusTimer;
                    $userInfoContent.on('focusin focusout', function (e) {
                        clearTimeout(focusTimer);

                        switch (e.type) {
                            case 'focusout':
                                focusTimer = setTimeout(function () {
                                    hideUserInfo();
                                }, 300);
                                break;
                        }
                    });
                    $userInfoBox.addClass('expn');
                };

                var hideUserInfo = function () {
                    $userInfoBox.off().removeClass('expn');
                    $userInfoContent.off();
                    $doc.off('click.globaluiuserinfo');
                };

                $userInfo.on('click', function (e) {
                    e.preventDefault();

                    if ($userInfoBox.hasClass('expn')) {
                        hideUserInfo();
                    } else {
                        showUserInfo();
                    }
                });

                me._gnb();
            },

            /**
             * Footer�� ��ũ��Ʈ
             *
             */
            _footer: function () {
                var me = this,
                    $footer = $('#footer');

                if ($footer.size() > 0) {
                    core.importJs([
                        'modules/footer'
                    ], function () {
                        $footer.scFooter();
                    });
                }

            },

            /**
             * ��ŵ�׺���̼����� �̵����� ��, �ش� ������ ��Ŀ���� ������..
             */
            _skipNaviFocus: function () {
                $('#skip_nav').on('click', 'a', function (e) {
                    $($(this).attr('href')).attr('tabindex', 0).focus();
                });
            }
        };

        return GlobalUIs;
    });

    $(function () {
        core.GlobalUIs.init();
    });

// TODO ���߿� ���� ���߽� ���� - �ۺ��̿��� �ӽ÷� ���� ���� ���� �ڵ�
// PC/Mobile CSS ���� �ε� START - ���߿� ����
    function setActiveStyle() {
        var isMobile = (window.location.href.indexOf("css=mobile") != -1) ? true : false,
            i, css;

        for (i = 0; (css = document.getElementsByTagName("link")[i]); i++) {
            if (css.getAttribute("rel").indexOf("style") != -1) {
                css.disabled = true;
                if (isMobile) {
                    if (css.getAttribute("href").indexOf("_mobile") != -1) css.disabled = false;
                } else {
                    if (css.getAttribute("href").indexOf("_mobile") == -1) css.disabled = false;
                }
            }
        }
    }

    setActiveStyle();
// PC/Mobile CSS ���� �ε� END

    if (IS_DEBUG) {
        $('body').append('<textarea rows="5" cols="40" id="txt"></textarea><br><button id="btn">btn</button>');
        $('#btn').click(function () {
            $.ajax({url: JS_DIR + '/' + $('#txt').val()}).done(function (html) {
                $('#txt').val(html);
            });
        });
    }
})(jQuery, window[LIB_NAME]);