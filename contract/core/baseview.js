define([
    'backbone',
    'underscore',
    'jquery'
], function (Backbone, _, $) {
    var BaseView = Backbone.View.extend({
        initialize: function () {
            if(this.templateStr) {
                this.template = _.template(this.templateStr);
            }
            this.subviews = [];
        },
        remove: function(){
            console.log('remove');
            Backbone.View.prototype.remove.call(this);
        }
    });
	
	/*_.each(['on','off','trigger','triggerHandler', 
		'one', 'css', 'html', 'append', '.show', 'hide', 
		'addClass', 'removeClass', 'attr', 'data', 'animate'], function(item){
		BaseView.prototype['$'+item] = function(){
			return this.$el[item].apply(this.$el, arguments);
		};
	});*/

    return BaseView;
})