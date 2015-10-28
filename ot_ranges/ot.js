'use strict';

// Implementation of http://www.collide.info/Lehre/SeminarWS0405/DavisSunLu02.pdf with own modifications.

// Some global constants.
var SAME = 1,
	PREFIX = 0,
	DIFFERENT = -1;

var DOCUMENT_ROOT_INDEX = 1;

// Some global variables.
var documentRoot = null,
	graveyardRoot = null;

function setDocumentRoot( root ) {
	documentRoot = root;
}

function setGraveyardRoot( root ) {
	graveyardRoot = root;
}

class Node {
	constructor() {
		this.attrs = {};
		this.parent = null;
		this.prevNode = null;
		this.nextNode = null;
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

	setParent( parent, offset ) {
		this.parent = parent;
		this.prevNode = offset == 0 ? null : parent.getChild( offset - 1 );
		this.nextNode = offset == parent.getChildrenCount() - 1 ? null : parent.getChild( offset + 1 );
	}

	removeParent() {
		this.parent = null;

		if ( this.prevNode != null ) {
			this.prevNode.nextNode = this.nextNode;
		}

		if ( this.nextNode != null ) {
			this.nextNode.prevNode = this.prevNode;
		}

		this.prevNode = null;
		this.nextNode = null;
	}

	isDescendantOf( ascendant ) {
		var node = this;

		while ( node !== null ) {
			if ( node == ascendant ) {
				return true;
			}

			node = node.parent;
		}

		return false;
	}
}


class BlockNode extends Node {
	constructor( type ) {
		super();

		this.type = type;
		this.children = [];
	}

	addChildren( offset, nodes ) {
		Array.prototype.splice.apply( this.children, [ offset, 0 ].concat( nodes ) );

		for ( var i = 0; i < nodes.length; i++ ) {
			nodes[ i ].setParent( this, offset + i );
		}

		return nodes;
	}

	addChild( node ) {
		this.addChildren( offset, [ node ] );
	}

	removeChild( offset ) {
		this.removeChildren( offset, 1 );
	}

	removeChildren( offset, howMany ) {
		var removedNodes = this.children.splice( offset, howMany );

		for ( var i = 0; i < removedNodes.length; i++ ) {
			removedNodes[ i ].removeParent();
		}

		return removedNodes;
	}

	getChildren( offset, howMany ) {
		return this.children.slice( offset, offset + howMany );
	}

	getChild( offset ) {
		return this.getChildren( offset, 1 )[ 0 ];
	}

