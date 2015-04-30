bender.require( [
	'lineardata',
	'store'
], function(
	LinearData,
	Store
) {
	'use strict';

	var data = [ 'a', 'b', 'c', 'd', 'e' ],
		data2 = [ 'f', 'g', 'h' ],
		data3 = [ {
			a: 1
		}, {
			a: 2
		}, {
			a: 3
		}, {
			a: 4
		} ],
		store = new Store();

	describe( 'LinearData', function() {
		var ld;

		beforeEach( function() {
			ld = new LinearData( data.slice(), store );
		} );

		it( 'should create an empty instance', function() {
			ld = new LinearData();

			expect( ld ).to.have.length( 0 );
			expect( ld.store ).to.be.instanceof( Store );
		} );

		it( 'should create an instance for the given arguments', function() {
			expect( ld ).to.have.length( 5 );
			expect( ld.store ).to.equal( store );
		} );

		it( 'should return an item on the given index', function() {
			expect( ld.get( 3 ) ).to.equal( 'd' );
			expect( ld.get( 999 ) ).to.be.undefined();
		} );

		it( 'should return all items', function() {
			expect( ld.get() ).to.deep.equal( data );
		} );

		it( 'should clone an instance', function() {
			var ld2 = ld.clone();

			expect( ld2 ).to.be.instanceof( LinearData );
			expect( ld2.get() ).to.deep.equal( ld.get() );
			expect( ld2.store ).to.equal( ld.store );
		} );

		it( 'should clone a slice of an instance', function() {
			var ld2 = ld.cloneSlice( 2, 5 );

			expect( ld2 ).to.be.instanceof( LinearData );
			expect( ld2.get() ).to.deep.equal( ld.get().slice( 2, 5 ) );
			expect( ld2.store ).to.equal( ld.store );
		} );

		it( 'should concatenate data', function() {
			ld.concat( data2 );

			expect( ld ).to.have.length( 8 );
			expect( ld.get() ).to.deep.equal( [ 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h' ] );
		} );

		it( 'should push an item', function() {
			ld.push( 'z' );
			expect( ld ).to.have.length( 6 );
			expect( ld.get( ld.length - 1 ) ).to.equal( 'z' );
		} );

		it( 'should set an item', function() {
			expect( ld.get( 3 ) ).to.equal( 'd' );
			ld.set( 3, 'z' );
			expect( ld.get( 3 ) ).to.equal( 'z' );
		} );

		it( 'should slice', function() {
			var result = ld.slice( 2, 5 );

			expect( result ).to.deep.equal( [ 'c', 'd', 'e' ] );
		} );

		it( 'should slice and return a new instance', function() {
			ld = new LinearData( data3 );

			var result = ld.sliceInstance( 1, 3 );

			expect( result ).to.be.instanceof( LinearData );
			expect( result.get( 0 ) ).to.equal( data3[ 1 ] );
			expect( result.get( 1 ) ).to.equal( data3[ 2 ] );
		} );

		it( 'should splice', function() {
			var result = ld.splice( 2, 2, 'z' );

			expect( result ).to.deep.equal( [ 'c', 'd' ] );
			expect( ld.get() ).to.deep.equal( [ 'a', 'b', 'z', 'e' ] );
		} );

		it( 'should splice with new items given as an array, not subsequent arguments', function() {
			var result = ld.spliceArray( 2, 2, [ 'y', 'z' ] );

			expect( result ).to.deep.equal( [ 'c', 'd' ] );
			expect( ld.get() ).to.deep.equal( [ 'a', 'b', 'y', 'z', 'e' ] );
		} );
	} );

} );