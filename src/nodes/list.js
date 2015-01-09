'use strict';

var Branch = require( '../branch' ),
	utils = require( '../utils' );

function ListNode() {
	Branch.apply( this, arguments );
}

utils.extend( ListNode, Branch, {
	type: 'list',
	tags: [ 'ul', 'ol' ],

	toOperation: function( dom ) {
		return {
			insert: 1,
			attributes: {
				type: this.type,
				style: dom.nodeName.toLowerCase() == 'ol' ? 'number' : 'bullet'
			}
		};
	},

	toDom: function( operation, doc ) {
		return doc.createElement( operation.attributes.style === 'number' ? 'ol' : 'ul' );
	}
} );

utils.inherit( ListNode, Branch );

module.exports = ListNode;