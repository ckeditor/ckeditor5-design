define( [
	'contentbranch',
	'nodemanager',
	'tools/utils'
], function(
	ContentBranch,
	nodeManager,
	utils
) {
	'use strict';

	function ParagraphNode() {
		ContentBranch.apply( this, arguments );
	}

	utils.extend( ParagraphNode, ContentBranch, {
		tags: [ 'p' ],
		type: 'paragraph'
	} );

	utils.inherit( ParagraphNode, ContentBranch );

	nodeManager.register( ParagraphNode );

	return ParagraphNode;
} );