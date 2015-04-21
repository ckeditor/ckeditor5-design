define( [
	'node',
	'nodemanager',
	'tools/utils'
], function(
	Node,
	nodeManager,
	utils
) {
	'use strict';

	function TextNode() {
		Node.apply( this, arguments );
	}

	utils.extend( TextNode, Node, {
		isEmpty: true,
		isWrapped: false,
		type: 'text',

		toData: function( dom ) {
			var text = dom.textContent;

			return text.split( '' );
		},

		toDom: function( data, doc, store ) {
			var elementStack = [],
				text = [],
				parentStack,
				currentStyles,
				currentStack;

			// find where the two arrays of styles differ and return the difference index (-1 if they are the same)
			function diffStyles( a, b ) {
				var diffIndex = -1;

				// second array is longer so let's swap them
				if ( b.length > a.length ) {
					var tmp = a;

					a = b;
					b = tmp;
				}

				a.some( function( value, index ) {
					// element at this index is different
					if ( value !== b[ index ] ) {
						diffIndex = index;

						return true;
					}
				} );

				return diffIndex;
			}

			// create DOM elements for the given style
			function getStyledElement( id ) {
				var styleDef = store.get( id ),
					styleConstructor = nodeManager.matchStyleForData( styleDef );

				return styleConstructor.toDom( styleDef, doc );
			}

			// prepare array of DOM elements for the given set of styles
			function getStyledElements( styles ) {
				var result = [];

				styles.forEach( function( id ) {
					var elem = getStyledElement( id );
					result.push( [ elem ] );
				} );

				return result;
			}

			// append children elements to parent element located at index = 0
			// input stack looks as follows: [<elem>, child, child, [ childStack ], ... ]
			function appendToParent( stack ) {
				if ( utils.isArray( stack ) ) {
					var parent = stack.shift();

					stack.forEach( function( child ) {
						parent.appendChild(
							Array.isArray( child ) ? appendToParent( child ) : child
						);
					} );

					return parent;
				}

				return stack;
			}

			// create a text node from the buffer, push it to the current stack and empty the
			function flushTextBuffer() {
				if ( text.length ) {
					var textNode = doc.createTextNode( text.join( '' ) );
					text.length = 0;
					currentStack.push( textNode );
				}
			}

			// append current elements to their parents
			function flushParentStack() {
				if ( parentStack && parentStack.length ) {
					for ( var j = parentStack.length - 1; j > 0; j-- ) {
						parentStack[ j - 1 ].push( parentStack[ j ] );
					}

					elementStack.push( parentStack[ 0 ] );
					parentStack = null;
				}
			}


			for ( var i = 0, len = data.length; i < len; i++ ) {
				var item = data[ i ];

				// it's a styled text
				if ( utils.isArray( item ) ) {
					var styles = item[ 1 ];
					// an index on which two style arrays differ
					var diffIndex = diffStyles( styles, currentStyles || [] );

					// no styled items before or styles are completely different
					if ( diffIndex === 0 ) {
						currentStyles = styles;
						flushTextBuffer();
						flushParentStack();

						parentStack = getStyledElements( styles );
						currentStack = parentStack[ parentStack.length - 1 ];

						// styles are different at some point
					} else if ( diffIndex > 0 ) {
						currentStyles = styles;
						flushTextBuffer();

						var removed = parentStack.splice( diffIndex, parentStack.length - diffIndex );

						// append removed elements to their parents
						if ( removed.length ) {
							for ( var j = removed.length - 1; j > 0; j-- ) {
								removed[ j - 1 ].push( removed[ j ] );
							}

							// append it to the last element of the parent stack
							parentStack[ parentStack.length - 1 ].push( removed[ 0 ] );
						}

						var toAdd = styles.slice( diffIndex );

						// add new elements to the parent stack
						if ( toAdd.length ) {
							var newStyledElements = getStyledElements( toAdd );
							parentStack = parentStack.concat( newStyledElements );
						}

						currentStack = parentStack[ parentStack.length - 1 ];
					}

					// add the item's text to the buffer
					text.push( item[ 0 ] );

					// a plain text
				} else {
					// append current elements to their parents
					flushParentStack();

					// set the currentStack back to the elementStack
					if ( currentStack !== elementStack ) {
						flushTextBuffer();
						currentStack = elementStack;
						// clear styles
						currentStyles = null;
					}
					// it's a plain text so just push it to the buffer
					text.push( item );
				}
			}

			// append final data
			flushParentStack();
			flushTextBuffer();

			// append child elements to its parents
			elementStack = elementStack.map( appendToParent );

			return elementStack;
		}
	} );

	utils.inherit( TextNode, Node );

	nodeManager.register( TextNode );

	return TextNode;
} );