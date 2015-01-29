define( [
	'inline/inlinenode',
	'nodemanager',
	'tools/utils'
], function(
	InlineNode,
	nodeManager,
	utils
) {
	'use strict';

	function UnderlineNode() {
		InlineNode.apply( this, arguments );
	}

	utils.extend( UnderlineNode, InlineNode, {
		tags: [ 'u' ],
		type: 'underline'
	} );

	utils.inherit( UnderlineNode, InlineNode );

	nodeManager.register( UnderlineNode );

	return UnderlineNode;
} );