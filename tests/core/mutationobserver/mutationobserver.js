bender.require( [
	'mutationobserver'
], function(
	MutationObserver
) {
	'use strict';

	var t1 = document.getElementById( 't1' );

	describe( 'MutationObserver', function() {
		var mo;

		beforeEach( function() {
			mo = new MutationObserver( t1 );
			mo.enable();
		} );

		afterEach( function() {
			mo.disable();
		} );

		it( 'should expose emitter API', function() {
			expect( mo.on ).to.be.a( 'function' );
			expect( mo.once ).to.be.a( 'function' );
			expect( mo.off ).to.be.a( 'function' );
		} );

		it( 'should use a default config', function() {
			expect( mo.config ).to.deep.equal( MutationObserver.defaultConfig );
		} );

		it( 'should trigger "mutation:content" event on a character data change', function( done ) {
			mo.on( 'mutation:content', function( mutations ) {
				expect( mutations ).to.have.length.above( 0 );
				done();
			} );

			t1.firstChild.firstChild.data += 'x';
		} );

		it( 'should trigger "mutation:childlist" event on a target childlist change', function( done ) {
			mo.on( 'mutation:childlist', function( mutations ) {
				expect( mutations ).to.have.length.above( 0 );
				done();
			} );

			t1.firstChild.appendChild( document.createElement( 'span' ) );
		} );

		it( 'should trigger "mutation" event on any kind of mutation', function( done ) {
			var callCount = 0;

			mo.on( 'mutation', function() {
				callCount++;

				if ( callCount === 2 ) {
					done();
				}
			} );

			t1.firstChild.appendChild( document.createElement( 'span' ) );

			// trigger the second mutation in the next tick
			setTimeout( function() {
				t1.firstChild.firstChild.data += 'x';
			}, 0 );
		} );

		it( 'should allow to use a custom configuration', function( done ) {
			var config = {
				childList: true
			};

			mo = new MutationObserver( t1, config );

			mo.on( 'mutation:content', function() {
				throw new Error( 'shouldn\'t trigger "mutation:content"' );
			} );

			mo.on( 'mutation:childlist', function() {
				done();
			} );

			mo.enable();

			t1.firstChild.firstChild.data += 'x';

			setTimeout( function() {
				t1.appendChild( document.createElement( 'span' ) );
			}, 0 );
		} );

		it( 'should manually disable the observer', function( done ) {
			mo.on( 'mutation', function() {
				throw new Error( 'shouldn\'t trigger mutation events when disabled' );
			} );

			mo.disable();

			t1.firstChild.firstChild.data += 'x';

			setTimeout( done, 0 );
		} );
	} );
} );