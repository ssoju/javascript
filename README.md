
    "use strict"; // 암묵적인 자바스크립트 에러를 더 세밀하게 짚어준다.
 
    // 전역공간이 더럽히거나, 함수나 변수이름의 충돌을 미연에 방지하기 위해,
    // 되도록이면 즉시실행 함수을 만들어서 그 내부에 코드를 작성하는걸 추천한다.
 
    // UI모듈 작성 방법: 탭컨트롤을 예로 들어 설명하겠습니다.
 
    core.ui('Tabs', {    // common.ui함수를 이용하면, 보다 쉽고 편리하게 View에서 상속 받은 새로운 UI클래스을 작성할 수 있다.
        // $extend, $mixins, $statics, $singleton 같이 $로 시작하는 속성명은 Class 생성과 관련된 옵션이다.
        $mixins: [core.EventListener],    // 다른 모듈의 기능을 현재 모듈에 붙일 때 사용(기본적으로 View클래스에서 이벤트기능을 붙여주므로 EventListener는 빌드할 필요없다)
        $statics: { // 클래스 변수 : 사용예) common.ui.Tabs.ON_CHANGED_TAB 으로 접근할 수 있다.
            ON_CHANGED_TAB: 'changedTab' // 이 UI모듈에서 발생되는 커스텀 이벤트명
        },
        ///// $singleton: true,  // 싱글톤 여부
 
        bindjQuery: 'tabs',	// 해당 모듈을 jQuery 플러그인방식으로 사용할 수 있도록 설정하는 옵션이다. 예) $('#d-tab').tabs({옵션들});  // 플러그인방식
        // 이하 속성부터는 Tabs.prototype에 붙게된다
        // 단, name, defaults, selectors, events 속성은 부모쿨래스인 View 클래스에서 처리해주는 옵션들이다.
        name: 'Tabs', // 클래스의 이름
        defaults: { // 해당모듈의 기본 옵션: 생성자(initialize)로 넘어온 options과 병합하여 this.options에 세팅된다.
            selectedIndex: 1
        },
        selectors: { // 주어진 이름과 셀렉터를 바탕으로 요소를 검색하여 클래스의 멤버변수로 세팅된다.
            tabs: 'li.tab', // 멤버함수 내에서 this.$tabs 로 접근 -> this.$tabs = this.$el.find('li.tab'); 를 자동화시킨 거라고 보면 된다
            contents: 'div.cont' // 멤버함수 내에서 this.$contents 로 접근
        },
        events: {
            'click li.tab a': 'onTabSelect' // 'li.tab a'를 'click'할 때 클래스의 메소드인 'onTabSelect'함수를 호출하도록 설정. (인라인 함수도 가능)
            // 즉, this.$el.find('li.tab a').on('click', this.onTabSelect.bind(this)); 코드를 자동화 시킨것이다.
            // 단, context는 해당 노드가 아닌 클래스 인스턴스가 된다.
        },
        // 생성자: jquery의 플러그인작성 스펙과 호환이 되도록, 이와 같은 인자(el, options)를 가진 함수로 작성해주는 게 좋다.
        // $('#tab').tabs({selectedIndex:1});처럼 jQuery 플러그인방식으로 호출하였을 때, el에는 #tab이 options에는 {sel...}가 넘어온다.
        // 이는 new common.ui.Tab('#tab', {selectedIndex:1}); 처럼 하는 것과 동일하다.
        initialize: function (el, options) { 
            var me = this;
 
            // common.ui.View를 상속받은 모듈은
            // 반드시 부모생성자를 호출해주어야 다음과 같은 편리한 기능들을 처리해준다.
            // el을 this.$el에 설정해준다.( this.$el = $(el); )
            // defaults와 options(우선권 높음)을 병합하여 me.options에 세팅. ( this.options = $.extend(true, {}, defaults, options); )
            // selectors에 해당하는 엘리먼트들을 검색하여 주어진 이름의 멤버변수들에 설정
            // events에 지정된 핸들러들을 바인딩
            // 만약 부모 생성자에서 false가 반환된다면, 이미 해당 엘리먼트에 현재 UI모듈이 빌드되었거나,
            // el노드가 페이지에 없다거나 disabled 상태임을 의미하므로, 모듈을 빌드하지 않고 빠져나가야 한다.
            if (me.callParent(el, options) === false) {
                return;
            } 
            //또는 if(me.suprMethod('initialize', el, options) === false){ return; } 처럼 부모 클래스의 메소드를 명시적으로도 호출가능 함 
 
            me.select(me.options.selectedIndex);
        },
        // 옵션의 events속성에 의해 바인딩된 핸들러
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
            $tabs.filter('.on').removeClass('on').end().eq(index).addClass('on');
            $contents.filter(':visible').hide().end().eq(index).show();
 
            me.trigger(Tabs.ON_CHANGED_TAB, [index]); // 탭이 변경되었을 때 changedTab 이벤트를 날림.
        }
    });
    
    // requirejs를 지원하기 위해 define함수가 존재할 경우 모듈 등록
    if(typeof define !== 'undefined' && defined.amd){
        define([], function(){
            return Tabs;
        });
    }
 

        
사용 예제
        // 실제 사용 예제 ///////////////////////
        
        $(function () {
            // 1. 클래스 객체를 직접 생성
            var tabs = new common.ui.Tabs('#tab', {	// 첫번째 인자를 $('#tab'), '#tab', document.getElementById('tab') 중 아무거나 넘겨도 된다.
                selectedIndex: 2,		// 옵션
                on: {						// 이벤트 바인딩
                    'changedTab': function (e, index) { // 이벤트를 바인딩하는 첫번째 방법
                        alert(index + '번째 탭이 선택되었습니다.');
                    }
                }
            });
 
            tabs.on('changedTab', function (e, index) { // 이벤트를 바인딩하는 두번째 방법
                alert(index + '번째 탭이 선택되었습니다.');
            });
 
            $('#tab').on('changedTab', function (e, index) { // 이벤트를 바인딩하는 세번째 방법
                alert(index + '번째 탭이 선택되었습니다.');
            });
            tabs.select(2); // changedTab 이벤트에 총 세번 바인딩했으므로 alert이 세번 출력된다.
 
            // 2. 혹은 jquery 플러그인 방식으로 호출(bindjQuery옵션이 지정된 경우에만 사용 가능) ---------------------------------------
            $('#tabs').tabs({
                selectedIndex: 2,
                on: {
                    changedTab: function (e, index) {
                        alert(index + '번째 탭이 선택되었습니다.');
                    }
                }
            });
 
            // jquery플러그인 방식으로 사용했을 때, Tabs의 멤버함수 호출법
            $('#tabs').tabs('select', 2);
 
 
 
            // 3. requirejs 을 통해서 사용 ---------------------------------------------------------------------
            require('Tabs', function(Tabs) {
                new Tabs('#d-tab');
            });
        });
        
