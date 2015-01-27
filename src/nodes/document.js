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

	function DocumentNode() {
		Branch.apply( this, arguments );

		this.root = this;
	}

	utils.extend( DocumentNode, Branch, {
		type: 'document'
	} );

	utils.inherit( DocumentNode, Branch );

	nodeManager.register( DocumentNode );

	return DocumentNode;
} );