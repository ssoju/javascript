/**
 * Created by comahead on 2015-05-12.
 * @author comahead@vinylc.com 김승일 쵁임
 */
(function($, core) {
    "use strict";

    var $win = $(window);

    var AdaptiveTemplater = core.ui('AdaptiveTemplater', {
	    bindjQuery: 'adaptiveTemplater',
        defaults: {
	        onLoaded: function () {}
        },
        initialize: function(el, options) {
            var me = this;

	        if (me.supr(el, options) === false) { return; }

	        if (core.is(me.options.data, 'string')) {
		        // 옵션으로 데이타를 받았을 경우
		        me.data = $.parseJSON( $.trim($(me.options.data).html()) );
	        } else {
		        me.data = me.options.data;
	        }


	        me.pcLayout = $(me.options.pcTmpl + '.layout').html();  // pc 레이아웃 템플릿
	        me.mobileLayout = $(me.options.mobileTmpl + '.layout').html();  // mobile 레이아웃 템플릿

	        if (me.options.hasMoreList) {
			    me.pcItem = $(me.options.pcTmpl + '.item').html();  // 리스트형일 경우 pc 아이템 템플릿
			    me.mobileItem = $(me.options.mobileTmpl + '.item').html();  // 리스트형일 경우 mobile 아이템 템플릿
		    }

	        // 초기 렌더링 모드 설정
	        me.mediaMode = core.isMobileMode() ? 'mobile' : 'pc';

	        core.importJs(['libs/jquery.tmpl'], function () {
		        me._render();
		        me._bindEvents();
	        });
        },

	    /**
	     * 이벤트 바인딩
	     */
        _bindEvents: function() {
            var me = this;

	        if (me.options.url) {
		        // 더보기 버튼 클릭시
		        me.on('click', '.ui_list_more', function (e) {
			        e.preventDefault();
					me._renderAjax();
		        });
	        }

		    // 모드가 전환될 때만 새로 렌더링
	        $(window).on('changemediasize', function () {
		        var m = core.isMobileMode() ? 'mobile' : 'pc';
		        if (me.mediaMode != m) {
			        me.mediaMode = m;
			        me._render();
		        }
	        });
        },

	    /**
	     * 렌더링
	     * @private
	     */
	    _render: function () {
		    var me = this,
			    layout;

		    me.$el.empty();		    
		    
		    if (me.mediaMode === 'mobile') {
			    layout = me.mobileLayout;
		    } else {
			    layout = me.pcLayout;
		    }
		    // layout 렌더링
		    $.tmpl(layout, me.data).appendTo(me.$el);
		    
		    
		    
		    // 160610 신규추가건 1개일때 delete버튼 비노출 (김두일)
		    
		    /*
		    
		    var itemCnt = 0;
		    $.each(me.data, function(idx, item){  
		       if(item.cardStatus) itemCnt ++;		       
		    });
            
            if(itemCnt == 1){
                me.$el.find('.ui_card_delete').hide();
            }else{
                me.$el.find('.ui_card_delete').show();
            }
            */
            
            // 160610 신규추가건 1개일때 delete버튼 비노출 (김두일) - end
            
            
		    // 리스트
		    if ( me.options.hasMoreList ) {
			    if (!me.data.list || me.data.list.length === 0) {
				    if (!me.options.url) {
					    throw new Error('더보기가 있는 경우 url 옵션을 설정해주세요.');
				    }
				    me._renderAjax();
			    }
			    me._toggleMoreButton();
		    }

	    },

	    /**
	     * 더보기 조회
	     * @private
	     */
	    _renderAjax: function () {
			var me = this,
				item;
		    $.ajax({
			    url: me.options.url.call(me, me.data),
			    dataType: 'json'
		    }).done( function (json) {
			    me.data.total = json.total;
			    me.data.current = json.current;
			    me.data.list = me.data.list.concat(json.list);

			    me._renderItem(json.list);
			    me.options.onLoaded.call(me, json);
		    });
	    },

	    /**
	     * 더보기 렌더링
	     * @param list
	     * @private
	     */
	    _renderItem: function (list) {
		    var me = this;

		    if (me.mediaMode === 'mobile') {
			    $.tmpl(me.mobileItem, {list: list}).appendTo(me.$(me.options.mobileTmpl + '.list'));
		    } else {
			    $.tmpl(me.pcItem, {list: list}).appendTo(me.$(me.options.pcTmpl + '.list'));
		    }

		    me._toggleMoreButton();
	    },

		/**
		 * 더보기 버튼에 카운트 표시
		 * @private
		 */
		_toggleMoreButton: function () {
			var me = this;
			if (me.data.current < me.data.total){
				me.$('.btn_more_wrap').show()
					.find('.txt').html('더보기 <span class="num">(<span class="hide">현재페이지</span>'+me.data.current+'/<span class="hide">전체페이지</span>'+me.data.total+')</span>');
			} else {
				me.$('.btn_more_wrap').hide();
			}
		},

		/**
		 * 화면 업데이트
		 *
		 */
		update: function () {
			var me = this;
			me._render();
			
		}
    });

    core.ui.AdaptiveTemplater = AdaptiveTemplater;
})(jQuery, window[LIB_NAME]);