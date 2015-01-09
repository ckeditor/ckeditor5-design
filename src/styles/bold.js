define( [
	'styles/styled-node',
	'tools/utils'
], function(
	StyledNode,
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

	return BoldStyle;
} );