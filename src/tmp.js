/**
 * @author comahead@gmail.com
 */
;(function (core, global, undefined) {
    var arraySlice = Array.prototype.slice,
        F = function () {
        },
        ignoreNames = ['superclass', 'members', 'statics', 'hooks'];

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

            callParentByName: function (name) {
                var args = arraySlice.call(arguments, 1);
                return supr.prototype[name].apply(this, args);
            }
        });

        if (singleton) {
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

        classSyntax[name].members = function (o) {
            inherits(this.prototype, o, supr);
        };
        attr && classSyntax[name].members.call(classSyntax[name], attr);

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

    core.Class = function (attr) {
        return classExtend.apply(this, attr.$extend || Object);
    };

})(window[LIB_NAME], window);
