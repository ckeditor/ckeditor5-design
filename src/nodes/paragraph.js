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
		type: 'paragraph',
		tags: [ 'p' ]
	} );

	utils.inherit( ParagraphNode, Branch );

	nodeManager.register( ParagraphNode );

	return ParagraphNode;
} );