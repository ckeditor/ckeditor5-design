bender.require( [
	'document',
	'selection',
	'tools/element',
	'tools/utils'
], function(
	Document,
	Selection,
	Element,
	utils
) {
	'use strict';

	var docEl = document.getElementById( 'selection' ),
		$docEl = new Element( docEl ),
		tmpEl = document.getElementById( 'tmp' );

	var doc;

	beforeEach( function() {
		doc = new Document( $docEl );
		doc.root.view.appendTo( tmpEl );
		tmpEl.focus();
	} );

	afterEach( function() {
		tmpEl.innerHTML = '';
	} );

	describe( 'constructor', function() {
		it( 'should initialize empty', function() {
			var selection = new Selection( {}, document );

			expect( selection.currentSelection ).to.be.null();
			expect( selection.previousSelection ).to.be.null();
			expect( selection.nativeSelection ).to.equal( document.getSelection() );
		} );
	} );

	describe( 'buildFromNativeSelection', function() {
		it( 'should build an empty selection', function() {
			var selection = new Selection( doc, document );

			var nativeSelection = document.getSelection();

			nativeSelection.removeAllRanges();

			var sel = selection.buildFromNativeSelection( nativeSelection );

			expect( sel.ranges ).to.have.length( 0 );
			expect( sel.type ).to.equal( Selection.EMPTY );
		} );

		it( 'should build a carret selection', function() {
			var selection = new Selection( doc, document );
			var rootEl = doc.root.view.getElement();
			var nativeSelection = document.getSelection();

			nativeSelection.removeAllRanges();

			var range = document.createRange();

			range.setStart( rootEl.firstChild.firstChild, 0 );
			nativeSelection.addRange( range );

			var sel = selection.buildFromNativeSelection( nativeSelection );

			expect( sel.ranges ).to.have.length( 1 );
			expect( sel.type ).to.equal( Selection.CARRET );

			range = sel.ranges[ 0 ];

			expect( range.start.offset ).to.equal( 2 );
			expect( range.start.attributes ).to.have.length( 0 );
			expect( range.start ).to.deep.equal( range.end );
		} );

		it( 'should build a range selection', function() {
			var selection = new Selection( doc, document );
			var rootEl = doc.root.view.getElement();
			var nativeSelection = document.getSelection();

			nativeSelection.removeAllRanges();

			var range = document.createRange();

			range.setStart( rootEl.firstChild.firstChild, 0 );
			range.setEnd( rootEl.firstChild.firstChild, rootEl.firstChild.firstChild.data.length );
			nativeSelection.addRange( range );

			var sel = selection.buildFromNativeSelection( nativeSelection );

			expect( sel.ranges ).to.have.length( 1 );
			expect( sel.type ).to.equal( Selection.RANGE );

			range = sel.ranges[ 0 ];

			expect( range.start.offset ).to.equal( 2 );
			expect( range.start.attributes ).to.have.length( 0 );
			expect( range.end.offset ).to.equal( 4 );
			expect( range.end.attributes ).to.have.length( 0 );
		} );

		var agent = navigator.userAgent.toLowerCase();

		var isGecko = navigator.product == 'Gecko' &&
			agent.indexOf( 'trident/' ) === -1 &&
			agent.indexOf( ' applewebkit/' ) === -1;

		// run in FF only
		window[ isGecko ? 'it' : 'xit' ]( 'should build a multirange selection', function() {
			var selection = new Selection( doc, document );
			var rootEl = doc.root.view.getElement();

			selection.nativeSelection.removeAllRanges();

			// create first range
			var range = document.createRange();

			range.setStart( rootEl.firstChild.firstChild, 0 );
			range.setEnd( rootEl.firstChild.firstChild, rootEl.firstChild.firstChild.data.length );
			selection.nativeSelection.addRange( range );

			// create second range
			range = document.createRange();

			range.setStart( rootEl.lastChild.firstChild, 0 );
			range.setEnd( rootEl.lastChild.firstChild, rootEl.lastChild.firstChild.data.length );
			selection.nativeSelection.addRange( range );

			var sel = selection.buildFromNativeSelection( selection.nativeSelection );

			expect( sel.ranges ).to.have.length( 2 );
			expect( sel.type ).to.equal( Selection.MULTIRANGE );

			range = sel.ranges[ 0 ];

			expect( range.start.offset ).to.equal( 2 );
			expect( range.start.attributes ).to.have.length( 0 );
			expect( range.end.offset ).to.equal( 4 );
			expect( range.end.attributes ).to.have.length( 0 );

			range = sel.ranges[ 1 ];

			expect( range.start.offset ).to.equal( 22 );
			expect( range.start.attributes ).to.have.length( 0 );
			expect( range.end.offset ).to.equal( 24 );
			expect( range.end.attributes ).to.have.length( 0 );
		} );
	} );

	describe( 'clear', function() {
		it( 'should clear the selection', function() {
			var selection = new Selection( doc, document );
			var range = document.createRange();

			range.selectNode( doc.root.view.getElement().firstChild );

			selection.selectRange( range );

			expect( selection.nativeSelection.rangeCount ).to.equal( 1 );

			var current = selection.currentSelection;
			expect( current.ranges ).to.have.length( 1 );
			expect( current.type ).to.equal( Selection.RANGE );

			selection.clear();

			expect( selection.nativeSelection.rangeCount ).to.equal( 0 );
			expect( selection.currentSelection.ranges ).to.have.length( 0 );
			expect( selection.currentSelection.type ).to.equal( Selection.EMPTY );
			expect( selection.previousSelection ).to.equal( current );
		} );
	} );
} );