define([
    'underscore',
    'jquery',

], function (_, $) {
    return {
        ajax: function(opts) {
            return $.ajax(opts).done(function(res, statusCode) {
                if (res.success) {
                    switch (res.type) {
                        case 'dialog':
                            break;
                        case 'alert':
                            alert(res.msg);
                            break;
                        case 'confirm':
                            return confirm(res.msg);
                            break;
                    }
                } else {
                    alert(res.msg);
                }
            });
        }
    }
});
