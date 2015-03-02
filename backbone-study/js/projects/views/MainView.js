define([
    'baseview',
    'pubsub',
	'apps/contacts/views/subviews/ContactView',
    'text!../templates/ProjectsView.html'
], function(BaseView, PubSub, ContactView, tmpl) {
    var MainView = BaseView.extend({
        templateStr: tmpl,
		events: {
			'click .project a.name': 'onItemClick',
			'click .close_detail': 'onCloseClick',
            'click .identity': 'onContactClick'
        },
        onContactClick: function(e) {
            var me = this;
            var $el = $(e.currentTarget).closest('li');

			$el.css('backgroundColor', '#ececec');
			setTimeout(function(){
				$el.css('backgroundColor',  '');
			}, 200);

			if(me.slideView){
				me.slideView.remove();
				me.slideView = null;
			}
			me.slideView = new ContactView({id: $el.attr('data-id')});
			me.slideView.open();
        },
		onItemClick: function(e){
			e.preventDefault();

			var me = this,
				$li = $(e.currentTarget).closest('li'),
				$area = $li.children(),
				isActive = $area.hasClass('on');
			
			if(isActive){
				me._closeItem($area);
				return;
			}
			var $other = this.$('.project.on');
			if($other.size()){
				$other.removeClass('on');
			} 
			setTimeout(function(){
				me._openItem($area);
			}, 50);
		},
		onCloseClick: function(e){
			e.preventDefault();

			var me = this,
				$li = $(e.currentTarget).closest('li'),
				$area = $li.children();

			me._closeItem($area);
		},
		initialize: function(){
			MainView.__super__.initialize.apply(this, arguments);

			var me = this;

			PubSub.off('.projects').on('search.projects', function(e, data){
				me.collection.fetch({
					data: {
						search: data.searchText	
					}
				}).then(function(){
					me.render();
				});
			});
		},
        render: function () {
			var me = this;
            me.$el.html(me.template(me.collection));

			if(me.options.prjId){
				var $area = me.$('.project[data-id='+me.options.prjId+']');
				me._openItem($area);
			}

            return this;
        },
		_closeItem: function($area){
			var me = this;

			$area.removeClass('on');
			me.$el.children().removeClass('active');
		},
		_openItem: function($area){
			var me = this;
			if(!$area.size()){ return; }

			$area.addClass('on');
			me.$el.children().addClass('active');
			$('html, body').animate({scrollTop: $area.parent().offset().top}, 400);
		},
		remove: function() {
			console.log('project remove');
			var me = this;

			PubSub.off('.projects');
			me.slideView&&me.slideView.remove()
			MainView.__super__.remove.call(this);
		}
    });

    return MainView;
});
