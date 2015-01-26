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

	function SpanNode() {
		Branch.apply( this, arguments );
	}

	utils.extend( SpanNode, Branch, {
		type: 'span',
		tags: [ 'span' ]
	} );

	utils.inherit( SpanNode, Branch );

	nodeManager.register( SpanNode );

	return SpanNode;
} );