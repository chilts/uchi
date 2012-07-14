// --------------------------------------------------------------------------------------------------------------------
//
// msgpack.js - the serialiser for MsgPack
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
var msgpack = require('msgpack-js');

// --------------------------------------------------------------------------------------------------------------------

exports.pack = function(value) {
    return msgpack.encode(value);
};

exports.unpack = function(data) {
    return msgpack.decode(data);
};

exports.name = function() {
    return 'msgp';
};

// --------------------------------------------------------------------------------------------------------------------
