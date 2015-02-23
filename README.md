//(function(){
    "use strict"; 
 
    core.ui('Tabs', {    
        $mixins: [core.EventListener],
        $statics: { 
            ON_CHANGED_TAB: 'changedTab' 
        },
        ///// $singleton: true, 
 
        bindjQuery: 'tabs',	// $('#d-tab').tabs({옵션들});
        name: 'Tabs', 
        defaults: { 
            selectedIndex: 1
        },
        selectors: {
            tabs: 'li.tab', 
            contents: 'div.cont'
        },
        events: {
            'click li.tab a': 'onTabSelect' 
        },
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
 
//})();

        $(function () {
            // 1. 클래스 객체를 직접 생성
            var tabs = new common.ui.Tabs('#tab', {
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
 
            $('#tabs').tabs({
                selectedIndex: 2,
                on: {
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
        
