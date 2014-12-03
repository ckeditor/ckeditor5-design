'use strict';

var Document = require( './document' ),
	Delta = require( 'rich-text' ).Delta;

function Converter() {
	this.src = null;
}

Converter.prototype = {
	getDocForDom: function( src ) {
		this.src = src;

		var data = this.getDataFromDom( src );

		return new Document( data, src );
	},

	getDataFromDom: function( dom ) {
		[].forEach.call( dom.childNodes, function( child ) {
			if ( child.nodeType === Node.ELEMENT_NODE ) {

			} else if ( child.nodeType === Node.TEXT_NODE ) {

			}
		}, this );
	}
};

module.exports = Converter;