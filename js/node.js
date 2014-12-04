'use strict';

function Node() {
	this.document = null;
}

// static props
Node.type = null;
Node.tags = [];

// static methods
Node.toData = function( dom ) {
	return {
		insert: 1,
		attributes: {
			type: this.type
		}
	};
};

Node.toDom = function( data, doc ) {
	var tags = this.tags;

	if ( tags.length === 1 ) {
		return doc.createElement( tags[ 0 ] );
	}

	throw new Error( 'Overrid toDom in a subclass' );
};

// prototype
Node.prototype = {
	// TODO
};

module.exports = Node;