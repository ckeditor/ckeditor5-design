define( [
	'node',
	'tools/utils'
], function(
	Node,
	utils
) {
	'use strict';

	function TextNode() {
		Node.apply( this, arguments );
	}

	utils.extend( TextNode, Node, {
		isContent: true,

		type: 'text',

		toOperation: function( dom ) {
			return {
				insert: dom.textContent
			};
		},

		toDom: function( operation, doc ) {
			return doc.createTextNode( operation.insert );
		}
	} );

	utils.inherit( TextNode, Node );

	return TextNode;
} );