	getChildrenCount() {
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
	for ( var i = 0; i < a.length; i++ ) {
		if ( i == b.length ) {
			// All nodes were same for whole B address,
			// so B address is a prefix of A address.
			return PREFIX;
		} else if ( a[ i ] != b[ i ] ) {
			// At one point the addresses diverge,
			// so they are different and won't affect each other.
			return DIFFERENT;
		}
	}

	if ( a.length == b.length ) {
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
	var rootIndex = address[ 0 ];
	var node = rootIndex == DOCUMENT_ROOT_INDEX ? documentRoot : graveyardRoot;

	for ( var i = 1; i < address.length; i++ ) {
		node = node.getChild( address[ i ] );

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
		if ( props.hasOwnProperty( i ) ) {
			op[ i ] = props[ i ];
		}
	}

	return op;
}

createOperation.ID = 0;

function copyAddress( address ) {
	return address.slice();
}

function copyOperation( op ) {
	var type = op.type;
	var params = {};

	for ( var i in op ) {
		if ( op.hasOwnProperty( i ) ) {
			params[ i ] = op[ i ];
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

	return createOperation( type, params );
}

function applyOperation( op ) {
	var params = [];

	for ( var i in op ) {
		if ( op.hasOwnProperty( i ) && i != 'type' && i != 'id' ) {
			params.push( op[ i ] );
		}
	}

	return OP[ op.type ].apply( this, params );
}

function getNoOp( a ) {
	var params = {};

	if ( a.type == 'move' ) {
		params.address = copyAddress( a.fromAddress );
		params.offset = a.fromOffset;
	} else {
		params.address = copyAddress( a.address );
		params.offset = a.offset;
	}

	if ( a.howMany ) {
		params.howMany = a.howMany;
	} else if ( a.nodes ) {
		params.howMany = a.nodes.length;
	}

	return createOperation( 'noop', params );
}

var OP = {
	insert: function( address, offset, nodes ) {
		for ( var i = 0; i < nodes.length; i++ ) {
			if ( nodes[ i ].parent !== null ) {
				throw Error( 'Trying to insert a node that is already inserted.' );
			}
		}

		var node = getNode( address );
		node.addChildren( offset, nodes );

		return nodes;
	},
	remove: function( address, offset, howMany ) {
		var parent = getNode( address );
		return parent.removeChildren( offset, howMany );
	},
	change: function( address, offset, howMany, attr, value ) {
		var nodes = getNode( address ).getChildren( offset, howMany );

		for ( var i = 0; i < howMany; i++ ) {
			nodes[ i ].changeAttr( attr, value );
		}

		return nodes;
	},
	move: function( fromAddress, fromOffset, howMany, toAddress, toOffset ) {
		var toNode = getNode( toAddress );
		var fromNode = getNode( fromAddress );

		if ( fromNode == toNode && fromOffset < toOffset ) {
			toOffset = toOffset - howMany;

			if ( toOffset < fromOffset ) {
				throw Error( 'Trying to move a range of nodes into itself.' );
			}
		}

		for ( var i = 0; i < howMany; i++ ) {
			if ( toNode.isDescendantOf( fromNode.getChild( fromOffset + i ) ) ) {
				throw Error( 'Trying to move a node into itself or it\'s descendant.' );
			}
		}

		return toNode.addChildren( toOffset, fromNode.removeChildren( fromOffset, howMany ) );
	},
	noop: function( address, offset, howMany ) {
		return getNode( address ).getChildren( offset, howMany );
	}
};

function transform( a, b ) {
	return IT[ a.type ][ b.type ]( a, b );
}

function rangesIntersect( a, b ) {
	function checkIntersect( a, b ) {
		return ( a.offset > b.offset && a.offset < b.offset + b.howMany ) ||
			( a.offset + a.howMany > b.offset && a.offset + a.howMany < b.offset + b.howMany ) ||
			( a.offset == b.offset && a.howMany == b.howMany );
	}

	return checkIntersect( a, b ) || checkIntersect( b, a );
}

function getDiffRanges( a, b, returnCommon, joinRanges ) {
	// Here we assume that ranges intersect. To check that use rangesIntersect function.

	var diffRanges = [];

	if ( a.offset < b.offset ) {
		// Incoming range "sticks out" on left side.
		diffRanges.push( {
			offset: a.offset,
			howMany: b.offset - a.offset
		} );
	}

	if ( a.offset + a.howMany > b.offset + b.howMany ) {
		// Incoming range "sticks out" on right side.
		diffRanges.push( {
			offset: b.offset + b.howMany,
			howMany: a.offset + a.howMany - b.offset - b.howMany
		} );
	}

	if ( joinRanges && diffRanges.length == 2 ) {
		var secondPart = diffRanges.pop();

		diffRanges[ 0 ].howMany += secondPart.howMany;
	}

	if ( returnCommon ) {
		var offset = Math.max( a.offset, b.offset );
		var howMany = Math.min( a.offset + a.howMany, b.offset + b.howMany ) - offset;

		diffRanges.push( {
			offset: offset,
			howMany: howMany
		} );
	}

	return diffRanges;
}

function combineAddress( a, bFrom, bTo ) {
	var i = bFrom.address.length;
	return bTo.address.slice().concat( a.address[ i ] + bTo.offset - bFrom.offset ).concat( a.address.slice( i + 1 ) );
}

function spreadOperation( a, offset, howMany ) {
	var prop = a.type == 'move' ? 'fromOffset' : 'offset';
	var diff = offset - a[ prop ];

	var a1 = copyOperation( a );
	a1.howMany = diff;

	var a2 = copyOperation( a );
	a2[ prop ] = offset + howMany;
	a2.howMany = a.howMany - diff;

	return [ a1, a2 ];
}

function intoEachOther( a, b ) {
	var aPathOffset = a.toAddress[ b.fromAddress.length ];
	var bPathOffset = b.toAddress[ a.fromAddress.length ];

	if ( compare( a.toAddress, b.fromAddress ) == PREFIX && compare( b.toAddress, a.fromAddress ) == PREFIX ) {
		return ( b.fromOffset <= aPathOffset && aPathOffset < b.fromOffset + b.howMany ) &&
			( a.fromOffset <= bPathOffset && bPathOffset < a.fromOffset + a.howMany )
	}

	return false;
}

function getRemoveFromMove( o ) {
	return createOperation( 'remove', {
		address: copyAddress( o.fromAddress ),
		offset: o.fromOffset,
		howMany: o.howMany,
		site: o.site
	} );
}

function getInsertFromMove( o ) {
	return transform( createOperation( 'insert', {
		address: copyAddress( o.toAddress ),
		offset: o.toOffset,
		nodes: null,
		howMany: o.howMany,
		site: o.site
	} ), getRemoveFromMove( o ) ); // ins x rem
}

function getOpsFromRanges( o, ranges ) {
	var ops = [];
	var prop = o.type == 'move' ? 'fromOffset' : 'offset';

	if ( ranges.length == 0 ) {
		return getNoOp( o );
	}

	for ( var i = 0; i < ranges.length; i++ ) {
		var newO = copyOperation( o );

		newO[ prop ] = ranges[ i ].offset;
		newO.howMany = ranges[ i ].howMany;

		ops.push( newO );
	}

	if ( ops.length == 1 ) {
		return ops.pop();
	} else {
		return ops;
	}
}

function getCombinedOpsFromRanges( a, b1, b2, ranges ) {
	var ops = [];
	var propAddress = a.type == 'move' ? 'fromAddress' : 'address';
	var propOffset = a.type == 'move' ? 'fromOffset' : 'offset';
	var offsetDiff = a[ propOffset ] - b1.offset;
	var range;

	var a1 = copyOperation( a );
	range = ranges.pop();

	a1[ propAddress ] = copyAddress( b2.address );
	a1[ propOffset ] = b2.offset + Math.max( 0, offsetDiff );
	a1.howMany = range.howMany;

	ops.push( a1 );

	if ( ranges.length > 0 ) {
		var a2 = copyOperation( a );
		range = ranges.pop();

		a2[ propOffset ] = offsetDiff > 0 ? b1.offset : range.offset;
		a2.howMany = range.howMany;

		ops.push( a2 );
	}

	return ops;
}

var IT = {
	insert: {
		insert: function( a, b ) {
			a = copyOperation( a );

			if ( compare( a.address, b.address ) == SAME ) {
				if ( b.offset < a.offset || ( b.offset == a.offset && a.site < b.site ) ) {
					a.offset += b.howMany;
				}
			} else if ( compare( a.address, b.address ) == PREFIX ) {
				var i = b.address.length;

				if ( b.offset <= a.address[ i ] ) {
					a.address[ i ] += b.howMany;
				}
			}

			return a;
		},

		change: copyOperation,

		remove: function( a, b ) {
			a = copyOperation( a );

			if ( compare( a.address, b.address ) == SAME ) {
				if ( b.offset < a.offset ) {
					a.offset -= b.howMany;

					if ( a.offset < b.offset ) {
						a.offset = b.offset;
					}
				}
			} else if ( compare( a.address, b.address ) == PREFIX ) {
				var i = b.address.length;

				if ( b.offset + b.howMany <= a.address[ i ] ) {
					a.address[ i ] -= b.howMany;
				} else if ( b.offset <= a.address[ i ] ) {
					return getNoOp( a );
				}
			}

			return a;
		},

		move: function( a, b ) {
			a = copyOperation( a );

			var b1 = getRemoveFromMove( b );
			var b2 = getInsertFromMove( b );

			var a1 = transform( a, b1 ); // ins x rem

			if ( a1.type == 'noop' ) {
				a.address = combineAddress( a, b1, b2 );
				return a;
			} else {
				return transform( a1, b2 ); // ins x ins
			}
		},

		noop: copyOperation
	},

	change: {
		insert: function( a, b ) {
			a = copyOperation( a );

			if ( compare( a.address, b.address ) == SAME ) {
				if ( b.offset < a.offset ) {
					a.offset += b.howMany;
				} else if ( b.offset < a.offset + a.howMany ) {
					return spreadOperation( a, b.offset, b.howMany );
				}
			} else if ( compare( a.address, b.address ) == PREFIX ) {
				var i = b.address.length;

				if ( b.offset <= a.address[ i ] ) {
					a.address[ i ] += b.howMany;
				}
			}

			return a;
		},

		change: function( a, b ) {
			a = copyOperation( a );

			// If we change same node and same attr, we have to manage the ranges if they intersect.
			if ( compare( a.address, b.address ) == SAME && a.attr == b.attr && a.site < b.site && rangesIntersect( a, b ) ) {
				var ranges = getDiffRanges( a, b, false, false );
				return getOpsFromRanges( a, ranges );
			}

			// Ranges do not intersect.
			return a;
		},

		move: function( a, b ) {
			a = copyOperation( a );

			var b1 = getRemoveFromMove( b );
			var b2 = getInsertFromMove( b );

			if ( compare( a.address, b1.address ) == SAME ) {
				if ( b1.offset + b1.howMany <= a.offset ) {
					a.offset -= b1.howMany;
				} else if ( rangesIntersect( a, b1 ) ) {
					var ranges = getDiffRanges( a, b1, true, true );
					var ops = getCombinedOpsFromRanges( a, b1, b2, ranges );

					return ops.length == 1 ? ops.pop() : ops;
				}
			} else if ( compare( a.address, b1.address ) == PREFIX ) {
				var i = b1.address.length;

				if ( b1.offset + b1.howMany <= a.address[ i ] ) {
					a.address[ i ] -= b.howMany;
				} else if ( b1.offset <= a.address[ i ] ) {
					a.address = combineAddress( a, b1, b2 );
					return a;
				}
			}

			a = transform( a, b2 );

			return a;
		},
		noop: copyOperation
	},
	move: {
		insert: function( a, b ) {
			a = copyOperation( a );

			var a2 = createOperation( 'insert', {
				address: copyAddress( a.toAddress ),
				offset: a.toOffset,
				nodes: null,
				howMany: a.howMany,
				site: a.site
			} );

			a2 = transform( a2, b ); // ins x ins

			a.toAddress = copyAddress( a2.address );
			a.toOffset = a2.offset;

			if ( compare( a.fromAddress, b.address ) == PREFIX ) {
				var i = b.address.length;

				if ( b.offset <= a.fromAddress[ i ] ) {
					a.fromAddress[ i ] += b.howMany;
				}
			} else if ( compare( a.fromAddress, b.address ) == SAME ) {
				if ( b.offset <= a.fromOffset ) {
					a.fromOffset += b.howMany;
				} else if ( b.offset < a.fromOffset + a.howMany ) {
					return spreadOperation( a, b.offset, b.howMany );
				}
			}

			return a;
		},

		change: copyOperation,

		move: function( a, b ) {
			a = copyOperation( a );

			// Both move operations destinations are inside nodes that are also move operations origins.
			// So in other words, we move sub-trees into each others.
			if ( intoEachOther( a, b ) ) {

				// Instead of applying incoming operation, we revert site operation.
				// On the other side same will happen.
				return createOperation( 'move', {
					fromAddress: copyAddress( b.toAddress ),
					fromOffset: b.toOffset,
					howMany: b.howMany,
					toAddress: copyAddress( b.fromAddress ),
					toOffset: b.fromOffset,
					site: a.site
				} );
			}

			var b1 = getRemoveFromMove( b );
			var b2 = getInsertFromMove( b );

			var rangeFromA = {
				offset: a.fromOffset,
				howMany: a.howMany
			};

			var ops = [];

			// STEP 1: A-REM vs. B-MOV

			if ( compare( a.fromAddress, b1.address ) == SAME ) {
				if ( b1.offset + b1.howMany <= a.fromOffset ) {
					a.fromOffset -= b1.howMany;

					ops.push( transform( a, b2 ) );
				} else if ( rangesIntersect( rangeFromA, b1 ) ) {
					var ranges = getDiffRanges( rangeFromA, b1, true, true );
					var combinedOps = getCombinedOpsFromRanges( a, b1, b2, ranges );
					var commonMove = a.site > b.site ? combinedOps[ 0 ] : null;
					var ownMove = combinedOps[ 1 ] ? combinedOps[ 1 ] : null;

					if ( ownMove ) {
						ops.push( transform( ownMove, b2 ) );
					}
					if ( commonMove ) {
						ops.push( commonMove );
					}

				} else {
					ops.push( transform( a, b2 ) );
				}
			} else if ( compare( a.fromAddress, b1.address ) == PREFIX ) {
				var i = b1.address.length;

				if ( b1.offset + b1.howMany <= a.fromAddress[ i ] ) {
					a.fromAddress[ i ] -= b1.howMany;

					ops.push( transform( a, b2 ) );
				} else if ( b1.offset <= a.fromAddress[ i ] ) {
					a.fromAddress = combineAddress( {
						address: a.fromAddress,
						offset: a.fromOffset
					}, b1, b2 );

					ops.push( a );
				} else {
					ops.push( transform( a, b2 ) );
				}
			} else {
				ops.push( transform( a, b2 ) );
			}

			// STEP 2: A-INS vs B-MOV

			for ( var i = 0; i < ops.length; i++ ) {
				var fakeInsert = createOperation( 'insert', {
					address: copyAddress( a.toAddress ),
					offset: a.toOffset,
					nodes: null,
					howMany: ops[ i ].howMany,
					site: a.site
				} );

				if ( i > 0 ) {
					var offsetDiff = ops[ i - 1 ].fromOffset - ops[ i ].fromOffset;
					fakeInsert.offset += ( offsetDiff < 0 ) ? 0 : offsetDiff;
				}

				var transformed = transform( fakeInsert, b ); // ins x mov

				ops[ i ].toAddress = copyAddress( transformed.address );
				ops[ i ].toOffset = transformed.offset;
			}

			if ( ops.length == 0 ) {
				return getNoOp( a );
			} else if ( ops.length == 1 ) {
				return ops.pop();
			} else {
				return ops;
			}
		},
		noop: copyOperation
	},
	noop: {
		insert: getNoOp,
		change: getNoOp,
		remove: getNoOp,
		move: getNoOp,
		noop: getNoOp
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
	copyAddress: copyAddress,
	createOperation: createOperation,
	copyOperation: copyOperation,
	applyOperation: applyOperation,
	getNode: getNode,
	setDocumentRoot: setDocumentRoot,
	setGraveyardRoot: setGraveyardRoot,

	// constants
	DOCUMENT_ROOT_INDEX: DOCUMENT_ROOT_INDEX
};

if ( typeof module != 'undefined' ) {
	module.exports = OT;
}

if ( typeof define != 'undefined' ) {
	define( OT );
}