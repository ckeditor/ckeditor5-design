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
		isEmpty: true,
		tags: [ 'br' ],
		type: 'break'
	} );

	utils.inherit( BreakNode, Node );

	nodeManager.register( BreakNode );

	return BreakNode;
} );