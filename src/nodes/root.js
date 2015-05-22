define( [
	'branch',
	'nodemanager',
	'tools/utils'
], function(
	Branch,
	nodeManager,
	utils
) {
	'use strict';

	// Root node is handled by the special case, see `isRoot` in converters.
	function RootNode( document ) {
		Branch.call( this );
		this.document = document;
		this.root = this;
	}

	utils.extend( RootNode, Branch, {
		tags: [ 'div' ],
		type: 'root'
	} );

	utils.inherit( RootNode, Branch );

	nodeManager.register( RootNode, 0 );

	return RootNode;
} );