'use strict';

var Branch = require( './branch' ),
	Leaf = require( './leaf' ),
	Delta = require( 'rich-text' ).Delta;

function Document( ops, el ) {
	this.root = new Branch();
	this.ops = ops;
	this.el = el;
}

Document.prototype = {

};

module.exports = Document;