
official site: http://framework.hanulo.com/index.html

email: comahead@gmail.com

framework core: https://github.com/ssoju/javascript/blob/master/src/axl.js

ui modules by framework: https://github.com/ssoju/javascript/tree/master/src/ui

chat sample: https://github.com/ssoju/javascript-chat

contract sample: https://github.com/ssoju/javascript-contacts

reactjs sample: https://github.com/ssoju/reactjs

angularjs sample: https://github.com/ssoju/angular-comment

create Class: 
```javascript
    ...
    var View = axl.BaseClass.extend({
        defaults: {},
        selectors: {},
        events: {},
        initialize: function (el, oprions) {
           var me = this;
           
           if (!axl.dom.contains(document, el)) { return false; }
           
           me.uid = axl.getUniqueId();
           me.moduleName = 'view';
           
           me.el = el;
           me.$el = $(el);
           me.options = axl.extend({}, me.defaults, options);
           
           axl.each(me.selectors, function (item, key) {
              me['$' + key] = me.$el.find(item);    
           });
           
           axl.each(me.events, function (item, key) {
              var pairs = item.split(' ');
              me.$el.on(pairs[0], pairs[1], typeof key === 'string' ? me[key] : key);
           });
           
           axl.each(['trigger', 'triggerHandler', 'on', 'off'], function (item, key) {
              me[key] = function () {
                 $.fn[key].apply(me.$el, [].slice.call(arguments, 0));
              };
           });
        },
        release: function () {
           var me = this;
           
           me.$el.off().removeData();
           $(document).off('.'+me.uid);
           $(window).off('.'+me.uid);
        }
    });
    
    
    var Carousel = View.extend({
        defaults: {
            autoPlay: true
        },
        selectors: {
            btnNext: '.btn-next',
            btnPrev: '.btn-prev',
            btnIndicators: '.btn-indocator'
        },
        events: {
            'click .btn-prev': 'prev',
            'click .btn-next': 'next'
        },
        initialize: function (el, options) {
            var me = this;
            if (me.supr(el, options) === false){ return; }
            
            me._bindEvent();
            if (me.options.autoPlay === true) {
                me.timer = setInterval(function (){
                    me.next();
                }, 1000);
            }
        },
        _bindEvent: function () {
            var me = this;
            
            me.on('mouseenter mouseleave', function (e) {
                me[e.type === 'mouseenter' ? 'stop' : 'play']();
            });
            
        },
        prev: function () {
           ...
        },
        next: function () {
           ...
        },
        play: function () {
           ...
        },
        stop: function () {
           ...
        },
        release: function () {
            var me = this;
            clearInterval(me.timer);
            me.supr();
        }
    });
    
    var carousel = new Carousel($('#carousel'), {
        autoPlay: false
    });
    carousel.play();
    
    ...
```

memory release code: 
```javascript
    ...
    // 삭제된 엘리먼트에 빌드된 모듈을 메모리에서 해제
    core.ui.uiGarbageClear = function() {
        for (var i = ui.View._instances.length - 1, view; i >= 0; i--) {
            view = ui.View._instances[i];
            if (view.$el && !core.dom.contains(document, view.$el[0])) { // DOM에서 삭제여부 체크
                try {
                    view.release(); // 이벤트 언바인드, 인터벌 중지, 엘리먼트 참조 null 처리 등등 
                    ui.View._instances[i] = view = null;
                    ui.View._instances.splice(i, 1);
                } catch (e) {}
            }
        }
    };
    ...
```

