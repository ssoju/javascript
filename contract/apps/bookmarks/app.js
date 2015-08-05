define([
    './collections/BookmarksCollection',
    './views/MainView'
], function (BookmarksCollection, MainView) {

	return {
        title: '즐겨찾기',
		run: function(viewManager, args) {
			var me = this,
                bookmarksCollection = new BookmarksCollection();

			if(args.length){
				bookmarksCollection.pid = args[0];
			}

			bookmarksCollection.fetch({
				success: function (collection) {
					var view = new MainView({collection: collection});
					viewManager.show(me, view);
				}
			});
		}
	};
});