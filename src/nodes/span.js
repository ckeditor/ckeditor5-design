define( [
	'branch',
	'tools/utils'
], function(
	Branch,
	utils
) {
	'use strict';

	function SpanNode() {
		Branch.apply( this, arguments );
	}

	utils.extend( SpanNode, Branch, {
		type: 'span',
		tags: [ 'span' ]
	} );

	utils.inherit( SpanNode, Branch );

	return SpanNode;
} );