(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
require( 'cke5-a' );

const c2 = require( 'cke5-c/foo' );

c2();

},{"cke5-a":2,"cke5-c/foo":4}],2:[function(require,module,exports){
const b1 = require( 'cke5-b' );
const c1 = require( 'cke5-c' );
const c2 = require( 'cke5-c/foo' );

b1();
c1();
c2();

},{"cke5-b":3,"cke5-c":5,"cke5-c/foo":4}],3:[function(require,module,exports){
const c1 = require( 'cke5-c' );

module.exports = function b() {
	console.log( 'b' );
	c1();
};

},{"cke5-c":5}],4:[function(require,module,exports){
module.exports = function c2() {
	console.log( 'c2' );
};

},{}],5:[function(require,module,exports){
module.exports = function c1() {
	console.log( 'c1' );
};

},{}]},{},[1]);
