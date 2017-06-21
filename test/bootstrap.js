const sinon = require('sinon');
const expect = require('unexpected').clone();
const unexpectedSinon = require('unexpected-sinon');

expect.use(unexpectedSinon);
global.sinon = sinon;
global.expect = expect;
