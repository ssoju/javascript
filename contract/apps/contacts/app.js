define([
    './collections/ContactsCollection',
    './views/MainView'
], function (ContactsCollection, MainView) {

	return {
        title: '사내연락망',
        search: true,
		run: function(viewManager) {
			var me = this,
                contactsCollection = new ContactsCollection();
			contactsCollection.fetch({
				success: function (contactsCollection) {
					var view = new MainView({collection: contactsCollection});
					viewManager.show(me, view, function() {
                        $('#search').attr('placeholder', '성명, 그룹명, 이메일, 핸드폰번호');
                    });
				}
			});
		}
	};
});