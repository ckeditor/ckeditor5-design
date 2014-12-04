'use strict';

var Node = require( '../node' ),
	utils = require( '../utils' );

function ImageNode() {
	Node.apply( this, arguments );
}

utils.extend( ImageNode, Node, {
	type: 'image',
	tags: [ 'img' ],
	isEmpty: true,

	toData: function( dom ) {
		return {
			insert: 1,
			attributes: {
				type: this.type,
				src: dom.src
			}
		};
	},

	toDom: function( data, doc ) {
		var dom = doc.createElement( 'img' );

		dom.src = data.attributes.src;

		return dom;
	}
} );

utils.inherit( ImageNode, Node );

module.exports = ImageNode;