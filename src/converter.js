define( [
	'lineardocumentdata',
	'nodemanager',
	'inline/inlinenode',
	'tools/utils',
	'nodetypes'
], function(
	LinearDocumentData,
	nodeManager,
	InlineNode,
	utils
) {
	'use strict';

	var converter = {
		// retrieve an array of attributes for the given element
		getAttributesForDomElement: function( element, store ) {
			var result = [],
				nodeConstructor;

			// we care about actual elements only
			if ( element.nodeType === Node.TEXT_NODE ) {
				element = element.parentNode;
			}

			while ( element && ( nodeConstructor = nodeManager.matchForDom( element ) ) ) {
				// at the moment we don't expect having branch nodes wrapped by inline nodes (?)
				if ( !( nodeConstructor.prototype instanceof InlineNode ) ) {
					return result;
				}

				var attributes = nodeConstructor.toData( element );
				// get index of a style in the store
				var index = store.store( attributes );

				result.unshift( index );

				element = element.parentNode;
			}

			return result;
		},
		// prepare linear data for the given DOM
		getDataForDom: function( elem, store, parentAttributes, isRoot ) {
			var data = [],
				attributes,
				current;

			// element
			if ( elem.nodeType === Node.ELEMENT_NODE ) {
				// we want to treat the topmost element as a root node
				var nodeConstructor = isRoot ?
					nodeManager.get( 'root' ) :
					nodeManager.matchForDom( elem );

				// inline text
				if ( nodeConstructor && nodeConstructor.prototype instanceof InlineNode ) {
					// inline node's data contains attributes only
					attributes = nodeConstructor.toData( elem );

					// get index of a style in the store
					var index = store.store( attributes );

					// merge child's and parent's styles
					attributes = [].concat( parentAttributes || [] );

					// add child's style
					if ( attributes.indexOf( index ) === -1 ) {
						attributes.push( index );
					}

					// regular element
				} else if ( nodeConstructor ) {
					// create an opening data for current element
					current = nodeConstructor.toData( elem );

					data.push( current );
				}

				// collect data for all children
				for ( var i = 0, len = elem.childNodes.length; i < len; i++ ) {
					var child = elem.childNodes[ i ];

					data = data.concat( this.getDataForDom( child, store, attributes ) );
				}
				// text
			} else if ( elem.nodeType === Node.TEXT_NODE ) {
				var text = elem.data;

				// TODO take care of white spaces

				var textData = this._getDataForText( elem.textContent, parentAttributes );

				data = data.concat( textData );
			}

			// close the current element
			if ( current ) {
				data.push( {
					type: '/' + current.type
				} );
			}

			return data;
		},

		// prepare DOM elements for the given data
		getDomElementsForData: function( data, store, doc ) {
			var elementStack = [],
				textStack = [],
				currentElement,
				parentElement,
				nodeConstructor,
				childElements;

			function appendToCurrent( child ) {
				currentElement.appendChild( child );
			}

			for ( var i = 0, len = data.length; i < len; i++ ) {
				var item = data[ i ];

				// text or styled-text
				if ( utils.isString( item ) || utils.isArray( item ) ) {
					// push the text item to the stack
					textStack.push( item );
					// element
				} else if ( utils.isObject( item ) ) {
					// flush the text stack
					if ( textStack.length ) {
						nodeConstructor = nodeManager.get( 'text' );

						childElements = nodeConstructor.toDom( textStack, doc, store );

						// append children to the current element
						if ( currentElement ) {
							childElements.forEach( appendToCurrent );
							// push them to the element stack
						} else {
							elementStack = elementStack.concat( childElements );
						}

						// clear the stack
						textStack.length = 0;
					}

					var nodeType = LinearDocumentData.getType( item );

					nodeConstructor = nodeManager.get( nodeType ) || nodeManager.get( 'unknown' );

					// opening element
					if ( LinearDocumentData.isOpenElement( item ) ) {
						// we're inside of an element so let's make it a parent
						if ( currentElement ) {
							parentElement = currentElement;
						}

						// build the current element
						currentElement = nodeConstructor.toDom( item, doc );

						// append it to the parent or push it to the stack
						if ( parentElement ) {
							parentElement.appendChild( currentElement );
						} else {
							elementStack.push( currentElement );
						}

						// closing element
					} else if ( LinearDocumentData.isCloseElement( item ) ) {
						currentElement = currentElement.parentNode;
						parentElement = currentElement ? currentElement.parentNode : null;
					}
				}
			}

			// flush the remaining text stack
			if ( textStack.length ) {
				nodeConstructor = nodeManager.get( 'text' );

				childElements = nodeConstructor.toDom( textStack, doc, store );

				// push them to the element stack
				elementStack = elementStack.concat( childElements );
			}

			return elementStack;
		},

		// build a node tree, collect the children first and then push them to their parents
		// we use this order to calculate the lengths properly
		getNodesForData: function( data, document ) {
			var currentStack = [],
				parentStack = [],
				nodeStack = [];

			// start with the topmost element - the document node
			var currentNode;

			// add the parent and current stacks to start with
			nodeStack.push( parentStack, currentStack );

			// length counter for a text node
			var textLength = 0;

			// flag that says if we're processing a text node
			var inText = false;

			for ( var i = 0, len = data.length; i < len; i++ ) {
				// an element
				if ( data.isElementAt( i ) ) {
					// previous item was a text
					if ( inText ) {
						// set the final length of a text node
						currentNode.length = textLength;
						inText = false;
						textLength = 0;
						currentNode = parentStack[ parentStack.length - 1 ];
					}

					// an opening element
					if ( data.isOpenElementAt( i ) ) {
						var type = data.getTypeAt( i );
						var item = data.get( i );

						// create a node for this element and add it to the stack
						currentNode = nodeManager.create( type, item );
						currentNode.document = document;
						currentStack.push( currentNode );

						// node may contain children
						if ( currentNode.children ) {
							parentStack = currentStack;
							currentStack = [];
							nodeStack.push( currentStack );
						}
						// a closing element
					} else {
						// node may contain children
						if ( currentNode.children ) {
							var children = nodeStack.pop();

							currentStack = parentStack;
							parentStack = nodeStack[ nodeStack.length - 2 ];

							if ( !parentStack ) {
								throw new Error( 'This shouldn\'t happen - check the linear data' );
							}

							currentNode.spliceArray( 0, 0, children );
						}

						currentNode = parentStack[ parentStack.length - 1 ];
					}

					// a text
				} else {
					// start of a text
					if ( !inText ) {
						// create a text node and push it to the stack
						currentNode = nodeManager.create( 'text' );
						currentNode.document = document;
						currentStack.push( currentNode );

						inText = true;
					}

					textLength++;
				}
			}

			// we ended up with text so just update the current node's length
			if ( inText ) {
				currentNode.length = textLength;
			}

			return currentStack;
		},

		// prepare linear data for the given text
		_getDataForText: function( text, parentAttributes ) {
			text = text.split( '' );

			if ( !parentAttributes ) {
				return text;
			}

			return text.map( function( char ) {
				return [ char, parentAttributes ];
			} );
		}
	};

	return converter;
} );