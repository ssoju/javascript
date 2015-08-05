define([
    './views/MainView'
], function (MainView) {
    var view;
    return {
        title: '연락망 관리',
        run: function(viewManager) {
            var me = this;
            $.ajax({
                url: '/api/manager/index'
            }).done(function() {
                view = new MainView();
                viewManager.show(me, view);
            }).fail(function () {
                history.back();
            });
        }
    };
});