var assert = require( 'assert' );
var OT = require( '../ot.js' );

function insertNodes( parentNode, nodesList ) {
	for ( var i = 0; i < nodesList.length; i++ ) {
		parentNode.addChild( parentNode.getChildCount(), nodesList[ i ] );
	}
}

describe( 'OT', function() {
	var docRoot;
	
	beforeEach( function() {
		// Reset the main root before each test.
		docRoot = new OT.BlockNode( 'body' );
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

	describe( 'operation', function() {
		describe( 'insert', function() {
			it( 'should append given node to a node specified by an address', function() {
				assert.equal( docRoot.getChildCount(), 0 );

				var address = OT.createAddress( docRoot, [ ], 1 );
				OT.OP.insert( address, 0, new OT.BlockNode( 'p' ) );

				assert.equal( docRoot.getChildCount(), 1 );
			} );

			it( 'should append given node at specified offset', function() {
				insertNodes( docRoot, [
					new OT.TextNode( 'a' ), new OT.BlockNode( 'p' )
				] );

				insertNodes( docRoot.getChild( 1 ), [
					new OT.TextNode( 'x' ), new OT.TextNode( 'z' )
				] );

				var address = OT.createAddress( docRoot, [ 1 ], 1 );
				var newNode = new OT.TextNode( 'y' );
				OT.OP.insert( address, 1, newNode );

				assert.equal( docRoot.getChild( 1 ).getChild( 1 ), newNode );
			} );
		} );

		describe( 'remove', function() {
			var address;

			beforeEach( function() {
				address = OT.createAddress( docRoot, [ ], 1 );

				insertNodes( docRoot, [
					new OT.TextNode( 'a' ), new OT.TextNode( 'b' )
				] );
			} );

			it( 'should un-append the node specified by an address', function() {
				OT.OP.remove( address, 0 );

				assert.equal( docRoot.getChildCount(), 1 );
			} );

			it( 'should reassign offsets of children after removing an item', function() {
				OT.OP.remove( address, 0 );

				assert.equal( docRoot.getChild( 0 ).char, 'b' );
			} );
		} );

		describe( 'change', function() {
			var address;

			beforeEach( function() {
				address = OT.createAddress( docRoot, [ 1 ], 1 );

				insertNodes( docRoot, [
					new OT.TextNode( 'a' ), new OT.TextNode( 'b' )
				] );
			} );

			it( 'should change attribute of the node specified by an address', function() {
				OT.OP.change( address, 'foo', 'bar' );

				assert.equal( docRoot.getChild( 1 ).getAttrValue( 'foo' ), 'bar' );
			} );

			it( 'should remove attribute if value was not specified or it was an empty string', function() {
				OT.OP.change( address, 'foo', 'bar' );
				OT.OP.change( address, 'foo' );

				assert.equal( docRoot.getChild( 1 ).getAttrValue( 'foo' ), null );

				OT.OP.change( address, 'foo', 'bar' );
				OT.OP.change( address, 'foo', '' );

				assert.equal( docRoot.getChild( 1 ).getAttrValue( 'foo' ), null );
			} );

			it( 'should overwrite the attribute\'s value if it was already set', function() {
				OT.OP.change( address, 'foo', 'bar' );
				OT.OP.change( address, 'foo', 'xyz' );

				assert.equal( docRoot.getChild( 1 ).getAttrValue( 'foo' ), 'xyz' );
			} );

			it( 'should support adding multiple attributes to one node', function() {
				OT.OP.change( address, 'foo', 'bar' );
				OT.OP.change( address, 'abc', 'xyz' );

				assert.equal( docRoot.getChild( 1 ).getAttrValue( 'foo' ), 'bar' );
				assert.equal( docRoot.getChild( 1 ).getAttrValue( 'abc' ), 'xyz' );
			} );
		} );
	} );



	/*
	 * Second set of tests is testing if operations are correctly transformed against each other.
	 * The way to read descriptions is: <operation> transformed against <operation> should ...
	 * So, "ins x ins" means "insert operation transformed against insert operation" should ...
	 */

	describe( 'IT', function() {
		var addressPair, nodeA, nodeB;

		beforeEach( function() {
			// is in beforeEach because otherwise docRoot is undefined
			addressPair = {
				// address A (0) is different than address B (1)
				diff: [
					OT.createAddress( docRoot, [ 0, 2, 1, 3 ], 1 ),
					OT.createAddress( docRoot, [ 0, 2, 4, 1, 0 ], 2 )
				],

				// address A (0) is a prefix of address B (1)
				prefix: [
					OT.createAddress( docRoot, [ 0, 1, 1 ], 2 ),
					OT.createAddress( docRoot, [ 0, 1, 1, 3 ], 1 )
				],

				// address A (0) is exactly same as B (1)
				same: [
					OT.createAddress( docRoot, [ 0, 2, 3 ], 1 ),
					OT.createAddress( docRoot, [ 0, 2, 3 ], 2 )
				]
			};

			nodeA = new OT.BlockNode( 'a' );
			nodeB = new OT.BlockNode( 'b' );
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

			var doneOp = OT.createOperation( doneOpType, doneOpParams );
			var toTransformOp = OT.createOperation( toTransformOpType, toTransformOpParams );

			return OT.IT[ toTransformOpType ][ doneOpType ]( toTransformOp, doneOp );
		}

		function expectOperation( op, params ) {
			assert.equal( op.type, params.type );
			assert.deepEqual( op.address, params.address );

			if ( op.offset || params.offset ) {
				assert.equal( op.offset, params.offset );
			}

			if ( op.node || params.node ) {
				assert.equal( op.node, params.node );
			}

			if ( op.value || params.value ) {
				assert.equal( op.value, params.value );
			}

			if ( op.attr || params.attr ) {
				assert.equal( op.attr, params.attr );
			}
		}

		describe( 'ins x ins', function() {
			it( 'should not change when addresses are different', function() {
				var adr = addressPair.diff;
				var newAdr = OT.copyAddress( adr[ 1 ] );

				var transOp = getTransformedOp( 'insert', 'insert', {
					address: adr,
					offset: [ 0, 2 ],
					node: [ nodeA, nodeB ]
				} );

				expectOperation( transOp, {
					type: 'insert',
					address: newAdr,
					offset: 2,
					node: nodeB
				} );
			} );

			it( 'should increment offset if addresses are same and offset is after applied operation', function() {
				var adr = addressPair.same;
				var newAdr = OT.copyAddress( adr[ 1 ] );

				var transOp = getTransformedOp( 'insert', 'insert', {
					address: adr,
					offset: [ 0, 2 ],
					node: [ nodeA, nodeB ]
				} );

				expectOperation( transOp, {
					type: 'insert',
					address: newAdr,
					offset: 3,
					node: nodeB
				} );
			} );

			it( 'should not increment offset if addresses are same and offset is before applied operation', function() {
				var adr = addressPair.same;
				var newAdr = OT.copyAddress( adr[ 1 ] );

				var transOp = getTransformedOp( 'insert', 'insert', {
					address: adr,
					offset: [ 2, 0 ],
					node: [ nodeA, nodeB ]
				} );

				expectOperation( transOp, {
					type: 'insert',
					address: newAdr,
					offset: 0,
					node: nodeB
				} );
			} );

			it( 'should update address at node(i) if applied operation\'s address was a prefix and its offset is before node(i)', function() {
				var adr = addressPair.prefix;
				var newAdr = OT.copyAddress( adr[ 1 ] );

				var transOp = getTransformedOp( 'insert', 'insert', {
					address: adr,
					offset: [ 0, 2 ],
					node: [ nodeA, nodeB ]
				} );

				newAdr.path[ 3 ] = 4;

				expectOperation( transOp, {
					type: 'insert',
					address: newAdr,
					offset: 2,
					node: nodeB
				} );
			} );
		} );

		describe( 'ins x rmv', function() {
			it( 'should not change when addresses are different', function() {
				var adr = addressPair.diff;
				var newAdr = OT.copyAddress( adr[ 1 ] );

				var transOp = getTransformedOp( 'remove', 'insert', {
					address: adr,
					offset: [ 0, 2 ],
					node: [ nodeA, nodeB ]
				} );

				expectOperation( transOp, {
					type: 'insert',
					address: newAdr,
					offset: 2,
					node: nodeB
				} );
			} );

			it( 'should decrement offset if addresses are same and offset is after applied operation', function() {
				var adr = addressPair.same;
				var newAdr = OT.copyAddress( adr[ 1 ] );

				var transOp = getTransformedOp( 'remove', 'insert', {
					address: adr,
					offset: [ 0, 2 ],
					node: [ nodeA, nodeB ]
				} );

				expectOperation( transOp, {
					type: 'insert',
					address: newAdr,
					offset: 1,
					node: nodeB
				} );
			} );

			it( 'should not decrement offset if addresses are same and offset is before applied operation', function() {
				var adr = addressPair.same;
				var newAdr = OT.copyAddress( adr[ 1 ] );

				var transOp = getTransformedOp( 'remove', 'insert', {
					address: adr,
					offset: [ 2, 0 ],
					node: [ nodeA, nodeB ]
				} );

				expectOperation( transOp, {
					type: 'insert',
					address: newAdr,
					offset: 0,
					node: nodeB
				} );
			} );

			it( 'should update address at node(i) if applied operation\'s address was a prefix and its offset is before node(i)', function() {
				var adr = addressPair.prefix;
				var newAdr = OT.copyAddress( adr[ 1 ] );

				var transOp = getTransformedOp( 'remove', 'insert', {
					address: adr,
					offset: [ 0, 2 ],
					node: [ nodeA, nodeB ]
				} );

				newAdr.path[ 3 ] = 2;

				expectOperation( transOp, {
					type: 'insert',
					address: newAdr,
					offset: 2,
					node: nodeB
				} );
			} );

			it( 'should update address if one of nodes on the address path was removed', function() {
				var adr = addressPair.prefix;
				var newAdr = OT.createAddress( nodeA, [ ], adr[ 1 ].site );

				var transOp = getTransformedOp( 'remove', 'insert', {
					address: adr,
					offset: [ 3, 2 ],
					node: [ nodeA, nodeB ]
				} );

				expectOperation( transOp, {
					type: 'insert',
					address: newAdr,
					offset: 2,
					node: nodeB
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
					node: [ nodeA, nodeB ]
				} );

				expectOperation( transOp, {
					type: 'insert',
					address: newAdr,
					offset: 2,
					node: nodeB
				} );
			} );
		} );

		describe( 'rmv x ins', function() {
			it( 'should not change when addresses are different', function() {
				var adr = addressPair.diff;
				var newAdr = OT.copyAddress( adr[ 1 ] );

				var transOp = getTransformedOp( 'insert', 'remove', {
					address: adr,
					offset: [ 0, 2 ],
					node: [ nodeA, nodeB ]
				} );

				expectOperation( transOp, {
					type: 'remove',
					address: newAdr,
					offset: 2,
					node: nodeB
				} );
			} );

			it( 'should increment offset if addresses are same and offset is after applied operation', function() {
				var adr = addressPair.same;
				var newAdr = OT.copyAddress( adr[ 1 ] );

				var transOp = getTransformedOp( 'insert', 'remove', {
					address: adr,
					offset: [ 0, 2 ],
					node: [ nodeA, nodeB ]
				} );

				expectOperation( transOp, {
					type: 'remove',
					address: newAdr,
					offset: 3,
					node: nodeB
				} );
			} );

			it( 'should not increment offset if addresses are same and offset is before applied operation', function() {
				var adr = addressPair.same;
				var newAdr = OT.copyAddress( adr[ 1 ] );

				var transOp = getTransformedOp( 'insert', 'remove', {
					address: adr,
					offset: [ 2, 0 ],
					node: [ nodeA, nodeB ]
				} );

				expectOperation( transOp, {
					type: 'remove',
					address: newAdr,
					offset: 0,
					node: nodeB
				} );
			} );

			it( 'should update address at node(i) if applied operation\'s address was a prefix and its offset is before node(i)', function() {
				var adr = addressPair.prefix;
				var newAdr = OT.copyAddress( adr[ 1 ] );

				var transOp = getTransformedOp( 'insert', 'remove', {
					address: adr,
					offset: [ 0, 2 ],
					node: [ nodeA, nodeB ]
				} );

				newAdr.path[ 3 ] = 4;

				expectOperation( transOp, {
					type: 'remove',
					address: newAdr,
					offset: 2,
					node: nodeB
				} );
			} );
		} );

		describe( 'rmv x rmv', function() {
			it( 'should not change when addresses are different', function() {
				var adr = addressPair.diff;
				var newAdr = OT.copyAddress( adr[ 1 ] );

				var transOp = getTransformedOp( 'remove', 'remove', {
					address: adr,
					offset: [ 0, 2 ],
					node: [ nodeA, nodeB ]
				} );

				expectOperation( transOp, {
					type: 'remove',
					address: newAdr,
					offset: 2,
					node: nodeB
				} );
			} );

			it( 'should decrement offset if addresses are same and offset is after applied operation', function() {
				var adr = addressPair.same;
				var newAdr = OT.copyAddress( adr[ 1 ] );

				var transOp = getTransformedOp( 'remove', 'remove', {
					address: adr,
					offset: [ 0, 2 ],
					node: [ nodeA, nodeB ]
				} );

				expectOperation( transOp, {
					type: 'remove',
					address: newAdr,
					offset: 1,
					node: nodeB
				} );
			} );

			it( 'should not decrement offset if addresses are same and offset is before applied operation', function() {
				var adr = addressPair.same;
				var newAdr = OT.copyAddress( adr[ 1 ] );

				var transOp = getTransformedOp( 'remove', 'remove', {
					address: adr,
					offset: [ 2, 0 ],
					node: [ nodeA, nodeB ]
				} );

				expectOperation( transOp, {
					type: 'remove',
					address: newAdr,
					offset: 0,
					node: nodeB
				} );
			} );

			it( 'should update address at node(i) if applied operation\'s address was a prefix and its offset is before node(i)', function() {
				var adr = addressPair.prefix;
				var newAdr = OT.copyAddress( adr[ 1 ] );

				var transOp = getTransformedOp( 'remove', 'remove', {
					address: adr,
					offset: [ 0, 2 ],
					node: [ nodeA, nodeB ]
				} );

				newAdr.path[ 3 ] = 2;

				expectOperation( transOp, {
					type: 'remove',
					address: newAdr,
					offset: 2,
					node: nodeB
				} );
			} );

			it( 'should update address if one of nodes on the address path was removed', function() {
				var adr = addressPair.prefix;
				var newAdr = OT.createAddress( nodeA, [ ], adr[ 1 ].site );

				var transOp = getTransformedOp( 'remove', 'remove', {
					address: adr,
					offset: [ 3, 2 ],
					node: [ nodeA, nodeB ]
				} );

				expectOperation( transOp, {
					type: 'remove',
					address: newAdr,
					offset: 2,
					node: nodeB
				} );
			} );

			it( 'should become do-nothing operation if the other remove operations is exactly the same', function() {
				var adr = addressPair.same;
				var newAdr = OT.copyAddress( adr[ 1 ] );

				var transOp = getTransformedOp( 'remove', 'remove', {
					address: adr,
					offset: [ 1, 1 ],
					node: [ nodeA, nodeB ]
				} );

				expectOperation( transOp, {
					type: 'change',
					address: newAdr,
					attr: '',
					value: ''
				} );
			} );
		} );

		describe( 'rmv x chn', function() {
			it( 'should not change', function() {
				var adr = addressPair.same;
				var newAdr = OT.copyAddress( adr[ 1 ] );

				var transOp = getTransformedOp( 'change', 'remove', {
					address: adr,
					offset: [ 2, 2 ],
					node: [ nodeA, nodeB ]
				} );

				expectOperation( transOp, {
					type: 'remove',
					address: newAdr,
					offset: 2,
					node: nodeB
				} );
			} );
		} );

		describe( 'chn x ins', function() {
			it( 'should not change when addresses are different', function() {
				var adr = addressPair.diff;

				// Add "offset" to the address instead because change operation
				// does not take offset parameter, expecting only and address to changed node.
				adr[ 1 ].path = adr[ 1 ].path.concat( 2 );

				var newAdr = OT.copyAddress( adr[ 1 ] );

				var transOp = getTransformedOp( 'insert', 'change', {
					address: adr,
					offset: [ 0, null ],
					node: [ nodeA, null ],
					attr: [ null, 'foo' ],
					value: [ null, 'bar' ]
				} );

				expectOperation( transOp, {
					type: 'change',
					address: newAdr,
					attr: 'foo',
					value: 'bar'
				} );
			} );

			it( 'should update address if insert offset was before changed node', function() {
				var adr = addressPair.same;

				// Add "offset" to the address instead because change operation
				// does not take offset parameter, expecting only and address to changed node.
				adr[ 1 ].path = adr[ 1 ].path.concat( 2 );

				var newAdr = OT.copyAddress( adr[ 1 ] );
				newAdr.path[ 3 ] = 3;

				var transOp = getTransformedOp( 'insert', 'change', {
					address: adr,
					offset: [ 0, null ],
					node: [ nodeA, null ],
					attr: [ null, 'foo' ],
					value: [ null, 'bar' ]
				} );

				expectOperation( transOp, {
					type: 'change',
					address: newAdr,
					attr: 'foo',
					value: 'bar'
				} );
			} );

			it( 'should not update address if insert offset was after changed node', function() {
				var adr = addressPair.same;

				// Add "offset" to the address instead because change operation
				// does not take offset parameter, expecting only and address to changed node.
				adr[ 1 ].path = adr[ 1 ].path.concat( 0 );

				var newAdr = OT.copyAddress( adr[ 1 ] );

				var transOp = getTransformedOp( 'insert', 'change', {
					address: adr,
					offset: [ 2, null ],
					node: [ nodeA, null ],
					attr: [ null, 'foo' ],
					value: [ null, 'bar' ]
				} );

				expectOperation( transOp, {
					type: 'change',
					address: newAdr,
					attr: 'foo',
					value: 'bar'
				} );
			} );

			it( 'should update address at node(i) if applied operation\'s address was a prefix and its offset is before node(i)', function() {
				var adr = addressPair.prefix;

				// Add "offset" to the address instead because change operation
				// does not take offset parameter, expecting only and address to changed node.
				adr[ 1 ].path = adr[ 1 ].path.concat( 0 );

				var newAdr = OT.copyAddress( adr[ 1 ] );
				newAdr.path[ 3 ] = 4;

				var transOp = getTransformedOp( 'insert', 'change', {
					address: adr,
					offset: [ 0, null ],
					node: [ nodeA, null ],
					attr: [ null, 'foo' ],
					value: [ null, 'bar' ]
				} );

				expectOperation( transOp, {
					type: 'change',
					address: newAdr,
					attr: 'foo',
					value: 'bar'
				} );
			} );
		} );

		describe( 'chn x rmv', function() {
			it( 'should not change when addresses are different', function() {
				var adr = addressPair.diff;

				// Add "offset" to the address instead because change operation
				// does not take offset parameter, expecting only and address to changed node.
				adr[ 1 ].path = adr[ 1 ].path.concat( 2 );

				var newAdr = OT.copyAddress( adr[ 1 ] );

				var transOp = getTransformedOp( 'remove', 'change', {
					address: adr,
					offset: [ 0, null ],
					node: [ nodeA, null ],
					attr: [ null, 'foo' ],
					value: [ null, 'bar' ]
				} );

				expectOperation( transOp, {
					type: 'change',
					address: newAdr,
					attr: 'foo',
					value: 'bar'
				} );
			} );

			it( 'should update address if remove offset was before changed node', function() {
				var adr = addressPair.same;

				// Add "offset" to the address instead because change operation
				// does not take offset parameter, expecting only and address to changed node.
				adr[ 1 ].path = adr[ 1 ].path.concat( 2 );

				var newAdr = OT.copyAddress( adr[ 1 ] );
				newAdr.path[ 3 ] = 1;

				var transOp = getTransformedOp( 'remove', 'change', {
					address: adr,
					offset: [ 0, null ],
					node: [ nodeA, null ],
					attr: [ null, 'foo' ],
					value: [ null, 'bar' ]
				} );

				expectOperation( transOp, {
					type: 'change',
					address: newAdr,
					attr: 'foo',
					value: 'bar'
				} );
			} );

			it( 'should not update address if remove offset was after changed node', function() {
				var adr = addressPair.same;

				// Add "offset" to the address instead because change operation
				// does not take offset parameter, expecting only and address to changed node.
				adr[ 1 ].path = adr[ 1 ].path.concat( 0 );

				var newAdr = OT.copyAddress( adr[ 1 ] );

				var transOp = getTransformedOp( 'remove', 'change', {
					address: adr,
					offset: [ 2, null ],
					node: [ nodeA, null ],
					attr: [ null, 'foo' ],
					value: [ null, 'bar' ]
				} );

				expectOperation( transOp, {
					type: 'change',
					address: newAdr,
					attr: 'foo',
					value: 'bar'
				} );
			} );

			it( 'should update address at node(i) if applied operation\'s address was a prefix and its offset is before node(i)', function() {
				var adr = addressPair.prefix;

				// Add "offset" to the address instead because change operation
				// does not take offset parameter, expecting only and address to changed node.
				adr[ 1 ].path = adr[ 1 ].path.concat( 0 );

				var newAdr = OT.copyAddress( adr[ 1 ] );
				newAdr.path[ 3 ] = 2;

				var transOp = getTransformedOp( 'remove', 'change', {
					address: adr,
					offset: [ 0, null ],
					node: [ nodeA, null ],
					attr: [ null, 'foo' ],
					value: [ null, 'bar' ]
				} );

				expectOperation( transOp, {
					type: 'change',
					address: newAdr,
					attr: 'foo',
					value: 'bar'
				} );
			} );

			it( 'should update address if one of nodes on the address path was removed', function() {
				var adr = addressPair.prefix;

				// Add "offset" to the address instead because change operation
				// does not take offset parameter, expecting only and address to changed node.
				adr[ 1 ].path = adr[ 1 ].path.concat( 0 );

				var newAdr = OT.createAddress( nodeA, [ 0 ], adr[ 1 ].site );

				var transOp = getTransformedOp( 'remove', 'change', {
					address: adr,
					offset: [ 3, null ],
					node: [ nodeA, null ],
					attr: [ null, 'foo' ],
					value: [ null, 'bar' ]
				} );

				expectOperation( transOp, {
					type: 'change',
					address: newAdr,
					attr: 'foo',
					value: 'bar'
				} );
			} );
		} );

		describe( 'chn x chn', function() {
			it( 'should not change if address is same but attribute is different', function() {
				var adr = addressPair.same;
				var newAdr = OT.copyAddress( adr[ 1 ] );

				var transOp = getTransformedOp( 'change', 'change', {
					address: adr,
					attr: [ 'abc', 'foo' ],
					value: [ 'xyz', 'bar' ]
				} );

				expectOperation( transOp, {
					type: 'change',
					address: newAdr,
					attr: 'foo',
					value: 'bar'
				} );
			} );

			it( 'should not become do-nothing operation if address and attribute is same but value is different and address site is higher', function() {
				var adr = addressPair.same;
				var newAdr = OT.copyAddress( adr[ 1 ] );

				var transOp = getTransformedOp( 'change', 'change', {
					address: adr,
					attr: [ 'foo', 'foo' ],
					value: [ 'bar', 'xyz' ]
				} );

				expectOperation( transOp, {
					type: 'change',
					address: newAdr,
					attr: 'foo',
					value: 'xyz'
				} );
			} );

			it( 'should become do-nothing operation if address and attribute is same but value is different and address site is lower', function() {
				var adr = addressPair.same;
				adr[ 1 ].site = 0;
				var newAdr = OT.copyAddress( adr[ 1 ] );

				var transOp = getTransformedOp( 'change', 'change', {
					address: adr,
					attr: [ 'foo', 'foo' ],
					value: [ 'bar', 'xyz' ]
				} );

				expectOperation( transOp, {
					type: 'change',
					address: newAdr,
					attr: '',
					value: ''
				} );
			} );
		} );
	} );
} );