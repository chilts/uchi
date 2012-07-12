// --------------------------------------------------------------------------------------------------------------------
//
// cache-object.js - the class for each Uchi Object
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

var optionalAttrs  = [ 'createdAt', 'expiresAt', 'earlyExpiresAt', 'serializer' ];
var metaAttrs      = [ 'createdAt', 'expiresAt', 'earlyExpiresAt', 'serializer', 'format', 'isCompressed', 'size' ];
var writeableAttrs = [              'ExpiresAt', 'EarlyExpiresAt', 'Serializer' ];

// --------------------------------------------------------------------------------------------------------------------

var CacheObject = function(key, value, opts) {
    var self = this;

    // default to no options
    opts = opts || {};

    console.log('CacheObject(): new()');
    console.log('* key', key);
    console.log('* value', value);
    console.log('* opts', opts);

    if ( !key ) {
        throw 'CacheObject: new() requires a key for construction.';
    }

    if ( !value ) {
        throw 'CacheObject: new() requires a value for construction.';
    }

    // go through the things that we require first and save them
    self._key   = key;
    self._value = value;

    // now go through the optional attrs and store them if they are defined
    optionalAttrs.forEach(function(name, i) {
        if ( !_.isUndefined(opts[name]) ) {
            self[name] = opts[name];
        }
    });

    console.log('self1', self);

    // if some of the optional attrs aren't passed, make them ourselves
    self.createdAt  = self.createdAt  || new Date();
    self.serializer = opts.serializer || 'json';

    console.log('self2', self);

    // store the incoming value into a Buffer depending on what kind of value it is
    if ( typeof value === 'string' ) {
        // convert the string to a buffer
        self.buffer = new Buffer(value);
    }
    else if ( typeof value === 'number' ) {
        // convert the number to a buffer
        self.buffer = new Buffer(value);
    }
    else if ( typeof value === 'boolean' ) {
        // convert the boolean to a buffer
        self.buffer = new Buffer(value);
    }
    else if ( _.isDate(value) ) {
        // convert the date to a string, then a buffer
        self.buffer = new Buffer(value.toISOString());
    }
    else if ( Buffer.isBuffer(value) ) {
        // copy the buffer
        self.buffer = new Buffer(value);
    }
    else if ( _.isObject(value) ) {
        // serialize the value first
        self.buffer = new Buffer(JSON.stringify(value));
    }
    else {
        // we don't know what the incoming type is
        throw 'Unknown type for value.';
    }

    // do the actual packing here (pack() saves it onto this object)
    console.log('self3', self);
    self.pack();

    console.log('self4', self);

    return self;
};

// for each of these attributes, just return them (can't change them)
metaAttrs.forEach(function(name, i) {
    CacheObject.prototype[name] = function() {
        return this.meta[name];
    };
});

CacheObject.prototype.key = function() {
    return this._key;
};

CacheObject.prototype.value = function() {
    return this._value;
};

CacheObject.prototype.isExpired = function() {
    var self = this;

    // ToDo!

    return false;
};

CacheObject.prototype.createdAt = function() {
    // ToDo!
    var self = this;
    return self.createdAt;
};

// these functions can change an attribute, but doesn't repack() the buffer
writeableAttrs.forEach(function(name, i) {
    name = 'set' + name;
    CacheObject.prototype[name] = function(input) {
        var self = this;
        self.meta[name] = input;
        self.buffer = undefined;
    };
});

// will only pack the object if there is no packed buffer available
CacheObject.prototype.pack = function() {
    var self = this;
    if ( !self.buffer ) {
        self.repack();
    }
    return self.buffer;
};

// will _always_ repack the buffer, even if there already is one
CacheObject.prototype.repack = function() {
    var self = this;

    // always pack the data
    var buffer = self.serializer().pack(self);
    self.buffer = buffer;
    return buffer;
};

// returns the native object after the unpacking of the buffer has occurred
CacheObject.prototype.unpack = function() {
    var self = this;
    var data = self.serializer().unpack(self.buffer);
    return data;
};

function objectFromPackedData(key, buffer) {
    // ToDo: use the correct serializer
    var data = JSON.parse(buffer);
    console.log('DATA', data);
    console.log('kjksks', data);
    return new CacheObject(key, data);
}

// --------------------------------------------------------------------------------------------------------------------

module.exports.CacheObject          = CacheObject;
module.exports.objectFromPackedData = objectFromPackedData;

// --------------------------------------------------------------------------------------------------------------------
