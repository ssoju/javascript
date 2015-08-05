define([
    'baseview',
    'text!../templates/MyPageView.html',
    'libs/jquery.form.min'
], function(BaseView, tmpl) {
    var MainView = BaseView.extend({
		tagName: 'div',
		className: 'wrap_contents',
        templateStr: tmpl,
		initialize: function(){
			MainView.__super__.initialize.apply(this, arguments);

			this.model.on('change', this.render, this);
		},
        render: function () {
			var me = this;
            me.$el.html(me.template({member: me.model.toJSON()}));
			
			this.$el.find('form').ajaxForm({
				beforeSend: function(){
					me.$('.btn_gt').prop('disabled', true);
				},
				success: function(res){
					if(res.status){
						alert('성공적으로 수정되었습니다.');
						//location.assign(location.href);
						
						$('html, body').animate({scrollTop: 0}, 300, function(){
							me.model.fetch();
						});

                        me.$('form')[0].reset();
					}
				}, 
				complete: function(){
					me.$('.btn_gt').prop('disabled', false);
				}
			});

            return this;
        }
    });

    return MainView;
});