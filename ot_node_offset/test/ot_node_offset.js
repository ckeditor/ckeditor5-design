var assert = require( 'assert' );
var OT = require( '../ot_node_offset.js' );

function insertNodes( parentNode, nodesList ) {
	for ( var i = 0; i < nodesList.length; i++ ) {
		parentNode.addChild( parentNode.getChildCount(), nodesList[ i ] );
	}
}

describe( 'OT node-offset', function() {
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

	describe( 'OP (operation)', function() {
		describe( 'insert', function() {
			it( 'should append given node to the given parent-node', function() {
				assert.equal( docRoot.getChildCount(), 0 );

				OT.OP.insert( docRoot, 0, new OT.BlockNode( 'p' ) );

				assert.equal( docRoot.getChildCount(), 1 );
			} );

			it( 'should append given node at specified offset', function() {
				insertNodes( docRoot, [
					new OT.TextNode( 'a' ), new OT.TextNode( 'b' ), new OT.TextNode( 'c' )
				] );

				var newNode = new OT.TextNode( 'y' );
				OT.OP.insert( docRoot, 2, newNode );

				assert.equal( docRoot.getChild( 2 ), newNode );
			} );
		} );

		describe( 'remove', function() {
			beforeEach( function() {
				insertNodes( docRoot, [
					new OT.TextNode( 'a' ), new OT.TextNode( 'b' )
				] );
			} );

			it( 'should un-append the node specified by offset', function() {
				OT.OP.remove( docRoot, 0 );

				assert.equal( docRoot.getChildCount(), 1 );
			} );

			it( 'should reassign offsets of children after removing an item', function() {
				OT.OP.remove( docRoot, 0 );

				assert.equal( docRoot.getChild( 0 ).char, 'b' );
			} );
		} );

		describe( 'change', function() {
			var node;
			beforeEach( function() {
				node = new OT.TextNode( 'b' );
				insertNodes( docRoot, [
					new OT.TextNode( 'a' ), node
				] );
			} );

			it( 'should change attribute of the node specified by an address', function() {
				OT.OP.change( node, 'foo', 'bar' );

				assert.equal( docRoot.getChild( 1 ).getAttrValue( 'foo' ), 'bar' );
			} );

			it( 'should remove attribute if value was not specified or it was an empty string', function() {
				OT.OP.change( node, 'foo', 'bar' );
				OT.OP.change( node, 'foo' );

				assert.equal( docRoot.getChild( 1 ).getAttrValue( 'foo' ), null );

				OT.OP.change( node, 'foo', 'bar' );
				OT.OP.change( node, 'foo', '' );

				assert.equal( docRoot.getChild( 1 ).getAttrValue( 'foo' ), null );
			} );

			it( 'should overwrite the attribute\'s value if it was already set', function() {
				OT.OP.change( node, 'foo', 'bar' );
				OT.OP.change( node, 'foo', 'xyz' );

				assert.equal( docRoot.getChild( 1 ).getAttrValue( 'foo' ), 'xyz' );
			} );

			it( 'should support adding multiple attributes to one node', function() {
				OT.OP.change( node, 'foo', 'bar' );
				OT.OP.change( node, 'abc', 'xyz' );

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

	describe( 'IT (inclusion transformation)', function() {
		var nodesPair, nodeA, nodeB;

		beforeEach( function() {
			insertNodes( docRoot, [ new OT.BlockNode( 'p' ), new OT.BlockNode( 'p' ) ] );
			insertNodes( docRoot.getChild( 0 ), [ new OT.BlockNode( 'p' ), new OT.BlockNode( 'p' ) ] );
			insertNodes( docRoot.getChild( 1 ), [ new OT.BlockNode( 'p' ), new OT.BlockNode( 'p' ) ] );

			// is in beforeEach because otherwise docRoot is undefined
			nodesPair = {
				// node A (0) is at different address than node B (1)
				diff: [
					docRoot.getChild( 0 ).getChild( 1 ),
					docRoot.getChild( 1 ).getChild( 0 )
				],

				// node A (0) is an ancestor of node B (1)
				prefix: [
					docRoot.getChild( 0 ),
					docRoot.getChild( 0 ).getChild( 1 )
				],

				// node A (0) and node B (1) are same
				same: [
					docRoot.getChild( 1 ),
					docRoot.getChild( 1 )
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

		describe( 'ins x ins', function() {
			it( 'should not change offset when targets are different', function() {
				var transOp = getTransformedOp( 'insert', 'insert', {
					target: nodesPair.diff,
					offset: [ 0, 2 ],
					node: [ nodeA, nodeB ],
					site: [ 1, 2 ]
				} );

				assert.equal( transOp.offset, 2 );
			} );

			it( 'should increment offset if targets are same and offset is after applied operation', function() {
				var transOp = getTransformedOp( 'insert', 'insert', {
					address: nodesPair.same,
					offset: [ 0, 2 ],
					node: [ nodeA, nodeB ],
					site: [ 1, 2 ]
				} );

				assert.equal( transOp.offset, 3 );
			} );

			it( 'should not increment offset if addresses are same and offset is before applied operation', function() {
				var transOp = getTransformedOp( 'insert', 'insert', {
					address: nodesPair.same,
					offset: [ 2, 0 ],
					node: [ nodeA, nodeB ],
					site: [ 1, 2 ]
				} );

				assert.equal( transOp.offset, 0 );
			} );

			it( 'should not change if applied operation\'s target was an ancestor of this operation\'s target', function() {
				var transOp = getTransformedOp( 'insert', 'insert', {
					target: nodesPair.prefix,
					offset: [ 0, 2 ],
					node: [ nodeA, nodeB ],
					site: [ 1, 2 ]
				} );

				assert.equal( transOp.target, nodesPair.prefix[ 1 ] );
				assert.equal( transOp.offset, 2 );
			} );
		} );

		describe( 'ins x rmv', function() {
			it( 'should not change offset when targets are different', function() {
				var transOp = getTransformedOp( 'remove', 'insert', {
					target: nodesPair.diff,
					offset: [ 0, 2 ],
					node: [ null, nodeB ],
					site: [ 1, 2 ]
				} );

				assert.equal( transOp.offset, 2 );
			} );

			it( 'should decrement offset if targets are same and offset is after applied operation', function() {
				var transOp = getTransformedOp( 'remove', 'insert', {
					target: nodesPair.same,
					offset: [ 0, 2 ],
					node: [ null, nodeB ],
					site: [ 1, 2 ]
				} );

				assert.equal( transOp.offset, 1 );
			} );

			it( 'should not decrement offset if addresses are same and offset is before applied operation', function() {
				var transOp = getTransformedOp( 'remove', 'insert', {
					target: nodesPair.same,
					offset: [ 2, 0 ],
					node: [ null, nodeB ],
					site: [ 1, 2 ]
				} );

				assert.equal( transOp.offset, 0 );
			} );

			it( 'should not change if this operation\'s parent got removed', function() {
				var transOp = getTransformedOp( 'remove', 'insert', {
					target: nodesPair.prefix,
					offset: [ 1, 2 ],
					node: [ null, nodeB ],
					site: [ 1, 2 ]
				} );

				assert.equal( transOp.target, nodesPair.prefix[ 1 ] );
				assert.equal( transOp.offset, 2 );
			} );
		} );

		describe( 'ins x chn', function() {
			it( 'should not change', function() {
				var transOp = getTransformedOp( 'change', 'insert', {
					target: nodesPair.same,
					offset: [ 0, 0 ],
					node: [ null, nodeB ],
					site: [ 1, 2 ]
				} );

				assert.equal( transOp.target, nodesPair.same[ 1 ] );
				assert.equal( transOp.offset, 0 );
			} );
		} );

		describe( 'rmv x ins', function() {
			it( 'should not change offset when targets are different', function() {
				var transOp = getTransformedOp( 'insert', 'remove', {
					target: nodesPair.diff,
					offset: [ 0, 2 ],
					node: [ nodeA, null ],
					site: [ 1, 2 ]
				} );

				assert.equal( transOp.offset, 2 );
			} );

			it( 'should increment offset if targets are same and offset is after applied operation', function() {
				var transOp = getTransformedOp( 'insert', 'remove', {
					target: nodesPair.same,
					offset: [ 0, 2 ],
					node: [ nodeA, null ],
					site: [ 1, 2 ]
				} );

				assert.equal( transOp.offset, 3 );
			} );

			it( 'should increment offset if addresses are same and offset is same as applied operation', function() {
				var transOp = getTransformedOp( 'insert', 'remove', {
					target: nodesPair.same,
					offset: [ 2, 2 ],
					node: [ nodeA, null ],
					site: [ 1, 2 ]
				} );

				assert.equal( transOp.offset, 3 );
			} );

			it( 'should not increment offset if addresses are same and offset is before applied operation', function() {
				var transOp = getTransformedOp( 'insert', 'remove', {
					target: nodesPair.same,
					offset: [ 2, 0 ],
					node: [ nodeA, null ],
					site: [ 1, 2 ]
				} );

				assert.equal( transOp.offset, 0 );
			} );

			it( 'should not change if applied operation\'s target was an ancestor of this operation\'s target', function() {
				var transOp = getTransformedOp( 'insert', 'remove', {
					target: nodesPair.prefix,
					offset: [ 0, 2 ],
					node: [ nodeA, null ],
					site: [ 1, 2 ]
				} );

				assert.equal( transOp.target, nodesPair.prefix[ 1 ] );
				assert.equal( transOp.offset, 2 );
			} );
		} );

		describe( 'rmv x rmv', function() {
			it( 'should not change offset when targets are different', function() {
				var transOp = getTransformedOp( 'remove', 'remove', {
					target: nodesPair.diff,
					offset: [ 0, 2 ],
					site: [ 1, 2 ]
				} );

				assert.equal( transOp.offset, 2 );
			} );

			it( 'should decrement offset if targets are same and offset is after applied operation', function() {
				var transOp = getTransformedOp( 'remove', 'remove', {
					target: nodesPair.same,
					offset: [ 0, 2 ],
					site: [ 1, 2 ]
				} );

				assert.equal( transOp.offset, 1 );
			} );

			it( 'should not decrement offset if targets are same and offset is before applied operation', function() {
				var transOp = getTransformedOp( 'remove', 'remove', {
					target: nodesPair.same,
					offset: [ 2, 0 ],
					site: [ 1, 2 ]
				} );

				assert.equal( transOp.offset, 0 );
			} );

			it( 'should not change if this operation\'s parent got removed', function() {
				var transOp = getTransformedOp( 'remove', 'remove', {
					target: nodesPair.prefix,
					offset: [ 1, 2 ],
					node: [ null, nodeB ],
					site: [ 1, 2 ]
				} );

				assert.equal( transOp.target, nodesPair.prefix[ 1 ] );
				assert.equal( transOp.offset, 2 );
			} );

			it( 'should become do-nothing operation if the other remove operations is exactly the same', function() {
				var transOp = getTransformedOp( 'remove', 'remove', {
					target: nodesPair.same,
					offset: [ 0, 0 ],
					site: [ 1, 2 ]
				} );

				assert.equal( transOp.type, 'change' );
				assert.equal( transOp.target, nodesPair.same[ 1 ] );
				assert.equal( transOp.attr, '' );
				assert.equal( transOp.value, '' );
			} );
		} );

		describe( 'rmv x chn', function() {
			it( 'should not change', function() {
				var transOp = getTransformedOp( 'change', 'remove', {
					target: nodesPair.same,
					offset: [ 0, 0 ],
					node: [ null, nodeB ],
					site: [ 1, 2 ]
				} );

				assert.equal( transOp.target, nodesPair.same[ 1 ] );
				assert.equal( transOp.offset, 0 );
			} );
		} );

		describe( 'chn x ins', function() {
			it( 'should not change', function () {
				var target = docRoot.getChild( 0 ).getChild( 0 );
				var transOp = getTransformedOp( 'insert', 'change', {
					target: [ docRoot.getChild( 0 ), target ],
					offset: [ 0, null ],
					node: [ nodeA, null ],
					attr: [ null, 'foo' ],
					value: [ null, 'bar' ],
					site: [ 1, 2 ]
				} );

				assert.equal( transOp.type, 'change' );
				assert.equal( transOp.target, target );
				assert.equal( transOp.attr, 'foo' );
				assert.equal( transOp.value, 'bar' );
			} );
		} );

		describe( 'chn x rmv', function() {
			it( 'should not change', function() {
				var target = docRoot.getChild( 0 ).getChild( 0 );
				var transOp = getTransformedOp( 'remove', 'change', {
					target: [ docRoot.getChild( 0 ), target ],
					offset: [ 0, null ],
					attr: [ null, 'foo' ],
					value: [ null, 'bar' ],
					site: [ 1, 2 ]
				} );

				assert.equal( transOp.type, 'change' );
				assert.equal( transOp.target, target );
				assert.equal( transOp.attr, 'foo' );
				assert.equal( transOp.value, 'bar' );
			} );
		} );

		describe( 'chn x chn', function() {
			it( 'should not change if target is same but attribute is different', function() {
				var target = docRoot.getChild( 0 ).getChild( 0 );

				var transOp = getTransformedOp( 'change', 'change', {
					target: [ target, target ],
					attr: [ 'abc', 'foo' ],
					value: [ 'xyz', 'bar' ],
					site: [ 1, 2 ]
				} );

				assert.equal( transOp.type, 'change' );
				assert.equal( transOp.target, target );
				assert.equal( transOp.attr, 'foo' );
				assert.equal( transOp.value, 'bar' );
			} );

			it( 'should not become do-nothing operation if target and attribute are same but value is different and site is higher', function() {
				var target = docRoot.getChild( 0 ).getChild( 0 );

				var transOp = getTransformedOp( 'change', 'change', {
					target: [ target, target ],
					attr: [ 'foo', 'foo' ],
					value: [ 'xyz', 'bar' ],
					site: [ 1, 2 ]
				} );

				assert.equal( transOp.type, 'change' );
				assert.equal( transOp.target, target );
				assert.equal( transOp.attr, 'foo' );
				assert.equal( transOp.value, 'bar' );
			} );

			it( 'should become do-nothing operation if address and attribute is same but value is different and address site is lower', function() {
				var target = docRoot.getChild( 0 ).getChild( 0 );

				var transOp = getTransformedOp( 'change', 'change', {
					target: [ target, target ],
					attr: [ 'foo', 'foo' ],
					value: [ 'xyz', 'bar' ],
					site: [ 2, 1 ]
				} );

				assert.equal( transOp.type, 'change' );
				assert.equal( transOp.target, target );
				assert.equal( transOp.attr, '' );
				assert.equal( transOp.value, '' );
			} );
		} );
	} );
} );