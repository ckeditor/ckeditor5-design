bender.require( [
	'document',
	'transaction',
	'tools/element',
	'tools/utils'
], function(
	Document,
	Transaction,
	Element,
	utils
) {
	'use strict';

	var t1 = new Element( '#t1' );
	var t2 = new Element( '#t2' );
	var t3 = new Element( '#t3' );

	describe( 'applyTransaction', function() {
		it( 'should throw when trying to apply a transaction more than once', function() {
			var doc = new Document( t1 );

			var transaction = new Transaction();

			transaction.operations = [ {
				retain: 2
			}, {
				insert: 'f'
			} ];

			function apply() {
				doc.applyTransaction( transaction );
			}

			expect( apply ).to.not.throw();
			expect( apply ).to.throw( Error, 'The transaction has already been applied.' );
		} );

		it( 'should handle text insertion transactions', function() {
			var doc = new Document( t1 );

			var t = doc.root.children[ 0 ].children[ 0 ];

			expect( t.length ).to.equal( 11 );

			var transaction = new Transaction();

			transaction.operations = [ {
				retain: 6
			}, {
				insert: 'q'
			}, {
				insert: 'u'
			}, {
				insert: 'x'
			}, {
				insert: ' '
			} ];

			doc.applyTransaction( transaction );

			expect( t.length ).to.equal( 15 );
			expect( doc.getNodeData( t ).join( '' ) ).to.equal( 'foo qux bar baz' );
		} );

		it( 'should handle text insertion at the end of a branch node', function() {
			var doc = new Document( t1 );

			var t = doc.root.children[ 0 ].children[ 0 ];

			expect( t.length ).to.equal( 11 );

			var transaction = new Transaction();

			transaction.operations = [ {
				retain: 13
			}, {
				insert: 'z'
			} ];

			doc.applyTransaction( transaction );

			expect( t.length ).to.equal( 12 );
			expect( doc.getNodeData( t ).join( '' ) ).to.equal( 'foo bar bazz' );
		} );

		it( 'should handle text insertion right before a node', function() {
			var doc = new Document( t2 );

			var t = doc.root.children[ 0 ].children[ 0 ];

			expect( t.length ).to.equal( 7 );

			var transaction = new Transaction();

			transaction.operations = [ {
				retain: 9
			}, {
				insert: 'r'
			} ];

			doc.applyTransaction( transaction );

			expect( t.length ).to.equal( 8 );
			expect( doc.getNodeData( t ).join( '' ) ).to.equal( 'foo barr' );
		} );

		it( 'should handle text removal transactions', function() {
			var doc = new Document( t1 );

			var t = doc.root.children[ 0 ].children[ 0 ];

			expect( t.length ).to.equal( 11 );

			var transaction = new Transaction();

			transaction.operations = [ {
				retain: 6
			}, {
				remove: 'b'
			}, {
				remove: 'a'
			}, {
				remove: 'r'
			}, {
				remove: ' '
			} ];

			doc.applyTransaction( transaction );

			expect( t.length ).to.equal( 7 );
			expect( doc.getNodeData( t ).join( '' ) ).to.equal( 'foo baz' );
		} );

		it( 'should handle text replacement transactions', function() {
			var doc = new Document( t1 );

			var t = doc.root.children[ 0 ].children[ 0 ];

			expect( t.length ).to.equal( 11 );

			var transaction = new Transaction();

			transaction.operations = [ {
				retain: 6
			}, {
				remove: 'b'
			}, {
				remove: 'a'
			}, {
				remove: 'r'
			}, {
				insert: 'q'
			}, {
				insert: 'u'
			}, {
				insert: 'x'
			} ];

			doc.applyTransaction( transaction );

			expect( t.length ).to.equal( 11 );
			expect( doc.getNodeData( t ).join( '' ) ).to.equal( 'foo qux baz' );
		} );

		it( 'should trigger transaction:start event BEFORE modifying data', function( done ) {
			var doc = new Document( t1 );
			var t = doc.root.children[ 0 ].children[ 0 ];

			expect( t.length ).to.equal( 11 );
			expect( doc.getNodeData( t ).join( '' ) ).to.equal( 'foo bar baz' );

			var transaction = new Transaction();

			transaction.operations = [ {
				retain: 2
			}, {
				insert: 'f'
			} ];

			doc.on( 'transaction:start', function( tn ) {
				expect( tn ).to.equal( transaction );
				expect( t.length ).to.equal( 11 );
				expect( doc.getNodeData( t ).join( '' ) ).to.equal( 'foo bar baz' );
				done();
			} );

			doc.applyTransaction( transaction );
		} );

		it( 'should trigger transaction:end event AFTER modifying data', function( done ) {
			var doc = new Document( t1 );
			var t = doc.root.children[ 0 ].children[ 0 ];

			expect( t.length ).to.equal( 11 );
			expect( doc.getNodeData( t ).join( '' ) ).to.equal( 'foo bar baz' );

			var transaction = new Transaction();

			transaction.operations = [ {
				retain: 2
			}, {
				insert: 'f'
			} ];

			doc.on( 'transaction:end', function( tn ) {
				expect( tn ).to.equal( transaction );
				expect( t.length ).to.equal( 12 );
				expect( doc.getNodeData( t ).join( '' ) ).to.equal( 'ffoo bar baz' );
				done();
			} );

			doc.applyTransaction( transaction );
		} );

		it( 'should not remove text nodes during simple text manipulations', function() {
			var doc = new Document( t1 );
			var t = doc.root.children[ 0 ].children[ 0 ];
			var textNode = doc.root.children[ 0 ].view.childNodes[ 0 ];

			var transaction = new Transaction();

			transaction.operations = [ {
				retain: 6
			}, {
				remove: 'b'
			}, {
				remove: 'a'
			}, {
				remove: 'r'
			}, {
				insert: 'q'
			}, {
				insert: 'u'
			}, {
				insert: 'x'
			} ];

			doc.applyTransaction( transaction );

			expect( textNode ).to.equal( doc.root.children[ 0 ].view.childNodes[ 0 ] );
		} );

		it( 'should re-render parts of the dirty DOM when forceRender is called', function() {
			var doc = new Document( t1 );
			var t = doc.root.children[ 0 ].children[ 0 ];
			var paragraph = doc.root.children[ 0 ].view.getElement();
			var textNode = paragraph.childNodes[ 0 ];

			var transaction = new Transaction();

			transaction.operations = [ {
				retain: 6
			}, {
				remove: 'b'
			}, {
				remove: 'a'
			}, {
				remove: 'r'
			}, {
				insert: 'q'
			}, {
				insert: 'u'
			}, {
				insert: 'x'
			} ];

			doc.applyTransaction( transaction, true );

			expect( paragraph ).to.equal( doc.root.children[ 0 ].view.getElement() );
			expect( textNode ).to.not.equal( doc.root.children[ 0 ].view.childNodes[ 0 ] );
		} );

		it( 'should handle transactions that alter the dirty DOM structure', function() {
			var doc = new Document( t3 );

			var transaction = new Transaction();

			var li = doc.root.children[ 0 ].children[ 0 ];
			var ul2 = li.children[ 1 ];

			transaction.operations = [ {
				retain: 12
			}, {
				remove: ' '
			}, {
				insert: {
					type: '/listItem'
				}
			}, {
				insert: {
					type: 'listItem'
				}
			} ];

			doc.applyTransaction( transaction, true );

			expect( ul2.children ).to.have.length( 2 );
			expect( doc.getNodeData( ul2.children[ 0 ].children[ 0 ] ).join( '' ) ).to.equal( 'bar' );
			expect( doc.getNodeData( ul2.children[ 1 ].children[ 0 ] ).join( '' ) ).to.equal( 'baz' );
		} );
	} );
} );