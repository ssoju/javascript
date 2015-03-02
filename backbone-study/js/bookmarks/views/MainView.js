define([
    'underscore',
    'backbone',
    'baseview',
    'pubsub',
    'apps/common/views/ModalView',
	'apps/contacts/views/subviews/ContactView',
    'text!./../templates/BookmarksView.html',
    'apps/bookmarks/views/subviews/BookmarksFolderView'
], function(_, Backbone, BaseView, PubSub, ModalView, ContactView, tmpl, FolderModal) {

	var BookmarkItem = BaseView.extend({

		initialize: function() {
			BookmarkItem.__super__.initialize.apply(this, arguments);
			var me = this;

			me._openMenuBox();
		},

		_openMenuBox: function(){
			var me = this,
				$el = me.$el,
				type = $el.closest('.item').attr('data-type'),
				modal = me.modal = new ModalView({
					className: 'menu_layer',
					closeByOverlay: true,
					content: [
						'<div class="cntt">',
							'<ul>',
								(type === 'folder'?'<li><a href="#" data-mode="modify">이름수정</a></li>':''),
								'<li><a href="#" data-mode="move">위치변경</a></li>',
								'<li><a href="#" data-mode="delete">삭제</a></li>',
							'</ul>',
						'</div>'].join('')
				});

			modal.$el.on('click', 'a', function(e){
				e.preventDefault();

				me.mode = $(this).attr('data-mode');
				switch(me.mode){
					case 'modify':
						me._modifyName();
					break;
					case 'move':
						me._moveBookmark();
						break;
					case 'delete':
						me._deleteRow();
						break;
				}
				modal.close();
			});
			modal.open();
		},


		_modifyName: function() {
			var me = this,
				$el = me.$el.find('.bookmark_folder'),
				txt = $el.find('.wrap>.name').text();

			me.$modifyRow = $el;
			me.$el.addClass('modify');

			$el.find('.wrap').addClass('_old_').hide();
			$el.append([
				'<div class="wrap modify _input_"><form action="#" method="post">',
					'<div class="inpt">',
						'<input type="text" class="txt" name="folder_name">',
					'</div>',
					'<button class="btn_gt ok">확인</button>',
					'<button type="button" class="btn_lt cancel">취소</button>',
				'</form></div>'].join(''))
				.find('.txt').val(txt).focus();


			$el.on('click', function(e){
                    console.log('stopPropagation');
                    e.stopPropagation();
                })
				.find('._input_')
				.on('submit', 'form', function(e){
					e.preventDefault();

					var name = $.trim(this.folder_name.value);
					if(!name){
						alert('폴더이름을 입력해주세요.');
						this.folder_name.focus();
						return;
					}

					$.ajax({
						url: '/api/bookmarks/modify',
						method: 'post',
						data:{
							name: name,
							bm_id: $el.closest('.item').attr('data-bm-id')
						}
					}).done(function(res){
						if(res.status){
							$el.find('._old_ .name').html(res.name);
							me.reset();
						}
					});
				}).on('click', '.cancel', function(e){
					e.preventDefault();
					me.reset();
				});
		},

		_moveBookmark: function(){

			var me = this,
				bm_id = me.$el.closest('.item').attr('data-bm-id'),
				type = me.$el.closest('.item').attr('data-type'),
				folder = new FolderModal({id: bm_id, title: '즐겨찾기 위치변경', type: type, excludes: [bm_id]});

			folder.on('selectedfolder', function(data){				
				$.ajax({
					url: '/api/bookmarks/move',
					method: 'post',
					data:{
						parent_id: data.id,
						bm_id: bm_id
					}
				}).done(function(res){
					if(res.status){
						folder.close();
						me.trigger('changed');
					}
				});
			}).on('changed', function() {
				me.trigger('changed');	
			});
			folder.open();			
		},

		_deleteRow: function() {
			var me = this,
				$el = me.$el;

			var txt = $el.find('.name').text();
			if(!confirm(txt+'을(를) 삭제하시겠습니까?')){ return; }

			$.ajax({
				url: '/api/bookmarks/delete',
				method: 'post',
				data:{
					bm_id: $el.closest('.item').attr('data-bm-id')
				}
			}).done(function(res){
				if(res.status){
					$el.off().slideUp(function(){
						$el.remove();
						me.trigger('changed');

						/*_.each(res.items, function(item){
							$('.list .item[data-bm-id='+item.bm_id+']').off().removeData().remove();
						});*/
					});
				}
			});
		},

		reset: function() {
			var me = this,
				$el = me.$el;

			me.modal && me.modal.close(), me.modal = null;
			$el.off();
            $el.find('.bookmark_folder').off();
			switch(me.mode){
				case 'modify':
					me.$el.removeClass('modify');
					$el.find('._input_').remove();
					$el.find('._old_').removeClass('_old_').show();
					break;
			}
		},

		remove: function(){
			console.log('bookmarkitem remove');

			var me = this;
			me.reset();
			me.$el.off();
		}
	});


	var MainView = BaseView.extend({
        tagName: 'div',
        className: 'wrap_contents',
        templateStr: tmpl,
		events: {
			'click .bookmark_folder:not(._input_)': 'onFolderClick',
			'click .btn_ico.menu': 'onMenuClick'
		},
		initialize: function(){
			MainView.__super__.initialize.apply(this, arguments);

			var me = this;

			me.subviews = [];
            me.scrollTop = 0;

			me.collection.on('sync', _.bind(me.render, me));
            PubSub.on('deletedBookmark', function(e, data) {
                me.scrollTop = $(window).scrollTop();
                me.collection.fetch();
            });
		},
		onFolderClick: function(e){
			var $el = $(e.currentTarget),
				$li = $el.closest('li'),
				id = $li.data('id');

			Backbone.history.navigate('/bookmarks/'+id, true);		
		},
		onMenuClick: function(e){
			e.preventDefault();

			var me = this,
				$el = $(e.currentTarget).closest('li');

			me.activeRow && me.activeRow.remove();
			me.activeRow = new BookmarkItem({el: $el[0]});
			me.activeRow.on('changed', function() {
				me.collection.fetch();
			});

		},
		
		render: function () {
			var me = this;
			me.$el.html(me.template(me.collection));
            $('html,body').animate({scrollTop: me.scrollTop|0});

            var $wrap = me.$('.bookmark_tree .wrap'), iscroll;
            setTimeout(function () {
                $wrap.css({'width': $wrap.width() + 10});
                $wrap.parent().css({'min-width': '1px', 'width': '100%'});

                me.$el.data('iscroll', iscroll = new IScroll(me.$('.scroll')[0], {
                    scrollX: true,
                    scrollY: false,
                    scrollbars: false,
                    click: true
                }));
                iscroll.scrollTo(iscroll.maxScrollX, 0, 0);
            }, 60);

            return me;
		},
		remove: function(){
			var me = this;
			console.log('bookmark remove');
            me.activeRow && (me.activeRow.remove(), me.activeRow = null);
            me.slideView && (me.slideView.remove(), me.slideView = null);
            if(me.$el.data('iscroll')){
                me.$el.data('iscroll').destroy();
                me.$el.removeData('iscroll');
            }
			MainView.__super__.remove.call(this);
		}
	});

	return MainView;
});
