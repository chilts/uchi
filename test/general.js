// --------------------------------------------------------------------------------------------------------------------
//
// general.js - run these tests for every driver we have
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
// set up some useful variables/constants

var timestamp = new Date();

// --------------------------------------------------------------------------------------------------------------------

function getEmptyKey(test, cache) {
    console.log();
    test('getting an empty/unknown key', function(t) {
        cache.get('user:unknown', function(err, user) {
            t.ok(!err, 'No error when getting an empty key');
            t.ok(!user, 'No user when getting an empty key');
            t.end();
        });
    });
}

function setKey(test, cache) {
    test('setting a key', function(t) {
        var user = {
            'username' : 'chilts',
            'password' : 'sekrit',
            'inserted' : timestamp,
        };
        cache.set('user:chilts', user, function(err, user) {
            t.ok(!err, 'No error when setting a key');
            t.ok(!user, 'Nothing returning when setting a key');
            t.end();
        });
    });
}

function getNonEmptyKey(test, cache) {
    test('getting a previously set key', function(t) {
        cache.get('user:chilts', function(err, user) {
            t.ok(!err, 'No error when getting a key');
            t.equal(user.username, 'chilts', 'Username is set on the returned key');
            t.equal(user.password, 'sekrit', 'Password is set on the returned key');
            t.equal(user.inserted, timestamp.toISOString(), 'Inserted is set on the returned key');
            t.end();
        });
    });
}

// --------------------------------------------------------------------------------------------------------------------

exports.getEmptyKey    = getEmptyKey;
exports.setKey         = setKey;
exports.getNonEmptyKey = getNonEmptyKey;

// --------------------------------------------------------------------------------------------------------------------
