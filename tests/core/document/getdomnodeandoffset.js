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
				[ '<p>^ab<b><i>ab</i><u><i>cd</i></u></b></p>', p, 0, t0, 0 ], // move to a text node
				[ '<p>a^b<b><i>ab</i><u><i>cd</i></u></b></p>', t0, 1 ],
				[ '<p>ab^<b><i>ab</i><u><i>cd</i></u></b></p>', p, 1, t0, 2 ], // move to a text node
				[ '<p>ab<b>^<i>ab</i><u><i>cd</i></u></b></p>', b, 0 ],
				[ '<p>ab<b><i>^ab</i><u><i>cd</i></u></b></p>', i1, 0, t1, 0 ], // move to a text node
				[ '<p>ab<b><i>a^b</i><u><i>cd</i></u></b></p>', t1, 1 ],
				[ '<p>ab<b><i>ab^</i><u><i>cd</i></u></b></p>', i1, 1, t1, 2 ], // move to a text node
				[ '<p>ab<b><i>ab</i>^<u><i>cd</i></u></b></p>', b, 1 ],
				[ '<p>ab<b><i>ab</i><u>^<i>cd</i></u></b></p>', u, 0 ],
				[ '<p>ab<b><i>ab</i><u><i>^cd</i></u></b></p>', i2, 0, t2, 0 ], // move to a text node
				[ '<p>ab<b><i>ab</i><u><i>c^d</i></u></b></p>', t2, 1 ],
				[ '<p>ab<b><i>ab</i><u><i>cd^</i></u></b></p>', i2, 1, t2, 2 ], // move to a text node
				[ '<p>ab<b><i>ab</i><u><i>cd</i>^</u></b></p>', u, 1 ],
				[ '<p>ab<b><i>ab</i><u><i>cd</i></u>^</b></p>', b, 2 ],
				[ '<p>ab<b><i>ab</i><u><i>cd</i></u></b>^</p>', p, 2 ]
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
			var br = p.childNodes[ 1 ];
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
				[ '<ul><li>^ab<b>cd</b>ef<ul><li>gh</li></ul><i>ij</i>kl</li><li><u>mn</u></li></ul>', t1, 0 ],
				[ '<ul><li>ab^<b>cd</b>ef<ul><li>gh</li></ul><i>ij</i>kl</li><li><u>mn</u></li></ul>', t1, 2 ],
				[ '<ul><li>ab<b>^cd</b>ef<ul><li>gh</li></ul><i>ij</i>kl</li><li><u>mn</u></li></ul>', t2, 0 ],
				[ '<ul><li>ab<b>cd^</b>ef<ul><li>gh</li></ul><i>ij</i>kl</li><li><u>mn</u></li></ul>', t2, 2 ],
				[ '<ul><li>ab<b>cd</b>^ef<ul><li>gh</li></ul><i>ij</i>kl</li><li><u>mn</u></li></ul>', li1, 2 ],
				[ '<ul><li>ab<b>cd</b>ef^<ul><li>gh</li></ul><i>ij</i>kl</li><li><u>mn</u></li></ul>', t3, 2 ],
				[ '<ul><li>ab<b>cd</b>ef<ul>^<li>gh</li></ul><i>ij</i>kl</li><li><u>mn</u></li></ul>', ul2, 0 ]
			];

			testCases.forEach( function( tc ) {
				it( tc[ 0 ], function() {
					var data = doc.getOffsetAndAttributes( tc[ 1 ], tc[ 2 ] );
					var result = doc.getDomNodeAndOffset( data.offset, data.attributes );

					expect( result.node ).to.equal( tc[ 1 ] );
					expect( result.offset ).to.equal( tc[ 2 ] );
				} );
			} );
		} );
	} );

} );