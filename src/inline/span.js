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

	function SpanNode() {
		InlineNode.apply( this, arguments );
	}

	utils.extend( SpanNode, InlineNode, {
		type: 'span',
		tags: [ 'span' ]
	} );

	utils.inherit( SpanNode, InlineNode );

	nodeManager.register( SpanNode );

	return SpanNode;
} );