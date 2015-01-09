'use strict';

var Branch = require( '../branch' ),
	utils = require( '../utils' );

function ParagraphNode() {
	Branch.apply( this, arguments );
}

utils.extend( ParagraphNode, Branch, {
	type: 'paragraph',
	tags: [ 'p' ]
} );

utils.inherit( ParagraphNode, Branch );

module.exports = ParagraphNode;