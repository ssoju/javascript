define([
    'backbone',
    'baseview',
    'pubsub',
    'text!../templates/ManagerView.html',
    'libs/jquery.form.min'
], function(Backbone, BaseView, PubSub, tmpl) {
    var MainView = BaseView.extend({
        templateStr: tmpl,
        initialize: function(){

            MainView.__super__.initialize.call(this);
        },
        render: function () {
            var me = this;
            me.$el.html(me.template());

            me.$('form.excel').ajaxForm({
				beforeSubmit: function(){
					var file = $.trim( $('form.excel [name=excel]').val() );
					if(!file){
						alert('파일을 선택해 주세요.');
						return false;
					}
					if(!/xls|xlsx$/i.test(file)){
						alert('엑셀파일만 유효합니다.');
						return false;
					}
					return true;
				},
                success: function(res){
                    console.log('success', arguments);
                    if(res.status === true) {
                        alert('작업이 완료되었습니다.');
                        me.$('form.excel')[0].reset();
                    }
                }
            });
            me.$('form.vomdb').ajaxForm({
				beforeSubmit: function(){
					var pw = $.trim( $('form.vomdb [name=passwd]').val() );
					if(!pw){
						alert('암호를 입력해 주세요.');
						return false;
					}
					return true;
				},
                success: function(res){
                    console.log('success', arguments);
                    if(res.status === true) {
                        alert('싱크작업이 완료되었습니다.');
                        me.$('form.vomdb')[0].reset();
                    }
                }
            });
            $('#header .manager').addClass('on');
            return this;
        },
        remove: function() {
            console.log('manager remove');

            $('#header .manager').removeClass('on');
            MainView.__super__.remove.call(this);
        }
    });

    return MainView;
});