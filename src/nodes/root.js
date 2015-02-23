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

	nodeManager.register( RootNode );

	return RootNode;
} );