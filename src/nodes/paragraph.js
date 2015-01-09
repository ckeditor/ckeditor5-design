define( [
	'branch',
	'tools/utils'
], function(
	Branch,
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

	return ParagraphNode;
} );