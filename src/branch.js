define( [
	'node',
	'tools/utils'
], function(
	Node,
	utils
) {
	'use strict';

	function Branch( op, children ) {
		Node.apply( this, arguments );

		this.children = [];

		if ( utils.isArray( children ) ) {
			this.spliceArray( 0, 0, children );
		}

		this.on( 'update', this.handleUpdate );
	}

	// inherit statics
	utils.extend( Branch, Node );
	// inherit prototype
	utils.inherit( Branch, Node );

	Object.defineProperty( Branch.prototype, 'childLength', {
		get: function() {
			return this.children.length;
		}
	} );

	Object.defineProperty( Branch.prototype, 'hasChildren', {
		get: function() {
			return !!this.children.length;
		}
	} );

	utils.extend( Branch.prototype, {
		childAt: function( index ) {
			return this.children[ index ] || null;
		},

		handleUpdate: function( index, removed, added ) {
			var child,
				len,
				i;

			if ( !this.isRendered ) {
				return;
			}

			// get rid of views for removed children
			for ( i = 0, len = removed.length; i < len; i++ ) {
				child = removed[ i ];

				if ( child.view ) {
					child.view.remove();
				}
			}

			var childBeforeIndex = this.childAt( index - 1 ),
				viewBeforeIndex = childBeforeIndex && childBeforeIndex.view;

			for ( i = added.length - 1; i >= 0; i-- ) {
				child = added[ i ];

				var views = [];

				if ( child.isWrapped ) {
					if ( !child.view ) {
						child.render();
					}

					views = [ child.view ];
					// build views for unwrapped nodes, such as textNode
				} else {
					var data = this.document.getNodeData( child );
					// build child element(s)
					views = child.constructor.toDom( data, document, this.document.store );
				}

				if ( !utils.isArray( views ) ) {
					views = [ views ];
				}

				for ( var j = views.length - 1; j >= 0; j-- ) {
					var view = views[ j ];

					if ( index ) {
						viewBeforeIndex.insertAfter( view );
					} else {
						this.view.prepend( view );
					}
				}
			}
		},

		indexOf: function( node ) {
			return this.children.indexOf( node );
		},

		// we reuse splice in pop, push, shift and unshift methods so we don't have to recalculate the length,
		// trigger updates or update children's parents each time
		pop: function() {
			if ( this.children.length ) {
				return this.splice( this.children.length - 1, 1 );
			}
		},

		push: function( child ) {
			this.splice( this.children.length - 1, 0, child );

			return this.children.length;
		},

		// render the branch and all its descendants
		render: function() {
			if ( this.isWrapped ) {
				if ( !this.isRendered ) {
					Node.prototype.render.call( this );
				}

				if ( this.children ) {
					this.trigger( 'update', 0, [], this.children );
				}
			}
		},

		shift: function() {
			if ( this.children.length ) {
				return this.splice( 0, 1 );
			}
		},

		splice: function() {
			var removed = this.children.splice.apply( this.children, arguments ),
				added = [].slice.call( arguments, 2 ),
				index = arguments[ 0 ],
				removedLength = 0,
				addedLength = 0;

			// calculate the overall length of removed items and clear the item's parent
			removed.forEach( function( node ) {
				removedLength += node.length;
				node.detach();
			} );

			// calculate the overall length of added items and attach new children
			if ( arguments.length > 2 ) {
				added.forEach( function( node ) {
					addedLength += node.length;
					node.attachTo( this );
				}, this );
			}

			// update the length
			this.adjustLength( addedLength - removedLength );

			this.trigger( 'update', index, removed, added );

			return removed;
		},

		// an alias to the splice method that accepts an array of new items
		spliceArray: function( index, remove, items ) {
			return this.splice.apply( this, [ index, remove ].concat( items ) );
		},

		unshift: function( child ) {
			this.splice( 0, 0, child );

			return this.children.length;
		}
	} );

	return Branch;
} );