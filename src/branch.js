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

		indexOf: function( node ) {
			return this.children.indexOf( node );
		},

		// we use splice in following methods so we don't have to recalculate the length each time,
		// nor update child's parent
		pop: function() {
			if ( this.children.length ) {
				return this.splice( this.children.length - 1, 1 );
			}
		},

		push: function( child ) {
			this.splice( this.children.length - 1, 0, child );

			return this.children.length;
		},

		shift: function() {
			if ( this.children.length ) {
				return this.splice( 0, 1 );
			}
		},

		splice: function() {
			var removed = this.children.splice.apply( this.children, arguments ),
				removedLength = 0,
				addedLength = 0;

			// calculate the overal length of removed items and clear the item's parent
			removed.forEach( function( node ) {
				removedLength += node.length;
				node.detach();
			} );

			// calculate the overal length of added items and set the item's parent
			if ( arguments.length > 2 ) {
				[].slice.call( arguments, 2 ).forEach( function( node ) {
					addedLength += node.length;
					node.attachTo( this );
				}, this );
			}

			// update the length
			this.adjustLength( addedLength - removedLength );

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