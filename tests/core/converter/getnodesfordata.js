bender.require( [
	'converter',
	'lineardocumentdata',
	'nodemanager'
], function(
	converter,
	LinearDocumentData,
	nodeManager
) {
	'use strict';

	describe( 'getNodesForData', function() {
		var doc = {};

		it( 'should produce nodes for the given data', function() {
			var input = [ {
				type: 'paragraph'
			}, {
				type: '/paragraph'
			} ];

			var data = new LinearDocumentData( input );
			var result = converter.getNodesForData( data, doc );

			expect( result ).to.have.length( 1 );
			expect( result[ 0 ] ).to.be.instanceof( nodeManager.get( 'paragraph' ) );
			expect( result[ 0 ].document ).to.equal( doc );
			expect( result[ 0 ] ).to.have.length( 2 );
		} );

		it( 'should produce a single text node for a text with mulitple styles', function() {
			var input = [
				[ 'f', [ 0 ] ],
				[ 'o', [ 0 ] ],
				[ 'o', [ 0 ] ],
				[ 'b', [ 1 ] ],
				[ 'a', [ 1 ] ],
				[ 'r', [ 1 ] ]
			];

			var data = new LinearDocumentData( input );
			var result = converter.getNodesForData( data, doc );

			expect( result ).to.have.length( 1 );

			var t = result[ 0 ];
			expect( t ).to.be.instanceof( nodeManager.get( 'text' ) );
			expect( t ).to.have.length( 6 );
		} );

		it( 'should produce nested nodes', function() {
			var input = [ {
					type: 'list',
					attributes: {
						style: 'number'
					}
				}, {
					type: 'listItem'
				}, {
					type: 'paragraph'
				},
				'f',
				'o',
				'o', {
					type: 'break'
				}, {
					type: '/break'
				},
				'b',
				'a',
				'r', {
					type: '/paragraph'
				}, {
					type: '/listItem'
				}, {
					type: '/list'
				}
			];

			var data = new LinearDocumentData( input );
			var result = converter.getNodesForData( data, doc );

			expect( result ).to.have.length( 1 );

			var ul = result[ 0 ];

			expect( ul ).to.be.instanceof( nodeManager.get( 'list' ) );
			expect( ul.children ).to.have.length( 1 );

			var li = ul.children[ 0 ];

			expect( li ).to.be.instanceof( nodeManager.get( 'listItem' ) );
			expect( li.children ).to.have.length( 1 );

			var p = li.children[ 0 ];

			expect( p ).to.be.instanceof( nodeManager.get( 'paragraph' ) );
			expect( p.children ).to.have.length( 3 );

			var t1 = p.children[ 0 ];

			expect( t1 ).to.be.instanceof( nodeManager.get( 'text' ) );

			var br = p.children[ 1 ];

			expect( br ).to.be.instanceof( nodeManager.get( 'break' ) );

			var t2 = p.children[ 2 ];

			expect( t2 ).to.be.instanceof( nodeManager.get( 'text' ) );
		} );
	} );
} );