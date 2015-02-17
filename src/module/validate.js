(function (core, undefined) {

    var messages = {
        required: '[data-name]항목은 필수입력 항목입니다.',
        matches: '[data-name]항목은 {0}항목과 동일해야 합니다.',
        email: '[data-name]항목이 이메일 형식에 맞지 않습니다.',
        //emails: 'The %s field must contain all valid email addresses.',
        minlength: '[data-name]항목의 최소길이는 {0}입니다.',
        maxlength: '[data-name]항목의 최대길이는 {0}입니다',
        exactlength: '[data-name]항목은 {0}길이여야 합니다.',
        rangelength: '[data-name] 길이가 {0}와 {1}사이',
        minchecked: '[data-name]항목의 최소 {0}개 이상 체크.',
        maxchecked: '[data-name]항목의 최대 {0}개 이하 체크',
        exactchecked: '[data-name]항목은 {0}개 체크.',
        rangechecked: '{0} ~ {1} 개 체크',
        alpha: '영문자만 유효.',
        alnum: '영문자와 숫자만 유효.',
        numeric: '숫자, ., -만 유효.',
        integer: '- 숫자만 유효.',
        decimal: '데시몰만 유효',
        nozero: '0으로 시작하면 안됨',
        file: '{0}파일만 유효합니다.',
        url: 'url 주소만.',
        gt_date: 'this.value > date.',
        lt_date: 'this.value < date.',
        eqgt_date: 'this.value <= date.',
        eqlt_date: 'this.value >= date',
        regexp: '[data-pattern] 정규식에 안맞습니다.'
    };

    var ruleRegex = /^(.+?)\((.+)\)$/,
        numericRegex = /^[0-9]+$/,
        integerRegex = /^\-?[0-9]+$/,
        decimalRegex = /^\-?[0-9]*\.?[0-9]+$/,
        emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
        alphaRegex = /^[a-z]+$/i,
        alphaNumericRegex = /^[a-z0-9]+$/i,
        naturalNoZeroRegex = /^[1-9][0-9]*$/i,
        ipRegex = /^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})$/i,
        base64Regex = /[^a-zA-Z0-9\/\+=]/i,
        numericDashRegex = /^[\d\-\s]+$/,
        urlRegex = /^((http|https):\/\/(\w+:{0,1}\w*@)?(\S+)|)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/,
        dateRegex = /\d{4}-\d{1,2}-\d{1,2}/;


    function typeName(el) {
        return (el.type||'').toLowerCase();
    }

    function tagName(el) {
        return (el.tagName||'').toLowerCase();
    }

    function getValue(el){
        var type = typeName(el),
            items;
        if(type === 'checkbox' || type === 'radio') {
            items = [].slice.call(el.form.elements[el.name]);
            for(var i = -1, item; item = items[++i]; ){
                if(item.checked === true) { return item.value; }
            }
            return '';
        }
        return el.value;
    }

    function getCheckedCount(el) {
        var items = [].slice.call(el.form.elements[el.name]),
            cnt = 0;

        for(var i = -1, item; item = items[++i]; ){
            if(item.checked) {
                cnt += 1;
            }
        }
        return cnt;
    }

    function parseDate(date) {
        if (!date.match('today') && !date.match(dateRegex)) {
            return false;
        }

        var validDate = new Date(),
            validDateArray;

        if (!date.match('today')) {
            validDateArray = date.split('-');
            validDate.setFullYear(validDateArray[0]);
            validDate.setMonth(validDateArray[1] - 1);
            validDate.setDate(validDateArray[2]);
        }
        return validDate;
    }

    /**
     * @class
     * @name common.module.Validator
     * @extends common.Base
     */
    var Validator = core.ui('Validator', /** @lends common.module.Validator# */{
        bindjQuery: 'validator',
        initialize: function (el, options) {
            var me = this;
            me.errors = [];
            me.form = $(el).get(0);
            me.messages = core.clone(messages);
            me.befores = {};
            me.afters = {};
        },
        setMessage: function (rule, message) {
            this.messages[rule] = message;

            return this;
        },
        registerCallback: function (name, handler, isBefore) {
            if (name && typeof name === 'string' && handler && typeof handler === 'function') {
                if(isBefore){ this.befores[name] = handler; }
                else { this.afters[name] = handler; }
            }

            return this;
        },
        addRule: function(){
            /*
            {
                message: '',
                regexp: //
            }
            */
        },
        run: function () {
            if(!this._validateForm()){
                this._showError();
            }
        },
        _normalizeMessage: function(el, msg, params) {
            return msg && msg.replace(/\{([a-z0-9-]+)\}/g, function(v, s) {
                if(/[0-9]+/.test(s)){
                    return params[s|0] || '';
                } else {
                    return el.getAttribute('data-' + s) || params[s] || 'unknown';
                }
            }).replace(/\[([a-z0-9-]+)\]/g, function(v, s) {
                    return el.getAttribute(s) || '';
            }) || 'unknown msg';
        },
        _showError: function() {
            var error = this.errors[0],
                el = error.el,
                params = error.params;

            alert(this._normalizeMessage(el, this.errors[0].msg || messages[this.errors[0].rule], params));
            this.errors[0].el.focus();
        },
        _validateForm: function () {
            var me = this,
                elements = me.form.elements,
                success = true,
                fn;

            me.errors = [];
            if(!elements.length) { return true; }

            for (var i = -1, element; element = elements[++i]; ) {
                if ((fn = me.befores[element.name]) && !fn.call(me, element)) { success = false; break; }
                if(success && me._validateField(element)) {
                    if (fn = me.afters[element.name]) {
                        if (!fn.call(me, element)) { success = false; break; }
                    }
                } else {
                    success = false;
                    break;
                }
            }

            return success;
        },
        _parseRules: (function(){
            var paramRegex = /^([a-z]+)(?:\((.+)\)$)*/;
            return function(element){
                var rules = (element.getAttribute('data-valid')||'').split('|'),
                    matches, result = {};

                if(element.hasAttribute('required')){
                    result['required'] = true;
                    element.removeAttribute('required');
                }
                for(var i = -1, rule; (rule = rules[++i]) && (matches = rule.match(paramRegex)); ) {
                    result[matches[1]] = {
                        params: matches[2] ? core.array.map((matches[2]||'').split(/,\s*/g), function(val) {
                            return core.is(val, 'number') ? val|0 : val;
                        }) : []
                    }
                }
                return result;
            };
        })(),
        _validateField: function (element) {
            var me = this,
                rules =  me._parseRules(element),
                fn;

            for(var name in rules) { if(!rules.hasOwnProperty(name)){ continue; }
                if(fn = me._rules[name]) {
                    if(!fn.apply(me, [element].concat(rules[name].params))){
                        me.errors.push({
                            rule: name,
                            el: element,
                            params: rules[name].params
                        });
                        return false;
                    }
                } else {
                    throw new Error('[Validator] '+name+'는 지원하지 않는 규칙입니다.');
                }
            }

            return true;
        },

        _rules: {
            required: function (element) {
                var value = getValue(element);
                return !!(value);
            },
            matches: function (element, matchName) {
                var el = this.form[matchName];

                if (el) {
                    return element.value === el.value;
                }

                return false;
            },
            email: function (element, other) {
                var val = element.value, domain;
                if(other && (domain = element.form.elements[other])) {
                    val += '@' + domain.value;
                }
                return emailRegex.test(val);
            },

            minlength: function (element, length) {
                return (element.value.length >= parseInt(length, 10));
            },
            maxlength: function (element, length) {
                return (element.value.length <= parseInt(length, 10));
            },
            exactlength: function (element, length) {
                return (element.value.length === length|0);
            },
            rangelength: function(element, min, max){
                var cnt = getCheckedCount(element);
                return cnt >= min && cnt <= max;
            },

            minchecked: function (element, min) {
                return getCheckedCount(element) >= min|0;
            },
            maxchecked: function (element, max) {
                return getCheckedCount(element) <= max|0;
            },
            exactchecked: function (element, cnt) {
                return getCheckedCount(element) === cnt|0;
            },
            rangechecked: function(element, min, max){
                var cnt = getCheckedCount(element);
                return cnt >= min|0 && cnt <= max|0;
            },

            lt: function (element, param) {
                if (!decimalRegex.test(element.value)) {
                    return false;
                }

                return (parseFloat(element.value) > parseFloat(param));
            },
            gt: function (element, param) {
                if (!decimalRegex.test(element.value)) {
                    return false;
                }

                return (parseFloat(element.value) < parseFloat(param));
            },
            alpha: function (element) {
                return (alphaRegex.test(element.value));
            },
            alnum: function (element) {
                return (alphaNumericRegex.test(element.value));
            },
            numeric: function (element) {
                return (numericRegex.test(element.value));
            },
            integer: function (element) {
                return (integerRegex.test(element.value));
            },
            decimal: function (element) {
                return (decimalRegex.test(element.value));
            },
            nozero: function (element) {
                return (naturalNoZeroRegex.test(element.value));
            },
            url: function (element) {
                return (urlRegex.test(element.value));
            },
            file: function (element, type) {
                if (element.type !== 'file') {
                    return true;
                }

                var ext = element.value.substr((element.value.lastIndexOf('.') + 1)),
                    typeArray = type.split(';'),
                    inArray = false,
                    i = 0,
                    len = typeArray.length;

                for (i; i < len; i++) {
                    if (ext == typeArray[i]) {
                        inArray = true; break;
                    }
                }

                return inArray;
            },
            gt_date: function (element, date) {
                var enteredDate = parseDate(element.value),
                    validDate = parseDate(date);

                if (!validDate || !enteredDate) {
                    return false;
                }

                return enteredDate > validDate;
            },
            lt_date: function (element, date) {
                var enteredDate = parseDate(element.value),
                    validDate = parseDate(date);

                if (!validDate || !enteredDate) {
                    return false;
                }

                return enteredDate < validDate;
            },
            eqgt_date: function (element, date) {
                var enteredDate = parseDate(element.value),
                    validDate = parseDate(date);

                if (!validDate || !enteredDate) {
                    return false;
                }

                return enteredDate >= validDate;
            },
            eqlt_date: function (element, date) {
                var enteredDate = parseDate(element.value),
                    validDate = parseDate(date);

                if (!validDate || !enteredDate) {
                    return false;
                }

                return enteredDate <= validDate;
            },
            regexp: function(element) {
                var regstr = element.getAttribute('data-pattern');
                var regexp =new RegExp(regstr);
                return regexp.test(element.value);
            }
        }
    });

    common.module('Validator', Validator);

    if (typeof define !== 'undefined' && define.amd) {
        define([], function () {
            return Validator;
        });
    }

})(window[LIB_NAME]);

