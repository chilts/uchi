// --------------------------------------------------------------------------------------------------------------------
//
// memory.js - test the memory driver
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
var tap = require("tap"),
    test = tap.test,
    plan = tap.plan;

var general = require('./general');

// --------------------------------------------------------------------------------------------------------------------

var uchi = require('../lib/uchi.js');
var memoryDriver = require('../lib/driver/memory.js');
var jsonSerializer = require('../lib/serializer/json.js');
var msgpackSerializer = require('../lib/serializer/msgpack.js');

uchi.registerDriver('memory', memoryDriver);
uchi.registerSerializer('json', jsonSerializer);
uchi.registerSerializer('msgp', msgpackSerializer);

var cacheJson = uchi({
    'driver'     : 'memory',
    'serializer' : 'json',
});

var cacheMsgPack = uchi({
    'driver'     : 'memory',
    'serializer' : 'msgp',
});

// --------------------------------------------------------------------------------------------------------------------

// call each test function in order
[cacheJson, cacheMsgPack].forEach(function(cache) {
    general.forEach(function(fn, i) {
        fn(test, cache);
    });
    // here, reset the entire cache since we're using the same cache backend but with different serializers
});

// --------------------------------------------------------------------------------------------------------------------
