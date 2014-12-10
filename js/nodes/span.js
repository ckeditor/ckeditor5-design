'use strict';

var Branch = require( '../branch' ),
	utils = require( '../utils' );

function SpanNode() {
	Branch.apply( this, arguments );
}

utils.extend( SpanNode, Branch, {
	type: 'span',
	tags: [ 'span' ]
} );

utils.inherit( SpanNode, Branch );

module.exports = SpanNode;