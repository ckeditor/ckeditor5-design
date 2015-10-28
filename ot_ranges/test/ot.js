/* global describe, it, beforeEach */

var assert = require( 'assert' );
var OT = require( '../ot.js' );

function docAdr( adr ) {
	adr.unshift( OT.DOCUMENT_ROOT_INDEX );
	return adr;
}

describe( 'OT', function() {
	var docRoot, gyRoot;

	beforeEach( function() {
		// Reset the main root before each test.
		docRoot = new OT.BlockNode( 'doc' );
		gyRoot = new OT.BlockNode( 'gy' );
		OT.setDocumentRoot( docRoot );

	} );


	/*
	 * First set of tests are simple tests of operations and whether their results are correct.
	 * We don't test BlockNode / TextNode classes methods because these are only example / temporary
	 * structures prototyped to be used with OT.IT transform functions.
	 *
	 * Since OT.IT transform functions are the main point of this prototype, we will test those
	 * extensively while leaving this set of tests pretty simple. We just need to be sure
	 * that after applying those operations we have correct trees.
	 */

	describe( 'OP (operation)', function() {
		describe( 'insert', function() {
			it( 'should append given nodes to a node specified by an address', function() {
				assert.equal( docRoot.getChildrenCount(), 0 );

				var address = docAdr( [ ] );
				OT.OP.insert( address, 0, [ new OT.BlockNode( 'p' ), new OT.BlockNode( 'd' ) ] );

				assert.equal( docRoot.getChildrenCount(), 2 );
			} );

			it( 'should append given nodes at specified offset', function() {
				docRoot.addChildren( 0, [ new OT.TextNode( 'a' ), new OT.BlockNode( 'p' ) ] );
				docRoot.getChild( 1 ).addChildren( 0, [ new OT.TextNode( 'x' ), new OT.TextNode( 'x' ) ] );

				var address = docAdr( [ 1 ] );
				var newNode = new OT.TextNode( 'y' );
				OT.OP.insert( address, 1, [ new OT.TextNode( 'x' ), newNode ] );

				assert.equal( docRoot.getChild( 1 ).getChild( 2 ), newNode );
			} );
		} );

		describe( 'remove', function() {
			var address;

			beforeEach( function() {
				address = docAdr( [ ] );

				docRoot.addChildren( 0, [ new OT.TextNode( 'a' ), new OT.TextNode( 'b' ), new OT.TextNode( 'c' ), new OT.TextNode( 'd' ) ] );
			} );

			it( 'should un-append nodes specified by an address and quantity', function() {
				OT.OP.remove( address, 1, 2 );

				assert.equal( docRoot.getChildrenCount(), 2 );
			} );

			it( 'should reassign offsets of children after removing an item', function() {
				OT.OP.remove( address, 1, 2 );

				assert.equal( docRoot.getChild( 0 ).char, 'a' );
				assert.equal( docRoot.getChild( 1 ).char, 'd' );
			} );
		} );

		describe( 'change', function() {
			var address;

			beforeEach( function() {
				address = docAdr( [ ] );

				docRoot.addChildren( 0, [ new OT.TextNode( 'a' ), new OT.TextNode( 'b' ), new OT.TextNode( 'c' ), new OT.TextNode( 'd' ) ] );
			} );

			it( 'should change attribute of the nodes specified by an address, offset and quantity', function() {
				OT.OP.change( address, 1, 2, 'foo', 'bar' );

				assert.equal( docRoot.getChild( 1 ).getAttrValue( 'foo' ), 'bar' );
				assert.equal( docRoot.getChild( 2 ).getAttrValue( 'foo' ), 'bar' );
			} );

			it( 'should remove attribute if value was not specified or it was an empty string', function() {
				OT.OP.change( address, 1, 2, 'foo', 'bar' );
				OT.OP.change( address, 1, 1, 'foo' );

				assert.equal( docRoot.getChild( 1 ).getAttrValue( 'foo' ), null );

				OT.OP.change( address, 2, 1, 'foo', '' );

				assert.equal( docRoot.getChild( 2 ).getAttrValue( 'foo' ), null );
			} );

			it( 'should overwrite the attribute\'s value if it was already set', function() {
				OT.OP.change( address, 1, 3, 'foo', 'bar' );
				OT.OP.change( address, 1, 2, 'foo', 'xyz' );

				assert.equal( docRoot.getChild( 1 ).getAttrValue( 'foo' ), 'xyz' );
				assert.equal( docRoot.getChild( 2 ).getAttrValue( 'foo' ), 'xyz' );
				assert.equal( docRoot.getChild( 3 ).getAttrValue( 'foo' ), 'bar' );
			} );

			it( 'should support adding multiple attributes to one node', function() {
				OT.OP.change( address, 1, 1, 'foo', 'bar' );
				OT.OP.change( address, 1, 1, 'abc', 'xyz' );

				assert.equal( docRoot.getChild( 1 ).getAttrValue( 'foo' ), 'bar' );
				assert.equal( docRoot.getChild( 1 ).getAttrValue( 'abc' ), 'xyz' );
			} );
		} );

		describe( 'move', function() {
			var fromAddress, toAddress, node;
			beforeEach( function() {
				fromAddress = docAdr( [ 0 ] );
				toAddress = docAdr( [ 1 ] );

				docRoot.addChildren( 0, [ new OT.BlockNode( 'a' ), new OT.BlockNode( 'b' ) ] );

				docRoot.getChild( 0 ).addChildren( 0, [ new OT.BlockNode( 'c' ), new OT.TextNode( 'x' ) ] );
				docRoot.getChild( 1 ).addChildren( 0, [ new OT.BlockNode( 'd' ), new OT.TextNode( 'y' ) ] );

				node = docRoot.getChild( 0 ).getChild( 1 );
			} );

			it( 'should remove specified number of nodes from given address and offset', function() {
				OT.OP.move( fromAddress, 0, 2, toAddress, 1 );

				assert.equal( docRoot.getChild( 0 ).getChildrenCount(), 0 );
			} );

			it( 'should add specified number of nodes to a specified address and offset', function() {
				OT.OP.move( fromAddress, 0, 2, toAddress, 1 );

				assert.equal( docRoot.getChild( 1 ).getChildrenCount(), 4 );
				assert.equal( docRoot.getChild( 1 ).getChild( 2 ), node );
			} );

			it( 'should throw when trying to move a node inside itself', function() {
				assert.throws(
					function() {
						OT.OP.move( fromAddress, 0, 1, docAdr( [ 0, 0 ] ), 0 );
					},
					Error
				);
			} );
		} );
	} );



	/*
	 * Second set of tests is testing if operations are correctly transformed against each other.
	 * The way to read descriptions is: <operation> transformed against <operation> should ...
	 * So, "ins x ins" means "insert operation transformed against insert operation" should ...
	 */

	describe( 'IT (inclusion transformation)', function() {
		var addressPair, nodeA, nodeB, nodeC, nodeD;

		beforeEach( function() {
			// is in beforeEach because otherwise docRoot is undefined
			addressPair = {
				// address A (0) is different than address B (1)
				diff: [
					docAdr( [ 0, 2 ] ),
					docAdr( [ 2, 2 ] )
				],

				// address A (0) is a prefix of address B (1)
				prefix: [
					docAdr( [ 2 ] ),
					docAdr( [ 2, 3 ] )
				],

				// address A (0) is exactly same as B (1)
				same: [
					docAdr( [ 0, 2 ] ),
					docAdr( [ 0, 2 ] )
				]
			};

			nodeA = new OT.BlockNode( 'a' );
			nodeB = new OT.BlockNode( 'b' );
			nodeC = new OT.BlockNode( 'c' );
			nodeD = new OT.BlockNode( 'd' );
		} );

		function getTransformedOp( doneOpType, toTransformOpType, params ) {
			var doneOpParams = {};
			var toTransformOpParams = {};

			for ( var i in params ) {
				if ( params.hasOwnProperty( i ) ) {
					if ( params[ i ][ 0 ] !== null ) {
						doneOpParams[ i ] = params[ i ][ 0 ];
					}
					if ( params[ i ][ 1 ] !== null ) {
						toTransformOpParams[ i ] = params[ i ][ 1 ];
					}
				}
			}

			if ( !( 'site' in doneOpParams ) ) {
				doneOpParams.site = 2;
			}
			if ( !( 'site' in toTransformOpParams ) ) {
				toTransformOpParams.site = 1;
			}

			var doneOp = OT.createOperation( doneOpType, doneOpParams );
			var toTransformOp = OT.createOperation( toTransformOpType, toTransformOpParams );

			var transformed = OT.IT[ toTransformOpType ][ doneOpType ]( toTransformOp, doneOp );

			return transformed;
		}

		function expectOperation( op, params ) {
			for ( var i in params ) {
				if ( params.hasOwnProperty( i ) ) {
					if ( params[ i ] instanceof Array ) {
						assert.equal( op[ i ].length, params[ i ].length, "Parameter array " + i + " has mis-matching length" );

						for ( var j = 0; j < params[ i ].length; j++ ) {
							assert.equal( op[ i ][ j ], params[ i ][ j ], "Parameter array " + i + " differs at position " + j );
						}
					} else {
						assert.equal( op[ i ], params[ i ], "Parameter " + i + " differs" );
					}
				}
			}
		}

		describe( 'ins x ins', function() {
			it( 'should not change when addresses are different', function() {
				var adr = addressPair.diff;
				var newAdr = OT.copyAddress( adr[ 1 ] );

				var transOp = getTransformedOp( 'insert', 'insert', {
					address: adr,
					offset: [ 0, 2 ],
					nodes: [ [ nodeA, nodeB ], [ nodeC, nodeD ] ],
					howMany: [ 2, 2 ]
				} );

 				expectOperation( transOp, {
					type: 'insert',
					address: newAdr,
					offset: 2,
					nodes: [ nodeC, nodeD ],
					howMany: 2
				} );
			} );

			it( 'should increment offset if addresses are same and offset is after applied operation', function() {
				var adr = addressPair.same;
				var newAdr = OT.copyAddress( adr[ 1 ] );

				var transOp = getTransformedOp( 'insert', 'insert', {
					address: adr,
					offset: [ 0, 2 ],
					nodes: [ [ nodeA, nodeB ], [ nodeC, nodeD ] ],
					howMany: [ 2, 2 ]
				} );

 				expectOperation( transOp, {
					type: 'insert',
					address: newAdr,
					offset: 4,
					nodes: [ nodeC, nodeD ],
					howMany: 2
				} );
			} );

			it( 'should not increment offset if addresses are same and offset is before applied operation', function() {
				var adr = addressPair.same;
				var newAdr = OT.copyAddress( adr[ 1 ] );

				var transOp = getTransformedOp( 'insert', 'insert', {
					address: adr,
					offset: [ 2, 0 ],
					nodes: [ [ nodeA, nodeB ], [ nodeC, nodeD ] ],
					howMany: [ 2, 2 ]
				} );

 				expectOperation( transOp, {
					type: 'insert',
					address: newAdr,
					offset: 0,
					nodes: [ nodeC, nodeD ],
					howMany: 2
				} );
			} );

			it( 'should update address at node(i) if applied operation\'s address was a prefix and its offset is before node(i)', function() {
				var adr = addressPair.prefix;
				var newAdr = OT.copyAddress( adr[ 1 ] );

				var transOp = getTransformedOp( 'insert', 'insert', {
					address: adr,
					offset: [ 0, 2 ],
					nodes: [ [ nodeA, nodeB ], [ nodeC, nodeD ] ],
					howMany: [ 2, 2 ]
				} );

				newAdr[ 2 ] = 5;

 				expectOperation( transOp, {
					type: 'insert',
					address: newAdr,
					offset: 2,
					nodes: [ nodeC, nodeD ],
					howMany: 2
				} );
			} );
		} );

		describe( 'ins x chn', function() {
			it( 'should not change', function() {
				var adr = addressPair.same;
				var newAdr = OT.copyAddress( adr[ 1 ] );

				var transOp = getTransformedOp( 'change', 'insert', {
					address: adr,
					offset: [ 2, 2 ],
					nodes: [ null, [ nodeC, nodeD ] ],
					howMany: [ 2, 2 ],
					attr: [ 'foo', null ],
					value: [ 'bar', null ]
				} );

 				expectOperation( transOp, {
					type: 'insert',
					address: newAdr,
					offset: 2,
					nodes: [ nodeC, nodeD ],
					howMany: 2
				} );
			} );
		} );

		describe( 'ins x mov', function() {
			var fromAddress, toAddress;

			beforeEach( function() {
				fromAddress = docAdr( [ 1, 1 ] );
				toAddress = docAdr( [ 0, 2, 0 ] );
			} );

			it( 'should not change if insert is in different path than move origin and destination', function() {
				var opAddress = docAdr( [ 0, 3 ] );
				var newAddress = OT.copyAddress( opAddress );

				var inOp = OT.createOperation( 'insert', {
					address: opAddress,
					offset: 2,
					nodes: [ nodeA, nodeB ],
					howMany: 2,
					site: 1
				} );

				var siOp = OT.createOperation( 'move', {
					fromAddress: fromAddress,
					fromOffset: 2,
					howMany: 2,
					toAddress: toAddress,
					toOffset: 0,
					site: 2
				} );

				var transOp = OT.IT.insert.move( inOp, siOp );

 				expectOperation( transOp, {
					type: 'insert',
					address: newAddress,
					offset: 2,
					nodes: [ nodeA, nodeB ],
					howMany: 2
				} );
			} );

			it( 'should have it\'s address merged with destination address if insert was inside moved node sub-tree', function() {
				var opAddress = docAdr( [ 0, 2, 1, 1 ] );
				var newAddress = docAdr( [ 1, 1, 1, 1, 1 ] );

				var inOp = OT.createOperation( 'insert', {
					address: opAddress,
					offset: 2,
					nodes: [ nodeA, nodeB ],
					howMany: 2,
					site: 1
				} );

				var siOp = OT.createOperation( 'move', {
					fromAddress: docAdr( [ 0, 2 ] ),
					fromOffset: 0,
					howMany: 2,
					toAddress: docAdr( [ 1, 1, 1 ] ),
					toOffset: 0,
					site: 2
				} );

				var transOp = OT.IT.insert.move( inOp, siOp );

 				expectOperation( transOp, {
					type: 'insert',
					address: newAddress,
					offset: 2,
					nodes: [ nodeA, nodeB ],
					howMany: 2
				} );
			} );

			it( 'should decrement offset if address is same as move origin and insert offset is after moved node offset', function() {
				var opAddress = OT.copyAddress( fromAddress );
				var newAddress = OT.copyAddress( opAddress );

				var inOp = OT.createOperation( 'insert', {
					address: opAddress,
					offset: 2,
					nodes: [ nodeA, nodeB ],
					howMany: 2,
					site: 1
				} );

				var siOp = OT.createOperation( 'move', {
					fromAddress: fromAddress,
					fromOffset: 0,
					howMany: 2,
					toAddress: toAddress,
					toOffset: 0,
					site: 2
				} );

				var transOp = OT.IT.insert.move( inOp, siOp );

 				expectOperation( transOp, {
					type: 'insert',
					address: newAddress,
					offset: 0,
					nodes: [ nodeA, nodeB ],
					howMany: 2
				} );
			} );

			it( 'should increment offset if address is same as move destination and insert offset is after move-to offset', function() {
				var opAddress = OT.copyAddress( toAddress );
				var newAddress = OT.copyAddress( opAddress );

				var inOp = OT.createOperation( 'insert', {
					address: opAddress,
					offset: 2,
					nodes: [ nodeA, nodeB ],
					howMany: 2,
					site: 1
				} );

				var siOp = OT.createOperation( 'move', {
					fromAddress: fromAddress,
					fromOffset: 0,
					howMany: 2,
					toAddress: toAddress,
					toOffset: 0,
					site: 2
				} );

				var transOp = OT.IT.insert.move( inOp, siOp );

 				expectOperation( transOp, {
					type: 'insert',
					address: newAddress,
					offset: 4,
					nodes: [ nodeA, nodeB ],
					howMany: 2
				} );
			} );

			it( 'should update address if moved node is next to a node from insert path', function() {
				var opAddress = docAdr( [ 1, 1, 2 ] );
				var newAddress = OT.copyAddress( opAddress );
				newAddress[ 3 ] = 0;

				var inOp = OT.createOperation( 'insert', {
					address: opAddress,
					offset: 2,
					nodes: [ nodeA, nodeB ],
					howMany: 2,
					site: 1
				} );

				var siOp = OT.createOperation( 'move', {
					fromAddress: fromAddress,
					fromOffset: 0,
					howMany: 2,
					toAddress: toAddress,
					toOffset: 0,
					site: 2
				} );

				var transOp = OT.IT.insert.move( inOp, siOp );

 				expectOperation( transOp, {
					type: 'insert',
					address: newAddress,
					offset: 2,
					nodes: [ nodeA, nodeB ],
					howMany: 2
				} );
			} );

			it( 'should update address if move-in destination is next to a node from insert path', function() {
				var opAddress = docAdr( [ 0, 2, 0, 1 ] );
				var newAddress = OT.copyAddress( opAddress );
				newAddress[ 4 ] = 3;

				var inOp = OT.createOperation( 'insert', {
					address: opAddress,
					offset: 2,
					nodes: [ nodeA, nodeB ],
					howMany: 2,
					site: 1
				} );

				var siOp = OT.createOperation( 'move', {
					fromAddress: fromAddress,
					fromOffset: 0,
					howMany: 2,
					toAddress: toAddress,
					toOffset: 0,
					site: 2
				} );

				var transOp = OT.IT.insert.move( inOp, siOp );

 				expectOperation( transOp, {
					type: 'insert',
					address: newAddress,
					offset: 2,
					nodes: [ nodeA, nodeB ],
					howMany: 2
				} );
			} );

			it( 'should decrement offset if address is same as move origin and insert offset is in the middle of moved range', function() {
				var opAddress = OT.copyAddress( fromAddress );
				var newAddress = OT.copyAddress( opAddress );

				var inOp = OT.createOperation( 'insert', {
					address: opAddress,
					offset: 2,
					nodes: [ nodeA, nodeB ],
					howMany: 2,
					site: 1
				} );

				var siOp = OT.createOperation( 'move', {
					fromAddress: fromAddress,
					fromOffset: 1,
					howMany: 2,
					toAddress: toAddress,
					toOffset: 0,
					site: 2
				} );

				var transOp = OT.IT.insert.move( inOp, siOp );

				expectOperation( transOp, {
					type: 'insert',
					address: newAddress,
					offset: 1,
					nodes: [ nodeA, nodeB ],
					howMany: 2
				} );
			} );
		} );

		describe( 'chn x ins', function() {
			it( 'should not change when addresses are different', function() {
				var adr = addressPair.diff;
				var newAdr = OT.copyAddress( adr[ 1 ] );

				var transOp = getTransformedOp( 'insert', 'change', {
					address: adr,
					offset: [ 0, 2 ],
					nodes: [ [ nodeA, nodeB ], null ],
					howMany: [ 2, 2 ],
					attr: [ null, 'foo' ],
					value: [ null, 'bar' ]
				} );

 				expectOperation( transOp, {
					type: 'change',
					address: newAdr,
					offset: 2,
					howMany: 2,
					attr: 'foo',
					value: 'bar'
				} );
			} );

			it( 'should update address if insert offset was before changed node', function() {
				var adr = addressPair.same;
				var newAdr = OT.copyAddress( adr[ 1 ] );

				var transOp = getTransformedOp( 'insert', 'change', {
					address: adr,
					offset: [ 0, 2 ],
					nodes: [ [ nodeA, nodeB ], null ],
					howMany: [ 2, 2 ],
					attr: [ null, 'foo' ],
					value: [ null, 'bar' ]
				} );

 				expectOperation( transOp, {
					type: 'change',
					address: newAdr,
					offset: 4,
					howMany: 2,
					attr: 'foo',
					value: 'bar'
				} );
			} );

			it( 'should not update address if insert offset was after changed node', function() {
				var adr = addressPair.same;
				var newAdr = OT.copyAddress( adr[ 1 ] );

				var transOp = getTransformedOp( 'insert', 'change', {
					address: adr,
					offset: [ 2, 0 ],
					nodes: [ [ nodeA, nodeB ], null ],
					howMany: [ 2, 2 ],
					attr: [ null, 'foo' ],
					value: [ null, 'bar' ]
				} );

 				expectOperation( transOp, {
					type: 'change',
					address: newAdr,
					offset: 0,
					howMany: 2,
					attr: 'foo',
					value: 'bar'
				} );
			} );

			it( 'should update address at node(i) if applied operation\'s address was a prefix and its offset is before node(i)', function() {
				var adr = addressPair.prefix;

				var newAdr = OT.copyAddress( adr[ 1 ] );
				newAdr[ 2 ] = 5;

				var transOp = getTransformedOp( 'insert', 'change', {
					address: adr,
					offset: [ 0, 0 ],
					nodes: [ [ nodeA, nodeB ], null ],
					howMany: [ 2, 2 ],
					attr: [ null, 'foo' ],
					value: [ null, 'bar' ]
				} );

 				expectOperation( transOp, {
					type: 'change',
					address: newAdr,
					offset: 0,
					howMany: 2,
					attr: 'foo',
					value: 'bar'
				} );
			} );

			it( 'should be split into two operations if insert was inside the range of incoming change operation', function() {
				var adr = addressPair.same;
				var newAdr = OT.copyAddress( adr[ 0 ] );

				var transOp = getTransformedOp( 'insert', 'change', {
					address: adr,
					offset: [ 3, 1 ],
					nodes: [ [ nodeA, nodeB ], null ],
					howMany: [ 2, 5 ],
					attr: [ null, 'foo' ],
					value: [ null, 'bar' ]
				} );

				assert.equal( transOp instanceof Array, true, "Operation got split" );
				assert.equal( transOp.length, 2, "Operation got transformed into two operations" );

				expectOperation( transOp[ 0 ], {
					type: 'change',
					address: newAdr,
					offset: 1,
					howMany: 2,
					attr: 'foo',
					value: 'bar'
				} );

				expectOperation( transOp[ 1 ], {
					type: 'change',
					address: newAdr,
					offset: 5,
					howMany: 3,
					attr: 'foo',
					value: 'bar'
				} );
			} );
		} );

		describe( 'chn x chn', function() {
			var adr, newAdr;

			beforeEach( function() {
				adr = addressPair.same;
				newAdr = OT.copyAddress( adr[ 0 ] );
			} );

			it( 'should remain the same if attribute is different', function() {
				var transOp = getTransformedOp( 'change', 'change', {
					address: adr,
					offset: [ 0, 0 ],
					howMany: [ 2, 2 ],
					attr: [ 'abc', 'foo' ],
					value: [ 'xyz', 'bar' ]
				} );

 				expectOperation( transOp, {
					type: 'change',
					address: newAdr,
					offset: 0,
					howMany: 2,
					attr: 'foo',
					value: 'bar'
				} );
			} );

			describe( 'when attributes are the same', function() {
				describe( 'when incoming range and on-site range are the same', function () {
					it( 'should remain the same if it has higher site id', function() {
						var transOp = getTransformedOp( 'change', 'change', {
							address: adr,
							offset: [ 0, 0 ],
							howMany: [ 2, 2 ],
							attr: [ 'foo', 'foo' ],
							value: [ 'bar', 'xyz' ],
							site: [ 1, 2 ]
						} );

						expectOperation( transOp, {
							type: 'change',
							address: newAdr,
							offset: 0,
							howMany: 2,
							attr: 'foo',
							value: 'xyz'
						} );
					} );

					it( 'should become do-nothing operation if it has lower site id', function() {
						var transOp = getTransformedOp( 'change', 'change', {
							address: adr,
							offset: [ 0, 0 ],
							howMany: [ 2, 2 ],
							attr: [ 'foo', 'foo' ],
							value: [ 'bar', 'xyz' ]
						} );

						expectOperation( transOp, {
							type: 'noop',
							address: newAdr,
							offset: 0
						} );
					} );
				} );

				describe( 'when incoming range is contained by on-site range', function () {
					it( 'should remain the same if it has higher site id', function() {
						var transOp = getTransformedOp( 'change', 'change', {
							address: adr,
							offset: [ 0, 1 ],
							howMany: [ 4, 2 ],
							attr: [ 'foo', 'foo' ],
							value: [ 'bar', 'xyz' ],
							site: [ 1, 2 ]
						} );

						expectOperation( transOp, {
							type: 'change',
							address: newAdr,
							offset: 1,
							howMany: 2,
							attr: 'foo',
							value: 'xyz'
						} );
					} );

					it( 'should become do-nothing operation if it has lower site id', function() {
						var transOp = getTransformedOp( 'change', 'change', {
							address: adr,
							offset: [ 0, 1 ],
							howMany: [ 4, 2 ],
							attr: [ 'foo', 'foo' ],
							value: [ 'bar', 'xyz' ]
						} );

						expectOperation( transOp, {
							type: 'noop',
							address: newAdr,
							offset: 1,
							howMany: 2
						} );
					} );
				} );

				// [ incoming range   <   ]   on site range >
				describe( 'when incoming range intersects on right-side with on-site range', function () {
					it( 'should remain the same if it has higher site id', function() {
						var adr = addressPair.same;
						var newAdr = OT.copyAddress( adr[ 1 ] );

						var transOp = getTransformedOp( 'change', 'change', {
							address: adr,
							offset: [ 3, 1 ],
							howMany: [ 3, 4 ],
							attr: [ 'foo', 'foo' ],
							value: [ 'bar', 'xyz' ],
							site: [ 1, 2 ]
						} );

						expectOperation( transOp, {
							type: 'change',
							address: newAdr,
							offset: 1,
							howMany: 4,
							attr: 'foo',
							value: 'xyz'
						} );
					} );

					it( 'should get shrunk if it has lower site id', function() {
						var transOp = getTransformedOp( 'change', 'change', {
							address: adr,
							offset: [ 3, 1 ],
							howMany: [ 3, 4 ],
							attr: [ 'foo', 'foo' ],
							value: [ 'bar', 'xyz' ]
						} );

						expectOperation( transOp, {
							type: 'change',
							address: newAdr,
							offset: 1,
							howMany: 2,
							attr: 'foo',
							value: 'xyz'
						} );
					} );
				} );

				// [ on site range   <   ]   incoming range >
				describe( 'when incoming range intersects on left-side with on-site range', function () {
					it( 'should remain the same if it has higher site id', function() {
						var adr = addressPair.same;
						var newAdr = OT.copyAddress( adr[ 1 ] );

						var transOp = getTransformedOp( 'change', 'change', {
							address: adr,
							offset: [ 1, 3 ],
							howMany: [ 4, 3 ],
							attr: [ 'foo', 'foo' ],
							value: [ 'bar', 'xyz' ],
							site: [ 1, 2 ]
						} );

						expectOperation( transOp, {
							type: 'change',
							address: newAdr,
							offset: 3,
							howMany: 3,
							attr: 'foo',
							value: 'xyz'
						} );
					} );

					it( 'should get shrunk if it has lower site id', function() {
						var transOp = getTransformedOp( 'change', 'change', {
							address: adr,
							offset: [ 1, 3 ],
							howMany: [ 4, 3 ],
							attr: [ 'foo', 'foo' ],
							value: [ 'bar', 'xyz' ]
						} );

						expectOperation( transOp, {
							type: 'change',
							address: newAdr,
							offset: 5,
							howMany: 1,
							attr: 'foo',
							value: 'xyz'
						} );
					} );
				} );

				describe( 'when incoming range contains on-site range', function () {
					it( 'should remain the same if it has higher site id', function() {
						var adr = addressPair.same;
						var newAdr = OT.copyAddress( adr[ 1 ] );

						var transOp = getTransformedOp( 'change', 'change', {
							address: adr,
							offset: [ 2, 1 ],
							howMany: [ 2, 4 ],
							attr: [ 'foo', 'foo' ],
							value: [ 'bar', 'xyz' ],
							site: [ 1, 2 ]
						} );

						expectOperation( transOp, {
							type: 'change',
							address: newAdr,
							offset: 1,
							howMany: 4,
							attr: 'foo',
							value: 'xyz'
						} );
					} );

					it( 'should get split into two ranges if it has lower site id', function() {
						var transOp = getTransformedOp( 'change', 'change', {
							address: adr,
							offset: [ 2, 1 ],
							howMany: [ 2, 4 ],
							attr: [ 'foo', 'foo' ],
							value: [ 'bar', 'xyz' ]
						} );

						assert.equal( transOp instanceof Array, true, "Operation got split" );
						assert.equal( transOp.length, 2, "Operation got transformed into two operations" );

						expectOperation( transOp[ 0 ], {
							type: 'change',
							address: newAdr,
							offset: 1,
							howMany: 1,
							attr: 'foo',
							value: 'xyz'
						} );

						expectOperation( transOp[ 1 ], {
							type: 'change',
							address: newAdr,
							offset: 4,
							howMany: 1,
							attr: 'foo',
							value: 'xyz'
						} );
					} );
				} );
			} );
		} );

		describe( 'chn x mov', function() {
			var fromAddress, toAddress;

			beforeEach( function() {
				fromAddress = docAdr( [ 1, 1 ] );
				toAddress = docAdr( [ 0, 2, 0 ] );
			} );

			it( 'should not update address or offset if change target is in different path than move origin and destination', function() {
				var opAddress = docAdr( [ 0, 3 ] );
				var newAddress = OT.copyAddress( opAddress );

				var inOp = OT.createOperation( 'change', {
					address: opAddress,
					offset: 0,
					howMany: 2,
					attr: 'foo',
					value: 'bar',
					site: 1
				} );

				var siOp = OT.createOperation( 'move', {
					fromAddress: fromAddress,
					fromOffset: 2,
					howMany: 2,
					toAddress: toAddress,
					toOffset: 0,
					site: 2
				} );

				var transOp = OT.IT.change.move( inOp, siOp );

 				expectOperation( transOp, {
					type: 'change',
					address: newAddress,
					offset: 0,
					howMany: 2,
					attr: 'foo',
					value: 'bar'
				} );
			} );

			it( 'should have it\'s address merged with destination address if change was inside moved node sub-tree', function() {
				var opAddress = docAdr( [ 0, 1, 0 ] );
				var newAddress = docAdr( [ 1, 1, 2, 0 ] );

				var inOp = OT.createOperation( 'change', {
					address: opAddress,
					offset: 2,
					howMany: 2,
					attr: 'foo',
					value: 'bar',
					site: 1
				} );

				var siOp = OT.createOperation( 'move', {
					fromAddress: docAdr( [ 0 ] ),
					fromOffset: 0,
					howMany: 2,
					toAddress: docAdr( [ 1, 1 ] ),
					toOffset: 1,
					site: 2
				} );

				var transOp = OT.IT.change.move( inOp, siOp );

 				expectOperation( transOp, {
					type: 'change',
					address: newAddress,
					offset: 2,
					howMany: 2,
					attr: 'foo',
					value: 'bar'
				} );
			} );

			it( 'should decrement offset if address is same as move origin and change offset is after moved node offset', function() {
				var opAddress = OT.copyAddress( fromAddress );
				var newAddress = OT.copyAddress( opAddress );

				var inOp = OT.createOperation( 'change', {
					address: opAddress,
					offset: 2,
					howMany: 2,
					attr: 'foo',
					value: 'bar',
					site: 1
				} );

				var siOp = OT.createOperation( 'move', {
					fromAddress: fromAddress,
					fromOffset: 0,
					howMany: 2,
					toAddress: toAddress,
					toOffset: 0,
					site: 2
				} );

				var transOp = OT.IT.change.move( inOp, siOp );

 				expectOperation( transOp, {
					type: 'change',
					address: newAddress,
					offset: 0,
					howMany: 2,
					attr: 'foo',
					value: 'bar'
				} );
			} );

			it( 'should increment offset if address is same as move destination and change offset is after move-to offset', function() {
				var opAddress = OT.copyAddress( toAddress );
				var newAddress = OT.copyAddress( opAddress );

				var inOp = OT.createOperation( 'change', {
					address: opAddress,
					offset: 1,
					howMany: 2,
					attr: 'foo',
					value: 'bar',
					site: 1
				} );

				var siOp = OT.createOperation( 'move', {
					fromAddress: fromAddress,
					fromOffset: 0,
					howMany: 2,
					toAddress: toAddress,
					toOffset: 0,
					site: 2
				} );

				var transOp = OT.IT.change.move( inOp, siOp );

 				expectOperation( transOp, {
					type: 'change',
					address: newAddress,
					offset: 3,
					howMany: 2,
					attr: 'foo',
					value: 'bar'
				} );
			} );

			it( 'should update address if moved node is next to a node from insert path', function() {
				var opAddress = docAdr( [ 1, 1, 2 ] );
				var newAddress = OT.copyAddress( opAddress );
				newAddress[ 3 ] = 0;

				var inOp = OT.createOperation( 'change', {
					address: opAddress,
					offset: 0,
					howMany: 2,
					attr: 'foo',
					value: 'bar',
					site: 1
				} );

				var siOp = OT.createOperation( 'move', {
					fromAddress: fromAddress,
					fromOffset: 0,
					howMany: 2,
					toAddress: toAddress,
					toOffset: 0,
					site: 2
				} );

				var transOp = OT.IT.change.move( inOp, siOp );

 				expectOperation( transOp, {
					type: 'change',
					address: newAddress,
					offset: 0,
					howMany: 2,
					attr: 'foo',
					value: 'bar'
				} );
			} );

			it( 'should update address if move-in destination is next to a node from insert path', function() {
				var opAddress = docAdr( [ 0, 2, 0, 1 ] );
				var newAddress = OT.copyAddress( opAddress );
				newAddress[ 4 ] = 3;

				var inOp = OT.createOperation( 'change', {
					address: opAddress,
					offset: 0,
					howMany: 2,
					attr: 'foo',
					value: 'bar',
					site: 1
				} );

				var siOp = OT.createOperation( 'move', {
					fromAddress: fromAddress,
					fromOffset: 0,
					howMany: 2,
					toAddress: toAddress,
					toOffset: 0,
					site: 2
				} );

				var transOp = OT.IT.change.move( inOp, siOp );

 				expectOperation( transOp, {
					type: 'change',
					address: newAddress,
					offset: 0,
					howMany: 2,
					attr: 'foo',
					value: 'bar'
				} );
			} );

			it( 'should get split into two ranges if move-in destination is inside change range', function() {
				var opAddress = OT.copyAddress( toAddress );
				var newAddress = OT.copyAddress( opAddress );

				var inOp = OT.createOperation( 'change', {
					address: opAddress,
					offset: 0,
					howMany: 4,
					attr: 'foo',
					value: 'bar',
					site: 1
				} );

				var siOp = OT.createOperation( 'move', {
					fromAddress: fromAddress,
					fromOffset: 0,
					howMany: 2,
					toAddress: toAddress,
					toOffset: 2,
					site: 2
				} );

				var transOp = OT.IT.change.move( inOp, siOp );

				assert.equal( transOp instanceof Array, true, "Operation got split" );
				assert.equal( transOp.length, 2, "Operation got transformed into two operations" );

				expectOperation( transOp[ 0 ], {
					type: 'change',
					address: newAddress,
					offset: 0,
					howMany: 2,
					attr: 'foo',
					value: 'bar'
				} );

				expectOperation( transOp[ 1 ], {
					type: 'change',
					address: newAddress,
					offset: 4,
					howMany: 2,
					attr: 'foo',
					value: 'bar'
				} );
			} );

			it( 'should get split into two ranges and one of them have it\'s address merged if change range intersects with moved range', function() {
				var opAddress = OT.copyAddress( fromAddress );
				var newAddress = OT.copyAddress( opAddress );
				var newAddress2 = OT.copyAddress( toAddress );

				var inOp = OT.createOperation( 'change', {
					address: opAddress,
					offset: 0,
					howMany: 4,
					attr: 'foo',
					value: 'bar',
					site: 1
				} );

				var siOp = OT.createOperation( 'move', {
					fromAddress: fromAddress,
					fromOffset: 3,
					howMany: 2,
					toAddress: toAddress,
					toOffset: 2,
					site: 2
				} );

				var transOp = OT.IT.change.move( inOp, siOp );

				assert.equal( transOp instanceof Array, true, "Operation got split" );
				assert.equal( transOp.length, 2, "Operation got transformed into two operations" );

				expectOperation( transOp[ 0 ], {
					type: 'change',
					address: newAddress2,
					offset: 2,
					howMany: 1,
					attr: 'foo',
					value: 'bar'
				} );

				expectOperation( transOp[ 1 ], {
					type: 'change',
					address: newAddress,
					offset: 0,
					howMany: 3,
					attr: 'foo',
					value: 'bar'
				} );
			} );

			it( 'should get split into two ranges and one of them have it\'s address merged if change range contains with moved range', function() {
				var opAddress = OT.copyAddress( fromAddress );
				var newAddress = OT.copyAddress( opAddress );
				var newAddress2 = OT.copyAddress( toAddress );

				var inOp = OT.createOperation( 'change', {
					address: opAddress,
					offset: 1,
					howMany: 4,
					attr: 'foo',
					value: 'bar',
					site: 1
				} );

				var siOp = OT.createOperation( 'move', {
					fromAddress: fromAddress,
					fromOffset: 2,
					howMany: 2,
					toAddress: toAddress,
					toOffset: 2,
					site: 2
				} );

				var transOp = OT.IT.change.move( inOp, siOp );

				assert.equal( transOp instanceof Array, true, "Operation got split" );
				assert.equal( transOp.length, 2, "Operation got transformed into two operations" );

				expectOperation( transOp[ 0 ], {
					type: 'change',
					address: newAddress2,
					offset: 2,
					howMany: 2,
					attr: 'foo',
					value: 'bar'
				} );

				expectOperation( transOp[ 1 ], {
					type: 'change',
					address: newAddress,
					offset: 1,
					howMany: 2,
					attr: 'foo',
					value: 'bar'
				} );
			} );

			it( 'should have it\'s address set to destination address and offset updated if change range was contained in move range', function() {
				var opAddress = OT.copyAddress( fromAddress );
				var newAddress = OT.copyAddress( toAddress );

				var inOp = OT.createOperation( 'change', {
					address: opAddress,
					offset: 2,
					howMany: 2,
					attr: 'foo',
					value: 'bar',
					site: 1
				} );

				var siOp = OT.createOperation( 'move', {
					fromAddress: fromAddress,
					fromOffset: 1,
					howMany: 4,
					toAddress: toAddress,
					toOffset: 2,
					site: 2
				} );

				var transOp = OT.IT.change.move( inOp, siOp );

				expectOperation( transOp, {
					type: 'change',
					address: newAddress,
					offset: 3,
					howMany: 2,
					attr: 'foo',
					value: 'bar'
				} );
			} );
		} );

		describe( 'mov x ins', function() {
			var fromAddress, toAddress, newFromAddress, newToAddress, inOp;

			beforeEach( function() {
				fromAddress = docAdr( [ 1, 1 ] );
				newFromAddress = OT.copyAddress( fromAddress );
				toAddress = docAdr( [ 0, 2, 0 ] );
				newToAddress = OT.copyAddress( toAddress );

				inOp = OT.createOperation( 'move', {
					fromAddress: fromAddress,
					fromOffset: 2,
					howMany: 2,
					toAddress: toAddress,
					toOffset: 0,
					site: 1
				} );
			} );

			// insert in different spots than move op
			it( 'should not change if origin and destination are different than insert address', function() {
				var opAddress = docAdr( [ 0, 3 ] );

				var siOp = OT.createOperation( 'insert', {
					address: opAddress,
					offset: 2,
					nodes: [ nodeA, nodeB ],
					howMany: 2,
					site: 2
				} );

				var transOp = OT.IT.move.insert( inOp, siOp );

 				expectOperation( transOp, {
					type: 'move',
					fromAddress: newFromAddress,
					fromOffset: 2,
					howMany: 2,
					toAddress: newToAddress,
					toOffset: 0
				} );
			} );

			// insert inside moved node
			it( 'should not change if insert was inside moved sub-tree', function() {
				var opAddress = docAdr( [ 1, 2, 3, 3 ] );

				var siOp = OT.createOperation( 'insert', {
					address: opAddress,
					offset: 2,
					nodes: [ nodeA, nodeB ],
					howMany: 2,
					site: 2
				} );

				var transOp = OT.IT.move.insert( inOp, siOp );

 				expectOperation( transOp, {
					type: 'move',
					fromAddress: newFromAddress,
					fromOffset: 2,
					howMany: 2,
					toAddress: newToAddress,
					toOffset: 0
				} );
			} );

			// insert next to moved node
			it( 'should increment offset if insert was in the same parent but before moved node', function() {
				var opAddress = docAdr( [ 1, 1 ] );

				var siOp = OT.createOperation( 'insert', {
					address: opAddress,
					offset: 2,
					nodes: [ nodeA, nodeB ],
					howMany: 2,
					site: 2
				} );

				var transOp = OT.IT.move.insert( inOp, siOp );

 				expectOperation( transOp, {
					type: 'move',
					fromAddress: newFromAddress,
					fromOffset: 4,
					howMany: 2,
					toAddress: newToAddress,
					toOffset: 0
				} );
			} );

			// insert next to a path to moved node
			it( 'should update origin path if insert was next to a node on that path', function() {
				var opAddress = docAdr( [ 1 ] );

				var siOp = OT.createOperation( 'insert', {
					address: opAddress,
					offset: 1,
					nodes: [ nodeA, nodeB ],
					howMany: 2,
					site: 2
				} );

				newFromAddress[ 2 ] = 3;

				var transOp = OT.IT.move.insert( inOp, siOp );

 				expectOperation( transOp, {
					type: 'move',
					fromAddress: newFromAddress,
					fromOffset: 2,
					howMany: 2,
					toAddress: newToAddress,
					toOffset: 0
				} );
			} );

			// insert next to destination
			it( 'should increment offset if insert was in the destination node and before move offset', function() {
				var opAddress = docAdr( [ 0, 2, 0 ] );

				var siOp = OT.createOperation( 'insert', {
					address: opAddress,
					offset: 0,
					nodes: [ nodeA, nodeB ],
					howMany: 2,
					site: 2
				} );

				var transOp = OT.IT.move.insert( inOp, siOp );

 				expectOperation( transOp, {
					type: 'move',
					fromAddress: newFromAddress,
					fromOffset: 2,
					howMany: 2,
					toAddress: newToAddress,
					toOffset: 2
				} );
			} );

			// insert next to a path to destination
			it( 'should update destination path if insert was next to a node on that path', function() {
				var opAddress = docAdr( [ 0 ] );

				var siOp = OT.createOperation( 'insert', {
					address: opAddress,
					offset: 0,
					nodes: [ nodeA, nodeB ],
					howMany: 2,
					site: 2
				} );

				newToAddress[ 2 ] = 4;

				var transOp = OT.IT.move.insert( inOp, siOp );

 				expectOperation( transOp, {
					type: 'move',
					fromAddress: newFromAddress,
					fromOffset: 2,
					howMany: 2,
					toAddress: newToAddress,
					toOffset: 0
				} );
			} );

			it( 'should get split into two operations if on site insert was inside moved range', function() {
				var opAddress = docAdr( [ 1, 1 ] );

				var siOp = OT.createOperation( 'insert', {
					address: opAddress,
					offset: 3,
					nodes: [ nodeA, nodeB ],
					howMany: 2,
					site: 2
				} );

				var transOp = OT.IT.move.insert( inOp, siOp );

				assert.equal( transOp instanceof Array, true, "Operation got split" );
				assert.equal( transOp.length, 2, "Operation got transformed into two operations" );


				expectOperation( transOp[ 0 ], {
					type: 'move',
					fromAddress: newFromAddress,
					fromOffset: 2,
					howMany: 1,
					toAddress: newToAddress,
					toOffset: 0
				} );

				expectOperation( transOp[ 1 ], {
					type: 'move',
					fromAddress: newFromAddress,
					fromOffset: 5,
					howMany: 1,
					toAddress: newToAddress,
					toOffset: 0
				} );
			} );
		} );

		describe( 'mov x chn', function() {
			it( 'should not change', function() {
				var inOp = OT.createOperation( 'move', {
					fromAddress: docAdr( [ 0, 1 ] ),
					fromOffset: 0,
					howMany: 2,
					toAddress: docAdr( [ 0, 3 ] ),
					toOffset: 0,
					site: 1
				} );

				var siOp = OT.createOperation( 'change', {
					address: docAdr( [ 0, 1 ] ),
					offset: 0,
					howMany: 2,
					attr: 'foo',
					value: 'bar',
					site: 2
				} );

				var transOp = OT.IT.move.change( inOp, siOp );

 				expectOperation( transOp, {
					type: 'move',
					fromAddress: docAdr( [ 0, 1 ] ),
					fromOffset: 0,
					howMany: 2,
					toAddress: docAdr( [ 0, 3 ] ),
					toOffset: 0
				} );
			} );
		} );

		describe( 'mov x mov', function() {
			var fromAddress, toAddress, fromOffset, toOffset, newFromAddress, newToAddress, inOp, siteMoveAddress;

			beforeEach( function() {
				fromAddress = docAdr( [ 2 ] );
				fromOffset = 2;
				newFromAddress = OT.copyAddress( fromAddress );

				toAddress = docAdr( [ 4 ] );
				toOffset = 2;
				newToAddress = OT.copyAddress( toAddress );

				inOp = OT.createOperation( 'move', {
					fromAddress: fromAddress,
					fromOffset: fromOffset,
					howMany: 2,
					toAddress: toAddress,
					toOffset: toOffset,
					site: 1
				} );

				siteMoveAddress = docAdr( [ 5 ] );
			} );

			// remove in different spots than move op
			it( 'should not change if both operations are happening in different parts of tree', function() {
				var siOp = OT.createOperation( 'move', {
					fromAddress: siteMoveAddress,
					fromOffset: 0,
					howMany: 2,
					toAddress: siteMoveAddress,
					toOffset: 4,
					site: 2
				} );

				var transOp = OT.IT.move.move( inOp, siOp );

 				expectOperation( transOp, {
					type: 'move',
					fromAddress: newFromAddress,
					fromOffset: fromOffset,
					howMany: 2,
					toAddress: newToAddress,
					toOffset: toOffset
				} );
			} );

			describe( 'when incoming move origin node does not and is not contained by on-site move origin node', function() {
				it( 'should increment origin offset if affected by on-site move-to', function() {
					var siOp = OT.createOperation( 'move', {
						fromAddress: siteMoveAddress,
						fromOffset: 0,
						howMany: 2,
						toAddress: fromAddress,
						toOffset: 1,
						site: 2
					} );

					var transOp = OT.IT.move.move( inOp, siOp );

					fromOffset += 2;

					expectOperation( transOp, {
						type: 'move',
						fromAddress: newFromAddress,
						fromOffset: fromOffset,
						howMany: 2,
						toAddress: newToAddress,
						toOffset: toOffset
					} );
				} );

				it( 'should decrement origin offset if affected by on-site move-out', function() {
					var siOp = OT.createOperation( 'move', {
						fromAddress: fromAddress,
						fromOffset: 0,
						howMany: 2,
						toAddress: siteMoveAddress,
						toOffset: 0,
						site: 2
					} );

					var transOp = OT.IT.move.move( inOp, siOp );

					fromOffset -= 2;

 					expectOperation( transOp, {
						type: 'move',
						fromAddress: newFromAddress,
						fromOffset: fromOffset,
						howMany: 2,
						toAddress: newToAddress,
						toOffset: toOffset
					} );
				} );

				it( 'should update origin and destination path if affected by on-site move-to', function() {
					var siOp = OT.createOperation( 'move', {
						fromAddress: siteMoveAddress,
						fromOffset: 0,
						howMany: 2,
						toAddress: docAdr( [ ] ),
						toOffset: 0,
						site: 2
					} );

					var transOp = OT.IT.move.move( inOp, siOp );

					newFromAddress[ 1 ] += 2;
					newToAddress[ 1 ] += 2;

					expectOperation( transOp, {
						type: 'move',
						fromAddress: newFromAddress,
						fromOffset: fromOffset,
						howMany: 2,
						toAddress: newToAddress,
						toOffset: toOffset
					} );
				} );

				it( 'should update origin and destination path if affected by on-site move-out', function() {
					var siOp = OT.createOperation( 'move', {
						fromAddress: docAdr( [ ] ),
						fromOffset: 0,
						howMany: 2,
						toAddress: siteMoveAddress,
						toOffset: 0,
						site: 2
					} );

					var transOp = OT.IT.move.move( inOp, siOp );

					newFromAddress[ 1 ] -= 2;
					newToAddress[ 1 ] -= 2;

 					expectOperation( transOp, {
						type: 'move',
						fromAddress: newFromAddress,
						fromOffset: fromOffset,
						howMany: 2,
						toAddress: newToAddress,
						toOffset: toOffset
					} );
				} );

				it( 'should decrement destination offset if affected by on-site move-out', function() {
					var siOp = OT.createOperation( 'move', {
						fromAddress: toAddress,
						fromOffset: 0,
						howMany: 2,
						toAddress: siteMoveAddress,
						toOffset: 0,
						site: 2
					} );

					var transOp = OT.IT.move.move( inOp, siOp );

					toOffset -= 2;

 					expectOperation( transOp, {
						type: 'move',
						fromAddress: newFromAddress,
						fromOffset: fromOffset,
						howMany: 2,
						toAddress: newToAddress,
						toOffset: toOffset
					} );
				} );

				it( 'should increment destination offset affected by on-site move-to', function() {
					var siOp = OT.createOperation( 'move', {
						fromAddress: siteMoveAddress,
						fromOffset: 0,
						howMany: 2,
						toAddress: toAddress,
						toOffset: 0,
						site: 2
					} );

					var transOp = OT.IT.move.move( inOp, siOp );

					toOffset += 2;

 					expectOperation( transOp, {
						type: 'move',
						fromAddress: newFromAddress,
						fromOffset: fromOffset,
						howMany: 2,
						toAddress: newToAddress,
						toOffset: toOffset
					} );
				} );

				it( 'should get split into two operations if on-site move-to was inside incoming move range', function() {
					var siOp = OT.createOperation( 'move', {
						fromAddress: siteMoveAddress,
						fromOffset: 0,
						howMany: 2,
						toAddress: fromAddress,
						toOffset: 3,
						site: 2
					} );

					var transOp = OT.IT.move.move( inOp, siOp );

					assert.equal( transOp instanceof Array, true, "Operation got split" );
					assert.equal( transOp.length, 2, "Operation got transformed into two operations" );


					expectOperation( transOp[ 0 ], {
						type: 'move',
						fromAddress: newFromAddress,
						fromOffset: fromOffset,
						howMany: 1,
						toAddress: newToAddress,
						toOffset: toOffset
					} );

					expectOperation( transOp[ 1 ], {
						type: 'move',
						fromAddress: newFromAddress,
						fromOffset: fromOffset + 3,
						howMany: 1,
						toAddress: newToAddress,
						toOffset: toOffset
					} );
				} );
			} );

			describe( 'when incoming move origin node sub-tree contains on-site move origin', function() {
				beforeEach( function() {
					siteMoveAddress = OT.copyAddress( fromAddress ).concat( fromOffset + 1 );
				} );

				it( 'should increment origin offset if affected by on-site move-to', function() {
					var siOp = OT.createOperation( 'move', {
						fromAddress: siteMoveAddress,
						fromOffset: 0,
						howMany: 2,
						toAddress: fromAddress,
						toOffset: 1,
						site: 2
					} );

					var transOp = OT.IT.move.move( inOp, siOp );

					fromOffset += 2;

 					expectOperation( transOp, {
						type: 'move',
						fromAddress: newFromAddress,
						fromOffset: fromOffset,
						howMany: 2,
						toAddress: newToAddress,
						toOffset: toOffset
					} );
				} );

				it( 'should update origin and destination path if affected by on-site move-to', function() {
					var siOp = OT.createOperation( 'move', {
						fromAddress: siteMoveAddress,
						fromOffset: 0,
						howMany: 2,
						toAddress: docAdr( [ ] ),
						toOffset: 0,
						site: 2
					} );

					var transOp = OT.IT.move.move( inOp, siOp );

					newFromAddress[ 1 ] += 2;
					newToAddress[ 1 ] += 2;

 					expectOperation( transOp, {
						type: 'move',
						fromAddress: newFromAddress,
						fromOffset: fromOffset,
						howMany: 2,
						toAddress: newToAddress,
						toOffset: toOffset
					} );
				} );

				it( 'should increment destination offset affected by on-site move-to', function() {
					var siOp = OT.createOperation( 'move', {
						fromAddress: siteMoveAddress,
						fromOffset: 0,
						howMany: 2,
						toAddress: toAddress,
						toOffset: 0,
						site: 2
					} );

					var transOp = OT.IT.move.move( inOp, siOp );

					toOffset += 2;

 					expectOperation( transOp, {
						type: 'move',
						fromAddress: newFromAddress,
						fromOffset: fromOffset,
						howMany: 2,
						toAddress: newToAddress,
						toOffset: toOffset
					} );
				} );

				it( 'should get split into two operations if on-site move-to was inside incoming move range', function() {
					var siOp = OT.createOperation( 'move', {
						fromAddress: siteMoveAddress,
						fromOffset: 0,
						howMany: 2,
						toAddress: fromAddress,
						toOffset: 3,
						site: 2
					} );

					var transOp = OT.IT.move.move( inOp, siOp );

					assert.equal( transOp instanceof Array, true, "Operation got split" );
					assert.equal( transOp.length, 2, "Operation got transformed into two operations" );


					expectOperation( transOp[ 0 ], {
						type: 'move',
						fromAddress: newFromAddress,
						fromOffset: fromOffset,
						howMany: 1,
						toAddress: newToAddress,
						toOffset: toOffset
					} );

					expectOperation( transOp[ 1 ], {
						type: 'move',
						fromAddress: newFromAddress,
						fromOffset: fromOffset + 3,
						howMany: 1,
						toAddress: newToAddress,
						toOffset: toOffset
					} );
				} );
			} );

			it( 'should not change if on-site move is from non-affecting position to inside of moved sub-tree', function() {
				var siOp = OT.createOperation( 'move', {
					fromAddress: docAdr( [ ] ),
					fromOffset: 5,
					howMany: 2,
					toAddress: fromAddress.slice().concat( 2 ),
					toOffset: 1,
					site: 2
				} );

				var transOp = OT.IT.move.move( inOp, siOp );

 				expectOperation( transOp, {
					type: 'move',
					fromAddress: newFromAddress,
					fromOffset: fromOffset,
					howMany: 2,
					toAddress: newToAddress,
					toOffset: toOffset
				} );
			} );

			it( 'should update origin address if on-site move origin node sub-tree includes incoming move origin node', function() {
				var siOp = OT.createOperation( 'move', {
					fromAddress: docAdr( [ ] ),
					fromOffset: 1,
					howMany: 2,
					toAddress: docAdr( [ 0 ] ),
					toOffset: 0,
					site: 2
				} );

				var transOp = OT.IT.move.move( inOp, siOp );

				newFromAddress = docAdr( [ 0, 1 ] );
				newToAddress[ 1 ] -= 2;

 				expectOperation( transOp, {
					type: 'move',
					fromAddress: newFromAddress,
					fromOffset: fromOffset,
					howMany: 2,
					toAddress: newToAddress,
					toOffset: toOffset
				} );
			} );

			it( 'should update destination address if incoming move destination is inside of on-site moved sub-tree', function() {
				var siOp = OT.createOperation( 'move', {
					fromAddress: docAdr( [ ] ),
					fromOffset: 3,
					howMany: 2,
					toAddress: docAdr( [ ] ),
					toOffset: 0,
					site: 2
				} );

				var transOp = OT.IT.move.move( inOp, siOp );

				newFromAddress[ 1 ] += 2;
				newToAddress = docAdr( [ 1 ] );

 				expectOperation( transOp, {
					type: 'move',
					fromAddress: newFromAddress,
					fromOffset: fromOffset,
					howMany: 2,
					toAddress: newToAddress,
					toOffset: toOffset
				} );
			} );

			describe( 'when both move operations\' destinations are inside of moved sub-trees', function() {
				it( 'should be changed to operation reversing site-on move', function() {
					var siOp = OT.createOperation( 'move', {
						fromAddress: docAdr( [ ] ),
						fromOffset: 3,
						howMany: 2,
						toAddress: OT.copyAddress( fromAddress ).concat( fromOffset ),
						toOffset: 0,
						site: 2
					} );

					var transOp = OT.IT.move.move( inOp, siOp );

 					expectOperation( transOp, {
						type: 'move',
						fromAddress: newFromAddress.concat( fromOffset ),
						fromOffset: 0,
						howMany: 2,
						toAddress: docAdr( [ ] ),
						toOffset: 3
					} );
				} );
			} );

			describe( 'when both move operations have same range', function() {
				it( 'should be changed to no-op if incoming operation has lower site id', function() {
					var siOp = OT.createOperation( 'move', {
						fromAddress: OT.copyAddress( fromAddress ),
						fromOffset: fromOffset,
						howMany: 2,
						toAddress: docAdr( [ 1, 1, 1 ] ),
						toOffset: 0,
						site: 3
					} );

					var transOp = OT.IT.move.move( inOp, siOp );

 					expectOperation( transOp, {
						type: 'noop',
						address: newFromAddress,
						offset: fromOffset,
						howMany: 2
					} );
				} );

				it( 'should have it\'s origin address changed if incoming operation has higher site id', function() {
					var siOp = OT.createOperation( 'move', {
						fromAddress: OT.copyAddress( fromAddress ),
						fromOffset: fromOffset,
						howMany: 2,
						toAddress: docAdr( [ 5 ] ),
						toOffset: 0,
						site: 0
					} );

					var transOp = OT.IT.move.move( inOp, siOp );

 					expectOperation( transOp, {
						type: 'move',
						fromAddress: docAdr( [ 5 ] ),
						fromOffset: 0,
						howMany: 2,
						toAddress: newToAddress,
						toOffset: toOffset
					} );
				} );
			} );

			describe( 'when incoming range is contained by on-site range', function () {
				it( 'should be changed to no-op if incoming operation has lower site id', function() {
					var siOp = OT.createOperation( 'move', {
						fromAddress: OT.copyAddress( fromAddress ),
						fromOffset: fromOffset - 1,
						howMany: 4,
						toAddress: docAdr( [ 5 ] ),
						toOffset: 1,
						site: 3
					} );

					var transOp = OT.IT.move.move( inOp, siOp );

					expectOperation( transOp, {
						type: 'noop',
						address: newFromAddress,
						offset: fromOffset,
						howMany: 2
					} );
				} );

				it( 'should have it\'s origin address changed if incoming operation has higher site id', function() {
					var siOp = OT.createOperation( 'move', {
						fromAddress: OT.copyAddress( fromAddress ),
						fromOffset: fromOffset - 1,
						howMany: 4,
						toAddress: docAdr( [ 5 ] ),
						toOffset: 1,
						site: 0
					} );

					var transOp = OT.IT.move.move( inOp, siOp );

					expectOperation( transOp, {
						type: 'move',
						fromAddress: docAdr( [ 5 ] ),
						fromOffset: 2,
						howMany: 2,
						toAddress: newToAddress,
						toOffset: toOffset
					} );
				} );
			} );

			// [ incoming range   <   ]   on site range >
			describe( 'when incoming range intersects on right-side with on-site range', function () {
				it( 'should get shrunk if it has lower site id', function() {
					var siOp = OT.createOperation( 'move', {
						fromAddress: OT.copyAddress( fromAddress ),
						fromOffset: fromOffset + 1,
						howMany: 2,
						toAddress: docAdr( [ 5 ] ),
						toOffset: 1,
						site: 3
					} );

					var transOp = OT.IT.move.move( inOp, siOp );

					expectOperation( transOp, {
						type: 'move',
						fromAddress: newFromAddress,
						fromOffset: 2,
						howMany: 1,
						toAddress: newToAddress,
						toOffset: toOffset
					} );
				} );

				it( 'should get split into two operations (one of them with updated address and offset) if it has higher site id', function() {
					var siOp = OT.createOperation( 'move', {
						fromAddress: OT.copyAddress( fromAddress ),
						fromOffset: fromOffset + 1,
						howMany: 2,
						toAddress: docAdr( [ 5 ] ),
						toOffset: 1,
						site: 0
					} );

					var transOp = OT.IT.move.move( inOp, siOp );

					assert.equal( transOp instanceof Array, true, "Operation got split" );
					assert.equal( transOp.length, 2, "Operation got transformed into two operations" );

					expectOperation( transOp[ 0 ], {
						type: 'move',
						fromAddress: newFromAddress,
						fromOffset: 2,
						howMany: 1,
						toAddress: newToAddress,
						toOffset: toOffset
					} );

					expectOperation( transOp[ 1 ], {
						type: 'move',
						fromAddress: docAdr( [ 5 ] ),
						fromOffset: 1,
						howMany: 1,
						toAddress: newToAddress,
						toOffset: toOffset + 1
					} );
				} );
			} );

			// [ on site range   <   ]   incoming range >
			describe( 'when incoming range intersects on left-side with on-site range', function () {
				it( 'should get shrunk if it has lower site id', function() {
					var siOp = OT.createOperation( 'move', {
						fromAddress: OT.copyAddress( fromAddress ),
						fromOffset: fromOffset - 1,
						howMany: 2,
						toAddress: docAdr( [ 5 ] ),
						toOffset: 1,
						site: 3
					} );

					var transOp = OT.IT.move.move( inOp, siOp );

					expectOperation( transOp, {
						type: 'move',
						fromAddress: newFromAddress,
						fromOffset: 1,
						howMany: 1,
						toAddress: newToAddress,
						toOffset: toOffset
					} );
				} );

				it( 'should get split into two operations (one of them with updated address and offset) if it has higher site id', function() {
					var siOp = OT.createOperation( 'move', {
						fromAddress: OT.copyAddress( fromAddress ),
						fromOffset: fromOffset - 1,
						howMany: 2,
						toAddress: docAdr( [ 5 ] ),
						toOffset: 1,
						site: 0
					} );

					var transOp = OT.IT.move.move( inOp, siOp );

					assert.equal( transOp instanceof Array, true, "Operation got split" );
					assert.equal( transOp.length, 2, "Operation got transformed into two operations" );

					expectOperation( transOp[ 0 ], {
						type: 'move',
						fromAddress: newFromAddress,
						fromOffset: 1,
						howMany: 1,
						toAddress: newToAddress,
						toOffset: toOffset
					} );

					expectOperation( transOp[ 1 ], {
						type: 'move',
						fromAddress: docAdr( [ 5 ] ),
						fromOffset: 2,
						howMany: 1,
						toAddress: newToAddress,
						toOffset: toOffset
					} );
				} );
			} );

			describe( 'when incoming range contains on-site range', function () {
				beforeEach( function() {
					inOp.howMany = 4;
				} );

				it( 'should get shrunk if it has lower site id', function() {
					var siOp = OT.createOperation( 'move', {
						fromAddress: OT.copyAddress( fromAddress ),
						fromOffset: fromOffset + 1,
						howMany: 2,
						toAddress: docAdr( [ 5 ] ),
						toOffset: 1,
						site: 3
					} );

					var transOp = OT.IT.move.move( inOp, siOp );

					expectOperation( transOp, {
						type: 'move',
						fromAddress: newFromAddress,
						fromOffset: fromOffset,
						howMany: 2,
						toAddress: newToAddress,
						toOffset: toOffset
					} );
				} );

				it( 'should get split into two operations (one of them with updated address and offset) if it has higher site id', function() {
					var siOp = OT.createOperation( 'move', {
						fromAddress: OT.copyAddress( fromAddress ),
						fromOffset: fromOffset + 1,
						howMany: 2,
						toAddress: docAdr( [ 5 ] ),
						toOffset: 1,
						site: 0
					} );

					var transOp = OT.IT.move.move( inOp, siOp );

					assert.equal( transOp instanceof Array, true, "Operation got split" );
					assert.equal( transOp.length, 2, "Operation got transformed into two operations" );

					expectOperation( transOp[ 0 ], {
						type: 'move',
						fromAddress: newFromAddress,
						fromOffset: fromOffset,
						howMany: 2,
						toAddress: newToAddress,
						toOffset: toOffset
					} );

					expectOperation( transOp[ 1 ], {
						type: 'move',
						fromAddress: docAdr( [ 5 ] ),
						fromOffset: 1,
						howMany: 2,
						toAddress: newToAddress,
						toOffset: toOffset + 1
					} );
				} );
			} );
		} );
	} );
} );