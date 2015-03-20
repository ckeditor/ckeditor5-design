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
		describe( 'should return valid elements and offsets for', function() {
			var doc = makeDocument( 't1' );
			// references to DOM elements
			var p = doc.root.children[ 0 ].view.getElement();
			var b = p.firstChild;
			var i1 = b.firstChild;
			var t1 = i1.firstChild;
			var u = b.lastChild;
			var i2 = u.firstChild;
			var t2 = i2.firstChild;

			var testCases = [
				[ '<p>^<b><i>ab</i><u><i>cd</i></u></b></p>', p, 0 ],
				[ '<p><b>^<i>ab</i><u><i>cd</i></u></b></p>', b, 0 ],
				[ '<p><b><i>^ab</i><u><i>cd</i></u></b></p>', t1, 0 ],
				[ '<p><b><i>a^b</i><u><i>cd</i></u></b></p>', t1, 1 ],
				[ '<p><b><i>ab^</i><u><i>cd</i></u></b></p>', t1, 2 ],
				[ '<p><b><i>ab</i>^<u><i>cd</i></u></b></p>', b, 1 ],
				[ '<p><b><i>ab</i><u>^<i>cd</i></u></b></p>', u, 0 ],
				[ '<p><b><i>ab</i><u><i>^cd</i></u></b></p>', t2, 0 ],
				[ '<p><b><i>ab</i><u><i>c^d</i></u></b></p>', t2, 1 ],
				[ '<p><b><i>ab</i><u><i>cd^</i></u></b></p>', t2, 2 ],
				[ '<p><b><i>ab</i><u><i>cd</i>^</u></b></p>', u, 1 ],
				[ '<p><b><i>ab</i><u><i>cd</i></u>^</b></p>', b, 2 ],
				[ '<p><b><i>ab</i><u><i>cd</i></u></b>^</p>', p, 1 ]
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

		describe( 'should return valid elements and offsets for', function() {
			var doc = makeDocument( 't2' );
			// references to DOM elements
			var p = doc.root.children[ 0 ].view.getElement();

			var b = p.childNodes[ 0 ];
			var br = p.childNodes[ 1 ];
			var i = p.childNodes[ 2 ];
			var t1 = b.firstChild;
			var t2 = i.firstChild;

			var testCases = [
				[ '<p>^<b>foo</b><br><i>bar</i></p>', p, 0 ],
				[ '<p><b>^foo</b><br><i>bar</i></p>', t1, 0 ],
				[ '<p><b>foo^</b><br><i>bar</i></p>', t1, 3 ],
				[ '<p><b>foo</b>^<br><i>bar</i></p>', p, 1 ],
				[ '<p><b>foo</b><br>^<i>bar</i></p>', p, 2 ],
				[ '<p><b>foo</b><br><i>^bar</i></p>', t2, 0 ],
				[ '<p><b>foo</b><br><i>bar^</i></p>', t2, 3 ],
				[ '<p><b>foo</b><br><i>bar</i>^</p>', p, 3 ]
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