define(['backbone'], function(Backbone) {
	return Backbone.Model.extend({
		urlRoot: '/api/contacts',
		url: function(){
			return '/api/contacts/detail?mem_id='+this.id;
		}
	});
});