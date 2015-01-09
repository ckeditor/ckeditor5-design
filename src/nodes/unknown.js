define( [
	'branch',
	'tools/utils'
], function(
	Branch,
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

	return UnknownNode;
} );