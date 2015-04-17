var should = require('should');
var regex = require('./regex.js');

describe('Test regexes', function() {
  describe('email regex', function() {
    describe('failing tests', function() {
      it('Should fail for empty string', function () {
        should(!!"".match(regex.email)).be.equal(false);
      });
      it('Should fail for "ali"', function () {
        should(!!"ali".match(regex.email)).be.equal(false);
      });
      it('Should fail for "ali@"', function () {
        should(!!"ali@".match(regex.email)).be.equal(false);
      });
      it('Should fail for "ali@aa"', function () {
        should(!!"ali@aa".match(regex.email)).be.equal(false);
      });
      it('Should fail for "ali@aa."', function () {
        should(!!"ali@aa.".match(regex.email)).be.equal(false);
      });
    });
    describe('passing tests', function() {
      it('Should pass for ali@alicoding.com', function () {
        should(!!"ali@alicoding.com".match(regex.email)).be.equal(true);
      });
      it('Should pass for a@a.com', function () {
        should(!!"a@a.com".match(regex.email)).be.equal(true);
      });
      it('Should pass for ali@a.ca', function () {
        should(!!"ali@a.ca".match(regex.email)).be.equal(true);
      });
      it('Should pass for ali@a.google', function () {
        should(!!"ali@a.google".match(regex.email)).be.equal(true);
      });
      it('Should pass for ali+@a.google', function () {
        should(!!"ali+@a.google".match(regex.email)).be.equal(true);
      });
      it('Should pass for ali@aa.google', function () {
        should(!!"ali@aa.google".match(regex.email)).be.equal(true);
      });
      it('Should pass for ali+b@aa.google', function () {
        should(!!"ali+b@aa.google".match(regex.email)).be.equal(true);
      });
      it('Should pass for ali+@aa.google', function () {
        should(!!"ali+@aa.google".match(regex.email)).be.equal(true);
      });
    });
  });
});
