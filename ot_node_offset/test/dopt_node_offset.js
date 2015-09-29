var assert = require( 'assert' );
var OT = require( '../ot_node_offset.js' );
var DOPT = require( '../dopt_node_offset.js' );
var docRoot = DOPT.getDocRoot();

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

describe( 'Scenario node-offset OT', function() {
	beforeEach( function() {
		while ( docRoot.getChildCount() ) {
			docRoot.removeChild( 0 );
		}
	} );

	it( 'insert words in same place', makeTest(
		[],
		[
			OT.createOperation( 'insert', { target: docRoot, offset: 0, node: new OT.TextNode( 'f' ), site: 1 } ),
			OT.createOperation( 'insert', { target: docRoot, offset: 1, node: new OT.TextNode( 'o' ), site: 1 } ),
			OT.createOperation( 'insert', { target: docRoot, offset: 2, node: new OT.TextNode( 'z' ), site: 1 } )
		],
		[
			OT.createOperation( 'insert', { target: docRoot, offset: 0, node: new OT.TextNode( 'b' ), site: 2 } ),
			OT.createOperation( 'insert', { target: docRoot, offset: 1, node: new OT.TextNode( 'a' ), site: 2 } ),
			OT.createOperation( 'insert', { target: docRoot, offset: 2, node: new OT.TextNode( 'r' ), site: 2 } )
		],
		'[body]{barfoz}'
	) );

	it( 'remove same nodes - simple case', makeTest(
		[
			OT.createOperation( 'insert', { target: docRoot, offset: 0, node: new OT.TextNode( 'f' ), site: 0 } ),
			OT.createOperation( 'insert', { target: docRoot, offset: 1, node: new OT.TextNode( 'o' ), site: 0 } ),
			OT.createOperation( 'insert', { target: docRoot, offset: 2, node: new OT.TextNode( 'z' ), site: 0 } )
		],
		[
			OT.createOperation( 'remove', { target: docRoot, offset: 1, site: 1 } )
		],
		[
			OT.createOperation( 'remove', { target: docRoot, offset: 1, site: 2 } )
		],
		'[body]{fz}'
	) );

	it( 'removes same nodes - complex case', makeTest(
		[
			OT.createOperation( 'insert', { target: docRoot, offset: 0, node: new OT.TextNode( 'f' ), site: 0 } ),
			OT.createOperation( 'insert', { target: docRoot, offset: 1, node: new OT.TextNode( 'o' ), site: 0 } ),
			OT.createOperation( 'insert', { target: docRoot, offset: 2, node: new OT.TextNode( 'z' ), site: 0 } )
		],
		[
			OT.createOperation( 'insert', { target: docRoot, offset: 0, node: new OT.TextNode( 'a' ), site: 1 } ),
			OT.createOperation( 'insert', { target: docRoot, offset: 1, node: new OT.TextNode( 'a' ), site: 1 } ),
			OT.createOperation( 'remove', { target: docRoot, offset: 4, site: 1 } ) // remove z
		],
		[
			OT.createOperation( 'remove', { target: docRoot, offset: 2, site: 1 } ), // remove z
			OT.createOperation( 'remove', { target: docRoot, offset: 1, site: 1 } ) // remove o
		],
		'[body]{aaf}'
	) );

	it( 'inserting into block node', function() {
		var pNode = new OT.BlockNode( 'p' );
		makeTest(
			[
				OT.createOperation( 'insert', { target: docRoot, offset: 0, node: pNode, site: 0 } )
			],
			[
				OT.createOperation( 'insert', { target: pNode, offset: 0, node: new OT.TextNode( 'a' ), site: 1 } )
			],
			[
				OT.createOperation( 'insert', { target: pNode, offset: 0, node: new OT.TextNode( 'b' ), site: 2 } )
			],
			'[body]{[p]{ba}}'
		)();
	} );

	it( 'inserting to removed node', function() {
		var pNode = new OT.BlockNode( 'p' );

		makeTest(
			[
				OT.createOperation( 'insert', { target: docRoot, offset: 0, node: new OT.TextNode( 'a' ), site: 0 } ),
				OT.createOperation( 'insert', { target: docRoot, offset: 1, node: pNode, site: 0 } ),
				OT.createOperation( 'insert', { target: docRoot, offset: 2, node: new OT.TextNode( 'b' ), site: 0 } )
			],
			[
				OT.createOperation( 'remove', { target: docRoot, offset: 1, site: 1 } )
			],
			[
				OT.createOperation( 'insert', { target: pNode, offset: 0, node: new OT.TextNode( 'x' ), site: 2 } ),
				OT.createOperation( 'insert', { target: pNode, offset: 1, node: new OT.TextNode( 'y' ), site: 2 } )
			],
			'[body]{ab}'
		)
	} );

	it( 'change on intersecting ranges', function() {
		var fText = new OT.TextNode( 'f' );
		var oText = new OT.TextNode( 'o' );
		var zText = new OT.TextNode( 'z' );

		makeTest(
			[
				OT.createOperation( 'insert', { target: docRoot, offset: 0, node: fText, site: 0 } ),
				OT.createOperation( 'insert', { target: docRoot, offset: 1, node: oText, site: 0 } ),
				OT.createOperation( 'insert', { target: docRoot, offset: 2, node: zText, site: 0 } )
			],
			[
				OT.createOperation( 'change', { target: fText, attr: 'bold', value: 1, site: 1 } ),
				OT.createOperation( 'change', { target: oText, attr: 'bold', value: 1, site: 1 } )
			],
			[
				OT.createOperation( 'change', { target: oText, attr: 'italic', value: 1, site: 2 } ),
				OT.createOperation( 'change', { target: zText, attr: 'italic', value: 1, site: 2 } )
			],
			'[body]{f<bold:1>o<bold:1><italic:1>z<italic:1>}'
		)
	} );

	it( 'example #1', function() {
		var pNode1 = new OT.BlockNode( 'p' );
		var pNode2 = new OT.BlockNode( 'p' );
		var eText = new OT.TextNode( 'e' );
		var mText = new OT.TextNode( 'm' );
		var dNode = new OT.BlockNode( 'd' );

		makeTest(
			[
				OT.createOperation( 'insert', { target: docRoot, offset: 0, node: pNode1, site: 0 } ),
				OT.createOperation( 'insert', { target: docRoot, offset: 1, node: pNode2, site: 0 } ),
				OT.createOperation( 'insert', { target: docRoot, offset: 0, node: new OT.TextNode( 'l' ), site: 0 } ),
				OT.createOperation( 'insert', { target: docRoot, offset: 1, node: new OT.TextNode( 'o' ), site: 0 } ),
				OT.createOperation( 'insert', { target: docRoot, offset: 2, node: new OT.TextNode( 'r' ), site: 0 } ),
				OT.createOperation( 'insert', { target: pNode1, offset: 0, node: eText, site: 0 } ),
				OT.createOperation( 'insert', { target: pNode1, offset: 1, node: mText, site: 0 } )
			],
			[
				OT.createOperation( 'insert', { target: docRoot, offset: 0, node: new OT.TextNode( 'a' ), site: 1 } ),
				OT.createOperation( 'remove', { target: docRoot, offset: 2, site: 1 } ),
				OT.createOperation( 'change', { target: eText, attr: 'bold', value: 1, site: 1 } ),
				OT.createOperation( 'insert', { target: pNode2, offset: 0, node: new OT.TextNode( 'a' ), site: 1 } )
			],
			[
				OT.createOperation( 'insert', { target: docRoot, offset: 0, node: new OT.TextNode( 'b' ), site: 2 } ),
				OT.createOperation( 'insert', { target: docRoot, offset: 2, node: dNode, site: 2 } ),
				OT.createOperation( 'insert', { target: dNode, offset: 0, node: new OT.TextNode( 'x' ), site: 2 } ),
				OT.createOperation( 'change', { target: eText, attr: 'italic', value: 1, site: 2 } ),
				OT.createOperation( 'change', { target: mText, attr: 'italic', value: 1, site: 2 } ),
				OT.createOperation( 'remove', { target: docRoot, offset: 3, site: 2 } )
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
		)
	} );

	// This example has the same operations as previous but we swapped incoming
	// and site operations. Note that site ids remained intact - this simulates
	// what has been happening on "the other person's computer".
	// The results should be the same on both ends (note that there is a
	// difference in attributes order but the order does not matter).
	it( 'example #1 swapped sites', function(){
		var pNode1 = new OT.BlockNode( 'p' );
		var pNode2 = new OT.BlockNode( 'p' );
		var eText = new OT.TextNode( 'e' );
		var mText = new OT.TextNode( 'm' );
		var dNode = new OT.BlockNode( 'd' );

		makeTest(
			[
				OT.createOperation( 'insert', { target: docRoot, offset: 0, node: pNode1, site: 0 } ),
				OT.createOperation( 'insert', { target: docRoot, offset: 1, node: pNode2, site: 0 } ),
				OT.createOperation( 'insert', { target: docRoot, offset: 0, node: new OT.TextNode( 'l' ), site: 0 } ),
				OT.createOperation( 'insert', { target: docRoot, offset: 1, node: new OT.TextNode( 'o' ), site: 0 } ),
				OT.createOperation( 'insert', { target: docRoot, offset: 2, node: new OT.TextNode( 'r' ), site: 0 } ),
				OT.createOperation( 'insert', { target: pNode1, offset: 0, node: eText, site: 0 } ),
				OT.createOperation( 'insert', { target: pNode1, offset: 1, node: mText, site: 0 } )
			],
			[
				OT.createOperation( 'insert', { target: docRoot, offset: 0, node: new OT.TextNode( 'b' ), site: 2 } ),
				OT.createOperation( 'insert', { target: docRoot, offset: 2, node: dNode, site: 2 } ),
				OT.createOperation( 'insert', { target: dNode, offset: 0, node: new OT.TextNode( 'x' ), site: 2 } ),
				OT.createOperation( 'change', { target: eText, attr: 'italic', value: 1, site: 2 } ),
				OT.createOperation( 'change', { target: mText, attr: 'italic', value: 1, site: 2 } ),
				OT.createOperation( 'remove', { target: docRoot, offset: 3, site: 2 } )
			],
			[
				OT.createOperation( 'insert', { target: docRoot, offset: 0, node: new OT.TextNode( 'a' ), site: 1 } ),
				OT.createOperation( 'remove', { target: docRoot, offset: 2, site: 1 } ),
				OT.createOperation( 'change', { target: eText, attr: 'bold', value: 1, site: 1 } ),
				OT.createOperation( 'insert', { target: pNode2, offset: 0, node: new OT.TextNode( 'a' ), site: 1 } )
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
		)
	} );

	it( 'remove, change, insert scenario', function(){
		var pNode = new OT.BlockNode( 'p' );
		var dNode = new OT.BlockNode( 'd' );

		makeTest(
			[
				OT.createOperation( 'insert', { target: docRoot, offset: 0, node: pNode, site: 0 } ),
				OT.createOperation( 'insert', { target: pNode, offset: 0, node: dNode, site: 0 } )
			],
			[
				OT.createOperation( 'remove', { target: pNode, offset: 0, site: 1 } ),
				OT.createOperation( 'change', { target: dNode, attr: 'class', value: 'foobar', site: 1 } ),
				OT.createOperation( 'insert', { target: docRoot, offset: 0, node: pNode, site: 1 } )
			],
			[
				OT.createOperation( 'insert', { target: dNode, offset: 0, node: new OT.TextNode( 'b' ), site: 1 } )
			],
			'[body]{[p]{[d]{b}<class:foobar>}}'
		);
	} );
} );