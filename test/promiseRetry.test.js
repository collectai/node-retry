const expect = require('unexpected');
const createRetry = require('../lib');

const defaultOptions = {
  maxRetries: 3,
};

// Revisit: Should we test all possible error codes defined in retry?
const timeout = () => {
  const e = new Error('Timeout');
  e.code = 'ETIMEDOUT';
  return e;
};

describe('Promise retry', () => {
  beforeEach(function init() {
    this.counter = 0;
  });

  it('should pass along custom arguments', () => {
    const retry = createRetry(defaultOptions);
    const fakeRequest = (a1, a2) => {
      expect(a1, 'to equal', 'myString');
      expect(a2, 'to exhaustively satisfy', { x: 1, y: 'abc' });
      return Promise.resolve();
    };

    return retry(fakeRequest, ['myString', { x: 1, y: 'abc' }]);
  });

  it(`should fail after exceeding max retry of ${defaultOptions.maxRetries}`, async function test() {
    const retry = createRetry(defaultOptions);
    const fakeRequest = () => new Promise((resolve, reject) => process.nextTick(() => reject(timeout())));

    try {
      const promise = retry(fakeRequest);
      promise.onRetry(() => {
        this.counter += 1;
      });
      await promise;
    } catch (e) {
      expect(this.counter, 'to equal', defaultOptions.maxRetries);
      return;
    }
    throw new Error('should not reach this line');
  });

  it('should succeed after initial timeout', async function test() {
    const retry = createRetry(defaultOptions);
    const timeoutes = [timeout(), null];
    const fakeRequest = () => new Promise((resolve, reject) =>
      process.nextTick(() => {
        const error = timeoutes.shift();
        error ? reject(error) : resolve();
      })
    );

    try {
      const promise = retry(fakeRequest);
      promise.onRetry(() => {
        this.counter += 1;
      });
      await promise;
    } catch (e) {
      throw new Error('should not reach this line');
    }
    expect(this.counter, 'to equal', 1);
  });
});
