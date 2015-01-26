define( [
	'node',
	'nodemanager',
	'tools/utils'
], function(
	Node,
	nodeManager,
	utils
) {
	'use strict';

	function BreakNode() {
		Node.apply( this, arguments );
	}

	utils.extend( BreakNode, Node, {
		type: 'break',
		tags: [ 'br' ],
		isEmpty: true
	} );

	utils.inherit( BreakNode, Node );

	nodeManager.register( BreakNode );

	return BreakNode;
} );