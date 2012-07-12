// --------------------------------------------------------------------------------------------------------------------
//
// memory.js - the driver for the Memory module of Uchi
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
// Inspired by: perldoc -m CHI::Driver::Memory
//
// --------------------------------------------------------------------------------------------------------------------

var _ = require('underscore');
var util = require('util');

var Driver = require('../driver.js');

// --------------------------------------------------------------------------------------------------------------------
// variables shared across all instances of this driver

// this is the global datastore, so that multiple instances of this driver can access the same data
var store = Object.create(null);

// --------------------------------------------------------------------------------------------------------------------
// main driver class: constructor and the functions we need to implement

// (1) - constructor
var Memory = function(opts) {
    var self = this;

    // call the superclass constructor
    Memory.super_.call(this, opts);

    // make sure this namespace exists
    if ( !store[self.namespace()] ) {
        store[self.namespace()] = {};
    }

    return this;
}

// inherit from UchiDriver
util.inherits(Memory, Driver);

// ---
// (2) - functions we _need_ to implement

// fetch - fetches a key from the datastore
Memory.prototype._fetch = function(key, callback) {
    var self = this;

    process.nextTick(function() {
        // return this key's value from the store
        callback(null, store[self.namespace()][key]);
    });
}

// store - stores a key+data in the datastore
Memory.prototype._store = function(key, buffer, callback) {
    var self = this;

    process.nextTick(function() {
        // add this key/buffer to the store
        if ( !store[self.namespace()] ) {
            store[self.namespace()] = {};
        }

        // store it
        store[self.namespace()][key] = buffer;

        console.log('+++ STORE +++');
        console.log(store);
        console.log('--- STORE ---');

        // memory operation always succeeds
        callback(null);
    });
}

// remove - removes a key from the namespace
Memory.prototype.remove = function(key, callback) {
    var self = this;

    process.nextTick(function() {
        // remove the key from the namespace
        delete store[self.namespace()][key];

        // remove the lastUsedTime from our own namespace
        delete store[this.uchiNamespace()].lastUsedTime[key];

        // operation was successful
        callback(null);
    });
};

// getKeys - returns all the keys in this namespace
Memory.prototype.getKeys = function(key, data, callback) {
    process.nextTick(function() {
        callback(null, Object.keys(store[self.namespace()]));
    });
};

// getNamespaces - returns all the namespaces
Memory.prototype.getNamespaces = function(wcallback) {
    process.nextTick(function() {
        callback(null, Object.keys(store));
    });
};

// ---
// (3) Functions that can be done more efficiently than when using the inherited functions.

// clear - destroy the entire namespace
// Memory.prototype.clear = function() {
//     // create a new namespace and assign it to the old one (which will be gc'd)
//     store[this.namespace()] = Object.create(null);
// };

Memory.prototype.discardPolicyLRU = function() {
    // get all the keys in the uchi namespace's lastUsedTime field
    return Object.keys( store[this.uchiNamespace()].lastUsedTime ).sort();

    // my @keys_in_lru_order = sort { $last_used_time->{$a} <=> $last_used_time->{$b} } $self->get_keys;
    // return sub {
    //     shift(@keys_in_lru_order);
    // };
};

// --------------------------------------------------------------------------------------------------------------------

// only export this driver constructor
module.exports = exports = Memory;

// --------------------------------------------------------------------------------------------------------------------
