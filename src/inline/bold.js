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

	function BoldNode() {
		InlineNode.apply( this, arguments );
	}

	// inherit statics
	utils.extend( BoldNode, InlineNode, {
		tags: [ 'strong', 'b' ],
		type: 'bold'
	} );

	// inherit prototype
	utils.inherit( BoldNode, InlineNode );

	nodeManager.register( BoldNode );

	return BoldNode;
} );