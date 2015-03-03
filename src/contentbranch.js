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
		handleUpdate: function() {
			if ( this.isRendered ) {
				this.renderContent();
			}
		},

		renderContent: function() {
			this.view.html( '' );
			this.children.forEach( function( child ) {
				// retrieve child node's data from the linear data
				var data = this.document.getNodeData( child );
				// build child element(s)
				var childElem;

				// render wrapped children within content branches
				if ( child.isWrapped ) {
					if ( !child.isRendered ) {
						child.render();
					}

					childElem = child.view;
				} else {
					childElem = child.constructor.toDom( data, document, this.document.store );
				}

				if ( !utils.isArray( childElem ) ) {
					childElem = [ childElem ];
				}

				childElem.forEach( function( elem ) {
					this.view.append( elem );
				}, this );
			}, this );
		}
	} );

	return ContentBranch;
} );