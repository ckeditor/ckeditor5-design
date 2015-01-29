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
		type: 'root',
		isWrapped: false
	} );

	utils.inherit( RootNode, Branch );

	nodeManager.register( RootNode );

	return RootNode;
} );