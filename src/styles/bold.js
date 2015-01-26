define( [
	'styles/styled-node',
	'nodemanager',
	'tools/utils'
], function(
	StyledNode,
	nodeManager,
	utils
) {
	'use strict';

	function BoldStyle() {
		StyledNode.apply( this, arguments );
	}

	// inherit statics
	utils.extend( BoldStyle, StyledNode, {
		type: 'bold',
		tags: [ 'strong', 'b' ]
	} );

	// inherit prototype
	utils.inherit( BoldStyle, StyledNode );

	nodeManager.register( BoldStyle );

	return BoldStyle;
} );