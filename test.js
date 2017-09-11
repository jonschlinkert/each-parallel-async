'use strict';

require('mocha');
var assert = require('assert');
var each = require('./');

describe('each', function() {
  it('should throw an error when the first argument is not an array', function(cb) {
    each({}, function() {}, function(err) {
      assert(err);
      cb();
    });
  });

  it('should throw an error when the callback is not a function', function() {
    assert.throws(function() {
      each();
    });
    assert.throws(function() {
      each(null, function() {}, {});
    });
  });

  it('should throw an error when the iterator is not a function', function(cb) {
    each(['a'], null, function(err) {
      assert(err);
      cb();
    });
  });

  it('should iterate over the given array', function(cb) {
    var res = [];

    each(['a', 'b', 'c'], function(val, next) {
      res.push(val);
      next(null, val);
    }, function(err) {
      assert.deepEqual(res, ['a', 'b', 'c']);
      cb();
    });
  });

  it('should run in series', function(cb) {
    this.timeout(10000);
    var res = [];
    var idx = 0;

    each([1, 2, 3, 4, 5, 6], function(val, next) {
      idx++;
      if (idx === 1 || idx === 3 || idx === 5) {
        setTimeout(function() {
          res.push(val + val);
          next();
        }, 100);
      } else {
        res.push(val + val);
        next();
      }
    }, function(err) {
      assert.deepEqual(res, [ 4, 8, 12, 2, 6, 10 ]);
      cb();
    });
  });

  it('should handle sync errors in callback', function(cb) {
    this.timeout(10000);
    var res = [];
    var idx = 0;

    each([1, 2, 3, 4, 5, 6], function(val, next) {
      idx++;
      if (idx === 1 || idx === 3 || idx === 5) {
        setTimeout(function() {
          res.push(val + val);
          next();
        }, 100);
      } else if (idx === 4) {
        throw new Error('foo');
      } else {
        res.push(val + val);
        next();
      }
    }, function(err) {
      assert(err);
      cb();
    });
  });

  it('should handle async errors in callback', function(cb) {
    this.timeout(10000);
    var res = [];
    var idx = 0;

    each([1, 2, 3, 4, 5, 6], function(val, next) {
      idx++;
      if (idx === 1 || idx === 5) {
        setTimeout(function() {
          res.push(val + val);
          next();
        }, 100);
      } else if (idx === 3) {
        process.nextTick(function() {
          next(new Error('foo'));
        });
      } else {
        res.push(val + val);
        next();
      }
    }, function(err) {
      assert(err);
      cb();
    });
  });
});
