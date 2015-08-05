define([
	'backbone',
	'./../models/Project'
], function (Backbone, Project) {

	return Backbone.Collection.extend({
		model: Project,

		url: function(){
			return '/api/projects/list'+(this.searchText?'?search='+encodeURIComponent(this.searchText):'');
		},
        parse: function(res) {
            _.extend(this, res);
        }
	});
});