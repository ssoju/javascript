define([
	'backbone',
	'./../models/MyPage'
], function (Backbone, MyPage) {
	return Backbone.Collection.extend({
		model: MyPage,

		url: function(){
			return '/api/mypage/detail/' + this.id;
		},

        parse: function(res) {
            //return res.detail;
			_.extend(this, res);
        }
	});
});
