'use strict';

var Branch = require( '../branch' ),
	utils = require( '../utils' );

function HeadingNode() {
	Branch.apply( this, arguments );
}

utils.extend( HeadingNode, Branch, {
	type: 'heading',
	tags: [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ],

	toOperation: function( dom ) {
		return {
			insert: 1,
			attributes: {
				type: this.type,
				level: dom.nodeName.toLowerCase().replace( 'h', '' )
			}
		};
	},

	toDom: function( operation, doc ) {
		return doc.createElement( 'h' + operation.attributes.level );
	}
} );

utils.inherit( HeadingNode, Branch );

module.exports = HeadingNode;