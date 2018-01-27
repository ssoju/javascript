/**
 * @author comahead@gmail.com
 */
;(function (core, global, undefined) {
    var arraySlice = Array.prototype.slice,
        F = function () {},
        ignoreNames = ['superclass', 'members', 'statics', 'hooks'];

    function wrap(k, fn, supr) {...}
    function inherits(what, o, supr) {...}

    function classExtend(name, attr, parentClass) {
        var supr = parentClass || this, _Class, statics, mixins, singleton, instance, hooks, requires, name, strFunc;

        if (!core.isString(name)) {
            attr = name; name = undefined;
        }
        if (core.isFuunction(attr)) { attr = attr(); }

        !attr.initialize && (attr.initialize = supr.prototype.initialize || function () {});
        function constructor() {
            if (singleton && instance) { return instance; } else { instance = this; }

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

            _Klass = new Function("constructor", "instance",
                strFunc
            )(constructor, instance);

            F.prototype = supr.prototype;
            _Class.superclass = supr.prototype;
            _Class.prototype = new F;

            _Class.extend = classExtend;
            core.extend(_Class.prototype, {
                constructor: _Class,
                destroy: function () {},
                proxy: function (fn) {...},
                callParentByName: function (name) {...}
            });

            if (singleton) {...}

            _Class.hooks = {init: [], initialize: []};
            core.extend(true, classSyntax[name].hooks, supr.hooks);
            hooks && core.each(hooks, function (name, fn) {
                classSyntax[name].hooks(name, fn);
            });


            _Class.mixins = function (o) {...};
            mixins && _Class.mixins.call(_Class, mixins);

            _Class.members = function (o) {
                inherits(this.prototype, o, supr);
            };
            attr && _Class.members.call(_Class, attr);

        _Class.statics = function (o) {
            o = o || {};
            for (var k in o) {
                if (core.array.indexOf(ignoreNames, k) < 0) {
                    this[k] = o[k];
                }
            }
            return this;
        };
        _Class.statics.call(_Class, supr);
        statics && _Class.statics.call(_Class, statics);

        return _Class;
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
