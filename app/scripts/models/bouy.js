define(['lodash'], function () {
    'use strict';

    function Bouy (vertex) {
        if (vertex) {
            this._id = vertex._id;
            this.name = vertex.name;
            this.location = vertex.location;
        }
    };

    return Bouy;
});