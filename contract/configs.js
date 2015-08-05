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
                path: 'contacts/detail?mem_id=:id',
                app: 'apps/contacts/app'
            }, {
                path: 'projects(?prj_id=:id)',
                app: 'apps/projects/app'
            }, {
                path: 'bookmarks(?bm_id=:id)',
                app: 'apps/bookmarks/app'
            }, {
                path: 'mypage',
                app: 'apps/mypage/app'
            }, {
                path: 'mypage/edit',
                app: 'apps/mypage/edit/app'
            }, {
                path: 'manager',
                app: 'apps/manager/app'
        }]
    }
});