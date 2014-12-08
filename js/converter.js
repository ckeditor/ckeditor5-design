/* global Node */

'use strict';

var Document = require( './document' ),
	StyledNode = require( './styles/styled-node' ),
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
				typeConverter = this.typeManager.matchForDom( child ) || this.typeManager.get( 'unknown' );

				// styled text
				if ( typeConverter.prototype instanceof StyledNode ) {
					childStyle = this.getDataForChild( typeConverter, child )[ 0 ];

					// console.log( childStyle );
					childData = this.getDataFromDom( child, null, utils.extend( {}, parentStyle || {}, childStyle ) );
					// console.log( childData );

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

			styleStack = [],
			styles = [],

			styledElementsStack,
			styledElements,

			childElement,
			typeConverter,
			style,
			item,
			type,
			len,
			i;

		function openNode( item, typeConverter ) {
			var node = typeConverter.toDom( item, doc );


		}

		function closeNode() {

		}

		function isOnStack( style ) {
			return styleStack.some( function( item ) {
				return Object.keys( item ).some( function( name ) {
					return item[ name ] === style[ name ];
				} );
			} );
		}

		for ( i = 0, len = data.length; i < len; i++ ) {
			// we'll have to modify this a lot
			item = utils.clone( data[ i ] );

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
				// styled text
				if ( item.attributes ) {
					styledElementsStack = [];

					// while it's a styled text we want to process a whole chain of such elements
					while (
						( item = utils.clone( data[ i ] ) ) &&
						utils.isString( item.insert ) &&
						item.attributes
					) {
						styles = [];

						// process item styles
						while ( ( typeConverter = this.typeManager.matchForData( item ) ) ) {
							type = typeConverter.type;

							// copy a style
							style = utils.pick( item.attributes, [ type, type + 'Tag' ] );

							styles.push( style );

							// removed the processed style data
							delete item.attributes[ type ];
							delete item.attributes[ type + 'Tag' ];
						}

						// TODO create styled nodes if needed

						// create text node
						childElement = this.typeManager.get( 'text' ).toDom( item, doc );

						// TODO append text to styled node 

						i++;
					}

					// TODO append styled elements to the currentElement

					// get back to the previous item which didn't match the while criteria
					i--;
					// plain text
				} else {
					childElement = this.typeManager.get( 'text' ).toDom( item, doc );
					currentElement.appendChild( childElement );
				}
			}
		}
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