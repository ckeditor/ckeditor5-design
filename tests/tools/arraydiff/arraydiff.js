bender.require( [ 'tools/arraydiff' ], function( diff ) {
	'use strict';

	describe( 'arraydiff', function() {
		it( 'should expose the diff function', function() {
			expect( diff ).to.be.a( 'function' );
		} );

		it( 'should produce a valid set of edits for two arrays', function() {
			var a = [ 'a', 'b', 'c', 'd', 'e', 'f' ],
				b = [ 'b', 'c', 'g', 'e', 'h' ];

			var result = diff( a, b );

			expect( result ).to.deep.equal( [ -1, 0, 0, -1, 1, 0, -1, 1 ] );
		} );

		it( 'should allow defining the comparator function', function() {
			var a = [ {
					a: 1
				}, {
					a: 2
				}, {
					a: 3
				}, {
					a: 4
				} ],
				b = [ {
					a: 2
				}, {
					a: 5
				}, {
					a: 4
				}, {
					a: 3
				} ];

			function comparator( a, b ) {
				return a && b && a.a === b.a;
			}

			var result = diff( a, b, comparator );

			expect( result ).to.deep.equal( [ -1, 0, 1, 1, 0, -1 ] );
		} );
	} );
} );