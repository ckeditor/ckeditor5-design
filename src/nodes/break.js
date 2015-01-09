define( [
	'node',
	'tools/utils'
], function(
	Node,
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

	return BreakNode;
} );