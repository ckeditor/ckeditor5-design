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
			var doc = this.document,
				that = this;

			if ( !this.isRendered ) {
				return;
			}

			// console.log( 'update branch view', this, index, removed, added );
			var len, i;

			// get rid of views for removed children
			for ( i = 0, len = removed.length; i < len; i++ ) {
				var child = removed[ i ];

				if ( child.view ) {
					child.view.remove();
					// TODO remove child views
					doc.editable.removeView( child.view.vid );
				}
			}

			var leftAnchor, rightAnchor, sibling;

			// get the nearest anchor
			if ( index ) {
				leftAnchor = findAnchor( index, -1 );
			}

			rightAnchor = findAnchor( index, 1 );

			// console.log( 'la', leftAnchor );
			// console.log( 'ra', rightAnchor );
			if ( removed.length ) {
				// remove all elements between the left and right anchors
				if ( leftAnchor && rightAnchor ) {
					// console.log( 'remove elements between left and right anchors' );
					var rightElem = rightAnchor.view.getElement();

					while (
						( sibling = leftAnchor.view.nextSibling ) &&
						sibling !== rightElem
					) {
						sibling.parentElement.removeChild( sibling );
					}
					// remove all elements after the left anchor
				} else if ( leftAnchor ) {
					// console.log( 'remove elements after the left anchor' );
					while ( ( sibling = leftAnchor.view.nextSibling ) ) {
						sibling.parentElement.removeChild( sibling );
					}
					// remove all elements before the right anchor
				} else if ( rightAnchor ) {
					// console.log( 'remove elements before the right anchor' );
					while ( ( sibling = rightAnchor.view.previousSibling ) ) {
						sibling.parentElement.removeChild( sibling );
					}
					// remove all children
				} else {
					// console.log( 'remove all child elements' );
					this.view.html( '' );
				}
			}

			var views, jLen, j;

			// insert new child views
			if ( index && ( leftAnchor || rightAnchor ) ) {
				// we have a child view on the left which we can refer to
				if ( leftAnchor ) {
					for ( i = added.length - 1; i >= 0; i-- ) {
						views = getChildViews( added[ i ] );

						for ( j = views.length - 1; j >= 0; j-- ) {
							leftAnchor.view.insertAfter( views[ j ] );
						}
					}
					// we have a child view on the right which we can refer to
				} else if ( rightAnchor ) {
					for ( i = 0, len = added.length; i < len; i++ ) {
						views = getChildViews( added[ i ] );

						for ( j = 0, jLen = views.length; j < jLen; j++ ) {
							rightAnchor.view.insertBefore( views[ j ] );
						}
					}
				}
				// index === 0 or no anchors found so just prepend all children (reverse order)
			} else {
				for ( i = added.length - 1; i >= 0; i-- ) {
					views = getChildViews( added[ i ] );

					for ( j = views.length - 1; j >= 0; j-- ) {
						var view = views[ j ];
						this.view.prepend( view );
					}
				}
			}

			// TODO find an anchor, where we should put new nodes
			function findAnchor( index, dir ) {
				var i = index + ( dir < 0 ? dir : 0 ),
					len = that.childLength,
					toAdd = [],
					anchor;

				function readd() {
					if ( removed.length ) {
						if ( dir > 0 ) {
							added = added.concat( toAdd );
						} else {
							added = toAdd.concat( added );
						}
					}
				}

				while (
					( anchor = that.childAt( i ) ) &&
					( ( dir < 0 && i >= 0 ) || ( dir > 0 && i < len ) )
				) {
					// we've found an anchor
					if ( anchor.view && !anchor.view.detached ) {
						readd();
						return anchor;
					}

					// mark a child to be re-added
					if ( added.indexOf( anchor ) == -1 ) {
						toAdd[ dir > 0 ? 'push' : 'unshift' ]( anchor );
					}

					i += dir;
				}

				readd();

				return null;
			}

			// collect views for a given child node
			function getChildViews( child ) {
				var views = [];

				// child has a wrapping element
				if ( child.isWrapped ) {
					if ( !child.view ) {
						child.render();
					}

					views = [ child.view ];
					// build views for unwrapped nodes, such as textNode
				} else {
					var data = doc.getNodeData( child );
					// build child element(s)
					views = child.constructor.toDom( data, document, doc.store );
				}

				if ( !utils.isArray( views ) ) {
					views = [ views ];
				}

				return views;
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