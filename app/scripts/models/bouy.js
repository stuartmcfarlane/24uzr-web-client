define(['models/point'], function (Point) {
    'use strict';

    function Bouy (name, location) {
        this.location = location;
        this.name = name;
    };

    return Bouy;
});