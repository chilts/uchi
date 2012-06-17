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

exports.pack = function(obj) {
    // obj should be a UchiObject
    // obj = _.extend(obj, { 'serializer' : 'json' });

    obj.setSerializer('json');

    // value is always a Buffer object
    var value = obj.value();
    var toPack = {
        'key'            : obj.key(),
        'value'          : value,
        'createdAt'      : obj.createdAt(),
        'expiresAt'      : obj.expiresAt(),
        'earlyExpiresAt' : obj.earlyExpiresAt(),
        'serializer'     : 'json',
        // 'isCompressed'   : false,
        // 'size'           : value.length, // the size of the value Buffer or the packed data
    };

    return JSON.stringify(toPack);
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
