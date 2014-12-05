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
	getDataForChild: function( typeConverter, dom ) {
		var data = typeConverter.toData( dom );

		if ( !Array.isArray( data ) ) {
			data = [ data ];
		}

		return data;
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
			// TODO should we put a closing tag for a void element?
			data.push( {
				insert: 1,
				attributes: {
					type: '/' + parent.attributes.type
				}
			} );
		}

		return data;
	},

	getDocForDom: function( src ) {
		this.src = src;

		var data = this.getDataFromDom( src );

		return new Document( data, src );
	},

	getDomForDataset: function( data, targetElement ) {
		var currentElement = targetElement,
			doc = targetElement.ownerDocument,
			formattedNodes = [],
			formats = [];

		// get a subset of DataView(); representing children of the element at position
		function getNodeChildrenData( i ) {
			var end = getNodeClosingPosition( i ),
				subset = [],
				j;

			for ( j = i + 1; j < end; j++ ) {
				subset.push( data[ j ] );
			}

			return subset;
		}

		// find closing tag for the element at position
		function getNodeClosingPosition( i ) {
			var type = '/' + data[ i ].attributes.type,
				j;

			for ( j = i + 1; j < data.length; j++ ) {
				if ( data[ j ] && data[ j ].attributes && data[ j ].attributes.type === type ) {
					return j;
				}
			}

			throw new Error( 'No closing tag found for: ' + type.substr( 1 ) );
		}

		data.forEach( function( item, idx ) {
			var childElement,
				type;

			// tag
			if ( item.insert === 1 ) {
				type = item.attributes.type;
				// closing tag
				if ( type.charAt( 0 ) === '/' ) {
					type = type.substr( 1 );

					if ( !this.typeManager.isEmpty( type ) ) {
						// move context to parent node
						currentElement = currentElement.parentNode;
					}
					// opening tag
				} else {
					childElement = this.getDomFromData( item, doc );

					currentElement.appendChild( childElement );

					// child element may contain data
					if ( !this.typeManager.isEmpty( type ) ) {
						currentElement = childElement;
					}
				}

				// text
			} else if ( utils.isString( item.insert ) ) {
				// formatted text
				if ( item.attributes ) {
					// TODO
					formattedNodes.push( item );

					// plain text
				} else {
					childElement = this.typeManager.get( 'text' ).toDom( item, doc );
					currentElement.appendChild( childElement );
				}
			}
		}, this );
	},

	getDomForDoc: function( doc, targetElement ) {
		return this.getDomForDataset( doc.data, targetElement );
	},

	getDomFromData: function( data, doc ) {
		var typeConverter = this.typeManager.get( data.attributes.type );

		return typeConverter.toDom( data, doc );
	}
};

module.exports = Converter;