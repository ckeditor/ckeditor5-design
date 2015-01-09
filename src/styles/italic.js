'use strict';

var StyledNode = require( './styled-node' ),
	utils = require( '../utils' );

function ItalicStyle() {
	StyledNode.apply( this, arguments );
}

utils.extend( ItalicStyle, StyledNode, {
	type: 'italic',
	tags: [ 'em', 'i' ]
} );

utils.inherit( ItalicStyle, StyledNode );

module.exports = ItalicStyle;