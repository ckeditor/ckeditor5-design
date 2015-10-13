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
		var operationNode = OT.applyOperation( operations[ i ] );
		operations[ i ].node = operationNode;
	}
}

function dopt( siteOps, inOps ) {
	if ( siteOps.length == 0 ) {
		applyOperations( inOps );
		return {
			transformedIncoming: inOps,
			ITsDone: 0
		};
	}

	applyOperations( siteOps );

	var transOps, newSiteOps, applyOps = [];

	for ( var i = 0; i < inOps.length; i++ ) {
		transOps = [];
		newSiteOps = [];

		var op = inOps[ i ];

		for ( var j = 0; j < siteOps.length; j++ ) {
			transOps.push( op );

			op = OT.IT[ op.type ][ siteOps[ j ].type ]( op, siteOps[ j ] );
		}

		var node = OT.applyOperation( op );

		for ( var j = 0; j < siteOps.length; j++ ) {
			transOps[ j ].node = node;
			op = OT.IT[ siteOps[ j ].type ][ transOps[ j ].type ]( siteOps[ j ], transOps[ j ] );

			newSiteOps.push( op );
		}

		applyOps.push( op );

		siteOps = newSiteOps;
	}

	return {
		transformedIncoming: applyOps,
		ITsDone: inOps.length * siteOps.length * 2
	};
}

function getPath( pathString ) {
	var path = pathString.split( ',' );

	for ( var i = 0; i < path.length; i++ ) {
		path[ i ] = Number( path[ i ] );
	}

	return path
}

function createOpFromTextLine( line, siteId ) {
	var args = line.split( ' ', 4 );

	var op = {
		type: args[ 0 ]
	};

	var offset, address, path;

	switch ( op.type ) {
		case 'insert':
			path = getPath( args[ 1 ] );
			offset = path.pop();
			address = OT.createAddress( docRoot, path );

			op.props = {
				address: address,
				offset: offset,
				node: null
			};

			var node = null;

			if ( args[ 2 ] == 'text' ) {
				node = new OT.TextNode( args[ 3 ] );
			} else if ( args[ 2 ] == 'block' ) {
				node = new OT.BlockNode( args[ 3 ] );
			}

			op.props.node = node;

			break;
		case 'remove':
			path = getPath( args[ 1 ] );
			offset = path.pop();
			address = OT.createAddress( docRoot, path );

			op.props = {
				address: address,
				offset: offset,
				node: null
			};

			break;
		case 'change':
			path = getPath( args[ 1 ] );
			address = OT.createAddress( docRoot, path );

			op.props = {
				address: address,
				attr: args[ 2 ],
				value: args[ 3 ]
			};

			break;
		case 'move':
			var	pathFrom = getPath( args[ 1 ] );
			var	pathTo = getPath( args[ 2 ] );
			var fromOffset = pathFrom.pop();
			var toOffset = pathTo.pop();
			var fromAddress = OT.createAddress( docRoot, pathFrom );
			var toAddress = OT.createAddress( docRoot, pathTo );

			op.props = {
				fromAddress: fromAddress,
				fromOffset: fromOffset,
				toAddress: toAddress,
				toOffset: toOffset
			};

			break;
		default:
			return null;
	}

	op.props.site = siteId;

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