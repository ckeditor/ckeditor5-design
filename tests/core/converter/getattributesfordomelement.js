bender.require( [
	'converter',
	'store'
], function(
	converter,
	Store
) {
	'use strict';

	describe( 'getAttributesForDomElement', function() {
		var store;

		beforeEach( function() {
			store = new Store();
		} );

		it( 'should get no for a block element', function() {
			var t1 = document.getElementById( 't1' ),
				attributes = converter.getAttributesForDomElement( t1, store );

			expect( attributes ).to.deep.equal( [] );
		} );

		it( 'should get no for an inline element', function() {
			var t2 = document.getElementById( 't2' ),
				attributes = converter.getAttributesForDomElement( t2, store );

			expect( attributes ).to.deep.equal( [ 0 ] );
		} );

		it( 'should get no for a text node inside an inline element', function() {
			var t2 = document.getElementById( 't2' ),
				txt = t2.firstChild,
				attributes = converter.getAttributesForDomElement( txt, store );

			expect( attributes ).to.deep.equal( [ 0 ] );
		} );

		it( 'should get attributes for a nested element', function() {
			var t3 = document.getElementById( 't3' ),
				attributes = converter.getAttributesForDomElement( t3, store );

			expect( attributes ).to.deep.equal( [ 2, 1, 0 ] );
		} );

		it( 'should get attributes for a text node inside of a nested inline element', function() {
			var t3 = document.getElementById( 't3' ),
				txt = t3.firstChild,
				attributes = converter.getAttributesForDomElement( txt, store );

			expect( attributes ).to.deep.equal( [ 2, 1, 0 ] );
		} );
	} );

} );