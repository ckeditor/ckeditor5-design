bender.require( [
	'lineardocumentdata',
	'range'
], function(
	LinearDocumentData,
	Range
) {
	'use strict';

	var data = [ {
			type: 'paragraph'
		},
		'f',
		'o',
		'o',
		' ', [ 'b', [ 0 ] ],
		[ 'a', [ 0 ] ],
		[ 'r', [ 0 ] ], {
			type: '/paragraph'
		}
	];

	var data2 = [ {
			type: 'list',
			attributes: {
				type: 'number'
			}
		}, {
			type: 'listItem'
		},
		'f',
		'o',
		'o', {
			type: 'list',
			attributes: {
				type: 'number'
			}
		}, {
			type: 'listItem'
		},
		'q',
		'u',
		'x', {
			type: '/listItem'
		}, {
			type: '/list'
		}, {
			type: '/listItem'
		}, {
			type: 'listItem'
		},
		'b',
		'a',
		'r', {
			type: '/listItem'
		}, {
			type: '/list'
		}
	];

	var invalid_data = [ {
			type: 'list',
			attributes: {
				type: 'number'
			}
		}, {
			type: 'listItem'
		},
		'f',
		'o',
		'o', {
			type: 'list',
			attributes: {
				type: 'number'
			}
		}, {
			type: 'listItem'
		},
		[ 'q', [ 0 ] ],
		[ 'u', [ 0 ] ],
		[ 'x', [ 0 ] ], {
			type: '/list'
		}, {
			type: '/listItem'
		}, {
			type: 'listItem'
		},
		'b',
		'a',
		'r', {
			type: '/listItem'
		}, {
			type: '/list'
		}
	];

	describe( 'LinearDocumentData', function() {
		it( 'should check if an item is an element', function() {
			expect( LinearDocumentData.isElement( data[ 0 ] ) ).to.be.true();
			expect( LinearDocumentData.isElement( data[ 1 ] ) ).to.be.false();
			expect( LinearDocumentData.isElement( data[ 5 ] ) ).to.be.false();
			expect( LinearDocumentData.isElement( data[ 8 ] ) ).to.be.true();
		} );

		it( 'should return a type of an element', function() {
			expect( LinearDocumentData.getType( data[ 0 ] ) ).to.equal( 'paragraph' );
			expect( LinearDocumentData.getType( data[ 1 ] ) ).to.be.null();
			expect( LinearDocumentData.getType( data[ 5 ] ) ).to.be.null();
			expect( LinearDocumentData.getType( data[ 8 ] ) ).to.equal( 'paragraph' );
		} );

		it( 'should check if an item is an opening element', function() {
			expect( LinearDocumentData.isOpenElement( data[ 0 ] ) ).to.be.true();
			expect( LinearDocumentData.isOpenElement( data[ 1 ] ) ).to.be.false();
			expect( LinearDocumentData.isOpenElement( data[ 5 ] ) ).to.be.false();
			expect( LinearDocumentData.isOpenElement( data[ 8 ] ) ).to.be.false();
		} );

		it( 'should check if an item is a closing element', function() {
			expect( LinearDocumentData.isCloseElement( data[ 0 ] ) ).to.be.false();
			expect( LinearDocumentData.isCloseElement( data[ 1 ] ) ).to.be.false();
			expect( LinearDocumentData.isCloseElement( data[ 5 ] ) ).to.be.false();
			expect( LinearDocumentData.isCloseElement( data[ 8 ] ) ).to.be.true();
		} );

		it( 'should find a closing element for an item', function() {
			var ldd = new LinearDocumentData( data2 );

			expect( ldd.findCloseElement( ldd.get( 0 ) ) ).to.equal( ldd.get( 18 ) );
			expect( ldd.findCloseElement( ldd.get( 1 ) ) ).to.equal( ldd.get( 12 ) );
			expect( ldd.findCloseElement( ldd.get( 2 ) ) ).to.be.null();
			expect( ldd.findCloseElement( ldd.get( 7 ) ) ).to.be.null();
			expect( ldd.findCloseElement( ldd.get( 5 ) ) ).to.equal( ldd.get( 11 ) );
			expect( ldd.findCloseElement( ldd.get( 6 ) ) ).to.equal( ldd.get( 10 ) );
			expect( ldd.findCloseElement( ldd.get( 13 ) ) ).to.equal( ldd.get( 17 ) );
		} );

		it( 'should return null whyn trying to find a closing element in invalid data', function() {
			var ldd = new LinearDocumentData( data.slice( 0, data.length - 1 ) );

			expect( ldd.findCloseElement( ldd.get( 0 ) ) ).to.be.null();
		} );

		it( 'should find an opening element for an item', function() {
			var ldd = new LinearDocumentData( data2 );

			expect( ldd.findOpenElement( ldd.get( 2 ) ) ).to.be.null();
			expect( ldd.findOpenElement( ldd.get( 7 ) ) ).to.be.null();
			expect( ldd.findOpenElement( ldd.get( 18 ) ) ).to.equal( ldd.get( 0 ) );
			expect( ldd.findOpenElement( ldd.get( 17 ) ) ).to.equal( ldd.get( 13 ) );
			expect( ldd.findOpenElement( ldd.get( 12 ) ) ).to.equal( ldd.get( 1 ) );
			expect( ldd.findOpenElement( ldd.get( 11 ) ) ).to.equal( ldd.get( 5 ) );
			expect( ldd.findOpenElement( ldd.get( 10 ) ) ).to.equal( ldd.get( 6 ) );
		} );

		it( 'should return null whyn trying to find an opening element in invalid data', function() {
			var ldd = new LinearDocumentData( data.slice( 1 ) );

			expect( ldd.findOpenElement( ldd.get( ldd.length - 1 ) ) ).to.be.null();
		} );

		it( 'should check if an item at the given position is an element', function() {
			var ldd = new LinearDocumentData( data );

			expect( ldd.isElementAt( 0 ) ).to.be.true();
			expect( ldd.isElementAt( 1 ) ).to.be.false();
			expect( ldd.isElementAt( 5 ) ).to.be.false();
			expect( ldd.isElementAt( 8 ) ).to.be.true();
		} );

		it( 'should return a type of an element at the given position', function() {
			var ldd = new LinearDocumentData( data );

			expect( ldd.getTypeAt( 0 ) ).to.equal( 'paragraph' );
			expect( ldd.getTypeAt( 1 ) ).to.be.null();
			expect( ldd.getTypeAt( 5 ) ).to.be.null();
			expect( ldd.getTypeAt( 8 ) ).to.equal( 'paragraph' );
		} );

		it( 'should check if an item at the given position is an opening element', function() {
			var ldd = new LinearDocumentData( data );

			expect( ldd.isOpenElementAt( 0 ) ).to.be.true();
			expect( ldd.isOpenElementAt( 1 ) ).to.be.false();
			expect( ldd.isOpenElementAt( 5 ) ).to.be.false();
			expect( ldd.isOpenElementAt( 8 ) ).to.be.false();
		} );

		it( 'should check if an item at the given position is a closing element', function() {
			var ldd = new LinearDocumentData( data );

			expect( ldd.isCloseElementAt( 0 ) ).to.be.false();
			expect( ldd.isCloseElementAt( 1 ) ).to.be.false();
			expect( ldd.isCloseElementAt( 5 ) ).to.be.false();
			expect( ldd.isCloseElementAt( 8 ) ).to.be.true();
		} );

		it( 'should check if the data is valid', function() {
			var ldd = new LinearDocumentData( data );

			expect( ldd.isValid() ).to.be.true();

			ldd = new LinearDocumentData( invalid_data );

			expect( ldd.isValid() ).to.be.false();
		} );
	} );
} );