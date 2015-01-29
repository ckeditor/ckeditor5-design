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

	function LinkNode() {
		InlineNode.apply( this, arguments );
	}

	// inherit statics
	utils.extend( LinkNode, InlineNode, {
		attributes: [ 'href', 'target' ],
		tags: [ 'a' ],
		type: 'link'
	} );

	// inherit prototype
	utils.inherit( LinkNode, InlineNode );

	nodeManager.register( LinkNode );

	return LinkNode;
} );