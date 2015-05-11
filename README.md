// 자체 프렘웍을 이용한 UI모듈 구현 방법

(function(){
    "use strict"; 
 
    core.ui('Tabs', {    
        // 상속할 부모 클래스
        $extend: core.ui.Component,
        // 리스너 mixin
        $mixins: [core.Listener],
        // static 변수 등록
        $statics: { 
            ON_CHANGED_TAB: 'changedTab' 
        },
        // 싱글톤 여부
        ///// $singleton: true, 
        // jquery 에 바인딩될 이름
        bindjQuery: 'tabs',	// $('#d-tab').tabs({옵션들});
        // 모듈명
        name: 'Tabs', 
        // 기본옵션
        defaults: { 
            selectedIndex: 1
        },
        // 엘리먼트를 자동으로 검색해서 멤버변수로 설정
        selectors: {
            tabs: 'li.tab',     // = this.$tabs = this.$el.find('li.tab');
            contents: 'div.cont'    // = this.$contents = this.$el.find('div.cont');
        },
        // 특정요소에 이벤트 등록
        events: {
            'click li.tab a': 'onTabSelect' 
        },
        // 생성자
        initialize: function (el, options) { 
            var me = this;
 
            if (me.callParent(el, options) === false) {
                return;
            } 
 
            me.select(me.options.selectedIndex);
        },

        onTabSelect: function (e) {
            var me = this, 
                $this = $(e.currentTarget);
 
            me.select($this.parent().index());
        },
 
        select: function (index) {
            var me = this,
                $tabs = me.$tabs,
                $contents = me.$contents; 

            $tabs.filter('.on').removeClass('on').end().eq(index).addClass('on');
            $contents.filter(':visible').hide().end().eq(index).show();
 
            me.trigger(Tabs.ON_CHANGED_TAB, [index]); 
        }
    });
    

    if(typeof define !== 'undefined' && defined.amd){
        define([], function(){
            return Tabs;
        });
    }
 
})();

// 사용예
$(function () {
    // 1. 클래스 객체를 직접 생성
    var tabs = new axl.ui.Tabs('#tab', {
        selectedIndex: 2,	
        on: {					
            'changedTab': function (e, index) {
                alert(index + '번째 탭이 선택되었습니다.');
            }
        }
    });

    tabs.on('changedTab', function (e, index) { 
        alert(index + '번째 탭이 선택되었습니다.');
    });

    $('#tab').on('changedTab', function (e, index) {
        alert(index + '번째 탭이 선택되었습니다.');
    });
    tabs.select(2); 

    // jquery 모듈방식으로 사용
    $('#tabs').tabs({
        // 옵션
        selectedIndex: 2,
        on: {
            // 이벤트 핸들러 등록
            changedTab: function (e, index) {
                alert(index + '번째 탭이 선택되었습니다.');
            }
        }
    });

    $('#tabs').tabs('select', 2);

    require('Tabs', function(Tabs) {
        new Tabs('#d-tab');
    });
});