define( [
	'styles/styled-node',
	'tools/utils'
], function(
	StyledNode,
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

	return ItalicStyle;
} );