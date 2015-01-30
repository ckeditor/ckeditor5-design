define( [
	'branch',
	'tools/utils'
], function(
	Branch,
	utils
) {
	'use strict';

	function ContentBranch() {
		Branch.apply( this, arguments );
	}

	// inherit statics
	utils.extend( ContentBranch, Branch );
	// inherit prototype
	utils.inherit( ContentBranch, Branch );

	utils.extend( ContentBranch.prototype, {
		renderContent: function() {
			var store = this.document.store,
				doc = this.document.ownerDocument,
				container = this.constructor.toDom( this.data, doc ),
				styleStack = [];

			this.children.forEach( function( child ) {
				// retrieve child node's data from the linear data
				var data = this.document.getNodeData( child );
				// build child element(s)
				var childElem = child.constructor.toDom( data, doc, store );

				if ( !utils.isArray( childElem ) ) {
					childElem = [ childElem ];
				}

				childElem.forEach( function( elem ) {
					if ( elem ) {
						container.appendChild( elem );
					}
				} );
			}, this );

			return container;
		}
	} );

	return ContentBranch;
} );