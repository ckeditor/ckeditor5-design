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
		createFromNodeAndElements: function( document, node, elements ) {
			var oldData = document.getNodeData( node ),
				offset = node.offset,
				transaction = new Transaction(),
				newData = [];

			if ( !Array.isArray( elements ) ) {
				elements = [ elements ];
			}

			for ( var i = 0, len = elements.length; i < len; i++ ) {
				newData = newData.concat( converter.getDataForDom( elements[ i ], document.store, null, node.type === 'root' ) );
			}

			transaction.operations = makeOperationsFromDiff( oldData, newData, offset );

			return transaction;
		}
	} );

	var reverseMap = {
		insert: 'remove',
		remove: 'insert'
	};

	utils.extend( Transaction.prototype, {
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