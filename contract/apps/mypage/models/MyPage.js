define(['backbone'], function(Backbone) {
	return Backbone.Model.extend({
		urlRoot: '/api/mypage/mypage',
		url: function(){
			return '/api/mypage/detail';
		}
	});
});