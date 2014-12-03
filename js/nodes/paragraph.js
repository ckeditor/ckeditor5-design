'use strict';

var Branch = require( '../branch' ),
	utils = require( '../utils' );

function ParagraphNode() {
	Branch.apply( this, arguments );
}

utils.inherit( ParagraphNode, Branch );

ParagraphNode.type = 'paragraph';
ParagraphNode.matchTags = [ 'p' ];

module.exports = ParagraphNode;