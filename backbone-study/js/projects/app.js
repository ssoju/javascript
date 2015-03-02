define([
    './collections/ProjectsCollection',
    './views/MainView'
], function (ProjectsCollection, MainView) {

	return {
		run: function(viewManager, id) {
			var projectsCollection = new ProjectsCollection();
			projectsCollection.fetch({
				success: function (projecttsCollection) {
					var view = new MainView({collection: projecttsCollection, prjId: id});
					viewManager.show(view);

					$('#searcher').slideDown();
				}
			});
		}
	};
});
