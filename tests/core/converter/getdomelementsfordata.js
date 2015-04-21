bender.require( [
	'converter',
	'nodemanager',
	'store',
	'tools/utils'
], function(
	converter,
	nodeManager,
	Store,
	utils
) {
	'use strict';

	describe( 'getDomElementsForData', function() {
		var store;

		var styles = [
			[ 'bold', 'b' ],
			[ 'italic', 'i' ],
			[ 'underline', 'u' ]
		];

		beforeEach( function() {
			store = new Store();

			styles.forEach( function( style ) {
				store.store( nodeManager.get( style[ 0 ] ).toData( document.createElement( style[ 1 ] ) ) );
			} );
		} );

		it( 'should produce block elements', function() {
			var input = [ {
				type: 'paragraph'
			}, {
				type: '/paragraph'
			}, {
				type: 'div'
			}, {
				type: '/div'
			} ];

			var result = converter.getDomElementsForData( input, store, document );

			expect( result ).to.have.length( 2 );
			expect( result[ 0 ].tagName ).to.equal( 'P' );
			expect( result[ 1 ].tagName ).to.equal( 'DIV' );
		} );

		it( 'should ignore invalid elements', function() {
			var input = [
				false, {
					type: 'paragraph'
				}, {
					type: '/paragraph'
				},
				null, {
					type: 'div'
				}, {
					type: '/div'
				}
			];

			var result = converter.getDomElementsForData( input, store, document );

			expect( result ).to.have.length( 2 );
			expect( result[ 0 ].tagName ).to.equal( 'P' );
			expect( result[ 1 ].tagName ).to.equal( 'DIV' );
		} );

		it( 'should produce nested block elements', function() {
			var input = [ {
				type: 'div'
			}, {
				type: 'paragraph'
			}, {
				type: '/paragraph'
			}, {
				type: '/div'
			} ];

			var result = converter.getDomElementsForData( input, store, document );

			expect( result ).to.have.length( 1 );

			var div = result[ 0 ];

			expect( div.tagName ).to.equal( 'DIV' );
			expect( div.childNodes ).to.have.length( 1 );

			var p = div.childNodes[ 0 ];

			expect( p.tagName ).to.equal( 'P' );
			expect( p.childNodes ).to.have.length( 0 );
		} );

		it( 'should produce text nodes', function() {
			var input = [
				"f",
				"o",
				"o"
			];

			var result = converter.getDomElementsForData( input, store, document );

			expect( result ).to.have.length( 1 );

			var t = result[ 0 ];

			expect( t.nodeType ).to.equal( Node.TEXT_NODE );
			expect( t.data ).to.equal( 'foo' );
		} );

		it( 'should produce nested text nodes', function() {
			var input = [ {
					type: 'paragraph'
				},
				"f",
				"o",
				"o", {
					type: '/paragraph'
				}
			];

			var result = converter.getDomElementsForData( input, store, document );

			expect( result ).to.have.length( 1 );

			var p = result[ 0 ];

			expect( p.tagName ).to.equal( 'P' );
			expect( p.childNodes ).to.have.length( 1 );

			var t = p.childNodes[ 0 ];

			expect( t.nodeType ).to.equal( Node.TEXT_NODE );
			expect( t.data ).to.equal( 'foo' );
		} );

		it( 'should produce nodes for a mix of texts and block elements', function() {
			var input = [
				'f',
				'o',
				'o', {
					type: 'break'
				}, {
					type: '/break'
				},
				'b',
				'a',
				'r'
			];

			var result = converter.getDomElementsForData( input, store, document );

			expect( result ).to.have.length( 3 );

			var t1 = result[ 0 ];

			expect( t1.nodeType ).to.equal( Node.TEXT_NODE );
			expect( t1.data ).to.equal( 'foo' );

			var br = result[ 1 ];

			expect( br.tagName ).to.equal( 'BR' );
			expect( br.childNodes ).to.have.length( 0 );

			var t2 = result[ 2 ];

			expect( t2.nodeType ).to.equal( Node.TEXT_NODE );
			expect( t2.data ).to.equal( 'bar' );
		} );

		it( 'should produce elements from styled text', function() {
			var input = [ {
					type: 'paragraph'
				},
				[ 'f', [ 0 ] ],
				[ 'o', [ 0 ] ],
				[ 'o', [ 0 ] ], {
					type: '/paragraph'
				}
			];

			var result = converter.getDomElementsForData( input, store, document );

			expect( result ).to.have.length( 1 );

			var p = result[ 0 ];

			expect( p.childNodes ).to.have.length( 1 );

			var b = p.childNodes[ 0 ];

			expect( b.tagName ).to.equal( 'STRONG' );
		} );

		it( 'should produce elements from a text with mulitple styles', function() {
			var input = [ {
					type: 'paragraph'
				},
				[ 'f', [ 0, 1, 2 ] ],
				[ 'o', [ 0, 1, 2 ] ],
				[ 'o', [ 0, 1, 2 ] ], {
					type: '/paragraph'
				}
			];

			var result = converter.getDomElementsForData( input, store, document );

			expect( result ).to.have.length( 1 );

			var p = result[ 0 ];

			expect( p.childNodes ).to.have.length( 1 );

			var b = p.childNodes[ 0 ];

			expect( b.tagName ).to.equal( 'STRONG' );
			expect( b.childNodes ).to.have.length( 1 );

			var i = b.childNodes[ 0 ];

			expect( i.tagName ).to.equal( 'EM' );
			expect( i.childNodes ).to.have.length( 1 );

			var u = i.childNodes[ 0 ];

			expect( u.tagName ).to.equal( 'U' );
			expect( u.childNodes ).to.have.length( 1 );

			var t = u.childNodes[ 0 ];

			expect( t.nodeType ).to.equal( Node.TEXT_NODE );
			expect( t.data ).to.equal( 'foo' );
		} );
	} );

} );