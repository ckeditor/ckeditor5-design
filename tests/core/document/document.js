bender.require( [
	'document',
	'tools/element',
	'tools/utils'
], function(
	Document,
	Element,
	utils
) {
	'use strict';

	var t1 = new Element( '#t1' );

	describe( 'getBranchAtPosition', function() {
		it( 'should return a branch represented by linear data at the given position', function() {
			var doc = new Document( t1 );

			var p = doc.root.children[ 0 ];
			var ul = doc.root.children[ 1 ];
			var li = ul.children[ 0 ];
			var ul2 = li.children[ 1 ];
			var li2 = ul2.children[ 0 ];

			var expected = [
				0, doc.root,
				1, p,
				2, p,
				6, p,
				8, p,
				9, p,
				10, p,
				11, p,
				13, p,
				14, p,
				15, ul,
				16, li,
				17, li,
				20, li,
				21, ul2,
				22, li2,
				23, li2,
				26, li2,
				27, li2,
				28, ul2,
				29, li,
				30, ul,
				31, doc.root
			];

			for ( var i = 0; i < expected.length; i += 2 ) {
				expect( doc.getBranchAtPosition( expected[ i ] ) ).to.equal( expected[ i + 1 ] );
			}
		} );
	} );

	describe( 'getNodeData', function() {
		it( 'should return data representing a node', function() {
			var doc = new Document( t1 );

			var p = doc.root.children[ 0 ];
			var ul = doc.root.children[ 1 ];
			var li = ul.children[ 0 ];

			var expected = [
				doc.root, doc.data.get(),
				p, doc.data.slice( 1, 15 ),
				p.children[ 0 ], doc.data.slice( 2, 9 ),
				p.children[ 1 ], doc.data.slice( 9, 11 ),
				p.children[ 2 ], doc.data.slice( 11, 14 ),
				ul, doc.data.slice( 15, 31 ),
				li, doc.data.slice( 16, 30 ),
				li.children[ 0 ], doc.data.slice( 17, 21 ),
				li.children[ 1 ], doc.data.slice( 21, 29 ),
				li.children[ 1 ], doc.data.slice( 21, 29 ),
				li.children[ 1 ].children[ 0 ], doc.data.slice( 22, 28 ),
				li.children[ 1 ].children[ 0 ], doc.data.slice( 22, 28 ),
				li.children[ 1 ].children[ 0 ].children[ 0 ], doc.data.slice( 23, 27 )
			];

			for ( var i = 0; i < expected.length; i += 2 ) {
				var result = doc.getNodeData( expected[ i ] );
				expect( result ).to.deep.equal( expected[ i + 1 ] );
			}
		} );
	} );

	describe( 'getNodeAtPosition', function() {
		it( 'should return a node prepresented by linear data at the given position', function() {
			var doc = new Document( t1 );

			var p = doc.root.children[ 0 ];
			var ul = doc.root.children[ 1 ];
			var li = ul.children[ 0 ];
			var ul2 = li.children[ 1 ];
			var li2 = ul2.children[ 0 ];

			var expected = [
				0, doc.root,
				1, p,
				2, p.children[ 0 ],
				6, p.children[ 0 ],
				8, p.children[ 0 ],
				9, p.children[ 1 ],
				10, p.children[ 1 ],
				11, p.children[ 2 ],
				13, p.children[ 2 ],
				14, p,
				15, ul,
				16, li,
				17, li.children[ 0 ],
				20, li.children[ 0 ],
				21, ul2,
				22, li2,
				23, li2.children[ 0 ],
				26, li2.children[ 0 ],
				27, li2,
				28, ul2,
				29, li,
				30, ul,
				31, doc.root
			];

			for ( var i = 0; i < expected.length; i += 2 ) {
				expect( doc.getNodeAtPosition( expected[ i ] ) ).to.equal( expected[ i + 1 ] );
			}
		} );
	} );
} );