define([
	'./models/MyPage',
	'./views/MainView'
], function (MyPageModel, MainView) {

    return {
        run: function(viewManager) {
            var mypageModel = new MyPageModel();
            mypageModel.fetch({
                success: function (mypageModel) {
                    var view = new MainView({model: mypageModel});
                    viewManager.show(view);

					$('#searcher').slideUp();
                }
            });
        }
    };
});
