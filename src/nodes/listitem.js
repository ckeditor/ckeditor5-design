define( [
	'branch',
	'tools/utils'
], function(
	Branch,
	utils
) {
	'use strict';

	function ListItemNode() {
		Branch.apply( this, arguments );
	}

	utils.extend( ListItemNode, Branch, {
		type: 'listItem',
		tags: [ 'li' ]
	} );

	utils.inherit( ListItemNode, Branch );

	return ListItemNode;
} );