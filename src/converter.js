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
				var nodeConstructor;

				nodeConstructor = root ?
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
					var childData = this.getDataForDom( child, store, attributes );

					if ( childData && childData.length ) {
						data = data.concat( childData );
					}
				}, this );
				// text
			} else if ( elem.nodeType === Node.TEXT_NODE ) {
				var text = elem.data;

				// TODO IMPROOOOOOVE
				// don't add empty text nodes
				if ( text === '' || text.match( /^\s+$/ ) ) {
					return;
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
		}
	};

	return new Converter();
} );