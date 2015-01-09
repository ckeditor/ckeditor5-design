'use strict';

var StyledNode = require( './styled-node' ),
	utils = require( '../utils' );

function BoldStyle() {
	StyledNode.apply( this, arguments );
}

// inherit statics
utils.extend( BoldStyle, StyledNode, {
	type: 'bold',
	tags: [ 'strong', 'b' ]
} );

// inherit prototype
utils.inherit( BoldStyle, StyledNode );

module.exports = BoldStyle;