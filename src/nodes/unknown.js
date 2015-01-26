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

	function UnknownNode() {
		Branch.apply( this, arguments );
	}

	utils.extend( UnknownNode, Branch, {
		type: 'unknown'
	} );

	utils.inherit( UnknownNode, Branch );

	nodeManager.register( UnknownNode );

	return UnknownNode;
} );