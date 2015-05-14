define( [
	'converter',
	'lineardocumentdata',
	'linearmetadata',
	'nodemanager',
	'position',
	'selection',
	'store',
	'viewmanager',
	'tools/arraydiff',
	'tools/element',
	'tools/emitter',
	'tools/utils'
], function(
	converter,
	LinearDocumentData,
	LinearMetaData,
	nodeManager,
	Position,
	Selection,
	Store,
	viewManager,
	diff,
	Element,
	Emitter,
	utils
) {
	'use strict';

	function Document( $el ) {
		// Store for attributes, so we keep only IDs in the linearData.
		this.store = new Store();

		// create a detached copy of the source HTML
		var dom = utils.createDocumentFromHTML( $el.html() ).body;

		// document's selection API
		this.selection = new Selection( this, $el.getElement().ownerDocument );

		// prepare document data
		var data = converter.getDataAndNodeForElement( dom, this.store, null, this, true );

		// document's linear data
		this.data = new LinearDocumentData( data.data, this.store );
		this.metadata = new LinearMetaData();

		// assign root node and render it
		this.root = data.node;
		this.root.render();
	}

	utils.extend( Document.prototype, Emitter, {
		// apply a transaction to the document - update the linear data and document tree
		applyTransaction: function( transaction, forceRender ) {
			if ( transaction.applied ) {
				throw new Error( 'The transaction has already been applied.' );
			}

			this.trigger( 'transaction:start', transaction );

			// a counter representing the current offset in the linear data
			var offset = 0;
			// a counter representing the number of inserted data items
			var added = 0;
			// a counter representing the number of removed data items
			var removed = 0;
			// a beginning offset used later to find out what was the first node affected by changes
			var leftOffset = null;

			// apply operations to the document's linear data
			for ( var i = 0, len = transaction.operations.length; i < len; i++ ) {
				var operation = transaction.operations[ i ];

				// update the offset
				if ( operation.retain ) {
					offset += operation.retain;
				}

				// find the first offset we'll work on
				if ( leftOffset === null ) {
					leftOffset = offset;
				}

				// insert new data
				if ( operation.insert ) {
					// update the linear data
					this.data.splice( offset, 0, operation.insert );

					added++;

					// we must move to the next data element, otherwise a subsequent inserted character
					// would come in before the previously added character
					offset++;
				}

				// remove data
				if ( operation.remove ) {
					// update the linear data
					this.data.splice( offset, 1 );

					removed++;
				}
			}

			// calculate the ending offset to locate the last affected node
			var rightOffset = offset - added + removed - ( removed > 0 ? 1 : 0 );

			// rework the adjacent text node instead of inserting another one next to it
			if ( !this.data.isElementAt( leftOffset ) &&
				!this.data.isElementAt( leftOffset - 1 ) && leftOffset ) {
				leftOffset--;
			}

			// first and last affected nodes
			var firstNode = this.getNodeAtPosition( leftOffset );
			var lastNode = this.getNodeAtPosition( rightOffset );

			// update the document tree
			if ( forceRender ) {
				// we found a text node but to rebuild the tree we need something that refers to the actual DOM element
				if ( !firstNode.isWrapped ) {
					firstNode = firstNode.parent;
				}

				if ( !lastNode.isWrapped ) {
					lastNode = lastNode.parent;
				}

				// the first node is an ancestor of the last node so let's rework that one
				if ( lastNode.hasAncestor( firstNode ) ) {
					lastNode = firstNode;
				}

				// first affected node's parent
				var parent = firstNode.parent,
					start, end, data, newNodes;

				if ( parent ) {
					// beginning of the data to be rebuilt
					start = firstNode.offset;
					// end of the data to be rebuilt
					end = lastNode.offset + lastNode.length + added - removed;
					// a subset of linear data for new tree nodes
					data = this.data.sliceInstance( start, end );
					// initial length of the parent node, will be used later to update lengths of its ancestors
					var parentLength = parent.length;

					// extend the range to produce a valid set of nodes
					if ( !data.isValid() ) {
						// depth of the invalid node
						validateData( data );

						parent = firstNode.parent;
						parentLength = parent.length;
						start = firstNode.offset;
						end = lastNode.offset + lastNode.length + added - removed;
						data = this.data.sliceInstance( start, end );
					}

					newNodes = converter.getNodesForData( data, this );

					var firstIdx = parent.indexOf( firstNode );
					var lastIdx = parent.indexOf( lastNode );

					updateTree( parent, parent.children.slice( firstIdx, lastIdx + 1 ), newNodes );

					var parentNode = parent;
					var deltaLength = parentNode.length - parentLength;

					// update lengths of all the parent's ancestors
					while ( deltaLength && ( parentNode = parentNode.parent ) ) {
						parentNode.adjustLength( deltaLength );
					}
					// we're working with the root node
				} else if ( firstNode.type === 'root' ) {
					start = leftOffset;
					end = start + added - removed;
					data = this.data.sliceInstance( start, end );
					newNodes = converter.getNodesForData( data, this );

					// node that's currently at the insertion position
					var currentNode = this.getNodeAtPosition( start );

					var idx = currentNode && currentNode.parent ?
						// insert at currentNode's position
						currentNode.parent.indexOf( currentNode ) :
						// insert at the end of the parent
						firstNode.childLength;

					firstNode.spliceArray( idx, 0, newNodes );
				} else {
					throw new Error( 'WAT?' );
				}

				// no structural changes - just update lengths of the nodes
			} else {
				if ( lastNode.type !== 'text' ) {
					if ( this.data.isCloseElementAt( offset ) ) {
						lastNode = lastNode.children[ lastNode.childLength - 1 ];
					} else {
						lastNode = lastNode.previousSibling;
					}
				}

				// a single text node was affected
				if ( firstNode === lastNode ) {
					var delta = added - removed;
					var node = firstNode;

					// update lengths of affected nodes
					while ( node ) {
						node.adjustLength( delta );
						node = node.parent;
					}

					// mulitple nodes affected, what now?
				} else {
					throw new Error( 'Houston, we\'ve got a problem...' );
				}
			}

			// mark the transaction as applied
			transaction.applied = true;

			this.trigger( 'transaction:end', transaction );

			// recursively compares arrays of nodes and applies necessary changes to the given parent
			function updateTree( parent, oldChildren, newChildren ) {
				var edits = diff( oldChildren, newChildren, function( a, b ) {
					// nodes are "equal" if their data matches
					// TODO what about text nodes? how to force re-render without replacing the nodes
					// TODO what about changing type of a node leaving the children as they are
					return a.data && a.children && a.data === b.data;
				} );

				var added = 0,
					removed = 0,
					lastMatching = null,
					// the first index on which we should add new children to the parent
					addIndex = oldChildren[ 0 ] && parent.indexOf( oldChildren[ 0 ] ) || 0,
					stack = [],
					last;

				// process the edits
				for ( var i = 0, len = edits.length + 1; i < len; i++ ) {
					var edit = edits[ i ];

					// dump the stack
					if ( last !== edit ) {
						// insert new child nodes
						if ( last === diff.INSERT ) {
							if ( lastMatching ) {
								addIndex = parent.indexOf( lastMatching ) + 1;
							}

							// place new children relative to the old matching child
							parent.spliceArray( addIndex, 0, stack );

							// last added node becomes the last matching item
							lastMatching = stack[ stack.length - 1 ];

							added += stack.length;
						}

						// remove old child nodes
						if ( last === diff.DELETE ) {
							parent.splice( parent.indexOf( stack[ 0 ] ), stack.length );

							removed += stack.length;
						}

						stack = [];

						last = edit;
					}

					var oldChild = oldChildren[ i - added ];
					var newChild = newChildren[ i - removed ];

					// save a new child node to be added
					if ( edit === diff.INSERT ) {
						stack.push( newChild );
					}

					// save an old child node to be removed
					if ( edit === diff.DELETE ) {
						stack.push( oldChild );
					}

					// nodes match so we have to rework the children of the old node
					if ( edit === diff.EQUAL ) {
						var oldChildLength = oldChild.length;

						updateTree( oldChild, [].concat( oldChild.children ), [].concat( newChild.children ) );

						// adjust the length of the parent node
						parent.adjustLength( oldChild.length - oldChildLength );

						// the old nodes becomes the last matching item
						lastMatching = oldChild;
					}
				}
			}

			// checks if all the elements were properly closed, if not, update firstNode and lastNode
			function validateData( data ) {
				var open = [],
					close = [],
					len, i;

				for ( i = 0, len = data.length; i < len; i++ ) {
					if ( data.isOpenElementAt( i ) ) {
						open.push( data.get( i ) );
					} else if ( data.isCloseElementAt( i ) ) {
						var lastOpened = open.pop();

						if ( lastOpened && data.getTypeAt( i ) !== data.constructor.getType( lastOpened ) ) {
							open.push( lastOpened );
						} else if ( !lastOpened ) {
							close.push( data.get( i ) );
						}
					}
				}

				var depth = open.length;

				// go up to a valid parent
				while ( depth ) {
					lastNode = lastNode.parent;
					depth--;
				}

				depth = close.length;

				// go up to a valid parent
				while ( depth ) {
					firstNode = firstNode.parent;
					depth--;
				}
			}
		},

		// retrieve a branch node located at the given position
		getBranchAtPosition: function( position ) {
			var node = this.getNodeAtPosition( position );

			while ( node && !( node.hasChildren ) ) {
				node = node.parent;
			}

			return node;
		},

		// TODO exclude dirty (UI internal) elements from calculations
		// return an element and offset representing the given position in the linear data
		getDomNodeAndOffset: function( position, attributes ) {
			var child, element, ancestor, attrs;

			var parent = this.getBranchAtPosition( position );

			if ( !parent ) {
				throw new Error( 'No branch at the given position.' );
			}

			var offset = parent.offset;

			// now work with the actual DOM element
			var parentEl = parent.view.getElement();

			// position points to the parent node so we most likely want to work with the previous sibling
			if ( position === offset ) {
				element = parentEl.previousSibling;

				// see if the sibling or any of its children match the attributes
				if ( attributes.length ) {
					do {
						attrs = converter.getAttributesForDomElement( element, this.store );

						if ( utils.areEqual( attrs, attributes ) ) {
							return {
								node: element,
								offset: element.data ? element.data.length : element.childNodes.length
							};
						}
					} while ( ( element = element.lastChild ) );
				} else {
					// there's a text node right before the parent, let's use it
					if ( element && element.nodeType === window.Node.TEXT_NODE ) {
						return {
							node: element,
							offset: element.data.length
						};
					}

					return {
						node: parentEl.parentNode,
						offset: getNodeOffset( parentEl )
					};
				}
			}

			// +1 for the parent's opening tag
			offset++;

			var current = {
				children: parentEl.childNodes,
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
				if ( child.nodeType === window.Node.TEXT_NODE ) {
					// position fits in this text node
					if ( position >= offset && position < offset + child.data.length ) {
						attrs = converter.getAttributesForDomElement( child, this.store );

						// child attributes match the attributes so we return the text node and offset
						if ( utils.areEqual( attrs, attributes ) ) {
							return {
								node: child,
								offset: position - offset
							};
						}

						// text node doesn't meet the criteria, let's check its ancestors
						ancestor = child;
						// traverse ancestors up to the parent node
						while ( ( ancestor = ancestor.parentNode ) !== parentEl ) {
							attrs = converter.getAttributesForDomElement( ancestor.parentNode, this.store );

							// ancestor's attributes match the attributes
							if ( utils.areEqual( attrs, attributes ) ) {
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
				if ( child.nodeType === window.Node.ELEMENT_NODE ) {
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
				while ( ancestor !== parentEl ) {
					attrs = converter.getAttributesForDomElement( ancestor.parentNode, this.store );

					// ancestor's attributes match the attributes
					if ( utils.areEqual( attrs, attributes ) ) {
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

		// TODO exclude dirty (UI internal) elements from the offset calculation
		// calculates the offset and attributes in the linear data
		// and returns a Position object
		getOffsetAndAttributes: function( element, offset ) {
			// validate the offset first
			if (
				offset < 0 ||
				offset > ( element.nodeType === window.Node.ELEMENT_NODE ? element.childNodes.length : element.data.length )
			) {
				throw new Error( 'Invalid offset.' );
			}

			var length = 0,
				view, node, searchElem;

			// get attributes for the given element
			var attributes = converter.getAttributesForDomElement( element, this.store );

			// it's an element
			if ( element.nodeType === window.Node.ELEMENT_NODE ) {
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
						if ( searchElem.nodeType === window.Node.TEXT_NODE ) {
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
				if ( element.nodeType === window.Node.TEXT_NODE ) {
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

					// include the opening tag for a mutated element
					adjustLength( element );
				}

				// check the previous sibling
				element = element.previousSibling;

				// we may use the sibling
				if ( viewManager.getByElement( element ) ) {
					return element;
				}

				// include the opening tag for a mutated element
				adjustLength( element );

				while ( element.lastChild ) {
					element = element.lastChild;

					// include the closing tag for a mutated element
					adjustLength( element );
				}

				return element;
			}

			function adjustLength( element ) {
				if ( element.dataset && element.dataset.mutated ) {
					var constructors = nodeManager.get(),
						options = {
							element: element
						};

					for ( var i = 0, len = constructors.length; i < len; i++ ) {
						var constructor = constructors[ i ];

						if ( constructor.match( options ) && constructor.isWrapped ) {
							length++;
							return;
						}
					}
				}
			}

			return new Position( offset, attributes );
		}
	} );

	return Document;
} );