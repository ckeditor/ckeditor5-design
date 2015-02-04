define( [
	'lineardata',
	'nodemanager',
	'store',
	'inline/inlinenode',
	'tools/utils',
	'nodetypes'
], function(
	LinearData,
	nodeManager,
	store,
	InlineNode,
	utils
) {
	'use strict';

	function Converter() {}

	Converter.prototype = {
		// prepare linear data for the given DOM
		getDataForDom: function( dom, wrapper, parentAttributes ) {
			var data = [];

			var isWrapper = false,
				hasWrapper = false,
				wrapperConstructor;

			function wrap() {
				if ( !isWrapper && !hasWrapper ) {
					data.push( {
						type: 'paragraph',
						internal: {
							temporary: true
						}
					} );

					hasWrapper = true;
				}
			}

			function unwrap() {
				if ( hasWrapper ) {
					data.push( {
						type: '/paragraph'
					} );

					hasWrapper = false;
				}
			}

			// check if the wrapper exists and expects content
			if ( wrapper === true ||
				(
					wrapper &&
					( wrapperConstructor = nodeManager.get( wrapper.type ) ) &&
					wrapperConstructor.hasContent
				)
			) {
				isWrapper = true;
			}

			// add wrapper's opening element
			if ( utils.isObject( wrapper ) && wrapper.type ) {
				data.push( wrapper );
			}

			// add data for child nodes
			[].forEach.call( dom.childNodes, function( child ) {
				var childData;

				// element
				if ( child.nodeType === Node.ELEMENT_NODE ) {
					// TODO allow using multiple constructors no a single node
					var nodeConstructor = nodeManager.matchForDom( child ) || nodeManager.get( 'unknown' );

					// inline text
					if ( nodeConstructor.prototype instanceof InlineNode ) {
						// inline node's data contains attributes only
						var childAttributes = nodeConstructor.toData( child );

						// get index of a style in the store
						var index = store.store( childAttributes );

						// merge child's and parent's styles
						childAttributes = [].concat( parentAttributes || [] );

						// add child's style
						if ( childAttributes.indexOf( index ) === -1 ) {
							childAttributes.push( index );
						}

						// wrap the content in a temporary paragraph
						wrap();

						// collect data for all children
						childData = this.getDataForDom( child, isWrapper || hasWrapper, childAttributes );

						// regular element
					} else {
						var parentData = nodeConstructor.toData( child );

						childData = this.getDataForDom( child, parentData );

						// close the remaining wrapper
						unwrap();
					}

					data = data.concat( childData );
					// text
				} else if ( child.nodeType === Node.TEXT_NODE ) {
					var text = child.data;

					// don't add empty text nodes
					if ( text === '' ) {
						return;
					}

					// node contains whitespaces only
					if ( text.match( /^\s+$/ ) ) {
						// there's an element opening data before the text so ignore it
						if ( data[ data.length - 1 ] && data[ data.length - 1 ].type ) {
							return;
						}

						// TODO is that enough for now?
					}

					childData = this.getDataForText( child.textContent, parentAttributes );

					// wrap the content in a temporary paragraph
					wrap();


					data = data.concat( childData );
				}
			}, this );

			// close the remaining wrapper
			unwrap();

			// add wrapper element's closing tag
			if ( utils.isObject( wrapper ) && wrapper.type ) {
				data.push( {
					type: '/' + wrapper.type
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
		getDomElementsForData: function( data, doc ) {
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
						// TODO remove temporary wrappers

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
		}
	};

	return new Converter();
} );