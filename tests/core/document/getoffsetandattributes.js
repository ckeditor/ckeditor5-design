bender.require( [
	'document',
	'tools/element',
	'tools/utils'
], function(
	Document,
	Element,
	utils
) {
	'use strict';

	describe( 'getOffsetAndAttributes', function() {
		function makeDocument( id ) {
			return new Document( new Element( document.getElementById( id ) ) );
		}

		it( 'should throw "Invalid offset" error', function() {
			var doc = makeDocument( 't1' );
			// references to DOM elements
			var p = doc.root.children[ 0 ].view.getElement();
			var t = p.firstChild;

			expect( doc.getOffsetAndAttributes.bind( doc, p, -1 ) ).to.throw( Error, 'Invalid offset.' );
			expect( doc.getOffsetAndAttributes.bind( doc, p, 2 ) ).to.throw( Error, 'Invalid offset.' );
			expect( doc.getOffsetAndAttributes.bind( doc, t, -1 ) ).to.throw( Error, 'Invalid offset.' );
			expect( doc.getOffsetAndAttributes.bind( doc, t, 4 ) ).to.throw( Error, 'Invalid offset.' );
		} );

		it( 'should throw an error when trying to get offset of an element outside of the document\'s root', function() {
			var doc = makeDocument( 't1' );
			// references to DOM elements
			var p = document.getElementById( 't1' ).firstChild;

			expect( doc.getOffsetAndAttributes.bind( doc, p, 0 ) ).to.throw(
				Error,
				'Element doesn\'t have a parent with a view attached to it.'
			);
		} );

		describe( 't1', function() {
			var doc = makeDocument( 't1' );
			// references to DOM elements
			var p = doc.root.children[ 0 ].view.getElement();
			var t = p.firstChild;

			var testCases = [
				[ '<p>^"foo"</p>', p, 0, 2 ],
				[ '<p>"^foo"</p>', t, 0, 2 ],
				[ '<p>"f^oo"</p>', t, 1, 3 ],
				[ '<p>"fo^o"</p>', t, 2, 4 ],
				[ '<p>"foo^"</p>', t, 3, 5 ],
				[ '<p>"foo"^</p>', p, 1, 5 ]
			];

			testCases.forEach( function( tc ) {
				it( 'should return a valid offset for ' + tc[ 0 ], function() {
					expect( doc.getOffsetAndAttributes( tc[ 1 ], tc[ 2 ] ) ).to.deep.equal( {
						attributes: [],
						offset: tc[ 3 ]
					} );
				} );
			} );
		} );

		describe( 't2', function() {
			var doc = makeDocument( 't2' );
			// references to DOM elements
			var p = doc.root.children[ 0 ].view.getElement();
			var u = p.firstChild;
			var b = u.firstChild;
			var i = b.lastChild;
			var t = i.firstChild;

			var testCases = [
				[ '<p>^<u><b><i>"foo"</i></b></u></p>', p, 0, 2 ],
				[ '<p><u>^<b><i>"foo"</i></b></u></p>', u, 0, 2, [ 0 ] ],
				[ '<p><u><b>^<i>"foo"</i></b></u></p>', b, 0, 2, [ 0, 1 ] ],
				[ '<p><u><b><i>^"foo"</i></b></u></p>', i, 0, 2, [ 0, 1, 2 ] ],
				[ '<p><u><b><i>"^foo"</i></b></u></p>', t, 0, 2, [ 0, 1, 2 ] ],
				[ '<p><u><b><i>"f^oo"</i></b></u></p>', t, 1, 3, [ 0, 1, 2 ] ],
				[ '<p><u><b><i>"fo^o"</i></b></u></p>', t, 2, 4, [ 0, 1, 2 ] ],
				[ '<p><u><b><i>"foo^"</i></b></u></p>', t, 3, 5, [ 0, 1, 2 ] ],
				[ '<p><u><b><i>"foo"^</i></b></u></p>', i, 1, 5, [ 0, 1, 2 ] ],
				[ '<p><u><b><i>"foo"</i>^</b></u></p>', b, 1, 5, [ 0, 1 ] ],
				[ '<p><u><b><i>"foo"</i></b>^</u></p>', u, 1, 5, [ 0 ] ],
				[ '<p><u><b><i>"foo"</i></b></u>^</p>', p, 1, 5 ]
			];

			testCases.forEach( function( tc ) {
				it( 'should return a valid offset and attributes for ' + tc[ 0 ], function() {
					expect( doc.getOffsetAndAttributes( tc[ 1 ], tc[ 2 ] ) ).to.deep.equal( {
						attributes: tc[ 4 ] || [],
						offset: tc[ 3 ]
					} );
				} );
			} );
		} );

		describe( 't3', function() {
			var doc = makeDocument( 't3' );
			// references to DOM elements
			var p = doc.root.children[ 0 ].view.getElement();
			var b1 = p.firstChild;
			var i1 = b1.firstChild;
			var i2 = p.lastChild;
			var b2 = i2.firstChild;
			var t1 = i1.firstChild;
			var t2 = b2.firstChild;

			var testCases = [
				[ '<p>^<b><i>"foo"</i></b><i><b>"bar"</b></i></p>', p, 0, 2 ],
				[ '<p><b>^<i>"foo"</i></b><i><b>"bar"</b></i></p>', b1, 0, 2, [ 0 ] ],
				[ '<p><b><i>^"foo"</i></b><i><b>"bar"</b></i></p>', i1, 0, 2, [ 0, 1 ] ],
				[ '<p><b><i>"^foo"</i></b><i><b>"bar"</b></i></p>', t1, 0, 2, [ 0, 1 ] ],
				[ '<p><b><i>"f^oo"</i></b><i><b>"bar"</b></i></p>', t1, 1, 3, [ 0, 1 ] ],
				[ '<p><b><i>"fo^o"</i></b><i><b>"bar"</b></i></p>', t1, 2, 4, [ 0, 1 ] ],
				[ '<p><b><i>"foo^"</i></b><i><b>"bar"</b></i></p>', t1, 3, 5, [ 0, 1 ] ],
				[ '<p><b><i>"foo"^</i></b><i><b>"bar"</b></i></p>', i1, 1, 5, [ 0, 1 ] ],
				[ '<p><b><i>"foo"</i>^</b><i><b>"bar"</b></i></p>', b1, 1, 5, [ 0 ] ],
				[ '<p><b><i>"foo"</i></b>^<i><b>"bar"</b></i></p>', p, 1, 5 ],
				[ '<p><b><i>"foo"</i></b><i>^<b>"bar"</b></i></p>', i2, 0, 5, [ 1 ] ],
				[ '<p><b><i>"foo"</i></b><i><b>^"bar"</b></i></p>', b2, 0, 5, [ 1, 0 ] ],
				[ '<p><b><i>"foo"</i></b><i><b>"^bar"</b></i></p>', t2, 0, 5, [ 1, 0 ] ],
				[ '<p><b><i>"foo"</i></b><i><b>"b^ar"</b></i></p>', t2, 1, 6, [ 1, 0 ] ],
				[ '<p><b><i>"foo"</i></b><i><b>"ba^r"</b></i></p>', t2, 2, 7, [ 1, 0 ] ],
				[ '<p><b><i>"foo"</i></b><i><b>"bar^"</b></i></p>', t2, 3, 8, [ 1, 0 ] ],
				[ '<p><b><i>"foo"</i></b><i><b>"bar"^</b></i></p>', b2, 1, 8, [ 1, 0 ] ],
				[ '<p><b><i>"foo"</i></b><i><b>"bar"</b>^</i></p>', i2, 1, 8, [ 1 ] ],
				[ '<p><b><i>"foo"</i></b><i><b>"bar"</b></i>^</p>', p, 2, 8 ]
			];

			testCases.forEach( function( tc ) {
				it( 'should return a valid offset and attributes for ' + tc[ 0 ], function() {
					expect( doc.getOffsetAndAttributes( tc[ 1 ], tc[ 2 ] ) ).to.deep.equal( {
						attributes: tc[ 4 ] || [],
						offset: tc[ 3 ]
					} );
				} );
			} );
		} );

		describe( 't4', function() {
			var doc = makeDocument( 't4' );
			// references to DOM elements
			var p = doc.root.children[ 0 ].view.getElement();
			var b = p.firstChild;
			var t1 = b.firstChild;
			var br = doc.root.children[ 0 ].children[ 1 ].view.getElement();
			var i = p.lastChild;
			var t2 = i.firstChild;

			var testCases = [
				[ '<p>^<b>"foo"</b><br><i>"bar"</i></p>', p, 0, 2 ],
				[ '<p><b>^"foo"</b><br><i>"bar"</i></p>', b, 0, 2, [ 0 ] ],
				[ '<p><b>"^foo"</b><br><i>"bar"</i></p>', t1, 0, 2, [ 0 ] ],
				[ '<p><b>"f^oo"</b><br><i>"bar"</i></p>', t1, 1, 3, [ 0 ] ],
				[ '<p><b>"fo^o"</b><br><i>"bar"</i></p>', t1, 2, 4, [ 0 ] ],
				[ '<p><b>"foo^"</b><br><i>"bar"</i></p>', t1, 3, 5, [ 0 ] ],
				[ '<p><b>"foo"^</b><br><i>"bar"</i></p>', b, 1, 5, [ 0 ] ],
				[ '<p><b>"foo"</b>^<br><i>"bar"</i></p>', p, 1, 5 ],
				[ '<p><b>"foo"</b><br>^<i>"bar"</i></p>', p, 2, 7 ],
				[ '<p><b>"foo"</b><br><i>^"bar"</i></p>', i, 0, 7, [ 1 ] ],
				[ '<p><b>"foo"</b><br><i>"^bar"</i></p>', t2, 0, 7, [ 1 ] ],
				[ '<p><b>"foo"</b><br><i>"b^ar"</i></p>', t2, 1, 8, [ 1 ] ],
				[ '<p><b>"foo"</b><br><i>"ba^r"</i></p>', t2, 2, 9, [ 1 ] ],
				[ '<p><b>"foo"</b><br><i>"bar^"</i></p>', t2, 3, 10, [ 1 ] ],
				[ '<p><b>"foo"</b><br><i>"bar"^</i></p>', i, 1, 10, [ 1 ] ],
				[ '<p><b>"foo"</b><br><i>"bar"</i>^</p>', p, 3, 10 ]
			];

			testCases.forEach( function( tc ) {
				it( 'should return a valid offset and attributes for ' + tc[ 0 ], function() {
					expect( doc.getOffsetAndAttributes( tc[ 1 ], tc[ 2 ] ) ).to.deep.equal( {
						attributes: tc[ 4 ] || [],
						offset: tc[ 3 ]
					} );
				} );
			} );
		} );

		it( 'should return a valid offset using preceding element\'s view - <p><b>foo</b><br>^</p>', function() {
			var doc = makeDocument( 't5' );
			// references to DOM elements
			var p = doc.root.children[ 0 ].view.getElement();

			expect( doc.getOffsetAndAttributes( p, 2 ) ).to.deep.equal( {
				attributes: [],
				offset: 7
			} );
		} );

		it( 'should return valid offsets for block elements <p><img /></p>', function() {
			var doc = makeDocument( 't6' );
			// references to DOM elements
			var root = doc.root.view.getElement();
			var p = doc.root.children[ 0 ].view.getElement();

			var testCases = [
				// <p>^<img></p>
				[ p, 0, 2 ],
				// <p><img>^</p>
				[ p, 1, 4 ]
			];

			testCases.forEach( function( tc ) {
				expect( doc.getOffsetAndAttributes( tc[ 0 ], tc[ 1 ] ) ).to.deep.equal( {
					attributes: tc[ 3 ] || [],
					offset: tc[ 2 ]
				} );
			} );
		} );

		describe( 't7', function() {
			var doc = makeDocument( 't7' );
			// references to DOM elements
			var p = doc.root.children[ 0 ].view.getElement();
			var b = p.firstChild;
			var i1 = b.firstChild;
			var t1 = i1.firstChild;
			var u = b.lastChild;
			var i2 = u.firstChild;
			var t2 = i2.firstChild;

			var testCases = [
				[ '<p>^<b><i>ab</i><u><i>cd</i></u></b></p>', p, 0, 2 ],
				[ '<p><b>^<i>ab</i><u><i>cd</i></u></b></p>', b, 0, 2, [ 0 ] ],
				[ '<p><b><i>^ab</i><u><i>cd</i></u></b></p>', t1, 0, 2, [ 0, 1 ] ],
				[ '<p><b><i>a^b</i><u><i>cd</i></u></b></p>', t1, 1, 3, [ 0, 1 ] ],
				[ '<p><b><i>ab^</i><u><i>cd</i></u></b></p>', t1, 2, 4, [ 0, 1 ] ],
				[ '<p><b><i>ab</i>^<u><i>cd</i></u></b></p>', b, 1, 4, [ 0 ] ],
				[ '<p><b><i>ab</i><u>^<i>cd</i></u></b></p>', u, 0, 4, [ 0, 2 ] ],
				[ '<p><b><i>ab</i><u><i>^cd</i></u></b></p>', t2, 0, 4, [ 0, 2, 1 ] ],
				[ '<p><b><i>ab</i><u><i>c^d</i></u></b></p>', t2, 1, 5, [ 0, 2, 1 ] ],
				[ '<p><b><i>ab</i><u><i>cd^</i></u></b></p>', t2, 2, 6, [ 0, 2, 1 ] ],
				[ '<p><b><i>ab</i><u><i>cd</i>^</u></b></p>', u, 1, 6, [ 0, 2 ] ],
				[ '<p><b><i>ab</i><u><i>cd</i></u>^</b></p>', b, 2, 6, [ 0 ] ],
				[ '<p><b><i>ab</i><u><i>cd</i></u></b>^</p>', p, 1, 6 ]
			];

			testCases.forEach( function( tc ) {
				it( 'should return a valid offset and attributes for ' + tc[ 0 ], function() {
					expect( doc.getOffsetAndAttributes( tc[ 1 ], tc[ 2 ] ) ).to.deep.equal( {
						attributes: tc[ 4 ] || [],
						offset: tc[ 3 ]
					} );
				} );
			} );
		} );

		it( 'should return valid offsets and attributes for injected elements 1', function() {
			var doc = makeDocument( 't1' );

			var root = doc.root.view.getElement();

			var p = document.createElement( 'p' );

			p.dataset.affected = true;

			var b = document.createElement( 'b' );

			b.textContent = 'bar';

			p.appendChild( b );

			root.appendChild( p );

			var testCases = [
				// <p data-affected=true><b>^"bar"</b></p>
				[ b, 0, 7, [ 0 ] ],
				// <p data-affected=true><b>"bar"^</b></p>
				[ b, 1, 10, [ 0 ] ]
			];

			testCases.forEach( function( tc ) {
				expect( doc.getOffsetAndAttributes( tc[ 0 ], tc[ 1 ] ) ).to.deep.equal( {
					attributes: tc[ 3 ] || [],
					offset: tc[ 2 ]
				} );
			} );
		} );

		it( 'should return valid offsets and attributes for injected elements 2', function() {
			var doc = makeDocument( 't1' );

			var root = doc.root.view.getElement();

			var p = document.createElement( 'p' );

			var br = document.createElement( 'br' );
			br.dataset.affected = true;
			p.appendChild( br );

			var i = document.createElement( 'i' );
			i.textContent = 'bar';
			p.appendChild( i );

			var br2 = document.createElement( 'br' );
			br2.dataset.affected = true;
			p.appendChild( br2 );

			var b = document.createElement( 'b' );
			b.textContent = 'baz';
			p.appendChild( b );

			p.dataset.affected = true;
			root.appendChild( p );

			var testCases = [
				// <p data-affected=true><br data-affected=true><i>^"bar"</i><br data-affected=true><b>"baz"</b></p>
				[ i, 0, 9, [ 0 ] ],
				// <p data-affected=true><br data-affected=true><i>"bar"^</i><br data-affected=true><b>"baz"</b></p>
				[ i, 1, 12, [ 0 ] ],
				// <p data-affected=true><br data-affected=true><i>"bar"</i><br data-affected=true><b>^"baz"</b></p>
				[ b, 0, 14, [ 1 ] ],
				// <p data-affected=true><br data-affected=true><i>"bar"</i><br data-affected=true><b>"baz"^</b></p>
				[ b, 1, 17, [ 1 ] ]
			];

			testCases.forEach( function( tc ) {
				expect( doc.getOffsetAndAttributes( tc[ 0 ], tc[ 1 ] ) ).to.deep.equal( {
					attributes: tc[ 3 ] || [],
					offset: tc[ 2 ]
				} );
			} );
		} );
	} );
} );