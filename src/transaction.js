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
				// we haven't found a text node, this usually happens when the carret is at the end of a text node
				if ( !node || node.isWrapped ) {
					node = document.getNodeAtPosition( offset - 1 );
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

			// an iterator representing the current offset in the linear data
			var offset = 0;
			// an iterator representing the change in the offset caused by insert/remove operations
			var offsetDelta = 0;

			this.operations.forEach( function( operation ) {
				var node, type;

				// update the offset
				if ( operation.retain ) {
					offset += operation.retain;
				}

				// insert new data
				if ( operation.insert ) {
					// update the linear data
					document.data.splice( offset, 0, operation.insert );

					offsetDelta++;

					// it's a text content so just update the lengths of nodes and their parents
					if ( utils.isString( operation.insert ) || utils.isArray( operation.insert ) ) {
						saveToUpdateLength( offset - offsetDelta, 1 );
					} else if ( utils.isObject( operation.insert ) ) {
						// TODO
					}

					offset++;
				}

				if ( operation.remove ) {
					// update the linear data
					document.data.splice( offset, 1 );

					offsetDelta--;

					// it's a text content so just update the lengths of nodes and their parents
					if ( utils.isString( operation.remove ) || utils.isArray( operation.remove ) ) {
						saveToUpdateLength( offset - offsetDelta, -1 );
					} else {
						// TODO
					}
				}
			}, this );

			updateLengths();

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