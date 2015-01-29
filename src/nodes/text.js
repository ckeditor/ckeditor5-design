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

	function TextNode() {
		Node.apply( this, arguments );
	}

	utils.extend( TextNode, Node, {
		isWrapped: false,
		type: 'text',

		toData: function( dom ) {
			var text = dom.textContent;

			return text.split( '' );
		},

		// TODO
		toDom: function( data, doc ) {
			return doc.createTextNode( data[ 0 ] );
		}
	} );

	utils.inherit( TextNode, Node );

	nodeManager.register( TextNode );

	return TextNode;
} );