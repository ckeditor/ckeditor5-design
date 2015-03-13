bender.require( [
	'converter',
	'store',
	'tools/utils'
], function(
	converter,
	Store,
	utils
) {
	'use strict';

	describe( 'getDataForDom', function() {
		var store;

		beforeEach( function() {
			store = new Store();
		} );

		it( 'should produce valid results for simple nodes', function() {
			var dom = document.getElementById( 'test1' );

			var expected = [ {
					"type": "div",
					"attributes": {}
				}, {
					"type": "paragraph",
					"attributes": {}
				},
				"F",
				"o",
				"o",
				" ",
				"b",
				"a",
				"r", {
					"type": "/paragraph"
				}, {
					"type": "list",
					"attributes": {
						"style": "bullet"
					}
				}, {
					"type": "listItem",
					"attributes": {}
				},
				"F",
				"o",
				"o", {
					"type": "/listItem"
				}, {
					"type": "listItem",
					"attributes": {}
				},
				"B",
				"a",
				"r", {
					"type": "list",
					"attributes": {
						"style": "bullet"
					}
				}, {
					"type": "listItem",
					"attributes": {}
				},
				"Q",
				"u",
				"x", {
					"type": "/listItem"
				}, {
					"type": "/list"
				}, {
					"type": "/listItem"
				}, {
					"type": "listItem",
					"attributes": {}
				},
				"B",
				"a",
				"z", {
					"type": "/listItem"
				}, {
					"type": "/list"
				}, {
					"type": "/div"
				}
			];

			var result = converter.getDataForDom( dom, store );

			expect( result ).to.deep.equal( expected );
		} );

		it( 'should produce valid results for styled text', function() {
			var dom = document.getElementById( 'test2' );

			var expected = [ {
					"type": "div",
					"attributes": {}
				}, {
					"type": "paragraph",
					"attributes": {}
				},
				"F",
				"o",
				"o",
				" ",
				[ "b", [ 0 ] ],
				[ "a", [ 0 ] ],
				[ "r", [ 0 ] ],
				[ " ", [ 0 ] ],
				[ "b", [ 0, 1 ] ],
				[ "a", [ 0, 1 ] ],
				[ "z", [ 0, 1 ] ],
				[ " ", [ 0, 1 ] ],
				[ "q", [ 0, 1, 2 ] ],
				[ "u", [ 0, 1, 2 ] ],
				[ "x", [ 0, 1, 2 ] ],
				[ " ", [ 0 ] ],
				[ "q", [ 0 ] ],
				[ "u", [ 0 ] ],
				[ "u", [ 0 ] ],
				[ "x", [ 0 ] ], {
					"type": "/paragraph"
				}, {
					"type": "/div"
				}
			];

			var result = converter.getDataForDom( dom, store );

			expect( result ).to.deep.equal( expected );
		} );
	} );
} );