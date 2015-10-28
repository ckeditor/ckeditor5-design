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
		for ( var i = 0; i < node.getChildrenCount(); i++ ) {
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
		assert.equal( treeToText( DOPT.getGraveyardRoot() ) + treeToText( DOPT.getDocRoot() ), result );
	}
}

function makeTest( testName, contextOps, siteOps, inOps, result ) {
	it( testName, makeTestScenario( contextOps, siteOps, inOps, result ) );
	it( testName + ' - swapped', makeTestScenario( contextOps, inOps, siteOps, result ) );
}

function makeTestOnly( testName, contextOps, siteOps, inOps, result ) {
	describe.only( 'this only', function() {
		it( testName, makeTestScenario( contextOps, siteOps, inOps, result ) );
		it( testName + ' - swapped', makeTestScenario( contextOps, inOps, siteOps, result ) );
	} );
}

function clearTree( root ) {
	while ( root.getChildrenCount() ) {
		root.removeChild( 0 );
	}
}

describe( 'Scenario', function() {
	beforeEach( function() {
		clearTree( DOPT.getDocRoot() );
		clearTree( DOPT.getGraveyardRoot() );
	} );

	makeTest( 'insert words in same place',
		[],
		[
			[ 'insert 1,0 text f', 1 ],
			[ 'insert 1,1 text o', 1 ],
			[ 'insert 1,2 text z', 1 ]
		],
		[
			[ 'insert 1,0 text b', 2 ],
			[ 'insert 1,1 text a', 2 ],
			[ 'insert 1,2 text r', 2 ]
		],
		'[gy]{}[doc]{barfoz}'
	);

	makeTest( 'remove same nodes - simple case',
		[
			[ 'insert 1,0 text f', 0 ],
			[ 'insert 1,1 text o', 0 ],
			[ 'insert 1,2 text z', 0 ]
		],
		[
			[ 'move 1,1 1 0,0', 1 ]
		],
		[
			[ 'move 1,1 1 0,0', 2 ]
		],
		'[gy]{o}[doc]{fz}'
	);

	makeTest( 'remove same nodes - complex case',
		[
			[ 'insert 1,0 text f', 0 ],
			[ 'insert 1,1 text o', 0 ],
			[ 'insert 1,2 text z', 0 ]
		],
		[
			[ 'insert 1,0 text a', 1 ],
			[ 'insert 1,1 text a', 1 ],
			[ 'move 1,4 1 0,0', 1 ] // remove z
		],
		[
			[ 'move 1,2 1 0,0', 2 ], // remove z
			[ 'move 1,1 1 0,1', 2 ] // remove o
		],
		'[gy]{zo}[doc]{aaf}'
	);

	makeTest( 'inserting to removed node',
		[
			[ 'insert 1,0 text a', 0 ],
			[ 'insert 1,1 block p', 0 ],
			[ 'insert 1,2 text b', 0 ]
		],
		[
			[ 'insert 1,1,0 text x', 1 ],
			[ 'insert 1,1,1 text y', 1 ]
		],
		[
			[ 'move 1,1 1 0,0', 2 ] // remove p
		],
		'[gy]{[p]{xy}}[doc]{ab}'
	);

	makeTest( 'change on intersecting ranges',
		[
			[ 'insert 1,0 text f', 0 ],
			[ 'insert 1,1 text o', 0 ],
			[ 'insert 1,2 text z', 0 ]
		],
		[
			[ 'change 1,0 1 bold 1', 1 ],
			[ 'change 1,1 1 bold 1', 1 ]
		],
		[
			[ 'change 1,1 1 italic 1', 2 ],
			[ 'change 1,2 1 italic 1', 2 ]
		],
		'[gy]{}[doc]{f<bold:1>o<bold:1><italic:1>z<italic:1>}'
	);

	makeTest( 'example #1',
		[
			[ 'insert 1,0 block p', 0 ],
			[ 'insert 1,1 block p', 0 ],
			[ 'insert 1,0 text l', 0 ],
			[ 'insert 1,1 text o', 0 ],
			[ 'insert 1,2 text r', 0 ],
			[ 'insert 1,3,0 text e', 0 ],
			[ 'insert 1,3,1 text m', 0 ]
		],
		[
			[ 'insert 1,0 text a', 1 ],
			[ 'move 1,2 1 0,0', 1 ], // remove o
			[ 'change 1,3,0 1 bold 1', 1 ],
			[ 'insert 1,4,0 text a', 1 ]
		],
		[
			[ 'insert 1,0 text b', 2 ],
			[ 'insert 1,2 block d', 2 ],
			[ 'insert 1,2,0 text x', 2 ],
			[ 'change 1,5,0 1 italic 1', 2 ],
			[ 'change 1,5,1 1 italic 1', 2 ],
			[ 'move 1,3 1 0,0', 2 ] // remove o
		],
		'[gy]{' +
			'o' +
		'}' +
		'[doc]{' +
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

	makeTest( 'example #2 moves - strong remove',
		[
			[ 'insert 1,0 block a', 0 ],
			[ 'insert 1,1 block b', 0 ],
			[ 'insert 1,2 block c', 0 ],
			[ 'insert 1,0,0 text y', 0 ]
		],
		[
			[ 'insert 1,0,0 text x', 1 ],
			[ 'move 1,0 1 1,1,0', 1 ] // move a to another node
		],
		[
			[ 'move 1,0 1 0,0', 2 ], // remove a
			[ 'move 1,0 1 1,2', 2 ],
			[ 'insert 1,1,0 text f', 2 ]
		],
		'[gy]{[a]{xy}}[doc]{[c]{}[b]{f}}'
	);

	makeTest( 'example #2 moves - weak remove',
		[
			[ 'insert 1,0 block a', 0 ],
			[ 'insert 1,1 block b', 0 ],
			[ 'insert 1,2 block c', 0 ],
			[ 'insert 1,0,0 text y', 0 ]
		],
		[
			[ 'insert 1,0,0 text x', 2 ],
			[ 'move 1,0 1 1,1,0', 2 ] // move a to another node
		],
		[
			[ 'move 1,0 1 0,0', 1 ], // remove a
			[ 'move 1,0 1 1,2', 1 ],
			[ 'insert 1,1,0 text f', 1 ]
		],
		'[gy]{}[doc]{[c]{}[b]{[a]{xy}f}}'
	);

	makeTest( 'example #3 insignificant moves',
		[
			[ 'insert 1,0 block a', 0 ],
			[ 'insert 1,1 block b', 0 ],
			[ 'insert 1,2 block c', 0 ]
		],
		[
			[ 'insert 1,0,0 text x', 1 ],
			[ 'move 1,0 1 1,0', 1 ],
			[ 'move 1,0 1 1,1', 1 ],
			[ 'insert 1,0,1 text y', 1 ]
		],
		[
			[ 'insert 1,0,0 text o', 2 ],
			[ 'insert 1,1,0 text o', 2 ],
			[ 'insert 1,2,0 text o', 2 ]
		],
		'[gy]{}[doc]{[a]{oxy}[b]{o}[c]{o}}'
	);

	makeTest( 'example #4 moving into same place',
		[
			[ 'insert 1,0 block 1', 0 ],
			[ 'insert 1,0,1 text a', 0 ],
			[ 'insert 1,0,2 text b', 0 ],
			[ 'insert 1,0,3 text x', 0 ],
			[ 'insert 1,0,4 text y', 0 ],
			[ 'insert 1,1 block 2', 0 ]
		],
		[
			[ 'move 1,0,0 1 1,1,0', 1 ],
			[ 'move 1,0,0 1 1,1,1', 1 ]
		],
		[
			[ 'move 1,0,2 1 1,1,0', 2 ],
			[ 'move 1,0,2 1 1,1,1', 2 ]
		],
		'[gy]{}[doc]{[1]{}[2]{xyab}}'
	);

	makeTest( 'example #5 ranges',
		[
			[ 'insert 1,0 block a\0block b', 0 ],
			[ 'insert 1,0,0 text x\0text y\0text z', 0 ],
			[ 'insert 1,1,0 text a\0text b\0text c', 0 ]
		],
		[
			[ 'insert 1,1,1 text f\0text o\0text o', 1 ],
			[ 'move 1,1,3 2 1,0,1', 1 ]
		],
		[
			[ 'change 1,1,0 3 bold 1', 2 ],
			[ 'move 1,0 2 0,0', 2 ]
		],
		'[gy]{[a]{xob<bold:1>yz}[b]{a<bold:1>foc<bold:1>}}[doc]{}'
	);
} );