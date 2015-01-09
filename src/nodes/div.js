define( [
	'branch',
	'tools/utils'
], function(
	Branch,
	utils
) {
	'use strict';

	function DivNode() {
		Branch.apply( this, arguments );
	}

	utils.extend( DivNode, Branch, {
		type: 'div',
		tags: [ 'div' ]
	} );

	utils.inherit( DivNode, Branch );

	return DivNode;
} );