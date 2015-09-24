var assert = require( 'assert' );
var OT = require( '../ot.js' );
var DOPT = require( '../dopt.js' );
var opl = DOPT.createOpFromTextLine;

/*
 * This test suites checks whether a sets of local and incoming operations
 * have a correct result after combining.
 */

function nodeAttrsToText( node ) {
	var text = '';

	for ( var i in node.attrs ) {
		text += '<' + i + ':' + node.attrs[ i ] + '>';
	}

	return text;
}

function treeToText( node ) {
	var text = '';

	if ( node instanceof OT.BlockNode ) {

		text += '[' + node.type + ']{';
		for ( var i = 0; i < node.getChildCount(); i++ ) {
			text += treeToText( node.getChild( i ) );
		}
		text += '}';

	} else if ( node instanceof OT.TextNode ) {
		text += node.char;
	}

	text += nodeAttrsToText( node );

	return text;
}

function makeTest( context, siteOps, inOps, result ) {
	return function() {
		DOPT.dopt( [], context );
		DOPT.dopt( siteOps, inOps );
		assert.equal( treeToText( DOPT.getDocRoot() ), result );
	}
}

describe( 'Scenario', function() {
	beforeEach( function() {
		var docRoot = DOPT.getDocRoot();
		while ( docRoot.getChildCount() ) {
			docRoot.removeChild( 0 );
		}
	} );

	it( 'insert words in same place', makeTest(
		[],
		[
			opl( 'insert 0 text f', 1 ),
			opl( 'insert 1 text o', 1 ),
			opl( 'insert 2 text z', 1 )
		],
		[
			opl( 'insert 0 text b', 2 ),
			opl( 'insert 1 text a', 2 ),
			opl( 'insert 2 text r', 2 )
		],
		'[body]{barfoz}'
	) );

	it( 'remove same nodes - simple case', makeTest(
		[
			opl( 'insert 0 text f', 0 ),
			opl( 'insert 1 text o', 0 ),
			opl( 'insert 2 text z', 0 )
		],
		[
			opl( 'remove 1', 1 )
		],
		[
			opl( 'remove 1', 2 )
		],
		'[body]{fz}'
	) );

	it( 'removes same nodes - complex case', makeTest(
		[
			opl( 'insert 0 text f', 0 ),
			opl( 'insert 1 text o', 0 ),
			opl( 'insert 2 text z', 0 )
		],
		[
			opl( 'insert 0 text a', 1 ),
			opl( 'insert 1 text a', 1 ),
			opl( 'remove 4', 1 ) // remove z
		],
		[
			opl( 'remove 2', 2 ), // remove z
			opl( 'remove 1', 2 ) // remove o
		],
		'[body]{aaf}'
	) );

	it( 'inserting to removed node', makeTest(
		[
			opl( 'insert 0 text a', 0 ),
			opl( 'insert 1 block p', 0 ),
			opl( 'insert 2 text b', 0 )
		],
		[
			opl( 'insert 1,0 text x', 1 ),
			opl( 'insert 1,1 text y', 1 )
		],
		[
			opl( 'remove 1', 2 )
		],
		'[body]{ab}'
	) );

	it( 'change on intersecting ranges', makeTest(
		[
			opl( 'insert 0 text f', 0 ),
			opl( 'insert 1 text o', 0 ),
			opl( 'insert 2 text z', 0 )
		],
		[
			opl( 'change 0 bold 1', 1 ),
			opl( 'change 1 bold 1', 1 )
		],
		[
			opl( 'change 1 italic 1', 2 ),
			opl( 'change 2 italic 1', 2 )
		],
		'[body]{f<bold:1>o<bold:1><italic:1>z<italic:1>}'
	) );

	it( 'example #1', makeTest(
		[
			opl( 'insert 0 block p', 0 ),
			opl( 'insert 1 block p', 0 ),
			opl( 'insert 0 text l', 0 ),
			opl( 'insert 1 text o', 0 ),
			opl( 'insert 2 text r', 0 ),
			opl( 'insert 3,0 text e', 0 ),
			opl( 'insert 3,1 text m', 0 )
		],
		[
			opl( 'insert 0 text a', 1 ),
			opl( 'remove 2', 1 ),
			opl( 'change 3,0 bold 1', 1 ),
			opl( 'insert 4,0 text a', 1 )
		],
		[
			opl( 'insert 0 text b', 2 ),
			opl( 'insert 2 block d', 2 ),
			opl( 'insert 2,0 text x', 2 ),
			opl( 'change 5,0 italic 1', 2 ),
			opl( 'change 5,1 italic 1', 2 ),
			opl( 'remove 3', 2 )
		],
		'[body]{' +
			'bal' +
			'[d]{' +
				'x' +
			'}' +
			'r' +
			'[p]{' +
				'e<bold:1><italic:1>m<italic:1>' +
			'}' +
			'[p]{' +
				'a' +
			'}' +
		'}'
	) );

	// This example has the same operations as previous but we swapped incoming
	// and site operations. Note that site ids remained intact - this simulates
	// what has been happening on "the other person's computer".
	// The results should be the same on both ends (note that there is a
	// difference in attributes order but the order does not matter).
	it( 'example #1 swapped sites', makeTest(
		[
			opl( 'insert 0 block p', 0 ),
			opl( 'insert 1 block p', 0 ),
			opl( 'insert 0 text l', 0 ),
			opl( 'insert 1 text o', 0 ),
			opl( 'insert 2 text r', 0 ),
			opl( 'insert 3,0 text e', 0 ),
			opl( 'insert 3,1 text m', 0 )
		],
		[
			opl( 'insert 0 text b', 2 ),
			opl( 'insert 2 block d', 2 ),
			opl( 'insert 2,0 text x', 2 ),
			opl( 'change 5,0 italic 1', 2 ),
			opl( 'change 5,1 italic 1', 2 ),
			opl( 'remove 3', 2 )
		],
		[
			opl( 'insert 0 text a', 1 ),
			opl( 'remove 2', 1 ),
			opl( 'change 3,0 bold 1', 1 ),
			opl( 'insert 4,0 text a', 1 )
		],
		'[body]{' +
			'bal' +
			'[d]{' +
				'x' +
			'}' +
			'r' +
			'[p]{' +
				'e<italic:1><bold:1>m<italic:1>' +
			'}' +
			'[p]{' +
				'a' +
			'}' +
		'}'
	) );
} );