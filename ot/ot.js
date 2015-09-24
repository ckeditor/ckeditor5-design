'use strict';

// Implementation of http://www.collide.info/Lehre/SeminarWS0405/DavisSunLu02.pdf

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

function createAddress( root, path, site ) {
	return {
		root: root,
		path: path,
		site: site
	};
}

function copyAddress( address ) {
	return createAddress( address.root, address.path.slice(), address.site );
}

function copyOperation( op ) {
	var type = op.type;
	op.address = copyAddress( op.address );

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

var OP = {
	insert: function ( address, offset, node ) {
		var parent = getNode( address );
		parent.addChild( offset, node );
	},
	remove: function ( address, offset ) {
		var parent = getNode( address );
		parent.removeChild( offset );
	},
	change: function ( address, attr, value ) {
		var node = getNode( address );
		node.changeAttr( attr, value );
	}
};

var IT = {
	insert: {
		// IT(insert(Na, na, Ma, Ta), insert(Nb, nb, Mb, Tb))
		insert: function ( a, b ) {
			a = copyOperation( a );

			// if (<Na> = Mb)
			if ( a.address.root == b.node ) {
				// N'a <- (<Nb>, Nb[:] + [nb] + Na[:])
				a.address = createAddress( b.address.root, b.address.path.concat( b.offset, a.address.path ), a.address.site );

				// elif (compare(Na, Nb) = PREFIX(i))
			} else if ( compare( a.address, b.address ) == PREFIX ) {
				var i = b.address.path.length;

				// if (nb < Na[i]) or (nb = Na[i] and site(Na) < site(Nb))
				if ( b.offset < a.address.path[ i ] || ( b.offset == a.address.path[ i ] && a.address.site < b.address.site ) ) {
					// N'a[i] <- Na[i] + 1
					a.address.path[ i ]++;
				}

				// elif (compare(Na, Nb) = SAME)
			} else if ( compare( a.address, b.address ) == SAME ) {
				// if (nb < na) or (nb = na and site(Na) < site(Nb))
				if ( b.offset < a.offset || ( b.offset == a.offset && a.address.site < b.address.site ) ) {
					// n'a <- na + 1
					a.offset++;
				}
			}

			// return insert(N'a, n'a, Ma, Ta)
			return a;
		},

		// IT(insert(Na, na, Ma, T), delete(Nb, nb, Mb))
		remove: function ( a, b ) {
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
					// N'a <- (Mb, Na[i + 1 :])
					a.address = createAddress( b.node, a.address.path.slice( i + 1 ), a.address.site );
				}
			}

			// return insert(N'a, n'a, Ma, T)
			return a;
		},

		// IT(insert(Na, n, M, T), change(Nb, k, f))
		change: function ( a, b ) {

			// return insert(Na, n, M, T)
			return copyOperation( a );
		}
	},
	remove: {
		// IT(delete(Na, na, Ma), insert(Nb, nb, Mb, Tb))
		insert: function ( a, b ) {
			a = copyOperation( a );

			// if (compare(Na, Nb) = PREFIX(i))
			if ( compare( a.address, b.address ) == PREFIX ) {
				var i = b.address.path.length;

				// if (n < Na[i]) or (n = Na[i] and site(Na) < site(Nb))
				if ( b.offset <= a.address.path[ i ] || ( b.offset == a.address.path[ i ] && a.address.site < b.address.site ) ) {
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
		remove: function ( a, b ) {
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
					// N'a <- (Mb, Na[i + 1 :])
					a.address = createAddress( b.node, a.address.path.slice( i + 1 ), a.address.site );
				}
			}

			// return delete(N'a, n'a, Ma)
			return a;
		},

		// IT(delete(Na, n, M), change(Nb, k, f))
		change: function ( a, b ) {

			// return delete(Na, n, M)
			return copyOperation( a );;
		}
	},
	change: {
		// IT(change(Na, k, f), insert(Nb, n, M, T))
		insert: function ( a, b ) {
			a = copyOperation( a );

			// if (<Na> = M)
			if ( a.address.root == b.node ) {
				// N'a <- (<Nb>, Nb[:] + [n] + Na[:])
				a.address = createAddress( b.address.root, b.address.path.concat( b.offset, a.address.path ), a.address.site );
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
		remove: function ( a, b ) {
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
					// N'a <- (M, Na[i + 1 :])
					a.address = createAddress( b.node, a.address.path.slice( i + 1 ), a.address.site );
				}
			}

			// return change(N'a, k, f)
			return a;
		},
		change: function ( a, b ) {
			a = copyOperation( a );

			// If we change same node and same attr, one of operations have to get on top of the another.
			// So if this happens and a.address.site < b.address.site, we skip this operation.
			if ( compare( a.address, b.address ) == SAME && a.offset == b.offset && a.attr == b.attr && a.address.site < b.address.site ) {
				return getNoOp( a );
			}

			return a;
		}
	}
};

module.exports = {
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