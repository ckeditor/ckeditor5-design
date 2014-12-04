'use strict';

var Node = require( '../node' ),
	utils = require( '../utils' );

function UnknownNode() {
	Node.apply( this, arguments );
}

utils.extend( UnknownNode, Node, {
	type: 'unknown'
} );

utils.inherit( UnknownNode, Node );

module.exports = UnknownNode;