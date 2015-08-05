define([
    './collections/ProjectsCollection',
    './views/MainView'
], function (ProjectsCollection, MainView) {
    var view;
	return {
        title: '프로젝트',
        search: true,
		run: function(viewManager, id) {
			var me = this,
                projectsCollection = new ProjectsCollection();

			projectsCollection.fetch({
				success: function (projecttsCollection) {
					view = new MainView({collection: projecttsCollection, prjId: id});
					viewManager.show(me, view, function(){
                        $('#search').attr('placeholder', '프로젝트명');
                    });

				}
			});
		},
        onChangeParameter: function(prjId){
            if(view && prjId) {
                view.expandDetail(prjId);
            }
        }
	};
});