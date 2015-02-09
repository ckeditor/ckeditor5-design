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
		console.time( 'diff' );
		// TODO see if it's worth comparing objects and arrays as strings (via JSON.stringify)
		var edits = diff( oldData, newData, areEqual );
		console.timeEnd( 'diff' );

		// TODO see if we really need this
		var a = utils.clone( oldData );
		var b = utils.clone( newData );

		var ops = [],
			retain = 0;

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

	utils.extend( Transaction.prototype, {
		// apply an operation to a document
		applyOperation: function( operation, document ) {

		},
		// apply a transaction to a document
		applyTo: function( document ) {
			this.operations.forEach( function( operation ) {
				var offset;

				this.applyOperation( operation, document, offset );

			}, this );

			this.applied = true;
		},
		// return a copy of the transaction
		clone: function() {

		},
		// produce a transaction that would revert the current one
		reverse: function() {

		}
	} );

	return Transaction;
} );