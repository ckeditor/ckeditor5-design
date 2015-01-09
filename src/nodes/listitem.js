'use strict';

var Branch = require( '../branch' ),
	utils = require( '../utils' );

function ListItemNode() {
	Branch.apply( this, arguments );
}

utils.extend( ListItemNode, Branch, {
	type: 'listItem',
	tags: [ 'li' ]
} );

utils.inherit( ListItemNode, Branch );

module.exports = ListItemNode;