define( [
	'branch',
	'nodemanager',
	'tools/utils'
], function(
	Branch,
	nodeManager,
	utils
) {
	'use strict';

	function ListNode() {
		Branch.apply( this, arguments );
	}

	utils.extend( ListNode, Branch, {
		type: 'list',
		tags: [ 'ul', 'ol' ],

		toData: function( dom ) {
			return {
				type: this.type,
				attributes: {
					style: dom.nodeName.toLowerCase() == 'ol' ? 'number' : 'bullet'
				}
			};
		},

		toDom: function( data, doc ) {
			return doc.createElement( data.attributes.style === 'number' ? 'ol' : 'ul' );
		}
	} );

	utils.inherit( ListNode, Branch );

	nodeManager.register( ListNode );

	return ListNode;
} );