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
		attributes: [ 'src', 'alt', 'width', 'height', 'title' ],
		isEmpty: true,
		tags: [ 'img' ],
		type: 'image'
	} );

	utils.inherit( ImageNode, Node );

	nodeManager.register( ImageNode );

	return ImageNode;
} );