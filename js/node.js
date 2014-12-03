'use strict';

function Node() {}

// override in a subclass
Node.type = null;
Node.matchTags = [];

Node.prototype = {
	toData: function() {
		return {
			insert: 1,
			attributes: {
				type: this.constructor.type
			}
		};
	},

	toDom: function( data, doc ) {
		var tags = this.constructor.matchTags;

		if ( tags.length === 1 ) {
			return doc.createElement( tags[ 0 ] );
		}

		throw new Error( 'Overrid toDom in a subclass' );
	}
};

module.exports = Node;