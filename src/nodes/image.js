'use strict';

var Node = require( '../node' ),
	utils = require( '../utils' );

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

module.exports = ImageNode;