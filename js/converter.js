/* global Node */

'use strict';

var Document = require( './document' ),
	Delta = require( 'rich-text' ).Delta;

function Converter( typeManager ) {
	this.typeManager = typeManager;
	this.src = null;
}

Converter.prototype = {
	getDocForDom: function( src ) {
		this.src = src;

		var data = this.getDataFromDom( src );

		return new Document( data, src );
	},

	getDataFromDom: function( dom ) {
		var data = [];

		[].forEach.call( dom.childNodes, function( child ) {
			var typeConverter,
				childData;

			// element
			if ( child.nodeType === Node.ELEMENT_NODE ) {
				typeConverter = this.typeManager.match( child ) || this.typeManager.get( 'unknown' );
				childData = this.getDataForChild( typeConverter, child );

				console.log(childData);
			} else if ( child.nodeType === Node.TEXT_NODE ) {
				// TODO
			}
		}, this );

		return data;
	},

	getDataForChild: function( typeConverter, dom ) {
		var data = typeConverter.toData( dom );

		if ( !Array.isArray( data ) ) {
			data = [ data ];
		}

		return data;
	}
};

module.exports = Converter;