'use strict';

// Implementation of http://www.collide.info/Lehre/SeminarWS0405/DavisSunLu02.pdf with own modifications.

// Some global constants.
var SAME = 1,
	PREFIX = 0,
	DIFFERENT = -1;

class Node {
	constructor() {
		this.attrs = {};
		this.parent = null;
	}

	changeAttr( attr, value ) {
		if ( value ) {
			this.attrs[ attr ] = value;
		} else {
			delete this.attrs[ attr ];
		}
	}

	getAttrValue( attr ) {
		return typeof this.attrs[ attr ] == 'undefined' ? null : this.attrs[ attr ];
	}

	setParent( parent ) {
		this.parent = parent;
	}

	removeParent() {
		this.parent = null;
	}
}


class BlockNode extends Node {
	constructor( type ) {
		super();

		this.type = type;
		this.children = [];
	}

	addChild( offset, node ) {
		node.setParent( this );
		this.children.splice( offset, 0, node );
	}

	removeChild( offset ) {
		var removedNode = this.children.splice( offset, 1 )[ 0 ];
		removedNode.removeParent();

		return removedNode;
	}

	getChild( offset ) {
		return this.children[ offset ];
	}

	getChildCount() {
		return this.children.length;
	}
}

class TextNode extends Node {
	constructor( char ) {
		super();

		this.char = char;
	}
}

// Compares two addresses.
function compare( a, b ) {
	if ( a.root != b.root ) {
		// Completely different tree.
		return DIFFERENT;
	}

	for ( var i = 0; i < a.path.length; i++ ) {
		if ( i == b.path.length ) {
			// All nodes were same for whole B address,
			// so B address is a prefix of A address.
			return PREFIX;
		} else if ( a.path[ i ] != b.path[ i ] ) {
			// At one point the addresses diverge,
			// so they are different and won't affect each other.
			return DIFFERENT;
		}
	}

	if ( a.path.length == b.path.length ) {
		// Both addresses were same at all points.
		// If their length is also same, we have the same address.
		return SAME;
	}

	// If addresses have different length, B is a suffix of A,
	// and won't affect it. Suffixes work like different addresses.
	return DIFFERENT;
}

// Gets the node that is under specified address.
function getNode( address ) {
	var node = address.root;

	for ( var i = 0; i < address.path.length; i++ ) {
		node = node.getChild( address.path[ i ] );

		if ( !node ) {
			return null;
		}
	}

	return node;
}

function createOperation( type, props ) {
	var op = {
		type: type,
		id: createOperation.ID++
	};

	for ( var i in props ) {
		op[ i ] = props[ i ];
	}

	return op;
}

createOperation.ID = 0;

function createAddress( root, path ) {
	return {
		root: root,
		path: path
	};
}

function copyAddress( address ) {
	return createAddress( address.root, address.path.slice() );
}

function copyOperation( op ) {
	var type = op.type;
	var params = {};

	for ( var i in op ) {
		if ( op.hasOwnProperty( i ) ) {
			params[ i ] == op[ i ];
		}
	}

	if ( op.address ) {
		params.address = copyAddress( op.address );
	}
	if ( op.fromAddress ) {
		params.fromAddress = copyAddress( op.fromAddress );
	}
	if ( op.toAddress ) {
		params.toAddress = copyAddress( op.toAddress );
	}

	return createOperation( type, op );
}

function applyOperation( op ) {
	var params = [];

	for ( var i in op ) {
		if ( op.hasOwnProperty( i ) && i != 'type' && i != 'id' ) {
			params.push( op[ i ] );
		}
	}

	OP[ op.type ].apply( this, params );
}

function getNoOp( op ) {
	return createOperation( 'change', {
		address: copyAddress( op.address ),
		attr: '',
		value: ''
	} );
}

function isNoOp( op ) {
	return op.type == 'change' && op.attr == '' && op.value == '';
}

