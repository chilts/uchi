// --------------------------------------------------------------------------------------------------------------------
//
// driver.js - the base class for all Uchi drivers
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
// Inspired by: perldoc -m CHI::Driver
//
// --------------------------------------------------------------------------------------------------------------------

var _ = require('underscore');

var json = require('./serializer/json.js');
var msgpack = require('./serializer/msgpack.js');
var CacheObject = require('./cache-object.js').CacheObject;
var objectFromPackedData = require('./cache-object.js').objectFromPackedData;

var serializers = {
    'json' : json,
    'msgp' : msgpack,
};

var stats = {
    // retrievals
    'hits'            : 0,
    'misses'          : 0,
    'expiredMisses'   : 0,
    // operations
    'setOks'          : 0,
    'setErrors'       : 0,
    'setObjectErrors' : 0,
    'getOks'          : 0,
    'getErrors'       : 0,
};

// --------------------------------------------------------------------------------------------------------------------
// main base class

function Driver(opts) {
    // set the default namespace
    this._namespace = opts.namespace || 'default';

    // set the (default) serializer for this cache
    if ( !opts.serializer ) {
        throw 'Provide a serializer.';
    }
    this._serializer = opts.serializer;

    // set some other fields
    this.expiresVariance = opts.expiresVariance || 0;

    return this;
}

// --------------------------------------------------------------------------------------------------------------------
// functions on the Driver object

Driver.prototype.driverName = function() {
    throw 'Driver must implement driverBase()';
};

// each driver must implement the following methods
var methods = ['fetch', 'store', 'remove', 'getKeys', 'getNamespaces'];
methods.forEach(function(methodname, i) {
    Driver.prototype[methodname] = function() {
        throw 'Driver ' + this.driverName() + ' must implement ' + methodname + '()';
    };
});

// internal methods which shouldn't be overriden
Driver.prototype.uchiNamespace = function() {
    return 'uchi';
};

Driver.prototype.namespace = function() {
    return this._namespace;
};

Driver.prototype.serializer = function() {
    return this._serializer;
};

// internal
Driver.prototype._transformKey = function(key) {
    return key;
};

// internal
Driver.prototype._defaultSetOpts = function(key) {
    return key;
};

// internal method
//
// Description: retrieves the desired key from the cache, but doesn't no checking on it except a transformation
// into a CacheObject
Driver.prototype._getCacheObject = function(key, callback) {
    var self = this;

    key = self._transformKey(key);

    self._fetch(key, function(err, packedData) {
        if (err) {
            callback(err);
            return;
        }

        // if nothing was returned, just return nothing
        if ( _.isUndefined(packedData) ) {
            callback(null, undefined);
            return;
        }

        // got the raw object, now unpack it
        var obj = objectFromPackedData(key, packedData);
        callback(null, obj);
    });
};

// --------------------------------------------------------------------------------------------------------------------
// external methods

Driver.prototype.set = function(key, value, opts, callback) {
    var self = this;

    if ( typeof opts === 'function' ) {
        callback = opts;
        opts = {};
    }

    // transform the key if necessary
    key = self._transformKey(key);

    // interpret 'opts'
    if ( _.isUndefined(opts) ) {
        opts = self._defaultSetOpts();
    }
    else if ( opts === 'never' ) {
        opts = {};
    }
    else if ( opts === 'now' ) {
        opts = { expiresIn : 0 };
    }
    else if ( _.isArray(opts) ) {
        throw 'Unknown format for opts.';
    }
    else if ( _.isNumber(opts) ) {
        opts = { expiresIn : opts };
    }
    else if ( _.isObject(opts) ) {
        // nothing to do
    }
    else {
        throw 'Unknown format for opts.';
    }

    // if expiresAt or expiresIn are set, then we need to set expiresVariance
    if ( opts.expiresAt || opts.expiresIn ) {
        opts.expiresVariance = self._expiresVariance();
    }
    else {
        // just extent the options passed in
        opts = _.extend({}, self._defaultSetOpts(), opts);
    }

    // finally, call the setWithOptions
    self._setWithOptions(key, value, opts, callback);
};

