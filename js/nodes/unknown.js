'use strict';

var Node = require( '../node' ),
	utils = require( '../utils' );

function UnknownNode() {
	Node.apply( this, arguments );
}

utils.inherit( UnknownNode, Node );

UnknownNode.type = 'unknown';

module.exports = UnknownNode;