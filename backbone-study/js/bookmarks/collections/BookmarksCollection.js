define([
	'backbone',
	'./../models/Bookmark'
], function (Backbone, Bookmark) {

	return Backbone.Collection.extend({
		model: Bookmark,

		url: function(){
			return '/api/bookmarks/list'+(this.pid?'/'+this.pid:'');
		},

        parse: function(res) {
            this.depths = res.depths;
			this.items = res.items;
        }
	});
});
