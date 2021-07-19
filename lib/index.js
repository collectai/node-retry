const backoff = require('backoff');

const defaultConfig = {
  maxRetries: 20,
  initialDelay: 100,
  maxDelay: 10000,
  nestedErrorProperty: 'cause',
  retriableErrors: [
    'ECONNRESET',
    'ENOTFOUND',
    'ESOCKETTIMEDOUT',
    'ETIMEDOUT',
    'ECONNREFUSED',
    'EHOSTUNREACH',
    'EPIPE',
    'EAI_AGAIN',
  ],
};

module.exports = (options = {}) => (fn, args = []) => {
  let call;

  const retriableErrors = options.retriableErrors || defaultConfig.retriableErrors;
  const retryByErrorCode = err => err && (
    err.code && retriableErrors.includes(err.code) ||
    err[config.nestedErrorProperty] && retriableErrors.includes(err[config.nestedErrorProperty].code)
  );
  const config = Object.assign({ retryIf: retryByErrorCode }, defaultConfig, options);

  const promise = new Promise((resolve, reject) => {
    call = backoff.call(callback => {
      const response = fn.apply(null, [...args, callback]);

      if (response && response.then) {
        response.then(callback.bind(null, null), callback);
      }
    }, (err, res) => (err ? reject(err) : resolve(res)));

    call.retryIf(config.retryIf);
    call.failAfter(config.maxRetries);
    call.setStrategy(new backoff.ExponentialStrategy({
      initialDelay: config.initialDelay,
      maxDelay: config.maxDelay,
    }));

    call.start();
  });

  promise.onRetry = cb => call.on('backoff', cb);
  return promise;
};
