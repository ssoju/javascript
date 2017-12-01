        extend = (function () { 
            function type(obj, val) {
                return Object.prototype.toString.call(obj).toLowerCase() === '[object ' + val + ']';
            }

            function isPlainObject(value) {
                return value !== null
                    && value !== undefined
                    && type(value, 'object')
                    && value.ownerDocument === undefined;
            } 
            return function (deep, target) {
                var objs;
                if (typeof deep === 'boolean') {
                    objs = [].slice.call(arguments, 2);
                } else {
                    objs = [].slice.call(arguments, 1);
                    target = deep;
                    deep = false;
                }
        
                each(objs, function (obj) {
                    if (!obj) { return; }
                    each(obj, function (val, key) {
                        if (!val) {
                            target[key] = val;
                            return;
                        }
        
                        if (deep === true && (type(val, 'array') || isPlainObject(val))) {
                            //if (deep === true) {
                                if (!target[key]) {
                                    target[key] = type(val, 'array') ? [] : {};
                                }
                                target[key] = extend(deep, target[key], val);
                                return;;
                            //}
                        }
                        target[key] = val;
                    });
                });
                return target;
            }
        })(),
