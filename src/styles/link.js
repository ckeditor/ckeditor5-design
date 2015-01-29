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

	function Link() {
		StyledNode.apply( this, arguments );
	}

	// inherit statics
	utils.extend( Link, StyledNode, {
		type: 'link',
		tags: [ 'a' ],
		attributes: [ 'href', 'target' ]
	} );

	// inherit prototype
	utils.inherit( Link, StyledNode );

	nodeManager.register( Link );

	return Link;
} );