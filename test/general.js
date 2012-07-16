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
            'inserted' : timestamp.toISOString(),
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
            t.ok(user, 'A user is returned');
            t.equal(user.username, 'chilts', 'Username is set on the returned key');
            t.equal(user.password, 'sekrit', 'Password is set on the returned key');
            t.equal(user.inserted, timestamp.toISOString(), 'Inserted is set on the returned key');
            t.end();
        });
    });
}

function setKeyPage(test, cache) {
    test('setting another key', function(t) {
        var page = {
            'name' : '/',
            'html' : '<h1>Hello, World!</h1>',
        };
        cache.set('page:/', page, function(err) {
            t.ok(!err, 'No error when setting a key');
            t.equal(arguments.length, 1, 'Only one arg returned when setting a key');
            t.end();
        });
    });
}

function getKeys1(test, cache) {
    test('getting the current keys', function(t) {
        cache.getKeys(function(err, keys) {
            t.ok(!err, 'No error when getting all the keys');
            t.ok(keys, 'A set of keys is returned');
            t.equal(keys.length, 2, 'There are two keys');
            t.deepEqual(keys, ['user:chilts', 'page:/'], 'The key list is correct');
            t.end();
        });
    });
}

function clearAll(test, cache) {
    test('clearing the current keys', function(t) {
        cache.clear(function(err) {
            t.ok(!err, 'No error when clearing all the keys');
            t.equal(arguments.length, 1, 'Only 1 thing is passed back');
            t.end();
        });
    });
}

function getKeysShouldBeZero(test, cache) {
    test('getting the current keys', function(t) {
        cache.getKeys(function(err, keys) {
            t.ok(!err, 'No error when getting all the keys');
            t.ok(keys, 'A set of keys is returned');
            t.equal(keys.length, 0, 'There are now zero keys');
            t.deepEqual(keys, [], 'The key list is correct');
            t.end();
        });
    });
}

// --------------------------------------------------------------------------------------------------------------------

module.exports = [getEmptyKey, setKey, getNonEmptyKey, setKeyPage, getKeys1, clearAll, getKeysShouldBeZero];

// --------------------------------------------------------------------------------------------------------------------
