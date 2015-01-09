'use strict';

var Branch = require( '../branch' ),
	utils = require( '../utils' );

function UnknownNode() {
	Branch.apply( this, arguments );
}

utils.extend( UnknownNode, Branch, {
	type: 'unknown'
} );

utils.inherit( UnknownNode, Branch );

module.exports = UnknownNode;