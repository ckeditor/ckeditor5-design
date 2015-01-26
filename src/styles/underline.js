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

	function UnderlineStyle() {
		StyledNode.apply( this, arguments );
	}

	utils.extend( UnderlineStyle, StyledNode, {
		type: 'underline',
		tags: [ 'u' ]
	} );

	utils.inherit( UnderlineStyle, StyledNode );

	nodeManager.register( UnderlineStyle );

	return UnderlineStyle;
} );