if (!Object.create) {
    Object.create = (function () {
        function F(){}
        return function (prototype) {
            F.prototype = prototype || {};
            return new F;
        };
    }());
}

if (!Function.prototype.bind) {
    /**
     * 함수내의 컨텐스트를 지정
     * @param {object} context 컨텍스트
     * @param {*} ... 두번째 인자부터는 실제로 싱행될 콜백함수로 전달된다.
     * @return {function(context=, ...} 주어진 객체가 켄텍스트로 적용된 함수
     * @example
     * function Test() {
         *      alert(this.name);
         * }.bind({name: 'axl rose'});
     *
     * Test(); -> alert('axl rose');
     */
    Function.prototype.bind = function () {
        var fn = this,
            arraySlice = Array.prototype.slice,
            args = arraySlice.call(arguments),
            object = args.shift();

        return function (context) {
            // bind로 넘어오는 인자와 원본함수의 인자를 병합하여 넘겨줌.
            var local_args = args.concat(arraySlice.call(arguments));
            if (this !== window) {
                local_args.push(this);
            }
            return fn.apply(object, local_args);
        };
    };
}