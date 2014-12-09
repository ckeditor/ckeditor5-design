'use strict';

var Node = require( '../node' ),
	utils = require( '../utils' );

function StyledNode() {
	Node.apply( this, arguments );
}

// inherit statics
utils.extend( StyledNode, Node, {
	toOperation: function( dom ) {
		var attributes = {};

		attributes[ this.type ] = true;

		// save additional attributes
		utils.extend( attributes, this.pickAttributes( dom, this.attributes ) );

		return attributes;
	},

	toDom: function( operation, doc ) {
		var dom = doc.createElement( this.tags[ 0 ] ),
			attributes = utils.pick( operation, this.attributes );

		// apply additional attributes
		Object.keys( attributes ).forEach( function( name ) {
			dom.setAttribute( name, attributes[ name ] );
		} );

		return dom;
	}
} );

// inherit prototype
utils.inherit( StyledNode, Node );

utils.extend( StyledNode.prototype, {
	// TODO
} );

module.exports = StyledNode;