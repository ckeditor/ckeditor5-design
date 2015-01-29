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
		type: 'bold',
		tags: [ 'strong', 'b' ]
	} );

	// inherit prototype
	utils.inherit( BoldNode, InlineNode );

	nodeManager.register( BoldNode );

	return BoldNode;
} );