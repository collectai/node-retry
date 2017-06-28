# node-retry

## Install

`npm install @collectai/node-retry`

## Quickstart

```javascript
var nodeRetry = require('@collectai/node-retry')();

var count = 0;
nodeRetry(function(cb) {
  console.log('myfunc called ' + (++count) + ' times');
  if (count < 3) {
    var error = new Error('Service connection error');
    error.code = 'ETIMEDOUT';
    cb(error);
  } else {
    cb(null, 'succeed the third time');
  }
}).then(function(result) {
  console.log(result);
});
```

### Configurable retry validation

```javascript
var nodeRetry = require('@collectai/node-retry')({
  retryIf: function(error) {
    // Custom error validation to retry
    return error.message === 'DB connection error';
  }
});

var count = 0;
nodeRetry(function(cb) {
  console.log('myfunc called ' + (++count) + ' times');
  if (count < 3) {
    cb(new Error('DB connection error'));
  } else {
    cb(null, 'succeed the third time');
  }
}).then(function(result) {
  console.log(result);
});
```

### Promise retry

```javascript
var nodeRetry = require('@collectai/node-retry')();

var count = 0;
nodeRetry()(function() {
  console.log('myfunc called ' + (++count) + ' times');
  return new Promise(function(resolve, reject) {
    if (count < 3) {
      var error = new Error('Service connection error');
      error.code = 'ETIMEDOUT';
      reject(error);
    } else {
      resolve('succeed the third time');
    }
  });
}).then(function(result) {
  console.log(result);
});
```

All these examples will display:

```
myfunc called 1 times
myfunc called 2 times
myfunc called 3 times
succeed the third time
```
