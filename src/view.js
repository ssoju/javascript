/**
 * @author comahead@gmail.com
 */
;(function ($, core, global, undefined) {
    var arraySlice = Array.prototype.slice;
    var doc = global.document;

// obj가 객체가 아닌 함수형일 때 함수를 실행한 값을 반환
    var execObject = function (obj, ctx) {
        return core.type(obj, 'function') ? obj.call(ctx) : obj;
    };

//
    function eventHandling(inst, type, isNorm, args) {
        isNorm && (args[0] = inst._generateEventNS(args[0]));
        inst.$el[type].apply(inst.$el, args);

        return inst;
    }

    /**
     * 모든 UI요소 클래스의 최상위 클래스로써, UI클래스를 작성함에 있어서 편리한 기능을 제공해준다.
     * @class
     * @name vcui.ui.View
     */
    var View = core.BaseClass.extend(/** @lends vcui.ui.View# */{
        $name: 'View',
        $statics: {
            _instances: [] // 모든 인스턴스를 갖고 있는다..
        },

        /**
         * this.$el 를 root로 하여 하위에 존재하는 엘리먼트를 검색
         * @param {string} selector 셀렉터
         * @param {string} [parent] 상위요소
         * @returns {jQuery} this.$el 하위에서 selector에 해당하는 엘리먼트들
         * @example
         * var $btn = this.$('button');
         */
        $: function (selector, parent) {
            if (!this.$el) {
                return $();
            }
            return this.$el.find.apply(this.$el, arguments);
        },

        /**
         * 해당 엘리먼트에 빌드된 클래스 인스턴스를 반환
         * @return {klass} 해당 인스턴스
         * @example
         * var tab = $('div').Tabs('instance');
         */
        instance: function () {
            return this;
        },

        /**
         * 해당 클래스의 소속 엘리먼트를 반환
         * @return {jQuery} 해당 DOM 엘리먼트
         * @example
         * var tab = new Tab('#tab');
         * tab.getElement().hide();
         */
        getElement: function () {
            return this.$el;
        },


        /**
         * 생성자
         * @param {String|Element|jQuery} el 해당 엘리먼트(노드, id, jQuery 어떤 형식이든 상관없다)
         * @param {object} options 옵션값
         * @return {Object|boolean} false 가 반환되면, 이미 해당 엘리먼트에 해당 모듈이 빌드되어 있거나 disabled 상태임을 의미한다.
         */
        initialize: function (el, options) {
            options || (options = {});

            var me = this,
                moduleName;

            if (!me.name) {
                throw new Error('[ui.View] 클래스의 이름이 없습니다');
            }

            moduleName = me.moduleName = core.string.toFirstLower(me.name);
            me.$el = el instanceof $ ? el : $(el);

            if (!el) {
                return false;
            }

            // dom 에 존재하는가
            if (!$.contains(doc, me.$el[0])) {
                return false;
            }

            View._instances.push(me);

            me.el = me.$el[0]; // 원래 엘리먼트도 변수에 설정
            me.options = $.extend(true, {}, me.constructor.superclass.defaults, me.defaults, me.$el.data(), options); // 옵션 병합
            me.cid = moduleName + '_' + core.nextSeq(); // 객체 고유 키
            me.eventNS = '.' + me.cid;
            me.state = {
                disabled: false,
                readonly: false,
                visible: true
            };

            me.updateSelectors();
            me._bindOptionEvents();
        },

        /**
         * 옵션으로 넘어온 이벤트들을 바인딩함
         * @private
         */
        _bindOptionEvents: function () {
            var me = this,
                eventPattern = /^([a-z]+) ?([^$]*)$/i;

            // events 속성 처리
            // events: {
            //	'click ul>li.item': 'onItemClick', //=> this.$el.on('click', 'ul>li.item', this.onItemClick); 으로 변환
            // }
            me.options.events = core.extend({},
                execObject(me.events, me),
                execObject(me.options.events, me));

            core.each(me.options.events, function (value, key) {
                var m;
                if (!(m = key.match(eventPattern))) {
                    return false;
                }

                var name = m[1],
                    selector = m[2] || '',
                    args = [name],
                    func = core.type(value, 'function') ? value : (core.type(me[value], 'function') ? me[value] : core.emptyFn);

                if (selector) {
                    args[args.length] = $.trim(selector);
                }

                // this를 UI클래스의 인스턴스로 설정
                args[args.length] = function () {
                    func.apply(me, arguments);
                };
                me.on.apply(me, args);
            });

            // options.on에 지정한 이벤트들을 클래스에 바인딩
            me.options.on && core.each(me.options.on, function (value, key) {
                // this는 이벤트가 발생한 엘리먼트이다
                me.on(key, value);
            });
        },

        /**
         * this.selectors를 기반으로 엘리먼트를 조회해서 멤버변수에 셋팅
         * @returns {vcui.ui.View}
         * @example
         * var Tab = vcui.ui.View.extend({
         *     selectors: { // 객체가 생성될 때 주어진 요소를 검색해서 멤버변수로 셋팅해주는 옵션
         *        btns: '>li>a',
         *        contents: '>li>div'
         *     },
         *     // ...         *
         * });
         * var tab = new Tab('#js-tab');
         * // 객체가 생성된 다음에 DOM이 동적으로 변경되었다면
         * tab.updateSelectors(); // 를 호출해줌으로써 다시 찾은 다음 멤버변수에 셋팅해준다.
         */
        updateSelectors: function () {
            var me = this;
            // selectors 속성 처리
            me.selectors = core.extend({},
                execObject(me.constructor.superclass.selectors, me),
                execObject(me.selectors, me),
                execObject(me.options.selectors, me));

            core.each(me.selectors, function (value, key) {
                //if (!value) { return; }

                if (typeof value === 'string') {
                    me['$' + key] = me.$el.find(value);
                } else if (value instanceof $) {
                    me['$' + key] = value;
                } else {
                    me['$' + key] = $(value);
                }
                // me.ui[key] = me['$' + key];
            });

            return me;
        },

        /**
         * 옵션 설정함수
         *
         * @param {string} name 옵션명
         * @param {*} value 옵션값
         * @returns {vcui.ui.View} chaining
         * @fires vcui.ui.View#optionchange
         * @example
         * var tab = new Tab('#tab');
         * tab.on('optionchange', function(e, data){
         *     alert('옵션이 변경됨(옵션명:'+data.name+', 옵션값:'+data.value);
         * });
         *
         * tab.setOption('selectedIndex', 2); // alert('옵션이 변경됨(옵션명: selectedIndex, 옵션값: 2);
         */
        setOption: function (name, value) {
            this.options[name] = value;
            /**
             * 옵션이 변경됐을 때 발생
             * @event vcui.ui.View#optionchange
             * @type {object}
             * @property {string} name 옵션명
             * @property {*} value 옵션명
             */
            this.triggerHandler('optionchange', {name: name, value: value});
            return this;
        },

        /**
         * 옵션값 반환함수
         *
         * @param {string} name 옵션명
         * @param {*} def 옵션값이 없을 경우 기본값
         * @return {*} 옵션값
         * @example
         * var tab = new Tab('#tab');
         * tab.getOption('selectedIndex'); // 2
         */
        getOption: function (name, def) {
            return (name in this.options && this.options[name]) || def;
        },

        /**
         * 인자수에 따라 옵션값을 설정하거나 반환해주는 함수
         *
         * @param {string} name 옵션명
         * @param {*} [value] 옵션값: 없을 경우 name에 해당하는 값을 반환
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
         * 이벤트명에 현재 클래스 고유의 네임스페이스를 붙여서 반환 (ex: 'click mousedown' -> 'click.MyClassName mousedown.MyClassName')
         * @private
         * @param {String|$.Event} en 네임스페이스가 없는 이벤트명
         * @return {string} 네임스페이스가 붙어진 이벤트명
         */
        _generateEventNS: function (en) {
            if (en instanceof $.Event && en.type.indexOf('.') === -1) {
                en.type = en.type + this.eventNS;
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
                    tmp.push(name + me.eventNS);
                } else {
                    tmp.push(name);
                }
            }
            return tmp.join(' ');
        },

        /**
         * 현재 클래스의 이벤트네임스페이스를 반환
         * @param {string} [eventName] 이벤트명
         * @return {string} 이벤트 네임스페이스
         * @example
         * var en = tab.makeEventNS('click mousedown');
         */
        makeEventNS: function (en) {
            if (en) {
                var pairs = en.split(' '),
                    tmp = [];
                for (var i = -1, pair; pair = pairs[++i];) {
                    tmp.push(pair + this.eventNS);
                }
                return tmp.join(' ');
            }
            return this.eventNS;
        },

        getEventNS: function () {
          return this.eventNS;
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
         * me.$el에 이벤트 핸들러를 바인딩
         * @param {string} name 이벤트명
         * @param {string} [selector] 타겟
         * @param {eventCallback} handler 핸들러
         * @returns {vcui.ui.View} chaining
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
         * me.$el에 등록된 이벤트 핸들러를 언바인딩
         * @param {string} name 이벤트명
         * @param {eventCallback} [handler] 핸들러
         * @returns {vcui.ui.View} chaining
         * @example
         * var tab = new Tab('#tab');
         * tab.off('tabchanged');
         */
        off: function () {
            return eventHandling(this, 'off', false, arraySlice.call(arguments));
        },

        /**
         * me.$el에 일회용 이벤트 핸들러를 바인딩
         * @param {string} name 이벤트명
         * @param {string} [selector] 타겟
         * @param {eventCallback} handler 핸들러
         * @returns {vcui.ui.View} chaining
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
         * me.$el에 등록된 이벤트를 실행
         * @param {string} name 이벤트명
         * @param {*} data 데이타
         * @return {vcui.ui.View} chaining
         * @example
         * var tab = new Tab('#tab');
         * tab.trigger('tabchanged', {selectedIndex: 1});
         */
        trigger: function () {
            return eventHandling(this, 'trigger', false, arraySlice.call(arguments));
        },

        /**
         * 커스텀 이벤트 발생기(주어진 이벤트명 앞에 모듈명이 자동으로 붙는다)<br>
         *     this.customTrigger('expand'); // this.trigger('accordionexpand') 으로 변환
         * @param {string} name 이벤트명
         * @param {*} data 데이타
         * @return {vcui.ui.View} chaining
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
         * me.$el에 등록된 이벤트 핸들러를 실행(실제 이벤트는 발생안하고 핸들러 함수만 실행)
         * @param {string} name 이벤트명
         * @param {*} data 데이타
         * @return {vcui.ui.View} chaining
         * @example
         * var tab = new Tab('#tab');
         * tab.triggerHandler('tabchanged', {selectedIndex: 1});
         */
        triggerHandler: function () {
            return eventHandling(this, 'triggerHandler', false, arraySlice.call(arguments));
        },

        /**
         * 파괴자
         */
        destroy: function () {
            var me = this;

            me.triggerHandler('destroy');
            me.$el.off(me.eventNS);
            me.$el.removeData('ui_' + me.moduleName);
            $(global).off(me.getEventNS());
            $(document).off(me.getEventNS());

            // me에 등록된 엘리먼트들의 연결고리를 해제(메모리 해제대상)
            core.each(me, function (item, key) {
                if (key.substr(0, 1) === '$') {
                    me[key] = null;
                    delete me[key];
                }
            });
            me.el = null;

            core.ui.View._instance = core.array.remove(core.ui.View._instances, me);
        },
    });

    /**
     * @function
     * @description ui 모듈 생성 함수
     * @name vcui.ui
     * @param {string} name UI 모듈명
     * @param {vcui.Class} [supr] 부모 클래스
     * @param {object} props 클래스 속성
     * @return {vcui.Class}
     */
    var ui = core.ui = function (name, supr, attr) {
        var bindName, cls = {};

        if (core.ui[name]) {
            return core.ui[name];
        }

        if (!attr) {
            attr = supr;
            supr = View;
        }

        if (typeof supr === 'string') {
            supr = ui[supr];
        } else if (attr.$extend) {
            supr = attr.$extend
        }

        if (core.type(attr, 'function')) {
            if (!core.type(attr = attr(supr), 'function')) {
                bindName = attr.bindjQuery;
                cls[name] = supr.extend(name, attr);
            } else {
                cls[name] = attr;
            }
        } else {
            bindName = attr.bindjQuery;
            cls[name] = supr.extend(name, attr);
        }

        cls[name].prototype.name = name;
        ui[name] = cls[name];
        if (bindName) {
            ui.bindjQuery(cls[name], bindName, core.UI_PREFIX);
        }
        return cls[name];
    };

    ui.View = View;

// 삭제된 고아 엘리먼트에 빌드된 모듈을 메모리에서 해제
    ui.unbuildOrphanModules = function (all) {
        if (!ui.View) {
            return;
        }
        for (var i = ui.View._instances.length - 1, view; i >= 0; i--) {
            view = ui.View._instances[i];
            if (all === true || (view.$el && !$.contains(document, view.$el[0]))) {
                try {
                    view.destroy();
                } catch (e) {
                } finally {
                    ui.View._instances[i] = view = null;
                    ui.View._instances.splice(i, 1);
                }
            }
        }
    };

    /**
     * 작성된 UI모듈을 jQuery의 플러그인으로 사용할 수 있도록 바인딩시켜 주는 함수
     *
     * @function
     * @name vcui.ui.bindjQuery
     * @param {vcui.ui.View} Klass 클래스
     * @param {string} name 플러그인명
     *
     * @example
     * // 클래스 정의
     * var Slider = vcui.ui.View({
     *   initialize: function(el, options) { // 생성자의 형식을 반드시 지킬 것..(첫번째 인수: 대상 엘리먼트, 두번째
     *   인수: 옵션값들)
     *   ...
     *   },
     *   ...
     * });
     * vcui.ui.bindjQuery(Slider, 'slider');
     * // 실제 사용시
     * $('#slider').vcSlider({count: 10});
     *
     * // 객체 가져오기 : instance 키워드 사용
     * var slider = $('#slider').vcSlider('instance');
     * slider.move(2); // $('#slider').vcSlider('move', 2); 와 동일
     *
     * // 객체 해제하기 : destroy 키워드 사용
     * $('#slider').vcSlider('destroy');
     *
     * // 옵션 변경하기
     * $('#slider').option('effect', 'fade'); // 이때 optionchange 라는 이벤트가 발생된다.
     */
    ui.bindjQuery = function (Klass, name, prefix) {
        if (!prefix) {
            prefix = core.UI_PREFIX;
        }
        var pluginName = prefix ? prefix + name.substr(0, 1).toUpperCase() + name.substr(1) : name,
            old = $.fn[pluginName];

        $.fn[pluginName] = function (options) {
            var a = arguments,
                args = arraySlice.call(a, 1),
                isMethodCall = typeof options === 'string',
                returnValue = this;

            this.each(function () {
                var $this = $(this),
                    methodValue,
                    instance = $this.data('ui_' + name);

                if (instance && options === 'destroy') {
                    try {
                        instance.destroy();
                        instance = false;
                    } catch (e) {
                    }
                    $this.removeData('ui_' + name);
                    return;
                }

                if (!instance || (a.length === 1 && typeof options !== 'string')) {
                    instance && (instance.destroy(), $this.removeData('ui_' + name));
                    $this.data('ui_' + name, instance = new Klass(this, core.extend({}, $this.data(), options)));
                }

                if (options === 'instance') {
                    returnValue = instance;
                    return false;
                }

                if (isMethodCall && typeof instance[options] === 'function') {
                    if (options.substr(0, 1) === '_') {
                        throw new Error('[bindjQuery] private 메소드는 호출할 수 없습니다.');
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

        // 기존의 모듈로 복구
        $.fn[pluginName].noConflict = function () {
            $.fn[pluginName] = old;
            return this;
        };
    };

    /**
     * UI모듈의 기본옵션을 변경
     * @function
     * @name vcui.ui.setDefaults
     * @param {string} name ui모듈명(네임스페이스 제외)
     * @param {*} opts 옵션값들
     * @example
     * vcui.ui.setDefaults('Tab', {
     *     selectedIndex: 2
     * });
     */
    ui.setDefaults = function (name, opts) {
        $.extend(true, core.ui[name].prototype.defaults, opts);
    };

})(jQuery, window[LIB_NAME], window);
