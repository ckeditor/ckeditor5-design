define( [
	'converter',
	'nodemanager',
	'tools/arraydiff',
	'tools/utils'
], function(
	converter,
	nodeManager,
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
				offset = node.getOffset(),
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
			var toUpdate = [];
			var deltas = [];

			// save a node on the given offset and the delta for it to update lengths in the document tree just once
			function saveToUpdateLength( offset, delta ) {
				var node = document.getNodeAtPosition( offset );

				// TODO this is just a silly workaround
				// we haven't found a text node
				// this usually happens when the carret is at the beginning/end of a text node
				// let's try on the left
				if ( !node || node.isWrapped ) {
					node = document.getNodeAtPosition( offset - 1 );
				}

				// we still haven't found a text node o let's try on the right
				if ( !node || node.isWrapped ) {
					node = document.getNodeAtPosition( offset + 1 );
				}

				var idx = toUpdate.indexOf( node );

				if ( idx === -1 ) {
					idx = toUpdate.push( node ) - 1;
				}

				var oldDelta = deltas[ idx ] || 0;

				deltas[ idx ] = oldDelta + delta;
			}

			// a counter representing the current offset in the linear data
			var offset = 0;
			// a counter representing the number of inserted data items
			var added = 0;
			// a counter representing the number of removed data items
			var removed = 0;
			// a beginning offset used later to find out what was the first node affected by changes
			var leftOffset = null;
			// a flag that tells if the document tree needs to be rebuilt
			var rebuildTree = false;
			// the first affected data item
			var firstItem;

			for ( var i = 0, len = this.operations.length; i < len; i++ ) {
				var operation = this.operations[ i ];

				// update the offset
				if ( operation.retain ) {
					offset += operation.retain;
				}

				// find the first offset we'll work on
				if ( leftOffset === null ) {
					leftOffset = offset;
					firstItem = document.data.get( offset );
				}

				// insert new data
				if ( operation.insert ) {
					// update the linear data
					document.data.splice( offset, 0, operation.insert );

					added++;

					// it's a text content so just update the lengths of nodes and their parents
					if ( utils.isString( operation.insert ) || utils.isArray( operation.insert ) ) {
						saveToUpdateLength( offset - added + removed, 1 );
						// node affected - we'll have to rebuild the tree
					} else {
						rebuildTree = true;
					}

					// we must move to the next data element, otherwise a subsequent inserted character
					// would come in before the previously added character
					offset++;
				}

				// remove data
				if ( operation.remove ) {
					// update the linear data
					document.data.splice( offset, 1 );

					removed++;

					// it's a text content so just update the lengths of nodes and their parents
					if ( utils.isString( operation.remove ) || utils.isArray( operation.remove ) ) {
						saveToUpdateLength( offset - added + removed, -1 );
						// node affected - we'll have to rebuild the tree
					} else {
						rebuildTree = true;
					}
				}
			}

			// rebuild the document tree structure
			if ( rebuildTree ) {
				console.log( 'rebuild the tree' );
				var data, firstNode, lastNode, newNodes, parent;

				// calculate the ending offset to locate the last affected node
				var rightOffset = offset - added + removed - ( removed > 0 ? 1 : 0 );

				var lastItem = document.data.get( offset );

				firstNode = document.getNodeAtPosition( leftOffset );
				lastNode = document.getNodeAtPosition( rightOffset );

				// this means that we are injecting things between two tags, so none of the existing nodes were affected
				if ( utils.isObject( firstItem ) && firstItem.type && firstItem === lastItem ) {
					console.log( 'inject between tags' );

					parent = firstNode.parent;

					data = document.data.cloneSlice( leftOffset, offset );
					newNodes = converter.getNodesForData( data, document );

					// add new nodes to the parent
					if ( parent ) {
						parent.spliceArray( parent.indexOf( firstNode ), 0, newNodes );
						// append new nodes to the first node
					} else {
						firstNode.spliceArray( firstNode.childLength, 0, newNodes );
					}
				} else {
					// we found a text node but we need something that refers to the actual DOM element
					if ( !firstNode.isWrapped ) {
						firstNode = firstNode.parent;
					}

					if ( !lastNode.isWrapped ) {
						lastNode = lastNode.parent;
					}

					// beginning of the data to be rebuilt
					var start = firstNode.getOffset();
					// end of the data to be rebuilt
					var end = lastNode.getOffset() + lastNode.length + added - removed;
					// a subset of linear data for new tree nodes
					data = document.data.cloneSlice( start, end );

					console.log( 'lo', leftOffset, 'ro', rightOffset );
					console.log( 'f', firstNode, firstNode.depth );
					console.log( 'l', lastNode, lastNode.depth );
					console.log( 'data', data );

					// first node is the last node so inject new nodes in place of the old one
					if ( firstNode === lastNode ) {
						console.log( 'a single node was affected, replace it' );
						// build new nodes for the data
						newNodes = converter.getNodesForData( data, document );
						// replace the old node with new nodes
						firstNode.replace( newNodes );
					} else {
						console.log( 'a range of nodes was affected' );

						var nodeStack = [];

						for ( i = 0, len = data.length; i < len; i++ ) {
							if ( data.isOpenElementAt( i ) ) {

							} else if ( data.isCloseElementAt( i ) ) {

							}
						}

						// TODO process a range of nodes, check which one still appear in the DOM
					}
				}

				// just update the lengths of existing document nodes
			} else {
				console.log( 'update lengths' );

				for ( i = 0, len = toUpdate.length; i < len; i++ ) {
					var delta = deltas[ i ];
					var node = toUpdate[ i ];

					// adjust the length of node and its ancestors
					while ( node ) {
						node.adjustLength( delta );
						node = node.parent;
					}
				}
			}

			this.applied = true;
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

	function areEqual( a, b ) {
		if ( utils.isArray( a ) && utils.isArray( b ) ) {
			// different lengths, so nope
			if ( a.length !== b.length ) {
				return false;
			}

			return a.every( function( value, i ) {
				return areEqual( value, b[ i ] );
			} );

		} else if ( utils.isObject( a ) && utils.isObject( b ) ) {
			var aKeys = Object.keys( a ),
				bKeys = Object.keys( b );

			// different keys, so nope
			if ( !areEqual( aKeys, bKeys ) ) {
				return false;
			}

			return aKeys.every( function( name ) {
				return areEqual( a[ name ], b[ name ] );
			} );
		} else {
			return a === b;
		}
	}

	function makeOperationsFromDiff( oldData, newData, offset ) {
		// TODO see if it's worth comparing objects and arrays as strings (via JSON.stringify)
		console.time( 'diff' );
		var edits = diff( oldData, newData, areEqual );
		console.timeEnd( 'diff' );

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