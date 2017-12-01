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
                
       ////////////////
                
// 더 짧은 거: 이제 더이상 못 줄이겠당.
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
                    if (!obj || (!isPlainObject(obj) && !type(obj, 'array'))) { return; }
                    each(obj, function (val, key) {     
                        var isArr = type(val, 'array');   
                        if (deep === true && (isArr || isPlainObject(val))) {
                            target[key] = extend(deep, target[key] || (target[key] = isArr ? [] : {}), val);
                            return;
                        }
                        target[key] = val;
                    });
                });
                return target;
            }
        })(),

