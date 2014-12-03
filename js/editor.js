'use strict';

var Converter = require( './converter' ),
	NodeManager = require( './node-manager' ),
	EventEmitter = require( 'events' ).EventEmitter,
	utils = require( './utils' );

function Editor( selector ) {
	EventEmitter.apply( this, arguments );

	this.el = document.querySelector( selector );

	this.nodeManager = new NodeManager();
	this.nodeManager.registerNodeTypes( [
		'break', 'div', 'heading', 'image', 'list', 'listitem', 'paragraph', 'text', 'unknown'
	] );
	this.converter = new Converter();

	// TODO register nodes with nodeManager

	this.document = this.converter.getDocForDom( this.el );
}

utils.inherit( Editor, EventEmitter );

utils.extend( Editor.prototype, {

} );

module.exports = Editor;