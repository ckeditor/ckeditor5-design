bender.require( [
	'nodemanager'
], function(
	nodeManager
) {
	'use strict';

	function FooNode( data ) {
		this.data = data;
	}
	FooNode.type = 'foo';

	function FooNode2() {}
	FooNode2.type = 'foo';

	function BarNode() {}
	BarNode.type = 'bar';

	function BazNode() {}
	BazNode.type = 'baz';

	describe( 'nodeManager', function() {
		beforeEach( function() {
			nodeManager.clear();
		} );

		it( 'should register a node', function() {
			expect( nodeManager.list() ).to.have.length( 0 );

			nodeManager.register( FooNode );
			nodeManager.register( BarNode );

			expect( nodeManager.list() ).to.deep.equal( [ 'foo', 'bar' ] );
		} );

		it( 'should override a node with the same type', function() {
			nodeManager.register( FooNode );

			expect( nodeManager.get( 'foo' ) ).to.equal( FooNode );

			nodeManager.register( FooNode2 );

			expect( nodeManager.get( 'foo' ) ).to.equal( FooNode2 );
		} );

		it( 'should unregister a node constructor', function() {
			nodeManager.register( FooNode );

			expect( nodeManager.list() ).to.deep.equal( [ 'foo' ] );

			nodeManager.unregister( 'foo' );

			expect( nodeManager.list() ).to.have.length( 0 );

			nodeManager.register( FooNode );
			nodeManager.unregister( 'unknown' );

			expect( nodeManager.get( 'foo' ) ).to.equal( FooNode );
		} );

		it( 'should respect priorities when registering nodes', function() {
			nodeManager.register( FooNode );
			nodeManager.register( BarNode, 5 );
			nodeManager.register( BazNode, 0 );

			expect( nodeManager.list() ).to.deep.equal( [ 'baz', 'bar', 'foo' ] );
		} );

		it( 'should return a node matching the given type', function() {
			nodeManager.register( BarNode );
			nodeManager.register( BazNode );

			expect( nodeManager.get( 'bar' ) ).to.equal( BarNode );
			expect( nodeManager.get( 'unknown' ) ).to.be.undefined();
		} );

		it( 'should list all registered nodes sorted by their priorities', function() {
			nodeManager.register( FooNode );
			nodeManager.register( BarNode, 5 );
			nodeManager.register( BazNode, 0 );

			expect( nodeManager.get() ).to.deep.equal( [ BazNode, BarNode, FooNode ] );
		} );

		it( 'should list registered node types', function() {
			nodeManager.register( FooNode );
			nodeManager.register( BarNode, 5 );
			nodeManager.register( BazNode, 0 );

			expect( nodeManager.list() ).to.deep.equal( [ 'baz', 'bar', 'foo' ] );
		} );

		it( 'should create an instance of a node', function() {
			nodeManager.register( FooNode );
			var data = {
				type: 'foo',
				data: {
					a: 1
				}
			};

			var result = nodeManager.create( data );

			expect( result ).to.be.instanceof( FooNode );
			expect( result.data ).to.equal( data );

			result = nodeManager.create( 'foo' );

			expect( result ).to.be.instanceof( FooNode );
			expect( result.data ).to.equal( 'foo' );

			result = nodeManager.create( 'unknown' );
			expect( result ).to.be.null();
		} );
	} );
} );