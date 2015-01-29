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
		type: 'link',
		tags: [ 'a' ],
		attributes: [ 'href', 'target' ]
	} );

	// inherit prototype
	utils.inherit( LinkNode, InlineNode );

	nodeManager.register( LinkNode );

	return LinkNode;
} );