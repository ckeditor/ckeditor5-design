/* global describe, it, beforeEach */

var assert = require( 'assert' );
var OT = require( '../ot.js' );
var DOPT = require( '../dopt.js' );
var opl = DOPT.createOpFromTextLine;

/*
 * This test suites checks whether a sets of local and incoming operations
 * have a correct result after combining. The test is also checks if both sites
 * have same document state after all transformations and appliances are done.
 */

function nodeAttrsToText( node ) {
	var text = '';

	var keys = Object.keys( node.attrs ).sort();

	for ( var i = 0; i < keys.length; i++ ) {
		var key = keys[ i ];
		text += '<' + key + ':' + node.attrs[ key ] + '>';
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

function createOpsList( opsLines ) {
	var ops = [];

	for ( var i = 0; i < opsLines.length; i++ ) {
		ops.push( opl( opsLines[ i ][ 0 ], opsLines[ i ][ 1 ] ) );
	}

	return ops;
}

function makeTestScenario( contextOps, siteOps, inOps, result ) {
	return function() {
		DOPT.dopt( [], createOpsList( contextOps ) );
		DOPT.dopt( createOpsList( siteOps ), createOpsList( inOps ) );
		assert.equal( treeToText( DOPT.getDocRoot() ), result );
	}
}

function makeTest( testName, contextOps, siteOps, inOps, result ) {
	it( testName, makeTestScenario( contextOps, siteOps, inOps, result ) );
	it( testName + ' - swapped', makeTestScenario( contextOps, inOps, siteOps, result ) );
}

describe( 'Scenario', function() {
	beforeEach( function() {
		var docRoot = DOPT.getDocRoot();
		while ( docRoot.getChildCount() ) {
			docRoot.removeChild( 0 );
		}
	} );

	makeTest( 'insert words in same place',
		[],
		[
			[ 'insert 0 text f', 1 ],
			[ 'insert 1 text o', 1 ],
			[ 'insert 2 text z', 1 ]
		],
		[
			[ 'insert 0 text b', 2 ],
			[ 'insert 1 text a', 2 ],
			[ 'insert 2 text r', 2 ]
		],
		'[body]{barfoz}'
	);

	makeTest( 'remove same nodes - simple case',
		[
			[ 'insert 0 text f', 0 ],
			[ 'insert 1 text o', 0 ],
			[ 'insert 2 text z', 0 ]
		],
		[
			[ 'remove 1', 1 ]
		],
		[
			[ 'remove 1', 2 ]
		],
		'[body]{fz}'
	);

	makeTest( 'remove same nodes - complex case',
		[
			[ 'insert 0 text f', 0 ],
			[ 'insert 1 text o', 0 ],
			[ 'insert 2 text z', 0 ]
		],
		[
			[ 'insert 0 text a', 1 ],
			[ 'insert 1 text a', 1 ],
			[ 'remove 4', 1 ] // remove z
		],
		[
			[ 'remove 2', 2 ], // remove z
			[ 'remove 1', 2 ] // remove o
		],
		'[body]{aaf}'
	);

	makeTest( 'inserting to removed node',
		[
			[ 'insert 0 text a', 0 ],
			[ 'insert 1 block p', 0 ],
			[ 'insert 2 text b', 0 ]
		],
		[
			[ 'insert 1,0 text x', 1 ],
			[ 'insert 1,1 text y', 1 ]
		],
		[
			[ 'remove 1', 2 ]
		],
		'[body]{ab}'
	);

	makeTest( 'change on intersecting ranges',
		[
			[ 'insert 0 text f', 0 ],
			[ 'insert 1 text o', 0 ],
			[ 'insert 2 text z', 0 ]
		],
		[
			[ 'change 0 bold 1', 1 ],
			[ 'change 1 bold 1', 1 ]
		],
		[
			[ 'change 1 italic 1', 2 ],
			[ 'change 2 italic 1', 2 ]
		],
		'[body]{f<bold:1>o<bold:1><italic:1>z<italic:1>}'
	);

	makeTest( 'example #1',
		[
			[ 'insert 0 block p', 0 ],
			[ 'insert 1 block p', 0 ],
			[ 'insert 0 text l', 0 ],
			[ 'insert 1 text o', 0 ],
			[ 'insert 2 text r', 0 ],
			[ 'insert 3,0 text e', 0 ],
			[ 'insert 3,1 text m', 0 ]
		],
		[
			[ 'insert 0 text a', 1 ],
			[ 'remove 2', 1 ],
			[ 'change 3,0 bold 1', 1 ],
			[ 'insert 4,0 text a', 1 ]
		],
		[
			[ 'insert 0 text b', 2 ],
			[ 'insert 2 block d', 2 ],
			[ 'insert 2,0 text x', 2 ],
			[ 'change 5,0 italic 1', 2 ],
			[ 'change 5,1 italic 1', 2 ],
			[ 'remove 3', 2 ]
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
	);

	makeTest( 'example #2 moves',
		[
			[ 'insert 0 block a', 0 ],
			[ 'insert 1 block b', 0 ],
			[ 'insert 2 block c', 0 ],
			[ 'insert 0,0 text y', 0 ]
		],
		[
			[ 'insert 0,0 text x', 1 ],
			[ 'move 0 1,0', 1 ]
		],
		[
			[ 'remove 0', 2 ],
			[ 'move 0 2', 2 ],
			[ 'insert 1,0 text f', 2 ]
		],
		'[body]{[c]{}[b]{f[a]{xy}}}'
	);

	makeTest( 'example #3 insignificant moves',
		[
			[ 'insert 0 block a', 0 ],
			[ 'insert 1 block b', 0 ],
			[ 'insert 2 block c', 0 ]
		],
		[
			[ 'insert 0,0 text x', 1 ],
			[ 'move 0 0', 1 ],
			[ 'move 0 1', 1 ],
			[ 'insert 0,1 text y', 1 ]
		],
		[
			[ 'insert 0,0 text o', 2 ],
			[ 'insert 1,0 text o', 2 ],
			[ 'insert 2,0 text o', 2 ]
		],
		'[body]{[a]{oxy}[b]{o}[c]{o}}'
	);

	makeTest( 'example #4 moving into same place',
		[
			[ 'insert 0 block a', 0 ],
			[ 'insert 0,1 text a', 0 ],
			[ 'insert 0,2 text b', 0 ],
			[ 'insert 0,3 text x', 0 ],
			[ 'insert 0,4 text y', 0 ],
			[ 'insert 1 block b', 0 ]
		],
		[
			[ 'move 0,0 1,0', 1 ],
			[ 'move 0,0 1,1', 1 ]
		],
		[
			[ 'move 0,2 1,0', 2 ],
			[ 'move 0,2 1,1', 2 ]
		],
		'[body]{[a]{}[b]{xyab}}'
	);
} );