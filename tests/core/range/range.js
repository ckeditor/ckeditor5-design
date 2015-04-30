bender.require( [
	'document',
	'position',
	'range',
	'tools/element'
], function(
	Document,
	Position,
	Range,
	Element
) {
	'use strict';

	var p1 = new Position( 0, [ 0, 1 ] );
	var p2 = new Position( 15, [ 2 ] );
	var p3 = new Position( 5 );

	describe( 'Range', function() {
		it( 'should create a range', function() {
			var r = new Range( p1, p2 );

			expect( r.start ).to.equal( p1 );
			expect( r.end ).to.equal( p2 );
		} );

		it( 'should create a collapsed range', function() {
			var r = new Range( p1 );

			expect( r.start ).to.equal( p1 );
			expect( r.end ).to.deep.equal( p1 );
			expect( r.collapsed ).to.be.true();
		} );

		it( 'should create a range from two offsets', function() {
			var r = Range.createFromOffsets( 5, 15 );

			expect( r.start.offset ).to.equal( 5 );
			expect( r.end.offset ).to.equal( 15 );

			expect( r.start.attributes ).to.have.length( 0 );
			expect( r.end.attributes ).to.have.length( 0 );
		} );

		it( 'should create a range from a native range', function() {
			var t1 = new Element( '#t1' );
			var doc = new Document( t1 );

			document.body.appendChild( doc.root.view.getElement() );

			var range = document.createRange();

			range.selectNode( doc.root.children[ 0 ].view.getElement() );

			var r = Range.createFromNativeRange( range, doc );

			expect( r.start.offset ).to.equal( 1 );
			expect( r.start.attributes ).to.have.length( 0 );
			expect( r.end.offset ).to.equal( 30 );
			expect( r.end.attributes ).to.have.length( 0 );
		} );

		it( 'should create a range from a native, collapsed range', function() {
			var t1 = new Element( '#t1' );
			var doc = new Document( t1 );

			document.body.appendChild( doc.root.view.getElement() );

			var range = document.createRange();

			range.selectNode( doc.root.children[ 0 ].view.getElement() );
			range.collapse();

			var r = Range.createFromNativeRange( range, doc );

			expect( r.start.offset ).to.equal( 30 );
			expect( r.start.attributes ).to.have.length( 0 );
			expect( r.start.equals( r.end ) ).to.be.true();
		} );

		it( 'should check if two ranges are equal', function() {
			var r = new Range( p1, p2 );
			var r2 = new Range( p1, p2 );
			var r3 = new Range( p3 );

			expect( r.equals( r2 ) ).to.be.true();
			expect( r.equals( r3 ) ).to.be.false();
		} );

		it( 'should translate a range by the given offset', function() {
			var r = new Range( p1, p2 );

			r.translate( 5 );

			expect( r.start.offset ).to.equal( 5 );
			expect( r.end.offset ).to.equal( 20 );
		} );
	} );
} );