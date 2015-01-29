define( [
	'branch',
	'nodemanager',
	'tools/utils'
], function(
	Branch,
	nodeManager,
	utils
) {
	'use strict';

	function ParagraphNode() {
		Branch.apply( this, arguments );
	}

	utils.extend( ParagraphNode, Branch, {
		tags: [ 'p' ],
		type: 'paragraph'
	} );

	utils.inherit( ParagraphNode, Branch );

	nodeManager.register( ParagraphNode );

	return ParagraphNode;
} );