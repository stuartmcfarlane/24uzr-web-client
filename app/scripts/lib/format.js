define([], function () {
    'use strict';

    function hours(hrs) {
        var h = Math.floor(hrs);
        var s = Math.floor((hrs - h) * 60);
        return h + ':' + s;
    }

    return {
        hours: hours
    };
});