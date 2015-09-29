if ( typeof module != 'undefined' ) {
	var OT = require( './ot_node_offset.js' );
}

if ( typeof define != 'undefined' ) {
	var OT = require( 'ot_node_offset' );
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

var DOPT = {
	dopt: dopt,
	applyOperations: applyOperations,
	getDocRoot: function () {
		return docRoot;
	}
};

if ( typeof module != 'undefined' ) {
	module.exports = DOPT;
}

if ( typeof define != 'undefined' ) {
	define( DOPT );
}