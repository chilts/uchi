```
                                        _______          _________
                              |\     /|(  ____ \|\     /|\__   __/
                              | )   ( || (    \/| )   ( |   ) (   
                              | |   | || |      | (___) |   | |   
                              | |   | || |      |  ___  |   | |   
                              | |   | || |      | (   ) |   | |   
                              | (___) || (____/\| )   ( |___) (___
                              (_______)(_______/|/     \|\_______/
                                                                  
```

uchi - Unified Cache Handling Interface

[![Build Status](https://secure.travis-ci.org/appsattic/uchi.png?branch=master)](http://travis-ci.org/appsattic/uchi)

'uchi' is totally inspired by [CHI](http://search.cpan.org/dist/CHI/) by Jonathan Swartz.

## Features ##

## Synopsis ##

```
    // --- Main UCHI interface
    var uchi = require('uchi');

    // --- Choose a Standard Driver ---
    // Choose a standard driver
    var cache = uchi.new({ driver : 'memory' });
    var cache = uchi.new({
        driver  : 'file',
        rootDir : '/tmp/cache/',
    });
    var cache = uchi.new({
        driver  : 'memcache',
        servers : [
            '10.0.0.2:11211',
            '10.0.0.3:11211',
        ],
    });

    // --- Use your own driver ---
    // var cache = uchi.new({ driver : 'redis', ... });
    // var cache = uchi.new({ driver : 'mongo', ... });
    // var cache = uchi.new({ driver : 'couch', ... });
    // var cache = uchi.new({ driver : 'mysql', ... });
    // var cache = uchi.new({ driver : 'pg',    ... });

    // --- Cache Operations ---
    // get a key
    var name = 'chilts';
    cache.get(name, function(err, data) {
        // ... use data ...
    });

    // set a key
    db.getCustomer(name, function(err, customer) {
        cache.set(name, customer, '10 minutes', function(err) {
            // ... cache is now set ...
        });
    });

    // clear a key
    cache.clear(name, function(err) {
        // ... cache is cleared ...
    });
```

## Operations ##

### get() ###
### set() ###


### compute(key, opts, fn) ###

Combines the get and set operations in one. Attempts to get 'key' and returns
it if successful. Otherwise call 'fn' (with 'opts') and use the return value as
the new value for 'key'.

### remove() ###

### expire() ###

## Namespace Operations ##

### clear() ###

Clears all entries from the particular namespace.

### getKeys() ###

Gets all the keys in this namespace.

### purge() ###

Removes all entries that have expired in the namespace associated with this
cache instance. Warning: may be inefficient depending on the number of keys and
the driver.

### getNamespaces() ###

Returns a list of namespaces associated with the cache.

## Multiple Key/Value Operations ##

getMultiArray([...])

Note: this has a default method in the base driver, but can be overriden by the
specific driver if there are more efficient ways of doing it.

getMultiObject([...])


## Drivers ##

UCHI will look for modules which are named 'uchi-<name>' where name is from the 'driver' option. e.g.

```
    var uchi = require('uchi');
    var cache = uchi.new({ driver : 'memory'   });
    var cache = uchi.new({ driver : 'file'     });
    var cache = uchi.new({ driver : 'memcache' });
```

UCHI will look for the modules ```uchi-memory```, ```uchi-file``` and
```uchi-memcache``` when trying to load these drivers. Make sure they are in
your package.json and in the correct path to be required.

### Memory ###

ToDo

### File ###

ToDo

### Memcache ###

ToDo

## Author ##

Written by: [Andrew Chilton](http://chilts.org/) - [Blog](http://chilts.org/blog/) -
[Twitter](https://twitter.com/andychilton).

## License ##

The MIT License : http://opensource.org/licenses/MIT

Copyright (c) 2011-2012 AppsAttic Ltd. http://appsattic.com/

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit
persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

(Ends)
