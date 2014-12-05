'use strict';

var utils = require( './utils' );

function Node() {
	this.document = null;
}

// static props
Node.type = null;
Node.tags = [];
Node.attributes = [];

// static methods
Node.pickAttributes = function( dom, attributes ) {
	var result = {};

	attributes.forEach( function( attribute ) {
		result[ attribute ] = dom.getAttribute( attribute );
	} );

	return result;
};

Node.toData = function( dom ) {
	var attributes = utils.extend( {
		type: this.type
	}, this.pickAttributes( dom, this.attributes ) );

	return {
		insert: 1,
		attributes: attributes
	};
};

Node.toDom = function( data, doc ) {
	var tags = this.tags;

	if ( tags.length === 1 ) {
		var dom = doc.createElement( tags[ 0 ] ),
			attributes = utils.pick( data, this.attributes );

		Object.keys( attributes ).forEach( function( name ) {
			dom.setAttribute( name, attributes[ name ] );
		} );

		return dom;
	}

	throw new Error( 'Overrid toDom in a subclass' );
};

// prototype
Node.prototype = {
	// TODO
};

module.exports = Node;