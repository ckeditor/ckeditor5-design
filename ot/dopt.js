if ( typeof module != 'undefined' ) {
	var OT = require( './ot.js' );
}

if ( typeof define != 'undefined' ) {
	var OT = require( 'ot' );
}

// The main root.
var docRoot = new OT.BlockNode( 'body' );

function applyOperations( operations ) {
	for ( var i = 0; i < operations.length; i++ ) {
		OT.applyOperation( operations[ i ] );
	}
}

function dopt( siteOperations, incomingOperations ) {
	applyOperations( siteOperations );

	var transformedIncoming = [];
	var ITsDone = 0;

	for ( var i = 0; i < incomingOperations.length; i++ ) {
		var transformedSite = [];
		var inOp = incomingOperations[ i ];
		var transInOp = OT.copyOperation( inOp );

		for ( var j = 0; j < siteOperations.length; j++ ) {
			var siOp = siteOperations[ j ];
			var newTransInOp;

			newTransInOp = OT.IT[ transInOp.type ][ siOp.type ]( transInOp, siOp );
			siOp = OT.IT[ siOp.type ][ transInOp.type ]( siOp, transInOp );

			ITsDone += 2;

			transformedSite.push( siOp );

			transInOp = newTransInOp;
		}

		OT.applyOperation( transInOp );
		transformedIncoming.push( transInOp );

		siteOperations = transformedSite;
	}

	return {
		transformedIncoming: transformedIncoming,
		ITsDone: ITsDone
	};
}

function createOpFromTextLine( line, siteId ) {
	var args = line.split( ' ', 4 );
	var path = args[ 1 ].split( ',' );

	for ( var i = 0; i < path.length; i++ ) {
		path[ i ] = Number( path[ i ] );
	}

	var op = {
		type: args[ 0 ]
	};

	var offset, address;

	switch ( op.type ) {
		case 'insert':
			offset = path.pop();
			address = OT.createAddress( docRoot, path, siteId );

			op.props = {
				address: address,
				offset: offset
			};

			var node = null;

			if ( args[ 2 ] == 'text' ) {
				node = new OT.TextNode( args[ 3 ] );
			} else if ( args[ 2 ] == 'block' ) {
				node = new OT.BlockNode( args[ 3 ] );
			} else if ( args[ 2 ] == 'node' ) {
				node = OT.getNode( OT.createAddress( docRoot, args[ 3 ].split( ',' ), siteId ) );
			}

			op.props.node = node;

			break;
		case 'remove':
			offset = path.pop();
			address = OT.createAddress( docRoot, path, siteId );

			op.props = {
				address: address,
				offset: offset,
				node: OT.getNode( address )
			};

			break;
		case 'change':
			address = OT.createAddress( docRoot, path, siteId );

			op.props = {
				address: address,
				attr: args[ 2 ],
				value: args[ 3 ]
			};

			break;
		default:
			return null;
	}

	return OT.createOperation( op.type, op.props );
}

var DOPT = {
	dopt: dopt,
	applyOperations: applyOperations,
	getDocRoot: function () {
		return docRoot;
	},
	createOpFromTextLine: createOpFromTextLine
};

if ( typeof module != 'undefined' ) {
	module.exports = DOPT;
}

if ( typeof define != 'undefined' ) {
	define( DOPT );
}