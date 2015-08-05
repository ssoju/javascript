define([
	'underscore',
	'pubsub',
	'apps/common/views/ModalView',
	'../../collections/BookmarksFolderCollection',
	'text!../../templates/BookmarksFolderView.html'
], function(_, PubSub, ModalView, Collection, tmpl){

	var FolderView = ModalView.extend({
		templateStr: tmpl,
		events: {
			'click .marker': 'onSelected',
			'click .add': 'onNewFolder',
			'click .del': 'onDeleteFolder'
		},
		onNewFolder: function(e) {
			e.preventDefault();

			var me = this
				$el = $(e.currentTarget),
				parent_id = $el.attr('data-bm-id'),
				modal = new ModalView({
					className: 'etc_layer fix',
					cssStyle: {
						'top': 30,
						'margin-top': 0
					},
					content: [
						'<div class="cntt">',
							'<div class="add_folder">',
								'<form action="#" method="post">',
								'<p class="info_txt">폴더명을 입력해 주세요.</p>',
								'<div class="inpt">',
									'<input type="text" name="folder_name" class="txt">',
								'</div>',
								'<div class="wrap_btn">',
									'<button class="btn_gt">확인</button>',
									'<button type="button" class="btn_lt cancel">취소</button>',
								'</div>',
								'</form>',
							'</div>',
						'</div>'
					].join('')
				});

			modal.$el.on('submit', 'form', function(e) {
				e.preventDefault();
				if(!$.trim(this.folder_name.value)){
					alert('폴더이름을 입력해 주세요.');
					return;
				}
				$.ajax({
					url: '/api/bookmarks/create',
					method: 'post',
					data: {
						parent_id: parent_id,
						name: this.folder_name.value
					}
				}).done(function(res){
					if(res.status){
						me.collection.fetch({
							type: 'post',
							data: {
								id: me.options.id,
								type: me.options.type,
								excludes: [].concat(me.options.excludes)
							}
						});
						me.trigger('createdfolder', {bm_id: res.bm_id, name: res.name});
						modal.close();
					}
				});
			}).on('click', '.cancel', function(){
				modal.close();
			});
			modal.open();
			modal.$('input').focus();
		},
		onDeleteFolder: function(e){
			e.preventDefault();

			if(!confirm('해당 폴더를 삭제하시겠습니까?')){ return; }

			var me = this
				$el = $(e.currentTarget),
				bm_id = $el.attr('data-bm-id');

			$.ajax({
				url: '/api/bookmarks/delete',
				method: 'post',
				data: {
					bm_id: bm_id
				}
			}).done(function(res){
				if(res.status){
					$el.closest('.wrap').remove();
					me.load();

					_.each(res.items, function(item){
						if(item.id && item.cnt == 0 && item.type != 'folder'){
							window.Bookmark.active(item.id, item.type, false);
						}
					});
					me.trigger('deletedfolder', {bm_id: bm_id});
				}
			});
		},
		onSelected: function(e){
			e.preventDefault();

			var me = this,
				$el = $(e.currentTarget),
				bm_id = $el.attr('data-bm-id');

			me.trigger('selectedfolder', {
				bm_id: bm_id
			});
		},
		initialize: function(){
			var me = this;

			FolderView.__super__.initialize.apply(me, arguments);

			me.collection = new Collection();
			me.collection.title = me.options.title||"즐겨찾기 추가하기";
			me.collection.on('sync change', _.bind(me.render, me));
			me.load();
		},
		load: function(){
			var me = this;
			me.collection.fetch({
				type: 'post',
				data: {
					id: me.options.id,
					type: me.options.type,
					excludes: [].concat(me.options.excludes)
				}
			});
		},
		render: function(){
			var me = this;
			
			me.$el.html(me.template(me.collection));
			return me;
		},
		remove: function(){
			var me = this;
			
			me.$el.off().remove();
			FolderView.__super__.remove.call(me);
		}
	});
	return FolderView;
});