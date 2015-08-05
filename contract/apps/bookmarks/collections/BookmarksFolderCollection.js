define([
	'backbone'
], function (Backbone) {

	return Backbone.Collection.extend({
		model: Backbone.Model,

		url: function(){
			return '/api/bookmarks/allfolders';
		},

        parse: function(res) {
			_.extend(this, res);
			//this.items = res.items;
        }
	});
});