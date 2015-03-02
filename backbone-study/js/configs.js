define([], function () {
    return {
        routes: [{
                path: 'logout',
                location: 'logout'
            }, {
                path: '',
                redirect: 'contacts'
            }, {
                path: 'index',
                redirect: 'contacts'
            }, {
                path: 'contacts',
                app: 'apps/contacts/app'
            }, {
                path: 'contacts/detail/:id',
                app: 'apps/contacts/app'
            }, {
                path: 'projects',
                app: 'apps/projects/app'
            }, {
                path: 'projects/:id',
                app: 'apps/projects/app'
            }, {
                path: 'bookmarks',
                app: 'apps/bookmarks/app'
            }, {
                path: 'bookmarks/:id',
                app: 'apps/bookmarks/app'
            }, {
                path: 'mypage',
                app: 'apps/mypage/app'
            }, {
                path: 'mypage/edit',
                app: 'apps/mypage/edit/app'
        }]
    }
});
