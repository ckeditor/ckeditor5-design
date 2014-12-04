'use strict';

var FormattedNode = require( './formatted-node' ),
	utils = require( '../utils' );

function UnderlineFormat() {
	FormattedNode.apply( this, arguments );
}

utils.extend( UnderlineFormat, FormattedNode, {
	type: 'underline',
	tags: [ 'u' ]
} );

utils.inherit( UnderlineFormat, FormattedNode );

module.exports = UnderlineFormat;