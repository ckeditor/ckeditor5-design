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

	function DivNode() {
		Branch.apply( this, arguments );
	}

	utils.extend( DivNode, Branch, {
		tags: [ 'div' ],
		type: 'div'
	} );

	utils.inherit( DivNode, Branch );

	nodeManager.register( DivNode );

	return DivNode;
} );