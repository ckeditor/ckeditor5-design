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

		toOperation: function( dom, parentStyle ) {
			var text = dom.textContent;

			return text.split( '' ).map( function( char ) {
				var op = {
					insert: char
				};

				if ( parentStyle ) {
					op.attributes = parentStyle;
				}

				return op;
			} );
		},

		toDom: function( operation, doc ) {
			return doc.createTextNode( operation.insert );
		}
	} );

	utils.inherit( TextNode, Node );

	return TextNode;
} );