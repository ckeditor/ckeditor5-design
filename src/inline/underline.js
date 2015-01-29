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
		type: 'underline',
		tags: [ 'u' ]
	} );

	utils.inherit( UnderlineNode, InlineNode );

	nodeManager.register( UnderlineNode );

	return UnderlineNode;
} );