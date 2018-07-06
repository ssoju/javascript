
## email: comahead@gmail.com

*자바스크립트 UI 프레임웍*

- framework core: https://github.com/ssoju/javascript/blob/master/dist/vcui.js
- ui modules by framework: https://github.com/ssoju/javascript/tree/master/src/ui

*axljs framework 사용법*

```javascript
    // 클래스를 만드는 방식은 두가지가 있다.
    
    // 1. 부모클래스
    var ParentClass = axl.BaseClass.extend({
      // 생성자
      initialize: function() {
      
      },
      ...,
      // 소멸자
      destroy: function() {
      
      }
    });
    
    // or
    var ParentClass = axl.Class({
        ...
    });

    // 2. 자식클래스 정의 ==================================================================
    var ChildClass = ParentClass.extend({
        ...,
        open: function (flag){
            this.callParent(flag); // ParentClass.prototype.open 호출
            ...
        }
    });
    
    // or
    var ChildClass = axl.Class({
        $extend: ParentClass, // 부모클래스 지정
        ...,
        open: function (flag){
            this.callParent(flag); // ParentClass.prototype.open 호출
            ...
        }
    });    
    
    
    var parent = new ParentClass();
    var child = new ChildClass();
    
    parent instanceof ParentClass; // true
    child instanceof ParentClass; // true
    child instanceof ChildClass;  // true
    
    
    
    // UI모듈 만들기 가이드 =====================================================================   
    !(function ($, core, undefined) {
        "use strict"; // 암묵적인 자바스크립트 에러를 더 세밀하게 짚어준다.

        // 전역공간이 더럽히거나, 함수나 변수이름의 충돌을 미연에 방지하기 위해,
        // 되도록이면 즉시실행 함수을 만들어서 그 내부에 코드를 작성하는걸 추천한다.

        // UI모듈 작성 방법: 탭컨트롤을 예로 들어 설명하겠다.
        core.ui('Tabs', {    // vcui.ui('모듈명', {...옵션, 메소드 등...});
            // $extend, $mixins, $statics, $singleton 같이 $로 시작하는 속성명은 Class 생성과 관련된 옵션이다.

            // 이벤트처리 모듈을 믹스인 시키기
            // (여기 있는 EventListener는 부모 클래스인 vcui.ui.View에 포함되어 있기 때문에 굳이 해줄 필요없다)
            $mixins: [core.EventListener],

            // static 변수 설정: 사용예) vcui.ui.Tabs.ON_CHANGED_TAB 으로 접근할 수 있다.
            $statics: {
                :
                ON_CHANGED_TAB: 'tab:change' // 이 UI모듈에서 발생되는 커스텀 이벤트명
            },

            // 싱글톤 클래스 여부
            $singleton: true,

            // 해당 모듈을 jQuery 플러그인방식으로 사용할 수 있도록 설정하는 옵션이다. 예) $('#d-tab').axlTab({옵션들});
            bindjQuery: 'tab',

            // =========================================================================================
            // 이하 속성부터는 Tabs.prototype에 붙게된다
            // name, defaults, selectors, events 속성은 부모쿨래스인 View 클래스에서 처리해주는 속성들이다.

            // 해당모듈의 기본 옵션: 생성자(initialize)로 넘어온 options과 병합하여 this.options에 세팅된다.
            defaults: {
                selectedIndex: 1
            },
            
            // 템플릿 기능 
            templayes: {
                button: '<button type="button">{{text}}</button>'
            }

            // 주어진 이름과 셀렉터를 바탕으로 this.el하위에서 검색하여 클래스의 멤버변수로 세팅된다.
            selectors: {
                tabs: 'li.tab', // 멤버함수 내에서 this.$tabs 로 접근 -> this.$tabs = this.$el.find('li.tab'); 를 자동화시킨 거라고 보면 된다
                contents: 'div.cont' // 멤버함수 내에서 this.$contents 로 접근
            },

            // 내부에 속한 자식 엘리먼트에 이벤트 바인딩
            events: {
                'click li.tab a': 'onTabSelect' 
                // 'li.tab a'를 'click'할 때 클래스의 메소드인 'onTabSelect'함수를 호출하도록 설정. 
                // (즉시실행 함수도 가능)
                // 이는, this.$el.find('li.tab a').on('click', this.onTabSelect.bind(this)); 코드를 자동화 시킨것이다.
                // 단, context는 해당 노드가 아닌 클래스 인스턴스가 된다.
            },

            // $('#tab').axlTab({selectedIndex:1});처럼 jQuery 플러그인방식으로 호출하였을 때, el에는 #tab이 options에는 {sel...}가 넘어온다.
            // or new vcui.ui.Tab('#tab', {selectedIndex:1}); 처럼 캑체를 직접 생성해도 됨.
            initialize: function (el, options) {
                var me = this;

                // vcui.ui.View를 상속받은 모듈은
                // 반드시 부모생성자를 호출해주어야 다음과 같은 편리한 기능들이 붙게된다.
                // el을 this.$el에 설정해준다.(  this.el = el; this.$el = $(el); )
                // defaults와 options(우선권 높음)을 병합하여 me.options에 세팅. ( this.options = $.extend(true, {}, defaults, options); )
                // selectors에 해당하는 엘리먼트들을 검색하여 주어진 이름의 멤버변수들에 설정
                // events에 지정된 핸들러들을 바인딩
                // 만약 부모 생성자에서 false가 반환된다면, 이미 해당 엘리먼트에 현재 UI모듈이 빌드되었거나,
                // el노드가 페이지에 없다거나 disabled 상태임을 의미하므로, 모듈을 빌드하지 않고 빠져나가야 한다.
                if (me.callParent(el, options) === false) {
                    return;
                }
                //또는 if(me.superMethod('initialize', el, options) === false){ return; } 처럼 부모 클래스의 메소드를 명시적으로도 호출가능 함

                me.select(me.options.selectedIndex);
            },

            // events속성에 의해 바인딩된 핸들러
            onTabSelect: function (e) {
                var me = this,
                    $this = $(e.currentTarget);

                me.select($this.parent().index());
            },

            select: function (index) {
                var me = this,
                    $tabs = me.$tabs, // selectors속의 tabs: 'li.tab' 에 의해 설정된 멤버변수
                    $contents = me.$contents; // selectors속의 contents 'div.cont' 에 의해 설정된 멤버변수
                    
                // index에 해당하는 탭 활성화
                $tabs.removeClass('on').eq(index).addClass('on');
                $contents.hide().eq(index).show();

                me.trigger(Tabs.ON_CHANGED_TAB, [index]); // 탭이 변경되었을 때 changedTab 이벤트를 날림.
            }
        });

        // requirejs를 지원하기 위해 define함수가 존재할 경우 모듈 등록
        if(typeof define !== 'undefined' && defined.amd){
            define([], function(){
                return Tabs;
            });
        }

    })(jQuery, window[LIB_NAME]);
    
    // 적용 #1
    $('#tab').axlTab({
        selectedIndex: 1 // or <div id="tab" data-selected-index="1">...</a>
    }).on('tab:change', function (e, data) {
        alert(data.selectedIndex+'가 선택됨');
    });
    
    // 적용 #2
    var tab = new axl.ui.Tab('#tab', {
        selectedIndex: 1,
        on: {
            'tab:change', function (e, data) {
                alert(data.selectedIndex+'가 선택됨');
            }
        }
    });
    tab.on('tab:beforeChange', function (e, data) {
        if (data.selectedIndex === 2) {
            e.preventDefault();
        }
    });
    ...
```


memory release code: UI모듈이 연결된 엘리먼트가 dom에서 제거됐는지 주기적으로 체크하여 메모리에서 자동으로 해제시켜주는 기능. 
페이지가 처음 로딩될 때 프레임웍에서 자동 실행.

```javascript
    ...
    // 삭제된 엘리먼트에 빌드된 모듈을 메모리에서 해제
    core.ui.uiGarbageClear = function() {
        for (var i = ui.View._instances.length - 1, view; i >= 0; i--) {
            view = ui.View._instances[i];
            if (view.$el && !core.dom.contains(document, view.$el[0])) { // DOM에서 삭제여부 체크
                try {
                    view.destroy(); // 이벤트 언바인드, 인터벌 중지, 엘리먼트 참조 null 처리 등등 
                    ui.View._instances[i] = view = null;
                    ui.View._instances.splice(i, 1);
                } catch (e) {}
            }
        }
    };
    ...
```

## diagram
![diagram](https://raw.githubusercontent.com/ssoju/javascript/master/library-diagram.png "")


