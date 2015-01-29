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

	function ItalicNode() {
		InlineNode.apply( this, arguments );
	}

	utils.extend( ItalicNode, InlineNode, {
		tags: [ 'em', 'i' ],
		type: 'italic'
	} );

	utils.inherit( ItalicNode, InlineNode );

	nodeManager.register( ItalicNode );

	return ItalicNode;
} );