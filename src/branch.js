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

		this.children = Array.isArray( children ) ? children : [];

		this.children.forEach( function( child ) {
			child.parent = this;
		}, this );
	}


	// inherit statics
	utils.extend( Branch, Node );
	// inherit prototype
	utils.inherit( Branch, Node );

	utils.extend( Branch.prototype, {
		append: function( child ) {
			this.children.push( child );
			child.setParent( this );
			child.setRoot( this.root );
		},

		prepend: function( child ) {
			this.children.unshift( child );
			child.setParent( this );
			child.setRoot( this.root );
		},

		getChildren: function() {
			return this.children;
		},

		hasChildren: function() {
			return !!this.children.length;
		}
	} );

	return Branch;
} );