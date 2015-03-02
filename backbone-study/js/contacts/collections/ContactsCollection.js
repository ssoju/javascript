define([
	'backbone',
	'./../models/Contact'
], function (Backbone, Contact) {
	var C;
	return C = Backbone.Collection.extend({
		model: Contact,

		url: function(){
			return '/api/contacts/list'
		},

        parse: function(res) {
            //return res.items;
			_.extend(this, res);
        }
	});
});
