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

	function ListItemNode() {
		Branch.apply( this, arguments );
	}

	utils.extend( ListItemNode, Branch, {
		tags: [ 'li' ],
		type: 'listItem'
	} );

	utils.inherit( ListItemNode, Branch );

	nodeManager.register( ListItemNode );

	return ListItemNode;
} );