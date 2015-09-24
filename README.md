
official site: http://framework.hanulo.com/index.html

email: comahead@gmail.com

framework core: https://github.com/ssoju/javascript/blob/master/src/axl.js

ui modules by framework: https://github.com/ssoju/javascript/tree/master/src/ui

chat sample: https://github.com/ssoju/javascript-chat

contract sample: https://github.com/ssoju/javascript-contacts

react sample: https://github.com/ssoju/reactjs

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

