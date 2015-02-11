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
		createFromDomMutation: function( document, node, element ) {
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

			// update lengths of nodes and their parents
			function updateLengths() {
				toUpdate.forEach( function( node, i ) {
					var delta = deltas[ i ];

					while ( node ) {
						node.adjustLength( delta );
						node = node.parent;
					}
				} );
			}

			// a counter representing the current offset in the linear data
			var offset = 0;

			var leftOffset = null;

			// a counter representing the number of inserted data items
			var added = 0;
			// a counter representing the number of removed data items
			var removed = 0;
			// a flag that tells if the document tree needs to be rebuilt
			var rebuildTree = false;

			this.operations.forEach( function( operation ) {
				var node, type;

				// update the offset
				if ( operation.retain ) {
					offset += operation.retain;
				}

				// find the first index we're working on
				if ( leftOffset === null ) {
					leftOffset = offset;
				}

				// insert new data
				if ( operation.insert ) {
					// update the linear data
					document.data.splice( offset, 0, operation.insert );

					added++;

					// it's a text content so just update the lengths of nodes and their parents
					if ( utils.isString( operation.insert ) || utils.isArray( operation.insert ) ) {
						saveToUpdateLength( offset - added + removed, 1 );
					} else {
						rebuildTree = true;
					}

					// we must move to the next data element, otherwise a subsequent inserted character
					// would come in before the previously added character
					offset++;
				}

				if ( operation.remove ) {
					// update the linear data
					document.data.splice( offset, 1 );

					removed++;

					// it's a text content so just update the lengths of nodes and their parents
					if ( utils.isString( operation.remove ) || utils.isArray( operation.remove ) ) {
						saveToUpdateLength( offset - added + removed, -1 );
					} else {
						rebuildTree = true;
					}
				}
			}, this );

			// rebuild the document tree structure
			if ( rebuildTree ) {
				console.log( 'rebuild the tree' );

				var rightOffset = offset - added + removed - ( removed > 0 ? 1 : 0 );

				var firstNode = document.getNodeAtPosition( leftOffset );
				var lastNode = document.getNodeAtPosition( rightOffset );

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
				var data = document.data.cloneSlice( start, end );

				var newNodes = converter.getNodesForData( data, document );

				console.log( 'f', firstNode );
				console.log( 'l', lastNode );

				console.log( newNodes );

				// TODO what about views? should we point to the elements in the dirty DOM or build new elements
				// and replace them in the dirty DOM?

				// first node is the last node so inject new nodes in place of the old one
				if ( firstNode === lastNode ) {
					firstNode.replace( newNodes );
					// replace the old nodes and anything between them with new nodes
				} else {
					// TODO
				}

				// TODO add new nodes to the tree and remove missing ones
				// TODO replace anything between the firstNode and the lastNode

				// just update the lengths of existing document nodes
			} else {
				console.log( 'update lengths' );
				updateLengths();
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

		edits.forEach( function( edit ) {
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
		} );

		return ops;
	}

	return Transaction;
} );