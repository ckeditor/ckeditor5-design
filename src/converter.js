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
		createDocumentFromHTML: function( html ) {
			if ( DOMParser ) {
				var parser = new DOMParser();

				return parser.parseFromString( html, 'text/html' );
			} else {
				// TODO handle IE < 10
			}
		},

		getOperationForChild: function( typeConverter, dom, parentStyle ) {
			var ops = typeConverter.toOperation( dom, parentStyle );

			return [ ops ]; // TODO ?????
		},

		getOperationsForDom: function( dom, parent, parentStyle ) {
			var ops = [];

			// add parent element's opening tag
			if ( utils.isObject( parent ) && parent.type ) {
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
						if ( ops[ ops.length - 1 ] && ops[ ops.length - 1 ].type ) {
							return;
						}
						// TODO is that enough for now?
					}

					childOps = this.getOperationsForText( child.textContent, parentStyle );

					ops = ops.concat( childOps );
				}
			}, this );

			// add parent element's closing tag
			if ( utils.isObject( parent ) && parent.type ) {
				// TODO should we put a closing tag for a void element?
				ops.push( {
					type: '/' + parent.type
				} );

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

		// TODO REWRITE
		/*
		getDomForOperations: function( ops, targetElement ) {
			var currentElement = targetElement,
				doc = targetElement.ownerDocument,
				text = [],
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
							styledElements = [];

						// we want to process a whole chain of "styled text" items
						while (
							( item = utils.clone( ops[ i ] ) ) &&
							( utils.isString( item ) || utils.isString( item[ 0 ] ) ) &&
							item[ 1 ]
						) {
							var styles = [],
								styledItems = [];

							while ( ( typeConverter = nodeManager.matchForOperation( item ) ) ) {
								type = typeConverter.type;

								// make a copy of a style
								var style = utils.pick( item[ 1 ], type );
								styles.push( style );

								// TODO - NOPE
								var styledItem = typeConverter.toDom( item, doc );
								styledItems.push( styledItem );

								// removed the processed style data
								delete item[ 1 ][ type ];
							}

							text.push( item[ 0 ] );

							var diffIdx = styleStack.length ? findDifferenceIndex( styles, styleStack[ styleStack.length - 1 ] ) : 0;

							// no common styles
							if ( diffIdx === 0 ) {
								if ( styledElements.length > 1 ) {
									for ( var j = 1; j < styledElements.length; j++ ) {
										styledElements[ j - 1 ].appendChild( styledElements[ j ] );
									}

									currentElement.appendChild( styledElements[ 0 ] );
								}


								styledElements.length = 0;
								styledElements = styledElements.concat( styledItems );

								styleStack.push( styles );

								// styles are different
							} else if ( diffIdx !== -1 ) {
								var textNode = document.createTextNode( text.join( '' ) );

								text.length = 0;

								styledElements[ styledElements.length - 1 ].appendChild( textNode );

								styleStack.push( styles );
							}


							i++;
						}

						i--;

						// plain text
					} else {
						text = [];

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
		*/

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