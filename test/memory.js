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
var jsonSerializer = require('../lib/serializer/json.js');
uchi.registerSerializer('json', jsonSerializer);

var cache = uchi({
    'driver'     : 'memory',
    'serializer' : 'json',
});

// --------------------------------------------------------------------------------------------------------------------

var testOrder = [
    'getEmptyKey', 'setKey', 'getNonEmptyKey'
];

// call each test function in order
testOrder.forEach(function(fn) {
    general[fn](test, cache);
});

// --------------------------------------------------------------------------------------------------------------------
