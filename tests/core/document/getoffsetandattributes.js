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
		it( 'should throw "Invalid offset" error', function() {
			var element = document.getElementById( 't1' );
			var doc = new Document( new Element( element ) );
			var p = doc.root.children[ 0 ].view.getElement();
			var t = p.firstChild;

			expect( doc.getOffsetAndAttributes.bind( doc, p, -1 ) ).to.throw( Error, 'Invalid offset.' );
			expect( doc.getOffsetAndAttributes.bind( doc, p, 2 ) ).to.throw( Error, 'Invalid offset.' );
			expect( doc.getOffsetAndAttributes.bind( doc, t, -1 ) ).to.throw( Error, 'Invalid offset.' );
			expect( doc.getOffsetAndAttributes.bind( doc, t, 4 ) ).to.throw( Error, 'Invalid offset.' );
		} );

		it( 'should return a valid offset t/1 - <p>foo</p>', function() {
			var element = document.getElementById( 't1' );
			var doc = new Document( new Element( element ) );
			var p = doc.root.children[ 0 ].view.getElement();
			var t = p.firstChild;

			var testCases = [
				// <p>^"foo"</p>
				[ p, 0, 2 ],
				// <p>"^foo"</p>
				[ t, 0, 2 ],
				// <p>"f^oo"</p>
				[ t, 1, 3 ],
				// <p>"fo^o"</p>
				[ t, 2, 4 ],
				// <p>"foo^"</p>
				[ t, 3, 5 ],
				// <p>"foo"^</p>
				[ p, 1, 5 ]
			];

			testCases.forEach( function( tc ) {
				expect( doc.getOffsetAndAttributes( tc[ 0 ], tc[ 1 ] ) ).to.deep.equal( {
					attributes: [],
					offset: tc[ 2 ]
				} );
			} );
		} );

		it( 'should return valid offsets and attributes t/2 - <p><u><b><i>foo</i></b></u></p>', function() {
			var element = document.getElementById( 't2' );

			var doc = new Document( new Element( element ) );

			var p = doc.root.children[ 0 ].view.getElement();
			var u = p.firstChild;
			var b = u.firstChild;
			var i = b.lastChild;
			var t = i.firstChild;

			var testCases = [
				// <p>^<u><b><i>"foo"</i></b></u></p>
				[ p, 0, 2 ],
				// <p><u>^<b><i>"foo"</i></b></u></p>
				[ u, 0, 2, [ 0 ] ],
				// <p><u><b>^<i>"foo"</i></b></u></p>
				[ b, 0, 2, [ 0, 1 ] ],
				// <p><u><b><i>^"foo"</i></b></u></p>
				[ i, 0, 2, [ 0, 1, 2 ] ],
				// <p><u><b><i>"^foo"</i></b></u></p>
				[ t, 0, 2, [ 0, 1, 2 ] ],
				// <p><u><b><i>"f^oo"</i></b></u></p>
				[ t, 1, 3, [ 0, 1, 2 ] ],
				// <p><u><b><i>"fo^o"</i></b></u></p>
				[ t, 2, 4, [ 0, 1, 2 ] ],
				// <p><u><b><i>"foo^"</i></b></u></p>
				[ t, 3, 5, [ 0, 1, 2 ] ],
				// <p><u><b><i>"foo"^</i></b></u></p>
				[ i, 1, 5, [ 0, 1, 2 ] ],
				// <p><u><b><i>"foo"</i>^</b></u></p>
				[ b, 1, 5, [ 0, 1 ] ],
				// <p><u><b><i>"foo"</i></b>^</u></p>
				[ u, 1, 5, [ 0 ] ],
				// <p><u><b><i>"foo"</i></b></u>^</p>
				[ p, 1, 5 ]
			];

			testCases.forEach( function( tc ) {
				expect( doc.getOffsetAndAttributes( tc[ 0 ], tc[ 1 ] ) ).to.deep.equal( {
					attributes: tc[ 3 ] || [],
					offset: tc[ 2 ]
				} );
			} );
		} );

		it( 'should return valid offsets and attributes t/3 - <p><b><i>foo</i></b><i><b>bar</b></i></p>', function() {
			var element = document.getElementById( 't3' );

			var doc = new Document( new Element( element ) );

			var p = doc.root.children[ 0 ].view.getElement();
			var b1 = p.firstChild;
			var i1 = b1.firstChild;
			var i2 = p.lastChild;
			var b2 = i2.firstChild;
			var t1 = i1.firstChild;
			var t2 = b2.firstChild;

			var testCases = [
				// <p>^<b><i>"foo"</i></b><i><b>"bar"</b></i></p>
				[ p, 0, 2 ],
				// <p><b>^<i>"foo"</i></b><i><b>"bar"</b></i></p>
				[ b1, 0, 2, [ 0 ] ],
				// <p><b><i>^"foo"</i></b><i><b>"bar"</b></i></p>
				[ i1, 0, 2, [ 0, 1 ] ],
				// <p><b><i>"^foo"</i></b><i><b>"bar"</b></i></p>
				[ t1, 0, 2, [ 0, 1 ] ],
				// <p><b><i>"f^oo"</i></b><i><b>"bar"</b></i></p>
				[ t1, 1, 3, [ 0, 1 ] ],
				// <p><b><i>"fo^o"</i></b><i><b>"bar"</b></i></p>
				[ t1, 2, 4, [ 0, 1 ] ],
				// <p><b><i>"foo^"</i></b><i><b>"bar"</b></i></p>
				[ t1, 3, 5, [ 0, 1 ] ],
				// <p><b><i>"foo"^</i></b><i><b>"bar"</b></i></p>
				[ i1, 1, 5, [ 0, 1 ] ],
				// <p><b><i>"foo"</i>^</b><i><b>"bar"</b></i></p>
				[ b1, 1, 5, [ 0 ] ],
				// <p><b><i>"foo"</i></b>^<i><b>"bar"</b></i></p>
				[ p, 1, 5 ],
				// <p><b><i>"foo"</i></b><i>^<b>"bar"</b></i></p>
				[ i2, 0, 5, [ 1 ] ],
				// <p><b><i>"foo"</i></b><i><b>^"bar"</b></i></p>
				[ b2, 0, 5, [ 1, 0 ] ],
				// <p><b><i>"foo"</i></b><i><b>"^bar"</b></i></p>
				[ t2, 0, 5, [ 1, 0 ] ],
				// <p><b><i>"foo"</i></b><i><b>"b^ar"</b></i></p>
				[ t2, 1, 6, [ 1, 0 ] ],
				// <p><b><i>"foo"</i></b><i><b>"ba^r"</b></i></p>
				[ t2, 2, 7, [ 1, 0 ] ],
				// <p><b><i>"foo"</i></b><i><b>"bar^"</b></i></p>
				[ t2, 3, 8, [ 1, 0 ] ],
				// <p><b><i>"foo"</i></b><i><b>"bar"^</b></i></p>
				[ b2, 1, 8, [ 1, 0 ] ],
				// <p><b><i>"foo"</i></b><i><b>"bar"</b>^</i></p>
				[ i2, 1, 8, [ 1 ] ],
				// <p><b><i>"foo"</i></b><i><b>"bar"</b></i>^</p>
				[ p, 2, 8 ]
			];

			testCases.forEach( function( tc ) {
				expect( doc.getOffsetAndAttributes( tc[ 0 ], tc[ 1 ] ) ).to.deep.equal( {
					attributes: tc[ 3 ] || [],
					offset: tc[ 2 ]
				} );
			} );
		} );

		it( 'should return valid offsets and attributes t/4 - <p><b>foo</b><br><i>bar</i></p>', function() {
			var element = document.getElementById( 't4' );

			var doc = new Document( new Element( element ) );

			var p = doc.root.children[ 0 ].view.getElement();
			var b = p.firstChild;
			var t1 = b.firstChild;
			var br = doc.root.children[ 0 ].children[ 1 ].view.getElement();
			var i = p.lastChild;
			var t2 = i.firstChild;

			var testCases = [
				// <p>^<b>"foo"</b><br><i>"bar"</i></p>
				[ p, 0, 2 ],
				// <p><b>^"foo"</b><br><i>"bar"</i></p>
				[ b, 0, 2, [ 0 ] ],
				// <p><b>"^foo"</b><br><i>"bar"</i></p>
				[ t1, 0, 2, [ 0 ] ],
				// <p><b>"f^oo"</b><br><i>"bar"</i></p>
				[ t1, 1, 3, [ 0 ] ],
				// <p><b>"fo^o"</b><br><i>"bar"</i></p>
				[ t1, 2, 4, [ 0 ] ],
				// <p><b>"foo^"</b><br><i>"bar"</i></p>
				[ t1, 3, 5, [ 0 ] ],
				// <p><b>"foo"^</b><br><i>"bar"</i></p>
				[ b, 1, 5, [ 0 ] ],
				// <p><b>"foo"</b>^<br><i>"bar"</i></p>
				[ p, 1, 5 ],
				// <p><b>"foo"</b><br>^<i>"bar"</i></p>
				[ p, 2, 7 ],
				// <p><b>"foo"</b><br><i>^"bar"</i></p>
				[ i, 0, 7, [ 1 ] ],
				// <p><b>"foo"</b><br><i>"^bar"</i></p>
				[ t2, 0, 7, [ 1 ] ],
				// <p><b>"foo"</b><br><i>"b^ar"</i></p>
				[ t2, 1, 8, [ 1 ] ],
				// <p><b>"foo"</b><br><i>"ba^r"</i></p>
				[ t2, 2, 9, [ 1 ] ],
				// <p><b>"foo"</b><br><i>"bar^"</i></p>
				[ t2, 3, 10, [ 1 ] ],
				// <p><b>"foo"</b><br><i>"bar"^</i></p>
				[ i, 1, 10, [ 1 ] ],
				// <p><b>"foo"</b><br><i>"bar"</i>^</p>
				[ p, 3, 10 ]
			];

			testCases.forEach( function( tc ) {
				expect( doc.getOffsetAndAttributes( tc[ 0 ], tc[ 1 ] ) ).to.deep.equal( {
					attributes: tc[ 3 ] || [],
					offset: tc[ 2 ]
				} );
			} );
		} );

		it( 'should return a valid offset using preceding element with view - <p><b>foo</b><br>^</p>', function() {
			var element = document.getElementById( 't5' );

			var doc = new Document( new Element( element ) );

			var p = doc.root.children[ 0 ].view.getElement();

			expect( doc.getOffsetAndAttributes( p, 2 ) ).to.deep.equal( {
				attributes: [],
				offset: 7
			} );
		} );

	} );
} );