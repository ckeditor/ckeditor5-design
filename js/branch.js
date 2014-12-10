'use strict';

var Node = require( './node' ),
	utils = require( './utils' );

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
		child.parent = this;
	},

	prepend: function( child ) {
		this.children.unshift( child );
		child.parent = this;
	},

	getChildren: function() {
		return this.children;
	},

	hasChildren: function() {
		return !!this.children.length;
	}
} );

module.exports = Branch;