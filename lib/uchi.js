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

var serializer = {
    // these are loaded as necessary
};

var driver = {
//    'memory' : memory,
};

// --------------------------------------------------------------------------------------------------------------------

function uchi(opts) {
    opts = opts || {};

    // check they have supplied a driver
    if ( !opts.driver ) {
        throw 'Supply a driver';
    }

    // check they have supplied a serializer
    if ( !opts.serializer ) {
        throw 'Supply a serializer name';
    }

    // check the serializer is one we know about
    if ( !serializer[opts.serializer] ) {
        throw 'Unknown serializer name';
    }

    // call the constructor on the driver and pass these opts through
    return new driver[opts.driver](opts);
}

uchi.registerSerializer = function(name, s) {
    serializer[name] = s;
};

uchi.getSerializer = function(name) {
    return serializer[name];
};

uchi.registerDriver = function(name, d) {
    driver[name] = d;
};

uchi.getDriver = function(name) {
    return driver[name];
};

// --------------------------------------------------------------------------------------------------------------------

module.exports = exports = uchi;

// --------------------------------------------------------------------------------------------------------------------
