'use strict';

var Branch = require( '../branch' ),
	utils = require( '../utils' );

function ListNode() {
	Branch.apply( this, arguments );
}

utils.extend( ListNode, Branch, {
	type: 'list',
	tags: [ 'ul', 'ol' ],

	toData: function( dom ) {
		return {
			insert: 1,
			attributes: {
				type: this.type,
				style: dom.nodeName.toLowerCase() == 'ol' ? 'number' : 'bullet'
			}
		};
	},

	toDom: function( data, doc ) {
		return doc.createElement( data.attributes.style === 'number' ? 'ol' : 'ul' );
	}
} );

utils.inherit( ListNode, Branch );

module.exports = ListNode;