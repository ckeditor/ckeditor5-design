'use strict';

var Converter = require( './converter' ),
	TypeManager = require( './type-manager' ),
	Normalizer = require( './normalizer' ),
	Branch = require( './branch' ),
	Delta = require( 'rich-text' ).Delta,
	utils = require( './utils' );

function Document( el ) {
	this.el = el;

	this.normalizer = new Normalizer();
	this.normalizer.normalize( this.el );

	this.typeManager = new TypeManager();
	this.typeManager.register( [
		'break', 'div', 'heading', 'image', 'list', 'listItem', 'paragraph',
		'span', 'text', 'unknown', 'bold', 'italic', 'underline'
	] );

	this.converter = new Converter( this.typeManager );

	this.ops = this.converter.getOperationsForDom( this.el );

	this.buildTree();
}

Document.prototype = {
	getCleanDom: function() {
		// convert the tree to plain DOM elements
	},

	buildTree: function() {
		var currentNode = this.root = new Branch(),
			nodeStack = [ currentNode ];

		currentNode.setDocument( this );

		this.ops.forEach( function( op ) {
			var node,
				type;

			currentNode = nodeStack[ nodeStack.length - 1 ];

			// tag
			if ( op.insert === 1 ) {
				type = op.attributes.type;

				// closing tag
				if ( type.charAt( 0 ) === '/' ) {
					type = type.substr( 1 );
					nodeStack.pop();

					// opening tag
				} else {
					// create a node
					node = this.typeManager.create( type, op );
					node.setDocument( this );
					node.setRoot( this.root );
					// push to stack
					nodeStack.push( node );
					// append to current node
					currentNode.append( node );
				}
				// styled text
			} else {
				node = this.typeManager.create( 'text', op );
				node.setDocument( this );
				node.setRoot( this.root );
				currentNode.append( node );
			}
		}, this );
	}
};

module.exports = Document;