define([
    './collections/BookmarksCollection',
    './views/MainView'
], function (BookmarksCollection, MainView) {

	return {
		run: function(viewManager, args) {
			console.log(args);
			var bookmarksCollection = new BookmarksCollection();
			if(args.length){
				bookmarksCollection.pid = args[0];
			}

			bookmarksCollection.fetch({
				success: function (collection) {
					var view = new MainView({collection: collection});
					viewManager.show(view);

					$('#searcher').slideUp();
				}
			});
		}
	};
});
