'use strict';

var Node = require( '../node' ),
	utils = require( '../utils' );

function TextNode() {
	Node.apply( this, arguments );
}

utils.extend( TextNode, Node, {
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

module.exports = TextNode;