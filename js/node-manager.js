'use strict';

// YES, IT'S UGLY, BUT IT'S A TEMPORARY SOLUTION
var nodeTypes = {
	'break': require( './nodes/break' ),
	'div': require( './nodes/div' ),
	'heading': require( './nodes/heading' ),
	'image': require( './nodes/image' ),
	'list': require( './nodes/list' ),
	'listitem': require( './nodes/listitem' ),
	'paragraph': require( './nodes/paragraph' ),
	'text': require( './nodes/text' ),
	'unknown': require( './nodes/unknown' )
};

function NodeManager() {
	this.types = {};
}

NodeManager.prototype.registerNodeTypes = function( types ) {
	types.forEach( this.registerNodeType, this );
};

NodeManager.prototype.registerNodeType = function( type ) {
	this.types[ type.type ] = nodeTypes[ type ];
};

module.exports = NodeManager;