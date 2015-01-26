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

	function ItalicStyle() {
		StyledNode.apply( this, arguments );
	}

	utils.extend( ItalicStyle, StyledNode, {
		type: 'italic',
		tags: [ 'em', 'i' ]
	} );

	utils.inherit( ItalicStyle, StyledNode );

	nodeManager.register( ItalicStyle );

	return ItalicStyle;
} );