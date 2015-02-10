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

	function makeOperationsFromDiff( document, offset, oldData, newData ) {
		// TODO see if it's worth comparing objects and arrays as strings (via JSON.stringify)
		var edits = diff( oldData, newData, areEqual );

		// TODO see if we really need this
		var a = utils.clone( oldData );
		var b = utils.clone( newData );

		var ops = [];
		// include element offset in the first retain
		var retain = offset;

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
					insert: b.shift()
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
					remove: a.shift()
				} );
			}

			// retain operation
			if ( edit === diff.EQUAL ) {
				retain++;

				a.shift();
				b.shift();
			}
		} );

		return ops;
	}

	utils.extend( Transaction, {
		createFromDomMutation: function( document, node, element ) {
			var oldData = document.getNodeData( node ),
				offset = node.getOffset(),
				newData = converter.getDataForDom( element, document.store, null, node.type === 'root' ),
				transaction = new Transaction();

			transaction.operations = makeOperationsFromDiff( document, offset, oldData, newData );

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
			var offset = 0,
				data = document.data;

			// TODO we need to update the document tree:
			// - insert new nodes
			// - update lengths
			// - ???

			// TODO optimize this process
			function updateLengths( offset, delta ) {
				var node = document.getNodeAtPosition( offset );

				// we haven't found a text node
				// TODO this is just a silly workaround
				node = document.getNodeAtPosition( offset - 1 );

				while ( node ) {
					node.adjustLength( delta );
					node = node.parent;
				}
			}

			this.operations.forEach( function( operation ) {
				// update the offset
				if ( operation.retain ) {
					offset += operation.retain;
				}

				// insert new data
				if ( operation.insert ) {
					data.splice( offset, 0, operation.insert );

					if ( utils.isString( operation.insert ) || utils.isArray( operation.insert ) ) {
						updateLengths( offset, 1 );
					} else {
						// TODO we added a new node so we need to rebuild the tree somehow
					}
					offset++;
				}

				if ( operation.remove ) {
					data.splice( offset, 1 );
					if ( utils.isString( operation.remove ) || utils.isArray( operation.remove ) ) {
						updateLengths( offset, -1 );
					} else {
						// TODO we removed a node's opening/closing element
						// we need to rebuild the tree somehow
					}
				}
			}, this );

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

	return Transaction;
} );