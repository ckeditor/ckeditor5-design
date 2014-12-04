'use strict';

var Node = require( '../node' ),
	utils = require( '../utils' );

function BreakNode() {
	Node.apply( this, arguments );
}

utils.extend( BreakNode, Node, {
	type: 'break',
	tags: [ 'br' ],
	isEmpty: true
} );

utils.inherit( BreakNode, Node );

module.exports = BreakNode;