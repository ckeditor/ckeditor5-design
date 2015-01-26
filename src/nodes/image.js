define( [
	'node',
	'nodemanager',
	'tools/utils'
], function(
	Node,
	nodeManager,
	utils
) {
	'use strict';

	function ImageNode() {
		Node.apply( this, arguments );
	}

	utils.extend( ImageNode, Node, {
		type: 'image',
		tags: [ 'img' ],
		attributes: [ 'src', 'alt', 'width', 'height', 'title' ],
		isEmpty: true
	} );

	utils.inherit( ImageNode, Node );

	nodeManager.register( ImageNode );

	return ImageNode;
} );