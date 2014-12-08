'use strict';

var StyledNode = require( './styled-node' ),
	utils = require( '../utils' );

function UnderlineStyle() {
	StyledNode.apply( this, arguments );
}

utils.extend( UnderlineStyle, StyledNode, {
	type: 'underline',
	tags: [ 'u' ]
} );

utils.inherit( UnderlineStyle, StyledNode );

module.exports = UnderlineStyle;