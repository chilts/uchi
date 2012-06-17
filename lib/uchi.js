// --------------------------------------------------------------------------------------------------------------------
//
// uchi.js - Make factory class for 'Uchi'
//
// Copyright (c) 2012 AppsAttic Ltd - http://www.appsattic.com/
//
// Written by - Andrew Chilton
// * Email    - andychilton@gmail.com
// * Site     - http://chilts.org/
// * Blog     - http://chilts.org/blog/
// * Twitter  - https://twitter.com/andychilton
//
// License: http://opensource.org/licenses/MIT
//
// --------------------------------------------------------------------------------------------------------------------

var memory = require('./driver/memory');

var driver = {
    'memory' : memory,
};

// --------------------------------------------------------------------------------------------------------------------

function factory(opts) {
    opts = opts || {};

    // check they have supplied a driver
    if ( !opts.driver ) {
        throw 'Supply a driver';
    }

    // check they have supplied a serializer
    if ( !opts.serializer ) {
        throw 'Supply a serializer';
    }

    // call the constructor on the driver and pass these opts through
    return new driver[opts.driver](opts);
}

// --------------------------------------------------------------------------------------------------------------------

module.exports = exports = factory;

// --------------------------------------------------------------------------------------------------------------------
