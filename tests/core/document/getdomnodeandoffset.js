bender.require( [
	'document',
	'tools/element'
], function(
	Document,
	Element
) {
	'use strict';

	function makeDocument( id ) {
		return new Document( new Element( document.getElementById( id ) ) );
	}

	describe( 'getDomNodeAndOffset', function() {
		it( 'should throw an error on invalid position', function() {
			var doc = makeDocument( 't1' );

			expect( doc.getDomNodeAndOffset.bind( doc, -1 ) ).to.throw( Error, 'No branch at the given position.' );
		} );

		describe( 'should return valid elements and offsets for t1 -', function() {
			var doc = makeDocument( 't1' );
			// references to DOM elements
			var p = doc.root.children[ 0 ].view.getElement();
			var t0 = p.firstChild;
			var b = p.lastChild;
			var i1 = b.firstChild;
			var t1 = i1.firstChild;
			var u = b.lastChild;
			var i2 = u.firstChild;
			var t2 = i2.firstChild;

			var testCases = [
				[ '<p>^ab<b><i>cd</i><u><i>ef</i></u></b></p>', p, 0, t0, 0 ], // move to a text node
				[ '<p>a^b<b><i>cd</i><u><i>ef</i></u></b></p>', t0, 1 ],
				[ '<p>ab^<b><i>cd</i><u><i>ef</i></u></b></p>', p, 1, t0, 2 ], // move to a text node
				[ '<p>ab<b>^<i>cd</i><u><i>ef</i></u></b></p>', b, 0 ],
				[ '<p>ab<b><i>^cd</i><u><i>ef</i></u></b></p>', i1, 0, t1, 0 ], // move to a text node
				[ '<p>ab<b><i>c^d</i><u><i>ef</i></u></b></p>', t1, 1 ],
				[ '<p>ab<b><i>cd^</i><u><i>ef</i></u></b></p>', i1, 1, t1, 2 ], // move to a text node
				[ '<p>ab<b><i>cd</i>^<u><i>ef</i></u></b></p>', b, 1 ],
				[ '<p>ab<b><i>cd</i><u>^<i>ef</i></u></b></p>', u, 0 ],
				[ '<p>ab<b><i>cd</i><u><i>^ef</i></u></b></p>', i2, 0, t2, 0 ], // move to a text node
				[ '<p>ab<b><i>cd</i><u><i>e^f</i></u></b></p>', t2, 1 ],
				[ '<p>ab<b><i>cd</i><u><i>ef^</i></u></b></p>', i2, 1, t2, 2 ], // move to a text node
				[ '<p>ab<b><i>cd</i><u><i>ef</i>^</u></b></p>', u, 1 ],
				[ '<p>ab<b><i>cd</i><u><i>ef</i></u>^</b></p>', b, 2 ],
				[ '<p>ab<b><i>cd</i><u><i>ef</i></u></b>^</p>', p, 2 ]
			];

			testCases.forEach( function( tc ) {
				it( tc[ 0 ], function() {
					var data = doc.getOffsetAndAttributes( tc[ 1 ], tc[ 2 ] );
					var result = doc.getDomNodeAndOffset( data.offset, data.attributes );

					expect( result.node ).to.equal( tc[ 3 ] !== undefined ? tc[ 3 ] : tc[ 1 ] );
					expect( result.offset ).to.equal( tc[ 4 ] !== undefined ? tc[ 4 ] : tc[ 2 ] );
				} );
			} );
		} );

		describe( 'should return valid elements and offsets for t2 -', function() {
			var doc = makeDocument( 't2' );
			// references to DOM elements
			var p = doc.root.children[ 0 ].view.getElement();

			var b = p.childNodes[ 0 ];
			var i = p.childNodes[ 2 ];
			var t1 = b.firstChild;
			var t2 = i.firstChild;

			var testCases = [
				[ '<p>^<b>ab</b><br><i>cd</i></p>', p, 0 ],
				[ '<p><b>^ab</b><br><i>cd</i></p>', b, 0, t1, 0 ], // move to a text node
				[ '<p><b>ab^</b><br><i>cd</i></p>', b, 1, t1, 2 ], // move to a text node
				[ '<p><b>ab</b>^<br><i>cd</i></p>', p, 1 ],
				[ '<p><b>ab</b><br>^<i>cd</i></p>', p, 2 ],
				[ '<p><b>ab</b><br><i>^cd</i></p>', i, 0, t2, 0 ], // move to a text node
				[ '<p><b>ab</b><br><i>cd^</i></p>', i, 1, t2, 2 ], // move to a text node
				[ '<p><b>ab</b><br><i>cd</i>^</p>', p, 3 ]
			];

			testCases.forEach( function( tc ) {
				it( tc[ 0 ], function() {
					var data = doc.getOffsetAndAttributes( tc[ 1 ], tc[ 2 ] );
					var result = doc.getDomNodeAndOffset( data.offset, data.attributes );

					expect( result.node ).to.equal( tc[ 3 ] !== undefined ? tc[ 3 ] : tc[ 1 ] );
					expect( result.offset ).to.equal( tc[ 4 ] !== undefined ? tc[ 4 ] : tc[ 2 ] );
				} );
			} );
		} );

		describe( 'should return valid elements and offsets for t3 -', function() {
			var doc = makeDocument( 't3' );
			// references to DOM elements
			var ul = doc.root.children[ 0 ].view.getElement();
			var li1 = ul.firstChild;
			var t1 = li1.childNodes[ 0 ];
			var li2 = ul.lastChild;
			var b = li2.firstChild;
			var t2 = b.firstChild;

			var testCases = [
				[ '<ul>^<li>ab</li><li><b>cd</b></li></ul>', ul, 0 ],
				[ '<ul><li>^ab</li><li><b>cd</b></li></ul>', li1, 0, t1, 0 ], // move to a text node
				[ '<ul><li>ab^</li><li><b>cd</b></li></ul>', li1, 1, t1, 2 ], // move to a text node
				[ '<ul><li>ab</li>^<li><b>cd</b></li></ul>', ul, 1 ],
				[ '<ul><li>ab</li><li>^<b>cd</b></li></ul>', li2, 0 ],
				[ '<ul><li>ab</li><li><b>^cd</b></li></ul>', t2, 0 ],
				[ '<ul><li>ab</li><li><b>cd^</b></li></ul>', t2, 2 ],
				[ '<ul><li>ab</li><li><b>cd</b>^</li></ul>', li2, 1 ],
				[ '<ul><li>ab</li><li><b>cd</b></li>^</ul>', ul, 2 ]
			];

			testCases.forEach( function( tc ) {
				it( tc[ 0 ], function() {
					var data = doc.getOffsetAndAttributes( tc[ 1 ], tc[ 2 ] );
					var result = doc.getDomNodeAndOffset( data.offset, data.attributes );

					expect( result.node ).to.equal( tc[ 3 ] !== undefined ? tc[ 3 ] : tc[ 1 ] );
					expect( result.offset ).to.equal( tc[ 4 ] !== undefined ? tc[ 4 ] : tc[ 2 ] );
				} );
			} );
		} );

		describe( 'should return valid elements and offsets for t4 -', function() {
			var doc = makeDocument( 't4' );
			// references to DOM elements
			var ul1 = doc.root.children[ 0 ].view.getElement();
			var li1 = ul1.firstChild;
			var t1 = li1.childNodes[ 0 ];
			var b = li1.childNodes[ 1 ];
			var t2 = b.firstChild;
			var t3 = li1.childNodes[ 2 ];
			var ul2 = li1.childNodes[ 3 ];
			var li2 = ul2.firstChild;
			var t4 = li2.firstChild;
			var i = li1.childNodes[ 4 ];
			var t5 = i.firstChild;
			var t6 = li1.childNodes[ 5 ];
			var li3 = ul1.lastChild;
			var u = li3.firstChild;
			var t7 = u.firstChild;

			var testCases = [
				[ '<ul>^<li>ab<b>cd</b>ef<ul><li>gh</li></ul><i>ij</i>kl</li><li><u>mn</u></li></ul>', ul1, 0 ],
				[ '<ul><li>^ab<b>cd</b>ef<ul><li>gh</li></ul><i>ij</i>kl</li><li><u>mn</u></li></ul>', li1, 0, t1, 0 ],
				[ '<ul><li>ab^<b>cd</b>ef<ul><li>gh</li></ul><i>ij</i>kl</li><li><u>mn</u></li></ul>', li1, 1, t1, 2 ],
				[ '<ul><li>ab<b>^cd</b>ef<ul><li>gh</li></ul><i>ij</i>kl</li><li><u>mn</u></li></ul>', b, 0, t2, 0 ],
				[ '<ul><li>ab<b>cd^</b>ef<ul><li>gh</li></ul><i>ij</i>kl</li><li><u>mn</u></li></ul>', b, 1, t2, 2 ],
				[ '<ul><li>ab<b>cd</b>^ef<ul><li>gh</li></ul><i>ij</i>kl</li><li><u>mn</u></li></ul>', li1, 2, t3, 0 ],
				[ '<ul><li>ab<b>cd</b>ef^<ul><li>gh</li></ul><i>ij</i>kl</li><li><u>mn</u></li></ul>', li1, 3, t3, 2 ],
				[ '<ul><li>ab<b>cd</b>ef<ul>^<li>gh</li></ul><i>ij</i>kl</li><li><u>mn</u></li></ul>', ul2, 0 ],
				[ '<ul><li>ab<b>cd</b>ef<ul><li>^gh</li></ul><i>ij</i>kl</li><li><u>mn</u></li></ul>', li2, 0, t4, 0 ],
				[ '<ul><li>ab<b>cd</b>ef<ul><li>gh^</li></ul><i>ij</i>kl</li><li><u>mn</u></li></ul>', li2, 1, t4, 2 ],
				[ '<ul><li>ab<b>cd</b>ef<ul><li>gh</li>^</ul><i>ij</i>kl</li><li><u>mn</u></li></ul>', ul2, 1 ],
				[ '<ul><li>ab<b>cd</b>ef<ul><li>gh</li></ul>^<i>ij</i>kl</li><li><u>mn</u></li></ul>', li1, 4 ],
				[ '<ul><li>ab<b>cd</b>ef<ul><li>gh</li></ul><i>^ij</i>kl</li><li><u>mn</u></li></ul>', i, 0, t5, 0 ],
				[ '<ul><li>ab<b>cd</b>ef<ul><li>gh</li></ul><i>ij^</i>kl</li><li><u>mn</u></li></ul>', i, 1, t5, 2 ],
				[ '<ul><li>ab<b>cd</b>ef<ul><li>gh</li></ul><i>ij</i>^kl</li><li><u>mn</u></li></ul>', li1, 5, t6, 0 ],
				[ '<ul><li>ab<b>cd</b>ef<ul><li>gh</li></ul><i>ij</i>kl^</li><li><u>mn</u></li></ul>', li1, 6, t6, 2 ],
				[ '<ul><li>ab<b>cd</b>ef<ul><li>gh</li></ul><i>ij</i>kl</li>^<li><u>mn</u></li></ul>', ul1, 1 ],
				[ '<ul><li>ab<b>cd</b>ef<ul><li>gh</li></ul><i>ij</i>kl</li><li>^<u>mn</u></li></ul>', li3, 0 ],
				[ '<ul><li>ab<b>cd</b>ef<ul><li>gh</li></ul><i>ij</i>kl</li><li><u>^mn</u></li></ul>', u, 0, t7, 0 ],
				[ '<ul><li>ab<b>cd</b>ef<ul><li>gh</li></ul><i>ij</i>kl</li><li><u>mn^</u></li></ul>', u, 1, t7, 2 ],
				[ '<ul><li>ab<b>cd</b>ef<ul><li>gh</li></ul><i>ij</i>kl</li><li><u>mn</u>^</li></ul>', li3, 1 ],
				[ '<ul><li>ab<b>cd</b>ef<ul><li>gh</li></ul><i>ij</i>kl</li><li><u>mn</u></li>^</ul>', ul1, 2 ]
			];

			testCases.forEach( function( tc ) {
				it( tc[ 0 ], function() {
					var data = doc.getOffsetAndAttributes( tc[ 1 ], tc[ 2 ] );
					var result = doc.getDomNodeAndOffset( data.offset, data.attributes );

					expect( result.node ).to.equal( tc[ 3 ] !== undefined ? tc[ 3 ] : tc[ 1 ] );
					expect( result.offset ).to.equal( tc[ 4 ] !== undefined ? tc[ 4 ] : tc[ 2 ] );
				} );
			} );
		} );

		describe( 'should return valid elements and offsets for t5 -', function() {
			var doc = makeDocument( 't5' );
			// references to DOM elements
			var p = doc.root.children[ 0 ].view.getElement();

			var b = p.childNodes[ 0 ];
			var t1 = b.firstChild;
			var t2 = p.childNodes[ 1 ];
			var t3 = p.childNodes[ 3 ];
			var i = p.childNodes[ 4 ];
			var t4 = i.firstChild;

			var testCases = [
				[ '<p>^<b>ab</b>cd<br>ef<i>gh</i></p>', p, 0 ],
				[ '<p><b>^ab</b>cd<br>ef<i>gh</i></p>', b, 0, t1, 0 ],
				[ '<p><b>ab^</b>cd<br>ef<i>gh</i></p>', b, 1, t1, 2 ],
				[ '<p><b>ab</b>^cd<br>ef<i>gh</i></p>', p, 1, t2, 0 ],
				[ '<p><b>ab</b>cd^<br>ef<i>gh</i></p>', p, 2, t2, 2 ],
				[ '<p><b>ab</b>cd<br>^ef<i>gh</i></p>', p, 3, t3, 0 ],
				[ '<p><b>ab</b>cd<br>ef^<i>gh</i></p>', p, 4, t3, 2 ],
				[ '<p><b>ab</b>cd<br>ef<i>^gh</i></p>', i, 0, t4, 0 ],
				[ '<p><b>ab</b>cd<br>ef<i>gh^</i></p>', i, 1, t4, 2 ],
				[ '<p><b>ab</b>cd<br>ef<i>gh</i>^</p>', p, 5 ]
			];

			testCases.forEach( function( tc ) {
				it( tc[ 0 ], function() {
					var data = doc.getOffsetAndAttributes( tc[ 1 ], tc[ 2 ] );
					var result = doc.getDomNodeAndOffset( data.offset, data.attributes );

					expect( result.node ).to.equal( tc[ 3 ] !== undefined ? tc[ 3 ] : tc[ 1 ] );
					expect( result.offset ).to.equal( tc[ 4 ] !== undefined ? tc[ 4 ] : tc[ 2 ] );
				} );
			} );
		} );

		describe( 'should return valid elements and offsets for t6 -', function() {
			var doc = makeDocument( 't6' );
			// references to DOM elements
			var ul1 = doc.root.children[ 0 ].view.getElement();
			var li1 = ul1.firstChild;
			var b1 = li1.childNodes[ 0 ];
			var t1 = b1.firstChild;
			var b2 = li1.childNodes[ 2 ];
			var i1 = b2.firstChild;
			var t2 = i1.firstChild;
			var ul2 = li1.childNodes[ 3 ];
			var li2 = ul2.firstChild;
			var t3 = li2.firstChild;

			var testCases = [
				[ '<ul>^<li><b>foo</b> <b><il>bar</i></b><ul><li>baz</li></ul></li></ul>', ul1, 0 ],
				[ '<ul><li>^<b>foo</b> <b><il>bar</i></b><ul><li>baz</li></ul></li></ul>', li1, 0 ],
				[ '<ul><li><b>^foo</b> <b><il>bar</i></b><ul><li>baz</li></ul></li></ul>', b1, 0, t1, 0 ],
				[ '<ul><li><b>foo^</b> <b><il>bar</i></b><ul><li>baz</li></ul></li></ul>', b1, 1, t1, 3 ],
				[ '<ul><li><b>foo</b> <b>^<i>bar</i></b><ul><li>baz</li></ul></li></ul>', b2, 0 ],
				[ '<ul><li><b>foo</b> <b><i>^bar</i></b><ul><li>baz</li></ul></li></ul>', i1, 0, t2, 0 ],
				[ '<ul><li><b>foo</b> <b><i>bar^</i></b><ul><li>baz</li></ul></li></ul>', i1, 1 ],
				[ '<ul><li><b>foo</b> <b><i>bar</i>^</b><ul><li>baz</li></ul></li></ul>', b2, 1 ],
				[ '<ul><li><b>foo</b> <b><il>bar</i></b>^<ul><li>baz</li></ul></li></ul>', li1, 3 ],
				[ '<ul><li><b>foo</b> <b><il>bar</i></b><ul>^<li>baz</li></ul></li></ul>', ul2, 0 ],
				[ '<ul><li><b>foo</b> <b><il>bar</i></b><ul><li>^baz</li></ul></li></ul>', li2, 0, t3, 0 ],
				[ '<ul><li><b>foo</b> <b><il>bar</i></b><ul><li>baz^</li></ul></li></ul>', li2, 1, t3, 3 ],
				[ '<ul><li><b>foo</b> <b><il>bar</i></b><ul><li>baz</li>^</ul></li></ul>', ul2, 1 ],
				[ '<ul><li><b>foo</b> <b><il>bar</i></b><ul><li>baz</li></ul>^</li></ul>', li1, 4 ],
				[ '<ul><li><b>foo</b> <b><il>bar</i></b><ul><li>baz</li></ul></li>^</ul>', ul1, 1 ]
			];

			testCases.forEach( function( tc ) {
				it( tc[ 0 ], function() {
					var data = doc.getOffsetAndAttributes( tc[ 1 ], tc[ 2 ] );
					var result = doc.getDomNodeAndOffset( data.offset, data.attributes );

					expect( result.node ).to.equal( tc[ 3 ] !== undefined ? tc[ 3 ] : tc[ 1 ] );
					expect( result.offset ).to.equal( tc[ 4 ] !== undefined ? tc[ 4 ] : tc[ 2 ] );
				} );
			} );
		} );
	} );

} );