var OP = {
	insert: function( address, offset, node ) {
		var parent = getNode( address );
		parent.addChild( offset, node );
	},
	remove: function( address, offset ) {
		var parent = getNode( address );
		parent.removeChild( offset );
	},
	change: function( address, attr, value ) {
		var node = getNode( address );
		node.changeAttr( attr, value );
	},
	move: function( fromAddress, fromOffset, node, toAddress, toOffset ) {
		var toNode = getNode( toAddress );
		while ( toNode != null ) {
			if ( toNode == node ) {
				throw Error( 'Trying to move a node into itself or it\'s descendant.' );
			}

			toNode = toNode.parent;
		}

		OP.remove( fromAddress, fromOffset );
		OP.insert( toAddress, toOffset, node );
	}
};

var IT = {
	insert: {
		// IT(insert(Na, na, Ma, Ta), insert(Nb, nb, Mb, Tb))
		insert: function( a, b ) {
			a = copyOperation( a );

			// if (<Na> = Mb)
			if ( a.address.root == b.node ) {
				// N'a <- (<Nb>, Nb[:] + [nb] + Na[:])
				a.address = createAddress( b.address.root, b.address.path.concat( b.offset, a.address.path ) );

				// elif (compare(Na, Nb) = PREFIX(i))
			} else if ( compare( a.address, b.address ) == PREFIX ) {
				var i = b.address.path.length;

				// if (nb < Na[i]) or (nb = Na[i] and site(Na) < site(Nb))
				if ( b.offset < a.address.path[ i ] || ( b.offset == a.address.path[ i ] && a.site < b.site ) ) {
					// N'a[i] <- Na[i] + 1
					a.address.path[ i ]++;
				}

				// elif (compare(Na, Nb) = SAME)
			} else if ( compare( a.address, b.address ) == SAME ) {
				// if (nb < na) or (nb = na and site(Na) < site(Nb))
				if ( b.offset < a.offset || ( b.offset == a.offset && a.site < b.site ) ) {
					// n'a <- na + 1
					a.offset++;
				}
			}

			// return insert(N'a, n'a, Ma, Ta)
			return a;
		},

		// IT(insert(Na, na, Ma, T), delete(Nb, nb, Mb))
		remove: function( a, b ) {
			a = copyOperation( a );

			// if (compare(Na, Nb) = SAME)
			if ( compare( a.address, b.address ) == SAME ) {
				// if (nb < na)
				if ( b.offset < a.offset ) {
					// n'a <- n'a ? 1
					a.offset--;
				}

				// elif (compare(Na, Nb) = PREFIX(i))
			} else if ( compare( a.address, b.address ) == PREFIX ) {
				var i = b.address.path.length;

				// if (nb < Na[i])
				if ( b.offset < a.address.path[ i ] ) {
					// N'a[i] <- Na[i] ? 1
					a.address.path[ i ]--;
				}

				// elif (nb = Na[i])
				else if ( b.offset == a.address.path[ i ] ) {
					return getNoOp( a );
				}
			}

			// return insert(N'a, n'a, Ma, T)
			return a;
		},

		// IT(insert(Na, n, M, T), change(Nb, k, f))
		change: function( a, b ) {

			// return insert(Na, n, M, T)
			return copyOperation( a );
		},

		// IT(insert(Na, n, M, T), move(Nb1, nb1, Nb2, nb2))
		move: function( a, b ) {
			a = copyOperation( a );

			var b1 = createOperation( 'remove', {
				address: copyAddress( b.fromAddress ),
				offset: b.fromOffset
			} );

			var b2 = createOperation( 'insert', {
				address: copyAddress( b.toAddress ),
				node: b.node,
				offset: b.toOffset
			} );
			b2 = IT.insert.remove( b2, b1 );

			var a1 = IT.insert.remove( a, b1 );

			if ( isNoOp( a1 ) ) {
				// If the operation got changed to no-op it means that the insert was in moved sub-tree.
				// We need to fix that special case.

				var i = b.fromAddress.path.length;
				var newPath = b.toAddress.path.slice().concat( b.toOffset ).concat( a.address.path.slice( i + 1 ) );

				if ( b.fromOffset < newPath[ i ] ) {
					newPath[ i ]--;
				}

				return createOperation( 'insert', {
					address: createAddress( b.toAddress.root, newPath ),
					offset: a.offset,
					node: a.node
				} )
			} else {
				a1 = IT.insert.insert( a1, b2 );
			}

			return a1;
		}
	},
	remove: {
		// IT(delete(Na, na, Ma), insert(Nb, nb, Mb, Tb))
		insert: function( a, b ) {
			a = copyOperation( a );

			// if (compare(Na, Nb) = PREFIX(i))
			if ( compare( a.address, b.address ) == PREFIX ) {
				var i = b.address.path.length;

				// if (n < Na[i]) or (n = Na[i] and site(Na) < site(Nb))
				if ( b.offset <= a.address.path[ i ] || ( b.offset == a.address.path[ i ] && a.site < b.site ) ) {
					// N'a[i] <- Na[i] + 1
					a.address.path[ i ]++;
				}
			}

			// elif (compare(Na, Nb) = SAME)
			else if ( compare( a.address, b.address ) == SAME ) {
				// if (nb < na)
				if ( b.offset <= a.offset ) {
					// n'a <- na + 1
					a.offset++;
				}
			}

			// return delete(N'a, n'a, Ma)
			return a;
		},

		// IT(delete(Na, na, Ma), delete(Nb, nb, Mb))
		remove: function( a, b ) {
			a = copyOperation( a );

			// if (compare(Na, Nb) = SAME)
			if ( compare( a.address, b.address ) == SAME ) {
				// if (nb < na)
				if ( b.offset < a.offset ) {
					// n'a <- na ? 1
					a.offset--;
				}

				// elif (nb = na) and (site(Na) = site(Nb))
				// ** modified - removed site condition, which just doesn't seem to be right (and gives bad results)
				// ** this is removing the same element, so each time when this happens, the incoming operation should be skipped
				else if ( b.offset == a.offset ) {
					//return change(Na, children, identity)
					return getNoOp( a );
				}
			}

			// elif (compare(Na, Nb) = PREFIX(i))
			else if ( compare( a.address, b.address ) == PREFIX ) {
				var i = b.address.path.length;

				// if (nb < Na[i])
				if ( b.offset < a.address.path[ i ] ) {
					// N'a[i] <- Na[i] ? 1
					a.address.path[ i ]--;

					// elif (nb = Na[i])
				} else if ( b.offset == a.address.path[ i ] ) {
					return getNoOp( a );
				}
			}

			// return delete(N'a, n'a, Ma)
			return a;
		},

		// IT(delete(Na, n, M), change(Nb, k, f))
		change: function( a, b ) {

			// return delete(Na, n, M)
			return copyOperation( a );
		},

		move: function( a, b ) {
			a = copyOperation( a );

			var b1 = createOperation( 'remove', {
				address: copyAddress( b.fromAddress ),
				offset: b.fromOffset
			} );

			var b2 = createOperation( 'insert', {
				address: copyAddress( b.toAddress ),
				node: b.node,
				offset: b.toOffset
			} );
			b2 = IT.insert.remove( b2, b1 );

			var a1 = IT.remove.remove( a, b1 );

			if ( isNoOp( a1 ) ) {
				// If the operation got changed to no-op it means that the remove was in the moved sub-tree.
				// We need to fix that special case.

				var i = b.fromAddress.path.length;

				if ( a.address.path.length > i ) {
					var newPath = b.toAddress.path.slice().concat( b.toOffset ).concat( a.address.path.slice( i + 1 ) );
				} else {
					var newPath = b.toAddress.path.slice();
				}

				if ( b.fromOffset < newPath[ i ] ) {
					newPath[ i ]--;
				}

				return createOperation( 'remove', {
					address: createAddress( b.toAddress.root, newPath ),
					offset: a.offset,
					node: a.node
				} );
			} else {
				a1 = IT.remove.insert( a1, b2 );
			}

			return a1;
		}
	},
	change: {
		// IT(change(Na, k, f), insert(Nb, n, M, T))
		insert: function( a, b ) {
			a = copyOperation( a );

			// if (<Na> = M)
			if ( a.address.root == b.node ) {
				// N'a <- (<Nb>, Nb[:] + [n] + Na[:])
				a.address = createAddress( b.address.root, b.address.path.concat( b.offset, a.address.path ) );
			}

			// elif (compare(Na, Nb) = PREFIX(i)) and (n <= Na[i])
			else if ( compare( a.address, b.address ) == PREFIX ) {
				var i = b.address.path.length;

				if ( b.offset <= a.address.path[ i ] ) {
					// N'a[i] <- Na[i] + 1
					a.address.path[ i ]++;
				}
			}

			// return change(N'a, k, f)
			return a;
		},

		// IT(change(Na, k, f), delete(Nb, n, M))
		remove: function( a, b ) {
			a = copyOperation( a );

			// if (compare(Na, Nb) = PREFIX(i))
			if ( compare( a.address, b.address ) == PREFIX ) {
				var i = b.address.path.length;

				// if (n < Na[i])
				if ( b.offset < a.address.path[ i ] ) {
					// N'a[i] <- N'a[i] ? 1
					a.address.path[ i ]--;

				// elif (n = Na[i])
				} else if ( b.offset == a.address.path[ i ] ) {
					return getNoOp( a );
				}
			} else if ( compare( a.address, b.address ) == SAME ) {
				if ( b.offset == a.offset ) {
					return getNoOp( a );
				}
			}

			// return change(N'a, k, f)
			return a;
		},
		change: function( a, b ) {
			a = copyOperation( a );

			// If we change same node and same attr, one of operations have to get on top of the another.
			// So if this happens and a.site < b.site, we skip this operation.
			if ( compare( a.address, b.address ) == SAME && a.offset == b.offset && a.attr == b.attr && a.site < b.site ) {
				return getNoOp( a );
			}

			return a;
		},
		move: function( a, b ) {
			a = copyOperation( a );

			var b1 = createOperation( 'remove', {
				address: copyAddress( b.fromAddress ),
				offset: b.fromOffset
			} );

			var b2 = createOperation( 'insert', {
				address: copyAddress( b.toAddress ),
				node: b.node,
				offset: b.toOffset
			} );
			b2 = IT.insert.remove( b2, b1 );

			var a1 = IT.insert.remove( a, b1 );

			if ( isNoOp( a1 ) ) {
				// If the operation got changed to no-op it means that the insert was in moved sub-tree.
				// We need to fix that special case.

				var i = b.fromAddress.path.length;
				var newPath = b.toAddress.path.slice().concat( b.toOffset ).concat( a.address.path.slice( i + 1 ) );

				if ( b.fromOffset < newPath[ i ] ) {
					newPath[ i ]--;
				}

				return createOperation( 'change', {
					address: createAddress( b.toAddress.root, newPath ),
					offset: a.offset,
					attr: a.attr,
					value: a.value
				} )
			} else {
				a1 = IT.insert.insert( a1, b2 );
			}

			return a1;
		}
	},
	move: {
		// IT(move(Na1, na1, Na2, na2), insert(Nb, nb, M, T))
		insert: function( a, b ) {
			var a1 = createOperation( 'remove', {
				address: copyAddress( a.fromAddress ),
				offset: a.fromOffset,
				site: a.site
			} );

			var a2 = createOperation( 'insert', {
				address: copyAddress( a.toAddress ),
				node: a.node,
				offset: a.toOffset,
				site: a.site
			} );
			a2 = IT.remove.insert( a2, a1 );

			a1 = IT.remove.insert( a1, b );
			a2 = IT.insert.insert( a2, b );

			return createOperation( 'move', {
				fromAddress: a1.address,
				fromOffset: a1.offset,
				node: a.node,
				toAddress: a2.address,
				toOffset: a2.offset,
				site: a.site
			} );
		},

		// IT(move(Na1, na1, Na2, na2), delete(Nb, nb, M))
		remove: function( a, b ) {
			var a1 = createOperation( 'remove', {
				address: copyAddress( a.fromAddress ),
				offset: a.fromOffset,
				site: a.site
			} );

			var a2 = createOperation( 'insert', {
				address: copyAddress( a.toAddress ),
				node: a.node,
				offset: a.toOffset,
				site: a.site
			} );
			a2 = IT.insert.remove( a2, a1 );

			a1 = IT.remove.remove( a1, b );

			if ( isNoOp( a1 ) ) {
				return a2;
			}

			a2 = IT.insert.remove( a2, b );

			if ( isNoOp( a2 ) ) {
				return a2;
			}

			return createOperation( 'move', {
				fromAddress: a1.address,
				fromOffset: a1.offset,
				node: a.node,
				toAddress: a2.address,
				toOffset: a2.offset,
				site: a.site
			} );
		},

		change: function( a, b ) {
			return copyOperation( a );
		},

		move: function( a, b ) {
			var a = copyOperation( a );

			if (
				(
					// Both move operations destinations are inside nodes that are also move operations origins.
					// So in other words, we move sub-trees into each others
					( compare( a.toAddress, b.fromAddress ) == PREFIX && a.toAddress.path[ b.fromAddress.path.length ] == b.fromOffset ) &&
					( compare( b.toAddress, a.fromAddress ) == PREFIX && b.toAddress.path[ a.fromAddress.path.length ] == a.toOffset )
				)
				|| ( compare( a.fromAddress, b.fromAddress ) == SAME && a.fromOffset == b.fromOffset )
			) {
				if ( a.site < b.site ) {
					//return getNoOp( a );
					return createOperation( 'change', {
						address: a.fromAddress,
						attr: '',
						value: '',
						site: a.site
					} );
				} else {
					return a;
				}
			}

			var remA = createOperation( 'remove', {
				address: copyAddress( a.fromAddress ),
				offset: a.fromOffset,
				site: a.site
			} );

			var insA = createOperation( 'insert', {
				address: copyAddress( a.toAddress ),
				offset: a.toOffset,
				site: a.site
			} );
			insA = IT.insert.remove( insA, remA );

			var remB = createOperation( 'remove', {
				address: copyAddress( b.fromAddress ),
				offset: b.fromOffset,
				site: b.site
			} );

			var insB = createOperation( 'insert', {
				address: copyAddress( b.toAddress ),
				offset: b.toOffset,
				site: b.site
			} );
			insB = IT.insert.remove( insB, remB );

			var remAP = IT.remove.remove( remA, remB );
			var remBP = IT.remove.remove( remB, remA );

			var insAP = IT.insert.remove( insA, remBP );
			var insBP = IT.insert.remove( insB, remAP );

			var insAPP = IT.insert.insert( insAP, insBP );
			var remAPP = IT.remove.insert( remAP, insB );

			if ( isNoOp( remAP ) ) {
				// Incoming move operation is from already moved tree.

				var i = b.fromAddress.path.length;

				if ( a.fromAddress.path.length > i ) {
					var newPath = b.toAddress.path.slice().concat( b.toOffset ).concat( a.fromAddress.path.slice( i + 1 ) );
				} else {
					var newPath = b.toAddress.path.slice();
				}

				if ( b.fromOffset < newPath[ i ] ) {
					newPath[ i ]--;
				}

				return createOperation( 'move', {
					fromAddress: createAddress( a.fromAddress.root, newPath ),
					fromOffset: a.fromOffset,
					node: a.node,
					toAddress: insAPP.address,
					toOffset: insAPP.offset
				} );
			} else if ( isNoOp( insAP ) ) {
				// Incoming move is into already moved tree.

				var i = b.toAddress.path.length;

				if ( a.toAddress.path.length > i ) {
					var newPath = b.toAddress.path.slice().concat( b.toOffset ).concat( a.toAddress.path.slice( i + 1 ) );
				} else {
					var newPath = b.toAddress.path.slice();
				}

				if ( b.toOffset < newPath[ i ] ) {
					newPath[ i ]--;
				}

				return createOperation( 'move', {
					fromAddress: remAPP.address,
					fromOffset: remAPP.offset,
					node: a.node,
					toAddress: createAddress( a.toAddress.root, newPath ),
					toOffset: a.toOffset
				} );
			} else {
				return createOperation( 'move', {
					fromAddress: remAPP.address,
					fromOffset: remAPP.offset,
					node: a.node,
					toAddress: insAPP.address,
					toOffset: insAPP.offset
				} );
			}
		}
	}
};

var OT = {
	// classes
	BlockNode: BlockNode,
	TextNode: TextNode,

	// namespaces
	IT: IT,
	OP: OP,

	// other functions
	createAddress: createAddress,
	copyAddress: copyAddress,
	createOperation: createOperation,
	copyOperation: copyOperation,
	applyOperation: applyOperation,
	getNode: getNode
};

if ( typeof module != 'undefined' ) {
	module.exports = OT;
}

if ( typeof define != 'undefined' ) {
	define( OT );
}