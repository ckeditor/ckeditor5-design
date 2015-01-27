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

		toOperation: function( dom, parentStyle ) {
			var text = dom.textContent;

			return text.split( '' ).map( function( char ) {
				var op = [ char ];

				if ( parentStyle ) {
					op[ 1 ] = parentStyle;
				}

				return op;
			} );
		},

		// TODO
		toDom: function( operation, doc ) {
			return doc.createTextNode( operation[ 0 ] );
		}
	} );

	utils.inherit( TextNode, Node );

	nodeManager.register( TextNode );

	return TextNode;
} );