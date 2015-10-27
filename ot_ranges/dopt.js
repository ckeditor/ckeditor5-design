if ( typeof module != 'undefined' ) {
	var OT = require( './ot.js' );
}

if ( typeof define != 'undefined' ) {
	var OT = require( 'ot' );
}

// The main root.
var docRoot = new OT.BlockNode( 'doc' );
var graveyardRoot = new OT.BlockNode( 'gy' );

OT.setDocumentRoot( docRoot );
OT.setGraveyardRoot( graveyardRoot );

function applyOperations( operations ) {
	for ( var i = 0; i < operations.length; i++ ) {
		OT.applyOperation( operations[ i ] );
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

		var ops = inOps[ i ];

		for ( var j = 0; j < siteOps.length; j++ ) {
			if ( !( ops instanceof Array ) ) {
				ops = [ ops ];
			}

			for ( var k = 0; k < ops.length; k++ ) {
				transOps.push( ops[ k ] );

				ops[ k ] = OT.IT[ ops[ k ].type ][ siteOps[ j ].type ]( ops[ k ], siteOps[ j ] );

				// flatten array
				if ( ops[ k ] instanceof Array ) {
					var from = k;
					k += ops[ k ].length;
					Array.prototype.splice.apply( ops, [ from, 1 ].concat( ops[ from ] ) );
				}
			}
		}

		applyOperations(ops);
		var ops = null;

		for ( var j = 0; j < siteOps.length; j++ ) {

			if ( !( ops instanceof Array ) ) {
				ops = [ ops ];
			}

			for ( var k = 0; k < ops.length; k++ ) {
				ops[ k ] = OT.IT[ siteOps[ j ].type ][ transOps[ j ].type ]( siteOps[ j ], transOps[ j ] );

				// flatten array
				if ( ops[ k ] instanceof Array ) {
					var from = k;
					k += ops[ k ].length;
					Array.prototype.splice.apply( ops, [ from, 1 ].concat( ops[ from ] ) );
				}

				newSiteOps.push( ops[ k ] );
			}
		}

		applyOps.concat( ops );

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

	return path;
}

function splitInTwo( str, char ) {
	var index = str.indexOf( char );
	if ( index < 0 ) {
		return [ str ];
	} else {
		return [ str.substr( 0, index ), str.substr( index + 1 ) ];
	}
}

function createOpFromTextLine( line, siteId ) {
	var args = splitInTwo( line, ' ' );

	var op = {
		type: args[ 0 ]
	};

	var offset, path, params;

	switch ( op.type ) {
		case 'insert':
			params = splitInTwo( args[ 1 ], ' ' );

			path = getPath( params[ 0 ] );
			offset = path.pop();

			op.props = {
				address: path,
				offset: offset,
				nodes: null
			};

			var nodesParams = params[ 1 ].split( '\0' );
			var nodes = [];

			for ( var i = 0; i < nodesParams.length; i++ ) {
				var node = nodesParams[ i ].split( ' ' );

				if ( node[ 0 ] == 'text' ) {
					nodes.push( new OT.TextNode( node[ 1 ] ) );
				} else if ( node[ 0 ] == 'block' ) {
					nodes.push( new OT.BlockNode( node[ 1 ] ) );
				}
			}

			op.props.nodes = nodes;
			op.props.howMany = nodes.length;

			break;
		case 'change':
			params = args[ 1 ].split( ' ', 4 );
			path = getPath( params[ 0 ] );
			offset = path.pop();

			op.props = {
				address: path,
				offset: offset,
				howMany: Number( params[ 1 ] ),
				attr: params[ 2 ],
				value: params[ 3 ]
			};

			break;
		case 'move':
			params = args[ 1 ].split( ' ', 3 );
			var	pathFrom = getPath( params[ 0 ] );
			var	pathTo = getPath( params[ 2 ] );
			var fromOffset = pathFrom.pop();
			var toOffset = pathTo.pop();

			op.props = {
				fromAddress: pathFrom,
				fromOffset: fromOffset,
				howMany: Number( params[ 1 ] ),
				toAddress: pathTo,
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
	getGraveyardRoot: function () {
		return graveyardRoot;
	},
	createOpFromTextLine: createOpFromTextLine
};

if ( typeof module != 'undefined' ) {
	module.exports = DOPT;
}

if ( typeof define != 'undefined' ) {
	define( DOPT );
}