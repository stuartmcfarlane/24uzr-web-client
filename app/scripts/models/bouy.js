define(['models/point'], function (Point) {
    'use strict';

    var nextId = 0;

    function Bouy (name, location) {
        this.location = location;
        this.name = name;
        this._id = ++nextId;
    };

    return Bouy;
});