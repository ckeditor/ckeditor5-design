define( [
	'lineardocumentdata',
	'nodemanager',
	'tools/utils',
	'nodetypes' // added as last just to force loading the module
], function(
	LinearDocumentData,
	nodeManager,
	utils
) {
	'use strict';

	var converter = {
		// retrieve an array of attributes for the given element
		getAttributesForDomElement: function( element, store ) {
			var result = [],
				constructors = nodeManager.get();

			// we care about actual elements only
			if ( element.nodeType === window.Node.TEXT_NODE ) {
				element = element.parentNode;
			}

			var options = {
				element: element,
				onAttributes: function( attributes ) {
					// store a style (or get it's index from the store) and add it to results
					var index = store.store( attributes );
					result.unshift( index );
				}
			};

			while ( options.element ) {
				for ( var i = 0, len = constructors.length; i < len; i++ ) {
					var constructor = constructors[ i ];

					if ( constructor.match( options ) && constructor.inline ) {
						constructor.toData( options );
					}
				}

				options.element = options.element.parentNode;
			}

			return result;
		},

		// return an object containing data and a node produced for the given DOM element
		getDataAndNodeForElement: function( element, store, parentAttributes, document, isRoot ) {
			var constructors = nodeManager.get(),
				attributes = parentAttributes ? parentAttributes.slice() : [],
				result = {},
				data = [],
				textNode,
				current,
				node,
				len,
				i;

			// add new attributes
			function onAttributes( attrs ) {
				var index = store.store( attrs );
				options.attributes.push( index );
			}

			// add new data
			function onData( items ) {
				data = data.concat( items );
			}

			// replace the element with new one
			function onElement( el ) {
				options.element = el;
			}

			// set current item
			function onItem( item ) {
				current = item;
			}

			var options = {
				element: element,
				attributes: attributes,
				onAttributes: onAttributes,
				onData: onData,
				onElement: onElement,
				onItem: onItem
			};

			// handle root node
			if ( isRoot ) {
				nodeManager.get( 'root' ).toData( options );
			} else {
				// process with all constructors as long as there's still an element to work with
				for ( i = 0, len = constructors.length; i < len && options.element; i++ ) {
					if ( constructors[ i ].match( options ) ) {
						constructors[ i ].toData( options );
					}
				}
			}

			// create a node for the current item
			if ( current ) {
				data.push( current );
				node = nodeManager.create( current );
				node.document = document;
			}

			// process child nodes
			if ( options.element && options.element.childNodes ) {
				for ( i = 0, len = options.element.childNodes.length; i < len; i++ ) {
					var output = this.getDataAndNodeForElement( options.element.childNodes[ i ], store, attributes, document );

					data = data.concat( output.data );

					if ( output.node && node ) {
						// "close" the text node
						if ( textNode ) {
							node.children.push( textNode );
							textNode = null;
						}

						node.children.push( output.node );
						output.node.document = document;
						output.node.parent = node;
					} else if ( output.data && output.data.length && !output.node ) {
						if ( !textNode ) {
							textNode = nodeManager.create( 'text' );
							textNode.document = document;
							textNode.parent = node;
						}

						textNode.adjustLength( output.data.length );
					}
				}
			}

			result.data = data;

			// close current item
			if ( current ) {
				data.push( {
					type: '/' + current.type
				} );

				// adjust the length by adding child data (exclude opening/closing elements)
				node.adjustLength( data.length - 2 );

				result.node = node;

				if ( textNode ) {
					node.children.push( textNode );
				}
			}

			return result;
		},

		// return data produced for the given DOM element
		getDataForDom: function( element, store, parentAttributes, isRoot ) {
			var constructors = nodeManager.get(),
				data = [],
				attributes = parentAttributes ? parentAttributes.slice() : [],
				current,
				len,
				i;

			// replace the element with new one
			function onElement( el ) {
				options.element = el;
			}

			// add new data
			function onData( items ) {
				data = data.concat( items );
			}

			// set the current item
			function onItem( item ) {
				current = item;
				data.push( item );
			}

			// add new attributes
			function onAttributes( attrs ) {
				var index = store.store( attrs );
				options.attributes.push( index );
			}

			var options = {
				element: element,
				attributes: attributes,
				onAttributes: onAttributes,
				onData: onData,
				onElement: onElement,
				onItem: onItem
			};

			// handle root node
			if ( isRoot ) {
				nodeManager.get( 'root' ).toData( options );
			} else {
				// process with all constructors as long as there's still an element to work with
				for ( i = 0, len = constructors.length; i < len && options.element; i++ ) {
					if ( constructors[ i ].match( options ) ) {
						constructors[ i ].toData( options );
					}
				}
			}

			// process child nodes
			if ( options.element && options.element.childNodes ) {
				for ( i = 0, len = options.element.childNodes.length; i < len; i++ ) {
					var result = this.getDataAndNodeForElement( options.element.childNodes[ i ], store, attributes );

					data = data.concat( result.data );
				}
			}

			// close the current item
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

					nodeConstructor = nodeManager.get( nodeType );

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
						// create a node for this element and add it to the stack
						currentNode = nodeManager.create( data.get( i ) );
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
		}
	};

	return converter;
} );