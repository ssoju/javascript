define([
	'apps/common/views/ModalView',
	'../../collections/BookmarksMyListCollection',
    'text!./../../templates/BookmarksMyList.html'
], function(ModalView, Collection, tmpl) {

	var BookmarksMyList = ModalView.extend({
		className: 'wrap_layer',
		templateStr: tmpl,
		events: {
			'click .delete': 'onDeleteItem',
			'click .bookmark-add': 'onOpenBookmark'
		},

		onDeleteItem: function(e){
			e.preventDefault();
			if(!confirm('해당 북마크를 삭제하시겠습니까?')){ return; }
			var me = this,
				bm_id = $(e.currentTarget).attr('data-bm-id');

			$.ajax({
				url: '/api/bookmarks/delete',
				type: 'post',
				data: {
					bm_id: bm_id
				}
			}).done(function(res){
				if(res.status){
					me.load();
					me.trigger('deletedbookmark', {bm_id: bm_id, id: me.options.id, type: me.options.type, remain: res.count});
				}
			});
		},

		onOpenBookmark: function(e){
			e.preventDefault();
			this.trigger('openbookmarkfolder', this.options.id, this.options.type);
		},

		initialize: function(){
			var me = this;

			BookmarksMyList.__super__.initialize.apply(me, arguments);
			
			me.collection = new Collection();
			me.collection.on('sync change', _.bind(me.render, me));
			me.load();
		},
		
		load: function(){
			var me = this;

			me.collection.fetch({
				data: {
					id: me.options.id,
					type: me.options.type
				}
			});
		},

		render: function () {
            this.$el.html(this.template(this.collection));
			this.$el.css({
				top: '50%',
                left: 8,
                right: 8,
				marginTop: -(this.$el.height() / 2)
			});
            return this;
		},
		remove: function(){
			var me = this;
			
			me.$el.off().remove();
			BookmarksMyList.__super__.remove.call(me);
		}
	});

	return BookmarksMyList;
});