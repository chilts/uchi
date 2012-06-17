// --------------------------------------------------------------------------------------------------------------------
//
// object.js - the class for each Uchi Object
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
var jsonSerializer = require('./serializer/json.js');

// --------------------------------------------------------------------------------------------------------------------

var requiredAttrs  = ['key', 'value', 'serializer'];
var optionalAttrs  = ['createdAt', 'expiresAt', 'earlyExpiresAt', 'serialiser'];
var readableAttrs  = ['key', 'createdAt', 'expiresAt', 'earlyExpiresAt', 'format', 'isCompressed', 'size', 'serializer'];
var writeableAttrs = ['EarlyExpiresAt', 'ExpiresAt', 'Serializer'];

// --------------------------------------------------------------------------------------------------------------------

var UchiObject = function(opts) {
    var self = this;

    // go through the things that we require first
    requiredAttrs.forEach(function(name, i) {
        if ( typeof opts[name] === 'undefined' ) {
            throw 'UchiObject: new() requires a ' + name + ' for construction.';
        }
        self[name] = opts[name];
    });

    // now go through the optional attrs and store them if they are defined
    optionalAttrs.forEach(function(name, i) {
        if ( !_.isUndefined(opts[name]) ) {
            self[name] = opts[name];
        }
    });

    // store the incoming opts.value into a Buffer depending on what kind of value it is
    if ( typeof opts.value === 'string' ) {
        // convert the string to a buffer
        self.buffer = new Buffer(opts.value);
    }
    else if ( typeof opts.value === 'number' ) {
        // convert the number to a buffer
        self.buffer = new Buffer(opts.value);
    }
    else if ( typeof opts.value === 'boolean' ) {
        // convert the boolean to a buffer
        self.buffer = new Buffer(opts.value);
    }
    else if ( _.isDate(opts.value) ) {
        // convert the date to a string, then a buffer
        self.buffer = new Buffer(opts.value.toISOString());
    }
    else if ( Buffer.isBuffer(opts.value) ) {
        // copy the buffer
        self.buffer = new Buffer(opts.value);
    }
    else if ( _.isObject(opts.value) ) {
        // serialize the value first
        self.buffer = new Buffer(JSON.stringify(opts.value));
    }
    else {
        // we don't know what the incoming type is
        throw 'Unknown type for value.';
    }

    // do the actual packing here (pack() saves it onto this object)
    self.pack();

    return self;
};

// for each of these attributes, just return them (can't change them)
readableAttrs.forEach(function(name, i) {
    UchiObject.prototype[name] = function() {
        return this[name];
    };
});

UchiObject.prototype.value = function() {
    if ( !this.buffer ) {
        this.repack();
    }
    return this.buffer;
};

// these functions can change an attribute, but doesn't repack() the buffer
writeableAttrs.forEach(function(name, i) {
    name = 'set' + name;
    UchiObject.prototype[name] = function(date) {
        var self = this;
        self[name] = date;
        self.buffer = undefined;
    };
});

// will only pack the object if there is no packed buffer available
UchiObject.prototype.pack = function() {
    var self = this;
    if ( !self.buffer ) {
        self.repack();
    }
    return self.buffer;
};

// will _always_ repack the buffer, even if there already is one
UchiObject.prototype.repack = function() {
    var self = this;

    // always pack the data
    var buffer = self.serializer().pack(self);
    self.buffer = buffer;
    return buffer;
};

// returns the native object after the unpacking of the buffer has occurred
UchiObject.prototype.unpack = function() {
    var self = this;
    var data = self.serializer().unpack(self.buffer);
    return data;
};

// --------------------------------------------------------------------------------------------------------------------

module.exports = exports = UchiObject;

// --------------------------------------------------------------------------------------------------------------------
