'use strict';

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

function copyOperation( op ) {
	return createOperation( op.type, op );
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
		target: op.target,
		attr: '',
		value: ''
	} );
}

var OP = {
	insert: function ( target, offset, node ) {
		if ( target instanceof BlockNode ) {
			target.addChild( offset, node );
		} else {
			console.error( 'insert: Specified target is not an instance of BlockNode' );
		}
	},
	remove: function ( target, offset ) {
		if ( target instanceof BlockNode ) {
			target.removeChild( offset );
		} else {
			console.error( 'remove: Specified target is not an instance of BlockNode' );
		}
	},
	change: function ( target, attr, value ) {
		if ( target instanceof Node ) {
			target.changeAttr( attr, value );
		} else {
			console.error( 'change: Specified target is not an instance of Node' );
		}
	}
};

var IT = {
	insert: {
		insert: function ( a, b ) {
			a = copyOperation( a );

			if ( b.target == a.target ) {
				if ( b.offset < a.offset || ( b.offset == a.offset && a.site < b.site ) ) {
					a.offset++;
				}
			}

			return a;
		},

		remove: function ( a, b ) {
			a = copyOperation( a );

			if ( b.target == a.target && b.offset < a.offset ) {
				a.offset--;
			}

			return a;
		},

		change: function ( a, b ) {
			return copyOperation( a );
		}
	},
	remove: {
		insert: function ( a, b ) {
			a = copyOperation( a );

			if ( b.target == a.target && b.offset <= a.offset ) {
				a.offset++;
			}

			return a;
		},

		remove: function ( a, b ) {
			a = copyOperation( a );

			if ( b.target == a.target ) {
				if ( b.offset < a.offset ) {
					a.offset--;
				}
				else if ( b.offset == a.offset ) {
					return getNoOp( a );
				}
			}

			return a;
		},

		change: function ( a, b ) {
			return copyOperation( a );
		}
	},
	change: {
		insert: function ( a, b ) {
			return copyOperation( a );
		},

		// IT(change(Na, k, f), delete(Nb, n, M))
		remove: function ( a, b ) {
			return copyOperation( a );
		},
		change: function ( a, b ) {
			a = copyOperation( a );

			// If we change same node and same attr, one of operations have to get on top of the another.
			// So if this happens and a.site < b.site, we skip this operation.
			if ( a.target == b.target && a.offset == b.offset && a.attr == b.attr && a.site < b.site ) {
				return getNoOp( a );
			}

			return a;
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
	createOperation: createOperation,
	copyOperation: copyOperation,
	applyOperation: applyOperation
};

if ( typeof module != 'undefined' ) {
	module.exports = OT;
}

if ( typeof define != 'undefined' ) {
	define( OT );
}