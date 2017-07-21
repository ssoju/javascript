;(function (core, global, undefined) {
    /**
     * 루트클래스로서, vcui.BaseClass나 vcui.Class를 이용해서 클래스를 구현할 경우 vcui.BaseClass를 상속받게 된다.
     * @class
     * @name vcui.BaseClass
     * @example
     * var Person = vcui.BaseClass.extend({  // 또는 var Person = vcui.Class({ 으로 구현해도 동일하다.
	*	$singleton: true, // 싱글톤 여부
	*	$statics: { // 클래스 속성 및 함수
	*		live: function() {} // Person.live(); 으로 호출
	*	},
	*	$mixins: [Animal, Robot], // 특정 클래스에서 메소드들을 빌려오고자 할 때 해당 클래스를 지정(다중으로도 가능),
	*	initialize: function(name) {
	*		this.name = name;
	*	},
	*	say: function(job) {
	*		alert("I'm Person: " + job);
	*	},
	*	run: function() {
	*		alert("i'm running...");
	*	}
	*`});
     *
	 * // Person에서 상속받아 Man클래스를 구현하는 경우
     * var Man = Person.extend({
	*	initialize: function(name, age) {
	*		this.callParent(name);  // Person(부모클래스)의 initialize메소드를 호출 or this.callParentMethod('initialize', name);
	*		this.age = age;
	*	},
	*	// say를 오버라이딩함
	*	say: function(job) {
	*		this.callParentMethod('say', 'programer'); // 부모클래스의 say 메소드 호출 - 첫번째인자는 메소드명, 두번째부터는 해당 메소드로 전달될 인자

	*		alert("I'm Man: "+ job);
	*	}
	* });
     * var man = new Man('kim', 20);
     * man.say('freeman');  // 결과: alert("I'm Person: programer"); alert("I'm Man: freeman");
     * man.run(); // 결과: alert("i'm running...");
     */


    var arraySlice = Array.prototype.slice,
        F = function () {
        },
        ignoreNames = ['superclass', 'members', 'statics', 'hooks'];

    // 부모클래스의 함수에 접근할 수 있도록 .callParent 속성에 부모함수를 래핑하여 설정
    function wrap(k, fn, supr) {
        return function () {
            var tmp = this.callParent, ret;

            this.callParent = this.callParent = supr.prototype[k];
            ret = undefined;
            try {
                ret = fn.apply(this, arguments);
            } catch (e) {
                console.error(e);
            } finally {
                this.callParent = this.callParent = tmp;
            }
            return ret;
        };
    }

    // 속성 중에 부모클래스에 똑같은 이름의 함수가 있을 경우 래핑처리
    function inherits(what, o, supr) {
        core.each(o, function (v, k) {
            what[k] = core.isFunction(v) && core.isFunction(supr.prototype[k]) ? wrap(k, v, supr) : v;
        });
    }

    var classSyntax = {};
    function classExtend(name, attr, parentClass) {
        var supr = parentClass || this,
            statics, mixins, singleton, instance, hooks, requires, name, strFunc;

        if (!core.type(name, 'string')) {
            attr = name;
            name = undefined;
        }

        if (core.type(attr, 'function')) {
            attr = attr();
        }

        singleton = attr.$singleton || false;
        statics = attr.$statics || false;
        mixins = attr.$mixins || false;
        hooks = attr.$hooks || false;
        requires = attr.$requires || false;
        name = name || attr.$name || 'BaseClass';

        !attr.initialize && (attr.initialize = supr.prototype.initialize || function () {});

        function constructor() {
            if (singleton && instance) {
                return instance;
            } else {
                instance = this;
            }

            var args = arraySlice.call(arguments),
                me = this,
                ctr = me.constructor;

            if (me.initialize) {
                me.initialize.apply(this, args);
            } else {
                supr.prototype.initialize && supr.prototype.initialize.apply(me, args);
            }

            /**if (constructor.hooks) {
                // 페이지상에서 한번만 실행
                if (!ctr.hooks.inited) {
                    ctr.hooks.init && core.each(ctr.hooks.init, function (fn) {
                        fn.call(me);
                    });
                    ctr.hooks.inited = true;
                }

                // 생성때마다 실행
                ctr.hooks.create && core.each(ctr.hooks.create, function (fn) {
                    fn.call(me);
                });
            }**/
        }

        if (!singleton) {
            strFunc = "return function " + name + "() { constructor.apply(this, arguments); }";
        } else {
            strFunc = "return function " + name + "() { if(instance) { return instance; } else { instance = this; } constructor.apply(this, arguments); }";
        }

        classSyntax[name] = new Function("constructor", "instance",
            strFunc
        )(constructor, instance);

        F.prototype = supr.prototype;
        classSyntax[name].superclass = supr.prototype;
        classSyntax[name].prototype = new F;
        /**
         * 해당 클래스에서 상속된 새로운 자식클래스를 생성해주는 함수
         * @function
         * @name vcui.BaseClass.extend
         * @param {object} memthods 메소드모음
         * @return {vcui.BaseClass} 새로운 클래스
         * @example
         * var Child = vcui.BaseClass.extend({
             *     show: function(){
             *         alert('hello');
             *     }
             * });
         *
         * new Child().show();
         */
        classSyntax[name].extend = classExtend;
        core.extend(classSyntax[name].prototype, {
            constructor: classSyntax[name],
            destroy: function () {},
            proxy: function (fn) {
                var me = this;
                if (typeof fn === 'string') {
                    fn = me[fn];
                }
                return function () {
                    return fn.apply(me, arguments);
                };
            },
            /**
             * 메소드내부에서 부모클레스의 메소드를 명시적으로 호출하고자 할 때 사용
             * @function
             * @name vcui.BaseClass#callParentByName
             * @return {*} 해당 부모함수의 반환값
             * @example
             * var Parent = vcui.BaseClass.extend({
             *     show: function(){
             *         alert('parent.show');
             *     }
             * });
             * var Child = Parent.extend({
             *     // override
             *     show: function(){
             *         this.callParent(); // Parent#show()가 호출됨
             *         alert('child.show');
             *     },
             *     display: function(){
             *         this.callParentByName('show'); // 특정 부모함수를 명명해서 호출할 수 도 있음
             *     }
             * });
             * var child = new Child();
             * child.show(); // alert('parent.show'); alert('child.show');
             * child.display(); // alert('parent.show');
             */
            callParentByName: function (name) {
                var args = arraySlice.call(arguments, 1);
                return supr.prototype[name].apply(this, args);
            }
        });

        if (singleton) {
            /**
             * 싱클톤 클래스의 객체를 반환
             * @function
             * @name vcui.BaseClass.getInstance
             * @return {vcui.BaseClass}
             * @example
             * var Child = vcui.BaseClass.extend({
                 *    $singleton: true,
                 *    show: function(){
                 *        alert('hello');
                 *    }
                 * });
             * Child.getInstance().show();
             * Child.getInstance().show();
             */
            classSyntax[name].getInstance = function () {
                var arg = arguments,
                    len = arg.length;
                if (!instance) {
                    switch (true) {
                        case !len:
                            instance = new classSyntax[name];
                            break;
                        case len === 1:
                            instance = new classSyntax[name](arg[0]);
                            break;
                        case len === 2:
                            instance = new classSyntax[name](arg[0], arg[1]);
                            break;
                        default:
                            instance = new classSyntax[name](arg[0], arg[1], arg[2]);
                            break;
                    }
                }
                return instance;
            };
        }

        /**
         * 해당 클래스의 객체가 생성될 때 hook를 등록하는 클래스함수
         * @function
         * @name vcui.BaseClass.hooks
         * @param {string} name 훅 이름('init' 는 처음에 한번만 실행, 'create' 는 객체가 생성될 때마다 실행)
         * @param {function} func 실행할 훅 함수
         * @example
         * var Child = vcui.BaseClass.extend({
             *     show: function(){
             *         alert('hello');
             *     }
             * });
         * Child.hooks('init', function(){
             *     alert('초기화');
             * });
         * Child.hooks('create', function(){
             *     alert('객체생성');
             * });
         *
         * new Child(); // alert('초기화'); alert('객체생성');
         * new Child(); // alert('객체생성');
         */
        classSyntax[name].hooks = {init: [], initialize: []};
        core.extend(true, classSyntax[name].hooks, supr.hooks);
        hooks && core.each(hooks, function (name, fn) {
            classSyntax[name].hooks(name, fn);
        });


        classSyntax[name].mixins = function (o) {
            var me = this;
            if (!o.push) {
                o = [o];
            }
            var proto = me.prototype;
            core.each(o, function (mixObj, i) {
                if (!mixObj) {
                    return;
                }
                core.each(mixObj, function (fn, key) {
                    if (key === 'build' && me.hooks) {
                        me.hooks.init.push(fn);
                    } else if (key === 'create' && me.hooks) {
                        me.hooks.create.push(fn);
                    } else {
                        proto[key] = fn;
                    }
                });
            });
        };
        mixins && classSyntax[name].mixins.call(classSyntax[name], mixins);

        /**
         * 이미 존재하는 클래스에 메소드 추가
         * @function
         * @name vcui.BaseClass.members
         * @param o {object} methods 메소드 모음 객체
         * @example
         * var Parent = vcui.BaseClass.extend({});
         * Parent.members({
             *     show: function(){
             *         alert('hello');
             *     }
             * });
         * new Parent().show();
         */
        classSyntax[name].members = function (o) {
            inherits(this.prototype, o, supr);
        };
        attr && classSyntax[name].members.call(classSyntax[name], attr);

        /**
         * 이미 존재하는 클래스에 정적메소드 추가
         * @function
         * @name vcui.BaseClass.members
         * @param o {object} methods 메소드 모음 객체
         * @example
         * var Parent = vcui.BaseClass.extend({});
         * Parent.statics({
             *     show: function(){
             *         alert('hello');
             *     }
             * });
         * Parent.show();
         */
        classSyntax[name].statics = function (o) {
            o = o || {};
            for (var k in o) {
                if (core.array.indexOf(ignoreNames, k) < 0) {
                    this[k] = o[k];
                }
            }
            return this;
        };
        classSyntax[name].statics.call(classSyntax[name], supr);
        statics && classSyntax[name].statics.call(classSyntax[name], statics);

        return classSyntax[name];
    }

    var BaseClass = function () {};
    BaseClass.extend = classExtend;
    core.extend(BaseClass.prototype, {
        constructor: BaseClass,
        initialize: function () {},
        destroy: function () {},
        proxy: function (fn) {
            return fn.bind(this);
        }
    });
    core.BaseClass = BaseClass;


    /**
     * 클래스를 생성해주는 함수(vcui.BaseClass.extend 별칭)
     * @param {object} attr 메소드 모음 객체
     * @returns {vcui.BaseClass} 새로운 객체
     * @example
     * var Parent = vcui.Class({
         *     show: function(){
         *         alert('parent.show');
         *     }
         * });
     * var Child = vcui.Class({
         *     $extend: Parent, // 부모클래스
         *     run: function(){
         *          alert('child.run');
         *     }
         * });
     * new Child().show();
     * new Child().run();
     */
    core.Class = function (attr) {
        return classExtend.apply(this, attr.$extend || Object);
    };

})(window[LIB_NAME], window);