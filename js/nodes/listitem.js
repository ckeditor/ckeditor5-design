'use strict';

var Branch = require( '../branch' ),
	utils = require( '../utils' );

function ListItemNode() {
	Branch.apply( this, arguments );
}

utils.inherit( ListItemNode, Branch );

ListItemNode.type = 'listItem';
ListItemNode.matchTags = [ 'li' ];

module.exports = ListItemNode;