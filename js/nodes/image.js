'use strict';

var Node = require( '../node' ),
	utils = require( '../utils' );

function ImageNode() {
	Node.apply( this, arguments );
}

utils.inherit( ImageNode, Node );

ImageNode.type = 'image';
ImageNode.matchTags = [ 'img' ];
ImageNode.isEmpty = true;

utils.extend( ImageNode.prototype, {
	toData: function( dom ) {
		return {
			insert: 1,
			attributes: {
				type: ImageNode.type,
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

module.exports = ImageNode;