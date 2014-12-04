'use strict';

var Node = require( '../node' ),
	utils = require( '../utils' );

function SpanNode() {
	Node.apply( this, arguments );
}

utils.extend( SpanNode, Node, {
	type: 'span',
	tags: [ 'span' ]
} );

utils.inherit( SpanNode, Node );

module.exports = SpanNode;