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
		type: 'div',
		tags: [ 'div' ]
	} );

	utils.inherit( DivNode, Branch );

	nodeManager.register( DivNode );

	return DivNode;
} );