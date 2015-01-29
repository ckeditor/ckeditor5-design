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

	function RootNode() {
		Branch.apply( this, arguments );

		this.root = this;
	}

	utils.extend( RootNode, Branch, {
		isWrapped: false,
		type: 'root'
	} );

	utils.inherit( RootNode, Branch );

	nodeManager.register( RootNode );

	return RootNode;
} );