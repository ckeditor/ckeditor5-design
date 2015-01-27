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

		toOperation: function( dom ) {
			return {
				type: this.type,
				attributes: {
					style: dom.nodeName.toLowerCase() == 'ol' ? 'number' : 'bullet'
				}
			};
		},

		toDom: function( operation, doc ) {
			return doc.createElement( operation.attributes.style === 'number' ? 'ol' : 'ul' );
		}
	} );

	utils.inherit( ListNode, Branch );

	nodeManager.register( ListNode );

	return ListNode;
} );