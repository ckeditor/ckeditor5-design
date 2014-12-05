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

		// save additional attributes
		utils.extend( attributes, this.pickAttributes( dom, this.attributes ) );

		return attributes;
	},

	toDom: function( data, doc ) {
		var dom = doc.createElement( data.attributes[ this.type + 'Tag' ] || this.tags[ 0 ] ),
			attributes = utils.pick( data, this.attributes );

		// apply additional attributes
		Object.keys( attributes ).forEach( function( name ) {
			dom.setAttribute( name, attributes[ name ] );
		} );

		return dom;
	}
} );

// inherit prototype
utils.inherit( FormattedNode, Node );

utils.extend( FormattedNode.prototype, {
	// TODO
} );

module.exports = FormattedNode;