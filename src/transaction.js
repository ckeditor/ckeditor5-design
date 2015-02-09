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
		var edits = diff( oldData, newData, areEqual );

		console.log( oldData );
		console.log( newData );

		edits.forEach( function( op ) {
			if ( op === diff.INSERT ) {
				console.log( '+', newData.shift() );
			}

			if ( op === diff.DELETE ) {
				console.log( '-', oldData.shift() );
			}

			if ( op === diff.EQUAL ) {
				newData.shift();
				console.log( '=', oldData.shift() );
			}
		} );
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