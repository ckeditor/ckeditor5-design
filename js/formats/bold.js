'use strict';

var FormattedNode = require( './formatted-node' ),
	utils = require( '../utils' );

function BoldFormat() {
	FormattedNode.apply( this, arguments );
}

// inherit statics
utils.extend( BoldFormat, FormattedNode, {
	type: 'bold',
	tags: [ 'strong', 'b' ]
} );

// inherit prototype
utils.inherit( BoldFormat, FormattedNode );

module.exports = BoldFormat;