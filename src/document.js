define( [
	'converter',
	'dataprocessor',
	'lineardocumentdata',
	'linearmetadata',
	'position',
	'store',
	'viewmanager',
	'tools/element',
	'tools/emitter',
	'tools/utils'
], function(
	converter,
	dataProcessor,
	LinearDocumentData,
	LinearMetaData,
	Position,
	Store,
	viewManager,
	Element,
	Emitter,
	utils
) {
	'use strict';

	function Document( $el ) {
		this.store = new Store();

		// create a detached copy of the source HTML
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

		// TODO exclude internal elements from calculations
		// return an element and offset representing the given position in the linear data
		getDomNodeAndOffset: function( position, attributes ) {
			var child, sibling, ancestor, ancestorAttributes;

			var parent = this.getBranchAtPosition( position );

			if ( !parent ) {
				throw new Error( 'No branch at the given position.' );
			}

			var offset = parent.offset;

			// now work with the actual DOM element
			parent = parent.view.getElement();

			// position points to the parent node
			if ( position === offset && !attributes.length ) {
				sibling = parent.previousSibling;

				// there's a text node right before the parent, let's use it
				if ( sibling && sibling.nodeType === Node.TEXT_NODE ) {
					return {
						node: sibling,
						offset: sibling.data.length
					};
				}

				return {
					node: parent.parentNode,
					offset: getNodeOffset( parent )
				};
			}

			// +1 for the parent's opening tag
			offset++;

			var current = {
				children: parent.childNodes,
				index: 0
			};

			var stack = [ current ];

			while ( stack.length ) {
				// we went through all nodes in the current stack
				if ( current.index >= current.children.length ) {
					stack.pop();
					current = stack[ stack.length - 1 ];
					continue;
				}

				child = current.children[ current.index ];

				// move to another node in the next loop
				current.index++;

				// child  is a text node, check if the position sits within the child
				if ( child.nodeType === Node.TEXT_NODE ) {
					// position fits in this text node
					if ( position >= offset && position < offset + child.data.length ) {
						var childAttributes = converter.getAttributesForDomElement( child, this.store );

						// child attributes match the attributes so we return the text node and offset
						if ( utils.areEqual( childAttributes, attributes ) ) {
							return {
								node: child,
								offset: position - offset
							};
						}

						// text node doesn't meet the criteria, let's check its ancestors
						ancestor = child;
						// traverse ancestors up to the parent node
						while ( ( ancestor = ancestor.parentNode ) !== parent ) {
							ancestorAttributes = converter.getAttributesForDomElement( ancestor.parentNode, this.store );

							// ancestor's attributes match the attributes
							if ( utils.areEqual( ancestorAttributes, attributes ) ) {
								return {
									node: ancestor.parentNode,
									offset: getNodeOffset( ancestor )
								};
							}
						}
						// we're at the end of a text node and child attributes match the attributes
						// so we can return the text node and offset
					} else if ( position === offset + child.data.length &&
						utils.areEqual( converter.getAttributesForDomElement( child, this.store ), attributes ) ) {

						return {
							node: child,
							offset: position - offset
						};
					}

					// include the text node's length in the offset and proceed
					offset += child.data.length;
				}

				// child is an element
				if ( child.nodeType === Node.ELEMENT_NODE ) {
					var view;

					// we have a view attached to this node
					if ( ( view = viewManager.getByElement( child ) ) ) {
						var node = view.node;

						if ( position === node.offset ) {
							return {
								node: child.parentNode,
								offset: getNodeOffset( child )
							};
						}

						// include the node's length in the offset and proceed
						offset += node.length;
						// there's no view, let's process child's children
					} else {
						// add current node's children to the stack to be processed in the next loop
						current = {
							children: child.childNodes,
							index: 0
						};

						stack.push( current );
					}
				}
			}

			// we went through all the children, check last child's ancestors if they match the offset and attributes
			if ( position === offset ) {
				ancestor = child.parentNode;

				// traverse ancestors up to the parent node
				while ( ancestor !== parent ) {
					ancestorAttributes = converter.getAttributesForDomElement( ancestor.parentNode, this.store );

					// ancestor's attributes match the attributes
					if ( utils.areEqual( ancestorAttributes, attributes ) ) {
						return {
							node: ancestor.parentNode,
							// + include the node in the final offset
							offset: getNodeOffset( ancestor ) + 1
						};
					}

					ancestor = ancestor.parentNode;
				}

				return {
					node: child.parentNode,
					offset: getNodeOffset( child ) + 1
				};
			} else {
				throw new Error( 'Couldn\'t find a node and offset' );
			}

			// find a node's offset in a parent element
			function getNodeOffset( node ) {
				return [].indexOf.call( node.parentNode.childNodes, node );
			}
		},

		// retrieve linear data for the given node
		getNodeData: function( node ) {
			var offset = node.offset;

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
		// calculates the offset and attributes in the linear data
		// and returns a Position object
		getOffsetAndAttributes: function( element, offset ) {
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

			// it's an element
			if ( element.nodeType === Node.ELEMENT_NODE ) {
				// the selection is at the end of the element
				if ( element.childNodes.length === offset ) {
					// the element has a view so we can easily get its offset in the linear data
					if ( ( view = viewManager.getByElement( element ) ) ) {
						node = view.node;

						// node's offset + node's length - 1 for the node's closing element
						return new Position( node.offset + node.length - 1, attributes );
					}

					searchElem = element;

					while ( searchElem.lastChild ) {
						searchElem = searchElem.lastChild;

						// include last text node's length in the offset
						if ( searchElem.nodeType === Node.TEXT_NODE ) {
							length += searchElem.data.length;
						}
					}
				} else {
					searchElem = element.childNodes[ offset ];
				}
			} else {
				// include the offset within a text node
				length += offset;
				searchElem = element;
			}

			element = searchElem;

			// find the closest element referring to a view
			do {
				element = findClosest( element );

				// include the element's length in the final offset
				if ( element.nodeType === Node.TEXT_NODE ) {
					length += element.data.length;
				}
			} while ( !( view = viewManager.getByElement( element ) ) );

			node = view.node;

			// include the node's length or + 1 for opening element if needed
			length += Element.hasAncestor( searchElem, element ) ? 1 : node.length;

			// compute the final offset
			offset = node.offset + length;

			// finds the closest preceding element that has a view attached to it
			function findClosest( element ) {
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
				}

				// check the previous sibling
				element = element.previousSibling;

				// we may use the sibling
				if ( viewManager.getByElement( element ) ) {
					return element;
				}

				while ( element.lastChild ) {
					element = element.lastChild;
				}

				return element;
			}

			return new Position( offset, attributes );
		}
	} );

	return Document;
} );