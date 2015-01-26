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

	function HeadingNode() {
		Branch.apply( this, arguments );
	}

	utils.extend( HeadingNode, Branch, {
		type: 'heading',
		tags: [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ],

		toOperation: function( dom ) {
			return [ 1, {
				type: this.type,
				level: dom.nodeName.toLowerCase().replace( 'h', '' )
			} ];
		},

		toDom: function( operation, doc ) {
			return doc.createElement( 'h' + operation[ 1 ].level );
		}
	} );

	utils.inherit( HeadingNode, Branch );

	nodeManager.register( HeadingNode );

	return HeadingNode;
} );