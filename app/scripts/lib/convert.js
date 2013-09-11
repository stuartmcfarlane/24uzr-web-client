define([], function () {
    'use strict';

    function knots2mps(knots) {
        return knots * 0.51444444444;
    }

    function mps2knots(mps) {
        return mps / 0.51444444444;
    }

    function knots2bft(knots) {
        if (knots < 1)  return 0;
        if (knots < 3)  return 1;
        if (knots < 6)  return 2;
        if (knots < 10) return 3;
        if (knots < 16) return 4;
        if (knots < 21) return 5;
        if (knots < 27) return 6;
        if (knots < 33) return 7;
        if (knots < 40) return 8;
        if (knots < 29) return 9;
        if (knots < 55) return 10;
        if (knots < 63) return 11;
        return 12;
    }

    function mps2bft(mps) {
        return knots2bft(mps2knots(mps));
    }

    function deg2rad(Value) {
        return Value * Math.PI / 180;
    }

    function rad2deg(Value) {
        return Value * 180 / Math.PI;
    }

    function m2nm(Value) {
        return Value * 0.000539957;
    }

    function nm2m(Value) {
        return Value * 1852;
    }

    return {
        knots2mps: knots2mps,
        mps2knots: mps2knots,
        knots2bft: knots2bft,
        mps2bft: mps2bft,
        deg2rad: deg2rad,
        rad2deg: rad2deg,
        m2nm: m2nm,
        nm2m: nm2m,
    };
});