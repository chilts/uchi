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

var uchi = require('./uchi');

// --------------------------------------------------------------------------------------------------------------------

var optMetaAttrs   = [ 'createdAt', 'expiresAt', 'earlyExpiresAt', 'serializer' ];
var metaAttrs      = [ 'createdAt', 'expiresAt', 'earlyExpiresAt', 'serializer', 'format', 'isCompressed', 'size' ];
var writeableAttrs = [              'ExpiresAt', 'EarlyExpiresAt', 'Serializer' ];

// --------------------------------------------------------------------------------------------------------------------

var CacheObject = function(key, value, opts) {
    var self = this;

    // default to no options
    opts = opts || {};

    if ( !key ) {
        throw 'CacheObject: new() requires a key for construction.';
    }

    if ( !value ) {
        throw 'CacheObject: new() requires a value for construction.';
    }

    // go through the things that we require first and save them
    self._key   = key;
    self._value = value;

    // go through the optional meta attrs and store them if they are defined
    self.meta = {};
    optMetaAttrs.forEach(function(name, i) {
        if ( !_.isUndefined(opts[name]) ) {
            self.meta[name] = opts[name];
        }
    });

    // if some of the optional attrs aren't passed, make them ourselves
    self.meta.createdAt  = self.meta.createdAt  || new Date();
    self.meta.serializer = self.meta.serializer || 'json';

    // store the incoming value into a Buffer depending on what kind of value it is
    if ( typeof value === 'string' ) {
        // convert the string to a buffer
        // self.buffer = new Buffer(value);
    }
    else if ( typeof value === 'number' ) {
        // convert the number to a buffer
        // self.buffer = new Buffer(value);
    }
    else if ( typeof value === 'boolean' ) {
        // convert the boolean to a buffer
        // self.buffer = new Buffer(value);
    }
    else if ( _.isDate(value) ) {
        // convert the date to a string, then a buffer
        // self.buffer = new Buffer(value.toISOString());
    }
    else if ( Buffer.isBuffer(value) ) {
        // copy the buffer
        // self.buffer = new Buffer(value);
    }
    else if ( _.isObject(value) ) {
        // serialize the value first
        // self.buffer = uchi.getSerializer(self.meta.serializer).pack(self);
        // nothing to do
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

CacheObject.prototype.isTransformed = function() {
    // ToDo!
    return false;
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

    // ok, let's firstly serialise the value so we know it's length
    var serializer = uchi.getSerializer(self.meta.serializer);
    var serializedValue = serializer.pack(self.value());
    var serializerBuffer = new Buffer(serializedValue, 'utf8');

    // create a buffer to hold this AND the metadata at the front
    var output = new Buffer(18 + serializerBuffer.length);
    output.writeUInt8(1, 0);
    output.writeUInt8(self.isTransformed() ? 1 : 0, 1);
    output.writeUInt32LE(1342115784, 2);
    output.writeUInt32LE(1342115785, 6);
    output.writeUInt32LE(1342115786, 10);
    output.write(serializer.name(), 14, 4, 'ascii');

    // copy the serializedBuffer over to the output one
    serializerBuffer.copy(output, 18);

    // always pack the data
    self.buffer = output;
    return self.buffer;
};

// returns the native object after the unpacking of the buffer has occurred
CacheObject.prototype.unpack = function() {
    var self = this;
    var serializer = uchi.getSerializer(self.meta.serializer);
    return serializer.unpack(self.buffer);
};

function objectFromPackedData(key, buffer) {
    var self = this;

    // the format of a binary CacheObject is:
    //
    // * 1 byte for an 8 bit unsigned CacheVersion (version 1 is documented here)
    // * 1 byte for an 8 bit unsigned isTransformed (referring to the key)
    // * 4 bytes for a 32 bit unsigned CreatedAt
    // * 4 bytes for a 32 bit unsigned EarlyExpiresAt
    // * 4 bytes for a 32 bit unsigned ExpiresAt
    // * 4 bytes as a string for the serialiser used
    // * the rest as a raw buffer

    // make sure this buffer is at least 18 bytes long
    if ( buffer.length < 18 ) {
        throw "Can't decode a Cache Object buffer which is less than 14 bytes long";
    }

    // so, let's find the index of the 2nd \n
    var meta = {};
    meta.format         = buffer.readUInt8(0);
    meta.isTransformed  = buffer.readUInt8(1);
    meta.createdAt      = buffer.readUInt32LE(2);
    meta.earlyExpiresAt = buffer.readUInt32LE(6);
    meta.expiresAt      = buffer.readUInt32LE(10);
    meta.serializer     = buffer.toString('ascii', 14, 18);

    // now get the value back
    var rawValue = buffer.slice(18);
    var value = uchi.getSerializer(meta.serializer).unpack(rawValue);
    return new CacheObject(key, value, meta);
}

// --------------------------------------------------------------------------------------------------------------------

module.exports.CacheObject    = CacheObject;
module.exports.objectFromPackedData = objectFromPackedData;

// --------------------------------------------------------------------------------------------------------------------
