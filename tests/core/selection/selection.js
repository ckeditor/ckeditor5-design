bender.require( [
	'document',
	'range',
	'selection',
	'tools/element',
	'tools/utils'
], function(
	Document,
	Range,
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

	describe( 'getSelectedNode', function() {
		it( 'should return null if there\'s no selection', function() {
			var selection = new Selection( doc, document );

			selection.clear();

			var result = selection.getSelectedNode();

			expect( result ).to.be.null();
		} );

		it( 'should return the selected node', function() {
			var selection = new Selection( doc, document );

			var range = document.createRange();
			range.selectNode( doc.root.view.getElement().firstChild );
			selection.selectRange( range );

			var result = selection.getSelectedNode();

			expect( result ).to.equal( doc.root.children[ 0 ] );
		} );
	} );

	describe( 'getSelectedData', function() {
		it( 'should return empty array if there\'s no selection', function() {
			var selection = new Selection( doc, document );
			var result = selection.getSelectedData();

			expect( result ).to.be.an( 'array' ).to.have.length( 0 );
		} );

		it( 'should return the selected data', function() {
			var selection = new Selection( doc, document );

			var range = document.createRange();
			range.selectNode( doc.root.view.getElement().firstChild );
			selection.selectRange( range );

			var result = selection.getSelectedData();

			expect( result ).to.have.length( 1 );
			expect( result[ 0 ] ).to.deep.equal( doc.data.slice( 1, 5 ) );
		} );
	} );

	describe( 'getSelectedData', function() {
		it( 'should return empty array if there\'s no selection', function() {
			var selection = new Selection( doc, document );
			var result = selection.getSelectedData();

			expect( result ).to.be.an( 'array' ).to.have.length( 0 );
		} );

		it( 'should return the selected data', function() {
			var selection = new Selection( doc, document );

			var range = document.createRange();
			range.selectNode( doc.root.view.getElement().firstChild );
			selection.selectRange( range );

			var result = selection.getSelectedData();

			expect( result ).to.have.length( 1 );
			expect( result[ 0 ] ).to.deep.equal( doc.data.slice( 1, 5 ) );
		} );
	} );

	describe( 'selectDataRange', function() {
		it( 'should select a data range', function() {
			var selection = new Selection( doc, document );

			selection.clear();

			expect( selection.nativeSelection.rangeCount ).to.equal( 0 );

			var range = Range.createFromOffsets( 2, 4 );

			selection.selectDataRange( range );

			expect( selection.currentSelection.ranges ).to.have.length( 1 );
			expect( selection.currentSelection.ranges[ 0 ] ).to.deep.equal( range );

			range = selection.nativeSelection.getRangeAt( 0 );

			var txt = doc.root.view.getElement().firstChild.firstChild;

			expect( range.startContainer ).to.equal( range.endContainer ).to.equal( txt );
			expect( range.startOffset ).to.equal( 0 );
			expect( range.endOffset ).to.equal( 2 );
		} );
	} );

	describe( 'selectElement', function() {
		it( 'should select an element', function() {
			var selection = new Selection( doc, document );

			var txt = doc.root.view.getElement().firstChild.firstChild;

			selection.clear();
			selection.selectElement( txt );

			expect( selection.currentSelection.ranges ).to.have.length( 1 );

			var range = selection.currentSelection.ranges[ 0 ];

			expect( range.start.offset ).to.equal( 2 );
			expect( range.start.attributes ).to.have.length( 0 );
			expect( range.end.offset ).to.equal( 4 );
			expect( range.end.attributes ).to.have.length( 0 );

			range = selection.nativeSelection.getRangeAt( 0 );

			expect( range.startContainer ).to.equal( range.endContainer ).to.equal( txt.parentNode );
			expect( range.startOffset ).to.equal( 0 );
			expect( range.endOffset ).to.equal( 1 );
		} );
	} );

	describe( 'selectNode', function() {
		it( 'should select a node', function() {
			var selection = new Selection( doc, document );

			selection.clear();
			selection.selectNode( doc.root.children[ 0 ].children[ 0 ] );

			expect( selection.currentSelection.ranges ).to.have.length( 1 );

			var range = selection.currentSelection.ranges[ 0 ];

			expect( range.start.offset ).to.equal( 2 );
			expect( range.start.attributes ).to.have.length( 0 );
			expect( range.end.offset ).to.equal( 4 );
			expect( range.end.attributes ).to.have.length( 0 );

			range = selection.nativeSelection.getRangeAt( 0 );

			var txt = doc.root.view.getElement().firstChild.firstChild;

			expect( range.startContainer ).to.equal( range.endContainer ).to.equal( txt );
			expect( range.startOffset ).to.equal( 0 );
			expect( range.endOffset ).to.equal( 2 );
		} );
	} );

	describe( 'update', function() {
		it( 'should update the selection', function() {
			var selection = new Selection( doc, document );

			selection.nativeSelection.removeAllRanges();

			expect( selection.currentSelection ).to.be.null();
			expect( selection.previousSelection ).to.be.null();

			var range = document.createRange();

			range.selectNode( doc.root.view.getElement().firstChild.firstChild );
			selection.nativeSelection.addRange( range );
			selection.update();

			expect( selection.currentSelection.ranges ).to.have.length( 1 );
			expect( selection.previousSelection ).to.be.null();

			range = selection.currentSelection.ranges[ 0 ];

			expect( range.start.offset ).to.equal( 2 );
			expect( range.end.offset ).to.equal( 4 );
		} );

		it( 'should trigger "selection:change" event', function( done ) {
			var selection = new Selection( doc, document );

			selection.on( 'selection:change', function( current, previous ) {
				expect( current.ranges ).to.have.length( 1 );

				var range = current.ranges[ 0 ];

				expect( range.start.offset ).to.equal( 2 );
				expect( range.end.offset ).to.equal( 4 );
				expect( previous ).to.be.null();

				done();
			} );

			var range = document.createRange();

			range.selectNode( doc.root.view.getElement().firstChild.firstChild );
			selection.nativeSelection.removeAllRanges();
			selection.nativeSelection.addRange( range );
			selection.update();
		} );

		it( 'shouldn\'t trigger "selection:change" if the selection hasn\'t changed', function() {
			var selection = new Selection( doc, document );
			var range = document.createRange();

			range.selectNode( doc.root.view.getElement().firstChild.firstChild );
			selection.nativeSelection.removeAllRanges();
			selection.nativeSelection.addRange( range );
			selection.update();

			selection.on( 'selection:change', function() {
				throw new Error( '"selection:change" event shouldn\'t be triggered' );
			} );

			selection.update();
		} );
	} );
} );