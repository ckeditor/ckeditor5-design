define( [
	'converter',
	'dataprocessor',
	'lineardocumentdata',
	'linearmetadata',
	'nodemanager',
	'store',
	'view',
	'viewmanager',
	'tools/element',
	'tools/emitter',
	'tools/utils'
], function(
	converter,
	dataProcessor,
	LinearDocumentData,
	LinearMetaData,
	nodeManager,
	Store,
	View,
	viewManager,
	Element,
	Emitter,
	utils
) {
	'use strict';

	function Document( $el, editable ) {
		this.store = new Store();

		// reference to the parent editable object
		this.editable = editable;

		// create a detached copy of the source html
		var dom = utils.createDocumentFromHTML( $el.html() ).body;

		// TODO combine the data processing with data conversion loop
		// normalize the DOM
		dataProcessor.normalizeWhitespaces( dom );

		// prepare the data array for the linear data
		var data = converter.getDataForDom( dom, this.store, null, true );

		// document's linear data
		this.data = new LinearDocumentData( data, this.store );
		this.metadata = new LinearMetaData();

		// create document tree root element
		this.root = converter.getNodesForData( this.data, this )[ 0 ];

		this.root.render();
	}

	utils.extend( Document.prototype, Emitter, {
		// apply a transaction to the document - update the linear data and document tree
		applyTransaction: function( transaction ) {
			if ( transaction.applied ) {
				throw new Error( 'The transaction has already been applied.' );
			}

			transaction.applyTo( this );

			this.history.push( transaction );
		},

		// retrieve a branch node located at the given position
		getBranchAtPosition: function( position ) {
			var node = this.getNodeAtPosition( position );

			while ( node && !( node.hasChildren ) ) {
				node = node.parent;
			}

			return node;
		},

		// return an element and offset representing the given position in the linear data
		getDomNodeAndOffset: function( position, attributes ) {
			var item = this.data.get( position );

			if ( !item ) {
				return null;
			}

			attributes = attributes || [];

			var attrFix = 0;

			// we have attributes, but the item does not, or has different ones
			if ( !matchAttributes( item, attributes ) ) {
				var itemBefore;

				do {
					attrFix++;
					position--;

					itemBefore = this.data.get( position );

					if ( typeof itemBefore == 'undefined' ) {
						throw new Error( 'Couldn\'t find a preceding item matching given attributes.' );
					}
				} while ( !matchAttributes( itemBefore, attributes ) );
			}

			var node = this.getBranchAtPosition( position );
			var view = node.view;
			var offset = node.getOffset();

			var parent;

			// position points to an element's opening, return its offset within its parent
			if ( position === offset ) {
				parent = view.getElement().parentNode;

				return {
					node: parent,
					offset: getNodeOffset( parent, view.getElement() )
				};
			}

			// add 1 for node's opening item if needed
			offset += node.isWrapped ? 1 : 0;

			var current = {
				children: view.getElement().childNodes,
				index: 0
			};

			var stack = [ current ];

			while ( stack.length ) {
				// we went through all nodes in the current stack
				if ( current.index >= current.children.length ) {
					stack.pop();
					current = stack[ stack.length - 1 ];
					// process current stack
				} else {
					var child = current.children[ current.index ];

					// child  is a text node, check if the position sits within the child
					if ( child.nodeType === Node.TEXT_NODE ) {
						// position fits this node
						if ( position >= offset && ( position < offset + child.data.length ||
								// position points to an element's opening / closing tag
								( this.data.isElementAt( position ) && position === offset + child.data.length )
							) ) {
							return {
								node: child,
								offset: position - offset + attrFix
							};
						} else {
							offset += child.data.length;
						}
						// child  is an element
					} else if ( child.nodeType === Node.ELEMENT_NODE ) {
						var vid;

						// see if we have a view attached to this node
						if ( child.dataset && ( vid = child.dataset.vid ) && ( view = viewManager.get( vid ) ) ) {
							node = view.node;

							var nodeOffset = node.getOffset();

							if ( position >= nodeOffset && position < nodeOffset + node.length ) {

								if ( position === nodeOffset ) {
									parent = child.parentNode;

									return {
										node: parent,
										offset: getNodeOffset( parent, child )
									};
								}


								current.index++;
								current = {
									children: child.childNodes,
									index: 0
								};

								stack.push( current );

								if ( node.isWrapped ) {
									offset += 1;
								}

								continue;
							} else {
								offset += node.length;
							}
						} else {
							current.index++;

							current = {
								children: child.childNodes,
								index: 0
							};

							stack.push( current );

							continue;
						}
					}

					current.index++;
				}
			}

			// check if two arrays are equal (shallow)
			function areEqualArrays( a, b ) {
				return Array.isArray( a ) && Array.isArray( b ) && a.length === b.length &&
					a.every( function( item, i ) {
						return item === b[ i ];
					} );
			}

			// check if the given item matches the attributes:
			// - item attributes and the attributes are equal
			// - item attributes length is 0 and the attributes length is 0
			// - item is a string and the attributes length is 0
			function matchAttributes( item, attributes ) {
				return ( attributes.length && Array.isArray( item ) && areEqualArrays( item[ 1 ], attributes ) ) ||
					( !attributes.length && !Array.isArray( item ) || areEqualArrays( item[ 1 ], attributes ) );
			}

			function getNodeOffset( parent, node ) {
				for ( var i = 0, len = parent.childNodes.length; i < len; i++ ) {
					if ( parent.childNodes[ i ] === node ) {
						return i;
					}
				}

				return -1;
			}
		},

		// retrieve linear data for the given node
		getNodeData: function( node ) {
			if ( !node ) {
				return;
			}

			var offset = node.getOffset();

			return this.data.slice( offset, offset + node.length );
		},

		// retrieve a node that contains data at the given position
		getNodeAtPosition: function( position ) {
			function findNode( node, offset ) {
				var last = offset + node.length - 1;

				// the position points to this node's first/last item
				if ( position === offset || position === last ) {
					return node;
				}

				var result = null;

				if ( position > offset && position < last ) {
					// node has children so let's check which of them we're looking for
					if ( node.children ) {
						// increment the counter for the node's opening item
						offset++;

						for ( var i = 0, len = node.children.length; i < len; i++ ) {
							var child = node.children[ i ];

							result = findNode( child, offset ) || null;

							if ( result ) {
								return result;
							} else {
								offset += child.length;
							}
						}
					} else {
						result = node;
					}
				}

				return result;
			}

			return findNode( this.root, 0 );
		},

		// TODO exclude internal elements from the offset calculation
		// calculates the offset in the linear data
		getOffsetAndAttributes: function( element, offset ) {
			var that = this;
			// validate the offset first
			if (
				offset < 0 ||
				offset > ( element.nodeType === Node.ELEMENT_NODE ? element.childNodes.length : element.data.length )
			) {
				throw new Error( 'Invalid offset.' );
			}

			var length = 0,
				view, node, searchElem;

			// get attributes for the given element
			var attributes = converter.getAttributesForDomElement( element, this.store );

			if ( element.nodeType === Node.ELEMENT_NODE ) {
				// the selection is at the beginning or end of the element
				if ( element.childNodes.length === 0 || element.childNodes.length === offset ) {
					// the element has a view so we can easily get its offset in the linear data
					if ( ( view = viewManager.getByElement( element ) ) ) {
						node = view.node;

						// node's offset +
						// node's length if we're looking for the node's closing element
						// or + 1 for the opening element
						return {
							attributes: attributes,
							offset: node.getOffset() + ( offset ? node.length : 1 )
						};
					}

					searchElem = element;

					// we'll try to get the offset using the element last child's offset (or its descendant's offset)
					if ( offset ) {
						while ( searchElem.lastChild ) {
							searchElem = searchElem.lastChild;

							if ( ( view = viewManager.getByElement( searchElem ) ) ) {
								node = view.node;

								// node's offset + length to get the closing element's offset
								return {
									attributes: attributes,
									offset: node.getOffset() + node.length
								};
							}
						}
					}
				} else {
					searchElem = element.childNodes[ offset ];
					element = searchPrecedingElem( searchElem );
				}
			} else {
				// include the offset within a text node
				length += offset;

				searchElem = element;
				element = searchPrecedingElem( element );
			}

			// find the closest referring to a view
			while ( !( view = viewManager.getByElement( element ) ) ) {
				// include the element's length in the final offset
				if ( element.nodeType === Node.TEXT_NODE ) {
					length += element.data.length;
				}

				element = searchPrecedingElem( element );
			}

			node = view.node;

			// include the element's length or + 1 opening element if needed
			length += Element.hasAncestor( searchElem, element ) ? 1 : node.length;

			// compute the final offset
			offset = node.getOffset() + length;

			// finds the closest preceding element that has a view attached to it
			function searchPrecedingElem( element ) {
				// use the parent if there's no previous sibling
				while ( !element.previousSibling ) {
					element = element.parentNode;

					if ( !element ) {
						throw new Error( 'Element doesn\'t have a parent with a view attached to it.' );
					}

					// we may use the parent since it has a view
					if ( viewManager.getByElement( element ) ) {
						return element;
					}

					if ( isAffected( element ) ) {
						length += 1;
					}
				}

				element = element.previousSibling;

				// we may use the sibling
				if ( viewManager.getByElement( element ) ) {
					return element;
				}

				if ( isAffected( element ) ) {
					length += 1;
				}

				while ( element.lastChild ) {
					element = element.lastChild;
					// we may use the sibling's descendant
					if ( viewManager.getByElement( element ) ) {
						return element;
					}

					if ( isAffected( element ) ) {
						length += 1;
					}
				}

				return element;
			}

			function isAffected( element ) {
				return element.dataset && element.dataset.affected;
			}

			return {
				attributes: attributes,
				offset: offset
			};
		}
	} );

	return Document;
} );