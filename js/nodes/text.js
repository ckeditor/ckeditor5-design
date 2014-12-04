'use strict';

var Node = require( '../node' ),
	utils = require( '../utils' );

function TextNode() {
	Node.apply( this, arguments );
}

utils.extend( TextNode, Node, {
	type: 'text',

	toData: function( dom ) {
		return {
			insert: dom.textContent
		};
	},

	toDom: function( data, doc ) {
		return doc.createTextNode( data.insert );
	}
} );

utils.inherit( TextNode, Node );

module.exports = TextNode;