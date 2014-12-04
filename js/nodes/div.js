'use strict';

var Branch = require( '../branch' ),
	utils = require( '../utils' );

function DivNode() {
	Branch.apply( this, arguments );
}

utils.extend( DivNode, Branch, {
	type: 'div',
	tags: [ 'div' ]
} );

utils.inherit( DivNode, Branch );

module.exports = DivNode;