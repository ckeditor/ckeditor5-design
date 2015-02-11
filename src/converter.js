define( [
	'lineardata',
	'nodemanager',
	'inline/inlinenode',
	'tools/utils',
	'nodetypes'
], function(
	LinearData,
	nodeManager,
	InlineNode,
	utils
) {
	'use strict';

	function Converter() {}

	Converter.prototype = {
		// prepare linear data for the given DOM
		getDataForDom: function( elem, store, parentAttributes, root ) {
			var data = [],
				attributes,
				current;

			// element
			if ( elem.nodeType === Node.ELEMENT_NODE ) {
				var nodeConstructor = root ?
					nodeManager.get( 'root' ) :
					nodeManager.matchForDom( elem ) || nodeManager.get( 'unknown' );

				// inline text
				if ( nodeConstructor.prototype instanceof InlineNode ) {
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
				} else {
					// create an opening data for current element
					current = nodeConstructor.toData( elem );

					data.push( current );
				}

				// collect data for all children
				[].forEach.call( elem.childNodes, function( child ) {
					data = data.concat( this.getDataForDom( child, store, attributes ) );
				}, this );
				// text
			} else if ( elem.nodeType === Node.TEXT_NODE ) {
				var text = elem.data;

				// TODO IMPROOOOOOVE
				// don't add empty text nodes
				if ( text === '' || text.match( /^\s+$/ ) ) {
					return data;
				}

				var textData = this.getDataForText( elem.textContent, parentAttributes );

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

		// prepare linear data for the given text
		getDataForText: function( text, parentAttributes ) {
			text = text.split( '' );

			if ( !parentAttributes ) {
				return text;
			}

			return text.map( function( char ) {
				return [ char, parentAttributes ];
			} );
		},

		// prepare DOM elements for the given data
		getDomElementsForData: function( data, store, doc ) {
			var elementStack = [],
				textStack = [],
				currentElement,
				parentElement;

			function appendToCurrent( child ) {
				currentElement.appendChild( child );
			}

			for ( var i = 0, len = data.length; i < len; i++ ) {
				var item = data[ i ],
					nodeConstructor;

				// text or styled-text
				if ( utils.isString( item ) || utils.isArray( item ) ) {
					// push the text item to the stack
					textStack.push( item );
					// element
				} else if ( utils.isObject( item ) ) {
					// flush the text stack
					if ( textStack.length ) {
						nodeConstructor = nodeManager.get( 'text' );

						var childElements = nodeConstructor.toDom( textStack, doc, store );

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

					var nodeType = LinearData.getType( item );

					nodeConstructor = nodeManager.get( nodeType ) || nodeManager.get( 'unknown' );

					// opening element
					if ( LinearData.isOpenElement( item ) ) {
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
					} else if ( LinearData.isCloseElement( item ) ) {
						currentElement = currentElement.parentNode;
						parentElement = currentElement ? currentElement.parentNode : null;
					}
				}
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
		}
	};

	return new Converter();
} );