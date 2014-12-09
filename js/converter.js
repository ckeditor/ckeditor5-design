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
					childData = this.getDataFromDom( child, null, utils.extend( {}, parentStyle || {}, childStyle ) );
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
			typeConverter,
			childElement,
			item,
			type,
			len,
			i;

		// append nodes to the current element
		function appendNode( child ) {
			currentElement.appendChild( child );
		}

		// shallow compare for two objects
		function compare( a, b ) {
			return Object.keys( a ).every( function( name ) {
				return a[ name ] === b[ name ];
			} );
		}

		// find what's the first index where two style arrays are different
		function findDifferenceIndex( a, b ) {
			var diffIdx = -1;

			// reverse the order of arrays
			if ( a.length < b.length ) {
				var c = a;
				a = b;
				b = c;
			}

			a.some( function( style, idx ) {
				if ( !b[ idx ] || !compare( style, b[ idx ] ) ) {
					diffIdx = idx;

					return true;
				}
			} );

			return diffIdx;
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
					var styleStack = [],
						styledElements = [];

					// we want to process a whole chain of "styled text" items
					while (
						( item = utils.clone( data[ i ] ) ) &&
						utils.isString( item.insert ) &&
						item.attributes
					) {
						var styles = [],
							itemElems = [],
							style;

						// process item styles
						while ( ( typeConverter = this.typeManager.matchForData( item ) ) ) {
							type = typeConverter.type;

							// make a copy of a style
							style = utils.pick( item.attributes, [ type, type + 'Tag' ] );
							styles.push( style );
							itemElems.push( typeConverter.toDom( item, doc ) );

							// removed the processed style data
							delete item.attributes[ type ];
							delete item.attributes[ type + 'Tag' ];
						}

						var diffIdx = findDifferenceIndex( styles, styleStack );

						// no common styles
						if ( diffIdx === 0 && styledElements.length ) {
							currentElement.appendChild( styledElements[ 0 ] );
							styledElements = [];
						}

						// remove styles that are already on the stack
						styles = styles.slice( diffIdx );
						// remove elements that are already on the stack
						itemElems = itemElems.slice( diffIdx );

						// remove styles that are no longer needed
						styleStack = styleStack.slice( 0, diffIdx );
						// remove elements that are no longer needed
						styledElements = styledElements.slice( 0, diffIdx );

						// add new styles to the stack
						styleStack = styleStack.concat( styles );
						styledElements = styledElements.concat( itemElems );

						// create a text node
						typeConverter = this.typeManager.get( 'text' );
						childElement = typeConverter.toDom( item, doc );

						// append the text to the deepest element
						styledElements[ styledElements.length - 1 ].appendChild( childElement );

						// append elements from bottom to top
						if ( styledElements.length > 1 ) {
							for ( var j = 1; j < styledElements.length; j++ ) {
								styledElements[ j - 1 ].appendChild( styledElements[ j ] );
							}
						}

						i++;
					}
					// get back to the previous item which didn't match the while criteria
					i--;

					// append styled elements to the currentElement
					styledElements.forEach( appendNode );

					// plain text
				} else {
					typeConverter = this.typeManager.get( 'text' );
					childElement = typeConverter.toDom( item, doc );
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