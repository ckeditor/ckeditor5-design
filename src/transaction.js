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

	var rebuildTree = false;

	utils.extend( Transaction.prototype, {
		// apply a transaction to a document
		applyTo: function( document ) {
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

					if ( utils.isObject( operation.insert ) && operation.insert.type ) {
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

					if ( utils.isObject( operation.remove ) && operation.remove.type ) {
						rebuildTree = true;
					}
				}
			}

			// calculate the ending offset to locate the last affected node
			var rightOffset = offset - added + removed - ( removed > 0 ? 1 : 0 );

			var firstNode = document.getNodeAtPosition( leftOffset );
			var lastNode = document.getNodeAtPosition( rightOffset );

			console.log( 'f', firstNode );
			console.log( 'l', lastNode );

			if ( rebuildTree ) {
				// we found a text node but to rebuild the tree we need something that refers to the actual DOM element
				if ( !firstNode.isWrapped ) {
					firstNode = firstNode.parent;
					console.log( 'f2', firstNode );
				}

				if ( !lastNode.isWrapped ) {
					lastNode = lastNode.parent;
					console.log( 'l2', lastNode );
				}
			}

			// the first node is an ancestor of the last node so let's rework that one
			if ( lastNode.hasAncestor( firstNode ) ) {
				lastNode = firstNode;
			}

			// first affected node's parent
			var parent = firstNode.parent;
			// beginning of the data to be rebuilt
			var start = firstNode.getOffset();
			// end of the data to be rebuilt
			var end = lastNode.getOffset() + lastNode.length + added - removed;
			// a subset of linear data for new tree nodes
			var data = document.data.sliceInstance( start, end );

			var newNodes, index;

			var matchIndex = -1;
			var addBefore = [];
			var addAfter = [];

			console.log( 'lo', leftOffset, 'ro', rightOffset );
			console.log( 'data', data );

			// first node is the last node so inject new nodes in place of the old one
			if ( firstNode === lastNode ) {
				console.log( 'a single node was affected' );
				// build new nodes for the data
				newNodes = converter.getNodesForData( data, document );

				console.log( 'new nodes', newNodes );

				// TODO is it possible to perform below section recursively? And does that even make sense?

				for ( i = 0, len = newNodes.length; i < len; i++ ) {
					// nodes represent the same data so we don't have to recreate the entire node but its contents only
					if ( newNodes[ i ].data && newNodes[ i ].data === firstNode.data ) {
						console.log( 'found matching at', i );
						matchIndex = i;
					} else {
						if ( matchIndex > -1 ) {
							addAfter.push( newNodes[ i ] );
						} else {
							addBefore.push( newNodes[ i ] );
						}
					}
				}

				index = parent.indexOf( firstNode );

				// add new nodes before the affected node
				if ( addBefore.length ) {
					console.log( 'add before', addBefore );
					parent.spliceArray( index, matchIndex > -1 ? 0 : 1, addBefore );
				}

				// replace children of the affected node
				if ( matchIndex > -1 && firstNode.children ) {
					console.log( 'replace children' );
					firstNode.spliceArray( 0, firstNode.childLength, newNodes[ matchIndex ].children );
				}

				// add new nodes after the affected node
				if ( addAfter.length ) {
					console.log( 'add after', addAfter );
					parent.spliceArray( index + 1, 0, addAfter );
				}

			} else {
				console.log( 'a range of nodes was affected' );

				// all the elements were opened/closed properly meaning they are located on the same level
				if ( data.isValid() && firstNode.parent === lastNode.parent ) {
					console.log( 'valid data' );
					var firstIndex = parent.indexOf( firstNode );
					var lastIndex = parent.indexOf( lastNode );

					newNodes = converter.getNodesForData( data, document );
					console.log( 'new nodes', newNodes );

					parent.spliceArray( firstIndex, lastIndex - firstIndex + 1, newNodes );
				} else {
					console.log( 'invalid data' );

					data = validateData( data );

					newNodes = converter.getNodesForData( data, document );
					console.log( 'new nodes', newNodes );

					index = parent.indexOf( firstNode );

					if ( newNodes.length > 1 ) {
						// we skip the last node that will require more work
						for ( i = 0, len = newNodes.length - 1; i < len; i++ ) {
							if ( newNodes[ i ].data && newNodes[ i ].data === firstNode.data ) {
								console.log( 'found matching at', i );
								matchIndex = i;
							} else {
								if ( matchIndex > -1 ) {
									addAfter.push( newNodes[ i ] );
								} else {
									addBefore.push( newNodes[ i ] );
								}
							}
						}

						// add new nodes before the affected node
						if ( addBefore.length ) {
							console.log( 'add before', addBefore );
							parent.spliceArray( index, matchIndex > -1 ? 0 : 1, addBefore );
						}

						// replace children of the affected node
						if ( matchIndex > -1 ) {
							console.log( 'replace children' );
							firstNode.spliceArray( 0, firstNode.childLength, newNodes[ matchIndex ].children );
						}

						// add new nodes after the affected node
						if ( addAfter.length ) {
							console.log( 'add after', addAfter );
							parent.spliceArray( index + 1, 0, addAfter );
						}

						var lastNewNode = newNodes[ newNodes.length - 1 ];

						console.log( 'last', lastNewNode );

						if ( lastNewNode.data && lastNewNode.data === lastNode.data ) {
							console.log( 'last nodes match' );
						} else {
							console.log( 'last nodes don\'t match' );

						}
					} else {
						console.log( 'what?' );
					}
					// we can assume the last node was incomplete, any other can be replaced/injected as is
				}

				// TODO process a range of nodes, check which one still appear in the DOM
			}

			this.applied = true;

			// checks if all the elements were properly closed and adds missing closing elements
			function validateData( data ) {
				var open = [],
					len, i;

				for ( i = 0, len = data.length; i < len; i++ ) {
					if ( data.isOpenElementAt( i ) ) {
						open.push( data.get( i ) );
					} else if ( data.isCloseElementAt( i ) ) {
						var lastOpened = open.pop();
						if ( data.getTypeAt( i ) !== data.constructor.getType( lastOpened ) ) {
							open.push( lastOpened );
						}
					}
				}

				// close remaining elements
				if ( open.length ) {
					for ( i = 0, len = open.length; i < len; i++ ) {
						data.push( {
							type: '/' + open[ i ].type
						} );
					}
				}

				return data;
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