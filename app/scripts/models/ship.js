define(['settings', 'lib/convert'], function (settings, convert) {
    'use strict';

    function Ship (ship) {
        _.merge(this, {
            name: undefined,
            type: undefined,
            speed: {
                '1': { '0': undefined, '45': undefined, '90': undefined, '135': undefined, '180': undefined }, // bft 1
                '2': { '0': undefined, '45': undefined, '90': undefined, '135': undefined, '180': undefined }, // bft 2
                '3': { '0': undefined, '45': undefined, '90': undefined, '135': undefined, '180': undefined }, // bft 3
                '4': { '0': undefined, '45': undefined, '90': undefined, '135': undefined, '180': undefined }, // bft 4
                '5': { '0': undefined, '45': undefined, '90': undefined, '135': undefined, '180': undefined }, // bft 5
                '6': { '0': undefined, '45': undefined, '90': undefined, '135': undefined, '180': undefined }, // bft 6
                '7': { '0': undefined, '45': undefined, '90': undefined, '135': undefined, '180': undefined }  // bft 7
            },
        }, ship || {});
    }

    /*
     * heading is the heading of the ship in degrees
     * wind is an angular vector { angle: degrees from north, mag: m/s)
     */
    Ship.prototype.getSpeed = function getSpeed(heading, wind) {
        // get the angle of the wind relative to the ship
        var angle = wind.angle - heading;
        while (angle < 0) {
            angle += 360;
        }
        if (angle > 180) {
            angle = 360 - angle;
        }
        var bft = convert.mps2bft(wind.mag);
        var knots;
        if (angle <= 45) knots = this.speed[bft][0];
        else if (angle <= 70) knots = this.speed[bft][45];
        else if (angle <= 110) knots = this.speed[bft][90];
        else if (angle <= 155) knots = this.speed[bft][135];
        else knots = this.speed[bft][180];
        console.log('getSpeed: ' + angle + ' deg, ' + bft + ' bft');
        return knots;
    };

    return Ship;
});