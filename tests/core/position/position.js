bender.require( [
	'position'
], function(
	Position
) {
	'use strict';

	describe( 'Position', function() {
		it( 'should create new Position with offset and attributes', function() {
			var p = new Position( 10, [ 0, 1 ] );

			expect( p.offset ).to.equal( 10 );
			expect( p.attributes ).to.deep.equal( [ 0, 1 ] );
		} );

		it( 'should clone a position', function() {
			var p = new Position( 10, [ 0, 1 ] );

			var p2 = p.clone();

			expect( p2.offset ).to.equal( p.offset );
			expect( p2.attributes ).to.deep.equal( p.attributes );
		} );

		it( 'should check if two positions are equal', function() {
			var p = new Position( 10, [ 0, 1 ] );
			var p2 = new Position( 10, [ 0, 1 ] );
			var p3 = new Position( 5, [ 0, 1 ] );
			var p4 = new Position( 10, [ 2 ] );

			expect( p.equals( p2 ) ).to.be.true();
			expect( p.equals( p3 ) ).to.be.false();
			expect( p.equals( p4 ) ).to.be.false();
		} );

		it( 'should translate a position by the given offset', function() {
			var p = new Position( 10, [ 0, 1 ] );

			p.translate( 5 );

			expect( p.offset ).to.equal( 15 );
			expect( p.attributes ).to.deep.equal( [ 0, 1 ] );
		} );
	} );

} );