function dateAsEpoch(d) {
    return (d.valueOf() - d.getMilliseconds()) / 1000;
}

Driver.prototype._setWithOptions = function(key, value, opts, callback) {
    var self = this;

    // Determine the early and final expiration times
    var nowFromEpoch = dateAsEpoch(new Date());
    var createdAt = nowFromEpoch;
    var expiresAt = opts.expiresIn ? nowFromEpoch + opts.expiresIn : opts.expiresAt;

    // earlyExpiresAt - may allow this as an option, but for now, we'll calculate it
    var earlyExpiresAt;
    if ( opts.earlyExpiresAt ) {
        earlyExpiresAt = opts.earlyExpiresAt;
    }
    else if ( expiresAt ) {
        earlyExpiresAt = expiresAt - ( expiresAt - nowFromEpoch ) * opts.expiresVariance;
    }
    else {
        // no expiresAt, therefore no earlyExpiresAt
    }

    // now we can make the object
    var obj = new CacheObject(key, value, {
        'createdAt'      : createdAt,
        'earlyExpiresAt' : earlyExpiresAt,
        'expiresAt'      : expiresAt,
        'compression'    : false, // ToDo: self.compressThreshold(),
        'serializer'     : opts.serializer || self.serializer(),
    });

    var buffer = obj.pack();

    // call the actual driver to do this :)
    self._store(key, buffer, callback);
};

// _setObject(key, obj, callback);
//
// Status: internal function
//
// Description: sets the ket to this object
Driver.prototype._setObject = function(key, obj, callback) {
    var self = this;

    var buffer = obj.pack();

    self._store(key, buffer, function(err) {
        if (err) {
            stats.setErrors++;
            callback(err);
            return;
        }

        // everything was fine
        stats.setOks++;
        callback(null);
    });
};

// get(key, [params,] callback)
//
// Visibility: public
//
// Description: Get will retrieve the key from the cache, unpack it and return it, so long as it hasn't expired It also
// records statistics about the retrieval too.
Driver.prototype.get = function(key, params, callback) {
    var self = this;

    if ( typeof key === 'undefined' ) {
        throw 'get(): Specify a key';
    }

    // check for the optional params
    if ( typeof params === 'function' ) {
        callback = params;
        params = {};
    }

    // measure_time???

    // Fetch the cached object (an instance of CacheObject)
    self._getCacheObject(key, function(err, obj) {
        if (err) {
            stats.getErrors++;
            // ToDo: log something?
            callback(err);
            return;
        }

        // check if we have retrieved something or it missed the cache
        if (!obj) {
            stats.misses++;
            // ToDo: log something?
            callback(null, null);
            return;
        }

        // we found an object, now check if it _is_ expired or it _should_ be expired
        var isExpired = obj.isExpired() || ( params.expireIf && params.expireIf(obj) );
        if ( isExpired ) {
            stats.expiredMisses++;
            // ToDo: log the result

            // if we don't have a busy lock, finish up now
            if ( !params.busyLock) {
                callback(null, null);
                return;
            }

            // set a new 'temporary' expiration time
            var nowFromEpoch = dateAsEpoch(new Date());
            var busyLockTime = nowFromEpoch + params.busyLock;
            obj.setEarlyExpiresAt(busyLockTime);
            obj.setExpiresAt(busyLockTime);
            self.setObject(key, obj, function(err, obj) {
                if (err) {
                    stats.setObjectErrors++;
                    callback(err);
                    return;
                }

                // callback without any data, since we want the caller to regenerate this key
                callback(null, null);
            });
        }

        // not expired, so return it
        stats.hits++;
        // self.logGetResult('HIT', key, elapsedTime);

        // this value will already be de-serialised, so just return it
        callback(null, obj.value());
    });
};

// --------------------------------------------------------------------------------------------------------------------

module.exports = exports = Driver;

// --------------------------------------------------------------------------------------------------------------------
