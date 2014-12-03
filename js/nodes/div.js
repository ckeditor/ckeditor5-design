'use strict';

var Branch = require( '../branch' ),
	utils = require( '../utils' );

function DivNode() {
	Branch.apply( this, arguments );
}

utils.inherit( DivNode, Branch );

DivNode.type = 'div';
DivNode.matchTags = [ 'div' ];

module.exports = DivNode;