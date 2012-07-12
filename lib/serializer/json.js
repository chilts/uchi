// --------------------------------------------------------------------------------------------------------------------
//
// json.js - the serialiser for JSON
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

var _ = require('underscore');

// --------------------------------------------------------------------------------------------------------------------

exports.pack = function(value) {
    return JSON.stringify(value);
};

exports.unpack = function(data) {
    if ( typeof data === 'string' ) {
        return JSON.parse(data);
    }
    else if ( Buffer.isBuffer(data) ) {
        return JSON.parse(data.toString());
    }
    else {
        throw 'Unknown data type.';
    }
};

exports.name = function() {
    return 'json';
};

// --------------------------------------------------------------------------------------------------------------------
