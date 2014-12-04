'use strict';

var Node = require( '../node' ),
	utils = require( '../utils' );

function HeadingNode() {
	Node.apply( this, arguments );
}

utils.extend( HeadingNode, Node, {
	type: 'heading',
	tags: [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ],

	toData: function( dom ) {
		return {
			insert: 1,
			attributes: {
				type: this.type,
				level: dom.nodeName.toLowerCase().replace( 'h', '' )
			}
		};
	},

	toDom: function( data, doc ) {
		return doc.createElement( 'h' + data.attributes.level );
	}
} );

utils.inherit( HeadingNode, Node );

module.exports = HeadingNode;