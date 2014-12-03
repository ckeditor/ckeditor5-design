'use strict';

var Branch = require( './branch' ),
	Leaf = require( './leaf' ),
	Delta = require( 'rich-text' ).Delta;

function Document( data, el ) {
	this.root = new Branch();
	this.data = data;
	this.el = el;
}

Document.prototype = {

};

module.exports = Document;