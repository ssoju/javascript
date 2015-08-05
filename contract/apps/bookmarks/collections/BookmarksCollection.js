define([
	'backbone',
	'./../models/Bookmark'
], function (Backbone, Bookmark) {

	return Backbone.Collection.extend({
		model: Bookmark,

		url: function(){
			return '/api/bookmarks/list'+(this.pid?'?bm_id='+this.pid:'');
		},

        parse: function(res) {
            this.depths = res.depths;
			this.items = res.items;
        }
	});
});