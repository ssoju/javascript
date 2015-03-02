define([
    './collections/ContactsCollection',
    './views/MainView'
], function (ContactsCollection, MainView) {

	return {
		run: function(viewManager) {
			var contactsCollection = new ContactsCollection();
			contactsCollection.fetch({
				success: function (contactsCollection) {
					var view = new MainView({collection: contactsCollection});
					viewManager.show(view);
					
					$('#searcher').slideDown();
				}
			});
		}
	};
});
