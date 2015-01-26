define( [
	'document',
	'nodemanager',
	'styles/styled-node',
	'tools/utils',
	'nodetypes'
], function(
	Document,
	nodeManager,
	StyledNode,
	utils
) {
	'use strict';

	function Converter() {}

	Converter.prototype = {
		getOperationForChild: function( typeConverter, dom, parentStyle ) {
			var ops = typeConverter.toOperation( dom, parentStyle );

			return [ ops ]; //?????
		},

		getOperationsForDom: function( dom, parent, parentStyle ) {
			var ops = [];

			// add parent element's opening tag
			if ( parent && parent[ 1 ] && parent[ 1 ].type ) {
				ops.push( parent );
			}

			// add operations for child nodes
			[].forEach.call( dom.childNodes, function( child ) {
				var typeConverter,
					childStyle,
					childOps,
					text;

				// element
				if ( child.nodeType === Node.ELEMENT_NODE ) {
					typeConverter = nodeManager.matchForDom( child ) || nodeManager.get( 'unknown' );

					// styled text
					if ( typeConverter.prototype instanceof StyledNode ) {
						childStyle = this.getOperationForChild( typeConverter, child )[ 0 ];
						childOps = this.getOperationsForDom( child, null, utils.extend( {}, parentStyle || {}, childStyle ) );
						// regular element
					} else {
						childOps = this.getOperationForChild( typeConverter, child );
						childOps = this.getOperationsForDom( child, childOps[ 0 ] );
					}

					ops = ops.concat( childOps );
					// text
				} else if ( child.nodeType === Node.TEXT_NODE ) {
					text = child.data;

					// don't add empty text nodes
					if ( text === '' ) {
						return;
					}

					// node contains whitespaces only
					if ( text.match( /^\s+$/ ) ) {
						if ( ops[ ops.length - 1 ] && ops[ ops.length - 1 ][ 0 ] === 1 ) {
							return;
						}
						// TODO is that enough for now?
					}

					childOps = this.getOperationsForText( child.textContent, parentStyle );

					ops = ops.concat( childOps );
				}
			}, this );

			// add parent element's closing tag
			if ( parent && parent[ 1 ] && parent[ 1 ].type ) {
				// TODO should we put a closing tag for a void element?
				ops.push( [ 2, {
					type: parent[ 1 ].type
				} ] );

				dom.dataset.length = ops.length;
			}

			return ops;
		},

		getOperationsForText: function( text, parentStyle ) {
			text = text.split( '' );

			if ( !parentStyle ) {
				return text;
			}

			return text.map( function( char ) {
				return [ char, parentStyle ];
			} );
		},

		getDomForOperations: function( ops, targetElement ) {
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
				return JSON.stringify( a ) === JSON.stringify( b );
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

			for ( i = 0, len = ops.length; i < len; i++ ) {
				// we'll have to modify this a lot
				item = utils.clone( ops[ i ] );

				// tag
				if ( item[ 0 ] === 1 ) {
					type = item[ 1 ].type;
					childElement = this.getDomForOperation( item, doc );

					currentElement.appendChild( childElement );

					// child element may contain data
					if ( !nodeManager.isEmpty( type ) ) {
						currentElement = childElement;
					}
				} else if ( item[ 0 ] === 2 ) {
					// closing tag
					type = item[ 1 ].type;

					if ( !nodeManager.isEmpty( type ) ) {
						// move context to parent node
						currentElement = currentElement.parentNode;
					}

					// text
				} else if ( utils.isString( item ) || utils.isString( item[ 0 ] ) ) {

					// styled text
					if ( Array.isArray( item ) && item[ 1 ] ) {
						var styleStack = [],
							styledElements = [],
							text = [];

						// we want to process a whole chain of "styled text" items
						while (
							( item = utils.clone( ops[ i ] ) ) &&
							( utils.isString( item ) || utils.isString( item[ 0 ] ) ) &&
							item[ 1 ]
						) {
							var styles = [];

							while ( ( typeConverter = nodeManager.matchForOperation( item ) ) ) {
								type = typeConverter.type;

								// make a copy of a style
								var style = utils.pick( item[ 1 ], type );

								styles.push( style );

								// removed the processed style data
								delete item[ 1 ][ type ];
							}

							text.push( item[ 0 ] );

							var diffIdx = styleStack.length ? findDifferenceIndex( styles, styleStack[ styleStack.length - 1 ] ) : 0;

							// no common styles
							if ( diffIdx === 0 ) {
								var textNode = document.createTextNode( text.join( '' ) );

								styledElements.push( textNode );

								text.length = 0;

								styleStack.push( styles );

								// styles are different
							} else if ( diffIdx !== -1 ) {

								styleStack.push( styles );
							}


							i++;
						}

						console.log( styleStack );
						console.log( text );

						i--;

						// TODO find diff index, produce text node and styled node


						/*
						// we want to process a whole chain of "styled text" items
						while (
							( item = utils.clone( ops[ i ] ) ) &&
							( utils.isString( item ) || utils.isString( item[ 0 ] ) ) &&
							item[ 1 ]
						) {
							var styles = [],
								itemElems = [],
								style;

							// process item styles
							while ( ( typeConverter = nodeManager.matchForOperation( item ) ) ) {
								type = typeConverter.type;

								// make a copy of a style
								style = utils.pick( item[ 1 ], type );
								styles.push( style );
								itemElems.push( typeConverter.toDom( item, doc ) );

								// removed the processed style data
								delete item[ 1 ][ type ];
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
							typeConverter = nodeManager.get( 'text' );
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

						*/

						// plain text
					} else {
						var text = [];

						while (
							( item = utils.clone( ops[ i ] ) ) &&
							utils.isString( item )
						) {
							text.push( item );

							i++;
						}

						i--;

						childElement = doc.createTextNode( text.join( '' ) );
						currentElement.appendChild( childElement );
					}
				}
			}
		},

		getDomForOperation: function( operation, doc ) {
			var typeConverter = nodeManager.get( operation[ 1 ].type );

			return typeConverter.toDom( operation, doc );
		},

		getTextForOperation: function( operations, doc ) {
			return doc.createTextNode( operations.map( function( op ) {
				return Array.isArray( op ) ? op[ 0 ] : op;
			} ).join( '' ) );
		}
	};

	return new Converter();
} );