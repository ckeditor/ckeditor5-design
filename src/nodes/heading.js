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
		tags: [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ],
		type: 'heading',

		toData: function( dom ) {
			return {
				type: this.type,
				attributes: {
					level: dom.nodeName.toLowerCase().replace( 'h', '' )
				}
			};
		},

		toDom: function( data, doc ) {
			return doc.createElement( 'h' + data.attributes.level );
		}
	} );

	utils.inherit( HeadingNode, Branch );

	nodeManager.register( HeadingNode );

	return HeadingNode;
} );