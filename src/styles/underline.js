define( [
	'styles/styled-node',
	'tools/utils'
], function(
	StyledNode,
	utils
) {
	'use strict';

	function UnderlineStyle() {
		StyledNode.apply( this, arguments );
	}

	utils.extend( UnderlineStyle, StyledNode, {
		type: 'underline',
		tags: [ 'u' ]
	} );

	utils.inherit( UnderlineStyle, StyledNode );

	return UnderlineStyle;
} );