define( [
	'branch',
	'store',
	'tools/utils'
], function(
	Branch,
	store,
	utils
) {
	'use strict';

	function ContentBranch() {
		Branch.apply( this, arguments );
	}

	// inherit statics
	utils.extend( ContentBranch, Branch, {
		hasContent: true
	} );
	// inherit prototype
	utils.inherit( ContentBranch, Branch );

	utils.extend( ContentBranch.prototype, {
		renderContent: function( doc ) {
			var container = this.constructor.toDom( this.data, doc );

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