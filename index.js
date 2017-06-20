const backoff = require('backoff');

const RETRIABLE_ERRORS = [
  'ECONNRESET',
  'ENOTFOUND',
  'ESOCKETTIMEDOUT',
  'ETIMEDOUT',
  'ECONNREFUSED',
  'EHOSTUNREACH',
  'EPIPE',
  'EAI_AGAIN',
];

module.exports = (options = {}) => (fn, args = []) => {
  let call;
  const promise = new Promise((resolve, reject) => {
    call = backoff.call.apply(null, [
      fn,
      ...args,
      (err, res) => {
        // NOTE. Only triggered in case of server communication
        if (err) return reject(err);
        return resolve(res);
      },
    ]);

    call.retryIf(err => {
      if (err && err.code) {
        return RETRIABLE_ERRORS.includes(err.code);
      }
      return false;
    });

    call.setStrategy(new backoff.ExponentialStrategy({
      initialDelay: options.initialDelay || 100,
      maxDelay: options.maxDelay || 10000,
    }));
    call.failAfter(options.maxRetries || 20);
    call.start();
  });
  promise.onRetry = cb => call.on('backoff', cb);
  return promise;
};
