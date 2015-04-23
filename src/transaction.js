define( [
	'converter',
	'tools/arraydiff',
	'tools/utils'
], function(
	converter,
	diff,
	utils
) {
	'use strict';

	function Transaction() {
		this.operations = [];
		this.applied = false;
	}

	utils.extend( Transaction, {
		createFromNodeAndElement: function( document, node, element ) {
			var oldData = document.getNodeData( node ),
				offset = node.offset,
				newData = converter.getDataForDom( element, document.store, null, node.type === 'root' ),
				transaction = new Transaction();

			transaction.operations = makeOperationsFromDiff( oldData, newData, offset );

			return transaction;
		}
	} );

	var reverseMap = {
		insert: 'remove',
		remove: 'insert'
	};

	utils.extend( Transaction.prototype, {
		// apply a transaction to a document
		applyTo: function( document ) {
			// don't re-apply a transaction
			if ( this.applied || !this.operations.length ) {
				return;
			}

			document.trigger( 'transaction:start', this );

			// a counter representing the current offset in the linear data
			var offset = 0;
			// a counter representing the number of inserted data items
			var added = 0;
			// a counter representing the number of removed data items
			var removed = 0;
			// a beginning offset used later to find out what was the first node affected by changes
			var leftOffset = null;

			// apply operations to the document's linear data
			for ( var i = 0, len = this.operations.length; i < len; i++ ) {
				var operation = this.operations[ i ];

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
					document.data.splice( offset, 0, operation.insert );

					added++;

					// we must move to the next data element, otherwise a subsequent inserted character
					// would come in before the previously added character
					offset++;
				}

				// remove data
				if ( operation.remove ) {
					// update the linear data
					document.data.splice( offset, 1 );

					removed++;
				}
			}

			// calculate the ending offset to locate the last affected node
			var rightOffset = offset - added + removed - ( removed > 0 ? 1 : 0 );

			// rework the adjacent text node instead of inserting another one next to it
			if ( !document.data.isElementAt( leftOffset ) &&
				!document.data.isElementAt( leftOffset - 1 ) ) {
				leftOffset--;
			}

			var firstNode = document.getNodeAtPosition( leftOffset );
			var lastNode = document.getNodeAtPosition( rightOffset );

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
				data = document.data.sliceInstance( start, end );
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
					data = document.data.sliceInstance( start, end );
				}

				newNodes = converter.getNodesForData( data, document );

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
				data = document.data.sliceInstance( start, end );
				newNodes = converter.getNodesForData( data, document );

				// node that's currently at the insertion position
				var currentNode = document.getNodeAtPosition( start );

				var idx = currentNode && currentNode.parent ?
					// insert at currentNode's position
					currentNode.parent.indexOf( currentNode ) :
					// insert at the end of the parent
					firstNode.childLength;

				firstNode.spliceArray( idx, 0, newNodes );
			} else {
				throw new Error( 'WAT?' );
			}

			// mark the transaction as applied
			this.applied = true;

			document.trigger( 'transaction:end', this );

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
		// return a copy of the transaction
		clone: function() {
			var transaction = new Transaction();

			transaction.operations = utils.clone( this.operations );

			return transaction;
		},
		// produce a transaction that would revert the current one
		reverse: function() {
			var transaction = new Transaction();

			transaction.operations = this.operations.map( function( operation ) {
				var newOp = utils.clone( operation );

				Object.keys( newOp ).forEach( function( name ) {
					var reverted = reverseMap[ name ];

					if ( reverted ) {
						newOp[ reverted ] = newOp[ name ];
						delete newOp[ name ];
					}
				} );

				return newOp;
			} );

			return transaction;
		}
	} );

	function makeOperationsFromDiff( oldData, newData, offset ) {
		// TODO see if it's worth comparing objects and arrays as strings (via JSON.stringify)
		var edits = diff( oldData, newData, utils.areEqual );

		var ops = [];
		// include element offset in the first retain
		var retain = offset || 0;

		for ( var i = 0, len = edits.length; i < len; i++ ) {
			var edit = edits[ i ];

			// insert operation
			if ( edit === diff.INSERT ) {
				if ( retain ) {
					ops.push( {
						retain: retain
					} );

					retain = 0;
				}

				ops.push( {
					insert: newData.shift()
				} );
			}

			// remove operation
			if ( edit === diff.DELETE ) {
				if ( retain ) {
					ops.push( {
						retain: retain
					} );

					retain = 0;
				}

				ops.push( {
					remove: oldData.shift()
				} );
			}

			// retain operation
			if ( edit === diff.EQUAL ) {
				retain++;

				oldData.shift();
				newData.shift();
			}
		}

		return ops;
	}

	return Transaction;
} );