define(['models/point'], function (Point) {
    'use strict';

    function Bouy (name, location) {
        if (location === undefined) {
            location = new Point();
        }
        if (name === undefined) {
            name = '';
        }
        this.location = location;
        this.name = name;
    };

    return Bouy;
});