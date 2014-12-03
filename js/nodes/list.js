'use strict';

var Branch = require( '../branch' ),
	utils = require( '../utils' );

function ListNode() {
	Branch.apply( this, arguments );
}

utils.inherit( ListNode, Branch );

ListNode.type = 'list';
ListNode.matchTags = [ 'ul', 'ol' ];

utils.extend( ListNode.prototype, {
	toData: function( dom ) {
		return {
			insert: 1,
			attributes: {
				type: ListNode.type,
				style: dom.nodeName.toLowerCase() == 'ol' ? 'number' : 'bullet'
			}
		};
	},

	toDom: function( data, doc ) {
		return doc.createElement( data.attributes.style === 'number' ? 'ol' : 'ul' );
	}
} );

module.exports = ListNode;