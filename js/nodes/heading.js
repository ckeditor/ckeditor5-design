'use strict';

var Node = require( '../node' ),
	utils = require( '../utils' );

function HeadingNode() {
	Node.apply( this, arguments );
}

utils.inherit( HeadingNode, Node );

HeadingNode.type = 'heading';
HeadingNode.matchTags = [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ];

utils.extend( HeadingNode.prototype, {
	toData: function( dom ) {
		return {
			insert: 1,
			attributes: {
				type: HeadingNode.type,
				level: dom.nodeName.toLowerCase().replace( 'h', '' )
			}
		};
	},

	toDom: function( data, doc ) {
		return doc.createElement( 'h' + data.attributes.level );
	}
} );

module.exports = HeadingNode;