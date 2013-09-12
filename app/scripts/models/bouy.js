define(['lib/convert', 'lodash'], function (convert) {
    'use strict';

    function Bouy (vertex) {
        if (vertex) {
            this._id = vertex._id;
            this.name = vertex.name;
            this.location = convert.locationInput2storageFormat(vertex.location);
        }
    }

    return Bouy;
});