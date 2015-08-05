define([
	'./models/MyPage',
	'./views/MainView'
], function (MyPageModel, MainView) {

    return {
        title: '내 정보',
        run: function(viewManager) {
            var me = this,
                mypageModel = new MyPageModel();

            mypageModel.fetch({
                success: function (mypageModel) {
                    var view = new MainView({model: mypageModel});
                    viewManager.show(me, view);
                }
            });
        }
    };
});