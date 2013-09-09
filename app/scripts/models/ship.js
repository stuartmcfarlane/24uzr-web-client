define([], function () {
    'use strict';

    function Ship (ship) {
        _.extend(this, {
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

    return Ship;
});