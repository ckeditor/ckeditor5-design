'use strict';

var Node = require( '../node' ),
	utils = require( '../utils' );

function FormattedNode() {
	Node.apply( this, arguments );
}

// inherit statics
utils.extend( FormattedNode, Node, {
	toData: function( dom ) {
		var attributes = {};

		attributes[ this.type ] = true;
		attributes[ this.type + 'Tag' ] = dom.nodeName.toLowerCase();

		return attributes;
	},

	toDom: function( data, doc ) {
		return doc.createElement( data.attributes.tag || this.tags[ 0 ] );
	}
} );

// inherit prototype
utils.inherit( FormattedNode, Node );

utils.extend( FormattedNode.prototype, {
	// TODO
} );

module.exports = FormattedNode;