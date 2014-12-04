/* global Node */

'use strict';

var Document = require( './document' ),
	FormattedNode = require( './formats/formatted-node' ),
	Delta = require( 'rich-text' ).Delta,
	utils = require( './utils' );

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

	getDataFromDom: function( dom, parent, parentStyle ) {
		var data = [];

		// add parent element's opening tag
		if ( parent && parent.attributes.type ) {
			data.push( parent );
		}

		// add data for child nodes
		[].forEach.call( dom.childNodes, function( child ) {
			var typeConverter,
				childStyle,
				childData,
				text;

			// element
			if ( child.nodeType === Node.ELEMENT_NODE ) {
				typeConverter = this.typeManager.match( child ) || this.typeManager.get( 'unknown' );

				// formatted text
				if ( typeConverter.prototype instanceof FormattedNode ) {
					childStyle = this.getDataForChild( typeConverter, child )[ 0 ];
					childData = this.getDataFromDom( child, null, utils.extend( childStyle, parentStyle || {} ) );

					// regular element
				} else {
					childData = this.getDataForChild( typeConverter, child );
					childData = this.getDataFromDom( child, childData[ 0 ] );

					// TODO handle void elements
				}

				data = data.concat( childData );
				// text
			} else if ( child.nodeType === Node.TEXT_NODE ) {
				text = child.data;

				// don't add empty text nodes
				if ( text === '' ) {
					return;
				}

				// contains just whitespaces
				if ( text.match( /^\s+$/ ) ) {
					// TODO what to do with whitespaces?
					return;
				}

				typeConverter = this.typeManager.get( 'text' );
				childData = this.getDataForChild( typeConverter, child );

				// apply parent node styles, if any
				if ( parentStyle ) {
					childData[ 0 ].attributes = parentStyle;
				}

				data = data.concat( childData );
			}
		}, this );

		// add parent element's closing tag
		if ( parent && parent.attributes.type ) {
			data.push( {
				insert: 1,
				attributes: {
					type: '/' + parent.attributes.type
				}
			} );
		}

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