define([
    'jquery',
    'backbone',
    'pubsub',
    'apps/common/views/HeaderView',
    'apps/bookmarks/views/subviews/BookmarksMyListView',
    'apps/bookmarks/views/subviews/BookmarksFolderView',
    'apps/contacts/views/subviews/ContactView'
], function ($, Backbone, PubSub, HeaderView, BmMyListModal, BmFolderModal, ContactDetailView) {

	var $body = $('body'),
		$html = $('html,body');

	window.ModalManager = {
		_modals: [],
		_zIndex: 9000,
		zIndex: function(dim){
			return this._zIndex += dim;
		},
		add: function(modal) {
			if(modal) {
				this._modals.push(modal);
				
				if(modal.$overlay){
					modal.$overlay.addClass('_modal_').css('z-index', this.zIndex(1));
				}
				modal.$el.addClass('_modal_').css('z-index', this.zIndex(1));
			}
		},
		remove: function(modal) {
			if(modal){
				this._modals = _.filter(this._modals, function(item){
					return item !== modal;
				});
			}

			if($body.find('>._modal_').size() === 0) {
				this.preventScroll(false);		
				this._zIndex = 9000;
			}
		},
		clear: function() {
			_.each(this._modals, function(modal) {
				if(modal.remove){
					modal.remove();
				}
			});
			this._modals = [];
		},

		preventScroll: function(done){
			if(done === false){
				$body.css({
					'overflow':'',
                    'position': ''
				});
            } else {
				$body.css({
					'overflow':'hidden',
                    'position': 'relative'
				});
			}
		}
	};

	window.Bookmark = {
		openMyList: function(id, type) {
			var me = this,
				list = new BmMyListModal({id: id, type: type});
			list.on('bookmarkopen', function(id, type){
				me.open(id, type);
				list.close();
				list = null;
			}).on('bookmarkdelete', function(id, type, count){
                PubSub.trigger('deletedBookmark', {id: id, type: type});
				if(count === 0){
					//$('.bookmark[data-id='+id+'][data-type='+type+']').removeClass('on');
					me.active(id, type, false);
				}
			});
			list.open();
		},
		open: function(id, type){
			var folder = new BmFolderModal({id: id, type: type});
			folder.on('selectedfolder', function(e){					
				$.ajax({
					url: '/api/bookmarks/add',
					method: 'post',
					data: {
						type: type,
						id: id,
						parent_id: e.id
					}
				}).done(function(res){
					if(res.status){
						alert('등록되었습니다.');
						folder.close();
						//$('.bookmark[data-id='+id+'][data-type='+type+']').addClass('on');
						me.active(id, type, true);
					}
				});
			});

			folder.open();
		},
        active: function(id, type, on) {
			$('.bookmark[data-id='+id+'][data-type='+type+']').toggleClass('on', on === true);
        },
        remove: function(bm_id) {
			$('.list .item[data-bm-id='+bm_id+']').off().removeData().remove();
        }
	};

	PubSub.on('view:before', function(){
		window.ModalManager.clear();
		window.ModalManager.preventScroll(false);
	}).on('view:after', function(){
		$body.css('touch-action', '');
	});


    return {
        setup: function (win, app) {
			var ajaxCount = 0;

            $(document).on("click", "a[href]:not([data-bypass])", function(e) {
				var $el = $(this);
				if($el.attr("href") == '#'){
					e.preventDefault();
					return;
				}
				var done = false;
                var link = { prop: $el.prop("href"), href: $el.attr("href") };
                var root = location.protocol + "//" + location.host + app.root;

                if (link.prop.slice(0, root.length) === root) {
                    e.preventDefault();
					
					PubSub.trigger('route:before');
					$html.animate({scrollTop: 0}, 100, function(){
						if(!done){
							done = true;
							Backbone.history.navigate(link.href, true);
						}
					});
                }

            }).on('click', '.bookmark', function(e){
                // 북마크 추가
				e.preventDefault();

				var $el = $(this),
					id = $el.attr('data-id'),
					type = $el.attr('data-type');

				if($el.hasClass('on')) {
					window.Bookmark.openMyList(id, type);
				} else {
					window.Bookmark.open(id, type);
				}
			}).on('click', '.list .identity', function (e) {
                // 임직원 상세
                var $el = $(e.currentTarget),
                    $li = $el.closest('li'),
                    id = $li.data('id');

                var slideView = new ContactDetailView({id: id});
                slideView.open();
            }).on('click', '.list_contacts h1.tit', function(e) {
                var $header = $(e.currentTarget);

                $header.toggleClass('close');
                $header.next('.list').toggle(!$header.hasClass('close'));
            }).on('ajaxStart ajaxError ajaxComplete', function(e){
                // ajax 전역 처리
				switch(e.type) {
					case 'ajaxStart': 
						ajaxCount += 1;	
						
						if(ajaxCount === 1){
							$('.loader').removeClass('hide');
						}
						break;
					case 'ajaxError':
						switch(arguments[3]){
							case "Unauthorized":
								alert("인증이 만료되었습니다.");
								location.assign('/login');
								break;
							default:
								alert("알수 없는 이유로 중단되었습니다.");
								window.ModalManager.clear();
								break;
						}
						break;
					case 'ajaxComplete':
						var json;
						if(json = arguments[1].responseJSON){
							if(!json.status && json.message){
								alert(json.message);
							}
						}

						ajaxCount -= 1;
						if(ajaxCount <= 0){
							$('.loader').addClass('hide');
							//ModalManager.clear();
						}
						break;
				}

			}).on('submit', function(e){
				e.preventDefault();
			});

            $(function(){
				new HeaderView({el: '#gnb'});
			});
        }
    };
});
