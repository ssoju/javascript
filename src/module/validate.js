/*!
 * @author 김승일(comahead@vi-nyl.com)
*/
(function (undefined) {

    var messages = {
        required: "'[name]'항목은 필수입력 항목입니다.",
        matches: "'[name]'항목은 {0}항목과 동일해야 합니다.",
        email: "'[name]'항목이 이메일 형식에 맞지 않습니다.",
        //emails: "The %s field must contain all valid email addresses.",
        minlength: "'[name]'항목의 최소길이는 {0}입니다.",
        maxlength: "'[name]'항목의 최대길이는 {0}입니다",
        exactlength: "'[name]'항목은 {0}길이여야 합니다.",
        rangelength: "'[name]'항목의 길이가 {0}와 {1}사이여야 합니다.",
        minchecked: "'[name]'항목의 최소 {0}개 이상 체크해 주세요.",
        maxchecked: "'[name]'항목의 최대 {0}개 이하 체크해 주세요.",
        exactchecked: "'[name]'항목은 {0}개 체크해 주세요.",
        rangechecked: "'[name]'항목은 {0}개에서 {1}개 사이에만 체크해 주세요.",
        alpha: "'[name]'항목은 영문자만 유효합니다.",
        alnum: "'[name]'항목은 영문자와 숫자만 유효합니다.",
        numeric: "'[name]'항목은 숫자, ., -만 유효합니다.",
        integer: "'[name]'항목은 -, 숫자만 유효합니다.",
        decimal: "'[name]'항목은 -, ., 숫자만 유효합니다.",
        nozero: "'[name]'항목은 0으로 시작하면 안됩니다.",
        file: "'[name]'항목은 {0}확장자만 유효합니다.",
        url: "url주소 형식이 잘못 되었습니다.",
        tel: "전화번호 형식이 잘못 되었습니다.",
        mobile: "휴대폰번호 형식이 잘못 되었습니다.",
        gt_date: "'[name]'날짜는 '[target_name']날짜보다 이후여야 합니다.",
        lt_date: "'[name]'날짜는 '[target_name']날짜보다 이전이어야 합니다.",
        eqgt_date: "'[name]'날짜는 '[target_name']날짜와 같거나 이후여야 합니다.",
        eqlt_date: "'[name]'날짜는 '[target_name']날짜와 같거나 이전이어야 합니다.",
        regexp: "[data-pattern] 정규식에 안맞습니다."
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
        telRegex = /^\d{2,3}-\d{3,4}-\d{4}$/,
        mobileRegex = /^(010|011|17|018|019)-\d{3,4}-\d{4}$/,
        urlRegex = /^((http|https):\/\/(\w+:{0,1}\w*@)?(\S+)|)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/,
        dateRegex = /^\d{4}-\d{1,2}-\d{1,2}/;


    function typeName(el) {
        return (el.type||'').toLowerCase();
    }

    function tagName(el) {
        return (el.tagName||'').toLowerCase();
    }

    function getValue(el){
        if(typeof el === 'string') { return el; }

        var type = typeName(el),
            items;
        if(type === 'checkbox' || type === 'radio') {
            items = [].slice.call(el.form.elements[el.name]);
            for(var i = -1, item; item = items[++i]; ){
                if(item.checked === true) { return item.value; }
            }
            return '';
        }
        return el.value.trim();
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

    function getInputName(el) {
        var x;
        if(x = el.getAttribute('data-name')) {
            return x;
        }
        if(x = el.getAttribute('id')) {
            if(x = $('label[for='+x+']')[0]) {
                return x.innerText;
            }
        }
        return el.name;
    }

    function byteLength(value) {
        var l = 0;
        for (var i=0, len = value.length; i < len; i++) {
            l += (value.charCodeAt(i) > 255) ? 2 : 1;
        }
        return l;
    }

    var FormValidator = function (el, options) {
        var me = this;
        me.errors = [];
        me.form = el;
        me.messages = messages;
        me.befores = {};
        me.afters = {};
        me.options = options || {};

        $.each(me.options.validBefore||{}, function(k, v) {
            me.addValidBefore(k, v);
        });

        $.each(me.options.validAfter||{}, function(k, v) {
            me.addValidAfter(k, v);
        });

        me.form.addEventListener('submit', function(e) {
            if(!me.run()){
                e.preventDefault();
                return false;
            }
        })
    };

    $.extend(FormValidator, {
        rules: {
            required: function (element) {
                var value = getValue(element);
                return !!(value);
            },
            match: function (element, matchName) {
                var el = this.form[matchName];

                if (el) {
                    return element.value === getValue(el);
                }

                return false;
            },
            email: function (element, other) {
                var val = getValue(element), domain;
                if(other && (domain = element.form.elements[other])) {
                    val += '@' + getValue(domain);
                }
                return emailRegex.test(val);
            },
            tel: function (element, tel2name, tel3name) {
                var val = getValue(element);
                if(arguments.length > 1) {
                    val += '-' + getValue(element.form[tel2name]) + '-' + getValue(element.form[tel3name]);
                }
                return telRegex.test(val);
            },
            mobile: function (element, tel2name, tel3name) {
                var val = getValue(element);
                if(arguments.length > 1) {
                    val += '-' + getValue(element.form[tel2name]) + '-' + getValue(element.form[tel3name]);
                }
                return mobileRegex.test(val);
            },
            minlength: function (element, length) {
                return (getValue(element).length >= parseInt(length, 10));
            },
            maxlength: function (element, length) {
                return (getValue(element).length <= parseInt(length, 10));
            },
            exactlength: function (element, length) {
                return (getValue(element).length === length|0);
            },
            rangelength: function(element, min, max){
                var len = getValue(element).length;
                return len >= min && len <= max;
            },
            minbyte: function (element, length) {
                return (byteLength(getValue(element)) >= parseInt(length, 10));
            },
            maxbyte: function (element, length) {
                return (byteLength(getValue(element)) <= parseInt(length, 10));
            },
            exactbyte: function (element, length) {
                return (byteLength(getValue(element)) === length|0);
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
                if(typeof max === 'undefined'){ max = min; }
                return cnt >= min && cnt <= max;
            },
            lt: function (element, param) {
                if (!decimalRegex.test(getValue(element))) {
                    return false;
                }

                return (parseFloat(element.value) > parseFloat(param));
            },
            gt: function (element, param) {
                if (!decimalRegex.test(getValue(element))) {
                    return false;
                }

                return (parseFloat(getValue(element)) < parseFloat(param));
            },
            alpha: function (element) {
                return (alphaRegex.test(getValue(element)));
            },
            alnum: function (element) {
                return (alphaNumericRegex.test(getValue(element)));
            },
            numeric: function (element) {
                return (numericRegex.test(getValue(element)));
            },
            integer: function (element) {
                return (integerRegex.test(getValue(element)));
            },
            decimal: function (element) {
                return (decimalRegex.test(getValue(element)));
            },
            nozero: function (element) {
                return (naturalNoZeroRegex.test(getValue(element)));
            },
            url: function (element) {
                return (urlRegex.test(getValue(element)));
            },
            file: function (element, type) {
                if (element.type !== 'file') {
                    return true;
                }

                var ext = element.value.substr((getValue(element).lastIndexOf('.') + 1)),
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
            date: function(element, format) {
                return dateRegex.test(getValue(element));
            },
            gt_date: function (element, date) {
                var enteredDate = parseDate(getValue(element)),
                    validDate = parseDate(element.form[date] ? getValue(element.form[date]) : date);

                if (!validDate || !enteredDate) {
                    return false;
                }
                if(enteredDate > validDate) { return true; }
                else {
                    element.form[date] && (this.currentTarget = element.form[date]);
                    return false;
                }
            },
            lt_date: function (element, date) {
                var enteredDate = parseDate(getValue(element)),
                    validDate = parseDate(element.form[date] ? getValue(element.form[date]) : date);

                if (!validDate || !enteredDate) {
                    return false;
                }

                if(enteredDate < validDate) { return true; }
                else {
                    element.form[date] && (this.currentTarget = element.form[date]);
                    return false;
                }
            },
            eqgt_date: function (element, date) {
                var enteredDate = parseDate(getValue(element)),
                    validDate = parseDate(element.form[date] ? getValue(element.form[date]) : date);

                if (!validDate || !enteredDate) {
                    return false;
                }

                if(enteredDate >= validDate) { return true; }
                else {
                    element.form[date] && (this.currentTarget = element.form[date]);
                    return false;
                }
            },
            eqlt_date: function (element, date) {
                var enteredDate = parseDate(getValue(element)),
                    validDate = parseDate(element.form[date] ? getValue(element.form[date]) : date);

                if (!validDate || !enteredDate) {
                    return false;
                }

                if(enteredDate <= validDate) { return true; }
                else {
                    element.form[date] && (this.currentTarget = element.form[date]);
                    return false;
                }
            },
            regexp: function(element) {
                var regstr = element.getAttribute('data-pattern');
                var regexp =new RegExp(regstr);
                return regexp.test(getValue(element));
            }
        },
        addRule: function(name, handler) {
            this.rules[name] = handler;
        }
    });

    FormValidator.prototype = {
        constructor: FormValidator,
        setMessage: function (rule, message) {
            this.messages[rule] = message;

            return this;
        },
        addValidBefore: function(name, handler) {
            if (name && typeof this.form[name] && handler && typeof handler === 'function') {
                this.befores[name] = handler;
            }
        },
        addValidAfter: function(name, handler) {
            if (name && typeof this.form[name] && handler && typeof handler === 'function') {
                this.afters[name] = handler;
            }
        },
        run: function () {
            if(!this._validateForm()){
                this._showError();
            }
        },
        _normalizeMessage: function(el, msg, params) {
            return msg && msg.replace(/\[name\]/, function(v, s) {
                    return getInputName(el);
                }).replace(/\{([a-z0-9-]+)\}/g, function(v, s) {
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
                        params: matches[2] ? (matches[2]||'').split(/,\s*/g).map(function(val) {
                            return typeof val == 'number' ? val|0 : val;
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
                if(!rules['required'] && !element.value.trim()){ continue; }
                if(fn = FormValidator.rules[name]) {
                    delete me['currentTarget'];
                    if(!fn.apply(me, [element].concat(rules[name].params))){
                        me.errors.push({
                            rule: name,
                            el: element,
                            target: me.currentTarget,
                            params: rules[name].params
                        });
                        return false;
                    }
                } else {
                    throw new Error('[Validator] '+name+'는 지원하지 않는 규칙입니다.');
                }
            }

            return true;
        }
    };

    window.FormValidator = FormValidator;
    $.fn.validator = function(options){
        return this.each(function() {
            new FormValidator(this, options);
        });
    };
})();