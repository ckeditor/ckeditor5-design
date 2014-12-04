'use strict';

var FormattedNode = require( './formatted-node' ),
	utils = require( '../utils' );

function ItalicFormat() {
	FormattedNode.apply( this, arguments );
}

utils.extend( ItalicFormat, FormattedNode, {
	type: 'italic',
	tags: [ 'em', 'i' ]
} );

utils.inherit( ItalicFormat, FormattedNode );

module.exports = ItalicFormat;